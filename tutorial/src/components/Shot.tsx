import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {VIEW} from '../config';
import {FPS, Shot as ShotT, Step} from '../data';
import {C, FONT} from '../theme';
import {ease, lerp, pt} from '../lib/anim';

type Cam = {cx: number; cy: number; s: number};

const fitScale = (w: number, h: number) => Math.min(VIEW.w / w, VIEW.h / h);

/** Keep the camera inside the picture so no empty edge ever shows. */
const clampCam = (c: Cam, w: number, h: number): Cam => {
  const hw = VIEW.w / (2 * c.s);
  const hh = VIEW.h / (2 * c.s);
  return {
    s: c.s,
    cx: w * c.s <= VIEW.w ? w / 2 : Math.min(w - hw, Math.max(hw, c.cx)),
    cy: h * c.s <= VIEW.h ? h / 2 : Math.min(h - hh, Math.max(hh, c.cy)),
  };
};

const stepCam = (st: Step, w: number, h: number): Cam => {
  const [cx, cy, s] = st.cam;
  return clampCam({cx, cy, s: s === 0 ? fitScale(w, h) : s}, w, h);
};

export const camAt = (shot: ShotT, t: number): Cam => {
  const st = shot.steps;
  let c = stepCam(st[0], shot.w, shot.h);
  for (let i = 1; i < st.length; i++) {
    const p = pt(t, st[i].t, st[i].t + 1.0, ease.inOut);
    if (p <= 0) break;
    const n = stepCam(st[i], shot.w, shot.h);
    c = {cx: lerp(c.cx, n.cx, p), cy: lerp(c.cy, n.cy, p), s: Math.exp(lerp(Math.log(c.s), Math.log(n.s), p))};
  }
  return c;
};

export const currentStep = (shot: ShotT, t: number) => {
  let k = 0;
  shot.steps.forEach((s, i) => {
    if (t >= s.t) k = i;
  });
  return k;
};

const toView = (c: Cam, x: number, y: number) => ({x: VIEW.w / 2 + (x - c.cx) * c.s, y: VIEW.h / 2 + (y - c.cy) * c.s});

/**
 * One screen of the tutorial: the real screenshot / recording inside the browser viewport,
 * a camera that glides between steps, a lime spotlight, a label and a cursor.
 */
