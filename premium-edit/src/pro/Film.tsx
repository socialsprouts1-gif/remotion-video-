import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {loadFonts} from '../ui';
import {C, FONT, Kinetic, Pill, sp, Stage, Tr, trStyle, WORDS, Word} from './kit';
import {SCENES} from './Scenes';
import {Check, WaIcon} from '../ui';
import pro from '../edit.json';

loadFonts();

const FPS = pro.fps;
const FF = pro.ff as {scene: string; a: number; b: number}[];
// adspend, flatline (joined), convert, story (joined), whatsapp, reveal, features (joined)
const TRS: Tr[] = ['zoom', 'glitch', 'iris', 'zoom', 'slide', 'flash', 'zoom'];
const CTA = pro.cta as {t: number; kind: string}[];
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
          <OffthreadVideo src={staticFile(c.src)} startFrom={c.in} endAt={c.out} muted={pip} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.16) saturate(0.82) brightness(0.86)'}} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Warm/teal grade + vignette for the speaker shots. */
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,30,26,0.55), rgba(40,28,18,0.25) 50%, rgba(0,18,16,0.6))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'rgba(5,12,10,0.22)', mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 38%, rgba(0,0,0,0.78) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent 22%, transparent 66%, rgba(0,0,0,0.7))'}} />
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
    if (/[.,?!"]$/.test(w.w) || cur.length >= 4 || chars > 20 || !nx || nx.take !== w.take) {
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
    <div style={{position: 'absolute', left: 60, right: 60, top: 1470, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', rowGap: 0, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * 24}px)`}}>
      {c.words.map((w, i) => {
        const on = t >= w.s && t < (c.words[i + 1]?.s ?? c.e);
        return (
          <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, margin: '0 11px', color: on ? C.lime : w.k ? '#FFFFFF' : 'rgba(255,255,255,0.92)', textShadow: on ? '0 0 26px rgba(182,242,58,0.55), 0 4px 18px rgba(0,0,0,0.9)' : '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)', transform: `translateY(${on ? -4 : 0}px) scale(${on ? 1.07 : 1})`, display: 'inline-block'}}>
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
    const lastOut = false;
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
        <S t={t} a={f.a} b={f.b} />
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
    <div style={{position: 'absolute', right: 36, top: 44, width: size, height: size, borderRadius: size, overflow: 'hidden', border: '3px solid rgba(182,242,58,0.85)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', transform: `scale(${p})`}}>
      <div style={{position: 'absolute', left: size / 2 - 1080 * 0.38 * 0.5, top: size / 2 - 1920 * 0.38 * 0.44, width: 1080 * 0.38, height: 1920 * 0.38}}>
        <div style={{width: 1080, height: 1920, transform: 'scale(0.38)', transformOrigin: '0 0'}}>
          <Speaker t={t} pip />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- call to action on the last take
const ctaAt = (k: string) => CTA.find((c) => c.kind === k)?.t ?? 1e9;
const Cta: React.FC<{t: number}> = ({t}) => {
  const L = ctaAt('link'), Cm = ctaAt('comment'), Dm = ctaAt('dm'), F = ctaAt('follow');
  if (t < L - 0.1 || t > pro.speech) return null;
  const glass: React.CSSProperties = {background: 'rgba(14,18,16,0.82)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 40, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)', fontFamily: FONT, color: '#fff'};
  const nodes: React.ReactNode[] = [];
  // 1. "Neura Chat ka link"
  if (t < Cm + 0.2) {
    const p = sp(t, L - 0.05, 220, 18), o = pt(t, Cm - 0.1, Cm + 0.2, ease.in);
    nodes.push(
      <div key="l" style={{...glass, position: 'absolute', left: 140, right: 140, top: 300, height: 150, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', transform: `translateY(${(1 - Math.min(1, p)) * -120 - o * 80}px)`, opacity: Math.min(1, p * 2) * (1 - o)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 110, height: 80, objectFit: 'contain'}} />
        <div>
          <div style={{fontSize: 44, fontWeight: 800}}>Neura <span style={{color: C.lime}}>Chat</span></div>
          <div style={{fontSize: 26, color: 'rgba(255,255,255,0.6)', fontWeight: 600}}>link chahiye?</div>
        </div>
      </div>,
    );
  }
  // 2. comment
  if (t >= Cm - 0.1 && t < Dm + 0.3) {
    const p = sp(t, Cm - 0.05, 220, 17), o = pt(t, Dm, Dm + 0.3, ease.in);
    const typed = 'Link'.slice(0, Math.max(0, Math.min(4, Math.floor((t - Cm - 0.15) / 0.09))));
    const sent = pt(t, Cm + 0.6, Cm + 0.8);
    nodes.push(
      <div key="c" style={{position: 'absolute', left: 90, right: 90, top: 250, opacity: Math.min(1, p * 2) * (1 - o), transform: `translateY(${(1 - Math.min(1, p)) * 80 - o * 60}px)`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 120, color: '#fff', textAlign: 'center', textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>COMMENT</div>
        <div style={{...glass, marginTop: 20, height: 120, display: 'flex', alignItems: 'center', gap: 22, padding: '0 20px 0 30px'}}>
          <div style={{width: 70, height: 70, borderRadius: 70, background: 'linear-gradient(135deg,#6a7b83,#33403f)'}} />
          <div style={{flex: 1, fontSize: 42, fontWeight: 600, color: typed ? '#fff' : 'rgba(255,255,255,0.4)'}}>{typed || 'Add a comment…'}<span style={{opacity: Math.sin(t * 14) > 0 && sent < 1 ? 1 : 0, color: C.lime}}>|</span></div>
          <div style={{width: 84, height: 84, borderRadius: 84, background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${1 + 0.25 * Math.sin(sent * Math.PI)})`}}>
            <svg width={40} height={40} viewBox="0 0 24 24"><path d="M3 12 L21 3 L14 21 L11 13 Z" fill={C.ink} /></svg>
          </div>
        </div>
      </div>,
    );
  }
  // 3. DM on WhatsApp
  if (t >= Dm - 0.1 && t < F + 0.3) {
    const p = sp(t, Dm, 220, 16), o = pt(t, F - 0.2, F + 0.1, ease.in);
    const fly = pt(t, Dm + 0.4, Dm + 1.3, ease.inOut);
    nodes.push(
      <div key="d" style={{position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: Math.min(1, p * 2) * (1 - o), transform: `scale(${0.8 + 0.2 * Math.min(1, p)})`}}>
        <div style={{position: 'relative', width: 200, height: 200, filter: 'drop-shadow(0 0 50px rgba(37,211,102,0.6))'}}>
          <WaIcon size={200} />
          <svg width={90} height={90} viewBox="0 0 24 24" style={{position: 'absolute', left: 150 + fly * 300, top: 20 - fly * 220, opacity: 1 - fly}}><path d="M3 12 L21 3 L14 21 L11 13 Z" fill={C.lime} /></svg>
        </div>
        <div style={{...glass, padding: '22px 44px', fontSize: 46, fontWeight: 800}}>
          Direct <span style={{color: C.wa}}>DM</span> on WhatsApp
        </div>
      </div>,
    );
  }
  // 4. follow
  if (t >= F - 0.1) {
    const p = sp(t, F - 0.05, 230, 15);
    const press = pt(t, F + 0.45, F + 0.6);
    const done = t > F + 0.6;
    const dip = 1 - 0.12 * Math.sin(press * Math.PI);
    nodes.push(
      <div key="f" style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * 60}px)`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)'}}>AI AUTOMATION TIPS</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '26px 70px', borderRadius: 999, background: done ? C.lime : '#fff', color: C.ink, fontFamily: FONT, fontWeight: 800, fontSize: 56, transform: `scale(${dip})`, boxShadow: done ? '0 0 60px rgba(182,242,58,0.55)' : '0 20px 50px rgba(0,0,0,0.5)'}}>
          {done && <Check size={52} color={C.ink} p={pt(t, F + 0.6, F + 0.9)} />}
          {done ? 'Following' : 'Follow'}
        </div>
      </div>,
    );
  }
  return <>{nodes}</>;
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = pro.speech;
  if (t < a - 0.25) return null;
  const r = t - a;
  const bg = pt(t, a - 0.25, a + 0.1);
  const logo = sp(t, a, 150, 13);
  const streak = pt(r, 0.15, 0.8, ease.inOut);
  const name = sp(t, a + 0.35);
  const cta = sp(t, a + 0.7, 200, 12);
  const site = sp(t, a + 1.0);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff', opacity: bg}}>
      <Stage t={t} glowY={34} />
      <div style={{position: 'absolute', left: 290, top: 400, width: 500, height: 400, transform: `scale(${lerp(0.6, 1, Math.min(1.05, logo))})`, opacity: Math.min(1, logo * 2)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(182,242,58,0.35))'}} />
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', mixBlendMode: 'screen'}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: lerp(-150, 560, streak), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', transform: 'skewX(-20deg)', opacity: streak > 0 && streak < 1 ? 1 : 0}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontSize: 130, fontWeight: 800, letterSpacing: `${lerp(0.25, -0.01, Math.min(1, name))}em`, opacity: Math.min(1, name * 2), filter: name < 0.7 ? `blur(${(0.7 - name) * 20}px)` : undefined}}>
        Neura <span style={{color: C.lime}}>Chat</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', transform: `scale(${Math.min(1.05, cta)})`, opacity: Math.min(1, cta * 2)}}>
        <div style={{position: 'relative', overflow: 'hidden', borderRadius: 999}}>
          <Pill size={46} style={{padding: '26px 56px', letterSpacing: '0.01em', boxShadow: '0 0 60px rgba(182,242,58,0.45)'}}>Comment for the link</Pill>
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 90, left: `${((r - 0.9) * 80) % 160 - 20}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)', transform: 'skewX(-20deg)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center', fontSize: 40, fontWeight: 600, color: 'rgba(255,255,255,0.72)', opacity: Math.min(1, site * 2), transform: `translateY(${(1 - Math.min(1, site)) * 30}px)`}}>We'll DM you on WhatsApp</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
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
      {!ff && <Cta t={t} />}
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
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
      <AbsoluteFill style={{background: '#000', opacity: 1 - pt(t, 0, 0.12) + pt(t, pro.duration - 0.3, pro.duration)}} />
    </AbsoluteFill>
  );
};

export {rand, Kinetic};
