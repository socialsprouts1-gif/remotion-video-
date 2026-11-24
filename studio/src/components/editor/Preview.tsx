"use client";
import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Maximize, Pause, Play, Repeat, Volume2, VolumeX, Grid3x3, Scan } from "lucide-react";
import { ProjectComposition } from "@/remotion/ProjectComposition";
import { findClip } from "@/lib/project/ops";
import { sampleNumber } from "@/lib/motion/keyframes";
import { IconButton, Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useEditor } from "./store";

export function timecode(frame: number, fps: number) {
  const s = Math.floor(frame / fps);
  const f = frame % fps;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export function Preview() {
  const doc = useEditor((s) => s.doc);
  const previewDoc = useEditor((s) => s.previewDoc);
  const shown = previewDoc ?? doc;
  const playhead = useEditor((s) => s.playhead);
  const playing = useEditor((s) => s.playing);
  const selection = useEditor((s) => s.selection);
  const playerRef = useRef<PlayerRef>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fromPlayer = useRef(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [guides, setGuides] = useState<"none" | "safe" | "9:16" | "1:1" | "4:5">("none");
  const [zoom, setZoom] = useState<"fit" | "50" | "100">("fit");
  const [box, setBox] = useState({ w: 0, h: 0 });
  const { width, height, fps, durationInFrames } = shown.settings;

  // measure available area to fit the canvas
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = zoom === "fit" ? Math.min((box.w - 24) / width, (box.h - 24) / height) : zoom === "50" ? 0.5 : 1;
  const dispW = Math.max(1, width * Math.max(0.05, scale));
  const dispH = Math.max(1, height * Math.max(0.05, scale));

  // player -> store
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => {
      fromPlayer.current = true;
      useEditor.getState().setPlayhead(e.detail.frame);
    };
    const onPlay = () => useEditor.getState().setPlaying(true);
    const onPause = () => useEditor.getState().setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    p.addEventListener("ended", onPause);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("ended", onPause);
    };
  }, []);

  // store -> player
  useEffect(() => {
    if (fromPlayer.current) {
      fromPlayer.current = false;
      return;
    }
    const p = playerRef.current;
    if (p && p.getCurrentFrame() !== playhead) p.seekTo(playhead);
  }, [playhead]);
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing && !p.isPlaying()) p.play();
    if (!playing && p.isPlaying()) p.pause();
  }, [playing]);

  const inputProps = useMemo(() => ({ doc: shown }), [shown]);
  const step = (d: number) => useEditor.getState().setPlayhead(playhead + d);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={wrapRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,#11141b,#090a0e)]">
        <div className="relative shrink-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" style={{ width: dispW, height: dispH }}>
          <Player
            ref={playerRef}
            component={ProjectComposition}
            inputProps={inputProps}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            durationInFrames={Math.max(1, durationInFrames)}
            style={{ width: dispW, height: dispH }}
            loop={loop}
            initiallyMuted={muted}
            clickToPlay={false}
            doubleClickToFullscreen
            spaceKeyToPlayOrPause={false}
            numberOfSharedAudioTags={8}
            acknowledgeRemotionLicense
          />
          <Guides guides={guides} width={width} height={height} />
          {!previewDoc ? <SelectionOverlay scale={dispW / width} /> : null}
          {previewDoc ? <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-white shadow-glow">AI PREVIEW — not applied yet</div> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] bg-ink-900/60 px-3 py-1.5">
        <div className="flex items-center">
          <IconButton title="Go to start (Home)" onClick={() => useEditor.getState().setPlayhead(0)}><ChevronFirst className="h-4 w-4" /></IconButton>
          <IconButton title="Previous frame (←)" onClick={() => step(-1)}><ChevronLeft className="h-4 w-4" /></IconButton>
          <button
            title="Play / pause (Space)"
            onClick={() => useEditor.getState().setPlaying(!playing)}
            className="mx-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-950 transition hover:scale-105"
          >
            {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
          </button>
          <IconButton title="Next frame (→)" onClick={() => step(1)}><ChevronRight className="h-4 w-4" /></IconButton>
          <IconButton title="Go to end (End)" onClick={() => useEditor.getState().setPlayhead(durationInFrames - 1)}><ChevronLast className="h-4 w-4" /></IconButton>
        </div>
        <div className="font-mono text-xs tabular-nums text-ink-200">
          {timecode(playhead, fps)} <span className="text-ink-500">/ {timecode(durationInFrames, fps)}</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <IconButton title="Loop" active={loop} onClick={() => setLoop(!loop)}><Repeat className="h-4 w-4" /></IconButton>
          <IconButton
            title={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const m = !muted;
              setMuted(m);
              m ? playerRef.current?.mute() : playerRef.current?.unmute();
            }}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </IconButton>
          <div className="mx-1 hidden items-center gap-1 sm:flex">
            <Grid3x3 className="h-3.5 w-3.5 text-ink-400" />
            <select className="field-sm w-auto" value={guides} onChange={(e) => setGuides(e.target.value as typeof guides)} title="Guides">
              <option value="none">No guides</option>
              <option value="safe">Safe zones</option>
              <option value="9:16">9:16 crop</option>
              <option value="1:1">1:1 crop</option>
              <option value="4:5">4:5 crop</option>
            </select>
          </div>
          <span className="hidden sm:inline-flex">
            <Segmented size="sm" value={zoom} onChange={setZoom} options={[{ value: "fit", label: "Fit" }, { value: "50", label: "50%" }, { value: "100", label: "100%" }]} />
          </span>
          <IconButton title="Fullscreen" onClick={() => playerRef.current?.requestFullscreen()}><Maximize className="h-4 w-4" /></IconButton>
        </div>
      </div>
      {selection.length === 0 ? null : null}
    </div>
  );
}

