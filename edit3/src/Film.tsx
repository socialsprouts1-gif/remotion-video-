import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// ---------------------------------------------------------------- tokens
const C = {black: '#0A0A0A', paper: '#F1EFE9', ink: '#121212', grey: '#9A968C', blue: '#2B35F0', blueLight: '#7C8BFF', red: '#E5322D', lime: '#B6F23A'};
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
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; take: number; i: number; k: boolean};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 220, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.8}}));
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z'-]/g, '');

// ---------------------------------------------------------------- full-frame editorial scenes (word-timed)
const FF = [
  {id: 'agents', a: W(18) - 0.12, b: W(25) - 0.08},
  {id: 'list', a: W(28) - 0.1, b: W(44) - 0.08},
  {id: 'connect', a: W(50) - 0.1, b: W(58) - 0.08},
  {id: 'content', a: W(70) - 0.1, b: W(74) - 0.06},
  {id: 'workflow', a: W(74) - 0.06, b: W(81) - 0.08},
];
const sceneAt = (t: number) => FF.find((f) => t >= f.a && t < f.b);

// ---------------------------------------------------------------- the speaker
const Speaker: React.FC<{t: number; pip?: boolean}> = ({t, pip}) => {
  const cur = WORDS.reduce((n, w) => (t >= w.s - 0.05 ? w : n), WORDS[0]);
  const base = cur.take % 2 ? 1.14 : 1.02;
  const punch = [W(16), W(61), W(90)].reduce((s, p) => s + 0.08 * pt(t, p - 0.04, p + 0.18, ease.out) * (cur.take === WORDS.find((w) => w.s === p)!.take ? 1 : 0), 0);
  const intro = 0.16 * (1 - pt(t, 0, 0.6, ease.out));
  const z = pip ? 1.05 : base + punch + intro + 0.02 * Math.sin(t * 0.35);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 32%'}}>
      {(edit.pieces as {src: string; at: number; in: number; out: number; dur: number}[]).map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round(c.dur * FPS)}>
          <OffthreadVideo src={staticFile(c.src)} startFrom={c.in} endAt={c.out} muted={pip} style={{width: '100%', height: '100%', objectFit: 'cover', filter: pip ? 'grayscale(1) contrast(1.15) brightness(0.95)' : 'contrast(1.18) saturate(0.7) brightness(0.8)'}} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Moody spotlight: the room falls away, the face stays lit. Opens up on "begins". */
const Spotlight: React.FC<{t: number}> = ({t}) => {
  const open = pt(t, W(65) - 0.05, W(65) + 0.6, ease.out) * (1 - pt(t, W(66) - 0.4, W(66), ease.inOut));
  const r0 = 18 + open * 18;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 62% 44% at 50% 30%, transparent ${r0}%, rgba(0,0,0,0.55) ${r0 + 28}%, rgba(0,0,0,0.92) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,14,30,0.35), rgba(30,22,14,0.2) 50%, rgba(0,0,0,0.75))', mixBlendMode: 'multiply'}} />
    </>
  );
};

// ---------------------------------------------------------------- captions (editorial: words build, two faces)
const SERIF_W = new Set(['imagine', 'own', 'impossible', 'possible', 'agents', 'power', 'begins', 'intelligent', 'workflow', 'guide', 'details', 'processes', 'connect', 'neuraxine']);
const RED_W = new Set(['impossible', 'instructions']);
const BLUE_W = new Set(['possible', 'automation', 'neuraxine', 'power']);
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const serifBreak = SERIF_W.has(key(w.w)) && cur.length > 1;
    if (/[.,?!]["”]?$/.test(w.w) || cur.length >= 3 || serifBreak || !nx || nx.take !== w.take) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.45)));
  return out;
})();

