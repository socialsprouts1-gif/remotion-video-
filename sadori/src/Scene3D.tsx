import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ease, lerp, pt} from './anim';
import {anchors, Eyewear, FRAMES} from './three/Eyewear';
import {Rig, Studio} from './three/Studio';
import story from './story.json';

type V3 = [number, number, number];
const L3 = (a: V3, b: V3, p: number): V3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

export const ROW_GAP = 11;
export const STYLE_NAMES = ['modern', 'classic', 'minimal', 'bold'] as const;
const TA = story.styleAt;

/** Camera index along the boutique row (0..3), with eased moves between pedestals. */
export const rowIndex = (t: number) => {
  let i = 0;
  for (let k = 1; k < TA.length; k++) i += pt(t, TA[k] - 0.55, TA[k] + 0.1, ease.inOut);
  return i;
};

/** Distance used for the front-on "precision" and end shots. */
export const FRONT_D = 38;
export const END_D = 40;

const shadowTex = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,0,0,0.85)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    tex = new THREE.CanvasTexture(c);
    return tex;
  };
})();

const Pedestal: React.FC<{x: number}> = ({x}) => {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#1b1814', roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3}), []);
  const top = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#221e19', roughness: 0.18, clearcoat: 1}), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#e2c38e', roughness: 0.25, metalness: 1}), []);
  return (
    <group position={[x, -1.9, 0]}>
      <mesh position={[0, -14, 0]} material={body}>
        <cylinderGeometry args={[2.5, 2.5, 28, 96, 1, true]} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={top}>
        <circleGeometry args={[2.5, 96]} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]} material={gold}>
        <torusGeometry args={[2.5, 0.035, 12, 128]} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 3.2]} />
        <meshBasicMaterial map={shadowTex()} transparent depthWrite={false} opacity={0.8} />
      </mesh>
      <pointLight position={[0, 5.2, 2.2]} intensity={26} distance={14} decay={2} color="#ffd9a6" />
    </group>
  );
};

