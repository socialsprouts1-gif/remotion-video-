import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';

// RAW vs FINAL showcase for the v13 edit (Neuraxine "marketing alone is not enough" reel).
// Black stage, warm gold light, the untouched footage in a small phone behind, the finished edit in front.
export const FPS = 30;
export const DURATION = 46;
const CLIP = 44.97; // the whole edit, end card included
const RAW_LEN = 42.4;
const GOLD = '#FFC23D';
const GOLD_GRAD = 'linear-gradient(180deg, #FFE7A3 0%, #FFC23D 45%, #E59A12 100%)';
const SANS = 'InterV, "Liberation Sans", sans-serif';
const goldText: React.CSSProperties = {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const f = new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'});
  (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
  f.load().then(() => continueRender(h)).catch(() => continueRender(h));
};
loadFonts();

const m1 = (v: number) => Math.min(1, Math.max(0, v));
const sp = (t: number, at: number, stiffness = 120, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));

/** Phone with a thin bezel, glass glare and gold rim light. */
const Phone: React.FC<{x: number; y: number; w: number; h: number; t: number; glow: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, t, glow, children, style}) => {
  const g = ((t * 0.22) % 1.6) * 100;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: w * 0.11, padding: w * 0.018, boxSizing: 'border-box', background: 'linear-gradient(150deg, #3a3a3e, #0d0d0f 45%, #2a2a2e)', boxShadow: `0 60px 120px rgba(0,0,0,0.8), 0 0 ${80 * glow}px rgba(255,180,40,${0.28 * glow}), 0 0 0 1.5px rgba(255,200,90,${0.25 + 0.35 * glow}) inset`, ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.095, overflow: 'hidden', background: '#000'}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${g - 30}%, rgba(255,255,255,0.08) ${g - 14}%, transparent ${g}%)`, pointerEvents: 'none'}} />
      </div>
    </div>
  );
};

const Label: React.FC<{text: string; x: number; y: number; size: number; gold?: boolean; p: number}> = ({text, x, y, size, gold, p}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, display: 'flex', justifyContent: 'center', opacity: m1(p * 1.5), transform: `translateY(${(1 - p) * 30}px)`}}>
    <span style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: '0.04em', ...(gold ? {...goldText, filter: `drop-shadow(0 0 18px rgba(255,190,50,0.65))`} : {color: 'rgba(255,255,255,0.85)'})}}>{text}</span>
  </div>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inP = sp(t, 0, 90, 18);
  const rawIn = sp(t, 0.15, 90, 18);
  const lab = pt(t, 0.35, 1.0, ease.out);
  const cta = pt(t, 0.6, 1.3, ease.out);
  const end = pt(t, CLIP - 0.2, CLIP + 0.5, ease.inOut);
  const float = Math.sin(t * 0.9) * 8;
  // final phone geometry (front, right)
  const FW = 540, FH = Math.round(FW * 16 / 9) + 22, FX = 470, FY = 300;
  // raw phone geometry (set back in depth, left, with a clear gap)
  const RW = 300, RH = Math.round(RW * 16 / 9) + 12, RX = 70, RY = FY + 150;
  const rawFloat = Math.sin(t * 0.75 + 1.8) * 16;
  const rawEnd = pt(t, RAW_LEN - 0.4, RAW_LEN, ease.inOut);
  const sweep = ((t * 0.12) % 1) * 1400 - 200;
  return (
    <AbsoluteFill style={{background: '#030303', overflow: 'hidden'}}>
      {/* stage light: warm floor glow, a soft top cone and a slow sweeping beam */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 38% at 50% 100%, rgba(255,150,20,0.55), rgba(140,70,0,0.25) 45%, transparent 75%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 62% 30%, rgba(255,190,80,0.10), transparent 70%)'}} />
      <div style={{position: 'absolute', left: sweep, top: -200, width: 260, height: 2400, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,200,110,0.05), transparent)'}} />
      {/* fine vertical light lines like the reference */}
      {Array.from({length: 14}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 40 + i * 76, top: 1320, width: 1, height: 600, background: 'linear-gradient(180deg, transparent, rgba(255,190,80,0.16), transparent)', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + i))}} />
      ))}

      {/* RAW — floating further back: own perspective, turned toward the final phone, hazier, darker, with its own floor shadow */}
      <div style={{position: 'absolute', left: RX - 40, top: RY + RH + 150, width: RW + 80, height: 44, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.75), transparent 70%)', opacity: m1(rawIn) * (0.75 - rawFloat * 0.012), transform: `scale(${1 - rawFloat * 0.006})`}} />
      <div style={{position: 'absolute', inset: 0, perspective: 1400, perspectiveOrigin: '30% 45%', opacity: m1(rawIn * 1.5)}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateX(${(1 - m1(rawIn)) * -260}px) translateY(${rawFloat}px) translateZ(-160px) rotateY(${22 + Math.sin(t * 0.5) * 2}deg) rotateX(${3 + Math.sin(t * 0.6) * 1.5}deg)`, transformOrigin: `${RX + RW / 2}px ${RY + RH / 2}px`, filter: 'blur(0.6px) brightness(0.82) saturate(0.9)'}}>
          <Phone x={RX} y={RY} w={RW} h={RH} t={t + 3} glow={0.25}>
            <OffthreadVideo muted src={staticFile('clips/raw.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <AbsoluteFill style={{background: '#000', opacity: rawEnd * 0.6}} />
          </Phone>
          <Label text="RAW" x={RX + RW / 2} y={RY - 66} size={36} p={lab} />
        </div>
      </div>
      {/* haze between the two planes sells the distance */}
      <div style={{position: 'absolute', left: 300, top: 250, width: 260, height: 1200, background: 'linear-gradient(90deg, transparent, rgba(255,170,60,0.05), transparent)', filter: 'blur(20px)'}} />

      {/* FINAL — in front */}
      <div style={{position: 'absolute', left: FX - 40, top: FY + FH + 120, width: FW + 80, height: 60, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.85), transparent 70%)', opacity: m1(inP) * (0.85 - float * 0.01)}} />
      <div style={{position: 'absolute', inset: 0, perspective: 2200, perspectiveOrigin: '70% 45%'}}>
      <div style={{position: 'absolute', inset: 0, opacity: m1(inP * 1.5), transform: `translateY(${(1 - m1(inP)) * 300 + float}px) rotateY(${-7 + Math.sin(t * 0.45) * 1.5}deg) scale(${lerp(0.9, 1, m1(inP))})`, transformOrigin: `${FX + FW / 2}px ${FY + FH / 2}px`}}>
        <Phone x={FX} y={FY} w={FW} h={FH} t={t} glow={1}>
          <OffthreadVideo muted src={staticFile('clips/final.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{background: '#000', opacity: end * 0.45}} />
        </Phone>
        <Label text="FINAL" x={FX + FW / 2} y={FY - 92} size={58} gold p={lab} />
      </div>
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 40}px) scale(${1 + 0.04 * Math.max(0, Math.sin((t - CLIP) * 6)) * (t > CLIP ? 1 : 0)})`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: '-0.02em', ...goldText, filter: 'drop-shadow(0 0 30px rgba(255,180,40,0.55))'}}>DM me</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: 'rgba(255,255,255,0.7)', marginTop: 4}}>for edits like this</div>
      </div>

      <Audio
        src={staticFile('clips/final.mp4')}
        endAt={Math.round(CLIP * FPS)}
        volume={(f) => interpolate(f, [0, 6, (CLIP - 0.5) * FPS, CLIP * FPS], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
