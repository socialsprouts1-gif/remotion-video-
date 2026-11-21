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

/** "01" outline number + kinetic title rows */
const NumTitle: React.FC<{t: number; n: string; at: number; rows: Tok[][]; size?: number; top?: number}> = ({t, n, at, rows, size = 180, top = 200}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: BEBAS, fontSize: 260, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `4px ${OR}`, opacity: ep(t, at - 0.1, 0.3), transform: `scale(${lerp(1.3, 1, ep(t, at - 0.1, 0.5))})`}}>{n}</div>
    <Kin t={t} top={top + 240} size={size} rows={rows} gap={0} />
  </>
);
/** a WhatsApp-style lead row */
const LeadRow: React.FC<{name: string; msg: string; time: string; unread?: number; t: number; at: number}> = ({name, msg, time, unread, t, at}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderBottom: '1px solid #EEF1EE', opacity: ep(t, at, 0.25), transform: `translateX(${(1 - ep(t, at, 0.35)) * 40}px)`}}>
    <div style={{width: 64, height: 64, borderRadius: 32, background: '#DDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#3F5446'}}>{name[0]}</div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#111B21'}}>{name}</div>
      <div style={{fontFamily: SANS, fontSize: 24, color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{msg}</div>
    </div>
    <div style={{textAlign: 'right'}}>
      <div style={{fontFamily: SANS, fontSize: 20, color: unread ? '#25D366' : '#667781'}}>{time}</div>
      {unread ? <div style={{marginTop: 6, marginLeft: 'auto', width: 34, height: 34, borderRadius: 17, background: '#25D366', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{unread}</div> : null}
    </div>
  </div>
);
const IconCard: React.FC<{t: number; at: number; ic: string; x: number; y: number; w?: number; cross?: number; rot?: number}> = ({t, at, ic, x, y, w = 260, cross, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w, borderRadius: w * 0.26, background: '#fff', boxShadow: '0 24px 50px rgba(20,40,25,0.14)', border: '2px solid #E3EAE4', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, at, 0.3), transform: `scale(${t > at ? sp(t, at, 1.2) : 0.6}) rotate(${rot + Math.sin(t * 1.3 + x) * 2}deg)`, filter: cross !== undefined && t > cross ? 'grayscale(0.8)' : 'none'}}>
    <Img src={fl(ic)} style={{width: w * 0.68, height: w * 0.68}} />
    {cross !== undefined && <Img src={fl('cross_mark')} style={{position: 'absolute', width: w * 0.5, height: w * 0.5, opacity: ep(t, cross, 0.2), transform: `scale(${sp(t, cross, 1.4)})`}} />}
  </div>
);

const SHOTS: Shot[] = [
  // 0 · hook: leads keep coming, no sales
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} top={180} size={190} rows={[[[0, 0, 'mid'], [0, 1], [0, 2], [0, 3], [0, 4, 'it']], [[0, 5, 'big'], [0, 6, 'big']], [[0, 7, 'it'], [0, 8, 'it']]]} gap={0} />
        <div style={{position: 'absolute', left: 110, right: 110, top: 720, background: '#fff', borderRadius: 34, overflow: 'hidden', boxShadow: '0 30px 60px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#008069', color: '#fff', padding: '18px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 30}}>
            <Img src={logo('whatsapp_white')} style={{width: 44, height: 44}} /> WhatsApp · Leads
            <span style={{marginLeft: 'auto', fontSize: 22, opacity: 0.85}}>Unread</span>
          </div>
          <LeadRow t={t} at={0.2} name="Rohit" msg="Price kya hai?" time="9:41 PM" unread={2} />
          <LeadRow t={t} at={0.45} name="Neha" msg="Details bhejiye please" time="8:15 PM" unread={1} />
          <LeadRow t={t} at={0.7} name="Amit" msg="Kal call kar sakte hain?" time="Yesterday" unread={3} />
          <LeadRow t={t} at={0.95} name="Sana" msg="Available hai?" time="Yesterday" unread={1} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center', gap: 20, opacity: ep(t, W(0, 6), 0.3)}}>
          <Img src={fl('chart_decreasing')} style={{width: 150, height: 150, transform: `scale(${sp(t, W(0, 6), 1.3)})`}} />
          <Img src={fl('money_with_wings')} style={{width: 150, height: 150, transform: `translateY(${-Math.abs(Math.sin(t * 2)) * 20}px)`}} />
        </div>
      </>
    ),
  },
  // 1 · not marketing, it's follow-up
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={220} size={170} rows={[[[0, 9, 'mid']], [[0, 10, 'bigw'], [0, 11, 'it'], [0, 12, 'it']], [[0, 13, 'big']], [[0, 14, 'it'], [0, 15, 'it']]]} strike={[1, 0, 12]} gap={0} />
        <IconCard t={t} at={W(0, 10) - 0.1} ic="magnet" x={130} y={1080} cross={W(0, 12)} rot={-6} />
        <div style={{position: 'absolute', left: 430, top: 1160, fontFamily: BEBAS, fontSize: 130, color: OR, opacity: ep(t, W(0, 13) - 0.1, 0.3)}}>→</div>
        <IconCard t={t} at={W(0, 13) - 0.1} ic="repeat_button" x={640} y={1060} w={300} rot={5} />
      </>
    ),
  },
  // 2 · 5 mistakes checklist
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const items: [string, string][] = [
        ['stopwatch', 'Late reply'],
        ['repeat_button', 'Sirf ek follow-up'],
        ['label', 'Price pehle, value baad'],
        ['star', 'Koi proof nahi'],
        ['pointer', 'Next step clear nahi'],
      ];
      return (
        <>
          <Barcode x={450} y={110} seed={9} />
          <Kin t={t} top={220} size={200} rows={[[[1, 0], [1, 1, 'big'], [1, 2, 'big']], [[1, 3, 'it'], [1, 4, 'it']]]} />
          <div style={{position: 'absolute', left: 80, right: 80, top: 690, display: 'flex', flexDirection: 'column', gap: 14}}>
            {items.map(([ic, l], i) => {
              const at = W(1, 2) + i * 0.2;
              return (
                <div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 26, padding: '14px 22px', boxShadow: '0 14px 30px rgba(20,40,25,0.10)', border: '2px solid #E3EAE4', opacity: ep(t, at, 0.25), transform: `translateX(${(1 - ep(t, at, 0.4)) * (i % 2 ? 80 : -80)}px)`}}>
                  <div style={{fontFamily: BEBAS, fontSize: 64, color: OR, width: 70}}>0{i + 1}</div>
                  <Img src={fl(ic)} style={{width: 72, height: 72}} />
                  <div style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 36, color: INK}}>{l}</div>
                  <Img src={fl('cross_mark')} style={{width: 46, height: 46, opacity: ep(t, at + 0.3, 0.2)}} />
                </div>
              );
            })}
          </div>
          <Img src={fl('clipboard')} style={{position: 'absolute', left: 820, top: 1480, width: 170, height: 170, transform: `rotate(10deg) scale(${sp(t, W(1, 3), 1.2)})`, opacity: ep(t, W(1, 3), 0.3)}} />
        </>
      );
    },
  },
  // 3 · 01 late reply
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <NumTitle t={t} n="01" at={W(2, 0)} rows={[[[2, 1, 'big'], [2, 2, 'big']]]} size={200} />
        <Hero src={hero('hourglass')} t={t} x={540} y={1200} w={740} at={W(2, 1) - 0.2} />
        <Img src={fl('sleeping_face')} style={{position: 'absolute', left: 760, top: 900, width: 170, height: 170, opacity: ep(t, W(2, 2), 0.3), transform: `rotate(12deg) scale(${sp(t, W(2, 2), 1.3)})`}} />
      </>
    ),
  },
  // 4 · reply in 5 minutes -> many times more closes
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={170} size={170} rows={[[[2, 3], [2, 4, 'mid']], [[2, 5, 'big'], [2, 6, 'big']], [[2, 7], [2, 8, 'mid'], [2, 9], [2, 10]]]} gap={0} />
        <div style={{position: 'absolute', left: 80, right: 80, top: 640, display: 'flex', gap: 20}}>
          {[
            {ok: true, t1: 'Reply in 2 min', b: 'Ji, aaj 5 PM slot free hai. Book kar doon?', res: 'Deal closed ✓', at: W(2, 5)},
            {ok: false, t1: 'Reply after 6 hrs', b: 'Sorry late reply… aap interested ho?', res: 'Lead lost ✕', at: W(2, 9)},
          ].map((c, i) => (
            <div key={i} style={{flex: 1, background: '#EFEAE2', borderRadius: 30, padding: 18, border: `3px solid ${c.ok ? '#25D366' : '#E5484D'}`, opacity: ep(t, c.at, 0.3), transform: `translateY(${(1 - ep(t, c.at, 0.4)) * 60}px)`, boxShadow: '0 20px 40px rgba(20,40,25,0.12)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: c.ok ? '#128C7E' : '#E5484D'}}>
                <Img src={fl(c.ok ? 'stopwatch' : 'sleeping_face')} style={{width: 40, height: 40}} /> {c.t1}
              </div>
              <div style={{background: '#fff', borderRadius: 18, padding: '10px 14px', marginTop: 10, fontFamily: SANS, fontSize: 24, color: '#111B21'}}>Price kya hai? 🙂</div>
              <div style={{background: '#D9FDD3', borderRadius: 18, padding: '10px 14px', marginTop: 10, marginLeft: 30, fontFamily: SANS, fontSize: 24, color: '#111B21'}}>{c.b}</div>
              <div style={{marginTop: 14, textAlign: 'center', background: c.ok ? '#25D366' : '#E5484D', color: '#fff', borderRadius: 16, padding: '8px 0', fontFamily: SANS, fontWeight: 800, fontSize: 26}}>{c.res}</div>
            </div>
          ))}
        </div>
        <Kin t={t} top={1170} size={180} rows={[[[2, 11], [2, 12, 'mid'], [2, 13], [2, 14], [2, 15, 'mid']], [[2, 16, 'big'], [2, 17, 'big'], [2, 18, 'big']], [[2, 19, 'it'], [2, 20, 'it']]]} gap={0} />
      </>
    ),
  },
  // 5 · 02 only one follow-up
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <NumTitle t={t} n="02" at={W(3, 0)} rows={[[[3, 1, 'it'], [3, 2, 'it']], [[3, 3, 'big']]]} size={210} />
        <IconCard t={t} at={W(3, 3) - 0.1} ic="repeat_button" x={360} y={1000} w={360} />
      </>
    ),
  },
  // 6 · sales happen at the 3rd-4th follow-up, people stop at the 1st
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const steps: [string, string, boolean][] = [
        ['Follow-up 1', 'Day 1', false],
        ['Follow-up 2', 'Day 3', false],
        ['Follow-up 3', 'Day 5', true],
        ['Follow-up 4', 'Day 7', true],
      ];
      return (
        <>
          <Kin t={t} top={170} size={170} rows={[[[3, 4], [3, 5, 'mid']], [[3, 6, 'big'], [3, 7, 'it'], [3, 8, 'big']], [[3, 9], [3, 10], [3, 11], [3, 12], [3, 13]]]} gap={0} />
          <div style={{position: 'absolute', left: 120, top: 700, width: 840}}>
            <div style={{position: 'absolute', left: 38, top: 30, bottom: 30, width: 6, background: '#DCE6DE', borderRadius: 3}} />
            {steps.map(([n, d, win], i) => {
              const at = W(3, 5) + i * 0.3;
              return (
                <div key={n} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26, opacity: ep(t, at, 0.25)}}>
                  <div style={{width: 82, height: 82, borderRadius: 41, background: win ? OR : '#fff', border: `4px solid ${win ? OR : '#C9D3CA'}`, color: win ? '#fff' : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BEBAS, fontSize: 44, zIndex: 1}}>{i + 1}</div>
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 24, padding: '16px 22px', border: `2px solid ${win ? OR : '#E3EAE4'}`, boxShadow: '0 12px 24px rgba(20,40,25,0.08)'}}>
                    <Img src={logo('whatsapp')} style={{width: 40, height: 40}} />
                    <b style={{fontFamily: SANS, fontSize: 30, color: INK}}>{n}</b>
                    <span style={{fontFamily: MONO, fontSize: 22, color: '#6E7A70'}}>{d}</span>
                    {win && <span style={{marginLeft: 'auto', background: '#E7F7EC', color: OR, borderRadius: 14, padding: '4px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 24}}>Sale ✓</span>}
                  </div>
                </div>
              );
            })}
            {t > W(3, 15) && (
              <div style={{position: 'absolute', left: 420, top: -10, zIndex: 2, display: 'flex', alignItems: 'center', gap: 10, background: '#FDECEC', color: '#E5484D', borderRadius: 20, padding: '8px 18px', fontFamily: SANS, fontWeight: 800, fontSize: 26, transform: `translateY(30px) scale(${sp(t, W(3, 15), 1.3)})`, transformOrigin: 'left'}}>
                <Img src={fl('sleeping_face')} style={{width: 38, height: 38}} /> Zyadatar log yahin ruk jaate hain
              </div>
            )}
          </div>
          <Kin t={t} top={1240} size={150} rows={[[[3, 14], [3, 15], [3, 16, 'big'], [3, 17], [3, 18]], [[3, 19, 'big'], [3, 20, 'it'], [3, 21, 'it']]]} gap={0} />
        </>
      );
    },
  },
  // 7 · 03 price first, value later
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <NumTitle t={t} n="03" at={W(4, 0)} rows={[[[4, 1, 'big'], [4, 2, 'it']], [[4, 3, 'big'], [4, 4, 'it'], [4, 5, 'it']]]} size={190} />
        <PriceTag t={t} at={W(4, 1)} x={300} y={1050} price="₹4,999" label="PRICE FIRST?" strikeAt={W(4, 4)} rot={-4} />
      </>
    ),
  },
  // 8 · problem -> result -> price
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const steps: [number, string, string, string][] = [
        [7, 'warning', 'PROBLEM', 'Aapki dikkat samjho'],
        [9, 'trophy', 'RESULT', 'Kya badlega, dikhao'],
        [12, 'label', 'PRICE', 'Ab price batao'],
      ];
      return (
        <>
          <Kin t={t} top={210} size={140} rows={[[[4, 6, 'it'], [4, 7, 'big'], [4, 8, 'it'], [4, 9, 'big'], [4, 10, 'it']], [[4, 11], [4, 12, 'big'], [4, 13, 'it']]]} />
          <div style={{position: 'absolute', left: 120, right: 120, top: 640, display: 'flex', flexDirection: 'column', gap: 26}}>
            {steps.map(([k, ic, l, d], i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', gap: 22, background: i === 2 ? OR : '#fff', color: i === 2 ? '#fff' : INK, borderRadius: 30, padding: '20px 26px', border: i === 2 ? 'none' : '2px solid #E3EAE4', boxShadow: '0 18px 36px rgba(20,40,25,0.12)', opacity: ep(t, W(4, k) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(4, k) - 0.1, 0.4)) * 50}px)`}}>
                <div style={{fontFamily: BEBAS, fontSize: 80, color: i === 2 ? '#fff' : OR, width: 60}}>{i + 1}</div>
                <Img src={ic === 'trophy' ? hero('trophy') : fl(ic)} style={{width: 120, height: 120}} />
                <div>
                  <div style={{fontFamily: BEBAS, fontSize: 70, lineHeight: 1}}>{l}</div>
                  <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, opacity: 0.85}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    },
  },
  // 9 · 04 no proof
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <NumTitle t={t} n="04" at={W(5, 0)} rows={[[[5, 1, 'it'], [5, 2, 'big'], [5, 3, 'it']]]} size={220} />
        <Hero src={hero('star')} t={t} x={540} y={1180} w={720} at={W(5, 2) - 0.2} rot={8} />
      </>
    ),
  },
  // 10 · reviews, before/after, client stories -> trust
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <div style={{position: 'absolute', left: 90, right: 90, top: 200, display: 'flex', gap: 16}}>
          <div style={{flex: 1, background: '#fff', borderRadius: 28, padding: '20px 18px', textAlign: 'center', border: '2px solid #E3EAE4', boxShadow: '0 18px 36px rgba(20,40,25,0.12)', opacity: ep(t, W(5, 4) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(5, 4) - 0.1, 0.4)) * 50}px)`}}>
            <Img src={logo('google')} style={{width: 90, height: 90}} />
            <div style={{display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6}}>
              {[0, 1, 2, 3, 4].map((k) => (
                <Img key={k} src={fl('star')} style={{width: 34, height: 34}} />
              ))}
            </div>
            <div style={{fontFamily: BEBAS, fontSize: 52, color: OR, marginTop: 6}}>REVIEWS</div>
          </div>
          <div style={{flex: 1, background: '#fff', borderRadius: 28, padding: '20px 18px', textAlign: 'center', border: '2px solid #E3EAE4', boxShadow: '0 18px 36px rgba(20,40,25,0.12)', opacity: ep(t, W(5, 5) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(5, 5) - 0.1, 0.4)) * 50}px)`}}>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, height: 120}}>
              <div style={{width: 60, height: 40, background: '#C9D3CA', borderRadius: 8}} />
              <div style={{width: 60, height: 40 + 80 * ep(t, W(5, 6), 0.6), background: OR, borderRadius: 8}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 22, fontFamily: MONO, fontSize: 16, color: '#6E7A70', marginTop: 6}}>
              <span>BEFORE</span>
              <span>AFTER</span>
            </div>
            <div style={{fontFamily: BEBAS, fontSize: 46, color: OR, marginTop: 6}}>BEFORE / AFTER</div>
          </div>
          <div style={{flex: 1, background: '#fff', borderRadius: 28, padding: '20px 18px', textAlign: 'center', border: '2px solid #E3EAE4', boxShadow: '0 18px 36px rgba(20,40,25,0.12)', opacity: ep(t, W(5, 7) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(5, 7) - 0.1, 0.4)) * 50}px)`}}>
            <Img src={logo('instagram')} style={{width: 86, height: 86}} />
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, color: INK, marginTop: 8}}>“Inki wajah se sales double”</div>
            <div style={{fontFamily: BEBAS, fontSize: 44, color: OR, marginTop: 6}}>CLIENT STORIES</div>
          </div>
        </div>
        <Kin t={t} top={700} size={240} rows={[[[5, 9], [5, 10, 'mid'], [5, 11]], [[5, 12, 'big']], [[5, 13, 'it'], [5, 14, 'it']]]} gap={0} />
        <Img src={fl('handshake')} style={{position: 'absolute', left: 430, top: 1260, width: 220, height: 220, opacity: ep(t, W(5, 12), 0.3), transform: `scale(${sp(t, W(5, 12), 1.2)})`}} />
      </>
    ),
  },
  // 11 · 05 next step not clear
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <NumTitle t={t} n="05" at={W(6, 0)} rows={[[[6, 1, 'big'], [6, 2, 'big']], [[6, 3, 'it'], [6, 4, 'it']]]} size={220} />
        <IconCard t={t} at={W(6, 2) - 0.1} ic="bullseye" x={360} y={1060} w={360} />
      </>
    ),
  },
  // 12 · end every message with the next step: book a call / visit
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const tap = W(6, 16);
      return (
        <>
          <Kin t={t} top={190} size={160} rows={[[[6, 5], [6, 6, 'mid'], [6, 7], [6, 8], [6, 9], [6, 10, 'it']], [[6, 11, 'big'], [6, 12, 'big'], [6, 13, 'big'], [6, 14, 'big']]]} gap={0} />
          <div style={{position: 'absolute', left: 110, right: 110, top: 600, background: '#EFEAE2', borderRadius: 34, padding: 22, boxShadow: '0 24px 50px rgba(20,40,25,0.14)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#128C7E'}}>
              <Img src={logo('whatsapp')} style={{width: 36, height: 36}} /> Your business
            </div>
            <div style={{background: '#D9FDD3', borderRadius: 22, padding: '16px 20px', marginTop: 12, marginLeft: 60, fontFamily: SANS, fontSize: 30, color: '#111B21', lineHeight: 1.3}}>
              Aapke liye 2 options ready hain 👇 <b>Ab next step:</b>
            </div>
            <div style={{display: 'flex', gap: 14, marginTop: 14, marginLeft: 60}}>
              {[
                {ic: 'googlecalendar', l: 'Call book karo', at: W(6, 15)},
                {ic: 'googlemaps', l: 'Visit karo', at: W(6, 19)},
              ].map((b, i) => {
                const on = i === 0 && t > tap;
                return (
                  <div key={b.l} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: on ? OR : '#fff', color: on ? '#fff' : '#0B6E5E', borderRadius: 20, padding: '18px 0', fontFamily: SANS, fontWeight: 800, fontSize: 28, opacity: ep(t, b.at - 0.1, 0.25), transform: `scale(${on ? lerp(0.9, 1, sp(t, tap, 1.3)) : 1})`, boxShadow: '0 10px 20px rgba(20,40,25,0.10)'}}>
                    <Img src={logo(on ? b.ic + '_white' : b.ic)} style={{width: 40, height: 40}} /> {b.l}
                  </div>
                );
              })}
            </div>
          </div>
          {t > tap - 0.4 && <Img src={fl('pointer')} style={{position: 'absolute', left: 330, top: lerp(1300, 1010, ep(t, tap - 0.4, 0.4)), width: 140, height: 140}} />}
          <Kin t={t} top={1260} size={130} rows={[[[6, 15, 'big'], [6, 16, 'big'], [6, 17, 'it'], [6, 18, 'it'], [6, 19, 'big'], [6, 20, 'it']]]} />
        </>
      );
    },
  },
  // 13 · getting leads is expensive, keeping them is cheap
  {
    bg: 'peach',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} top={200} size={200} rows={[[[7, 0, 'mid'], [7, 1, 'it']], [[7, 2, 'bigw'], [7, 3, 'it']], [[7, 4, 'mid']], [[7, 5, 'big']]]} gap={0} />
        <IconCard t={t} at={W(7, 2) - 0.1} ic="money_with_wings" x={110} y={1100} w={330} rot={-6} />
        <div style={{position: 'absolute', left: 470, top: 1210, fontFamily: BEBAS, fontSize: 120, color: OR, opacity: ep(t, W(7, 4), 0.3)}}>vs</div>
        <IconCard t={t} at={W(7, 5) - 0.1} ic="money_bag" x={640} y={1100} w={330} rot={6} />
      </>
    ),
  },
  // 14 · win the follow-up, win the market (trophy)
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={190} size={175} rows={[[[7, 6], [7, 7, 'big'], [7, 8, 'big']], [[7, 9, 'it'], [7, 10, 'it'], [7, 11, 'mid']], [[7, 12, 'big'], [7, 13, 'big']], [[7, 14, 'it'], [7, 15, 'it']]]} gap={0} />
        <Hero src={hero('trophy')} t={t} x={540} y={1310} w={700} at={W(7, 12) - 0.3} />
      </>
    ),
  },
  // 15 · CTA 1: yeh sab hum aapke liye karein?
  {
    bg: 'brown',
    draw: (t) => (
      <>
        <Kin t={t} dark top={560} size={170} rows={[[[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6]], [[8, 7, 'big'], [8, 8, 'big'], [8, 9, 'big']], [[8, 10, 'it']]]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', gap: 22}}>
          {['Instant replies', 'Auto follow-ups', 'Proof + next step'].map((s, i) => (
            <div key={s} style={{border: `2px solid ${INK}`, color: INK, background: '#fff', borderRadius: 30, padding: '10px 20px', fontFamily: SANS, fontWeight: 600, fontSize: 25, opacity: ep(t, W(8, 9) + i * 0.15, 0.3)}}>• {s}</div>
          ))}
        </div>
        <Hero src={hero('hourglass')} t={t} x={300} y={1450} w={380} at={W(8, 7)} />
        <Hero src={hero('trophy')} t={t} x={540} y={1440} w={420} at={W(8, 7) + 0.15} />
        <Hero src={hero('star')} t={t} x={790} y={1450} w={380} at={W(8, 7) + 0.3} rot={10} />
      </>
    ),
  },
  // 16 · CTA 2: comment "DETAILS", guide on DM
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
                  Lead Follow-up Guide.pdf
                </div>
              </div>
            </div>
          )}
        </>
      );
    },
  },
  // 17 · CTA 3: follow Neuraxine
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
