/**
 * The Lumora project document.
 *
 * A project is ONE JSON document. The editor mutates it through pure operations
 * (./ops.ts), the preview player renders it with the Remotion composition in
 * src/remotion, and the render worker renders the exact same document — so what
 * you see in the editor is what you export.
 *
 * All times are integer frames at `settings.fps`. Clip-local keyframe frames are
 * relative to the clip's start.
 */
import { z } from "zod";

export const DOC_VERSION = 1;

/* ------------------------------------------------------------------ easing */

export const EasingName = z.enum([
  "linear",
  "easeIn",
  "easeOut",
  "easeInOut",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
  "easeOutBack",
  "spring",
  "bounce",
  "elastic",
  "hold",
]);
export type EasingName = z.infer<typeof EasingName>;

export const Easing = z.union([
  EasingName,
  z.object({ bezier: z.tuple([z.number(), z.number(), z.number(), z.number()]) }),
]);
export type Easing = z.infer<typeof Easing>;

/* --------------------------------------------------------------- keyframes */

export const ANIMATABLE_PROPS = [
  "x",
  "y",
  "scale",
  "scaleX",
  "scaleY",
  "rotation",
  "opacity",
  "blur",
  "brightness",
  "contrast",
  "saturation",
  "volume",
  "color",
  "skewX",
  "rotateY",
] as const;
export const AnimatableProp = z.enum(ANIMATABLE_PROPS);
export type AnimatableProp = z.infer<typeof AnimatableProp>;

export const Keyframe = z.object({
  id: z.string(),
  frame: z.number().int().min(0),
  value: z.union([z.number(), z.string()]),
  /** easing used when interpolating FROM this keyframe to the next one */
  easing: Easing.default("easeInOut"),
});
export type Keyframe = z.infer<typeof Keyframe>;

export const KeyframeMap = z.record(AnimatableProp, z.array(Keyframe)).default({});
export type KeyframeMap = Partial<Record<AnimatableProp, Keyframe[]>>;

/* ------------------------------------------------------- shared clip parts */

export const Transform = z.object({
  /** offset from canvas center in px (composition space) */
  x: z.number().default(0),
  y: z.number().default(0),
  scale: z.number().default(1),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  skewX: z.number().default(0),
  rotateY: z.number().default(0),
  /** layer box in px; null = fill canvas */
  width: z.number().nullable().default(null),
  height: z.number().nullable().default(null),
});
export type Transform = z.infer<typeof Transform>;

export const Effects = z.object({
  brightness: z.number().default(1), // 0..2
  contrast: z.number().default(1), // 0..2
  saturation: z.number().default(1), // 0..3
  exposure: z.number().default(0), // -2..2 stops
  temperature: z.number().default(0), // -1 (cool) .. 1 (warm)
  tint: z.number().default(0), // -1 (green) .. 1 (magenta)
  hue: z.number().default(0), // degrees
  blur: z.number().default(0), // px
  sharpen: z.number().default(0), // 0..1
  vignette: z.number().default(0), // 0..1
  grain: z.number().default(0), // 0..1
  grayscale: z.number().default(0), // 0..1
});
export type Effects = z.infer<typeof Effects>;

export const Crop = z.object({
  top: z.number().min(0).max(100).default(0),
  right: z.number().min(0).max(100).default(0),
  bottom: z.number().min(0).max(100).default(0),
  left: z.number().min(0).max(100).default(0),
});
export type Crop = z.infer<typeof Crop>;

export const Mask = z.object({
  shape: z.enum(["rect", "ellipse"]),
  /** percentages of the layer box */
  x: z.number().default(50),
  y: z.number().default(50),
  width: z.number().default(80),
  height: z.number().default(80),
  radius: z.number().default(0),
  feather: z.number().default(0),
  invert: z.boolean().default(false),
});
export type Mask = z.infer<typeof Mask>;

export const TRANSITION_TYPES = [
  "fade",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "zoom-in",
  "zoom-out",
  "wipe-left",
  "wipe-right",
  "circle",
  "blur",
  "glitch",
  "flash",
  "spin",
] as const;
export const TransitionType = z.enum(TRANSITION_TYPES);
export type TransitionType = z.infer<typeof TransitionType>;

