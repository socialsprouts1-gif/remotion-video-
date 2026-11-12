import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Pop, SANS, SERIF, W, clamp01, ep, eio, icon, lerp, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8, 9];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'dark', 'cream'];
type P = {t: number; th: Tok};
const a3 = (n: string) => staticFile(`arc3d/${n}.png`);
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
/** dimension line, like on a drawing: |<---- label ---->| */
const Dim: React.FC<{t: number; at: number; w: number; label: string; col: string}> = ({t, at, w, label, col}) => {
  const p = ep(t, at, 0.6);
  return (
    <div style={{position: 'relative', width: w, height: 34, opacity: p}}>
      <div style={{position: 'absolute', left: 0, top: 6, width: 2, height: 22, background: col}} />
      <div style={{position: 'absolute', right: 0, top: 6, width: 2, height: 22, background: col}} />
      <div style={{position: 'absolute', left: w / 2 - (w / 2) * p, top: 16, width: w * p, height: 2, background: col}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center'}}>
        <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: col, background: 'inherit', padding: '0 10px', letterSpacing: '0.1em'}}>{label}</span>
      </div>
    </div>
  );
};

// ===== 0 · hook: only posting project photos (dark) ===================================
const TILES = ['villa', 'office_building', 'villa_b', 'houses', 'house_with_garden', 'villa_wire', 'building_construction', 'villa', 'framed_picture'];
export const C0: React.FC<P> = ({t, th}) => {
  const igAt = W(0, 13);
  const noAt = W(0, 18);
  const l1 = W(1, 0);
  const premAt = W(1, 10);
  const dekho = W(1, 13);
  const leave = ep(t, l1 - 0.25, 0.45);
  const scroll = -eio(t, 0.2, 2.6) * 120 + Math.sin(t * 2) * 4;
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Sirf photos post karna']], [['marketing nahi hai.', true]]]} />
      {leave < 1 && (
        <div style={abs(130, 700, {width: 820, opacity: 1 - leave, transform: `translateY(${-leave * 60}px) scale(${1 - ep(t, noAt, 0.5) * 0.06})`})}>
          <div style={{background: '#fff', borderRadius: 40, padding: '22px 24px 0', overflow: 'hidden', height: 640, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', fontFamily: SANS, color: C.ink, position: 'relative'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 84, height: 84, borderRadius: 42, padding: 4, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)'}}>
                <div style={{width: '100%', height: '100%', borderRadius: 40, background: '#F4EFE6', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={fl('triangular_ruler')} style={{width: 46, height: 46}} />
                </div>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 32}}>studio.arch</div>
                <div style={{fontSize: 22, color: '#8C8780'}}>Architects & interiors</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontWeight: 800, fontSize: 30}}>248</div>
                <div style={{fontSize: 18, color: '#8C8780'}}>posts</div>
              </div>
            </div>
            <div style={{position: 'absolute', left: 24, right: 24, top: 130, bottom: 0, overflow: 'hidden'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, transform: `translateY(${scroll}px)`}}>
                {[...TILES, ...TILES].map((n, i) => (
                  <div key={i} style={{position: 'relative', height: 250, background: i % 2 ? '#EDE7DF' : '#E3EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                    <Img src={n.startsWith('villa') ? a3(n) : fl(n)} style={{width: n.startsWith('villa') ? 300 : 140, height: n.startsWith('villa') ? 300 : 140}} />
                    <div style={{position: 'absolute', left: 8, bottom: 8, fontFamily: MONO, fontWeight: 700, fontSize: 17, color: '#6B655C'}}>♡ {[12, 9, 21, 7, 15, 11, 8, 14, 6][i % 9]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {t > igAt && t < noAt && (
            <Pop t={t} at={igAt} style={abs(560, -40)} rot={8}>
              <Chip img="framed_picture" txt="Sirf photos" light />
            </Pop>
          )}
          {t > noAt && (
            <div style={{position: 'absolute', left: 140, top: 250, transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, noAt, 1.3))})`, opacity: ep(t, noAt, 0.12), background: C.red, color: '#fff', borderRadius: 16, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>
              0 ENQUIRIES
            </div>
          )}
        </div>
      )}
      {t > l1 - 0.2 && (
        <div style={abs(80, 700, {width: 920, height: 700, opacity: ep(t, l1 - 0.2, 0.4)})}>
          {/* journey path: first call -> handover, drawn like a pencil line */}
          <svg width="920" height="700" style={{position: 'absolute', inset: 0}}>
            <path d="M 90 120 C 300 120, 260 560, 460 560 S 700 120, 830 120" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeDasharray="14 14" />
            <path d="M 90 120 C 300 120, 260 560, 460 560 S 700 120, 830 120" fill="none" stroke={C.green} strokeWidth="8" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - eio(t, W(1, 4), W(1, 8) - W(1, 4) + 0.3))} />
          </svg>
          <Pop t={t} at={W(1, 4)} style={abs(0, 40)}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
              <div style={{width: 160, height: 160, borderRadius: 80, background: '#22201D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
                <Icon3D n="telephone_receiver" size={100} t={t} />
              </div>
              <Label color="#C9C4BC" size={20}>Pehli call</Label>
            </div>
          </Pop>
          {t > W(1, 7) && (
            <Pop t={t} at={W(1, 7)} style={abs(760, 40)}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <div style={{width: 160, height: 160, borderRadius: 80, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
                  <Icon3D n="key" size={100} t={t} seed={2} />
                </div>
                <Label color="#C9C4BC" size={20}>Handover</Label>
              </div>
            </Pop>
          )}
          {/* the drawing becomes the building */}
          <div style={abs(230, 160, {width: 460, height: 460})}>
            <Img src={a3('villa_wire')} style={{position: 'absolute', inset: 0, width: 460, height: 460, filter: 'brightness(1.6)', opacity: ep(t, W(1, 2), 0.5) * (1 - ep(t, premAt, 0.6))}} />
            <Img src={a3('villa')} style={{position: 'absolute', inset: 0, width: 460, height: 460, opacity: ep(t, premAt, 0.6), clipPath: `inset(${(1 - eio(t, premAt, 0.9)) * 100}% 0 0 0)`}} />
          </div>
          {t > dekho && (
            <Pop t={t} at={dekho} style={abs(300, 620)}>
              <Chip img="sparkles" txt="Premium experience" good />
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 1 · enquiry: Rohit sees the villa reel, WhatsApps at 11 PM (cream) ================
export const C1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const reelAt = W(2, 8);
  const nightAt = W(2, 16);
  const waAt = W(2, 19);
  const views = Math.round(lerp(0, 1.2, ep(t, reelAt, 2.5)) * 10) / 10;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Rohit ko chahiye tha']], [['apna 3BHK ghar.', true]]]} />
      <Pop t={t} at={L + 0.2} style={abs(80, 690)} dy={30}>
        <TCard th={th} style={{width: 420, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 84, height: 84, borderRadius: 42, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('man')} style={{width: 64, height: 64}} />
          </div>
          <div style={{fontFamily: SANS}}>
            <div style={{fontWeight: 800, fontSize: 32}}>Rohit</div>
            <div style={{fontSize: 22, color: th.cardSub}}>Plot · 30×50 ft</div>
          </div>
        </TCard>
      </Pop>
      {t > reelAt - 0.3 && (
        <Pop t={t} at={reelAt - 0.3} style={abs(540, 660)} dy={40} rot={3}>
          <div style={{position: 'relative', width: 440, height: 560, borderRadius: 34, overflow: 'hidden', background: 'linear-gradient(170deg,#E9F1EA,#F4EFE6)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}}>
            <Img src={a3('villa')} style={{position: 'absolute', left: -40, top: 60, width: 520, height: 520, transform: `scale(${1 + ep(t, reelAt, 6) * 0.08})`}} />
            <div style={{position: 'absolute', left: 18, top: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.ink}}>
              <Img src={fl('triangular_ruler')} style={{width: 34, height: 34}} /> studio.arch
            </div>
            <div style={{position: 'absolute', left: 18, bottom: 54, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.ink}}>Modern villa · 30×50</div>
            <div style={{position: 'absolute', left: 18, bottom: 20, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#6B655C'}}>▶ {views.toFixed(1)}M views</div>
            <div style={{position: 'absolute', right: 18, bottom: 120, fontSize: 54, transform: `scale(${t > reelAt + 1 ? lerp(1.8, 1, ep(t, reelAt + 1, 0.4)) : 0})`, color: C.red}}>♥</div>
            <div style={{position: 'absolute', left: 16, right: 16, bottom: 8, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.12)'}}>
              <div style={{width: `${ep(t, reelAt, 5) * 100}%`, height: '100%', borderRadius: 3, background: C.ink}} />
            </div>
          </div>
        </Pop>
      )}
      {t > nightAt - 0.2 && (
        <Pop t={t} at={nightAt - 0.2} style={abs(80, 960)} dy={30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', borderRadius: 30, padding: '14px 28px 14px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 40, boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>
            <Img src={fl('crescent_moon')} style={{width: 56, height: 56}} /> 11:04 PM
          </div>
        </Pop>
      )}
      {t > waAt - 0.2 && (
        <Pop t={t} at={waAt - 0.2} style={abs(80, 1245)} dy={30} from={0.85}>
          <div style={{width: 900}}>
            <BB time="11:04 PM">Hi! Villa wali reel dekhi. Mera 30×50 plot hai, 3BHK design karwana hai</BB>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · AI replies instantly, qualifies, books the site visit (green) ===================
export const C2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const rows = [
    {at: W(3, 5), img: 'straight_ruler', k: 'Plot size', v: '30×50 ft'},
    {at: W(3, 7), img: 'money_bag', k: 'Budget', v: '₹80 L'},
    {at: W(3, 9), img: 'round_pushpin', k: 'Location', v: 'Indore'},
  ];
  const pdfAt = W(3, 12);
  const bookAt = W(3, 19);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['AI ne turant']], [['site visit book ki.', true]]]} />
      <Big s={1.06}>
        <Pop t={t} at={L + 0.1} style={abs(80, 680)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1}}>
              <BB me time="11:04 PM" tag="AI · 4 sec">Namaste Rohit! 3 quick sawaal, phir hum aapko perfect plan bhejte hain</BB>
            </div>
          </div>
        </Pop>
        <div style={abs(80, 920, {width: 920, display: 'flex', gap: 14})}>
          {rows.map((r, i) =>
            t > r.at - 0.15 ? (
              <Pop key={i} t={t} at={r.at - 0.15} dy={30} style={{flex: 1}}>
                <div style={{background: '#fff', borderRadius: 26, padding: '16px 18px', boxShadow: '0 16px 30px rgba(0,0,0,0.16)', fontFamily: SANS, color: C.ink}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Img src={fl(r.img)} style={{width: 52, height: 52}} />
                    <Check size={36} p={ep(t, r.at + 0.3, 0.3)} />
                  </div>
                  <Label color="#8C8780" size={17} style={{marginTop: 10}}>{r.k}</Label>
                  <div style={{fontWeight: 800, fontSize: 34, marginTop: 2}}>{r.v}</div>
                </div>
              </Pop>
            ) : (
              <div key={i} style={{flex: 1}} />
            ),
          )}
        </div>
        {t > pdfAt - 0.2 && (
          <Pop t={t} at={pdfAt - 0.2} style={abs(80, 1150)} dy={30}>
            <div style={{width: 440, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 26, padding: '14px 18px', boxShadow: '0 16px 30px rgba(0,0,0,0.16)', fontFamily: SANS, color: C.ink}}>
              <Img src={fl('page_facing_up')} style={{width: 60, height: 60}} />
              <div>
                <div style={{fontWeight: 800, fontSize: 26}}>Portfolio.pdf</div>
                <div style={{fontSize: 20, color: '#8C8780'}}>24 projects · 8 MB</div>
              </div>
            </div>
          </Pop>
        )}
        {t > bookAt - 1.1 && (
          <Pop t={t} at={bookAt - 1.1} style={abs(540, 1130)} dy={30}>
            <div style={{width: 460, background: C.ink, color: '#fff', borderRadius: 26, padding: '16px 20px', boxShadow: '0 16px 30px rgba(0,0,0,0.3)', fontFamily: SANS}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <Img src={fl('spiral_calendar')} style={{width: 54, height: 54}} />
                <div style={{flex: 1}}>
                  <Label color="#9A948C" size={16}>Site visit</Label>
                  <div style={{fontWeight: 800, fontSize: 32}}>Saturday · 11 AM</div>
                </div>
              </div>
              <div style={{marginTop: 12, borderRadius: 16, padding: '10px 0', textAlign: 'center', fontWeight: 800, fontSize: 26, background: t > bookAt ? C.green : 'rgba(255,255,255,0.1)', transform: `scale(${t > bookAt ? lerp(0.9, 1, sp(t, bookAt)) : 1})`}}>{t > bookAt ? 'Booked ✓' : 'Book'}</div>
            </div>
          </Pop>
        )}
      </Big>
    </>
  );
};

// ===== 3 · reminder the day before, family arrives on time (cream) =======================
export const C3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const remAt = W(4, 5);
  const famAt = W(4, 9);
  const timeAt = W(4, 12);
  const fam = ['man', 'woman', 'boy', 'girl', 'old_woman'];
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Ek din pehle']], [['reminder.', true]]]} />
      <Pop t={t} at={remAt - 0.3} style={abs(80, 690)} dy={-40}>
        <div style={{width: 920, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(30,28,26,0.92)', color: '#fff', borderRadius: 34, padding: '20px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
          <div style={{width: 76, height: 76, borderRadius: 20, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 50, height: 50}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <b style={{fontSize: 28}}>studio.arch</b>
              <span style={{fontFamily: MONO, fontSize: 20, color: '#9A948C'}}>Fri · 6:00 PM</span>
            </div>
            <div style={{fontSize: 26, color: '#E3DED6', marginTop: 4}}>Kal 11 AM site visit · Plot 42, Indore 📍</div>
          </div>
          <Img src={fl('bell')} style={{width: 54, height: 54, transform: `rotate(${Math.sin((t - remAt) * 18) * 16 * (1 - ep(t, remAt, 1.2))}deg)`}} />
        </div>
      </Pop>
      <div style={abs(80, 900, {width: 920})}>
        {t > famAt - 0.3 && (
          <Pop t={t} at={famAt - 0.3} dy={30}>
            <TCard th={th} style={{padding: '24px 26px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Label color={th.cardSub} size={18}>Site · Plot 42</Label>
                <Img src={fl('round_pushpin')} style={{width: 44, height: 44}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14}}>
                {fam.map((f, i) => (
                  <Img key={f} src={fl(f)} style={{width: 132, height: 132, opacity: ep(t, famAt + i * 0.14, 0.2), transform: `translateY(${(1 - ep(t, famAt + i * 0.14, 0.45)) * 50}px)`}} />
                ))}
              </div>
              <div style={{marginTop: 14}}>
                <Dim t={t} at={famAt + 0.5} w={868} label="30 FT × 50 FT" col="#8C8780" />
              </div>
            </TCard>
          </Pop>
        )}
      </div>
      {t > timeAt && (
        <Pop t={t} at={timeAt} style={abs(250, 1270)}>
          <Chip img="alarm_clock" txt="11:00 AM · On time ✓" good size={32} />
        </Pop>
      )}
    </>
  );
};

// ===== 4 · proposal + estimate on WhatsApp, follow-up after 3 days (dark) ================
const PLAN = 'M 20 20 H 400 V 300 H 20 Z M 20 160 H 220 M 220 20 V 300 M 220 120 H 400 M 300 120 V 300 M 120 160 V 300';
export const C4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const planAt = W(5, 3);
  const estAt = W(5, 6);
  const fuAt = W(5, 10);
  const askAt = W(5, 15);
  const items = [
    ['Civil + structure', 48],
    ['Interiors', 22],
    ['Landscape', 8.5],
  ] as const;
  const sum = items.reduce((a, [, v], i) => a + v * clamp01((t - estAt - i * 0.35) / 0.35), 0);
  const up = ep(t, fuAt - 0.3, 0.6);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Proposal + estimate,']], [['seedha WhatsApp par.', true]]]} />
      <div style={abs(80, 690, {width: 920, transform: `translateY(${-up * 40}px) scale(${1 - up * 0.12})`, transformOrigin: '50% 0%'})}>
        <Pop t={t} at={L + 0.1} dy={40}>
          <div style={{display: 'flex', gap: 20, background: '#fff', borderRadius: 34, padding: 24, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', fontFamily: SANS, color: C.ink}}>
            <div style={{width: 430, height: 330, borderRadius: 20, background: '#F4F7F4', backgroundImage: 'linear-gradient(rgba(15,122,60,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,122,60,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px', position: 'relative'}}>
              <svg width="430" height="330" style={{position: 'absolute', inset: 0}}>
                <path d={PLAN} fill="none" stroke={C.green} strokeWidth="6" strokeLinecap="round" strokeDasharray="3000" strokeDashoffset={3000 * (1 - eio(t, planAt, 1.6))} />
              </svg>
              {[
                ['LIVING', 70, 220],
                ['BED 1', 280, 60],
                ['KITCHEN', 50, 70],
                ['BED 2', 320, 200],
              ].map(([l, x, y], i) => (
                <div key={i} style={{position: 'absolute', left: x as number, top: y as number, fontFamily: MONO, fontWeight: 700, fontSize: 16, color: '#6B655C', letterSpacing: '0.1em', opacity: ep(t, planAt + 1 + i * 0.15, 0.3)}}>{l}</div>
              ))}
            </div>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
              <Label color="#8C8780" size={17}>Estimate</Label>
              {items.map(([k, v], i) => (
                <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, padding: '10px 0', borderBottom: '1px solid #EEEAE3', opacity: ep(t, estAt + i * 0.35, 0.3)}}>
                  <span>{k}</span>
                  <b>₹{v} L</b>
                </div>
              ))}
              <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontWeight: 700, fontSize: 24}}>Total</span>
                <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 42, color: C.green}}>₹{sum.toFixed(1)} L</span>
              </div>
            </div>
          </div>
        </Pop>
      </div>
      {t > fuAt - 0.1 && (
        <div style={abs(80, 1050, {width: 920})}>
          <Pop t={t} at={fuAt - 0.1}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 14}}>
              <div style={{background: 'rgba(255,255,255,0.12)', color: '#E3DED6', borderRadius: 14, padding: '6px 18px', fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: '0.1em'}}>3 DIN BAAD</div>
            </div>
          </Pop>
          {t > askAt - 0.3 && (
            <Pop t={t} at={askAt - 0.3} from={0.85} dy={20}>
              <div style={{width: 920}}>
                <BB me time="10:00 AM" tag="Auto follow-up">Rohit ji, proposal dekh liya? Koi sawaal hai?</BB>
              </div>
            </Pop>
          )}
          {t > askAt + 1.2 && (
            <Pop t={t} at={askAt + 1.2} from={0.85} dy={20}>
              <div style={{width: 800, marginTop: 12}}>
                <BB time="10:02 AM">Haan! Kal call karte hain 👍</BB>
              </div>
            </Pop>
          )}
        </div>
      )}
    </>
  );
};

// ===== 5 · weekly site photos + progress, zero "status?" calls (cream) ===================
export const C5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const weeks = [
    {at: W(6, 3), img: 'brick', w: 'Week 4', l: 'Foundation', p: 0.2},
    {at: W(6, 5), img: 'building_construction', w: 'Week 10', l: 'Structure', p: 0.55},
    {at: W(6, 7), img: 'villa_wire', w: 'Week 18', l: 'Finishing', p: 0.85},
  ];
  const callAt = W(6, 13);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Har hafte']], [['site photos + update.', true]]]} />
      <div style={abs(80, 690, {width: 920, display: 'flex', flexDirection: 'column', gap: 16})}>
        {weeks.map((w, i) =>
          t > w.at - 0.2 ? (
            <Pop key={i} t={t} at={w.at - 0.2} dy={30}>
              <TCard th={th} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '14px 22px 14px 14px'}}>
                <div style={{width: 120, height: 104, borderRadius: 20, background: i === 2 ? '#F4F7F4' : '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  <Img src={w.img.startsWith('villa') ? a3(w.img) : fl(w.img)} style={{width: w.img.startsWith('villa') ? 150 : 76, height: w.img.startsWith('villa') ? 150 : 76}} />
                </div>
                <div style={{flex: 1, fontFamily: SANS}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                    <b style={{fontSize: 32}}>{w.l}</b>
                    <Label color={th.cardSub} size={18}>{w.w}</Label>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
                    <div style={{flex: 1}}>
                      <Bar p={w.p * ep(t, w.at, 1)} h={16} />
                    </div>
                    <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.green}}>{Math.round(w.p * ep(t, w.at, 1) * 100)}%</span>
                  </div>
                </div>
                <Img src={fl('camera_with_flash')} style={{width: 46, height: 46}} />
              </TCard>
            </Pop>
          ) : null,
        )}
      </div>
      {t > callAt - 0.2 && (
        <Pop t={t} at={callAt - 0.2} style={abs(80, 1240)} dy={30}>
          <div style={{width: 920, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
            <div style={{position: 'relative', width: 90, height: 90, borderRadius: 45, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px rgba(0,0,0,0.12)'}}>
              <Img src={fl('telephone_receiver')} style={{width: 56, height: 56}} />
              <div style={{position: 'absolute', left: 14, right: 14, top: 43, height: 6, borderRadius: 3, background: C.red, transform: `rotate(-40deg) scaleX(${ep(t, W(6, 17), 0.3)})`}} />
            </div>
            <div style={{background: C.ink, color: '#fff', borderRadius: 26, padding: '14px 26px', fontFamily: SANS, fontWeight: 700, fontSize: 30}}>
              "Kaam kahan tak pahuncha?" calls: <span style={{fontFamily: MONO, color: '#7CE0A3'}}>0</span>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · handover: key, 5-star review, referral to his brother (green) ===================
export const C6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const starAt = W(7, 5);
  const fwdAt = W(7, 11);
  const leadAt = W(7, 15);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Handover ke din:']], [['review + referral.', true]]]} />
      <Pop t={t} at={L + 0.1} style={abs(40, 640)} from={0.5}>
        <div style={{position: 'relative', width: 520, height: 520}}>
          <Img src={a3('villa')} style={{width: 520, height: 520}} />
          <div style={abs(330, 300)}>
            <Icon3D n="key" size={150} t={t} seed={1} style={{transform: `rotate(${(1 - ep(t, L + 0.5, 0.8)) * -90}deg)`, opacity: ep(t, L + 0.5, 0.3)}} />
          </div>
        </div>
      </Pop>
      <Pop t={t} at={starAt - 0.3} style={abs(560, 720)} dy={30}>
        <div style={{width: 460, background: '#fff', borderRadius: 28, padding: '18px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: SANS, color: C.ink}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 44, height: 44, borderRadius: 22, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#4285F4'}}>G</div>
            <b style={{fontSize: 24}}>Rohit · Google review</b>
          </div>
          <div style={{display: 'flex', gap: 6, marginTop: 12}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 68, height: 68, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
          <div style={{fontSize: 22, color: '#5A554E', marginTop: 10, opacity: ep(t, starAt + 0.8, 0.4)}}>"Har hafte update mila. Best team!"</div>
        </div>
      </Pop>
      {t > fwdAt - 0.3 && (
        <Pop t={t} at={fwdAt - 0.3} style={abs(80, 1150)} dy={30} from={0.85}>
          <div style={{width: 760}}>
            <BB me time="7:12 PM" tag="Forwarded · to Bhai">Bhai, ghar banwana hai toh inse baat kar 👉 studio.arch · +91 98xxx</BB>
          </div>
        </Pop>
      )}
      {t > leadAt && (
        <Pop t={t} at={leadAt} style={abs(800, 1090)} rot={8}>
          <Chip img="busts_in_silhouette" txt="+1 lead" light size={30} />
        </Pop>
      )}
    </>
  );
};

// ===== 7 · lesson: trust + referrals, not just portfolio (dark) ===========================
export const C7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const noAt = W(8, 6);
  const refAt = W(8, 9);
  const grow = W(8, 11);
  const ring1 = [0, 1, 2].map((k) => ({a: -Math.PI / 2 + (k - 1) * 0.95, r: 230}));
  const ring2 = [0, 1, 2, 3, 4, 5].map((k) => ({a: -Math.PI / 2 + (k - 2.5) * 0.48, r: 400}));
  const cx = 460;
  const cy = 560;
  const count = 1 + (t > refAt ? 3 : 0) + (t > grow ? 6 : 0);
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Portfolio se nahi...']], [['bharose se badhta hai.', true]]]} />
      <div style={abs(80, 650, {width: 920, height: 800})}>
        <Pop t={t} at={L + 0.3} style={abs(0, 90)}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, background: '#22201D', color: '#fff', borderRadius: 24, padding: '12px 22px 12px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: t > noAt ? 0.45 : 1}}>
            <Img src={fl('framed_picture')} style={{width: 46, height: 46}} /> Sirf portfolio
            <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 4, background: C.red, transform: `scaleX(${ep(t, noAt, 0.3)})`, transformOrigin: 'left'}} />
          </div>
        </Pop>
        <svg width="920" height="800" style={{position: 'absolute', inset: 0}}>
          {ring1.map((p, k) => (
            <line key={k} x1={cx} y1={cy} x2={cx + Math.cos(p.a) * p.r} y2={cy + Math.sin(p.a) * p.r} stroke={C.green} strokeWidth="5" strokeDasharray="300" strokeDashoffset={300 * (1 - ep(t, refAt + k * 0.12, 0.5))} />
          ))}
          {ring2.map((p, k) => {
            const par = ring1[Math.min(2, Math.floor(k / 2))];
            return <line key={k} x1={cx + Math.cos(par.a) * par.r} y1={cy + Math.sin(par.a) * par.r} x2={cx + Math.cos(p.a) * p.r} y2={cy + Math.sin(p.a) * p.r} stroke="rgba(124,224,163,0.6)" strokeWidth="4" strokeDasharray="300" strokeDashoffset={300 * (1 - ep(t, grow + k * 0.08, 0.5))} />;
          })}
        </svg>
        {ring2.map((p, k) => (
          <div key={k} style={{position: 'absolute', left: cx + Math.cos(p.a) * p.r - 44, top: cy + Math.sin(p.a) * p.r - 44, opacity: ep(t, grow + 0.2 + k * 0.08, 0.2), transform: `scale(${sp(t, grow + 0.2 + k * 0.08, 1.2)})`}}>
            <Img src={fl('house_with_garden')} style={{width: 88, height: 88}} />
          </div>
        ))}
        {ring1.map((p, k) => (
          <div key={k} style={{position: 'absolute', left: cx + Math.cos(p.a) * p.r - 60, top: cy + Math.sin(p.a) * p.r - 60, opacity: ep(t, refAt + 0.3 + k * 0.12, 0.2), transform: `scale(${sp(t, refAt + 0.3 + k * 0.12, 1.2)})`}}>
            <div style={{width: 120, height: 120, borderRadius: 60, background: '#22201D', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${C.green}`}}>
              <Img src={fl(['man', 'woman', 'old_woman'][k])} style={{width: 80, height: 80}} />
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', left: cx - 150, top: cy - 150}}>
          <Pop t={t} at={L + 0.4} from={0.3}>
            <Img src={a3('villa_b')} style={{width: 300, height: 300}} />
          </Pop>
        </div>
        {t > refAt && (
          <div style={abs(640, 90)}>
            <Pop t={t} at={refAt}>
              <div style={{background: C.green, color: '#fff', borderRadius: 24, padding: '12px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap'}}>
                Projects: <span style={{fontFamily: MONO, fontWeight: 800}}>{count}</span>
              </div>
            </Pop>
          </div>
        )}
      </div>
    </>
  );
};

const LIST = ['Instant AI reply', 'Site visit booking', 'Proposal follow-up', 'Weekly updates', 'Reviews + referrals'];
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
                <span style={{color: '#fff', fontSize: 24, fontWeight: 700}}>Architect Growth Guide.pdf</span>
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
