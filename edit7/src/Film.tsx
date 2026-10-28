import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import edit from './edit.json';

// Storytelling edit (16:9): the talk plays in full, untouched. Cinematic grade, slow camera drift,
// line-by-line captions, and three quiet "emphasis" moments where the frame dims and the line takes the centre.
const C = {warm: '#F4C98B', white: '#FFFFFF', soft: 'rgba(255,255,255,0.72)'};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const SHADOW = '0 2px 4px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.55)';

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const E = (i: number) => WORDS[i].e;
const key = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');

// ---------------------------------------------------------------- emphasis moments (big centred line, frame dims)
type Emph = {from: number; to: number; lines: {words: [number, number]; serif?: boolean; warm?: boolean}[]};
const EMPH: Emph[] = [
  {from: 81, to: 83, lines: [{words: [81, 83], serif: true}]},
  {from: 92, to: 100, lines: [{words: [92, 96]}, {words: [97, 100], serif: true, warm: true}]},
  {from: 136, to: 151, lines: [{words: [136, 139], serif: true}, {words: [140, 142], serif: true}, {words: [143, 147]}, {words: [148, 151], warm: true}]},
];
const emphAt = (t: number) => EMPH.find((m) => t >= W(m.from) - 0.25 && t < E(m.to) + 0.55);
const emphLevel = (t: number) =>
  Math.max(0, ...EMPH.map((m) => pt(t, W(m.from) - 0.35, W(m.from) + 0.15, ease.inOut) * (1 - pt(t, E(m.to) + 0.3, E(m.to) + 0.8, ease.inOut))));

