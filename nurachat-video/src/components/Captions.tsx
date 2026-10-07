import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAPTIONS} from '../config';
import {C, F} from '../theme';
import {ease, prog, sec} from '../lib/anim';

/** Voiceover subtitles, sitting above the Reels/Shorts bottom UI. */
export const Captions: React.FC<{y?: number}> = ({y = 1520}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {CAPTIONS.filter((c) => c.show !== false).map((c, i) => {
        const a = sec(c.at);
        const b = sec(c.to);
        if (frame < a - 1 || frame > b + 6) return null;
        const pin = prog(frame, a, 8, ease.out);
        const pout = prog(frame, b - 2, 6, ease.in);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 70,
              right: 70,
              top: y,
              display: 'flex',
              justifyContent: 'center',
              transform: `translateY(calc(-50% + ${(1 - pin) * 14}px))`,
              opacity: pin * (1 - pout),
            }}
          >
            <div
              style={{
                maxWidth: 900,
                textAlign: 'center',
                padding: '14px 26px',
                borderRadius: 20,
                background: 'rgba(5,7,6,0.72)',
                border: `1px solid ${C.stroke}`,
                backdropFilter: 'blur(12px)',
                fontFamily: F.body,
                fontWeight: 600,
                fontSize: 38,
                lineHeight: 1.3,
                color: C.white,
              }}
            >
              {c.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
