import React from 'react';
import {Composition} from 'remotion';
import {Film, EDITS} from './Film';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Clip1" component={Film} durationInFrames={EDITS[1].frames} fps={30} width={1080} height={1920} defaultProps={{clip: 1}} />
    <Composition id="Clip2" component={Film} durationInFrames={EDITS[2].frames} fps={30} width={1080} height={1920} defaultProps={{clip: 2}} />
  </>
);
