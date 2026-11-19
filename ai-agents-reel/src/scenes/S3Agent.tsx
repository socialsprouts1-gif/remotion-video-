import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../config';
import {FlowDiagram} from '../components/FlowDiagram';
import {Kicker} from '../components/KineticText';

/** 10.2–19s. What an AI agent does: four steps, each landing on its spoken line. */
export const S3Agent: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center'}}>
    <div style={{position: 'absolute', top: 400}}>
      <Kicker text={COPY.agentKicker} start={2} />
    </div>
    <div style={{position: 'absolute', top: 560}}>
      <FlowDiagram
        nodes={[
          {label: COPY.agentSteps[0], icon: 'chat'},
          {label: COPY.agentSteps[1], icon: 'reply'},
          {label: COPY.agentSteps[2], icon: 'filter'},
          {label: COPY.agentSteps[3], icon: 'calendar'},
        ]}
        start={12}
        step={[0, 54, 108, 162]}
        width={780}
        nodeH={130}
        gap={70}
        fontSize={42}
        numbered
      />
    </div>
  </AbsoluteFill>
);
