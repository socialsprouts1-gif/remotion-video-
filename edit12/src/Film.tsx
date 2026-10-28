import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {N, STAGES, STATIONS} from './stations';

const GAP = 1200; // world distance between stations
const Y_THREAD = 1330;
const MOVE = 0.95;
const SW = LINE.map((l, i) => (i === 0 ? 0 : l - 0.4)); // when the camera leaves for station i
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

// story clock shown top right
const clockAt = (t: number): {txt: string; night: boolean} => {
  if (t < SW[1]) return {txt: 'The journey', night: false};
  if (t < SW[2]) return {txt: '11:02 PM', night: true};
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

const Clock: React.FC<{t: number}> = ({t}) => {
  const c = clockAt(t);
  const k = c.txt;
  // flip animation whenever the label changes
  let changed = 0;
  for (let dt = 0; dt < 0.35; dt += 1 / 30) if (clockAt(t - dt).txt !== k) changed = 1 - dt / 0.35;
  return (
    <div style={{position: 'absolute', top: 160, right: 70, display: 'flex', alignItems: 'center', gap: 12, border: `2px solid ${N.gold}`, borderRadius: 40, padding: '10px 22px 10px 14px', background: 'rgba(10,16,32,0.7)'}}>
      <div style={{width: 36, height: 36, borderRadius: 18, background: c.night ? '#1B2A55' : N.gold, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {c.night ? <Img src={icon('crescent_moon.png')} style={{width: 26, height: 26}} /> : <div style={{width: 3, height: 12, background: '#1A1408', transformOrigin: 'bottom', transform: `translateY(-5px) rotate(${t * 90}deg)`}} />}
      </div>
      <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: '0.1em', textTransform: 'uppercase', color: N.gold2, transform: `translateY(${changed * -14}px)`, opacity: 1 - changed * 0.8}}>{k}</div>
    </div>
  );
};

// ---- captions: karaoke line, current word gold with underline --------------
type Chunk = {ws: typeof WORDS; s: number};
const CHUNKS: Chunk[] = [];
WORDS.forEach((w, i) => {
  const prev = WORDS[i - 1];
  const last = CHUNKS[CHUNKS.length - 1];
  if (!last || !prev || prev.line !== w.line || /[,.?!]$/.test(prev.w) || last.ws.length >= 4) CHUNKS.push({ws: [w], s: w.s});
  else last.ws.push(w);
});
const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > END_AT - 0.2) return null;
  let ci = -1;
  CHUNKS.forEach((c, i) => {
    if (t >= c.s - 0.06) ci = i;
  });
  if (ci < 0) return null;
  const c = CHUNKS[ci];
  const p = ep(t, c.s - 0.06, 0.35);
  return (
    <div style={{position: 'absolute', top: 1480, left: 60, right: 60, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 18px', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      {c.ws.map((w, i) => {
        const cur = t >= w.s - 0.03 && (i === c.ws.length - 1 || t < c.ws[i + 1].s - 0.03);
        const past = t >= w.s - 0.03;
        return (
          <span key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 700, fontSize: 62, letterSpacing: '-0.02em', color: cur ? N.gold : N.text, opacity: past ? 1 : 0.28, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
            {w.w}
            {cur && <span style={{position: 'absolute', left: 0, bottom: -6, height: 5, borderRadius: 3, background: N.gold, width: `${ep(t, w.s - 0.03, 0.25) * 100}%`}} />}
          </span>
        );
      })}
    </div>
  );
};

// ---- journey thread in world space -------------------------------------------
const Thread: React.FC<{t: number; camX: number}> = ({t, camX}) => {
  const total = (STATIONS.length - 1) * GAP;
  const dotX = camX + 540;
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: Y_THREAD, width: total, height: 4, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 18px, transparent 18px 34px)'}} />
      <div style={{position: 'absolute', left: 540, top: Y_THREAD - 1, width: dotX - 540, height: 6, borderRadius: 3, background: `linear-gradient(90deg, rgba(232,182,90,0.2), ${N.gold})`}} />
      {STAGES.map((s, i) => {
        const x = 540 + i * GAP;
        const reached = dotX >= x - 2;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 13, top: Y_THREAD - 11, width: 26, height: 26, borderRadius: 13, background: reached ? N.gold : N.bg, border: `3px solid ${reached ? N.gold : 'rgba(255,255,255,0.3)'}`}} />
            <div style={{position: 'absolute', left: x - 150, width: 300, top: Y_THREAD + 30, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: reached ? N.gold : 'rgba(255,255,255,0.35)'}}>
              {String(i).padStart(2, '0')} · {s}
            </div>
          </React.Fragment>
        );
      })}
      {/* the lead (Rahul) riding the thread */}
      {t > LINE[1] - 0.5 && (
        <div style={{position: 'absolute', left: dotX - 26, top: Y_THREAD - 24, width: 52, height: 52, borderRadius: 26, background: N.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#1A1408', boxShadow: `0 0 0 ${10 + Math.sin(t * 5) * 3}px rgba(232,182,90,0.18), 0 0 40px rgba(232,182,90,0.7)`, transform: `scale(${sp(t, LINE[1] - 0.5)})`}}>
          R
        </div>
      )}
    </>
  );
};

