import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Deepak Wadhwa x CoinDCX Diwali bumper giveaway. Giveaway palette (black + saffron). Editing language: the talking
// head morphs between full screen, a bracketed frame, a split screen and fully off, with graphics around it.
const C = {
  bg: '#060606',
  card: '#141210',
  gold: '#FF8A00',
  gold2: '#FF6A00',
  cream: '#F7F3EE',
  ink: '#0A0A0A',
  dim: 'rgba(247,243,238,0.62)',
  line: 'rgba(255,138,0,0.3)',
  red: '#FF3B30',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const GOLD_GRAD = 'linear-gradient(180deg, #FFC46B 0%, #FF9A1F 45%, #F26A00 100%)';
const goldText: React.CSSProperties = {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

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
const sp = (t: number, at: number, stiffness = 280, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.25) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const brand = (n: string) => staticFile(`brand/${n}`);

// ---------------------------------------------------------------- layout timeline: where the speaker's video sits
type Rect = {x: number; y: number; w: number; h: number; r: number; o: number; z: number};
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.04};
const CLOSE: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 1, z: 1.18};
const FRAME: Rect = {x: 120, y: 700, w: 840, h: 1020, r: 46, o: 1, z: 1.06};
const SPLIT: Rect = {x: 70, y: 1010, w: 940, h: 760, r: 42, o: 1, z: 1.16};
const INTRO: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0, o: 0, z: 1.04};
const GONE: Rect = {x: 390, y: 1560, w: 300, h: 300, r: 150, o: 0, z: 1.1};
type Mode = 'intro' | 'full' | 'close' | 'frame' | 'split' | 'gone';
const RECTS: Record<Mode, Rect> = {intro: INTRO, full: FULL, close: CLOSE, frame: FRAME, split: SPLIT, gone: GONE};
const LAYOUT: {at: number; m: Mode}[] = [
  {at: 0, m: 'intro'}, // cut-out Deepak over a live animated background
  {at: W(21) - 0.12, m: 'split'}, // the five products
  {at: W(48) - 0.12, m: 'gone'}, // CoinDCX x Deepak: bumper giveaway
  {at: W(60) - 0.12, m: 'close'}, // "Aur sun lijiye…"
  {at: W(63) - 0.1, m: 'split'}, // ek, do, paanch…
  {at: W(69) - 0.1, m: 'gone'}, // 27 WINNERS
  {at: W(79) - 0.12, m: 'split'}, // steps: link + highlights
  {at: W(97) - 0.12, m: 'full'}, // "Toh dosto…"
  {at: W(99) - 0.1, m: 'frame'}, // comment poll
  {at: W(110) - 0.1, m: 'split'}, // "apne ghar kaunsa gift…"
];
const modeAt = (t: number) => LAYOUT.reduce((n, l, i) => (t >= l.at ? i : n), 0);
const rectAt = (t: number): Rect & {k: number} => {
  const i = modeAt(t);
  const cur = RECTS[LAYOUT[i].m];
  const prev = i ? RECTS[LAYOUT[i - 1].m] : cur;
  const k = i ? m1(sp(t, LAYOUT[i].at, 170, 22)) : 1;
  const L = (a: number, b: number) => lerp(a, b, k);
  return {x: L(prev.x, cur.x), y: L(prev.y, cur.y), w: L(prev.w, cur.w), h: L(prev.h, cur.h), r: L(prev.r, cur.r), o: L(prev.o, cur.o), z: L(prev.z, cur.z), k};
};
const modeNow = (t: number): Mode => LAYOUT[modeAt(t)].m;

// ---------------------------------------------------------------- speaker
const Speaker: React.FC<{t: number}> = ({t}) => {
  const R = rectAt(t);
  const framed = R.r > 2;
  const drift = 0.012 * Math.sin(t * 0.5);
  return (
    <div style={{position: 'absolute', left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: R.r, overflow: 'hidden', opacity: R.o, boxShadow: framed ? '0 40px 90px rgba(0,0,0,0.6)' : 'none', background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${R.z + drift})`, transformOrigin: '50% 34%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 47%', filter: 'contrast(1.08) saturate(1.05) brightness(0.97)'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 62%, rgba(0,0,0,0.6))'}} />
    </div>
  );
};

/** Saffron corner brackets that hug the card whenever it is framed. */
const Brackets: React.FC<{t: number}> = ({t}) => {
  const R = rectAt(t);
  const v = m1((R.r - 8) / 30) * R.o;
  if (v <= 0.01) return null;
  const L = 90, g = 22, th = 7;
  const corner = (x: number, y: number, rot: number, i: number) => (
    <div key={i} style={{position: 'absolute', left: x, top: y, width: L, height: L, transform: `rotate(${rot}deg)`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: L, height: th, background: GOLD_GRAD, borderRadius: 4}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: th, height: L, background: GOLD_GRAD, borderRadius: 4}} />
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v, pointerEvents: 'none'}}>
      {corner(R.x - g, R.y - g, 0, 0)}
      {corner(R.x + R.w + g, R.y - g, 90, 1)}
      {corner(R.x + R.w + g, R.y + R.h + g, 180, 2)}
      {corner(R.x - g, R.y + R.h + g, 270, 3)}
    </div>
  );
};

// ---------------------------------------------------------------- backdrop + decor
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 38%, #3A1C04 0%, #121212 52%, ${C.bg} 100%)`}}>
    {Array.from({length: 26}, (_, i) => {
      const x = rand(i * 3.1) * 1080;
      const y = 1920 - ((rand(i * 5.3) * 1920 + t * (18 + rand(i) * 40)) % 2000);
      const r = 3 + rand(i * 9.1) * 7;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? C.gold : '#FFC46B', opacity: 0.35 * (0.4 + 0.6 * Math.abs(Math.sin(t + i))), boxShadow: `0 0 ${r * 3}px ${C.gold}`}} />;
    })}
  </AbsoluteFill>
);

