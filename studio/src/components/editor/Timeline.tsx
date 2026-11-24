"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX, Magnet, Scissors, Trash2, Plus, ZoomIn, ZoomOut, Copy, Group, Ungroup, Diamond, Film, Music, Type, Layers, Sparkles } from "lucide-react";
import { clipEnd, findClip, type EditCommand } from "@/lib/project/ops";
import type { Clip, Track, TrackKind } from "@/lib/project/schema";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useEditor } from "./store";
import { clipFromAsset, useAssets, type Asset } from "./assets-store";

const HEADER_W = 168;
const RULER_H = 26;
const TRACK_H: Record<TrackKind, number> = { video: 56, audio: 48, overlay: 44, text: 40, effects: 40 };

const CLIP_STYLE: Record<Clip["type"], string> = {
  video: "bg-[#2b4a7a] border-[#4a7bc4]",
  image: "bg-[#2f5a52] border-[#4fa394]",
  audio: "bg-[#1f4a3a] border-[#3fae7d]",
  text: "bg-[#5a3d7a] border-[#9a6bd6]",
  shape: "bg-[#6a4a2a] border-[#c98a4a]",
  solid: "bg-[#3a3f4a] border-[#6a7385]",
  adjustment: "bg-[#4a4a2a] border-[#a8a650]",
  effect: "bg-[#6a2a4a] border-[#d6528f]",
  scene: "bg-[#2a2f55] border-[#7b6cff]",
};

type DragState =
  | { kind: "move"; ids: string[]; startX: number; startY: number; dFrames: number; dTracks: number; anchor: Clip }
  | { kind: "trim"; id: string; edge: "start" | "end"; startX: number; dFrames: number }
  | { kind: "scrub" }
  | null;

function useSnapTargets(excludeIds: string[]) {
  const doc = useEditor((s) => s.doc);
  const playhead = useEditor((s) => s.playhead);
  return useMemo(() => {
    const set = new Set<number>([0, playhead]);
    for (const t of doc.tracks) for (const c of t.clips) if (!excludeIds.includes(c.id)) {
      set.add(c.start);
      set.add(clipEnd(c));
    }
    for (const m of doc.markers) set.add(m.frame);
    return [...set];
  }, [doc, playhead, excludeIds]);
}

