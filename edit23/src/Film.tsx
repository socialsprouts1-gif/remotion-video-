import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {ROUTE, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './travel';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 0.85;

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
  ['Options', 'sparkles'],
  ['Booked', 'admission_tickets'],
  ['Ready to fly', 'luggage'],
  ['In Goa', 'palm_tree'],
  ['Back home', 'house_with_garden'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'Travel agencies', img: 'airplane'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|travel|agency|marketing|automation|traveller|yaadgaar|trip|goa|package|packages|reel|options|hotel|itinerary|advance|pdf|bookings|flight|cab|checklist|plan|support|review|photos|office|number|referrals|experience|details|guide|follow|neuraxine|comment)"?[,.?!]*$/i;
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

// ---- pages: airmail postcards in cream / black / green -------------------------------
const BG: Record<Theme, string> = {
  cream: C.cream,
  dark: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)',
  green: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)',
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const a = theme === 'green' ? '#fff' : C.green;
  const b = theme === 'cream' ? C.ink : theme === 'green' ? C.ink : '#F4EFE6';
  const stripes = `repeating-linear-gradient(45deg, ${a} 0 26px, transparent 26px 52px, ${b} 52px 78px, transparent 78px 104px)`;
  const band = 16;
  const ink = theme === 'cream' ? 'rgba(15,122,60,0.35)' : 'rgba(255,255,255,0.22)';
  return (
    <AbsoluteFill style={{background: BG[theme], overflow: 'hidden'}}>
      {theme === 'cream' && <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 2px, transparent 2px)', backgroundSize: '36px 36px'}} />}
      {/* airmail border */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: band, background: stripes, opacity: 0.85}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: band, background: stripes, opacity: 0.85}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: band, background: stripes, opacity: 0.85}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: band, background: stripes, opacity: 0.85}} />
      {/* postmark */}
      <div style={{position: 'absolute', right: 70, bottom: 70, width: 150, height: 150, borderRadius: 75, border: `3px solid ${ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-14deg)'}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', color: ink, textAlign: 'center', lineHeight: 1.4}}>PAR AVION<br />{['DEL', 'DEL', 'DEL', 'DEL', 'DEL', 'GOI', 'DEL', 'DEL', 'DEL'][i]} · 0{i + 1}</div>
      </div>
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

/** route map under the header: the plane moves DEL -> GOI and back as the trip goes on */
const qb = (p: number) => {
  const x0 = 40, y0 = 120, cx = 250, cy = -20, x1 = 460, y1 = 120;
  const x = (1 - p) ** 2 * x0 + 2 * (1 - p) * p * cx + p * p * x1;
  const y = (1 - p) ** 2 * y0 + 2 * (1 - p) * p * cy + p * p * y1;
  const dx = 2 * (1 - p) * (cx - x0) + 2 * p * (x1 - cx);
  const dy = 2 * (1 - p) * (cy - y0) + 2 * p * (y1 - cy);
  return {x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI};
};
const RouteHud: React.FC<{t: number; theme: Theme; i: number}> = ({t, theme, i}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const from = ROUTE[Math.max(0, i - 1)];
  const to = ROUTE[i];
  const k = eio(t, SW[i] + FLIP * 0.6, 1.4);
  const p = lerp(from, to, k);
  const back = to < from;
  const pos = qb(clamp01(p));
  const ink = theme === 'cream' ? C.ink : '#fff';
  const done = i >= 6;
  return (
    <div style={{position: 'absolute', left: 290, top: 70, width: 500, height: 160, opacity: ep(t, at0, 0.4)}}>
      <svg width="500" height="160" style={{position: 'absolute', inset: 0}}>
        <path d="M 40 120 Q 250 -20 460 120" fill="none" stroke={ink} strokeWidth="3" strokeDasharray="8 10" opacity="0.45" />
        <path d="M 40 120 Q 250 -20 460 120" fill="none" stroke={theme === 'green' ? '#fff' : C.green} strokeWidth="5" strokeDasharray="600" strokeDashoffset={600 * (1 - (done ? 1 : Math.max(p, i >= 5 ? 1 : 0)))} />
        {[[40, 'DEL'], [460, 'GOI']].map(([x, l]) => (
          <g key={l as string}>
            <circle cx={x as number} cy="120" r="9" fill={ink} />
            <text x={x as number} y="152" textAnchor="middle" fontFamily="Geist Mono, monospace" fontWeight="700" fontSize="20" fill={ink}>{l}</text>
          </g>
        ))}
      </svg>
      <Img src={fl('airplane')} style={{position: 'absolute', left: pos.x - 26, top: pos.y - 26, width: 52, height: 52, transform: `rotate(${pos.a + 45 + (back ? 180 : 0)}deg)`}} />
    </div>
  );
};

/** plane flight wipe: a plane crosses the screen and the next page opens behind it */
const PlaneWipe: React.FC<{x: number; e: number}> = ({x, e}) => (
  <>
    <div style={{position: 'absolute', left: 0, width: Math.max(0, x - 120), top: 935, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9))'}} />
    <div style={{position: 'absolute', left: 0, width: Math.max(0, x - 140), top: 965, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7))'}} />
    <Img src={staticFile('trv3d/plane_side.png')} style={{position: 'absolute', left: x - 300, top: 950 - 300, width: 600, height: 600, transform: `rotate(${-6 + Math.sin(e * Math.PI) * 4}deg)`, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.35))'}} />
  </>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const e = busy ? (1 - Math.cos(Math.PI * pg.p)) / 2 : 1;
  const x = -320 + e * 1720;
  const edge = Math.max(0, Math.min(1080, x - 60));
  const theme = THEMES[busy && e < 0.55 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        {busy && (
          <AbsoluteFill style={{transform: `translateX(${e * 60}px)`}}>
            <PageView i={pg.i - 1} t={t} />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={busy ? {clipPath: `inset(0 ${1080 - edge}px 0 0)`} : undefined}>
          <PageView i={pg.i} t={t} />
        </AbsoluteFill>
        {busy && <PlaneWipe x={x} e={e} />}
        <RouteHud t={t} theme={theme} i={pg.i} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
