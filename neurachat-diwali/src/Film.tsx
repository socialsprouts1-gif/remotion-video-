// Neura Chat — "Diwali offer" cartoon story. Every scene is timed from the voice (src/vo.json).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AUDIO, BRAND, LINES, RIVAL, SCENES, SECTION_IDS, SceneId, TOTAL_FRAMES, VIDEO, Who, cue, isTalking, mouthAt, wordAt} from './config';
import {Character, CharProps} from './chars/Character';
import {Counter, ShopBack, Silhouette, Street} from './world/Shop';
import {LaptopScreen, Screen} from './world/Laptop';
import {ease, mix, prog, rand, range} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {SfxTrack} from './SfxTrack';

const fr = (s: number) => Math.round(s * VIDEO.fps);
const FONT = 'Inter, sans-serif';

type Cam = {x: number; y: number; z: number};
/** World → frame: the camera looks at (x, y) with zoom z. */
const Stage: React.FC<{cam: Cam; shake?: number; children: React.ReactNode}> = ({cam, shake = 0, children}) => {
  const frame = useCurrentFrame();
  const sx = shake ? Math.sin(frame * 2.7) * shake : 0;
  const sy = shake ? Math.cos(frame * 3.1) * shake : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${540 + sx} ${960 + sy}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
    </svg>
  );
};

/** Lerp between camera keys [frame, cam]. */
const camAt = (f: number, keys: [number, Cam][], e = ease.inOut): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, c1] = keys[i];
    const [f0, c0] = keys[i - 1];
    if (f <= f1) {
      const p = e((f - f0) / Math.max(1, f1 - f0));
      return {x: mix(p, c0.x, c1.x), y: mix(p, c0.y, c1.y), z: mix(p, c0.z, c1.z)};
    }
  }
  return keys[keys.length - 1][1];
};

/** Character with lip sync from the voice track. */
const Actor: React.FC<Omit<CharProps, 'frame' | 'mouth' | 'kind'> & {who: Exclude<Who, 'vo'>; from: number}> = ({who, from, ...p}) => {
  const frame = useCurrentFrame();
  const abs = frame + from;
  return <Character {...p} kind={who} frame={frame} mouth={mouthAt(who, abs)} bob={(p.bob ?? 0) + (isTalking(who, abs) ? Math.abs(Math.sin(frame / 5)) * 2 : 0)} />;
};

/** Little pop-in factor for overlays. */
const pop = (f: number, at: number, dur = 9) => {
  const p = prog(f, at, dur, ease.out);
  return {p, s: p < 1 ? 0.6 + p * 0.4 + Math.sin(p * Math.PI) * 0.12 : 1};
};

// ───────────────────────── scenes ─────────────────────────

