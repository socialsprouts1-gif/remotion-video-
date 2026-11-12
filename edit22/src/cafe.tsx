import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'green', 'cream', 'dark', 'cream'];
/** guests at Priya's table in each scene (drives the table HUD) */
export const GUESTS = [0, 1, 4, 4, 4, 7, 7, 7, 7];
type P = {t: number; th: Tok};
const c3 = (n: string) => staticFile(`cafe3d/${n}.png`);
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


// ===== 0 · hook: likes on food photos, empty tables (dark) =============================
const TABLES = [
  [120, 0], [420, 0], [720, 0],
  [120, 250], [420, 250], [720, 250],
];
export const C0: React.FC<P> = ({t, th}) => {
  const igAt = W(0, 14);
  const noAt = W(0, 19);
  const l1 = W(1, 0);
  const regAt = W(1, 4);
  const leave = ep(t, l1 - 0.25, 0.45);
  const likes = Math.round(lerp(380, 1240, ep(t, 0, 3.5)));
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['1.2k likes...']], [['phir bhi tables khaali?', true]]]} />
      {leave < 1 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          {/* top-down floor: 6 tables, almost all empty */}
          {TABLES.map(([x, y], i) => {
            const busy = i === 4;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y + 300, width: 200, height: 200}}>
                {[0, 1, 2, 3].map((k) => {
                  const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
                  return <div key={k} style={{position: 'absolute', left: 100 + Math.cos(a) * 82 - 22, top: 100 + Math.sin(a) * 82 - 22, width: 44, height: 44, borderRadius: 14, background: busy && k < 2 ? C.green : 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)'}} />;
                })}
                <div style={{position: 'absolute', left: 45, top: 45, width: 110, height: 110, borderRadius: 55, background: '#2A2724', border: '2px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, color: '#6B655C'}}>
                  {busy ? <Img src={fl('hot_beverage')} style={{width: 60, height: 60}} /> : `T${i + 1}`}
                </div>
              </div>
            );
          })}
          {/* the instagram post getting likes */}
          <Pop t={t} at={-0.5} style={abs(250, 40)} rot={-4}>
            <div style={{width: 420, background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', fontFamily: SANS, color: C.ink}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px'}}>
                <div style={{width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)', padding: 3}}>
                  <div style={{width: '100%', height: '100%', borderRadius: 18, background: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Img src={fl('hot_beverage')} style={{width: 24, height: 24}} />
                  </div>
                </div>
                <b style={{fontSize: 22}}>brew.and.co</b>
              </div>
              <div style={{height: 260, background: 'linear-gradient(160deg,#F2E6D6,#E9F1EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
                <Img src={c3('latte')} style={{width: 260, height: 260}} />
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontWeight: 800, fontSize: 24}}>
                <span style={{color: C.red, fontSize: 30, transform: `scale(${1 + Math.max(0, Math.sin(t * 6)) * 0.15})`, display: 'inline-block'}}>♥</span> {likes.toLocaleString('en-IN')} likes
              </div>
            </div>
          </Pop>
          {t > igAt && (
            <Pop t={t} at={igAt} style={abs(690, 60)} rot={8}>
              <Chip img="camera_with_flash" txt="Sirf photos" light />
            </Pop>
          )}
          {t > noAt && (
            <div style={{position: 'absolute', left: 200, top: 520, transform: `rotate(-6deg) scale(${lerp(2.2, 1, sp(t, noAt, 1.3))})`, opacity: ep(t, noAt, 0.12), background: C.red, color: '#fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
              5/6 TABLES KHAALI
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: ep(t, l1 - 0.2, 0.4)})}>
          <div style={abs(250, 0, {width: 420, height: 420})}>
            <Pop t={t} at={l1} from={0.4}>
              <Img src={c3('latte')} style={{width: 420, height: 420}} />
            </Pop>
          </div>
          {/* guest -> regular: visit counter */}
          <div style={abs(0, 440, {width: 920, display: 'flex', justifyContent: 'center', gap: 16})}>
            {[1, 2, 3, 4, 5, 6, 7].map((k) => {
              const at = W(1, 2) + k * 0.16;
              return (
                <div key={k} style={{width: 92, height: 92, borderRadius: 46, background: t > at ? C.green : 'rgba(255,255,255,0.06)', border: `3px solid ${t > at ? C.green : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > at ? sp(t, at, 1.3) : 1})`}}>
                  {t > at ? <Img src={fl('hot_beverage')} style={{width: 54, height: 54}} /> : <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, color: '#6B655C'}}>{k}</span>}
                </div>
              );
            })}
          </div>
          {t > regAt && (
            <Pop t={t} at={regAt} style={abs(290, 580)}>
              <Chip img="star" txt="Guest → Regular" good size={32} />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · Saturday 7 PM: Google search, 4.7 rating, menu reel, WhatsApp (cream) ==========
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const typeA = W(2, 6);
  const typeB = W(2, 11) + 0.2;
  const q = 'cafe near me';
  const typed = q.slice(0, Math.round(clamp01((t - typeA) / (typeB - typeA)) * q.length));
  const resAt = W(2, 13);
  const reelAt = W(2, 17);
  const waAt = W(2, 22);
  const rating = lerp(0, 4.7, ep(t, W(2, 14), 0.8));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Saturday, 7 PM.']], [['"cafe near me"', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 690)} dy={30}>
        <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 50, padding: '18px 28px', boxShadow: '0 16px 34px rgba(40,30,20,0.14)', fontFamily: SANS}}>
          <Img src={fl('magnifying_glass_tilted_left')} style={{width: 46, height: 46}} />
          <span style={{fontSize: 36, color: C.ink, fontWeight: 600}}>{typed}</span>
          <span style={{width: 3, height: 40, background: C.green, opacity: Math.sin(t * 10) > 0 ? 1 : 0}} />
          <div style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 700, fontSize: 22, color: '#8C8780'}}>SAT 7:02 PM</div>
        </div>
      </Pop>
      {t > resAt - 0.3 && (
        <Pop t={t} at={resAt - 0.3} style={abs(80, 830)} dy={30}>
          <TCard th={th} style={{width: 520, padding: '22px 24px', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 70, height: 70, borderRadius: 18, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={fl('hot_beverage')} style={{width: 50, height: 50}} />
              </div>
              <div>
                <div style={{fontWeight: 800, fontSize: 32}}>Brew & Co.</div>
                <div style={{fontSize: 22, color: th.cardSub}}>Cafe · Open till 12 AM</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 14}}>
              <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.ink}}>{rating.toFixed(1)}</span>
              {[0, 1, 2, 3, 4].map((k) => (
                <Img key={k} src={fl('star')} style={{width: 38, height: 38, filter: rating >= k + 0.6 ? 'none' : 'grayscale(1) opacity(0.3)'}} />
              ))}
              <span style={{fontSize: 22, color: th.cardSub}}>(812)</span>
            </div>
          </TCard>
        </Pop>
      )}
      {t > reelAt - 0.3 && (
        <Pop t={t} at={reelAt - 0.3} style={abs(630, 810)} dy={40} rot={4}>
          <div style={{position: 'relative', width: 340, height: 420, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(170deg,#F2E6D6,#E9F1EA)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}}>
            <Img src={c3('latte')} style={{position: 'absolute', left: -20, top: 40, width: 380, height: 380, transform: `scale(${1 + ep(t, reelAt, 4) * 0.08})`}} />
            <div style={{position: 'absolute', left: 16, top: 14, background: C.ink, color: '#fff', borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 18}}>▶ MENU REEL</div>
            <div style={{position: 'absolute', left: 16, bottom: 20, display: 'flex', gap: 6}}>
              {['croissant', 'pizza', 'pancakes'].map((n) => (
                <div key={n} style={{width: 56, height: 56, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={fl(n)} style={{width: 40, height: 40}} />
                </div>
              ))}
            </div>
          </div>
        </Pop>
      )}
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1250)} dy={30} from={0.85}>
          <div style={{width: 700}}>
            <BB time="7:04 PM">Hi! Aaj 8 baje 4 logon ki table milegi?</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI books the table + sends the menu (green) =================================
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const ppl = W(3, 7);
  const timeAt = W(3, 9);
  const winAt = W(3, 11);
  const menuAt = W(3, 15);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['AI ne turant']], [['table book kar di.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="7:04 PM" tag="AI · 3 sec">Haan Priya! Table ready hai ✓</BB>
        </div>
      </Pop>
      <Pop t={t} at={ppl - 0.4} style={abs(80, 860)} dy={30}>
        <div style={{width: 920, display: 'flex', gap: 22, background: '#fff', borderRadius: 34, padding: 24, boxShadow: '0 24px 50px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
          {/* top-down table with 4 chairs */}
          <div style={{position: 'relative', width: 220, height: 220, flexShrink: 0}}>
            {[0, 1, 2, 3].map((k) => {
              const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
              const on = t > ppl + k * 0.15;
              return <div key={k} style={{position: 'absolute', left: 110 + Math.cos(a) * 86 - 26, top: 110 + Math.sin(a) * 86 - 26, width: 52, height: 52, borderRadius: 16, background: on ? C.green : '#EEEAE3', transform: `scale(${on ? sp(t, ppl + k * 0.15, 1.3) : 1})`}} />;
            })}
            <div style={{position: 'absolute', left: 55, top: 55, width: 110, height: 110, borderRadius: 55, background: '#F4EFE6', border: '3px solid #E2DCD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 28}}>T6</div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12}}>
            {[
              {at: ppl, img: 'busts_in_silhouette', k: 'Guests', v: '4 log'},
              {at: timeAt, img: 'alarm_clock', k: 'Time', v: '8:00 PM'},
              {at: winAt, img: 'window', k: 'Seat', v: 'Window ✓'},
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: ep(t, r.at - 0.1, 0.3), transform: `translateX(${(1 - ep(t, r.at - 0.1, 0.4)) * 30}px)`}}>
                <Img src={fl(r.img)} style={{width: 50, height: 50}} />
                <Label color="#8C8780" size={19} style={{width: 110}}>{r.k}</Label>
                <b style={{fontSize: 34}}>{r.v}</b>
              </div>
            ))}
          </div>
        </div>
      </Pop>
      {t > menuAt - 0.2 && (
        <Pop t={t} at={menuAt - 0.2} style={abs(380, 1170)} dy={30}>
          <div style={{width: 620, display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', borderRadius: 28, padding: '14px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <Img src={fl('fork_and_knife_with_plate')} style={{width: 60, height: 60}} />
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 28}}>Menu · 42 items</div>
              <div style={{fontSize: 20, color: '#9A948C'}}>brewandco.in/menu</div>
            </div>
            <div style={{display: 'flex'}}>
              {['croissant', 'pizza', 'shortcake'].map((n, i) => (
                <Img key={n} src={fl(n)} style={{width: 50, height: 50, marginLeft: -8, opacity: ep(t, menuAt + i * 0.12, 0.2)}} />
              ))}
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · QR order at the table, bill on WhatsApp (cream) ===============================
const QR = Array.from({length: 21 * 21}).map((_, i) => {
  const x = i % 21;
  const y = Math.floor(i / 21);
  const fin = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7 && (x === fx || x === fx + 6 || y === fy || y === fy + 6 || (x >= fx + 2 && x <= fx + 4 && y >= fy + 2 && y <= fy + 4));
  if (fin(0, 0) || fin(14, 0) || fin(0, 14)) return true;
  if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) return false;
  return ((x * 7 + y * 13 + x * y) % 5) < 2;
});
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const scanA = W(4, 2);
  const ordAt = W(4, 5);
  const billAt = W(4, 8);
  const items = [
    ['hot_beverage', 'Cappuccino × 2', '₹440'],
    ['pizza', 'Farmhouse pizza', '₹620'],
    ['pancakes', 'Pancakes', '₹380'],
    ['shortcake', 'Cheesecake', '₹400'],
  ];
  const scan = clamp01((t - scanA) / 0.9);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['QR scan, order,']], [['bill WhatsApp par.', true]]]} />
      <Pop t={t} at={L} style={abs(80, 690)} dy={30}>
        <TCard th={th} style={{width: 340, padding: 24, textAlign: 'center'}}>
          <div style={{position: 'relative', width: 292, height: 292, display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)'}}>
            {QR.map((on, i) => (
              <div key={i} style={{background: on ? C.ink : 'transparent'}} />
            ))}
            {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: -10, right: -10, top: scan * 292, height: 5, background: C.green, boxShadow: '0 0 16px 4px rgba(31,157,85,0.6)'}} />}
          </div>
          <Label color={th.cardSub} size={18} style={{marginTop: 14}}>Table 6 · Scan to order</Label>
        </TCard>
      </Pop>
      <div style={abs(450, 690, {width: 550})}>
        {t > ordAt - 0.3 && (
          <Pop t={t} at={ordAt - 0.3} dy={30}>
            <TCard th={th} style={{padding: '18px 22px', fontFamily: SANS}}>
              <Label color={C.green} size={18}>Order · T6</Label>
              {items.map(([img, n, p], i) => (
                <div key={n} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 3 ? '1px solid #EEEAE3' : 'none', opacity: ep(t, ordAt + i * 0.2, 0.25), transform: `translateX(${(1 - ep(t, ordAt + i * 0.2, 0.35)) * 24}px)`}}>
                  <Img src={fl(img)} style={{width: 44, height: 44}} />
                  <span style={{flex: 1, fontSize: 26, fontWeight: 600}}>{n}</span>
                  <b style={{fontSize: 26}}>{p}</b>
                </div>
              ))}
            </TCard>
          </Pop>
        )}
      </div>
      {t > billAt - 0.2 && (
        <Pop t={t} at={billAt - 0.2} style={abs(80, 1130)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB me time="9:41 PM" tag="Bill · Brew & Co.">
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <Img src={fl('receipt')} style={{width: 54, height: 54}} />
                <div>
                  Total <b>₹1,840</b> · Paid via UPI ✓
                </div>
              </div>
            </BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · next day: thank you + review link, 5 stars, food photo posted (dark) ==========
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const msgAt = W(5, 2);
  const starAt = W(5, 11);
  const photoAt = W(5, 15);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Agle din: thank you']], [['+ review link.', true]]]} />
      <Pop t={t} at={msgAt - 0.2} style={abs(80, 680)} dy={30} from={0.85}>
        <div style={{width: 920}}>
          <BB me time="Sun 11:00 AM" tag="Auto · thank you">Thank you Priya! ❤️ Kal aapka time kaisa raha? 30 sec ka review: g.page/brewandco</BB>
        </div>
      </Pop>
      <Pop t={t} at={starAt - 0.3} style={abs(80, 900)} dy={30}>
        <div style={{width: 500, background: '#fff', borderRadius: 30, padding: '20px 22px', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS, color: C.ink}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 44, height: 44, borderRadius: 22, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#4285F4'}}>G</div>
            <b style={{fontSize: 25}}>Priya · Google review</b>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 14}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 72, height: 72, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
          <div style={{fontSize: 23, color: '#5A554E', marginTop: 10, opacity: ep(t, starAt + 0.8, 0.4)}}>"Best cappuccino in town!"</div>
        </div>
      </Pop>
      {t > photoAt - 0.3 && (
        <Pop t={t} at={photoAt - 0.3} style={abs(620, 870)} dy={40} rot={5}>
          <div style={{position: 'relative', width: 340, height: 500, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(170deg,#F2E6D6,#E9F1EA)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
            <div style={{position: 'absolute', left: 14, right: 14, top: 12, display: 'flex', gap: 4}}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{flex: 1, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.15)'}}>
                  <div style={{width: `${k === 0 ? ep(t, photoAt, 3) * 100 : 0}%`, height: '100%', borderRadius: 3, background: C.ink}} />
                </div>
              ))}
            </div>
            <Img src={c3('latte')} style={{position: 'absolute', left: -20, top: 70, width: 380, height: 380}} />
            <div style={{position: 'absolute', left: 60, top: 400, background: '#fff', borderRadius: 12, padding: '8px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 24, color: C.ink, transform: 'rotate(-4deg)'}}>@brew.and.co ☕</div>
            <div style={{position: 'absolute', left: 14, top: 30, fontFamily: SANS, fontWeight: 700, fontSize: 20, color: C.ink}}>priya.s · story</div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · birthday: free dessert offer, she brings 6 friends (green) ======================
const FRIENDS = ['woman', 'man', 'girl', 'person', 'boy', 'old_woman'];
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const bdAt = W(6, 4);
  const freeAt = W(6, 7);
  const frAt = W(6, 12);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Birthday pe']], [['free dessert.', true]]]} />
      <Pop t={t} at={L} style={abs(80, 680)}>
        <div style={{background: 'rgba(255,255,255,0.16)', color: '#fff', borderRadius: 16, padding: '8px 20px', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em'}}>2 HAFTE BAAD</div>
      </Pop>
      {t > bdAt - 0.3 && (
        <Pop t={t} at={bdAt - 0.3} style={abs(80, 750)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 34, padding: '20px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
            <Icon3D n="birthday_cake" size={150} t={t} />
            <div style={{flex: 1}}>
              <Label color={C.green} size={18}>WhatsApp · Brew & Co.</Label>
              <div style={{fontWeight: 800, fontSize: 36, marginTop: 6}}>Happy Birthday Priya! 🎉</div>
              <div style={{fontSize: 27, color: '#5A554E', marginTop: 4}}>Is hafte aapka dessert humari taraf se.</div>
            </div>
            {t > freeAt && (
              <div style={{background: C.green, color: '#fff', borderRadius: 18, padding: '10px 18px', fontFamily: MONO, fontWeight: 800, fontSize: 30, transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, freeAt, 1.3))})`}}>FREE</div>
            )}
          </div>
        </Pop>
      )}
      <div style={abs(80, 1060, {width: 920, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10})}>
        {t > frAt - 0.4 &&
          FRIENDS.map((f, i) => (
            <div key={f} style={{opacity: ep(t, frAt - 0.4 + i * 0.12, 0.2), transform: `translateY(${(1 - ep(t, frAt - 0.4 + i * 0.12, 0.45)) * 60}px)`}}>
              <Img src={fl(f)} style={{width: 126, height: 126}} />
            </div>
          ))}
      </div>
      {t > frAt + 0.5 && (
        <Pop t={t} at={frAt + 0.5} style={abs(310, 1210)}>
          <Chip img="party_popper" txt="1 → 7 guests" light size={34} />
        </Pop>
      )}
    </>
  );
};

// ===== 6 · Friday broadcast: weekend special, Priya is a regular (cream) ==================
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const bcAt = W(7, 6);
  const regAt = W(7, 9);
  const sent = Math.round(lerp(0, 1240, ep(t, bcAt, 1.4)));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har Friday:']], [['weekend special.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 690)} dy={30}>
        <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 130, height: 130, borderRadius: 34, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon3D n="megaphone" size={92} t={t} />
          </div>
          <div style={{flex: 1}}>
            <BB me time="Fri 5:00 PM" tag="Broadcast · weekend special">
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Img src={fl('croissant')} style={{width: 54, height: 54}} />
                <span>2 Cappuccino + Croissant sirf <b>₹299</b> ☕</span>
              </div>
            </BB>
          </div>
        </div>
      </Pop>
      {t > bcAt - 0.2 && (
        <Pop t={t} at={bcAt - 0.2} style={abs(80, 910)} dy={30}>
          <TCard th={th} style={{width: 920, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 18, fontFamily: SANS}}>
            <Img src={fl('busts_in_silhouette')} style={{width: 60, height: 60}} />
            <div style={{flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <b style={{fontSize: 30}}>Sent to guests</b>
                <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.green}}>{sent.toLocaleString('en-IN')}</span>
              </div>
              <div style={{marginTop: 10}}>
                <Bar p={ep(t, bcAt, 1.4)} h={16} />
              </div>
            </div>
          </TCard>
        </Pop>
      )}
      {t > regAt - 0.3 && (
        <Pop t={t} at={regAt - 0.3} style={abs(80, 1090)} dy={30}>
          <TCard th={th} style={{width: 920, padding: '18px 24px', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Img src={fl('woman')} style={{width: 64, height: 64}} />
              <b style={{fontSize: 30, flex: 1}}>Priya · visits</b>
              <div style={{background: C.green, color: '#fff', borderRadius: 16, padding: '6px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 24, transform: `scale(${lerp(1.6, 1, sp(t, regAt + 0.8, 1.3))})`, opacity: ep(t, regAt + 0.8, 0.15)}}>★ REGULAR</div>
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 14}}>
              {[0, 1, 2, 3, 4, 5, 6].map((k) => {
                const on = t > regAt + k * 0.1;
                return (
                  <div key={k} style={{flex: 1, height: 70, borderRadius: 18, background: on ? 'rgba(31,157,85,0.12)' : '#F4F1EB', border: `2px solid ${on ? C.green : '#E6E2DA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {on && <Img src={fl('hot_beverage')} style={{width: 44, height: 44, transform: `scale(${sp(t, regAt + k * 0.1, 1.3)})`}} />}
                  </div>
                );
              })}
            </div>
          </TCard>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · lesson: growth comes from repeat guests (dark) ===============================
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 8);
  const repAt = W(8, 9);
  const pct = Math.round(lerp(0, 68, ep(t, repAt, 1.6)));
  const R = 250;
  const circ = 2 * Math.PI * R;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Naye customers se nahi...']], [['repeat guests se growth.', true]]]} />
      <div style={abs(80, 680, {width: 920, height: 760})}>
        <div style={abs(230, 60, {width: 600, height: 600})}>
          <svg width="600" height="600" viewBox="0 0 600 600" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
            <circle cx="300" cy="300" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="56" />
            <circle cx="300" cy="300" r={R} fill="none" stroke={C.green} strokeWidth="56" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} />
          </svg>
          <div style={abs(130, 110, {width: 340, height: 340})}>
            <Pop t={t} at={L + 0.3} from={0.4}>
              <Img src={c3('latte')} style={{width: 340, height: 340}} />
            </Pop>
          </div>
        </div>
        <Pop t={t} at={L + 0.4} style={abs(-30, 40)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 24, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > noAt ? 0.45 : 1}}>
            <Img src={fl('person')} style={{width: 46, height: 46}} /> Sirf naye customers
            <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />
          </div>
        </Pop>
        {t > repAt && (
          <Pop t={t} at={repAt} style={abs(20, 560)}>
            <div style={{background: C.green, color: '#fff', borderRadius: 26, padding: '14px 26px', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
              Revenue from repeat guests: <span style={{fontFamily: MONO, fontWeight: 800}}>{pct}%</span>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

const LIST = ['Instant table booking', 'QR order + WA bill', 'Review link', 'Birthday offers', 'Weekly broadcast'];
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>Cafe & Restaurant Guide.pdf</span>
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
