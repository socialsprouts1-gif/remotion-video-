import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {Kicker, KineticText} from '../components/KineticText';

const fr = (s: number) => Math.round(s * 30);

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = fr(wordAt('cta', 0, 'grow'));
  const follow = fr(wordAt('cta', 1, 'follow'));
  const boxIn = prog(frame, 20, 18, ease.out);
  const typeP = prog(frame, grow - 30, 24, (x) => x);
  const typed = BRAND.keyword.slice(0, Math.round(typeP * BRAND.keyword.length));
  const sent = prog(frame, grow, 12, ease.out);
  const press = prog(frame, grow - 3, 3) * (1 - prog(frame, grow + 1, 6));
  const profIn = prog(frame, follow - 30, 18, ease.out);
  const fol = prog(frame, follow, 10, ease.out);
  const fpress = prog(frame, follow - 3, 3) * (1 - prog(frame, follow + 1, 6));
  const caret = Math.floor(frame / 12) % 2 === 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Kicker text="FREE MARKETING PLAN" start={4} />
      </div>
      <div style={{position: 'absolute', top: 270, left: 0, right: 0}}>
        <KineticText lines={['Comment karo', `*${BRAND.keyword}*`]} start={8} stagger={4} size={128} />
      </div>
      {/* comment box */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 690, opacity: boxIn, transform: `translateY(${(1 - boxIn) * 60}px)`}}>
        <GlassCard radius={30} strong style={{padding: '26px 28px', background: 'rgba(20,17,14,0.9)'}}>
          <div style={{color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 22, letterSpacing: '0.2em', marginBottom: 18}}>COMMENTS</div>
          <div style={{display: 'grid', gridTemplateRows: `${sent}fr`}}>
            <div style={{minHeight: 0, overflow: 'hidden'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 22, opacity: sent}}>
                <div style={{width: 64, height: 64, borderRadius: 99, background: 'hsl(200 35% 40%)', display: 'grid', placeItems: 'center', color: C.ink, fontFamily: F.serif, fontSize: 34}}>Y</div>
                <div style={{flex: 1}}>
                  <div style={{color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 22}}>you · abhi</div>
                  <div style={{color: C.accent, fontFamily: F.display, fontWeight: 900, fontSize: 44}}>{BRAND.keyword}</div>
                </div>
                <div style={{color: C.muted, fontFamily: F.body, fontSize: 22, fontWeight: 600}}>Plan DM mein aayega</div>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1, height: 82, borderRadius: 999, border: `1.5px solid ${sent > 0.5 ? C.line : C.lineStrong}`, display: 'flex', alignItems: 'center', paddingLeft: 30, fontFamily: F.display, fontWeight: 800, fontSize: 36}}>
              {sent > 0.5 ? (
                <span style={{color: C.dim, fontFamily: F.body, fontWeight: 500, fontSize: 30}}>Add a comment…</span>
              ) : typed ? (
                <span style={{color: C.ink}}>
                  {typed}
                  <span style={{opacity: caret ? 1 : 0, color: C.accent}}>|</span>
                </span>
              ) : (
                <span style={{color: C.dim, fontFamily: F.body, fontWeight: 500, fontSize: 30}}>Add a comment…</span>
              )}
            </div>
            <div style={{width: 82, height: 82, borderRadius: 99, background: C.accent, display: 'grid', placeItems: 'center', transform: `scale(${1 - press * 0.15})`, boxShadow: `0 0 26px ${C.accentGlow}`}}>
              <svg width={34} height={34} viewBox="0 0 24 24">
                <path d="M3 11.5L21 3l-7.5 18-2.6-7.4z" fill="#1A0700" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </div>
      {/* follow */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1140, opacity: profIn, transform: `translateY(${(1 - profIn) * 60}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 30, border: `1.5px solid ${C.line}`}}>
          <div style={{width: 96, height: 96, borderRadius: 99, padding: 4, background: `conic-gradient(${C.accent}, #FFB088, ${C.accent})`}}>
            <div style={{width: '100%', height: '100%', borderRadius: 99, background: C.bg2, display: 'grid', placeItems: 'center', color: C.accent, fontFamily: F.serif, fontSize: 46}}>M</div>
          </div>
          <div style={{flex: 1}}>
            <div style={{color: C.ink, fontFamily: F.body, fontWeight: 700, fontSize: 32}}>{BRAND.handle}</div>
            <div style={{color: C.muted, fontFamily: F.body, fontWeight: 500, fontSize: 24, marginTop: 4}}>Roz ek marketing tip</div>
          </div>
          <div
            style={{
              padding: '18px 30px',
              borderRadius: 16,
              background: fol > 0.5 ? 'transparent' : C.accent,
              border: `2px solid ${fol > 0.5 ? C.lineStrong : C.accent}`,
              color: fol > 0.5 ? C.ink : '#1A0700',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 30,
              transform: `scale(${(1 - fpress * 0.12) * (1 + Math.sin(fol * Math.PI) * 0.1)})`,
            }}
          >
            {fol > 0.5 ? 'Following ✓' : 'Follow'}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1450, left: 0, right: 0, textAlign: 'center', color: C.muted, fontFamily: F.serif, fontSize: 48, opacity: prog(frame, follow + 10, 18), transform: `translateY(${mix(prog(frame, follow + 10, 18, ease.out), 20, 0)}px)`}}>
        Marketing ko system banao.
      </div>
    </AbsoluteFill>
  );
};
