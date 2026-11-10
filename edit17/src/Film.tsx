import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine for architects & interior designers: WhatsApp automation that replies, qualifies, shares the portfolio and books site visits. Premium cut: every scene lives in a 3D space with a slow
// camera, scenes open out of the element the eye is on, and the UI is *operated* (touches, keys, banners), not just shown.
const C = {
  bg: '#050506',
  panel: '#121214',
  lime: '#C8FF3E',
  cream: '#F3F1EC',
  ink: '#0A0A0A',
  dim: 'rgba(243,241,236,0.58)',
  faint: 'rgba(243,241,236,0.12)',
  red: '#FF453A',
  wa: '#25D366',
  waBg: '#0B141A',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const LIME_GRAD = 'linear-gradient(180deg, #F0FFB0 0%, #C8FF3E 45%, #8FD61A 100%)';
const RED_GRAD = 'linear-gradient(180deg, #FF8A80 0%, #FF453A 50%, #C9160E 100%)';
const SILVER_GRAD = 'linear-gradient(180deg, #FFFFFF 0%, #D9D9DE 50%, #9A9AA2 100%)';
const limeText: React.CSSProperties = {background: LIME_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const redText: React.CSSProperties = {background: RED_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const silverText: React.CSSProperties = {background: SILVER_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

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
const OFF = 20; // words of the new opening; every later scene keeps its own numbering
const WI = (i: number) => WORDS[i].s;
const W = (i: number) => WORDS[i + OFF].s;
const sp = (t: number, at: number, stiffness = 260, damping = 22) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.8}}));
const ap = (t: number, at: number, d = 0.3) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (w: string) => w.replace(/["“”…]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const lin = (x: number) => x;

// ---------------------------------------------------------------- scenes on the voice
const SC: Record<string, [number, number, number, number]> = {
  // [start, end, focal x, focal y] — the next scene opens out of the focal point
  intro: [0, W(0) - 0.15, 540, 760],
  hook: [W(0) - 0.15, W(12) - 0.15, 540, 1460],
  why: [W(12) - 0.15, W(22) - 0.15, 540, 1360],
  spam: [W(22) - 0.15, W(41) - 0.15, 540, 1460],
  truth: [W(41) - 0.15, W(53) - 0.15, 540, 1180],
  qualify: [W(53) - 0.15, W(76) - 0.15, 540, 1100],
  portfolio: [W(76) - 0.15, W(95) - 0.15, 540, 1000],
  focus: [W(95) - 0.15, W(105) - 0.15, 540, 1440],
  cta: [W(105) - 0.15, edit.speech + 0.1, 540, 960],
};
const ORDER = ['intro', 'hook', 'why', 'spam', 'truth', 'qualify', 'portfolio', 'focus', 'cta'];
const nextFocal = (id: string) => {
  const i = ORDER.indexOf(id);
  const nx = SC[ORDER[i + 1]];
  return nx ? [nx[2], nx[3]] : [540, 960];
};

/** A scene: opens as an expanding iris from its focal point, lives under a slow camera push, sinks back when covered. */
const Shot: React.FC<{t: number; id: string; children: React.ReactNode}> = ({t, id, children}) => {
  const [a, b, fx, fy] = SC[id];
  if (t < a - 0.02 || t > b + 0.55) return null;
  const first = a === 0;
  const e = first ? 1 : pt(t, a, a + 0.55, ease.inOut);
  const x = pt(t, b, b + 0.55, ease.inOut);
  const life = m1((t - a) / Math.max(1, b - a));
  const push = 1 + 0.045 * life;
  const [nx, ny] = nextFocal(id);
  return (
    <>
      <AbsoluteFill style={{clipPath: first || e >= 1 ? undefined : `circle(${lerp(0, 1700, e)}px at ${fx}px ${fy}px)`}}>
        <AbsoluteFill style={{transformOrigin: `${nx}px ${ny}px`, transform: `scale(${lerp(1.18, 1, e) * push * (1 + 0.35 * x)})`, filter: x > 0.01 ? `blur(${x * 10}px) brightness(${1 - 0.55 * x})` : undefined}}>
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
      {!first && e > 0 && e < 1 && (
        <div style={{position: 'absolute', left: fx - lerp(0, 1700, e), top: fy - lerp(0, 1700, e), width: lerp(0, 3400, e), height: lerp(0, 3400, e), borderRadius: 9999, border: '3px solid rgba(200,255,62,0.85)', boxShadow: '0 0 40px rgba(200,255,62,0.55), inset 0 0 40px rgba(200,255,62,0.35)', opacity: 1 - e, pointerEvents: 'none'}} />
      )}
    </>
  );
};

/** 3D stage: perspective + slow orbit so flat UI reads as objects in space. */
const Space: React.FC<{t: number; rx?: number; ry?: number; amp?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, rx = 6, ry = -10, amp = 1, children, style}) => (
  <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 45%', ...style}}>
    <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx + Math.sin(t * 0.55) * 1.6 * amp}deg) rotateY(${ry + Math.sin(t * 0.4 + 1) * 2.2 * amp}deg)`}}>{children}</div>
  </div>
);

// ---------------------------------------------------------------- backdrop: deep black, two slow light pools, fine grid with parallax
const Backdrop: React.FC<{t: number; red?: number; hue?: string}> = ({t, red = 0, hue = '200,255,62'}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <div style={{position: 'absolute', left: -300 + Math.sin(t * 0.21) * 120, top: 120 + Math.cos(t * 0.17) * 90, width: 1100, height: 1100, borderRadius: 1100, background: `radial-gradient(circle, rgba(${hue},0.16), transparent 62%)`}} />
    <div style={{position: 'absolute', left: 320 + Math.cos(t * 0.19) * 140, top: 900 + Math.sin(t * 0.23) * 120, width: 1000, height: 1000, borderRadius: 1000, background: 'radial-gradient(circle, rgba(120,140,255,0.08), transparent 62%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 40%, rgba(255,40,30,0.32), transparent 70%)', opacity: red}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '90px 90px', backgroundPosition: `${t * -6}px ${t * 10}px`, maskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%, #000 20%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 45%, #000 20%, transparent 78%)'}} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- type: masked line reveals (words rise from behind a mask)
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number; style?: React.CSSProperties}> = ({t, at, children, d = 0.55, style}) => {
  const p = pt(t, at, at + d, ease.out);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 4}deg)`, transformOrigin: '0 100%'}}>{children}</span>
    </span>
  );
};
const Words: React.FC<{t: number; at: number; text: string; gap?: number; stagger?: number; style?: React.CSSProperties; wordStyle?: (w: string, i: number) => React.CSSProperties}> = ({t, at, text, gap = 0.28, stagger = 0.06, style, wordStyle}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: `${gap}em`, ...style}}>
    {text.split(' ').map((w, i) => (
      <Rise key={i} t={t} at={at + i * stagger}>
        <span style={wordStyle?.(w, i)}>{w}</span>
      </Rise>
    ))}
  </div>
);
const Eyebrow: React.FC<{t: number; at: number; children: string; red?: boolean; top?: number}> = ({t, at, children, red, top = 170}) => {
  const p = ap(t, at, 0.5);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: p}}>
      <div style={{width: 60 * p, height: 2, background: red ? C.red : C.lime}} />
      <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: `${0.5 - 0.2 * p}em`, color: red ? C.red : C.lime}}>{children}</span>
      <div style={{width: 60 * p, height: 2, background: red ? C.red : C.lime}} />
    </div>
  );
};

