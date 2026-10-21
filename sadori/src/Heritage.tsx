import React from 'react';
import {ease, pt} from './anim';
import {C} from './Type';
import {SANS, SERIF} from './fonts';

/** A path that draws itself (p: 0→1) and can be erased (e: 0→1, erases from the start). */
const D: React.FC<{d: string; p: number; e?: number; w?: number; o?: number}> = ({d, p, e = 0, w = 2.2, o = 1}) => {
  if (p <= 0 || e >= 1) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={C.gold}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${p * (1 - e)} 2`}
      strokeDashoffset={-e * p}
      opacity={o}
    />
  );
};

/** Small eyewear glyph for the display shelves. */
const glyph = (x: number, y: number, s = 1) => {
  const r = 9 * s;
  return `M${x - 2 * r - 2 * s} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 M${x - 2 * s} ${y - 2 * s} q${2 * s} ${-4 * s} ${4 * s} 0 M${x + 2 * s} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
};

/**
 * Akola, 2006 → the studio, 2025. Fine architectural line drawing in champagne gold:
 * a small shopfront draws in, erases, and the contemporary studio draws in its place.
 */
export const Heritage: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const r = t - t0; // 0..5
  const shopIn = (a: number, b: number) => pt(r, a, b, ease.inOut);
  const shopOut = pt(r, 1.85, 2.45, ease.inOut);
  const st = (a: number, b: number) => pt(r, a, b, ease.inOut);
  const fadeAll = 1 - pt(r, 4.6, 5.0, ease.in);

  const year = Math.round(2006 + 19 * pt(r, 2.05, 3.3, ease.inOut));
  const yearIn = pt(r, 0.15, 0.9);

  const shutter = Array.from({length: 9}, (_, i) => `M352 ${972 + i * 14} H588`).join(' ');
  const scallops = Array.from({length: 10}, (_, i) => `M${352 + i * 42} 950 L${360 + i * 42} 890`).join(' ');
  const shelves = [780, 868, 956];
  const shelfL = shelves.map((y) => `M168 ${y} H328`).join(' ') + ' ' + shelves.map((y) => `M752 ${y} H912`).join(' ');
  const glyphs = shelves
    .flatMap((y) => [glyph(205, y - 16, 0.8), glyph(290, y - 16, 0.8), glyph(790, y - 16, 0.8), glyph(875, y - 16, 0.8)])
    .join(' ');

  return (
    <div style={{position: 'absolute', inset: 0, opacity: fadeAll}}>
      {/* soft warm floor glow */}
      <div style={{position: 'absolute', left: 90, top: 760, width: 900, height: 520, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(217,188,138,0.10), transparent)'}} />
      <div style={{position: 'absolute', top: 430, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontWeight: 300, fontSize: 118, letterSpacing: '0.08em', color: C.ivory, opacity: yearIn, filter: `blur(${(1 - yearIn) * 8}px)`}}>
        {year}
      </div>
      <div style={{position: 'absolute', top: 582, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 24, letterSpacing: '0.55em', color: C.gold, opacity: yearIn}}>
        AKOLA · MAHARASHTRA
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* ground */}
        <D d="M110 1100 H970" p={pt(r, 0.0, 0.9, ease.inOut)} w={1.6} o={0.8} />
        {/* --- 2006: the first shop --- */}
        <D d="M320 1100 V800 H760 V1100" p={shopIn(0.1, 0.9)} e={shopOut} />
        <D d="M300 800 H780 V772 H300 Z" p={shopIn(0.25, 1.0)} e={shopOut} />
        <D d="M352 818 H728 V874 H352 Z" p={shopIn(0.4, 1.1)} e={shopOut} w={1.6} />
        <D d="M332 890 H748 L728 950 H352 Z" p={shopIn(0.5, 1.2)} e={shopOut} />
        <D d={scallops} p={shopIn(0.65, 1.35)} e={shopOut} w={1.2} o={0.7} />
        <D d="M350 960 H590 V1100 M350 960 V1100" p={shopIn(0.7, 1.35)} e={shopOut} w={1.6} />
        <D d={shutter} p={shopIn(0.8, 1.5)} e={shopOut} w={1} o={0.55} />
        <D d="M614 966 H732 V1062 H614 Z" p={shopIn(0.8, 1.45)} e={shopOut} w={1.6} />
        <D d={glyph(673, 1014, 1.15)} p={shopIn(1.0, 1.6)} e={shopOut} w={1.4} />
        {/* --- 2025: the studio --- */}
        <D d="M130 640 H950" p={st(2.2, 3.0)} w={2.2} />
        <D d="M150 1100 V640 M930 640 V1100" p={st(2.25, 3.0)} />
        <D d="M150 702 H930 M166 656 H914" p={st(2.4, 3.2)} w={1.4} o={0.8} />
        <D d="M345 702 V1100 M540 702 V1100 M735 702 V1100" p={st(2.5, 3.3)} w={1.4} />
        <D d="M590 820 H685 V1100 M590 820 V1100 M672 940 V990" p={st(2.7, 3.45)} w={1.4} />
        <D d={shelfL} p={st(2.8, 3.6)} w={1.4} />
        <D d={glyphs} p={st(3.0, 3.9)} w={1.2} />
        <D d="M405 702 V762 M480 702 V788 M385 772 q20 -22 40 0 M460 798 q20 -22 40 0" p={st(3.1, 3.8)} w={1.3} />
        <D d="M372 1010 H515 M385 1010 V1100 M502 1010 V1100" p={st(3.2, 3.9)} w={1.4} />
        <D d="M150 1100 L110 1140 M930 1100 L970 1140 M110 1140 H970" p={st(3.3, 4.0)} w={1} o={0.5} />
      </svg>
    </div>
  );
};
