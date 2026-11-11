import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Rekha — live online yoga & fitness. Calm, editorial wellness look: warm cream paper, deep forest ink, terracotta accent,
// sage leaves. Everything moves on slow, damped springs; no shakes, no flashes. Real Fluent 3D icons + real Zoom / Meet marks.
const C = {
  paper: '#F4EEE6',
  paper2: '#EBE2D6',
  ink: '#1D2A22',
  ink2: 'rgba(29,42,34,0.62)',
  line: 'rgba(29,42,34,0.14)',
  sage: '#7E9B80',
  sageDeep: '#3F5E47',
  terra: '#C4664A',
  gold: '#B9925A',
  white: '#FFFFFF',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;

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
// soft, well-damped springs: things settle, never bounce
const sp = (t: number, at: number, stiffness = 120, damping = 22) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));
const ap = (t: number, at: number, d = 0.6) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const win = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => ap(t, a, fi) * (1 - pt(t, b - fo, b, ease.inOut));

// ---------------------------------------------------------------- where her video sits (smoothly morphing card)
type Rect = {x: number; y: number; w: number; h: number; r: number; o: number; z: number};
const RECTS = {
  intro: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 0, z: 1.02},
  full: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.02},
  close: {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.14},
  frame: {x: 140, y: 680, w: 800, h: 1040, r: 56, o: 1, z: 1.06},
  split: {x: 80, y: 1000, w: 920, h: 800, r: 52, o: 1, z: 1.18},
  low: {x: 300, y: 1290, w: 480, h: 480, r: 240, o: 1, z: 1.45},
  gone: {x: 390, y: 1700, w: 300, h: 300, r: 150, o: 0, z: 1.3},
};
type Mode = keyof typeof RECTS;
const T_OUT = W(12) - 0.15;
const LAYOUT: {at: number; m: Mode}[] = [
  {at: 0, m: 'intro'}, // cut-out over the paper
  {at: T_OUT, m: 'split'}, // watch this before another year goes by — the year turns
  {at: W(19) - 0.15, m: 'split'}, // stiffer / tired / sleep
  {at: W(34) - 0.15, m: 'close'}, // "This is exactly…"
  {at: W(37) - 0.15, m: 'split'}, // live online classes
  {at: W(45) - 0.15, m: 'low'}, // the four pillars, she sits in a round window below
  {at: W(80) - 0.15, m: 'full'}, // "I am Rekha" — name card
  {at: W(90) - 0.15, m: 'split'}, // I teach online, every class is live
  {at: W(98) - 0.15, m: 'frame'}, // see you, guide you, stronger / happier / healthier
  {at: W(113) - 0.15, m: 'gone'}, // DM me to get started
];
const modeAt = (t: number) => LAYOUT.reduce((n, l, i) => (t >= l.at ? i : n), 0);
const rectAt = (t: number): Rect => {
  const i = modeAt(t);
  const cur = RECTS[LAYOUT[i].m];
  const prev = i ? RECTS[LAYOUT[i - 1].m] : cur;
  const k = i ? m1(sp(t, LAYOUT[i].at, 70, 20)) : 1;
  const L = (a: number, b: number) => lerp(a, b, k);
  return {x: L(prev.x, cur.x), y: L(prev.y, cur.y), w: L(prev.w, cur.w), h: L(prev.h, cur.h), r: L(prev.r, cur.r), o: L(prev.o, cur.o), z: L(prev.z, cur.z)};
};
const modeNow = (t: number): Mode => LAYOUT[modeAt(t)].m;

