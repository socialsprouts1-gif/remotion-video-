import React from 'react';
import {Composition} from 'remotion';
import story from './story.json';
import {Film} from './Film';

const common = {component: Film, durationInFrames: story.duration * story.fps, fps: story.fps, width: 1080, height: 1920} as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BucketEN" {...common} defaultProps={{lang: 'en' as const}} />
    <Composition id="BucketHI" {...common} defaultProps={{lang: 'hi' as const}} />
  </>
);