const Captions: React.FC<{t: number; y?: number; dark?: boolean}> = ({t, y = 1180, dark}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 22}}>
      {c.words.map((w, i) => {
        if (t < w.s - 0.02) return null;
        const k = key(w.w);
        const serif = SERIF_W.has(k);
        const p = pt(t, w.s - 0.02, w.s + 0.14, ease.out);
        const color = RED_W.has(k) ? C.red : BLUE_W.has(k) ? (dark ? C.blue : C.blueLight) : dark ? C.ink : '#fff';
        return (
          <span
            key={i}
            style={{
              fontFamily: serif ? SERIF : SANS,
              fontStyle: serif ? 'italic' : 'normal',
              fontWeight: serif ? 400 : 750,
              fontSize: serif ? 138 : 74,
              letterSpacing: serif ? '-0.01em' : '-0.03em',
              lineHeight: 1.0,
              color,
              display: 'inline-block',
              transform: `scale(${lerp(1.18, 1, p)})`,
              filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
              opacity: p,
              textShadow: dark ? 'none' : '0 6px 30px rgba(0,0,0,0.75)',
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
const Grain: React.FC<{frame: number; o?: number}> = ({frame, o = 0.09}) => (
  <AbsoluteFill style={{opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

const Folio: React.FC<{left: string; right: string; dark?: boolean}> = ({left, right, dark}) => (
  <div style={{position: 'absolute', left: 72, right: 72, top: 150, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.24em', color: dark ? 'rgba(18,18,18,0.55)' : 'rgba(255,255,255,0.65)'}}>
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

/** Voice waveform drawn from the real audio envelope. */
const Wave: React.FC<{t: number; y: number; color: string; x0?: number; x1?: number}> = ({t, y, color, x0 = 90, x1 = 990}) => {
  const f = Math.floor(t * FPS);
  const n = 70;
  const env = edit.env as number[];
  return (
    <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: y - 100}}>
      {Array.from({length: n}, (_, i) => {
        const v = env[Math.max(0, f - (n - 1 - i))] ?? 0;
        const h = 6 + v * 150 * (0.6 + 0.4 * Math.sin(i * 1.7) ** 2);
        const x = lerp(x0, x1, i / (n - 1));
        return <rect key={i} x={x - 3} y={100 - h / 2} width={6} height={h} rx={3} fill={color} opacity={0.35 + 0.65 * (i / n)} />;
      })}
    </svg>
  );
};

/** Grayscale webcam card of the speaker (the reference's floating PiP). */
const WebcamCard: React.FC<{t: number; at: number; x: number; y: number; w: number; label: string; rot?: number}> = ({t, at, x, y, w, label, rot = 3}) => {
  const p = sp(t, at, 200, 18);
  const h = w * 1.3;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${Math.min(1, p)})`, opacity: Math.min(1, p * 2)}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: C.ink, marginBottom: 8, textAlign: 'center'}}>{label}</div>
      <div style={{position: 'relative', width: w, height: h, borderRadius: 26, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.35)', background: '#000'}}>
        <div style={{position: 'absolute', left: w / 2 - 1080 * 0.36 * 0.5, top: h * 0.42 - 1920 * 0.36 * 0.3, width: 1080 * 0.36, height: 1920 * 0.36}}>
          <div style={{width: 1080, height: 1920, transform: 'scale(0.36)', transformOrigin: '0 0'}}>
            <Speaker t={t} pip />
          </div>
        </div>
      </div>
    </div>
  );
};

const Tile: React.FC<{c: number; r: number; w: number; gray?: boolean}> = ({c, r, w, gray = true}) => {
  const [sx, sy, sw, sh] = [92 + c * 307, 430 + r * 211, 283, 188];
  const k = w / sw;
  return (
    <div style={{position: 'relative', width: w, height: sh * k, overflow: 'hidden', borderRadius: 22, filter: gray ? 'grayscale(1) contrast(1.1)' : undefined, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
      <Img src={staticFile('shots/integrations-home.png')} style={{position: 'absolute', left: -sx * k, top: -sy * k, width: 2000 * k, height: 1131 * k}} />
    </div>
  );
};

// ---------------------------------------------------------------- scenes
const Agents: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const strike = pt(t, W(22) - 0.05, W(22) + 0.25, ease.inOut);
  const drop = pt(t, W(24) - 0.15, W(24) + 0.25, ease.in);
  const im = 'im';
  return (
    <AbsoluteFill style={{background: C.blue}}>
      <Folio left="NEURAXINE" right="no. 1" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 250, color: '#fff', lineHeight: 0.95}}>
        {['AI', 'agents'].map((w, i) => {
          const p = pt(t, W(19 + i) - 0.03, W(19 + i) + 0.18, ease.out);
          return (
            <span key={w} style={{display: 'inline-block', marginRight: i ? 0 : 40, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 46, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em', opacity: pt(t, W(21) - 0.03, W(21) + 0.15)}}>are making this</div>
      {/* impossible → possible */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, color: '#fff', lineHeight: 1}}>
        <span style={{position: 'relative', display: 'inline-block', color: C.red, opacity: 1 - drop, transform: `translateY(${drop * 260}px) rotate(${drop * -14}deg)`, width: lerp(108, 0, drop), overflow: "visible"}}>
          {im}
          <span style={{position: 'absolute', left: -8, top: '54%', height: 10, width: `${strike * 120}%`, background: C.red}} />
        </span>
        <span style={{display: 'inline-block'}}>possible.</span>
      </div>
      <div style={{position: 'absolute', left: 340, right: 340, top: 1215, height: 6, background: '#fff', transformOrigin: '0 50%', transform: `scaleX(${pt(t, W(24), W(24) + 0.4, ease.out)})`}} />
    </AbsoluteFill>
  );
};

const LIST = [
  {i: 28, n: '1.', text: 'Understands queries'},
  {i: 31, n: '2.', text: 'Answers questions'},
  {i: 33, n: '3.', text: 'Qualifies leads'},
  {i: 38, n: '4.', text: 'Schedules meetings'},
];
const ListPage: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const cur = LIST.reduce((n, it, k) => (t >= W(it.i) - 0.05 ? k : n), 0);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Folio left="AN AI AGENT" right="no. 2" dark />
      <div style={{position: 'absolute', left: 80, top: 260, fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.ink, lineHeight: 1, opacity: pt(t, a, a + 0.2)}}>
        What it <span style={{color: C.blue}}>does.</span>
      </div>
      {LIST.map((it, k) => {
        const p = pt(t, W(it.i) - 0.05, W(it.i) + 0.2, ease.out);
        if (p <= 0) return null;
        const active = k === cur;
        return (
          <div key={k} style={{position: 'absolute', left: 80, right: 60, top: 470 + k * 150, display: 'flex', alignItems: 'baseline', gap: 26, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
            <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: active ? C.red : C.grey, width: 70}}>{it.n}</span>
            <span style={{fontFamily: SERIF, fontSize: 92, color: active ? C.ink : C.grey, letterSpacing: '-0.01em'}}>{it.text}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 176, top: 470 + 3 * 150 + 110, fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.grey, opacity: pt(t, W(40) - 0.05, W(40) + 0.2)}}>
        …automatically, with your sales team.
      </div>
      <WebcamCard t={t} at={a + 0.2} x={640} y={1150} w={330} label="live" rot={4} />
      <Wave t={t} y={1360} color={C.blue} x0={90} x1={560} />
    </AbsoluteFill>
  );
};

const Connect: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const cx = 540, cy = 860, R = 340;
  const tiles = [[0, 0], [5, 0], [4, 1], [5, 1], [1, 2]] as const;
  const names = ['WhatsApp', 'Shopify', 'Sheets', 'HubSpot', 'Calendly'];
  const core = sp(t, a + 0.05, 180, 15);
  return (
    <AbsoluteFill style={{background: C.black}}>
      <Folio left="BUSINESS PROCESSES" right="no. 3" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {tiles.map((_, i) => {
          const ang = -Math.PI / 2 + (i / tiles.length) * Math.PI * 2;
          const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
          const d = pt(t, a + 0.15 + i * 0.12, a + 0.5 + i * 0.12, ease.inOut);
          const pulse = ((t - a) * 1.4 + i * 0.2) % 1;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={lerp(cx, x, d)} y2={lerp(cy, y, d)} stroke="rgba(255,255,255,0.55)" strokeWidth={2.5} strokeDasharray="6 8" />
              {t > W(55) && <circle cx={lerp(cx, x, pulse)} cy={lerp(cy, y, pulse)} r={7} fill="#fff" />}
            </g>
          );
        })}
      </svg>
      {tiles.map(([c, r], i) => {
        const ang = -Math.PI / 2 + (i / tiles.length) * Math.PI * 2;
        const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
        const p = sp(t, a + 0.35 + i * 0.12, 220, 16);
        const w = 210;
        return (
          <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - 70, transform: `scale(${p})`}}>
            <Tile c={c} r={r} w={w} />
            <div style={{textAlign: 'center', marginTop: 8, fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)'}}>{names[i].toUpperCase()}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 130, top: cy - 130, width: 260, height: 260, borderRadius: 260, border: '2px solid #fff', background: '#111', display: 'grid', placeItems: 'center', transform: `scale(${core})`, boxShadow: '0 0 80px rgba(255,255,255,0.15)'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 74, color: '#fff', lineHeight: 0.9, textAlign: 'center'}}>
          AI
          <br />
          agent
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Content: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const strike = pt(t, W(73) - 0.02, W(73) + 0.3, ease.inOut);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Folio left="NOT JUST" right="no. 4" dark />
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 52, color: C.grey, opacity: pt(t, W(70) - 0.05, W(70) + 0.15)}}>generating</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontSize: 280, color: C.ink, lineHeight: 1, opacity: pt(t, W(71) - 0.05, W(71) + 0.15), transform: `scale(${lerp(1.08, 1, pt(t, W(71) - 0.05, W(71) + 0.4, ease.out))})`}}>
          content
          <div style={{position: 'absolute', left: -20, right: -20, top: '58%', height: 14, background: C.red, transformOrigin: '0 50%', transform: `scaleX(${strike}) rotate(-3deg)`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 52, color: C.grey, opacity: pt(t, W(72) - 0.05, W(72) + 0.15)}}>with AI</div>
      <Wave t={t} y={1360} color={C.ink} />
    </AbsoluteFill>
  );
};

const Workflow: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  const nodes = ['Lead', 'AI agent', 'CRM', 'Meeting'];
  const smart = pt(t, W(80) - 0.05, W(80) + 0.35, ease.out);
  const intro = pt(t, a, a + 0.18, ease.out);
  return (
    <AbsoluteFill style={{background: C.blue, transform: `translateX(${(1 - intro) * 300}px)`, filter: intro < 1 ? `blur(${(1 - intro) * 20}px)` : undefined}}>
      <Folio left="BUT ABOUT" right="no. 5" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 48, color: 'rgba(255,255,255,0.75)'}}>
        {['making', 'your', 'entire'].map((w, i) => (
          <span key={w} style={{opacity: pt(t, W(76 + i) - 0.03, W(76 + i) + 0.12), marginRight: 16}}>{w}</span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 250, color: '#fff', lineHeight: 1, opacity: pt(t, W(79) - 0.05, W(79) + 0.15), transform: `scale(${lerp(1.1, 1, pt(t, W(79) - 0.05, W(79) + 0.4, ease.out))})`}}>workflow</div>
      {/* the workflow: four steps, a pulse running through, filling white when it turns intelligent */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        {nodes.map((n, i) => {
          const p = sp(t, a + 0.15 + i * 0.1, 220, 16);
          const lit = smart > 0 && smart * 4 > i;
          return (
            <React.Fragment key={n}>
              {i > 0 && <div style={{flex: 1, height: 3, margin: '0 10px', background: 'rgba(255,255,255,0.5)', position: 'relative'}}>
                <div style={{position: 'absolute', top: -6, left: `${(((t - a) * 1.6 + i * 0.3) % 1) * 100}%`, width: 14, height: 14, borderRadius: 14, background: '#fff'}} />
              </div>}
              <div style={{padding: '22px 22px', borderRadius: 22, border: '2.5px solid #fff', background: lit ? '#fff' : 'transparent', color: lit ? C.blue : '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 30, transform: `scale(${p})`, whiteSpace: 'nowrap'}}>{n}</div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: '#fff', opacity: smart, filter: smart < 1 ? `blur(${(1 - smart) * 14}px)` : undefined}}>intelligent.</div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{t: number; a: number; b: number}>> = {agents: Agents, list: ListPage, connect: Connect, content: Content, workflow: Workflow};

// ---------------------------------------------------------------- call to action
const CommentCard: React.FC<{t: number}> = ({t}) => {
  const a = W(89) - 0.1;
  if (t < a || t > W(98) - 0.1) return null;
  const p = sp(t, a, 210, 18);
  const typed = 'AUTOMATION'.slice(0, Math.max(0, Math.min(10, Math.floor((t - W(90)) / 0.045))));
  const dm = sp(t, W(93) - 0.05, 230, 16);
  const out = pt(t, W(98) - 0.35, W(98) - 0.1, ease.in);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 250, opacity: Math.min(1, p * 2) * (1 - out), transform: `translateY(${(1 - Math.min(1, p)) * -60 - out * 40}px) rotate(-2deg)`}}>
      <div style={{background: C.paper, borderRadius: 34, padding: '30px 36px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: C.ink}}>comment</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 10}}>
          <div style={{flex: 1, fontFamily: SANS, fontWeight: 850, fontSize: 92, color: C.blue, letterSpacing: '-0.03em'}}>
            {typed}
            <span style={{opacity: Math.sin(t * 14) > 0 && typed.length < 10 ? 1 : 0}}>|</span>
          </div>
          <div style={{width: 92, height: 92, borderRadius: 92, background: C.blue, display: 'grid', placeItems: 'center'}}>
            <svg width={44} height={44} viewBox="0 0 24 24"><path d="M3 12 L21 3 L14 21 L11 13 Z" fill="#fff" /></svg>
          </div>
        </div>
      </div>
      {dm > 0 && (
        <div style={{marginTop: 22, display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 999, padding: '16px 32px', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.ink, transform: `scale(${dm})`, transformOrigin: '100% 50%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            <svg width={34} height={34} viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={C.blue} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
            Full guide in your DMs
          </div>
        </div>
      )}
    </div>
  );
};

const FollowCard: React.FC<{t: number}> = ({t}) => {
  const a = W(101) - 0.1;
  if (t < a || t > edit.speech) return null;
  const p = sp(t, a, 210, 18);
  const press = pt(t, W(104) + 0.25, W(104) + 0.4);
  const done = t > W(104) + 0.4;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 270, display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(14,14,14,0.85)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 40, padding: '26px 30px', backdropFilter: 'blur(16px)', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * -60}px)`}}>
      <div style={{width: 110, height: 110, borderRadius: 110, background: '#000', display: 'grid', placeItems: 'center', border: '2px solid rgba(255,255,255,0.2)'}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 84, height: 62, objectFit: 'contain'}} />
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff'}}>Neuraxine</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: 'rgba(255,255,255,0.6)'}}>AI-related content</div>
      </div>
      <div style={{padding: '18px 32px', borderRadius: 999, background: done ? 'rgba(255,255,255,0.12)' : C.blue, color: '#fff', fontFamily: SANS, fontWeight: 750, fontSize: 34, transform: `scale(${1 - 0.12 * Math.sin(press * Math.PI)})`}}>
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
    <AbsoluteFill style={{background: C.black, opacity: k}}>
      <div style={{position: 'absolute', left: 340, top: 500, width: 400, height: 300, transform: `scale(${lerp(0.7, 1, Math.min(1, logo))})`, opacity: Math.min(1, logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: `${lerp(0.6, 0.32, pt(r, 0.2, 1.0, ease.out))}em`, paddingLeft: '0.32em', color: '#fff', opacity: pt(r, 0.2, 0.6)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: 'rgba(255,255,255,0.8)', opacity: pt(r, 0.5, 0.9)}}>comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.7, 1.0), transform: `scale(${lerp(0.9, 1, pt(r, 0.7, 1.1, ease.out))})`}}>
        <div style={{background: C.blue, color: '#fff', borderRadius: 18, padding: '18px 42px', fontFamily: SANS, fontWeight: 850, fontSize: 84, letterSpacing: '-0.02em'}}>AUTOMATION</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 36, color: 'rgba(255,255,255,0.55)', opacity: pt(r, 1.0, 1.4)}}>for the full guide</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const S = s ? SCENES[s.id] : null;
  // a 3-frame scale settle on every cut into a page (editorial "snap")
  const snap = s ? 1 + 0.05 * (1 - pt(t, s.a, s.a + 0.15, ease.out)) : 1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>
        <Speaker t={t} />
        <Spotlight t={t} />
      </AbsoluteFill>
      {S && s && (
        <AbsoluteFill style={{transform: `scale(${snap})`}}>
          <S t={t} a={s.a} b={s.b} />
        </AbsoluteFill>
      )}
      {(!s || s.id === 'connect') && t < edit.speech && <Captions t={t} y={s?.id === 'connect' ? 1420 : 1180} />}
      {!s && <CommentCard t={t} />}
      {!s && <FollowCard t={t} />}
      <EndCard t={t} />
      <Grain frame={frame} o={s && (s.id === 'list' || s.id === 'content') ? 0.14 : 0.09} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
    </AbsoluteFill>
  );
};

export {rand};
