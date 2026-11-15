import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CHAT, CRM_COLUMNS, FOLLOWUPS, PROFILE, SECTIONS} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog, range} from '../lib/anim';
import {Phone, PHONE_H, PHONE_W} from '../components/Phone';
import {GlassCard} from '../components/GlassCard';
import {Icon} from '../components/Icon';
import {Kicker, KineticText} from '../components/KineticText';

const fr = (s: number) => Math.round(s * 30);

/** Keyframed value with an eased move between each pair of keys. */
const keyed = (frame: number, ts: number[], vs: number[]) => {
  for (let i = 0; i < ts.length - 1; i++) {
    const a = fr(ts[i]);
    const b = fr(ts[i + 1]);
    if (frame <= b || i === ts.length - 2) {
      return interpolate(frame, [a, b], [vs[i], vs[i + 1]], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: i === 0 ? ease.out : ease.inOut,
      });
    }
  }
  return vs[vs.length - 1];
};

// Phone camera: centre x, centre y, scale.
const PK = {
  t: [0, 0.8, 10.9, 11.6, 16.8, 17.5, 22.3, 23.0],
  x: [540, 540, 540, 320, 320, 190, 190, 540],
  y: [2300, 1185, 1185, 1185, 1185, 790, 790, 1255],
  s: [1, 1, 1, 0.8, 0.8, 0.4, 0.4, 0.9],
};

const Headers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SECTIONS.map((s, i) => {
        const a = fr(s.from);
        const b = fr(s.to);
        if (frame < a - 2 || frame > b + 14) return null;
        const last = i === SECTIONS.length - 1;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <Kicker text={s.chip} start={a + 2} exitAt={last ? undefined : b - 8} />
            </div>
            <div style={{position: 'absolute', top: 232, left: 0, right: 0}}>
              <KineticText lines={s.lines} start={a + 5} stagger={3} size={94} exitAt={last ? undefined : b - 10} exitDur={10} />
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The hand that taps the menu option (phone-local coordinates). */
const Hand: React.FC<{t: number}> = ({t}) => {
  const frame = fr(t);
  const tap = fr(5.3);
  const inP = prog(frame, tap - 20, 18, ease.out);
  const outP = prog(frame, tap + 12, 14, ease.in);
  if (inP <= 0 || outP >= 1) return null;
  const press = prog(frame, tap - 3, 3) * (1 - prog(frame, tap + 1, 6));
  const x = mix(inP, 620, 330) + outP * 300;
  const y = mix(inP, 1350, 1008) + outP * 300;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-30%, -8%) scale(${1 - press * 0.15}) rotate(-12deg)`,
        filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.5))',
        opacity: 1 - outP,
      }}
    >
      <Icon name="index_pointing_up" size={130} />
    </div>
  );
};

const ProfileCard: React.FC<{t: number}> = ({t}) => {
  const frame = fr(t);
  const enter = prog(frame, fr(11.0), 16, ease.out);
  if (enter <= 0) return null;
  // fly into the Mentorship column of the CRM board
  const fly = prog(frame, fr(17.2), 22, ease.inOut);
  const exit = prog(frame, fr(22.2), 10, ease.in);
  const x = mix(fly, 630, 392) + (1 - enter) * 300;
  const y = mix(fly, 905, 1305);
  const s = mix(fly, 1, 0.735);
  const hot = prog(frame, fr(18.2), 10, ease.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 410,
        transformOrigin: '0 0',
        transform: `scale(${s})`,
        opacity: enter * (1 - exit),
      }}
    >
      <GlassCard radius={30} strong glow={0.35 + hot * 0.5} style={{padding: '26px 26px 18px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.body}}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 99,
              background: 'linear-gradient(135deg, #3A6EA5, #1D3B5E)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            RS
          </div>
          <div style={{flex: 1}}>
            <div style={{color: C.white, fontWeight: 700, fontSize: 30}}>Lead Profile</div>
            <div style={{color: C.green, fontWeight: 600, fontSize: 21, marginTop: 2}}>● Auto-captured</div>
          </div>
        </div>
        <div style={{height: 1, background: C.stroke, margin: '20px 0 8px'}} />
        {PROFILE.map((p, i) => {
          const fill = prog(frame, fr(p.at), 12, ease.out);
          return (
            <div key={i} style={{padding: '12px 0', fontFamily: F.body, borderBottom: i < PROFILE.length - 1 ? `1px solid ${C.stroke}` : undefined}}>
              <div style={{color: C.grey, fontWeight: 600, fontSize: 21, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{p.label}</div>
              <div style={{position: 'relative', height: 42, marginTop: 4}}>
                <div style={{position: 'absolute', inset: '8px 0', borderRadius: 8, background: 'rgba(255,255,255,0.05)', opacity: 1 - fill}} />
                <div
                  style={{
                    color: C.white,
                    fontWeight: 700,
                    fontSize: 32,
                    whiteSpace: 'nowrap',
                    clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`,
                  }}
                >
                  {p.value}
                </div>
              </div>
            </div>
          );
        })}
      </GlassCard>
      {hot > 0 && (
        <div
          style={{
            position: 'absolute',
            right: -18,
            top: -22,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 999,
            background: C.red,
            color: 'white',
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: '0.06em',
            transform: `scale(${mix(hot, 1.8, 1)}) rotate(${mix(hot, -18, 6)}deg)`,
            opacity: hot,
            boxShadow: `0 0 30px ${C.redGlow}`,
          }}
        >
          <Icon name="fire" size={34} />
          HOT
        </div>
      )}
    </div>
  );
};

