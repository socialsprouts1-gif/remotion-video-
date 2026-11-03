import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';
import edit from './edit.json';

// Neuraxine "automate", editorial cutaway style (after the neuraxine-ai-agents reference, with more motion):
// moody graded talking head, word-by-word captions with serif-italic key words, and full-screen editorial cards
// (electric blue / paper / black) with a mono "NEURAXINE · no. N" header, a live B/W picture-in-picture and a
// waveform driven by his real voice. Every element lands on the word that names it.
const C = {
  blue: '#2E3CF2',
  paper: '#F1EFEA',
  black: '#0E0E0F',
  ink: '#141414',
  red: '#E0393E',
  lav: '#9AA2FF',
  grey: '#9B9B98',
};
const SANS = 'Geist, InterV, sans-serif';
const MONO = '"Geist Mono", monospace';
const SERIF = '"Instrument Serif", serif';
const FPS = edit.fps;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'}),
    new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif.ttf')})`),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const ENV = edit.env as number[];
const CUE = edit.cues as Record<string, number>;
const CW = edit.cueWord as Record<string, number>;
const Q = (k: string) => CUE[k];
const QE = (k: string) => WORDS[CW[k]].e;
const W = (i: number) => WORDS[i].s;
const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const sp = (t: number, at: number, stiffness = 120, damping = 18) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));
const m1 = (v: number) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------- structure: face shots and full-screen cards (hard cuts)
type Kind = 'face' | 'list' | 'whatif' | 'hub' | 'gain';
const SCENES: {a: number; b: number; kind: Kind; no?: number}[] = [
  {a: 0, b: W(18), kind: 'face'},
  {a: W(18), b: W(33) - 0.05, kind: 'list', no: 1},
  {a: W(33) - 0.05, b: W(49), kind: 'face'},
  {a: W(49), b: W(64), kind: 'whatif', no: 2},
  {a: W(64), b: W(75) - 0.05, kind: 'hub', no: 3},
  {a: W(75) - 0.05, b: W(89), kind: 'face'},
  {a: W(89), b: W(103) - 0.05, kind: 'gain', no: 4},
  {a: W(103) - 0.05, b: edit.duration, kind: 'face'},
];
const sceneAt = (t: number) => SCENES.find((s) => t >= s.a && t < s.b) ?? SCENES[SCENES.length - 1];

