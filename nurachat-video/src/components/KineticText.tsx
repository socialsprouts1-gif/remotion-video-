import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {ease, mix, prog, velBlur} from '../lib/anim';

type Word = {text: string; accent: boolean};

/** "Your *WhatsApp* thing" → words with accent flags. Accents may span words: "*More Organized*". */
export const parseMarkup = (line: string): Word[] => {
  let inAccent = false;
  return line
    .split(' ')
    .filter(Boolean)
    .map((tok) => {
      let t = tok;
      let accent = inAccent;
      if (t.startsWith('*')) {
        accent = true;
        inAccent = true;
        t = t.slice(1);
      }
      if (t.endsWith('*')) {
        inAccent = false;
        t = t.slice(0, -1);
      }
      return {text: t, accent};
    });
};

export type KineticMode = 'rise' | 'scale' | 'slide';
export type ExitMode = 'up' | 'blur' | 'scaleUp';

type Props = {
  lines: string[];
  start?: number;
  stagger?: number; // frames between words
  dur?: number; // frames per word entrance
  size?: number;
  weight?: number;
  family?: string;
  color?: string;
  accent?: string;
  lineHeight?: number;
  letterSpacing?: string;
  align?: 'left' | 'center' | 'right';
  mode?: KineticMode;
  exitAt?: number;
  exitMode?: ExitMode;
  exitDur?: number;
  uppercase?: boolean;
  style?: React.CSSProperties;
};

/**
 * Bold kinetic typography. Each word enters through its own mask (rise),
 * drops in from scale with blur (scale) or slides through a horizontal mask (slide).
 * Motion blur is derived from per-frame velocity, so it only appears while moving.
 */
export const KineticText: React.FC<Props> = ({
  lines,
  start = 0,
  stagger = 3,
  dur = 16,
  size = 120,
  weight = 900,
  family = F.display,
  color = C.white,
  accent = C.lime,
  lineHeight = 1.0,
  letterSpacing = '-0.035em',
  align = 'center',
  mode = 'rise',
  exitAt,
  exitMode = 'up',
  exitDur = 12,
  uppercase = false,
  style,
}) => {
  const frame = useCurrentFrame();
  let idx = 0;

  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing,
        color,
        textAlign: align,
        textTransform: uppercase ? 'uppercase' : undefined,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{whiteSpace: 'nowrap'}}>
          {parseMarkup(line).map((w, wi, words) => {
            const i = idx++;
            const ws = start + i * stagger;
            const p = (f: number) => prog(f, ws, dur, ease.out);
            const e = exitAt === undefined ? 0 : prog(frame, exitAt + i * 1.5, exitDur, ease.in);

            let transform = '';
            let opacity = 1;
            let blur = 0;
            if (mode === 'rise') {
              const ty = (f: number) => (1 - p(f)) * size * 1.15;
              transform = `translateY(${ty(frame)}px)`;
              blur = velBlur(ty, frame, 0.09);
            } else if (mode === 'scale') {
              const sc = (f: number) => mix(p(f), 1.45, 1);
              transform = `scale(${sc(frame)})`;
              opacity = p(frame);
              blur = mix(p(frame), 18, 0);
            } else {
              const tx = (f: number) => (1 - p(f)) * size * 2.2;
              transform = `translateX(${tx(frame)}px)`;
              opacity = Math.min(1, p(frame) * 2.5);
              blur = velBlur(tx, frame, 0.06);
            }

            if (e > 0) {
              if (exitMode === 'up') {
                transform += ` translateY(${-e * size * 1.15}px)`;
                blur += e * 6;
              } else if (exitMode === 'blur') {
                opacity *= 1 - e;
                blur += e * 18;
                transform += ` scale(${1 + e * 0.12})`;
              } else {
                opacity *= 1 - e;
                blur += e * 24;
                transform += ` scale(${1 + e * 0.6})`;
              }
            }

            const masked = mode !== 'scale';
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  overflow: masked ? 'hidden' : 'visible',
                  // room for descenders and the blur halo inside the mask
                  padding: '0.06em 0.04em 0.14em',
                  margin: '-0.06em -0.04em -0.14em',
                  marginRight: wi < words.length - 1 ? '0.22em' : '-0.04em',
                  verticalAlign: 'top',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform,
                    opacity,
                    filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
                    color: w.accent ? accent : undefined,
                    textShadow: w.accent ? `0 0 ${size * 0.35}px rgba(194,255,61,0.35)` : undefined,
                    willChange: 'transform',
                  }}
                >
                  {w.text}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small uppercase kicker label above titles. */
export const Kicker: React.FC<{text: string; start?: number; exitAt?: number; style?: React.CSSProperties}> = ({
  text,
  start = 0,
  exitAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 14);
  const e = exitAt === undefined ? 0 : prog(frame, exitAt, 10, ease.in);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 22px',
        borderRadius: 999,
        border: `1px solid rgba(194,255,61,0.35)`,
        background: 'rgba(194,255,61,0.07)',
        color: C.lime,
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: '0.18em',
        opacity: p * (1 - e),
        transform: `translateY(${(1 - p) * 20 - e * 20}px)`,
        ...style,
      }}
    >
      <span style={{width: 10, height: 10, borderRadius: 99, background: C.lime, boxShadow: `0 0 12px ${C.lime}`}} />
      {text}
    </div>
  );
};
