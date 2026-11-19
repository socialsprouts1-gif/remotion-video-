import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {AVATAR, Logo, PHONE_H, PHONE_W, Phone3D} from '../components/Phone3D';

// Avatar offset from the phone centre (phone-local px).

/** A quiet floor under the logo: a soft shadow and one thin reflection line (no neon). */
export const HoloRing: React.FC<{p: number; cx: number; cy: number; w?: number}> = ({p, cx, cy, w = 520}) => {
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - w * 0.1, width: w, height: w * 0.2, opacity: p}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)'}} />
      <div style={{position: 'absolute', left: '15%', right: '15%', top: '50%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(242,245,239,0.35), transparent)', transform: `scaleX(${p})`}} />
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
  const logoIn = prog(frame, 80, 8, ease.out);
  const coin = 0;
  const drift = Math.sin(frame / 20) * 3;

  // The camera pivots on the avatar, so the dive lands it exactly where the logo appears.
  const OX = 20 + AVATAR.x; // avatar in phone-local px (transform origin)
  const OY = 20 + AVATAR.y;
  const s0 = mix(spin, 0.38, 0.8);
  const s = mix(dive, s0, 2.6);
  const rotY = mix(spin, 200, -18) * (1 - dive) + drift * (1 - dive);
  const rotX = mix(spin, 30, 14) * (1 - dive) + dive * 30;
  const rotZ = mix(spin, -14, -5) * (1 - dive);
  // phone centre sits on screen centre before the dive; avatar sits on (540, 760) after it
  const cx = PHONE_W / 2 - OX;
  const cy = PHONE_H / 2 - OY;
  const tx = mix(dive, cx * (1 - s0), 540 - (540 - PHONE_W / 2 + OX));
  const ty = mix(dive, cy * (1 - s0) + mix(spin, 300, 0), 760 - (960 - PHONE_H / 2 + OY));

  return (
    <AbsoluteFill style={{perspective: 2200, perspectiveOrigin: '50% 39.6%'}}>
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
          transformOrigin: `${OX}px ${OY}px`,
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
            top: 760 - 190,
            transform: `perspective(1200px) rotateY(${coin}deg) scale(${mix(prog(frame, 80, 30, ease.out), 1, 1.06)})`,
            opacity: logoIn,
            filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))',
          }}
        >
          <Logo size={380} round style={{border: '3px solid rgba(242,245,239,0.18)'}} />
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
