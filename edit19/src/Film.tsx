import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {RAIL, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './rack';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(8, 31) + 0.6;
const FLIP = 0.7;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const storyAt2 = (t: number): {txt: string; img: string} => {
  if (t >= SW[7]) return {txt: 'Done for you', img: 'handshake'};
  if (t >= SW[6]) return {txt: 'Sach baat', img: 'light_bulb'};
  for (let k = 5; k >= 1; k--) if (t >= SW[k]) return {txt: `Strategy ${k}/5`, img: RAIL[k - 1]};
  return {txt: 'Clothing stores', img: 'department_store'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|gym|member|members|shaadi|khaali|marketing|strategies|whatsapp|billing|stock|purane|try-on|reels|google|birthday|anniversary|offer|sasta|customer|customers|details|guide|dm|follow|neuraxine|comment)"?[,.?!]*$/i;
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

// ---- pages: cream / black / green --------------------------------------------
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  if (theme === 'cream')
    return (
      <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 2px, transparent 2px)', backgroundSize: '36px 36px'}} />
        <div style={{position: 'absolute', left: 140 + Math.sin(t * 0.4 + i) * 60, top: 1420, width: 800, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,200,225,0.45), rgba(190,220,200,0.2) 50%, transparent 70%)', filter: 'blur(40px)'}} />
      </AbsoluteFill>
    );
  if (theme === 'green')
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)', overflow: 'hidden'}}>
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, transform: `rotate(${t * 4}deg)`, transformOrigin: '540px 1000px'}}>
          {Array.from({length: 28}).map((_, k) => {
            const a = (k / 28) * Math.PI * 2;
            return <line key={k} x1={540 + Math.cos(a) * 380} y1={1000 + Math.sin(a) * 380} x2={540 + Math.cos(a) * (520 + (k % 3) * 60)} y2={1000 + Math.sin(a) * (520 + (k % 3) * 60)} stroke="rgba(255,255,255,0.15)" strokeWidth="14" strokeLinecap="round" />;
          })}
        </svg>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)', overflow: 'hidden'}}>
      {Array.from({length: 36}).map((_, k) => (
        <div key={k} style={{position: 'absolute', left: rnd(k * 3 + i) * 1080, top: rnd(k * 5 + i) * 1920, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.06 + 0.12 * Math.abs(Math.sin(t * 0.7 + k))}} />
      ))}
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

/** clothes rail across the top: a hanger per strategy, a garment appears as each one is covered */
const Rail: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  if (t > END_AT) return null;
  const bar = theme === 'cream' ? 'linear-gradient(180deg,#bdbdbd,#f4f4f4 45%,#9a9a9a)' : 'linear-gradient(180deg,#8a8a8a,#e6e6e6 45%,#777)';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 160}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 20, height: 12, borderRadius: 6, background: bar, boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}} />
      {RAIL.map((g, i) => {
        const at = SW[i + 1] + FLIP;
        const on = t >= at;
        const sw = on ? 18 * Math.exp(-(t - at) * 2.6) * Math.sin((t - at) * 8) : Math.sin(t * 1.5 + i) * 2;
        return (
          <div key={i} style={{position: 'absolute', left: 150 + i * 175, top: 0, width: 110, transformOrigin: '55px 24px', transform: `rotate(${sw}deg)`}}>
            <Img src={staticFile('cloth3d/hanger.png')} style={{width: 110, height: 110, marginTop: -8, opacity: on ? 1 : 0.55}} />
            {on && <Img src={fl(g)} style={{position: 'absolute', left: 8, top: 50, width: 94, height: 94, transform: `scale(${sp(t, at)})`}} />}
          </div>
        );
      })}
    </div>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const e = busy ? (1 - Math.cos(Math.PI * pg.p)) / 2 : 1;
  const theme = THEMES[busy && e < 0.5 ? pg.i - 1 : pg.i];
  // after a new "garment" slides in on the rail it keeps swinging a little
  const since = t - (SW[pg.i] + FLIP);
  const swing = pg.i > 0 && since > 0 ? 3.2 * Math.exp(-since * 3) * Math.sin(since * 7) : 0;
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {busy && (
          <AbsoluteFill style={{transform: `translateX(${-e * 1080}px) rotate(${e * 4}deg)`, transformOrigin: '50% 0%'}}>
            <PageView i={pg.i - 1} t={t} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{transform: busy ? `translateX(${(1 - e) * 1080}px) rotate(${(1 - e) * -5}deg)` : `rotate(${swing}deg)`, transformOrigin: '50% 0%', boxShadow: busy ? '-30px 0 60px rgba(0,0,0,0.4)' : undefined}}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        <Rail t={t} theme={theme} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
