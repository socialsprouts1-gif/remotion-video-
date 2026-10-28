import React from 'react';
import {Img, staticFile} from 'remotion';
import {Bubble, C, Check, MONO, Phone, Pop, SANS, SERIF, W, WE, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';

// Same palette as the salon / restaurant edits: cream, black, green.
export type Theme = 'dark' | 'cream' | 'green';
export type Tok = {bg: string; fg: string; sub: string; card: string; cardFg: string; cardSub: string; chip: string; chipFg: string; accent: string; line: string};
export const TH: Record<Theme, Tok> = {
  dark: {bg: C.dark, fg: '#fff', sub: '#9A948C', card: '#22201D', cardFg: '#fff', cardSub: '#9A948C', chip: '#2A2724', chipFg: '#fff', accent: C.green, line: 'rgba(255,255,255,0.10)'},
  cream: {bg: C.cream, fg: C.ink, sub: '#8C8780', card: '#fff', cardFg: C.ink, cardSub: '#8C8780', chip: '#fff', chipFg: C.ink, accent: C.green, line: 'rgba(0,0,0,0.08)'},
  green: {bg: C.greenBg, fg: '#fff', sub: 'rgba(255,255,255,0.78)', card: '#fff', cardFg: C.ink, cardSub: '#8C8780', chip: '#fff', chipFg: C.ink, accent: C.ink, line: 'rgba(0,0,0,0.08)'},
};
export const THEMES: Theme[] = ['dark', 'dark', 'cream', 'cream', 'green', 'cream', 'dark', 'green', 'dark', 'cream'];

export const fl = (n: string) => staticFile(`fluent/${n}.png`);
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});
const float = (t: number, seed: number, amp = 8) => `translateY(${Math.sin(t * 1.4 + seed) * amp}px) rotate(${Math.sin(t * 0.9 + seed) * 2}deg)`;

/** 3D icon with soft contact shadow and idle float */
const Icon3D: React.FC<{n: string; size: number; t: number; seed?: number; style?: React.CSSProperties}> = ({n, size, t, seed = 0, style}) => (
  <div style={{position: 'relative', width: size, height: size, ...style}}>
    <div style={{position: 'absolute', left: size * 0.18, right: size * 0.18, bottom: -size * 0.06, height: size * 0.12, borderRadius: '50%', background: 'rgba(0,0,0,0.22)', filter: `blur(${size * 0.05}px)`, transform: `scaleX(${1 - Math.sin(t * 1.4 + seed) * 0.08})`}} />
    <Img src={fl(n)} style={{width: size, height: size, transform: float(t, seed, size * 0.03)}} />
  </div>
);

const TCard: React.FC<{th: Tok; children: React.ReactNode; style?: React.CSSProperties}> = ({th, children, style}) => (
  <div
    style={{
      background: th.card,
      borderRadius: 34,
      boxShadow: th === TH.dark ? '0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 2px 0 rgba(0,0,0,0.04), 0 30px 60px rgba(40,30,20,0.16), 0 8px 18px rgba(40,30,20,0.08)',
      color: th.cardFg,
      ...style,
    }}
  >
    {children}
  </div>
);
const Label: React.FC<{children: React.ReactNode; color: string; size?: number; style?: React.CSSProperties}> = ({children, color, size = 20, style}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);
const Chip: React.FC<{th: Tok; img: string; txt: string; strong?: boolean}> = ({th, img, txt, strong}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, background: strong ? C.green : th.chip, color: strong ? '#fff' : th.chipFg, borderRadius: 40, padding: '12px 26px 12px 14px', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 16px 34px rgba(0,0,0,0.18)'}}>
    <Img src={fl(img)} style={{width: 44, height: 44}} /> {txt}
  </div>
);

