import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine — "Har missed call ek lost customer hai". Premium cut: every scene lives in a 3D space with a slow
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
const W = (i: number) => WORDS[i].s;
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
  hook: [0, W(7) - 0.15, 540, 960],
  busy: [W(7) - 0.15, W(20) - 0.15, 540, 1250],
  next: [W(20) - 0.15, W(37) - 0.15, 540, 1020],
  whatif: [W(37) - 0.15, W(49) - 0.15, 540, 760],
  chat: [W(49) - 0.15, W(79) - 0.15, 780, 1190],
  callback: [W(79) - 0.15, W(91) - 0.15, 540, 1460],
  flip: [W(91) - 0.15, W(100) - 0.15, 540, 1050],
  cta: [W(100) - 0.15, edit.speech + 0.1, 540, 960],
};
const ORDER = ['hook', 'busy', 'next', 'whatif', 'chat', 'callback', 'flip', 'cta'];
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

// ---------------------------------------------------------------- 1. HOOK
const Hook: React.FC<{t: number}> = ({t}) => {
  const n = Math.max(0, Math.min(6, Math.floor((t - 0.05) / 0.3) + 1));
  const lostAt = W(4) - 0.06;
  const zoom = pt(t, lostAt - 0.35, lostAt, ease.in); // camera dives into the stack
  const out = pt(t, lostAt - 0.05, lostAt + 0.25, ease.out);
  const vib = n > 0 && t < lostAt ? Math.sin(t * 80) * 4 : 0;
  const sh = shakeAt(t, [lostAt], 18);
  return (
    <Shot t={t} id="hook">
      <Backdrop t={t} red={m1(out)} hue={out > 0.5 ? '255,69,58' : '200,255,62'} />
      <AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.4}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: '-0.035em', color: C.cream, opacity: 1 - out}}>
          <Words t={t} at={0.08} text="Har missed call…" stagger={0.09} />
        </div>
        <div style={{opacity: 1 - out, transform: `scale(${1 + zoom * 1.8})`, transformOrigin: '540px 1150px', filter: zoom > 0.05 ? `blur(${zoom * 8}px)` : undefined}}>
          <Space t={t} rx={10} ry={-14}>
            <Phone t={t} x={255} y={330} w={570} h={1150} bg="linear-gradient(180deg,#141418,#0a0a0c)" style={{transform: `translateX(${vib}px) rotateZ(${vib * 0.15}deg)`}} glareAt={0.3}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: SANS, fontWeight: 200, fontSize: 150, color: '#fff', letterSpacing: '-0.04em'}}>7:42</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 26, color: 'rgba(255,255,255,0.6)'}}>Monday, 9 November</div>
              <div style={{position: 'absolute', left: 20, right: 20, top: 400}}>
                {Array.from({length: n}, (_, i) => {
                  const p = sp(t, 0.05 + i * 0.3, 320, 22);
                  return (
                    <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(60,60,66,0.72)', borderRadius: 30, padding: '16px 18px', marginBottom: 10, transform: `translateY(${(1 - m1(p)) * -60}px) scale(${lerp(0.9, 1, m1(p))})`, opacity: m1(p * 2)}}>
                      <AppIcon bg="linear-gradient(180deg,#5BF675,#2BD24A)" size={62}>
                        <Receiver size={34} />
                      </AppIcon>
                      <div style={{flex: 1}}>
                        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 25, color: '#fff'}}>Missed call</div>
                        <div style={{fontFamily: SANS, fontSize: 21, color: 'rgba(255,255,255,0.62)'}}>+91 98••• ••{(17 + i * 13) % 90}</div>
                      </div>
                      <span style={{fontFamily: SANS, fontSize: 19, color: 'rgba(255,255,255,0.5)'}}>{i === n - 1 ? 'now' : `${(n - 1 - i) * 3}m`}</span>
                    </div>
                  );
                })}
              </div>
            </Phone>
          </Space>
        </div>
        {/* LOST CUSTOMER: letters slam down one by one */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: out}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: C.cream, marginBottom: 6}}>
            <Rise t={t} at={lostAt}>ek</Rise>
          </div>
          {['LOST', 'CUSTOMER'].map((row, r) => (
            <div key={row} style={{display: 'flex', justifyContent: 'center'}}>
              {row.split('').map((ch, j) => {
                const i = r * 5 + j;
                const p = sp(t, lostAt + i * 0.025, 520, 16);
                return (
                  <span key={j} style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: r ? 150 : 210, letterSpacing: '-0.05em', lineHeight: 0.92, ...redText, transform: `translateY(${(1 - m1(p)) * -260}px) scale(${lerp(1.8, 1, m1(p))})`, opacity: m1(p * 3), filter: 'drop-shadow(0 18px 50px rgba(255,69,58,0.45))'}}>
                    {ch}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {/* sparks */}
        {out > 0 &&
          Array.from({length: 40}, (_, i) => {
            const u = pt(t, lostAt + rand(i) * 0.1, lostAt + 1.2 + rand(i) * 0.4, ease.out);
            const ang = rand(i * 3.1) * Math.PI * 2;
            const v = 200 + rand(i * 5.7) * 600;
            return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * v * u, top: 860 + Math.sin(ang) * v * u * 0.7, width: 6, height: 6, borderRadius: 6, background: i % 3 ? C.red : '#FFB4AE', opacity: (1 - u) * 0.9}} />;
          })}
      </AbsoluteFill>
    </Shot>
  );
};

// ---------------------------------------------------------------- 2. BUSY
const Busy: React.FC<{t: number}> = ({t}) => {
  const ring = t > W(17) - 0.15;
  const vib = ring ? Math.sin(t * 80) * 6 : 0;
  const secs = Math.floor(lerp(0, 38, pt(t, W(17) - 0.15, SC.busy[1], lin)));
  const card = (at: number, i: number, ic: string, title: string, sub: string, x: number) => {
    const p = sp(t, at, 220, 22);
    return (
      <div style={{position: 'absolute', left: x, top: 330, width: 430, height: 520, borderRadius: 44, background: 'linear-gradient(170deg, #1b1b1f, #0f0f11)', boxShadow: '0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset', padding: 34, boxSizing: 'border-box', transform: `translateY(${(1 - m1(p)) * 220}px) translateZ(${i ? -60 : 0}px) rotateY(${i ? -8 : 8}deg)`, opacity: m1(p * 2)}}>
        <Img src={icon(ic)} style={{width: 170, height: 170}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.cream, marginTop: 30, letterSpacing: '-0.03em'}}>{title}</div>
        <div style={{fontFamily: SANS, fontSize: 28, color: C.dim, marginTop: 8}}>{sub}</div>
        <div style={{position: 'absolute', left: 34, bottom: 34, display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 14, height: 14, borderRadius: 14, background: C.red}} />
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: C.red, letterSpacing: '0.12em'}}>BUSY</span>
        </div>
      </div>
    );
  };
  return (
    <Shot t={t} id="busy">
      <Backdrop t={t} />
      <Eyebrow t={t} at={SC.busy[0] + 0.2}>AAP BUSY THE</Eyebrow>
      <Space t={t} rx={6} ry={0}>
        {card(W(8) - 0.1, 0, 'laptop.png', 'Meeting', '3:00 – 4:00 PM · Client call', 90)}
        {card(W(14) - 0.1, 1, 'person_tipping_hand.png', 'Doosra customer', 'Counter pe, face to face', 560)}
      </Space>
      {/* the phone on the desk, ringing and ignored */}
      <div style={{position: 'absolute', left: 170, top: 1010, width: 740, height: 280, borderRadius: 60, background: 'rgba(28,28,32,0.96)', boxShadow: '0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07) inset', display: 'flex', alignItems: 'center', gap: 28, padding: '0 40px', boxSizing: 'border-box', opacity: m1(sp(t, W(17) - 0.2, 220, 20) * 2), transform: `translateX(${vib}px) translateY(${(1 - m1(sp(t, W(17) - 0.2, 220, 20))) * 300}px)`}}>
        <Avatar i={1} size={130} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontSize: 26, color: 'rgba(255,255,255,0.55)'}}>Incoming call</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: '#fff'}}>New customer</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.red, fontVariantNumeric: 'tabular-nums'}}>ringing · 0:{String(secs).padStart(2, '0')}</div>
        </div>
        <div style={{width: 110, height: 110, borderRadius: 110, background: C.wa, display: 'grid', placeItems: 'center'}}>
          <Receiver size={56} />
        </div>
      </div>
      {ring && <Rings t={t} x={835} y={1150} />}
    </Shot>
  );
};

