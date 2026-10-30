import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Scam-awareness edit for Deepak Wadhwa. Same black + saffron system as the Diwali giveaway film, with an alert-red
// accent for the scam beats. Real icons (Microsoft Fluent 3D) and the official Telegram mark; his real profile photo.
const C = {
  bg: '#060606',
  card: '#121212',
  gold: '#FF8A00',
  gold2: '#FF6A00',
  cream: '#F7F3EE',
  ink: '#0A0A0A',
  dim: 'rgba(247,243,238,0.6)',
  line: 'rgba(255,138,0,0.28)',
  red: '#FF3B30',
  red2: '#C9160E',
  green: '#2ECC71',
  tg: '#2AABEE',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
export const OFF = 0.8; // seconds of silence trimmed from the head
export const OFF_F = Math.round(OFF * FPS);
const GOLD_GRAD = 'linear-gradient(180deg, #FFC46B 0%, #FF9A1F 45%, #F26A00 100%)';
const RED_GRAD = 'linear-gradient(180deg, #FF6B5E 0%, #FF3B30 50%, #C9160E 100%)';

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
const sp = (t: number, at: number, stiffness = 260, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.25) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, v);
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (w: string) => w.replace(/["“”]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const goldText: React.CSSProperties = {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const redText: React.CSSProperties = {background: RED_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

// ---------------------------------------------------------------- full-frame scenes (word-timed)
type Scene = {id: string; a: number; b: number; dir: number};
const FF: Scene[] = [
  {id: 'portfolio', a: W(51) - 0.08, b: W(67) - 0.08, dir: -1},
  {id: 'telegram', a: W(84) - 0.08, b: W(97) - 0.08, dir: 1},
  {id: 'kamai', a: W(120) - 0.08, b: W(132) - 0.08, dir: -1},
  {id: 'multiply', a: W(132) - 0.08, b: W(144) - 0.08, dir: 1},
  {id: 'crorepati', a: W(157) - 0.08, b: W(164) - 0.08, dir: -1},
  {id: 'nomoney', a: W(186) - 0.08, b: W(206) - 0.08, dir: 1},
  {id: 'upi', a: W(219) - 0.08, b: W(233) - 0.08, dir: -1},
  {id: 'scam', a: W(233) - 0.08, b: W(241) - 0.08, dir: 1},
];
const sceneAt = (t: number) => FF.find((f) => t >= f.a && t < f.b);
const RETURNS = FF.filter((f) => !FF.some((g) => Math.abs(g.a - f.b) < 0.02)).map((f) => f.b);

// ---------------------------------------------------------------- the speaker
const Speaker: React.FC<{t: number; pip?: boolean}> = ({t, pip}) => {
  const back = RETURNS.reduce((s, r) => s + 0.12 * (1 - pt(t, r, r + 0.35, ease.out)) * (t >= r ? 1 : 0), 0);
  const n = RETURNS.filter((r) => t >= r).length;
  const base = n % 2 ? 1.14 : 1.03;
  const intro = 0.18 * (1 - pt(t, 0, 0.6, ease.out));
  const z = pip ? 1 : base + back + intro + 0.012 * Math.sin(t * 0.4);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 40%'}}>
      <OffthreadVideo muted startFrom={OFF_F} src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(0.98) brightness(0.96)'}} />
    </AbsoluteFill>
  );
};

const Grade: React.FC<{alert: number}> = ({alert}) => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(200deg, rgba(255,170,80,0.10), transparent 50%, rgba(20,30,60,0.18))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 72% 55% at 50% 42%, transparent 45%, rgba(${lerp(0, 120, alert)},0,0,${0.45 + 0.1 * alert}) 82%, rgba(${lerp(0, 60, alert)},0,0,0.88) 100%)`}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent 20%, transparent 60%, rgba(0,0,0,0.7))'}} />
  </>
);

const Bubble: React.FC<{t: number; at: number; x: number; y: number; d?: number; ring?: string}> = ({t, at, x, y, d = 210, ring = C.gold}) => {
  const p = sp(t, at, 240, 18);
  const s = 0.26;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: d, height: d, transform: `scale(${Math.min(1.05, p)})`, opacity: m1(p * 2)}}>
      <div style={{position: 'absolute', inset: -7, borderRadius: d, border: `3px solid ${ring}`}} />
      <div style={{position: 'relative', width: d, height: d, borderRadius: d, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: d / 2 - 545 * s, top: d / 2 - 800 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Speaker t={t} pip />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- captions (bold word highlight, just below centre)
const GOLD_W = new Set(['paise', 'paisa', 'portfolio', 'bachchon', 'multiply', 'crorepati', 'arabpati', 'kamai', 'mehnat', 'deepak', 'wadhwa', 'bachaiye', 'haq', 'telegram', 'photo']);
const NAME_W = new Set(['deepak', 'wadhwa']);
const RED_W = new Set(['scams', 'scam', 'jua', 'loss', 'phans', 'mat', 'nahi', 'shyamlal', 'biharilal', 'nishchit', 'na', 'dein', 'bagair']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const gapNext = nx ? nx.s - w.e : 9;
    if (/[.,?!]$/.test(w.w) || cur.length >= 3 || !nx || gapNext > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  const pop = sp(t, c.s - 0.03, 420, 22);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 1390, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: 14, transform: `scale(${lerp(0.82, 1, m1(pop))})`, opacity: m1(pop * 3)}}>
      {c.words.map((w, i) => {
        const on = i === cur;
        const seen = i <= cur;
        const k = key(w.w);
        const red = RED_W.has(k);
        const wp = sp(t, w.s - 0.03, 520, 18);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: NAME_W.has(k) ? 112 : 96,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1.12,
              padding: '4px 20px',
              borderRadius: 18,
              display: 'inline-block',
              background: on ? (red ? RED_GRAD : GOLD_GRAD) : 'transparent',
              color: on ? (red ? '#fff' : C.ink) : red && seen ? C.red : GOLD_W.has(k) && seen ? C.gold : '#fff',
              opacity: seen ? 1 : 0.45,
              transform: `scale(${on ? lerp(1.35, NAME_W.has(k) ? 1.14 : 1.08, m1(wp)) : 1}) rotate(${on ? -2 : 0}deg)`,
              boxShadow: on ? `0 12px 30px ${red ? 'rgba(255,59,48,0.45)' : 'rgba(255,106,0,0.45)'}` : 'none',
              WebkitTextStroke: on ? undefined : '3px #000',
              paintOrder: 'stroke fill',
              textShadow: on ? 'none' : '0 6px 18px rgba(0,0,0,0.85)',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- shared visuals
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

/** Black stage with a soft saffron (or alert-red) glow and a fine drifting grid. */
const Stage: React.FC<{t: number; cy?: number; danger?: boolean; children?: React.ReactNode}> = ({t, cy = 880, danger, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% ${(cy / 1920) * 100}%, ${danger ? '#3A0806' : '#3A1C04'} 0%, #121212 50%, ${C.bg} 100%)`}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${danger ? 'rgba(255,59,48,0.06)' : 'rgba(255,138,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${danger ? 'rgba(255,59,48,0.06)' : 'rgba(255,138,0,0.05)'} 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `0 ${t * 14}px`, maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 80%)'}} />
    {children}
  </AbsoluteFill>
);

