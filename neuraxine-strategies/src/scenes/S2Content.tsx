import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, POSTS, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon} from '../components/BrandIcon';
import {Img, staticFile} from 'remotion';

const fr = (s: number) => Math.round(s * 30);

const Heart: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill={color} />
  </svg>
);

/** A real post from the page, shown as a reel card with Instagram's own UI chrome. */
const Post: React.FC<{i: number; at: number}> = ({i, at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at + i * 7, 18, ease.out);
  const post = POSTS[i];
  const off = i - 1;
  const W = 300;
  const H = 400;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - W / 2 + off * 250,
        top: 560,
        width: W,
        opacity: p,
        transform: `translateY(${(1 - p) * 200 + Math.abs(off) * 36}px) rotate(${off * 6 * p}deg) scale(${off === 0 ? 1.12 : 0.92})`,
        zIndex: off === 0 ? 2 : 1,
      }}
    >
      <div style={{borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px'}}>
          <div style={{width: 30, height: 30, borderRadius: 99, overflow: 'hidden', background: '#000'}}>
            <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.55)'}} />
          </div>
          <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 18, color: '#111'}}>neuraxine</span>
          <BrandIcon name="instagram" size={22} style={{marginLeft: 'auto'}} />
        </div>
        <Img src={staticFile(post.img)} style={{width: W, height: H, objectFit: 'cover', objectPosition: 'top', display: 'block'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', fontFamily: F.body, fontWeight: 700, fontSize: 18, color: '#111'}}>
          <Heart size={24} color="#ED4956" />
          <svg width={22} height={22} viewBox="0 0 24 24"><path d="M21 12a8.5 8.5 0 0 1-12.7 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" fill="none" stroke="#111" strokeWidth={2} /></svg>
          <svg width={22} height={22} viewBox="0 0 24 24"><path d="M22 3L9.5 13.5M22 3l-7 18-3.5-7.5L4 10z" fill="none" stroke="#111" strokeWidth={2} strokeLinejoin="round" /></svg>
          <span style={{marginLeft: 'auto', color: '#555', fontWeight: 600}}>{post.views} views</span>
        </div>
      </div>
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
