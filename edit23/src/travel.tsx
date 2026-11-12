import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'green', 'cream', 'dark', 'cream'];
/** where the plane sits on the DEL -> GOI route in each scene (0 = Delhi, 1 = Goa) */
export const ROUTE = [0, 0, 0.12, 0.25, 0.45, 1, 0, 0, 0];
type P = {t: number; th: Tok};
const t3 = (n: string) => staticFile(`trv3d/${n}.png`);
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


/** polaroid-style photo tile */
const Polaroid: React.FC<{img: string; cap?: string; w?: number; rot?: number; bg?: string; style?: React.CSSProperties}> = ({img, cap, w = 220, rot = 0, bg = 'linear-gradient(160deg,#CFE9F2,#F6E7C8)', style}) => (
  <div style={{width: w, background: '#fff', padding: w * 0.06, paddingBottom: cap ? w * 0.06 : w * 0.18, borderRadius: 8, boxShadow: '0 18px 36px rgba(0,0,0,0.3)', transform: `rotate(${rot}deg)`, ...style}}>
    <div style={{height: w * 0.86, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <Img src={fl(img)} style={{width: w * 0.62, height: w * 0.62}} />
    </div>
    {cap && <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: w * 0.11, color: C.ink, textAlign: 'center', marginTop: w * 0.04}}>{cap}</div>}
  </div>
);

