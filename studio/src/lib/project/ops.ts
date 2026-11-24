/**
 * Editing command system.
 *
 * Every change to a project — from a timeline drag, the inspector, a template,
 * or the AI assistant — is expressed as a serializable EditCommand and applied by
 * the pure function `applyCommands`. This gives us:
 *  - one code path for UI and AI edits (the AI can only do what the editor can do)
 *  - previews (apply to a copy, show the result, then commit)
 *  - undo/redo (history stores whole immutable documents)
 */
import { z } from "zod";
import { nanoid } from "../id";
import { bakePresets } from "../motion/presets";
import { makeClip, makeTrack, trackAccepts, trackKindFor } from "./factory";
import {
  ASPECTS,
  AnimatableProp,
  AnimationSpec,
  Clip,
  Easing,
  LoopSpec,
  ProjectDoc,
  Transition,
  TrackKind,
  type Track,
} from "./schema";

const ClipPartial = z.record(z.string(), z.unknown());

export const EditCommand = z.discriminatedUnion("op", [
  z.object({ op: z.literal("addTrack"), kind: TrackKind, name: z.string().optional(), index: z.number().int().optional(), id: z.string().optional() }),
  z.object({ op: z.literal("removeTrack"), trackId: z.string() }),
  z.object({
    op: z.literal("updateTrack"),
    trackId: z.string(),
    patch: z.object({ name: z.string(), locked: z.boolean(), hidden: z.boolean(), muted: z.boolean(), volume: z.number() }).partial(),
  }),
  z.object({ op: z.literal("moveTrack"), trackId: z.string(), toIndex: z.number().int() }),
  z.object({
    op: z.literal("addClip"),
    trackId: z.string().optional(),
    /** partial clip; `type` required. Missing fields get defaults. */
    clip: ClipPartial.and(z.object({ type: z.string() })),
    /** if the slot is occupied, create/choose a free track instead of overlapping */
    avoidOverlap: z.boolean().optional(),
  }),
  z.object({ op: z.literal("updateClip"), clipId: z.string(), patch: ClipPartial }),
  z.object({ op: z.literal("removeClips"), clipIds: z.array(z.string()), ripple: z.boolean().optional() }),
  z.object({ op: z.literal("moveClip"), clipId: z.string(), start: z.number().int(), trackId: z.string().optional() }),
  z.object({ op: z.literal("trimClip"), clipId: z.string(), edge: z.enum(["start", "end"]), frame: z.number().int() }),
  z.object({ op: z.literal("splitClip"), clipId: z.string(), frame: z.number().int() }),
  z.object({ op: z.literal("splitAt"), frame: z.number().int(), clipIds: z.array(z.string()).optional() }),
  z.object({ op: z.literal("duplicateClips"), clipIds: z.array(z.string()), offset: z.number().int().optional() }),
  z.object({
    op: z.literal("setKeyframe"),
    clipId: z.string(),
    prop: AnimatableProp,
    frame: z.number().int().min(0),
    value: z.union([z.number(), z.string()]),
    easing: Easing.optional(),
  }),
  z.object({ op: z.literal("removeKeyframe"), clipId: z.string(), prop: AnimatableProp, keyframeId: z.string() }),
  z.object({ op: z.literal("clearKeyframes"), clipId: z.string(), prop: AnimatableProp.optional() }),
  z.object({ op: z.literal("setTransition"), clipId: z.string(), side: z.enum(["in", "out"]), transition: Transition.nullable() }),
  z.object({ op: z.literal("setAnimation"), clipId: z.string(), side: z.enum(["in", "out"]), animation: AnimationSpec.nullable() }),
  z.object({ op: z.literal("setLoop"), clipId: z.string(), loop: LoopSpec.nullable() }),
  z.object({ op: z.literal("bakeAnimation"), clipId: z.string() }),
  z.object({ op: z.literal("setSpeed"), clipId: z.string(), speed: z.number().min(0.1).max(16) }),
  z.object({ op: z.literal("group"), clipIds: z.array(z.string()).min(2) }),
  z.object({ op: z.literal("ungroup"), groupId: z.string() }),
  z.object({
    op: z.literal("setSettings"),
    patch: z.object({ fps: z.number().int(), durationInFrames: z.number().int(), background: z.string(), width: z.number().int(), height: z.number().int() }).partial(),
  }),
  z.object({ op: z.literal("changeAspect"), aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]) }),
  z.object({ op: z.literal("closeGaps"), trackId: z.string().optional() }),
  z.object({ op: z.literal("addMarker"), frame: z.number().int(), label: z.string(), color: z.string().optional() }),
  z.object({ op: z.literal("removeMarker"), markerId: z.string() }),
  z.object({
    op: z.literal("updateClips"),
    /** apply the same patch to many clips (e.g. color grade everything) */
    clipIds: z.array(z.string()).optional(),
    types: z.array(z.string()).optional(),
    patch: ClipPartial,
  }),
]);
export type EditCommand = z.infer<typeof EditCommand>;

