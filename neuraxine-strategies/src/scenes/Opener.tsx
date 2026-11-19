import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {AVATAR, Logo, PHONE_H, PHONE_W, Phone3D} from '../components/Phone3D';

// Avatar offset from the phone centre (phone-local px).
const AX = 20 + AVATAR.x - PHONE_W / 2;
const AY = 20 + AVATAR.y - PHONE_H / 2;

/** Glowing holographic platform: stacked ellipses and a light column. */
export const HoloRing: React.FC<{p: number; cx: number; cy: number; w?: number}> = ({p, cx, cy, w = 520}) => {
  const frame = useCurrentFrame();
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - w * 0.16, width: w, height: w * 0.32, opacity: p}}>
      <div
        style={{
          position: 'absolute',
          left: w * 0.18,
          right: w * 0.18,
          bottom: '50%',
          height: w * 0.9 * p,
          background: `linear-gradient(0deg, rgba(181,241,42,0.28), transparent)`,
          filter: 'blur(14px)',
        }}
      />
      {[1, 0.78, 0.56].map((k, i) => {
        const spin = (frame * (i % 2 ? -1.6 : 2.2)) % 360;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (w * (1 - k)) / 2,
              top: (w * 0.32 * (1 - k)) / 2,
              width: w * k,
              height: w * 0.32 * k,
              borderRadius: '50%',
              border: `${i === 0 ? 4 : 2}px ${i === 1 ? 'dashed' : 'solid'} ${C.accent}`,
              boxShadow: `0 0 ${30 - i * 8}px ${C.accentGlow}, inset 0 0 ${24 - i * 6}px ${C.accentGlow}`,
              transform: `scale(${mix(p, 0.6, 1)}) rotate(${spin * 0.02}deg)`,
              opacity: 1 - i * 0.2,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', inset: '30%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(181,241,42,0.55), transparent)', filter: 'blur(6px)'}} />
    </div>
  );
};

export const Opener: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = prog(frame, 0, 30, ease.out);
  const lift = prog(frame, 30, 26, ease.out) * (1 - prog(frame, 60, 14, ease.in));
  const dive = prog(frame, 56, 26, ease.inOut);
  const avatarLift = prog(frame, 62, 20, ease.out);
  const phoneOut = prog(frame, 80, 12, ease.in);
  const logoIn = prog(frame, 78, 14, ease.out);
  const coin = range(frame, [78, 100], [180, 360], ease.out);
  const drift = Math.sin(frame / 20) * 3;

  const s = mix(dive, mix(spin, 0.38, 0.8), 2.6);
  const rotY = mix(spin, 200, -18) * (1 - dive) + drift;
  const rotX = mix(spin, 30, 14) * (1 - dive) + dive * 40;
  const rotZ = mix(spin, -14, -5) * (1 - dive);
  const tx = -AX * s * dive;
  const ty = -AY * s * dive + mix(spin, 300, 0);

  return (
    <AbsoluteFill style={{perspective: 2200, perspectiveOrigin: '50% 45%'}}>
      {/* soft floor glow under the phone */}
      <div style={{position: 'absolute', left: 140, right: 140, top: 1500, height: 260, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(181,241,42,0.16), transparent)', opacity: spin * (1 - phoneOut)}} />
      <div
        style={{
          position: 'absolute',
          left: 540 - PHONE_W / 2,
          top: 960 - PHONE_H / 2,
          width: PHONE_W,
          height: PHONE_H,
          transformStyle: 'preserve-3d',
          transform: `translate(${tx}px, ${ty}px) scale(${s}) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
          opacity: (1 - phoneOut) * Math.min(1, spin * 3),
          filter: phoneOut > 0 ? `blur(${phoneOut * 18}px)` : spin < 0.6 ? `blur(${(0.6 - spin) * 14}px)` : undefined,
        }}
      >
        <Phone3D lift={lift} avatarLift={avatarLift} />
      </div>
      {/* the avatar becomes the logo on a holographic platform */}
      <HoloRing p={logoIn} cx={540} cy={1180} w={620} />
      {logoIn > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 190,
            top: 760 - 190 + (1 - logoIn) * 120,
            transform: `perspective(1200px) rotateY(${coin}deg) scale(${mix(logoIn, 0.6, 1)})`,
            opacity: logoIn,
            filter: `drop-shadow(0 0 50px ${C.accentGlow})`,
          }}
        >
          <Logo size={380} round style={{border: `4px solid rgba(181,241,42,0.6)`}} />
        </div>
      )}
      {logoIn > 0 && (
        <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, letterSpacing: '0.04em', color: C.ink, opacity: prog(frame, 88, 10), textShadow: `0 0 30px ${C.accentGlow}`}}>
          {BRAND.handle}
        </div>
      )}
    </AbsoluteFill>
  );
};
