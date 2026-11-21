import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, rand} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {Header} from '../components/Header';
import {Icon} from '../components/Icon';

const TAP = 63;
const HUB = {x: 540, y: 1255};
const N = 16;
const R = 365;
const AUD = ['Free students', 'Mentorship leads', 'Investors'];
const INITIALS = ['RS', 'NK', 'AM', 'SA', 'VM', 'PK', 'RJ', 'DT', 'KS', 'AB', 'MG', 'HP', 'YT', 'ZA', 'LN', 'OP'];
const HUES = [210, 160, 35, 280, 0, 190, 120, 320];

export const S4Broadcast: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = prog(frame, 4, 16, ease.out);
  const press = prog(frame, TAP - 3, 3) * (1 - prog(frame, TAP + 1, 6));
  const collapse = prog(frame, TAP + 4, 18, ease.inOut);
  const hub = prog(frame, TAP + 12, 14, ease.out);
  const handIn = prog(frame, TAP - 20, 18, ease.out);
  const handOut = prog(frame, TAP + 8, 12, ease.in);
  const delivered = Math.round(prog(frame, TAP + 12, 60, ease.soft) * 1250);
  const read = Math.round(prog(frame, TAP + 24, 60, ease.soft) * 1102);

  return (
    <AbsoluteFill>
      <Header chip={COPY.broadcastChip} lines={COPY.broadcast} />
      {/* composer → hub */}
      {collapse < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 100,
            right: 100,
            top: 520,
            opacity: enter * (1 - collapse),
            transformOrigin: `${HUB.x - 100}px ${HUB.y - 520 - 200}px`,
            transform: `translateY(${(1 - enter) * 80 + collapse * 200}px) scale(${mix(collapse, 1, 0.2)})`,
          }}
        >
          <GlassCard radius={34} strong style={{padding: '28px 30px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.body, color: C.white, fontWeight: 700, fontSize: 32}}>
              <Icon name="bell" size={44} />
              New Broadcast
            </div>
            <div style={{color: C.grey, fontFamily: F.body, fontWeight: 600, fontSize: 22, letterSpacing: '0.1em', margin: '24px 0 12px'}}>AUDIENCE</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
              {AUD.map((a, i) => {
                const on = prog(frame, 16 + i * 6, 8);
                return (
                  <div
                    key={a}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 999,
                      fontFamily: F.body,
                      fontWeight: 600,
                      fontSize: 25,
                      color: on > 0.5 ? '#1A1300' : C.grey,
                      background: on > 0.5 ? C.gold : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${on > 0.5 ? C.gold : C.stroke}`,
                      transform: `scale(${1 + Math.sin(on * Math.PI) * 0.08})`,
                    }}
                  >
                    {on > 0.5 ? '✓ ' : ''}
                    {a}
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 26,
                background: C.waIn,
                borderRadius: 20,
                borderTopLeftRadius: 6,
                padding: '18px 22px',
                color: C.waText,
                fontFamily: F.body,
                fontWeight: 500,
                fontSize: 28,
                lineHeight: 1.35,
              }}
            >
              <b>Live Market Webinar</b> aaj raat 8 PM. Join karne ke liye link pe tap karein.
              <div style={{color: C.waLink, marginTop: 8}}>fxacademy.in/live</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 24}}>
              <div
                style={{
                  position: 'relative',
                  padding: '18px 40px',
                  borderRadius: 999,
                  background: C.wa,
                  color: '#04210F',
                  fontFamily: F.display,
                  fontWeight: 900,
                  fontSize: 30,
                  transform: `scale(${1 - press * 0.08})`,
                }}
              >
                Send to all
                <div
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 30,
                    opacity: handIn * (1 - handOut),
                    transform: `translate(${(1 - handIn) * 200 + handOut * 200}px, ${(1 - handIn) * 200 + handOut * 120}px) scale(${1 - press * 0.15}) rotate(-12deg)`,
                    filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.5))',
                  }}
                >
                  <Icon name="index_pointing_up" size={120} />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      {/* fan-out */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: N}).map((_, i) => {
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const ex = HUB.x + Math.cos(a) * R;
          const ey = HUB.y + Math.sin(a) * R;
          const d = prog(frame, TAP + 14 + i * 2, 12, ease.out);
          const pulse = prog(frame, TAP + 14 + i * 2, 16, ease.inOut);
          if (d <= 0) return null;
          return (
            <g key={i}>
              <line x1={HUB.x} y1={HUB.y} x2={mix(d, HUB.x, ex)} y2={mix(d, HUB.y, ey)} stroke={C.gold} strokeOpacity={0.35} strokeWidth={3} />
              {pulse < 1 && <circle cx={mix(pulse, HUB.x, ex)} cy={mix(pulse, HUB.y, ey)} r={9} fill={C.gold} />}
            </g>
          );
        })}
      </svg>
      {Array.from({length: N}).map((_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const ex = HUB.x + Math.cos(a) * R;
        const ey = HUB.y + Math.sin(a) * R;
        const app = prog(frame, TAP + 10 + i * 2, 12, ease.out);
        const got = prog(frame, TAP + 28 + i * 2, 8, ease.out);
        const readP = frame > TAP + 44 + i * 2 + rand(i) * 20;
        const hue = HUES[i % HUES.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: ex - 48,
              top: ey - 48,
              width: 96,
              height: 96,
              borderRadius: 99,
              background: `linear-gradient(135deg, hsl(${hue} 55% 48%), hsl(${hue} 55% 28%))`,
              border: `3px solid ${got > 0.5 ? C.wa : 'rgba(255,255,255,0.15)'}`,
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              fontFamily: F.body,
              fontWeight: 800,
              fontSize: 30,
              opacity: app,
              transform: `scale(${mix(app, 0.3, 1) * (1 + Math.sin(got * Math.PI) * 0.15)})`,
            }}
          >
            {INITIALS[i]}
            {got > 0 && (
              <div
                style={{
                  position: 'absolute',
                  right: -14,
                  bottom: -8,
                  background: C.waBg,
                  borderRadius: 99,
                  padding: '4px 6px',
                  display: 'flex',
                  opacity: got,
                }}
              >
                <svg width={30} height={18} viewBox="0 0 26 16">
                  <path d="M1 9l4 4 8-10" stroke={readP ? C.waBlue : C.waMeta} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <path d="M10 13l1 0 8-10" stroke={readP ? C.waBlue : C.waMeta} strokeWidth={2.6} fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
      {hub > 0 && (
        <div
          style={{
            position: 'absolute',
            left: HUB.x - 95,
            top: HUB.y - 95,
            width: 190,
            height: 190,
            borderRadius: 99,
            background: `radial-gradient(circle at 35% 30%, #FFE08A, ${C.gold} 45%, ${C.goldDeep})`,
            boxShadow: `0 0 60px ${C.goldGlow}, 0 0 160px rgba(248,198,74,0.2)`,
            display: 'grid',
            placeItems: 'center',
            transform: `scale(${mix(hub, 0.3, 1)})`,
            opacity: hub,
          }}
        >
          <Icon name="bell" size={96} />
        </div>
      )}
      {hub > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 1710,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 36,
            color: C.white,
            opacity: hub,
          }}
        >
          Delivered <span style={{color: C.gold, fontFamily: F.display, fontWeight: 900}}>{delivered.toLocaleString('en-IN')}</span>
          <span style={{color: C.grey2}}>  ·  </span>
          Read <span style={{color: C.waBlue, fontFamily: F.display, fontWeight: 900}}>{read.toLocaleString('en-IN')}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
