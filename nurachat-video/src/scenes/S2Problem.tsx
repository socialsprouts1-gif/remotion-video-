import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COPY} from '../config';
import {C, F} from '../theme';
import {KineticText} from '../components/KineticText';
import {NotificationCard} from '../components/NotificationCard';
import {ease, mix, prog, rand, velBlur} from '../lib/anim';

const POP = [4, 11, 17, 23, 29, 35, 41, 47]; // matches the pop sounds in config.SFX
const Q_AT = 58;
const NO_AT = 98;

/** 4–8.5s. Notifications pile up, "Har message ka manually reply?", then NO MORE blows them away. */
export const S2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const dimForQ = prog(frame, Q_AT - 4, 14);
  const blast = prog(frame, NO_AT, 16, ease.out);
  // short camera punch on impact
  const punch = frame >= NO_AT ? Math.exp(-(frame - NO_AT) / 4) * Math.sin((frame - NO_AT) * 1.9) * 10 : 0;
  const counter = POP.filter((f) => frame >= f).length;

  return (
    <AbsoluteFill style={{transform: `translate(${punch}px, ${punch * 0.6}px)`}}>
      {/* the pile */}
      <AbsoluteFill style={{alignItems: 'center'}}>
        {COPY.notifications.map((n, i) => {
          const s = POP[i];
          const p = (f: number) => prog(f, s, 14, ease.out);
          const pushDown = POP.filter((f, j) => j > i && frame >= f).length; // newer cards push older ones down
          const settle = (fr: number) => {
            let y = 0;
            POP.forEach((f, j) => {
              if (j > i) y += prog(fr, f, 12, ease.out) * 146;
            });
            return y;
          };
          const yBase = 250 + settle(frame);
          const yIn = (1 - p(frame)) * -120;
          const sc = mix(p(frame), 0.9, 1) * (1 - pushDown * 0.025);
          const rz = (rand(i + 2) - 0.5) * 3;
          const xOff = (rand(i + 9) - 0.5) * 40;
          // NO MORE: cards scatter outward with blur
          const dir = rand(i + 4) > 0.5 ? 1 : -1;
          const bx = blast * dir * (700 + rand(i) * 400);
          const by = blast * (rand(i + 1) - 0.5) * 600;
          const blur = velBlur((fr) => settle(fr) + (1 - p(fr)) * -120, frame, 0.12) + blast * 20 + dimForQ * 3;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: yBase + yIn + by,
                transform: `translateX(${xOff + bx}px) rotate(${rz + blast * dir * 25}deg) scale(${sc})`,
                opacity: p(frame) * (1 - blast) * mix(dimForQ, 1, 0.3) * (1 - pushDown * 0.07),
                filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                zIndex: i,
              }}
            >
              <NotificationCard name={n.name} text={n.text} time={i === COPY.notifications.length - 1 ? 'now' : `${Math.max(1, 7 - i)}m`} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* unread counter */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          right: 110,
          minWidth: 96,
          height: 96,
          padding: '0 22px',
          borderRadius: 99,
          background: '#FF3B30',
          color: '#fff',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 46,
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 10px 30px rgba(255,59,48,0.45)',
          opacity: prog(frame, 4, 8) * (1 - blast),
          transform: `scale(${1 + (counter > 0 ? Math.max(0, 1 - (frame - POP[counter - 1]) / 6) * 0.18 : 0)})`,
        }}
      >
        {counter >= 8 ? '99+' : counter * 7 + 5}
      </div>

      {/* question */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(5,6,5,${dimForQ * 0.55})`}}>
        <KineticText lines={COPY.problemQ} start={Q_AT} size={124} stagger={4} exitAt={NO_AT - 8} exitDur={8} exitMode="blur" lineHeight={1.05} />
      </AbsoluteFill>

      {/* NO MORE */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: 999,
            background: `radial-gradient(circle, rgba(194,255,61,${frame < NO_AT ? 0 : 0.3 * (1 - prog(frame, NO_AT, 24))}) 0%, transparent 60%)`,
            transform: `scale(${mix(blast, 0.3, 1.6)})`,
          }}
        />
        <KineticText lines={[COPY.problemNo]} start={NO_AT} mode="scale" size={188} dur={10} letterSpacing="-0.05em" />
        <div
          style={{
            marginTop: 10,
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: '0.24em',
            color: C.grey,
            opacity: prog(frame, NO_AT + 10, 12),
          }}
        >
          AB SAB AUTOMATIC
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
