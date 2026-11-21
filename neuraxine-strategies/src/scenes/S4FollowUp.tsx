import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon, BrandName} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);
const CX = 540;
const CY = 1000;
const R = 320;
const deg = (a: number) => (a * Math.PI) / 180;
const pos = (a: number) => ({x: CX + Math.cos(deg(a)) * R, y: CY + Math.sin(deg(a)) * R});

export const S4FollowUp: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s4', 1));
  const wa = fr(wordAt('s4', 1, 'whatsapp'));
  const em = fr(wordAt('s4', 1, 'email'));
  const ad = fr(wordAt('s4', 1, 'retargeting'));
  const back = fr(wordAt('s4', 1, 'wapas'));
  const NODES = [
    {a: -90, label: 'Visit', at: 36},
    {a: -10, label: 'Chala gaya', at: l1 + 20, bad: true},
    {a: 55, label: 'WhatsApp', at: wa, icon: 'whatsapp' as BrandName},
    {a: 125, label: 'Email', at: em, icon: 'gmail' as BrandName},
    {a: 195, label: 'Ads', at: ad, icon: 'meta' as BrandName},
  ];
  // the visitor's angle around the loop over time
  const ang = range(
    frame,
    [36, l1 + 20, wa, em, ad, back],
    [-90, -10, 55, 125, 195, 270],
    ease.inOut,
  );
  const ringIn = prog(frame, 24, 30, ease.out);
  const done = prog(frame, back, 16, ease.out);
  const dot = pos(ang);
  const travelled = (ang + 90) / 360;
  return (
    <AbsoluteFill>
      <ChapterHeader n={4} start={4} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.line} strokeWidth={3} strokeDasharray={`${ringIn * 2011} 2011`} transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${travelled * 2011} 2011`} transform={`rotate(-90 ${CX} ${CY})`} style={{filter: `drop-shadow(0 0 10px ${C.accentGlow})`}} />
      </svg>
      {/* centre */}
      <div style={{position: 'absolute', left: CX - 210, top: CY - 110, width: 420, textAlign: 'center', opacity: ringIn}}>
        <div style={{fontFamily: F.serif, fontSize: done > 0.5 ? 120 : 92, lineHeight: 1, color: done > 0.5 ? C.accent : C.ink, transform: `scale(${1 + Math.sin(done * Math.PI) * 0.15})`}}>
          {done > 0.5 ? 'Sale ✓' : 'Customer'}
        </div>
        <div style={{marginTop: 14, color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 26}}>{done > 0.5 ? 'wapas aaya, khareeda' : 'pehli baar: sirf dekha'}</div>
      </div>
      {NODES.map((n, i) => {
        const p0 = pos(n.a);
        const on = prog(frame, n.at - 4, 10, ease.out);
        const lit = i === 0 ? 1 : on;
        const isBad = !!n.bad;
        const col = isBad ? C.bad : C.accent;
        return (
          <div key={i} style={{position: 'absolute', left: p0.x - 100, top: p0.y - 44, width: 200, display: 'flex', justifyContent: 'center', opacity: mix(prog(frame, 20 + i * 4, 12), 0, 1)}}>
            <div
              style={{
                padding: '14px 22px',
                borderRadius: 999,
                background: lit > 0.5 ? (isBad ? 'rgba(255,77,94,0.15)' : C.accentSoft) : '#14110E',
                border: `2px solid ${lit > 0.5 ? col : C.lineStrong}`,
                color: lit > 0.5 ? C.ink : C.muted,
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 28,
                whiteSpace: 'nowrap',
                boxShadow: lit > 0.5 && !isBad ? `0 0 26px ${C.accentGlow}` : undefined,
                transform: `scale(${1 + Math.sin(on * Math.PI) * 0.18})`,
              }}
            >
              {isBad && lit > 0.5 ? '✕ ' : ''}
              {'icon' in n && n.icon ? <BrandIcon name={n.icon} size={36} style={{marginRight: 10, verticalAlign: '-9px'}} /> : null}
              {n.label}
            </div>
          </div>
        );
      })}
      {frame > 34 && (
        <div
          style={{
            position: 'absolute',
            left: dot.x - 20,
            top: dot.y - 20,
            width: 40,
            height: 40,
            borderRadius: 99,
            background: '#FFD9C7',
            boxShadow: `0 0 30px ${C.accent}, 0 0 80px ${C.accentGlow}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
