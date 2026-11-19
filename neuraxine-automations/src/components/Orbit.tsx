import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Slow hand-held 3D orbit for a whole scene: tilt, sway and a gentle push-in. */
export const Orbit: React.FC<{children: React.ReactNode; amount?: number}> = ({children, amount = 1}) => {
  const frame = useCurrentFrame();
  const rx = (5 + Math.sin(frame / 50) * 2) * amount;
  const ry = Math.sin(frame / 38) * 5 * amount;
  const s = 1 + Math.min(frame, 300) * 0.00012;
  return (
    <AbsoluteFill style={{perspective: 2000, perspectiveOrigin: '50% 40%'}}>
      <AbsoluteFill style={{transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`, transformStyle: 'preserve-3d'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
