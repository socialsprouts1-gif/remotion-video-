import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import edit from './edit.json';

// Basic overlay edit: the demo plays untouched (no cuts, no zooms); captions, stickers and the CTA sit on top.
const C = {
  green: '#25D366',
  green2: '#128C4A',
  ink: '#0B0F0D',
  white: '#FFFFFF',
  red: '#FF3B30',
  yellow: '#FFD23F',
  blue: '#2F7BFF',
  dim: 'rgba(255,255,255,0.7)',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;

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
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 300, damping = 18) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const m1 = (v: number) => Math.min(1, v);
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------- icons (drawn, sticker style)
const Svg: React.FC<{size: number; children: React.ReactNode; vb?: string}> = ({size, children, vb = '0 0 24 24'}) => (
  <svg width={size} height={size} viewBox={vb} style={{display: 'block', flexShrink: 0}}>
    {children}
  </svg>
);
const IcoWA: React.FC<{size?: number}> = ({size = 64}) => (
  <Svg size={size}>
    <circle cx={12} cy={12} r={12} fill={C.green} />
    <path d="M12 4.6a7.3 7.3 0 0 0-6.3 11l-1 3.7 3.8-1A7.3 7.3 0 1 0 12 4.6z" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M9.4 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.4.9 1.2 1.7 2.1 2.1l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.3-1.6.4-3-.3a8 8 0 0 1-3.5-3.5c-.7-1.4-.6-2.4-.3-3z" fill="#fff" />
  </Svg>
);
const IcoPin: React.FC<{size?: number; color?: string}> = ({size = 56, color = C.red}) => (
  <Svg size={size}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z" fill={color} />
    <circle cx={12} cy={9} r={2.8} fill="#fff" />
  </Svg>
);
const IcoCal: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <rect x={3} y={4.5} width={18} height={16.5} rx={3} fill="#fff" stroke="#ddd" />
    <path d="M3 8 a3.5 3.5 0 0 1 3.5-3.5h11A3.5 3.5 0 0 1 21 8v1.5H3z" fill={C.red} />
    <rect x={7} y={2.5} width={2} height={4} rx={1} fill="#555" />
    <rect x={15} y={2.5} width={2} height={4} rx={1} fill="#555" />
    <path d="M8 15l2.5 2.5L16 12" fill="none" stroke={C.green2} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoBag: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <path d="M5 8h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" fill={C.yellow} />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
