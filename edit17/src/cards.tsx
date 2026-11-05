import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, W, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

// one card per beat: hook, 5 strategies, twist, your turn
export const CARD_LINE = [0, 2, 3, 4, 5, 6, 7, 8];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'cream', 'green', 'cream'];
type P = {t: number; th: Tok};
const r3 = (n: string) => staticFile(`re3d/${n}.png`);

/** split-flap style number tile pair, flips in when the card lands */
export const Flap: React.FC<{t: number; at: number; n: string; prev: string; dark?: boolean}> = ({t, at, n, prev, dark}) => {
  const p = ep(t, at, 0.45);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 10}}>
      {n.split('').map((d, i) => {
        const pd = prev.split('')[i] ?? d;
        const q = clamp01(p * 1.4 - i * 0.25);
        const bg = dark ? '#2A2724' : C.ink;
        const half = (digit: string, top: boolean, extra: React.CSSProperties = {}) => (
          <div style={{position: 'absolute', left: 0, width: 96, height: 64, top: top ? 0 : 64, overflow: 'hidden', background: bg, borderRadius: top ? '14px 14px 0 0' : '0 0 14px 14px', ...extra}}>
            <div style={{position: 'absolute', left: 0, width: 96, top: top ? 0 : -64, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 92, color: '#fff'}}>{digit}</div>
          </div>
        );
        return (
          <div key={i} style={{position: 'relative', width: 96, height: 128, perspective: 600, boxShadow: '0 14px 30px rgba(0,0,0,0.3)', borderRadius: 14}}>
            {half(d, true)}
            {half(q < 0.5 ? pd : d, false)}
            {q < 0.5 ? half(pd, true, {transformOrigin: '50% 100%', transform: `rotateX(${-q * 180}deg)`}) : half(d, false, {transformOrigin: '50% 0%', transform: `rotateX(${(1 - q) * 180}deg)`})}
            <div style={{position: 'absolute', left: 0, right: 0, top: 63, height: 2, background: 'rgba(0,0,0,0.5)'}} />
          </div>
        );
      })}
    </div>
  );
};