const DotGrid: React.FC<{x: number; y: number; cols?: number; rows?: number; t: number; at: number}> = ({x, y, cols = 6, rows = 4, t, at}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'grid', gridTemplateColumns: `repeat(${cols}, 14px)`, gap: 12}}>
    {Array.from({length: cols * rows}, (_, i) => (
      <div key={i} style={{width: 8, height: 8, borderRadius: 2, background: C.gold, opacity: 0.55 * ap(t, at + i * 0.012, 0.2)}} />
    ))}
  </div>
);

const Bars: React.FC<{x: number; y: number; t: number; at: number; flip?: boolean}> = ({x, y, t, at, flip}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', gap: 10, alignItems: flip ? 'flex-end' : 'flex-start'}}>
    {[120, 80, 150, 60].map((w, i) => (
      <div key={i} style={{width: w * ap(t, at + i * 0.05, 0.3), height: 10, borderRadius: 5, background: GOLD_GRAD, opacity: 0.8}} />
    ))}
  </div>
);

const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.55))', ...style}} />;

// ---------------------------------------------------------------- captions (reference style: clean, sentence case, bold + italic mix)
const SERIF_W = new Set(['sawaal', 'diwali', 'surprise', 'gift', 'giveaway!', 'bumper', 'winners', 'sunehra', 'mauka', 'link', 'highlights', 'details', 'comment', 'pasand', 'ghar', 'choose']);
const GOLD_W = new Set(['iphone', 'duo', 'macbook', 'ipad', 'airpods', 'jbl', 'coindcx', '27', 'prizes', 'giveaway', 'bumper', 'diwali', 'gift', 'winners', 'instagram', 'highlights', 'comment']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (/[.,?!]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  const m = modeNow(t);
  if (m === 'gone' || m === 'intro') return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const len = c.words.map((w) => w.w).join(' ').length;
  const fit = Math.min(1, 19 / Math.max(1, len));
  const R = rectAt(t);
  // sits under his chin, centred on the card, never over the mouth
  const y = m === 'full' || m === 'close' ? 1450 : R.y + R.h - 165;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'nowrap', columnGap: 34}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const serif = SERIF_W.has(k);
        const p = pt(t, w.s - 0.06, w.s + 0.18, ease.out);
        const on = t >= w.s - 0.03 && (i === c.words.length - 1 || t < c.words[i + 1].s - 0.03);
        return (
          <span
            key={i}
            style={{
              fontFamily: serif ? SERIF : SANS,
              fontStyle: serif ? 'italic' : 'normal',
              paddingRight: serif ? '0.12em' : 0,
              fontWeight: serif ? 400 : 800,
              fontSize: (serif ? 96 : 72) * Math.max(0.72, fit),
              whiteSpace: 'nowrap',
              letterSpacing: serif ? '0' : '-0.02em',
              lineHeight: 1.12,
              display: 'inline-block',
              ...(GOLD_W.has(k) || on ? goldText : {color: '#FFFFFF'}),
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px) scale(${(on ? 1.1 : 1) * lerp(1.35, 1, p)})`,
              filter: `drop-shadow(0 4px 14px rgba(0,0,0,0.85))${p < 1 ? ` blur(${(1 - p) * 6}px)` : ''}`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- graphic layers (keyed to his words)
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => ap(t, a, fi) * (1 - pt(t, b - fo, b, ease.in));

const PRODUCTS = [
  {n: 'iphone-duo.png', name: 'iPhone Duo', at: 22, w: 560},
  {n: 'macbook.png', name: 'MacBook', at: 28, w: 600},
  {n: 'ipad.png', name: 'iPad', at: 32, w: 400},
  {n: 'airpods.png', name: 'AirPods', at: 36, w: 330},
  {n: 'jbl.png', name: 'JBL Speaker', at: 41, w: 560},
];
/** The five gifts: each slams in on its name, then they line up in a tray. */
const Products: React.FC<{t: number}> = ({t}) => {
  const a = W(21) - 0.12, b = W(48) - 0.12;
  if (t < a - 0.05 || t > b + 0.4) return null;
  const v = win(t, a, b + 0.3, 0.2, 0.35);
  const cur = PRODUCTS.reduce((n, p, i) => (t >= W(p.at) - 0.08 ? i : n), -1);
  const lineup = pt(t, W(46) - 0.1, W(46) + 0.5, ease.inOut);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <DotGrid x={60} y={140} t={t} at={a} cols={5} rows={3} />
      <Bars x={850} y={150} t={t} at={a} flip />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '0.3em', paddingLeft: '0.3em', color: C.gold, opacity: ap(t, a)}}>AAP KYA CHOOSE KARENGE?</div>
      {PRODUCTS.map((p, i) => {
        const at = W(p.at) - 0.08;
        const s = sp(t, at, 320, 16);
        if (s <= 0) return null;
        const hero = i === cur && lineup < 1;
        // tray slot along the top band
        const slotX = 120 + i * 210, slotY = 300;
        const heroX = 540, heroY = 600;
        const away = i < cur ? pt(t, W(PRODUCTS[i + 1].at) - 0.1, W(PRODUCTS[i + 1].at) + 0.3, ease.inOut) : 0;
        const k = Math.max(away, lineup);
        const lx = 105 + i * 217, ly = 640;
        const x = i === cur && lineup === 0 ? lerp(1400, heroX, m1(s)) : lerp(heroX, lineup > 0 ? lx : slotX, k);
        const y = i === cur && lineup === 0 ? heroY : lerp(heroY, lineup > 0 ? ly : slotY, k);
        const scale = lerp(1, lineup > 0 ? 0.38 : 0.28, k);
        const w = p.w;
        return (
          <div key={p.n} style={{position: 'absolute', left: x - w / 2, top: y - 230, width: w, transform: `scale(${scale}) rotate(${(1 - m1(s)) * 18}deg)`, filter: s < 0.85 ? `blur(${(1 - s) * 14}px)` : undefined, zIndex: hero ? 5 : 1}}>
            <Img src={brand(p.n)} style={{width: '100%', display: 'block', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.65))', transform: hero ? `translateY(${Math.sin(t * 2) * 8}px)` : undefined}} />
          </div>
        );
      })}
      {/* hero name */}
      {cur >= 0 && lineup < 0.5 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: 1 - lineup * 2}}>
          <div key={cur} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...goldText, transform: `translateY(${(1 - ap(t, W(PRODUCTS[cur].at) - 0.05, 0.3)) * 40}px)`, opacity: ap(t, W(PRODUCTS[cur].at) - 0.05, 0.2), lineHeight: 1}}>{PRODUCTS[cur].name}?</div>
        </div>
      )}
      {lineup > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: lineup}}>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, letterSpacing: '-0.03em', color: C.cream}}>Kaunsa </span>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, ...goldText}}>choose karenge?</span>
        </div>
      )}
    </div>
  );
};

/** CoinDCX x Deepak: bumper giveaway (speaker off). */
const Bumper: React.FC<{t: number}> = ({t}) => {
  const a = W(48) - 0.12, b = W(60) - 0.12;
  if (t < a || t > b + 0.2) return null;
  const v = win(t, a, b + 0.2, 0.2, 0.3);
  const collab = sp(t, W(49) - 0.08, 260, 16);
  const slam = sp(t, W(58) - 0.08, 420, 14);
  const conf = pt(t, W(58) - 0.05, W(58) + 1.8, ease.out);
  const shake = t > W(58) - 0.05 && t < W(58) + 0.3 ? Math.sin(t * 90) * 10 * (1 - (t - W(58) + 0.05) / 0.35) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v, transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
      <DotGrid x={70} y={170} t={t} at={a} />
      <DotGrid x={830} y={1620} t={t} at={a + 0.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, opacity: m1(collab * 2), transform: `scale(${lerp(0.7, 1, m1(collab))})`}}>
        <div style={{width: 210, height: 210, borderRadius: 210, padding: 7, background: GOLD_GRAD}}>
          <Img src={brand('dw-profile.png')} style={{width: '100%', height: '100%', borderRadius: 210, border: '5px solid #111', boxSizing: 'border-box'}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 110, color: C.gold}}>×</div>
        <div style={{height: 210, minWidth: 330, borderRadius: 40, background: '#fff', display: 'grid', placeItems: 'center', padding: '0 34px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 82, letterSpacing: '-0.04em', color: '#111'}}>CoinDCX</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 48, color: C.dim, opacity: ap(t, W(51) - 0.05)}}>ke saath milkar lekar aaye hain</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', transform: `scale(${lerp(2.2, 1, m1(slam))}) rotate(${lerp(-6, -2, m1(slam))}deg)`, opacity: m1(slam * 3)}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 210, letterSpacing: '-0.06em', lineHeight: 0.92, ...goldText, filter: 'drop-shadow(0 14px 40px rgba(255,120,0,0.45))'}}>BUMPER</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, color: C.cream, lineHeight: 1}}>Giveaway</div>
      </div>
      {/* gifts orbit under the title */}
      {PRODUCTS.map((p, i) => {
        const ang = (i / 5) * Math.PI * 2 + (t - a) * 0.9;
        const rx = 380, ry = 120;
        const x = 540 + Math.cos(ang) * rx, y = 1350 + Math.sin(ang) * ry;
        const depth = (Math.sin(ang) + 1) / 2;
        return (
          <div key={p.n} style={{position: 'absolute', left: x - 130, top: y - 110, width: 260, transform: `scale(${lerp(0.55, 1, depth) * m1(sp(t, a + 0.15 + i * 0.06, 240, 16))})`, zIndex: Math.round(depth * 10), opacity: lerp(0.6, 1, depth)}}>
            <Img src={brand(p.n)} style={{width: '100%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))'}} />
          </div>
        );
      })}
      <Ico n="party_popper.png" size={200} style={{position: 'absolute', left: 60, top: 1000, transform: `scale(${m1(sp(t, W(58) - 0.05, 380, 12))}) rotate(-20deg)`}} />
      <Ico n="party_popper.png" size={200} style={{position: 'absolute', left: 820, top: 1000, transform: `scale(${m1(sp(t, W(58), 380, 12))}) scaleX(-1) rotate(-20deg)`}} />
      {conf > 0 && conf < 1 &&
        Array.from({length: 70}, (_, i) => {
          const ang = rand(i * 2.3) * Math.PI * 2;
          const vv = 300 + rand(i * 4.1) * 800;
          const x = 540 + Math.cos(ang) * vv * conf;
          const y = 860 + Math.sin(ang) * vv * conf * 0.8 + conf * conf * 900;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 28, borderRadius: 3, background: [C.gold, C.cream, '#FFC46B', C.gold2][i % 4], transform: `rotate(${i * 47 + conf * 720}deg)`, opacity: 1 - conf}} />;
        })}
    </div>
  );
};

/** "keval ek, do, paanch nahi" counter above the split card. */
const Counter: React.FC<{t: number}> = ({t}) => {
  const a = W(63) - 0.1, b = W(69) - 0.1;
  if (t < a || t > b + 0.1) return null;
  const v = win(t, a, b + 0.1, 0.2, 0.15);
  const nums = [
    {n: '1', at: 65},
    {n: '2', at: 66},
    {n: '5', at: 67},
  ];
  const strike = pt(t, W(68) - 0.05, W(68) + 0.25, ease.inOut);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: '0.3em', paddingLeft: '0.3em', color: C.gold}}>SIRF ITNE WINNERS?</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 70}}>
        {nums.map((x, i) => {
          const s = sp(t, W(x.at) - 0.08, 420, 14);
          return (
            <div key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 260, letterSpacing: '-0.05em', color: strike > 0.5 ? 'rgba(247,243,238,0.35)' : C.cream, transform: `scale(${lerp(1.8, 1, m1(s))})`, opacity: m1(s * 3), lineHeight: 1}}>
              {x.n}
            </div>
          );
        })}
      </div>
      <svg width={1080} height={700} style={{position: 'absolute', left: 0, top: 300, opacity: strike > 0.01 ? 1 : 0}}>
        <path d="M 150 300 L 930 160" stroke={C.red} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${strike * 900} 2000`} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.red, opacity: ap(t, W(68) - 0.05)}}>nahi!</div>
    </div>
  );
};

