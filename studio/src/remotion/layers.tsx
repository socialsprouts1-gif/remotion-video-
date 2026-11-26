import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ClipOf, Track } from "../lib/project/schema";
import { sampleNumber, sampleString } from "../lib/motion/keyframes";
import { unitProgress, type Motion } from "../lib/motion/presets";

function fadeVolume(local: number, duration: number, fadeIn: number, fadeOut: number) {
  let v = 1;
  if (fadeIn > 0) v *= Math.min(1, local / fadeIn);
  if (fadeOut > 0) v *= Math.min(1, (duration - local) / fadeOut);
  return Math.max(0, v);
}

export const VideoContent: React.FC<{ clip: ClipOf<"video">; track: Track }> = ({ clip, track }) => {
  const muted = clip.muted || track.muted;
  return (
    <OffthreadVideo
      src={clip.src}
      trimBefore={clip.trimStart}
      playbackRate={clip.speed}
      muted={muted}
      volume={(f) => {
        const kv = sampleNumber(clip.keyframes, "volume", f, clip.volume);
        return Math.min(1, kv * track.volume * fadeVolume(f, clip.duration, clip.fadeIn, clip.fadeOut));
      }}
      style={{ width: "100%", height: "100%", objectFit: clip.fit }}
      pauseWhenBuffering
    />
  );
};

export const AudioContent: React.FC<{ clip: ClipOf<"audio">; track: Track }> = ({ clip, track }) => (
  <Audio
    src={clip.src}
    trimBefore={clip.trimStart}
    playbackRate={clip.speed}
    muted={clip.muted || track.muted}
    volume={(f) => {
      const kv = sampleNumber(clip.keyframes, "volume", f, clip.volume);
      return Math.min(1, kv * track.volume * fadeVolume(f, clip.duration, clip.fadeIn, clip.fadeOut));
    }}
    pauseWhenBuffering
  />
);

export const ImageContent: React.FC<{ clip: ClipOf<"image">; local: number }> = ({ clip, local }) => {
  const kb = clip.kenBurns ? 1 + (clip.kenBurns * 0.12 * local) / Math.max(1, clip.duration) : 1;
  return <Img src={clip.src} style={{ width: "100%", height: "100%", objectFit: clip.fit, transform: `scale(${kb})` }} />;
};

export const SolidContent: React.FC<{ clip: ClipOf<"solid">; local: number }> = ({ clip, local }) => {
  const g = clip.gradient;
  if (!g) return <AbsoluteFill style={{ background: clip.color }} />;
  const stops = g.stops.map(([c, p]) => `${c} ${p}%`).join(", ");
  const angle = g.angle + clip.drift * local * 0.5;
  const bg = g.kind === "linear" ? `linear-gradient(${angle}deg, ${stops})` : `radial-gradient(circle at ${50 + Math.sin(local * 0.01 * clip.drift) * 20}% ${50 + Math.cos(local * 0.013 * clip.drift) * 20}%, ${stops})`;
  return <AbsoluteFill style={{ background: bg }} />;
};

