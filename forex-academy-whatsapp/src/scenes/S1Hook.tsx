import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {Icon} from '../components/Icon';
import {Kicker, KineticText} from '../components/KineticText';

export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = prog(frame, 3, 18, ease.out);
  const settle = range(frame, [3, 12, 22], [0.4, 1.12, 1], ease.soft);
  const ring = (frame % 45) / 45;
  // icon drifts up as the second line arrives, making room
  const lift = range(frame, [64, 80], [0, -90], ease.inOut);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 470 + lift, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 210, height: 210, opacity: pop, transform: `scale(${settle})`}}>
          <div
            style={{
              position: 'absolute',
              inset: -30,
              borderRadius: 999,
              border: `3px solid ${C.wa}`,
              opacity: (1 - ring) * 0.6 * pop,
              transform: `scale(${mix(ring, 0.8, 1.5)})`,
            }}
          />
          <div style={{position: 'absolute', inset: -60, borderRadius: 999, background: 'radial-gradient(circle, rgba(37,211,102,0.35), transparent 65%)'}} />
          <Icon name="whatsapp-icon" size={210} style={{position: 'relative'}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 780 + lift * 0.4, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Kicker text={COPY.hookKicker} start={6} />
      </div>
      <div style={{position: 'absolute', top: 900, left: 0, right: 0}}>
        <KineticText lines={COPY.hook1} start={10} stagger={4} size={150} exitAt={64} exitMode="up" />
      </div>
      <div style={{position: 'absolute', top: 930, left: 0, right: 0}}>
        <KineticText lines={COPY.hook2} start={72} stagger={4} size={104} mode="scale" />
      </div>
    </AbsoluteFill>
  );
};
