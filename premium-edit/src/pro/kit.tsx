import React from 'react';
import {spring} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {C, FONT} from '../ui';
import edit from '../edit.json';

export {C, FONT};
export type Word = {w: string; s: number; e: number; k: boolean; take: number; i: number};
export const WORDS = edit.words as Word[];
/** Edit time of word i (global index). */
export const ws = (i: number) => WORDS[i]?.s ?? 1e9;

export const sp = (t: number, at: number, stiffness = 170, damping = 16, mass = 0.8) =>
  t < at ? 0 : spring({frame: (t - at) * 30, fps: 30, config: {stiffness, damping, mass}});

/** Motion blur proportional to how fast a value moves (px/frame → px blur). */
export const mblur = (f: (t: number) => number, t: number, k = 0.35, max = 22) => Math.min(max, Math.abs(f(t) - f(t - 1 / 30)) * k);

// ---------------------------------------------------------------- backgrounds

/** Deep green-black stage: drifting glow, perspective grid floor, slow dust. */
export const Stage: React.FC<{t: number; hue?: 'lime' | 'red' | 'grey'; grid?: boolean; glowY?: number}> = ({t, hue = 'lime', grid = true, glowY = 45}) => {
  const g = hue === 'lime' ? '182,242,58' : hue === 'red' ? '255,77,94' : '160,170,165';
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: hue === 'grey' ? '#0b0d0c' : '#050806'}}>
      <div style={{position: 'absolute', left: -300, right: -300, top: `${glowY - 35}%`, height: '70%', background: `radial-gradient(ellipse at ${50 + Math.sin(t * 0.7) * 8}% 50%, rgba(${g},0.22) 0%, rgba(${g},0.06) 35%, transparent 65%)`}} />
      {grid && (
        <div style={{position: 'absolute', left: -540, right: -540, bottom: -200, height: 1100, perspective: 700, overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateX(68deg)',
              transformOrigin: '50% 100%',
              backgroundImage: `linear-gradient(rgba(${g},0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(${g},0.22) 2px, transparent 2px)`,
              backgroundSize: '120px 120px',
              backgroundPosition: `0 ${(t * 140) % 120}px`,
              maskImage: 'linear-gradient(to top, #000 10%, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to top, #000 10%, transparent 85%)',
            }}
          />
        </div>
      )}
      {Array.from({length: 26}, (_, i) => {
        const x = rand(i * 3.3) * 1080;
        const y = (((rand(i * 7.1) * 2100 - t * (20 + rand(i) * 40)) % 2100) + 2100) % 2100 - 100;
        const s = 2 + rand(i * 1.9) * 4;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: `rgba(${g},0.7)`, opacity: 0.25 + 0.5 * rand(i * 5.5), boxShadow: `0 0 ${s * 4}px rgba(${g},0.6)`}} />;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- phone

export const Phone: React.FC<{x?: number; y?: number; w?: number; rx?: number; ry?: number; rz?: number; scale?: number; children: React.ReactNode; glow?: number; blur?: number}> = ({
  x = 540,
  y = 900,
  w = 560,
  rx = 0,
  ry = 0,
  rz = 0,
  scale = 1,
  children,
  glow = 0.4,
  blur = 0,
}) => {
  const h = w * 2.05;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 1600, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          borderRadius: w * 0.15,
          background: 'linear-gradient(145deg, #3a3f3c, #0d0f0e 40%, #1d211f)',
          padding: w * 0.03,
          boxShadow: `0 60px 120px rgba(0,0,0,0.7), 0 0 140px rgba(182,242,58,${glow * 0.45}), -6px -6px 0 rgba(182,242,58,${glow * 0.25}), inset 0 0 0 2px rgba(255,255,255,0.18)`,
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.125, overflow: 'hidden', background: '#111B21', fontFamily: FONT, color: '#E9EDEF'}}>
          {children}
          <div style={{position: 'absolute', left: '50%', top: w * 0.025, width: w * 0.3, height: w * 0.06, marginLeft: -w * 0.15, borderRadius: 99, background: '#000'}} />
          {/* glass reflection */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 28%, transparent 70%, rgba(255,255,255,0.05) 100%)', pointerEvents: 'none'}} />
        </div>
      </div>
    </div>
  );
};

