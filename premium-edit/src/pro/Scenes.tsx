import React from 'react';
import {Img, staticFile} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {ChatBody, C, FONT, Kinetic, Label, Msg, Phone, Pill, sp, Stage, Typing, WaHeader, ws} from './kit';
import {Check, Cross, WaIcon} from '../ui';

export type SceneProps = {t: number; a: number; b: number};
const RED = '#FF4D5E';

/** Rupee sign drawn as a path (the fonts have no ₹ glyph). */
export const Rupee: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size * 0.62} height={size} viewBox="0 0 31 50" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <path d="M4 6 H28 M4 15 H28 M9 6 C25 6 25 24 9 24 H5 L24 45" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const crop = (src: string, [sx, sy, sw, sh]: number[], w: number, extra?: React.CSSProperties) => {
  const k = w / sw;
  return (
    <div style={{position: 'relative', width: w, height: sh * k, overflow: 'hidden', borderRadius: 34, ...extra}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: -sx * k, top: -sy * k, width: 2000 * k, height: 1131 * k}} />
    </div>
  );
};
const CARD: React.CSSProperties = {boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08)', background: '#111'};

// ---------------------------------------------------------------- 1. ad spend: money in, leads / calls / messages out
export const AdSpend: React.FC<SceneProps> = ({t, a, b}) => {
  const r = t - a;
  const meta = sp(t, a + 0.05, 180, 15);
  const fillP = pt(t, ws(20), ws(26) + 0.3, ease.inOut);
  const items = [
    {at: ws(27), label: 'New lead', sub: 'Form submitted', icon: 'lead'},
    {at: ws(31), label: 'Incoming call', sub: '+91 98xxx xx210', icon: 'call'},
    {at: ws(35), label: 'WhatsApp message', sub: '"Price kya hai?"', icon: 'wa'},
  ];
  const lift = pt(t, ws(27) - 0.2, ws(27) + 0.4, ease.inOut);
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.05} text="META ADS" y={170} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-lift * 330}px) scale(${1 - lift * 0.18})`, transformOrigin: '50% 30%'}}>
        {/* the real Meta tile from the integrations page */}
        <div style={{position: 'absolute', left: 540 - 220, top: 560, transform: `scale(${0.6 + 0.4 * Math.min(1, meta)})`, opacity: Math.min(1, meta * 2)}}>
          {crop('shots/integrations-home.png', [399, 430, 283, 188], 440, CARD)}
        </div>
        {/* money flowing in */}
        {Array.from({length: 18}, (_, i) => {
          const at = a + 0.25 + i * 0.13;
          const p = pt(t, at, at + 0.75, ease.in);
          if (p <= 0 || p >= 1 || t > ws(27) + 0.2) return null;
          const sx = rand(i * 3.1) * 1080, sy = -120;
          const x = lerp(sx, 540, p) - 60, y = lerp(sy, 700, p) - 30;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, width: 120, height: 64, borderRadius: 12, border: `3px solid ${C.lime}`, background: 'rgba(182,242,58,0.12)', display: 'grid', placeItems: 'center', transform: `rotate(${(rand(i) - 0.5) * 60 * (1 - p)}deg) scale(${1 - p * 0.6})`, opacity: 1 - p * 0.3}}>
              <Rupee size={40} color={C.lime} />
            </div>
          );
        })}
        {/* spend meter */}
        <div style={{position: 'absolute', left: 140, right: 140, top: 1080, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)'}}>
            <span>AD SPEND</span>
            <span style={{color: C.lime}}>{Math.round(fillP * 100)}%</span>
          </div>
          <div style={{marginTop: 18, height: 26, borderRadius: 26, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
            <div style={{width: `${fillP * 100}%`, height: '100%', borderRadius: 26, background: `linear-gradient(90deg, ${C.limeDeep}, ${C.lime})`, boxShadow: '0 0 30px rgba(182,242,58,0.6)'}} />
          </div>
        </div>
      </div>
      {/* what the spend brings in */}
      {items.map((it, i) => {
        const p = sp(t, it.at - 0.05, 230, 16);
        if (p <= 0) return null;
        const y = 820 + i * 190;
        return (
          <div key={i} style={{position: 'absolute', left: 90, right: 90, top: y, height: 160, borderRadius: 40, background: 'rgba(18,22,20,0.94)', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px', fontFamily: FONT, color: '#fff', transform: `translateX(${(1 - Math.min(1, p)) * 700}px)`, opacity: Math.min(1, p * 2)}}>
            <div style={{width: 92, height: 92, borderRadius: 26, background: it.icon === 'wa' ? C.wa : 'rgba(182,242,58,0.16)', display: 'grid', placeItems: 'center'}}>
              {it.icon === 'wa' ? (
                <WaIcon size={70} />
              ) : it.icon === 'call' ? (
                <svg width={52} height={52} viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill={C.lime} /></svg>
              ) : (
                <svg width={52} height={52} viewBox="0 0 24 24"><circle cx={12} cy={8} r={4} fill={C.lime} /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill={C.lime} /></svg>
              )}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 44, fontWeight: 800}}>{it.label}</div>
              <div style={{fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.55)'}}>{it.sub}</div>
            </div>
            <div style={{fontSize: 26, fontWeight: 700, color: C.lime}}>now</div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- 2. sales flatline
export const Flatline: React.FC<SceneProps> = ({t, a, b}) => {
  const draw = pt(t, a + 0.05, b - 0.15, ease.inOut);
  const X0 = 120, X1 = 960, Y0 = 1200, Y1 = 560;
  const leads = Array.from({length: 40}, (_, i) => {
    const x = i / 39;
    return [lerp(X0, X1, x), Y0 - (Y0 - Y1) * (x ** 1.4) - Math.sin(i * 1.7) * 14];
  });
  const sales = Array.from({length: 40}, (_, i) => [lerp(X0, X1, i / 39), Y0 - 70 - Math.sin(i * 2.3) * 6]);
  const path = (pts: number[][], p: number) => pts.slice(0, Math.max(2, Math.round(pts.length * p))).map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const flat = pt(t, ws(43) - 0.1, ws(43) + 0.3);
  return (
    <>
      <Stage t={t} hue="red" grid />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2, 3].map((k) => <line key={k} x1={X0} x2={X1} y1={Y0 - k * 213} y2={Y0 - k * 213} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />)}
        <path d={path(leads, draw)} fill="none" stroke={C.lime} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 16px rgba(182,242,58,0.7))'}} />
        <path d={path(sales, draw)} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeDasharray={flat > 0 ? '1 0' : undefined} style={{filter: 'drop-shadow(0 0 16px rgba(255,77,94,0.6))'}} />
      </svg>
      <div style={{position: 'absolute', left: X1 - 180, top: Y1 - 90, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.lime, opacity: draw}}>LEADS</div>
      <div style={{position: 'absolute', left: X1 - 180, top: Y0 - 160, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: RED, opacity: draw}}>SALES</div>
      <Kinetic t={t} at={ws(42) - 0.05} text="Sales? Flat." y={1330} size={120} />
    </>
  );
};

// ---------------------------------------------------------------- 3. leads → paying customers
export const Convert: React.FC<SceneProps> = ({t, a, b}) => {
  const r = t - a;
  const gate = sp(t, a + 0.1, 160, 14);
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.05} text="THE REAL GAME" y={170} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em'}}>LEADS</div>
      {/* leads pour down into the converter; only some come out as customers */}
      {Array.from({length: 30}, (_, i) => {
        const ph = ((r * 0.9 + i / 30) % 1);
        const x = 540 + (rand(i * 2.9) - 0.5) * 760 * (1 - ph * 1.3);
        const y = lerp(420, 790, ph);
        return <div key={i} style={{position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 32, background: 'rgba(255,255,255,0.75)', opacity: ph < 0.9 ? 0.9 : (1 - ph) * 9}} />;
      })}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d="M160 760 L920 760 L640 960 L640 1030 L440 1030 L440 960 Z" fill="rgba(182,242,58,0.1)" stroke={C.lime} strokeWidth={6} strokeLinejoin="round" transform={`translate(540 900) scale(${gate}) translate(-540 -900)`} style={{filter: 'drop-shadow(0 0 24px rgba(182,242,58,0.5))'}} />
      </svg>
      {Array.from({length: 6}, (_, i) => {
        const at = ws(71) + i * 0.12;
        const p = sp(t, at, 220, 14);
        if (p <= 0) return null;
        const x = 180 + (i % 3) * 270, y = 1080 + Math.floor(i / 3) * 160;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: lerp(980, y, Math.min(1, p)), width: 180, height: 140, borderRadius: 34, background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${p})`, boxShadow: '0 0 40px rgba(182,242,58,0.5)'}}>
            <svg width={60} height={60} viewBox="0 0 24 24"><circle cx={12} cy={8} r={4.2} fill={C.ink} /><path d="M3.5 21c0-4.5 4-7 8.5-7s8.5 2.5 8.5 7" fill={C.ink} /></svg>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- 4. the lost customer
