import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';

// "Missed vs handled": the same late-night WhatsApp message lands on two businesses. One sleeps; one has Neura Chat.
export const FPS = 30;
export const DURATION = 31;

const C = {
  bg: '#07090A',
  ink: '#0B0D0C',
  paper: '#F4F1EA',
  dim: 'rgba(244,241,234,0.6)',
  green: '#25D366',
  mint: '#7CF2A8',
  red: '#FF4D3D',
  chatBg: '#0E1512',
  inBubble: '#1E2A25',
  outBubble: '#155C3D',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

const sp = (t: number, at: number, stiffness = 280, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const icon = (n: string) => staticFile(`icons/${n}`);

// ---------------------------------------------------------------- beat sheet (seconds)
export const T = {
  hook1: 0.15, // "Ek message."
  hook2: 0.9, // "Do business."
  split: 1.7, // screen splits, phones fly in
  msg: 3.0, // the same customer message lands on both phones
  // right (Neura Chat)
  rTyping: 3.45,
  rReply: 4.15,
  rTap: 5.5,
  rBooked: 6.5,
  rPayAsk: 7.7,
  rPaid: 9.1,
  rRemind: 10.1,
  // left (no automation)
  lClock: 4.2,
  lSleep: 4.6,
  lMsg2: 6.2,
  lMsg3: 7.4,
  lLeave: 9.4,
  lLost: 10.7,
  verdict: 11.8, // left falls away
  fark: 13.6, // "Fark sirf ek cheez ka hai"
  logo: 15.1, // Neura Chat burst
  feat: 17.4, // feature chips start (one per beat)
  outro: 25.2,
  cta: 27.0,
};
const BEAT = 60 / 112;

// ---------------------------------------------------------------- small parts
const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', ...style}} />;

const Tick2: React.FC<{color?: string}> = ({color = '#53BDEB'}) => (
  <svg width={30} height={18} viewBox="0 0 30 18" style={{display: 'inline-block', marginLeft: 6, verticalAlign: 'middle'}}>
    <path d="M1 9.5l4.5 4.5L14 4.5M11 14l1 1 9.5-10.5" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Bubble: React.FC<{t: number; at: number; out?: boolean; children: React.ReactNode; time?: string; ticks?: boolean; faded?: number}> = ({t, at, out, children, time = '11:47 pm', ticks, faded = 0}) => {
  const p = sp(t, at, 420, 22);
  if (p <= 0) return null;
  return (
    <div style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginBottom: 14, opacity: m1(p * 2) * (1 - faded * 0.6), transform: `scale(${lerp(0.55, 1, m1(p))}) translateY(${(1 - m1(p)) * 30}px)`, transformOrigin: out ? '100% 100%' : '0 100%'}}>
      <div style={{maxWidth: 380, background: out ? C.outBubble : C.inBubble, color: '#EDEFEE', fontFamily: SANS, fontSize: 30, lineHeight: 1.32, padding: '14px 18px 10px', borderRadius: 22, borderBottomLeftRadius: out ? 22 : 6, borderBottomRightRadius: out ? 6 : 22, boxShadow: '0 6px 14px rgba(0,0,0,0.25)'}}>
        {children}
        <div style={{textAlign: 'right', fontSize: 17, color: 'rgba(237,239,238,0.55)', marginTop: 4}}>
          {time}
          {ticks && <Tick2 />}
        </div>
      </div>
    </div>
  );
};

const Typing: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  if (t < a || t > b) return null;
  return (
    <div style={{display: 'flex', marginBottom: 14}}>
      <div style={{display: 'flex', gap: 8, background: C.inBubble, padding: '18px 22px', borderRadius: 22, borderBottomLeftRadius: 6}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 12, height: 12, borderRadius: 12, background: '#9FB3AA', transform: `translateY(${Math.sin((t - a) * 14 - i * 0.9) * 4}px)`, opacity: 0.6 + 0.4 * Math.sin((t - a) * 14 - i * 0.9)}} />
        ))}
      </div>
    </div>
  );
};

