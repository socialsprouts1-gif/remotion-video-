import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';
import edit from './edit.json';

// Neuraxine "automate", v3: an original concept, not a copy of the reference.
//  - Type that sits BEHIND him (a per-frame cutout of him, public/clips/person.webm, is layered over the words).
//  - Frame-in-frame: the shot folds into a rounded window and graphics take the space below; he never leaves the screen.
//  - One running story: his day on a 9-to-9 timeline fills with manual work, then AI collapses it and frees the hours.
// Natural, warm grade with only a soft edge falloff. Palette: charcoal, cream, the logo's lime.
const C = {lime: '#A0D306', limeHi: '#C6F23C', char: '#121412', cream: '#F3F1EA', grey: '#8D938E', red: '#FF5A4E'};
const SANS = 'Geist, InterV, sans-serif';
const MONO = '"Geist Mono", monospace';
const FPS = edit.fps;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'}),
    new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const WE = (i: number) => WORDS[i].e;
const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.7, 0, 0.3, 1);
const sp = (t: number, at: number, stiffness = 120, damping = 18) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const win = (t: number, a: number, b: number, fin = 0.4, fout = 0.3) => pt(t, a, a + fin, smooth) * (1 - pt(t, b - fout, b, Easing.in(Easing.cubic)));

// ---------------------------------------------------------------- layout: full frame or folded into a window
const WINDOWS: [number, number][] = [
  [W(18) - 0.1, W(49) - 0.05], // his day
  [W(64) - 0.1, W(82) - 0.05], // what we build
];
const foldAt = (t: number) => Math.max(0, ...WINDOWS.map(([a, b]) => pt(t, a, a + 0.55, inOut) * (1 - pt(t, b - 0.55, b, inOut))));
const FULL = {x: 0, y: 0, w: 1080, h: 1920, r: 0};
const WIN = {x: 70, y: 170, w: 940, h: 820, r: 48};
const frameRect = (f: number) => ({x: lerp(FULL.x, WIN.x, f), y: lerp(FULL.y, WIN.y, f), w: lerp(FULL.w, WIN.w, f), h: lerp(FULL.h, WIN.h, f), r: lerp(FULL.r, WIN.r, f)});

// slow, eased push on the full-frame stretches
const pushAt = (t: number) => {
  const segs: [number, number][] = [[0, W(18)], [W(49), W(64)], [W(82), W(103)], [W(103), edit.speech]];
  void segs;
  return 1; // no push-ins: the shot stays as filmed
};

// ---------------------------------------------------------------- type that sits behind him
const Behind: React.FC<{t: number}> = ({t}) => {
  const items: React.ReactNode[] = [];
  // "2026": digits drop in one by one; on "time waste" a lime bar drains under them like time running out
  {
    const a = W(0) - 0.05, b = W(18) - 0.1;
    if (t >= a && t < b) {
      const drain = pt(t, W(13) - 0.05, W(17) + 0.3, inOut);
      const dull = pt(t, W(13) - 0.05, W(13) + 0.4, smooth);
      items.push(
        <div key="y" style={{position: 'absolute', left: 0, right: 0, top: 455, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - pt(t, b - 0.3, b)}}>
          <div style={{display: 'flex', fontFamily: SANS, fontWeight: 800, fontSize: 330, letterSpacing: '-0.07em', lineHeight: 0.9, color: `rgba(255,255,255,${lerp(0.96, 0.55, dull)})`}}>
            {'2026'.split('').map((d, k) => {
              const p = sp(t, a + k * 0.08, 150, 15);
              return (
                <span key={k} style={{display: 'inline-block', transform: `translateY(${(1 - m1(p)) * -220}px)`, opacity: m1(p * 2)}}>
                  {d}
                </span>
              );
            })}
          </div>
          <div style={{width: 640, height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.25)', marginTop: 10, opacity: pt(t, W(13) - 0.1, W(13) + 0.2)}}>
            <div style={{width: `${(1 - drain) * 100}%`, height: '100%', borderRadius: 10, background: drain > 0.85 ? C.red : C.lime}} />
          </div>
        </div>,
      );
    }
  }
  // "AI": huge, on "AI handle kar sakta hain"
  {
    const a = W(59) - 0.1, b = W(64) - 0.1;
    if (t >= a && t < b) {
      const p = sp(t, a, 90, 14);
      items.push(
        <div key="ai" style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 560, letterSpacing: '-0.08em', lineHeight: 1, color: C.lime, opacity: m1(p * 1.5) * (1 - pt(t, b - 0.3, b)), transform: `scale(${lerp(0.7, 1, m1(p))})`}}>
          AI
        </div>,
      );
    }
  }
  // "NEURAXINE": on "That's exactly what we do at Neuraxine"
  {
    const a = W(88) - 0.15, b = W(103) - 0.1;
    if (t >= a && t < b) {
      const p = pt(t, a, a + 0.9, smooth);
      items.push(
        <div key="nx" style={{position: 'absolute', left: -200, right: -200, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: lerp(0.3, 0.0, p) + 'em', color: 'rgba(255,255,255,0.92)', opacity: p * (1 - pt(t, b - 0.3, b)), filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined}}>
          NEURAXINE
        </div>,
      );
    }
  }
  // "AUTOMATE": typed letter by letter, on the word itself
  {
    const a = W(113) - 0.1, b = W(123) - 0.05;
    if (t >= a && t < b) {
      const n = Math.max(0, Math.min(8, Math.ceil(((t - W(115)) / Math.max(0.35, WE(115) - W(115))) * 8)));
      const done = t > WE(115) + 0.1;
      items.push(
        <div key="au" style={{position: 'absolute', left: -100, right: -100, top: 545, display: 'flex', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 178, letterSpacing: '-0.05em', color: done ? C.lime : '#fff', opacity: 1 - pt(t, b - 0.3, b)}}>
          {'AUTOMATE'.split('').map((ch, k) => (
            <span key={k} style={{opacity: k < n ? 1 : 0.12, transform: `translateY(${k < n ? 0 : 14}px)`, transition: 'none'}}>
              {ch}
            </span>
          ))}
        </div>,
      );
      items.push(
        <div key="cm" style={{position: 'absolute', left: 0, right: 0, top: 495, textAlign: 'center', fontFamily: MONO, fontSize: 30, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.85)', opacity: win(t, W(113) - 0.1, b)}}>
          COMMENT
        </div>,
      );
    }
  }
  return <>{items}</>;
};

