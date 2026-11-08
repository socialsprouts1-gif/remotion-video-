import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine: missed call -> instant WhatsApp -> AI books the appointment. Motion graphics over a Hinglish voice-over.
// Palette from the real NX logo: black, silver, lime; red only for the "lost sale" beats.
const C = {
  bg: '#060607',
  card: '#131315',
  lime: '#C8FF3E',
  cream: '#F3F1EC',
  ink: '#0A0A0A',
  dim: 'rgba(243,241,236,0.6)',
  line: 'rgba(200,255,62,0.28)',
  red: '#FF453A',
  wa: '#25D366',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const LIME_GRAD = 'linear-gradient(180deg, #F0FFB0 0%, #C8FF3E 45%, #8FD61A 100%)';
const RED_GRAD = 'linear-gradient(180deg, #FF8A80 0%, #FF453A 50%, #C9160E 100%)';
const SILVER_GRAD = 'linear-gradient(180deg, #FFFFFF 0%, #D9D9DE 50%, #9A9AA2 100%)';
const IG_GRAD = 'linear-gradient(45deg, #F9CE34, #EE2A7B 50%, #6228D7)';
const limeText: React.CSSProperties = {background: LIME_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const redText: React.CSSProperties = {background: RED_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const silverText: React.CSSProperties = {background: SILVER_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

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

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 280, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.25) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (w: string) => w.replace(/["“”…]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const win = (t: number, a: number, b: number, fi = 0.2, fo = 0.25) => ap(t, a, fi) * (1 - pt(t, b - fo, b, ease.in));
const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K` : `${Math.round(n)}`);

// ---------------------------------------------------------------- scene timeline (keyed to the voice)
const SC = {
  hook: [0, W(7) - 0.12],
  busy: [W(7) - 0.12, W(20) - 0.12],
  next: [W(20) - 0.12, W(37) - 0.12],
  whatif: [W(37) - 0.12, W(49) - 0.12],
  chat: [W(49) - 0.12, W(79) - 0.12],
  callback: [W(79) - 0.12, W(91) - 0.12],
  flip: [W(91) - 0.12, W(100) - 0.12],
  cta: [W(100) - 0.12, edit.speech + 0.1],
};
const CUTS = Object.values(SC).map((s) => s[0]).slice(1);
const inScene = (t: number, s: number[]) => t >= s[0] - 0.05 && t < s[1] + 0.3;
/** Whip in from the side, push out. */
const Shot: React.FC<{t: number; s: number[]; dir?: number; children: React.ReactNode}> = ({t, s, dir = 1, children}) => {
  if (!inScene(t, s)) return null;
  const e = s[0] === 0 ? 1 : pt(t, s[0], s[0] + 0.28, ease.out);
  const x = pt(t, s[1] - 0.05, s[1] + 0.28, ease.in);
  return (
    <AbsoluteFill style={{transform: `translateX(${(1 - e) * 1080 * dir - x * 400 * dir}px) scale(${1 + x * 0.08})`, filter: e < 1 || x > 0 ? `blur(${(1 - e) * 22 + x * 14}px)` : undefined, opacity: 1 - x}}>
      <AbsoluteFill style={{transform: 'translateY(110px)'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shared visuals
const Backdrop: React.FC<{t: number; red?: number}> = ({t, red = 0}) => (
  <AbsoluteFill style={{top: -160, bottom: -160}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 40%, #1E2A08 0%, #101011 52%, ${C.bg} 100%)`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 40%, #3A0806 0%, #120808 52%, ${C.bg} 100%)`, opacity: red}} />
    <AbsoluteFill style={{backgroundImage: `radial-gradient(rgba(200,255,62,${0.14 * (1 - red)}) 1.5px, transparent 1.6px)`, backgroundSize: '36px 36px', backgroundPosition: `0 ${t * 12}px`, maskImage: 'radial-gradient(ellipse 70% 55% at 50% 40%, #000 25%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 40%, #000 25%, transparent 80%)'}} />
  </AbsoluteFill>
);
const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.55))', ...style}} />;
const Pop: React.FC<{t: number; at: number; n: string; size: number; x: number; y: number; rot?: number}> = ({t, at, n, size, x, y, rot = 0}) => {
  const p = sp(t, at, 380, 12);
  if (p <= 0) return null;
  return <Ico n={n} size={size} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin((t - at) * 2.4) * 8, transform: `scale(${p}) rotate(${lerp(-25, rot, m1(p))}deg)`}} />;
};
const Kicker: React.FC<{t: number; at: number; children: React.ReactNode; red?: boolean; top?: number}> = ({t, at, children, red, top = 150}) => {
  const p = ap(t, at, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.28em', color: red ? C.red : C.lime, border: `1.5px solid ${red ? 'rgba(255,69,58,0.45)' : C.line}`, borderRadius: 999, padding: '12px 28px', background: 'rgba(6,6,7,0.65)'}}>
        <span style={{width: 12, height: 12, borderRadius: 12, background: red ? C.red : C.lime, boxShadow: `0 0 ${10 + 8 * Math.sin(t * 9)}px ${red ? C.red : C.lime}`}} />
        {children}
      </div>
    </div>
  );
};
const InstaMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
      <rect x={2.5} y={2.5} width={19} height={19} rx={5.5} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={12} cy={12} r={4.4} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={17.6} cy={6.4} r={1.3} fill="#fff" />
    </svg>
  </div>
);
const Avatar: React.FC<{i: number; size: number; style?: React.CSSProperties}> = ({i, size, style}) => {
  const P = ['man.png', 'woman.png', 'person.png', 'man_beard.png', 'woman_curly_hair.png'];
  return (
    <div style={{width: size, height: size, borderRadius: size, background: '#1d1d21', display: 'grid', placeItems: 'center', flexShrink: 0, ...style}}>
      <Img src={icon(P[i % 5])} style={{width: size * 0.78, height: size * 0.78}} />
    </div>
  );
};
const NAMES = ['riya.sharma', 'aman_k', 'neha.styles', 'rohit.fit', 'pooja_m', 'vikas.22', 'sana.home', 'arjun.dxb'];
const Bubble: React.FC<{i: number; text: string; scale?: number; style?: React.CSSProperties}> = ({i, text, scale = 1, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale, background: 'rgba(255,255,255,0.96)', borderRadius: 26 * scale, padding: `${12 * scale}px ${20 * scale}px ${12 * scale}px ${12 * scale}px`, boxShadow: '0 20px 40px rgba(0,0,0,0.45)', ...style}}>
    <Avatar i={i} size={56 * scale} />
    <div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 20 * scale, color: '#111'}}>{NAMES[i % NAMES.length]}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30 * scale, color: '#222', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------- phone mock