export const AdjustmentContent: React.FC<{ clip: ClipOf<"adjustment"> }> = ({ clip }) => {
  // The ClipLayer filter is applied to this element; backdrop-filter carries the grade onto layers below.
  const e = clip.effects;
  const parts: string[] = [];
  const b = e.brightness * Math.pow(2, e.exposure);
  if (b !== 1) parts.push(`brightness(${b})`);
  if (e.contrast !== 1) parts.push(`contrast(${e.contrast})`);
  if (e.saturation !== 1) parts.push(`saturate(${e.saturation})`);
  if (e.hue) parts.push(`hue-rotate(${e.hue}deg)`);
  if (e.grayscale) parts.push(`grayscale(${e.grayscale})`);
  if (e.blur) parts.push(`blur(${e.blur}px)`);
  if (e.temperature) parts.push(`sepia(${Math.max(0, e.temperature) * 0.35})`, `hue-rotate(${e.temperature < 0 ? -e.temperature * 25 : -e.temperature * 8}deg)`);
  const lb = clip.letterbox;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backdropFilter: parts.join(" ") || undefined, WebkitBackdropFilter: parts.join(" ") || undefined }} />
      {lb > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${lb * 100}%`, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lb * 100}%`, background: "#000" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- text */

function splitUnits(text: string, by: "letter" | "word" | "line"): string[] {
  if (by === "letter") return Array.from(text);
  if (by === "line") return text.split("\n");
  return text.split(/(\s+)/).filter((s) => s.length > 0);
}

export const TextContent: React.FC<{ clip: ClipOf<"text">; motion: Motion; local: number }> = ({ clip, motion, local }) => {
  const s = clip.style;
  const color = sampleString(clip.keyframes, "color", local, s.color);
  const shadows: string[] = [];
  if (s.shadow) shadows.push(s.shadow);
  if (s.glow) shadows.push(`0 0 8px ${s.glow}`, `0 0 24px ${s.glow}`, `0 0 60px ${s.glow}`);
  if (s.extrude > 0) for (let i = 1; i <= s.extrude; i++) shadows.push(`${i}px ${i}px 0 ${s.extrudeColor}`);
  const base: React.CSSProperties = {
    fontFamily: `"${s.fontFamily}", Inter, system-ui, sans-serif`,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontStyle: s.italic ? "italic" : "normal",
    color,
    textAlign: s.align,
    letterSpacing: `${s.letterSpacing}em`,
    lineHeight: s.lineHeight,
    textTransform: s.textTransform,
    WebkitTextStroke: s.strokeWidth > 0 && s.strokeColor ? `${s.strokeWidth}px ${s.strokeColor}` : undefined,
    textShadow: shadows.length ? shadows.join(", ") : undefined,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
  if (s.gradient) {
    Object.assign(base, {
      backgroundImage: `linear-gradient(90deg, ${s.gradient[0]}, ${s.gradient[1]})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    });
  }

  let content: React.ReactNode = clip.text;

  if (clip.words && clip.words.length) {
    // animated captions: highlight the active word
    content = clip.words.map((w, i) => {
      const active = local >= w.start && local < w.end;
      const shown = local >= w.start - 2;
      const pop = active ? interpolate(local - w.start, [0, 4], [1.18, 1.06], { extrapolateRight: "clamp" }) : 1;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.25em",
            transform: `scale(${pop})`,
            color: active || w.highlight ? clip.highlightColor : undefined,
            opacity: shown ? 1 : 0.35,
          }}
        >
          {w.text}
        </span>
      );
    });
  } else if (motion.textPreset) {
    const spec = motion.textPreset;
    const units = splitUnits(clip.text, spec.splitBy);
    const visibleUnits = units.filter((u) => u.trim().length > 0).length;
    let vi = 0;
    content = units.map((u, i) => {
      if (u.trim().length === 0) return <span key={i}>{u}</span>;
      const idx = motion.textPhase === "out" ? visibleUnits - 1 - vi : vi;
      vi++;
      const p = unitProgress(spec, idx, visibleUnits, motion.textProgress);
      if (spec.preset === "typewriter") return <span key={i} style={{ opacity: p > 0.5 ? 1 : 0 }}>{u}</span>;
      // kinetic: each unit rises, scales and unblurs
      const k = spec.intensity;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: p,
            transform: `translateY(${(1 - p) * 0.6 * k}em) scale(${0.7 + 0.3 * p}) rotate(${(1 - p) * 8 * k}deg)`,
            filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
          }}
        >
          {u}
        </span>
      );
    });
  }

  const caret = motion.textPreset?.preset === "typewriter" && motion.textProgress < 1 ? <span style={{ opacity: Math.floor(local / 8) % 2 ? 1 : 0 }}>▍</span> : null;

  return (
    <AbsoluteFill style={{ alignItems: s.align === "left" ? "flex-start" : s.align === "right" ? "flex-end" : "center", justifyContent: "center" }}>
      <div
        style={{
          ...base,
          background: s.background ?? undefined,
          padding: s.padding || undefined,
          borderRadius: s.borderRadius || undefined,
          maxWidth: "100%",
        }}
      >
        {content}
        {caret}
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- shape */

export const ShapeContent: React.FC<{ clip: ClipOf<"shape">; local: number }> = ({ clip, local }) => {
  const fillColor = sampleString(clip.keyframes, "color", local, clip.fill);
  const gid = `sg-${clip.id}`;
  const fill = clip.gradient ? `url(#${gid})` : fillColor;
  const stroke = clip.stroke ?? "none";
  const sw = clip.strokeWidth;
  const p = Math.max(0, Math.min(1, clip.progress));
  const defs = clip.gradient ? (
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={clip.gradient[0]} />
        <stop offset="100%" stopColor={clip.gradient[1]} />
      </linearGradient>
    </defs>
  ) : null;
  let shape: React.ReactNode;
  switch (clip.shape) {
    case "rect":
      shape = <rect x={sw / 2} y={sw / 2} width={`calc(100% - ${sw}px)`} height={`calc(100% - ${sw}px)`} rx={clip.radius} fill={fill} stroke={stroke} strokeWidth={sw} />;
      break;
    case "ellipse":
      shape = <ellipse cx="50%" cy="50%" rx={`calc(50% - ${sw / 2}px)`} ry={`calc(50% - ${sw / 2}px)`} fill={fill} stroke={stroke} strokeWidth={sw} />;
      break;
    case "triangle":
      shape = <polygon points="50,2 98,98 2,98" fill={fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />;
      break;
    case "star": {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 48 : 20;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
      }
      shape = <polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />;
      break;
    }
    case "line":
      shape = <line x1="0" y1="50" x2={100 * p} y2="50" stroke={fillColor} strokeWidth={Math.max(2, sw || 6)} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
      break;
    case "arrow": {
      const end = 4 + 92 * p;
      shape = (
        <g stroke={fillColor} strokeWidth={Math.max(3, sw || 8)} strokeLinecap="round" strokeLinejoin="round" fill="none" vectorEffect="non-scaling-stroke">
          <line x1="4" y1="50" x2={end} y2="50" vectorEffect="non-scaling-stroke" />
          {p > 0.6 ? <polyline points={`${end - 14},34 ${end},50 ${end - 14},66`} vectorEffect="non-scaling-stroke" /> : null}
        </g>
      );
      break;
    }
    case "ring": {
      const c = 2 * Math.PI * 45;
      shape = (
        <circle cx="50" cy="50" r="45" fill="none" stroke={fillColor} strokeWidth={Math.max(2, sw || 6)} strokeDasharray={`${c * p} ${c}`} transform="rotate(-90 50 50)" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      );
      break;
    }
  }
  const percentBox = clip.shape === "rect" || clip.shape === "ellipse";
  return (
    <svg width="100%" height="100%" viewBox={percentBox ? undefined : "0 0 100 100"} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      {defs}
      {shape}
    </svg>
  );
};

/* --------------------------------------------------------------- scene */

function cameraMotion(camera: string, t: number) {
  const c = camera.toLowerCase();
  let scale = 1.05;
  let x = 0;
  let y = 0;
  let rot = 0;
  if (c.includes("dolly-out") || c.includes("dolly out") || c.includes("zoom out")) scale = 1.25 - 0.2 * t;
  else if (c.includes("dolly") || c.includes("push") || c.includes("zoom")) scale = 1.02 + 0.22 * t;
  if (c.includes("pan left")) x = 80 - 160 * t;
  if (c.includes("pan right")) x = -80 + 160 * t;
  if (c.includes("tilt up")) y = 60 - 120 * t;
  if (c.includes("tilt down")) y = -60 + 120 * t;
  if (c.includes("orbit")) rot = -4 + 8 * t;
  if (c.includes("crane") || c.includes("drone")) {
    y = 80 - 160 * t;
    scale = 1.15 - 0.1 * t;
  }
  if (c.includes("handheld")) {
    x += Math.sin(t * 40) * 6;
    y += Math.cos(t * 33) * 5;
  }
  return { scale, x, y, rot };
}

export const SceneContent: React.FC<{ clip: ClipOf<"scene">; local: number }> = ({ clip, local }) => {
  const { width, height } = useVideoConfig();
  const t = local / Math.max(1, clip.duration);
  const cam = cameraMotion(clip.camera, t);
  const [c0, c1, c2] = [clip.palette[0] ?? "#0b0d12", clip.palette[1] ?? "#1e232e", clip.palette[2] ?? clip.palette[1] ?? "#8b7bff"];
  const unit = Math.min(width, height);
  return (
    <AbsoluteFill style={{ background: c0, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)` }}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${30 + 40 * t}% 35%, ${c2}88 0%, transparent 45%), radial-gradient(circle at 75% ${70 - 20 * t}%, ${c1} 0%, transparent 55%), linear-gradient(160deg, ${c0}, ${c1})` }} />
        <AbsoluteFill style={{ backgroundImage: `linear-gradient(${c2}14 1px, transparent 1px), linear-gradient(90deg, ${c2}14 1px, transparent 1px)`, backgroundSize: `${unit / 12}px ${unit / 12}px`, opacity: 0.6 }} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: unit * 0.05,
          bottom: unit * 0.05,
          right: unit * 0.05,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ fontSize: unit * 0.022, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.65 }}>
          Storyboard · Scene {clip.sceneIndex + 1}
          {clip.camera ? ` · ${clip.camera}` : ""}
        </div>
        <div style={{ fontSize: unit * 0.05, fontWeight: 700, marginTop: unit * 0.01 }}>{clip.title}</div>
        <div style={{ fontSize: unit * 0.024, opacity: 0.7, marginTop: unit * 0.01, maxWidth: "80%", lineHeight: 1.35 }}>{clip.description}</div>
        {clip.status !== "planned" ? (
          <div style={{ marginTop: unit * 0.015, fontSize: unit * 0.02, color: clip.status === "failed" ? "#ff8a9a" : "#a99dff" }}>
            {clip.status === "generating" ? "Generating footage…" : `Generation failed: ${clip.error ?? "unknown error"}`}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
