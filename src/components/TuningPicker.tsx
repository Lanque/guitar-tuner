import type { Tuning } from '@/domain/tunings';

type TuningPickerProps = {
  onChange: (tuningId: string) => void;
  selectedTuningId: string;
  tuningOptions: Tuning[];
};

export function TuningPicker({ onChange, selectedTuningId, tuningOptions }: TuningPickerProps) {
  return (
    <nav aria-label="Tuning selection" className="tuning-picker">
      {tuningOptions.map((tuning) => (
        <button
          aria-pressed={tuning.id === selectedTuningId}
          className={tuning.id === selectedTuningId ? 'is-selected' : ''}
          key={tuning.id}
          onClick={() => onChange(tuning.id)}
          type="button"
        >
          {tuning.name}
        </button>
      ))}
    </nav>
  );
}
