import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, TOTAL_FRAMES} from '../config';
import {C, F} from '../theme';
import {prog} from '../lib/anim';

const M = 46;
const L = 46;

/** Editorial frame: corner marks, series name, running timecode. Sits above everything. */
export const Frame: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 2, 20);
  const out = prog(frame, TOTAL_FRAMES - 30, 20);
  const corner = (style: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, ...style}} />;
  const b = `2px solid ${C.lineStrong}`;
  const secs = frame / 30;
  const tc = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{opacity: p * (1 - out), pointerEvents: 'none'}}>
      {corner({left: M, top: M, borderLeft: b, borderTop: b})}
      {corner({right: M, top: M, borderRight: b, borderTop: b})}
      {corner({left: M, bottom: M, borderLeft: b, borderBottom: b})}
      {corner({right: M, bottom: M, borderRight: b, borderBottom: b})}
      <div style={{position: 'absolute', top: M + 12, left: M + 66, fontFamily: F.body, fontWeight: 600, fontSize: 20, letterSpacing: '0.28em', color: C.muted}}>
        {BRAND.series}
      </div>
      <div style={{position: 'absolute', top: M + 12, right: M + 66, fontFamily: F.body, fontWeight: 600, fontSize: 20, letterSpacing: '0.2em', color: C.muted, display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{width: 10, height: 10, borderRadius: 99, background: C.accent, opacity: Math.floor(frame / 15) % 2 ? 1 : 0.35}} />
        {tc}
      </div>
    </AbsoluteFill>
  );
};
