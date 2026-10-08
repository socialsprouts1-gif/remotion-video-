import React, {useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {AUDIO} from './config';
import {B, FPS} from './timeline';
import {C} from './theme';
import {ease, lerp, pt} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {camAt, camTransform} from './world';
import {DeepField, Network} from './components/Field';
import {Defs} from './components/prims';
import {AiCore, Business, Chaos, Connection, Ecosystem, Inbox, Lanes, Lead, Pipeline, Streams} from './components/Story';
import {Hud, Lens} from './components/Hud';

const IMPACTS: [number, number][] = [
  [B.snap, 9],
  [B.lostText[0] + 0.1, 6],
  [B.aiBloom, 10],
];

/** Focus pulls, the freeze grade and impacts, applied to the whole world plane. */
const worldLook = (t: number) => {
  const diveOut = pt(t, 10.2, 10.7, ease.in);
  const diveIn = pt(t, 10.85, 11.7, ease.out);
  const away = t < 10.78 ? diveOut : 1 - diveIn;
  const lostDof = pt(t, B.lostText[0], B.lostText[0] + 0.4) * (1 - pt(t, B.lostText[1] - 0.4, B.lostText[1]));
  const frz = pt(t, B.freeze, B.freeze + 0.35) * (1 - pt(t, B.freezeOut - 0.1, B.aiBloom + 0.1));
  const blur = away * 18 + lostDof * 3 + frz * 3.5;
  let sx = 0;
  let sy = 0;
  for (const [ti, amp] of IMPACTS) {
    if (t >= ti && t < ti + 0.6) {
      const k = Math.exp(-(t - ti) / 0.12);
      sx += Math.sin((t - ti) * 90) * amp * k;
      sy += Math.cos((t - ti) * 77) * amp * k * 0.7;
    }
  }
  return {
    opacity: 1 - away,
    filter: `blur(${blur.toFixed(2)}px) grayscale(${frz}) brightness(${lerp(1, 0.5, frz)})`,
    transform: `translate(${sx}px, ${sy}px)`,
  };
};

export const Film: React.FC = () => {
  useState(() => loadFonts());
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(t);
  const look = worldLook(t);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 80% at 50% 45%, ${C.bg2} 0%, ${C.bg} 70%)`}}>
      <AbsoluteFill style={look}>
        <DeepField t={t} cam={cam} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <Defs />
          <g transform={camTransform(cam)}>
            <Network t={t} cam={cam} />
            <Streams t={t} cam={cam} />
            <Chaos t={t} cam={cam} />
            <Connection t={t} cam={cam} />
            <Business t={t} cam={cam} />
            <Inbox t={t} cam={cam} />
            <Lead t={t} cam={cam} />
            <Pipeline t={t} cam={cam} />
            <Lanes t={t} cam={cam} />
            <Ecosystem t={t} cam={cam} />
            <AiCore t={t} cam={cam} />
          </g>
        </svg>
      </AbsoluteFill>
      <Hud t={t} />
      <Lens t={t} />
      <Audio src={staticFile(AUDIO.score)} volume={AUDIO.scoreVolume * (AUDIO.voiceover ? AUDIO.duckUnderVoice : 1)} />
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
    </AbsoluteFill>
  );
};
