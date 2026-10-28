import React from 'react';
import {Img} from 'remotion';
import {Bubble, Check, MONO, Phone, Pop, SANS, SERIF, W, WE, clamp01, ep, eio, icon, lerp, rnd, sp} from './ui';

// Navy + gold palette for this film.
export const N = {
  bg: '#0A1020',
  card: '#131C31',
  card2: '#1A2540',
  line: 'rgba(255,255,255,0.10)',
  gold: '#E8B65A',
  gold2: '#F6D592',
  text: '#F4F1EA',
  sub: '#8B9AB4',
  hot: '#FF6A3D',
  cool: '#8EC2FF',
  wa: '#25D366',
  green: '#3DDC97',
  red: '#FF5A5F',
};
const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

const NCard: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: N.card, border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 32, boxShadow: '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)', ...style}}>{children}</div>
);
const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = N.sub, size = 20, style}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: '0.16em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

/** Two-line serif headline, left aligned; optional second state that replaces it at `swap`. */
type HL = [string, string];
export const Headline: React.FC<{t: number; at: number; a: HL; b?: HL; swap?: number}> = ({t, at, a, b, swap}) => {
  const showB = b && swap !== undefined && t >= swap;
  const cur = showB ? b! : a;
  const t0 = showB ? swap! : at;
  const out = !showB && b && swap !== undefined ? ep(t, swap - 0.25, 0.25) : 0;
  return (
    <div style={{position: 'absolute', left: 90, top: 300, right: 60, opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
      {cur.map((txt, i) => {
        const p = ep(t, t0 + 0.05 + i * 0.14, 0.7);
        return (
          <div
            key={i + txt}
            style={{
              fontFamily: SERIF,
              fontStyle: i ? 'italic' : 'normal',
              fontSize: 104,
              lineHeight: 1.0,
              letterSpacing: '-0.01em',
              color: i ? N.gold : N.text,
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {txt}
          </div>
        );
      })}
    </div>
  );
};

// ===== 0 · leads -> one buyer ================================================
export const St0: React.FC<{t: number}> = ({t}) => {
  const leadsAt = W(0, 15);
  const pickAt = W(0, 18);
  const buyerAt = W(0, 21);
  const travel = eio(t, pickAt + 0.2, 1.4);
  const houseDraw = ep(t, 0.4, 2.2);
  // path of the chosen lead from the pile to the house door
  const P0 = {x: 250, y: 880};
  const P1 = {x: 800, y: 900};
  const C1 = {x: 520, y: 600};
  const bx = (1 - travel) ** 2 * P0.x + 2 * (1 - travel) * travel * C1.x + travel ** 2 * P1.x;
  const by = (1 - travel) ** 2 * P0.y + 2 * (1 - travel) * travel * C1.y + travel ** 2 * P1.y;
  return (
    <>
      <Headline t={t} at={0.1} a={['Sirf leads', 'nahi...']} b={['Har lead,', 'buyer tak.']} swap={pickAt} />
      {/* the pile of leads */}
      <div style={abs(80, 690, {width: 360, height: 400})}>
        {Array.from({length: 46}).map((_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r = 30 + rnd(i + 9) * 140;
          const x = 170 + Math.cos(a + t * 0.25 * (i % 2 ? 1 : -1)) * r;
          const y = 190 + Math.sin(a + t * 0.25 * (i % 2 ? 1 : -1)) * r * 0.9;
          const flash = t > leadsAt ? 1 - ep(t, leadsAt + rnd(i) * 0.4, 0.6) : 0;
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 18, height: 18, borderRadius: 9, background: flash > 0.05 ? N.gold2 : 'rgba(255,255,255,0.28)', opacity: ep(t, 0.2 + i * 0.02, 0.3)}} />;
        })}
        <Label style={{position: 'absolute', left: 120, top: 410}}>{t > leadsAt ? '1,248 leads' : 'Leads'}</Label>
      </div>
      {/* the house, drawn in gold */}
      <svg width="420" height="420" viewBox="0 0 420 420" style={abs(600, 640)}>
        <path
          d="M40 200 L210 60 L380 200 M80 170 L80 380 L340 380 L340 170 M180 380 L180 280 L240 280 L240 380 M110 220 L160 220 L160 260 L110 260 Z M260 220 L310 220 L310 260 L260 260 Z"
          fill="none"
          stroke={N.gold}
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="2200"
          strokeDashoffset={2200 * (1 - houseDraw)}
        />
        {t > buyerAt && <rect x="183" y="283" width="54" height="94" fill={N.gold} opacity={ep(t, buyerAt, 0.5) * 0.9} />}
        {t > buyerAt && <circle cx="210" cy="200" r={lerp(0, 180, ep(t, buyerAt, 0.8))} fill="none" stroke={N.gold} strokeWidth="3" opacity={1 - ep(t, buyerAt, 0.8)} />}
      </svg>
      <Label style={abs(735, 1075)} color={t > buyerAt ? N.gold : N.sub}>{t > buyerAt ? 'Buyer ✓' : 'Buyer'}</Label>
      {/* the one lead */}
      {t > pickAt && (
        <div style={abs(bx - 22, by - 22, {width: 44, height: 44, borderRadius: 22, background: N.gold, boxShadow: `0 0 0 ${8 + Math.sin(t * 6) * 3}px rgba(232,182,90,0.25), 0 0 40px rgba(232,182,90,0.6)`, transform: `scale(${sp(t, pickAt)})`, opacity: 1 - ep(t, buyerAt + 0.3, 0.3)})} />
      )}
    </>
  );
};

// ===== 1 · 11:02 PM, an Instagram ad ========================================
const Towers: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1B2A55 0%,#5B3C7A 55%,#E39A6B 100%)', overflow: 'hidden'}}>
    {[
      [30, 150, 70],
      [110, 230, 90],
      [215, 300, 110],
      [335, 190, 80],
    ].map(([x, h, w], i) => (
      <div key={i} style={{position: 'absolute', left: x, bottom: 0, width: w, height: h, background: '#141B33', borderRadius: '6px 6px 0 0'}}>
        {Array.from({length: Math.floor(h / 26)}).map((_, r) =>
          [0, 1, 2].map((c) => (
            <div key={`${r}-${c}`} style={{position: 'absolute', left: 10 + c * (w / 3.2), top: 14 + r * 26, width: 10, height: 12, background: rnd(i * 50 + r * 3 + c) > 0.45 ? '#F6D592' : 'rgba(255,255,255,0.08)'}} />
          )),
        )}
      </div>
    ))}
  </div>
);
export const St1: React.FC<{t: number}> = ({t}) => {
  const igAt = W(1, 8);
  const adAt = W(1, 13);
  const formAt = W(1, 16);
  const doneAt = W(1, 18);
  const ph = sp(t, W(1, 0), 0.9);
  const sheet = ep(t, formAt, 0.5);
  const name = 'Rahul Mehta'.slice(0, Math.floor(clamp01((t - formAt - 0.2) / 0.5) * 11));
  return (
    <>
      <Headline t={t} at={W(1, 0) - 0.2} a={['Raat 11:02.', 'Ek ad.']} />
      <div style={abs(320, 560, {transform: `translateY(${(1 - ph) * 250}px)`, opacity: ep(t, W(1, 0), 0.3)})}>
        <Phone w={440} h={700} dark>
          <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: SANS}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '70px 22px 14px', borderBottom: '1px solid #eee'}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 34, height: 34}} />
              <b style={{fontSize: 26, color: '#111'}}>Instagram</b>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px'}}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg,#1B2A55,#E39A6B)'}} />
              <div>
                <div style={{fontSize: 19, fontWeight: 700, color: '#111'}}>skylineheights</div>
                <div style={{fontSize: 15, color: '#888'}}>Sponsored</div>
              </div>
            </div>
            <div style={{position: 'relative', height: 300, opacity: ep(t, igAt, 0.4)}}>
              <Towers />
              <div style={{position: 'absolute', left: 18, top: 18, background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: 10, padding: '6px 12px', fontWeight: 800, fontSize: 22}}>3BHK · Whitefield</div>
              <div style={{position: 'absolute', left: 18, bottom: 16, color: '#fff', fontFamily: SERIF, fontStyle: 'italic', fontSize: 40}}>from ₹88L</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t > adAt ? '#0095F6' : '#EFEFEF', color: t > adAt ? '#fff' : '#111', padding: '14px 18px', fontWeight: 700, fontSize: 21}}>
              Get price list <span>›</span>
            </div>
          </div>
          {/* lead form sheet */}
          {t > formAt && (
            <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, height: 420, borderRadius: '30px 30px 52px 52px', background: '#fff', transform: `translateY(${(1 - sheet) * 440}px)`, boxShadow: '0 -20px 40px rgba(0,0,0,0.25)', padding: '26px 26px', fontFamily: SANS}}>
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
              <div style={{marginTop: 24, borderRadius: 16, padding: '16px 0', textAlign: 'center', fontWeight: 800, fontSize: 23, color: '#fff', background: t > doneAt ? N.green : '#0095F6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
                {t > doneAt ? (
                  <>
                    <Check size={28} color="#fff" stroke={N.green} p={ep(t, doneAt, 0.3)} /> Submitted
                  </>
                ) : (
                  'Submit'
                )}
              </div>
            </div>
          )}
        </Phone>
      </div>
      {/* Rahul */}
      <Pop t={t} at={W(1, 6)} style={abs(70, 760)} rot={-6}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, background: N.card2, borderRadius: 40, padding: '12px 24px 12px 12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
          <div style={{width: 56, height: 56, borderRadius: 28, background: 'linear-gradient(135deg,#F7C8B5,#E39C83)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#7A3E2A'}}>R</div>
          <div style={{fontFamily: SANS, color: N.text}}>
            <div style={{fontWeight: 700, fontSize: 26}}>Rahul</div>
            <div style={{fontSize: 18, color: N.sub}}>scrolling at night</div>
          </div>
        </div>
      </Pop>
      {/* finger tap */}
      {t > formAt - 0.45 && t < formAt + 0.5 && (
        <div style={abs(lerp(820, 560, eio(t, formAt - 0.45, 0.4)), lerp(1250, 1135, eio(t, formAt - 0.45, 0.4)), {width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.85)', border: `4px solid ${N.gold}`, transform: `scale(${t > formAt ? 0.8 : 1})`, opacity: 1 - ep(t, formAt + 0.2, 0.3)})} />
      )}
    </>
  );
};

