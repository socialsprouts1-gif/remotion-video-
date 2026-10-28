import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import {STAGES, STATIONS, TH, THEMES, Theme, fl} from './stations';

const GAP = 1200; // world distance between stations (each colour panel is GAP wide)
const Y_THREAD = 1340;
const MOVE = 0.95;
const SW = LINE.map((l, i) => (i === 0 ? 0 : l - 0.4));
const END_AT = WE(9, 13) + 0.6;

const camAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  if (i === 0) return {x: 0, p: 1, i};
  const p = eio(t, SW[i], MOVE);
  return {x: lerp((i - 1) * GAP, i * GAP, p), p, i};
};
/** theme of whatever panel is under the screen centre */
const themeAt = (camX: number): Theme => THEMES[Math.max(0, Math.min(THEMES.length - 1, Math.round(camX / GAP)))];

const clockAt = (t: number): {txt: string; night: boolean} => {
  if (t < SW[1]) return {txt: 'The journey', night: false};
  if (t < W(2, 3)) return {txt: '11:02 PM', night: true};
  if (t < W(2, 8)) return {txt: '→ 9:00 AM', night: false};
  if (t < SW[3]) return {txt: '11:02:30 PM', night: true};
  if (t < SW[4]) return {txt: '11:03 PM', night: true};
  if (t < SW[5]) return {txt: '11:05 PM', night: true};
  if (t < W(5, 10) - 0.1) return {txt: 'Next day · 10 AM', night: false};
  if (t < SW[6]) return {txt: 'Sunday · 11 AM', night: false};
  if (t < W(6, 10)) return {txt: 'Sunday · 1 PM', night: false};
  if (t < W(6, 15)) return {txt: 'Day 3', night: false};
  if (t < SW[7]) return {txt: 'Day 5', night: false};
  if (t < SW[8]) return {txt: 'Day 14', night: false};
  if (t < SW[9]) return {txt: '24 × 7', night: false};
  return {txt: 'Now', night: false};
};

const Header: React.FC<{t: number; theme: Theme; end: boolean}> = ({t, theme, end}) => {
  const c = clockAt(t);
  let changed = 0;
  for (let dt = 0; dt < 0.35; dt += 1 / 30) if (clockAt(t - dt).txt !== c.txt) changed = 1 - dt / 0.35;
  const pill = theme === 'cream' ? {bg: '#fff', fg: C.ink} : theme === 'green' ? {bg: 'rgba(255,255,255,0.18)', fg: '#fff'} : {bg: 'rgba(255,255,255,0.09)', fg: '#fff'};
  return (
    <div style={{position: 'absolute', top: 236, left: 90, right: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: theme === 'cream' ? '#3A3631' : 'rgba(255,255,255,0.82)'}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: theme === 'green' ? '#fff' : C.green}} />
        @NEURAXINE
      </div>
      {!end && (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: pill.bg, color: pill.fg, borderRadius: 30, padding: '8px 20px 8px 10px', fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: theme === 'cream' ? '0 6px 16px rgba(0,0,0,0.06)' : 'none'}}>
          <Img src={fl(c.night ? 'crescent_moon' : 'alarm_clock')} style={{width: 34, height: 34}} />
          <span style={{display: 'inline-block', transform: `translateY(${changed * -12}px)`, opacity: 1 - changed * 0.8}}>{c.txt}</span>
        </div>
      )}
    </div>
  );
};

// ---- captions: same boxed-word style as the salon edit ---------------------
type Chunk = {ws: typeof WORDS; s: number};
const CHUNKS: Chunk[] = [];
WORDS.forEach((w, i) => {
  const prev = WORDS[i - 1];
  const last = CHUNKS[CHUNKS.length - 1];
  if (!last || !prev || prev.line !== w.line || /[,.?!]$/.test(prev.w) || last.ws.length >= 3) CHUNKS.push({ws: [w], s: w.s});
  else last.ws.push(w);
});
const KEY = /^"?(whatsapp|instagram|dm|ai|hot|alert|deal|lead|leads|buyer|reply|site|visit|booking|24)"?[,.?!]*$/i;
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

// ---- per-station colour panel (world space) ---------------------------------
const Panel: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const base: React.CSSProperties = {position: 'absolute', left: i * GAP - 60, top: 0, width: GAP + 2, height: 1920, overflow: 'hidden'};
  if (theme === 'dark')
    return (
      <div style={{...base, background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #2A2622 0%, #171513 55%, #0C0B0A 100%)'}}>
        {Array.from({length: 36}).map((_, k) => (
          <div key={k} style={{position: 'absolute', left: rnd(k + i * 50) * 1200, top: rnd(k + 80 + i * 50) * 1920, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.08 + 0.15 * Math.abs(Math.sin(t * 0.8 + k))}} />
        ))}
      </div>
    );
  if (theme === 'green')
    return (
      <div style={{...base, background: 'radial-gradient(ellipse 70% 50% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)'}}>
        <svg width="1200" height="1920" style={{position: 'absolute', inset: 0, transform: `rotate(${t * 4}deg)`, transformOrigin: '600px 920px'}}>
          {Array.from({length: 28}).map((_, k) => {
            const a = (k / 28) * Math.PI * 2;
            const r0 = 360;
            const r1 = 360 + 140 + (k % 3) * 60;
            return <line key={k} x1={600 + Math.cos(a) * r0} y1={920 + Math.sin(a) * r0} x2={600 + Math.cos(a) * r1} y2={920 + Math.sin(a) * r1} stroke="rgba(255,255,255,0.18)" strokeWidth="14" strokeLinecap="round" />;
          })}
        </svg>
      </div>
    );
  return (
    <div style={{...base, background: C.cream}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.035) 2px, transparent 2px)', backgroundSize: '54px 54px'}} />
      <div style={{position: 'absolute', left: 200 + Math.sin(t * 0.4 + i) * 60, top: 1420, width: 800, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,200,225,0.55), rgba(190,220,200,0.25) 50%, transparent 70%)', filter: 'blur(40px)'}} />
    </div>
  );
};