// ---------------------------------------------------------------- devices + UI
/** Phone body with glass glare that sweeps across. */
const Phone: React.FC<{t: number; x: number; y: number; w: number; h: number; bg?: string; children: React.ReactNode; style?: React.CSSProperties; glareAt?: number}> = ({t, x, y, w, h, bg = '#0E0E10', children, style, glareAt = 0}) => {
  const g = ((t - glareAt) * 0.35) % 1.6;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 74, padding: 13, boxSizing: 'border-box', background: 'linear-gradient(145deg, #3a3a40, #121214 40%, #2a2a30)', boxShadow: '0 80px 140px rgba(0,0,0,0.75), 0 0 0 1.5px rgba(255,255,255,0.08) inset', ...style}}>
      <div style={{width: '100%', height: '100%', borderRadius: 62, background: bg, overflow: 'hidden', position: 'relative'}}>
        {children}
        <div style={{position: 'absolute', left: '50%', top: 18, width: 150, height: 40, marginLeft: -75, borderRadius: 40, background: '#000'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${g * 100 - 30}%, rgba(255,255,255,0.10) ${g * 100 - 12}%, transparent ${g * 100}%)`, pointerEvents: 'none'}} />
      </div>
    </div>
  );
};
/** A touch: soft white dot that travels between taps; each tap compresses and throws a ripple. */
type Tap = {at: number; x: number; y: number};
const Touch: React.FC<{t: number; taps: Tap[]; show: [number, number]}> = ({t, taps, show}) => {
  if (t < show[0] || t > show[1] || !taps.length) return null;
  const i = taps.reduce((n, p, k) => (t >= p.at - 0.25 ? k : n), 0);
  const cur = taps[i];
  const prev = taps[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : pt(t, cur.at - 0.25, cur.at - 0.02, ease.inOut);
  const x = lerp(prev.x, cur.x, k), y = lerp(prev.y, cur.y, k);
  const press = t >= cur.at - 0.03 && t < cur.at + 0.12 ? 0.78 : 1;
  const r = pt(t, cur.at, cur.at + 0.45, ease.out);
  const v = ap(t, show[0], 0.2) * (1 - pt(t, show[1] - 0.2, show[1]));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v, pointerEvents: 'none'}}>
      {t >= cur.at && r < 1 && <div style={{position: 'absolute', left: cur.x - 40 - r * 50, top: cur.y - 40 - r * 50, width: 80 + r * 100, height: 80 + r * 100, borderRadius: 999, border: '3px solid rgba(255,255,255,0.8)', opacity: 1 - r}} />}
      <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 68, background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(255,255,255,0.9)', transform: `scale(${press})`, boxShadow: '0 8px 30px rgba(0,0,0,0.4)'}} />
    </div>
  );
};
/** iOS-style banner. */
const Banner: React.FC<{t: number; at: number; icon: React.ReactNode; title: string; body: string; time?: string; x?: number; y?: number; w?: number; tone?: string}> = ({t, at, icon: ic, title, body, time = 'now', x = 60, y = 70, w = 960, tone = 'rgba(40,40,46,0.94)'}) => {
  const p = sp(t, at, 300, 24);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 40, background: tone, boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset', padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, transform: `translateY(${(1 - m1(p)) * -220}px) scale(${lerp(0.92, 1, m1(p))})`, opacity: m1(p * 2)}}>
      {ic}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>{title}</span>
          <span style={{fontFamily: SANS, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}>{time}</span>
        </div>
        <div style={{fontFamily: SANS, fontSize: 26, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{body}</div>
      </div>
    </div>
  );
};
const AppIcon: React.FC<{bg: string; children: React.ReactNode; size?: number}> = ({bg, children, size = 76}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0}}>{children}</div>
);
const Receiver: React.FC<{size?: number; color?: string; rot?: number}> = ({size = 44, color = '#fff', rot = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${rot}deg)`}}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill={color} />
  </svg>
);
const InstaMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
      <rect x={2.5} y={2.5} width={19} height={19} rx={5.5} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={12} cy={12} r={4.4} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={17.6} cy={6.4} r={1.3} fill="#fff" />
    </svg>
  </div>
);
const Avatar: React.FC<{i: number; size: number; style?: React.CSSProperties}> = ({i, size, style}) => {
  const P = ['man.png', 'woman.png', 'person.png', 'man_beard.png', 'woman_curly_hair.png'];
  return (
    <div style={{width: size, height: size, borderRadius: size, background: 'linear-gradient(160deg, #2a2a30, #151518)', display: 'grid', placeItems: 'center', flexShrink: 0, ...style}}>
      <Img src={icon(P[i % 5])} style={{width: size * 0.74, height: size * 0.74}} />
    </div>
  );
};
const Wave: React.FC<{t: number; n?: number; h?: number; color?: string; on?: boolean}> = ({t, n = 28, h = 70, color = C.lime, on = true}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, height: h}}>
    {Array.from({length: n}, (_, i) => {
      const v = on ? 0.2 + 0.8 * Math.abs(Math.sin(t * 9 + i * 0.7) * Math.sin(t * 3.3 + i * 0.31)) : 0.12;
      return <div key={i} style={{width: 7, height: h * v, borderRadius: 4, background: color, opacity: 0.85}} />;
    })}
  </div>
);
const Rings: React.FC<{t: number; x: number; y: number; color?: string}> = ({t, x, y, color = C.wa}) => (
  <>
    {[0, 1, 2].map((i) => {
      const u = (t * 1.2 + i / 3) % 1;
      return <div key={i} style={{position: 'absolute', left: x - 70 - u * 130, top: y - 70 - u * 130, width: 140 + u * 260, height: 140 + u * 260, borderRadius: 999, border: `3px solid ${color}`, opacity: (1 - u) * 0.6}} />;
    })}
  </>
);
const Stamp: React.FC<{t: number; at: number; text: string; size?: number; y: number}> = ({t, at, text, size = 120, y}) => {
  const p = sp(t, at, 520, 20);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: `rotate(-6deg) scale(${lerp(2.2, 1, m1(p))})`, opacity: m1(p * 3)}}>
      <div style={{border: `${size * 0.1}px solid ${C.red}`, borderRadius: size * 0.22, padding: `${size * 0.04}px ${size * 0.3}px`, fontFamily: SANS, fontWeight: 900, fontSize: size, color: C.red, letterSpacing: '0.02em', background: 'rgba(30,0,0,0.55)', boxShadow: '0 0 90px rgba(255,69,58,0.45)', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};
/** Shake for impacts. */
const shakeAt = (t: number, hits: number[], amp = 14) => hits.reduce((s, h) => (t >= h && t < h + 0.32 ? s + Math.sin((t - h) * 110) * amp * (1 - (t - h) / 0.32) : s), 0);

const Bubble: React.FC<{t: number; at: number; me?: boolean; children: React.ReactNode; tick?: boolean}> = ({t, at, me, children, tick}) => {
  const p = sp(t, at, 320, 22);
  if (p <= 0) return null;
  return (
    <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 14, opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * 30}px) scale(${lerp(0.85, 1, m1(p))})`, transformOrigin: me ? '100% 100%' : '0 100%'}}>
      <div style={{maxWidth: 600, background: me ? '#005C4B' : '#202C33', color: '#E9EDEF', fontFamily: SANS, fontSize: 36, lineHeight: 1.3, padding: '18px 22px', borderRadius: 26}}>
        {children}
        {tick && <span style={{fontSize: 22, color: '#53BDEB', marginLeft: 12}}>✓✓</span>}
      </div>
    </div>
  );
};
const Typing: React.FC<{t: number; me?: boolean}> = ({t, me}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 14}}>
    <div style={{display: 'flex', gap: 8, background: me ? '#005C4B' : '#202C33', padding: '20px 24px', borderRadius: 24}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 14, height: 14, borderRadius: 14, background: 'rgba(255,255,255,0.7)', transform: `translateY(${Math.sin(t * 12 - i * 0.9) * 5}px)`}} />
      ))}
    </div>
  </div>
);
// ---------------------------------------------------------------- blueprint floor plans that draw themselves
type PlanDef = {walls: string; doors: string; furn: [number, number, number, number][]};
const PLANS: PlanDef[] = [
  {walls: 'M6 6 H94 V94 H6 Z M6 48 H42 M42 6 V30 M42 40 V72 M42 72 H6 M60 48 H94 M60 48 V94', doors: 'M42 30 A10 10 0 0 1 52 40 M60 60 A10 10 0 0 0 70 48', furn: [[12, 12, 22, 14], [12, 56, 20, 10], [66, 12, 22, 26], [66, 60, 20, 14], [48, 76, 8, 12]]},
  {walls: 'M6 6 H94 V94 H6 Z M6 38 H58 M58 6 V60 M58 60 H94 M30 38 V94 M30 70 H6', doors: 'M58 46 A10 10 0 0 1 68 60 M30 52 A10 10 0 0 0 40 38', furn: [[12, 12, 30, 16], [64, 12, 24, 30], [40, 70, 40, 16], [10, 76, 14, 12]]},
  {walls: 'M6 6 H94 V94 H6 Z M50 6 V94 M6 50 H50 M50 34 H94 M50 70 H94', doors: 'M50 20 A10 10 0 0 0 40 30 M50 52 A10 10 0 0 1 60 62', furn: [[12, 12, 30, 22], [12, 60, 30, 26], [58, 12, 30, 16], [58, 42, 28, 20], [58, 78, 26, 10]]},
  {walls: 'M6 6 H94 V94 H6 Z M6 30 H70 M70 6 V30 M36 30 V94 M36 64 H94 M70 64 V94', doors: 'M70 18 A10 10 0 0 1 80 30 M36 44 A10 10 0 0 0 46 30', furn: [[10, 10, 50, 14], [42, 38, 46, 20], [10, 40, 20, 40], [42, 72, 22, 16], [76, 72, 14, 16]]},
];
const Plan: React.FC<{p: number; v?: number; size: number; color?: string; sw?: number; style?: React.CSSProperties}> = ({p, v = 0, size, color = C.lime, sw = 1.1, style}) => {
  const d = PLANS[v % PLANS.length];
  const f = m1((p - 0.55) / 0.45);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', ...style}}>
      <defs>
        <pattern id={`grid${v}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0 H0 V5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#grid${v})`} />
      <path d={d.walls} fill="none" stroke={color} strokeWidth={sw * 1.6} strokeLinecap="square" pathLength={1} strokeDasharray={`${m1(p / 0.6)} 1`} style={{filter: `drop-shadow(0 0 1.5px ${color})`}} />
      <path d={d.doors} fill="none" stroke={color} strokeWidth={sw * 0.6} strokeDasharray="1.2 1" opacity={m1((p - 0.45) / 0.2)} />
      {d.furn.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w * f} height={h} rx={1.2} fill="none" stroke="rgba(243,241,236,0.7)" strokeWidth={sw * 0.5} opacity={f} />
      ))}
      <path d="M6 99 H94 M6 97 V100 M94 97 V100" stroke="rgba(243,241,236,0.45)" strokeWidth="0.4" opacity={f} />
    </svg>
  );
};
const PROJECTS = [
  {n: 'Villa · Lonavala', v: 1},
  {n: '3BHK · Baner, Pune', v: 0},
  {n: 'Office · BKC', v: 2},
  {n: 'Penthouse · Worli', v: 3},
];

