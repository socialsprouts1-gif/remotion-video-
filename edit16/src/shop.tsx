import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, W, WaHeader, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const THEMES: Theme[] = ['dark', 'cream', 'dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'cream'];
type P = {t: number; th: Tok};
const BRAND = 'Kalaa Ethnics';

const s3 = (n: string) => staticFile(`shop3d/${n}.png`);
const Prop: React.FC<{n: string; size: number; t: number; seed?: number; at?: number; style?: React.CSSProperties}> = ({n, size, t, seed = 0, at, style}) => {
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : sp(t, at);
  return (
    <div style={{position: 'absolute', width: size, height: size, ...style, transform: `scale(${lerp(0.3, 1, s)}) rotate(${(1 - Math.min(1, s)) * 25}deg)`, opacity: at === undefined ? 1 : ep(t, at, 0.2)}}>
      <div style={{position: 'absolute', left: size * 0.22, right: size * 0.22, bottom: size * 0.07, height: size * 0.08, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', filter: `blur(${size * 0.04}px)`}} />
      <Img src={s3(n)} style={{width: size, height: size, transform: `translateY(${Math.sin(t * 1.3 + seed) * size * 0.03}px) rotate(${Math.sin(t * 0.8 + seed) * 3}deg)`}} />
    </div>
  );
};
const Product: React.FC<{w?: number; price?: string; old?: string}> = ({w = 300, price = '₹1,299', old}) => (
  <div style={{width: w, fontFamily: SANS}}>
    <div style={{height: w * 1.05, borderRadius: 20, background: 'linear-gradient(160deg,#F6EDE1,#EBDCCB)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={fl('sari')} style={{width: w * 0.62, height: w * 0.62}} />
    </div>
    <div style={{fontWeight: 700, fontSize: w * 0.085, color: '#111', marginTop: 10}}>Chikankari Kurta</div>
    <div style={{fontSize: w * 0.08, color: '#111', fontWeight: 800}}>
      {price} {old && <span style={{color: '#999', fontWeight: 400, textDecoration: 'line-through', fontSize: w * 0.065}}>{old}</span>}
    </div>
  </div>
);

// ===== 0 · interactive add-to-cart + abandon, then views != orders (dark) ===========
const LAND = 0.8;
const REELS = ['sari', 't-shirt', 'handbag', 'high-heeled_shoe', 'ring', 'lipstick'];
export const S0: React.FC<P> = ({t, th}) => {
  const cardAt = W(0, 3) - 0.1;
  const tapAt = W(0, 6);
  const closeAt = W(0, 10);
  const leave = ep(t, W(0, 12) - 0.2, 0.6);
  const igAt = W(0, 14);
  const no = W(0, 19);
  const fall = clamp01(t / LAND);
  const dy = t < LAND ? lerp(-760, 0, fall * fall) : -Math.abs(Math.sin((t - LAND) * 9)) * 50 * Math.exp(-(t - LAND) * 5);
  const spin = Math.floor(t < LAND ? t * 55 : LAND * 55 + (t - LAND) * 10) % 48;
  const shake = t > LAND ? Math.sin((t - LAND) * 70) * 12 * Math.exp(-(t - LAND) * 9) : 0;
  const badge = t > tapAt + 0.25 ? 1 : 0;
  const closing = ep(t, closeAt, 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Headline t={t} at={0.1} th={th} a={[[['If we managed your ']], [['brand', true]]]} />
      {leave < 1 && (
        <div style={abs(700, 630, {width: 320, height: 320, opacity: 1 - leave, transform: `translateY(${-leave * 200}px) scale(${1 - leave * 0.3})`})}>
          <div style={{position: 'absolute', left: 70, right: 70, bottom: 40, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(12px)', transform: `scaleX(${lerp(0.3, 1, fall)})`}} />
          <Img src={staticFile(`shop3d/bag_spin/${String(spin).padStart(2, '0')}.png`)} style={{position: 'absolute', left: 0, top: -20, width: 320, height: 320, transform: `translateY(${dy}px)`}} />
          {/* cart badge rides on the bag */}
          {badge > 0 && <div style={{position: 'absolute', right: 30, top: 10, width: 64, height: 64, borderRadius: 32, background: C.red, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(t, tapAt + 0.25, 1.4)})`, boxShadow: '0 8px 20px rgba(229,72,77,0.5)'}}>1</div>}
        </div>
      )}
      {t > cardAt && leave < 1 && (
        <div style={abs(110, 690, {opacity: 1 - leave, transform: `translateX(${-leave * 320}px) rotate(${-2 - leave * 10}deg)`})}>
          <Pop t={t} at={cardAt} from={0.5} rot={-10}>
            <div style={{position: 'relative', width: 560, background: '#fff', borderRadius: 30, padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `scale(${1 - closing * 0.12}) translateY(${closing * 40}px)`, filter: `grayscale(${closing})`, opacity: 1 - closing * 0.35}}>
              <Product w={516} />
              <div style={{marginTop: 16, height: 76, borderRadius: 20, background: t > tapAt ? C.green : C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 30, transform: `scale(${t > tapAt - 0.06 && t < tapAt + 0.14 ? 0.95 : 1})`}}>
                <Img src={fl('shopping_cart')} style={{width: 44, height: 44}} /> {t > tapAt ? 'Added to cart ✓' : 'Add to cart'}
              </div>
              {t > closeAt + 0.2 && (
                <div style={{position: 'absolute', left: 60, top: 230, transform: `rotate(-10deg) scale(${lerp(2, 1, sp(t, closeAt + 0.2, 1.3))})`, opacity: ep(t, closeAt + 0.2, 0.12), background: '#2A2724', color: '#fff', borderRadius: 16, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: '0.06em', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
                  <Img src={fl('ghost')} style={{width: 44, height: 44}} /> CART ABANDONED
                </div>
              )}
            </div>
            {t > cardAt + 0.4 && t < tapAt + 0.6 && (
              <div style={{position: 'absolute', left: lerp(560, 300, eio(t, cardAt + 0.5, tapAt - cardAt - 0.6)), top: lerp(900, 660, eio(t, cardAt + 0.5, tapAt - cardAt - 0.6)), opacity: 1 - ep(t, tapAt + 0.3, 0.3)}}>
                {t > tapAt && <div style={{position: 'absolute', left: -6, top: -26, width: 70, height: 70, borderRadius: 35, border: `5px solid ${C.wa}`, transform: `scale(${lerp(0.3, 2, ep(t, tapAt, 0.5))})`, opacity: 1 - ep(t, tapAt, 0.5)}} />}
                <Img src={fl('index_pointing_up')} style={{width: 120, height: 120, transform: `rotate(-14deg) scale(${t > tapAt - 0.08 && t < tapAt + 0.12 ? 0.85 : 1})`, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.45))'}} />
              </div>
            )}
          </Pop>
        </div>
      )}
      <div style={abs(300, 720, {transform: `translateY(${(1 - sp(t, igAt - 0.4, 0.9)) * 300}px)`, opacity: ep(t, igAt - 0.4, 0.3)})}>
        <Phone w={480} h={640} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '68px 20px 12px', borderBottom: '1px solid #eee'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 32, height: 32}} />
              <b style={{fontSize: 24, color: '#111'}}>kalaa.ethnics</b>
              <span style={{marginLeft: 'auto', fontSize: 17, color: '#888'}}>Reels</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3}}>
              {REELS.map((n, i) => {
                const at = igAt + 0.2 + i * 0.18;
                const views = Math.round(lerp(0, 5 + rnd(i) * 40, ep(t, at, 2.5)) * 10) / 10;
                return (
                  <div key={i} style={{height: 230, background: ['#F6EDE1', '#E7EDF5', '#EEF4F1', '#F5DEDE', '#F3EEDD', '#F2E3F5'][i], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ep(t, at, 0.3) * (t > no ? 0.35 : 1), transform: `scale(${lerp(0.7, 1, sp(t, at))})`}}>
                    <Img src={fl(n)} style={{width: 104, height: 104}} />
                    <div style={{position: 'absolute', left: 8, bottom: 8, fontWeight: 700, fontSize: 16, color: '#111'}}>▶ {views}K</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Phone>
      </div>
      {t > no && (
        <div style={abs(250, 1000, {transform: `rotate(-8deg) scale(${lerp(2.2, 1, sp(t, no, 1.3))})`, opacity: ep(t, no, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '10px 26px', fontFamily: MONO, fontWeight: 800, fontSize: 48, letterSpacing: '0.08em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'})}>
          VIEWS ≠ ORDERS
        </div>
      )}
    </div>
  );
};

// ===== 1 · every cart becomes an order (cream) =================================
export const S1: React.FC<P> = ({t, th}) => {
  const L = W(1, 0) - 0.2;
  const conv = W(1, 4);
  return (
    <>
      <Headline t={t} at={L} th={th} a={[[['Har cart, ']], [['order tak.', true]]]} />
      {[0, 1, 2].map((i) => {
        const y = 720 + i * 200;
        const at = L + 0.3 + i * 0.15;
        const ca = conv + i * 0.25;
        const p = eio(t, ca, 0.7);
        return t > at ? (
          <div key={i} style={abs(110, y, {width: 860, height: 170})}>
            <Pop t={t} at={at} dy={30}>
              <div style={{position: 'relative', width: 860, height: 170, background: '#fff', borderRadius: 28, boxShadow: '0 18px 36px rgba(40,30,20,0.12)', overflow: 'hidden'}}>
                <Img src={fl('shopping_cart')} style={{position: 'absolute', left: lerp(40, 640, p), top: 25, width: 120, height: 120, opacity: 1 - ep(t, ca + 0.55, 0.2)}} />
                <div style={{position: 'absolute', left: 190, right: 220, top: 82, height: 6, borderRadius: 3, background: '#EEEAE3'}}>
                  <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, background: C.green}} />
                </div>
                {t > ca + 0.55 && <Img src={s3('parcel')} style={{position: 'absolute', left: 640, top: -6, width: 180, height: 180, transform: `scale(${sp(t, ca + 0.55)})`}} />}
                {t > ca + 0.7 && <div style={{position: 'absolute', left: 30, top: 60, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.green, opacity: ep(t, ca + 0.7, 0.3)}}>✓ Order #{1042 + i}</div>}
              </div>
            </Pop>
          </div>
        ) : null;
      })}
    </>
  );
};

// ===== 2 · 1 AM: added to cart, app closed (dark) ====================================
export const S2: React.FC<P> = ({t, th}) => {
  const siteAt = W(2, 5);
  const cartAt = W(2, 9);
  const closeAt = W(2, 16);
  const ph = sp(t, siteAt - 0.3, 0.9);
  const shut = ep(t, closeAt, 0.5);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} th={th} a={[[['Raat 1 baje. ']], [['Cart mein kurta.', true]]]} />
      <Pop t={t} at={W(2, 3)} style={abs(50, 720)} rot={-8}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#2A2724', borderRadius: 40, padding: '10px 22px 10px 10px', boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
          <div style={{width: 70, height: 70, borderRadius: 35, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('woman')} style={{width: 54, height: 54}} />
          </div>
          <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff'}}>Riya</span>
        </div>
      </Pop>
      <Pop t={t} at={W(2, 0)} style={abs(870, 680)} rot={-10}>
        <Icon3D n="crescent_moon" size={130} t={t} seed={2} />
      </Pop>
      <div style={abs(300, 700, {transform: `translateY(${(1 - ph) * 300 + shut * 120}px) scale(${1 - shut * 0.5})`, opacity: ep(t, siteAt - 0.3, 0.3) * (1 - shut * 0.9), transformOrigin: '50% 100%'})}>
        <Phone w={480} h={620} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '66px 22px 12px', borderBottom: '1px solid #eee'}}>
              <b style={{fontSize: 24, color: '#111'}}>{BRAND}</b>
              <div style={{position: 'relative'}}>
                <Img src={fl('shopping_cart')} style={{width: 40, height: 40}} />
                {t > cartAt && <div style={{position: 'absolute', right: -8, top: -8, width: 26, height: 26, borderRadius: 13, background: C.red, color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(t, cartAt, 1.4)})`}}>1</div>}
              </div>
            </div>
            <div style={{padding: '18px 22px'}}>
              <Product w={436} />
            </div>
          </div>
        </Phone>
      </div>
      {t > closeAt + 0.2 && (
        <Pop t={t} at={closeAt + 0.2} style={abs(170, 1060)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#2A2724', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 26, padding: '16px 24px', fontFamily: SANS, color: '#fff'}}>
            <Img src={fl('zzz')} style={{width: 56, height: 56}} />
            <div>
              <div style={{fontWeight: 800, fontSize: 30}}>Cart abandoned · 1:07 AM</div>
              <div style={{fontSize: 22, color: '#9A948C'}}>Chikankari Kurta · ₹1,299</div>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · 20 min later: WhatsApp nudge + 10% off (cream) ============================
export const S3: React.FC<P> = ({t, th}) => {
  const msgAt = W(3, 5);
  const offAt = W(3, 16);
  const ph = sp(t, W(3, 2), 0.9);
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} th={th} a={[[['20 min baad. ']], [['WhatsApp nudge.', true]]]} />
      <div style={abs(230, 690, {transform: `translateY(${(1 - ph) * 300}px)`, opacity: ep(t, W(3, 2), 0.3)})}>
        <Phone w={620} h={680}>
          <WaHeader name={BRAND} sub="Business account" />
          <div style={{padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 12}}>
            {t > msgAt && (
              <Pop t={t} at={msgAt} from={0.85} dy={30}>
                <div style={{alignSelf: 'flex-end', marginLeft: 'auto', width: 470, background: '#D9FDD3', borderRadius: 22, borderTopRightRadius: 6, padding: 12, fontFamily: SANS}}>
                  <div style={{display: 'flex', gap: 12, background: '#fff', borderRadius: 14, padding: 10}}>
                    <div style={{width: 110, height: 110, borderRadius: 10, background: 'linear-gradient(160deg,#F6EDE1,#EBDCCB)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Img src={fl('sari')} style={{width: 76, height: 76}} />
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 700, fontSize: 21, color: '#111'}}>Chikankari Kurta</div>
                      <div style={{fontSize: 21, color: '#111', fontWeight: 800, marginTop: 4}}>
                        {t > offAt ? '₹1,169' : '₹1,299'} {t > offAt && <span style={{color: '#999', fontWeight: 400, textDecoration: 'line-through', fontSize: 17}}>₹1,299</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize: 21, color: '#111', margin: '10px 4px 4px', lineHeight: 1.3}}>Riya, aapka kurta wait kar raha hai! Sirf aapke liye 10% off.</div>
                  <div style={{marginTop: 8, background: '#fff', borderRadius: 12, textAlign: 'center', padding: '10px 0', fontWeight: 700, fontSize: 21, color: C.waDeep}}>Complete order →</div>
                </div>
              </Pop>
            )}
          </div>
        </Phone>
      </div>
      {t > offAt && (
        <Pop t={t} at={offAt} style={abs(60, 1180)} rot={-8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 18, padding: '14px 24px', border: `3px dashed ${C.wa}`, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: '0.1em', boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>
            <Img src={fl('label')} style={{width: 44, height: 44}} /> RIYA10 · 10% OFF
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 4 · COD order -> WhatsApp confirm -> no fake / RTO (green) =====================
export const S4: React.FC<P> = ({t, th}) => {
  const ordAt = W(4, 5);
  const confAt = W(4, 10);
  const tap = W(4, 11) + 0.3;
  const shieldAt = W(4, 14);
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.2} th={th} a={[[['COD? ']], [['Pehle confirm.', true]]]} />
      <Pop t={t} at={ordAt - 0.1} style={abs(110, 690)} dy={40}>
        <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 26, padding: '16px 22px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', fontFamily: SANS, color: C.ink}}>
          <Img src={fl('receipt')} style={{width: 64, height: 64}} />
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 30}}>Order #1045 · ₹1,169</div>
            <div style={{fontSize: 22, color: '#8C8780'}}>Cash on delivery · Riya, Lucknow</div>
          </div>
          <div style={{background: t > tap ? C.green : C.gold, color: '#fff', borderRadius: 14, padding: '8px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 18}}>{t > tap ? 'CONFIRMED' : 'PENDING'}</div>
        </div>
      </Pop>
      {t > confAt - 0.3 && (
        <Pop t={t} at={confAt - 0.3} style={abs(110, 880)} dy={40} from={0.85}>
          <div style={{width: 860, background: '#D9FDD3', borderRadius: 24, borderTopRightRadius: 6, padding: '16px 18px', fontFamily: SANS, boxShadow: '0 16px 30px rgba(0,0,0,0.15)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 34, height: 34}} />
              <span style={{fontSize: 24, color: '#111'}}>Riya, apna COD order ₹1,169 confirm karein?</span>
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 14}}>
              {['Confirm ✓', 'Cancel'].map((b, i) => (
                <div key={i} style={{flex: 1, textAlign: 'center', background: i === 0 && t > tap ? C.green : '#fff', color: i === 0 && t > tap ? '#fff' : C.waDeep, borderRadius: 14, padding: '12px 0', fontWeight: 800, fontSize: 24, transform: `scale(${i === 0 && t > tap - 0.06 && t < tap + 0.14 ? 0.95 : 1})`}}>{b}</div>
              ))}
            </div>
          </div>
        </Pop>
      )}
      {t > tap - 0.5 && t < tap + 0.5 && (
        <Img src={fl('index_pointing_up')} style={{position: 'absolute', left: lerp(700, 300, eio(t, tap - 0.5, 0.45)), top: lerp(1250, 1050, eio(t, tap - 0.5, 0.45)), width: 110, height: 110, transform: 'rotate(-14deg)', opacity: 1 - ep(t, tap + 0.2, 0.3), filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))'}} />
      )}
      {t > shieldAt && (
        <Pop t={t} at={shieldAt} style={abs(110, 1110)} dy={40}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 26, padding: '16px 24px', fontFamily: SANS, color: '#fff'}}>
            <Img src={fl('shield')} style={{width: 64, height: 64}} />
            <div style={{flex: 1, fontSize: 26, fontWeight: 700}}>Fake orders & RTO</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 40, color: C.wa}}>
              <Img src={fl('chart_decreasing')} style={{width: 44, height: 44}} /> ↓
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · every update on WhatsApp (cream) ========================================
export const S5: React.FC<P> = ({t, th}) => {
  const steps = [
    {at: W(5, 5), img: 'package', txt: 'Packed', sub: 'Mon · 11:20 AM'},
    {at: W(5, 6), img: 'delivery_truck', txt: 'Shipped', sub: 'Tue · Delhivery'},
    {at: W(5, 7) + 0.1, img: 'motor_scooter', txt: 'Out for delivery', sub: 'Thu · 9:05 AM'},
    {at: W(5, 9) + 0.5, img: 'house', txt: 'Delivered', sub: 'Thu · 1:40 PM'},
  ];
  const done = steps.filter((s) => t > s.at).length;
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} th={th} a={[[['Har update, ']], [['WhatsApp pe.', true]]]} />
      <div style={abs(170, 720, {width: 8, height: lerp(0, 600, clamp01((done - 1) / 3 + (done ? 0 : 0))), background: C.green, borderRadius: 4})} />
      <div style={abs(170, 720, {width: 8, height: 600, background: 'rgba(0,0,0,0.08)', borderRadius: 4})} />
      {steps.map((s, i) => (
        <div key={i} style={abs(110, 690 + i * 200)}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 130, height: 130, borderRadius: 65, background: t > s.at ? '#fff' : '#EAE6DE', boxShadow: t > s.at ? '0 16px 30px rgba(40,30,20,0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > s.at ? lerp(0.8, 1, sp(t, s.at)) : 0.8})`}}>
            <Img src={fl(s.img)} style={{width: 84, height: 84, opacity: t > s.at ? 1 : 0.3, filter: t > s.at ? 'none' : 'grayscale(1)'}} />
          </div>
          {t > s.at && (
            <Pop t={t} at={s.at + 0.05} style={{position: 'absolute', left: 160, top: 18}} dy={10} from={0.9}>
              <div style={{width: 640, display: 'flex', alignItems: 'center', gap: 14, background: '#D9FDD3', borderRadius: 20, padding: '14px 20px', fontFamily: SANS, boxShadow: '0 2px 2px rgba(0,0,0,0.06)'}}>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 800, fontSize: 28, color: '#111'}}>{s.txt}</div>
                  <div style={{fontSize: 20, color: '#5E8C70'}}>{s.sub}</div>
                </div>
                <span style={{color: '#34B7F1', fontWeight: 800, fontSize: 22}}>✓✓</span>
              </div>
            </Pop>
          )}
        </div>
      ))}
      <Prop n="parcel" size={200} t={t} seed={5} at={W(5, 5)} style={{left: 860, top: 440}} />
    </>
  );
};

// ===== 6 · review + photo -> 5 stars (dark) =========================================
export const S6: React.FC<P> = ({t, th}) => {
  const reqAt = W(6, 5);
  const starAt = W(6, 11);
  const n = t > starAt ? Math.min(5, Math.floor((t - starAt) / 0.12) + 1) : 0;
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} th={th} a={[[['Review + ']], [['photo.', true]]]} />
      {t > reqAt && (
        <Pop t={t} at={reqAt} style={abs(330, 690)} dy={30} from={0.85}>
          <div style={{width: 640}}>
            <Bubble me time="Sat · 6:00 PM" tag="Auto · review request">
              Riya, kurta kaisa laga? Ek photo aur review bhejo, next order pe 15% off!
            </Bubble>
          </div>
        </Pop>
      )}
      <Pop t={t} at={starAt - 0.5} style={abs(110, 920)} dy={50}>
        <div style={{width: 860, display: 'flex', gap: 22, background: '#fff', borderRadius: 30, padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS}}>
          <div style={{width: 220, height: 260, borderRadius: 20, background: 'linear-gradient(160deg,#F6EDE1,#EBDCCB)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <Img src={fl('woman')} style={{width: 120, height: 120, position: 'absolute', top: 30}} />
            <Img src={fl('sari')} style={{width: 120, height: 120, position: 'absolute', top: 120}} />
            <Img src={fl('camera_with_flash')} style={{width: 50, height: 50, position: 'absolute', right: 8, top: 8}} />
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', gap: 6}}>
              {[0, 1, 2, 3, 4].map((k) => (
                <Img key={k} src={fl('star')} style={{width: 64, height: 64, filter: k < n ? 'none' : 'grayscale(1) opacity(0.25)', transform: `scale(${k < n ? lerp(1.4, 1, ep(t, starAt + k * 0.12, 0.35)) : 1})`}} />
              ))}
            </div>
            <div style={{fontSize: 25, color: '#333', marginTop: 14, lineHeight: 1.35, opacity: ep(t, starAt + 0.6, 0.4)}}>"Fabric bahut soft hai, fitting perfect. Delivery bhi time pe!"</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 21, color: C.green, fontWeight: 700, opacity: ep(t, starAt + 0.8, 0.4)}}>
              <Check size={26} p={1} /> Riya S. · Verified buyer
            </div>
          </div>
        </div>
      </Pop>
    </>
  );
};

// ===== 7 · new collection, Riya first -> order #2 (cream) =============================
export const S7: React.FC<P> = ({t, th}) => {
  const colAt = W(7, 3);
  const msgAt = W(7, 9);
  const ordAt = W(7, 14);
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} th={th} a={[[['New collection, ']], [['pehle Riya ko.', true]]]} />
      <div style={abs(110, 700, {display: 'flex', gap: 18})}>
        {['dress', 'sari', 'handbag'].map((n, i) =>
          t > colAt + i * 0.15 ? (
            <Pop key={i} t={t} at={colAt + i * 0.15} dy={40} rot={i - 1}>
              <div style={{width: 274, background: '#fff', borderRadius: 24, padding: 14, boxShadow: '0 16px 30px rgba(40,30,20,0.14)', fontFamily: SANS, border: i === 1 && t > ordAt ? `4px solid ${C.green}` : '4px solid transparent'}}>
                <div style={{height: 230, borderRadius: 16, background: ['#E7EDF5', '#F6EDE1', '#EEF4F1'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                  <Img src={fl(n)} style={{width: 140, height: 140}} />
                  <div style={{position: 'absolute', left: 10, top: 10, background: C.ink, color: '#fff', borderRadius: 8, padding: '3px 8px', fontFamily: MONO, fontWeight: 800, fontSize: 14}}>NEW</div>
                </div>
                <div style={{fontWeight: 800, fontSize: 24, color: '#111', marginTop: 8}}>{['₹1,899', '₹1,499', '₹999'][i]}</div>
              </div>
            </Pop>
          ) : null,
        )}
      </div>
      {t > msgAt && (
        <Pop t={t} at={msgAt} style={abs(110, 1060)} dy={30} from={0.85}>
          <div style={{width: 760}}>
            <Bubble me time="Early access · 8:00 PM" tag="VIP broadcast">
              Riya, nayi Festive collection sabse pehle aapke liye. Early access live!
            </Bubble>
          </div>
        </Pop>
      )}
      {t > ordAt && (
        <Pop t={t} at={ordAt} style={abs(560, 1220)} rot={-4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.ink, color: '#fff', borderRadius: 26, padding: '12px 22px', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
            <Check size={36} p={ep(t, ordAt, 0.3)} /> Order #2 placed
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 8 · profit = recovered carts + repeat customers (green) ========================
export const S8: React.FC<P> = ({t, th}) => {
  const adsAt = W(8, 5);
  const cartAt = W(8, 8);
  const repAt = W(8, 11);
  const seg = [
    {at: adsAt, h: 150, col: 'rgba(255,255,255,0.45)', l: 'Ads', img: 'money_with_wings'},
    {at: cartAt, h: 190, col: '#fff', l: 'Cart recovery', img: 'shopping_cart'},
    {at: repAt, h: 230, col: C.ink, l: 'Repeat customers', img: 'red_heart'},
  ];
  return (
    <>
      <Headline t={t} at={W(8, 0) - 0.2} th={th} a={[[['Profit = ']], [['carts + repeat.', true]]]} />
      <div style={abs(170, 700, {width: 300, height: 620, display: 'flex', flexDirection: 'column-reverse'})}>
        {seg.map((s, i) => (
          <div key={i} style={{height: s.h * eio(t, s.at, 0.7), background: s.col, borderRadius: i === 2 ? '24px 24px 0 0' : i === 0 ? '0 0 24px 24px' : 0}} />
        ))}
      </div>
      {seg.map((s, i) =>
        t > s.at ? (
          <Pop key={i} t={t} at={s.at + 0.2} style={abs(520, 1180 - i * 200)}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: i === 2 ? C.ink : '#fff', color: i === 2 ? '#fff' : C.ink, borderRadius: 30, padding: '12px 24px 12px 14px', fontFamily: SANS, fontWeight: 800, fontSize: 28, boxShadow: '0 14px 30px rgba(0,0,0,0.18)'}}>
              <Img src={fl(s.img)} style={{width: 44, height: 44}} /> {s.l}
            </div>
          </Pop>
        ) : null,
      )}
      <Pop t={t} at={repAt + 0.5} style={abs(830, 470)} rot={-16}>
        <Icon3D n="coin" size={150} t={t} seed={8} />
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
      <Headline t={t} at={W(9, 0) - 0.3} th={th} a={[[['Aapke brand ki']], [['problem?', true]]]} />
      <Prop n="bag" size={180} t={t} seed={9} at={W(9, 2)} style={{left: 870, top: 440}} />
      <Pop t={t} at={W(9, 1)} style={abs(90, 720)} dy={50}>
        <TCard th={th} style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <Img src={fl('shopping_bags')} style={{width: 52, height: 52}} />
            <b style={{fontSize: 27}}>D2C founder – Surat</b>
            <Label color={th.cardSub} size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? th.cardSub : C.ink, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'RTO bahut zyada hai...'}
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
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi e-commerce automation ki saari details</div>
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
