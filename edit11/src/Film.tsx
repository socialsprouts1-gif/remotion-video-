import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine: "marketing alone is not enough, you need an automation system". Neuraxine palette: black, silver, lime
// (from the real NX logo), alert red for the problem beats, WhatsApp green only on WhatsApp UI.
const C = {
  bg: '#060607',
  card: '#121214',
  lime: '#C8FF3E',
  lime2: '#9BE21E',
  cream: '#F3F1EC',
  ink: '#0A0A0A',
  dim: 'rgba(243,241,236,0.6)',
  line: 'rgba(200,255,62,0.28)',
  red: '#FF453A',
  wa: '#25D366',
  waDark: '#0B141A',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const LIME_GRAD = 'linear-gradient(180deg, #F0FFB0 0%, #C8FF3E 45%, #8FD61A 100%)';
const RED_GRAD = 'linear-gradient(180deg, #FF8A80 0%, #FF453A 50%, #C9160E 100%)';
const SILVER_GRAD = 'linear-gradient(180deg, #FFFFFF 0%, #D9D9DE 50%, #9A9AA2 100%)';
const limeText: React.CSSProperties = {background: LIME_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const redText: React.CSSProperties = {background: RED_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const silverText: React.CSSProperties = {background: SILVER_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 280, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.25) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (w: string) => w.replace(/["“”]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => ap(t, a, fi) * (1 - pt(t, b - fo, b, ease.in));

// ---------------------------------------------------------------- where the speaker's video sits
type Rect = {x: number; y: number; w: number; h: number; r: number; o: number; z: number};
const RECTS = {
  intro: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 0, z: 1.04},
  full: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.04},
  close: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.2},
  frame: {x: 120, y: 760, w: 840, h: 980, r: 46, o: 1, z: 1.05},
  split: {x: 70, y: 1040, w: 940, h: 740, r: 42, o: 1, z: 1.12},
  gone: {x: 390, y: 1560, w: 300, h: 300, r: 150, o: 0, z: 1.1},
};
type Mode = keyof typeof RECTS;
const T_OUT = W(13) - 0.1;
const LAYOUT: {at: number; m: Mode}[] = [
  {at: 0, m: 'intro'}, // cut-out over a live lime background
  {at: T_OUT, m: 'split'}, // Instagram ads / content / new customers
  {at: W(34) - 0.1, m: 'close'}, // "Lekin ek important cheez miss…"
  {at: W(42) - 0.1, m: 'split'}, // the WhatsApp inbox nobody answers
  {at: W(62) - 0.1, m: 'gone'}, // potential customers lost
  {at: W(72) - 0.1, m: 'split'}, // marketing + automation
  {at: W(83) - 0.1, m: 'split'}, // AI agent flow (same layout, new graphic)
  {at: W(102) - 0.1, m: 'gone'}, // getting = marketing, converting = automation
  {at: W(116) - 0.1, m: 'frame'}, // DM "AUTOMATE"
  {at: W(132) - 0.1, m: 'frame'}, // follow Neuraxine
];
const modeAt = (t: number) => LAYOUT.reduce((n, l, i) => (t >= l.at ? i : n), 0);
const rectAt = (t: number): Rect & {k: number} => {
  const i = modeAt(t);
  const cur = RECTS[LAYOUT[i].m];
  const prev = i ? RECTS[LAYOUT[i - 1].m] : cur;
  const k = i ? m1(sp(t, LAYOUT[i].at, 170, 22)) : 1;
  const L = (a: number, b: number) => lerp(a, b, k);
  return {x: L(prev.x, cur.x), y: L(prev.y, cur.y), w: L(prev.w, cur.w), h: L(prev.h, cur.h), r: L(prev.r, cur.r), o: L(prev.o, cur.o), z: L(prev.z, cur.z), k};
};
const modeNow = (t: number): Mode => LAYOUT[modeAt(t)].m;

const Speaker: React.FC<{t: number}> = ({t}) => {
  const R = rectAt(t);
  const framed = R.r > 2;
  const drift = 0.012 * Math.sin(t * 0.5);
  return (
    <div style={{position: 'absolute', left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: R.r, overflow: 'hidden', opacity: R.o, boxShadow: framed ? '0 40px 90px rgba(0,0,0,0.6)' : 'none', background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${R.z + drift})`, transformOrigin: '50% 30%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 44%', filter: 'contrast(1.1) saturate(0.92) brightness(0.98) hue-rotate(-8deg)'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 60%, rgba(0,0,0,0.65))'}} />
    </div>
  );
};

const Brackets: React.FC<{t: number}> = ({t}) => {
  const R = rectAt(t);
  const v = m1((R.r - 8) / 30) * R.o;
  if (v <= 0.01) return null;
  const L = 90, g = 22, th = 7;
  const corner = (x: number, y: number, rot: number, i: number) => (
    <div key={i} style={{position: 'absolute', left: x, top: y, width: L, height: L, transform: `rotate(${rot}deg)`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: L, height: th, background: LIME_GRAD, borderRadius: 4}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: th, height: L, background: LIME_GRAD, borderRadius: 4}} />
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v, pointerEvents: 'none', filter: 'drop-shadow(0 0 12px rgba(200,255,62,0.45))'}}>
      {corner(R.x - g, R.y - g, 0, 0)}
      {corner(R.x + R.w + g, R.y - g, 90, 1)}
      {corner(R.x + R.w + g, R.y + R.h + g, 180, 2)}
      {corner(R.x - g, R.y + R.h + g, 270, 3)}
    </div>
  );
};

const Backdrop: React.FC<{t: number; danger?: boolean}> = ({t, danger}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 36%, ${danger ? '#3A0806' : '#1E2A08'} 0%, #101011 52%, ${C.bg} 100%)`}}>
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${danger ? 'rgba(255,69,58,0.22)' : 'rgba(200,255,62,0.16)'} 1.5px, transparent 1.6px)`, backgroundSize: '36px 36px', backgroundPosition: `0 ${t * 12}px`, maskImage: 'radial-gradient(ellipse 70% 55% at 50% 38%, #000 25%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 38%, #000 25%, transparent 80%)'}} />
  </AbsoluteFill>
);

const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.55))', ...style}} />;

const Kicker: React.FC<{t: number; at: number; children: React.ReactNode; danger?: boolean; top?: number}> = ({t, at, children, danger, top = 150}) => {
  const p = ap(t, at, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.28em', color: danger ? C.red : C.lime, border: `1.5px solid ${danger ? 'rgba(255,69,58,0.45)' : C.line}`, borderRadius: 999, padding: '12px 28px', background: 'rgba(6,6,7,0.65)'}}>
        <span style={{width: 12, height: 12, borderRadius: 12, background: danger ? C.red : C.lime, boxShadow: `0 0 ${10 + 8 * Math.sin(t * 9)}px ${danger ? C.red : C.lime}`}} />
        {children}
      </div>
    </div>
  );
};

const InstaMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
      <rect x={2.5} y={2.5} width={19} height={19} rx={5.5} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={12} cy={12} r={4.4} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={17.6} cy={6.4} r={1.3} fill="#fff" />
    </svg>
  </div>
);

// ---------------------------------------------------------------- captions: under the chin, centred, active word zooms
const LIME_W = new Set(['business', 'marketing', 'automation', 'ai', 'agents', 'whatsapp', 'appointments', 'leads', 'customers', 'customer', 'automate', 'neuraxine', 'airelated', 'strong', 'system', 'converting', 'managing', 'instagram', 'content', 'enquiry', 'enquiries', 'automatically', 'guide']);
const RED_W = new Set(['miss', 'missed', 'lose', 'late', 'nahi', 'no', 'followup']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (/[.,?!]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  const m = modeNow(t);
  if (m === 'gone' || m === 'intro') return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const R = rectAt(t);
  const len = c.words.map((w) => w.w).join(' ').length;
  const fit = Math.max(0.66, Math.min(1, 16 / Math.max(1, len)));
  const y = m === 'full' || m === 'close' ? 1330 : R.y + R.h - 160;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', columnGap: 32}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const on = i === cur;
        const seen = i <= cur;
        const red = RED_W.has(k);
        const lime = LIME_W.has(k);
        const wp = sp(t, w.s - 0.04, 520, 18);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 84 * fit,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              display: 'inline-block',
              ...(seen && (red ? redText : lime ? limeText : {color: '#fff'})),
              ...(!seen ? {color: 'rgba(255,255,255,0.4)'} : {}),
              transform: `scale(${on ? lerp(1.3, 1.06, m1(wp)) : 1})`,
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.9))',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- intro: cut-out, live background, fast kinetic words
const CUT_FRAMES = 125;
const BEAT_S = 60 / 118;
const PHRASES = [
  {a: 0, b: 6, big: [0]}, // 2026 mein business grow karne ke liye
  {a: 7, b: 12, big: [8], red: [10, 11, 12]}, // sirf MARKETING karna enough nahi hai
];
const Marquee: React.FC<{t: number; y: number; dir: number; text: string; o: number}> = ({t, y, dir, text, o}) => {
  const x = ((t * 280 * dir) % 1400) - (dir > 0 ? 1400 : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '3px rgba(200,255,62,0.45)', opacity: o}}>
      {Array.from({length: 4}, () => text).join('  ')}
    </div>
  );
};
const PEOPLE = ['man.png', 'woman.png', 'person.png', 'man_beard.png', 'woman_curly_hair.png'];
const ORBIT = ['whatsapp-icon.svg', 'robot.png', 'calendar.png', 'meta-icon.svg', 'chart_increasing.png', 'speech_balloon.png'];
const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > T_OUT + 0.45) return null;
  const out = pt(t, T_OUT - 0.05, T_OUT + 0.4, ease.inOut);
  const pulse = Math.exp(-(((t % BEAT_S) / BEAT_S) * 6));
  const pi = t >= W(7) - 0.08 ? 1 : 0;
  const P = PHRASES[pi];
  const at = pi ? W(7) - 0.08 : 0;
  const zooms = [{at: 0, z: 1}, {at: W(2) - 0.05, z: 1.1}, {at: W(7) - 0.06, z: 1.02}, {at: W(8) - 0.05, z: 1.16}, {at: W(10) - 0.05, z: 1.28}];
  const zi = zooms.reduce((n, z, i) => (t >= z.at ? i : n), 0);
  const zoom = lerp(zi ? zooms[zi - 1].z : 1, zooms[zi].z, zi ? m1(sp(t, zooms[zi].at, 420, 26)) : 1) * lerp(1, 0.55, out);
  const enter = sp(t, 0, 300, 20);
  const hits = [W(0), W(8), W(10)];
  const hit = hits.reduce((m, h) => Math.max(m, t >= h - 0.06 && t < h + 0.22 ? 1 - (t - h + 0.06) / 0.28 : 0), 0);
  const shx = Math.sin(t * 95) * 12 * hit, shy = Math.cos(t * 80) * 8 * hit;
  const fi = Math.min(CUT_FRAMES - 1, Math.floor(t * FPS));
  const pin = ap(t, at, 0.18);
  const red = t >= W(10) - 0.06;
  const strike = pt(t, W(11) - 0.05, W(12) + 0.1, ease.inOut);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translate(${shx}px, ${shy}px)`}}>
      <AbsoluteFill style={{background: C.bg, transform: 'scale(1.1)'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 50%, ${red ? `rgba(255,60,40,${0.34 + 0.18 * pulse})` : `rgba(170,255,40,${0.3 + 0.16 * pulse})`} 0%, ${red ? '#260605' : '#142004'} 45%, ${C.bg} 100%)`}} />
      <AbsoluteFill style={{background: `repeating-conic-gradient(from ${t * 32}deg at 50% 58%, ${red ? 'rgba(255,90,70,0.10)' : 'rgba(200,255,62,0.10)'} 0deg 6deg, transparent 6deg 16deg)`}} />
      <Marquee t={t} y={330} dir={-1} text="2026 • MARKETING ≠ ENOUGH •" o={0.5} />
      <Marquee t={t + 2} y={560} dir={1} text="AI AGENTS • AUTOMATION •" o={0.36} />
      <Marquee t={t + 4} y={790} dir={-1} text="NEURAXINE • WHATSAPP • LEADS •" o={0.26} />
      {ORBIT.map((n, i) => {
        const ang = (i / ORBIT.length) * Math.PI * 2 + t * 1.1;
        const x = 540 + Math.cos(ang) * 460, y = 960 + Math.sin(ang) * 250;
        return <Img key={n} src={icon(n)} style={{position: 'absolute', left: x - 65, top: y - 65, width: 130, height: 130, opacity: 0.55, filter: 'blur(1.5px) drop-shadow(0 20px 30px rgba(0,0,0,0.6))', transform: `rotate(${Math.sin(t * 2 + i) * 12}deg)`}} />;
      })}
      {Array.from({length: 30}, (_, i) => {
        const x = rand(i * 7.7) * 1080;
        const y = 1920 - ((rand(i * 3.3) * 1920 + t * (180 + rand(i) * 280)) % 2000);
        const r = 4 + rand(i * 2.9) * 7;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: red ? '#FF8A80' : C.lime, boxShadow: `0 0 ${r * 3}px ${red ? C.red : C.lime}`, opacity: 0.65}} />;
      })}
      {/* the speaker, background removed */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '50% 100%', transform: `translateY(${360 + (1 - m1(enter)) * 300}px) scale(${zoom * 1.0})`}}>
        <Img src={staticFile(`clips/cut/f${String(fi).padStart(4, '0')}.webp`)} style={{width: 1080, height: 1920, filter: `contrast(1.08) saturate(0.95) drop-shadow(0 0 26px ${red ? 'rgba(255,60,40,0.55)' : 'rgba(200,255,62,0.45)'}) drop-shadow(0 30px 50px rgba(0,0,0,0.6))`}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: `linear-gradient(180deg, transparent, ${C.bg} 80%)`}} />
      {/* kinetic words: exactly what he says */}
      <div key={pi} style={{position: 'absolute', left: 50, right: 50, top: 130, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 22, opacity: pin, transform: `translateX(${(1 - pin) * 120}px)`, filter: pin < 1 ? `blur(${(1 - pin) * 10}px)` : undefined}}>
        {WORDS.slice(P.a, P.b + 1).map((w) => {
          const big = P.big.includes(w.i);
          const isRed = (P.red ?? []).includes(w.i);
          const s2 = sp(t, w.s - 0.06, 460, 17);
          if (s2 <= 0) return null;
          const year = w.i === 0;
          return (
            <span key={w.i} style={{position: 'relative', display: 'inline-block', fontFamily: big && !year ? SERIF : SANS, fontStyle: big && !year ? 'italic' : 'normal', fontWeight: big && !year ? 400 : 900, fontSize: year ? 230 : big ? 170 : isRed ? 110 : 84, lineHeight: big || year ? 1.0 : 1.15, letterSpacing: year ? '-0.06em' : big ? '0' : '-0.03em', textTransform: big ? 'none' : 'uppercase', paddingRight: big && !year ? '0.2em' : 0, ...(year ? silverText : big ? limeText : isRed ? redText : {color: C.cream}), transform: `scale(${lerp(big || year ? 2.2 : 1.6, 1, m1(s2))})`, opacity: m1(s2 * 3), filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.75))'}}>
              {clean(w.w).replace(/[,.]/g, '')}
            </span>
          );
        })}
      </div>
      {pi === 1 && (
        <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 150, opacity: strike > 0.01 ? 1 : 0}}>
          <path d="M 150 400 L 930 300" stroke={C.red} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${strike * 900} 2000`} />
        </svg>
      )}
      {pi === 1 && <Ico n="cross_mark.png" size={150} style={{position: 'absolute', left: 860, top: 640, transform: `scale(${m1(sp(t, W(11) - 0.05, 420, 12))}) rotate(-10deg)`}} />}
      {pi === 0 && <Ico n="rocket.png" size={150} style={{position: 'absolute', left: 840, top: 620, transform: `scale(${m1(sp(t, W(3) - 0.05, 420, 12))}) rotate(${Math.sin(t * 4) * 6}deg)`}} />}
      <AbsoluteFill style={{background: red ? '#FF8A80' : '#E8FFB0', opacity: (1 - pt(t, at, at + 0.14)) * (pi ? 0.35 : 0), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- graphic layers (keyed to his words)
/** A: every business runs Instagram ads, makes content, chases new customers. */
const Marketing: React.FC<{t: number}> = ({t}) => {
  const a = T_OUT, b = W(34) - 0.1;
  if (t < a || t > b + 0.3) return null;
  const v = win(t, a, b + 0.3, 0.2, 0.3);
  const ad = sp(t, W(16) - 0.08, 300, 18);
  const posts = [0, 1, 2, 3, 4, 5];
  const cust = Math.max(0, Math.min(8, Math.floor((t - W(26) + 0.1) / 0.12)));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Kicker t={t} at={a}>AAJ HAR BUSINESS</Kicker>
      {/* sponsored Instagram ad */}
      <div style={{position: 'absolute', left: 90, top: 250, width: 520, borderRadius: 34, background: '#fff', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transform: `translateX(${(1 - m1(ad)) * -700}px) rotate(${lerp(-10, -3, m1(ad))}deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px'}}>
          <InstaMark size={52} />
          <div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#111'}}>your.business</div>
            <div style={{fontFamily: SANS, fontSize: 20, color: '#888'}}>Sponsored</div>
          </div>
        </div>
        <div style={{height: 300, background: 'linear-gradient(135deg, #2a2a2e, #0e0e10)', display: 'grid', placeItems: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 60, letterSpacing: '-0.03em', ...limeText}}>FLAT 30% OFF</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', background: '#F2F2F2'}}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#111'}}>Shop now</span>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 26, color: '#0095F6'}}>›</span>
        </div>
      </div>
      <Img src={icon('meta-icon.svg')} style={{position: 'absolute', left: 540, top: 210, width: 120, height: 120, transform: `scale(${m1(sp(t, W(17) - 0.06, 420, 12))})`, filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.6))'}} />
      {/* content grid */}
      <div style={{position: 'absolute', left: 650, top: 380, width: 340, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
        {posts.map((i) => {
          const s = sp(t, W(21) - 0.08 + i * 0.06, 400, 16);
          return (
            <div key={i} style={{height: 140, borderRadius: 16, background: `linear-gradient(${140 + i * 30}deg, #26262a, #3a3a40)`, border: '1px solid rgba(255,255,255,0.08)', transform: `scale(${m1(s)})`, display: 'grid', placeItems: 'center'}}>
              <svg width={40} height={40} viewBox="0 0 24 24" style={{opacity: 0.7}}>
                <path d="M8 5v14l11-7z" fill="#fff" />
              </svg>
            </div>
          );
        })}
        <div style={{gridColumn: '1 / span 3', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.cream, marginTop: 6, opacity: ap(t, W(21) - 0.05)}}>content</div>
      </div>
      {/* new customers streaming in */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 760, display: 'flex', alignItems: 'center', gap: 16, opacity: ap(t, W(26) - 0.1)}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: C.cream, whiteSpace: 'nowrap'}}>
          Naye <span style={limeText}>customers</span>
        </div>
        <div style={{display: 'flex', gap: 6}}>
          {Array.from({length: 8}, (_, i) => (
            <Ico key={i} n={PEOPLE[i % 5]} size={66} style={{opacity: i < cust ? 1 : 0, transform: `scale(${i < cust ? 1 : 0.4})`}} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Over the close-up: something is missing. Icons only. */
const Missing: React.FC<{t: number}> = ({t}) => {
  const a = W(34) - 0.1, b = W(42) - 0.1;
  if (t < a || t > b) return null;
  const v = 1 - pt(t, b - 0.18, b, ease.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Ico n="puzzle_piece.png" size={210} style={{position: 'absolute', left: 790, top: 360, transform: `scale(${m1(sp(t, W(37) - 0.06, 380, 12))}) rotate(${12 + Math.sin(t * 3) * 6}deg)`}} />
      <Ico n="red_question_mark.png" size={180} style={{position: 'absolute', left: 90, top: 420, transform: `scale(${m1(sp(t, W(38) - 0.06, 380, 12))}) rotate(-14deg)`}} />
    </div>
  );
};

/** B: the WhatsApp inbox: enquiries arrive, nobody answers on time. */
const Inbox: React.FC<{t: number}> = ({t}) => {
  const a = W(42) - 0.1, b = W(62) - 0.1;
  if (t < a || t > b + 0.3) return null;
  const v = win(t, a, b + 0.3, 0.2, 0.3);
  const ph = sp(t, a, 220, 20);
  const msgs = [
    {at: W(43) - 0.05, txt: 'Hi, price kya hai? 🙏', time: '7:02 PM'},
    {at: W(45) - 0.05, txt: 'Available hai kya?', time: '7:03 PM'},
    {at: W(47), txt: 'Hello?? Koi reply karega?', time: '7:15 PM'},
  ];
  const late = sp(t, W(55) - 0.06, 380, 16);
  const unread = Math.round(lerp(3, 27, pt(t, W(57) - 0.05, W(59) + 0.2, ease.out)));
  const nofu = sp(t, W(60) - 0.06, 480, 18);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Kicker t={t} at={a} danger>
        ENQUIRY AAYI, REPLY NAHI GAYA
      </Kicker>
      <div style={{position: 'absolute', left: 170, top: 230, width: 740, height: 720, borderRadius: 54, background: '#000', padding: 12, boxSizing: 'border-box', boxShadow: '0 50px 100px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', transform: `translateY(${(1 - m1(ph)) * 800}px)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 44, background: C.waDark, overflow: 'hidden', position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '26px 26px 18px', background: '#1F2C34'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 56, height: 56}} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#E9EDEF'}}>Customer enquiries</div>
              <div style={{fontFamily: SANS, fontSize: 22, color: '#8696A0'}}>Business inbox</div>
            </div>
            <div style={{minWidth: 64, height: 54, borderRadius: 30, background: C.wa, display: 'grid', placeItems: 'center', padding: '0 14px', fontFamily: SANS, fontWeight: 900, fontSize: 30, color: '#05210f', transform: `scale(${t > W(57) - 0.05 ? 1 + 0.12 * Math.abs(Math.sin(t * 10)) * (1 - pt(t, W(59), W(59) + 0.6)) : 1})`}}>{unread}</div>
          </div>
          <div style={{padding: '22px 24px'}}>
            {msgs.map((m, i) => {
              const p = sp(t, m.at, 380, 20);
              return (
                <div key={i} style={{display: 'flex', marginBottom: 16, opacity: m1(p * 2), transform: `scale(${lerp(0.6, 1, m1(p))})`, transformOrigin: '0 50%'}}>
                  <div style={{maxWidth: 520, background: '#202C33', color: '#E9EDEF', fontFamily: SANS, fontSize: 32, lineHeight: 1.3, padding: '16px 22px', borderRadius: 22, borderTopLeftRadius: 6}}>
                    {m.txt}
                    <div style={{fontSize: 18, color: '#8696A0', textAlign: 'right', marginTop: 4}}>{m.time}</div>
                  </div>
                </div>
              );
            })}
            {/* the late reply */}
            <div style={{display: 'flex', justifyContent: 'flex-end', opacity: m1(late * 2), transform: `scale(${lerp(0.6, 1, m1(late))})`, transformOrigin: '100% 50%'}}>
              <div style={{background: '#005C4B', color: '#E9EDEF', fontFamily: SANS, fontSize: 30, padding: '14px 20px', borderRadius: 22, borderTopRightRadius: 6}}>
                Sorry, abhi dekha 😅
                <div style={{fontSize: 18, color: '#FF8A80', textAlign: 'right', marginTop: 4, fontWeight: 800}}>Next day · 11:40 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 640, display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${m1(late)}) rotate(-8deg)`}}>
        <Ico n="hourglass_not_done.png" size={130} />
      </div>
      {/* NO FOLLOW-UP stamp */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `rotate(-9deg) scale(${lerp(2.4, 1, m1(nofu))})`, opacity: m1(nofu * 3), border: `12px solid ${C.red}`, borderRadius: 26, padding: '6px 34px', fontFamily: SANS, fontWeight: 900, fontSize: 110, letterSpacing: '0.02em', color: C.red, background: 'rgba(20,0,0,0.6)', boxShadow: '0 0 70px rgba(255,69,58,0.45)', whiteSpace: 'nowrap'}}>NO FOLLOW-UP</div>
      </div>
    </div>
  );
};

/** C: potential customers walk away (speaker off). */
const Lost: React.FC<{t: number}> = ({t}) => {
  const a = W(62) - 0.1, b = W(72) - 0.1;
  if (t < a || t > b + 0.25) return null;
  const v = win(t, a, b + 0.25, 0.2, 0.3);
  const N = 24;
  const gone = (i: number) => pt(t, W(68) - 0.1 + rand(i * 3.7) * 0.9, W(68) + 0.4 + rand(i * 3.7) * 0.9, ease.in);
  const lostN = Array.from({length: N}, (_, i) => gone(i)).filter((g) => g > 0.5).length;
  const hit = sp(t, W(68) - 0.08, 480, 16);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Backdrop t={t} danger={t > W(68) - 0.1} />
      <Kicker t={t} at={a} danger={t > W(68) - 0.1}>
        YAHI PE
      </Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.cream, opacity: ap(t, W(64) - 0.05)}}>business apne</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, ...limeText, lineHeight: 1, opacity: ap(t, W(66) - 0.05), transform: `scale(${lerp(1.25, 1, ap(t, W(66) - 0.05, 0.4))})`}}>potential customers</div>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 640, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 26}}>
        {Array.from({length: N}, (_, i) => {
          const g = gone(i);
          const s = sp(t, a + 0.15 + i * 0.025, 380, 16);
          return (
            <div key={i} style={{display: 'grid', placeItems: 'center', opacity: m1(s) * (1 - g), transform: `translate(${g * (rand(i) - 0.5) * 300}px, ${g * 260}px) scale(${m1(s)}) rotate(${g * (rand(i * 2) - 0.5) * 80}deg)`, filter: g > 0.05 ? `grayscale(${m1(g * 3)}) brightness(${1 - g * 0.4})` : undefined}}>
              <Ico n={PEOPLE[i % 5]} size={104} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', transform: `scale(${lerp(2, 1, m1(hit))})`, opacity: m1(hit * 3)}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: '-0.05em', ...redText, filter: 'drop-shadow(0 12px 40px rgba(255,69,58,0.45))'}}>LOSE</span>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.dim, marginTop: -10, fontVariantNumeric: 'tabular-nums'}}>
          {lostN > 0 ? <><span style={{color: C.red}}>−{lostN}</span> leads lost</> : '\u00a0'}
        </div>
      </div>
    </div>
  );
};

/** D: marketing + a strong automation system. */
const Equation: React.FC<{t: number}> = ({t}) => {
  const a = W(72) - 0.1, b = W(83) - 0.1;
  if (t < a || t > b + 0.2) return null;
  const v = win(t, a, b + 0.2, 0.2, 0.25);
  const m = sp(t, W(73) - 0.08, 360, 16);
  const plus = sp(t, W(75) - 0.08, 420, 14);
  const au = sp(t, W(78) - 0.08, 360, 14);
  const must = ap(t, W(81) - 0.05, 0.4);
  const card = (on: number, lime: boolean, title: string, icons: string[]) => (
    <div style={{width: 380, padding: '30px 26px', borderRadius: 34, background: lime ? 'rgba(200,255,62,0.10)' : 'rgba(255,255,255,0.05)', border: `2px solid ${lime ? C.lime : 'rgba(255,255,255,0.15)'}`, boxShadow: lime ? '0 0 60px rgba(200,255,62,0.25)' : 'none', transform: `scale(${lerp(0.6, 1, m1(on))})`, opacity: m1(on * 2), textAlign: 'center'}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 16}}>
        {icons.map((n) => (n === 'insta' ? <InstaMark key={n} size={92} /> : <Img key={n} src={icon(n)} style={{width: 92, height: 92, objectFit: 'contain'}} />))}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, letterSpacing: '-0.03em', ...(lime ? limeText : {color: C.cream})}}>{title}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Kicker t={t} at={a}>ISLIYE</Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24}}>
        {card(m, false, 'Marketing', ['insta', 'meta-icon.svg'])}
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 120, color: C.lime, transform: `scale(${m1(plus)}) rotate(${(1 - m1(plus)) * 90}deg)`}}>+</div>
        {card(au, true, 'Automation', ['robot.png', 'gear.png'])}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', opacity: must}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...limeText}}>zaroori hai</span>
        <div style={{margin: '0 auto', width: 460 * must, height: 8, borderRadius: 4, background: LIME_GRAD}} />
      </div>
    </div>
  );
};

