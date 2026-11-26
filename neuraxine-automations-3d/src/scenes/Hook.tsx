import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {ease, mix, prog} from '../lib/anim';
import {Burst, Word} from '../components/Burst';
import {Stage} from '../three/Stage';
import {Bubble3D, Phone, Shadow} from '../three/kit';

const fr = (s: number) => Math.round(s * 30);
const w0 = (s: string) => wordAt('hook', 0, s);
const w1 = (s: string) => wordAt('hook', 1, s);
export const PHONE_POSE = {x: 0, y: -0.2, s: 0.85};

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const msg = fr(w0('message'));
  const subah = fr(cue('hook', 1));
  const comp = fr(w1('competitor'));
  const enter = prog(f, 0, 26, ease.out);
  const shake = f >= msg && f < msg + 16 ? Math.sin(f * 2.4) * 0.05 * (1 - (f - msg) / 16) : 0;
  const pop = prog(f, msg + 2, 16, ease.out);
  const away = prog(f, comp - 4, 18, ease.in);
  const float = Math.sin(f / 18) * 0.04;
  return (
    <>
      <group position={[PHONE_POSE.x, mix(enter, -3.2, PHONE_POSE.y), 0]} rotation={[mix(enter, 0.6, -0.1), mix(enter, 1.1, 0.32) + Math.sin(f / 60) * 0.06, shake]} scale={PHONE_POSE.s}>
        <Phone screen="tex/lock12.png" screen2="tex/lock8.png" mix2={prog(f, subah, 10)} />
      </group>
      <Shadow position={[0, -1.25, -0.2]} w={1.9} d={0.55} opacity={enter} />
      {pop > 0 && away < 1 && (
        <Bubble3D
          dots
          position={[mix(pop, 0, 0.78) + away * 2.6, mix(pop, 0, 0.62) + float + away * 0.6, mix(pop, 0, 0.5)]}
          rotation={[0, -0.25 + away * -0.8, away * -0.4]}
          scale={mix(pop, 0.1, 0.55) * (1 - away * 0.3)}
        />
      )}
    </>
  );
};

export const Hook: React.FC = () => {
  const words: Word[] = [
    {g: 0, t: w0('raat'), text: 'Raat ke', look: 'serif', y: -730, size: 110},
    {g: 0, t: w0('12'), text: '12:00 AM', y: -590, size: 150, from: 'flip'},
    {g: 1, t: w0('ek customer'), text: 'customer ne', y: -730, size: 110, from: 'left'},
    {g: 1, t: w0('message'), text: 'message kiya…', look: 'pill', y: -590, size: 84, from: 'flip'},
    {g: 2, t: w0('aur aap'), text: 'aur aap', look: 'serif', y: -730, size: 120},
    {g: 2, t: w0('so rahe'), text: 'so rahe the.', y: -590, size: 120, from: 'right'},
    {g: 3, t: w1('subah'), text: 'Subah tak,', look: 'serif', y: -730, size: 120},
    {g: 3, t: w1('woh'), text: 'woh customer', y: -590, size: 110, from: 'left'},
    {g: 4, t: w1('competitor'), text: 'COMPETITOR', look: 'lime', y: -720, size: 150, from: 'flip'},
    {g: 4, t: w1('paas'), text: 'ke paas ja chuka tha.', look: 'pill', y: -580, size: 64},
  ];
  return (
    <AbsoluteFill>
      <Stage>
        <Scene3D />
      </Stage>
      <Burst words={words} roll={0.6} />
    </AbsoluteFill>
  );
};