// ---------------------------------------------------------------- the talking head: moody grade, slow push on every shot
const Face: React.FC<{t: number}> = ({t}) => {
  const s = sceneAt(t);
  const p = s.kind === 'face' ? (t - s.a) / Math.max(1, s.b - s.a) : 0;
  const z = lerp(1.02, 1.09, inOut(m1(p)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 46%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.62) contrast(1.18) saturate(0.55) sepia(0.14)'}} />
      </AbsoluteFill>
      {/* spotlight on him, the room falls into shadow */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 46% 30% at 50% 44%, rgba(255,236,210,0.16), transparent 70%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 52% 36% at 50% 46%, transparent 30%, rgba(0,0,0,0.62) 78%, rgba(0,0,0,0.9) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 55%, rgba(0,0,0,0.75) 85%)'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- editorial card frame
const Header: React.FC<{left: string; no: number; color: string}> = ({left, no, color}) => (
  <div style={{position: 'absolute', left: 70, right: 70, top: 86, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 22, letterSpacing: '0.22em', color, opacity: 0.75}}>
    <span>{left}</span>
    <span>no. {no}</span>
  </div>
);
const Card: React.FC<{t: number; a: number; bg: string; children: React.ReactNode}> = ({t, a, bg, children}) => {
  const p = pt(t, a, a + 0.45, smooth);
  return (
    <AbsoluteFill style={{background: bg}}>
      {/* the content settles in after the hard cut: tiny scale + blur */}
      <AbsoluteFill style={{transform: `scale(${lerp(1.035, 1, p)})`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
/** Words that drift up out of a blur. */
const Blur: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; d?: number; y?: number}> = ({t, at, children, style, d = 0.55, y = 26}) => {
  const p = pt(t, at, at + d, smooth);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * y}px)`, filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined, ...style}}>{children}</div>;
};

// live picture-in-picture: B/W crop of him, tilted, with the waveform of what he is saying right now
const Live: React.FC<{t: number; a: number; x: number; y: number; rot: number; wave: string; flip?: boolean}> = ({t, a, x, y, rot, wave, flip}) => {
  const p = sp(t, a + 0.15, 110, 16);
  const f = Math.round(t * FPS);
  const bars = 34;
  const float = Math.sin(t * 1.3) * 6;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 480, opacity: m1(p * 1.4)}}>
      <svg width={1080} height={480} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: bars}, (_, k) => {
          const e = ENV[Math.max(0, f - Math.abs(k - bars / 2) * 0.6) | 0] ?? 0;
          const wob = 0.35 + 0.65 * Math.abs(Math.sin(k * 1.9 + t * 7));
          const h = 8 + e * 150 * wob * (1 - Math.abs(k - bars / 2) / (bars * 0.7));
          const bx = flip ? 520 + k * 14 : 70 + k * 14;
          return <rect key={k} x={bx} y={240 - h / 2} width={6} height={h} rx={3} fill={wave} opacity={0.95} />;
        })}
        <line x1={flip ? 520 : 70} y1={240} x2={flip ? 1010 : 560} y2={240} stroke={wave} strokeWidth={2} opacity={0.5} />
      </svg>
      <div style={{position: 'absolute', left: x, top: 40 + float, width: 330, transform: `rotate(${rot}deg) translateY(${(1 - m1(p)) * 80}px)`, transformOrigin: '50% 100%'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: wave, textAlign: 'right', marginBottom: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10}}>
          <span style={{width: 12, height: 12, borderRadius: 12, background: C.red, opacity: Math.sin(t * 6) > -0.2 ? 1 : 0.3}} />
          live
        </div>
        <div style={{width: 330, height: 400, background: '#fff', padding: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.28)'}}>
          <div style={{width: 310, height: 380, overflow: 'hidden', position: 'relative', background: '#222'}}>
            <OffthreadVideo
              muted
              src={staticFile('clips/main.mp4')}
              style={{position: 'absolute', width: 1080 * 0.62, height: 1920 * 0.62, left: 155 - 480 * 0.62, top: 190 - 930 * 0.62, maxWidth: 'none', filter: 'grayscale(1) contrast(1.15) brightness(1.05)'}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- no. 1: the manual day (paper)
const ITEMS: [number, string][] = [[20, 'Leads handle karna'], [25, 'WhatsApp replies'], [28, 'Follow-ups'], [30, 'Appointments manage']];
const ListCard: React.FC<{t: number; a: number}> = ({t, a}) => {
  const cur = ITEMS.reduce((n, [i], k) => (t >= W(i) - 0.08 ? k : n), -1);
  return (
    <Card t={t} a={a} bg={C.paper}>
      <Header left="THE MANUAL WAY" no={1} color={C.ink} />
      <div style={{position: 'absolute', left: 70, top: 170}}>
        <Blur t={t} at={a + 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 128, color: C.ink, lineHeight: 1}}>
          Roz ka <span style={{color: C.blue}}>kaam.</span>
        </Blur>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 380}}>
        {ITEMS.map(([i, label], k) => {
          const at = W(i) - 0.08;
          if (t < at) return null;
          const p = pt(t, at, at + 0.5, smooth);
          const active = k === cur;
          return (
            <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 26, height: 96, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined}}>
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: active ? C.red : C.grey, width: 48}}>{k + 1}.</span>
              <span style={{fontFamily: SERIF, fontSize: 70, color: active ? C.ink : C.grey, letterSpacing: '-0.01em'}}>{label}</span>
              {active && <span style={{flex: 1, height: 2, background: C.ink, opacity: 0.12, transformOrigin: '0 50%', transform: `scaleX(${pt(t, at + 0.2, at + 0.9, smooth)})`}} />}
            </div>
          );
        })}
        <Blur t={t} at={W(32) - 0.05} style={{fontFamily: SANS, fontSize: 32, color: C.grey, marginLeft: 74, marginTop: 4}}>
          …har din, haath se.
        </Blur>
      </div>
      <Live t={t} a={a} x={690} y={900} rot={4} wave={C.blue} />
    </Card>
  );
};

// ---------------------------------------------------------------- no. 2: but what if (electric blue)
const WhatIfCard: React.FC<{t: number; a: number}> = ({t, a}) => {
  const strike = pt(t, W(59) - 0.12, W(59) + 0.25, inOut);
  const drift = Math.sin(t * 0.9) * 6;
  return (
    <Card t={t} a={a} bg={C.blue}>
      <Header left="BUT WHAT IF" no={2} color="#fff" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff'}}>
        <Blur t={t} at={W(55) - 0.1} style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, opacity: 0.85}}>
          ye saare
        </Blur>
        <div style={{position: 'relative', marginTop: 10, transform: `translateX(${drift}px)`}}>
          <Blur t={t} at={W(57) - 0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, lineHeight: 1, color: strike > 0.6 ? 'rgba(255,255,255,0.55)' : '#fff'}}>
            repetitive tasks
          </Blur>
          <svg width={900} height={160} style={{position: 'absolute', left: -40, top: 0, overflow: 'visible'}}>
            <path d="M 10 92 C 240 70, 600 108, 890 78" fill="none" stroke={C.red} strokeWidth={9} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - strike)} />
          </svg>
        </div>
        <div style={{marginTop: 90, display: 'flex', alignItems: 'baseline', gap: 22}}>
          <Blur t={t} at={W(59) + 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 190, color: '#fff', lineHeight: 0.9}}>
            AI
          </Blur>
          <Blur t={t} at={W(60) - 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: '#fff', lineHeight: 0.9}}>
            handles it.
          </Blur>
        </div>
        <div style={{width: 260, height: 3, background: '#fff', marginTop: 30, transformOrigin: '50% 50%', transform: `scaleX(${pt(t, W(61), W(63), smooth)})`, opacity: 0.8}} />
      </div>
      {/* "what if" question mark that slowly turns while he asks */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: '#fff', opacity: 0.16 * pt(t, a, a + 0.6), transform: `rotate(${Math.sin(t * 0.8) * 8}deg)`}}>?</div>
    </Card>
  );
};

// ---------------------------------------------------------------- no. 3: what we build (black): an AI agent hub, then a chain
const APPS: {icon: string; label: string; ang: number}[] = [
  {icon: 'whatsapp-icon.svg', label: 'WHATSAPP', ang: -90},
  {icon: 'google-calendar.svg', label: 'CALENDAR', ang: -18},
  {icon: 'google-gmail.svg', label: 'GMAIL', ang: 54},
  {icon: 'instagram-icon.svg', label: 'INSTAGRAM', ang: 126},
  {icon: 'shopify.svg', label: 'SHOPIFY', ang: 198},
];
const CHAIN = ['Lead', 'AI agent', 'CRM', 'Meeting'];
const HubCard: React.FC<{t: number; a: number}> = ({t, a}) => {
  const cx = 540, cy = 700, R = 300;
  const hub = sp(t, W(66) - 0.1, 90, 14);
  const n0 = W(68) - 0.1;
  const breathe = 1 + 0.02 * Math.sin(t * 2.2);
  return (
    <Card t={t} a={a} bg={C.black}>
      <Header left="WHAT WE BUILD" no={3} color="#fff" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {APPS.map((ap, k) => {
          const at = n0 + k * 0.14;
          const p = pt(t, at, at + 0.45, smooth);
          const r = (ap.ang * Math.PI) / 180;
          const x2 = cx + Math.cos(r) * R, y2 = cy + Math.sin(r) * R;
          const ex = lerp(cx + Math.cos(r) * 100, x2, p), ey = lerp(cy + Math.sin(r) * 100, y2, p);
          const u = ((t - at) * 0.7 + k * 0.23) % 1;
          return (
            <g key={k}>
              <line x1={cx + Math.cos(r) * 100} y1={cy + Math.sin(r) * 100} x2={ex} y2={ey} stroke="#fff" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" />
              {p >= 1 && <circle cx={lerp(cx + Math.cos(r) * 100, x2, u)} cy={lerp(cy + Math.sin(r) * 100, y2, u)} r={6} fill={C.lav} opacity={Math.sin(u * Math.PI)} />}
            </g>
          );
        })}
        {/* outer orbit ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeOpacity={0.06 * pt(t, n0, n0 + 1)} strokeWidth={1.5} />
      </svg>
      <div style={{position: 'absolute', left: cx - 100, top: cy - 100, width: 200, height: 200, borderRadius: 200, border: '2px solid rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: `scale(${lerp(0.3, 1, m1(hub)) * breathe})`, opacity: m1(hub * 2), boxShadow: '0 0 0 14px rgba(255,255,255,0.03)'}}>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: '#fff', lineHeight: 0.95}}>
          AI
          <br />
          agent
        </span>
      </div>
      {APPS.map((ap, k) => {
        const at = n0 + k * 0.14 + 0.2;
        const p = sp(t, at, 160, 15);
        const r = (ap.ang * Math.PI) / 180;
        const x = cx + Math.cos(r) * R, y = cy + Math.sin(r) * R;
        return (
          <div key={k} style={{position: 'absolute', left: x - 70, top: y - 56, width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m1(p * 1.5), transform: `scale(${lerp(0.6, 1, m1(p))}) translateY(${Math.sin(t * 1.6 + k) * 4}px)`}}>
            <div style={{width: 112, height: 92, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(0,0,0,0.4)'}}>
              <Img src={staticFile(`icons/${ap.icon}`)} style={{width: 50, height: 50, objectFit: 'contain'}} />
            </div>
            <span style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)', marginTop: 10}}>{ap.label}</span>
          </div>
        );
      })}
      {/* custom chain, drawn link by link on "custom AI-powered systems" */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Blur t={t} at={W(72) - 0.08} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: '#fff'}}>
          built <span style={{color: C.lav}}>for you.</span>
        </Blur>
        <div style={{display: 'flex', alignItems: 'center', marginTop: 34}}>
          {CHAIN.map((c, k) => {
            const at = W(73) + k * 0.22;
            const p = pt(t, at, at + 0.35, smooth);
            return (
              <React.Fragment key={c}>
                {k > 0 && <div style={{width: 60, height: 2, background: 'rgba(255,255,255,0.5)', transformOrigin: '0 50%', transform: `scaleX(${pt(t, at - 0.15, at + 0.05)})`}} />}
                <div style={{padding: '14px 26px', borderRadius: 999, border: `1.5px solid ${k === 1 ? C.lav : 'rgba(255,255,255,0.7)'}`, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: k === 1 ? C.lav : '#fff', opacity: p, transform: `scale(${lerp(0.8, 1, p)})`}}>{c}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- no. 4: what you get (paper) with the growth line finally rising
const GAINS: [number, string, string][] = [[92, 'Save', 'time.'], [94, 'Less', 'manual work.'], [99, 'Scale', 'smarter.']];
const GainCard: React.FC<{t: number; a: number}> = ({t, a}) => {
  const cur = GAINS.reduce((n, [i], k) => (t >= W(i) - 0.08 ? k : n), -1);
  const g = pt(t, W(99) - 0.1, W(102) + 0.3, inOut);
  const pts = Array.from({length: 40}, (_, k) => {
    const u = k / 39;
    return [70 + u * 940, 1560 - (Math.pow(u, 1.8) * 300 + Math.sin(u * 14) * 14 * (1 - u))];
  });
  const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return (
    <Card t={t} a={a} bg={C.paper}>
      <Header left="WHAT YOU GET" no={4} color={C.ink} />
      <div style={{position: 'absolute', left: 70, top: 190}}>
        <Blur t={t} at={a + 0.05} style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.grey}}>
          We help businesses
        </Blur>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 280}}>
        {GAINS.map(([i, a1, b1], k) => {
          const at = W(i) - 0.08;
          if (t < at) return null;
          const p = pt(t, at, at + 0.55, smooth);
          const active = k === cur;
          return (
            <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 24, height: 168, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined}}>
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, color: active ? C.red : C.grey, width: 54}}>{k + 1}.</span>
              <span style={{fontFamily: SERIF, fontSize: 132, lineHeight: 1, color: active ? C.ink : '#B9B7B1', letterSpacing: '-0.02em'}}>
                {a1} <em style={{color: active ? C.blue : '#B9B7B1'}}>{b1}</em>
              </span>
            </div>
          );
        })}
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={d} fill="none" stroke={C.blue} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1300} strokeDashoffset={1300 * (1 - g)} />
        {g > 0.98 && <circle cx={pts[39][0]} cy={pts[39][1]} r={10 + 4 * Math.sin(t * 6)} fill={C.blue} />}
        <line x1={70} y1={1580} x2={1010} y2={1580} stroke={C.ink} strokeOpacity={0.15} strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: 70, top: 1600, fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: C.grey, opacity: g}}>GROWTH, WITH AI</div>
    </Card>
  );
};

// ---------------------------------------------------------------- overlays on the face: brand chip, comment card, follow bar
const BrandChip: React.FC<{t: number}> = ({t}) => {
  const a = W(88) - 0.1, b = W(89);
  if (t < a || t >= b) return null;
  const p = pt(t, a, a + 0.5, smooth);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * 20}px)`}}>
      <Img src={staticFile('brand/logo-alpha.png')} style={{width: 150, height: 110, objectFit: 'contain'}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: '0.42em', color: '#fff', marginTop: 16, marginLeft: '0.42em'}}>NEURAXINE</div>
    </div>
  );
};
const TYPED = 'AUTOMATE';
const CommentCard: React.FC<{t: number}> = ({t}) => {
  const a = W(113) - 0.3, b = W(123) - 0.05;
  if (t < a || t >= b) return null;
  const p = sp(t, a, 120, 16);
  const out = pt(t, b - 0.3, b, Easing.in(Easing.cubic));
  const ty = Q('automate'), tyE = QE('automate');
  const n = Math.max(0, Math.min(TYPED.length, Math.ceil(((t - ty) / Math.max(0.35, tyE - ty)) * TYPED.length)));
  const sent = t >= tyE + 0.1;
  const dm = pt(t, W(120) - 0.1, W(120) + 0.35, smooth);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 250, opacity: m1(p * 1.5) * (1 - out), transform: `translateY(${(1 - m1(p)) * -60 + Math.sin(t * 1.4) * 4}px) rotate(-2deg)`}}>
      <div style={{background: '#F6F5F2', borderRadius: 26, padding: '26px 30px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center'}}>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, color: '#8C8A85'}}>comment</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 86, color: C.blue, letterSpacing: '-0.02em', lineHeight: 1, minHeight: 86, display: 'flex', alignItems: 'center'}}>
            {TYPED.slice(0, n)}
            {!sent && <span style={{width: 4, height: 70, marginLeft: 6, background: C.blue, opacity: Math.sin(t * 13) > 0 ? 1 : 0}} />}
          </div>
        </div>
        <div style={{width: 88, height: 88, borderRadius: 88, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sent ? lerp(0.85, 1, pt(t, tyE + 0.1, tyE + 0.3)) : 1})`}}>
          <svg width={40} height={40} viewBox="0 0 24 24">
            <path d="M3 20.5l18-8.5L3 3.5l.1 6.6L15 12 3.1 13.9z" fill="#fff" />
          </svg>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: -14, marginRight: 20, opacity: dm, transform: `translateY(${(1 - dm) * 20}px) rotate(3deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 999, padding: '12px 22px', boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={11} fill={C.blue} />
            <path d="M7 12.4l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink}}>Full guide in your DMs</span>
        </div>
      </div>
    </div>
  );
};
const FollowBar: React.FC<{t: number}> = ({t}) => {
  const a = W(123) - 0.05, b = edit.speech + 0.05;
  if (t < a || t >= b) return null;
  const p = sp(t, a, 120, 17);
  const tap = Q('follow') + 0.05;
  const followed = t >= tap + 0.18;
  const press = pt(t, tap, tap + 0.1) * (1 - pt(t, tap + 0.1, tap + 0.25));
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 260, opacity: m1(p * 1.5), transform: `translateY(${(1 - m1(p)) * -50}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 24px', borderRadius: 24, background: 'rgba(18,18,20,0.82)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)'}}>
        <div style={{width: 96, height: 96, borderRadius: 96, background: '#0B0B0C', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: 66, height: 48, objectFit: 'contain'}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: '#fff'}}>Neuraxine</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: '#A3A3A0'}}>AI automation, simplified</div>
        </div>
        <div style={{width: 200, height: 74, borderRadius: 16, background: followed ? 'rgba(255,255,255,0.12)' : C.blue, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.08})`}}>
          {followed ? 'Following' : 'Follow'}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- captions: phrase builds word by word; key words go big serif italic
