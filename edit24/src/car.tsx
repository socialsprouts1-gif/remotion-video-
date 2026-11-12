import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'green', 'cream', 'dark', 'cream'];
/** speedometer needle per scene (0..1): the deal picks up speed */
export const SPEED = [0, 0.14, 0.32, 0.5, 0.68, 0.88, 1, 1, 1];
type P = {t: number; th: Tok};
const c3 = (n: string) => staticFile(`car3d/${n}.png`);
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


// ===== 0 · hook: launch post gets "Price?" DMs that nobody answers (dark) =================
const DMS = ['Price?', 'On-road kitna?', 'EMI options?', 'Price pls', 'Test drive?', 'Diesel hai?'];
export const C0: React.FC<P> = ({t, th}) => {
  const noAt = W(0, 20);
  const l1 = W(1, 0);
  const drive = W(1, 2);
  const dekho = W(1, 8);
  const leave = ep(t, l1 - 0.25, 0.45);
  const unread = Math.round(lerp(40, 214, ep(t, 0, 4)));
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['214 ne poocha "Price?"']], [['reply kitno ko gaya?', true]]]} />
      {leave < 1 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          <Pop t={t} at={-0.6} style={abs(0, 0)} rot={-3}>
            <div style={{width: 430, background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', fontFamily: SANS, color: C.ink}}>
              <div style={{height: 300, background: 'linear-gradient(170deg,#E9F1EA,#F4EFE6)', position: 'relative'}}>
                <Img src={c3('suv')} style={{position: 'absolute', left: -10, top: -40, width: 450, height: 450}} />
                <div style={{position: 'absolute', left: 14, top: 14, background: C.green, color: '#fff', borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 18}}>ALL-NEW SUV</div>
              </div>
              <div style={{padding: '12px 16px', fontWeight: 800, fontSize: 24}}>
                <span style={{color: C.red}}>♥</span> 3,812 likes · launch post
              </div>
            </div>
          </Pop>
          <div style={abs(470, -10, {width: 450})}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 28, marginBottom: 10}}>
              <span>DMs</span>
              <span style={{background: C.red, borderRadius: 16, padding: '2px 14px', fontFamily: MONO, fontSize: 24}}>{unread} unread</span>
            </div>
            {DMS.map((m, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, background: '#22201D', borderRadius: 20, padding: '12px 14px', marginBottom: 10, opacity: ep(t, -0.4 + i * 0.25, 0.3), transform: `translateX(${(1 - ep(t, -0.4 + i * 0.25, 0.4)) * 40}px)`}}>
                <Img src={fl(['man', 'woman', 'person', 'boy', 'man', 'woman'][i])} style={{width: 46, height: 46}} />
                <div style={{flex: 1, fontFamily: SANS, color: '#fff', fontSize: 25, fontWeight: 600}}>{m}</div>
                <div style={{width: 14, height: 14, borderRadius: 7, background: '#4A9DFF'}} />
              </div>
            ))}
          </div>
          {t > noAt && (
            <div style={{position: 'absolute', left: 120, top: 520, transform: `rotate(-6deg) scale(${lerp(2.2, 1, sp(t, noAt, 1.3))})`, opacity: ep(t, noAt, 0.12), background: C.red, color: '#fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.06em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
              202 BUYERS = NO REPLY
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: ep(t, l1 - 0.2, 0.4)})}>
          {/* road from enquiry to delivery */}
          <div style={abs(0, 330, {width: 920, height: 120, background: '#2A2724', borderRadius: 60})}>
            <div style={{position: 'absolute', left: 60, right: 60, top: 57, height: 6, backgroundImage: 'repeating-linear-gradient(90deg, #F4EFE6 0 40px, transparent 40px 80px)', backgroundPosition: `${-t * 300}px 0`}} />
          </div>
          {[
            {x: 0, img: 'speech_balloon', l: 'Enquiry'},
            {x: 780, img: 'key', l: 'Delivery'},
          ].map((p, i) => (
            <Pop key={i} t={t} at={l1 + i * 0.3} style={abs(p.x, 150)}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <div style={{width: 140, height: 140, borderRadius: 70, background: i ? C.green : '#22201D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
                  <Icon3D n={p.img} size={86} t={t} seed={i} />
                </div>
                <Label color="#C9C4BC" size={20}>{p.l}</Label>
              </div>
            </Pop>
          ))}
          {t > drive - 0.3 && <Img src={c3('suv_side')} style={{position: 'absolute', left: lerp(-120, 380, eio(t, drive - 0.3, 2.2)), top: 150, width: 420, height: 420}} />}
          {t > dekho && (
            <Pop t={t} at={dekho} style={abs(290, 520)}>
              <Chip img="chequered_flag" txt="Enquiry → Delivery" good size={32} />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · Rahul sees the SUV reel, WhatsApps at 9 PM: "Price?" (cream) ===================
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const nightAt = W(2, 10);
  const waAt = W(2, 13);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Rahul ne dekhi']], [['SUV wali reel.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={40} rot={-2}>
        <div style={{position: 'relative', width: 560, height: 560, borderRadius: 34, overflow: 'hidden', background: 'linear-gradient(170deg,#E9F1EA,#F4EFE6)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}}>
          <Img src={c3('suv')} style={{position: 'absolute', left: -20, top: 0, width: 600, height: 600, transform: `translateX(${(1 - ep(t, L, 1.2)) * -80}px) scale(${1 + ep(t, L, 6) * 0.06})`}} />
          <div style={{position: 'absolute', left: 18, top: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.ink}}>
            <Img src={fl('automobile')} style={{width: 34, height: 34}} /> city.motors
          </div>
          <div style={{position: 'absolute', left: 18, bottom: 50, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.ink}}>The new SUV · test drive now</div>
          <div style={{position: 'absolute', left: 18, bottom: 18, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#6B655C'}}>▶ 1.4M views</div>
        </div>
      </Pop>
      {t > nightAt - 0.2 && (
        <Pop t={t} at={nightAt - 0.2} style={abs(660, 760)} dy={30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', borderRadius: 30, padding: '14px 26px 14px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 38, boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>
            <Img src={fl('crescent_moon')} style={{width: 52, height: 52}} /> 9:05 PM
          </div>
        </Pop>
      )}
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1270)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB time="9:05 PM">Hi! Is SUV ka on-road price kya hai? 🚙</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI: on-road price, EMI options, Sunday test drive (green) ======================
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const priceAt = W(3, 3);
  const emiAt = W(3, 6);
  const tdAt = W(3, 10);
  const bookAt = W(3, 14);
  const rows = [
    ['Ex-showroom', 14.2],
    ['RTO + tax', 1.4],
    ['Insurance', 0.6],
  ] as const;
  const total = rows.reduce((a, [, v], i) => a + v * clamp01((t - priceAt - i * 0.3) / 0.3), 0);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Price, EMI,']], [['test drive. 30 sec mein.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="9:05 PM" tag="AI · 6 sec">Hi Rahul! Indore on-road price 👇</BB>
        </div>
      </Pop>
      <div style={abs(80, 850, {width: 920, display: 'flex', gap: 16})}>
        <Pop t={t} at={priceAt - 0.3} dy={30} style={{flex: 1.1}}>
          <div style={{background: '#fff', borderRadius: 28, padding: '16px 20px', boxShadow: '0 16px 30px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
            {rows.map(([k, v], i) => (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, padding: '7px 0', borderBottom: '1px solid #EEEAE3', opacity: ep(t, priceAt + i * 0.3, 0.25)}}>
                <span>{k}</span>
                <b>₹{v}L</b>
              </div>
            ))}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8}}>
              <b style={{fontSize: 24}}>On-road</b>
              <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.green}}>₹{total.toFixed(1)}L</span>
            </div>
          </div>
        </Pop>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          {[
            ['5 yr', '₹26,900/mo'],
            ['7 yr', '₹21,400/mo'],
          ].map(([y, e], i) =>
            t > emiAt - 0.2 + i * 0.25 ? (
              <Pop key={i} t={t} at={emiAt - 0.2 + i * 0.25} dy={24}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 24, padding: '14px 18px', fontFamily: SANS}}>
                  <Img src={fl('bank')} style={{width: 46, height: 46}} />
                  <div>
                    <Label color="#9A948C" size={15}>EMI · {y}</Label>
                    <b style={{fontSize: 30, fontFamily: MONO}}>{e}</b>
                  </div>
                </div>
              </Pop>
            ) : null,
          )}
        </div>
      </div>
      {t > tdAt - 0.3 && (
        <Pop t={t} at={tdAt - 0.3} style={abs(80, 1150)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 28, padding: '16px 22px', boxShadow: '0 16px 30px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
            <Img src={fl('spiral_calendar')} style={{width: 64, height: 64}} />
            <div style={{flex: 1}}>
              <Label color="#8C8780" size={16}>Test drive</Label>
              <b style={{fontSize: 34}}>Sunday · 11:00 AM</b>
            </div>
            <div style={{borderRadius: 18, padding: '10px 22px', fontWeight: 800, fontSize: 28, background: t > bookAt ? C.green : '#EEEAE3', color: t > bookAt ? '#fff' : C.ink, transform: `scale(${t > bookAt ? lerp(0.9, 1, sp(t, bookAt)) : 1})`}}>{t > bookAt ? 'Booked ✓' : 'Book'}</div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · reminder + location 1 hr before, family arrives (cream) ========================
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const remAt = W(4, 6);
  const locAt = W(4, 8);
  const famAt = W(4, 11);
  const fam = ['man', 'woman', 'girl', 'old_woman'];
  const route = 'M 40 230 L 200 230 L 200 110 L 420 110 L 420 60';
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['1 ghanta pehle:']], [['reminder + location.', true]]]} />
      <Pop t={t} at={remAt - 0.3} style={abs(80, 680)} dy={-40}>
        <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(30,28,26,0.92)', color: '#fff', borderRadius: 34, padding: '20px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
          <div style={{width: 76, height: 76, borderRadius: 20, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 50, height: 50}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <b style={{fontSize: 28}}>city.motors</b>
              <span style={{fontFamily: MONO, fontSize: 20, color: '#9A948C'}}>Sun · 10:00 AM</span>
            </div>
            <div style={{fontSize: 26, color: '#E3DED6', marginTop: 4}}>Test drive 11 AM · SUV ready hai, location 👇</div>
          </div>
          <Img src={fl('bell')} style={{width: 54, height: 54, transform: `rotate(${Math.sin((t - remAt) * 18) * 16 * (1 - ep(t, remAt, 1.2))}deg)`}} />
        </div>
      </Pop>
      {t > locAt - 0.3 && (
        <Pop t={t} at={locAt - 0.3} style={abs(80, 880)} dy={30}>
          <TCard th={th} style={{width: 460, padding: 16}}>
            <div style={{position: 'relative', height: 280, borderRadius: 20, background: '#E8EFE6', overflow: 'hidden'}}>
              <svg width="428" height="280" style={{position: 'absolute', inset: 0}}>
                {[60, 140, 220].map((y) => <line key={y} x1="0" y1={y} x2="428" y2={y} stroke="#fff" strokeWidth="14" />)}
                {[90, 200, 330].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="280" stroke="#fff" strokeWidth="14" />)}
                <path d={route} fill="none" stroke={C.green} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="700" strokeDashoffset={700 * (1 - eio(t, locAt, 1.4))} />
              </svg>
              <Img src={fl('round_pushpin')} style={{position: 'absolute', left: 392, top: 6, width: 56, height: 56, transform: `translateY(${(1 - sp(t, locAt + 1, 1.2)) * -30}px)`}} />
              <Img src={fl('oncoming_automobile')} style={{position: 'absolute', left: 14, top: 200, width: 50, height: 50}} />
            </div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, marginTop: 10}}>City Motors · AB Road · 12 min</div>
          </TCard>
        </Pop>
      )}
      {t > famAt - 0.3 && (
        <div style={abs(570, 900, {width: 430, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center'})}>
          {fam.map((f, i) => (
            <Img key={f} src={fl(f)} style={{width: 150, height: 150, opacity: ep(t, famAt - 0.3 + i * 0.14, 0.2), transform: `translateY(${(1 - ep(t, famAt - 0.3 + i * 0.14, 0.45)) * 50}px)`}} />
          ))}
        </div>
      )}
    </>
  );
};

// ===== 4 · next day: exchange offer + loan approval on WhatsApp (dark) ====================
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const exAt = W(5, 3);
  const loanAt = W(5, 6);
  const apprAt = W(5, 7);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Agle din follow-up:']], [['offer + loan.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="Mon 11:00 AM" tag="Auto follow-up">Rahul ji, test drive kaisi lagi? Aapke liye 2 updates 👇</BB>
        </div>
      </Pop>
      <div style={abs(80, 880, {width: 920, display: 'flex', flexDirection: 'column', gap: 16})}>
        {t > exAt - 0.3 && (
          <Pop t={t} at={exAt - 0.3} dy={30}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 30, padding: '18px 22px', fontFamily: SANS, color: C.ink, boxShadow: '0 24px 50px rgba(0,0,0,0.5)'}}>
              <Img src={fl('automobile')} style={{width: 84, height: 84}} />
              <div style={{flex: 1}}>
                <Label color="#8C8780" size={17}>Exchange · old hatchback</Label>
                <b style={{fontSize: 34}}>Value: ₹3.8 L</b>
              </div>
              <div style={{fontSize: 44}}>⇄</div>
              <Img src={c3('suv')} style={{width: 130, height: 130, margin: '-20px 0'}} />
            </div>
          </Pop>
        )}
        {t > loanAt - 0.3 && (
          <Pop t={t} at={loanAt - 0.3} dy={30}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 30, padding: '18px 22px', fontFamily: SANS, color: C.ink, boxShadow: '0 24px 50px rgba(0,0,0,0.5)'}}>
              <Img src={fl('bank')} style={{width: 84, height: 84}} />
              <div style={{flex: 1}}>
                <Label color="#8C8780" size={17}>Car loan · ₹12 L @ 8.9%</Label>
                <div style={{marginTop: 10}}>
                  <Bar p={ep(t, loanAt, apprAt - loanAt + 0.4)} h={16} />
                </div>
              </div>
              <div style={{borderRadius: 16, padding: '8px 16px', fontWeight: 800, fontSize: 26, background: t > apprAt + 0.3 ? C.green : '#EEEAE3', color: t > apprAt + 0.3 ? '#fff' : C.ink}}>{t > apprAt + 0.3 ? 'Approved ✓' : 'Checking…'}</div>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 5 · delivery day: family photo + Instagram shoutout (green) ========================
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const photoAt = W(6, 6);
  const igAt = W(6, 9);
  const likes = Math.round(lerp(0, 486, ep(t, igAt + 0.3, 2)));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Delivery day:']], [['photo + shoutout.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(30, 640)} from={0.5}>
        <div style={{position: 'relative', width: 620, height: 620}}>
          <Img src={c3('suv')} style={{width: 620, height: 620}} />
          <Img src={fl('ribbon')} style={{position: 'absolute', left: 250, top: 150, width: 150, height: 150, transform: `scale(${sp(t, L + 0.5, 1.2)})`}} />
          <div style={abs(420, 380)}>
            <Icon3D n="key" size={120} t={t} seed={1} />
          </div>
        </div>
      </Pop>
      {t > photoAt - 0.3 && (
        <Pop t={t} at={photoAt - 0.3} style={abs(620, 680)} dy={40} rot={6}>
          <div style={{width: 360, background: '#fff', padding: 16, paddingBottom: 50, borderRadius: 8, boxShadow: '0 24px 50px rgba(0,0,0,0.3)'}}>
            <div style={{height: 300, background: 'linear-gradient(170deg,#E9F1EA,#F4EFE6)', position: 'relative', overflow: 'hidden'}}>
              <Img src={c3('suv_side')} style={{position: 'absolute', left: -20, top: 20, width: 380, height: 380}} />
              <div style={{position: 'absolute', left: 10, top: 20, display: 'flex'}}>
                {['man', 'woman', 'girl', 'old_woman'].map((f) => (
                  <Img key={f} src={fl(f)} style={{width: 80, height: 80, marginRight: -10}} />
                ))}
              </div>
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 30, color: C.ink, textAlign: 'center', marginTop: 8}}>Welcome home!</div>
          </div>
        </Pop>
      )}
      {t > igAt - 0.2 && (
        <Pop t={t} at={igAt - 0.2} style={abs(80, 1200)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 28, padding: '14px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', fontFamily: SANS, color: C.ink}}>
            <div style={{width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('party_popper')} style={{width: 36, height: 36}} />
            </div>
            <div style={{flex: 1}}>
              <b style={{fontSize: 26}}>city.motors</b>
              <div style={{fontSize: 24, color: '#3A3631'}}>Congratulations Rahul & family! 🎉 @rahul.v</div>
            </div>
            <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.red}}>♥ {likes}</div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · service reminders every 6 months, brother referred after 2 years (cream) =======
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const svc = [W(7, 1), W(7, 2), W(7, 4), W(7, 5)];
  const twoAt = W(7, 6);
  const broAt = W(7, 11);
  const leadAt = W(7, 17);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har 6 mahine:']], [['service reminder.', true]]]} />
      <Pop t={t} at={L} style={abs(80, 680)} dy={30}>
        <TCard th={th} style={{width: 920, padding: '20px 24px'}}>
          <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between'}}>
            <div style={{position: 'absolute', left: 50, right: 50, top: 44, height: 6, background: '#EEEAE3', borderRadius: 3}}>
              <div style={{width: `${clamp01((t - svc[0]) / (svc[3] - svc[0] + 0.3)) * 100}%`, height: '100%', background: C.green, borderRadius: 3}} />
            </div>
            {['6 mo', '12 mo', '18 mo', '24 mo'].map((m, i) => {
              const on = t > svc[i];
              return (
                <div key={m} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 140}}>
                  <div style={{width: 94, height: 94, borderRadius: 47, background: on ? C.green : '#F4F1EB', border: `3px solid ${on ? C.green : '#E6E2DA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? sp(t, svc[i], 1.3) : 1})`}}>
                    <Img src={fl('wrench')} style={{width: 52, height: 52, opacity: on ? 1 : 0.3}} />
                  </div>
                  <Label color={th.cardSub} size={18} style={{marginTop: 8}}>{m}</Label>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, color: C.green, opacity: on ? 1 : 0}}>Done ✓</div>
                </div>
              );
            })}
          </div>
        </TCard>
      </Pop>
      {t > twoAt - 0.1 && (
        <Pop t={t} at={twoAt - 0.1} style={abs(80, 960)}>
          <div style={{background: C.ink, color: '#fff', borderRadius: 16, padding: '8px 20px', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em'}}>2 SAAL BAAD</div>
        </Pop>
      )}
      {t > broAt - 0.3 && (
        <Pop t={t} at={broAt - 0.3} style={abs(80, 1040)} dy={30} from={0.85}>
          <div style={{width: 820}}>
            <BB time="6:40 PM">Hi! Rahul bhaiya ne aapka number diya. Mujhe bhi SUV dekhni hai 🙂</BB>
          </div>
        </Pop>
      )}
      {t > leadAt - 0.2 && (
        <Pop t={t} at={leadAt - 0.2} style={abs(640, 960)} rot={6}>
          <Chip img="busts_in_silhouette" txt="+1 buyer, ₹0 ads" good size={30} />
        </Pop>
      )}
    </>
  );
};

