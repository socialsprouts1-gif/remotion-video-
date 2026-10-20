import React from 'react';
import {CUST_YES, KEYWORDS, KNOWLEDGE, MSG_IN, REPLY} from '../config';
import {B} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, pt, rand, win} from '../lib/anim';
import {dof, kf, Key, place, Pose} from '../lib/pose';
import {Icon} from './Icons';

/*
 * Everything here lives in one CSS-3D space. Rules that keep it 3D in Chrome:
 * transforms only on containers (preserve-3d); opacity and filters only on leaves.
 */
const P3: React.CSSProperties = {position: 'absolute', left: 540, top: 960, transformStyle: 'preserve-3d', fontFamily: FONT};

// ------------------------------------------------------------------ camera
const CAM: Key[] = [
  [0, {rx: 0, ry: 0, z: 0}],
  [6.2, {rx: 0, ry: 0, z: 0}],
  [7.6, {rx: 5, ry: -14, z: 60}],
  [10.8, {rx: 4, ry: -8, z: 60}],
  [11.8, {rx: 0, ry: 0, z: -80}],
  [15.6, {rx: 0, ry: 3, z: -40}],
  [16.6, {rx: 0, ry: 8, z: 0}],
  [20.0, {rx: 0, ry: 6, z: 0}],
  [21.0, {rx: 2, ry: -10, z: 0}],
  [25.0, {rx: 2, ry: -8, z: 0}],
  [26.2, {rx: 16, ry: 0, z: 40}],
  [30.0, {rx: 14, ry: 0, z: 40}],
  [31.0, {rx: 0, ry: 0, z: -200}],
  [34.3, {rx: 0, ry: 0, z: -120}],
];

export const Stage: React.FC<{t: number}> = ({t}) => {
  const cam = kf(CAM, t);
  const drift = Math.sin(t * 0.33) * 2.2;
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1700, perspectiveOrigin: '540px 960px'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transformOrigin: '540px 960px',
          transform: `translateZ(${cam.z}px) rotateX(${cam.rx}deg) rotateY(${cam.ry + drift}deg)`,
        }}
      >
        <Dust t={t} />
        <SlabA t={t} />
        <Carousel t={t} />
        <Reply t={t} />
        <CustYes t={t} />
        <LeadCard t={t} />
        <Calendar t={t} />
        <Sphere t={t} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ atmosphere
const DUST = Array.from({length: 70}, (_, i) => ({x: (rand(i * 2.1) - 0.5) * 1700, y: (rand(i * 3.7) - 0.5) * 2600, z: (rand(i * 5.3) - 0.5) * 1800, r: 1.5 + rand(i * 7.1) * 3}));
const Dust: React.FC<{t: number}> = ({t}) => (
  <>
    {DUST.map((d, i) => {
      const y = d.y - t * (8 + d.r * 3);
      return (
        <div key={i} style={{...P3, transform: `translate3d(${d.x}px, ${y}px, ${d.z}px)`}}>
          <div
            style={{
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: 99,
              background: i % 7 === 0 ? C.lime : C.metal,
              opacity: 0.25 * pt(t, 0.2, 2),
              filter: `blur(${dof(d.z) * 0.6}px)`,
            }}
          />
        </div>
      );
    })}
  </>
);

// ------------------------------------------------------------------ glass
type GlassProps = {w: number; h?: number; o: number; glow?: number; sheen?: number; radius?: number; blur?: number; children?: React.ReactNode; tone?: 'in' | 'out'};

/** A glass slab face: dark translucent fill, hairline rim, a specular band driven by the object's rotation. */
const Glass: React.FC<GlassProps> = ({w, h, o, glow = 0, sheen = 0, radius = 40, blur = 0, children, tone = 'in'}) => (
  <div
    style={{
      position: 'relative',
      width: w,
      height: h,
      borderRadius: radius,
      opacity: o,
      filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
      background: tone === 'out' ? `linear-gradient(150deg, rgba(${C.limeRGB},0.16), rgba(14,20,12,0.9) 60%)` : 'linear-gradient(150deg, rgba(255,255,255,0.13), rgba(14,17,15,0.9) 55%)',
      border: `1.5px solid ${glow > 0 ? `rgba(${C.limeRGB},${0.25 + 0.6 * glow})` : 'rgba(255,255,255,0.18)'}`,
      boxShadow: `0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.18)${glow > 0 ? `, 0 0 ${70 * glow}px rgba(${C.limeRGB},${0.3 * glow})` : ''}`,
      overflow: 'hidden',
      fontFamily: FONT,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: '-40%',
        background: 'linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.16) 49%, rgba(255,255,255,0.04) 53%, transparent 58%)',
        transform: `translateX(${sheen * 60}%)`,
        pointerEvents: 'none',
      }}
    />
    {children}
  </div>
);

