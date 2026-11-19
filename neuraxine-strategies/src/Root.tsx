import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {NeuraxineReel} from './NeuraxineReel';

export const RemotionRoot: React.FC = () => (
  <Composition id="NeuraxineReel" component={NeuraxineReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
