import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, COPY} from '../config';
import {C, F} from '../theme';
import {GlassCard} from '../components/GlassCard';
import {KineticText} from '../components/KineticText';
import {ease, mix, prog} from '../lib/anim';

const HUB_AT = 24;
const POWER_AT = 108;
const CX = 540;
const CY = 1000;
const R = 330;

/** 19–26s. The agent at the centre, wired to six business tools; then "That's where the real power begins." */
export const S4Connect: React.FC = () => {
  const frame = useCurrentFrame();
  const hub = prog(frame, HUB_AT - 10, 20);
  const titleOut = prog(frame, POWER_AT - 8, 14, ease.in);
  const pulse = (frame % 45) / 45;
  const spin = frame * 0.12;
  const n = COPY.connectHub.length;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, opacity: 1 - titleOut}}>
        <KineticText lines={COPY.connectTitle} start={2} stagger={4} size={96} lineHeight={1.04} />
      </div>
      <div style={{position: 'absolute', top: 230, left: 0, right: 0}}>
        <KineticText lines={COPY.connectPower} start={POWER_AT} stagger={5} size={104} lineHeight={1.04} />
      </div>

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {COPY.connectHub.map((_, i) => {
          const a = ((i / n) * 360 + spin - 90) * (Math.PI / 180);
          const p = prog(frame, HUB_AT + i * 8, 16);
          const x = CX + Math.cos(a) * R * p;
          const y = CY + Math.sin(a) * R * p;
          const tx = CX + (x - CX) * pulse;
          const ty = CY + (y - CY) * pulse;
          return (
            <g key={i} opacity={p}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(194,255,61,0.45)" strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-frame * 2} />
              <circle cx={tx} cy={ty} r={9} fill={C.lime} opacity={frame > POWER_AT ? 1 : 0.6} />
            </g>
          );
        })}
      </svg>

      {COPY.connectHub.map((label, i) => {
        const a = ((i / n) * 360 + spin - 90) * (Math.PI / 180);
        const p = prog(frame, HUB_AT + i * 8, 16);
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: CX + Math.cos(a) * R,
              top: CY + Math.sin(a) * R,
              transform: `translate(-50%, -50%) scale(${mix(p, 0.6, 1)})`,
              opacity: p,
            }}
          >
            <GlassCard radius={999} padding="20px 30px" glow={frame > POWER_AT ? 0.6 : 0.15}>
              <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', color: C.white}}>{label}</span>
            </GlassCard>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: CX,
          top: CY,
          width: 230,
          height: 230,
          transform: `translate(-50%, -50%) scale(${mix(hub, 0.7, 1) * (1 + (frame > POWER_AT ? Math.sin(frame / 6) * 0.03 : 0))})`,
          opacity: hub,
          borderRadius: 60,
          overflow: 'hidden',
          border: '1px solid rgba(194,255,61,0.5)',
          boxShadow: `0 0 ${frame > POWER_AT ? 120 : 60}px rgba(194,255,61,0.35)`,
        }}
      >
        <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};
