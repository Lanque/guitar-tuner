type AudioInput = {
  id: string;
  label: string;
};

type AudioInputPickerProps = {
  inputs: AudioInput[];
  isListening: boolean;
  onChange: (deviceId: string) => void;
  selectedInputId: string;
};

export function AudioInputPicker({
  inputs,
  isListening,
  onChange,
  selectedInputId,
}: AudioInputPickerProps) {
  return (
    <label className="audio-input-control">
      <span>Audio input</span>
      <select
        aria-label="Audio input"
        onChange={(event) => onChange(event.target.value)}
        value={selectedInputId}
      >
        <option value="">System default microphone</option>
        {inputs.map((input) => (
          <option key={input.id} value={input.id}>
            {input.label}
          </option>
        ))}
      </select>
      <small>
        {inputs.length > 0
          ? isListening
            ? 'Input active'
            : 'Choose an interface, then start listening'
          : 'Allow microphone access to see connected interfaces'}
      </small>
    </label>
  );
}
