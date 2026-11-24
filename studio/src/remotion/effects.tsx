/**
 * Procedural, fully editable motion-graphic effects. Each effect is a pure
 * function of (frame, params, seed) so preview and render are identical.
 */
import React from "react";
import { AbsoluteFill, interpolate, random, useVideoConfig } from "remotion";
import type { ClipOf } from "../lib/project/schema";
import { defaultParams } from "../lib/motion/effects";
import { ease } from "../lib/motion/easing";

type P = Record<string, unknown>;
const n = (p: P, k: string, d: number) => (typeof p[k] === "number" ? (p[k] as number) : d);
const s = (p: P, k: string, d: string) => (typeof p[k] === "string" ? (p[k] as string) : d);
const arr = <T,>(p: P, k: string, d: T[]) => (Array.isArray(p[k]) ? (p[k] as T[]) : d);

const Particles: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const count = Math.round(n(p, "count", 120));
  const size = n(p, "size", 6);
  const speed = n(p, "speed", 1);
  const color = s(p, "color", "#fff");
  const bokeh = n(p, "bokeh", 0.4);
  const dir = s(p, "direction", "up");
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = (k: string) => random(`${seed}-${k}-${i}`);
    const depth = 0.3 + r("d") * 0.7;
    const sz = size * depth * (0.5 + r("s"));
    const v = speed * depth * (0.5 + r("v")) * 2;
    let x = r("x") * width;
    let y = r("y") * height;
    if (dir === "up") y = (((y - f * v) % height) + height) % height;
    else if (dir === "down") y = (y + f * v) % height;
    else if (dir === "drift") {
      x = (((x + f * v * 0.6) % width) + width) % width;
      y += Math.sin(f * 0.03 + i) * 20;
    } else {
      const a = r("a") * Math.PI * 2;
      const dist = f * v * 3;
      x = width / 2 + Math.cos(a) * dist;
      y = height / 2 + Math.sin(a) * dist;
    }
    const tw = 0.5 + 0.5 * Math.sin(f * 0.08 * (0.5 + r("t")) + i);
    const blur = bokeh * (1 - depth) * sz * 0.8;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: sz,
          height: sz,
          borderRadius: "50%",
          background: color,
          opacity: (0.25 + 0.75 * tw) * depth,
          filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
          boxShadow: `0 0 ${sz * 2}px ${color}`,
        }}
      />,
    );
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

