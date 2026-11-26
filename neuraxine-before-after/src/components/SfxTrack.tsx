import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SCENES, SECTION_IDS, SceneId, TOTAL_FRAMES, cue, wordAt} from '../config';
import {sec} from '../lib/anim';

type Cue = {t: number; sfx: string; vol?: number};
const at = (id: SceneId, s: number) => SCENES[id].start + s;

const CUES: Cue[] = [
  {t: 0.1, sfx: 'whooshSoft', vol: 0.45},
  ...SECTION_IDS.slice(1).map((id) => ({t: SCENES[id].start + 0.05, sfx: 'whooshSoft', vol: 0.4})),
  ...[0, 1, 2, 3, 4, 5].map((i) => ({t: at('b1', wordAt('b1', 0, 'price')) - 1 + i * 0.23, sfx: 'pop', vol: 0.3})),
  {t: at('b1', wordAt('b1', 0, '50')), sfx: 'tick', vol: 0.45},
  {t: at('b2', wordAt('b2', 0, 'competitor')), sfx: 'impact', vol: 0.35},
  {t: at('switch', 0.3), sfx: 'riser', vol: 0.35},
  {t: at('switch', 0.9), sfx: 'impact', vol: 0.6},
  {t: at('switch', 1.0), sfx: 'shimmer', vol: 0.45},
  {t: at('a1', wordAt('a1', 0, '3 second')), sfx: 'pop', vol: 0.45},
  ...['price', 'catalogue', 'location'].map((w) => ({t: at('a1', wordAt('a1', 0, w)), sfx: 'tick', vol: 0.35})),
  {t: at('a2', wordAt('a2', 0, 'calendar')), sfx: 'pop', vol: 0.4},
  {t: at('a3', wordAt('a3', 0, 'deals')), sfx: 'shimmer', vol: 0.45},
  ...['instant', 'saved', 'sukoon'].map((w) => ({t: at('compare', wordAt('compare', 0, w)), sfx: 'tick', vol: 0.4})),
  {t: at('cta', wordAt('cta', 0, 'automate')), sfx: 'click', vol: 0.6},
  {t: at('cta', wordAt('cta', 1, 'follow')), sfx: 'click', vol: 0.6},
  {t: at('cta', cue('cta', 1, 'end')) + 0.2, sfx: 'impact', vol: 0.55},
  {t: at('cta', cue('cta', 1, 'end')) + 0.3, sfx: 'shimmer', vol: 0.45},
];

export const SfxTrack: React.FC = () => (
  <>
    {CUES.map((c, i) => (
      <Sequence key={i} from={Math.max(0, sec(c.t))} durationInFrames={90} name={`sfx:${c.sfx}`}>
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={(c.vol ?? 0.5) * AUDIO.sfxVolume * 0.75} />
      </Sequence>
    ))}
    {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
    {AUDIO.music && <Audio src={staticFile(AUDIO.music)} volume={(fr) => AUDIO.musicVolume * Math.min(1, fr / 15, (TOTAL_FRAMES - fr) / 45)} />}
  </>
);
