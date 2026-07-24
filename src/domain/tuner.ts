import type { GuitarString, Tuning } from '@/domain/tunings';

export type TuningStatus = 'waiting' | 'flat' | 'perfect' | 'sharp';

export type TunerReading = {
  cents: number;
  frequency: number | null;
  noteName: string;
  status: TuningStatus;
  statusLabel: string;
  stepLabel: string;
  semitoneOffset: number;
  targetStringId: string | null;
  targetStringName: string;
};

const emptyReading: TunerReading = {
  cents: 0,
  frequency: null,
  noteName: 'E',
  status: 'waiting',
  statusLabel: 'Play a string',
  stepLabel: 'Select a string and play it',
  semitoneOffset: 0,
  targetStringId: null,
  targetStringName: 'Auto',
};

export function getEmptyReading() {
  return emptyReading;
}

export function analyzeTuning(frequency: number | null, tuning: Tuning, selectedStringId: string | null = null): TunerReading {
  if (!frequency || frequency < 25 || frequency > 1200) {
    return emptyReading;
  }

  const target = selectedStringId
    ? tuning.strings.find((string) => string.id === selectedStringId)
    : findClosestString(frequency, tuning.strings);

  if (!target) {
    return emptyReading;
  }
  const cents = 1200 * Math.log2(frequency / target.frequency);
  const status = getStatus(cents);
  const semitoneOffset = Math.round(cents / 100);

  return {
    cents: clamp(cents, -50, 50),
    frequency,
    noteName: target.note,
    status,
    statusLabel: status === 'flat' ? 'Flat' : status === 'sharp' ? 'Sharp' : 'Perfect',
    stepLabel: getStepLabel(cents, semitoneOffset),
    semitoneOffset,
    targetStringId: target.id,
    targetStringName: `${target.note}${target.octave}`,
  };
}

function getStepLabel(cents: number, semitoneOffset: number) {
  if (Math.abs(cents) <= 2) {
    return 'Target pitch';
  }

  if (semitoneOffset !== 0) {
    const steps = Math.abs(semitoneOffset);
    return `${steps} ${steps === 1 ? 'step' : 'steps'} ${semitoneOffset > 0 ? 'high' : 'low'}`;
  }

  return `${Math.abs(cents).toFixed(0)} cents ${cents > 0 ? 'high' : 'low'}`;
}

function findClosestString(frequency: number, strings: GuitarString[]) {
  return strings.reduce((closest, current) => {
    const closestDistance = Math.abs(1200 * Math.log2(frequency / closest.frequency));
    const currentDistance = Math.abs(1200 * Math.log2(frequency / current.frequency));

    return currentDistance < closestDistance ? current : closest;
  });
}

function getStatus(cents: number): TuningStatus {
  if (Math.abs(cents) <= 2) {
    return 'perfect';
  }

  return cents < 0 ? 'flat' : 'sharp';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