/** E: the AI agent system, one step per spoken item. */
const STEPS = [
  {at: 84, n: 'robot.png', t1: 'AI agents', t2: 'har enquiry handle karein'},
  {at: 90, n: 'whatsapp-icon.svg', t1: 'WhatsApp follow-up', t2: 'automatically jaaye'},
  {at: 94, n: 'google-calendar.svg', t1: 'Appointments', t2: 'khud book ho'},
  {at: 98, n: 'bar_chart.png', t1: 'Leads', t2: 'properly managed'},
];
const Flow: React.FC<{t: number}> = ({t}) => {
  const a = W(83) - 0.1, b = W(102) - 0.1;
  if (t < a || t > b + 0.3) return null;
  const v = win(t, a, b + 0.3, 0.2, 0.3);
  const cur = STEPS.reduce((n, s, i) => (t >= W(s.at) - 0.1 ? i : n), -1);
  const line = cur < 0 ? 0 : Math.min(1, (cur + pt(t, W(STEPS[cur].at) - 0.1, W(STEPS[cur].at) + 0.4)) / STEPS.length);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Kicker t={t} at={a}>AI AUTOMATION SYSTEM</Kicker>
      <div style={{position: 'absolute', left: 150, top: 290, width: 6, height: 640, borderRadius: 3, background: 'rgba(255,255,255,0.1)'}}>
        <div style={{width: 6, height: 640 * line, borderRadius: 3, background: LIME_GRAD, boxShadow: '0 0 20px rgba(200,255,62,0.7)'}} />
      </div>
      {STEPS.map((s, i) => {
        const p = sp(t, W(s.at) - 0.1, 320, 18);
        const on = i === cur;
        const done = i < cur;
        return (
          <div key={i} style={{position: 'absolute', left: 100, right: 80, top: 250 + i * 175, display: 'flex', alignItems: 'center', gap: 30, opacity: p > 0 ? m1(p * 2) : 0.25, transform: `translateX(${(1 - m1(p)) * 140}px)`}}>
            <div style={{width: 110, height: 110, borderRadius: 32, background: on ? 'rgba(200,255,62,0.16)' : '#141416', border: `2px solid ${on || done ? C.lime : 'rgba(255,255,255,0.12)'}`, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: on ? '0 0 40px rgba(200,255,62,0.4)' : 'none'}}>
              <Img src={icon(s.n)} style={{width: 72, height: 72, objectFit: 'contain'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, letterSpacing: '-0.03em', ...(on ? limeText : {color: C.cream})}}>{s.t1}</div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: C.dim}}>{s.t2}</div>
            </div>
            {(done || on) && <Ico n="check_mark_button.png" size={72} style={{transform: `scale(${m1(sp(t, W(s.at) + 0.25, 420, 12))})`}} />}
          </div>
        );
      })}
    </div>
  );
};

