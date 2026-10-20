import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../theme';
import {ease, pt, rand} from '../lib/anim';

// ------------------------------------------------------------------ kinetic words
type WordsProps = {
  t: number;
  text: string; // *accent* markup
  at: number;
  out?: number; // exit start (s)
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  y: number; // centre line, canvas px
  exitMode?: 'up' | 'blur';
  dim?: number; // 0..1 fade towards 35% (for a line that steps back)
};

/** Words rise through their own masks with velocity blur, then leave. Lime only where the copy says *so*. */
export const Words: React.FC<WordsProps> = ({t, text, at, out, size, weight = 800, color = C.white, stagger = 0.07, y, exitMode = 'blur', dim = 0}) => {
  let accent = false;
  const words = text.split(' ').map((w) => {
    let s = w;
    let a = accent;
    if (s.startsWith('*')) {
      a = accent = true;
      s = s.slice(1);
    }
    if (s.endsWith('*')) {
      accent = false;
      s = s.slice(0, -1);
    }
    return {s, a};
  });
  if (t < at - 0.05) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        color,
        whiteSpace: 'nowrap',
        opacity: 1 - dim * 0.65,
      }}
    >
      {words.map((w, i) => {
        const p = pt(t, at + i * stagger, at + i * stagger + 0.55, ease.out);
        const pPrev = pt(t - 1 / 30, at + i * stagger, at + i * stagger + 0.55, ease.out);
        const e = out === undefined ? 0 : pt(t, out + i * 0.03, out + i * 0.03 + 0.4, ease.in);
        const vb = Math.abs(p - pPrev) * size * 0.9;
        const ty = (1 - p) * size * 1.1 - (exitMode === 'up' ? e * size * 1.1 : 0);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.12em 0.05em 0.2em', margin: '-0.12em 0.13em -0.2em', verticalAlign: 'top'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${ty}px) scale(${exitMode === 'blur' ? 1 + e * 0.08 : 1})`,
                filter: vb + e * 14 > 0.2 ? `blur(${vb + e * 14}px)` : undefined,
                opacity: exitMode === 'blur' ? 1 - e : 1,
                color: w.a ? C.lime : undefined,
                textShadow: w.a ? `0 0 ${size * 0.4}px rgba(${C.limeRGB},0.35)` : undefined,
              }}
            >
              {w.s}
            </span>
          </span>
        );
      })}
    </div>
  );
};


/** Grain + vignette over everything. */
export const Lens: React.FC<{t: number}> = ({t}) => {
  const seed = Math.floor(t * 30) % 8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
      <AbsoluteFill
        style={{
          opacity: 0.06,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
          )}")`,
          backgroundPosition: `${rand(seed) * 200}px ${rand(seed + 1) * 200}px`,
        }}
      />
    </AbsoluteFill>
  );
};
