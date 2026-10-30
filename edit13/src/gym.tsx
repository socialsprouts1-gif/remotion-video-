import React from 'react';
import {Img} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, SERIF, W, WaHeader, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Chip, Headline, Icon3D, Label, TCard, TH, Theme, Tok, abs, fl} from './kit';

export const THEMES: Theme[] = ['dark', 'cream', 'dark', 'cream', 'green', 'dark', 'cream', 'green', 'cream', 'dark', 'cream'];
type P = {t: number; th: Tok};
export const GYM = 'PowerZone Gym';

// ---- attendance calendar shared by beats 4, 5 and 7 -------------------------
const FILL_A0 = () => W(4, 11); // days 1-14 fill during "Pehle do hafte roz gym aayi"
const FILL_A1 = () => W(4, 16) + 0.5;
const GAP_0 = () => W(5, 2); // days 15-21 crossed during "saat din tak gayab"
const GAP_1 = () => W(5, 5) + 0.3;
const FILL_B0 = () => W(7, 0); // days 22-30 fill during "Priya wapas aayi"
const FILL_B1 = () => W(7, 2) + 0.6;
/** state of day d (1..30): 0 = not yet, 1 = attended, 2 = missed; plus progress of its own animation */
export const dayState = (t: number, d: number): {s: 0 | 1 | 2; p: number} => {
  if (d <= 14) {
    const at = lerp(FILL_A0(), FILL_A1(), (d - 1) / 13);
    return t >= at ? {s: 1, p: ep(t, at, 0.3)} : {s: 0, p: 0};
  }
  if (d <= 21) {
    const at = lerp(GAP_0(), GAP_1(), (d - 15) / 6);
    return t >= at ? {s: 2, p: ep(t, at, 0.3)} : {s: 0, p: 0};
  }
  const at = lerp(FILL_B0(), FILL_B1(), (d - 22) / 8);
  return t >= at ? {s: 1, p: ep(t, at, 0.3)} : {s: 0, p: 0};
};
export const streakAt = (t: number) => {
  let last = 0;
  for (let d = 1; d <= 30; d++) if (dayState(t, d).s !== 0) last = d;
  let n = 0;
  for (let d = last; d >= 1 && dayState(t, d).s === 1; d--) n++;
  return n;
};
const Calendar: React.FC<{t: number; th: Tok; gapNote?: boolean}> = ({t, th, gapNote}) => {
  const streak = streakAt(t);
  return (
    <TCard th={th} style={{width: 860, padding: '26px 30px 30px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Img src={fl('calendar')} style={{width: 50, height: 50}} />
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}}>Priya · attendance</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, background: streak > 0 ? '#FFF1E6' : '#F1EFEA', borderRadius: 30, padding: '6px 16px 6px 8px'}}>
          <Img src={fl(streak > 0 ? 'fire' : 'zzz')} style={{width: 38, height: 38}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: streak > 0 ? '#E8590C' : '#8C8780'}}>{streak} day streak</span>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 12, marginTop: 24}}>
        {Array.from({length: 30}).map((_, i) => {
          const d = i + 1;
          const st = dayState(t, d);
          const bg = st.s === 1 ? C.green : st.s === 2 ? '#F3E3E3' : '#F1EFEA';
          return (
            <div key={d} style={{height: 64, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transform: `scale(${st.s ? lerp(0.6, 1, sp(t, t - st.p * 0.3 < 0 ? 0 : t - 0.0001) * 0 + (st.p > 0 ? 0.6 + 0.4 * st.p : 1)) : 1})`, fontFamily: MONO, fontWeight: 700, fontSize: 18, color: st.s === 1 ? '#fff' : st.s === 2 ? C.red : '#B5AFA6'}}>
              {st.s === 2 ? '✕' : d}
            </div>
          );
        })}
      </div>
      {gapNote && dayState(t, 21).s === 2 && (
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontFamily: SANS, fontSize: 24, color: C.red, fontWeight: 600, opacity: ep(t, GAP_1(), 0.4)}}>
          <Img src={fl('ghost')} style={{width: 40, height: 40}} /> Day 15–21 · no check-in
        </div>
      )}
    </TCard>
  );
};

