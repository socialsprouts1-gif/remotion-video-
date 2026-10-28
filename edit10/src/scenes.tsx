import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Card, Check, MONO, Mono, Phone, Pop, SANS, SERIF, Stamp, W, WaHeader, LINE, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';

export type Theme = 'dark' | 'cream' | 'green';
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

// ===== 0 · If we managed your salon ============================================
const IG_GRAD = 'linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)';
const Polaroid: React.FC<{img: string; name: string; likes: number; bg: string; reel?: boolean}> = ({img, likes, bg, reel}) => (
  <div style={{width: 230, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px'}}>
      <div style={{width: 30, height: 30, borderRadius: 15, background: IG_GRAD, padding: 2.5}}>
        <div style={{width: '100%', height: '100%', borderRadius: 15, background: C.blush, border: '2px solid #fff'}} />
      </div>
      <span style={{fontSize: 16, fontWeight: 700, color: C.ink}}>yoursalon</span>
      <span style={{marginLeft: 'auto', color: '#999', fontWeight: 700}}>···</span>
    </div>
    <div style={{height: 196, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      <Img src={icon(img)} style={{width: 110, height: 110, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.25))'}} />
      {reel && (
        <div style={{position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '4px 10px', color: '#fff', fontFamily: MONO, fontSize: 14, fontWeight: 700}}>▶ REEL</div>
      )}
    </div>
    <div style={{display: 'flex', gap: 12, padding: '10px 12px 2px'}}>
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 20.5 C5 15.5 2.5 12.5 2.5 8.8 A4.6 4.6 0 0 1 12 6.5 A4.6 4.6 0 0 1 21.5 8.8 C21.5 12.5 19 15.5 12 20.5 Z" fill={C.red} /></svg>
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M20.5 11.5 A8.5 8.5 0 1 1 17 4.6 L20.5 3.5 L19.6 7.2 A8.4 8.4 0 0 1 20.5 11.5 Z" fill="none" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" /></svg>
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 11 L21 3 L14 21 L11 13 Z" fill="none" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
    <div style={{fontSize: 17, fontWeight: 700, color: C.ink, padding: '4px 12px 12px'}}>
      {likes} <span style={{fontWeight: 400, color: '#8a8a8a'}}>likes</span>
    </div>
  </div>
);

export const S0: React.FC<{t: number}> = ({t}) => {
  const cards = [
    {at: W(0, 13), img: 'scissors.png', name: 'IMG_0412.JPG', likes: 148, bg: 'linear-gradient(135deg,#F8D9DF,#EDB3C0)', x: 130, rot: -9},
    {at: W(0, 15), img: 'sparkles.png', name: 'IMG_0418.JPG', likes: 96, bg: 'linear-gradient(135deg,#F7E7C9,#EBCB93)', x: 425, rot: 2},
    {at: W(0, 17), img: 'gem_stone.png', name: 'REEL_0425.MP4', likes: 68, bg: 'linear-gradient(135deg,#D7E9F5,#A9CBE6)', x: 720, rot: 8, reel: true},
  ];
  const no = W(0, 19);
  const shop = sp(t, 0.15, 0.9);
  return (
    <>
      {/* storefront */}
      <div style={abs(250, 690, {width: 580, height: 400, transform: `translateY(${(1 - shop) * 120}px) scale(${lerp(0.85, 1, shop)})`, opacity: ep(t, 0.1, 0.4)})}>
        <div style={{position: 'absolute', left: 40, top: 30, width: 520, height: 370, background: 'linear-gradient(180deg,#F3EEE6,#DCD4C7)', borderRadius: 10, boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}} />
        <div style={{position: 'absolute', left: 560, top: 30, width: 46, height: 370, background: '#B7AE9F', transform: 'skewY(-30deg)', transformOrigin: 'left top'}} />
        <div style={{position: 'absolute', left: 125, top: 62, width: 350, height: 74, background: C.ink, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>
          <Img src={icon('scissors.png')} style={{width: 34, height: 34}} />
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.gold, letterSpacing: '0.02em'}}>YOUR SALON</span>
          <Img src={icon('scissors.png')} style={{width: 34, height: 34, transform: 'scaleX(-1)'}} />
        </div>
        {/* awning */}
        <div style={{position: 'absolute', left: 30, top: 160, width: 540, height: 70, display: 'flex'}}>
          {Array.from({length: 9}).map((_, i) => (
            <div key={i} style={{flex: 1, background: i % 2 ? '#fff' : '#E98CA2', borderBottomLeftRadius: 30, borderBottomRightRadius: 30}} />
          ))}
        </div>
        {/* windows + door */}
        {[0, 1].map((i) => (
          <div key={i} style={{position: 'absolute', left: i ? 380 : 80, top: 255, width: 140, height: 120, background: 'linear-gradient(180deg,#FFE3A6,#F4C46A)', border: '7px solid #4A3F35', borderRadius: 6, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 30, top: 14, width: 54, height: 70, borderRadius: 30, border: '5px solid rgba(74,63,53,0.5)'}} />
            <div style={{position: 'absolute', left: 22, bottom: 0, width: 70, height: 26, borderRadius: '14px 14px 0 0', background: 'rgba(74,63,53,0.45)'}} />
          </div>
        ))}
        <div style={{position: 'absolute', left: 255, top: 245, width: 90, height: 155, background: '#4A3F35', borderRadius: '6px 6px 0 0'}}>
          <div style={{position: 'absolute', left: 13, top: 30, width: 64, height: 26, background: C.green, borderRadius: 5, color: '#fff', fontFamily: MONO, fontSize: 15, fontWeight: 800, textAlign: 'center', lineHeight: '26px'}}>OPEN</div>
        </div>
        {[-30, 560].map((x, i) => (
          <div key={i} style={{position: 'absolute', left: x, top: 330, width: 80, height: 80, borderRadius: 40, background: 'radial-gradient(circle at 35% 30%,#6DC77E,#2E8A47)'}} />
        ))}
      </div>
      {/* insta posts */}
      {cards.map((c, i) => {
        if (t < c.at) return null;
        const s = sp(t, c.at);
        const fall = no ? ep(t, no + 0.6 + i * 0.05, 0.6) : 0;
        return (
          <div key={i} style={abs(c.x, 980, {transform: `translateY(${(1 - s) * 260 + fall * 10}px) rotate(${c.rot + (1 - s) * 20}deg) scale(${lerp(0.5, 1, s)})`, opacity: ep(t, c.at, 0.2)})}>
            <Polaroid {...c} />
            {t > no + i * 0.12 && (
              <svg width="230" height="330" viewBox="0 0 230 330" style={{position: 'absolute', left: 0, top: 0}}>
                <path d="M18 30 L212 300" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="340" strokeDashoffset={340 * (1 - ep(t, no + i * 0.12, 0.25))} />
                <path d="M212 30 L18 300" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="340" strokeDashoffset={340 * (1 - ep(t, no + i * 0.12 + 0.12, 0.25))} />
              </svg>
            )}
          </div>
        );
      })}
      {t > W(0, 13) - 0.15 && (
        <div style={abs(735, 560, {transform: `translateY(${Math.sin(t * 2) * 6}px)`})}>
          <Pop t={t} at={W(0, 13) - 0.15} from={0.3} rot={-25} dy={80}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
              <div style={{width: 170, height: 170, borderRadius: 46, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 8px rgba(214,41,118,0.25), 0 30px 60px rgba(0,0,0,0.55)'}}>
                <Img src={icon('instagram-icon.svg')} style={{width: 130, height: 130}} />
              </div>
              <div style={{background: IG_GRAD, color: '#fff', borderRadius: 30, padding: '8px 22px', fontFamily: SANS, fontWeight: 800, fontSize: 30}}>Instagram</div>
            </div>
          </Pop>
        </div>
      )}
      <Stamp t={t} at={no + 0.35} text="NOT ENOUGH ×" color={C.red} rot={-10} style={{left: 290, top: 900}} fill />
    </>
  );
};

// ===== 1 · 01 WhatsApp automation ==============================================
export const S1: React.FC<{t: number}> = ({t}) => {
  const msgs = [
    {at: W(1, 6), text: 'Hi! Haircut ka price kya hai?', time: '10:41'},
    {at: W(1, 7) + 0.2, text: 'Aaj hair spa ka slot milega?', time: '10:42'},
    {at: W(1, 8) + 0.2, text: 'Bridal makeup package?', time: '10:44'},
    {at: W(1, 13), text: 'Facial kitne ka hai?', time: '11:02'},
  ];
  const ph = sp(t, LINE[1] + 0.2, 0.9);
  const toggle = ep(t, W(1, 8), 0.35);
  const shown = msgs.filter((m) => t > m.at).length;
  return (
    <>
      <div style={abs(370, 600, {transform: `translateY(${(1 - ph) * 300}px) rotate(${(1 - ph) * -6}deg)`, opacity: ep(t, LINE[1], 0.3)})}>
        <Phone w={450} h={850}>
          <WaHeader name="Glow Studio Salon" sub="Business account" />
          <div style={{padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16}}>
            {msgs.map((m, i) =>
              t > m.at ? (
                <Pop key={i} t={t} at={m.at} dy={30} from={0.8}>
                  <Bubble time={m.time}>{m.text}</Bubble>
                </Pop>
              ) : null,
            )}
            {t > W(1, 10) && (
              <Pop t={t} at={W(1, 10)} from={0.8}>
                <Bubble me time="11:02" tag="⚡ Auto-reply">
                  Hi! Glow Studio mein swagat hai. Services aur prices neeche hain
                </Bubble>
              </Pop>
            )}
          </div>
        </Phone>
      </div>
      {/* automation toggle card */}
      <Pop t={t} at={W(1, 7)} style={abs(40, 700)} rot={-6}>
        <Card style={{padding: '22px 26px', width: 290}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 46, height: 46}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, lineHeight: 1.15, color: C.ink}}>WhatsApp<br />Automation</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18}}>
            <Mono size={18} color={toggle > 0.5 ? C.green : C.mute}>{toggle > 0.5 ? 'Active' : 'Setup'}</Mono>
            <div style={{width: 84, height: 46, borderRadius: 23, background: toggle > 0.5 ? C.wa : '#D6D2CA', position: 'relative'}}>
              <div style={{position: 'absolute', top: 5, left: lerp(5, 43, toggle), width: 36, height: 36, borderRadius: 18, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />
            </div>
          </div>
        </Card>
      </Pop>
      {/* enquiries counter */}
      <Pop t={t} at={W(1, 13)} style={abs(740, 1235)} rot={6}>
        <Card style={{padding: '20px 24px', width: 280}}>
          <Mono size={17}>Enquiries today</Mono>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: '-0.03em'}}>{Math.round(lerp(18, 27, ep(t, W(1, 13), 1.4)))}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.green}}>
            <Check size={26} p={ep(t, W(1, 15), 0.4)} /> 0 missed
          </div>
        </Card>
      </Pop>
      {/* unread badge on phone */}
      {shown > 0 && (
        <div style={abs(785, 575, {width: 64, height: 64, borderRadius: 32, background: C.wa, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(t, msgs[shown - 1].at, 1.4)})`, boxShadow: '0 10px 24px rgba(37,211,102,0.45)'})}>
          {shown}
        </div>
      )}
      <Stamp t={t} at={W(1, 15)} text="0 MISSED ✓" rot={-7} style={{left: 50, top: 1330}} fill />
    </>
  );
};

// ===== 2 · 02 Instant AI replies =================================================
const Chip: React.FC<{img: string; label: string}> = ({img, label}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#24221F', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 40, padding: '12px 24px 12px 14px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
    <div style={{width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={icon(img)} style={{width: 30, height: 30}} />
    </div>
    <span style={{fontFamily: SANS, fontSize: 28, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap'}}>{label}</span>
  </div>
);
const MENU = [
  ['Haircut & styling', '₹499'],
  ['Hair spa', '₹1,199'],
  ['Facial (glow)', '₹899'],
  ['Bridal makeup', '₹14,999'],
];
export const S2: React.FC<{t: number}> = ({t}) => {
  const chips = [
    {at: W(2, 4), img: 'scissors.png', label: 'Haircut', x: 90, y: 640},
    {at: W(2, 5), img: 'sparkles.png', label: 'Hair spa', x: 640, y: 610},
    {at: W(2, 7), img: 'gem_stone.png', label: 'Facial', x: 40, y: 1250},
    {at: W(2, 9), img: 'crown.png', label: 'Bridal makeup', x: 640, y: 1435},
  ];
  const phAt = W(2, 13) - 0.3;
  const ph = sp(t, phAt, 0.9);
  const typing = t > W(2, 15) && t < W(2, 17);
  return (
    <>
      {t > phAt && (
        <div style={abs(315, 600, {transform: `translateY(${(1 - ph) * 380}px) scale(${lerp(0.8, 1, ph)})`, opacity: ep(t, phAt, 0.3)})}>
          <Phone w={450} h={820} dark>
            <WaHeader name="Glow Studio Salon" sub={typing ? 'typing…' : 'online'} />
            <div style={{padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 14}}>
              <Pop t={t} at={phAt + 0.35} from={0.8}>
                <Bubble time="7:15 PM">Hi! Bridal makeup ka price kya hai?</Bubble>
              </Pop>
              {typing && (
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <div style={{background: '#D9FDD3', borderRadius: 20, padding: '16px 22px', display: 'flex', gap: 8}}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{width: 12, height: 12, borderRadius: 6, background: '#5E8C70', opacity: 0.35 + 0.65 * Math.abs(Math.sin((t * 6 - i * 0.7) % Math.PI))}} />
                    ))}
                  </div>
                </div>
              )}
              {t > W(2, 17) && (
                <Pop t={t} at={W(2, 17)} from={0.85}>
                  <Bubble me time="7:15 PM" tag="AI assistant">
                    Hi Priya! Yeh rahe hamare popular packages
                  </Bubble>
                </Pop>
              )}
              {t > W(2, 20) && (
                <Pop t={t} at={W(2, 20)} from={0.85} style={{alignSelf: 'flex-end'}}>
                  <div style={{background: '#D9FDD3', borderRadius: 22, borderTopRightRadius: 6, padding: '14px 18px', width: 330, fontFamily: SANS}}>
                    <Mono size={15} color={C.waDeep}>Services · Glow Studio</Mono>
                    {MENU.map(([n, p], i) => (
                      <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: C.ink, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none', opacity: ep(t, W(2, 22) + i * 0.12, 0.3), transform: `translateX(${(1 - ep(t, W(2, 22) + i * 0.12, 0.4)) * 30}px)`}}>
                        <span>{n}</span>
                        <b>{p}</b>
                      </div>
                    ))}
                    <div style={{marginTop: 10, background: '#fff', borderRadius: 12, textAlign: 'center', padding: '10px 0', fontWeight: 700, fontSize: 21, color: C.waDeep, opacity: ep(t, W(2, 23), 0.3)}}>Book appointment →</div>
                  </div>
                </Pop>
              )}
            </div>
          </Phone>
        </div>
      )}
      {chips.map((c, i) =>
        t > c.at ? (
          <Pop key={i} t={t} at={c.at} style={abs(c.x, c.y, {transform: `translateY(${Math.sin(t * 1.3 + i) * 8}px)`})} dy={60} rot={i % 2 ? 8 : -8}>
            <Chip img={c.img} label={c.label} />
          </Pop>
        ) : null,
      )}
      {t > W(2, 16) && (
        <Pop t={t} at={W(2, 16)} style={abs(90, 1060)} rot={-5}>
          <div style={{background: C.green, color: '#fff', borderRadius: 18, padding: '14px 24px', fontFamily: SANS, fontWeight: 700, fontSize: 28, boxShadow: '0 20px 40px rgba(31,157,85,0.4)'}}>
            ⚡ Replied in 2 sec
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · 03 Book appointments ================================================
const SLOTS = ['10:00', '11:30', '1:00', '2:30', '4:00', '5:30', '6:30', '7:30', '8:15'];
const TAKEN = [0, 2, 5, 7];
export const S3: React.FC<{t: number}> = ({t}) => {
  const L = W(3, 0) - 0.2;
  const pick = W(3, 4);
  const conf = W(3, 7);
  const staffAt = W(3, 11);
  const strike = W(3, 14);
  const cur = clamp01((t - (pick - 0.7)) / 0.7);
  // cursor travels to the 4:00 slot
  const cx = lerp(820, 520, eio(t, pick - 0.7, 0.7));
  const cy = lerp(1180, 985, eio(t, pick - 0.7, 0.7));
  return (
    <>
      <Pop t={t} at={L + 0.15} style={abs(150, 610)} dy={80}>
        <Card style={{width: 780, padding: 36}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <Mono size={18}>Glow Studio · Tue 14 Nov</Mono>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 4}}>Pick a time</div>
            </div>
            <Img src={icon('calendar.png')} style={{width: 70, height: 70}} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28}}>
            {SLOTS.map((s, i) => {
              const sel = i === 4 && t > pick;
              const taken = TAKEN.includes(i);
              return (
                <div
                  key={i}
                  style={{
                    height: 76,
                    borderRadius: 18,
                    border: sel ? `3px solid ${C.green}` : '2px solid #E4E0D8',
                    background: sel ? C.green : taken ? '#F2F0EB' : '#fff',
                    color: sel ? '#fff' : taken ? '#BDB7AD' : C.ink,
                    textDecoration: taken ? 'line-through' : 'none',
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transform: `scale(${sel ? lerp(0.9, 1, sp(t, pick)) : 1})`,
                    opacity: ep(t, L + 0.3 + i * 0.05, 0.3),
                  }}
                >
                  {s} {sel && <Check size={26} color="#fff" stroke={C.green} p={ep(t, pick, 0.3)} />}
                </div>
              );
            })}
          </div>
        </Card>
      </Pop>
      {/* cursor */}
      {t > pick - 0.7 && t < conf + 0.6 && (
        <div style={abs(cx, cy, {opacity: Math.min(cur * 3, 1 - ep(t, conf, 0.5))})}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#fff" stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          {t > pick && <div style={{position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${C.green}`, transform: `scale(${lerp(0.3, 1.6, ep(t, pick, 0.5))})`, opacity: 1 - ep(t, pick, 0.5)}} />}
        </div>
      )}
      {t > conf && (
        <Pop t={t} at={conf} style={abs(200, 1150)} dy={50}>
          <Card style={{width: 680, padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 20}}>
            <Check size={64} p={ep(t, conf + 0.1, 0.4)} />
            <div style={{fontFamily: SANS}}>
              <div style={{fontWeight: 700, fontSize: 32, color: C.ink}}>Appointment confirmed</div>
              <div style={{fontSize: 24, color: C.mute, marginTop: 4}}>Hair spa · Tue, 4:00 PM · Priya</div>
            </div>
          </Card>
        </Pop>
      )}
      {t > staffAt && (
        <Pop t={t} at={staffAt} style={abs(250, 1330)} rot={4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 24, padding: '16px 26px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'}}>
            <Img src={icon('busts_in_silhouette.png')} style={{width: 46, height: 46}} />
            <div style={{position: 'relative', fontFamily: SANS, fontWeight: 600, fontSize: 28, color: '#fff'}}>
              Staff manual replies:{' '}
              <b style={{color: t > strike ? C.wa : C.red}}>{t > strike ? 0 : Math.round(lerp(12, 38, ep(t, staffAt, 1.2)))}</b>
              {t > strike && <div style={{position: 'absolute', left: 0, top: '52%', height: 4, width: `${ep(t, strike, 0.35) * 100}%`, background: C.wa, borderRadius: 2}} />}
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · 04 Smart follow-ups ==================================================
export const S4: React.FC<{t: number}> = ({t}) => {
  const noshow = W(4, 6);
  const ghost = W(4, 11);
  const f1 = W(4, 18);
  const f2 = W(4, 19) + 0.25;
  const back = W(4, 23);
  const L = W(4, 0) - 0.2;
  const items: {at: number; node: React.ReactNode}[] = [
    {
      at: noshow,
      node: (
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(229,72,77,0.14)', border: `2px solid ${C.red}`, borderRadius: 16, padding: '12px 20px', fontFamily: SANS, fontSize: 24, fontWeight: 600, color: '#FF8A8E'}}>
          <Img src={icon('cross_mark.png')} style={{width: 30, height: 30}} /> No-show · Tue 4:00 PM
        </div>
      ),
    },
    {
      at: ghost,
      node: (
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '12px 20px', fontFamily: SANS, fontSize: 24, color: '#A8A29A'}}>
          <span style={{color: '#34B7F1'}}>✓✓</span> Seen · no reply for 3 days
        </div>
      ),
    },
    {at: f1, node: <Bubble me time="Day 1 · 11:00" tag="Auto follow-up">Hi Priya, aapka slot miss ho gaya. Naya time book karein?</Bubble>},
    {at: f2, node: <Bubble me time="Day 3 · 6:00 PM" tag="Auto follow-up">Is week hair spa par 10% off. Sirf 4 slots baaki!</Bubble>},
    {at: back, node: <Bubble time="Day 3 · 6:04 PM">Haan! Saturday 5 baje book kar do</Bubble>},
  ];
  return (
    <>
      <Pop t={t} at={L + 0.15} style={abs(140, 600)} dy={80}>
        <Card dark style={{width: 800, padding: '30px 30px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
            <div style={{width: 74, height: 74, borderRadius: 37, background: 'linear-gradient(135deg,#F7C8B5,#E39C83)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#7A3E2A'}}>P</div>
            <div style={{fontFamily: SANS}}>
              <div style={{fontWeight: 700, fontSize: 32, color: '#fff'}}>Priya Sharma</div>
              <div style={{fontSize: 22, color: '#8C8780'}}>{t > back ? 'online' : 'last seen 3 days ago'}</div>
            </div>
            <div style={{marginLeft: 'auto'}}>
              <Mono size={17} color={t > back ? C.wa : '#8C8780'}>{t > back ? '● Re-engaged' : '○ Gone quiet'}</Mono>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24, minHeight: 600}}>
            {items.map((it, i) =>
              t > it.at ? (
                <Pop key={i} t={t} at={it.at} from={0.85} dy={30}>
                  {it.node}
                </Pop>
              ) : null,
            )}
          </div>
        </Card>
      </Pop>
      <Stamp t={t} at={W(4, 26)} text="RECONNECTED ✓" rot={-8} style={{left: 300, top: 1340}} fill />
    </>
  );
};

