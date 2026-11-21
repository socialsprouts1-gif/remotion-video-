import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, SERIF, W, WE, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';

// Same palette as the salon / restaurant edits: cream, black, green.
export type Theme = 'dark' | 'cream' | 'green';
export type Tok = {bg: string; fg: string; sub: string; card: string; cardFg: string; cardSub: string; chip: string; chipFg: string; accent: string; line: string};
export const TH: Record<Theme, Tok> = {
  dark: {bg: C.dark, fg: '#fff', sub: '#9A948C', card: '#22201D', cardFg: '#fff', cardSub: '#9A948C', chip: '#2A2724', chipFg: '#fff', accent: C.green, line: 'rgba(255,255,255,0.10)'},
  cream: {bg: C.cream, fg: C.ink, sub: '#8C8780', card: '#fff', cardFg: C.ink, cardSub: '#8C8780', chip: '#fff', chipFg: C.ink, accent: C.green, line: 'rgba(0,0,0,0.08)'},
  green: {bg: C.greenBg, fg: '#fff', sub: 'rgba(255,255,255,0.78)', card: '#fff', cardFg: C.ink, cardSub: '#8C8780', chip: '#fff', chipFg: C.ink, accent: C.ink, line: 'rgba(0,0,0,0.08)'},
};

export const fl = (n: string) => staticFile(`fluent/${n}.png`);
export const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});
export const float = (t: number, seed: number, amp = 8) => `translateY(${Math.sin(t * 1.4 + seed) * amp}px) rotate(${Math.sin(t * 0.9 + seed) * 2}deg)`;

/** 3D icon with soft contact shadow and idle float */
export const Icon3D: React.FC<{n: string; size: number; t: number; seed?: number; style?: React.CSSProperties}> = ({n, size, t, seed = 0, style}) => (
  <div style={{position: 'relative', width: size, height: size, ...style}}>
    <div style={{position: 'absolute', left: size * 0.18, right: size * 0.18, bottom: -size * 0.06, height: size * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.22)', filter: `blur(${size * 0.05}px)`, transform: `scaleX(${1 - Math.sin(t * 1.4 + seed) * 0.08})`}} />
    <Img src={fl(n)} style={{width: size, height: size, transform: float(t, seed, size * 0.03)}} />
  </div>
);

export const TCard: React.FC<{th: Tok; children: React.ReactNode; style?: React.CSSProperties}> = ({th, children, style}) => (
  <div
    style={{
      background: th.card,
      borderRadius: 34,
      boxShadow: th === TH.dark ? '0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 2px 0 rgba(0,0,0,0.04), 0 30px 60px rgba(40,30,20,0.16), 0 8px 18px rgba(40,30,20,0.08)',
      color: th.cardFg,
      ...style,
    }}
  >
    {children}
  </div>
);
export const Label: React.FC<{children: React.ReactNode; color: string; size?: number; style?: React.CSSProperties}> = ({children, color, size = 20, style}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);
export const Chip: React.FC<{th: Tok; img: string; txt: string; strong?: boolean}> = ({th, img, txt, strong}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, background: strong ? C.green : th.chip, color: strong ? '#fff' : th.chipFg, borderRadius: 40, padding: '12px 26px 12px 14px', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 16px 34px rgba(0,0,0,0.18)'}}>
    <Img src={fl(img)} style={{width: 44, height: 44}} /> {txt}
  </div>
);

/** Earlier-video headline: bold sans line + serif italic line, centred. */
type Seg = [string, boolean?];
export const Headline: React.FC<{t: number; at: number; th: Tok; a: Seg[][]; b?: Seg[][]; swap?: number}> = ({t, at, th, a, b, swap}) => {
  const showB = !!b && swap !== undefined && t >= swap;
  const rows = showB ? b! : a;
  const t0 = showB ? swap! : at;
  const out = !showB && b && swap !== undefined ? ep(t, swap - 0.25, 0.25) : 0;
  let k = 0;
  return (
    <div style={{position: 'absolute', top: 478, left: 50, right: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', color: th.fg, opacity: 1 - out, transform: `translateY(${-out * 24}px)`}}>
      {rows.map((row, ri) => (
        <div key={ri + (showB ? 'b' : 'a')} style={{display: 'flex', whiteSpace: 'pre', lineHeight: 1.04}}>
          {row.map(([txt, serif], si) => {
            const p = ep(t, t0 + 0.05 + k++ * 0.11, 0.7);
            return (
              <span key={si} style={{fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 700, fontSize: serif ? 96 : 80, letterSpacing: serif ? '-0.01em' : '-0.035em', display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - p) * 12}px)`}}>
                {txt}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

