import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'dark', 'cream'];
/** elevator floor shown in the HUD for each scene */
export const FLOOR = [0, 1, 2, 3, 4, 5, 6, 6, 6];
type P = {t: number; th: Tok};
const h3 = (n: string) => staticFile(`htl3d/${n}.png`);
const Big: React.FC<{s: number; children: React.ReactNode}> = ({s, children}) => (
  <div style={{position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '540px 640px'}}>{children}</div>
);
const Chip: React.FC<{img: string; txt: string; good?: boolean; light?: boolean; size?: number}> = ({img, txt, good, light, size = 28}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, background: good ? C.green : light ? '#fff' : C.ink, color: good || !light ? '#fff' : C.ink, borderRadius: 30, padding: '10px 24px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: size, boxShadow: '0 12px 24px rgba(0,0,0,0.18)', whiteSpace: 'nowrap'}}>
    <Img src={fl(img)} style={{width: size * 1.45, height: size * 1.45}} /> {txt}
  </div>
);
const Bar: React.FC<{p: number; col?: string; track?: string; h?: number}> = ({p, col = C.green, track = '#EEEAE3', h = 14}) => (
  <div style={{height: h, borderRadius: h / 2, background: track, overflow: 'hidden'}}>
    <div style={{width: `${clamp01(p) * 100}%`, height: '100%', borderRadius: h / 2, background: col}} />
  </div>
);
/** chat bubble sized for a phone screen */
const BB: React.FC<{me?: boolean; children: React.ReactNode; time?: string; tag?: string}> = ({me, children, time = '10:42', tag}) => (
  <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start'}}>
    <div style={{maxWidth: 680, background: me ? '#D9FDD3' : '#fff', borderRadius: 30, borderTopRightRadius: me ? 8 : 30, borderTopLeftRadius: me ? 30 : 8, padding: '18px 24px 12px', fontFamily: SANS, fontSize: 33, lineHeight: 1.28, color: C.ink, boxShadow: '0 18px 36px rgba(0,0,0,0.16)'}}>
      {tag && <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.green, marginBottom: 6}}>{tag}</div>}
      {children}
      <div style={{fontSize: 19, color: '#8A9690', textAlign: 'right', marginTop: 4}}>
        {time} {me && <span style={{color: '#34B7F1'}}>✓✓</span>}
      </div>
    </div>
  </div>
);


