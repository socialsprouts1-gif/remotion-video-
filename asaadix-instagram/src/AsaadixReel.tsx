import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {loadFonts} from './lib/fonts';
import {preloadAll} from './three/kit';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {TopCaption, Watermark} from './components/ui';
import {Ai, Crm, Cta, Details, Hook, Keep, Loss, Offer, Risk} from './scenes/Scenes';
import {C} from './theme';

export const AsaadixReel: React.FC = () => {
  useState(() => loadFonts());
  const [ready, setReady] = useState(false);
  useState(() => {
    const h = delayRender('Preloading 3D textures');
    preloadAll().then(() => {
      setReady(true);
      continueRender(h);
    });
  });
  if (!ready) return <AbsoluteFill style={{background: C.cream}} />;
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <SceneShell id="hook" enter="none" exit="none">
        <Hook />
      </SceneShell>
      <SceneShell id="loss" enter="fade" exit="none">
        <Loss />
      </SceneShell>
      <SceneShell id="risk" enter="zoomIn" exit="fade">
        <Risk />
      </SceneShell>
      <SceneShell id="crm" enter="fade" exit="zoomThrough">
        <Crm />
      </SceneShell>
      <SceneShell id="ai" enter="zoomIn" exit="fade">
        <Ai />
      </SceneShell>
      <SceneShell id="keep" enter="fade" exit="zoomThrough">
        <Keep />
      </SceneShell>
      <SceneShell id="cta" enter="zoomIn" exit="fade">
        <Cta />
      </SceneShell>
      <SceneShell id="offer" enter="fade" exit="fade">
        <Offer />
      </SceneShell>
      <SceneShell id="details" enter="fade" exit="none">
        <Details />
      </SceneShell>
      <TopCaption />
      <Watermark />
      <SfxTrack />
    </AbsoluteFill>
  );
};
