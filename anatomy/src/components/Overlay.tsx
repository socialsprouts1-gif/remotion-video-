import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND} from '../config';
import {B} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, pt} from '../lib/anim';
import {Words} from './Type';

const CHAPTERS = [
  {name: 'UNDERSTAND', line: 'Reads the intent, not just the words.'},
  {name: 'RECALL', line: 'Finds the answer in your business knowledge.'},
  {name: 'REPLY', line: 'Writes back in your voice. Instantly.'},
  {name: 'QUALIFY', line: "Knows who's ready to buy."},
  {name: 'BOOK', line: 'Turns the conversation into a booking.'},
];

/** Chapter header (top), descriptor (bottom) and a progress rail down the left edge. */
const Chapters: React.FC<{t: number}> = ({t}) => {
  const ch = B.ch;
  const railIn = pt(t, ch[0], ch[0] + 0.6) * (1 - pt(t, ch[5] - 0.3, ch[5] + 0.2));
  return (
    <>
      {CHAPTERS.map((c, i) => {
        const a = ch[i];
        const b = ch[i + 1];
        if (t < a - 0.05 || t > b + 0.1) return null;
        const inP = pt(t, a + 0.1, a + 0.8, ease.out);
        const out = pt(t, b - 0.45, b - 0.05, ease.in);
        const track = lerp(0.9, 0.42, inP);
        return (
          <React.Fragment key={c.name}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, opacity: inP * (1 - out), filter: `blur(${(1 - inP) * 10 + out * 10}px)`}}>
              <div style={{fontSize: 30, fontWeight: 700, color: C.lime, letterSpacing: '0.3em'}}>{`0${i + 1}`}</div>
              <div style={{fontSize: 64, fontWeight: 800, color: C.white, letterSpacing: `${track}em`, marginTop: 4, marginRight: `-${track}em`}}>{c.name}</div>
            </div>
            <Words t={t} text={c.line} at={a + 0.5} out={b - 0.5} size={44} weight={600} color={C.metal} y={1610} stagger={0.045} />
          </React.Fragment>
        );
      })}
      {/* rail */}
      <div style={{position: 'absolute', left: 62, top: 760, height: 400, width: 40, opacity: railIn}}>
        <div style={{position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.12)'}} />
        <div style={{position: 'absolute', left: 19, top: 0, width: 2, height: `${Math.min(1, Math.max(0, (t - ch[0]) / (ch[5] - ch[0]))) * 100}%`, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
        {CHAPTERS.map((c, i) => {
          const on = t >= ch[i];
          const cur = t >= ch[i] && t < ch[i + 1];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 20 - (cur ? 9 : 6),
                top: i * 100 - (cur ? 9 : 6),
                width: cur ? 18 : 12,
                height: cur ? 18 : 12,
                borderRadius: 18,
                background: on ? C.lime : '#1A1F1C',
                border: on ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                boxShadow: cur ? `0 0 16px ${C.lime}` : undefined,
              }}
            />
          );
        })}
      </div>
    </>
  );
};

/** Horizontal anamorphic flare at the big moments. */
const Streak: React.FC<{t: number; at: number; y?: number; w?: number}> = ({t, at, y = 960, w = 1}) => {
  const p = pt(t, at - 0.05, at + 0.15) * (1 - pt(t, at + 0.15, at + 0.9));
  if (p <= 0) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 700 * w * p, width: 1400 * w * p, top: y - 2, height: 4, borderRadius: 4, background: `linear-gradient(90deg, transparent, rgba(${C.limeRGB},0.9), #fff, rgba(${C.limeRGB},0.9), transparent)`, opacity: p, boxShadow: `0 0 30px rgba(${C.limeRGB},0.8)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 300, height: 600, background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(${C.limeRGB},${0.18 * p}), transparent 70%)`}} />
    </>
  );
};

const Final: React.FC<{t: number}> = ({t}) => {
  if (t < B.implode[1] - 0.2) return null;
  const lg = pt(t, B.logoIn[0], B.logoIn[1], ease.out);
  const sweep = pt(t, B.logoIn[1], B.logoIn[1] + 1.1, ease.inOut);
  const cta = pt(t, B.cta, B.cta + 0.7);
  const halo = pt(t, B.logoIn[0], B.logoIn[0] + 1.6, ease.out);
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 300 * halo, top: 760 - 300 * halo, width: 600 * halo, height: 600 * halo, borderRadius: 999, border: `2px solid rgba(${C.limeRGB},${0.6 * (1 - halo)})`}} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 270,
          top: 760 - 270,
          width: 540,
          height: 540,
          opacity: lg,
          transform: `scale(${lerp(1.25, 1, lg)})`,
          filter: `blur(${(1 - lg) * 18}px)`,
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(circle, black 52%, transparent 70%)',
          maskImage: 'radial-gradient(circle, black 52%, transparent 70%)',
        }}
      >
        <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)', transform: `translateX(${lerp(-70, 70, sweep)}%)`, opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
      </div>
      <Words t={t} text="Every reply," at={B.tagline} size={96} y={1130} />
      <Words t={t} text="*engineered.*" at={B.tagline + 0.25} size={116} y={1255} stagger={0.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1470, textAlign: 'center', fontFamily: FONT, opacity: cta, transform: `translateY(${(1 - cta) * 18}px)`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 600, letterSpacing: '0.32em', color: C.white}}>
          <span style={{width: 11, height: 11, borderRadius: 11, background: C.lime, boxShadow: `0 0 14px ${C.lime}`}} />
          {BRAND.name}
        </div>
        <div style={{fontSize: 26, fontWeight: 500, color: C.grey, marginTop: 14, letterSpacing: '0.04em'}}>{BRAND.sub}</div>
      </div>
    </>
  );
};

export const Overlay: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Streak t={t} at={B.flash} y={1020} />
    <Streak t={t} at={B.chars[0]} y={1020} w={0.8} />
    <Streak t={t} at={B.implode[1]} y={760} w={1.1} />
    <Words t={t} text="One *message.*" at={B.textOne[0]} out={B.textOne[1] - 0.35} size={110} y={1440} />
    <Words t={t} text="The anatomy" at={B.title[0]} out={B.title[1] - 0.4} size={104} y={1380} />
    <Words t={t} text="of a *reply.*" at={B.title[0] + 0.25} out={B.title[1] - 0.4} size={104} y={1510} />
    <Chapters t={t} />
    <Words t={t} text="Now do that for" at={B.textEvery} out={B.implode[0] - 0.2} size={84} y={1480} />
    <Words t={t} text="*every* message." at={B.textEvery + 0.25} out={B.implode[0] - 0.2} size={84} y={1590} />
    <Final t={t} />
  </AbsoluteFill>
);