const Background: React.FC<{t: number; camX: number}> = ({t, camX}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 42%, #16213D 0%, #0C1324 55%, #060A14 100%)', overflow: 'hidden'}}>
    {/* parallax dust */}
    {Array.from({length: 70}).map((_, i) => {
      const depth = 0.15 + rnd(i + 2) * 0.35;
      const x = (((rnd(i) * 2400 - camX * depth) % 2400) + 2400) % 2400 - 660;
      return <div key={i} style={{position: 'absolute', left: x, top: rnd(i + 40) * 1920, width: 3 + depth * 4, height: 3 + depth * 4, borderRadius: 4, background: i % 5 ? '#fff' : N.gold, opacity: 0.05 + depth * 0.25 + 0.05 * Math.sin(t + i)}} />;
    })}
    <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,182,90,0.10), transparent 65%)'}} />
  </AbsoluteFill>
);

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = END_AT;
  const p = ep(t, a, 0.6);
  const click = a + 1.4;
  const followed = t > click;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #18233F, #070B15)`, clipPath: `circle(${p * 120}% at 50% 70%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${lerp(0.5, 1, sp(t, a + 0.15))})`, opacity: ep(t, a + 0.15, 0.3)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 230, height: 172, objectFit: 'contain'}} />
      </div>
      <div style={{fontFamily: SERIF, fontSize: 140, color: N.text, lineHeight: 1, marginTop: 10, opacity: ep(t, a + 0.35, 0.5)}}>
        Neura<span style={{fontStyle: 'italic', color: N.gold}}>xine</span>
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: N.sub, marginTop: 18, opacity: ep(t, a + 0.55, 0.5)}}>LEADS → BUYERS → DEALS</div>
      <div style={{position: 'relative', marginTop: 54, opacity: ep(t, a + 0.75, 0.4)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: followed ? N.gold : 'transparent', border: `3px solid ${N.gold}`, color: followed ? '#1A1408' : N.gold, borderRadius: 50, padding: '16px 36px', fontFamily: SANS, fontWeight: 800, fontSize: 34, transform: `scale(${followed ? lerp(0.9, 1, sp(t, click)) : 1})`}}>
          {followed ? 'Following ✓' : 'Follow +'} <span style={{fontWeight: 500, opacity: 0.85}}>@neuraxine</span>
        </div>
        {t > click - 0.5 && <div style={{position: 'absolute', left: 120, top: 30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${N.text}`, transform: `scale(${t > click ? lerp(0.5, 2.2, ep(t, click, 0.6)) : lerp(1.4, 0.6, ep(t, click - 0.5, 0.5))})`, opacity: t > click ? 1 - ep(t, click, 0.6) : 0.9}} />}
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
  const zoom = moving ? 1 - 0.09 * Math.sin(Math.PI * cam.p) : 1 + Math.min(0.03, (t - (SW[cam.i] + MOVE)) * 0.004);
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: N.bg}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <Background t={t} camX={cam.x} />
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%', filter: vel > 3 ? `blur(${Math.min(7, vel * 0.07)}px)` : undefined}}>
          <div style={{position: 'absolute', left: -cam.x, top: 0, width: STATIONS.length * GAP, height: 1920}}>
            <Thread t={t} camX={cam.x} />
            {STATIONS.map((S, i) =>
              Math.abs(i - cam.x / GAP) < 1.2 ? (
                <div key={i} style={{position: 'absolute', left: i * GAP, top: 0, width: 1080, height: 1920}}>
                  <S t={t} />
                </div>
              ) : null,
            )}
          </div>
        </AbsoluteFill>
        {/* HUD */}
        <div style={{position: 'absolute', top: 172, left: 90, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: 'rgba(244,241,234,0.75)'}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: N.gold}} />
          @NEURAXINE
        </div>
        <Clock t={t} />
        <Captions t={t} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
