import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {KineticText} from './KineticText';

/** Big serif chapter numeral that lands, then settles to the left of the two-line title. */
export const ChapterHeader: React.FC<{n: number; title: string[]; start?: number}> = ({n, title, start = 6}) => {
  const frame = useCurrentFrame();
  const land = prog(frame, start, 16, ease.out);
  const settle = prog(frame, start + 20, 18, ease.inOut);
  const lineW = prog(frame, start + 14, 22, ease.out);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: mix(settle, 300, 150),
          left: mix(settle, 540, 120),
          transform: `translate(${mix(settle, -50, 0)}%, 0) scale(${mix(land, 1.6, 1) * mix(settle, 1.5, 1)})`,
          transformOrigin: 'left top',
          fontFamily: F.serif,
          fontSize: 210,
          lineHeight: 0.8,
          color: C.accent,
          opacity: land,
          filter: land < 1 ? `blur(${(1 - land) * 14}px)` : undefined,
          textShadow: `0 0 60px ${C.accentGlow}`,
        }}
      >
        0{n}
      </div>
      <div style={{position: 'absolute', top: 160, left: 360, right: 80}}>
        <KineticText lines={title} start={start + 24} stagger={3} size={88} align="left" />
      </div>
      <div style={{position: 'absolute', top: 400, left: 120, width: 840 * lineW, height: 2, background: `linear-gradient(90deg, ${C.accent}, ${C.line} 40%, transparent)`}} />
    </>
  );
};
