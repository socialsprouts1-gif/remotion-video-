import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {EditorialReel} from './EditorialReel';
import {TexPhone, TexSquare} from './textures/Screens';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Editorial" component={EditorialReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="TexPhone" component={TexPhone} durationInFrames={1} fps={30} width={640} height={1386} defaultProps={{id: 'flood'}} />
    <Composition id="TexSquare" component={TexSquare} durationInFrames={1} fps={30} width={512} height={512} defaultProps={{id: 'cal'}} />
  </>
);
