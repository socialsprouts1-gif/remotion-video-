import React from 'react';
import {Composition} from 'remotion';
import {TOTAL_FRAMES, VIDEO} from './config';
import {AsaadixReel} from './AsaadixReel';
import {TexPhone, TexSquare} from './textures/Screens';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AsaadixReel" component={AsaadixReel} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="TexPhone" component={TexPhone} durationInFrames={1} fps={30} width={640} height={1386} defaultProps={{id: 'ig'}} />
    <Composition id="TexSquare" component={TexSquare} durationInFrames={1} fps={30} width={512} height={512} defaultProps={{id: 'mark'}} />
  </>
);
