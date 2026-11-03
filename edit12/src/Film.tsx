import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';
import edit from './edit.json';

// Neuraxine: "manual work vs AI automation" talking head.
// Premium, quiet motion: dark glass panels with a hairline border, soft springs, thin-line icons drawn in SVG,
// Geist + Instrument Serif, one accent colour (the logo's lime). Every element starts on the word that names it.
const C = {lime: '#A0D306', limeSoft: '#C9F25A', ink: '#0A0D0B', grey: '#8A918C', red: '#FF6B5E'};
const SANS = 'Geist, InterV, sans-serif';
const MONO = '"Geist Mono", monospace';
const SERIF = '"Instrument Serif", serif';
const FPS = edit.fps;
const TEXT_SHADOW = '0 2px 10px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.4)';

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'}),
    new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif.ttf')})`),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const CUE = edit.cues as Record<string, number>;
const CW = edit.cueWord as Record<string, number>;
const Q = (k: string) => CUE[k];
const QE = (k: string) => WORDS[CW[k]].e;
const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const sp = (t: number, at: number, stiffness = 120, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));
const m1 = (v: number) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------- camera: slow eased push-ins, released on scene changes
const PUSH: [number, number, number][] = [
  // [start, end, zoom]
  [0, Q('socho') - 0.1, 1.07],
  [Q('karte'), Q('but') - 0.1, 1.05],
  [Q('but'), Q('from') - 0.1, 1.08],
  [Q('thats'), Q('agar') - 0.1, 1.06],
  [Q('comment'), Q('toh') - 0.1, 1.06],
];
const zoomAt = (t: number) => {
  let z = 1;
  for (const [a, b, v] of PUSH) {
    if (t < a || t > b + 0.7) continue;
    const inP = pt(t, a, b, inOut);
    const outP = pt(t, b, b + 0.6, inOut);
    z = lerp(1, v, inP) * (1 - outP) + 1 * outP;
  }
  return z;
};