// ===== 0 · the problem: leads vs site visits (dark) ================================
export const K0: React.FC<P> = ({t, th}) => {
  const cntA = W(1, 1);
  const outAt = W(1, 5);
  const wasteAt = W(1, 11);
  const fanAt = W(1, 13);
  const leads = Math.round(lerp(0, 500, ep(t, cntA - 0.3, 1.0)));
  const funnelOut = ep(t, fanAt - 0.1, 0.4);
  return (
    <>
      <Label color={C.wa} size={22} style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>The real problem</Label>
      <Headline t={t} at={0.15} th={th} a={[[['Leads ki kami nahi.']], [['Site visits ki hai.', true]]]} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - funnelOut, transform: `scale(${1 - funnelOut * 0.2})`}}>
        <Pop t={t} at={0.4} style={abs(290, 770)} from={0.4}>
          <Img src={r3('funnel')} style={{width: 500, height: 500}} />
        </Pop>
        {/* leads pouring in */}
        {Array.from({length: 40}).map((_, k) => {
          const st = 0.6 + rnd(k) * 3.2;
          const ph = ((t - st) * 0.9) % 1;
          if (t < st) return null;
          const x0 = 330 + rnd(k + 7) * 420;
          const x = lerp(x0, 540, ph * ph);
          const y = lerp(700, 1040, ph);
          return <div key={k} style={{position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20, borderRadius: 10, background: 'rgba(255,255,255,0.7)', opacity: ph < 0.85 ? 1 : (1 - ph) / 0.15}} />;
        })}
        {t > cntA - 0.3 && (
          <Pop t={t} at={cntA - 0.3} style={abs(60, 820)} rot={-6}>
            <div style={{background: '#2A2724', borderRadius: 24, padding: '14px 22px', fontFamily: SANS, color: '#fff', boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
              <div style={{fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em'}}>{leads}</div>
              <Label color="#9A948C" size={16}>leads</Label>
            </div>
          </Pop>
        )}
        {t > outAt && (
          <>
            <div style={abs(390, 1270, {display: 'flex', gap: 12})}>
              {[0, 1, 2, 3, 4].map((k) => (
                <Img key={k} src={fl('house_with_garden')} style={{width: 52, height: 52, transform: `translateY(${(1 - ep(t, outAt + k * 0.15, 0.4)) * -120}px)`, opacity: ep(t, outAt + k * 0.15, 0.2)}} />
              ))}
            </div>
            <Pop t={t} at={outAt + 0.5} style={abs(800, 1090)} rot={6}>
              <div style={{background: C.green, borderRadius: 24, padding: '14px 22px', fontFamily: SANS, color: '#fff'}}>
                <div style={{fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em'}}>5</div>
                <Label color="rgba(255,255,255,0.85)" size={16}>site visits</Label>
              </div>
            </Pop>
          </>
        )}
        {t > wasteAt && (
          <div style={abs(300, 960, {transform: `rotate(-9deg) scale(${lerp(2.2, 1, sp(t, wasteAt, 1.3))})`, opacity: ep(t, wasteAt, 0.12), background: C.red, color: '#fff', borderRadius: 14, padding: '10px 30px', fontFamily: MONO, fontWeight: 800, fontSize: 56, letterSpacing: '0.12em', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'})}>WASTAGE</div>
        )}
      </div>
      {/* the 5-card deck fans out */}
      {t > fanAt &&
        [0, 1, 2, 3, 4].map((k) => {
          const p = sp(t, fanAt + k * 0.08);
          const ang = (k - 2) * 11;
          return (
            <div key={k} style={abs(410, 760, {width: 260, height: 360, borderRadius: 24, background: k % 2 ? '#F4F1EA' : '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transformOrigin: '50% 140%', transform: `rotate(${ang * p}deg) translateY(${(1 - Math.min(1, p)) * 200}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: MONO})}>
              <div style={{fontWeight: 800, fontSize: 80, color: C.ink}}>0{k + 1}</div>
              <Label color={C.green} size={16}>Strategy</Label>
            </div>
          );
        })}
    </>
  );
};

// ===== 1 · different ads for different buyers (cream) =================================
export const K1: React.FC<P> = ({t, th}) => {
  const L = W(2, 0);
  const split = W(2, 10);
  const msg = W(2, 22);
  const sp1 = eio(t, split, 0.7);
  const Ad: React.FC<{img: string; title: string; lines: string[]; tag?: string; grey?: boolean}> = ({img, title, lines, tag, grey}) => (
    <div style={{width: 400, background: '#fff', borderRadius: 28, padding: 22, boxShadow: '0 20px 40px rgba(40,30,20,0.14)', fontFamily: SANS, filter: grey ? 'grayscale(1)' : 'none', opacity: grey ? 0.9 : 1}}>
      <div style={{height: 200, borderRadius: 18, background: grey ? '#EEEAE3' : '#EAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={fl(img)} style={{width: 130, height: 130}} />
      </div>
      <div style={{fontWeight: 800, fontSize: 30, color: C.ink, marginTop: 12}}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{fontSize: 22, color: '#6B655C', marginTop: 4}}>• {l}</div>
      ))}
      {tag && <div style={{marginTop: 12, background: C.ink, color: '#fff', borderRadius: 12, padding: '8px 12px', fontSize: 20, fontWeight: 700, textAlign: 'center'}}>{tag}</div>}
    </div>
  );
  return (
    <>
      <Flap t={t} at={L - 0.2} n="01" prev="00" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Ek project, ']], [['alag-alag ads.', true]]]} />
      {t < split + 0.1 ? (
        <Pop t={t} at={L + 0.3} style={abs(340, 700)} dy={40}>
          <Ad img="office_building" title="Skyline Heights" lines={['Sab ke liye ek ad', 'Same photos, same text']} grey={t > W(2, 8)} />
        </Pop>
      ) : null}
      {t > split && (
        <>
          <div style={abs(lerp(340, 90, sp1), 700, {transform: `rotate(${-3 * sp1}deg)`})}>
            <Ad img="house_with_garden" title="2BHK buyer" lines={['Family, school paas', 'Ready to move']} tag={t > msg ? 'Ad A · "Bachchon ka school 800 m"' : undefined} />
          </div>
          <div style={abs(lerp(340, 590, sp1), 700, {transform: `rotate(${3 * sp1}deg)`})}>
            <Ad img="chart_increasing" title="Investor" lines={['Rental demand', 'Price trend, RERA']} tag={t > msg + 0.3 ? 'Ad B · "Rent + appreciation"' : undefined} />
          </div>
          {t > W(2, 15) && (
            <Pop t={t} at={W(2, 15)} style={abs(380, 1240)}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.ink, color: '#fff', borderRadius: 26, padding: '10px 22px', fontFamily: SANS, fontWeight: 700, fontSize: 26}}>
                <Img src={fl('speech_balloon')} style={{width: 34, height: 34}} /> Sawaal alag
              </div>
            </Pop>
          )}
        </>
      )}
    </>
  );
};

// ===== 2 · show life, not the flat (green) ===========================================
export const K2: React.FC<P> = ({t, th}) => {
  const L = W(3, 0);
  const frames = [
    {at: W(3, 7), img: 'sunrise', cap: 'Subah ki dhoop', bg: 'linear-gradient(180deg,#FBE3B5,#F5C27A)'},
    {at: W(3, 10), img: 'cityscape', cap: 'Balcony se view', bg: 'linear-gradient(180deg,#CFE3F5,#9CC2E6)'},
    {at: W(3, 13), img: 'school', cap: 'School · 800 m', bg: 'linear-gradient(180deg,#E3F2E7,#BFE3C9)'},
  ];
  let cur = -1;
  frames.forEach((f, i) => {
    if (t > f.at) cur = i;
  });
  const futureAt = W(3, 20);
  return (
    <>
      <Flap t={t} at={L - 0.2} n="02" prev="01" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Flat nahi, ']], [['life dikhao.', true]]]} />
      <Pop t={t} at={L + 0.3} style={abs(330, 690)} dy={60}>
        <Phone w={420} h={640} dark>
          <div style={{position: 'absolute', inset: 0, background: cur < 0 ? '#E9E5DD' : frames[cur].bg, fontFamily: SANS}}>
            <div style={{position: 'absolute', left: 16, right: 16, top: 62, display: 'flex', gap: 6}}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{flex: 1, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.15)'}}>
                  <div style={{width: k < cur ? '100%' : k === cur ? `${ep(t, frames[k].at, 1.2) * 100}%` : '0%', height: '100%', borderRadius: 3, background: '#111'}} />
                </div>
              ))}
            </div>
            {cur < 0 ? (
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <div style={{width: 260, height: 180, border: '6px solid #BDB7AD', borderRadius: 8}} />
                <div style={{fontSize: 24, color: '#8C8780'}}>Empty 2BHK · 1,150 sq ft</div>
                {t > W(3, 4) && (
                  <svg width="300" height="260" style={{position: 'absolute'}}>
                    <path d="M20 20 L280 240 M280 20 L20 240" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="360" strokeDashoffset={360 * (1 - ep(t, W(3, 4), 0.3))} />
                  </svg>
                )}
              </div>
            ) : (
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={fl(frames[cur].img)} style={{width: 260, height: 260, transform: `scale(${lerp(1.15, 1, ep(t, frames[cur].at, 1.5))})`}} />
                <div style={{position: 'absolute', bottom: 70, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 12, padding: '8px 16px', fontWeight: 800, fontSize: 28}}>{frames[cur].cap}</div>
              </div>
            )}
          </div>
        </Phone>
      </Pop>
      {t > futureAt && (
        <Pop t={t} at={futureAt} style={abs(690, 1160)} rot={8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', color: C.ink, borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 28, boxShadow: '0 16px 30px rgba(0,0,0,0.2)'}}>
            <Img src={fl('red_heart')} style={{width: 40, height: 40}} /> Apna future
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · Google Business Profile (cream) ===========================================
export const K3: React.FC<P> = ({t, th}) => {
  const L = W(4, 0);
  const q = 'flats near me';
  const tyA = W(4, 7);
  const typed = q.slice(0, Math.floor(clamp01((t - tyA) / 0.9) * q.length));
  const resAt = W(4, 12);
  const checks = [
    {at: W(4, 17), txt: 'Photos', img: 'camera_with_flash'},
    {at: W(4, 18), txt: 'Reviews', img: 'star'},
    {at: W(4, 19), txt: 'Location', img: 'round_pushpin'},
  ];
  return (
    <>
      <Flap t={t} at={L - 0.2} n="03" prev="02" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Google Business ']], [['Profile.', true]]]} />
      <Pop t={t} at={L + 0.3} style={abs(110, 700)} dy={50}>
        <TCard th={th} style={{width: 860, padding: 22}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#F1F3F4', borderRadius: 30, padding: '12px 18px'}}>
            <Img src={fl('magnifying_glass_tilted_left')} style={{width: 34, height: 34}} />
            <span style={{fontFamily: SANS, fontSize: 28, color: '#111'}}>
              {typed}
              {t > tyA && t < resAt && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </span>
          </div>
          {t > resAt && (
            <div style={{marginTop: 16, opacity: ep(t, resAt, 0.3), transform: `translateY(${(1 - ep(t, resAt, 0.4)) * 20}px)`, fontFamily: SANS}}>
              <div style={{display: 'flex', gap: 8}}>
                {['cityscape', 'house_with_garden', 'sunrise'].map((n, i) => (
                  <div key={i} style={{flex: 1, height: 150, borderRadius: 14, background: ['#E7EDF5', '#EAF6EF', '#FBEFD9'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: t > checks[0].at ? 1 : 0.35}}>
                    <Img src={fl(n)} style={{width: 90, height: 90}} />
                  </div>
                ))}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
                <Img src={fl('office_building')} style={{width: 56, height: 56}} />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 800, fontSize: 28, color: '#1A0DAB'}}>Your Project · Builder</div>
                  <div style={{fontSize: 21, color: '#555'}}>
                    {t > checks[1].at ? <span style={{color: '#E8A400'}}>★ 4.6 (128)</span> : <span style={{color: '#aaa'}}>No reviews</span>} · {t > checks[2].at ? '1.2 km · Open now' : 'Location missing'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TCard>
      </Pop>
      <div style={abs(110, 1250, {display: 'flex', gap: 14})}>
        {checks.map((c, i) =>
          t > c.at ? (
            <Pop key={i} t={t} at={c.at}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, background: C.ink, color: '#fff', borderRadius: 24, padding: '10px 18px 10px 10px', fontFamily: SANS, fontWeight: 700, fontSize: 24}}>
                <Img src={fl(c.img)} style={{width: 34, height: 34}} /> {c.txt} ✓
              </div>
            </Pop>
          ) : null,
        )}
      </div>
    </>
  );
};

// ===== 4 · reply within 5 minutes (dark) ==========================================
export const K4: React.FC<P> = ({t, th}) => {
  const L = W(5, 0);
  const tA = W(5, 1);
  const tB = W(5, 8);
  const lateAt = W(5, 9);
  const goAt = W(5, 12);
  const secs = Math.round(clamp01((t - tA) / (tB - tA)) * 180);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const go = eio(t, goAt, 1.2);
  return (
    <>
      <Flap t={t} at={L - 0.2} n="04" prev="03" dark />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Reply, ']], [['5 minute ke andar.', true]]]} />
      <div style={abs(110, 700, {width: 860, display: 'flex', alignItems: 'center', gap: 26})}>
        <Pop t={t} at={tA - 0.2}>
          <div style={{position: 'relative', width: 230, height: 230}}>
            <svg width="230" height="230" viewBox="0 0 230 230">
              <circle cx="115" cy="115" r="98" fill="#22201D" stroke="rgba(255,255,255,0.12)" strokeWidth="14" />
              <circle cx="115" cy="115" r="98" fill="none" stroke={C.wa} strokeWidth="14" strokeLinecap="round" strokeDasharray={616} strokeDashoffset={616 * (1 - secs / 300)} transform="rotate(-90 115 115)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 52, color: '#fff'}}>{mm}:{ss}</div>
            <Img src={fl('stopwatch')} style={{position: 'absolute', right: -24, top: -24, width: 80, height: 80}} />
          </div>
        </Pop>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
          <Pop t={t} at={tA} from={0.85} dy={20}>
            <Bubble time="7:40 PM">3BHK ka price kya hai?</Bubble>
          </Pop>
          {t > tB - 0.3 && (
            <Pop t={t} at={tB - 0.3} from={0.85} dy={20}>
              <Bubble me time="7:43 PM" tag="Replied in 3 min">
                Price list + site visit slots bhej rahe hain
              </Bubble>
            </Pop>
          )}
        </div>
      </div>
      {t > lateAt && (
        <Pop t={t} at={lateAt} style={abs(110, 1040)} dy={30}>
          <div style={{position: 'relative', width: 860, height: 270, background: '#22201D', borderRadius: 30, boxShadow: '0 24px 50px rgba(0,0,0,0.5)', fontFamily: SANS, color: '#fff'}}>
            <Label color={C.red} size={17} style={{position: 'absolute', left: 26, top: 20}}>Late reply · 6 ghante baad</Label>
            <div style={{position: 'absolute', left: 40, top: 70, textAlign: 'center'}}>
              <Img src={r3('house')} style={{width: 150, height: 150}} />
              <div style={{fontSize: 20, color: '#9A948C'}}>Aapka project</div>
            </div>
            <div style={{position: 'absolute', right: 40, top: 70, textAlign: 'center'}}>
              <Img src={fl('office_building')} style={{width: 140, height: 140}} />
              <div style={{fontSize: 20, color: '#9A948C'}}>Doosra builder</div>
            </div>
            <svg width="860" height="270" style={{position: 'absolute', left: 0, top: 0}}>
              <path d="M220 150 Q430 60 640 150" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeDasharray="10 10" />
            </svg>
            {t > goAt && (
              <div style={{position: 'absolute', left: lerp(200, 600, go), top: 115 - Math.sin(go * Math.PI) * 60, width: 76, height: 76, borderRadius: 38, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={fl('bust_in_silhouette')} style={{width: 54, height: 54}} />
              </div>
            )}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · weekly follow-up after the visit (cream) ===================================
export const K5: React.FC<P> = ({t, th}) => {
  const L = W(6, 0);
  const items = [
    {at: W(6, 8), wk: 'Week 1', img: 'page_facing_up', txt: 'Floor plan', sub: '3BHK · 1,450 sq ft · Vastu'},
    {at: W(6, 10), wk: 'Week 2', img: 'money_bag', txt: 'EMI calculation', sub: 'Loan, tenure, monthly breakup'},
    {at: W(6, 12), wk: 'Week 3', img: 'building_construction', txt: 'Construction update', sub: 'Tower B · slab 9 complete'},
  ];
  return (
    <>
      <Flap t={t} at={L - 0.2} n="05" prev="04" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Follow-up ']], [['mat chhodo.', true]]]} />
      <Pop t={t} at={L + 0.4} style={abs(110, 690)} dy={30}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: C.ink, color: '#fff', borderRadius: 24, padding: '10px 20px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 24, width: 'fit-content'}}>
          <Check size={30} p={1} /> Site visit done · Sunday
        </div>
      </Pop>
      {items.map((it, i) =>
        t > it.at ? (
          <Pop key={i} t={t} at={it.at} style={abs(110 + i * 30, 800 + i * 170)} dy={30}>
            <TCard th={th} style={{width: 800, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 18}}>
              <Img src={fl(it.img)} style={{width: 72, height: 72}} />
              <div style={{flex: 1, fontFamily: SANS}}>
                <Label color={C.green} size={16}>{it.wk}</Label>
                <div style={{fontWeight: 800, fontSize: 30}}>{it.txt}</div>
                <div style={{fontSize: 21, color: th.cardSub}}>{it.sub}</div>
              </div>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 40, height: 40}} />
            </TCard>
          </Pop>
        ) : null,
      )}
    </>
  );
};

// ===== 6 · twist: #5 is the most underrated (green) ===================================
export const K6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const a = W(7, 11);
  const b = W(7, 15);
  const doneAt = W(7, 17);
  return (
    <>
      <Flap t={t} at={L - 0.2} n="05" prev="05" />
      <Headline t={t} at={L - 0.1} th={th} a={[[['Sach bataun? ']], [['#5 sabse underrated.', true]]]} />
      <Pop t={t} at={L + 0.3} style={abs(820, 290)} rot={-20}>
        <Icon3D n="crown" size={120} t={t} seed={3} />
      </Pop>
      <div style={abs(200, 720, {width: 680, height: 460, display: 'flex', alignItems: 'flex-end', gap: 80})}>
        {[
          {at: a, h: 120, l: 'Pehli visit pe', col: 'rgba(255,255,255,0.45)'},
          {at: b, h: 400, l: 'Follow-up ke baad', col: '#fff'},
        ].map((x, i) => (
          <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            <div style={{width: '100%', height: x.h * eio(t, x.at, 0.8), borderRadius: 22, background: x.col, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 16}}>
              {i === 1 && t > doneAt && <Img src={fl('handshake')} style={{width: 110, height: 110, transform: `scale(${sp(t, doneAt)})`}} />}
            </div>
            <Label color="#fff" size={19}>{x.l}</Label>
          </div>
        ))}
      </div>
      <Label color="rgba(255,255,255,0.75)" size={18} style={{position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center', opacity: ep(t, a, 0.4)}}>Deals close kahan hoti hain</Label>
    </>
  );
};

// ===== 7 · your turn: save + comment a number (cream) ===================================
const LIST = ['Alag ads', 'Life dikhao', 'Google profile', '5-min reply', 'Follow-up'];
export const K7: React.FC<P> = ({t, th}) => {
  const L = W(8, 0);
  const saveAt = W(8, 1);
  const typeAt = W(8, 15);
  const sent = W(8, 16) + 0.3;
  return (
    <>
      <Headline t={t} at={L - 0.1} th={th} a={[[['Save karo. ']], [['Comment karo.', true]]]} />
      <Pop t={t} at={saveAt - 0.1} style={abs(820, 300)} rot={10}>
        <div style={{position: 'relative'}}>
          <Icon3D n="bookmark" size={130} t={t} seed={4} />
          {t > saveAt + 0.3 && <div style={{position: 'absolute', left: -20, bottom: -10, background: C.green, color: '#fff', borderRadius: 14, padding: '4px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 20, transform: `scale(${sp(t, saveAt + 0.3)})`}}>Saved ✓</div>}
        </div>
      </Pop>
      <div style={abs(110, 700, {width: 860, display: 'flex', flexDirection: 'column', gap: 12})}>
        {LIST.map((s, i) => {
          const at = L + 0.3 + i * 0.12;
          const hi = i === 3 && t > sent;
          return t > at ? (
            <Pop key={i} t={t} at={at} dy={20} from={0.9}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, background: hi ? C.green : '#fff', color: hi ? '#fff' : C.ink, borderRadius: 22, padding: '14px 20px', boxShadow: '0 10px 20px rgba(40,30,20,0.08)', fontFamily: SANS, transform: `scale(${hi ? lerp(0.95, 1.03, sp(t, sent)) : 1})`}}>
                <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: hi ? '#fff' : C.green}}>0{i + 1}</div>
                <div style={{fontWeight: 700, fontSize: 30}}>{s}</div>
              </div>
            </Pop>
          ) : null;
        })}
      </div>
      {t > W(8, 13) - 0.3 && (
        <Pop t={t} at={W(8, 13) - 0.3} style={abs(110, 1230)} dy={30}>
          <div style={{width: 860, display: 'flex', alignItems: 'center', gap: 16, background: '#fff', borderRadius: 40, padding: '12px 14px 12px 26px', boxShadow: '0 14px 30px rgba(40,30,20,0.14)', fontFamily: SANS}}>
            <span style={{flex: 1, fontSize: 30, color: t > sent ? '#8C8780' : C.ink}}>
              {t > sent ? 'Comment posted ✓' : t > typeAt ? '4' : 'Add a comment...'}
              {t > typeAt - 0.3 && t < sent && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </span>
            <div style={{width: 64, height: 64, borderRadius: 32, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M3 11.5 L21 3 L14 21 L11.5 13.5 Z" fill="#fff" />
              </svg>
            </div>
          </div>
        </Pop>
      )}
    </>
  );
};

export const CARDS = [K0, K1, K2, K3, K4, K5, K6, K7];