export const Transition = z.object({
  type: TransitionType,
  duration: z.number().int().min(1).default(15),
  easing: Easing.default("easeInOutCubic"),
});
export type Transition = z.infer<typeof Transition>;

export const ANIMATION_PRESETS = [
  "fade",
  "slide",
  "pop",
  "bounce",
  "zoom",
  "rotate",
  "reveal",
  "mask-reveal",
  "blur-reveal",
  "typewriter",
  "glitch",
  "liquid",
  "flip-3d",
  "kinetic",
  "drift",
  "pulse",
  "float",
  "shake",
] as const;
export const AnimationPreset = z.enum(ANIMATION_PRESETS);
export type AnimationPreset = z.infer<typeof AnimationPreset>;

export const Direction = z.enum(["left", "right", "up", "down"]);

export const AnimationSpec = z.object({
  preset: AnimationPreset,
  duration: z.number().int().min(1).default(18),
  delay: z.number().int().min(0).default(0),
  easing: Easing.default("easeOutCubic"),
  direction: Direction.default("up"),
  /** 0..2 multiplier on travel distance / overshoot */
  intensity: z.number().default(1),
  /** text: per-letter/word stagger in frames */
  stagger: z.number().default(2),
  /** text: split unit for staggered presets */
  splitBy: z.enum(["letter", "word", "line"]).default("word"),
});
export type AnimationSpec = z.infer<typeof AnimationSpec>;

export const LoopSpec = z.object({
  preset: z.enum(["pulse", "float", "spin", "shake", "drift", "flicker"]),
  period: z.number().int().min(2).default(60),
  intensity: z.number().default(1),
});
export type LoopSpec = z.infer<typeof LoopSpec>;

const clipBase = {
  id: z.string(),
  name: z.string().default(""),
  start: z.number().int().min(0),
  duration: z.number().int().min(1),
  transform: Transform.default({}),
  keyframes: KeyframeMap,
  effects: Effects.default({}),
  crop: Crop.default({}),
  mask: Mask.nullable().default(null),
  blendMode: z
    .enum(["normal", "screen", "multiply", "overlay", "lighten", "darken", "soft-light", "difference", "color-dodge"])
    .default("normal"),
  transitionIn: Transition.nullable().default(null),
  transitionOut: Transition.nullable().default(null),
  animationIn: AnimationSpec.nullable().default(null),
  animationOut: AnimationSpec.nullable().default(null),
  loop: LoopSpec.nullable().default(null),
  groupId: z.string().nullable().default(null),
  /** AI provenance: which job generated this clip's media */
  aiJobId: z.string().nullable().default(null),
  locked: z.boolean().default(false),
};

/* ------------------------------------------------------------- clip types */

export const VideoClip = z.object({
  ...clipBase,
  type: z.literal("video"),
  assetId: z.string(),
  src: z.string(),
  /** source frame (in project fps) where playback starts */
  trimStart: z.number().int().min(0).default(0),
  /** source length in project frames, used to clamp trims */
  sourceDuration: z.number().int().min(1).nullable().default(null),
  speed: z.number().min(0.1).max(16).default(1),
  volume: z.number().min(0).max(4).default(1),
  muted: z.boolean().default(false),
  fadeIn: z.number().int().min(0).default(0),
  fadeOut: z.number().int().min(0).default(0),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
});

export const AudioClip = z.object({
  ...clipBase,
  type: z.literal("audio"),
  assetId: z.string(),
  src: z.string(),
  trimStart: z.number().int().min(0).default(0),
  sourceDuration: z.number().int().min(1).nullable().default(null),
  speed: z.number().min(0.1).max(16).default(1),
  volume: z.number().min(0).max(4).default(1),
  muted: z.boolean().default(false),
  fadeIn: z.number().int().min(0).default(0),
  fadeOut: z.number().int().min(0).default(0),
  /** beat markers (clip-local frames) from beat detection */
  beats: z.array(z.number().int()).default([]),
});

export const ImageClip = z.object({
  ...clipBase,
  type: z.literal("image"),
  assetId: z.string(),
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
  /** Ken Burns style slow push: 0 = static */
  kenBurns: z.number().default(0),
});