// ---------------------------------------------------------------- shared pieces
const Glass: React.FC<{t: number; a: number; b: number; top: number; h: number; w?: number; children: React.ReactNode}> = ({t, a, b, top, h, w = 940, children}) => {
  if (t < a - 0.01 || t > b) return null;
  const p = sp(t, a, 110, 19);
  const out = pt(t, b - 0.35, b, Easing.in(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - w) / 2,
        width: w,
        top,
        height: h,
        borderRadius: 40,
        background: 'linear-gradient(160deg, rgba(22,26,23,0.78), rgba(10,13,11,0.86))',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        overflow: 'hidden',
        opacity: m1(p * 1.4) * (1 - out),
        transform: `translateY(${(1 - m1(p)) * 60 + out * 30}px) scale(${lerp(0.96, 1, m1(p))})`,
        filter: out > 0 ? `blur(${out * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Text that rises out of a mask with a soft blur. */
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; d?: number}> = ({t, at, children, style, d = 0.6}) => {
  const p = pt(t, at, at + d, smooth);
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6}}>
      <div style={{transform: `translateY(${(1 - p) * 100}%)`, opacity: p, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, ...style}}>{children}</div>
    </div>
  );
};

const Mono: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.grey, style}) => (
  <span style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color, ...style}}>{children}</span>
);

// thin-line icons (stroke only, 1.6 px at 24 px)
const ICON: Record<string, React.ReactNode> = {
  lead: (
    <>
      <circle cx={12} cy={8} r={3.5} />
      <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
    </>
  ),
  chat: <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" />,
  loop: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  cal: (
    <>
      <rect x={3.5} y={5} width={17} height={15} rx={2.5} />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={9} />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};
const Icon: React.FC<{n: string; size?: number; color?: string; extra?: React.ReactNode}> = ({n, size = 40, color = '#fff', extra}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{flex: 'none'}}>
    {ICON[n]}
    {extra}
  </svg>
);

// ---------------------------------------------------------------- 1. hook: "2026" rolls in above his head, the clock runs on "time waste"
const Digit: React.FC<{t: number; at: number; d: number}> = ({t, at, d}) => {
  const p = pt(t, at, at + 0.9, smooth);
  const pos = lerp(d + 10, d, p); // rolls down from a higher number into place
  return (
    <div style={{height: 230, overflow: 'hidden', display: 'inline-block'}}>
      <div style={{transform: `translateY(${-(pos % 10) * 230}px)`}}>
        {Array.from({length: 11}, (_, k) => (
          <div key={k} style={{height: 230, lineHeight: '230px'}}>
            {k % 10}
          </div>
        ))}
      </div>
    </div>
  );
};
const Hook: React.FC<{t: number}> = ({t}) => {
  const a = Q('y2026');
  const b = Q('socho') - 0.05;
  if (t > b) return null;
  const out = pt(t, b - 0.35, b, Easing.in(Easing.cubic));
  const tm = Q('time');
  const clockOn = pt(t, tm - 0.1, tm + 0.3, smooth);
  const spin = Math.max(0, t - tm + 0.1);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, filter: out ? `blur(${out * 10}px)` : undefined, textShadow: TEXT_SHADOW}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 220, color: '#fff', letterSpacing: '-0.06em', display: 'flex', lineHeight: 1}}>
        {[2, 0, 2, 6].map((d, k) => (
          <Digit key={k} t={t} at={a + k * 0.06} d={d} />
        ))}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: -6}}>
        <Rise t={t} at={Q('manually') - 0.05} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: '#fff'}}>
          still manual?
        </Rise>
        <div style={{opacity: clockOn, transform: `scale(${lerp(0.6, 1, clockOn)})`}}>
          <Icon
            n="clock"
            size={84}
            color={C.lime}
            extra={
              <>
                <path d={`M12 12 L${12 + 5.5 * Math.sin(spin * 9)} ${12 - 5.5 * Math.cos(spin * 9)}`} />
                <path d={`M12 12 L${12 + 3.5 * Math.sin(spin * 0.8)} ${12 - 3.5 * Math.cos(spin * 0.8)}`} />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 2-3. the daily stack, then AI takes it over
const TASKS: {k: string; icon: string; label: string}[] = [
  {k: 'leads', icon: 'lead', label: 'Leads handle karna'},
  {k: 'whatsapp', icon: 'chat', label: 'WhatsApp replies'},
  {k: 'followups', icon: 'loop', label: 'Follow-ups'},
  {k: 'appointments', icon: 'cal', label: 'Appointments'},
];
const Tasks: React.FC<{t: number}> = ({t}) => {
  const a = Q('leads') - 0.15;
  const b = Q('from') - 0.1;
  const ai0 = Q('ai') - 0.1; // "AI handle": each task flips to automated, top to bottom
  const sweep = pt(t, ai0 - 0.05, ai0 + 0.9, inOut);
  const pressure = pt(t, Q('karte'), Q('karte') + 1.2, smooth) * (1 - pt(t, Q('but') - 0.2, Q('but') + 0.3));
  return (
    <Glass t={t} a={a} b={b} top={1300} h={420}>
      <div style={{position: 'absolute', left: 44, right: 44, top: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Mono>{t < ai0 ? 'Your day' : 'Your day, automated'}</Mono>
        <Mono color={t < ai0 ? C.red : C.lime} style={{fontVariantNumeric: 'tabular-nums'}}>
          {t < ai0 ? `${Math.min(4, TASKS.filter((x) => t >= Q(x.k) - 0.1).length)} tasks · daily` : 'handled by AI'}
        </Mono>
      </div>
      {/* lime light sweep when AI takes over */}
      {sweep > 0 && sweep < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${lerp(-30, 110, sweep)}%`, width: '30%', background: `linear-gradient(90deg, transparent, ${C.lime}33, transparent)`}} />}
      <div style={{position: 'absolute', left: 30, right: 30, top: 84}}>
        {TASKS.map((task, k) => {
          const at = Q(task.k) - 0.08;
          if (t < at) return <div key={k} style={{height: 80}} />;
          const p = sp(t, at, 140, 18);
          const done = t >= ai0 + k * 0.18;
          const dp = pt(t, ai0 + k * 0.18, ai0 + k * 0.18 + 0.35, smooth);
          const jit = pressure * Math.sin(t * 9 + k * 1.7) * 2.5;
          return (
            <div key={k} style={{height: 80, display: 'flex', alignItems: 'center', gap: 22, padding: '0 16px', borderTop: k ? '1px solid rgba(255,255,255,0.07)' : 'none', opacity: m1(p * 1.4), transform: `translateY(${(1 - m1(p)) * 24 + jit}px)`}}>
              <Icon n={task.icon} size={42} color={done ? C.lime : 'rgba(255,255,255,0.85)'} />
              <span style={{flex: 1, fontFamily: SANS, fontWeight: 600, fontSize: 42, color: '#fff', letterSpacing: '-0.02em', opacity: done ? lerp(1, 0.6, dp) : 1, textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.35)', textDecorationThickness: 2}}>
                {task.label}
              </span>
              <div style={{width: 128, height: 48, borderRadius: 24, border: `1px solid ${done ? C.lime : 'rgba(255,255,255,0.18)'}`, background: done ? `${C.lime}22` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                {done && <Icon n="check" size={26} color={C.lime} />}
                <span style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.1em', color: done ? C.lime : C.grey}}>{done ? 'AI' : 'MANUAL'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

// growth line above his head: flat while he talks about the busywork
const Growth: React.FC<{t: number}> = ({t}) => {
  const a = Q('growth') - 0.15;
  const b = Q('but') + 0.1;
  if (t < a || t > b) return null;
  const p = pt(t, a, a + 0.8, smooth);
  const out = pt(t, b - 0.3, b, Easing.in(Easing.cubic));
  const pts = [0, 0.3, 0.2, 0.38, 0.33, 0.36, 0.3];
  const path = pts.map((v, k) => `${k ? 'L' : 'M'} ${k * 100} ${120 - v * 160}`).join(' ');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m1(p * 2) * (1 - out), textShadow: TEXT_SHADOW}}>
      <svg width={600} height={140} style={{overflow: 'visible'}}>
        <path d={path} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={900} strokeDashoffset={900 * (1 - p)} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))'}} />
      </svg>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 64, color: '#fff', letterSpacing: '-0.03em'}}>Growth</span>
        <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: 'rgba(255,255,255,0.85)', opacity: pt(t, Q('focus'), Q('focus') + 0.4)}}>on hold</span>
      </div>
    </div>
  );
};

