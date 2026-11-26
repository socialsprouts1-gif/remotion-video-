import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, pt, rand} from './anim';
import words from './words.json';

// Wedding Diaries promo (v2) — a finishing pass on the client's own lightly edited reel (IMG_3891).
// Picture timing and voice are untouched (lip sync stays exact); every new element is timed to the real spoken words.
// Palette: wine, soft gold, ivory. Type: Instrument Serif (titles), Fraunces (numerals), Instrument Sans (small text).
// v2 adds: titles that sit BEHIND the presenters (selfie-segmenter matte, public/clips/person.webm), whip transitions on the
// cuts, the b-roll laid out as diary photo pages that flip on each cut, polaroids, a film strip of moments, gold dust,
// a 3D book card, a rolling phone number with pulse rings and a drawn gold frame on the booking card.
// The burned-in labels ("Haldi ki Masti"…, "Book Now", the contact note) stay covered; white flash frames are gold light leaks.
const FPS = 30;
export const TOTAL = 1298;

const WINE = '#5A0F24';
const WINE_D = '#2C0611';
const GOLD = '#D2AE68';
const GOLD_L = '#F1DDA8';
const IVORY = '#F7F0E4';
const SERIF = 'InstrumentSerif, serif';
const NUM = 'Fraunces, serif';
const SANS = 'InstrumentSans, sans-serif';
const GRADE = 'contrast(1.06) saturate(1.04) brightness(0.985) sepia(0.05)';

let loaded = false;
if (!loaded && typeof document !== 'undefined') {
  loaded = true;
  const h = delayRender('fonts');
  const fonts = [
    new FontFace('InstrumentSerif', `url(${staticFile('fonts/InstrumentSerif.ttf')})`),
    new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces.ttf')})`, {weight: '100 900'}),
    new FontFace('InstrumentSans', `url(${staticFile('fonts/InstrumentSans.ttf')})`, {weight: '400 700', stretch: '75% 100%'}),
  ];
  fonts.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
  Promise.all(fonts.map((f) => f.load())).then(() => continueRender(h)).catch(() => continueRender(h));
}

type Word = {w: string; s: number; e: number};
const WORDS = words as Word[];
const between = (a: number, b: number) => WORDS.filter((w) => w.s >= a - 0.001 && w.s < b);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');
const win = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => pt(t, a, a + fin) * (1 - pt(t, b - fout, b, ease.in));

// real cut times in the client's reel (s)
const CUT_BROLL_IN = 12.967;
const CUT_MEHENDI = 14.267;
const CUT_SANGEET = 15.333;
const CUT_BROLL_OUT = 16.633;
const WHIPS: [number, number][] = [
  [6.6, 1],
  [8.167, -1],
  [18.933, 1],
  [23.4, -1],
];

