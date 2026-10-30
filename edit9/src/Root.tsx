import React from 'react';
import {Composition} from 'remotion';
import {Film, OFF_F} from './Film';
import edit from './edit.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="Edit" component={Film} durationInFrames={edit.frames - OFF_F} fps={edit.fps} width={1080} height={1920} defaultProps={{withMusic: false}} />
);
