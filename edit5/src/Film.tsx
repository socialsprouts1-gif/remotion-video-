import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// ---------------------------------------------------------------- tokens: Diwali night, gold + burgundy
const C = {
  bg: '#060606',
  wine: '#121212',
  coal: '#1E1A16',
  burg: '#6E1428',
  burg2: '#8E2238',
  gold: '#FF8A00',
  gold2: '#FF6A00',
  cream: '#F7F3EE',
  ink: '#0A0A0A',
  dim: 'rgba(247,243,238,0.6)',
  line: 'rgba(255,138,0,0.28)',
  red: '#FF4A3D',
  green: '#3DDC84',
  flame: '#FF9A2E',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const GOLD_GRAD = 'linear-gradient(180deg, #FFC46B 0%, #FF9A1F 45%, #F26A00 100%)';

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
const sp = (t: number, at: number, stiffness = 260, damping = 22) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.2) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, v);
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const goldText: React.CSSProperties = {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

// ---------------------------------------------------------------- full-frame scenes (word-timed)
type Scene = {id: string; a: number; b: number; dir: number};
const FF: Scene[] = [
  {id: 'wallet', a: W(4) - 0.08, b: W(10) - 0.06, dir: 1},
  {id: 'iphone', a: W(10) - 0.06, b: W(21) - 0.06, dir: -1},
  {id: 'devices', a: W(21) - 0.06, b: W(31) - 0.08, dir: 1},
  {id: 'solution', a: W(36) - 0.08, b: W(40) - 0.08, dir: -1},
  {id: 'link', a: W(45) - 0.08, b: W(53) - 0.08, dir: 1},
  {id: 'draw', a: W(56) - 0.08, b: W(73) - 0.08, dir: -1},
  {id: 'steps', a: W(80) - 0.08, b: W(96) - 0.08, dir: 1},
  {id: 'insta', a: W(96) - 0.08, b: W(111) - 0.08, dir: -1},
  {id: 'wise', a: W(118) - 0.08, b: W(131) - 0.08, dir: 1},
];
const sceneAt = (t: number) => FF.find((f) => t >= f.a && t < f.b);
const RETURNS = FF.filter((f) => !FF.some((g) => Math.abs(g.a - f.b) < 0.02)).map((f) => f.b);

// ---------------------------------------------------------------- the speaker
const Speaker: React.FC<{t: number; pip?: boolean}> = ({t, pip}) => {
  const back = RETURNS.reduce((s, r) => s + 0.14 * (1 - pt(t, r, r + 0.35, ease.out)) * (t >= r ? 1 : 0), 0);
  // alternate framing every return to the face (wide / close) so the single take never feels static
  const n = RETURNS.filter((r) => t >= r).length;
  const base = n % 2 ? 1.16 : 1.04;
  const intro = 0.2 * (1 - pt(t, 0, 0.6, ease.out));
  const z = pip ? 1 : base + back + intro + 0.015 * Math.sin(t * 0.4);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 40%'}}>
      {(edit.pieces as {src: string; at: number; in: number; out: number; dur: number}[]).map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round(c.dur * FPS) + 1}>
          <OffthreadVideo
            src={staticFile(c.src)}
            startFrom={c.in}
            muted={pip}
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) saturate(1.0) brightness(0.95)'}}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 42%, transparent 45%, rgba(0,0,0,0.45) 80%, rgba(0,0,0,0.85) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent 20%, transparent 58%, rgba(0,0,0,0.78))'}} />
  </>
);

/** Warm floating bokeh / sparks over everything: the Diwali night air. */
const Sparks: React.FC<{t: number; n?: number; o?: number}> = ({t, n = 26, o = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
    {Array.from({length: n}, (_, i) => {
      const x = rand(i * 3.1) * 1080;
      const speed = 20 + rand(i * 7.7) * 50;
      const y = 1920 - ((rand(i * 5.3) * 1920 + t * speed) % 2100);
      const r = 3 + rand(i * 9.1) * 9;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rand(i) * 2) + i));
      return <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 0.8 + i) * 18, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? C.gold : C.flame, opacity: 0.55 * tw, boxShadow: `0 0 ${r * 3}px ${C.gold}`}} />;
    })}
  </AbsoluteFill>
);