const LightStreaks: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const count = Math.round(n(p, "count", 8));
  const color = s(p, "color", "#7cc7ff");
  const speed = n(p, "speed", 1.2);
  const angle = n(p, "angle", -12);
  return (
    <AbsoluteFill style={{ transform: `rotate(${angle}deg) scale(1.4)` }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-ls-${k}-${i}`);
        const len = width * (0.2 + r("l") * 0.5);
        const period = width + len;
        const x = ((r("x") * period + f * speed * (8 + r("v") * 20)) % period) - len;
        const y = r("y") * height;
        const th = 1 + r("t") * 4;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: len, height: th, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, filter: `blur(${th / 2}px)`, opacity: 0.4 + r("o") * 0.6, boxShadow: `0 0 ${th * 6}px ${color}` }} />
        );
      })}
    </AbsoluteFill>
  );
};

const Glitch: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { height } = useVideoConfig();
  const intensity = n(p, "intensity", 0.6);
  const freq = n(p, "frequency", 0.35);
  const step = Math.floor(f / 2);
  const active = random(`${seed}-g-${step}`) < freq;
  if (!active) return null;
  const bars = Math.round(3 + intensity * 10);
  return (
    <AbsoluteFill>
      {Array.from({ length: bars }, (_, i) => {
        const r = (k: string) => random(`${seed}-gb-${k}-${i}-${step}`);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(r("x") - 0.3) * 40}%`,
              width: `${40 + r("w") * 80}%`,
              top: r("y") * height,
              height: 2 + r("h") * 40 * intensity,
              background: r("c") > 0.5 ? s(p, "colorA", "#ff1f6d") : s(p, "colorB", "#20f0ff"),
              opacity: 0.25 + r("o") * 0.6 * intensity,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ p: P; f: number }> = ({ p, f }) => {
  const color = s(p, "color", "#8b7bff");
  const density = n(p, "density", 16);
  const speed = n(p, "speed", 1);
  const offset = (f * speed * 2) % 100;
  return (
    <AbsoluteFill style={{ background: s(p, "background", "#07080b"), overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 600 }}>
        <div
          style={{
            position: "absolute",
            left: "-50%",
            width: "200%",
            top: "50%",
            height: "100%",
            transform: "rotateX(70deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
            backgroundSize: `${100 / density}% ${100 / density}%`,
            backgroundPosition: `0 ${offset}%`,
            maskImage: "linear-gradient(to bottom, transparent, black 40%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%)",
            opacity: 0.7,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}44, transparent 60%)` }} />
    </AbsoluteFill>
  );
};

const Orbs: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const colors = arr<string>(p, "colors", ["#8b7bff", "#5ee1ff", "#ff6b9a"]);
  const speed = n(p, "speed", 1);
  const blur = n(p, "blur", 140);
  return (
    <AbsoluteFill style={{ background: s(p, "background", "#07080b"), overflow: "hidden" }}>
      {colors.map((c, i) => {
        const r = (k: string) => random(`${seed}-o-${k}-${i}`);
        const R = Math.min(width, height) * (0.35 + r("r") * 0.3);
        const x = width * (0.2 + 0.6 * r("x")) + Math.sin(f * 0.01 * speed + i * 2) * width * 0.15;
        const y = height * (0.2 + 0.6 * r("y")) + Math.cos(f * 0.012 * speed + i) * height * 0.15;
        return <div key={i} style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%", background: c, filter: `blur(${blur}px)`, opacity: 0.75 }} />;
      })}
    </AbsoluteFill>
  );
};

const LowerThird: React.FC<{ p: P; f: number; d: number }> = ({ p, f, d }) => {
  const inP = ease("easeOutCubic", f / 18);
  const outP = ease("easeInCubic", (f - (d - 14)) / 14);
  const bar = Math.max(0, inP - outP);
  const text = Math.max(0, ease("easeOutCubic", (f - 8) / 16) - outP);
  const accent = s(p, "accent", "#8b7bff");
  return (
    <AbsoluteFill style={{ justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
        <div style={{ width: 12, background: accent, transform: `scaleY(${bar})`, transformOrigin: "bottom" }} />
        <div style={{ background: s(p, "panel", "rgba(10,12,18,0.85)"), padding: "0 40px", display: "flex", flexDirection: "column", justifyContent: "center", clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`, minWidth: "70%" }}>
          <div style={{ color: s(p, "textColor", "#fff"), fontSize: 58, fontWeight: 800, opacity: text, transform: `translateY(${(1 - text) * 20}px)` }}>{s(p, "title", "")}</div>
          <div style={{ color: accent, fontSize: 30, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: text, marginTop: 6 }}>{s(p, "subtitle", "")}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BarChart: React.FC<{ p: P; f: number }> = ({ p, f }) => {
  const values = arr<number>(p, "values", [32, 58, 41, 77, 95]);
  const labels = arr<string>(p, "labels", []);
  const max = Math.max(1, ...values);
  const color = s(p, "color", "#8b7bff");
  const textColor = s(p, "textColor", "#e4e7ee");
  const suffix = s(p, "suffix", "");
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "flex-end", gap: "3%", padding: "0 4% 10%", fontFamily: "Inter, sans-serif" }}>
      {values.map((v, i) => {
        const t = ease("easeOutCubic", (f - i * 5) / 30);
        return (
          <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", position: "relative" }}>
            <div style={{ color: textColor, fontSize: 40, fontWeight: 700, marginBottom: 10, opacity: t }}>{Math.round(v * t)}{suffix}</div>
            <div style={{ width: "100%", height: `${(v / max) * 80 * t}%`, background: `linear-gradient(180deg, ${color}, ${color}66)`, borderRadius: "14px 14px 4px 4px", boxShadow: `0 0 40px ${color}55` }} />
            <div style={{ position: "absolute", bottom: "-12%", color: textColor, fontSize: 30, opacity: 0.7 }}>{labels[i] ?? ""}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ p: P; f: number; d: number }> = ({ p, f, d }) => {
  const from = n(p, "from", 0);
  const to = n(p, "to", 12500);
  const dec = n(p, "decimals", 0);
  const t = ease("easeOutCubic", f / Math.max(1, Math.min(d, 60)));
  const v = from + (to - from) * t;
  const str = v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: `"${s(p, "fontFamily", "Space Grotesk")}", Inter, sans-serif`, color: s(p, "color", "#fff") }}>
      <div style={{ fontSize: 160, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {s(p, "prefix", "")}
        {str}
        {s(p, "suffix", "")}
      </div>
      <div style={{ fontSize: 40, opacity: 0.7, marginTop: 10 }}>{s(p, "label", "")}</div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ p: P; f: number; d: number }> = ({ p, f, d }) => (
  <AbsoluteFill style={{ background: s(p, "track", "rgba(255,255,255,0.15)") }}>
    <div style={{ height: "100%", width: `${(f / Math.max(1, d - 1)) * 100}%`, background: s(p, "color", "#8b7bff") }} />
  </AbsoluteFill>
);

const LightLeak: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const sp = n(p, "speed", 1);
  const x = 50 + Math.sin(f * 0.02 * sp + seed) * 40;
  const y = 40 + Math.cos(f * 0.017 * sp + seed) * 30;
  return (
    <AbsoluteFill
      style={{
        opacity: n(p, "intensity", 0.7) * (0.6 + 0.4 * Math.sin(f * 0.05 * sp)),
        background: `radial-gradient(ellipse 60% 80% at ${x}% ${y}%, ${s(p, "color", "#ff8a3d")} 0%, transparent 60%), radial-gradient(ellipse 50% 60% at ${100 - x}% ${100 - y}%, ${s(p, "color2", "#ff3d7f")} 0%, transparent 55%)`,
        filter: "blur(40px)",
      }}
    />
  );
};

const FilmGrain: React.FC<{ p: P; f: number; id: string }> = ({ p, f, id }) => (
  <AbsoluteFill style={{ opacity: n(p, "amount", 0.35) }}>
    <svg width="100%" height="100%">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency={n(p, "size", 0.9)} numOctaves="3" seed={f % 113} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  </AbsoluteFill>
);

const Hud: React.FC<{ p: P; f: number }> = ({ p, f }) => {
  const { width, height } = useVideoConfig();
  const c = s(p, "color", "#5ee1ff");
  const sp = n(p, "speed", 1);
  const R = Math.min(width, height) * 0.3;
  const appear = ease("easeOutCubic", f / 30);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: appear, fontFamily: "JetBrains Mono, monospace", color: c }}>
      <svg width={R * 2.4} height={R * 2.4} viewBox="-120 -120 240 240" style={{ overflow: "visible" }}>
        <g fill="none" stroke={c} strokeWidth="1.2">
          <circle r="100" strokeDasharray="4 6" transform={`rotate(${f * 0.6 * sp})`} />
          <circle r="84" strokeDasharray={`${180 * appear} 400`} strokeWidth="3" transform={`rotate(${-f * 1.2 * sp})`} />
          <circle r="60" opacity="0.6" />
          <circle r="40" strokeDasharray="2 3" transform={`rotate(${f * 2 * sp})`} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="0" y1="-108" x2="0" y2="-116" transform={`rotate(${i * 30})`} />
          ))}
          <line x1="-130" y1="0" x2="-70" y2="0" />
          <line x1="70" y1="0" x2="130" y2="0" />
          <line x1="0" y1="-130" x2="0" y2="-70" />
          <line x1="0" y1="70" x2="0" y2="130" />
        </g>
      </svg>
      <div style={{ position: "absolute", top: height / 2 + R * 1.3, fontSize: Math.round(R * 0.12), letterSpacing: "0.3em" }}>{s(p, "label", "SYSTEM ONLINE")}</div>
      <div style={{ position: "absolute", left: width * 0.06, top: height * 0.08, fontSize: Math.round(R * 0.08), lineHeight: 1.6, opacity: 0.8 }}>
        <div>LAT {(37.7749 + Math.sin(f * 0.05) * 0.01).toFixed(4)}</div>
        <div>LON {(-122.4194 + Math.cos(f * 0.04) * 0.01).toFixed(4)}</div>
        <div>SIG {(80 + Math.sin(f * 0.2) * 15).toFixed(1)}%</div>
      </div>
    </AbsoluteFill>
  );
};

