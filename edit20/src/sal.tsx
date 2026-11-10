import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Pop, SANS, W, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'cream'];
// loyalty-card stamps: one per strategy
export const STAMPS = ['calendar', 'bell', 'camera_with_flash', 'ticket', 'star'];
type P = {t: number; th: Tok};
const s3 = (n: string) => staticFile(`sal3d/${n}.png`);

/** round rubber-stamp number for each strategy */
const NumStamp: React.FC<{t: number; at: number; n: string; dark?: boolean}> = ({t, at, n, dark}) => {
  const s = sp(t, at, 1.3);
  const col = dark ? '#fff' : C.green;
  return (
    <div style={{position: 'absolute', left: 470, top: 340, width: 140, height: 140, borderRadius: 70, border: `6px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(-12deg) scale(${lerp(2, 1, s)})`, opacity: ep(t, at, 0.1)}}>
      <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 64, color: col}}>{n}</div>
    </div>
  );
};
const Chip: React.FC<{img: string; txt: string; good?: boolean; light?: boolean}> = ({img, txt, good, light}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, background: good ? C.green : light ? '#fff' : C.ink, color: good || !light ? '#fff' : C.ink, borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 26, boxShadow: '0 12px 24px rgba(0,0,0,0.18)'}}>
    <Img src={fl(img)} style={{width: 38, height: 38}} /> {txt}
  </div>
);
const Bar: React.FC<{p: number; col?: string; track?: string; h?: number}> = ({p, col = C.green, track = '#EEEAE3', h = 14}) => (
  <div style={{height: h, borderRadius: h / 2, background: track, overflow: 'hidden'}}>
    <div style={{width: `${clamp01(p) * 100}%`, height: '100%', borderRadius: h / 2, background: col}} />
  </div>
);

