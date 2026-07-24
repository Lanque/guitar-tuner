import type { GuitarString } from '@/domain/tunings';

type StringStripProps = {
  activeStringId: string | null;
  onSelect: (stringId: string | null) => void;
  perfectStringId: string | null;
  tunedStringIds: Set<string>;
  strings: GuitarString[];
};

export function StringStrip({ activeStringId, onSelect, perfectStringId, strings, tunedStringIds }: StringStripProps) {
  return (
    <ol aria-label="Detected guitar string" className="string-strip">
      <li className={!activeStringId ? 'is-selected' : ''}>
        <button aria-pressed={!activeStringId} onClick={() => onSelect(null)} type="button">
          <span>Auto</span>
          <small>detect</small>
        </button>
      </li>
      {strings.map((string) => (
        <li
          className={[
            string.id === activeStringId ? 'is-active' : '',
            string.id === perfectStringId ? 'is-perfect' : '',
            tunedStringIds.has(string.id) ? 'is-tuned' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={string.id}
        >
          <button
            aria-pressed={string.id === activeStringId}
            onClick={() => onSelect(string.id)}
            type="button"
          >
            <span>{string.note}</span>
            <small>{string.frequency.toFixed(1)}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}
