/**
 * One world, one camera. Every story element lives at a fixed place in this
 * coordinate space; the camera flies between them, so scenes never cut — they
 * are just different framings of the same network.
 */
import {B} from './timeline';
import {catmull, ease, lerp, pt, rand, V} from './lib/anim';

// ------------------------------------------------------------------ anchors
export const BIZ: V = {x: -260, y: -860}; // the business node; later the AI core
export const CARD = {x: 0, y: -330, w: 760, h: 540}; // the chat interface
export const AVATAR: V = {x: -300, y: -545}; // customer avatar inside the card header
export const STAMP: V = {x: 236, y: -344}; // message timestamp (the camera dives into it)
export const CUST: V = {x: 300, y: -860}; // customer node while waiting
export const COMP: V = {x: 1000, y: -1300}; // competitor
export const REVENUE: V = {x: -260, y: -400}; // revenue meter in the 100-leads scene

/** Path the lead travels from darkness to the inbox. */
export const LEAD_PATH: V[] = [
  {x: 0, y: 620},
  {x: -150, y: 360},
  {x: 90, y: 70},
  {x: -70, y: -230},
  {x: -230, y: -450},
  AVATAR,
];

export const leadPos = (t: number): V => {
  const [a, b] = B.leadTravel;
  return catmull(LEAD_PATH, pt(t, a, b, ease.inOut));
};

// ------------------------------------------------------------------ pipeline + lanes (AI scenes)
export const STAGES = ['LEAD', 'INSTANT RESPONSE', 'AI QUALIFICATION', 'FOLLOW-UP', 'BOOKING', 'REVENUE'];
export const stagePos = (i: number): V => ({x: BIZ.x, y: BIZ.y + 210 * (i + 1)});

export const LANES: [string, string][] = [
  ['QUESTION', 'AI RESPONSE'],
  ['INTEREST', 'QUALIFICATION'],
  ['READY', 'BOOKING'],
  ['NO RESPONSE', 'FOLLOW-UP'],
];
export const laneY = (i: number) => BIZ.y + 320 + i * 200;
export const LANE_IN_X = BIZ.x - 250;
export const LANE_OUT_X = BIZ.x + 270;

export const SATELLITES = ['LEADS', 'CUSTOMERS', 'FOLLOW-UPS', 'BOOKINGS', 'REVENUE'];
export const satPos = (i: number, t: number): V => {
  const a = -Math.PI / 2 + (i / SATELLITES.length) * Math.PI * 2 + (t - B.ecosystem[0]) * 0.05;
  return {x: BIZ.x + Math.cos(a) * 1450, y: BIZ.y + Math.sin(a) * 1450};
};

// ------------------------------------------------------------------ camera
export type Cam = {x: number; y: number; z: number; r: number};

// [time, x, y, zoom, rotation°]. Repeating a pose holds it; zoom eases in log space.
const KEYS: [number, number, number, number, number][] = [
  [5.9, 0, -360, 1.12, 0],
  [9.8, 0, -345, 1.24, 0],
  [10.7, STAMP.x, STAMP.y, 7.0, 0],
  [10.76, 20, -940, 1.34, 0], // hidden reposition while the world is blurred out behind the clock
  [16.3, 150, -930, 1.2, 1.4],
  [18.2, 420, -1080, 0.72, 0],
  [21.0, 420, -1080, 0.78, 0],
  [22.6, -260, -1100, 0.5, 0],
  [27.0, -260, -1100, 0.46, 0],
  [30.0, -260, -1050, 0.26, -1.5],
  [32.8, -260, -1050, 0.26, -1.5],
  [34.0, -260, -860, 0.92, 0],
  [36.8, -260, -230, 0.8, 0],
  [37.6, -260, -500, 0.8, 0],
  [41.0, -260, -500, 0.84, 0],
  [43.6, -260, -860, 0.16, 6],
  [44.5, -260, -860, 0.16, 0],
  [50, -260, -860, 0.17, 0],
];

const keyCam = (t: number): Cam => {
  if (t <= KEYS[0][0]) {
    const k = KEYS[0];
    return {x: k[1], y: k[2], z: k[3], r: k[4]};
  }
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t < b[0]) {
      const p = pt(t, a[0], b[0], ease.inOut);
      return {
        x: lerp(a[1], b[1], p),
        y: lerp(a[2], b[2], p),
        z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), p)),
        r: lerp(a[4], b[4], p),
      };
    }
  }
  const k = KEYS[KEYS.length - 1];
  return {x: k[1], y: k[2], z: k[3], r: k[4]};
};

/** Opening: the camera rides just behind the lead and slowly pushes in, then hands over to the keyframes. */
export const camAt = (t: number): Cam => {
  const lp = leadPos(t - 0.12);
  const follow: Cam = {x: lp.x * 0.85 - 40, y: lp.y + 40, z: lerp(1.35, 1.6, pt(t, 0, 5.4, ease.soft)), r: lerp(-2, 0, pt(t, 0, 5, ease.soft))};
  const hand = pt(t, 5.0, 5.9, ease.inOut);
  if (hand <= 0) return follow;
  const k = keyCam(t);
  return {
    x: lerp(follow.x, k.x, hand),
    y: lerp(follow.y, k.y, hand),
    z: Math.exp(lerp(Math.log(follow.z), Math.log(k.z), hand)),
    r: lerp(follow.r, k.r, hand),
  };
};

/** World → screen (1080×1920), for a layer at parallax depth p (1 = main plane). */
export const project = (cam: Cam, w: V, p = 1): V => {
  const z = Math.pow(cam.z, p);
  const dx = (w.x - cam.x * p) * z;
  const dy = (w.y - cam.y * p) * z;
  const r = (cam.r * Math.PI) / 180;
  return {x: 540 + dx * Math.cos(r) - dy * Math.sin(r), y: 960 + dx * Math.sin(r) + dy * Math.cos(r)};
};

export const camTransform = (cam: Cam, p = 1) =>
  `translate(540 960) rotate(${cam.r}) scale(${Math.pow(cam.z, p)}) translate(${-cam.x * p} ${-cam.y * p})`;

// ------------------------------------------------------------------ ambient network
export type Node = {x: number; y: number; r: number; seed: number};
export type Edge = [number, number];

/** A jittered grid of nodes joined to their nearest neighbours: the business's nervous system. */
export const makeNetwork = (seed: number, x0: number, x1: number, y0: number, y1: number, step: number) => {
  const nodes: Node[] = [];
  let k = 0;
  for (let y = y0; y <= y1; y += step) {
    for (let x = x0; x <= x1; x += step) {
      k++;
      if (rand(seed + k * 1.7) < 0.22) continue;
      nodes.push({
        x: x + (rand(seed + k * 3.1) - 0.5) * step * 0.9,
        y: y + (rand(seed + k * 5.3) - 0.5) * step * 0.9,
        r: 2.2 + rand(seed + k * 7.9) * 3,
        seed: seed + k,
      });
    }
  }
  const edges: Edge[] = [];
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({j, d: Math.hypot(m.x - n.x, m.y - n.y)}))
      .filter((o) => o.j > i && o.d < step * 1.55)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach((o) => edges.push([i, o.j]));
  });
  return {nodes, edges};
};

export const NET = makeNetwork(11, -1500, 1700, -3200, 1300, 175);
