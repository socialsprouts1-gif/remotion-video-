import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneId, SCENES} from '../config';
import {ease, mix, prog} from '../lib/anim';

export type Enter = 'fade' | 'zoomIn' | 'rise' | 'whip' | 'none';
export type Exit = 'fade' | 'zoomThrough' | 'blurUp' | 'whip' | 'none';

const Inner: React.FC<{enter: Enter; exit: Exit; children: React.ReactNode}> = ({enter, exit, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pi = enter === 'none' ? 1 : prog(frame, 0, 12, ease.out);
  const pe = exit === 'none' ? 0 : prog(frame, durationInFrames - 10, 10, ease.in);
  let scale = 1;
  let y = 0;
  let blur = 0;
  let opacity = 1;
  if (enter !== 'none') opacity *= pi;
  if (enter === 'zoomIn') {
    scale *= mix(pi, 1.08, 1);
    blur += (1 - pi) * 12;
  }
  if (enter === 'rise') {
    y += (1 - pi) * 80;
    blur += (1 - pi) * 10;
  }
  let rotY = 0;
  let x = 0;
  if (enter === 'whip') {
    rotY += (1 - pi) * 40;
    x += (1 - pi) * 520;
    blur += (1 - pi) * 22;
  }
  if (exit === 'whip') {
    rotY -= pe * 40;
    x -= pe * 520;
    blur += pe * 22;
  }
  if (exit !== 'none') opacity *= 1 - pe;
  if (exit === 'zoomThrough') {
    scale *= 1 + pe * 0.18;
    blur += pe * 16;
  }
  if (exit === 'blurUp') {
    y -= pe * 90;
    blur += pe * 12;
  }
  return (
    <AbsoluteFill style={{opacity, transform: `perspective(1800px) translate(${x}px, ${y}px) rotateY(${rotY}deg) scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

/** Places a scene on the master timeline and blends it with its neighbours. Children use scene-local frames. */
export const SceneShell: React.FC<{id: SceneId; enter?: Enter; exit?: Exit; children: React.ReactNode}> = ({
  id,
  enter = 'zoomIn',
  exit = 'zoomThrough',
  children,
}) => {
  const {from, dur} = SCENES[id];
  return (
    <Sequence from={from} durationInFrames={dur} name={id}>
      <Inner enter={enter} exit={exit}>
        {children}
      </Inner>
    </Sequence>
  );
};
