import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, COPY} from '../config';
import {C, F} from '../theme';
import {LogoReveal, Wordmark} from '../components/LogoReveal';
import {ease, mix, prog} from '../lib/anim';

const KEY_AT = 14;
const SWAP = 110;

/** 31.8–39s. Comment "AUTOMATION" for the guide, then the logo and "Follow Neuraxine". */
export const S6Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const pre = prog(frame, 2, 14);
  const key = prog(frame, KEY_AT, 18);
  const post = prog(frame, KEY_AT + 18, 16);
  const swap = prog(frame, SWAP, 18, ease.inOut);
  const mark = prog(frame, SWAP + 10, 20);
  const follow = prog(frame, SWAP + 24, 18);
  const type = Math.min(COPY.keyword.length, Math.max(0, Math.floor((frame - KEY_AT) / 2.2)));

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 1 - swap,
          transform: `translateY(${-swap * 120}px) scale(${mix(swap, 1, 0.92)})`,
          filter: `blur(${swap * 10}px)`,
        }}
      >
        <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 56, color: C.grey, opacity: pre, transform: `translateY(${(1 - pre) * 20}px)`}}>
          {COPY.commentPre}
        </div>
        <div
          style={{
            marginTop: 28,
            padding: '34px 56px',
            borderRadius: 36,
            background: 'rgba(194,255,61,0.1)',
            border: `2px solid rgba(194,255,61,${0.4 + 0.4 * key})`,
            boxShadow: `0 0 ${80 * key}px rgba(194,255,61,0.3)`,
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 118,
            letterSpacing: '-0.02em',
            color: C.lime,
            opacity: key,
            transform: `scale(${mix(key, 0.85, 1)})`,
            minWidth: 820,
            textAlign: 'center',
          }}
        >
          {COPY.keyword.slice(0, type)}
          <span style={{opacity: frame % 20 < 10 && type < COPY.keyword.length ? 1 : 0, color: C.white}}>|</span>
        </div>
        <div style={{marginTop: 36, fontFamily: F.body, fontWeight: 600, fontSize: 46, color: C.white, opacity: post, transform: `translateY(${(1 - post) * 20}px)`}}>
          {COPY.commentPost}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center'}}>
        {frame > SWAP - 2 && (
          <div style={{position: 'absolute', top: 560}}>
            <LogoReveal start={SWAP + 2} size={210} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 880,
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 150,
            letterSpacing: '-0.045em',
            color: C.white,
            opacity: mark,
            transform: `translateY(${(1 - mark) * 50}px) scale(${mix(mark, 1.08, 1)})`,
            filter: `blur(${(1 - mark) * 12}px)`,
          }}
        >
          <Wordmark />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1110,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '22px 38px',
            borderRadius: 999,
            border: '1.5px solid rgba(194,255,61,0.55)',
            background: 'rgba(194,255,61,0.08)',
            boxShadow: `0 0 40px rgba(194,255,61,${0.18 * follow})`,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 38,
            color: C.white,
            opacity: follow,
            transform: `translateY(${(1 - follow) * 24}px)`,
          }}
        >
          <span style={{width: 12, height: 12, borderRadius: 99, background: C.lime, boxShadow: `0 0 12px ${C.lime}`}} />
          {BRAND.cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