export class CommandError extends Error {}

/* ------------------------------------------------------------- helpers */

export function allClips(doc: ProjectDoc): Clip[] {
  return doc.tracks.flatMap((t) => t.clips);
}

export function findClip(doc: ProjectDoc, clipId: string): { track: Track; clip: Clip; index: number } | null {
  for (const track of doc.tracks) {
    const index = track.clips.findIndex((c) => c.id === clipId);
    if (index >= 0) return { track, clip: track.clips[index], index };
  }
  return null;
}

function mustFind(doc: ProjectDoc, clipId: string) {
  const f = findClip(doc, clipId);
  if (!f) throw new CommandError(`Clip ${clipId} not found`);
  return f;
}

function trackById(doc: ProjectDoc, id: string): Track {
  const t = doc.tracks.find((x) => x.id === id);
  if (!t) throw new CommandError(`Track ${id} not found`);
  return t;
}

export function clipEnd(c: Clip) {
  return c.start + c.duration;
}

function overlaps(track: Track, start: number, duration: number, ignoreId?: string) {
  return track.clips.some((c) => c.id !== ignoreId && start < clipEnd(c) && start + duration > c.start);
}

function sortTrack(t: Track) {
  t.clips.sort((a, b) => a.start - b.start);
}

const DEEP_KEYS = new Set(["transform", "effects", "crop", "style", "mask", "params"]);

function mergeClip(clip: Clip, patch: Record<string, unknown>): Clip {
  const next: Record<string, unknown> = { ...clip };
  for (const [k, v] of Object.entries(patch)) {
    if (k === "id" || k === "type") continue;
    const cur = (clip as Record<string, unknown>)[k];
    if (DEEP_KEYS.has(k) && v && typeof v === "object" && !Array.isArray(v) && cur && typeof cur === "object") {
      next[k] = { ...(cur as object), ...(v as object) };
    } else {
      next[k] = v;
    }
  }
  return Clip.parse(next);
}

/** Recompute duration: end of last clip (min 1s). */
export function recomputeDuration(doc: ProjectDoc) {
  const end = allClips(doc).reduce((m, c) => Math.max(m, clipEnd(c)), 0);
  doc.settings.durationInFrames = Math.max(end, doc.settings.fps);
}

function pickTrackFor(doc: ProjectDoc, clip: Clip, avoidOverlap: boolean): Track {
  const kind = trackKindFor(clip.type);
  const candidates = doc.tracks.filter((t) => t.kind === kind && !t.locked);
  const free = candidates.find((t) => !overlaps(t, clip.start, clip.duration));
  if (free) return free;
  if (!avoidOverlap && candidates[0]) return candidates[0];
  const t = makeTrack(kind, `${kind === "audio" ? "Audio" : kind[0].toUpperCase() + kind.slice(1)} ${candidates.length + 1}`);
  // visual tracks: new tracks go above existing tracks of the same kind; audio at bottom
  const firstIdx = doc.tracks.findIndex((x) => x.kind === kind);
  if (kind === "audio" || firstIdx < 0) doc.tracks.push(t);
  else doc.tracks.splice(firstIdx, 0, t);
  return t;
}

