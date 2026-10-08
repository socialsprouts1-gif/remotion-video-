import React from 'react';
import {B} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, lerpV, pt, qbez, rand, V, win} from '../lib/anim';
import {
  AVATAR,
  BIZ,
  Cam,
  CARD,
  COMP,
  CUST,
  LANE_IN_X,
  LANE_OUT_X,
  LANES,
  laneY,
  leadPos,
  REVENUE,
  satPos,
  SATELLITES,
  STAGES,
  stagePos,
  STAMP,
} from '../world';
import {frozen} from './Field';
import {Dot, Label, Link, Trail} from './prims';

type P = {t: number; cam: Cam};

// ================================================================== 1 · the lead + ad spend
const RUPEE_OFF: V = {x: -150, y: 120};
const rupeePos = (t: number): V => {
  const lp = leadPos(t - 0.25);
  const base = {x: lp.x + RUPEE_OFF.x, y: lp.y + RUPEE_OFF.y};
  return lerpV(base, leadPos(t), pt(t, B.rupeeAbsorb[0], B.rupeeAbsorb[1], ease.inOut));
};

export const Lead: React.FC<P> = ({t, cam}) => {
  if (t < B.leadAppear - 0.1 || t > 10.8) return null;
  const appear = pt(t, B.leadAppear, B.leadAppear + 0.6);
  const lp = leadPos(t);
  const moving = pt(t, B.leadTravel[0], B.leadTravel[0] + 0.4) * (1 - pt(t, B.leadTravel[1] - 0.5, B.leadTravel[1]));
  const arrive = pt(t, B.leadTravel[1] - 0.15, B.leadTravel[1] + 0.45);
  const ring = ((t - B.leadAppear) % 1.4) / 1.4;
  const flash = pt(t, B.leadAppear, B.leadAppear + 1.1);

  // ₹ AD SPEND tether
  const rp = rupeePos(t);
  const rIn = pt(t, B.rupeeAppear, B.rupeeAppear + 0.5);
  const rOut = 1 - pt(t, B.rupeeAbsorb[0] + 0.3, B.rupeeAbsorb[1]);
  const rO = rIn * rOut;
  const tether = pt(t, B.rupeeAppear + 0.35, B.rupeeAppear + 0.85, ease.inOut);

  return (
    <g>
      {/* first-light ring */}
      {flash > 0 && flash < 1 && <circle cx={lp.x} cy={lp.y} r={10 + flash * 160} fill="none" stroke={`rgba(${C.limeRGB},${0.6 * (1 - flash)})`} strokeWidth={2 / cam.z} />}
      {moving > 0 && <Trail at={(dt) => leadPos(t - dt)} len={0.45} w={9} o={moving} />}
      {arrive < 1 && (
        <>
          {ring > 0 && appear > 0.9 && arrive === 0 && (
            <circle cx={lp.x} cy={lp.y} r={14 + ring * 70} fill="none" stroke={`rgba(${C.limeRGB},${0.45 * (1 - ring)})`} strokeWidth={1.6 / cam.z} />
          )}
          <Dot p={lp} r={lerp(0, 11, appear) * (1 + 0.08 * Math.sin(t * 6))} tone="lime" halo={1.5 * (1 - arrive)} o={1 - arrive * 0.2} />
        </>
      )}

      {rO > 0 && (
        <g opacity={rO}>
          <Link a={rp} b={lp} tone="white" o={0.55} w={1.6} draw={tether} />
          <circle cx={rp.x} cy={rp.y} r={34 * (0.6 + 0.4 * rIn)} fill="rgba(8,10,9,0.92)" stroke={C.metal} strokeWidth={2} />
          <circle cx={rp.x} cy={rp.y} r={110} fill="url(#gWhite)" opacity={0.35} />
          <text x={rp.x} y={rp.y + 2} fontFamily={FONT} fontWeight={700} fontSize={38} fill={C.white} textAnchor="middle" dominantBaseline="middle">
            ₹
          </text>
          <Label p={{x: rp.x, y: rp.y + 62}} text="AD SPEND" z={cam.z} size={20} color={C.metal} o={pt(t, B.rupeeAppear + 0.3, B.rupeeAppear + 0.8)} />
        </g>
      )}
    </g>
  );
};