const Kicker: React.FC<{t: number; at: number; children: React.ReactNode; danger?: boolean; top?: number}> = ({t, at, children, danger, top = 190}) => {
  const p = ap(t, at, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.3em', color: danger ? C.red : C.gold, border: `1.5px solid ${danger ? 'rgba(255,59,48,0.4)' : C.line}`, borderRadius: 999, padding: '12px 28px', background: 'rgba(6,6,6,0.6)'}}>
        {danger && <span style={{width: 14, height: 14, borderRadius: 14, background: C.red, boxShadow: `0 0 ${10 + 8 * Math.sin(t * 9)}px ${C.red}`}} />}
        {children}
      </div>
    </div>
  );
};

const Icon3D: React.FC<{t: number; at: number; n: string; size: number; x: number; y: number; rot?: number}> = ({t, at, n, size, x, y, rot = 0}) => {
  const p = sp(t, at, 320, 13);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin((t - at) * 2.2) * 8, width: size, height: size, transform: `scale(${p}) rotate(${lerp(-25, rot, m1(p))}deg)`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.55))'}}>
      <Img src={icon(n)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
  );
};

/** Rubber stamp that slams down. */
const Stamp: React.FC<{t: number; at: number; text: string; x: number; y: number; size?: number; rot?: number}> = ({t, at, text, x, y, size = 120, rot = -12}) => {
  const p = sp(t, at, 520, 22);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(2.4, 1, m1(p))})`, opacity: m1(p * 3), border: `${size * 0.07}px solid ${C.red}`, borderRadius: size * 0.18, padding: `${size * 0.06}px ${size * 0.28}px`, color: C.red, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '0.06em', lineHeight: 1, background: 'rgba(255,59,48,0.06)', boxShadow: `0 0 60px rgba(255,59,48,0.35)`, whiteSpace: 'nowrap', textShadow: '0 0 20px rgba(255,59,48,0.5)'}}>
      {text}
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

const Rupee: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'inline-block', verticalAlign: 'middle'}}>
    <path d="M6 4 h12 M6 8.5 h12 M9 4 c4.5 0 6.5 2 6.5 4.5 S13.5 13 9 13 h-1 L16 21" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Verified: React.FC<{size?: number}> = ({size = 38}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block', flexShrink: 0}}>
    <path d="M20 2l4.2 3.1 5.2-.3 1.7 4.9 4.4 2.8-1.2 5.1 2.1 4.8-3.6 3.8-.4 5.2-5.1 1.3-3 4.3-4.9-1.8-4.9 1.8-3-4.3-5.1-1.3-.4-5.2L2.4 22.4l2.1-4.8-1.2-5.1 4.4-2.8 1.7-4.9 5.2.3z" fill="#0095F6" />
    <path d="M13 20.5l4.6 4.6L27.5 15" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- scenes
type SP = {t: number; a: number; b: number};

const Better: React.FC<SP> = ({t, a}) => {
  const rows = [
    {at: W(11), icon: ['game_die.png', 'slot_machine.png'], t1: 'Jua khel aaiye', t2: 'ya'},
    {at: W(16), icon: ['hotel.png'], t1: '5-star hotel mein', t2: 'kharch kar dijiye'},
    {at: W(23), icon: ['baby.png', 'people_hugging.png'], t1: 'Apne bachchon', t2: 'ke upar'},
  ];
  return (
    <Stage t={t} cy={900}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 54, color: C.dim, opacity: ap(t, a)}}>Kisi ko paise dene se</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, lineHeight: 1, ...goldText, transform: `scale(${lerp(1.3, 1, m1(sp(t, W(6) - 0.05)))})`, opacity: m1(sp(t, W(6) - 0.05) * 2)}}>better hai…</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 600}}>
        {rows.map((r, i) => {
          const p = sp(t, r.at - 0.08, 300, 20);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, marginBottom: 44, opacity: m1(p * 2), transform: `translateX(${(1 - m1(p)) * 500}px)`}}>
              <div style={{display: 'flex', width: 230, justifyContent: 'center', flexShrink: 0}}>
                {r.icon.map((n, k) => (
                  <Img key={n} src={icon(n)} style={{width: k ? 150 : 190, height: k ? 150 : 190, marginLeft: k ? -50 : 0, marginTop: k ? 60 : 0, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))', transform: `rotate(${Math.sin(t * 2 + i + k) * 6}deg)`}} />
                ))}
              </div>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 56, letterSpacing: '-0.03em', color: C.cream, lineHeight: 1.05}}>{r.t1}</div>
                {r.t2 && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: C.gold}}>{r.t2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Portfolio: React.FC<SP> = ({t, a}) => {
  const ph = sp(t, a + 0.02, 220, 20);
  const msgs = [
    {at: a + 0.4, txt: 'Sir, aap paise bhejiye 🙏', me: false},
    {at: W(62) - 0.1, txt: 'Aapka portfolio hum manage karenge', me: false},
    {at: W(65) - 0.1, txt: 'Guaranteed 20% monthly return 📈', me: false},
  ];
  const q = sp(t, W(65) - 0.1, 300, 14);
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a}>KISKO DE RAHE HAIN?</Kicker>
      <div style={{position: 'absolute', left: 150, top: 300, width: 780, height: 1040, borderRadius: 70, background: '#0B0B0D', padding: 16, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', transform: `translateY(${(1 - m1(ph)) * 900}px) rotate(${(1 - m1(ph)) * 6}deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 56, background: '#0F1418', overflow: 'hidden', position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '60px 34px 24px', background: '#1A2127'}}>
            <div style={{width: 92, height: 92, borderRadius: 92, background: '#2C3640', display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
              <Img src={icon('briefcase.png')} style={{width: 64, height: 64}} />
            </div>
            <div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#fff'}}>Portfolio Expert</div>
              <div style={{fontFamily: SANS, fontSize: 24, color: '#8FA3B1'}}>unknown number</div>
            </div>
          </div>
          <div style={{padding: '30px 30px'}}>
            {msgs.map((m, i) => {
              const p = sp(t, m.at, 380, 20);
              return (
                <div key={i} style={{display: 'flex', marginBottom: 22, opacity: m1(p * 2), transform: `scale(${lerp(0.6, 1, m1(p))})`, transformOrigin: '0 50%'}}>
                  <div style={{maxWidth: 560, background: '#222C33', color: '#E9EDEF', fontFamily: SANS, fontSize: 36, lineHeight: 1.3, padding: '20px 26px', borderRadius: 26, borderTopLeftRadius: 6}}>{m.txt}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 70, top: 1190, display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${m1(q)}) rotate(${lerp(-20, -4, m1(q))}deg)`, transformOrigin: '100% 50%'}}>
        <Img src={icon('red_question_mark.png')} style={{width: 170, height: 170}} />
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...goldText, lineHeight: 1}}>waqai?</div>
      </div>
    </Stage>
  );
};

const Telegram: React.FC<SP> = ({t, a}) => {
  const ph = sp(t, a + 0.02, 220, 20);
  const posts = [
    {at: a + 0.35, txt: '🚀 GUARANTEED 300% returns in 30 days'},
    {at: a + 0.75, txt: 'VIP group join karne ke liye ₹49,999 bhejein'},
    {at: a + 1.15, txt: 'Only 5 seats left!! Jaldi karein ⏳'},
  ];
  return (
    <Stage t={t} cy={900} danger>
      <Kicker t={t} at={a} danger>
        SCAM ALERT
      </Kicker>
      <div style={{position: 'absolute', left: 110, top: 300, width: 860, height: 1120, borderRadius: 70, background: '#0B0B0D', padding: 16, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', transform: `translateY(${(1 - m1(ph)) * 900}px) rotate(${(1 - m1(ph)) * -6}deg)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 56, background: '#0E1621', overflow: 'hidden', position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '58px 30px 22px', background: '#17212B'}}>
            <div style={{width: 96, height: 96, borderRadius: 96, overflow: 'hidden', flexShrink: 0}}>
              <Img src={staticFile('brand/dw-profile.png')} style={{width: '100%', height: '100%'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff'}}>Deepak Wadhwa VIP 🔥</div>
              <div style={{fontFamily: SANS, fontSize: 24, color: '#6D8396'}}>channel · 48,210 subscribers</div>
            </div>
            <Img src={icon('telegram.svg')} style={{width: 70, height: 70}} />
          </div>
          <div style={{padding: '30px 28px'}}>
            {posts.map((m, i) => {
              const p = sp(t, m.at, 380, 20);
              return (
                <div key={i} style={{marginBottom: 22, opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * 40}px)`}}>
                  <div style={{background: '#182533', color: '#F5F5F5', fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.3, padding: '22px 26px', borderRadius: 24, borderBottomLeftRadius: 6}}>{m.txt}</div>
                </div>
              );
            })}
            <div style={{marginTop: 10, height: 92, borderRadius: 20, background: '#2AABEE', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff', opacity: ap(t, a + 1.4)}}>Pay now & join VIP</div>
          </div>
          <AbsoluteFill style={{background: `rgba(120,0,0,${0.35 * m1(sp(t, W(91) - 0.1))})`}} />
        </div>
      </div>
      <Stamp t={t} at={W(91) - 0.1} text="FAKE" x={540} y={860} size={190} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center', opacity: ap(t, W(93) - 0.1)}}>
        <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 58, color: C.cream, letterSpacing: '-0.02em'}}>Meri photo laga ke</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, ...redText, lineHeight: 1.05}}>Telegram scams</div>
      </div>
    </Stage>
  );
};

const Kamai: React.FC<SP> = ({t, a}) => {
  const fly = pt(t, W(127) - 0.1, W(130) + 0.3, ease.inOut);
  return (
    <Stage t={t} cy={980}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.dim, opacity: ap(t, W(120) - 0.05)}}>apni</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, ...goldText, lineHeight: 1.02, opacity: ap(t, W(121) - 0.05), transform: `translateY(${(1 - ap(t, W(121) - 0.05, 0.4)) * 40}px)`}}>khoon-paseene</div>
        <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 70, color: C.cream, letterSpacing: '-0.03em', opacity: ap(t, W(123) - 0.05)}}>ki mehnat</div>
        <div style={{fontFamily: SANS, fontWeight: 850, fontSize: 70, color: C.cream, letterSpacing: '-0.03em', opacity: ap(t, W(124) - 0.05)}}>aur gaadhe ki kamai</div>
      </div>
      <Icon3D t={t} at={a + 0.1} n="money_bag.png" size={330} x={lerp(540, 860, fly)} y={lerp(1180, 1050, fly)} rot={lerp(0, 25, fly)} />
      {fly > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const u = m1(Math.max(0, fly * 1.4 - i * 0.12));
          return (
            <div key={i} style={{position: 'absolute', left: lerp(560, 1100, u) + i * 20, top: lerp(1150, 700 - i * 60, u), width: 140, height: 140, opacity: u > 0 && u < 1 ? 1 : 0, transform: `rotate(${u * 40}deg)`}}>
              <Img src={icon('money_with_wings.png')} style={{width: '100%', height: '100%'}} />
            </div>
          );
        })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, ...redText, opacity: ap(t, W(127) - 0.05)}}>kisi ko de dete hain</div>
    </Stage>
  );
};

const Multiply: React.FC<SP> = ({t, a}) => {
  const grow = pt(t, W(140) - 0.1, W(142), ease.inOut);
  const val = Math.round(lerp(1, 10, grow));
  const crack = pt(t, W(142), W(143) + 0.3, ease.inOut);
  const fmt = (lakh: number) => (lakh >= 10 ? '10,00,000' : `${lakh},00,000`);
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a}>YEH SOCHKAR…</Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.dim, opacity: ap(t, a + 0.1)}}>&ldquo;woh hamare paise ko</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 160, ...goldText, lineHeight: 1, opacity: m1(sp(t, W(140) - 0.08) * 2), transform: `scale(${lerp(1.3, 1, m1(sp(t, W(140) - 0.08)))})`}}>multiply</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.dim, opacity: ap(t, W(141) - 0.05)}}>karke wapas karega&rdquo;</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 760, borderRadius: 40, background: 'rgba(18,18,18,0.9)', border: `2px solid ${C.line}`, padding: '50px 40px', textAlign: 'center', transform: `rotate(${crack * -3}deg)`}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', color: C.dim}}>AAPKA PAISA</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: '-0.04em', color: crack > 0.4 ? C.red : C.cream, marginTop: 10, fontVariantNumeric: 'tabular-nums'}}>
          <Rupee size={100} color={crack > 0.4 ? C.red : C.cream} />
          {fmt(val)}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 10, opacity: grow > 0 ? 1 : 0}}>
          <Img src={icon('chart_increasing.png')} style={{width: 90, height: 90}} />
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, ...goldText}}>×{val}</span>
        </div>
        {/* the promise breaks */}
        <svg width={920} height={420} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
          <path d="M 60 60 L 860 360" stroke={C.red} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${crack * 860} 2000`} />
        </svg>
      </div>
      <Stamp t={t} at={W(143) + 0.05} text="JHOOTHA VAADA" x={540} y={1330} size={86} rot={-6} />
    </Stage>
  );
};

const Crorepati: React.FC<SP> = ({t, a}) => (
  <Stage t={t} cy={900}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.cream, opacity: ap(t, a + 0.02)}}>Woh khud</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, ...goldText, lineHeight: 1, opacity: m1(sp(t, W(159) - 0.08) * 2), transform: `scale(${lerp(1.3, 1, m1(sp(t, W(159) - 0.08)))})`}}>crorepati</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.dim, opacity: ap(t, W(160) - 0.05)}}>·</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, ...goldText, lineHeight: 1, opacity: m1(sp(t, W(160) - 0.08) * 2), transform: `scale(${lerp(1.3, 1, m1(sp(t, W(160) - 0.08)))})`}}>arabpati</div>
    </div>
    <Icon3D t={t} at={W(159) - 0.05} n="money_bag.png" size={190} x={540} y={250} rot={-8} />
    <Icon3D t={t} at={W(160) - 0.05} n="bank.png" size={170} x={540} y={1330} rot={6} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1120, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: ap(t, W(161) - 0.08), transform: `translateY(${(1 - ap(t, W(161) - 0.08, 0.4)) * 30}px)`}}>
      <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: '-0.04em', ...redText}}>nahi ban jaata?</span>
      <Img src={icon('thinking_face.png')} style={{width: 140, height: 140}} />
    </div>
  </Stage>
);

