import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import e1 from './edit1.json';
import e2 from './edit2.json';

// Two broadcast-style vertical clips cut from one 16:9 podcast. Black + off-white + signal red; Anton display type,
// Inter body, Instrument Serif accents. The speaker's face lives in the top third, so every graphic sits below it.
const C = {bg: '#0A0A0B', paper: '#F2EFE8', red: '#E5322D', red2: '#B81E1A', dim: 'rgba(242,239,232,0.55)', ink: '#0A0A0B'};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const DISP = 'Anton, "Liberation Sans Narrow", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = 30;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Anton', `url(${staticFile('fonts/anton.woff2')}) format('woff2')`),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
type Edit = {fps: number; src0: number; speech: number; endCard: number; duration: number; frames: number; words: Word[]};
export const EDITS: Record<number, Edit> = {1: e1 as Edit, 2: e2 as Edit};
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const sp = (t: number, at: number, stiffness = 200, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.8}}));
const ap = (t: number, at: number, d = 0.3) => pt(t, at, at + d, ease.out);
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9*]/g, '');

// ---------------------------------------------------------------- per-clip direction
type Line = {at: number; text: string; style: 'disp' | 'red' | 'serif' | 'small' | 'outline'; size?: number};
type Slam = {a: number; b: number; lines: Line[]; full?: boolean; y?: number};
type Dir = {
  shots: [number, number, number?, number?][]; // [clip time, crop centre x, extra zoom, face y in source px]
  punch: number[]; // word indices that get a camera punch-in
  strap: string;
  part: string;
  slams: Slam[];
  endTitle: [string, string];
};
const DIR: Record<number, Dir> = {
  1: {
    shots: [[0, 676], [12.48, 699], [35.8, 690, 1.22, 150]],
    punch: [2, 27, 62, 71, 121, 155],
    strap: 'ON COMPETITION',
    part: 'PART 1',
    slams: [
      {a: 0, b: 7.6, y: 860, lines: [{at: 0, text: 'JISKO BHI', style: 'small'}, {at: 0, text: 'COMPETITION', style: 'disp', size: 190}, {at: 4, text: 'se farak padta hai…', style: 'serif', size: 96}]},
      {a: 7.7, b: 11.5, full: true, lines: [{at: 23, text: 'SHAYAD WOH', style: 'small'}, {at: 25, text: 'LIFE MEIN', style: 'disp', size: 170}, {at: 27, text: 'JEET NAHI RAHA', style: 'red', size: 150}]},
      {a: 17.1, b: 20.6, y: 860, lines: [{at: 60, text: 'yeh doosra kyun jeet raha hai?', style: 'serif', size: 84}, {at: 66, text: 'ROZ JAL', style: 'red', size: 200}, {at: 72, text: 'RAHE HAIN', style: 'disp', size: 150}]},
      {a: 31.8, b: 35.3, y: 880, lines: [{at: 111, text: 'KHUSH', style: 'disp', size: 150}, {at: 113, text: 'MAZE MEIN', style: 'outline', size: 150}, {at: 121, text: 'OBSESSED', style: 'red', size: 170}]},
      {a: 35.8, b: 41.5, y: 860, lines: [{at: 124, text: 'unhe pata bhi nahi', style: 'serif', size: 84}, {at: 128, text: 'idea hi nahi', style: 'serif', size: 84}, {at: 132, text: 'KISI SE', style: 'disp', size: 150}, {at: 135, text: 'MATLAB NAHI', style: 'red', size: 150}]},
      {a: 41.55, b: 44.7, full: true, lines: [{at: 145, text: 'AND I WANT ALL OF YOU', style: 'small'}, {at: 152, text: 'TO DO THE', style: 'disp', size: 160}, {at: 154, text: 'SAME THING.', style: 'red', size: 170}]},
    ],
    endTitle: ['RUN YOUR', 'OWN RACE.'],
  },
  2: {
    shots: [[0, 695], [28.61, 631]],
    punch: [6, 11, 29, 32, 72, 96, 111, 138, 154],
    strap: 'ON FOCUS',
    part: 'PART 2',
    slams: [
      {a: 9.4, b: 16.6, y: 880, lines: [{at: 37, text: 'ghode ki race dekhi hai?', style: 'serif', size: 88}, {at: 50, text: 'HORSES', style: 'disp', size: 170}, {at: 51, text: 'GET DISTRACTED', style: 'red', size: 140}]},
      {a: 23.2, b: 28.4, y: 860, lines: [{at: 79, text: 'agar mud ke dekha…', style: 'serif', size: 90}, {at: 89, text: 'RACE', style: 'disp', size: 200}, {at: 90, text: 'HAAR JAAYEGA', style: 'red', size: 150}]},
      {a: 30.5, b: 33.4, full: true, lines: [{at: 96, text: 'BLINDERS ON.', style: 'disp', size: 190}, {at: 98, text: 'keep doing what we’re doing', style: 'serif', size: 86}]},
      {a: 33.7, b: 38.6, y: 860, lines: [{at: 105, text: 'WE DON’T CARE.', style: 'red', size: 170}, {at: 109, text: 'THAT’S THE MINDSET', style: 'disp', size: 120}, {at: 112, text: 'everybody should build', style: 'serif', size: 80}]},
      {a: 50.4, b: 53.0, full: true, lines: [{at: 137, text: 'THE WORLD', style: 'disp', size: 180}, {at: 139, text: 'IS YOU.', style: 'red', size: 200}]},
      {a: 57.2, b: 59.2, full: true, lines: [{at: 152, text: 'THAT’S THE', style: 'small'}, {at: 154, text: 'MINDSET.', style: 'red', size: 210}]},
    ],
    endTitle: ['BLINDERS', 'ON.'],
  },
};