/** A phone running an original, WhatsApp-style chat UI. */
const Phone: React.FC<{w: number; h: number; name: string; status: string; statusColor?: string; clock: string; children: React.ReactNode; tint?: number; avatar: string}> = ({w, h, name, status, statusColor = 'rgba(237,239,238,0.6)', clock, children, tint = 0, avatar}) => (
  <div style={{width: w, height: h, borderRadius: 64, background: '#0A0A0B', padding: 12, boxSizing: 'border-box', boxShadow: '0 50px 100px rgba(0,0,0,0.6), inset 0 0 0 3px #2B2B30'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden', background: C.chatBg, filter: tint ? `saturate(${1 - 0.8 * tint}) brightness(${1 - 0.35 * tint})` : undefined}}>
      {/* status bar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 34px', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: '#EDEFEE', zIndex: 2}}>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
        <div style={{position: 'absolute', left: '50%', top: 14, width: 120, height: 34, borderRadius: 20, background: '#000', transform: 'translateX(-50%)'}} />
        <span style={{letterSpacing: 2}}>●●●</span>
      </div>
      {/* chat header */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 62, height: 96, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', background: '#16201C', zIndex: 2}}>
        <div style={{width: 62, height: 62, borderRadius: 62, background: avatar, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#0B0D0C'}}>R</div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#EDEFEE'}}>{name}</div>
          <div style={{fontFamily: SANS, fontSize: 20, color: statusColor}}>{status}</div>
        </div>
      </div>
      {/* messages */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 164, bottom: 90, padding: '12px 18px 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden'}}>{children}</div>
      {/* composer */}
      <div style={{position: 'absolute', left: 14, right: 14, bottom: 16, height: 62, borderRadius: 31, background: '#1C2622', display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: SANS, fontSize: 22, color: 'rgba(237,239,238,0.4)'}}>Message</div>
    </div>
  </div>
);

const fmtClock = (mins: number) => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'am' : 'pm'}`;
};

const Chip: React.FC<{t: number; at: number; label: string; onTap?: number}> = ({t, at, label, onTap}) => {
  const p = sp(t, at, 400, 20);
  const tapped = onTap !== undefined && t > onTap;
  const press = onTap !== undefined ? Math.sin(m1((t - onTap) / 0.25) * Math.PI) : 0;
  return (
    <div style={{flex: 1, textAlign: 'center', padding: '14px 6px', borderRadius: 18, border: `2px solid ${tapped ? C.green : 'rgba(124,242,168,0.45)'}`, background: tapped ? 'rgba(37,211,102,0.22)' : 'transparent', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: C.mint, opacity: m1(p * 2), transform: `scale(${lerp(0.6, 1, m1(p)) * (1 - 0.08 * press)})`}}>{label}</div>
  );
};

/** Right phone: Neura Chat handles the whole thing. */
const RightChat: React.FC<{t: number}> = ({t}) => {
  const paid = t > T.rPaid;
  const pay = sp(t, T.rPaid, 500, 16);
  return (
    <>
      <Bubble t={t} at={T.msg}>Hi! Kya aaj appointment mil sakti hai? 🙏</Bubble>
      <Typing t={t} a={T.rTyping} b={T.rReply} />
      {t > T.rReply && (
        <Bubble t={t} at={T.rReply} out ticks>
          Haan bilkul! 😊 Kaunsa slot chahiye?
          <div style={{display: 'flex', gap: 10, marginTop: 12}}>
            <Chip t={t} at={T.rReply + 0.25} label="Aaj 6 PM" />
            <Chip t={t} at={T.rReply + 0.35} label="Kal 11 AM" onTap={T.rTap} />
          </div>
        </Bubble>
      )}
      <Bubble t={t} at={T.rTap + 0.25} time="11:47 pm">Kal 11 AM</Bubble>
      {t > T.rBooked && (
        <Bubble t={t} at={T.rBooked} out ticks time="11:48 pm">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Ico n="spiral_calendar.png" size={52} />
            <div>
              <div style={{fontWeight: 800}}>Appointment confirmed</div>
              <div style={{fontSize: 22, color: 'rgba(237,239,238,0.7)'}}>Kal · 11:00 AM</div>
            </div>
          </div>
        </Bubble>
      )}
      {t > T.rPayAsk && (
        <Bubble t={t} at={T.rPayAsk} out ticks time="11:48 pm">
          ₹200 advance se slot lock karein 👇
          <div style={{marginTop: 12, borderRadius: 16, padding: '14px 16px', background: paid ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800, transform: `scale(${1 + 0.06 * Math.sin(m1(pay) * Math.PI)})`}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <Ico n="credit_card.png" size={38} />
              {paid ? 'Paid ₹200' : 'Pay ₹200'}
            </span>
            {paid && <span style={{color: C.mint}}>✓</span>}
          </div>
        </Bubble>
      )}
      <Bubble t={t} at={T.rRemind} out ticks time="11:48 pm">Thank you! Subah reminder bhej denge ⏰</Bubble>
    </>
  );
};

/** Left phone: nobody answers. */
const LeftChat: React.FC<{t: number}> = ({t}) => {
  const lost = sp(t, T.lLost, 300, 18);
  return (
    <>
      <Bubble t={t} at={T.msg} time="11:47 pm">Hi! Kya aaj appointment mil sakti hai? 🙏</Bubble>
      <Bubble t={t} at={T.lMsg2} time="12:31 am">Hello?</Bubble>
      <Bubble t={t} at={T.lMsg3} time="1:12 am">Koi reply karega? 😕</Bubble>
      <Bubble t={t} at={T.lLeave} time="2:15 am">Rehne do, kahin aur dekh leti hoon.</Bubble>
      {lost > 0 && (
        <div style={{alignSelf: 'center', marginTop: 6, padding: '10px 20px', borderRadius: 14, background: 'rgba(255,77,61,0.16)', border: `1.5px solid rgba(255,77,61,0.5)`, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.red, opacity: m1(lost * 2), transform: `scale(${m1(lost)})`}}>Riya left the chat</div>
      )}
    </>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

/** Masked word-by-word slam (the hook typography). */
const Slam: React.FC<{t: number; at: number; words: string[]; size: number; color?: string; serif?: boolean; stagger?: number}> = ({t, at, words, size, color = C.paper, serif, stagger = 0.09}) => (
  <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: size * 0.25}}>
    {words.map((w, i) => {
      const p = sp(t, at + i * stagger, 500, 24);
      return (
        <div key={i} style={{overflow: 'hidden', paddingBottom: size * 0.08}}>
          <div style={{fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 900, fontSize: size, letterSpacing: serif ? '-0.01em' : '-0.05em', lineHeight: 1, color, transform: `translateY(${(1 - m1(p)) * 105}%) rotate(${(1 - m1(p)) * 6}deg)`, filter: p < 0.9 ? `blur(${(1 - m1(p)) * 8}px)` : undefined}}>{w}</div>
        </div>
      );
    })}
  </div>
);

// ---------------------------------------------------------------- scenes
const Hook: React.FC<{t: number}> = ({t}) => {
  if (t > T.split + 0.5) return null;
  const out = pt(t, T.split - 0.1, T.split + 0.35, ease.in);
  const punch = 1 + 0.06 * Math.exp(-(((t - T.hook2) * 6) ** 2));
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - out, transform: `scale(${punch + out * 0.3})`}}>
      <Slam t={t} at={T.hook1} words={['Ek', 'message.']} size={150} />
      <div style={{height: 10}} />
      <Slam t={t} at={T.hook2} words={['Do', 'business.']} size={170} color={C.mint} serif />
    </AbsoluteFill>
  );
};

const Split: React.FC<{t: number}> = ({t}) => {
  if (t < T.split - 0.05 || t > T.feat + 0.5) return null;
  const open = pt(t, T.split, T.split + 0.45, ease.out);
  const fall = pt(t, T.verdict, T.verdict + 1.0, ease.in);
  const center = pt(t, T.verdict + 0.4, T.verdict + 1.4, ease.inOut);
  const leftIn = sp(t, T.split + 0.1, 220, 20);
  const rightIn = sp(t, T.split + 0.2, 220, 20);
  const shake = t > T.lLost && t < T.lLost + 0.35 ? Math.sin(t * 95) * 8 * (1 - (t - T.lLost) / 0.35) : 0;
  // clock on the left races through the night
  const lMins = 23 * 60 + 47 + lerp(0, 148, pt(t, T.lClock, T.lLeave, ease.inOut));
  const lostTint = pt(t, T.lLost, T.lLost + 0.6);
  const W = 486, H = 1000;
  const phoneTop = 520;
  const rx = lerp(560, (1080 - W * 1.2) / 2, center);
  const rs = lerp(1, 1.2, center);
  const fadeAll = pt(t, T.fark - 0.2, T.fark + 0.3);
  return (
    <AbsoluteFill>
      {/* the split line */}
      <div style={{position: 'absolute', left: 539, top: 0, width: 2, height: 1920 * open, background: 'linear-gradient(180deg, transparent, rgba(244,241,234,0.4), transparent)', opacity: 1 - center}} />
      {/* labels */}
      <div style={{position: 'absolute', left: 40, top: 300, width: 480, textAlign: 'center', opacity: m1(leftIn * 2) * (1 - fall)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.24em', color: C.red}}>BINA</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: C.paper, lineHeight: 1}}>Neura Chat</div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 300, width: 480, textAlign: 'center', opacity: m1(rightIn * 2) * (1 - center)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.24em', color: C.green}}>NEURA CHAT KE SAATH</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: C.paper, lineHeight: 1}}>AI on duty</div>
      </div>
      {/* reply-time badges */}
      <div style={{position: 'absolute', left: 40, top: 445, width: 480, display: 'flex', justifyContent: 'center', opacity: pt(t, T.lClock, T.lClock + 0.3) * (1 - fall)}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.red, background: 'rgba(255,77,61,0.12)', border: '1.5px solid rgba(255,77,61,0.4)', borderRadius: 999, padding: '8px 22px'}}>No reply · {Math.max(0, Math.round(lMins - (23 * 60 + 47)))} min</div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 445, width: 480, display: 'flex', justifyContent: 'center', opacity: pt(t, T.rReply, T.rReply + 0.3) * (1 - center)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.mint, background: 'rgba(37,211,102,0.12)', border: '1.5px solid rgba(37,211,102,0.4)', borderRadius: 999, padding: '8px 22px'}}>
          <Ico n="high_voltage.png" size={30} /> Reply in 2 sec
        </div>
      </div>
      {/* left phone: sleeps, then falls away */}
      <div style={{position: 'absolute', left: 40 + shake, top: phoneTop, transform: `translateY(${(1 - m1(leftIn)) * 1400 + fall * fall * 1600}px) rotate(${(1 - m1(leftIn)) * -8 + fall * -24}deg)`, opacity: 1 - fall * 0.6}}>
        <Phone w={W} h={H} name="Riya" status={t > T.lLeave ? 'last seen 2:15 am' : 'online'} clock={fmtClock(lMins)} tint={lostTint} avatar="#E7B98C">
          <LeftChat t={t} />
        </Phone>
        {/* owner asleep */}
        {t > T.lSleep && t < T.lLost && (
          <div style={{position: 'absolute', right: -10, top: -70, transform: `scale(${m1(sp(t, T.lSleep, 300, 14))})`}}>
            <Ico n="sleeping_face.png" size={150} />
            {[0, 1, 2].map((i) => {
              const z = ((t - T.lSleep) * 0.7 + i / 3) % 1;
              return <Ico key={i} n="zzz.png" size={60 + z * 30} style={{position: 'absolute', left: 110 + z * 40, top: -20 - z * 110, opacity: 1 - z}} />;
            })}
          </div>
        )}
        {/* cracked glass + lost stamp */}
        {t > T.lLost && (
          <>
            <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: m1(lost(t) * 2)}}>
              {Array.from({length: 9}, (_, i) => {
                const ang = (i / 9) * Math.PI * 2 + 0.3;
                const len = 160 + rand(i * 3.1) * 260;
                const cx = W * 0.55, cy = H * 0.45;
                return <path key={i} d={`M ${cx} ${cy} L ${cx + Math.cos(ang) * len * 0.5 + rand(i) * 30} ${cy + Math.sin(ang) * len * 0.5} L ${cx + Math.cos(ang) * len} ${cy + Math.sin(ang) * len}`} stroke="rgba(255,255,255,0.75)" strokeWidth={2.5} fill="none" strokeDasharray={`${lost(t) * 600} 600`} />;
              })}
            </svg>
            <div style={{position: 'absolute', left: W / 2, top: H * 0.42, transform: `translate(-50%, -50%) rotate(-12deg) scale(${lerp(2.2, 1, m1(sp(t, T.lLost, 520, 20)))})`, opacity: m1(sp(t, T.lLost, 520, 20) * 3), border: `10px solid ${C.red}`, borderRadius: 22, padding: '6px 26px', fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.red, letterSpacing: '0.04em', background: 'rgba(7,9,10,0.4)', whiteSpace: 'nowrap'}}>LEAD LOST</div>
          </>
        )}
      </div>
      {/* right phone: handles everything, then takes the stage */}
      <div style={{position: 'absolute', left: rx, top: phoneTop + center * -60, transform: `translateY(${(1 - m1(rightIn)) * 1400}px) rotate(${(1 - m1(rightIn)) * 8}deg) scale(${rs})`, transformOrigin: '0 0', opacity: 1 - fadeAll}}>
        <div style={{position: 'absolute', inset: -30, borderRadius: 90, background: `radial-gradient(closest-side, rgba(37,211,102,${0.25 * pt(t, T.rReply, T.rReply + 0.5)}), transparent)`}} />
        <Phone w={W} h={H} name="Riya" status={t > T.rTyping && t < T.rReply ? 'Neura Chat typing…' : 'online'} statusColor={t > T.rTyping && t < T.rReply ? C.mint : undefined} clock={t > T.rRemind ? '11:48 pm' : '11:47 pm'} avatar="#E7B98C">
          <RightChat t={t} />
        </Phone>
        {t > T.rPaid && t < T.verdict + 0.6 && (
          <div style={{position: 'absolute', right: -20, top: -60, transform: `scale(${m1(sp(t, T.rPaid, 360, 12))}) rotate(10deg)`}}>
            <Ico n="money_bag.png" size={150} />
          </div>
        )}
      </div>
      {/* verdict text */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1600, textAlign: 'center', opacity: pt(t, T.verdict + 0.3, T.verdict + 0.6) * (1 - fadeAll)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.red, letterSpacing: '-0.02em'}}>Ek ne customer khoya.</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.mint, letterSpacing: '-0.02em', opacity: pt(t, T.verdict + 0.8, T.verdict + 1.1)}}>Ek ne booking pakki ki.</div>
      </div>
    </AbsoluteFill>
  );
};
const lost = (t: number) => pt(t, T.lLost, T.lLost + 0.5, ease.out);

const Fark: React.FC<{t: number}> = ({t}) => {
  if (t < T.fark - 0.1 || t > T.logo + 0.4) return null;
  const out = pt(t, T.logo - 0.15, T.logo + 0.2, ease.in);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.4})`}}>
      <Slam t={t} at={T.fark} words={['Fark', 'sirf']} size={140} />
      <Slam t={t} at={T.fark + 0.35} words={['ek', 'cheez', 'ka', 'hai…']} size={88} color={C.dim} stagger={0.07} />
    </AbsoluteFill>
  );
};