// ---------------------------------------------------------------- captions: phrase by phrase, words rise softly out of blur
const WARM_W = new Set(['lazy', 'options', 'darr', 'excitement', 'better', 'successful', 'months', 'ideas', 'dreams', 'time', 'fail', 'try', 'best', 'normal', 'follow', 'work', 'potential', 'reality']);
type Phrase = {words: Word[]; s: number; e: number};
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    if (EMPH.some((m) => i >= m.from && i <= m.to)) return; // emphasis lines are shown big instead
    cur.push(w);
    const nx = WORDS[i + 1];
    const end = /[.,?!…]$/.test(w.w) || cur.length >= 7 || !nx || nx.s - w.e > 0.4 || EMPH.some((m) => i + 1 === m.from);
    if (end) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.7)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = PHRASES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const out = pt(t, c.e - 0.18, c.e, ease.in);
  return (
    <div style={{position: 'absolute', left: 220, right: 220, top: 640, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 16, opacity: 1 - out, filter: out > 0 ? `blur(${out * 6}px)` : undefined}}>
      {c.words.map((w, i) => {
        const p = pt(t, w.s - 0.06, w.s + 0.28, ease.out);
        const warm = WARM_W.has(key(w.w));
        return (
          <span
            key={i}
            style={{
              fontFamily: warm ? SERIF : SANS,
              fontStyle: warm ? 'italic' : 'normal',
              fontWeight: warm ? 400 : 650,
              fontSize: warm ? 82 : 62,
              letterSpacing: warm ? '0' : '-0.02em',
              lineHeight: 1.15,
              color: warm ? C.warm : C.white,
              opacity: p,
              transform: `translateY(${(1 - p) * 22}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              textShadow: SHADOW,
              display: 'inline-block',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

const Emphasis: React.FC<{t: number}> = ({t}) => {
  const m = emphAt(t);
  if (!m) return null;
  const out = pt(t, E(m.to) + 0.25, E(m.to) + 0.55, ease.in);
  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6, opacity: 1 - out, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
      {m.lines.map((ln, k) => (
        <div key={k} style={{display: 'flex', columnGap: ln.serif ? 26 : 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1600}}>
          {WORDS.slice(ln.words[0], ln.words[1] + 1).map((w) => {
            const p = pt(t, w.s - 0.08, w.s + 0.4, ease.out);
            return (
              <span
                key={w.i}
                style={{
                  fontFamily: ln.serif ? SERIF : SANS,
                  fontStyle: ln.serif ? 'italic' : 'normal',
                  fontWeight: ln.serif ? 400 : 700,
                  fontSize: ln.serif ? (m.lines.length > 2 ? 118 : 150) : 76,
                  letterSpacing: ln.serif ? '-0.01em' : '-0.03em',
                  lineHeight: 1.08,
                  color: ln.warm ? C.warm : C.white,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 34}px) scale(${lerp(1.06, 1, p)})`,
                  filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
                  textShadow: SHADOW,
                  display: 'inline-block',
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- signature at the end
const Signature: React.FC<{t: number}> = ({t}) => {
  const a = W(152) - 0.1;
  if (t < a) return null;
  const p = pt(t, a, a + 0.6, ease.out);
  const line = pt(t, a + 0.3, a + 1.1, ease.inOut);
  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, color: C.white, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined, textShadow: SHADOW, lineHeight: 1}}>Vivek</div>
      <div style={{width: 360 * line, height: 2, background: C.warm, marginTop: 18}} />
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: '0.42em', paddingLeft: '0.42em', color: C.soft, marginTop: 22, opacity: pt(t, W(155) - 0.1, W(155) + 0.4)}}>SIGNING OFF</div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1920} height={1080}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={frame % 9} />
      </filter>
      <rect width={1920} height={1080} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- colour story: each chapter of the talk gets its own look
// sat/con/bri/sep/hue drive the CSS filter; tint is a soft-light wash; glow is a warm bloom; leak marks the chapter change.
type Look = {at: number; sat: number; con: number; bri: number; sep: number; hue: number; tint: [number, number, number, number]; glow: number};
const LOOKS: Look[] = [
  {at: 0, sat: 1.0, con: 1.08, bri: 1.0, sep: 0.08, hue: 0, tint: [255, 170, 90, 0.18], glow: 0.25}, // warm, honest opening
  {at: W(28), sat: 1.28, con: 1.12, bri: 1.04, sep: 0.0, hue: -6, tint: [255, 120, 60, 0.22], glow: 0.4}, // ideas + excitement: vivid, warm
  {at: W(46), sat: 1.05, con: 1.1, bri: 1.0, sep: 0.05, hue: 10, tint: [120, 90, 255, 0.14], glow: 0.2}, // chasing others: cooler shift
  {at: W(60), sat: 0.55, con: 1.05, bri: 0.94, sep: 0.25, hue: 0, tint: [90, 140, 170, 0.22], glow: 0.1}, // months pass: faded, cold
  {at: W(81) - 0.3, sat: 0.0, con: 1.35, bri: 0.85, sep: 0.0, hue: 0, tint: [0, 0, 0, 0.0], glow: 0.0}, // the scary part: black & white
  {at: W(101), sat: 0.95, con: 1.12, bri: 1.03, sep: 0.0, hue: -4, tint: [40, 160, 170, 0.2], glow: 0.2}, // realisation: clean teal & orange
  {at: W(136), sat: 1.15, con: 1.1, bri: 1.05, sep: 0.15, hue: -8, tint: [255, 190, 90, 0.26], glow: 0.55}, // potential -> reality: golden
  {at: W(152), sat: 0.9, con: 1.06, bri: 0.95, sep: 0.2, hue: 0, tint: [255, 160, 100, 0.2], glow: 0.35}, // sign-off: soft warm
];
const lookAt = (t: number) => {
  let i = 0;
  LOOKS.forEach((l, k) => (t >= l.at - 0.3 ? (i = k) : null));
  const cur = LOOKS[i];
  const prev = LOOKS[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : pt(t, cur.at - 0.3, cur.at + 0.5, ease.inOut);
  const m = (a: number, b: number) => lerp(a, b, k);
  return {
    sat: m(prev.sat, cur.sat), con: m(prev.con, cur.con), bri: m(prev.bri, cur.bri), sep: m(prev.sep, cur.sep), hue: m(prev.hue, cur.hue), glow: m(prev.glow, cur.glow),
    tint: prev.tint.map((v, j) => m(v, cur.tint[j])) as [number, number, number, number],
    leak: i === 0 ? 0 : Math.sin(Math.min(1, Math.max(0, (t - cur.at + 0.3) / 1.0)) * Math.PI),
    idx: i,
  };
};

// ---------------------------------------------------------------- film (original frame: no zoom, no crop, no bars)
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dim = emphLevel(t);
  const sig = pt(t, W(152) - 0.3, W(152) + 0.4, ease.inOut);
  const L = lookAt(t);
  const fadeIn = pt(t, 0, 0.6, ease.out);
  const fadeOut = pt(t, edit.speech + 0.5, edit.duration, ease.inOut);
  const filter = `saturate(${L.sat * (1 - 0.3 * dim)}) contrast(${L.con}) brightness(${L.bri * (1 - 0.4 * Math.max(dim, sig * 0.85))}) sepia(${L.sep}) hue-rotate(${L.hue}deg)`;
  const [r, g, b, a] = L.tint;
  const leakX = 15 + ((L.idx * 37) % 70);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'contain', filter}} />
      {/* bloom: a blurred, brightened copy screened on top gives highlights a soft filmic glow */}
      {L.glow > 0.02 && (
        <AbsoluteFill style={{opacity: L.glow * 0.5, mixBlendMode: 'screen'}}>
          <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: `${filter} blur(18px) brightness(0.9) contrast(1.6)`}} />
        </AbsoluteFill>
      )}
      {/* colour wash for the chapter (soft-light keeps skin natural) */}
      <AbsoluteFill style={{background: `rgba(${r},${g},${b},${a})`, mixBlendMode: 'soft-light'}} />
      {/* split-tone: cool shadows bottom-left, warm light top-right */}
      <AbsoluteFill style={{background: 'linear-gradient(225deg, rgba(255,180,110,0.16), transparent 45%, rgba(20,60,90,0.2))', mixBlendMode: 'soft-light', opacity: 1 - (L.idx === 4 ? 1 : 0)}} />
      {/* light leak on each chapter change */}
      {L.leak > 0.01 && <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 70% at ${leakX}% 30%, rgba(255,150,70,0.55), rgba(255,80,40,0.15) 45%, transparent 75%)`, mixBlendMode: 'screen', opacity: L.leak * 0.8}} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
      {t < W(152) - 0.15 && (dim < 0.5 ? <Captions t={t} /> : null)}
      <Emphasis t={t} />
      <Signature t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - fadeIn, fadeOut)}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.55} />}
    </AbsoluteFill>
  );
};