const KEY: Record<string, string> = {
  '2026': '#fff', manually: C.red, time: '#fff', waste: C.red, socho: '#fff', growth: C.lav, focus: '#fff', nahi: C.red,
  repetitive: '#fff', ai: C.lav, agents: '#fff', workflow: '#fff', custom: C.lav, needs: '#fff', neuraxine: C.lav,
  save: '#fff', smart: C.lav, automate: '#fff', guide: '#fff', follow: '#fff',
};
const keyOf = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    const sceneBreak = nx && sceneAt(nx.s).a !== sceneAt(w.s).a;
    if (/[.,?!]["”]?$/.test(w.w) || chars + (nx ? nx.w.length : 0) > 19 || !nx || nx.s - w.e > 0.3 || sceneBreak) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  const c = LINES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const sc = sceneAt(t);
  const onPaper = sc.kind === 'list' || sc.kind === 'gain';
  const base = onPaper ? C.ink : '#fff';
  const top = sc.kind === 'face' ? 1240 : 1700;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 16}}>
      {c.words.map((w, i) => {
        if (t < w.s - 0.05) return null;
        const p = pt(t, w.s - 0.05, w.s + 0.16, smooth);
        const k = keyOf(w.w);
        const key = k in KEY && sc.kind === 'face';
        const col = key ? (onPaper && KEY[k] === '#fff' ? C.ink : KEY[k]) : base;
        return (
          <span
            key={i}
            style={{
              fontFamily: key ? SERIF : SANS,
              fontStyle: key ? 'italic' : 'normal',
              fontWeight: key ? 400 : 600,
              fontSize: key ? 108 : sc.kind === 'face' ? 56 : 46,
              letterSpacing: key ? '-0.01em' : '-0.02em',
              lineHeight: 1.05,
              color: col,
              opacity: p * (sc.kind === 'face' ? 1 : 0.85),
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              transform: `translateY(${(1 - p) * 10}px)`,
              textShadow: onPaper ? 'none' : '0 2px 14px rgba(0,0,0,0.5)',
            }}
          >
            {w.w.replace(/["“”]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a) return null;
  const r = t - a;
  return (
    <AbsoluteFill style={{background: '#0B0B0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Blur t={r} at={0} d={0.7}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 260, height: 190, objectFit: 'contain'}} />
      </Blur>
      <Blur t={r} at={0.15} d={0.7} style={{fontFamily: SANS, fontWeight: 600, fontSize: 48, letterSpacing: '0.42em', color: '#fff', marginTop: 40, marginLeft: '0.42em'}}>
        NEURAXINE
      </Blur>
      <Blur t={r} at={0.4} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: '#9C9C99', marginTop: 70}}>
        comment
      </Blur>
      <Blur t={r} at={0.55} style={{marginTop: 6, padding: '12px 34px', background: C.blue, fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: '-0.01em'}}>
        AUTOMATE
      </Blur>
      <Blur t={r} at={0.75} style={{fontFamily: SANS, fontSize: 30, color: '#8D8D8A', marginTop: 22}}>
        for the full guide
      </Blur>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sc = sceneAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < edit.speech && (
        <>
          {sc.kind === 'face' && <Face t={t} />}
          {sc.kind === 'list' && <ListCard t={t} a={sc.a} />}
          {sc.kind === 'whatif' && <WhatIfCard t={t} a={sc.a} />}
          {sc.kind === 'hub' && <HubCard t={t} a={sc.a} />}
          {sc.kind === 'gain' && <GainCard t={t} a={sc.a} />}
          {sc.kind === 'face' && (
            <>
              <BrandChip t={t} />
              <CommentCard t={t} />
              <FollowBar t={t} />
            </>
          )}
          <Captions t={t} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
