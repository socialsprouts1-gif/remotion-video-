import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import type {Rect} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';

// ------------------------------------------------------------------ camera
/** Camera pose: centre (cx, cy) in image pixels, zoom s, and the window (card) size vw × vh in canvas px. */
export type Cam = {cx: number; cy: number; s: number; vw: number; vh: number};
export type CamKey = Cam & {f: number};

/** Pose at a frame. Consecutive keys interpolate with an S-curve; repeat a pose to hold it. Zoom moves in log space. */
export const camAt = (keys: CamKey[], frame: number): Cam => {
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame < b.f) {
      const p = prog(frame, a.f, b.f - a.f, ease.inOut);
      return {
        cx: mix(p, a.cx, b.cx),
        cy: mix(p, a.cy, b.cy),
        s: Math.exp(mix(p, Math.log(a.s), Math.log(b.s))),
        vw: mix(p, a.vw, b.vw),
        vh: mix(p, a.vh, b.vh),
      };
    }
  }
  return keys[keys.length - 1];
};

/** Image pixel → card-local canvas px. */
export const toCard = (cam: Cam, x: number, y: number) => ({
  x: cam.vw / 2 + (x - cam.cx) * cam.s,
  y: cam.vh / 2 + (y - cam.cy) * cam.s,
});

/** Pose that shows the whole image at width vw. */
export const fitCam = (w: number, h: number, vw: number): Cam => ({cx: w / 2, cy: h / 2, s: vw / w, vw, vh: (h * vw) / w});

// ------------------------------------------------------------------ the card
type Props = {
  screen: {src: string; w: number; h: number};
  keys: CamKey[];
  centerY: number; // canvas y of the card centre
  imageLayer?: (cam: Cam) => React.ReactNode; // drawn in image coordinates, moves with the screenshot
  cardLayer?: (cam: Cam) => React.ReactNode; // drawn in card coordinates, on top, unclipped
  glow?: number;
};

/**
 * The real screenshot inside a glass-bezelled window, driven by a camera.
 * The image itself is never redrawn or distorted: only translated and uniformly scaled.
 */
