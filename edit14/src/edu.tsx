import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, W, WaHeader, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const THEMES: Theme[] = ['dark', 'cream', 'dark', 'cream', 'green', 'dark', 'cream', 'green', 'dark', 'cream'];
type P = {t: number; th: Tok};
const INST = 'Bright Future Classes';

// real 3D props rendered with three.js (scripts/3d)
const e3 = (n: string) => staticFile(`edu3d/${n}.png`);
const Prop: React.FC<{n: string; size: number; t: number; seed?: number; at?: number; style?: React.CSSProperties}> = ({n, size, t, seed = 0, at, style}) => {
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : sp(t, at);
  return (
    <div style={{position: 'absolute', width: size, height: size, ...style, transform: `scale(${lerp(0.3, 1, s)}) rotate(${(1 - Math.min(1, s)) * 25}deg)`, opacity: at === undefined ? 1 : ep(t, at, 0.2)}}>
      <div style={{position: 'absolute', left: size * 0.2, right: size * 0.2, bottom: size * 0.06, height: size * 0.1, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', filter: `blur(${size * 0.04}px)`}} />
      <Img src={e3(n)} style={{width: size, height: size, transform: `translateY(${Math.sin(t * 1.3 + seed) * size * 0.03}px) rotate(${Math.sin(t * 0.8 + seed) * 3}deg)`}} />
    </div>
  );
};

// ===== 0 · interactive OMR question + cap drop, then posters != admissions (dark board)
const LAND = 0.8;
const POSTERS = [
  ['Riya', '98.4%', '1st_place_medal'],
  ['Kabir', '97.2%', 'sports_medal'],
  ['Ananya', '96.8%', 'trophy'],
  ['Arjun', '95.5%', 'glowing_star'],
];
export const S0: React.FC<P> = ({t, th}) => {
  const qAt = W(0, 3) - 0.1;
  const fillAt = W(0, 12);
  const leave = ep(t, W(0, 14) - 0.2, 0.6);
  const igAt = W(0, 16);
  const no = W(0, 20);
  const fall = clamp01(t / LAND);
  const dy = t < LAND ? lerp(-760, 0, fall * fall) : -Math.abs(Math.sin((t - LAND) * 9)) * 50 * Math.exp(-(t - LAND) * 5);
  const spin = Math.floor(t < LAND ? t * 55 : LAND * 55 + (t - LAND) * 10) % 48;
  const shake = t > LAND ? Math.sin((t - LAND) * 70) * 12 * Math.exp(-(t - LAND) * 9) : 0;
  // pencil travels to bubble B and shades it
  const pIn = eio(t, qAt + 0.7, fillAt - qAt - 0.8);
  const shadeP = ep(t, fillAt, 0.6);
  const BX = 236;
  const BY = 230; // bubble B centre inside the card
  const scrib = t > fillAt && t < fillAt + 0.6 ? Math.sin((t - fillAt) * 60) * 10 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Headline t={t} at={0.1} th={th} a={[[['If we managed your ']], [['institute', true]]]} />
      {leave < 1 && (
        <div style={abs(330, 640, {width: 420, height: 420, opacity: 1 - leave, transform: `translateY(${-leave * 200}px) scale(${1 - leave * 0.3})`})}>
          <div style={{position: 'absolute', left: 90, right: 90, bottom: 80, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(12px)', transform: `scaleX(${lerp(0.3, 1, fall)})`}} />
          <Img src={staticFile(`edu3d/cap_spin/${String(spin).padStart(2, '0')}.png`)} style={{position: 'absolute', left: 0, top: -40, width: 420, height: 420, transform: `translateY(${dy}px)`}} />
        </div>
      )}
      {t > qAt && leave < 1 && (
        <div style={abs(130, 1000, {opacity: 1 - leave, transform: `translateX(${-leave * 320}px) rotate(${-2 - leave * 10}deg)`})}>
          <Pop t={t} at={qAt} from={0.5} rot={-10}>
            <div style={{width: 820, background: '#FBF8F1', borderRadius: 22, padding: '24px 28px 20px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS, position: 'relative', backgroundImage: 'linear-gradient(rgba(31,157,85,0.10) 2px, transparent 2px)', backgroundSize: '100% 56px', backgroundPosition: '0 70px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{background: C.ink, color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 22, borderRadius: 8, padding: '2px 10px'}}>Q1</div>
                <div style={{fontWeight: 800, fontSize: 30, color: C.ink}}>Admissions sabse zyada kahan se?</div>
              </div>
              {[
                ['A', 'Instagram result posters'],
                ['B', 'Parents ka bharosa'],
                ['C', 'Banners & hoardings'],
              ].map(([k, txt], i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, height: 64, marginTop: i ? 0 : 14}}>
                  <div style={{position: 'relative', width: 46, height: 46, borderRadius: 23, border: `3px solid ${i === 1 && t > fillAt ? C.green : '#9A948C'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 20, color: '#6B655C', overflow: 'hidden'}}>
                    {k}
                    {i === 1 && t > fillAt && <div style={{position: 'absolute', inset: 0, background: C.green, clipPath: `inset(${(1 - shadeP) * 100}% 0 0 0)`}} />}
                  </div>
                  <span style={{fontSize: 28, color: C.ink, fontWeight: i === 1 && t > fillAt ? 800 : 500}}>{txt}</span>
                  {i === 1 && t > fillAt + 0.5 && <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: C.green, color: '#fff', borderRadius: 20, padding: '6px 16px', fontWeight: 800, fontSize: 24, transform: `scale(${sp(t, fillAt + 0.5)}) rotate(-4deg)`}}>✓ Correct · +4</div>}
                </div>
              ))}
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 17, letterSpacing: '0.14em', color: t > fillAt ? C.green : '#9A948C', marginTop: 6}}>{t > fillAt ? 'APNA ANSWER COMMENT MEIN LIKHO' : 'TAP / SHADE ONE BUBBLE'}</div>
              {/* 3D pencil, tip anchored on bubble B */}
              {t > qAt + 0.6 && (
                <Img
                  src={e3('pencil')}
                  style={{position: 'absolute', width: 300, height: 300, left: lerp(700, BX, pIn) - 84 + scrib, top: lerp(300, BY, pIn) - 276 + Math.abs(scrib) * 0.4, opacity: (1 - ep(t, fillAt + 0.7, 0.3)) * ep(t, qAt + 0.6, 0.3), filter: 'drop-shadow(0 18px 16px rgba(0,0,0,0.35))'}}
                />
              )}
            </div>
          </Pop>
        </div>
      )}
      {/* topper posters */}
      {t > igAt - 0.3 && (
        <div style={abs(120, 720, {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22, width: 840})}>
          {POSTERS.map(([n, pct, ic], i) => {
            const at = igAt - 0.2 + i * 0.15;
            return (
              <div key={i} style={{height: 270, borderRadius: 24, background: i % 2 ? '#FBF8F1' : '#F1F6F2', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: ep(t, at, 0.3) * (t > no ? 0.35 : 1), transform: `scale(${lerp(0.7, 1, sp(t, at))}) rotate(${(i % 2 ? 2 : -2) * (1 - ep(t, at, 0.6))}deg)`, fontFamily: SANS}}>
                <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 52, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: '0.14em'}}>BOARD TOPPER</div>
                <Img src={fl(ic)} style={{position: 'absolute', left: 20, top: 74, width: 110, height: 110}} />
                <div style={{position: 'absolute', left: 150, top: 86, fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: '-0.03em'}}>{pct}</div>
                <div style={{position: 'absolute', left: 150, top: 168, fontSize: 28, color: '#6B655C'}}>{n} · Class 10</div>
                <div style={{position: 'absolute', left: 20, bottom: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, color: '#8C8780'}}>
                  <Img src={icon('instagram-icon.svg')} style={{width: 22, height: 22}} /> {Math.round(lerp(0, 120 + rnd(i) * 300, ep(t, at, 2)))} likes
                </div>
              </div>
            );
          })}
        </div>
      )}
      {t > no && (
        <div style={abs(170, 960, {transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, no, 1.3))})`, opacity: ep(t, no, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '10px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'})}>
          POSTERS ≠ ADMISSIONS
        </div>
      )}
    </div>
  );
};

// ===== 1 · every parent's trust (cream) ==========================================
export const S1: React.FC<P> = ({t, th}) => {
  const L = W(1, 0) - 0.2;
  const trustAt = W(1, 4);
  return (
    <>
      <Headline t={t} at={L} th={th} a={[[['Har parent ka ']], [['bharosa.', true]]]} />
      <Prop n="books" size={230} t={t} seed={1} at={L + 0.4} style={{left: 10, top: 1180}} />
      <div style={abs(90, 760, {width: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
        {[
          {n: 'man', l: 'Parent', at: W(1, 2)},
          {n: 'handshake', l: '', at: W(1, 4)},
          {n: 'man_teacher', l: 'Institute', at: W(1, 2) + 0.2},
        ].map((x, i) =>
          t > x.at ? (
            <Pop key={i} t={t} at={x.at} from={0.3}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                {i === 1 ? (
                  <Icon3D n="handshake" size={260} t={t} seed={2} />
                ) : (
                  <div style={{width: 200, height: 200, borderRadius: 100, background: '#fff', boxShadow: '0 24px 50px rgba(40,30,20,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Img src={fl(x.n)} style={{width: 140, height: 140}} />
                  </div>
                )}
                {x.l && <Label color={th.sub} size={20}>{x.l}</Label>}
              </div>
            </Pop>
          ) : null,
        )}
      </div>
      {t > trustAt && (
        <Pop t={t} at={trustAt + 0.1} style={abs(250, 1120)}>
          <TCard th={th} style={{width: 580, padding: '18px 24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Label color={C.green} size={18}>Parent trust</Label>
              <div style={{display: 'flex', gap: 4}}>
                {[0, 1, 2, 3, 4].map((k) => (
                  <Img key={k} src={fl('star')} style={{width: 30, height: 30, transform: `scale(${sp(t, trustAt + 0.3 + k * 0.1, 1.2)})`}} />
                ))}
              </div>
            </div>
            <div style={{marginTop: 12, height: 16, borderRadius: 8, background: '#EEEAE3'}}>
              <div style={{width: `${ep(t, trustAt + 0.2, 1.2) * 100}%`, height: '100%', borderRadius: 8, background: C.green}} />
            </div>
          </TCard>
        </Pop>
      )}
    </>
  );
};

// ===== 2 · 9 PM, Google Maps -> WhatsApp (dark) ====================================
export const S2: React.FC<P> = ({t, th}) => {
  const mapAt = W(2, 6);
  const waAt = W(2, 12);
  const qAt = W(2, 15);
  const ph = sp(t, waAt - 0.3, 0.9);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} th={th} a={[[['Raat 9 baje. ']], [['Ek message.', true]]]} />
      <Pop t={t} at={W(2, 0)} style={abs(60, 700)} rot={-10}>
        <Icon3D n="crescent_moon" size={140} t={t} seed={2} />
      </Pop>
      <Pop t={t} at={mapAt} style={abs(250, 690)} rot={4}>
        <div style={{width: 760, background: '#fff', borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
          <div style={{height: 150, position: 'relative', background: '#EAF0E6', overflow: 'hidden'}}>
            {[0, 1, 2, 3].map((k) => (
              <div key={`h${k}`} style={{position: 'absolute', left: 0, right: 0, top: 18 + k * 40, height: 10, background: '#fff'}} />
            ))}
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={`v${k}`} style={{position: 'absolute', top: 0, bottom: 0, left: 60 + k * 160, width: 12, background: '#fff', transform: 'skewX(-14deg)'}} />
            ))}
            <Img src={fl('round_pushpin')} style={{position: 'absolute', left: 340, top: 18, width: 84, height: 84, transform: `translateY(${-Math.abs(Math.sin((t - mapAt) * 5)) * 16 * Math.exp(-(t - mapAt) * 1.5)}px)`}} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px'}}>
            <Img src={fl('school')} style={{width: 64, height: 64}} />
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 28, color: '#111'}}>{INST}</div>
              <div style={{fontSize: 20, color: '#666'}}>
                <span style={{color: '#E8A400'}}>★ 4.7</span> (312) · Coaching centre · Open
              </div>
            </div>
            <div style={{background: C.wa, color: '#fff', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 20}}>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 26, height: 26, filter: 'brightness(10)'}} /> Chat
            </div>
          </div>
        </div>
      </Pop>
      <div style={abs(250, 990, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, waAt - 0.3, 0.3)})}>
        <Phone w={580} h={400} dark>
          <WaHeader name={INST} sub="Business account" />
          <div style={{padding: '22px 20px'}}>
            {t > qAt && (
              <Pop t={t} at={qAt} from={0.8} dy={30}>
                <Bubble time="9:02 PM">Namaste! Class 10 ki fees aur batch timing kya hai?</Bubble>
              </Pop>
            )}
          </div>
        </Phone>
      </div>
      {t > W(2, 3) && (
        <Pop t={t} at={W(2, 3)} style={abs(40, 1040)} rot={-6}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#2A2724', borderRadius: 30, padding: '8px 18px 8px 8px', boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
            <div style={{width: 54, height: 54, borderRadius: 27, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('man')} style={{width: 40, height: 40}} />
            </div>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#fff'}}>Sharma ji</span>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · instant reply + demo class (cream) ======================================
export const S3: React.FC<P> = ({t, th}) => {
  const rows = [
    {at: W(3, 3), img: 'money_bag', k: 'Fees', v: '₹2,500 / month'},
    {at: W(3, 4), img: 'alarm_clock', k: 'Batch', v: 'Mon–Fri · 4–6 PM'},
    {at: W(3, 7), img: 'man_teacher', k: 'Faculty', v: '12+ yrs experience'},
  ];
  const tk = W(3, 12) - 0.1;
  const booked = W(3, 17);
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} th={th} a={[[['Turant ']], [['reply.', true]]]} />
      <Prop n="books" size={190} t={t} seed={3} at={W(3, 1)} style={{left: 870, top: 450}} />
      <Pop t={t} at={W(3, 1)} style={abs(110, 720)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '22px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}}>{INST} · AI reply</div>
            <Label color={C.green} size={16} style={{marginLeft: 'auto'}}>9:02 PM</Label>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: i ? '1px solid rgba(0,0,0,0.06)' : 'none', opacity: ep(t, r.at, 0.3), transform: `translateX(${(1 - ep(t, r.at, 0.5)) * 40}px)`}}>
              <Img src={fl(r.img)} style={{width: 50, height: 50}} />
              <span style={{fontFamily: SANS, fontSize: 28, flex: 1}}>{r.k}</span>
              <b style={{fontFamily: SANS, fontSize: 29}}>{r.v}</b>
            </div>
          ))}
        </TCard>
      </Pop>
      {t > tk && (
        <Pop t={t} at={tk} style={abs(160, 1110)} dy={60} rot={-3}>
          <div style={{width: 760, display: 'flex', alignItems: 'center', gap: 20, background: C.ink, color: '#fff', borderRadius: 28, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.25)'}}>
            <Img src={fl('admission_tickets')} style={{width: 84, height: 84}} />
            <div style={{fontFamily: SANS, flex: 1}}>
              <Label color={C.wa} size={16}>Free demo class</Label>
              <div style={{fontWeight: 800, fontSize: 34}}>Saturday · 11:00 AM</div>
            </div>
            {t > booked && <Check size={62} p={ep(t, booked, 0.4)} />}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · admission + 3 instalments + auto reminder (green board) =================
export const S4: React.FC<P> = ({t, th}) => {
  const admAt = W(4, 5);
  const instAt = W(4, 9);
  const remAt = W(4, 17);
  const inst = [
    {txt: '₹10,000', m: 'April', paid: true},
    {txt: '₹10,000', m: 'July', paid: false},
    {txt: '₹10,000', m: 'October', paid: false},
  ];
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.2} th={th} a={[[['Admission ']], [['confirmed.', true]]]} />
      <Prop n="cap" size={200} t={t} seed={4} at={admAt + 0.2} style={{left: 850, top: 420}} />
      <Pop t={t} at={admAt - 0.1} style={abs(110, 700)} dy={40}>
        <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 28, padding: '18px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
          <div style={{width: 96, height: 96, borderRadius: 48, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('boy')} style={{width: 72, height: 72}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 34}}>Aarav Sharma</div>
            <div style={{fontSize: 22, color: '#8C8780'}}>Class 10 · Batch A · Roll no. 24</div>
          </div>
          <Check size={64} p={ep(t, admAt + 0.2, 0.4)} />
        </div>
      </Pop>
      <div style={abs(110, 900, {display: 'flex', gap: 18})}>
        {inst.map((x, i) => {
          const at = instAt + i * 0.2;
          return t > at ? (
            <Pop key={i} t={t} at={at} dy={40}>
              <div style={{width: 274, background: '#fff', borderRadius: 24, padding: '18px 18px', boxShadow: '0 16px 30px rgba(0,0,0,0.16)', fontFamily: SANS, color: C.ink, border: x.paid ? `3px solid ${C.wa}` : '3px solid transparent'}}>
                <Label color="#8C8780" size={15}>Installment {i + 1}</Label>
                <div style={{fontWeight: 800, fontSize: 36, marginTop: 4}}>{x.txt}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: 21, color: '#6B655C'}}>
                  {x.m}
                  {x.paid ? <Check size={30} p={1} /> : <Img src={fl('hourglass_not_done')} style={{width: 30, height: 30}} />}
                </div>
              </div>
            </Pop>
          ) : null;
        })}
      </div>
      {t > remAt && (
        <Pop t={t} at={remAt} style={abs(110, 1140)} dy={50}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: C.ink, color: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <Img src={fl('bell')} style={{width: 62, height: 62, transform: `rotate(${Math.sin((t - remAt) * 18) * 16 * (1 - ep(t, remAt, 1))}deg)`}} />
            <div style={{flex: 1}}>
              <Label color={C.wa} size={15}>Auto reminder · WhatsApp</Label>
              <div style={{fontWeight: 700, fontSize: 27}}>Installment 2 due in 3 days</div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · absent alert in 10 minutes (dark board) ===================================
const ROLL = [
  ['Aditi', 'P'],
  ['Aarav', 'A'],
  ['Dev', 'P'],
  ['Meera', 'P'],
  ['Rohan', 'P'],
];
export const S5: React.FC<P> = ({t, th}) => {
  const absAt = W(5, 4);
  const tAt = W(5, 6);
  const alertAt = W(5, 14) - 0.1;
  const mins = Math.round(clamp01((t - tAt) / (alertAt - tAt)) * 10);
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} th={th} a={[[['Absent? ']], [['10 min mein alert.', true]]]} />
      <Pop t={t} at={W(5, 0)} style={abs(110, 700)} dy={40}>
        <div style={{width: 560, background: '#FBF8F1', borderRadius: 22, padding: '20px 24px', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS, color: C.ink}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
            <Img src={fl('memo')} style={{width: 40, height: 40}} />
            <b style={{fontSize: 26}}>Attendance · 4 PM batch</b>
          </div>
          {ROLL.map(([n, m], i) => {
            const isA = m === 'A';
            const at = W(5, 0) + 0.2 + i * 0.15;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, borderTop: '1px solid rgba(0,0,0,0.07)', fontSize: 25, fontWeight: isA && t > absAt ? 800 : 500, color: isA && t > absAt ? C.red : C.ink}}>
                {n}
                {(isA ? t > absAt : t > at) && (
                  <div style={{width: 40, height: 40, borderRadius: 20, border: `3px solid ${isA ? C.red : C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 20, color: isA ? C.red : C.green, transform: `scale(${sp(t, isA ? absAt : at, 1.2)})`}}>{m}</div>
                )}
              </div>
            );
          })}
        </div>
      </Pop>
      {t > tAt && (
        <Pop t={t} at={tAt} style={abs(720, 760)}>
          <div style={{position: 'relative', width: 230, height: 230}}>
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r="98" fill="#22201D" stroke="rgba(255,255,255,0.12)" strokeWidth="14" />
              <circle cx="115" cy="115" r="98" fill="none" stroke={C.wa} strokeWidth="14" strokeLinecap="round" strokeDasharray={616} strokeDashoffset={616 * (1 - mins / 10)} transform="rotate(-90 115 115)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: '#fff'}}>
              <div style={{fontWeight: 800, fontSize: 64, lineHeight: 1}}>{mins}</div>
              <div style={{fontSize: 22, color: '#9A948C'}}>min</div>
            </div>
            <Img src={fl('stopwatch')} style={{position: 'absolute', right: -26, top: -26, width: 84, height: 84}} />
          </div>
        </Pop>
      )}
      {t > alertAt && (
        <Pop t={t} at={alertAt} style={abs(110, 1110)} dy={-50}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 58, height: 58}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 19, color: '#888'}}>To: Sharma ji · 4:10 PM</div>
              <div style={{fontWeight: 700, fontSize: 26, color: '#111'}}>Aarav aaj 4 PM class mein absent hai. Sab theek?</div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · test report on WhatsApp (cream) ========================================
const MARKS = [
  ['Maths', 86],
  ['Science', 91],
  ['English', 78],
  ['SST', 84],
] as const;
export const S6: React.FC<P> = ({t, th}) => {
  const mAt = W(6, 4);
  const pAt = W(6, 6);
  const sent = W(6, 11);
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} th={th} a={[[['Report card, ']], [['seedha WhatsApp.', true]]]} />
      <Pop t={t} at={W(6, 1)} style={abs(110, 700)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '24px 28px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={fl('bar_chart')} style={{width: 48, height: 48}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, flex: 1}}>Aarav · Unit test 3</div>
            {t > pAt && (
              <div style={{display: 'flex', alignItems: 'center', gap: 6, background: '#E7F6EC', color: C.green, borderRadius: 20, padding: '6px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 24, transform: `scale(${sp(t, pAt)})`}}>
                <Img src={fl('chart_increasing')} style={{width: 30, height: 30}} /> +12%
              </div>
            )}
          </div>
          {MARKS.map(([s, m], i) => {
            const p = ep(t, mAt + i * 0.12, 0.9);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontFamily: SANS}}>
                <span style={{width: 130, fontSize: 25, color: '#6B655C'}}>{s}</span>
                <div style={{flex: 1, height: 26, borderRadius: 13, background: '#F1EFEA'}}>
                  <div style={{width: `${m * p}%`, height: '100%', borderRadius: 13, background: m > 85 ? C.green : '#6FBF8E'}} />
                </div>
                <b style={{width: 60, textAlign: 'right', fontSize: 27}}>{Math.round(m * p)}</b>
              </div>
            );
          })}
        </TCard>
      </Pop>
      {t > sent && (
        <Pop t={t} at={sent} style={abs(300, 1130)} dy={40} rot={-3}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#D9FDD3', borderRadius: 24, padding: '12px 22px', fontFamily: SANS, fontSize: 25, color: '#111', boxShadow: '0 16px 30px rgba(40,30,20,0.15)'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            Report sent to Sharma ji <span style={{color: '#34B7F1', fontWeight: 800}}>✓✓</span>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · happy parent refers two more (green board) ===================================
export const S7: React.FC<P> = ({t, th}) => {
  const fwAt = W(7, 6);
  const plusAt = W(7, 13);
  const cx = 540;
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} th={th} a={[[['Khush parent = ']], [['2 naye admissions.', true]]]} />
      <div style={abs(cx - 110, 700)}>
        <Pop t={t} at={W(7, 0)} from={0.3}>
          <div style={{position: 'relative', width: 220, height: 220, borderRadius: 110, background: '#fff', boxShadow: '0 24px 50px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('man')} style={{width: 150, height: 150}} />
            {t > W(7, 3) && <Img src={fl('red_heart')} style={{position: 'absolute', right: -16, top: -10, width: 70, height: 70, transform: `scale(${sp(t, W(7, 3))})`}} />}
          </div>
        </Pop>
      </div>
      {[
        {x: 170, n: 'woman', at: fwAt},
        {x: 730, n: 'man_office_worker', at: fwAt + 0.35},
      ].map((p, i) => (
        <React.Fragment key={i}>
          <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
            <path d={`M${cx} 930 Q ${(cx + p.x + 90) / 2} 1040 ${p.x + 90} 1060`} fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="14 12" strokeDashoffset={-t * 40} opacity={ep(t, p.at, 0.4)} />
          </svg>
          {t > p.at && (
            <div style={abs(p.x, 1060)}>
              <Pop t={t} at={p.at + 0.2} from={0.3}>
                <div style={{width: 180, height: 180, borderRadius: 90, background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={fl(p.n)} style={{width: 120, height: 120}} />
                </div>
              </Pop>
            </div>
          )}
          {t > p.at + 0.1 && (
            <Img src={fl('telephone')} style={{position: 'absolute', left: lerp(cx, p.x + 60, eio(t, p.at, 0.8)) - 30, top: lerp(920, 1040, eio(t, p.at, 0.8)) - 30, width: 60, height: 60, opacity: 1 - ep(t, p.at + 0.8, 0.3)}} />
          )}
        </React.Fragment>
      ))}
      {t > plusAt && (
        <Pop t={t} at={plusAt} style={abs(cx - 120, 1110)}>
          <div style={{width: 240, height: 120, borderRadius: 60, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>+2</div>
        </Pop>
      )}
    </>
  );
};

// ===== 8 · trust outweighs ads (dark board) ==========================================
export const S8: React.FC<P> = ({t, th}) => {
  const adsAt = W(8, 3);
  const trustAt = W(8, 7);
  const tilt = t > trustAt ? lerp(-8, 14, eio(t, trustAt, 0.9)) : lerp(0, -8, ep(t, adsAt, 0.6));
  const r = (tilt * Math.PI) / 180;
  const cx = 540;
  const cy = 860;
  const arm = 330;
  const lx = cx - Math.cos(r) * arm;
  const ly = cy - Math.sin(r) * arm;
  const rx = cx + Math.cos(r) * arm;
  const ry = cy + Math.sin(r) * arm;
  const Pan: React.FC<{x: number; y: number; img: string; label: string; on: boolean}> = ({x, y, img, label, on}) => (
    <div style={abs(x - 130, y)}>
      <svg width="260" height="120" style={{position: 'absolute', left: 0, top: 0}}>
        <line x1="130" y1="0" x2="30" y2="110" stroke="#C9C4BC" strokeWidth="3" />
        <line x1="130" y1="0" x2="230" y2="110" stroke="#C9C4BC" strokeWidth="3" />
      </svg>
      <div style={{position: 'absolute', left: 0, top: 110, width: 260, height: 26, borderRadius: '0 0 130px 130px', background: '#C9C4BC'}} />
      <div style={{position: 'absolute', left: 50, top: 0, width: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : -40}px)`}}>
        <Img src={fl(img)} style={{width: 120, height: 120, marginTop: -20}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 260, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff', opacity: on ? 1 : 0}}>{label}</div>
    </div>
  );
  return (
    <>
      <Headline t={t} at={W(8, 0) - 0.2} th={th} a={[[['Ads se nahi, ']], [['bharose se.', true]]]} />
      <div style={abs(cx - 14, cy, {width: 28, height: 420, borderRadius: 14, background: '#C9C4BC'})} />
      <div style={abs(cx - 120, cy + 400, {width: 240, height: 30, borderRadius: 15, background: '#C9C4BC'})} />
      <div style={abs(cx - arm - 10, cy - 8, {width: arm * 2 + 20, height: 16, borderRadius: 8, background: '#E6E1D8', transform: `rotate(${tilt}deg)`, transformOrigin: '50% 50%'})} />
      <div style={abs(cx - 22, cy - 22, {width: 44, height: 44, borderRadius: 22, background: C.green})} />
      <Pan x={lx} y={ly} img="loudspeaker" label="Ads" on={t > adsAt} />
      <Pan x={rx} y={ry} img="handshake" label="Bharosa" on={t > trustAt} />
    </>
  );
};

// ===== 9 · question + comment + DM (cream) ===========================================
export const S9: React.FC<P> = ({t, th}) => {
  const cta = W(9, 8);
  const typeAt = W(9, 10);
  const sent = typeAt + 0.65;
  const dm = W(9, 13) - 0.1;
  const typed = 'WhatsApp'.slice(0, Math.floor(clamp01((t - typeAt + 0.15) / 0.45) * 8));
  return (
    <>
      <Headline t={t} at={W(9, 0) - 0.3} th={th} a={[[['Aapke institute ki']], [['problem?', true]]]} />
      <Prop n="pencil" size={200} t={t} seed={9} at={W(9, 2)} style={{left: 860, top: 420}} />
      <Pop t={t} at={W(9, 1)} style={abs(90, 720)} dy={50}>
        <TCard th={th} style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <Img src={fl('man_teacher')} style={{width: 52, height: 52}} />
            <b style={{fontSize: 27}}>Coaching owner – Kota</b>
            <Label color={th.cardSub} size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? th.cardSub : C.ink, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'Fees follow-up mein time jaata hai...'}
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
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi admissions automation ki saari details</div>
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

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9];
