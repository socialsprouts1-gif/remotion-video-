import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {GlassCard} from '../components/GlassCard';
import {Icon, IconName} from '../components/Icons';
import {KineticText} from '../components/KineticText';
import {ease, mix, prog} from '../lib/anim';

const ICONS: IconName[] = ['chat', 'sparkle', 'user', 'repeat', 'calendar'];
const CARD_AT = [6, 16, 26, 36, 46];
const RECEDE_AT = 76;
const LINE_AT = [82, 104, 126];
const POS = [
  {x: -150, y: 330},
  {x: 130, y: 530},
  {x: -120, y: 730},
  {x: 150, y: 930},
  {x: -110, y: 1130},
];
const W = 540;
const H = 118;

/** 36.5–42s. The whole system as floating cards, which then step back for the three outcomes. */
export const S7Result: React.FC = () => {
  const frame = useCurrentFrame();
  const recede = prog(frame, RECEDE_AT, 22, ease.inOut);

  // centre points for connectors (canvas coordinates)
  const centre = (i: number) => ({x: 540 + POS[i].x, y: POS[i].y + H / 2});

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${mix(recede, 1, 0.84)})`,
          opacity: mix(recede, 1, 0.16),
          filter: recede > 0.01 ? `blur(${recede * 7}px)` : undefined,
        }}
      >
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {POS.slice(0, -1).map((_, i) => {
            const a = centre(i);
            const b = centre(i + 1);
            const d = `M ${a.x} ${a.y + H / 2} C ${a.x} ${a.y + H}, ${b.x} ${b.y - H}, ${b.x} ${b.y - H / 2}`;
            const p = prog(frame, CARD_AT[i] + 6, 12, ease.inOut);
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={C.lime}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - p}
                style={{filter: `drop-shadow(0 0 8px ${C.limeGlow})`}}
              />
            );
          })}
        </svg>
        {COPY.resultChain.map((label, i) => {
          const p = prog(frame, CARD_AT[i], 18, ease.out);
          const bob = Math.sin((frame + i * 17) / 22) * 7;
          const depth = 1 - (i % 2) * 0.04;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 540 + POS[i].x - W / 2,
                top: POS[i].y + bob,
                width: W,
                opacity: p,
                transform: `translateY(${(1 - p) * 60}px) scale(${mix(p, 0.85, 1) * depth})`,
                filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
              }}
            >
              <GlassCard radius={30} glow={i === COPY.resultChain.length - 1 ? 0.8 : 0.25} strong style={{height: H, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px 0 22px'}}>
                <div style={{width: 76, height: 76, borderRadius: 22, display: 'grid', placeItems: 'center', background: 'rgba(194,255,61,0.12)', border: '1px solid rgba(194,255,61,0.35)'}}>
                  <Icon name={ICONS[i]} size={40} color={C.lime} />
                </div>
                <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.white, letterSpacing: '-0.01em'}}>{label}</div>
              </GlassCard>
            </div>
          );
        })}
      </AbsoluteFill>

      {COPY.resultLines.map(([big, small], i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 400 + i * 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <KineticText lines={[big]} start={LINE_AT[i]} size={128} letterSpacing="-0.045em" />
          <KineticText lines={[small]} start={LINE_AT[i] + 4} size={72} weight={800} color="rgba(244,247,241,0.88)" style={{marginTop: 4}} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
