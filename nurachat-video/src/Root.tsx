import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {NuraChatReel} from './NuraChatReel';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NuraChatReel"
    component={NuraChatReel}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
