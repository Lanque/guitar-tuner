export type PitchResult = {
  clarity: number;
  frequency: number;
};

// Guitar strings can be quiet at the interface input, especially on the top strings.
const yinThreshold = 0.15;
const minRms = 0.002;

export function detectPitchYin(buffer: Float32Array, sampleRate: number): PitchResult | null {
  const rms = getRootMeanSquare(buffer);

  if (rms < minRms) {
    return null;
  }

  const halfBufferLength = Math.floor(buffer.length / 2);
  const yinBuffer = new Float32Array(halfBufferLength);

  for (let tau = 1; tau < halfBufferLength; tau += 1) {
    let difference = 0;

    for (let index = 0; index < halfBufferLength; index += 1) {
      const delta = buffer[index] - buffer[index + tau];
      difference += delta * delta;
    }

    yinBuffer[tau] = difference;
  }

  yinBuffer[0] = 1;
  let runningSum = 0;

  for (let tau = 1; tau < halfBufferLength; tau += 1) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }

  let tauEstimate = -1;

  for (let tau = 2; tau < halfBufferLength; tau += 1) {
    if (yinBuffer[tau] < yinThreshold) {
      while (tau + 1 < halfBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau += 1;
      }

      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) {
    return null;
  }

  const betterTau = parabolicInterpolate(yinBuffer, tauEstimate);
  const frequency = sampleRate / betterTau;

  if (!Number.isFinite(frequency) || frequency < 28 || frequency > 500) {
    return null;
  }

  return {
    clarity: 1 - yinBuffer[tauEstimate],
    frequency,
  };
}

function getRootMeanSquare(buffer: Float32Array) {
  let sum = 0;

  for (const sample of buffer) {
    sum += sample * sample;
  }

  return Math.sqrt(sum / buffer.length);
}

function parabolicInterpolate(buffer: Float32Array, tau: number) {
  const left = buffer[tau - 1] ?? buffer[tau];
  const center = buffer[tau];
  const right = buffer[tau + 1] ?? buffer[tau];
  const denominator = left + right - 2 * center;

  if (denominator === 0) {
    return tau;
  }

  return tau + (left - right) / (2 * denominator);
}
