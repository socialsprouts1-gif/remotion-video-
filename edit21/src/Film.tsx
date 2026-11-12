import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SCENES, SCENE_LINE as CARD_LINE, THEMES} from './arc';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 0.75;

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
  ['AI reply', 'sparkles'],
  ['Site visit', 'round_pushpin'],
  ['Proposal', 'page_facing_up'],
  ['Construction', 'building_construction'],
  ['Handover', 'key'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'Architects', img: 'triangular_ruler'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|architecture|firm|marketing|automation|premium|experience|villa|reel|portfolio|site|visit|reminder|family|proposal|estimate|follow-up|photos|progress|update|handover|review|referrals|bharose|details|guide|follow|neuraxine|comment)"?[,.?!]*$/i;
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

// ---- pages: drafting paper in cream / black / green ------------------------------
const GRID: Record<Theme, {bg: string; fine: string; bold: string}> = {
  cream: {bg: C.cream, fine: 'rgba(15,122,60,0.07)', bold: 'rgba(15,122,60,0.14)'},
  dark: {bg: '#141210', fine: 'rgba(255,255,255,0.035)', bold: 'rgba(255,255,255,0.075)'},
  green: {bg: '#1E9A51', fine: 'rgba(255,255,255,0.07)', bold: 'rgba(255,255,255,0.14)'},
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const g = GRID[theme];
  const glow = theme === 'cream' ? 'radial-gradient(ellipse 70% 45% at 50% 60%, rgba(255,255,255,0.7), transparent 70%)' : theme === 'green' ? 'radial-gradient(ellipse 75% 55% at 50% 48%, rgba(255,255,255,0.14), transparent 70%)' : 'radial-gradient(ellipse 80% 55% at 50% 50%, rgba(255,255,255,0.06), transparent 70%)';
  const ink = theme === 'cream' ? 'rgba(15,122,60,0.35)' : 'rgba(255,255,255,0.3)';
  return (
    <AbsoluteFill style={{background: g.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${g.fine} 1px, transparent 1px), linear-gradient(90deg, ${g.fine} 1px, transparent 1px), linear-gradient(${g.bold} 2px, transparent 2px), linear-gradient(90deg, ${g.bold} 2px, transparent 2px)`, backgroundSize: '30px 30px, 30px 30px, 150px 150px, 150px 150px', backgroundPosition: `0 ${(t * 6) % 150}px`}} />
      <div style={{position: 'absolute', inset: 0, background: glow}} />
      {/* title-block corner marks, like a drawing sheet */}
      {[[40, 40, 1, 1], [1040, 40, -1, 1], [40, 1880, 1, -1], [1040, 1880, -1, -1]].map(([x, y, sx, sy], k) => (
        <div key={k} style={{position: 'absolute', left: x - (sx < 0 ? 60 : 0), top: y - (sy < 0 ? 60 : 0), width: 60, height: 60, borderTop: sy > 0 ? `3px solid ${ink}` : undefined, borderBottom: sy < 0 ? `3px solid ${ink}` : undefined, borderLeft: sx > 0 ? `3px solid ${ink}` : undefined, borderRight: sx < 0 ? `3px solid ${ink}` : undefined}} />
      ))}
      <div style={{position: 'absolute', right: 60, bottom: 52, fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: '0.2em', color: ink}}>SHEET {String(i + 1).padStart(2, '0')} / 09 · SCALE 1:100</div>
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

/** elevation drawing under the header: the house gets built as the client journey moves on */
const Elevation: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const ink = theme === 'cream' ? C.ink : '#fff';
  const fill = theme === 'green' ? 'rgba(255,255,255,0.9)' : C.green;
  const st = (k: number) => ep(t, SW[k] + FLIP, 0.8); // stage k drawn after scene k's ruler sweep
  const dash = (len: number, p: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - p)});
  return (
    <div style={{position: 'absolute', left: 290, top: 92, width: 500, height: 128, opacity: ep(t, at0, 0.4)}}>
      <svg width="500" height="128" viewBox="0 0 500 128">
        <line x1="10" y1="118" x2="490" y2="118" stroke={ink} strokeWidth="3" opacity="0.5" />
        {/* 1 plot outline */}
        <rect x="70" y="112" width="360" height="6" fill="none" stroke={ink} strokeWidth="2" strokeDasharray="6 6" opacity={0.6 * st(1)} />
        {/* 2 ground floor */}
        <path d="M 90 118 V 70 H 330 V 118" fill="none" stroke={ink} strokeWidth="3" style={dash(340, st(2))} />
        <rect x="110" y="82" width="120" height="26" fill="none" stroke={ink} strokeWidth="2" style={dash(300, st(2))} />
        {/* 3 upper floor, cantilevered */}
        <path d="M 160 70 V 26 H 400 V 70 H 330" fill="none" stroke={ink} strokeWidth="3" style={dash(400, st(3))} />
        <rect x="270" y="36" width="110" height="24" fill="none" stroke={ink} strokeWidth="2" style={dash(270, st(3))} />
        {/* 4 roof slabs + fins */}
        <path d="M 150 22 H 410 M 80 66 H 340" stroke={ink} strokeWidth="6" style={dash(500, st(4))} />
        {[0, 1, 2, 3].map((k) => <line key={k} x1={180 + k * 14} y1="32" x2={180 + k * 14} y2="66" stroke={ink} strokeWidth="2" style={dash(40, st(5))} />)}
        {/* 5 door + tree */}
        <rect x="270" y="82" width="34" height="36" fill={fill} opacity={st(5)} />
        <circle cx="455" cy="88" r={16 * st(5)} fill={fill} />
        <line x1="455" y1="104" x2="455" y2="118" stroke={ink} strokeWidth="3" opacity={st(5)} />
        {/* 6 handover: glass lights up */}
        <rect x="110" y="82" width="120" height="26" fill={fill} opacity={0.85 * st(6)} />
        <rect x="270" y="36" width="110" height="24" fill="#F2C46A" opacity={st(6)} />
      </svg>
    </div>
  );
};

/** T-square sweeping down the sheet: the new page is drawn in above its edge */
const TSquare: React.FC<{y: number; theme: Theme}> = ({y, theme}) => (
  <div style={{position: 'absolute', left: -20, right: -20, top: y - 18, height: 64, transform: 'rotate(-1.2deg)'}}>
    <div style={{position: 'absolute', inset: 0, background: theme === 'dark' ? '#F4EFE6' : '#151412', borderRadius: 8, boxShadow: '0 18px 40px rgba(0,0,0,0.35)'}} />
    {Array.from({length: 56}).map((_, k) => (
      <div key={k} style={{position: 'absolute', left: 30 + k * 20, top: 0, width: 2, height: k % 5 === 0 ? 24 : 12, background: theme === 'dark' ? '#151412' : '#F4EFE6', opacity: 0.8}} />
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, top: -4, height: 4, background: C.green, boxShadow: `0 0 18px 4px rgba(31,157,85,0.6)`}} />
  </div>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const e = busy ? (1 - Math.cos(Math.PI * pg.p)) / 2 : 1;
  const y = e * 1960;
  const theme = THEMES[busy && e < 0.25 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {busy && (
          <AbsoluteFill style={{transform: `translateY(${e * 40}px)`}}>
            <PageView i={pg.i - 1} t={t} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={busy ? {clipPath: `inset(0 0 ${1920 - y}px 0)`} : undefined}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {busy && <TSquare y={y} theme={THEMES[pg.i]} />}
        <Elevation t={t} theme={theme} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