const Logo: React.FC<{t: number; at: number; size?: number}> = ({t, at, size = 1}) => {
  const p = sp(t, at, 160, 14);
  const ring = pt(t, at, at + 0.9, ease.out);
  return (
    <div style={{position: 'relative', width: 420 * size, height: 420 * size, display: 'grid', placeItems: 'center'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid rgba(124,242,168,${0.6 * (1 - ring)})`, transform: `scale(${lerp(0.4, 1.6, ring)})`}} />
      <div style={{position: 'absolute', inset: 40 * size, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(37,211,102,0.35), transparent)`, opacity: m1(p)}} />
      <Img src={staticFile('brand/logo-alpha.png')} style={{width: 300 * size, height: 220 * size, objectFit: 'contain', transform: `scale(${lerp(0.3, 1, m1(p))}) rotate(${(1 - m1(p)) * -40}deg)`, opacity: m1(p * 2), filter: 'drop-shadow(0 0 30px rgba(37,211,102,0.45))'}} />
    </div>
  );
};

const Brand: React.FC<{t: number}> = ({t}) => {
  if (t < T.logo - 0.05 || t > T.feat + 0.3) return null;
  const out = pt(t, T.feat - 0.2, T.feat + 0.2, ease.in);
  const burst = pt(t, T.logo, T.logo + 0.8, ease.out);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - out, transform: `scale(${1 - out * 0.3}) translateY(${-out * 300}px)`}}>
      {Array.from({length: 22}, (_, i) => {
        const ang = (i / 22) * Math.PI * 2;
        const r = lerp(80, 520 + rand(i) * 200, burst);
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * r, top: 860 + Math.sin(ang) * r, width: 10, height: 10, borderRadius: 10, background: i % 2 ? C.mint : C.paper, opacity: 1 - burst}} />;
      })}
      <div style={{position: 'absolute', top: 650}}>
        <Logo t={t} at={T.logo} />
      </div>
      <div style={{position: 'absolute', top: 1090, width: '100%'}}>
        <Slam t={t} at={T.logo + 0.35} words={['Neura', 'Chat']} size={150} />
      </div>
      <div style={{position: 'absolute', top: 1270, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.mint, opacity: pt(t, T.logo + 0.8, T.logo + 1.2)}}>WhatsApp ka AI assistant</div>
    </AbsoluteFill>
  );
};