// ===== 0 · hook: came once, never again (dark) =====================================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const C0: React.FC<P> = ({t, th}) => {
  const flipA = 0.5;
  const flipB = W(0, 7) + 0.2;
  const mi = Math.min(5, Math.floor(clamp01((t - flipA) / (flipB - flipA)) * 5.99));
  const salAt = W(1, 0);
  const repAt = W(1, 8);
  const fiveAt = W(1, 12);
  const leave = ep(t, salAt - 0.2, 0.5);
  const leave2 = ep(t, fiveAt - 0.2, 0.5);
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Ek baar aayi...']], [['phir kabhi nahi?', true]]]} />
      {leave < 1 && (
        <div style={abs(110, 700, {width: 860, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#22201D', borderRadius: 30, padding: '16px 22px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: SANS, color: '#fff'}}>
            <div style={{width: 74, height: 74, borderRadius: 37, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('woman')} style={{width: 54, height: 54}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 30}}>Neha · Haircut + spa</div>
              <div style={{fontSize: 21, color: '#9A948C'}}>Last visit: 12 Jan</div>
            </div>
            <Label color={t > flipB ? C.red : '#9A948C'} size={18}>{t > flipB ? '0 repeat' : '1 visit'}</Label>
          </div>
          {/* calendar page flipping month after month, no visit */}
          <div style={{display: 'flex', gap: 30, marginTop: 30, alignItems: 'center'}}>
            <div style={{position: 'relative', width: 300, borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS, textAlign: 'center', perspective: 800}}>
              <div style={{background: mi === 0 ? C.green : C.red, color: '#fff', fontWeight: 800, fontSize: 36, padding: '10px 0'}}>{MONTHS[mi]}</div>
              <div style={{background: '#fff', color: C.ink, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                {mi === 0 ? <Img src={fl('person_getting_haircut')} style={{width: 120, height: 120}} /> : <div style={{fontWeight: 800, fontSize: 120, color: '#D6D2CA', lineHeight: 1}}>?</div>}
                <Label color={mi === 0 ? C.green : C.red} size={17}>{mi === 0 ? 'Visit ✓' : 'No visit'}</Label>
              </div>
            </div>
            <div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
              {MONTHS.map((m, i) => (
                <div key={m} style={{height: 110, borderRadius: 18, background: i <= mi ? (i === 0 ? C.green : 'rgba(229,72,77,0.18)') : 'rgba(255,255,255,0.06)', border: i <= mi && i > 0 ? `2px solid ${C.red}` : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, color: i === 0 ? '#fff' : i <= mi ? C.red : '#6B655C'}}>
                  {m}
                  <span style={{fontSize: 26}}>{i === 0 ? '✓' : i <= mi ? '✕' : '·'}</span>
                </div>
              ))}
            </div>
          </div>
          {t > flipB && (
            <div style={{position: 'absolute', left: 230, top: 210, transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, flipB, 1.3))})`, opacity: ep(t, flipB, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '8px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.1em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>CUSTOMER GONE</div>
          )}
        </div>
      )}
      {t > salAt - 0.2 && leave2 < 1 && (
        <div style={abs(110, 720, {width: 860, opacity: 1 - leave2})}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 40}}>
            {[
              {n: 'barber_pole', l: 'Salon'},
              {n: 'hospital', l: 'Clinic'},
            ].map((x, i) => (
              <Pop key={i} t={t} at={salAt + i * 0.25} from={0.3}>
                <div style={{width: 260, height: 260, borderRadius: 40, background: '#22201D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
                  <Icon3D n={x.n} size={150} t={t} seed={i} />
                  <Label color="#C9C4BC" size={18}>{x.l}</Label>
                </div>
              </Pop>
            ))}
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 34, justifyContent: 'center'}}>
            {t > W(1, 5) && (
              <Pop t={t} at={W(1, 5)}>
                <Chip img="bust_in_silhouette" txt="Naya customer ✕" light />
              </Pop>
            )}
            {t > repAt && (
              <Pop t={t} at={repAt}>
                <Chip img="calendar" txt="Repeat visit ✓" good />
              </Pop>
            )}
          </div>
        </div>
      )}
      {t > fiveAt - 0.1 && (
        <div style={abs(100, 760, {width: 880, display: 'flex', justifyContent: 'center', gap: 22})}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{width: 150, height: 150, borderRadius: 75, border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${-12 + k * 6}deg) scale(${lerp(2, 1, sp(t, fiveAt - 0.1 + k * 0.1, 1.3))})`, opacity: ep(t, fiveAt - 0.1 + k * 0.1, 0.1)}}>
              <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 60, color: '#fff'}}>0{k + 1}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ===== 1 · rebook at checkout (cream) ================================================
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const payAt = W(2, 1);
  const bookAt = W(2, 7);
  const thinkAt = W(2, 11);
  const slots = ['10 Feb · 11 AM', '10 Feb · 4 PM', '11 Feb · 6 PM'];
  return (
    <>
      <NumStamp t={t} at={L - 0.15} n="01" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Checkout pe hi ']], [['agla appointment.', true]]]} />
      <Pop t={t} at={payAt} style={abs(110, 690)} dy={40}>
        <TCard th={th} style={{width: 860, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16}}>
          <Img src={fl('credit_card')} style={{width: 64, height: 64}} />
          <div style={{flex: 1, fontFamily: SANS}}>
            <div style={{fontWeight: 800, fontSize: 30}}>Paid ₹1,200</div>
            <div style={{fontSize: 21, color: th.cardSub}}>Haircut + hair spa · Neha</div>
          </div>
          <Check size={54} p={ep(t, payAt + 0.3, 0.4)} />
        </TCard>
      </Pop>
      {t > bookAt - 0.4 && (
        <Pop t={t} at={bookAt - 0.4} style={abs(110, 870)} dy={40}>
          <TCard th={th} style={{width: 860, padding: '20px 24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Img src={fl('calendar')} style={{width: 46, height: 46}} />
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28}}>Next visit (4 weeks)</div>
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              {slots.map((s, i) => {
                const sel = i === 1 && t > bookAt;
                return (
                  <div key={i} style={{flex: 1, textAlign: 'center', borderRadius: 16, padding: '14px 0', fontFamily: SANS, fontWeight: 700, fontSize: 23, background: sel ? C.green : '#fff', color: sel ? '#fff' : C.ink, border: sel ? `3px solid ${C.green}` : '2px solid #E4E0D8', transform: `scale(${sel ? lerp(0.9, 1, sp(t, bookAt)) : 1})`}}>{s}</div>
                );
              })}
            </div>
          </TCard>
        </Pop>
      )}
      {t > thinkAt && (
        <Pop t={t} at={thinkAt} style={abs(110, 1110)} dy={30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 24, padding: '10px 20px 10px 12px', fontFamily: SANS, fontWeight: 600, fontSize: 24, color: '#8C8780', boxShadow: '0 10px 20px rgba(40,30,20,0.1)'}}>
              <Img src={fl('thinking_face')} style={{width: 38, height: 38}} /> "Baad mein dekhti hoon"
              <div style={{position: 'absolute', left: 14, right: 14, top: '50%', height: 4, background: C.red, borderRadius: 2, transform: `scaleX(${ep(t, thinkAt + 0.4, 0.3)})`, transformOrigin: 'left'}} />
            </div>
            <Chip img="check_mark_button" txt="Booked before leaving" good />
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · a reminder per service (green) ==========================================
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const rows = [
    {at: W(3, 6), img: 'scissors', l: 'Haircut', d: '30 din'},
    {at: W(3, 9), img: 'sparkles', l: 'Facial', d: '21 din'},
    {at: W(3, 12), img: 'tooth', l: 'Dental cleaning', d: '6 mahine'},
  ];
  const autoAt = W(3, 16);
  return (
    <>
      <NumStamp t={t} at={L - 0.15} n="02" dark />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har service ka ']], [['apna reminder.', true]]]} />
      <div style={abs(110, 690, {width: 860, display: 'flex', flexDirection: 'column', gap: 16})}>
        {rows.map((r, i) =>
          t > r.at ? (
            <Pop key={i} t={t} at={r.at} dy={30}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 16px 30px rgba(0,0,0,0.16)', fontFamily: SANS, color: C.ink}}>
                <Img src={fl(r.img)} style={{width: 66, height: 66}} />
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                    <b style={{fontSize: 30}}>{r.l}</b>
                    <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, color: C.green}}>{r.d}</span>
                  </div>
                  <div style={{marginTop: 10}}>
                    <Bar p={ep(t, r.at + 0.2, 1.4)} />
                  </div>
                </div>
                <Img src={fl('bell')} style={{width: 44, height: 44, opacity: ep(t, r.at + 1.5, 0.2), transform: `rotate(${t > r.at + 1.5 ? Math.sin((t - r.at - 1.5) * 18) * 14 * (1 - ep(t, r.at + 1.5, 1)) : 0}deg)`}} />
              </div>
            </Pop>
          ) : null,
        )}
      </div>
      {t > autoAt && (
        <Pop t={t} at={autoAt} style={abs(250, 1170)} dy={30} from={0.85}>
          <div style={{width: 720}}>
            <Bubble me time="Day 30 · 10:00 AM" tag="Auto reminder">
              Neha, aapka haircut due hai. Saturday 11 AM book karein?
            </Bubble>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · before / after reels, with permission (cream) =============================
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const reelAt = W(4, 1);
  const permAt = W(4, 8);
  const trustAt = W(4, 15);
  const wipe = eio(t, reelAt + 0.5, 1.2);
  return (
    <>
      <NumStamp t={t} at={L - 0.15} n="03" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Before / after, ']], [['permission ke saath.', true]]]} />
      <Pop t={t} at={reelAt} style={abs(110, 690)} dy={40}>
        <div style={{position: 'relative', width: 520, height: 600, borderRadius: 34, overflow: 'hidden', boxShadow: '0 24px 50px rgba(40,30,20,0.2)'}}>
          <div style={{position: 'absolute', inset: 0, background: '#E4DFD6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('woman')} style={{width: 260, height: 260, filter: 'saturate(0.3) brightness(0.9)'}} />
            <div style={{position: 'absolute', left: 18, top: 18, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 20}}>BEFORE</div>
          </div>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#F6EDE1,#F2D5DC)', clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('woman')} style={{width: 260, height: 260}} />
            <Img src={fl('sparkles')} style={{position: 'absolute', right: 60, top: 140, width: 90, height: 90}} />
            <div style={{position: 'absolute', right: 18, top: 18, background: C.green, color: '#fff', borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 20}}>AFTER</div>
          </div>
          {wipe > 0 && wipe < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 6, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)'}} />}
          <div style={{position: 'absolute', left: 16, right: 16, bottom: 16, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.15)'}}>
            <div style={{width: `${ep(t, reelAt, 5) * 100}%`, height: '100%', borderRadius: 3, background: '#111'}} />
          </div>
        </div>
      </Pop>
      {t > permAt - 0.2 && (
        <Pop t={t} at={permAt - 0.2} style={abs(660, 760)} dy={30}>
          <TCard th={th} style={{width: 320, padding: '18px 20px', fontFamily: SANS}}>
            <Label color={th.cardSub} size={15}>Consent form</Label>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12}}>
              <div style={{width: 40, height: 40, borderRadius: 10, border: `3px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t > permAt + 0.3 ? C.green : '#fff', color: '#fff', fontWeight: 900, fontSize: 26}}>{t > permAt + 0.3 ? '✓' : ''}</div>
              <span style={{fontSize: 23, fontWeight: 600}}>Photo post kar sakte hain</span>
            </div>
            <div style={{fontFamily: 'cursive', fontSize: 30, color: '#3A3631', marginTop: 12, opacity: ep(t, permAt + 0.5, 0.4)}}>Neha S.</div>
          </TCard>
        </Pop>
      )}
      {t > trustAt && (
        <Pop t={t} at={trustAt} style={abs(660, 1080)}>
          <Chip img="handshake" txt="Bharosa ✓" good />
        </Pop>
      )}
    </>
  );
};

// ===== 4 · sell packages, not single services (dark) =================================
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const pkgAt = W(5, 4);
  const fiveAt = W(5, 11);
  return (
    <>
      <NumStamp t={t} at={L - 0.15} n="04" dark />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Single nahi, ']], [['package becho.', true]]]} />
      <div style={abs(110, 700, {width: 860, display: 'flex', gap: 26})}>
        <Pop t={t} at={W(5, 1)} dy={40}>
          <div style={{width: 300, background: '#22201D', borderRadius: 30, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: SANS, color: '#fff', opacity: t > pkgAt ? 0.5 : 1}}>
            <Label color="#9A948C" size={16}>Single</Label>
            <Img src={fl('sparkles')} style={{width: 90, height: 90, marginTop: 10}} />
            <div style={{fontWeight: 800, fontSize: 34, marginTop: 8}}>1 facial</div>
            <div style={{fontSize: 26, color: '#C9C4BC'}}>₹1,200</div>
            <div style={{display: 'flex', gap: 6, marginTop: 18}}>
              <div style={{width: 30, height: 30, borderRadius: 15, background: '#fff'}} />
            </div>
          </div>
        </Pop>
        {t > pkgAt && (
          <Pop t={t} at={pkgAt} dy={40}>
            <div style={{position: 'relative', width: 534, background: '#fff', borderRadius: 30, padding: 24, boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS, color: C.ink, border: `4px solid ${C.green}`}}>
              <Label color={C.green} size={16}>Glow package</Label>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
                <Img src={fl('ticket')} style={{width: 90, height: 90}} />
                <div>
                  <div style={{fontWeight: 800, fontSize: 38}}>5 facials</div>
                  <div style={{fontSize: 26}}>
                    ₹5,000 <span style={{color: '#999', textDecoration: 'line-through', fontSize: 22}}>₹6,000</span>
                  </div>
                </div>
              </div>
              <div style={{display: 'flex', gap: 12, marginTop: 20}}>
                {[0, 1, 2, 3, 4].map((k) => {
                  const on = t > fiveAt + k * 0.18;
                  return <div key={k} style={{width: 66, height: 66, borderRadius: 33, background: on ? C.green : '#EEEAE3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 24, transform: `scale(${on ? sp(t, fiveAt + k * 0.18, 1.3) : 1})`}}>{on ? k + 1 : ''}</div>;
                })}
              </div>
              <Label color={C.ink} size={16} style={{marginTop: 14, opacity: ep(t, fiveAt + 1, 0.3)}}>5 visits pakki</Label>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 5 · review link within 2 hours (cream) ======================================
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const tA = W(6, 1);
  const sendAt = W(6, 7);
  const starAt = W(6, 14);
  const mins = Math.round(clamp01((t - tA) / (sendAt - tA)) * 95);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <NumStamp t={t} at={L - 0.15} n="05" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['2 ghante ke andar ']], [['review link.', true]]]} />
      <div style={abs(110, 690, {width: 860, display: 'flex', alignItems: 'center', gap: 26})}>
        <Pop t={t} at={tA - 0.2}>
          <div style={{position: 'relative', width: 230, height: 230}}>
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r="98" fill="#fff" stroke="#E6E2DA" strokeWidth="14" />
              <circle cx="115" cy="115" r="98" fill="none" stroke={C.green} strokeWidth="14" strokeLinecap="round" strokeDasharray={616} strokeDashoffset={616 * (1 - mins / 120)} transform="rotate(-90 115 115)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, color: C.ink}}>
              <div style={{fontSize: 46}}>
                {Math.floor(mins / 60)}:{String(mins % 60).padStart(2, '0')}
              </div>
              <div style={{fontSize: 16, color: '#8C8780'}}>after visit</div>
            </div>
            <Img src={fl('alarm_clock')} style={{position: 'absolute', right: -22, top: -22, width: 80, height: 80}} />
          </div>
        </Pop>
        <div style={{flex: 1}}>
          {t > sendAt && (
            <Pop t={t} at={sendAt} from={0.85} dy={20}>
              <Bubble me time="6:35 PM" tag="Auto · review">
                Neha, aaj ka experience kaisa laga? 30 sec ka review de dijiye
              </Bubble>
            </Pop>
          )}
        </div>
      </div>
      <Pop t={t} at={starAt - 0.4} style={abs(110, 1000)} dy={40}>
        <TCard th={th} style={{width: 860, padding: '18px 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 48, height: 48, borderRadius: 24, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#4285F4'}}>G</div>
            <b style={{fontFamily: SANS, fontSize: 26}}>Glow Studio · Google review</b>
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center'}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 80, height: 80, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
        </TCard>
      </Pop>
    </>
  );
};

// ===== 6 · twist: the customer already in your chair (green) ==========================
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const cheapAt = W(7, 4);
  const chairAt = W(7, 12);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Sabse sasta marketing?']], [['Jo chair pe baitha hai.', true]]]} />
      <Pop t={t} at={L + 0.3} style={abs(290, 680)} from={0.4}>
        <div style={{position: 'relative', width: 500, height: 500}}>
          <div style={{position: 'absolute', left: 110, right: 110, bottom: 20, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', filter: 'blur(14px)'}} />
          <Img src={s3('chair')} style={{width: 500, height: 500}} />
          {t > chairAt && <Img src={fl('woman')} style={{position: 'absolute', left: 170, top: 70, width: 170, height: 170, transform: `translateY(${(1 - ep(t, chairAt, 0.5)) * -120}px)`, opacity: ep(t, chairAt, 0.2)}} />}
        </div>
      </Pop>
      {t > cheapAt && (
        <Pop t={t} at={cheapAt} style={abs(60, 900)} rot={-10}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', color: C.ink, borderRadius: 28, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 28, boxShadow: '0 16px 30px rgba(0,0,0,0.2)'}}>
            <Img src={fl('coin')} style={{width: 46, height: 46}} /> ₹0 ad spend
          </div>
        </Pop>
      )}
      {t > chairAt + 0.4 && (
        <Pop t={t} at={chairAt + 0.4} style={abs(720, 1080)} rot={10}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.ink, color: '#fff', borderRadius: 28, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
            <Img src={fl('red_heart')} style={{width: 44, height: 44}} /> Already trusts you
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · done-for-you CTA: comment DETAILS -> guide in DM -> follow (cream) ========
const LIST = ['Checkout pe rebook', 'Service reminders', 'Before / after', 'Packages', 'Review in 2 hrs'];
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const tickA = W(8, 5);
  const cmtAt = W(8, 11);
  const typeAt = W(8, 14);
  const sent = typeAt + 0.6;
  const dm = W(8, 20) - 0.1;
  const folAt = W(8, 29);
  const tapAt = W(8, 31);
  const typed = 'DETAILS'.slice(0, Math.floor(clamp01((t - typeAt + 0.1) / 0.45) * 7));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Yeh sab hum ']], [['aapke liye karein?', true]]]} />
      <Pop t={t} at={L + 0.2} style={abs(110, 680)} dy={40}>
        <TCard th={th} style={{width: 860, padding: '18px 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
            <Img src={staticFile('brand/logo-alpha.png')} style={{width: 54, height: 40, objectFit: 'contain', filter: 'brightness(0.35)'}} />
            <Label color={C.green} size={17}>Done for you · Neuraxine</Label>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px'}}>
            {LIST.map((x, i) => {
              const at = tickA + i * 0.18;
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 25, fontWeight: 600, color: C.ink, padding: '6px 0'}}>
                  <Check size={30} p={ep(t, at, 0.3)} color={t > at ? C.green : '#D6D2CA'} />
                  {x}
                </div>
              );
            })}
          </div>
        </TCard>
      </Pop>
      {t > cmtAt - 0.2 && (
        <Pop t={t} at={cmtAt - 0.2} style={abs(110, 930)} dy={40}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 40, padding: '12px 14px 12px 26px', boxShadow: '0 14px 30px rgba(40,30,20,0.14)', fontFamily: SANS}}>
            <Img src={fl('speech_balloon')} style={{width: 40, height: 40}} />
            <span style={{flex: 1, fontSize: 34, fontWeight: 800, letterSpacing: '0.04em', color: t > sent ? C.green : C.ink}}>
              {t > sent ? 'DETAILS ✓ posted' : t > typeAt - 0.1 ? typed : <span style={{fontWeight: 400, color: '#8C8780', letterSpacing: 0}}>Add a comment...</span>}
              {t > typeAt - 0.1 && t < sent && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </span>
            <div style={{width: 64, height: 64, borderRadius: 32, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > sent ? lerp(0.8, 1, sp(t, sent)) : 1})`}}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M3 11.5 L21 3 L14 21 L11.5 13.5 Z" fill="#fff" />
              </svg>
            </div>
          </div>
        </Pop>
      )}
      {t > W(8, 12) && (
        <div style={abs(620, 880, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, W(8, 12), 1.3))})`, opacity: ep(t, W(8, 12), 0.12), background: C.ink, color: '#fff', borderRadius: 14, padding: '6px 20px', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.12em', boxShadow: '0 14px 30px rgba(0,0,0,0.3)'})}>COMMENT</div>
      )}
      {t > dm && (
        <Pop t={t} at={dm} style={abs(110, 1070)} dy={-50}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: C.ink, borderRadius: 28, padding: '16px 20px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <div style={{width: 60, height: 60, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 42, height: 42}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{color: '#fff', fontSize: 24}}>
                <b>neuraxine</b> <span style={{opacity: 0.6}}>sent you a message · now</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '6px 10px', width: 'fit-content'}}>
                <Img src={fl('page_facing_up')} style={{width: 30, height: 30}} />
                <span style={{color: '#fff', fontSize: 21, fontWeight: 700}}>Salon & Clinic Growth Guide.pdf</span>
              </div>
            </div>
            <div style={{background: C.green, color: '#fff', borderRadius: 18, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 17}}>DM</div>
          </div>
        </Pop>
      )}
      {t > folAt - 0.3 && (
        <Pop t={t} at={folAt - 0.3} style={abs(210, 1240)} dy={30}>
          <div style={{position: 'relative', width: 660, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 40, padding: '12px 14px 12px 14px', boxShadow: '0 14px 30px rgba(40,30,20,0.16)', fontFamily: SANS}}>
            <div style={{width: 66, height: 66, borderRadius: 33, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={staticFile('brand/logo-alpha.png')} style={{width: 48, height: 36, objectFit: 'contain'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 27, color: C.ink}}>neuraxine</div>
              <div style={{fontSize: 19, color: '#8C8780'}}>AI · Automation · Growth</div>
            </div>
            <div style={{background: t > tapAt ? '#EFEFEF' : '#0095F6', color: t > tapAt ? C.ink : '#fff', borderRadius: 14, padding: '12px 22px', fontWeight: 800, fontSize: 24, transform: `scale(${t > tapAt ? lerp(0.9, 1, sp(t, tapAt)) : 1})`}}>{t > tapAt ? 'Following ✓' : 'Follow'}</div>
            {t > tapAt - 0.4 && t < tapAt + 0.6 && (
              <div style={{position: 'absolute', left: lerp(700, 560, eio(t, tapAt - 0.4, 0.35)), top: lerp(110, 40, eio(t, tapAt - 0.4, 0.35)), opacity: 1 - ep(t, tapAt + 0.3, 0.3)}}>
                {t > tapAt && <div style={{position: 'absolute', left: -6, top: -26, width: 66, height: 66, borderRadius: 33, border: `5px solid #0095F6`, transform: `scale(${lerp(0.3, 2, ep(t, tapAt, 0.5))})`, opacity: 1 - ep(t, tapAt, 0.5)}} />}
                <Img src={fl('index_pointing_up')} style={{width: 100, height: 100, transform: 'rotate(-14deg)', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.35))'}} />
              </div>
            )}
          </div>
        </Pop>
      )}
    </>
  );
};



export const SCENES = [C0, C1, C2, C3, C4, C5, C6, C7];
