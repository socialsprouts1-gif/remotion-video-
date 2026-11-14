import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';

// Before/after reel for the Neuraxine "automate" edit (edit14 v6), in the layout of the earlier before/after reel:
// dark backdrop with fine vertical lines and a warm glow, a small RAW card behind a larger FINAL card, both playing the
// same moment in sync, "DM me" at the bottom. RAW = the original footage (only converted from HDR); FINAL = v6 with audio.
const FPS = 30;
const SANS = 'Geist, sans-serif';
const Y = '#FFD21F';

let loaded = false;
if (!loaded && typeof document !== 'undefined') {
  loaded = true;
  const h = delayRender('fonts');
  const f = new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'});
  (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
  f.load().then(() => continueRender(h)).catch(() => continueRender(h));
}

// moments with the biggest difference between raw and final (seconds in the edit's own timeline)
const SEGS: [number, number][] = [
  [0.0, 6.6], // "2026" behind him, the Socho 3D scene, the day timeline starts
  [16.1, 20.2], // "repetitive" scene, giant AI behind him, tasks collapse into AI, robot scene
  [26.0, 29.3], // Neuraxine logo scene, NEURAXINE behind him, "We help"
  [35.5, 39.4], // comment bubble, AUTOMATE typed behind him, guide sent to DM
];
const START_F = SEGS.map((_, i) => Math.round(SEGS.slice(0, i).reduce((s, [a, b]) => s + (b - a), 0) * FPS));
const OUTRO = 0;
export const TOTAL = Math.round((SEGS.reduce((s, [a, b]) => s + (b - a), 0) + OUTRO) * FPS);

const FINAL = {x: 395, y: 382, w: 566, h: 1006};
const RAW = {x: 96, y: 632, w: 300, h: 533};

const Card: React.FC<{r: typeof FINAL; src: string; muted: boolean; rot: number; enter: number; dx: number}> = ({r, src, muted, rot, enter, dx}) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.w,
      height: r.h,
      borderRadius: 40,
      overflow: 'hidden',
      background: '#111',
      boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(255,255,255,0.08)',
      transform: `translateX(${(1 - enter) * dx}px) rotate(${rot * (1 - enter)}deg) scale(${lerp(0.9, 1, enter)})`,
      opacity: enter,
    }}
  >
    {SEGS.map(([a, b], i) => {
      const dur = Math.round((b - a) * FPS);
      return (
        <Sequence key={i} from={START_F[i]} durationInFrames={dur} layout="none">
          <OffthreadVideo
            src={staticFile(src)}
            muted={muted}
            startFrom={Math.round(a * FPS)}
            // short fades so the audio never clicks between moments
            volume={(f) => (muted ? 0 : interpolate(f, [0, 4, dur - 4, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </Sequence>
      );
    })}
  </div>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const total = TOTAL / FPS;
  const smooth = Easing.bezier(0.22, 1, 0.36, 1);
  const inR = pt(t, 0.0, 0.55, smooth);
  const inF = pt(t, 0.08, 0.65, smooth);
  const label = pt(t, 0.3, 0.8, smooth);
  const glow = 0.85 + 0.15 * Math.sin(t * 2.4);
  // a quick flash on each jump between moments, so the change reads as intentional
  const flash = Math.max(0, ...START_F.slice(1).map((f) => (frame >= f - 2 && frame < f + 4 ? 1 - Math.abs(frame - f) / 4 : 0)));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #000 0%, #050403 45%, #1A1004 75%, #3A2408 100%)'}}>
      {/* fine vertical lines */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
        {Array.from({length: 36}, (_, i) => (
          <line key={i} x1={15 + i * 30} y1={0} x2={15 + i * 30} y2={1920} stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />
        ))}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 30% at 50% 100%, rgba(255,160,20,0.35), transparent 70%)', opacity: glow}} />

      <Card r={RAW} src="clips/raw.mp4" muted rot={-8} enter={inR} dx={-200} />
      <Card r={FINAL} src="clips/final.mp4" muted={false} rot={6} enter={inF} dx={220} />
      <AbsoluteFill style={{background: '#FFF6D8', opacity: flash * 0.07, mixBlendMode: 'screen'}} />

      <div style={{position: 'absolute', left: RAW.x, width: RAW.w, top: RAW.y - 66, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: '0.02em', opacity: label}}>RAW</div>
      <div style={{position: 'absolute', left: FINAL.x, width: FINAL.w, top: FINAL.y - 108, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 82, color: Y, letterSpacing: '0.01em', opacity: label, textShadow: `0 0 ${24 * glow}px rgba(255,200,30,0.55)`}}>FINAL</div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center', opacity: pt(t, 0.5, 1.0, smooth), transform: `translateY(${(1 - pt(t, 0.5, 1.0, smooth)) * 30}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: '-0.035em', lineHeight: 1, color: Y, textShadow: `0 0 ${30 * glow}px rgba(255,190,20,0.45)`}}>DM me</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 44, color: 'rgba(255,255,255,0.85)', marginTop: 12}}>Neuraxine</div>
      </div>
      {/* fade out on the last moment */}
      <AbsoluteFill style={{background: '#000', opacity: pt(t, total - 0.4, total)}} />
    </AbsoluteFill>
  );
};
