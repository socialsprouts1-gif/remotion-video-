import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {REVIEWS, cue, wordAt} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon} from '../components/BrandIcon';
import {Stage} from '../three/Stage';
import {Bubble3D, Card3D, Coin3D, Logo3D, Phone, Shadow, Star3D} from '../three/kit';

const fr = (s: number) => Math.round(s * 30);
/** Spin-in for a 3D hero: drops from above, turns to face the camera, keeps a gentle float. */
const spinIn = (f: number, at: number) => {
  const k = prog(f, at, 22, ease.out);
  return {k, ry: mix(k, Math.PI * 1.2, 0) + Math.sin(f / 30) * 0.18, dy: mix(k, 1.2, 0) + Math.sin(f / 24) * 0.04, s: mix(k, 0.2, 1)};
};

const Pill: React.FC<{show: number; children: React.ReactNode; green?: boolean; style?: React.CSSProperties}> = ({show, children, green, style}) => (
  <div
    style={{
      position: 'absolute',
      padding: '14px 24px',
      borderRadius: 999,
      background: green ? C.accent : '#FFFFFF',
      color: green ? '#FFFFFF' : C.ink,
      fontFamily: F.display,
      fontWeight: 800,
      fontSize: 32,
      boxShadow: SHADOW.card,
      opacity: show,
      transform: `translateY(${(1 - show) * 30}px) scale(${mix(show, 0.9, 1)})`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/* 01 · WhatsApp auto-reply */
export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const fast = fr(wordAt('s1', 1, 'turant'));
  const allday = fr(wordAt('s1', 1, '24'));
  const phoneIn = prog(f, 22, 22, ease.out);
  const logo = spinIn(f, 30);
  const b1 = prog(f, fast + 4, 14, ease.out);
  const b2 = prog(f, fast + 16, 14, ease.out);
  return (
    <AbsoluteFill>
      <Stage>
        <group position={[-0.48, mix(phoneIn, -2.6, -0.2), 0]} rotation={[-0.08, 0.28 + Math.sin(f / 55) * 0.05, 0]} scale={0.8}>
          <Phone screen="tex/s1a.png" screen2="tex/s1b.png" mix2={prog(f, fast, 10)} />
        </group>
        <Shadow position={[-0.48, -1.12, -0.2]} w={1.6} d={0.5} opacity={phoneIn} />
        <Logo3D url="icons/whatsapp-icon.svg" size={0.66} depth={0.09} position={[0.5, 0.52 + logo.dy, 0.3]} rotation={[0, logo.ry, 0]} scale={logo.s} />
        {b1 > 0 && <Bubble3D green position={[0.52, mix(b1, 0.2, -0.3), 0.45]} rotation={[0, -0.3, 0]} scale={mix(b1, 0.1, 0.42)} />}
        {b2 > 0 && <Bubble3D dots position={[0.55, mix(b2, -0.3, -0.78), 0.45]} rotation={[0, -0.3, 0]} scale={mix(b2, 0.1, 0.36)} />}
      </Stage>
      <ChapterHeader n={1} start={4} />
      <Pill show={prog(f, fast + 8, 12, ease.out)} green style={{right: 70, top: 1250}}>
        Reply in 3 sec
      </Pill>
      <Pill show={prog(f, allday, 12, ease.out)} style={{right: 70, top: 1350}}>
        24 × 7 · 365 din
      </Pill>
    </AbsoluteFill>
  );
};

/* 02 · Lead follow-up */
const STEPS = [
  {icon: 'icons/meta-icon.svg', x: -0.66, label: 'Ad se lead', sub: 'Instagram ad', word: null as string | null},
  {icon: 'icons/whatsapp-icon.svg', x: 0, label: '2 min · Day 3', sub: 'WhatsApp follow-up', word: 'whatsapp'},
  {icon: 'icons/google-gmail.svg', x: 0.66, label: 'Day 1', sub: 'Email + catalogue', word: 'email'},
];
export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const l1 = fr(cue('s2', 1));
  const end = fr(cue('s2', 1, 'end'));
  const ats = STEPS.map((s) => (s.word ? fr(wordAt('s2', 1, s.word)) - 4 : l1));
  const line = prog(f, ats[1], ats[2] - ats[1] + 10, ease.inOut);
  const reply = prog(f, end - 6, 14, ease.out);
  return (
    <AbsoluteFill>
      <Stage>
        {STEPS.map((s, i) => {
          const sp = spinIn(f, ats[i]);
          if (sp.k <= 0) return null;
          return <Logo3D key={i} url={s.icon} size={0.48} depth={0.08} position={[s.x, 0.4 + sp.dy, 0.2]} rotation={[0, sp.ry, 0]} scale={sp.s} />;
        })}
        <Shadow position={[0, -0.1, -0.3]} w={3.2} d={0.5} opacity={0.6} />
      </Stage>
      <ChapterHeader n={2} start={4} />
      {/* connector */}
      <div style={{position: 'absolute', left: 200, right: 200, top: 755, height: 4, borderRadius: 4, background: C.line}}>
        <div style={{width: `${line * 100}%`, height: '100%', borderRadius: 4, background: C.accent}} />
      </div>
      {STEPS.map((s, i) => {
        const p = prog(f, ats[i] + 8, 12, ease.out);
        return (
          <div key={i} style={{position: 'absolute', top: 960, left: 540 + s.x * 512 - 160, width: 320, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, fontFamily: F.body}}>
            <div style={{fontWeight: 800, fontSize: 30, color: i === 0 ? C.ink : C.accent}}>{s.label}</div>
            <div style={{fontWeight: 500, fontSize: 24, color: C.muted, marginTop: 4}}>{s.sub}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 150, right: 150, top: 1130, opacity: prog(f, l1, 14, ease.out)}}>
        <div style={{background: '#fff', borderRadius: 24, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: SHADOW.card, fontFamily: F.body}}>
          <div style={{width: 64, height: 64, borderRadius: 99, background: '#EEF0EE', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 28, color: C.ink}}>P</div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 30, color: C.ink}}>Priya Verma</div>
            <div style={{fontSize: 23, color: C.muted}}>2BHK interior quote · Jaipur</div>
          </div>
          <div style={{padding: '8px 14px', borderRadius: 999, background: reply > 0.5 ? C.accent : '#EEF0EE', color: reply > 0.5 ? '#fff' : C.muted, fontWeight: 800, fontSize: 22}}>{reply > 0.5 ? 'Replied ✓' : 'New lead'}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 230, right: 150, top: 1290, opacity: reply, transform: `translateY(${(1 - reply) * 20}px)`}}>
        <div style={{background: '#D9FDD3', borderRadius: 18, borderTopLeftRadius: 4, padding: '16px 22px', fontFamily: F.body, fontWeight: 600, fontSize: 28, color: '#111B21', display: 'flex', alignItems: 'center', gap: 12, boxShadow: SHADOW.card}}>
          <BrandIcon name="whatsapp" size={34} />
          "Haan, Saturday 11 baje theek hai"
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 03 · Appointment booking */
export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const slot = fr(wordAt('s3', 1, 'slot'));
  const conf = fr(wordAt('s3', 1, 'confirm'));
  const rem = fr(wordAt('s3', 1, 'reminder'));
  const phoneIn = prog(f, 22, 22, ease.out);
  const cal = spinIn(f, 30);
  const flip = prog(f, conf, 16, ease.out);
  const note = prog(f, rem, 12, ease.out);
  return (
    <AbsoluteFill>
      <Stage>
        <group position={[0.5, mix(phoneIn, -2.6, -0.2), 0]} rotation={[-0.08, -0.28 + Math.sin(f / 55) * 0.05, 0]} scale={0.8}>
          <Phone screen="tex/s3a.png" screen2="tex/s3b.png" mix2={prog(f, conf - 6, 10)} />
        </group>
        <Shadow position={[0.5, -1.12, -0.2]} w={1.6} d={0.5} opacity={phoneIn} />
        <Card3D img="tex/cal.png" w={0.8} h={0.8} r={0.1} d={0.2} position={[-0.56, 0.32 + cal.dy, 0.35]} rotation={[mix(flip, 0, Math.PI * 2) * 0, cal.ry * 0.7 + 0.3, 0]} scale={cal.s * (1 + Math.sin(flip * Math.PI) * 0.12)} />
        <Shadow position={[-0.56, -0.25, 0]} w={1.1} d={0.35} opacity={cal.k * 0.8} />
      </Stage>
      <ChapterHeader n={3} start={4} />
      <Pill show={prog(f, slot + 6, 12, ease.out)} style={{left: 70, top: 1000}}>
        Slot: Sat 11:00 AM
      </Pill>
      <Pill show={prog(f, conf, 12, ease.out)} green style={{left: 70, top: 1100}}>
        Booking confirmed ✓
      </Pill>
      <div style={{position: 'absolute', left: 70, width: 560, top: 1220, opacity: note, transform: `translateY(${(1 - note) * 30}px)`}}>
        <div style={{background: '#fff', borderRadius: 24, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: SHADOW.card, fontFamily: F.body}}>
          <BrandIcon name="whatsapp" size={46} />
          <div>
            <div style={{fontSize: 20, color: C.muted, fontWeight: 600}}>Reminder · Fri 6:00 PM</div>
            <div style={{fontWeight: 700, fontSize: 25, color: C.ink}}>Kal 11 AM aapka appointment hai</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 04 · Review request */
export const S4: React.FC = () => {
  const f = useCurrentFrame();
  const l1 = fr(cue('s4', 1));
  const goog = fr(wordAt('s4', 1, 'google'));
  const up = fr(wordAt('s4', 1, 'badhte'));
  const g = spinIn(f, 26);
  const phoneIn = prog(f, l1 - 6, 20, ease.out);
  const grow = prog(f, up, 40, ease.inOut);
  return (
    <AbsoluteFill>
      <Stage>
        <Logo3D url="icons/google-g.svg" size={0.62} depth={0.09} position={[-0.42, 0.55 + g.dy, 0.3]} rotation={[0, g.ry, 0]} scale={g.s} />
        {[0, 1, 2, 3, 4].map((i) => {
          const k = prog(f, goog - 8 + i * 4, 14, ease.out);
          if (k <= 0) return null;
          const a = Math.PI * (0.95 - i * 0.225);
          return <Star3D key={i} position={[-0.42 + Math.cos(a) * 0.4, Math.sin(a) * 0.12 - 0.08, 0.4]} rotation={[0, mix(k, Math.PI, 0) + Math.sin((f + i * 9) / 20) * 0.2, 0]} scale={mix(k, 0.1, 0.21)} />;
        })}
        <group position={[0.55, mix(phoneIn, -2.6, -0.2), 0]} rotation={[-0.08, -0.3 + Math.sin(f / 55) * 0.05, 0]} scale={0.78}>
          <Phone screen="tex/s4a.png" screen2="tex/s4b.png" mix2={prog(f, goog, 10)} />
        </group>
        <Shadow position={[0.55, -1.1, -0.2]} w={1.6} d={0.5} opacity={phoneIn} />
      </Stage>
      <ChapterHeader n={4} start={4} />
      <div style={{position: 'absolute', left: 70, width: 520, top: 1110, opacity: prog(f, goog, 14, ease.out)}}>
        <div style={{background: '#fff', borderRadius: 24, padding: '20px 22px', boxShadow: SHADOW.card, fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: C.muted, fontWeight: 600}}>
            <BrandIcon name="google" size={28} /> Google Reviews
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6}}>
            <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 72, color: C.ink}}>{mix(grow, 4.6, 4.9).toFixed(1)}</span>
            <span style={{fontSize: 24, color: C.muted}}>{Math.round(mix(grow, 128, 212))} reviews</span>
          </div>
          <div style={{marginTop: 6, display: 'inline-block', padding: '6px 14px', borderRadius: 999, background: C.accentSoft, color: C.accent, fontWeight: 800, fontSize: 22, opacity: grow}}>+{Math.round(mix(grow, 0, 84))} is mahine</div>
          <div style={{marginTop: 10, fontSize: 23, color: C.ink, fontWeight: 600, opacity: prog(f, up + 20, 12)}}>“{REVIEWS[0].text}”</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 05 · Auto invoice + payment */
