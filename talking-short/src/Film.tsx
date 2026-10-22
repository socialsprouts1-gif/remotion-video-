import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import {C, Chip, FONT, loadFonts, pop} from './ui';
import {cue, Panels} from './Panels';
import edit from './edit.json';

loadFonts();

const FPS = edit.fps;
type Word = {w: string; s: number; e: number; k: boolean; clip: number; i: number};
const WORDS = edit.words as Word[];

/** Caption chunks: up to 3 words, broken at punctuation, never across clips. */
const CHUNKS: {words: Word[]; s: number; e: number}[] = (() => {
  const out: {words: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({words: cur, s: cur[0].s, e: 0});
    cur = [];
  };
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nxt = WORDS[i + 1];
    const chars = cur.reduce((n, x) => n + x.w.length, 0);
    if (/[.,?!"]$/.test(w.w) || cur.length >= 3 || chars > 14 || !nxt || nxt.clip !== w.clip) flush();
  });
  out.forEach((c, i) => {
    const clip = edit.clips[c.words[0].clip];
    const clipEnd = clip.at + clip.dur;
    c.e = Math.min(out[i + 1]?.s ?? 1e9, clipEnd, c.words[c.words.length - 1].e + 0.6);
  });
  return out;
})();

// Cues that get a quick zoom "hit" on the speaker
const BUMPS = ['realProblem', 'msgLetKnow', 'lost', 'autoTitle', 'system'].map(cue);

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CHUNKS.find((x) => t >= x.s && t < x.e);
  if (!c) return null;
  const p = pop(t, c.s, 260, 16);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1300, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center', transform: `scale(${0.82 + 0.18 * Math.min(1.05, p)})`, opacity: Math.min(1, p * 2)}}>
      {c.words.map((w, i) => {
        const active = t >= w.s && t < (c.words[i + 1]?.s ?? c.e);
        const col = active ? C.lime : w.k ? '#FFFFFF' : '#FFFFFF';
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 74,
              margin: '0 16px',
              lineHeight: 1.18,
              color: col,
              textTransform: 'uppercase',
              transform: `scale(${active ? 1.08 : 1})`,
              display: 'inline-block',
              textShadow: '0 0 2px #000, 0 4px 0 rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.7), 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000',
              borderBottom: w.k ? `6px solid ${active ? C.lime : 'rgba(182,242,58,0.85)'}` : undefined,
            }}
          >
            {w.w.replace(/["]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

const Speaker: React.FC<{t: number}> = ({t}) => (
  <>
    {edit.clips.map((c, i) => {
      const local = t - c.at;
      // alternate framing on every cut to hide jump cuts, slow push within each clip
      const base = i % 2 ? 1.14 : 1.0;
      const drift = 0.035 * pt(local, 0, c.dur, (x) => x);
      const intro = i === 0 ? 0.12 * (1 - pt(t, 0, 0.6, ease.out)) : 0;
      const bump = BUMPS.reduce((s, b) => s + 0.06 * Math.max(0, pop(t, b, 300, 12) > 0 ? Math.exp(-(t - b) * 3) * Math.min(1, pop(t, b, 300, 12)) : 0), 0);
      return (
        <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round(c.dur * FPS)}>
          <AbsoluteFill style={{transform: `scale(${base + drift + intro + bump})`, transformOrigin: '50% 46%'}}>
            <OffthreadVideo src={staticFile(c.src)} startFrom={c.in} endAt={c.out} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.08)'}} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.3) return null;
  const bg = pt(t, a - 0.3, a + 0.3, ease.inOut);
  const logo = pop(t, a + 0.15, 170, 14);
  const n = pop(t, a + 0.45);
  const tag = pop(t, a + 0.65);
  const pill = pop(t, a + 0.9, 200, 12);
  const site = pop(t, a + 1.2);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #14240a 0%, #070a07 60%, #030403 100%)', opacity: bg}} />
      <div style={{position: 'absolute', left: 290, top: 470, width: 500, height: 500, opacity: Math.min(1, logo * 1.4), transform: `scale(${0.6 + 0.4 * logo})`}}>
        <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%', mixBlendMode: 'screen'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontSize: 96, fontWeight: 800, opacity: Math.min(1, n * 1.5), transform: `translateY(${(1 - n) * 40}px)`}}>
        Neura <span style={{color: C.lime}}>Chat</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', fontSize: 38, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em', opacity: Math.min(1, tag * 1.5)}}>
        WhatsApp AI Automation
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1220, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pill * 1.5), transform: `scale(${0.6 + 0.4 * pill})`}}>
        <Chip style={{fontSize: 40, padding: '22px 48px', letterSpacing: '0.02em', boxShadow: '0 0 50px rgba(182,242,58,0.35)'}}>Start your 7-day free trial</Chip>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontSize: 40, fontWeight: 700, opacity: Math.min(1, site * 1.5), letterSpacing: '0.04em'}}>neurachat.in</div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const speechOut = pt(t, edit.speech - 0.3, edit.speech + 0.2, ease.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: speechOut > 0 ? `blur(${speechOut * 30}px)` : undefined, transform: `scale(${1 + speechOut * 0.15})`}}>
        <Speaker t={t} />
      </AbsoluteFill>
      {/* soft top shade so panels sit cleanly on the wall */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 38%, transparent 62%, rgba(0,0,0,0.35))', opacity: 1 - speechOut}} />
      {t < edit.speech && <Panels t={t} />}
      {t < edit.speech && <Captions t={t} />}
      <EndCard t={t} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.9} />}
      <AbsoluteFill style={{background: '#000', opacity: 1 - pt(t, 0, 0.15) + pt(t, edit.duration - 0.25, edit.duration)}} />
    </AbsoluteFill>
  );
};

export {lerp};
