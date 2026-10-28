import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import tl from './timeline.json';

// Luxury walkthrough: a 3D gold-line floor plan the camera flies across, diving into the real footage of each room.
const C = {bg: '#07070A', gold: '#D9B87A', gold2: '#F1DDB0', ivory: '#F6F1E7', dim: 'rgba(246,241,231,0.62)', line: 'rgba(217,184,122,0.55)'};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = tl.fps;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Shot = {clip: string; room: string; label: string; detail: string; a: number; b: number; how: string};
type Fly = {a: number; b: number; from: string; to: string};
const SHOTS = tl.shots as Shot[];
const FLIES = tl.flies as Fly[];
const LABELS = SHOTS.map((s) => s.label).filter((l, i, arr) => arr.indexOf(l) === i);

// ---------------------------------------------------------------- indicative plan (units: 1000 x 1300)
type Room = {id: string; x: number; y: number; w: number; h: number; name: string};
const ROOMS: Room[] = [
  {id: 'master', x: 0, y: 0, w: 560, h: 300, name: 'Master'},
  {id: 'ensuite', x: 560, y: 0, w: 200, h: 180, name: 'Bath'},
  {id: 'balcony', x: 560, y: 180, w: 260, h: 120, name: 'Balcony'},
  {id: 'utility', x: 820, y: 240, w: 180, h: 180, name: 'Utility'},
  {id: 'bed1', x: 0, y: 300, w: 420, h: 400, name: 'Bedroom'},
  {id: 'bath', x: 420, y: 420, w: 180, h: 220, name: 'Bath'},
  {id: 'kitchen', x: 600, y: 420, w: 400, h: 340, name: 'Kitchen'},
  {id: 'living', x: 0, y: 700, w: 600, h: 450, name: 'Living'},
  {id: 'dining', x: 600, y: 760, w: 400, h: 390, name: 'Dining'},
  {id: 'foyer', x: 420, y: 1150, w: 180, h: 150, name: 'Foyer'},
];
const R = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
const ctr = (id: string) => (id === 'outside' ? {x: 510, y: 1500} : {x: R[id].x + R[id].w / 2, y: R[id].y + R[id].h / 2});
const ORDER = ['foyer', 'living', 'dining', 'kitchen', 'utility', 'bath', 'bed1', 'master', 'ensuite', 'balcony', 'master'];
const PATH = ORDER.map(ctr);
const SEG = PATH.slice(1).map((p, i) => Math.hypot(p.x - PATH[i].x, p.y - PATH[i].y));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const WALL = 70;

/** How far along the route the walker is (0..TOTAL) for a given time. */
const routeAt = (t: number) => {
  const cur = SHOTS.reduce((n, s, i) => (t >= s.a - 0.01 ? i : n), 0);
  const roomIdx = (sh: number) => {
    let k = -1;
    for (let i = 0; i <= sh; i++) if (i === 0 || SHOTS[i].room !== SHOTS[i - 1].room) k++;
    return Math.min(k, ORDER.length - 1);
  };
  const lenTo = (k: number) => SEG.slice(0, Math.max(0, k)).reduce((a, b) => a + b, 0);
  const f = FLIES.find((x) => t >= x.a && t < x.b);
  if (f) {
    const next = SHOTS.findIndex((s) => s.a >= f.b - 0.01);
    const k1 = roomIdx(next);
    const k0 = Math.max(0, k1 - 1);
    return lerp(f.from === 'outside' ? 0 : lenTo(k0), lenTo(k1), pt(t, f.a, f.b, ease.inOut));
  }
  return lenTo(roomIdx(cur));
};
const pointAt = (len: number) => {
  let acc = 0;
  for (let i = 0; i < SEG.length; i++) {
    if (len <= acc + SEG[i]) {
      const u = (len - acc) / SEG[i];
      return {x: lerp(PATH[i].x, PATH[i + 1].x, u), y: lerp(PATH[i].y, PATH[i + 1].y, u)};
    }
    acc += SEG[i];
  }
  return PATH[PATH.length - 1];
};

