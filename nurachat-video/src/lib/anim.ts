import {Easing, interpolate} from 'remotion';

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

// Curves used everywhere. No bounce, no elastic: everything decelerates into place.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out: fast arrival, long settle
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // camera moves
  in: Easing.bezier(0.55, 0, 0.9, 0.3), // exits
  soft: Easing.bezier(0.33, 1, 0.68, 1), // gentle UI settle
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [start, start+dur], eased. */
export const prog = (frame: number, start: number, dur: number, easing = ease.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing});

/** Map a 0→1 progress onto a range. */
export const mix = (p: number, a: number, b: number) => a + (b - a) * p;

export const range = (frame: number, input: number[], output: number[], easing = ease.out) =>
  interpolate(frame, input, output, {...clamp, easing});

/**
 * Cheap motion blur: blur proportional to how far a value moved since last frame.
 * Use on fast entrances only; returns px for CSS blur().
 */
export const velBlur = (fn: (f: number) => number, frame: number, k = 0.08, max = 14) =>
  Math.min(max, Math.abs(fn(frame) - fn(frame - 1)) * k);

/** Deterministic pseudo-random in [0,1) from a number seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