const News: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.news.from;
  const walkIn = prog(f, 0, 26, ease.out);
  const kx = mix(walkIn, -220, 300);
  const cam = camAt(f, [
    [0, {x: 540, y: 980, z: 1.0}],
    [SCENES.news.dur, {x: 470, y: 1040, z: 1.1}],
  ]);
  const notif = pop(f, fr(cue('news', 0) + 0.9));
  const sethLook = f > 14 ? -1 : 0;
  const shock = f > fr(wordAt('news', 0, 'diwali'));
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} look={sethLook} expr={shock ? 'worried' : 'neutral'} armL={[10, 4]} armR={[12, 6]} />
        <Counter x={470} y={1380} frame={f} />
        <Actor who="kaka" from={from} x={kx} y={1620} scale={0.78} walk={walkIn < 1 ? f + 1 : 0} look={1} expr="worried" prop={{hand: 'r', kind: 'phone'}} armR={[22 + Math.sin(f / 5) * 4, -118]} armL={[10, 6]} />
        {/* the rival's WhatsApp offer on Kaka's phone */}
        <g transform={`translate(${kx - 220} ${720}) scale(${notif.s * 1.45})`} opacity={notif.p}>
          <rect x={-10} y={-60} width={430} height={150} rx={22} fill="#fff" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.18))" />
          <circle cx={42} cy={-4} r={28} fill="#25D366" />
          <path d="M 30 -8 q 12 18 26 4" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
          <text x={86} y={-20} fontFamily={FONT} fontWeight={800} fontSize={24} fill="#1C1530">
            {RIVAL}
          </text>
          <text x={86} y={14} fontFamily={FONT} fontWeight={600} fontSize={21} fill="#4B4462">
            🪔 Diwali Sale! 50% OFF on TV,
          </text>
          <text x={86} y={44} fontFamily={FONT} fontWeight={600} fontSize={21} fill="#4B4462">
            fridge, AC. Aaj hi aaiye!
          </text>
          <text x={400} y={-24} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={16} fill="#8A83A0">
            now
          </text>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const dur = SCENES.street.dur;
  const cam = camAt(f, [
    [0, {x: 540, y: 900, z: 1.04}],
    [dur, {x: 600, y: 900, z: 1.16}],
  ]);
  const people = [
    {x0: -250, x1: 640, y: 1330, s: 0.5, c: '#6F6A8E', d: 0},
    {x0: -420, x1: 700, y: 1345, s: 0.52, c: '#7C6A8C', d: 8},
    {x0: 1350, x1: 800, y: 1335, s: 0.5, c: '#6A7590', d: 4},
    {x0: 1500, x1: 760, y: 1350, s: 0.54, c: '#856F8F', d: 14},
    {x0: -600, x1: 620, y: 1360, s: 0.55, c: '#66708A', d: 20},
    {x0: 1700, x1: 840, y: 1365, s: 0.53, c: '#7A6E92', d: 26},
  ];
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <Street frame={f} rival={RIVAL} />
        {people.map((p, i) => {
          const t = prog(f, p.d, dur - 10, (x) => x);
          const x = mix(t, p.x0, p.x1);
          const fade = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
          return <Silhouette key={i} x={x} y={p.y} s={p.s * 0.72} c={p.c} frame={f} walk seed={i} opacity={0.88 * fade} />;
        })}
      </Stage>
    </AbsoluteFill>
  );
};

const Shock: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.shock.from;
  const punch = prog(f, 4, 6, ease.out);
  const cam = {x: 800, y: 880, z: mix(punch, 1.9, 2.45)};
  const shake = f > 4 && f < 22 ? (22 - f) * 0.5 : 0;
  return (
    <AbsoluteFill>
      <Stage cam={cam} shake={shake}>
        <ShopBack frame={f} />
        {/* speed lines */}
        <g opacity={punch * 0.5}>
          {Array.from({length: 24}).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={800 + Math.cos(a) * 170} y1={790 + Math.sin(a) * 170} x2={800 + Math.cos(a) * 700} y2={790 + Math.sin(a) * 700} stroke="#fff" strokeWidth={6} />;
          })}
        </g>
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} expr="shock" armL={[mix(punch, 10, 32), mix(punch, 4, -150)]} armR={[mix(punch, 10, 32), mix(punch, 4, -150)]} />
        <Counter x={470} y={1380} frame={f} />
      </Stage>
    </AbsoluteFill>
  );
};

const Order: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.order.from;
  const point = prog(f, fr(cue('order', 0)) + 2, 8);
  const wa = f > fr(wordAt('order', 0, 'sabko'));
  const cam = camAt(f, [
    [0, {x: 560, y: 1050, z: 1.22}],
    [SCENES.order.dur, {x: 590, y: 1040, z: 1.3}],
  ]);
  const chip = pop(f, fr(wordAt('order', 0, 'whatsapp')));
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} look={-1} expr={wa ? 'smile' : 'angry'} armL={[mix(point, 10, 78), mix(point, 4, -20)]} armR={[12, 6]} />
        <Counter x={470} y={1380} frame={f} />
        <Actor who="kaka" from={from} x={300} y={1620} scale={0.78} look={1} expr="neutral" armL={[10, 6]} armR={[10, 6]} />
        <g transform={`translate(560 640) scale(${chip.s})`} opacity={chip.p}>
          <circle cx={0} cy={0} r={70} fill="#25D366" />
          <path fill="#fff" d="M 0 -40 a 40 40 0 0 0 -34 60 l -6 22 l 22 -6 a 40 40 0 1 0 18 -76 z" />
          <path fill="#25D366" d="M -14 -16 c 2 -4 4 -4 7 -4 l 4 8 l -4 6 c 3 6 8 11 14 14 l 6 -4 l 8 4 c 0 3 -2 7 -6 8 c -10 2 -30 -12 -32 -26 c 0 -3 1 -5 3 -6 z" />
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

