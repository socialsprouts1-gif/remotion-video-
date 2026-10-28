import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import tl from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="Edit" component={Film} durationInFrames={tl.frames} fps={tl.fps} width={1080} height={1920} defaultProps={{withMusic: false}} />
);
