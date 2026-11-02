import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, W, WaHeader, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const THEMES: Theme[] = ['dark', 'cream', 'dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'cream'];
type P = {t: number; th: Tok};
const CLINIC = 'SmileCare Dental';

// real 3D props rendered with three.js (scripts/3d)
const m3 = (n: string) => staticFile(`med3d/${n}.png`);
const Prop: React.FC<{n: string; size: number; t: number; seed?: number; at?: number; style?: React.CSSProperties}> = ({n, size, t, seed = 0, at, style}) => {
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : sp(t, at);
  return (
    <div style={{position: 'absolute', width: size, height: size, ...style, transform: `scale(${lerp(0.3, 1, s)}) rotate(${(1 - Math.min(1, s)) * 25}deg)`, opacity: at === undefined ? 1 : ep(t, at, 0.2)}}>
      <div style={{position: 'absolute', left: size * 0.25, right: size * 0.25, bottom: size * 0.08, height: size * 0.08, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', filter: `blur(${size * 0.04}px)`}} />
      <Img src={m3(n)} style={{width: size, height: size, transform: `translateY(${Math.sin(t * 1.3 + seed) * size * 0.03}px) rotate(${Math.sin(t * 0.8 + seed) * 3}deg)`}} />
    </div>
  );
};

// ===== 0 · interactive pain slider + tooth drop, then likes != patients (dark) ======
const LAND = 0.8;
const TIPS: [string, string, boolean][] = [
  ['tooth', '#EEF4F1', false],
  ['toothbrush', '#E9F3EC', true],
  ['pill', '#F6EEE3', false],
  ['stethoscope', '#E7EDF5', false],
  ['capsule', '#F1F0EA', true],
  ['green_apple', '#FBEBC8', false],
];
export const S0: React.FC<P> = ({t, th}) => {
  const qAt = W(0, 3) - 0.1;
  const dragA = W(0, 6);
  const dragB = W(0, 10);
  const leave = ep(t, W(0, 11) - 0.2, 0.6);
  const igAt = W(0, 13);
  const no = W(0, 20);
  const fall = clamp01(t / LAND);
  const dy = t < LAND ? lerp(-760, 0, fall * fall) : -Math.abs(Math.sin((t - LAND) * 9)) * 50 * Math.exp(-(t - LAND) * 5);
  const spin = Math.floor(t < LAND ? t * 55 : LAND * 55 + (t - LAND) * 10) % 48;
  const shake = t > LAND ? Math.sin((t - LAND) * 70) * 12 * Math.exp(-(t - LAND) * 9) : 0;
  const v = lerp(2, 9, eio(t, dragA, dragB - dragA));
  const face = v < 4 ? 'slightly_smiling_face' : v < 7 ? 'worried_face' : 'anguished_face';
  const TW = 600;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Headline t={t} at={0.1} th={th} a={[[['If we managed your ']], [['clinic', true]]]} />
      {leave < 1 && (
        <div style={abs(360, 650, {width: 360, height: 360, opacity: 1 - leave, transform: `translateY(${-leave * 200}px) scale(${1 - leave * 0.3})`})}>
          <div style={{position: 'absolute', left: 90, right: 90, bottom: 40, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(12px)', transform: `scaleX(${lerp(0.3, 1, fall)})`}} />
          <Img src={staticFile(`med3d/tooth_spin/${String(spin).padStart(2, '0')}.png`)} style={{position: 'absolute', left: 0, top: -30, width: 360, height: 360, transform: `translateY(${dy}px)`}} />
          {t > dragB - 0.4 && <Img src={fl('adhesive_bandage')} style={{position: 'absolute', left: 210, top: 40, width: 110, height: 110, transform: `scale(${sp(t, dragB - 0.4)}) rotate(-20deg)`}} />}
        </div>
      )}
      {t > qAt && leave < 1 && (
        <div style={abs(130, 1030, {opacity: 1 - leave, transform: `translateX(${-leave * 320}px) rotate(${-2 - leave * 10}deg)`})}>
          <Pop t={t} at={qAt} from={0.5} rot={-10}>
            <div style={{width: 820, background: '#fff', borderRadius: 32, padding: '24px 30px 26px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS, position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <Img src={fl(face)} style={{width: 90, height: 90, transform: `scale(${1 + 0.15 * Math.abs(Math.sin(v * 2))})`}} />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 800, fontSize: 34, color: C.ink}}>Dard kitna hai?</div>
                  <div style={{fontSize: 22, color: '#8C8780'}}>Slide karke batao</div>
                </div>
                <div style={{fontWeight: 800, fontSize: 64, color: v > 7 ? C.red : C.ink, letterSpacing: '-0.04em'}}>{Math.round(v)}</div>
                <span style={{fontSize: 26, color: '#8C8780', marginTop: 24}}>/10</span>
              </div>
              <div style={{position: 'relative', height: 60, marginTop: 18, marginLeft: 40}}>
                <div style={{position: 'absolute', left: 0, top: 22, width: TW, height: 16, borderRadius: 8, background: '#EEEAE3'}} />
                <div style={{position: 'absolute', left: 0, top: 22, width: (TW * v) / 10, height: 16, borderRadius: 8, background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.red})`, backgroundSize: `${TW}px 100%`}} />
                <div style={{position: 'absolute', left: (TW * v) / 10 - 26, top: 4, width: 52, height: 52, borderRadius: 26, background: '#fff', border: `5px solid ${v > 7 ? C.red : C.green}`, boxShadow: '0 6px 14px rgba(0,0,0,0.25)'}} />
                {t > qAt + 0.5 && t < dragB + 0.8 && (
                  <Img src={fl('index_pointing_up')} style={{position: 'absolute', left: (TW * v) / 10 - 40, top: 30, width: 110, height: 110, transform: `rotate(-12deg) scale(${t > dragA - 0.1 && t < dragA + 0.1 ? 0.9 : 1})`, opacity: ep(t, qAt + 0.5, 0.3) * (1 - ep(t, dragB + 0.4, 0.3)), filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))'}} />
                )}
              </div>
              {t > dragB && (
                <div style={{position: 'absolute', right: 26, top: -24, background: C.red, color: '#fff', borderRadius: 16, padding: '6px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: '0.1em', transform: `scale(${sp(t, dragB, 1.3)}) rotate(5deg)`}}>URGENT</div>
              )}
            </div>
          </Pop>
        </div>
      )}
      <div style={abs(300, 720, {transform: `translateY(${(1 - sp(t, igAt - 0.4, 0.9)) * 300}px)`, opacity: ep(t, igAt - 0.4, 0.3)})}>
        <Phone w={480} h={640} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '68px 20px 12px', borderBottom: '1px solid #eee'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 32, height: 32}} />
              <b style={{fontSize: 24, color: '#111'}}>smilecare.dental</b>
              <span style={{marginLeft: 'auto', fontSize: 17, color: '#888'}}>Reels</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3}}>
              {TIPS.map(([n, bg, is3d], i) => {
                const at = igAt + 0.2 + i * 0.18;
                const likes = Math.round(lerp(0, 200 + rnd(i) * 900, ep(t, at, 2.5)));
                return (
                  <div key={i} style={{height: 230, background: bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, at, 0.3) * (t > no ? 0.35 : 1), transform: `scale(${lerp(0.7, 1, sp(t, at))})`}}>
                    <Img src={is3d ? m3(n) : fl(n)} style={{width: is3d ? 160 : 100, height: is3d ? 160 : 100}} />
                    <div style={{position: 'absolute', left: 8, bottom: 8, fontWeight: 700, fontSize: 16, color: '#111'}}>♥ {likes}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Phone>
      </div>
      {t > no && (
        <div style={abs(230, 1000, {transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, no, 1.3))})`, opacity: ep(t, no, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '10px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 48, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'})}>
          LIKES ≠ PATIENTS
        </div>
      )}
    </div>
  );
};

// ===== 1 · smooth patient experience (cream) ===================================
export const S1: React.FC<P> = ({t, th}) => {
  const L = W(1, 0) - 0.2;
  const steps = [
    {n: 'mobile_phone', l: 'Enquiry'},
    {n: 'calendar', l: 'Appointment'},
    {n: 'tooth', l: 'Treatment'},
    {n: 'star', l: 'Review'},
  ];
  const draw = ep(t, W(1, 2), W(1, 6) - W(1, 2) + 0.6);
  const W0 = 900;
  // ECG-shaped path across the four steps
  const pts: string[] = [];
  for (let x = 0; x <= W0; x += 6) {
    const k = x / (W0 / 4);
    const ph = k - Math.floor(k);
    const y = ph > 0.42 && ph < 0.5 ? -120 * Math.sin(((ph - 0.42) / 0.08) * Math.PI) : ph > 0.5 && ph < 0.56 ? 50 * Math.sin(((ph - 0.5) / 0.06) * Math.PI) : 0;
    pts.push(`${x},${y}`);
  }
  return (
    <>
      <Headline t={t} at={L} th={th} a={[[['Har patient, ']], [['smooth experience.', true]]]} />
      <Pop t={t} at={L + 0.2} style={abs(410, 700)} from={0.4}>
        <Icon3D n="hospital" size={260} t={t} seed={1} />
      </Pop>
      <svg width="1080" height="400" style={{position: 'absolute', left: 0, top: 1000}}>
        <polyline points={pts.join(' ')} transform="translate(90 150)" fill="none" stroke={C.green} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2400" strokeDashoffset={2400 * (1 - draw)} />
      </svg>
      {steps.map((s, i) => {
        const at = W(1, 2) + (i * (W(1, 6) - W(1, 2) + 0.6)) / 4 + 0.2;
        const x = 90 + (i + 0.46) * (W0 / 4);
        return t > at ? (
          <div key={i} style={abs(x - 70, 1000 + 150 - 200)}>
            <Pop t={t} at={at} from={0.3}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                <div style={{width: 120, height: 120, borderRadius: 60, background: '#fff', boxShadow: '0 16px 30px rgba(40,30,20,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={fl(s.n)} style={{width: 80, height: 80}} />
                </div>
              </div>
            </Pop>
            <Label color={th.sub} size={17} style={{position: 'absolute', top: 260, left: -20, width: 180, textAlign: 'center', opacity: ep(t, at, 0.3)}}>{s.l}</Label>
          </div>
        ) : null;
      })}
    </>
  );
};

// ===== 2 · 11 PM toothache -> Google -> WhatsApp (dark) =============================
export const S2: React.FC<P> = ({t, th}) => {
  const painAt = W(2, 8);
  const gAt = W(2, 11);
  const resAt = W(2, 16);
  const waAt = W(2, 20);
  const q = 'dentist near me';
  const typed = q.slice(0, Math.floor(clamp01((t - W(2, 13)) / 0.8) * q.length));
  const ph = sp(t, waAt - 0.3, 0.9);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} th={th} a={[[['Raat 11 baje. ']], [['Daant mein dard.', true]]]} />
      <Pop t={t} at={W(2, 3)} style={abs(60, 690)} rot={-8}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#2A2724', borderRadius: 40, padding: '10px 22px 10px 10px', boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
          <div style={{width: 70, height: 70, borderRadius: 35, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl(t > painAt ? 'face_with_head-bandage' : 'woman')} style={{width: 54, height: 54, transform: `scale(${t > painAt ? sp(t, painAt) : 1})`}} />
          </div>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff'}}>Neha</span>
        </div>
      </Pop>
      <Pop t={t} at={W(2, 0)} style={abs(870, 680)} rot={-10}>
        <Icon3D n="crescent_moon" size={140} t={t} seed={2} />
      </Pop>
      {t > gAt && (
        <Pop t={t} at={gAt} style={abs(130, 840)} dy={40}>
          <div style={{width: 820, background: '#fff', borderRadius: 28, padding: '18px 22px', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#F1F3F4', borderRadius: 30, padding: '12px 18px'}}>
              <Img src={fl('magnifying_glass_tilted_left')} style={{width: 34, height: 34}} />
              <span style={{fontSize: 28, color: '#111'}}>
                {typed}
                {t < resAt && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
              </span>
            </div>
            {t > resAt && (
              <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, opacity: ep(t, resAt, 0.3), transform: `translateY(${(1 - ep(t, resAt, 0.4)) * 20}px)`}}>
                <Img src={fl('tooth')} style={{width: 64, height: 64}} />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 800, fontSize: 28, color: '#1A0DAB'}}>{CLINIC}</div>
                  <div style={{fontSize: 20, color: '#555'}}>
                    <span style={{color: '#E8A400'}}>★ 4.8</span> (312) · Dentist · 1.2 km
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, background: C.wa, color: '#fff', borderRadius: 14, padding: '10px 14px', fontWeight: 700, fontSize: 20}}>WhatsApp</div>
              </div>
            )}
          </div>
        </Pop>
      )}
      <div style={abs(250, 1110, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, waAt - 0.3, 0.3)})}>
        <Phone w={580} h={290} dark>
          <WaHeader name={CLINIC} sub="Business account" />
          <div style={{padding: '14px 20px'}}>
            {t > waAt + 0.3 && (
              <Pop t={t} at={waAt + 0.3} from={0.8} dy={20}>
                <Bubble time="11:04 PM">Daant mein bahut dard hai. Kal appointment milega?</Bubble>
              </Pop>
            )}
          </div>
        </Phone>
      </div>
    </>
  );
};

