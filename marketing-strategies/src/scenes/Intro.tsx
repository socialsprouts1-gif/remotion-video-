import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {KineticText} from '../components/KineticText';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const land = prog(frame, 4, 20, ease.out);
  const ring = prog(frame, 10, 40, ease.out);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: F.serif,
          fontSize: 760,
          lineHeight: 0.85,
          color: C.accent,
          opacity: land,
          transform: `scale(${mix(land, 1.5, 1)})`,
          filter: land < 1 ? `blur(${(1 - land) * 20}px)` : undefined,
          textShadow: `0 0 120px ${C.accentGlow}`,
        }}
      >
        5
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={540} cy={640} r={330} fill="none" stroke={C.lineStrong} strokeWidth={2} strokeDasharray={`${ring * 2073} 2073`} transform="rotate(-90 540 640)" />
      </svg>
      <div style={{position: 'absolute', top: 1040, left: 0, right: 0}}>
        <KineticText lines={['marketing', '*strategies*']} start={16} stagger={4} size={120} />
      </div>
      <div style={{position: 'absolute', top: 1340, left: 90, right: 90, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14}}>
        {CHAPTERS.map((c, i) => {
          const p = prog(frame, 50 + i * 6, 14, ease.out);
          return (
            <div
              key={c.id}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: `1.5px solid ${C.lineStrong}`,
                color: C.ink,
                fontFamily: F.body,
                fontWeight: 600,
                fontSize: 28,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              <span style={{fontFamily: F.serif, color: C.accent, marginRight: 10, fontSize: 32}}>0{i + 1}</span>
              {c.short}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
