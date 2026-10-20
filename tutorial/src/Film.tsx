import React, {useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {AUDIO, BRAND, VIEW} from './config';
import {CHAPTERS, FPS, SHOTS, T} from './data';
import {C, FONT} from './theme';
import {ease, lerp, pt, win} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {currentStep, Shot} from './components/Shot';
import {Icon} from './components/Icons';
import {Lens, Words} from './components/Type';

const CARD = T.chapterCard;
const inCard = (t: number) => CHAPTERS.some((c) => t >= c.at && t < c.at + CARD);
const chapterAt = (t: number) => [...CHAPTERS].reverse().find((c) => t >= c.at);
const shotAt = (t: number) => SHOTS.find((s) => t >= s.start && t < s.start + s.dur);

// ------------------------------------------------------------------ backdrop
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${C.bg2} 0%, ${C.bg} 75%)`}}>
    <AbsoluteFill style={{background: `radial-gradient(700px 500px at ${960 + Math.sin(t * 0.15) * 500}px ${540 + Math.cos(t * 0.12) * 260}px, rgba(${C.limeRGB},0.07), transparent 70%)`}} />
    <AbsoluteFill
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        backgroundPosition: `0 ${(t * 6) % 64}px`,
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
      }}
    />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ the browser window that frames every screen
const Window: React.FC<{t: number}> = ({t}) => {
  const [a] = T.intro;
  const show = pt(t, T.intro[1] + 0.1, T.intro[1] + 1.2, ease.out) * (1 - pt(t, T.outro[0] - 0.1, T.outro[0] + 0.6, ease.in));
  if (show <= 0) return null;
  const card = CHAPTERS.reduce((m, c) => Math.max(m, win(t, c.at, c.at + CARD, 0.4, 0.5)), 0);
  const shot = shotAt(t);
  const ch = chapterAt(t);
  const url = shot ? shot.url : t >= T.verify.at && t < T.verify.at + T.verify.dur ? 'facebook.com' : '';
  void a;
  return (
    <AbsoluteFill style={{perspective: 2000, perspectiveOrigin: '960px 540px'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '960px 520px',
          transform: `translateY(${(1 - show) * 140}px) rotateX(${(1 - show) * 22}deg) scale(${lerp(0.9, 1, show) * (1 - card * 0.06)})`,
          opacity: show,
          filter: card > 0.01 ? `blur(${card * 8}px) brightness(${1 - card * 0.55})` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: VIEW.x - 1,
            top: VIEW.y - VIEW.bar - 1,
            width: VIEW.w + 2,
            height: VIEW.h + VIEW.bar + 2,
            borderRadius: 22,
            background: '#0F1311',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: `0 60px 140px rgba(0,0,0,0.7), 0 0 0 10px rgba(255,255,255,0.025), 0 0 120px rgba(${C.limeRGB},0.06)`,
            overflow: 'hidden',
          }}
        >
          <div style={{height: VIEW.bar, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: FONT}}>
            {['#3A3F3C', '#3A3F3C', '#3A3F3C'].map((c, i) => (
              <span key={i} style={{width: 12, height: 12, borderRadius: 12, background: c}} />
            ))}
            <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
              <div style={{minWidth: 420, padding: '6px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', fontSize: 17, fontWeight: 500, color: C.metal, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <span style={{width: 7, height: 7, borderRadius: 7, background: C.lime}} />
                {url}
              </div>
            </div>
            {ch && (
              <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', color: C.lime, minWidth: 140, textAlign: 'right'}}>
                STEP {ch.n} / {CHAPTERS.length}
              </div>
            )}
          </div>
        </div>
        {SHOTS.map((s) => (
          <Sequence key={s.id} from={Math.round(s.start * FPS)} durationInFrames={Math.round(s.dur * FPS)} name={s.id} layout="none">
            <Shot shot={s} />
          </Sequence>
        ))}
        <Verify t={t} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the rest of Meta's flow, as motion graphics
const VERIFY_CAPTIONS = [
  'Meta sends a 6-digit code by SMS or call. Enter it to verify the number.',
  'Confirm the remaining prompts in the Meta window.',
  "Done. Neura Chat receives your number's credentials automatically.",
];
const Verify: React.FC<{t: number}> = ({t}) => {
  const V = T.verify;
  const lt = t - V.at;
  if (lt < -0.1 || lt > V.dur + 0.1) return null;
  const o = pt(lt, 0, 0.4) * (1 - pt(lt, V.dur - 0.3, V.dur));
  const digits = '482913';
  return (
    <div style={{position: 'absolute', left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h, opacity: o, background: 'radial-gradient(ellipse at 40% 40%, #121815, #070A08)', overflow: 'hidden', fontFamily: FONT}}>
      {/* code entry */}
      <div style={{position: 'absolute', left: 120, top: 250, width: 700}}>
        <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color: C.lime}}>VERIFICATION CODE</div>
        <div style={{display: 'flex', gap: 18, marginTop: 26}}>
          {digits.split('').map((d, i) => {
            const q = pt(lt, 0.3 + i * 0.18, 0.5 + i * 0.18, ease.out);
            const done = pt(lt, 1.6, 1.9);
            return (
              <div
                key={i}
                style={{
                  width: 92,
                  height: 116,
                  borderRadius: 20,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 58,
                  fontWeight: 700,
                  color: C.white,
                  background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done > 0 ? `rgba(${C.limeRGB},${0.3 + 0.7 * done})` : q > 0 && q < 1 ? C.lime : 'rgba(255,255,255,0.14)'}`,
                  boxShadow: done > 0 ? `0 0 ${30 * done}px rgba(${C.limeRGB},0.35)` : undefined,
                }}
              >
                <span style={{opacity: q, transform: `translateY(${(1 - q) * 18}px)`}}>{d}</span>
              </div>
            );
          })}
        </div>
        <div style={{fontSize: 22, color: C.grey, marginTop: 22}}>Sample code for illustration</div>
      </div>
      {/* step list */}
      <div style={{position: 'absolute', right: 110, top: 200, width: 520}}>
        {V.steps.map((s, i) => {
          const a = pt(lt, s.t, s.t + 0.5, ease.out);
          const next = V.steps[i + 1];
          const done = next ? pt(lt, next.t, next.t + 0.3) : pt(lt, s.t + 0.6, s.t + 0.9);
          return (
            <div key={i} style={{display: 'flex', gap: 22, alignItems: 'center', marginBottom: 34, opacity: lerp(0.25, 1, a), transform: `translateX(${(1 - a) * 30}px)`}}>
              <div style={{width: 64, height: 64, borderRadius: 64, flex: 'none', display: 'grid', placeItems: 'center', background: done > 0.5 ? C.lime : 'rgba(255,255,255,0.06)', border: done > 0.5 ? 'none' : `2px solid ${a > 0.5 ? C.lime : 'rgba(255,255,255,0.2)'}`, boxShadow: done > 0.5 ? `0 0 26px rgba(${C.limeRGB},0.5)` : undefined}}>
                {done > 0.5 ? <Icon name="check" size={34} color="#050605" stroke={3} /> : <span style={{fontSize: 26, fontWeight: 700, color: C.white}}>{i + 4}</span>}
              </div>
              <div>
                <div style={{fontSize: 32, fontWeight: 700, color: C.white}}>{s.title}</div>
                <div style={{fontSize: 21, color: C.grey}}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ captions (lower third)
const captionAt = (t: number): {text: string; since: number; until: number} | null => {
  const s = shotAt(t);
  if (s) {
    const lt = t - s.start;
    const k = currentStep(s, lt);
    const text = s.steps[k].caption ?? '';
    const next = s.steps[k + 1];
    return {text, since: s.start + s.steps[k].t, until: next ? s.start + next.t : s.start + s.dur};
  }
  const V = T.verify;
  if (t >= V.at && t < V.at + V.dur) {
    let k = 0;
    V.steps.forEach((st, i) => t - V.at >= st.t && (k = i));
    return {text: VERIFY_CAPTIONS[k], since: V.at + V.steps[k].t, until: V.steps[k + 1] ? V.at + V.steps[k + 1].t : V.at + V.dur};
  }
  return null;
};

const Caption: React.FC<{t: number}> = ({t}) => {
  const c = captionAt(t);
  if (!c || inCard(t) || !c.text) return null;
  // consecutive identical captions should not blink
  const prev = captionAt(c.since - 0.02);
  const same = prev && prev.text === c.text;
  const a = same ? 1 : pt(t, c.since, c.since + 0.35);
  const nextC = captionAt(c.until + 0.02);
  const b = nextC && nextC.text === c.text ? 0 : pt(t, c.until - 0.2, c.until);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1012, display: 'flex', justifyContent: 'center', opacity: a * (1 - b), transform: `translateY(${(1 - a) * 12}px)`}}>
      <div style={{maxWidth: 1500, padding: '12px 30px', borderRadius: 18, background: 'rgba(6,9,7,0.85)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: FONT, fontSize: 30, fontWeight: 500, color: C.white, textAlign: 'center', lineHeight: 1.35}}>
        {c.text}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ chapter cards
const ChapterCard: React.FC<{t: number}> = ({t}) => {
  const c = CHAPTERS.find((ch) => t >= ch.at - 0.05 && t < ch.at + CARD + 0.05);
  if (!c) return null;
  const lt = t - c.at;
  const a = pt(lt, 0, 0.6, ease.out);
  const out = pt(lt, CARD - 0.5, CARD, ease.in);
  const num = pt(lt, 0.05, 0.7, ease.out);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: 1 - out}}>
      <div style={{position: 'absolute', fontSize: 420, fontWeight: 800, color: `rgba(${C.limeRGB},0.06)`, letterSpacing: '-0.05em', transform: `scale(${lerp(1.3, 1, num)})`}}>{`0${c.n}`}</div>
      <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.4em', color: C.lime, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, marginRight: '-0.4em'}}>{`STEP ${c.n}`}</div>
      <div style={{height: 26}} />
      <div style={{position: 'relative', width: '100%', height: 120}}>
        <Words t={t} text={c.title} at={c.at + 0.2} size={92} y={60} stagger={0.06} />
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 44}}>
        {CHAPTERS.map((ch, i) => (
          <div key={i} style={{width: 90, height: 6, borderRadius: 6, background: ch.n < c.n ? C.lime : ch.n === c.n ? `rgba(${C.limeRGB},${0.25 + 0.75 * pt(lt, 0.4, 1.2)})` : 'rgba(255,255,255,0.12)', boxShadow: ch.n === c.n ? `0 0 14px rgba(${C.limeRGB},0.6)` : undefined}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ intro / outro
const Logo: React.FC<{t: number; at: number; size: number; y: number}> = ({t, at, size, y}) => {
  const a = pt(t, at, at + 0.9, ease.out);
  const sweep = pt(t, at + 0.5, at + 1.5, ease.inOut);
  return (
    <div style={{position: 'absolute', left: 960 - size / 2, top: y - size / 2, width: size, height: size, opacity: a, transform: `scale(${lerp(1.2, 1, a)})`, filter: `blur(${(1 - a) * 14}px)`, mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle, black 52%, transparent 70%)', maskImage: 'radial-gradient(circle, black 52%, transparent 70%)'}}>
      <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)', transform: `translateX(${lerp(-70, 70, sweep)}%)`, opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
    </div>
  );
};

const Intro: React.FC<{t: number}> = ({t}) => {
  const [a, b] = T.intro;
  if (t > b + 0.2) return null;
  const out = pt(t, b - 0.7, b, ease.in);
  const agenda = pt(t, 5.2, 5.8);
  const top = lerp(0, -170, pt(t, 4.6, 5.6, ease.inOut));
  return (
    <AbsoluteFill style={{opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 12}px)` : undefined, fontFamily: FONT}}>
      <AbsoluteFill style={{transform: `translateY(${top}px)`}}>
        <Logo t={t} at={a + 0.3} size={360} y={330} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontSize: 30, fontWeight: 600, letterSpacing: '0.38em', color: C.lime, opacity: pt(t, 1.4, 2.0)}}>{BRAND.product.toUpperCase()}</div>
        <Words t={t} text="Complete setup tutorial" at={1.8} size={92} y={610} />
        <Words t={t} text="From the homepage to your first connected WhatsApp number." at={2.8} size={32} weight={500} color={C.metal} y={700} stagger={0.03} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 560, top: 640, width: 800, opacity: agenda}}>
        {CHAPTERS.map((c, i) => {
          const q = pt(t, 5.4 + i * 0.35, 5.9 + i * 0.35, ease.out);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 16, opacity: q, transform: `translateX(${(1 - q) * 40}px)`}}>
              <div style={{width: 46, height: 46, borderRadius: 46, display: 'grid', placeItems: 'center', border: `2px solid ${C.lime}`, fontSize: 21, fontWeight: 700, color: C.lime}}>{c.n}</div>
              <div style={{fontSize: 32, fontWeight: 600, color: C.white}}>{c.title}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{t: number}> = ({t}) => {
  const [a] = T.outro;
  if (t < a) return null;
  const cta = pt(t, a + 4.2, a + 5);
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <Words t={t} text="You're all *set.*" at={a + 0.4} size={96} y={170} />
      <div style={{position: 'absolute', left: 600, top: 260, width: 760}}>
        {CHAPTERS.map((c, i) => {
          const q = pt(t, a + 0.9 + i * 0.3, a + 1.4 + i * 0.3, ease.out);
          const chk = pt(t, a + 1.2 + i * 0.3, a + 1.5 + i * 0.3, ease.out);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18, opacity: q, transform: `translateX(${(1 - q) * 40}px)`}}>
              <div style={{width: 48, height: 48, borderRadius: 48, display: 'grid', placeItems: 'center', background: `rgba(${C.limeRGB},${chk})`, border: `2px solid ${C.lime}`}}>
                <span style={{transform: `scale(${chk})`}}>
                  <Icon name="check" size={28} color="#050605" stroke={3} />
                </span>
              </div>
              <div style={{fontSize: 32, fontWeight: 600, color: C.white}}>{c.title}</div>
            </div>
          );
        })}
      </div>
      <Logo t={t} at={a + 3.0} size={300} y={790} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 16}px)`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, background: C.lime, color: '#050605', fontSize: 30, fontWeight: 700, boxShadow: `0 0 40px rgba(${C.limeRGB},0.45)`}}>
          Start your 7-day free trial · {BRAND.site}
        </div>
        <div style={{fontSize: 20, color: C.grey, marginTop: 16, letterSpacing: '0.18em'}}>{`${BRAND.product.toUpperCase()} · ${BRAND.by.toUpperCase()}`}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  useState(() => loadFonts());
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop t={t} />
      <Window t={t} />
      <Intro t={t} />
      <ChapterCard t={t} />
      <Caption t={t} />
      <Outro t={t} />
      <Lens t={t} />
      <Audio src={staticFile(AUDIO.score)} volume={AUDIO.scoreVolume * (AUDIO.voiceover ? AUDIO.duckUnderVoice : 1)} />
      {AUDIO.voiceover && <Audio src={staticFile(AUDIO.voiceover)} volume={AUDIO.voiceVolume} />}
    </AbsoluteFill>
  );
};
