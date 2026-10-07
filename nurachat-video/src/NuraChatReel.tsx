import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {AUDIO} from './config';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {S1Hook} from './scenes/S1Hook';
import {S2Problem} from './scenes/S2Problem';
import {S3Solution} from './scenes/S3Solution';
import {S4Panel} from './scenes/S4Panel';
import {S5HowItWorks} from './scenes/S5HowItWorks';
import {S6Demo} from './scenes/S6Demo';
import {S7Result} from './scenes/S7Result';
import {S8Ending} from './scenes/S8Ending';

export const NuraChatReel: React.FC = () => {
  useState(() => loadFonts());
  return (
    <AbsoluteFill style={{backgroundColor: '#050605'}}>
      <Background />
      <SceneShell id="hook" enter="none" exit="zoomThrough">
        <S1Hook />
      </SceneShell>
      <SceneShell id="problem" enter="zoomIn" exit="zoomThrough">
        <S2Problem />
      </SceneShell>
      <SceneShell id="solution" enter="zoomIn" exit="blurUp">
        <S3Solution />
      </SceneShell>
      <SceneShell id="panel" enter="fade" exit="blurUp">
        <S4Panel />
      </SceneShell>
      <SceneShell id="how" enter="rise" exit="zoomThrough">
        <S5HowItWorks />
      </SceneShell>
      <SceneShell id="demo" enter="fade" exit="blurUp">
        <S6Demo />
      </SceneShell>
      <SceneShell id="result" enter="rise" exit="fade">
        <S7Result />
      </SceneShell>
      <SceneShell id="ending" enter="fade" exit="none">
        <S8Ending />
      </SceneShell>
      {AUDIO.showCaptions && <Captions />}
      <SfxTrack />
    </AbsoluteFill>
  );
};
