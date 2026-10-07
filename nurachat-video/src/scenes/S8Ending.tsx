import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, COPY} from '../config';
import {C, F} from '../theme';
import {KineticText} from '../components/KineticText';
import {LogoReveal, Wordmark} from '../components/LogoReveal';
import {ease, mix, prog} from '../lib/anim';

const WORDS_AT = 18;
const WORDS_OUT = 90;
const MARK_AT = 98;
const CTA_AT = 120;

/** 42–47.5s. Logo, Automate. Respond. Convert., then the wordmark, tagline and one quiet CTA. */
export const S8Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = prog(frame, WORDS_OUT, 24, ease.inOut);
  const mark = prog(frame, MARK_AT, 20, ease.out);
  const tag = prog(frame, MARK_AT + 10, 18, ease.out);
  const cta = prog(frame, CTA_AT, 18, ease.out);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: mix(settle, 330, 520), transform: `scale(${mix(settle, 0.85, 1)})`}}>
          <LogoReveal start={2} size={170} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <KineticText
          lines={COPY.endWords}
          start={WORDS_AT}
          stagger={12}
          size={176}
          lineHeight={1.0}
          exitAt={WORDS_OUT}
          exitMode="up"
          style={{marginTop: 160}}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: 790,
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
            top: 990,
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 40,
            color: C.grey,
            letterSpacing: '0.01em',
            opacity: tag,
            transform: `translateY(${(1 - tag) * 20}px)`,
          }}
        >
          {BRAND.tagline}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1170,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '22px 38px',
            borderRadius: 999,
            border: '1.5px solid rgba(194,255,61,0.55)',
            background: 'rgba(194,255,61,0.08)',
            boxShadow: `0 0 40px rgba(194,255,61,${0.18 * cta})`,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 36,
            color: C.white,
            opacity: cta,
            transform: `translateY(${(1 - cta) * 24}px)`,
          }}
        >
          <span style={{width: 12, height: 12, borderRadius: 99, background: C.lime, boxShadow: `0 0 12px ${C.lime}`}} />
          {BRAND.cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