// ===== 0 · reels are not members (dark) ======================================
const REELS = [
  ['flexed_biceps', '#F7D9C4'],
  ['woman_lifting_weights', '#D8E8F5'],
  ['running_shoe', '#E5F2DD'],
  ['person_lifting_weights', '#F2E3F5'],
  ['green_apple', '#FBEBC8'],
  ['woman_running', '#DDEFEA'],
];
export const S0: React.FC<P> = ({t, th}) => {
  const igAt = W(0, 13);
  const no = W(0, 18);
  const ph = sp(t, igAt - 0.4, 0.9);
  return (
    <>
      <Headline t={t} at={0.1} th={th} a={[[['If we managed your ']], [['gym', true]]]} />
      <div style={abs(300, 720, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, igAt - 0.4, 0.3)})}>
        <Phone w={480} h={640} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '68px 20px 12px', borderBottom: '1px solid #eee'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 32, height: 32}} />
              <b style={{fontSize: 24, color: '#111'}}>powerzone.gym</b>
              <span style={{marginLeft: 'auto', fontSize: 17, color: '#888'}}>Reels</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3}}>
              {REELS.map(([n, bg], i) => {
                const at = igAt + 0.2 + i * 0.18;
                const views = Math.round(lerp(0, 4 + rnd(i) * 18, ep(t, at, 2.5)) * 10) / 10;
                return (
                  <div key={i} style={{height: 230, background: bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, at, 0.3) * (t > no ? 0.35 : 1), transform: `scale(${lerp(0.7, 1, sp(t, at))})`}}>
                    <Img src={fl(n)} style={{width: 100, height: 100}} />
                    <div style={{position: 'absolute', left: 8, bottom: 8, fontWeight: 700, fontSize: 16, color: '#111'}}>▶ {views}K</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Phone>
      </div>
      {t > no && (
        <div style={abs(250, 1000, {transform: `rotate(-9deg) scale(${lerp(2.2, 1, sp(t, no, 1.3))})`, opacity: ep(t, no, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '10px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 48, letterSpacing: '0.1em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'})}>
          VIEWS ≠ MEMBERS
        </div>
      )}
    </>
  );
};

// ===== 1 · every member, connected (cream) ======================================
const ORBIT = ['woman', 'man', 'person', 'woman_gesturing_ok', 'man', 'woman', 'person', 'woman'];
export const S1: React.FC<P> = ({t, th}) => {
  const L = W(1, 0) - 0.2;
  const cx = 540;
  const cy = 1030;
  const pri = W(1, 8);
  return (
    <>
      <Headline t={t} at={L} th={th} a={[[['Har member, ']], [['gym se juda.', true]]]} />
      <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
        {ORBIT.map((_, i) => {
          const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
          const at = W(1, Math.min(7, 1 + i)) - 0.1 + (i > 6 ? 0.2 : 0);
          const p = ep(t, at, 0.5);
          const x = cx + Math.cos(a) * 330;
          const y = cy + Math.sin(a) * 280;
          return <line key={i} x1={cx} y1={cy} x2={lerp(cx, x, p)} y2={lerp(cy, y, p)} stroke={C.green} strokeWidth="5" strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={0.7} />;
        })}
      </svg>
      <div style={abs(cx - 140, cy - 140)}>
        <Pop t={t} at={L + 0.2} from={0.4}>
          <div style={{width: 280, height: 280, borderRadius: 140, background: '#fff', boxShadow: '0 30px 60px rgba(40,30,20,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon3D n="person_lifting_weights" size={200} t={t} seed={1} />
          </div>
        </Pop>
      </div>
      {ORBIT.map((n, i) => {
        const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
        const at = W(1, Math.min(7, 1 + i)) - 0.1 + (i > 6 ? 0.2 : 0);
        const x = cx + Math.cos(a) * 330;
        const y = cy + Math.sin(a) * 280;
        const isP = i === 0;
        const hl = isP && t > pri;
        return t > at ? (
          <div key={i} style={abs(x - 60, y - 60)}>
            <Pop t={t} at={at} from={0.3}>
              <div style={{width: 120, height: 120, borderRadius: 60, background: hl ? C.green : '#fff', boxShadow: hl ? `0 0 0 ${10 + Math.sin(t * 6) * 4}px rgba(31,157,85,0.25), 0 20px 40px rgba(40,30,20,0.2)` : '0 16px 30px rgba(40,30,20,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${hl ? lerp(1, 1.25, sp(t, pri)) : 1})`}}>
                <Img src={fl(n)} style={{width: 84, height: 84}} />
              </div>
            </Pop>
            {hl && (
              <div style={{position: 'absolute', left: 130, top: 34, background: C.ink, color: '#fff', borderRadius: 20, padding: '6px 18px', fontFamily: SANS, fontWeight: 700, fontSize: 28, transform: `scale(${sp(t, pri + 0.1)})`, whiteSpace: 'nowrap'}}>Priya</div>
            )}
          </div>
        ) : null;
      })}
    </>
  );
};

// ===== 2 · 10:48 PM question (dark) ============================================
export const S2: React.FC<P> = ({t, th}) => {
  const adAt = W(2, 7);
  const waAt = W(2, 10);
  const qAt = W(2, 13);
  const ph = sp(t, waAt - 0.3, 0.9);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} th={th} a={[[['Raat 10:48. ']], [['Ek sawaal.', true]]]} />
      <Pop t={t} at={W(2, 0)} style={abs(70, 720)} rot={-10}>
        <Icon3D n="crescent_moon" size={150} t={t} seed={2} />
      </Pop>
      <Pop t={t} at={adAt} style={abs(560, 700)} rot={6}>
        <div style={{width: 440, background: '#fff', borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px'}}>
            <Img src={icon('instagram-icon.svg')} style={{width: 30, height: 30}} />
            <div>
              <div style={{fontWeight: 700, fontSize: 19, color: '#111'}}>powerzone.gym</div>
              <div style={{fontSize: 14, color: '#888'}}>Sponsored</div>
            </div>
          </div>
          <div style={{height: 150, background: 'linear-gradient(135deg,#E5F2DD,#C9E6D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>
            <Img src={fl('woman_lifting_weights')} style={{width: 110, height: 110}} />
            <div style={{background: C.green, color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 22}}>Free trial</div>
          </div>
        </div>
      </Pop>
      <div style={abs(250, 960, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, waAt - 0.3, 0.3)})}>
        <Phone w={580} h={420} dark>
          <WaHeader name={GYM} sub="Business account" />
          <div style={{padding: '22px 20px'}}>
            {t > qAt && (
              <Pop t={t} at={qAt} from={0.8} dy={30}>
                <Bubble time="10:48 PM">Hi! Monthly fees kitni hai?</Bubble>
              </Pop>
            )}
          </div>
        </Phone>
      </div>
    </>
  );
};

// ===== 3 · instant reply + trial booked (cream) ===================================
export const S3: React.FC<P> = ({t, th}) => {
  const rows = [
    {at: W(3, 3), img: 'credit_card', k: 'Monthly', v: '₹1,999'},
    {at: W(3, 3) + 0.25, img: 'money_bag', k: '3 months', v: '₹4,999'},
    {at: W(3, 4), img: 'alarm_clock', k: 'Timings', v: '5 AM – 11 PM'},
    {at: W(3, 7), img: 'admission_tickets', k: 'Free trial', v: '1 day'},
  ];
  const tk = W(3, 13) - 0.1;
  const booked = W(3, 19);
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} th={th} a={[[['Turant ']], [['reply.', true]]]} />
      <Pop t={t} at={W(3, 1)} style={abs(110, 700)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '22px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}}>{GYM} · AI reply</div>
            <Label color={C.green} size={16} style={{marginLeft: 'auto'}}>10:48 PM</Label>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: i ? '1px solid rgba(0,0,0,0.06)' : 'none', opacity: ep(t, r.at, 0.3), transform: `translateX(${(1 - ep(t, r.at, 0.5)) * 40}px)`}}>
              <Img src={fl(r.img)} style={{width: 48, height: 48}} />
              <span style={{fontFamily: SANS, fontSize: 28, flex: 1}}>{r.k}</span>
              <b style={{fontFamily: SANS, fontSize: 30}}>{r.v}</b>
            </div>
          ))}
        </TCard>
      </Pop>
      {t > tk && (
        <Pop t={t} at={tk} style={abs(160, 1150)} dy={60} rot={-3}>
          <div style={{width: 760, display: 'flex', alignItems: 'center', gap: 20, background: C.ink, color: '#fff', borderRadius: 28, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.25)'}}>
            <Img src={fl('sunrise')} style={{width: 84, height: 84}} />
            <div style={{fontFamily: SANS, flex: 1}}>
              <Label color={C.wa} size={16}>Free trial</Label>
              <div style={{fontWeight: 800, fontSize: 34}}>Kal · 7:00 AM</div>
            </div>
            {t > booked && <Check size={62} p={ep(t, booked, 0.4)} />}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · joined + 14-day streak (green) ==========================================
export const S4: React.FC<P> = ({t, th}) => {
  const planAt = W(4, 8);
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.2} th={th} a={[[['Joined. ']], [['Roz gym.', true]]]} />
      <Pop t={t} at={planAt - 0.1} style={abs(110, 690)} dy={40}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 26, padding: '14px 24px 14px 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', width: 828}}>
          <Img src={fl('ticket')} style={{width: 60, height: 60}} />
          <div style={{fontFamily: SANS, flex: 1, color: C.ink}}>
            <div style={{fontWeight: 800, fontSize: 30}}>3-month plan · ₹4,999</div>
            <div style={{fontSize: 20, color: '#8C8780'}}>Priya Sharma · started Day 1</div>
          </div>
          <Check size={54} p={ep(t, planAt + 0.1, 0.4)} />
        </div>
      </Pop>
      <Pop t={t} at={W(4, 11) - 0.4} style={abs(110, 860)} dy={60}>
        <Calendar t={t} th={TH.cream} />
      </Pop>
    </>
  );
};

// ===== 5 · 7 days gone (dark) ======================================================
export const S5: React.FC<P> = ({t, th}) => {
  const zoneAt = W(5, 6);
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} th={th} a={[[['Phir... ']], [['7 din gayab.', true]]]} />
      <div style={abs(110, 720)}>
        <Calendar t={t} th={TH.cream} gapNote />
      </div>
      {t > GAP_0() && (
        <div style={abs(40, 1090, {transform: `translateY(${Math.sin(t * 2) * 12}px)`})}>
          <Pop t={t} at={GAP_0()} from={0.3} rot={20}>
            <Icon3D n="ghost" size={170} t={t} seed={5} />
          </Pop>
        </div>
      )}
      {t > zoneAt && (
        <Pop t={t} at={zoneAt} style={abs(230, 1200)} dy={40}>
          <div style={{width: 740, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(229,72,77,0.14)', border: `2px solid ${C.red}`, borderRadius: 26, padding: '16px 24px'}}>
            <Img src={fl('chart_decreasing')} style={{width: 64, height: 64}} />
            <div style={{fontFamily: SANS, color: '#fff'}}>
              <div style={{fontWeight: 800, fontSize: 30}}>Drop-off zone</div>
              <div style={{fontSize: 22, color: '#FF9C9F'}}>Yahin members chupchaap chale jaate hain</div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · automated nudge (cream) =================================================
export const S6: React.FC<P> = ({t, th}) => {
  const msgAt = W(6, 2);
  const qrAt = W(6, 11);
  const tap = W(6, 14);
  const ph = sp(t, W(6, 0), 0.9);
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} th={th} a={[[['Automated ']], [['nudge.', true]]]} />
      <div style={abs(250, 690, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, W(6, 0), 0.3)})}>
        <Phone w={580} h={680}>
          <WaHeader name={GYM} sub="Business account" />
          <div style={{padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14}}>
            {t > msgAt && (
              <Pop t={t} at={msgAt} from={0.8} dy={30}>
                <Bubble me time="Day 22 · 6:30 PM" tag="Auto · streak alert">
                  Priya, aapki 14-din ki streak toot rahi hai. Kal ka 7 AM slot book karein?
                </Bubble>
              </Pop>
            )}
            {t > qrAt && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end'}}>
                {['Haan, book karo', 'Shaam 6 PM'].map((q, i) => (
                  <Pop key={i} t={t} at={qrAt + i * 0.12} from={0.85}>
                    <div style={{width: 330, textAlign: 'center', background: i === 0 && t > tap ? C.green : '#fff', color: i === 0 && t > tap ? '#fff' : C.waDeep, borderRadius: 18, padding: '14px 0', fontFamily: SANS, fontWeight: 700, fontSize: 24, boxShadow: '0 2px 2px rgba(0,0,0,0.06)'}}>
                      {i === 0 && t > tap ? 'Slot booked ✓' : q}
                    </div>
                  </Pop>
                ))}
              </div>
            )}
          </div>
        </Phone>
      </div>
      {t > msgAt && (
        <Pop t={t} at={msgAt + 0.1} style={abs(60, 760)} rot={-14}>
          <Icon3D n="bell" size={140} t={t} seed={6} />
        </Pop>
      )}
      {t > tap - 0.4 && t < tap + 0.5 && (
        <div style={abs(lerp(900, 700, eio(t, tap - 0.4, 0.35)), lerp(1300, 1135, eio(t, tap - 0.4, 0.35)), {width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.9)', border: `4px solid ${C.wa}`, transform: `scale(${t > tap ? 0.8 : 1})`, opacity: 1 - ep(t, tap + 0.2, 0.3)})} />
      )}
    </>
  );
};

// ===== 7 · back + renewal reminder (green) ==========================================
export const S7: React.FC<P> = ({t, th}) => {
  const remAt = W(7, 11);
  const offAt = W(7, 14);
  const days = Math.max(10, Math.round(lerp(14, 10, ep(t, W(7, 8), 0.8))));
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} th={th} a={[[['Wapas aayi. ']], [['Streak on.', true]]]} />
      <div style={abs(110, 690, {transform: `scale(${t > remAt ? lerp(1, 0.86, ep(t, remAt, 0.6)) : 1})`, transformOrigin: '50% 0'})}>
        <Calendar t={t} th={TH.cream} />
      </div>
      {t > remAt && (
        <Pop t={t} at={remAt} style={abs(110, 1080)} dy={60}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, color: '#fff', borderRadius: 28, padding: '18px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)'}}>
            <Img src={fl('bell')} style={{width: 70, height: 70}} />
            <div style={{fontFamily: SANS, flex: 1}}>
              <Label color={C.wa} size={16}>Renewal reminder</Label>
              <div style={{fontWeight: 800, fontSize: 32}}>Plan ends in {days} days</div>
            </div>
            {t > offAt && (
              <div style={{background: C.gold, color: C.ink, borderRadius: 16, padding: '10px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 24, transform: `scale(${sp(t, offAt)}) rotate(4deg)`}}>₹500 off</div>
            )}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 8 · renewed + referral (cream) =================================================
export const S8: React.FC<P> = ({t, th}) => {
  const renAt = W(8, 0);
  const refAt = W(8, 4);
  const frAt = W(8, 9);
  return (
    <>
      <Headline t={t} at={renAt - 0.2} th={th} a={[[['Renewed. ']], [['+1 friend.', true]]]} />
      <Pop t={t} at={renAt + 0.05} style={abs(110, 700)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20}}>
          <Img src={fl('sports_medal')} style={{width: 90, height: 90}} />
          <div style={{fontFamily: SANS, flex: 1}}>
            <Label color={C.green} size={16}>Renewed</Label>
            <div style={{fontWeight: 800, fontSize: 36}}>3 months · ₹4,499</div>
            <div style={{fontSize: 22, color: th.cardSub}}>Priya Sharma</div>
          </div>
          <Check size={64} p={ep(t, renAt + 0.3, 0.4)} />
        </TCard>
      </Pop>
      {t > refAt && (
        <Pop t={t} at={refAt} style={abs(110, 930)} dy={40}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 16px 34px rgba(40,30,20,0.12)', fontFamily: SANS}}>
            <Img src={fl('link')} style={{width: 54, height: 54}} />
            <div style={{flex: 1, fontSize: 26, color: C.ink}}>
              <b>Refer a friend</b> <span style={{color: '#8C8780'}}>· powerzone.in/r/priya</span>
            </div>
            <Img src={fl('wrapped_gift')} style={{width: 54, height: 54}} />
          </div>
        </Pop>
      )}
      {t > frAt && (
        <div style={abs(250, 1080, {display: 'flex', alignItems: 'center', gap: 20})}>
          <Pop t={t} at={frAt} from={0.3}>
            <div style={{width: 150, height: 150, borderRadius: 75, background: '#fff', boxShadow: '0 20px 40px rgba(40,30,20,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('woman')} style={{width: 104, height: 104}} />
            </div>
          </Pop>
          <Pop t={t} at={frAt + 0.15}>
            <Icon3D n="people_hugging" size={140} t={t} seed={8} />
          </Pop>
          <Pop t={t} at={frAt + 0.3}>
            <div style={{width: 150, height: 150, borderRadius: 75, background: C.green, boxShadow: '0 20px 40px rgba(31,157,85,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff'}}>+1</div>
          </Pop>
        </div>
      )}
    </>
  );
};

// ===== 9 · goal: bring them back (dark) ==============================================
export const S9: React.FC<P> = ({t, th}) => {
  const newAt = W(9, 5);
  const backAt = W(9, 9);
  const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  return (
    <>
      <Headline t={t} at={W(9, 0) - 0.2} th={th} a={[[['Goal: ']], [['har mahine wapas.', true]]]} />
      <div style={abs(110, 720, {width: 860, height: 520, display: 'flex', alignItems: 'flex-end', gap: 26})}>
        {months.map((m, i) => {
          const h0 = 80 + i * 6;
          const h1 = 160 + i * 52;
          const h = t > backAt ? lerp(h0, h1, eio(t, backAt + i * 0.08, 0.8)) : lerp(0, h0, ep(t, newAt + i * 0.05, 0.6));
          return (
            <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div style={{width: '100%', height: h, borderRadius: 16, background: t > backAt ? C.green : 'rgba(255,255,255,0.18)'}} />
              <Label color="#9A948C" size={18}>{m}</Label>
            </div>
          );
        })}
      </div>
      {t > newAt && (
        <Pop t={t} at={newAt} style={abs(110, 1290)}>
          <Chip th={th} img="waving_hand" txt="Naye members" />
        </Pop>
      )}
      {t > backAt && (
        <Pop t={t} at={backAt + 0.2} style={abs(520, 1290)}>
          <Chip th={th} img="hundred_points" txt="Wapas aane wale" strong />
        </Pop>
      )}
      {t > backAt + 0.6 && (
        <Pop t={t} at={backAt + 0.6} style={abs(60, 720)} rot={-20}>
          <Icon3D n="trophy" size={150} t={t} seed={9} />
        </Pop>
      )}
    </>
  );
};

// ===== 10 · question + comment + DM (cream) ===========================================
export const S10: React.FC<P> = ({t, th}) => {
  const cta = W(10, 8);
  const typeAt = W(10, 10);
  const sent = typeAt + 0.65;
  const dm = W(10, 13) - 0.1;
  const typed = 'WhatsApp'.slice(0, Math.floor(clamp01((t - typeAt + 0.15) / 0.45) * 8));
  return (
    <>
      <Headline t={t} at={W(10, 0) - 0.3} th={th} a={[[["Aapke gym ki"]], [['problem?', true]]]} />
      <Pop t={t} at={W(10, 1)} style={abs(90, 720)} dy={50}>
        <TCard th={th} style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <Img src={fl('man_lifting_weights')} style={{width: 52, height: 52}} />
            <b style={{fontSize: 27}}>Gym owner – Pune</b>
            <Label color={th.cardSub} size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? th.cardSub : C.ink, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'Members renew nahi karte...'}
              {t > cta && t < sent && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </div>
            <div style={{width: 80, height: 80, borderRadius: 40, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > sent ? lerp(0.8, 1, sp(t, sent)) : 1})`}}>
              <svg width="34" height="34" viewBox="0 0 24 24">
                <path d="M3 11.5 L21 3 L14 21 L11.5 13.5 Z" fill="#fff" />
              </svg>
            </div>
          </div>
        </TCard>
      </Pop>
      {t > sent && (
        <Pop t={t} at={sent} style={abs(90, 950)} rot={-4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '12px 24px 12px 12px', fontFamily: SANS, fontSize: 28, color: '#111', boxShadow: '0 14px 30px rgba(40,30,20,0.14)'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 42, height: 42}} />
            <b>"WhatsApp"</b>
          </div>
        </Pop>
      )}
      {t > dm && (
        <Pop t={t} at={dm} style={abs(90, 1090)} dy={-60}>
          <div style={{width: 900, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 30, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <div style={{width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 46, height: 46}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{color: '#fff', fontSize: 26}}>
                <b>neuraxine</b> <span style={{opacity: 0.6}}>sent you a message · now</span>
              </div>
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi gym automation ki saari details</div>
            </div>
            <div style={{background: C.green, color: '#fff', borderRadius: 20, padding: '8px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: '0.1em'}}>DM</div>
          </div>
        </Pop>
      )}
      {t > cta && (
        <div style={abs(600, 900, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, cta, 1.3))})`, opacity: ep(t, cta, 0.12), background: C.ink, color: '#fff', borderRadius: 14, padding: '8px 22px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.12em', boxShadow: '0 16px 40px rgba(0,0,0,0.3)'})}>
          COMMENT
        </div>
      )}
    </>
  );
};

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
export {SERIF};