function Guides({ guides, width, height }: { guides: string; width: number; height: number }) {
  if (guides === "none") return null;
  if (guides === "safe")
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute border border-dashed border-cyan-300/50" style={{ inset: "5%" }} />
        <div className="absolute border border-dashed border-amber-300/50" style={{ inset: "10%" }} />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
      </div>
    );
  const [a, b] = guides.split(":").map(Number);
  const r = a / b;
  let w = width;
  let h = width / r;
  if (h > height) {
    h = height;
    w = height * r;
  }
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="border-2 border-glow-amber/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" style={{ width: `${(w / width) * 100}%`, height: `${(h / height) * 100}%` }} />
    </div>
  );
}

/** Bounding box of the selected visual clip; drag to reposition (sets a keyframe when x/y are animated). */
function SelectionOverlay({ scale }: { scale: number }) {
  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  const playhead = useEditor((s) => s.playhead);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [delta, setDelta] = useState<{ dx: number; dy: number } | null>(null);
  const f = selection.length === 1 ? findClip(doc, selection[0]) : null;
  const clip = f?.clip;
  const visible = clip && clip.type !== "audio" && playhead >= clip.start && playhead < clip.start + clip.duration;

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if (!clip || clip.type === "audio") return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { x: e.clientX, y: e.clientY, ox: 0, oy: 0 };
      setDelta({ dx: 0, dy: 0 });
    },
    [clip],
  );
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setDelta({ dx: (e.clientX - drag.current.x) / scale, dy: (e.clientY - drag.current.y) / scale });
  };
  const onUp = () => {
    if (!drag.current || !clip || !delta) return;
    drag.current = null;
    const { dx, dy } = delta;
    setDelta(null);
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    const local = playhead - clip.start;
    const st = useEditor.getState();
    const animated = (clip.keyframes.x?.length ?? 0) > 0 || (clip.keyframes.y?.length ?? 0) > 0;
    if (animated) {
      const cx = sampleNumber(clip.keyframes, "x", local, clip.transform.x);
      const cy = sampleNumber(clip.keyframes, "y", local, clip.transform.y);
      st.dispatch(
        [
          { op: "setKeyframe", clipId: clip.id, prop: "x", frame: local, value: Math.round(cx + dx) },
          { op: "setKeyframe", clipId: clip.id, prop: "y", frame: local, value: Math.round(cy + dy) },
        ],
        "Move (keyframe)",
      );
    } else st.dispatch([{ op: "updateClip", clipId: clip.id, patch: { transform: { x: Math.round(clip.transform.x + dx), y: Math.round(clip.transform.y + dy) } } }], "Move layer");
  };

  if (!visible || !clip) return null;
  const { width, height } = doc.settings;
  const local = playhead - clip.start;
  const w = (clip.transform.width ?? width) * sampleNumber(clip.keyframes, "scale", local, clip.transform.scale);
  const h = (clip.transform.height ?? height) * sampleNumber(clip.keyframes, "scale", local, clip.transform.scale);
  const x = sampleNumber(clip.keyframes, "x", local, clip.transform.x) + (delta?.dx ?? 0);
  const y = sampleNumber(clip.keyframes, "y", local, clip.transform.y) + (delta?.dy ?? 0);
  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      title="Drag to move"
      className={cn("absolute cursor-move border border-accent/90 outline outline-1 outline-black/40", delta ? "bg-accent/10" : "hover:bg-accent/5")}
      style={{
        left: ((width - w) / 2 + x) * scale,
        top: ((height - h) / 2 + y) * scale,
        width: w * scale,
        height: h * scale,
        transform: `rotate(${sampleNumber(clip.keyframes, "rotation", local, clip.transform.rotation)}deg)`,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="absolute h-2 w-2 rounded-sm border border-accent bg-white" style={{ left: i % 2 ? "auto" : -4, right: i % 2 ? -4 : "auto", top: i < 2 ? -4 : "auto", bottom: i < 2 ? "auto" : -4 }} />
      ))}
      <Scan className="hidden" />
    </div>
  );
}