// ------------------------------------------------------------------ A · the customer's message (the hero object)
const A_KEYS: Key[] = [
  [B.slabIn[0], {x: 60, y: 260, z: -2400, rx: 58, ry: -46, rz: 8, s: 1, o: 0}],
  [B.slabIn[1], {x: 0, y: -60, z: 0, rx: 8, ry: -12, rz: 0, o: 1}],
  [6.2, {x: 0, y: -150, z: 40, rx: 3, ry: -5}],
  [7.2, {x: 70, y: -90, z: 60, rx: 12, ry: 18, s: 1.0}],
  [10.2, {x: 60, y: -100, z: 60, rx: 9, ry: 12, s: 1.0}],
  [11.6, {x: -130, y: -660, z: -320, rx: 0, ry: 12, s: 0.62}],
  [15.6, {x: -130, y: -660, z: -320}],
  [16.4, {x: -110, y: -470, z: 0, rx: 0, ry: 4, s: 0.88}],
  [20.0, {x: -110, y: -470, z: 0}],
  [20.9, {x: -150, y: -800, z: -520, ry: 16, s: 0.66}],
  [25.0, {x: -150, y: -800, z: -520, o: 1}],
  [25.6, {x: -150, y: -960, z: -900, o: 0}],
];

const SlabA: React.FC<{t: number}> = ({t}) => {
  if (t > 25.7) return null;
  const p = kf(A_KEYS, t, t < B.slabIn[1] ? ease.out : ease.inOut);
  const ex = pt(t, B.explode[0], B.explode[1], ease.out) * (1 - pt(t, B.regroup[0], B.regroup[1], ease.inOut));
  const chips = pt(t, B.chips[0], B.chips[1]) * (1 - pt(t, B.regroup[0], B.regroup[0] + 0.4));
  const blur = dof(p.z) + (t < B.slabIn[0] + 1.2 ? (1 - pt(t, B.slabIn[0], B.slabIn[0] + 1.2)) * 10 : 0);
  return (
    <div style={{...P3, transform: place(p)}}>
      <Glass w={780} h={250} o={p.o * (1 - ex * 0.55)} sheen={(p.ry + 20) / 40} blur={blur} glow={ex * 0.4}>
        <div style={{position: 'absolute', left: 36, top: 26, display: 'flex', alignItems: 'center', gap: 12, fontSize: 21, color: C.grey, fontWeight: 600, letterSpacing: '0.14em'}}>
          <span style={{width: 10, height: 10, borderRadius: 10, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
          NEW MESSAGE · WHATSAPP
        </div>
        <div style={{position: 'absolute', right: 36, top: 26, fontSize: 19, color: C.grey}}>now</div>
      </Glass>
      {/* words: flat inside the glass, then exploded through depth */}
      <div style={{position: 'absolute', left: 36, top: 92, width: 720, transformStyle: 'preserve-3d', display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 0}}>
        {MSG_IN.map((w, i) => {
          const key = KEYWORDS.includes(i);
          const z = ex * (key ? 190 : -90 - (i % 3) * 40);
          const lift = ex * (key ? -18 : 0);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translate3d(0, ${lift}px, ${z}px)`,
                fontSize: 50,
                fontWeight: 600,
                lineHeight: 1.3,
                color: key && ex > 0.05 ? C.lime : C.white,
                opacity: p.o * (key ? 1 : 1 - ex * 0.6),
                filter: `blur(${blur + (key ? 0 : ex * 4)}px)`,
                textShadow: key ? `0 0 ${30 * ex}px rgba(${C.limeRGB},0.6)` : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {/* what it understood */}
      {chips > 0 && (
        <>
          <Chip x={-40} y={-90} z={190} o={chips} label="INTENT" value="Pricing" />
          <Chip x={200} y={300} z={190} o={pt(t, B.chips[0] + 0.25, B.chips[1] + 0.25) * (1 - pt(t, B.regroup[0], B.regroup[0] + 0.4))} label="PRODUCT" value="Premium package" />
        </>
      )}
    </div>
  );
};

const Chip: React.FC<{x: number; y: number; z: number; o: number; label: string; value: string}> = ({x, y, z, o, label, value}) => (
  <div style={{position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d', transform: `translate3d(0, ${(1 - o) * 20}px, ${z}px)`}}>
    <div
      style={{
        opacity: o,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 24px',
        borderRadius: 999,
        background: 'rgba(8,11,9,0.92)',
        border: `1.5px solid rgba(${C.limeRGB},0.7)`,
        boxShadow: `0 0 40px rgba(${C.limeRGB},0.3), 0 20px 50px rgba(0,0,0,0.6)`,
        fontFamily: FONT,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{fontSize: 19, fontWeight: 700, letterSpacing: '0.18em', color: C.lime}}>{label}</span>
      <span style={{width: 1, height: 22, background: 'rgba(255,255,255,0.25)'}} />
      <span style={{fontSize: 26, fontWeight: 600, color: C.white}}>{value}</span>
    </div>
  </div>
);

// ------------------------------------------------------------------ 02 · recall: the business-knowledge carousel
const Carousel: React.FC<{t: number}> = ({t}) => {
  if (t < B.carouselIn[0] - 0.1 || t > B.collapse[1] + 0.1) return null;
  const inP = pt(t, B.carouselIn[0], B.carouselIn[1]);
  // decelerating spin (several turns), landing card 0 in front
  const spin = pt(t, B.spin[0], B.spin[1], ease.out);
  const angle = lerp(-420, 0, spin);
  const focus = pt(t, B.focus[0], B.focus[1], ease.inOut);
  const col = pt(t, B.collapse[0], B.collapse[1], ease.in);
  const R = 560 * (1 - col * 0.9);
  const prem = pt(t, B.premium, B.premium + 0.4);
  return (
    <div style={{...P3, transform: `translate3d(0, 120px, ${-560 + inP * 0}px) rotateX(-6deg) rotateY(${angle}deg)`}}>
      {KNOWLEDGE.map((name, i) => {
        const a = i * 60;
        const front = i === 0;
        const pull = front ? focus * 380 : 0;
        const o = inP * (1 - col) * (front ? 1 : 1 - focus * 0.75);
        const world = (((a + angle) % 360) + 360) % 360; // 0 = facing camera
        const facing = Math.cos((world * Math.PI) / 180);
        return (
          <div key={name} style={{...P3, left: 0, top: 0, transform: `rotateY(${a}deg) translateZ(${R + pull}px) scale(${front ? 1 + focus * 0.12 : 1}) translate(-50%, -50%)`}}>
            <Glass w={440} h={600} o={o * (0.35 + 0.65 * Math.max(0, facing))} glow={front ? focus : 0} sheen={facing * 1.2 - 0.4} blur={front ? 0 : focus * 4 + (1 - Math.max(0, facing)) * 3}>
              <div style={{position: 'absolute', left: 34, top: 34, right: 34}}>
                <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', color: C.lime}}>KNOWLEDGE</div>
                <div style={{fontSize: 44, fontWeight: 700, color: C.white, marginTop: 6}}>{name}</div>
                <div style={{height: 1, background: 'rgba(255,255,255,0.12)', margin: '24px 0'}} />
                {front ? (
                  ['Starter', 'Growth', 'Premium'].map((row, k) => {
                    const hot = row === 'Premium';
                    return (
                      <div
                        key={row}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '18px 22px',
                          marginBottom: 14,
                          borderRadius: 22,
                          background: hot ? `rgba(${C.limeRGB},${0.06 + 0.14 * prem})` : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${hot ? `rgba(${C.limeRGB},${0.2 + 0.7 * prem})` : 'rgba(255,255,255,0.07)'}`,
                          boxShadow: hot ? `0 0 ${40 * prem}px rgba(${C.limeRGB},0.3)` : undefined,
                          transform: hot ? `scale(${1 + prem * 0.04})` : undefined,
                        }}
                      >
                        <span style={{fontSize: 30, fontWeight: 600, color: hot ? C.white : C.metal}}>{row}</span>
                        <span style={{fontSize: 19, color: hot ? C.lime : C.grey, fontWeight: 600, letterSpacing: '0.1em'}}>{hot ? 'MATCH' : 'PLAN'}</span>
                      </div>
                    );
                  })
                ) : (
                  [0, 1, 2, 3].map((k) => <div key={k} style={{height: 18, width: `${88 - k * 14}%`, borderRadius: 9, background: 'rgba(255,255,255,0.08)', marginBottom: 22}} />)
                )}
              </div>
            </Glass>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ 03 · the reply, assembled from light