// "But what if…" headline above his head
const WhatIf: React.FC<{t: number}> = ({t}) => {
  const a = Q('but') - 0.05;
  const b = Q('from') - 0.1;
  if (t < a || t > b) return null;
  const out = pt(t, b - 0.3, b, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, filter: out ? `blur(${out * 8}px)` : undefined, textShadow: TEXT_SHADOW}}>
      <Rise t={t} at={a} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: '#fff', lineHeight: 1}}>
        but what if…
      </Rise>
      <Rise t={t} at={Q('ai') - 0.1} style={{fontFamily: SANS, fontWeight: 700, fontSize: 84, color: C.lime, letterSpacing: '-0.04em', lineHeight: 1.1}}>
        AI handles it.
      </Rise>
    </div>
  );
};

// ---------------------------------------------------------------- 4. the system: a workflow that draws itself
const NODES = [
  {k: 'agents', label: 'AI agent', sub: 'replies & qualifies'},
  {k: 'automated', label: 'Workflow', sub: 'runs on its own'},
  {k: 'custom', label: 'Custom AI', sub: 'built for you'},
  {k: 'according', label: 'Your business', sub: 'your way'},
];
const Flow: React.FC<{t: number}> = ({t}) => {
  const a = Q('from') - 0.05;
  const b = Q('brand') - 0.25;
  const y0 = 120;
  return (
    <Glass t={t} a={a} b={b} top={1290} h={430}>
      <div style={{position: 'absolute', left: 44, top: 30}}>
        <Mono>Built by Neuraxine</Mono>
      </div>
      <svg width={940} height={430} style={{position: 'absolute', inset: 0}}>
        {NODES.slice(1).map((n, k) => {
          const x1 = 150 + k * 220, x2 = 150 + (k + 1) * 220;
          const p = pt(t, Q(n.k) - 0.35, Q(n.k) + 0.05, inOut);
          return <line key={k} x1={x1 + 48} y1={y0 + 70} x2={lerp(x1 + 48, x2 - 48, p)} y2={y0 + 70} stroke={C.lime} strokeWidth={2} strokeOpacity={0.8} />;
        })}
        {/* a pulse travelling through the finished chain */}
        {t > Q('according') + 0.2 && (() => {
          const u = ((t - Q('according') - 0.2) / 1.6) % 1;
          return <circle cx={lerp(150, 810, u)} cy={y0 + 70} r={7} fill={C.limeSoft} opacity={Math.sin(u * Math.PI)} />;
        })()}
      </svg>
      {NODES.map((n, k) => {
        const at = Q(n.k) - 0.08;
        const p = sp(t, at, 150, 17);
        const final = k === NODES.length - 1;
        const x = 150 + k * 220;
        return (
          <div key={n.k} style={{position: 'absolute', left: x - 100, top: y0, width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: t < at ? 0.15 : m1(p * 1.5), transform: `translateY(${t < at ? 0 : (1 - m1(p)) * 20}px)`}}>
            <div style={{width: 140, height: 140, borderRadius: 34, border: `1.5px solid ${t >= at ? (final ? C.lime : 'rgba(255,255,255,0.35)') : 'rgba(255,255,255,0.12)'}`, background: final && t >= at ? `${C.lime}1f` : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 36, color: final && t >= at ? C.lime : '#fff', transform: `scale(${t < at ? 0.9 : lerp(0.85, 1, m1(p))})`}}>
              {String(k + 1).padStart(2, '0')}
            </div>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 29, color: '#fff', marginTop: 18, textAlign: 'center', letterSpacing: '-0.025em', whiteSpace: 'nowrap'}}>{n.label}</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 27, color: C.grey, textAlign: 'center', whiteSpace: 'nowrap'}}>{n.sub}</div>
          </div>
        );
      })}
    </Glass>
  );
};