// ===== 2 · would go cold — replied in 30 s ===================================
export const St2: React.FC<{t: number}> = ({t}) => {
  const coldAt = W(2, 3);
  const butAt = W(2, 8);
  const secAt = W(2, 10);
  const sendAt = W(2, 15);
  const frost = t < butAt ? ep(t, coldAt, 1.6) : 1 - ep(t, butAt, 0.4);
  const secs = Math.round(clamp01((t - secAt) / (sendAt - secAt)) * 30);
  return (
    <>
      <Headline t={t} at={W(2, 0) - 0.2} a={['Subah tak?', 'Thandi.']} b={['Yahan:', '30 sec mein reply.']} swap={butAt} />
      <Pop t={t} at={W(2, 0) - 0.1} style={abs(90, 640)} dy={60}>
        <NCard style={{width: 900, padding: 32, position: 'relative', overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 84, height: 84, borderRadius: 42, background: 'linear-gradient(135deg,#F7C8B5,#E39C83)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 36, color: '#7A3E2A'}}>R</div>
            <div style={{fontFamily: SANS, color: N.text}}>
              <div style={{fontWeight: 700, fontSize: 36}}>Rahul Mehta</div>
              <div style={{fontSize: 22, color: N.sub}}>New lead · Instagram form · 11:02 PM</div>
            </div>
          </div>
          <div style={{marginTop: 26}}>
            <Label size={17}>Lead temperature</Label>
            <div style={{marginTop: 10, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${lerp(92, 12, frost)}%`, borderRadius: 9, background: frost > 0.5 ? N.cool : `linear-gradient(90deg, ${N.gold}, ${N.hot})`}} />
            </div>
          </div>
          {/* frost overlay */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(142,194,255,0.35), rgba(255,255,255,0.12))', opacity: frost * 0.9, backdropFilter: 'blur(2px)'}} />
          {frost > 0.3 && <Label size={30} color="#DDEEFF" style={{position: 'absolute', right: 34, top: 34, opacity: frost}}>❄ Cold by 9 AM</Label>}
        </NCard>
      </Pop>
      {/* stopwatch */}
      {t > secAt && (
        <Pop t={t} at={secAt} style={abs(110, 1000)}>
          <div style={{position: 'relative', width: 190, height: 190}}>
            <svg width="190" height="190" viewBox="0 0 190 190">
              <circle cx="95" cy="95" r="82" fill={N.card} stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <circle cx="95" cy="95" r="82" fill="none" stroke={N.gold} strokeWidth="12" strokeLinecap="round" strokeDasharray={515} strokeDashoffset={515 * (1 - secs / 30)} transform="rotate(-90 95 95)" />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: N.text}}>
              <div style={{fontWeight: 800, fontSize: 60, letterSpacing: '-0.03em'}}>{secs}s</div>
            </div>
          </div>
        </Pop>
      )}
      {t > sendAt && (
        <Pop t={t} at={sendAt} style={abs(340, 1015)} dy={30} from={0.7}>
          <div style={{width: 640}}>
            <Bubble me time="11:02 PM" tag="WhatsApp · auto reply">
              Hi Rahul! Skyline Heights ka brochure aur price list yeh rahi
            </Bubble>
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 3 · three questions ===================================================
export const St3: React.FC<{t: number}> = ({t}) => {
  const qs = [
    {at: W(3, 7), img: 'money_bag.png', q: 'Aapka budget kitna hai?'},
    {at: W(3, 10), img: 'round_pushpin.png', q: 'Kaunsi location prefer karenge?'},
    {at: W(3, 13), img: 'calendar.png', q: 'Ghar kab tak chahiye?'},
  ];
  return (
    <>
      <Headline t={t} at={W(3, 0) - 0.2} a={['AI ke', 'teen sawaal.']} />
      <Pop t={t} at={W(3, 0)} style={abs(90, 640)} dy={60}>
        <NCard style={{width: 900, padding: '28px 30px 34px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: `1px solid ${N.line}`}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 44, height: 44}} />
            <div style={{fontFamily: SANS, color: N.text, fontWeight: 700, fontSize: 28}}>Skyline Heights · AI assistant</div>
            <Label size={17} color={N.gold} style={{marginLeft: 'auto'}}>{qs.filter((q) => t > q.at).length}/3</Label>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24}}>
            {qs.map((q, i) =>
              t > q.at ? (
                <Pop key={i} t={t} at={q.at} from={0.85} dy={30}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                    <div style={{width: 72, height: 72, borderRadius: 22, background: N.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                      <Img src={icon(q.img)} style={{width: 46, height: 46}} />
                    </div>
                    <div style={{background: '#D9FDD3', borderRadius: 24, borderTopLeftRadius: 6, padding: '18px 24px', fontFamily: SANS, fontSize: 30, color: '#111', fontWeight: 500}}>{q.q}</div>
                  </div>
                </Pop>
              ) : null,
            )}
          </div>
        </NCard>
      </Pop>
    </>
  );
};

// ===== 4 · answers -> hot lead -> manager alert =================================
export const St4: React.FC<{t: number}> = ({t}) => {
  const ans = [
    {at: W(4, 0), txt: '₹90 lakh', img: 'money_bag.png'},
    {at: W(4, 2), txt: 'Whitefield', img: 'round_pushpin.png'},
    {at: W(4, 3), txt: '3 months', img: 'calendar.png'},
  ];
  const hotAt = W(4, 6);
  const score = Math.round(lerp(18, 92, eio(t, W(4, 3) + 0.2, hotAt - W(4, 3))));
  const ang = lerp(-90, 90, score / 100);
  const alertAt = W(4, 11) - 0.2;
  const buzz = t > W(4, 14) ? Math.sin((t - W(4, 14)) * 60) * 6 * (1 - ep(t, W(4, 14), 0.6)) : 0;
  return (
    <>
      <Headline t={t} at={W(4, 0) - 0.3} a={['Matlab:', 'hot lead.']} />
      <div style={abs(90, 600, {display: 'flex', gap: 18})}>
        {ans.map((a, i) =>
          t > a.at ? (
            <Pop key={i} t={t} at={a.at} dy={40}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, background: N.card2, border: `2px solid ${N.gold}`, borderRadius: 40, padding: '12px 24px 12px 14px', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: N.text}}>
                <Img src={icon(a.img)} style={{width: 36, height: 36}} /> {a.txt}
              </div>
            </Pop>
          ) : null,
        )}
      </div>
      {/* gauge */}
      <Pop t={t} at={W(4, 2)} style={abs(190, 720)} dy={50}>
        <div style={{position: 'relative', width: 700, height: 380}}>
          <svg width="700" height="380" viewBox="0 0 700 380">
            <defs>
              <linearGradient id="gg" x1="0" x2="1">
                <stop offset="0" stopColor={N.cool} />
                <stop offset="0.55" stopColor={N.gold} />
                <stop offset="1" stopColor={N.hot} />
              </linearGradient>
            </defs>
            <path d="M70 350 A280 280 0 0 1 630 350" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="44" strokeLinecap="round" />
            <path d="M70 350 A280 280 0 0 1 630 350" fill="none" stroke="url(#gg)" strokeWidth="44" strokeLinecap="round" strokeDasharray="880" strokeDashoffset={880 * (1 - score / 100)} />
            <g transform={`rotate(${ang} 350 350)`}>
              <path d="M342 350 L350 110 L358 350 Z" fill={N.text} />
            </g>
            <circle cx="350" cy="350" r="22" fill={N.text} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: SANS, color: N.text}}>
            <Label size={18}>Lead score</Label>
            <div style={{fontWeight: 800, fontSize: 96, letterSpacing: '-0.04em', color: score > 80 ? N.hot : N.text}}>{score}</div>
          </div>
          {t > hotAt && (
            <div style={{position: 'absolute', right: 10, top: 10, transform: `scale(${sp(t, hotAt, 1.3)}) rotate(8deg)`, display: 'flex', alignItems: 'center', gap: 8, background: N.hot, color: '#fff', borderRadius: 16, padding: '10px 18px', fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: '0.12em'}}>
              <Img src={icon('fire.png')} style={{width: 34, height: 34}} /> HOT
            </div>
          )}
        </div>
      </Pop>
      {/* manager alert */}
      {t > alertAt && (
        <div style={abs(90 + buzz, 1080, {width: 900, transform: `translateY(${(1 - ep(t, alertAt, 0.5)) * -60}px)`, opacity: ep(t, alertAt, 0.25)})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.96)', borderRadius: 30, padding: '20px 24px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: SANS}}>
            <div style={{width: 70, height: 70, borderRadius: 20, background: N.hot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('fire.png')} style={{width: 44, height: 44}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 19, color: '#888'}}>SALES MANAGER · now</div>
              <div style={{fontWeight: 800, fontSize: 27, color: '#111'}}>Hot lead: Rahul Mehta</div>
              <div style={{fontSize: 22, color: '#444'}}>₹90L · Whitefield · 3 months</div>
            </div>
            <div style={{background: N.green, color: '#fff', borderRadius: 18, padding: '14px 22px', fontWeight: 800, fontSize: 24}}>Call now</div>
          </div>
        </div>
      )}
    </>
  );
};

// ===== 5 · walkthrough -> Sunday site visit -> reminder =========================
export const St5: React.FC<{t: number}> = ({t}) => {
  const vidAt = W(5, 6);
  const sunAt = W(5, 10);
  const bookAt = W(5, 14);
  const remAt = W(5, 17);
  const play = clamp01((t - vidAt) / 2.2);
  return (
    <>
      <Headline t={t} at={W(5, 0) - 0.2} a={['Agle din:', 'walkthrough.']} b={['Sunday:', 'site visit.']} swap={sunAt - 0.1} />
      <Pop t={t} at={vidAt - 0.3} style={abs(90, 620)} dy={60}>
        <div style={{width: 900, height: 400, borderRadius: 30, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1.05 + play * 0.1})`}}>
            <Towers />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))'}} />
          <div style={{position: 'absolute', left: 30, bottom: 34, fontFamily: SANS, color: '#fff'}}>
            <div style={{fontWeight: 800, fontSize: 30}}>Skyline Heights · 3BHK walkthrough</div>
            <div style={{fontSize: 20, opacity: 0.8}}>Sent on WhatsApp · 2:14</div>
          </div>
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 18, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)'}}>
            <div style={{width: `${play * 100}%`, height: '100%', borderRadius: 3, background: N.gold}} />
          </div>
          {play < 0.05 && (
            <div style={{position: 'absolute', left: 405, top: 150, width: 90, height: 90, borderRadius: 45, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 0, height: 0, borderLeft: '30px solid #111', borderTop: '18px solid transparent', borderBottom: '18px solid transparent', marginLeft: 8}} />
            </div>
          )}
          {play >= 1 && (
            <div style={{position: 'absolute', right: 24, top: 24, display: 'flex', alignItems: 'center', gap: 8, background: N.green, color: '#fff', borderRadius: 14, padding: '8px 14px', fontFamily: MONO, fontWeight: 800, fontSize: 18, transform: `scale(${sp(t, vidAt + 2.2)})`}}>
              WATCHED 100% ✓
            </div>
          )}
        </div>
      </Pop>
      {t > sunAt && (
        <Pop t={t} at={sunAt} style={abs(90, 1060)} dy={40}>
          <NCard style={{width: 900, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: 110, borderRadius: 18, overflow: 'hidden', textAlign: 'center', fontFamily: SANS, flexShrink: 0}}>
              <div style={{background: N.hot, color: '#fff', fontWeight: 800, fontSize: 20, padding: '4px 0'}}>SUN</div>
              <div style={{background: '#fff', color: '#111', fontWeight: 800, fontSize: 50, padding: '2px 0'}}>17</div>
            </div>
            <div style={{fontFamily: SANS, color: N.text, flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 32}}>Site visit · 11:00 AM</div>
              <div style={{fontSize: 22, color: N.sub}}>Skyline Heights, Whitefield</div>
            </div>
            {t > bookAt && <Check size={64} color={N.green} p={ep(t, bookAt, 0.4)} />}
          </NCard>
        </Pop>
      )}
      {t > remAt && (
        <Pop t={t} at={remAt} style={abs(560, 1000)} rot={6}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, background: N.gold, color: '#1A1408', borderRadius: 30, padding: '10px 22px 10px 12px', fontFamily: SANS, fontWeight: 700, fontSize: 24, boxShadow: '0 16px 30px rgba(0,0,0,0.4)'}}>
            <Img src={icon('bell.png')} style={{width: 34, height: 34, transform: `rotate(${Math.sin((t - remAt) * 18) * 18 * (1 - ep(t, remAt, 1))}deg)`}} /> Reminder · Sat 7 PM
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 6 · gone quiet -> nurture ===============================================
export const St6: React.FC<{t: number}> = ({t}) => {
  const items = [
    {at: W(6, 0) + 0.1, tag: 'SUN', title: 'Site visit done', body: '', color: N.green},
    {at: W(6, 4), tag: 'DAY 1–2', title: 'No reply...', body: 'last seen yesterday', color: N.sub},
    {at: W(6, 12), tag: 'DAY 3', title: 'EMI calculator', body: '₹90L · 20 yrs → ₹68,400/month', color: N.gold},
    {at: W(6, 17), tag: 'DAY 5', title: 'Price update', body: 'price', color: N.gold},
  ];
  const typingAt = W(6, 18) + 0.3;
  return (
    <>
      <Headline t={t} at={W(6, 0) - 0.2} a={['Chup ho gaya?', '']} b={['Chup ho gaya?', 'Koi baat nahi.']} swap={W(6, 7)} />
      <div style={abs(150, 640, {width: 6, height: lerp(0, 560, ep(t, W(6, 0), 3.5)), background: `linear-gradient(${N.gold}, rgba(232,182,90,0.2))`, borderRadius: 3})} />
      {items.map((it, i) =>
        t > it.at ? (
          <div key={i} style={abs(130, 630 + i * 150)}>
            <div style={{position: 'absolute', left: 8, top: 34, width: 30, height: 30, borderRadius: 15, background: it.color, boxShadow: `0 0 0 8px rgba(255,255,255,0.05)`, transform: `scale(${sp(t, it.at)})`}} />
            <Pop t={t} at={it.at + 0.05} style={{position: 'absolute', left: 80, top: 0}} dy={20} from={0.9}>
              <NCard style={{width: 760, padding: '18px 24px', opacity: it.color === N.sub ? 0.7 : 1}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                  <Label size={18} color={it.color}>{it.tag}</Label>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: N.text}}>{it.title}</div>
                </div>
                {it.body === 'price' ? (
                  <div style={{fontFamily: SANS, fontSize: 24, color: N.sub, marginTop: 6}}>
                    <span style={{textDecoration: 'line-through'}}>₹88L</span> → <b style={{color: N.gold2}}>₹85L</b> · only 6 units left
                  </div>
                ) : it.body ? (
                  <div style={{fontFamily: SANS, fontSize: 24, color: N.sub, marginTop: 6}}>{it.body}</div>
                ) : null}
              </NCard>
            </Pop>
          </div>
        ) : null,
      )}
      {t > typingAt && (
        <Pop t={t} at={typingAt} style={abs(560, 1215)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '10px 22px', fontFamily: SANS, fontSize: 22, color: '#111', fontWeight: 600}}>
            Rahul is typing
            {[0, 1, 2].map((k) => (
              <span key={k} style={{width: 8, height: 8, borderRadius: 4, background: N.wa, display: 'inline-block', opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 5 - k * 0.7))}} />
            ))}
          </div>
        </Pop>
      )}
    </>
  );
};