export function Timeline() {
  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  const playhead = useEditor((s) => s.playhead);
  const px = useEditor((s) => s.pxPerFrame);
  const snapping = useEditor((s) => s.snapping);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ left: 0, width: 1200 });
  const [drag, setDrag] = useState<DragState>(null);
  const [snapLine, setSnapLine] = useState<number | null>(null);
  const { fps, durationInFrames } = doc.settings;
  const totalFrames = durationInFrames + fps * 10;
  const contentW = totalFrames * px;

  const excluded = drag?.kind === "move" ? drag.ids : drag?.kind === "trim" ? [drag.id] : [];
  const snapTargets = useSnapTargets(excluded);
  const snap = useCallback(
    (frame: number) => {
      if (!snapping) return { frame, snapped: null as number | null };
      const thr = 8 / px;
      let best: number | null = null;
      for (const t of snapTargets) if (Math.abs(t - frame) <= thr && (best === null || Math.abs(t - frame) < Math.abs(best - frame))) best = t;
      return best === null ? { frame, snapped: null } : { frame: best, snapped: best };
    },
    [snapping, px, snapTargets],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setView({ left: el.scrollLeft, width: el.clientWidth });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // keep playhead visible while playing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || drag) return;
    const x = playhead * px;
    if (x < el.scrollLeft || x > el.scrollLeft + el.clientWidth - HEADER_W - 40) el.scrollLeft = Math.max(0, x - 80);
  }, [playhead, px, drag]);

  const frameAt = (clientX: number) => {
    const el = scrollRef.current!;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.round((clientX - rect.left - HEADER_W + el.scrollLeft) / px));
  };

  // ctrl/cmd + wheel zoom around cursor
  const onWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const el = scrollRef.current!;
    const f = frameAt(e.clientX);
    const next = Math.max(0.15, Math.min(40, px * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    useEditor.getState().setZoom(next);
    requestAnimationFrame(() => {
      el.scrollLeft = f * next - (e.clientX - el.getBoundingClientRect().left - HEADER_W);
    });
  };

  /* ---------------------------------------------------------- drag logic */

  const trackIndexAt = (clientY: number) => {
    const el = scrollRef.current!;
    const y = clientY - el.getBoundingClientRect().top + el.scrollTop - RULER_H;
    let acc = 0;
    for (let i = 0; i < doc.tracks.length; i++) {
      acc += TRACK_H[doc.tracks[i].kind];
      if (y < acc) return i;
    }
    return doc.tracks.length - 1;
  };

  const onClipDown = (e: React.PointerEvent, clip: Clip, track: Track) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const st = useEditor.getState();
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    if (!selection.includes(clip.id) || additive) st.select([clip.id], additive);
    if (track.locked || clip.locked) return;
    const ids = additive ? useEditor.getState().selection : selection.includes(clip.id) ? selection : useEditor.getState().selection;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ kind: "move", ids, startX: e.clientX, startY: e.clientY, dFrames: 0, dTracks: 0, anchor: clip });
  };

  const onTrimDown = (e: React.PointerEvent, clip: Clip, track: Track, edge: "start" | "end") => {
    e.stopPropagation();
    if (track.locked || clip.locked) return;
    useEditor.getState().select([clip.id]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ kind: "trim", id: clip.id, edge, startX: e.clientX, dFrames: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    if (drag.kind === "scrub") {
      useEditor.getState().setPlayhead(snap(frameAt(e.clientX)).frame);
      return;
    }
    const raw = Math.round((e.clientX - drag.startX) / px);
    if (drag.kind === "move") {
      const a = drag.anchor;
      // snap either edge of the anchor clip
      const s1 = snap(a.start + raw);
      const s2 = snap(a.start + a.duration + raw);
      let d = raw;
      let line: number | null = null;
      if (s1.snapped !== null) {
        d = s1.frame - a.start;
        line = s1.snapped;
      } else if (s2.snapped !== null) {
        d = s2.frame - a.start - a.duration;
        line = s2.snapped;
      }
      const minStart = Math.min(...drag.ids.map((id) => findClip(doc, id)?.clip.start ?? 0));
      d = Math.max(-minStart, d);
      const anchorTrack = doc.tracks.findIndex((t) => t.clips.some((c) => c.id === a.id));
      const dTracks = drag.ids.length === 1 ? trackIndexAt(e.clientY) - anchorTrack : 0;
      setSnapLine(line);
      setDrag({ ...drag, dFrames: d, dTracks });
    } else {
      const c = findClip(doc, drag.id)!.clip;
      const edgeFrame = drag.edge === "start" ? c.start + raw : clipEnd(c) + raw;
      const s = snap(edgeFrame);
      setSnapLine(s.snapped);
      setDrag({ ...drag, dFrames: s.frame - (drag.edge === "start" ? c.start : clipEnd(c)) });
    }
  };

  const onPointerUp = () => {
    const st = useEditor.getState();
    if (drag?.kind === "move" && (drag.dFrames !== 0 || drag.dTracks !== 0)) {
      const cmds: EditCommand[] = [];
      for (const id of drag.ids) {
        const f = findClip(doc, id);
        if (!f) continue;
        const ti = doc.tracks.findIndex((t) => t.id === f.track.id) + drag.dTracks;
        const target = doc.tracks[Math.max(0, Math.min(doc.tracks.length - 1, ti))];
        cmds.push({ op: "moveClip", clipId: id, start: f.clip.start + drag.dFrames, trackId: target.id });
      }
      const r = st.dispatch(cmds, drag.ids.length > 1 ? `Move ${drag.ids.length} clips` : "Move clip");
      if (!r.ok) toast.error(r.error ?? "Can't move there");
    } else if (drag?.kind === "trim" && drag.dFrames !== 0) {
      const c = findClip(doc, drag.id)!.clip;
      const frame = drag.edge === "start" ? c.start + drag.dFrames : clipEnd(c) + drag.dFrames;
      st.dispatch([{ op: "trimClip", clipId: drag.id, edge: drag.edge, frame }], "Trim clip");
    }
    setDrag(null);
    setSnapLine(null);
  };

  /* ------------------------------------------------------- asset drop */

  const onDrop = (e: React.DragEvent, track: Track | null) => {
    const raw = e.dataTransfer.getData("application/x-lumora-asset");
    const preset = e.dataTransfer.getData("application/x-lumora-clip");
    if (!raw && !preset) return;
    e.preventDefault();
    const frame = snap(frameAt(e.clientX)).frame;
    const st = useEditor.getState();
    let clip: Record<string, unknown> & { type: string };
    if (raw) {
      const a = JSON.parse(raw) as Asset;
      clip = clipFromAsset(a, frame, fps, doc.settings);
    } else clip = { ...(JSON.parse(preset) as { type: string }), start: frame };
    const accepts = track && (track.kind === "audio" ? clip.type === "audio" : clip.type !== "audio");
    const r = st.dispatch([{ op: "addClip", trackId: accepts ? track!.id : undefined, clip, avoidOverlap: true }], `Add ${clip.type}`);
    if (r.ok) st.select(r.created);
    else toast.error(r.error ?? "Couldn't add clip");
  };

  /* ------------------------------------------------------------ render */

  const visibleFrom = view.left / px - 200;
  const visibleTo = (view.left + view.width) / px + 200;
  const rulerStep = useMemo(() => {
    const secPx = fps * px;
    const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
    return steps.find((s) => s * secPx >= 70) ?? 600;
  }, [fps, px]);

  const ticks = [];
  const firstSec = Math.max(0, Math.floor(visibleFrom / fps / rulerStep) * rulerStep);
  for (let s = firstSec; s * fps < Math.min(totalFrames, visibleTo); s += rulerStep) {
    const x = s * fps * px;
    ticks.push(
      <div key={s} className="absolute top-0 h-full" style={{ left: x }}>
        <div className="h-2 w-px bg-ink-400" />
        <div className="ml-1 font-mono text-[10px] text-ink-400">{s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${Math.round(s * 100) / 100}s`}</div>
      </div>,
    );
  }

  const tracksH = doc.tracks.reduce((h, t) => h + TRACK_H[t.kind], 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-900/70">
      <TimelineToolbar />
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto select-none"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="relative" style={{ width: contentW + HEADER_W, height: tracksH + RULER_H + 60 }}>
          {/* ruler */}
          <div
            className="sticky top-0 z-20 flex"
            style={{ height: RULER_H }}
          >
            <div className="sticky left-0 z-30 shrink-0 border-b border-r border-white/[0.06] bg-ink-900" style={{ width: HEADER_W }} />
            <div
              className="relative flex-1 cursor-ew-resize border-b border-white/[0.06] bg-ink-900/95"
              onPointerDown={(e) => {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                useEditor.getState().setPlaying(false);
                useEditor.getState().setPlayhead(frameAt(e.clientX));
                setDrag({ kind: "scrub" });
              }}
            >
              {ticks}
              {doc.markers.map((m) => (
                <div key={m.id} title={m.label} className="absolute top-0 h-full w-0.5" style={{ left: m.frame * px, background: m.color }} />
              ))}
            </div>
          </div>

          {/* tracks */}
          {doc.tracks.map((track) => (
            <div key={track.id} className="flex border-b border-white/[0.04]" style={{ height: TRACK_H[track.kind] }}>
              <TrackHeader track={track} />
              <div
                className={cn("relative flex-1", track.hidden && "opacity-40")}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  useEditor.getState().select([]);
                  useEditor.getState().selectTrack(track.id);
                  useEditor.getState().setPlayhead(frameAt(e.clientX));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, track)}
              >
                {track.clips.map((clip) => {
                  if (clipEnd(clip) < visibleFrom || clip.start > visibleTo) return null; // horizontal virtualization
                  let start = clip.start;
                  let dur = clip.duration;
                  let dy = 0;
                  if (drag?.kind === "move" && drag.ids.includes(clip.id)) {
                    start += drag.dFrames;
                    dy = drag.dTracks;
                  }
                  if (drag?.kind === "trim" && drag.id === clip.id) {
                    if (drag.edge === "start") {
                      start += drag.dFrames;
                      dur -= drag.dFrames;
                    } else dur += drag.dFrames;
                  }
                  return (
                    <ClipView
                      key={clip.id}
                      clip={clip}
                      track={track}
                      left={start * px}
                      width={Math.max(4, dur * px)}
                      dragging={!!(drag?.kind === "move" && drag.ids.includes(clip.id))}
                      trackOffset={dy}
                      selected={selection.includes(clip.id)}
                      onDown={(e) => onClipDown(e, clip, track)}
                      onTrim={(e, edge) => onTrimDown(e, clip, track, edge)}
                      px={px}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* drop zone for new track */}
          <div className="flex h-14" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, null)}>
            <div className="sticky left-0 shrink-0 bg-ink-900" style={{ width: HEADER_W }} />
            <div className="flex flex-1 items-center pl-4 text-[11px] text-ink-500">Drop media here to create a new track</div>
          </div>

          {/* playhead */}
          <div className="pointer-events-none absolute top-0 z-20 w-px bg-glow-rose" style={{ left: HEADER_W + playhead * px, height: tracksH + RULER_H }}>
            <div className="absolute -left-[5px] top-0 h-3 w-[11px] rounded-b-sm bg-glow-rose" />
          </div>
          {snapLine !== null ? <div className="pointer-events-none absolute top-0 z-20 w-px bg-glow-amber" style={{ left: HEADER_W + snapLine * px, height: tracksH + RULER_H }} /> : null}
        </div>
      </div>
    </div>
  );
}

function TrackHeader({ track }: { track: Track }) {
  const dispatch = useEditor((s) => s.dispatch);
  const selectedTrack = useEditor((s) => s.selectedTrack);
  const [editing, setEditing] = useState(false);
  const Icon = { video: Film, audio: Music, text: Type, overlay: Layers, effects: Sparkles }[track.kind];
  const upd = (patch: Partial<Pick<Track, "locked" | "hidden" | "muted" | "name">>) => dispatch([{ op: "updateTrack", trackId: track.id, patch }]);
  return (
    <div
      className={cn("sticky left-0 z-10 flex shrink-0 items-center gap-1 border-r border-white/[0.06] bg-ink-900 px-2", selectedTrack === track.id && "bg-ink-850")}
      style={{ width: HEADER_W }}
      onClick={() => useEditor.getState().selectTrack(track.id)}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      {editing ? (
        <input
          autoFocus
          defaultValue={track.name}
          className="field-sm min-w-0 flex-1"
          onBlur={(e) => {
            setEditing(false);
            if (e.target.value && e.target.value !== track.name) upd({ name: e.target.value });
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-200" onDoubleClick={() => setEditing(true)} title="Double-click to rename">
          {track.name}
        </span>
      )}
      <button className="rounded p-1 text-ink-400 hover:bg-white/5 hover:text-white" title={track.locked ? "Unlock track" : "Lock track"} onClick={() => upd({ locked: !track.locked })}>
        {track.locked ? <Lock className="h-3 w-3 text-glow-amber" /> : <Unlock className="h-3 w-3" />}
      </button>
      {track.kind === "audio" || track.kind === "video" ? (
        <button className="rounded p-1 text-ink-400 hover:bg-white/5 hover:text-white" title={track.muted ? "Unmute track" : "Mute track"} onClick={() => upd({ muted: !track.muted })}>
          {track.muted ? <VolumeX className="h-3 w-3 text-glow-rose" /> : <Volume2 className="h-3 w-3" />}
        </button>
      ) : null}
      {track.kind !== "audio" ? (
        <button className="rounded p-1 text-ink-400 hover:bg-white/5 hover:text-white" title={track.hidden ? "Show track" : "Hide track"} onClick={() => upd({ hidden: !track.hidden })}>
          {track.hidden ? <EyeOff className="h-3 w-3 text-glow-rose" /> : <Eye className="h-3 w-3" />}
        </button>
      ) : null}
    </div>
  );
}

function ClipView({ clip, track, left, width, selected, dragging, trackOffset, onDown, onTrim, px }: { clip: Clip; track: Track; left: number; width: number; selected: boolean; dragging: boolean; trackOffset: number; onDown: (e: React.PointerEvent) => void; onTrim: (e: React.PointerEvent, edge: "start" | "end") => void; px: number }) {
  const asset = useAssets((s) => ("assetId" in clip ? s.assets.find((a) => a.id === clip.assetId) : undefined));
  const h = TRACK_H[track.kind] - 6;
  const label =
    clip.name ||
    (clip.type === "text" ? clip.text : clip.type === "effect" ? clip.effect : clip.type === "scene" ? clip.title : clip.type === "shape" ? clip.shape : clip.type);
  const kfFrames = selected ? [...new Set(Object.values(clip.keyframes).flatMap((l) => (l ?? []).map((k) => k.frame)))] : [];
  return (
    <div
      onPointerDown={onDown}
      onDoubleClick={() => useEditor.getState().setPlayhead(clip.start)}
      className={cn(
        "group absolute top-[3px] overflow-hidden rounded-md border text-[11px] text-white/90 shadow-sm transition-shadow",
        CLIP_STYLE[clip.type],
        selected ? "ring-2 ring-white/90 ring-offset-0 z-10" : "hover:brightness-110",
        dragging && "opacity-80 shadow-xl z-20",
        (track.locked || clip.locked) && "cursor-not-allowed opacity-70",
        !track.locked && "cursor-grab active:cursor-grabbing",
      )}
      style={{ left, width, height: h, transform: trackOffset ? `translateY(${trackOffset * 46}px)` : undefined }}
      title={`${label} — ${(clip.duration / 30).toFixed(1)}s`}
    >
      {/* poster strip */}
      {asset?.poster && (clip.type === "video" || clip.type === "image") ? (
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url(${asset.poster})`, backgroundSize: `auto 100%`, backgroundRepeat: "repeat-x" }} />
      ) : null}
      {/* waveform */}
      {asset?.waveform && (clip.type === "audio" || clip.type === "video") ? <Waveform clip={clip} peaks={asset.waveform} durationSec={asset.durationSec ?? 1} width={width} height={h} px={px} /> : null}
      <div className="relative flex items-center gap-1 px-2 pt-0.5 font-medium">
        {clip.groupId ? <Group className="h-3 w-3 shrink-0 opacity-70" /> : null}
        <span className="truncate drop-shadow">{label}</span>
        {(clip.type === "video" || clip.type === "audio") && clip.speed !== 1 ? <span className="rounded bg-black/30 px-1 text-[9px]">{clip.speed}×</span> : null}
        {clip.type === "scene" ? <span className="rounded bg-black/30 px-1 text-[9px]">storyboard</span> : null}
      </div>
      {clip.transitionIn ? <div className="absolute bottom-0 left-0 top-0 bg-gradient-to-r from-white/25 to-transparent" style={{ width: Math.min(width / 2, clip.transitionIn.duration * px) }} /> : null}
      {clip.transitionOut ? <div className="absolute bottom-0 right-0 top-0 bg-gradient-to-l from-white/25 to-transparent" style={{ width: Math.min(width / 2, clip.transitionOut.duration * px) }} /> : null}
      {kfFrames.map((f) => (
        <Diamond key={f} className="absolute bottom-0.5 h-2.5 w-2.5 -translate-x-1/2 fill-glow-amber text-glow-amber" style={{ left: f * px }} />
      ))}
      <div className="absolute bottom-0 left-0 top-0 w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/50" onPointerDown={(e) => onTrim(e, "start")} />
      <div className="absolute bottom-0 right-0 top-0 w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/50" onPointerDown={(e) => onTrim(e, "end")} />
    </div>
  );
}

