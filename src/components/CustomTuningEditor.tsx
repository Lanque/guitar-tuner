type CustomTuningEditorProps = {
  notes: string[];
  noteOptions: string[];
  onChange: (index: number, note: string) => void;
};

export function CustomTuningEditor({ notes, noteOptions, onChange }: CustomTuningEditorProps) {
  return (
    <section aria-label="Custom tuning editor" className="custom-tuning-editor">
      <div>
        <p className="custom-tuning-title">Custom tuning</p>
        <p className="custom-tuning-help">Choose the target note for each string, from low to high.</p>
      </div>
      <div className="custom-tuning-grid">
        {notes.map((note, index) => (
          <label key={index}>
            <span>String {6 - index}</span>
            <select
              aria-label={`String ${6 - index} target`}
              onChange={(event) => onChange(index, event.target.value)}
              value={note}
            >
              {noteOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
