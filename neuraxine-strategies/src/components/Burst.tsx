import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';

export type Look = 'white' | 'lime' | 'red' | 'pill' | 'serif' | 'ghost' | 'strike';
export type Word = {
  t: number; // scene-relative seconds
  text: string;
  g: number; // group: a group stays until the next group starts
  look?: Look;
  size?: number;
  x?: number; // centre offset px
  y?: number; // centre offset px from 960
  from?: 'z' | 'left' | 'right' | 'top' | 'flip';
};

const looks: Record<Look, (size: number) => React.CSSProperties> = {
  white: (s) => ({color: C.ink, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}),
  lime: (s) => ({color: C.accent, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}),
  red: (s) => ({color: C.bad, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}),
  pill: (s) => ({color: '#0A0A0A', background: C.ink, borderRadius: s, padding: `${s * 0.08}px ${s * 0.36}px`, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}),
  serif: (s) => ({color: C.ink, fontFamily: F.serif, fontStyle: 'italic', fontSize: s * 1.15, letterSpacing: '-0.01em', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}),
  ghost: (s) => ({color: 'transparent', WebkitTextStroke: `2px ${C.muted}`, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em'}),
  strike: (s) => ({color: C.muted, fontFamily: F.display, fontWeight: 900, fontSize: s, letterSpacing: '-0.03em', textDecoration: `line-through ${Math.max(6, s * 0.08)}px ${C.bad}`}),
};

/** Shrink a word until its estimated width fits the safe area (900 px). */
const MAX_W = 900;
const fit = (text: string, look: Look, size: number) => {
  const upper = text === text.toUpperCase();
  const k = look === 'serif' ? 0.48 : upper ? 0.72 : 0.58;
  const pad = look === 'pill' ? 0.8 : 0;
  const est = (text.length * k + pad) * size;
  return est > MAX_W ? Math.floor((size * MAX_W) / est) : size;
};

/**
 * Lyric-style 3D kinetic type: every word slams in on its spoken time (from depth, a side, or a flip),
 * the whole group drifts toward the camera, and when the next group lands it flies past the lens.
 * A slow camera roll keeps the frame alive.
 */
export const Burst: React.FC<{words: Word[]; roll?: number}> = ({words, roll = 1.5}) => {
  const frame = useCurrentFrame();
  const groups = [...new Set(words.map((w) => w.g))];
  const groupStart = (g: number) => Math.min(...words.filter((w) => w.g === g).map((w) => w.t));
  const cam = Math.sin(frame / 34) * roll;
  return (
    <AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 50%'}}>
      {groups.map((g, gi) => {
        const a = Math.round(groupStart(g) * 30);
        const next = groups[gi + 1];
        const b = next === undefined ? Infinity : Math.round(groupStart(next) * 30);
        if (frame < a - 2 || frame > b + 2) return null;
        const out = b === Infinity ? 0 : prog(frame, b - 7, 7, ease.in);
        const push = Math.min(frame - a, 60) * 0.35; // slow dolly toward camera, capped
        return (
          <AbsoluteFill
            key={g}
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateZ(${cam + (gi % 2 ? 0.6 : -0.6)}deg) rotateY(${Math.sin((frame + gi * 40) / 45) * 2.5}deg) translateZ(${push + out * 900}px)`,
              opacity: 1 - out,
              filter: out > 0 ? `blur(${out * 16}px)` : undefined,
            }}
          >
            {words
              .filter((w) => w.g === g)
              .map((w, i) => {
                const st = Math.round(w.t * 30);
                const p = prog(frame, st, 9, ease.out);
                if (p <= 0) return null;
                const size = fit(w.text, w.look ?? 'white', w.size ?? 130);
                const blur = (1 - p) * 18;
                let tr = '';
                switch (w.from ?? 'z') {
                  case 'left':
                    tr = `translateX(${(1 - p) * -700}px) rotateY(${(1 - p) * -60}deg)`;
                    break;
                  case 'right':
                    tr = `translateX(${(1 - p) * 700}px) rotateY(${(1 - p) * 60}deg)`;
                    break;
                  case 'top':
                    tr = `translateY(${(1 - p) * -500}px) rotateX(${(1 - p) * 70}deg)`;
                    break;
                  case 'flip':
                    tr = `rotateX(${(1 - p) * -100}deg)`;
                    break;
                  default:
                    tr = `translateZ(${(1 - p) * 900}px)`;
                }
                const hit = Math.sin(Math.min(1, prog(frame, st + 6, 8)) * Math.PI) * 0.06;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 960 + (w.y ?? 0),
                      display: 'flex',
                      justifyContent: 'center',
                      transform: `translate(${w.x ?? 0}px, -50%) ${tr} scale(${mix(p, 1.25, 1) + hit})`,
                      opacity: Math.min(1, p * 1.6),
                      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                    }}
                  >
                    <span style={{whiteSpace: 'nowrap', lineHeight: 1, ...looks[w.look ?? 'white'](size)}}>{w.text}</span>
                  </div>
                );
              })}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
