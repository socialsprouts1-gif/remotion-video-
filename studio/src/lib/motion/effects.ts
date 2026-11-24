import type { EffectKind } from "../project/schema";

export type ParamDef =
  | { key: string; label: string; type: "number"; min: number; max: number; step?: number; default: number }
  | { key: string; label: string; type: "color"; default: string }
  | { key: string; label: string; type: "text"; default: string }
  | { key: string; label: string; type: "select"; options: string[]; default: string }
  | { key: string; label: string; type: "numbers"; default: number[] }
  | { key: string; label: string; type: "strings"; default: string[] }
  | { key: string; label: string; type: "boolean"; default: boolean };

export interface EffectDef {
  kind: EffectKind;
  label: string;
  category: "Particles & light" | "Overlays" | "Graphics" | "Data" | "Backgrounds" | "Text & titles";
  description: string;
  /** default layer box; null = full frame */
  box: { width: number; height: number; y?: number } | null;
  blendMode?: "screen" | "overlay" | "normal";
  params: ParamDef[];
}

const color = (key: string, label: string, d: string): ParamDef => ({ key, label, type: "color", default: d });
const num = (key: string, label: string, min: number, max: number, d: number, step?: number): ParamDef => ({ key, label, type: "number", min, max, default: d, step });

export const EFFECTS: Record<EffectKind, EffectDef> = {
  particles: {
    kind: "particles",
    label: "Particles",
    category: "Particles & light",
    description: "Floating dust / bokeh particles with depth.",
    box: null,
    blendMode: "screen",
    params: [num("count", "Count", 10, 400, 120, 1), num("size", "Size", 1, 40, 6), num("speed", "Speed", 0, 5, 1, 0.1), color("color", "Color", "#ffffff"), num("bokeh", "Bokeh", 0, 1, 0.4, 0.05), { key: "direction", label: "Direction", type: "select", options: ["up", "down", "drift", "burst"], default: "up" }],
  },
  "light-streaks": {
    kind: "light-streaks",
    label: "Light streaks",
    category: "Particles & light",
    description: "Anamorphic streaks sweeping across frame.",
    box: null,
    blendMode: "screen",
    params: [num("count", "Count", 1, 30, 8, 1), color("color", "Color", "#7cc7ff"), num("speed", "Speed", 0.1, 5, 1.2, 0.1), num("angle", "Angle", -90, 90, -12)],
  },
  glitch: {
    kind: "glitch",
    label: "Glitch overlay",
    category: "Overlays",
    description: "Digital slice glitches and RGB noise bars.",
    box: null,
    blendMode: "screen",
    params: [num("intensity", "Intensity", 0, 1, 0.6, 0.05), num("frequency", "Frequency", 0, 1, 0.35, 0.05), color("colorA", "Color A", "#ff1f6d"), color("colorB", "Color B", "#20f0ff")],
  },
  grid: {
    kind: "grid",
    label: "Perspective grid",
    category: "Backgrounds",
    description: "Retro-futuristic moving floor grid.",
    box: null,
    params: [color("color", "Line color", "#8b7bff"), color("background", "Background", "#07080b"), num("speed", "Speed", 0, 5, 1, 0.1), num("density", "Density", 4, 40, 16, 1)],
  },
  orbs: {
    kind: "orbs",
    label: "Gradient orbs",
    category: "Backgrounds",
    description: "Soft drifting colour orbs — abstract premium background.",
    box: null,
    params: [{ key: "colors", label: "Colors", type: "strings", default: ["#8b7bff", "#5ee1ff", "#ff6b9a"] }, color("background", "Background", "#07080b"), num("speed", "Speed", 0, 4, 1, 0.1), num("blur", "Softness", 20, 300, 140)],
  },
  "lower-third": {
    kind: "lower-third",
    label: "Lower third",
    category: "Text & titles",
    description: "Animated name / title bar.",
    box: { width: 900, height: 180, y: 300 },
    params: [{ key: "title", label: "Title", type: "text", default: "Alex Morgan" }, { key: "subtitle", label: "Subtitle", type: "text", default: "Creative Director" }, color("accent", "Accent", "#8b7bff"), color("textColor", "Text", "#ffffff"), color("panel", "Panel", "rgba(10,12,18,0.85)")],
  },
  "bar-chart": {
    kind: "bar-chart",
    label: "Bar chart",
    category: "Data",
    description: "Animated bar chart with labels.",
    box: { width: 1200, height: 640 },
    params: [{ key: "values", label: "Values", type: "numbers", default: [32, 58, 41, 77, 95] }, { key: "labels", label: "Labels", type: "strings", default: ["Q1", "Q2", "Q3", "Q4", "Q5"] }, color("color", "Bar color", "#8b7bff"), color("textColor", "Text", "#e4e7ee"), { key: "suffix", label: "Suffix", type: "text", default: "%" }],
  },
  counter: {
    kind: "counter",
    label: "Number counter",
    category: "Data",
    description: "Counts up to a value.",
    box: { width: 900, height: 300 },
    params: [num("from", "From", -1e9, 1e9, 0), num("to", "To", -1e9, 1e9, 12500), { key: "prefix", label: "Prefix", type: "text", default: "" }, { key: "suffix", label: "Suffix", type: "text", default: "+" }, num("decimals", "Decimals", 0, 3, 0, 1), color("color", "Color", "#ffffff"), { key: "label", label: "Label", type: "text", default: "happy customers" }, { key: "fontFamily", label: "Font", type: "text", default: "Space Grotesk" }],
  },
  "progress-bar": {
    kind: "progress-bar",
    label: "Progress bar",
    category: "Data",
    description: "Video progress / loading bar.",
    box: { width: 1920, height: 12, y: 534 },
    params: [color("color", "Color", "#8b7bff"), color("track", "Track", "rgba(255,255,255,0.15)")],
  },
  "light-leak": {
    kind: "light-leak",
    label: "Light leak",
    category: "Overlays",
    description: "Warm organic film light leak.",
    box: null,
    blendMode: "screen",
    params: [color("color", "Color", "#ff8a3d"), color("color2", "Color 2", "#ff3d7f"), num("intensity", "Intensity", 0, 1, 0.7, 0.05), num("speed", "Speed", 0.1, 4, 1, 0.1)],
  },
  "film-grain": {
    kind: "film-grain",
    label: "Film grain",
    category: "Overlays",
    description: "Animated photographic grain.",
    box: null,
    blendMode: "overlay",
    params: [num("amount", "Amount", 0, 1, 0.35, 0.05), num("size", "Size", 0.3, 2, 0.9, 0.05)],
  },
  hud: {
    kind: "hud",
    label: "HUD interface",
    category: "Graphics",
    description: "Futuristic targeting HUD with rings and readouts.",
    box: null,
    blendMode: "screen",
    params: [color("color", "Color", "#5ee1ff"), { key: "label", label: "Label", type: "text", default: "SYSTEM ONLINE" }, num("speed", "Speed", 0, 4, 1, 0.1)],
  },
  scanlines: {
    kind: "scanlines",
    label: "Scanlines",
    category: "Overlays",
    description: "CRT scanlines and flicker.",
    box: null,
    params: [num("opacity", "Opacity", 0, 1, 0.25, 0.05), num("spacing", "Spacing", 2, 12, 4, 1)],
  },
  "neon-frame": {
    kind: "neon-frame",
    label: "Neon frame",
    category: "Graphics",
    description: "Glowing animated border.",
    box: null,
    blendMode: "screen",
    params: [color("color", "Color", "#ff4fd8"), num("thickness", "Thickness", 2, 30, 8, 1), num("inset", "Inset", 0, 300, 60, 1), num("radius", "Radius", 0, 200, 32, 1)],
  },
  confetti: {
    kind: "confetti",
    label: "Confetti",
    category: "Particles & light",
    description: "Celebration confetti burst.",
    box: null,
    params: [num("count", "Count", 10, 400, 160, 1), { key: "colors", label: "Colors", type: "strings", default: ["#ffd84d", "#ff6b9a", "#5ee1ff", "#8b7bff", "#5effb1"] }, num("gravity", "Gravity", 0, 3, 1, 0.1)],
  },
  smoke: {
    kind: "smoke",
    label: "Smoke",
    category: "Particles & light",
    description: "Procedural drifting smoke / fog.",
    box: null,
    blendMode: "screen",
    params: [color("color", "Color", "#c8d0e0"), num("density", "Density", 0, 1, 0.5, 0.05), num("speed", "Speed", 0, 4, 1, 0.1)],
  },
  fire: {
    kind: "fire",
    label: "Fire embers",
    category: "Particles & light",
    description: "Rising embers with flicker glow.",
    box: null,
    blendMode: "screen",
    params: [num("count", "Count", 10, 300, 90, 1), color("color", "Color", "#ff7a1a"), num("speed", "Speed", 0.2, 4, 1.2, 0.1)],
  },
  "liquid-blob": {
    kind: "liquid-blob",
    label: "Liquid blob",
    category: "Graphics",
    description: "Morphing liquid shape.",
    box: { width: 800, height: 800 },
    params: [{ key: "colors", label: "Colors", type: "strings", default: ["#8b7bff", "#5ee1ff"] }, num("speed", "Speed", 0, 4, 1, 0.1), num("wobble", "Wobble", 0, 1, 0.35, 0.05)],
  },
  geometric: {
    kind: "geometric",
    label: "Geometric motion",
    category: "Graphics",
    description: "Rotating geometric shapes field.",
    box: null,
    params: [num("count", "Count", 3, 60, 18, 1), { key: "colors", label: "Colors", type: "strings", default: ["#8b7bff", "#5ee1ff", "#ffffff"] }, num("speed", "Speed", 0, 4, 1, 0.1), { key: "style", label: "Style", type: "select", options: ["outline", "solid"], default: "outline" }],
  },
  "light-sweep": {
    kind: "light-sweep",
    label: "Light sweep",
    category: "Particles & light",
    description: "Specular shine sweeping across — great on logo reveals.",
    box: null,
    blendMode: "screen",
    params: [color("color", "Color", "#ffffff"), num("width", "Width", 2, 60, 18, 1), num("angle", "Angle", -80, 80, 20), num("intensity", "Intensity", 0, 1, 0.8, 0.05)],
  },
};

export function defaultParams(kind: EffectKind): Record<string, number | string | boolean | number[] | string[]> {
  const out: Record<string, number | string | boolean | number[] | string[]> = {};
  for (const p of EFFECTS[kind].params) out[p.key] = p.default;
  return out;
}