export const TextStyle = z.object({
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().default(96),
  fontWeight: z.number().default(700),
  italic: z.boolean().default(false),
  color: z.string().default("#ffffff"),
  align: z.enum(["left", "center", "right"]).default("center"),
  letterSpacing: z.number().default(0), // em
  lineHeight: z.number().default(1.1),
  textTransform: z.enum(["none", "uppercase", "lowercase"]).default("none"),
  strokeColor: z.string().nullable().default(null),
  strokeWidth: z.number().default(0),
  shadow: z.string().nullable().default(null), // css text-shadow
  glow: z.string().nullable().default(null), // neon glow color
  gradient: z.tuple([z.string(), z.string()]).nullable().default(null),
  background: z.string().nullable().default(null),
  padding: z.number().default(0),
  borderRadius: z.number().default(0),
  extrude: z.number().default(0), // 3D-style extrusion depth in px
  extrudeColor: z.string().default("#000000"),
});
export type TextStyle = z.infer<typeof TextStyle>;

export const CaptionWord = z.object({
  text: z.string(),
  start: z.number().int(), // clip-local frames
  end: z.number().int(),
  highlight: z.boolean().default(false),
});

export const TextClip = z.object({
  ...clipBase,
  type: z.literal("text"),
  text: z.string(),
  style: TextStyle.default({}),
  /** word timings for animated captions (karaoke highlight) */
  words: z.array(CaptionWord).nullable().default(null),
  highlightColor: z.string().default("#ffd84d"),
});

export const ShapeClip = z.object({
  ...clipBase,
  type: z.literal("shape"),
  shape: z.enum(["rect", "ellipse", "triangle", "star", "line", "arrow", "ring"]),
  fill: z.string().default("#8b7bff"),
  gradient: z.tuple([z.string(), z.string()]).nullable().default(null),
  stroke: z.string().nullable().default(null),
  strokeWidth: z.number().default(0),
  radius: z.number().default(0),
  /** 0..1 — animatable "draw on" for line/ring/arrow */
  progress: z.number().default(1),
});

export const SolidClip = z.object({
  ...clipBase,
  type: z.literal("solid"),
  color: z.string().default("#0b0d12"),
  gradient: z
    .object({
      kind: z.enum(["linear", "radial"]),
      angle: z.number().default(135),
      stops: z.array(z.tuple([z.string(), z.number()])),
    })
    .nullable()
    .default(null),
  /** animated gradient drift speed (0 = static) */
  drift: z.number().default(0),
});

export const AdjustmentClip = z.object({
  ...clipBase,
  type: z.literal("adjustment"),
  letterbox: z.number().default(0), // 0..0.25 of height per bar
});

export const EFFECT_KINDS = [
  "particles",
  "light-streaks",
  "glitch",
  "grid",
  "orbs",
  "lower-third",
  "bar-chart",
  "counter",
  "progress-bar",
  "light-leak",
  "film-grain",
  "hud",
  "scanlines",
  "neon-frame",
  "confetti",
  "smoke",
  "fire",
  "liquid-blob",
  "geometric",
  "light-sweep",
] as const;
export const EffectKind = z.enum(EFFECT_KINDS);
export type EffectKind = z.infer<typeof EffectKind>;

export const EffectClip = z.object({
  ...clipBase,
  type: z.literal("effect"),
  effect: EffectKind,
  /** effect-specific parameters; documented per effect in src/lib/motion/effects.ts */
  params: z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.array(z.number()), z.array(z.string())])).default({}),
  seed: z.number().int().default(1),
});

/**
 * A storyboard scene slot created by the AI Director. It renders the scene's
 * art-directed motion layout (gradient, title) until real footage is generated
 * or dropped onto it — it never pretends to be generated footage.
 */
export const SceneClip = z.object({
  ...clipBase,
  type: z.literal("scene"),
  sceneIndex: z.number().int(),
  title: z.string(),
  description: z.string(),
  visualPrompt: z.string(),
  camera: z.string().default(""),
  palette: z.array(z.string()).default(["#0b0d12", "#1e232e", "#8b7bff"]),
  status: z.enum(["planned", "generating", "failed"]).default("planned"),
  error: z.string().nullable().default(null),
});

