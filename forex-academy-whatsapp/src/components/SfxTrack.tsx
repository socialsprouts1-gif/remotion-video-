import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SFX, TOTAL_FRAMES} from '../config';
import {sec} from '../lib/anim';

/** Sound effects (public/sfx, from scripts/make_sfx.py), music bed (scripts/make_music.py) and optional voiceover. */
export const SfxTrack: React.FC = () => {
  const sfxGain = AUDIO.sfxVolume * (AUDIO.voiceover ? 0.6 : 1);
  const musicGain = AUDIO.musicVolume * (AUDIO.voiceover ? 0.55 : 1);
  return (
    <>
      {SFX.map((c, i) => (
        <Sequence key={i} from={sec(c.t)} durationInFrames={90} name={`sfx:${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={(c.vol ?? 0.5) * sfxGain} />
        </Sequence>
      ))}
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
      {AUDIO.music && (
        <Audio src={staticFile(AUDIO.music)} volume={(fr) => musicGain * Math.min(1, fr / 15, (TOTAL_FRAMES - fr) / 45)} />
      )}
    </>
  );
};