const Bubble: React.FC<{t: number; at: number; x: number; y: number; d?: number}> = ({t, at, x, y, d = 200}) => {
  const p = sp(t, at, 240, 18);
  const s = 0.25;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: d, height: d, transform: `scale(${Math.min(1.05, p)})`, opacity: m1(p * 2)}}>
      <div style={{position: 'absolute', inset: -7, borderRadius: d, border: `3px solid ${C.gold}`}} />
      <div style={{position: 'relative', width: d, height: d, borderRadius: d, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: d / 2 - 560 * s, top: d / 2 - 930 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Speaker t={t} pip />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- captions
const SERIF_W = new Set(['iphone', 'macbook', 'ipad', 'burgundy', 'solution', 'winner', 'lucky', 'diwali', 'wisely', 'samajhdaari', 'jeet', 'suna', 'highlights', 'link']);
const GOLD_W = new Set(['iphone', 'macbook', 'ipad', 'burgundy', 'solution', 'winner', 'lucky', 'diwali', 'happy', 'wisely', 'jeet', 'link', 'deltaexchange', 'delta', 'exchange', 'highlights', 'samajhdaari', 'bachakar', '18']);
const RED_W = new Set(['kam', 'problem']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const gapNext = nx ? nx.s - w.e : 9;
    if (/[.,?!]$/.test(w.w) || cur.length >= 3 || !nx || gapNext > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();

const Captions: React.FC<{t: number; small?: boolean}> = ({t, small}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const pop = sp(t, c.s - 0.03, 420, 22);
  const fs = small ? 52 : 86;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: small ? 1700 : 1100, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: small ? 10 : 14, transform: `scale(${lerp(0.82, 1, m1(pop))})`, opacity: m1(pop * 3)}}>
      {c.words.map((w, i) => {
        const on = i === cur;
        const seen = i <= cur;
        const k = key(w.w);
        const wp = sp(t, w.s - 0.03, 520, 18);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: fs,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.12,
              padding: small ? '2px 14px' : '4px 20px',
              borderRadius: small ? 12 : 18,
              display: 'inline-block',
              background: on ? GOLD_GRAD : 'transparent',
              color: on ? C.ink : RED_W.has(k) && seen ? C.red : GOLD_W.has(k) && seen ? C.gold : '#fff',
              opacity: seen ? 1 : 0.45,
              transform: `scale(${on ? lerp(1.25, 1.06, m1(wp)) : 1}) rotate(${on ? -2 : 0}deg)`,
              boxShadow: on ? '0 12px 30px rgba(255,106,0,0.45)' : 'none',
              WebkitTextStroke: on ? undefined : small ? '1.5px #000' : '3px #000',
              paintOrder: 'stroke fill',
              textShadow: on ? 'none' : '0 6px 18px rgba(0,0,0,0.85)',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- shared visuals
const Grain: React.FC<{frame: number; o?: number}> = ({frame, o = 0.07}) => (
  <AbsoluteFill style={{opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

/** Rich backdrop: wine-to-black with a slow gold rangoli ring behind the hero object. */
const Stage: React.FC<{t: number; cy?: number; children?: React.ReactNode}> = ({t, cy = 820, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% ${(cy / 1920) * 100}%, #3A1C04 0%, ${C.wine} 48%, ${C.bg} 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
      <g transform={`rotate(${t * 8} 540 ${cy})`}>
        {Array.from({length: 24}, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <ellipse key={i} cx={540 + Math.cos(a) * 420} cy={cy + Math.sin(a) * 420} rx={34} ry={12} fill="none" stroke={C.gold} strokeWidth={2} transform={`rotate(${(a * 180) / Math.PI} ${540 + Math.cos(a) * 420} ${cy + Math.sin(a) * 420})`} />;
        })}
        <circle cx={540} cy={cy} r={470} fill="none" stroke={C.gold} strokeWidth={1.5} strokeDasharray="2 14" />
        <circle cx={540} cy={cy} r={360} fill="none" stroke={C.gold} strokeWidth={1} />
      </g>
    </svg>
    <Sparks t={t} n={20} o={0.8} />
    {children}
  </AbsoluteFill>
);

const Kicker: React.FC<{t: number; at: number; children: React.ReactNode; top?: number}> = ({t, at, children, top = 180}) => {
  const p = ap(t, at, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', color: C.gold, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: '12px 28px', background: 'rgba(6,6,6,0.5)'}}>{children}</div>
    </div>
  );
};

const Check: React.FC<{size?: number; color?: string; sw?: number}> = ({size = 40, color = C.ink, sw = 3}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Rupee: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path d="M6 4 h12 M6 8.5 h12 M9 4 c4.5 0 6.5 2 6.5 4.5 S13.5 13 9 13 h-1 L16 21" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- devices (drawn, no brand marks)
/** Real iPhone 18 Pro Max (Burgundy) product image supplied by the client (checkerboard removed). 586x718. */
const PhoneImg: React.FC<{w?: number}> = ({w = 300}) => (
  <Img src={staticFile('brand/iphone18-burgundy.png')} style={{width: w, height: (w * 718) / 586, display: 'block', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))'}} />
);

const PhoneBack: React.FC<{w?: number; color?: string}> = ({w = 300, color = C.burg}) => {
  const h = w * 2.07;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.18, background: `linear-gradient(145deg, ${C.burg2} 0%, ${color} 45%, #2A0610 100%)`, boxShadow: `0 50px 100px rgba(0,0,0,0.6), inset 0 0 0 ${w * 0.018}px rgba(255,220,200,0.25)`}}>
      <div style={{position: 'absolute', left: w * 0.07, top: w * 0.07, width: w * 0.46, height: w * 0.46, borderRadius: w * 0.12, background: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0 0 2px rgba(255,220,200,0.18)'}}>
        {[[0.08, 0.08], [0.08, 0.26], [0.26, 0.17]].map(([x, y], i) => (
          <div key={i} style={{position: 'absolute', left: w * x, top: w * y, width: w * 0.13, height: w * 0.13, borderRadius: w, background: 'radial-gradient(circle at 40% 35%, #555 0%, #0b0b0b 55%)', boxShadow: '0 0 0 3px #2b0a12'}} />
        ))}
      </div>
    </div>
  );
};

const Laptop: React.FC<{w?: number}> = ({w = 640}) => (
  <div style={{width: w * 1.12, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{width: w, height: w * 0.64, borderRadius: w * 0.035, background: '#0d0d10', padding: w * 0.022, boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px #333'}}>
      <div style={{width: '100%', height: '100%', borderRadius: w * 0.012, background: `radial-gradient(circle at 30% 30%, ${C.gold2}, #3A1C04 50%, #0a0a0a)`}} />
    </div>
    <div style={{width: w * 1.12, height: w * 0.035, borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, background: 'linear-gradient(180deg,#d9d9de,#9b9ba3)'}} />
  </div>
);

const Tablet: React.FC<{w?: number}> = ({w = 330}) => (
  <div style={{width: w, height: w * 1.4, borderRadius: w * 0.09, background: 'linear-gradient(145deg,#e4e4e9,#a7a7ae)', padding: w * 0.04, boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: w * 0.05, background: `radial-gradient(circle at 70% 25%, #FFC46B, ${C.gold2} 40%, #1a0d02)`}} />
  </div>
);

// ---------------------------------------------------------------- scenes
type SP = {t: number; a: number; b: number};

const Wallet: React.FC<SP> = ({t, a}) => {
  const drain = pt(t, W(4), W(5) + 0.4, ease.inOut);
  const thought = sp(t, W(7) - 0.05, 240, 16);
  const bal = 1 - drain * 0.9;
  return (
    <Stage t={t} cy={760}>
      <Kicker t={t} at={a}>ACCOUNT BALANCE</Kicker>
      <div style={{position: 'absolute', left: 120, right: 120, top: 340, background: 'rgba(6,6,6,0.75)', border: `1.5px solid ${C.line}`, borderRadius: 40, padding: '44px 50px', transform: `translateY(${(1 - ap(t, a, 0.3)) * 100}px)`, opacity: ap(t, a, 0.2)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.dim}}>Savings account</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 14}}>
          <Rupee size={84} color={drain > 0.6 ? C.red : C.cream} />
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '-0.04em', color: drain > 0.6 ? C.red : C.cream}}>{'•'.repeat(Math.max(1, Math.round(6 * bal)))}</span>
        </div>
        <div style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.08)', marginTop: 26, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${bal * 100}%`, background: drain > 0.6 ? C.red : GOLD_GRAD, borderRadius: 11}} />
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.red, marginTop: 20, opacity: ap(t, W(4) + 0.15, 0.25)}}>paise kam…</div>
      </div>
      {/* mann mein: a thought bubble with the dream */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1020, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m1(thought * 2), transform: `scale(${lerp(0.6, 1, m1(thought))})`}}>
        <div style={{display: 'flex', gap: 14, marginBottom: 16}}>
          {[18, 28, 40].map((d, i) => (
            <div key={i} style={{width: d, height: d, borderRadius: d, background: C.cream, opacity: 0.9, transform: `translateY(${-i * 10}px)`}} />
          ))}
        </div>
        <div style={{background: C.cream, borderRadius: 120, padding: '40px 70px', display: 'flex', alignItems: 'center', gap: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: C.gold2}}>mann mein…</span>
          <div style={{transform: 'rotate(8deg)'}}>
            <PhoneImg w={120} />
          </div>
        </div>
      </div>
    </Stage>
  );
};

const IPhone: React.FC<SP> = ({t, a}) => {
  const p = sp(t, a + 0.02, 120, 16);
  const spin = lerp(-70, -14, m1(p)) + Math.sin(t * 0.9) * 4;
  const shine = ((t - a) * 0.5) % 1;
  const big = sp(t, W(16) - 0.05, 320, 20);
  const color = sp(t, W(18) - 0.05, 300, 18);
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a + 0.05}>THE DREAM</Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: '-0.05em', lineHeight: 1, ...goldText, opacity: m1(big * 2), transform: `scale(${lerp(1.3, 1, m1(big))})`}}>iPhone 18 Pro Max</div>
      <div style={{position: 'absolute', left: 540 - 290, top: 470, width: 580, perspective: 1800}}>
        <div style={{transform: `rotateY(${spin * 0.35}deg) translateY(${(1 - m1(p)) * 600 + Math.sin(t * 1.2) * 8}px) scale(${lerp(0.85, 1, m1(p))})`, position: 'relative'}}>
          <PhoneImg w={580} />
          {/* light sweep, masked to the phone itself */}
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('brand/iphone18-burgundy.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('brand/iphone18-burgundy.png')})`, maskSize: '100% 100%', overflow: 'hidden', pointerEvents: 'none'}}>
            <div style={{position: 'absolute', top: -300, bottom: -300, width: 160, left: lerp(-300, 900, shine), transform: 'rotate(20deg)', background: 'linear-gradient(90deg, transparent, rgba(255,235,225,0.32), transparent)'}} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: m1(color * 2), transform: `translateY(${(1 - m1(color)) * 40}px)`}}>
        <div style={{width: 70, height: 70, borderRadius: 70, background: `linear-gradient(145deg, ${C.burg2}, ${C.burg})`, boxShadow: `0 0 0 5px ${C.bg}, 0 0 0 8px ${C.gold}`}} />
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.cream}}>Burgundy</span>
      </div>
    </Stage>
  );
};