// ===== 7 · Day 14: booking amount ===============================================
export const St7: React.FC<{t: number}> = ({t}) => {
  const payAt = W(7, 4);
  const doneAt = W(7, 6);
  const amt = Math.round(lerp(0, 200000, ep(t, payAt + 0.1, 1.2)));
  const chips = [
    {at: W(7, 7), txt: '1 ad', img: 'instagram-icon.svg'},
    {at: W(7, 9), txt: '1 lead', img: 'mobile_phone.png'},
    {at: W(7, 11), txt: '1 deal', img: 'key.png'},
  ];
  return (
    <>
      <Headline t={t} at={W(7, 0) - 0.2} a={['Do hafte baad:', 'deal.']} />
      {t > payAt && (
        <Pop t={t} at={payAt} style={abs(90, 640)} dy={60}>
          <NCard style={{width: 900, padding: '32px 36px', background: 'linear-gradient(135deg,#1A2540,#26324F)', border: `2px solid rgba(232,182,90,0.5)`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Label size={19} color={N.gold}>Booking amount received</Label>
              {t > doneAt && <Check size={56} color={N.green} p={ep(t, doneAt, 0.4)} />}
            </div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 112, letterSpacing: '-0.04em', color: N.text, marginTop: 6}}>₹{amt.toLocaleString('en-IN')}</div>
            <div style={{fontFamily: SANS, fontSize: 26, color: N.sub}}>Rahul Mehta · Skyline Heights, A-1204</div>
          </NCard>
        </Pop>
      )}
      {/* keys + gold burst */}
      {t > doneAt && (
        <>
          {Array.from({length: 26}).map((_, i) => {
            const a = rnd(i + 3) * Math.PI * 2;
            const d = 160 + rnd(i + 7) * 260;
            const p = ep(t, doneAt, 1.2);
            return <div key={i} style={abs(540 + Math.cos(a) * d * p, 760 + Math.sin(a) * d * p + p * p * 120, {width: 14, height: 14, borderRadius: i % 3 ? 7 : 2, background: i % 2 ? N.gold : N.gold2, opacity: 1 - ep(t, doneAt + 0.6, 0.8), transform: `rotate(${i * 40 + t * 200}deg)`})} />;
          })}
          <Pop t={t} at={doneAt} style={abs(830, 560)} rot={-40} from={0.2}>
            <Img src={icon('key.png')} style={{width: 150, height: 150, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))', transform: `rotate(${Math.sin(t * 2) * 8}deg)`}} />
          </Pop>
        </>
      )}
      <div style={abs(90, 1070, {display: 'flex', alignItems: 'center', gap: 14})}>
        {chips.map((c, i) =>
          t > c.at ? (
            <React.Fragment key={i}>
              {i > 0 && <span style={{fontFamily: SANS, fontSize: 40, color: N.gold, opacity: ep(t, c.at, 0.3)}}>→</span>}
              <Pop t={t} at={c.at} dy={30}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, background: i === 2 ? N.gold : N.card2, color: i === 2 ? '#1A1408' : N.text, borderRadius: 36, padding: '14px 26px 14px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 34}}>
                  <Img src={icon(c.img)} style={{width: 40, height: 40}} /> {c.txt}
                </div>
              </Pop>
            </React.Fragment>
          ) : null,
        )}
      </div>
    </>
  );
};

