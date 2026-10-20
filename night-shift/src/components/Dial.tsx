import React from 'react';
import {EVENTS} from '../config';
import {B} from '../timeline';
import {C, FONT} from '../theme';
import {ease, lerp, pt} from '../lib/anim';
import {Icon} from './Icons';

// ------------------------------------------------------------------ geometry
const BASE = {cx: 540, cy: 1180, R: 380};
const FINAL = {cx: 540, cy: 760, R: 215};
const S = B.startHour;

export const geom = (t: number) => {
  const p = pt(t, B.toLogo[0], B.toLogo[1], ease.inOut);
  return {cx: lerp(BASE.cx, FINAL.cx, p), cy: lerp(BASE.cy, FINAL.cy, p), R: lerp(BASE.R, FINAL.R, p)};
};

/** Midnight at 12 o'clock, clockwise, 15° per hour. */
export const ang = (h: number) => ((-90 + h * 15) * Math.PI) / 180;
export const onRing = (h: number, g = BASE, r = g.R) => ({x: g.cx + Math.cos(ang(h)) * r, y: g.cy + Math.sin(ang(h)) * r});
export const startPoint = () => onRing(S);

/** Where the hand is, in hours since midnight (may exceed 24 once the day wraps). */
export const hourAt = (t: number) => {
  const E = B.events;
  const H = B.eventHours;
  if (t < 15.0) return S;
  for (let i = 0; i < E.length; i++) {
    const t0 = i === 0 ? 15.0 : E[i - 1] + 0.35;
    const h0 = i === 0 ? S : H[i - 1];
    if (t < E[i]) return lerp(h0, H[i], pt(t, t0, E[i], ease.inOut));
  }
  const [a, b] = B.fullCircle;
  return lerp(H[H.length - 1], S + 24, pt(t, a, b, ease.inOut));
};

export const fmt = (h: number) => {
  const m = Math.round((((h % 24) + 24) % 24) * 60) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return {hm: `${h12}:${String(mm).padStart(2, '0')}`, ap: hh < 12 ? 'AM' : 'PM'};
};

const daylight = (h: number) => Math.max(0, Math.sin((((h % 24) - 6) / 12) * Math.PI));

const arc = (g: {cx: number; cy: number; R: number}, h0: number, h1: number) => {
  const span = Math.min(24, h1 - h0);
  if (span <= 0.001) return '';
  if (span >= 23.99) return `M ${g.cx} ${g.cy - g.R} a ${g.R} ${g.R} 0 1 1 0 ${2 * g.R} a ${g.R} ${g.R} 0 1 1 0 ${-2 * g.R}`;
  const a = onRing(h0, g);
  const b = onRing(h0 + span, g);
  return `M ${a.x} ${a.y} A ${g.R} ${g.R} 0 ${span > 12 ? 1 : 0} 1 ${b.x} ${b.y}`;
};