/** Source frames consumed per timeline frame. */
function rate(c: Clip) {
  return c.type === "video" || c.type === "audio" ? c.speed : 1;
}

function splitOne(doc: ProjectDoc, clipId: string, frame: number): string | null {
  const { track, clip, index } = mustFind(doc, clipId);
  if (frame <= clip.start || frame >= clipEnd(clip)) return null;
  const leftDur = frame - clip.start;
  const left = Clip.parse({ ...clip, duration: leftDur, transitionOut: null, animationOut: null });
  const rightPatch: Record<string, unknown> = {
    ...clip,
    id: nanoid(),
    start: frame,
    duration: clip.duration - leftDur,
    transitionIn: null,
    animationIn: null,
    keyframes: shiftKeyframes(clip.keyframes, -leftDur),
  };
  if (clip.type === "video" || clip.type === "audio") {
    rightPatch.trimStart = clip.trimStart + Math.round(leftDur * rate(clip));
    if (clip.type === "audio") rightPatch.beats = clip.beats.map((b) => b - leftDur).filter((b) => b >= 0);
  }
  if (clip.type === "text" && clip.words) {
    rightPatch.words = clip.words.map((w) => ({ ...w, start: w.start - leftDur, end: w.end - leftDur })).filter((w) => w.end > 0);
  }
  const right = Clip.parse(rightPatch);
  track.clips.splice(index, 1, left, right);
  return right.id;
}

function shiftKeyframes(map: Clip["keyframes"], delta: number): Clip["keyframes"] {
  const out: Clip["keyframes"] = {};
  for (const [prop, list] of Object.entries(map ?? {})) {
    if (!list?.length) continue;
    const shifted = list.map((k) => ({ ...k, frame: k.frame + delta }));
    // keep one keyframe at/before 0 so the value at the cut is preserved
    const before = shifted.filter((k) => k.frame <= 0).sort((a, b) => b.frame - a.frame)[0];
    const kept = shifted.filter((k) => k.frame > 0);
    if (before) kept.unshift({ ...before, frame: 0 });
    out[prop as AnimatableProp] = kept;
  }
  return out;
}

/* ----------------------------------------------------------- reframing */

/** Change canvas aspect, keeping layers centred and scaling full-frame media to cover. */
export function reframe(doc: ProjectDoc, w: number, h: number) {
  const { width: ow, height: oh } = doc.settings;
  if (ow === w && oh === h) return;
  const sx = w / ow;
  const sy = h / oh;
  const s = Math.min(sx, sy);
  for (const t of doc.tracks)
    for (const c of t.clips) {
      if (c.type === "audio") continue;
      const tr = c.transform;
      tr.x = Math.round(tr.x * sx);
      tr.y = Math.round(tr.y * sy);
      if (tr.width !== null) tr.width = Math.round(tr.width * s);
      if (tr.height !== null) tr.height = Math.round(tr.height * s);
      if (c.type === "text") c.style.fontSize = Math.round(c.style.fontSize * Math.max(s, Math.min(sx, sy)));
      for (const prop of ["x", "y"] as const) for (const k of c.keyframes[prop] ?? []) if (typeof k.value === "number") k.value = Math.round(k.value * (prop === "x" ? sx : sy));
    }
  doc.settings.width = w;
  doc.settings.height = h;
}

