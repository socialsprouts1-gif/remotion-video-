import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine — "Sochke batata hoon": automatic WhatsApp follow-ups. Premium cut: every scene lives in a 3D space with a slow
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
  hook: [0, W(12) - 0.15, 540, 1000],
  forget: [W(12) - 0.15, W(29) - 0.15, 540, 1180],
  truth: [W(29) - 0.15, W(50) - 0.15, 540, 1220],
  system: [W(50) - 0.15, W(76) - 0.15, 860, 1373],
  close: [W(76) - 0.15, W(90) - 0.15, 860, 960],
  cta: [W(90) - 0.15, edit.speech + 0.1, 540, 960],
};
const ORDER = ['hook', 'forget', 'truth', 'system', 'close', 'cta'];
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

// ---------------------------------------------------------------- 1. HOOK — "Sochke batata hoon." ...and you never asked again
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
const Hook: React.FC<{t: number}> = ({t}) => {
  const said = W(3) - 0.1;
  const red = pt(t, W(8) - 0.2, W(8) + 0.3, ease.inOut);
  const sh = shakeAt(t, [W(11) - 0.03], 12);
  const silence = Math.max(0, t - W(5));
  return (
    <Shot t={t} id="hook">
      <Backdrop t={t} red={red} hue={red > 0.5 ? '255,69,58' : '37,211,102'} />
      <AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.4}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.cream, letterSpacing: '-0.03em', opacity: 1 - red}}>
          <Words t={t} at={0.15} text="Customer ne bola…" stagger={0.08} />
        </div>
        <div style={{opacity: lerp(1, 0.35, red), filter: red > 0.05 ? `blur(${red * 4}px)` : undefined}}>
          <Space t={t} rx={8} ry={-12}>
            <Phone t={t} x={170} y={300} w={740} h={1300} bg={C.waBg} glareAt={0.4}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '78px 30px 22px', background: '#1F2C34'}}>
                <Avatar i={2} size={84} />
                <div style={{flex: 1}}>
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#E9EDEF'}}>Rahul (enquiry)</div>
                  <div style={{fontFamily: SANS, fontSize: 24, color: '#8696A0'}}>last seen {silence > 1.5 ? '3 weeks ago' : silence > 0.4 ? '1 week ago' : 'today'}</div>
                </div>
                <Img src={icon('whatsapp-icon.svg')} style={{width: 58, height: 58}} />
              </div>
              <div style={{padding: '26px 26px'}}>
                <Bubble t={t} at={0.25} me tick>Price list bhej di hai 👇 Koi bhi sawaal ho toh batana!</Bubble>
                <Bubble t={t} at={said}>Theek hai… sochke batata hoon 🤔</Bubble>
                {t > W(6) && (
                  <div style={{display: 'flex', justifyContent: 'center', marginTop: 40, opacity: ap(t, W(6), 0.4)}}>
                    <div style={{fontFamily: SANS, fontSize: 24, color: '#8696A0', background: '#182229', borderRadius: 14, padding: '10px 18px'}}>No messages since · {silence > 1.5 ? '21' : silence > 0.4 ? '7' : '1'} days</div>
                  </div>
                )}
              </div>
            </Phone>
          </Space>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: red}}>
          <Words t={t} at={W(6) - 0.05} text="Aur aapne?" stagger={0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: C.cream}} />
          <Words t={t} at={W(8) - 0.05} text="Dobara poocha" stagger={0.09} style={{fontFamily: SANS, fontWeight: 900, fontSize: 128, letterSpacing: '-0.05em', marginTop: 20}} wordStyle={() => redText} />
          <Words t={t} at={W(10) - 0.05} text="hi nahi." stagger={0.09} style={{fontFamily: SANS, fontWeight: 900, fontSize: 128, letterSpacing: '-0.05em'}} wordStyle={() => redText} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
};

