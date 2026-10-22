import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {loadFonts} from '../ui';
import {C, FONT, Kinetic, Pill, sp, Stage, Tr, trStyle, WORDS, Word} from './kit';
import {SCENES} from './Scenes';
import pro from '../pro.json';

loadFonts();

const FPS = pro.fps;
const FF = pro.ff as {scene: string; a: number; b: number; clip: number}[];
const TRS: Tr[] = ['zoom', 'iris', 'glitch', 'slide', 'iris', 'flash', 'zoom', 'iris'];
const PUNCH = pro.punch as number[];
const SLAM = pro.slam as {t: number; text: string; tone: string}[];

/** Face segments = everything not covered by a full-frame scene. */
const FACE: [number, number][] = (() => {
  const out: [number, number][] = [];
  let cur = 0;
  FF.forEach((f) => {
    if (f.a > cur + 0.05) out.push([cur, f.a]);
    cur = f.b;
  });
  if (cur < pro.speech) out.push([cur, pro.speech]);
  return out;
})();

// ---------------------------------------------------------------- speaker
const Speaker: React.FC<{t: number; pip?: boolean}> = ({t, pip}) => {
  const seg = FACE.findIndex(([a, b]) => t >= a - 0.4 && t < b + 0.4);
  const [sa, sb] = FACE[Math.max(0, seg)] ?? [0, 0];
  const base = seg % 2 ? 1.12 : 1.0;
  const punches = PUNCH.filter((p) => p >= sa - 0.05 && p < sb);
  const punch = punches.reduce((s, p) => s + 0.1 * pt(t, p - 0.05, p + 0.2, ease.out), 0);
  const drift = 0.03 * pt(t, sa, sb, (x) => x);
  const intro = 0.18 * (1 - pt(t, 0, 0.7, ease.out));
  // tiny handheld shake right after a slam
  const sl = SLAM.find((s) => t >= s.t && t < s.t + 0.3);
  const shake = sl ? (1 - (t - sl.t) / 0.3) * 10 : 0;
  const sx = shake * Math.sin(t * 90);
  const sy = shake * Math.cos(t * 77);
  const z = pip ? 1.0 : base + punch + drift + intro;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${z})`, transformOrigin: '50% 44%'}}>
      {(pro.pieces as {src: string; at: number; in: number; out: number; dur: number}[]).map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round(c.dur * FPS)}>
          <OffthreadVideo src={staticFile(c.src)} startFrom={c.in} endAt={c.out} muted={pip} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(1.06) brightness(0.98)'}} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Warm/teal grade + vignette for the speaker shots. */
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,30,25,0.18), rgba(255,170,90,0.08) 55%, rgba(10,20,18,0.25))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
  </>
);

// ---------------------------------------------------------------- keyword slams on the speaker
const Slam: React.FC<{t: number}> = ({t}) => {
  const s = SLAM.find((x) => t >= x.t - 0.02 && t < x.t + 1.25);
  if (!s) return null;
  const r = t - s.t;
  const p = sp(t, s.t, 300, 14);
  const out = pt(r, 1.0, 1.25, ease.in);
  const col = s.tone === 'bad' ? C.red : s.tone === 'ok' ? C.lime : '#fff';
  if (s.tone === 'quote') {
    return (
      <div style={{position: 'absolute', left: 60, right: 60, top: 250, textAlign: 'center', fontFamily: FONT, color: '#fff', opacity: Math.min(1, p * 2) * (1 - out), transform: `scale(${lerp(1.3, 1, Math.min(1, p))})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
        <div style={{fontSize: 200, lineHeight: 0.6, color: C.lime, fontWeight: 800}}>“</div>
        <div style={{fontSize: 92, fontWeight: 800, lineHeight: 1.05, textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>{s.text}</div>
      </div>
    );
  }
  const layers = Array.from({length: 8}, (_, i) => `${i + 1}px ${i + 1}px 0 rgba(0,0,0,${0.55 - i * 0.05})`).join(', ');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 3) * (1 - out), transform: `scale(${lerp(2.4, 1, Math.min(1, p))}) rotate(${lerp(-5, -2, Math.min(1, p))}deg)`, filter: p < 0.6 ? `blur(${(0.6 - p) * 30}px)` : out > 0 ? `blur(${out * 14}px)` : undefined}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: Math.min(170, 880 / (s.text.length * 0.66)), letterSpacing: '-0.02em', color: col, textShadow: `${layers}, 0 0 60px ${col}66`, WebkitTextStroke: '2px rgba(0,0,0,0.25)'}}>{s.text}</div>
    </div>
  );
};

