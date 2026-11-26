import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {Frame} from './components/Frame';
import {Rail} from './components/Rail';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {S1Audience} from './scenes/S1Audience';
import {S2Content} from './scenes/S2Content';
import {S3Proof} from './scenes/S3Proof';
import {S4FollowUp} from './scenes/S4FollowUp';
import {S5Data} from './scenes/S5Data';
import {Outro} from './scenes/Outro';
import {Cta} from './scenes/Cta';
import {C} from './theme';

export const MarketingReel: React.FC = () => {
  useState(() => loadFonts());
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Background />
      <SceneShell id="hook" enter="none" exit="zoomThrough">
        <Hook />
      </SceneShell>
      <SceneShell id="intro" enter="zoomIn" exit="zoomThrough">
        <Intro />
      </SceneShell>
      <SceneShell id="s1" enter="fade" exit="blurUp">
        <S1Audience />
      </SceneShell>
      <SceneShell id="s2" enter="fade" exit="blurUp">
        <S2Content />
      </SceneShell>
      <SceneShell id="s3" enter="fade" exit="blurUp">
        <S3Proof />
      </SceneShell>
      <SceneShell id="s4" enter="fade" exit="blurUp">
        <S4FollowUp />
      </SceneShell>
      <SceneShell id="s5" enter="fade" exit="zoomThrough">
        <S5Data />
      </SceneShell>
      <SceneShell id="outro" enter="zoomIn" exit="blurUp">
        <Outro />
      </SceneShell>
      <SceneShell id="cta" enter="rise" exit="none">
        <Cta />
      </SceneShell>
      <Rail />
      <Captions />
      <Frame />
      <SfxTrack />
    </AbsoluteFill>
  );
};