// ---------------------------------------------------------------- the 3D plan
const Plan: React.FC<{t: number; rise: number; active?: string; travelled: number; allLit?: number; labels?: boolean}> = ({t, rise, active, travelled, allLit = 0, labels = true}) => {
  const walker = pointAt(travelled);
  const pathD = PATH.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 1300, transformStyle: 'preserve-3d'}}>
      {/* base slab */}
      <div style={{position: 'absolute', left: -40, top: -40, width: 1080, height: 1380, background: 'linear-gradient(135deg, rgba(217,184,122,0.10), rgba(217,184,122,0.02))', border: `1px solid rgba(217,184,122,0.25)`}} />
      {ROOMS.map((r) => {
        const on = r.id === active;
        const lit = Math.max(on ? 1 : 0, allLit);
        return (
          <React.Fragment key={r.id}>
            <div style={{position: 'absolute', left: r.x + 6, top: r.y + 6, width: r.w - 12, height: r.h - 12, background: `rgba(217,184,122,${0.05 + 0.22 * lit})`, boxShadow: lit ? `inset 0 0 60px rgba(241,221,176,${0.35 * lit})` : 'none', border: `2px solid rgba(217,184,122,${0.35 + 0.5 * lit})`}} />
            {/* walls: four glass panels standing up out of the floor */}
            {[
              {l: r.x, tp: r.y, w: r.w, h: WALL * rise, tf: 'rotateX(90deg)'},
              {l: r.x, tp: r.y + r.h, w: r.w, h: WALL * rise, tf: 'rotateX(90deg)'},
              {l: r.x, tp: r.y, w: WALL * rise, h: r.h, tf: 'rotateY(-90deg)'},
              {l: r.x + r.w, tp: r.y, w: WALL * rise, h: r.h, tf: 'rotateY(-90deg)'},
            ].map((wv, i) => (
              <div key={i} style={{position: 'absolute', left: wv.l, top: wv.tp, width: wv.w, height: wv.h, transformOrigin: '0 0', transform: wv.tf, background: `linear-gradient(${i < 2 ? 180 : 90}deg, rgba(217,184,122,${0.1 + 0.18 * lit}), rgba(217,184,122,0.03))`, borderTop: i < 2 ? `2px solid ${C.line}` : undefined, borderLeft: i >= 2 ? `2px solid ${C.line}` : undefined}} />
            ))}
            {labels && (
              <div style={{position: 'absolute', left: r.x, top: r.y + r.h / 2 - 20, width: r.w, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: '0.22em', color: `rgba(246,241,231,${0.35 + 0.65 * lit})`}}>{r.name.toUpperCase()}</div>
            )}
          </React.Fragment>
        );
      })}
      <svg width={1000} height={1300} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={pathD} fill="none" stroke="rgba(241,221,176,0.18)" strokeWidth={5} strokeDasharray="2 16" strokeLinecap="round" />
        <path d={pathD} fill="none" stroke={C.gold2} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${travelled} ${TOTAL + 10}`} style={{filter: `drop-shadow(0 0 10px ${C.gold})`}} />
        <circle cx={walker.x} cy={walker.y} r={16 + 4 * Math.sin(t * 6)} fill={C.ivory} style={{filter: `drop-shadow(0 0 18px ${C.gold2})`}} />
        <circle cx={walker.x} cy={walker.y} r={16 + ((t * 1.2) % 1) * 46} fill="none" stroke={C.gold2} strokeWidth={3} opacity={1 - ((t * 1.2) % 1)} />
      </svg>
    </div>
  );
};

/** Plan seen through a camera: focus point, zoom, tilt and orbit. */
const PlanCam: React.FC<{t: number; fx: number; fy: number; zoom: number; tilt?: number; orbit?: number; cy?: number; rise?: number; active?: string; allLit?: number; labels?: boolean; travelled: number}> = ({t, fx, fy, zoom, tilt = 56, orbit = -32, cy = 980, rise = 1, active, allLit, labels, travelled}) => (
  <AbsoluteFill style={{perspective: 2400, perspectiveOrigin: `540px ${cy}px`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transformStyle: 'preserve-3d', transform: `translate(540px, ${cy}px) rotateX(${tilt}deg) rotateZ(${orbit}deg) scale(${zoom}) translate(${-fx}px, ${-fy}px)`}}>
      <Plan t={t} rise={rise} active={active} travelled={travelled} allLit={allLit} labels={labels} />
    </div>
  </AbsoluteFill>
);

const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 45%, #1A1712 0%, ${C.bg} 70%)`}}>
    {Array.from({length: 34}, (_, i) => {
      const x = rand(i * 3.7) * 1080;
      const y = (rand(i * 1.9) * 1920 - t * (10 + rand(i) * 25) + 1920 * 4) % 1920;
      const r = 2 + rand(i * 5.1) * 4;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: C.gold2, opacity: 0.18 + 0.3 * Math.abs(Math.sin(t + i)), boxShadow: `0 0 ${r * 4}px ${C.gold}`}} />;
    })}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- footage
