import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPitchYin } from '@/audio/yinPitchDetector';
import { analyzeTuning, getEmptyReading, type TunerReading } from '@/domain/tuner';
import type { Tuning } from '@/domain/tunings';

type UseGuitarTunerOptions = {
  selectedStringId: string | null;
  tuning: Tuning;
};

type PermissionState = 'idle' | 'requesting' | 'listening' | 'blocked' | 'unsupported';

export type AudioInputDevice = {
  id: string;
  label: string;
};

export function useGuitarTuner({ selectedStringId, tuning }: UseGuitarTunerOptions) {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [reading, setReading] = useState<TunerReading>(getEmptyReading);
  const [audioInputs, setAudioInputs] = useState<AudioInputDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const stableFrequencyRef = useRef<number | null>(null);
  const wasPerfectRef = useRef(false);
  const tuningRef = useRef(tuning);
  const selectedStringIdRef = useRef(selectedStringId);

  useEffect(() => {
    tuningRef.current = tuning;
    selectedStringIdRef.current = selectedStringId;
  }, [selectedStringId, tuning]);
  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    stableFrequencyRef.current = null;
    wasPerfectRef.current = false;
    setReading(getEmptyReading());
    setPermissionState((state) => (state === 'unsupported' || state === 'blocked' ? state : 'idle'));
  }, []);

  const processFrame = useCallback(() => {
    const analyser = analyserRef.current;
    const context = audioContextRef.current;

    if (!analyser || !context) {
      return;
    }

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const pitch = detectPitchYin(buffer, context.sampleRate);
    const smoothedFrequency =
      pitch && pitch.clarity > 0.62
        ? smoothFrequency(pitch.frequency, stableFrequencyRef.current)
        : null;

    stableFrequencyRef.current = smoothedFrequency;
    const nextReading = analyzeTuning(smoothedFrequency, tuningRef.current, selectedStringIdRef.current);
    setReading(nextReading);

    if (nextReading.status === 'perfect' && !wasPerfectRef.current) {
      navigator.vibrate?.(24);
    }

    wasPerfectRef.current = nextReading.status === 'perfect';
    frameRef.current = requestAnimationFrame(processFrame);
  }, []);

  const refreshAudioInputs = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioInputs(
      devices
        .filter((device) => device.kind === 'audioinput')
        .map((device, index) => ({
          id: device.deviceId,
          label: device.label || `Microphone ${index + 1}`,
        })),
    );
  }, []);

  const start = useCallback(async (inputId = selectedInputId) => {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setPermissionState('unsupported');
      return;
    }

    stop();
    setPermissionState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          channelCount: 1,
          deviceId: inputId ? { exact: inputId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });
      const context = new AudioContext({ latencyHint: 'interactive' });
      const source = context.createMediaStreamSource(stream);
      const highPass = context.createBiquadFilter();
      const lowPass = context.createBiquadFilter();
      const analyser = context.createAnalyser();

      highPass.type = 'highpass';
      highPass.frequency.value = 28;
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 2400;
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;

      source.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(analyser);

      mediaStreamRef.current = stream;
      audioContextRef.current = context;
      analyserRef.current = analyser;
      setPermissionState('listening');
      await refreshAudioInputs();
      frameRef.current = requestAnimationFrame(processFrame);
    } catch {
      setPermissionState('blocked');
    }
  }, [processFrame, refreshAudioInputs, selectedInputId, stop]);

  const selectInputDevice = useCallback(
    (inputId: string) => {
      setSelectedInputId(inputId);
      if (permissionState === 'listening') {
        void start(inputId);
      }
    },
    [permissionState, start],
  );

  useEffect(() => {
    void refreshAudioInputs();

    navigator.mediaDevices?.addEventListener?.('devicechange', refreshAudioInputs);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshAudioInputs);
      stop();
    };
  }, [refreshAudioInputs, stop]);

  return {
    audioInputs,
    permissionLabel: getPermissionLabel(permissionState),
    permissionState,
    reading,
    selectedInputId,
    selectInputDevice,
    start,
    stop,
  };
}

function smoothFrequency(current: number, previous: number | null) {
  if (!previous) {
    return current;
  }

  const jumpInCents = Math.abs(1200 * Math.log2(current / previous));

  if (jumpInCents > 80) {
    return current;
  }

  return previous * 0.68 + current * 0.32;
}

function getPermissionLabel(state: PermissionState) {
  switch (state) {
    case 'blocked':
      return 'Microphone blocked';
    case 'listening':
      return 'Listening';
    case 'requesting':
      return 'Waiting for microphone';
    case 'unsupported':
      return 'Microphone unavailable';
    default:
      return 'Ready';
  }
}