// ===== 0 · hook: beach photos everywhere, zero bookings (dark) ===========================
const POSTS = [
  {img: 'beach_with_umbrella', cap: 'Goa', rot: -12, x: 40, y: 60},
  {img: 'desert_island', cap: 'Andaman', rot: 7, x: 250, y: 10},
  {img: 'sunrise_over_mountains', cap: 'Manali', rot: -4, x: 470, y: 70},
  {img: 'palm_tree', cap: 'Kerala', rot: 10, x: 680, y: 20},
];
export const C0: React.FC<P> = ({t, th}) => {
  const noAt = W(0, 18);
  const l1 = W(1, 0);
  const memAt = W(1, 5);
  const dekho = W(1, 8);
  const leave = ep(t, l1 - 0.25, 0.45);
  const views = Math.round(lerp(800, 2400, ep(t, 0, 3.5)));
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Sirf beach photos?']], [['Booking kahan hai?', true]]]} />
      {leave < 1 && (
        <div style={abs(60, 690, {width: 960, height: 720, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          {POSTS.map((p, i) => (
            <Pop key={i} t={t} at={-0.6 + i * 0.15} style={abs(p.x, p.y)} rot={p.rot} dy={-40}>
              <div style={{transform: `translateY(${Math.sin(t * 1.3 + i) * 8}px)`}}>
                <Polaroid img={p.img} cap={p.cap} w={230} />
              </div>
            </Pop>
          ))}
          <div style={abs(130, 430, {width: 700, display: 'flex', gap: 18, justifyContent: 'center'})}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 26, padding: '14px 24px', fontFamily: SANS, fontWeight: 700, fontSize: 30}}>
              👁 <span style={{fontFamily: MONO}}>{views.toLocaleString('en-IN')}</span> views
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: t > noAt ? '#FF8A8A' : '#fff', borderRadius: 26, padding: '14px 24px', fontFamily: SANS, fontWeight: 700, fontSize: 30}}>
              <Img src={fl('admission_tickets')} style={{width: 44, height: 44}} /> <span style={{fontFamily: MONO}}>0</span> bookings
            </div>
          </div>
          {t > noAt && (
            <div style={{position: 'absolute', left: 230, top: 200, transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, noAt, 1.3))})`, opacity: ep(t, noAt, 0.12), background: C.red, color: '#fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
              SIRF LIKES, NO TRIPS
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: ep(t, l1 - 0.2, 0.4)})}>
          {/* plane flies across a dashed route, memories pop up behind it */}
          <svg width="920" height="400" style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M 20 330 Q 460 -60 900 330" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" strokeDasharray="14 14" />
          </svg>
          {(() => {
            const p = eio(t, l1, 2.2);
            const x = lerp(20, 900, p);
            const y = (1 - p) * (1 - p) * 330 + 2 * (1 - p) * p * -60 + p * p * 330;
            const ang = Math.atan2(2 * (1 - p) * (-60 - 330) + 2 * p * (330 + 60), 880) * (180 / Math.PI);
            return <Img src={t3('plane_side')} style={{position: 'absolute', left: x - 170, top: y - 170, width: 340, height: 340, transform: `rotate(${ang}deg)`}} />;
          })()}
          {[
            {img: 'selfie', rot: -8, x: 90},
            {img: 'beach_with_umbrella', rot: 5, x: 350},
            {img: 'tropical_drink', rot: -3, x: 610},
          ].map((p, i) =>
            t > memAt - 0.3 + i * 0.18 ? (
              <Pop key={i} t={t} at={memAt - 0.3 + i * 0.18} style={abs(p.x, 330)} rot={p.rot} dy={50}>
                <Polaroid img={p.img} w={220} />
              </Pop>
            ) : null,
          )}
          {t > dekho && (
            <Pop t={t} at={dekho} style={abs(270, 640)}>
              <Chip img="sparkles" txt="Yaadgaar trip" good size={32} />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · Amit sees the Goa reel, WhatsApps at 10 PM with a brief (cream) ================
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const nightAt = W(2, 11);
  const waAt = W(2, 14);
  const brief = [
    {at: W(2, 16), img: 'busts_in_silhouette', txt: '4 log'},
    {at: W(2, 18), img: 'spiral_calendar', txt: 'December'},
    {at: W(2, 20), img: 'money_bag', txt: '₹80k budget'},
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Amit ne dekhi']], [['Goa package reel.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={40} rot={-3}>
        <div style={{position: 'relative', width: 420, height: 560, borderRadius: 34, overflow: 'hidden', background: 'linear-gradient(180deg,#8FD3E8 0%,#CFEFF5 45%,#F6E7C8 70%)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}}>
          <Img src={fl('sun')} style={{position: 'absolute', right: 30, top: 70, width: 110, height: 110, transform: `rotate(${t * 20}deg)`}} />
          <Img src={fl('palm_tree')} style={{position: 'absolute', left: -20, top: 170, width: 220, height: 220}} />
          <Img src={fl('beach_with_umbrella')} style={{position: 'absolute', left: 150, top: 230, width: 240, height: 240, transform: `scale(${1 + ep(t, L, 5) * 0.06})`}} />
          <div style={{position: 'absolute', left: 18, top: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.ink}}>
            <Img src={fl('airplane')} style={{width: 34, height: 34}} /> travel.with.us
          </div>
          <div style={{position: 'absolute', left: 18, bottom: 58, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.ink}}>Goa · 4N/5D</div>
          <div style={{position: 'absolute', left: 18, bottom: 22, fontFamily: MONO, fontWeight: 700, fontSize: 21, color: '#3A3631'}}>from ₹19,999 / person</div>
          <div style={{position: 'absolute', left: 16, right: 16, bottom: 8, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.12)'}}>
            <div style={{width: `${ep(t, L, 6) * 100}%`, height: '100%', borderRadius: 3, background: C.ink}} />
          </div>
        </div>
      </Pop>
      {t > nightAt - 0.2 && (
        <Pop t={t} at={nightAt - 0.2} style={abs(560, 720)} dy={30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', borderRadius: 30, padding: '14px 28px 14px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 40, boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>
            <Img src={fl('crescent_moon')} style={{width: 56, height: 56}} /> 10:12 PM
          </div>
        </Pop>
      )}
      <div style={abs(540, 850, {width: 460, display: 'flex', flexDirection: 'column', gap: 14})}>
        {brief.map((b, i) =>
          t > b.at - 0.15 ? (
            <Pop key={i} t={t} at={b.at - 0.15} dy={24}>
              <TCard th={th} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', fontFamily: SANS}}>
                <Img src={fl(b.img)} style={{width: 54, height: 54}} />
                <b style={{fontSize: 34, flex: 1}}>{b.txt}</b>
                <Check size={36} p={ep(t, b.at + 0.2, 0.3)} />
              </TCard>
            </Pop>
          ) : null,
        )}
      </div>
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1270)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB time="10:12 PM">Hi! Goa trip plan karna hai, December mein 🌴</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI sends 3 options with hotel photos + day-by-day itinerary (green) =============
const OPTS = [
  {n: 'Budget', p: '₹68k', s: '3★ hotel', img: 'hotel'},
  {n: 'Comfort', p: '₹79k', s: '4★ · pool', img: 'beach_with_umbrella'},
  {n: 'Luxe', p: '₹96k', s: 'Beach resort', img: 'desert_island'},
];
const DAYS = [
  ['airplane_arrival', 'Arrive · Baga beach'],
  ['sunrise', 'North Goa forts'],
  ['water_wave', 'Dudhsagar falls'],
  ['sunset', 'Sunset cruise'],
  ['airplane_departure', 'Fly back'],
];
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const optAt = W(3, 3);
  const photoAt = W(3, 7);
  const itiAt = W(3, 10);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['3 options,']], [['day-by-day plan.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="10:12 PM" tag="AI · 5 sec">Amit ji, aapke budget mein 3 best options 👇</BB>
        </div>
      </Pop>
      <div style={abs(80, 850, {width: 920, display: 'flex', gap: 14})}>
        {OPTS.map((o, i) =>
          t > optAt + i * 0.22 ? (
            <Pop key={i} t={t} at={optAt + i * 0.22} dy={30} style={{flex: 1}}>
              <div style={{position: 'relative', background: '#fff', borderRadius: 26, overflow: 'hidden', boxShadow: '0 16px 30px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink, border: i === 1 ? `4px solid ${C.ink}` : '4px solid transparent'}}>
                <div style={{height: 150, background: 'linear-gradient(180deg,#9AD8EA,#F6E7C8)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                  <Img src={fl(o.img)} style={{width: 110, height: 110, transform: `scale(${t > photoAt ? lerp(0.6, 1, sp(t, photoAt + i * 0.12, 1.2)) : 0.6})`, opacity: t > photoAt ? 1 : 0.35}} />
                  {t > photoAt && <div style={{position: 'absolute', right: 8, top: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 8, padding: '2px 8px', fontFamily: MONO, fontSize: 15, fontWeight: 700}}>📷 12</div>}
                </div>
                <div style={{padding: '12px 16px'}}>
                  <Label color="#8C8780" size={16}>{o.n}</Label>
                  <div style={{fontWeight: 800, fontSize: 36}}>{o.p}</div>
                  <div style={{fontSize: 21, color: '#5A554E'}}>{o.s}</div>
                </div>
                {i === 1 && <div style={{position: 'absolute', left: 10, top: 10, background: C.green, color: '#fff', borderRadius: 10, padding: '3px 10px', fontFamily: MONO, fontWeight: 800, fontSize: 15}}>BEST FIT</div>}
              </div>
            </Pop>
          ) : (
            <div key={i} style={{flex: 1}} />
          ),
        )}
      </div>
      {t > itiAt - 0.2 && (
        <Pop t={t} at={itiAt - 0.2} style={abs(80, 1180)} dy={30}>
          <div style={{width: 920, display: 'flex', gap: 10, background: C.ink, borderRadius: 26, padding: '14px 16px'}}>
            {DAYS.map(([img, l], i) => (
              <div key={i} style={{flex: 1, textAlign: 'center', opacity: ep(t, itiAt + i * 0.15, 0.25), transform: `translateY(${(1 - ep(t, itiAt + i * 0.15, 0.35)) * 20}px)`}}>
                <Label color="#7CE0A3" size={15}>Day {i + 1}</Label>
                <Img src={fl(img)} style={{width: 54, height: 54, margin: '6px 0'}} />
                <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 17, color: '#fff', lineHeight: 1.2}}>{l}</div>
              </div>
            ))}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · choose, pay advance, all bookings in one PDF (cream) ==========================
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const choose = W(4, 3);
  const pay = W(4, 6);
  const pdfAt = W(4, 10);
  const inside = [
    ['airplane', 'Flights · DEL ⇄ GOI'],
    ['hotel', 'Hotel · 4 nights'],
    ['taxi', 'Airport cabs'],
    ['clipboard', 'Day-by-day plan'],
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Choose, pay,']], [['sab ek PDF mein.', true]]]} />
      <div style={abs(80, 680, {width: 920, display: 'flex', gap: 16})}>
        <Pop t={t} at={L + 0.1} dy={30} style={{flex: 1}}>
          <TCard th={th} style={{padding: '18px 20px', fontFamily: SANS, border: t > choose ? `4px solid ${C.green}` : '4px solid transparent'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Img src={fl('beach_with_umbrella')} style={{width: 60, height: 60}} />
              <div style={{flex: 1}}>
                <Label color={th.cardSub} size={16}>Selected</Label>
                <b style={{fontSize: 30}}>Comfort · ₹79k</b>
              </div>
              <Check size={44} p={ep(t, choose, 0.3)} />
            </div>
          </TCard>
        </Pop>
        <Pop t={t} at={pay - 0.4} dy={30} style={{flex: 1}}>
          <div style={{background: C.ink, color: '#fff', borderRadius: 34, padding: '18px 20px', fontFamily: SANS, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
            <Label color="#9A948C" size={16}>Advance · UPI</Label>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <b style={{fontFamily: MONO, fontSize: 36}}>₹20,000</b>
              <span style={{background: t > pay ? C.green : 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '4px 12px', fontWeight: 800, fontSize: 22}}>{t > pay ? 'Paid ✓' : 'Pay'}</span>
            </div>
          </div>
        </Pop>
      </div>
      {t > pdfAt - 0.3 && (
        <Pop t={t} at={pdfAt - 0.3} style={abs(80, 880)} dy={30}>
          <div style={{width: 920, background: '#D9FDD3', borderRadius: 34, borderTopRightRadius: 8, padding: '20px 24px', boxShadow: '0 18px 36px rgba(0,0,0,0.14)', fontFamily: SANS, color: C.ink}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: '0.1em', color: C.green}}>WHATSAPP · BOOKING CONFIRMED</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 20, padding: '14px 18px', marginTop: 10}}>
              <div style={{width: 64, height: 80, borderRadius: 10, background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 20}}>PDF</div>
              <div style={{flex: 1}}>
                <b style={{fontSize: 30}}>Goa_Trip_Amit.pdf</b>
                <div style={{fontSize: 21, color: '#8C8780'}}>6 pages · 1.2 MB</div>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14}}>
              {inside.map(([img, l], i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, fontWeight: 600, opacity: ep(t, pdfAt + 0.3 + i * 0.2, 0.25)}}>
                  <Check size={30} p={ep(t, pdfAt + 0.4 + i * 0.2, 0.25)} />
                  <Img src={fl(img)} style={{width: 40, height: 40}} /> {l}
                </div>
              ))}
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · day before: boarding pass, cab, packing checklist (dark) =======================
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const flAt = W(5, 5);
  const cabAt = W(5, 7);
  const packAt = W(5, 10);
  const pack = [
    ['passport_control', 'ID cards'],
    ['sunglasses', 'Sunglasses'],
    ['camera', 'Camera'],
    ['luggage', 'Swimwear'],
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Ek din pehle:']], [['sab ready.', true]]]} />
      <Pop t={t} at={flAt - 0.4} style={abs(80, 680)} dy={30}>
        <div style={{width: 920, display: 'flex', background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', fontFamily: SANS, color: C.ink}}>
          <div style={{flex: 1, padding: '20px 26px'}}>
            <Label color={C.green} size={17}>Boarding pass · 6E 2341</Label>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 8}}>
              <div>
                <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 60}}>DEL</div>
                <div style={{fontSize: 20, color: '#8C8780'}}>06:15 AM</div>
              </div>
              <div style={{flex: 1, position: 'relative', height: 4, background: '#E6E2DA', borderRadius: 2}}>
                <Img src={fl('airplane')} style={{position: 'absolute', left: `${ep(t, flAt, 1.2) * 80}%`, top: -26, width: 52, height: 52, transform: 'rotate(45deg)'}} />
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 60}}>GOI</div>
                <div style={{fontSize: 20, color: '#8C8780'}}>08:50 AM</div>
              </div>
            </div>
          </div>
          <div style={{width: 170, borderLeft: '4px dashed #E6E2DA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4}}>
            <Label color="#8C8780" size={15}>Gate</Label>
            <b style={{fontFamily: MONO, fontSize: 48}}>32</b>
            <Label color="#8C8780" size={15}>Seats 14A-D</Label>
          </div>
        </div>
      </Pop>
      {t > cabAt - 0.3 && (
        <Pop t={t} at={cabAt - 0.3} style={abs(80, 920)} dy={30}>
          <div style={{width: 440, display: 'flex', alignItems: 'center', gap: 14, background: '#22201D', color: '#fff', borderRadius: 26, padding: '16px 20px', fontFamily: SANS}}>
            <Img src={fl('oncoming_taxi')} style={{width: 76, height: 76}} />
            <div>
              <Label color="#9A948C" size={15}>Cab · pickup</Label>
              <b style={{fontSize: 30}}>3:45 AM</b>
              <div style={{fontSize: 20, color: '#C9C4BC'}}>White Dzire · DL1C 4421</div>
            </div>
          </div>
        </Pop>
      )}
      {t > packAt - 0.3 && (
        <Pop t={t} at={packAt - 0.3} style={abs(540, 920)} dy={30}>
          <div style={{width: 460, background: '#fff', borderRadius: 26, padding: '14px 20px', fontFamily: SANS, color: C.ink}}>
            <Label color={C.green} size={16}>Packing checklist</Label>
            {pack.map(([img, l], i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 25, fontWeight: 600}}>
                <Check size={30} p={ep(t, packAt + 0.2 + i * 0.25, 0.25)} />
                <Img src={fl(img)} style={{width: 38, height: 38}} /> {l}
              </div>
            ))}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · in Goa: morning plan + one-message support (green) ============================
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const planAt = W(6, 3);
  const probAt = W(6, 8);
  const supAt = W(6, 15);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har subah plan,']], [['har problem pe support.', true]]]} />
      <Pop t={t} at={planAt - 0.3} style={abs(80, 670)} dy={30}>
        <div style={{width: 920, display: 'flex', alignItems: 'flex-start', gap: 14}}>
          <Icon3D n="sunrise" size={120} t={t} />
          <div style={{flex: 1}}>
            <BB me time="7:30 AM" tag="Day 3 · Good morning ☀️">10 AM Dudhsagar trip · 7 PM sunset cruise. Cab 9:30 pe neeche hogi 🚕</BB>
          </div>
        </div>
      </Pop>
      {t > probAt - 0.2 && (
        <Pop t={t} at={probAt - 0.2} style={abs(80, 960)} dy={30} from={0.85}>
          <div style={{width: 760}}>
            <BB time="9:12 PM">Room ka AC kaam nahi kar raha 😓</BB>
          </div>
        </Pop>
      )}
      {t > supAt - 0.5 && (
        <Pop t={t} at={supAt - 0.5} style={abs(80, 1110)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB me time="9:20 PM" tag="Support">Sorry Amit ji! Room change ho gaya, 204 → 311 ✓</BB>
          </div>
        </Pop>
      )}
      {t > supAt + 0.3 && (
        <Pop t={t} at={supAt + 0.3} style={abs(560, 1290)} rot={6}>
          <Chip img="alarm_clock" txt="Fixed in 8 min" light size={30} />
        </Pop>
      )}
    </>
  );
};

// ===== 6 · back home: review, tagged photos, number shared in office group (cream) =========
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const starAt = W(7, 4);
  const tagAt = W(7, 10);
  const grpAt = W(7, 15);
  const leadAt = W(7, 20);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Wapas aakar:']], [['review, tags, referral.', true]]]} />
      <Pop t={t} at={starAt - 0.4} style={abs(80, 680)} dy={30}>
        <TCard th={th} style={{width: 500, padding: '18px 22px', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 44, height: 44, borderRadius: 22, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#4285F4'}}>G</div>
            <b style={{fontSize: 25}}>Amit · Google review</b>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 12}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 70, height: 70, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
          <div style={{fontSize: 22, color: '#5A554E', marginTop: 8, opacity: ep(t, starAt + 0.8, 0.4)}}>"Zero tension trip. Family khush!"</div>
        </TCard>
      </Pop>
      {t > tagAt - 0.3 && (
        <Pop t={t} at={tagAt - 0.3} style={abs(620, 660)} dy={40} rot={6}>
          <div style={{position: 'relative'}}>
            <Polaroid img="selfie" w={300} bg="linear-gradient(180deg,#9AD8EA,#F6E7C8)" />
            <div style={{position: 'absolute', left: 30, top: 200, background: '#fff', borderRadius: 10, padding: '6px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.ink, boxShadow: '0 6px 14px rgba(0,0,0,0.2)', transform: `scale(${sp(t, tagAt + 0.3, 1.3)})`}}>@travel.with.us</div>
          </div>
        </Pop>
      )}
      {t > grpAt - 0.4 && (
        <Pop t={t} at={grpAt - 0.4} style={abs(80, 1020)} dy={30}>
          <div style={{width: 920, background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 20px 40px rgba(40,30,20,0.16)', fontFamily: SANS, color: C.ink}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#075E54', color: '#fff', padding: '12px 18px'}}>
              <Img src={fl('office_building')} style={{width: 42, height: 42}} />
              <b style={{fontSize: 26}}>Office Gang 💼</b>
              <span style={{fontSize: 20, opacity: 0.75}}>48 members</span>
            </div>
            <div style={{padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10, background: '#EFEAE2'}}>
              <div style={{alignSelf: 'flex-end', background: '#D9FDD3', borderRadius: 18, padding: '10px 16px', fontSize: 25, maxWidth: 640}}>Goa trip inse karwaya, ekdum smooth 👌 📇 travel.with.us · +91 98xxx</div>
              {t > leadAt - 0.4 && (
                <div style={{display: 'flex', gap: 10, opacity: ep(t, leadAt - 0.4, 0.3)}}>
                  {['Number save kar liya!', 'Mujhe bhi chahiye 🙋'].map((m, i) => (
                    <div key={i} style={{background: '#fff', borderRadius: 18, padding: '8px 14px', fontSize: 23, opacity: ep(t, leadAt - 0.4 + i * 0.3, 0.25)}}>{m}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Pop>
      )}
      {t > leadAt + 0.3 && (
        <Pop t={t} at={leadAt + 0.3} style={abs(700, 980)} rot={8}>
          <Chip img="busts_in_silhouette" txt="+3 enquiries" good size={30} />
        </Pop>
      )}
    </>
  );
};

// ===== 7 · lesson: memories -> referrals (dark) ==========================================
const PILE = [
  {img: 'selfie', x: 330, y: 120, r: -10},
  {img: 'beach_with_umbrella', x: 190, y: 190, r: 8},
  {img: 'sunset', x: 470, y: 200, r: -4},
  {img: 'tropical_drink', x: 260, y: 300, r: 12},
  {img: 'water_wave', x: 420, y: 330, r: -12},
  {img: 'palm_tree', x: 330, y: 250, r: 3},
];
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 7);
  const memAt = W(8, 8);
  const refAt = W(8, 11);
  const refs = Math.round(lerp(0, 6, clamp01((t - refAt) / 1.2)));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Packages se nahi...']], [['yaadon se badhta hai.', true]]]} />
      <div style={abs(80, 650, {width: 920, height: 780})}>
        <Pop t={t} at={L + 0.3} style={abs(0, 40)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 24, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > noAt ? 0.45 : 1}}>
            <Img src={fl('admission_tickets')} style={{width: 46, height: 46}} /> Sirf packages bechna
            <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />
          </div>
        </Pop>
        {PILE.map((p, i) => {
          const at = memAt + i * 0.16;
          if (t < at) return null;
          const k = ep(t, at, 0.45);
          return (
            <div key={i} style={{position: 'absolute', left: p.x * 1.3 - 160, top: p.y * 1.4 + (1 - k) * -260, opacity: k, transform: `rotate(${p.r + (1 - k) * 30}deg)`}}>
              <div style={{position: 'relative'}}>
                <Polaroid img={p.img} w={280} />
                {t > refAt + i * 0.2 && (
                  <div style={{position: 'absolute', right: -14, top: -14, background: C.green, color: '#fff', borderRadius: 16, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 20, transform: `scale(${sp(t, refAt + i * 0.2, 1.3)})`, boxShadow: '0 8px 16px rgba(0,0,0,0.3)'}}>+1 trip</div>
                )}
              </div>
            </div>
          );
        })}
        {t > refAt && (
          <Pop t={t} at={refAt} style={abs(560, 40)}>
            <div style={{background: C.green, color: '#fff', borderRadius: 24, padding: '12px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>
              Referral trips: <span style={{fontFamily: MONO, fontWeight: 800}}>+{refs}</span>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

const LIST = ['Instant AI reply', 'Package options', 'Bookings in 1 PDF', 'Trip-day support', 'Reviews + referrals'];
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>Travel Agency Growth Guide.pdf</span>
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
