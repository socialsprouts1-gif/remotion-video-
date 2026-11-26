import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {NeuraxineAutomationsReel} from './NeuraxineReel';

export const RemotionRoot: React.FC = () => (
  <Composition id="NeuraxineAutomations" component={NeuraxineAutomationsReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
