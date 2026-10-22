import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {ProFilm} from './pro/ProFilm';
import edit from './edit.json';
import pro from './pro.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShortPro" component={ProFilm} durationInFrames={pro.frames} fps={pro.fps} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="Short" component={Film} durationInFrames={edit.frames} fps={edit.fps} width={1080} height={1920} defaultProps={{withMusic: true}} />
  </>
);
