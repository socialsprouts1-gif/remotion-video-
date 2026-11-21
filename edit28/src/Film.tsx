import React from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {DUR, Fonts, MONO, SANS, SERIF, W, WE, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import shots from './shots.json';

// ---------------------------------------------------------------------------------------
// Editorial poster style (after the reference reel): peach + black + burnt orange,
// huge condensed keywords, serif-italic fillers, photoreal cut-out heroes, HUD details.
// ---------------------------------------------------------------------------------------
const OR = '#1F9D55';
const OR2 = '#34C46E';
const PEACH = '#FFFFFF';
const INK = '#16110E';
const BEBAS = '"Bebas Neue", Oswald, Impact, sans-serif';
const S = shots.starts as number[];
const END_AT = shots.end as number;
const hero = (n: string) => staticFile(`hero/${n}.png`);
const logo = (n: string) => staticFile(`logos/${n}.svg`);
const fl = (n: string) => staticFile(`fluent/${n}.png`);

// fonts: wait until Bebas / Oswald are really loaded before frames are captured
const BebasFace: React.FC = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const faces = [
      new FontFace('Bebas Neue', `url(${staticFile('fonts/bebas-neue-latin-400-normal.woff2')})`),
      new FontFace('Oswald', `url(${staticFile('fonts/oswald-latin-600-normal.woff2')})`, {weight: '600'}),
      new FontFace('InterVar', `url(${staticFile('fonts/inter-var.woff2')})`, {weight: '100 900'}),
      new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')})`, {style: 'italic'}),
      new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff))))
      .catch(() => null)
      .finally(() => continueRender(h));
  }, [h]);
  return null;
};

// ---- kinetic type -----------------------------------------------------------------------
type St = 'sm' | 'it' | 'big' | 'bigw' | 'mid';
type Tok = [number, number, St?, string?]; // line, word, style, text override
const clean = (w: string) => w.replace(/"/g, '').replace(/,$/, '');
const Word: React.FC<{t: number; tok: Tok; dark: boolean; size: number}> = ({t, tok, dark, size}) => {
  const [l, k, st = 'sm', txt] = tok;
  const at = W(l, k) - 0.06;
  const p = ep(t, at, 0.45);
  const word = txt ?? clean(byWord(l, k));
  const base: React.CSSProperties = {display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 10}px)`, whiteSpace: 'pre'};
  if (st === 'big' || st === 'bigw')
    return (
      <span style={{...base, fontFamily: BEBAS, fontSize: size, lineHeight: 0.92, letterSpacing: '0.005em', color: st === 'bigw' ? (dark ? '#fff' : INK) : OR, backgroundImage: st === 'big' ? `linear-gradient(180deg, ${OR2}, ${OR} 55%, #137A3E)` : undefined, WebkitBackgroundClip: st === 'big' ? 'text' : undefined, WebkitTextFillColor: st === 'big' ? 'transparent' : undefined, textShadow: dark && st === 'big' ? `0 0 40px rgba(31,157,85,0.35)` : undefined, transform: `translateY(${(1 - p) * 40}px) scale(${lerp(1.12, 1, p)})`}}>
        {word.toUpperCase()}
      </span>
    );
  if (st === 'it') return <span style={{...base, fontFamily: SERIF, fontStyle: 'italic', fontSize: size * 0.36, color: dark ? '#F4E3D1' : INK, letterSpacing: '-0.01em'}}>{word}</span>;
  if (st === 'mid') return <span style={{...base, fontFamily: SANS, fontWeight: 800, fontSize: size * 0.42, color: dark ? '#fff' : INK, letterSpacing: '-0.035em'}}>{word}</span>;
  return <span style={{...base, fontFamily: SANS, fontWeight: 700, fontSize: size * 0.3, color: dark ? 'rgba(255,255,255,0.92)' : INK, letterSpacing: '-0.03em'}}>{word}</span>;
};
import edit from './edit.json';
const WORDS = (edit.words as {w: string; line: number}[]).reduce<Record<number, string[]>>((a, w) => {
  (a[w.line] = a[w.line] || []).push(w.w);
  return a;
}, {});
const byWord = (l: number, k: number) => WORDS[l][k];

