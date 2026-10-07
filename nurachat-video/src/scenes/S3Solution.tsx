import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {FlowDiagram} from '../components/FlowDiagram';
import {KineticText} from '../components/KineticText';
import {LogoReveal} from '../components/LogoReveal';
import {ease, mix, prog} from '../lib/anim';

const UP_AT = 34;
const FLOW_AT = 64;

/** 8.5–13.5s. "Meet NuraChat", the promise, then CUSTOMER → WHATSAPP → NURACHAT → AI RESPONSE. */
export const S3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const up = prog(frame, UP_AT, 24, ease.inOut);
  const meet = prog(frame, 2, 14);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: mix(up, 540, 170),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${mix(up, 1, 0.6)})`,
            transformOrigin: '50% 0%',
          }}
        >
          <div
            style={{
              fontFamily: F.body,
              fontWeight: 600,
              fontSize: 44,
              letterSpacing: '0.3em',
              color: C.grey,
              marginBottom: 40,
              opacity: meet * (1 - up),
              transform: `translateY(${(1 - meet) * 20}px)`,
            }}
          >
            {COPY.meet.toUpperCase()}
          </div>
          <LogoReveal start={4} size={190} withWordmark wordmarkSize={130} />
        </div>
      </AbsoluteFill>

      <div style={{position: 'absolute', top: 545, left: 0, right: 0}}>
        <KineticText lines={COPY.solutionSub} start={UP_AT + 8} size={84} stagger={3} lineHeight={1.08} weight={800} />
      </div>

      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 790}}>
          <FlowDiagram
            nodes={[
              {label: COPY.solutionFlow[0], icon: 'user'},
              {label: COPY.solutionFlow[1], icon: 'chat'},
              {label: COPY.solutionFlow[2], logo: true},
              {label: COPY.solutionFlow[3], icon: 'sparkle'},
            ]}
            start={FLOW_AT}
            step={16}
            width={640}
            nodeH={104}
            gap={46}
            fontSize={36}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
