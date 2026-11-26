import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {wordAt} from '../config';
import {ease, prog} from '../lib/anim';
import {Burst, Word} from '../components/Burst';
import {Stage} from '../three/Stage';
import {Logo3D} from '../three/kit';

const w = (s: string) => wordAt('outro', 0, s);
const RING = ['icons/whatsapp-icon.svg', 'icons/meta-icon.svg', 'icons/google-gmail.svg', 'icons/google-g.svg'];

const Ring: React.FC = () => {
  const f = useCurrentFrame();
  const k = prog(f, 4, 24, ease.out);
  return (
    <group position={[0, -0.72, 0]} rotation={[0.32, 0, 0]} scale={k}>
      {RING.map((u, i) => {
        const a = (i / RING.length) * Math.PI * 2 + f / 70;
        return <Logo3D key={u} url={u} size={0.4} depth={0.07} position={[Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7]} rotation={[-0.32, -a + Math.PI / 2, 0]} />;
      })}
    </group>
  );
};

export const Outro: React.FC = () => {
  const words: Word[] = [
    {g: 0, t: w('aap'), text: 'Aap', look: 'serif', y: -330, size: 140},
    {g: 0, t: w('business'), text: 'business chalao.', y: -170, size: 110, from: 'right'},
    {g: 1, t: w('baaki'), text: 'Baaki kaam,', look: 'serif', y: -400, size: 110, from: 'top'},
    {g: 1, t: w(' ai '), text: 'AI', look: 'lime', y: -210, size: 260, from: 'flip'},
    {g: 1, t: w('karega'), text: 'karega.', look: 'pill', y: -20, size: 90},
  ];
  return (
    <AbsoluteFill>
      <Stage>
        <Ring />
      </Stage>
      <Burst words={words} roll={0.6} />
    </AbsoluteFill>
  );
};