// ---------------------------------------------------------------- 3. THE CUSTOMER CALLS SOMEONE ELSE
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const Next: React.FC<{t: number}> = ({t}) => {
  const part2 = t > W(30) - 0.15;
  const digits = '9876 54 4417'.replace(/ /g, '');
  const t0 = W(23), t1 = W(26);
  const taps: Tap[] = digits.split('').map((d, i) => {
    const k = KEYS.indexOf(d);
    return {at: lerp(t0, t1, i / (digits.length - 1)), x: 310 + (k % 3) * 230, y: 830 + Math.floor(k / 3) * 170};
  });
  taps.push({at: W(27) - 0.05, x: 540, y: 1520});
  const typed = digits.slice(0, taps.filter((p) => t >= p.at).length).replace(/^(\d{5})(\d+)/, '$1 $2');
  const calling = t > W(27) - 0.05;
  const conn = sp(t, W(28) + 0.1, 300, 22);
  const sh = shakeAt(t, [W(35) - 0.06], 16);
  return (
    <Shot t={t} id="next">
      <Backdrop t={t} red={part2 ? 1 : 0} hue={part2 ? '255,69,58' : '200,255,62'} />
      {!part2 ? (
        <>
          <Eyebrow t={t} at={SC.next[0] + 0.2} red>
            AUR CUSTOMER NE
          </Eyebrow>
          <Space t={t} rx={2} ry={3} amp={0.4}>
            <Phone t={t} x={190} y={250} w={700} h={1400} bg="#0B0B0D" glareAt={W(20)}>
              {!calling ? (
                <>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: SANS, fontWeight: 300, fontSize: 84, color: '#fff', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', minHeight: 100}}>{typed || ' '}</div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: SANS, fontSize: 28, color: C.wa, opacity: typed.length > 6 ? 1 : 0}}>Doosri shop · saved</div>
                  {KEYS.map((k, i) => {
                    const hit = taps.some((p) => p.x === 310 + (i % 3) * 230 && p.y === 830 + Math.floor(i / 3) * 170 && t >= p.at - 0.02 && t < p.at + 0.15);
                    return (
                      <div key={k} style={{position: 'absolute', left: 310 + (i % 3) * 230 - 190 - 75, top: 830 + Math.floor(i / 3) * 170 - 250 - 75, width: 150, height: 150, borderRadius: 150, background: hit ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 64, color: '#fff'}}>
                        {k}
                      </div>
                    );
                  })}
                  <div style={{position: 'absolute', left: 350 - 190 + 175 - 75, top: 1520 - 250 - 75, width: 150, height: 150, borderRadius: 150, background: C.wa, display: 'grid', placeItems: 'center'}}>
                    <Receiver size={70} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: SANS, fontSize: 30, color: 'rgba(255,255,255,0.6)'}}>{conn > 0 ? 'connected · 00:0' + Math.min(9, Math.floor((t - W(28)) * 2)) : 'calling…'}</div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 70, color: '#fff'}}>Doosri shop</div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center'}}>
                    <Img src={icon('convenience_store.png')} style={{width: 280, height: 280}} />
                  </div>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', opacity: m1(conn * 2)}}>
                    <Wave t={t} color={C.wa} on={conn > 0.5} />
                  </div>
                  <div style={{position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, color: C.cream, opacity: m1(conn * 2)}}>&ldquo;Haan ji, boliye!&rdquo;</div>
                  <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: 150, height: 150, borderRadius: 150, background: C.red, display: 'grid', placeItems: 'center'}}>
                      <Receiver size={70} rot={135} />
                    </div>
                  </div>
                </>
              )}
            </Phone>
          </Space>
          <Touch t={t} taps={taps} show={[W(23) - 0.4, W(27) + 0.4]} />
        </>
      ) : (
        <AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.4}px)`}}>
          <Eyebrow t={t} at={W(30) - 0.1} red>
            WAPAS CALL?
          </Eyebrow>
          {/* your recents: the number that will never call again */}
          <div style={{position: 'absolute', left: 110, right: 110, top: 290, borderRadius: 44, background: 'rgba(24,24,28,0.96)', padding: '34px 34px', boxShadow: '0 50px 100px rgba(0,0,0,0.6)', transform: `translateY(${(1 - m1(sp(t, W(30) - 0.1, 220, 22))) * 300}px)`}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff', marginBottom: 20}}>Recents</div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 0', borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none'}}>
                <Receiver size={36} color={C.red} rot={135} />
                <div style={{flex: 1}}>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.red}}>+91 98••• ••{17 + i * 13}</div>
                  <div style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>missed · {['2 hours', 'yesterday', 'Sat'][i]} ago</div>
                </div>
                <span style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255,255,255,0.35)'}}>no call back</span>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, color: C.cream}}>
            <Words t={t} at={W(31) - 0.05} text="wapas call nahi karega." stagger={0.07} />
          </div>
          <Stamp t={t} at={W(35) - 0.06} text="KABHI NAHI" size={128} y={1060} />
        </AbsoluteFill>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 4. WHAT IF — a glowing path from the missed call to WhatsApp
const WhatIf: React.FC<{t: number}> = ({t}) => {
  const travel = pt(t, W(41) - 0.1, W(46), ease.inOut);
  const bloom = sp(t, W(46) - 0.08, 260, 14);
  const ms = Math.round(lerp(0, 800, pt(t, W(44), W(46), lin)));
  // cubic path points
  const P = (u: number) => {
    const x0 = 540, y0 = 560, x1 = 160, y1 = 900, x2 = 920, y2 = 1060, x3 = 540, y3 = 1390;
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
    return [a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3];
  };
  const [hx, hy] = P(travel);
  return (
    <Shot t={t} id="whatif">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...limeText}}>
        <Words t={t} at={W(37) - 0.05} text="ab socho…" stagger={0.1} wordStyle={() => limeText} />
      </div>
      <Banner t={t} at={W(39) - 0.1} x={120} y={380} w={840} icon={<AppIcon bg="linear-gradient(180deg,#5BF675,#2BD24A)"><Receiver size={42} /></AppIcon>} title="Missed call" body="+91 98765 44417" />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M 540 560 C 160 900, 920 1060, 540 1390" fill="none" stroke="rgba(200,255,62,0.16)" strokeWidth={4} strokeDasharray="10 14" />
        <path d="M 540 560 C 160 900, 920 1060, 540 1390" fill="none" stroke={C.lime} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${travel} 1`} style={{filter: 'drop-shadow(0 0 14px rgba(200,255,62,0.9))'}} />
      </svg>
      {travel > 0 && travel < 1 && <div style={{position: 'absolute', left: hx - 22, top: hy - 22, width: 44, height: 44, borderRadius: 44, background: '#fff', boxShadow: `0 0 40px 16px rgba(200,255,62,0.7)`}} />}
      {/* bloom into WhatsApp */}
      <div style={{position: 'absolute', left: 540 - 400, top: 1390 - 400, width: 800, height: 800, borderRadius: 800, background: 'radial-gradient(circle, rgba(37,211,102,0.45), transparent 60%)', opacity: m1(bloom) * 0.9, transform: `scale(${lerp(0.3, 1, m1(bloom))})`}} />
      <div style={{position: 'absolute', left: 540 - 130, top: 1390 - 130, transform: `scale(${m1(bloom)}) rotate(${(1 - m1(bloom)) * -40}deg)`}}>
        <Img src={icon('whatsapp-icon.svg')} style={{width: 260, height: 260}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 14, opacity: ap(t, W(44) - 0.05)}}>
        <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 64, color: C.dim, fontVariantNumeric: 'tabular-nums'}}>0.{String(ms).padStart(3, '0').slice(0, 2)}s</span>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, ...limeText}}>turant</span>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 5. CHAT — typing, replies, the booking