// ---------------------------------------------------------------- his day on a 9 AM - 9 PM timeline
const BLOCKS: {i: number; from: number; to: number; label: string; icon: string}[] = [
  {i: 20, from: 9, to: 11.5, label: 'Leads', icon: 'busts_in_silhouette.png'},
  {i: 25, from: 11.5, to: 14, label: 'WhatsApp', icon: 'whatsapp-icon.svg'},
  {i: 28, from: 14, to: 16, label: 'Follow-ups', icon: 'repeat_button.png'},
  {i: 30, from: 16, to: 18.5, label: 'Appointments', icon: 'spiral_calendar.png'},
  {i: 36, from: 18.5, to: 21, label: 'More replies', icon: 'speech_balloon.png'},
];
const X0 = 60, X1 = 880;
const hx = (h: number) => X0 + ((h - 9) / 12) * (X1 - X0);
const Timeline: React.FC<{t: number; compact?: boolean}> = ({t, compact}) => {
  const collapse = pt(t, W(60) - 0.05, W(60) + 0.7, inOut); // "AI handle": all blocks fold into one lime block
  const used = BLOCKS.reduce((s, b) => s + (t >= W(b.i) - 0.1 ? b.to - b.from : 0), 0);
  const free = lerp(12 - used, 11, collapse);
  const gp = W(43) - 0.1; // "growth": a growth block tries to fit and bounces off
  const bounce = t >= gp && t < gp + 1.2 ? Math.sin(((t - gp) / 1.2) * Math.PI) : 0;
  const shake = t >= gp + 0.35 && t < gp + 0.8 ? Math.sin((t - gp) * 60) * 8 : 0;
  return (
    <div style={{position: 'relative', width: 940, height: compact ? 250 : 560}}>
      <div style={{position: 'absolute', left: X0, right: 1080 - 940 - 60 + 60, top: 0, display: 'flex', justifyContent: 'space-between', width: X1 - X0}}>
        <span style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.16em', color: C.grey}}>{collapse > 0.5 ? 'YOUR DAY, WITH AI' : 'YOUR DAY'}</span>
        <span style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.1em', color: free < 0.5 ? C.red : C.lime, fontVariantNumeric: 'tabular-nums'}}>FREE {free.toFixed(1)}h</span>
      </div>
      {/* hour ruler */}
      <svg width={940} height={compact ? 250 : 360} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 13}, (_, k) => (
          <g key={k}>
            <line x1={hx(9 + k)} y1={compact ? 66 : 70} x2={hx(9 + k)} y2={compact ? 76 : 82} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
            {k % 3 === 0 && (
              <text x={hx(9 + k)} y={compact ? 232 : 248} fill="rgba(255,255,255,0.55)" fontFamily="Geist Mono" fontSize={22} textAnchor="middle">
                {((9 + k - 1) % 12) + 1}
                {9 + k < 12 ? 'am' : 'pm'}
              </text>
            )}
          </g>
        ))}
        <rect x={X0} y={compact ? 92 : 96} width={X1 - X0} height={compact ? 100 : 120} rx={18} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      </svg>
      {BLOCKS.map((b, k) => {
        const at = W(b.i) - 0.1;
        if (t < at) return null;
        const p = sp(t, at, 160, 16);
        const x = lerp(hx(b.from), hx(9) + 4, collapse);
        const w = lerp(hx(b.to) - hx(b.from) - 6, (hx(10) - hx(9)) - 6, collapse);
        return (
          <div key={k} style={{position: 'absolute', left: x + 3, top: (compact ? 98 : 102) + (1 - m1(p)) * -60, width: Math.max(0, w), height: compact ? 88 : 108, borderRadius: 14, background: collapse > 0.6 ? C.lime : '#3A3F3B', border: '1px solid rgba(255,255,255,0.14)', opacity: m1(p * 1.5) * (collapse > 0.97 && k > 0 ? 0 : 1), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transform: `translateX(${shake}px)`}}>
            <span style={{fontFamily: SANS, fontWeight: 600, fontSize: compact ? 21 : 22, color: collapse > 0.6 ? C.char : '#fff', whiteSpace: 'nowrap', opacity: collapse > 0.3 ? (k === 0 ? 1 : 0) : 1}}>{collapse > 0.6 ? 'AI' : b.label}</span>
          </div>
        );
      })}
      {/* 3D icon above each task as it lands; on the collapse they all fly into the AI block */}
      {BLOCKS.map((b, k) => {
        const at = W(b.i) - 0.1;
        if (t < at || compact) return null;
        const q = sp(t, at, 220, 11);
        const cx = lerp((hx(b.from) + hx(b.to)) / 2, (hx(9) + hx(10)) / 2, collapse);
        const sz = 74;
        return (
          <Img key={'i' + k} src={staticFile(`icons/${b.icon}`)} style={{position: 'absolute', left: cx - sz / 2, top: 18 - (1 - m1(q)) * 40 + Math.sin(t * 3 + k) * 3, width: sz, height: sz, objectFit: 'contain', transform: `scale(${q * (1 - collapse * 0.6)}) rotate(${(1 - m1(q)) * -30}deg)`, opacity: 1 - collapse * 0.9, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))'}} />
        );
      })}
      {/* freed hours light up after the collapse */}
      {collapse > 0.9 && (
        <div style={{position: 'absolute', left: hx(10) + 6, top: compact ? 98 : 102, width: (hx(21) - hx(10)) * pt(t, W(60) + 0.6, W(63) + 0.3, smooth) - 10, height: compact ? 88 : 108, borderRadius: 14, border: `1.5px dashed ${C.lime}`, display: 'flex', alignItems: 'center', paddingLeft: 24, overflow: 'hidden'}}>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.lime, whiteSpace: 'nowrap'}}>Free for growth</span>
        </div>
      )}
      {!compact && (
        <div style={{position: 'absolute', left: X0, top: 300, display: 'flex', alignItems: 'center', gap: 22}}>
          <Img src={staticFile(free < 0.5 ? 'icons/hourglass_done.png' : 'icons/stopwatch.png')} style={{width: 150, height: 150, objectFit: 'contain', filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.45))', transform: `rotate(${Math.sin(t * 2) * 6}deg)`}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 190, letterSpacing: '-0.06em', lineHeight: 1, color: free < 0.5 ? C.red : '#fff', fontVariantNumeric: 'tabular-nums'}}>{free.toFixed(1)}h</span>
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.grey, lineHeight: 1.1}}>
            free time
            <br />
            today
          </span>
        </div>
      )}
      {/* growth tries to fit and has nowhere to go */}
      {bounce > 0 && (
        <div style={{position: 'absolute', left: hx(13), top: (compact ? 98 : 102) - 140 + bounce * 90, width: 210, height: 80, borderRadius: 14, background: 'transparent', border: `2px solid ${t > gp + 0.35 ? C.red : C.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, bounce * 3), transform: `translateX(${shake}px)`}}>
          <Img src={staticFile(t > gp + 0.35 ? 'icons/prohibited.png' : 'icons/chart_increasing.png')} style={{width: 46, height: 46, marginRight: 8}} />
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: t > gp + 0.35 ? C.red : C.lime}}>{t > gp + 0.35 ? 'No room' : 'Growth'}</span>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- what we build: layers stacking up
const LAYERS: {i: number; label: string; sub: string; icon: string}[] = [
  {i: 66, label: 'AI agents', sub: 'reply, qualify, book', icon: 'robot.png'},
  {i: 68, label: 'Automated workflows', sub: 'tools talk to each other', icon: 'gear.png'},
  {i: 72, label: 'Custom AI systems', sub: 'built around you', icon: 'puzzle_piece.png'},
  {i: 77, label: 'Your business', sub: 'running smoother', icon: 'office_building.png'},
];
const Stack: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'relative', width: 940, height: 640}}>
    <div style={{position: 'absolute', left: 60, top: 0, fontFamily: MONO, fontSize: 24, letterSpacing: '0.16em', color: C.grey}}>WHAT WE BUILD</div>
    {LAYERS.map((l, k) => {
      const at = W(l.i) - 0.1;
      if (t < at) return null;
      const p = sp(t, at, 140, 16);
      const top = 480 - k * 130; // each new layer lands on top of the last
      const last = k === LAYERS.length - 1;
      const pulse = last ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
      return (
        <div key={k} style={{position: 'absolute', left: 60 + k * 12, right: 60 + k * 12, top: top - (1 - m1(p)) * 120, height: 112, opacity: m1(p * 1.6)}}>
          {/* slab: a lit top face and a darker edge, slightly skewed so it reads as a plate */}
          <div style={{position: 'absolute', inset: 0, transform: 'perspective(900px) rotateX(28deg)', transformOrigin: '50% 100%', borderRadius: 20, background: last ? `linear-gradient(180deg, ${C.limeHi}, ${C.lime})` : 'linear-gradient(180deg, #2C302D, #1E211F)', border: `1px solid ${last ? C.limeHi : 'rgba(255,255,255,0.14)'}`, boxShadow: last ? `0 0 ${30 + pulse * 30}px rgba(160,211,6,0.35), 0 14px 0 #6B8E04` : '0 12px 0 #0D0F0E, 0 24px 40px rgba(0,0,0,0.4)'}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: last ? C.char : '#fff', letterSpacing: '-0.02em'}}>
              <Img src={staticFile(`icons/${l.icon}`)} style={{width: 78, height: 78, marginTop: -26, objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.45))', transform: `scale(${sp(t, at + 0.1, 220, 11)}) rotate(${l.icon === 'gear.png' ? t * 60 : Math.sin(t * 2 + k) * 6}deg)`}} />
              {l.label}
            </span>
            <span style={{fontFamily: MONO, fontSize: 21, letterSpacing: '0.06em', color: last ? 'rgba(18,20,18,0.75)' : C.grey}}>{l.sub}</span>
          </div>
        </div>
      );
    })}
  </div>
);

