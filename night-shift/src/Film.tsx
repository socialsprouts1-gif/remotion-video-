import React, {useState} from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {AUDIO, BRAND} from './config';
import {B, FPS} from './timeline';
import {C, FONT} from './theme';
import {ease, lerp, pt, rand} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {Chat} from './components/Chat';
import {Dial, EventCards, geom} from './components/Dial';
import {Icon} from './components/Icons';
import {Lens, Words} from './components/Type';

const STARS = Array.from({length: 90}, (_, i) => ({x: rand(i * 3.1) * 1080, y: rand(i * 5.7) * 1920, r: 0.8 + rand(i * 9.3) * 1.8, ph: rand(i) * 6}));

/** Night sky that slowly gives way as the dial moves into the day. */
const Sky: React.FC<{t: number}> = ({t}) => {
  const nightness = 1 - 0.65 * pt(t, 15, 19) + 0.65 * pt(t, 22, 26);
  const moon = pt(t, 0.8, 2.4) * (1 - pt(t, 13.6, 14.6));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 80% at 50% 30%, ${C.bg2} 0%, ${C.bg} 70%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y - t * 4 * (0.3 + s.r / 3)} r={s.r} fill={i % 11 === 0 ? C.lime : C.metal} opacity={(0.25 + 0.35 * Math.sin(t * 1.4 + s.ph) ** 2) * nightness * pt(t, 0, 1.5)} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 840, top: 120, opacity: moon * 0.85, filter: `drop-shadow(0 0 24px rgba(${C.limeRGB},0.35))`}}>
        <Icon name="moon" size={92} color={C.metal} stroke={1.4} />
      </div>
    </AbsoluteFill>
  );
};

/** The opening time. Huge in the dark, then it steps up to sit above the chat. */
const Clock: React.FC<{t: number}> = ({t}) => {
  if (t < B.clockIn - 0.05 || t > B.toDial[0] + 0.8) return null;
  const a = pt(t, B.clockIn, B.clockIn + 0.9);
  const up = pt(t, B.clockUp[0], B.clockUp[1], ease.inOut);
  const out = pt(t, B.toDial[0], B.toDial[0] + 0.6, ease.in);
  const blink = Math.floor(t * 1.6) % 2 === 0 ? 1 : 0.25;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: lerp(860, 250, up),
        transform: `translateY(-50%) scale(${lerp(lerp(1.15, 1, a), 0.36, up)})`,
        opacity: a * (1 - out),
        filter: `blur(${(1 - a) * 18 + out * 10}px)`,
        textAlign: 'center',
        fontFamily: FONT,
        color: C.white,
      }}
    >
      <span style={{fontSize: 250, fontWeight: 700, letterSpacing: '-0.03em'}}>
        2<span style={{opacity: blink, color: C.lime}}>:</span>14
      </span>
      <span style={{fontSize: 80, fontWeight: 600, color: C.grey, marginLeft: 22}}>AM</span>
    </div>
  );
};

const Final: React.FC<{t: number}> = ({t}) => {
  if (t < B.toLogo[0]) return null;
  const g = geom(t);
  const lg = pt(t, B.toLogo[0] + 0.6, B.toLogo[1] + 0.3);
  const sweep = pt(t, B.toLogo[1], B.toLogo[1] + 1.1, ease.inOut);
  const cta = pt(t, B.cta, B.cta + 0.7);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: g.cx - 235,
          top: g.cy - 235,
          width: 470,
          height: 470,
          opacity: lg,
          transform: `scale(${lerp(0.8, 1, lg)})`,
          filter: `blur(${(1 - lg) * 12}px)`,
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(circle, black 52%, transparent 70%)',
          maskImage: 'radial-gradient(circle, black 52%, transparent 70%)',
        }}
      >
        <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
            transform: `translateX(${lerp(-70, 70, sweep)}%)`,
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        />
      </div>
      <Words t={t} text="Your business," at={B.awake247} size={88} y={1140} />
      <Words t={t} text="*awake 24/7.*" at={B.awake247 + 0.25} size={118} y={1265} stagger={0.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1470, textAlign: 'center', fontFamily: FONT, opacity: cta, transform: `translateY(${(1 - cta) * 18}px)`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 600, letterSpacing: '0.32em', color: C.white}}>
          <span style={{width: 11, height: 11, borderRadius: 11, background: C.lime, boxShadow: `0 0 14px ${C.lime}`}} />
          {BRAND.name}
        </div>
        <div style={{fontSize: 26, fontWeight: 500, color: C.grey, marginTop: 14, letterSpacing: '0.04em'}}>{BRAND.sub}</div>
      </div>
    </>
  );
};

/** Gentle dolly: each chapter slowly pushes in, and the transitions settle back. */
const stageScale = (t: number) =>
  1.0 +
  0.05 * pt(t, 0, 3, ease.soft) -
  0.05 * pt(t, 3, 3.8, ease.inOut) +
  0.03 * pt(t, 4, 13.6, ease.soft) -
  0.03 * pt(t, 13.6, 15, ease.inOut) +
  0.03 * pt(t, 15, 26, ease.soft) -
  0.03 * pt(t, 26, 29.6, ease.inOut) +
  0.025 * pt(t, 31, 37, ease.soft);

export const Film: React.FC = () => {
  useState(() => loadFonts());
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // "You're asleep": the whole world dims except the line itself
  const sleep = pt(t, B.dim[0], B.dim[1]) * (1 - pt(t, B.wake, B.wake + 0.5));

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `scale(${stageScale(t)})`, filter: sleep > 0.01 ? `brightness(${1 - sleep * 0.6})` : undefined}}>
        <Sky t={t} />
        <Clock t={t} />
        <Dial t={t} />
        <Chat t={t} />
        <EventCards t={t} />
        <Final t={t} />
      </AbsoluteFill>

      <Words t={t} text="You're asleep." at={B.asleep[0]} out={B.asleep[1] - 0.3} size={92} y={470} />
      <Words t={t} text="Your business *isn't.*" at={B.awakeText[0]} out={B.awakeText[1] - 0.3} size={80} y={470} />
      <Words t={t} text="Every message." at={B.every1} out={B.everyOut} size={84} y={300} />
      <Words t={t} text="*Answered.*" at={B.every1 + 0.2} out={B.everyOut} size={84} y={405} />
      <Words t={t} text="Every lead." at={B.every2} out={B.everyOut} size={84} y={560} />
      <Words t={t} text="*Followed up.*" at={B.every2 + 0.2} out={B.everyOut} size={84} y={665} />

      <Lens t={t} />
      <Audio src={staticFile(AUDIO.score)} volume={AUDIO.scoreVolume * (AUDIO.voiceover ? AUDIO.duckUnderVoice : 1)} />
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
    </AbsoluteFill>
  );
};