const CrmBoard: React.FC<{t: number}> = ({t}) => {
  const frame = fr(t);
  const enter = prog(frame, fr(17.0), 16, ease.out);
  const exit = prog(frame, fr(22.2), 10, ease.in);
  if (enter <= 0 || exit >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 1130,
        display: 'flex',
        gap: 20,
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 120 + exit * 60}px)`,
      }}
    >
      {CRM_COLUMNS.map((col, ci) => {
        const cp = prog(frame, fr(17.0) + ci * 3, 16, ease.out);
        const bump = ci === 1 ? prog(frame, fr(18.1), 12) : 0;
        return (
          <div key={ci} style={{flex: 1, opacity: cp, transform: `translateY(${(1 - cp) * 40}px)`}}>
            <div
              style={{
                height: 660,
                borderRadius: 26,
                background: 'rgba(255,255,255,0.035)',
                border: `1px solid ${ci === 1 ? `rgba(248,198,74,${0.2 + bump * 0.4})` : C.stroke}`,
                padding: 12,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 14px', fontFamily: F.body}}>
                <Icon name={col.icon} size={34} />
                <div style={{flex: 1, color: C.white, fontWeight: 700, fontSize: 25}}>{col.title}</div>
                <div style={{color: C.gold, fontWeight: 800, fontSize: 24}}>{col.count + (ci === 1 ? Math.round(bump) : 0)}</div>
              </div>
              {col.cards.map((name, k) => (
                <div
                  key={k}
                  style={{
                    marginBottom: 12,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${C.stroke}`,
                    padding: '16px 16px',
                    fontFamily: F.body,
                  }}
                >
                  <div style={{color: C.white, fontWeight: 700, fontSize: 25}}>{name}</div>
                  <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                    <div style={{height: 10, width: 90, borderRadius: 9, background: 'rgba(255,255,255,0.12)'}} />
                    <div style={{height: 10, width: 50, borderRadius: 9, background: 'rgba(255,255,255,0.08)'}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Followups: React.FC<{t: number}> = ({t}) => {
  const frame = fr(t);
  const enter = prog(frame, fr(17.5), 16, ease.out);
  const exit = prog(frame, fr(22.2), 10, ease.in);
  if (enter <= 0 || exit >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 390,
        right: 40,
        top: 540,
        opacity: enter * (1 - exit),
        transform: `translateX(${(1 - enter) * 120}px)`,
      }}
    >
      <GlassCard radius={30} style={{padding: '24px 26px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.body, color: C.white, fontWeight: 700, fontSize: 29, marginBottom: 10}}>
          <Icon name="alarm_clock" size={40} />
          Auto follow-ups
        </div>
        {FOLLOWUPS.map((x, i) => {
          const p = prog(frame, fr(x.at), 12, ease.out);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', fontFamily: F.body, borderTop: `1px solid ${C.stroke}`}}>
              <div
                style={{
                  width: 104,
                  padding: '6px 0',
                  borderRadius: 12,
                  textAlign: 'center',
                  background: C.goldSoft,
                  color: C.gold,
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {x.day}
              </div>
              <div style={{flex: 1, color: C.white, fontWeight: 600, fontSize: 25, opacity: mix(p, 0.45, 1)}}>{x.text}</div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  display: 'grid',
                  placeItems: 'center',
                  background: p > 0.05 ? C.green : 'rgba(255,255,255,0.08)',
                  transform: `scale(${mix(p, 0.6, 1)})`,
                }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24" style={{opacity: p}}>
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#05261A" strokeWidth={3.4} fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
};

const ScoreMeter: React.FC<{t: number}> = ({t}) => {
  const frame = fr(t);
  const enter = prog(frame, fr(22.9), 14, ease.out);
  if (enter <= 0) return null;
  const fill = range(frame, [fr(23.5), fr(24.3)], [0.38, 0.92], ease.inOut);
  const serious = prog(frame, fr(24.1), 10, ease.out);
  const col = serious > 0.5 ? C.red : C.gold;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 470, opacity: enter, transform: `translateY(${(1 - enter) * -30}px)`}}>
      <GlassCard radius={28} glow={serious * 0.6} style={{padding: '20px 28px'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: F.body, marginBottom: 14}}>
          <div style={{color: C.grey, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em'}}>LEAD SCORE · RAHUL</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, color: col, fontFamily: F.display, fontWeight: 900, fontSize: 34}}>
            {serious > 0.5 && <Icon name="fire" size={36} style={{transform: `scale(${mix(serious, 1.6, 1)})`}} />}
            {serious > 0.5 ? 'SERIOUS' : 'WARM'} · {Math.round(fill * 100)}
          </div>
        </div>
        <div style={{height: 22, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
          <div
            style={{
              width: `${fill * 100}%`,
              height: '100%',
              borderRadius: 99,
              background: `linear-gradient(90deg, ${C.gold}, ${serious > 0.5 ? C.red : C.goldDeep})`,
              boxShadow: `0 0 20px ${serious > 0.5 ? C.redGlow : C.goldGlow}`,
            }}
          />
        </div>
      </GlassCard>
    </div>
  );
};

export const S3Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x = keyed(frame, PK.t, PK.x);
  const y = keyed(frame, PK.t, PK.y);
  const s = keyed(frame, PK.t, PK.s);
  const tilt = range(frame, [0, fr(0.8)], [16, 0], ease.out);
  return (
    <AbsoluteFill>
      <Headers />
      <div
        style={{
          position: 'absolute',
          left: x - PHONE_W / 2,
          top: y - PHONE_H / 2,
          width: PHONE_W,
          height: PHONE_H,
          transform: `perspective(2400px) rotateX(${tilt}deg) scale(${s})`,
        }}
      >
        <Phone t={t} msgs={CHAT} agentMode={t >= 24.4} />
        <Hand t={t} />
      </div>
      <CrmBoard t={t} />
      <Followups t={t} />
      <ProfileCard t={t} />
      <ScoreMeter t={t} />
    </AbsoluteFill>
  );
};