// ---------------------------------------------------------------- the speaker: vertical crop of the 16:9 podcast, cut-aware, with punch-ins
const SRC_W = 1276, SRC_H = 720;
const Speaker: React.FC<{t: number; n: number; E: Edit; D: Dir; blur: number}> = ({t, n, E, D, blur}) => {
  const si = D.shots.reduce((k, s, i) => (t >= s[0] ? i : k), 0);
  const [s0, cx, zx = 1, fy = 125] = D.shots[si];
  const life = t - s0;
  const W = E.words;
  // punch-in on chosen words, eased back out
  const punch = D.punch.reduce((z, wi) => {
    const at = W[wi]?.s ?? 99;
    return z + 0.1 * sp(t, at - 0.05, 260, 18) * (1 - pt(t, at + 0.9, at + 1.8, ease.inOut));
  }, 0);
  const intro = s0 === 0 ? 0.12 * (1 - pt(t, 0, 0.8, ease.out)) : 0;
  const base = 1.04 + 0.03 * m1(life / 12) + intro;
  const z = (base + punch) * zx;
  const S = (1920 / SRC_H) * z;
  const faceY = fy; // source px (face centre)
  const left = 540 - cx * S;
  const top = 380 - faceY * S; // keep the face around y=380
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: blur > 0 ? `blur(${blur * 14}px) brightness(${1 - blur * 0.55})` : undefined}}>
      <OffthreadVideo muted src={staticFile(`clips/clip${n}.mp4`)} style={{position: 'absolute', left, top: Math.min(0, top), width: SRC_W * S, height: SRC_H * S, filter: 'contrast(1.08) saturate(0.95) brightness(1.02)'}} />
      {/* grade: cool shadows, warm highlights, and a dark floor for the type */}
      <AbsoluteFill style={{background: 'linear-gradient(200deg, rgba(255,170,90,0.10), transparent 45%, rgba(30,60,90,0.18))', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 16%, transparent 40%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.88) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- broadcast furniture
const Bug: React.FC<{t: number; part: string}> = ({t, part}) => {
  const p = ap(t, 0.2, 0.6);
  return (
    <>
      <div style={{position: 'absolute', left: 54, top: 64, display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
        <div style={{width: 18, height: 18, background: C.red}} />
        <span style={{fontFamily: DISP, fontSize: 34, letterSpacing: '0.08em', color: C.paper}}>THE MINDSET</span>
        <div style={{width: 60 * p, height: 2, background: 'rgba(242,239,232,0.6)'}} />
      </div>
      <div style={{position: 'absolute', right: 54, top: 66, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', color: C.dim, opacity: p}}>{part}</div>
    </>
  );
};
const Strap: React.FC<{t: number; text: string; a: number; b: number}> = ({t, text, a, b}) => {
  if (t < a || t > b + 0.4) return null;
  const inn = pt(t, a, a + 0.45, ease.out);
  const out = pt(t, b, b + 0.4, ease.in);
  return (
    <div style={{position: 'absolute', left: 54, top: 1180, display: 'flex', alignItems: 'stretch', clipPath: `inset(0 ${(1 - inn + out) * 100}% 0 0)`}}>
      <div style={{background: C.red, padding: '10px 18px', fontFamily: DISP, fontSize: 40, color: C.paper, letterSpacing: '0.04em'}}>LIVE TALK</div>
      <div style={{background: C.paper, padding: '10px 22px', fontFamily: DISP, fontSize: 40, color: C.ink, letterSpacing: '0.04em'}}>{text}</div>
    </div>
  );
};
const Progress: React.FC<{t: number; E: Edit}> = ({t, E}) => (
  <div style={{position: 'absolute', left: 54, right: 54, top: 112, height: 3, background: 'rgba(242,239,232,0.18)'}}>
    <div style={{width: `${m1(t / E.speech) * 100}%`, height: '100%', background: C.red}} />
  </div>
);

// ---------------------------------------------------------------- kinetic statement type
const LineView: React.FC<{t: number; at: number; l: Line}> = ({t, at, l}) => {
  const p = pt(t, at - 0.04, at + 0.42, ease.out);
  const sz = l.size ?? 110;
  const base: React.CSSProperties = {display: 'inline-block', lineHeight: 0.98, whiteSpace: 'nowrap'};
  const st: React.CSSProperties =
    l.style === 'disp'
      ? {fontFamily: DISP, fontSize: sz, color: C.paper, letterSpacing: '0.005em'}
      : l.style === 'red'
        ? {fontFamily: DISP, fontSize: sz, color: C.red, letterSpacing: '0.005em'}
        : l.style === 'outline'
          ? {fontFamily: DISP, fontSize: sz, color: 'transparent', WebkitTextStroke: `3px ${C.paper}`, letterSpacing: '0.01em'}
          : l.style === 'serif'
            ? {fontFamily: SERIF, fontStyle: 'italic', fontSize: sz, color: C.paper, paddingRight: '0.1em'}
            : {fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.42em', color: C.dim, paddingLeft: '0.42em'};
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.08em'}}>
      <span style={{...base, ...st, transform: `translateY(${(1 - p) * 105}%) skewY(${(1 - p) * 6}deg)`, opacity: m1(p * 3)}}>{l.text}</span>
    </div>
  );
};
const SlamView: React.FC<{t: number; s: Slam; W: Word[]}> = ({t, s, W}) => {
  if (t < s.a - 0.1 || t > s.b + 0.35) return null;
  const out = pt(t, s.b, s.b + 0.35, ease.in);
  const bar = pt(t, s.a, s.a + 0.5, ease.out);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: s.full ? 640 : s.y ?? 860, textAlign: 'center', opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
      {!s.full && <div style={{width: 120 * bar, height: 6, background: C.red, margin: '0 auto 26px'}} />}
      {s.lines.map((l, i) => (
        <LineView key={i} t={t} at={W[l.at]?.s ?? 0} l={l} />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- set pieces
/** Clip 1: rank ticker #1 → #10 → #50 → #90 → #500 as he lists them. */
const Ranks: React.FC<{t: number; W: Word[]}> = ({t, W}) => {
  const a = W[76].s - 0.1, b = W[104].e + 0.6;
  if (t < a || t > b + 0.3) return null;
  const v = ap(t, a, 0.3) * (1 - pt(t, b, b + 0.3, ease.in));
  const marks = [{i: 87, n: '1'}, {i: 90, n: '10'}, {i: 93, n: '50'}, {i: 95, n: '90'}, {i: 97, n: '500'}];
  const cur = marks.reduce((k, m, j) => (t >= W[m.i].s - 0.05 ? j : k), -1);
  const st = pt(t, W[100].s - 0.05, W[101].e, ease.out);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: v}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.42em', paddingLeft: '0.42em', color: C.dim}}>APNE GAME MEIN PHOD RAHE</div>
      <div style={{position: 'relative', height: 300, marginTop: 20}}>
        {marks.map((m, j) => {
          const p = sp(t, W[m.i].s - 0.05, 320, 22);
          const gone = j < cur ? pt(t, W[marks[j + 1].i].s - 0.05, W[marks[j + 1].i].s + 0.25, ease.in) : 0;
          if (p <= 0 || gone >= 1) return null;
          return (
            <div key={m.n} style={{position: 'absolute', left: 0, right: 0, top: 0, fontFamily: DISP, fontSize: 280, lineHeight: 1, color: j === marks.length - 1 ? C.red : C.paper, opacity: m1(p * 2) * (1 - gone), transform: `translateY(${(1 - m1(p)) * 120 - gone * 120}px)`}}>
              <span style={{fontSize: 140, verticalAlign: 'top', color: C.red}}>#</span>
              {m.n}
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, color: C.paper, opacity: st}}>…ya just start kar rahe hain</div>
    </div>
  );
};
/** Clip 2 hook: 500 kadam aage / 500 kadam peeche. */
const Steps500: React.FC<{t: number; W: Word[]}> = ({t, W}) => {
  const a = 0, b = W[25].e + 0.3;
  if (t > b + 0.3) return null;
  const v = 1 - pt(t, b, b + 0.3, ease.in);
  const row = (at: number, label: string, arrow: string, red: boolean) => {
    const p = sp(t, at, 260, 20);
    const n = Math.round(lerp(0, 500, pt(t, at, at + 0.6, ease.out)));
    return (
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 22, opacity: m1(p * 2), transform: `translateX(${(1 - m1(p)) * (red ? 300 : -300)}px)`}}>
        <span style={{fontFamily: DISP, fontSize: 70, color: red ? C.red : C.paper}}>{arrow}</span>
        <span style={{fontFamily: DISP, fontSize: 230, lineHeight: 1, color: red ? C.red : C.paper, fontVariantNumeric: 'tabular-nums', minWidth: 330, textAlign: 'right'}}>{n}</span>
        <span style={{fontFamily: DISP, fontSize: 64, color: C.paper, textAlign: 'left', lineHeight: 1}}>
          KADAM
          <br />
          <span style={{color: red ? C.red : C.dim}}>{label}</span>
        </span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 840, opacity: v}}>
      <div style={{textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 88, color: C.paper, opacity: ap(t, W[0].s)}}>kya farak padta hai…</div>
      {row(W[6].s - 0.05, 'AAGE', '▲', false)}
      {row(W[11].s - 0.05, 'PEECHE', '▼', true)}
      <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.4em', paddingLeft: '0.4em', color: C.dim, marginTop: 20, opacity: ap(t, W[15].s)}}>YA GAALI DE RAHA HAI</div>
    </div>
  );
};
/** Clip 2: "Who gives a f***?" — a censor bar slams over the word. */
const Censor: React.FC<{t: number; W: Word[]}> = ({t, W}) => {
  const a = W[26].s - 0.08, b = W[29].e + 0.45;
  if (t < a || t > b + 0.2) return null;
  const v = 1 - pt(t, b, b + 0.2, ease.in);
  const bar = sp(t, W[29].s - 0.03, 600, 24);
  const shake = t > W[29].s && t < W[29].s + 0.25 ? Math.sin(t * 120) * 10 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: v, transform: `translateX(${shake}px)`}}>
      <div style={{fontFamily: DISP, fontSize: 150, color: C.paper, lineHeight: 1}}>WHO GIVES</div>
      <div style={{position: 'relative', display: 'inline-block', fontFamily: DISP, fontSize: 190, color: C.paper, lineHeight: 1.05}}>
        A F**K?
        <div style={{position: 'absolute', left: '22%', right: -10, top: '18%', bottom: '14%', background: C.red, transform: `scaleX(${m1(bar)})`, transformOrigin: '0 50%', display: 'grid', placeItems: 'center'}}>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: '0.3em', color: C.paper, opacity: m1(bar * 2)}}>CENSORED</span>
        </div>
      </div>
    </div>
  );
};
/** Clip 2: two black blinder panels close in from the sides; the world narrows to one lane. */
const Blinders: React.FC<{t: number; a: number; b: number; label?: string}> = ({t, a, b, label}) => {
  if (t < a || t > b + 0.4) return null;
  const k = sp(t, a, 160, 22) * (1 - pt(t, b, b + 0.4, ease.inOut));
  const gap = lerp(540, 250, m1(k));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 540 - gap, background: 'linear-gradient(90deg, #000 60%, rgba(0,0,0,0.85))', boxShadow: '20px 0 60px rgba(0,0,0,0.8)'}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 540 - gap, background: 'linear-gradient(270deg, #000 60%, rgba(0,0,0,0.85))', boxShadow: '-20px 0 60px rgba(0,0,0,0.8)'}} />
      <div style={{position: 'absolute', left: 540 - gap, width: 4, top: 0, bottom: 0, background: C.red, opacity: m1(k)}} />
      <div style={{position: 'absolute', right: 540 - gap, width: 4, top: 0, bottom: 0, background: C.red, opacity: m1(k)}} />
      {label && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center'}}>
          <LineView t={t} at={a + 0.1} l={{at: 0, text: 'PUT THE', style: 'small'}} />
          <LineView t={t} at={a + 0.25} l={{at: 0, text: label, style: 'disp', size: 120}} />
        </div>
      )}
    </AbsoluteFill>
  );
};
/** Clip 2: a horse runs the lane; when it glances sideways it falls back. */
const HorseRun: React.FC<{t: number; W: Word[]}> = ({t, W}) => {
  const a = W[42].s - 0.1, b = W[53].e + 0.4;
  if (t < a || t > b) return null;
  const run = pt(t, a, b, (x: number) => x);
  const distracted = t > W[51].s;
  const lag = pt(t, W[51].s, W[53].e, ease.inOut);
  const bob = Math.abs(Math.sin(t * 14)) * 18;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 220, opacity: ap(t, a) * (1 - pt(t, b - 0.3, b))}}>
      {Array.from({length: 14}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: ((i * 90 - t * 900) % 1260) + 1080 - 1260, top: 180, width: 46, height: 4, background: 'rgba(242,239,232,0.35)'}} />
      ))}
      <Img src={staticFile('icons/horse_racing.png')} style={{position: 'absolute', left: lerp(120, 640, run) - lag * 380, top: 10 - bob, width: 180, height: 180, transform: `scaleX(-1) rotate(${distracted ? Math.sin(t * 9) * 8 : 0}deg)`, filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.6))'}} />
      {distracted && <Img src={staticFile('icons/eyes.png')} style={{position: 'absolute', left: lerp(120, 640, run) - lag * 380 + 30, top: -70, width: 80, height: 80, opacity: ap(t, W[51].s)}} />}
    </div>
  );
};
/** Clip 2: you / family / people / work / community / goals — a broadcast list that stacks. */
const WorldList: React.FC<{t: number; W: Word[]}> = ({t, W}) => {
  const a = W[118].s - 0.1, b = W[136].e + 0.6;
  if (t < a || t > b + 0.3) return null;
  const v = ap(t, a) * (1 - pt(t, b, b + 0.3, ease.in));
  const items = [{i: 123, t: 'YOU'}, {i: 125, t: 'YOUR FAMILY'}, {i: 127, t: 'YOUR PEOPLE'}, {i: 129, t: 'YOUR WORK'}, {i: 133, t: 'COMMUNITY'}, {i: 136, t: 'YOUR GOALS'}];
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 760, opacity: v}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.4em', color: C.dim, marginBottom: 18}}>REGARDLESS OF WHO YOU ARE</div>
      {items.map((it, j) => {
        const p = pt(t, W[it.i].s - 0.05, W[it.i].s + 0.35, ease.out);
        return (
          <div key={it.t} style={{display: 'flex', alignItems: 'center', gap: 24, borderTop: '2px solid rgba(242,239,232,0.15)', padding: '10px 0', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.red, width: 50}}>0{j + 1}</span>
            <span style={{fontFamily: DISP, fontSize: 86, color: j === items.length - 1 ? C.red : C.paper, lineHeight: 1.05}}>{it.t}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- captions (hidden under statements / set pieces)
type Chunk = {words: Word[]; s: number; e: number};
const chunks = (W: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  W.forEach((w, i) => {
    cur.push(w);
    const nx = W[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length + (nx ? nx.w.length + 1 : 0);
    if (/[.,?!…]$/.test(w.w) || cur.length >= 4 || !nx || nx.s - w.e > 0.3 || chars > 22) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
};
const RED_W = new Set(['competition', 'comparison', 'jeet', 'jal', 'obsessed', 'matlab', 'blinders', 'distracted', 'haar', 'mindset', 'world', 'goals', 'race', 'care']);
const Captions: React.FC<{t: number; CH: Chunk[]; off: (t: number) => boolean}> = ({t, CH, off}) => {
  if (off(t)) return null;
  const c = CH.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const len = c.words.map((w) => w.w).join(' ').length;
  const fs = Math.max(52, Math.min(70, 1300 / Math.max(10, len)));
  const pin = ap(t, c.s - 0.05, 0.25);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1560, display: 'flex', justifyContent: 'center', gap: fs * 0.25, opacity: pin, transform: `translateY(${(1 - pin) * 14}px)`}}>
      {c.words.map((w, i) => {
        const on = i === cur;
        const seen = i <= cur;
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: seen ? (RED_W.has(key(w.w)) ? C.red : C.paper) : 'rgba(242,239,232,0.35)', transform: `scale(${on ? 1.06 : 1})`, textShadow: '0 4px 20px rgba(0,0,0,0.9)'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const EndCard: React.FC<{t: number; E: Edit; D: Dir}> = ({t, E, D}) => {
  const a = E.speech;
  if (t < a - 0.3) return null;
  const r = t - a;
  const k = pt(t, a - 0.3, a + 0.2, ease.inOut);
  return (
    <AbsoluteFill style={{background: C.bg, opacity: k}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center'}}>
        <div style={{width: 120 * ap(r, 0.05, 0.5), height: 6, background: C.red, margin: '0 auto 34px'}} />
        <LineView t={t} at={a + 0.1} l={{at: 0, text: D.endTitle[0], style: 'disp', size: 190}} />
        <LineView t={t} at={a + 0.3} l={{at: 0, text: D.endTitle[1], style: 'red', size: 210}} />
        <div style={{marginTop: 40, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.45em', paddingLeft: '0.45em', color: C.dim, opacity: ap(r, 0.7, 0.5)}}>THE MINDSET · {D.part}</div>
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

export const Film: React.FC<{clip: number}> = ({clip}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const E = EDITS[clip];
  const D = DIR[clip];
  const W = E.words;
  const CH = React.useMemo(() => chunks(W), [W]);
  const fullBlur = Math.max(0, ...D.slams.filter((s) => s.full).map((s) => pt(t, s.a - 0.1, s.a + 0.25, ease.out) * (1 - pt(t, s.b, s.b + 0.35, ease.in))));
  // set-piece windows that own the lower half
  const pieces: [number, number][] =
    clip === 1
      ? [[W[76].s - 0.1, W[104].e + 0.9]]
      : [
          [0, W[25].e + 0.6],
          [W[26].s - 0.08, W[29].e + 0.65],
          [W[30].s - 0.05, W[36].e + 0.4],
          [W[54].s - 0.1, W[69].e + 0.4],
          [W[118].s - 0.1, W[136].e + 0.9],
        ];
  const off = (tt: number) => D.slams.some((s) => tt >= s.a - 0.1 && tt < s.b + 0.3) || pieces.some(([a, b]) => tt >= a && tt < b);
  // hard flash on each camera cut
  const flash = Math.max(0, ...D.shots.slice(1).map(([s]) => 1 - Math.min(1, Math.abs(t - s) / 0.06)));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Speaker t={t} n={clip} E={E} D={D} blur={fullBlur} />
      {clip === 2 && <Blinders t={t} a={W[30].s - 0.05} b={W[36].e + 0.2} label="BLINDERS ON." />}
      {clip === 2 && <Blinders t={t} a={W[57].s - 0.05} b={W[69].e + 0.2} />}
      <Bug t={t} part={D.part} />
      <Progress t={t} E={E} />
      <Strap t={t} text={D.strap} a={clip === 1 ? 12.5 : 17.4} b={clip === 1 ? 16.3 : 22.0} />
      {D.slams.map((s, i) => (
        <SlamView key={i} t={t} s={s} W={W} />
      ))}
      {clip === 1 && <Ranks t={t} W={W} />}
      {clip === 2 && <Steps500 t={t} W={W} />}
      {clip === 2 && <Censor t={t} W={W} />}
      {clip === 2 && <HorseRun t={t} W={W} />}
      {clip === 2 && <WorldList t={t} W={W} />}
      {t < E.speech && <Captions t={t} CH={CH} off={off} />}
      <AbsoluteFill style={{background: C.paper, opacity: flash * 0.18, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} E={E} D={D} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 60%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile(`audio/voice${clip}.wav`)} />
      <Audio src={staticFile(`audio/score${clip}.wav`)} volume={0.42} />
    </AbsoluteFill>
  );
};

export {rand};
