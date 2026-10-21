import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ease, lerp, pt} from './anim';
import {loadFonts, SANS, SERIF} from './fonts';
import {C, Rule, Title} from './Type';
import {Heritage} from './Heritage';
import {END_D, FRONT_D, Scene3D, STYLE_NAMES} from './Scene3D';
import {anchors, FRAMES} from './three/Eyewear';
import story from './story.json';

loadFonts();

const W = 1080;
const H = 1920;
const FOV = 22;
/** px per world unit for a front-on camera at distance d. */
const kAt = (d: number) => H / 2 / (d * Math.tan(((FOV / 2) * Math.PI) / 180));

export type FilmProps = {logoSrc?: string | null; withAudio?: boolean};

const STYLE_LABELS = ['Modern', 'Classic', 'Minimal', 'Bold'];

/** Light beam from above that discovers the frame in the dark. */
const Beam: React.FC<{t: number}> = ({t}) => {
  const o = pt(t, 0.2, 1.3, ease.inOut) * (1 - 0.55 * pt(t, 3.2, 5.4, ease.inOut));
  if (o <= 0) return null;
  const sway = lerp(-7, 0, pt(t, 0, 3.2, ease.soft));
  return (
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: o}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: -80,
          height: 1300,
          transformOrigin: '50% 0',
          transform: `rotate(${sway}deg)`,
          background: 'linear-gradient(to bottom, rgba(255,238,210,0.42), rgba(255,226,180,0.10) 70%, rgba(255,226,180,0))',
          clipPath: 'polygon(45% 0, 55% 0, 88% 100%, 12% 100%)',
          filter: 'blur(34px)',
        }}
      />
      <div style={{position: 'absolute', left: 140, top: 760, width: 800, height: 420, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,226,180,0.16), transparent)'}} />
    </div>
  );
};

/** Lens-inspired rings (barrel markings, aperture) while the camera sits inside the lens. */
const LensRings: React.FC<{t: number}> = ({t}) => {
  const o = pt(t, 10.05, 10.6, ease.out) * (1 - pt(t, 11.5, 12.15, ease.in));
  if (o <= 0) return null;
  const r = t - 10;
  const s = lerp(0.92, 1.3, pt(t, 10, 12.2, ease.inOut));
  const ticks = Array.from({length: 120}, (_, i) => {
    const a = (i / 120) * Math.PI * 2;
    const l = i % 10 === 0 ? 22 : i % 5 === 0 ? 14 : 8;
    return `M${Math.cos(a) * 400} ${Math.sin(a) * 400} L${Math.cos(a) * (400 - l)} ${Math.sin(a) * (400 - l)}`;
  }).join(' ');
  const blades = Array.from({length: 8}, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + r * 0.5;
    const rr = lerp(120, 250, pt(t, 10.2, 11.4, ease.inOut));
    return `M${Math.cos(a) * rr} ${Math.sin(a) * rr} L${Math.cos(a + 0.95) * rr * 1.25} ${Math.sin(a + 0.95) * rr * 1.25}`;
  }).join(' ');
  const draw = pt(t, 10.05, 11.0, ease.inOut);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <g transform={`translate(540 960) scale(${s})`} fill="none" stroke={C.gold}>
        <circle r={470} strokeWidth={1.2} opacity={0.5} pathLength={1} strokeDasharray={`${draw} 1`} transform="rotate(-90)" />
        <g transform={`rotate(${r * 14})`}>
          <path d={ticks} strokeWidth={1.4} opacity={0.75} />
        </g>
        <circle r={330} strokeWidth={1} opacity={0.4} strokeDasharray="2 10" transform={`rotate(${-r * 22})`} />
        <path d={blades} strokeWidth={1.2} opacity={0.6} />
        <circle r={60} strokeWidth={1} opacity={0.6} />
        <path d="M-90 0 H-20 M20 0 H90 M0 -90 V-20 M0 20 V90" strokeWidth={1} opacity={0.7} />
      </g>
    </svg>
  );
};

