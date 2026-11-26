/**
 * Animation preset + transition engine.
 *
 * Presets are parametric (duration, easing, direction, intensity, stagger) and
 * evaluate to additive / multiplicative modifiers that are layered on top of the
 * clip's keyframed transform. They can also be "baked" into real keyframes
 * (bakePreset) so the user can fine-tune every frame.
 */
import type { AnimationSpec, Clip, Keyframe, LoopSpec, Transition } from "../project/schema";
import { ease } from "./easing";
import { nanoid } from "../id";

export interface Motion {
  dx: number;
  dy: number;
  scale: number;
  rotation: number;
  opacity: number;
  blur: number;
  skewX: number;
  rotateY: number;
  brightness: number;
  /** css clip-path or null */
  clipPath: string | null;
  /** 0..1 text reveal progress for letter/word staggered presets (1 = fully shown) */
  textProgress: number;
  /** which preset drives the text split (null when not staggered) */
  textPreset: AnimationSpec | null;
  textPhase: "in" | "out" | null;
  /** glitch intensity 0..1 (renderer adds rgb split / slice offsets) */
  glitch: number;
}

export const IDENTITY_MOTION: Motion = {
  dx: 0,
  dy: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  blur: 0,
  skewX: 0,
  rotateY: 0,
  brightness: 1,
  clipPath: null,
  textProgress: 1,
  textPreset: null,
  textPhase: null,
  glitch: 0,
};

const TEXT_STAGGER_PRESETS = new Set(["typewriter", "kinetic"]);

function dirVec(direction: string): [number, number] {
  switch (direction) {
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
    case "down":
      return [0, 1];
    default:
      return [0, -1];
  }
}

/** progress p: 0 = hidden state, 1 = resting state */
function applyPreset(m: Motion, spec: AnimationSpec, p: number, w: number, h: number, phase: "in" | "out") {
  const k = spec.intensity;
  const inv = 1 - p;
  const [vx, vy] = dirVec(spec.direction);
  // entering from direction: start offset is opposite of travel
  const travel = Math.min(w, h) * 0.18 * k;
  switch (spec.preset) {
    case "fade":
      m.opacity *= p;
      break;
    case "slide":
      m.dx += -vx * travel * inv * 2.2;
      m.dy += -vy * travel * inv * 2.2;
      m.opacity *= Math.min(1, p * 1.6);
      break;
    case "pop":
      m.scale *= 0.4 + 0.6 * p;
      m.opacity *= Math.min(1, p * 2);
      break;
    case "bounce":
      m.dy += -travel * 1.5 * inv;
      m.opacity *= Math.min(1, p * 3);
      break;
    case "zoom":
      m.scale *= 1 + 0.6 * k * inv;
      m.opacity *= p;
      break;
    case "rotate":
      m.rotation += -90 * k * inv;
      m.scale *= 0.6 + 0.4 * p;
      m.opacity *= p;
      break;
    case "reveal": {
      const pct = (inv * 100).toFixed(2);
      const inset =
        spec.direction === "left"
          ? `inset(0 0 0 ${pct}%)`
          : spec.direction === "right"
            ? `inset(0 ${pct}% 0 0)`
            : spec.direction === "down"
              ? `inset(0 0 ${pct}% 0)`
              : `inset(${pct}% 0 0 0)`;
      m.clipPath = inset;
      break;
    }
    case "mask-reveal": {
      m.clipPath = `circle(${(p * 75).toFixed(2)}% at 50% 50%)`;
      break;
    }
    case "blur-reveal":
      m.blur += 30 * k * inv;
      m.opacity *= p;
      m.scale *= 1 + 0.08 * inv;
      break;
    case "liquid": {
      // organic blob reveal using an animated polygon
      const pts: string[] = [];
      const n = 24;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const wobble = 1 + 0.12 * Math.sin(a * 3 + p * 6) * (1 - p);
        const r = p * 78 * wobble;
        pts.push(`${(50 + Math.cos(a) * r).toFixed(2)}% ${(50 + Math.sin(a) * r).toFixed(2)}%`);
      }
      m.clipPath = p >= 0.999 ? null : `polygon(${pts.join(",")})`;
      break;
    }
    case "flip-3d":
      m.rotateY += 90 * inv * (spec.direction === "left" ? -1 : 1);
      m.opacity *= p > 0.02 ? 1 : 0;
      break;
    case "glitch":
      m.glitch = Math.max(m.glitch, inv * k);
      m.opacity *= p < 0.15 ? (Math.floor(p * 40) % 2 === 0 ? 0 : 1) : 1;
      break;
    case "typewriter":
    case "kinetic":
      m.textProgress = Math.min(m.textProgress, p);
      m.textPreset = spec;
      m.textPhase = phase;
      break;
    case "drift":
      m.dx += -vx * travel * 0.5 * inv;
      m.dy += -vy * travel * 0.5 * inv;
      m.opacity *= p;
      break;
    case "pulse":
      m.scale *= 1 + 0.15 * k * Math.sin(p * Math.PI);
      break;
    case "float":
      m.dy += -travel * 0.4 * inv;
      m.opacity *= p;
      break;
    case "shake":
      m.dx += Math.sin(p * 60) * 18 * k * inv;
      break;
  }
}