// ===== 7 · lesson: trust, service, referrals (dark) =====================================
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 6);
  const pillars = [
    {at: W(8, 7), img: 'handshake', l: 'Trust', h: 300},
    {at: W(8, 8), img: 'wrench', l: 'Service', h: 380},
    {at: W(8, 10), img: 'busts_in_silhouette', l: 'Referrals', h: 460},
  ];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Launch se nahi...']], [['trust se chalta hai.', true]]]} />
      <div style={abs(80, 650, {width: 920, height: 800})}>
        <Pop t={t} at={L + 0.3} style={abs(0, 40)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 24, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > noAt ? 0.45 : 1}}>
            <Img src={fl('camera_with_flash')} style={{width: 46, height: 46}} /> Sirf launch posts
            <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />
          </div>
        </Pop>
        <div style={abs(60, 140, {width: 800, height: 520, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'})}>
          {pillars.map((p, i) => {
            const k = ep(t, p.at, 0.8);
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 200}}>
                <Img src={fl(p.img)} style={{width: 90, height: 90, opacity: k, transform: `translateY(${(1 - k) * 40}px)`}} />
                <div style={{width: 170, height: p.h * k, borderRadius: '24px 24px 8px 8px', background: i === 2 ? C.green : '#2E8B57', opacity: 0.4 + 0.6 * (i + 1) / 3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}} />
                <Label color="#E3DED6" size={22}>{p.l}</Label>
              </div>
            );
          })}
        </div>
        <Img src={c3('suv_side')} style={{position: 'absolute', left: lerp(-300, 700, clamp01((t - L) / 6)), top: 640, width: 260, height: 260}} />
      </div>
    </>
  );
};

const LIST = ['Instant price + EMI', 'Test drive booking', 'Loan follow-up', 'Delivery shoutout', 'Service reminders'];
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>Car Showroom Growth Guide.pdf</span>
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
