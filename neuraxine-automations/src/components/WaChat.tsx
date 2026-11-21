import React from 'react';
import {useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {BrandIcon} from './BrandIcon';
import {Logo} from './Phone3D';

// WhatsApp light-mode colours
const WA = {
  header: '#FFFFFF',
  bg: '#EFEAE2',
  out: '#D9FDD3',
  in: '#FFFFFF',
  text: '#111B21',
  meta: '#667781',
  tick: '#53BDEB',
  green: '#00A884',
};

export type WaMsg = {
  at: number; // scene frame
  from: 'in' | 'out';
  text?: string;
  node?: React.ReactNode;
  time: string;
  typingFrom?: number; // show a typing bubble from this frame until `at`
};

const Row: React.FC<{m: WaMsg}> = ({m}) => {
  const frame = useCurrentFrame();
  const typing = m.typingFrom !== undefined && frame >= m.typingFrom && frame < m.at;
  const pin = prog(frame, typing ? m.typingFrom! : m.at, 8, ease.out);
  if (pin <= 0) return null;
  const out = m.from === 'out';
  return (
    <div style={{display: 'grid', gridTemplateRows: `${pin}fr`}}>
      <div style={{minHeight: 0, display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', paddingTop: 10}}>
        <div
          style={{
            maxWidth: '78%',
            background: out ? WA.out : WA.in,
            color: WA.text,
            borderRadius: 14,
            borderTopRightRadius: out ? 4 : 14,
            borderTopLeftRadius: out ? 14 : 4,
            padding: typing ? '16px 22px' : '10px 14px 8px',
            fontFamily: F.body,
            fontWeight: 500,
            fontSize: 27,
            lineHeight: 1.32,
            boxShadow: '0 1px 1px rgba(11,20,26,0.13)',
            opacity: pin,
            transform: `translateY(${(1 - pin) * 16}px) scale(${mix(pin, 0.96, 1)})`,
            transformOrigin: out ? 'right bottom' : 'left bottom',
          }}
        >
          {typing ? (
            <div style={{display: 'flex', gap: 7}}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{width: 10, height: 10, borderRadius: 9, background: WA.meta, opacity: 0.4 + 0.6 * ((Math.sin(frame / 3 - i) + 1) / 2)}} />
              ))}
            </div>
          ) : (
            <>
              {m.node ?? m.text}
              <span style={{float: 'right', marginLeft: 14, marginTop: 10, fontSize: 18, color: WA.meta, display: 'inline-flex', alignItems: 'center', gap: 4}}>
                {m.time}
                {out && (
                  <svg width={20} height={12} viewBox="0 0 26 16">
                    <path d="M1 9l4 4 8-10M10 13l1 0 8-10" stroke={WA.tick} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/** A WhatsApp light-mode chat card: header (business or customer), wallpaper, bubbles that grow in. */
export const WaChat: React.FC<{
  msgs: WaMsg[];
  title: string;
  subtitle?: string;
  brand?: boolean; // header shows the Neuraxine-built business bot
  height?: number;
  style?: React.CSSProperties;
}> = ({msgs, title, subtitle = 'online', brand, height = 760, style}) => (
  <div style={{borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', background: WA.bg, height, display: 'flex', flexDirection: 'column', ...style}}>
    <div style={{background: WA.header, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderBottom: '1px solid #E9EDEF'}}>
      {brand ? (
        <Logo size={62} round />
      ) : (
        <div style={{width: 62, height: 62, borderRadius: 99, background: '#DFE5E7', display: 'grid', placeItems: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 26, color: '#54656F'}}>{title[0]}</div>
      )}
      <div style={{flex: 1}}>
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: WA.text}}>{title}</div>
        <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 20, color: WA.meta}}>{subtitle}</div>
      </div>
      <BrandIcon name="whatsapp" size={44} />
    </div>
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 22px 22px',
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.045) 2px, transparent 2px)',
        backgroundSize: '30px 30px',
      }}
    >
      {msgs.map((m, i) => (
        <Row key={i} m={m} />
      ))}
    </div>
  </div>
);

export {WA};