const IcoScissors: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <circle cx={6.5} cy={17} r={3} fill="none" stroke={C.ink} strokeWidth={2} />
    <circle cx={17.5} cy={17} r={3} fill="none" stroke={C.ink} strokeWidth={2} />
    <path d="M8.5 15 L18 3 M15.5 15 L6 3" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const IcoMoon: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill={C.yellow} />
  </Svg>
);
const IcoSpark: React.FC<{size?: number; color?: string}> = ({size = 56, color = C.yellow}) => (
  <Svg size={size}>
    <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color} />
  </Svg>
);
const IcoBot: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <rect x={4} y={7} width={16} height={12} rx={4} fill={C.green} />
    <circle cx={9} cy={13} r={1.8} fill="#fff" />
    <circle cx={15} cy={13} r={1.8} fill="#fff" />
    <path d="M12 3v4" stroke={C.green} strokeWidth={2} strokeLinecap="round" />
    <circle cx={12} cy={3} r={1.6} fill={C.green} />
  </Svg>
);
const IcoTeam: React.FC<{size?: number}> = ({size = 56}) => (
  <Svg size={size}>
    <circle cx={8} cy={8} r={3.2} fill={C.blue} />
    <circle cx={16} cy={8} r={3.2} fill={C.blue} opacity={0.7} />
    <path d="M2.5 19a5.5 5.5 0 0 1 11 0z" fill={C.blue} />
    <path d="M10.5 19a5.5 5.5 0 0 1 11 0z" fill={C.blue} opacity={0.7} />
  </Svg>
);
const IcoCheck: React.FC<{size?: number; color?: string}> = ({size = 40, color = '#fff'}) => (
  <Svg size={size}>
    <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IcoX: React.FC<{size?: number; color?: string}> = ({size = 40, color = '#fff'}) => (
  <Svg size={size}>
    <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
  </Svg>
);

// ---------------------------------------------------------------- stickers (white-outlined "PNG" cards)
type St = {at: number; until: number; x: number; y: number; rot?: number; el: React.ReactNode};
const Card: React.FC<{children: React.ReactNode; bg?: string; color?: string; fs?: number}> = ({children, bg = '#fff', color = C.ink, fs = 40}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, background: bg, color, borderRadius: 26, padding: '16px 26px 16px 18px', border: '6px solid #fff', boxShadow: '0 16px 36px rgba(0,0,0,0.45)', fontFamily: SANS, fontWeight: 850, fontSize: fs, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{children}</div>
);
const Bubble: React.FC<{text: string; me?: boolean}> = ({text, me}) => (
  <div style={{background: me ? '#D9FDD3' : '#fff', color: C.ink, borderRadius: 24, borderTopRightRadius: me ? 4 : 24, borderTopLeftRadius: me ? 24 : 4, padding: '16px 26px', fontFamily: SANS, fontWeight: 700, fontSize: 40, boxShadow: '0 16px 36px rgba(0,0,0,0.4)', border: '5px solid #fff'}}>{text}</div>
);

const L = 40; // left margin
const R = 1040; // right edge (stickers anchored by their right side)
const STICKERS: (St & {right?: boolean})[] = [
  {at: W(2) - 0.1, until: W(20) - 0.1, x: L, y: 470, rot: -4, el: <Card><IcoPin /> Akola</Card>},
  {at: W(7) - 0.1, until: W(20) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card fs={34}>Service business</Card>},
  {at: W(9) - 0.1, until: W(20) - 0.1, x: R, y: 590, rot: -2, right: true, el: <Card fs={34}>Product business</Card>},
  {at: W(29) - 0.1, until: W(44) - 0.1, x: L, y: 470, rot: -3, el: <Card><IcoWA size={60} /> WhatsApp</Card>},
  {at: W(31) - 0.1, until: W(44) - 0.1, x: R, y: 470, rot: 2, right: true, el: <Bubble text="New inquiry" />},
  {at: W(33) - 0.1, until: W(44) - 0.1, x: R, y: 590, rot: -2, right: true, el: <Bubble text="New lead" />},
  {at: W(40) - 0.1, until: W(44) - 0.1, x: L, y: 600, rot: -5, el: <Card bg={C.red} color="#fff"><IcoX size={40} /> Missed</Card>},
  {at: W(49) - 0.1, until: W(58) - 0.1, x: L, y: 470, rot: -3, el: <Card bg={C.ink} color="#fff"><Img src={staticFile('brand/logo-alpha.png')} style={{width: 74, height: 54, objectFit: 'contain'}} /> Neura Chat</Card>},
  {at: W(53) - 0.1, until: W(74) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card bg={C.green} color="#fff"><IcoWA size={58} /> WhatsApp Automation</Card>},
  {at: W(68) - 0.1, until: W(74) - 0.1, x: L, y: 600, rot: -3, el: <Card><IcoBot /> AI auto-reply</Card>},
  {at: W(82) - 0.1, until: W(101) - 0.1, x: L, y: 470, rot: -2, el: <Card bg={C.red} color="#fff" fs={36}><span style={{width: 22, height: 22, borderRadius: 22, background: '#fff'}} /> LIVE DEMO</Card>},
  {at: W(90) - 0.1, until: W(101) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card><IcoScissors /> Salon</Card>},
  {at: W(105) - 0.08, until: W(124) - 0.1, x: R, y: 470, rot: 2, right: true, el: <Bubble text="Hi" me />},
  {at: W(111) - 0.1, until: W(124) - 0.1, x: L, y: 470, rot: -3, el: <Card bg={C.green} color="#fff" fs={36}><IcoCheck size={40} /> Auto template</Card>},
  {at: W(119) - 0.1, until: W(124) - 0.1, x: L, y: 590, rot: 2, el: <Card fs={34}>Customer chooses option</Card>},
  {at: W(127) - 0.1, until: W(144) - 0.1, x: L, y: 470, rot: -3, el: <Card><IcoCal /> Appointment booked</Card>},
  {at: W(138) - 0.1, until: W(144) - 0.1, x: R, y: 600, rot: 3, right: true, el: <Card fs={34}>Calendar + schedule</Card>},
  {at: W(153) - 0.1, until: W(167) - 0.1, x: L, y: 470, rot: -3, el: <Card><IcoBag /> Products</Card>},
  {at: W(160) - 0.1, until: W(167) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card><IcoPin color={C.blue} /> Store location</Card>},
  {at: W(168) - 0.1, until: W(172) - 0.1, x: L, y: 470, rot: -4, el: <Card bg={C.yellow} fs={46}><IcoSpark color={C.ink} /> Smart AI</Card>},
  {at: W(174) - 0.1, until: W(187) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card bg="#141A2E" color="#fff" fs={46}><IcoMoon /> 11:42 PM</Card>},
  {at: W(181) - 0.1, until: W(187) - 0.1, x: L, y: 470, rot: -2, el: <Bubble text="Kal aa sakte hain?" me />},
  {at: W(188) - 0.1, until: W(205) - 0.1, x: L, y: 470, rot: -3, el: <Card bg={C.green} color="#fff"><IcoBot /> AI replied</Card>},
  {at: W(195) - 0.1, until: W(205) - 0.1, x: R, y: 470, rot: 2, right: true, el: <Bubble text="Walk-in?" />},
  {at: W(201) - 0.1, until: W(205) - 0.1, x: R, y: 590, rot: -2, right: true, el: <Bubble text="Book appointment?" />},
  {at: W(211) - 0.1, until: W(229) - 0.1, x: L, y: 470, rot: -3, el: <Card fs={38}>Ask anything</Card>},
  {at: W(219) - 0.1, until: W(229) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card bg={C.yellow} fs={44}>? ? ?</Card>},
  {at: W(225) - 0.1, until: W(243) - 0.1, x: L, y: 590, rot: 2, el: <Card bg={C.green} color="#fff"><IcoSpark color="#fff" /> Smart replies</Card>},
  {at: W(249) - 0.1, until: W(256) - 0.1, x: R, y: 470, rot: 3, right: true, el: <Card><IcoTeam /> Team confirm</Card>},
  {at: W(261) - 0.1, until: W(290) - 0.1, x: L, y: 470, rot: -3, el: <Card bg={C.red} color="#fff" fs={40}>LIMITED SLOTS</Card>},
  {at: W(282) - 0.1, until: W(290) - 0.1, x: R, y: 470, rot: 2, right: true, el: <Card fs={34}>Serious business owners</Card>},
];

const Sticker: React.FC<{t: number; s: St & {right?: boolean}}> = ({t, s}) => {
  if (t < s.at || t > s.until) return null;
  const p = sp(t, s.at, 380, 15);
  const out = pt(t, s.until - 0.18, s.until, ease.in);
  const bob = Math.sin((t - s.at) * 2.4) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        top: s.y,
        ...(s.right ? {right: 1080 - s.x} : {left: s.x}),
        transform: `translateY(${bob}px) rotate(${s.rot ?? 0}deg) scale(${lerp(0.3, 1, m1(p)) * (p > 1 ? p : 1) * (1 - out * 0.6)})`,
        transformOrigin: s.right ? '100% 50%' : '0 50%',
        opacity: m1(p * 3) * (1 - out),
      }}
    >
      {s.el}
    </div>
  );
};