export const Story: React.FC<SceneProps> = ({t, a, b}) => {
  const r = t - a;
  const enter = sp(t, a, 140, 18);
  const goA = ws(91);
  const go = pt(t, goA, goA + 0.8, ease.inOut);
  const lateA = ws(82), fuA = ws(86);
  const late = pt(t, lateA, lateA + 0.4);
  return (
    <>
      <Stage t={t} hue={go > 0.3 ? 'red' : 'lime'} />
      <Label t={t} at={a + 0.1} text="WHAT ACTUALLY HAPPENS" y={170} />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-go * 260}px) scale(${1 - go * 0.15})`, opacity: 1 - go * 0.5}}>
        <Phone y={lerp(1400, 960, Math.min(1, enter))} w={560} ry={lerp(18, 6, Math.min(1, enter))} rx={6} glow={0.5}>
          <WaHeader name="Customer" status={t < ws(79) ? 'typing…' : go > 0.5 ? 'last seen yesterday' : 'online'} />
          <ChatBody>
            {t < ws(79) && <Typing t={t} />}
            <Msg side="in" p={sp(t, ws(79))} time="10:02 AM">Hi! Price kya hai?</Msg>
            {late > 0 && (
              <div style={{display: 'flex', justifyContent: 'center', opacity: late}}>
                <Pill color="rgba(255,77,94,0.18)" fg="#FF8B96" size={22}>REPLY AFTER 4 HOURS</Pill>
              </div>
            )}
            <Msg side="out" p={sp(t, lateA + 0.35)} time="2:10 PM">Sorry for late reply! Price…</Msg>
          </ChatBody>
        </Phone>
      </div>
      {/* the follow-up that never happened */}
      {(() => {
        const p = sp(t, fuA - 0.05, 220, 15);
        if (p <= 0) return null;
        const out = go;
        return (
          <div style={{position: 'absolute', right: 70, top: 470, width: 340, padding: '26px 28px', borderRadius: 30, background: 'rgba(18,22,20,0.95)', border: `2px solid ${RED}`, fontFamily: FONT, color: '#fff', transform: `rotate(6deg) scale(${p})`, opacity: 1 - out * 0.6}}>
            <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)'}}>REMINDER</div>
            <div style={{fontSize: 38, fontWeight: 800, marginTop: 8, textDecoration: pt(t, fuA + 0.6, fuA + 0.9) > 0.5 ? 'line-through' : 'none'}}>Follow up</div>
            <div style={{position: 'absolute', right: -20, top: -20}}>
              <Cross size={64} p={pt(t, fuA + 0.5, fuA + 0.9)} />
            </div>
          </div>
        );
      })()}
      {/* the customer walks to the competitor */}
      {go > 0 && (
        <>
          <div style={{position: 'absolute', right: 80, top: 760, width: 330, height: 420, borderRadius: 40, border: '3px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: FONT, color: '#fff', opacity: go, transform: `translateX(${(1 - go) * 200}px)`}}>
            <svg width={120} height={120} viewBox="0 0 24 24"><path d="M3 9 L4.5 4 H19.5 L21 9 M3 9 H21 V20 H3 Z M9 20 V14 H15 V20" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" /></svg>
            <div style={{fontSize: 36, fontWeight: 800, letterSpacing: '0.08em'}}>COMPETITOR</div>
          </div>
          {(() => {
            const w = pt(t, goA + 0.3, b - 0.3, ease.inOut);
            const x = lerp(380, 820, w), y = lerp(900, 960, w) - Math.abs(Math.sin(w * Math.PI * 4)) * 22;
            return (
              <div style={{position: 'absolute', left: x, top: y, width: 110, height: 110, borderRadius: 110, background: '#E9EDEF', display: 'grid', placeItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: go}}>
                <svg width={64} height={64} viewBox="0 0 24 24"><circle cx={12} cy={8} r={4.2} fill="#33403f" /><path d="M3.5 21c0-4.5 4-7 8.5-7s8.5 2.5 8.5 7" fill="#33403f" /></svg>
              </div>
            );
          })()}
          <Kinetic t={t} at={ws(94) - 0.05} text="Customer *gone.*" y={1360} size={96} color="#fff" />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 5. conversations live on WhatsApp
export const WhatsAppWorld: React.FC<SceneProps> = ({t, a, b}) => {
  const conv = pt(t, ws(121), ws(123) + 0.2, ease.inOut);
  const icon = sp(t, ws(123) - 0.1, 180, 12);
  const msgs = ['Price?', 'Available?', 'Booking', 'Details', 'Hi', 'Order status', 'Location?', 'COD?', 'Demo?', 'Size M?', 'Timings?', 'Interested'];
  return (
    <>
      <Stage t={t} grid={false} />
      {msgs.map((m, i) => {
        const ang = (i / msgs.length) * Math.PI * 2 + (t - a) * 0.25;
        const R = lerp(560, 120, conv) + Math.sin(i * 3) * 40;
        const x = 540 + Math.cos(ang) * R * 0.85, y = 760 + Math.sin(ang) * R * 1.0;
        return (
          <div key={i} style={{position: 'absolute', left: x - 120, top: y - 40, padding: '18px 28px', borderRadius: 30, borderTopLeftRadius: 6, background: i % 3 ? '#202C33' : '#005C4B', color: '#E9EDEF', fontFamily: FONT, fontWeight: 600, fontSize: 32, whiteSpace: 'nowrap', opacity: (1 - conv * 0.85) * Math.min(1, sp(t, a + i * 0.06)), transform: `scale(${1 - conv * 0.5})`}}>
            {m}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 540 - 150, top: 760 - 150, width: 300, height: 300, transform: `scale(${icon})`, filter: `drop-shadow(0 0 ${60 + 30 * Math.sin(t * 6)}px rgba(37,211,102,0.7))`}}>
        <WaIcon size={300} />
      </div>
      <Kinetic t={t} at={ws(122) - 0.05} text="Conversations live on" y={1130} size={70} color="rgba(255,255,255,0.8)" />
      <Kinetic t={t} at={ws(123) - 0.05} text="*WhatsApp.*" y={1220} size={140} />
    </>
  );
};

// ---------------------------------------------------------------- 6. Neura Chat reveal
export const Reveal: React.FC<SceneProps> = ({t, a, b}) => {
  const nAt = ws(152);
  const streak = pt(t, nAt - 0.6, nAt + 0.1, ease.inOut);
  const logo = sp(t, nAt - 0.1, 130, 14);
  const name = sp(t, nAt + 0.15, 200, 16);
  const pre = pt(t, a, a + 0.6);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#030403'}} />
      <div style={{position: 'absolute', inset: 0, opacity: pre * 0.6}}>
        <Stage t={t} grid={false} glowY={36} />
      </div>
      <Kinetic t={t} at={a + 0.08} text="Isi problem ke liye" y={520} size={64} color="rgba(255,255,255,0.7)" out={nAt - 0.15} />
      {/* light streak that unveils the mark */}
      <div style={{position: 'absolute', left: lerp(-400, 1400, streak), top: 0, width: 260, height: 1920, background: 'linear-gradient(90deg, transparent, rgba(182,242,58,0.35), rgba(255,255,255,0.6), rgba(182,242,58,0.35), transparent)', transform: 'skewX(-14deg)', mixBlendMode: 'screen', opacity: streak > 0 && streak < 1 ? 1 : 0}} />
      <div style={{position: 'absolute', left: 540 - 300, top: 560, width: 600, height: 440, transform: `scale(${0.7 + 0.3 * Math.min(1.05, logo)})`, opacity: Math.min(1, logo * 1.8), clipPath: `inset(0 ${(1 - Math.min(1, streak * 1.15)) * 100}% 0 0)`}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 60px rgba(182,242,58,0.45))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 150, color: '#fff', letterSpacing: `${lerp(0.3, -0.01, Math.min(1, name))}em`, opacity: Math.min(1, name * 2), filter: name < 0.7 ? `blur(${(0.7 - name) * 22}px)` : undefined}}>
        Neura <span style={{color: C.lime}}>Chat</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 34, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.6)', opacity: pt(t, nAt + 0.4, nAt + 0.9)}}>
        AI-POWERED WHATSAPP AUTOMATION
      </div>
    </>
  );
};

// ---------------------------------------------------------------- 7. features → one place
const FEATS = [
  {w: 157, title: 'Automatic replies', src: 'shots/home.png', box: [1172, 230, 398, 736], width: 420},
  {w: 159, title: 'Smart follow-ups', src: 'shots/dashboard.png', box: [0, 385, 326, 180], width: 880},
  {w: 161, title: 'Lead qualification', src: 'shots/dashboard.png', box: [0, 205, 326, 180], width: 880},
  {w: 164, title: 'Appointment booking', src: 'shots/dashboard.png', box: [0, 505, 326, 120], width: 880},
];
export const Features: React.FC<SceneProps> = ({t, a, b}) => {
  const allAt = ws(166) - 0.1;
  const all = pt(t, allAt, allAt + 0.6, ease.inOut);
  const ats = FEATS.map((f) => ws(f.w) - 0.1);
  const cur = ats.reduce((n, x, i) => (t >= x ? i : n), 0);
  return (
    <>
      <Stage t={t} />
      {/* progress chips across the top */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 170, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', opacity: 1 - all}}>
        {FEATS.map((f, i) => {
          const p = sp(t, ats[i], 260, 18);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 999, background: p > 0 ? 'rgba(182,242,58,0.14)' : 'rgba(255,255,255,0.05)', border: `2px solid ${p > 0 ? C.lime : 'rgba(255,255,255,0.12)'}`, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: p > 0 ? '#fff' : 'rgba(255,255,255,0.35)', transform: `scale(${0.9 + 0.1 * Math.min(1, p)})`}}>
              <Check size={30} p={Math.min(1, p)} color={p > 0 ? C.lime : 'rgba(255,255,255,0.3)'} />
              {f.title}
            </div>
          );
        })}
      </div>
      {/* the current feature on its real screen */}
      {FEATS.map((f, i) => {
        if (i < cur - 1 || i > cur) return null;
        const inP = sp(t, ats[i], 200, 20);
        const outP = i < cur ? pt(t, ats[cur], ats[cur] + 0.3, ease.in) : all;
        if (outP >= 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: 1 - outP, transform: `translateX(${(1 - Math.min(1, inP)) * 900 - outP * 900}px) rotate(${(1 - Math.min(1, inP)) * 6}deg)`}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 88, color: '#fff', textAlign: 'center', lineHeight: 1.05}}>{f.title}</div>
            {crop(f.src, f.box, f.width, {...CARD, borderRadius: i === 0 ? 50 : 36, background: i === 0 ? '#fff' : '#111'})}
          </div>
        );
      })}
      {/* sab kuch ek hi jagah: the real dashboard */}
      {all > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: all}}>
          <Kinetic t={t} at={allAt + 0.05} text="Sab kuch" y={360} size={110} />
          <Kinetic t={t} at={allAt + 0.2} text="*ek hi jagah.*" y={490} size={120} />
          <div style={{position: 'absolute', left: 40, top: 720, width: 1000, transform: `scale(${lerp(1.25, 1, all)})`, transformOrigin: '50% 0%'}}>
            {crop('shots/dashboard.png', [0, 100, 2000, 931], 1000, {...CARD, borderRadius: 30})}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', justifyContent: 'center', opacity: pt(t, ws(173), ws(174) + 0.3)}}>
            <Pill size={34}>INQUIRIES INTO CUSTOMERS</Pill>
          </div>
        </div>
      )}
    </>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {adspend: AdSpend, flatline: Flatline, convert: Convert, story: Story, whatsapp: WhatsAppWorld, reveal: Reveal, features: Features};
