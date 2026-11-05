import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, Check, MONO, Phone, Pop, SANS, W, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';
import {Headline, Icon3D, Label, TCard, Theme, Tok, abs, fl} from './kit';

export const SCENE_LINE = [0, 2, 3, 4, 5, 6, 7];
export const THEMES: Theme[] = ['dark', 'cream', 'green', 'cream', 'dark', 'green', 'cream'];
type P = {t: number; th: Tok};

// lead-quality meter value over time (HUD reads this)
export const qualityAt = (t: number) => {
  const steps: [number, number][] = [
    [W(1, 13), 20],
    [W(2, 4), 40],
    [W(3, 20), 60],
    [W(4, 9), 75],
    [W(5, 13), 90],
  ];
  let v = 0;
  let prev = 0;
  for (const [at, val] of steps) {
    if (t >= at) {
      v = lerp(prev, val, ep(t, at, 0.8));
      prev = val;
    }
  }
  return {v, show: t >= W(1, 13) - 0.2};
};

/** before/after slider card: AFTER is revealed right-to-left by a draggable divider */
const Compare: React.FC<{t: number; at: number; before: React.ReactNode; after: React.ReactNode}> = ({t, at, before, after}) => {
  const p = eio(t, at, 1.0);
  const x = lerp(860, 0, p); // divider position inside the 860px card
  return (
    <div style={{position: 'relative', width: 860, height: 560, borderRadius: 34, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.28)'}}>
      <div style={{position: 'absolute', inset: 0, background: '#F6E9E9'}}>
        {before}
        <div style={{position: 'absolute', left: 20, top: 20, background: C.red, color: '#fff', borderRadius: 12, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 20, letterSpacing: '0.12em'}}>✕ GALAT</div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#E7F6EC', clipPath: `inset(0 0 0 ${x}px)`}}>
        {after}
        <div style={{position: 'absolute', right: 20, top: 20, background: C.green, color: '#fff', borderRadius: 12, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 20, letterSpacing: '0.12em'}}>✓ SAHI</div>
      </div>
      {t > at - 0.4 && p < 1 && (
        <div style={{position: 'absolute', left: x - 3, top: 0, bottom: 0, width: 6, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)'}}>
          <div style={{position: 'absolute', left: -32, top: 248, width: 70, height: 70, borderRadius: 35, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 28, color: C.ink}}>⟷</div>
          <Img src={fl('index_pointing_up')} style={{position: 'absolute', left: -14, top: 300, width: 100, height: 100, transform: 'rotate(-12deg)', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.35))'}} />
        </div>
      )}
    </div>
  );
};

const AdMock: React.FC<{title: string; sub: string; cta: string; good?: boolean; comments?: string[]}> = ({title, sub, cta, good, comments = []}) => (
  <div style={{position: 'absolute', left: 150, top: 70, width: 560, fontFamily: SANS}}>
    <div style={{background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 12px 26px rgba(0,0,0,0.12)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px'}}>
        <Img src={icon('instagram-icon.svg')} style={{width: 28, height: 28}} />
        <b style={{fontSize: 19, color: '#111'}}>skylineheights</b>
        <span style={{fontSize: 15, color: '#888'}}>· Sponsored</span>
      </div>
      <div style={{height: 190, background: 'linear-gradient(160deg,#E7EDF5,#CFE0F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
        <Img src={staticFile('re3d/house.png')} style={{width: 200, height: 200}} />
        <div style={{position: 'absolute', left: 14, top: 14, background: C.ink, color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 22}}>{title}</div>
        <div style={{position: 'absolute', right: 14, bottom: 14, background: good ? C.green : '#fff', color: good ? '#fff' : '#111', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 22}}>{sub}</div>
      </div>
      <div style={{background: good ? C.green : '#EFEFEF', color: good ? '#fff' : '#111', padding: '12px 16px', fontWeight: 800, fontSize: 21}}>{cta}</div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10}}>
      {comments.map((c, i) => (
        <div key={i} style={{fontSize: 20, color: '#333'}}>
          <b>user{3 + i * 7}</b> {c}
        </div>
      ))}
    </div>
  </div>
);
const Chip: React.FC<{img: string; txt: string; good?: boolean}> = ({img, txt, good}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, background: good ? C.green : C.ink, color: '#fff', borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 26, boxShadow: '0 12px 24px rgba(0,0,0,0.2)'}}>
    <Img src={fl(img)} style={{width: 38, height: 38}} /> {txt}
  </div>
);

// ===== 0 · hook: "price?" flood -> fake leads (dark) ================================
export const Z0: React.FC<P> = ({t, th}) => {
  const fakeAt = W(0, 8);
  const dmAt = W(1, 2);
  const wasteAt = W(1, 10);
  const fourAt = W(1, 18);
  const n = Math.floor(clamp01((t - 0.15) / 3.4) * 36);
  const leads = Math.round(lerp(12, 487, ep(t, 0.2, 3.4)));
  const clear = ep(t, fourAt - 0.3, 0.5);
  return (
    <>
      <Headline t={t} at={-0.8} th={th} a={[[['Ad mein price nahi?']], [['Fake leads pakki.', true]]]} />
      <div style={abs(300, 700, {opacity: 1 - clear, transform: `scale(${1 - clear * 0.2})`})}>
        <Phone w={480} h={620} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '66px 18px 10px'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 30, height: 30}} />
              <b style={{fontSize: 20, color: '#111'}}>skylineheights</b>
              <span style={{fontSize: 15, color: '#888'}}>Sponsored</span>
            </div>
            <div style={{height: 300, background: 'linear-gradient(160deg,#E7EDF5,#CFE0F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
              <Img src={staticFile('re3d/house.png')} style={{width: 280, height: 280}} />
              <div style={{position: 'absolute', left: 14, top: 14, background: C.ink, color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 24}}>Luxury 3BHK</div>
            </div>
            <div style={{position: 'relative', background: '#EFEFEF', padding: '14px 16px', fontWeight: 800, fontSize: 26, color: '#111'}}>
              DM for price 🔥
              {t > dmAt && <div style={{position: 'absolute', left: 14, bottom: 8, height: 6, width: `${ep(t, dmAt, 0.4) * 230}px`, background: C.red, borderRadius: 3}} />}
            </div>
          </div>
        </Phone>
      </div>
      {/* the flood of "price?" DMs */}
      {Array.from({length: n}).map((_, k) => {
        const at = 0.15 + (k / 36) * 3.4;
        const x = 40 + rnd(k + 1) * 640;
        const y = 640 + rnd(k + 9) * 720;
        const txt = ['Price?', 'Price kya hai?', 'Rate?', 'Price plz', 'Kitne ka hai?', 'Price?'][k % 6];
        return (
          <div key={k} style={abs(x, y, {opacity: (1 - clear) * ep(t, at, 0.1), transform: `scale(${lerp(0.5, 1, sp(t, at, 1.6))}) rotate(${(rnd(k) - 0.5) * 10}deg)`})}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 18, padding: '8px 14px 8px 8px', boxShadow: '0 10px 22px rgba(0,0,0,0.45)', fontFamily: SANS, fontSize: 22, color: '#111', fontWeight: 600}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 26, height: 26}} /> {txt}
              {t > fakeAt + (k % 9) * 0.04 && <span style={{background: C.red, color: '#fff', borderRadius: 8, padding: '2px 8px', fontFamily: MONO, fontSize: 15, fontWeight: 800}}>JUNK</span>}
            </div>
          </div>
        );
      })}
      {clear < 1 && (
        <div style={abs(330, 1330, {opacity: 1 - clear})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#2A2724', borderRadius: 24, padding: '10px 22px', fontFamily: SANS, color: '#fff', boxShadow: '0 16px 30px rgba(0,0,0,0.5)'}}>
            <Img src={fl('bell')} style={{width: 44, height: 44, transform: `rotate(${Math.sin(t * 25) * 14}deg)`}} />
            <span style={{fontWeight: 800, fontSize: 40}}>{leads}</span>
            <span style={{fontSize: 22, color: '#9A948C'}}>leads · {t > fakeAt ? <b style={{color: C.red}}>mostly junk</b> : 'aa rahi hain'}</span>
          </div>
        </div>
      )}
      {t > wasteAt && clear < 1 && (
        <Pop t={t} at={wasteAt} style={abs(700, 640)} rot={14}>
          <Icon3D n="hourglass_not_done" size={150} t={t} seed={2} />
        </Pop>
      )}
      {t > fourAt - 0.2 &&
        [0, 1, 2, 3].map((k) => (
          <div key={k} style={abs(110 + k * 220, 860)}>
            <Pop t={t} at={fourAt - 0.2 + k * 0.1} from={0.3} rot={(k - 1.5) * 8}>
              <div style={{width: 190, height: 250, borderRadius: 26, background: k % 2 ? '#F4F1EA' : '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: MONO}}>
                <Label color={C.green} size={16}>Fix</Label>
                <div style={{fontWeight: 800, fontSize: 84, color: C.ink, lineHeight: 1}}>{k + 1}</div>
              </div>
            </Pop>
          </div>
        ))}
    </>
  );
};

// ===== 1 · put the price range in the ad (cream) =====================================
export const Z1: React.FC<P> = ({t, th}) => {
  const rev = W(2, 4);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.1} th={th} a={[[['Fix 1: ']], [['price range likho.', true]]]} />
      <Pop t={t} at={W(2, 0) + 0.1} style={abs(110, 690)} dy={50}>
        <Compare
          t={t}
          at={rev}
          before={<AdMock title="Luxury 3BHK" sub="DM for price" cta="Send message" comments={['Price?', 'Rate kya hai?']} />}
          after={<AdMock title="3BHK · Whitefield" sub="Starting ₹85 L" cta="Book site visit →" good comments={['Sunday visit possible?', 'Loan options?']} />}
        />
      </Pop>
      <div style={abs(110, 1290, {display: 'flex', gap: 14})}>
        {t > W(2, 12) && (
          <Pop t={t} at={W(2, 12)}>
            <Chip img="chart_decreasing" txt="Random clicks ↓" />
          </Pop>
        )}
        {t > W(2, 22) && (
          <Pop t={t} at={W(2, 22)}>
            <Chip img="check_mark_button" txt="Serious buyers ✓" good />
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 2 · add two qualifying questions to the lead form (green) ======================
const Field: React.FC<{k: string; v: string; hi?: boolean}> = ({k, v, hi}) => (
  <div style={{marginTop: 14}}>
    <div style={{fontSize: 18, color: '#777'}}>{k}</div>
    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${hi ? C.green : '#DDD'}`, padding: '6px 0', fontSize: 24, color: '#111', fontWeight: hi ? 700 : 400}}>
      {v} {hi && <span style={{color: C.green}}>▾</span>}
    </div>
  </div>
);
export const Z2: React.FC<P> = ({t, th}) => {
  const rev = W(3, 7);
  const form = (good: boolean) => (
    <div style={{position: 'absolute', left: 190, top: 70, width: 480, background: '#fff', borderRadius: 24, padding: '22px 26px', boxShadow: '0 12px 26px rgba(0,0,0,0.12)', fontFamily: SANS}}>
      <div style={{fontWeight: 800, fontSize: 26, color: '#111'}}>Get price list</div>
      <Field k="Name" v="Rahul" />
      <Field k="Phone" v="+91 98450 •••••" />
      {good && <Field k="Budget" v="₹75 L – 1 Cr" hi />}
      {good && <Field k="Ghar kab tak?" v="3 months" hi />}
      <div style={{marginTop: 18, borderRadius: 14, padding: '12px 0', textAlign: 'center', fontWeight: 800, fontSize: 22, color: '#fff', background: good ? C.green : '#0095F6'}}>Submit</div>
    </div>
  );
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.1} th={th} a={[[['Fix 2: ']], [['form mein 2 sawaal.', true]]]} />
      <Pop t={t} at={W(3, 0) + 0.1} style={abs(110, 690)} dy={50}>
        <Compare t={t} at={rev} before={form(false)} after={form(true)} />
      </Pop>
      <div style={abs(110, 1290, {display: 'flex', gap: 14})}>
        {t > W(3, 17) && (
          <Pop t={t} at={W(3, 17)}>
            <Chip img="chart_decreasing" txt="Leads thodi kam" />
          </Pop>
        )}
        {t > W(3, 20) && (
          <Pop t={t} at={W(3, 20)}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', color: C.green, borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 26}}>
              <Img src={fl('bullseye')} style={{width: 38, height: 38}} /> Par sahi
            </div>
          </Pop>
        )}
      </div>
    </>
  );
};

// ===== 3 · replace "DM for details" with "Book site visit" (cream) ====================
export const Z3: React.FC<P> = ({t, th}) => {
  const rev = W(4, 5);
  const cta = (good: boolean) => (
    <div style={{position: 'absolute', left: 130, top: 110, width: 600, fontFamily: SANS}}>
      <div style={{fontSize: 26, color: '#555', marginBottom: 14}}>{good ? 'Reel caption + button' : 'Reel caption'}</div>
      <div style={{background: '#fff', borderRadius: 22, padding: 24, boxShadow: '0 12px 26px rgba(0,0,0,0.12)'}}>
        <div style={{fontSize: 24, color: '#111', lineHeight: 1.4}}>Premium 3BHK homes in Whitefield.</div>
        <div style={{marginTop: 18, borderRadius: 16, padding: '16px 0', textAlign: 'center', fontWeight: 800, fontSize: 28, background: good ? C.green : '#EFEFEF', color: good ? '#fff' : '#111'}}>{good ? 'Book site visit →' : 'DM for details'}</div>
        {good && (
          <div style={{display: 'flex', gap: 10, marginTop: 14}}>
            {['Sat 11 AM', 'Sun 10 AM', 'Sun 4 PM'].map((s, i) => (
              <div key={i} style={{flex: 1, textAlign: 'center', border: `2px solid ${i === 1 ? C.green : '#DDD'}`, borderRadius: 12, padding: '10px 0', fontSize: 20, fontWeight: 700, color: i === 1 ? C.green : '#555'}}>{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.1} th={th} a={[[['Fix 3: ']], [['"Book site visit".', true]]]} />
      <Pop t={t} at={W(4, 0) + 0.1} style={abs(110, 690)} dy={50}>
        <Compare t={t} at={rev} before={cta(false)} after={cta(true)} />
      </Pop>
      {t > W(4, 15) && (
        <Pop t={t} at={W(4, 15)} style={abs(110, 1290)}>
          <Chip img="calendar" txt="Sirf ready buyers aage" good />
        </Pop>
      )}
    </>
  );
};

// ===== 4 · retarget only 50% walkthrough viewers (dark) =================================
export const Z4: React.FC<P> = ({t, th}) => {
  const rev = W(5, 5);
  const aud = (good: boolean) => (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: SANS}}>
      <div style={{position: 'relative', width: good ? 220 : 380, height: good ? 220 : 380, borderRadius: '50%', background: good ? 'rgba(31,157,85,0.18)' : 'rgba(0,0,0,0.06)', border: `4px ${good ? 'solid' : 'dashed'} ${good ? C.green : '#BBB'}`}}>
        {Array.from({length: good ? 24 : 70}).map((_, k) => {
          const a = rnd(k + (good ? 50 : 0)) * Math.PI * 2;
          const r = Math.sqrt(rnd(k + 9)) * (good ? 95 : 175);
          return <div key={k} style={{position: 'absolute', left: (good ? 110 : 190) + Math.cos(a) * r - 7, top: (good ? 110 : 190) + Math.sin(a) * r - 7, width: 14, height: 14, borderRadius: 7, background: good ? C.green : '#AAA'}} />;
        })}
      </div>
      <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, fontWeight: 700, color: '#111'}}>
        {good && <Img src={fl('video_camera')} style={{width: 40, height: 40}} />}
        {good ? 'Walkthrough 50%+ dekha' : 'Sab · Bangalore · 25–55'}
      </div>
    </div>
  );
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.1} th={th} a={[[['Fix 4: ']], [['smart retargeting.', true]]]} />
      <Pop t={t} at={W(5, 0) + 0.1} style={abs(110, 690)} dy={50}>
        <Compare t={t} at={rev} before={aud(false)} after={aud(true)} />
      </Pop>
      {t > W(5, 13) && (
        <Pop t={t} at={W(5, 13)} style={abs(110, 1290)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: '#fff', color: C.ink, borderRadius: 26, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 26}}>
            <Img src={fl('money_with_wings')} style={{width: 40, height: 40}} /> Budget waste band
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 5 · remember: 100 right leads > 1000 random (green) ============================
export const Z5: React.FC<P> = ({t, th}) => {
  const aAt = W(6, 2);
  const bAt = W(6, 6);
  const dealAt = W(6, 10);
  const Grid: React.FC<{n: number; at: number; col: string; size: number; cols: number}> = ({n, at, col, size, cols}) => (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 3}}>
      {Array.from({length: n}).map((_, k) => (
        <div key={k} style={{width: size, height: size, borderRadius: size / 2, background: col, opacity: t > at + (k / n) * 0.6 ? 1 : 0}} />
      ))}
    </div>
  );
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.1} th={th} a={[[['Yaad rakho.']], [['Sahi > zyada.', true]]]} />
      <div style={abs(90, 700, {width: 900, display: 'flex', gap: 40, alignItems: 'flex-start'})}>
        <div style={{flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: 22, opacity: ep(t, aAt - 0.2, 0.3)}}>
          <Label color="rgba(255,255,255,0.85)" size={18}>1,000 random leads</Label>
          <div style={{marginTop: 14}}>
            <Grid n={400} at={aAt} col="rgba(255,255,255,0.45)" size={13} cols={20} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontFamily: SANS, color: '#fff', fontWeight: 700, fontSize: 26, opacity: ep(t, dealAt, 0.4)}}>
            <Img src={fl('handshake')} style={{width: 44, height: 44}} /> × few
          </div>
        </div>
        <div style={{flex: 1, background: '#fff', borderRadius: 30, padding: 22, opacity: ep(t, bAt - 0.2, 0.3)}}>
          <Label color={C.green} size={18}>100 sahi leads</Label>
          <div style={{marginTop: 14}}>
            <Grid n={100} at={bAt} col={C.green} size={30} cols={10} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, opacity: ep(t, dealAt, 0.4)}}>
            {[0, 1, 2, 3].map((k) => (
              <Img key={k} src={fl('handshake')} style={{width: 44, height: 44, transform: `scale(${sp(t, dealAt + k * 0.1)})`}} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ===== 6 · done-for-you CTA: comment DETAILS -> guide in DM -> follow (cream) ========
const LIST = ['Price range likho', 'Form mein 2 sawaal', '"Book site visit"', 'Smart retargeting'];
export const Z6: React.FC<P> = ({t, th}) => {
  const L = W(7, 0);
  const tickA = W(7, 5);
  const cmtAt = W(7, 11);
  const typeAt = W(7, 14);
  const sent = typeAt + 0.6;
  const dm = W(7, 20) - 0.1;
  const folAt = W(7, 29);
  const tapAt = W(7, 31);
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
              const at = tickA + i * 0.22;
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
      {t > W(7, 12) && (
        <div style={abs(620, 880, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, W(7, 12), 1.3))})`, opacity: ep(t, W(7, 12), 0.12), background: C.ink, color: '#fff', borderRadius: 14, padding: '6px 20px', fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: '0.12em', boxShadow: '0 14px 30px rgba(0,0,0,0.3)'})}>COMMENT</div>
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
                <span style={{color: '#fff', fontSize: 21, fontWeight: 700}}>Lead Quality Guide.pdf</span>
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

export const SCENES = [Z0, Z1, Z2, Z3, Z4, Z5, Z6];