const Devices: React.FC<SP> = ({t, a}) => {
  const mac = sp(t, W(23) - 0.06, 260, 20);
  const pad = sp(t, W(28) - 0.06, 260, 20);
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a}>YA PHIR…</Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, lineHeight: 1, ...goldText}}>
        <span style={{opacity: m1(mac * 2), display: 'inline-block', transform: `translateY(${(1 - m1(mac)) * 40}px)`}}>MacBook</span>
        <span style={{opacity: m1(pad * 2), display: 'inline-block', marginLeft: 30, transform: `translateY(${(1 - m1(pad)) * 40}px)`}}>
          <span style={{fontFamily: SANS, fontStyle: 'normal', fontSize: 70, color: C.dim, WebkitTextFillColor: C.dim}}>ya </span>iPad
        </span>
      </div>
      <div style={{position: 'absolute', left: 140, top: 640, transform: `translateX(${(1 - m1(mac)) * -900}px) rotate(${(1 - m1(mac)) * -10}deg)`}}>
        <Laptop w={640} />
      </div>
      <div style={{position: 'absolute', left: 620, top: 900, transform: `translateX(${(1 - m1(pad)) * 900}px) rotate(${lerp(14, 6, m1(pad))}deg)`}}>
        <Tablet w={300} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 1060, transform: `rotate(-8deg) translateY(${(1 - ap(t, a, 0.3)) * 400}px)`}}>
        <PhoneImg w={240} />
      </div>
    </Stage>
  );
};

