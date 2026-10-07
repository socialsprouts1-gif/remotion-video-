import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';

type Props = {
  start?: number;
  size?: number;
  withWordmark?: boolean;
  wordmarkSize?: number;
  exitAt?: number;
  style?: React.CSSProperties;
};

/** The logo exactly as supplied, revealed with a soft glow and one light sweep. */
export const LogoReveal: React.FC<Props> = ({start = 0, size = 200, withWordmark = false, wordmarkSize = 96, exitAt, style}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 22, ease.out);
  const e = exitAt === undefined ? 0 : prog(frame, exitAt, 12, ease.in);
  const sweep = prog(frame, start + 8, 26, ease.inOut);
  const breathe = 0.85 + Math.sin((frame - start) / 14) * 0.15;
  const wp = prog(frame, start + 8, 20, ease.out);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size * 0.22,
        opacity: p * (1 - e),
        transform: `scale(${mix(p, 0.82, 1) * (1 + e * 0.08)})`,
        filter: `blur(${mix(p, 14, 0) + e * 14}px)`,
        ...style,
      }}
    >
      <div style={{position: 'relative', width: size, height: size}}>
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.6,
            background: `radial-gradient(circle, rgba(194,255,61,${0.28 * breathe}) 0%, transparent 62%)`,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: size * 0.22,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 ${size * 0.3}px rgba(194,255,61,${0.25 * breathe})`,
            background: '#000',
          }}
        >
          <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)',
              transform: `translateX(${mix(sweep, -120, 120)}%)`,
            }}
          />
        </div>
      </div>
      {withWordmark && (
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: wordmarkSize,
            letterSpacing: '-0.04em',
            color: C.white,
            opacity: wp,
            transform: `translateY(${(1 - wp) * 30}px)`,
          }}
        >
          <Wordmark />
        </div>
      )}
    </div>
  );
};

/** Brand name with the trailing "Chat" in the accent colour, echoing the product's own wordmark. */
export const Wordmark: React.FC = () => {
  const m = BRAND.name.match(/^(.*?)(Chat)$/);
  if (!m) return <>{BRAND.name}</>;
  return (
    <>
      {m[1]}
      <span style={{color: C.lime}}>{m[2]}</span>
    </>
  );
};