const Diary: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.diary.from;
  const l2 = fr(cue('diary', 1));
  const cam = camAt(f, [
    [0, {x: 360, y: 1040, z: 1.55}],
    [l2, {x: 380, y: 1020, z: 1.68}],
    [SCENES.diary.dur, {x: 400, y: 1010, z: 1.75}],
  ]);
  const raise = prog(f, 2, 10);
  const card = pop(f, l2 + 4);
  const sent = Math.min(3, Math.floor(Math.max(0, f - l2 - 10) / 26) + (f > l2 + 10 ? 1 : 0));
  const hrs = Math.max(0, f - l2 - 10);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} look={-1} expr="worried" armL={[10, 4]} armR={[12, 6]} />
        <Counter x={470} y={1380} frame={f} />
        <Actor who="kaka" from={from} x={330} y={1620} scale={0.78} look={0.6} expr={f > l2 ? 'worried' : 'neutral'} prop={{hand: 'r', kind: 'diary'}} armR={[mix(raise, 10, 26), mix(raise, 6, -128)]} armL={[10, 6]} />
        {/* "one by one" sending counter */}
        <g transform={`translate(110 520) scale(${card.s * 0.66})`} opacity={card.p}>
          <rect x={0} y={0} width={420} height={250} rx={28} fill="#fff" filter="drop-shadow(0 12px 22px rgba(0,0,0,0.2))" />
          <circle cx={54} cy={56} r={26} fill="#25D366" />
          <text x={96} y={66} fontFamily={FONT} fontWeight={800} fontSize={28} fill="#1C1530">
            Sending one by one…
          </text>
          <text x={40} y={150} fontFamily="Inter Display" fontWeight={900} fontSize={72} fill="#1C1530">
            {sent}
            <tspan fontSize={40} fill="#8A83A0"> / 2,000</tspan>
          </text>
          <rect x={40} y={180} width={340} height={14} rx={7} fill="#EEE9F7" />
          <rect x={40} y={180} width={Math.max(4, sent * 1.2)} height={14} rx={7} fill="#25D366" />
          <text x={40} y={228} fontFamily={FONT} fontWeight={700} fontSize={22} fill="#D62828">
            ⏳ Time left: {Math.round(33 - hrs / 30)}+ hours
          </text>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

const Block: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.block.from;
  const at = fr(wordAt('block', 0, 'block'));
  const cam = camAt(f, [
    [0, {x: 790, y: 900, z: 2.0}],
    [SCENES.block.dur, {x: 770, y: 900, z: 2.15}],
  ]);
  const ban = pop(f, at - 4, 8);
  const card = pop(f, at + 4, 10);
  return (
    <AbsoluteFill>
      <Stage cam={cam} shake={f > at - 4 && f < at + 8 ? 3 : 0}>
        <ShopBack frame={f} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} expr="worried" sweat={prog(f, 4, 10)} armL={[24, -158]} armR={[12, 6]} />
        <Counter x={470} y={1380} frame={f} />
        <g transform={`translate(600 700) scale(${ban.s * 0.55})`} opacity={ban.p}>
          <circle cx={0} cy={0} r={90} fill="#fff" />
          <circle cx={0} cy={0} r={74} fill="none" stroke="#E11D2E" strokeWidth={22} />
          <line x1={-52} y1={52} x2={52} y2={-52} stroke="#E11D2E" strokeWidth={22} />
        </g>
        <g transform={`translate(560 980) scale(${card.s * 0.5})`} opacity={card.p}>
          <rect x={-40} y={-60} width={560} height={140} rx={24} fill="#fff" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.2))" />
          <rect x={-40} y={-60} width={14} height={140} rx={7} fill="#E11D2E" />
          <text x={10} y={-6} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#B91C1C">
            ⚠ Number blocked
          </text>
          <text x={10} y={40} fontFamily={FONT} fontWeight={600} fontSize={25} fill="#4B4462">
            Too many messages sent at once
          </text>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