// ---------------------------------------------------------------- captions
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (/[.,?!"]$/.test(w.w) || cur.length >= 4 || chars > 20 || !nx || nx.clip !== w.clip) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.5)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  const p = sp(t, c.s, 320, 20);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1500, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', rowGap: 6, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * 24}px)`}}>
      {c.words.map((w, i) => {
        const on = t >= w.s && t < (c.words[i + 1]?.s ?? c.e);
        return (
          <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 62, lineHeight: 1.15, margin: '0 6px', padding: '2px 14px', borderRadius: 16, color: on ? C.ink : '#fff', background: on ? C.lime : 'transparent', boxShadow: on ? '0 8px 30px rgba(182,242,58,0.45)' : undefined, textShadow: on ? 'none' : '0 3px 0 rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.8), 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000', transform: `scale(${on ? 1.06 : 1})`, display: 'inline-block'}}>
            {w.w.replace(/"/g, '')}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- full-frame scenes + transitions
const FullFrames: React.FC<{t: number}> = ({t}) => {
  let flash = 0;
  const nodes = FF.map((f, i) => {
    const kind = TRS[i % TRS.length];
    const prev = FF[i - 1];
    const next = FF[i + 1];
    const joinedIn = prev && Math.abs(prev.b - f.a) < 0.06;
    const joinedOut = next && Math.abs(next.a - f.b) < 0.06;
    const lastOut = i === FF.length - 1; // the system scene hands straight to the end card
    if (t < f.a - 0.01 || t > f.b + (joinedOut || lastOut ? 0.3 : 0)) return null;
    const pin = joinedIn ? 0 : 1 - pt(t, f.a, f.a + 0.32, ease.out);
    const pout = joinedOut || lastOut ? 0 : pt(t, f.b - 0.28, f.b, ease.in);
    const tr = trStyle(kind, pin, pout);
    flash = Math.max(flash, tr.flash);
    const S = SCENES[f.scene];
    // joined scenes cross-dissolve with a push
    const xin = joinedIn ? 1 - pt(t, f.a, f.a + 0.3, ease.out) : 0;
    return (
      <AbsoluteFill key={i} style={{...tr.style, ...(xin > 0 ? {opacity: 1 - xin, transform: `scale(${1 + xin * 0.2})`} : {})}}>
        <S t={t} a={f.a} b={f.b} ci={f.clip} />
      </AbsoluteFill>
    );
  });
  return (
    <>
      {nodes}
      {flash > 0.01 && <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'screen'}} />}
    </>
  );
};

const inFF = (t: number) => FF.some((f) => t >= f.a + 0.2 && t < f.b - 0.2);

/** The speaker in a circle while a full-frame scene plays. */
const Pip: React.FC<{t: number}> = ({t}) => {
  const f = FF.find((x) => t >= x.a && t < x.b);
  if (!f) return null;
  const p = sp(t, f.a + 0.25, 220, 18) * (1 - pt(t, f.b - 0.2, f.b, ease.in));
  if (p <= 0.01) return null;
  const size = 196;
  return (
    <div style={{position: 'absolute', right: 36, top: 44, width: size, height: size, borderRadius: size, overflow: 'hidden', border: `5px solid ${C.lime}`, boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(182,242,58,0.4)', transform: `scale(${p})`}}>
      <div style={{position: 'absolute', left: size / 2 - 1080 * 0.38 * 0.5, top: size / 2 - 1920 * 0.38 * 0.44, width: 1080 * 0.38, height: 1920 * 0.38}}>
        <div style={{width: 1080, height: 1920, transform: 'scale(0.38)', transformOrigin: '0 0'}}>
          <Speaker t={t} pip />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = pro.speech;
  if (t < a - 0.05) return null;
  const r = t - a;
  const logo = sp(t, a + 0.05, 150, 13);
  const streak = pt(r, 0.2, 0.9, ease.inOut);
  const name = sp(t, a + 0.55);
  const cta = sp(t, a + 0.95, 200, 12);
  const site = sp(t, a + 1.3);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <Stage t={t} glowY={34} />
      {/* expanding rings */}
      {[0, 1, 2].map((k) => {
        const q = ((r * 0.6 + k / 3) % 1);
        return <div key={k} style={{position: 'absolute', left: 540 - 200 - q * 400, top: 650 - 200 - q * 400, width: 400 + q * 800, height: 400 + q * 800, borderRadius: '50%', border: '2px solid rgba(182,242,58,0.4)', opacity: (1 - q) * Math.min(1, r * 2)}} />;
      })}
      <div style={{position: 'absolute', left: 290, top: 400, width: 500, height: 500, transform: `scale(${lerp(0.3, 1, Math.min(1.05, logo))}) rotate(${(1 - Math.min(1, logo)) * -40}deg)`, opacity: Math.min(1, logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(182,242,58,0.35))'}} />
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', mixBlendMode: 'screen'}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: lerp(-150, 560, streak), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', transform: 'skewX(-20deg)', opacity: streak > 0 && streak < 1 ? 1 : 0}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', fontSize: 120, fontWeight: 800, letterSpacing: `${lerp(0.3, -0.01, Math.min(1, name))}em`, opacity: Math.min(1, name * 2), filter: name < 0.7 ? `blur(${(0.7 - name) * 20}px)` : undefined}}>
        Neura <span style={{color: C.lime}}>Chat</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1070, textAlign: 'center', fontSize: 40, fontWeight: 600, color: 'rgba(255,255,255,0.72)', opacity: Math.min(1, name * 2)}}>WhatsApp AI Automation</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1210, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1.05, cta)})`, opacity: Math.min(1, cta * 2)}}>
        <div style={{position: 'relative', overflow: 'hidden', borderRadius: 999}}>
          <Pill size={44} style={{padding: '26px 56px', letterSpacing: '0.01em', boxShadow: '0 0 60px rgba(182,242,58,0.45)'}}>Start your 7-day free trial</Pill>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 90, left: `${((r - 1.2) * 70) % 160 - 20}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)', transform: 'skewX(-20deg)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontSize: 44, fontWeight: 700, letterSpacing: '0.05em', opacity: Math.min(1, site * 2), transform: `translateY(${(1 - Math.min(1, site)) * 30}px)`}}>neurachat.in</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const ProFilm: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ff = inFF(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>
        <Speaker t={t} />
        <Grade />
        {!ff && <Slam t={t} />}
      </AbsoluteFill>
      <FullFrames t={t} />
      <Pip t={t} />
      {t < pro.speech && <Captions t={t} />}
      <EndCard t={t} />
      {/* film grain */}
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
        <svg width={1080} height={1920}>
          <filter id="gr">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 9} />
          </filter>
          <rect width={1080} height={1920} filter="url(#gr)" />
        </svg>
      </AbsoluteFill>
      {withMusic && <Audio src={staticFile('audio/score-pro.wav')} volume={0.9} />}
      <AbsoluteFill style={{background: '#000', opacity: 1 - pt(t, 0, 0.12) + pt(t, pro.duration - 0.3, pro.duration)}} />
    </AbsoluteFill>
  );
};

export {rand, Kinetic};
