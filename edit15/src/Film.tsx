import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SCENES, THEMES} from './med';

const SW = LINE.map((l, i) => (i === 0 ? 0 : l - 0.4));
const END_AT = WE(9, 16) + 0.6;
const FLIP = 0.7;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const storyAt = (t: number): {txt: string; img: string} => {
  if (t < SW[2]) return {txt: 'SmileCare Dental', img: 'tooth'};
  if (t < SW[4]) return {txt: '11:04 PM', img: 'crescent_moon'};
  if (t < SW[5]) return {txt: 'Kal · 8:30 AM', img: 'alarm_clock'};
  if (t < W(5, 10)) return {txt: 'After treatment', img: 'pill'};
  if (t < SW[6]) return {txt: 'Day 3', img: 'spiral_calendar'};
  if (t < SW[7]) return {txt: 'Day 3 · review', img: 'star'};
  if (t < SW[8]) return {txt: '6 months later', img: 'toothbrush'};
  if (t < SW[9]) return {txt: 'Every month', img: 'chart_increasing'};
  return {txt: 'Now', img: 'sparkles'};
};
const Header: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const c = storyAt(t);
  let changed = 0;
  for (let dt = 0; dt < 0.35; dt += 1 / 30) if (storyAt(t - dt).txt !== c.txt) changed = 1 - dt / 0.35;
  const pill = theme === 'cream' ? {bg: '#fff', fg: C.ink} : theme === 'green' ? {bg: 'rgba(255,255,255,0.18)', fg: '#fff'} : {bg: 'rgba(255,255,255,0.09)', fg: '#fff'};
  return (
    <div style={{position: 'absolute', top: 200, left: 90, right: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
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
const KEY = /^"?(whatsapp|instagram|dm|ai|gym|member|members|clinic|patient|patients|appointment|appointments|reminder|no-show|review|prescription|dard|dentist|automatic|repeat|bharose)"?[,.?!]*$/i;
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

// ---- pages: ECG-paper cream, monitor black, green ---------------------------
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  if (theme === 'cream')
    return (
      <AbsoluteFill style={{background: '#F3F1EA', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(31,157,85,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(31,157,85,0.07) 1px, transparent 1px), linear-gradient(rgba(31,157,85,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(31,157,85,0.12) 2px, transparent 2px)', backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px'}} />
        <div style={{position: 'absolute', left: 140 + Math.sin(t * 0.4 + i) * 60, top: 1420, width: 800, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,200,225,0.45), rgba(190,220,200,0.2) 50%, transparent 70%)', filter: 'blur(40px)'}} />
      </AbsoluteFill>
    );
  if (theme === 'green')
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.06) 2px, transparent 2px)', backgroundSize: '120px 120px'}} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 50%, #232A26 0%, #141715 55%, #0A0C0B 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(37,211,102,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      {Array.from({length: 30}).map((_, k) => (
        <div key={k} style={{position: 'absolute', left: rnd(k * 3 + i) * 1080, top: rnd(k * 5 + i) * 1920, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.05 + 0.1 * Math.abs(Math.sin(t * 0.7 + k))}} />
      ))}
    </AbsoluteFill>
  );
};

/** live heartbeat strip across the frame, like a patient monitor */
const beat = (ph: number) => (ph > 0.40 && ph < 0.46 ? -Math.sin(((ph - 0.40) / 0.06) * Math.PI) * 1 : ph > 0.46 && ph < 0.52 ? Math.sin(((ph - 0.46) / 0.06) * Math.PI) * 0.35 : ph > 0.62 && ph < 0.75 ? -Math.sin(((ph - 0.62) / 0.13) * Math.PI) * 0.18 : 0);
const ECG: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const col = theme === 'green' ? '#fff' : theme === 'cream' ? C.green : C.wa;
  const period = 0.85;
  const pts: string[] = [];
  for (let x = 0; x <= 1080; x += 4) {
    const tt = t - (1080 - x) / 600; // the trace scrolls left at 600 px/s
    const ph = ((tt / period) % 1 + 1) % 1;
    pts.push(`${x},${40 + beat(ph) * 52}`);
  }
  const ph = ((t / period) % 1 + 1) % 1;
  return (
    <div style={{position: 'absolute', left: 0, top: 1370, width: 1080, height: 90, opacity: 0.9}}>
      <svg width="1080" height="90" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="fadeL" x1="0" x2="1">
            <stop offset="0" stopColor={col} stopOpacity="0" />
            <stop offset="0.25" stopColor={col} stopOpacity="0.6" />
            <stop offset="1" stopColor={col} stopOpacity="1" />
          </linearGradient>
        </defs>
        <polyline points={pts.join(' ')} fill="none" stroke="url(#fadeL)" strokeWidth="4" strokeLinejoin="round" style={{filter: theme === 'dark' ? `drop-shadow(0 0 6px ${col})` : undefined}} />
        <circle cx="1080" cy={40 + beat(ph) * 52} r="7" fill={col} />
      </svg>
    </div>
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
        ENQUIRY <span style={{color: C.green}}>→</span> APPOINTMENT <span style={{color: C.green}}>→</span> REPEAT
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

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const sweeping = pg.i > 0 && pg.p < 1;
  const x = pg.p < 1 ? 1 - Math.pow(1 - pg.p, 2.2) : 1; // scan position 0..1
  const theme = THEMES[sweeping && x < 0.5 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0A0C0B'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {sweeping && <PageView i={pg.i - 1} t={t} />}
        <AbsoluteFill style={{clipPath: sweeping ? `inset(0 ${(1 - x) * 100}% 0 0)` : undefined}}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {sweeping && (
          <>
            <div style={{position: 'absolute', top: 0, bottom: 0, left: x * 1080 - 220, width: 220, background: 'linear-gradient(90deg, rgba(37,211,102,0), rgba(37,211,102,0.28))'}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, left: x * 1080 - 3, width: 6, background: '#C8FFD9', boxShadow: '0 0 24px 8px rgba(37,211,102,0.8)'}} />
          </>
        )}
        <ECG t={t} theme={theme} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
