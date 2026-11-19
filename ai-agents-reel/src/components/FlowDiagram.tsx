import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {GlassCard} from './GlassCard';
import {Icon, IconName} from './Icons';

export type FlowNode = {label: string; icon?: IconName; logo?: boolean};

type Props = {
  nodes: FlowNode[];
  start?: number;
  step?: number | number[]; // frames between nodes, or explicit per-node start offsets
  width?: number;
  nodeH?: number;
  gap?: number;
  fontSize?: number;
  numbered?: boolean;
  exitAt?: number;
};

/**
 * Vertical step flow. Each node lands, then the connector draws down to the next
 * with a glowing pulse travelling along it. The newest node holds the accent.
 */
export const FlowDiagram: React.FC<Props> = ({
  nodes,
  start = 0,
  step = 16,
  width = 720,
  nodeH = 112,
  gap = 54,
  fontSize = 38,
  numbered = false,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const startOf = (i: number) => start + (Array.isArray(step) ? step[i] : i * step);
  const e = exitAt === undefined ? 0 : prog(frame, exitAt, 14, ease.in);

  return (
    <div style={{position: 'relative', width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>
      {nodes.map((n, i) => {
        const s = startOf(i);
        const p = prog(frame, s, 16, ease.out);
        const next = i < nodes.length - 1 ? startOf(i + 1) : Infinity;
        const active = frame >= s && frame < next + 4;
        const act = active ? prog(frame, s + 4, 10) : 0;
        const done = frame >= next + 4;
        const ex = e > 0 ? prog(frame, exitAt! + i * 2, 12, ease.in) : 0;

        // connector below this node
        const cs = s + 8;
        const ce = Math.min(next, cs + 14);
        const cp = i < nodes.length - 1 ? prog(frame, cs, Math.max(4, ce - cs), ease.inOut) : 0;

        return (
          <div key={i} style={{position: 'relative', width: '100%', height: nodeH}}>
            <div
              style={{
                opacity: p * (1 - ex),
                transform: `translateY(${(1 - p) * 40 - ex * 30}px) scale(${mix(p, 0.92, 1) * (1 + act * 0.02)})`,
                filter: `blur(${(1 - p) * 10 + ex * 10}px)`,
              }}
            >
              <GlassCard
                radius={nodeH / 2.6}
                glow={act}
                strong={active}
                style={{
                  height: nodeH,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${nodeH * 0.3}px 0 ${nodeH * 0.14}px`,
                  gap: 26,
                }}
              >
                <div
                  style={{
                    width: nodeH * 0.72,
                    height: nodeH * 0.72,
                    borderRadius: nodeH,
                    flex: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    background: active || done ? 'rgba(194,255,61,0.14)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${active || done ? 'rgba(194,255,61,0.4)' : C.stroke}`,
                    overflow: 'hidden',
                  }}
                >
                  {n.logo ? (
                    <Img src={staticFile(BRAND.logo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <Icon name={n.icon ?? 'bolt'} size={nodeH * 0.36} color={active || done ? C.lime : C.white} />
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: F.display,
                    fontWeight: 800,
                    fontSize,
                    letterSpacing: '0.01em',
                    color: active ? C.white : done ? 'rgba(244,247,241,0.75)' : C.white,
                  }}
                >
                  {n.label}
                </div>
                {numbered && (
                  <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 24, color: active ? C.lime : C.grey2}}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}
                {done && !numbered && <Icon name="check" size={34} color={C.lime} stroke={2.4} />}
              </GlassCard>
            </div>

            {i < nodes.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: nodeH + 6,
                  width: 3,
                  height: gap - 12,
                  marginLeft: -1.5,
                  opacity: 1 - ex,
                }}
              >
                <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 3}} />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: `${cp * 100}%`,
                    background: `linear-gradient(180deg, rgba(194,255,61,0.2), ${C.lime})`,
                    borderRadius: 3,
                    boxShadow: `0 0 12px ${C.limeGlow}`,
                  }}
                />
                {cp > 0 && cp < 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: -6,
                      top: `calc(${cp * 100}% - 7px)`,
                      width: 15,
                      height: 15,
                      borderRadius: 99,
                      background: C.lime,
                      boxShadow: `0 0 18px ${C.lime}, 0 0 40px ${C.limeGlow}`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