// ===== 8 · every lead, 24×7 ===================================================
export const St8: React.FC<{t: number}> = ({t}) => {
  const L0 = W(8, 0) - 0.3;
  const rows = 6;
  return (
    <>
      <Headline t={t} at={L0} a={['Har lead.', '24 × 7.']} />
      <div style={abs(90, 640, {width: 900, height: 520})}>
        {Array.from({length: rows}).map((_, r) => {
          const y = 30 + r * 88;
          return (
            <React.Fragment key={r}>
              <div style={{position: 'absolute', left: 0, top: y, width: 820 * ep(t, L0 + r * 0.08, 0.8), height: 3, background: 'rgba(232,182,90,0.25)'}} />
              <div style={{position: 'absolute', left: 836, top: y - 22, opacity: ep(t, L0 + 0.4 + r * 0.08, 0.4)}}>
                <Check size={46} color={N.green} />
              </div>
              {Array.from({length: 4}).map((_, k) => {
                const speed = 260 + rnd(r * 9 + k) * 160;
                const x = ((t - L0) * speed + rnd(r * 13 + k) * 820) % 820;
                return <div key={k} style={{position: 'absolute', left: x - 9, top: y - 8, width: 18, height: 18, borderRadius: 9, background: N.gold, boxShadow: '0 0 18px rgba(232,182,90,0.8)', opacity: ep(t, L0 + 0.3, 0.4) * clamp01(Math.min(x / 60, (820 - x) / 60))}} />;
              })}
            </React.Fragment>
          );
        })}
      </div>
      <div style={abs(90, 1150, {display: 'flex', gap: 60, fontFamily: SANS, color: N.text})}>
        {[
          {at: W(8, 9), big: '24', small: 'ghante'},
          {at: W(8, 11), big: '7', small: 'din'},
        ].map((x, i) =>
          t > x.at ? (
            <Pop key={i} t={t} at={x.at} dy={30}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
                <span style={{fontFamily: SERIF, fontSize: 120, color: N.gold, lineHeight: 0.9}}>{x.big}</span>
                <Label size={24} color={N.text}>{x.small}</Label>
              </div>
            </Pop>
          ) : null,
        )}
      </div>
    </>
  );
};

