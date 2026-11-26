import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {AUDIO} from './config';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {S1Hook} from './scenes/S1Hook';
import {S2Impossible} from './scenes/S2Impossible';
import {S3Agent} from './scenes/S3Agent';
import {S4Connect} from './scenes/S4Connect';
import {S5Workflow} from './scenes/S5Workflow';
import {S6Ending} from './scenes/S6Ending';

export const NeuraxineReel: React.FC = () => {
  useState(() => loadFonts());
  return (
    <AbsoluteFill style={{backgroundColor: '#050605'}}>
      <Background />
      <SceneShell id="hook" enter="none" exit="zoomThrough"><S1Hook /></SceneShell>
      <SceneShell id="impossible" enter="zoomIn" exit="zoomThrough"><S2Impossible /></SceneShell>
      <SceneShell id="agent" enter="rise" exit="blurUp"><S3Agent /></SceneShell>
      <SceneShell id="connect" enter="fade" exit="zoomThrough"><S4Connect /></SceneShell>
      <SceneShell id="workflow" enter="zoomIn" exit="blurUp"><S5Workflow /></SceneShell>
      <SceneShell id="ending" enter="fade" exit="none"><S6Ending /></SceneShell>
      {AUDIO.showCaptions && <Captions />}
      <SfxTrack />
    </AbsoluteFill>
  );
};
