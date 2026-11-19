import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {KineticText} from '../components/KineticText';
import {ease, mix, prog, rand} from '../lib/anim';

const OUT = 58;
const BUT_AT = 66;

/** 5.4–10.2s. "Sounds impossible?" shakes and breaks away; "But AI agents are making it possible." lands. */
export const S2Impossible: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame > 30 && frame < OUT ? (rand(frame) - 0.5) * 10 * (1 - prog(frame, 30, 28)) : 0;
  const push = mix(prog(frame, BUT_AT, 80, ease.soft), 1, 1.06);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translateX(${shake}px)`}}>
        <KineticText lines={COPY.impossibleQ} start={2} mode="scale" stagger={8} size={170} dur={14} lineHeight={0.98} letterSpacing="-0.045em" exitAt={OUT} exitMode="scaleUp" />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${push})`}}>
        <KineticText lines={COPY.impossibleBut} start={BUT_AT} stagger={5} size={140} lineHeight={1.0} letterSpacing="-0.045em" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
