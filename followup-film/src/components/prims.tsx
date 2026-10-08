import React from 'react';
import {C, FONT} from '../theme';
import {V} from '../lib/anim';

/** Shared SVG gradients. Glows are radial gradients (cheap), not blur filters. */
export const Defs: React.FC = () => (
  <defs>
    {[
      ['gLime', C.limeRGB],
      ['gWhite', C.whiteRGB],
      ['gGrey', '139,146,141'],
    ].map(([id, rgb]) => (
      <radialGradient key={id} id={id}>
        <stop offset="0%" stopColor={`rgba(${rgb},0.9)`} />
        <stop offset="18%" stopColor={`rgba(${rgb},0.35)`} />
        <stop offset="45%" stopColor={`rgba(${rgb},0.09)`} />
        <stop offset="100%" stopColor={`rgba(${rgb},0)`} />
      </radialGradient>
    ))}
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>
);

export type Tone = 'lime' | 'white' | 'grey';
const RGB: Record<Tone, string> = {lime: C.limeRGB, white: C.whiteRGB, grey: '139,146,141'};
const GRAD: Record<Tone, string> = {lime: 'url(#gLime)', white: 'url(#gWhite)', grey: 'url(#gGrey)'};

/** A network node: soft halo + crisp core. */
export const Dot: React.FC<{p: V; r: number; tone?: Tone; o?: number; halo?: number; core?: string}> = ({
  p,
  r,
  tone = 'white',
  o = 1,
  halo = 1,
  core,
}) => {
  if (o <= 0.002) return null;
  return (
    <g opacity={o}>
      {halo > 0 && <circle cx={p.x} cy={p.y} r={r * 7 * halo} fill={GRAD[tone]} />}
      <circle cx={p.x} cy={p.y} r={r} fill={core ?? `rgb(${RGB[tone]})`} />
    </g>
  );
};

/** A connection: wide faint glow under a thin bright core. `draw` animates it from a to b. */
export const Link: React.FC<{
  a: V;
  b: V;
  tone?: Tone;
  o?: number;
  w?: number;
  draw?: number;
  dash?: string;
  c?: V; // optional quadratic control point
}> = ({a, b, tone = 'white', o = 1, w = 2, draw = 1, dash, c}) => {
  if (o <= 0.002 || draw <= 0) return null;
  const d = c ? `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}` : `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const rgb = RGB[tone];
  const drawProps = draw < 1 ? {pathLength: 1, strokeDasharray: `${draw} 1`} : {};
  return (
    <g opacity={o} fill="none" strokeLinecap="round">
      <path d={d} stroke={`rgba(${rgb},0.16)`} strokeWidth={w * 5} {...drawProps} />
      <path d={d} stroke={`rgba(${rgb},0.95)`} strokeWidth={w} strokeDasharray={draw < 1 ? `${draw} 1` : dash} pathLength={draw < 1 ? 1 : undefined} />
    </g>
  );
};

/** Comet trail behind a moving point — reads as motion blur. `at(dt)` returns the position dt seconds ago. */
export const Trail: React.FC<{at: (dt: number) => V; len?: number; w?: number; tone?: Tone; o?: number}> = ({
  at,
  len = 0.35,
  w = 6,
  tone = 'lime',
  o = 1,
}) => {
  const N = 12;
  const pts = Array.from({length: N}, (_, i) => at((i / (N - 1)) * len));
  return (
    <g opacity={o} strokeLinecap="round">
      {pts.slice(0, -1).map((p, i) => (
        <line
          key={i}
          x1={p.x}
          y1={p.y}
          x2={pts[i + 1].x}
          y2={pts[i + 1].y}
          stroke={`rgba(${RGB[tone]},${0.7 * (1 - i / (N - 1))})`}
          strokeWidth={w * (1 - (i / N) * 0.8)}
        />
      ))}
    </g>
  );
};

/** World-space label that keeps a constant on-screen size (divide by zoom). */
export const Label: React.FC<{
  p: V;
  text: string;
  z: number;
  size?: number;
  color?: string;
  o?: number;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  spacing?: number;
  dy?: number;
}> = ({p, text, z, size = 22, color = C.grey, o = 1, anchor = 'middle', weight = 600, spacing = 0.18, dy = 0}) => {
  if (o <= 0.002) return null;
  const s = size / z;
  return (
    <text
      x={p.x}
      y={p.y + dy / z}
      fontFamily={FONT}
      fontWeight={weight}
      fontSize={s}
      letterSpacing={`${spacing}em`}
      fill={color}
      textAnchor={anchor}
      dominantBaseline="middle"
      opacity={o}
    >
      {text}
    </text>
  );
};
