import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {FloatingBubbles} from '../components/Background';
import {KineticText} from '../components/KineticText';
import {LogoReveal} from '../components/LogoReveal';
import {ease, mix, prog} from '../lib/anim';

/** 0–4s. Logo glints, "Aaj hum sikhne jaa rahe hain…", then WHATSAPP / AUTOMATION fills the frame. */
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // logo starts centre-stage, then lifts to the top as the words arrive
  const lift = prog(frame, 10, 22, ease.inOut);
  const titleIn = 60;
  // slow push-in on the big title
  const push = mix(prog(frame, titleIn, 70, ease.soft), 1.0, 1.06);

  return (
    <AbsoluteFill>
      <FloatingBubbles opacity={mix(prog(frame, 0, 30), 0, 0.9)} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: mix(lift, 760, 300), transform: `scale(${mix(lift, 1, 0.62)})`}}>
          <LogoReveal start={0} size={210} exitAt={titleIn - 6} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <KineticText
          lines={COPY.hookIntro}
          start={16}
          stagger={4}
          size={150}
          lineHeight={1.02}
          exitAt={titleIn - 6}
          exitMode="up"
          style={{marginTop: 180}}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${push})`}}>
        <KineticText lines={[COPY.hookTitle[0]]} start={titleIn} mode="scale" size={170} dur={14} letterSpacing="-0.045em" />
        <KineticText
          lines={[COPY.hookTitle[1]]}
          start={titleIn + 6}
          mode="scale"
          size={142}
          dur={14}
          letterSpacing="-0.045em"
          style={{marginTop: 4}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
