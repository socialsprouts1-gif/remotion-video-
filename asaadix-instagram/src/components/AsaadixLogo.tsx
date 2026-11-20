import React from 'react';
import {C, F} from '../theme';

/** The Asaadix "A" mark, redrawn in vector from the brand's avatar: a gold A with a sweeping crossbar. */
export const AMark: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <svg width={size} height={size * 0.82} viewBox="0 0 120 98" style={style}>
    <defs>
      <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F2D58A" />
        <stop offset="0.5" stopColor={C.gold} />
        <stop offset="1" stopColor={C.goldDeep} />
      </linearGradient>
    </defs>
    <path d="M60 4 L104 94 H84 L60 42 L36 94 H16 Z" fill="url(#ag)" />
    <path d="M10 70 C 40 58, 78 56, 116 62 C 84 64, 52 70, 26 82 Z" fill="url(#ag)" />
  </svg>
);

/** Full lockup: mark over ASAADIX / D I G I T A L. `dark` = on a dark background. */
export const AsaadixLogo: React.FC<{size?: number; dark?: boolean; style?: React.CSSProperties}> = ({size = 1, dark, style}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
    <AMark size={150 * size} />
    <div style={{marginTop: 14 * size, fontFamily: F.display, fontWeight: 800, fontSize: 96 * size, letterSpacing: '0.06em', color: dark ? C.cream : C.ink, lineHeight: 1}}>ASAADIX</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 16 * size, marginTop: 10 * size}}>
      <span style={{width: 60 * size, height: 2, background: C.gold}} />
      <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 30 * size, letterSpacing: '0.62em', marginRight: '-0.62em', color: C.gold}}>DIGITAL</span>
      <span style={{width: 60 * size, height: 2, background: C.gold}} />
    </div>
  </div>
);