// ===== 5 · focus on clients ======================================================
export const S5: React.FC<{t: number}> = ({t}) => {
  const L = W(5, 0) - 0.2;
  const better = W(5, 9);
  const flood = W(5, 17);
  const ai = W(5, 23);
  const hrs = t < flood ? 0 : t < ai ? lerp(0.2, 4.5, ep(t, flood, 1.6)) : lerp(4.5, 0, ep(t, ai, 0.8));
  const hh = Math.floor(hrs);
  const mm = Math.floor((hrs - hh) * 60);
  return (
    <>
      <Pop t={t} at={L + 0.15} style={abs(170, 600)} dy={80}>
        <Card style={{width: 740, padding: 36, display: 'flex', gap: 30, alignItems: 'center'}}>
          <div style={{width: 200, height: 200, borderRadius: 100, background: `linear-gradient(135deg, ${C.blush}, #E58FA6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Img src={icon('barber_pole.png')} style={{width: 120, height: 120}} />
          </div>
          <div style={{fontFamily: SANS}}>
            <Mono size={18}>Chair 02 · with client</Mono>
            <div style={{fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 6, lineHeight: 1.1}}>Better service,<br />happier clients</div>
            <div style={{display: 'flex', gap: 6, marginTop: 14}}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{fontSize: 42, color: C.gold, transform: `scale(${sp(t, better + i * 0.1, 1.2)})`, display: 'inline-block'}}>★</span>
              ))}
            </div>
          </div>
        </Card>
      </Pop>
      {[
        {k: 5, img: 'scissors.png', label: 'Stylists'},
        {k: 6, img: 'sparkles.png', label: 'Makeup artists'},
        {k: 7, img: 'busts_in_silhouette.png', label: 'Front desk'},
      ].map((x, i) =>
        t > W(5, x.k) ? (
          <div key={i} style={abs(170 + i * 0, 900 + i * 110, {opacity: 1 - ep(t, flood, 0.4)})}>
            <Pop t={t} at={W(5, x.k)} dy={30}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 40, padding: '12px 28px 12px 14px', boxShadow: '0 14px 30px rgba(40,30,20,0.12)', width: 700}}>
                <div style={{width: 58, height: 58, borderRadius: 29, background: C.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={icon(x.img)} style={{width: 36, height: 36}} />
                </div>
                <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.ink}}>{x.label}</span>
                <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.green}}>
                  focus on clients <Check size={30} p={ep(t, W(5, 13) + i * 0.1, 0.4)} />
                </span>
              </div>
            </Pop>
          </div>
        ) : null,
      )}
      {/* message flood */}
      {Array.from({length: 7}).map((_, i) => {
        const at = flood + i * 0.18;
        if (t < at) return null;
        const away = ep(t, ai + i * 0.04, 0.5);
        const x = 120 + rnd(i + 3) * 470;
        const y = 1000 + rnd(i + 11) * 260;
        return (
          <div key={i} style={abs(x, y, {transform: `translateX(${away * (i % 2 ? 900 : -900)}px) rotate(${(rnd(i) - 0.5) * 12}deg) scale(${lerp(0.6, 1, sp(t, at))})`, opacity: ep(t, at, 0.2) * (1 - away)})}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: '12px 18px', boxShadow: '0 14px 30px rgba(40,30,20,0.18)', fontFamily: SANS, fontSize: 21, color: C.ink, width: 330}}>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 34, height: 34}} />
              <div>
                <b>New message</b>
                <div style={{color: C.mute, fontSize: 18}}>{['Price list bhejo?', 'Kal slot hai?', 'Spa kitne ka?', 'Bridal trial?', 'Timing kya hai?', 'Location?', 'Offer hai?'][i]}</div>
              </div>
            </div>
          </div>
        );
      })}
      {t > flood && (
        <Pop t={t} at={flood} style={abs(250, 1330)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: t > ai ? C.green : C.ink, borderRadius: 24, padding: '16px 28px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'}}>
            <Img src={icon('hourglass_not_done.png')} style={{width: 46, height: 46}} />
            <div style={{fontFamily: SANS, color: '#fff'}}>
              <div style={{fontSize: 20, opacity: 0.75}}>{t > ai ? 'Handled by AI' : 'Time on WhatsApp / day'}</div>
              <div style={{fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em'}}>
                {hh}h {String(mm).padStart(2, '0')}m
              </div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6a · enquiries ≠ appointments (green) ==================================
export const S6a: React.FC<{t: number}> = ({t}) => {
  const L = W(6, 0) - 0.2;
  const n = Math.round(lerp(312, 1248, ep(t, L + 0.3, 2.6)));
  const x = W(6, 8);
  return (
    <>
      <Pop t={t} at={L + 0.2} style={abs(190, 720)} dy={60}>
        <Card style={{width: 700, padding: '34px 40px'}}>
          <Mono size={20}>
            <Img src={icon('speech_balloon.png')} style={{width: 26, height: 26, verticalAlign: '-5px', marginRight: 10}} />
            WhatsApp enquiries
          </Mono>
          <div style={{position: 'relative', display: 'inline-block'}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 128, color: C.ink, letterSpacing: '-0.04em', marginTop: 4}}>{n.toLocaleString('en-IN')}</div>
            {t > x && <div style={{position: 'absolute', left: -10, top: '54%', height: 10, width: `${ep(t, x, 0.35) * 110}%`, background: C.red, borderRadius: 5}} />}
          </div>
        </Card>
      </Pop>
      {t > x + 0.15 && (
        <>
          <Pop t={t} at={x + 0.15} style={abs(480, 1030)}>
            <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 130, color: '#fff'}}>≠</div>
          </Pop>
          <Pop t={t} at={x + 0.3} style={abs(300, 1220)}>
            <div style={{background: C.ink, color: '#fff', borderRadius: 40, padding: '16px 34px', fontFamily: SANS, fontWeight: 700, fontSize: 32}}>Appointments booked: 0</div>
          </Pop>
        </>
      )}
    </>
  );
};

// ===== 6b · fill every chair (cream) ============================================
export const S6b: React.FC<{t: number}> = ({t}) => {
  const a = W(6, 10) - 0.1;
  const b = W(6, 13);
  const full = W(6, 17);
  const N = 12;
  const filled = Math.min(N, Math.floor(clamp01((t - a) / (b - a)) * N + (t > a ? 1 : 0)));
  return (
    <>
      <div style={abs(150, 700, {width: 780, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40})}>
        {Array.from({length: N}).map((_, i) => {
          const on = i < filled;
          const at = a + (i / N) * (b - a);
          return (
            <div key={i} style={{height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, W(6, 9) - 0.3 + i * 0.03, 0.3)}}>
              <div style={{width: 130, height: 130, borderRadius: 65, border: `5px ${on ? 'solid' : 'dashed'} ${on ? C.green : '#CFCAC0'}`, background: on ? 'rgba(31,157,85,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? lerp(0.8, 1, sp(t, at)) : 1})`}}>
                {on ? <Check size={64} p={ep(t, at, 0.3)} /> : <Img src={icon('scissors.png')} style={{width: 44, height: 44, opacity: 0.25, filter: 'grayscale(1)'}} />}
              </div>
            </div>
          );
        })}
      </div>
      <Pop t={t} at={W(6, 10)} style={abs(355, 1270)}>
        <div style={{background: C.ink, color: '#fff', borderRadius: 30, padding: '12px 28px', fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.08em'}}>
          SLOTS BOOKED {filled}/{N}
        </div>
      </Pop>
      <Stamp t={t} at={W(6, 13) + 0.2} text="FULLY BOOKED ✓" rot={-12} style={{left: 250, top: 930}} fill size={54} />
      {t > full && (
        <Pop t={t} at={full} style={abs(260, 1380)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 40, padding: '12px 26px 12px 14px', boxShadow: '0 16px 30px rgba(40,30,20,0.15)'}}>
            <div style={{display: 'flex'}}>
              {['#F7C8B5', '#C9D8F5', '#F5E1A8'].map((c, i) => (
                <div key={i} style={{width: 46, height: 46, borderRadius: 23, background: c, border: '3px solid #fff', marginLeft: i ? -14 : 0}} />
              ))}
            </div>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.ink}}>↺ Repeat clients · 3rd visit</span>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · biggest problem? =====================================================
export const S7: React.FC<{t: number}> = ({t}) => {
  const tiles = [
    {img: 'speech_balloon.png', label: 'MISSED\nENQUIRIES', at: W(7, 8)},
    {img: 'calendar.png', label: 'EMPTY\nSLOTS', at: W(7, 10)},
    {img: 'alarm_clock.png', label: 'FOLLOW-\nUPS', at: W(7, 15)},
  ];
  const active = tiles.reduce((a, x, i) => (t > x.at ? i : a), -1);
  const typeStart = W(7, 10) + 0.4;
  const msg = 'Weekdays pe slots khaali rehte hain';
  const cta = W(8, 0);
  const sent = W(8, 2) + 0.6;
  const typed =
    t < cta
      ? msg.slice(0, Math.floor(clamp01((t - typeStart) / 2.4) * msg.length))
      : 'WhatsApp'.slice(0, Math.floor(clamp01((t - W(8, 2) + 0.15) / 0.45) * 8));
  const L = W(7, 0) - 0.2;
  const dm = W(8, 6) - 0.1;
  return (
    <>
      <div style={abs(110, 650, {display: 'flex', gap: 30})}>
        {tiles.map((x, i) => (
          <Pop key={i} t={t} at={L + 0.25 + i * 0.12} dy={60}>
            <div style={{width: 260, height: 240, borderRadius: 32, background: '#fff', border: active === i ? `6px solid ${C.green}` : '6px solid transparent', boxShadow: '0 24px 50px rgba(40,30,20,0.14)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, transform: `scale(${active === i ? lerp(0.94, 1.06, sp(t, x.at)) : 1})`}}>
              <Img src={icon(x.img)} style={{width: 84, height: 84}} />
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', color: C.ink, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3}}>{x.label}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop t={t} at={W(7, 8) - 0.2} style={abs(110, 960)} dy={50}>
        <Card style={{width: 860, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: '#E7E2D8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#6B655C'}}>S</div>
            <b style={{fontSize: 26, color: C.ink}}>Salon owner – Pune</b>
            <Mono size={15}>· owner</Mono>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 28, color: t > sent ? C.mute : C.ink, minHeight: 34}}>
              {t > sent ? 'Comment posted ✓' : typed}
              {t < sent && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </div>
            <div style={{width: 76, height: 76, borderRadius: 38, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > sent ? lerp(0.8, 1, sp(t, sent)) : 1})`}}>
              <svg width="34" height="34" viewBox="0 0 24 24">
                <path d="M3 11.5 L21 3 L14 21 L11.5 13.5 Z" fill="#fff" />
              </svg>
            </div>
          </div>
        </Card>
      </Pop>
      <Stamp t={t} at={cta} text="COMMENT" color={C.ink} rot={-9} style={{left: 120, top: 1205}} fill size={50} />
      {t > sent && (
        <Pop t={t} at={sent} style={abs(560, 1215)} rot={6}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '12px 24px 12px 12px', boxShadow: '0 16px 34px rgba(40,30,20,0.16)', fontFamily: SANS, fontSize: 26, color: C.ink}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            <b>"WhatsApp"</b>
          </div>
        </Pop>
      )}
      {t > dm && (
        <Pop t={t} at={dm} style={abs(110, 1330)} dy={-60}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 30, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <div style={{width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 46, height: 46}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{color: '#fff', fontSize: 26}}>
                <b>neuraxine</b> <span style={{opacity: 0.6}}>sent you a message · now</span>
              </div>
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi WhatsApp automation ki saari details</div>
            </div>
            <div style={{background: C.green, color: '#fff', borderRadius: 20, padding: '8px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: '0.1em'}}>DM</div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 8 · end card ===============================================================
export const S8: React.FC<{t: number; at: number}> = ({t, at}) => {
  const click = at + 1.3;
  const followed = t > click;
  return (
    <div style={abs(0, 0, {width: 1080, height: 1920, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'})}>
      <Pop t={t} at={at + 0.1} from={0.4} rot={-20}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 220, height: 165, objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
      </Pop>
      <Pop t={t} at={at + 0.3} style={{marginTop: 20}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1}}>
          Neura<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em'}}>xine</span>
        </div>
      </Pop>
      <Pop t={t} at={at + 0.5} style={{marginTop: 18}}>
        <Mono size={24} color="#A8A29A" style={{letterSpacing: '0.3em'}}>
          AI <span style={{color: C.green}}>|</span> Automation <span style={{color: C.green}}>|</span> Growth
        </Mono>
      </Pop>
      <Pop t={t} at={at + 0.7} style={{marginTop: 50, position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: followed ? C.green : '#fff', color: followed ? '#fff' : C.ink, borderRadius: 50, padding: '18px 36px', fontFamily: SANS, fontWeight: 700, fontSize: 34, transform: `scale(${followed ? lerp(0.9, 1, sp(t, click)) : 1})`}}>
          {followed ? 'Following ✓' : 'Follow +'} <span style={{fontWeight: 500, opacity: 0.8}}>@neuraxine</span>
        </div>
        {t > click - 0.5 && (
          <div style={{position: 'absolute', left: 120, top: 30, width: 60, height: 60, borderRadius: 30, border: '4px solid #fff', transform: `scale(${t > click ? lerp(0.5, 2.2, ep(t, click, 0.6)) : lerp(1.4, 0.6, ep(t, click - 0.5, 0.5))})`, opacity: t > click ? 1 - ep(t, click, 0.6) : 0.9}} />
        )}
      </Pop>
    </div>
  );
};
