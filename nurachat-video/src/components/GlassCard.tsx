import React from 'react';
import {C, SHADOW} from '../theme';

type Props = {
  children?: React.ReactNode;
  radius?: number;
  glow?: number; // 0..1 lime edge glow
  padding?: number | string;
  style?: React.CSSProperties;
  strong?: boolean;
};

/** Frosted dark glass: translucent fill, hairline border, top sheen, deep soft shadow. */
export const GlassCard: React.FC<Props> = ({children, radius = 32, glow = 0, padding = 0, style, strong}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: radius,
      padding,
      background: `linear-gradient(180deg, ${strong ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)'} 0%, rgba(255,255,255,0.025) 100%)`,
      border: `1px solid ${glow > 0 ? `rgba(194,255,61,${0.2 + 0.55 * glow})` : C.stroke}`,
      boxShadow: `${SHADOW.card}${glow > 0 ? `, 0 0 ${50 * glow}px rgba(194,255,61,${0.28 * glow})` : ''}, inset 0 1px 0 rgba(255,255,255,0.08)`,
      backdropFilter: 'blur(28px) saturate(140%)',
      WebkitBackdropFilter: 'blur(28px) saturate(140%)',
      ...style,
    }}
  >
    {children}
  </div>
);