const NoMoney: React.FC<SP> = ({t, a}) => {
  const card = sp(t, a + 0.02, 220, 20);
  const pay = sp(t, W(193) - 0.1, 300, 18);
  const truth = sp(t, W(198) - 0.08, 280, 18);
  return (
    <Stage t={t} cy={900}>
      <Kicker t={t} at={a}>JAHAN MERI PHOTO HO</Kicker>
      {/* a payment request that uses his photo */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 300, borderRadius: 40, background: '#fff', padding: '36px 40px', boxShadow: '0 50px 100px rgba(0,0,0,0.6)', transform: `translateY(${(1 - m1(card)) * 900}px) rotate(-2deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{width: 130, height: 130, borderRadius: 130, overflow: 'hidden', flexShrink: 0}}>
            <Img src={staticFile('brand/dw-profile.png')} style={{width: '100%', height: '100%'}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#111'}}>Payment request</div>
            <div style={{fontFamily: SANS, fontSize: 28, color: '#666'}}>&ldquo;Deepak sir ki team&rdquo;</div>
          </div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, color: '#111', marginTop: 24, letterSpacing: '-0.03em'}}>
          <Rupee size={76} color="#111" />
          25,000
        </div>
        <div style={{marginTop: 18, height: 96, borderRadius: 22, background: pay > 0 ? '#E6E6E6' : '#1A73E8', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, color: pay > 0 ? '#999' : '#fff', textDecoration: pay > 0.5 ? 'line-through' : 'none'}}>Pay now</div>
      </div>
      <Stamp t={t} at={W(193) - 0.1} text="NA DEIN" x={540} y={860} size={110} />
      {/* the truth */}
      <div style={{position: 'absolute', left: 80, right: 80, top: 1060, textAlign: 'center', opacity: m1(truth * 2), transform: `translateY(${(1 - m1(truth)) * 60}px)`}}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 42, color: C.cream}}>deepakwadhwa.official</span>
          <Verified size={44} />
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...goldText, lineHeight: 1.05, marginTop: 20}}>Hum kisi se</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', color: C.cream, lineHeight: 1.05}}>koi paisa nahi lete</div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 26}}>
          <Img src={icon('shield.png')} style={{width: 160, height: 160, transform: `scale(${m1(sp(t, W(203) - 0.1, 300, 12))})`}} />
        </div>
      </div>
    </Stage>
  );
};

const Upi: React.FC<SP> = ({t, a}) => {
  const ph = sp(t, a + 0.02, 220, 20);
  const showDW = t >= W(221) - 0.1;
  const swap1 = t >= W(230) - 0.1;
  const swap2 = t >= W(231) - 0.1;
  const name = swap2 ? 'Biharilal Verma' : swap1 ? 'Shyamlal Kumar' : showDW ? 'Deepak Wadhwa ?' : '';
  const bad = swap1;
  const flip = swap2 ? sp(t, W(231) - 0.1, 400, 18) : swap1 ? sp(t, W(230) - 0.1, 400, 18) : sp(t, W(221) - 0.1, 400, 18);
  return (
    <Stage t={t} cy={900} danger={bad}>
      <Kicker t={t} at={a} danger={bad}>
        {bad ? 'NAAM CHECK KARIYE' : 'KISKO PAY KAR RAHE HAIN?'}
      </Kicker>
      <div style={{position: 'absolute', left: 150, top: 300, width: 780, height: 1180, borderRadius: 70, background: '#0B0B0D', padding: 16, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', transform: `translateY(${(1 - m1(ph)) * 900}px)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 56, background: '#FFFFFF', overflow: 'hidden', position: 'relative', padding: '90px 46px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.12em', color: '#888'}}>UPI PAYMENT</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#111', letterSpacing: '-0.04em', marginTop: 18}}>
            <Rupee size={92} color="#111" />
            50,000
          </div>
          <div style={{fontFamily: SANS, fontSize: 30, color: '#777', marginTop: 40}}>Paying to</div>
          <div style={{marginTop: 12, minHeight: 120, borderRadius: 24, border: `4px solid ${bad ? C.red : '#DDD'}`, background: bad ? 'rgba(255,59,48,0.08)' : '#F7F7F7', display: 'flex', alignItems: 'center', gap: 20, padding: '0 28px'}}>
            <div style={{width: 76, height: 76, borderRadius: 76, background: bad ? C.red : '#CCC', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#fff', flexShrink: 0}}>{name ? name[0] : ''}</div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: bad ? 46 : 52, color: bad ? C.red : C.gold2, transformOrigin: '0 50%', transform: `translateY(${(1 - m1(flip)) * 30}px) scale(${bad ? 1 : lerp(1.6, 1.06, m1(flip))})`, opacity: m1(flip * 2), whiteSpace: 'nowrap'}}>{name}</div>
          </div>
          {bad && (
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, opacity: m1(flip * 2)}}>
              <Img src={icon('warning.png')} style={{width: 64, height: 64}} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.red}}>Yeh Deepak Wadhwa nahi hai!</span>
            </div>
          )}
          <div style={{position: 'absolute', left: 46, right: 46, bottom: 70, height: 110, borderRadius: 26, background: bad ? '#E6E6E6' : '#1A73E8', display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: bad ? '#AAA' : '#fff'}}>{bad ? 'Ruk jaiye ✋' : 'Pay'}</div>
        </div>
      </div>
    </Stage>
  );
};

