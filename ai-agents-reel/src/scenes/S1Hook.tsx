import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {FloatingBubbles} from '../components/Background';
import {KineticText} from '../components/KineticText';
import {LogoReveal} from '../components/LogoReveal';
import {ease, mix, prog} from '../lib/anim';

const LINE_AT = 14;
const SUB_AT = 108;

/** 0–5.4s. Logo glint, then "Imagine if your business could work on its own…" */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = prog(frame, SUB_AT, 16);
  const push = mix(prog(frame, LINE_AT, 140, ease.soft), 1, 1.05);
  return (
    <AbsoluteFill>
      <FloatingBubbles opacity={mix(prog(frame, 0, 30), 0, 0.8)} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 300}}>
          <LogoReveal start={0} size={150} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${push})`}}>
        <KineticText lines={COPY.hookA} start={LINE_AT} stagger={5} size={128} lineHeight={1.02} letterSpacing="-0.04em" />
        <div
          style={{
            marginTop: 46,
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 44,
            color: C.grey,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          …{COPY.hookB}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