function applyLoop(m: Motion, loop: LoopSpec, frame: number) {
  const t = (frame % loop.period) / loop.period;
  const s = Math.sin(t * Math.PI * 2);
  const k = loop.intensity;
  switch (loop.preset) {
    case "pulse":
      m.scale *= 1 + 0.05 * k * s;
      break;
    case "float":
      m.dy += 12 * k * s;
      break;
    case "spin":
      m.rotation += 360 * t;
      break;
    case "shake":
      m.dx += Math.sin(frame * 2.7) * 4 * k;
      m.dy += Math.cos(frame * 3.1) * 4 * k;
      break;
    case "drift":
      m.dx += 20 * k * s;
      m.rotation += 2 * k * s;
      break;
    case "flicker":
      m.opacity *= 0.85 + 0.15 * Math.abs(Math.sin(frame * 1.7) * Math.cos(frame * 0.9));
      break;
  }
}

function applyTransition(m: Motion, tr: Transition, p: number, w: number, h: number, side: "in" | "out") {
  // p: 0 = fully transitioned out, 1 = fully visible
  const inv = 1 - p;
  const sign = side === "in" ? 1 : -1;
  switch (tr.type) {
    case "fade":
      m.opacity *= p;
      break;
    case "slide-left":
      m.dx += w * inv * sign;
      break;
    case "slide-right":
      m.dx += -w * inv * sign;
      break;
    case "slide-up":
      m.dy += h * inv * sign;
      break;
    case "slide-down":
      m.dy += -h * inv * sign;
      break;
    case "zoom-in":
      m.scale *= side === "in" ? 0.5 + 0.5 * p : 1 + inv;
      m.opacity *= p;
      break;
    case "zoom-out":
      m.scale *= side === "in" ? 1 + inv : 0.5 + 0.5 * p;
      m.opacity *= p;
      break;
    case "wipe-left":
      m.clipPath = side === "in" ? `inset(0 0 0 ${(inv * 100).toFixed(2)}%)` : `inset(0 ${(inv * 100).toFixed(2)}% 0 0)`;
      break;
    case "wipe-right":
      m.clipPath = side === "in" ? `inset(0 ${(inv * 100).toFixed(2)}% 0 0)` : `inset(0 0 0 ${(inv * 100).toFixed(2)}%)`;
      break;
    case "circle":
      m.clipPath = `circle(${(p * 75).toFixed(2)}% at 50% 50%)`;
      break;
    case "blur":
      m.blur += 40 * inv;
      m.opacity *= Math.min(1, p * 1.5);
      break;
    case "glitch":
      m.glitch = Math.max(m.glitch, inv);
      m.opacity *= p < 0.2 ? (Math.floor(p * 50) % 2 ? 1 : 0.2) : 1;
      break;
    case "flash":
      m.brightness *= 1 + 3 * inv;
      m.opacity *= Math.min(1, 0.4 + p);
      break;
    case "spin":
      m.rotation += 180 * inv * sign;
      m.scale *= 0.3 + 0.7 * p;
      m.opacity *= p;
      break;
  }
}