const Footage: React.FC<{t: number; s: Shot}> = ({t, s}) => {
  const local = t - s.a;
  const d = s.b - s.a;
  const dive = s.how === 'fly' ? pt(t, s.a, s.a + 0.55, ease.out) : 1;
  const xf = s.how === 'xf' ? pt(t, s.a, s.a + 0.35, ease.inOut) : 1;
  const z = lerp(1.28, 1.04, dive) + 0.05 * (local / d);
  return (
    <AbsoluteFill style={{opacity: Math.min(dive * 1.6, xf), transform: `scale(${z})`, filter: dive < 1 ? `blur(${(1 - dive) * 14}px)` : undefined}}>
      <Sequence from={Math.round(s.a * FPS)} durationInFrames={Math.round(d * FPS) + 1} layout="none">
        <OffthreadVideo muted src={staticFile(`clips/${s.clip}.mp4`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) saturate(1.06) brightness(1.03) sepia(0.12)'}} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Luxury grade over the footage: warm wash, cool shadows, vignette, top and bottom shade for type. */
const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(200deg, rgba(255,214,150,0.18), transparent 50%, rgba(30,45,70,0.22))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent 18%, transparent 62%, rgba(0,0,0,0.78))'}} />
  </>
);

const RoomTitle: React.FC<{t: number; s: Shot; n: number}> = ({t, s, n}) => {
  const a = s.a + (s.how === 'fly' ? 0.25 : 0.15);
  const out = pt(t, s.b - 0.35, s.b - 0.05, ease.in);
  const p = pt(t, a, a + 0.6, ease.out);
  const line = pt(t, a + 0.15, a + 0.8, ease.inOut);
  const q = pt(t, a + 0.35, a + 0.9, ease.out);
  return (
    <div style={{position: 'absolute', left: 80, bottom: 210, opacity: 1 - out, transform: `translateY(${-out * 20}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.4em', color: C.gold, opacity: p}}>{String(n).padStart(2, '0')}</div>
      <div style={{overflow: 'hidden', paddingBottom: 8}}>
        <div style={{fontFamily: SERIF, fontSize: 118, color: C.ivory, lineHeight: 1.02, transform: `translateY(${(1 - p) * 110}%)`, textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>{s.label}</div>
      </div>
      <div style={{width: 300 * line, height: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)`, margin: '10px 0 16px'}} />
      <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 32, letterSpacing: '0.06em', color: C.dim, opacity: q, transform: `translateY(${(1 - q) * 14}px)`}}>{s.detail}</div>
    </div>
  );
};

const Folio: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 120, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: '0.34em', color: C.dim, opacity: pt(t, tl.intro, tl.intro + 0.8)}}>
    <span>THE RESIDENCE</span>
    <span style={{color: C.gold}}>2 BHK</span>
  </div>
);

/** Small 3D mini-map, top-right, showing where we are. */
const MiniMap: React.FC<{t: number; active: string; travelled: number}> = ({t, active, travelled}) => (
  <div style={{position: 'absolute', right: 30, top: 170, width: 330, height: 380, opacity: pt(t, tl.intro + 0.6, tl.intro + 1.2)}}>
    <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transformStyle: 'preserve-3d', transform: `translate(165px, 205px) rotateX(56deg) rotateZ(-32deg) scale(0.26) translate(-500px, -650px)`}}>
        <Plan t={t} rise={1} active={active} travelled={travelled} labels={false} />
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------- intro / fly-throughs / outro
const Intro: React.FC<{t: number}> = ({t}) => {
  if (t > tl.intro + 0.05) return null;
  const rise = pt(t, 0.4, 1.8, ease.inOut);
  const orbit = lerp(-60, -32, pt(t, 0, tl.intro, ease.inOut));
  const zoom = lerp(0.62, 0.78, pt(t, 0, tl.intro, ease.inOut));
  const title = pt(t, 0.9, 1.7, ease.out);
  const sub = pt(t, 1.4, 2.1, ease.out);
  const out = pt(t, tl.intro - 0.5, tl.intro, ease.in);
  return (
    <AbsoluteFill style={{opacity: 1}}>
      <Backdrop t={t} />
      <PlanCam t={t} fx={500} fy={650} zoom={zoom} orbit={orbit} cy={1150} rise={rise} travelled={0} labels={rise > 0.9} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', opacity: 1 - out}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.5em', paddingLeft: '0.5em', color: C.gold, opacity: title}}>PRESENTING</div>
        <div style={{overflow: 'hidden', marginTop: 18}}>
          <div style={{fontFamily: SERIF, fontSize: 170, color: C.ivory, lineHeight: 1, transform: `translateY(${(1 - title) * 100}%)`}}>The Residence</div>
        </div>
        <div style={{width: 360 * sub, height: 2, margin: '28px auto 22px', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 58, color: C.gold2, opacity: sub}}>2 BHK · Fully Furnished</div>
      </div>
    </AbsoluteFill>
  );
};

