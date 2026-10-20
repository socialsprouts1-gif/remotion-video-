import React, {useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AUDIO, BLUR} from './config';
import {FPS} from './timeline';
import {C} from './theme';
import {loadFonts} from './lib/fonts';
import {Stage} from './components/Stage';
import {Overlay} from './components/Overlay';
import {Lens} from './components/Type';

const Picture: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 110% 70% at 50% 42%, ${C.bg2} 0%, ${C.bg} 72%)`}}>
      {/* slow light leak */}
      <AbsoluteFill style={{background: `radial-gradient(600px 900px at ${540 + Math.sin(t * 0.25) * 300}px ${700 + Math.cos(t * 0.2) * 300}px, rgba(${C.limeRGB},0.06), transparent 70%)`}} />
      <Stage t={t} />
      <Overlay t={t} />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  useState(() => loadFonts());
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {BLUR.samples > 1 ? (
        <CameraMotionBlur shutterAngle={BLUR.shutterAngle} samples={BLUR.samples}>
          <Picture />
        </CameraMotionBlur>
      ) : (
        <Picture />
      )}
      <Lens t={t} />
      <Audio src={staticFile(AUDIO.score)} volume={AUDIO.scoreVolume * (AUDIO.voiceover ? AUDIO.duckUnderVoice : 1)} />
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
    </AbsoluteFill>
  );
};