/** Earlier-video headline: bold sans line + serif italic line, centred. */
type Seg = [string, boolean?];
export const Headline: React.FC<{t: number; at: number; th: Tok; a: Seg[][]; b?: Seg[][]; swap?: number}> = ({t, at, th, a, b, swap}) => {
  const showB = !!b && swap !== undefined && t >= swap;
  const rows = showB ? b! : a;
  const t0 = showB ? swap! : at;
  const out = !showB && b && swap !== undefined ? ep(t, swap - 0.25, 0.25) : 0;
  let k = 0;
  return (
    <div style={{position: 'absolute', top: 330, left: 50, right: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', color: th.fg, opacity: 1 - out, transform: `translateY(${-out * 24}px)`}}>
      {rows.map((row, ri) => (
        <div key={ri + (showB ? 'b' : 'a')} style={{display: 'flex', whiteSpace: 'pre', lineHeight: 1.04}}>
          {row.map(([txt, serif], si) => {
            const p = ep(t, t0 + 0.05 + k++ * 0.11, 0.7);
            return (
              <span key={si} style={{fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 400 : 700, fontSize: serif ? 106 : 88, letterSpacing: serif ? '-0.01em' : '-0.035em', display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - p) * 12}px)`}}>
                {txt}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

type P = {t: number; th: Tok};

// ===== 0 · leads -> one buyer (dark) ==========================================
export const St0: React.FC<P> = ({t, th}) => {
  const leadsAt = W(0, 15);
  const pickAt = W(0, 18);
  const buyerAt = W(0, 21);
  const travel = eio(t, pickAt + 0.15, 1.3);
  const P0 = {x: 260, y: 930};
  const P1 = {x: 790, y: 960};
  const C1 = {x: 520, y: 640};
  const bx = (1 - travel) ** 2 * P0.x + 2 * (1 - travel) * travel * C1.x + travel ** 2 * P1.x;
  const by = (1 - travel) ** 2 * P0.y + 2 * (1 - travel) * travel * C1.y + travel ** 2 * P1.y;
  const house = sp(t, 0.5, 0.8);
  return (
    <>
      <Headline t={t} at={0.1} th={th} a={[[['Sirf leads ']], [['nahi...', true]]]} b={[[['Har lead, ']], [['buyer tak.', true]]]} swap={pickAt} />
      <div style={abs(70, 740, {width: 380, height: 400})}>
        {Array.from({length: 48}).map((_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r = 30 + rnd(i + 9) * 150;
          const dir = i % 2 ? 1 : -1;
          const x = 180 + Math.cos(a + t * 0.3 * dir) * r;
          const y = 190 + Math.sin(a + t * 0.3 * dir) * r * 0.9;
          const flash = t > leadsAt ? 1 - ep(t, leadsAt + rnd(i) * 0.5, 0.6) : 0;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 20, height: 20, borderRadius: 10, background: flash > 0.05 ? C.wa : 'rgba(255,255,255,0.25)', opacity: ep(t, 0.2 + i * 0.02, 0.3)}} />;
        })}
        <Label color={th.sub} style={{position: 'absolute', left: 110, top: 420}}>{t > leadsAt ? '1,248 leads' : 'Leads'}</Label>
      </div>
      <div style={abs(620, 690, {transform: `scale(${lerp(0.4, 1, house)})`, opacity: ep(t, 0.5, 0.3)})}>
        <Icon3D n="house" size={360} t={t} seed={1} />
        {t > buyerAt && <div style={{position: 'absolute', left: 180, top: 180, width: 10, height: 10, borderRadius: '50%', boxShadow: `0 0 0 ${lerp(0, 220, ep(t, buyerAt, 0.9))}px rgba(37,211,102,${0.35 * (1 - ep(t, buyerAt, 0.9))})`}} />}
      </div>
      <Pop t={t} at={buyerAt} style={abs(690, 1100)}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.green, color: '#fff', borderRadius: 30, padding: '10px 24px 10px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 30}}>
          <Check size={36} color="#fff" stroke={C.green} p={ep(t, buyerAt, 0.4)} /> Buyer
        </div>
      </Pop>
      {t > pickAt && (
        <div style={abs(bx - 24, by - 24, {width: 48, height: 48, borderRadius: 24, background: C.wa, boxShadow: `0 0 0 ${8 + Math.sin(t * 6) * 3}px rgba(37,211,102,0.22), 0 0 40px rgba(37,211,102,0.55)`, transform: `scale(${sp(t, pickAt)})`, opacity: 1 - ep(t, buyerAt + 0.2, 0.3)})} />
      )}
    </>
  );
};

// ===== 1 · 11:02 PM, Instagram ad -> form (dark) =================================
export const St1: React.FC<P> = ({t, th}) => {
  const igAt = W(1, 8);
  const adAt = W(1, 13);
  const formAt = W(1, 16);
  const doneAt = W(1, 18);
  const ph = sp(t, W(1, 0), 0.9);
  const sheet = ep(t, formAt, 0.5);
  const name = 'Rahul Mehta'.slice(0, Math.floor(clamp01((t - formAt - 0.2) / 0.5) * 11));
  return (
    <>
      <Headline t={t} at={W(1, 0) - 0.2} th={th} a={[[['Raat 11:02. ']], [['Ek ad.', true]]]} />
      <div style={abs(330, 620, {transform: `translateY(${(1 - ph) * 260}px) rotate(${(1 - ph) * 5}deg)`, opacity: ep(t, W(1, 0), 0.3)})}>
        <Phone w={430} h={700} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '70px 22px 14px', borderBottom: '1px solid #eee'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 34, height: 34}} />
              <b style={{fontSize: 26, color: '#111'}}>Instagram</b>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px'}}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: '#EAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img src={fl('office_building')} style={{width: 28, height: 28}} />
              </div>
              <div>
                <div style={{fontSize: 19, fontWeight: 700, color: '#111'}}>skylineheights</div>
                <div style={{fontSize: 15, color: '#888'}}>Sponsored</div>
              </div>
            </div>
            <div style={{position: 'relative', height: 290, background: 'linear-gradient(160deg,#F4EFE6,#E3EDE6)', overflow: 'hidden', opacity: ep(t, igAt, 0.4)}}>
              <Img src={fl('cityscape')} style={{position: 'absolute', left: 90, top: 20, width: 230, height: 230, transform: `scale(${1 + (t - igAt) * 0.02})`}} />
              <div style={{position: 'absolute', left: 16, top: 16, background: C.ink, color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 20}}>3BHK · Whitefield</div>
              <div style={{position: 'absolute', right: 16, bottom: 14, background: C.green, color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 22}}>from ₹88L</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t > adAt ? '#0095F6' : '#EFEFEF', color: t > adAt ? '#fff' : '#111', padding: '14px 18px', fontWeight: 700, fontSize: 21}}>
              Get price list <span>›</span>
            </div>
          </div>
          {t > formAt && (
            <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, height: 420, borderRadius: '30px 30px 52px 52px', background: '#fff', transform: `translateY(${(1 - sheet) * 440}px)`, boxShadow: '0 -20px 40px rgba(0,0,0,0.25)', padding: 26, fontFamily: SANS}}>
              <div style={{width: 60, height: 6, borderRadius: 3, background: '#ddd', margin: '0 auto 18px'}} />
              <div style={{fontWeight: 800, fontSize: 26, color: '#111'}}>Get the price list</div>
              {[
                ['Full name', name],
                ['Phone', t > formAt + 0.8 ? '+91 98450 •••••' : ''],
              ].map(([k, v], i) => (
                <div key={i} style={{marginTop: 16}}>
                  <div style={{fontSize: 16, color: '#888'}}>{k}</div>
                  <div style={{borderBottom: '2px solid #E2E2E2', padding: '6px 0', fontSize: 23, color: '#111', minHeight: 30}}>{v}</div>
                </div>
              ))}
              <div style={{marginTop: 24, borderRadius: 16, padding: '16px 0', fontWeight: 800, fontSize: 23, color: '#fff', background: t > doneAt ? C.green : '#0095F6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
                {t > doneAt ? (
                  <>
                    <Check size={28} color="#fff" stroke={C.green} p={ep(t, doneAt, 0.3)} /> Submitted
                  </>
                ) : (
                  'Submit'
                )}
              </div>
            </div>
          )}
        </Phone>
      </div>
      <Pop t={t} at={W(1, 2)} style={abs(70, 700)} rot={-8}>
        <Icon3D n="night_with_stars" size={170} t={t} seed={2} />
      </Pop>
      <Pop t={t} at={W(1, 6)} style={abs(50, 950)} rot={-6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: th.chip, borderRadius: 40, padding: '12px 24px 12px 12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
          <div style={{width: 58, height: 58, borderRadius: 29, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={fl('bust_in_silhouette')} style={{width: 40, height: 40}} />
          </div>
          <div style={{fontFamily: SANS, color: th.chipFg}}>
            <div style={{fontWeight: 700, fontSize: 26}}>Rahul</div>
            <div style={{fontSize: 18, color: th.sub}}>scrolling at night</div>
          </div>
        </div>
      </Pop>
      {t > formAt - 0.45 && t < formAt + 0.5 && (
        <div style={abs(lerp(840, 560, eio(t, formAt - 0.45, 0.4)), lerp(1250, 1180, eio(t, formAt - 0.45, 0.4)), {width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.85)', border: `4px solid ${C.wa}`, transform: `scale(${t > formAt ? 0.8 : 1})`, opacity: 1 - ep(t, formAt + 0.2, 0.3)})} />
      )}
    </>
  );
};

// ===== 2 · would go cold -> replied in 30 s (cream) ==============================
export const St2: React.FC<P> = ({t, th}) => {
  const coldAt = W(2, 3);
  const butAt = W(2, 8);
  const secAt = W(2, 10);
  const sendAt = W(2, 15);
  const frost = t < butAt ? ep(t, coldAt, 1.6) : 1 - ep(t, butAt, 0.4);
  const secs = Math.round(clamp01((t - secAt) / (sendAt - secAt)) * 30);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} th={th} a={[[['Subah tak? ']], [['Thandi.', true]]]} b={[[['30 sec mein ']], [['reply.', true]]]} swap={butAt} />
      <Pop t={t} at={W(2, 0) - 0.1} style={abs(90, 650)} dy={60}>
        <TCard th={th} style={{width: 900, padding: 32, position: 'relative', overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 84, height: 84, borderRadius: 42, background: '#EDE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={fl('bust_in_silhouette')} style={{width: 58, height: 58}} />
            </div>
            <div style={{fontFamily: SANS}}>
              <div style={{fontWeight: 700, fontSize: 36}}>Rahul Mehta</div>
              <div style={{fontSize: 22, color: th.cardSub}}>New lead · Instagram form · 11:02 PM</div>
            </div>
            <Img src={fl(frost > 0.5 ? 'cold_face' : 'fire')} style={{width: 84, height: 84, marginLeft: 'auto', transform: `scale(${frost > 0.5 ? sp(t, coldAt + 0.8) : t > butAt ? sp(t, butAt + 0.2) : 1})`}} />
          </div>
          <div style={{marginTop: 26}}>
            <Label color={th.cardSub} size={17}>Lead temperature</Label>
            <div style={{marginTop: 10, height: 18, borderRadius: 9, background: '#EEEAE3', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${lerp(92, 12, frost)}%`, borderRadius: 9, background: frost > 0.5 ? '#7FB3E8' : `linear-gradient(90deg, ${C.gold}, ${C.red})`}} />
            </div>
          </div>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(160,205,250,0.45), rgba(255,255,255,0.2))', opacity: frost * 0.9}} />
          {frost > 0.3 && (
            <div style={{position: 'absolute', right: 30, bottom: 26, display: 'flex', alignItems: 'center', gap: 8, opacity: frost}}>
              <Img src={fl('snowflake')} style={{width: 40, height: 40}} />
              <Label color="#3D6E9E" size={24}>Cold by 9 AM</Label>
            </div>
          )}
        </TCard>
      </Pop>
      {t > secAt && (
        <Pop t={t} at={secAt} style={abs(90, 1010)}>
          <div style={{position: 'relative', width: 200, height: 200}}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="86" fill="#fff" stroke="#E6E2DA" strokeWidth="12" />
              <circle cx="100" cy="100" r="86" fill="none" stroke={C.green} strokeWidth="12" strokeLinecap="round" strokeDasharray={540} strokeDashoffset={540 * (1 - secs / 30)} transform="rotate(-90 100 100)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 62, color: C.ink, letterSpacing: '-0.03em'}}>{secs}s</div>
            <Img src={fl('stopwatch')} style={{position: 'absolute', right: -24, top: -24, width: 80, height: 80}} />
          </div>
        </Pop>
      )}
      {t > sendAt && (
        <Pop t={t} at={sendAt} style={abs(330, 1030)} dy={30} from={0.7}>
          <div style={{width: 660}}>
            <Bubble me time="11:02 PM" tag="WhatsApp · auto reply">
              Hi Rahul! Skyline Heights ka brochure aur price list yeh rahi
            </Bubble>
          </div>
        </Pop>
      )}
      {t > sendAt && (
        <Pop t={t} at={sendAt + 0.1} style={abs(900, 960)} rot={12}>
          <Img src={icon('whatsapp-icon.svg')} style={{width: 90, height: 90, filter: 'drop-shadow(0 12px 20px rgba(37,211,102,0.4))'}} />
        </Pop>
      )}
    </>
  );
};

// ===== 3 · three questions (cream) =============================================
export const St3: React.FC<P> = ({t, th}) => {
  const qs = [
    {at: W(3, 7), img: 'money_bag', q: 'Aapka budget kitna hai?'},
    {at: W(3, 10), img: 'round_pushpin', q: 'Kaunsi location prefer karenge?'},
    {at: W(3, 13), img: 'spiral_calendar', q: 'Ghar kab tak chahiye?'},
  ];
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} th={th} a={[[['AI ke ']], [['teen sawaal.', true]]]} />
      <Pop t={t} at={W(3, 0)} style={abs(90, 650)} dy={60}>
        <TCard th={th} style={{width: 900, padding: '28px 30px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: `1px solid ${th.line}`}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 46, height: 46}} />
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28}}>Skyline Heights · AI assistant</div>
            <Label color={C.green} size={18} style={{marginLeft: 'auto'}}>{qs.filter((q) => t > q.at).length}/3</Label>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24}}>
            {qs.map((q, i) =>
              t > q.at ? (
                <Pop key={i} t={t} at={q.at} from={0.85} dy={30}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                    <Img src={fl(q.img)} style={{width: 78, height: 78, flexShrink: 0}} />
                    <div style={{background: '#D9FDD3', borderRadius: 24, borderTopLeftRadius: 6, padding: '18px 24px', fontFamily: SANS, fontSize: 30, color: '#111', fontWeight: 500}}>{q.q}</div>
                  </div>
                </Pop>
              ) : null,
            )}
          </div>
        </TCard>
      </Pop>
    </>
  );
};

// ===== 4 · answers -> hot lead -> manager alert (green) ==========================
export const St4: React.FC<P> = ({t, th}) => {
  const ans = [
    {at: W(4, 0), txt: '₹90 lakh', img: 'money_bag'},
    {at: W(4, 2), txt: 'Whitefield', img: 'round_pushpin'},
    {at: W(4, 3), txt: '3 months', img: 'spiral_calendar'},
  ];
  const hotAt = W(4, 6);
  const score = Math.round(lerp(18, 92, eio(t, W(4, 3) + 0.2, hotAt - W(4, 3))));
  const ang = lerp(-90, 90, score / 100);
  const alertAt = W(4, 11) - 0.2;
  const buzz = t > W(4, 14) ? Math.sin((t - W(4, 14)) * 60) * 6 * (1 - ep(t, W(4, 14), 0.6)) : 0;
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.3} th={th} a={[[['Matlab: ']], [['hot lead.', true]]]} />
      <div style={abs(60, 590, {display: 'flex', gap: 16, width: 960, justifyContent: 'center'})}>
        {ans.map((a, i) =>
          t > a.at ? (
            <Pop key={i} t={t} at={a.at} dy={40}>
              <Chip th={th} img={a.img} txt={a.txt} />
            </Pop>
          ) : null,
        )}
      </div>
      <Pop t={t} at={W(4, 2)} style={abs(190, 720)} dy={50}>
        <div style={{position: 'relative', width: 700, height: 380, background: '#fff', borderRadius: 40, boxShadow: '0 30px 60px rgba(0,0,0,0.18)'}}>
          <svg width="700" height="380" viewBox="0 0 700 380">
            <defs>
              <linearGradient id="gg" x1="0" x2="1">
                <stop offset="0" stopColor="#7FB3E8" />
                <stop offset="0.55" stopColor={C.gold} />
                <stop offset="1" stopColor={C.red} />
              </linearGradient>
            </defs>
            <path d="M110 330 A240 240 0 0 1 590 330" fill="none" stroke="#EEEAE3" strokeWidth="40" strokeLinecap="round" />
            <path d="M110 330 A240 240 0 0 1 590 330" fill="none" stroke="url(#gg)" strokeWidth="40" strokeLinecap="round" strokeDasharray="754" strokeDashoffset={754 * (1 - score / 100)} />
            <g transform={`rotate(${ang} 350 330)`}>
              <path d="M343 330 L350 120 L357 330 Z" fill={C.ink} />
            </g>
            <circle cx="350" cy="330" r="20" fill={C.ink} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, color: C.ink}}>
            <Label color="#8C8780" size={18}>Lead score</Label>
            <div style={{fontWeight: 800, fontSize: 92, letterSpacing: '-0.04em', color: score > 80 ? C.red : C.ink, lineHeight: 1}}>{score}</div>
          </div>
          {t > hotAt && (
            <div style={{position: 'absolute', right: -30, top: -40, transform: `scale(${sp(t, hotAt, 1.3)}) rotate(10deg)`}}>
              <Icon3D n="fire" size={150} t={t} seed={4} />
            </div>
          )}
        </div>
      </Pop>
      {t > alertAt && (
        <div style={abs(90 + buzz, 1130, {width: 900, transform: `translateY(${(1 - ep(t, alertAt, 0.5)) * -60}px)`, opacity: ep(t, alertAt, 0.25)})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 30, padding: '20px 24px', boxShadow: '0 30px 60px rgba(0,0,0,0.35)', fontFamily: SANS}}>
            <Img src={fl('bell')} style={{width: 72, height: 72, flexShrink: 0, transform: `rotate(${buzz * 3}deg)`}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 19, color: '#9A948C'}}>SALES MANAGER · now</div>
              <div style={{fontWeight: 800, fontSize: 27, color: '#fff'}}>Hot lead: Rahul Mehta</div>
              <div style={{fontSize: 22, color: '#C9C4BC'}}>₹90L · Whitefield · 3 months</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, background: C.wa, color: '#fff', borderRadius: 18, padding: '14px 20px', fontWeight: 800, fontSize: 24}}>
              <Img src={fl('telephone_receiver')} style={{width: 30, height: 30}} /> Call
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ===== 5 · walkthrough -> Sunday visit -> reminder (cream) =======================
export const St5: React.FC<P> = ({t, th}) => {
  const vidAt = W(5, 6);
  const sunAt = W(5, 10);
  const bookAt = W(5, 14);
  const remAt = W(5, 17);
  const play = clamp01((t - vidAt) / 2.2);
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} th={th} a={[[['Agle din: ']], [['walkthrough.', true]]]} b={[[['Sunday: ']], [['site visit.', true]]]} swap={sunAt - 0.1} />
      <Pop t={t} at={vidAt - 0.3} style={abs(90, 640)} dy={60}>
        <TCard th={th} style={{width: 900, padding: 18}}>
          <div style={{height: 330, borderRadius: 24, overflow: 'hidden', position: 'relative', background: 'linear-gradient(150deg,#F3EEE5,#DDEBE2)'}}>
            <Img src={fl('house')} style={{position: 'absolute', left: lerp(300, 250, play), top: 30, width: 270, height: 270, transform: `scale(${1 + play * 0.18})`}} />
            <Img src={fl('framed_picture')} style={{position: 'absolute', left: 60, top: 60, width: 120, height: 120, opacity: 0.9, transform: `translateX(${-play * 30}px)`}} />
            <Img src={fl('key')} style={{position: 'absolute', right: 70, top: 170, width: 110, height: 110, transform: `translateX(${play * 30}px) rotate(${play * 20}deg)`}} />
            <div style={{position: 'absolute', left: 16, top: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 10, padding: '6px 12px', fontFamily: MONO, fontWeight: 700, fontSize: 17}}>
              <Img src={fl('video_camera')} style={{width: 24, height: 24}} /> WALKTHROUGH
            </div>
            {play < 0.05 && (
              <div style={{position: 'absolute', left: 405, top: 120, width: 90, height: 90, borderRadius: 45, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}}>
                <div style={{width: 0, height: 0, borderLeft: `30px solid ${C.ink}`, borderTop: '18px solid transparent', borderBottom: '18px solid transparent', marginLeft: 8}} />
              </div>
            )}
            {play >= 1 && <div style={{position: 'absolute', right: 16, top: 16, background: C.green, color: '#fff', borderRadius: 12, padding: '6px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 18, transform: `scale(${sp(t, vidAt + 2.2)})`}}>WATCHED 100% ✓</div>}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 10px 4px', fontFamily: SANS}}>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 28}}>Skyline Heights · 3BHK tour</div>
              <div style={{fontSize: 20, color: th.cardSub}}>Sent on WhatsApp · 2:14</div>
            </div>
            <div style={{width: 260, height: 8, borderRadius: 4, background: '#EEEAE3'}}>
              <div style={{width: `${play * 100}%`, height: '100%', borderRadius: 4, background: C.green}} />
            </div>
          </div>
        </TCard>
      </Pop>
      {t > sunAt && (
        <Pop t={t} at={sunAt} style={abs(90, 1110)} dy={40}>
          <TCard th={th} style={{width: 900, padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 22}}>
            <Img src={fl('calendar')} style={{width: 90, height: 90}} />
            <div style={{fontFamily: SANS, flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 32}}>Sun 17 · Site visit · 11:00 AM</div>
              <div style={{fontSize: 22, color: th.cardSub}}>Skyline Heights, Whitefield</div>
            </div>
            {t > bookAt && <Check size={64} p={ep(t, bookAt, 0.4)} />}
          </TCard>
        </Pop>
      )}
      {t > remAt && (
        <Pop t={t} at={remAt} style={abs(520, 1250)} rot={4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: C.ink, color: '#fff', borderRadius: 30, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 24, boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>
            <Img src={fl('bell')} style={{width: 38, height: 38, transform: `rotate(${Math.sin((t - remAt) * 18) * 18 * (1 - ep(t, remAt, 1))}deg)`}} /> Reminder · Sat 7 PM
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · gone quiet -> nurture (dark) ===========================================
export const St6: React.FC<P> = ({t, th}) => {
  const items = [
    {at: W(6, 0) + 0.1, img: 'check_mark_button', tag: 'SUN', title: 'Site visit done', body: '', dim: false},
    {at: W(6, 4), img: 'hourglass_not_done', tag: 'DAY 1–2', title: 'No reply...', body: 'last seen yesterday', dim: true},
    {at: W(6, 12), img: 'money_bag', tag: 'DAY 3', title: 'EMI calculator', body: '₹90L · 20 yrs → ₹68,400/month', dim: false},
    {at: W(6, 17), img: 'chart_increasing', tag: 'DAY 5', title: 'Price update', body: 'price', dim: false},
  ];
  const typingAt = W(6, 18) + 0.3;
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} th={th} a={[[['Chup ho gaya?']]]} b={[[['Chup ho gaya?']], [['Koi baat nahi.', true]]]} swap={W(6, 7)} />
      <div style={abs(148, 660, {width: 6, height: lerp(0, 560, ep(t, W(6, 0), 3.5)), background: `linear-gradient(${C.green}, rgba(31,157,85,0.15))`, borderRadius: 3})} />
      {items.map((it, i) =>
        t > it.at ? (
          <div key={i} style={abs(110, 640 + i * 150)}>
            <Img src={fl(it.img)} style={{position: 'absolute', left: 0, top: 16, width: 82, height: 82, transform: `scale(${sp(t, it.at)})`, opacity: it.dim ? 0.6 : 1}} />
            <Pop t={t} at={it.at + 0.05} style={{position: 'absolute', left: 110, top: 0}} dy={20} from={0.9}>
              <TCard th={th} style={{width: 760, padding: '18px 24px', opacity: it.dim ? 0.65 : 1}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                  <Label color={it.dim ? th.sub : C.wa} size={18}>{it.tag}</Label>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}}>{it.title}</div>
                </div>
                {it.body === 'price' ? (
                  <div style={{fontFamily: SANS, fontSize: 24, color: th.cardSub, marginTop: 6}}>
                    <span style={{textDecoration: 'line-through'}}>₹88L</span> → <b style={{color: C.wa}}>₹85L</b> · only 6 units left
                  </div>
                ) : it.body ? (
                  <div style={{fontFamily: SANS, fontSize: 24, color: th.cardSub, marginTop: 6}}>{it.body}</div>
                ) : null}
              </TCard>
            </Pop>
          </div>
        ) : null,
      )}
      {t > typingAt && (
        <Pop t={t} at={typingAt} style={abs(560, 1225)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontSize: 22, color: '#111', fontWeight: 600}}>
            Rahul is typing
            {[0, 1, 2].map((k) => (
              <span key={k} style={{width: 8, height: 8, borderRadius: 4, background: C.wa, display: 'inline-block', opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 5 - k * 0.7))}} />
            ))}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · Day 14: booking amount (green) ==========================================
export const St7: React.FC<P> = ({t, th}) => {
  const payAt = W(7, 4);
  const doneAt = W(7, 6);
  const amt = Math.round(lerp(0, 200000, ep(t, payAt + 0.1, 1.2)));
  const chips = [
    {at: W(7, 7), txt: '1 ad', img: 'mobile_phone'},
    {at: W(7, 9), txt: '1 lead', img: 'bust_in_silhouette'},
    {at: W(7, 11), txt: '1 deal', img: 'handshake'},
  ];
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} th={th} a={[[['Do hafte baad: ']], [['deal.', true]]]} />
      {t > payAt && (
        <Pop t={t} at={payAt} style={abs(90, 650)} dy={60}>
          <TCard th={th} style={{width: 900, padding: '32px 36px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Label color={C.green} size={19}>Booking amount received</Label>
              {t > doneAt && <Check size={56} p={ep(t, doneAt, 0.4)} />}
            </div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: '-0.04em', marginTop: 6}}>₹{amt.toLocaleString('en-IN')}</div>
            <div style={{fontFamily: SANS, fontSize: 26, color: th.cardSub}}>Rahul Mehta · Skyline Heights, A-1204</div>
          </TCard>
        </Pop>
      )}
      {t > doneAt && (
        <>
          {Array.from({length: 28}).map((_, i) => {
            const a = rnd(i + 3) * Math.PI * 2;
            const d = 170 + rnd(i + 7) * 280;
            const p = ep(t, doneAt, 1.2);
            return <div key={i} style={abs(540 + Math.cos(a) * d * p, 780 + Math.sin(a) * d * p + p * p * 120, {width: 16, height: i % 3 ? 16 : 8, borderRadius: i % 3 ? 8 : 2, background: ['#fff', C.gold, '#C8F5D9'][i % 3], opacity: 1 - ep(t, doneAt + 0.7, 0.8), transform: `rotate(${i * 40 + t * 200}deg)`})} />;
          })}
          <Pop t={t} at={doneAt} style={abs(790, 520)} rot={-40} from={0.2}>
            <Icon3D n="key" size={180} t={t} seed={7} />
          </Pop>
          <Pop t={t} at={doneAt + 0.15} style={abs(40, 560)} rot={30} from={0.2}>
            <Icon3D n="party_popper" size={150} t={t} seed={3} />
          </Pop>
        </>
      )}
      <div style={abs(60, 1080, {display: 'flex', alignItems: 'center', gap: 12, width: 960, justifyContent: 'center'})}>
        {chips.map((c, i) =>
          t > c.at ? (
            <React.Fragment key={i}>
              {i > 0 && <span style={{fontFamily: SANS, fontSize: 40, fontWeight: 700, color: '#fff', opacity: ep(t, c.at, 0.3)}}>→</span>}
              <Pop t={t} at={c.at} dy={30}>
                <Chip th={th} img={c.img} txt={c.txt} />
              </Pop>
            </React.Fragment>
          ) : null,
        )}
      </div>
    </>
  );
};

