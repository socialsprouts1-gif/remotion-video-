import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mat, MatName} from './materials';

/**
 * Procedural eyewear. Units: 1 ≈ 25 mm. The frame faces +z, temples run toward -z.
 * Everything is built for the wearer's left half (x > 0) and mirrored.
 */
export type FrameSpec = {
  a: number; // lens half width
  b: number; // lens half height
  n: number; // superellipse exponent (2 = oval, 4+ = rectangular)
  lift: number; // cat-eye lift of the outer top corner
  drop: number; // aviator-style teardrop at the inner bottom
  bridge: number; // gap between the lenses
  kind: 'acetate' | 'metal' | 'rimless';
  rim: number; // acetate ring width / metal wire radius
  depth: number; // acetate front thickness
  front: MatName;
  metal: MatName;
  lens: 'clear' | 'sun';
  templeLen: number;
  doubleBridge?: boolean;
  rivets?: boolean;
};

export const FRAMES: Record<string, FrameSpec> = {
  // Hero: glossy black acetate with champagne-gold hardware
  hero: {a: 1.3, b: 0.96, n: 3.0, lift: 0.1, drop: 0, bridge: 0.62, kind: 'acetate', rim: 0.2, depth: 0.22, front: 'black', metal: 'gold', lens: 'clear', templeLen: 5.6, rivets: true},
  // Sunglasses: champagne-gold wire, double bridge, dark lenses
  sun: {a: 1.42, b: 1.12, n: 2.5, lift: 0.04, drop: 0.22, bridge: 0.6, kind: 'metal', rim: 0.055, depth: 0.1, front: 'gold', metal: 'gold', lens: 'sun', templeLen: 5.6, doubleBridge: true},
  // Style edit
  modern: {a: 1.12, b: 1.08, n: 2.05, lift: 0, drop: 0, bridge: 0.66, kind: 'metal', rim: 0.048, depth: 0.1, front: 'gold', metal: 'gold', lens: 'clear', templeLen: 5.4},
  classic: {a: 1.32, b: 0.98, n: 3.0, lift: 0.06, drop: 0, bridge: 0.6, kind: 'acetate', rim: 0.2, depth: 0.2, front: 'tortoise', metal: 'gold', lens: 'clear', templeLen: 5.6, rivets: true},
  minimal: {a: 1.24, b: 0.9, n: 2.8, lift: 0, drop: 0, bridge: 0.7, kind: 'rimless', rim: 0.04, depth: 0.08, front: 'goldSatin', metal: 'goldSatin', lens: 'clear', templeLen: 5.4},
  bold: {a: 1.42, b: 1.06, n: 4.0, lift: 0.18, drop: 0, bridge: 0.56, kind: 'acetate', rim: 0.3, depth: 0.3, front: 'black', metal: 'gold', lens: 'clear', templeLen: 5.8, rivets: true},
};

/** Lens outline, centred at the origin; x > 0 is the outer (temple) side. */
const contour = (s: FrameSpec, grow = 0, N = 120): THREE.Vector2[] => {
  const raw: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const c = Math.cos(th);
    const si = Math.sin(th);
    let x = s.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / s.n);
    let y = s.b * Math.sign(si) * Math.pow(Math.abs(si), 2 / s.n);
    const ox = Math.max(0, x / s.a);
    if (y > 0) y += s.lift * ox * ox * (y / s.b) * s.b;
    if (y < 0) {
      // teardrop: inner-bottom sweeps down, outer-bottom tucks in
      const ix = Math.max(0, -x / s.a);
      y -= s.drop * (1 - ix) * (-y / s.b) * s.b * 0.6;
      x += s.drop * 0.15 * (-y / s.b);
    }
    raw.push(new THREE.Vector2(x, y));
  }
  if (!grow) return raw;
  return raw.map((p, i) => {
    const a = raw[(i - 1 + N) % N];
    const b = raw[(i + 1) % N];
    const t = new THREE.Vector2().subVectors(b, a).normalize();
    const nrm = new THREE.Vector2(t.y, -t.x); // outward for CCW
    return p.clone().addScaledVector(nrm, grow);
  });
};

const extrude = (shape: THREE.Shape, depth: number, bevel: number, steps = 1) => {
  const g = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 48, steps});
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
};

const tube = (pts: THREE.Vector3[], r: number, closed = false, seg = 64) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.5), seg, r, 16, closed);