// ===== 9 · you? comment + DM ===================================================
export const St9: React.FC<{t: number}> = ({t}) => {
  const cta = W(9, 5);
  const typeAt = W(9, 7);
  const sent = typeAt + 0.65;
  const dm = W(9, 10) - 0.1;
  const typed = 'WhatsApp'.slice(0, Math.floor(clamp01((t - typeAt + 0.15) / 0.45) * 8));
  return (
    <>
      <Headline t={t} at={W(9, 0) - 0.3} a={['Aapko bhi', 'chahiye?']} />
      <Pop t={t} at={W(9, 1)} style={abs(90, 660)} dy={50}>
        <NCard style={{width: 900, padding: '26px 30px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
            <div style={{width: 48, height: 48, borderRadius: 24, background: N.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: N.gold}}>B</div>
            <b style={{fontSize: 27, color: N.text}}>Builder – Bengaluru</b>
            <Label size={15}>· comment</Label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
            <div style={{flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 40, padding: '20px 28px', fontFamily: SANS, fontSize: 32, color: t > sent ? N.sub : N.text, minHeight: 40}}>
              {t > sent ? 'Comment posted ✓' : t > cta ? typed : 'Add a comment...'}
              {t > cta && t < sent && <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0}}>|</span>}
            </div>
            <div style={{width: 80, height: 80, borderRadius: 40, background: N.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t > sent ? lerp(0.8, 1, sp(t, sent)) : 1})`}}>
              <svg width="34" height="34" viewBox="0 0 24 24">
                <path d="M3 11.5 L21 3 L14 21 L11.5 13.5 Z" fill="#1A1408" />
              </svg>
            </div>
          </div>
        </NCard>
      </Pop>
      {t > sent && (
        <Pop t={t} at={sent} style={abs(90, 890)} rot={-4}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 30, padding: '12px 24px 12px 12px', fontFamily: SANS, fontSize: 28, color: '#111'}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 42, height: 42}} />
            <b>"WhatsApp"</b>
          </div>
        </Pop>
      )}
      {t > dm && (
        <Pop t={t} at={dm} style={abs(90, 1030)} dy={-60}>
          <div style={{width: 900, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.96)', borderRadius: 30, padding: '20px 26px', boxShadow: '0 24px 50px rgba(0,0,0,0.45)', fontFamily: SANS}}>
            <div style={{width: 64, height: 64, borderRadius: 18, background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Img src={icon('instagram-icon.svg')} style={{width: 46, height: 46}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{color: '#111', fontSize: 26}}>
                <b>neuraxine</b> <span style={{color: '#888'}}>sent you a message · now</span>
              </div>
              <div style={{color: '#333', fontSize: 24, marginTop: 4}}>Hi! Yeh rahi lead system ki saari details</div>
            </div>
            <div style={{background: N.gold, color: '#1A1408', borderRadius: 20, padding: '8px 16px', fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: '0.1em'}}>DM</div>
          </div>
        </Pop>
      )}
      {t > cta && (
        <div style={abs(640, 600, {transform: `rotate(8deg) scale(${lerp(2, 1, sp(t, cta, 1.3))})`, opacity: ep(t, cta, 0.12), background: N.gold, color: '#1A1408', borderRadius: 14, padding: '8px 22px', fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: '0.12em', boxShadow: '0 16px 40px rgba(0,0,0,0.4)'})}>
          COMMENT
        </div>
      )}
    </>
  );
};

export const STATIONS = [St0, St1, St2, St3, St4, St5, St6, St7, St8, St9];
export const STAGES = ['Start', 'Ad', 'Reply', 'Qualify', 'Hot lead', 'Visit', 'Nurture', 'Deal', '24×7', 'You'];
export {WE};