const B_KEYS: Key[] = [
  [B.replyIn[0], {x: 120, y: 140, z: -500, rx: 0, ry: -14, s: 0.9, o: 0}],
  [B.replyIn[1], {x: 70, y: 60, z: 0, rx: 0, ry: -4, s: 1, o: 1}],
  [20.0, {x: 70, y: 60, z: 0}],
  [20.9, {x: 110, y: -520, z: -480, ry: 14, s: 0.7}],
  [25.0, {x: 110, y: -520, z: -480, o: 1}],
  [25.6, {x: 110, y: -700, z: -900, o: 0}],
];
const CHARS = REPLY.map((line, li) => line.split('').map((ch, ci) => ({ch, li, ci, seed: li * 100 + ci})));

const Reply: React.FC<{t: number}> = ({t}) => {
  if (t < B.replyIn[0] || t > 25.7) return null;
  const p = kf(B_KEYS, t);
  const total = CHARS.flat().length;
  let n = 0;
  const sent = pt(t, B.sent, B.sent + 0.5);
  const blur = dof(p.z);
  return (
    <div style={{...P3, transform: place(p)}}>
      <Glass w={840} h={300} o={p.o} tone="out" glow={0.35 + sent * 0.4} sheen={(p.ry + 20) / 40} blur={blur}>
        <div style={{position: 'absolute', left: 36, top: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, color: C.lime, fontWeight: 700, letterSpacing: '0.16em'}}>AI REPLY</div>
        <div style={{position: 'absolute', right: 34, bottom: 22, fontSize: 20, color: C.lime, opacity: sent, fontWeight: 600}}>Delivered ✓✓</div>
      </Glass>
      <div style={{position: 'absolute', left: 36, top: 74, width: 780, transformStyle: 'preserve-3d'}}>
        {CHARS.map((line, li) => (
          <div key={li} style={{whiteSpace: 'pre', transformStyle: 'preserve-3d', height: 54}}>
            {line.map((c) => {
              const i = n++;
              const st = B.chars[0] + (i / total) * (B.chars[1] - B.chars[0] - 0.4);
              const q = pt(t, st, st + 0.45, ease.out);
              const sx = (rand(c.seed * 1.3) - 0.5) * 900;
              const sy = (rand(c.seed * 2.9) - 0.5) * 700;
              const sz = -600 - rand(c.seed * 4.1) * 900;
              return (
                <span
                  key={c.ci}
                  style={{
                    display: 'inline-block',
                    transform: `translate3d(${(1 - q) * sx}px, ${(1 - q) * sy}px, ${(1 - q) * sz}px) rotateX(${(1 - q) * 120}deg)`,
                    fontSize: 36,
                    fontWeight: li === 2 ? 600 : 500,
                    color: li === 2 ? C.lime : C.white,
                    opacity: q * p.o,
                    filter: `blur(${(1 - q) * 8 + blur}px)`,
                  }}
                >
                  {c.ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ 04 · qualify
const C_KEYS: Key[] = [
  [B.custReply, {x: -260, y: 0, z: -900, rx: 0, ry: 30, s: 0.72, o: 0}],
  [B.custReply + 0.7, {x: -110, y: -250, z: -440, ry: 10, o: 1}],
  [25.0, {x: -110, y: -250, z: -440, o: 1}],
  [25.6, {x: -110, y: -380, z: -900, o: 0}],
];
const CustYes: React.FC<{t: number}> = ({t}) => {
  if (t < B.custReply || t > 25.7) return null;
  const p = kf(C_KEYS, t);
  return (
    <div style={{...P3, transform: place(p)}}>
      <Glass w={720} h={150} o={p.o} sheen={(p.ry + 20) / 40} blur={dof(p.z) * 0.6}>
        <div style={{position: 'absolute', left: 36, top: 20, fontSize: 18, color: C.grey, fontWeight: 600, letterSpacing: '0.14em'}}>CUSTOMER</div>
        <div style={{position: 'absolute', left: 36, top: 56, fontSize: 40, fontWeight: 600, color: C.white}}>{CUST_YES}</div>
      </Glass>
    </div>
  );
};

const D_KEYS: Key[] = [
  [B.flip[0], {x: 0, y: 380, z: -300, rx: 8, ry: -180, s: 0.9, o: 1}],
  [B.flip[1], {x: 0, y: 330, z: 60, rx: 4, ry: 0, s: 1}],
  [25.0, {x: 0, y: 330, z: 60, rx: 2, ry: -4}],
  [25.9, {x: 0, y: -560, z: -1100, rx: 0, ry: 0, s: 0.5, o: 0}],
];
const TAGS = ['Interested', 'Wants a call', 'High intent'];
const LeadCard: React.FC<{t: number}> = ({t}) => {
  if (t < B.flip[0] || t > 26) return null;
  const p = kf(D_KEYS, t, ease.inOut);
  const ring = pt(t, B.ring[0], B.ring[1], ease.inOut);
  const C2 = 2 * Math.PI * 70;
  const front = Math.cos((p.ry * Math.PI) / 180) > 0;
  return (
    <div style={{...P3, transform: place(p)}}>
      <Glass w={820} h={560} o={p.o} glow={0.3 + ring * 0.6} sheen={(p.ry + 30) / 60} blur={dof(p.z) * 0.5}>
        {front && (
          <div style={{position: 'absolute', inset: 40}}>
            <div style={{fontSize: 19, fontWeight: 700, letterSpacing: '0.22em', color: C.lime}}>LEAD PROFILE</div>
            <div style={{fontSize: 46, fontWeight: 700, color: C.white, marginTop: 10}}>New customer</div>
            <div style={{fontSize: 26, color: C.grey, marginTop: 2}}>Interested in · Premium package</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 34, width: 500}}>
              {TAGS.map((tag, i) => {
                const q = pt(t, B.tags[i], B.tags[i] + 0.35, ease.out);
                const hot = i === 2;
                return (
                  <span
                    key={tag}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 999,
                      fontSize: 26,
                      fontWeight: 600,
                      color: hot ? '#050605' : C.white,
                      background: hot ? C.lime : 'rgba(255,255,255,0.07)',
                      border: hot ? 'none' : '1.5px solid rgba(255,255,255,0.16)',
                      boxShadow: hot ? `0 0 30px rgba(${C.limeRGB},0.5)` : undefined,
                      opacity: q,
                      transform: `scale(${lerp(0.6, 1, q)}) translateY(${(1 - q) * 14}px)`,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            <svg width={200} height={200} style={{position: 'absolute', right: 0, top: 120}}>
              <circle cx={100} cy={100} r={70} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} />
              <circle cx={100} cy={100} r={70} fill="none" stroke={C.lime} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${C2 * ring} ${C2}`} transform="rotate(-90 100 100)" style={{filter: `drop-shadow(0 0 10px ${C.lime})`}} />
              <text x={100} y={96} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.white} textAnchor="middle" dominantBaseline="middle" opacity={ring}>
                READY
              </text>
              <text x={100} y={130} fontFamily={FONT} fontWeight={600} fontSize={15} letterSpacing="0.2em" fill={C.grey} textAnchor="middle" opacity={ring}>
                TO BUY
              </text>
            </svg>
          </div>
        )}
      </Glass>
    </div>
  );
};

// ------------------------------------------------------------------ 05 · book: a calendar floor, a lifted tile, a chosen time
const DAYS = 35;
const TOMORROW = 17;
const TIMES = ['5:30 PM', '6:30 PM', '7:30 PM'];
const Calendar: React.FC<{t: number}> = ({t}) => {
  if (t < B.calIn[0] || t > 31.1) return null;
  const inP = pt(t, B.calIn[0], B.calIn[1], ease.out);
  const out = pt(t, B.shrink[0], B.shrink[1], ease.in);
  const lift = pt(t, B.tileLift, B.tileLift + 0.5, ease.out);
  const sel = pt(t, B.select, B.select + 0.35, ease.out);
  const conf = pt(t, B.confirm, B.confirm + 0.5, ease.out);
  const rem = pt(t, B.reminder, B.reminder + 0.4, ease.out);
  const S = 1 - out * 0.85;
  return (
    <>
      {/* floor */}
      <div style={{...P3, transform: `translate3d(0, ${lerp(340, 220, inP)}px, ${-out * 900}px) rotateX(64deg) scale(${S}) translate(-50%, -50%)`}}>
        <div style={{position: 'relative', width: 7 * 128, height: 5 * 128, transformStyle: 'preserve-3d'}}>
          {Array.from({length: DAYS}).map((_, i) => {
            const r = Math.floor(i / 7);
            const c = i % 7;
            const q = pt(t, B.calIn[0] + (r + c) * 0.04, B.calIn[0] + 0.5 + (r + c) * 0.04, ease.out);
            const tm = i === TOMORROW;
            return (
              <div key={i} style={{position: 'absolute', left: c * 128, top: r * 128, transformStyle: 'preserve-3d', transform: `translateZ(${tm ? lift * 110 : (1 - q) * -200}px)`}}>
                <div
                  style={{
                    width: 114,
                    height: 114,
                    borderRadius: 22,
                    opacity: q * (1 - out),
                    background: tm ? `rgba(${C.limeRGB},${0.08 + 0.2 * lift})` : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${tm ? `rgba(${C.limeRGB},${0.3 + 0.7 * lift})` : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: tm ? `0 0 ${60 * lift}px rgba(${C.limeRGB},0.45)` : undefined,
                    fontFamily: FONT,
                    fontSize: 30,
                    fontWeight: 600,
                    color: tm ? C.white : C.grey2,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {((i + 3) % 31) + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* upright time chips over the lifted day */}
      <div style={{...P3, transform: `translate3d(0, ${-60 - out * 100}px, ${120 - out * 900}px) scale(${S}) translate(-50%, -50%)`}}>
        <div style={{display: 'flex', gap: 22, fontFamily: FONT}}>
          {TIMES.map((tm, i) => {
            const q = pt(t, B.times + i * 0.14, B.times + 0.4 + i * 0.14, ease.out);
            const chosen = i === 1;
            return (
              <div
                key={tm}
                style={{
                  padding: '20px 30px',
                  borderRadius: 26,
                  fontSize: 34,
                  fontWeight: 700,
                  opacity: q * (chosen ? 1 : 1 - sel * 0.6) * (1 - out),
                  transform: `translateY(${(1 - q) * 30}px) scale(${chosen ? 1 + sel * 0.12 : 1 - sel * 0.06})`,
                  color: chosen && sel > 0.5 ? '#050605' : C.white,
                  background: chosen ? `rgba(${C.limeRGB},${sel})` : 'rgba(14,17,15,0.9)',
                  border: `1.5px solid ${chosen ? C.lime : 'rgba(255,255,255,0.18)'}`,
                  boxShadow: chosen ? `0 0 ${50 * sel}px rgba(${C.limeRGB},0.55)` : '0 20px 40px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tm}
              </div>
            );
          })}
        </div>
      </div>
      {/* confirmation */}
      <div style={{...P3, transform: `translate3d(0, ${-340 - out * 50}px, ${(1 - conf) * -300 + 160 - out * 900}px) rotateX(${(1 - conf) * -40}deg) scale(${S}) translate(-50%, -50%)`}}>
        <Glass w={760} h={170} o={conf * (1 - out)} tone="out" glow={0.8}>
          <div style={{position: 'absolute', left: 30, top: 34, width: 100, height: 100, borderRadius: 100, background: C.lime, display: 'grid', placeItems: 'center'}}>
            <Icon name="check" size={56} color="#050605" stroke={3} />
          </div>
          <div style={{position: 'absolute', left: 160, top: 34}}>
            <div style={{fontSize: 44, fontWeight: 700, color: C.white}}>Call booked</div>
            <div style={{fontSize: 30, fontWeight: 600, color: C.lime}}>Tomorrow · 6:30 PM</div>
          </div>
        </Glass>
      </div>
      <div style={{...P3, transform: `translate3d(${(1 - rem) * 120}px, ${-190 - out * 50}px, ${160 - out * 900}px) scale(${S}) translate(-50%, -50%)`}}>
        <div style={{opacity: rem * (1 - out), display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: 'rgba(10,13,11,0.92)', border: '1.5px solid rgba(255,255,255,0.18)', fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.metal, whiteSpace: 'nowrap'}}>
          <Icon name="bell" size={26} color={C.lime} />
          Reminder scheduled
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ scale: a sphere of conversations
const N = 220;
const SPH = Array.from({length: N}, (_, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = i * 2.399963;
  return {x: Math.cos(th) * r, y, z: Math.sin(th) * r, seed: i};
});
const Sphere: React.FC<{t: number}> = ({t}) => {
  if (t < B.sphere[0] - 0.1 || t > B.implode[1] + 0.2) return null;
  const inP = pt(t, B.sphere[0], B.sphere[0] + 1.2, ease.out);
  const imp = pt(t, B.implode[0], B.implode[1], ease.in);
  const R = 640 * lerp(0.4, 1, inP) * (1 - imp);
  const rot = (t - B.sphere[0]) * 22 + imp * 220;
  const wave = (t - B.sphere[0] - 0.8) / 2.6; // lime wave sweeping top → bottom
  const hero = pt(t, B.sphere[0] + 0.1, B.sphere[0] + 0.6);
  return (
    <div style={{...P3, transform: `translate3d(0, -120px, 0) rotateX(-14deg) rotateY(${rot}deg)`}}>
      {SPH.map((s, i) => {
        const lit = Math.max(0, Math.min(1, (wave * 2.2 - (1 - s.y)) * 3));
        const q = pt(t, B.sphere[0] + rand(i) * 0.9, B.sphere[0] + 0.5 + rand(i) * 0.9);
        const ry = (Math.atan2(s.x, s.z) * 180) / Math.PI;
        const rx = (-Math.asin(s.y) * 180) / Math.PI;
        return (
          <div key={i} style={{...P3, left: 0, top: 0, transform: `translate3d(${s.x * R}px, ${s.y * R}px, ${s.z * R}px) rotateY(${ry}deg) rotateX(${rx}deg) translate(-50%, -50%)`}}>
            <div
              style={{
                width: 70,
                height: 44,
                borderRadius: 12,
                opacity: q * (1 - imp * 0.3),
                background: lit > 0 ? `rgba(${C.limeRGB},${0.08 + 0.22 * lit})` : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${lit > 0 ? `rgba(${C.limeRGB},${0.3 + 0.6 * lit})` : 'rgba(255,255,255,0.14)'}`,
                boxShadow: lit > 0.5 ? `0 0 18px rgba(${C.limeRGB},0.45)` : undefined,
                padding: '10px 10px',
              }}
            >
              <div style={{height: 6, width: '80%', borderRadius: 3, background: lit > 0 ? `rgba(${C.limeRGB},0.7)` : 'rgba(255,255,255,0.18)'}} />
              <div style={{height: 6, width: '50%', borderRadius: 3, marginTop: 6, background: 'rgba(255,255,255,0.12)'}} />
            </div>
          </div>
        );
      })}
      {/* our conversation, now one of many */}
      <div style={{...P3, left: 0, top: 0, transform: `rotateY(${-rot}deg) translate3d(0, 0, ${R + 40}px) translate(-50%, -50%)`}}>
        <div style={{width: 110, height: 70, borderRadius: 16, opacity: hero * (1 - imp), background: C.lime, boxShadow: `0 0 50px rgba(${C.limeRGB},0.8)`}} />
      </div>
    </div>
  );
};
