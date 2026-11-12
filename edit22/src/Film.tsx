import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {GUESTS, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './cafe';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 0.8;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const STAGES: [string, string][] = [
  ['Search', 'magnifying_glass_tilted_left'],
  ['Table booked', 'spiral_calendar'],
  ['QR order', 'receipt'],
  ['Review', 'star'],
  ['Birthday', 'birthday_cake'],
  ['Regular', 'hot_beverage'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'Cafes & restaurants', img: 'hot_beverage'};
};
const Header: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const c = storyAt2(t);
  let changed = 0;
  for (let dt = 0; dt < 0.35; dt += 1 / 30) if (storyAt2(t - dt).txt !== c.txt) changed = 1 - dt / 0.35;
  const pill = theme === 'cream' ? {bg: '#fff', fg: C.ink} : theme === 'green' ? {bg: 'rgba(255,255,255,0.18)', fg: '#fff'} : {bg: 'rgba(255,255,255,0.09)', fg: '#fff'};
  return (
    <div style={{position: 'absolute', top: 236, left: 90, right: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: theme === 'cream' ? '#3A3631' : 'rgba(255,255,255,0.82)'}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: theme === 'green' ? '#fff' : C.green}} />
        @NEURAXINE
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: pill.bg, color: pill.fg, borderRadius: 30, padding: '8px 20px 8px 10px', fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: theme === 'cream' ? '0 6px 16px rgba(0,0,0,0.06)' : 'none'}}>
        <Img src={fl(c.img)} style={{width: 34, height: 34, transform: `scale(${1 + changed * 0.3})`}} />
        <span style={{display: 'inline-block', transform: `translateY(${changed * -12}px)`, opacity: 1 - changed * 0.8}}>{c.txt}</span>
      </div>
    </div>
  );
};

// ---- captions (boxed word, same as earlier edits) ---------------------------
type Chunk = {ws: typeof WORDS; s: number};
const CHUNKS: Chunk[] = [];
WORDS.forEach((w, i) => {
  const prev = WORDS[i - 1];
  const last = CHUNKS[CHUNKS.length - 1];
  if (!last || !prev || prev.line !== w.line || /[,.?!]$/.test(prev.w) || last.ws.length >= 3) CHUNKS.push({ws: [w], s: w.s});
  else last.ws.push(w);
});
const KEY = /^"?(whatsapp|instagram|dm|ai|cafe|restaurant|marketing|automation|guest|guests|regular|google|rating|menu|reel|table|window|qr|order|bill|review|photo|birthday|dessert|free|broadcast|special|repeat|details|guide|follow|neuraxine|comment)"?[,.?!]*$/i;
const Captions: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  if (t > END_AT - 0.2) return null;
  let ci = -1;
  CHUNKS.forEach((c, i) => {
    if (t >= c.s - 0.05) ci = i;
  });
  if (ci < 0) return null;
  const c = CHUNKS[ci];
  const pop = sp(t, c.s - 0.05, 1.3);
  const col = theme === 'cream' ? C.ink : '#fff';
  return (
    <div style={{position: 'absolute', top: 1500, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 6, transform: `scale(${lerp(0.88, 1, pop)})`, opacity: ep(t, c.s - 0.05, 0.12)}}>
      {c.ws.map((w, i) => {
        const cur = t >= w.s - 0.03 && (i === c.ws.length - 1 || t < c.ws[i + 1].s - 0.03);
        const past = t >= w.s;
        const key = KEY.test(w.w);
        const box = cur ? (key ? (theme === 'green' ? '#fff' : C.green) : theme === 'dark' ? '#fff' : C.ink) : 'transparent';
        const tc = cur ? (key ? (theme === 'green' ? C.green : '#fff') : theme === 'dark' ? C.ink : '#fff') : col;
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: '-0.03em', padding: '2px 14px 6px', borderRadius: 12, background: box, color: tc, opacity: past || cur ? 1 : 0.3, transform: `scale(${cur ? lerp(0.9, 1, sp(t, w.s - 0.03, 1.6)) : 1})`, boxShadow: cur ? '0 10px 24px rgba(0,0,0,0.18)' : 'none'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---- pages: menu cards in cream / black / green -------------------------------------
const BG: Record<Theme, string> = {
  cream: C.cream,
  dark: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)',
  green: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)',
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const ink = theme === 'cream' ? 'rgba(15,122,60,0.28)' : 'rgba(255,255,255,0.18)';
  return (
    <AbsoluteFill style={{background: BG[theme], overflow: 'hidden'}}>
      {theme === 'cream' && <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 2px, transparent 2px)', backgroundSize: '36px 36px'}} />}
      {/* rising steam wisps */}
      {[0, 1, 2].map((k) => {
        const p = ((t * 0.12 + k / 3 + i * 0.1) % 1);
        return <div key={k} style={{position: 'absolute', left: 160 + k * 330 + Math.sin(t + k) * 40, top: 1900 - p * 1900, width: 220, height: 420, borderRadius: '50%', background: theme === 'cream' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.05)', filter: 'blur(40px)', opacity: Math.sin(p * Math.PI)}} />;
      })}
      {/* menu card double frame */}
      <div style={{position: 'absolute', left: 34, right: 34, top: 34, bottom: 34, border: `3px solid ${ink}`, borderRadius: 34}} />
      <div style={{position: 'absolute', left: 48, right: 48, top: 48, bottom: 48, border: `1.5px solid ${ink}`, borderRadius: 26}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, color: ink}}>~ {['Welcome', 'Starters', 'Reservations', 'Mains', 'Desserts', 'Specials', 'Today', 'Chef’s note', 'Thank you'][i]} ~</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = END_AT;
  const p = ep(t, a, 0.7);
  const click = a + 1.4;
  const followed = t > click;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #2A2622 0%, #171513 55%, #0C0B0A 100%)', clipPath: `circle(${p * 120}% at 50% 60%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${lerp(0.4, 1, sp(t, a + 0.15))}) rotate(${(1 - ep(t, a + 0.15, 0.7)) * -20}deg)`, opacity: ep(t, a + 0.15, 0.3)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 220, height: 165, objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, marginTop: 20, opacity: ep(t, a + 0.3, 0.4)}}>
        Neura<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em'}}>xine</span>
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: '#A8A29A', marginTop: 18, opacity: ep(t, a + 0.5, 0.4)}}>
        HAR HAFTE <span style={{color: C.green}}>·</span> EK PRACTICAL STRATEGY
      </div>
      <div style={{position: 'relative', marginTop: 50, opacity: ep(t, a + 0.7, 0.4)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: followed ? C.green : '#fff', color: followed ? '#fff' : C.ink, borderRadius: 50, padding: '18px 36px', fontFamily: SANS, fontWeight: 700, fontSize: 34, transform: `scale(${followed ? lerp(0.9, 1, sp(t, click)) : 1})`}}>
          {followed ? 'Following ✓' : 'Follow +'} <span style={{fontWeight: 500, opacity: 0.8}}>@neuraxine</span>
        </div>
        {t > click - 0.5 && <div style={{position: 'absolute', left: 120, top: 30, width: 60, height: 60, borderRadius: 30, border: '4px solid #fff', transform: `scale(${t > click ? lerp(0.5, 2.2, ep(t, click, 0.6)) : lerp(1.4, 0.6, ep(t, click - 0.5, 0.5))})`, opacity: t > click ? 1 - ep(t, click, 0.6) : 0.9}} />}
      </div>
    </AbsoluteFill>
  );
};

