import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/** Matte black stage: warm gradient, a slow orange light leak, moving film grain, vignette. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const lx = 900 + Math.sin(t * 0.21) * 220;
  const ly = 260 + Math.cos(t * 0.17) * 180;
  const lx2 = 160 + Math.cos(t * 0.15) * 160;
  const ly2 = 1650 + Math.sin(t * 0.19) * 160;
  // grain jumps every 2 frames like real film
  const gx = ((Math.floor(frame / 2) * 73) % 260);
  const gy = ((Math.floor(frame / 2) * 131) % 260);
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.bg2} 0%, ${C.bg} 60%)`}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(720px 620px at ${lx}px ${ly}px, rgba(255,91,34,0.13), transparent 70%),
                       radial-gradient(640px 640px at ${lx2}px ${ly2}px, rgba(255,140,60,0.06), transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{backgroundImage: GRAIN, backgroundPosition: `${gx}px ${gy}px`, opacity: 0.075, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 75% at 50% 48%, transparent 55%, rgba(0,0,0,0.72) 100%)'}} />
    </AbsoluteFill>
  );
};
