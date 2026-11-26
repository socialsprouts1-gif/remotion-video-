import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY, FUNNEL, KPIS} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {Header} from '../components/Header';
import {Icon} from '../components/Icon';

const ROW0 = 30;
const ROW_GAP = 10.5;

export const S5Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = prog(frame, 6, 18, ease.out);
  const max = FUNNEL[0].value;
  return (
    <AbsoluteFill>
      <Header chip={COPY.dashboardChip} lines={COPY.dashboard} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 500, opacity: enter, transform: `translateY(${(1 - enter) * 100}px)`}}>
        <GlassCard radius={36} strong style={{padding: '30px 34px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: F.body}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, color: C.white, fontWeight: 700, fontSize: 32}}>
              <Icon name="chart_increasing" size={44} />
              Lead → Customer funnel
            </div>
            <div style={{padding: '8px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', color: C.grey, fontWeight: 600, fontSize: 22}}>This month</div>
          </div>
          {FUNNEL.map((r, i) => {
            const st = ROW0 + i * ROW_GAP;
            const p = prog(frame, st, 14, ease.out);
            const grow = prog(frame, st + 2, 30, ease.out);
            const n = Math.round(grow * r.value);
            const w = Math.max(0.05, r.value / max);
            const conv = i > 0 ? Math.round((r.value / FUNNEL[i - 1].value) * 100) : null;
            return (
              <div key={i} style={{marginTop: 30, opacity: p, transform: `translateX(${(1 - p) * -60}px)`, fontFamily: F.body}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <Icon name={r.icon} size={42} />
                  <div style={{flex: 1, color: C.white, fontWeight: 700, fontSize: 31}}>{r.label}</div>
                  {conv !== null && (
                    <div style={{padding: '6px 14px', borderRadius: 999, background: C.greenSoft, color: C.green, fontWeight: 700, fontSize: 22}}>{conv}% →</div>
                  )}
                  <div style={{minWidth: 150, textAlign: 'right', color: i === FUNNEL.length - 1 ? C.gold : C.white, fontFamily: F.display, fontWeight: 900, fontSize: 50}}>
                    {n.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{marginTop: 12, height: 26, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden'}}>
                  <div
                    style={{
                      width: `${w * grow * 100}%`,
                      height: '100%',
                      borderRadius: 99,
                      background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`,
                      opacity: mix(i / (FUNNEL.length - 1), 1, 0.85),
                      boxShadow: i === FUNNEL.length - 1 ? `0 0 24px ${C.goldGlow}` : undefined,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </GlassCard>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1405, display: 'flex', gap: 20}}>
        {KPIS.map((k, i) => {
          const p = prog(frame, 100 + i * 6, 16, ease.out);
          return (
            <div key={i} style={{flex: 1, opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
              <GlassCard radius={28} style={{padding: '26px 20px', textAlign: 'center'}}>
                <div style={{color: C.gold, fontFamily: F.display, fontWeight: 900, fontSize: 54}}>{k.value}</div>
                <div style={{color: C.grey, fontFamily: F.body, fontWeight: 600, fontSize: 23, marginTop: 6}}>{k.label}</div>
              </GlassCard>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1650,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: C.grey2,
          fontFamily: F.body,
          fontWeight: 500,
          fontSize: 22,
          opacity: prog(frame, 120, 16),
        }}
      >
        Sample numbers for illustration
      </div>
    </AbsoluteFill>
  );
};
