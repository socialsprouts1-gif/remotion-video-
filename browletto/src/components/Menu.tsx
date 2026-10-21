import React from 'react';
import {ease, lerp, pt, rand} from '../anim';
import {DISPLAY, P} from '../tokens';
import {Bean} from './Kit';

/**
 * Stylised menu illustrations: vector product art, clearly graphic, not photographs.
 * Each draws in a 700×700 box; r = seconds since the item appeared.
 */

const wave = (w: number, y: number, amp: number, ph: number, k = 3) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * w;
    pts.push(`${x.toFixed(1)},${(y + Math.sin((i / 40) * Math.PI * k + ph) * amp).toFixed(1)}`);
  }
  return pts.join(' L');
};

export const Shake: React.FC<{r: number}> = ({r}) => {
  const fill = pt(r, 0.05, 0.75, ease.out);
  const top = lerp(600, 250, fill);
  const cream = pt(r, 0.45, 0.85, ease.out);
  return (
    <svg viewBox="0 0 700 700" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="glass">
          <path d="M210 190 L490 190 L455 620 Q450 650 420 650 L280 650 Q250 650 245 620 Z" />
        </clipPath>
        <linearGradient id="choc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a1f12" />
          <stop offset="0.45" stopColor="#6b3d22" />
          <stop offset="0.6" stopColor="#7c4a2a" />
          <stop offset="1" stopColor="#2c170c" />
        </linearGradient>
      </defs>
      {/* liquid */}
      <g clipPath="url(#glass)">
        <path d={`M0,${top} L${wave(700, top, 10 * (1 - fill * 0.6), r * 7)} L700,700 L0,700 Z`} fill="url(#choc)" />
        <path d={`M0,${top + 26} L${wave(700, top + 26, 6, r * 5 + 2, 4)}`} fill="none" stroke="rgba(255,220,180,0.18)" strokeWidth={6} />
      </g>
      {/* glass */}
      <path d="M210 190 L490 190 L455 620 Q450 650 420 650 L280 650 Q250 650 245 620 Z" fill="rgba(255,255,255,0.05)" stroke={P.cream} strokeWidth={6} strokeLinejoin="round" />
      <path d="M232 215 L262 600" stroke="rgba(255,255,255,0.35)" strokeWidth={10} strokeLinecap="round" />
      {/* whipped cream */}
      <g transform={`translate(350 196) scale(${cream})`}>
        {[[-90, 0, 62], [0, -18, 74], [90, 0, 62], [-40, -70, 58], [45, -72, 56], [0, -118, 44]].map(([x, y, rr], i) => (
          <circle key={i} cx={x} cy={y} r={rr} fill={P.cream} stroke="#e4d6c0" strokeWidth={3} />
        ))}
        <circle cx={10} cy={-160} r={20} fill={P.maroon} />
        {/* chocolate drizzle */}
        <path d="M-110 -10 Q-60 -60 -10 -20 T90 -40 T120 10" fill="none" stroke="#4a2614" strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* straw */}
      <g opacity={cream}>
        <path d={`M400 ${200 - 160 * cream} L470 ${70 - 160 * cream + 160}`} stroke={P.cream} strokeWidth={22} strokeLinecap="round" />
        <path d={`M400 ${200 - 160 * cream} L470 ${70 - 160 * cream + 160}`} stroke={P.maroon} strokeWidth={22} strokeDasharray="14 18" strokeLinecap="butt" />
      </g>
    </svg>
  );
};

export const Brownies: React.FC<{r: number}> = ({r}) => {
  const slab = (i: number) => pt(r, 0.05 + i * 0.12, 0.5 + i * 0.12, ease.out);
  return (
    <svg viewBox="0 0 700 700" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="bt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5130" />
          <stop offset="1" stopColor="#5a301a" />
        </linearGradient>
        <linearGradient id="bs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2614" />
          <stop offset="1" stopColor="#2a1408" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => {
        const p = slab(i);
        const y = 520 - i * 120 - (1 - p) * 260;
        const x = 350 + (i === 1 ? -26 : i === 2 ? 18 : 0);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1) * 4})`} opacity={p}>
            <path d="M-170 -40 L170 -40 L190 60 L-190 60 Z" fill="url(#bs)" />
            <path d="M-190 -40 Q-200 -100 -150 -100 L150 -100 Q200 -100 190 -40 Z" fill="url(#bt)" />
            <path d="M-120 -78 L-70 -66 L-40 -84 M10 -70 L60 -84 L110 -70 M-150 -56 L-100 -50 M80 -54 L150 -60" stroke="rgba(255,210,170,0.22)" strokeWidth={4} fill="none" strokeLinecap="round" />
            {Array.from({length: 7}, (_, k) => (
              <rect key={k} x={-160 + rand(k * 3 + i) * 300} y={-20 + rand(k * 7 + i) * 60} width={18} height={14} rx={4} fill="#4e2a16" opacity={0.8} />
            ))}
          </g>
        );
      })}
      {/* cocoa dust */}
      {Array.from({length: 60}, (_, k) => {
        const y = (rand(k * 1.9) * 700 + r * (60 + rand(k) * 80)) % 700;
        return <circle key={k} cx={rand(k * 4.3) * 700} cy={y - 60} r={1.5 + rand(k * 2.2) * 3} fill="#b07a52" opacity={0.6 * pt(r, 0.2, 0.6)} />;
      })}
    </svg>
  );
};

export const Coffee: React.FC<{r: number}> = ({r}) => {
  const p = pt(r, 0.0, 0.6, ease.out);
  const steam = pt(r, 0.25, 1.0);
  return (
    <svg viewBox="0 0 700 700" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="cof" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#c88a57" />
          <stop offset="0.55" stopColor="#8a5330" />
          <stop offset="0.9" stopColor="#4a2814" />
          <stop offset="1" stopColor="#2a160a" />
        </radialGradient>
      </defs>
      <g transform={`translate(350 400) scale(${lerp(0.7, 1, p)}) rotate(${r * 10})`} opacity={p}>
        <circle r={250} fill="#e9dcc6" />
        <circle r={238} fill="none" stroke="#cdbb9f" strokeWidth={3} />
        <circle r={170} fill={P.cream} />
        <circle r={150} fill="url(#cof)" />
        {/* latte heart */}
        <path d="M0 55 C-120 -10 -70 -95 0 -45 C70 -95 120 -10 0 55 Z" fill="#f1dfc3" opacity={0.92} />
        <path d="M0 50 C-60 10 -40 -50 0 -30" fill="none" stroke="#c88a57" strokeWidth={6} opacity={0.6} />
        {/* handle */}
        <rect x={160} y={-26} width={90} height={52} rx={26} fill={P.cream} />
      </g>
      {/* steam */}
      {[-60, 0, 60].map((dx, i) => {
        const rise = (r * 0.7 + i * 0.33) % 1;
        return (
          <path
            key={i}
            d={`M${350 + dx} 330 C ${330 + dx} 270, ${390 + dx} 230, ${350 + dx} 170 S ${320 + dx} 90, ${360 + dx} 40`}
            fill="none"
            stroke="rgba(255,244,228,0.5)"
            strokeWidth={14}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${0.35 * steam} 1`}
            strokeDashoffset={-rise * 0.8}
            style={{filter: 'blur(6px)'}}
            opacity={steam * (1 - rise * 0.6)}
          />
        );
      })}
    </svg>
  );
};

