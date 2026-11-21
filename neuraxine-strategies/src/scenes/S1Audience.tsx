import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CHAPTERS, PERSONA, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, rand} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {GlassCard} from '../components/GlassCard';

const fr = (s: number) => Math.round(s * 30);
const COLS = 11;
const ROWS = 9;
const SP = 82;
const GX = 540 - ((COLS - 1) * SP) / 2;
const GY = 560;
const TC = {c: 7, r: 3}; // the ideal-customer cluster

export const S1Audience: React.FC = () => {
  const frame = useCurrentFrame();
  const spray = fr(cue('s1', 1));
  const pick = fr(wordAt('s1', 1, 'ideal'));
  const card = fr(wordAt('s1', 1, 'sirf'));
  const scanP = prog(frame, spray + 30, pick - spray - 30, ease.inOut);
  const sel = prog(frame, pick, 14, ease.out);
  const cardP = prog(frame, card, 18, ease.out);
  const tx = GX + TC.c * SP;
  const ty = GY + TC.r * SP;
  const rx = mix(scanP, GX + SP, tx);
  const ry = mix(scanP, GY + 6 * SP, ty) + Math.sin(scanP * Math.PI) * -120;
  const scanOn = prog(frame, spray + 24, 10) * (1 - prog(frame, card + 10, 12));
  return (
    <AbsoluteFill>
      <ChapterHeader n={1} start={4} />
      {Array.from({length: ROWS * COLS}).map((_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const x = GX + c * SP;
        const y = GY + r * SP;
        const appear = prog(frame, 34 + (c + r) * 1.4, 12, ease.out);
        const d = Math.hypot(c - TC.c, r - TC.r);
        const target = d < 1.6;
        // "sell to everyone": every dot flickers orange at random
        const flick = frame > spray && frame < pick ? (rand(i * 3 + Math.floor(frame / 5)) > 0.8 ? 1 : 0) : 0;
        const dim = target ? 1 : mix(sel, 1, 0.16);
        const pull = target ? sel * 0.32 : 0;
        const px = x + (tx - x) * pull;
        const py = y + (ty - y) * pull;
        const size = target ? mix(sel, 18, 26) : 18;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: 99,
              background: (target && sel > 0.3) || flick ? C.accent : C.ink,
              opacity: appear * dim * (flick ? 1 : 0.85),
              boxShadow: target && sel > 0.3 ? `0 0 18px ${C.accentGlow}` : undefined,
              transform: `scale(${mix(appear, 0.2, 1)})`,
            }}
          />
        );
      })}
      {/* scanning reticle */}
      {scanOn > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: scanOn}}>
          <circle cx={rx} cy={ry} r={mix(sel, 70, 150)} fill="none" stroke={C.accent} strokeWidth={3} />
          <circle cx={rx} cy={ry} r={mix(sel, 100, 190)} fill="none" stroke={C.accent} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1={rx} y1={ry} x2={rx} y2={ry - mix(sel, 120, 210)} stroke={C.accent} strokeWidth={2} strokeOpacity={0.6} transform={`rotate(${a} ${rx} ${ry})`} strokeDasharray="0 80 40" />
          ))}
        </svg>
      )}
      {/* persona */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 1150, opacity: cardP, transform: `translateY(${(1 - cardP) * 80}px)`}}>
        <GlassCard radius={30} strong glow={0.5} style={{padding: '26px 30px', background: 'rgba(18,16,14,0.88)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <div style={{width: 92, height: 92, borderRadius: 99, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`, display: 'grid', placeItems: 'center', fontFamily: F.serif, fontSize: 52, color: '#1A0700'}}>R</div>
            <div style={{flex: 1}}>
              <div style={{color: C.accent, fontFamily: F.body, fontWeight: 700, fontSize: 20, letterSpacing: '0.24em'}}>IDEAL CUSTOMER</div>
              <div style={{color: C.ink, fontFamily: F.serif, fontSize: 52, lineHeight: 1.1}}>{PERSONA.name}</div>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18}}>
            {PERSONA.rows.map((r, i) => {
              const p = prog(frame, card + 8 + i * 5, 12, ease.out);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, color: C.ink, fontFamily: F.body, fontWeight: 600, fontSize: 29, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
                  <span style={{width: 10, height: 10, borderRadius: 99, background: C.accent}} />
                  {r}
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};