/** 27 WINNERS (speaker off). */
const Winners: React.FC<{t: number}> = ({t}) => {
  const a = W(69) - 0.1, b = W(79) - 0.12;
  if (t < a || t > b + 0.2) return null;
  const v = win(t, a, b + 0.2, 0.15, 0.3);
  const hit = sp(t, a, 420, 13);
  const count = Math.round(lerp(5, 27, pt(t, a, a + 0.6, ease.out)));
  const shine = ((t - a) * 0.6) % 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <Bars x={70} y={170} t={t} at={a} />
      <DotGrid x={830} y={170} t={t} at={a} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(2.4, 1, m1(hit))})`, opacity: m1(hit * 3)}}>
        <div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 470, letterSpacing: '-0.07em', lineHeight: 0.9, ...goldText, filter: 'drop-shadow(0 20px 60px rgba(255,120,0,0.5))', fontVariantNumeric: 'tabular-nums'}}>
          {count}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine * 100 - 15}%, rgba(255,255,255,0.65) ${shine * 100}%, transparent ${shine * 100 + 15}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', mixBlendMode: 'screen'}}>{count}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '0.08em', paddingLeft: '0.08em', color: C.cream, opacity: ap(t, W(70) - 0.05), transform: `translateY(${(1 - ap(t, W(70) - 0.05, 0.3)) * 40}px)`}}>WINNERS</div>
      {/* 27 trophies filling a grid */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 900, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 14}}>
        {Array.from({length: 27}, (_, i) => {
          const s = sp(t, W(71) + i * 0.035, 400, 14);
          return <Ico key={i} n={i % 9 === 4 ? 'crown.png' : 'trophy.png'} size={78} style={{transform: `scale(${m1(s)}) translateY(${Math.sin(t * 3 + i) * 4}px)`, margin: '0 auto'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', opacity: ap(t, W(72) - 0.05)}}>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.cream}}>prizes jeetne ka </span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, ...goldText, opacity: ap(t, W(76) - 0.05), transform: `scale(${lerp(1.2, 1, ap(t, W(76) - 0.05, 0.4))})`}}>sunehra mauka</div>
      <Ico n="sparkles.png" size={140} style={{position: 'absolute', left: 860, top: 1300, opacity: ap(t, W(76)), transform: `rotate(${Math.sin(t * 3) * 10}deg)`}} />
    </div>
  );
};

/** Steps: 1) link -> account, 2) Instagram highlights (above the split card). */
const HL = [
  {img: 'hl-community.png', name: 'community'},
  {img: 'hl-forex.png', name: 'Forex Expo'},
  {img: 'hl-deeptalks.png', name: 'DeeP Talks'},
  {img: 'hl-ytlive.png', name: 'YT Live Join…'},
];
const Steps: React.FC<{t: number}> = ({t}) => {
  const a = W(79) - 0.12, b = W(97) - 0.12;
  if (t < a || t > b + 0.1) return null;
  const v = win(t, a, b + 0.1, 0.2, 0.3);
  const s2 = t >= W(88) - 0.15;
  const k = pt(t, W(88) - 0.2, W(88) + 0.25, ease.inOut);
  const acct = sp(t, W(86) - 0.08, 400, 16);
  const lit = t > W(90) - 0.1 ? Math.min(3, Math.floor((t - W(90) + 0.1) / 0.35)) : -1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', gap: 20}}>
        {['MERE LINK SE ACCOUNT', 'INSTAGRAM HIGHLIGHTS'].map((l, i) => {
          const on = (i === 0 && !s2) || (i === 1 && s2);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, border: `2px solid ${on ? C.gold : C.line}`, background: on ? 'rgba(255,138,0,0.14)' : 'transparent', fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.12em', color: on ? C.gold : C.dim}}>
              <span style={{width: 34, height: 34, borderRadius: 34, background: on ? GOLD_GRAD : 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', color: C.ink, fontSize: 20}}>{i + 1}</span>
              {l}
            </div>
          );
        })}
      </div>
      {/* step 1: link -> account */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 260, opacity: 1 - k, transform: `translateX(${-k * 300}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 20}}>
          <Ico n="link.png" size={170} style={{transform: `scale(${m1(sp(t, W(84) - 0.08, 380, 12))}) rotate(-10deg)`}} />
          <div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, ...goldText, lineHeight: 1}}>Mere link se</div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, letterSpacing: '-0.03em', color: C.cream, opacity: ap(t, W(86) - 0.05)}}>account kholiye</div>
          </div>
        </div>
        <div style={{marginTop: 40, borderRadius: 30, background: '#fff', padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${lerp(0.7, 1, m1(acct))})`, opacity: m1(acct * 2), boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: '#111', letterSpacing: '-0.03em'}}>CoinDCX</span>
          <span style={{flex: 1, fontFamily: SANS, fontSize: 30, color: '#666'}}>Create account</span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#fff', background: '#16A34A', borderRadius: 999, padding: '12px 22px'}}>✓ Link applied</span>
        </div>
      </div>
      {/* step 2: Instagram profile + highlights */}
      {s2 && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 250, borderRadius: 40, background: '#fff', padding: '30px 34px', boxShadow: '0 50px 100px rgba(0,0,0,0.6)', opacity: k, transform: `translateX(${(1 - k) * 400}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
            <div style={{width: 150, height: 150, borderRadius: 150, padding: 6, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', flexShrink: 0}}>
              <Img src={brand('dw-profile.png')} style={{width: '100%', height: '100%', borderRadius: 150, border: '5px solid #fff', boxSizing: 'border-box'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 800, fontSize: 38, color: '#111'}}>
                deepakwadhwa.official
                <svg width={34} height={34} viewBox="0 0 40 40">
                  <path d="M20 2l4.2 3.1 5.2-.3 1.7 4.9 4.4 2.8-1.2 5.1 2.1 4.8-3.6 3.8-.4 5.2-5.1 1.3-3 4.3-4.9-1.8-4.9 1.8-3-4.3-5.1-1.3-.4-5.2L2.4 22.4l2.1-4.8-1.2-5.1 4.4-2.8 1.7-4.9 5.2.3z" fill="#0095F6" />
                  <path d="M13 20.5l4.6 4.6L27.5 15" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{display: 'flex', gap: 30, marginTop: 8, fontFamily: SANS, fontSize: 26, color: '#333'}}>
                <span><b>512</b> posts</span>
                <span><b>1.4M</b> followers</span>
                <span><b>47</b> following</span>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 26}}>
            {HL.map((h, i) => {
              const on = i === lit;
              return (
                <div key={h.name} style={{width: 210, textAlign: 'center', transform: `scale(${on ? 1.12 : 1})`}}>
                  <div style={{width: 140, height: 140, margin: '0 auto', borderRadius: 140, padding: 5, background: on ? 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)' : '#DBDBDB'}}>
                    <Img src={brand(h.img)} style={{width: '100%', height: '100%', borderRadius: 140, border: '4px solid #fff', boxSizing: 'border-box'}} />
                  </div>
                  <div style={{fontFamily: SANS, fontSize: 24, fontWeight: on ? 800 : 500, color: '#111', marginTop: 8, whiteSpace: 'nowrap'}}>{h.name}</div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 18, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: '#111', opacity: ap(t, W(93) - 0.05)}}>
            saari <span style={{color: C.gold2}}>details</span> yahan 👆
          </div>
        </div>
      )}
    </div>
  );
};