const Scanlines: React.FC<{ p: P; f: number }> = ({ p, f }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,${n(p, "opacity", 0.25)}) 0px, rgba(0,0,0,${n(p, "opacity", 0.25)}) 1px, transparent 1px, transparent ${n(p, "spacing", 4)}px)`,
      opacity: 0.85 + 0.15 * Math.sin(f * 1.3),
    }}
  />
);

const NeonFrame: React.FC<{ p: P; f: number }> = ({ p, f }) => {
  const c = s(p, "color", "#ff4fd8");
  const th = n(p, "thickness", 8);
  const flick = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <AbsoluteFill style={{ padding: n(p, "inset", 60) }}>
      <div style={{ width: "100%", height: "100%", border: `${th}px solid ${c}`, borderRadius: n(p, "radius", 32), boxShadow: `0 0 20px ${c}, 0 0 60px ${c}, inset 0 0 20px ${c}`, opacity: flick }} />
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const colors = arr<string>(p, "colors", ["#ffd84d", "#ff6b9a", "#5ee1ff"]);
  const count = Math.round(n(p, "count", 160));
  const g = n(p, "gravity", 1);
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-cf-${k}-${i}`);
        const a = -Math.PI / 2 + (r("a") - 0.5) * 2.2;
        const v = 18 + r("v") * 26;
        const t = f;
        const x = width / 2 + Math.cos(a) * v * t * 0.9;
        const y = height * 0.65 + Math.sin(a) * v * t + 0.5 * g * 1.1 * t * t;
        const rot = t * (10 + r("r") * 30);
        if (y > height + 50) return null;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14, height: 8, background: colors[i % colors.length], transform: `rotate(${rot}deg) rotateX(${rot * 2}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

const Smoke: React.FC<{ p: P; f: number; id: string }> = ({ p, f, id }) => (
  <AbsoluteFill style={{ opacity: n(p, "density", 0.5) }}>
    <svg width="100%" height="100%">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.008" numOctaves="4" seed="3" />
        <feOffset dx={-f * n(p, "speed", 1) * 2} dy="0" />
        <feColorMatrix type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.4`} />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} fill={s(p, "color", "#c8d0e0")} />
    </svg>
  </AbsoluteFill>
);