export const Clip = z.discriminatedUnion("type", [
  VideoClip,
  AudioClip,
  ImageClip,
  TextClip,
  ShapeClip,
  SolidClip,
  AdjustmentClip,
  EffectClip,
  SceneClip,
]);
export type Clip = z.infer<typeof Clip>;
export type ClipType = Clip["type"];
export type ClipOf<T extends ClipType> = Extract<Clip, { type: T }>;
export type VisualClip = Exclude<Clip, { type: "audio" }>;

/* ------------------------------------------------------------------ tracks */

export const TrackKind = z.enum(["video", "audio", "overlay", "text", "effects"]);
export type TrackKind = z.infer<typeof TrackKind>;

export const Track = z.object({
  id: z.string(),
  name: z.string(),
  kind: TrackKind,
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  muted: z.boolean().default(false),
  volume: z.number().default(1),
  clips: z.array(Clip).default([]),
});
export type Track = z.infer<typeof Track>;

/* --------------------------------------------------------------- document */

export const Marker = z.object({
  id: z.string(),
  frame: z.number().int(),
  label: z.string(),
  color: z.string().default("#ffb65e"),
});

export const ProjectSettings = z.object({
  width: z.number().int().min(16).max(7680),
  height: z.number().int().min(16).max(7680),
  fps: z.number().int().min(1).max(120),
  durationInFrames: z.number().int().min(1),
  background: z.string().default("#000000"),
});
export type ProjectSettings = z.infer<typeof ProjectSettings>;

export const AiHistoryEntry = z.object({
  id: z.string(),
  at: z.string(),
  kind: z.enum(["director", "assistant", "generation", "motion"]),
  prompt: z.string(),
  summary: z.string(),
  engine: z.string(),
});

export const StoryboardScene = z.object({
  title: z.string(),
  durationSec: z.number(),
  description: z.string(),
  visualPrompt: z.string(),
  camera: z.string().default(""),
  lighting: z.string().default(""),
  onScreenText: z.string().default(""),
  transition: TransitionType.default("fade"),
  motion: z.string().default(""),
});
export type StoryboardScene = z.infer<typeof StoryboardScene>;

export const ProductionPlan = z.object({
  title: z.string(),
  category: z.string(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]),
  durationSec: z.number(),
  creativeDirection: z.object({
    summary: z.string(),
    visualStyle: z.string(),
    palette: z.array(z.string()).min(2).max(6),
    typography: z.object({ headline: z.string(), body: z.string() }),
    music: z.string(),
    pacing: z.string(),
    lighting: z.string().default(""),
  }),
  scenes: z.array(StoryboardScene).min(1).max(24),
});
export type ProductionPlan = z.infer<typeof ProductionPlan>;

export const ProjectDoc = z.object({
  version: z.literal(DOC_VERSION).default(DOC_VERSION),
  settings: ProjectSettings,
  tracks: z.array(Track),
  markers: z.array(Marker).default([]),
  plan: ProductionPlan.nullable().default(null),
  aiHistory: z.array(AiHistoryEntry).default([]),
  brandKitId: z.string().nullable().default(null),
});
export type ProjectDoc = z.infer<typeof ProjectDoc>;

export function parseDoc(input: unknown): ProjectDoc {
  return ProjectDoc.parse(input);
}

/* --------------------------------------------------------------- exports */

export const EXPORT_RESOLUTIONS = { "720p": 720, "1080p": 1080, "2k": 1440, "4k": 2160 } as const;
export const ExportSettings = z.object({
  format: z.enum(["mp4", "webm", "mov", "gif"]).default("mp4"),
  resolution: z.enum(["720p", "1080p", "2k", "4k"]).default("1080p"),
  fps: z.union([z.literal(24), z.literal(25), z.literal(30), z.literal(50), z.literal(60)]).default(30),
  aspectRatio: z.enum(["project", "16:9", "9:16", "1:1", "4:5"]).default("project"),
  quality: z.enum(["draft", "standard", "high", "master"]).default("high"),
  watermark: z.boolean().default(false),
  watermarkText: z.string().default("Made with Lumora"),
  includeAudio: z.boolean().default(true),
  range: z.object({ start: z.number().int(), end: z.number().int() }).nullable().default(null),
});
export type ExportSettings = z.infer<typeof ExportSettings>;

export const ASPECTS = {
  "16:9": [1920, 1080],
  "9:16": [1080, 1920],
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
} as const;
export type Aspect = keyof typeof ASPECTS;
