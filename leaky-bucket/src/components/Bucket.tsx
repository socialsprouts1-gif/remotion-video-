import React from 'react';
import {ease, lerp, pt, rand} from '../lib/anim';
import {FONT, K, pop} from './Kit';

// Bucket geometry (canvas px)
const RIM_Y = 1000;
const BOT_Y = 1430;
const TOP = [260, 820];
const BOT = [330, 750];
export const HOLES = [
  {x: 292, y: 1150, vx: -260, label: 'left'},
  {x: 768, y: 1290, vx: 260, label: 'right'},
  {x: 540, y: 1424, vx: 0, label: 'bottom'},
];
export const NOZZLE = {x: 610, y: 650};

type Props = {
  t: number;
  level: number; // 0..1
  jets: number[]; // leak intensity per hole
  flow: number; // inflow intensity 0..2
  highlight: number[]; // per hole 0..1
  patched: number[]; // per hole 0..1 (pop progress)
  patchTags: string[];
  holeLabels: string[];
  faucet: number; // faucet visibility
  ads: number; // "+ ADS" badge
  glow: number;
  puddle: number;
};

const xAt = (y: number, side: 0 | 1) => lerp(TOP[side], BOT[side], (y - RIM_Y) / (BOT_Y - RIM_Y));

/** Water drops shaped like little chat bubbles: the leads. */
const Drop: React.FC<{x: number; y: number; s?: number; o?: number; tone?: 'lead' | 'leak'}> = ({x, y, s = 1, o = 1, tone = 'lead'}) => (
  <div style={{position: 'absolute', left: x - 22 * s, top: y - 18 * s, width: 44 * s, height: 34 * s, opacity: o}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 12 * s, background: tone === 'lead' ? '#fff' : '#8FD8FF', border: `${3 * s}px solid ${tone === 'lead' ? K.wa : '#4AB4F0'}`}} />
    {tone === 'lead' && (
      <>
        <div style={{position: 'absolute', left: 9 * s, top: 10 * s, width: 20 * s, height: 4 * s, borderRadius: 4, background: K.wa}} />
        <div style={{position: 'absolute', left: 9 * s, top: 18 * s, width: 13 * s, height: 4 * s, borderRadius: 4, background: '#BDECCF'}} />
      </>
    )}
  </div>
);