const Phone: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties; bg?: string}> = ({x, y, w, h, children, style, bg = '#0B141A'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 64, background: '#000', padding: 12, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 54, background: bg, overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);
const Rings: React.FC<{t: number; x: number; y: number; color?: string; on?: boolean}> = ({t, x, y, color = C.lime, on = true}) =>
  on ? (
    <>
      {[0, 1, 2].map((i) => {
        const u = (t * 1.4 + i / 3) % 1;
        return <div key={i} style={{position: 'absolute', left: x - 60 - u * 140, top: y - 60 - u * 140, width: 120 + u * 280, height: 120 + u * 280, borderRadius: 999, border: `4px solid ${color}`, opacity: (1 - u) * 0.7}} />;
      })}
    </>
  ) : null;

// ---------------------------------------------------------------- 1. HOOK: every missed call is a lost customer
const Hook: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.hook;
  const n = Math.max(1, Math.min(6, Math.floor((t - 0.1) / 0.32) + 1));
  const lost = sp(t, W(4) - 0.06, 460, 14);
  const fade = pt(t, W(4), W(6) + 0.2, ease.inOut);
  const vib = t < W(3) ? Math.sin(t * 70) * 6 : 0;
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} red={m1(fade)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.03em', color: C.cream, transform: `scale(${lerp(1.5, 1, m1(sp(t, 0.1, 420, 16)))})`}}>Har missed call…</div>
      </div>
      <Phone x={250} y={300} w={580} h={900} bg="#101012" style={{transform: `rotate(${vib * 0.4}deg) translateX(${vib}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 300, fontSize: 110, color: '#fff'}}>7:42</div>
        <div style={{position: 'absolute', left: 22, right: 22, top: 260}}>
          {Array.from({length: n}, (_, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 26, padding: '16px 18px', marginBottom: 12, opacity: m1(sp(t, 0.1 + i * 0.32, 420, 18) * 2)}}>
              <div style={{width: 60, height: 60, borderRadius: 16, background: C.red, display: 'grid', placeItems: 'center'}}>
                <Ico n="telephone_receiver.png" size={40} style={{filter: 'none'}} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#fff'}}>Missed call</div>
                <div style={{fontFamily: SANS, fontSize: 22, color: 'rgba(255,255,255,0.6)'}}>+91 98•••• ••{10 + i * 7}</div>
              </div>
              <div style={{fontFamily: SANS, fontSize: 20, color: 'rgba(255,255,255,0.5)'}}>{i * 4 + 2}m</div>
            </div>
          ))}
        </div>
      </Phone>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', transform: `scale(${lerp(2.2, 1, m1(lost))})`, opacity: m1(lost * 3)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.cream}}>ek</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', ...redText, lineHeight: 0.95, filter: 'drop-shadow(0 16px 50px rgba(255,69,58,0.5))'}}>LOST CUSTOMER</div>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 2. you were busy; the phone kept ringing
const Busy: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.busy;
  const shop = t > W(11) - 0.1;
  const ring = t > W(17) - 0.1;
  const secs = Math.floor(lerp(0, 32, pt(t, W(17) - 0.1, b, (x: number) => x)));
  const vib = ring ? Math.sin(t * 70) * 8 : 0;
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <Kicker t={t} at={a}>AAP BUSY THE</Kicker>
      <div style={{position: 'absolute', left: 90, top: 290, display: 'flex', gap: 28}}>
        {[
          {n: 'laptop.png', t1: 'Meeting', at: W(8) - 0.08},
          {n: 'person_tipping_hand.png', t1: 'Doosra customer', at: W(14) - 0.08},
        ].map((c) => {
          const p = sp(t, c.at, 380, 16);
          return (
            <div key={c.t1} style={{width: 420, padding: '30px 24px', borderRadius: 34, background: '#141416', border: `2px solid ${p > 0 ? 'rgba(255,255,255,0.15)' : 'transparent'}`, textAlign: 'center', opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * 80}px)`}}>
              <Ico n={c.n} size={150} style={{margin: '0 auto'}} />
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, color: C.cream, marginTop: 10}}>{c.t1}</div>
              <div style={{fontFamily: SANS, fontSize: 26, color: C.dim}}>{c.t1 === 'Meeting' ? 'Do not disturb' : 'Counter pe busy'}</div>
            </div>
          );
        })}
      </div>
      {/* the phone on the table, ringing */}
      <div style={{position: 'absolute', left: 290, top: 720, width: 500, height: 300, borderRadius: 50, background: '#101012', border: '3px solid #2a2a2e', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transform: `translateX(${vib}px) rotate(${vib * 0.3}deg)`, opacity: ap(t, W(17) - 0.15), display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', boxSizing: 'border-box'}}>
        <div style={{width: 110, height: 110, borderRadius: 110, background: C.wa, display: 'grid', placeItems: 'center', flexShrink: 0}}>
          <Ico n="telephone_receiver.png" size={70} style={{filter: 'none'}} />
        </div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.6)'}}>Incoming call…</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#fff'}}>New customer</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.red, fontVariantNumeric: 'tabular-nums'}}>ringing 0:{String(secs).padStart(2, '0')}</div>
        </div>
      </div>
      <Rings t={t} x={400} y={870} color={C.wa} on={ring} />
      {shop && <Pop t={t} at={W(16) - 0.05} n="handshake.png" size={120} x={920} y={250} rot={10} />}
    </Shot>
  );
};

