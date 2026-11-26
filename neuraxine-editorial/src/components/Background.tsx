import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/** Studio white: a very soft grey falloff toward the edges and a whisper of paper grain. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gx = (Math.floor(frame / 2) * 73) % 260;
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, #FFFFFF 55%, #F1F2F0 100%)'}} />
      <AbsoluteFill style={{backgroundImage: GRAIN, backgroundPosition: `${gx}px 0px`, opacity: 0.05}} />
    </AbsoluteFill>
  );
};
