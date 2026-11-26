/**
 * Auto Edit: edit plan schema, the deterministic plan → timeline builder, and a
 * rule-based fallback planner (used when Claude is not connected).
 * Everything produced is a normal editable project.
 */
import { z } from "zod";
import { makeClip, makeTrack, newDocument } from "../project/factory";
import { ProjectDoc, TransitionType, type Aspect, type Clip } from "../project/schema";
import { nanoid } from "../id";
import { captionClips, type Word } from "./captions";
import type { StyleProfile } from "./edit-styles";

export const EditPlan = z.object({
  title: z.string().default("Auto edit"),
  summary: z.string().default(""),
  segments: z
    .array(
      z.object({
        source: z.number().int().min(0).default(0),
        start: z.number(),
        end: z.number(),
        reason: z.string().default(""),
        speed: z.number().min(0.25).max(4).default(1),
        zoom: z.enum(["none", "punch-in", "slow-push", "pull-out"]).default("none"),
        transition: TransitionType.nullable().default(null),
      }),
    )
    .min(1),
  titles: z
    .array(
      z.object({
        text: z.string().min(1).max(120),
        at: z.number().min(0),
        duration: z.number().min(0.4).max(20),
        kind: z.enum(["headline", "lower-third", "caption", "cta"]).default("headline"),
      }),
    )
    .default([]),
  grade: z
    .object({ brightness: z.number(), contrast: z.number(), saturation: z.number(), temperature: z.number(), tint: z.number(), vignette: z.number(), grain: z.number() })
    .partial()
    .default({}),
  overlays: z.array(z.enum(["film-grain", "light-leak", "light-streaks", "particles", "glitch", "scanlines"])).default([]),
  letterbox: z.number().min(0).max(0.25).default(0),
  keepOriginalAudio: z.boolean().default(true),
  musicVolume: z.number().min(0).max(1).default(0.5),
});
export type EditPlan = z.infer<typeof EditPlan>;

export interface SourceInfo {
  assetId: string;
  src: string;
  name: string;
  durationSec: number;
  hasAudio: boolean;
  silences: { start: number; end: number }[];
  scenes: number[];
  words?: Word[] | null;
}

export interface MusicInfo {
  assetId: string;
  src: string;
  durationSec: number;
  beats: number[];
}

const FPS = 30;

/** Clamp a plan to the real sources so the AI can never reference footage that doesn't exist. */
export function sanitizePlan(plan: EditPlan, sources: SourceInfo[]): EditPlan {
  const segments = plan.segments
    .map((s) => {
      const src = sources[s.source] ?? sources[0];
      const idx = sources[s.source] ? s.source : 0;
      const start = Math.max(0, Math.min(s.start, src.durationSec - 0.2));
      const end = Math.max(start + 0.2, Math.min(s.end, src.durationSec));
      return { ...s, source: idx, start, end };
    })
    .filter((s) => s.end - s.start >= 0.2);
  return { ...plan, segments: segments.length ? segments : [{ source: 0, start: 0, end: Math.min(sources[0].durationSec, 10), reason: "fallback", speed: 1, zoom: "none", transition: null }] };
}

/** Nudge cut points onto music beats (±0.18s) when the style cuts on the beat. */
function beatSync(lengths: number[], beats: number[]): number[] {
  if (!beats.length) return lengths;
  const out: number[] = [];
  let t = 0;
  for (const len of lengths) {
    const target = t + len;
    const near = beats.reduce((best, b) => (Math.abs(b - target) < Math.abs(best - target) ? b : best), beats[0]);
    const adjusted = Math.abs(near - target) <= 0.18 && near - t > 0.25 ? near - t : len;
    out.push(adjusted);
    t += adjusted;
  }
  return out;
}

