import React from 'react';
import {C, F} from '../theme';
import {GlassCard} from './GlassCard';
import {Icon} from './Icons';

type Props = {name: string; text: string; time?: string; width?: number; style?: React.CSSProperties};

/** Lock-screen style incoming-message notification. Generic chat glyph, no third-party logo. */
export const NotificationCard: React.FC<Props> = ({name, text, time = 'now', width = 820, style}) => (
  <GlassCard radius={34} strong padding="24px 28px" style={{width, display: 'flex', gap: 24, alignItems: 'center', ...style}}>
    <div
      style={{
        width: 76,
        height: 76,
        flex: 'none',
        borderRadius: 22,
        background: `linear-gradient(160deg, #3BE07A, #13A84E)`,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 6px 18px rgba(37,211,102,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <Icon name="chat" size={44} color="#fff" stroke={2} />
    </div>
    <div style={{flex: 1, minWidth: 0, fontFamily: F.body}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: C.grey, fontWeight: 600, letterSpacing: '0.04em'}}>
        <span>WHATSAPP</span>
        <span style={{fontWeight: 500, letterSpacing: 0}}>{time}</span>
      </div>
      <div style={{fontSize: 34, fontWeight: 700, color: C.white, marginTop: 4}}>{name}</div>
      <div style={{fontSize: 32, fontWeight: 500, color: 'rgba(244,247,241,0.82)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {text}
      </div>
    </div>
  </GlassCard>
);
