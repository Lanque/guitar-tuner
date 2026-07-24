import type { TuningStatus } from '@/domain/tuner';

type GaugeProps = {
  cents: number;
  isLeftHanded: boolean;
  status: TuningStatus;
};

export function Gauge({ cents, isLeftHanded, status }: GaugeProps) {
  const visualCents = isLeftHanded ? -cents : cents;
  const angle = (visualCents / 50) * 48;

  return (
    <section aria-label="Tuning meter" className={`gauge gauge--${status}`}>
      <div className="gauge-scale" aria-hidden="true">
        <span>Flat</span>
        <span>0</span>
        <span>Sharp</span>
      </div>
      <div className="gauge-arc">
        <div className="gauge-track" />
        <div className="gauge-perfect-zone" />
        <div className="gauge-needle" style={{ transform: `rotate(${angle}deg)` }} />
        <div className="gauge-hub" />
      </div>
      <output className="cents-output">{Math.round(cents)} cents</output>
    </section>
  );
}
