import React from 'react';
import {continueRender, delayRender, spring, staticFile} from 'remotion';

export const C = {
  lime: '#B6F23A',
  limeDeep: '#7DBA12',
  wa: '#25D366',
  red: '#FF4D5E',
  ink: '#0B0F0D',
  glass: 'rgba(14,18,16,0.86)',
  line: 'rgba(255,255,255,0.12)',
  white: '#FFFFFF',
  dim: 'rgba(255,255,255,0.62)',
  inBubble: '#262D31',
  outBubble: '#0B5C4B',
};
export const FONT = 'Poppins, "Liberation Sans", sans-serif';

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  Promise.all(
    ['500', '600', '700', '800'].map((w) => {
      const f = new FontFace('Poppins', `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)}) format('woff2')`, {weight: w});
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};

/** Springy 0→1 (slight overshoot) starting at time `at` (s). */
export const pop = (t: number, at: number, stiffness = 190, damping = 15) =>
  t < at ? 0 : spring({frame: (t - at) * 30, fps: 30, config: {stiffness, damping, mass: 0.8}});

export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: C.glass,
      border: `1.5px solid ${C.line}`,
      borderRadius: 34,
      boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
      backdropFilter: 'blur(14px)',
      fontFamily: FONT,
      color: C.white,
      ...style,
    }}
  >
    {children}
  </div>
);

export const WaIcon: React.FC<{size?: number}> = ({size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={22} fill={C.wa} />
    <path d="M14 35 L16.2 28.6 A11 11 0 1 1 20.4 32.6 Z" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinejoin="round" />
    <path d="M19.5 19.5 q0.6 -1.6 1.8 -1.2 l1.4 2.6 q0.2 0.7 -0.6 1.4 q1.4 2.8 4 4 q0.7 -0.8 1.4 -0.6 l2.6 1.4 q0.4 1.2 -1.2 1.8 q-5.6 0.6 -9.4 -9.4 Z" fill="#fff" />
  </svg>
);

export const Check: React.FC<{size?: number; color?: string; p?: number}> = ({size = 40, color = C.lime, p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={19} fill={color} opacity={0.18} />
    <circle cx={20} cy={20} r={19} fill="none" stroke={color} strokeWidth={2.5} />
    <path d="M11 20.5 L17.5 27 L29.5 13.5" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </svg>
);

export const Cross: React.FC<{size?: number; p?: number}> = ({size = 40, p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={19} fill={C.red} opacity={0.18} />
    <circle cx={20} cy={20} r={19} fill="none" stroke={C.red} strokeWidth={2.5} />
    <path d="M13 13 L27 27 M27 13 L13 27" stroke={C.red} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </svg>
);

/** WhatsApp-style chat bubble. */
export const Bubble: React.FC<{side: 'in' | 'out'; p: number; time?: string; tag?: React.ReactNode; children: React.ReactNode; dim?: number}> = ({side, p, time = '', tag, children, dim = 0}) => (
  <div style={{display: 'flex', justifyContent: side === 'in' ? 'flex-start' : 'flex-end', opacity: Math.min(1, p * 1.4) * (1 - dim * 0.55)}}>
    <div
      style={{
        maxWidth: '80%',
        background: side === 'in' ? C.inBubble : C.outBubble,
        borderRadius: 26,
        borderTopLeftRadius: side === 'in' ? 6 : 26,
        borderTopRightRadius: side === 'out' ? 6 : 26,
        padding: '16px 24px 12px',
        fontSize: 31,
        fontWeight: 500,
        lineHeight: 1.3,
        transform: `scale(${0.6 + 0.4 * p})`,
        transformOrigin: side === 'in' ? '0% 0%' : '100% 0%',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      }}
    >
      {tag && <div style={{marginBottom: 6}}>{tag}</div>}
      {children}
      <div style={{fontSize: 19, color: C.dim, textAlign: 'right', marginTop: 4}}>
        {time} {side === 'out' && <span style={{color: '#53BDEB'}}>✓✓</span>}
      </div>
    </div>
  </div>
);

export const Chip: React.FC<{color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({color = C.lime, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: color, color: C.ink, fontWeight: 800, fontSize: 22, letterSpacing: '0.06em', ...style}}>{children}</span>
);