// ---------------------------------------------------------------- 3. they called the next number; never calling back
const Next: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.next;
  const digits = '98•••• 4417';
  const typed = digits.slice(0, Math.max(0, Math.min(digits.length, Math.floor((t - W(24) + 0.1) / 0.07))));
  const conn = sp(t, W(27) - 0.05, 420, 16);
  const never = sp(t, W(35) - 0.06, 520, 14);
  const part2 = t > W(30) - 0.12;
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} red={part2 ? 1 : 0} />
      <Kicker t={t} at={a} red>
        {part2 ? 'WAPAS CALL?' : 'CUSTOMER NE KYA KIYA'}
      </Kicker>
      {!part2 ? (
        <Phone x={230} y={260} w={620} h={1000} bg="#101012">
          <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.6)'}}>{conn > 0 ? 'Connected' : 'Calling…'}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff'}}>Doosri shop</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 52, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums'}}>{typed || ' '}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center'}}>
            <Ico n="convenience_store.png" size={220} />
          </div>
          {conn > 0 && (
            <div style={{position: 'absolute', left: 60, right: 60, top: 660, borderRadius: 30, background: 'rgba(37,211,102,0.15)', border: `2px solid ${C.wa}`, padding: '22px 0', textAlign: 'center', transform: `scale(${lerp(0.6, 1, m1(conn))})`}}>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: C.wa}}>✓ Call picked up</div>
              <div style={{fontFamily: SANS, fontSize: 28, color: 'rgba(255,255,255,0.7)'}}>&ldquo;Haan ji, boliye!&rdquo;</div>
            </div>
          )}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center'}}>
            <div style={{width: 120, height: 120, borderRadius: 120, background: C.red, display: 'grid', placeItems: 'center'}}>
              <Ico n="telephone_receiver.png" size={70} style={{filter: 'none', transform: 'rotate(135deg)'}} />
            </div>
          </div>
        </Phone>
      ) : (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center'}}>
            <Avatar i={1} size={190} style={{filter: 'grayscale(0.6)', border: `4px solid ${C.red}`}} />
            <Ico n="cross_mark.png" size={130} style={{transform: `scale(${m1(sp(t, W(33) - 0.06, 420, 12))})`}} />
            <InstaMarkPhone />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: ap(t, W(30) - 0.1)}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: C.cream}}>wapas call?</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', transform: `rotate(-7deg) scale(${lerp(2.4, 1, m1(never))})`, opacity: m1(never * 3)}}>
            <div style={{border: `14px solid ${C.red}`, borderRadius: 28, padding: '6px 34px', fontFamily: SANS, fontWeight: 900, fontSize: 118, color: C.red, background: 'rgba(20,0,0,0.6)', boxShadow: '0 0 80px rgba(255,69,58,0.5)', whiteSpace: 'nowrap'}}>KABHI NAHI</div>
          </div>
        </>
      )}
    </Shot>
  );
};
const InstaMarkPhone: React.FC = () => (
  <div style={{width: 190, height: 190, borderRadius: 50, background: '#141416', display: 'grid', placeItems: 'center', border: '2px solid rgba(255,255,255,0.15)'}}>
    <Ico n="mobile_phone.png" size={130} />
  </div>
);

