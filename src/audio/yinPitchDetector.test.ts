import { describe, expect, it } from 'vitest';
import { detectPitchYin } from './yinPitchDetector';

describe('YIN pitch detector', () => {
  it.each([82.41, 196, 246.94, 329.63])('detects a %s Hz guitar fundamental', (frequency) => {
    const sampleRate = 48_000;
    const buffer = Float32Array.from({ length: 4096 }, (_, index) =>
      0.08 * Math.sin((2 * Math.PI * frequency * index) / sampleRate),
    );

    const result = detectPitchYin(buffer, sampleRate);

    expect(result).not.toBeNull();
    expect(result?.frequency).toBeCloseTo(frequency, 0);
  });
});
