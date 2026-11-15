import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';

// Editor-portfolio showcase (light, warm): RAW card and FINAL card side by side in 3D, a gold tagline band,
// a live editing timeline whose playhead tracks the video, and a DM call to action. Full v13 edit.
export const FPS = 30;
export const DURATION = 46;
const CLIP = 44.97;
const RAW_LEN = 42.4;
const SANS = 'InterV, "Liberation Sans", sans-serif';
const GOLD = '#9C7424';
const GOLD_GRAD = 'linear-gradient(180deg, #D9B15E 0%, #A97E2A 55%, #8A6418 100%)';

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
const sp = (t: number, at: number, stiffness = 110, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));

/** A video card with a gold tab, white rim and glass glare. */
const VCard: React.FC<{x: number; y: number; w: number; h: number; t: number; tab: string; tabW: number; children: React.ReactNode}> = ({x, y, w, h, t, tab, tabW, children}) => {
  const g = ((t * 0.2 + x * 0.001) % 1.6) * 100;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 34, overflow: 'hidden', background: '#000', boxShadow: '0 50px 90px rgba(90,60,20,0.35), 0 0 0 5px rgba(255,255,255,0.85)'}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${g - 30}%, rgba(255,255,255,0.12) ${g - 14}%, transparent ${g}%)`}} />
      </div>
      <div style={{position: 'absolute', left: (w - tabW) / 2, top: -26, width: tabW, height: 56, borderRadius: 12, background: GOLD_GRAD, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '0.06em', boxShadow: '0 10px 24px rgba(90,60,20,0.35)'}}>{tab}</div>
    </div>
  );
};

// ---------------------------------------------------------------- editing timeline (NLE-style), playhead follows the video
const TL_SECS = CLIP;
type Clip = {track: number; a: number; b: number; c: string};
const CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  const palette = ['#8E44D8', '#C04BD6', '#5D5CE6', '#D24F9A', '#3C8DDB'];
  // video tracks 0..4: graphics stack denser on upper tracks
  for (let tr = 0; tr < 5; tr++) {
    let x = rand(tr * 7.3) * 1.5;
    let k = 0;
    while (x < TL_SECS) {
      const len = 0.8 + rand(tr * 13.1 + k * 3.7) * (tr === 4 ? 10 : 3.2);
      const gap = rand(tr * 5.9 + k * 1.3) * (tr < 2 ? 2.2 : 0.6);
      out.push({track: tr, a: x, b: Math.min(TL_SECS, x + len), c: tr === 4 ? '#3C7DDB' : palette[(tr + k) % palette.length]});
      x += len + gap;
      k++;
    }
  }
  return out;
})();
const Timeline: React.FC<{t: number; x: number; y: number; w: number; h: number}> = ({t, x, y, w, h}) => {
  const head = 150; // track-label column
  const rulerH = 46;
  const tracks = 5, audio = 3;
  const rowH = (h - rulerH - 70) / (tracks + audio);
  const pps = (w - head - 20) / TL_SECS;
  const play = m1(t / CLIP) * TL_SECS;
  const tc = (s: number) => {
    const f = Math.floor((s % 1) * 30);
    return `00:00:${String(Math.floor(s)).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };
  const glow = 0.5 + 0.5 * Math.sin(t * 1.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, background: '#111316', boxShadow: `0 40px 80px rgba(60,40,10,0.35), 0 0 0 3px rgba(80,220,170,${0.35 + 0.35 * glow}), 0 0 ${30 + 20 * glow}px rgba(80,220,170,${0.25 + 0.2 * glow})`, overflow: 'hidden'}}>
      {/* toolbar */}
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 52, padding: '0 22px', background: '#1A1D21', borderBottom: '1px solid #262a30'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{width: 13, height: 13, borderRadius: 13, background: c}} />
        ))}
        <span style={{marginLeft: 12, fontFamily: SANS, fontWeight: 600, fontSize: 20, color: '#9aa3ad'}}>Neuraxine_v13_final.prproj</span>
        <span style={{marginLeft: 'auto', fontFamily: 'monospace', fontWeight: 700, fontSize: 24, color: '#3DE0A8'}}>{tc(play)}</span>
      </div>
      {/* ruler */}
      <div style={{position: 'absolute', left: head, right: 0, top: 52, height: rulerH, borderBottom: '1px solid #262a30'}}>
        {Array.from({length: Math.ceil(TL_SECS / 5) + 1}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: i * 5 * pps, top: 6}}>
            <div style={{width: 1, height: 14, background: '#4a5059'}} />
            <div style={{fontFamily: 'monospace', fontSize: 15, color: '#6c747e', marginTop: 2}}>{`00:${String(i * 5).padStart(2, '0')}`}</div>
          </div>
        ))}
      </div>
      {/* track labels */}
      {Array.from({length: tracks + audio}, (_, i) => {
        const isA = i >= tracks;
        const label = isA ? `A${i - tracks + 1}` : `V${tracks - i}`;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 52 + rulerH + 8 + i * rowH + (isA ? 14 : 0), width: head, height: rowH - 4, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 18, boxSizing: 'border-box', background: '#16191d', borderBottom: '1px solid #20242a'}}>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, color: isA ? '#4fd18b' : '#8f97a1'}}>{label}</span>
            <div style={{width: 16, height: 16, borderRadius: 3, border: '1.5px solid #4a5059'}} />
          </div>
        );
      })}
      {/* video clips */}
      {CLIPS.map((c, i) => {
        const top = 52 + rulerH + 8 + (tracks - 1 - c.track) * rowH;
        const reveal = m1((t * 6 - i * 0.12));
        return <div key={i} style={{position: 'absolute', left: head + c.a * pps, top: top + 3, width: Math.max(4, (c.b - c.a) * pps - 2) * reveal, height: rowH - 10, borderRadius: 4, background: c.c, opacity: 0.92, boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.18)'}} />;
      })}
      {/* audio: voice waveform, music, sfx */}
      {[0, 1, 2].map((k) => {
        const top = 52 + rulerH + 8 + (tracks + k) * rowH + 14;
        const col = ['#2FB86F', '#2A9D8F', '#9BCF53'][k];
        const n = 140;
        return (
          <div key={k} style={{position: 'absolute', left: head, top: top + 2, width: TL_SECS * pps, height: rowH - 8, borderRadius: 4, background: `${col}33`, overflow: 'hidden'}}>
            <svg width={TL_SECS * pps} height={rowH - 8} viewBox={`0 0 ${n} 100`} preserveAspectRatio="none">
              <path
                d={Array.from({length: n}, (_, i) => {
                  const a = k === 2 ? (rand(i * 3.1) > 0.8 ? 40 * rand(i) : 3) : 10 + 35 * Math.abs(Math.sin(i * (k ? 0.21 : 0.9)) * (0.5 + rand(i * 1.7 + k)));
                  return `M${i + 0.5} ${50 - a} L${i + 0.5} ${50 + a}`;
                }).join(' ')}
                stroke={col}
                strokeWidth={0.55}
              />
            </svg>
          </div>
        );
      })}
      {/* playhead */}
      <div style={{position: 'absolute', left: head + play * pps - 1, top: 52, width: 2, bottom: 0, background: '#3DE0A8', boxShadow: '0 0 12px #3DE0A8'}}>
        <div style={{position: 'absolute', left: -11, top: 0, width: 24, height: 22, borderRadius: '4px 4px 12px 12px', background: '#3DE0A8'}} />
      </div>
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inF = sp(t, 0, 80, 18);
  const inR = sp(t, 0.15, 80, 18);
  const band = pt(t, 0.4, 1.1, ease.out);
  const tl = sp(t, 0.55, 80, 20);
  const handle = 'NEURAXINE';
  const typed = handle.slice(0, Math.floor(m1((t - 0.8) / 1.0) * handle.length));
  const rawEnd = pt(t, RAW_LEN - 0.4, RAW_LEN, ease.inOut);
  const fR = Math.sin(t * 0.8 + 1.7) * 10, fF = Math.sin(t * 0.7) * 8;
  const dm = 1 + 0.035 * Math.sin(t * 3);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #EAD9B8 0%, #F3E8D3 45%, #F6EEDF 100%)', overflow: 'hidden'}}>
      {/* soft light */}
      <div style={{position: 'absolute', left: 300 + Math.sin(t * 0.2) * 80, top: -300, width: 1100, height: 1100, borderRadius: 1100, background: 'radial-gradient(circle, rgba(255,250,235,0.85), transparent 62%)'}} />
      <div style={{position: 'absolute', left: -300, top: 600, width: 900, height: 900, borderRadius: 900, background: 'radial-gradient(circle, rgba(201,160,90,0.25), transparent 65%)'}} />

      {/* logo */}
      <div style={{position: 'absolute', left: 54, top: 54, display: 'flex', alignItems: 'center', gap: 14, opacity: pt(t, 0.2, 0.8)}}>
        <div style={{width: 96, height: 70, display: 'grid', placeItems: 'center', borderRadius: 16, background: '#141414'}}>
          <Img src={staticFile('brand/nx-logo.png')} style={{width: 74, height: 54}} />
        </div>
      </div>

      {/* the two cards, in 3D */}
      <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 35%'}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateX(${(1 - m1(inR)) * -300}px) translateY(${fR}px) rotateY(${16 + Math.sin(t * 0.5) * 1.5}deg)`, transformOrigin: '270px 680px', opacity: m1(inR * 1.5)}}>
          <VCard x={60} y={300} w={410} h={729} t={t} tab="RAW" tabW={130}>
            <OffthreadVideo muted src={staticFile('clips/raw.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)'}} />
            <AbsoluteFill style={{background: '#000', opacity: rawEnd * 0.5}} />
          </VCard>
        </div>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateX(${(1 - m1(inF)) * 300}px) translateY(${fF}px) rotateY(${-10 + Math.sin(t * 0.45) * 1.5}deg)`, transformOrigin: '760px 680px', opacity: m1(inF * 1.5)}}>
          <VCard x={500} y={200} w={520} h={924} t={t} tab="FINAL" tabW={180}>
            <OffthreadVideo muted src={staticFile('clips/final.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </VCard>
        </div>
      </div>
      {/* handle typing under the raw card */}
      <div style={{position: 'absolute', left: 70, top: 1075, width: 400, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 38, color: '#3a2c14', letterSpacing: '0.04em'}}>
        {typed}
        <span style={{opacity: typed.length < handle.length && Math.sin(t * 12) > 0 ? 1 : 0, color: GOLD}}>|</span>
      </div>

      {/* gold tagline band */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, height: 80, background: GOLD_GRAD, display: 'grid', placeItems: 'center', transform: `scaleX(${band})`, transformOrigin: '0 50%', boxShadow: '0 12px 30px rgba(90,60,20,0.25)'}}>
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: '#fff', opacity: pt(t, 0.9, 1.4)}}>
          Turn your raw videos into a <b style={{fontWeight: 800}}>premium masterpiece.</b>
        </span>
      </div>

      {/* timeline */}
      <div style={{opacity: m1(tl * 1.5), transform: `translateY(${(1 - m1(tl)) * 120}px)`}}>
        <Timeline t={t} x={50} y={1290} w={980} h={430} />
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1755, textAlign: 'center', opacity: pt(t, 0.9, 1.5), transform: `scale(${dm})`}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: '0.02em', background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(120,80,20,0.25))'}}>DM NOW!</span>
      </div>

      <Audio src={staticFile('clips/final.mp4')} volume={(f) => interpolate(f, [0, 6, (CLIP - 0.4) * FPS, CLIP * FPS + 15], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};

export {lerp};
