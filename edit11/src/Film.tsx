import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import edit from './edit.json';

// Neuraxine: paragliding talking head. The voiceover is the cleaned recording; the clip plays muted and is
// re-timed under it (see scripts/build_edit.py). Lips are on screen only where they were matched to the voice.
// Hand-edited look: hard punch-ins, plain bold captions, a GoPro-style altitude readout, a few flat stickers.
const C = {green: '#25D366', ink: '#111111', blue: '#0095F6'};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const FPS = edit.fps;
const SCALE = 1920 / 480; // public/clips/main.mp4 is the 848x480 source at 4x
const STROKE = ['2px 2px 0 #000', '-2px 2px 0 #000', '2px -2px 0 #000', '-2px -2px 0 #000', '0 3px 0 #000', '0 4px 14px rgba(0,0,0,0.45)'].join(', ');
const SOFT = '0 2px 3px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.35)';

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

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9,]/g, '');

// ---------------------------------------------------------------- punch-ins: hard cuts to a tighter frame on emphasis
const CUTS: [number, number][] = [[0, 1], [9, 1.2], [13, 1], [26, 1.12], [33, 1], [46, 1]];
const zoomAt = (t: number) => {
  let z = 1;
  for (const [i, v] of CUTS) if (t >= W(i) - 0.03) z = v;
  return z;
};

