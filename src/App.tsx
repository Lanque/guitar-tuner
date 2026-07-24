import { useEffect, useMemo, useState } from 'react';
import { Gauge } from '@/components/Gauge';
import { AudioInputPicker } from '@/components/AudioInputPicker';
import { CustomTuningEditor } from '@/components/CustomTuningEditor';
import { Onboarding } from '@/components/Onboarding';
import { StringStrip } from '@/components/StringStrip';
import { TuningPicker } from '@/components/TuningPicker';
import { useGuitarTuner } from '@/hooks/useGuitarTuner';
import { getCustomTuning, getTuningNoteOptions, getTuningOptions } from '@/domain/tunings';

function App() {
  const [referenceA4, setReferenceA4] = useState(440);
  const [customNotes, setCustomNotes] = useState(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const customTuning = useMemo(() => getCustomTuning(customNotes, referenceA4), [customNotes, referenceA4]);
  const tuningOptions = useMemo(
    () => [...getTuningOptions(referenceA4), customTuning],
    [customTuning, referenceA4],
  );
  const noteOptions = useMemo(() => getTuningNoteOptions(), []);
  const [tuningId, setTuningId] = useState(tuningOptions[0].id);
  const [selectedStringId, setSelectedStringId] = useState<string | null>(null);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [tunedStringIds, setTunedStringIds] = useState<Set<string>>(() => new Set());
  const [hasSeenGuide, setHasSeenGuide] = useState(() => localStorage.getItem('tuner-guide') === 'seen');

  const selectedTuning = tuningOptions.find((tuning) => tuning.id === tuningId) ?? tuningOptions[0];
  const manuallySelectedString = selectedStringId
    ? selectedTuning.strings.find((string) => string.id === selectedStringId)
    : null;

  const tuner = useGuitarTuner({
    selectedStringId,
    tuning: selectedTuning,
  });

  const fallbackString = selectedTuning.strings[0];
  const displayNote = manuallySelectedString?.note ?? (tuner.reading.frequency ? tuner.reading.noteName : fallbackString.note);
  const displayTarget = manuallySelectedString
    ? `${manuallySelectedString.note}${manuallySelectedString.octave}`
    : tuner.reading.frequency
    ? tuner.reading.targetStringName
    : `${fallbackString.note}${fallbackString.octave}`;
  const statusLabel = tuner.reading.status === 'perfect' ? 'Perfect' : tuner.reading.statusLabel;

  useEffect(() => {
    if (tuner.reading.status !== 'perfect' || !tuner.reading.targetStringId) {
      return;
    }

    setTunedStringIds((current) => {
      if (current.has(tuner.reading.targetStringId!)) {
        return current;
      }

      return new Set(current).add(tuner.reading.targetStringId!);
    });
  }, [tuner.reading.status, tuner.reading.targetStringId]);

  function closeGuide() {
    localStorage.setItem('tuner-guide', 'seen');
    setHasSeenGuide(true);
  }

  return (
    <main className={`tuner-app ${tuner.reading.status === 'perfect' ? 'is-perfect' : ''}`}>
      <section aria-labelledby="app-title" className="tuner-shell">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Guitar Tuner</p>
            <h1 id="app-title">Tune fast. Stay in flow.</h1>
          </div>
          <button className="icon-button" onClick={() => setHasSeenGuide(false)} type="button">
            ?
          </button>
        </header>

        <div className="status-row" data-state={tuner.permissionState}>
          <span className="status-dot" />
          <span>{tuner.permissionLabel}</span>
        </div>

        <section aria-live="polite" className="readout">
          <div className="target-string">{displayTarget}</div>
          <div className="note">{displayNote}</div>
          <p className="frequency">
            {tuner.reading.frequency ? `${tuner.reading.frequency.toFixed(1)} Hz` : 'Waiting for sound'}
          </p>
          <p className={`tune-state tune-state--${tuner.reading.status}`}>{statusLabel}</p>
          <p className="step-readout">{tuner.reading.stepLabel}</p>
        </section>

        <Gauge cents={tuner.reading.cents} isLeftHanded={isLeftHanded} status={tuner.reading.status} />

        <StringStrip
          activeStringId={selectedStringId ?? tuner.reading.targetStringId}
          onSelect={setSelectedStringId}
          perfectStringId={tuner.reading.status === 'perfect' ? tuner.reading.targetStringId : null}
          strings={selectedTuning.strings}
          tunedStringIds={tunedStringIds}
        />

        <button className="reset-button" onClick={() => setTunedStringIds(new Set())} type="button">
          Reset tuned strings
        </button>

        <section className="quick-controls" aria-label="Quick settings">
          <button
            className="primary-action"
            disabled={tuner.permissionState === 'listening'}
            onClick={() => void tuner.start()}
            type="button"
          >
            {tuner.permissionState === 'listening' ? 'Listening' : 'Use microphone'}
          </button>
          <button className="secondary-action" onClick={tuner.stop} type="button">
            Stop
          </button>
        </section>

        <AudioInputPicker
          inputs={tuner.audioInputs}
          isListening={tuner.permissionState === 'listening'}
          onChange={tuner.selectInputDevice}
          selectedInputId={tuner.selectedInputId}
        />

        <section className="settings-grid" aria-label="Tuner settings">
          <label className="compact-control">
            <span title="The reference pitch for A4, the A string above middle C">A4 reference</span>
            <input
              aria-label="A4 reference"
              max="450"
              min="430"
              onChange={(event) => setReferenceA4(Number(event.target.value))}
              step="1"
              type="range"
              value={referenceA4}
            />
            <strong>{referenceA4} Hz</strong>
            <small>A4 is the reference pitch for the open A string.</small>
          </label>
          <label className="toggle-control">
            <input
              checked={isLeftHanded}
              onChange={(event) => setIsLeftHanded(event.target.checked)}
              type="checkbox"
            />
            <span>Left-handed mode</span>
          </label>
        </section>

        <TuningPicker
          onChange={(nextTuningId) => {
            setTuningId(nextTuningId);
            setSelectedStringId(null);
          }}
          selectedTuningId={tuningId}
          tuningOptions={tuningOptions}
        />

        {tuningId === 'custom' ? (
          <CustomTuningEditor
            notes={customNotes}
            noteOptions={noteOptions}
            onChange={(index, note) => {
              setCustomNotes((current) => current.map((value, noteIndex) => (noteIndex === index ? note : value)));
              setTunedStringIds(new Set());
            }}
          />
        ) : null}
      </section>

      {!hasSeenGuide ? <Onboarding onClose={closeGuide} /> : null}
    </main>
  );
}

export default App;
