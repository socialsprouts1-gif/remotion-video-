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
const clean = (w: string) => w.replace(/[",]/g, '');
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

const SHOTS: Shot[] = [
  // 0 · hook: Instagram, floating phones full of generic deadline posts
  {
    bg: 'dark',
    arc: true,
    draw: (t) => {
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            <div style={{width: 170, height: 170, borderRadius: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', transform: `scale(${sp(t, 0, 1.2)}) rotate(${Math.sin(t * 1.5) * 4}deg)`}}>
              <Img src={logo('instagram')} style={{width: 120, height: 120}} />
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: INK, opacity: ep(t, 0.2, 0.4)}}>posting every week…</div>
          </div>
          <Phone x={90} y={520} w={230} ry={22} rx={6} t={t} seed={0}>
            <DeadlinePost v={0} s={0.85} />
          </Phone>
          <Phone x={420} y={460} w={210} ry={-8} rx={4} t={t} seed={1.7} blur={1.5}>
            <DeadlinePost v={1} s={0.78} />
          </Phone>
          <Phone x={730} y={560} w={250} ry={-24} rx={6} t={t} seed={3.1}>
            <DeadlinePost v={2} s={0.92} />
          </Phone>
          <Kin t={t} dark top={1110} size={150} rows={[[[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]], [[0, 6, 'big'], [0, 7, 'it']], [[0, 8, 'big']], [[0, 9], [0, 10]]]} />
        </>
      );
    },
  },
  // 1 · only "deadline posts" on Instagram
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Barcode x={450} y={170} />
        <div style={{position: 'absolute', left: 140, top: 300, width: 800, height: 560, perspective: 1800}}>
          <div style={{width: '100%', height: '100%', transform: `rotateX(14deg) rotateY(${-6 + Math.sin(t) * 2}deg)`, borderRadius: 28, background: '#1d1d1f', padding: 18, boxShadow: '0 50px 80px rgba(20,40,25,0.35)'}}>
            <div style={{width: '100%', height: '100%', borderRadius: 14, background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid #eee'}}>
                <Img src={logo('instagram')} style={{width: 40, height: 40}} />
                <b style={{fontFamily: SANS, fontSize: 26}}>Instagram</b>
                <span style={{marginLeft: 'auto', fontFamily: SANS, fontSize: 20, color: '#888'}}>your.ca.firm</span>
              </div>
              <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, padding: 4, transform: `translateY(${-ep(t, S[1], 3) * 60}px)`}}>
                {Array.from({length: 12}).map((_, i) => {
                  const [a, b, , ic, bg] = POSTS[i % POSTS.length];
                  return (
                    <div key={i} style={{height: 200, background: bg, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: BEBAS, gap: 2}}>
                      <Img src={fl(ic)} style={{width: 54, height: 54}} />
                      <div style={{fontSize: 34, lineHeight: 0.95}}>{a}</div>
                      <div style={{fontSize: 24, color: bg === INK ? '#34C46E' : '#fff'}}>{b}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Kin t={t} top={940} size={150} rows={[[[0, 11], [0, 12], [0, 13, 'mid'], [0, 14]], [[0, 15, 'big'], [0, 16, 'it'], [0, 17, 'big']], [[0, 18, 'it'], [0, 19, 'it']]]} strike={[1, 0, 18]} />
      </>
    ),
  },
  // 2 · tension-free filing + saal bhar ka bharosa (white king, selection box)
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const swap = W(1, 6) - 0.1;
      const out = ep(t, swap - 0.2, 0.2);
      return (
        <>
          <Barcode x={450} y={110} seed={7} />
          <div style={{opacity: 1 - out}}>
            <Kin t={t} top={230} size={150} rows={[[[1, 0], [1, 1], [1, 2], [1, 3]], [[1, 4, 'big']], [[1, 5, 'it']]]} />
          </div>
          {t > swap - 0.1 && <Kin t={t} top={230} size={170} rows={[[[1, 6], [1, 7], [1, 8], [1, 9]], [[1, 10, 'big']], [[1, 11, 'it']]]} />}
          <Hero src={hero('king_w')} t={t} x={540} y={1180} w={900} disc at={S[2] - 0.1} />
          <SelBox t={t} at={W(1, 4)} x={320} y={760} w={440} h={820} tag="this CA knows what they're doing" />
          {t > W(1, 12) && <Pill t={t} at={W(1, 12)} x={360} y={1640} col={OR}>Dekho kaise →</Pill>}
        </>
      );
    },
  },
  // 3 · GST notice at night (black knight + NOTICE ribbons)
  {
    bg: 'dark',
    draw: (t) => (
      <>
        <Ribbon t={t} y={150} rot={-8} word="NOTICE" speed={160} blur={2} op={0.9} />
        <Ribbon t={t} y={1560} rot={6} word="NOTICE" speed={-180} blur={1} />
        <Ribbon t={t} y={1700} rot={-4} word="GST" speed={140} blur={3} op={0.8} />
        <Kin t={t} dark top={430} size={240} rows={[[[2, 0], [2, 1], [2, 2], [2, 3]], [[2, 4, 'big'], [2, 5, 'big']], [[2, 6, 'it']]]} />
        <Hero src={hero('knight_hero')} t={t} x={560} y={1120} w={880} dark at={S[3]} />
        <div style={{position: 'absolute', left: 120, top: 1240, width: 230, background: '#F4EFE6', borderRadius: 6, padding: 16, transform: `rotate(-10deg) translateY(${(1 - ep(t, W(2, 5), 0.5)) * 300}px)`, boxShadow: '0 20px 40px rgba(0,0,0,0.6)'}}>
          <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 18, color: INK}}>FORM ASMT-10</div>
          {[90, 70, 85, 60].map((w, i) => (
            <div key={i} style={{height: 8, width: `${w}%`, background: '#cfc6b8', borderRadius: 4, marginTop: 10}} />
          ))}
          <div style={{marginTop: 12, border: '3px solid #E5484D', color: '#E5484D', fontFamily: MONO, fontWeight: 800, fontSize: 18, padding: '2px 8px', display: 'inline-block', transform: 'rotate(-6deg)'}}>REPLY IN 30 DAYS</div>
        </div>
        <div style={{position: 'absolute', right: 110, top: 1250, display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: INK, opacity: ep(t, W(2, 3), 0.3)}}>
          <Img src={fl('crescent_moon')} style={{width: 56, height: 56}} /> 11:20 PM
        </div>
      </>
    ),
  },
  // 4 · Google search "CA near me"
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const q = 'CA near me';
      const typed = q.slice(0, Math.round(clamp01((t - W(2, 10)) / (W(2, 13) - W(2, 10) + 0.2)) * q.length));
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', opacity: ep(t, S[4], 0.4), transform: `scale(${lerp(0.7, 1, sp(t, S[4], 1.2))})`}}>
            <Img src={logo('google')} style={{width: 220, height: 220, filter: 'drop-shadow(0 20px 30px rgba(20,40,25,0.25))'}} />
          </div>
          <Kin t={t} top={490} size={150} rows={[[[2, 7], [2, 8, 'mid'], [2, 9]], [[2, 10, 'big'], [2, 11, 'big'], [2, 12, 'big']], [[2, 13, 'it'], [2, 14, 'it']]]} />
          <div style={{position: 'absolute', left: 110, right: 110, top: 1000, height: 120, borderRadius: 60, background: '#fff', boxShadow: '0 20px 40px rgba(20,40,25,0.18)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 36px', opacity: ep(t, W(2, 9), 0.3)}}>
            <Img src={logo('google')} style={{width: 54, height: 54}} />
            <span style={{fontFamily: SANS, fontSize: 46, color: '#202124'}}>{typed}</span>
            <span style={{width: 3, height: 50, background: '#1a73e8', opacity: Math.sin(t * 10) > 0 ? 1 : 0}} />
            <Img src={fl('magnifying_glass_tilted_left')} style={{width: 56, height: 56, marginLeft: 'auto'}} />
          </div>
          {[
            ['Shah & Co. · Chartered Accountants', '4.9 ★ (326) · Open now'],
            ['Verma Tax Consultants', '4.1 ★ (48)'],
          ].map(([a, b], i) => (
            <div key={i} style={{position: 'absolute', left: 110, right: 110, top: 1160 + i * 160, borderRadius: 26, background: '#fff', padding: '22px 30px', fontFamily: SANS, boxShadow: '0 14px 30px rgba(20,40,25,0.12)', opacity: ep(t, W(2, 13) + i * 0.2, 0.3) * (i ? 0.55 : 1), transform: `translateY(${(1 - ep(t, W(2, 13) + i * 0.2, 0.4)) * 30}px)`, border: i ? 'none' : `3px solid ${OR}`}}>
              <div style={{fontSize: 34, fontWeight: 700, color: '#1a0dab'}}>{a}</div>
              <div style={{fontSize: 26, color: '#5f6368', marginTop: 4}}>{b}</div>
            </div>
          ))}
        </>
      );
    },
  },
  // 5 · 4.9 reviews -> WhatsApp
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const r = lerp(0, 4.9, ep(t, W(2, 16), 1));
      return (
        <>
          <Barcode x={450} y={110} seed={11} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 48, color: INK, opacity: ep(t, W(2, 15), 0.3)}}>aapke</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: BEBAS, fontSize: 420, lineHeight: 1, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(2, 16), 0.3)}}>{r.toFixed(1)}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', gap: 14}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 110, height: 110, opacity: ep(t, W(2, 17) + k * 0.1, 0.2), transform: `scale(${sp(t, W(2, 17) + k * 0.1, 1.3)})`}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, color: INK, opacity: ep(t, W(2, 17), 0.3)}}>
            reviews <span style={{fontFamily: SANS, fontStyle: 'normal', fontWeight: 600, fontSize: 40, color: '#6b5a4c'}}>(326 Google reviews)</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', opacity: ep(t, W(2, 20) - 0.2, 0.3)}}>
            <div style={{width: 200, height: 200, borderRadius: 50, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 50px rgba(37,211,102,0.35)', transform: `scale(${t > W(2, 20) - 0.2 ? sp(t, W(2, 20) - 0.2, 1.3) : 0.5})`}}>
              <Img src={logo('whatsapp')} style={{width: 140, height: 140}} />
            </div>
          </div>
          <WaBubble t={t} at={W(2, 21)} time="11:24 PM" x={110} y={1260} w={860}>
            Sir, GST notice aaya hai, help chahiye 🙏
          </WaBubble>
        </>
      );
    },
  },
  // 6 · AI replies instantly, asks for the notice photo (antique camera + chat)
  {
    bg: 'peach',
    pill: true,
    draw: (t) => {
      const flash = Math.max(0, 1 - Math.abs(t - W(3, 7)) / 0.12);
      return (
        <>
          <Kin t={t} top={180} size={160} rows={[[[3, 0, 'mid'], [3, 1]], [[3, 2, 'big'], [3, 3, 'big']], [[3, 4, 'it'], [3, 5], [3, 6], [3, 7, 'mid'], [3, 8, 'it']]]} />
          <Hero src={hero('camera')} t={t} x={290} y={1130} w={620} disc at={W(3, 5) - 0.4} />
          <WaBubble t={t} at={W(3, 1)} me time="11:24 PM" tag="AI · REPLIED IN 5 SEC" x={470} y={760} w={520}>
            Ghabraiye mat Mehta ji 🙏 Notice ki photo bhej dijiye
          </WaBubble>
          {t > W(3, 7) && (
            <div style={{position: 'absolute', left: 560, top: 1080, width: 400, background: '#fff', borderRadius: 24, padding: 14, boxShadow: '0 20px 40px rgba(20,40,25,0.25)', transform: `rotate(4deg) translateY(${(1 - ep(t, W(3, 7), 0.5)) * 200}px)`}}>
              <div style={{height: 260, borderRadius: 14, background: '#F4EFE6', padding: 18, position: 'relative', overflow: 'hidden'}}>
                <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 22, color: INK}}>FORM ASMT-10</div>
                {[92, 76, 86, 64, 80].map((w, i) => (
                  <div key={i} style={{height: 10, width: `${w}%`, background: '#cfc6b8', borderRadius: 5, marginTop: 14}} />
                ))}
                <div style={{position: 'absolute', left: 0, right: 0, top: clamp01((t - W(3, 7) - 0.3) / 1.2) * 260, height: 6, background: '#25D366', boxShadow: '0 0 16px 4px rgba(37,211,102,0.6)', opacity: t < W(3, 7) + 1.5 ? 1 : 0}} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 24, fontWeight: 600, marginTop: 10, color: '#111B21'}}>
                <Img src={logo('whatsapp')} style={{width: 30, height: 30}} /> notice.jpg {t > W(3, 7) + 1.5 && <span style={{color: '#128C7E'}}>· read ✓</span>}
              </div>
            </div>
          )}
          <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85, pointerEvents: 'none'}} />
        </>
      );
    },
  },
  // 7 · same-day call booked (dark, Google Calendar)
  {
    bg: 'dark',
    arc: true,
    draw: (t) => {
      const booked = t > W(3, 15);
      return (
        <>
          <Kin t={t} dark top={200} size={170} rows={[[[3, 9], [3, 10, 'mid'], [3, 11, 'mid'], [3, 12], [3, 13]], [[3, 14, 'big'], [3, 15, 'big']], [[3, 16, 'it'], [3, 17, 'it']]]} />
          <div style={{position: 'absolute', left: 140, right: 140, top: 760, borderRadius: 36, background: '#fff', overflow: 'hidden', boxShadow: '0 30px 60px rgba(20,40,25,0.18)', border: '2px solid #E3EAE4', transform: `translateY(${(1 - ep(t, S[7], 0.6)) * 120}px) rotate(-2deg)`, opacity: ep(t, S[7], 0.4)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 28px', borderBottom: '1px solid #eee'}}>
              <Img src={logo('googlecalendar')} style={{width: 60, height: 60}} />
              <b style={{fontFamily: SANS, fontSize: 34, color: '#202124'}}>Google Calendar</b>
              <span style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 22, color: '#5f6368'}}>TODAY</span>
            </div>
            <div style={{padding: '26px 28px', display: 'flex', gap: 22, alignItems: 'center'}}>
              <div style={{width: 130, textAlign: 'center'}}>
                <div style={{fontFamily: SANS, fontSize: 26, color: '#1a73e8', fontWeight: 700}}>TUE</div>
                <div style={{fontFamily: SANS, fontSize: 80, fontWeight: 700, color: '#202124', lineHeight: 1}}>14</div>
              </div>
              <div style={{flex: 1, borderLeft: '8px solid #1a73e8', background: '#E8F0FE', borderRadius: 12, padding: '16px 20px', fontFamily: SANS}}>
                <div style={{fontSize: 34, fontWeight: 700, color: '#202124'}}>Call · CA Rakesh Shah</div>
                <div style={{fontSize: 26, color: '#5f6368'}}>5:30 – 5:45 PM · Mehta Traders</div>
              </div>
            </div>
            <div style={{padding: '0 28px 26px', display: 'flex', justifyContent: 'flex-end'}}>
              <div style={{borderRadius: 30, padding: '14px 34px', fontFamily: SANS, fontWeight: 800, fontSize: 32, background: booked ? '#25D366' : '#1a73e8', color: '#fff', transform: `scale(${booked ? lerp(0.85, 1, sp(t, W(3, 15), 1.3)) : 1})`}}>{booked ? 'Booked ✓' : 'Book call'}</div>
            </div>
          </div>
          <Hero src={hero('watch')} t={t} x={820} y={1420} w={360} dark at={S[7] + 0.3} rot={-12} seed={2} />
        </>
      );
    },
  },
  // 8 · documents checklist, everything on WhatsApp
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const docs: [string, string, number][] = [
        ['PAN + GSTIN', 'page_facing_up', W(4, 9)],
        ['GSTR-3B (6 months)', 'bar_chart', W(4, 10)],
        ['Purchase invoices', 'receipt', W(4, 12)],
        ['Bank statement', 'classical_building', W(4, 13)],
      ];
      return (
        <>
          <Kin t={t} top={190} size={170} rows={[[[4, 0, 'mid'], [4, 1], [4, 2], [4, 3]], [[4, 4, 'big']], [[4, 5, 'it'], [4, 6], [4, 7], [4, 8], [4, 9, 'mid']], [[4, 10, 'mid'], [4, 11], [4, 12], [4, 13, 'it'], [4, 14, 'it']]]} gap={2} />
          <div style={{position: 'absolute', left: 90, top: 860, width: 560, background: '#fff', borderRadius: 30, padding: '24px 28px', boxShadow: '0 30px 60px rgba(20,40,25,0.22)', transform: `rotate(-3deg) translateY(${(1 - ep(t, W(4, 4), 0.6)) * 200}px)`, opacity: ep(t, W(4, 4) - 0.2, 0.3)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: INK}}>
              <Img src={fl('clipboard')} style={{width: 56, height: 56}} /> Documents checklist
            </div>
            {docs.map(([d, ic, at], i) => (
              <div key={d} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 3 ? '1px solid #EFE6DC' : 'none'}}>
                <div style={{width: 40, height: 40, borderRadius: 20, background: t > at + 0.3 ? '#25D366' : '#EFE6DC', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 26, transform: `scale(${t > at + 0.3 ? sp(t, at + 0.3, 1.4) : 1})`}}>{t > at + 0.3 ? '✓' : ''}</div>
                <Img src={fl(ic)} style={{width: 44, height: 44}} />
                <span style={{fontFamily: SANS, fontSize: 29, fontWeight: 600, color: INK}}>{d}</span>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 740, top: 1140, width: 230, height: 230, borderRadius: 60, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(37,211,102,0.35)', transform: `scale(${t > W(4, 10) - 0.4 ? sp(t, W(4, 10) - 0.4, 1.3) : 0.6}) rotate(6deg)`, opacity: ep(t, W(4, 10) - 0.4, 0.2)}}>
            <Img src={logo('whatsapp')} style={{width: 160, height: 160}} />
          </div>
          {docs.map(([d, , at], i) => {
            const k = clamp01((t - at + 0.3) / 0.7);
            if (k <= 0) return null;
            const x = lerp(700, 790, k) + Math.sin(i) * 20;
            const y = lerp(880 + i * 60, 1180, eio(t, at - 0.3, 0.7));
            return (
              <div key={d} style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '8px 12px', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', opacity: k < 0.85 ? 1 : 1 - (k - 0.85) / 0.15, transform: `scale(${1 - k * 0.5}) rotate(${(i % 2 ? 8 : -8) * (1 - k)}deg)`}}>
                <div style={{width: 34, height: 42, borderRadius: 5, background: '#E5484D', color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PDF</div>
                <span style={{fontFamily: SANS, fontSize: 20, fontWeight: 700, color: INK}}>{d.split(' ')[0]}.pdf</span>
              </div>
            );
          })}
        </>
      );
    },
  },
  // 9 · office ke chakkar nahi (rook = office, crossed out)
  {
    bg: 'peach',
    hud: true,
    draw: (t) => (
      <>
        <Barcode x={450} y={110} seed={19} />
        <Kin t={t} top={220} size={190} rows={[[[4, 15, 'big'], [4, 16, 'it'], [4, 17, 'big']], [[4, 18, 'it']]]} />
        <Hero src={hero('castle_w')} t={t} x={540} y={1120} w={820} disc at={S[9]} />
        <SelBox t={t} at={S[9] + 0.2} x={350} y={760} w={380} h={760} />
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          {[
            [330, 800, 750, 1500],
            [750, 800, 330, 1500],
          ].map(([a, b, c, d], i) => {
            const len = Math.hypot(c - a, d - b);
            return <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={OR} strokeWidth="26" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - ep(t, W(4, 18) + i * 0.15, 0.3))} />;
          })}
        </svg>
        <Pill t={t} at={W(4, 18) + 0.4} x={330} y={1620} col={OR}>0 office visits</Pill>
      </>
    ),
  },
  // 10 · har deadline se pehle automatic reminder (watch hero)
  {
    bg: 'dark',
    arc: true,
    draw: (t) => (
      <>
        <Kin t={t} dark top={170} size={170} rows={[[[5, 0, 'mid'], [5, 1, 'big']], [[5, 2, 'it'], [5, 3, 'it']], [[5, 4, 'mid'], [5, 5, 'big']]]} gap={0} />
        <Hero src={hero('watch')} t={t} x={540} y={1180} w={860} dark at={S[10]} />
        {[0, 1, 2].map((k) => (
          <div key={k} style={{position: 'absolute', left: 540 - 300 - k * 60, top: 1180 - 300 - k * 60, width: 600 + k * 120, height: 600 + k * 120, borderRadius: '50%', border: `3px solid rgba(31,157,85,${0.5 - k * 0.15})`, transform: `scale(${1 + ((t * 0.6 + k * 0.33) % 1) * 0.2})`, opacity: 1 - ((t * 0.6 + k * 0.33) % 1)}} />
        ))}
      </>
    ),
  },
  // 11 · GST · TDS · ITR — kuch miss nahi hua
  {
    bg: 'dark',
    arc: true,
    draw: (t) => {
      const items: [string, number, string][] = [
        ['GST', W(5, 6), '20 Jul · Filed ✓'],
        ['TDS', W(5, 7), '7 Jul · Filed ✓'],
        ['ITR', W(5, 8), '31 Jul · Filed ✓'],
      ];
      return (
        <>
          <Hero src={hero('watch')} t={t} x={830} y={420} w={420} dark rot={14} seed={1} />
          {items.map(([n, at, s], i) => (
            <div key={n} style={{position: 'absolute', left: 90, top: 260 + i * 300, opacity: ep(t, at - 0.05, 0.25)}}>
              <div style={{fontFamily: BEBAS, fontSize: 280, lineHeight: 0.85, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transform: `translateX(${(1 - ep(t, at - 0.05, 0.4)) * -80}px)`}}>{n}</div>
              <div style={{position: 'absolute', left: 330, top: 110, display: 'flex', alignItems: 'center', gap: 10, background: '#E7F7EC', border: '2px solid #25D366', color: '#137A3E', borderRadius: 30, padding: '8px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 30, whiteSpace: 'nowrap', transform: `scale(${sp(t, at + 0.3, 1.3)})`, transformOrigin: 'left center'}}>• {s}</div>
            </div>
          ))}
          <Kin t={t} dark top={1260} size={190} rows={[[[5, 9, 'mid'], [5, 10, 'big'], [5, 11, 'it'], [5, 12, 'it']]]} strike={[0, 5, 11]} />
          <Pill t={t} at={W(5, 12) + 0.2} x={350} y={1520} col={OR}>Late fee: ₹0</Pill>
        </>
      );
    },
  },
  // 12 · filed: acknowledgement straight on WhatsApp (white queen + stamp)
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => (
      <>
        <Kin t={t} top={180} size={130} rows={[[[6, 0, 'mid'], [6, 1], [6, 2, 'it']], [[6, 3, 'big']], [[6, 4], [6, 5, 'mid'], [6, 6, 'it']]]} />
        <Hero src={hero('queen_w')} t={t} x={300} y={1180} w={700} disc at={S[12]} />
        <div style={{position: 'absolute', left: 470, top: 820, width: 520, background: '#D9FDD3', borderRadius: 30, borderTopRightRadius: 6, padding: '18px 20px', boxShadow: '0 24px 50px rgba(20,40,25,0.22)', opacity: ep(t, W(6, 5) - 0.2, 0.3), transform: `translateY(${(1 - ep(t, W(6, 5) - 0.2, 0.5)) * 60}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 18, color: '#128C7E', letterSpacing: '0.1em'}}>
            <Img src={logo('whatsapp')} style={{width: 28, height: 28}} /> SHAH & CO. · FILED
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: '14px 16px', marginTop: 10}}>
            <div style={{width: 58, height: 72, borderRadius: 8, background: '#E5484D', color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PDF</div>
            <div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#111B21'}}>ITR-V Acknowledgement</div>
              <div style={{fontFamily: MONO, fontSize: 18, color: '#667781'}}>Ack. 4821 9930 1127</div>
            </div>
          </div>
          <div style={{fontFamily: SANS, fontSize: 18, color: '#667781', textAlign: 'right', marginTop: 6}}>4:12 PM <span style={{color: '#53BDEB'}}>✓✓</span></div>
        </div>
        <div style={{position: 'absolute', left: 600, top: 1180, border: `8px solid ${OR}`, color: OR, borderRadius: 18, padding: '6px 26px', fontFamily: BEBAS, fontSize: 130, lineHeight: 1, transform: `rotate(-12deg) scale(${t > W(6, 4) ? lerp(2.4, 1, sp(t, W(6, 4), 1.4)) : 0})`, opacity: ep(t, W(6, 4), 0.08)}}>FILED ✓</div>
      </>
    ),
  },
  // 13 · tax saving tips (calculator)
  {
    bg: 'peach',
    hud: true,
    draw: (t) => {
      const saved = Math.round(lerp(0, 46800, ep(t, W(6, 11), 1.4)));
      const tips: [string, string][] = [
        ['80C · PPF / ELSS', '₹1,50,000'],
        ['80D · Health insurance', '₹25,000'],
        ['80CCD · NPS', '₹50,000'],
      ];
      return (
        <>
          <Barcode x={450} y={110} seed={23} />
          <Kin t={t} top={200} size={190} rows={[[[6, 7, 'it'], [6, 8], [6, 9]], [[6, 10, 'big'], [6, 11, 'big']], [[6, 12, 'it']]]} />
          <Hero src={hero('calculator')} t={t} x={300} y={1140} w={620} disc at={S[13]} rot={-6} />
          <div style={{position: 'absolute', left: 560, top: 880, width: 440, background: '#fff', borderRadius: 30, padding: '22px 24px', boxShadow: '0 24px 50px rgba(20,40,25,0.2)'}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', color: OR}}>NEXT YEAR · SAVE</div>
            {tips.map(([k, v], i) => (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 25, color: INK, padding: '12px 0', borderBottom: '1px solid #EFE6DC', opacity: ep(t, W(6, 10) + i * 0.2, 0.25)}}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12}}>
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: INK}}>Tax saved</span>
              <span style={{fontFamily: BEBAS, fontSize: 70, color: OR}}>₹{saved.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </>
      );
    },
  },
  // 14 · 3 business friends referred (pawns)
  {
    bg: 'peach',
    pill: true,
    hud: true,
    draw: (t) => {
      const firms: [string, number][] = [
        ['Gupta Traders', W(7, 10)],
        ['Jain Textiles', W(7, 10) + 0.25],
        ['Kapoor Foods', W(7, 10) + 0.5],
      ];
      return (
        <>
          <Kin t={t} top={180} size={190} rows={[[[7, 0], [7, 1], [7, 2], [7, 3], [7, 4, 'mid'], [7, 5, 'mid'], [7, 6]], [[7, 7, 'big'], [7, 8, 'big'], [7, 9, 'big']], [[7, 10, 'it'], [7, 11, 'it']]]} />
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <Hero src={hero('pawn_w')} t={t} x={210 + i * 330} y={1110} w={460} at={W(7, 7) + i * 0.15} seed={i * 1.3} />
              <div style={{position: 'absolute', left: 90 + i * 330, top: 1400, width: 240, textAlign: 'center', opacity: ep(t, firms[i][1], 0.3), transform: `translateY(${(1 - ep(t, firms[i][1], 0.4)) * 30}px)`}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: INK}}>{firms[i][0]}</div>
                <div style={{marginTop: 8, background: OR, color: '#fff', borderRadius: 24, padding: '6px 0', fontFamily: SANS, fontWeight: 700, fontSize: 24}}>New client ✓</div>
              </div>
            </React.Fragment>
          ))}
          <Pill t={t} at={W(7, 11) + 0.3} x={300} y={1600}>
            <Img src={logo('whatsapp')} style={{width: 36, height: 36}} /> +3 clients · ₹0 ads
          </Pill>
        </>
      );
    },
  },
  // 15 · growth: not deadline posts (dark, phones fall away)
  {
    bg: 'dark',
    arc: true,
    draw: (t) => {
      const fall = ep(t, W(8, 8), 1.2);
      return (
        <>
          <Kin t={t} dark top={200} size={190} rows={[[[8, 0], [8, 1, 'mid'], [8, 2], [8, 3, 'mid'], [8, 4, 'it']], [[8, 5, 'big'], [8, 6, 'big']], [[8, 7, 'it'], [8, 8, 'it']]]} strike={[1, 8, 8]} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{transform: `translateY(${fall * (700 + i * 120)}px) rotate(${fall * (i - 1) * 25}deg)`, opacity: 1 - fall * 0.8}}>
              <Phone x={110 + i * 300} y={800 + (i % 2) * 60} w={230} ry={(i - 1) * -18} rx={6} t={t} seed={i * 2}>
                <DeadlinePost v={i} s={0.85} />
              </Phone>
            </div>
          ))}
        </>
      );
    },
  },
  // 16 · bharose aur referrals se (black king + blurred BHAROSA)
  {
    bg: 'dark',
    draw: (t) => (
      <>
        <div style={{position: 'absolute', left: -100, right: -100, top: 560, textAlign: 'center', fontFamily: BEBAS, fontSize: 420, color: OR, opacity: 0.55 * ep(t, W(8, 9), 0.6), filter: 'blur(14px)', letterSpacing: '0.02em'}}>BHAROSA</div>
        <Kin t={t} dark top={170} size={150} rows={[[[8, 9, 'big'], [8, 10, 'it'], [8, 11, 'big']], [[8, 12], [8, 13], [8, 14]]]} />
        <Hero src={hero('king_hero')} t={t} x={540} y={1180} w={980} dark at={S[16]} />
      </>
    ),
  },
  // 17 · CTA 1: yeh sab hum aapke liye karein?
  {
    bg: 'brown',
    draw: (t) => (
      <>
        <Kin t={t} dark top={560} size={170} rows={[[[9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6]], [[9, 7, 'big'], [9, 8, 'big'], [9, 9, 'big']], [[9, 10, 'it']]]} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', gap: 22}}>
          {['Instant AI reply', 'Docs on WhatsApp', 'Deadline reminders'].map((s, i) => (
            <div key={s} style={{border: `2px solid ${INK}`, color: INK, background: '#fff', borderRadius: 30, padding: '10px 20px', fontFamily: SANS, fontWeight: 600, fontSize: 25, opacity: ep(t, W(9, 9) + i * 0.15, 0.3)}}>• {s}</div>
          ))}
        </div>
        <Hero src={hero('king_hero')} t={t} x={540} y={1460} w={720} dark at={W(9, 7)} />
      </>
    ),
  },
  // 18 · CTA 2: comment "DETAILS", guide on DM
  {
    bg: 'brown',
    draw: (t) => {
      const typeAt = W(9, 14) - 0.3;
      const word = 'DETAILS';
      const typed = word.slice(0, Math.round(clamp01((t - typeAt) / 0.5) * word.length));
      const posted = t > typeAt + 0.7;
      const dm = W(9, 20) - 0.2;
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 60, color: INK, opacity: ep(t, W(9, 11), 0.3)}}>
            Just <span style={{fontWeight: 800}}>comment</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center'}}>
            <span style={{position: 'relative', display: 'inline-block', fontFamily: BEBAS, fontSize: 260, lineHeight: 1, backgroundImage: `linear-gradient(180deg, ${OR2}, ${OR} 60%, #137A3E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(9, 14) - 0.1, 0.25), transform: `scale(${lerp(1.2, 1, ep(t, W(9, 14) - 0.1, 0.4))})`}}>
              “DETAILS”
            </span>
            <svg width="700" height="60" style={{position: 'absolute', left: 190, top: 245}}>
              <path d="M 10 40 Q 180 10 360 30 T 690 22" fill="none" stroke={OR} strokeWidth="9" strokeLinecap="round" strokeDasharray="800" strokeDashoffset={800 * (1 - ep(t, W(9, 14) + 0.2, 0.5))} />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 790, height: 110, borderRadius: 55, background: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px 0 30px', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4', opacity: ep(t, W(9, 12), 0.3)}}>
            <Img src={logo('instagram')} style={{width: 52, height: 52}} />
            <span style={{flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: posted ? '#0095F6' : INK}}>
              {typed || <span style={{color: '#999', fontWeight: 400}}>Add a comment…</span>}
              {!posted && t > typeAt && <span style={{opacity: Math.sin(t * 10) > 0 ? 1 : 0}}>|</span>}
              {posted && <span style={{color: '#25D366'}}> ✓ posted</span>}
            </span>
            <div style={{width: 76, height: 76, borderRadius: 38, background: posted ? '#25D366' : '#0095F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>➤</div>
          </div>
          <Kin t={t} dark top={980} size={150} rows={[[[9, 15], [9, 16, 'big'], [9, 17], [9, 18]], [[9, 19, 'mid'], [9, 20, 'big'], [9, 21, 'it'], [9, 22, 'it']]]} />
          {t > dm && (
            <div style={{position: 'absolute', left: 110, right: 110, top: 1380, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.97)', borderRadius: 32, padding: '22px 26px', boxShadow: '0 24px 50px rgba(20,40,25,0.16)', border: '2px solid #E3EAE4', transform: `translateY(${(1 - ep(t, dm, 0.5)) * -80}px)`, opacity: ep(t, dm, 0.3)}}>
              <Img src={logo('instagram')} style={{width: 64, height: 64}} />
              <div style={{flex: 1, fontFamily: SANS}}>
                <div style={{fontSize: 28, color: INK}}>
                  <b>neuraxine</b> sent you a message · now
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, background: '#F4EFE6', borderRadius: 14, padding: '8px 14px', fontSize: 26, fontWeight: 700, color: INK}}>
                  <div style={{width: 30, height: 38, borderRadius: 5, background: '#E5484D', color: '#fff', fontFamily: MONO, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PDF</div>
                  CA Firm Growth Guide.pdf
                </div>
              </div>
            </div>
          )}
        </>
      );
    },
  },
  // 19 · CTA 3: follow Neuraxine
  {
    bg: 'brown',
    draw: (t) => {
      const tap = W(9, 31) + 0.1;
      const done = t > tap;
      return (
        <>
          <Kin t={t} dark top={450} size={230} rows={[[[9, 23], [9, 24], [9, 25], [9, 26, 'mid'], [9, 27], [9, 28]], [[9, 29, 'it'], [9, 30, 'it']], [[9, 31, 'big']]]} gap={6} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', opacity: ep(t, W(9, 29), 0.3)}}>
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
