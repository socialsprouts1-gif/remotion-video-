import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, PROOF_PLACES, REVIEWS, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {GlassCard} from '../components/GlassCard';

const fr = (s: number) => Math.round(s * 30);

const Star: React.FC<{fill: number; size: number}> = ({fill, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <clipPath id={`c${Math.round(fill * 100)}`}>
        <rect x={0} y={0} width={24 * fill} height={24} />
      </clipPath>
    </defs>
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="none" stroke={C.lineStrong} strokeWidth={1.4} />
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill={C.accent} clipPath={`url(#c${Math.round(fill * 100)})`} />
  </svg>
);

export const S3Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s3', 1));
  const places = fr(wordAt('s3', 1, 'har jagah'));
  const rateIn = prog(frame, l1 - 6, 16, ease.out);
  const rating = mix(prog(frame, l1, 40, ease.out), 0, 4.9);
  return (
    <AbsoluteFill>
      <ChapterHeader n={3} start={4} />
      <div style={{position: 'absolute', top: 480, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, opacity: rateIn, transform: `translateY(${(1 - rateIn) * 50}px)`}}>
        <div style={{fontFamily: F.serif, fontSize: 210, lineHeight: 1, color: C.ink}}>{rating.toFixed(1)}</div>
        <div>
          <div style={{display: 'flex', gap: 6}}>
            {[0, 1, 2, 3, 4].map((i) => {
              const fp = prog(frame, l1 + 8 + i * 5.4, 8, ease.out) * (i === 4 ? 0.9 : 1);
              return (
                <div key={i} style={{transform: `scale(${1 + Math.sin(Math.min(1, fp) * Math.PI) * 0.25})`}}>
                  <Star fill={fp} size={64} />
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 10, color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 26, letterSpacing: '0.1em'}}>CUSTOMER RATING</div>
        </div>
      </div>
      {REVIEWS.map((r, i) => {
        const at = l1 + 45 + i * 18;
        const p = prog(frame, at, 18, ease.out);
        const shrink = prog(frame, places - 6, 16, ease.inOut);
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 140 + side * 40,
              right: 140 - side * 40,
              top: 760 + i * 170,
              opacity: p * mix(shrink, 1, 0.75),
              transform: `translateX(${(1 - p) * side * 300}px) rotate(${side * 1.5}deg) scale(${mix(shrink, 1, 0.92)})`,
            }}
          >
            <GlassCard radius={26} strong style={{padding: '22px 28px', background: 'rgba(22,19,15,0.9)', display: 'flex', gap: 20, alignItems: 'center'}}>
              <div style={{width: 70, height: 70, borderRadius: 99, flexShrink: 0, background: `hsl(${20 + i * 25} 45% ${38 + i * 6}%)`, display: 'grid', placeItems: 'center', color: C.ink, fontFamily: F.serif, fontSize: 38}}>{r.name[0]}</div>
              <div style={{flex: 1}}>
                <div style={{color: C.ink, fontFamily: F.serif, fontSize: 40, lineHeight: 1.15}}>“{r.text}”</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 6}}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} fill={1} size={22} />
                  ))}
                  <span style={{color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 22, marginLeft: 6}}>{r.name}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 1300, left: 90, right: 90, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap'}}>
        {PROOF_PLACES.map((pl, i) => {
          const p = prog(frame, places + i * 4, 12, ease.out);
          return (
            <div
              key={pl}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                background: C.accentSoft,
                border: `1.5px solid ${C.accent}`,
                color: C.ink,
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 27,
                opacity: p,
                transform: `scale(${mix(p, 0.6, 1)})`,
              }}
            >
              <span style={{color: C.accent}}>✓</span> {pl}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
