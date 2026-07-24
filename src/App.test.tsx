import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { analyzeTuning } from '@/domain/tuner';
import { getTuningById, getTuningOptions } from '@/domain/tunings';

describe('Guitar tuner app', () => {
  it('renders the core tuner controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /tune fast/i })).toBeVisible();
    expect(screen.getByText(/waiting for sound/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /use microphone/i })).toBeVisible();
    expect(screen.getByRole('combobox', { name: /audio input/i })).toBeVisible();
    expect(screen.getByRole('navigation', { name: /tuning selection/i })).toBeVisible();
  });

  it('lets the user close the beginner guide', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start tuning/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports multiple tuning presets', () => {
    const tunings = getTuningOptions();

    expect(tunings.map((tuning) => tuning.name)).toEqual([
      'Standard',
      'Drop D',
      'D Standard',
      'Open G',
      'Open D',
      'Half Step Down',
      'Full Step Down',
      'Low B',
      'Drop A',
    ]);
  });

  it('updates the visible target when Drop D is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Drop D' }));

    expect(screen.getByText('D2')).toBeVisible();
    expect(screen.getByText('A4 is the reference pitch for the open A string.')).toBeVisible();
    expect(screen.getByRole('button', { name: /reset tuned strings/i })).toBeVisible();
  });

  it('detects an in-tune standard A string within the perfect window', () => {
    const standard = getTuningById('standard');
    const reading = analyzeTuning(110, standard);

    expect(reading.noteName).toBe('A');
    expect(reading.status).toBe('perfect');
    expect(reading.statusLabel).toBe('Perfect');
  });

  it('keeps manual string selection instead of switching to the closest string', () => {
    const standard = getTuningById('standard');
    const reading = analyzeTuning(82.4, standard, 'standard-1');

    expect(reading.targetStringName).toBe('A2');
    expect(reading.status).toBe('flat');
  });
});
