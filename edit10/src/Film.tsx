import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, icon, lerp, rnd, sp} from './ui';
import {S0, S1, S2, S3, S4, S5, S6a, S6b, S7, S8, Theme} from './scenes';

type Seg = [string, boolean?]; // [text, serif italic]
type Scene = {
  at: number;
  theme: Theme;
  mark: string;
  badge?: string;
  title?: Seg[][];
  trans: 'wipe' | 'circle' | 'none';
  body: (t: number, at: number) => React.ReactNode;
};

const END_AT = WE(8, 9) + 0.5;
const SCENES: Scene[] = [
  {at: 0, theme: 'dark', mark: 'SALON', title: [[['If we managed your']], [['salon', true]]], trans: 'none', body: (t) => <S0 t={t} />},
  {at: LINE[1] - 0.25, theme: 'cream', mark: 'WHATSAPP', badge: '01', title: [[['Automate '], ['every', true]], [['enquiry']]], trans: 'wipe', body: (t) => <S1 t={t} />},
  {at: LINE[2] - 0.25, theme: 'dark', mark: 'REPLIES', badge: '02', title: [[['Instant '], ['AI', true]], [['replies']]], trans: 'circle', body: (t) => <S2 t={t} />},
  {at: LINE[3] - 0.25, theme: 'cream', mark: 'BOOKED', badge: '03', title: [[['Book more']], [['appointments', true]]], trans: 'wipe', body: (t) => <S3 t={t} />},
  {at: LINE[4] - 0.25, theme: 'dark', mark: 'FOLLOW', badge: '04', title: [[['Follow up']], [['automatically', true]]], trans: 'circle', body: (t) => <S4 t={t} />},
  {at: LINE[5] - 0.25, theme: 'cream', mark: 'FOCUS', title: [[['More time for']], [['your clients', true]]], trans: 'wipe', body: (t) => <S5 t={t} />},
  {at: LINE[6] - 0.25, theme: 'green', mark: 'ENQUIRIES', title: [[['Enquiries ≠ '], ['full', true], [' chairs']]], trans: 'wipe', body: (t) => <S6a t={t} />},
  {at: W(6, 9) - 0.25, theme: 'cream', mark: 'FULL', title: [[['Fill every '], ['chair', true]]], trans: 'circle', body: (t) => <S6b t={t} />},
  {at: LINE[7] - 0.25, theme: 'cream', mark: 'YOU?', title: [[["What's your biggest"]], [['problem?', true]]], trans: 'wipe', body: (t) => <S7 t={t} />},
  {at: END_AT, theme: 'dark', mark: 'FOLLOW', trans: 'circle', body: (t, at) => <S8 t={t} at={at} />},
];
const TRANS = 0.5;

const fg = (th: Theme) => (th === 'cream' ? C.ink : '#fff');

// ---- backgrounds ----------------------------------------------------------
const Background: React.FC<{theme: Theme; t: number}> = ({theme, t}) => {
  if (theme === 'dark')
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)'}}>
        {Array.from({length: 40}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: rnd(i) * 1080, top: rnd(i + 50) * 1920, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.08 + 0.15 * Math.abs(Math.sin(t * 0.8 + i))}} />
        ))}
      </AbsoluteFill>
    );
  if (theme === 'green')
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)', overflow: 'hidden'}}>
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, transform: `rotate(${t * 4}deg)`, transformOrigin: '540px 900px'}}>
          {Array.from({length: 28}).map((_, i) => {
            const a = (i / 28) * Math.PI * 2;
            const r0 = 330;
            const r1 = 330 + 140 + (i % 3) * 60;
            return <line key={i} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={900 + Math.sin(a) * r1} stroke="rgba(255,255,255,0.22)" strokeWidth="14" strokeLinecap="round" />;
          })}
        </svg>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.035) 2px, transparent 2px)', backgroundSize: '54px 54px'}} />
      <div style={{position: 'absolute', left: 140 + Math.sin(t * 0.4) * 60, top: 1380, width: 800, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,200,225,0.55), rgba(190,220,200,0.25) 50%, transparent 70%)', filter: 'blur(40px)'}} />
    </AbsoluteFill>
  );
};