const Solution: React.FC<SP> = ({t, a}) => {
  const strike = pt(t, W(36) + 0.15, W(36) + 0.45, ease.inOut);
  const sol = sp(t, W(38) - 0.05, 320, 18);
  const burst = pt(t, W(38) - 0.05, W(38) + 0.6, ease.out);
  return (
    <Stage t={t} cy={960}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', color: C.cream, opacity: lerp(1, 0.35, strike)}}>
          problem
          <div style={{position: 'absolute', left: -20, right: -20, top: '54%', height: 16, background: C.red, transformOrigin: '0 50%', transform: `scaleX(${strike}) rotate(-3deg)`, borderRadius: 8}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 56, color: C.dim, opacity: ap(t, W(37) - 0.05)}}>ka</div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 16}, (_, i) => {
          const ang = (i / 16) * Math.PI * 2;
          const r0 = 120 + burst * 220, r1 = 160 + burst * 360;
          return <line key={i} x1={540 + Math.cos(ang) * r0} y1={1030 + Math.sin(ang) * r0 * 0.6} x2={540 + Math.cos(ang) * r1} y2={1030 + Math.sin(ang) * r1 * 0.6} stroke={C.gold} strokeWidth={4} strokeLinecap="round" opacity={burst > 0 ? 1 - burst : 0} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 210, lineHeight: 1, ...goldText, opacity: m1(sol * 2), transform: `scale(${lerp(1.5, 1, m1(sol))})`}}>solution</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 56, color: C.dim, opacity: ap(t, W(39) - 0.05)}}>hai.</div>
    </Stage>
  );
};

const Link: React.FC<SP> = ({t, a}) => {
  const ph = sp(t, a + 0.02, 200, 20);
  const ref = sp(t, W(49) - 0.05, 300, 18);
  const tap = pt(t, W(52) - 0.1, W(52) + 0.15, ease.out);
  const done = t > W(52) + 0.15;
  return (
    <Stage t={t} cy={900}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', ...goldText, opacity: ap(t, W(45) - 0.05)}}>Delta Exchange</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.cream, opacity: ap(t, W(48) - 0.05)}}>mere link se account kholiye</div>
      <div style={{position: 'absolute', left: 250, top: 420, width: 580, height: 1180, borderRadius: 80, background: '#09090B', padding: 18, boxSizing: 'border-box', boxShadow: `0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e`, transform: `translateY(${(1 - m1(ph)) * 900}px) rotate(${(1 - m1(ph)) * 8}deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 64, background: '#121216', overflow: 'hidden', position: 'relative', padding: '90px 40px', boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', left: '50%', top: 22, width: 150, height: 40, borderRadius: 20, background: '#000', transform: 'translateX(-50%)'}} />
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.dim, letterSpacing: '0.1em'}}>DELTA EXCHANGE</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: '#fff', letterSpacing: '-0.03em', marginTop: 20}}>Create account</div>
          {['Email address', 'Password'].map((f, i) => (
            <div key={f} style={{marginTop: i ? 22 : 40, height: 90, borderRadius: 20, background: '#1D1D23', border: '1.5px solid #2E2E36', display: 'flex', alignItems: 'center', padding: '0 26px', fontFamily: SANS, fontSize: 30, color: '#8a8a94', opacity: ap(t, a + 0.25 + i * 0.1)}}>
              {i ? '••••••••••' : f}
            </div>
          ))}
          <div style={{marginTop: 22, height: 90, borderRadius: 20, background: `rgba(61,220,132,${0.12 * m1(ref)})`, border: `1.5px solid ${ref > 0 ? C.green : '#2E2E36'}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: ref > 0 ? C.green : '#8a8a94'}}>
            {ref > 0 && (
              <div style={{width: 44, height: 44, borderRadius: 44, background: C.green, display: 'grid', placeItems: 'center', transform: `scale(${m1(ref)})`}}>
                <Check size={28} color="#062b16" />
              </div>
            )}
            {ref > 0 ? 'Referral link applied' : 'Referral code'}
          </div>
          <div style={{marginTop: 50, height: 110, borderRadius: 26, background: done ? C.green : GOLD_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: C.ink, transform: `scale(${1 - 0.06 * Math.sin(tap * Math.PI)})`}}>
            {done && <Check size={44} color={C.ink} sw={3.4} />}
            {done ? 'Account opened' : 'Open account'}
          </div>
          {/* finger tap */}
          <div style={{position: 'absolute', left: 300, top: 760, width: 90, height: 90, borderRadius: 90, background: 'rgba(255,255,255,0.35)', border: '3px solid #fff', opacity: tap > 0 && tap < 1 ? 1 - tap : 0, transform: `scale(${lerp(0.6, 1.8, tap)})`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1640, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: 'rgba(247,243,238,0.45)'}}>Trading involves risk. T&amp;C apply.</div>
    </Stage>
  );
};