const Fire: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const c = s(p, "color", "#ff7a1a");
  const count = Math.round(n(p, "count", 90));
  const sp = n(p, "speed", 1.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 30% at 50% 110%, ${c}aa, transparent 70%)`, opacity: 0.7 + 0.3 * Math.sin(f * 0.4) }} />
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-fe-${k}-${i}`);
        const life = height * (0.4 + r("l") * 0.6);
        const prog = ((f * sp * (2 + r("v") * 4) + r("o") * life) % life) / life;
        const x = r("x") * width + Math.sin(f * 0.05 + i) * 30;
        const y = height - prog * life;
        const sz = 2 + r("s") * 5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: "#ffd27a", boxShadow: `0 0 ${sz * 4}px ${c}`, opacity: (1 - prog) * 0.9 }} />;
      })}
    </AbsoluteFill>
  );
};

const LiquidBlob: React.FC<{ p: P; f: number; id: string }> = ({ p, f, id }) => {
  const colors = arr<string>(p, "colors", ["#8b7bff", "#5ee1ff"]);
  const sp = n(p, "speed", 1);
  const w = n(p, "wobble", 0.35);
  const pts: string[] = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 40 * (1 + w * 0.25 * (Math.sin(a * 3 + f * 0.05 * sp) + Math.sin(a * 5 - f * 0.03 * sp) * 0.6));
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${f * sp} 0.5 0.5)`}>
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1] ?? colors[0]} />
        </linearGradient>
      </defs>
      <polygon points={pts.join(" ")} fill={`url(#${id})`} />
    </svg>
  );
};