/** rows of synced words; `size` = big-word font size */
const Kin: React.FC<{t: number; rows: Tok[][]; dark?: boolean; top: number; size?: number; gap?: number; strike?: [number, number, number]}> = ({t, rows, top, size = 150, gap = 4, strike}) => {
  const dark = false;
  return (
  <div style={{position: 'absolute', left: 50, right: 50, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>
    {rows.map((r, i) => (
      <div key={i} style={{position: 'relative', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: size * 0.1, flexWrap: 'nowrap'}}>
        {r.map((tok, j) => (
          <Word key={j} t={t} tok={tok} dark={dark} size={size} />
        ))}
        {strike && strike[0] === i && <div style={{position: 'absolute', left: -10, right: -10, top: '52%', height: size * 0.07, background: dark ? '#fff' : INK, transform: `scaleX(${ep(t, W(strike[1], strike[2]), 0.35)})`, transformOrigin: 'left'}} />}
      </div>
    ))}
  </div>
  );
};

// ---- decor ------------------------------------------------------------------------------
const Barcode: React.FC<{x: number; y: number; w?: number; h?: number; dark?: boolean; seed?: number}> = ({x, y, w = 180, h = 56, dark, seed = 3}) => {
  let cx = 0;
  const bars: React.ReactNode[] = [];
  for (let i = 0; cx < w; i++) {
    const bw = 1.5 + Math.floor(rnd(seed * 31 + i) * 4) * 1.5;
    if (i % 2 === 0) bars.push(<rect key={i} x={cx} y={0} width={bw} height={h} fill={dark ? '#EDE2D6' : INK} />);
    cx += bw + 1.5;
  }
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, opacity: 0.85}}>
      {bars}
    </svg>
  );
};
const SideText: React.FC<{dark: boolean; t: number}> = ({dark, t}) => {
  const c = dark ? 'rgba(255,255,255,0.32)' : 'rgba(22,17,14,0.42)';
  const st: React.CSSProperties = {position: 'absolute', fontFamily: MONO, fontWeight: 700, fontSize: 17, letterSpacing: '0.32em', color: c, whiteSpace: 'nowrap'};
  return (
    <>
      <div style={{...st, left: 22, top: 960, transform: 'translate(-50%,-50%) rotate(-90deg) translateY(30px)'}}>NEURAXINE STUDIO · CA EDITION · {String(Math.floor(t * 30) % 1000).padStart(3, '0')}</div>
      <div style={{...st, right: 22, top: 960, transform: 'translate(50%,-50%) rotate(90deg) translateY(30px)'}}>DESIGNLAB 400 · FY 25-26 · ▼ 23</div>
    </>
  );
};
const CamHud: React.FC<{dark?: boolean}> = ({dark}) => {
  const c = dark ? 'rgba(255,255,255,0.4)' : 'rgba(22,17,14,0.5)';
  const st: React.CSSProperties = {position: 'absolute', fontFamily: MONO, fontWeight: 700, fontSize: 20, color: c, letterSpacing: '0.1em', lineHeight: 1.5};
  return (
    <>
      <div style={{...st, right: 60, top: 1560, textAlign: 'right'}}>RAW HD 4K<br />60FPS</div>
      <div style={{...st, left: 70, top: 1560}}>ISO 200<br />WB 5600K</div>
      <div style={{position: 'absolute', left: 70, top: 1650, display: 'flex', gap: 5}}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <div key={k} style={{width: 10, height: 26, background: c, opacity: k < 5 ? 1 : 0.35}} />
        ))}
      </div>
    </>
  );
};
const HandlePill: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={{position: 'absolute', left: 300, right: 300, top: 70, height: 60, borderRadius: 30, border: `2px solid ${dark ? 'rgba(255,255,255,0.5)' : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: dark ? '#fff' : INK}}>
    <span style={{width: 40, height: 40, borderRadius: 20, border: `2px solid ${dark ? '#fff' : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20}}>♡</span>
    @neuraxine
    <span style={{width: 40, height: 40, borderRadius: 20, border: `2px solid ${dark ? '#fff' : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>→</span>
  </div>
);

/** photoreal cut-out hero with contact shadow, optional peach disc, idle float */
const Hero: React.FC<{src: string; t: number; x: number; y: number; w: number; disc?: boolean; dark?: boolean; at?: number; rot?: number; seed?: number}> = ({src, t, x, y, w, disc, at = 0, rot = 0, seed = 0}) => {
  const dark = false;
  const p = ep(t, at, 0.7);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, height: w, opacity: p, transform: `translateY(${(1 - p) * 80 + Math.sin(t * 1.2 + seed) * 8}px) scale(${lerp(0.9, 1, p)}) rotate(${rot + Math.sin(t * 0.8 + seed) * 1.2}deg)`}}>
      {disc && <div style={{position: 'absolute', left: w * 0.14, top: w * 0.2, width: w * 0.72, height: w * 0.72, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #EAF7EE, #CFEBD9 70%)', opacity: 0.85}} />}
      <div style={{position: 'absolute', left: w * 0.22, right: w * 0.22, bottom: w * 0.03, height: w * 0.07, borderRadius: '50%', background: dark ? 'rgba(31,157,85,0.25)' : 'rgba(20,40,25,0.22)', filter: `blur(${w * 0.025}px)`}} />
      <Img src={src} style={{position: 'absolute', inset: 0, width: w, height: w, filter: dark ? 'drop-shadow(0 30px 50px rgba(0,0,0,0.7))' : 'drop-shadow(0 30px 40px rgba(20,40,25,0.28))'}} />
    </div>
  );
};

/** dashed selection box with handles, like a design tool */
const SelBox: React.FC<{t: number; at: number; x: number; y: number; w: number; h: number; tag?: string; dark?: boolean}> = ({t, at, x, y, w, h, tag, dark}) => {
  const p = ep(t, at, 0.6);
  const c = dark ? '#fff' : INK;
  const per = 2 * (w + h);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: p > 0 ? 1 : 0}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={0} y={0} width={w} height={h} fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="10 8" style={{strokeDashoffset: per * (1 - p)}} />
      </svg>
      {[[0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1]].map(([a, b], i) => (
        <div key={i} style={{position: 'absolute', left: a * w - 9, top: b * h - 9, width: 18, height: 18, background: dark ? '#222' : '#fff', border: `2.5px solid ${c}`, transform: `scale(${sp(t, at + 0.3 + i * 0.03, 1.4)})`}} />
      ))}
      {tag && t > at + 0.4 && (
        <div style={{position: 'absolute', left: w * 0.08, top: h * 0.62, background: OR, color: '#fff', borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap', transform: `scale(${sp(t, at + 0.4, 1.3)})`, transformOrigin: 'left center', boxShadow: '0 12px 24px rgba(31,157,85,0.35)'}}>{tag}</div>
      )}
    </div>
  );
};

const Pill: React.FC<{t: number; at: number; children: React.ReactNode; x: number; y: number; dark?: boolean; col?: string}> = ({t, at, children, x, y, dark, col}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 10, background: col ?? (dark ? 'rgba(255,255,255,0.1)' : '#fff'), color: col ? '#fff' : dark ? '#fff' : INK, border: col ? 'none' : `2px solid ${dark ? 'rgba(255,255,255,0.35)' : INK}`, borderRadius: 40, padding: '10px 24px', fontFamily: SANS, fontWeight: 700, fontSize: 30, opacity: ep(t, at, 0.2), transform: `scale(${t > at ? sp(t, at, 1.3) : 0.6})`, whiteSpace: 'nowrap', boxShadow: '0 10px 24px rgba(0,0,0,0.15)'}}>
    {children}
  </div>
);

/** realistic WhatsApp bubble */
const WaBubble: React.FC<{t: number; at: number; me?: boolean; children: React.ReactNode; time: string; x: number; y: number; w: number; tag?: string}> = ({t, at, me, children, time, x, y, w, tag}) => {
  const p = ep(t, at, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.9, 1, p)})`, transformOrigin: me ? 'right bottom' : 'left bottom'}}>
      <div style={{maxWidth: w, background: me ? '#D9FDD3' : '#fff', borderRadius: 28, borderTopRightRadius: me ? 6 : 28, borderTopLeftRadius: me ? 28 : 6, padding: '16px 22px 10px', fontFamily: SANS, fontSize: 32, lineHeight: 1.28, color: '#111B21', boxShadow: '0 16px 36px rgba(0,0,0,0.18)'}}>
        {tag && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.1em', color: '#128C7E', marginBottom: 6}}>{tag}</div>}
        {children}
        <div style={{fontSize: 18, color: '#667781', textAlign: 'right', marginTop: 4}}>
          {time} {me && <span style={{color: '#53BDEB'}}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

/** floating phone (CSS 3D) */
const Phone: React.FC<{x: number; y: number; w: number; ry: number; rx: number; t: number; seed: number; children: React.ReactNode; blur?: number}> = ({x, y, w, ry, rx, t, seed, children, blur = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 2.05, perspective: 1600, filter: blur ? `blur(${blur}px)` : undefined}}>
    <div style={{width: '100%', height: '100%', borderRadius: w * 0.14, background: 'linear-gradient(145deg,#e9e9ea,#9b9ca0)', padding: w * 0.035, transform: `rotateY(${ry + Math.sin(t * 0.7 + seed) * 6}deg) rotateX(${rx}deg) translateY(${Math.sin(t * 1.1 + seed) * 14}px)`, boxShadow: '0 30px 60px rgba(20,40,25,0.18)', border: '2px solid #E3EAE4'}}>
      <div style={{width: '100%', height: '100%', borderRadius: w * 0.11, background: '#fff', overflow: 'hidden', position: 'relative'}}>{children}</div>
    </div>
  </div>
);
/** generic "deadline reminder" post — no invented handles, numbers or dates */
const POSTS: [string, string, string, string, string][] = [
  ['DEADLINE', 'ALERT', 'File your returns on time', 'alarm_clock', INK],
  ['GST', 'REMINDER', 'Don’t miss the due date', 'bell', '#137A3E'],
  ['TAX', 'TIPS', 'Save more this year', 'light_bulb', '#2B2F2C'],
  ['FILE', 'YOUR ITR', 'Before the last date', 'page_facing_up', '#1F9D55'],
];
const DeadlinePost: React.FC<{v: number; s?: number}> = ({v, s = 1}) => {
  const [a, b, c, ic, bg] = POSTS[v % POSTS.length];
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', fontFamily: SANS, color: INK, fontSize: 18 * s}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6 * s, padding: `${10 * s}px ${12 * s}px`}}>
        <Img src={logo('instagram')} style={{width: 22 * s, height: 22 * s}} />
        <b style={{fontSize: 16 * s}}>your.ca.firm</b>
      </div>
      <div style={{flex: 1, background: bg, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 * s}}>
        <Img src={fl(ic)} style={{width: 70 * s, height: 70 * s}} />
        <div style={{fontFamily: BEBAS, fontSize: 58 * s, lineHeight: 0.9, letterSpacing: '0.02em'}}>{a}</div>
        <div style={{fontFamily: BEBAS, fontSize: 40 * s, lineHeight: 0.9, color: bg === INK ? '#34C46E' : '#fff'}}>{b}</div>
        <div style={{fontSize: 15 * s, opacity: 0.85, marginTop: 6 * s}}>{c}</div>
      </div>
      <div style={{padding: `${10 * s}px ${12 * s}px`, fontSize: 20 * s, display: 'flex', gap: 14 * s, color: INK}}>♡ <span>💬</span> <span>➤</span></div>
    </div>
  );
};

// ---- backgrounds ------------------------------------------------------------------------
type Bg = 'peach' | 'dark' | 'brown';
const Back: React.FC<{bg: Bg; t: number; arc?: boolean}> = ({t, arc}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 60% at 50% 45%, #FFFFFF 0%, #FBFCFA 55%, #EEF4EF 100%)', overflow: 'hidden'}}>
    <AbsoluteFill style={{opacity: 0.5, backgroundImage: 'radial-gradient(rgba(20,40,25,0.10) 1.2px, transparent 1.2px)', backgroundSize: '34px 34px'}} />
    {arc && <div style={{position: 'absolute', left: -200, right: -200, top: 1180, height: 1100, borderRadius: '50%', background: `radial-gradient(ellipse at 50% 0%, rgba(52,196,110,${0.28 + Math.sin(t * 2) * 0.03}), rgba(31,157,85,0.08) 45%, transparent 70%)`, filter: 'blur(20px)'}} />}
  </AbsoluteFill>
);
/** looping text ribbon ("PROBLEM PROBLEM" style) */
const Ribbon: React.FC<{t: number; y: number; rot: number; word: string; speed: number; blur?: number; op?: number}> = ({t, y, rot, word, speed, blur = 0, op = 1}) => (
  <div style={{position: 'absolute', left: -400, right: -400, top: y, height: 130, background: 'linear-gradient(180deg,#2C2725,#151210)', transform: `rotate(${rot}deg)`, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', filter: blur ? `blur(${blur}px)` : undefined, opacity: op}}>
    <div style={{whiteSpace: 'nowrap', fontFamily: BEBAS, fontSize: 120, lineHeight: '130px', color: '#8F8A86', transform: `translateX(${-((t * speed) % 600)}px)`}}>
      {Array.from({length: 14}).map(() => `${word} `).join('')}
    </div>
  </div>
);

// =========================================================================================
// SHOTS
// =========================================================================================
type ShotFn = (t: number, lt: number) => React.ReactNode;
type Shot = {bg: Bg; arc?: boolean; hud?: boolean; pill?: boolean; draw: ShotFn};

/** realistic paper price tag with a string */
const PriceTag: React.FC<{t: number; at: number; x: number; y: number; price: string; label: string; strikeAt?: number; big?: boolean; rot?: number}> = ({t, at, x, y, price, label, strikeAt, big, rot = 0}) => {
  const p = ep(t, at, 0.5);
  const w = big ? 520 : 420;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: p, transform: `translateY(${(1 - p) * -120}px) rotate(${rot + Math.sin(t * 1.6 + x) * 2}deg)`, transformOrigin: '50% -120px'}}>
      <svg width={w} height="140" style={{position: 'absolute', left: 0, top: -130}}>
        <path d={`M ${w / 2} 0 C ${w / 2 + 30} 50, ${w / 2 - 30} 90, ${w / 2} 132`} fill="none" stroke="#8C7A66" strokeWidth="3" />
      </svg>
      <div style={{position: 'relative', background: big ? '#E7F7EC' : '#FFFFFF', borderRadius: 26, clipPath: `polygon(${w * 0.5 - 70}px 0, ${w * 0.5 + 70}px 0, 100% 60px, 100% 100%, 0 100%, 0 60px)`, padding: '96px 30px 34px', boxShadow: '0 30px 50px rgba(20,40,25,0.18)', border: `3px solid ${big ? OR : '#D9D2C7'}`, textAlign: 'center'}}>
        <div style={{position: 'absolute', left: w / 2 - 16, top: 22, width: 32, height: 32, borderRadius: 16, background: '#F1EEE8', border: '3px solid #B9AE9F'}} />
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', color: '#6E6255'}}>{label}</div>
        <div style={{position: 'relative', display: 'inline-block', fontFamily: BEBAS, fontSize: big ? 170 : 140, lineHeight: 1, color: big ? OR : INK}}>
          {price}
          {strikeAt !== undefined && <div style={{position: 'absolute', left: -10, right: -10, top: '48%', height: 12, background: '#E5484D', transform: `rotate(-6deg) scaleX(${ep(t, strikeAt, 0.3)})`, transformOrigin: 'left'}} />}
        </div>
      </div>
    </div>
  );
};
/** numbered trigger title card: "01 SOCIAL PROOF" */
const TriggerTitle: React.FC<{t: number; n: string; l: number; k: number; k2?: number; top?: number}> = ({t, n, l, k, k2, top = 300}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: BEBAS, fontSize: 300, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `4px ${OR}`, opacity: ep(t, W(l, 0) - 0.1, 0.3), transform: `scale(${lerp(1.3, 1, ep(t, W(l, 0) - 0.1, 0.5))})`}}>{n}</div>
    <Kin t={t} top={top + 270} size={190} rows={[k2 !== undefined ? [[l, k, 'big'], [l, k2, 'big']] : [[l, k, 'big']]]} />
  </>
);

