import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// v2 "advanced" overlay edit: no boxes anywhere. The demo plays uncut; the camera gently pushes in on the phone;
// real icons (Microsoft Fluent 3D emoji + official brand logos) float in with pointer lines; clean text-only captions.
const C = {
  green: '#25D366',
  mint: '#7CFFB2',
  red: '#FF4D4D',
  yellow: '#FFD84D',
  white: '#FFFFFF',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const SHADOW = '0 2px 6px rgba(0,0,0,0.55), 0 10px 40px rgba(0,0,0,0.55)';

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
const sp = (t: number, at: number, stiffness = 260, damping = 16) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const m1 = (v: number) => Math.min(1, v);
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);

// ---------------------------------------------------------------- camera: slow push-ins on the phone during the demo
const PUSH = [
  {a: W(86), b: W(124), z: 1.1, ox: 55, oy: 64},
  {a: W(124), b: W(144), z: 1.16, ox: 52, oy: 62},
  {a: W(172), b: W(205), z: 1.14, ox: 52, oy: 60},
  {a: W(208), b: W(256), z: 1.08, ox: 45, oy: 66},
];
const camera = (t: number) => {
  let z = 1, ox = 50, oy = 60;
  for (const p of PUSH) {
    const k = pt(t, p.a - 0.2, p.a + 0.9, ease.inOut) * (1 - pt(t, p.b - 0.7, p.b + 0.2, ease.inOut));
    if (k > 0) {
      z = lerp(1, p.z + 0.012 * Math.sin(t * 0.6), k);
      ox = lerp(50, p.ox, k);
      oy = lerp(60, p.oy, k);
    }
  }
  return {z, ox, oy};
};

// ---------------------------------------------------------------- callouts: floating real icon + label + pointer line (no boxes)
type Call = {at: number; until: number; side: 'l' | 'r'; y: number; icons: string[]; label: string; sub?: string; color?: string; line?: boolean};
const CALLS: Call[] = [
  {at: 2, until: 20, side: 'l', y: 470, icons: ['round_pushpin.png'], label: 'Akola', sub: 'local business'},
  {at: 7, until: 20, side: 'r', y: 470, icons: ['office_building.png', 'shopping_bags.png'], label: 'Service / Product'},
  {at: 29, until: 44, side: 'l', y: 470, icons: ['whatsapp-icon.svg'], label: 'WhatsApp', sub: 'inquiries & leads', line: true},
  {at: 31, until: 44, side: 'r', y: 470, icons: ['bell.png'], label: 'New inquiry', color: C.mint},
  {at: 40, until: 44, side: 'r', y: 760, icons: ['alarm_clock.png', 'cross_mark.png'], label: 'Missed', color: C.red},
  {at: 68, until: 74, side: 'l', y: 760, icons: ['robot.png'], label: 'AI handles it', color: C.mint},
  {at: 90, until: 101, side: 'r', y: 470, icons: ['barber_pole.png', 'scissors.png'], label: 'Salon chat', line: true},
  {at: 105, until: 116, side: 'l', y: 470, icons: ['waving_hand.png'], label: '“Hi”', line: true},
  {at: 111, until: 124, side: 'r', y: 470, icons: ['speech_balloon.png', 'sparkles.png'], label: 'Auto template', color: C.mint, line: true},
  {at: 119, until: 124, side: 'l', y: 760, icons: ['index_pointing_up.png'], label: 'Choose option'},
  {at: 127, until: 144, side: 'l', y: 470, icons: ['google-calendar.svg', 'check_mark_button.png'], label: 'Appointment', sub: 'booked in chat', color: C.mint, line: true},
  {at: 138, until: 144, side: 'r', y: 470, icons: ['spiral_calendar.png'], label: 'Full schedule'},
  {at: 153, until: 167, side: 'l', y: 470, icons: ['shopping_bags.png', 'package.png'], label: 'Products', line: true},
  {at: 160, until: 167, side: 'r', y: 470, icons: ['google-maps.svg'], label: 'Store location', line: true},
  {at: 168, until: 172, side: 'r', y: 470, icons: ['brain.png', 'sparkles.png'], label: 'Smart AI', color: C.yellow},
  {at: 188, until: 205, side: 'l', y: 470, icons: ['robot.png', 'speech_balloon.png'], label: 'Instant reply', color: C.mint, line: true},
  {at: 195, until: 205, side: 'r', y: 470, icons: ['person_tipping_hand.png'], label: 'Walk-in?', sub: 'or book appointment'},
  {at: 211, until: 229, side: 'l', y: 470, icons: ['red_question_mark.png'], label: 'Ask anything'},
  {at: 225, until: 243, side: 'r', y: 470, icons: ['light_bulb.png'], label: 'Smart answers', color: C.yellow},
  {at: 249, until: 256, side: 'r', y: 470, icons: ['busts_in_silhouette.png', 'check_mark_button.png'], label: 'Team confirms', line: true},
  {at: 282, until: 290, side: 'r', y: 470, icons: ['rocket.png'], label: 'Serious owners', sub: 'ready to grow'},
];

