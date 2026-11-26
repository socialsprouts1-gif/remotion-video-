import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {Frame} from './components/Frame';
import {Orbit} from './components/Orbit';
import {Rail} from './components/Rail';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {Opener} from './scenes/Opener';
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

export const NeuraxineReel: React.FC = () => {
  useState(() => loadFonts());
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Background />
      <SceneShell id="opener" enter="none" exit="zoomThrough">
        <Opener />
      </SceneShell>
      <SceneShell id="hook" enter="zoomIn" exit="zoomThrough">
        <Hook />
      </SceneShell>
      <SceneShell id="intro" enter="zoomIn" exit="whip">
        <Intro />
      </SceneShell>
      <SceneShell id="s1" enter="whip" exit="whip">
        <Orbit>
          <S1Audience />
        </Orbit>
      </SceneShell>
      <SceneShell id="s2" enter="whip" exit="whip">
        <Orbit>
          <S2Content />
        </Orbit>
      </SceneShell>
      <SceneShell id="s3" enter="whip" exit="whip">
        <Orbit>
          <S3Proof />
        </Orbit>
      </SceneShell>
      <SceneShell id="s4" enter="whip" exit="whip">
        <Orbit>
          <S4FollowUp />
        </Orbit>
      </SceneShell>
      <SceneShell id="s5" enter="whip" exit="zoomThrough">
        <Orbit>
          <S5Data />
        </Orbit>
      </SceneShell>
      <SceneShell id="outro" enter="zoomIn" exit="zoomThrough">
        <Outro />
      </SceneShell>
      <SceneShell id="cta" enter="zoomIn" exit="none">
        <Cta />
      </SceneShell>
      <Rail />
      <Captions />
      <Frame />
      <SfxTrack />
    </AbsoluteFill>
  );
};
