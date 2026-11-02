import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SCENES, THEMES} from './shop';

const SW = LINE.map((l, i) => (i === 0 ? 0 : l - 0.6));
const END_AT = WE(9, 16) + 0.6;
const FLIP = 1.0; // close 0.4 + hold 0.15 + open 0.45

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const storyAt = (t: number): {txt: string; img: string} => {
  if (t < SW[2]) return {txt: 'Kalaa Ethnics', img: 'shopping_bags'};
  if (t < SW[3]) return {txt: '1:07 AM', img: 'crescent_moon'};
  if (t < SW[4]) return {txt: '1:27 AM', img: 'crescent_moon'};
  if (t < SW[5]) return {txt: 'Order #1045', img: 'receipt'};
  if (t < SW[6]) return {txt: 'In transit', img: 'delivery_truck'};
  if (t < SW[7]) return {txt: 'Delivered + 2 days', img: 'star'};
  if (t < SW[8]) return {txt: 'New collection', img: 'sparkles'};
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
const KEY = /^"?(whatsapp|instagram|dm|ai|gym|member|members|cart|carts|order|orders|cod|rto|abandoned|repeat|review|kurta|brand|e-commerce|10%|confirm|delivery)"?[,.?!]*$/i;
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

// ---- order tracker under the header -------------------------------------------
const STEPS: [string, () => number][] = [
  ['Cart', () => W(2, 9)],
  ['Order', () => W(4, 5)],
  ['COD ✓', () => W(4, 11) + 0.3],
  ['Shipped', () => W(5, 6)],
  ['Delivered', () => W(5, 9) + 0.5],
  ['Review', () => W(6, 13)],
  ['Repeat', () => W(7, 14)],
];
const Tracker: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const at = SW[2] + 0.6;
  if (t < at || t > END_AT) return null;
  const on = theme === 'green' ? '#fff' : C.green;
  const off = theme === 'cream' ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.2)';
  const txtOff = theme === 'cream' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)';
  const gap = 860 / (STEPS.length - 1);
  let fill = 0;
  STEPS.forEach(([, f], i) => {
    if (t >= f()) fill = i;
  });
  const anyDone = t >= STEPS[0][1]();
  return (
    <div style={{position: 'absolute', left: 110, top: 300, width: 860, height: 80, opacity: ep(t, at, 0.4)}}>
      <div style={{position: 'absolute', left: 0, top: 13, width: 860, height: 6, borderRadius: 3, background: off}} />
      {anyDone && <div style={{position: 'absolute', left: 0, top: 13, width: fill * gap, height: 6, borderRadius: 3, background: on}} />}
      {STEPS.map(([l, f], i) => {
        const done = t >= f();
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: i * gap - 16, top: 0, width: 32, height: 32, borderRadius: 16, background: done ? on : theme === 'cream' ? '#E6E2DA' : '#2A2724', border: `3px solid ${done ? on : off}`, transform: `scale(${done ? lerp(0.6, 1, sp(t, f(), 1.3)) : 0.8})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme === 'green' ? C.green : '#fff', fontSize: 17, fontWeight: 900}}>{done ? '✓' : ''}</div>
            <div style={{position: 'absolute', left: i * gap - 80, width: 160, top: 42, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: done ? on : txtOff}}>{l}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** cardboard box flap (top or bottom half) */
const Flap: React.FC<{top: boolean; angle: number; label: string; closed: number}> = ({top, angle, label, closed}) => (
  <div style={{position: 'absolute', left: 0, width: 1080, height: 962, top: top ? 0 : 958, transformOrigin: top ? '50% 0%' : '50% 100%', transform: `rotateX(${top ? -angle : angle}deg)`, background: top ? 'linear-gradient(180deg,#B9895A,#CFA270 80%,#C49563)' : 'linear-gradient(0deg,#B9895A,#CFA270 80%,#C49563)', boxShadow: '0 0 80px rgba(0,0,0,0.45)', overflow: 'hidden', backfaceVisibility: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 3px, transparent 3px 14px)'}} />
    {/* packing tape along the seam */}
    <div style={{position: 'absolute', left: 0, right: 0, [top ? 'bottom' : 'top']: 0, height: 120, background: 'linear-gradient(180deg, rgba(160,110,50,0.85), rgba(176,122,60,0.9))', opacity: closed}} />
    {top && (
      <div style={{position: 'absolute', left: 300, top: 470, width: 480, height: 290, background: '#FBF8F1', borderRadius: 16, boxShadow: '0 6px 16px rgba(0,0,0,0.2)', padding: 24, fontFamily: MONO, color: C.ink, opacity: closed, transform: `rotate(-3deg)`}}>
        <div style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.12em'}}>NEURAXINE EXPRESS</div>
        <div style={{height: 4, background: C.ink, margin: '12px 0'}} />
        <div style={{fontSize: 20, color: '#6B655C'}}>DELIVER TO</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, marginTop: 4}}>{label}</div>
        <div style={{display: 'flex', gap: 4, marginTop: 18}}>
          {Array.from({length: 26}).map((_, k) => (
            <div key={k} style={{width: k % 3 ? 6 : 11, height: 46, background: C.ink}} />
          ))}
        </div>
      </div>
    )}
  </div>
);

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
        CART <span style={{color: C.green}}>→</span> ORDER <span style={{color: C.green}}>→</span> REPEAT
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

const LABELS = ['', 'Every cart', 'Riya · 1:07 AM', 'WhatsApp nudge', 'COD confirm', 'Live tracking', 'Review', 'New collection', 'Profit', 'Your brand'];
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  // box flaps: close 0..0.4, hold 0.4..0.55, open 0.55..1
  const lt = busy ? pg.p * FLIP : FLIP;
  const closeP = clamp01(lt / 0.4);
  const openP = clamp01((lt - 0.55) / 0.45);
  const ease = (x: number) => (1 - Math.cos(Math.PI * x)) / 2;
  const angle = busy ? (lt < 0.55 ? lerp(100, 0, ease(closeP)) : lerp(0, 100, ease(openP))) : 100;
  const showNew = !busy || lt >= 0.47;
  const cur = showNew ? pg.i : pg.i - 1;
  const theme = THEMES[cur];
  const closed = busy ? 1 - Math.min(1, angle / 30) : 0;
  const jolt = busy && lt > 0.38 && lt < 0.55 ? Math.sin((lt - 0.38) * 90) * 10 * (1 - (lt - 0.38) / 0.17) : 0;
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{transform: `scale(${busy ? 1 - 0.04 * Math.sin(Math.PI * pg.p) : 1})`}}>
          <PageView i={cur} t={t} />
        </AbsoluteFill>
        {busy && (
          <AbsoluteFill style={{perspective: 2200, transform: `translateY(${jolt}px)`}}>
            <Flap top angle={angle} label={LABELS[pg.i]} closed={closed} />
            <Flap top={false} angle={angle} label="" closed={closed} />
          </AbsoluteFill>
        )}
        <Header t={t} theme={theme} />
        <Tracker t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