const IconStack: React.FC<{t: number; at: number; icons: string[]; size: number}> = ({t, at, icons, size}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end'}}>
    {icons.map((n, k) => {
      const p = sp(t, at + k * 0.09, 300, 13);
      const s = k ? size * 0.62 : size;
      const fl = Math.sin((t - at) * 2.2 + k * 1.7) * 7;
      return (
        <div key={n} style={{position: 'relative', width: s, height: s, marginLeft: k ? -s * 0.28 : 0, transform: `translateY(${fl + (1 - m1(p)) * 50}px) rotate(${lerp(-25, k ? 10 : -6, m1(p))}deg) scale(${p})`, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))', zIndex: k}}>
          <Img src={icon(n)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>
      );
    })}
  </div>
);

const Callout: React.FC<{t: number; c: Call}> = ({t, c}) => {
  const a = W(c.at) - 0.12;
  const b = W(c.until) - 0.1;
  if (t < a || t > b) return null;
  const out = pt(t, b - 0.22, b, ease.in);
  const lab = pt(t, a + 0.12, a + 0.45, ease.out);
  const subp = pt(t, a + 0.25, a + 0.6, ease.out);
  const left = c.side === 'l';
  const x = left ? 60 : 1020;
  // pointer line from the label toward the phone in the middle of the frame
  const lp = pt(t, a + 0.2, a + 0.7, ease.inOut);
  const x0 = left ? x + 40 : x - 40, y0 = c.y + 300;
  const x1 = left ? 410 : 670, y1 = c.y + 520;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateY(${-out * 30}px)`, pointerEvents: 'none'}}>
      {/* soft glow, not a box */}
      <div style={{position: 'absolute', top: c.y - 40, [left ? 'left' : 'right']: -60, width: 420, height: 320, background: `radial-gradient(closest-side, ${c.color ?? C.green}33, transparent)`, opacity: m1(sp(t, a))}} />
      <div style={{position: 'absolute', top: c.y, [left ? 'left' : 'right']: left ? x : 1080 - x, display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'flex-end'}}>
        <IconStack t={t} at={a} icons={c.icons} size={150} />
        <div style={{marginTop: 10, overflow: 'hidden', paddingBottom: 6}}>
          <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 50, letterSpacing: '-0.035em', color: c.color ?? C.white, textShadow: SHADOW, transform: `translateY(${(1 - lab) * 70}px)`, whiteSpace: 'nowrap'}}>{c.label}</div>
        </div>
        {c.sub && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: 'rgba(255,255,255,0.88)', textShadow: SHADOW, opacity: subp, transform: `translateY(${(1 - subp) * 16}px)`, whiteSpace: 'nowrap'}}>{c.sub}</div>}
      </div>
      {c.line && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={`M ${x0} ${y0} Q ${left ? x0 : x0} ${y1} ${lerp(x0, x1, lp)} ${lerp(y0, y1, lp)}`} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={3.5} strokeLinecap="round" style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}} />
          <circle cx={lerp(x0, x1, lp)} cy={lerp(y0, y1, lp)} r={lp > 0 ? 9 : 0} fill={c.color ?? C.green} stroke="#fff" strokeWidth={3} />
          {lp >= 1 && <circle cx={x1} cy={y1} r={9 + ((t * 1.5) % 1) * 26} fill="none" stroke={c.color ?? C.green} strokeWidth={3} opacity={1 - ((t * 1.5) % 1)} />}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- kinetic titles (masked type reveals, no boxes)
const Reveal: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; d?: number}> = ({t, at, children, style, d = 0.5}) => {
  const p = pt(t, at, at + d, ease.out);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 10}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%) skewY(${(1 - p) * 6}deg)`, ...style}}>{children}</div>
    </div>
  );
};

