import React from 'react';
import {Img, staticFile} from 'remotion';
import {ease, lerp, pt, rand} from '../anim';
import {ChatBody, C, FONT, Kinetic, Label, Msg, Phone, Pill, sp, Stage, Typing, WaHeader, wt} from './kit';
import {Check} from '../ui';

export type SceneProps = {t: number; a: number; b: number; ci: number};
const W = (ci: number) => (i: number) => wt(ci, i);

// ---------------------------------------------------------------- 1. inquiries keep coming
export const Inbox: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const r = t - a;
  const names = ['Priya S.', 'Rahul Mehta', '+91 98xxx 21', 'Anjali', 'Vikram (Gym)', 'Sneha K.', '+91 70xxx 88', 'Arjun'];
  const msgs = ['Price kya hai?', 'Details bhejiye', 'Kab available ho?', 'Demo mil sakta hai?', 'Interested hoon', 'Location?', 'Hi', 'Booking karni hai'];
  const rate = 0.2;
  const count = Math.min(names.length, Math.floor(Math.max(0, r - 0.15) / rate) + 1);
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.1} text="NEW INQUIRIES" y={170} />
      {/* depth: bubbles flying past the camera */}
      {Array.from({length: 10}, (_, i) => {
        const z = ((r * 0.55 + i / 10) % 1);
        const s = 0.3 + z * 2.2;
        const x = 540 + (rand(i * 2.7) - 0.5) * 1400 * z;
        const y = 960 + (rand(i * 5.1) - 0.5) * 1800 * z;
        return (
          <div key={i} style={{position: 'absolute', left: x - 90 * s, top: y - 34 * s, width: 180 * s, height: 68 * s, borderRadius: 30 * s, background: i % 3 ? '#202C33' : '#005C4B', opacity: z < 0.85 ? z : (1 - z) * 6, filter: `blur(${Math.abs(z - 0.45) * 14}px)`}} />
        );
      })}
      <Phone y={1000} w={620} ry={lerp(-22, -8, pt(r, 0, b - a, ease.out))} rx={8} rz={lerp(-4, 0, pt(r, 0, 1, ease.out))} scale={lerp(0.85, 1, sp(t, a))} glow={0.6}>
        <div style={{height: 150, padding: '62px 26px 0', background: '#1F2C34', fontSize: 38, fontWeight: 700}}>WhatsApp</div>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0}}>
          {Array.from({length: count}, (_, k) => {
            const i = count - 1 - k; // newest on top
            const p = sp(t, a + 0.15 + i * rate, 240, 18);
            return (
              <div key={i} style={{height: 132, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', transform: `translateY(${(k === 0 ? (1 - Math.min(1, p)) * -132 : 0)}px)`, opacity: k === 0 ? Math.min(1, p * 2) : 1, background: k === 0 ? `rgba(37,211,102,${0.15 * (1 - Math.min(1, p))})` : undefined}}>
                <div style={{width: 72, height: 72, borderRadius: 72, background: `hsl(${rand(i * 9) * 360}, 25%, 38%)`, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 30}}>{names[i][0]}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 32, fontWeight: 600}}>{names[i]}</div>
                  <div style={{fontSize: 27, color: '#8696A0', whiteSpace: 'nowrap'}}>{msgs[i]}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: 18, color: C.wa}}>now</div>
                  <div style={{marginTop: 6, width: 34, height: 34, borderRadius: 34, background: C.wa, color: '#0B141A', fontWeight: 800, fontSize: 19, display: 'grid', placeItems: 'center', marginLeft: 'auto'}}>{1 + (i % 3)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Phone>
      {/* notification banners dropping over the phone */}
      {[0, 1, 2].map((i) => {
        const at = w(13) + i * 0.28;
        const p = sp(t, at, 260, 20);
        const out = pt(t, at + 0.9, at + 1.2, ease.in);
        if (p <= 0 || out >= 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 120 + i * 30, right: 120 - i * 30, top: 330 + i * 120, transform: `translateY(${(1 - Math.min(1, p)) * -200 - out * 80}px)`, opacity: Math.min(1, p * 2) * (1 - out), background: 'rgba(30,36,33,0.92)', borderRadius: 30, padding: '20px 26px', display: 'flex', gap: 18, alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: FONT, color: '#fff'}}>
            <div style={{width: 56, height: 56, borderRadius: 14, background: C.wa, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 26}}>W</div>
            <div>
              <div style={{fontSize: 22, color: '#aaa', fontWeight: 600}}>WhatsApp · now</div>
              <div style={{fontSize: 28, fontWeight: 600}}>{names[i + 3]}: {msgs[i + 3]}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- 2. the chat story, with a time-lapse
export const ChatStory: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const r = t - a;
  const lapseA = w(16) - 0.05;
  const lapseB = w(20) - 0.1;
  const lapse = pt(t, lapseA, lapseA + 0.3, ease.inOut) * (1 - pt(t, lapseB - 0.25, lapseB, ease.inOut));
  const enter = sp(t, a, 120, 18);
  const phoneY = lerp(1500, 1000, Math.min(1, enter));
  const inMsg = sp(t, w(5) + 0.1);
  const typing = t > w(1) && t < w(5) + 0.1;
  const outMsg = sp(t, w(20) + 0.05);
  const clockSpin = pt(t, lapseA, lapseB, ease.inOut) * 360 * 3;
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.15} text="A CUSTOMER MESSAGES YOU" y={170} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - lapse * 0.25})`, opacity: 1 - lapse * 0.85, filter: lapse > 0.02 ? `blur(${lapse * 18}px)` : undefined}}>
        <Phone y={phoneY} w={640} ry={lerp(18, 4, Math.min(1, enter)) + Math.sin(r * 0.8) * 2} rx={lerp(20, 4, Math.min(1, enter))} glow={0.5}>
          <WaHeader name="Customer" status={typing ? 'typing…' : 'online'} />
          <ChatBody>
            {typing && <Typing t={t} />}
            <Msg side="in" p={inMsg} time="11:02 AM">Hi! Aapki services ke baare mein batayenge?</Msg>
            {t > lapseB - 0.2 && (
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <Pill color="rgba(255,255,255,0.12)" fg="#E9EDEF" size={20}>3 HOURS LATER</Pill>
              </div>
            )}
            <Msg side="out" p={outMsg} time="2:14 PM">Ji zaroor! Details share kar raha hoon.</Msg>
          </ChatBody>
        </Phone>
      </div>
      {/* time-lapse: the reply waits */}
      {lapse > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: lapse, transform: `scale(${lerp(1.3, 1, lapse)})`}}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <g transform="translate(540 880)">
              <circle r={300} fill="rgba(10,14,12,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
              <circle r={300} fill="none" stroke={C.red} strokeWidth={10} pathLength={1} strokeDasharray={`${(clockSpin / 1080) % 1.0001} 1`} transform="rotate(-90)" strokeLinecap="round" />
              {Array.from({length: 12}, (_, i) => (
                <line key={i} x1={0} y1={-262} x2={0} y2={i % 3 ? -244 : -226} stroke="#fff" strokeWidth={i % 3 ? 4 : 8} transform={`rotate(${i * 30})`} strokeLinecap="round" />
              ))}
              <line x1={0} y1={0} x2={0} y2={-170} stroke="#fff" strokeWidth={14} strokeLinecap="round" transform={`rotate(${clockSpin / 12})`} />
              <line x1={0} y1={0} x2={0} y2={-230} stroke={C.red} strokeWidth={8} strokeLinecap="round" transform={`rotate(${clockSpin})`} />
              <circle r={16} fill="#fff" />
            </g>
          </svg>
          <Kinetic t={t} at={lapseA + 0.1} text="Thodi *der* baad…" y={1260} size={92} />
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 3. and then nothing
export const Ghost: React.FC<SceneProps> = ({t, a, b}) => {
  const r = t - a;
  const days = [1, 2, 3, 5, 7];
  const d = days[Math.min(days.length - 1, Math.floor(pt(r, 0.1, b - a - 0.15, (x) => x) * days.length))];
  return (
    <>
      <Stage t={t} hue="grey" grid={false} />
      <div style={{position: 'absolute', inset: 0, filter: 'grayscale(1)', opacity: 0.5}}>
        <Phone y={1000} w={600} rx={6} ry={-6} glow={0} scale={0.95 + r * 0.04}>
          <WaHeader name="Customer" status={`last seen ${d} day${d > 1 ? 's' : ''} ago`} />
          <ChatBody>
            <Msg side="out" p={1} time="2:14 PM">Ji zaroor! Details share kar raha hoon.</Msg>
            <Msg side="in" p={1} time="2:20 PM">I will let you know.</Msg>
          </ChatBody>
        </Phone>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
        <div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)'}}>DAY</div>
        <div style={{fontSize: 300, fontWeight: 800, lineHeight: 1, transform: `scale(${1 + (r * 7 % 1) * 0.04})`}}>{d}</div>
        <div style={{marginTop: 30}}>
          <Pill color={C.red} fg="#fff" size={34}>NO REPLY</Pill>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- 4. the follow-up gets buried
export const Buried: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const r = t - a;
  const note = sp(t, a + 0.05, 200, 14);
  const cards = ['Supplier call', 'GST filing', 'Team meeting', 'Stock order', 'Invoice #214', 'Site visit', 'Payroll', 'Client demo'];
  const stamp = sp(t, w(7) + 0.05, 260, 12);
  return (
    <>
      <Stage t={t} hue="red" grid={false} glowY={50} />
      <Label t={t} at={a + 0.1} text="TO-DO LIST" y={170} color="#fff" />
      <div style={{position: 'absolute', left: 240, top: 640, width: 600, height: 600, transform: `rotate(${lerp(-12, -4, Math.min(1, note))}deg) scale(${0.5 + 0.5 * note})`, opacity: Math.min(1, note * 2), background: 'linear-gradient(160deg,#FFE680,#F7C948)', borderRadius: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', padding: 50, fontFamily: FONT, color: '#3d2c00'}}>
        <div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7}}>REMINDER</div>
        <div style={{fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 20}}>Follow up with the lead</div>
      </div>
      {cards.map((c, i) => {
        const at = a + 0.3 + i * 0.12;
        const p = sp(t, at, 230, 18);
        if (p <= 0) return null;
        const x = 160 + rand(i * 3.1) * 360;
        const y = 560 + rand(i * 6.7) * 560;
        const rot = (rand(i * 2.3) - 0.5) * 40;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y + (1 - Math.min(1, p)) * -900, width: 440, padding: '28px 32px', transform: `rotate(${rot * Math.min(1, p)}deg)`, background: '#F4F5F2', borderRadius: 20, boxShadow: '0 24px 50px rgba(0,0,0,0.45)', fontFamily: FONT, color: '#1a1d1b', display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 34, height: 34, borderRadius: 8, border: '3px solid #9aa09c'}} />
            <div style={{fontSize: 36, fontWeight: 700}}>{c}</div>
          </div>
        );
      })}
      {stamp > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', transform: `scale(${2.2 - 1.2 * Math.min(1.05, stamp)}) rotate(-8deg)`, opacity: Math.min(1, stamp * 2)}}>
          <div style={{border: `10px solid ${C.red}`, color: C.red, fontFamily: FONT, fontWeight: 800, fontSize: 110, padding: '6px 40px', borderRadius: 18, letterSpacing: '0.04em', background: 'rgba(5,8,6,0.6)'}}>FORGOTTEN</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 5. follow-up timeline
export const Timeline: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const msg = 'Hey, just checking, are you still interested?';
  // type the message on as the words are spoken
  const typed = Math.round(msg.length * pt(t, w(5) - 0.05, w(11) + 0.35, (x) => x));
  const pan = pt(t, w(13), w(15) + 0.2, ease.inOut);
  const camX = lerp(0, -760, pan);
  const line = pt(t, w(12), w(15), ease.inOut);
  const n2 = sp(t, w(15));
  const m2 = sp(t, w(17) + 0.1);
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.1} text="FOLLOW-UP SEQUENCE" y={170} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 2400, height: 1920, transform: `translateX(${camX}px)`}}>
        {/* track */}
        <div style={{position: 'absolute', left: 120, top: 1180, width: 1900, height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 6}} />
        <div style={{position: 'absolute', left: 120, top: 1180, width: 1900 * (0.22 + 0.55 * line), height: 6, background: C.lime, borderRadius: 6, boxShadow: '0 0 30px rgba(182,242,58,0.7)'}} />
        {[
          {x: 540, label: 'DAY 1', p: sp(t, a + 0.05)},
          {x: 1300, label: 'DAY 3', p: n2},
        ].map((n, i) => (
          <div key={i} style={{position: 'absolute', left: n.x - 70, top: 1113, width: 140, textAlign: 'center', transform: `scale(${n.p})`}}>
            <div style={{width: 60, height: 60, margin: '0 auto', borderRadius: 60, background: C.lime, boxShadow: '0 0 40px rgba(182,242,58,0.8)', border: '10px solid #0b1208'}} />
            <div style={{marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '0.1em'}}>{n.label}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 140, top: 560, width: 800, fontFamily: FONT, color: '#E9EDEF'}}>
          <div style={{marginBottom: 16}}>
            <Pill size={26}>FOLLOW-UP #1</Pill>
          </div>
          <div style={{background: '#005C4B', borderRadius: 34, borderTopRightRadius: 6, padding: '30px 36px', fontSize: 52, fontWeight: 600, lineHeight: 1.25, minHeight: 200, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
            {msg.slice(0, typed)}
            <span style={{opacity: Math.sin(t * 12) > 0 ? 1 : 0, color: C.lime}}>|</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 940, top: 640, width: 720, fontFamily: FONT, color: '#E9EDEF', opacity: Math.min(1, m2 * 2), transform: `translateY(${(1 - Math.min(1, m2)) * 80}px)`}}>
          <div style={{marginBottom: 16}}>
            <Pill size={26}>FOLLOW-UP #2</Pill>
          </div>
          <div style={{background: '#005C4B', borderRadius: 34, borderTopRightRadius: 6, padding: '30px 36px', fontSize: 52, fontWeight: 600, lineHeight: 1.25, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>Just following up on this!</div>
        </div>
      </div>
      <Kinetic t={t} at={w(14) - 0.05} text="Kuch *din* baad…" y={1370} size={84} />
    </>
  );
};

// ---------------------------------------------------------------- 6. the conversation continues on its own
export const AutoChat: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const r = t - a;
  const steps = [
    {side: 'in' as const, at: a + 0.05, text: 'Yes, interested!', auto: false},
    {side: 'out' as const, at: w(8) + 0.05, text: 'Great! Aapka naam aur city?', auto: true},
    {side: 'in' as const, at: w(9), text: 'Ravi, Pune', auto: false},
    {side: 'out' as const, at: w(10) + 0.1, text: 'Thanks Ravi! Kal 11 baje call karein?', auto: true},
    {side: 'in' as const, at: w(12) - 0.05, text: 'Haan, perfect', auto: false},
  ];
  const shown = steps.filter((s) => t >= s.at);
  const scroll = 0;
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.1} text="ON AUTOPILOT" y={170} />
      {/* speed lines */}
      {Array.from({length: 14}, (_, i) => {
        const y = 300 + rand(i * 4.4) * 1300;
        const x = (((r * (1400 + rand(i) * 900) + rand(i * 2) * 1400) % 1600) - 300);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 220 + rand(i * 3) * 200, height: 3, background: 'linear-gradient(90deg, transparent, rgba(182,242,58,0.6))', opacity: 0.6}} />;
      })}
      <Phone y={1000} w={640} rx={6} ry={-10 + Math.sin(r) * 3} glow={0.7} scale={lerp(0.92, 1, sp(t, a))}>
        <WaHeader name="Customer" status="online" />
        <ChatBody scroll={scroll}>
          {shown.map((s, i) => (
            <Msg key={i} side={s.side} p={sp(t, s.at, 260, 18)} time="10:21 AM" tag={s.auto ? <Pill size={20}>AUTO REPLY</Pill> : undefined} size={34}>
              {s.text}
            </Msg>
          ))}
        </ChatBody>
      </Phone>
      <div style={{position: 'absolute', right: 70, top: 380, transform: `scale(${sp(t, w(8))}) rotate(8deg)`}}>
        <Pill size={30} style={{boxShadow: '0 0 40px rgba(182,242,58,0.6)'}}>AUTOMATIC</Pill>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- 7. what automation does
const FEATURES = [
  {word: 8, title: 'Initial replies', sub: 'Every message answered instantly'},
  {word: 13, title: 'Lead qualification', sub: 'Hot · Warm · Cold, sorted'},
  {word: 19, title: 'Follow-ups', sub: 'Sent on schedule, never forgotten'},
  {word: 23, title: 'Appointments', sub: 'Booked straight from the chat'},
  {word: 29, title: 'Information collect', sub: 'Name, city, need: saved'},
];

const FeatureArt: React.FC<{i: number; t: number; at: number}> = ({i, t, at}) => {
  const r = t - at;
  const box: React.CSSProperties = {position: 'relative', width: 760, height: 420, fontFamily: FONT, color: '#E9EDEF'};
  if (i === 0)
    return (
      <div style={{...box, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center'}}>
        <div style={{alignSelf: 'flex-start', background: '#202C33', borderRadius: 26, padding: '20px 28px', fontSize: 38}}>Hi, price kya hai?</div>
        <div style={{alignSelf: 'flex-end', background: '#005C4B', borderRadius: 26, padding: '20px 28px', fontSize: 38, transform: `scale(${sp(t, at + 0.3)})`, transformOrigin: '100% 50%'}}>
          <Pill size={18}>INSTANT</Pill> Ji! Details ye rahi.
        </div>
      </div>
    );
  if (i === 1) {
    const tags = [
      {l: 'HOT', c: '#FF6B4A', n: 'Priya: "Aaj hi chahiye"'},
      {l: 'WARM', c: '#F5C542', n: 'Rahul: "Next week"'},
      {l: 'COLD', c: '#5AB4FF', n: 'Arjun: "Bas dekh raha tha"'},
    ];
    return (
      <div style={{...box, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center'}}>
        {tags.map((g, k) => {
          const p = sp(t, at + 0.15 + k * 0.15);
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: '18px 24px', transform: `translateX(${(1 - Math.min(1, p)) * 200}px)`, opacity: Math.min(1, p * 2)}}>
              <Pill color={g.c} size={24} fg="#111">{g.l}</Pill>
              <div style={{fontSize: 34, fontWeight: 600}}>{g.n}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (i === 2) {
    const rows = ['Day 1 · Just checking in', 'Day 3 · Still interested?', 'Day 7 · Last reminder'];
    return (
      <div style={{...box, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center'}}>
        {rows.map((x, k) => {
          const p = pt(t, at + 0.1 + k * 0.18, at + 0.4 + k * 0.18);
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 36, fontWeight: 600, opacity: 0.35 + 0.65 * p}}>
              <Check size={48} p={p} />
              {x}
              <span style={{marginLeft: 'auto', fontSize: 22, color: C.lime, fontWeight: 800, letterSpacing: '0.1em'}}>{p > 0.9 ? 'SENT' : ''}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (i === 3) {
    const pick = sp(t, at + 0.35, 220, 14);
    return (
      <div style={{...box, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignContent: 'center'}}>
        {Array.from({length: 21}, (_, k) => {
          const on = k === 11;
          return (
            <div key={k} style={{height: 92, borderRadius: 16, background: on ? C.lime : 'rgba(255,255,255,0.07)', color: on ? C.ink : '#cfd6d2', display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 700, transform: on ? `scale(${1 + 0.15 * Math.sin(Math.min(1, pick) * Math.PI)})` : undefined, opacity: on ? 0.4 + 0.6 * Math.min(1, pick) : 1}}>
              {k + 8}
            </div>
          );
        })}
        <div style={{gridColumn: '1 / -1', marginTop: 10, textAlign: 'center', opacity: Math.min(1, pick)}}>
          <Pill size={28}>BOOKED · 19th, 11:00 AM</Pill>
        </div>
      </div>
    );
  }
  const fields = [
    ['Name', 'Ravi Sharma'],
    ['City', 'Pune'],
    ['Need', 'Gym membership'],
  ];
  return (
    <div style={{...box, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center'}}>
      {fields.map(([k, v], n) => {
        const typed = Math.round(v.length * pt(t, at + 0.1 + n * 0.22, at + 0.45 + n * 0.22, (x) => x));
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: '18px 26px', fontSize: 36}}>
            <span style={{width: 130, color: '#8f9a95', fontWeight: 600}}>{k}</span>
            <span style={{fontWeight: 700}}>{v.slice(0, typed)}</span>
            {typed === v.length && <span style={{marginLeft: 'auto'}}><Check size={40} /></span>}
          </div>
        );
      })}
    </div>
  );
};

export const Features: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const titleOut = pt(t, w(7) - 0.1, w(8) - 0.05, ease.inOut);
  const ats = FEATURES.map((f) => w(f.word) - 0.08);
  const cur = ats.reduce((n, at, i) => (t >= at ? i : n), -1);
  return (
    <>
      <Stage t={t} />
      {/* title reveal */}
      {titleOut < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - titleOut, transform: `scale(${1 + titleOut * 0.6})`, filter: titleOut > 0 ? `blur(${titleOut * 20}px)` : undefined}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `scale(${sp(t, w(2) - 0.15, 180, 13)})`}}>
            <div style={{width: 200, height: 200, borderRadius: 200, background: C.wa, display: 'grid', placeItems: 'center', boxShadow: '0 0 120px rgba(37,211,102,0.6)'}}>
              <svg width={120} height={120} viewBox="0 0 48 48">
                <path d="M10 39 L12.6 31.4 A13 13 0 1 1 17.6 36.2 Z" fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <Kinetic t={t} at={w(2) - 0.05} text="WhatsApp" y={850} size={140} />
          <Kinetic t={t} at={w(3) - 0.05} text="*Automation*" y={1010} size={140} />
          {/* light sweep */}
          <div style={{position: 'absolute', left: lerp(-600, 1300, pt(t, w(4), w(6) + 0.2, ease.inOut)), top: 800, width: 260, height: 420, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', transform: 'skewX(-20deg)', mixBlendMode: 'screen'}} />
        </div>
      )}
      {/* feature deck */}
      {cur >= 0 && (
        <>
          <Label t={t} at={ats[0]} text="WHAT IT DOES" y={170} />
          {/* progress row of icons */}
          <div style={{position: 'absolute', left: 90, right: 90, top: 270, display: 'flex', justifyContent: 'space-between'}}>
            {FEATURES.map((f, i) => {
              const done = t >= ats[i];
              return <div key={i} style={{width: 150, height: 10, borderRadius: 10, background: done ? C.lime : 'rgba(255,255,255,0.15)', boxShadow: done ? '0 0 20px rgba(182,242,58,0.6)' : undefined}} />;
            })}
          </div>
          {FEATURES.map((f, i) => {
            if (i < cur - 1 || i > cur) return null;
            const inP = sp(t, ats[i], 200, 19);
            const outP = i < cur ? pt(t, ats[cur], ats[cur] + 0.3, ease.in) : 0;
            return (
              <div key={i} style={{position: 'absolute', left: 60, right: 60, top: 400, height: 900, perspective: 1600, opacity: 1 - outP}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 48,
                    background: 'linear-gradient(160deg, rgba(30,38,33,0.95), rgba(12,16,14,0.95))',
                    border: '2px solid rgba(182,242,58,0.35)',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.6), 0 0 80px rgba(182,242,58,0.12)',
                    transform: `translateX(${(1 - Math.min(1, inP)) * 900 - outP * 900}px) rotateY(${(1 - Math.min(1, inP)) * -35 + outP * 35}deg)`,
                    padding: '60px 60px',
                    fontFamily: FONT,
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{fontSize: 28, fontWeight: 800, color: C.lime, letterSpacing: '0.3em'}}>0{i + 1}</div>
                  <div style={{fontSize: 84, fontWeight: 800, marginTop: 10, textAlign: 'center', lineHeight: 1.05}}>{f.title}</div>
                  <div style={{fontSize: 34, fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginTop: 14}}>{f.sub}</div>
                  <div style={{marginTop: 40}}>
                    <FeatureArt i={i} t={t} at={ats[i]} />
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 8. the system loop
export const System: React.FC<SceneProps> = ({t, a, b, ci}) => {
  const w = W(ci);
  const nodes = ['Lead', 'Auto reply', 'Qualify', 'Follow-up', 'Booked'];
  const R = 360;
  const cx = 540;
  const cy = 900;
  const ring = pt(t, w(12) - 0.1, w(12) + 0.6, ease.inOut);
  const run = pt(t, w(17), b + 1.5, (x) => x);
  const zoom = pt(t, b - 0.45, b, ease.in);
  return (
    <>
      <Stage t={t} />
      <Label t={t} at={a + 0.1} text="YOUR FOLLOW-UP SYSTEM" y={170} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + zoom * 2.5})`, transformOrigin: `${cx}px ${cy}px`, opacity: 1 - zoom * 0.6}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.lime} strokeWidth={8} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 14px rgba(182,242,58,0.8))'}} />
          {/* pulses travelling round the loop */}
          {run > 0 &&
            [0, 0.33, 0.66].map((o, k) => {
              const ang = ((run * 2.4 + o) % 1) * Math.PI * 2 - Math.PI / 2;
              return <circle key={k} cx={cx + Math.cos(ang) * R} cy={cy + Math.sin(ang) * R} r={14} fill="#fff" style={{filter: 'drop-shadow(0 0 16px #B6F23A)'}} />;
            })}
        </svg>
        {nodes.map((n, i) => {
          const ang = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const p = sp(t, a + 0.1 + i * 0.12, 210, 15);
          const lit = run > 0 && Math.floor(((run * 2.4) % 1) * nodes.length + 0.5) % nodes.length === i;
          return (
            <div key={i} style={{position: 'absolute', left: cx + Math.cos(ang) * R - 130, top: cy + Math.sin(ang) * R - 50, width: 260, height: 100, borderRadius: 30, background: lit ? C.lime : 'rgba(20,26,22,0.95)', color: lit ? C.ink : '#fff', border: `2px solid ${lit ? C.lime : 'rgba(255,255,255,0.18)'}`, display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, transform: `scale(${p * (lit ? 1.08 : 1)})`, boxShadow: lit ? '0 0 50px rgba(182,242,58,0.7)' : '0 20px 40px rgba(0,0,0,0.5)'}}>
              {n}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: cx - 160, top: cy - 160, width: 320, height: 320, display: 'grid', placeItems: 'center', transform: `scale(${sp(t, w(12) - 0.05, 180, 13)})`}}>
          <div style={{width: 260, height: 260, borderRadius: 260, background: 'radial-gradient(circle, #16230d, #050806)', border: '2px solid rgba(182,242,58,0.5)', display: 'grid', placeItems: 'center', boxShadow: '0 0 80px rgba(182,242,58,0.35)', overflow: 'hidden'}}>
            <Img src={staticFile('brand/logo-alpha.png')} style={{width: 190, height: 190, objectFit: 'contain'}} />
          </div>
        </div>
        <Kinetic t={t} at={w(17) - 0.05} text="*Automatically.*" y={1330} size={100} />
      </div>
    </>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {inbox: Inbox, chatStory: ChatStory, ghost: Ghost, buried: Buried, timeline: Timeline, autoChat: AutoChat, features: Features, system: System};
