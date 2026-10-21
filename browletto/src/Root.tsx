import React from 'react';
import {Composition} from 'remotion';
import {Film, FilmProps} from './Film';
import story from './story.json';

const common = {component: Film, durationInFrames: story.duration * story.fps, fps: story.fps, defaultProps: {withAudio: true} as FilmProps};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Instagram Reels / Stories / WhatsApp Status */}
    <Composition id="Browletto" {...common} width={1080} height={1920} />
    {/* YouTube / café display screen: same scenes, landscape layout */}
    <Composition id="BrowlettoWide" {...common} width={1920} height={1080} />
  </>
);