export const Shot: React.FC<{shot: ShotT}> = ({shot}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camAt(shot, t);
  const k = currentStep(shot, t);
  const step = shot.steps[k];

  // content cross-fade / zoom-through at shot boundaries
  const inP = shot.enter === 'zoomThrough' ? pt(t, 0, 0.6, ease.out) : pt(t, 0, 0.45, ease.out);
  const outP = shot.exit === 'zoomThrough' ? pt(t, shot.dur - 0.5, shot.dur, ease.in) : pt(t, shot.dur - 0.3, shot.dur, ease.in);
  const zIn = shot.enter === 'zoomThrough' ? lerp(0.85, 1, inP) : 1;
  const zOut = shot.exit === 'zoomThrough' ? 1 + outP * 0.6 : 1;

  // spotlight rect, gliding between consecutive highlights
  const rectAt = (): {r: number[]; o: number} | null => {
    const prev = k > 0 ? shot.steps[k - 1].hl : undefined;
    const p = pt(t, step.t + 0.2, step.t + 0.9, ease.inOut);
    if (step.hl) {
      if (prev) return {r: prev.map((v, j) => lerp(v, step.hl![j], p)), o: 1};
      return {r: step.hl, o: p};
    }
    if (prev) {
      const o = 1 - pt(t, step.t, step.t + 0.4);
      return o > 0 ? {r: prev, o} : null;
    }
    return null;
  };
  const hl = rectAt();

  // cursor path through steps that define one
  const cursorPts = shot.steps.filter((s) => s.cursor).map((s) => ({t: s.t, x: s.cursor![0], y: s.cursor![1], click: s.click}));
  let cur: {x: number; y: number; o: number; tap: number; ring: number} | null = null;
  if (cursorPts.length && t >= cursorPts[0].t) {
    let x = cursorPts[0].x + 160;
    let y = cursorPts[0].y + 120;
    let px = x;
    let py = y;
    cursorPts.forEach((c) => {
      const p = pt(t, c.t + 0.3, c.t + 1.2, ease.inOut);
      if (p > 0) {
        x = lerp(px, c.x, p);
        y = lerp(py, c.y, p);
      }
      if (t >= c.t + 1.2) {
        px = c.x;
        py = c.y;
      }
    });
    const clickT = cursorPts.map((c) => c.click).filter((c): c is number => c !== undefined && t >= c).pop();
    cur = {
      x,
      y,
      o: pt(t, cursorPts[0].t, cursorPts[0].t + 0.4),
      tap: clickT !== undefined ? pt(t, clickT, clickT + 0.08) - pt(t, clickT + 0.08, clickT + 0.25) : 0,
      ring: clickT !== undefined ? pt(t, clickT, clickT + 0.6) : 0,
    };
  }
  // click ring for recordings (their own cursor is in the footage)
  const vClick = shot.kind === 'video' && step.click !== undefined ? pt(t, step.click, step.click + 0.6) : 0;

  const hlV = hl ? {a: toView(cam, hl.r[0], hl.r[1]), b: toView(cam, hl.r[2], hl.r[3])} : null;

  return (
    <div style={{position: 'absolute', left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h, overflow: 'hidden', opacity: inP * (1 - outP)}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zIn * zOut})`, transformOrigin: cur ? `${toView(cam, cur.x, cur.y).x}px ${toView(cam, cur.x, cur.y).y}px` : '50% 50%'}}>
        <div style={{position: 'absolute', left: VIEW.w / 2 - cam.cx * cam.s, top: VIEW.h / 2 - cam.cy * cam.s, width: shot.w, height: shot.h, transform: `scale(${cam.s})`, transformOrigin: '0 0'}}>
          {shot.kind === 'video' ? (
            <OffthreadVideo src={staticFile(shot.src)} muted style={{width: shot.w, height: shot.h}} />
          ) : (
            <Img src={staticFile(shot.src)} style={{width: shot.w, height: shot.h, display: 'block'}} />
          )}
          {/* privacy: soften personal details (e-mail) */}
          {shot.blur?.map((b, i) => (
            <div key={i} style={{position: 'absolute', left: b[0], top: b[1], width: b[2] - b[0], height: b[3] - b[1], borderRadius: 10, backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', background: 'rgba(128,128,128,0.08)'}} />
          ))}
          {/* spotlight */}
          {hl && hl.o > 0.01 && (
            <svg width={shot.w} height={shot.h} style={{position: 'absolute', left: 0, top: 0}}>
              <defs>
                <mask id={`m-${shot.id}`}>
                  <rect width={shot.w} height={shot.h} fill="white" />
                  <rect x={hl.r[0]} y={hl.r[1]} width={hl.r[2] - hl.r[0]} height={hl.r[3] - hl.r[1]} rx={14 / cam.s} fill="black" />
                </mask>
              </defs>
              <rect width={shot.w} height={shot.h} fill={`rgba(3,5,4,${0.55 * hl.o})`} mask={`url(#m-${shot.id})`} />
              <rect x={hl.r[0]} y={hl.r[1]} width={hl.r[2] - hl.r[0]} height={hl.r[3] - hl.r[1]} rx={14 / cam.s} fill="none" stroke={C.lime} strokeWidth={3 / cam.s} opacity={hl.o} style={{filter: `drop-shadow(0 0 ${10 / cam.s}px ${C.lime})`}} />
            </svg>
          )}
          {/* cursor */}
          {cur && (
            <div style={{position: 'absolute', left: cur.x, top: cur.y, opacity: cur.o}}>
              {cur.ring > 0 && cur.ring < 1 && (
                <div style={{position: 'absolute', left: (-40 * cur.ring) / cam.s, top: (-40 * cur.ring) / cam.s, width: (80 * cur.ring) / cam.s, height: (80 * cur.ring) / cam.s, borderRadius: 999, border: `${3 / cam.s}px solid ${C.lime}`, opacity: 1 - cur.ring}} />
              )}
              <svg width={44 / cam.s} height={44 / cam.s} viewBox="0 0 24 24" style={{position: 'absolute', left: -4 / cam.s, top: -2 / cam.s, transform: `scale(${1 - cur.tap * 0.15})`, transformOrigin: '20% 10%', filter: `drop-shadow(0 ${3 / cam.s}px ${6 / cam.s}px rgba(0,0,0,0.5))`}}>
                <path d="M4 2.5l15 8.2-6.6 1.6 3.6 7.3-2.7 1.3-3.6-7.3L4.8 18z" fill="#fff" stroke="#0A0D0B" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {vClick > 0 && vClick < 1 && step.hl && (
            <div
              style={{
                position: 'absolute',
                left: (step.hl[0] + step.hl[2]) / 2 - (60 * vClick) / cam.s,
                top: (step.hl[1] + step.hl[3]) / 2 - (60 * vClick) / cam.s,
                width: (120 * vClick) / cam.s,
                height: (120 * vClick) / cam.s,
                borderRadius: 999,
                border: `${3 / cam.s}px solid ${C.lime}`,
                opacity: 1 - vClick,
              }}
            />
          )}
        </div>
        {/* label pill, in viewport space */}
        {hlV && hl && step.label && (
          <Label key={k} text={step.label} a={hlV.a} b={hlV.b} o={hl.o} />
        )}
      </div>
    </div>
  );
};

const Label: React.FC<{text: string; a: {x: number; y: number}; b: {x: number; y: number}; o: number}> = ({text, a, b, o}) => {
  const above = a.y > 80;
  const cx = Math.min(VIEW.w - 40, Math.max(40, (a.x + b.x) / 2));
  const y = above ? a.y - 16 : b.y + 16;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: y,
        transform: `translate(-50%, ${above ? '-100%' : '0'}) translateY(${(1 - o) * (above ? 10 : -10)}px)`,
        opacity: o,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 18px',
        borderRadius: 999,
        background: 'rgba(6,9,7,0.92)',
        border: `1.5px solid ${C.lime}`,
        boxShadow: `0 0 24px rgba(${C.limeRGB},0.35), 0 10px 30px rgba(0,0,0,0.5)`,
        fontFamily: FONT,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '0.14em',
        color: C.white,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{width: 9, height: 9, borderRadius: 9, background: C.lime, boxShadow: `0 0 10px ${C.lime}`}} />
      {text}
    </div>
  );
};