export const WaHeader: React.FC<{name: string; status: string; w?: number}> = ({name, status}) => (
  <div style={{height: 170, display: 'flex', alignItems: 'center', gap: 18, padding: '62px 24px 0', background: '#1F2C34'}}>
    <div style={{fontSize: 34, color: '#AEBAC1'}}>‹</div>
    <div style={{width: 74, height: 74, borderRadius: 74, background: 'linear-gradient(135deg,#6a7b83,#33403f)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 28}}>{name[0]}</div>
    <div>
      <div style={{fontSize: 36, fontWeight: 600}}>{name}</div>
      <div style={{fontSize: 25, color: status.includes('typing') ? '#25D366' : '#8696A0'}}>{status}</div>
    </div>
  </div>
);

/** WhatsApp wallpaper tone + messages column anchored at the bottom. */
export const ChatBody: React.FC<{children: React.ReactNode; scroll?: number}> = ({children, scroll = 0}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 170, bottom: 0, background: '#0B141A', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '34px 34px'}} />
    <div style={{position: 'absolute', left: 18, right: 18, top: 36 - scroll, display: 'flex', flexDirection: 'column', gap: 18}}>{children}</div>
  </div>
);

export const Msg: React.FC<{side: 'in' | 'out'; p: number; time?: string; tag?: React.ReactNode; children: React.ReactNode; size?: number; grey?: number}> = ({side, p, time = '', tag, children, size = 36, grey = 0}) => {
  if (p <= 0) return null;
  return (
    <div style={{display: 'flex', justifyContent: side === 'in' ? 'flex-start' : 'flex-end', opacity: Math.min(1, p * 1.6) * (1 - grey * 0.4), filter: grey ? `grayscale(${grey})` : undefined}}>
      <div
        style={{
          maxWidth: '84%',
          background: side === 'in' ? '#202C33' : '#005C4B',
          borderRadius: 22,
          borderTopLeftRadius: side === 'in' ? 4 : 22,
          borderTopRightRadius: side === 'out' ? 4 : 22,
          padding: '14px 20px 10px',
          fontSize: size,
          fontWeight: 500,
          lineHeight: 1.32,
          transform: `translateY(${(1 - Math.min(1, p)) * 40}px) scale(${0.7 + 0.3 * p})`,
          transformOrigin: side === 'in' ? '0% 100%' : '100% 100%',
        }}
      >
        {tag && <div style={{marginBottom: 6}}>{tag}</div>}
        {children}
        <div style={{fontSize: 18, color: '#8696A0', textAlign: 'right', marginTop: 2}}>
          {time} {side === 'out' && <Ticks />}
        </div>
      </div>
    </div>
  );
};

export const Ticks: React.FC<{color?: string}> = ({color = '#53BDEB'}) => (
  <svg width={26} height={16} viewBox="0 0 26 16" style={{verticalAlign: 'middle', marginLeft: 4}}>
    <path d="M1 8.5 L5 12.5 L13 3.5 M10 12.5 L18 3.5 M7.5 10 L10 12.5" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Typing: React.FC<{t: number; side?: 'in' | 'out'}> = ({t, side = 'in'}) => (
  <div style={{display: 'flex', justifyContent: side === 'in' ? 'flex-start' : 'flex-end'}}>
    <div style={{background: side === 'in' ? '#202C33' : '#005C4B', borderRadius: 22, padding: '18px 22px', display: 'flex', gap: 8}}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{width: 13, height: 13, borderRadius: 13, background: '#8696A0', transform: `translateY(${-Math.max(0, Math.sin(t * 10 - k * 0.9)) * 6}px)`}} />
      ))}
    </div>
  </div>
);

