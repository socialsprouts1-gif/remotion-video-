import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND} from '../config';
import {B} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, pt, win} from '../lib/anim';
import {Icon} from './Icons';
import {startPoint} from './Dial';

export const CHAT = {x: 540, y: 1090, w: 860, h: 860};

type Msg = {side: 'in' | 'out'; at: number; lines: string[]; time: string; h: number; booked?: boolean};
const MSGS: Msg[] = [
  {side: 'in', at: B.msgIn, lines: ['Hi! Are you open tomorrow?', "I'd like to book."], time: '2:14 AM', h: 134},
  {side: 'out', at: B.aiReply, lines: ["Yes, we're open! I have", '10:30 AM or 4:00 PM.', 'Which works for you?'], time: '2:14 AM', h: 176},
  {side: 'in', at: B.custReply, lines: ['10:30 please!'], time: '2:15 AM', h: 92},
  {side: 'out', at: B.booked, lines: ['Appointment booked', 'Wed · 10:30 AM'], time: '2:15 AM', h: 130, booked: true},
];

/** A WhatsApp-style conversation where the business side is answered by the AI. */
export const Chat: React.FC<{t: number}> = ({t}) => {
  if (t < B.chatRise[0] || t > B.toDial[1]) return null;
  const rise = pt(t, B.chatRise[0], B.chatRise[1]);
  const wake = pt(t, B.wake, B.wake + 0.6);
  const sleepDim = pt(t, B.dim[0], B.dim[1]) * (1 - wake);
  // collapse into a single lime point on the dial
  const go = pt(t, B.toDial[0], B.toDial[0] + 1.0, ease.inOut);
  const top = CHAT.y - CHAT.h / 2;
  let y = 150;

  return (
    <div
      style={{
        position: 'absolute',
        left: CHAT.x - CHAT.w / 2,
        top,
        width: CHAT.w,
        height: CHAT.h,
        transform: `translateY(${(1 - rise) * 220}px) scale(${lerp(0.92, 1, rise) * lerp(1, 0.03, go)})`,
        // collapses onto the 2:14 AM point of the dial
        transformOrigin: `${((startPoint().x - (CHAT.x - CHAT.w / 2)) / CHAT.w) * 100}% ${((startPoint().y - (CHAT.y - CHAT.h / 2)) / CHAT.h) * 100}%`,
        opacity: rise * (1 - pt(t, B.toDial[0] + 0.6, B.toDial[0] + 1.0)),
        filter: `brightness(${1 - sleepDim * 0.5}) blur(${(1 - rise) * 10 + go * 6}px)`,
        borderRadius: 44,
        background: 'linear-gradient(180deg, rgba(20,24,22,0.92), rgba(10,13,11,0.94))',
        border: '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: `0 50px 120px rgba(0,0,0,0.7), 0 0 ${80 * wake}px rgba(${C.limeRGB},${0.12 * wake})`,
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      {/* header */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px'}}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 72,
            overflow: 'hidden',
            border: `2.5px solid ${wake > 0 ? `rgba(${C.limeRGB},${0.3 + 0.7 * wake})` : 'rgba(255,255,255,0.18)'}`,
            boxShadow: `0 0 ${30 * wake}px rgba(${C.limeRGB},${0.5 * wake})`,
            background: '#000',
            flex: 'none',
          }}
        >
          <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)', filter: `grayscale(${1 - wake})`}} />
        </div>
        <div>
          <div style={{fontSize: 30, fontWeight: 600, color: C.white}}>Your Business</div>
          <div style={{position: 'relative', height: 30, fontSize: 21, fontWeight: 500}}>
            <span style={{position: 'absolute', whiteSpace: 'nowrap', color: C.grey, opacity: 1 - wake}}>last seen 11:02 PM</span>
            <span style={{position: 'absolute', whiteSpace: 'nowrap', color: C.lime, opacity: wake, display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{width: 9, height: 9, borderRadius: 9, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
              AI assistant · online
            </span>
          </div>
        </div>
      </div>

      {/* thread */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0}}>
        {MSGS.map((m, i) => {
          const myY = y;
          y += m.h + 24;
          const typingSlot = i === 1;
          const typing = typingSlot ? win(t, B.aiTyping[0], B.aiTyping[1], 0.15, 0.1) : 0;
          const p = pt(t, m.at, m.at + 0.45);
          const right = m.side === 'out';
          return (
            <React.Fragment key={i}>
              {typing > 0 && (
                <div style={{position: 'absolute', top: myY, right: 40, width: 128, height: 66, borderRadius: 30, background: `rgba(${C.limeRGB},0.12)`, opacity: typing, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
                  {[0, 1, 2].map((k) => (
                    <span key={k} style={{width: 12, height: 12, borderRadius: 12, background: C.lime, transform: `translateY(${-7 * Math.max(0, Math.sin(t * 9 - k * 0.9))}px)`}} />
                  ))}
                </div>
              )}
              {p > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: myY,
                    [right ? 'right' : 'left']: 40,
                    maxWidth: 600,
                    padding: m.booked ? '20px 30px 18px 22px' : '20px 28px 14px',
                    borderRadius: 30,
                    [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 8,
                    background: m.booked ? `rgba(${C.limeRGB},0.14)` : right ? `rgba(${C.limeRGB},0.1)` : 'rgba(255,255,255,0.08)',
                    border: m.booked ? `2px solid ${C.lime}` : `1px solid ${right ? `rgba(${C.limeRGB},0.25)` : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: m.booked ? `0 0 40px rgba(${C.limeRGB},0.25)` : undefined,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 26}px) scale(${lerp(0.9, 1, p)})`,
                    transformOrigin: right ? '100% 100%' : '0% 100%',
                    display: 'flex',
                    gap: 18,
                    alignItems: 'center',
                  }}
                >
                  {m.booked && (
                    <div style={{width: 58, height: 58, borderRadius: 58, background: C.lime, display: 'grid', placeItems: 'center', flex: 'none', transform: `scale(${pt(t, m.at + 0.15, m.at + 0.5)})`}}>
                      <Icon name="check" size={34} color="#050605" stroke={3} />
                    </div>
                  )}
                  <div>
                    {m.lines.map((l, k) => (
                      <div key={k} style={{fontSize: m.booked && k === 0 ? 30 : 29, fontWeight: m.booked && k === 0 ? 700 : 500, color: m.booked && k === 1 ? C.lime : C.white, lineHeight: 1.42, whiteSpace: 'nowrap'}}>
                        {l}
                      </div>
                    ))}
                    <div style={{fontSize: 17, color: C.grey, textAlign: 'right', marginTop: 2}}>
                      {m.time}
                      {right && <span style={{color: C.lime, marginLeft: 8}}>✓✓</span>}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
