import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {S1Hook} from './scenes/S1Hook';
import {S2Problem} from './scenes/S2Problem';
import {S3Chat} from './scenes/S3Chat';
import {S4Broadcast} from './scenes/S4Broadcast';
import {S5Dashboard} from './scenes/S5Dashboard';
import {S6Ending} from './scenes/S6Ending';
import {C} from './theme';

export const ForexReel: React.FC = () => {
  useState(() => loadFonts());
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Background />
      <SceneShell id="hook" enter="none" exit="zoomThrough">
        <S1Hook />
      </SceneShell>
      <SceneShell id="problem" enter="zoomIn" exit="zoomThrough">
        <S2Problem />
      </SceneShell>
      <SceneShell id="chat" enter="fade" exit="zoomThrough">
        <S3Chat />
      </SceneShell>
      <SceneShell id="broadcast" enter="zoomIn" exit="blurUp">
        <S4Broadcast />
      </SceneShell>
      <SceneShell id="dashboard" enter="rise" exit="blurUp">
        <S5Dashboard />
      </SceneShell>
      <SceneShell id="ending" enter="fade" exit="none">
        <S6Ending />
      </SceneShell>
      <SfxTrack />
    </AbsoluteFill>
  );
};