/** F: getting customers = marketing, managing + converting = automation (speaker off). */
const Truth: React.FC<{t: number}> = ({t}) => {
  const a = W(102) - 0.1, b = W(116) - 0.1;
  if (t < a || t > b + 0.25) return null;
  const v = win(t, a, b + 0.25, 0.2, 0.3);
  const r1 = sp(t, W(106) - 0.08, 420, 15);
  const r2 = sp(t, W(113) - 0.08, 420, 13);
  const shine = ((t - W(113)) * 0.7) % 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 280}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.cream, opacity: ap(t, W(103) - 0.05), lineHeight: 1}}>Getting customers</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 10, transform: `scale(${lerp(1.6, 1, m1(r1))})`, transformOrigin: '0 50%', opacity: m1(r1 * 3)}}>
          <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 110, color: C.dim}}>=</span>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: '-0.05em', color: C.cream}}>MARKETING</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 700, opacity: ap(t, W(107) - 0.05)}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.cream, lineHeight: 1}}>
          Managing <span style={{color: C.dim}}>&amp;</span> <span style={{opacity: ap(t, W(110) - 0.05)}}>converting</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 10, transform: `scale(${lerp(2, 1, m1(r2))})`, transformOrigin: '0 50%', opacity: m1(r2 * 3)}}>
          <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 110, color: C.lime}}>=</span>
          <span style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: '-0.05em', ...limeText, filter: 'drop-shadow(0 10px 40px rgba(200,255,62,0.4))'}}>
            AUTOMATION
            <span style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine * 100 - 15}%, rgba(255,255,255,0.75) ${shine * 100}%, transparent ${shine * 100 + 15}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>AUTOMATION</span>
          </span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center', gap: 40}}>
        {['robot.png', 'whatsapp-icon.svg', 'google-calendar.svg', 'bar_chart.png'].map((n, i) => (
          <Img key={n} src={icon(n)} style={{width: 120, height: 120, objectFit: 'contain', transform: `scale(${m1(sp(t, W(113) + 0.1 + i * 0.08, 380, 13))}) translateY(${Math.sin(t * 2.4 + i) * 8}px)`, filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.6))'}} />
        ))}
      </div>
    </div>
  );
};