// ===== 8 · every lead, 24×7 (dark) ==================================================
export const St8: React.FC<P> = ({t, th}) => {
  const L0 = W(8, 0) - 0.3;
  const rows = 6;
  return (
    <>
      <Headline t={t} at={L0} th={th} a={[[['Har lead. ']], [['24 × 7.', true]]]} />
      <div style={abs(90, 650, {width: 900, height: 520})}>
        {Array.from({length: rows}).map((_, r) => {
          const y = 30 + r * 86;
          return (
            <React.Fragment key={r}>
              <Img src={fl('mobile_phone')} style={{position: 'absolute', left: -6, top: y - 26, width: 52, height: 52, opacity: ep(t, L0 + r * 0.08, 0.4)}} />
              <div style={{position: 'absolute', left: 60, top: y, width: 720 * ep(t, L0 + r * 0.08, 0.8), height: 3, background: 'rgba(255,255,255,0.14)'}} />
              <div style={{position: 'absolute', left: 800, top: y - 26, opacity: ep(t, L0 + 0.4 + r * 0.08, 0.4)}}>
                <Img src={fl('check_mark_button')} style={{width: 52, height: 52}} />
              </div>
              {Array.from({length: 4}).map((_, k) => {
                const speed = 240 + rnd(r * 9 + k) * 160;
                const x = ((t - L0) * speed + rnd(r * 13 + k) * 720) % 720;
                return <div key={k} style={{position: 'absolute', left: 60 + x - 9, top: y - 8, width: 18, height: 18, borderRadius: 9, background: C.wa, boxShadow: '0 0 16px rgba(37,211,102,0.7)', opacity: ep(t, L0 + 0.3, 0.4) * clamp01(Math.min(x / 60, (720 - x) / 60))}} />;
              })}
            </React.Fragment>
          );
        })}
      </div>
      <div style={abs(60, 1170, {display: 'flex', gap: 70, width: 960, justifyContent: 'center', fontFamily: SANS, color: '#fff'})}>
        {[
          {at: W(8, 9), big: '24', small: 'ghante', img: 'alarm_clock'},
          {at: W(8, 11), big: '7', small: 'din', img: 'calendar'},
        ].map((x, i) =>
          t > x.at ? (
            <Pop key={i} t={t} at={x.at} dy={30}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <Img src={fl(x.img)} style={{width: 76, height: 76}} />
                <span style={{fontWeight: 800, fontSize: 96, letterSpacing: '-0.04em', lineHeight: 0.9}}>{x.big}</span>
                <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 54, color: C.wa}}>{x.small}</span>
              </div>
            </Pop>
          ) : null,
        )}
      </div>
    </>
  );
};