const Typing: React.FC<{t: number; me?: boolean}> = ({t, me}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 14}}>
    <div style={{display: 'flex', gap: 8, background: me ? '#005C4B' : '#202C33', padding: '20px 24px', borderRadius: 24}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 14, height: 14, borderRadius: 14, background: 'rgba(255,255,255,0.7)', transform: `translateY(${Math.sin(t * 12 - i * 0.9) * 5}px)`}} />
      ))}
    </div>
  </div>
);
const Chat: React.FC<{t: number}> = ({t}) => {
  const msg1 = 'Hi! Sorry, abhi call nahi utha paaye. Bataiye, kya help chahiye? 🙂';
  const typed = msg1.slice(0, Math.floor(lerp(0, msg1.length, pt(t, W(49) - 0.05, W(59) + 0.3, lin))));
  const thread = [
    {at: W(60) - 0.1, me: false, txt: 'Haircut ke liye kal shaam slot hai?'},
    {at: W(64) - 0.05, me: true, ai: true, txt: 'Haan ji! 5 PM free hai. Naam bata dijiye?'},
    {at: W(69) - 0.05, me: false, txt: 'Riya. 5 baje theek hai 👍'},
  ];
  const booked = sp(t, W(75) - 0.1, 220, 18);
  const flip = m1(booked);
  const scroll = lerp(0, -170, pt(t, W(74), W(75) + 0.4, ease.inOut));
  return (
    <Shot t={t} id="chat">
      <Backdrop t={t} hue="37,211,102" />
      <Space t={t} rx={5} ry={-9} amp={0.8}>
        <Phone t={t} x={140} y={150} w={800} h={1500} bg={C.waBg} glareAt={W(49)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '78px 30px 22px', background: '#1F2C34'}}>
            <AppIcon bg="#0A0A0A" size={84}>
              <Img src={icon('scissors.png')} style={{width: 56, height: 56}} />
            </AppIcon>
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#E9EDEF'}}>Your Salon</div>
              <div style={{fontFamily: SANS, fontSize: 24, color: C.wa}}>{t > W(64) - 0.6 && t < W(64) - 0.05 ? 'AI agent typing…' : 'online'}</div>
            </div>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 58, height: 58}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, bottom: 0, overflow: 'hidden'}}>
          <div style={{padding: '24px 26px', transform: `translateY(${scroll}px)`}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
              <div style={{fontFamily: SANS, fontSize: 21, color: '#8696A0', background: '#182229', borderRadius: 14, padding: '8px 16px'}}>Missed call · auto-reply in 0.8s</div>
            </div>
            {typed.length > 0 && (
              <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 14}}>
                <div style={{maxWidth: 620, background: '#005C4B', color: '#E9EDEF', fontFamily: SANS, fontSize: 34, lineHeight: 1.32, padding: '18px 22px', borderRadius: 26, borderTopRightRadius: 8}}>
                  {typed}
                  {typed.length < msg1.length && <span style={{opacity: Math.sin(t * 16) > 0 ? 1 : 0}}>▍</span>}
                </div>
              </div>
            )}
            {thread.map((m, i) => {
              if (t < m.at - 0.55) return null;
              if (t < m.at) return <Typing key={i} t={t} me={m.me} />;
              const p = sp(t, m.at, 320, 22);
              return (
                <div key={i} style={{display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', marginBottom: 14, opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * 30}px) scale(${lerp(0.85, 1, m1(p))})`, transformOrigin: m.me ? '100% 100%' : '0 100%'}}>
                  <div style={{maxWidth: 620, background: m.me ? '#005C4B' : '#202C33', color: '#E9EDEF', fontFamily: SANS, fontSize: 34, lineHeight: 1.32, padding: '18px 22px', borderRadius: 26}}>
                    {m.ai && (
                      <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 800, fontSize: 19, color: C.lime, letterSpacing: '0.14em', marginBottom: 6}}>
                        <div style={{width: 10, height: 10, borderRadius: 10, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
                        AI AGENT
                      </div>
                    )}
                    {m.txt}
                  </div>
                </div>
              );
            })}
            {/* booking card flips up */}
            {booked > 0 && (
              <div style={{perspective: 900, marginTop: 20}}>
                <div style={{borderRadius: 30, background: '#fff', padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 20, transform: `rotateX(${(1 - flip) * -85}deg)`, transformOrigin: '50% 0%', boxShadow: `0 0 ${60 * flip}px rgba(200,255,62,0.45)`, border: `3px solid ${C.lime}`}}>
                  <Img src={icon('google-calendar.svg')} style={{width: 84, height: 84}} />
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 38, color: '#111'}}>Appointment booked</div>
                    <div style={{fontFamily: SANS, fontSize: 28, color: '#555'}}>Riya · Haircut · Kal, 5:00 PM</div>
                  </div>
                  <svg width={70} height={70} viewBox="0 0 24 24">
                    <circle cx={12} cy={12} r={11} fill={C.wa} />
                    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${pt(t, W(75) + 0.1, W(75) + 0.5)} 1`} />
                  </svg>
                </div>
              </div>
            )}
          </div>
          </div>
        </Phone>
      </Space>
      {/* small sparks off the booking */}
      {booked > 0 &&
        Array.from({length: 18}, (_, i) => {
          const u = pt(t, W(75) - 0.05, W(75) + 0.9, ease.out);
          const ang = -Math.PI / 2 + (rand(i) - 0.5) * 2.4;
          return <div key={i} style={{position: 'absolute', left: 560 + Math.cos(ang) * 420 * u, top: 1150 + Math.sin(ang) * 300 * u, width: 8, height: 8, borderRadius: 8, background: i % 2 ? C.lime : '#fff', opacity: (1 - u) * 0.9}} />;
        })}
    </Shot>
  );
};

// ---------------------------------------------------------------- 6. CALL BACK A READY LEAD
const Callback: React.FC<{t: number}> = ({t}) => {
  const tapAt = W(83) - 0.05;
  const inCall = t > tapAt + 0.1;
  const lead = sp(t, W(88) - 0.1, 260, 20);
  return (
    <Shot t={t} id="callback">
      <Backdrop t={t} />
      <Eyebrow t={t} at={SC.callback[0] + 0.2}>AAP FREE HUE</Eyebrow>
      <Space t={t} rx={2} ry={4} amp={0.5}>
        <Phone t={t} x={210} y={260} w={660} h={1340} bg="linear-gradient(180deg,#16161a,#0b0b0d)" glareAt={W(79)}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: SANS, fontSize: 28, color: 'rgba(255,255,255,0.55)'}}>{inCall ? `calling… 00:0${Math.min(9, Math.floor((t - tapAt) * 2))}` : 'Riya · from WhatsApp'}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center'}}>
            <div style={{position: 'relative'}}>
              {inCall && <Rings t={t} x={110} y={110} color={C.lime} />}
              <Avatar i={1} size={220} style={{border: `5px solid ${C.lime}`, position: 'relative'}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 74, color: '#fff'}}>Riya</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', opacity: inCall ? 1 : 0}}>
            <Wave t={t} n={22} h={60} />
          </div>
          <div style={{position: 'absolute', left: 50, right: 50, top: 720, borderRadius: 34, background: 'rgba(200,255,62,0.08)', border: `2px solid ${C.lime}`, padding: '26px 30px', transform: `translateY(${(1 - m1(lead)) * 80}px)`, opacity: m1(lead * 2)}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: C.lime}}>READY LEAD</div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#fff', marginTop: 10}}>Haircut · Kal 5:00 PM</div>
            <div style={{fontFamily: SANS, fontSize: 28, color: C.dim, marginTop: 4}}>Naam, time, service — sab ready ✓</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, display: 'flex', justifyContent: 'center'}}>
            <div style={{width: 150, height: 150, borderRadius: 150, background: inCall ? C.red : C.wa, display: 'grid', placeItems: 'center', boxShadow: `0 0 50px ${inCall ? 'rgba(255,69,58,0.4)' : 'rgba(37,211,102,0.5)'}`}}>
              <Receiver size={74} rot={inCall ? 135 : 0} />
            </div>
          </div>
        </Phone>
      </Space>
      <Touch t={t} taps={[{at: tapAt - 0.6, x: 700, y: 1300}, {at: tapAt, x: 540, y: 1460}]} show={[tapAt - 0.9, tapAt + 0.6]} />
    </Shot>
  );
};

// ---------------------------------------------------------------- 7. MISSED CALL = LEAD (letters of MISSED fall away)
const Flip: React.FC<{t: number}> = ({t}) => {
  const fall = W(94) - 0.05;
  const lead = sp(t, W(98) - 0.1, 300, 16);
  const sweep = pt(t, W(98) + 0.2, W(98) + 1.0, ease.inOut);
  return (
    <Shot t={t} id="flip">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center'}}>
        {'MISSED'.split('').map((ch, i) => {
          const at = fall + i * 0.06;
          const g = Math.max(0, t - at);
          const y = 900 * g * g + 120 * g;
          return (
            <span key={i} style={{display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 190, letterSpacing: '-0.05em', color: C.cream, lineHeight: 1, transform: `translateY(${y}px) rotate(${g * (rand(i) - 0.5) * 220}deg)`, opacity: 1 - m1(g * 1.4)}}>
              <Rise t={t} at={SC.flip[0] + 0.1 + i * 0.04}>{ch}</Rise>
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', color: C.cream, lineHeight: 1}}>
        <Rise t={t} at={SC.flip[0] + 0.3}>CALL</Rise>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: m1(lead * 2)}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 90, color: C.dim}}>ab hai ek</div>
        <div style={{position: 'relative', display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 300, letterSpacing: '-0.06em', ...limeText, lineHeight: 0.95, transform: `translateY(${(1 - m1(lead)) * 120}px) scale(${lerp(0.8, 1, m1(lead))})`, filter: 'drop-shadow(0 20px 60px rgba(200,255,62,0.4))'}}>
          LEAD
          <span style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${sweep * 130 - 30}%, rgba(255,255,255,0.85) ${sweep * 130 - 15}%, transparent ${sweep * 130}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>LEAD</span>
        </div>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 8. CTA — comment sheet, keyboard, typing CALL, instant DM
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
  const sheet = sp(t, W(106) - 0.2, 220, 24);
  const kb = sp(t, W(107) - 0.2, 260, 26);
  const letters = 'CALL'.split('');
  const kStart = W(108) - 0.1;
  const taps: Tap[] = [{at: W(107) - 0.25, x: 470, y: 1235}, ...letters.map((ch, i) => {
    const [x, y] = keyPos(ch);
    return {at: kStart + i * 0.16, x, y};
  }), {at: W(110) - 0.1, x: 930, y: 1235}];
  const nTyped = letters.filter((_, i) => t >= kStart + i * 0.16).length;
  const posted = t >= W(110) - 0.1;
  const post = sp(t, W(110) - 0.1, 320, 22);
  const dm = W(111) + 0.1;
  return (
    <Shot t={t} id="cta">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 180, textAlign: 'center', opacity: 1 - ap(t, W(111), 0.3)}}>
        <Words t={t} at={W(100) - 0.05} text="Apne business ke liye" stagger={0.07} style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.cream, letterSpacing: '-0.03em'}} />
        <Words t={t} at={W(104) - 0.05} text="yeh setup chahiye?" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 128, marginTop: 6}} wordStyle={() => limeText} />
      </div>
      {/* reel behind, comment sheet rising */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 560, bottom: -40, borderRadius: '56px 56px 0 0', background: '#fff', transform: `translateY(${(1 - m1(sheet)) * 1400}px)`, boxShadow: '0 -30px 90px rgba(0,0,0,0.5)'}}>
        <div style={{width: 90, height: 8, borderRadius: 8, background: '#ddd', margin: '18px auto 0'}} />
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111', marginTop: 16}}>Comments</div>
        <div style={{padding: '22px 36px'}}>
          {[
            {i: 2, n: 'aman_k', c: 'CALL 🙏'},
            {i: 3, n: 'pooja.salon', c: 'Mujhe bhi chahiye'},
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
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#111'}}>CALL</div>
              </div>
            </div>
          )}
        </div>
        {/* input */}
        <div style={{position: 'absolute', left: 30, right: 30, top: 640, display: 'flex', alignItems: 'center', gap: 16, background: '#F2F2F4', borderRadius: 999, padding: '18px 28px', border: t > W(107) - 0.25 && !posted ? '2px solid #0095F6' : '2px solid transparent'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: nTyped && !posted ? 800 : 500, fontSize: 40, color: nTyped && !posted ? '#111' : '#999'}}>
            {posted || !nTyped ? 'Add a comment…' : 'CALL'.slice(0, nTyped)}
            {!posted && t > W(107) - 0.25 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: nTyped === 4 && !posted ? '#0095F6' : '#bbd6f5'}}>Post</span>
        </div>
      </div>
      {/* keyboard */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1360, height: 420, background: '#D1D3D9', borderRadius: 30, transform: `translateY(${(1 - m1(kb)) * 600}px)`, opacity: posted ? 1 - pt(t, W(110), W(110) + 0.3) : 1}}>
        {KB.map((row, r) =>
          row.split('').map((ch, c) => {
            const [kx, ky] = keyPos(ch);
            const hit = taps.some((p) => p.x === kx && p.y === ky && t >= p.at - 0.02 && t < p.at + 0.14);
            return (
              <div key={ch} style={{position: 'absolute', left: kx - 60 - 33, top: ky - 1360 - 46, width: 66, height: 92, borderRadius: 12, background: hit ? '#9EA3AE' : '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, color: '#111', transform: hit ? 'translateY(-26px) scale(1.25)' : undefined}}>
                {ch}
              </div>
            );
          }),
        )}
      </div>
      <Touch t={t} taps={taps} show={[W(107) - 0.5, W(110) + 0.3]} />
      {/* the instant reply drops in */}
      <Banner t={t} at={dm} y={80} icon={<AppIcon bg="#0A0A0A"><Img src={staticFile('brand/nx-logo.png')} style={{width: 56, height: 41}} /></AppIcon>} title="Neuraxine" body="Missed-call automation ki details 👇" time="now" />
    </Shot>
  );
};

// ---------------------------------------------------------------- captions: sentence case, a lime bar slides under the spoken word
const CAP_OFF: [number, number][] = [
  [0, W(7) - 0.15],
  [W(91) - 0.15, W(100) - 0.15],
  [W(100) - 0.15, edit.speech],
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
const ACCENT = new Set(['missed', 'lost', 'whatsapp', 'turant', 'ai', 'agent', 'appointment', 'lead', 'ready', 'kabhi']);
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
          <InstaMark size={50} /> Comment <span style={{fontWeight: 900, ...limeText}}>&ldquo;CALL&rdquo;</span> for details
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
      <Hook t={t} />
      <Busy t={t} />
      <Next t={t} />
      <WhatIf t={t} />
      <Chat t={t} />
      <Callback t={t} />
      <Flip t={t} />
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