/** G: DM us AUTOMATE -> detailed guide. */
const DM: React.FC<{t: number}> = ({t}) => {
  const a = W(116) - 0.1, b = W(132) - 0.1;
  if (t < a || t > b + 0.2) return null;
  const v = win(t, a, b + 0.2, 0.2, 0.25);
  const typed = 'AUTOMATE'.slice(0, Math.max(0, Math.min(8, Math.floor((t - W(122) + 0.05) / 0.06))));
  const sent = sp(t, W(124) - 0.06, 420, 18);
  const guide = sp(t, W(130) - 0.08, 300, 18);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: ap(t, a)}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, color: C.cream, letterSpacing: '-0.02em'}}>Want to </span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, ...limeText}}>automate?</span>
      </div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 270, borderRadius: 34, background: '#fff', padding: '22px 26px', boxShadow: '0 40px 80px rgba(0,0,0,0.55)', transform: `scale(${lerp(0.7, 1, m1(sp(t, W(121) - 0.15, 300, 18)))})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #eee', paddingBottom: 16}}>
          <div style={{width: 72, height: 72, borderRadius: 72, background: '#0A0A0A', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0}}>
            <Img src={staticFile('brand/nx-logo.png')} style={{width: 56, height: 41}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111'}}>Neuraxine</div>
            <div style={{fontFamily: SANS, fontSize: 20, color: '#888'}}>Instagram · Direct</div>
          </div>
          <InstaMark size={50} />
        </div>
        <div style={{minHeight: 96, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '14px 0'}}>
          {sent > 0 && (
            <div style={{background: 'linear-gradient(90deg, #6228D7, #EE2A7B)', color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 40, padding: '14px 28px', borderRadius: 30, transform: `scale(${lerp(0.5, 1, m1(sent))})`, transformOrigin: '100% 50%'}}>AUTOMATE</div>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#F2F2F2', borderRadius: 999, padding: '14px 22px'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: sent > 0 ? '#aaa' : '#111'}}>
            {sent > 0 ? 'Message…' : typed}
            {sent <= 0 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#0095F6'}}>Send</span>
        </div>
      </div>
      {/* the guide they get back */}
      <div style={{position: 'absolute', left: 140, right: 140, top: 590, display: 'flex', alignItems: 'center', gap: 22, padding: '18px 26px', borderRadius: 30, background: 'rgba(200,255,62,0.10)', border: `2px solid ${C.lime}`, transform: `translateY(${(1 - m1(guide)) * 60}px) scale(${lerp(0.8, 1, m1(guide))})`, opacity: m1(guide * 2)}}>
        <Ico n="page_facing_up.png" size={84} />
        <div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 38, color: C.cream}}>Detailed guide</div>
          <div style={{fontFamily: SANS, fontSize: 24, color: C.dim}}>AI automation for your business · PDF</div>
        </div>
      </div>
    </div>
  );
};

/** H: follow Neuraxine. */
const Follow: React.FC<{t: number}> = ({t}) => {
  const a = W(132) - 0.1;
  if (t < a || t > edit.speech) return null;
  const v = ap(t, a, 0.25);
  const logo = sp(t, W(135) - 0.1, 260, 16);
  const press = t > W(137) - 0.05;
  const k = sp(t, W(137) - 0.05, 500, 16);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.6, 1, m1(logo))})`, opacity: m1(logo * 2)}}>
        <Img src={staticFile('brand/nx-logo.png')} style={{width: 300, height: 218, filter: 'drop-shadow(0 0 40px rgba(200,255,62,0.35))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 80, letterSpacing: '0.06em', paddingLeft: '0.06em', ...silverText, opacity: ap(t, W(135))}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 530, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 46px', borderRadius: 999, background: press ? 'transparent' : LIME_GRAD, border: `3px solid ${C.lime}`, fontFamily: SANS, fontWeight: 900, fontSize: 44, color: press ? C.lime : C.ink, transform: `scale(${press ? lerp(0.85, 1, m1(k)) : 1})`, opacity: ap(t, W(136) - 0.1)}}>
          {press ? 'Following ✓' : 'Follow'}
        </div>
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.25) return null;
  const r = t - a;
  const k = pt(t, a - 0.25, a + 0.1);
  return (
    <AbsoluteFill style={{opacity: k}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.7, 1, m1(sp(t, a, 200, 14)))})`}}>
        <Img src={staticFile('brand/nx-logo.png')} style={{width: 420, height: 306, filter: 'drop-shadow(0 0 50px rgba(200,255,62,0.35))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '0.08em', paddingLeft: '0.08em', ...silverText, opacity: pt(r, 0.1, 0.45)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.cream, opacity: pt(r, 0.3, 0.7)}}>
        Marketing laaye customers. <span style={limeText}>Automation</span> unhe convert kare.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.6, 1.0)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, border: `2px solid ${C.lime}`, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.cream}}>
          <InstaMark size={52} /> DM <span style={limeText}>“AUTOMATE”</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = Math.max(0, ...LAYOUT.slice(1).map((l) => 1 - Math.min(1, Math.abs(t - l.at) / 0.05)));
  const danger = t > W(42) - 0.1 && t < W(72) - 0.1;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop t={t} danger={danger} />
      <Speaker t={t} />
      <Brackets t={t} />
      <Marketing t={t} />
      <Missing t={t} />
      <Inbox t={t} />
      <Lost t={t} />
      <Equation t={t} />
      <Flow t={t} />
      <Truth t={t} />
      <DM t={t} />
      <Follow t={t} />
      <Intro t={t} />
      {t < edit.speech && <Captions t={t} />}
      <AbsoluteFill style={{background: danger ? C.red : C.lime, opacity: flash * 0.16, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 62%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.5} />}
    </AbsoluteFill>
  );
};
