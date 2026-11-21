import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SCENES, SECTION_IDS, SceneId, TOTAL_FRAMES, cue, wordAt} from '../config';
import {sec} from '../lib/anim';

type Cue = {t: number; sfx: string; vol?: number};
const at = (id: SceneId, s: number) => SCENES[id].start + s;

const CUES: Cue[] = [
  {t: 0.1, sfx: 'whooshSoft', vol: 0.45},
  ...SECTION_IDS.slice(1).map((id) => ({t: SCENES[id].start + 0.05, sfx: 'whooshSoft', vol: 0.45})),
  {t: at('hook', wordAt('hook', 0, 'instagram')), sfx: 'pop', vol: 0.45},
  {t: at('hook', wordAt('hook', 0, 'disappears')), sfx: 'impact', vol: 0.4},
  {t: at('hook', wordAt('hook', 0, 'tomorrow')), sfx: 'tick', vol: 0.4},
  {t: at('loss', wordAt('loss', 0, 'followers')), sfx: 'pop', vol: 0.4},
  ...[0, 1, 2].map((i) => ({t: at('loss', wordAt('loss', 0, 'dms')) + i * 0.2, sfx: 'pop', vol: 0.3})),
  {t: at('loss', wordAt('loss', 1, 'click')), sfx: 'click', vol: 0.7},
  {t: at('loss', cue('loss', 1, 'end')) + 0.07, sfx: 'impact', vol: 0.7},
  ...['hacked', 'reported', 'disabled'].map((w) => ({t: at('risk', wordAt('risk', 0, w)) - 0.1, sfx: 'impact', vol: 0.35})),
  ...[0, 1, 2, 3, 4].map((i) => ({t: at('crm', wordAt('crm', 0, 'crm')) - 0.2 + i * 0.2, sfx: 'tick', vol: 0.3})),
  {t: at('crm', wordAt('crm', 0, "else's")) + 0.2, sfx: 'click', vol: 0.5},
  {t: at('ai', wordAt('ai', 0, 'ai automation')), sfx: 'shimmer', vol: 0.4},
  {t: at('ai', wordAt('ai', 1, 'responses')), sfx: 'pop', vol: 0.45},
  {t: at('keep', wordAt('keep', 0, 'comes')), sfx: 'pop', vol: 0.4},
  {t: at('keep', wordAt('keep', 0, 'running')), sfx: 'shimmer', vol: 0.4},
  ...['website', 'crm', 'ai-powered'].map((w) => ({t: at('offer', wordAt('offer', 0, w)) - 0.1, sfx: 'pop', vol: 0.45})),
  {t: at('details', wordAt('details', 0, 'details')) + 0.45, sfx: 'click', vol: 0.6},
  {t: at('details', wordAt('details', 0, 'dms')) - 0.2, sfx: 'pop', vol: 0.5},
  {t: at('details', cue('details', 0, 'end')) + 0.4, sfx: 'impact', vol: 0.55},
  {t: at('details', cue('details', 0, 'end')) + 0.5, sfx: 'shimmer', vol: 0.45},
  {t: at('cta', 0.4), sfx: 'riser', vol: 0.3},
  {t: at('cta', 1.2), sfx: 'impact', vol: 0.55},
  {t: at('cta', 1.5), sfx: 'shimmer', vol: 0.45},
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
