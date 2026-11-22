// Editorial motion-graphics kit (after the reference): cream paper and dark rim-lit stages, condensed headlines,
// selection boxes with handles, pill tags, wrapping word-tape, film strip, barcode, micro-text and a handle bar.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {LINES, MODE, Mode, SCENES, SECTION_IDS, SceneId} from '../config';
import {ease, mix, prog} from '../lib/anim';
import {F} from '../theme';

export type Surface = 'paper' | 'dark';
export const SURFACE: Record<SceneId, Surface> = {
  hook: 'dark', nine: 'paper', apollo: 'paper', email: 'paper', linkedin: 'dark', vapi: 'dark', crm: 'paper', honest: 'dark', wrong: 'dark', speed: 'paper', cta: 'dark',
};
export const E = {
  paper: '#F4ECE1',
  peach: '#EBD6C2',
  ink: '#141414',
  inkSoft: '#6B625A',
  light: '#F2F2F2',
  lightSoft: '#8C8C8C',
  red: '#E0482A',
  redDark: '#FF5C5C',
  green: '#169A52',
  lime: '#B5F12A',
};
/** Accent colour for a surface + mood. */
export const accent = (s: Surface, m: Mode) => (s === 'paper' ? (m === 'before' ? E.red : E.green) : m === 'before' ? E.redDark : E.lime);
export const COND: React.CSSProperties = {fontFamily: '"Archivo", "Inter Display", sans-serif', fontWeight: 800, fontStretch: '62%', textTransform: 'uppercase', letterSpacing: '-0.01em'};

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/* ---------- stages ---------- */