export function buildEditDoc(opts: { plan: EditPlan; style: StyleProfile; sources: SourceInfo[]; music?: MusicInfo | null; aspect: Aspect; targetDurationSec?: number | null }): ProjectDoc {
  const { style, sources, music } = opts;
  const plan = sanitizePlan(opts.plan, sources);
  const doc = newDocument({ aspect: opts.aspect, fps: FPS });
  const { width, height } = doc.settings;
  const short = Math.min(width, height);

  // segment lengths on the timeline (seconds), optionally beat-synced
  let lengths = plan.segments.map((s) => (s.end - s.start) / s.speed);
  if (style.cutOnBeat && music?.beats.length) lengths = beatSync(lengths, music.beats);

  const videoTrack = makeTrack("video", "Edit");
  let cursor = 0;
  const transitionFrames = 8;
  plan.segments.forEach((s, i) => {
    const src = sources[s.source];
    const dur = Math.max(6, Math.round(lengths[i] * FPS));
    const sourceFrames = Math.round(src.durationSec * FPS);
    const clip = makeClip({
      type: "video",
      name: s.reason ? `${i + 1}. ${s.reason}`.slice(0, 60) : `${src.name} ${s.start.toFixed(1)}s`,
      assetId: src.assetId,
      src: src.src,
      start: cursor,
      duration: dur,
      trimStart: Math.round(s.start * FPS),
      sourceDuration: sourceFrames,
      speed: s.speed,
      muted: !opts.plan.keepOriginalAudio || !src.hasAudio,
      fit: "cover",
      fadeIn: i === 0 ? 6 : 0,
      fadeOut: i === plan.segments.length - 1 ? 12 : 0,
      transitionIn: s.transition && i > 0 ? { type: s.transition, duration: Math.min(transitionFrames, Math.floor(dur / 3)), easing: "easeInOutCubic" } : i === 0 ? { type: "fade", duration: 8, easing: "easeOutCubic" } : null,
      transitionOut: i === plan.segments.length - 1 ? { type: "fade", duration: 12, easing: "easeInCubic" } : null,
    }) as Extract<Clip, { type: "video" }>;
    if (s.zoom === "punch-in") clip.keyframes = { scale: [{ id: nanoid(), frame: 0, value: 1.12, easing: "hold" }] };
    if (s.zoom === "slow-push") clip.keyframes = { scale: [{ id: nanoid(), frame: 0, value: 1, easing: "linear" }, { id: nanoid(), frame: dur - 1, value: 1.08, easing: "linear" }] };
    if (s.zoom === "pull-out") clip.keyframes = { scale: [{ id: nanoid(), frame: 0, value: 1.12, easing: "easeOutCubic" }, { id: nanoid(), frame: dur - 1, value: 1, easing: "linear" }] };
    videoTrack.clips.push(clip);
    cursor += dur;
  });
  const total = cursor;

  // titles
  const titleTrack = makeTrack("text", "Titles");
  const ts = style.textStyle ?? {};
  for (const t of plan.titles) {
    const start = Math.min(total - 10, Math.max(0, Math.round(t.at * FPS)));
    const duration = Math.max(10, Math.min(total - start, Math.round(t.duration * FPS)));
    if (duration <= 0) continue;
    const base = { type: "text" as const, name: t.kind, text: t.text, start, duration };
    const font = t.kind === "headline" || t.kind === "cta" ? ts.headlineFont ?? "Syne" : ts.bodyFont ?? "Inter";
    if (t.kind === "lower-third") {
      titleTrack.clips.push(makeClip({ ...base, transform: { x: Math.round(-width * 0.2), y: Math.round(height * 0.32), width: Math.round(width * 0.55), height: Math.round(short * 0.12) }, style: { fontFamily: font, fontSize: Math.round(short * 0.045), fontWeight: 700, align: "left", color: ts.color ?? "#fff", background: "rgba(0,0,0,0.55)", padding: Math.round(short * 0.015), borderRadius: 8 }, animationIn: { preset: "slide", duration: 12, direction: "right" }, animationOut: { preset: "fade", duration: 8 } }));
    } else if (t.kind === "caption") {
      titleTrack.clips.push(makeClip({ ...base, transform: { y: Math.round(height * 0.3), width: Math.round(width * 0.86), height: Math.round(short * 0.2) }, style: { fontFamily: font, fontSize: Math.round(short * 0.06), fontWeight: 800, color: ts.color ?? "#fff", strokeColor: "#000000", strokeWidth: 3, textTransform: ts.uppercase ? "uppercase" : "none" }, animationIn: { preset: "pop", duration: 6 } }));
    } else {
      const cta = t.kind === "cta";
      titleTrack.clips.push(
        makeClip({
          ...base,
          transform: { y: cta ? 0 : Math.round(-height * 0.05), width: Math.round(width * 0.88), height: Math.round(short * 0.35) },
          style: { fontFamily: font, fontSize: Math.round(short * (cta ? 0.075 : 0.095)), fontWeight: 800, color: ts.color ?? "#fff", textTransform: ts.uppercase ? "uppercase" : "none", shadow: "0 6px 30px rgba(0,0,0,0.55)", ...(cta && ts.accent ? { background: ts.accent, padding: Math.round(short * 0.02), borderRadius: 999 } : {}) },
          animationIn: { preset: cta ? "pop" : "kinetic", duration: 16, splitBy: "word", easing: cta ? "easeOutBack" : "easeOutCubic" },
          animationOut: { preset: "fade", duration: 8 },
        }),
      );
    }
  }

  // captions from transcripts (word-timed karaoke)
  const captionsTrack = makeTrack("text", "Captions");
  if (style.captions !== "none") {
    let segStart = 0;
    plan.segments.forEach((s, i) => {
      const src = sources[s.source];
      const words = (src.words ?? []).filter((w) => w.start >= s.start && w.end <= s.end + 0.05);
      if (words.length) {
        const capStyle =
          style.captions === "clean"
            ? { fontFamily: ts.bodyFont ?? "Inter", fontSize: Math.round(short * 0.05), fontWeight: 600, background: "rgba(0,0,0,0.6)", padding: Math.round(short * 0.012), borderRadius: 10 }
            : { fontFamily: ts.headlineFont ?? "Montserrat", fontSize: Math.round(short * 0.072), fontWeight: 900, textTransform: "uppercase", strokeColor: "#000000", strokeWidth: 3 };
        const clips = captionClips(words, { fps: FPS, offsetFrames: segStart, trimStartFrames: Math.round(s.start * FPS), speed: s.speed, style: capStyle, y: Math.round(height * 0.3), width: Math.round(width * 0.86), maxWords: style.captions === "clean" ? 7 : 4 });
        const segEnd = segStart + Math.round(lengths[i] * FPS);
        for (const c of clips) {
          const end = Math.min(c.start + c.duration, segEnd);
          if (end - c.start < 4) continue;
          captionsTrack.clips.push(makeClip({ ...c, duration: end - c.start, highlightColor: ts.accent ?? "#ffd84d" }));
        }
      }
      segStart += Math.round(lengths[i] * FPS);
    });
    // resolve any overlaps between adjacent captions
    captionsTrack.clips.sort((a, b) => a.start - b.start);
    for (let i = 1; i < captionsTrack.clips.length; i++) {
      const prev = captionsTrack.clips[i - 1];
      if (prev.start + prev.duration > captionsTrack.clips[i].start) prev.duration = Math.max(2, captionsTrack.clips[i].start - prev.start);
    }
  }

  // grade + overlays
  const fx = makeTrack("effects", "Look");
  const grade = { ...style.grade, ...plan.grade };
  const letterbox = plan.letterbox || style.letterbox;
  if (Object.keys(grade).length || letterbox) fx.clips.push(makeClip({ type: "adjustment", name: `${style.name} grade`, start: 0, duration: total, effects: grade, letterbox }));
  const overlayTracks = [...new Set([...plan.overlays, ...style.overlays])].slice(0, 3).map((o) =>
    makeTrack("effects", `Overlay: ${o}`, [makeClip({ type: "effect", effect: o, name: o, start: 0, duration: total, blendMode: o === "film-grain" ? "overlay" : "screen", params: o === "film-grain" ? { amount: 0.22 } : o === "light-leak" ? { intensity: 0.35 } : {} })]),
  );

  // music
  const musicTrack = makeTrack("audio", "Music");
  if (music) {
    musicTrack.clips.push(
      makeClip({ type: "audio", name: "Music", assetId: music.assetId, src: music.src, start: 0, duration: Math.min(total, Math.round(music.durationSec * FPS)), sourceDuration: Math.round(music.durationSec * FPS), volume: opts.plan.keepOriginalAudio ? Math.min(0.35, opts.plan.musicVolume) : opts.plan.musicVolume, fadeIn: 10, fadeOut: 30 }),
    );
  }

  doc.tracks = [captionsTrack, titleTrack, ...overlayTracks, fx, videoTrack, musicTrack].filter((t) => t.clips.length || t.kind === "video" || t.kind === "audio");
  doc.settings.durationInFrames = Math.max(FPS, total);
  return ProjectDoc.parse(doc);
}

