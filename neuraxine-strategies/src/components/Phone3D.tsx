import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND, PROFILE} from '../config';
import {C, F} from '../theme';

export const SCREEN_W = 640;
export const SCREEN_H = 1386;
const BEZEL = 20;
export const PHONE_W = SCREEN_W + BEZEL * 2;
export const PHONE_H = SCREEN_H + BEZEL * 2;

// Avatar centre in screen coordinates (used to dive the camera into it).
export const AVATAR = {x: 112, y: 290, r: 82};

export const Logo: React.FC<{size: number; round?: boolean; style?: React.CSSProperties}> = ({size, round, style}) => (
  <div style={{width: size, height: size, borderRadius: round ? 999 : 0, overflow: 'hidden', background: '#000', flexShrink: 0, ...style}}>
    <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${round ? 1.55 : 1})`}} />
  </div>
);

const Verified: React.FC<{size?: number}> = ({size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 1l2.6 2.2 3.4-.4.9 3.3 3 1.6-1.3 3.2 1.3 3.2-3 1.6-.9 3.3-3.4-.4L12 23l-2.6-2.2-3.4.4-.9-3.3-3-1.6 1.3-3.2L2.1 9.9l3-1.6.9-3.3 3.4.4z" fill={C.igBlue} />
    <path d="M7.5 12.2l3 3 6-6" stroke="white" strokeWidth={2.4} fill="none" strokeLinecap="round" />
  </svg>
);

/** One grid tile in the page's own post style: cream paper, black sans line, italic serif line. */
export const Tile: React.FC<{a: string; b: string; views: string; w: number; h: number; i: number}> = ({a, b, views, w, h, i}) => (
  <div
    style={{
      width: w,
      height: h,
      background: C.paper,
      backgroundImage: `linear-gradient(${C.paperGrid} 1px, transparent 1px), linear-gradient(90deg, ${C.paperGrid} 1px, transparent 1px)`,
      backgroundSize: '18px 18px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: F.body,
      borderLeft: i % 3 === 0 ? `4px dashed ${C.waGreen}` : undefined,
    }}
  >
    <div style={{position: 'absolute', top: 8, left: 10, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: C.paperMuted}}>● NEURAXINE</div>
    <svg width={22} height={22} viewBox="0 0 24 24" style={{position: 'absolute', top: 8, right: 8}}>
      <rect x={2} y={2} width={20} height={20} rx={6} fill="white" opacity={0.9} />
      <path d="M10 8l6 4-6 4z" fill={C.paperMuted} />
    </svg>
    <div style={{position: 'absolute', top: 44, left: 0, right: 0, textAlign: 'center', padding: '0 8px'}}>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 19, color: C.paperInk, letterSpacing: '-0.02em', lineHeight: 1.1}}>{a}</div>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 21, color: C.paperInk, lineHeight: 1.1}}>{b}</div>
    </div>
    <div style={{position: 'absolute', left: 22, right: 22, top: 112, bottom: 46, borderRadius: 10, background: 'white', boxShadow: '0 6px 14px rgba(0,0,0,0.12)', display: 'grid', placeItems: 'center'}}>
      <div style={{width: '55%', height: 10, borderRadius: 9, background: i % 2 ? C.waGreen : '#E9E4DA'}} />
    </div>
    <div style={{position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 5, color: 'white', fontWeight: 700, fontSize: 15, textShadow: '0 1px 4px rgba(0,0,0,0.6)'}}>
      <svg width={16} height={16} viewBox="0 0 24 24">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" fill="none" stroke="white" strokeWidth={2.2} />
        <circle cx={12} cy={12} r={3} fill="white" />
      </svg>
      {views}
    </div>
  </div>
);

type Props = {
  /** 0..1: grid tiles lift out of the screen in 3D */
  lift?: number;
  /** 0..1: the avatar rises off the screen */
  avatarLift?: number;
  /** 0..1: Follow → Following */
  followed?: number;
  /** 0..1: Follow button pressed in */
  press?: number;
  /** followers shown */
  followers?: number;
};

/** A light-mode Instagram profile of the brand, in a phone body, built for CSS 3D (preserve-3d). */
export const Phone3D: React.FC<Props> = ({lift = 0, avatarLift = 0, followed = 0, press = 0, followers = PROFILE.followers}) => {
  const tileW = (SCREEN_W - 4) / 3;
  const tileH = tileW * 1.33;
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 92,
        padding: BEZEL,
        background: 'linear-gradient(150deg, #3A403C, #121513 45%, #050605)',
        boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.12), 0 0 0 2px rgba(181,241,42,0.12)`,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 74,
          background: '#FFFFFF',
          position: 'relative',
          overflow: lift > 0 || avatarLift > 0 ? 'visible' : 'hidden',
          transformStyle: 'preserve-3d',
          fontFamily: F.body,
          color: '#111',
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: 74, overflow: 'hidden', background: 'white'}}>
          {/* status bar */}
          <div style={{position: 'absolute', top: 22, left: 50, right: 50, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 24}}>
            <span>15:59</span>
            <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              <span style={{width: 34, height: 16, borderRadius: 4, border: '2px solid #111', position: 'relative'}}>
                <span style={{position: 'absolute', inset: 2, right: 10, background: '#111', borderRadius: 2}} />
              </span>
            </span>
          </div>
          <div style={{position: 'absolute', top: 16, left: '50%', marginLeft: -64, width: 128, height: 36, borderRadius: 30, background: '#000'}} />
          {/* header */}
          <div style={{position: 'absolute', top: 92, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 44, fontWeight: 300, width: 40}}>+</span>
            <span style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 34, letterSpacing: '-0.01em'}}>
              {BRAND.handle} <Verified size={28} />
            </span>
            <span style={{width: 40, display: 'flex', flexDirection: 'column', gap: 6}}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{height: 3, borderRadius: 2, background: '#111'}} />
              ))}
            </span>
          </div>
          {/* avatar placeholder ring (the real avatar is a 3D layer below) */}
          <div style={{position: 'absolute', left: AVATAR.x - AVATAR.r - 6, top: AVATAR.y - AVATAR.r - 6, width: (AVATAR.r + 6) * 2, height: (AVATAR.r + 6) * 2, borderRadius: 999, border: '3px solid #E3E3E3'}} />
          {/* name + stats */}
          <div style={{position: 'absolute', left: 230, top: 196, fontWeight: 700, fontSize: 27}}>{BRAND.name}</div>
          <div style={{position: 'absolute', left: 230, right: 24, top: 246, display: 'flex', justifyContent: 'space-between'}}>
            {[
              [String(PROFILE.posts), 'posts'],
              [followers.toLocaleString('en-IN'), 'followers'],
              [String(PROFILE.following), 'following'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{fontWeight: 800, fontSize: 30}}>{n}</div>
                <div style={{fontSize: 23, color: '#333'}}>{l}</div>
              </div>
            ))}
          </div>
          {/* bio */}
          <div style={{position: 'absolute', left: 32, right: 32, top: 400, fontSize: 24, lineHeight: 1.4, color: '#222'}}>
            {PROFILE.bio.map((b) => (
              <div key={b}>{b}</div>
            ))}
            <div style={{color: '#3A4BB5', fontWeight: 600}}>{BRAND.site}/</div>
          </div>
          {/* buttons */}
          <div style={{position: 'absolute', left: 24, right: 24, top: 578, display: 'flex', gap: 10}}>
            <div
              style={{
                flex: 1.2,
                height: 62,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 25,
                background: followed > 0.5 ? '#EFEFEF' : C.igBlue,
                color: followed > 0.5 ? '#111' : 'white',
                transform: `scale(${1 - press * 0.08})`,
              }}
            >
              {followed > 0.5 ? 'Following ✓' : 'Follow'}
            </div>
            {['Message', 'Contact'].map((b) => (
              <div key={b} style={{flex: 1, height: 62, borderRadius: 14, background: '#EFEFEF', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 25}}>
                {b}
              </div>
            ))}
          </div>
          {/* tabs */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 672, height: 60, display: 'flex', borderBottom: '1px solid #E5E5E5'}}>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{flex: 1, display: 'grid', placeItems: 'center', borderBottom: k === 0 ? '3px solid #111' : undefined}}>
                <div style={{width: 30, height: 30, borderRadius: k === 0 ? 4 : 8, border: '3px solid #222', opacity: k === 0 ? 1 : 0.6}} />
              </div>
            ))}
          </div>
        </div>
        {/* grid tiles: separate 3D layers so they can lift out */}
        {PROFILE.tiles.map((t, i) => {
          const c = i % 3;
          const r = Math.floor(i / 3);
          const stagger = Math.max(0, Math.min(1, lift * 1.6 - i * 0.12));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c * (tileW + 2),
                top: 734 + r * (tileH + 2),
                transform: `translateZ(${stagger * (140 + (i % 3) * 50)}px) rotateX(${-stagger * 8}deg)`,
                boxShadow: stagger > 0 ? `0 ${30 * stagger}px ${60 * stagger}px rgba(0,0,0,${0.5 * stagger})` : undefined,
                borderRadius: stagger * 18,
                overflow: 'hidden',
              }}
            >
              <Tile {...t} w={tileW} h={tileH} i={i} />
            </div>
          );
        })}
        {/* avatar layer */}
        <div
          style={{
            position: 'absolute',
            left: AVATAR.x - AVATAR.r,
            top: AVATAR.y - AVATAR.r,
            transform: `translateZ(${avatarLift * 380}px) scale(${1 + avatarLift * 0.6})`,
            filter: avatarLift > 0 ? `drop-shadow(0 0 ${40 * avatarLift}px ${C.accentGlow})` : undefined,
          }}
        >
          <Logo size={AVATAR.r * 2} round />
        </div>
      </div>
    </div>
  );
};