// ---------------------------------------------------------------- word-synced text
const Words: React.FC<{
  t: number;
  a: number;
  b: number;
  size: number;
  font?: string;
  color?: string;
  gold?: string[];
  weight?: number;
  spacing?: string;
  upper?: boolean;
  goldColor?: string;
  skip?: string[];
}> = ({t, a, b, size, font = SERIF, color = IVORY, gold = [], weight = 400, spacing = '-0.01em', upper = false, goldColor = GOLD_L, skip = []}) => (
  <>
    {between(a, b)
      .filter((w) => !skip.includes(bare(w.w)))
      .map((w, i) => {
        const p = pt(t, w.s - 0.06, w.s + 0.26, ease.out);
        const g = gold.includes(bare(w.w));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: size * 0.24,
              fontFamily: font,
              fontSize: size,
              fontWeight: weight,
              letterSpacing: spacing,
              color: g ? goldColor : color,
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.28}px)`,
              filter: `blur(${(1 - p) * 6}px)`,
              textTransform: upper ? 'uppercase' : 'none',
              textShadow: '0 2px 18px rgba(30,4,12,0.45)',
            }}
          >
            {w.w}
          </span>
        );
      })}
  </>
);

const Rule: React.FC<{p: number; w: number; center?: boolean; diamond?: boolean}> = ({p, w, center, diamond}) => (
  <div style={{position: 'relative', height: 14, width: w, margin: center ? '0 auto' : undefined}}>
    <div style={{position: 'absolute', top: 6, left: center ? (w * (1 - p)) / 2 : 0, width: w * p, height: 1.6, background: `linear-gradient(90deg, transparent, ${GOLD} 18%, ${GOLD_L} 50%, ${GOLD} 82%, transparent)`}} />
    {diamond && <div style={{position: 'absolute', left: w / 2 - 6, top: 1, width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, background: GOLD_L, boxShadow: `0 0 12px ${GOLD}`}} />}
  </div>
);

const Shade: React.FC<{o: number; top?: boolean; h?: number}> = ({o, top, h = 46}) => (
  <AbsoluteFill
    style={{
      opacity: o,
      background: top
        ? `linear-gradient(180deg, rgba(36,6,16,0.62) 0%, rgba(36,6,16,0.32) ${h * 0.55}%, transparent ${h}%)`
        : `linear-gradient(0deg, rgba(36,6,16,0.66) 0%, rgba(36,6,16,0.34) ${h * 0.55}%, transparent ${h}%)`,
    }}
  />
);

// ---------------------------------------------------------------- gold light leak (replaces the white flash frames)
const Leak: React.FC<{t: number; c: number; d: number; k?: number; seed: number}> = ({t, c, d, k = 1, seed}) => {
  const x = 1 - Math.min(1, Math.abs(t - c) / d);
  if (x <= 0) return null;
  const e = Math.pow(ease.inOut(x), 0.8) * k;
  const sweep = (t - (c - d)) / (2 * d);
  const cx = 20 + rand(seed) * 60;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: e * 0.97, background: `radial-gradient(ellipse 80% 60% at ${cx}% ${30 + sweep * 40}%, #FFF1CF 0%, #F0C878 22%, #C27A3A 48%, #6E1A2C 78%, ${WINE_D} 100%)`}} />
      <AbsoluteFill style={{opacity: e * 0.9, mixBlendMode: 'screen', background: `linear-gradient(115deg, transparent ${sweep * 140 - 45}%, rgba(255,236,190,0.9) ${sweep * 140 - 25}%, transparent ${sweep * 140 - 5}%)`}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- gold dust
const Dust: React.FC<{t: number; o: number; n?: number; seed?: number; y0?: number; y1?: number}> = ({t, o, n = 46, seed = 0, y0 = 0, y1 = 1920}) => {
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o, mixBlendMode: 'screen'}}>
      {Array.from({length: n}, (_, i) => {
        const r1 = rand(i * 7.1 + seed), r2 = rand(i * 3.3 + 11 + seed), r3 = rand(i * 1.7 + 29 + seed), r4 = rand(i * 9.2 + 5 + seed);
        const speed = 18 + r3 * 40;
        const span = y1 - y0 + 200;
        const y = y0 + ((r2 * span - t * speed) % span + span) % span - 100;
        const x = r1 * 1080 + Math.sin(t * (0.4 + r4) + i) * 26;
        const s = 3 + r3 * 7;
        const tw = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * (1.5 + r4 * 3) + i * 2.1), 2);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: x, top: y, width: s * 4, height: s * 4, marginLeft: -s * 2, marginTop: -s * 2, borderRadius: '50%', opacity: tw, background: `radial-gradient(circle, rgba(255,242,205,1) 0%, rgba(240,200,120,0.55) ${18}%, rgba(210,170,100,0) 60%)`}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the reel itself (with whip moves on the cuts)
const whipAt = (t: number) => {
  for (const [c, dir] of WHIPS) {
    const dt = t - c;
    if (dt > -0.12 && dt < 0.14) {
      const amt = Math.pow(1 - Math.min(1, Math.abs(dt) / (dt < 0 ? 0.12 : 0.14)), 2);
      return {x: (dt < 0 ? dir : -dir) * amt * 110, amt};
    }
  }
  return {x: 0, amt: 0};
};

const Reel: React.FC<{t: number; extra?: string}> = ({t, extra = ''}) => {
  const w = whipAt(t);
  return (
    <AbsoluteFill style={{transform: `translateX(${w.x}px) scale(${1 + w.amt * 0.09})`, filter: `${w.amt > 0.01 ? 'url(#whip) ' : ''}${GRADE} ${extra}`}}>
      <OffthreadVideo src={staticFile('clips/main.mp4')} muted style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/** The presenters alone (alpha), drawn over type that should sit behind them. Mounted only where it is used. */
const Person: React.FC<{a: number; b: number}> = ({a, b}) => {
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS);
  return (
    <Sequence from={f0} durationInFrames={f1 - f0} layout="none">
      <AbsoluteFill style={{filter: GRADE}}>
        <OffthreadVideo src={staticFile('clips/person.webm')} transparent muted trimBefore={f0} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </Sequence>
  );
};

/** Big type behind the presenters. */
const Behind: React.FC<{t: number; a: number; b: number; text: string; top: number; size: number; gold?: boolean; spacing?: number}> = ({t, a, b, text, top, size, gold = true, spacing = -0.02}) => {
  const o = win(t, a, b, 0.5, 0.25);
  if (o <= 0) return null;
  const p = pt(t, a, a + 0.9, ease.out);
  const sh = pt(t, a + 0.3, a + 2.2, ease.inOut);
  return (
    <div
      style={{
        position: 'absolute',
        left: -100,
        right: -100,
        top,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: size,
        lineHeight: 0.9,
        letterSpacing: `${spacing + 0.08 * (1 - p)}em`,
        opacity: o,
        transform: `translateY(${(1 - p) * 60}px) scale(${1.06 - 0.06 * p})`,
        filter: `blur(${(1 - p) * 14}px) drop-shadow(0 6px 30px rgba(40,6,16,0.45))`,
        backgroundImage: gold
          ? `linear-gradient(100deg, ${GOLD} ${sh * 140 - 40}%, #FFF3D2 ${sh * 140 - 22}%, ${GOLD} ${sh * 140 - 4}%), linear-gradient(180deg, ${GOLD_L}, #B88A45)`
          : `linear-gradient(100deg, ${IVORY} ${sh * 140 - 40}%, ${GOLD_L} ${sh * 140 - 22}%, ${IVORY} ${sh * 140 - 4}%)`,
        backgroundBlendMode: 'screen',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------- name lower third
const Name: React.FC<{t: number; a: number; b: number; name: [number, number]; lead: number; right?: boolean}> = ({t, a, b, name, lead, right}) => {
  const o = win(t, a, b, 0.25, 0.25);
  if (o <= 0) return null;
  const r = pt(t, a, a + 0.8, ease.out);
  return (
    <>
      <Shade o={o * 0.9} h={34} />
      <div style={{position: 'absolute', left: right ? undefined : 76, right: right ? 76 : undefined, top: 1490, width: 800, textAlign: right ? 'right' : 'left', opacity: o}}>
        <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, marginBottom: 6, opacity: pt(t, a + 0.1, a + 0.5)}}>WEDDING DIARIES</div>
        <div style={{display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start'}}>
          <Rule p={r} w={300} />
        </div>
        <div style={{marginTop: 8, lineHeight: 1.05}}>
          <Words t={t} a={lead} b={name[0]} size={48} font={SANS} weight={500} spacing="0" />
        </div>
        <div style={{lineHeight: 1}}>
          <Words t={t} a={name[0]} b={name[1]} size={132} gold={[]} />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- b-roll as diary photo pages that flip on each cut
const PAGES: [number, number, string, string][] = [
  [CUT_BROLL_IN, CUT_MEHENDI, '01', 'Haldi ki masti'],
  [CUT_MEHENDI, CUT_SANGEET, '02', 'Mehendi ki chamak'],
  [CUT_SANGEET, CUT_BROLL_OUT, '03', 'Sangeet ki dhamaal'],
];
const CARD = {x: 120, y: 600, w: 840, crop: 560}; // crop: source rows above this (where the pink labels sit) stay hidden
const Diary: React.FC<{t: number}> = ({t}) => {
  const a = CUT_BROLL_IN, b = CUT_BROLL_OUT;
  if (t < a - 0.05 || t > b + 0.4) return null;
  const k = CARD.w / 1080;
  const cardH = Math.round((1920 - CARD.crop - 280) * k);
  // flip angle: swings to edge-on exactly at each cut, so the picture change is hidden by the turn
  let ang = 0;
  for (const c of [CUT_MEHENDI, CUT_SANGEET]) {
    const dt = t - c;
    if (dt > -0.16 && dt < 0) ang = -90 * ease.in((dt + 0.16) / 0.16);
    if (dt >= 0 && dt < 0.26) ang = 90 * (1 - ease.out(dt / 0.26));
  }
  const enter = pt(t, a, a + 0.55, ease.out);
  const exit = pt(t, b - 0.02, b + 0.32, ease.in);
  const idx = t < CUT_MEHENDI ? 0 : t < CUT_SANGEET ? 1 : 2;
  const tilt = [-2.2, 1.6, -1.2][idx];
  const page = PAGES[idx];
  const tp = pt(t, page[0] + 0.02, page[0] + 0.5, ease.out);
  return (
    <>
      {/* backdrop: the same footage, soft and deep wine */}
      <AbsoluteFill style={{opacity: 1 - exit}}>
        <AbsoluteFill style={{filter: `${GRADE} blur(26px) brightness(0.55)`, transform: 'scale(1.15)'}}>
          <OffthreadVideo src={staticFile('clips/main.mp4')} muted style={{width: '100%', height: '100%'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(44,6,17,0.92) 0%, rgba(90,15,36,0.55) 40%, rgba(44,6,17,0.85) 100%)`}} />
      </AbsoluteFill>
      {/* chapter title */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 250, height: 300, opacity: 1 - exit}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 26, opacity: tp, transform: `translateY(${(1 - tp) * 40}px)`, filter: `blur(${(1 - tp) * 8}px)`}}>
          <div style={{fontFamily: NUM, fontSize: 170, fontWeight: 300, lineHeight: 0.8, color: GOLD, fontVariationSettings: '"opsz" 144, "SOFT" 100'}}>{page[2]}</div>
          <div style={{paddingBottom: 8}}>
            <div style={{fontFamily: SANS, fontSize: 26, letterSpacing: '0.42em', color: GOLD_L, fontWeight: 600}}>CHAPTER · WE CAPTURE</div>
            <div style={{fontFamily: SERIF, fontSize: 96, color: IVORY, lineHeight: 1, whiteSpace: 'nowrap'}}>{page[3]}</div>
          </div>
        </div>
        <div style={{marginTop: 22}}>
          <Rule p={tp} w={900} />
        </div>
      </div>
      {/* the photo page */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1800, opacity: 1 - exit * 0.2}}>
        <div
          style={{
            position: 'absolute',
            left: CARD.x - 16,
            top: CARD.y - 16,
            width: CARD.w + 32,
            height: cardH + 32,
            background: '#FBF6EC',
            borderRadius: 4,
            boxShadow: '0 40px 90px rgba(10,0,4,0.6), 0 0 0 1px rgba(210,174,104,0.5)',
            transformOrigin: '50% 50%',
            transform: `translateY(${(1 - enter) * 700 + exit * 900}px) rotate(${tilt * enter - exit * 8}deg) rotateY(${ang}deg)`,
          }}
        >
          <div style={{position: 'absolute', left: 16, top: 16, width: CARD.w, height: cardH, overflow: 'hidden', background: '#000'}}>
            <div style={{position: 'absolute', left: 0, top: -CARD.crop * k, width: 1080 * k, height: 1920 * k, filter: GRADE}}>
              <OffthreadVideo src={staticFile('clips/main.mp4')} muted style={{width: '100%', height: '100%'}} />
            </div>
          </div>
          {/* gold photo corners */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i % 2 ? undefined : 2,
                right: i % 2 ? 2 : undefined,
                top: i < 2 ? 2 : undefined,
                bottom: i < 2 ? undefined : 2,
                width: 70,
                height: 70,
                background: `linear-gradient(${[135, 225, 45, 315][i]}deg, ${GOLD_L} 0%, ${GOLD} 49%, transparent 50%)`,
                opacity: 0.95,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- "Emotional moments" plate (covers the last pink label)
const Plate: React.FC<{t: number}> = ({t}) => {
  const a = CUT_BROLL_OUT, b = 18.32;
  const o = pt(t, a, a + 0.12, ease.out) * (1 - pt(t, 18.05, b, ease.in));
  if (o <= 0) return null;
  const open = pt(t, a, a + 0.45, ease.out);
  const pin = pt(t, a + 0.1, a + 0.55);
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 292,
        width: 780,
        height: 214,
        opacity: o,
        clipPath: `inset(0 ${(1 - open) * 50}% 0 ${(1 - open) * 50}% round 6px)`,
        borderRadius: 6,
        background: `linear-gradient(135deg, #6C1630 0%, ${WINE} 45%, ${WINE_D} 100%)`,
        boxShadow: '0 24px 60px rgba(20,2,8,0.55)',
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', inset: 10, border: `1.5px solid ${GOLD}`, borderRadius: 3, opacity: 0.85}} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${((t * 0.6) % 1.6) * 100 - 30}%, rgba(255,230,180,0.18) ${((t * 0.6) % 1.6) * 100 - 15}%, transparent ${((t * 0.6) % 1.6) * 100}%)`}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 52}}>
        <div style={{fontFamily: NUM, fontSize: 92, fontWeight: 300, color: GOLD_L, width: 120, opacity: pin, transform: `translateY(${(1 - pin) * 40}px)`, fontVariationSettings: '"opsz" 144, "SOFT" 100'}}>04</div>
        <div style={{width: 1.5, height: 120 * pin, background: GOLD, margin: '0 34px 0 6px', opacity: 0.9}} />
        <div style={{opacity: pin, transform: `translateY(${(1 - pin) * 34}px)`, filter: `blur(${(1 - pin) * 5}px)`}}>
          <div style={{fontFamily: SANS, fontSize: 24, letterSpacing: '0.38em', color: GOLD, fontWeight: 600}}>CHAPTER · WE CAPTURE</div>
          <div style={{fontFamily: SERIF, fontSize: 82, color: IVORY, lineHeight: 1.04, whiteSpace: 'nowrap'}}>Emotional moments</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- still frames of the b-roll (for polaroids and the film strip)
const Still: React.FC<{f: number; w: number; h: number; srcY: number}> = ({f, w, h, srcY}) => {
  const k = w / 1080;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#111'}}>
      <div style={{position: 'absolute', left: 0, top: -srcY * k, width: 1080 * k, height: 1920 * k, filter: GRADE}}>
        <Freeze frame={f}>
          <OffthreadVideo src={staticFile('clips/main.mp4')} muted style={{width: '100%', height: '100%'}} />
        </Freeze>
      </div>
    </div>
  );
};

const Polaroids: React.FC<{t: number}> = ({t}) => {
  const o = 1 - pt(t, 18.75, 19.0, ease.in);
  if (t < 17.85 || o <= 0) return null;
  const shots = [
    {f: 405, x: 250, rot: -11, at: 17.92},
    {f: 440, x: 540, rot: 3, at: 18.06},
    {f: 482, x: 830, rot: 12, at: 18.2},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      {shots.map((s, i) => {
        const p = pt(t, s.at, s.at + 0.45, ease.out);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x - 150,
              top: 1450,
              padding: '14px 14px 52px',
              background: '#FBF6EC',
              boxShadow: '0 24px 50px rgba(10,0,4,0.55)',
              transform: `translateY(${(1 - p) * 600}px) rotate(${s.rot * p + (1 - p) * -s.rot * 2}deg)`,
              opacity: Math.min(1, p * 2),
            }}
          >
            <Still f={s.f} w={272} h={300} srcY={700} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FilmStrip: React.FC<{t: number}> = ({t}) => {
  const o = win(t, 24.95, 27.95, 0.35, 0.3);
  if (o <= 0) return null;
  const frames = [400, 418, 436, 450, 470, 488, 410, 444];
  const cellW = 250, gap = 18;
  const x = 60 - (t - 24.95) * 150;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1580, height: 250, opacity: o, transform: `rotate(-3deg) translateY(${(1 - pt(t, 24.95, 25.5)) * 80}px)`}}>
      <div style={{position: 'absolute', left: -60, right: -60, top: 0, height: 250, background: '#1A0409', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}} />
      {[12, 222].map((y) => (
        <div key={y} style={{position: 'absolute', left: -60, right: -60, top: y, height: 16, backgroundImage: `repeating-linear-gradient(90deg, ${GOLD} 0 18px, transparent 18px 36px)`, backgroundPositionX: x, opacity: 0.85, borderRadius: 2}} />
      ))}
      <div style={{position: 'absolute', top: 38, left: x, display: 'flex', gap}}>
        {frames.map((f, i) => (
          <div key={i} style={{border: `1px solid rgba(210,174,104,0.5)`}}>
            <Still f={f} w={cellW} h={172} srcY={760} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- CTA pieces
const Phone: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

const RollNumber: React.FC<{t: number; at: number; text: string; size: number}> = ({t, at, text, size}) => {
  const h = size * 1.12;
  let di = 0;
  return (
    <div style={{display: 'flex', height: h, overflow: 'hidden', fontFamily: NUM, fontSize: size, fontWeight: 500, color: IVORY, lineHeight: `${h}px`, fontVariantNumeric: 'lining-nums tabular-nums', fontVariationSettings: '"opsz" 144'}}>
      {text.split('').map((c, i) => {
        if (c === ' ') return <div key={i} style={{width: size * 0.28}} />;
        const d = Number(c);
        const p = pt(t, at + di * 0.05, at + di * 0.05 + 0.7, ease.out);
        di++;
        const pos = (1 - p) * -(10 + d) * h + p * -d * h; // spins down through the digits and lands
        return (
          <div key={i} style={{height: h, overflow: 'hidden'}}>
            <div style={{transform: `translateY(${p >= 1 ? -d * h : pos}px)`, filter: `blur(${(1 - p) * 3}px)`}}>
              {Array.from({length: 20}, (_, k) => (
                <div key={k} style={{height: h}}>{k % 10}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.075, mixBlendMode: 'overlay'}}>
    <filter id="g">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const w = whipAt(t);

  const hookO = 1 - pt(t, 4.55, 4.8, ease.in);
  const introO = win(t, 8.15, 12.97, 0.3, 0.12);
  const allO = win(t, 17.9, 18.95, 0.2, 0.2);
  const quoteO = win(t, 18.95, 24.95, 0.25, 0.25);
  const memO = win(t, 24.95, 27.9, 0.25, 0.2);
  const storyO = win(t, 27.85, 29.5, 0.2, 0.2);
  const bookIn = pt(t, 29.2, 29.62, ease.out);
  const bookO = Math.min(1, bookIn * 3) * (1 - pt(t, 32.75, 33.05, ease.in));
  const vsO = win(t, 33.15, 38.45, 0.25, 0.25);
  const ctaO = pt(t, 38.3, 38.62, ease.out);
  const strike = pt(t, 35.45, 35.85, ease.inOut);
  const bars = 1 - pt(t, 0.05, 0.9, ease.inOut);

  const dustO = Math.max(0.25, win(t, 8.9, 12.97, 0.6, 0.2), win(t, 12.9, 16.7, 0.3, 0.3), win(t, 27.9, 29.5, 0.3, 0.2), pt(t, 38.4, 39.2));

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="whip" x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${w.amt * 34} 0`} />
        </filter>
      </svg>

      <Reel t={t} />
      <AbsoluteFill style={{mixBlendMode: 'soft-light', background: 'linear-gradient(180deg, rgba(255,196,128,0.22) 0%, rgba(255,214,170,0.08) 45%, rgba(110,20,40,0.22) 100%)'}} />

      {/* ---- type behind the presenters */}
      <Behind t={t} a={3.5} b={4.75} text="moment" top={350} size={250} />
      <Person a={3.3} b={4.8} />

      {introO > 0 && (
        <>
          <Shade o={introO} top h={40} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 214, textAlign: 'center', opacity: introO}}>
            <Words t={t} a={8.15} b={9.15} size={30} font={SANS} weight={600} spacing="0.34em" upper color={GOLD_L} goldColor={GOLD_L} />
          </div>
          <Behind t={t} a={9.12} b={12.97} text={'Wedding\nDiaries'} top={268} size={232} gold={false} spacing={-0.01} />
          <Person a={8.9} b={12.97} />
          <Shade o={introO * pt(t, 10.5, 10.9)} h={30} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1520, textAlign: 'center', opacity: introO}}>
            <Rule p={pt(t, 10.6, 11.3)} w={520} center diamond />
            <div style={{marginTop: 14}}>
              <Words t={t} a={10.7} b={12.9} size={56} font={SANS} weight={500} spacing="0" gold={['personal']} />
            </div>
          </div>
        </>
      )}

      <Behind t={t} a={28.42} b={29.55} text="story." top={250} size={300} />
      <Person a={28.2} b={29.6} />

      <Behind t={t} a={36.4} b={38.45} text="moments" top={262} size={236} />
      <Person a={36.2} b={38.5} />

      {/* ---- b-roll diary pages, then the last label plate */}
      <Diary t={t} />
      <Plate t={t} />

      {/* light leaks over the white flash frames + scene changes */}
      <Leak t={t} c={4.8} d={0.32} seed={1} />
      <Leak t={t} c={CUT_BROLL_IN} d={0.22} k={0.75} seed={7} />
      <Leak t={t} c={18.86} d={0.2} k={0.5} seed={3} />
      <Leak t={t} c={25.06} d={0.36} seed={4} />
      <Leak t={t} c={29.72} d={0.22} k={0.55} seed={5} />
      <Leak t={t} c={33.17} d={0.34} seed={6} />

      <Dust t={t} o={dustO} />

      {/* 1. hook */}
      {hookO > 0 && (
        <>
          <Shade o={hookO * pt(t, 0.2, 0.7)} h={42} />
          <div style={{position: 'absolute', left: 72, top: 1330, width: 920, opacity: hookO}}>
            <div style={{lineHeight: 1.25, marginBottom: 14}}>
              <Words t={t} a={0.4} b={2.3} size={44} font={SANS} weight={500} spacing="0" />
            </div>
            <Rule p={pt(t, 2.2, 2.9)} w={220} />
            <div style={{lineHeight: 0.98, marginTop: 10}}>
              <Words t={t} a={2.3} b={4.7} size={100} gold={['moment', 'behind']} />
            </div>
          </div>
        </>
      )}

      {/* 2. names */}
      <Name t={t} a={4.9} b={6.6} name={[5.48, 6.3]} lead={4.9} />
      <Name t={t} a={6.6} b={8.15} name={[7.48, 8.1]} lead={6.4} right />

      {/* 4b. we capture it all + polaroids */}
      {allO > 0 && (
        <>
          <Shade o={allO} h={44} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', opacity: allO}}>
            <Words t={t} a={17.9} b={18.95} size={110} gold={['all']} />
          </div>
        </>
      )}
      <Polaroids t={t} />

      {/* 5. Aap … Hum … */}
      {quoteO > 0 && (
        <>
          <Shade o={quoteO} top h={34} />
          <div style={{position: 'absolute', left: 70, top: 236, width: 800, opacity: quoteO}}>
            {[
              [18.95, 20.2, 20.2, 22.3],
              [22.3, 23.6, 23.6, 25.0],
            ].map(([a1, b1, a2, b2], i) => {
              const o = i === 0 ? 1 - pt(t, 22.1, 22.35, ease.in) : pt(t, 22.3, 22.4);
              if (o <= 0) return null;
              return (
                <div key={i} style={{position: 'absolute', top: 0, left: 0, width: 900, opacity: o}}>
                  <div style={{lineHeight: 1.06}}>
                    <Words t={t} a={a1} b={b1} size={76} gold={['aap']} />
                  </div>
                  <div style={{lineHeight: 1.06}}>
                    <Words t={t} a={a2} b={b2} size={i === 0 ? 70 : 76} gold={['hum', 'khaas', 'yaadgaar']} />
                  </div>
                </div>
              );
            })}
            <div style={{position: 'absolute', top: 186, left: 0}}>
              <Rule p={pt(t, 19.3, 20.2) * (1 - pt(t, 24.6, 24.95))} w={360} />
            </div>
          </div>
        </>
      )}

      {/* 6. more than just memories (film strip) → their own story */}
      {memO > 0 && (
        <>
          <Shade o={memO} h={48} />
          <div style={{position: 'absolute', left: 60, right: 60, top: 1300, textAlign: 'center', opacity: memO, lineHeight: 1.12}}>
            <Words t={t} a={24.95} b={26.2} size={56} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={26.2} b={27.9} size={84} gold={['memories']} />
          </div>
        </>
      )}
      <FilmStrip t={t} />
      {storyO > 0 && (
        <>
          <Shade o={storyO} h={34} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1480, textAlign: 'center', opacity: storyO, lineHeight: 1.05}}>
            <Words t={t} a={27.9} b={28.4} size={58} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={28.4} b={29.0} size={110} />
            <div style={{marginTop: 10}}>
              <Rule p={pt(t, 28.8, 29.4)} w={420} center diamond />
            </div>
          </div>
        </>
      )}

      {/* 7. book card, flips up in 3D (covers the burned-in "Book Now") */}
      {bookO > 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1600}}>
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 1140,
              width: 840,
              height: 350,
              opacity: bookO,
              transformOrigin: '50% 100%',
              transform: `rotateX(${(1 - bookIn) * 82}deg) translateY(${(1 - bookIn) * 40}px)`,
              borderRadius: 8,
              background: `linear-gradient(160deg, #FFFBF3 0%, ${IVORY} 55%, #EBDDC4 100%)`,
              boxShadow: '0 30px 70px rgba(30,4,12,0.5)',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', inset: 12, border: `1.5px solid ${GOLD}`, borderRadius: 4}} />
            <div style={{position: 'absolute', inset: 18, border: `0.8px solid ${GOLD}`, borderRadius: 3, opacity: 0.6}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${(t - 29.5) * 70 - 30}%, rgba(255,255,255,0.7) ${(t - 29.5) * 70 - 18}%, transparent ${(t - 29.5) * 70 - 6}%)`}} />
            <div style={{marginTop: 46, fontFamily: SANS, fontSize: 28, fontWeight: 600, letterSpacing: '0.4em', color: '#9A7434'}}>
              {['SO', 'BOOK'].map((s, i) => (
                <span key={s} style={{opacity: pt(t, 29.36 + i * 0.4, 29.7 + i * 0.4), marginRight: 18}}>{s}</span>
              ))}
            </div>
            <div style={{fontFamily: SERIF, fontSize: 108, color: WINE, lineHeight: 1.05, marginTop: 4}}>
              {['Wedding', 'Diaries', 'now'].map((s, i) => {
                const p = pt(t, [30.06, 30.42, 30.84][i], [30.06, 30.42, 30.84][i] + 0.32);
                return (
                  <span key={s} style={{display: 'inline-block', marginRight: 22, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 6}px)`, color: i === 2 ? '#A9792C' : WINE}}>{s}</span>
                );
              })}
            </div>
            <div style={{marginTop: 8}}>
              <Words t={t} a={31.1} b={32.9} size={42} font={SANS} weight={500} spacing="0" color={WINE_D} goldColor="#A9792C" gold={['forever']} />
            </div>
          </div>
          {/* sparkle burst as the card lands */}
          {Array.from({length: 16}, (_, i) => {
            const p = pt(t, 29.55, 30.4, ease.out);
            if (p <= 0 || p >= 1) return null;
            const ang = (i / 16) * Math.PI * 2 + rand(i) * 0.4;
            const r = 120 + p * (260 + rand(i + 3) * 200);
            return (
              <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * r * 1.4, top: 1315 + Math.sin(ang) * r * 0.6, width: 10, height: 10, marginLeft: -5, transform: 'rotate(45deg)', background: GOLD_L, boxShadow: `0 0 14px ${GOLD}`, opacity: 1 - p}} />
            );
          })}
        </div>
      )}

      {/* 8. photographers capture the wedding — we capture the moments (behind her) */}
      {vsO > 0 && (
        <>
          <Shade o={vsO} h={40} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1300, textAlign: 'center', opacity: vsO}}>
            <div style={{position: 'relative', display: 'inline-block', opacity: 1 - 0.45 * strike, lineHeight: 1.1}}>
              <Words t={t} a={33.15} b={35.5} size={64} font={SANS} weight={500} spacing="0" />
              <div style={{position: 'absolute', left: 0, top: '54%', height: 3, width: `${strike * 100}%`, background: GOLD, boxShadow: `0 0 10px ${GOLD}`}} />
            </div>
            <div style={{lineHeight: 1.02, marginTop: 14}}>
              <Words t={t} a={35.5} b={36.8} size={100} skip={['moments']} />
            </div>
            <div style={{lineHeight: 1.1, marginTop: 6}}>
              <Words t={t} a={36.8} b={38.4} size={60} font={SANS} weight={500} spacing="0" gold={['yours']} />
            </div>
          </div>
        </>
      )}

      {/* 9. booking card: drawn gold frame, rolling number, pulse rings (covers the burned-in contact note) */}
      {ctaO > 0 && (
        <>
          <Shade o={ctaO} h={54} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1010, textAlign: 'center', lineHeight: 1.05}}>
            <Words t={t} a={40.85} b={41.8} size={60} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={41.8} b={43.2} size={96} gold={['special']} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 70,
              top: 1235,
              width: 940,
              height: 470,
              opacity: ctaO,
              transform: `translateY(${(1 - ctaO) * 90}px) scale(${0.95 + 0.05 * ctaO})`,
              borderRadius: 10,
              background: `linear-gradient(150deg, #741B35 0%, ${WINE} 45%, ${WINE_D} 100%)`,
              boxShadow: '0 34px 80px rgba(20,2,8,0.6)',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <svg width={940} height={470} style={{position: 'absolute', inset: 0}}>
              <rect x={12} y={12} width={916} height={446} rx={5} fill="none" stroke={GOLD} strokeWidth={1.6} strokeDasharray={2724} strokeDashoffset={2724 * (1 - pt(t, 38.45, 39.6, ease.inOut))} />
            </svg>
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${(((t - 38.5) * 0.5) % 1.5) * 100 - 30}%, rgba(255,226,170,0.18) ${(((t - 38.5) * 0.5) % 1.5) * 100 - 14}%, transparent ${(((t - 38.5) * 0.5) % 1.5) * 100}%)`}} />
            <div style={{marginTop: 50}}>
              <Words t={t} a={38.5} b={39.65} size={34} font={SANS} weight={600} spacing="0.36em" upper color={GOLD_L} goldColor={GOLD_L} />
            </div>
            <Rule p={pt(t, 39.2, 39.9)} w={460} center diamond />
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, marginTop: 30, opacity: pt(t, 39.6, 39.9)}}>
              <div style={{position: 'relative', width: 108, height: 108}}>
                {[0, 1].map((k) => {
                  const ph = ((t - 40.2 + k * 0.7) % 1.4) / 1.4;
                  if (t < 40.2) return null;
                  return <div key={k} style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${GOLD_L}`, transform: `scale(${1 + ph * 0.9})`, opacity: (1 - ph) * 0.8}} />;
                })}
                <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(145deg, ${GOLD_L}, ${GOLD} 55%, #A9792C)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', transform: `scale(${pt(t, 39.6, 40.1, ease.out)}) rotate(${(1 - pt(t, 39.6, 40.2, ease.out)) * -40}deg)`}}>
                  <Phone size={60} color={WINE_D} />
                </div>
              </div>
              <RollNumber t={t} at={39.7} text="73789 89496" size={110} />
            </div>
            <div style={{marginTop: 26, fontFamily: SANS, fontSize: 32, fontWeight: 500, letterSpacing: '0.12em', color: GOLD_L, opacity: pt(t, 40.5, 41.0)}}>CALL NOW TO BOOK YOUR DATE</div>
          </div>
        </>
      )}

      {/* cinematic open: letterbox bars part as the film starts */}
      {bars > 0 && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960 * bars, background: '#0B0205'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 960 * bars, background: '#0B0205'}} />
          <div style={{position: 'absolute', left: 540 - 300 * (1 - bars), width: 600 * (1 - bars), top: 960 * bars - 1, height: 2, background: GOLD_L, opacity: bars}} />
        </>
      )}

      <Grain frame={frame} />
    </AbsoluteFill>
  );
};
