// Sound effects placed on the story beats (files synthesised by scripts/make_sfx.py).
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO, SCENES, SECTION_IDS, VIDEO, cue, wordAt} from './config';

const fr = (s: number) => Math.round(s * VIDEO.fps);
type Cue = [frame: number, file: string, vol: number];

const cues = (): Cue[] => {
  const at = (id: keyof typeof SCENES, s: number) => SCENES[id].from + fr(s);
  const list: Cue[] = [];
  // a soft whoosh on every cut
  SECTION_IDS.slice(1).forEach((id) => list.push([SCENES[id].from - 3, id === 'laptop' || id === 'end' ? 'whoosh' : 'whooshSoft', 0.5]));
  list.push([at('news', cue('news', 0) + 0.9), 'pop', 0.8]);
  list.push([at('shock', 0.13), 'impact', 0.9]);
  list.push([at('order', wordAt('order', 0, 'whatsapp')), 'pop', 0.6]);
  for (let i = 0; i < 3; i++) list.push([at('diary', cue('diary', 1) + 0.33 + i * 0.87), 'tick', 0.7]);
  list.push([at('block', wordAt('block', 0, 'block') - 0.13), 'impact', 0.85]);
  list.push([at('raju', wordAt('raju', 1, 'neura')), 'shimmer', 0.6]);
  const sel = wordAt('laptop', 0, 'sab customers');
  list.push([at('laptop', sel - 0.2), 'click', 0.8]);
  list.push([at('laptop', sel + 0.33), 'click', 0.8]);
  const click = wordAt('laptop', 1, 'click');
  list.push([at('laptop', click - 0.07), 'click', 0.9]);
  for (let i = 0; i < 6; i++) list.push([at('laptop', click + 0.1 + i * 0.25), 'pop', 0.35]);
  for (let i = 0; i < 4; i++) list.push([at('laptop', cue('laptop', 2) + 0.8 + i * 0.3), 'tick', 0.4]);
  list.push([at('laptop', cue('laptop', 3) + 0.13), 'pop', 0.7]);
  list.push([at('laptop', wordAt('laptop', 3, 'khud') - 0.13), 'pop', 0.8]);
  list.push([at('easy', 0.1), 'shimmer', 0.7]);
  list.push([at('crowd', 0), 'riser', 0.5]);
  list.push([at('crowd', cue('crowd', 2)), 'impact', 0.6]);
  list.push([at('crowd', cue('crowd', 2) + 0.1), 'shimmer', 0.8]);
  list.push([at('end', 0.1), 'shimmer', 0.6]);
  list.push([at('end', wordAt('end', 0, 'link')), 'pop', 0.6]);
  return list;
};

export const SfxTrack: React.FC = () => (
  <>
    {cues().map(([f, file, v], i) => (
      <Sequence key={i} from={Math.max(0, f)} durationInFrames={VIDEO.fps * 3}>
        <Audio src={staticFile(`sfx/${file}.wav`)} volume={v * AUDIO.sfxVolume} />
      </Sequence>
    ))}
  </>
);
