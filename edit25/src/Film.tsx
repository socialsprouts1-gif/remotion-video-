import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {FLOOR, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './hotel';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 1.05;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const STAGES: [string, string][] = [
  ['Enquiry', 'mobile_phone'],
  ['Direct booking', 'key'],
  ['Pre-arrival', 'door'],
  ['In-stay', 'candle'],
  ['Check-out', 'star'],
  ['Repeat stay', 'repeat_button'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'Hotels & resorts', img: 'bellhop_bell'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|hotel|resort|marketing|automation|pool|guest|guests|direct|booking|bookings|repeat|stay|villa|reel|anniversary|room|10%|ota|commission|check-in|spa|offer|cake|candle-light|dinner|book|check-out|review|reminder|dost|details|guide|follow|neuraxine|comment)"?[,.?!:]*$/i;
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

// ---- pages: hotel arch frames in cream / black / green ---------------------------------
const BG: Record<Theme, string> = {
  cream: C.cream,
  dark: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)',
  green: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)',
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const ink = theme === 'cream' ? 'rgba(15,122,60,0.3)' : 'rgba(255,255,255,0.18)';
  return (
    <AbsoluteFill style={{background: BG[theme], overflow: 'hidden'}}>
      {theme === 'cream' && <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 2px, transparent 2px)', backgroundSize: '36px 36px'}} />}
      {/* double arch, like a resort doorway */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 300, bottom: 40, border: `3px solid ${ink}`, borderRadius: '500px 500px 30px 30px'}} />
      <div style={{position: 'absolute', left: 56, right: 56, top: 316, bottom: 56, border: `1.5px solid ${ink}`, borderRadius: '490px 490px 22px 22px'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.3em', color: ink}}>ROOM {200 + (i + 1) * 1}</div>
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

/** elevator floor indicator under the header: goes up a floor at every stage */
const Elevator: React.FC<{t: number; theme: Theme; i: number}> = ({t, theme, i}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const f = FLOOR[i];
  const moving = i > 0 && FLOOR[i - 1] !== f && t < SW[i] + FLIP + 0.6;
  const ink = theme === 'cream' ? C.ink : '#fff';
  return (
    <div style={{position: 'absolute', left: 390, top: 80, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: ep(t, at0, 0.4)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#111', borderRadius: 14, padding: '6px 18px', border: `2px solid ${theme === 'cream' ? '#111' : 'rgba(255,255,255,0.25)'}`}}>
        <span style={{color: '#7CE0A3', fontSize: 26, opacity: moving ? (Math.sin(t * 14) > 0 ? 1 : 0.3) : 0.3}}>▲</span>
        <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: '#7CE0A3', textShadow: '0 0 12px rgba(124,224,163,0.7)', minWidth: 30, textAlign: 'center'}}>{f}</span>
      </div>
      <div style={{display: 'flex', gap: 8}}>
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <div key={k} style={{width: 30, height: 30, borderRadius: 15, border: `2px solid ${ink}`, background: k <= f ? (theme === 'green' ? '#fff' : C.green) : 'transparent', opacity: k <= f ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 14, color: k <= f ? (theme === 'green' ? C.green : '#fff') : ink}}>{k}</div>
        ))}
      </div>
    </div>
  );
};

/** keycard lock on the old page's door: swipe -> green light */
const Lock: React.FC<{p: number}> = ({p}) => {
  const ok = p > 0.7;
  return (
    <div style={{position: 'absolute', right: 70, top: 880, width: 120, height: 220, borderRadius: 20, background: '#1A1A1A', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '3px solid #D8B46A'}}>
      <div style={{position: 'absolute', left: 50, top: 22, width: 20, height: 20, borderRadius: 10, background: ok ? '#3BE07A' : '#E5484D', boxShadow: `0 0 18px 4px ${ok ? 'rgba(59,224,122,0.8)' : 'rgba(229,72,77,0.6)'}`}} />
      <div style={{position: 'absolute', left: 54, top: 60, width: 12, height: 130, borderRadius: 6, background: '#000'}} />
      <Img src={staticFile('htl3d/keycard.png')} style={{position: 'absolute', left: -160, top: lerp(-260, 10, p), width: 300, height: 300, transform: 'rotate(80deg)', opacity: p < 1 ? 1 : 0}} />
    </div>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const swipe = busy ? clamp01(pg.p / 0.3) : 0;
  const open = busy ? clamp01((pg.p - 0.3) / 0.7) : 1;
  const e = (1 - Math.cos(Math.PI * open)) / 2;
  const theme = THEMES[busy && e < 0.5 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={busy ? {transform: `scale(${lerp(0.94, 1, e)})`} : undefined}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {busy && (
          <AbsoluteFill style={{perspective: 2400, perspectiveOrigin: '0% 50%'}}>
            <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${-e * 105}deg)`, boxShadow: `${e * 60}px 0 80px rgba(0,0,0,${0.6 * Math.sin(e * Math.PI)})`, backfaceVisibility: 'hidden'}}>
              <PageView i={pg.i - 1} t={t} />
              <Lock p={swipe} />
              <div style={{position: 'absolute', right: 90, top: 1130, width: 80, height: 22, borderRadius: 11, background: '#D8B46A', boxShadow: '0 6px 12px rgba(0,0,0,0.4)'}} />
              <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,0) 40%, rgba(0,0,0,${e * 0.5}))`}} />
            </AbsoluteFill>
          </AbsoluteFill>
        )}
        <Elevator t={t} theme={theme} i={pg.i} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