const Geometric: React.FC<{ p: P; f: number; seed: number }> = ({ p, f, seed }) => {
  const { width, height } = useVideoConfig();
  const colors = arr<string>(p, "colors", ["#8b7bff", "#5ee1ff", "#ffffff"]);
  const count = Math.round(n(p, "count", 18));
  const sp = n(p, "speed", 1);
  const solid = s(p, "style", "outline") === "solid";
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-geo-${k}-${i}`);
        const size = 30 + r("s") * 140;
        const x = r("x") * width;
        const y = (r("y") * height + f * sp * (0.3 + r("v"))) % (height + size);
        const kind = Math.floor(r("k") * 3);
        const c = colors[i % colors.length];
        const style: React.CSSProperties = { position: "absolute", left: x, top: y - size, width: size, height: size, transform: `rotate(${f * sp * (r("r") - 0.5) * 4}deg)`, opacity: 0.3 + r("o") * 0.5 };
        if (kind === 0) return <div key={i} style={{ ...style, border: solid ? undefined : `3px solid ${c}`, background: solid ? c : undefined }} />;
        if (kind === 1) return <div key={i} style={{ ...style, borderRadius: "50%", border: solid ? undefined : `3px solid ${c}`, background: solid ? c : undefined }} />;
        return (
          <svg key={i} style={style} viewBox="0 0 100 100">
            <polygon points="50,5 95,95 5,95" fill={solid ? c : "none"} stroke={c} strokeWidth="4" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const LightSweep: React.FC<{ p: P; f: number; d: number }> = ({ p, f, d }) => {
  const t = interpolate(f, [0, Math.max(2, d)], [-30, 130]);
  const w = n(p, "width", 18);
  const c = s(p, "color", "#fff");
  return (
    <AbsoluteFill
      style={{
        opacity: n(p, "intensity", 0.8),
        background: `linear-gradient(${90 + n(p, "angle", 20)}deg, transparent ${t - w}%, ${c}cc ${t}%, transparent ${t + w}%)`,
      }}
    />
  );
};

export const EffectContent: React.FC<{ clip: ClipOf<"effect">; local: number }> = ({ clip, local }) => {
  const p: P = { ...defaultParams(clip.effect), ...clip.params };
  const f = local;
  const seed = clip.seed;
  const id = `fx-${clip.id}`;
  switch (clip.effect) {
    case "particles":
      return <Particles p={p} f={f} seed={seed} />;
    case "light-streaks":
      return <LightStreaks p={p} f={f} seed={seed} />;
    case "glitch":
      return <Glitch p={p} f={f} seed={seed} />;
    case "grid":
      return <Grid p={p} f={f} />;
    case "orbs":
      return <Orbs p={p} f={f} seed={seed} />;
    case "lower-third":
      return <LowerThird p={p} f={f} d={clip.duration} />;
    case "bar-chart":
      return <BarChart p={p} f={f} />;
    case "counter":
      return <Counter p={p} f={f} d={clip.duration} />;
    case "progress-bar":
      return <ProgressBar p={p} f={f} d={clip.duration} />;
    case "light-leak":
      return <LightLeak p={p} f={f} seed={seed} />;
    case "film-grain":
      return <FilmGrain p={p} f={f} id={id} />;
    case "hud":
      return <Hud p={p} f={f} />;
    case "scanlines":
      return <Scanlines p={p} f={f} />;
    case "neon-frame":
      return <NeonFrame p={p} f={f} />;
    case "confetti":
      return <Confetti p={p} f={f} seed={seed} />;
    case "smoke":
      return <Smoke p={p} f={f} id={id} />;
    case "fire":
      return <Fire p={p} f={f} seed={seed} />;
    case "liquid-blob":
      return <LiquidBlob p={p} f={f} id={id} />;
    case "geometric":
      return <Geometric p={p} f={f} seed={seed} />;
    case "light-sweep":
      return <LightSweep p={p} f={f} d={clip.duration} />;
  }
};
