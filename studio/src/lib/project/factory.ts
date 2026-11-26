import { nanoid } from "../id";
import { ASPECTS, Clip, ProjectDoc, Track, type Aspect, type ClipType, type TrackKind } from "./schema";

/** Build a fully-defaulted clip from a partial description (validated by zod). */
export function makeClip(partial: Record<string, unknown> & { type: ClipType }): Clip {
  return Clip.parse({ id: nanoid(), start: 0, duration: 90, ...partial });
}

export function makeTrack(kind: TrackKind, name?: string, clips: Clip[] = []): Track {
  return Track.parse({
    id: nanoid(),
    name: name ?? defaultTrackName(kind),
    kind,
    clips,
  });
}

export function defaultTrackName(kind: TrackKind): string {
  return { video: "Video", audio: "Audio", overlay: "Overlay", text: "Text", effects: "Effects" }[kind];
}

/** Which track kind a clip type naturally lives on. */
export function trackKindFor(type: ClipType): TrackKind {
  switch (type) {
    case "audio":
      return "audio";
    case "text":
      return "text";
    case "effect":
    case "adjustment":
      return "effects";
    case "shape":
      return "overlay";
    default:
      return "video";
  }
}

/** Clip types each track kind accepts. Audio tracks take only audio; visual tracks take any visual clip. */
export function trackAccepts(kind: TrackKind, type: ClipType): boolean {
  if (kind === "audio") return type === "audio";
  return type !== "audio";
}

export function newDocument(opts: { aspect?: Aspect; fps?: number; durationSec?: number; width?: number; height?: number } = {}): ProjectDoc {
  const [w, h] = opts.width && opts.height ? [opts.width, opts.height] : ASPECTS[opts.aspect ?? "16:9"];
  const fps = opts.fps ?? 30;
  return ProjectDoc.parse({
    settings: { width: w, height: h, fps, durationInFrames: Math.round((opts.durationSec ?? 10) * fps), background: "#000000" },
    tracks: [makeTrack("text", "Titles"), makeTrack("overlay", "Overlay"), makeTrack("video", "Video 1"), makeTrack("audio", "Music")],
  });
}

export function aspectOf(w: number, h: number): Aspect | "custom" {
  const r = w / h;
  const match = (Object.entries(ASPECTS) as [Aspect, readonly [number, number]][]).find(([, [aw, ah]]) => Math.abs(aw / ah - r) < 0.01);
  return match ? match[0] : "custom";
}
