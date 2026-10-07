import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {COPY, DEMO_CHATBOTS, DEMO_INTEGRATIONS, SCENES, SCREENS} from '../config';
import {Callout, CamKey, Cursor, DashboardZoom, fitCam, Highlight, Step} from '../components/DashboardZoom';
import {KineticText, Kicker} from '../components/KineticText';
import {ScreenReveal} from '../components/ScreenReveal';

const CENTER_Y = 880;
const SHOT_B = 160; // frame the integrations screen takes over

const Title: React.FC<{text: string; exitAt?: number}> = ({text, exitAt}) => (
  <AbsoluteFill style={{alignItems: 'center'}}>
    <div style={{position: 'absolute', top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <Kicker text={COPY.demoKicker} start={2} exitAt={exitAt} />
      <KineticText lines={[text]} start={6} size={86} weight={800} exitAt={exitAt} />
    </div>
  </AbsoluteFill>
);

/** Shot A: the chatbot list — ready bots, then "Build with AI". */
const ChatbotsShot: React.FC = () => {
  const S = SCREENS.chatbots;
  const rows = {cx: 740, cy: 745, s: 1.3, vw: 1000, vh: 1000};
  const buttons = {cx: 1000, cy: 560, s: 1.3, vw: 1000, vh: 1000};
  const keys: CamKey[] = [
    {f: 0, ...fitCam(S.w, S.h, 1000)},
    {f: 24, ...fitCam(S.w, S.h, 1000)},
    {f: 44, ...rows},
    {f: 104, ...rows},
    {f: 124, ...buttons},
  ];
  const at = [46, 84, 128];
  const steps: Step[] = DEMO_CHATBOTS.map((d, i) => ({f: at[i], rect: d.rect, label: d.label, side: d.side}));
  const end = SHOT_B - 6;

  return (
    <>
      <Title text={COPY.demoTitleA} exitAt={SHOT_B - 8} />
      <ScreenReveal
        start={0}
        dur={28}
        from={{x: 0, y: 420, s: 0.8, rx: 28, o: 0}}
        exitAt={SHOT_B - 12}
        exitDur={16}
        to={{x: -760, s: 0.86, ry: 28, o: 0}}
        originY={CENTER_Y}
      >
        <DashboardZoom
          screen={S}
          keys={keys}
          centerY={CENTER_Y}
          imageLayer={(cam) => (
            <>
              <Highlight id="demo-a" steps={steps} w={S.w} h={S.h} s={cam.s} endAt={end} />
              <Cursor
                s={cam.s}
                endAt={end}
                points={steps.map((st) => ({
                  f: st.f + 4,
                  x: st.rect[0] + Math.min(220, (st.rect[2] - st.rect[0]) * 0.45),
                  y: (st.rect[1] + st.rect[3]) / 2 + 6,
                }))}
              />
            </>
          )}
          cardLayer={(cam) => <Callout cam={cam} steps={steps} endAt={end} />}
        />
      </ScreenReveal>
    </>
  );
};

/** Shot B: integrations — WhatsApp Business connected, then the automation apps. */
const IntegrationsShot: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const S = SCREENS.integrations;
  const card = {cx: 628, cy: 400, s: 1.5, vw: 1000, vh: 900};
  const apps = {cx: 1164, cy: 630, s: 0.62, vw: 1000, vh: 620};
  const keys: CamKey[] = [
    {f: 0, ...card},
    {f: 50, ...card},
    {f: 74, ...apps},
  ];
  const at = [22, 76];
  const steps: Step[] = DEMO_INTEGRATIONS.map((d, i) => ({f: at[i], rect: d.rect, label: d.label, side: d.side}));
  const end = durationInFrames - 12;

  return (
    <>
      <Title text={COPY.demoTitleB} />
      <ScreenReveal start={0} dur={26} from={{x: 760, s: 0.86, ry: -28, o: 0}} originY={CENTER_Y}>
        <DashboardZoom
          screen={S}
          keys={keys}
          centerY={CENTER_Y}
          imageLayer={(cam) => (
            <>
              <Highlight id="demo-b" steps={steps} w={S.w} h={S.h} s={cam.s} endAt={end} />
              <Cursor
                s={cam.s}
                endAt={end}
                points={[
                  {f: at[0] + 4, x: 790, y: 192},
                  {f: at[1] + 4, x: 560, y: 760},
                ]}
              />
            </>
          )}
          cardLayer={(cam) => <Callout cam={cam} steps={steps} endAt={end} />}
        />
      </ScreenReveal>
    </>
  );
};

/** 27.5–36.5s. Mini walkthrough across two real screens. */
export const S6Demo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={SHOT_B + 4} name="chatbots">
      <ChatbotsShot />
    </Sequence>
    <Sequence from={SHOT_B - 6} durationInFrames={SCENES.demo.dur - (SHOT_B - 6)} name="integrations">
      <IntegrationsShot />
    </Sequence>
  </AbsoluteFill>
);