export const Pill: React.FC<{children: React.ReactNode; color?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, color = C.lime, fg = C.ink, size = 22, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: `${size * 0.3}px ${size * 0.75}px`, borderRadius: 999, background: color, color: fg, fontWeight: 800, fontSize: size, letterSpacing: '0.06em', fontFamily: FONT, ...style}}>{children}</span>
);

// ---------------------------------------------------------------- type

/** Kinetic headline: each word drops in with overshoot, blur and a lime accent on *marked* words. */
export const Kinetic: React.FC<{t: number; at: number; text: string; y: number; size?: number; out?: number; stagger?: number; align?: 'center' | 'left'; x?: number; color?: string}> = ({
  t,
  at,
  text,
  y,
  size = 96,
  out = 1e9,
  stagger = 0.07,
  align = 'center',
  x = 60,
  color = '#fff',
}) => {
  if (t < at) return null;
  const leave = pt(t, out - 0.25, out, ease.in);
  if (leave >= 1) return null;
  const parts = text.split(' ');
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 40 : x, right: 40, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: `0 ${size * 0.26}px`, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.01em', opacity: 1 - leave, transform: `translateY(${-leave * 40}px)`, filter: leave > 0 ? `blur(${leave * 12}px)` : undefined}}>
      {parts.map((w, i) => {
        const p = sp(t, at + i * stagger, 220, 15);
        const accent = w.startsWith('*');
        const word = w.replace(/\*/g, '');
        return (
          <span key={i} style={{display: 'inline-block', color: accent ? C.lime : color, transform: `translateY(${(1 - Math.min(1, p)) * size * 0.8}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2), filter: p < 0.7 ? `blur(${(0.7 - p) * 16}px)` : undefined, textShadow: accent ? '0 0 40px rgba(182,242,58,0.45)' : '0 6px 30px rgba(0,0,0,0.6)'}}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Small tracked label with a lime bar. */
export const Label: React.FC<{t: number; at: number; text: string; y: number; color?: string}> = ({t, at, text, y, color = C.lime}) => {
  const p = pt(t, at, at + 0.5, ease.out);
  return (
    <div style={{position: 'absolute', left: 64, right: 280, top: y, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 700, fontSize: 26, letterSpacing: `${lerp(0.6, 0.32, p)}em`, color, opacity: p}}>
      <div style={{width: 50 * p, height: 3, background: color}} />
      {text}
    </div>
  );
};

// ---------------------------------------------------------------- transitions

export type Tr = 'zoom' | 'iris' | 'slide' | 'flash' | 'glitch';

/** Wrapper style for a full-frame scene entering (pin 1→0) and leaving (pout 0→1). */
export const trStyle = (kind: Tr, pin: number, pout: number): {style: React.CSSProperties; flash: number} => {
  let style: React.CSSProperties = {};
  let flash = 0;
  const k = Math.max(pin, pout);
  if (kind === 'iris') {
    const r = pin > 0 ? (1 - pin) * 150 : (1 - pout) * 150;
    style = {clipPath: `circle(${r}% at 50% 46%)`};
  } else if (kind === 'zoom') {
    style = {transform: `scale(${pin > 0 ? 1 + pin * 0.5 : 1 - pout * 0.3})`, filter: k > 0.02 ? `blur(${k * 26}px)` : undefined, opacity: 1 - Math.max(pin, pout) * 0.9};
  } else if (kind === 'slide') {
    style = {transform: `translateY(${pin * 1920 - pout * 1920}px)`, filter: k > 0.02 ? `blur(${k * 30}px)` : undefined};
  } else if (kind === 'flash') {
    style = {opacity: 1 - Math.max(pin, pout), transform: `scale(${1 + k * 0.1})`};
    flash = Math.sin(Math.min(1, k) * Math.PI) * 0.9;
  } else if (kind === 'glitch') {
    style = {clipPath: k > 0.02 ? `inset(${k * 50}% 0 ${k * 50}% 0)` : undefined, transform: `translateX(${Math.sin(k * 40) * k * 40}px)`};
    flash = k * 0.5;
  }
  return {style, flash};
};
