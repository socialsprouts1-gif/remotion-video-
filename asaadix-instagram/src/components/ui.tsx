import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ACCENT_WORDS, DARK, LINES, SCENES, SECTION_IDS} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';

/* ---------- backgrounds ---------- */

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Black wall of dark wood slats, backlit in warm gold at the top and bottom (like the brand's logo board),
 *  with slow drifting gold dust. */
export const LuxBg: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const f = useCurrentFrame();
  const breathe = 0.85 + Math.sin(f / 50) * 0.15;
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,235,200,0.025) 0px, rgba(255,235,200,0.025) 2px, transparent 2px, transparent 120px)', opacity: 0.9}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(226,178,90,${0.32 * intensity * breathe}) 0%, transparent 16%, transparent 84%, rgba(226,178,90,${0.28 * intensity * breathe}) 100%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(900px 700px at 50% 55%, rgba(201,162,74,${0.1 * intensity}), transparent 70%)`}} />
      {Array.from({length: 36}).map((_, i) => {
        const depth = 0.3 + rnd(i + 1) * 0.7;
        const x = rnd(i + 7) * 1080;
        const y = ((rnd(i + 3) * 2100 - f * (0.4 + depth * 1.1)) % 2100 + 2100) % 2100 - 90;
        const s = 3 + depth * 7;
        return (
          <div key={i} style={{position: 'absolute', left: x + Math.sin((f + i * 30) / 40) * 12, top: y, width: s, height: s, borderRadius: 99, background: '#E8C77A', opacity: (0.15 + depth * 0.35) * (0.6 + 0.4 * Math.sin((f + i * 13) / 22)), filter: `blur(${(1 - depth) * 3 + 0.5}px)`, boxShadow: `0 0 ${s * 2}px rgba(232,199,122,0.6)`}} />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};
export const LightBg = LuxBg;
export const DarkBg = LuxBg;

/* ---------- top captions (word by word, as in the reference) ---------- */

type Chunk = {start: number; end: number; words: {w: string; t: number}[]};
const CHUNKS: Chunk[] = LINES.flatMap((l) => {
  const words = l.text.split(' ').filter(Boolean);
  const groups: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 6 || (/[,?.]$/.test(w) && cur.length >= 3)) {
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
const isAccent = (w: string) => ACCENT_WORDS.includes(w.toLowerCase().replace(/[^a-z']/g, ''));
const darkAt = (t: number) => {
  const id = [...SECTION_IDS].reverse().find((s) => t >= SCENES[s].start + 0.15) ?? 'hook';
  return DARK[id];
};

export const TopCaption: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const i = CHUNKS.findIndex((c, k) => t >= c.start - 0.1 && (k === CHUNKS.length - 1 || t < CHUNKS[k + 1].start - 0.1));
  if (i < 0) return null;
  const c = CHUNKS[i];
  const dark = darkAt(t);
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
              color: acc ? 'transparent' : dark ? '#F3EBDD' : C.ink,
              background: acc ? 'linear-gradient(180deg, #F5DB97 0%, #C9A24A 60%, #9C7A2C 100%)' : undefined,
              WebkitBackgroundClip: acc ? 'text' : undefined,
              backgroundClip: acc ? 'text' : undefined,
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

/** Small brand mark at the top centre (the reference carries its signature there). */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const dark = darkAt(t);
  return (
    <div style={{position: 'absolute', top: 62, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: 0.85}}>
      <Img src={staticFile('brand/mark.png')} style={{height: 46}} />
      <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: '0.24em', color: dark ? '#E9DCC0' : C.ink}}>ASAADIX DIGITAL</span>
    </div>
  );
};

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
      background: gold ? 'linear-gradient(140deg, #F5DB97, #C9A24A 60%, #A8832F)' : 'linear-gradient(160deg, rgba(40,34,26,0.92), rgba(14,12,10,0.92))',
      color: gold ? '#1A1206' : '#F3EBDD',
      border: gold ? undefined : '1px solid rgba(226,190,104,0.28)',
      boxShadow: gold ? '0 20px 50px rgba(201,162,74,0.35)' : '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
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
      <span style={{width: 50, height: 50, borderRadius: 14, display: 'grid', placeItems: 'center', background: gold ? 'rgba(0,0,0,0.12)' : C.goldSoft, color: gold ? '#1A1206' : C.gold}}>{icon}</span>
    )}
    {children}
  </div>
);