export const DashboardZoom: React.FC<Props> = ({screen, keys, centerY, imageLayer, cardLayer, glow = 0.35}) => {
  const frame = useCurrentFrame();
  const cam = camAt(keys, frame);
  const left = 540 - cam.vw / 2;
  const top = centerY - cam.vh / 2;

  return (
    <div style={{position: 'absolute', left, top, width: cam.vw, height: cam.vh}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 30,
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: `${SHADOW.float}, 0 0 0 10px rgba(255,255,255,0.05), 0 0 0 11px rgba(255,255,255,0.08), 0 0 90px rgba(194,255,61,${0.12 * glow})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: cam.vw / 2 - cam.cx * cam.s,
            top: cam.vh / 2 - cam.cy * cam.s,
            width: screen.w,
            height: screen.h,
            transform: `scale(${cam.s})`,
            transformOrigin: '0 0',
          }}
        >
          <Img src={staticFile(screen.src)} style={{width: screen.w, height: screen.h, display: 'block'}} />
          {imageLayer?.(cam)}
        </div>
        {/* glass sheen over the screen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, transparent 28%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {cardLayer?.(cam)}
    </div>
  );
};

// ------------------------------------------------------------------ spotlight highlight
export type Step = {f: number; rect: Rect; label?: string; side?: 'right' | 'left' | 'above' | 'below'};

const rectAt = (steps: Step[], frame: number): Rect => {
  let r = steps[0].rect;
  for (let i = 1; i < steps.length; i++) {
    const p = prog(frame, steps[i].f - 4, 14, ease.inOut);
    if (p <= 0) break;
    r = r.map((v, k) => mix(p, v, steps[i].rect[k])) as Rect;
  }
  return r;
};

/**
 * Dims everything except the focused area and outlines it in lime.
 * Lives in image coordinates; stroke widths are divided by the zoom so they stay constant on screen.
 */
export const Highlight: React.FC<{
  id: string;
  steps: Step[];
  w: number;
  h: number;
  s: number;
  endAt?: number;
  dim?: number;
  pad?: number;
}> = ({id, steps, w, h, s, endAt, dim = 0.55, pad = 6}) => {
  const frame = useCurrentFrame();
  const o = prog(frame, steps[0].f - 4, 12) * (endAt === undefined ? 1 : 1 - prog(frame, endAt, 10, ease.in));
  if (o <= 0) return null;
  const [x1, y1, x2, y2] = rectAt(steps, frame);
  const x = x1 - pad / s;
  const y = y1 - pad / s;
  const rw = x2 - x1 + (2 * pad) / s;
  const rh = y2 - y1 + (2 * pad) / s;
  const rad = 14 / s;
  const cur = [...steps].reverse().find((st) => frame >= st.f) ?? steps[0];
  const pulse = prog(frame, cur.f + 6, 22, ease.out);

  return (
    <>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <mask id={id}>
            <rect width={w} height={h} fill="white" />
            <rect x={x} y={y} width={rw} height={rh} rx={rad} fill="black" />
          </mask>
        </defs>
        <rect width={w} height={h} fill={`rgba(4,6,5,${dim * o})`} mask={`url(#${id})`} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: rw,
          height: rh,
          borderRadius: rad,
          border: `${3 / s}px solid ${C.lime}`,
          boxShadow: `0 0 ${24 / s}px rgba(194,255,61,0.55), inset 0 0 ${16 / s}px rgba(194,255,61,0.18)`,
          opacity: o,
        }}
      />
      {pulse > 0 && pulse < 1 && (
        <div
          style={{
            position: 'absolute',
            left: x - (pulse * 22) / s,
            top: y - (pulse * 22) / s,
            width: rw + (pulse * 44) / s,
            height: rh + (pulse * 44) / s,
            borderRadius: rad + (pulse * 22) / s,
            border: `${2 / s}px solid ${C.lime}`,
            opacity: (1 - pulse) * 0.7 * o,
          }}
        />
      )}
    </>
  );
};