export const Waffle: React.FC<{r: number}> = ({r}) => {
  const p = pt(r, 0.0, 0.55, ease.out);
  const sc = (i: number) => pt(r, 0.3 + i * 0.12, 0.7 + i * 0.12, ease.out);
  const cells = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) cells.push([i, j]);
  return (
    <svg viewBox="0 0 700 700" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="wf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0b860" />
          <stop offset="1" stopColor="#b9742f" />
        </linearGradient>
        <radialGradient id="sc0" cx="35%" cy="30%"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#e8dcc4" /></radialGradient>
        <radialGradient id="sc1" cx="35%" cy="30%"><stop offset="0" stopColor="#8a5232" /><stop offset="1" stopColor="#4a2614" /></radialGradient>
        <radialGradient id="sc2" cx="35%" cy="30%"><stop offset="0" stopColor="#c6dc8e" /><stop offset="1" stopColor="#86a64e" /></radialGradient>
      </defs>
      <g transform={`translate(350 420) rotate(${lerp(-25, -8, p) + r * 3}) scale(${lerp(0.75, 1, p)})`} opacity={p}>
        <rect x={-230} y={-230} width={460} height={460} rx={46} fill="url(#wf)" />
        {cells.map(([i, j]) => (
          <rect key={`${i}${j}`} x={-205 + i * 84} y={-205 + j * 84} width={66} height={66} rx={10} fill="#b06b2a" stroke="#8f521d" strokeWidth={3} />
        ))}
        <rect x={-230} y={-230} width={460} height={460} rx={46} fill="none" stroke="#f7cf86" strokeWidth={6} opacity={0.6} />
      </g>
      {[[-95, 300, 0], [95, 300, 1], [0, 215, 2]].map(([x, y, k]) => {
        const s = sc(k);
        return (
          <g key={k} transform={`translate(${350 + x} ${y + (1 - s) * -160}) scale(${s})`} opacity={s}>
            <circle r={98} fill={`url(#sc${k})`} />
            <path d="M-96 18 Q-70 52 -40 26 Q-14 58 16 28 Q46 58 72 24 Q90 44 96 18" fill={k === 0 ? '#e8dcc4' : k === 1 ? '#4a2614' : '#86a64e'} />
          </g>
        );
      })}
      <path d="M190 260 Q260 200 330 250 T470 230 T540 280" fill="none" stroke="#3b1d0d" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${pt(r, 0.7, 1.1)} 1`} />
    </svg>
  );
};

/** Energetic type-only treatment for snacks. */
export const Snacks: React.FC<{r: number; W: number; u: number}> = ({r, W, u}) => {
  const rows = 7;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {Array.from({length: rows}, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        const x = dir * (r * 520 * u) - 400 * u + (i % 3) * 120 * u;
        const o = pt(r, i * 0.04, 0.3 + i * 0.04);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: `${8 + i * 13}%`,
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 150 * u,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: 'transparent',
              WebkitTextStroke: `2px rgba(226,180,107,${i === 3 ? 0 : 0.35})`,
              opacity: o,
              width: W * 4,
            }}
          >
            SNACKS · SNACKS · SNACKS · SNACKS · SNACKS
          </div>
        );
      })}
    </div>
  );
};

/** Coffee beans tumbling across the coffee frame. */
export const BeanOrbit: React.FC<{r: number; cx: number; cy: number; R: number; u: number}> = ({r, cx, cy, R, u}) => (
  <>
    {Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + r * 0.9;
      const z = Math.sin(a);
      return <Bean key={i} x={cx + Math.cos(a) * R} y={cy + z * R * 0.35} s={(0.9 + z * 0.3) * u * 1.3} rot={a * 80} blur={z < -0.3 ? 3 : 0} o={pt(r, 0.1 + i * 0.05, 0.4 + i * 0.05)} />;
    })}
  </>
);