const SHOTS: Shot[] = [
  // 0 · hook: customer buys with the heart, not the brain
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} top={210} size={200} rows={[[[0, 0, 'mid']], [[0, 1, 'it'], [0, 2, 'it'], [0, 3, 'it']], [[0, 4, 'big'], [0, 5, 'big']], [[0, 6], [0, 7]]]} strike={[1, 0, 3]} gap={0} />
        <Hero src={hero('heart')} t={t} x={560} y={1220} w={720} at={W(0, 4) - 0.2} rot={-6} />
        <div style={{position: 'absolute', left: 90, top: 860, opacity: ep(t, W(0, 1) - 0.1, 0.3), transform: `rotate(-8deg) scale(${sp(t, W(0, 1) - 0.1, 1.2)})`}}>
          <div style={{position: 'relative', width: 230, height: 230, borderRadius: 60, background: '#fff', boxShadow: '0 20px 40px rgba(20,40,25,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: t > W(0, 3) ? 'grayscale(0.7)' : 'none'}}>
            <Img src={fl('brain')} style={{width: 170, height: 170}} />
            <div style={{position: 'absolute', inset: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, W(0, 3), 0.2), transform: `scale(${sp(t, W(0, 3), 1.4)})`}}>
              <Img src={fl('cross_mark')} style={{width: 120, height: 120}} />
            </div>
          </div>
        </div>
        <Pill t={t} at={W(0, 6)} x={640} y={1640} col={OR}>❤ Emotion first</Pill>
      </>
    ),
  },
  // 1 · ...then justifies with logic
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={200} size={210} rows={[[[0, 8], [0, 9], [0, 10, 'mid'], [0, 11]], [[0, 12, 'big']], [[0, 13, 'it'], [0, 14, 'it']]]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
          <div style={{width: 300, height: 300, borderRadius: 80, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(20,40,25,0.16)', opacity: ep(t, S[1], 0.3), transform: `scale(${sp(t, S[1], 1.2)})`}}>
            <Img src={hero('heart')} style={{width: 260, height: 260}} />
          </div>
          <div style={{fontFamily: BEBAS, fontSize: 140, color: OR, opacity: ep(t, W(0, 10) - 0.2, 0.3)}}>→</div>
          <div style={{width: 300, height: 300, borderRadius: 80, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(20,40,25,0.16)', opacity: ep(t, W(0, 10) - 0.1, 0.3), transform: `scale(${sp(t, W(0, 10) - 0.1, 1.2)})`}}>
            <Img src={fl('brain')} style={{width: 230, height: 230}} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center', gap: 18}}>
          {['“Reviews ache hain”', '“Price sahi hai”', '“Sab le rahe hain”'].map((s, i) => (
            <div key={s} style={{background: '#fff', border: `2px solid ${INK}`, borderRadius: 30, padding: '12px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 28, color: INK, opacity: ep(t, W(0, 12) + i * 0.2, 0.25), transform: `translateY(${(1 - ep(t, W(0, 12) + i * 0.2, 0.4)) * 30}px)`}}>{s}</div>
          ))}
        </div>
      </>
    ),
  },
  // 2 · 5 psychology triggers
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const items: [string, string][] = [
        ['star', 'Social proof'],
        ['hourglass_not_done', 'Scarcity'],
        ['label', 'Anchoring'],
        ['crown', '3 options'],
        ['wrapped_gift', 'Free value'],
      ];
      return (
        <>
          <Barcode x={450} y={110} seed={5} />
          <Kin t={t} top={220} size={190} rows={[[[1, 0], [1, 1, 'big'], [1, 2, 'big']], [[1, 3, 'big']], [[1, 4, 'it'], [1, 5, 'it']]]} />
          <div style={{position: 'absolute', left: 80, right: 80, top: 860, display: 'flex', flexDirection: 'column', gap: 14}}>
            {items.map(([ic, l], i) => {
              const at = W(1, 2) + i * 0.22;
              return (
                <div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 26, padding: '12px 22px', boxShadow: '0 14px 30px rgba(20,40,25,0.10)', border: '2px solid #E3EAE4', opacity: ep(t, at, 0.25), transform: `translateX(${(1 - ep(t, at, 0.4)) * (i % 2 ? 80 : -80)}px)`}}>
                  <div style={{fontFamily: BEBAS, fontSize: 64, color: OR, width: 70}}>0{i + 1}</div>
                  <Img src={fl(ic)} style={{width: 70, height: 70}} />
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: INK}}>{l}</div>
                </div>
              );
            })}
          </div>
          {t > W(1, 7) && <Pill t={t} at={W(1, 7)} x={300} y={1600} col={OR}><Img src={fl('chart_increasing')} style={{width: 40, height: 40}} /> Sales badal jayegi</Pill>}
        </>
      );
    },
  },
  // 3 · 01 social proof
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <TriggerTitle t={t} n="01" l={2} k={1} k2={2} top={230} />
        <Hero src={hero('star')} t={t} x={540} y={1250} w={760} at={W(2, 1) - 0.2} rot={8} />
      </>
    ),
  },
  // 4 · 500 reviews -> trust without thinking
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const n = Math.round(lerp(0, 500, ep(t, W(2, 4) - 0.2, 1.0)));
      const reviews: [string, string][] = [
        ['Priya S.', 'Bahut accha experience!'],
        ['Rahul M.', 'Value for money 👍'],
        ['Anita K.', 'Sabko recommend karungi'],
      ];
      return (
        <>
          <div style={{position: 'absolute', left: 120, right: 120, top: 210, background: '#fff', borderRadius: 34, padding: '26px 30px', boxShadow: '0 24px 50px rgba(20,40,25,0.14)', border: '2px solid #E3EAE4', display: 'flex', alignItems: 'center', gap: 24, opacity: ep(t, S[4], 0.3)}}>
            <Img src={logo('google')} style={{width: 110, height: 110}} />
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: INK}}>4.8</span>
                {[0, 1, 2, 3, 4].map((k) => (
                  <Img key={k} src={fl('star')} style={{width: 46, height: 46}} />
                ))}
              </div>
              <div style={{fontFamily: SANS, fontSize: 34, color: '#5f6368'}}>
                <b style={{color: OR, fontFamily: BEBAS, fontSize: 60}}>{n}</b> Google reviews
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 520}}>
            {reviews.map(([nm, r], i) => {
              const at = W(2, 5) + i * 0.3;
              return (
                <div key={nm} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 24, padding: '16px 20px', marginBottom: 14, boxShadow: '0 12px 24px rgba(20,40,25,0.08)', border: '2px solid #EEF2EE', opacity: ep(t, at, 0.25), transform: `translateY(${(1 - ep(t, at, 0.4)) * 40}px)`}}>
                  <div style={{width: 60, height: 60, borderRadius: 30, background: ['#E7F7EC', '#EAF1FB', '#FBEFE7'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, color: INK}}>{nm[0]}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: INK}}>{nm} <span style={{color: '#F5B82E'}}>★★★★★</span></div>
                    <div style={{fontFamily: SANS, fontSize: 26, color: '#5f6368'}}>{r}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Kin t={t} top={1040} size={180} rows={[[[2, 8], [2, 9], [2, 10, 'mid'], [2, 11, 'it'], [2, 12, 'it']], [[2, 13, 'big']], [[2, 14], [2, 15]]]} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1480, display: 'flex', justifyContent: 'center', opacity: ep(t, W(2, 13), 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: OR, color: '#fff', borderRadius: 40, padding: '12px 28px', fontFamily: SANS, fontWeight: 700, fontSize: 32}}>
              <Img src={fl('busts_in_silhouette')} style={{width: 48, height: 48}} /> Sab le rahe hain = safe choice
            </div>
          </div>
        </>
      );
    },
  },
  // 5 · 02 scarcity
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <TriggerTitle t={t} n="02" l={3} k={1} top={230} />
        <Hero src={hero('hourglass')} t={t} x={540} y={1230} w={780} at={W(3, 1) - 0.2} />
      </>
    ),
  },
  // 6 · only 3 slots left -> fast decision
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const left = [4, 7, 10];
      return (
        <>
          <Kin t={t} top={190} size={190} rows={[[[3, 2, 'mid'], [3, 3, 'big'], [3, 4, 'big'], [3, 5, 'it'], [3, 6, 'it']]]} />
          <div style={{position: 'absolute', left: 120, right: 120, top: 470, background: '#fff', borderRadius: 34, padding: '24px 26px', boxShadow: '0 24px 50px rgba(20,40,25,0.14)', border: '2px solid #E3EAE4'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK}}>
              <Img src={fl('spiral_calendar')} style={{width: 50, height: 50}} /> Saturday slots
              <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#FDECEC', color: '#E5484D', borderRadius: 20, padding: '6px 14px', fontSize: 24, opacity: ep(t, W(3, 3), 0.2)}}>
                <Img src={fl('fire')} style={{width: 30, height: 30}} /> Only 3 left
              </span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 18}}>
              {Array.from({length: 12}).map((_, i) => {
                const free = left.includes(i);
                const at = S[6] + 0.1 + i * 0.06;
                return (
                  <div key={i} style={{height: 84, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 26, background: free ? '#E7F7EC' : '#F2F2F0', color: free ? OR : '#A8A29A', border: free ? `3px solid ${OR}` : '2px solid #E6E2DA', textDecoration: free ? 'none' : 'line-through', opacity: ep(t, at, 0.2), transform: `scale(${free && t > W(3, 4) ? 1 + Math.sin(t * 8) * 0.04 : 1})`}}>
                    {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00', '1:30', '4:00', '4:30', '5:00', '5:30'][i]}
                  </div>
                );
              })}
            </div>
          </div>
          <Kin t={t} top={1110} size={190} rows={[[[3, 7], [3, 8, 'it'], [3, 9, 'it']], [[3, 10, 'big'], [3, 11, 'big']], [[3, 12, 'it'], [3, 13, 'it'], [3, 14, 'it']]]} />
          <Img src={fl('stopwatch')} style={{position: 'absolute', left: 820, top: 1290, width: 160, height: 160, opacity: ep(t, W(3, 11), 0.2), transform: `rotate(${Math.sin(t * 6) * 8}deg) scale(${sp(t, W(3, 11), 1.3)})`}} />
        </>
      );
    },
  },
  // 7 · 03 anchoring
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <TriggerTitle t={t} n="03" l={4} k={1} top={230} />
        <div style={{position: 'absolute', left: 340, top: 900, width: 400, height: 400, opacity: ep(t, W(4, 1) - 0.2, 0.4), transform: `translateY(${(1 - ep(t, W(4, 1) - 0.2, 0.7)) * 80 + Math.sin(t * 1.4) * 10}px) rotate(${Math.sin(t) * 6}deg)`}}>
          <div style={{position: 'absolute', inset: 10, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #EAF7EE, #CFEBD9 70%)'}} />
          <Img src={fl('anchor')} style={{position: 'absolute', left: 40, top: 40, width: 320, height: 320}} />
        </div>
        <Img src={fl('label')} style={{position: 'absolute', left: 700, top: 1300, width: 200, height: 200, opacity: ep(t, W(4, 1), 0.3), transform: `rotate(-14deg) scale(${sp(t, W(4, 1), 1.3)})`}} />
      </>
    ),
  },
  // 8 · 9,999 first, then 4,999
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={180} size={150} rows={[[[4, 2, 'mid'], [4, 3, 'bigw'], [4, 4, 'it'], [4, 5, 'it'], [4, 6, 'big']]]} />
        <PriceTag t={t} at={W(4, 3) - 0.1} x={80} y={620} price="₹9,999" label="PREMIUM PLAN" strikeAt={W(4, 6)} rot={-6} />
        <PriceTag t={t} at={W(4, 6) - 0.1} x={500} y={700} price="₹4,999" label="SMART PLAN" big rot={5} />
        <Kin t={t} top={1290} size={180} rows={[[[4, 7], [4, 8, 'mid'], [4, 9, 'it'], [4, 10, 'it']], [[4, 11, 'big']], [[4, 12], [4, 13]]]} />
      </>
    ),
  },
  // 9 · 04 three options, people pick the middle
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const plans: [string, string, string][] = [
        ['Basic', '₹1,999', 'package'],
        ['Pro', '₹3,999', 'gem_stone'],
        ['Premium', '₹7,999', 'rocket'],
      ];
      const pick = W(5, 6);
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: BEBAS, fontSize: 200, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `4px ${OR}`, opacity: ep(t, W(5, 0) - 0.1, 0.3)}}>04</div>
          <Kin t={t} top={330} size={180} rows={[[[5, 1, 'big'], [5, 2, 'big'], [5, 3, 'it']], [[5, 4], [5, 5, 'it'], [5, 6, 'mid'], [5, 7, 'mid']], [[5, 8], [5, 9], [5, 10]]]} gap={0} />
          <div style={{position: 'absolute', left: 70, right: 70, top: 830, display: 'flex', gap: 20, alignItems: 'flex-end'}}>
            {plans.map(([n, p, ic], i) => {
              const mid = i === 1;
              const on = mid && t > pick;
              return (
                <div key={n} style={{flex: 1, position: 'relative', background: on ? OR : '#fff', color: on ? '#fff' : INK, borderRadius: 30, padding: mid ? '50px 18px 30px' : '30px 18px', textAlign: 'center', border: on ? 'none' : '2px solid #E3EAE4', boxShadow: on ? '0 30px 60px rgba(31,157,85,0.35)' : '0 16px 30px rgba(20,40,25,0.10)', opacity: ep(t, W(5, 2) + i * 0.15, 0.25), transform: `translateY(${(1 - ep(t, W(5, 2) + i * 0.15, 0.4)) * 60}px) scale(${on ? lerp(1, 1.08, ep(t, pick, 0.4)) : 1})`}}>
                  {on && (
                    <div style={{position: 'absolute', left: 0, right: 0, top: -70, display: 'flex', justifyContent: 'center'}}>
                      <Img src={fl('crown')} style={{width: 110, height: 110, transform: `scale(${sp(t, pick, 1.4)})`}} />
                    </div>
                  )}
                  <Img src={fl(ic)} style={{width: 90, height: 90}} />
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, marginTop: 6}}>{n}</div>
                  <div style={{fontFamily: BEBAS, fontSize: 64, lineHeight: 1}}>{p}</div>
                  {on && <div style={{marginTop: 8, background: '#fff', color: OR, borderRadius: 16, padding: '4px 0', fontFamily: SANS, fontWeight: 800, fontSize: 22}}>MOST CHOSEN</div>}
                </div>
              );
            })}
          </div>
          {t > pick && <Img src={fl('pointer')} style={{position: 'absolute', left: 520, top: lerp(1500, 1260, ep(t, pick, 0.4)), width: 130, height: 130}} />}
        </>
      );
    },
  },
  // 10 · put your best plan in the middle
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={200} size={210} rows={[[[5, 11], [5, 12, 'mid']], [[5, 13, 'big'], [5, 14, 'big']], [[5, 15, 'it'], [5, 16, 'it'], [5, 17, 'it']]]} />
        <div style={{position: 'absolute', left: 90, right: 90, top: 860, display: 'flex', gap: 18, alignItems: 'center'}}>
          {['Good', 'BEST', 'More'].map((n, i) => {
            const mid = i === 1;
            return (
              <div key={n} style={{flex: mid ? 1.4 : 1, height: mid ? 520 : 380, borderRadius: 34, background: mid ? OR : '#fff', border: mid ? 'none' : '2px dashed #C9D3CA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: ep(t, S[10] + i * 0.12, 0.25), boxShadow: mid ? '0 40px 70px rgba(31,157,85,0.35)' : 'none', transform: `scale(${mid ? lerp(0.9, 1, sp(t, W(5, 15), 1.2)) : 1})`}}>
                {mid && <Img src={fl('crown')} style={{width: 120, height: 120}} />}
                <div style={{fontFamily: BEBAS, fontSize: mid ? 120 : 70, color: mid ? '#fff' : '#A8B3A9'}}>{n}</div>
                {mid && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#E7F7EC'}}>your best plan</div>}
              </div>
            );
          })}
        </div>
      </>
    ),
  },
  // 11 · 05 free value first
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: BEBAS, fontSize: 230, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `4px ${OR}`, opacity: ep(t, W(6, 0) - 0.1, 0.3)}}>05</div>
        <Kin t={t} top={370} size={200} rows={[[[6, 1, 'it']], [[6, 2, 'big'], [6, 3, 'big']], [[6, 4, 'it']]]} gap={0} />
        <Hero src={hero('gift')} t={t} x={540} y={1250} w={760} at={W(6, 2) - 0.2} rot={-4} />
      </>
    ),
  },
  // 12 · a tip, a guide, a sample
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const items: [number, string, string, string][] = [
        [6, 'light_bulb', 'TIP', 'Free reel / tip'],
        [8, 'page_facing_up', 'GUIDE', 'Free PDF guide'],
        [10, 'package', 'SAMPLE', 'Free trial / sample'],
      ];
      return (
        <>
          <Kin t={t} top={230} size={140} rows={[[[6, 5], [6, 6, 'big'], [6, 7], [6, 8, 'big'], [6, 9], [6, 10, 'big']]]} />
          <div style={{position: 'absolute', left: 70, right: 70, top: 560, display: 'flex', gap: 22}}>
            {items.map(([k, ic, l, d], i) => (
              <div key={l} style={{flex: 1, background: '#fff', borderRadius: 34, padding: '34px 16px', textAlign: 'center', border: '2px solid #E3EAE4', boxShadow: '0 20px 40px rgba(20,40,25,0.10)', opacity: ep(t, W(6, k) - 0.15, 0.25), transform: `translateY(${(1 - ep(t, W(6, k) - 0.15, 0.45)) * 80}px) rotate(${(i - 1) * 3}deg)`}}>
                <Img src={fl(ic)} style={{width: 180, height: 180}} />
                <div style={{fontFamily: BEBAS, fontSize: 72, color: OR, marginTop: 6}}>{l}</div>
                <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 25, color: INK}}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1160, display: 'flex', justifyContent: 'center', opacity: ep(t, W(6, 10) + 0.3, 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, border: `2px solid ${INK}`, borderRadius: 40, padding: '12px 26px', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, background: '#fff'}}>
              <Img src={logo('whatsapp')} style={{width: 40, height: 40}} /> <Img src={logo('instagram')} style={{width: 40, height: 40}} /> Value pehle, sale baad mein
            </div>
          </div>
        </>
      );
    },
  },
  // 13 · reciprocity: people want to give back
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} top={200} size={200} rows={[[[6, 11, 'mid']], [[6, 12, 'big'], [6, 13, 'big']], [[6, 14], [6, 15], [6, 16], [6, 17]]]} gap={0} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
          <Img src={hero('gift')} style={{width: 300, height: 300, opacity: ep(t, S[13], 0.3), transform: `translateX(${(1 - ep(t, S[13], 0.5)) * -100}px)`}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: ep(t, W(6, 12), 0.3)}}>
            <div style={{fontFamily: BEBAS, fontSize: 90, color: OR, lineHeight: 0.9}}>→</div>
            <div style={{fontFamily: BEBAS, fontSize: 90, color: INK, lineHeight: 0.9}}>←</div>
          </div>
          <Img src={hero('heart')} style={{width: 280, height: 280, opacity: ep(t, W(6, 14), 0.3), transform: `scale(${sp(t, W(6, 14), 1.2)})`}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: ep(t, W(6, 15), 0.3)}}>
          <Img src={fl('handshake')} style={{width: 220, height: 220, transform: `scale(${sp(t, W(6, 15), 1.2)})`}} />
        </div>
        <Pill t={t} at={W(6, 17)} x={330} y={1500} col={OR}>Trust → Sale</Pill>
      </>
    ),
  },
  // 14 · this is not manipulation
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={420} size={210} rows={[[[7, 0], [7, 1, 'it'], [7, 2]], [[7, 3, 'bigw']], [[7, 4, 'big'], [7, 5, 'it']]]} strike={[1, 7, 4]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', gap: 50, alignItems: 'center'}}>
          <div style={{position: 'relative', opacity: ep(t, W(7, 3), 0.3)}}>
            <Img src={fl('magnet')} style={{width: 220, height: 220, filter: t > W(7, 4) ? 'grayscale(1) opacity(0.5)' : 'none'}} />
            <Img src={fl('cross_mark')} style={{position: 'absolute', left: 50, top: 50, width: 120, height: 120, opacity: ep(t, W(7, 4), 0.2), transform: `scale(${sp(t, W(7, 4), 1.4)})`}} />
          </div>
          <div style={{opacity: ep(t, W(7, 4) + 0.2, 0.3), transform: `scale(${sp(t, W(7, 4) + 0.2, 1.3)})`}}>
            <Img src={fl('light_bulb')} style={{width: 240, height: 240}} />
          </div>
        </div>
        <Pill t={t} at={W(7, 4) + 0.3} x={300} y={1380} col={OR}>Samajh, manipulation nahi</Pill>
      </>
    ),
  },
  // 15 · the business that understands customers sells more
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} top={180} size={170} rows={[[[7, 6], [7, 7, 'mid'], [7, 8, 'mid'], [7, 9]], [[7, 10, 'big'], [7, 11, 'it']], [[7, 12], [7, 13, 'big'], [7, 14, 'big'], [7, 15, 'it']]]} gap={0} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20}}>
          <div style={{width: 260, height: 260, borderRadius: 70, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 50px rgba(20,40,25,0.14)', opacity: ep(t, S[15], 0.3)}}>
            <Img src={fl('brain')} style={{width: 200, height: 200}} />
          </div>
          <div style={{fontFamily: BEBAS, fontSize: 120, color: OR, opacity: ep(t, W(7, 10), 0.3)}}>+</div>
          <Img src={hero('heart')} style={{width: 280, height: 280, opacity: ep(t, W(7, 10), 0.3), transform: `scale(${sp(t, W(7, 10), 1.2)})`}} />
        </div>
        <div style={{position: 'absolute', left: 140, right: 140, top: 1220, height: 260, display: 'flex', alignItems: 'flex-end', gap: 26, opacity: ep(t, W(7, 13), 0.3)}}>
          {[0.3, 0.45, 0.62, 0.8, 1].map((h, i) => (
            <div key={i} style={{flex: 1, height: 260 * h * ep(t, W(7, 13) + i * 0.1, 0.5), borderRadius: '14px 14px 4px 4px', background: i === 4 ? OR : '#BFE3CC'}} />
          ))}
          <Img src={fl('chart_increasing')} style={{position: 'absolute', right: -60, top: -110, width: 130, height: 130}} />
        </div>
      </>
    ),
  },
  // 16 · CTA 1: yeh sab hum aapke liye karein?
  {
    bg: 'brown',
    draw: (t) => (
      <>
        <Kin t={t} dark top={560} size={170} rows={[[[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]], [[8, 7, 'big'], [8, 8, 'big'], [8, 9, 'big']], [[8, 10, 'it']]]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', gap: 22}}>
          {['Social proof', 'Smart pricing', 'Free value funnels'].map((s, i) => (
            <div key={s} style={{border: `2px solid ${INK}`, color: INK, background: '#fff', borderRadius: 30, padding: '10px 20px', fontFamily: SANS, fontWeight: 600, fontSize: 25, opacity: ep(t, W(8, 9) + i * 0.15, 0.3)}}>• {s}</div>
          ))}
        </div>
        <Hero src={hero('star')} t={t} x={300} y={1440} w={380} at={W(8, 7)} rot={10} />
        <Hero src={hero('hourglass')} t={t} x={540} y={1460} w={400} at={W(8, 7) + 0.15} />
        <Hero src={hero('gift')} t={t} x={790} y={1450} w={380} at={W(8, 7) + 0.3} rot={-6} />
      </>
    ),
  },
  // 17 · CTA 2: comment "DETAILS", guide on DM
  {
    bg: 'brown',
    draw: (t) => {
      const typeAt = W(8, 14) - 0.3;
      const word = 'DETAILS';
      const typed = word.slice(0, Math.round(clamp01((t - typeAt) / 0.5) * word.length));
      const posted = t > typeAt + 0.7;
      const dm = W(8, 20) - 0.2;
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 60, color: INK, opacity: ep(t, W(8, 11), 0.3)}}>
            Just <span style={{fontWeight: 800}}>comment</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center'}}>
            <span style={{position: 'relative', display: 'inline-block', fontFamily: BEBAS, fontSize: 260, lineHeight: 1, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(8, 14) - 0.1, 0.25), transform: `scale(${lerp(1.2, 1, ep(t, W(8, 14) - 0.1, 0.4))})`}}>
              “DETAILS”
            </span>
            <svg width="700" height="60" style={{position: 'absolute', left: 190, top: 245}}>
              <path d="M 10 40 Q 180 10 360 30 T 690 22" fill="none" stroke={OR} strokeWidth="9" strokeLinecap="round" strokeDasharray="800" strokeDashoffset={800 * (1 - ep(t, W(8, 14) + 0.2, 0.5))} />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 790, height: 110, borderRadius: 55, background: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px 0 30px', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4', opacity: ep(t, W(8, 12), 0.3)}}>
            <Img src={logo('instagram')} style={{width: 52, height: 52}} />
            <span style={{flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: posted ? '#0095F6' : INK}}>
              {typed || <span style={{color: '#999', fontWeight: 400}}>Add a comment…</span>}
              {!posted && t > typeAt && <span style={{opacity: Math.sin(t * 10) > 0 ? 1 : 0}}>|</span>}
              {posted && <span style={{color: '#25D366'}}> ✓ posted</span>}
            </span>
            <div style={{width: 76, height: 76, borderRadius: 38, background: posted ? '#25D366' : '#0095F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>➤</div>
          </div>
          <Kin t={t} dark top={980} size={150} rows={[[[8, 15], [8, 16, 'big'], [8, 17], [8, 18]], [[8, 19, 'mid'], [8, 20, 'big'], [8, 21, 'it'], [8, 22, 'it']]]} />
          {t > dm && (
            <div style={{position: 'absolute', left: 110, right: 110, top: 1380, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.97)', borderRadius: 32, padding: '22px 26px', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4', transform: `translateY(${(1 - ep(t, dm, 0.5)) * -80}px)`, opacity: ep(t, dm, 0.3)}}>
              <Img src={logo('instagram')} style={{width: 64, height: 64}} />
              <div style={{flex: 1, fontFamily: SANS}}>
                <div style={{fontSize: 28, color: INK}}>
                  <b>neuraxine</b> sent you a message · now
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, background: '#F4EFE6', borderRadius: 14, padding: '8px 14px', fontSize: 26, fontWeight: 700, color: INK}}>
                  <div style={{width: 30, height: 38, borderRadius: 5, background: '#E5484D', color: '#fff', fontFamily: MONO, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PDF</div>
                  Customer Psychology Guide.pdf
                </div>
              </div>
            </div>
          )}
        </>
      );
    },
  },
  // 18 · CTA 3: follow Neuraxine
  {
    bg: 'brown',
    draw: (t) => {
      const tap = W(8, 31) + 0.1;
      const done = t > tap;
      return (
        <>
          <Kin t={t} dark top={450} size={230} rows={[[[8, 23], [8, 24], [8, 25], [8, 26, 'mid'], [8, 27], [8, 28]], [[8, 29, 'it'], [8, 30, 'it']], [[8, 31, 'big']]]} gap={6} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', opacity: ep(t, W(8, 29), 0.3)}}>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 40, padding: '20px 24px', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4'}}>
              <div style={{width: 96, height: 96, borderRadius: 48, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={staticFile('brand/logo-alpha.png')} style={{width: 76, height: 57, objectFit: 'contain'}} />
              </div>
              <div style={{fontFamily: SANS}}>
                <div style={{fontWeight: 800, fontSize: 38, color: INK}}>neuraxine</div>
                <div style={{fontSize: 24, color: '#777'}}>AI · Automation · Growth</div>
              </div>
              <div style={{marginLeft: 20, borderRadius: 20, padding: '16px 34px', fontFamily: SANS, fontWeight: 800, fontSize: 32, background: done ? '#EFEFEF' : '#0095F6', color: done ? INK : '#fff', transform: `scale(${done ? lerp(0.88, 1, sp(t, tap, 1.3)) : 1})`}}>{done ? 'Following ✓' : 'Follow'}</div>
              {t > tap - 0.5 && <div style={{position: 'absolute', right: 70, top: 40, width: 60, height: 60, borderRadius: 30, border: '5px solid #fff', boxShadow: '0 0 0 3px rgba(0,0,0,0.2)', transform: `scale(${done ? lerp(0.6, 2.2, ep(t, tap, 0.5)) : lerp(1.4, 0.7, ep(t, tap - 0.5, 0.5))})`, opacity: done ? 1 - ep(t, tap, 0.5) : 0.9}} />}
            </div>
          </div>
        </>
      );
    },
  },
];

