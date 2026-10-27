import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import edit from './edit.json';

// ---------------------------------------------------------------- tokens
const C = {
  bg: '#08080A',
  card: '#141417',
  card2: '#1C1C20',
  line: 'rgba(255,255,255,0.12)',
  paper: '#F3F1EC',
  ink: '#111111',
  grey: '#8E8C86',
  dim: 'rgba(255,255,255,0.55)',
  lime: '#C8FF3E',
  red: '#FF4630',
  green: '#2BD576',
  link: '#1A0DAB',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const MONO = '"Liberation Mono", "DejaVu Sans Mono", monospace';
const FPS = edit.fps;

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

type Word = {w: string; s: number; e: number; take: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 260, damping = 22) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.2) => pt(t, at, at + d, ease.out);
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, '');

// ---------------------------------------------------------------- full-frame scenes (word-timed)
type Scene = {id: string; a: number; b: number; dir: number};
const FF: Scene[] = [
  {id: 'serp', a: W(3) - 0.08, b: W(12) - 0.06, dir: 1},
  {id: 'agency', a: W(21) - 0.08, b: W(32) - 0.06, dir: -1},
  {id: 'team', a: W(39) - 0.06, b: W(43) - 0.05, dir: 1},
  {id: 'auditor', a: W(46) - 0.08, b: W(53) - 0.06, dir: -1},
  {id: 'analyst', a: W(56) - 0.08, b: W(68) - 0.06, dir: 1},
  {id: 'researcher', a: W(71) - 0.08, b: W(79) - 0.06, dir: -1},
  {id: 'editor', a: W(82) - 0.08, b: W(96) - 0.06, dir: 1},
  {id: 'together', a: W(99) - 0.08, b: W(111) - 0.06, dir: -1},
  {id: 'workflow', a: W(111) - 0.06, b: W(120) - 0.06, dir: 1},
];
const sceneAt = (t: number) => FF.find((f) => t >= f.a && t < f.b);
// moments the face comes back (a scene ends and no scene follows)
const RETURNS = FF.filter((f) => !FF.some((g) => Math.abs(g.a - f.b) < 0.02)).map((f) => f.b);

// ---------------------------------------------------------------- icons
const Ico: React.FC<{name: string; size?: number; color?: string; sw?: number}> = ({name, size = 40, color = '#fff', sw = 2.2}) => {
  const P: Record<string, React.ReactNode> = {
    auditor: (
      <>
        <circle cx={10.5} cy={10.5} r={6.5} />
        <path d="M15.5 15.5 L21 21" />
        <path d="M8 10.5 h5" />
      </>
    ),
    analyst: (
      <>
        <path d="M3 20 h18" />
        <path d="M4 16 L9 11 L13 14 L20 6" />
        <path d="M15 6 h5 v5" />
      </>
    ),
    researcher: (
      <>
        <path d="M4 6 h16" />
        <path d="M4 12 h11" />
        <path d="M4 18 h6" />
        <circle cx={18} cy={17} r={3} />
      </>
    ),
    editor: (
      <>
        <path d="M4 20 L5 15.5 L16 4.5 L19.5 8 L8.5 19 Z" />
        <path d="M13.5 7 L17 10.5" />
      </>
    ),
    check: <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />,
    cross: <path d="M6 6 L18 18 M18 6 L6 18" />,
    up: <path d="M12 19 V5 M6 11 L12 5 L18 11" />,
    search: (
      <>
        <circle cx={10.5} cy={10.5} r={6.5} />
        <path d="M15.5 15.5 L21 21" />
      </>
    ),
    send: <path d="M3 12 L21 3 L14 21 L11 13 Z" />,
    rupee: <path d="M6 4 h12 M6 8.5 h12 M9 4 c4.5 0 6.5 2 6.5 4.5 S13.5 13 9 13 h-1 L16 21" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
      {P[name]}
    </svg>
  );
};

const AGENTS = [
  {id: 'auditor', n: '01', name: 'Auditor', job: 'finds what hurts your rankings'},
  {id: 'analyst', n: '02', name: 'Analyst', job: 'finds pages close to page 1'},
  {id: 'researcher', n: '03', name: 'Researcher', job: 'finds what customers search'},
  {id: 'editor', n: '04', name: 'Editor', job: 'checks every claim'},
];

// ---------------------------------------------------------------- the speaker
const Speaker: React.FC<{t: number; pip?: boolean}> = ({t, pip}) => {
  const cur = WORDS.reduce((n, w) => (t >= w.s - 0.05 ? w : n), WORDS[0]);
  const base = cur.take % 2 ? 1.13 : 1.02;
  const back = RETURNS.reduce((s, r) => s + 0.16 * (1 - pt(t, r, r + 0.35, ease.out)) * (t >= r ? 1 : 0), 0);
  const intro = 0.22 * (1 - pt(t, 0, 0.5, ease.out));
  const z = pip ? 1 : base + back + intro + 0.015 * Math.sin(t * 0.4);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 42%'}}>
      {(edit.pieces as {src: string; at: number; in: number; out: number; dur: number}[]).map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round(c.dur * FPS)}>
          <OffthreadVideo
            src={staticFile(c.src)}
            startFrom={c.in}
            endAt={c.out}
            muted={pip}
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: pip ? 'contrast(1.1) saturate(0.8)' : 'contrast(1.12) saturate(0.82) brightness(0.9)'}}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 42%, transparent 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.85) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent 22%, transparent 55%, rgba(0,0,0,0.7))'}} />
  </>
);

/** Live webcam bubble of the speaker, so the face never leaves for long. */
const Bubble: React.FC<{t: number; at: number; x: number; y: number; d?: number}> = ({t, at, x, y, d = 220}) => {
  const p = sp(t, at, 240, 18);
  const s = 0.4;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: d, height: d, transform: `scale(${Math.min(1.05, p)})`, opacity: Math.min(1, p * 2)}}>
      <div style={{position: 'absolute', inset: -7, borderRadius: d, border: `3px solid ${C.lime}`}} />
      <div style={{position: 'relative', width: d, height: d, borderRadius: d, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', left: d / 2 - 540 * s, top: d / 2 - 850 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Speaker t={t} pip />
        </div>
      </div>
      <div style={{position: 'absolute', left: '50%', bottom: -20, transform: 'translateX(-50%)', background: C.red, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '0.14em', padding: '5px 14px', borderRadius: 8}}>LIVE</div>
    </div>
  );
};

