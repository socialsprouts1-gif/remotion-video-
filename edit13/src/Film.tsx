import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {SCENES, THEMES, streakAt} from './gym';

const H = 1920; // each beat is one full-height panel; the camera scrolls down like a feed
const MOVE = 0.85;
const SW = LINE.map((l, i) => (i === 0 ? 0 : l - 0.4));
const END_AT = WE(10, 16) + 0.6;

/** ease-out with a small overshoot, like a flicked feed settling */
const settle = (x: number) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  const u = clamp01(x) - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
};
const camAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  if (i === 0) return {y: 0, p: 1, i};
  const p = clamp01((t - SW[i]) / MOVE);
  return {y: lerp((i - 1) * H, i * H, settle(p)), p, i};
};
const themeAt = (camY: number): Theme => THEMES[Math.max(0, Math.min(THEMES.length - 1, Math.round(camY / H)))];

// ---- story time pill ---------------------------------------------------------
const GAP0 = () => W(5, 2);
const storyAt = (t: number): {txt: string; img: string} => {
  if (t < SW[2]) return {txt: 'PowerZone Gym', img: 'flexed_biceps'};
  if (t < W(3, 13)) return {txt: '10:48 PM', img: 'crescent_moon'};
  if (t < SW[4]) return {txt: 'Kal · 7:00 AM', img: 'sunrise'};
  if (t < GAP0()) return {txt: 'Day 1–14', img: 'calendar'};
  if (t < SW[6]) return {txt: 'Day 15–21', img: 'ghost'};
  if (t < SW[7]) return {txt: 'Day 22', img: 'bell'};
  if (t < SW[8]) return {txt: 'Day 80', img: 'alarm_clock'};
  if (t < SW[9]) return {txt: 'Day 90', img: 'sports_medal'};
  if (t < SW[10]) return {txt: 'Every month', img: 'spiral_calendar'};
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

// ---- Priya's member card, pinned under the header ----------------------------
const statusAt = (t: number): {txt: string; img: string; col: string} => {
  if (t < W(3, 19)) return {txt: 'Enquiry', img: 'speech_balloon', col: '#8C8780'};
  if (t < W(4, 8)) return {txt: 'Trial booked · 7 AM', img: 'admission_tickets', col: '#3D7CC9'};
  if (t < GAP0()) return {txt: 'Member · 3-month plan', img: 'flexed_biceps', col: C.green};
  if (t < W(7, 0)) return {txt: 'Inactive', img: 'sleeping_face', col: C.red};
  if (t < W(8, 0)) return {txt: 'Active again', img: 'woman_running', col: C.green};
  if (t < W(8, 9)) return {txt: 'Renewed · +3 months', img: 'sports_medal', col: C.green};
  return {txt: 'Renewed · referred 1 friend', img: 'wrapped_gift', col: '#C98A00'};
};
const MemberCard: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const at = W(2, 2) - 0.2;
  if (t < at || t > END_AT) return null;
  const s = statusAt(t);
  let changed = 0;
  for (let dt = 0; dt < 0.4; dt += 1 / 30) if (statusAt(t - dt).txt !== s.txt) changed = 1 - dt / 0.4;
  const streak = streakAt(t);
  const dark = theme === 'dark';
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 290, transform: `translateY(${(1 - ep(t, at, 0.6)) * -40}px) scale(${1 + changed * 0.03})`, opacity: ep(t, at, 0.3)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: dark ? '#22201D' : '#fff', borderRadius: 30, padding: '14px 22px 14px 14px', boxShadow: dark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 18px 40px rgba(40,30,20,0.14)', fontFamily: SANS}}>
        <div style={{width: 86, height: 86, borderRadius: 43, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${s.col}`}}>
          <Img src={fl('woman')} style={{width: 62, height: 62}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 32, color: dark ? '#fff' : C.ink}}>Priya Sharma</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 2}}>
            <Img src={fl(s.img)} style={{width: 30, height: 30, transform: `scale(${1 + changed * 0.4})`}} />
            <span style={{fontWeight: 700, fontSize: 24, color: s.col, opacity: 1 - changed * 0.6}}>{s.txt}</span>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, background: streak > 0 ? '#FFF1E6' : dark ? '#2E2B27' : '#F1EFEA', borderRadius: 24, padding: '8px 16px 8px 10px'}}>
          <Img src={fl(streak > 0 ? 'fire' : 'zzz')} style={{width: 36, height: 36}} />
          <span style={{fontWeight: 800, fontSize: 30, color: streak > 0 ? '#E8590C' : '#8C8780'}}>{streak}</span>
        </div>
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
const KEY = /^"?(whatsapp|instagram|dm|ai|gym|member|members|trial|streak|renewal|referral|automated|free|gayab)"?[,.?!]*$/i;
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

// ---- panels -------------------------------------------------------------------
const Panel: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: i * H, width: 1080, height: H + 2, overflow: 'hidden'};
  if (theme === 'dark')
    return (
      <div style={{...base, background: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)'}}>
        {Array.from({length: 36}).map((_, k) => (
          <div key={k} style={{position: 'absolute', left: rnd(k + i * 50) * 1080, top: rnd(k + 80 + i * 50) * H, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.08 + 0.15 * Math.abs(Math.sin(t * 0.8 + k))}} />
        ))}
      </div>
    );
  if (theme === 'green')
    return (
      <div style={{...base, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, #2BB463 0%, #1E9A51 60%, #17803F 100%)'}}>
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, transform: `rotate(${t * 4}deg)`, transformOrigin: '540px 1000px'}}>
          {Array.from({length: 28}).map((_, k) => {
            const a = (k / 28) * Math.PI * 2;
            const r0 = 380;
            const r1 = 380 + 140 + (k % 3) * 60;
            return <line key={k} x1={540 + Math.cos(a) * r0} y1={1000 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={1000 + Math.sin(a) * r1} stroke="rgba(255,255,255,0.16)" strokeWidth="14" strokeLinecap="round" />;
          })}
        </svg>
      </div>
    );
  return (
    <div style={{...base, background: C.cream}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.035) 2px, transparent 2px)', backgroundSize: '54px 54px'}} />
      <div style={{position: 'absolute', left: 140 + Math.sin(t * 0.4 + i) * 60, top: 1400, width: 800, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,200,225,0.55), rgba(190,220,200,0.25) 50%, transparent 70%)', filter: 'blur(40px)'}} />
    </div>
  );
};

// scroll indicator on the right edge, like a story progress rail
const Rail: React.FC<{t: number; camY: number; theme: Theme}> = ({camY, theme}) => {
  const n = SCENES.length;
  const p = camY / ((n - 1) * H);
  const col = theme === 'cream' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
  const on = theme === 'green' ? '#fff' : C.green;
  return (
    <div style={{position: 'absolute', right: 34, top: 700, width: 6, height: 560, borderRadius: 3, background: col}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 6, height: 560 * clamp01(p) + 6, borderRadius: 3, background: on}} />
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
        ENQUIRY <span style={{color: C.green}}>→</span> MEMBER <span style={{color: C.green}}>→</span> RENEWAL
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
  const vel = Math.abs(cam.y - prev.y);
  const moving = cam.p < 1;
  const zoom = moving ? 1 - 0.06 * Math.sin(Math.PI * Math.min(1, cam.p * 1.2)) : 1 + Math.min(0.025, (t - (SW[cam.i] + MOVE)) * 0.004);
  const theme = themeAt(cam.y);
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%', filter: vel > 3 ? `blur(${Math.min(6, vel * 0.05)}px)` : undefined}}>
          <div style={{position: 'absolute', left: 0, top: -cam.y, width: 1080, height: SCENES.length * H}}>
            {THEMES.map((th, i) => (Math.abs(i - cam.y / H) < 1.2 ? <Panel key={i} theme={th} t={t} i={i} /> : null))}
            {SCENES.map((S, i) =>
              Math.abs(i - cam.y / H) < 1.2 ? (
                <div key={i} style={{position: 'absolute', left: 0, top: i * H, width: 1080, height: H}}>
                  <S t={t} th={TH[THEMES[i]]} />
                </div>
              ) : null,
            )}
          </div>
        </AbsoluteFill>
        <Header t={t} theme={theme} />
        <MemberCard t={t} theme={theme} />
        <Rail t={t} camY={cam.y} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