// ================================================================== 2 · business node + inbox
/** The business node exists from scene 2 until it becomes the AI core. */
export const Business: React.FC<P> = ({t, cam}) => {
  if (t < B.bizAppear || t > B.aiBloom + 0.6) return null;
  const ft = frozen(t);
  const inP = pt(t, B.bizAppear, B.bizAppear + 0.7);
  const dim = pt(t, B.bizDim[0], B.bizDim[1]) * (1 - pt(t, 21.6, 22.6));
  const chaos = pt(t, B.chaos[0], B.chaos[0] + 1.2);
  const flick = chaos > 0 ? 0.7 + 0.3 * Math.sin(ft * 31) * Math.sin(ft * 7.3) : 1;
  const toAi = 1 - pt(t, B.aiBloom, B.aiBloom + 0.5);
  const m = Math.max(1, 0.55 / cam.z); // keep it readable when the camera is far away
  const unread = t >= B.message && t < 16.4 ? 1 : 0;
  const pulse = pt(t, B.message, B.message + 0.9);

  return (
    <g opacity={inP * toAi}>
      <Dot p={BIZ} r={16 * m} tone={dim > 0.5 ? 'grey' : 'white'} o={lerp(1, 0.45, dim) * flick} halo={lerp(1.2, 0.3, dim)} />
      <circle cx={BIZ.x} cy={BIZ.y} r={30 * m} fill="none" stroke={`rgba(${C.whiteRGB},${lerp(0.35, 0.1, dim)})`} strokeWidth={1.5 / cam.z} />
      {pulse > 0 && pulse < 1 && <circle cx={BIZ.x} cy={BIZ.y} r={30 + pulse * 120} fill="none" stroke={`rgba(${C.whiteRGB},${0.6 * (1 - pulse)})`} strokeWidth={2 / cam.z} />}
      {unread > 0 && (
        <g>
          <circle cx={BIZ.x + 24} cy={BIZ.y - 24} r={15} fill={C.white} opacity={0.9 + 0.1 * Math.sin(t * 4)} />
          <text x={BIZ.x + 24} y={BIZ.y - 23} fontFamily={FONT} fontWeight={700} fontSize={18} fill="#000" textAnchor="middle" dominantBaseline="middle">
            1
          </text>
        </g>
      )}
      <Label p={{x: BIZ.x, y: BIZ.y + 46 * m}} text="YOUR BUSINESS" z={cam.z} size={19} color={dim > 0.5 ? C.grey2 : C.grey} o={inP} />
    </g>
  );
};

const MSG = ['Hi, मुझे आपकी service', 'के बारे में जानना है.'];

export const Inbox: React.FC<P> = ({t, cam}) => {
  if (t < B.cardOpen[0] || t > 10.8) return null;
  const open = pt(t, B.cardOpen[0], B.cardOpen[1]);
  const out = 1 - pt(t, 10.4, 10.72, ease.in);
  const typing = win(t, B.typing[0], B.typing[1], 0.15, 0.1);
  const msg = pt(t, B.message, B.message + 0.45);
  const caret = t > B.message + 0.6 && Math.floor(t * 2.2) % 2 === 0;
  const ava = pt(t, B.leadTravel[1] - 0.1, B.leadTravel[1] + 0.5);
  const notif = pt(t, B.message, B.message + 0.8);
  const x0 = CARD.x - CARD.w / 2;
  const y0 = CARD.y - CARD.h / 2;
  const s = lerp(0.2, 1, open);

  return (
    <g opacity={open * out} transform={`translate(${BIZ.x} ${BIZ.y}) scale(${s}) translate(${-BIZ.x} ${-BIZ.y})`}>
      <Link a={BIZ} b={{x: x0 + 80, y: y0}} tone="white" o={0.25} w={1.5} />
      <rect x={x0} y={y0} width={CARD.w} height={CARD.h} rx={38} fill="rgba(9,12,10,0.9)" stroke="rgba(255,255,255,0.13)" strokeWidth={1.5} />
      <rect x={x0} y={y0} width={CARD.w} height={CARD.h} rx={38} fill="url(#glass)" />
      <line x1={x0} x2={x0 + CARD.w} y1={y0 + 110} y2={y0 + 110} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
      {/* header: the lead lands here and becomes the customer */}
      <g opacity={ava}>
        <circle cx={AVATAR.x} cy={AVATAR.y} r={32} fill="rgba(194,255,61,0.1)" stroke={C.lime} strokeWidth={2.5} />
        <circle cx={AVATAR.x} cy={AVATAR.y - 7} r={9} fill={C.lime} />
        <path d={`M ${AVATAR.x - 16} ${AVATAR.y + 17} Q ${AVATAR.x} ${AVATAR.y - 4} ${AVATAR.x + 16} ${AVATAR.y + 17}`} stroke={C.lime} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>
      {notif > 0 && notif < 1 && <circle cx={AVATAR.x} cy={AVATAR.y} r={32 + notif * 70} fill="none" stroke={`rgba(${C.limeRGB},${0.7 * (1 - notif)})`} strokeWidth={2.5} />}
      <text x={AVATAR.x + 56} y={AVATAR.y - 12} fontFamily={FONT} fontWeight={600} fontSize={28} fill={C.white} opacity={ava}>
        New Lead
      </text>
      <circle cx={AVATAR.x + 64} cy={AVATAR.y + 22} r={5} fill={C.lime} opacity={ava} />
      <text x={AVATAR.x + 78} y={AVATAR.y + 23} fontFamily={FONT} fontWeight={500} fontSize={20} fill={C.grey} dominantBaseline="middle" opacity={ava}>
        online
      </text>

      {/* typing indicator */}
      {typing > 0 && (
        <g opacity={typing}>
          <rect x={x0 + 40} y={y0 + 145} width={120} height={58} rx={26} fill="rgba(255,255,255,0.08)" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x0 + 76 + i * 24} cy={y0 + 174 - 6 * Math.max(0, Math.sin(t * 9 - i * 0.9))} r={6} fill={C.grey} />
          ))}
        </g>
      )}

      {/* the message */}
      {msg > 0 && (
        <g opacity={msg} transform={`translate(${(1 - msg) * -20} ${(1 - msg) * 16})`}>
          <path
            d={`M ${x0 + 40} ${y0 + 160} q 0 -26 26 -26 h 552 q 26 0 26 26 v 92 q 0 26 -26 26 h -552 q -18 0 -26 10 z`}
            fill="rgba(255,255,255,0.085)"
            stroke="rgba(255,255,255,0.1)"
          />
          {MSG.map((line, i) => (
            <text key={i} x={x0 + 70} y={y0 + 190 + i * 44} fontFamily={FONT} fontWeight={500} fontSize={30} fill={C.white}>
              {line}
            </text>
          ))}
          <text x={STAMP.x} y={STAMP.y} fontFamily={FONT} fontWeight={500} fontSize={17} fill={C.grey} textAnchor="middle" dominantBaseline="middle">
            10:42 AM
          </text>
        </g>
      )}

      {/* the business side: an empty reply box */}
      <rect x={x0 + 40} y={y0 + CARD.h - 108} width={CARD.w - 80} height={66} rx={33} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.07)" />
      <text x={x0 + 96} y={y0 + CARD.h - 74} fontFamily={FONT} fontWeight={500} fontSize={22} fill={C.grey2} dominantBaseline="middle">
        Type a reply…
      </text>
      {caret && <rect x={x0 + 78} y={y0 + CARD.h - 92} width={3} height={34} fill={C.grey} />}
      <circle cx={x0 + CARD.w - 76} cy={y0 + CARD.h - 75} r={24} fill="rgba(255,255,255,0.06)" />
      <path d={`M ${x0 + CARD.w - 86} ${y0 + CARD.h - 85} l 22 10 l -22 10 z`} fill={C.grey2} />
    </g>
  );
};