// ---------------------------------------------------------------- captions
const SERIF_W = new Set(['google?', 'problem.', 'thousands', 'own', 'auditor', 'analyst', 'researcher', 'editor', 'accurate', 'together', 'workflow!', 'details.', 'neuraxine.', 'team?', 'team,', 'actually', 'false']);
const LIME_W = new Set(['seo', 'auditor', 'analyst', 'researcher', 'editor', 'workflow!', 'neuraxine.', 'together', 'first', 'dm']);
const RED_W = new Set(['not', 'problem.', 'thousands', 'false', 'claims.']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const k = w.w.toLowerCase();
    const serifBreak = SERIF_W.has(k) && cur.length > 1;
    if (/[.,?!]["”]?,?$/.test(w.w) || cur.length >= 3 || serifBreak || !nx || nx.take !== w.take) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();

const Captions: React.FC<{t: number; small?: boolean}> = ({t, small}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  if (small) {
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1700, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', gap: 14, background: 'rgba(8,8,10,0.86)', borderRadius: 18, padding: '14px 26px', border: '1px solid rgba(255,255,255,0.1)'}}>
          {c.words.map((w, i) => {
            if (t < w.s - 0.02) return null;
            const k = w.w.toLowerCase();
            const p = ap(t, w.s - 0.02, 0.1);
            return (
              <span key={i} style={{fontFamily: SANS, fontWeight: 750, fontSize: 44, letterSpacing: '-0.02em', color: LIME_W.has(k.replace(/[^a-z!?.,]/g, '')) || key(w.w) === 'seo' ? C.lime : '#fff', opacity: p, transform: `translateY(${(1 - p) * 10}px)`, display: 'inline-block'}}>
                {clean(w.w)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1210, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 22}}>
      {c.words.map((w, i) => {
        if (t < w.s - 0.02) return null;
        const k = w.w.toLowerCase();
        const serif = SERIF_W.has(k);
        const p = pt(t, w.s - 0.02, w.s + 0.12, ease.out);
        const kk = key(w.w);
        const color = RED_W.has(k) || RED_W.has(kk) ? C.red : LIME_W.has(k) || LIME_W.has(kk) ? C.lime : '#fff';
        return (
          <span
            key={i}
            style={{
              fontFamily: serif ? SERIF : SANS,
              fontStyle: serif ? 'italic' : 'normal',
              fontWeight: serif ? 400 : 800,
              fontSize: serif ? 132 : 76,
              letterSpacing: serif ? '-0.01em' : '-0.035em',
              lineHeight: 1.0,
              color,
              display: 'inline-block',
              transform: `translateY(${(1 - p) * 26}px) scale(${lerp(1.15, 1, p)})`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              opacity: p,
              textShadow: '0 6px 30px rgba(0,0,0,0.8)',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- shared bits
const Grain: React.FC<{frame: number; o?: number}> = ({frame, o = 0.08}) => (
  <AbsoluteFill style={{opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

/** Fine dot grid that drifts, the "tech paper" backdrop of the dark scenes. */
const Dots: React.FC<{t: number; color?: string}> = ({t, color = 'rgba(255,255,255,0.07)'}) => (
  <AbsoluteFill style={{backgroundImage: `radial-gradient(${color} 2px, transparent 2.5px)`, backgroundSize: '44px 44px', backgroundPosition: `0 ${-t * 30}px`}} />
);

const Header: React.FC<{t: number; a: number; n: string; name: string; job: string; icon: string}> = ({t, a, n, name, job, icon}) => {
  const p = ap(t, a + 0.04, 0.3);
  const q = ap(t, a + 0.12, 0.3);
  return (
    <div style={{position: 'absolute', left: 80, top: 170}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
        <div style={{width: 64, height: 64, borderRadius: 18, background: C.lime, display: 'grid', placeItems: 'center'}}>
          <Ico name={icon} size={38} color={C.ink} sw={2.4} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.22em', color: C.dim}}>AGENT {n}</div>
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: name.length > 8 ? 118 : 150, color: '#fff', lineHeight: 1, marginTop: 14, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, filter: q < 1 ? `blur(${(1 - q) * 10}px)` : undefined}}>
        The {name}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 36, color: C.dim, marginTop: 6, opacity: ap(t, a + 0.25, 0.3)}}>{job}</div>
    </div>
  );
};

const Panel: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 34, boxShadow: '0 40px 90px rgba(0,0,0,0.55)', overflow: 'hidden', ...style}}>{children}</div>
);

// ---------------------------------------------------------------- scenes
type SP = {t: number; a: number; b: number};

const G_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
const RESULTS = [
  {d: 'sweetcrumbs.in', h: 'Best Cake Shop Near You · Order Online'},
  {d: 'thecakestudio.in', h: 'Custom Birthday Cakes, Same-Day Delivery'},
  {d: 'bakehouse.co', h: 'Fresh Bakery · Breads, Cakes & Pastries'},
  {d: 'flourandfig.com', h: '10 Best Bakeries in the City (2026 List)'},
  {d: 'dailyloaf.in', h: 'Eggless Cakes & Desserts · Open Now'},
];
const Result: React.FC<{d: string; h: string; you?: boolean}> = ({d, h, you}) => (
  <div style={{display: 'flex', gap: 22, alignItems: 'flex-start'}}>
    <div style={{width: 54, height: 54, borderRadius: 54, background: you ? C.red : '#E8EAED', flexShrink: 0, marginTop: 4}} />
    <div style={{flex: 1}}>
      <div style={{fontFamily: SANS, fontSize: 28, color: '#4D5156'}}>{d}</div>
      <div style={{fontFamily: SANS, fontSize: 42, color: C.link, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 4}}>{h}</div>
      <div style={{height: 14, borderRadius: 7, background: '#E8EAED', width: '92%', marginTop: 14}} />
      <div style={{height: 14, borderRadius: 7, background: '#E8EAED', width: '70%', marginTop: 10}} />
    </div>
  </div>
);

const Serp: React.FC<SP> = ({t, a}) => {
  const q = 'best bakery near me';
  const typed = q.slice(0, Math.max(0, Math.floor((t - a - 0.05) / 0.025)));
  const scroll = pt(t, W(9) - 0.05, W(9) + 0.45, ease.inOut);
  const p1 = ap(t, W(7) - 0.05, 0.3);
  const you = sp(t, W(10) + 0.1, 260, 15);
  const push = lerp(1.0, 1.06, pt(t, a, a + 3, ease.soft));
  return (
    <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push}) translateY(${-scroll * 1180}px)`, transformOrigin: '50% 30%'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 112, letterSpacing: '-0.04em'}}>
          {'Google'.split('').map((ch, i) => (
            <span key={i} style={{color: G_COLORS[i]}}>{ch}</span>
          ))}
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 340, height: 110, borderRadius: 60, border: '2px solid #DFE1E5', boxShadow: '0 6px 18px rgba(32,33,36,0.16)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 40px'}}>
          <Ico name="search" size={44} color="#9AA0A6" />
          <div style={{fontFamily: SANS, fontSize: 44, color: '#202124'}}>
            {typed}
            <span style={{opacity: Math.sin(t * 16) > 0 ? 1 : 0, color: C.link}}>|</span>
          </div>
        </div>
        {RESULTS.map((r, i) => {
          const p = ap(t, a + 0.2 + i * 0.07, 0.3);
          return (
            <div key={i} style={{position: 'absolute', left: 90, right: 70, top: 540 + i * 220, opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
              <Result {...r} />
            </div>
          );
        })}
        {/* page-1 bracket */}
        <div style={{position: 'absolute', left: 36, top: 540, width: 14, height: 4 * 220 + 160, background: '#34A853', borderRadius: 8, transformOrigin: '50% 0', transform: `scaleY(${p1})`}} />
        <div style={{position: 'absolute', right: 60, top: 470, background: '#34A853', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', padding: '10px 20px', borderRadius: 12, opacity: p1, transform: `scale(${lerp(0.7, 1, p1)})`}}>PAGE 1</div>
        {/* pagination + page 2 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', fontFamily: SANS, fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em'}}>
          <span style={{color: '#4285F4'}}>G</span>
          {'oooooooo'.split('').map((o, i) => (
            <span key={i} style={{color: i === 1 ? C.red : '#FBBC05'}}>{o}</span>
          ))}
          <span style={{color: '#4285F4'}}>g</span>
          <span style={{color: '#34A853'}}>l</span>
          <span style={{color: '#EA4335'}}>e</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1760, display: 'flex', justifyContent: 'center', gap: 40, fontFamily: SANS, fontSize: 40, color: C.link}}>
          {['1', '2', '3', '4', '5', 'Next'].map((n) => (
            <span key={n} style={{color: n === '2' ? '#202124' : C.link, fontWeight: n === '2' ? 700 : 400}}>{n}</span>
          ))}
        </div>
        <div style={{position: 'absolute', left: 90, right: 70, top: 1900}}>
          <Result d="competitor.in" h="Cake Shop · Fresh Cakes Every Day" />
        </div>
        <div style={{position: 'absolute', left: 60, right: 40, top: 2120, padding: '30px 30px', borderRadius: 26, border: `4px solid ${C.red}`, background: 'rgba(255,70,48,0.06)', transform: `scale(${lerp(0.92, 1, Math.min(1, you))})`, opacity: Math.min(1, you * 2)}}>
          <Result d="yourbusiness.com" h="Your Bakery · Cakes & Desserts" you />
        </div>
        <div style={{position: 'absolute', right: 60, top: 2050, background: C.red, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: '0.08em', padding: '12px 22px', borderRadius: 12, transform: `rotate(-3deg) scale(${Math.min(1.1, you)})`}}>YOU · PAGE 2</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LINES = ['Website audit', 'Keyword research', 'On-page fixes', 'Content writing', 'Monthly report'];
const Agency: React.FC<SP> = ({t, a}) => {
  const print = pt(t, a + 0.05, a + 0.7, ease.out);
  const total = sp(t, W(24) - 0.04, 280, 18);
  const stamp = sp(t, W(26) - 0.02, 420, 20);
  const push = lerp(1.0, 1.05, pt(t, a, a + 3.5, ease.soft));
  const H = 1060;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.3em', color: C.dim, opacity: ap(t, a)}}>THE USUAL WAY</div>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <div style={{position: 'absolute', left: 140, right: 140, top: 270, height: 26, borderRadius: 13, background: '#222', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8)'}} />
        <div style={{position: 'absolute', left: 180, right: 180, top: 283, height: H, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: -H + print * H, height: H, background: C.paper, padding: '50px 54px', boxSizing: 'border-box', fontFamily: MONO, color: C.ink, clipPath: 'polygon(0 0,100% 0,100% 97%,95% 100%,90% 97%,85% 100%,80% 97%,75% 100%,70% 97%,65% 100%,60% 97%,55% 100%,50% 97%,45% 100%,40% 97%,35% 100%,30% 97%,25% 100%,20% 97%,15% 100%,10% 97%,5% 100%,0 97%)'}}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, letterSpacing: '-0.02em'}}>SEO AGENCY</div>
            <div style={{fontSize: 24, color: '#666', marginTop: 6, letterSpacing: '0.08em'}}>INVOICE · MONTHLY RETAINER</div>
            <div style={{borderTop: '3px dashed #bbb', margin: '30px 0 18px'}} />
            {LINES.map((l, i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', fontSize: 31, padding: '13px 0'}}>
                <span>{l}</span>
                <span style={{flex: 1, borderBottom: '3px dotted #c4c2bc', margin: '0 14px', transform: 'translateY(8px)'}} />
                <Ico name="rupee" size={28} color={C.ink} sw={2.4} />
                <span style={{marginLeft: 4, color: '#999'}}>••,•••</span>
              </div>
            ))}
            <div style={{borderTop: '3px dashed #bbb', margin: '22px 0 20px'}} />
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, flex: 1}}>TOTAL</span>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, transform: `scale(${Math.min(1.08, total)})`, opacity: Math.min(1, total * 2), transformOrigin: '100% 50%'}}>
                <Ico name="rupee" size={64} color={C.red} sw={2.6} />
                <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, color: C.red, lineHeight: 1}}>thousands</span>
              </div>
            </div>
            <div style={{fontFamily: SANS, fontSize: 26, color: '#666', marginTop: 24, opacity: ap(t, W(28) - 0.05)}}>for: improving your rankings</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 520, top: 980, border: `7px solid ${C.red}`, color: C.red, borderRadius: 18, padding: '14px 30px', fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: '0.08em', transform: `rotate(-12deg) scale(${lerp(2.2, 1, Math.min(1, stamp))})`, opacity: Math.min(1, stamp * 3) * 0.92, mixBlendMode: 'multiply'}}>EVERY MONTH</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Team: React.FC<SP> = ({t, a}) => {
  const slam = sp(t, W(41) - 0.03, 380, 20);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 52, color: C.dim, opacity: ap(t, a, 0.15)}}>your own</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: '#fff', lineHeight: 1, opacity: ap(t, W(40) - 0.04, 0.15), transform: `translateY(${(1 - ap(t, W(40) - 0.04, 0.25)) * 40}px)`}}>AI-powered</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 610, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 176, letterSpacing: '-0.06em', color: C.lime, lineHeight: 1, transform: `scale(${lerp(1.35, 1, Math.min(1, slam))})`, opacity: Math.min(1, slam * 3)}}>SEO TEAM</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
        {AGENTS.map((ag, i) => {
          const p = sp(t, W(41) + 0.05 + i * 0.07, 300, 20);
          return (
            <div key={ag.id} style={{background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 30, padding: '30px 30px', transform: `translateY(${(1 - Math.min(1, p)) * 80}px) scale(${lerp(0.85, 1, Math.min(1, p))})`, opacity: Math.min(1, p * 2)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{width: 74, height: 74, borderRadius: 20, background: C.lime, display: 'grid', placeItems: 'center'}}>
                  <Ico name={ag.id} size={42} color={C.ink} sw={2.4} />
                </div>
                <span style={{fontFamily: MONO, fontSize: 28, color: C.dim}}>{ag.n}</span>
              </div>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, color: '#fff', marginTop: 20, lineHeight: 1}}>{ag.name}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ISSUES = [
  {txt: 'Slow page speed', x: 690, y: 160},
  {txt: 'Missing meta titles', x: 120, y: 60},
  {txt: 'Broken links', x: 540, y: 470},
  {txt: 'Images without alt text', x: 230, y: 330},
  {txt: 'Not mobile-friendly', x: 760, y: 560},
];
const Auditor: React.FC<SP> = ({t, a}) => {
  const scan = pt(t, a + 0.15, W(52), ease.inOut);
  const BH = 680;
  const at = (i: number) => W(48) - 0.1 + i * 0.32;
  const n = ISSUES.filter((_, i) => t >= at(i)).length;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <Header t={t} a={a} n="01" name="Auditor" job="finds what hurts your rankings" icon="auditor" />
      <Panel style={{left: 70, right: 70, top: 560, height: BH + 90, transform: `translateY(${(1 - ap(t, a + 0.05, 0.3)) * 120}px)`}}>
        <div style={{height: 90, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', borderBottom: `1.5px solid ${C.line}`}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 20, height: 20, borderRadius: 20, background: c}} />
          ))}
          <div style={{marginLeft: 20, flex: 1, height: 50, borderRadius: 25, background: C.card2, display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: SANS, fontSize: 28, color: C.dim}}>yourbusiness.com</div>
          <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 700, color: n ? C.red : C.dim, minWidth: 150, textAlign: 'right'}}>ISSUES {n}</div>
        </div>
        <div style={{position: 'relative', height: BH, padding: 34}}>
          {/* wireframe of a website */}
          <div style={{height: 46, width: 220, borderRadius: 10, background: '#2A2A30'}} />
          <div style={{height: 230, borderRadius: 18, background: '#222228', marginTop: 26}} />
          <div style={{display: 'flex', gap: 22, marginTop: 26}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{flex: 1, height: 150, borderRadius: 16, background: '#222228'}} />
            ))}
          </div>
          {[0.9, 0.75, 0.82].map((w, i) => (
            <div key={i} style={{height: 18, borderRadius: 9, background: '#26262C', width: `${w * 100}%`, marginTop: 20}} />
          ))}
          {/* scanner */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: scan * BH, background: 'linear-gradient(180deg, rgba(200,255,62,0.0), rgba(200,255,62,0.08))'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: scan * BH - 2, height: 4, background: C.lime, boxShadow: `0 0 30px 6px ${C.lime}`, opacity: scan < 1 ? 1 : 0}} />
          {ISSUES.map((it, i) => {
            const p = sp(t, at(i), 400, 16);
            const ring = ((t - at(i)) * 1.4) % 1;
            return (
              <div key={i} style={{position: 'absolute', left: it.x, top: it.y, transform: `scale(${Math.min(1.1, p)})`, opacity: Math.min(1, p * 2)}}>
                <div style={{position: 'absolute', left: -28 - ring * 20, top: -28 - ring * 20, width: 56 + ring * 40, height: 56 + ring * 40, borderRadius: 100, border: `3px solid ${C.red}`, opacity: 1 - ring}} />
                <div style={{position: 'absolute', left: -18, top: -18, width: 36, height: 36, borderRadius: 36, background: C.red, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 22, color: '#fff'}}>{i + 1}</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <div style={{position: 'absolute', left: 80, right: 80, top: 1360}}>
        {ISSUES.map((it, i) => {
          const p = ap(t, at(i), 0.22);
          if (p <= 0) return null;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '12px 0', borderBottom: `1px solid ${C.line}`, opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
              <div style={{width: 40, height: 40, borderRadius: 40, background: 'rgba(255,70,48,0.15)', display: 'grid', placeItems: 'center'}}>
                <Ico name="cross" size={22} color={C.red} sw={3} />
              </div>
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: '#fff', flex: 1}}>{it.txt}</span>
              <span style={{fontFamily: MONO, fontSize: 24, color: C.red}}>#{i + 1}</span>
            </div>
          );
        })}
      </div>
      <Bubble t={t} at={a + 0.2} x={800} y={160} d={200} />
    </AbsoluteFill>
  );
};

const PAGES = [
  {p: '/birthday-cakes', from: 11, to: 4},
  {p: '/cake-delivery', from: 13, to: 6},
  {p: '/eggless-cakes', from: 12, to: 8},
  {p: '/custom-orders', from: 15, to: 9},
  {p: '/wedding-cakes', from: 17, to: 7},
  {p: '/about-us', from: 42, to: 42},
];
const Analyst: React.FC<SP> = ({t, a}) => {
  const close = ap(t, W(61) - 0.05, 0.3);
  const climb = pt(t, W(64) - 0.05, W(67) + 0.1, ease.inOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <Header t={t} a={a} n="02" name="Analyst" job="finds pages close to page 1" icon="analyst" />
      <Panel style={{left: 70, right: 70, top: 560, height: 1060, transform: `translateY(${(1 - ap(t, a + 0.05, 0.3)) * 120}px)`}}>
        <div style={{display: 'flex', padding: '30px 40px', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: C.dim, borderBottom: `1.5px solid ${C.line}`}}>
          <span style={{flex: 1}}>YOUR PAGE</span>
          <span style={{width: 230, textAlign: 'right'}}>GOOGLE POSITION</span>
        </div>
        {PAGES.map((pg, i) => {
          const p = ap(t, a + 0.2 + i * 0.08, 0.25);
          const near = pg.from <= 20;
          const pos = Math.round(lerp(pg.from, pg.to, near ? climb : 0));
          const hit = near && pos <= 10;
          return (
            <div key={pg.p} style={{position: 'relative', display: 'flex', alignItems: 'center', padding: '0 40px', height: 140, borderBottom: `1px solid ${C.line}`, opacity: p * (near ? 1 : lerp(1, 0.35, close)), transform: `translateX(${(1 - p) * 80}px)`, background: near ? `rgba(200,255,62,${0.07 * close})` : undefined}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: C.lime, transform: `scaleY(${near ? close : 0})`}} />
              <span style={{flex: 1, fontFamily: MONO, fontSize: 36, color: '#fff'}}>{pg.p}</span>
              {near && close > 0 && !hit && <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.1em', color: C.lime, marginRight: 26, opacity: close}}>CLOSE</span>}
              {hit && (
                <span style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontWeight: 800, fontSize: 22, letterSpacing: '0.1em', color: C.ink, background: C.lime, padding: '8px 14px', borderRadius: 10, marginRight: 22}}>
                  <Ico name="up" size={20} color={C.ink} sw={3} />
                  PAGE 1
                </span>
              )}
              <span style={{width: 150, textAlign: 'right', fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: hit ? C.lime : near ? '#fff' : C.dim}}>#{pos}</span>
            </div>
          );
        })}
        <div style={{padding: '34px 40px', fontFamily: SANS, fontSize: 30, color: C.dim, opacity: close}}>
          Positions 11 to 20 are one push away from <span style={{color: C.lime, fontWeight: 700}}>page 1</span>.
        </div>
      </Panel>
      <Bubble t={t} at={a + 0.2} x={800} y={160} d={200} />
    </AbsoluteFill>
  );
};

const QUERIES = [
  {q: 'cake shop near me', v: 1.0},
  {q: 'same day cake delivery', v: 0.78},
  {q: 'eggless birthday cake', v: 0.64},
  {q: 'custom cake price', v: 0.52},
  {q: 'best bakery open now', v: 0.4},
];
const Researcher: React.FC<SP> = ({t, a}) => {
  const q = 'cake';
  const typed = q.slice(0, Math.max(0, Math.floor((t - a - 0.15) / 0.06)));
  const grow = pt(t, W(76) - 0.05, W(78) + 0.2, ease.out);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <Header t={t} a={a} n="03" name="Researcher" job="finds what customers search" icon="researcher" />
      <Panel style={{left: 70, right: 70, top: 560, height: 1060, transform: `translateY(${(1 - ap(t, a + 0.05, 0.3)) * 120}px)`}}>
        <div style={{margin: 34, height: 110, borderRadius: 55, background: C.card2, display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', border: `2px solid ${C.lime}`}}>
          <Ico name="search" size={44} color={C.lime} />
          <span style={{fontFamily: SANS, fontSize: 46, color: '#fff'}}>
            {typed}
            <span style={{opacity: Math.sin(t * 16) > 0 ? 1 : 0, color: C.lime}}>|</span>
          </span>
        </div>
        <div style={{padding: '0 40px', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: C.dim, display: 'flex'}}>
          <span style={{flex: 1}}>WHAT PEOPLE SEARCH</span>
          <span>DEMAND</span>
        </div>
        {QUERIES.map((it, i) => {
          const p = ap(t, a + 0.35 + i * 0.07, 0.25);
          return (
            <div key={it.q} style={{padding: '24px 40px', borderBottom: `1px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <Ico name="search" size={30} color={C.dim} />
                <span style={{fontFamily: SANS, fontSize: 40, color: '#fff', fontWeight: 500}}>
                  {it.q.split('cake').map((part, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && <b style={{fontWeight: 800, color: C.lime}}>cake</b>}
                      {part}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <div style={{marginTop: 16, height: 16, borderRadius: 8, background: C.card2, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${it.v * grow * 100}%`, background: i === 0 ? C.lime : 'rgba(200,255,62,0.55)', borderRadius: 8}} />
              </div>
            </div>
          );
        })}
      </Panel>
      <Bubble t={t} at={a + 0.2} x={800} y={160} d={200} />
    </AbsoluteFill>
  );
};

const CLAIMS = [
  {txt: 'Fresh cakes, baked every morning.', ok: true, at: 90},
  {txt: 'Rated the No. 1 bakery in India.', ok: false, at: 94},
  {txt: 'Guaranteed delivery in 10 minutes.', ok: false, at: 95},
];
const Editor: React.FC<SP> = ({t, a}) => {
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <Header t={t} a={a} n="04" name="Editor" job="checks every claim" icon="editor" />
      <div style={{position: 'absolute', left: 70, right: 70, top: 560, height: 1060, background: C.paper, borderRadius: 30, padding: '56px 56px', boxSizing: 'border-box', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', transform: `translateY(${(1 - ap(t, a + 0.05, 0.3)) * 120}px) rotate(${lerp(-3, -1, ap(t, a, 0.6))}deg)`}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.grey}}>BLOG DRAFT · REVIEW</div>
        <div style={{fontFamily: SERIF, fontSize: 76, color: C.ink, lineHeight: 1.05, marginTop: 16}}>Why choose our bakery</div>
        {[0.95, 0.85, 0.9].map((w, i) => (
          <div key={i} style={{height: 16, borderRadius: 8, background: '#DAD7CF', width: `${w * 100}%`, marginTop: 22}} />
        ))}
        {CLAIMS.map((c, i) => {
          const at = W(c.at) - 0.05;
          const p = c.ok ? ap(t, at, 0.25) : pt(t, at, at + 0.3, ease.inOut);
          const tag = sp(t, at + 0.15, 380, 18);
          return (
            <div key={i} style={{marginTop: 40, position: 'relative'}}>
              <div style={{position: 'relative', display: 'inline-block', fontFamily: SANS, fontWeight: 600, fontSize: 42, color: !c.ok && p > 0.9 ? '#9A968C' : C.ink, letterSpacing: '-0.01em', background: c.ok ? `rgba(43,213,118,${0.22 * p})` : `rgba(255,70,48,${0.12 * Math.min(1, p * 3)})`, padding: '4px 8px', borderRadius: 6}}>
                {c.txt}
                {!c.ok && <div style={{position: 'absolute', left: 0, top: '52%', height: 6, width: `${p * 100}%`, background: C.red, borderRadius: 3}} />}
              </div>
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 14, marginLeft: 8, padding: '8px 18px', borderRadius: 999, background: c.ok ? C.green : C.red, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.1em', transform: `scale(${Math.min(1.08, tag)})`, opacity: Math.min(1, tag * 2), transformOrigin: '0 50%'}}>
                <Ico name={c.ok ? 'check' : 'cross'} size={24} color="#fff" sw={3.2} />
                {c.ok ? 'ACCURATE' : 'FALSE CLAIM · REMOVED'}
              </div>
            </div>
          );
        })}
        {[0.9, 0.6].map((w, i) => (
          <div key={i} style={{height: 16, borderRadius: 8, background: '#DAD7CF', width: `${w * 100}%`, marginTop: 30}} />
        ))}
      </div>
      <Bubble t={t} at={a + 0.2} x={800} y={160} d={200} />
    </AbsoluteFill>
  );
};

const Together: React.FC<SP> = ({t, a}) => {
  const cx = 540, cy = 720, R = 300;
  const pos = AGENTS.map((_, i) => {
    const ang = -Math.PI * 0.75 + (i * Math.PI) / 2;
    return {x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R};
  });
  const link = pt(t, W(100) - 0.05, W(101) + 0.2, ease.inOut);
  const core = sp(t, W(104) - 0.05, 300, 16);
  const climb = pt(t, W(106) - 0.05, W(110) + 0.3, ease.inOut);
  // rank chart: position 18 -> 3 (up is better)
  const CH = {x: 110, y: 1180, w: 860, h: 420};
  const N = 40;
  const ptsAll = Array.from({length: N}, (_, i) => {
    const u = i / (N - 1);
    const rank = lerp(18, 3, ease.inOut(u)) + Math.sin(u * 17) * 1.2 * (1 - u);
    return {x: CH.x + u * CH.w, y: CH.y + ((rank - 1) / 19) * CH.h};
  });
  const shown = ptsAll.slice(0, Math.max(2, Math.ceil(climb * N)));
  const last = shown[shown.length - 1];
  const rankNow = Math.round(1 + ((last.y - CH.y) / CH.h) * 19);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Dots t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: '#fff', opacity: ap(t, W(100) - 0.05), lineHeight: 1}}>
        working <span style={{color: C.lime}}>together</span>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {pos.map((p, i) => {
          const pulse = ((t - a) * 1.6 + i * 0.25) % 1;
          return (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={lerp(p.x, cx, link)} y2={lerp(p.y, cy, link)} stroke="rgba(200,255,62,0.6)" strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-t * 60} />
              {link >= 1 && <circle cx={lerp(p.x, cx, pulse)} cy={lerp(p.y, cy, pulse)} r={8} fill={C.lime} />}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={150} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="4 12" transform={`rotate(${t * 40} ${cx} ${cy})`} />
      </svg>
      <div style={{position: 'absolute', left: cx - 120, top: cy - 120, width: 240, height: 240, borderRadius: 240, background: core > 0.5 ? C.lime : C.card, border: `2px solid ${C.lime}`, display: 'grid', placeItems: 'center', transform: `scale(${lerp(0.8, 1, Math.min(1, core))})`, boxShadow: core > 0.5 ? `0 0 90px rgba(200,255,62,0.45)` : 'none'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, letterSpacing: '0.1em', color: core > 0.5 ? C.ink : '#fff'}}>STRATEGY</div>
      </div>
      {AGENTS.map((ag, i) => {
        const p = sp(t, a + 0.05 + i * 0.06, 300, 18);
        return (
          <div key={ag.id} style={{position: 'absolute', left: pos[i].x - 95, top: pos[i].y - 95, width: 190, textAlign: 'center', transform: `scale(${Math.min(1.05, p)})`, opacity: Math.min(1, p * 2)}}>
            <div style={{width: 130, height: 130, margin: '0 auto', borderRadius: 36, background: C.card, border: `2px solid ${C.line}`, display: 'grid', placeItems: 'center'}}>
              <Ico name={ag.id} size={64} color={C.lime} />
            </div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff', marginTop: 10}}>{ag.name}</div>
          </div>
        );
      })}
      {/* ranking chart */}
      <div style={{opacity: ap(t, W(106) - 0.15, 0.25)}}>
        <div style={{position: 'absolute', left: CH.x, top: CH.y - 70, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: C.dim}}>YOUR GOOGLE RANKING</div>
        <div style={{position: 'absolute', left: CH.x, width: CH.w, top: CH.y, height: (9 / 19) * CH.h, background: 'rgba(200,255,62,0.08)', borderTop: `2px solid rgba(200,255,62,0.5)`, borderBottom: `2px dashed rgba(200,255,62,0.4)`}} />
        <div style={{position: 'absolute', left: CH.x + 16, top: CH.y + 12, fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: C.lime}}>PAGE 1</div>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <polyline points={shown.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={C.lime} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={last.x} cy={last.y} r={14} fill={C.lime} />
        </svg>
        <div style={{position: 'absolute', left: Math.min(last.x - 60, 880), top: last.y - 90, background: '#fff', color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 40, padding: '6px 16px', borderRadius: 12}}>#{rankNow}</div>
      </div>
    </AbsoluteFill>
  );
};

const STEPS = ['Audit', 'Analyse', 'Research', 'Edit', 'Rank'];
const Workflow: React.FC<SP> = ({t, a}) => {
  const lit = (i: number) => t >= W(113) + i * 0.22;
  const head = sp(t, W(119) - 0.05, 320, 18);
  return (
    <AbsoluteFill style={{background: C.lime}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.09) 2px, transparent 2.5px)', backgroundSize: '44px 44px', backgroundPosition: `0 ${-t * 30}px`}} />
      <div style={{position: 'absolute', left: 80, top: 190, fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: C.ink, opacity: ap(t, W(116) - 0.05), lineHeight: 1}}>a complete</div>
      <div style={{position: 'absolute', left: 80, top: 270, fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '-0.05em', color: C.ink, opacity: ap(t, W(117) - 0.05), lineHeight: 1}}>AI-powered SEO</div>
      <div style={{position: 'absolute', left: 70, top: 380, fontFamily: SERIF, fontStyle: 'italic', fontSize: 230, color: C.ink, lineHeight: 1, transform: `scale(${lerp(1.25, 1, Math.min(1, head))})`, transformOrigin: '0 50%', opacity: Math.min(1, head * 3)}}>workflow</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 720}}>
        {STEPS.map((s, i) => {
          const p = sp(t, a + 0.05 + i * 0.07, 320, 20);
          const on = lit(i);
          return (
            <React.Fragment key={s}>
              {i > 0 && <div style={{width: 4, height: 34, marginLeft: 58, background: on ? C.ink : 'rgba(0,0,0,0.2)'}} />}
              <div style={{display: 'flex', alignItems: 'center', gap: 28, background: on ? C.ink : 'rgba(0,0,0,0.06)', borderRadius: 28, padding: '22px 26px', transform: `translateX(${(1 - Math.min(1, p)) * 200}px)`, opacity: Math.min(1, p * 2)}}>
                <div style={{width: 72, height: 72, borderRadius: 72, background: on ? C.lime : 'rgba(0,0,0,0.12)', display: 'grid', placeItems: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.ink}}>
                  {i === 4 ? <Ico name="up" size={36} color={C.ink} sw={3} /> : `0${i + 1}`}
                </div>
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: '-0.03em', color: on ? '#fff' : C.ink, flex: 1}}>{s}</span>
                {on && <Ico name="check" size={44} color={C.lime} sw={3} />}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SP>> = {serp: Serp, agency: Agency, team: Team, auditor: Auditor, analyst: Analyst, researcher: Researcher, editor: Editor, together: Together, workflow: Workflow};

// ---------------------------------------------------------------- overlays on the speaker
/** "AGENT 0n" chip when the speaker names each agent. */
const AgentChip: React.FC<{t: number}> = ({t}) => {
  const marks = [{i: 43, k: 0}, {i: 53, k: 1}, {i: 68, k: 2}, {i: 79, k: 3}];
  const m = marks.find((x, j) => t >= W(x.i) - 0.1 && t < (FF.find((f) => f.a > W(x.i))?.a ?? 1e9));
  if (!m) return null;
  const ag = AGENTS[m.k];
  const p = sp(t, W(m.i) - 0.1, 320, 20);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(10,10,12,0.8)', border: `1.5px solid ${C.line}`, borderRadius: 999, padding: '14px 30px 14px 14px', backdropFilter: 'blur(14px)', transform: `translateY(${(1 - Math.min(1, p)) * -80}px) scale(${lerp(0.8, 1, Math.min(1, p))})`, opacity: Math.min(1, p * 2)}}>
        <div style={{width: 70, height: 70, borderRadius: 70, background: C.lime, display: 'grid', placeItems: 'center'}}>
          <Ico name={ag.id} size={40} color={C.ink} sw={2.4} />
        </div>
        <span style={{fontFamily: MONO, fontSize: 30, color: C.dim}}>{ag.n}</span>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '-0.02em'}}>{ag.name}</span>
      </div>
    </div>
  );
};

/** Four agent icons recap while he says "your own AI SEO team". */
const TeamRow: React.FC<{t: number}> = ({t}) => {
  const a = W(129) - 0.1;
  if (t < a || t > W(133) - 0.05) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 22}}>
      {AGENTS.map((ag, i) => {
        const p = sp(t, a + i * 0.06, 320, 18);
        return (
          <div key={ag.id} style={{width: 120, height: 120, borderRadius: 32, background: 'rgba(10,10,12,0.8)', border: `2px solid ${C.lime}`, display: 'grid', placeItems: 'center', transform: `translateY(${(1 - Math.min(1, p)) * -60}px)`, opacity: Math.min(1, p * 2)}}>
            <Ico name={ag.id} size={60} color={C.lime} />
          </div>
        );
      })}
    </div>
  );
};

const CommentCard: React.FC<{t: number}> = ({t}) => {
  const a = W(133) - 0.12;
  const end = W(142) - 0.1;
  if (t < a || t > end) return null;
  const p = sp(t, a, 260, 20);
  const typed = 'SEO'.slice(0, Math.max(0, Math.min(3, Math.floor((t - W(134) + 0.05) / 0.08))));
  const sent = t > W(134) + 0.35;
  const dm = sp(t, W(137) - 0.05, 300, 18);
  const out = pt(t, end - 0.2, end, ease.in);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 230, opacity: Math.min(1, p * 2) * (1 - out), transform: `translateY(${(1 - Math.min(1, p)) * -80 - out * 40}px)`}}>
      <div style={{background: '#fff', borderRadius: 36, padding: '26px 30px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{width: 76, height: 76, borderRadius: 76, background: 'linear-gradient(135deg,#F9CE34,#EE2A7B,#6228D7)', padding: 4, boxSizing: 'border-box'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 76, background: '#ddd'}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#8E8E8E'}}>Add a comment…</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1}}>
            {typed}
            <span style={{opacity: Math.sin(t * 14) > 0 && typed.length < 3 ? 1 : 0, color: '#3897F0'}}>|</span>
          </div>
        </div>
        <div style={{width: 96, height: 96, borderRadius: 96, background: sent ? C.ink : '#3897F0', display: 'grid', placeItems: 'center', transform: `scale(${sent ? 1 - 0.15 * Math.sin(pt(t, W(134) + 0.35, W(134) + 0.55) * Math.PI) : 1})`}}>
          <Ico name={sent ? 'check' : 'send'} size={46} color={sent ? C.lime : '#fff'} sw={sent ? 3 : 2} />
        </div>
      </div>
      {dm > 0 && (
        <div style={{marginTop: 24, display: 'flex', justifyContent: 'flex-start'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(90deg,#7B2FF7,#F107A3)', borderRadius: 40, padding: '20px 34px', fontFamily: SANS, fontWeight: 700, fontSize: 38, color: '#fff', transform: `scale(${Math.min(1.05, dm)})`, transformOrigin: '0 50%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            <Ico name="send" size={34} color="#fff" />
            New message · all the details
          </div>
        </div>
      )}
    </div>
  );
};

const FollowCard: React.FC<{t: number}> = ({t}) => {
  const a = W(142) - 0.1;
  if (t < a || t > edit.speech) return null;
  const p = sp(t, a, 260, 20);
  const press = pt(t, W(148) + 0.15, W(148) + 0.3);
  const done = t > W(148) + 0.3;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 250, display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(14,14,16,0.88)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 40, padding: '26px 30px', backdropFilter: 'blur(16px)', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * -70}px)`}}>
      <div style={{width: 110, height: 110, borderRadius: 110, background: '#000', display: 'grid', placeItems: 'center', border: `2px solid ${C.lime}`}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 84, height: 62, objectFit: 'contain'}} />
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: '#fff'}}>Neuraxine</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: 'rgba(255,255,255,0.6)'}}>more AI content</div>
      </div>
      <div style={{padding: '18px 32px', borderRadius: 999, background: done ? 'rgba(255,255,255,0.12)' : C.lime, color: done ? '#fff' : C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 34, transform: `scale(${1 - 0.12 * Math.sin(press * Math.PI)})`}}>
        {done ? 'Following' : 'Follow'}
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.15) return null;
  const r = t - a;
  const k = pt(t, a - 0.15, a + 0.1);
  const logo = sp(t, a + 0.05, 160, 15);
  return (
    <AbsoluteFill style={{background: C.bg, opacity: k}}>
      <Dots t={t} />
      <div style={{position: 'absolute', left: 340, top: 470, width: 400, height: 300, transform: `scale(${lerp(0.7, 1, Math.min(1, logo))})`, opacity: Math.min(1, logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: `${lerp(0.6, 0.32, pt(r, 0.2, 1.0, ease.out))}em`, paddingLeft: '0.32em', color: '#fff', opacity: pt(r, 0.2, 0.6)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 990, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: 'rgba(255,255,255,0.8)', opacity: pt(r, 0.5, 0.9)}}>comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1100, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.7, 1.0), transform: `scale(${lerp(0.85, 1, pt(r, 0.7, 1.1, ease.out))})`}}>
        <div style={{background: C.lime, color: C.ink, borderRadius: 22, padding: '14px 54px', fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '-0.04em'}}>SEO</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 36, color: 'rgba(255,255,255,0.55)', opacity: pt(r, 1.0, 1.4)}}>and build your own AI SEO team</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const S = s ? SCENES[s.id] : null;
  // whip in: slide + skew + motion blur, 0.2 s
  const e = s ? pt(t, s.a, s.a + 0.2, ease.out) : 1;
  const prevIsScene = s ? FF.some((g) => Math.abs(g.b - s.a) < 0.02) : false;
  // whip out to the face: quick scale-through + fade
  const x = s ? pt(t, s.b - 0.1, s.b, ease.in) : 0;
  const toFace = s ? !FF.some((g) => Math.abs(g.a - s.b) < 0.02) : false;
  const flash = FF.reduce((m, f) => Math.max(m, 1 - Math.min(1, Math.abs(t - f.a) / 0.05)), 0) + RETURNS.reduce((m, r) => Math.max(m, 1 - Math.min(1, Math.abs(t - r) / 0.05)), 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>
        <Speaker t={t} />
        <Grade />
      </AbsoluteFill>
      {!s && t < edit.speech && (
        <>
          <AgentChip t={t} />
          <TeamRow t={t} />
          <CommentCard t={t} />
          <FollowCard t={t} />
          <Captions t={t} />
        </>
      )}
      {prevIsScene && s && (() => {
        const prev = FF.find((g) => Math.abs(g.b - s.a) < 0.02)!;
        const P = SCENES[prev.id];
        return (
          <AbsoluteFill style={{transform: `translateX(${-e * 0.35 * 1080 * s.dir}px)`, opacity: 1 - e * 0.6}}>
            <P t={t} a={prev.a} b={prev.b} />
          </AbsoluteFill>
        );
      })()}
      {S && s && (
        <AbsoluteFill
          style={{
            transform: `translateX(${(1 - e) * 1080 * s.dir}px) skewX(${(1 - e) * -10 * s.dir}deg) scale(${toFace ? 1 + x * 0.25 : 1})`,
            filter: e < 1 ? `blur(${(1 - e) * 24}px)` : x > 0 && toFace ? `blur(${x * 16}px)` : undefined,
            opacity: toFace ? 1 - x : 1,
          }}
        >
          <S t={t} a={s.a} b={s.b} />
          <Captions t={t} small />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: Math.min(1, flash) * 0.35, pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} o={0.07} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
    </AbsoluteFill>
  );
};
