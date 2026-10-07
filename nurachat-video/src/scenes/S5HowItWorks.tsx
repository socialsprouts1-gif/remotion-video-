import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../config';
import {FlowDiagram} from '../components/FlowDiagram';
import {IconName} from '../components/Icons';
import {Kicker} from '../components/KineticText';

const ICONS: IconName[] = ['message', 'sparkle', 'reply', 'filter', 'repeat', 'calendar'];
// Node start frames, timed to the voiceover lines in config.CAPTIONS.
export const HOW_STEPS = [12, 44, 72, 104, 134, 164];

/** 20.5–27.5s. The six-step workflow, one node per voiceover line. */
export const S5HowItWorks: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center'}}>
    <div style={{position: 'absolute', top: 170}}>
      <Kicker text={COPY.howKicker} start={2} />
    </div>
    <div style={{position: 'absolute', top: 290}}>
      <FlowDiagram
        nodes={COPY.howSteps.map((label, i) => ({label, icon: ICONS[i]}))}
        start={0}
        step={HOW_STEPS}
        width={820}
        nodeH={112}
        gap={50}
        fontSize={38}
        numbered
      />
    </div>
  </AbsoluteFill>
);
