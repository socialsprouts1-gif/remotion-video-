import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {preloadAll} from './three/kit';
import {loadFonts} from './lib/fonts';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {Frame} from './components/Frame';
import {Rail} from './components/Rail';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {S1, S2, S3, S4, S5} from './scenes/Chapters';
import {Outro} from './scenes/Outro';
import {Cta} from './scenes/Cta';

export const NeuraxineAutomationsReel: React.FC = () => {
  useState(() => loadFonts());
  const [ready, setReady] = useState(false);
  useState(() => {
    const h = delayRender('Preloading 3D textures and logos');
    preloadAll().then(() => {
      setReady(true);
      continueRender(h);
    });
  });
  if (!ready) return <AbsoluteFill style={{backgroundColor: '#FFFFFF'}} />;
  return (
    <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
      <Background />
      <SceneShell id="hook" enter="none" exit="fade">
        <Hook />
      </SceneShell>
      <SceneShell id="intro" enter="fade" exit="whip">
        <Intro />
      </SceneShell>
      <SceneShell id="s1" enter="whip" exit="whip">
        <S1 />
      </SceneShell>
      <SceneShell id="s2" enter="whip" exit="whip">
        <S2 />
      </SceneShell>
      <SceneShell id="s3" enter="whip" exit="whip">
        <S3 />
      </SceneShell>
      <SceneShell id="s4" enter="whip" exit="whip">
        <S4 />
      </SceneShell>
      <SceneShell id="s5" enter="whip" exit="zoomThrough">
        <S5 />
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
