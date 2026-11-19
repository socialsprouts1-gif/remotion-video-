import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, POSTS, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';

const fr = (s: number) => Math.round(s * 30);

const Heart: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill={color} />
  </svg>
);

const Post: React.FC<{i: number; at: number}> = ({i, at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at + i * 7, 18, ease.out);
  const post = POSTS[i];
  const likes = Math.round(prog(frame, at + i * 7 + 10, 60, ease.soft) * post.likes);
  const off = i - 1;
  const hearts = [0, 1, 2];
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - 160 + off * 270,
        top: 640,
        width: 320,
        height: 400,
        opacity: p,
        transform: `translateY(${(1 - p) * 220 + Math.abs(off) * 40}px) rotate(${off * 7 * p}deg) scale(${off === 0 ? 1.08 : 0.94})`,
        zIndex: off === 0 ? 2 : 1,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 26,
          overflow: 'hidden',
          background: '#16130F',
          border: `1px solid ${C.lineStrong}`,
          boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{flex: 1, position: 'relative', background: `linear-gradient(${140 + i * 40}deg, rgba(255,91,34,${0.55 - i * 0.12}), #201A14 70%)`, padding: 22}}>
          <div style={{display: 'inline-block', padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.45)', color: C.ink, fontFamily: F.body, fontWeight: 700, fontSize: 17, letterSpacing: '0.16em'}}>{post.tag}</div>
          <div style={{marginTop: 18, color: C.ink, fontFamily: F.display, fontWeight: 900, fontSize: 34, lineHeight: 1.08, letterSpacing: '-0.02em'}}>{post.hook}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', fontFamily: F.body, fontWeight: 700, fontSize: 24, color: C.ink}}>
          <Heart size={28} color={C.accent} />
          {likes.toLocaleString('en-IN')}
          <span style={{marginLeft: 'auto', color: C.muted, fontWeight: 600, fontSize: 20}}>saves ↑</span>
        </div>
      </div>
      {off === 0 &&
        hearts.map((h) => {
          const hp = prog(frame, at + 24 + h * 12, 40, ease.out);
          if (hp <= 0 || hp >= 1) return null;
          return (
            <div key={h} style={{position: 'absolute', left: 230 + h * 22, top: 330 - hp * 300, opacity: 1 - hp, transform: `scale(${mix(hp, 0.6, 1.3)})`}}>
              <Heart size={44} color={C.accent} />
            </div>
          );
        })}
    </div>
  );
};

export const S2Content: React.FC = () => {
  const frame = useCurrentFrame();
  const ads = fr(cue('s2', 1));
  const content = fr(wordAt('s2', 1, 'content'));
  const trust = fr(wordAt('s2', 1, 'bharosa'));
  const sale = fr(wordAt('s2', 1, 'sale'));
  const adIn = prog(frame, ads, 14, ease.out);
  const adX = prog(frame, ads + 22, 10, ease.out);
  const adOut = prog(frame, content - 10, 12, ease.in);
  const tP = prog(frame, trust, 30, ease.out);
  const sP = prog(frame, sale, 14, ease.out);
  return (
    <AbsoluteFill>
      <ChapterHeader n={2} start={4} />
      {/* "only ads" — crossed out */}
      {adOut < 1 && (
        <div style={{position: 'absolute', left: 190, right: 190, top: 700, opacity: adIn * (1 - adOut), transform: `scale(${mix(adIn, 0.9, 1) * (1 - adOut * 0.2)})`}}>
          <div style={{borderRadius: 26, border: `2px dashed ${C.lineStrong}`, padding: '50px 30px', textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.muted, letterSpacing: '-0.02em'}}>
            BUY NOW!!! <span style={{fontSize: 34, display: 'block', marginTop: 10, fontWeight: 700}}>50% OFF · LIMITED · AD</span>
          </div>
          <svg width={700} height={260} style={{position: 'absolute', left: 0, top: 0}}>
            <line x1={30} y1={230} x2={30 + 640 * adX} y2={230 - 200 * adX} stroke={C.bad} strokeWidth={12} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {frame >= content - 4 && [0, 2, 1].map((i) => <Post key={i} i={i} at={content - 4} />)}
      {/* trust → sale */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 1260, opacity: prog(frame, trust - 4, 10)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.body}}>
          <div style={{color: C.ink, fontWeight: 700, fontSize: 30, width: 170}}>Bharosa</div>
          <div style={{flex: 1, height: 14, borderRadius: 99, background: C.line, overflow: 'hidden'}}>
            <div style={{width: `${tP * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.accentDeep}, ${C.accent})`, boxShadow: `0 0 18px ${C.accentGlow}`}} />
          </div>
          <div
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              background: sP > 0.5 ? C.accent : 'transparent',
              border: `2px solid ${sP > 0.5 ? C.accent : C.lineStrong}`,
              color: sP > 0.5 ? '#1A0700' : C.muted,
              fontWeight: 800,
              fontSize: 28,
              transform: `scale(${1 + Math.sin(sP * Math.PI) * 0.15})`,
            }}
          >
            Sale ✓
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
