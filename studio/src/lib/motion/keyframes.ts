import type { AnimatableProp, Keyframe, KeyframeMap } from "../project/schema";
import { ease } from "./easing";

export function parseColor(c: string): [number, number, number, number] | null {
  const s = c.trim();
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split("").map((ch) => ch + ch).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    if (h.length === 6) return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
    return [(n >>> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, (n & 255) / 255];
  }
  const m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(",").map((p) => parseFloat(p));
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
  }
  return null;
}

export function mixColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  const al = ca[3] + (cb[3] - ca[3]) * t;
  return `rgba(${r},${g},${bl},${al.toFixed(3)})`;
}

/** Interpolate one property track at a clip-local frame. Returns undefined when the track is empty. */
export function sampleTrack(kfs: Keyframe[] | undefined, frame: number): number | string | undefined {
  if (!kfs || kfs.length === 0) return undefined;
  const sorted = kfs.length > 1 ? [...kfs].sort((a, b) => a.frame - b.frame) : kfs;
  if (frame <= sorted[0].frame) return sorted[0].value;
  const last = sorted[sorted.length - 1];
  if (frame >= last.frame) return last.value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const span = b.frame - a.frame;
      const t = span === 0 ? 1 : ease(a.easing, (frame - a.frame) / span);
      if (typeof a.value === "number" && typeof b.value === "number") return a.value + (b.value - a.value) * t;
      return mixColor(String(a.value), String(b.value), t);
    }
  }
  return last.value;
}

export function sampleNumber(map: KeyframeMap | undefined, prop: AnimatableProp, frame: number, fallback: number): number {
  const v = sampleTrack(map?.[prop], frame);
  return typeof v === "number" ? v : fallback;
}

export function sampleString(map: KeyframeMap | undefined, prop: AnimatableProp, frame: number, fallback: string): string {
  const v = sampleTrack(map?.[prop], frame);
  return v === undefined ? fallback : String(v);
}

export function hasKeyframes(map: KeyframeMap | undefined, prop?: AnimatableProp): boolean {
  if (!map) return false;
  if (prop) return (map[prop]?.length ?? 0) > 0;
  return Object.values(map).some((k) => (k?.length ?? 0) > 0);
}
