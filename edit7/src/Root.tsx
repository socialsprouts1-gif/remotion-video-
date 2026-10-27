import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import edit from './edit.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="Edit" component={Film} durationInFrames={edit.frames} fps={edit.fps} width={1920} height={1080} defaultProps={{withMusic: false}} />
);