export const Scene3D: React.FC<{t: number}> = ({t}) => {
  const C = story.cuts;
  const hero = FRAMES.hero;
  const ha = useMemo(() => anchors(hero), [hero]);

  // ---- 1 + 2a: reveal and first turn
  if (t < C[0]) {
    const light = pt(t, 0.45, 2.9, ease.inOut);
    const rotY = -0.78 + 0.38 * pt(t, 0, 4.2, ease.soft) + 1.4 * pt(t, 4.0, 5.6, ease.inOut);
    const cam = t < 4 ? L3([0, 0.9, 52], [0, 0.6, 43], pt(t, 0, 4, ease.soft)) : L3([0, 0.6, 43], [0, 1.1, 33], pt(t, 4, 5.6, ease.inOut));
    return (
      <>
        <Rig pos={cam} target={[0, 0.25, 0]} fov={22} />
        <Studio intensity={0.05 + 1.15 * light} rim={1.3} />
        <Eyewear spec={hero} rotation={[0.1 - 0.05 * pt(t, 0, 5.6), rotY, 0.02]} position={[0, 0.15 * Math.sin(t * 1.1), 0]} />
      </>
    );
  }
  // ---- 2b: macro hinge
  if (t < C[1]) {
    const p = pt(t, C[0], C[1], ease.soft);
    const h = ha.hinge;
    const cam: V3 = [h.x + lerp(4.6, 3.6, p), h.y + lerp(2.0, 1.2, p), h.z + lerp(5.6, 4.4, p)];
    const tgt: V3 = [h.x - lerp(1.5, 1.1, p), h.y - 0.35, h.z - 0.6];
    return (
      <>
        <Rig pos={cam} target={tgt} fov={26} roll={lerp(0.05, -0.02, p)} />
        <Studio intensity={1.25} rim={1.4} />
        <Eyewear spec={hero} rotation={[0, lerp(0.12, -0.06, p), 0]} />
      </>
    );
  }
  // ---- 2c: sunglasses macro (bridge, pad, lens edge)
  if (t < C[2]) {
    const p = pt(t, C[1], C[2], ease.soft);
    return (
      <>
        <Rig pos={L3([-0.9, -1.6, 7.2], [-0.4, -1.2, 6.0], p)} target={L3([0.6, -0.15, -0.2], [0.75, -0.25, -0.25], p)} fov={30} />
        <Studio intensity={1.3} rim={1.2} />
        <Eyewear spec={FRAMES.sun} rotation={[0.05, lerp(0.38, 0.22, p), 0]} />
      </>
    );
  }
  // ---- 2d: sunglasses turn
  if (t < C[3]) {
    const p = pt(t, C[2], C[3], ease.inOut);
    return (
      <>
        <Rig pos={L3([0, 0.8, 41], [0, 0.5, 37], p)} target={[0, 0.35, 0]} fov={22} />
        <Studio intensity={1.25} rim={1.3} />
        <Eyewear spec={FRAMES.sun} rotation={[0.08, lerp(0.95, -0.32, p), 0]} position={[0, 0.1 * Math.sin(t * 1.3), 0]} />
      </>
    );
  }
  // ---- 3: lens → fitting → precision
  if (t < C[4]) {
    const p1 = pt(t, 10.0, 12.2, ease.inOut);
    const tilt = pt(t, 11.7, 12.45, ease.inOut) * (1 - pt(t, 13.35, 14.0, ease.inOut));
    const fold = 1 - pt(t, 12.35, 13.3, ease.inOut);
    const x = ha.cx * (1 - p1);
    return (
      <>
        <Rig pos={[x, 0, lerp(8.5, FRONT_D, p1)]} target={[x, 0, 0]} fov={22} />
        <Studio intensity={1.2} rim={1.2} />
        <Eyewear spec={hero} fold={fold} rotation={[0.5 * tilt, -0.55 * tilt, 0]} />
      </>
    );
  }
  // ---- 4: the boutique row
  if (t < C[5]) {
    const i = rowIndex(t);
    const fin = pt(t, 21.35, 22.7, ease.inOut);
    const drift = pt(t, 16, 21.4, (v) => v);
    const camA: V3 = [ROW_GAP * i, 2.2, 46 - 3 * drift];
    const camB: V3 = [ROW_GAP * 3 + 12, 6, 40];
    const tgtA: V3 = [ROW_GAP * i, -1.2, 0];
    const tgtB: V3 = [ROW_GAP * 1.2, -2.2, -3];
    return (
      <>
        <Rig pos={L3(camA, camB, fin)} target={L3(tgtA, tgtB, fin)} fov={22} />
        <Studio intensity={0.75} rim={1.0} />
        {STYLE_NAMES.map((n, k) => (
          <React.Fragment key={n}>
            <Pedestal x={ROW_GAP * k} />
            <Eyewear spec={FRAMES[n]} position={[ROW_GAP * k, -0.55 + 0.08 * Math.sin(t * 1.2 + k), 0]} rotation={[0.06, 0.55 * Math.sin(t * 0.7 + k * 1.7) - 0.15, 0]} scale={0.95} />
          </React.Fragment>
        ))}
      </>
    );
  }
  // ---- 5: heritage line art (no 3D)
  if (t < C[6]) return null;
  // ---- 6: alignment and end card
  const align = pt(t, 28.0, 30.0, ease.inOut);
  const lift = pt(t, 30.55, 31.7, ease.inOut);
  return (
    <>
      <Rig pos={[0, 0, lerp(46, END_D, pt(t, 28, 30.6, ease.soft))]} target={[0, 0, 0]} fov={22} />
      <Studio intensity={lerp(0.6, 1.45, pt(t, 28, 29.4))} rim={1.3} />
      <Eyewear
        spec={hero}
        rotation={[0.18 * (1 - align) + 0.03 * Math.sin(t * 0.8) * lift, 1.3 * (1 - align) + 0.12 * Math.sin((t - 31.7) * 0.9) * lift, 0]}
        position={[0, lerp(0, 3.15, lift), 0]}
        scale={lerp(1, 0.66, lift)}
      />
    </>
  );
};
