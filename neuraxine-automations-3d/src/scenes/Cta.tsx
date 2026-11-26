import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, PROFILE, cue, wordAt} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {GlassCard} from '../components/GlassCard';
import {BrandIcon} from '../components/BrandIcon';
import {Kicker, KineticText} from '../components/KineticText';
import {Stage} from '../three/Stage';
import {Card3D, Phone, Shadow} from '../three/kit';

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


  return (
    <AbsoluteFill>
      <Stage>
        <group position={[0, -0.18 + (1 - phoneIn) * -2.6 - phoneOut * 2.8, 0]} rotation={[-0.06, -0.35 + phoneIn * 0.35 + drift * 0.02, 0]} scale={mix(zoom, 0.78, 0.86)}>
          <Phone screen="screens/profile.png" />
        </group>
        <Shadow position={[0, -1.12, -0.2]} w={1.7} d={0.5} opacity={phoneIn * (1 - phoneOut)} />
        {lock > 0 && <Card3D img="tex/nx.png" w={1.15} h={1.15} r={0.24} d={0.22} position={[0, 0.5 + (1 - lock) * 1.4, 0.2]} rotation={[0.08, mix(lock, Math.PI * 1.5, 0) + Math.sin(frame / 30) * 0.12, 0]} />}
        {lock > 0 && <Shadow position={[0, -0.25, 0]} w={1.5} d={0.45} opacity={lock} />}
      </Stage>
      <div style={{opacity: 1 - titleOut}}>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Kicker text="FREE AUTOMATION PLAN" start={2} />
        </div>
        <div style={{position: 'absolute', top: 240, left: 0, right: 0}}>
          <KineticText lines={['Comment karo', `*${BRAND.keyword}*`]} start={6} stagger={4} size={120} />
        </div>
      </div>
      {/* comment GROW */}
      {boxIn > 0 && (
        <div style={{position: 'absolute', left: 110, right: 110, top: 1250, opacity: boxIn, transform: `translateY(${(1 - boxIn) * 80}px) rotateX(${(1 - boxIn) * 30}deg)`}}>
          <GlassCard radius={30} style={{padding: '22px 24px', background: '#FFFFFF', border: 'none', boxShadow: SHADOW.card}}>
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
      {/* follow */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', opacity: prog(frame, follow - 24, 12, ease.out) * (1 - phoneOut)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px 14px 14px', borderRadius: 999, background: '#fff', boxShadow: SHADOW.card, fontFamily: F.body}}>
          <BrandIcon name="instagram" size={44} />
          <span style={{fontWeight: 800, fontSize: 30, color: C.ink}}>@{BRAND.handle}</span>
          <span style={{padding: '12px 26px', borderRadius: 999, background: followed > 0.5 ? '#EEF0EE' : C.accent, color: followed > 0.5 ? C.ink : '#fff', fontWeight: 800, fontSize: 28, transform: `scale(${1 - press * 0.1})`}}>{followed > 0.5 ? 'Following ✓' : 'Follow'}</span>
        </div>
      </div>
      {/* lockup text */}
      {lock > 0 && (
        <div style={{position: 'absolute', top: 1190, left: 0, right: 0, textAlign: 'center', opacity: prog(frame, end + 12, 14)}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 100, letterSpacing: '0.02em', color: C.ink}}>{BRAND.name.toUpperCase()}</div>
          <div style={{marginTop: 6, fontFamily: F.body, fontWeight: 700, fontSize: 27, letterSpacing: '0.46em', color: C.accent}}>{BRAND.tagline.toUpperCase()}</div>
          <div style={{marginTop: 34, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.muted, opacity: prog(frame, end + 22, 14)}}>{BRAND.site}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
