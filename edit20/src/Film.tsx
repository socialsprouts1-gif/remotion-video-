import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SCENES, SCENE_LINE as CARD_LINE, STAMPS, THEMES} from './sal';

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
  for (let k = 5; k >= 1; k--) if (t >= SW[k]) return {txt: `Strategy ${k}/5`, img: STAMPS[k - 1]};
  return {txt: 'Salons & clinics', img: 'barber_pole'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|gym|member|members|salon|clinic|repeat|visit|strategies|appointment|reminder|whatsapp|automatic|before|after|permission|bharosa|package|review|sasta|chair|customer|details|guide|dm|follow|neuraxine|comment)"?[,.?!]*$/i;
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

/** loyalty stamp card under the header: one stamp per strategy covered */
const StampCard: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const dark = theme === 'dark';
  return (
    <div style={{position: 'absolute', left: 230, right: 230, top: 120, height: 96, borderRadius: 20, background: dark ? '#22201D' : '#fff', border: `2px dashed ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 18px', boxShadow: '0 10px 24px rgba(0,0,0,0.15)', opacity: ep(t, at0, 0.4)}}>
      {STAMPS.map((g, i) => {
        const at = SW[i + 1] + FLIP;
        const on = t >= at;
        return (
          <div key={i} style={{position: 'relative', width: 66, height: 66, borderRadius: 33, border: `3px ${on ? 'solid' : 'dashed'} ${on ? C.green : dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(31,157,85,0.12)' : 'transparent'}}>
            {on ? <Img src={fl(g)} style={{width: 44, height: 44, transform: `rotate(-12deg) scale(${lerp(2.2, 1, sp(t, at, 1.4))})`, opacity: ep(t, at, 0.08)}} /> : <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 20, color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}}>{i + 1}</span>}
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
  const deg = e * 360;
  const theme = THEMES[busy && e < 0.5 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  // clock-hand sweep: the new scene is revealed by a hand turning around the centre
  const mask = `conic-gradient(from 0deg at 50% 52%, #000 ${deg}deg, transparent ${deg + 0.5}deg)`;
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {busy && (
          <AbsoluteFill style={{transform: `scale(${1 - e * 0.04})`}}>
            <PageView i={pg.i - 1} t={t} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={busy ? {WebkitMaskImage: mask, maskImage: mask} : undefined}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {busy && (
          <div style={{position: 'absolute', left: 540 - 4, top: 998 - 1300, width: 8, height: 1300, background: '#fff', borderRadius: 4, transformOrigin: '50% 100%', transform: `rotate(${deg}deg)`, boxShadow: '0 0 30px 6px rgba(31,157,85,0.6)'}} />
        )}
        {busy && <div style={{position: 'absolute', left: 540 - 22, top: 998 - 22, width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.4)'}} />}
        <StampCard t={t} theme={theme} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