// ---------------------------------------------------------------- 0. INTRO — "If we ran marketing + automation for your architecture / interiors business…"
const Intro: React.FC<{t: number}> = ({t}) => {
  const card = (at: number, n: string, label: string, x: number, rot: number) => {
    const p = sp(t, at, 240, 20);
    return (
      <div style={{position: 'absolute', left: x, top: 560, width: 420, height: 300, borderRadius: 40, background: 'linear-gradient(165deg, #1c1c21, #0f0f12)', boxShadow: '0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07) inset', padding: 32, boxSizing: 'border-box', transform: `translateY(${(1 - m1(p)) * 260}px) rotateY(${rot}deg) rotateZ(${(1 - m1(p)) * rot}deg)`, opacity: m1(p * 2), overflow: 'hidden'}}>
        <div style={{position: 'absolute', right: -40, bottom: -50, opacity: 0.4}}>
          <Plan p={pt(t, at, at + 1.6)} v={label === 'Architect' ? 2 : 1} size={300} sw={1.2} color={label === 'Architect' ? C.lime : C.cream} />
        </div>
        <Img src={icon(n)} style={{width: 120, height: 120}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.cream, marginTop: 24, letterSpacing: '-0.03em', position: 'relative'}}>{label}</div>
      </div>
    );
  };
  const chip = (at: number, label: string, icons: React.ReactNode, x: number, lime: boolean) => {
    const p = sp(t, at, 300, 18);
    return (
      <div style={{position: 'absolute', left: x, top: 1010, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 30px', borderRadius: 999, background: lime ? 'rgba(200,255,62,0.12)' : 'rgba(255,255,255,0.06)', border: `2px solid ${lime ? C.lime : 'rgba(255,255,255,0.2)'}`, boxShadow: lime ? '0 0 40px rgba(200,255,62,0.25)' : 'none', transform: `scale(${lerp(0.6, 1, m1(p))}) translateY(${(1 - m1(p)) * 60}px)`, opacity: m1(p * 2)}}>
        {icons}
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, ...(lime ? limeText : {color: C.cream})}}>{label}</span>
      </div>
    );
  };
  const sam = sp(t, WI(12) - 0.08, 260, 18);
  const dive = pt(t, WI(16), SC.intro[1], ease.in);
  return (
    <Shot t={t} id="intro">
      <Backdrop t={t} />
      {/* faint blueprint drawing itself across the whole frame */}
      <div style={{position: 'absolute', left: -120, top: 380, opacity: 0.06}}>
        <Plan p={pt(t, 0, 6)} v={3} size={1320} sw={0.6} color={C.cream} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 190, textAlign: 'center'}}>
        <Words t={t} at={WI(0) - 0.05} text="Agar hum aapke" stagger={0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '-0.045em', color: C.cream}} />
        <Words t={t} at={WI(7) - 0.08} text="business ki" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 90, color: C.dim, marginTop: 6}} />
      </div>
      <div style={{perspective: 1600}}>
        {card(WI(3) - 0.1, 'triangular_ruler.png', 'Architect', 90, 8)}
        {card(WI(5) - 0.1, 'house.png', 'Interior Designer', 570, -8)}
      </div>
      {chip(WI(9) - 0.08, 'Marketing', <><InstaMark size={52} /><Img src={icon('meta-icon.svg')} style={{width: 54, height: 54}} /></>, 50, false)}
      <div style={{position: 'absolute', left: 478, top: 1018, fontFamily: SANS, fontWeight: 300, fontSize: 90, color: C.lime, opacity: ap(t, WI(10) - 0.05), lineHeight: 1}}>+</div>
      {chip(WI(11) - 0.08, 'Automation', <><Img src={icon('whatsapp-icon.svg')} style={{width: 54, height: 54}} /><Img src={icon('robot.png')} style={{width: 54, height: 54}} /></>, 548, true)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: m1(sam * 2), transform: `translateY(${(1 - m1(sam)) * 50}px)`}}>
        <Img src={staticFile('brand/nx-logo.png')} style={{width: 120, height: 87, filter: 'drop-shadow(0 0 30px rgba(200,255,62,0.5))'}} />
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, ...limeText}}>sambhaalte…</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', transform: `scale(${1 + dive * 0.3})`, opacity: 1 - dive}}>
        <Words t={t} at={WI(13) - 0.05} text="toh sabse pehle" stagger={0.07} style={{fontFamily: SANS, fontWeight: 700, fontSize: 58, color: C.dim}} />
        <Words t={t} at={WI(16) - 0.05} text="yeh problem solve karte:" stagger={0.07} style={{fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: '-0.035em', color: C.cream}} wordStyle={(w) => (w === 'problem' ? redText : {})} />
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 1. HOOK — client saw your portfolio, hired someone else
const Hook: React.FC<{t: number}> = ({t}) => {
  const h0 = SC.hook[0];
  const lost = W(5) - 0.1;
  const red = pt(t, lost, lost + 0.5, ease.inOut);
  const sh = shakeAt(t, [W(6) - 0.03], 12);
  return (
    <Shot t={t} id="hook">
      <Backdrop t={t} red={red} hue={red > 0.5 ? '255,69,58' : '200,255,62'} />
      <AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.4}px)`}}>
        <div style={{opacity: lerp(1, 0.4, red), filter: red > 0.05 ? `grayscale(${red}) blur(${red * 3}px)` : undefined}}>
          <Space t={t} rx={9} ry={-12}>
            <Phone t={t} x={160} y={150} w={760} h={1480} bg="#0B0B0D" glareAt={h0 + 0.3}>
              <div style={{padding: '86px 30px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                  <div style={{width: 130, height: 130, borderRadius: 130, padding: 5, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)'}}>
                    <div style={{width: '100%', height: '100%', borderRadius: 130, background: '#0B0B0D', display: 'grid', placeItems: 'center', border: '4px solid #0B0B0D', boxSizing: 'border-box'}}>
                      <Plan p={1} v={2} size={86} sw={2} />
                    </div>
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff'}}>studio.aakaar</div>
                    <div style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255,255,255,0.6)'}}>Architecture & Interiors · Pune</div>
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 30}}>
                  {Array.from({length: 12}, (_, i) => {
                    const p = pt(t, h0 + 0.2 + i * 0.09, h0 + 1.0 + i * 0.09, ease.out);
                    return (
                      <div key={i} style={{aspectRatio: '1 / 1.25', background: '#111114', display: 'grid', placeItems: 'center', opacity: m1(p * 3), transform: `scale(${lerp(0.9, 1, p)})`}}>
                        <Plan p={p} v={i} size={200} sw={1.4} color={i % 3 === 1 ? C.cream : C.lime} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Phone>
          </Space>
        </div>
        {/* the client was here */}
        <div style={{position: 'absolute', left: 120, top: 1430, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 999, background: 'rgba(30,30,34,0.95)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: ap(t, W(2) - 0.1) * (1 - red)}}>
          <Avatar i={2} size={56} />
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff'}}>Rahul viewed 9 projects</span>
          <span style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>· now</span>
        </div>
        <Banner t={t} at={lost} y={110} icon={<Img src={icon('whatsapp-icon.svg')} style={{width: 76, height: 76}} />} title="Rahul" body="Thanks, we've finalised another designer 🙏" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', opacity: red}}>
          <Words t={t} at={W(6) - 0.05} text="hire kisi aur" stagger={0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 132, letterSpacing: '-0.05em'}} wordStyle={() => redText} />
          <Words t={t} at={W(9) - 0.05} text="ko kar liya." stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: C.cream}} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
};

// ---------------------------------------------------------------- 2. WHY — you were on site; the reply went at night
const Why: React.FC<{t: number}> = ({t}) => {
  const night = pt(t, W(18) - 0.2, W(21), ease.inOut);
  const hours = lerp(14 + 14 / 60, 22 + 48 / 60, night);
  const hh = Math.floor(hours), mm = Math.floor((hours - hh) * 60);
  const vib = t > W(15) && t < W(18) ? Math.sin(t * 80) * 5 : 0;
  return (
    <Shot t={t} id="why">
      <Backdrop t={t} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #060a1c, #0a0f2c 60%, #050506)', opacity: night * 0.85}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <Words t={t} at={W(12) - 0.08} text="Kyun?" stagger={0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, color: C.cream}} />
      </div>
      <Space t={t} rx={6} ry={8} amp={0.7}>
        <div style={{position: 'absolute', left: 110, top: 470, width: 860, height: 560, borderRadius: 50, background: 'linear-gradient(170deg, #1b1b1f, #0f0f11)', boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset', overflow: 'hidden', transform: `translateY(${(1 - m1(sp(t, W(13) - 0.15, 220, 22))) * 300}px)`}}>
          <div style={{position: 'absolute', right: -40, bottom: -40, opacity: 0.35}}>
            <Plan p={pt(t, W(13), W(17) + 0.5)} v={3} size={520} sw={1.2} color={C.cream} />
          </div>
          <div style={{position: 'absolute', left: 50, top: 50, display: 'flex', gap: 20, alignItems: 'center'}}>
            <Img src={icon('building_construction.png')} style={{width: 150, height: 150}} />
            <Img src={icon('construction_worker.png')} style={{width: 130, height: 130}} />
          </div>
          <div style={{position: 'absolute', left: 50, top: 250, fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.cream, letterSpacing: '-0.03em'}}>Site visit</div>
          <div style={{position: 'absolute', left: 50, top: 330, fontFamily: SANS, fontSize: 30, color: C.dim}}>Baner project · slab inspection</div>
          {/* the clock */}
          <div style={{position: 'absolute', right: 50, top: 50, textAlign: 'right'}}>
            <div style={{fontFamily: SANS, fontWeight: 200, fontSize: 96, color: night > 0.5 ? '#9FB4FF' : '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em'}}>{`${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`}</div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.dim}}>{hh >= 12 ? 'PM' : 'AM'}</div>
          </div>
        </div>
      </Space>
      {/* the message waiting in his pocket */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 1120, transform: `translateX(${vib}px)`}}>
        <Banner t={t} at={W(15) - 0.1} x={0} y={0} w={840} icon={<Img src={icon('whatsapp-icon.svg')} style={{width: 76, height: 76}} />} title="New enquiry" body="Sir, interior ke liye baat karni thi…" time={night > 0.5 ? '8h ago' : 'now'} />
      </div>
      {night > 0.4 && (
        <div style={{position: 'absolute', left: 120, right: 120, top: 1290, display: 'flex', justifyContent: 'flex-end', opacity: ap(t, W(19) - 0.1)}}>
          <div style={{background: '#005C4B', color: '#E9EDEF', fontFamily: SANS, fontSize: 32, padding: '18px 22px', borderRadius: 24, borderTopRightRadius: 6, maxWidth: 640}}>
            Sorry, site pe tha. Kal baat karein?
            <div style={{fontSize: 20, color: '#FF8A80', textAlign: 'right', marginTop: 6, fontWeight: 800}}>10:48 PM · seen, no reply</div>
          </div>
        </div>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 3. SPAM — "Sir, 2BHK ka kitna lagega?" and half of them vanish
const ASKS = ['Sir, 2BHK ka kitna lagega?', 'Rate per sq ft kya hai?', 'Sir price batao 2BHK ka', 'Kitna kharcha aayega interior ka?', 'Modular kitchen ka rate?', '3BHK full interior price?', 'Budget kitna rakhna padega?'];
const Spam: React.FC<{t: number}> = ({t}) => {
  const n = Math.max(0, Math.min(ASKS.length, Math.floor((t - W(29) + 0.2) / 0.22) + 1));
  const ghost = pt(t, W(34) - 0.1, W(40) + 0.2, ease.inOut);
  return (
    <Shot t={t} id="spam">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}>
        <Words t={t} at={W(22) - 0.1} text="har doosra message…" stagger={0.07} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.dim}} />
      </div>
      <Space t={t} rx={6} ry={-8} amp={0.7}>
        <div style={{position: 'absolute', left: 110, right: 110, top: 360}}>
          {ASKS.slice(0, n).map((q, i) => {
            const p = sp(t, W(29) - 0.2 + i * 0.22, 320, 22);
            const gone = i % 2 === 1 ? m1(ghost * 1.6 - (i / ASKS.length) * 0.4) : 0;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', marginBottom: 14, borderRadius: 30, background: 'rgba(32,44,51,0.96)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: m1(p * 2) * (1 - gone * 0.85), transform: `translateY(${(1 - m1(p)) * 60}px) translateX(${gone * (i % 4 === 1 ? -120 : 120)}px) scale(${1 - gone * 0.1})`, filter: gone > 0.05 ? `blur(${gone * 6}px)` : undefined}}>
                <Avatar i={i} size={70} />
                <div style={{flex: 1}}>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#8696A0'}}>{['Amit', 'Sneha', 'Kunal', 'Priya', 'Rohan', 'Neha', 'Vikram'][i]} · {i + 1}m</div>
                  <div style={{fontFamily: SANS, fontSize: 34, color: '#E9EDEF'}}>{q}</div>
                </div>
                {gone > 0.5 && <Img src={icon('ghost.png')} style={{width: 70, height: 70, opacity: gone}} />}
              </div>
            );
          })}
        </div>
      </Space>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', opacity: ap(t, W(34) - 0.1)}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: '-0.04em', color: C.cream}}>aadhe log </span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, ...redText}}>gayab.</span>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 4. TRUTH — problem isn't leads, it's handling them
const Truth: React.FC<{t: number}> = ({t}) => {
  const strike = pt(t, W(47) - 0.05, W(48) + 0.2, ease.inOut);
  const hit = sp(t, W(52) - 0.1, 300, 16);
  return (
    <Shot t={t} id="truth">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 330, textAlign: 'center'}}>
        <Words t={t} at={W(41) - 0.05} text="Sach bataun toh…" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 90, color: C.dim}} />
        <div style={{marginTop: 60, fontFamily: SANS, fontWeight: 700, fontSize: 60, color: C.cream}}>
          <Rise t={t} at={W(44) - 0.05}>problem</Rise>
        </div>
        <div style={{position: 'relative', display: 'inline-block', marginTop: 4}}>
          <Rise t={t} at={W(45) - 0.05}>
            <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: '-0.06em', color: strike > 0.5 ? 'rgba(243,241,236,0.32)' : C.cream, lineHeight: 1}}>LEADS</span>
          </Rise>
          <div style={{position: 'absolute', left: -20, top: '50%', height: 18, width: `${strike * 112}%`, background: C.red, borderRadius: 9, transform: 'rotate(-4deg)'}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 60, color: C.dim}}>
          <Rise t={t} at={W(46) - 0.05}>ki nahi hai.</Rise>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', opacity: m1(hit * 2), transform: `translateY(${(1 - m1(hit)) * 100}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.cream}}>problem hai unhe</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, ...limeText, lineHeight: 1, filter: 'drop-shadow(0 16px 50px rgba(200,255,62,0.4))'}}>sambhalna.</div>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 5. SYSTEM — AI replies instantly and qualifies the lead
