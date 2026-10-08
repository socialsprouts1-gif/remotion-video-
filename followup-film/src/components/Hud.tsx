import React from 'react';
import {AbsoluteFill} from 'remotion';
import {B, CLOCK_KEYS} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, pt, rand} from '../lib/anim';

// ------------------------------------------------------------------ kinetic words
type WordsProps = {
  t: number;
  text: string; // *accent* markup
  at: number;
  out?: number; // exit start (s)
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  y: number; // centre line, canvas px
  exitMode?: 'up' | 'blur';
  dim?: number; // 0..1 fade towards 35% (for a line that steps back)
};

/** Words rise through their own masks with velocity blur, then leave. Lime only where the copy says *so*. */
export const Words: React.FC<WordsProps> = ({t, text, at, out, size, weight = 800, color = C.white, stagger = 0.07, y, exitMode = 'blur', dim = 0}) => {
  let accent = false;
  const words = text.split(' ').map((w) => {
    let s = w;
    let a = accent;
    if (s.startsWith('*')) {
      a = accent = true;
      s = s.slice(1);
    }
    if (s.endsWith('*')) {
      accent = false;
      s = s.slice(0, -1);
    }
    return {s, a};
  });
  if (t < at - 0.05) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        color,
        whiteSpace: 'nowrap',
        opacity: 1 - dim * 0.65,
      }}
    >
      {words.map((w, i) => {
        const p = pt(t, at + i * stagger, at + i * stagger + 0.55, ease.out);
        const pPrev = pt(t - 1 / 30, at + i * stagger, at + i * stagger + 0.55, ease.out);
        const e = out === undefined ? 0 : pt(t, out + i * 0.03, out + i * 0.03 + 0.4, ease.in);
        const vb = Math.abs(p - pPrev) * size * 0.9;
        const ty = (1 - p) * size * 1.1 - (exitMode === 'up' ? e * size * 1.1 : 0);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.12em 0.05em 0.2em', margin: '-0.12em 0.13em -0.2em', verticalAlign: 'top'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${ty}px) scale(${exitMode === 'blur' ? 1 + e * 0.08 : 1})`,
                filter: vb + e * 14 > 0.2 ? `blur(${vb + e * 14}px)` : undefined,
                opacity: exitMode === 'blur' ? 1 - e : 1,
                color: w.a ? C.lime : undefined,
                textShadow: w.a ? `0 0 ${size * 0.4}px rgba(${C.limeRGB},0.35)` : undefined,
              }}
            >
              {w.s}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ the clock
const clockValue = (t: number) => {
  const k = CLOCK_KEYS;
  if (t <= k[0][0]) return 0;
  for (let i = 0; i < k.length - 1; i++) {
    if (t < k[i + 1][0]) {
      const p = pt(t, k[i][0], k[i + 1][0], ease.inOut);
      return Math.exp(lerp(Math.log(k[i][1]), Math.log(k[i + 1][1]), p));
    }
  }
  return k[k.length - 1][1];
};
const hms = (v: number) => {
  const s = Math.floor(v);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return [h, m, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
};

const Clock: React.FC<{t: number}> = ({t}) => {
  if (t < B.clockIn - 0.05 || t > B.clockOut + 0.5) return null;
  const inP = pt(t, B.clockIn, B.clockIn + 0.5);
  const outP = pt(t, B.clockOut, B.clockOut + 0.4, ease.in);
  const intensity = pt(t, 12.4, 15.0, ease.in);
  const shake = intensity * 3 * Math.sin(t * 61) * (t < B.clockOut ? 1 : 0);
  const hit = 1 - pt(t, 15.0, 15.5);
  const text = hms(clockValue(t));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 640,
        transform: `translate(${shake}px, -50%) scale(${lerp(1.4, 1, inP) * (1 + intensity * 0.1 + (t > 15 ? hit * 0.05 : 0)) * (1 + outP * 0.4)})`,
        opacity: inP * (1 - outP),
        filter: `blur(${(1 - inP) * 14 + outP * 18}px)`,
        textAlign: 'center',
        fontFamily: FONT,
      }}
    >
      <div style={{fontSize: 26, fontWeight: 600, letterSpacing: '0.42em', color: C.grey, marginBottom: 18}}>NO REPLY</div>
      <div
        style={{
          display: 'inline-flex',
          fontSize: 150,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: C.white,
          textShadow: `0 0 ${20 + intensity * 50}px rgba(255,255,255,${0.15 + intensity * 0.3})`,
        }}
      >
        {text.split('').map((ch, i) => (
          <span key={i} style={{width: ch === ':' ? 46 : 92, textAlign: 'center', color: ch === ':' ? C.grey : undefined}}>
            {ch}
          </span>
        ))}
      </div>
      {/* elapsed bar */}
      <div style={{width: 560, height: 3, margin: '26px auto 0', background: 'rgba(255,255,255,0.08)', borderRadius: 3}}>
        <div style={{width: `${Math.min(1, Math.log10(1 + clockValue(t)) / Math.log10(86401)) * 100}%`, height: '100%', background: C.white, borderRadius: 3, boxShadow: '0 0 12px rgba(255,255,255,0.6)'}} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ LEAD LOST
const LeadLost: React.FC<{t: number}> = ({t}) => {
  const [a, b] = B.lostText;
  if (t < a - 0.05 || t > b + 0.3) return null;
  const pull = pt(t, B.lostPull, B.lostPull + 0.9, ease.in);
  return (
    <>
      <Words t={t} text="LEAD" at={a} out={b - 0.45} size={176} y={470} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 176, letterSpacing: '-0.02em', color: C.white}}>
        {'LOST'.split('').map((ch, i) => {
          const p = pt(t, a + 0.25 + i * 0.05, a + 0.8 + i * 0.05);
          const k = pt(pull, i * 0.12, 0.55 + i * 0.12, ease.in);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translate(${k * (700 + i * 180)}px, ${-k * (260 + i * 60)}px) scaleX(${1 + k * 3.5})`,
                transformOrigin: '0% 50%',
                filter: `blur(${(1 - p) * 16 + k * 22}px)`,
                opacity: p * (1 - k),
                color: lerp(0, 1, k) > 0.05 ? C.metal : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ final lockup
const FinalLine: React.FC<{t: number}> = ({t}) => {
  if (t < 44.1) return null;
  const grow = pt(t, 44.1, 44.9, ease.inOut);
  const move = pt(t, B.final - 0.1, B.final + 0.7, ease.inOut);
  const w = lerp(lerp(40, 860, grow), 420, move);
  const y = lerp(960, 1165, move);
  const shimmer = (t * 0.35) % 1;
  return (
    <div style={{position: 'absolute', left: 540 - w / 2, top: y - 2, width: w, height: 4, borderRadius: 4, background: C.lime, boxShadow: `0 0 18px ${C.lime}, 0 0 60px rgba(${C.limeRGB},0.45)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: `${shimmer * 140 - 20}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)'}} />
    </div>
  );
};

const Final: React.FC<{t: number}> = ({t}) => {
  const f = B.final;
  const cta = pt(t, f + 0.9, f + 1.5);
  return (
    <>
      <FinalLine t={t} />
      <Words t={t} text="Lead मिलना" at={B.textStart} out={f - 0.35} size={104} y={720} dim={pt(t, B.textConvert, B.textConvert + 0.5)} />
      <Words t={t} text="शुरुआत है." at={B.textStart + 0.18} out={f - 0.35} size={104} y={850} dim={pt(t, B.textConvert, B.textConvert + 0.5)} />
      <Words t={t} text="Follow-up ही" at={B.textConvert} out={f - 0.35} size={92} y={1080} />
      <Words t={t} text="*conversion* बनाता है." at={B.textConvert + 0.2} out={f - 0.35} size={92} y={1200} />
      <Words t={t} text="AUTOMATE" at={f + 0.1} size={132} y={760} stagger={0} />
      <Words t={t} text="YOUR" at={f + 0.22} size={132} y={915} stagger={0} />
      <Words t={t} text="*FOLLOW-UP.*" at={f + 0.34} size={132} y={1070} stagger={0} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1250,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.34em',
          color: C.white,
          opacity: cta,
          transform: `translateY(${(1 - cta) * 18}px)`,
        }}
      >
        <span style={{width: 10, height: 10, borderRadius: 10, background: C.lime, boxShadow: `0 0 14px ${C.lime}`}} />
        NEURAXINE AI AUTOMATION
      </div>
    </>
  );
};

// ------------------------------------------------------------------ all screen-space type
export const Hud: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Words t={t} text="एक *Lead.*" at={B.textLead[0]} out={B.textLead[1] - 0.4} size={128} y={600} />
    <Clock t={t} />
    <LeadLost t={t} />
    {/* 100 leads */}
    <Words t={t} text="*100*" at={B.text100[0]} out={B.text100[1] - 0.4} size={168} y={300} />
    <Words t={t} text="LEADS" at={B.text100[0] + 0.12} out={B.text100[1] - 0.4} size={56} weight={700} color={C.metal} y={430} />
    <Words t={t} text="हर missed follow-up" at={B.textMissed[0]} out={B.textMissed[1] - 0.45} size={70} y={1560} />
    <Words t={t} text="= potential *revenue* lost." at={B.textMissed[0] + 0.35} out={B.textMissed[1] - 0.45} size={52} weight={600} color={C.metal} y={1665} />
    {/* the freeze */}
    <Words t={t} text="Leads की" at={B.textNoLack} out={B.freezeOut} size={104} y={640} dim={pt(t, B.textSpeed, B.textSpeed + 0.4) * 0.6} />
    <Words t={t} text="कमी नहीं है." at={B.textNoLack + 0.15} out={B.freezeOut} size={104} y={775} dim={pt(t, B.textSpeed, B.textSpeed + 0.4) * 0.6} />
    <Words t={t} text="Follow-up की" at={B.textSpeed} out={B.freezeOut} size={104} y={1010} />
    <Words t={t} text="*speed* की कमी है." at={B.textSpeed + 0.15} out={B.freezeOut} size={104} y={1145} />
    <Final t={t} />
  </AbsoluteFill>
);

/** Grain + vignette over everything. */
export const Lens: React.FC<{t: number}> = ({t}) => {
  const seed = Math.floor(t * 30) % 8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
      <AbsoluteFill
        style={{
          opacity: 0.06,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
          )}")`,
          backgroundPosition: `${rand(seed) * 200}px ${rand(seed + 1) * 200}px`,
        }}
      />
    </AbsoluteFill>
  );
};
