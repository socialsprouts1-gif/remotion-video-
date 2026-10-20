import React from 'react';
import {Img, spring, staticFile} from 'remotion';
import {ease, lerp, pt} from '../lib/anim';

// ------------------------------------------------------------------ look
export const K = {
  cream: '#F6F1E8',
  halo: '#FCF9F3',
  ink: '#151A3B',
  inkSoft: '#5F6478',
  violet: '#6D3BFF',
  violet2: '#9B4DFF',
  green: '#13B05B',
  wa: '#25D366',
  red: '#E8365D',
  orange: '#F2762E',
  sun: '#FFE9A6',
  night1: '#0B1A4D',
  night2: '#1C2D78',
  card: '#FFFFFF',
};
export const FONT = '"Poppins", system-ui, sans-serif';
export const FPS = 30;

/** Springy pop 0→1 (slight overshoot), starting at time `at` (s). */
export const pop = (t: number, at: number, stiff = 170, damp = 13) =>
  t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness: stiff, damping: damp, mass: 0.8}});

/** Fade-out multiplier for a scene element leaving at `out`. */
export const leave = (t: number, out: number, dur = 0.3) => 1 - pt(t, out - dur, out, ease.in);

// ------------------------------------------------------------------ type
const parse = (line: string) => {
  let acc = false;
  return line.split(' ').map((w) => {
    let s = w;
    let a = acc;
    if (s.startsWith('*')) {
      a = acc = true;
      s = s.slice(1);
    }
    if (s.endsWith('*')) {
      acc = false;
      s = s.slice(0, -1);
    }
    return {s, a};
  });
};

/** Kicker line + big two-tone headline, words rising through masks. Auto-sizes long lines to fit 980px. */
export const Headline: React.FC<{
  t: number;
  at: number;
  out: number;
  kicker?: string;
  lines: string[];
  sub?: string;
  accent?: string;
  ink?: string;
  kickerColor?: string;
  top?: number;
  size?: number;
}> = ({t, at, out, kicker, lines, sub, accent = K.violet, ink = K.ink, kickerColor = K.inkSoft, top = 150, size = 118}) => {
  const o = leave(t, out, 0.35);
  if (t < at - 0.05 || o <= 0) return null;
  let i = 0;
  const kp = pt(t, at, at + 0.45, ease.out);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT, opacity: o, transform: `translateY(${(1 - o) * -20}px)`}}>
      {kicker && <div style={{fontSize: 44, fontWeight: 600, color: kickerColor, opacity: kp, transform: `translateY(${(1 - kp) * 16}px)`, marginBottom: 6}}>{kicker}</div>}
      {lines.map((line, li) => {
        const len = line.replace(/\*/g, '').length;
        const fs = Math.min(size, 980 / (len * 0.6));
        return (
          <div key={li} style={{fontSize: fs, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', color: ink, whiteSpace: 'nowrap'}}>
            {parse(line).map((w, wi) => {
              const p = pt(t, at + 0.12 + i++ * 0.07, at + 0.62 + (i - 1) * 0.07, ease.out);
              return (
                <span key={wi} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0 0.04em 0.08em', margin: '0 0.1em -0.08em'}}>
                  <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, color: w.a ? accent : undefined}}>{w.s}</span>
                </span>
              );
            })}
          </div>
        );
      })}
      {sub && <div style={{fontSize: 42, fontWeight: 600, color: ink, marginTop: 10, opacity: pt(t, at + 0.5, at + 0.9)}}>{sub}</div>}
    </div>
  );
};

/** Dark caption box at the bottom, like a burned-in subtitle. */
export const Caption: React.FC<{t: number; at: number; out: number; text: string; dark?: boolean}> = ({t, at, out, text, dark}) => {
  const a = pt(t, at + 0.15, at + 0.45) * leave(t, out, 0.25);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{maxWidth: 660, padding: '16px 30px', borderRadius: 22, background: dark ? 'rgba(255,255,255,0.12)' : K.ink, color: '#fff', fontFamily: FONT, fontSize: 34, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', boxShadow: '0 14px 40px rgba(21,26,59,0.25)'}}>
        {text}
      </div>
    </div>
  );
};

