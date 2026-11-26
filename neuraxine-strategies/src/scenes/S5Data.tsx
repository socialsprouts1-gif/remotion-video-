import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {GlassCard} from '../components/GlassCard';

const fr = (s: number) => Math.round(s * 30);
const X0 = 70;
const W = 700;
const Y0 = 60;
const H = 520;
const REELS = [0.85, 0.8, 0.72, 0.66, 0.5, 0.42, 0.26, 0.12];
const BANNER = [0.7, 0.72, 0.69, 0.74, 0.73, 0.76, 0.78, 0.8];

const pts = (ys: number[], p: number) => {
  const n = ys.length;
  const upto = p * (n - 1);
  const k = Math.floor(upto);
  const out = ys.slice(0, k + 1).map((y, i) => `${X0 + (i / (n - 1)) * W},${Y0 + y * H}`);
  if (k < n - 1) {
    const f = upto - k;
    out.push(`${X0 + ((k + f) / (n - 1)) * W},${Y0 + (ys[k] + (ys[k + 1] - ys[k]) * f) * H}`);
  }
  return out.join(' ');
};

export const S5Data: React.FC = () => {
  const frame = useCurrentFrame();
  const dbl = fr(wordAt('s5', 1, 'double'));
  const cut = fr(wordAt('s5', 1, 'band'));
  const cardIn = prog(frame, 28, 18, ease.out);
  const draw = prog(frame, 40, 60, ease.inOut);
  const boost = prog(frame, dbl, 14, ease.out);
  const snip = prog(frame, cut, 10, ease.out);
  const fall = prog(frame, cut + 6, 24, ease.in);
  return (
    <AbsoluteFill>
      <ChapterHeader n={5} start={4} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 520, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 80}px)`}}>
        <GlassCard radius={32} strong style={{padding: 0, height: 720, background: 'rgba(20,17,14,0.85)'}}>
          <div style={{position: 'absolute', left: 34, top: 26, color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 22, letterSpacing: '0.2em'}}>RESULTS · 8 WEEKS</div>
          <svg width={920} height={720} style={{position: 'absolute', left: 0, top: 30}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={X0} x2={X0 + W} y1={Y0 + (i / 4) * H} y2={Y0 + (i / 4) * H} stroke={C.line} strokeDasharray="2 12" strokeWidth={2} />
            ))}
            {/* banner ads: flat, then cut */}
            <g opacity={1 - fall} transform={`translate(0 ${fall * 120})`}>
              <polyline points={pts(BANNER, draw)} fill="none" stroke={snip > 0 ? C.bad : C.muted} strokeWidth={6} strokeLinecap="round" strokeDasharray={snip > 0 ? '14 12' : undefined} />
            </g>
            {/* reels: rising, then doubled */}
            <polyline points={pts(REELS, draw)} fill="none" stroke={C.accent} strokeWidth={mix(boost, 7, 14)} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 ${mix(boost, 8, 22)}px ${C.accentGlow})`}} />
            {snip > 0 && <line x1={X0 + W * 0.55 - 40} y1={Y0 + 0.74 * H - 60} x2={X0 + W * 0.55 + 40} y2={Y0 + 0.74 * H + 60} stroke={C.bad} strokeWidth={8} strokeLinecap="round" opacity={1 - fall} strokeDasharray={`${snip * 150} 150`} />}
          </svg>
          <div style={{position: 'absolute', right: 40, top: 76, display: 'flex', alignItems: 'center', gap: 12, opacity: draw > 0.9 ? 1 : 0}}>
            <span style={{color: C.ink, fontFamily: F.body, fontWeight: 700, fontSize: 30}}>Reels</span>
            <span
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: C.accent,
                color: '#1A0700',
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 26,
                opacity: boost,
                transform: `scale(${mix(boost, 1.6, 1)})`,
              }}
            >
              2× BUDGET
            </span>
          </div>
          <div style={{position: 'absolute', right: 40, top: 520, display: 'flex', alignItems: 'center', gap: 12, opacity: (draw > 0.9 ? 1 : 0) * (1 - fall * 0.6)}}>
            <span style={{color: C.muted, fontFamily: F.body, fontWeight: 700, fontSize: 30}}>Banner ads</span>
            {snip > 0 && <span style={{padding: '8px 16px', borderRadius: 999, background: C.bad, color: 'white', fontFamily: F.display, fontWeight: 900, fontSize: 26, transform: `scale(${mix(snip, 1.6, 1)})`}}>OFF</span>}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};