const FEATS = [
  {n: 'high_voltage.png', t1: '2 sec', t2: 'mein reply'},
  {n: 'spiral_calendar.png', t1: 'Auto', t2: 'booking'},
  {n: 'credit_card.png', t1: 'Payment', t2: 'link'},
  {n: 'shopping_bags.png', t1: 'Product', t2: 'catalog'},
  {n: 'crescent_moon.png', t1: '24×7', t2: 'raat ko bhi'},
  {n: 'woman_technologist.png', t1: 'Team', t2: 'handoff'},
];
const Features: React.FC<{t: number}> = ({t}) => {
  if (t < T.feat - 0.3 || t > T.outro + 0.4) return null;
  const phoneIn = sp(t, T.feat - 0.25, 200, 20);
  const out = pt(t, T.outro - 0.2, T.outro + 0.3, ease.in);
  const k = Math.min(FEATS.length - 1, Math.max(0, Math.floor((t - T.feat) / (BEAT * 2))));
  const spin = (t - T.feat) * 18;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${1 - out * 0.25})`}}>
      {/* orbit ring */}
      <div style={{position: 'absolute', left: 540 - 330, top: 1000 - 330, width: 660, height: 660, borderRadius: '50%', border: '2px dashed rgba(124,242,168,0.18)', transform: `rotate(${spin}deg) scale(${m1(phoneIn)})`}} />
      {/* centre: the phone with a live, scrolling conversation */}
      <div style={{position: 'absolute', left: 540 - 180, top: 1000 - 380, transform: `scale(${lerp(0.6, 1, m1(phoneIn))})`, opacity: m1(phoneIn * 2)}}>
        <Phone w={360} h={760} name="Neura Chat" status="online" statusColor={C.mint} clock="2:15 am" avatar={C.green}>
          {FEATS.map((f, i) => (
            <Bubble key={i} t={t} at={T.feat + i * BEAT * 2 + 0.1} out ticks time="2:15 am">
              <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Ico n={f.n} size={36} />
                {f.t1} {f.t2}
              </span>
            </Bubble>
          ))}
        </Phone>
      </div>
      {/* feature chips flying in on the beat, settling around the phone */}
      {FEATS.map((f, i) => {
        const at = T.feat + i * BEAT * 2;
        const p = sp(t, at, 300, 18);
        if (p <= 0) return null;
        // two clean columns either side of the phone
        const left = i % 2 === 0;
        const row = Math.floor(i / 2);
        const fx = left ? 165 : 915, fy = 700 + row * 300 + Math.sin(t * 1.6 + i) * 8;
        const sx = left ? -400 : 1480, sy = fy + (left ? -120 : 120);
        const x = lerp(sx, fx, m1(p)), y = lerp(sy, fy, m1(p));
        const hot = i === k;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${hot ? 1.12 : 0.9})`, textAlign: 'center', filter: p < 0.85 ? `blur(${(1 - p) * 10}px)` : undefined}}>
            <Ico n={f.n} size={hot ? 130 : 100} style={{margin: '0 auto', filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.5))'}} />
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: hot ? 42 : 32, letterSpacing: '-0.03em', color: hot ? C.paper : C.dim, marginTop: 6, whiteSpace: 'nowrap'}}>{f.t1}</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: hot ? 38 : 28, color: C.mint, whiteSpace: 'nowrap'}}>{f.t2}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
        <Slam t={t} at={T.feat - 0.1} words={['Har', 'message.']} size={84} />
        <Slam t={t} at={T.feat + 0.25} words={['Har', 'customer.']} size={84} color={C.mint} />
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{t: number}> = ({t}) => {
  if (t < T.outro - 0.1) return null;
  const cta = sp(t, T.cta, 300, 18);
  const typed = 'AI'.slice(0, Math.max(0, Math.min(2, Math.floor((t - T.cta - 0.3) / 0.12))));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 140, top: 300}}>
        <Logo t={t} at={T.outro} size={0.66} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
        <Slam t={t} at={T.outro + 0.25} words={['Aapka', 'business']} size={110} />
        <Slam t={t} at={T.outro + 0.6} words={['kabhi', 'nahi', 'sota.']} size={130} color={C.mint} serif stagger={0.1} />
      </div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 1140, borderRadius: 34, background: C.paper, padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 22, opacity: m1(cta * 2), transform: `translateY(${(1 - m1(cta)) * 120}px)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
        <Img src={icon('whatsapp-icon.svg')} style={{width: 76, height: 76}} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#777'}}>Comment karo</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1}}>
            {typed}
            <span style={{opacity: typed.length < 2 && Math.sin(t * 14) > 0 ? 1 : 0, color: C.green}}>|</span>
          </div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#fff', background: C.green, borderRadius: 999, padding: '16px 24px', whiteSpace: 'nowrap'}}>Free demo</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', paddingLeft: '0.3em', color: C.dim, opacity: pt(t, T.cta + 0.6, T.cta + 1.0)}}>NEURA CHAT · BY NEURAXINE</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // camera: gentle push and beat-synced micro bounce in the montage
  const beatK = t > T.feat && t < T.outro ? Math.exp(-(((t - T.feat) % BEAT) * 9)) : 0;
  const cam = 1 + 0.012 * beatK + 0.03 * pt(t, T.split, T.verdict, ease.inOut) * (1 - pt(t, T.verdict, T.verdict + 1.2));
  const flash = [T.split, T.lLost, T.logo, T.outro].reduce((m, a) => Math.max(m, 1 - Math.min(1, Math.abs(t - a) / 0.06)), 0);
  const redness = pt(t, T.lLost, T.lLost + 0.2) * (1 - pt(t, T.lLost + 0.5, T.lLost + 1.4));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 45%, #0F1A15 0%, #07090A 70%)'}} />
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(124,242,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,242,168,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px', backgroundPosition: `0 ${t * 20}px`, WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 80%)', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 80%)'}} />
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        <Hook t={t} />
        <Split t={t} />
        <Fark t={t} />
        <Brand t={t} />
        <Features t={t} />
        <Outro t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{boxShadow: `inset 0 0 160px rgba(255,77,61,${0.5 * redness})`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.22, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - pt(t, 0, 0.25), pt(t, DURATION - 0.4, DURATION))}} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