/** Cream paper with a peach disc behind the hero and a soft top light. */
export const Paper: React.FC<{disc?: {x: number; y: number; r: number}}> = ({disc = {x: 540, y: 1000, r: 380}}) => {
  const f = useCurrentFrame();
  const k = prog(f, 0, 24, ease.out);
  return (
    <AbsoluteFill style={{background: E.paper}}>
      <AbsoluteFill style={{background: 'radial-gradient(1000px 800px at 50% 30%, #FBF6F0, transparent 70%)'}} />
      <div style={{position: 'absolute', left: disc.x - disc.r, top: disc.y - disc.r, width: disc.r * 2, height: disc.r * 2, borderRadius: '50%', background: `radial-gradient(circle at 45% 40%, #F1DFCD, ${E.peach})`, transform: `scale(${mix(k, 0.85, 1)})`, opacity: k}} />
      <AbsoluteFill style={{backgroundImage: GRAIN, opacity: 0.18, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

/** Black stage with coloured rim light from both sides (red for before, lime for after). */
export const Dark: React.FC<{mood: Mode; split?: boolean}> = ({mood, split}) => {
  const f = useCurrentFrame();
  const b = 0.85 + Math.sin(f / 45) * 0.15;
  const c = mood === 'before' ? '255,72,48' : '181,241,42';
  const left = split ? '255,72,48' : c;
  const right = split ? '181,241,42' : c;
  return (
    <AbsoluteFill style={{background: '#060606'}}>
      <AbsoluteFill style={{background: `radial-gradient(700px 1100px at -10% 60%, rgba(${left},${0.32 * b}), transparent 60%), radial-gradient(700px 1100px at 110% 60%, rgba(${right},${0.3 * b}), transparent 60%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(900px 500px at 50% 110%, rgba(255,255,255,0.06), transparent 70%)'}} />
      {Array.from({length: 22}).map((_, i) => {
        const d = 0.3 + rnd(i + 1) * 0.7;
        const y = ((rnd(i + 3) * 2100 - f * (0.3 + d)) % 2100 + 2100) % 2100 - 90;
        return <div key={i} style={{position: 'absolute', left: rnd(i + 7) * 1080, top: y, width: 2 + d * 4, height: 2 + d * 4, borderRadius: 99, background: '#fff', opacity: 0.05 + d * 0.12, filter: `blur(${(1 - d) * 2}px)`}} />;
      })}
      <AbsoluteFill style={{backgroundImage: GRAIN, opacity: 0.12, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ---------- graphic devices ---------- */

/** Design-tool selection box with eight square handles. */
export const SelectBox: React.FC<{x: number; y: number; w: number; h: number; show: number; dark?: boolean}> = ({x, y, w, h, show, dark}) => {
  if (show <= 0) return null;
  const col = dark ? 'rgba(242,242,242,0.7)' : '#5A524B';
  const hs = 22;
  const pts = [
    [0, 0], [0.5, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [0.5, 1], [1, 1],
  ];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: show, transform: `scale(${mix(show, 1.08, 1)})`}}>
      <div style={{position: 'absolute', inset: 0, border: `2.5px dashed ${col}`}} />
      {pts.map(([px, py], i) => (
        <div key={i} style={{position: 'absolute', left: px * w - hs / 2, top: py * h - hs / 2, width: hs, height: hs, background: col, borderRadius: 3}} />
      ))}
    </div>
  );
};

/** Rounded pill tags ("• price") that pop in one by one. */
export const Pills: React.FC<{items: {label: string; at: number; tone: 'red' | 'green' | 'violet' | 'lime'}[]; style?: React.CSSProperties}> = ({items, style}) => {
  const f = useCurrentFrame();
  const TONE = {
    red: {bg: '#FBD9D2', fg: '#B4321A', bd: '#E8806B'},
    green: {bg: '#CFF2DC', fg: '#11743E', bd: '#5FCB8C'},
    violet: {bg: '#E3DAFB', fg: '#5B3CC4', bd: '#A592EE'},
    lime: {bg: 'rgba(181,241,42,0.14)', fg: '#D4FF6B', bd: 'rgba(181,241,42,0.6)'},
  } as const;
  return (
    <div style={{position: 'absolute', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, ...style}}>
      {items.map((it) => {
        const p = prog(f, it.at, 10, ease.out);
        const t = TONE[it.tone];
        return (
          <div key={it.label} style={{padding: '10px 22px', borderRadius: 999, background: t.bg, color: t.fg, border: `2px solid ${t.bd}`, fontFamily: F.body, fontWeight: 700, fontSize: 30, opacity: p, transform: `scale(${mix(p, 0.5, 1) * (1 + Math.sin(Math.min(1, p) * Math.PI) * 0.08)})`}}>
            • {it.label}
          </div>
        );
      })}
    </div>
  );
};

/** A curved ribbon of repeated words that slides along its path. */
export const Tape: React.FC<{text: string; color: string; ink: string; y: number; tilt: number; show: number; speed?: number; id: string}> = ({text, color, ink, y, tilt, show, speed = 3, id}) => {
  const f = useCurrentFrame();
  if (show <= 0) return null;
  const d = `M -200 ${y + 60} C 200 ${y - 40 + tilt}, 700 ${y + 120 - tilt}, 1300 ${y - 20}`;
  const rep = Array.from({length: 12}).map(() => text).join('  ·  ');
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: show}}>
      <defs>
        <path id={id} d={d} />
      </defs>
      <use href={`#${id}`} stroke={color} strokeWidth={84} fill="none" strokeDasharray={`${show * 2000} 2000`} />
      <text style={{...COND, fontSize: 52, fill: ink, letterSpacing: '0.02em'}} dy={18}>
        <textPath href={`#${id}`} startOffset={`${-((f * speed) % 600)}`}>
          {rep}
        </textPath>
      </text>
    </svg>
  );
};

/** A strip of film frames (left edge) for the "again and again" beat. */
export const FilmStrip: React.FC<{show: number; x?: number}> = ({show, x = 40}) => {
  const f = useCurrentFrame();
  const off = (f * 3) % 220;
  return (
    <div style={{position: 'absolute', left: x, top: -220 + off, width: 170, height: 2400, opacity: show * 0.9, background: '#111', borderLeft: '1px solid #222', borderRight: '1px solid #222'}}>
      {Array.from({length: 11}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 24, right: 24, top: 30 + i * 220, height: 170, borderRadius: 6, background: 'linear-gradient(160deg, #2A2A2A, #161616)', border: '1px solid #333'}} />
      ))}
      {Array.from({length: 60}).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: 6, top: 10 + i * 40, width: 10, height: 16, borderRadius: 2, background: '#060606'}} />
          <div style={{position: 'absolute', right: 6, top: 10 + i * 40, width: 10, height: 16, borderRadius: 2, background: '#060606'}} />
        </React.Fragment>
      ))}
    </div>
  );
};

export const Barcode: React.FC<{x: number; y: number; w?: number; h?: number; color: string; opacity?: number}> = ({x, y, w = 200, h = 70, color, opacity = 1}) => {
  const bars: number[] = [];
  let acc = 0;
  let i = 0;
  while (acc < w) {
    const bw = 1 + Math.floor(rnd(i + 11) * 4);
    bars.push(bw);
    acc += bw * 2;
    i++;
  }
  let cx = 0;
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, opacity}}>
      {bars.map((bw, k) => {
        const r = <rect key={k} x={cx} y={0} width={bw} height={h} fill={color} />;
        cx += bw * 2;
        return r;
      })}
    </svg>
  );
};

/* ---------- frame furniture ---------- */

const sceneAt = (t: number): SceneId => [...SECTION_IDS].reverse().find((s) => t >= SCENES[s].start + 0.15) ?? 'hook';