const Speaker: React.FC<{t: number}> = ({t}) => {
  const R = rectAt(t);
  const framed = R.r > 2;
  return (
    <div style={{position: 'absolute', left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: R.r, overflow: 'hidden', opacity: R.o, boxShadow: framed ? '0 40px 90px rgba(60,40,20,0.22), 0 0 0 10px rgba(255,255,255,0.9)' : 'none', background: '#ddd'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${R.z + 0.01 * Math.sin(t * 0.4)})`, transformOrigin: '50% 38%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 34%', filter: 'contrast(1.04) saturate(1.04) brightness(1.03) sepia(0.06)'}} />
      </div>
      {/* warm grade */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,236,214,0.10), transparent 40%, rgba(60,40,20,0.10))', mixBlendMode: 'soft-light'}} />
    </div>
  );
};

// ---------------------------------------------------------------- paper backdrop: soft light, slow sage leaves
const Paper: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 30%, #FBF7F1 0%, ${C.paper} 55%, ${C.paper2} 100%)`}}>
    <div style={{position: 'absolute', left: -260 + Math.sin(t * 0.15) * 60, top: -200, width: 900, height: 900, borderRadius: 900, background: 'radial-gradient(circle, rgba(126,155,128,0.20), transparent 65%)'}} />
    <div style={{position: 'absolute', right: -300 + Math.cos(t * 0.13) * 60, bottom: -250, width: 1000, height: 1000, borderRadius: 1000, background: 'radial-gradient(circle, rgba(196,102,74,0.13), transparent 65%)'}} />
    {/* paper grain */}
    <AbsoluteFill style={{opacity: 0.35, mixBlendMode: 'multiply'}}>
      <svg width={1080} height={1920}>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed={3} />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.30  0 0 0 0.10 0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#paper)" />
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>
);
const Leaf: React.FC<{x: number; y: number; s: number; r: number; t: number; at: number; c?: string}> = ({x, y, s, r, t, at, c = C.sage}) => {
  const p = sp(t, at, 60, 18);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y, transform: `rotate(${r + Math.sin(t * 0.6 + x) * 4}deg) scale(${m1(p)})`, transformOrigin: '50% 100%', opacity: 0.9}}>
      <path d="M50 98 C 20 70, 18 30, 50 2 C 82 30, 80 70, 50 98 Z" fill={c} opacity={0.85} />
      <path d="M50 96 V 10" stroke="rgba(255,255,255,0.55)" strokeWidth={2} fill="none" />
      {[24, 40, 56, 72].map((yy) => (
        <path key={yy} d={`M50 ${yy + 10} L ${34} ${yy} M50 ${yy + 10} L ${66} ${yy}`} stroke="rgba(255,255,255,0.4)" strokeWidth={1.4} fill="none" />
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------- type
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number}> = ({t, at, children, d = 0.8}) => {
  const p = pt(t, at, at + d, ease.out);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.14em', marginBottom: '-0.14em'}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, opacity: m1(p * 1.6)}}>{children}</span>
    </span>
  );
};
const Words: React.FC<{t: number; at: number; text: string; stagger?: number; style?: React.CSSProperties; wordStyle?: (w: string, i: number) => React.CSSProperties}> = ({t, at, text, stagger = 0.07, style, wordStyle}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.26em', ...style}}>
    {text.split(' ').map((w, i) => (
      <Rise key={i} t={t} at={at + i * stagger}>
        <span style={wordStyle?.(w, i)}>{w}</span>
      </Rise>
    ))}
  </div>
);
const Eyebrow: React.FC<{t: number; at: number; children: string; top?: number; color?: string}> = ({t, at, children, top = 150, color = C.terra}) => {
  const p = ap(t, at, 0.8);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: p}}>
      <div style={{width: 70 * p, height: 1.5, background: color}} />
      <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: `${0.42 - 0.12 * p}em`, color}}>{children}</span>
      <div style={{width: 70 * p, height: 1.5, background: color}} />
    </div>
  );
};
const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 16px 22px rgba(70,45,20,0.22))', ...style}} />;
const Float: React.FC<{t: number; at: number; n: string; size: number; x: number; y: number; rot?: number}> = ({t, at, n, size, x, y, rot = 0}) => {
  const p = sp(t, at, 110, 16);
  if (p <= 0) return null;
  return <Ico n={n} size={size} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin((t - at) * 1.4) * 8, transform: `scale(${m1(p)}) rotate(${lerp(-12, rot, m1(p))}deg)`, opacity: m1(p * 1.5)}} />;
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
const LiveDot: React.FC<{t: number}> = ({t}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, background: '#E5322D', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '0.12em'}}>
    <div style={{width: 12, height: 12, borderRadius: 12, background: '#fff', opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 3))}} />
    LIVE
  </div>
);
/** Card with a soft paper look. */
const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{borderRadius: 40, background: 'rgba(255,255,255,0.92)', boxShadow: '0 30px 70px rgba(70,45,20,0.14), 0 0 0 1px rgba(29,42,34,0.05)', ...style}}>{children}</div>
);