export const Bucket: React.FC<Props> = ({t, level, jets, flow, highlight, patched, patchTags, holeLabels, faucet, ads, glow, puddle}) => {
  const waterY = BOT_Y - level * (BOT_Y - RIM_Y - 30);
  const wave = (x: number) => Math.sin(x / 40 + t * 4) * 6 + Math.sin(x / 23 - t * 3) * 3;
  const wx0 = xAt(waterY, 0);
  const wx1 = xAt(waterY, 1);
  const surf = Array.from({length: 21}, (_, i) => {
    const x = lerp(wx0, wx1, i / 20);
    return `${x},${waterY + wave(x)}`;
  }).join(' ');

  // inflow drops (from the faucet to the water surface)
  const inflow: React.ReactNode[] = [];
  if (flow > 0.01) {
    const N = 10;
    const rate = 1.4 + flow * 1.6;
    for (let k = 0; k < N; k++) {
      if (flow < 1 && k % 2) continue;
      const ph = (t * rate + k / N) % 1;
      const y = lerp(NOZZLE.y + 10, waterY - 10, ph * ph);
      const x = NOZZLE.x + (rand(k * 3.7 + Math.floor(t * rate + k / N)) - 0.5) * 40;
      inflow.push(<Drop key={k} x={x} y={y} s={0.9} o={Math.min(1, flow) * (ph < 0.95 ? 1 : 0)} />);
    }
  }

  // leaking jets
  const leaks: React.ReactNode[] = [];
  HOLES.forEach((h, i) => {
    const j = jets[i] * (1 - patched[i]);
    if (j < 0.02) return;
    const N = 9;
    for (let k = 0; k < N; k++) {
      const age = ((t * 1.8 + k / N + i * 0.31) % 1) * 0.7;
      const x = h.x + h.vx * age * (0.8 + 0.4 * rand(k + i * 9));
      const y = h.y + 120 * age + 1500 * age * age;
      if (y > 1520) continue;
      leaks.push(<Drop key={`${i}-${k}`} x={x} y={y} s={0.75} o={j * (1 - age / 0.75)} />);
    }
  });

  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      {/* faucet */}
      <div style={{opacity: faucet}}>
        <div style={{position: 'absolute', left: NOZZLE.x - 20, top: 540, width: 1080 - NOZZLE.x + 40, height: 54, borderRadius: 27, background: '#B9BED6', boxShadow: 'inset 0 -8px 0 #9AA0BE'}} />
        <div style={{position: 'absolute', left: NOZZLE.x - 34, top: 560, width: 68, height: 90, borderRadius: '0 0 22px 22px', background: '#B9BED6', boxShadow: 'inset -8px 0 0 #9AA0BE'}} />
        <div style={{position: 'absolute', left: NOZZLE.x + 40, top: 500, width: 22, height: 44, background: '#7C82A3'}} />
        <div style={{position: 'absolute', left: NOZZLE.x - 10, top: 486, width: 122, height: 26, borderRadius: 13, background: K.red, transform: `rotate(${-8 - ads * 20}deg)`}} />
        <div style={{position: 'absolute', left: 760, top: 548, fontSize: 26, fontWeight: 800, color: K.ink, letterSpacing: '0.14em'}}>LEADS</div>
        {ads > 0 && <div style={{position: 'absolute', left: 900, top: 470, padding: '8px 18px', borderRadius: 14, background: K.orange, color: '#fff', fontSize: 26, fontWeight: 800, transform: `scale(${ads}) rotate(6deg)`}}>+ ADS</div>}
      </div>
      {inflow}

      {/* puddle */}
      <div style={{position: 'absolute', left: 540 - 380 * puddle, top: 1492, width: 760 * puddle, height: 46, borderRadius: '50%', background: 'rgba(74,180,240,0.28)'}} />

      {/* glow when full */}
      {glow > 0 && <div style={{position: 'absolute', left: 180, top: 900, width: 720, height: 640, borderRadius: '50%', background: `radial-gradient(circle, rgba(19,176,91,${0.25 * glow}), transparent 65%)`}} />}

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="inside">
            <polygon points={`${TOP[0] + 14},${RIM_Y} ${TOP[1] - 14},${RIM_Y} ${BOT[1] - 12},${BOT_Y - 12} ${BOT[0] + 12},${BOT_Y - 12}`} />
          </clipPath>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#2F8FE0" />
          </linearGradient>
        </defs>
        {/* handle */}
        <path d={`M ${TOP[0] + 20} ${RIM_Y + 10} C ${TOP[0] + 40} ${RIM_Y - 230}, ${TOP[1] - 40} ${RIM_Y - 230}, ${TOP[1] - 20} ${RIM_Y + 10}`} fill="none" stroke="#7C82A3" strokeWidth={12} strokeLinecap="round" />
        {/* body */}
        <polygon points={`${TOP[0]},${RIM_Y} ${TOP[1]},${RIM_Y} ${BOT[1]},${BOT_Y} ${BOT[0]},${BOT_Y}`} fill="#E3E7F5" stroke={K.ink} strokeWidth={8} strokeLinejoin="round" />
        {/* water */}
        <g clipPath="url(#inside)">
          <polygon points={`${surf} ${BOT[1]},${BOT_Y} ${BOT[0]},${BOT_Y}`} fill="url(#water)" opacity={0.92} />
        </g>
        {/* bands */}
        <line x1={xAt(1070, 0)} y1={1070} x2={xAt(1070, 1)} y2={1070} stroke="#B9BED6" strokeWidth={6} />
        <line x1={xAt(1370, 0)} y1={1370} x2={xAt(1370, 1)} y2={1370} stroke="#B9BED6" strokeWidth={6} />
        {/* rim */}
        <rect x={TOP[0] - 16} y={RIM_Y - 18} width={TOP[1] - TOP[0] + 32} height={30} rx={15} fill="#C9CEE3" stroke={K.ink} strokeWidth={8} />
        {/* holes */}
        {HOLES.map((h, i) => (
          <ellipse key={i} cx={h.x} cy={h.y} rx={i === 2 ? 26 : 16} ry={i === 2 ? 10 : 22} fill={K.ink} />
        ))}
      </svg>
      {/* label on the bucket */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1192, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 999, background: '#fff', boxShadow: '0 6px 18px rgba(21,26,59,0.15)'}}>
          <div style={{width: 40, height: 40, borderRadius: 40, background: K.wa, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 20}}>✆</div>
          <span style={{fontSize: 32, fontWeight: 800, color: K.ink}}>WhatsApp</span>
        </div>
      </div>
      {leaks}

      {/* problem highlights */}
      {HOLES.map((h, i) => {
        const p = highlight[i];
        if (p <= 0.01) return null;
        const ring = 1 + 0.12 * Math.sin(t * 6);
        const lx = i === 0 ? h.x - 250 : i === 1 ? h.x + 40 : h.x - 110;
        const ly = i === 2 ? h.y + 40 : h.y - 90;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: h.x - 46, top: h.y - 46, width: 92, height: 92, borderRadius: 92, border: `5px dashed ${K.red}`, transform: `scale(${p * ring})`, opacity: p}} />
            <div style={{position: 'absolute', left: lx, top: ly, padding: '10px 20px', borderRadius: 14, background: K.red, color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap', transform: `scale(${p})`, boxShadow: '0 10px 24px rgba(232,54,93,0.35)'}}>
              {holeLabels[i]}
            </div>
          </React.Fragment>
        );
      })}

      {/* patches */}
      {HOLES.map((h, i) => {
        const p = patched[i];
        if (p <= 0.01) return null;
        const w = i === 2 ? 220 : 190;
        const x = i === 0 ? h.x - 40 : i === 1 ? h.x - w + 40 : h.x - w / 2;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: h.y - 34, width: w, height: 68, borderRadius: 16, background: K.violet, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', boxShadow: '0 12px 26px rgba(109,59,255,0.4)', transform: `scale(${p}) rotate(${i === 1 ? 6 : -6}deg)`, border: '3px dashed rgba(255,255,255,0.6)'}}>
            {patchTags[i]}
          </div>
        );
      })}
    </div>
  );
};

/** Level of water over the film. */
export const levelAt = (t: number, S: Record<string, [number, number]>) => {
  let l = lerp(0.12, 0.3, pt(t, 0.4, S.pour[1]));
  l -= 0.06 * pt(t, S.holes[0] + 0.6, S.holes[1]);
  l += 0.62 * pt(t, S.stays[0] + 0.2, S.stays[0] + 2.6, ease.inOut);
  return l;
};
export {pop};
