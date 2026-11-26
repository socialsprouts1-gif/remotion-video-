// Phone-screen stills, rendered to public/tex/ by scripts/make_textures.mjs and used as 3D phone screens.
import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {BIZ} from '../config';
import {C, F} from '../theme';
import {AMark} from '../components/AsaadixLogo';

const Status: React.FC<{time: string; dark?: boolean}> = ({time, dark}) => (
  <div style={{position: 'absolute', top: 26, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dark ? '#fff' : '#111'}}>
    <span>{time}</span>
    <span style={{width: 40, height: 18, borderRadius: 5, border: `2px solid ${dark ? '#fff' : '#111'}`, position: 'relative'}}>
      <span style={{position: 'absolute', inset: 2, right: 8, background: dark ? '#fff' : '#111', borderRadius: 2}} />
    </span>
  </div>
);

const TILES = [
  ['#E9DCC6', '#B89466'],
  ['#1C1A18', '#5A4A36'],
  ['#D8C3A2', '#8C6B44'],
  ['#2A2522', '#C9A24A'],
  ['#EFE6D6', '#A88A5E'],
  ['#3B302A', '#D9B97A'],
  ['#F2EBDF', '#6E5A40'],
  ['#14110E', '#9C7A2C'],
  ['#E2D3BB', '#4B3C2C'],
];

