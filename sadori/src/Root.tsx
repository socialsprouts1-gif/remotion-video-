import React from 'react';
import {Composition} from 'remotion';
import {Film, FilmProps} from './Film';
import story from './story.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Sadori"
      component={Film}
      durationInFrames={story.duration * story.fps}
      fps={story.fps}
      width={1080}
      height={1920}
      defaultProps={{logoSrc: null, withAudio: true} as FilmProps}
    />
  </>
);