const Raju: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.raju.from;
  const walkIn = prog(f, 0, 22, ease.out);
  const rx = mix(walkIn, -260, 120);
  const l2 = fr(cue('raju', 1));
  const cam = camAt(f, [
    [0, {x: 500, y: 1010, z: 1.08}],
    [l2, {x: 470, y: 1010, z: 1.14}],
    [SCENES.raju.dur, {x: 470, y: 1000, z: 1.2}],
  ]);
  const chip = pop(f, fr(wordAt('raju', 1, 'neura')));
  const relief = f > l2 + 20;
  const gesture = prog(f, l2, 10);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} look={-1} expr={relief ? 'smile' : 'worried'} armL={[10, 4]} armR={[12, 6]} />
        <Counter x={470} y={1380} frame={f} />
        <Actor who="kaka" from={from} x={380} y={1630} scale={0.78} look={-1} expr={relief ? 'smile' : 'worried'} armL={[10, 6]} armR={[10, 6]} />
        <Actor who="raju" from={from} x={rx} y={1650} scale={0.8} look={1} walk={walkIn < 1 ? f + 1 : 0} expr="smile" armL={[10, 6]} armR={[mix(gesture, 10, 60), mix(gesture, 6, -60)]} />
        <g transform={`translate(440 560) scale(${chip.s * 1.3})`} opacity={chip.p}>
          <rect x={-200} y={-62} width={400} height={124} rx={28} fill="#fff" filter="drop-shadow(0 12px 22px rgba(60,20,120,0.25))" />
          <foreignObject x={-182} y={-42} width={84} height={84}>
            <Img src={staticFile(BRAND.logo)} style={{width: 84, height: 84, borderRadius: 18}} />
          </foreignObject>
          <text x={-82} y={-6} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#1C1530">
            Neura <tspan fill={BRAND.purple}>Chat</tspan>
          </text>
          <text x={-82} y={32} fontFamily={FONT} fontWeight={700} fontSize={22} fill="#6B6385">
            CRM · 2,000 customers ✓
          </text>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