// ================================================================== 3–4 · waiting, snapping, leaving
const custPos = (t: number): V => {
  const drift = pt(t, B.weaken[0], B.weaken[1], ease.in);
  const waiting = {x: CUST.x + 170 * drift, y: CUST.y - 30 * drift + Math.sin(t * 1.3) * 6};
  if (t < B.toCompetitor[0]) return waiting;
  const p = pt(t, B.toCompetitor[0], B.toCompetitor[1], ease.inOut);
  const end = {x: COMP.x - 120, y: COMP.y + 80};
  const w0 = {x: CUST.x + 170, y: CUST.y - 30};
  return qbez(w0, {x: 820, y: -820}, end, p);
};

export const Connection: React.FC<P> = ({t, cam}) => {
  if (t < 10.7 || t > 22.8) return null;
  const inO = pt(t, 10.9, 11.6);
  const outO = 1 - pt(t, 21.4, 22.6);
  const cp = custPos(t);
  const s = 1 - 0.88 * pt(t, B.weaken[0], B.weaken[1], ease.in); // connection strength
  const snapped = t >= B.snap;
  const flick = s < 0.45 ? 0.55 + 0.45 * Math.sin(t * 47) * Math.sin(t * 13) : 1;
  const moving = pt(t, B.toCompetitor[0], B.toCompetitor[0] + 0.2) * (1 - pt(t, B.toCompetitor[1] - 0.3, B.toCompetitor[1]));
  const compIn = pt(t, 16.8, 17.5);
  const compLink = pt(t, B.competitorLink, B.competitorLink + 0.5, ease.inOut);
  const mid = lerpV(BIZ, {x: CUST.x + 170, y: CUST.y - 30}, 0.5);
  const sp = pt(t, B.snap, B.snap + 0.9);
  const retract = pt(t, B.snap, B.snap + 0.5, ease.out);
  const m = Math.max(1, 0.55 / cam.z);

  return (
    <g opacity={inO * outO}>
      {!snapped && (
        <>
          <Link a={BIZ} b={cp} tone="lime" o={s * flick} w={lerp(1.2, 3.6, s) / Math.sqrt(cam.z)} dash={s < 0.75 ? `${8 + 60 * s} ${(1 - s) * 46}` : undefined} />
          {/* the customer's unanswered words, crawling and dying on the wire */}
          {[0, 1, 2].map((i) => {
            const f = ((t * lerp(0.05, 0.35, s) + i / 3) % 1);
            const pp = lerpV(cp, BIZ, f);
            return <circle key={i} cx={pp.x} cy={pp.y} r={5} fill={C.lime} opacity={s * Math.sin(f * Math.PI)} />;
          })}
        </>
      )}
      {snapped && retract < 1 && (
        <>
          <Link a={BIZ} b={lerpV(mid, BIZ, retract)} tone="lime" o={0.3 * (1 - retract)} w={1.4} />
          <Link a={lerpV(mid, cp, retract)} b={cp} tone="lime" o={0.3 * (1 - retract)} w={1.4} />
        </>
      )}
      {snapped && sp < 1 &&
        Array.from({length: 18}).map((_, i) => {
          const ang = rand(i * 3.7) * Math.PI * 2;
          const d = (40 + rand(i) * 160) * Math.sqrt(sp);
          return <circle key={i} cx={mid.x + Math.cos(ang) * d} cy={mid.y + Math.sin(ang) * d + sp * sp * 60} r={3 + rand(i * 2) * 3} fill={i % 3 ? C.white : C.lime} opacity={1 - sp} />;
        })}

      {/* competitor */}
      {compIn > 0 && (
        <g opacity={compIn}>
          <Dot p={COMP} r={17 * m} tone="white" halo={1.6} />
          <circle cx={COMP.x} cy={COMP.y} r={34 * m} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5 / cam.z} />
          <Label p={{x: COMP.x, y: COMP.y + 52 * m}} text="COMPETITOR" z={cam.z} size={20} color={C.metal} />
          <Link a={cp} b={COMP} tone="white" o={0.9} w={2.5 / Math.sqrt(cam.z)} draw={compLink} />
          {compLink >= 1 &&
            [0, 1].map((i) => {
              const f = (t * 0.9 + i / 2) % 1;
              const pp = lerpV(cp, COMP, f);
              return <circle key={i} cx={pp.x} cy={pp.y} r={5 / Math.sqrt(cam.z)} fill={C.white} opacity={Math.sin(f * Math.PI)} />;
            })}
        </g>
      )}

      {/* the customer (still the lime lead) */}
      {moving > 0 && <Trail at={(dt) => custPos(t - dt)} len={0.3} w={10} tone="lime" o={moving} />}
      <Dot p={cp} r={14 * m} tone="lime" halo={1.4} />
      <Label p={{x: cp.x, y: cp.y + 44 * m}} text="CUSTOMER" z={cam.z} size={19} color={C.grey} o={1 - pt(t, 16.6, 17)} />
    </g>
  );
};

