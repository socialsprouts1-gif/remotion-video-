import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ACCENT_WORDS, LINES, MODE, Mode, SCENES, SECTION_IDS} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';

/* ---------- backgrounds ---------- */

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Stage. "after": black with lime light from the edges and drifting lime dust. "before": cold grey, flat, tense. */
export const Bg: React.FC<{mode: Mode; intensity?: number}> = ({mode, intensity = 1}) => {
  const f = useCurrentFrame();
  const after = mode === 'after';
  const breathe = 0.85 + Math.sin(f / 50) * 0.15;
  return (
    <AbsoluteFill style={{background: after ? '#030504' : '#101316'}}>
      {after ? (
        <>
          <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(181,241,42,${0.16 * intensity * breathe}) 0%, transparent 18%, transparent 82%, rgba(181,241,42,${0.14 * intensity * breathe}) 100%)`}} />
          <AbsoluteFill style={{background: `radial-gradient(900px 700px at 50% 58%, rgba(124,197,20,${0.14 * intensity}), transparent 70%)`}} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{background: 'radial-gradient(900px 800px at 50% 50%, rgba(120,140,160,0.14), transparent 70%)'}} />
          <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 50% 110%, rgba(255,92,92,${0.10 * intensity}), transparent 60%)`}} />
        </>
      )}
      {Array.from({length: after ? 34 : 18}).map((_, i) => {
        const depth = 0.3 + rnd(i + 1) * 0.7;
        const x = rnd(i + 7) * 1080;
        const y = ((rnd(i + 3) * 2100 - f * (0.4 + depth * 1.1)) % 2100 + 2100) % 2100 - 90;
        const sz = 3 + depth * 6;
        const col = after ? '#C8F55A' : '#9AA6B2';
        return <div key={i} style={{position: 'absolute', left: x + Math.sin((f + i * 30) / 40) * 12, top: y, width: sz, height: sz, borderRadius: 99, background: col, opacity: (after ? 0.12 + depth * 0.3 : 0.06 + depth * 0.12) * (0.6 + 0.4 * Math.sin((f + i * 13) / 22)), filter: `blur(${(1 - depth) * 3 + 0.5}px)`, boxShadow: after ? `0 0 ${sz * 2}px rgba(181,241,42,0.5)` : undefined}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ---------- top captions ---------- */

type Chunk = {start: number; end: number; words: {w: string; t: number}[]};
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
    return {start: ws[0].t, end: l.start + (Math.min(pos, l.text.length) / l.text.length) * l.dur, words: ws};
  });
});
const isAccent = (w: string) => ACCENT_WORDS.includes(w.toLowerCase().replace(/[^a-z0-9.'-]/g, '').replace(/\.$/, '')) || ACCENT_WORDS.includes(w.toLowerCase().replace(/[^a-z0-9.'-]/g, ''));
export const modeAt = (t: number): Mode => {
  const id = [...SECTION_IDS].reverse().find((s) => t >= SCENES[s].start + 0.15) ?? 'hook';
  return MODE[id];
};

export const TopCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const i = CHUNKS.findIndex((c, k) => t >= c.start - 0.1 && (k === CHUNKS.length - 1 || t < CHUNKS[k + 1].start - 0.1));
  if (i < 0) return null;
  const c = CHUNKS[i];
  const after = modeAt(t) === 'after';
  const holdEnd = i === CHUNKS.length - 1 ? Infinity : CHUNKS[i + 1].start - 0.1;
  const out = holdEnd === Infinity ? 0 : prog(frame, Math.round(holdEnd * 30) - 4, 4, ease.in);
  return (
    <div style={{position: 'absolute', top: 150, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', opacity: 1 - out}}>
      {c.words.map((w, k) => {
        const p = prog(frame, Math.round(w.t * 30) - 2, 7, ease.out);
        const acc = isAccent(w.w);
        return (
          <span
            key={k}
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 84,
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              color: acc ? (after ? C.lime : C.red) : '#F2F5EF',
              textShadow: acc && after ? '0 0 30px rgba(181,241,42,0.35)' : undefined,
              opacity: p,
              transform: `translateY(${(1 - p) * 26}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              display: 'inline-block',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** NX logo + name at the top centre. */
export const Watermark: React.FC = () => (
  <div style={{position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: 0.9}}>
    <div style={{width: 52, height: 52, borderRadius: 14, overflow: 'hidden'}}>
      <Img src={staticFile('brand/nx.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)'}} />
    </div>
    <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: '0.24em', color: '#E6EBE3'}}>NEURAXINE</span>
  </div>
);

/* ---------- icons ---------- */

const P = {stroke: 'currentColor', strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
export const Ico: Record<string, React.FC<{s?: number}>> = {
  lock: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" {...P} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...P} /></svg>),
  flag: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5" {...P} /></svg>),
  ban: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P} /><path d="M5.6 5.6l12.8 12.8" {...P} /></svg>),
  cal: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" {...P} /><path d="M3 10h18M8 3v4M16 3v4" {...P} /></svg>),
  users: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" {...P} /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" {...P} /></svg>),
  chat: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" {...P} /></svg>),
  globe: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P} /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" {...P} /></svg>),
  db: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="8" ry="3" {...P} /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" {...P} /></svg>),
  bolt: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" {...P} /></svg>),
  moon: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" /></svg>),
  check: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" {...P} strokeWidth={3} /></svg>),
  q: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...P} /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.5v.01" {...P} /></svg>),
  user: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" {...P} /><path d="M4 21a8 8 0 0 1 16 0" {...P} /></svg>),
  cursor: ({s = 30}) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z" fill="#15120F" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" /></svg>),
};

/** The Instagram app icon in its real colours. */
export const IgLogo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center', boxShadow: '0 14px 30px rgba(214,36,159,0.3)', ...style}}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx="17.4" cy="6.6" r="1.4" fill="#fff" />
    </svg>
  </div>
);

/* ---------- chips & cards ---------- */

export const Chip: React.FC<{show: number; dark?: boolean; icon?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties; gold?: boolean}> = ({show, dark, icon, children, style, gold}) => (
  <div
    style={{
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 22px 14px 14px',
      borderRadius: 22,
      background: gold ? 'linear-gradient(140deg, #D4FF6B, #B5F12A 60%, #8FD11B)' : 'linear-gradient(160deg, rgba(30,36,32,0.92), rgba(10,12,11,0.94))',
      color: gold ? '#0A1200' : '#F2F5EF',
      border: gold ? undefined : '1px solid rgba(181,241,42,0.22)',
      boxShadow: gold ? '0 20px 50px rgba(181,241,42,0.3)' : '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      fontFamily: F.body,
      fontWeight: 700,
      fontSize: 28,
      whiteSpace: 'nowrap',
      opacity: show,
      transform: `translateY(${(1 - show) * 30}px) scale(${mix(show, 0.85, 1)})`,
      ...style,
    }}
  >
    {icon && (
      <span style={{width: 50, height: 50, borderRadius: 14, display: 'grid', placeItems: 'center', background: gold ? 'rgba(0,0,0,0.12)' : C.limeSoft, color: gold ? '#0A1200' : C.lime}}>{icon}</span>
    )}
    {children}
  </div>
);
