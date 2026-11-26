import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {MarketingReel} from './MarketingReel';

export const RemotionRoot: React.FC = () => (
  <Composition id="MarketingReel" component={MarketingReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
