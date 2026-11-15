import React from 'react';
import {BRAND, Msg} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Icon} from './Icon';

export const PHONE_W = 700;
export const PHONE_H = 1300;
const FPS = 30;
const fr = (s: number) => s * FPS;

const clock = (at: number) => {
  const m = 41 + Math.floor(at / 6);
  return `6:${String(m).padStart(2, '0')} pm`;
};

const Ticks: React.FC<{read: boolean}> = ({read}) => (
  <svg width={26} height={16} viewBox="0 0 26 16" style={{marginLeft: 6}}>
    <path d="M1 9l4 4 8-10" stroke={read ? C.waBlue : C.waMeta} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    <path d="M10 13l1 0 8-10" stroke={read ? C.waBlue : C.waMeta} strokeWidth={2.2} fill="none" strokeLinecap="round" />
  </svg>
);

const Meta: React.FC<{at: number; out: boolean; t: number}> = ({at, out, t}) => (
  <span
    style={{
      float: 'right',
      marginLeft: 16,
      marginTop: 14,
      marginBottom: -6,
      fontSize: 19,
      color: out ? 'rgba(233,237,239,0.65)' : C.waMeta,
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    {clock(at)}
    {out && <Ticks read={t > at + 0.6} />}
  </span>
);

const Bubble: React.FC<{out: boolean; children: React.ReactNode; agent?: boolean; style?: React.CSSProperties}> = ({
  out,
  children,
  agent,
  style,
}) => (
  <div
    style={{
      alignSelf: out ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
      background: out ? C.waOut : C.waIn,
      color: C.waText,
      borderRadius: 20,
      borderTopRightRadius: out ? 6 : 20,
      borderTopLeftRadius: out ? 20 : 6,
      padding: '14px 20px 14px',
      fontFamily: F.body,
      fontWeight: 500,
      fontSize: 29,
      lineHeight: 1.3,
      boxShadow: '0 2px 2px rgba(0,0,0,0.25)',
      border: agent ? `2px solid rgba(248,198,74,0.55)` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

const Typing: React.FC<{t: number}> = ({t}) => (
  <Bubble out={false} style={{padding: '20px 26px'}}>
    <div style={{display: 'flex', gap: 9}}>
      {[0, 1, 2].map((i) => {
        const k = (Math.sin(t * 9 - i * 0.9) + 1) / 2;
        return <div key={i} style={{width: 13, height: 13, borderRadius: 99, background: C.waMeta, opacity: 0.4 + k * 0.6, transform: `translateY(${-k * 5}px)`}} />;
      })}
    </div>
  </Bubble>
);

const MsgBody: React.FC<{m: Msg; t: number}> = ({m, t}) => {
  if (m.kind === 'typing') return <Typing t={t} />;
  if (m.kind === 'system')
    return (
      <div
        style={{
          alignSelf: 'center',
          background: 'rgba(248,198,74,0.14)',
          border: '1px solid rgba(248,198,74,0.45)',
          color: C.gold,
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 22,
          padding: '10px 20px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          margin: '6px 0',
        }}
      >
        <Icon name="speaking_head" size={28} />
        {m.text}
      </div>
    );
  if (m.kind === 'text') {
    const out = m.from === 'user';
    return (
      <Bubble out={out} agent={m.from === 'agent'}>
        {m.from === 'agent' && (
          <div style={{color: C.gold, fontWeight: 700, fontSize: 22, marginBottom: 4}}>
            {BRAND.agent} · {BRAND.agentRole}
          </div>
        )}
        {m.icon && <Icon name={m.icon} size={32} style={{verticalAlign: '-6px', marginRight: 10}} />}
        {m.text}
        <Meta at={m.at} out={out} t={t} />
      </Bubble>
    );
  }
  if (m.kind === 'video')
    return (
      <Bubble out={false} style={{padding: 8, width: 440}}>
        <div
          style={{
            height: 250,
            borderRadius: 14,
            background: `linear-gradient(135deg, #12304A, #0A1A2B 60%), #0A1A2B`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width={440} height={250} style={{position: 'absolute', inset: 0, opacity: 0.55}}>
            <polyline
              points="0,200 50,180 90,190 140,140 190,155 240,100 290,120 340,70 390,85 440,40"
              fill="none"
              stroke={C.green}
              strokeWidth={5}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 86,
              height: 86,
              marginLeft: -43,
              marginTop: -43,
              borderRadius: 99,
              background: 'rgba(0,0,0,0.55)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg width={34} height={38} viewBox="0 0 34 38">
              <path d="M4 3l27 16L4 35z" fill="white" />
            </svg>
          </div>
          <div style={{position: 'absolute', left: 14, bottom: 10, fontSize: 19, color: 'white', fontWeight: 600}}>{m.meta}</div>
        </div>
        <div style={{padding: '10px 12px 4px', fontSize: 27}}>
          {m.title}
          <Meta at={m.at} out={false} t={t} />
        </div>
      </Bubble>
    );
  if (m.kind === 'pdf')
    return (
      <Bubble out={false} style={{padding: 8, width: 440}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,0,0,0.22)', borderRadius: 14, padding: '16px 16px'}}>
          <div
            style={{
              width: 58,
              height: 70,
              borderRadius: 8,
              background: '#E5484D',
              color: 'white',
              fontWeight: 800,
              fontSize: 17,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            PDF
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 25, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.title}</div>
            <div style={{fontSize: 20, color: C.waMeta, marginTop: 4}}>{m.meta}</div>
          </div>
        </div>
        <div style={{padding: '0 10px'}}>
          <Meta at={m.at} out={false} t={t} />
          <div style={{clear: 'both'}} />
        </div>
      </Bubble>
    );
  // menu
  const tapF = fr(m.tapAt);
  const frame = fr(t);
  const press = prog(frame, tapF - 2, 6, ease.out) * (1 - prog(frame, tapF + 4, 10, ease.soft));
  const chosen = frame >= tapF;
  return (
    <div style={{alignSelf: 'flex-start', width: '82%', display: 'flex', flexDirection: 'column', gap: 6}}>
      <Bubble out={false} style={{maxWidth: '100%'}}>
        {m.text}
        <Meta at={m.at} out={false} t={t} />
      </Bubble>
      {m.options.map((o, i) => {
        const on = chosen && i === m.tapIndex;
        const ripple = i === m.tapIndex ? prog(frame, tapF, 14, ease.out) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: on ? '#2A3B45' : C.waIn,
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              color: C.waLink,
              fontFamily: F.body,
              fontWeight: 600,
              fontSize: 28,
              transform: `scale(${i === m.tapIndex ? 1 - press * 0.04 : 1})`,
              border: on ? `2px solid ${C.waLink}` : '2px solid transparent',
            }}
          >
            {ripple > 0 && ripple < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 600,
                  height: 600,
                  marginLeft: -300,
                  marginTop: -300,
                  borderRadius: 999,
                  background: 'rgba(0,168,132,0.35)',
                  transform: `scale(${ripple})`,
                  opacity: 1 - ripple,
                }}
              />
            )}
            <Icon name={o.icon} size={34} />
            {o.label}
          </div>
        );
      })}
    </div>
  );
};

/** One chat row: grows its own height from 0 (grid 0fr → 1fr), so older messages are pushed up smoothly. */
const Row: React.FC<{m: Msg; t: number}> = ({m, t}) => {
  const frame = fr(t);
  const pin = prog(frame, fr(m.at), 10, ease.out);
  const pout = m.kind === 'typing' ? prog(frame, fr(m.until), 5, ease.in) : 0;
  const h = Math.min(pin, 1 - pout);
  if (h <= 0.001) return null;
  return (
    <div style={{display: 'grid', gridTemplateRows: `${h}fr`, flexShrink: 0}}>
      <div style={{minHeight: 0, overflow: 'visible', display: 'flex', flexDirection: 'column'}}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 12,
            opacity: m.kind === 'typing' ? h : pin,
            transform: `translateY(${(1 - pin) * 24}px) scale(${mix(pin, 0.94, 1)})`,
            transformOrigin: m.kind === 'text' && m.from === 'user' ? 'right bottom' : 'left bottom',
          }}
        >
          <MsgBody m={m} t={t} />
        </div>
      </div>
    </div>
  );
};