// ------------------------------------------------------------------ callout label
/** Lime-dotted label tied to the focused area by a short leader line. Card coordinates. */
export const Callout: React.FC<{cam: Cam; steps: Step[]; endAt?: number; fontSize?: number}> = ({
  cam,
  steps,
  endAt,
  fontSize = 30,
}) => {
  const frame = useCurrentFrame();
  const visible = steps
    .map((st, i) => ({st, i}))
    .filter(({st, i}) => frame >= st.f && (i === steps.length - 1 || frame < steps[i + 1].f + 8));

  return (
    <>
      {visible.map(({st, i}) => {
        if (!st.label) return null;
        const inP = prog(frame, st.f + 4, 16, ease.out);
        const nextF = i < steps.length - 1 ? steps[i + 1].f : endAt;
        const outP = nextF === undefined ? 0 : prog(frame, nextF - 2, 8, ease.in);
        const o = inP * (1 - outP);
        if (o <= 0) return null;

        const [x1, y1, x2, y2] = st.rect;
        const estW = st.label.length * (fontSize * 0.78) + 96;
        let side = st.side ?? 'right';
        const r = toCard(cam, x2, (y1 + y2) / 2);
        if (side === 'right' && r.x + 40 + estW > cam.vw - 12) side = 'below';

        let ax: number, ay: number, px: number, py: number, lineW = 0, lineH = 0;
        if (side === 'right') {
          ({x: ax, y: ay} = r);
          ax += 8;
          lineW = 34;
          px = ax + lineW;
          py = ay;
        } else if (side === 'left') {
          ({x: ax, y: ay} = toCard(cam, x1, (y1 + y2) / 2));
          ax -= 8;
          lineW = -34;
          px = ax + lineW - estW;
          py = ay;
        } else {
          const below = side === 'below';
          ({x: ax, y: ay} = toCard(cam, (x1 + x2) / 2, below ? y2 : y1));
          ay += below ? 10 : -10;
          lineH = below ? 30 : -30;
          px = Math.max(16, Math.min(cam.vw - 16 - estW, ax - estW / 2));
          py = ay + lineH + (below ? fontSize : -fontSize);
        }

        return (
          <React.Fragment key={i}>
            {/* leader */}
            <div
              style={{
                position: 'absolute',
                left: Math.min(ax, ax + lineW) - (lineW === 0 ? 1.5 : 0),
                top: Math.min(ay, ay + lineH) - (lineH === 0 ? 1.5 : 0),
                width: lineW === 0 ? 3 : Math.abs(lineW) * inP,
                height: lineH === 0 ? 3 : Math.abs(lineH) * inP,
                background: C.lime,
                boxShadow: `0 0 10px ${C.lime}`,
                opacity: 1 - outP,
                transformOrigin: lineW < 0 || lineH < 0 ? '100% 100%' : '0 0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: px,
                top: py,
                transform: `translateY(-50%) translateX(${(1 - inP) * (side === 'left' ? -24 : 24)}px)`,
                opacity: o,
                filter: `blur(${(1 - inP) * 6 + outP * 6}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 26px',
                borderRadius: 999,
                background: 'rgba(8,11,9,0.88)',
                border: `1.5px solid rgba(194,255,61,0.6)`,
                boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 30px rgba(194,255,61,0.25)`,
                backdropFilter: 'blur(14px)',
                whiteSpace: 'nowrap',
                fontFamily: F.body,
                fontWeight: 800,
                fontSize,
                letterSpacing: '0.08em',
                color: C.white,
              }}
            >
              <span style={{width: 12, height: 12, borderRadius: 99, background: C.lime, boxShadow: `0 0 12px ${C.lime}`}} />
              {st.label}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ cursor
export type CursorPoint = {f: number; x: number; y: number; click?: boolean};

/**
 * Pointer that glides to each point (arriving at f) and taps. Image coordinates,
 * size divided by zoom so it reads the same at any camera distance.
 */
export const Cursor: React.FC<{points: CursorPoint[]; s: number; endAt?: number}> = ({points, s, endAt}) => {
  const frame = useCurrentFrame();
  const first = points[0];
  const appear = prog(frame, first.f - 18, 12);
  const gone = endAt === undefined ? 0 : prog(frame, endAt, 8, ease.in);
  if (appear <= 0 || gone >= 1) return null;

  let x = first.x + 120;
  let y = first.y + 140;
  {
    const p = prog(frame, first.f - 18, 18, ease.out);
    x = mix(p, x, first.x);
    y = mix(p, y, first.y);
  }
  for (let i = 1; i < points.length; i++) {
    const p = prog(frame, points[i].f - 16, 16, ease.inOut);
    if (p <= 0) break;
    x = mix(p, points[i - 1].x, points[i].x);
    y = mix(p, points[i - 1].y, points[i].y);
  }
  const last = [...points].reverse().find((pt) => frame >= pt.f);
  const tap = last && last.click !== false ? prog(frame, last.f, 5) - prog(frame, last.f + 5, 7) : 0;
  const ring = last && last.click !== false ? prog(frame, last.f, 18) : 0;
  const k = 1 / s;

  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: appear * (1 - gone)}}>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: 'absolute',
            left: -36 * k * ring,
            top: -36 * k * ring,
            width: 72 * k * ring,
            height: 72 * k * ring,
            borderRadius: 999,
            border: `${2.5 * k}px solid ${C.lime}`,
            opacity: 1 - ring,
          }}
        />
      )}
      <svg
        width={46 * k}
        height={46 * k}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: -4 * k,
          top: -2 * k,
          transform: `scale(${1 - tap * 0.14})`,
          transformOrigin: '20% 10%',
          filter: `drop-shadow(0 ${4 * k}px ${8 * k}px rgba(0,0,0,0.45))`,
        }}
      >
        <path d="M4 2.5l15 8.2-6.6 1.6 3.6 7.3-2.7 1.3-3.6-7.3L4.8 18z" fill="#fff" stroke="#0A0D0B" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