/** Convert all frame values to a new fps (used by export fps override and project settings). */
export function retime(doc: ProjectDoc, fps: number) {
  const r = fps / doc.settings.fps;
  if (r === 1) return;
  const f = (n: number) => Math.round(n * r);
  for (const t of doc.tracks)
    for (const c of t.clips) {
      c.start = f(c.start);
      c.duration = Math.max(1, f(c.duration));
      for (const list of Object.values(c.keyframes)) for (const k of list ?? []) k.frame = f(k.frame);
      for (const tr of [c.transitionIn, c.transitionOut]) if (tr) tr.duration = Math.max(1, f(tr.duration));
      for (const a of [c.animationIn, c.animationOut]) if (a) {
        a.duration = Math.max(1, f(a.duration));
        a.delay = f(a.delay);
        a.stagger = a.stagger * r;
      }
      if (c.loop) c.loop.period = Math.max(2, f(c.loop.period));
      if (c.type === "video" || c.type === "audio") {
        c.trimStart = f(c.trimStart);
        if (c.sourceDuration) c.sourceDuration = f(c.sourceDuration);
        c.fadeIn = f(c.fadeIn);
        c.fadeOut = f(c.fadeOut);
      }
      if (c.type === "audio") c.beats = c.beats.map(f);
      if (c.type === "text" && c.words) c.words = c.words.map((w) => ({ ...w, start: f(w.start), end: f(w.end) }));
    }
  for (const m of doc.markers) m.frame = f(m.frame);
  doc.settings.fps = fps;
  doc.settings.durationInFrames = Math.max(1, f(doc.settings.durationInFrames));
}

/* ------------------------------------------------------------- apply */

export interface ApplyResult {
  doc: ProjectDoc;
  /** ids of clips created by the commands (useful for selection) */
  created: string[];
  warnings: string[];
}