// Laptop demo: dashboard on a laptop, camera moves over the screen.
const SCR = {x: 40, y: 470, w: 1000, s: 1000 / 1280};
const Laptop: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / VIDEO.fps;
  const c0 = fr(cue('laptop', 0));
  const sel = fr(wordAt('laptop', 0, 'sab customers'));
  const c1 = fr(cue('laptop', 1));
  const click = fr(wordAt('laptop', 1, 'click'));
  const c2 = fr(cue('laptop', 2));
  const c3 = fr(cue('laptop', 3));
  const khud = fr(wordAt('laptop', 3, 'khud'));
  const screen: Screen = f < sel ? 'poster' : f < c2 ? 'select' : f < c3 ? 'report' : 'inbox';
  // screen-space (1280×800) cursor path
  const nextBtn: [number, number] = [430, 655];
  const selAll: [number, number] = [290, 160];
  const sendBtn: [number, number] = [1150, 750];
  let cur: [number, number, number] | undefined;
  if (f < sel) {
    const p = prog(f, sel - 22, 14, ease.inOut);
    cur = [mix(p, 700, nextBtn[0]), mix(p, 520, nextBtn[1]), f > sel - 6 ? 1 : 0];
  } else if (f < c2) {
    const p1 = prog(f, sel, 10, ease.inOut);
    const p2 = prog(f, click - 16, 14, ease.inOut);
    const x = p2 > 0 ? mix(p2, selAll[0], sendBtn[0]) : mix(p1, nextBtn[0], selAll[0]);
    const y = p2 > 0 ? mix(p2, selAll[1], sendBtn[1]) : mix(p1, nextBtn[1], selAll[1]);
    const down = (f >= sel + 10 && f < sel + 15) || (f >= click - 2 && f < click + 4) ? 1 : 0;
    cur = [x, y, down];
  }
  const all = prog(f, sel + 12, 26, ease.soft);
  const sent = prog(f, click + 2, c2 - click - 8, (x) => x);
  const press = f >= click - 2 && f < click + 4 ? 1 : f >= sel - 6 && f < sel ? 1 : 0;
  const ask = prog(f, c3 + 4, 10);
  const reply = prog(f, khud - 4, 12);
  // camera keys in frame space (0..1080 × 0..1920)
  const sx = (x: number) => SCR.x + x * SCR.s;
  const sy = (y: number) => SCR.y + y * SCR.s;
  const cam = camAt(f, [
    [0, {x: 540, y: 900, z: 0.92}],
    [c0 + 6, {x: sx(1020), y: sy(330), z: 1.55}],
    [sel - 26, {x: sx(1000), y: sy(360), z: 1.6}],
    [sel - 8, {x: sx(560), y: sy(520), z: 1.3}],
    [sel + 4, {x: sx(620), y: sy(380), z: 1.5}],
    [click - 16, {x: sx(660), y: sy(420), z: 1.52}],
    [click, {x: sx(920), y: sy(650), z: 1.6}],
    [c2 - 4, {x: sx(880), y: sy(600), z: 1.5}],
    [c2 + 6, {x: sx(740), y: sy(230), z: 1.55}],
    [c3 - 10, {x: sx(740), y: sy(470), z: 1.5}],
    [c3 + 6, {x: sx(930), y: sy(380), z: 1.75}],
    [SCENES.laptop.dur, {x: sx(930), y: sy(400), z: 1.82}],
  ]);
  // WhatsApp ticks flying out while sending
  const flying = sent > 0 && sent < 1;
  return (
    <AbsoluteFill style={{background: '#2A1A12'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>
        {/* warm shop bokeh behind */}
        <div style={{position: 'absolute', left: -600, top: -600, width: 2300, height: 3200, background: 'radial-gradient(circle at 50% 30%, #6B4A2E, #2A1A12 70%)'}} />
        {Array.from({length: 26}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: -300 + rand(i) * 1700, top: -200 + rand(i * 4) * 700, width: 40 + rand(i * 2) * 80, height: 40 + rand(i * 2) * 80, borderRadius: 999, background: ['#FFB347', '#FF6B6B', '#FFD93D', '#B794F6', '#6BCB77'][i % 5], opacity: 0.18 + 0.12 * Math.sin(t * 2 + i), filter: 'blur(6px)'}} />
        ))}
        {/* counter top */}
        <div style={{position: 'absolute', left: -600, top: 1330, width: 2300, height: 1400, background: 'linear-gradient(180deg, #B07440, #7C4520)'}} />
        {/* laptop body */}
        <div style={{position: 'absolute', left: SCR.x - 26, top: SCR.y - 26, width: SCR.w + 52, height: 800 * SCR.s + 52, borderRadius: 30, background: '#1A1B22', boxShadow: '0 40px 80px rgba(0,0,0,0.45)'}} />
        <div style={{position: 'absolute', left: 540 - 6, top: SCR.y - 17, width: 12, height: 12, borderRadius: 12, background: '#333642'}} />
        <div style={{position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: 800 * SCR.s, overflow: 'hidden', borderRadius: 6}}>
          <div style={{transform: `scale(${SCR.s})`, transformOrigin: '0 0'}}>
            <LaptopScreen screen={screen} t={t - (screen === 'poster' ? c0 / 30 : screen === 'select' ? sel / 30 : screen === 'report' ? c2 / 30 : c3 / 30)} press={press} all={all} sent={screen === 'select' ? sent : 0} ask={ask} reply={reply} cursor={cur} />
          </div>
        </div>
        {/* keyboard deck */}
        <div style={{position: 'absolute', left: SCR.x - 70, top: SCR.y + 800 * SCR.s + 26, width: SCR.w + 140, height: 300, background: 'linear-gradient(180deg, #D5D8E0, #AEB3BF)', clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0 100%)', borderRadius: 10}}>
          {Array.from({length: 5}).map((_, r) => (
            <div key={r} style={{position: 'absolute', left: 90 + r * 6, right: 90 + r * 6, top: 26 + r * 40, height: 32, display: 'flex', gap: 6}}>
              {Array.from({length: 14}).map((__, k) => (
                <div key={k} style={{flex: 1, borderRadius: 5, background: '#2B2D36'}} />
              ))}
            </div>
          ))}
        </div>
        {/* diyas on the counter */}
        {[-40, 1060].map((x, i) => (
          <div key={x} style={{position: 'absolute', left: x, top: 1330, width: 70, height: 60}}>
            <div style={{position: 'absolute', left: -40, top: -70, width: 150, height: 150, borderRadius: 150, background: 'radial-gradient(circle, rgba(255,190,60,0.45), transparent 65%)'}} />
            <div style={{position: 'absolute', left: 30, top: -26 - Math.sin(t * 18 + i) * 2, width: 12, height: 26, borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: '#FFC531'}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 70, height: 26, borderRadius: '0 0 40px 40px', background: '#C0582C'}} />
          </div>
        ))}
        {flying &&
          Array.from({length: 10}).map((_, i) => {
            const st = (f - click) / 30 - i * 0.18;
            if (st < 0 || st > 1.4) return null;
            const p = st / 1.4;
            return (
              <div key={i} style={{position: 'absolute', left: 120 + rand(i * 9) * 840, top: SCR.y - 40 - p * 420, opacity: 1 - p, transform: `scale(${0.8 + p * 0.4})`, padding: '8px 14px', borderRadius: 14, background: '#25D366', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 22, boxShadow: '0 6px 14px rgba(0,0,0,0.25)'}}>
                ✓✓
              </div>
            );
          })}
      </div>
    </AbsoluteFill>
  );
};