/** Handle bar at the top, side micro-text, footer with scene counter and a barcode (colours follow the stage). */
export const Furniture: React.FC = () => {
  const f = useCurrentFrame();
  const id = sceneAt(f / 30);
  const dark = SURFACE[id] === 'dark';
  const ink = dark ? 'rgba(242,242,242,0.55)' : 'rgba(20,20,20,0.55)';
  const idx = SECTION_IDS.indexOf(id) + 1;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* handle bar */}
      <div style={{position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', width: 560, borderRadius: 999, border: `2px solid ${dark ? 'rgba(242,242,242,0.35)' : 'rgba(20,20,20,0.6)'}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)'}}>
          <div style={{width: 40, height: 40, borderRadius: 99, overflow: 'hidden', flexShrink: 0}}>
            <Img src={staticFile('brand/nx.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.55)'}} />
          </div>
          <div style={{flex: 1, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 28, color: dark ? '#F2F2F2' : '#141414'}}>@neuraxine</div>
          <svg width={34} height={34} viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" stroke={dark ? '#F2F2F2' : '#141414'} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* side micro-text */}
      <div style={{position: 'absolute', left: 18, top: 960, transform: 'translate(-50%, -50%) rotate(-90deg)', transformOrigin: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 15, letterSpacing: '0.4em', color: ink, whiteSpace: 'nowrap', marginLeft: 12}}>
        NEURAXINE · AI AUTOMATION AGENCY · 2026
      </div>
      <div style={{position: 'absolute', right: 18, top: 960, transform: 'translate(50%, -50%) rotate(90deg)', fontFamily: F.body, fontWeight: 700, fontSize: 15, letterSpacing: '0.4em', color: ink, whiteSpace: 'nowrap', marginRight: 12}}>
        SALES AUTOMATION · WWW.NEURAXINE.COM
      </div>
      {/* footer */}
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 46, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 17, letterSpacing: '0.3em', color: ink}}>
        <span>▶ {String(idx).padStart(2, '0')} / {SECTION_IDS.length}</span>
        <span>NEURAXINE STUDIO</span>
        <span>9 WORKFLOWS</span>
      </div>
      <Barcode x={790} y={1760} w={170} h={46} color={dark ? '#F2F2F2' : '#141414'} opacity={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- captions ---------- */

type Chunk = {start: number; words: {w: string; t: number}[]};
const CHUNKS: Chunk[] = LINES.flatMap((l) => {
  const words = l.text.split(' ').filter(Boolean);
  const groups: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 6 || (/[,?.…]$/.test(w) && cur.length >= 2)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  let pos = 0;
  return groups.map((g) => {
    const ws = g.map((w) => {
      const t = l.start + (pos / l.text.length) * l.dur;
      pos += w.length + 1;
      return {w, t};
    });
    return {start: ws[0].t, words: ws};
  });
});

/** Key words per spoken line: they become the big condensed headline word. */
export const KEY = new Set(['system', 'nahi.', '9', 'workflows', 'apollo', 'list.', 'personalized', 'sir', 'linkedin', 'unipile', 'vapi', 'ai', 'supabase', 'crm', 'dashboard', 'honest', 'forget', 'galat', 'spam', 'tezi', 'speed', 'target', 'leads.']);
const isKey = (w: string) => KEY.has(w.toLowerCase().replace(/["“”]/g, ''));

/** Editorial caption: small bold words, with key words set huge in condensed caps (accent colour). */
export const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const i = CHUNKS.findIndex((c, k) => t >= c.start - 0.1 && (k === CHUNKS.length - 1 || t < CHUNKS[k + 1].start - 0.1));
  if (i < 0) return null;
  const c = CHUNKS[i];
  const id = sceneAt(t);
  const dark = SURFACE[id] === 'dark';
  const acc = accent(SURFACE[id], MODE[id]);
  const holdEnd = i === CHUNKS.length - 1 ? Infinity : CHUNKS[i + 1].start - 0.1;
  const out = holdEnd === Infinity ? 0 : prog(frame, Math.round(holdEnd * 30) - 4, 4, ease.in);
  return (
    <div style={{position: 'absolute', top: 170, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: '0 16px', opacity: 1 - out}}>
      {c.words.map((w, k) => {
        const p = prog(frame, Math.round(w.t * 30) - 2, 7, ease.out);
        const key = isKey(w.w);
        return (
          <span
            key={k}
            style={{
              ...(key ? {...COND, fontSize: 128, lineHeight: 1, color: acc} : {fontFamily: F.display, fontWeight: 800, fontSize: 54, lineHeight: 1.2, letterSpacing: '-0.03em', color: dark ? '#F2F2F2' : '#141414'}),
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px) scale(${key ? mix(p, 1.25, 1) : 1})`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Small paragraph block (editorial body copy). */
export const Body: React.FC<{text: string; show: number; dark?: boolean; style?: React.CSSProperties}> = ({text, show, dark, style}) => (
  <div style={{position: 'absolute', width: 360, fontFamily: F.body, fontWeight: 500, fontSize: 21, lineHeight: 1.35, color: dark ? 'rgba(242,242,242,0.7)' : 'rgba(20,20,20,0.72)', opacity: show, transform: `translateY(${(1 - show) * 14}px)`, ...style}}>{text}</div>
);