// ---------------------------------------------------------------- 2. weeks pass; the customer forgets you
const Forget: React.FC<{t: number}> = ({t}) => {
  const pages = [
    {at: W(12) - 0.1, d: 9},
    {at: W(13) - 0.1, d: 16},
    {at: W(16) - 0.1, d: 23},
  ];
  const cur = pages.reduce((n, p, i) => (t >= p.at ? i : n), 0);
  const fade = pt(t, W(21) - 0.1, W(28), ease.inOut);
  const part2 = t > W(18) - 0.2;
  return (
    <Shot t={t} id="forget">
      <Backdrop t={t} />
      {!part2 ? (
        <>
          <Eyebrow t={t} at={SC.forget[0] + 0.2}>TIME PASSES</Eyebrow>
          <Space t={t} rx={10} ry={-6}>
            <div style={{position: 'absolute', left: 290, top: 420, width: 500, height: 600}}>
              {/* the stack underneath */}
              <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', boxShadow: '0 60px 120px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
                <div style={{height: 120, background: C.red, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.1em'}}>NOV</div>
                <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 300, color: '#111', lineHeight: 1.4}}>{pages[Math.min(2, cur + (t >= pages[cur].at + 0.35 ? 1 : 0))].d}</div>
              </div>
              {/* the page tearing off */}
              {pages.map((p, i) => {
                const u = pt(t, p.at, p.at + 0.7, ease.in);
                if (i !== cur || u <= 0 || u >= 1 || i === 2) return null;
                return (
                  <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 40, background: '#fff', overflow: 'hidden', transformOrigin: '50% 0%', transform: `translate3d(${u * 380}px, ${u * u * 900}px, ${u * 300}px) rotateX(${u * 70}deg) rotateZ(${u * 35}deg)`, opacity: 1 - u * 0.6, boxShadow: '0 40px 80px rgba(0,0,0,0.5)'}}>
                    <div style={{height: 120, background: C.red, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: '0.1em'}}>NOV</div>
                    <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 300, color: '#111', lineHeight: 1.4}}>{p.d}</div>
                  </div>
                );
              })}
            </div>
          </Space>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, color: C.cream}}>
            <Words t={t} at={W(12) - 0.05} text="ek hafta…" stagger={0.08} />
            <Words t={t} at={W(15) - 0.05} text="do hafte…" stagger={0.08} wordStyle={() => ({color: C.dim})} />
          </div>
        </>
      ) : (
        <>
          <Eyebrow t={t} at={W(18) - 0.1} red>
            AUR WOH CUSTOMER
          </Eyebrow>
          {/* your business card dissolving out of their memory */}
          <div style={{position: 'absolute', left: 140, right: 140, top: 420, height: 520, borderRadius: 50, background: 'linear-gradient(160deg, #1d1d22, #0f0f12)', boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07) inset', padding: 50, boxSizing: 'border-box', opacity: 1 - fade * 0.85, filter: `blur(${fade * 16}px) grayscale(${fade})`, transform: `scale(${1 - fade * 0.1})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
              <AppIcon bg="linear-gradient(160deg,#C8FF3E,#7FD01A)" size={130}>
                <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.ink}}>YB</span>
              </AppIcon>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 58, color: C.cream, letterSpacing: '-0.03em'}}>Your Business</div>
                <div style={{fontFamily: SANS, fontSize: 30, color: C.dim}}>Price list · 3 weeks ago</div>
              </div>
            </div>
            <div style={{marginTop: 50, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.12)', width: '80%'}} />
            <div style={{marginTop: 18, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.08)', width: '60%'}} />
          </div>
          {fade > 0 &&
            Array.from({length: 46}, (_, i) => {
              const u = m1((fade - rand(i) * 0.4) / 0.6);
              return <div key={i} style={{position: 'absolute', left: 160 + rand(i * 2.3) * 760 + u * (rand(i * 7) - 0.3) * 300, top: 440 + rand(i * 4.1) * 480 - u * 300, width: 8, height: 8, borderRadius: 8, background: C.cream, opacity: u > 0 ? (1 - u) * 0.7 : 0}} />;
            })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center'}}>
            <Words t={t} at={W(21) - 0.05} text="bhool gaya" stagger={0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.05em'}} wordStyle={() => redText} />
            <Words t={t} at={W(23) - 0.05} text="ki aap exist bhi karte ho." stagger={0.06} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: C.dim, marginTop: 10}} />
          </div>
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 3. people need reminders — again and again, at the right time
const Truth: React.FC<{t: number}> = ({t}) => {
  const part2 = t > W(40) - 0.15;
  const pings = [W(45) - 0.05, W(46) - 0.05, W(47) - 0.05];
  return (
    <Shot t={t} id="truth">
      <Backdrop t={t} />
      {!part2 ? (
        <div style={{position: 'absolute', left: 70, right: 70, top: 470, textAlign: 'center'}}>
          <Words t={t} at={W(29) - 0.05} text="Sach ye hai…" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.dim}} />
          <Words t={t} at={W(32) - 0.05} text="zyada tar log" stagger={0.07} style={{fontFamily: SANS, fontWeight: 900, fontSize: 116, letterSpacing: '-0.045em', color: C.cream, marginTop: 40}} />
          <Words t={t} at={W(35) - 0.05} text="pehli baar mein" stagger={0.07} style={{fontFamily: SANS, fontWeight: 900, fontSize: 116, letterSpacing: '-0.045em', color: C.cream}} />
          <Words t={t} at={W(38) - 0.05} text="nahi khareedte." stagger={0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 116, letterSpacing: '-0.045em'}} wordStyle={() => limeText} />
        </div>
      ) : (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
            <Words t={t} at={W(40) - 0.08} text="Unhe yaad dilana padta hai." stagger={0.06} style={{fontFamily: SANS, fontWeight: 800, fontSize: 72, color: C.cream, letterSpacing: '-0.03em'}} />
          </div>
          {/* a track of touchpoints that ping one after another */}
          <div style={{position: 'absolute', left: 120, right: 120, top: 760, height: 6, borderRadius: 3, background: C.faint}}>
            <div style={{width: `${pt(t, W(44), W(48) + 0.3, ease.inOut) * 100}%`, height: '100%', borderRadius: 3, background: LIME_GRAD, boxShadow: '0 0 20px rgba(200,255,62,0.7)'}} />
          </div>
          {pings.map((at, i) => {
            const p = sp(t, at, 380, 14);
            const x = 120 + (i + 0.5) * (840 / 3);
            return (
              <div key={i} style={{position: 'absolute', left: x - 75, top: 763 - 75, width: 150, height: 150, display: 'grid', placeItems: 'center'}}>
                {p > 0 && <Rings t={t - at} x={75} y={75} color={C.lime} />}
                <div style={{width: 120, height: 120, borderRadius: 120, background: p > 0 ? 'rgba(200,255,62,0.14)' : '#141416', border: `2px solid ${p > 0 ? C.lime : C.faint}`, display: 'grid', placeItems: 'center', transform: `scale(${lerp(0.8, 1, m1(p))})`}}>
                  <Img src={icon('bell.png')} style={{width: 70, height: 70, opacity: p > 0 ? 1 : 0.3, transform: `rotate(${p > 0 ? Math.sin((t - at) * 30) * 18 * Math.exp(-(t - at) * 3) : 0}deg)`}} />
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center'}}>
            <Words t={t} at={W(45) - 0.05} text="baar baar." stagger={0.12} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120}} wordStyle={() => limeText} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1160, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: ap(t, W(47) - 0.05, 0.4)}}>
            <div style={{width: 120, height: 120, borderRadius: 120, border: `4px solid ${C.cream}`, position: 'relative'}}>
              <div style={{position: 'absolute', left: 58, top: 18, width: 4, height: 44, background: C.cream, borderRadius: 2, transformOrigin: '50% 100%', transform: `rotate(${(t - W(47)) * 360}deg)`}} />
              <div style={{position: 'absolute', left: 58, top: 34, width: 4, height: 28, background: C.lime, borderRadius: 2, transformOrigin: '50% 100%', transform: `rotate(${(t - W(47)) * 30 + 90}deg)`}} />
            </div>
            <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.cream, letterSpacing: '-0.04em'}}>sahi time pe.</span>
          </div>
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 4. the follow-up system: Day 1 / 3 / 7 on WhatsApp, switched on
const STEPS15 = [
  {at: 56, day: 'Pehle din', msg: 'Thank you for visiting! 🙏 Koi bhi sawaal ho toh reply karein.', icon: 'folded_hands.png'},
  {at: 61, day: 'Teesre din', msg: 'Aapke liye 10% off 🎁 — ya ek quick review de dijiye ⭐', icon: 'wrapped_gift.png'},
  {at: 66, day: 'Saatve din', msg: 'Hi! Abhi bhi interested ho? Slot book kar dein? 🙂', icon: 'speech_balloon.png'},
];
const System: React.FC<{t: number}> = ({t}) => {
  const intro = t < W(56) - 0.15;
  const travel = pt(t, W(56) - 0.1, W(66) + 0.3, ease.inOut);
  const toggleAt = W(73) - 0.05;
  const on = t >= toggleAt;
  const knob = pt(t, toggleAt, toggleAt + 0.25, ease.out);
  return (
    <Shot t={t} id="system">
      <Backdrop t={t} hue="200,255,62" />
      {intro ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.8, 1, m1(sp(t, SC.system[0] + 0.1, 200, 20)))})`, opacity: ap(t, SC.system[0] + 0.1, 0.4)}}>
            <Img src={staticFile('brand/nx-logo.png')} style={{width: 280, height: 204, filter: 'drop-shadow(0 0 40px rgba(200,255,62,0.3))'}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center'}}>
            <Words t={t} at={W(51) - 0.05} text="hum lagate hain" stagger={0.07} style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.dim}} />
            <Words t={t} at={W(52) - 0.05} text="Follow-up" stagger={0.1} style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', marginTop: 10}} wordStyle={() => limeText} />
            <Words t={t} at={W(53) - 0.05} text="automation" stagger={0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130}} wordStyle={() => silverText} />
          </div>
        </>
      ) : (
        <>
          <Eyebrow t={t} at={W(56) - 0.15}>AUTOMATIC FOLLOW-UP</Eyebrow>
          {/* the track */}
          <div style={{position: 'absolute', left: 150, top: 300, width: 6, height: 900, borderRadius: 3, background: C.faint}}>
            <div style={{width: '100%', height: `${travel * 100}%`, borderRadius: 3, background: LIME_GRAD, boxShadow: '0 0 20px rgba(200,255,62,0.7)'}} />
          </div>
          {travel > 0 && travel < 1 && <div style={{position: 'absolute', left: 153 - 20, top: 300 + travel * 900 - 20, width: 40, height: 40, borderRadius: 40, background: '#fff', boxShadow: '0 0 36px 14px rgba(200,255,62,0.7)'}} />}
          {STEPS15.map((s, i) => {
            const at = W(s.at) - 0.1;
            const p = sp(t, at, 260, 22);
            const y = 300 + i * 360;
            return (
              <div key={i} style={{position: 'absolute', left: 110, right: 70, top: y - 20}}>
                <div style={{position: 'absolute', left: 22, top: 4, width: 44, height: 44, borderRadius: 44, background: p > 0 ? C.lime : '#1a1a1d', border: `2px solid ${p > 0 ? C.lime : C.faint}`, boxShadow: p > 0 ? '0 0 24px rgba(200,255,62,0.7)' : 'none'}} />
                <div style={{marginLeft: 110}}>
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: p > 0 ? C.lime : C.dim, textTransform: 'uppercase'}}>{s.day}</div>
                  <div style={{marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 16, opacity: m1(p * 2), transform: `translateX(${(1 - m1(p)) * 200}px) scale(${lerp(0.9, 1, m1(p))})`, transformOrigin: '0 50%'}}>
                    <Img src={icon('whatsapp-icon.svg')} style={{width: 64, height: 64, flexShrink: 0}} />
                    <div style={{background: '#005C4B', color: '#E9EDEF', fontFamily: SANS, fontSize: 32, lineHeight: 1.32, padding: '18px 22px', borderRadius: 24, borderTopLeftRadius: 6, maxWidth: 680}}>
                      {s.msg}
                      <div style={{fontSize: 20, color: '#8FD6C7', textAlign: 'right', marginTop: 6}}>sent automatically ✓✓</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* the switch the touch flips */}
          <div style={{position: 'absolute', left: 140, right: 140, top: 1330, display: 'flex', alignItems: 'center', gap: 24, padding: '26px 34px', borderRadius: 40, background: 'rgba(24,24,28,0.96)', boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07) inset', opacity: ap(t, W(72) - 0.3), transform: `translateY(${(1 - ap(t, W(72) - 0.3, 0.5)) * 80}px)`}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 70, height: 70}} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff'}}>Auto follow-up</div>
              <div style={{fontFamily: SANS, fontSize: 26, color: on ? C.lime : C.dim}}>{on ? 'ON · har lead ke liye' : 'OFF'}</div>
            </div>
            <div style={{width: 150, height: 86, borderRadius: 86, background: on ? C.lime : '#3a3a40', position: 'relative', boxShadow: on ? '0 0 30px rgba(200,255,62,0.5)' : 'none'}}>
              <div style={{position: 'absolute', top: 7, left: 7 + knob * 64, width: 72, height: 72, borderRadius: 72, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.35)'}} />
            </div>
          </div>
          <Touch t={t} taps={[{at: toggleAt - 0.5, x: 700, y: 1600}, {at: toggleAt, x: 860, y: 1373}]} show={[toggleAt - 0.8, toggleAt + 0.6]} />
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 5. the reply comes in; the lead is dragged to WON
const Close: React.FC<{t: number}> = ({t}) => {
  const reply = W(79) - 0.1;
  const grab = W(81) - 0.1;
  const drag1 = pt(t, grab + 0.2, W(84), ease.inOut);
  const drag2 = pt(t, W(87) - 0.2, W(88) + 0.15, ease.inOut);
  const cols = [
    {x: 60, t: 'New', c: C.dim},
    {x: 390, t: 'Interested', c: '#FFD84D'},
    {x: 720, t: 'Won', c: C.lime},
  ];
  const cx = drag2 > 0 ? lerp(cols[1].x, cols[2].x, drag2) : lerp(cols[0].x, cols[1].x, drag1);
  const cy = 900 + Math.sin(Math.min(1, drag1 + drag2) * Math.PI) * -30;
  const won = t > W(88) + 0.1;
  const lift = (drag1 > 0 && drag1 < 1) || (drag2 > 0 && drag2 < 1);
  return (
    <Shot t={t} id="close">
      <Backdrop t={t} />
      <Banner t={t} at={reply} y={170} icon={<Img src={icon('whatsapp-icon.svg')} style={{width: 76, height: 76}} />} title="Rahul" body="Haan! Kal aata hoon, slot confirm kar do 👍" />
      {cols.map((c, i) => (
        <div key={c.t} style={{position: 'absolute', left: c.x, top: 520, width: 300, height: 900, borderRadius: 34, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', opacity: ap(t, SC.close[0] + 0.1 + i * 0.08, 0.4)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '26px 24px'}}>
            <div style={{width: 14, height: 14, borderRadius: 14, background: c.c}} />
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.cream}}>{c.t}</span>
          </div>
          {[0, 1].map((k) => (
            <div key={k} style={{margin: '0 18px 16px', height: 110, borderRadius: 22, background: 'rgba(255,255,255,0.05)', marginTop: k === 0 && i === 0 ? 150 : 0}} />
          ))}
        </div>
      ))}
      {/* the lead card */}
      <div style={{position: 'absolute', left: cx + 18, top: cy - (lift ? 16 : 0), width: 264, borderRadius: 24, background: won ? 'rgba(200,255,62,0.12)' : '#1c1c20', border: `2px solid ${won ? C.lime : 'rgba(255,255,255,0.15)'}`, padding: '18px 18px', boxShadow: lift ? '0 40px 70px rgba(0,0,0,0.7)' : '0 12px 30px rgba(0,0,0,0.4)', transform: `rotate(${lift ? 4 : 0}deg) scale(${lift ? 1.06 : 1})`, opacity: ap(t, reply + 0.3, 0.3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Avatar i={2} size={56} />
          <div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#fff'}}>Rahul</div>
            <div style={{fontFamily: SANS, fontSize: 20, color: C.dim}}>replied on Day 7</div>
          </div>
        </div>
        {won && <div style={{marginTop: 12, fontFamily: SANS, fontWeight: 900, fontSize: 24, color: C.ink, background: C.lime, borderRadius: 999, padding: '6px 14px', display: 'inline-block', transform: `scale(${m1(sp(t, W(88) + 0.1, 420, 12))})`}}>DEAL CLOSED ✓</div>}
      </div>
      <Touch t={t} taps={[{at: grab, x: 200, y: 960}, {at: W(84), x: 530, y: 960}, {at: W(87) - 0.2, x: 530, y: 960}, {at: W(88) + 0.15, x: 860, y: 960}]} show={[grab - 0.4, W(88) + 0.5]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center'}}>
        <Words t={t} at={W(85) - 0.05} text="Aap bas deal close karo." stagger={0.07} style={{fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: '-0.035em', color: C.cream}} wordStyle={(w) => (w === 'close' ? limeText : {})} />
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 6. CTA — comment FOLLOW
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
  const WORD = 'FOLLOW';
  const sheet = sp(t, W(92) - 0.2, 220, 24);
  const kb = sp(t, W(93) - 0.25, 260, 26);
  const kStart = W(95) - 0.25;
  const step = 0.11;
  const taps: Tap[] = [{at: W(93) - 0.3, x: 470, y: 1235}, ...WORD.split('').map((ch, i) => {
    const [x, y] = keyPos(ch);
    return {at: kStart + i * step, x, y};
  }), {at: W(96) - 0.05, x: 930, y: 1235}];
  const nTyped = WORD.split('').filter((_, i) => t >= kStart + i * step).length;
  const posted = t >= W(96) - 0.05;
  const post = sp(t, W(96) - 0.05, 320, 22);
  const dm = W(97) + 0.1;
  return (
    <Shot t={t} id="cta">
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, textAlign: 'center', opacity: 1 - ap(t, dm, 0.3)}}>
        <Words t={t} at={W(90) - 0.05} text="Yeh system" stagger={0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.cream, letterSpacing: '-0.04em'}} />
        <Words t={t} at={W(92) - 0.05} text="chahiye?" stagger={0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130}} wordStyle={() => limeText} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 560, bottom: -40, borderRadius: '56px 56px 0 0', background: '#fff', transform: `translateY(${(1 - m1(sheet)) * 1400}px)`, boxShadow: '0 -30px 90px rgba(0,0,0,0.5)'}}>
        <div style={{width: 90, height: 8, borderRadius: 8, background: '#ddd', margin: '18px auto 0'}} />
        <div style={{textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111', marginTop: 16}}>Comments</div>
        <div style={{padding: '22px 36px'}}>
          {[
            {i: 0, n: 'mehta.boutique', c: 'FOLLOW 🙌'},
            {i: 3, n: 'drsharma.clinic', c: 'Yeh humein bhi chahiye'},
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
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#111'}}>FOLLOW</div>
              </div>
            </div>
          )}
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 640, display: 'flex', alignItems: 'center', gap: 16, background: '#F2F2F4', borderRadius: 999, padding: '18px 28px', border: t > W(93) - 0.3 && !posted ? '2px solid #0095F6' : '2px solid transparent'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: nTyped && !posted ? 800 : 500, fontSize: 40, color: nTyped && !posted ? '#111' : '#999'}}>
            {posted || !nTyped ? 'Add a comment…' : WORD.slice(0, nTyped)}
            {!posted && t > W(93) - 0.3 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: nTyped === WORD.length && !posted ? '#0095F6' : '#bbd6f5'}}>Post</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1360, height: 420, background: '#D1D3D9', borderRadius: 30, transform: `translateY(${(1 - m1(kb)) * 600}px)`, opacity: posted ? 1 - pt(t, W(96), W(96) + 0.3) : 1}}>
        {KB.map((row) =>
          row.split('').map((ch) => {
            const [kx, ky] = keyPos(ch);
            const hit = taps.some((p) => p.x === kx && p.y === ky && t >= p.at - 0.02 && t < p.at + 0.1);
            return (
              <div key={ch} style={{position: 'absolute', left: kx - 60 - 33, top: ky - 1360 - 46, width: 66, height: 92, borderRadius: 12, background: hit ? '#9EA3AE' : '#fff', boxShadow: '0 2px 0 rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, color: '#111', transform: hit ? 'translateY(-26px) scale(1.25)' : undefined}}>
                {ch}
              </div>
            );
          }),
        )}
      </div>
      <Touch t={t} taps={taps} show={[W(93) - 0.55, W(96) + 0.3]} />
      <Banner t={t} at={dm} y={80} icon={<AppIcon bg="#0A0A0A"><Img src={staticFile('brand/nx-logo.png')} style={{width: 56, height: 41}} /></AppIcon>} title="Neuraxine" body="Follow-up automation ki details 👇" time="now" />
    </Shot>
  );
};

// ---------------------------------------------------------------- captions: sentence case, a lime bar slides under the spoken word
const CAP_OFF: [number, number][] = [
  [W(6) - 0.1, W(12) - 0.15], // "Aur aapne? Dobara poocha hi nahi." is the graphic
  [W(29) - 0.15, W(40) - 0.15], // the truth line is the graphic
  [W(85) - 0.15, W(90) - 0.15], // "Aap bas deal close karo." is on screen
  [W(90) - 0.15, edit.speech],
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
const ACCENT = new Set(['followup', 'automation', 'whatsapp', 'automatically', 'lead', 'reply', 'close', 'yaad', 'sahi']);
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
          <InstaMark size={50} /> Comment <span style={{fontWeight: 900, ...limeText}}>&ldquo;FOLLOW&rdquo;</span> for details
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
      <Forget t={t} />
      <Truth t={t} />
      <System t={t} />
      <Close t={t} />
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