const ScamStamp: React.FC<SP> = ({t, a}) => {
  const hit = sp(t, W(237) - 0.06, 520, 16);
  const shake = t > W(237) - 0.06 && t < W(237) + 0.25 ? Math.sin(t * 90) * 10 * (1 - pt(t, W(237), W(237) + 0.25)) : 0;
  return (
    <Stage t={t} cy={900} danger>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.cream, opacity: ap(t, a + 0.02)}}>Yadi aisa hai, toh</div>
        <Icon3D t={t} at={a + 0.1} n="police_car_light.png" size={220} x={540} y={600} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `rotate(-8deg) scale(${lerp(2.6, 1, m1(hit))})`, opacity: m1(hit * 3), border: `22px solid ${C.red}`, borderRadius: 40, padding: '10px 60px', fontFamily: SANS, fontWeight: 900, fontSize: 280, letterSpacing: '0.04em', color: C.red, lineHeight: 1, boxShadow: '0 0 120px rgba(255,59,48,0.45)', textShadow: '0 0 40px rgba(255,59,48,0.5)'}}>SCAM</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, ...redText, opacity: ap(t, W(238) - 0.05), transform: `translateY(${(1 - ap(t, W(238) - 0.05, 0.4)) * 30}px)`}}>hona nishchit hai.</div>
      </AbsoluteFill>
    </Stage>
  );
};