/** Technical measurement lines over the front-on frame. */
const Dims: React.FC<{t: number}> = ({t}) => {
  const o = 1 - pt(t, 15.55, 15.95, ease.in);
  if (t < 13.85 || o <= 0) return null;
  const s = FRAMES.hero;
  const {cx} = anchors(s);
  const k = kAt(FRONT_D);
  const X = (x: number) => 540 + x * k;
  const Y = (y: number) => 960 - y * k;
  const d1 = pt(t, 13.9, 14.6, ease.inOut);
  const d2 = pt(t, 14.15, 14.85, ease.inOut);
  const d3 = pt(t, 14.35, 15.0, ease.inOut);
  const lbl = (p: number): React.CSSProperties => ({position: 'absolute', fontFamily: SANS, fontWeight: 400, fontSize: 26, letterSpacing: '0.12em', color: C.gold, opacity: p, transform: 'translateX(-50%)'});
  const lw = {x0: X(cx - s.a), x1: X(cx + s.a), y: Y(-s.b - 0.42)};
  const bw = {x0: X(-(cx - s.a)), x1: X(cx - s.a), y: Y(s.b + 0.58)};
  const seg = (x0: number, x1: number, y: number, p: number) => {
    const m = (x0 + x1) / 2;
    const h = ((x1 - x0) / 2) * p;
    return `M${m - h} ${y} H${m + h} M${x0} ${y - 12 * p} V${y + 12 * p} M${x1} ${y - 12 * p} V${y + 12 * p}`;
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}} fill="none" stroke={C.gold}>
        <path d={`M${lerp(540, 60, d1)} 960 H${lerp(540, 1020, d1)}`} strokeWidth={1} strokeDasharray="3 9" opacity={0.55} />
        <path d={seg(lw.x0, lw.x1, lw.y, d2)} strokeWidth={1.4} />
        <path d={seg(bw.x0, bw.x1, bw.y, d3)} strokeWidth={1.4} />
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${X(sx * cx)} 960)`} opacity={d1}>
            <circle r={14 * d1} strokeWidth={1.2} />
            <path d="M-26 0 H-6 M6 0 H26 M0 -26 V-6 M0 6 V26" strokeWidth={1.2} />
          </g>
        ))}
      </svg>
      <div style={{...lbl(d2), left: (lw.x0 + lw.x1) / 2, top: lw.y + 16}}>52 mm</div>
      <div style={{...lbl(d3), left: (bw.x0 + bw.x1) / 2, top: bw.y - 46}}>18 mm</div>
      <div style={{...lbl(pt(t, 14.7, 15.3)), left: 540, top: 1262, fontSize: 30, letterSpacing: '0.3em', color: C.ivory}}>
        52 <span style={{display: 'inline-block', width: 20, height: 20, border: `1.5px solid ${C.gold}`, verticalAlign: '-1px', margin: '0 10px'}} /> 18 — 145
      </div>
    </div>
  );
};

/** Style names for the boutique row. */
const StyleLabel: React.FC<{t: number}> = ({t}) => {
  const TA = story.styleAt;
  return (
    <>
      {STYLE_NAMES.map((_, k) => {
        const a = TA[k] + (k === 0 ? 0.25 : 0.05);
        const b = k < 3 ? TA[k + 1] - 0.5 : 21.35;
        return (
          <React.Fragment key={k}>
            <Title t={t} at={a} out={b} text={`0${k + 1}`} y={1392} size={24} font="sans" track={0.4} color={C.gold} stagger={0.05} />
            <Title t={t} at={a + 0.08} out={b} text={STYLE_LABELS[k]} y={1428} size={68} weight={300} track={0.32} upper stagger={0.04} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Diagonal specular sweep. */
const Sweep: React.FC<{t: number; a: number; b: number; top: number; height: number; strength?: number}> = ({t, a, b, top, height, strength = 0.28}) => {
  if (t < a || t > b) return null;
  const p = pt(t, a, b, ease.inOut);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, height, overflow: 'hidden', mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -200, height: height + 400, width: 220, left: lerp(-400, 1300, p), transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, rgba(255,240,215,${strength}), transparent)`, filter: 'blur(12px)'}} />
    </div>
  );
};