const Watermark: React.FC<{text: string; theme: Theme; t: number; at: number}> = ({text, theme, t, at}) => (
  <div
    style={{
      position: 'absolute',
      top: 820,
      left: 0,
      whiteSpace: 'nowrap',
      fontFamily: SANS,
      fontWeight: 900,
      fontSize: 380,
      letterSpacing: '-0.02em',
      color: 'transparent',
      WebkitTextStroke: `3px ${theme === 'cream' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'}`,
      transform: `translateX(${200 - (t - at) * 40}px)`,
      opacity: ep(t, at + 0.2, 0.8),
    }}
  >
    {text}
  </div>
);

// ---- header ----------------------------------------------------------------
const slotsPct = (t: number) => Math.round(lerp(8, 100, clamp01(t / (LINE[7] + 4))));
const Header: React.FC<{theme: Theme; t: number; end?: boolean}> = ({theme, t, end}) => {
  const p = slotsPct(t);
  const pill = theme === 'cream' ? {bg: '#fff', fg: C.ink, track: '#E3DFD7'} : theme === 'green' ? {bg: 'rgba(255,255,255,0.16)', fg: '#fff', track: 'rgba(255,255,255,0.3)'} : {bg: 'rgba(255,255,255,0.08)', fg: '#fff', track: 'rgba(255,255,255,0.18)'};
  return (
    <div style={{position: 'absolute', top: 268, left: 110, right: 110, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: theme === 'cream' ? '#3A3631' : 'rgba(255,255,255,0.8)'}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: theme === 'green' ? '#fff' : C.green}} />
        @NEURAXINE
      </div>
      {!end && (
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: pill.bg, color: pill.fg, borderRadius: 30, padding: '10px 20px', fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: '0.1em', boxShadow: theme === 'cream' ? '0 6px 16px rgba(0,0,0,0.06)' : 'none'}}>
          <Img src={icon('scissors.png')} style={{width: 22, height: 22}} />
          SLOTS BOOKED
          <div style={{width: 90, height: 7, borderRadius: 4, background: pill.track, overflow: 'hidden'}}>
            <div style={{width: `${p}%`, height: '100%', background: p < 25 ? C.red : theme === 'green' ? '#fff' : C.green, borderRadius: 4}} />
          </div>
          {p}%
        </div>
      )}
    </div>
  );
};

