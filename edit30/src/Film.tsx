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

// ---- Script 5 building blocks --------------------------------------------------------------
const RED = '#E5484D';
type NodeDef = {logo?: string; ic?: string; label: string};
const NODES: NodeDef[] = [
  {ic: 'magnifying_glass_tilted_left', label: 'Apollo'},
  {logo: 'gmail_color', label: 'Email'},
  {logo: 'linkedin', label: 'LinkedIn'},
  {logo: 'vapi', label: 'Vapi'},
  {logo: 'supabase', label: 'CRM'},
  {ic: 'gear', label: 'W6'},
  {ic: 'gear', label: 'W7'},
  {ic: 'gear', label: 'W8'},
  {ic: 'gear', label: 'W9'},
];
/** the 9-workflow ring around the Lead Gen Agent core */
const Ring: React.FC<{t: number; cx?: number; cy: number; r?: number; s?: number; burstAt?: number; lit?: number[]; red?: number; freeze?: boolean; showLabels?: boolean}> = ({t, cx = 540, cy, r = 330, s = 1, burstAt = -10, lit = [], red, freeze, showLabels = true}) => {
  const nodeW = 150 * s;
  const R = r * s;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none', filter: freeze ? 'grayscale(1) contrast(0.9)' : undefined}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        {NODES.map((_, i) => {
          const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
          const k = ep(t, burstAt + i * 0.05, 0.6);
          const x = cx + Math.cos(a) * R * k;
          const y = cy + Math.sin(a) * R * k;
          const hot = red !== undefined && t > red + i * 0.18;
          const on = lit.includes(i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={hot ? RED : on ? OR : '#C9D7CC'} strokeWidth={(on || hot ? 6 : 3) * Math.max(0.6, s)} strokeDasharray={on ? '14 10' : undefined} strokeDashoffset={on ? -t * 80 : 0} />;
        })}
      </svg>
      {/* core */}
      <div style={{position: 'absolute', left: cx - 120 * s, top: cy - 120 * s, width: 240 * s, height: 240 * s, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #5EE39A, ${OR} 60%, #0F6E37)`, boxShadow: `0 0 ${80 * s}px ${20 * s}px rgba(52,196,110,${0.35 + Math.sin(t * 4) * 0.08})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={fl('robot')} style={{width: 100 * s, height: 100 * s}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24 * s, color: '#fff', textAlign: 'center', lineHeight: 1.05}}>Lead Gen<br />Agent</div>
      </div>
      {NODES.map((n, i) => {
        const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
        const k = ep(t, burstAt + i * 0.05, 0.6);
        if (k <= 0) return null;
        const x = cx + Math.cos(a) * R * k;
        const y = cy + Math.sin(a) * R * k;
        const hot = red !== undefined && t > red + i * 0.18;
        const on = lit.includes(i);
        return (
          <div key={i} style={{position: 'absolute', left: x - nodeW / 2, top: y - nodeW / 2, width: nodeW, height: nodeW, borderRadius: '50%', background: hot ? 'rgba(253,236,236,0.95)' : on ? 'rgba(231,247,236,0.95)' : 'rgba(255,255,255,0.78)', border: `${3 * Math.max(0.7, s)}px solid ${hot ? RED : on ? OR : 'rgba(20,40,25,0.12)'}`, boxShadow: hot ? `0 0 40px rgba(229,72,77,0.55)` : on ? `0 0 40px rgba(31,157,85,0.45)` : '0 16px 30px rgba(20,40,25,0.12)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.3, 1, k) * (on ? 1.12 : 1)})`, opacity: k}}>
            {n.logo ? <Img src={logo(n.logo)} style={{width: nodeW * 0.42, height: nodeW * 0.42, objectFit: 'contain'}} /> : <Img src={fl(hot ? 'warning' : n.ic!)} style={{width: nodeW * 0.42, height: nodeW * 0.42}} />}
            {showLabels && <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 21 * Math.max(0.75, s), color: hot ? RED : INK, marginTop: 4 * s}}>{n.label}</div>}
          </div>
        );
      })}
    </div>
  );
};
const COMPANIES: [string, string, string][] = [
  ['Pune Steel Works', 'Manufacturing', 'Pune'],
  ['Shree Logistics', 'Logistics', 'Indore'],
  ['Nova Interiors', 'Interior design', 'Mumbai'],
  ['GreenLeaf Foods', 'FMCG', 'Ahmedabad'],
  ['Arc Dental Chain', 'Healthcare', 'Jaipur'],
  ['BluePeak Realty', 'Real estate', 'Bengaluru'],
];
const CompanyCard: React.FC<{t: number; at: number; c: [string, string, string]; x: number; y: number; w?: number; dim?: boolean; hot?: boolean}> = ({t, at, c, x, y, w = 420, dim, hot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 22, padding: '14px 18px', border: `${hot ? 4 : 2}px solid ${hot ? OR : '#E3EAE4'}`, boxShadow: hot ? '0 20px 40px rgba(31,157,85,0.3)' : '0 12px 24px rgba(20,40,25,0.08)', opacity: ep(t, at, 0.25) * (dim ? 0.4 : 1), transform: `translateY(${(1 - ep(t, at, 0.4)) * 60}px) scale(${hot ? 1.06 : 1})`}}>
    <div style={{width: 58, height: 58, borderRadius: 14, background: '#EEF4EF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={fl(c[1] === 'Manufacturing' ? 'factory' : 'office_building')} style={{width: 42, height: 42}} />
    </div>
    <div style={{minWidth: 0}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: INK, whiteSpace: 'nowrap'}}>{c[0]}</div>
      <div style={{fontFamily: SANS, fontSize: 21, color: '#6E7A70', whiteSpace: 'nowrap'}}>{c[1]} · {c[2]}</div>
    </div>
  </div>
);
const SourceTag: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode}> = ({t, at, x, y, children}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 10, background: INK, color: '#fff', borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: ep(t, at, 0.25), transform: `scale(${t > at ? sp(t, at, 1.3) : 0.6})`}}>{children}</div>
);

