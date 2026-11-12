import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SPEED, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './car';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 1.0;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const STAGES: [string, string][] = [
  ['Enquiry', 'speech_balloon'],
  ['Price + EMI', 'money_bag'],
  ['Test drive', 'round_pushpin'],
  ['Follow-up', 'bank'],
  ['Delivery', 'key'],
  ['Service', 'wrench'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'Car showrooms', img: 'automobile'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|car|showroom|marketing|automation|launch|enquiry|delivery|suv|reel|price|on-road|emi|test|drive|reminder|location|family|follow-up:|exchange|loan|approval|photo|shoutout|service|bhai|trust|referrals|details|guide|follow|neuraxine|comment)"?[,.?!:]*$/i;
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

// ---- pages: road edges in cream / black / green --------------------------------------
const BG: Record<Theme, string> = {
  cream: C.cream,
  dark: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)',
  green: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)',
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const lane = theme === 'cream' ? 'rgba(15,122,60,0.35)' : 'rgba(255,255,255,0.22)';
  const kerb = theme === 'cream' ? C.ink : '#fff';
  return (
    <AbsoluteFill style={{background: BG[theme], overflow: 'hidden'}}>
      {theme === 'cream' && <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 2px, transparent 2px)', backgroundSize: '36px 36px'}} />}
      {/* lane markings moving down both sides, like driving forward */}
      {[42, 1030].map((x) => (
        <div key={x} style={{position: 'absolute', left: x, top: 0, bottom: 0, width: 8, backgroundImage: `repeating-linear-gradient(180deg, ${lane} 0 60px, transparent 60px 120px)`, backgroundPosition: `0 ${(t * 260) % 120}px`}} />
      ))}
      {/* kerb stripes top & bottom */}
      {[0, 1904].map((y) => (
        <div key={y} style={{position: 'absolute', left: 0, right: 0, top: y, height: 16, backgroundImage: `repeating-linear-gradient(90deg, ${kerb} 0 40px, ${C.green} 40px 80px)`, opacity: 0.8}} />
      ))}
      <div style={{position: 'absolute', right: 74, bottom: 60, fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.2em', color: lane}}>KM {String((i + 1) * 12).padStart(3, '0')}</div>
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

/** speedometer under the header: the needle climbs as the deal moves forward */
const Speedo: React.FC<{t: number; theme: Theme; i: number}> = ({t, theme, i}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const from = SPEED[Math.max(0, i - 1)];
  const to = SPEED[i];
  const k = sp(t, SW[i] + FLIP * 0.7, 0.8);
  const v = lerp(from, to, Math.min(1.08, k));
  const ang = -120 + v * 240;
  const ink = theme === 'cream' ? C.ink : '#fff';
  const acc = theme === 'green' ? '#fff' : C.green;
  const R = 70;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [100 + Math.sin((a * Math.PI) / 180) * R, 100 - Math.cos((a * Math.PI) / 180) * R];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <div style={{position: 'absolute', left: 440, top: 52, width: 200, height: 180, opacity: ep(t, at0, 0.4)}}>
      <svg width="200" height="180">
        <path d={arc(-120, 120)} fill="none" stroke={ink} strokeOpacity="0.2" strokeWidth="12" strokeLinecap="round" />
        <path d={arc(-120, Math.max(-119, ang))} fill="none" stroke={acc} strokeWidth="12" strokeLinecap="round" />
        {Array.from({length: 9}).map((_, j) => {
          const a = ((-120 + j * 30) * Math.PI) / 180;
          return <line key={j} x1={100 + Math.sin(a) * 50} y1={100 - Math.cos(a) * 50} x2={100 + Math.sin(a) * 58} y2={100 - Math.cos(a) * 58} stroke={ink} strokeOpacity="0.5" strokeWidth="3" />;
        })}
        <line x1="100" y1="100" x2={100 + Math.sin((ang * Math.PI) / 180) * 60} y2={100 - Math.cos((ang * Math.PI) / 180) * 60} stroke={C.red} strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="9" fill={ink} />
        <text x="100" y="150" textAnchor="middle" fontFamily="Geist Mono, monospace" fontWeight="800" fontSize="24" fill={ink}>{Math.round(v * 120)}</text>
        <text x="100" y="170" textAnchor="middle" fontFamily="Geist Mono, monospace" fontWeight="700" fontSize="12" letterSpacing="2" fill={ink} opacity="0.6">DEAL KM/H</text>
      </svg>
    </div>
  );
};

/** garage shutter: rolls down over the old scene, then up to reveal the new one */
const Shutter: React.FC<{h: number; theme: Theme}> = ({h, theme}) => {
  const slat = theme === 'dark' ? '#3A3631' : '#D8D2C8';
  const groove = theme === 'dark' ? '#24211E' : '#B9B2A6';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1940, backgroundImage: `repeating-linear-gradient(180deg, ${slat} 0 46px, ${groove} 46px 52px, ${slat} 52px 60px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: C.green, borderTop: '4px solid #145c33'}} />
      <div style={{position: 'absolute', left: 470, bottom: 6, width: 140, height: 16, borderRadius: 8, background: '#1A1A1A'}} />
    </div>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const down = busy && pg.p < 0.5;
  const q = busy ? (down ? pg.p / 0.5 : (pg.p - 0.5) / 0.5) : 1;
  const h = busy ? (down ? 1960 * (1 - Math.pow(1 - q, 3)) : 1960 * (1 - q * q * (3 - 2 * q))) : 0;
  const shown = down ? pg.i - 1 : pg.i;
  const theme = THEMES[shown];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <PageView i={shown} t={t} />
        {busy && <Shutter h={h} theme={THEMES[pg.i]} />}
        <Speedo t={t} theme={theme} i={pg.i} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
