import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'dark', 'cream'];
/** ledger tab lit in each scene (0 = none) */
export const TAB = [0, 1, 2, 3, 4, 5, 6, 6, 6];
type P = {t: number; th: Tok};
const c3 = (n: string) => staticFile(`ca3d/${n}.png`);
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


// ===== 0 · hook: every CA posts the same "last date" creative (dark) ======================
export const C0: React.FC<P> = ({t, th}) => {
  const sameAt = W(0, 18);
  const l1 = W(1, 0);
  const tfAt = W(1, 4);
  const yrAt = W(1, 10);
  const leave = ep(t, l1 - 0.25, 0.45);
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['"31 July last date!"']], [['isse client aata hai?', true]]]} />
      {leave < 1 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} style={{height: 250, borderRadius: 20, background: '#fff', overflow: 'hidden', fontFamily: SANS, color: C.ink, opacity: ep(t, -0.5 + i * 0.12, 0.3), transform: `translateY(${(1 - ep(t, -0.5 + i * 0.12, 0.4)) * 40}px) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`}}>
                <div style={{background: C.red, color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 20, padding: '8px 0', textAlign: 'center', letterSpacing: '0.08em'}}>LAST DATE</div>
                <div style={{textAlign: 'center', fontWeight: 900, fontSize: 64, lineHeight: 1.1, marginTop: 10}}>31</div>
                <div style={{textAlign: 'center', fontWeight: 800, fontSize: 26}}>JULY</div>
                <div style={{textAlign: 'center', fontSize: 18, color: '#8C8780', marginTop: 4}}>File your ITR now!</div>
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontFamily: MONO, fontSize: 16, color: '#8C8780'}}>
                  <span>CA firm #{i + 1}</span>
                  <span>♡ {[4, 7, 2, 9, 3, 5][i]}</span>
                </div>
              </div>
            ))}
          </div>
          {t > sameAt && (
            <div style={{position: 'absolute', left: 170, top: 210, transform: `rotate(-6deg) scale(${lerp(2.2, 1, sp(t, sameAt, 1.3))})`, opacity: ep(t, sameAt, 0.12), background: C.ink, color: '#fff', border: '4px solid #fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.06em', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
              SAB SAME POST. 0 CLIENTS
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 690, {width: 920, height: 720, opacity: ep(t, l1 - 0.2, 0.4)})}>
          <div style={abs(250, 0, {width: 420, height: 420})}>
            <Pop t={t} at={l1} from={0.4} rot={-6}>
              <Img src={c3('calculator')} style={{width: 420, height: 420, transform: `translateY(${Math.sin(t * 1.4) * 8}px)`}} />
            </Pop>
          </div>
          {t > tfAt && (
            <Pop t={t} at={tfAt} style={abs(20, 440)} rot={-4}>
              <Chip img="shield" txt="Tension-free filing" good size={32} />
            </Pop>
          )}
          {t > yrAt && (
            <Pop t={t} at={yrAt} style={abs(420, 540)} rot={4}>
              <Chip img="handshake" txt="Saal bhar ka bharosa" light size={32} />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · GST notice at night, Google search, 4.9 reviews, WhatsApp (cream) ==============
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const typeA = W(2, 8);
  const typeB = W(2, 13) + 0.2;
  const q = 'CA near me';
  const typed = q.slice(0, Math.round(clamp01((t - typeA) / (typeB - typeA)) * q.length));
  const resAt = W(2, 15);
  const waAt = W(2, 20);
  const rating = lerp(0, 4.9, ep(t, W(2, 16), 0.8));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Raat ko aaya']], [['GST notice.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={30} rot={-3}>
        <div style={{position: 'relative', width: 470, background: '#fff', borderRadius: 10, padding: '20px 22px', boxShadow: '0 24px 50px rgba(40,30,20,0.22)', fontFamily: SANS, color: C.ink}}>
          <Label color="#8C8780" size={15}>Govt. of India · GST dept.</Label>
          <div style={{fontWeight: 800, fontSize: 30, marginTop: 6}}>Notice · ASMT-10</div>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{height: 10, borderRadius: 5, background: '#EEEAE3', marginTop: 12, width: `${[95, 80, 88, 60][k]}%`}} />
          ))}
          <div style={{fontSize: 20, color: C.red, fontWeight: 700, marginTop: 12}}>Reply within 30 days</div>
          <div style={{position: 'absolute', right: 18, top: 70, border: `4px solid ${C.red}`, color: C.red, borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 22, transform: `rotate(12deg) scale(${lerp(1.8, 1, sp(t, L + 0.6, 1.3))})`, opacity: ep(t, L + 0.6, 0.1)}}>URGENT</div>
        </div>
      </Pop>
      <Pop t={t} at={L + 0.4} style={abs(640, 700)} dy={30}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 30, padding: '12px 24px 12px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 34}}>
          <Img src={fl('crescent_moon')} style={{width: 48, height: 48}} /> 11:20 PM
        </div>
      </Pop>
      {t > typeA - 0.3 && (
        <Pop t={t} at={typeA - 0.3} style={abs(80, 1000)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 50, padding: '16px 26px', boxShadow: '0 16px 34px rgba(40,30,20,0.14)', fontFamily: SANS}}>
            <Img src={fl('magnifying_glass_tilted_left')} style={{width: 44, height: 44}} />
            <span style={{fontSize: 34, color: C.ink, fontWeight: 600}}>{typed}</span>
            <span style={{width: 3, height: 38, background: C.green, opacity: Math.sin(t * 10) > 0 ? 1 : 0}} />
          </div>
        </Pop>
      )}
      {t > resAt - 0.3 && (
        <Pop t={t} at={resAt - 0.3} style={abs(80, 1110)} dy={30}>
          <TCard th={th} style={{width: 560, padding: '16px 20px', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 14}}>
            <Img src={fl('classical_building')} style={{width: 60, height: 60}} />
            <div>
              <b style={{fontSize: 28}}>Shah & Co. · CA</b>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 4}}>
                <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 30}}>{rating.toFixed(1)}</span>
                {[0, 1, 2, 3, 4].map((k) => (
                  <Img key={k} src={fl('star')} style={{width: 30, height: 30, filter: rating >= k + 0.6 ? 'none' : 'grayscale(1) opacity(0.3)'}} />
                ))}
                <span style={{fontSize: 20, color: th.cardSub}}>(326)</span>
              </div>
            </div>
          </TCard>
        </Pop>
      )}
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1270)} dy={30} from={0.85}>
          <div style={{width: 920}}>
            <BB time="11:24 PM">Sir, GST notice aaya hai, help chahiye 🙏</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI asks for the notice photo, books a same-day call (green) ===================
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const photoAt = W(3, 5);
  const callAt = W(3, 14);
  const bookAt = W(3, 15);
  const scan = clamp01((t - photoAt - 0.6) / 1.0);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['AI ne turant']], [['same-day call book ki.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30}>
        <div style={{width: 920}}>
          <BB me time="11:24 PM" tag="AI · 5 sec">Ghabraiye mat Mehta ji 🙏 Notice ki photo bhej dijiye</BB>
        </div>
      </Pop>
      {t > photoAt - 0.2 && (
        <Pop t={t} at={photoAt - 0.2} style={abs(80, 860)} dy={30} from={0.85}>
          <div style={{width: 420, background: '#fff', borderRadius: 28, borderTopLeftRadius: 8, padding: 14, boxShadow: '0 18px 36px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
            <div style={{position: 'relative', height: 230, borderRadius: 16, background: '#F4F1EB', overflow: 'hidden', padding: 16}}>
              <div style={{fontWeight: 800, fontSize: 22}}>Notice · ASMT-10</div>
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{height: 9, borderRadius: 5, background: '#DDD7CC', marginTop: 12, width: `${[90, 75, 85, 60, 70][k]}%`}} />
              ))}
              {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: scan * 230, height: 5, background: C.green, boxShadow: '0 0 16px 4px rgba(31,157,85,0.6)'}} />}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 22, fontWeight: 600}}>
              <Img src={fl('camera')} style={{width: 34, height: 34}} /> notice.jpg {t > photoAt + 1.7 && <span style={{color: C.green}}>· read by AI ✓</span>}
            </div>
          </div>
        </Pop>
      )}
      {t > photoAt + 1.2 && (
        <Pop t={t} at={photoAt + 1.2} style={abs(530, 880)} dy={30}>
          <div style={{width: 470, background: C.ink, color: '#fff', borderRadius: 26, padding: '16px 20px', fontFamily: SANS}}>
            <Label color="#7CE0A3" size={16}>AI summary</Label>
            <div style={{fontSize: 24, marginTop: 6, lineHeight: 1.35}}>ITC mismatch · ₹1.8L<br />Reply due: 18 Dec</div>
          </div>
        </Pop>
      )}
      {t > callAt - 0.4 && (
        <Pop t={t} at={callAt - 0.4} style={abs(80, 1170)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 28, padding: '16px 22px', boxShadow: '0 16px 30px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
            <Img src={fl('telephone_receiver')} style={{width: 60, height: 60}} />
            <div style={{flex: 1}}>
              <Label color="#8C8780" size={16}>Call with CA Rakesh Shah</Label>
              <b style={{fontSize: 32}}>Aaj · 5:30 PM · 15 min</b>
            </div>
            <div style={{borderRadius: 18, padding: '10px 22px', fontWeight: 800, fontSize: 28, background: t > bookAt ? C.green : '#EEEAE3', color: t > bookAt ? '#fff' : C.ink, transform: `scale(${t > bookAt ? lerp(0.9, 1, sp(t, bookAt)) : 1})`}}>{t > bookAt ? 'Booked ✓' : 'Book'}</div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · document checklist, everything sent on WhatsApp, no office visits (cream) =====
const DOCS = [
  ['PAN + GSTIN', 'page_facing_up'],
  ['GSTR-3B (6 months)', 'bar_chart'],
  ['Purchase invoices', 'receipt'],
  ['Bank statement', 'classical_building'],
];
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const sendA = W(4, 9);
  const sendB = W(4, 14);
  const noAt = W(4, 15);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Checklist bheja,']], [['sab WhatsApp pe aaya.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={30}>
        <TCard th={th} style={{width: 540, padding: '20px 22px', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <Img src={fl('clipboard')} style={{width: 46, height: 46}} />
            <b style={{fontSize: 28}}>Documents checklist</b>
          </div>
          {DOCS.map(([d, img], i) => {
            const at = lerp(sendA, sendB, i / 3);
            return (
              <div key={d} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 3 ? '1px solid #EEEAE3' : 'none'}}>
                <Check size={34} p={ep(t, at + 0.3, 0.25)} />
                <Img src={fl(img)} style={{width: 38, height: 38}} />
                <span style={{fontSize: 25, fontWeight: 600, opacity: t > at + 0.3 ? 1 : 0.55}}>{d}</span>
              </div>
            );
          })}
        </TCard>
      </Pop>
      <div style={abs(650, 700, {width: 350, height: 460})}>
        {DOCS.map(([d], i) => {
          const at = lerp(sendA, sendB, i / 3);
          if (t < at - 0.3) return null;
          const k = ep(t, at - 0.3, 0.5);
          return (
            <div key={d} style={{position: 'absolute', left: 20 + (i % 2) * 40, top: 40 + i * 90 + (1 - k) * 200, opacity: k, display: 'flex', alignItems: 'center', gap: 10, background: '#D9FDD3', borderRadius: 18, padding: '10px 14px', boxShadow: '0 12px 24px rgba(0,0,0,0.12)', fontFamily: SANS, transform: `rotate(${(i % 2 ? 3 : -3)}deg)`}}>
              <div style={{width: 42, height: 52, borderRadius: 6, background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 13}}>PDF</div>
              <span style={{fontSize: 20, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap'}}>{d.split(' ')[0]}.pdf</span>
            </div>
          );
        })}
      </div>
      {t > noAt - 0.2 && (
        <Pop t={t} at={noAt - 0.2} style={abs(250, 1230)}>
          <Chip img="office_building" txt="Office ke chakkar: 0" good size={32} />
        </Pop>
      )}
    </>
  );
};

// ===== 4 · auto reminders before every deadline: GST, TDS, ITR (dark) ====================
const DUE = [
  {d: 7, l: 'TDS', at: 7},
  {d: 20, l: 'GST', at: 6},
  {d: 31, l: 'ITR', at: 8},
];
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const remAt = W(5, 4);
  const okAt = W(5, 10);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har deadline se pehle']], [['auto reminder.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={30}>
        <div style={{width: 560, background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', fontFamily: SANS, color: C.ink}}>
          <div style={{background: C.green, color: '#fff', padding: '12px 20px', fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: '0.1em'}}>JULY · COMPLIANCE</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, padding: 14}}>
            {Array.from({length: 31}).map((_, i) => {
              const due = DUE.find((x) => x.d === i + 1);
              const done = due && t > W(5, due.at);
              return (
                <div key={i} style={{position: 'relative', height: 56, borderRadius: 10, background: due ? (done ? C.green : 'rgba(229,72,77,0.15)') : '#F4F1EB', border: due && !done ? `2px solid ${C.red}` : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 20, color: due ? (done ? '#fff' : C.red) : '#8C8780'}}>
                  {done ? '✓' : i + 1}
                  {due && <div style={{position: 'absolute', bottom: -2, fontSize: 11, fontWeight: 800}}>{due.l}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Pop>
      <div style={abs(670, 690, {width: 330, display: 'flex', flexDirection: 'column', gap: 14})}>
        {DUE.slice()
          .sort((a, b) => a.at - b.at)
          .map((d, i) =>
            t > remAt + i * 0.25 ? (
              <Pop key={d.l} t={t} at={remAt + i * 0.25} dy={24}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#22201D', borderRadius: 22, padding: '14px 16px', fontFamily: SANS, color: '#fff'}}>
                  <Img src={fl('bell')} style={{width: 40, height: 40}} />
                  <div style={{flex: 1}}>
                    <b style={{fontSize: 26}}>{d.l} due {d.d} Jul</b>
                    <div style={{fontSize: 18, color: t > W(5, d.at) ? '#7CE0A3' : '#9A948C'}}>{t > W(5, d.at) ? 'Filed on time ✓' : 'Reminder · 3 days before'}</div>
                  </div>
                </div>
              </Pop>
            ) : null,
          )}
      </div>
      {t > okAt - 0.2 && (
        <Pop t={t} at={okAt - 0.2} style={abs(670, 1110)} rot={-4}>
          <div style={{background: C.green, color: '#fff', borderRadius: 22, padding: '14px 24px', fontFamily: SANS, fontWeight: 800, fontSize: 32}}>Late fee: ₹0</div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · filed: acknowledgement on WhatsApp + tax saving tips (cream) ===================
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const ackAt = W(6, 3);
  const tipAt = W(6, 10);
  const tips = [
    ['80C · PPF / ELSS', '₹1,50,000'],
    ['80D · Health insurance', '₹25,000'],
    ['80CCD · NPS', '₹50,000'],
  ];
  const saved = Math.round(lerp(0, 46800, ep(t, tipAt + 0.6, 1.4)));
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Filed. Proof WhatsApp pe,']], [['+ tax saving tips.', true]]]} />
      <Pop t={t} at={ackAt - 0.3} style={abs(80, 680)} dy={30}>
        <div style={{width: 920, background: '#D9FDD3', borderRadius: 34, borderTopRightRadius: 8, padding: '20px 24px', boxShadow: '0 18px 36px rgba(0,0,0,0.12)', fontFamily: SANS, color: C.ink}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: '0.1em', color: C.green}}>SHAH & CO. · FILED</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 20, padding: '14px 18px', marginTop: 10}}>
            <div style={{width: 64, height: 80, borderRadius: 10, background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 20}}>PDF</div>
            <div style={{flex: 1}}>
              <b style={{fontSize: 30}}>ITR-V Acknowledgement</b>
              <div style={{fontFamily: MONO, fontSize: 20, color: '#8C8780'}}>Ack. no. 4821 9930 1127</div>
            </div>
            <div style={{border: `4px solid ${C.green}`, color: C.green, borderRadius: 10, padding: '4px 12px', fontFamily: MONO, fontWeight: 800, fontSize: 26, transform: `rotate(-10deg) scale(${lerp(2, 1, sp(t, ackAt + 0.4, 1.3))})`, opacity: ep(t, ackAt + 0.4, 0.1)}}>FILED ✓</div>
          </div>
        </div>
      </Pop>
      {t > tipAt - 0.3 && (
        <Pop t={t} at={tipAt - 0.3} style={abs(80, 950)} dy={30}>
          <TCard th={th} style={{width: 920, padding: '18px 24px', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <Img src={fl('light_bulb')} style={{width: 44, height: 44}} />
              <b style={{fontSize: 28, flex: 1}}>Next year tax saving</b>
              <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 32, color: C.green}}>saves ₹{saved.toLocaleString('en-IN')}</span>
            </div>
            {tips.map(([k, v], i) => (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 25, padding: '10px 0', borderBottom: i < 2 ? '1px solid #EEEAE3' : 'none', opacity: ep(t, tipAt + i * 0.2, 0.25)}}>
                <span>{k}</span>
                <b style={{fontFamily: MONO}}>{v}</b>
              </div>
            ))}
          </TCard>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · year end: Mehta ji refers 3 business friends (green) =========================
const FRIENDS = [
  {img: 'man_office_worker', n: 'Gupta Traders'},
  {img: 'old_man', n: 'Jain Textiles'},
  {img: 'woman_office_worker', n: 'Kapoor Foods'},
];
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const refAt = W(7, 7);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Saal ke end mein:']], [['3 business referrals.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(80, 670)} dy={30} from={0.85}>
        <div style={{width: 920}}>
          <BB time="Mar 28 · 7:10 PM" tag="Mehta ji → Business group">Notice ka sab handle ho gaya, zero tension 👌 Shah & Co. ka number 👉 +91 98xxx</BB>
        </div>
      </Pop>
      <div style={abs(80, 900, {width: 920, display: 'flex', gap: 16})}>
        {FRIENDS.map((f, i) =>
          t > refAt - 0.3 + i * 0.3 ? (
            <Pop key={i} t={t} at={refAt - 0.3 + i * 0.3} dy={40} style={{flex: 1}}>
              <div style={{background: '#fff', borderRadius: 28, padding: '18px 16px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
                <Img src={fl(f.img)} style={{width: 120, height: 120}} />
                <b style={{display: 'block', fontSize: 26, marginTop: 6}}>{f.n}</b>
                <div style={{marginTop: 10, background: C.green, color: '#fff', borderRadius: 14, padding: '6px 0', fontWeight: 800, fontSize: 22}}>New client ✓</div>
              </div>
            </Pop>
          ) : (
            <div key={i} style={{flex: 1}} />
          ),
        )}
      </div>
      {t > refAt + 1.2 && (
        <Pop t={t} at={refAt + 1.2} style={abs(300, 1250)}>
          <Chip img="busts_in_silhouette" txt="+3 clients · ₹0 ads" light size={32} />
        </Pop>
      )}
    </>
  );
};

// ===== 7 · lesson: growth = trust + referrals (dark) ====================================
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 8);
  const refAt = W(8, 9);
  const yrs = [
    ['FY24', 40, 0],
    ['FY25', 58, 0.4],
    ['FY26', 85, 0.8],
  ] as const;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Deadline posts se nahi...']], [['bharose se growth.', true]]]} />
      <div style={abs(80, 670, {width: 920, height: 760})}>
        <Pop t={t} at={L + 0.3} style={abs(0, 20)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 24, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > noAt ? 0.45 : 1}}>
            <Img src={fl('spiral_calendar')} style={{width: 46, height: 46}} /> "Last date" posts
            <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />
          </div>
        </Pop>
        <div style={abs(40, 130, {width: 840, height: 480, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '3px solid rgba(255,255,255,0.2)'})}>
          {yrs.map(([y, n, d], i) => {
            const k = ep(t, refAt + d, 0.9);
            return (
              <div key={y} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 200}}>
                <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 40, color: '#fff', opacity: k}}>{Math.round(n * k)}</span>
                <div style={{width: 150, height: n * 4.6 * k, borderRadius: '20px 20px 6px 6px', background: i === 2 ? C.green : '#2E8B57', opacity: 0.5 + i * 0.25}} />
              </div>
            );
          })}
        </div>
        <div style={abs(40, 630, {width: 840, display: 'flex', justifyContent: 'space-around'})}>
          {yrs.map(([y]) => (
            <Label key={y} color="#C9C4BC" size={22} style={{width: 200, textAlign: 'center'}}>{y} clients</Label>
          ))}
        </div>
      </div>
    </>
  );
};

const LIST = ['Instant AI reply', 'Docs on WhatsApp', 'Deadline reminders', 'Filing updates', 'Reviews + referrals'];
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>CA Firm Growth Guide.pdf</span>
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
