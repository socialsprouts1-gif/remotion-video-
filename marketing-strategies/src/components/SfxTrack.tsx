import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SCENES, SECTION_IDS, SceneId, TOTAL_FRAMES, cue, wordAt} from '../config';
import {sec} from '../lib/anim';

type Cue = {t: number; sfx: string; vol?: number};
const at = (id: SceneId, s: number) => SCENES[id].start + s;

// Section transitions get a whoosh; key reveals get an impact or shimmer; small items tick or pop.
const CUES: Cue[] = [
  ...SECTION_IDS.slice(1).map((id) => ({t: SCENES[id].start + 0.05, sfx: 'whooshSoft', vol: 0.5})),
  {t: 0.2, sfx: 'impact', vol: 0.4},
  {t: at('hook', wordAt('hook', 1, 'marketing')), sfx: 'impact', vol: 0.6},
  {t: at('intro', 0.4), sfx: 'impact', vol: 0.5},
  ...(['s1', 's2', 's3', 's4', 's5'] as SceneId[]).map((id) => ({t: at(id, 0.25), sfx: 'impact', vol: 0.4})),
  {t: at('s1', wordAt('s1', 1, 'ideal')), sfx: 'shimmer', vol: 0.4},
  ...[0, 1, 2].map((i) => ({t: at('s2', wordAt('s2', 1, 'content') + i * 0.35), sfx: 'pop', vol: 0.35})),
  ...[0, 1, 2, 3, 4].map((i) => ({t: at('s3', cue('s3', 1) + 0.27 + i * 0.18), sfx: 'tick', vol: 0.35})),
  {t: at('s4', wordAt('s4', 1, 'wapas')), sfx: 'shimmer', vol: 0.4},
  {t: at('s5', wordAt('s5', 1, 'band')), sfx: 'click', vol: 0.6},
  {t: at('outro', wordAt('outro', 0, 'system')), sfx: 'impact', vol: 0.55},
  {t: at('cta', wordAt('cta', 0, 'grow')), sfx: 'click', vol: 0.6},
  {t: at('cta', wordAt('cta', 1, 'follow')), sfx: 'click', vol: 0.6},
  {t: at('cta', wordAt('cta', 1, 'follow') + 0.2), sfx: 'shimmer', vol: 0.45},
];

export const SfxTrack: React.FC = () => {
  const voice = !!AUDIO.voiceover;
  return (
    <>
      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.t))} durationInFrames={90} name={`sfx:${c.sfx}`}>
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={(c.vol ?? 0.5) * AUDIO.sfxVolume * (voice ? 0.75 : 1)} />
        </Sequence>
      ))}
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
      {AUDIO.music && <Audio src={staticFile(AUDIO.music)} volume={(fr) => AUDIO.musicVolume * Math.min(1, fr / 15, (TOTAL_FRAMES - fr) / 45)} />}
    </>
  );
};