/** Geometry for one half of a frame (x > 0). */
const buildHalf = (s: FrameSpec) => {
  const cx = s.bridge / 2 + s.a + (s.kind === 'acetate' ? s.rim * 0.5 : 0);
  const parts: {geo: THREE.BufferGeometry; m: MatName; pos?: [number, number, number]; rot?: [number, number, number]}[] = [];
  const outerX = cx + s.a + (s.kind === 'acetate' ? s.rim : s.rim * 2);
  const hingeY = s.b * 0.5 + s.lift * 0.5;

  // lens (slightly domed)
  const lensShape = new THREE.Shape(contour(s, s.kind === 'acetate' ? 0.04 : 0));
  const lg = extrude(lensShape, 0.035, 0.012);
  const p = lg.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const r2 = Math.min(1, (x * x) / (s.a * s.a) + (y * y) / (s.b * s.b));
    p.setZ(i, p.getZ(i) + 0.14 * (1 - r2));
  }
  lg.computeVertexNormals();
  parts.push({geo: lg, m: s.lens, pos: [cx, 0, s.kind === 'acetate' ? -0.02 : 0]});

  if (s.kind === 'acetate') {
    const ring = new THREE.Shape(contour(s, s.rim));
    ring.holes.push(new THREE.Path(contour(s, 0)));
    parts.push({geo: extrude(ring, s.depth, 0.05), m: s.front, pos: [cx, 0, 0]});
    // bridge block joining the two rings
    const bw = cx - s.a - 0.06;
    const br = new THREE.Shape();
    br.moveTo(0, s.b * 0.72);
    br.lineTo(bw, s.b * 0.72);
    br.lineTo(bw, s.b * 0.05);
    br.quadraticCurveTo(s.bridge * 0.3, s.b * 0.42, 0, s.b * 0.42);
    br.lineTo(0, s.b * 0.72);
    parts.push({geo: extrude(br, s.depth, 0.05), m: s.front});
    // end piece carrying the hinge
    const ep = new THREE.BoxGeometry(0.36, 0.5, s.depth + 0.25);
    parts.push({geo: ep, m: s.front, pos: [outerX - 0.12, hingeY, -0.12]});
    // nose pads moulded in
    const pad = new THREE.SphereGeometry(0.16, 24, 16);
    pad.scale(0.55, 1.4, 0.9);
    parts.push({geo: pad, m: s.front, pos: [s.bridge / 2 + 0.06, -s.b * 0.05, -0.16], rot: [0, 0.5, 0]});
    if (s.rivets) {
      for (const dy of [0.09, -0.09]) {
        const rv = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 24);
        rv.rotateX(Math.PI / 2);
        parts.push({geo: rv, m: s.metal, pos: [outerX - 0.2 + (dy > 0 ? 0 : 0.12), hingeY + dy, s.depth / 2 + 0.03]});
      }
    }
  } else {
    if (s.kind === 'metal') {
      const pts = contour(s, s.rim, 72).map((v) => new THREE.Vector3(v.x, v.y, 0));
      parts.push({geo: tube(pts, s.rim, true, 220), m: s.front, pos: [cx, 0, 0]});
    }
    // bridge(s)
    const ix = cx - s.a - (s.kind === 'metal' ? s.rim : -0.02);
    const by = s.kind === 'rimless' ? s.b * 0.3 : s.b * 0.38;
    parts.push({geo: tube([new THREE.Vector3(ix + 0.02, by, 0), new THREE.Vector3(ix * 0.5, by + 0.14, 0.02), new THREE.Vector3(0, by + 0.18, 0.02)], s.rim * 0.95, false, 32), m: s.metal});
    if (s.doubleBridge) {
      parts.push({geo: tube([new THREE.Vector3(ix + 0.25, s.b * 0.98, 0), new THREE.Vector3(ix * 0.6, s.b * 0.92, 0.02), new THREE.Vector3(0, s.b * 0.9, 0.02)], s.rim * 0.85, false, 32), m: s.metal});
    }
    // end piece from the rim to the hinge
    const ex = cx + s.a * 0.96;
    parts.push({geo: tube([new THREE.Vector3(ex, hingeY, 0), new THREE.Vector3(outerX - 0.05, hingeY, -0.04), new THREE.Vector3(outerX, hingeY, -0.2)], s.rim * 1.25, false, 24), m: s.metal});
    // pad arms + silicone pads
    const ax = ix + 0.05;
    parts.push({geo: tube([new THREE.Vector3(ax, s.b * 0.05, -0.02), new THREE.Vector3(ax - 0.05, -s.b * 0.08, -0.16), new THREE.Vector3(ax - 0.02, -s.b * 0.14, -0.3)], 0.022, false, 16), m: s.metal});
    const pad = new THREE.SphereGeometry(0.17, 24, 16);
    pad.scale(0.4, 1.35, 0.8);
    parts.push({geo: pad, m: 'pad', pos: [ax - 0.06, -s.b * 0.26, -0.32], rot: [0.15, 0.55, 0]});
    if (s.kind === 'rimless') {
      // drill mounts
      for (const xx of [ix + 0.08, ex])
        parts.push({geo: new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16).rotateX(Math.PI / 2), m: s.metal, pos: [xx, xx === ex ? hingeY : by, 0]});
    }
  }
  // hinge barrel
  const hb = new THREE.CylinderGeometry(0.065, 0.065, 0.3, 24);
  parts.push({geo: hb, m: s.metal, pos: [outerX - 0.05, hingeY, -0.34]});
  return {parts, hinge: new THREE.Vector3(outerX - 0.05, hingeY, -0.34), cx};
};

