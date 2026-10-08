import React from 'react';
import {B} from '../timeline';
import {C} from '../theme';
import {ease, lerp, pt, rand, V} from '../lib/anim';
import {BIZ, Cam, camTransform, leadPos, NET} from '../world';
import {Defs} from './prims';

/** Story time that stops during the freeze and resumes after the AI bloom. */
export const frozen = (t: number) => (t < B.freeze ? t : t < B.aiBloom ? B.freeze : t - (B.aiBloom - B.freeze));

/** How lit the ambient network is overall. Darkness → visible system → chaos → organised. */
const ambient = (t: number) => {
  let a = 0.06 + 0.3 * pt(t, 0.5, 6, ease.soft);
  a += 0.12 * pt(t, 21, 23) - 0.06 * pt(t, 16.4, 18);
  a += 0.15 * pt(t, B.chaos[0], B.chaos[1]);
  if (t >= B.freeze && t < B.aiBloom) a *= 0.55;
  a += 0.1 * pt(t, B.ecosystem[0], B.ecosystem[1]);
  return a * (1 - pt(t, 44.1, 44.8));
};

const DUST = [0.32, 0.58].map((depth, li) =>
  Array.from({length: li ? 110 : 160}, (_, i) => ({
    x: (rand(i * 3.3 + li * 100) - 0.5) * 3600,
    y: (rand(i * 7.1 + li * 200) - 0.5) * 4600 - 600,
    r: 1.2 + rand(i * 1.9 + li) * (li ? 3 : 2),
    depth,
  })),
);

/** Far parallax layers: out-of-focus specks that slide slower than the main plane (depth + DOF). */
export const DeepField: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const o = 0.25 + 0.55 * pt(t, 0.2, 4, ease.soft);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {DUST.map((layer, li) => (
        <g key={li} transform={camTransform(cam, layer[0].depth)} filter={li === 0 ? 'url(#soft)' : undefined} opacity={o * (li ? 0.55 : 0.35)}>
          {layer.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r / Math.pow(cam.z, layer[0].depth) * (li ? 1.4 : 2)} fill={i % 9 === 0 ? 'rgba(194,255,61,0.5)' : 'rgba(200,206,202,0.55)'} />
          ))}
        </g>
      ))}
      <Defs />
    </svg>
  );
};

/** The main-plane network every scene lives in. */
export const Network: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const ft = frozen(t);
  const amb = ambient(t);
  const lead = leadPos(t);
  const leadLight = (1 - pt(t, 5.4, 6.4)) * pt(t, 0.4, 1.2);
  const R = (t - B.aiBloom) * 3200; // lime propagation front after the AI appears
  const conv = pt(t, B.converge[0], B.converge[1], ease.inOut);
  const chaos = pt(t, B.chaos[0], B.chaos[0] + 1) * (t < B.aiBloom ? 1 : 1 - pt(t, B.aiBloom, B.aiBloom + 1));
  const lw = 1.3 / cam.z;

  const pos = (n: V): V => (conv > 0 ? {x: lerp(n.x, BIZ.x + (n.x - BIZ.x) * 1.1, conv), y: lerp(n.y, BIZ.y, conv)} : n);
  const light = (n: V) => {
    const near = leadLight * Math.exp(-Math.hypot(n.x - lead.x, n.y - lead.y) / 210);
    return Math.min(1, amb + near * 1.4);
  };
  const limeOf = (n: V) => (R > 0 ? Math.max(0, Math.min(1, (R - Math.hypot(n.x - BIZ.x, n.y - BIZ.y)) / 500)) : 0);

  return (
    <g>
      {NET.edges.map(([i, j], k) => {
        const a = NET.nodes[i];
        const b = NET.nodes[j];
        const l = (light(a) + light(b)) / 2;
        const flick = chaos > 0 ? 0.5 + 0.5 * Math.sin(ft * 23 + k * 1.7) : 1;
        const lime = (limeOf(a) + limeOf(b)) / 2;
        const o = l * 0.32 * lerp(1, flick, chaos);
        if (o < 0.01) return null;
        const pa = pos(a);
        const pb = pos(b);
        return (
          <line
            key={k}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke={lime > 0 ? `rgba(${C.limeRGB},${o * (0.6 + lime * 0.5)})` : `rgba(200,206,202,${o})`}
            strokeWidth={lw}
          />
        );
      })}
      {NET.nodes.map((n, i) => {
        const l = light(n);
        if (l < 0.02) return null;
        const p = pos(n);
        const lime = limeOf(n);
        const twinkle = 0.75 + 0.25 * Math.sin(ft * 1.3 + n.seed);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={n.r * (0.8 + l * 0.6) / Math.sqrt(cam.z)}
            fill={lime > 0.5 ? C.lime : C.metal}
            opacity={Math.min(1, l * 1.6) * twinkle}
          />
        );
      })}
      {/* data streams: small packets riding along edges */}
      {NET.edges.map(([i, j], k) => {
        if (k % 5 !== 0) return null;
        const a = pos(NET.nodes[i]);
        const b = pos(NET.nodes[j]);
        const l = (light(NET.nodes[i]) + light(NET.nodes[j])) / 2;
        if (l < 0.08) return null;
        const f = (ft * (0.25 + rand(k) * 0.3) + rand(k * 3)) % 1;
        const lime = limeOf(NET.nodes[i]);
        return (
          <circle
            key={`p${k}`}
            cx={lerp(a.x, b.x, f)}
            cy={lerp(a.y, b.y, f)}
            r={2.4 / Math.sqrt(cam.z)}
            fill={lime > 0.5 || (leadLight > 0.3 && l > 0.5) ? C.lime : C.white}
            opacity={Math.min(1, l * 2) * Math.sin(f * Math.PI)}
          />
        );
      })}
    </g>
  );
};