/** Comment poll above the framed card, then "apne ghar kaunsa gift". */
const Poll: React.FC<{t: number}> = ({t}) => {
  const a = W(99) - 0.1;
  if (t < a || t > edit.speech) return null;
  const v = ap(t, a, 0.25);
  const ghar = t > W(110) - 0.1;
  const k = pt(t, W(110) - 0.15, W(110) + 0.3, ease.inOut);
  const pick = Math.floor(((t - a) * 2.2) % 5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      <DotGrid x={70} y={150} t={t} at={a} />
      <Bars x={830} y={160} t={t} at={a} flip />
      {/* comment box */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 250, opacity: 1 - k, transform: `translateY(${-k * 80}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 30, padding: '22px 26px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', transform: `scale(${lerp(0.7, 1, m1(sp(t, a, 300, 18)))})`}}>
          <Ico n="speech_balloon.png" size={70} />
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: '#888'}}>Add a comment…</div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: '#111', letterSpacing: '-0.03em'}}>
              {PRODUCTS[pick].name}
              <span style={{color: C.gold2, opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>
            </div>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#fff', background: C.gold2, borderRadius: 999, padding: '14px 22px'}}>Post</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30}}>
          {PRODUCTS.map((p, i) => (
            <div key={p.n} style={{width: 160, height: 170, borderRadius: 26, background: i === pick ? 'rgba(255,138,0,0.18)' : 'rgba(255,255,255,0.05)', border: `2px solid ${i === pick ? C.gold : C.line}`, display: 'grid', placeItems: 'center', transform: `scale(${m1(sp(t, W(101) + i * 0.07, 380, 16)) * (i === pick ? 1.08 : 1)})`}}>
              <Img src={brand(p.n)} style={{width: 120, height: 120, objectFit: 'contain'}} />
            </div>
          ))}
        </div>
        <div style={{textAlign: 'center', marginTop: 20, fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, ...goldText, opacity: ap(t, W(108) - 0.05)}}>sabse zyada kaunsa pasand?</div>
      </div>
      {ghar && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 60}px)`}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.cream}}>Is Diwali apne ghar</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, ...goldText, lineHeight: 1}}>kaunsa gift?</div>
          <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 40}}>
            {PRODUCTS.map((p, i) => (
              <Img key={p.n} src={brand(p.n)} style={{width: 170, height: 170, objectFit: 'contain', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.6))', transform: `translateY(${Math.sin(t * 2.4 + i) * 10}px) scale(${m1(sp(t, W(110) + i * 0.08, 340, 14))})`}} />
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 34}}>
            <Ico n="diya_lamp.png" size={90} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.cream}}>Comment karke bataiye</span>
            <Ico n="backhand_index_pointing_down.png" size={80} style={{transform: `translateY(${Math.sin(t * 6) * 10}px)`}} />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- intro: cut-out Deepak, live background, fast kinetic words