const FlyOver: React.FC<{t: number}> = ({t}) => {
  const f = FLIES.find((x) => t >= x.a - 0.25 && t < x.b + 0.1);
  if (!f) return null;
  const k = pt(t, f.a, f.b, ease.inOut);
  const A = ctr(f.from), B = ctr(f.to);
  // pull back over the plan, glide, then dive into the next room
  const zoom = f.from === 'outside' ? lerp(0.78, 2.4, pt(t, f.a, f.b, ease.in)) : 1.05 - 0.35 * Math.sin(k * Math.PI) + 1.4 * pt(t, f.b - 0.3, f.b + 0.1, ease.in);
  const fx = f.from === 'outside' ? lerp(500, B.x, k) : lerp(A.x, B.x, k);
  const fy = f.from === 'outside' ? lerp(650, B.y, k) : lerp(A.y, B.y, k);
  const inn = f.from === 'outside' ? 1 : pt(t, f.a - 0.25, f.a + 0.05, ease.out);
  const out = 1 - pt(t, f.b - 0.12, f.b + 0.1, ease.in);
  return (
    <AbsoluteFill style={{opacity: inn * out}}>
      <Backdrop t={t} />
      <PlanCam t={t} fx={fx} fy={fy} zoom={zoom} orbit={-32 + 10 * Math.sin(k * Math.PI)} tilt={56 - 8 * Math.sin(k * Math.PI)} active={f.to} travelled={routeAt(t)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: '0.45em', paddingLeft: '0.45em', color: C.gold, opacity: Math.sin(k * Math.PI)}}>
        NEXT · {SHOTS.find((s) => s.room === f.to)?.label.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{t: number}> = ({t}) => {
  const a = tl.outroAt - 0.3;
  if (t < a) return null;
  const k = pt(t, a, a + 0.6, ease.out);
  const zoom = lerp(1.6, 0.74, pt(t, a, a + 1.6, ease.inOut));
  const lit = pt(t, a + 0.4, a + 1.4, ease.inOut);
  const title = pt(t, a + 0.8, a + 1.5, ease.out);
  const fade = pt(t, tl.duration - 0.5, tl.duration, ease.inOut);
  return (
    <AbsoluteFill style={{opacity: k * (1 - fade)}}>
      <Backdrop t={t} />
      <PlanCam t={t} fx={500} fy={650} zoom={zoom} orbit={lerp(-32, -48, pt(t, a, tl.duration, ease.inOut))} cy={1180} allLit={lit} travelled={TOTAL} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.5em', paddingLeft: '0.5em', color: C.gold, opacity: title}}>THE RESIDENCE</div>
        <div style={{overflow: 'hidden', marginTop: 16}}>
          <div style={{fontFamily: SERIF, fontSize: 120, color: C.ivory, lineHeight: 1.05, transform: `translateY(${(1 - title) * 100}%)`}}>Schedule a</div>
        </div>
        <div style={{overflow: 'hidden'}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.gold2, lineHeight: 1.05, transform: `translateY(${(1 - pt(t, a + 0.95, a + 1.6, ease.out)) * 100}%)`}}>private viewing</div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.2em', color: C.dim, marginTop: 26, opacity: pt(t, a + 1.4, a + 2.0)}}>DM FOR DETAILS</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontFamily: SANS, fontSize: 20, letterSpacing: '0.18em', color: 'rgba(246,241,231,0.35)'}}>INDICATIVE LAYOUT · NOT TO SCALE</div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 9} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const live = SHOTS.filter((s) => t >= s.a - 0.01 && t < s.b);
  const cur = live[live.length - 1];
  const roomNo = (s: Shot) => LABELS.indexOf(s.label) + 1;
  const inFly = FLIES.some((f) => t >= f.a - 0.25 && t < f.b + 0.1);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {live.map((s) => (
        <Footage key={s.clip} t={t} s={s} />
      ))}
      {cur && <Grade />}
      {cur && !inFly && t < tl.outroAt - 0.3 && (
        <>
          <RoomTitle t={t} s={cur} n={roomNo(cur)} />
          <MiniMap t={t} active={cur.room} travelled={routeAt(t)} />
          <Folio t={t} />
        </>
      )}
      <FlyOver t={t} />
      <Intro t={t} />
      <Outro t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: '#000', opacity: 1 - pt(t, 0, 0.5, ease.out)}} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