const SHOTS: Shot[] = [
  // 0 · hook: 4 tasks get sucked into the Lead Gen Agent
  {
    bg: 'peach',
    arc: true,
    draw: (t) => {
      const suck = W(0, 8);
      const tasks: [string, string, number, number, number][] = [
        ['fl:magnifying_glass_tilted_left', 'Lead dhoondhna', 0.05, -150, 820],
        ['gmail_color', 'Email', W(0, 2), 150, 820],
        ['linkedin', 'LinkedIn msg', W(0, 3), -150, 1160],
        ['fl:telephone_receiver', 'Call', W(0, 5), 150, 1160],
      ];
      const core = ep(t, suck - 0.1, 0.5);
      return (
        <>
          <Kin t={t} top={150} size={130} rows={[[[0, 0, 'mid'], [0, 1, 'mid'], [0, 2, 'mid']], [[0, 3, 'mid'], [0, 4, 'mid'], [0, 5, 'mid']], [[0, 6], [0, 7], [0, 8], [0, 9, 'big'], [0, 10], [0, 11]]]} gap={4} />
          {tasks.map(([ic, l, at, dx, y], i) => {
            const k = clamp01((t - suck - i * 0.06) / 0.45);
            const e = k * k;
            const x0 = 540 + dx * 2.2;
            const x = lerp(x0, 540, e);
            const yy = lerp(y, 990, e);
            return (
              <div key={l} style={{position: 'absolute', left: x - 120, top: yy - 120, width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: ep(t, at - 0.05, 0.2) * (1 - k), transform: `scale(${(t > at ? sp(t, at - 0.05, 1.3) : 0.4) * (1 - e * 0.8)}) rotate(${e * 200}deg)`}}>
                <div style={{width: 180, height: 180, borderRadius: 48, background: '#fff', border: '2px solid #E3EAE4', boxShadow: '0 20px 40px rgba(20,40,25,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={ic.startsWith('fl:') ? fl(ic.slice(3)) : logo(ic)} style={{width: 110, height: 110, objectFit: 'contain'}} />
                </div>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: INK, marginTop: 10}}>{l}</div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 540 - 150, top: 990 - 150, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #5EE39A, ${OR} 60%, #0F6E37)`, boxShadow: `0 0 ${60 + core * 80}px ${10 + core * 30}px rgba(52,196,110,0.4)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: ep(t, W(0, 6), 0.3), transform: `scale(${lerp(0.5, 1, ep(t, W(0, 6), 0.5)) * (1 + Math.max(0, Math.sin((t - suck) * 12)) * 0.06 * (t > suck && t < suck + 0.8 ? 1 : 0))})`}}>
            <Img src={fl('robot')} style={{width: 130, height: 130}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff', textAlign: 'center', lineHeight: 1.05}}>Lead Gen<br />Agent</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1360, textAlign: 'center'}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: INK, opacity: ep(t, W(0, 12) - 0.1, 0.3)}}>Main nahi.</div>
            <div style={{fontFamily: BEBAS, fontSize: 130, lineHeight: 0.95, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transform: `scale(${1 + Math.max(0, 1 - Math.abs(t - W(0, 12)) / 0.25) * 0.08})`}}>
              9 WORKFLOWS.<br />
              <span style={{color: INK, WebkitTextFillColor: INK}}>0 COLD CALLING.</span>
            </div>
          </div>
        </>
      );
    },
  },
  // 1 · core explodes into 9 glass nodes
  {
    bg: 'peach',
    pill: true,
    draw: (t) => (
      <>
        <Kin t={t} top={180} size={200} rows={[[[1, 0, 'big'], [1, 1, 'big'], [1, 2, 'it']], [[1, 3], [1, 4], [1, 5, 'mid'], [1, 6, 'mid'], [1, 7]]]} gap={4} />
        <Ring t={t} cy={1080} burstAt={S[1] + 0.1} />
      </>
    ),
  },
  // 2 · node 1: Apollo target list, company cards stream in
  {
    bg: 'peach',
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={150} size={170} rows={[[[2, 0, 'it'], [2, 1, 'big'], [2, 2, 'it']], [[2, 3, 'mid'], [2, 4, 'mid'], [2, 5], [2, 6, 'big']]]} gap={0} />
        <Ring t={t} cy={690} s={0.5} lit={[0]} showLabels={false} />
        <SourceTag t={t} at={W(2, 1)} x={640} y={560}>
          <Img src={fl('magnifying_glass_tilted_left')} style={{width: 34, height: 34}} /> Apollo
        </SourceTag>
        {COMPANIES.map((c, i) => (
          <CompanyCard key={c[0]} t={t} at={W(2, 3) + i * 0.18} c={c} x={i % 2 ? 560 : 80} y={930 + Math.floor(i / 2) * 140} w={440} />
        ))}
        <Pill t={t} at={W(2, 6)} x={330} y={1380} col={OR}>Target list ready ✓</Pill>
      </>
    ),
  },
  // 3 · node 2: personalised email sequence
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={160} size={170} rows={[[[3, 0], [3, 1], [3, 2, 'mid'], [3, 3], [3, 4]], [[3, 5, 'big']], [[3, 6, 'mid'], [3, 7, 'it']]]} gap={0} />
        <Ring t={t} cy={790} s={0.45} lit={[0, 1]} showLabels={false} />
        <div style={{position: 'absolute', left: 90, right: 90, top: 1030, display: 'flex', alignItems: 'center', gap: 12}}>
          {[
            ['Email 1', 'Day 1'],
            ['Follow-up', 'Day 3'],
            ['Follow-up', 'Day 7'],
          ].map(([a, b], i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{fontFamily: BEBAS, fontSize: 60, color: OR, opacity: ep(t, W(3, 7) + i * 0.2, 0.2)}}>→</div>}
              <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 22, padding: '16px 16px', border: '2px solid #E3EAE4', boxShadow: '0 12px 24px rgba(20,40,25,0.08)', opacity: ep(t, W(3, 6) + i * 0.2, 0.25), transform: `translateY(${(1 - ep(t, W(3, 6) + i * 0.2, 0.4)) * 40}px)`}}>
                <Img src={logo('gmail_color')} style={{width: 44, height: 44, objectFit: 'contain'}} />
                <div>
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: INK}}>{a}</div>
                  <div style={{fontFamily: MONO, fontSize: 20, color: '#6E7A70'}}>{b}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </>
    ),
  },
  // 4 · "Dear Sir" crossed out, a personalised line types in
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const line = 'Hi Rohan, Pune plant ke naye expansion wali post dekhi. Ek idea share karun?';
      const tA = W(3, 12) + 0.1;
      const typed = line.slice(0, Math.round(clamp01((t - tA) / 0.9) * line.length));
      return (
        <>
          <Kin t={t} top={150} size={190} rows={[[[3, 8], [3, 9, 'it']], [[3, 10, 'bigw'], [3, 11, 'bigw']], [[3, 12, 'big']]]} strike={[1, 3, 12]} gap={0} />
          <div style={{position: 'absolute', left: 90, right: 90, top: 690, background: '#fff', borderRadius: 30, overflow: 'hidden', border: '2px solid #E3EAE4', boxShadow: '0 30px 60px rgba(20,40,25,0.14)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderBottom: '1px solid #EEF1EE'}}>
              <Img src={logo('gmail_color')} style={{width: 50, height: 50, objectFit: 'contain'}} />
              <b style={{fontFamily: SANS, fontSize: 30, color: INK}}>New message</b>
              <span style={{marginLeft: 'auto', fontFamily: SANS, fontSize: 24, color: '#6E7A70'}}>To: rohan@punesteel…</span>
            </div>
            <div style={{padding: '26px 28px 34px', fontFamily: SANS, fontSize: 38, lineHeight: 1.35, color: INK, minHeight: 300}}>
              <span style={{position: 'relative', display: 'inline-block', color: t > W(3, 12) ? '#A8A29A' : INK}}>
                Dear Sir,
                <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 6, background: RED, transform: `scaleX(${ep(t, W(3, 12), 0.3)})`, transformOrigin: 'left'}} />
              </span>
              <div style={{color: OR, fontWeight: 600, marginTop: 14}}>
                {typed}
                {t > tA && typed.length < line.length && <span style={{opacity: Math.sin(t * 12) > 0 ? 1 : 0}}>|</span>}
              </div>
            </div>
          </div>
          <Pill t={t} at={tA + 0.9} x={300} y={1180} col={OR}>✓ Personalised for every lead</Pill>
        </>
      );
    },
  },
  // 5 · node 3: LinkedIn outreach via Unipile
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={170} size={160} rows={[[[4, 0, 'big'], [4, 1, 'big']], [[4, 2, 'mid'], [4, 3, 'it']]]} gap={0} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center', opacity: ep(t, S[5], 0.3)}}>
          <Img src={logo('linkedin')} style={{width: 120, height: 120}} />
          <SourceTag t={t} at={W(4, 2)} x={0} y={0}>via Unipile</SourceTag>
        </div>
        {[
          ['Rohan Mehta', 'Founder · Pune Steel Works'],
          ['Kavya Shah', 'Head of Ops · Shree Logistics'],
          ['Arjun Rao', 'Director · BluePeak Realty'],
        ].map(([n, r], i) => {
          const at = W(4, 0) + 0.3 + i * 0.35;
          const sent = t > at + 0.9;
          return (
            <div key={n} style={{position: 'absolute', left: 90, right: 90, top: 760 + i * 190, display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 26, padding: '20px 24px', border: '2px solid #E3EAE4', boxShadow: '0 14px 28px rgba(20,40,25,0.10)', opacity: ep(t, at, 0.25), transform: `translateX(${(1 - ep(t, at, 0.4)) * 120}px)`}}>
              <div style={{width: 84, height: 84, borderRadius: 42, background: ['#DCE8F7', '#F7E6DC', '#E2F3E6'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#0A66C2'}}>{n[0]}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK}}>{n}</div>
                <div style={{fontFamily: SANS, fontSize: 23, color: '#6E7A70'}}>{r}</div>
              </div>
              <div style={{borderRadius: 30, padding: '12px 26px', fontFamily: SANS, fontWeight: 800, fontSize: 26, border: sent ? 'none' : '2px solid #0A66C2', background: sent ? '#E7F7EC' : '#fff', color: sent ? OR : '#0A66C2', transform: `scale(${sent ? lerp(0.85, 1, sp(t, at + 0.9, 1.3)) : 1})`}}>{sent ? 'Pending ✓' : '+ Connect'}</div>
            </div>
          );
        })}
        <Ring t={t} cy={1560} s={0.32} lit={[0, 1, 2]} showLabels={false} />
      </>
    ),
  },
  // 6 · node 4: Vapi AI voice agent, purple-cyan waveform
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const secs = Math.max(0, Math.floor((t - W(5, 2)) * 4) + 8);
      return (
        <>
          <Kin t={t} top={170} size={200} rows={[[[5, 0], [5, 1, 'it']], [[5, 2, 'big'], [5, 3, 'it'], [5, 4, 'big']], [[5, 5, 'mid'], [5, 6, 'mid']]]} gap={0} />
          <div style={{position: 'absolute', left: 90, right: 90, top: 760, background: '#fff', borderRadius: 34, padding: '26px 28px', border: '2px solid #E3EAE4', boxShadow: '0 30px 60px rgba(20,40,25,0.14)', opacity: ep(t, W(5, 2) - 0.1, 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <Img src={logo('vapi')} style={{width: 90, height: 60, objectFit: 'contain'}} />
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK}}>AI voice agent · calling</div>
                <div style={{fontFamily: SANS, fontSize: 24, color: '#6E7A70'}}>Rohan Mehta · Pune Steel Works</div>
              </div>
              <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: OR}}>00:{String(secs).padStart(2, '0')}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 220, marginTop: 20}}>
              {Array.from({length: 46}).map((_, i) => {
                const h = 20 + Math.abs(Math.sin(t * 7 + i * 0.55) * Math.sin(t * 3.1 + i * 0.21)) * 190 * ep(t, W(5, 4), 0.4);
                const c = i / 45;
                return <div key={i} style={{flex: 1, height: h, borderRadius: 6, background: `linear-gradient(180deg, hsl(${270 - c * 80},85%,62%), hsl(${190 - c * 10},90%,55%))`}} />;
              })}
            </div>
          </div>
          <Img src={fl('telephone_receiver')} style={{position: 'absolute', left: 820, top: 1190, width: 160, height: 160, transform: `rotate(${Math.sin(t * 18) * 8}deg)`, opacity: ep(t, W(5, 1), 0.3)}} />
          <Ring t={t} cy={1560} s={0.32} lit={[0, 1, 2, 3]} showLabels={false} />
        </>
      );
    },
  },
  // 7 · everything syncs into the Supabase CRM dashboard
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const cols = ['New', 'Contacted', 'Replied', 'Meeting', 'Won'];
      const leads: [string, number[]][] = [
        ['Rohan · Pune Steel', [3, 3]],
        ['Kavya · Shree Log.', [2, 3]],
        ['Arjun · BluePeak', [1, 2]],
        ['Nova Interiors', [1, 1]],
        ['GreenLeaf Foods', [0, 1]],
        ['Arc Dental', [0, 0]],
      ];
      const move = W(6, 7);
      return (
        <>
          <Kin t={t} top={140} size={120} rows={[[[6, 0], [6, 1], [6, 2, 'big'], [6, 3, 'big'], [6, 4], [6, 5, 'it']], [[6, 6], [6, 7, 'mid'], [6, 8], [6, 9], [6, 10]], [[6, 11, 'big'], [6, 12, 'big'], [6, 13, 'it']]]} gap={2} />
          <div style={{position: 'absolute', left: 50, right: 50, top: 640, background: '#fff', borderRadius: 30, border: '2px solid #E3EAE4', boxShadow: '0 30px 60px rgba(20,40,25,0.14)', overflow: 'hidden', opacity: ep(t, W(6, 2) - 0.2, 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderBottom: '1px solid #EEF1EE'}}>
              <Img src={logo('supabase')} style={{width: 46, height: 46, objectFit: 'contain'}} />
              <b style={{fontFamily: SANS, fontSize: 30, color: INK}}>Supabase CRM · Pipeline</b>
              <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 20, color: OR}}>● LIVE SYNC</span>
            </div>
            <div style={{display: 'flex', gap: 10, padding: 14, height: 660}}>
              {cols.map((c, ci) => (
                <div key={c} style={{flex: 1, background: '#F5F8F5', borderRadius: 18, padding: 10}}>
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 21, color: ci === 4 ? OR : INK, marginBottom: 10}}>{c}</div>
                  {leads.map(([n, [a, b]], li) => {
                    const col = t > move + li * 0.15 ? b : a;
                    if (col !== ci) return null;
                    return (
                      <div key={n} style={{background: '#fff', borderRadius: 12, padding: '10px 8px', marginBottom: 8, border: `2px solid ${ci === 4 ? OR : '#E3EAE4'}`, fontFamily: SANS, fontWeight: 700, fontSize: 17, color: INK, opacity: ep(t, W(6, 2) + li * 0.12, 0.25), transform: `scale(${t > move + li * 0.15 && a !== b ? lerp(0.8, 1, sp(t, move + li * 0.15, 1.3)) : 1})`}}>{n}</div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1440, display: 'flex', justifyContent: 'center', gap: 24, opacity: ep(t, W(6, 4), 0.3)}}>
            {['gmail_color', 'linkedin', 'vapi'].map((l, i) => (
              <div key={l} style={{width: 110, height: 110, borderRadius: 30, background: '#fff', border: '2px solid #E3EAE4', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-Math.abs(Math.sin(t * 3 + i)) * 16}px)`}}>
                <Img src={logo(l)} style={{width: 62, height: 62, objectFit: 'contain'}} />
              </div>
            ))}
            <div style={{fontFamily: BEBAS, fontSize: 90, color: OR}}>→</div>
            <div style={{width: 110, height: 110, borderRadius: 30, background: '#E7F7EC', border: `3px solid ${OR}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={logo('supabase')} style={{width: 62, height: 62, objectFit: 'contain'}} />
            </div>
          </div>
        </>
      );
    },
  },
  // 8 · honest twist: not set-and-forget (freeze + red outline)
  {
    bg: 'peach',
    draw: (t) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 8);
      return (
        <>
          <Ring t={t} cy={1180} lit={[0, 1, 2, 3, 4]} freeze />
          <Kin t={t} top={170} size={200} rows={[[[7, 0], [7, 1, 'mid'], [7, 2, 'it']], [[7, 3], [7, 4, 'bigw'], [7, 5, 'it'], [7, 6, 'bigw']], [[7, 7, 'big'], [7, 8, 'it']]]} strike={[1, 7, 7]} gap={0} />
          <AbsoluteFill style={{border: `${12 + pulse * 6}px solid rgba(229,72,77,${0.6 + pulse * 0.3})`, opacity: ep(t, W(7, 3), 0.15), pointerEvents: 'none'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1560, display: 'flex', justifyContent: 'center', opacity: ep(t, W(7, 7), 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#FDECEC', color: RED, borderRadius: 30, padding: '12px 28px', fontFamily: SANS, fontWeight: 800, fontSize: 32}}>
              <Img src={fl('warning')} style={{width: 44, height: 44}} /> Human check zaroori hai
            </div>
          </div>
        </>
      );
    },
  },
  // 9 · wrong list -> 9 workflows spam the wrong people, fast
  {
    bg: 'peach',
    draw: (t) => (
      <>
        <Ring t={t} cy={1080} r={310} red={W(8, 4) - 0.2} lit={[]} />
        <Kin t={t} top={150} size={180} rows={[[[8, 0, 'big'], [8, 1, 'big'], [8, 2, 'it']], [[8, 3], [8, 4, 'mid'], [8, 5, 'mid'], [8, 6]], [[8, 7], [8, 8], [8, 9]]]} gap={0} />
        {Array.from({length: 18}).map((_, i) => {
          const at = W(8, 10) + i * 0.08;
          if (t < at) return null;
          const a = rnd(i * 7) * Math.PI * 2;
          const d = 260 + ((t - at) * 520);
          return <Img key={i} src={fl(i % 3 ? 'envelope' : 'warning')} style={{position: 'absolute', left: 540 + Math.cos(a) * d - 40, top: 1050 + Math.sin(a) * d * 0.9 - 40, width: 80, height: 80, opacity: Math.max(0, 1 - (t - at) / 1.4), transform: `rotate(${(t - at) * 200}deg)`}} />;
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1530, textAlign: 'center', opacity: ep(t, W(8, 10), 0.25)}}>
          <span style={{fontFamily: BEBAS, fontSize: 150, color: RED, letterSpacing: '0.02em'}}>SPAM.</span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: INK, marginLeft: 20, opacity: ep(t, W(8, 12), 0.3)}}>bas tezi se.</span>
        </div>
      </>
    ),
  },
  // 10 · system gives speed, you pick the right target (crosshair lock)
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const lock = W(9, 5);
      const k = eio(t, lock - 0.3, 0.6);
      const tx = 560 + 210;
      const ty = 980 + 70;
      const cx = lerp(300, tx, k);
      const cy = lerp(1500, ty, k);
      return (
        <>
          <Kin t={t} top={150} size={170} rows={[[[9, 0, 'mid'], [9, 1, 'big'], [9, 2], [9, 3]], [[9, 4, 'big'], [9, 5, 'big']], [[9, 6], [9, 7], [9, 8, 'it'], [9, 9, 'it']]]} gap={0} />
          {COMPANIES.map((c, i) => (
            <CompanyCard key={c[0]} t={t} at={S[10] + i * 0.08} c={c} x={i % 2 ? 560 : 80} y={840 + Math.floor(i / 2) * 140} w={440} dim={t > lock && i !== 1} hot={t > lock + 0.2 && i === 1} />
          ))}
          <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: ep(t, W(9, 4), 0.3)}}>
            <circle cx={cx} cy={cy} r={lerp(120, 70, k)} fill="none" stroke={OR} strokeWidth="6" />
            <circle cx={cx} cy={cy} r={8} fill={OR} />
            {[0, 1, 2, 3].map((q) => {
              const a = (q * Math.PI) / 2;
              const r1 = lerp(140, 90, k);
              return <line key={q} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * (r1 + 50)} y2={cy + Math.sin(a) * (r1 + 50)} stroke={OR} strokeWidth="6" strokeLinecap="round" />;
            })}
          </svg>
          {t > lock + 0.3 && <Pill t={t} at={lock + 0.3} x={250} y={1340} col={OR}><Img src={fl('bullseye')} style={{width: 40, height: 40}} /> Target locked: right ICP</Pill>}
        </>
      );
    },
  },
  // 11 · CTA: DM "LEADS"
  {
    bg: 'peach',
    arc: true,
    draw: (t) => {
      const typeAt = W(10, 9) - 0.3;
      const word = 'LEADS';
      const typed = word.slice(0, Math.round(clamp01((t - typeAt) / 0.4) * word.length));
      const sent = t > typeAt + 0.6;
      return (
        <>
          <Kin t={t} top={220} size={190} rows={[[[10, 0], [10, 1, 'big'], [10, 2, 'big'], [10, 3]], [[10, 4], [10, 5, 'mid'], [10, 6, 'it']]]} gap={0} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: ep(t, W(10, 7) - 0.2, 0.3)}}>
            <div style={{fontFamily: BEBAS, fontSize: 230, lineHeight: 1, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transform: `scale(${lerp(1.2, 1, ep(t, W(10, 7) - 0.2, 0.4))})`}}>DM: “LEADS”</div>
          </div>
          <div style={{position: 'absolute', left: 110, right: 110, top: 940, background: '#fff', borderRadius: 34, overflow: 'hidden', border: '2px solid #E3EAE4', boxShadow: '0 30px 60px rgba(20,40,25,0.16)', opacity: ep(t, W(10, 7), 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderBottom: '1px solid #EEF1EE'}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={staticFile('brand/logo-alpha.png')} style={{width: 50, height: 38, objectFit: 'contain'}} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK}}>neuraxine</div>
                <div style={{fontFamily: SANS, fontSize: 22, color: '#6E7A70'}}>Instagram · Message</div>
              </div>
              <Img src={logo('instagram')} style={{width: 50, height: 50}} />
            </div>
            <div style={{padding: '24px 22px', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12}}>
              {sent && <div style={{background: 'linear-gradient(90deg,#7B3FE4,#3797F0)', color: '#fff', borderRadius: 26, padding: '14px 26px', fontFamily: SANS, fontWeight: 800, fontSize: 36, transform: `scale(${sp(t, typeAt + 0.6, 1.3)})`, transformOrigin: 'right center'}}>LEADS</div>}
              {sent && t > typeAt + 1.2 && <div style={{alignSelf: 'flex-start', background: '#EFEFEF', color: INK, borderRadius: 26, padding: '12px 22px', fontFamily: SANS, fontSize: 28, opacity: ep(t, typeAt + 1.2, 0.3)}}>Hey! Setup details bhej raha hoon 👇</div>}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, margin: '0 18px 18px', border: '2px solid #E3EAE4', borderRadius: 40, padding: '12px 14px 12px 24px'}}>
              <span style={{flex: 1, fontFamily: SANS, fontSize: 32, fontWeight: 700, color: sent ? '#A8A29A' : INK}}>{sent ? 'Message…' : typed || <span style={{color: '#A8A29A', fontWeight: 400}}>Message…</span>}</span>
              <div style={{background: '#3797F0', color: '#fff', borderRadius: 20, padding: '10px 22px', fontFamily: SANS, fontWeight: 800, fontSize: 26}}>Send</div>
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
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: '0.28em', color: INK, marginTop: 8, opacity: ep(t, a + 0.45, 0.4)}}>DM: “LEADS”</div>
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
  const punch = 1 + (i > 0 ? (1 - ep(lt, 0, 0.45)) * 0.07 : 0) + lt * 0.006;
  const blur = i > 0 ? Math.max(0, 1 - lt / 0.12) * 10 : 0;
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
