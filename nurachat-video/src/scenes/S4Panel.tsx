import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {COPY, PANEL_TOUR, SCREENS} from '../config';
import {Callout, CamKey, Cursor, DashboardZoom, fitCam, Highlight, Step} from '../components/DashboardZoom';
import {KineticText, Kicker} from '../components/KineticText';
import {ScreenReveal} from '../components/ScreenReveal';

const SCREEN = SCREENS.integrations;
const CENTER_Y = 885;
const STEP_AT = [62, 100, 138, 176];

/** 13.5–20.5s. The real dashboard tilts in, the camera dives to the sidebar and a spotlight walks the features. */
export const S4Panel: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const overview = fitCam(SCREEN.w, SCREEN.h, 1000);
  const sidebar = {cx: 435, cy: 600, s: 1.15, vw: 1000, vh: 1060};
  const keys: CamKey[] = [
    {f: 0, ...overview},
    {f: 32, ...overview},
    {f: 58, ...sidebar},
  ];
  const steps: Step[] = PANEL_TOUR.map((t, i) => ({f: STEP_AT[i], rect: t.rect, label: t.label}));
  const endAt = durationInFrames - 14;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
          <Kicker text={COPY.panelKicker} start={4} />
          <KineticText lines={[COPY.panelTitle]} start={8} size={86} weight={800} />
        </div>
      </AbsoluteFill>

      <ScreenReveal start={0} dur={30} from={{y: 460, s: 0.78, rx: 32, o: 0}} originY={CENTER_Y}>
        <DashboardZoom
          screen={SCREEN}
          keys={keys}
          centerY={CENTER_Y}
          imageLayer={(cam) => (
            <>
              <Highlight id="panel-hl" steps={steps} w={SCREEN.w} h={SCREEN.h} s={cam.s} endAt={endAt} />
              <Cursor
                s={cam.s}
                endAt={endAt}
                points={steps.map((st) => ({f: st.f + 4, x: 118, y: (st.rect[1] + st.rect[3]) / 2 + 4}))}
              />
            </>
          )}
          cardLayer={(cam) => <Callout cam={cam} steps={steps} endAt={endAt} />}
        />
      </ScreenReveal>
    </AbsoluteFill>
  );
};