// ================================================================== 5 · a hundred leads
type Stream = {ts: number; a: V; c: V; conv: boolean; brk: number; drift: number};
const STREAMS: Stream[] = Array.from({length: 100}, (_, i) => {
  const a = {x: BIZ.x + (rand(i * 1.31) - 0.5) * 1900, y: -2850 - rand(i * 2.7) * 250};
  return {
    ts: B.streams[0] + i * 0.048 + rand(i * 9.1) * 0.06,
    a,
    c: {x: lerp(a.x, BIZ.x, 0.4) + (rand(i * 4.4) - 0.5) * 600, y: -1900},
    conv: rand(i * 7.7) > 0.42,
    brk: 0.42 + rand(i * 5.5) * 0.32,
    drift: rand(i * 6.6) - 0.5,
  };
});
const TRAVEL = 1.5;
const streamPos = (s: Stream, t: number) => qbez(s.a, s.c, BIZ, pt(t, s.ts, s.ts + TRAVEL, ease.inOut));

export const Streams: React.FC<P> = ({t, cam}) => {
  if (t < B.streams[0] - 0.2 || t > 28.8) return null;
  const sceneO = 1 - pt(t, 27.2, 28.6);
  const m = 1 / Math.sqrt(cam.z);
  const meterIn = pt(t, 22.4, 23.1);

  // meter: potential vs actual, in arbitrary units (no invented statistics)
  const series = (tt: number) => {
    let pot = 0;
    let act = 0;
    for (const s of STREAMS) {
      if (tt >= s.ts + TRAVEL * (s.conv ? 1 : s.brk)) {
        pot++;
        if (s.conv) act++;
      }
    }
    return {pot, act};
  };
  const MW = 900;
  const MH = 300;
  const gx = (tt: number) => REVENUE.x - MW / 2 + 40 + ((tt - 22.6) / (27.4 - 22.6)) * (MW - 80);
  const gy = (v: number) => REVENUE.y + MH / 2 - 34 - (v / 100) * (MH - 90);
  const samples = Array.from({length: 48}, (_, i) => 22.6 + (Math.min(t, 27.4) - 22.6) * (i / 47));
  const potPath = samples.map((tt, i) => `${i ? 'L' : 'M'} ${gx(tt)} ${gy(series(tt).pot)}`).join(' ');
  const actPath = samples.map((tt, i) => `${i ? 'L' : 'M'} ${gx(tt)} ${gy(series(tt).act)}`).join(' ');

  return (
    <g opacity={sceneO}>
      {STREAMS.map((s, i) => {
        if (t < s.ts || t > s.ts + TRAVEL + 1.4) return null;
        const p = pt(t, s.ts, s.ts + TRAVEL, ease.inOut);
        const broken = !s.conv && p >= s.brk;
        const tb = s.ts + TRAVEL * s.brk; // approx. moment of the break
        const arrived = s.conv && p >= 1;
        if (broken) {
          const k = Math.max(0, t - tb);
          const base = qbez(s.a, s.c, BIZ, s.brk);
          const pos = {x: base.x + s.drift * 160 * k, y: base.y + 70 * k + 420 * k * k};
          const fade = 1 - pt(t, tb, tb + 1.1);
          return (
            <g key={i} opacity={fade}>
              <path d={`M ${s.a.x} ${s.a.y} Q ${s.c.x} ${s.c.y} ${BIZ.x} ${BIZ.y}`} pathLength={1} strokeDasharray={`${s.brk} 1`} stroke="rgba(200,206,202,0.12)" strokeWidth={2 * m} fill="none" />
              <circle cx={pos.x} cy={pos.y} r={7 * m} fill={C.grey} />
              <text x={pos.x + 16 * m} y={pos.y} fontFamily={FONT} fontWeight={700} fontSize={22 * m} fill={C.grey2} dominantBaseline="middle">
                ₹
              </text>
            </g>
          );
        }
        if (arrived) {
          // revenue particle travels down into the meter
          const r = pt(t, s.ts + TRAVEL, s.ts + TRAVEL + 0.7, ease.inOut);
          if (r >= 1) return null;
          const pp = lerpV(BIZ, {x: gx(Math.min(27.4, s.ts + TRAVEL)), y: REVENUE.y - MH / 2 + 10}, r);
          return <Dot key={i} p={pp} r={6 * m} tone="lime" halo={0.9} o={1 - r * 0.6} />;
        }
        const pos = streamPos(s, t);
        return (
          <g key={i}>
            <path d={`M ${s.a.x} ${s.a.y} Q ${s.c.x} ${s.c.y} ${BIZ.x} ${BIZ.y}`} pathLength={1} strokeDasharray={`${p} 1`} stroke={`rgba(${C.limeRGB},0.22)`} strokeWidth={2 * m} fill="none" />
            <Dot p={pos} r={7 * m} tone="lime" halo={0.8} />
          </g>
        );
      })}

      {/* revenue meter */}
      <g opacity={meterIn}>
        <rect x={REVENUE.x - MW / 2} y={REVENUE.y - MH / 2} width={MW} height={MH} rx={34} fill="rgba(9,12,10,0.85)" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        <Label p={{x: REVENUE.x - MW / 2 + 40, y: REVENUE.y - MH / 2 + 34}} text="REVENUE" z={cam.z} size={22} color={C.lime} anchor="start" />
        <Label p={{x: REVENUE.x + MW / 2 - 40, y: REVENUE.y - MH / 2 + 34}} text="POTENTIAL ‒ ‒" z={cam.z} size={17} color={C.grey} anchor="end" spacing={0.12} />
        <path d={potPath} stroke="rgba(200,206,202,0.55)" strokeWidth={3} strokeDasharray="10 9" fill="none" />
        <path d={actPath} stroke={C.lime} strokeWidth={5} fill="none" strokeLinejoin="round" />
      </g>
    </g>
  );
};

