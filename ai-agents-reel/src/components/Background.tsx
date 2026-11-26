import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {rand} from '../lib/anim';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/** Persistent stage: near-black gradient, slow drifting lime glow, faint grid with parallax, grain, vignette. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const gx = 540 + Math.sin(t * 0.35) * 260;
  const gy = 760 + Math.cos(t * 0.27) * 340;
  const gx2 = 540 + Math.cos(t * 0.22 + 1) * 380;
  const gy2 = 1500 + Math.sin(t * 0.31) * 200;
  const gridShift = (frame * 0.35) % 72;

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 55%, ${C.bg} 100%)`}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(620px 620px at ${gx}px ${gy}px, rgba(194,255,61,0.11), transparent 70%),
                       radial-gradient(520px 520px at ${gx2}px ${gy2}px, rgba(120,200,40,0.07), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          backgroundPosition: `0px ${gridShift}px`,
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%, black 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%, black 10%, transparent 75%)',
        }}
      />
      <AbsoluteFill style={{backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Faint chat-bubble skeletons drifting upward at three depths (hook background). */
export const FloatingBubbles: React.FC<{count?: number; opacity?: number}> = ({count = 14, opacity = 1}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity, overflow: 'hidden'}}>
      {Array.from({length: count}).map((_, i) => {
        const depth = 0.35 + rand(i + 1) * 0.65; // 0.35 far … 1 near
        const w = 150 + rand(i + 7) * 190;
        const x = rand(i + 3) * 1080 - w / 2;
        const speed = 0.6 + depth * 1.6;
        const y = ((rand(i + 11) * 2300 - frame * speed) % 2300 + 2300) % 2300 - 200;
        const right = rand(i + 5) > 0.5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              padding: '18px 22px',
              borderRadius: 22,
              borderBottomRightRadius: right ? 6 : 22,
              borderBottomLeftRadius: right ? 22 : 6,
              background: right ? 'rgba(194,255,61,0.08)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${right ? 'rgba(194,255,61,0.16)' : 'rgba(255,255,255,0.08)'}`,
              filter: `blur(${(1 - depth) * 5}px)`,
              opacity: 0.25 + depth * 0.5,
              transform: `scale(${0.6 + depth * 0.5})`,
            }}
          >
            <div style={{height: 9, width: '85%', borderRadius: 9, background: 'rgba(255,255,255,0.14)'}} />
            <div style={{height: 9, width: '55%', borderRadius: 9, background: 'rgba(255,255,255,0.1)', marginTop: 10}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
