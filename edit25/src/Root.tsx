import React from 'react';
import {Composition} from 'remotion';
import {Film, DURATION, FPS} from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition id="Edit" component={Film} durationInFrames={DURATION * FPS} fps={FPS} width={1080} height={1920} />
);