const SCENES: Record<string, React.FC<SP>> = {better: Better, portfolio: Portfolio, telegram: Telegram, kamai: Kamai, multiply: Multiply, crorepati: Crorepati, nomoney: NoMoney, upi: Upi, scam: ScamStamp};

// ---------------------------------------------------------------- overlays on the speaker (icons only, no extra text)
type Pop = {at: number; until: number; n: string; x: number; y: number; size: number; rot?: number};
const POPS: Pop[] = [
  {at: 70, until: 76, n: 'police_car_light.png', x: 860, y: 420, size: 200},
  {at: 70, until: 76, n: 'warning.png', x: 200, y: 520, size: 170, rot: -10},
  {at: 109, until: 114, n: 'chart_decreasing.png', x: 860, y: 460, size: 200, rot: 8},
  {at: 117, until: 120, n: 'locked.png', x: 200, y: 520, size: 160},
  {at: 147, until: 157, n: 'thinking_face.png', x: 860, y: 430, size: 210},
  {at: 155, until: 157, n: 'red_question_mark.png', x: 210, y: 480, size: 180, rot: -14},
  {at: 184, until: 186, n: 'prohibited.png', x: 860, y: 450, size: 220},
  {at: 213, until: 219, n: 'red_question_mark.png', x: 860, y: 430, size: 190, rot: 12},
  {at: 242, until: 252, n: 'shield.png', x: 860, y: 430, size: 220},
  {at: 252, until: 255, n: 'baby.png', x: 200, y: 520, size: 180, rot: -8},
];
const Pops: React.FC<{t: number}> = ({t}) => (
  <>
    {POPS.map((p, i) => {
      const a = W(p.at) - 0.1;
      const b = p.until >= WORDS.length ? edit.speech : W(p.until) - 0.08;
      if (t < a || t > b) return null;
      const out = pt(t, b - 0.18, b, ease.in);
      return (
        <div key={i} style={{opacity: 1 - out}}>
          <Icon3D t={t} at={a} n={p.n} size={p.size} x={p.x} y={p.y} rot={p.rot} />
        </div>
      );
    })}
  </>
);

