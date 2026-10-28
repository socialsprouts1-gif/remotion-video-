import React from 'react';
import {Img, staticFile} from 'remotion';
import edit from './edit.json';

export const C = {
  dark: '#121110',
  dark2: '#1C1A18',
  cream: '#EFEDE7',
  cream2: '#E6E3DB',
  green: '#1F9D55',
  greenDeep: '#178A49',
  greenBg: '#1E9A51',
  ink: '#141414',
  white: '#FFFFFF',
  red: '#E5484D',
  gold: '#F2B33D',
  mute: '#8C8780',
  wa: '#25D366',
  waDeep: '#0B7A5E',
  blush: '#F4C6CF',
};
export const SANS = 'InterVar, Inter, Helvetica, Arial, sans-serif';
export const SERIF = '"Instrument Serif", Georgia, serif';
export const MONO = '"Geist Mono", ui-monospace, monospace';

export const Fonts: React.FC = () => (
  <style>{`
@font-face{font-family:InterVar;src:url(${staticFile('fonts/inter-var.woff2')}) format('woff2');font-weight:100 900;}
@font-face{font-family:"Instrument Serif";font-style:italic;src:url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2');}
@font-face{font-family:"Instrument Serif";font-style:normal;src:url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2');}
@font-face{font-family:"Geist Mono";src:url(${staticFile('fonts/GeistMono.ttf')}) format('truetype');font-weight:100 900;}
`}</style>
);

// ---- timing helpers -------------------------------------------------------
type Word = {w: string; s: number; e: number; line: number};
export const WORDS = edit.words as Word[];
const byLine: Word[][] = [];
WORDS.forEach((w) => (byLine[w.line] = byLine[w.line] || []).push(w));
/** start time (s) of word k of line l */
export const W = (l: number, k: number) => byLine[l][k].s;
export const WE = (l: number, k: number) => byLine[l][k].e;
export const LINE = edit.lines as number[];
export const SPEECH = edit.speech;
export const DUR = edit.duration;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** eased 0..1 between t0 and t0+d */
export const ep = (t: number, t0: number, d = 0.5) => outExpo(clamp01((t - t0) / d));
export const eio = (t: number, t0: number, d = 0.6) => inOut(clamp01((t - t0) / d));
/** damped spring 0 -> 1 with a little overshoot */
export const sp = (t: number, t0: number, k = 1) => {
  if (t <= t0) return 0;
  const x = (t - t0) * k;
  return 1 - Math.exp(-8 * x) * Math.cos(12 * x);
};
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const icon = (n: string) => staticFile(`icons/${n}`);

