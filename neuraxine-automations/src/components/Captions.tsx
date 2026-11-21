import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAPTION_SECTIONS, LINES} from '../config';
import {C, F} from '../theme';
import {ease, prog} from '../lib/anim';

type Chunk = {start: number; end: number; words: {w: string; t: number}[]};

/** Split every voiced line into ≤5-word chunks, timed by character count. */
const CHUNKS: Chunk[] = LINES.filter((l) => CAPTION_SECTIONS.includes(l.section as never)).flatMap((l) => {
  const words = l.text.split(' ').filter(Boolean);
  const groups: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 5 || /[.,?!…]$/.test(w)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  const total = l.text.length;
  let pos = 0;
  return groups.map((g) => {
    const t0 = l.start + (pos / total) * l.dur;
    const ws = g.map((w) => {
      const t = l.start + (pos / total) * l.dur;
      pos += w.length + 1;
      return {w, t};
    });
    return {start: t0, end: l.start + (Math.min(pos, total) / total) * l.dur, words: ws};
  });
});

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = CHUNKS.find((x, i) => t >= x.start - 0.05 && t < (CHUNKS[i + 1] && CHUNKS[i + 1].start - x.end < 0.6 ? CHUNKS[i + 1].start - 0.05 : x.end + 0.35));
  if (!c) return null;
  const inP = prog(frame, Math.round(c.start * 30) - 2, 6, ease.out);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 1590, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 16px',
          padding: '14px 26px',
          borderRadius: 18,
          background: 'rgba(10,9,8,0.55)',
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 14}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const said = t >= w.t - 0.03;
          const next = c.words[i + 1];
          const active = said && (!next || t < next.t - 0.03);
          return (
            <span key={i} style={{color: active ? C.accent : said ? C.ink : 'rgba(243,238,230,0.38)', transform: `scale(${active ? 1.06 : 1})`, display: 'inline-block'}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