/** Instagram profile of the sample UAE boutique. */
const Insta: React.FC = () => (
  <AbsoluteFill style={{background: '#fff', fontFamily: F.body, color: '#111'}}>
    <Status time="9:41" />
    <div style={{position: 'absolute', top: 92, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 12}}>
      <span style={{fontSize: 42}}>‹</span>
      <span style={{flex: 1, fontWeight: 800, fontSize: 32}}>{BIZ.handle}</span>
      <span style={{fontSize: 34, letterSpacing: 4}}>···</span>
    </div>
    <div style={{position: 'absolute', top: 180, left: 30, width: 168, height: 168, borderRadius: 99, padding: 6, background: 'conic-gradient(#FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 99, border: '5px solid #fff', background: 'linear-gradient(140deg, #1C1A18, #5A4A36)', display: 'grid', placeItems: 'center', color: '#E2BE68', fontFamily: F.serif, fontSize: 84}}>B</div>
    </div>
    <div style={{position: 'absolute', left: 236, top: 196, fontWeight: 700, fontSize: 28}}>{BIZ.name} · Dubai</div>
    <div style={{position: 'absolute', left: 236, right: 26, top: 246, display: 'flex', justifyContent: 'space-between'}}>
      {[['148', 'posts'], ['12.4K', 'followers'], ['320', 'following']].map(([n, l]) => (
        <div key={l}>
          <div style={{fontWeight: 800, fontSize: 32}}>{n}</div>
          <div style={{fontSize: 23, color: '#333'}}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 32, right: 32, top: 380, fontSize: 24, lineHeight: 1.45, color: '#222'}}>
      <div>Luxury abayas · Dubai Mall</div>
      <div>Same-day delivery across the UAE</div>
      <div>DM to order</div>
    </div>
    <div style={{position: 'absolute', left: 24, right: 24, top: 526, display: 'flex', gap: 10}}>
      {['Following', 'Message', 'WhatsApp'].map((b, i) => (
        <div key={b} style={{flex: 1, height: 62, borderRadius: 14, background: '#EFEFEF', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 24}}>{i === 0 ? 'Following ⌄' : b}</div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 616, height: 58, display: 'flex', borderBottom: '1px solid #E5E5E5'}}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{flex: 1, display: 'grid', placeItems: 'center', borderBottom: k === 0 ? '3px solid #111' : undefined}}>
          <div style={{width: 28, height: 28, borderRadius: 5, border: '3px solid #222', opacity: k === 0 ? 1 : 0.5}} />
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 676, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2}}>
      {TILES.map(([a, b], i) => (
        <div key={i} style={{height: 268, background: `linear-gradient(${150 + i * 20}deg, ${a}, ${b})`, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: '32%', right: '32%', top: '18%', bottom: -10, borderRadius: '50% 50% 8px 8px', background: i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)'}} />
          <div style={{position: 'absolute', left: '42%', right: '42%', top: '8%', height: '16%', borderRadius: 99, background: i % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)'}} />
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

/** What visitors see when the account is gone. */
const Gone: React.FC = () => (
  <AbsoluteFill style={{background: '#fff', fontFamily: F.body, color: '#111'}}>
    <Status time="9:42" />
    <div style={{position: 'absolute', top: 92, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 12}}>
      <span style={{fontSize: 42}}>‹</span>
      <span style={{flex: 1, fontWeight: 800, fontSize: 32}}>asaadix_digital</span>
    </div>
    <div style={{position: 'absolute', top: 470, left: 60, right: 60, textAlign: 'center'}}>
      <div style={{width: 150, height: 150, margin: '0 auto', borderRadius: 99, border: '5px solid #111', display: 'grid', placeItems: 'center', fontSize: 80, fontWeight: 300}}>!</div>
      <div style={{marginTop: 40, fontWeight: 800, fontSize: 40}}>Sorry, this page isn't available.</div>
      <div style={{marginTop: 20, fontSize: 27, color: '#555', lineHeight: 1.4}}>The link you followed may be broken, or the page may have been removed.</div>
    </div>
  </AbsoluteFill>
);

type M = {from: 'in' | 'out'; text?: string; node?: React.ReactNode; time: string};
/** The business's own chat app (dark, gold), answered by AI at night. */
const ChatApp: React.FC<{msgs: M[]}> = ({msgs}) => (
  <AbsoluteFill style={{background: '#0F0D0B', fontFamily: F.body}}>
    <Status time="2:47" dark />
    <div style={{position: 'absolute', top: 90, left: 0, right: 0, height: 130, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
      <div style={{width: 76, height: 76, borderRadius: 99, background: 'linear-gradient(140deg, #1C1A18, #5A4A36)', border: `2px solid ${C.gold}`, display: 'grid', placeItems: 'center', color: C.goldBright, fontFamily: F.serif, fontSize: 40}}>B</div>
      <div style={{flex: 1}}>
        <div style={{color: '#fff', fontWeight: 700, fontSize: 30}}>Bloom Abaya · Chat</div>
        <div style={{color: C.ok, fontWeight: 600, fontSize: 22}}>● AI assistant · online 24/7</div>
      </div>
    </div>
    <div style={{position: 'absolute', top: 240, left: 24, right: 24, bottom: 140, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
      {msgs.map((m, i) => {
        const out = m.from === 'out';
        return (
          <div key={i} style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginTop: 14}}>
            <div style={{maxWidth: '82%', background: out ? '#2A2622' : `linear-gradient(140deg, ${C.goldBright}, ${C.gold})`, color: out ? '#F6F1E8' : '#1A1206', borderRadius: 20, borderTopRightRadius: out ? 6 : 20, borderTopLeftRadius: out ? 20 : 6, padding: '14px 18px', fontSize: 27, fontWeight: out ? 500 : 600, lineHeight: 1.32}}>
              {m.node ?? m.text}
              <div style={{fontSize: 18, opacity: 0.6, marginTop: 6, textAlign: 'right'}}>{m.time}</div>
            </div>
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', left: 22, right: 22, bottom: 40, height: 76, borderRadius: 40, background: '#1E1B18', display: 'flex', alignItems: 'center', padding: '0 12px 0 28px', color: '#7A7064', fontSize: 26}}>
      <span style={{flex: 1}}>Type a message…</span>
      <span style={{width: 56, height: 56, borderRadius: 99, background: C.gold}} />
    </div>
  </AbsoluteFill>
);

const Pdf: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <div style={{width: 52, height: 62, borderRadius: 8, background: '#1A1206', color: C.goldBright, fontWeight: 800, fontSize: 15, display: 'grid', placeItems: 'center'}}>PDF</div>
    <div>
      <div style={{fontWeight: 700}}>Collection-2026.pdf</div>
      <div style={{fontSize: 20, opacity: 0.75}}>Prices in AED</div>
    </div>
  </div>
);

const Q = {from: 'out' as const, text: 'Hi, price for the black abaya? Do you deliver to Abu Dhabi?', time: '2:47 AM'};
export const PHONE_SCREENS: Record<string, React.ReactNode> = {
  ig: <Insta />,
  gone: <Gone />,
  chat1: <ChatApp msgs={[Q]} />,
  chat2: (
    <ChatApp
      msgs={[
        Q,
        {from: 'in', text: 'Hi Fatima! The black abaya is AED 450, and yes, next-day delivery to Abu Dhabi.', time: '2:47 AM'},
        {from: 'in', node: <Pdf />, time: '2:47 AM'},
        {from: 'out', text: 'Perfect, I want to order 2.', time: '2:48 AM'},
        {from: 'in', text: 'Done ✓ Order #2316 confirmed. Payment link sent.', time: '2:48 AM'},
      ]}
    />
  ),
};

export const TexPhone: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  return <AbsoluteFill>{PHONE_SCREENS[id]}</AbsoluteFill>;
};

const ICON_PATHS: Record<string, string[]> = {
  lock: ['M5 11h14v10H5z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  flag: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
  ban: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M5.6 5.6l12.8 12.8'],
  globe: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M3 12h18', 'M12 3c2.5 3 2.5 15 0 18', 'M12 3c-2.5 3-2.5 15 0 18'],
  db: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  chat: ['M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
};
const RED = new Set(['lock', 'flag', 'ban']);

/** Square face textures for the 3D app-icon tiles. */
export const TexSquare: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  if (id === 'ig')
    return (
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center'}}>
        <svg width={320} height={320} viewBox="0 0 24 24">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="#fff" strokeWidth={2.1} />
          <circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth={2.1} />
          <circle cx="17.4" cy="6.6" r="1.35" fill="#fff" />
        </svg>
      </AbsoluteFill>
    );
  const red = RED.has(id);
  return (
    <AbsoluteFill style={{background: red ? 'linear-gradient(160deg, #FF6B6B, #D7263D)' : 'linear-gradient(160deg, #23201C, #0B0A09)', display: 'grid', placeItems: 'center'}}>
      <svg width={290} height={290} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F5DB97" />
            <stop offset="0.55" stopColor="#C9A24A" />
            <stop offset="1" stopColor="#9C7A2C" />
          </linearGradient>
        </defs>
        {(ICON_PATHS[id] ?? []).map((d, i) => (
          <path key={i} d={d} fill="none" stroke={red ? '#fff' : 'url(#g)'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
