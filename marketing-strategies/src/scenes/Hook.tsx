import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, prog, range} from '../lib/anim';
import {KineticText} from '../components/KineticText';

const fr = (s: number) => Math.round(s * 30);
const W = 840;
const X0 = 120;
const Y0 = 1060;
const H = 380;
const N = 9;
// descending sales, then the same chart flips upward once "marketing" lands
const DOWN = [0.18, 0.3, 0.26, 0.42, 0.5, 0.47, 0.66, 0.78, 0.9];
const UP = [0.9, 0.8, 0.84, 0.62, 0.55, 0.4, 0.3, 0.16, 0.05];

const path = (ys: number[], p: number) => {
  const pts = ys.map((y, i) => [X0 + (i / (N - 1)) * W, Y0 + y * H] as const);
  const upto = p * (N - 1);
  const out: string[] = [];
  for (let i = 0; i <= Math.floor(upto); i++) out.push(`${pts[i][0]},${pts[i][1]}`);
  const k = Math.floor(upto);
  if (k < N - 1) {
    const f = upto - k;
    out.push(`${pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f},${pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f}`);
  }
  return out.join(' ');
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const l2 = fr(cue('hook', 1));
  const mkt = fr(wordAt('hook', 1, 'marketing'));
  const down = prog(frame, 14, 80, ease.inOut);
  const flip = prog(frame, mkt - 4, 26, ease.out);
  const chartIn = prog(frame, 8, 16);
  const strike = prog(frame, l2 + 30, 10, ease.out) * (1 - prog(frame, mkt - 8, 8, ease.in));
  const tail = path(flip > 0 ? UP : DOWN, flip > 0 ? flip : down);
  const last = (flip > 0 ? UP : DOWN)[N - 1];
  const p = flip > 0 ? flip : down;
  const endX = X0 + p * W;
  const endY = Y0 + (flip > 0 ? UP : DOWN)[Math.min(N - 1, Math.round(p * (N - 1)))] * H;
  const col = flip > 0 ? C.accent : C.bad;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}>
        <KineticText lines={['Product accha hai.']} start={6} stagger={3} size={104} exitAt={l2 - 8} />
      </div>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0}}>
        <KineticText lines={['Phir bhi *sales* nahi?']} start={30} stagger={4} size={104} exitAt={l2 - 6} accent={C.bad} accentGlow="rgba(255,77,94,0.35)" />
      </div>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}>
        <KineticText lines={['Problem product', 'mein nahi.']} start={l2 + 2} stagger={3} size={92} exitAt={mkt - 6} color={C.muted} />
      </div>
      <div style={{position: 'absolute', top: 540, left: 540 - 300, width: 600 * strike, height: 8, borderRadius: 9, background: C.accent, transform: 'rotate(-4deg)', transformOrigin: 'left'}} />
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}>
        <KineticText lines={['*Marketing*', 'mein hai.']} start={mkt} stagger={4} size={140} mode="scale" />
      </div>
      {/* chart */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: chartIn * range(frame, [l2 - 6, l2 + 6, mkt - 6, mkt + 6], [1, 0.35, 0.35, 1], ease.inOut)}}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={X0} x2={X0 + W} y1={Y0 + (i / 3) * H} y2={Y0 + (i / 3) * H} stroke={C.line} strokeWidth={2} strokeDasharray="2 12" />
        ))}
        <polyline points={tail} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 14px ${flip > 0 ? C.accentGlow : 'rgba(255,77,94,0.4)'})`}} />
        {p > 0.02 && <circle cx={endX} cy={endY} r={14} fill={col} />}
        <text x={X0} y={Y0 - 30} fill={C.muted} fontFamily="Inter" fontWeight={600} fontSize={24} letterSpacing="5">
          SALES
        </text>
        <text x={X0 + W} y={Y0 - 30} textAnchor="end" fill={col} fontFamily="Inter Display" fontWeight={900} fontSize={40} opacity={p > 0.85 ? 1 : 0}>
          {flip > 0 ? '↑ GROWTH' : '↓'}
        </text>
      </svg>
      {last === 0 && null}
    </AbsoluteFill>
  );
};
