import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CHAPTERS, SCENES} from '../config';
import {C, F} from '../theme';
import {ease, prog} from '../lib/anim';

/** Chapter progress rail at the bottom: five segments, the current one fills in orange. */
export const Rail: React.FC = () => {
  const frame = useCurrentFrame();
  const show = prog(frame, SCENES.intro.from + 75, 18, ease.out) * (1 - prog(frame, SCENES.outro.from + 4, 14, ease.in));
  if (show <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 110, right: 110, bottom: 108, display: 'flex', gap: 14, opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
      {CHAPTERS.map((c, i) => {
        const sc = SCENES[c.id];
        const fill = prog(frame, sc.from, sc.dur, (x) => x);
        const active = frame >= sc.from && frame < sc.from + sc.dur;
        const appear = prog(frame, SCENES.intro.from + 75 + i * 4, 14, ease.out);
        return (
          <div key={c.id} style={{flex: 1, opacity: appear}}>
            <div style={{height: 5, borderRadius: 9, background: C.line, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: active ? C.accent : C.ink, opacity: active ? 1 : 0.55, boxShadow: active ? `0 0 14px ${C.accentGlow}` : undefined}} />
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: F.body,
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                color: active ? C.accent : C.muted,
                display: 'flex',
                gap: 8,
              }}
            >
              <span style={{fontFamily: F.serif, fontSize: 24, letterSpacing: 0, marginTop: -4}}>0{i + 1}</span>
              {c.short}
            </div>
          </div>
        );
      })}
    </div>
  );
};