export const LogoTile: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, overflow: 'hidden', background: '#000', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', ...style}}>
    <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%', transform: 'scale(1.55)'}} />
  </div>
);

// ------------------------------------------------------------------ phone
export const Phone: React.FC<{w?: number; h?: number; time?: string; children?: React.ReactNode; screen?: string; style?: React.CSSProperties}> = ({
  w = 470,
  h = 940,
  time = '11:02',
  children,
  screen = '#EEF0F6',
  style,
}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 74, background: '#1A1F3C', padding: 16, boxShadow: '0 40px 80px rgba(21,26,59,0.28), inset 0 0 0 3px #2C3360', ...style}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 60, background: screen, overflow: 'hidden', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 30, top: 22, fontSize: 22, fontWeight: 700, color: screen === '#EEF0F6' ? K.ink : '#fff'}}>{time}</div>
      <div style={{position: 'absolute', left: '50%', top: 18, width: 130, height: 34, marginLeft: -65, borderRadius: 34, background: '#0B0E1F'}} />
      {children}
    </div>
  </div>
);

export const ChatHeader: React.FC<{name: string; sub: string; logo?: boolean}> = ({name, sub, logo}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 96, background: '#fff', display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', borderBottom: '1px solid #E3E5EE'}}>
    {logo ? <LogoTile size={58} style={{borderRadius: 58}} /> : <div style={{width: 58, height: 58, borderRadius: 58, background: '#FFD6E0', display: 'grid', placeItems: 'center', fontWeight: 800, color: K.red, fontSize: 26}}>P</div>}
    <div>
      <div style={{fontSize: 25, fontWeight: 700, color: K.ink}}>{name}</div>
      <div style={{fontSize: 18, fontWeight: 600, color: K.green}}>{sub}</div>
    </div>
  </div>
);

