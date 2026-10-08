import React from 'react';
import {Composition} from 'remotion';
import {DURATION, FPS} from './timeline';
import {Film} from './Film';

export const RemotionRoot: React.FC = () => (
  <Composition id="FollowUpFilm" component={Film} durationInFrames={DURATION * FPS} fps={FPS} width={1080} height={1920} />
);
