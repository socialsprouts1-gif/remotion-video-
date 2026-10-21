import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {DISPLAY, P, SANS} from '../tokens';

/** Layout helper: the same scenes drive the 9:16 reel and the 16:9 display version. */
export const useLayout = () => {
  const {width: W, height: H} = useVideoConfig();
  const v = H > W;
  const u = Math.min(W, H) / 1080; // type scale unit
  return {W, H, v, u};
};

// ------------------------------------------------------------------ typography

/**
 * Masked line reveal: the line rises out of a mask while its tracking tightens,
 * then exits upward into the mask.
 */
export const Line: React.FC<{
  t: number;
  at: number;
  out: number;
  children: React.ReactNode;
  x?: number;
  y: number;
  w?: number;
  size: number;
  font?: string;
  weight?: number;
  italic?: boolean;
  color?: string;
  track?: number;
  align?: 'left' | 'center' | 'right';
  dur?: number;
}> = ({t, at, out, children, x = 0, y, w, size, font = DISPLAY, weight = 800, italic, color = P.cream, track = 0.02, align = 'center', dur = 0.65}) => {
  const {W} = useLayout();
  if (t < at - 0.02 || t > out + 0.02) return null;
  const p = pt(t, at, at + dur, ease.out);
  const q = pt(t, out - 0.35, out, ease.in);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w ?? W - x, overflow: 'hidden', paddingBottom: size * 0.12, textAlign: align}}>
      <div
        style={{
          fontFamily: font,
          fontSize: size,
          fontWeight: weight,
          fontStyle: italic ? 'italic' : 'normal',
          lineHeight: 1.08,
          color,
          letterSpacing: `${track + (1 - p) * 0.18}em`,
          paddingLeft: align === 'center' ? `${track}em` : 0,
          transform: `translateY(${(1 - p) * 105 - q * 105}%)`,
          whiteSpace: 'nowrap',
          textShadow: '0 4px 28px rgba(10,5,2,0.55)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Extruded 3D wordmark: stacked chocolate layers under a cream face, with a moving light sweep. */
export const Extruded: React.FC<{
  text: string;
  size: number;
  depth?: number;
  face?: string;
  sweep?: number; // 0..1 position of the light sweep (outside = none)
  track?: number;
  style?: React.CSSProperties;
}> = ({text, size, depth = 14, face = P.cream, sweep = -1, track = 0.06, style}) => {
  const layers: string[] = [];
  for (let i = 1; i <= depth; i++) {
    const k = i / depth;
    const c = `rgb(${Math.round(lerp(150, 40, k))}, ${Math.round(lerp(92, 22, k))}, ${Math.round(lerp(56, 12, k))})`;
    layers.push(`${i * 0.5}px ${i * 0.9}px 0 ${c}`);
  }
  layers.push(`${depth * 0.6}px ${depth * 1.6}px ${depth * 2.2}px rgba(0,0,0,0.55)`);
  const base: React.CSSProperties = {fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: `${track}em`, paddingLeft: `${track}em`, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', ...style}}>
      <div style={{...base, color: face, textShadow: layers.join(', ')}}>{text}</div>
      {sweep > 0 && sweep < 1 && (
        <div
          style={{
            ...base,
            position: 'absolute',
            inset: 0,
            color: 'transparent',
            backgroundImage: `linear-gradient(110deg, transparent ${sweep * 150 - 35}%, rgba(255,236,196,0.95) ${sweep * 150 - 22}%, transparent ${sweep * 150 - 9}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export const Rule: React.FC<{t: number; at: number; x: number; y: number; w: number; color?: string}> = ({t, at, x, y, w, color = P.gold}) => {
  const p = pt(t, at, at + 0.7, ease.inOut);
  return <div style={{position: 'absolute', left: x + (w / 2) * (1 - p), top: y, width: w * p, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`}} />;
};

export const Kicker: React.FC<{t: number; at: number; out: number; x?: number; y: number; w?: number; text: string; color?: string; size?: number; align?: 'left' | 'center'}> = ({
  t,
  at,
  out,
  x,
  y,
  w,
  text,
  color = P.gold,
  size,
  align = 'center',
}) => {
  const {u} = useLayout();
  return (
    <Line t={t} at={at} out={out} x={x} y={y} w={w} size={size ?? 30 * u} font={SANS} weight={500} track={0.32} color={color} align={align} dur={0.55}>
      {text}
    </Line>
  );
};

// ------------------------------------------------------------------ photos

/**
 * A café photo with a slow camera move inside a frame.
 * zoom: [from, to], focus: transform origin (0..1) the camera pushes toward.
 */
export const Photo: React.FC<{
  src: string;
  p: number; // 0..1 progress of the move
  zoom: [number, number];
  focus: [number, number];
  pan?: [number, number]; // px drift x,y over the move
  grade?: string;
  style?: React.CSSProperties;
  fit?: 'cover' | 'contain';
}> = ({src, p, zoom, focus, pan = [0, 0], grade = 'saturate(1.08) contrast(1.06) brightness(1.0)', style, fit = 'cover'}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: fit,
        objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
        transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`,
        transform: `translate(${pan[0] * p}px, ${pan[1] * p}px) scale(${lerp(zoom[0], zoom[1], p)})`,
        filter: grade,
      }}
    />
  </div>
);

/** Full-bleed blurred, darkened copy of a photo: ambient backdrop behind framed cards. */
export const Backdrop: React.FC<{src: string; p: number; dim?: number}> = ({src, p, dim = 0.42}) => (
  <div style={{position: 'absolute', inset: -80, overflow: 'hidden'}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.25 + 0.08 * p})`, filter: `blur(34px) brightness(${dim}) saturate(1.2)`}} />
  </div>
);

/** Warm diagonal light sweep, clipped to its parent. */
export const Sweep: React.FC<{p: number; strength?: number; width?: number}> = ({p, strength = 0.45, width = 0.22}) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          height: '160%',
          width: `${width * 100}%`,
          left: `${lerp(-40, 120, p)}%`,
          transform: 'rotate(18deg)',
          background: `linear-gradient(90deg, transparent, rgba(255,226,170,${strength}), transparent)`,
          filter: 'blur(14px)',
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------ atmosphere

/** A handful of slow golden motes. Deterministic, sparse. */
export const Motes: React.FC<{t: number; n?: number; o?: number}> = ({t, n = 34, o = 1}) => {
  const {W, H} = useLayout();
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const sp = 18 + rand(i * 2.1) * 40;
        const x = rand(i * 1.3) * W + Math.sin(t * 0.6 + i) * 24;
        const y = ((rand(i * 3.7) * (H + 200) - t * sp) % (H + 200) + H + 200) % (H + 200) - 100;
        const s = 2 + rand(i * 5.9) * 5;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.5 + rand(i) * 2) + i * 4));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: P.goldSoft, opacity: tw * 0.8, boxShadow: `0 0 ${s * 4}px ${s}px rgba(226,180,107,0.35)`}} />;
      })}
    </div>
  );
};