/**
 * BASIC AUTO EDITOR (no AI): removes silences, splits at shot changes into
 * style-length pieces, keeps footage in order until the target duration.
 */
export function basicEditPlan(sources: SourceInfo[], style: StyleProfile, targetDurationSec: number | null): EditPlan {
  const pieces: EditPlan["segments"] = [];
  sources.forEach((src, si) => {
    // non-silent ranges
    let ranges: { start: number; end: number }[] = [{ start: 0, end: src.durationSec }];
    if (style.removeSilences && src.silences.length) {
      ranges = [];
      let t = 0;
      for (const s of src.silences) {
        if (s.start - t > 0.3) ranges.push({ start: Math.max(0, t - 0.05), end: Math.min(src.durationSec, s.start + 0.12) });
        t = s.end;
      }
      if (src.durationSec - t > 0.3) ranges.push({ start: Math.max(0, t - 0.05), end: src.durationSec });
    }
    for (const r of ranges) {
      // split at scene changes, then into style-length chunks (only for non-speech styles)
      const cuts = [r.start, ...src.scenes.filter((c) => c > r.start + 0.3 && c < r.end - 0.3), r.end];
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i];
        const b = cuts[i + 1];
        const chunk = style.captions === "karaoke" || style.captions === "clean" ? b - a : Math.max(style.avgShotSec, 0.5);
        for (let t = a; t < b - 0.2; t += chunk) pieces.push({ source: si, start: t, end: Math.min(b, t + chunk), reason: "", speed: 1, zoom: "none", transition: null });
      }
    }
  });
  // fit to target
  let segs = pieces;
  const total = segs.reduce((s, x) => s + x.end - x.start, 0);
  if (targetDurationSec && total > targetDurationSec) {
    const speech = sources.some((s) => s.hasAudio && s.silences.length > 0);
    const keep: typeof segs = [];
    let acc = 0;
    if (speech) {
      // talking footage: keep takes contiguous and in order (never skip parts of sentences), stop at the target
      for (const s of segs) {
        if (acc >= targetDurationSec) break;
        const len = Math.min(s.end - s.start, targetDurationSec - acc);
        if (len < 0.3) break;
        keep.push({ ...s, end: s.start + len });
        acc += len;
      }
    } else {
      // montage footage: sample evenly across everything, keeping order
      const ratio = targetDurationSec / total;
      let budget = 0;
      for (const s of segs) {
        budget += (s.end - s.start) * ratio;
        if (budget >= (s.end - s.start) * 0.5 && acc < targetDurationSec) {
          const len = Math.min(s.end - s.start, targetDurationSec - acc);
          keep.push({ ...s, end: s.start + len });
          acc += len;
          budget -= len;
        }
      }
    }
    segs = keep;
  }
  const zoomFor = (i: number) => (style.zoom === "punch-in" ? (i % 3 === 1 ? "punch-in" : "none") : style.zoom === "slow-push" ? "slow-push" : style.zoom === "mixed" ? (["punch-in", "slow-push", "none"] as const)[i % 3] : "none");
  segs = segs.map((s, i) => ({ ...s, zoom: zoomFor(i), transition: style.transitions.length && i > 0 && i % 2 === 0 ? style.transitions[i % style.transitions.length] : null }));
  return EditPlan.parse({ title: `${style.name} edit`, summary: "Basic auto edit (no AI): silences removed, cut at shot changes and paced to the style.", segments: segs.length ? segs : [{ source: 0, start: 0, end: Math.min(sources[0].durationSec, targetDurationSec ?? 15) }], titles: [], keepOriginalAudio: true });
}
