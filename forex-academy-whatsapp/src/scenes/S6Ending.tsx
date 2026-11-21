import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, COPY, JOURNEY} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {Icon} from '../components/Icon';
import {KineticText} from '../components/KineticText';

const TOP = 300;
const STEP = 150;
const LX = 190;

export const S6Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const dot = range(frame, [12, 92], [0, JOURNEY.length - 1], ease.inOut);
  const gone = prog(frame, 100, 18, ease.in);
  const lineH = (JOURNEY.length - 1) * STEP;
  const under = prog(frame, 136, 18, ease.out);
  const cta = prog(frame, 150, 18, ease.out);
  const brand = prog(frame, 166, 18, ease.out);
  return (
    <AbsoluteFill>
      {/* the journey */}
      {gone < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - gone, transform: `translateY(${-gone * 120}px)`, filter: gone > 0 ? `blur(${gone * 14}px)` : undefined}}>
          <div style={{position: 'absolute', left: LX - 3, top: TOP, width: 6, height: lineH, borderRadius: 9, background: 'rgba(255,255,255,0.1)'}} />
          <div
            style={{
              position: 'absolute',
              left: LX - 3,
              top: TOP,
              width: 6,
              height: (dot / (JOURNEY.length - 1)) * lineH,
              borderRadius: 9,
              background: `linear-gradient(180deg, ${C.gold}, ${C.goldDeep})`,
              boxShadow: `0 0 20px ${C.goldGlow}`,
            }}
          />
          {JOURNEY.map((j, i) => {
            const app = prog(frame, i * 3, 14, ease.out);
            const lit = prog(frame, 12 + (i / (JOURNEY.length - 1)) * 80 - 4, 8, ease.out);
            const last = i === JOURNEY.length - 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: LX - 52,
                  top: TOP + i * STEP - 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 34,
                  opacity: app,
                  transform: `translateX(${(1 - app) * -40}px)`,
                }}
              >
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: 99,
                    display: 'grid',
                    placeItems: 'center',
                    background: lit > 0.5 ? (last ? C.gold : '#1A2436') : '#0D1420',
                    border: `3px solid ${lit > 0.5 ? C.gold : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: lit > 0.5 ? `0 0 ${last ? 60 : 26}px ${C.goldGlow}` : undefined,
                    transform: `scale(${1 + Math.sin(lit * Math.PI) * 0.18})`,
                  }}
                >
                  <Icon name={j.icon} size={56} style={{opacity: mix(lit, 0.45, 1)}} />
                </div>
                <div
                  style={{
                    fontFamily: last ? F.display : F.body,
                    fontWeight: last ? 900 : 700,
                    fontSize: last ? 58 : 42,
                    color: lit > 0.5 ? (last ? C.gold : C.white) : C.grey2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {j.label}
                </div>
              </div>
            );
          })}
          {dot < JOURNEY.length - 1 && dot > 0 && (
            <div
              style={{
                position: 'absolute',
                left: LX - 14,
                top: TOP + (dot / (JOURNEY.length - 1)) * lineH - 14,
                width: 28,
                height: 28,
                borderRadius: 99,
                background: '#FFF2C4',
                boxShadow: `0 0 30px ${C.gold}, 0 0 70px ${C.goldGlow}`,
              }}
            />
          )}
        </div>
      )}
      {/* lockup */}
      <div style={{position: 'absolute', top: 640, left: 0, right: 0}}>
        <KineticText lines={COPY.ending1} start={106} stagger={3} size={78} weight={800} />
      </div>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0}}>
        <KineticText lines={COPY.ending2} start={114} stagger={4} size={132} mode="scale" />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1065,
          left: 540 - 260 * under,
          width: 520 * under,
          height: 8,
          borderRadius: 9,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          boxShadow: `0 0 24px ${C.goldGlow}`,
        }}
      />
      <div style={{position: 'absolute', top: 1200, left: 90, right: 90, opacity: cta, transform: `translateY(${(1 - cta) * 60}px)`}}>
        <GlassCard radius={36} strong glow={0.6} style={{padding: '36px 34px', textAlign: 'center'}}>
          <div style={{color: C.white, fontFamily: F.body, fontWeight: 600, fontSize: 36}}>{BRAND.ctaLine}</div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 26,
              padding: '20px 46px',
              borderRadius: 999,
              background: `linear-gradient(135deg, #FFE08A, ${C.gold} 50%, ${C.goldDeep})`,
              color: '#1A1300',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: '0.02em',
              boxShadow: `0 0 40px ${C.goldGlow}`,
            }}
          >
            {BRAND.cta}
          </div>
        </GlassCard>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1600,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          opacity: brand,
        }}
      >
        <Icon name="whatsapp-icon" size={60} />
        <div style={{color: C.grey, fontFamily: F.body, fontWeight: 700, fontSize: 32, letterSpacing: '0.12em'}}>WHATSAPP AUTOMATION</div>
      </div>
    </AbsoluteFill>
  );
};
