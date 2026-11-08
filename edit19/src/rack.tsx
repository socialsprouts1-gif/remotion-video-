import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, W, WaHeader, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7, 8];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'cream'];
// garment that hangs on the top rail once each strategy is done
export const RAIL = ['t-shirt', 'dress', 'sari', 'coat', 'kimono'];
type P = {t: number; th: Tok};
const STORE = 'Kalaa Boutique';

/** small hanging price tag with the strategy number */
const NumTag: React.FC<{t: number; at: number; n: string; dark?: boolean}> = ({t, at, n, dark}) => {
  const s = sp(t, at);
  const swing = t > at ? 10 * Math.exp(-(t - at) * 2.5) * Math.sin((t - at) * 7) : 0;
  return (
    <div style={{position: 'absolute', left: 470, top: 300, width: 140, transformOrigin: '70px 0px', transform: `rotate(${swing}deg) scale(${lerp(0.6, 1, s)})`, opacity: ep(t, at, 0.2)}}>
      <div style={{position: 'absolute', left: 69, top: -60, width: 2, height: 60, background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'}} />
      <div style={{width: 140, height: 150, background: dark ? '#F4EFE6' : C.ink, clipPath: 'polygon(25% 0, 75% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 22}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: dark ? '#2A2724' : '#F4EFE6', position: 'absolute', top: 14}} />
        <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 60, color: dark ? C.ink : '#fff', lineHeight: 1}}>{n}</div>
      </div>
    </div>
  );
};
const Chip: React.FC<{img: string; txt: string; good?: boolean; light?: boolean}> = ({img, txt, good, light}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, background: good ? C.green : light ? '#fff' : C.ink, color: good || !light ? '#fff' : C.ink, borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 26, boxShadow: '0 12px 24px rgba(0,0,0,0.18)'}}>
    <Img src={fl(img)} style={{width: 38, height: 38}} /> {txt}
  </div>
);