/**
 * Evaluate preset/transition/loop modifiers for a clip at a clip-local frame.
 * `w`/`h` are composition dimensions.
 */
export function evaluateMotion(clip: Clip, local: number, w: number, h: number): Motion {
  const m: Motion = { ...IDENTITY_MOTION };
  const d = clip.duration;

  if (clip.transitionIn) {
    const tr = clip.transitionIn;
    if (local < tr.duration) applyTransition(m, tr, ease(tr.easing, local / tr.duration), w, h, "in");
  }
  if (clip.transitionOut) {
    const tr = clip.transitionOut;
    const startOut = d - tr.duration;
    if (local > startOut) applyTransition(m, tr, ease(tr.easing, (d - local) / tr.duration), w, h, "out");
  }
  if (clip.animationIn) {
    const a = clip.animationIn;
    const t = (local - a.delay) / a.duration;
    const staggered = TEXT_STAGGER_PRESETS.has(a.preset);
    // staggered text presets compute per-unit easing themselves; pass linear progress across the whole span
    if (t < 1 || staggered) applyPreset(m, a, staggered ? Math.max(0, Math.min(1, t)) : ease(a.easing, Math.max(0, t)), w, h, "in");
  }
  if (clip.animationOut) {
    const a = clip.animationOut;
    const startOut = d - a.duration - a.delay;
    if (local > startOut) {
      const t = (d - a.delay - local) / a.duration;
      const staggered = TEXT_STAGGER_PRESETS.has(a.preset);
      applyPreset(m, a, staggered ? Math.max(0, Math.min(1, t)) : ease(a.easing, Math.max(0, Math.min(1, t))), w, h, "out");
    }
  }
  if (clip.loop) applyLoop(m, clip.loop, local);
  return m;
}

/** Per-unit progress for staggered text presets. */
export function unitProgress(spec: AnimationSpec, unitIndex: number, unitCount: number, overall: number): number {
  // total span = duration; each unit animates over `unitDur`, starting `stagger` frames apart
  const totalStagger = spec.stagger * Math.max(0, unitCount - 1);
  const unitDur = Math.max(1, spec.duration - totalStagger);
  const frame = overall * spec.duration;
  const local = (frame - unitIndex * spec.stagger) / unitDur;
  return ease(spec.easing, Math.max(0, Math.min(1, local)));
}

/* --------------------------------------------------------------- baking */

const PRESET_KEYS: Record<string, { prop: "x" | "y" | "scale" | "rotation" | "opacity" | "blur" | "rotateY"; from: (s: AnimationSpec, w: number, h: number) => number; rest: number }[]> = {
  fade: [{ prop: "opacity", from: () => 0, rest: 1 }],
  slide: [
    { prop: "opacity", from: () => 0, rest: 1 },
  ],
  pop: [
    { prop: "scale", from: () => 0.4, rest: 1 },
    { prop: "opacity", from: () => 0, rest: 1 },
  ],
  zoom: [
    { prop: "scale", from: (s) => 1 + 0.6 * s.intensity, rest: 1 },
    { prop: "opacity", from: () => 0, rest: 1 },
  ],
  rotate: [
    { prop: "rotation", from: (s) => -90 * s.intensity, rest: 0 },
    { prop: "opacity", from: () => 0, rest: 1 },
  ],
  "blur-reveal": [
    { prop: "blur", from: (s) => 30 * s.intensity, rest: 0 },
    { prop: "opacity", from: () => 0, rest: 1 },
  ],
  "flip-3d": [{ prop: "rotateY", from: () => 90, rest: 0 }],
  float: [{ prop: "opacity", from: () => 0, rest: 1 }],
  drift: [{ prop: "opacity", from: () => 0, rest: 1 }],
  bounce: [{ prop: "opacity", from: () => 0, rest: 1 }],
};