const Easy: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.easy.from;
  const cam = {x: 790, y: 900, z: mix(prog(f, 0, 30), 2.0, 2.2)};
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} tvOn={0.4} />
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} expr={f > 18 ? 'happy' : 'shock'} armL={[38, -40]} armR={[38, -40]} look={-0.5} />
        <Counter x={470} y={1380} frame={f} glow={0.8} />
        {Array.from({length: 8}).map((_, i) => {
          const p = prog(f, 4 + i * 2, 16);
          const a = (i / 8) * Math.PI * 2;
          return <circle key={i} cx={800 + Math.cos(a) * (150 + p * 120)} cy={790 + Math.sin(a) * (150 + p * 120)} r={8 * (1 - p)} fill="#FFD43B" />;
        })}
      </Stage>
    </AbsoluteFill>
  );
};

const Crowd: React.FC = () => {
  const f = useCurrentFrame();
  const from = SCENES.crowd.from;
  const dur = SCENES.crowd.dur;
  const l2 = fr(cue('crowd', 1));
  const l3 = fr(cue('crowd', 2));
  const cam = camAt(f, [
    [0, {x: 540, y: 980, z: 1.0}],
    [l2 - 4, {x: 540, y: 990, z: 1.06}],
    [l2 + 10, {x: 700, y: 930, z: 1.45}],
    [l3 - 2, {x: 700, y: 930, z: 1.52}],
    [l3 + 10, {x: 540, y: 980, z: 1.05}],
    [dur, {x: 540, y: 980, z: 1.08}],
  ]);
  const crowd = [
    {x: -120, y: 1500, s: 0.62, c: '#7E7697', d: 0},
    {x: 70, y: 1470, s: 0.58, c: '#8A7A92', d: 4},
    {x: 250, y: 1450, s: 0.55, c: '#6F7A95', d: 8},
    {x: 1180, y: 1460, s: 0.6, c: '#7C6E90', d: 6},
    {x: 1290, y: 1520, s: 0.64, c: '#86799B', d: 10},
    {x: 420, y: 1420, s: 0.5, c: '#77708F', d: 12},
  ];
  const confetti = Array.from({length: 60});
  const burst = pop(f, l3, 10);
  return (
    <AbsoluteFill>
      <Stage cam={cam}>
        <ShopBack frame={f} tvOn={0.6} />
        {crowd.map((p, i) => {
          const t = prog(f, p.d, 24);
          return <Silhouette key={i} x={mix(t, p.x < 540 ? p.x - 300 : p.x + 300, p.x)} y={p.y} s={p.s} c={p.c} frame={f} walk={t < 1} seed={i} opacity={0.82 * t} />;
        })}
        <Actor who="seth" from={from} x={800} y={1440} scale={0.74} look={f > l2 ? -1 : 0} expr={f > l2 ? 'smile' : 'happy'} armL={f > l3 ? [70, -30] : f > l2 ? [60, -110] : [40, -40]} armR={f > l3 ? [70, -30] : [40, -40]} bob={f < l2 ? Math.abs(Math.sin(f / 6)) * 8 : 0} />
        <Counter x={470} y={1380} frame={f} glow={0.5} />
        <Actor who="kaka" from={from} x={420} y={1640} scale={0.78} look={1} expr="happy" armL={[60, -40]} armR={[60, -40]} bob={Math.abs(Math.sin(f / 6 + 1)) * 6} />
        <Actor who="raju" from={from} x={150} y={1680} scale={0.8} look={1} expr="happy" armL={[150, -10]} armR={[30, -20]} />
        {confetti.map((_, i) => {
          const sp = 3 + rand(i) * 4;
          const y = ((f * sp + rand(i * 7) * 2200) % 2200) - 300;
          const x = -200 + rand(i * 3) * 1500 + Math.sin(f / 10 + i) * 20;
          return <rect key={i} x={x} y={y} width={14} height={22} rx={3} fill={['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB', '#FF9100'][i % 6]} transform={`rotate(${f * 6 + i * 40} ${x + 7} ${y + 11})`} />;
        })}
        {f >= l3 &&
          [0, 1, 2].map((k) => {
            const cx = [200, 540, 880][k];
            const cy = [520, 420, 540][k];
            const p = prog(f, l3 + k * 5, 22);
            return (
              <g key={k} opacity={1 - p}>
                {Array.from({length: 16}).map((_, i) => {
                  const a = (i / 16) * Math.PI * 2;
                  return <circle key={i} cx={cx + Math.cos(a) * p * 180} cy={cy + Math.sin(a) * p * 180 + p * p * 40} r={7} fill={['#FFD740', '#FF5252', '#69F0AE', '#E040FB'][(i + k) % 4]} />;
                })}
              </g>
            );
          })}
        <g transform={`translate(540 760) scale(${burst.s})`} opacity={burst.p}>
          <text x={0} y={0} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={110} fill="#FFC531" stroke="#7A1F1F" strokeWidth={10} paintOrder="stroke">
            Happy Diwali!
          </text>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => prog(f, fr(s), 14);
  const l = LINES.find((x) => x.section === 'end')!;
  const at = (w: string) => wordAt('end', 0, w);
  const logo = pop(f, 2, 14);
  const items: [string, number][] = [
    ['Broadcast', at('broadcast')],
    ['CRM', at('crm')],
    ['AI Replies', at('ai replies')],
  ];
  const cta = prog(f, fr(at('link')), 12);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #FFFFFF, #F4F0FB 70%)', fontFamily: FONT, alignItems: 'center'}}>
      <div style={{position: 'absolute', right: -220, top: -220, width: 620, height: 620, borderRadius: 620, background: '#EFE8FC'}} />
      <div style={{position: 'absolute', left: -260, bottom: -260, width: 640, height: 640, borderRadius: 640, background: '#EFE8FC'}} />
      <div style={{position: 'absolute', top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Img src={staticFile(BRAND.logo)} style={{width: 190, height: 190, borderRadius: 44, transform: `scale(${logo.s})`, opacity: logo.p, boxShadow: '0 24px 60px rgba(76,29,149,0.3)'}} />
        <div style={{marginTop: 40, fontSize: 118, fontWeight: 900, color: '#1C1530', letterSpacing: -2, fontFamily: '"Inter Display", Inter', opacity: a(0.2), transform: `translateY(${(1 - a(0.2)) * 30}px)`}}>
          Neura <span style={{background: 'linear-gradient(90deg, #6D28D9, #C026D3)', WebkitBackgroundClip: 'text', color: 'transparent'}}>Chat</span>
        </div>
        <div style={{marginTop: 6, fontSize: 38, fontWeight: 600, color: '#6B6385', opacity: a(0.5)}}>{BRAND.tagline}</div>
        <div style={{marginTop: 80, display: 'flex', gap: 18}}>
          {items.map(([w, s]) => {
            const p = prog(f, fr(s), 10);
            return (
              <div key={w} style={{padding: '18px 28px', borderRadius: 18, background: '#fff', border: '2px solid #E5DCF8', fontSize: 36, fontWeight: 800, color: '#3B2D6B', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, boxShadow: '0 10px 24px rgba(76,29,149,0.1)'}}>
                {w}
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 34, fontSize: 52, fontWeight: 900, color: BRAND.violet, opacity: prog(f, fr(at('sab ek')), 10)}}>Sab ek jagah.</div>
        <div style={{marginTop: 80, padding: '26px 46px', borderRadius: 999, background: '#1C1530', color: '#fff', textAlign: 'center', opacity: cta, transform: `scale(${0.85 + cta * 0.15})`, boxShadow: `0 0 0 ${10 + Math.sin(f / 6) * 4}px rgba(124,58,237,${0.18 * cta})`}}>
          <div style={{fontSize: 44, fontWeight: 900}}>
            Comment <span style={{color: '#C4B5FD'}}>“{BRAND.keyword}”</span>
          </div>
          <div style={{fontSize: 26, fontWeight: 600, color: '#CFC6E8', marginTop: 4}}>to get the link</div>
        </div>
      </div>
      <div style={{display: 'none'}}>{l.text}</div>
    </AbsoluteFill>
  );
};

const SCENE_COMP: Record<SceneId, React.FC> = {news: News, street: StreetScene, shock: Shock, order: Order, diary: Diary, block: Block, raju: Raju, laptop: Laptop, easy: Easy, crowd: Crowd, end: End};

// ───────────────────────── captions ─────────────────────────
const NAME: Record<Who, string> = {seth: 'Seth ji', kaka: 'Kaka', raju: 'Raju', vo: ''};
const NAME_COL: Record<Who, string> = {seth: '#F2A93B', kaka: '#C7A27C', raju: '#2DD4BF', vo: '#fff'};
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / VIDEO.fps;
  const l = LINES.find((x) => x.who !== 'vo' && t >= x.start - 0.05 && t < x.start + x.dur + 0.25);
  if (!l) return null;
  const lf = f - fr(l.start - 0.05);
  const p = prog(lf, 0, 6);
  const bottom = l.section === 'laptop' ? 250 : 330;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
      <div style={{padding: '6px 16px', borderRadius: 10, background: '#1C1530', color: NAME_COL[l.who], fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 1, marginBottom: -8, zIndex: 1, textTransform: 'uppercase'}}>{NAME[l.who]}</div>
      <div style={{padding: '22px 32px 20px', borderRadius: 22, background: 'rgba(109,40,217,0.92)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.25, textAlign: 'center', maxWidth: 940, boxShadow: '0 12px 30px rgba(40,10,90,0.35)', border: '2px solid rgba(255,255,255,0.18)'}}>{l.text}</div>
    </div>
  );
};

export const Film: React.FC = () => {
  React.useState(() => loadFonts());
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SECTION_IDS.map((id) => {
        const S = SCENE_COMP[id];
        return (
          <Sequence key={id} from={SCENES[id].from} durationInFrames={SCENES[id].dur}>
            <S />
          </Sequence>
        );
      })}
      <Captions />
      <Audio src={staticFile(AUDIO.voiceover)} />
      {AUDIO.music && <Audio src={staticFile(AUDIO.music)} volume={(fr0) => AUDIO.musicVolume * interpolate(fr0, [0, 15, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />}
      <SfxTrack />
    </AbsoluteFill>
  );
};

export {range};