// ---- title -------------------------------------------------------------------
const Title: React.FC<{s: Scene; t: number}> = ({s, t}) => {
  if (!s.title) return null;
  let k = 0;
  return (
    <div style={{position: 'absolute', top: 340, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', color: fg(s.theme)}}>
      {s.title.map((row, ri) => (
        <div key={ri} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre', lineHeight: 1.02}}>
          {ri === 0 && s.badge && (
            <div style={{background: s.theme === 'green' ? '#fff' : C.green, color: s.theme === 'green' ? C.green : '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 44, borderRadius: 12, padding: '2px 14px', marginRight: 22, transform: `scale(${sp(t, s.at + 0.1)})`}}>{s.badge}</div>
          )}
          {row.map(([txt, serif], si) => {
            const at = s.at + 0.15 + k++ * 0.12;
            const p = ep(t, at, 0.7);
            return (
              <span
                key={si}
                style={{
                  fontFamily: serif ? SERIF : SANS,
                  fontStyle: serif ? 'italic' : 'normal',
                  fontWeight: serif ? 400 : 700,
                  fontSize: serif ? 104 : 86,
                  letterSpacing: serif ? '-0.01em' : '-0.035em',
                  display: 'inline-block',
                  opacity: p,
                  transform: `translateY(${(1 - p) * 50}px)`,
                  filter: `blur(${(1 - p) * 12}px)`,
                }}
              >
                {txt}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---- captions ----------------------------------------------------------------
type Chunk = {ws: typeof WORDS; s: number};
const CHUNKS: Chunk[] = [];
WORDS.forEach((w, i) => {
  const prev = WORDS[i - 1];
  const last = CHUNKS[CHUNKS.length - 1];
  if (!last || !prev || prev.line !== w.line || /[,.?!]$/.test(prev.w) || last.ws.length >= 3) CHUNKS.push({ws: [w], s: w.s});
  else last.ws.push(w);
});
const KEY = /^"?(whatsapp|instagram|dm|ai|automation|appointments?|follow-ups|enquiries|enquiry|automated|book|comment)"?[,.?!]*$/i;
const Captions: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  if (t > END_AT) return null;
  let ci = -1;
  CHUNKS.forEach((c, i) => {
    if (t >= c.s - 0.05) ci = i;
  });
  if (ci < 0) return null;
  const c = CHUNKS[ci];
  const lastWord = c.ws[c.ws.length - 1];
  const next = CHUNKS[ci + 1];
  if (!next && t > lastWord.e + 0.6) return null;
  const pop = sp(t, c.s - 0.05, 1.3);
  const col = fg(theme);
  return (
    <div style={{position: 'absolute', top: 1530, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 6, transform: `scale(${lerp(0.88, 1, pop)})`, opacity: ep(t, c.s - 0.05, 0.12)}}>
      {c.ws.map((w, i) => {
        const cur = t >= w.s - 0.03 && (i === c.ws.length - 1 || t < c.ws[i + 1].s - 0.03);
        const past = t >= w.s;
        const key = KEY.test(w.w);
        const box = cur ? (key ? C.green : theme === 'cream' || theme === 'green' ? C.ink : '#fff') : 'transparent';
        const tc = cur ? (key || theme !== 'dark' ? '#fff' : C.ink) : col;
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: '-0.03em',
              padding: '2px 14px 6px',
              borderRadius: 12,
              background: box,
              color: tc,
              opacity: past || cur ? 1 : 0.3,
              transform: `scale(${cur ? lerp(0.9, 1, sp(t, w.s - 0.03, 1.6)) : 1})`,
              boxShadow: cur ? '0 10px 24px rgba(0,0,0,0.18)' : 'none',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---- scene layer ------------------------------------------------------------
const SceneLayer: React.FC<{s: Scene; t: number; next?: Scene}> = ({s, t, next}) => {
  const local = t - s.at;
  // being covered by the next scene: push in + blur
  const cover = next ? clamp01((t - next.at) / TRANS) : 0;
  const push = 1 + Math.min(local * 0.006, 0.025) + cover * 0.05;
  const floatY = Math.sin(local * 0.9) * 6;
  let clip = 'none';
  if (s.trans !== 'none' && local < TRANS) {
    const p = ep(t, s.at, TRANS);
    clip = s.trans === 'wipe' ? `inset(0 0 0 ${(1 - p) * 100}%)` : `circle(${p * 125}% at 50% 52%)`;
  }
  const inP = s.trans === 'none' ? 1 : ep(t, s.at, 0.8);
  return (
    <AbsoluteFill style={{clipPath: clip, filter: cover > 0 ? `blur(${cover * 8}px)` : undefined}}>
      <Background theme={s.theme} t={t} />
      <Watermark text={s.mark} theme={s.theme} t={t} at={s.at} />
      <Header theme={s.theme} t={t} end={s === SCENES[SCENES.length - 1]} />
      <AbsoluteFill style={{transform: `scale(${push * lerp(0.94, 1, inP)}) translateY(${floatY}px)`, transformOrigin: '50% 55%'}}>
        <Title s={s} t={t} />
        {s.body(t, s.at)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let cur = 0;
  SCENES.forEach((s, i) => {
    if (t >= s.at) cur = i;
  });
  const capTheme = SCENES[t - SCENES[cur].at < TRANS / 2 && cur > 0 ? cur - 1 : cur].theme;
  const fadeOut = 1 - clamp01((t - (DUR - 0.5)) / 0.5);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fadeOut}}>
        {cur > 0 && t - SCENES[cur].at < TRANS && <SceneLayer s={SCENES[cur - 1]} t={t} next={SCENES[cur]} />}
        <SceneLayer s={SCENES[cur]} t={t} />
        <Captions t={t} theme={capTheme} />
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
