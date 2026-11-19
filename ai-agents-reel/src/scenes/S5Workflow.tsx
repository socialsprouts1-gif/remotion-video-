import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {KineticText} from '../components/KineticText';
import {ease, mix, prog} from '../lib/anim';

const STRIKE_AT = 40;
const OUT = 66;
const WF_AT = 74;

/** 26–31.8s. "Not just generating content" gets struck out; "Your entire workflow, intelligent." */
export const S5Workflow: React.FC = () => {
  const frame = useCurrentFrame();
  const a = prog(frame, 2, 16);
  const strike = prog(frame, STRIKE_AT, 14, ease.inOut);
  const out = prog(frame, OUT, 12, ease.in);
  const push = mix(prog(frame, WF_AT, 90, ease.soft), 1, 1.06);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: a * (1 - out),
          transform: `translateY(${(1 - a) * 40 - out * 60}px)`,
          filter: `blur(${out * 12}px)`,
        }}
      >
        <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 52, color: C.grey, letterSpacing: '0.02em', marginBottom: 20}}>{COPY.notJust}</div>
        <div style={{position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 112, letterSpacing: '-0.045em', color: mix(strike, 0, 1) > 0.5 ? C.grey2 : C.white}}>
          {COPY.struck}
          <div style={{position: 'absolute', left: -10, right: -10, top: '54%', height: 12, borderRadius: 6, background: C.lime, transformOrigin: 'left', transform: `scaleX(${strike})`, boxShadow: `0 0 24px ${C.limeGlow}`}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${push})`}}>
        <KineticText lines={COPY.workflow} start={WF_AT} mode="scale" stagger={7} size={160} dur={14} lineHeight={0.98} letterSpacing="-0.045em" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