// ================================================================== 6 · it multiplies
const CHIPS = ['Hello', 'Price?', 'Interested', 'Can you call me?', 'Details please', 'Available?'];
const CHAOS_N = Array.from({length: 240}, (_, i) => ({
  p: {x: BIZ.x + (rand(i * 2.3 + 50) - 0.5) * 3800, y: BIZ.y - 200 + (rand(i * 3.9 + 50) - 0.5) * 6400},
  ts: B.chaos[0] + rand(i * 5.1 + 50) * 2.8,
  wire: i % 3 === 0,
}));
const CHAOS_C = Array.from({length: 34}, (_, i) => ({
  text: CHIPS[i % CHIPS.length],
  p: {x: BIZ.x + (rand(i * 8.3 + 9) - 0.5) * 3300, y: -1050 + (rand(i * 6.1 + 9) - 0.5) * 6000},
  ts: B.chaos[0] + 0.2 + i * 0.078,
}));
const pipeTarget = (i: number): V => ({x: BIZ.x + (rand(i * 1.9) - 0.5) * 40, y: BIZ.y + 120 + rand(i * 4.7) * 1150});

export const Chaos: React.FC<P> = ({t, cam}) => {
  if (t < B.chaos[0] || t > B.reorganize[1] + 0.3) return null;
  const ft = frozen(t);
  const zr = 1 / cam.z;
  return (
    <g>
      {CHAOS_N.map((n, i) => {
        if (ft < n.ts) return null;
        const a = pt(ft, n.ts, n.ts + 0.3);
        const jit = {x: Math.sin(ft * 7 + i) * 26, y: Math.cos(ft * 5.3 + i * 1.3) * 26};
        const pos0 = {x: n.p.x + jit.x, y: n.p.y + jit.y};
        const org = pt(t, B.reorganize[0] + rand(i) * 0.5, B.reorganize[0] + 0.55 + rand(i) * 0.6, ease.inOut);
        const pos = lerpV(pos0, pipeTarget(i), org);
        const o = a * (1 - pt(org, 0.75, 1));
        const flick = 0.5 + 0.5 * Math.sin(ft * 19 + i * 2.1);
        return (
          <g key={i} opacity={o}>
            {n.wire && org === 0 && <line x1={pos.x} y1={pos.y} x2={BIZ.x} y2={BIZ.y} stroke={`rgba(200,206,202,${0.18 * flick})`} strokeWidth={1.4 * zr} />}
            <circle cx={pos.x} cy={pos.y} r={(org > 0 ? 6 : 5) * zr} fill={org > 0.3 ? C.lime : i % 4 === 0 ? C.white : C.metal} />
          </g>
        );
      })}
      {CHAOS_C.map((c, i) => {
        if (ft < c.ts) return null;
        const a = pt(ft, c.ts, c.ts + 0.25, ease.out);
        const gone = pt(t, B.aiBloom - 0.1 + i * 0.01, B.aiBloom + 0.4 + i * 0.01, ease.in);
        if (gone >= 1) return null;
        const s = (0.6 + 0.4 * a) * (1 - gone * 0.5);
        const w = (c.text.length * 15 + 70) * zr;
        const h = 58 * zr;
        return (
          <g key={i} opacity={a * (1 - gone)} transform={`translate(${c.p.x} ${c.p.y}) scale(${s})`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="rgba(14,18,16,0.92)" stroke="rgba(255,255,255,0.16)" strokeWidth={1.5 * zr} />
            <circle cx={-w / 2 + 26 * zr} cy={0} r={6 * zr} fill={C.metal} />
            <text x={-w / 2 + 44 * zr} y={2 * zr} fontFamily={FONT} fontWeight={600} fontSize={26 * zr} fill={C.white} dominantBaseline="middle">
              {c.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ================================================================== 7 · the AI core, the pipeline
export const AiCore: React.FC<P> = ({t, cam}) => {
  if (t < B.aiBloom) return null;
  const g = pt(t, B.aiBloom, B.aiBloom + 0.7);
  const bloom = pt(t, B.aiBloom, B.aiBloom + 1.4, ease.out);
  const m = Math.max(1, 0.6 / cam.z);
  const flat = pt(t, B.converge[0], B.converge[1], ease.inOut);
  const out = 1 - pt(t, 44.1, 44.7);
  const rot = (t - B.aiBloom) * 40;

  return (
    <g opacity={out} transform={`translate(${BIZ.x} ${BIZ.y}) scale(${m} ${m * (1 - flat * 0.92)})`}>
      {bloom < 1 && <circle r={40 + bloom * 1100} fill="none" stroke={`rgba(${C.limeRGB},${0.5 * (1 - bloom)})`} strokeWidth={8 * (1 - bloom) + 1} />}
      <circle r={420 * g} fill="url(#gLime)" opacity={0.55} />
      <g transform={`scale(${g})`}>
        <circle r={128} fill="none" stroke={`rgba(${C.limeRGB},0.18)`} strokeWidth={1.5} />
        <circle r={98} fill="none" stroke={C.lime} strokeWidth={3} strokeDasharray="60 34" transform={`rotate(${-rot})`} opacity={0.75} />
        <circle r={70} fill="none" stroke={C.lime} strokeWidth={2} strokeDasharray="4 10" transform={`rotate(${rot * 1.6})`} opacity={0.9} />
        <circle r={40} fill={C.lime} />
        <text y={2} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#050605" textAnchor="middle" dominantBaseline="middle">
          AI
        </text>
      </g>
      <text y={-170} fontFamily={FONT} fontWeight={700} fontSize={22} letterSpacing="0.3em" fill={C.lime} textAnchor="middle" opacity={pt(t, B.aiBloom + 0.5, B.aiBloom + 1)}>
        AI AUTOMATION
      </text>
    </g>
  );
};

const Pill: React.FC<{p: V; w: number; h?: number; text: string; tone: 'lime' | 'white' | 'fill'; o?: number; glow?: number; size?: number}> = ({
  p,
  w,
  h = 88,
  text,
  tone,
  o = 1,
  glow = 0,
  size = 32,
}) => (
  <g opacity={o}>
    {glow > 0 && <rect x={p.x - w / 2 - 14} y={p.y - h / 2 - 14} width={w + 28} height={h + 28} rx={(h + 28) / 2} fill={`rgba(${C.limeRGB},${0.18 * glow})`} />}
    <rect
      x={p.x - w / 2}
      y={p.y - h / 2}
      width={w}
      height={h}
      rx={h / 2}
      fill={tone === 'fill' ? C.lime : 'rgba(10,13,11,0.92)'}
      stroke={tone === 'white' ? 'rgba(255,255,255,0.22)' : C.lime}
      strokeWidth={2.5}
    />
    <text x={p.x} y={p.y + 2} fontFamily={FONT} fontWeight={700} fontSize={size} letterSpacing="0.06em" fill={tone === 'fill' ? '#050605' : C.white} textAnchor="middle" dominantBaseline="middle">
      {text}
    </text>
  </g>
);

export const Pipeline: React.FC<P> = ({t}) => {
  if (t < B.pipeline[0] - 0.1 || t > 37.4) return null;
  const out = 1 - pt(t, 36.7, 37.3);
  const at = (i: number) => B.pipeline[0] + i * 0.42;
  const built = t > at(5) + 0.4;
  return (
    <g opacity={out}>
      {STAGES.map((s, i) => {
        const a = pt(t, at(i), at(i) + 0.35);
        const from = i === 0 ? {x: BIZ.x, y: BIZ.y + 50} : stagePos(i - 1);
        const draw = pt(t, at(i) - 0.25, at(i) + 0.05, ease.inOut);
        return <Link key={`l${i}`} a={{x: from.x, y: from.y + 44}} b={{x: stagePos(i).x, y: stagePos(i).y - 44}} tone="lime" w={3} o={0.9} draw={draw} />;
      })}
      {built &&
        Array.from({length: 4}).map((_, k) => {
          const f = ((t - at(5)) * 0.55 + k / 4) % 1;
          const y = lerp(BIZ.y + 50, stagePos(5).y, f);
          return <Dot key={`d${k}`} p={{x: BIZ.x, y}} r={7} tone="lime" halo={0.8} />;
        })}
      {STAGES.map((s, i) => {
        const a = pt(t, at(i), at(i) + 0.35);
        const last = i === STAGES.length - 1;
        const active = t >= at(i) && t < at(i + 1) + 0.2;
        return (
          <g key={s} transform={`translate(0 ${(1 - a) * 30})`}>
            <Pill p={stagePos(i)} w={560} text={s} tone={last ? 'fill' : active ? 'lime' : 'white'} o={a} glow={last ? 1 : active ? 0.8 : 0} />
          </g>
        );
      })}
    </g>
  );
};

// ================================================================== 8 · routed automatically
const BUS_X = BIZ.x - 470;
const lanePath = (i: number): V[] => [
  {x: BIZ.x, y: BIZ.y + 60},
  {x: BUS_X, y: BIZ.y + 170},
  {x: BUS_X, y: laneY(i)},
  {x: LANE_IN_X - 170, y: laneY(i)},
];
const along = (pts: V[], p: number): V => {
  const segs = pts.slice(1).map((b, i) => Math.hypot(b.x - pts[i].x, b.y - pts[i].y));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = p * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) return lerpV(pts[i], pts[i + 1], segs[i] ? d / segs[i] : 0);
    d -= segs[i];
  }
  return pts[pts.length - 1];
};
const ORDER = [0, 2, 1, 3, 1, 0, 3, 2, 2, 0, 1, 3, 0, 3, 1, 2];
type Packet = {ts: number; lane: number; from: V};
const PACKETS: Packet[] = ORDER.map((lane, k) => ({
  ts: B.laneStart + k * B.laneBeat,
  lane,
  from: {x: BIZ.x + (rand(k * 3.3) - 0.5) * 500, y: BIZ.y - 700},
}));
const FALL = 0.4;
const ROUTE = 0.5;
const CROSS = 0.4;

export const Lanes: React.FC<P> = ({t, cam}) => {
  if (t < B.lanes[0] || t > 42.2) return null;
  const out = 1 - pt(t, 41.0, 41.9);
  const lit = (lane: number, kind: 'in' | 'out') =>
    PACKETS.filter((pk) => pk.lane === lane).reduce((acc, pk) => {
      const at = pk.ts + FALL + ROUTE + (kind === 'out' ? CROSS : 0);
      return Math.max(acc, t >= at ? 1 - pt(t, at, at + 0.45) : 0);
    }, 0);

  return (
    <g opacity={out}>
      <Link a={{x: BIZ.x, y: BIZ.y + 60}} b={{x: BUS_X, y: BIZ.y + 170}} tone="white" o={0.35 * pt(t, 36.9, 37.2)} w={2} />
      <Link a={{x: BUS_X, y: BIZ.y + 170}} b={{x: BUS_X, y: laneY(3)}} tone="white" o={0.35} w={2} draw={pt(t, 36.9, 37.3, ease.inOut)} />
      {LANES.map(([a, b], i) => {
        const ap = pt(t, 36.95 + i * 0.12, 37.35 + i * 0.12);
        const y = laneY(i);
        const li = lit(i, 'in');
        const lo = lit(i, 'out');
        return (
          <g key={i} opacity={ap} transform={`translate(${(1 - ap) * -40} 0)`}>
            <Link a={{x: BUS_X, y}} b={{x: LANE_IN_X - 170, y}} tone="white" o={0.35} w={2} />
            <Link a={{x: LANE_IN_X + 170, y}} b={{x: LANE_OUT_X - 190, y}} tone={lo > 0 ? 'lime' : 'white'} o={0.4 + lo * 0.6} w={2.5} />
            <path d={`M ${LANE_OUT_X - 222} ${y - 12} l 14 12 l -14 12`} stroke={lo > 0 ? C.lime : 'rgba(255,255,255,0.5)'} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Pill p={{x: LANE_IN_X, y}} w={340} h={80} text={a} tone={li > 0.05 ? 'lime' : 'white'} glow={li} size={27} />
            <Pill p={{x: LANE_OUT_X, y}} w={380} h={80} text={b} tone={lo > 0.3 ? 'fill' : 'lime'} glow={lo} size={27} />
          </g>
        );
      })}
      {PACKETS.map((pk, k) => {
        if (t < pk.ts || t > pk.ts + FALL + ROUTE + CROSS + 0.1) return null;
        const f1 = pt(t, pk.ts, pk.ts + FALL, ease.in);
        const f2 = pt(t, pk.ts + FALL, pk.ts + FALL + ROUTE, ease.inOut);
        const f3 = pt(t, pk.ts + FALL + ROUTE, pk.ts + FALL + ROUTE + CROSS, ease.inOut);
        const at = (tt: number): V => {
          const a1 = pt(tt, pk.ts, pk.ts + FALL, ease.in);
          const a2 = pt(tt, pk.ts + FALL, pk.ts + FALL + ROUTE, ease.inOut);
          const a3 = pt(tt, pk.ts + FALL + ROUTE, pk.ts + FALL + ROUTE + CROSS, ease.inOut);
          if (a1 < 1) return lerpV(pk.from, {x: BIZ.x, y: BIZ.y}, a1);
          if (a2 < 1) return along(lanePath(pk.lane), a2);
          return lerpV({x: LANE_IN_X + 170, y: laneY(pk.lane)}, {x: LANE_OUT_X - 190, y: laneY(pk.lane)}, a3);
        };
        const p = at(t);
        const hidden = f2 >= 1 && f3 === 0; // passing "through" the input pill
        if (hidden) return null;
        return (
          <g key={k}>
            <Trail at={(dt) => at(t - dt)} len={0.18} w={10} />
            <Dot p={p} r={9} tone={f1 < 1 ? 'white' : 'lime'} halo={0.9} />
          </g>
        );
      })}
    </g>
  );
};

// ================================================================== final · the whole system
export const Ecosystem: React.FC<P> = ({t, cam}) => {
  if (t < B.ecosystem[0] || t > 44.9) return null;
  const conv = pt(t, B.converge[0], B.converge[1], ease.inOut);
  const out = 1 - pt(t, 44.1, 44.7);
  const zr = 1 / cam.z;
  const flatten = (p: V): V => ({x: lerp(p.x, BIZ.x + (p.x - BIZ.x) * 1.15, conv), y: lerp(p.y, BIZ.y, conv)});
  const sats = SATELLITES.map((_, i) => flatten(satPos(i, t)));

  return (
    <g opacity={out}>
      {sats.map((p, i) => {
        const a = pt(t, B.ecosystem[0] + 0.3 + i * 0.12, B.ecosystem[0] + 0.9 + i * 0.12);
        const nxt = sats[(i + 1) % sats.length];
        return (
          <g key={i} opacity={a}>
            <Link a={flatten(BIZ)} b={p} tone="lime" o={0.85} w={3 * zr} draw={a} />
            <Link a={p} b={nxt} tone="white" o={0.22} w={1.5 * zr} />
            {[0, 1].map((k) => {
              const f = ((t - B.ecosystem[0]) * 0.8 + k / 2 + i * 0.13) % 1;
              return <Dot key={k} p={lerpV(BIZ, p, f)} r={6 * zr} tone="lime" halo={0.8} o={Math.sin(f * Math.PI)} />;
            })}
            <Dot p={p} r={13 * zr} tone="lime" halo={1.3} />
            <Label p={p} text={SATELLITES[i]} z={cam.z} size={26} weight={700} color={C.white} dy={44} spacing={0.14} o={1 - conv} />
          </g>
        );
      })}
    </g>
  );
};