// ---- reusable pieces --------------------------------------------------------
/** pop-in wrapper: scale spring + rise + un-blur */
export const Pop: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number; dy?: number; rot?: number}> = ({
  t,
  at,
  children,
  style,
  from = 0.6,
  dy = 40,
  rot = 0,
}) => {
  const s = sp(t, at);
  const o = ep(t, at, 0.25);
  return (
    <div
      style={{
        ...style,
        opacity: o,
        transform: `${style?.transform ?? ''} translateY(${(1 - ep(t, at, 0.6)) * dy}px) scale(${lerp(from, 1, s)}) rotate(${rot * (1 - ep(t, at, 0.7))}deg)`,
        filter: `blur(${(1 - o) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dark?: boolean}> = ({children, style, dark}) => (
  <div
    style={{
      background: dark ? '#22201D' : C.white,
      borderRadius: 34,
      boxShadow: dark
        ? '0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 2px 0 rgba(0,0,0,0.04), 0 30px 60px rgba(40,30,20,0.16), 0 8px 18px rgba(40,30,20,0.08)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 22, color = C.mute, style}) => (
  <div style={{fontFamily: MONO, fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase', color, fontWeight: 600, ...style}}>{children}</div>
);

export const Check: React.FC<{size?: number; color?: string; stroke?: string; p?: number}> = ({size = 30, color = C.green, stroke = '#fff', p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="15" fill={color} />
    <path d="M8.5 15.5 L13 20 L21.5 10.5" fill="none" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22" strokeDashoffset={22 * (1 - p)} />
  </svg>
);

/** rubber-stamp tag that slams in, rotated */
export const Stamp: React.FC<{t: number; at: number; text: string; color?: string; rot?: number; style?: React.CSSProperties; size?: number; fill?: boolean}> = ({
  t,
  at,
  text,
  color = C.green,
  rot = -8,
  style,
  size = 46,
  fill = false,
}) => {
  if (t < at) return null;
  const s = sp(t, at, 1.3);
  return (
    <div
      style={{
        position: 'absolute',
        transform: `rotate(${rot}deg) scale(${lerp(2.2, 1, s)})`,
        opacity: ep(t, at, 0.12),
        border: `5px solid ${color}`,
        color: fill ? '#fff' : color,
        background: fill ? color : 'rgba(255,255,255,0.0)',
        borderRadius: 14,
        padding: '8px 22px',
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.12em',
        whiteSpace: 'nowrap',
        boxShadow: fill ? '0 16px 40px rgba(0,0,0,0.3)' : 'none',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export const Phone: React.FC<{children: React.ReactNode; w?: number; h?: number; style?: React.CSSProperties; dark?: boolean}> = ({children, w = 470, h = 900, style, dark}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 64,
      background: '#0E0E0E',
      padding: 12,
      boxShadow: dark ? '0 50px 100px rgba(0,0,0,0.7), 0 0 0 2px #2B2926' : '0 50px 90px rgba(40,30,20,0.28), 0 0 0 2px #2B2926',
      position: 'relative',
      ...style,
    }}
  >
    <div style={{width: '100%', height: '100%', borderRadius: 53, overflow: 'hidden', position: 'relative', background: '#EFE7DE'}}>{children}</div>
    <div style={{position: 'absolute', top: 26, left: '50%', width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: '#0E0E0E'}} />
  </div>
);

/** WhatsApp header inside a phone */
export const WaHeader: React.FC<{name: string; sub: string}> = ({name, sub}) => (
  <div style={{background: '#F6F5F2', padding: '74px 26px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E2DDD5'}}>
    <div style={{width: 62, height: 62, borderRadius: 31, background: 'linear-gradient(135deg,#CFE3F5,#8DB7E0)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={icon('house_with_garden.png')} style={{width: 40, height: 40}} />
    </div>
    <div style={{fontFamily: SANS}}>
      <div style={{fontWeight: 700, fontSize: 27, color: C.ink, display: 'flex', alignItems: 'center', gap: 8}}>
        {name}
        <Check size={22} color={C.wa} />
      </div>
      <div style={{fontSize: 20, color: C.green, fontWeight: 500}}>{sub}</div>
    </div>
  </div>
);

export const Bubble: React.FC<{me?: boolean; children: React.ReactNode; time?: string; style?: React.CSSProperties; tag?: string}> = ({me, children, time = '10:42', style, tag}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', ...style}}>
    <div
      style={{
        maxWidth: 360,
        background: me ? '#D9FDD3' : '#fff',
        borderRadius: 22,
        borderTopRightRadius: me ? 6 : 22,
        borderTopLeftRadius: me ? 22 : 6,
        padding: '14px 18px 10px',
        fontFamily: SANS,
        fontSize: 23,
        lineHeight: 1.3,
        color: C.ink,
        boxShadow: '0 2px 2px rgba(0,0,0,0.06)',
      }}
    >
      {tag && <Mono size={15} color={C.waDeep} style={{marginBottom: 6, letterSpacing: '0.1em'}}>{tag}</Mono>}
      {children}
      <div style={{fontSize: 15, color: '#8A9690', textAlign: 'right', marginTop: 4}}>
        {time} {me && <span style={{color: '#34B7F1'}}>✓✓</span>}
      </div>
    </div>
  </div>
);