type Title = {at: number; until: number; render: (t: number, a: number) => React.ReactNode};
const TITLES: Title[] = [
  {
    at: 49,
    until: 58,
    render: (t, a) => (
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{transform: `scale(${sp(t, a)}) rotate(${lerp(-40, 0, m1(sp(t, a)))}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}}>
            <Img src={staticFile('brand/logo-alpha.png')} style={{width: 150, height: 110, objectFit: 'contain'}} />
          </div>
          <Reveal t={t} at={a + 0.1} style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.05em', color: '#fff', textShadow: SHADOW}}>
            Neura Chat
          </Reveal>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 6}}>
          <div style={{width: 84, height: 84, transform: `scale(${sp(t, W(53) - 0.1)})`, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: '100%', height: '100%'}} />
          </div>
          <Reveal t={t} at={W(53) - 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, color: C.green, textShadow: SHADOW, lineHeight: 1}}>
            WhatsApp automation
          </Reveal>
        </div>
      </div>
    ),
  },
  {
    at: 82,
    until: 90,
    render: (t, a) => (
      <div style={{position: 'absolute', left: 70, top: 470}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 34, height: 34, borderRadius: 34, background: C.red, boxShadow: `0 0 ${20 + 14 * Math.sin(t * 8)}px ${C.red}`, transform: `scale(${sp(t, a)})`}} />
          <Reveal t={t} at={a + 0.05} style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '-0.05em', color: '#fff', textShadow: SHADOW, lineHeight: 1}}>
            LIVE
          </Reveal>
        </div>
        <Reveal t={t} at={a + 0.18} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: '#fff', textShadow: SHADOW, lineHeight: 1, marginLeft: 54}}>
          example
        </Reveal>
      </div>
    ),
  },
  {
    at: 174,
    until: 187,
    render: (t, a) => (
      <div style={{position: 'absolute', right: 60, top: 450, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 130, height: 130, transform: `scale(${sp(t, a)}) rotate(${Math.sin(t * 1.5) * 8}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}}>
            <Img src={icon('crescent_moon.png')} style={{width: '100%', height: '100%'}} />
          </div>
          <Reveal t={t} at={W(176) - 0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.05em', color: '#fff', textShadow: SHADOW, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
            11:42
          </Reveal>
        </div>
        <Reveal t={t} at={W(176) + 0.1} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: C.yellow, textShadow: SHADOW}}>
          raat ko bhi, AI online
        </Reveal>
        {Array.from({length: 3}, (_, i) => {
          const z = ((t - a) * 0.6 + i / 3) % 1;
          return (
            <div key={i} style={{position: 'absolute', right: 420 - z * 60, top: -40 - z * 120, width: 60 + z * 30, opacity: (1 - z) * m1(sp(t, a)), transform: `rotate(${-10 + z * 20}deg)`}}>
              <Img src={icon('zzz.png')} style={{width: '100%'}} />
            </div>
          );
        })}
      </div>
    ),
  },
  {
    at: 260,
    until: 282,
    render: (t, a) => (
      <div style={{position: 'absolute', left: 60, top: 450}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 140, height: 140, transform: `scale(${sp(t, a)}) rotate(${180 * ease.inOut(m1(Math.max(0, ((t - a) % 2) - 1.4) / 0.5))}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}}>
            <Img src={icon('hourglass_not_done.png')} style={{width: '100%', height: '100%'}} />
          </div>
          <div>
            <Reveal t={t} at={a + 0.08} style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '-0.05em', color: C.red, textShadow: SHADOW, lineHeight: 0.95}}>
              Limited
            </Reveal>
            <Reveal t={t} at={a + 0.2} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: '#fff', textShadow: SHADOW, lineHeight: 1}}>
              businesses only
            </Reveal>
          </div>
        </div>
      </div>
    ),
  },
];

const Titles: React.FC<{t: number}> = ({t}) => (
  <>
    {TITLES.map((ti, i) => {
      const a = W(ti.at) - 0.12;
      const b = W(ti.until) - 0.1;
      if (t < a || t > b) return null;
      const out = pt(t, b - 0.25, b, ease.in);
      return (
        <AbsoluteFill key={i} style={{opacity: 1 - out, transform: `translateY(${-out * 40}px)`, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 22% at 50% 31%, rgba(0,0,0,0.55), transparent 70%)', opacity: pt(t, a, a + 0.3)}} />
          {ti.render(t, a)}
        </AbsoluteFill>
      );
    })}
  </>
);

// ---------------------------------------------------------------- captions: clean, text only, two lines, karaoke colour
const SERIF_W = new Set(['akola', 'whatsapp', 'automation', 'automatically', 'live', 'example', 'salon', 'appointment', 'calendar', 'products', 'location', 'smart', 'intelligently', 'limited', 'serious', 'opportunity', 'details']);
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    if (/[.?!]["”]?$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3) || chars > 26 || !nx || nx.s - w.e > 0.35) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.5)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const li = LINES.findIndex((x) => t >= x.s && t < x.e);
  if (li < 0) return null;
  const c = LINES[li];
  const p = pt(t, c.s - 0.05, c.s + 0.18, ease.out);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 205, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 18, rowGap: 0, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const seen = t >= w.s - 0.03;
        const active = seen && (i === c.words.length - 1 || t < c.words[i + 1].s - 0.03);
        const wp = pt(t, w.s - 0.03, w.s + 0.15, ease.out);
        const serif = SERIF_W.has(k);
        return (
          <span
            key={i}
            style={{
              fontFamily: serif ? SERIF : SANS,
              fontStyle: serif ? 'italic' : 'normal',
              fontWeight: serif ? 400 : 800,
              fontSize: serif ? 92 : 70,
              letterSpacing: serif ? '-0.01em' : '-0.035em',
              lineHeight: 1.12,
              color: active ? C.green : serif && seen ? C.mint : '#fff',
              opacity: seen ? 1 : 0.38,
              display: 'inline-block',
              transform: `translateY(${seen ? -6 * (1 - wp) : 0}px) scale(${active ? lerp(1.08, 1.03, wp) : 1})`,
              textShadow: SHADOW,
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- light leak on chapter changes
const LEAKS = [W(49), W(82), W(127), W(168), W(260), W(303)];
const Leak: React.FC<{t: number}> = ({t}) => {
  const v = Math.max(0, ...LEAKS.map((a) => (t >= a - 0.15 && t < a + 0.6 ? Math.sin(((t - a + 0.15) / 0.75) * Math.PI) : 0)));
  if (v <= 0) return null;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 40% at ${20 + v * 60}% 15%, rgba(37,211,102,0.55), transparent 70%)`, mixBlendMode: 'screen', opacity: v * 0.9}} />;
};