const EndCard: React.FC<{t: number; logoSrc?: string | null}> = ({t, logoSrc}) => {
  if (t < 30.9) return null;
  const wm = pt(t, 31.1, 32.2, ease.out);
  const sweep = pt(t, 32.0, 33.0, ease.inOut);
  const markTop = 905;
  return (
    <>
      {logoSrc ? (
        <Img src={staticFile(logoSrc)} style={{position: 'absolute', left: 240, width: 600, top: 860, height: 240, objectFit: 'contain', opacity: wm, filter: `blur(${(1 - wm) * 10}px)`}} />
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: markTop,
              textAlign: 'center',
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: `${lerp(0.5, 0.3, wm)}em`,
              paddingLeft: `${lerp(0.5, 0.3, wm)}em`,
              color: C.ivory,
              opacity: wm,
              filter: `blur(${(1 - wm) * 14}px)`,
            }}
          >
            SADORI
          </div>
          {/* light sweep through the wordmark */}
          {sweep > 0 && sweep < 1 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: markTop,
                textAlign: 'center',
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 150,
                lineHeight: 1,
                letterSpacing: '0.3em',
                paddingLeft: '0.3em',
                color: 'transparent',
                backgroundImage: `linear-gradient(105deg, transparent ${sweep * 140 - 30}%, rgba(255,232,190,0.95) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              SADORI
            </div>
          )}
          <Rule t={t} at={31.55} out={99} y={1088} w={240} />
          <Title t={t} at={31.6} out={99} text="EYEWEAR" y={1110} size={30} font="sans" weight={300} track={0.9} color={C.gold} stagger={0.05} />
        </>
      )}
      <Title t={t} at={32.15} out={99} text="Eyewear Is Personal." y={1228} size={62} italic weight={300} track={0.02} stagger={0.03} />
      <Title t={t} at={33.0} out={99} text="Visit Us in Akola" y={1420} size={31} font="sans" weight={400} track={0.16} stagger={0.02} />
      <Title t={t} at={33.25} out={99} text="Discover Your Perfect Frame" y={1468} size={31} font="sans" weight={400} track={0.16} stagger={0.02} />
      <Rule t={t} at={33.45} out={99} y={1548} w={120} />
      <Title t={t} at={33.55} out={99} text="www.sadori.in" y={1574} size={36} font="sans" weight={500} track={0.14} color={C.gold} stagger={0.025} />
    </>
  );
};

export const Film: React.FC<FilmProps> = ({logoSrc = null, withAudio = true}) => {
  const frame = useCurrentFrame();
  const t = frame / story.fps;
  const cuts = story.cuts;

  // dip to black on every cut (longer, softer into and out of the heritage section)
  let dip = 0;
  cuts.forEach((c) => {
    const w = c === 23.0 || c === 28.0 ? 0.32 : 0.12;
    dip = Math.max(dip, 1 - Math.min(1, Math.abs(t - c) / w));
  });
  dip = Math.max(dip, 1 - pt(t, 0, 0.3));

  const story3d = t >= 23 && t < 28;

  return (
    <AbsoluteFill style={{background: '#030303', fontFamily: SANS}}>
      {/* warm backdrop */}
      <AbsoluteFill style={{background: story3d ? 'radial-gradient(ellipse at 50% 50%, #17130f 0%, #050404 70%)' : 'radial-gradient(ellipse at 50% 46%, #1d1813 0%, #0a0806 45%, #020202 80%)', opacity: lerp(0.15, 1, pt(t, 0.4, 3.0, ease.inOut))}} />
      {t < 5.6 && <Beam t={t} />}
      {!story3d && (
        <ThreeCanvas width={W} height={H} gl={{antialias: true, alpha: true}} style={{position: 'absolute', inset: 0}}>
          <Scene3D t={t} />
        </ThreeCanvas>
      )}
      {story3d && <Heritage t={t} t0={23} />}

      {/* ---- typography ---- */}
      <Title t={t} at={1.9} out={3.9} text="VISION, REDEFINED." y={1360} size={70} weight={400} track={0.22} stagger={0.045} />
      <Title t={t} at={8.75} out={9.95} text="Style Meets Clarity." y={1400} size={80} italic weight={300} track={0.01} stagger={0.03} />
      <LensRings t={t} />
      <Dims t={t} />
      <Title t={t} at={14.45} out={15.95} text="Precision in Every Detail." y={1400} size={70} italic weight={300} track={0.01} stagger={0.028} />
      {t >= 16 && t < 23 && <StyleLabel t={t} />}
      <Title t={t} at={21.7} out={22.95} text="Find the Frame" y={300} size={80} weight={300} track={0.02} stagger={0.03} />
      <Title t={t} at={21.95} out={22.95} text="That Feels Like You." y={392} size={80} italic weight={300} track={0.01} stagger={0.03} />
      <Title t={t} at={25.0} out={27.75} text="Rooted in Akola." y={1300} size={74} weight={300} track={0.02} stagger={0.03} />
      <Title t={t} at={25.9} out={27.75} text="Crafted Around You." y={1392} size={74} italic weight={300} track={0.01} stagger={0.03} />
      <Sweep t={t} a={29.85} b={30.75} top={600} height={720} strength={0.22} />
      <EndCard t={t} logoSrc={logoSrc} />

      {/* ---- finish: vignette, grain, cut dips ---- */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}>
        <svg width={W} height={H}>
          <filter id="g">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} />
          </filter>
          <rect width={W} height={H} filter="url(#g)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: dip}} />
      {withAudio && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};

export {END_D};
