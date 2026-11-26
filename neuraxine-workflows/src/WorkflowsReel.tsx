import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {loadFonts} from './lib/fonts';
import {preloadAll} from './three/kit';
import {SceneShell} from './components/SceneShell';
import {SfxTrack} from './components/SfxTrack';
import {Furniture, Headline} from './components/editorial';
import {Apollo, Crm, Cta, Email, Honest, Hook, Linkedin, Nine, Speed, Vapi, Wrong} from './scenes/Workflows';

export const WorkflowsReel: React.FC = () => {
  useState(() => loadFonts());
  const [ready, setReady] = useState(false);
  useState(() => {
    const h = delayRender('Preloading 3D textures and logos');
    preloadAll().then(() => {
      setReady(true);
      continueRender(h);
    });
  });
  if (!ready) return <AbsoluteFill style={{background: '#060606'}} />;
  return (
    <AbsoluteFill style={{background: '#060606'}}>
      <SceneShell id="hook" enter="none" exit="fade"><Hook /></SceneShell>
      <SceneShell id="nine" enter="fade" exit="fade"><Nine /></SceneShell>
      <SceneShell id="apollo" enter="fade" exit="fade"><Apollo /></SceneShell>
      <SceneShell id="email" enter="fade" exit="fade"><Email /></SceneShell>
      <SceneShell id="linkedin" enter="fade" exit="fade"><Linkedin /></SceneShell>
      <SceneShell id="vapi" enter="fade" exit="fade"><Vapi /></SceneShell>
      <SceneShell id="crm" enter="fade" exit="fade"><Crm /></SceneShell>
      <SceneShell id="honest" enter="zoomIn" exit="fade"><Honest /></SceneShell>
      <SceneShell id="wrong" enter="fade" exit="fade"><Wrong /></SceneShell>
      <SceneShell id="speed" enter="fade" exit="fade"><Speed /></SceneShell>
      <SceneShell id="cta" enter="fade" exit="none"><Cta /></SceneShell>
      <Headline />
      <Furniture />
      <SfxTrack />
    </AbsoluteFill>
  );
};
