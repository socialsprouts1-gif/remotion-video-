import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY, NOTIFICATIONS} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, rand, velBlur} from '../lib/anim';
import {Icon} from '../components/Icon';
import {GlassCard} from '../components/GlassCard';
import {KineticText} from '../components/KineticText';

const Notif: React.FC<{n: (typeof NOTIFICATIONS)[number]; i: number}> = ({n, i}) => {
  const frame = useCurrentFrame();
  const start = 8 + i * 10.5;
  const p = prog(frame, start, 16, ease.out);
  const y = (f: number) => (1 - prog(f, start, 16, ease.out)) * -260;
  // after the verdict, unanswered notifications slide away and fade: lost leads
  const lost = prog(frame, 92 + i * 3, 22, ease.in);
  const dir = rand(i + 3) > 0.5 ? 1 : -1;
  const rot = (rand(i + 9) - 0.5) * 5;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 560 + i * 150,
        opacity: p * (1 - lost) * mix(prog(frame, 66, 20), 1, 0.45),
        transform: `translateY(${y(frame)}px) translateX(${lost * dir * 700}px) rotate(${rot * p + lost * dir * 12}deg)`,
        filter: `blur(${velBlur(y, frame, 0.05) + lost * 8 + prog(frame, 66, 20) * 3}px)`,
      }}
    >
      <GlassCard radius={30} strong style={{padding: '22px 26px', display: 'flex', gap: 22, alignItems: 'center'}}>
        <div style={{width: 72, height: 72, borderRadius: 18, background: C.wa, display: 'grid', placeItems: 'center', flexShrink: 0}}>
          <Icon name="whatsapp-icon" size={56} style={{filter: 'brightness(0) invert(1)'}} />
        </div>
        <div style={{flex: 1, minWidth: 0, fontFamily: F.body}}>
          <div style={{display: 'flex', justifyContent: 'space-between', color: C.white, fontWeight: 700, fontSize: 32}}>
            <span>{n.name}</span>
            <span style={{color: C.grey, fontWeight: 500, fontSize: 24}}>{n.ago}</span>
          </div>
          <div style={{color: C.grey, fontWeight: 500, fontSize: 29, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.text}</div>
        </div>
      </GlassCard>
    </div>
  );
};

export const S2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.min(47, Math.floor(prog(frame, 6, 70, ease.soft) * 47));
  const badge = prog(frame, 4, 12);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: badge * (1 - prog(frame, 90, 14, ease.in)),
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 34px',
            borderRadius: 999,
            background: 'rgba(255,92,108,0.12)',
            border: `2px solid rgba(255,92,108,0.5)`,
            color: C.white,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 40,
          }}
        >
          <Icon name="bell" size={48} />
          <span style={{color: C.red, fontFamily: F.display, fontWeight: 900, fontSize: 56, minWidth: 70, textAlign: 'right'}}>{count}</span>
          unread chats
        </div>
      </div>
      {NOTIFICATIONS.map((n, i) => (
        <Notif key={i} n={n} i={i} />
      ))}
      <div style={{position: 'absolute', top: 820, left: 0, right: 0}}>
        <KineticText lines={COPY.problem} start={68} stagger={5} size={150} mode="scale" accent={C.red} accentGlow={C.redGlow} />
      </div>
    </AbsoluteFill>
  );
};