const T_OUT = W(21) - 0.12;
const CUT_FRAMES = 195;
const BEAT_S = 60 / 112;
const PHRASES = [
  {a: 0, b: 3, big: new Set([1])}, // Ek SAWAAL hai dosto
  {a: 4, b: 10, big: new Set([6])}, // ki is DIWALI aap logon ko
  {a: 11, b: 14, big: new Set([11, 12])}, // SURPRISE GIFT mil jaaye
  {a: 15, b: 20, big: new Set([19])}, // toh aap log kya CHOOSE karenge?
];
const ZOOMS = [
  {at: 0, z: 1.0},
  {at: W(1) - 0.05, z: 1.1},
  {at: W(4) - 0.05, z: 1.02},
  {at: W(6) - 0.05, z: 1.14},
  {at: W(11) - 0.06, z: 1.26},
  {at: W(15) - 0.05, z: 1.04},
  {at: W(19) - 0.05, z: 1.16},
];
const HITS = [W(1), W(6), W(11), W(19)];

const Marquee: React.FC<{t: number; y: number; dir: number; text: string; o: number}> = ({t, y, dir, text, o}) => {
  const x = ((t * 260 * dir) % 1400) - (dir > 0 ? 1400 : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '3px rgba(255,138,0,0.55)', opacity: o}}>
      {Array.from({length: 4}, () => text).join('  ')}
    </div>
  );
};