export function applyCommands(input: ProjectDoc, commands: EditCommand[]): ApplyResult {
  const doc: ProjectDoc = structuredClone(input);
  const created: string[] = [];
  const warnings: string[] = [];

  for (const raw of commands) {
    const cmd = EditCommand.parse(raw);
    switch (cmd.op) {
      case "addTrack": {
        const t = makeTrack(cmd.kind, cmd.name);
        if (cmd.id) t.id = cmd.id;
        const idx = cmd.index ?? (cmd.kind === "audio" ? doc.tracks.length : Math.max(0, doc.tracks.findIndex((x) => x.kind === cmd.kind)));
        doc.tracks.splice(Math.min(Math.max(0, idx), doc.tracks.length), 0, t);
        break;
      }
      case "removeTrack":
        doc.tracks = doc.tracks.filter((t) => t.id !== cmd.trackId);
        break;
      case "updateTrack":
        Object.assign(trackById(doc, cmd.trackId), cmd.patch);
        break;
      case "moveTrack": {
        const i = doc.tracks.findIndex((t) => t.id === cmd.trackId);
        if (i < 0) throw new CommandError("Track not found");
        const [t] = doc.tracks.splice(i, 1);
        doc.tracks.splice(Math.min(Math.max(0, cmd.toIndex), doc.tracks.length), 0, t);
        break;
      }
      case "addClip": {
        const clip = makeClip(cmd.clip as Record<string, unknown> & { type: Clip["type"] });
        let track: Track;
        if (cmd.trackId) {
          track = trackById(doc, cmd.trackId);
          if (!trackAccepts(track.kind, clip.type)) throw new CommandError(`A ${clip.type} clip can't go on a ${track.kind} track`);
          if (cmd.avoidOverlap && overlaps(track, clip.start, clip.duration)) track = pickTrackFor(doc, clip, true);
        } else track = pickTrackFor(doc, clip, cmd.avoidOverlap ?? true);
        track.clips.push(clip);
        sortTrack(track);
        created.push(clip.id);
        break;
      }
      case "updateClip": {
        const f = mustFind(doc, cmd.clipId);
        f.track.clips[f.index] = mergeClip(f.clip, cmd.patch);
        sortTrack(f.track);
        break;
      }
      case "updateClips": {
        for (const t of doc.tracks)
          t.clips = t.clips.map((c) => {
            const match = (cmd.clipIds ? cmd.clipIds.includes(c.id) : true) && (cmd.types ? cmd.types.includes(c.type) : true);
            return match ? mergeClip(c, cmd.patch) : c;
          });
        break;
      }
      case "removeClips": {
        for (const t of doc.tracks) {
          const removed = t.clips.filter((c) => cmd.clipIds.includes(c.id));
          if (!removed.length) continue;
          t.clips = t.clips.filter((c) => !cmd.clipIds.includes(c.id));
          if (cmd.ripple) {
            // shift later clips left by the removed spans (processed right-to-left)
            for (const r of removed.sort((a, b) => b.start - a.start))
              for (const c of t.clips) if (c.start >= clipEnd(r)) c.start -= r.duration;
          }
        }
        break;
      }
      case "moveClip": {
        const f = mustFind(doc, cmd.clipId);
        const target = cmd.trackId ? trackById(doc, cmd.trackId) : f.track;
        if (!trackAccepts(target.kind, f.clip.type)) throw new CommandError(`Can't move a ${f.clip.type} clip onto a ${target.kind} track`);
        const start = Math.max(0, cmd.start);
        f.track.clips.splice(f.index, 1);
        target.clips.push({ ...f.clip, start });
        sortTrack(target);
        break;
      }
      case "trimClip": {
        const f = mustFind(doc, cmd.clipId);
        const c = structuredClone(f.clip);
        const end = clipEnd(c);
        if (cmd.edge === "start") {
          let newStart = Math.min(Math.max(0, cmd.frame), end - 1);
          if (c.type === "video" || c.type === "audio") {
            // can't extend before source start
            const minStart = c.start - Math.floor(c.trimStart / c.speed);
            newStart = Math.max(newStart, minStart);
            c.trimStart = Math.max(0, c.trimStart + Math.round((newStart - c.start) * c.speed));
          }
          const delta = newStart - c.start;
          c.keyframes = shiftKeyframes(c.keyframes, -delta);
          c.duration = end - newStart;
          c.start = newStart;
        } else {
          let newEnd = Math.max(c.start + 1, cmd.frame);
          if ((c.type === "video" || c.type === "audio") && c.sourceDuration) {
            const maxEnd = c.start + Math.floor((c.sourceDuration - c.trimStart) / c.speed);
            newEnd = Math.min(newEnd, maxEnd);
          }
          c.duration = Math.max(1, newEnd - c.start);
        }
        f.track.clips[f.index] = Clip.parse(c);
        break;
      }
      case "splitClip": {
        const id = splitOne(doc, cmd.clipId, cmd.frame);
        if (id) created.push(id);
        else warnings.push("Split point is outside the clip");
        break;
      }
      case "splitAt": {
        const targets = allClips(doc).filter((c) => (cmd.clipIds ? cmd.clipIds.includes(c.id) : true) && cmd.frame > c.start && cmd.frame < clipEnd(c));
        for (const c of targets) {
          const tr = doc.tracks.find((t) => t.clips.some((x) => x.id === c.id));
          if (tr?.locked) continue;
          const id = splitOne(doc, c.id, cmd.frame);
          if (id) created.push(id);
        }
        if (!targets.length) warnings.push("Nothing under the playhead to split");
        break;
      }
      case "duplicateClips": {
        for (const id of cmd.clipIds) {
          const f = mustFind(doc, id);
          const copy = Clip.parse({ ...structuredClone(f.clip), id: nanoid(), start: f.clip.start + (cmd.offset ?? f.clip.duration), groupId: null });
          const target = overlaps(f.track, copy.start, copy.duration) ? pickTrackFor(doc, copy, true) : f.track;
          target.clips.push(copy);
          sortTrack(target);
          created.push(copy.id);
        }
        break;
      }
      case "setKeyframe": {
        const f = mustFind(doc, cmd.clipId);
        const c = structuredClone(f.clip);
        const list = (c.keyframes[cmd.prop] ??= []);
        const at = list.find((k) => k.frame === cmd.frame);
        if (at) {
          at.value = cmd.value;
          if (cmd.easing) at.easing = cmd.easing;
        } else list.push({ id: nanoid(), frame: cmd.frame, value: cmd.value, easing: cmd.easing ?? "easeInOut" });
        list.sort((a, b) => a.frame - b.frame);
        f.track.clips[f.index] = Clip.parse(c);
        break;
      }
      case "removeKeyframe": {
        const f = mustFind(doc, cmd.clipId);
        const c = structuredClone(f.clip);
        c.keyframes[cmd.prop] = (c.keyframes[cmd.prop] ?? []).filter((k) => k.id !== cmd.keyframeId);
        f.track.clips[f.index] = c;
        break;
      }
      case "clearKeyframes": {
        const f = mustFind(doc, cmd.clipId);
        const c = structuredClone(f.clip);
        if (cmd.prop) delete c.keyframes[cmd.prop];
        else c.keyframes = {};
        f.track.clips[f.index] = c;
        break;
      }
      case "setTransition": {
        const f = mustFind(doc, cmd.clipId);
        const tr = cmd.transition ? { ...cmd.transition, duration: Math.min(cmd.transition.duration, f.clip.duration) } : null;
        f.track.clips[f.index] = mergeClip(f.clip, cmd.side === "in" ? { transitionIn: tr } : { transitionOut: tr });
        break;
      }
      case "setAnimation": {
        const f = mustFind(doc, cmd.clipId);
        f.track.clips[f.index] = mergeClip(f.clip, cmd.side === "in" ? { animationIn: cmd.animation } : { animationOut: cmd.animation });
        break;
      }
      case "setLoop": {
        const f = mustFind(doc, cmd.clipId);
        f.track.clips[f.index] = mergeClip(f.clip, { loop: cmd.loop });
        break;
      }
      case "bakeAnimation": {
        const f = mustFind(doc, cmd.clipId);
        const keyframes = bakePresets(f.clip, doc.settings.width, doc.settings.height);
        f.track.clips[f.index] = mergeClip(f.clip, { keyframes, animationIn: null, animationOut: null });
        break;
      }
      case "setSpeed": {
        const f = mustFind(doc, cmd.clipId);
        const c = f.clip;
        if (c.type !== "video" && c.type !== "audio") throw new CommandError("Speed applies to video and audio clips");
        const srcLen = c.duration * c.speed;
        f.track.clips[f.index] = mergeClip(c, { speed: cmd.speed, duration: Math.max(1, Math.round(srcLen / cmd.speed)) });
        break;
      }
      case "group": {
        const gid = nanoid();
        for (const t of doc.tracks) t.clips = t.clips.map((c) => (cmd.clipIds.includes(c.id) ? { ...c, groupId: gid } : c));
        break;
      }
      case "ungroup":
        for (const t of doc.tracks) t.clips = t.clips.map((c) => (c.groupId === cmd.groupId ? { ...c, groupId: null } : c));
        break;
      case "setSettings": {
        const { fps, width, height, ...rest } = cmd.patch;
        if (fps && fps !== doc.settings.fps) retime(doc, fps);
        if (width && height) reframe(doc, width, height);
        Object.assign(doc.settings, rest);
        break;
      }
      case "changeAspect": {
        const [w, h] = ASPECTS[cmd.aspect];
        // keep resolution class: scale so the short side matches the current short side
        const short = Math.min(doc.settings.width, doc.settings.height);
        const k = short / Math.min(w, h);
        reframe(doc, Math.round((w * k) / 2) * 2, Math.round((h * k) / 2) * 2);
        break;
      }
      case "closeGaps": {
        for (const t of doc.tracks) {
          if (cmd.trackId && t.id !== cmd.trackId) continue;
          if (t.locked) continue;
          let cursor = 0;
          for (const c of [...t.clips].sort((a, b) => a.start - b.start)) {
            c.start = cursor;
            cursor = clipEnd(c);
          }
        }
        break;
      }
      case "addMarker":
        doc.markers.push({ id: nanoid(), frame: cmd.frame, label: cmd.label, color: cmd.color ?? "#ffb65e" });
        break;
      case "removeMarker":
        doc.markers = doc.markers.filter((m) => m.id !== cmd.markerId);
        break;
    }
  }
  recomputeDuration(doc);
  return { doc: ProjectDoc.parse(doc), created, warnings };
}