// ===== 3 · AI asks + books 10:30 (cream) ===========================================
export const S3: React.FC<P> = ({t, th}) => {
  const askAt = W(3, 5);
  const slotAt = W(3, 8);
  const pick = W(3, 10);
  const conf = W(3, 14);
  const slots = ['9:30', '10:30', '12:00', '5:00'];
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} th={th} a={[[['AI ne ']], [['slot book kiya.', true]]]} />
      <Prop n="capsule" size={170} t={t} seed={3} at={W(3, 1)} style={{left: 880, top: 460}} />
      <Pop t={t} at={W(3, 1)} style={abs(110, 700)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '22px 26px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}}>{CLINIC} · AI</div>
            <Label color={C.green} size={16} style={{marginLeft: 'auto'}}>11:04 PM</Label>
          </div>
          <Bubble me time="11:04 PM" tag="AI assistant">
            Sorry to hear! Kaunsa daant hai, aur swelling hai kya?
          </Bubble>
          {t > askAt && (
            <div style={{display: 'flex', gap: 10, marginTop: 12}}>
              {['Upar right', 'Swelling hai', 'Sensitivity'].map((q, i) => (
                <div key={i} style={{background: i < 2 ? '#E7F6EC' : '#F1EFEA', color: i < 2 ? C.green : '#6B655C', border: i < 2 ? `2px solid ${C.green}` : '2px solid transparent', borderRadius: 20, padding: '8px 16px', fontFamily: SANS, fontWeight: 700, fontSize: 21, transform: `scale(${sp(t, askAt + i * 0.12)})`}}>{q}</div>
              ))}
            </div>
          )}
          {t > slotAt && (
            <div style={{display: 'flex', gap: 12, marginTop: 18}}>
              {slots.map((s, i) => {
                const sel = i === 1 && t > pick;
                return (
                  <div key={i} style={{flex: 1, height: 70, borderRadius: 18, border: sel ? `3px solid ${C.green}` : '2px solid #E4E0D8', background: sel ? C.green : '#fff', color: sel ? '#fff' : C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sel ? lerp(0.9, 1, sp(t, pick)) : sp(t, slotAt + i * 0.08)})`}}>{s}</div>
                );
              })}
            </div>
          )}
        </TCard>
      </Pop>
      {t > conf && (
        <Pop t={t} at={conf} style={abs(160, 1170)} dy={60} rot={-3}>
          <div style={{width: 760, display: 'flex', alignItems: 'center', gap: 20, background: C.ink, color: '#fff', borderRadius: 28, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.25)'}}>
            <Img src={fl('calendar')} style={{width: 80, height: 80}} />
            <div style={{fontFamily: SANS, flex: 1}}>
              <Label color={C.wa} size={16}>Appointment confirmed</Label>
              <div style={{fontWeight: 800, fontSize: 32}}>Kal · 10:30 AM · Dr. Mehta</div>
            </div>
            <Check size={60} p={ep(t, conf + 0.1, 0.4)} />
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · reminder -> on time -> zero no-show (green) ==============================
export const S4: React.FC<P> = ({t, th}) => {
  const remAt = W(4, 5) - 0.1;
  const arrAt = W(4, 9);
  const zeroAt = W(4, 13);
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.2} th={th} a={[[['Reminder → ']], [['zero no-show.', true]]]} />
      {t > remAt && (
        <div style={abs(110, 690, {width: 860, transform: `translateY(${(1 - ep(t, remAt, 0.5)) * -60}px)`, opacity: ep(t, remAt, 0.25)})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.96)', borderRadius: 30, padding: '18px 22px', boxShadow: '0 24px 50px rgba(0,0,0,0.25)', fontFamily: SANS}}>
            <Img src={fl('bell')} style={{width: 70, height: 70, transform: `rotate(${Math.sin((t - remAt) * 18) * 16 * (1 - ep(t, remAt, 1))}deg)`}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 19, color: '#888'}}>WhatsApp · 8:30 AM</div>
              <div style={{fontWeight: 800, fontSize: 28, color: '#111'}}>Aaj 10:30 AM appointment · 2 ghante baaki</div>
            </div>
          </div>
        </div>
      )}
      {t > arrAt && (
        <Pop t={t} at={arrAt} style={abs(110, 880)} dy={40}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
            <div style={{width: 74, height: 74, borderRadius: 37, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('woman')} style={{width: 54, height: 54}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 30}}>Neha checked in</div>
              <div style={{fontSize: 22, color: '#8C8780'}}>10:24 AM · 6 min early</div>
            </div>
            <Check size={58} p={ep(t, arrAt + 0.1, 0.4)} />
          </div>
        </Pop>
      )}
      {t > zeroAt - 0.3 && (
        <Pop t={t} at={zeroAt - 0.3} style={abs(110, 1060)} dy={40}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 20, background: C.ink, borderRadius: 26, padding: '18px 26px', fontFamily: SANS, color: '#fff'}}>
            <Img src={fl('clipboard')} style={{width: 64, height: 64}} />
            <div style={{flex: 1, fontSize: 26}}>Today · 18 appointments</div>
            <div style={{textAlign: 'right'}}>
              <Label color="#9A948C" size={15}>No-shows</Label>
              <div style={{fontWeight: 800, fontSize: 56, color: C.wa, lineHeight: 1}}>{t > zeroAt ? 0 : 3}</div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · prescription + care + day-3 check-in (cream) ============================
export const S5: React.FC<P> = ({t, th}) => {
  const rxAt = W(5, 3);
  const careAt = W(5, 5);
  const msgAt = W(5, 15);
  const askAt = W(5, 16);
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} th={th} a={[[['Care, ']], [['treatment ke baad bhi.', true]]]} />
      <Pop t={t} at={rxAt - 0.1} style={abs(110, 690)} dy={50}>
        <TCard th={th} style={{width: 860, padding: '22px 26px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={fl('clipboard')} style={{width: 48, height: 48}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, flex: 1}}>Prescription · Neha</div>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 36, height: 36}} />
          </div>
          {[
            {img: 'pill', k: 'Amoxicillin 500', v: '1-0-1 · 5 din'},
            {img: 'pill', k: 'Paracetamol 650', v: 'Dard ho toh'},
          ].map((r, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: i ? 0 : 12, opacity: ep(t, rxAt + i * 0.2, 0.3), transform: `translateX(${(1 - ep(t, rxAt + i * 0.2, 0.5)) * 40}px)`, fontFamily: SANS}}>
              <Img src={fl(r.img)} style={{width: 46, height: 46}} />
              <span style={{fontSize: 27, flex: 1, fontWeight: 600}}>{r.k}</span>
              <span style={{fontSize: 25, color: '#6B655C'}}>{r.v}</span>
            </div>
          ))}
          {t > careAt && (
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, padding: '12px 16px', background: '#E7F6EC', borderRadius: 16, fontFamily: SANS, fontSize: 23, color: C.green, fontWeight: 600, opacity: ep(t, careAt, 0.3)}}>
              <Img src={fl('droplet')} style={{width: 34, height: 34}} /> 24 ghante garam khana avoid karein
            </div>
          )}
        </TCard>
      </Pop>
      {t > msgAt && (
        <Pop t={t} at={msgAt} style={abs(330, 1120)} dy={40} from={0.8}>
          <div style={{width: 640}}>
            <Bubble me time="Day 3 · 6:00 PM" tag="Auto check-in">
              Hi Neha! Ab dard kaisa hai?
            </Bubble>
          </div>
        </Pop>
      )}
      {t > askAt + 0.4 && (
        <Pop t={t} at={askAt + 0.4} style={abs(110, 1250)} dy={30} from={0.8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 22, padding: '12px 20px', fontFamily: SANS, fontSize: 25, color: '#111', boxShadow: '0 10px 20px rgba(40,30,20,0.12)'}}>
            Bilkul theek! Thank you <Img src={fl('smiling_face_with_smiling_eyes')} style={{width: 36, height: 36}} />
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · happy patient -> 5-star review (dark) =====================================
export const S6: React.FC<P> = ({t, th}) => {
  const clickAt = W(6, 7);
  const starAt = W(6, 10);
  const nStars = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  const rating = t > starAt + 0.8 ? 4.9 : 4.8;
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} th={th} a={[[['Khush patient = ']], [['5★ review.', true]]]} />
      <Pop t={t} at={W(6, 0)} style={abs(820, 650)} rot={12}>
        <Icon3D n="beaming_face_with_smiling_eyes" size={150} t={t} seed={6} />
      </Pop>
      <Pop t={t} at={W(6, 3)} style={abs(110, 780)} dy={50}>
        <div style={{width: 860, background: '#fff', borderRadius: 30, padding: '24px 28px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 60, height: 60, borderRadius: 30, background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 30}}>
              <span style={{color: '#4285F4'}}>G</span>
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 28, color: '#111'}}>{CLINIC}</div>
              <div style={{fontSize: 21, color: '#666'}}>
                <b style={{color: '#111'}}>{rating.toFixed(1)}</b> <span style={{color: '#E8A400'}}>★★★★★</span> ({t > starAt + 0.8 ? 313 : 312} reviews)
              </div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center'}}>
            {[0, 1, 2, 3, 4].map((k) => (
              <Img key={k} src={fl('star')} style={{width: 92, height: 92, filter: k < nStars ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < nStars ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
            ))}
          </div>
          {t > starAt + 0.7 && (
            <div style={{marginTop: 18, padding: '14px 18px', background: '#F7F7F7', borderRadius: 16, fontSize: 24, color: '#333', opacity: ep(t, starAt + 0.7, 0.4)}}>
              "Raat ko WhatsApp kiya, subah appointment mil gaya. Painless treatment!" · <b>Neha S.</b>
            </div>
          )}
        </div>
      </Pop>
      {t > clickAt && t < starAt + 0.4 && (
        <Img src={fl('index_pointing_up')} style={{position: 'absolute', left: lerp(900, 640, eio(t, clickAt, 0.6)), top: lerp(1350, 990, eio(t, clickAt, 0.6)), width: 110, height: 110, transform: 'rotate(-14deg)', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.5))', opacity: 1 - ep(t, starAt + 0.1, 0.3)}} />
      )}
    </>
  );
};

// ===== 7 · 6-month recall (cream) ================================================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
export const S7: React.FC<P> = ({t, th}) => {
  const flipA = W(7, 1);
  const remAt = W(7, 4);
  const backAt = W(7, 9);
  const mi = Math.min(6, Math.floor(clamp01((t - flipA) / 1.0) * 6.99));
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} th={th} a={[[['6 mahine baad. ']], [['Phir se.', true]]]} />
      <Prop n="toothbrush" size={240} t={t} seed={7} at={W(7, 4)} style={{left: 820, top: 1020}} />
      <Pop t={t} at={W(7, 0)} style={abs(110, 690)} dy={40}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{width: 200, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(40,30,20,0.16)', fontFamily: SANS, textAlign: 'center'}}>
            <div style={{background: C.red, color: '#fff', fontWeight: 800, fontSize: 30, padding: '8px 0'}}>{MONTHS[mi]}</div>
            <div style={{background: '#fff', color: C.ink, fontWeight: 800, fontSize: 90, padding: '6px 0'}}>{t > flipA + 1 ? 14 : 14}</div>
          </div>
          <div style={{fontFamily: SANS, color: th.fg}}>
            <Label color={th.sub} size={18}>Last visit · Jan 14</Label>
            <div style={{fontWeight: 800, fontSize: 40, marginTop: 6}}>Cleaning due</div>
            <div style={{display: 'flex', gap: 6, marginTop: 10}}>
              {MONTHS.slice(0, 7).map((m, i) => (
                <div key={m} style={{width: 46, height: 10, borderRadius: 5, background: i <= mi ? C.green : '#E4E0D8'}} />
              ))}
            </div>
          </div>
        </div>
      </Pop>
      {t > remAt && (
        <Pop t={t} at={remAt} style={abs(110, 960)} dy={40} from={0.85}>
          <div style={{width: 700}}>
            <Bubble me time="Jul 10 · 10:00 AM" tag="Auto recall">
              Hi Neha! Aapki 6-month cleaning due hai. Is Saturday ka slot book karein?
            </Bubble>
          </div>
        </Pop>
      )}
      {t > backAt && (
        <Pop t={t} at={backAt} style={abs(110, 1180)} dy={30}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 26, padding: '14px 24px', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
            <Check size={40} p={ep(t, backAt, 0.3)} /> Neha phir se aayi · visit #2
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 8 · growth = trust + repeat visits (green) =====================================
export const S8: React.FC<P> = ({t, th}) => {
  const newAt = W(8, 5);
  const repAt = W(8, 9);
  const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  return (
    <>
      <Headline t={t} at={W(8, 0) - 0.2} th={th} a={[[['Growth = ']], [['bharosa + repeat.', true]]]} />
      <div style={abs(110, 700, {width: 860, height: 560, display: 'flex', alignItems: 'flex-end', gap: 24})}>
        {months.map((m, i) => {
          const a = 70 + i * 4;
          const b = 40 + i * 48;
          const ha = lerp(0, a, ep(t, newAt + i * 0.06, 0.6));
          const hb = t > repAt ? lerp(0, b, eio(t, repAt + i * 0.08, 0.8)) : 0;
          return (
            <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                <div style={{height: hb, background: C.ink, borderRadius: '14px 14px 0 0'}} />
                <div style={{height: ha, background: 'rgba(255,255,255,0.85)', borderRadius: hb > 2 ? 0 : '14px 14px 0 0'}} />
              </div>
              <Label color="rgba(255,255,255,0.8)" size={18}>{m}</Label>
            </div>
          );
        })}
      </div>
      <div style={abs(110, 1290, {display: 'flex', gap: 16})}>
        {t > newAt && (
          <Pop t={t} at={newAt}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.9)', color: C.ink, borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 26}}>New patients</div>
          </Pop>
        )}
        {t > repAt && (
          <Pop t={t} at={repAt + 0.2}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.ink, color: '#fff', borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 26}}>
              <Img src={fl('red_heart')} style={{width: 32, height: 32}} /> Repeat + referrals
            </div>
          </Pop>
        )}
      </div>
      <Pop t={t} at={repAt + 0.7} style={abs(830, 470)} rot={-20}>
        <Icon3D n="stethoscope" size={170} t={t} seed={8} />
      </Pop>
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
      <Headline t={t} at={W(9, 0) - 0.3} th={th} a={[[['Aapke clinic ki']], [['problem?', true]]]} />
      <Prop n="tooth" size={180} t={t} seed={9} at={W(9, 2)} style={{left: 870, top: 440}} />
      <Pop t={t} at={W(9, 1)} style={abs(90, 720)} dy={50}>
        <TCard th={th} style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <Img src={fl('man_health_worker')} style={{width: 52, height: 52}} />
            <b style={{fontSize: 27}}>Dr. Mehta – Jaipur</b>
            <Label color={th.cardSub} size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? th.cardSub : C.ink, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'No-shows bahut hote hain...'}
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
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi clinic automation ki saari details</div>
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