/** Slot machine: three reels stop on the three prizes. */
const PRIZE = [
  {name: 'iPhone', at: 67, el: <PhoneImg w={190} />},
  {name: 'MacBook', at: 68, el: <Laptop w={190} />},
  {name: 'iPad', at: 70, el: <Tablet w={120} />},
];
const Draw: React.FC<SP> = ({t, a}) => {
  const ticket = sp(t, W(56) - 0.05, 260, 16);
  const win = sp(t, W(63) - 0.05, 320, 14);
  const confetti = pt(t, W(63) - 0.05, W(63) + 1.6, ease.out);
  return (
    <Stage t={t} cy={1000}>
      {/* golden ticket */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 200, height: 250, borderRadius: 26, background: GOLD_GRAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.55)', transform: `rotate(${lerp(-14, -3, m1(ticket))}deg) scale(${lerp(0.5, 1, m1(ticket))})`, opacity: m1(ticket * 2)}}>
        {[0, 1].map((s) => (
          <div key={s} style={{position: 'absolute', top: 100, [s ? 'right' : 'left']: -26, width: 52, height: 52, borderRadius: 52, background: C.bg}} />
        ))}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.4em', color: C.ink}}>DIWALI GIVEAWAY</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.ink, lineHeight: 1}}>Lucky Winner</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 110, letterSpacing: '-0.04em', color: C.cream, opacity: m1(win * 2), transform: `scale(${lerp(1.4, 1, m1(win))})`}}>
        jeet sakte hain
      </div>
      {/* reels */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 730, height: 520, borderRadius: 44, background: 'rgba(6,6,6,0.85)', border: `3px solid ${C.gold}`, display: 'flex', gap: 18, padding: 22, boxSizing: 'border-box', boxShadow: `0 0 80px rgba(255,138,0,0.25)`}}>
        {PRIZE.map((pz, i) => {
          const stop = W(pz.at) - 0.05;
          const spinning = t < stop;
          const land = sp(t, stop, 380, 16);
          const off = spinning ? -(((t - a) * 2400 + i * 300) % (476 * 3)) : (1 - m1(land)) * -80;
          return (
            <div key={pz.name} style={{flex: 1, borderRadius: 26, background: spinning ? 'rgba(247,243,238,0.06)' : 'rgba(255,138,0,0.12)', overflow: 'hidden', position: 'relative', border: `1.5px solid ${spinning ? C.line : C.gold}`}}>
              {i === 2 && spinning && (
                <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
                  <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 260, lineHeight: 1, ...goldText, transform: `scale(${1 + 0.08 * Math.sin(t * 7)}) rotate(${Math.sin(t * 3) * 8}deg)`, filter: 'drop-shadow(0 0 30px rgba(255,138,0,0.6))'}}>?</div>
                </div>
              )}
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${off}px)`, filter: spinning ? 'blur(6px)' : undefined, opacity: i === 2 && spinning ? 0 : 1}}>
                {(spinning ? [0, 1, 2, 3, 4, 5].map((k) => PRIZE[(i + k) % 3]) : [pz]).map((q, k) => (
                  <div key={k} style={{height: 476, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26}}>
                    <div style={{height: 260, display: 'grid', placeItems: 'center'}}>{q.el}</div>
                    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, ...goldText}}>{q.name}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* confetti */}
      {confetti > 0 && confetti < 1 &&
        Array.from({length: 60}, (_, i) => {
          const ang = rand(i * 2.3) * Math.PI * 2;
          const v = 300 + rand(i * 4.1) * 700;
          const x = 540 + Math.cos(ang) * v * confetti;
          const y = 640 + Math.sin(ang) * v * confetti * 0.8 + confetti * confetti * 700;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 26, borderRadius: 3, background: [C.gold, C.cream, '#FFC46B', C.gold2][i % 4], transform: `rotate(${i * 47 + confetti * 720}deg)`, opacity: 1 - confetti}} />;
        })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: 'rgba(247,243,238,0.45)'}}>Winners are picked by lucky draw. T&amp;C apply.</div>
    </Stage>
  );
};

const STEPS = [
  {at: 80, t: 'Mere link se account kholiye', s: 'Delta Exchange'},
  {at: 86, t: 'Trading kariye', s: 'samajhdaari se'},
  {at: 89, t: 'Baaki information', s: 'Instagram highlights mein'},
];
const Steps: React.FC<SP> = ({t, a}) => (
  <Stage t={t} cy={900}>
    <Kicker t={t} at={a}>KARNA KYA HAI?</Kicker>
    <div style={{position: 'absolute', left: 80, top: 290, fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, color: C.cream, lineHeight: 1, opacity: ap(t, a + 0.05, 0.3)}}>
      Bas <span style={goldText}>3 steps.</span>
    </div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 520}}>
      {STEPS.map((s, i) => {
        const p = sp(t, W(s.at) - 0.08, 280, 20);
        const done = t > W(s.at) + 0.6;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, background: done ? 'rgba(255,138,0,0.12)' : 'rgba(6,6,6,0.7)', border: `2px solid ${done ? C.gold : C.line}`, borderRadius: 34, padding: '34px 34px', marginBottom: 30, transform: `translateX(${(1 - m1(p)) * 600}px)`, opacity: m1(p * 2)}}>
            <div style={{width: 110, height: 110, borderRadius: 110, background: done ? GOLD_GRAD : 'transparent', border: `3px solid ${C.gold}`, display: 'grid', placeItems: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: done ? C.ink : C.gold, flexShrink: 0}}>
              {done ? <Check size={60} color={C.ink} sw={3.2} /> : i + 1}
            </div>
            <div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: C.cream, lineHeight: 1.1}}>{s.t}</div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: C.gold, marginTop: 6}}>{s.s}</div>
            </div>
          </div>
        );
      })}
    </div>
    <Bubble t={t} at={a + 0.2} x={790} y={240} d={220} />
  </Stage>
);

const HL = [
  {img: 'hl-community', name: 'community'},
  {img: 'hl-forex', name: 'Forex Expo', uae: true},
  {img: 'hl-deeptalks', name: 'DeeP Talks'},
  {img: 'hl-ytlive', name: 'YT Live Join…'},
];
const Verified: React.FC<{size?: number}> = ({size = 38}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', flexShrink: 0}}>
    <path d="M20 2l4.2 3.1 5.2-.3 1.7 4.9 4.4 2.8-1.2 5.1 2.1 4.8-3.6 3.8-.4 5.2-5.1 1.3-3 4.3-4.9-1.8-4.9 1.8-3-4.3-5.1-1.3-.4-5.2L2.4 22.4l2.1-4.8-1.2-5.1 4.4-2.8 1.7-4.9 5.2.3z" fill="#0095F6" />
    <path d="M13 20.5l4.6 4.6L27.5 15" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UAE: React.FC = () => (
  <span style={{display: 'inline-flex', width: 30, height: 20, marginLeft: 6, verticalAlign: 'middle', borderRadius: 3, overflow: 'hidden'}}>
    <span style={{width: 8, background: '#EF3340'}} />
    <span style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <span style={{flex: 1, background: '#009739'}} />
      <span style={{flex: 1, background: '#fff'}} />
      <span style={{flex: 1, background: '#000'}} />
    </span>
  </span>
);
const Insta: React.FC<SP> = ({t, a}) => {
  const card = sp(t, a + 0.02, 220, 20);
  const handle = 'deepakwadhwa.official';
  const typed = handle.slice(0, Math.max(0, Math.floor((t - W(97) + 0.1) / 0.035)));
  const hl = (i: number) => sp(t, W(104) - 0.05 + i * 0.08, 300, 16);
  const lit = t > W(105) - 0.1 ? Math.min(3, Math.floor((t - W(105) + 0.1) / 0.45)) : -1;
  const stat = (n: string, l: string) => (
    <div style={{textAlign: 'left'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#111', lineHeight: 1.1}}>{n}</div>
      <div style={{fontFamily: SANS, fontSize: 28, color: '#333'}}>{l}</div>
    </div>
  );
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a}>INSTAGRAM PE JAIYE</Kicker>
      <div style={{position: 'absolute', left: 50, right: 50, top: 270, borderRadius: 46, background: '#FFFFFF', padding: '40px 40px 44px', boxShadow: '0 60px 120px rgba(0,0,0,0.6)', transform: `translateY(${(1 - m1(card)) * 900}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#111', letterSpacing: '-0.02em'}}>
            {typed}
            <span style={{opacity: typed.length < handle.length && Math.sin(t * 14) > 0 ? 1 : 0, color: '#0095F6'}}>|</span>
          </span>
          {typed.length >= handle.length && <Verified size={40} />}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <div style={{width: 196, height: 196, borderRadius: 196, padding: 7, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', flexShrink: 0}}>
            <div style={{width: '100%', height: '100%', borderRadius: 196, border: '6px solid #fff', overflow: 'hidden', boxSizing: 'border-box'}}>
              <Img src={staticFile('brand/dw-profile.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#111', marginBottom: 14}}>Deepak Wadhwa</div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              {stat('512', 'posts')}
              {stat('1.4M', 'followers')}
              {stat('47', 'following')}
            </div>
          </div>
        </div>
        <div style={{fontFamily: SANS, fontSize: 28, color: '#111', lineHeight: 1.35, marginTop: 22}}>
          Trader | Mentor | Speaker
          <br />
          Founder TRADERSloop | oldBULL | 12xJoshTalks
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 24}}>
          <div style={{flex: 1, height: 74, borderRadius: 18, background: '#4A5DF9', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>Follow</div>
          <div style={{flex: 1, height: 74, borderRadius: 18, background: '#EFEFEF', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111'}}>Message</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 36}}>
          {HL.map((h, i) => {
            const p = hl(i);
            const on = i === lit;
            return (
              <div key={h.name} style={{width: 220, textAlign: 'center', transform: `scale(${lerp(0.4, on ? 1.1 : 1, m1(p))})`, opacity: m1(p * 2)}}>
                <div style={{width: 160, height: 160, margin: '0 auto', borderRadius: 160, padding: 6, background: on ? 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)' : '#DBDBDB'}}>
                  <div style={{width: '100%', height: '100%', borderRadius: 160, border: '5px solid #fff', boxSizing: 'border-box', overflow: 'hidden'}}>
                    <Img src={staticFile(`brand/${h.img}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                </div>
                <div style={{fontFamily: SANS, fontSize: 26, fontWeight: on ? 800 : 500, color: '#111', marginTop: 12, whiteSpace: 'nowrap'}}>
                  {h.name}
                  {h.uae && <UAE />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...goldText, opacity: ap(t, W(104) - 0.05)}}>Highlights</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.cream, opacity: ap(t, W(107) - 0.05)}}>
        mein saari <span style={goldText}>details</span>
      </div>
    </Stage>
  );
};

const RULES = [
  {at: 118, t: 'Trade kariye', s: ''},
  {at: 120, t: 'Samajhdaari se', s: ''},
  {at: 123, t: 'Paise bachakar', s: ''},
  {at: 128, t: 'Wisely spend', s: ''},
];
const Wise: React.FC<SP> = ({t, a}) => (
  <Stage t={t} cy={1000}>
    <Kicker t={t} at={a}>BAS YAHI KEHNA HAI</Kicker>
    <div style={{position: 'absolute', left: 80, right: 80, top: 320}}>
      {RULES.map((r, i) => {
        const p = sp(t, W(r.at) - 0.08, 300, 20);
        const isNow = i === RULES.reduce((n, q, k) => (t >= W(q.at) - 0.08 ? k : n), 0);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '30px 0', borderBottom: `1.5px solid ${C.line}`, opacity: m1(p * 2) * (isNow ? 1 : 0.55), transform: `translateY(${(1 - m1(p)) * 60}px)`}}>
            <div style={{width: 76, height: 76, borderRadius: 76, background: GOLD_GRAD, display: 'grid', placeItems: 'center', flexShrink: 0}}>
              <Check size={46} color={C.ink} sw={3.2} />
            </div>
            <span style={{fontFamily: i % 2 ? SERIF : SANS, fontStyle: i % 2 ? 'italic' : 'normal', fontWeight: i % 2 ? 400 : 850, fontSize: i % 2 ? 120 : 92, letterSpacing: i % 2 ? '0' : '-0.04em', color: isNow ? C.cream : C.dim, lineHeight: 1}}>
              {i === 3 ? (
                <>
                  <span style={goldText}>Wisely</span> spend
                </>
              ) : (
                r.t
              )}
            </span>
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: SANS, fontSize: 26, color: 'rgba(247,243,238,0.5)', opacity: ap(t, a + 0.3)}}>Trading involves risk. Invest only what you can afford.</div>
    <Bubble t={t} at={a + 0.2} x={440} y={1480} d={200} />
  </Stage>
);

const SCENES: Record<string, React.FC<SP>> = {wallet: Wallet, iphone: IPhone, devices: Devices, solution: Solution, link: Link, draw: Draw, steps: Steps, insta: Insta, wise: Wise};

// ---------------------------------------------------------------- overlays on the speaker
/** Big gold question mark on "Kya?" and the "karna kya hai?" pill. */
const QMARKS = [
  {x: 250, y: 560, s: 200, r: -18, d: 0},
  {x: 760, y: 470, s: 260, r: 14, d: 0.08},
  {x: 140, y: 860, s: 140, r: -8, d: 0.16},
  {x: 880, y: 760, s: 170, r: 20, d: 0.12},
  {x: 520, y: 330, s: 150, r: 4, d: 0.22},
  {x: 360, y: 400, s: 110, r: -24, d: 0.28},
  {x: 930, y: 1020, s: 120, r: 10, d: 0.32},
];
const Question: React.FC<{t: number}> = ({t}) => {
  const zones = [
    {a: W(40) - 0.08, b: W(45) - 0.08},
    {a: W(76) - 0.08, b: W(80) - 0.08},
  ];
  const z = zones.find((q) => t >= q.a && t < q.b);
  if (!z) return null;
  const out = pt(t, z.b - 0.2, z.b, ease.in);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 1 - out}}>
      {QMARKS.map((q, i) => {
        const p = sp(t, z.a + q.d, 380, 12);
        const bob = Math.sin((t - z.a) * 3 + i) * 10;
        return (
          <div key={i} style={{position: 'absolute', left: q.x - q.s * 0.3, top: q.y - q.s * 0.5 + bob, fontFamily: SERIF, fontStyle: 'italic', fontSize: q.s, lineHeight: 1, ...(i % 3 === 1 ? {color: '#fff'} : goldText), transform: `rotate(${q.r + Math.sin(t * 2 + i) * 6}deg) scale(${p})`, filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.6))'}}>?</div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "Ji haan, bilkul sahi suna!": sparkle burst + gold frame pulse. */
const Sahi: React.FC<{t: number}> = ({t}) => {
  const a = W(73) - 0.08;
  if (t < a || t > W(76) - 0.08) return null;
  const burst = pt(t, W(73) - 0.05, W(73) + 1.2, ease.out);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{boxShadow: `inset 0 0 0 ${lerp(30, 12, ap(t, a, 0.4))}px ${C.gold}`, opacity: 0.8 * (1 - pt(t, W(76) - 0.4, W(76) - 0.08))}} />
      {Array.from({length: 30}, (_, i) => {
        const ang = rand(i * 1.7) * Math.PI * 2;
        const v = 200 + rand(i * 3.3) * 500;
        const x = 540 + Math.cos(ang) * v * burst;
        const y = 760 + Math.sin(ang) * v * burst;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 12, height: 12, borderRadius: 12, background: C.gold, boxShadow: `0 0 20px ${C.gold}`, opacity: burst > 0 ? 1 - burst : 0}} />;
      })}
    </AbsoluteFill>
  );
};

/** Diya row along the table + "Happy Diwali" title at the end of the speech. */
const Diya: React.FC<{t: number; x: number; y: number; s?: number; seed: number}> = ({t, x, y, s = 1, seed}) => {
  const fl = 1 + 0.08 * Math.sin(t * 18 + seed) + 0.05 * Math.sin(t * 31 + seed * 2);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 160 * s, height: 140 * s}}>
      <div style={{position: 'absolute', left: 30 * s, top: 60 * s, width: 100 * s, height: 100 * s, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,170,60,0.55), transparent 70%)`, transform: `scale(${fl * 2.4})`}} />
      <div style={{position: 'absolute', left: 64 * s, top: 0, width: 32 * s, height: 70 * s, borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: 'radial-gradient(circle at 50% 75%, #FFF6C8, #FFC23A 45%, #FF7A1A 80%)', transform: `scaleY(${fl}) rotate(${Math.sin(t * 7 + seed) * 4}deg)`, transformOrigin: '50% 100%', boxShadow: '0 0 40px #FF9A2E'}} />
      <div style={{position: 'absolute', left: 0, top: 66 * s, width: 160 * s, height: 70 * s, borderRadius: `0 0 ${80 * s}px ${80 * s}px`, background: 'linear-gradient(180deg,#C5602A,#7A2A10)', boxShadow: 'inset 0 6px 0 rgba(255,200,120,0.5)'}} />
    </div>
  );
};

const Finale: React.FC<{t: number}> = ({t}) => {
  const a = W(131) - 0.1;
  if (t < a) return null;
  const p = sp(t, W(131) - 0.05, 200, 18);
  const d = sp(t, W(132) - 0.08, 260, 16);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,6,6,0.55), transparent 35%, transparent 70%, rgba(6,6,6,0.7))', opacity: ap(t, a, 0.4)}} />
      <Sparks t={t} n={40} o={ap(t, a, 0.5)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * -60}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 80, letterSpacing: '0.2em', paddingLeft: '0.2em', color: C.cream}}>HAPPY</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 240, lineHeight: 1, ...goldText, opacity: m1(d * 2), transform: `scale(${lerp(1.4, 1, m1(d))})`, filter: 'drop-shadow(0 10px 40px rgba(255,138,0,0.5))'}}>Diwali</div>
      {[0, 1, 2, 3, 4].map((i) => {
        const q = sp(t, a + 0.1 + i * 0.08, 240, 18);
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - m1(q)) * 300}px)`, opacity: m1(q * 2)}}>
            <Diya t={t} x={40 + i * 205} y={1620 + (i % 2) * 30} s={0.9} seed={i * 1.3} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.2) return null;
  const r = t - a;
  const k = pt(t, a - 0.2, a + 0.1);
  return (
    <AbsoluteFill style={{opacity: k}}>
      <Stage t={t} cy={820}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: '0.24em', paddingLeft: '0.24em', color: C.cream, opacity: pt(r, 0, 0.4)}}>HAPPY</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 220, lineHeight: 1, ...goldText}}>Diwali</div>
        <div style={{position: 'absolute', left: 90, right: 90, top: 820, borderRadius: 34, border: `2px solid ${C.gold}`, background: 'rgba(6,6,6,0.7)', padding: '34px 40px', textAlign: 'center', opacity: pt(r, 0.3, 0.7), transform: `translateY(${(1 - pt(r, 0.3, 0.8, ease.out)) * 40}px)`}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.cream, lineHeight: 1.2}}>Delta Exchange account</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, color: C.gold}}>mere link se kholiye</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1100, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.6, 1.0)}}>
          <div style={{background: GOLD_GRAD, borderRadius: 999, padding: '20px 44px', fontFamily: SANS, fontWeight: 850, fontSize: 44, color: C.ink, letterSpacing: '-0.01em'}}>@deepakwadhwa.official</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.dim, opacity: pt(r, 0.9, 1.3)}}>details in highlights</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1760, textAlign: 'center', fontFamily: SANS, fontSize: 22, color: 'rgba(247,243,238,0.45)'}}>Trading involves risk. T&amp;C apply.</div>
        {[0, 1, 2, 3, 4].map((i) => (
          <Diya key={i} t={t} x={40 + i * 205} y={1470 + (i % 2) * 30} s={0.9} seed={i * 1.3} />
        ))}
      </Stage>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const S = s ? SCENES[s.id] : null;
  const e = s ? pt(t, s.a, s.a + 0.22, ease.out) : 1;
  const prev = s ? FF.find((g) => Math.abs(g.b - s.a) < 0.02) : undefined;
  const x = s ? pt(t, s.b - 0.1, s.b, ease.in) : 0;
  const toFace = s ? !FF.some((g) => Math.abs(g.a - s.b) < 0.02) : false;
  const flash = Math.max(0, ...FF.map((f) => 1 - Math.min(1, Math.abs(t - f.a) / 0.05)), ...RETURNS.map((r) => 1 - Math.min(1, Math.abs(t - r) / 0.05)));
  const P = prev ? SCENES[prev.id] : null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>
        <Speaker t={t} />
        <Grade />
        <Sparks t={t} n={14} o={0.55} />
      </AbsoluteFill>
      {!s && t < edit.speech && (
        <>
          <Question t={t} />
          <Sahi t={t} />
          <Finale t={t} />
          {t < W(131) - 0.1 && <Captions t={t} />}
        </>
      )}
      {P && prev && s && (
        <AbsoluteFill style={{transform: `translateX(${-e * 0.35 * 1080 * s.dir}px)`, opacity: 1 - e * 0.6}}>
          <P t={t} a={prev.a} b={prev.b} />
        </AbsoluteFill>
      )}
      {S && s && (
        <AbsoluteFill
          style={{
            transform: `translateX(${(1 - e) * 1080 * s.dir}px) skewX(${(1 - e) * -10 * s.dir}deg) scale(${toFace ? 1 + x * 0.25 : 1})`,
            filter: e < 1 ? `blur(${(1 - e) * 24}px)` : x > 0 && toFace ? `blur(${x * 16}px)` : undefined,
            opacity: toFace ? 1 - x : 1,
          }}
        >
          <S t={t} a={s.a} b={s.b} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: C.gold, opacity: flash * 0.3, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
    </AbsoluteFill>
  );
};
