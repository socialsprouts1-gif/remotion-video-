import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neura Chat: Akola survey talking head. One uncut take; the voice is the cleaned, lip-synced track
// (public/audio/voice.wav), so the clip itself plays muted. Every overlay starts on the word that names it.
const C = {
  green: '#25D366',
  deep: '#075E54',
  mint: '#7CFFB2',
  yellow: '#FFD23F',
  red: '#FF4D4D',
  ink: '#0B1410',
  white: '#FFFFFF',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const SHADOW = '0 2px 4px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.45)';
// heavy outline so white type reads on the cream wall and the white T-shirt
const OUTLINE = [
  '0 0 2px #000', '3px 3px 0 #000', '-3px 3px 0 #000', '3px -3px 0 #000', '-3px -3px 0 #000',
  '0 4px 0 #000', '0 -4px 0 #000', '4px 0 0 #000', '-4px 0 0 #000', '0 10px 24px rgba(0,0,0,0.5)',
].join(', ');

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const CUE = edit.cues as Record<string, number>;
const CW = edit.cueWord as Record<string, number>;
const Q = (k: string) => CUE[k];
const QE = (k: string) => WORDS[CW[k]].e;
const sp = (t: number, at: number, stiffness = 240, damping = 15) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const m1 = (v: number) => Math.min(1, v);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const icon = (n: string) => staticFile(`icons/${n}`);
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9/]/g, '');

// ---------------------------------------------------------------- camera: punch-ins on the face (origin = face centre)
type Cam = {at: number; z: number; d?: number};
const CAM: Cam[] = [
  {at: 0, z: 1.0},
  {at: Q('grid') - 0.05, z: 1.045, d: 0.5},
  {at: Q('green') - 0.1, z: 1.0, d: 0.5},
  {at: Q('red') - 0.05, z: 1.085, d: 0.14},
  {at: Q('socho') - 0.15, z: 1.0, d: 0.5},
  {at: Q('lost') - 0.05, z: 1.06, d: 0.14},
  {at: Q('solution') - 0.2, z: 1.0, d: 0.6},
  {at: Q('brand') - 0.04, z: 1.1, d: 0.12},
  {at: Q('sub') - 0.1, z: 1.03, d: 0.9},
  {at: Q('f1') - 0.2, z: 1.0, d: 0.6},
  {at: Q('busy') - 0.05, z: 1.06, d: 0.14},
  {at: Q('offer') - 0.15, z: 1.0, d: 0.5},
  {at: Q('gift') - 0.04, z: 1.075, d: 0.14},
  {at: Q('late') - 0.4, z: 1.0, d: 0.6},
  {at: Q('type') - 0.05, z: 1.06, d: 0.14},
  {at: Q('outro') - 0.1, z: 1.0, d: 0.5},
  {at: Q('smarter') - 0.04, z: 1.09, d: 0.14},
];
const camera = (t: number) => {
  let z = 1;
  for (let i = 0; i < CAM.length; i++) {
    const c = CAM[i];
    if (t < c.at) break;
    const prevZ = i ? CAM[i - 1].z : 1;
    z = lerp(prevZ, c.z, pt(t, c.at, c.at + (c.d ?? 0.4), c.d && c.d < 0.2 ? ease.out : ease.inOut));
  }
  // breathing drift so a held frame never looks frozen
  return {z: z * (1 + 0.006 * Math.sin(t * 0.7)), x: 0.35 * Math.sin(t * 0.45), y: 0.25 * Math.sin(t * 0.37 + 1)};
};

// ---------------------------------------------------------------- building blocks
const Reveal: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; d?: number}> = ({t, at, children, style, d = 0.45}) => {
  const p = pt(t, at, at + d, ease.out);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 8}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%)`, ...style}}>{children}</div>
    </div>
  );
};

const Icon: React.FC<{n: string; size: number; t: number; at: number; style?: React.CSSProperties; float?: number}> = ({n, size, t, at, style, float = 0}) => {
  const p = sp(t, at, 300, 13);
  return (
    <div style={{width: size, height: size, flex: 'none', transform: `translateY(${(1 - m1(p)) * 30 + Math.sin(t * 2.4 + at) * float}px) rotate(${lerp(-20, 0, m1(p))}deg) scale(${p})`, filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.45))', ...style}}>
      <Img src={icon(n)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

/** Dark glass card in the lower half; springs up in, sinks out. */
const Card: React.FC<{t: number; a: number; b: number; top: number; h: number; children: React.ReactNode; accent?: string}> = ({t, a, b, top, h, children, accent = C.green}) => {
  if (t < a || t > b) return null;
  const p = sp(t, a, 210, 18);
  const out = pt(t, b - 0.28, b, ease.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top,
        height: h,
        borderRadius: 44,
        background: 'linear-gradient(180deg, rgba(14,24,20,0.86), rgba(6,12,10,0.9))',
        border: `2px solid ${accent}55`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.3)`,
        backdropFilter: 'blur(18px)',
        opacity: m1(p * 1.6) * (1 - out),
        transform: `translateY(${(1 - m1(p)) * 140 + out * 80}px) scale(${lerp(0.9, 1, m1(p)) - out * 0.05})`,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