/** journey thread: drawn per panel so it takes each panel's colours */
const Thread: React.FC<{t: number; camX: number}> = ({t, camX}) => {
  const dotX = camX + 540;
  const total = (STATIONS.length - 1) * GAP;
  return (
    <>
      {THEMES.map((th, i) => {
        const x0 = Math.max(540, i * GAP - 60);
        const x1 = Math.min(540 + total, i * GAP + GAP - 60);
        if (x1 <= x0) return null;
        const dim = th === 'cream' ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.2)';
        const lit = th === 'green' ? '#fff' : C.green;
        const litW = clamp01((dotX - x0) / (x1 - x0)) * (x1 - x0);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x0, top: Y_THREAD, width: x1 - x0, height: 4, background: `repeating-linear-gradient(90deg, ${dim} 0 18px, transparent 18px 34px)`}} />
            {litW > 0 && <div style={{position: 'absolute', left: x0, top: Y_THREAD - 1, width: litW, height: 6, borderRadius: 3, background: lit}} />}
          </React.Fragment>
        );
      })}
      {STAGES.map((s, i) => {
        const x = 540 + i * GAP;
        const th = THEMES[i];
        const reached = dotX >= x - 2;
        const on = th === 'green' ? '#fff' : C.green;
        const off = th === 'cream' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)';
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 13, top: Y_THREAD - 11, width: 26, height: 26, borderRadius: 13, background: reached ? on : TH[th].bg, border: `3px solid ${reached ? on : off}`}} />
            <div style={{position: 'absolute', left: x - 150, width: 300, top: Y_THREAD + 30, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: reached ? on : off}}>
              {String(i).padStart(2, '0')} · {s}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

const LeadDot: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  if (t < LINE[1] - 0.5) return null;
  const bg = theme === 'green' ? '#fff' : C.green;
  const fg = theme === 'green' ? C.green : '#fff';
  return (
    <div style={{position: 'absolute', left: 540 - 28, top: Y_THREAD - 26, width: 56, height: 56, borderRadius: 28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: fg, boxShadow: `0 0 0 ${10 + Math.sin(t * 5) * 3}px ${theme === 'green' ? 'rgba(255,255,255,0.25)' : 'rgba(31,157,85,0.22)'}, 0 10px 30px rgba(0,0,0,0.3)`, transform: `scale(${sp(t, LINE[1] - 0.5)})`}}>
      R
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = END_AT;
  const p = ep(t, a, 0.7);
  const click = a + 1.4;
  const followed = t > click;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #2A2622 0%, #171513 55%, #0C0B0A 100%)', clipPath: `circle(${p * 120}% at 50% 70%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${lerp(0.4, 1, sp(t, a + 0.15))}) rotate(${(1 - ep(t, a + 0.15, 0.7)) * -20}deg)`, opacity: ep(t, a + 0.15, 0.3)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 220, height: 165, objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, marginTop: 20, opacity: ep(t, a + 0.3, 0.4)}}>
        Neura<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em'}}>xine</span>
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: '#A8A29A', marginTop: 18, opacity: ep(t, a + 0.5, 0.4)}}>
        LEADS <span style={{color: C.green}}>→</span> BUYERS <span style={{color: C.green}}>→</span> DEALS
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

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(t);
  const prev = camAt(t - 1 / 30);
  const vel = Math.abs(cam.x - prev.x);
  const moving = cam.p < 1;
  const zoom = moving ? 1 - 0.08 * Math.sin(Math.PI * cam.p) : 1 + Math.min(0.025, (t - (SW[cam.i] + MOVE)) * 0.004);
  const theme = themeAt(cam.x);
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%', filter: vel > 3 ? `blur(${Math.min(6, vel * 0.06)}px)` : undefined}}>
          <div style={{position: 'absolute', left: -cam.x, top: 0, width: STATIONS.length * GAP, height: 1920}}>
            {THEMES.map((th, i) => (Math.abs(i - cam.x / GAP) < 1.2 ? <Panel key={i} theme={th} t={t} i={i} /> : null))}
            <Thread t={t} camX={cam.x} />
            {STATIONS.map((S, i) =>
              Math.abs(i - cam.x / GAP) < 1.2 ? (
                <div key={i} style={{position: 'absolute', left: i * GAP, top: 0, width: 1080, height: 1920}}>
                  <S t={t} th={TH[THEMES[i]]} />
                </div>
              ) : null,
            )}
          </div>
        </AbsoluteFill>
        <LeadDot t={t} theme={theme} />
        <Header t={t} theme={theme} end={t > END_AT} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