// ===== 9 · you? comment + DM (cream) ===============================================
export const St9: React.FC<P> = ({t, th}) => {
  const cta = W(9, 5);
  const typeAt = W(9, 7);
  const sent = typeAt + 0.65;
  const dm = W(9, 10) - 0.1;
  const typed = 'WhatsApp'.slice(0, Math.floor(clamp01((t - typeAt + 0.15) / 0.45) * 8));
  return (
    <>
      <Headline t={t} at={W(9, 0) - 0.3} th={th} a={[[['Aapko bhi ']], [['chahiye?', true]]]} />
      <Pop t={t} at={W(9, 1)} style={abs(90, 680)} dy={50}>
        <TCard th={th} style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <Img src={fl('building_construction')} style={{width: 50, height: 50}} />
            <b style={{fontSize: 27}}>Builder – Bengaluru</b>
            <Label color={th.cardSub} size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: '#F1EFEA', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? th.cardSub : C.ink, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'Add a comment...'}
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
        <Pop t={t} at={sent} style={abs(90, 910)} rot={-4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '12px 24px 12px 12px', fontFamily: SANS, fontSize: 28, color: '#111', boxShadow: '0 14px 30px rgba(40,30,20,0.14)'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 42, height: 42}} />
            <b>"WhatsApp"</b>
          </div>
        </Pop>
      )}
      {t > dm && (
        <Pop t={t} at={dm} style={abs(90, 1050)} dy={-60}>
          <div style={{width: 900, display: 'flex', alignItems: 'center', gap: 18, background: C.ink, borderRadius: 30, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', fontFamily: SANS}}>
            <div style={{width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 46, height: 46}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{color: '#fff', fontSize: 26}}>
                <b>neuraxine</b> <span style={{opacity: 0.6}}>sent you a message · now</span>
              </div>
              <div style={{color: 'rgba(255,255,255,0.85)', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi lead system ki saari details</div>
            </div>
            <div style={{background: C.green, color: '#fff', borderRadius: 20, padding: '8px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: '0.1em'}}>DM</div>
          </div>
        </Pop>
      )}
      {t > cta && (
        <div style={abs(640, 610, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, cta, 1.3))})`, opacity: ep(t, cta, 0.12), background: C.ink, color: '#fff', borderRadius: 14, padding: '8px 22px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.12em', boxShadow: '0 16px 40px rgba(0,0,0,0.3)'})}>
          COMMENT
        </div>
      )}
    </>
  );
};

export const STATIONS = [St0, St1, St2, St3, St4, St5, St6, St7, St8, St9];
export const STAGES = ['Start', 'Ad', 'Reply', 'Qualify', 'Hot lead', 'Visit', 'Nurture', 'Deal', '24×7', 'You'];
export {WE};