// ---- end card ---------------------------------------------------------------------------
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = END_AT;
  const p = ep(t, a, 0.6);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, #FFFFFF 0%, #F4F8F4 60%, #E6EFE7 100%)', opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={staticFile('brand/logo-dark.png')} style={{width: 260, height: 190, objectFit: 'contain', transform: `scale(${lerp(0.6, 1, sp(t, a + 0.1))})`, filter: 'drop-shadow(0 16px 30px rgba(20,40,25,0.2))'}} />
      <div style={{fontFamily: BEBAS, fontSize: 200, lineHeight: 1, marginTop: 10, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, a + 0.25, 0.4)}}>NEURAXINE</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.32em', color: INK, marginTop: 8, opacity: ep(t, a + 0.45, 0.4)}}>COMMENT “DETAILS” FOR THE GUIDE</div>
    </AbsoluteFill>
  );
};

// ---- film -------------------------------------------------------------------------------
const shotAt = (t: number) => {
  let i = 0;
  S.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return i;
};
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const i = shotAt(t);
  const sh = SHOTS[i];
  const lt = t - S[i];
  const dark = false;
  // punch-in cut: quick zoom settle + motion blur on the first frames, then a slow push
  const punch = 1 + (1 - ep(lt, 0, 0.45)) * 0.07 + lt * 0.006;
  const blur = Math.max(0, 1 - lt / 0.12) * 10;
  const flash = Math.max(0, 1 - lt / 0.1);
  const fade = 1 - clamp01((t - (DUR - 0.35)) / 0.35);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fonts />
      <BebasFace />
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{transform: `scale(${punch})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
          <Back bg={sh.bg} t={t} arc={sh.arc} />
          {sh.draw(t, lt)}
        </AbsoluteFill>
        {sh.hud && <CamHud dark={dark} />}
        {sh.pill && <HandlePill dark={dark} />}
        <AbsoluteFill style={{background: '#fff', opacity: i > 0 ? flash * 0.35 : 0, pointerEvents: 'none'}} />
        {/* film grain + vignette */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 65%, rgba(20,40,25,0.10) 100%)', pointerEvents: 'none'}} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