/** Red alert pulse on the frame edges during the scam beats on camera. */
const AlertEdge: React.FC<{t: number}> = ({t}) => {
  const zones = [
    [W(67), W(84)],
    [W(114), W(120)],
    [W(184), W(186)],
  ];
  const v = Math.max(0, ...zones.map(([a, b]) => pt(t, a - 0.2, a + 0.2) * (1 - pt(t, b - 0.3, b))));
  if (v <= 0) return null;
  return <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 + 40 * Math.sin(t * 6)}px rgba(255,59,48,${0.55 * v})`, pointerEvents: 'none'}} />;
};

// ---------------------------------------------------------------- intro: cut-out Deepak, live background, fast kinetic words
const T_OUT = W(29) - 0.08;
const CUT_FRAMES = 368;
const BEAT_S = 60 / 92;
type Phrase = {a: number; b: number; big: number[]; red?: boolean; icons: {n: string; x: number; y: number; s: number; r?: number}[]};
const PHRASES: Phrase[] = [
  {a: 0, b: 5, big: [3], icons: [{n: 'money_bag.png', x: 860, y: 640, s: 200, r: 10}]}, // Dosto, kisi ko PAISE dene se
  {a: 6, b: 9, big: [6], icons: [{n: 'thinking_face.png', x: 170, y: 660, s: 170, r: -10}]}, // BEHTAR hai ki jaakar
  {a: 10, b: 13, big: [11], red: true, icons: [{n: 'game_die.png', x: 170, y: 640, s: 190, r: -15}, {n: 'slot_machine.png', x: 880, y: 660, s: 200, r: 8}]}, // kahin JUA khel aaiye
  {a: 14, b: 18, big: [16, 17], icons: [{n: 'hotel.png', x: 870, y: 660, s: 210, r: 6}]}, // ya kisi FIVE-STAR HOTEL mein
  {a: 19, b: 25, big: [23], icons: [{n: 'baby.png', x: 170, y: 650, s: 180, r: -8}, {n: 'people_hugging.png', x: 880, y: 660, s: 190, r: 8}]}, // apne upar aur apne BACHCHON ke upar
  {a: 26, b: 28, big: [26], icons: [{n: 'money_with_wings.png', x: 860, y: 640, s: 210, r: 12}]}, // KHARCH kar dijiye
];
const PH_AT = (p: Phrase) => W(p.a) - 0.08;

const Marquee: React.FC<{t: number; y: number; dir: number; text: string; o: number}> = ({t, y, dir, text, o}) => {
  const x = ((t * 260 * dir) % 1400) - (dir > 0 ? 1400 : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '3px rgba(255,138,0,0.5)', opacity: o}}>
      {Array.from({length: 4}, () => text).join('  ')}
    </div>
  );
};

const ORBIT = ['money_bag.png', 'game_die.png', 'hotel.png', 'money_with_wings.png', 'slot_machine.png', 'baby.png'];

const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > T_OUT + 0.45) return null;
  const out = pt(t, T_OUT - 0.05, T_OUT + 0.4, ease.inOut);
  const pulse = Math.exp(-(((t % BEAT_S) / BEAT_S) * 6));
  const pi = PHRASES.reduce((n, p, i) => (t >= PH_AT(p) ? i : n), 0);
  const P = PHRASES[pi];
  const at = PH_AT(P);
  // camera punches in/out on every phrase, shakes on the big word
  const zoomFor = (i: number) => [1.0, 1.12, 1.24, 1.06, 1.16, 1.28][i];
  const zk = pi ? m1(sp(t, at, 420, 26)) : 1;
  const zoom = lerp(pi ? zoomFor(pi - 1) : 1, zoomFor(pi), zk) * lerp(1, 0.5, out);
  const enter = sp(t, OFF, 300, 20);
  const bigAt = W(P.big[0]) - 0.06;
  const hit = t >= bigAt && t < bigAt + 0.28 ? 1 - (t - bigAt) / 0.28 : 0;
  const shx = Math.sin(t * 95) * 12 * hit, shy = Math.cos(t * 80) * 8 * hit;
  const fi = Math.min(CUT_FRAMES - 1, Math.floor(t * FPS));
  const pin = ap(t, at, 0.18);
  const red = !!P.red;
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translate(${shx}px, ${shy}px)`}}>
      <AbsoluteFill style={{background: C.bg, transform: 'scale(1.1)'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 52%, ${red ? `rgba(255,50,30,${0.4 + 0.2 * pulse})` : `rgba(255,120,0,${0.42 + 0.18 * pulse})`} 0%, ${red ? '#2A0604' : '#2A1204'} 45%, ${C.bg} 100%)`}} />
      <AbsoluteFill style={{background: `repeating-conic-gradient(from ${t * 28}deg at 50% 62%, rgba(255,170,60,0.12) 0deg 7deg, transparent 7deg 18deg)`}} />
      <Marquee t={t} y={300} dir={-1} text="PAISA KISKO DE RAHE HAIN? •" o={0.5} />
      <Marquee t={t + 2} y={520} dir={1} text="SCAM ALERT • STAY SAFE •" o={0.38} />
      <Marquee t={t + 4} y={740} dir={-1} text="SOCH SAMAJH KE • DEEPAK WADHWA •" o={0.28} />
      {ORBIT.map((n, i) => {
        const ang = (i / ORBIT.length) * Math.PI * 2 + t * 1.0;
        const x = 540 + Math.cos(ang) * 470, y = 1010 + Math.sin(ang) * 250;
        return <Img key={n} src={icon(n)} style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, opacity: 0.5, filter: 'blur(2px) drop-shadow(0 20px 30px rgba(0,0,0,0.6))', transform: `rotate(${Math.sin(t * 2 + i) * 12}deg)`}} />;
      })}
      {Array.from({length: 30}, (_, i) => {
        const x = rand(i * 7.7) * 1080;
        const y = 1920 - ((rand(i * 3.3) * 1920 + t * (160 + rand(i) * 260)) % 2000);
        const r = 4 + rand(i * 2.9) * 8;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: i % 3 ? C.gold : '#FFE2B0', boxShadow: `0 0 ${r * 3}px ${C.gold}`, opacity: 0.7}} />;
      })}
      {/* Deepak, background removed */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '50% 100%', transform: `translateY(${470 + (1 - m1(enter)) * 300}px) scale(${zoom * 1.1})`}}>
        <Img src={staticFile(`clips/cut/f${String(fi).padStart(4, '0')}.webp`)} style={{width: 1080, height: 1920, filter: `contrast(1.07) saturate(1.08) drop-shadow(0 0 26px ${red ? 'rgba(255,60,40,0.6)' : 'rgba(255,140,0,0.55)'}) drop-shadow(0 30px 50px rgba(0,0,0,0.6))`}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 380, background: `linear-gradient(180deg, transparent, ${C.bg} 75%)`}} />
      {/* kinetic words: exactly what he says */}
      <div key={pi} style={{position: 'absolute', left: 50, right: 50, top: 180, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 22, opacity: pin, transform: `translateX(${(1 - pin) * 120}px)`, filter: pin < 1 ? `blur(${(1 - pin) * 10}px)` : undefined}}>
        {WORDS.slice(P.a, P.b + 1).map((w) => {
          const big = P.big.includes(w.i);
          const s2 = sp(t, w.s - 0.06, 460, 17);
          if (s2 <= 0) return null;
          return (
            <span key={w.i} style={{display: 'inline-block', fontFamily: big ? SERIF : SANS, fontStyle: big ? 'italic' : 'normal', fontWeight: big ? 400 : 900, fontSize: big ? 170 : 88, lineHeight: big ? 1.0 : 1.15, letterSpacing: big ? '0' : '-0.03em', textTransform: big ? 'none' : 'uppercase', paddingRight: big ? '0.2em' : 0, ...(big ? (red ? redText : goldText) : {color: C.cream}), transform: `scale(${lerp(big ? 2.2 : 1.6, 1, m1(s2))})`, opacity: m1(s2 * 3), filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.7))'}}>
              {clean(w.w).replace(/[,.]/g, '')}
            </span>
          );
        })}
      </div>
      {P.icons.map((ic, i) => (
        <Img key={pi * 10 + i} src={icon(ic.n)} style={{position: 'absolute', left: ic.x - ic.s / 2, top: ic.y - ic.s / 2, width: ic.s, height: ic.s, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))', transform: `scale(${m1(sp(t, bigAt + i * 0.08, 420, 12))}) rotate(${(ic.r ?? 0) + Math.sin(t * 5 + i) * 6}deg)`}} />
      ))}
      <AbsoluteFill style={{background: red ? '#FF6B5E' : '#FFD9A0', opacity: (1 - pt(t, at, at + 0.14)) * (pi ? 0.35 : 0), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** His name zoomed and centred below the mouth: in the intro, and when he says "Deepak Wadhwa". */
const NAME_AT = [{a: OFF + 0.1, y: 1600, big: true}, {a: W(221) - 0.08, y: 1530, big: true}];
const NameTag: React.FC<{t: number}> = ({t}) => {
  const n = NAME_AT.filter((x) => t >= x.a).pop();
  if (!n || t > n.a + 2.4) return null;
  const s = sp(t, n.a, 380, 15);
  const v = m1(s * 2) * (1 - pt(t, n.a + 2.0, n.a + 2.4, ease.in));
  const shine = pt(t, n.a + 0.15, n.a + 0.9, ease.inOut);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: n.y, display: 'flex', justifyContent: 'center', opacity: v, transform: `scale(${lerp(1.9, 1, m1(s))})`}}>
      <div style={{position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 40px', borderRadius: 999, background: GOLD_GRAD, boxShadow: '0 18px 50px rgba(255,120,0,0.45), 0 10px 30px rgba(0,0,0,0.6)'}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, letterSpacing: '-0.02em', color: C.ink, whiteSpace: 'nowrap'}}>Deepak Wadhwa</span>
        <svg width={50} height={50} viewBox="0 0 40 40">
          <path d="M20 2l4.2 3.1 5.2-.3 1.7 4.9 4.4 2.8-1.2 5.1 2.1 4.8-3.6 3.8-.4 5.2-5.1 1.3-3 4.3-4.9-1.8-4.9 1.8-3-4.3-5.1-1.3-.4-5.2L2.4 22.4l2.1-4.8-1.2-5.1 4.4-2.8 1.7-4.9 5.2.3z" fill={C.ink} />
          <path d="M13 20.5l4.6 4.6L27.5 15" fill="none" stroke={C.gold} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine * 140 - 30}%, rgba(255,255,255,0.7) ${shine * 140 - 15}%, transparent ${shine * 140}%)`}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.25) return null;
  const r = t - a;
  const k = pt(t, a - 0.25, a + 0.1);
  return (
    <AbsoluteFill style={{opacity: k}}>
      <Stage t={t} cy={820}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.6, 1, m1(sp(t, a + 0.05, 200, 14)))})`}}>
          <Img src={icon('shield.png')} style={{width: 280, height: 280, filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.6))'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: '0.2em', paddingLeft: '0.2em', color: C.cream, opacity: pt(r, 0.15, 0.5)}}>STAY ALERT</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, lineHeight: 1, ...goldText, opacity: pt(r, 0.3, 0.7)}}>Stay safe</div>
        <div style={{position: 'absolute', left: 90, right: 90, top: 1020, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.cream, lineHeight: 1.3, opacity: pt(r, 0.6, 1.0)}}>
          Deepak Wadhwa <span style={{color: C.red}}>kabhi bhi</span> paise nahi maangte
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1210, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: pt(r, 0.9, 1.3)}}>
          <InstaMark size={64} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.cream}}>deepakwadhwa.official</span>
          <Verified size={44} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS + OFF;
  const s = sceneAt(t);
  const S = s ? SCENES[s.id] : null;
  const e = s ? pt(t, s.a, s.a + 0.22, ease.out) : 1;
  const prev = s ? FF.find((g) => Math.abs(g.b - s.a) < 0.02) : undefined;
  const P = prev ? SCENES[prev.id] : null;
  const x = s ? pt(t, s.b - 0.1, s.b, ease.in) : 0;
  const toFace = s ? !FF.some((g) => Math.abs(g.a - s.b) < 0.02) : false;
  const flash = Math.max(0, ...FF.map((f) => 1 - Math.min(1, Math.abs(t - f.a) / 0.05)), ...RETURNS.map((r) => 1 - Math.min(1, Math.abs(t - r) / 0.05)));
  const alert = Math.max(0, ...[[W(67), W(84)], [W(114), W(120)]].map(([a2, b2]) => pt(t, a2 - 0.2, a2 + 0.3) * (1 - pt(t, b2 - 0.3, b2))));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>
        <Speaker t={t} />
        <Grade alert={alert} />
      </AbsoluteFill>
      {!s && t >= T_OUT && t < edit.speech && (
        <>
          <AlertEdge t={t} />
          <Pops t={t} />
          <Captions t={t} />
        </>
      )}
      {P && prev && s && (
        <AbsoluteFill style={{transform: `translateX(${-e * 0.35 * 1080 * s.dir}px)`, opacity: 1 - e * 0.6}}>
          <P t={t} a={prev.a} b={prev.b} />
        </AbsoluteFill>
      )}
      {S && s && (
        <AbsoluteFill
          style={{
            transform: `translateX(${(1 - e) * 1080 * s.dir}px) skewX(${(1 - e) * -10 * s.dir}deg) scale(${toFace ? 1 + x * 0.25 : 1})`,
            filter: e < 1 ? `blur(${(1 - e) * 24}px)` : x > 0 && toFace ? `blur(${x * 16}px)` : undefined,
            opacity: toFace ? 1 - x : 1,
          }}
        >
          <S t={t} a={s.a} b={s.b} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: s?.id === 'scam' || s?.id === 'telegram' ? C.red : C.gold, opacity: flash * 0.28, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <Intro t={t} />
      <NameTag t={t} />
      <EndCard t={t} />
      <Grain frame={frame} />
      <Audio src={staticFile('audio/voice.wav')} startFrom={OFF_F} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} startFrom={OFF_F} volume={0.6} />}
    </AbsoluteFill>
  );
};

export {rand};