// ------------------------------------------------------------------ the dial
export const Dial: React.FC<{t: number}> = ({t}) => {
  if (t < B.toDial[0] + 0.2) return null;
  const g = geom(t);
  const draw = pt(t, B.toDial[0] + 0.3, B.toDial[1] + 0.2, ease.inOut);
  const H = hourAt(t);
  const fin = pt(t, B.toLogo[0], B.toLogo[1], ease.inOut);
  const closed = pt(t, B.fullCircle[1] - 0.1, B.fullCircle[1] + 0.5);
  const tip = onRing(H, g);
  const day = daylight(H);
  const time = fmt(H);
  const startIn = pt(t, B.toDial[0] + 0.7, B.toDial[0] + 1.1);
  const sp = onRing(S, g);
  const pulse = (t - (B.toDial[0] + 0.7)) % 1.6;

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="disk">
          <stop offset="0%" stopColor={`rgba(${C.limeRGB},${0.04 + 0.1 * day})`} />
          <stop offset="70%" stopColor={`rgba(${C.limeRGB},${0.015 + 0.03 * day})`} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="tipGlow">
          <stop offset="0%" stopColor={`rgba(${C.limeRGB},0.8)`} />
          <stop offset="100%" stopColor={`rgba(${C.limeRGB},0)`} />
        </radialGradient>
      </defs>

      <circle cx={g.cx} cy={g.cy} r={g.R * 1.02} fill="url(#disk)" opacity={draw} />
      {/* base ring + ticks */}
      <circle cx={g.cx} cy={g.cy} r={g.R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} pathLength={1} strokeDasharray={`${draw} 1`} transform={`rotate(-90 ${g.cx} ${g.cy})`} />
      {Array.from({length: 96}).map((_, i) => {
        const h = i / 4;
        const major = i % 24 === 0;
        const hour = i % 4 === 0;
        const a = pt(t, B.toDial[0] + 0.3 + (i / 96) * 1.0, B.toDial[0] + 0.5 + (i / 96) * 1.0);
        const r0 = g.R - (major ? 26 : hour ? 16 : 8);
        const p0 = onRing(h, g, r0);
        const p1 = onRing(h, g, g.R - 2);
        return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={`rgba(255,255,255,${major ? 0.5 : hour ? 0.26 : 0.1})`} strokeWidth={major ? 3 : 1.6} opacity={a * (1 - fin * 0.7)} />;
      })}
      {[
        [0, '12 AM'],
        [12, '12 PM'],
      ].map(([h, l]) => {
        const p = onRing(h as number, g, g.R - 60);
        return (
          <text key={l} x={p.x} y={p.y} fontFamily={FONT} fontWeight={600} fontSize={20} letterSpacing="0.14em" fill={C.grey} textAnchor="middle" dominantBaseline="middle" opacity={draw * (1 - fin)}>
            {l}
          </text>
        );
      })}

      {/* the covered day */}
      <path d={arc(g, S, H)} fill="none" stroke={`rgba(${C.limeRGB},0.22)`} strokeWidth={26} strokeLinecap="round" />
      <path d={arc(g, S, H)} fill="none" stroke={C.lime} strokeWidth={7 + closed * 3} strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${10 + closed * 20}px rgba(${C.limeRGB},0.8))`}} />

      {/* 2:14 AM — where the night's booking landed */}
      {startIn > 0 && (
        <g opacity={startIn * (1 - fin)}>
          {pulse > 0 && pulse < 1 && <circle cx={sp.x} cy={sp.y} r={10 + pulse * 40} fill="none" stroke={C.lime} strokeWidth={2} opacity={1 - pulse} />}
          <circle cx={sp.x} cy={sp.y} r={11} fill={C.lime} />
          <text x={onRing(S, g, g.R + 56).x + 10} y={onRing(S, g, g.R + 56).y} fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.lime} textAnchor="start" dominantBaseline="middle">
            2:14 AM · BOOKED
          </text>
        </g>
      )}

      {/* events that have happened */}
      {B.events.map((te, i) => {
        const a = pt(t, te - 0.05, te + 0.3);
        if (a <= 0) return null;
        const h = B.eventHours[i];
        const p = onRing(h, g);
        const lp = onRing(h, g, g.R + 52);
        const label = fmt(h);
        const left = Math.cos(ang(h)) < -0.2;
        return (
          <g key={i} opacity={a * (1 - fin)}>
            <circle cx={p.x} cy={p.y} r={9 * a} fill={C.white} stroke={C.lime} strokeWidth={3} />
            <text x={lp.x} y={lp.y} fontFamily={FONT} fontWeight={600} fontSize={21} fill={C.metal} textAnchor={left ? 'end' : Math.abs(Math.cos(ang(h))) < 0.2 ? 'middle' : 'start'} dominantBaseline="middle">
              {`${label.hm} ${label.ap}`}
            </text>
          </g>
        );
      })}

      {/* hand + sun/moon at its tip */}
      <g opacity={draw * (1 - fin)}>
        <line x1={g.cx} y1={g.cy} x2={tip.x} y2={tip.y} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        <circle cx={g.cx} cy={g.cy} r={7} fill={C.white} />
        <circle cx={tip.x} cy={tip.y} r={70} fill="url(#tipGlow)" opacity={0.5} />
        <circle cx={tip.x} cy={tip.y} r={30} fill="#0A0D0B" stroke={C.lime} strokeWidth={3} />
        <g transform={`translate(${tip.x - 17} ${tip.y - 17})`} opacity={day}>
          <Icon name="sun" size={34} color={C.lime} stroke={2.2} />
        </g>
        <g transform={`translate(${tip.x - 15} ${tip.y - 15})`} opacity={1 - day}>
          <Icon name="moon" size={30} color={C.lime} stroke={2.2} />
        </g>
      </g>

      {/* the time, in the centre */}
      <g opacity={draw * (1 - pt(t, B.toLogo[0], B.toLogo[0] + 0.5))}>
        <text x={g.cx} y={g.cy - 92} fontFamily={FONT} fontWeight={600} fontSize={22} letterSpacing="0.36em" fill={C.lime} textAnchor="middle">
          ALWAYS ON
        </text>
        <text x={g.cx} y={g.cy + 12} fontFamily={FONT} fontWeight={700} fontSize={108} fill={C.white} textAnchor="middle" dominantBaseline="middle" style={{fontVariantNumeric: 'tabular-nums'}}>
          {time.hm}
        </text>
        <text x={g.cx} y={g.cy + 98} fontFamily={FONT} fontWeight={600} fontSize={30} letterSpacing="0.2em" fill={C.grey} textAnchor="middle">
          {time.ap}
        </text>
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ event cards
const SLOT_Y = 250;
const SLOT_H = 150;

/** Each stop of the hand ejects a card; newer cards push older ones down the log. */
export const EventCards: React.FC<{t: number}> = ({t}) => {
  if (t < B.events[0] - 0.2 || t > B.every1 + 0.3) return null;
  const leave = pt(t, B.fullCircle[1] - 0.2, B.every1 + 0.1, ease.in);
  return (
    <>
      {B.events.map((te, i) => {
        if (t < te) return null;
        const e = EVENTS[i];
        const p = pt(t, te, te + 0.55, ease.out);
        // how far this card has been pushed down by later ones
        let slot = 0;
        B.events.forEach((tj, j) => {
          if (j > i) slot += pt(t, tj, tj + 0.5, ease.inOut);
        });
        if (slot > 3) return null;
        const from = onRing(B.eventHours[i]);
        const y = SLOT_Y + slot * SLOT_H;
        const x = 110;
        const label = fmt(B.eventHours[i]);
        const beam = pt(t, te, te + 0.25) * (1 - pt(t, te + 0.3, te + 0.7));
        return (
          <React.Fragment key={i}>
            {beam > 0 && (
              <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
                <line x1={from.x} y1={from.y} x2={540} y2={y + 64} stroke={C.lime} strokeWidth={3} opacity={beam} style={{filter: `drop-shadow(0 0 8px ${C.lime})`}} />
              </svg>
            )}
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 860,
                height: 128,
                transform: `translate(${(1 - p) * (from.x - 540)}px, ${(1 - p) * (from.y - y - 64)}px) scale(${lerp(0.2, 1, p) * (1 - slot * 0.04)})`,
                opacity: p * Math.max(0, 1 - slot * 0.3) * (1 - leave),
                filter: `blur(${(1 - p) * 10 + leave * 10}px)`,
                borderRadius: 34,
                background: 'linear-gradient(180deg, rgba(24,28,26,0.92), rgba(12,15,13,0.94))',
                border: `1.5px solid ${slot < 0.5 ? `rgba(${C.limeRGB},0.55)` : 'rgba(255,255,255,0.1)'}`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.55)${slot < 0.5 ? `, 0 0 40px rgba(${C.limeRGB},0.18)` : ''}`,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '0 34px 0 26px',
                fontFamily: FONT,
              }}
            >
              <div style={{width: 78, height: 78, borderRadius: 24, display: 'grid', placeItems: 'center', background: `rgba(${C.limeRGB},0.12)`, border: `1px solid rgba(${C.limeRGB},0.35)`, flex: 'none'}}>
                <Icon name={e.icon} size={40} color={C.lime} />
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 36, fontWeight: 700, color: C.white, letterSpacing: '-0.01em'}}>{e.title}</div>
                <div style={{fontSize: 24, fontWeight: 500, color: C.grey, whiteSpace: 'nowrap'}}>{e.sub}</div>
              </div>
              <div style={{fontSize: 24, fontWeight: 600, color: C.lime, whiteSpace: 'nowrap'}}>{`${label.hm} ${label.ap}`}</div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};