const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > T_OUT + 0.45) return null;
  const out = pt(t, T_OUT - 0.05, T_OUT + 0.4, ease.inOut);
  const pulse = Math.exp(-(((t % BEAT_S) / BEAT_S) * 6));
  // camera: punch-in on every phrase, short shake on the hits
  const zi = ZOOMS.reduce((n, z, i) => (t >= z.at ? i : n), 0);
  const zk = zi ? m1(sp(t, ZOOMS[zi].at, 420, 26)) : 1;
  const zoom = lerp(zi ? ZOOMS[zi - 1].z : 1, ZOOMS[zi].z, zk) * lerp(1, 0.5, out);
  const enter = sp(t, 0, 300, 20);
  const hit = HITS.reduce((m, h) => Math.max(m, t >= h - 0.06 && t < h + 0.22 ? 1 - (t - h + 0.06) / 0.28 : 0), 0);
  const shx = Math.sin(t * 95) * 12 * hit, shy = Math.cos(t * 80) * 8 * hit;
  const fi = Math.min(CUT_FRAMES - 1, Math.floor(t * FPS));
  const pi = PHRASES.reduce((n, p, i) => (t >= W(p.a) - 0.08 ? i : n), 0);
  const P = PHRASES[pi];
  const pin = ap(t, W(P.a) - 0.08, 0.18);
  const flick = Math.floor(t * 7) % 5; // fast product teaser behind him
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translate(${shx}px, ${shy}px)`}}>
      {/* live background */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 52%, rgba(255,120,0,${0.42 + 0.18 * pulse}) 0%, #2A1204 45%, ${C.bg} 100%)`}} />
      <AbsoluteFill style={{background: `repeating-conic-gradient(from ${t * 28}deg at 50% 62%, rgba(255,170,60,0.13) 0deg 7deg, transparent 7deg 18deg)`}} />
      <Marquee t={t} y={300} dir={-1} text="DIWALI BUMPER GIVEAWAY •" o={0.55} />
      <Marquee t={t + 2} y={520} dir={1} text="27 WINNERS • 5 GIFTS •" o={0.4} />
      <Marquee t={t + 4} y={740} dir={-1} text="iPHONE • MACBOOK • iPAD • AIRPODS • JBL •" o={0.3} />
      {PRODUCTS.map((p, i) => {
        const ang = (i / 5) * Math.PI * 2 + t * 1.1;
        const x = 540 + Math.cos(ang) * 470, y = 1000 + Math.sin(ang) * 260;
        const front = i === flick && t > W(15);
        return <Img key={p.n} src={brand(p.n)} style={{position: 'absolute', left: x - 120, top: y - 100, width: 240, opacity: front ? 0.95 : 0.55, transform: `scale(${front ? 1.25 : 0.85}) rotate(${Math.sin(t * 2 + i) * 10}deg)`, filter: `blur(${front ? 0 : 2}px) drop-shadow(0 20px 30px rgba(0,0,0,0.6))`}} />;
      })}
      {Array.from({length: 30}, (_, i) => {
        const x = rand(i * 7.7) * 1080;
        const y = 1920 - ((rand(i * 3.3) * 1920 + t * (160 + rand(i) * 260)) % 2000);
        const r = 4 + rand(i * 2.9) * 8;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? C.gold : '#FFE2B0', boxShadow: `0 0 ${r * 3}px ${C.gold}`, opacity: 0.7}} />;
      })}
      {/* Deepak, background removed */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '50% 100%', transform: `translateY(${420 + (1 - m1(enter)) * 300}px) scale(${zoom * 1.12})`}}>
        <Img src={staticFile(`clips/cut/f${String(fi).padStart(4, '0')}.webp`)} style={{width: 1080, height: 1920, filter: 'contrast(1.07) saturate(1.12) drop-shadow(0 0 26px rgba(255,140,0,0.55)) drop-shadow(0 30px 50px rgba(0,0,0,0.6))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 380, background: `linear-gradient(180deg, transparent, ${C.bg} 75%)`}} />
      {/* kinetic words: exactly what he says, word by word */}
      <div key={pi} style={{position: 'absolute', left: 50, right: 50, top: 190, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 22, rowGap: 0, opacity: pin, transform: `translateX(${(1 - pin) * 120}px)`, filter: pin < 1 ? `blur(${(1 - pin) * 10}px)` : undefined}}>
        {WORDS.slice(P.a, P.b + 1).map((w) => {
          const big = P.big.has(w.i);
          const s2 = sp(t, w.s - 0.06, 460, 17);
          if (s2 <= 0) return null;
          return (
            <span key={w.i} style={{display: 'inline-block', fontFamily: big ? SERIF : SANS, fontStyle: big ? 'italic' : 'normal', fontWeight: big ? 400 : 900, fontSize: big ? 190 : 92, lineHeight: big ? 1.0 : 1.15, letterSpacing: big ? '0' : '-0.03em', textTransform: big ? 'none' : 'uppercase', paddingRight: big ? '0.1em' : 0, ...(big ? goldText : {color: C.cream}), transform: `scale(${lerp(big ? 2.2 : 1.6, 1, m1(s2))})`, opacity: m1(s2 * 3), filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.7))'}}>
              {w.w.replace(/[,]/g, '')}
            </span>
          );
        })}
      </div>
      {pi === 0 && <Ico n="red_question_mark.png" size={150} style={{position: 'absolute', left: 840, top: 150, transform: `rotate(${14 + Math.sin(t * 6) * 8}deg) scale(${m1(sp(t, W(2) - 0.05, 420, 12))})`}} />}
      {pi === 1 && <Ico n="diya_lamp.png" size={150} style={{position: 'absolute', left: 60, top: 560, transform: `scale(${m1(sp(t, W(6) - 0.05, 420, 12))})`, filter: `drop-shadow(0 0 ${20 + 14 * pulse}px rgba(255,160,60,0.9))`}} />}
      {pi === 2 && (
        <Ico n="wrapped_gift.png" size={230} style={{position: 'absolute', left: 800, top: 560, transform: `scale(${m1(sp(t, W(11) - 0.08, 420, 11))}) rotate(${Math.sin(t * 24) * 8}deg)`}} />
      )}
      {pi === 3 && <Ico n="thinking_face.png" size={150} style={{position: 'absolute', left: 70, top: 600, transform: `scale(${m1(sp(t, W(15), 420, 12))}) rotate(-10deg)`}} />}
      {/* phrase-change flash */}
      <AbsoluteFill style={{background: '#FFD9A0', opacity: (1 - pt(t, W(P.a) - 0.08, W(P.a) + 0.06)) * (pi ? 0.35 : 0), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** His name, zoomed in and centred below the mouth: in the intro and whenever his card comes back. */
const NAME_AT = [0.25, W(21) + 0.15, W(79) + 0.1, W(110) + 0.1];
const NameTag: React.FC<{t: number}> = ({t}) => {
  const a = NAME_AT.filter((x) => t >= x).pop();
  if (a === undefined || t > a + 2.3 || t > edit.speech) return null;
  const m = modeNow(t);
  if (m === 'gone') return null;
  const R = rectAt(t);
  const s = sp(t, a, 380, 15);
  const v = m1(s * 2) * (1 - pt(t, a + 1.9, a + 2.3, ease.in));
  const intro = m === 'intro';
  const y = intro ? 1600 : R.y + 26;
  const shine = pt(t, a + 0.15, a + 0.9, ease.inOut);
  return (
    <div style={{position: 'absolute', left: intro ? 0 : R.x + 26, right: intro ? 0 : undefined, top: y, display: 'flex', justifyContent: 'center', opacity: v, transformOrigin: intro ? '50% 50%' : '0 50%', transform: `scale(${lerp(1.9, 1, m1(s))})`}}>
      <div style={{position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, padding: intro ? '18px 40px' : '12px 30px', borderRadius: 999, background: GOLD_GRAD, boxShadow: '0 18px 50px rgba(255,120,0,0.45), 0 10px 30px rgba(0,0,0,0.6)'}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: intro ? 70 : 46, letterSpacing: '-0.02em', color: C.ink, whiteSpace: 'nowrap'}}>Deepak Wadhwa</span>
        <svg width={intro ? 50 : 36} height={intro ? 50 : 36} viewBox="0 0 40 40">
          <path d="M20 2l4.2 3.1 5.2-.3 1.7 4.9 4.4 2.8-1.2 5.1 2.1 4.8-3.6 3.8-.4 5.2-5.1 1.3-3 4.3-4.9-1.8-4.9 1.8-3-4.3-5.1-1.3-.4-5.2L2.4 22.4l2.1-4.8-1.2-5.1 4.4-2.8 1.7-4.9 5.2.3z" fill={C.ink} />
          <path d="M13 20.5l4.6 4.6L27.5 15" fill="none" stroke={C.gold} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine * 140 - 30}%, rgba(255,255,255,0.7) ${shine * 140 - 15}%, transparent ${shine * 140}%)`}} />
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.25) return null;
  const r = t - a;
  const k = pt(t, a - 0.25, a + 0.1);
  return (
    <AbsoluteFill style={{opacity: k}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: pt(r, 0.05, 0.4)}}>
        <Img src={brand('dw-profile.png')} style={{width: 130, height: 130, borderRadius: 130, border: `5px solid ${C.gold}`}} />
        <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 70, color: C.gold}}>×</span>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#111', background: '#fff', borderRadius: 26, padding: '20px 30px', letterSpacing: '-0.03em'}}>CoinDCX</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.05em', ...goldText, opacity: pt(r, 0.15, 0.5), lineHeight: 0.95}}>BUMPER</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, color: C.cream, opacity: pt(r, 0.25, 0.6)}}>Diwali Giveaway</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', gap: 10}}>
        {PRODUCTS.map((p, i) => (
          <Img key={p.n} src={brand(p.n)} style={{width: 180, height: 180, objectFit: 'contain', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.6))', transform: `scale(${m1(sp(t, a + 0.3 + i * 0.07, 340, 14))})`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1120, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.cream, letterSpacing: '-0.03em', opacity: pt(r, 0.6, 0.9)}}>
        <span style={goldText}>27</span> winners
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim, opacity: pt(r, 0.8, 1.1)}}>Details: Instagram highlights · @deepakwadhwa.official</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1760, textAlign: 'center', fontFamily: SANS, fontSize: 22, color: 'rgba(247,243,238,0.45)'}}>Crypto trading involves risk. T&amp;C apply.</div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = Math.max(0, ...LAYOUT.slice(1).map((l) => 1 - Math.min(1, Math.abs(t - l.at) / 0.05)));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop t={t} />
      <Speaker t={t} />
      <Brackets t={t} />
      <Intro t={t} />
      <NameTag t={t} />
      <Products t={t} />
      <Bumper t={t} />
      <Counter t={t} />
      <Winners t={t} />
      <Steps t={t} />
      <Poll t={t} />
      {t < edit.speech && <Captions t={t} />}
      <AbsoluteFill style={{background: C.gold, opacity: flash * 0.18, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 62%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.55} />}
    </AbsoluteFill>
  );
};
