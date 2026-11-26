import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {wordAt} from '../config';
import {C} from '../theme';
import {ease, prog} from '../lib/anim';
import {KineticText} from '../components/KineticText';

const fr = (s: number) => Math.round(s * 30);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const kis = fr(wordAt('outro', 0, 'kismat'));
  const sys = fr(wordAt('outro', 0, 'system'));
  const strike = prog(frame, kis + 12, 10, ease.out);
  const under = prog(frame, sys + 6, 18, ease.out);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0}}>
        <KineticText lines={['Marketing']} start={4} size={130} />
      </div>
      <div style={{position: 'absolute', top: 720, left: 0, right: 0}}>
        <KineticText lines={['kismat nahi,']} start={kis - 4} size={110} color={C.muted} />
      </div>
      <div style={{position: 'absolute', top: 790, left: 540 - 270, width: 540 * strike, height: 9, borderRadius: 9, background: C.bad, transform: 'rotate(-3deg)', transformOrigin: 'left'}} />
      <div style={{position: 'absolute', top: 880, left: 0, right: 0}}>
        <KineticText lines={['ek *system* hai.']} start={sys - 6} stagger={4} size={150} mode="scale" />
      </div>
      <div style={{position: 'absolute', top: 1110, left: 540 - 280 * under, width: 560 * under, height: 6, borderRadius: 9, background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, boxShadow: `0 0 24px ${C.accentGlow}`}} />
    </AbsoluteFill>
  );
};