function Waveform({ clip, peaks, durationSec, width, height, px }: { clip: Clip; peaks: number[]; durationSec: number; width: number; height: number; px: number }) {
  if (clip.type !== "audio" && clip.type !== "video") return null;
  const fps = useEditor.getState().doc.settings.fps;
  const bars = Math.min(400, Math.max(4, Math.floor(width / 3)));
  const path: string[] = [];
  for (let i = 0; i < bars; i++) {
    const frame = (i / bars) * clip.duration;
    const srcSec = (clip.trimStart + frame * clip.speed) / fps;
    const idx = Math.floor((srcSec / durationSec) * peaks.length);
    const v = peaks[Math.max(0, Math.min(peaks.length - 1, idx))] ?? 0;
    const bh = Math.max(1, v * (height - 14));
    const x = (i / bars) * width;
    path.push(`M${x.toFixed(1)} ${(height - bh) / 2 + 7}v${bh.toFixed(1)}`);
  }
  void px;
  return (
    <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
      <path d={path.join("")} stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" />
    </svg>
  );
}

function TimelineToolbar() {
  const px = useEditor((s) => s.pxPerFrame);
  const snapping = useEditor((s) => s.snapping);
  const selection = useEditor((s) => s.selection);
  const doc = useEditor((s) => s.doc);
  const st = useEditor.getState;
  const [addOpen, setAddOpen] = useState(false);
  const groupId = selection.length ? findClip(doc, selection[0])?.clip.groupId : null;
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.05] px-2 py-1">
      <IconButton title="Split at playhead (S)" onClick={() => st().dispatch([{ op: "splitAt", frame: st().playhead, clipIds: selection.length ? selection : undefined }])}>
        <Scissors className="h-4 w-4" />
      </IconButton>
      <IconButton title="Delete (Del) — Shift+Del ripple deletes" disabled={!selection.length} onClick={() => st().dispatch([{ op: "removeClips", clipIds: selection }])}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
      <IconButton title="Duplicate (Ctrl+D)" disabled={!selection.length} onClick={() => { const r = st().dispatch([{ op: "duplicateClips", clipIds: selection }]); if (r.ok) st().select(r.created); }}>
        <Copy className="h-4 w-4" />
      </IconButton>
      {groupId ? (
        <IconButton title="Ungroup (Ctrl+Shift+G)" onClick={() => st().dispatch([{ op: "ungroup", groupId }])}>
          <Ungroup className="h-4 w-4" />
        </IconButton>
      ) : (
        <IconButton title="Group (Ctrl+G)" disabled={selection.length < 2} onClick={() => st().dispatch([{ op: "group", clipIds: selection }])}>
          <Group className="h-4 w-4" />
        </IconButton>
      )}
      <IconButton title="Add marker at playhead (M)" onClick={() => st().dispatch([{ op: "addMarker", frame: st().playhead, label: `Marker ${doc.markers.length + 1}` }])}>
        <Diamond className="h-4 w-4" />
      </IconButton>
      <div className="relative">
        <IconButton title="Add track" onClick={() => setAddOpen(!addOpen)}>
          <Plus className="h-4 w-4" />
        </IconButton>
        {addOpen ? (
          <div className="absolute left-0 top-9 z-40 w-40 rounded-lg border border-white/10 bg-ink-800 py-1 text-xs shadow-xl" onMouseLeave={() => setAddOpen(false)}>
            {(["video", "overlay", "text", "effects", "audio"] as const).map((k) => (
              <button key={k} className="block w-full px-3 py-1.5 text-left capitalize hover:bg-white/5" onClick={() => { st().dispatch([{ op: "addTrack", kind: k }]); setAddOpen(false); }}>
                {k} track
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <IconButton title="Snapping" active={snapping} onClick={() => st().setSnapping(!snapping)}>
        <Magnet className="h-4 w-4" />
      </IconButton>
      <div className="ml-auto flex items-center gap-1">
        <IconButton title="Zoom out (-)" onClick={() => st().setZoom(px / 1.4)}>
          <ZoomOut className="h-4 w-4" />
        </IconButton>
        <input aria-label="Timeline zoom" type="range" min={-2} max={3.6} step={0.05} value={Math.log(px)} onChange={(e) => st().setZoom(Math.exp(Number(e.target.value)))} className="w-24" />
        <IconButton title="Zoom in (+)" onClick={() => st().setZoom(px * 1.4)}>
          <ZoomIn className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
