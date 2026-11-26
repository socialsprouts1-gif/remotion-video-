import type { Easing } from "../project/schema";

/** Cubic-bezier solver (same curve model as CSS). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    // bisection fallback
    let lo = 0;
    let hi = 1;
    t = x;
    while (hi - lo > 1e-6) {
      const v = sampleX(t);
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

/** Damped spring response normalised to settle at 1 by t = 1. */
export function springCurve(t: number, damping = 10, stiffness = 100): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const w = Math.sqrt(stiffness) * 1.2;
  const zeta = damping / (2 * Math.sqrt(stiffness));
  const time = t * 2.2;
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * time) * (Math.cos(wd * time) + ((zeta * w) / wd) * Math.sin(wd * time));
  }
  return 1 - Math.exp(-w * time) * (1 + w * time);
}

export function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

const curves: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),
  easeInCubic: cubicBezier(0.55, 0.055, 0.675, 0.19),
  easeOutCubic: cubicBezier(0.215, 0.61, 0.355, 1),
  easeInOutCubic: cubicBezier(0.645, 0.045, 0.355, 1),
  easeOutBack: cubicBezier(0.34, 1.56, 0.64, 1),
  spring: (t) => springCurve(t),
  bounce: bounceOut,
  elastic: elasticOut,
  hold: (t) => (t >= 1 ? 1 : 0),
};

export function ease(easing: Easing | undefined, t: number): number {
  const c = Math.min(1, Math.max(0, t));
  if (!easing) return curves.easeInOut(c);
  if (typeof easing === "string") return (curves[easing] ?? curves.linear)(c);
  const [a, b, x, y] = easing.bezier;
  return cubicBezier(a, b, x, y)(c);
}

export const EASING_LABELS: Record<string, string> = {
  linear: "Linear",
  easeIn: "Ease in",
  easeOut: "Ease out",
  easeInOut: "Ease in-out",
  easeInCubic: "Cubic in",
  easeOutCubic: "Cubic out",
  easeInOutCubic: "Cubic in-out",
  easeOutBack: "Back (overshoot)",
  spring: "Spring",
  bounce: "Bounce",
  elastic: "Elastic",
  hold: "Hold",
};