/** A WhatsApp-style phone. `t` is chat time in seconds; messages appear at their `at`. */
export const Phone: React.FC<{t: number; msgs: Msg[]; agentMode?: boolean}> = ({t, msgs, agentMode}) => {
  const typing = msgs.some((m) => m.kind === 'typing' && t >= m.at && t < m.until);
  const status = typing ? 'typing…' : agentMode ? `${BRAND.agent} (Advisor) · online` : 'online';
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 86,
        padding: 18,
        background: 'linear-gradient(160deg, #2B3443, #11161F 40%, #0A0E14)',
        boxShadow: `${SHADOW.float}, inset 0 0 0 2px rgba(255,255,255,0.08)`,
      }}
    >
      <div style={{width: '100%', height: '100%', borderRadius: 70, overflow: 'hidden', background: C.waBg, display: 'flex', flexDirection: 'column', position: 'relative'}}>
        {/* status bar + header */}
        <div style={{background: C.waHeader, paddingTop: 54, paddingBottom: 18, paddingLeft: 22, paddingRight: 26, display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{position: 'absolute', top: 18, left: '50%', marginLeft: -70, width: 140, height: 36, borderRadius: 30, background: '#000'}} />
          <svg width={22} height={34} viewBox="0 0 22 34">
            <path d="M18 3L4 17l14 14" stroke={C.waText} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          </svg>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 99,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
              display: 'grid',
              placeItems: 'center',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 28,
              color: '#1A1300',
            }}
          >
            {BRAND.initials}
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, color: C.waText, fontFamily: F.body, fontWeight: 700, fontSize: 31}}>
              {BRAND.name}
              <svg width={28} height={28} viewBox="0 0 24 24">
                <circle cx={12} cy={12} r={11} fill={C.wa} />
                <path d="M7 12.5l3.2 3.2L17 9" stroke="white" strokeWidth={2.6} fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{color: typing ? C.wa : C.waMeta, fontFamily: F.body, fontWeight: 500, fontSize: 22, marginTop: 2}}>{status}</div>
          </div>
        </div>
        {/* chat */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 22px 18px',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 2px, transparent 2px)',
            backgroundSize: '34px 34px',
          }}
        >
          {msgs.map((m, i) => (
            <Row key={i} m={m} t={t} />
          ))}
        </div>
        {/* input */}
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px 34px', background: C.waBg}}>
          <div style={{flex: 1, height: 74, borderRadius: 40, background: C.waHeader, color: C.waMeta, fontFamily: F.body, fontSize: 27, display: 'flex', alignItems: 'center', paddingLeft: 30}}>
            Message
          </div>
          <div style={{width: 74, height: 74, borderRadius: 99, background: C.waLink, display: 'grid', placeItems: 'center'}}>
            <svg width={30} height={36} viewBox="0 0 30 36">
              <rect x={9} y={2} width={12} height={20} rx={6} fill="white" />
              <path d="M4 16a11 11 0 0 0 22 0M15 27v6" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