export const Bubble: React.FC<{side: 'in' | 'out'; p: number; children: React.ReactNode; tone?: 'plain' | 'brand' | 'ok'; top: number; time?: string}> = ({side, p, children, tone = 'plain', top, time}) => {
  if (p <= 0) return null;
  const right = side === 'out';
  const bg = tone === 'brand' ? K.ink : tone === 'ok' ? K.green : '#fff';
  return (
    <div
      style={{
        position: 'absolute',
        top,
        [right ? 'right' : 'left']: 22,
        maxWidth: 340,
        padding: '16px 20px 10px',
        borderRadius: 24,
        [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 6,
        background: bg,
        color: tone === 'plain' ? K.ink : '#fff',
        fontSize: 23,
        fontWeight: 600,
        lineHeight: 1.35,
        boxShadow: '0 6px 18px rgba(21,26,59,0.12)',
        transform: `scale(${p})`,
        transformOrigin: right ? '100% 100%' : '0% 100%',
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {children}
      {time && <div style={{fontSize: 15, opacity: 0.6, textAlign: 'right', marginTop: 4}}>{time}</div>}
    </div>
  );
};

export const Badge: React.FC<{p: number; text: string; color?: string; style?: React.CSSProperties}> = ({p, text, color = K.red, style}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', padding: '12px 24px', borderRadius: 999, background: color, color: '#fff', fontFamily: FONT, fontSize: 28, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: `0 10px 26px ${color}66`, transform: `scale(${p}) rotate(-3deg)`, ...style}}>
      {text}
    </div>
  );

// ------------------------------------------------------------------ illustrations
export const Person: React.FC<{color: string; x: number; y: number; s?: number; o?: number}> = ({color, x, y, s = 1, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70 * s, height: 130 * s, opacity: o}}>
    <div style={{position: 'absolute', left: 17 * s, top: 0, width: 36 * s, height: 36 * s, borderRadius: 99, background: color}} />
    <div style={{position: 'absolute', left: 4 * s, top: 42 * s, width: 62 * s, height: 86 * s, borderRadius: `${30 * s}px ${30 * s}px ${10 * s}px ${10 * s}px`, background: color}} />
  </div>
);

/** Flat front desk: pendant lamp, OPEN/CLOSED sign, counter with bell and monitor. */
export const Desk: React.FC<{lampOn: number; closed: number; zzz: number; t: number}> = ({lampOn, closed, zzz, t}) => (
  <div style={{position: 'relative', width: 760, height: 720, fontFamily: FONT}}>
    {/* back wall */}
    <div style={{position: 'absolute', left: 40, top: 120, width: 680, height: 420, borderRadius: 36, background: lerp(1, 0, closed) > 0.5 ? '#EDE6DA' : '#D9D2C6'}} />
    {/* lamp */}
    <div style={{position: 'absolute', left: 378, top: 0, width: 4, height: 110, background: '#3B4166'}} />
    <div style={{position: 'absolute', left: 320, top: 104, width: 120, height: 56, borderRadius: '60px 60px 12px 12px', background: K.ink}} />
    <div style={{position: 'absolute', left: 230, top: 158, width: 300, height: 360, opacity: 0.55 * lampOn, background: `linear-gradient(180deg, ${K.sun}, rgba(255,233,166,0))`, clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)'}} />
    <div style={{position: 'absolute', left: 362, top: 150, width: 36, height: 22, borderRadius: 22, background: lampOn > 0.5 ? K.sun : '#6A6F88', boxShadow: lampOn > 0.5 ? `0 0 40px ${K.sun}` : undefined}} />
    {/* sign */}
    <div style={{position: 'absolute', left: 90, top: 190, width: 190, height: 96, perspective: 600}}>
      <div style={{position: 'absolute', left: 40, top: -30, width: 3, height: 34, background: '#3B4166', transform: 'rotate(-25deg)'}} />
      <div style={{position: 'absolute', left: 145, top: -30, width: 3, height: 34, background: '#3B4166', transform: 'rotate(25deg)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: closed > 0.5 ? K.red : K.green, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 800, letterSpacing: '0.1em', transform: `rotateY(${Math.sin(closed * Math.PI) * 90}deg)`, boxShadow: '0 10px 20px rgba(0,0,0,0.15)'}}>
        {closed > 0.5 ? 'CLOSED' : 'OPEN'}
      </div>
    </div>
    {/* monitor */}
    <div style={{position: 'absolute', left: 470, top: 300, width: 170, height: 118, borderRadius: 16, background: K.ink, padding: 10}}>
      <div style={{width: '100%', height: '100%', borderRadius: 8, background: closed > 0.5 ? '#2A3052' : '#E8FFF1', display: 'grid', placeItems: 'center'}}>
        {closed < 0.5 && <div style={{width: 46, height: 46, borderRadius: 46, background: K.wa, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 24}}>✓</div>}
      </div>
    </div>
    <div style={{position: 'absolute', left: 545, top: 418, width: 20, height: 26, background: K.ink}} />
    {/* bell */}
    <div style={{position: 'absolute', left: 170, top: 400, width: 90, height: 48, borderRadius: '50px 50px 6px 6px', background: '#F2B33D'}} />
    <div style={{position: 'absolute', left: 160, top: 444, width: 110, height: 10, borderRadius: 6, background: '#C98A1A'}} />
    {/* counter */}
    <div style={{position: 'absolute', left: 0, top: 452, width: 760, height: 40, borderRadius: 14, background: K.violet}} />
    <div style={{position: 'absolute', left: 30, top: 490, width: 700, height: 220, borderRadius: '0 0 24px 24px', background: '#FFFFFF', boxShadow: '0 30px 60px rgba(21,26,59,0.15)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontSize: 40, fontWeight: 800, color: K.ink, letterSpacing: '0.08em'}}>FRONT DESK</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 124, textAlign: 'center', fontSize: 24, fontWeight: 600, color: K.inkSoft}}>your WhatsApp</div>
    </div>
    {/* Zzz */}
    {zzz > 0 &&
      ['Z', 'z', 'z'].map((z, i) => (
        <div key={i} style={{position: 'absolute', left: 430 + i * 46, top: 250 - i * 50 - ((t * 30) % 20), fontSize: 64 - i * 12, fontWeight: 800, color: K.violet, opacity: zzz * (0.5 + 0.5 * Math.sin(t * 3 + i))}}>
          {z}
        </div>
      ))}
  </div>
);

export const Store: React.FC<{dim?: number}> = ({dim = 0}) => (
  <svg width={110} height={96} viewBox="0 0 110 96" style={{filter: dim ? `grayscale(${dim})` : undefined, opacity: 1 - dim * 0.5}}>
    <rect x="10" y="34" width="90" height="56" rx="8" fill="#fff" stroke={K.ink} strokeWidth="4" />
    <path d="M6 34 L16 8 H94 L104 34 Z" fill={K.violet} stroke={K.ink} strokeWidth="4" strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${16 + i * 22} 34 v8 a11 11 0 0 0 22 0 v-8`} fill={i % 2 ? '#fff' : K.violet} stroke={K.ink} strokeWidth="3" />
    ))}
    <rect x="62" y="56" width="24" height="34" rx="3" fill={K.ink} />
    <rect x="22" y="56" width="30" height="20" rx="3" fill="#CFE3FF" stroke={K.ink} strokeWidth="3" />
  </svg>
);

export const FIcon: React.FC<{name: string; color: string; size?: number}> = ({name, color, size = 46}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {name === 'ai' && (
      <>
        <path d="M4 5h16v11H9l-5 4z" fill={color} stroke="#fff" />
        <path d="M12 8l.9 2.1L15 11l-2.1.9L12 14l-.9-2.1L9 11l2.1-.9z" fill="#fff" stroke="none" />
      </>
    )}
    {name === 'repeat' && (
      <>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V9a3 3 0 0 1 3-3h15" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v2a3 3 0 0 1-3 3H3" />
      </>
    )}
    {name === 'calendar' && (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <path d="M8.5 15l2.2 2.2 4.8-4.7" />
      </>
    )}
  </svg>
);

export const FeatureCard: React.FC<{f: {title: string; sub: string; tag: string; color: string; icon: string}; p: number; dim: number}> = ({f, p, dim}) => (
  <div
    style={{
      width: 900,
      height: 140,
      borderRadius: 30,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      padding: '0 30px',
      boxShadow: `0 20px 50px rgba(21,26,59,${0.16 * (1 - dim * 0.6)})`,
      border: `2px solid ${dim > 0.5 ? 'transparent' : f.color + '33'}`,
      opacity: Math.min(1, p * 1.4) * (1 - dim * 0.55),
      transform: `translateY(${(1 - p) * 60}px) scale(${lerp(0.9, 1, Math.min(1, p))})`,
      fontFamily: FONT,
    }}
  >
    <div style={{width: 84, height: 84, borderRadius: 24, background: f.color, display: 'grid', placeItems: 'center', flex: 'none', filter: dim > 0.5 ? 'saturate(0.4)' : undefined}}>
      <FIcon name={f.icon} color={f.color} />
    </div>
    <div style={{flex: 1}}>
      <div style={{fontSize: 38, fontWeight: 800, color: K.ink}}>{f.title}</div>
      <div style={{fontSize: 24, fontWeight: 500, color: K.inkSoft}}>{f.sub}</div>
    </div>
    <div style={{padding: '10px 18px', borderRadius: 14, background: f.color, color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em'}}>{f.tag}</div>
  </div>
);