// ===== 0 · hook: season full, rest of the year empty (dark) ===========================
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const BUSY = [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1];
export const R0: React.FC<P> = ({t, th}) => {
  const emptyAt = W(0, 7);
  const kapdeAt = W(1, 0);
  const mktAt = W(1, 6);
  const fiveAt = W(1, 13);
  const swipe = eio(t, W(0, 6), 1.2);
  const leave = ep(t, kapdeAt - 0.2, 0.5);
  const leave2 = ep(t, fiveAt - 0.2, 0.5);
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Shaadi season: full.']], [['Baaki saal: khaali?', true]]]} />
      {leave < 1 && (
        <div style={abs(110, 700, {width: 860, opacity: 1 - leave, transform: `translateY(${-leave * 60}px)`})}>
          <div style={{background: '#22201D', borderRadius: 32, padding: '26px 28px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Img src={fl('department_store')} style={{width: 50, height: 50}} />
              <Label color="#9A948C" size={18}>Aapki dukaan · footfall</Label>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 360, marginTop: 20}}>
              {MONTHS.map((m, i) => {
                const h = (BUSY[i] ? 300 : 60 + rnd(i) * 30) * ep(t, 0.1 + i * 0.05, 0.6);
                const lit = !BUSY[i] && t > emptyAt && swipe * 12 > i;
                return (
                  <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                    <div style={{width: '100%', height: h, borderRadius: 10, background: BUSY[i] ? C.green : lit ? C.red : 'rgba(255,255,255,0.18)'}} />
                    <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: lit ? C.red : '#9A948C'}}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {t > emptyAt && (
            <div style={{position: 'absolute', left: lerp(80, 760, swipe), top: 330, opacity: 1 - ep(t, W(0, 9) + 0.6, 0.3)}}>
              <Img src={fl('index_pointing_up')} style={{width: 100, height: 100, transform: 'rotate(-80deg)', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.5))'}} />
            </div>
          )}
          {t > W(0, 9) && (
            <div style={{position: 'absolute', left: 280, top: 150, transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, W(0, 9), 1.3))})`, opacity: ep(t, W(0, 9), 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '8px 28px', fontFamily: MONO, fontWeight: 800, fontSize: 52, letterSpacing: '0.12em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>KHAALI</div>
          )}
        </div>
      )}
      {t > kapdeAt - 0.2 && leave2 < 1 && (
        <div style={abs(110, 700, {width: 860, opacity: 1 - leave2})}>
          <div style={{position: 'relative', height: 360}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 10, borderRadius: 5, background: 'linear-gradient(90deg,#9a9a9a,#e8e8e8,#9a9a9a)', transform: `scaleX(${ep(t, kapdeAt - 0.2, 0.5)})`}} />
            {['sari', 'dress', 'kimono', 'coat', 'womans_clothes', 't-shirt'].map((n, i) => {
              const at = kapdeAt + i * 0.1;
              const sw = t > at ? 14 * Math.exp(-(t - at) * 2.5) * Math.sin((t - at) * 7) : 0;
              return t > at ? (
                <div key={i} style={{position: 'absolute', left: 30 + i * 140, top: 0, width: 120, transformOrigin: '60px 34px', transform: `rotate(${sw}deg)`}}>
                  <Img src={staticFile('cloth3d/hanger.png')} style={{width: 120, height: 120, marginTop: -6}} />
                  <Img src={fl(n)} style={{width: 120, height: 120, marginTop: -54}} />
                </div>
              ) : null;
            })}
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 30, justifyContent: 'center'}}>
            {t > kapdeAt + 0.5 && (
              <Pop t={t} at={kapdeAt + 0.5}>
                <Chip img="check_mark_button" txt="Kapde theek hain" good />
              </Pop>
            )}
            {t > mktAt && (
              <Pop t={t} at={mktAt}>
                <Chip img="cross_mark" txt="Marketing nahi" light />
              </Pop>
            )}
          </div>
        </div>
      )}
      {t > fiveAt - 0.1 &&
        [0, 1, 2, 3, 4].map((k) => {
          const at = fiveAt - 0.1 + k * 0.1;
          const sw = t > at ? 16 * Math.exp(-(t - at) * 2.2) * Math.sin((t - at) * 6 + k) : 0;
          return (
            <div key={k} style={abs(130 + k * 170, 760, {transformOrigin: '70px -60px', transform: `rotate(${sw}deg) translateY(${(1 - Math.min(1, sp(t, at))) * -200}px)`, opacity: ep(t, at, 0.2)})}>
              <div style={{position: 'absolute', left: 69, top: -60, width: 2, height: 60, background: 'rgba(255,255,255,0.5)'}} />
              <div style={{width: 140, height: 190, background: '#F4EFE6', clipPath: 'polygon(25% 0, 75% 0, 100% 20%, 100% 100%, 0 100%, 0 20%)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 20}}>
                <div style={{width: 18, height: 18, borderRadius: 9, background: '#2A2724', position: 'absolute', top: 14}} />
                <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.ink}}>0{k + 1}</div>
                <Label color={C.green} size={14}>Strategy</Label>
              </div>
            </div>
          );
        })}
    </>
  );
};

// ===== 1 · collect WhatsApp numbers at billing (cream) ================================
export const R1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const numAt = W(2, 7);
  const typed = '+91 98450 •••••'.slice(0, Math.floor(clamp01((t - numAt) / 0.7) * 15));
  const saveAt = W(2, 9) + 0.2;
  const cheapAt = W(2, 13);
  const print = ep(t, L + 0.3, 1.2);
  return (
    <>
      <NumTag t={t} at={L - 0.15} n="01" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Billing pe ']], [['WhatsApp number lo.', true]]]} />
      <div style={abs(110, 700, {width: 420, height: 520, overflow: 'hidden'})}>
        <div style={{width: 420, height: 60 + 460 * print, background: '#FBF8F1', borderRadius: '0 0 16px 16px', boxShadow: '0 20px 40px rgba(40,30,20,0.16)', padding: '20px 24px', fontFamily: MONO, color: C.ink, overflow: 'hidden', backgroundImage: 'radial-gradient(circle at 10px -4px, transparent 8px, #FBF8F1 9px)'}}>
          <div style={{fontWeight: 800, fontSize: 24, textAlign: 'center'}}>{STORE.toUpperCase()}</div>
          <div style={{borderTop: '2px dashed #ccc', margin: '12px 0'}} />
          {[
            ['Chikan kurta', '₹1,499'],
            ['Dupatta', '₹499'],
          ].map(([a, b], i) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, margin: '6px 0'}}>
              <span>{a}</span>
              <span>{b}</span>
            </div>
          ))}
          <div style={{borderTop: '2px dashed #ccc', margin: '12px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 800}}>
            <span>TOTAL</span>
            <span>₹1,998</span>
          </div>
          <div style={{marginTop: 22, fontSize: 18, color: '#777'}}>WHATSAPP NO.</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, borderBottom: `3px solid ${t > numAt ? C.green : '#ccc'}`, padding: '6px 0', fontSize: 26, fontWeight: 800, minHeight: 34}}>
            {t > numAt && <Img src={icon('whatsapp-icon.svg')} style={{width: 30, height: 30}} />}
            {typed}
          </div>
        </div>
      </div>
      <div style={abs(570, 720, {width: 400, display: 'flex', flexDirection: 'column', gap: 12})}>
        <Label color={th.sub} size={17} style={{opacity: ep(t, saveAt, 0.3)}}>Customer list</Label>
        {['Priya · Kurta', 'Neha · Saree', 'Aman · Sherwani', 'Riya · Lehenga'].map((x, i) => {
          const at = saveAt + i * 0.2;
          return t > at ? (
            <Pop key={i} t={t} at={at} dy={20} from={0.9}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 16px rgba(40,30,20,0.08)', fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.ink}}>
                <div style={{width: 44, height: 44, borderRadius: 22, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Img src={fl(i % 2 ? 'man' : 'woman')} style={{width: 32, height: 32}} />
                </div>
                {x}
                <Img src={icon('whatsapp-icon.svg')} style={{width: 26, height: 26, marginLeft: 'auto'}} />
              </div>
            </Pop>
          ) : null;
        })}
      </div>
      {t > cheapAt && (
        <Pop t={t} at={cheapAt} style={abs(570, 1250)}>
          <Chip img="coin" txt="Sabse sasta channel" good />
        </Pop>
      )}
    </>
  );
};

// ===== 2 · new stock goes to old customers first (green) ===============================
export const R2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const sendAt = W(3, 9);
  const repAt = W(3, 12);
  const igAt = W(3, 13);
  const ph = sp(t, L + 0.2, 0.9);
  return (
    <>
      <NumTag t={t} at={L - 0.15} n="02" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Naya stock: ']], [['pehle purane customers.', true]]]} />
      <div style={abs(230, 690, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, L + 0.2, 0.3)})}>
        <Phone w={620} h={640}>
          <WaHeader name={STORE} sub="Broadcast · VIP customers" />
          <div style={{padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10}}>
            {t > sendAt && (
              <Pop t={t} at={sendAt} from={0.85} dy={30}>
                <div style={{marginLeft: 'auto', width: 470, background: '#D9FDD3', borderRadius: 22, borderTopRightRadius: 6, padding: 10, fontFamily: SANS}}>
                  <div style={{display: 'flex', gap: 6}}>
                    {['sari', 'dress', 'kimono'].map((n, i) => (
                      <div key={i} style={{flex: 1, height: 130, borderRadius: 12, background: ['#F6EDE1', '#E7EDF5', '#F2E3F5'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(t, sendAt + i * 0.12)})`}}>
                        <Img src={fl(n)} style={{width: 90, height: 90}} />
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize: 21, color: '#111', margin: '10px 4px 2px'}}>New arrivals! Aap sabse pehle dekh rahe ho.</div>
                </div>
              </Pop>
            )}
            {t > repAt &&
              ['Blue wali hold kar do!', 'Size M hai?'].map((r, i) => (
                <Pop key={i} t={t} at={repAt + i * 0.3} from={0.85} dy={20}>
                  <Bubble time="11:0{i + 2} AM">{r}</Bubble>
                </Pop>
              ))}
          </div>
        </Phone>
      </div>
      {t > igAt && (
        <Pop t={t} at={igAt} style={abs(40, 1180)} rot={-8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 24, padding: '10px 20px 10px 10px', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#8C8780', boxShadow: '0 12px 24px rgba(0,0,0,0.2)'}}>
            <Img src={icon('instagram-icon.svg')} style={{width: 40, height: 40, filter: 'grayscale(0.6)'}} /> Instagram · baad mein
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · try-on reels, not flat-lays (cream) ======================================
export const R3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const xAt = W(4, 5);
  const tryAt = W(4, 6);
  const tags = [
    {at: W(4, 8), txt: 'Real customers'},
    {at: W(4, 10), txt: 'Real fitting'},
    {at: W(4, 12), txt: 'Mirror selfie'},
  ];
  return (
    <>
      <NumTag t={t} at={L - 0.15} n="03" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Kapde nahi, ']], [['try-on dikhao.', true]]]} />
      <div style={abs(80, 700, {display: 'flex', gap: 30})}>
        <Pop t={t} at={L + 0.2} dy={40}>
          <div style={{position: 'relative', width: 340, height: 540, borderRadius: 30, background: '#E9E5DD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(40,30,20,0.14)', filter: t > xAt ? 'grayscale(1)' : 'none', opacity: t > xAt ? 0.75 : 1}}>
            <Img src={staticFile('cloth3d/hanger.png')} style={{width: 200, height: 200, marginBottom: -110}} />
            <Img src={fl('dress')} style={{width: 200, height: 200}} />
            <Label color="#8C8780" size={18} style={{marginTop: 16}}>Sirf kapde</Label>
            {t > xAt && (
              <svg width="340" height="540" style={{position: 'absolute', inset: 0}}>
                <path d="M40 60 L300 480 M300 60 L40 480" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="500" strokeDashoffset={500 * (1 - ep(t, xAt, 0.3))} />
              </svg>
            )}
          </div>
        </Pop>
        {t > tryAt && (
          <Pop t={t} at={tryAt} dy={40}>
            <div style={{position: 'relative', width: 420, height: 540, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(180deg,#F6EDE1,#EBDCCB)', boxShadow: '0 24px 50px rgba(40,30,20,0.2)'}}>
              <div style={{position: 'absolute', left: 16, right: 16, top: 16, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.15)'}}>
                <div style={{width: `${ep(t, tryAt, 4) * 100}%`, height: '100%', borderRadius: 3, background: '#111'}} />
              </div>
              <Img src={fl('mirror')} style={{position: 'absolute', left: 60, top: 60, width: 300, height: 300}} />
              <Img src={fl('woman')} style={{position: 'absolute', left: 150, top: 120, width: 130, height: 130, transform: `rotate(${Math.sin(t * 2) * 4}deg)`}} />
              <Img src={fl('sari')} style={{position: 'absolute', left: 145, top: 220, width: 140, height: 140}} />
              {t > tags[2].at && <Img src={fl('selfie')} style={{position: 'absolute', right: 20, top: 40, width: 90, height: 90, transform: `scale(${sp(t, tags[2].at)})`}} />}
              <div style={{position: 'absolute', left: 16, bottom: 18, display: 'flex', flexDirection: 'column', gap: 8}}>
                {tags.map((g, i) =>
                  t > g.at ? (
                    <div key={i} style={{background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 12, padding: '6px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 22, transform: `translateX(${(1 - ep(t, g.at, 0.4)) * -40}px)`, opacity: ep(t, g.at, 0.3), width: 'fit-content'}}>✓ {g.txt}</div>
                  ) : null,
                )}
              </div>
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 4 · Google profile for "saree shop near me" (dark) =============================
export const R4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const q = 'saree shop near me';
  const tyA = W(5, 3);
  const typed = q.slice(0, Math.floor(clamp01((t - tyA) / 1.0) * q.length));
  const resAt = W(5, 8);
  const phAt = W(5, 14);
  const rvAt = W(5, 16);
  return (
    <>
      <NumTag t={t} at={L - 0.15} n="04" dark />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Google pe ']], [['"near me" jeeto.', true]]]} />
      <Pop t={t} at={L + 0.2} style={abs(110, 700)} dy={50}>
        <div style={{width: 860, background: '#fff', borderRadius: 30, padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#F1F3F4', borderRadius: 30, padding: '12px 18px'}}>
            <Img src={fl('magnifying_glass_tilted_left')} style={{width: 34, height: 34}} />
            <span style={{fontSize: 28, color: '#111'}}>
              {typed}
              {t > tyA && t < resAt && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </span>
          </div>
          {t > resAt && (
            <div style={{marginTop: 16, opacity: ep(t, resAt, 0.3)}}>
              <div style={{display: 'flex', gap: 8}}>
                {['sari', 'womans_clothes', 'dress'].map((n, i) => (
                  <div key={i} style={{flex: 1, height: 160, borderRadius: 14, background: ['#F6EDE1', '#F5DEDE', '#E7EDF5'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: t > phAt ? 1 : 0.3, filter: t > phAt ? 'none' : 'grayscale(1)'}}>
                    <Img src={fl(n)} style={{width: 100, height: 100, transform: `scale(${t > phAt ? sp(t, phAt + i * 0.1) : 1})`}} />
                  </div>
                ))}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
                <Img src={fl('department_store')} style={{width: 56, height: 56}} />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 800, fontSize: 28, color: '#1A0DAB'}}>{STORE}</div>
                  <div style={{fontSize: 21, color: '#555'}}>
                    {t > rvAt ? <span style={{color: '#E8A400'}}>★ 4.7 (230)</span> : <span style={{color: '#aaa'}}>No reviews</span>} · Clothing store · 900 m
                  </div>
                </div>
                <Img src={fl('round_pushpin')} style={{width: 50, height: 50}} />
              </div>
            </div>
          )}
        </div>
      </Pop>
      <div style={abs(110, 1250, {display: 'flex', gap: 14})}>
        {t > phAt && (
          <Pop t={t} at={phAt}>
            <Chip img="camera_with_flash" txt="Photos ✓" light />
          </Pop>
        )}
        {t > rvAt && (
          <Pop t={t} at={rvAt}>
            <Chip img="star" txt="Reviews ✓" good />
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 5 · birthday / anniversary offers (cream) ======================================
export const R5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const bdAt = W(6, 1);
  const anAt = W(6, 3);
  const msgAt = W(6, 7);
  const repAt = W(6, 13);
  return (
    <>
      <NumTag t={t} at={L - 0.15} n="05" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Birthday pe ']], [['chhota sa offer.', true]]]} />
      <div style={abs(110, 690, {display: 'flex', gap: 18})}>
        {[
          {at: bdAt, img: 'birthday_cake', d: '14 Mar', l: 'Priya ka birthday'},
          {at: anAt, img: 'ring', d: '2 Dec', l: 'Anniversary'},
        ].map((c, i) =>
          t > c.at ? (
            <Pop key={i} t={t} at={c.at} dy={30}>
              <TCard th={th} style={{width: 421, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16}}>
                <Img src={fl(c.img)} style={{width: 76, height: 76}} />
                <div style={{fontFamily: SANS}}>
                  <div style={{fontWeight: 800, fontSize: 30}}>{c.d}</div>
                  <div style={{fontSize: 21, color: th.cardSub}}>{c.l}</div>
                </div>
              </TCard>
            </Pop>
          ) : null,
        )}
      </div>
      {t > msgAt && (
        <Pop t={t} at={msgAt} style={abs(250, 880)} dy={30} from={0.85}>
          <div style={{width: 720}}>
            <Bubble me time="14 Mar · 9:00 AM" tag="Auto · birthday">
              Happy Birthday Priya! Is hafte aapke liye 15% off. Kab aa rahi ho?
            </Bubble>
          </div>
        </Pop>
      )}
      {t > repAt && (
        <Pop t={t} at={repAt} style={abs(110, 1100)} dy={30} from={0.85}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 22, padding: '12px 20px', fontFamily: SANS, fontSize: 25, color: '#111', boxShadow: '0 10px 20px rgba(40,30,20,0.12)'}}>
            Aww, aapne yaad rakha! Kal aati hoon <Img src={fl('red_heart')} style={{width: 34, height: 34}} />
          </div>
        </Pop>
      )}
      {t > repAt + 0.3 && (
        <Pop t={t} at={repAt + 0.3} style={abs(820, 1150)} rot={12}>
          <Icon3D n="wrapped_gift" size={130} t={t} seed={5} />
        </Pop>
      )}
    </>
  );
};

// ===== 6 · twist: old customer back < new customer cost (green) =========================
export const R6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const newAt = W(7, 3);
  const oldAt = W(7, 9);
  const Tag: React.FC<{at: number; title: string; img: string; cost: number; good?: boolean; sub: string}> = ({at, title, img, cost, good, sub}) => {
    const sw = t > at ? 12 * Math.exp(-(t - at) * 2.4) * Math.sin((t - at) * 7) : 0;
    return t > at ? (
      <div style={{position: 'relative', width: 380, transformOrigin: '190px -70px', transform: `rotate(${sw}deg)`, opacity: ep(t, at, 0.2)}}>
        <div style={{position: 'absolute', left: 189, top: -70, width: 2, height: 70, background: 'rgba(255,255,255,0.7)'}} />
        <div style={{width: 380, height: 470, background: good ? '#fff' : 'rgba(255,255,255,0.18)', clipPath: 'polygon(25% 0, 75% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 40, fontFamily: SANS, color: good ? C.ink : '#fff'}}>
          <div style={{width: 24, height: 24, borderRadius: 12, background: C.greenBg, position: 'absolute', top: 22}} />
          <Img src={fl(img)} style={{width: 110, height: 110}} />
          <div style={{fontWeight: 800, fontSize: 34}}>{title}</div>
          <div style={{display: 'flex', gap: 4}}>
            {Array.from({length: cost}).map((_, k) => (
              <Img key={k} src={fl(good ? 'coin' : 'money_with_wings')} style={{width: 46, height: 46, transform: `scale(${sp(t, at + 0.3 + k * 0.1)})`}} />
            ))}
          </div>
          <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: '0.1em', color: good ? C.green : '#FFD7D8'}}>{sub}</div>
        </div>
      </div>
    ) : null;
  };
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Sach bataun?']], [['Purana customer = sasta.', true]]]} />
      <div style={abs(110, 760, {width: 860, display: 'flex', justifyContent: 'space-between'})}>
        <Tag at={newAt} title="Naya customer" img="bust_in_silhouette" cost={4} sub="ADS · MEHENGA" />
        <Tag at={oldAt} title="Purana wapas" img="woman" cost={1} sub="WHATSAPP · SASTA" good />
      </div>
    </>
  );
};

// ===== 7 · done-for-you CTA: comment DETAILS -> guide in DM -> follow (cream) ========
const LIST = ['WhatsApp numbers', 'New stock pehle', 'Try-on reels', 'Google profile', 'Birthday offers'];
export const R7: React.FC<P> = ({t, th}) => {
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
                <span style={{color: '#fff', fontSize: 21, fontWeight: 700}}>Clothing Store Marketing Guide.pdf</span>
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


export const SCENES = [R0, R1, R2, R3, R4, R5, R6, R7];