const PageView: React.FC<{i: number; t: number}> = ({i, t}) => {
  const S = SCENES[i];
  const th = THEMES[i];
  const settle = 1 + Math.min(0.03, Math.max(0, t - SW[i]) * 0.004);
  return (
    <AbsoluteFill>
      <Page theme={th} t={t} i={i} />
      <AbsoluteFill style={{transform: `scale(${settle})`, transformOrigin: '50% 55%'}}>
        <S t={t} th={TH[th]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** top-down table under the header: chairs fill as Priya brings more people */
const TableHud: React.FC<{t: number; theme: Theme; i: number}> = ({t, theme, i}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const n = GUESTS[i];
  const prevN = GUESTS[Math.max(0, i - 1)];
  const ink = theme === 'cream' ? C.ink : '#fff';
  const regular = i >= 6;
  return (
    <div style={{position: 'absolute', left: 540 - 90, top: 62, width: 180, height: 180, opacity: ep(t, at0, 0.4)}}>
      {Array.from({length: 8}).map((_, k) => {
        const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
        const on = k < n;
        const fresh = on && k >= prevN;
        const at = SW[i] + FLIP + (k - prevN) * 0.12;
        const s = fresh ? sp(t, at, 1.3) : 1;
        return (
          <div key={k} style={{position: 'absolute', left: 90 + Math.cos(a) * 70 - 17, top: 90 + Math.sin(a) * 70 - 17, width: 34, height: 34, borderRadius: 11, background: on && (!fresh || t > at) ? (theme === 'green' ? '#fff' : C.green) : 'transparent', border: `2px solid ${ink}`, opacity: on ? 1 : 0.3, transform: `scale(${t > at || !fresh ? s : 1})`}} />
        );
      })}
      <div style={{position: 'absolute', left: 52, top: 52, width: 76, height: 76, borderRadius: 38, border: `3px solid ${ink}`, background: regular ? (theme === 'green' ? 'rgba(255,255,255,0.2)' : 'rgba(31,157,85,0.15)') : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 24, color: ink}}>
        {regular ? '★' : n}
      </div>
    </div>
  );
};

/** coffee-pour wave: the next page rises from the bottom with a wavy, foamy edge */
const wavePath = (y: number, t: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= 1080; x += 30) pts.push(`${x}px ${y + Math.sin(x * 0.011 + t * 9) * 34 + Math.sin(x * 0.027 - t * 6) * 14}px`);
  return `polygon(${pts.join(', ')}, 1080px 1920px, 0px 1920px)`;
};
const Foam: React.FC<{y: number; t: number; theme: Theme}> = ({y, t, theme}) => {
  let d = '';
  for (let x = 0; x <= 1080; x += 30) d += `${x === 0 ? 'M' : 'L'} ${x} ${y + Math.sin(x * 0.011 + t * 9) * 34 + Math.sin(x * 0.027 - t * 6) * 14} `;
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <path d={d} fill="none" stroke={theme === 'cream' ? C.green : '#F4EFE6'} strokeWidth="14" strokeLinecap="round" opacity="0.95" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="4" transform="translate(0 -10)" opacity="0.6" />
    </svg>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const e = busy ? (1 - Math.cos(Math.PI * pg.p)) / 2 : 1;
  const y = 1990 - e * 2100;
  const theme = THEMES[busy && e < 0.6 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {busy && (
          <AbsoluteFill style={{transform: `scale(${1 - e * 0.05})`, filter: `blur(${e * 6}px)`}}>
            <PageView i={pg.i - 1} t={t} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={busy ? {clipPath: wavePath(y, t)} : undefined}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {busy && <Foam y={y} t={t} theme={THEMES[pg.i]} />}
        <TableHud t={t} theme={theme} i={pg.i} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
