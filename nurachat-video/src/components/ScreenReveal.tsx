import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, mix, prog, velBlur} from '../lib/anim';

type Pose = {x?: number; y?: number; s?: number; rx?: number; ry?: number; rz?: number; o?: number};

type Props = {
  children: React.ReactNode;
  start?: number;
  dur?: number;
  from?: Pose; // entrance starts here and settles at identity
  exitAt?: number;
  exitDur?: number;
  to?: Pose; // exit heads here
  originY?: number; // canvas y the 3D rotation pivots on
  float?: number; // idle drift amplitude in px (subtle parallax life)
};

const ID = {x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, o: 1};

/** Brings a screen/card in with perspective (tilted, low, small → flat, centred) and out the same way. */
export const ScreenReveal: React.FC<Props> = ({
  children,
  start = 0,
  dur = 26,
  from = {y: 360, s: 0.86, rx: 26, o: 0},
  exitAt,
  exitDur = 14,
  to = {y: -160, s: 0.92, rx: -10, o: 0},
  originY = 960,
  float = 6,
}) => {
  const frame = useCurrentFrame();
  const f = {...ID, ...from};
  const t = {...ID, ...to};

  const pose = (fr: number) => {
    const p = prog(fr, start, dur, ease.out);
    const e = exitAt === undefined ? 0 : prog(fr, exitAt, exitDur, ease.in);
    const k = (key: keyof typeof ID) => mix(p, f[key], ID[key]) + (t[key] - ID[key]) * e;
    return {x: k('x'), y: k('y'), s: k('s'), rx: k('rx'), ry: k('ry'), rz: k('rz'), o: mix(p, f.o, 1) * mix(e, 1, t.o)};
  };
  const P = pose(frame);
  const blur = velBlur((fr) => pose(fr).y + pose(fr).x, frame, 0.05, 10);
  const drift = Math.sin((frame - start) / 38) * float;

  return (
    <AbsoluteFill style={{perspective: 2400, perspectiveOrigin: `540px ${originY}px`}}>
      <AbsoluteFill
        style={{
          transformOrigin: `540px ${originY}px`,
          transform: `translate3d(${P.x}px, ${P.y + drift}px, 0) scale(${P.s}) rotateX(${P.rx}deg) rotateY(${P.ry}deg) rotateZ(${P.rz}deg)`,
          opacity: P.o,
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