// ---------------------------------------------------------------- "Work smarter. Grow faster!": his mouth is nearly still in the only
// face-on shot left, so the line plays as full-screen titles over a blurred frame instead of over his lips.
const SLOGAN = edit.segs[3];
const slogan = (t: number) => (t < SLOGAN.a - 0.05 || t >= edit.end ? 0 : pt(t, SLOGAN.a - 0.05, SLOGAN.a + 0.15, ease.out));
const Slogan: React.FC<{t: number}> = ({t}) => {
  if (!slogan(t)) return null;
  const line = (at: number, a: string, b: string, color: string) => {
    const p = pt(t, at - 0.04, at + 0.12, ease.out); // both lines keep their place, the second just isn't visible yet
    return (
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.05em', color: '#fff', textAlign: 'center', transform: `scale(${lerp(1.25, 1, p)})`, opacity: p, textShadow: '0 8px 30px rgba(0,0,0,0.45)'}}>
        {a}
        <br />
        <span style={{color}}>{b}</span>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70}}>
      {line(W(46), 'WORK', 'SMARTER.', C.green)}
      {line(W(48), 'GROW', 'FASTER!', C.green)}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the re-timed clip, cropped to 9:16 around him
const Clip: React.FC<{t: number}> = ({t}) => {
  const f = Math.min(edit.cropX.length - 1, Math.round(t * FPS));
  const x = edit.cropX[f] * SCALE;
  const z = zoomAt(t);
  const sl = slogan(t);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 30%', filter: sl > 0 ? `blur(${sl * 14}px) brightness(${1 - sl * 0.45})` : undefined}}>
      {edit.segs.map((s, k) => (
        <Sequence key={k} from={Math.round(s.a * FPS)} durationInFrames={Math.round((s.b - s.a) * FPS)} layout="none">
          <OffthreadVideo
            muted
            src={staticFile('clips/main.mp4')}
            startFrom={Math.round(s.src * FPS)}
            playbackRate={s.rate}
            style={{position: 'absolute', top: 0, left: 540 - x, width: edit.srcW * SCALE, height: 1920, maxWidth: 'none', filter: 'contrast(1.08) saturate(1.12)'}}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- altitude readout (GoPro telemetry style)
const Altitude: React.FC<{t: number}> = ({t}) => {
  const a = W(5) - 0.5;
  const b = edit.segs[0].b - 0.05;
  if (t < a || t > b) return null;
  const o = pt(t, a, a + 0.2) * (1 - pt(t, b - 0.15, b));
  const v = Math.round(lerp(4870, 5000, pt(t, a, W(5) + 0.35, ease.out)) + (t > W(5) + 0.35 ? Math.sin(t * 3) * 3 : 0));
  return (
    <div style={{position: 'absolute', left: 60, top: 250, opacity: o, fontFamily: SANS, color: '#fff', textShadow: SOFT}}>
      <div style={{fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', opacity: 0.85}}>ALT</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
        <span style={{fontWeight: 900, fontSize: 96, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-IN')}</span>
        <span style={{fontWeight: 800, fontSize: 44}}>ft</span>
      </div>
      <div style={{width: 260, height: 4, background: 'rgba(255,255,255,0.35)', borderRadius: 4, marginTop: 6}}>
        <div style={{width: `${(v / 5000) * 100}%`, height: '100%', background: '#fff', borderRadius: 4}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- what we do: three flat stickers, each on its word
const POINTS: [number, string][] = [[36, 'WhatsApp automation'], [38, 'Leads managed'], [42, 'No customer missed']];
const Points: React.FC<{t: number}> = ({t}) => {
  const end = edit.segs[2].b - 0.1;
  if (t < W(POINTS[0][0]) - 0.1 || t > end) return null;
  const out = pt(t, end - 0.18, end, ease.in);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: 1 - out}}>
      {POINTS.map(([i, label], k) => {
        const a = W(i) - 0.06;
        if (t < a) return null;
        const p = pt(t, a, a + 0.18, ease.out);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 999, padding: '14px 30px 14px 18px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', opacity: p, transform: `translateY(${(1 - p) * 18}px) scale(${lerp(0.92, 1, p)}) rotate(${[-1.5, 1, -0.5][k]}deg)`}}>
            <svg width={40} height={40} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={11} fill={C.green} />
              <path d="M6.5 12.4l3.6 3.6 7.4-7.6" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.ink, letterSpacing: '-0.02em'}}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- captions: 2-3 words, white with a black edge, key words green
const HOT = new Set(['5,000', 'feet', 'chhodo', 'height', 'jump', 'business', 'ai', 'darte', 'whatsapp', 'leads', 'customer', 'smarter', 'faster']);
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    if (w.s >= edit.end) return; // the end card carries "Follow Neuraxine"
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    if (/[.,?!]$/.test(w.w) || chars + (nx ? nx.w.length : 0) > 15 || !nx || nx.s >= edit.end || nx.s - w.e > 0.25) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? edit.end, c.words[c.words.length - 1].e + 0.35, edit.end)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = LINES.find((x) => t >= x.s - 0.03 && t < x.e);
  if (!c) return null;
  const p = pt(t, c.s - 0.03, c.s + 0.07, ease.out);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1190, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 24, transform: `scale(${lerp(0.9, 1, p)})`}}>
      {c.words.map((w, i) => (
        <span key={i} style={{fontFamily: SANS, fontWeight: 900, fontSize: 80, letterSpacing: '-0.02em', lineHeight: 1.1, color: HOT.has(key(w.w)) ? C.green : '#fff', textShadow: STROKE}}>
          {w.w.replace('...', '…')}
        </span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- end card: follow Neuraxine, button tapped on "Follow"
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.end;
  if (t < a) return null;
  const r = t - a;
  const tap = W(50);
  const followed = t >= tap + 0.22;
  const press = pt(t, tap + 0.05, tap + 0.17) * (1 - pt(t, tap + 0.17, tap + 0.3));
  return (
    <AbsoluteFill style={{background: '#0E0E0E', opacity: pt(r, 0, 0.2), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS}}>
      <div style={{width: 300, height: 300, borderRadius: 300, background: '#1A1A1A', border: '3px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pt(r, 0.0, 0.15)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 220, height: 160, objectFit: 'contain'}} />
      </div>
      <div style={{fontWeight: 900, fontSize: 104, color: '#fff', letterSpacing: '-0.045em', marginTop: 36, opacity: pt(r, 0.03, 0.18)}}>Neuraxine</div>
      <div style={{fontWeight: 600, fontSize: 42, color: 'rgba(255,255,255,0.65)', marginTop: 6, opacity: pt(r, 0.06, 0.22)}}>AI automation for businesses</div>
      <div
        style={{
          marginTop: 60,
          width: 460,
          height: 110,
          borderRadius: 22,
          background: followed ? '#262626' : C.blue,
          color: '#fff',
          fontWeight: 800,
          fontSize: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pt(r, 0.03, 0.15),
          transform: `scale(${1 - press * 0.06})`,
        }}
      >
        {followed ? 'Following' : 'Follow'}
      </div>
      <div style={{fontWeight: 700, fontSize: 40, color: 'rgba(255,255,255,0.8)', marginTop: 34, opacity: pt(t, W(52) - 0.05, W(52) + 0.2)}}>for more content</div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < edit.end + 0.2 && <Clip t={t} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 60%, rgba(0,0,0,0.3) 100%)'}} />
      {t < edit.end && (
        <>
          <Altitude t={t} />
          <Points t={t} />
          {!slogan(t) && <Captions t={t} />}
          <Slogan t={t} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