/** A coffee bean (vector), optionally out of focus for depth. */
export const Bean: React.FC<{x: number; y: number; s: number; rot: number; blur?: number; o?: number}> = ({x, y, s, rot, blur = 0, o = 1}) => (
  <svg width={60 * s} height={80 * s} viewBox="-30 -40 60 80" style={{position: 'absolute', left: x - 30 * s, top: y - 40 * s, transform: `rotate(${rot}deg)`, filter: blur ? `blur(${blur}px)` : undefined, opacity: o, overflow: 'visible'}}>
    <defs>
      <radialGradient id="bn" cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor="#8a5434" />
        <stop offset="0.55" stopColor="#4a2814" />
        <stop offset="1" stopColor="#1e0f07" />
      </radialGradient>
    </defs>
    <ellipse rx={24} ry={34} fill="url(#bn)" />
    <path d="M2 -30 C-12 -12 14 8 -2 30" fill="none" stroke="#170a04" strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={-9} cy={-14} rx={5} ry={9} fill="rgba(255,220,180,0.18)" />
  </svg>
);

/** Scene shell with whip / zoom transitions on its edges. */
export const Shell: React.FC<{
  t: number;
  a: number;
  b: number;
  enter?: 'whipL' | 'whipU' | 'zoom' | 'fade' | 'none';
  exit?: 'whipL' | 'whipU' | 'zoom' | 'fade' | 'none';
  children: React.ReactNode;
}> = ({t, a, b, enter = 'none', exit = 'none', children}) => {
  const {W, H} = useLayout();
  if (t < a - 0.01 || t > b + 0.3) return null;
  const pin = 1 - pt(t, a, a + 0.32, ease.out); // 1 → 0 entering
  const pout = pt(t, b - 0.24, b, ease.in); // 0 → 1 leaving
  let tx = 0;
  let ty = 0;
  let sc = 1;
  let bl = 0;
  let op = 1;
  const apply = (kind: string, k: number, sign: 1 | -1) => {
    if (kind === 'whipL') {
      tx += sign * k * W * 0.9;
      bl += k * 40;
    } else if (kind === 'whipU') {
      ty += sign * k * H * 0.6;
      bl += k * 40;
    } else if (kind === 'zoom') {
      sc *= sign > 0 ? 1 - 0.25 * k : 1 + 0.6 * k;
      bl += k * 24;
      op *= 1 - k;
    } else if (kind === 'fade') {
      op *= 1 - k;
    }
  };
  apply(enter, pin, 1);
  apply(exit, pout, -1);
  if (t > b) return null;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined, opacity: op}}>
      {children}
    </div>
  );
};