const FIELDS = [
  {at: 67, k: 'Property', v: '3BHK Apartment'},
  {at: 69, k: 'Area', v: '1,450 sq ft'},
  {at: 70, k: 'Budget', v: '₹12–15 Lakh'},
  {at: 71, k: 'Timeline', v: '2 months'},
];
const Qualify: React.FC<{t: number}> = ({t}) => {
  const intro = t < W(59) - 0.2;
  const hot = sp(t, W(73) - 0.1, 380, 14);
  return (
    <Shot t={t} id="qualify">
      <Backdrop t={t} hue="37,211,102" />
      {intro ? (
        <>
          <div style={{position: 'absolute', left: 540 - 140, top: 460, transform: `scale(${m1(sp(t, W(55) - 0.1, 260, 14))})`}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 280, height: 280, filter: 'drop-shadow(0 0 60px rgba(37,211,102,0.5))'}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center'}}>
            <Words t={t} at={W(53) - 0.05} text="isliye hum lagate hain" stagger={0.06} style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.dim}} />
            <Words t={t} at={W(55) - 0.05} text="WhatsApp" stagger={0.1} style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', marginTop: 10}} wordStyle={() => ({color: C.wa})} />
            <Words t={t} at={W(56) - 0.05} text="automation" stagger={0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130}} wordStyle={() => silverText} />
          </div>
        </>
      ) : (
        <Space t={t} rx={5} ry={-9} amp={0.8}>
          <Phone t={t} x={130} y={150} w={820} h={1500} bg={C.waBg} glareAt={W(59)}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '78px 30px 22px', background: '#1F2C34'}}>
              <AppIcon bg="#0B0B0D" size={84}>
                <Plan p={1} v={2} size={60} sw={2} />
              </AppIcon>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#E9EDEF'}}>Studio Aakaar</div>
                <div style={{fontFamily: SANS, fontSize: 22, color: C.wa}}>{t > W(62) - 0.6 && t < W(62) - 0.05 ? 'AI assistant typing…' : 'online'}</div>
              </div>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 56, height: 56}} />
            </div>
            <div style={{padding: '24px 26px'}}>
              <Bubble t={t} at={W(59) - 0.1}>Hi! 3BHK ka interior karwana hai 🏠</Bubble>
              {t > W(62) - 0.55 && t < W(62) - 0.05 && <Typing t={t} me />}
              <Bubble t={t} at={W(62) - 0.05} me>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 19, color: C.lime, letterSpacing: '0.14em', marginBottom: 6}}>
                  <div style={{width: 10, height: 10, borderRadius: 10, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
                  AI ASSISTANT · 2 sec
                </div>
                Zaroor! 😊 Bas kuch details batayein:
              </Bubble>
              {/* the lead card filling itself */}
              {t > W(67) - 0.3 && (
                <div style={{marginTop: 10, borderRadius: 28, background: '#111B21', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 24px', opacity: ap(t, W(67) - 0.3, 0.3)}}>
                  {FIELDS.map((f, i) => {
                    const p = sp(t, W(f.at) - 0.08, 400, 20);
                    return (
                      <div key={f.k} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
                        <span style={{width: 180, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.08em', color: '#8696A0', textTransform: 'uppercase'}}>{f.k}</span>
                        <span style={{flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#E9EDEF', opacity: m1(p * 2), transform: `translateX(${(1 - m1(p)) * 30}px)`, display: 'inline-block'}}>{f.v}</span>
                        <svg width={40} height={40} viewBox="0 0 24 24" style={{opacity: m1(p * 2)}}>
                          <circle cx={12} cy={12} r={11} fill={C.wa} />
                          <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${pt(t, W(f.at), W(f.at) + 0.3)} 1`} />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}
              {hot > 0 && (
                <div style={{display: 'flex', justifyContent: 'center', marginTop: 22}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderRadius: 999, background: C.lime, fontFamily: SANS, fontWeight: 900, fontSize: 30, color: C.ink, transform: `scale(${lerp(1.6, 1, m1(hot))})`, opacity: m1(hot * 3), boxShadow: '0 0 40px rgba(200,255,62,0.55)'}}>
                    <Img src={icon('fire.png')} style={{width: 40, height: 40}} /> Lead qualified · HOT
                  </div>
                </div>
              )}
            </div>
          </Phone>
        </Space>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 6. PORTFOLIO + SITE VISIT
const Portfolio: React.FC<{t: number}> = ({t}) => {
  const pdf = sp(t, W(77) - 0.1, 300, 22);
  const car = pt(t, W(79) - 0.1, W(83) + 0.4, ease.inOut);
  const ask = W(84) - 0.1;
  const tapAt = W(89) - 0.05;
  const booked = sp(t, W(91) - 0.1, 220, 18);
  const scroll = lerp(0, -420, pt(t, ask - 0.2, ask + 0.4, ease.inOut)) + lerp(0, -230, pt(t, W(91) - 0.3, W(91) + 0.2, ease.inOut));
  return (
    <Shot t={t} id="portfolio">
      <Backdrop t={t} hue="37,211,102" />
      <Space t={t} rx={5} ry={9} amp={0.6}>
        <Phone t={t} x={130} y={150} w={820} h={1500} bg={C.waBg} glareAt={W(76)}>
          <div style={{position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 18, padding: '78px 30px 22px', background: '#1F2C34'}}>
            <AppIcon bg="#0B0B0D" size={84}>
              <Plan p={1} v={2} size={60} sw={2} />
            </AppIcon>
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#E9EDEF'}}>Studio Aakaar</div>
              <div style={{fontFamily: SANS, fontSize: 22, color: C.wa}}>online</div>
            </div>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 56, height: 56}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, bottom: 0, overflow: 'hidden'}}>
            <div style={{padding: '24px 26px', transform: `translateY(${scroll}px)`}}>
              {/* portfolio PDF */}
              <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 14, opacity: m1(pdf * 2), transform: `translateY(${(1 - m1(pdf)) * 40}px)`}}>
                <div style={{width: 600, background: '#005C4B', borderRadius: 26, padding: 12}}>
                  <div style={{height: 260, borderRadius: 18, background: '#0B0B0D', display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
                    <Plan p={pt(t, W(77), W(78) + 0.8)} v={1} size={240} sw={1.3} />
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px 6px'}}>
                    <div style={{width: 56, height: 66, borderRadius: 8, background: '#E2412F', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 18, color: '#fff'}}>PDF</div>
                    <div>
                      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#E9EDEF'}}>Aakaar_Portfolio_2026.pdf</div>
                      <div style={{fontFamily: SANS, fontSize: 22, color: '#8FD6C7'}}>24 pages · 6.2 MB</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* past projects carousel */}
              <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 14, opacity: ap(t, W(79) - 0.1)}}>
                <div style={{width: 640, overflow: 'hidden', borderRadius: 26}}>
                  <div style={{display: 'flex', gap: 14, transform: `translateX(${-car * 520}px)`}}>
                    {PROJECTS.map((p, i) => (
                      <div key={p.n} style={{flexShrink: 0, width: 300, borderRadius: 22, background: '#0B0B0D', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'}}>
                        <div style={{height: 300, display: 'grid', placeItems: 'center'}}>
                          <Plan p={pt(t, W(79) + i * 0.3, W(79) + 1 + i * 0.3)} v={p.v} size={260} sw={1.3} color={i % 2 ? C.cream : C.lime} />
                        </div>
                        <div style={{padding: '12px 16px', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#E9EDEF'}}>{p.n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* site visit slots, tapped */}
              {t > ask && (
                <Bubble t={t} at={ask} me>
                  Site visit kab rakhein? 📍
                  <div style={{display: 'flex', gap: 12, marginTop: 14}}>
                    {['Sat · 11 AM', 'Sun · 4 PM'].map((s, i) => {
                      const sel = i === 0 && t >= tapAt;
                      return (
                        <div key={s} style={{padding: '12px 20px', borderRadius: 999, border: `2px solid ${sel ? C.lime : 'rgba(255,255,255,0.35)'}`, background: sel ? 'rgba(200,255,62,0.2)' : 'transparent', fontFamily: SANS, fontWeight: 700, fontSize: 28, color: sel ? C.lime : '#E9EDEF'}}>{s}</div>
                      );
                    })}
                  </div>
                </Bubble>
              )}
              {booked > 0 && (
                <div style={{perspective: 900, marginTop: 16}}>
                  <div style={{borderRadius: 30, background: '#fff', padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 20, transform: `rotateX(${(1 - m1(booked)) * -85}deg)`, transformOrigin: '50% 0%', boxShadow: `0 0 ${60 * m1(booked)}px rgba(200,255,62,0.45)`, border: `3px solid ${C.lime}`}}>
                    <Img src={icon('google-calendar.svg')} style={{width: 84, height: 84}} />
                    <div style={{flex: 1}}>
                      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#111'}}>Site visit booked</div>
                      <div style={{fontFamily: SANS, fontSize: 26, color: '#555'}}>Rahul · Sat, 11:00 AM · Baner</div>
                    </div>
                    <svg width={64} height={64} viewBox="0 0 24 24">
                      <circle cx={12} cy={12} r={11} fill={C.wa} />
                      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${pt(t, W(91), W(91) + 0.4)} 1`} />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Phone>
      </Space>
      <Touch t={t} taps={[{at: tapAt - 0.5, x: 700, y: 1250}, {at: tapAt, x: 470, y: 1060}]} show={[tapAt - 0.8, tapAt + 0.5]} />
    </Shot>
  );
};

// ---------------------------------------------------------------- 7. FOCUS — you design; WhatsApp handles the rest
const Focus: React.FC<{t: number}> = ({t}) => {
  const a = SC.focus[0];
  const chats = Math.round(lerp(0, 37, pt(t, W(101), W(104) + 0.4, ease.out)));
  return (
    <Shot t={t} id="focus">
      <Backdrop t={t} />
      <Space t={t} rx={22} ry={-6} amp={0.5}>
        <div style={{position: 'absolute', left: 90, top: 300, width: 900, height: 900, borderRadius: 30, background: '#0E1726', boxShadow: '0 60px 120px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'grid', placeItems: 'center', border: '1px solid rgba(160,190,255,0.15)'}}>
          <Plan p={pt(t, a + 0.1, a + 3.2, ease.inOut)} v={0} size={820} sw={0.8} color="#BFD3FF" />
          <div style={{position: 'absolute', right: 30, bottom: 26, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: 'rgba(191,211,255,0.6)', letterSpacing: '0.12em'}}>A-101 · GROUND FLOOR PLAN · 1:100</div>
        </div>
      </Space>
      <Img src={icon('triangular_ruler.png')} style={{position: 'absolute', left: 760, top: 210, width: 170, height: 170, transform: `rotate(${-12 + Math.sin(t * 0.8) * 4}deg)`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center'}}>
        <Words t={t} at={W(95) - 0.05} text="Aap sirf design pe dhyaan do." stagger={0.06} style={{fontFamily: SANS, fontWeight: 900, fontSize: 66, letterSpacing: '-0.035em', color: C.cream, padding: '0 50px'}} wordStyle={(w) => (w === 'design' ? limeText : {})} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center', opacity: ap(t, W(101) - 0.1)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 30px', borderRadius: 999, background: 'rgba(24,24,28,0.96)', border: `2px solid ${C.wa}`}}>
          <Img src={icon('whatsapp-icon.svg')} style={{width: 60, height: 60}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{chats} chats handled today</span>
        </div>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 8. CTA — comment WHATSAPP
const KB = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const keyPos = (ch: string): [number, number] => {
  for (let r = 0; r < 3; r++) {
    const c = KB[r].indexOf(ch);
    if (c >= 0) {
      const off = r === 0 ? 0 : r === 1 ? 37 : 111;
      return [112 + off + c * 74 + 33, 1390 + r * 108 + 46];
    }
  }
  return [540, 1500];
};
const Cta: React.FC<{t: number}> = ({t}) => {
  const WORD = 'WHATSAPP';
  const sheet = sp(t, W(112) - 0.3, 220, 24);
  const kb = sp(t, W(113) - 0.3, 260, 26);
  const kStart = W(114) - 0.05;
  const step = 0.1;
  const taps: Tap[] = [{at: W(113) - 0.35, x: 470, y: 1235}, ...WORD.split('').map((ch, i) => {
    const [x, y] = keyPos(ch);
    return {at: kStart + i * step, x, y};
  }), {at: W(116) - 0.05, x: 930, y: 1235}];
  const nTyped = WORD.split('').filter((_, i) => t >= kStart + i * step).length;
  const posted = t >= W(116) - 0.05;
  const post = sp(t, W(116) - 0.05, 320, 22);
  const dm = W(118) - 0.1;
  const q = t < W(112) - 0.3;
  return (
    <Shot t={t} id="cta">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 60, right: 60, top: q ? 620 : 200, textAlign: 'center', opacity: 1 - ap(t, dm, 0.3)}}>
        {q && (
          <div style={{display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 40}}>
            {[{n: 'triangular_ruler.png', at: W(105)}, {n: 'house.png', at: W(108)}].map((x) => (
              <Img key={x.n} src={icon(x.n)} style={{width: 170, height: 170, transform: `scale(${m1(sp(t, x.at - 0.1, 300, 14))})`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}} />
            ))}
          </div>
        )}
        <Words t={t} at={W(105) - 0.05} text="Architect ho ya interior designer…" stagger={0.06} style={{fontFamily: SANS, fontWeight: 800, fontSize: q ? 72 : 52, color: C.cream, letterSpacing: '-0.03em'}} />
        <Words t={t} at={W(110) - 0.05} text="yeh setup chahiye?" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: q ? 130 : 110, marginTop: 6}} wordStyle={() => limeText} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 560, bottom: -40, borderRadius: '56px 56px 0 0', background: '#fff', transform: `translateY(${(1 - m1(sheet)) * 1400}px)`, boxShadow: '0 -30px 90px rgba(0,0,0,0.5)'}}>
        <div style={{width: 90, height: 8, borderRadius: 8, background: '#ddd', margin: '18px auto 0'}} />
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111', marginTop: 16}}>Comments</div>
        <div style={{padding: '22px 36px'}}>
          {[
            {i: 0, n: 'ar.mehta_designs', c: 'WHATSAPP 🙌'},
            {i: 3, n: 'nest.interiors', c: 'Hume bhi chahiye ye'},
          ].map((r, k) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0'}}>
              <Avatar i={r.i} size={66} />
              <div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#111'}}>{r.n}</div>
                <div style={{fontFamily: SANS, fontSize: 30, color: '#222'}}>{r.c}</div>
              </div>
            </div>
          ))}
          {posted && (
            <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', transform: `translateY(${(1 - m1(post)) * 40}px)`, opacity: m1(post * 2)}}>
              <Avatar i={4} size={66} style={{border: `3px solid ${C.lime}`}} />
              <div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#111'}}>you · now</div>
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#111'}}>WHATSAPP</div>
              </div>
            </div>
          )}
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 640, display: 'flex', alignItems: 'center', gap: 16, background: '#F2F2F4', borderRadius: 999, padding: '18px 28px', border: t > W(113) - 0.35 && !posted ? '2px solid #0095F6' : '2px solid transparent'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: nTyped && !posted ? 800 : 500, fontSize: 40, color: nTyped && !posted ? '#111' : '#999'}}>
            {posted || !nTyped ? 'Add a comment…' : WORD.slice(0, nTyped)}
            {!posted && t > W(113) - 0.35 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: nTyped === WORD.length && !posted ? '#0095F6' : '#bbd6f5'}}>Post</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1360, height: 420, background: '#D1D3D9', borderRadius: 30, transform: `translateY(${(1 - m1(kb)) * 600}px)`, opacity: posted ? 1 - pt(t, W(116), W(116) + 0.3) : 1}}>
        {KB.map((row) =>
          row.split('').map((ch) => {
            const [kx, ky] = keyPos(ch);
            const hit = taps.some((p) => p.x === kx && p.y === ky && t >= p.at - 0.02 && t < p.at + 0.09);
            return (
              <div key={ch} style={{position: 'absolute', left: kx - 60 - 33, top: ky - 1360 - 46, width: 66, height: 92, borderRadius: 12, background: hit ? '#9EA3AE' : '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, color: '#111', transform: hit ? 'translateY(-26px) scale(1.25)' : undefined}}>
                {ch}
              </div>
            );
          }),
        )}
      </div>
      <Touch t={t} taps={taps} show={[W(113) - 0.6, W(116) + 0.3]} />
      <Banner t={t} at={dm} y={80} icon={<AppIcon bg="#0A0A0A"><Img src={staticFile('brand/nx-logo.png')} style={{width: 56, height: 41}} /></AppIcon>} title="Neuraxine" body="Architects ke liye WhatsApp automation 👇" time="now" />
    </Shot>
  );
};

// ---------------------------------------------------------------- captions: sentence case, a lime bar slides under the spoken word
const CAP_OFF: [number, number][] = [
  [0, W(0) - 0.15], // the intro is kinetic type
  [W(5) - 0.1, W(12) - 0.15], // "hire kisi aur ko kar liya" is the graphic
  [W(41) - 0.15, W(53) - 0.15], // the truth line is the graphic
  [W(53) - 0.15, W(59) - 0.2], // WhatsApp automation title
  [W(95) - 0.15, W(101) - 0.15], // "Aap sirf design pe dhyaan do." is on screen
  [W(105) - 0.15, edit.speech],
];
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length + (nx ? nx.w.length + 1 : 0);
    if (/[.,?!…"]$/.test(w.w) || cur.length >= 4 || !nx || nx.s - w.e > 0.3 || chars > 24) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const ACCENT = new Set(['portfolio', 'whatsapp', 'automation', 'ai', 'turant', 'site', 'visit', 'book', 'design', 'projects']);
const Captions: React.FC<{t: number}> = ({t}) => {
  if (CAP_OFF.some(([a, b]) => t >= a && t < b)) return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const len = c.words.map((w) => w.w).join(' ').length;
  const fs = Math.max(46, Math.min(66, 1300 / Math.max(10, len)));
  const pin = ap(t, c.s - 0.04, 0.25);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1710, display: 'flex', justifyContent: 'center', opacity: pin, transform: `translateY(${(1 - pin) * 16}px)`}}>
      <div style={{display: 'flex', gap: fs * 0.28, flexWrap: 'nowrap'}}>
        {c.words.map((w, i) => {
          const on = i === cur;
          const seen = i <= cur;
          const k = key(w.w);
          const bar = on ? pt(t, w.s - 0.04, w.s + 0.12, ease.out) : 0;
          return (
            <span key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 700, fontSize: fs, letterSpacing: '-0.02em', color: seen ? (ACCENT.has(k) ? C.lime : '#fff') : 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap', textShadow: '0 4px 20px rgba(0,0,0,0.9)'}}>
              {clean(w.w)}
              <span style={{position: 'absolute', left: 0, bottom: -10, height: 5, width: `${bar * 100}%`, borderRadius: 3, background: C.lime, boxShadow: `0 0 12px ${C.lime}`}} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.3) return null;
  const r = t - a;
  const k = pt(t, a - 0.3, a + 0.25, ease.inOut);
  const sweep = pt(r, 0.3, 1.3, ease.inOut);
  return (
    <AbsoluteFill style={{clipPath: k < 1 ? `circle(${k * 1700}px at 540px 960px)` : undefined}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.85, 1, m1(sp(t, a, 160, 20)))})`}}>
        <div style={{position: 'relative', width: 380, height: 277}}>
          <Img src={staticFile('brand/nx-logo.png')} style={{width: 380, height: 277, filter: 'drop-shadow(0 0 60px rgba(200,255,62,0.3))'}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${sweep * 140 - 40}%, rgba(255,255,255,0.35) ${sweep * 140 - 20}%, transparent ${sweep * 140}%)`, mixBlendMode: 'screen', WebkitMaskImage: `url(${staticFile('brand/nx-logo.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('brand/nx-logo.png')})`, maskSize: '100% 100%'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: `${0.3 - 0.2 * ap(r, 0.1, 0.8)}em`, ...silverText, opacity: ap(r, 0.1, 0.5)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', opacity: ap(r, 0.4, 0.4), transform: `translateY(${(1 - ap(r, 0.4, 0.5)) * 30}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999, border: `2px solid ${C.lime}`, fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.cream}}>
          <InstaMark size={50} /> Comment <span style={{fontWeight: 900, ...limeText}}>&ldquo;WHATSAPP&rdquo;</span> for details
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.055, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Intro t={t} />
      <Hook t={t} />
      <Why t={t} />
      <Spam t={t} />
      <Truth t={t} />
      <Qualify t={t} />
      <Portfolio t={t} />
      <Focus t={t} />
      <Cta t={t} />
      {t < edit.speech && <Captions t={t} />}
      <EndCard t={t} />
      {/* lens: soft vignette + fine grain + a breath of chromatic warmth at the edges */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 48%, transparent 58%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none'}} />
      <Grain frame={frame} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.45} />}
    </AbsoluteFill>
  );
};