// ---------------------------------------------------------------- 4. what if every missed call got an instant WhatsApp
const WhatIf: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.whatif;
  const mc = sp(t, W(38) - 0.05, 420, 16);
  const bolt = pt(t, W(44) - 0.1, W(44) + 0.3, ease.out);
  const wa = sp(t, W(46) - 0.08, 420, 13);
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: ap(t, W(37) - 0.08)}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, ...limeText}}>ab socho…</span>
      </div>
      <div style={{position: 'absolute', left: 90, top: 420, display: 'flex', alignItems: 'center', gap: 18, padding: '22px 26px', borderRadius: 30, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,69,58,0.5)', transform: `translateX(${(1 - m1(mc)) * -500}px)`, opacity: m1(mc * 2)}}>
        <div style={{width: 80, height: 80, borderRadius: 22, background: C.red, display: 'grid', placeItems: 'center'}}>
          <Ico n="telephone_receiver.png" size={52} style={{filter: 'none'}} />
        </div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#fff'}}>Missed call</div>
          <div style={{fontFamily: SANS, fontSize: 26, color: C.dim}}>+91 98•••• 4417</div>
        </div>
      </div>
      <svg width={1080} height={520} style={{position: 'absolute', left: 0, top: 560}}>
        <path d="M 260 20 C 260 260, 740 220, 740 470" fill="none" stroke={C.lime} strokeWidth={8} strokeDasharray={`${bolt * 700} 900`} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 12px rgba(200,255,62,0.8))'}} />
      </svg>
      <Pop t={t} at={W(44) - 0.05} n="high_voltage.png" size={150} x={520} y={780} rot={-10} />
      <div style={{position: 'absolute', left: 600, top: 1030, transform: `scale(${m1(wa)})`}}>
        <Img src={icon('whatsapp-icon.svg')} style={{width: 260, height: 260, filter: 'drop-shadow(0 0 50px rgba(37,211,102,0.5))'}} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 1120, display: 'flex', alignItems: 'center', gap: 14, opacity: ap(t, W(44) - 0.05)}}>
        <Ico n="stopwatch.png" size={84} />
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 72, ...limeText}}>turant</span>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 5. the WhatsApp conversation that books the appointment
const Chat: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.chat;
  const msg1 = 'Hi! Sorry, abhi call nahi utha paaye. Bataiye, kya help chahiye? 🙂';
  const typed = msg1.slice(0, Math.floor(lerp(0, msg1.length, pt(t, W(49) - 0.05, W(59) + 0.2, (x: number) => x))));
  const bubbles = [
    {at: W(60) - 0.05, me: false, txt: 'Haircut ke liye kal shaam slot hai?'},
    {at: W(64) - 0.05, me: true, ai: true, txt: 'Haan ji! 5 PM free hai. Naam bata dijiye?'},
    {at: W(69) - 0.05, me: false, txt: 'Riya. 5 baje theek hai 👍'},
  ];
  const booked = sp(t, W(75) - 0.08, 400, 14);
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} />
      <Phone x={130} y={170} w={820} h={1260}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '34px 28px 20px', background: '#1F2C34'}}>
          <div style={{width: 76, height: 76, borderRadius: 76, background: '#0A0A0A', display: 'grid', placeItems: 'center'}}>
            <Ico n="scissors.png" size={50} style={{filter: 'none'}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#E9EDEF'}}>Your Salon</div>
            <div style={{fontFamily: SANS, fontSize: 22, color: C.wa}}>{t > W(64) - 0.05 && t < W(69) ? 'AI agent typing…' : 'online'}</div>
          </div>
          <Img src={icon('whatsapp-icon.svg')} style={{width: 56, height: 56}} />
        </div>
        <div style={{padding: '22px 24px'}}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 14}}>
            <div style={{fontFamily: SANS, fontSize: 20, color: '#8696A0', background: '#182229', borderRadius: 12, padding: '6px 14px'}}>Missed call · auto-reply sent in 1 sec</div>
          </div>
          {typed.length > 0 && (
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 14}}>
              <div style={{maxWidth: 600, background: '#005C4B', color: '#E9EDEF', fontFamily: SANS, fontSize: 32, lineHeight: 1.3, padding: '16px 20px', borderRadius: 22, borderTopRightRadius: 6}}>{typed}</div>
            </div>
          )}
          {bubbles.map((m, i) => {
            const p = sp(t, m.at, 380, 20);
            if (p <= 0) return null;
            return (
              <div key={i} style={{display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', marginBottom: 14, opacity: m1(p * 2), transform: `scale(${lerp(0.6, 1, m1(p))})`, transformOrigin: m.me ? '100% 50%' : '0 50%'}}>
                <div style={{maxWidth: 600, background: m.me ? '#005C4B' : '#202C33', color: '#E9EDEF', fontFamily: SANS, fontSize: 32, lineHeight: 1.3, padding: '16px 20px', borderRadius: 22}}>
                  {m.ai && <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 18, color: C.lime, letterSpacing: '0.12em', marginBottom: 4}}>AI AGENT</div>}
                  {m.txt}
                </div>
              </div>
            );
          })}
          {booked > 0 && (
            <div style={{marginTop: 18, borderRadius: 26, background: '#fff', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${lerp(0.5, 1, m1(booked))})`, boxShadow: '0 0 50px rgba(200,255,62,0.35)', border: `3px solid ${C.lime}`}}>
              <Img src={icon('google-calendar.svg')} style={{width: 76, height: 76}} />
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#111'}}>Appointment booked</div>
                <div style={{fontFamily: SANS, fontSize: 26, color: '#555'}}>Riya · Haircut · Kal, 5:00 PM</div>
              </div>
              <Ico n="check_mark_button.png" size={70} />
            </div>
          )}
        </div>
      </Phone>
    </Shot>
  );
};

// ---------------------------------------------------------------- 6. you call back a ready lead
const Callback: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.callback;
  const lead = sp(t, W(88) - 0.08, 420, 14);
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <Kicker t={t} at={a}>AAP FREE HUE</Kicker>
      <Phone x={230} y={260} w={620} h={980} bg="#101012">
        <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.6)'}}>Calling back…</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center'}}>
          <Avatar i={1} size={200} style={{border: `5px solid ${C.lime}`}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff'}}>Riya</div>
        <div style={{position: 'absolute', left: 50, right: 50, top: 510, borderRadius: 30, background: 'rgba(200,255,62,0.1)', border: `2px solid ${C.lime}`, padding: '22px 26px', transform: `scale(${lerp(0.6, 1, m1(lead))})`, opacity: m1(lead * 2)}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 24, letterSpacing: '0.16em', color: C.lime}}>READY LEAD</div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', marginTop: 8}}>Haircut · Kal 5:00 PM</div>
          <div style={{fontFamily: SANS, fontSize: 26, color: C.dim}}>Details already collected ✓</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 130, height: 130, borderRadius: 130, background: C.wa, display: 'grid', placeItems: 'center', boxShadow: '0 0 40px rgba(37,211,102,0.5)'}}>
            <Ico n="telephone_receiver.png" size={74} style={{filter: 'none'}} />
          </div>
        </div>
      </Phone>
      <Rings t={t} x={540} y={1145} color={C.wa} />
    </Shot>
  );
};

// ---------------------------------------------------------------- 7. missed call is now a lead
const Flip: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.flip;
  const strike = pt(t, W(94) - 0.05, W(95) + 0.15, ease.inOut);
  const lead = sp(t, W(98) - 0.08, 460, 13);
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
        <div style={{position: 'relative', display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.05em', color: strike > 0.5 ? 'rgba(243,241,236,0.35)' : C.cream, lineHeight: 1, transform: `scale(${lerp(1.4, 1, m1(sp(t, a + 0.05, 420, 16)))})`}}>
          MISSED
          <div style={{position: 'absolute', left: -20, top: '52%', height: 18, width: `${strike * 112}%`, background: C.red, borderRadius: 9, transform: 'rotate(-4deg)'}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.04em', color: C.cream, lineHeight: 1}}>CALL</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', transform: `scale(${lerp(2.4, 1, m1(lead))})`, opacity: m1(lead * 3)}}>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 110, color: C.lime, lineHeight: 1}}>=</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 260, letterSpacing: '-0.06em', ...limeText, lineHeight: 0.95, filter: 'drop-shadow(0 16px 50px rgba(200,255,62,0.45))'}}>LEAD</div>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- 8. CTA: comment CALL
const Cta: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.cta;
  const word = 'CALL';
  const typed = word.slice(0, Math.max(0, Math.min(4, Math.floor((t - W(108) + 0.05) / 0.09))));
  const posted = sp(t, W(109) + 0.1, 420, 16);
  const notif = sp(t, W(111) - 0.1, 360, 16);
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.cream, letterSpacing: '-0.03em', transform: `scale(${lerp(1.4, 1, m1(sp(t, W(100) - 0.06, 420, 16)))})`}}>Apne business ke liye</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, ...limeText, lineHeight: 1, opacity: ap(t, W(104) - 0.06)}}>yeh setup chahiye?</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 620, borderRadius: 40, background: '#fff', padding: '26px 30px', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', transform: `scale(${lerp(0.7, 1, m1(sp(t, W(107) - 0.15, 320, 18)))})`, opacity: ap(t, W(107) - 0.15)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#888', marginBottom: 14}}>Comments</div>
        {posted > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, transform: `scale(${lerp(0.6, 1, m1(posted))})`, transformOrigin: '0 50%'}}>
            <Avatar i={4} size={70} />
            <div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#111'}}>you</div>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#111', letterSpacing: '-0.02em'}}>CALL</div>
            </div>
            <Ico n="red_heart.png" size={44} style={{marginLeft: 'auto'}} />
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#F2F2F2', borderRadius: 999, padding: '16px 26px'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: posted > 0 ? '#bbb' : '#111'}}>
            {posted > 0 ? 'Add a comment…' : typed}
            {posted <= 0 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#0095F6'}}>Post</span>
        </div>
      </div>
      <Ico n="backhand_index_pointing_down.png" size={130} style={{position: 'absolute', left: 475, top: 480 + Math.sin(t * 6) * 14, opacity: posted > 0 ? 0 : ap(t, W(107))}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1060, display: 'flex', alignItems: 'center', gap: 18, borderRadius: 30, background: 'rgba(30,30,34,0.96)', border: `2px solid ${C.lime}`, padding: '20px 24px', boxShadow: '0 0 60px rgba(200,255,62,0.25)', transform: `translateY(${(1 - m1(notif)) * -120}px)`, opacity: m1(notif * 2)}}>
        <div style={{width: 74, height: 74, borderRadius: 74, background: '#0A0A0A', display: 'grid', placeItems: 'center', border: `2px solid ${C.lime}`}}>
          <Img src={staticFile('brand/nx-logo.png')} style={{width: 54, height: 39}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>Neuraxine sent you a message</div>
          <div style={{fontFamily: SANS, fontSize: 24, color: C.dim}}>Missed-call automation ki details 👇 · now</div>
        </div>
        <InstaMark size={54} />
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- captions (voice-over), only where the graphic doesn't already say it
const LIME_W = new Set(['whatsapp', 'turant', 'ai', 'agent', 'appointment', 'book', 'lead', 'ready', 'setup', 'call', 'details', 'reply', 'hi', 'customer']);
const RED_W = new Set(['missed', 'lost', 'kabhi', 'nahi', 'agle']);
const CAP_OFF: [number, number][] = [
  [0, W(7) - 0.12], // the hook graphic carries the words
  [W(91) - 0.12, W(100) - 0.12], // kinetic MISSED CALL = LEAD
  [W(100) - 0.12, W(107) - 0.12], // the CTA question is on screen
];
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length + (nx ? nx.w.length + 1 : 0);
    if (/[.,?!…"]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > 0.3 || chars > 20) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  if (CAP_OFF.some(([a, b]) => t >= a && t < b)) return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const len = c.words.map((w) => w.w).join(' ').length;
  const fit = Math.max(0.66, Math.min(1, 16 / Math.max(1, len)));
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 1600, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', columnGap: 30}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const on = i === cur;
        const seen = i <= cur;
        const wp = sp(t, w.s - 0.04, 520, 18);
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 900, fontSize: 78 * fit, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1.1, whiteSpace: 'nowrap', display: 'inline-block', ...(seen ? (RED_W.has(k) ? redText : LIME_W.has(k) ? limeText : {color: '#fff'}) : {color: 'rgba(255,255,255,0.4)'}), transform: `scale(${on ? lerp(1.3, 1.06, m1(wp)) : 1})`, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.9))'}}>
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.2) return null;
  const r = t - a;
  return (
    <AbsoluteFill style={{opacity: pt(t, a - 0.2, a + 0.1)}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.7, 1, m1(sp(t, a, 200, 14)))})`}}>
        <Img src={staticFile('brand/nx-logo.png')} style={{width: 400, height: 291, filter: 'drop-shadow(0 0 50px rgba(200,255,62,0.35))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '0.08em', paddingLeft: '0.08em', ...silverText, opacity: pt(r, 0.1, 0.45)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.3, 0.7)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 40px', borderRadius: 999, background: LIME_GRAD, fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.ink}}>
          Comment &ldquo;CALL&rdquo; for details
        </div>
      </div>
      <Ico n="backhand_index_pointing_down.png" size={120} style={{position: 'absolute', left: 480, top: 1080 + Math.sin(t * 6) * 14, opacity: pt(r, 0.5, 0.8)}} />
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = Math.max(0, ...CUTS.map((c) => 1 - Math.min(1, Math.abs(t - c) / 0.05)));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Hook t={t} />
      <Busy t={t} />
      <Next t={t} />
      <WhatIf t={t} />
      <Chat t={t} />
      <Callback t={t} />
      <Flip t={t} />
      <Cta t={t} />
      {t < edit.speech && <Captions t={t} />}
      <AbsoluteFill style={{background: C.lime, opacity: flash * 0.16, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 62%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.45} />}
    </AbsoluteFill>
  );
};