// ---------------------------------------------------------------- benefit chips floating beside him
const CHIPS: {i: number; label: string; side: 'l' | 'r'; y: number; icon: string}[] = [
  {i: 92, label: 'Save time', side: 'l', y: 720, icon: 'stopwatch.png'},
  {i: 94, label: 'Less manual work', side: 'r', y: 880, icon: 'high_voltage.png'},
  {i: 99, label: 'Scale smarter', side: 'l', y: 1040, icon: 'rocket.png'},
];
const Chips: React.FC<{t: number}> = ({t}) => {
  const end = W(103) - 0.1;
  if (t < W(92) - 0.2 || t >= end) return null;
  return (
    <>
      {CHIPS.map((c, k) => {
        const at = W(c.i) - 0.1;
        if (t < at) return null;
        const p = sp(t, at, 130, 16);
        const o = m1(p * 1.5) * (1 - pt(t, end - 0.3, end));
        const left = c.side === 'l';
        return (
          <div key={k} style={{position: 'absolute', top: c.y + Math.sin(t * 1.5 + k) * 6, [left ? 'left' : 'right']: 50, opacity: o, transform: `translateX(${(1 - m1(p)) * (left ? -160 : 160)}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px 18px 18px', borderRadius: 999, background: 'rgba(243,241,234,0.92)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'}}>
              <Img src={staticFile(`icons/${c.icon}`)} style={{width: 92, height: 92, margin: '-26px 0', objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.35))', transform: `scale(${sp(t, at + 0.05, 240, 10)}) rotate(${Math.sin(t * 2.4 + k) * 8}deg)`}} />
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.char, letterSpacing: '-0.02em'}}>{c.label}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the guide lands in DM, then follow
const DmChip: React.FC<{t: number}> = ({t}) => {
  const a = W(120) - 0.1, b = W(123) - 0.05;
  if (t < a || t >= b) return null;
  const p = sp(t, a, 140, 16);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1440, display: 'flex', justifyContent: 'center', opacity: m1(p * 1.5) * (1 - pt(t, b - 0.25, b)), transform: `translateY(${(1 - m1(p)) * 60}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 30px 18px 18px', borderRadius: 26, background: 'rgba(18,20,18,0.85)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)'}}>
        <Img src={staticFile('icons/page_facing_up.png')} style={{width: 96, height: 96, margin: '-18px 0', objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.4))', transform: `rotate(${-8 + Math.sin(t * 3) * 4}deg)`}} />
        <div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#fff'}}>Complete guide</div>
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.1em', color: C.lime}}>SENT TO YOUR DM</div>
        </div>
      </div>
    </div>
  );
};
const FollowPill: React.FC<{t: number}> = ({t}) => {
  const a = W(123) - 0.05, b = edit.speech + 0.05;
  if (t < a || t >= b) return null;
  const p = sp(t, a, 130, 16);
  const tap = W(128) + 0.05;
  const done = t >= tap + 0.18;
  const press = pt(t, tap, tap + 0.1) * (1 - pt(t, tap + 0.1, tap + 0.25));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1440, display: 'flex', justifyContent: 'center', opacity: m1(p * 1.5), transform: `translateY(${(1 - m1(p)) * 60}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 14px 14px 18px', borderRadius: 999, background: 'rgba(243,241,234,0.94)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'}}>
        <div style={{width: 76, height: 76, borderRadius: 76, background: C.char, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: 52, height: 38, objectFit: 'contain'}} />
        </div>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.char, marginRight: 10}}>neuraxine</span>
        <div style={{padding: '0 34px', height: 70, borderRadius: 999, background: done ? 'rgba(18,20,18,0.12)' : C.char, color: done ? C.char : C.lime, fontFamily: SANS, fontWeight: 700, fontSize: 32, display: 'flex', alignItems: 'center', transform: `scale(${1 - press * 0.08})`}}>
          {done ? 'Following' : 'Follow'}
        </div>
        <Img src={staticFile('icons/bell.png')} style={{width: 70, height: 70, marginLeft: -6, objectFit: 'contain', transform: `rotate(${done ? Math.sin((t - tap) * 30) * 18 * Math.max(0, 1 - (t - tap)) : 0}deg)`}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- captions: bold, two-line groups, a lime bar grows under the spoken word
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    if (/[.?!]["”]?$/.test(w.w) || (/,$/.test(w.w) && chars > 12) || chars + (nx ? nx.w.length : 0) > 24 || !nx || nx.s - w.e > 0.3) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const Captions: React.FC<{t: number; fold: number}> = ({t, fold}) => {
  const c = LINES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const bk = bridgeAt(t);
  const light = bk >= 0 && BRIDGES[bk].light;
  const p = pt(t, c.s - 0.05, c.s + 0.15, smooth);
  const top = bk >= 0 ? 1560 : lerp(1210, 1020, fold);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 18, rowGap: 4, opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.04;
        const active = on && (i === c.words.length - 1 ? t < w.e + 0.2 : t < c.words[i + 1].s - 0.04);
        const bar = active ? pt(t, w.s - 0.04, w.s + 0.12, smooth) : 0;
        return (
          <span key={i} style={{position: 'relative', fontFamily: SANS, fontWeight: 750, fontSize: 64, letterSpacing: '-0.035em', lineHeight: 1.12, color: light ? (on ? C.char : 'rgba(18,20,18,0.4)') : on ? '#fff' : 'rgba(255,255,255,0.45)', textShadow: light ? 'none' : '0 2px 14px rgba(0,0,0,0.45)'}}>
            {w.w.replace(/["“”]/g, '')}
            <span style={{position: 'absolute', left: 0, right: 0, bottom: -2, height: 7, borderRadius: 7, background: light ? C.char : C.lime, transformOrigin: '0 50%', transform: `scaleX(${bar})`}} />
          </span>
        );
      })}
    </div>
  );
};


// ---------------------------------------------------------------- bridges: a short full-screen 3D beat over every jump cut
// The footage cuts between takes 14 times (work/cuts.json). Each cut is covered by a 0.7 s scene built from 3D icons on a
// gradient from the brand palette (logo silver + lime: forest, graphite, emerald, lime, silver, olive), tied to the words he is saying; it wipes in just before the cut and out just after.
const G = {
  violet: 'radial-gradient(circle at 50% 42%, #2E5A22, #12260E 60%, #060D05)' /* forest */,
  coral: 'radial-gradient(circle at 50% 42%, #4A5057, #1D2125 60%, #0B0C0E)' /* graphite */,
  night: 'radial-gradient(circle at 50% 40%, #183A33, #0A1A17 62%, #040A09)' /* deep emerald */,
  lime: 'radial-gradient(circle at 50% 42%, #D4F55A, #A0D306 58%, #4F6B00)',
  cream: 'radial-gradient(circle at 50% 40%, #FFFFFF, #E4E7E1 60%, #B9BEB6)' /* silver */,
  teal: 'radial-gradient(circle at 50% 42%, #6E8F1E, #344A0A 60%, #141E03)' /* olive */,
};
type BKind = 'think' | 'loop' | 'calendar' | 'bulb' | 'dizzy' | 'orbit' | 'puzzle' | 'target' | 'logo' | 'help' | 'rocket' | 'point' | 'bubble' | 'bell';
const BRIDGES: {cut: number; kind: BKind; text?: string; bg: string; light: boolean}[] = [
  {cut: 4.633, kind: 'think', text: 'Socho…', bg: G.violet, light: false},
  {cut: 8.267, kind: 'loop', text: 'Follow-ups', bg: G.coral, light: false},
  {cut: 10.167, kind: 'calendar', text: 'Har din.', bg: G.night, light: false},
  {cut: 14.8, kind: 'bulb', text: 'But…', bg: G.lime, light: true},
  {cut: 16.3, kind: 'dizzy', text: 'repetitive', bg: G.cream, light: true},
  {cut: 18.967, kind: 'orbit', text: 'AI agents', bg: G.violet, light: false},
  {cut: 21.433, kind: 'puzzle', text: 'Custom.', bg: G.coral, light: false},
  {cut: 23.533, kind: 'target', text: 'Your way.', bg: G.night, light: false},
  {cut: 26.267, kind: 'logo', bg: G.violet, light: false},
  {cut: 28.5, kind: 'help', text: 'We help.', bg: G.teal, light: false},
  {cut: 31.667, kind: 'rocket', text: 'Scale.', bg: G.night, light: false},
  {cut: 33.367, kind: 'point', text: 'Your turn.', bg: G.lime, light: true},
  {cut: 35.9, kind: 'bubble', text: 'Comment', bg: G.violet, light: false},
  {cut: 39.167, kind: 'bell', text: 'Follow', bg: G.coral, light: false},
];
const B_IN = 0.34, B_OUT = 0.36;
const bridgeAt = (t: number) => BRIDGES.findIndex((b) => t >= b.cut - B_IN && t < b.cut + B_OUT);
const I3: React.FC<{n: string; size: number; x?: number; y?: number; rot?: number; s?: number; o?: number; blur?: number}> = ({n, size, x = 0, y = 0, rot = 0, s = 1, o = 1, blur = 0}) => (
  <Img
    src={staticFile(`icons/${n}`)}
    style={{position: 'absolute', left: 540 + x - size / 2, top: 900 + y - size / 2, width: size, height: size, objectFit: 'contain', transform: `rotate(${rot}deg) scale(${s})`, opacity: o, filter: `drop-shadow(0 ${size * 0.12}px ${size * 0.12}px rgba(0,0,0,0.35))${blur ? ` blur(${blur}px)` : ''}`}}
  />
);
const Bridge: React.FC<{t: number}> = ({t}) => {
  const k = bridgeAt(t);
  if (k < 0) return null;
  const b = BRIDGES[k];
  const a = b.cut - B_IN, e = b.cut + B_OUT;
  const wi = pt(t, a, a + 0.17, inOut);
  const wo = pt(t, e - 0.17, e, inOut);
  const dir = k % 2 ? 1 : -1;
  // a soft diagonal wipe: the panel comes in from one corner and leaves through the other
  const wipe = wo > 0 ? wo : 1 - wi;
  const clip = wo > 0
    ? dir > 0 ? `polygon(${wipe * 140}% 0, 140% 0, 140% 100%, ${wipe * 140 - 40}% 100%)` : `polygon(-40% 0, ${100 - wipe * 140 + 40}% 0, ${100 - wipe * 140}% 100%, -40% 100%)`
    : dir > 0 ? `polygon(-40% 0, ${(1 - wipe) * 140}% 0, ${(1 - wipe) * 140 - 40}% 100%, -40% 100%)` : `polygon(${100 - (1 - wipe) * 140 + 40}% 0, 140% 0, 140% 100%, ${100 - (1 - wipe) * 140}% 100%)`;
  const L = t - a; // local time 0..0.7
  const pop = (d = 0, st = 220, dm = 12) => (L < d ? 0 : spring({frame: (L - d) * FPS, fps: FPS, config: {stiffness: st, damping: dm, mass: 0.8}}));
  const ink = b.light ? C.char : '#fff';
  const title = (y = 300) => (
    <div style={{position: 'absolute', left: 0, right: 0, top: 900 + y, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: '-0.055em', color: ink, transform: `translateY(${(1 - m1(pop(0.08, 180, 15))) * 60}px)`, opacity: m1(pop(0.08) * 1.6), textShadow: b.light ? 'none' : '0 8px 30px rgba(0,0,0,0.25)'}}>
      {b.text}
    </div>
  );
  let scene: React.ReactNode = null;
  const P = pop(0.02);
  if (b.kind === 'think') {
    scene = (
      <>
        <I3 n="thinking_face.png" size={460} y={-80} s={P} rot={(1 - m1(P)) * -25 + Math.sin(L * 8) * 3} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: 700 + i * 70, top: 520 - i * 70, width: 36 + i * 18, height: 36 + i * 18, borderRadius: 99, background: '#fff', opacity: 0.9, transform: `scale(${pop(0.12 + i * 0.07, 260, 10)})`}} />
        ))}
        {title()}
      </>
    );
  } else if (b.kind === 'loop') {
    scene = (
      <>
        <I3 n="repeat_button.png" size={420} y={-80} s={P} rot={L * 420} />
        {['envelope_with_arrow.png', 'speech_balloon.png', 'telephone_receiver.png'].map((n, i) => {
          const ang = L * 5 + (i * Math.PI * 2) / 3;
          return <I3 key={n} n={n} size={170} x={Math.cos(ang) * 330} y={-80 + Math.sin(ang) * 140} s={pop(0.06 + i * 0.05) * (0.8 + 0.25 * Math.sin(ang))} />;
        })}
        {title()}
      </>
    );
  } else if (b.kind === 'calendar') {
    scene = (
      <>
        {[0, 1, 2, 3, 4].map((i) => {
          const q = pop(0.02 + i * 0.06, 240, 14);
          return <I3 key={i} n="spiral_calendar.png" size={380} x={(i - 2) * 26} y={-80 - i * 26 - (1 - m1(q)) * 500} rot={(i - 2) * 6} o={m1(q * 2)} />;
        })}
        {title()}
      </>
    );
  } else if (b.kind === 'bulb') {
    const on = m1((L - 0.15) / 0.12);
    scene = (
      <>
        <div style={{position: 'absolute', left: 540 - 300, top: 820 - 300, width: 600, height: 600, borderRadius: 600, background: 'radial-gradient(circle, rgba(255,255,220,0.9), transparent 65%)', opacity: on}} />
        {Array.from({length: 10}, (_, i) => {
          const ang = (i / 10) * Math.PI * 2;
          return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * 300 - 6, top: 820 + Math.sin(ang) * 300 - 30, width: 12, height: 60, borderRadius: 12, background: C.char, opacity: on * 0.8, transform: `rotate(${(ang * 180) / Math.PI + 90}deg) scale(${on})`}} />;
        })}
        <I3 n="light_bulb.png" size={430} y={-80} s={P} rot={Math.sin(L * 10) * 4} />
        {title()}
      </>
    );
  } else if (b.kind === 'dizzy') {
    scene = (
      <>
        {Array.from({length: 9}, (_, i) => {
          const off = ((L * 1100 + i * 90) % 400) - 200;
          return (
            <div key={i} style={{position: 'absolute', left: -200, right: -200, top: 160 + i * 175, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: '-0.05em', color: C.char, opacity: 0.1, transform: `translateX(${i % 2 ? off : -off}px)`}}>
              repetitive repetitive
            </div>
          );
        })}
        <I3 n="face_with_spiral_eyes.png" size={440} y={-80} s={P} rot={L * 200} />
        {title()}
      </>
    );
  } else if (b.kind === 'orbit') {
    const logos = ['whatsapp-icon.svg', 'google-gmail.svg', 'google-calendar.svg', 'instagram-icon.svg', 'shopify.svg'];
    scene = (
      <>
        {logos.map((n, i) => {
          const ang = L * 3.2 + (i * Math.PI * 2) / logos.length;
          const depth = Math.sin(ang); // behind the robot when negative
          return depth < 0 ? <I3 key={n} n={n} size={120} x={Math.cos(ang) * 360} y={-80 + depth * 120} s={pop(0.05 + i * 0.04) * (0.75 + 0.25 * depth)} o={0.7} /> : null;
        })}
        <I3 n="robot.png" size={430} y={-80} s={P} rot={Math.sin(L * 9) * 4} />
        {logos.map((n, i) => {
          const ang = L * 3.2 + (i * Math.PI * 2) / logos.length;
          const depth = Math.sin(ang);
          return depth >= 0 ? <I3 key={n} n={n} size={140} x={Math.cos(ang) * 360} y={-80 + depth * 120} s={pop(0.05 + i * 0.04) * (0.85 + 0.25 * depth)} /> : null;
        })}
        {title()}
      </>
    );
  } else if (b.kind === 'puzzle') {
    const spots: [number, number, number][] = [[-110, -190, -40], [110, -190, 30], [-110, 30, 25], [110, 30, -35]];
    scene = (
      <>
        {spots.map(([x, y, r], i) => {
          const q = m1(pop(0.02 + i * 0.07, 200, 14));
          return <I3 key={i} n="puzzle_piece.png" size={240} x={lerp(x * 3.4, x, q)} y={lerp(y * 2.6, y, q)} rot={lerp(r * 4, i * 90, q)} o={m1(q * 2)} />;
        })}
        <I3 n="hammer_and_wrench.png" size={170} x={250} y={-330} s={pop(0.3)} rot={Math.sin(L * 14) * 12} />
        {title(330)}
      </>
    );
  } else if (b.kind === 'target') {
    const hit = m1((L - 0.22) / 0.1);
    scene = (
      <>
        <I3 n="bullseye.png" size={430} y={-80} s={P * (1 + 0.06 * Math.sin(hit * Math.PI))} />
        <I3 n="index_pointing_up.png" size={200} x={lerp(420, 90, m1(L / 0.24))} y={lerp(-420, -60, m1(L / 0.24))} rot={-40} />
        {title()}
      </>
    );
  } else if (b.kind === 'logo') {
    scene = (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const ang = (i / 6) * Math.PI * 2 + 0.3;
          const q = pop(0.1 + i * 0.03, 240, 12);
          return <I3 key={i} n="sparkles.png" size={110} x={Math.cos(ang) * 330 * m1(q)} y={-80 + Math.sin(ang) * 260 * m1(q)} s={q} rot={L * 120} />;
        })}
        <Img src={staticFile('brand/logo-alpha.png')} style={{position: 'absolute', left: 540 - 220, top: 820 - 160, width: 440, height: 320, objectFit: 'contain', transform: `scale(${P}) rotate(${(1 - m1(P)) * -30}deg)`, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.35))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: `${lerp(0.7, 0.34, m1(pop(0.1)))}em`, color: '#fff', opacity: m1(pop(0.1) * 1.5)}}>NEURAXINE</div>
      </>
    );
  } else if (b.kind === 'help') {
    scene = (
      <>
        <I3 n="raising_hands.png" size={440} y={-80} s={P} rot={Math.sin(L * 12) * 5} />
        <I3 n="sparkles.png" size={150} x={-260} y={-300} s={pop(0.15)} rot={L * 90} />
        <I3 n="flexed_biceps.png" size={170} x={280} y={60} s={pop(0.22)} rot={-15 + Math.sin(L * 10) * 8} />
        {title()}
      </>
    );
  } else if (b.kind === 'rocket') {
    const fly = m1(L / 0.6);
    scene = (
      <>
        <I3 n="chart_increasing.png" size={420} y={-60} s={P} o={0.95} />
        {Array.from({length: 6}, (_, i) => {
          const q = m1(fly - i * 0.06);
          return <div key={i} style={{position: 'absolute', left: lerp(160, 760, q) - i * 34, top: lerp(1180, 420, q) + i * 34, width: 30 - i * 4, height: 30 - i * 4, borderRadius: 30, background: '#FFD27A', opacity: q > 0 ? 0.7 - i * 0.1 : 0}} />;
        })}
        <I3 n="rocket.png" size={260} x={lerp(-380, 220, fly)} y={lerp(280, -480, fly)} rot={0} />
        {title()}
      </>
    );
  } else if (b.kind === 'point') {
    const z = lerp(0.5, 1.25, smooth(m1(L / 0.5)));
    scene = (
      <>
        <I3 n="pointing_viewer.png" size={460} y={-80} s={z * m1(P * 1.5)} />
        {title()}
      </>
    );
  } else if (b.kind === 'bubble') {
    scene = (
      <>
        <I3 n="speech_balloon.png" size={460} y={-80} s={pop(0.02, 260, 9)} rot={Math.sin(L * 9) * 6} />
        <I3 n="megaphone.png" size={190} x={-290} y={-300} s={pop(0.18)} rot={-20} />
        <I3 n="love_letter.png" size={150} x={300} y={40} s={pop(0.24)} rot={15} />
        {title()}
      </>
    );
  } else if (b.kind === 'bell') {
    scene = (
      <>
        <I3 n="bell.png" size={440} y={-80} s={P} rot={Math.sin(L * 28) * 18 * (1 - m1(L / 0.7))} />
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: 540 - 280 - i * 60, top: 820 - 280 - i * 60, width: 560 + i * 120, height: 560 + i * 120, borderRadius: 999, border: '4px solid rgba(255,255,255,0.5)', opacity: m1(1 - ((L * 2 + i * 0.4) % 1)), transform: `scale(${0.8 + ((L * 2 + i * 0.4) % 1) * 0.4})`}} />
        ))}
        {title()}
      </>
    );
  }
  return (
    <AbsoluteFill style={{background: b.bg, clipPath: clip}}>
      <AbsoluteFill style={{transform: `translateX(${dir * (1 - wi) * 80 - dir * wo * 80}px)`}}>{scene}</AbsoluteFill>
      <Grain t={t} o={0.09} />
    </AbsoluteFill>
  );
};

// subtle animated film grain so graphics never look sterile
const Grain: React.FC<{t: number; o?: number}> = ({t, o = 0.06}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: o, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id={`g${Math.floor(t * FPS) % 7}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(t * FPS) % 7} />
    </filter>
    <rect width={1080} height={1920} filter={`url(#g${Math.floor(t * FPS) % 7})`} />
  </svg>
);

// ---------------------------------------------------------------- end card (cream, not black)
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.35) return null;
  const r = t - a;
  const k = pt(t, a - 0.35, a + 0.15, inOut);
  return (
    <AbsoluteFill style={{background: C.cream, clipPath: `circle(${k * 120}% at 50% 76%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 230, height: 230, borderRadius: 230, background: C.char, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.8, 1, pt(r, 0, 0.6, smooth))})`}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 160, height: 117, objectFit: 'contain'}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, color: C.char, letterSpacing: '-0.05em', marginTop: 34, opacity: pt(r, 0.1, 0.5, smooth)}}>Neuraxine</div>
      <div style={{marginTop: 46, display: 'flex', alignItems: 'center', gap: 16, opacity: pt(r, 0.35, 0.8, smooth)}}>
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.grey}}>comment</span>
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.char, background: C.lime, padding: '8px 26px', borderRadius: 14}}>AUTOMATE</span>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const fold = foldAt(t);
  const r = frameRect(fold);
  const z = pushAt(t);
  const vid: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, maxWidth: 'none', };
  // inside the window the shot is scaled so his face stays centred
  const inner = lerp(1, 0.86, fold);
  const ox = (r.w - 1080 * inner) / 2;
  const oy = lerp(0, r.h / 2 - 880 * inner, fold);
  return (
    <AbsoluteFill style={{background: C.char}}>
      {/* a quiet backdrop for the folded layout */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 25%, #23302A, #111814 55%, #070A08)', opacity: fold}} />
      {fold > 0.02 && <Grain t={t} o={0.07 * fold} />}
      <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: r.r, overflow: 'hidden', boxShadow: fold > 0 ? `0 40px 80px rgba(0,0,0,${0.5 * fold})` : undefined}}>
        <div style={{position: 'absolute', left: ox, top: oy, width: 1080, height: 1920, transform: `scale(${inner})`, transformOrigin: '0 0'}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '50% 46%'}}>
            <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={vid} />
            <div style={{position: 'absolute', inset: 0}}>
              <Behind t={t} />
            </div>
            <OffthreadVideo muted transparent src={staticFile('clips/person.webm')} style={vid} />
          </div>
        </div>
      </div>
      {/* graphics in the space below the window */}
      {fold > 0.02 && (
        <div style={{position: 'absolute', left: 70, top: 1130, width: 940, opacity: fold, transform: `translateY(${(1 - fold) * 80}px)`}}>
          {t < W(49) ? <Timeline t={t} /> : <Stack t={t} />}
        </div>
      )}
      {/* the timeline returns, compact, for the AI collapse */}
      {t >= W(59) - 0.3 && t < W(64) - 0.1 && (
        <div style={{position: 'absolute', left: 70, top: 1440, width: 940, opacity: win(t, W(59) - 0.3, W(64) - 0.1), transform: `translateY(${(1 - win(t, W(59) - 0.3, W(64) - 0.1)) * 50}px)`}}>
          <div style={{position: 'absolute', inset: -24, borderRadius: 32, background: 'rgba(18,20,18,0.78)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(18px)'}} />
          <Timeline t={t} compact />
        </div>
      )}
      {t < edit.speech && (
        <>
          <Chips t={t} />
          <DmChip t={t} />
          <FollowPill t={t} />
          <Bridge t={t} />
          <Captions t={t} fold={fold} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
