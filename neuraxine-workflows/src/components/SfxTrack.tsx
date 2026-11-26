import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SCENES, SECTION_IDS, SceneId, TOTAL_FRAMES, cue, wordAt} from '../config';
import {sec} from '../lib/anim';

type Cue = {t: number; sfx: string; vol?: number};
const at = (id: SceneId, s: number) => SCENES[id].start + s;

const CUES: Cue[] = [
  {t: 0.1, sfx: 'whooshSoft', vol: 0.45},
  ...SECTION_IDS.slice(1).map((id) => ({t: SCENES[id].start + 0.05, sfx: 'whooshSoft', vol: 0.4})),
  ...['lead', 'email', 'linkedin', 'call'].map((w) => ({t: at('hook', wordAt('hook', 0, w)) - 0.1, sfx: 'pop', vol: 0.4})),
  {t: at('hook', wordAt('hook', 0, 'system')), sfx: 'impact', vol: 0.5},
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({t: at('nine', 0.2 + i * 0.233), sfx: 'tick', vol: 0.3})),
  {t: at('apollo', wordAt('apollo', 0, 'list')), sfx: 'shimmer', vol: 0.35},
  {t: at('email', wordAt('email', 0, 'dear')) + 0.2, sfx: 'click', vol: 0.55},
  {t: at('linkedin', wordAt('linkedin', 0, 'khud')) + 0.1, sfx: 'pop', vol: 0.45},
  {t: at('vapi', wordAt('vapi', 0, 'voice')), sfx: 'shimmer', vol: 0.35},
  {t: at('crm', wordAt('crm', 0, 'dashboard')), sfx: 'pop', vol: 0.4},
  {t: at('honest', wordAt('honest', 0, 'set')) + 0.8, sfx: 'impact', vol: 0.5},
  {t: at('wrong', wordAt('wrong', 0, 'spam')) - 0.3, sfx: 'riser', vol: 0.35},
  {t: at('wrong', wordAt('wrong', 0, 'spam')) + 0.2, sfx: 'impact', vol: 0.5},
  {t: at('speed', wordAt('speed', 0, 'target')) - 0.05, sfx: 'impact', vol: 0.6},
  {t: at('cta', wordAt('cta', 0, 'dm')) + 0.6, sfx: 'click', vol: 0.6},
  {t: at('cta', cue('cta', 0, 'end')) + 0.3, sfx: 'impact', vol: 0.55},
  {t: at('cta', cue('cta', 0, 'end')) + 0.4, sfx: 'shimmer', vol: 0.45},
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