// ---------------------------------------------------------------- 1. HOOK — Rekha cut out on the paper; "Over 30?"
const CUT_FRAMES = 140;
const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > T_OUT + 0.9) return null;
  const out = pt(t, T_OUT - 0.1, T_OUT + 0.8, ease.inOut);
  const enter = sp(t, 0, 60, 18);
  const fi = Math.min(CUT_FRAMES - 1, Math.floor(t * FPS));
  const zoom = lerp(1, 1.06, pt(t, 0, T_OUT, ease.inOut));
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Paper t={t} />
      {/* a big soft arch behind her, like a studio backdrop */}
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 1500, borderRadius: '400px 400px 0 0', background: 'linear-gradient(180deg, #E4D6C4, #D9C7B0)', transform: `scale(${lerp(0.9, 1, m1(enter))})`, transformOrigin: '50% 100%'}} />
      <Leaf x={70} y={1080} s={260} r={-28} t={t} at={0.3} />
      <Leaf x={150} y={1150} s={200} r={-8} t={t} at={0.45} c={C.sageDeep} />
      <Leaf x={780} y={1100} s={240} r={24} t={t} at={0.55} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '50% 100%', transform: `translateY(${190 + (1 - m1(enter)) * 160}px) scale(${zoom})`}}>
        <Img src={staticFile(`clips/cut/f${String(fi).padStart(4, '0')}.webp`)} style={{width: 1080, height: 1920, filter: 'drop-shadow(0 30px 40px rgba(70,45,20,0.25))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(180deg, transparent, ${C.paper})`}} />
      {/* headline */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 130, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 200, color: C.ink, lineHeight: 0.95, letterSpacing: '-0.02em'}}>
          <Rise t={t} at={W(3) - 0.1}>Over</Rise> <Rise t={t} at={W(4) - 0.1}><span style={{color: C.terra}}>30?</span></Rise>
        </div>
        <Words t={t} at={W(6) - 0.05} text="Haven't started your fitness journey yet?" stagger={0.06} style={{fontFamily: SANS, fontWeight: 600, fontSize: 46, color: C.ink2, marginTop: 14, letterSpacing: '-0.01em'}} />
      </div>
      <Float t={t} at={W(9) - 0.1} n="person_in_lotus_position.png" size={150} x={930} y={600} rot={8} />
      <Float t={t} at={W(12) - 0.3} n="hourglass_not_done.png" size={120} x={140} y={640} rot={-10} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2. the year turns
const Year: React.FC<{t: number}> = ({t}) => {
  const a = T_OUT, b = W(19) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const flip = pt(t, W(15) - 0.1, W(18) + 0.2, ease.inOut);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Eyebrow t={t} at={a + 0.1}>WATCH THIS</Eyebrow>
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center'}}>
        <Words t={t} at={W(14) - 0.05} text="before another year goes by" stagger={0.07} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.ink}} />
      </div>
      {/* a desk calendar turning from this year to the next */}
      <div style={{position: 'absolute', left: 340, top: 470, width: 400, height: 430, perspective: 1200}}>
        <Card style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <div style={{height: 90, background: C.sageDeep, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: '0.3em'}}>JANUARY</div>
          <div style={{textAlign: 'center', fontFamily: SERIF, fontSize: 210, color: C.terra, lineHeight: 1.45}}>2027</div>
        </Card>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${flip * 170}deg)`, backfaceVisibility: 'hidden'}}>
          <Card style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
            <div style={{height: 90, background: C.sageDeep, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: '0.3em'}}>DECEMBER</div>
            <div style={{textAlign: 'center', fontFamily: SERIF, fontSize: 210, color: C.ink, lineHeight: 1.45}}>2026</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 3. symptoms: stiffer, tired, poor sleep
const SYM = [
  {at: 22, n: 'person_cartwheeling.png', t1: 'Stiffer', t2: 'than last year', x: 70, y: 300},
  {at: 28, n: 'low_battery.png', t1: 'Tired', t2: 'all the time', x: 560, y: 380},
  {at: 31, n: 'sleeping_face.png', t1: 'Sleep', t2: "isn't great", x: 300, y: 640},
];
const Symptoms: React.FC<{t: number}> = ({t}) => {
  const a = W(19) - 0.15, b = W(34) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Eyebrow t={t} at={a + 0.1}>YOUR BODY FEELS IT</Eyebrow>
      {SYM.map((s, i) => {
        const p = sp(t, W(s.at) - 0.15, 90, 18);
        return (
          <Card key={i} style={{position: 'absolute', left: s.x, top: s.y, width: 450, padding: '30px 34px', display: 'flex', alignItems: 'center', gap: 24, opacity: m1(p * 1.6), transform: `translateY(${(1 - m1(p)) * 80}px) rotate(${(1 - m1(p)) * (i % 2 ? 4 : -4) + (i - 1) * 1.5}deg)`}}>
            <Ico n={s.n} size={110} style={{transform: i === 1 ? `scale(${1 + 0.04 * Math.sin(t * 3)})` : undefined}} />
            <div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: C.ink, lineHeight: 0.95}}>{s.t1}</div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.ink2, marginTop: 4}}>{s.t2}</div>
            </div>
          </Card>
        );
      })}
      <Float t={t} at={W(31)} n="zzz.png" size={90} x={860} y={700} rot={12} />
    </div>
  );
};

// ---------------------------------------------------------------- 4. live online classes (real Zoom + Meet)
const Classes: React.FC<{t: number}> = ({t}) => {
  const a = W(37) - 0.15, b = W(45) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const tiles = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Eyebrow t={t} at={a + 0.1}>THIS IS EXACTLY WHERE</Eyebrow>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center'}}>
        <Words t={t} at={W(39) - 0.1} text="Live online classes" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, color: C.ink}} wordStyle={(w) => (w === 'Live' ? {color: C.terra} : {})} />
      </div>
      {/* a laptop-style call window */}
      <Card style={{position: 'absolute', left: 110, top: 400, width: 860, height: 520, padding: 18, transform: `translateY(${(1 - m1(sp(t, W(39) - 0.2, 80, 20))) * 120}px)`, opacity: ap(t, W(39) - 0.2)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 14px'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 16, height: 16, borderRadius: 16, background: c}} />
          ))}
          <span style={{flex: 1, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.ink2}}>Morning Flow · with Rekha</span>
          <LiveDot t={t} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, height: 420}}>
          {tiles.map((i) => {
            const p = sp(t, W(40) + i * 0.08, 110, 18);
            return (
              <div key={i} style={{borderRadius: 18, background: i === 0 ? C.sageDeep : `linear-gradient(160deg, #EADFD1, #DCCDBA)`, position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center', transform: `scale(${lerp(0.85, 1, m1(p))})`, opacity: m1(p * 1.5)}}>
                <Ico n={i === 0 ? 'woman_in_lotus_position.png' : ['person_in_lotus_position.png', 'woman_technologist.png', 'person_in_lotus_position.png', 'smiling_face_with_hearts.png', 'person_in_lotus_position.png'][i - 1]} size={i === 0 ? 120 : 90} />
                <div style={{position: 'absolute', left: 12, bottom: 10, fontFamily: SANS, fontWeight: 600, fontSize: 18, color: i === 0 ? '#fff' : C.ink2}}>{i === 0 ? 'Rekha (host)' : ['Anita', 'Priya', 'Meera', 'Kavya', 'Sunita'][i - 1]}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', gap: 28, alignItems: 'center', opacity: ap(t, W(42) - 0.1)}}>
        <Img src={icon('zoom-icon.svg')} style={{width: 64, height: 64, transform: `scale(${m1(sp(t, W(42) - 0.1, 120, 15))})`}} />
        <Img src={icon('google-meet.svg')} style={{width: 72, height: 64, objectFit: 'contain', transform: `scale(${m1(sp(t, W(43) - 0.1, 120, 15))})`}} />
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink2}}>from your home</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 5. the four pillars
const PILLARS = [
  {at: 48, n: 'flexed_biceps.png', t1: 'Strength', t2: 'feel more energetic', end: 49},
  {at: 55, n: 'person_cartwheeling.png', t1: 'Mobility & flexibility', t2: 'an easier everyday life', end: 58},
  {at: 65, n: 'person_in_lotus_position.png', t1: 'Meditation', t2: 'a calm mind, less stress', end: 66},
  {at: 73, n: 'sparkles.png', t1: 'Face yoga', t2: 'for that natural glow', end: 75},
];
const Pillars: React.FC<{t: number}> = ({t}) => {
  const a = W(45) - 0.15, b = W(80) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const cur = PILLARS.reduce((n, p, i) => (t >= W(p.at) - 0.2 ? i : n), -1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Eyebrow t={t} at={a + 0.1}>WHAT WE WORK ON</Eyebrow>
      <div style={{position: 'absolute', left: 80, right: 80, top: 230}}>
        {PILLARS.map((p, i) => {
          const s = sp(t, W(p.at) - 0.2, 90, 20);
          const on = i === cur;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '24px 30px', marginBottom: 18, borderRadius: 34, background: on ? '#fff' : 'rgba(255,255,255,0.55)', boxShadow: on ? '0 26px 60px rgba(70,45,20,0.16)' : 'none', border: `1.5px solid ${on ? 'rgba(196,102,74,0.4)' : C.line}`, opacity: s > 0 ? m1(s * 1.6) : 0, transform: `translateX(${(1 - m1(s)) * 120}px) scale(${on ? 1.02 : 1})`}}>
              <div style={{width: 120, height: 120, borderRadius: 120, background: on ? 'rgba(196,102,74,0.12)' : 'rgba(126,155,128,0.14)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
                <Ico n={p.n} size={90} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: on ? C.ink : C.ink2, lineHeight: 1}}>{p.t1}</div>
                <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.ink2, marginTop: 6}}>{p.t2}</div>
              </div>
              <div style={{fontFamily: SERIF, fontSize: 56, color: on ? C.terra : 'rgba(29,42,34,0.25)'}}>0{i + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 6. "I am Rekha" — editorial name card
const NameCard: React.FC<{t: number}> = ({t}) => {
  const a = W(80) - 0.15, b = W(90) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const line = pt(t, W(82) - 0.1, W(82) + 0.8, ease.inOut);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, background: 'linear-gradient(180deg, transparent, rgba(244,238,230,0.92) 45%, #F4EEE6)'}} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 1240}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: C.ink, lineHeight: 0.9}}>
          <Rise t={t} at={W(82) - 0.15}>Rekha</Rise>
        </div>
        <div style={{width: 760 * line, height: 2, background: C.terra, margin: '18px 0 22px'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: ap(t, W(84) - 0.1)}}>
          <Ico n="sports_medal.png" size={70} />
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink}}>Internationally certified yoga instructor</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, opacity: ap(t, W(89) - 0.15)}}>
          <Ico n="green_salad.png" size={70} />
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink}}>Nutritionist</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 7. I teach online; every class is live
const Online: React.FC<{t: number}> = ({t}) => {
  const a = W(90) - 0.15, b = W(98) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const live = sp(t, W(97) - 0.15, 120, 14);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center'}}>
        <Words t={t} at={W(91) - 0.1} text="I teach fitness online" stagger={0.07} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.ink}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 40}}>
        {[
          {n: 'woman_technologist.png', l: 'Join from home'},
          {n: 'calendar.png', l: 'Fixed batches'},
          {n: 'video_camera.png', l: 'Camera on'},
        ].map((x, i) => {
          const p = sp(t, W(92) + i * 0.18, 100, 18);
          return (
            <div key={x.l} style={{textAlign: 'center', opacity: m1(p * 1.6), transform: `translateY(${(1 - m1(p)) * 60}px)`}}>
              <Card style={{width: 240, height: 240, display: 'grid', placeItems: 'center'}}>
                <Ico n={x.n} size={130} />
              </Card>
              <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink2, marginTop: 16}}>{x.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: m1(live * 2), transform: `scale(${lerp(0.8, 1, m1(live))})`}}>
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.ink}}>Every class is</span>
        <div style={{transform: 'scale(1.6)', transformOrigin: '0 50%', marginRight: 60}}>
          <LiveDot t={t} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 8. see you, guide you → stronger, happier, healthier
