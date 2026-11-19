import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CHAPTERS} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';

/** The brand's own post template as the chapter card: cream grid paper, black sans line, italic serif line, green highlight. */
export const ChapterHeader: React.FC<{n: number; start?: number}> = ({n, start = 4}) => {
  const frame = useCurrentFrame();
  const ch = CHAPTERS[n - 1];
  const flip = prog(frame, start, 18, ease.out);
  const a = prog(frame, start + 10, 14, ease.out);
  const b = prog(frame, start + 16, 14, ease.out);
  const hl = prog(frame, start + 26, 12, ease.out);
  const sway = Math.sin(frame / 40) * 2;
  const i = ch.b.toLowerCase().indexOf(ch.hl.toLowerCase());
  const pre = i >= 0 ? ch.b.slice(0, i) : ch.b;
  const word = i >= 0 ? ch.b.slice(i, i + ch.hl.length) : '';
  const post = i >= 0 ? ch.b.slice(i + ch.hl.length) : '';
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 112, perspective: 1600}}>
      <div
        style={{
          transformOrigin: '50% 0%',
          transform: `rotateX(${mix(flip, -95, 0) + sway * 0.4}deg) rotateY(${sway}deg)`,
          opacity: Math.min(1, flip * 2),
          borderRadius: 26,
          overflow: 'hidden',
          background: C.paper,
          backgroundImage: `linear-gradient(${C.paperGrid} 1px, transparent 1px), linear-gradient(90deg, ${C.paperGrid} 1px, transparent 1px)`,
          backgroundSize: '34px 34px',
          boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.4), 0 0 60px rgba(181,241,42,${0.15 * flip})`,
          padding: '26px 34px 34px 44px',
          position: 'relative',
        }}
      >
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundImage: `repeating-linear-gradient(180deg, ${C.waGreen} 0 18px, #111 18px 30px, transparent 30px 40px)`}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 19, letterSpacing: '0.16em', color: C.paperMuted}}>
          <span>● NEURAXINE</span>
          <span style={{padding: '6px 12px', border: `1.5px solid ${C.paperInk}`, borderRadius: 8, color: C.paperInk}}>STRATEGY {n}/5</span>
        </div>
        <div style={{marginTop: 22, textAlign: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', color: C.paperInk, lineHeight: 1.05, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>{ch.a}</div>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 70, color: C.paperInk, lineHeight: 1.1, opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>
            {pre}
            {word && (
              <span style={{position: 'relative', display: 'inline-block', padding: '0 10px', margin: '0 -2px'}}>
                <span style={{position: 'absolute', left: 0, right: 0, top: '12%', bottom: '6%', background: C.waGreen, transformOrigin: 'left', transform: `scaleX(${hl})`, borderRadius: 4}} />
                <span style={{position: 'relative', color: hl > 0.5 ? 'white' : C.paperInk, fontFamily: F.display, fontStyle: 'normal', fontWeight: 800, fontSize: '0.86em', letterSpacing: '-0.02em'}}>{word}</span>
              </span>
            )}
            {post}
          </div>
        </div>
      </div>
    </div>
  );
};
