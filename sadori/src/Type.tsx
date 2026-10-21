import React from 'react';
import {ease, pt} from './anim';
import {SANS, SERIF} from './fonts';

export const C = {
  ivory: '#F3EBDD',
  gold: '#D9BC8A',
  goldDeep: '#A8875A',
  char: '#141210',
};

/**
 * Minimal luxury title: letters resolve from a soft blur with a slight rise,
 * staggered left to right, and leave as one soft fade.
 */
export const Title: React.FC<{
  t: number;
  at: number;
  out: number;
  text: string;
  y: number;
  size?: number;
  italic?: boolean;
  weight?: number;
  track?: number;
  font?: 'serif' | 'sans';
  color?: string;
  stagger?: number;
  upper?: boolean;
}> = ({t, at, out, text, y, size = 76, italic, weight = 400, track = 0.04, font = 'serif', color = C.ivory, stagger = 0.035, upper}) => {
  if (t < at - 0.05 || t > out + 0.05) return null;
  const leave = pt(t, out - 0.45, out, ease.in);
  const chars = Array.from(text);
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: y,
        textAlign: 'center',
        fontFamily: font === 'serif' ? SERIF : SANS,
        fontSize: size,
        fontStyle: italic ? 'italic' : 'normal',
        fontWeight: weight,
        letterSpacing: `${track}em`,
        paddingLeft: `${track}em`,
        color,
        lineHeight: 1.15,
        textTransform: upper ? 'uppercase' : 'none',
        opacity: 1 - leave,
        filter: leave > 0 ? `blur(${leave * 10}px)` : undefined,
        textShadow: '0 2px 30px rgba(0,0,0,0.6)',
      }}
    >
      {chars.map((ch, i) => {
        const p = pt(t, at + i * stagger, at + i * stagger + 0.9, ease.out);
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: p < 1 ? `blur(${(1 - p) * 9}px)` : undefined}}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Thin gold rule that grows from the centre. */
export const Rule: React.FC<{t: number; at: number; out: number; y: number; w?: number}> = ({t, at, out, y, w = 160}) => {
  const p = pt(t, at, at + 0.9, ease.inOut) * (1 - pt(t, out - 0.4, out, ease.in));
  if (p <= 0) return null;
  return <div style={{position: 'absolute', top: y, left: 540 - (w / 2) * p, width: w * p, height: 1.5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />;
};
