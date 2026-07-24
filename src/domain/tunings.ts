export type GuitarString = {
  id: string;
  label: string;
  note: string;
  octave: number;
  frequency: number;
};

export type Tuning = {
  id: string;
  name: string;
  strings: GuitarString[];
};

const tuningPresets = [
  {
    id: 'standard',
    name: 'Standard',
    notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  },
  {
    id: 'd-standard',
    name: 'D Standard',
    notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'],
  },
  {
    id: 'open-g',
    name: 'Open G',
    notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
  },
  {
    id: 'open-d',
    name: 'Open D',
    notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'],
  },
  {
    id: 'half-step-down',
    name: 'Half Step Down',
    notes: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'],
  },
  {
    id: 'full-step-down',
    name: 'Full Step Down',
    notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'],
  },
  {
    id: 'low-b',
    name: 'Low B',
    notes: ['B1', 'E2', 'A2', 'D3', 'F#3', 'B3'],
  },
  {
    id: 'drop-a',
    name: 'Drop A',
    notes: ['A1', 'E2', 'A2', 'D3', 'F#3', 'B3'],
  },
] as const;

const semitoneByNote = new Map([
  ['C', 0],
  ['C#', 1],
  ['D', 2],
  ['D#', 3],
  ['E', 4],
  ['F', 5],
  ['F#', 6],
  ['G', 7],
  ['G#', 8],
  ['A', 9],
  ['A#', 10],
  ['B', 11],
]);

export function getTuningOptions(referenceA4 = 440): Tuning[] {
  return tuningPresets.map((preset) => ({
    id: preset.id,
    name: preset.name,
    strings: preset.notes.map((noteWithOctave, index) => {
      const parsed = parseNote(noteWithOctave);

      return {
        id: `${preset.id}-${index}`,
        label: `${index + 1}`,
        note: parsed.note,
        octave: parsed.octave,
        frequency: noteToFrequency(parsed.note, parsed.octave, referenceA4),
      };
    }),
  }));
}

export function getTuningById(tuningId: string, referenceA4 = 440) {
  return getTuningOptions(referenceA4).find((tuning) => tuning.id === tuningId) ?? getTuningOptions(referenceA4)[0];
}

export function getCustomTuning(notes: string[], referenceA4 = 440): Tuning {
  return {
    id: 'custom',
    name: 'Custom',
    strings: notes.map((noteWithOctave, index) => {
      const parsed = parseNote(noteWithOctave);

      return {
        id: `custom-${index}`,
        label: `${index + 1}`,
        note: parsed.note,
        octave: parsed.octave,
        frequency: noteToFrequency(parsed.note, parsed.octave, referenceA4),
      };
    }),
  };
}

export function getTuningNoteOptions() {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return Array.from({ length: 49 }, (_, index) => {
    const midiNumber = 24 + index;
    return `${noteNames[midiNumber % 12]}${Math.floor(midiNumber / 12) - 1}`;
  });
}

export function noteToFrequency(note: string, octave: number, referenceA4 = 440) {
  const semitone = semitoneByNote.get(note);

  if (semitone === undefined) {
    throw new Error(`Unsupported note: ${note}`);
  }

  const midiNumber = (octave + 1) * 12 + semitone;
  return referenceA4 * 2 ** ((midiNumber - 69) / 12);
}

function parseNote(noteWithOctave: string) {
  const match = /^([A-G]#?)(\d)$/.exec(noteWithOctave);

  if (!match) {
    throw new Error(`Invalid note format: ${noteWithOctave}`);
  }

  return {
    note: match[1],
    octave: Number(match[2]),
  };
}
