import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {rand} from '../lib/anim';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

const CANDLE_W = 36;
const N = 70;

/** Deterministic random-walk price series → candles. */
const useCandles = () =>
  useMemo(() => {
    let price = 0;
    return Array.from({length: N}).map((_, i) => {
      const open = price;
      const drift = (rand(i * 3.1 + 1) - 0.45) * 90;
      const close = open + drift;
      const hi = Math.max(open, close) + rand(i * 7.7 + 2) * 40;
      const lo = Math.min(open, close) - rand(i * 5.3 + 3) * 40;
      price = close;
      return {open, close, hi, lo};
    });
  }, []);

/** Persistent stage: navy gradient, a faint candlestick chart drifting left, slow gold glow, grain, vignette. */
export const Background: React.FC<{chartOpacity?: number}> = ({chartOpacity = 1}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const candles = useCandles();
  const shift = (frame * 1.1) % (CANDLE_W * 20);
  const gx = 540 + Math.sin(t * 0.33) * 280;
  const gy = 720 + Math.cos(t * 0.26) * 320;
  const gx2 = 540 + Math.cos(t * 0.21 + 1) * 380;
  const gy2 = 1480 + Math.sin(t * 0.3) * 200;
  const minP = Math.min(...candles.map((c) => c.lo));
  const maxP = Math.max(...candles.map((c) => c.hi));
  const y = (p: number) => 1500 - ((p - minP) / (maxP - minP)) * 1000;

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 55%, ${C.bg} 100%)`}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(640px 640px at ${gx}px ${gy}px, rgba(248,198,74,0.10), transparent 70%),
                       radial-gradient(560px 560px at ${gx2}px ${gy2}px, rgba(46,229,157,0.06), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.16 * chartOpacity,
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, black 20%, transparent 80%)',
        }}
      >
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[300, 600, 900, 1200, 1500].map((gyLine) => (
            <line key={gyLine} x1={0} x2={1080} y1={gyLine} y2={gyLine} stroke="white" strokeOpacity={0.25} strokeDasharray="4 10" />
          ))}
          <g transform={`translate(${-shift}, 0)`}>
            {candles.map((c, i) => {
              const x = i * CANDLE_W + 10;
              const up = c.close >= c.open;
              const col = up ? C.green : C.red;
              const top = y(Math.max(c.open, c.close));
              const bot = y(Math.min(c.open, c.close));
              return (
                <g key={i}>
                  <line x1={x + 11} x2={x + 11} y1={y(c.hi)} y2={y(c.lo)} stroke={col} strokeWidth={3} />
                  <rect x={x} y={top} width={22} height={Math.max(4, bot - top)} rx={3} fill={col} />
                </g>
              );
            })}
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};