/** Human-readable label for history and AI previews. */
export function describeCommand(cmd: EditCommand, doc?: ProjectDoc): string {
  const name = (id: string) => {
    const f = doc ? findClip(doc, id) : null;
    return f ? `“${f.clip.name || f.clip.type}”` : "clip";
  };
  switch (cmd.op) {
    case "addTrack":
      return `Add ${cmd.kind} track`;
    case "removeTrack":
      return "Remove track";
    case "updateTrack":
      return `Update track (${Object.keys(cmd.patch).join(", ")})`;
    case "moveTrack":
      return "Reorder track";
    case "addClip":
      return `Add ${String(cmd.clip.type)}${cmd.clip.name ? ` “${String(cmd.clip.name)}”` : ""}`;
    case "updateClip":
      return `Edit ${name(cmd.clipId)}: ${Object.keys(cmd.patch).join(", ")}`;
    case "updateClips":
      return `Edit ${cmd.clipIds ? cmd.clipIds.length : "all"} clips: ${Object.keys(cmd.patch).join(", ")}`;
    case "removeClips":
      return `${cmd.ripple ? "Ripple delete" : "Delete"} ${cmd.clipIds.length} clip(s)`;
    case "moveClip":
      return `Move ${name(cmd.clipId)}`;
    case "trimClip":
      return `Trim ${name(cmd.clipId)} (${cmd.edge})`;
    case "splitClip":
      return `Split ${name(cmd.clipId)}`;
    case "splitAt":
      return `Split at frame ${cmd.frame}`;
    case "duplicateClips":
      return `Duplicate ${cmd.clipIds.length} clip(s)`;
    case "setKeyframe":
      return `Keyframe ${cmd.prop} = ${cmd.value} @${cmd.frame}`;
    case "removeKeyframe":
      return `Remove ${cmd.prop} keyframe`;
    case "clearKeyframes":
      return `Clear keyframes${cmd.prop ? ` (${cmd.prop})` : ""}`;
    case "setTransition":
      return `${cmd.transition ? `Transition ${cmd.side}: ${cmd.transition.type}` : `Remove ${cmd.side} transition`} on ${name(cmd.clipId)}`;
    case "setAnimation":
      return `${cmd.animation ? `Animate ${cmd.side}: ${cmd.animation.preset}` : `Remove ${cmd.side} animation`} on ${name(cmd.clipId)}`;
    case "setLoop":
      return cmd.loop ? `Loop ${cmd.loop.preset}` : "Remove loop";
    case "bakeAnimation":
      return `Convert presets to keyframes on ${name(cmd.clipId)}`;
    case "setSpeed":
      return `Speed ${cmd.speed}× on ${name(cmd.clipId)}`;
    case "group":
      return `Group ${cmd.clipIds.length} clips`;
    case "ungroup":
      return "Ungroup";
    case "setSettings":
      return `Project settings (${Object.keys(cmd.patch).join(", ")})`;
    case "changeAspect":
      return `Change aspect to ${cmd.aspect}`;
    case "closeGaps":
      return "Close gaps";
    case "addMarker":
      return `Marker “${cmd.label}”`;
    case "removeMarker":
      return "Remove marker";
  }
}