// ---------------------------------------------------------------- 5. Neuraxine lockup + what it gives you
const Brand: React.FC<{t: number}> = ({t}) => {
  const a = Q('brand') - 0.2;
  const b = Q('agar') - 0.1;
  if (t < a || t > b) return null;
  const p = pt(t, a, a + 0.8, smooth);
  const out = pt(t, b - 0.3, b, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: m1(p * 1.5) * (1 - out), filter: out ? `blur(${out * 8}px)` : undefined}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 40px 22px 28px', borderRadius: 999, background: 'rgba(10,13,11,0.82)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', transform: `translateY(${(1 - p) * 30}px)`}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 110, height: 80, objectFit: 'contain'}} />
        <div>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 72, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1}}>Neuraxine</div>
          <Mono style={{fontSize: 22}}>AI automation studio</Mono>
        </div>
      </div>
    </div>
  );
};
const BENEFITS: [string, string, string][] = [['save', 'Save time', 'hours back, every week'], ['reduce', 'Less manual work', 'no copy-paste busywork'], ['scale', 'Scale smarter', 'grow without more hands']];
const Benefits: React.FC<{t: number}> = ({t}) => {
  const a = Q('save') - 0.15;
  const b = Q('agar') - 0.1;
  return (
    <Glass t={t} a={a} b={b} top={1300} h={400}>
      <div style={{position: 'absolute', left: 30, right: 30, top: 28}}>
        {BENEFITS.map(([k, title, sub], n) => {
          const at = Q(k) - 0.08;
          const p = sp(t, at, 150, 18);
          return (
            <div key={k} style={{height: 116, display: 'flex', alignItems: 'center', gap: 26, padding: '0 18px', borderTop: n ? '1px solid rgba(255,255,255,0.07)' : 'none', opacity: t < at ? 0.15 : m1(p * 1.5), transform: `translateX(${t < at ? 0 : (1 - m1(p)) * 40}px)`}}>
              <span style={{fontFamily: MONO, fontSize: 28, color: t >= at ? C.lime : C.grey, width: 54}}>{String(n + 1).padStart(2, '0')}</span>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05}}>{title}</div>
                <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: C.grey}}>{sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

// ---------------------------------------------------------------- 6. CTA: comment "AUTOMATE", the guide lands in DM
const WORD = 'AUTOMATE';
const Cta: React.FC<{t: number}> = ({t}) => {
  const a = Q('comment') - 0.25;
  const b = Q('toh') - 0.05;
  const ty = Q('automate'), tyE = QE('automate');
  const n = Math.max(0, Math.min(WORD.length, Math.ceil(((t - ty) / Math.max(0.35, tyE - ty)) * WORD.length)));
  const posted = t >= tyE + 0.12;
  const dmAt = Q('dm') - 0.1;
  const dm = sp(t, dmAt, 140, 17);
  return (
    <Glass t={t} a={a} b={b} top={1290} h={430}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 30}}>
        <Mono>Comment</Mono>
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 64, height: 64, borderRadius: 64, background: 'linear-gradient(135deg, #3a3f3b, #1d211e)', flex: 'none'}} />
          <div style={{flex: 1, height: 84, borderRadius: 42, border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: SANS, fontSize: 40, fontWeight: n ? 700 : 400, letterSpacing: n ? '0.04em' : 0, color: n ? '#fff' : C.grey}}>
            {n ? WORD.slice(0, n) : 'Add a comment…'}
            {!posted && t > a + 0.3 && <span style={{width: 3, height: 44, marginLeft: 4, background: C.lime, opacity: Math.sin(t * 12) > 0 ? 1 : 0}} />}
          </div>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: n === WORD.length ? C.lime : 'rgba(255,255,255,0.25)', transform: `scale(${posted ? lerp(0.9, 1, pt(t, tyE + 0.12, tyE + 0.3)) : 1})`}}>{posted ? 'Posted' : 'Post'}</span>
        </div>
      </div>
      {/* DM arrives */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 210, opacity: m1(dm * 1.5), transform: `translateY(${(1 - m1(dm)) * 40}px)`}}>
        <Mono>Direct message</Mono>
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width: 76, height: 92, borderRadius: 12, background: '#F2F4EF', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10, flex: 'none'}}>
            <span style={{fontFamily: MONO, fontSize: 18, color: C.ink, fontWeight: 700}}>PDF</span>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: '#fff', letterSpacing: '-0.02em'}}>Complete AI automation guide</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 32, color: C.grey}}>from Neuraxine</div>
          </div>
          <Icon n="check" size={40} color={C.lime} />
        </div>
      </div>
    </Glass>
  );
};

