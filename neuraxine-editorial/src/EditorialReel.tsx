import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {loadFonts} from './lib/fonts';
import {preloadAll} from './three/kit';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {Furniture, Headline} from './components/editorial';
import {A1, A2, A3, A4, B1, B2, B3, Compare, Cta, Hook, Switch} from './scenes/Editorial';

export const EditorialReel: React.FC = () => {
  useState(() => loadFonts());
  const [ready, setReady] = useState(false);
  useState(() => {
    const h = delayRender('Preloading 3D textures');
    preloadAll().then(() => {
      setReady(true);
      continueRender(h);
    });
  });
  if (!ready) return <AbsoluteFill style={{background: '#060606'}} />;
  return (
    <AbsoluteFill style={{background: '#060606'}}>
      <SceneShell id="hook" enter="none" exit="fade"><Hook /></SceneShell>
      <SceneShell id="b1" enter="fade" exit="fade"><B1 /></SceneShell>
      <SceneShell id="b2" enter="fade" exit="fade"><B2 /></SceneShell>
      <SceneShell id="b3" enter="fade" exit="fade"><B3 /></SceneShell>
      <SceneShell id="switch" enter="zoomIn" exit="fade"><Switch /></SceneShell>
      <SceneShell id="a1" enter="fade" exit="fade"><A1 /></SceneShell>
      <SceneShell id="a2" enter="fade" exit="fade"><A2 /></SceneShell>
      <SceneShell id="a3" enter="fade" exit="fade"><A3 /></SceneShell>
      <SceneShell id="a4" enter="fade" exit="fade"><A4 /></SceneShell>
      <SceneShell id="compare" enter="fade" exit="fade"><Compare /></SceneShell>
      <SceneShell id="cta" enter="fade" exit="none"><Cta /></SceneShell>
      <Headline />
      <Furniture />
      <SfxTrack />
    </AbsoluteFill>
  );
};