const Promise3: React.FC<{t: number}> = ({t}) => {
  const a = W(98) - 0.15, b = W(113) - 0.15;
  if (t < a || t > b + 0.15) return null;
  const v = win(t, a, b + 0.15, 0.6, 0.4);
  const chips = [
    {at: 101, l: 'I see you'},
    {at: 103, l: 'I guide you'},
  ];
  const outs = [
    {at: 109, n: 'flexed_biceps.png', l: 'Stronger'},
    {at: 110, n: 'smiling_face_with_hearts.png', l: 'Happier'},
    {at: 112, n: 'herb.png', l: 'Healthier'},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', gap: 20}}>
        {chips.map((c) => {
          const p = sp(t, W(c.at) - 0.15, 110, 18);
          return (
            <div key={c.l} style={{padding: '18px 34px', borderRadius: 999, border: `1.5px solid ${C.sageDeep}`, background: 'rgba(255,255,255,0.7)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.sageDeep, opacity: m1(p * 1.6), transform: `translateY(${(1 - m1(p)) * 40}px)`}}>{c.l}</div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 340, display: 'flex', justifyContent: 'space-between'}}>
        {outs.map((o) => {
          const p = sp(t, W(o.at) - 0.15, 100, 16);
          return (
            <div key={o.l} style={{width: 300, textAlign: 'center', opacity: m1(p * 1.6), transform: `translateY(${(1 - m1(p)) * 60}px)`}}>
              <Ico n={o.n} size={110} style={{margin: '0 auto'}} />
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, color: C.ink, marginTop: 8}}>{o.l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 9. CTA — DM me to get started
const Cta: React.FC<{t: number}> = ({t}) => {
  const a = W(113) - 0.15;
  if (t < a) return null;
  const v = ap(t, a, 0.6);
  const msg = 'Hi Rekha! I want to start 🧘‍♀️';
  const typed = msg.slice(0, Math.floor(lerp(0, msg.length, pt(t, W(113) + 0.1, W(117) - 0.1, (x: number) => x))));
  const sent = t > W(117);
  return (
    <AbsoluteFill style={{opacity: v}}>
      <Paper t={t} />
      <Leaf x={40} y={1500} s={280} r={-24} t={t} at={a + 0.2} />
      <Leaf x={790} y={1520} s={250} r={22} t={t} at={a + 0.3} c={C.sageDeep} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
        <Words t={t} at={a + 0.1} text="DM me" stagger={0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, color: C.ink, lineHeight: 0.95}} />
        <Words t={t} at={W(115) - 0.1} text="to get started" stagger={0.08} style={{fontFamily: SANS, fontWeight: 600, fontSize: 56, color: C.ink2, marginTop: 12}} />
      </div>
      <Card style={{position: 'absolute', left: 110, right: 110, top: 720, padding: '28px 30px', transform: `translateY(${(1 - m1(sp(t, a + 0.2, 80, 20))) * 160}px)`, opacity: ap(t, a + 0.2)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 18, borderBottom: `1px solid ${C.line}`}}>
          <div style={{width: 88, height: 88, borderRadius: 88, padding: 4, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)'}}>
            <div style={{width: '100%', height: '100%', borderRadius: 88, background: C.paper, display: 'grid', placeItems: 'center', border: '3px solid #fff', boxSizing: 'border-box'}}>
              <Ico n="woman_in_lotus_position.png" size={56} />
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.ink}}>Rekha</div>
            <div style={{fontFamily: SANS, fontSize: 24, color: C.ink2}}>Yoga & Nutrition · Live online</div>
          </div>
          <InstaMark size={56} />
        </div>
        <div style={{minHeight: 110, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 18}}>
          {sent && (
            <div style={{background: 'linear-gradient(90deg, #6228D7, #EE2A7B)', color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 32, padding: '16px 24px', borderRadius: 28, transform: `scale(${lerp(0.7, 1, m1(sp(t, W(117), 160, 16)))})`, transformOrigin: '100% 50%'}}>{msg}</div>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#F3F1EE', borderRadius: 999, padding: '16px 24px', marginTop: 12}}>
          <span style={{flex: 1, fontFamily: SANS, fontSize: 30, color: sent ? '#aaa' : C.ink}}>
            {sent ? 'Message…' : typed}
            {!sent && <span style={{color: '#0095F6', opacity: Math.sin(t * 10) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#0095F6'}}>Send</span>
        </div>
      </Card>
      <Ico n="backhand_index_pointing_down.png" size={110} style={{position: 'absolute', left: 485, top: 1130 + Math.sin(t * 3) * 10, opacity: ap(t, W(116))}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- captions: forest ink with a soft halo; terracotta underline on the spoken word
const CAP_OFF: [number, number][] = [
  [0, T_OUT], // the intro headline carries the words
  [W(80) - 0.15, W(90) - 0.15], // name card
  [W(113) - 0.15, 99],
];
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length + (nx ? nx.w.length + 1 : 0);
    if (/[.,?!]$/.test(w.w) || cur.length >= 4 || !nx || nx.s - w.e > 0.3 || chars > 24) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const ACCENT = new Set(['30', 'fitness', 'stiffer', 'tired', 'sleep', 'live', 'online', 'strength', 'energetic', 'mobility', 'flexibility', 'meditation', 'stress', 'face', 'yoga', 'glow', 'stronger', 'happier', 'healthier']);
const Captions: React.FC<{t: number}> = ({t}) => {
  if (CAP_OFF.some(([a, b]) => t >= a && t < b)) return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const m = modeNow(t);
  const R = rectAt(t);
  const y = m === 'full' || m === 'close' ? 1440 : m === 'low' ? 1150 : R.y + R.h - 130;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const len = c.words.map((w) => w.w).join(' ').length;
  const fs = Math.max(48, Math.min(68, 1300 / Math.max(10, len)));
  const pin = ap(t, c.s - 0.05, 0.35);
  const onVideo = m !== 'low';
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: Math.min(y, 1660), display: 'flex', justifyContent: 'center', opacity: pin, transform: `translateY(${(1 - pin) * 14}px)`}}>
      <div style={{display: 'flex', gap: fs * 0.26, padding: onVideo ? '10px 26px 16px' : 0, borderRadius: 26, background: onVideo ? 'rgba(244,238,230,0.88)' : 'transparent', boxShadow: onVideo ? '0 14px 40px rgba(60,40,20,0.18)' : 'none'}}>
        {c.words.map((w, i) => {
          const on = i === cur;
          const seen = i <= cur;
          const bar = on ? pt(t, w.s - 0.04, w.s + 0.16, ease.out) : 0;
          return (
            <span key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 650, fontSize: fs, letterSpacing: '-0.015em', color: seen ? (ACCENT.has(key(w.w)) ? C.terra : C.ink) : 'rgba(29,42,34,0.35)', whiteSpace: 'nowrap'}}>
              {w.w}
              <span style={{position: 'absolute', left: 0, bottom: -6, height: 4, width: `${bar * 100}%`, borderRadius: 3, background: C.terra}} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.4) return null;
  const r = t - a;
  return (
    <AbsoluteFill style={{opacity: pt(t, a - 0.4, a + 0.3, ease.inOut)}}>
      <Paper t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.9, 1, m1(sp(t, a, 70, 18)))})`}}>
        <Ico n="woman_in_lotus_position.png" size={240} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 840, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: C.ink, lineHeight: 1}}>
        <Rise t={t} at={a + 0.1}>Rekha</Rise>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', color: C.terra, opacity: ap(r, 0.3)}}>LIVE ONLINE YOGA & FITNESS</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.ink2, opacity: ap(r, 0.5)}}>Strength · Mobility · Meditation · Face yoga</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', opacity: ap(r, 0.8)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999, background: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.paper}}>
          <InstaMark size={48} /> DM to get started
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Paper t={t} />
      <Speaker t={t} />
      <Year t={t} />
      <Symptoms t={t} />
      <Classes t={t} />
      <Pillars t={t} />
      <NameCard t={t} />
      <Online t={t} />
      <Promise3 t={t} />
      <Intro t={t} />
      {t < edit.speech && <Captions t={t} />}
      <Cta t={t} />
      <EndCard t={t} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 65%, rgba(60,40,20,0.12) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.4} />}
    </AbsoluteFill>
  );
};

export {rand};