// ---------------------------------------------------------------- 7. follow: profile row, Follow tapped on "follow"
const Follow: React.FC<{t: number}> = ({t}) => {
  const a = Q('toh') - 0.05;
  const b = edit.speech + 0.05;
  const tap = Q('follow') + 0.05;
  const followed = t >= tap + 0.18;
  const press = pt(t, tap, tap + 0.1) * (1 - pt(t, tap + 0.1, tap + 0.25));
  return (
    <Glass t={t} a={a} b={b} top={1360} h={200} w={900}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 26, padding: '0 36px'}}>
        <div style={{width: 120, height: 120, borderRadius: 120, background: '#111512', border: `2px solid ${C.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
          <Img src={staticFile('brand/logo-alpha.png')} style={{width: 84, height: 62, objectFit: 'contain'}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, color: '#fff', letterSpacing: '-0.03em'}}>neuraxine</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: C.grey}}>AI automation, explained daily</div>
        </div>
        <div style={{width: 230, height: 84, borderRadius: 20, background: followed ? 'rgba(255,255,255,0.1)' : C.lime, color: followed ? '#fff' : C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - press * 0.08})`}}>
          {followed ? 'Following' : 'Follow'}
        </div>
      </div>
    </Glass>
  );
};

// ---------------------------------------------------------------- captions: 2-3 words, clean, spoken word in lime
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    if (/[.,?!]["”]?$/.test(w.w) || chars + (nx ? nx.w.length : 0) > 16 || !nx || nx.s - w.e > 0.25) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.35)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  const c = LINES.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const p = pt(t, c.s - 0.04, c.s + 0.14, smooth);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1180, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 20, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined}}>
      {c.words.map((w, i) => {
        const active = t >= w.s - 0.04 && (i === c.words.length - 1 || t < c.words[i + 1].s - 0.04);
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 74, letterSpacing: '-0.035em', lineHeight: 1.1, color: active ? C.limeSoft : '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)'}}>
            {w.w.replace(/["“”]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.3) return null;
  const r = t - a;
  const k = pt(t, a - 0.3, a + 0.2, inOut);
  return (
    <AbsoluteFill style={{background: '#0A0D0B', opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={staticFile('brand/logo-alpha.png')} style={{width: 260, height: 190, objectFit: 'contain', opacity: pt(r, 0, 0.5, smooth), transform: `scale(${lerp(0.92, 1, pt(r, 0, 0.8, smooth))})`}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 100, color: '#fff', letterSpacing: '-0.05em', marginTop: 34, opacity: pt(r, 0.15, 0.6, smooth)}}>Neuraxine</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.grey, marginTop: 4, opacity: pt(r, 0.3, 0.75, smooth)}}>work less. grow more.</div>
      <div style={{marginTop: 70, opacity: pt(r, 0.45, 0.9, smooth)}}>
        <Mono color={C.lime} style={{fontSize: 30}}>comment “AUTOMATE”</Mono>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 47%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) saturate(1.02) brightness(0.98)'}} />
      </AbsoluteFill>
      {/* grade: soft top and bottom falloff so type and panels sit on it */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.05) 28%, transparent 45%, rgba(0,0,0,0.15) 62%, rgba(0,0,0,0.5))'}} />
      {t < edit.speech + 0.1 && (
        <>
          <Hook t={t} />
          <Growth t={t} />
          <WhatIf t={t} />
          <Brand t={t} />
          <Tasks t={t} />
          <Flow t={t} />
          <Benefits t={t} />
          <Cta t={t} />
          <Follow t={t} />
          <Captions t={t} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
