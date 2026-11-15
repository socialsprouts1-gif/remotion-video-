import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {ForexReel} from './ForexReel';

export const RemotionRoot: React.FC = () => (
  <Composition id="ForexReel" component={ForexReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