/**
 * Convert the clip's in/out presets into explicit keyframes (where the preset has
 * a keyframeable equivalent) and clear the preset. Returns a new keyframe map.
 */
export function bakePresets(clip: Clip, w: number, h: number): Clip["keyframes"] {
  const out: Clip["keyframes"] = JSON.parse(JSON.stringify(clip.keyframes ?? {}));
  const add = (prop: keyof typeof out, frame: number, value: number, easing: Keyframe["easing"]) => {
    const list = (out[prop] ??= []);
    const existing = list.find((k) => k.frame === frame);
    if (existing) existing.value = value;
    else list.push({ id: nanoid(), frame, value, easing });
    list.sort((a, b) => a.frame - b.frame);
  };
  const base = clip.transform;
  const restOf = (prop: string) =>
    prop === "x" ? base.x : prop === "y" ? base.y : prop === "scale" ? base.scale : prop === "rotation" ? base.rotation : prop === "opacity" ? base.opacity : prop === "rotateY" ? base.rotateY : 0;
  const travel = (s: AnimationSpec) => Math.min(w, h) * 0.18 * s.intensity * 2.2;
  for (const phase of ["in", "out"] as const) {
    const spec = phase === "in" ? clip.animationIn : clip.animationOut;
    if (!spec) continue;
    const keys = PRESET_KEYS[spec.preset];
    if (!keys) continue;
    const startF = phase === "in" ? spec.delay : clip.duration - spec.duration - spec.delay;
    const endF = startF + spec.duration;
    const hiddenF = phase === "in" ? startF : endF;
    const restF = phase === "in" ? endF : startF;
    for (const k of keys) {
      const rest = restOf(k.prop) * (k.prop === "scale" || k.prop === "opacity" ? 1 : 1);
      const hidden = k.prop === "scale" ? rest * k.from(spec, w, h) : k.prop === "opacity" ? rest * k.from(spec, w, h) : rest + k.from(spec, w, h);
      add(k.prop, hiddenF, hidden, phase === "in" ? spec.easing : "linear");
      add(k.prop, restF, rest, phase === "in" ? "linear" : spec.easing);
    }
    if (spec.preset === "slide" || spec.preset === "float" || spec.preset === "drift" || spec.preset === "bounce") {
      const [vx, vy] = dirVec(spec.direction);
      const mult = spec.preset === "slide" ? 1 : spec.preset === "bounce" ? 0.68 : 0.23;
      const t = travel(spec) * mult;
      add("x", hiddenF, base.x - vx * t, phase === "in" ? spec.preset === "bounce" ? "bounce" : spec.easing : "linear");
      add("x", restF, base.x, phase === "in" ? "linear" : spec.easing);
      add("y", hiddenF, base.y - vy * t, phase === "in" ? spec.preset === "bounce" ? "bounce" : spec.easing : "linear");
      add("y", restF, base.y, phase === "in" ? "linear" : spec.easing);
    }
  }
  return out;
}

export const PRESET_INFO: Record<string, { label: string; text?: boolean; bakeable: boolean }> = {
  fade: { label: "Fade", bakeable: true },
  slide: { label: "Slide", bakeable: true },
  pop: { label: "Pop", bakeable: true },
  bounce: { label: "Bounce", bakeable: true },
  zoom: { label: "Zoom", bakeable: true },
  rotate: { label: "Rotate", bakeable: true },
  reveal: { label: "Wipe reveal", bakeable: false },
  "mask-reveal": { label: "Mask reveal", bakeable: false },
  "blur-reveal": { label: "Blur reveal", bakeable: true },
  typewriter: { label: "Typewriter", text: true, bakeable: false },
  glitch: { label: "Glitch", bakeable: false },
  liquid: { label: "Liquid reveal", bakeable: false },
  "flip-3d": { label: "3D flip", bakeable: true },
  kinetic: { label: "Kinetic text", text: true, bakeable: false },
  drift: { label: "Drift", bakeable: true },
  pulse: { label: "Pulse", bakeable: false },
  float: { label: "Float up", bakeable: true },
  shake: { label: "Shake", bakeable: false },
};