/** Small label pill above the head. */
const Kicker: React.FC<{t: number; a: number; b: number; n: string; label: string; color?: string}> = ({t, a, b, n, label, color = C.green}) => {
  if (t < a || t > b) return null;
  const p = sp(t, a, 260, 16);
  const out = pt(t, b - 0.25, b, ease.in);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 268, display: 'flex', justifyContent: 'center', opacity: (1 - out) * m1(p * 2), transform: `translateY(${(1 - m1(p)) * -40 - out * 30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px 14px 18px', borderRadius: 999, background: 'rgba(8,14,12,0.86)', border: `2px solid ${color}88`, boxShadow: '0 14px 40px rgba(0,0,0,0.35)'}}>
        <Icon n={n} size={64} t={t} at={a + 0.05} />
        <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 40, letterSpacing: '0.08em', color: '#fff', whiteSpace: 'nowrap'}}>{label}</div>
      </div>
    </div>
  );
};

const count = (t: number, a: number, d: number, to: number) => Math.round(to * pt(t, a, a + d, ease.out));

// ---------------------------------------------------------------- scene 1-3: the survey grid (one card, three beats)
const DOT_COLOR = (i: number, t: number) => {
  if (i < 20 && t >= Q('green') + i * 0.025) return C.green;
  if (i >= 20 && i < 50 && t >= Q('yellow') + (i - 20) * 0.018) return C.yellow;
  if (i >= 50 && t >= Q('red') + (i - 50) * 0.014) return C.red;
  return '#E8EDEA';
};
const Survey: React.FC<{t: number}> = ({t}) => {
  const a = Q('grid') - 0.15;
  const b = Q('socho') + 0.05;
  const rows: {at: number; dot: string; n: number; label: string; ico: string}[] = [
    {at: Q('green'), dot: C.green, n: 20, label: '2 ghante mein reply', ico: 'stopwatch.png'},
    {at: Q('yellow'), dot: C.yellow, n: 30, label: '1 din mein reply', ico: 'hourglass_done.png'},
    {at: Q('red'), dot: C.red, n: 50, label: 'reply hi nahi', ico: 'cross_mark.png'},
  ];
  const wave = Q('send');
  return (
    <Card t={t} a={a} b={b} top={1188} h={420}>
      {/* 10 x 10 businesses */}
      <div style={{position: 'absolute', left: 42, top: 44, width: 332, height: 332}}>
        {Array.from({length: 100}, (_, i) => {
          const r = Math.floor(i / 10), c = i % 10;
          const at = Q('grid') - 0.05 + (r + c) * 0.035;
          const p = sp(t, at, 420, 14);
          const col = DOT_COLOR(i, t);
          const flip = col !== '#E8EDEA' ? sp(t, i < 20 ? Q('green') + i * 0.025 : i < 50 ? Q('yellow') + (i - 20) * 0.018 : Q('red') + (i - 50) * 0.014, 420, 12) : 1;
          // a "message sent" wave rolls across the grid on "message"
          const wv = Math.max(0, 1 - Math.abs((t - wave) * 6 - (r + c) * 0.35));
          const dead = col === C.red ? 0.55 : 1;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c * 33.5,
                top: r * 33.5,
                width: 24,
                height: 24,
                borderRadius: 8,
                background: col,
                opacity: dead,
                transform: `scale(${p * (0.75 + 0.25 * m1(flip)) * (1 + wv * 0.35)})`,
                boxShadow: col === C.green ? `0 0 14px ${C.green}aa` : col === C.yellow ? `0 0 10px ${C.yellow}88` : 'none',
              }}
            />
          );
        })}
      </div>
      {/* right column: the numbers */}
      <div style={{position: 'absolute', left: 420, top: 34, right: 36}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Icon n="envelope_with_arrow.png" size={70} t={t} at={Q('grid')} />
          <div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, lineHeight: 1, color: '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{count(t, Q('grid'), 0.7, 100)}</div>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: 'rgba(255,255,255,0.7)'}}>businesses ko message</div>
          </div>
        </div>
        <div style={{height: 2, background: 'rgba(255,255,255,0.12)', margin: '18px 0 14px'}} />
        {rows.map((r, k) => {
          if (t < r.at - 0.05) return <div key={k} style={{height: 80}} />;
          const p = sp(t, r.at - 0.05, 280, 17);
          return (
            <div key={k} style={{height: 80, display: 'flex', alignItems: 'center', gap: 16, opacity: m1(p * 1.5), transform: `translateX(${(1 - m1(p)) * 60}px)`}}>
              <div style={{width: 20, height: 20, borderRadius: 6, background: r.dot, boxShadow: `0 0 12px ${r.dot}`}} />
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 58, color: r.dot, width: 82, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{count(t, r.at, 0.5, r.n)}</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 31, color: '#fff', flex: 1, lineHeight: 1.05}}>{r.label}</div>
              <Icon n={r.ico} size={54} t={t} at={r.at + 0.1} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- scene 4: the enquiry nobody answers
const Bubble: React.FC<{t: number; at: number; out?: boolean; children: React.ReactNode; time: string; ticks?: 'grey' | 'blue'}> = ({t, at, out, children, time, ticks}) => {
  const p = sp(t, at, 320, 16);
  if (t < at) return null;
  return (
    <div style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginBottom: 14, transform: `scale(${lerp(0.7, 1, m1(p))}) translateY(${(1 - m1(p)) * 20}px)`, transformOrigin: out ? '100% 100%' : '0% 100%', opacity: m1(p * 2)}}>
      <div style={{maxWidth: 640, padding: '16px 22px 10px', borderRadius: 26, borderTopLeftRadius: out ? 26 : 6, borderTopRightRadius: out ? 6 : 26, background: out ? '#005C4B' : '#202C33', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 36, color: '#E9EDEF', lineHeight: 1.25}}>{children}</div>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 22, color: 'rgba(233,237,239,0.6)', marginTop: 4}}>
          {time}
          {ticks && (
            <svg width={30} height={18} viewBox="0 0 30 18">
              <path d="M2 10 L7 15 L17 4 M12 13 L14 15 L24 4" fill="none" stroke={ticks === 'blue' ? '#53BDEB' : '#8696A0'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{name: string; sub: string; avatar: string; brand?: boolean}> = ({name, sub, avatar, brand}) => (
  <div style={{height: 104, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', background: '#1F2C34', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
    <svg width={22} height={34} viewBox="0 0 22 34">
      <path d="M18 3 L4 17 L18 31" fill="none" stroke="#AEBAC1" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{width: 66, height: 66, borderRadius: 66, background: brand ? '#0E1A15' : '#3B4A54', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <Img src={brand ? staticFile('brand/logo-alpha.png') : icon(avatar)} style={{width: brand ? 54 : 52, height: brand ? 40 : 52, objectFit: 'contain'}} />
    </div>
    <div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#E9EDEF', display: 'flex', alignItems: 'center', gap: 10}}>
        {name}
        {brand && (
          <svg width={30} height={30} viewBox="0 0 24 24">
            <path d="M12 1.5l2.6 2 3.2-.3.9 3.1 2.8 1.6-1 3.1 1 3.1-2.8 1.6-.9 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-.9-3.1L2.5 15.1l1-3.1-1-3.1 2.8-1.6.9-3.1 3.2.3z" fill={C.green} />
            <path d="M7.5 12.2l3 3 6-6.2" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 25, color: '#8696A0'}}>{sub}</div>
    </div>
  </div>
);

const WAITS = ['1 min', '10 min', '1 ghanta', '3 ghante', '1 din'];
const Enquiry: React.FC<{t: number}> = ({t}) => {
  const a = Q('chat') - 0.12;
  const b = Q('solution') - 0.05;
  const lost = Q('lost');
  const chatOut = pt(t, lost - 0.1, lost + 0.35, ease.in);
  const flowIn = pt(t, lost + 0.1, lost + 0.55, ease.out);
  const nr = Q('noreply');
  const wi = Math.min(WAITS.length - 1, Math.max(0, Math.floor((t - nr) / 0.28)));
  return (
    <Card t={t} a={a} b={b} top={1170} h={440} accent={t > lost ? C.red : C.green}>
      {/* phase A: the chat */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - chatOut, transform: `translateX(${-chatOut * 120}px)`, background: '#0B141A'}}>
        <ChatHeader name="Potential customer" sub={t > Q('enquiry') ? 'online' : 'last seen today'} avatar="person_raising_hand.png" />
        <div style={{padding: '26px 30px'}}>
          <Bubble t={t} at={Q('enquiry') - 0.05} time="11:42 PM">
            Hi! Aapki service ka price kya hai?
          </Bubble>
          {t >= nr - 0.05 && (
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, opacity: m1(sp(t, nr - 0.05) * 2)}}>
              <Icon n="hourglass_not_done.png" size={58} t={t} at={nr - 0.05} />
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: C.red}}>No reply</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,0.75)', fontVariantNumeric: 'tabular-nums', padding: '6px 18px', borderRadius: 999, background: 'rgba(255,77,77,0.16)', border: '1.5px solid rgba(255,77,77,0.5)'}}>
                {WAITS[wi]}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* phase B: the customer walks to a competitor */}
      {t > lost - 0.1 && (
        <div style={{position: 'absolute', inset: 0, opacity: flowIn}}>
          {(() => {
            const walk = pt(t, lost + 0.3, Q('contact') - 0.1, ease.inOut);
            const x = lerp(150, 690, walk);
            const won = sp(t, Q('contact'), 300, 14);
            return (
              <>
                <div style={{position: 'absolute', left: 40, top: 60, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: lerp(1, 0.55, walk)}}>
                  <Icon n="convenience_store.png" size={150} t={t} at={lost + 0.1} />
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 8}}>Aapka business</div>
                </div>
                <div style={{position: 'absolute', right: 40, top: 60, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <Icon n="department_store.png" size={150} t={t} at={lost + 0.25} />
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 8}}>Competitor</div>
                </div>
                <svg width={960} height={440} style={{position: 'absolute', inset: 0}}>
                  <path d="M 250 150 Q 480 40 710 150" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" />
                </svg>
                <div style={{position: 'absolute', left: x - 55, top: 120 - Math.sin(walk * Math.PI) * 70 + Math.abs(Math.sin(walk * 18)) * -8, width: 110, height: 110, transform: `scale(${m1(sp(t, lost + 0.2))})`}}>
                  <Img src={icon('person_walking.png')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.5))'}} />
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center', opacity: m1(won * 2), transform: `scale(${lerp(0.6, 1, m1(won))})`}}>
                  <Icon n="money_with_wings.png" size={74} t={t} at={Q('contact')} float={6} />
                  <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, color: C.red, letterSpacing: '-0.03em'}}>Lead lost</div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------- scene 5: Neura Chat
const Brand: React.FC<{t: number}> = ({t}) => {
  const a = Q('brand') - 0.12;
  const b = Q('f1') - 0.12;
  const logo = sp(t, a + 0.02, 200, 13);
  const fl = Q('flow');
  const dotP = ((t - fl) / 1.3) % 1;
  return (
    <Card t={t} a={a} b={b} top={1170} h={440}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 30% 30%, ${C.green}30, transparent 70%)`}} />
      <div style={{position: 'absolute', left: 46, top: 40, display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={{width: 170, height: 124, transform: `scale(${logo}) rotate(${lerp(-90, 0, m1(logo))}deg)`, filter: `drop-shadow(0 0 30px ${C.green}66)`}}>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>
        <div>
          <Reveal t={t} at={a + 0.1} style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '-0.05em', color: '#fff', lineHeight: 0.95}}>
            Neura Chat
          </Reveal>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 4}}>
            <Icon n="whatsapp-icon.svg" size={48} t={t} at={Q('sub') - 0.05} />
            <Reveal t={t} at={Q('sub') - 0.02} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.mint, lineHeight: 1}}>
              WhatsApp automation software
            </Reveal>
          </div>
        </div>
      </div>
      {/* enquiry -> AI -> reply */}
      {t > fl - 0.1 && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 248, height: 150, opacity: m1(sp(t, fl - 0.1) * 2)}}>
          <div style={{position: 'absolute', left: 120, right: 120, top: 60, height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.12)'}} />
          <div style={{position: 'absolute', left: 120, top: 60, height: 6, borderRadius: 6, width: `${clamp01((t - fl) / 0.9) * 600}px`, background: `linear-gradient(90deg, ${C.green}, ${C.mint})`}} />
          {t > fl && <div style={{position: 'absolute', left: 120 + lerp(0, 600, dotP) - 12, top: 51, width: 24, height: 24, borderRadius: 24, background: C.mint, boxShadow: `0 0 20px ${C.green}`}} />}
          {[
            {n: 'speech_balloon.png', l: 'Enquiry', at: fl - 0.05, x: 0},
            {n: 'robot.png', l: 'AI', at: fl + 0.3, x: 330},
            {n: 'check_mark_button.png', l: 'Reply', at: Q('help'), x: 660},
          ].map((s) => (
            <div key={s.l} style={{position: 'absolute', left: s.x, top: 0, width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Icon n={s.n} size={110} t={t} at={s.at} />
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff', opacity: pt(t, s.at + 0.1, s.at + 0.4)}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------- scene 6: features, each ticks on its own word
const FEATS = [
  {k: 'f1', n: 'crescent_moon.png', label: '24/7 replies'},
  {k: 'f2', n: 'repeat_button.png', label: 'Automated follow-ups'},
  {k: 'f3', n: 'spiral_calendar.png', label: 'Appointments book'},
  {k: 'f4', n: 'bullseye.png', label: 'Leads qualify'},
  {k: 'f5', n: 'file_cabinet.png', label: 'Data store'},
];
const Features: React.FC<{t: number}> = ({t}) => {
  const a = Q('f1') - 0.15;
  const b = Q('busy') - 0.05;
  return (
    <Card t={t} a={a} b={b} top={1150} h={448}>
      <div style={{position: 'absolute', left: 40, top: 24, right: 40}}>
        {FEATS.map((f, k) => {
          const at = Q(f.k) - 0.08;
          const next = k + 1 < FEATS.length ? Q(FEATS[k + 1].k) - 0.08 : Q('busy');
          const p = sp(t, at, 300, 17);
          const on = t >= at && t < next;
          const done = t >= at + 0.45;
          return (
            <div key={f.k} style={{height: 80, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', borderRadius: 24, background: on ? 'rgba(37,211,102,0.16)' : 'transparent', border: `2px solid ${on ? C.green + 'aa' : 'transparent'}`, opacity: t < at ? 0.18 : m1(p * 1.6), transform: `translateX(${t < at ? 0 : (1 - m1(p)) * 70}px)`, marginBottom: 2}}>
              <div style={{width: 60, height: 60, filter: t < at ? 'grayscale(1)' : 'none'}}>
                <Img src={icon(f.n)} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${t < at ? 0.8 : lerp(0.4, 1, m1(p))}) rotate(${on ? Math.sin(t * 6) * 6 : 0}deg)`}} />
              </div>
              <div style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff', letterSpacing: '-0.025em'}}>{f.label}</div>
              <div style={{width: 52, height: 52, borderRadius: 52, background: done ? C.green : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? sp(t, at + 0.45, 400, 12) : 1})`, boxShadow: done ? `0 0 18px ${C.green}99` : 'none'}}>
                {done && (
                  <svg width={30} height={30} viewBox="0 0 24 24">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#06200F" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - pt(t, at + 0.45, at + 0.7))} />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- scene 7: busy owner, enquiries still handled
const Busy: React.FC<{t: number}> = ({t}) => {
  const a = Q('busy') - 0.1;
  const b = Q('offer') - 0.05;
  const r = Q('robot');
  const handled = Math.max(0, Math.floor((t - r) / 0.16));
  const easy = sp(t, Q('easy') - 0.05, 300, 12);
  return (
    <Card t={t} a={a} b={b} top={1180} h={420}>
      <div style={{position: 'absolute', left: 40, top: 40, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative'}}>
          <Icon n="briefcase.png" size={150} t={t} at={Q('busy')} />
          <div style={{position: 'absolute', right: -40, top: -20}}>
            <Icon n="alarm_clock.png" size={74} t={t} at={Q('busy') + 0.2} style={{transform: `rotate(${Math.sin(t * 30) * 8}deg)`}} />
          </div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: '#fff', marginTop: 12}}>Aap busy</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: 'rgba(255,255,255,0.7)'}}>meeting, kaam, ghar</div>
      </div>
      <svg width={960} height={420} style={{position: 'absolute', inset: 0}}>
        <path d={`M 350 140 L ${lerp(350, 560, pt(t, r - 0.2, r + 0.3))} 140`} stroke={C.green} strokeWidth={6} strokeLinecap="round" />
        {t > r + 0.3 && <path d="M 545 122 L 565 140 L 545 158" fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <div style={{position: 'absolute', right: 10, top: 30, width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Icon n="robot.png" size={160} t={t} at={r - 0.1} float={5} />
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: C.mint, marginTop: 6}}>Neura Chat</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, opacity: pt(t, r, r + 0.3)}}>
          <Img src={icon('check_mark_button.png')} style={{width: 40, height: 40}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{handled} enquiries handled</span>
        </div>
      </div>
      {/* "easy" stamp */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: m1(easy * 2), transform: `scale(${lerp(1.6, 1, m1(easy))}) rotate(-3deg)`}}>
        <Icon n="thumbs_up.png" size={66} t={t} at={Q('easy') - 0.05} />
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 58, color: C.yellow, letterSpacing: '-0.03em'}}>Handle karna easy</div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- scene 8: offer for the first 20
const Offer: React.FC<{t: number}> = ({t}) => {
  const a = Q('offer') - 0.1;
  const b = Q('late') - 0.4;
  const s = Q('slots');
  const g = sp(t, Q('gift') - 0.08, 260, 13);
  return (
    <Card t={t} a={a} b={b} top={1170} h={440} accent={C.yellow}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 70% at 80% 80%, ${C.yellow}22, transparent 70%)`}} />
      <div style={{position: 'absolute', left: 44, top: 34, display: 'flex', alignItems: 'baseline', gap: 18}}>
        <Reveal t={t} at={Q('offer') + 0.15} style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.02em'}}>
          Akola ke first
        </Reveal>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 118, color: C.yellow, letterSpacing: '-0.06em', lineHeight: 0.8, transform: `scale(${m1(sp(t, s - 0.05, 300, 12))})`, transformOrigin: '0% 80%'}}>20</div>
        <Reveal t={t} at={s + 0.2} style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.02em'}}>
          businesses
        </Reveal>
      </div>
      {/* 20 slots */}
      <div style={{position: 'absolute', left: 44, right: 44, top: 168, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 12}}>
        {Array.from({length: 20}, (_, i) => {
          const at = s + 0.05 + i * 0.045;
          const p = sp(t, at, 380, 14);
          return <div key={i} style={{height: 46, borderRadius: 12, background: t >= at ? `linear-gradient(180deg, ${C.yellow}, #F2A900)` : 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,210,63,0.35)', transform: `scale(${t >= at ? lerp(0.6, 1, m1(p)) : 1})`, boxShadow: t >= at ? '0 0 14px rgba(255,210,63,0.45)' : 'none'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 44, right: 44, bottom: 40, display: 'flex', alignItems: 'center', gap: 22, opacity: m1(g * 2), transform: `translateY(${(1 - m1(g)) * 40}px)`}}>
        <Icon n="wrapped_gift.png" size={110} t={t} at={Q('gift') - 0.08} float={6} />
        <div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 62, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1}}>Special pricing</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: C.yellow, lineHeight: 1.05}}>benefit, sirf pehle 20 ke liye</div>
        </div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- scene 9: late reply = lead miss, then the CTA typed into WhatsApp
const TYPED = 'Automation';
const Cta: React.FC<{t: number}> = ({t}) => {
  const a = Q('late') - 0.15;
  const b = Q('outro') - 0.02;
  const c = Q('compose');
  const swap = pt(t, c - 0.15, c + 0.25, ease.inOut);
  const ty = Q('type');
  const tyE = QE('type');
  const n = Math.max(0, Math.min(TYPED.length, Math.ceil(((t - ty) / Math.max(0.3, tyE - ty)) * TYPED.length)));
  const sent = Q('send2');
  const isSent = t >= sent;
  const press = isSent ? 1 - pt(t, sent, sent + 0.25) : 0;
  return (
    <Card t={t} a={a} b={b} top={1160} h={450}>
      {/* phase A */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `translateY(${-swap * 60}px)`}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 330}}>
            <Icon n="hourglass_not_done.png" size={150} t={t} at={Q('late')} />
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: '#fff', marginTop: 10}}>Late reply</div>
          </div>
          <svg width={160} height={60}>
            <path d={`M 10 30 L ${lerp(10, 140, pt(t, Q('late') + 0.3, Q('miss')))} 30`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
            {t > Q('miss') - 0.05 && <path d="M 120 10 L 142 30 L 120 50" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 330, opacity: t >= Q('miss') - 0.08 ? 1 : 0.2}}>
            <Icon n="money_with_wings.png" size={150} t={t} at={Q('miss') - 0.08} float={8} />
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.red, marginTop: 10}}>Lead miss</div>
          </div>
        </div>
      </div>
      {/* phase B: WhatsApp, type "Automation", send */}
      {t > c - 0.2 && (
        <div style={{position: 'absolute', inset: 0, opacity: swap, background: '#0B141A', transform: `translateY(${(1 - swap) * 60}px)`}}>
          <ChatHeader name="Neura Chat" sub="business account" avatar="" brand />
          <div style={{position: 'absolute', left: 30, right: 30, top: 130, height: 150}}>
            {isSent && (
              <Bubble t={t} at={sent} out time="now" ticks={t >= Q('karo') + 0.1 ? 'blue' : 'grey'}>
                <span style={{fontWeight: 800}}>Automation</span>
              </Bubble>
            )}
          </div>
          <div style={{position: 'absolute', left: 24, right: 24, bottom: 26, display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1, height: 96, borderRadius: 48, background: '#1F2C34', display: 'flex', alignItems: 'center', padding: '0 34px', fontFamily: SANS, fontSize: 42, color: n && !isSent ? '#E9EDEF' : '#8696A0', fontWeight: n && !isSent ? 700 : 400}}>
              {isSent ? 'Message' : n ? TYPED.slice(0, n) : 'Message'}
              {!isSent && t > c + 0.1 && <span style={{width: 4, height: 50, marginLeft: 4, background: C.green, opacity: Math.sin(t * 16) > 0 ? 1 : 0}} />}
            </div>
            <div style={{width: 96, height: 96, borderRadius: 96, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.18 + (n === TYPED.length && !isSent ? 0.06 * Math.sin(t * 14) : 0)})`, boxShadow: `0 0 ${20 + press * 30}px ${C.green}99`}}>
              <svg width={46} height={46} viewBox="0 0 24 24">
                <path d="M3 20.5l18-8.5L3 3.5l.1 6.6L15 12 3.1 13.9z" fill="#0B141A" />
              </svg>
            </div>
          </div>
          {/* finger comes down onto send */}
          {t > sent - 0.45 && t < sent + 0.8 && (
            <div style={{position: 'absolute', right: 2, bottom: 96 + (1 - pt(t, sent - 0.45, sent - 0.02, ease.out)) * 110 - press * 16, width: 104, height: 104, opacity: 1 - pt(t, sent + 0.5, sent + 0.8)}}>
              <Img src={icon('backhand_index_pointing_down.png')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))'}} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------- scene 10: smarter
const Outro: React.FC<{t: number}> = ({t}) => {
  const a = Q('outro') - 0.08;
  const b = edit.speech + 0.1;
  const sm = Q('smarter');
  const lg = sp(t, Q('logo') - 0.1, 220, 14);
  return (
    <Card t={t} a={a} b={b} top={1170} h={430}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${C.green}2a, transparent 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Reveal t={t} at={a + 0.1} style={{fontFamily: SANS, fontWeight: 900, fontSize: 60, color: '#fff', letterSpacing: '-0.035em'}}>
          Akola&apos;s businesses
        </Reveal>
        <div style={{position: 'relative'}}>
          <Reveal t={t} at={sm - 0.06} d={0.5} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, color: C.mint, lineHeight: 0.95, filter: `drop-shadow(0 0 24px ${C.green}88)`}}>
            smarter
          </Reveal>
          {Array.from({length: 6}, (_, i) => {
            const p = pt(t, sm + i * 0.07, sm + 0.9 + i * 0.07);
            const ang = (i / 6) * Math.PI * 2 + 0.4;
            return (
              <div key={i} style={{position: 'absolute', left: 210 + Math.cos(ang) * (60 + p * 220) - 30, top: 70 + Math.sin(ang) * (30 + p * 110) - 30, width: 60, height: 60, opacity: Math.sin(p * Math.PI), transform: `scale(${0.5 + p}) rotate(${p * 90}deg)`}}>
                <Img src={icon('sparkles.png')} style={{width: '100%', height: '100%'}} />
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, opacity: m1(lg * 2), transform: `translateY(${(1 - m1(lg)) * 30}px)`}}>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 48, color: 'rgba(255,255,255,0.8)'}}>with</span>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: 84, height: 62, objectFit: 'contain'}} />
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 58, color: '#fff', letterSpacing: '-0.04em'}}>Neura Chat</span>
        </div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- kicker labels above the head
const Kickers: React.FC<{t: number}> = ({t}) => (
  <>
    <Kicker t={t} a={Q('survey') - 0.1} b={Q('socho') - 0.05} n="round_pushpin.png" label="AKOLA SURVEY" />
    <Kicker t={t} a={Q('socho') - 0.05} b={Q('solution') - 0.1} n="thinking_face.png" label="AB SOCHO..." color={C.red} />
    <Kicker t={t} a={Q('solution') - 0.05} b={Q('f1') - 0.15} n="light_bulb.png" label="SOLUTION" color={C.yellow} />
    <Kicker t={t} a={Q('f1') - 0.12} b={Q('busy') - 0.05} n="robot.png" label="KYA KARTA HAI" />
    <Kicker t={t} a={Q('busy') - 0.05} b={Q('offer') - 0.05} n="briefcase.png" label="BUSY HO? NO PROBLEM" />
    <Kicker t={t} a={Q('offer') - 0.05} b={Q('late') - 0.4} n="wrapped_gift.png" label="AKOLA SPECIAL" color={C.yellow} />
    <Kicker t={t} a={Q('late') - 0.15} b={Q('compose') - 0.1} n="warning.png" label="LEADS MISS NA HON" color={C.red} />
    <Kicker t={t} a={Q('compose') - 0.1} b={Q('outro') - 0.02} n="whatsapp-icon.svg" label='WHATSAPP KARO "AUTOMATION"' />
    <Kicker t={t} a={Q('outro') - 0.05} b={edit.speech + 0.05} n="rocket.png" label="LET'S GO, AKOLA" />
  </>
);

// ---------------------------------------------------------------- captions: bold, outlined, karaoke pill on the spoken word
const HOT = new Set(['akola', 'survey', '100', '20', '2', '30', 'whatsapp', 'enquiry', 'enquiries', 'neura', 'chat', 'automation', 'software', '24/7', 'automated', 'appointments', 'leads', 'data', 'busy', 'easy', 'first', 'special', 'pricing', 'benefit', 'smarter', 'akolas', 'nahi', 'miss', 'late', 'contact']);
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    const brk = /[.?!]["”]?$/.test(w.w) || (/[,—]$/.test(w.w) && chars > 10) || chars + (nx ? nx.w.length : 0) > 21 || !nx || nx.s - w.e > 0.3;
    if (brk) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();

const Captions: React.FC<{t: number; z: number}> = ({t, z}) => {
  const li = LINES.findIndex((x) => t >= x.s - 0.06 && t < x.e);
  if (li < 0) return null;
  const c = LINES[li];
  const p = pt(t, c.s - 0.06, c.s + 0.12, ease.out);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1000 + (z - 1) * 260, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 14, rowGap: 6, opacity: p, transform: `translateY(${(1 - p) * 18}px) scale(${lerp(0.94, 1, p)})`}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const active = t >= w.s - 0.04 && (i === c.words.length - 1 ? t < w.e + 0.25 : t < c.words[i + 1].s - 0.04);
        const seen = t >= w.s - 0.04;
        const wp = pt(t, w.s - 0.04, w.s + 0.1, ease.out);
        const hot = HOT.has(k);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 66,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              padding: '0 12px 4px',
              borderRadius: 16,
              color: active ? C.ink : hot ? C.yellow : '#fff',
              background: active ? `linear-gradient(180deg, ${C.mint}, ${C.green})` : 'transparent',
              boxShadow: active ? '0 6px 18px rgba(0,0,0,0.35)' : 'none',
              textShadow: active ? 'none' : OUTLINE,
              opacity: seen ? 1 : 0.92,
              display: 'inline-block',
              transform: `translateY(${seen ? -5 * (1 - wp) : 0}px) scale(${active ? lerp(1.12, 1.04, wp) : 1}) rotate(${active ? -1.5 : 0}deg)`,
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- flash on scene changes
const FLASHES = ['grid', 'socho', 'brand', 'f1', 'busy', 'offer', 'compose', 'outro'].map(Q);
const Flash: React.FC<{t: number}> = ({t}) => {
  const v = Math.max(0, ...FLASHES.map((a) => (t >= a - 0.12 && t < a + 0.45 ? Math.sin(((t - a + 0.12) / 0.57) * Math.PI) : 0)));
  if (v <= 0) return null;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 45% at ${30 + v * 40}% 70%, rgba(37,211,102,0.5), transparent 70%)`, mixBlendMode: 'screen', opacity: v * 0.8}} />;
};
// red pulse when the leads are lost / nobody replied
const RedPulse: React.FC<{t: number}> = ({t}) => {
  const v = Math.max(0, ...[Q('nahi'), Q('contact'), Q('miss')].map((a) => (t >= a - 0.05 && t < a + 0.7 ? Math.sin(((t - a + 0.05) / 0.75) * Math.PI) : 0)));
  if (v <= 0) return null;
  return <AbsoluteFill style={{boxShadow: `inset 0 0 ${160 * v}px rgba(255,40,40,${0.55 * v})`}} />;
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.25) return null;
  const r = t - a;
  const k = pt(t, a - 0.25, a + 0.15);
  const logo = sp(t, a + 0.05, 170, 14);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 36%, #0F3D25, #030805 72%)', opacity: k}}>
      {Array.from({length: 22}, (_, i) => {
        const y = 1920 - ((rand(i * 3.3) * 1920 + r * (50 + rand(i) * 70)) % 1920);
        return <div key={i} style={{position: 'absolute', left: rand(i * 7.1) * 1080, top: y, width: 6, height: 6, borderRadius: 6, background: C.mint, opacity: 0.35, boxShadow: `0 0 16px ${C.green}`}} />;
      })}
      <div style={{position: 'absolute', left: 340, top: 470, width: 400, height: 292, transform: `scale(${lerp(0.6, 1, m1(logo))}) rotate(${lerp(-25, 0, m1(logo))}deg)`, opacity: m1(logo * 2), filter: `drop-shadow(0 0 40px ${C.green}55)`}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center'}}>
        <Reveal t={r} at={0.15} style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '-0.05em', color: '#fff'}}>
          Neura Chat
        </Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: pt(r, 0.35, 0.7)}}>
        <Img src={icon('whatsapp-icon.svg')} style={{width: 58, height: 58}} />
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 62, color: C.mint}}>WhatsApp automation for Akola</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1140, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: pt(r, 0.7, 1.0), transform: `translateY(${(1 - pt(r, 0.7, 1.1, ease.out)) * 40}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: 'rgba(255,255,255,0.8)', marginBottom: 18}}>WhatsApp par message karo</div>
        <div style={{padding: '26px 64px', borderRadius: 999, background: `linear-gradient(180deg, ${C.mint}, ${C.green})`, fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.ink, letterSpacing: '-0.04em', boxShadow: `0 20px 60px rgba(37,211,102,${0.35 + 0.15 * Math.sin(r * 5)})`, transform: `scale(${1 + 0.025 * Math.sin(r * 5)})`}}>
          &ldquo;Automation&rdquo;
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${cam.x}%, ${cam.y}%) scale(${cam.z})`, transformOrigin: '50% 38%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.07) saturate(1.06) brightness(0.98)'}} />
      </AbsoluteFill>
      {/* grade: vignette + darker lower half so the cards and captions sit on it */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 60% at 50% 40%, transparent 55%, rgba(0,0,0,0.35) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.28), transparent 18%, transparent 52%, rgba(0,0,0,0.42) 75%, rgba(0,0,0,0.55))'}} />
      <Flash t={t} />
      <RedPulse t={t} />
      {t < edit.speech + 0.2 && (
        <>
          <Kickers t={t} />
          <Survey t={t} />
          <Enquiry t={t} />
          <Brand t={t} />
          <Features t={t} />
          <Busy t={t} />
          <Offer t={t} />
          <Cta t={t} />
          <Outro t={t} />
          <Captions t={t} z={cam.z} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
