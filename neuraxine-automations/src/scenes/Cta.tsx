import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, PROFILE, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {Kicker, KineticText} from '../components/KineticText';
import {Logo, PHONE_H, PHONE_W, Phone3D} from '../components/Phone3D';
import {HoloRing} from './Opener';

const fr = (s: number) => Math.round(s * 30);

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = fr(wordAt('cta', 0, 'automate'));
  const follow = fr(wordAt('cta', 1, 'follow'));
  const end = fr(cue('cta', 1, 'end'));
  const phoneIn = prog(frame, 6, 22, ease.out);
  const typeP = prog(frame, grow - 30, 24, (x) => x);
  const typed = BRAND.keyword.slice(0, Math.round(typeP * BRAND.keyword.length));
  const sent = prog(frame, grow, 10, ease.out);
  const boxIn = prog(frame, grow - 40, 14, ease.out) * (1 - prog(frame, grow + 34, 12, ease.in));
  const zoom = prog(frame, follow - 26, 20, ease.inOut);
  const followed = prog(frame, follow, 6);
  const press = prog(frame, follow - 3, 3) * (1 - prog(frame, follow + 1, 6));
  const lock = prog(frame, end + 4, 18, ease.out);
  const phoneOut = prog(frame, end, 14, ease.in);
  const titleOut = prog(frame, end - 4, 10, ease.in);
  const caret = Math.floor(frame / 12) % 2 === 0;
  const drift = Math.sin(frame / 30) * 4;

  const s = mix(zoom, 0.6, 0.95);
  const ty = mix(zoom, 1160, 1060 + 84 * 0.95) + (1 - phoneIn) * 900 + phoneOut * 1100;

  return (
    <AbsoluteFill style={{perspective: 2200}}>
      <div style={{opacity: 1 - titleOut}}>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Kicker text="FREE AUTOMATION PLAN" start={2} />
        </div>
        <div style={{position: 'absolute', top: 240, left: 0, right: 0}}>
          <KineticText lines={['Comment karo', `*${BRAND.keyword}*`]} start={6} stagger={4} size={120} />
        </div>
      </div>
      {/* the brand profile */}
      <div
        style={{
          position: 'absolute',
          left: 540 - PHONE_W / 2,
          top: ty - PHONE_H / 2,
          width: PHONE_W,
          height: PHONE_H,
          transformStyle: 'preserve-3d',
          transform: `scale(${s}) rotateX(${mix(zoom, 10, 4)}deg) rotateY(${mix(zoom, -16, 0) + drift}deg) rotateZ(${mix(phoneIn, 8, 0)}deg)`,
          opacity: phoneIn * (1 - phoneOut),
          filter: phoneOut > 0 ? `blur(${phoneOut * 14}px)` : undefined,
        }}
      >
        <Phone3D followed={followed} press={press} followers={PROFILE.followers + (followed > 0.5 ? 1 : 0)} />
      </div>
      {/* comment GROW */}
      {boxIn > 0 && (
        <div style={{position: 'absolute', left: 110, right: 110, top: 1330, opacity: boxIn, transform: `translateY(${(1 - boxIn) * 80}px) rotateX(${(1 - boxIn) * 30}deg)`}}>
          <GlassCard radius={30} strong glow={0.5} style={{padding: '22px 24px', background: 'rgba(8,12,10,0.92)'}}>
            {sent > 0 && (
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, opacity: sent, transform: `translateY(${(1 - sent) * 20}px)`}}>
                <div style={{width: 56, height: 56, borderRadius: 99, background: 'hsl(200 35% 40%)', display: 'grid', placeItems: 'center', color: C.ink, fontFamily: F.serif, fontSize: 30}}>Y</div>
                <div style={{flex: 1}}>
                  <div style={{color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 20}}>you · abhi</div>
                  <div style={{color: C.accent, fontFamily: F.display, fontWeight: 900, fontSize: 40, textShadow: 'none'}}>{BRAND.keyword}</div>
                </div>
                <div style={{color: C.muted, fontFamily: F.body, fontSize: 21, fontWeight: 600}}>Plan DM mein aayega</div>
              </div>
            )}
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{flex: 1, height: 74, borderRadius: 999, border: `1.5px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', paddingLeft: 28, fontFamily: F.display, fontWeight: 800, fontSize: 34}}>
                {typed && sent < 0.5 ? (
                  <span style={{color: C.ink}}>
                    {typed}
                    <span style={{opacity: caret ? 1 : 0, color: C.accent}}>|</span>
                  </span>
                ) : (
                  <span style={{color: C.dim, fontFamily: F.body, fontWeight: 500, fontSize: 28}}>Add a comment…</span>
                )}
              </div>
              <div style={{width: 74, height: 74, borderRadius: 99, background: C.accent, display: 'grid', placeItems: 'center', boxShadow: `0 0 26px ${C.accentGlow}`}}>
                <svg width={30} height={30} viewBox="0 0 24 24">
                  <path d="M3 11.5L21 3l-7.5 18-2.6-7.4z" fill="#0A1200" />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
      {/* lockup */}
      {lock > 0 && (
        <>
          <HoloRing p={lock} cx={540} cy={1080} w={640} />
          <div
            style={{
              position: 'absolute',
              left: 540 - 200,
              top: 640 + (1 - lock) * 140,
              transform: `perspective(1200px) rotateY(${mix(lock, 180, 0) + Math.sin(frame / 25) * 8}deg) scale(${mix(lock, 0.6, 1)})`,
              opacity: lock,
            }}
          >
            
            <Logo size={400} style={{background: 'transparent', maskImage: 'radial-gradient(closest-side, black 62%, transparent 100%)', WebkitMaskImage: 'radial-gradient(closest-side, black 62%, transparent 100%)', position: 'relative'}} />
          </div>
          <div style={{position: 'absolute', top: 1230, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, end + 14, 14)}}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 104, letterSpacing: '0.02em', color: C.ink, textShadow: 'none'}}>{BRAND.name.toUpperCase()}</div>
            <div style={{marginTop: 6, fontFamily: F.body, fontWeight: 600, fontSize: 28, letterSpacing: '0.5em', color: C.accent}}>{BRAND.tagline.toUpperCase()}</div>
            <div style={{marginTop: 40, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.muted, opacity: prog(frame, end + 24, 14)}}>{BRAND.site}</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