/** Temple arm geometry, starting at the hinge and running toward -z. */
const buildTemple = (s: FrameSpec) => {
  const L = s.templeLen;
  const parts: {geo: THREE.BufferGeometry; m: MatName}[] = [];
  if (s.kind === 'acetate') {
    const sh = new THREE.Shape();
    const top = (u: number) => (u < L * 0.72 ? 0.2 - u * 0.012 : 0.2 - L * 0.72 * 0.012 - Math.pow((u - L * 0.72) / (L * 0.28), 2) * 0.9);
    const h = (u: number) => 0.34 - (u / L) * 0.16;
    const N = 40;
    sh.moveTo(0, top(0));
    for (let i = 1; i <= N; i++) sh.lineTo((i / N) * L, top((i / N) * L));
    for (let i = N; i >= 0; i--) sh.lineTo((i / N) * L, top((i / N) * L) - h((i / N) * L));
    const g = new THREE.ExtrudeGeometry(sh, {depth: 0.13, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3});
    g.rotateY(Math.PI / 2);
    g.translate(-0.08, 0, 0);
    g.computeVertexNormals();
    parts.push({geo: g, m: s.front});
    // gold core wire glint near the hinge
    const w = new THREE.BoxGeometry(0.02, 0.05, L * 0.5);
    w.translate(0.07, 0.05, -L * 0.25 - 0.2);
    parts.push({geo: w, m: s.metal});
  } else {
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.0, -L * 0.4), new THREE.Vector3(0.0, -0.04, -L * 0.72), new THREE.Vector3(-0.04, -0.4, -L * 0.9), new THREE.Vector3(-0.06, -0.85, -L * 0.98)];
    parts.push({geo: tube(pts.slice(0, 3), s.rim * 1.1 + 0.01, false, 64), m: s.metal});
    parts.push({geo: tube(pts.slice(2), 0.085, false, 48), m: 'tip'});
  }
  return parts;
};

export const Eyewear: React.FC<{
  spec: FrameSpec;
  fold?: number; // 0 = open, 1 = folded flat
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({spec, fold = 0, position, rotation, scale = 1}) => {
  const half = useMemo(() => buildHalf(spec), [spec]);
  const temple = useMemo(() => buildTemple(spec), [spec]);
  const side = (sx: 1 | -1) => (
    <group scale={[sx, 1, 1]} key={sx}>
      {half.parts.map((pp, i) => (
        <mesh key={i} geometry={pp.geo} material={mat(pp.m)} position={pp.pos} rotation={pp.rot} renderOrder={pp.m === 'clear' || pp.m === 'sun' ? 2 : 0} />
      ))}
      <group position={half.hinge} rotation={[0, fold * (Math.PI / 2) * 0.96 + 0.04, 0]}>
        {temple.map((pp, i) => (
          <mesh key={i} geometry={pp.geo} material={mat(pp.m)} />
        ))}
      </group>
    </group>
  );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {side(1)}
      {side(-1)}
    </group>
  );
};

/** World-space anchors (for overlay graphics) at scale 1, unrotated. */
export const anchors = (s: FrameSpec) => {
  const {cx, hinge} = buildHalf(s);
  return {cx, hinge, outer: hinge.x + 0.05};
};
