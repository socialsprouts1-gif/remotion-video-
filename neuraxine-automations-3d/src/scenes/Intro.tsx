import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {KineticText} from '../components/KineticText';
import {Stage} from '../three/Stage';
import {Card3D, Phone, Shadow} from '../three/kit';
import {PHONE_POSE} from './Hook';

const fr = (s: number) => Math.round(s * 30);
// real posts from the page fan out around the phone
const POSTS: {img: string; to: [number, number, number]; ry: number; rz: number}[] = [
  {img: 'posts/p1.png', to: [-0.74, 0.34, -0.2], ry: 0.5, rz: 0.06},
  {img: 'posts/p2.png', to: [0.74, 0.34, -0.2], ry: -0.5, rz: -0.06},
  {img: 'posts/p3.png', to: [-0.7, -0.66, 0.1], ry: 0.38, rz: -0.04},
  {img: 'posts/p5.png', to: [0.7, -0.66, 0.1], ry: -0.38, rz: 0.04},
];

const Scene3D: React.FC = () => {
  const f = useCurrentFrame();
  const fan = fr(wordAt('intro', 0, 'automations'));
  const turn = prog(f, 0, 30, ease.inOut);
  return (
    <>
      <group position={[PHONE_POSE.x, PHONE_POSE.y, 0]} rotation={[-0.1 + turn * 0.06, mix(turn, 0.32, -0.08) + Math.sin(f / 50) * 0.05, 0]} scale={PHONE_POSE.s}>
        <Phone screen="tex/lock8.png" screen2="screens/profile.png" mix2={prog(f, 6, 14)} />
      </group>
      <Shadow position={[0, -1.25, -0.2]} w={1.9} d={0.55} />
      {POSTS.map((p, i) => {
        const k = prog(f, fan - 10 + i * 5, 22, ease.out);
        if (k <= 0) return null;
        const bob = Math.sin((f + i * 20) / 22) * 0.03;
        return (
          <Card3D
            key={i}
            img={p.img}
            w={0.5}
            h={0.66}
            r={0.05}
            position={[mix(k, 0, p.to[0]), mix(k, PHONE_POSE.y, p.to[1]) + bob, mix(k, -0.4, p.to[2])]}
            rotation={[0, mix(k, 0, p.ry), p.rz * k]}
            scale={mix(k, 0.4, 1)}
          />
        );
      })}
    </>
  );
};

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage>
        <Scene3D />
      </Stage>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
        <KineticText lines={['*5* AI automations']} start={4} stagger={3} size={104} />
      </div>
      <div style={{position: 'absolute', top: 300, left: 90, right: 90, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12}}>
        {CHAPTERS.map((c, i) => {
          const p = prog(f, 26 + i * 5, 12, ease.out);
          return (
            <div key={c.id} style={{padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${C.lineStrong}`, background: '#fff', color: C.ink, fontFamily: F.body, fontWeight: 600, fontSize: 26, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
              <span style={{fontFamily: F.serif, color: C.accent, marginRight: 8, fontSize: 30}}>0{i + 1}</span>
              {c.short}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