// ===== 0 · hook: pool photos get likes, bookings go to OTAs at 18% (dark) ================
const OTA = [
  ['Deluxe · 2N', '₹17,000', '-₹3,060'],
  ['Pool villa · 3N', '₹42,000', '-₹7,560'],
  ['Suite · 1N', '₹11,500', '-₹2,070'],
];
export const C0: React.FC<P> = ({t, th}) => {
  const noAt = W(0, 20);
  const l1 = W(1, 0);
  const steps = [
    {at: W(1, 2), img: 'woman', l: 'Guest'},
    {at: W(1, 4), img: 'mobile_phone', l: 'Direct booking'},
    {at: W(1, 7), img: 'repeat_button', l: 'Repeat stay'},
  ];
  const dekho = W(1, 12);
  const leave = ep(t, l1 - 0.25, 0.45);
  const lost = Math.round(lerp(0, 1.26, ep(t, 0.4, 4)) * 100) / 100;
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Pool photos pe likes...']], [['booking OTA pe?', true]]]} />
      {leave < 1 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          <Pop t={t} at={-0.6} style={abs(0, 0)} rot={-3}>
            <div style={{width: 380, height: 420, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(180deg,#F6D7A8,#F4EFE6 60%)', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', position: 'relative'}}>
              <Img src={h3('villa')} style={{position: 'absolute', left: -40, top: 20, width: 460, height: 460}} />
              <div style={{position: 'absolute', left: 14, bottom: 14, background: '#fff', borderRadius: 14, padding: '6px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.ink}}>
                <span style={{color: C.red}}>♥</span> 5,204 likes
              </div>
            </div>
          </Pop>
          <div style={abs(410, 10, {width: 510})}>
            <Label color="#9A948C" size={18}>This month · bookings</Label>
            {OTA.map(([r, p, c], i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, background: '#22201D', borderRadius: 20, padding: '14px 16px', marginTop: 10, opacity: ep(t, -0.3 + i * 0.3, 0.3), transform: `translateX(${(1 - ep(t, -0.3 + i * 0.3, 0.4)) * 40}px)`, fontFamily: SANS, color: '#fff'}}>
                <div style={{background: '#3A3631', borderRadius: 8, padding: '3px 8px', fontFamily: MONO, fontWeight: 800, fontSize: 15}}>OTA</div>
                <div style={{flex: 1, fontSize: 23, fontWeight: 600}}>{r}</div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: 20, color: '#9A948C'}}>{p}</div>
                  <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#FF8A8A'}}>{c}</div>
                </div>
              </div>
            ))}
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#fff'}}>
              <Img src={fl('money_with_wings')} style={{width: 54, height: 54, transform: `translate(${Math.sin(t * 3) * 6}px, ${-Math.abs(Math.sin(t * 2)) * 10}px)`}} />
              Commission: <span style={{fontFamily: MONO, color: '#FF8A8A'}}>₹{lost.toFixed(2)}L</span>
            </div>
          </div>
          {t > noAt && (
            <div style={{position: 'absolute', left: 140, top: 470, transform: `rotate(-6deg) scale(${lerp(2.2, 1, sp(t, noAt, 1.3))})`, opacity: ep(t, noAt, 0.12), background: C.red, color: '#fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.06em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
              18% GAYA OTA KO
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: ep(t, l1 - 0.2, 0.4)})}>
          <div style={abs(230, 20, {width: 460, height: 460})}>
            <Pop t={t} at={l1} from={0.4} rot={-8}>
              <Img src={h3('keycard')} style={{width: 460, height: 460, transform: `rotate(${Math.sin(t * 1.2) * 3}deg)`}} />
            </Pop>
          </div>
          <div style={abs(0, 460, {width: 920, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10})}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{width: 40, height: 4, background: t > s.at ? C.green : 'rgba(255,255,255,0.15)', borderRadius: 2}} />}
                <div style={{display: 'flex', alignItems: 'center', gap: 10, background: t > s.at ? (i === 2 ? C.green : '#22201D') : 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 26, padding: '12px 20px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 26, opacity: t > s.at ? 1 : 0.35, transform: `scale(${t > s.at ? sp(t, s.at, 1.3) : 0.9})`}}>
                  <Img src={fl(s.img)} style={{width: 44, height: 44}} /> {s.l}
                </div>
              </React.Fragment>
            ))}
          </div>
          {t > dekho && (
            <Pop t={t} at={dekho} style={abs(330, 590)}>
              <Chip img="bellhop_bell" txt="Dekho kaise" light size={30} />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · Ananya sees the pool villa reel, WhatsApps for her anniversary (cream) ========
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const waAt = W(2, 11);
  const annAt = W(2, 13);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Ananya ne dekhi']], [['pool villa reel.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={40} rot={-2}>
        <div style={{position: 'relative', width: 560, height: 560, borderRadius: 34, overflow: 'hidden', background: 'linear-gradient(180deg,#F6C9A0 0%,#F6E3C8 40%,#F4EFE6 70%)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}}>
          <Img src={fl('sun')} style={{position: 'absolute', right: 40, top: 60, width: 100, height: 100, opacity: 0.9}} />
          <Img src={h3('villa')} style={{position: 'absolute', left: -20, top: 20, width: 600, height: 600, transform: `scale(${1 + ep(t, L, 6) * 0.06})`}} />
          <div style={{position: 'absolute', left: 18, top: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.ink}}>
            <Img src={fl('hotel')} style={{width: 34, height: 34}} /> palm.bay.resort
          </div>
          <div style={{position: 'absolute', left: 18, bottom: 50, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.ink}}>Private pool villa · sunset</div>
          <div style={{position: 'absolute', left: 18, bottom: 18, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#6B655C'}}>▶ 860K views</div>
        </div>
      </Pop>
      {t > annAt - 0.2 && (
        <div style={abs(650, 720, {width: 340, height: 420})}>
          {[0, 1, 2].map((k) => (
            <Img key={k} src={fl(k === 1 ? 'heart_with_ribbon' : 'sparkling_heart')} style={{position: 'absolute', left: [20, 120, 220][k], top: [120, 10, 160][k], width: [110, 170, 100][k], height: [110, 170, 100][k], opacity: ep(t, annAt - 0.2 + k * 0.15, 0.2), transform: `translateY(${(1 - ep(t, annAt - 0.2 + k * 0.15, 0.6)) * 60 + Math.sin(t * 2 + k) * 8}px) scale(${sp(t, annAt - 0.2 + k * 0.15, 1.2)})`}} />
          ))}
        </div>
      )}
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1270)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB time="8:40 PM">Hi! Anniversary ke liye pool villa chahiye, 14–16 Feb, 2 raat 💕</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI: room options, photos, 10% off direct, zero OTA commission (green) =========
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const optAt = W(3, 3);
  const photoAt = W(3, 5);
  const dirAt = W(3, 7);
  const zeroAt = W(3, 14);
  const rooms = [
    {n: 'Deluxe room', p: '₹8,500', img: 'bed'},
    {n: 'Pool villa', p: '₹14,000', img: 'villa'},
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Direct booking pe']], [['10% off. OTA ko ₹0.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="8:40 PM" tag="AI · 4 sec">Happy anniversary in advance! 💐 14–16 Feb ke options 👇</BB>
        </div>
      </Pop>
      <div style={abs(80, 850, {width: 920, display: 'flex', gap: 16})}>
        {rooms.map((r, i) =>
          t > optAt + i * 0.25 ? (
            <Pop key={i} t={t} at={optAt + i * 0.25} dy={30} style={{flex: 1}}>
              <div style={{position: 'relative', background: '#fff', borderRadius: 26, overflow: 'hidden', boxShadow: '0 16px 30px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink, border: i === 1 ? `4px solid ${C.ink}` : '4px solid transparent'}}>
                <div style={{height: 170, background: 'linear-gradient(180deg,#F6D7A8,#F4EFE6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'}}>
                  <Img src={r.img === 'villa' ? h3('villa') : fl(r.img)} style={{width: r.img === 'villa' ? 260 : 120, height: r.img === 'villa' ? 260 : 120, opacity: t > photoAt ? 1 : 0.3, transform: `scale(${t > photoAt ? lerp(0.7, 1, sp(t, photoAt + i * 0.12, 1.2)) : 0.7})`}} />
                  {t > photoAt && <div style={{position: 'absolute', right: 8, top: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 8, padding: '2px 8px', fontFamily: MONO, fontSize: 15, fontWeight: 700}}>📷 18</div>}
                </div>
                <div style={{padding: '12px 16px'}}>
                  <b style={{fontSize: 30}}>{r.n}</b>
                  <div style={{fontFamily: MONO, fontSize: 22, color: '#5A554E'}}>{r.p} / night</div>
                </div>
              </div>
            </Pop>
          ) : (
            <div key={i} style={{flex: 1}} />
          ),
        )}
      </div>
      {t > dirAt - 0.2 && (
        <Pop t={t} at={dirAt - 0.2} style={abs(80, 1150)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: C.ink, color: '#fff', borderRadius: 28, padding: '16px 22px', fontFamily: SANS}}>
            <Img src={fl('mobile_phone')} style={{width: 56, height: 56}} />
            <div style={{flex: 1}}>
              <Label color="#9A948C" size={16}>Pool villa · 2 nights · direct</Label>
              <div style={{fontSize: 30, fontWeight: 700}}>
                <span style={{textDecoration: 'line-through', color: '#9A948C', fontSize: 24, marginRight: 10}}>₹28,000</span>
                <span style={{fontFamily: MONO, fontWeight: 800}}>₹25,200</span>
              </div>
            </div>
            <div style={{background: C.green, borderRadius: 14, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 24}}>-10%</div>
          </div>
        </Pop>
      )}
      {t > zeroAt - 0.2 && (
        <Pop t={t} at={zeroAt - 0.2} style={abs(560, 1060)} rot={6}>
          <Chip img="check_mark_button" txt="OTA commission: ₹0" light size={28} />
        </Pop>
      )}
    </>
  );
};

// ===== 3 · before check-in: web check-in, location, spa offer (cream) =====================
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const formAt = W(4, 3);
  const locAt = W(4, 6);
  const spaAt = W(4, 8);
  const fields = [
    ['Guest', 'Ananya & Rohan'],
    ['ID', 'Aadhaar ✓ uploaded'],
    ['Arrival', '14 Feb · 1:30 PM'],
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Check-in se pehle:']], [['sab WhatsApp pe.', true]]]} />
      <Pop t={t} at={formAt - 0.4} style={abs(80, 680)} dy={30}>
        <TCard th={th} style={{width: 920, padding: '20px 24px', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={fl('door')} style={{width: 50, height: 50}} />
            <b style={{fontSize: 30, flex: 1}}>Web check-in</b>
            <Label color={C.green} size={17}>2 min</Label>
          </div>
          {fields.map(([k, v], i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, padding: '10px 14px', borderRadius: 14, background: '#F4F1EB'}}>
              <Label color={th.cardSub} size={16} style={{width: 110}}>{k}</Label>
              <span style={{flex: 1, fontSize: 26, fontWeight: 600}}>{v.slice(0, Math.round(clamp01((t - formAt - i * 0.35) / 0.4) * v.length))}</span>
              <Check size={30} p={ep(t, formAt + i * 0.35 + 0.4, 0.25)} />
            </div>
          ))}
        </TCard>
      </Pop>
      <div style={abs(80, 1050, {width: 920, display: 'flex', gap: 16})}>
        {t > locAt - 0.2 && (
          <Pop t={t} at={locAt - 0.2} dy={30} style={{flex: 1}}>
            <TCard th={th} style={{padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
              <Img src={fl('round_pushpin')} style={{width: 56, height: 56}} />
              <div>
                <b style={{fontSize: 26}}>Palm Bay Resort</b>
                <div style={{fontSize: 20, color: th.cardSub}}>Location · 2.4 km from airport</div>
              </div>
            </TCard>
          </Pop>
        )}
        {t > spaAt - 0.2 && (
          <Pop t={t} at={spaAt - 0.2} dy={30} style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 34, padding: '16px 18px', fontFamily: SANS}}>
              <Img src={fl('herb')} style={{width: 56, height: 56}} />
              <div>
                <b style={{fontSize: 26}}>Couple spa</b>
                <div style={{fontSize: 20, color: '#7CE0A3'}}>20% off for your stay</div>
              </div>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 4 · welcome cake + candle-light dinner upsell, booked instantly (dark) ===========
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const cakeAt = W(5, 2);
  const upAt = W(5, 5);
  const bookAt = W(5, 14);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Welcome cake...']], [['+ dinner upsell.', true]]]} />
      <Pop t={t} at={cakeAt - 0.3} style={abs(80, 680)} dy={30}>
        <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 20, background: '#22201D', borderRadius: 34, padding: '18px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.5)'}}>
          <Icon3D n="shortcake" size={150} t={t} />
          <div style={{flex: 1, background: '#F4EFE6', borderRadius: 10, padding: '16px 20px', transform: 'rotate(-2deg)'}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, color: C.ink, lineHeight: 1.1}}>Happy Anniversary, Ananya & Rohan</div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 17, color: '#8C8780', marginTop: 6, letterSpacing: '0.1em'}}>— TEAM PALM BAY · ROOM 204</div>
          </div>
        </div>
      </Pop>
      {t > upAt - 0.2 && (
        <Pop t={t} at={upAt - 0.2} style={abs(80, 930)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB me time="6:10 PM" tag="Palm Bay · tonight">Aaj raat poolside candle-light dinner? 🕯️ ₹4,500 for 2</BB>
          </div>
        </Pop>
      )}
      {t > upAt + 0.6 && (
        <Pop t={t} at={upAt + 0.6} style={abs(320, 1130)} dy={20}>
          <div style={{display: 'flex', gap: 12}}>
            {['Haan, book karo 💕', 'Baad mein'].map((b, i) => (
              <div key={i} style={{background: i === 0 && t > bookAt ? C.green : '#fff', color: i === 0 && t > bookAt ? '#fff' : C.ink, borderRadius: 22, padding: '12px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 26, opacity: i === 1 && t > bookAt ? 0.4 : 1, transform: `scale(${i === 0 && t > bookAt ? lerp(0.9, 1, sp(t, bookAt)) : 1})`}}>{i === 0 && t > bookAt ? 'Booked ✓' : b}</div>
            ))}
          </div>
        </Pop>
      )}
      {t > bookAt + 0.3 && (
        <Pop t={t} at={bookAt + 0.3} style={abs(330, 1250)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={fl('candle')} style={{width: 60, height: 60}} />
            <Chip img="chart_increasing" txt="+₹4,500 revenue" good size={30} />
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · after check-out: thank you, review, next anniversary reminder (cream) =========
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const tyAt = W(6, 3);
  const starAt = W(6, 6);
  const remAt = W(6, 9);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Check-out ke baad:']], [['review + reminder.', true]]]} />
      <Pop t={t} at={tyAt - 0.3} style={abs(80, 670)} dy={30} from={0.85}>
        <div style={{width: 920}}>
          <BB me time="16 Feb · 1:00 PM" tag="Thank you">Ananya ji, aapko host karke accha laga 💐 30 sec ka review?</BB>
        </div>
      </Pop>
      <Pop t={t} at={starAt - 0.3} style={abs(80, 890)} dy={30}>
        <TCard th={th} style={{width: 480, padding: '18px 22px', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 44, height: 44, borderRadius: 22, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#4285F4'}}>G</div>
            <b style={{fontSize: 24}}>Ananya · Google review</b>
          </div>
          <div style={{display: 'flex', gap: 6, marginTop: 12}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 66, height: 66, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
          <div style={{fontSize: 22, color: '#5A554E', marginTop: 8, opacity: ep(t, starAt + 0.8, 0.4)}}>"Cake + dinner surprise = perfect!"</div>
        </TCard>
      </Pop>
      {t > remAt - 0.3 && (
        <Pop t={t} at={remAt - 0.3} style={abs(600, 880)} dy={30} rot={4}>
          <div style={{width: 400, background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 50px rgba(40,30,20,0.2)', fontFamily: SANS, color: C.ink, textAlign: 'center'}}>
            <div style={{background: C.green, color: '#fff', padding: '10px 0', fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: '0.1em'}}>FEB 2027</div>
            <div style={{fontWeight: 800, fontSize: 110, lineHeight: 1.1}}>14</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 24, fontWeight: 700, paddingBottom: 16}}>
              <Img src={fl('bell')} style={{width: 36, height: 36}} /> Anniversary reminder
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · a year later: she's back, with 4 friends (green) =============================
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const backAt = W(7, 3);
  const frAt = W(7, 8);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Ek saal baad...']], [['phir aayi, 4 dost lekar.', true]]]} />
      <Pop t={t} at={L} style={abs(80, 670)}>
        <div style={{background: 'rgba(255,255,255,0.16)', color: '#fff', borderRadius: 16, padding: '8px 20px', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em'}}>1 FEB 2027 · AUTO REMINDER</div>
      </Pop>
      <Pop t={t} at={L + 0.2} style={abs(80, 740)} dy={30} from={0.85}>
        <div style={{width: 920}}>
          <BB me time="10:00 AM" tag="Returning guest">Ananya ji, anniversary aa rahi hai! 💐 Returning guest offer: 15% off</BB>
        </div>
      </Pop>
      {t > backAt - 0.2 && (
        <Pop t={t} at={backAt - 0.2} style={abs(80, 950)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 28, padding: '16px 22px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
            <Img src={h3('keycard')} style={{width: 110, height: 110, margin: '-14px 0'}} />
            <div style={{flex: 1}}>
              <Label color="#8C8780" size={16}>Booking · direct</Label>
              <b style={{fontSize: 32}}>2 pool villas · 6 guests</b>
            </div>
            <Label color={C.green} size={20}>Repeat ✓</Label>
          </div>
        </Pop>
      )}
      <div style={abs(80, 1140, {width: 920, display: 'flex', justifyContent: 'center', gap: 6})}>
        {t > frAt - 0.4 &&
          ['woman', 'man', 'woman', 'man', 'woman', 'man'].map((f, i) => (
            <div key={i} style={{opacity: ep(t, frAt - 0.4 + i * 0.12, 0.2), transform: `translateY(${(1 - ep(t, frAt - 0.4 + i * 0.12, 0.45)) * 60}px)`}}>
              <Img src={fl(f)} style={{width: 130, height: 130, filter: i < 2 ? 'none' : 'saturate(0.9)'}} />
            </div>
          ))}
      </div>
    </>
  );
};

// ===== 7 · lesson: direct + repeat beats OTA (dark) ======================================
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 6);
  const bars = [
    {at: W(8, 4), l: 'OTA booking', keep: 0.82, txt: '82% aapka', col: '#5A554E'},
    {at: W(8, 7), l: 'Direct booking', keep: 1, txt: '100% + guest data', col: '#2E8B57'},
    {at: W(8, 10), l: 'Repeat guest', keep: 1, txt: '100% · ₹0 ads', col: C.green},
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['OTA se nahi...']], [['direct + repeat se.', true]]]} />
      <div style={abs(80, 690, {width: 920, display: 'flex', flexDirection: 'column', gap: 26})}>
        {bars.map((b, i) => {
          const k = ep(t, b.at, 0.9);
          return (
            <div key={i} style={{opacity: ep(t, b.at - 0.2, 0.3)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, color: '#fff', fontSize: 30, fontWeight: 700, marginBottom: 10}}>
                <span style={{position: 'relative'}}>
                  {b.l}
                  {i === 0 && <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />}
                </span>
                <span style={{fontFamily: MONO, color: i ? '#7CE0A3' : '#FF8A8A'}}>{b.txt}</span>
              </div>
              <div style={{height: 70, borderRadius: 20, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative'}}>
                <div style={{width: `${b.keep * k * 100}%`, height: '100%', borderRadius: 20, background: b.col}} />
                {i === 0 && <div style={{position: 'absolute', left: `${82 * k}%`, top: 0, bottom: 0, width: `${18 * k}%`, background: 'repeating-linear-gradient(45deg, rgba(229,72,77,0.6) 0 10px, transparent 10px 20px)'}} />}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const LIST = ['Direct booking on WA', 'Pre-arrival check-in', 'Spa + dinner upsells', 'Reviews + reminders', 'Repeat-guest offers'];
export const C8: React.FC<P> = ({t, th}) => {
  const L = W(9, 0);
  const tickA = W(9, 5);
  const cmtAt = W(9, 11);
  const typeAt = W(9, 14);
  const sent = typeAt + 0.6;
  const dm = W(9, 20) - 0.1;
  const folAt = W(9, 29);
  const tapAt = W(9, 31);
  const typed = 'DETAILS'.slice(0, Math.floor(clamp01((t - typeAt + 0.1) / 0.45) * 7));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Yeh sab hum ']], [['aapke liye karein?', true]]]} />
      <Big s={1.08}>
      <Pop t={t} at={L + 0.2} style={abs(110, 680)} dy={40}>
        <TCard th={th} style={{width: 860, padding: '18px 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
            <Img src={staticFile('brand/logo-alpha.png')} style={{width: 54, height: 40, objectFit: 'contain', filter: 'brightness(0.35)'}} />
            <Label color={C.green} size={20}>Done for you · Neuraxine</Label>
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
      {t > W(9, 12) && (
        <div style={abs(620, 880, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, W(9, 12), 1.3))})`, opacity: ep(t, W(9, 12), 0.12), background: C.ink, color: '#fff', borderRadius: 14, padding: '6px 20px', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.12em', boxShadow: '0 14px 30px rgba(0,0,0,0.3)'})}>COMMENT</div>
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>Hotel & Resort Growth Guide.pdf</span>
              </div>
            </div>
            <div style={{background: C.green, color: '#fff', borderRadius: 18, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 20}}>DM</div>
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
      </Big>
    </>
  );
};


export const SCENES = [C0, C1, C2, C3, C4, C5, C6, C7, C8];