// ---------------------------------------------------------------- captions: bold word highlight, top of frame (keeps the phone clear)
const GREEN_W = new Set(['whatsapp', 'ai', 'automation', 'automatically', 'software', 'appointment', 'calendar', 'products', 'location', 'smart', 'intelligently', 'akola', '1142', 'template', 'live', 'salon', 'limited', 'comment']);
const RED_W = new Set(['nahi', 'missed', 'complicated']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (/[.,?!]["”]?$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const pop = sp(t, c.s - 0.03, 420, 22);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 200, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: 12, transform: `scale(${lerp(0.85, 1, m1(pop))})`, opacity: m1(pop * 3)}}>
      {c.words.map((w, i) => {
        const on = i === cur;
        const seen = i <= cur;
        const k = key(w.w);
        const wp = sp(t, w.s - 0.03, 520, 18);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 78,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.12,
              padding: '4px 18px',
              borderRadius: 16,
              display: 'inline-block',
              background: on ? C.green : 'transparent',
              color: on ? '#fff' : RED_W.has(k) && seen ? C.red : GREEN_W.has(k) && seen ? C.green : '#fff',
              opacity: seen ? 1 : 0.5,
              transform: `scale(${on ? lerp(1.22, 1.05, m1(wp)) : 1}) rotate(${on ? -2 : 0}deg)`,
              boxShadow: on ? '0 12px 30px rgba(18,140,74,0.5)' : 'none',
              WebkitTextStroke: on ? '2px rgba(0,0,0,0.25)' : '3px #000',
              paintOrder: 'stroke fill',
              textShadow: '0 6px 18px rgba(0,0,0,0.85)',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- CTA + end card
const CommentCTA: React.FC<{t: number}> = ({t}) => {
  const a = W(303) - 0.12;
  if (t < a || t > edit.speech) return null;
  const p = sp(t, a, 280, 20);
  const typed = 'AI'.slice(0, Math.max(0, Math.min(2, Math.floor((t - W(305) + 0.05) / 0.1))));
  const sent = t > W(305) + 0.35;
  const dm = sp(t, W(309) - 0.05, 300, 18);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1420, opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * 120}px)`}}>
      <div style={{background: '#fff', borderRadius: 36, padding: '24px 28px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 80, height: 80, borderRadius: 80, background: '#000', display: 'grid', placeItems: 'center', border: '3px solid #eee'}}>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: 58, height: 42, objectFit: 'contain'}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#8E8E8E'}}>Add a comment…</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1}}>
            {typed}
            <span style={{opacity: Math.sin(t * 14) > 0 && typed.length < 2 ? 1 : 0, color: '#3897F0'}}>|</span>
          </div>
        </div>
        <div style={{width: 96, height: 96, borderRadius: 96, background: sent ? C.green : '#3897F0', display: 'grid', placeItems: 'center'}}>
          {sent ? (
            <IcoCheck size={48} />
          ) : (
            <Svg size={46}>
              <path d="M3 12 L21 3 L14 21 L11 13 Z" fill="#fff" />
            </Svg>
          )}
        </div>
      </div>
      {dm > 0 && (
        <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: C.green, borderRadius: 40, padding: '18px 32px', fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff', transform: `scale(${Math.min(1.05, dm)})`, transformOrigin: '100% 50%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            <IcoWA size={46} /> Saari details aapke DM mein
          </div>
        </div>
      )}
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.2) return null;
  const r = t - a;
  const k = pt(t, a - 0.2, a + 0.15);
  const logo = sp(t, a + 0.05, 180, 15);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #0F3D24, #050806 70%)', opacity: k}}>
      <div style={{position: 'absolute', left: 340, top: 440, width: 400, height: 300, transform: `scale(${lerp(0.7, 1, m1(logo))})`, opacity: m1(logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: '-0.03em', color: '#fff', opacity: pt(r, 0.2, 0.5)}}>Neura Chat</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.35, 0.65)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.green}}>
          <IcoWA size={52} /> WhatsApp AI Automation
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 90, color: 'rgba(255,255,255,0.85)', opacity: pt(r, 0.6, 0.9)}}>comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.8, 1.1), transform: `scale(${lerp(0.85, 1, pt(r, 0.8, 1.2, ease.out))})`}}>
        <div style={{background: C.green, color: '#fff', borderRadius: 24, padding: '10px 60px', fontFamily: SANS, fontWeight: 900, fontSize: 140, letterSpacing: '-0.04em'}}>AI</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 36, color: 'rgba(255,255,255,0.6)', opacity: pt(r, 1.1, 1.5)}}>saari details aapko bhej denge</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {/* soft top shade so captions read over the bright café */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent 30%)'}} />
      {t < edit.speech && (
        <>
          {STICKERS.map((s, i) => (
            <Sticker key={i} t={t} s={s} />
          ))}
          <Captions t={t} />
          <CommentCTA t={t} />
        </>
      )}
      <EndCard t={t} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
    </AbsoluteFill>
  );
};