// ---------------------------------------------------------------- CTA (no card): big kinetic "Comment AI"
const CTA: React.FC<{t: number}> = ({t}) => {
  const a = W(303) - 0.12;
  if (t < a || t > edit.speech) return null;
  const typed = 'AI'.slice(0, Math.max(0, Math.min(2, Math.floor((t - W(305) + 0.05) / 0.12))));
  const dm = pt(t, W(309) - 0.05, W(309) + 0.3, ease.out);
  const hand = sp(t, a + 0.15);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 80%)', opacity: pt(t, a, a + 0.4)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 90, height: 90, transform: `scale(${sp(t, a)})`}}>
            <Img src={icon('instagram-icon.svg')} style={{width: '100%', height: '100%'}} />
          </div>
          <Reveal t={t} at={a + 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: '#fff', textShadow: SHADOW, lineHeight: 1}}>
            comment
          </Reveal>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 260, letterSpacing: '-0.06em', lineHeight: 1, background: `linear-gradient(180deg, ${C.mint}, ${C.green})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 14px 40px rgba(37,211,102,0.45))', minHeight: 260}}>
          {typed || ' '}
          <span style={{WebkitTextFillColor: '#fff', opacity: typed.length < 2 && Math.sin(t * 14) > 0 ? 1 : 0, fontWeight: 300}}>|</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: dm, transform: `translateY(${(1 - dm) * 30}px)`}}>
          <div style={{width: 74, height: 74}}>
            <Img src={icon('envelope_with_arrow.png')} style={{width: '100%', height: '100%'}} />
          </div>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 48, color: '#fff', textShadow: SHADOW, letterSpacing: '-0.02em'}}>saari details aapke DM mein</span>
        </div>
      </div>
      <div style={{position: 'absolute', right: 110, top: 1150, width: 130, height: 130, transform: `translateY(${Math.sin(t * 6) * 14}px) scale(${hand})`}}>
        <Img src={icon('backhand_index_pointing_down.png')} style={{width: '100%', height: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.2) return null;
  const r = t - a;
  const k = pt(t, a - 0.2, a + 0.15);
  const logo = sp(t, a + 0.05, 180, 15);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #0E3A22, #040604 72%)', opacity: k}}>
      {Array.from({length: 18}, (_, i) => {
        const y = 1920 - ((rand(i * 3.3) * 1920 + r * (40 + rand(i) * 60)) % 1920);
        return <div key={i} style={{position: 'absolute', left: rand(i * 7.1) * 1080, top: y, width: 6, height: 6, borderRadius: 6, background: C.mint, opacity: 0.35, boxShadow: `0 0 16px ${C.green}`}} />;
      })}
      <div style={{position: 'absolute', left: 360, top: 430, width: 360, height: 270, transform: `scale(${lerp(0.7, 1, m1(logo))})`, opacity: m1(logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center'}}>
        <Reveal t={r} at={0.15} style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: '-0.045em', color: '#fff'}}>
          Neura Chat
        </Reveal>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: pt(r, 0.35, 0.7)}}>
        <Img src={icon('whatsapp-icon.svg')} style={{width: 56, height: 56}} />
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: C.mint}}>WhatsApp AI automation</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, color: 'rgba(255,255,255,0.85)', opacity: pt(r, 0.6, 0.9)}}>comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1140, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 230, letterSpacing: '-0.06em', lineHeight: 1, background: `linear-gradient(180deg, ${C.mint}, ${C.green})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', opacity: pt(r, 0.8, 1.1), transform: `scale(${lerp(0.85, 1, pt(r, 0.8, 1.2, ease.out))})`}}>AI</div>
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
      <AbsoluteFill style={{transform: `scale(${cam.z})`, transformOrigin: `${cam.ox}% ${cam.oy}%`}}>
        <OffthreadVideo src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(1.08)'}} />
      </AbsoluteFill>
      {/* grade: gentle vignette + top shade so white type reads on the bright café */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 55%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.15) 30%, transparent 42%)'}} />
      <Leak t={t} />
      {t < edit.speech && (
        <>
          {CALLS.map((c, i) => (
            <Callout key={i} t={t} c={c} />
          ))}
          <Titles t={t} />
          <CTA t={t} />
          <Captions t={t} />
        </>
      )}
      <EndCard t={t} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
    </AbsoluteFill>
  );
};
