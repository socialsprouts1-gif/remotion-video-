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

export type V = {x: number; y: number};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const lerpV = (a: V, b: V, p: number): V => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p)});
export const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);

/** Seconds-based progress: 0→1 between t0 and t1. */
export const pt = (t: number, t0: number, t1: number, easing = ease.out) =>
  t <= t0 ? 0 : t >= t1 ? 1 : easing((t - t0) / (t1 - t0));

/** Fade in over [a, a+fin], hold, fade out over [b-fout, b]. */
export const win = (t: number, a: number, b: number, fin = 0.35, fout = 0.35) =>
  pt(t, a, a + fin) * (1 - pt(t, b - fout, b, ease.in));

/** Quadratic bezier point. */
export const qbez = (a: V, c: V, b: V, p: number): V => ({
  x: (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * c.x + p * p * b.x,
  y: (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * c.y + p * p * b.y,
});

/** Catmull-Rom through points, p in [0,1] across the whole path. */
export const catmull = (pts: V[], p: number): V => {
  const n = pts.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, p * n));
  const i = Math.floor(f);
  const u = f - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(n, i + 2)];
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
  return {x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y)};
};
