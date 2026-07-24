type OnboardingProps = {
  onClose: () => void;
};

export function Onboarding({ onClose }: OnboardingProps) {
  return (
    <div aria-modal="true" className="guide-backdrop" role="dialog">
      <section className="guide-card" aria-labelledby="guide-title">
        <p className="eyebrow">Quick start</p>
        <h2 id="guide-title">Play one open string</h2>
        <p>
          Allow microphone access, pluck a string, and tune until the needle reaches the green center.
          The tuner detects the closest string automatically.
        </p>
        <div className="guide-steps">
          <span>1. Tap mic</span>
          <span>2. Pluck</span>
          <span>3. Tune to green</span>
        </div>
        <button className="primary-action" onClick={onClose} type="button">
          Start tuning
        </button>
      </section>
    </div>
  );
}