export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const l1 = fr(cue('s5', 1));
  const pay = fr(wordAt('s5', 1, 'payment'));
  const paid = fr(wordAt('s5', 1, 'bina'));
  const post = spinIn(f, 24);
  const phoneIn = prog(f, l1 - 4, 20, ease.out);
  const stamp = prog(f, paid, 10, ease.out);
  return (
    <AbsoluteFill>
      <Stage>
        <Card3D img="posts/p3.png" w={0.72} h={0.96} r={0.06} position={[-0.6, 0.38 + post.dy, 0.2]} rotation={[0, post.ry * 0.6 + 0.35, 0.05]} scale={post.s} />
        <group position={[0.5, mix(phoneIn, -2.6, -0.2), 0]} rotation={[-0.08, -0.28 + Math.sin(f / 55) * 0.05, 0]} scale={0.8}>
          <Phone screen="tex/s5a.png" screen2="tex/s5b.png" mix2={prog(f, paid - 4, 10)} />
        </group>
        <Shadow position={[0.5, -1.12, -0.2]} w={1.6} d={0.5} opacity={phoneIn} />
        {[0, 1, 2].map((i) => {
          const k = prog(f, pay + i * 6, 16, ease.in);
          if (k <= 0) return null;
          const land = -0.92 + i * 0.13;
          return <Coin3D key={i} face="tex/coin.png" position={[-0.6, mix(k, 2.4, land), 0.4]} rotation={[mix(k, 0, -1.25), mix(k, 3, 0.2), 0]} scale={0.42} />;
        })}
        <Shadow position={[-0.6, -1.1, 0.2]} w={0.9} d={0.3} opacity={prog(f, pay, 10)} />
      </Stage>
      <ChapterHeader n={5} start={4} />
      {stamp > 0 && (
        <div style={{position: 'absolute', right: 110, top: 1140, transform: `rotate(-8deg) scale(${mix(stamp, 1.8, 1)})`, opacity: stamp}}>
          <div style={{padding: '12px 28px', borderRadius: 14, border: `5px solid ${C.accent}`, color: C.accent, fontFamily: F.display, fontWeight: 900, fontSize: 52, letterSpacing: '0.06em', background: 'rgba(255,255,255,0.92)'}}>PAID ✓</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
