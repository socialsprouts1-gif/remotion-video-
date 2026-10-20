import {ease, lerp, pt} from './anim';

export type Pose = {x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number; o: number};
const ID: Pose = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 1};
export type Key = [number, Partial<Pose>];

/** Keyframed 3D pose. Each key inherits unspecified fields from the previous one; S-curve between keys. */
export const kf = (keys: Key[], t: number, curve = ease.inOut): Pose => {
  const full: [number, Pose][] = [];
  let prev = ID;
  for (const [kt, p] of keys) {
    prev = {...prev, ...p};
    full.push([kt, prev]);
  }
  if (t <= full[0][0]) return full[0][1];
  for (let i = 0; i < full.length - 1; i++) {
    const [ta, a] = full[i];
    const [tb, b] = full[i + 1];
    if (t < tb) {
      const p = pt(t, ta, tb, curve);
      const o = {} as Pose;
      (Object.keys(ID) as (keyof Pose)[]).forEach((k) => (o[k] = k === 's' ? Math.exp(lerp(Math.log(a.s), Math.log(b.s), p)) : lerp(a[k], b[k], p)));
      return o;
    }
  }
  return full[full.length - 1][1];
};

/** Place an element (centred on its own box) at a pose relative to the stage centre. */
export const place = (p: Pose) =>
  `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s}) translate(-50%, -50%)`;

/** Depth of field: blur grows with distance from the focal plane (z = 0). */
export const dof = (z: number, focus = 0) => Math.min(9, Math.max(0, (Math.abs(z - focus) - 140) / 70));
