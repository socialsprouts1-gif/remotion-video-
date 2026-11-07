import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import edit from './edit.json';

// Neuraxine: Instagram DM automation. Pure motion graphics over a Hinglish voice-over.
// Palette from the real NX logo: black, silver, lime; red only for the "lost sale" beats.
const C = {
  bg: '#060607',
  card: '#131315',
  lime: '#C8FF3E',
  cream: '#F3F1EC',
  ink: '#0A0A0A',
  dim: 'rgba(243,241,236,0.6)',
  line: 'rgba(200,255,62,0.28)',
  red: '#FF453A',
  wa: '#25D366',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const SERIF = '"Instrument Serif", "Liberation Serif", serif';
const FPS = edit.fps;
const LIME_GRAD = 'linear-gradient(180deg, #F0FFB0 0%, #C8FF3E 45%, #8FD61A 100%)';
const RED_GRAD = 'linear-gradient(180deg, #FF8A80 0%, #FF453A 50%, #C9160E 100%)';
const SILVER_GRAD = 'linear-gradient(180deg, #FFFFFF 0%, #D9D9DE 50%, #9A9AA2 100%)';
const IG_GRAD = 'linear-gradient(45deg, #F9CE34, #EE2A7B 50%, #6228D7)';
const limeText: React.CSSProperties = {background: LIME_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const redText: React.CSSProperties = {background: RED_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const silverText: React.CSSProperties = {background: SILVER_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')}) format('woff2')`, {style: 'normal'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-italic.woff2')}) format('woff2')`, {style: 'italic'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const sp = (t: number, at: number, stiffness = 280, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.7}}));
const ap = (t: number, at: number, d = 0.25) => pt(t, at, at + d, ease.out);
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const clean = (w: string) => w.replace(/["“”…]/g, '');
const icon = (n: string) => staticFile(`icons/${n}`);
const win = (t: number, a: number, b: number, fi = 0.2, fo = 0.25) => ap(t, a, fi) * (1 - pt(t, b - fo, b, ease.in));
const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K` : `${Math.round(n)}`);

// ---------------------------------------------------------------- scene timeline (keyed to the voice)
const SC = {
  hook: [0, W(7) - 0.12],
  customer: [W(7) - 0.12, W(17) - 0.12],
  manual: [W(17) - 0.12, W(39) - 0.12],
  truth: [W(39) - 0.12, W(50) - 0.12],
  auto: [W(50) - 0.12, W(70) - 0.12],
  lead: [W(70) - 0.12, W(87) - 0.12],
  cta: [W(87) - 0.12, edit.speech + 0.1],
};
const CUTS = Object.values(SC).map((s) => s[0]).slice(1);
const inScene = (t: number, s: number[]) => t >= s[0] - 0.05 && t < s[1] + 0.3;
/** Whip in from the side, push out. */
const Shot: React.FC<{t: number; s: number[]; dir?: number; children: React.ReactNode}> = ({t, s, dir = 1, children}) => {
  if (!inScene(t, s)) return null;
  const e = s[0] === 0 ? 1 : pt(t, s[0], s[0] + 0.28, ease.out);
  const x = pt(t, s[1] - 0.05, s[1] + 0.28, ease.in);
  return (
    <AbsoluteFill style={{transform: `translateX(${(1 - e) * 1080 * dir - x * 400 * dir}px) scale(${1 + x * 0.08})`, filter: e < 1 || x > 0 ? `blur(${(1 - e) * 22 + x * 14}px)` : undefined, opacity: 1 - x}}>
      <AbsoluteFill style={{transform: 'translateY(110px)'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shared visuals
const Backdrop: React.FC<{t: number; red?: number}> = ({t, red = 0}) => (
  <AbsoluteFill style={{top: -160, bottom: -160}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 40%, #1E2A08 0%, #101011 52%, ${C.bg} 100%)`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 55% at 50% 40%, #3A0806 0%, #120808 52%, ${C.bg} 100%)`, opacity: red}} />
    <AbsoluteFill style={{backgroundImage: `radial-gradient(rgba(200,255,62,${0.14 * (1 - red)}) 1.5px, transparent 1.6px)`, backgroundSize: '36px 36px', backgroundPosition: `0 ${t * 12}px`, maskImage: 'radial-gradient(ellipse 70% 55% at 50% 40%, #000 25%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 40%, #000 25%, transparent 80%)'}} />
  </AbsoluteFill>
);
const Ico: React.FC<{n: string; size: number; style?: React.CSSProperties}> = ({n, size, style}) => <Img src={icon(n)} style={{width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.55))', ...style}} />;
const Pop: React.FC<{t: number; at: number; n: string; size: number; x: number; y: number; rot?: number}> = ({t, at, n, size, x, y, rot = 0}) => {
  const p = sp(t, at, 380, 12);
  if (p <= 0) return null;
  return <Ico n={n} size={size} style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin((t - at) * 2.4) * 8, transform: `scale(${p}) rotate(${lerp(-25, rot, m1(p))}deg)`}} />;
};
const Kicker: React.FC<{t: number; at: number; children: React.ReactNode; red?: boolean; top?: number}> = ({t, at, children, red, top = 150}) => {
  const p = ap(t, at, 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: '0.28em', color: red ? C.red : C.lime, border: `1.5px solid ${red ? 'rgba(255,69,58,0.45)' : C.line}`, borderRadius: 999, padding: '12px 28px', background: 'rgba(6,6,7,0.65)'}}>
        <span style={{width: 12, height: 12, borderRadius: 12, background: red ? C.red : C.lime, boxShadow: `0 0 ${10 + 8 * Math.sin(t * 9)}px ${red ? C.red : C.lime}`}} />
        {children}
      </div>
    </div>
  );
};
const InstaMark: React.FC<{size?: number}> = ({size = 64}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24">
      <rect x={2.5} y={2.5} width={19} height={19} rx={5.5} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={12} cy={12} r={4.4} fill="none" stroke="#fff" strokeWidth={2.2} />
      <circle cx={17.6} cy={6.4} r={1.3} fill="#fff" />
    </svg>
  </div>
);
const Avatar: React.FC<{i: number; size: number; style?: React.CSSProperties}> = ({i, size, style}) => {
  const P = ['man.png', 'woman.png', 'person.png', 'man_beard.png', 'woman_curly_hair.png'];
  return (
    <div style={{width: size, height: size, borderRadius: size, background: '#1d1d21', display: 'grid', placeItems: 'center', flexShrink: 0, ...style}}>
      <Img src={icon(P[i % 5])} style={{width: size * 0.78, height: size * 0.78}} />
    </div>
  );
};
const NAMES = ['riya.sharma', 'aman_k', 'neha.styles', 'rohit.fit', 'pooja_m', 'vikas.22', 'sana.home', 'arjun.dxb'];
const Bubble: React.FC<{i: number; text: string; scale?: number; style?: React.CSSProperties}> = ({i, text, scale = 1, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale, background: 'rgba(255,255,255,0.96)', borderRadius: 26 * scale, padding: `${12 * scale}px ${20 * scale}px ${12 * scale}px ${12 * scale}px`, boxShadow: '0 20px 40px rgba(0,0,0,0.45)', ...style}}>
    <Avatar i={i} size={56 * scale} />
    <div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 20 * scale, color: '#111'}}>{NAMES[i % NAMES.length]}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30 * scale, color: '#222', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------- 1. HOOK: reel went viral, comments came, sales zero
const Hook: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.hook;
  const views = lerp(0, 1240000, pt(t, 0.15, W(2) + 0.3, ease.out));
  const zero = sp(t, W(6) - 0.06, 520, 14);
  const dead = pt(t, W(5) - 0.05, W(6) + 0.1, ease.inOut);
  const shake = t > W(6) - 0.06 && t < W(6) + 0.3 ? Math.sin(t * 95) * 14 * (1 - (t - W(6) + 0.06) / 0.36) : 0;
  const comments = ['Price? 😍', 'Link bhejo', 'Details?', 'Kitne ka hai?', 'DM me', 'Available?', 'Price pls', 'COD hai?'];
  const ccount = Math.round(lerp(0, 847, pt(t, W(3) - 0.05, W(4) + 0.4, ease.out)));
  return (
    <Shot t={t} s={[a, b]}>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
        <Backdrop t={t} red={dead} />
        {/* the reel */}
        <div style={{position: 'absolute', left: 230, top: 330, width: 620, height: 1100, borderRadius: 60, background: '#000', padding: 12, boxSizing: 'border-box', boxShadow: '0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 3px #2a2a2e', transform: `scale(${lerp(1.25, 1, m1(sp(t, 0, 200, 22)))}) rotate(${lerp(-4, 0, m1(sp(t, 0, 200, 22)))}deg)`, filter: `grayscale(${dead * 0.85})`}}>
          <div style={{width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden', position: 'relative', background: 'linear-gradient(160deg, #2b1b4a 0%, #0f0f14 55%, #3a1430 100%)'}}>
            <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + 20 * Math.sin(t * 1.3)}% ${40 + 10 * Math.cos(t)}%, rgba(238,42,123,0.45), transparent 55%)`}} />
            <div style={{position: 'absolute', left: 30, top: 34, display: 'flex', alignItems: 'center', gap: 12}}>
              <InstaMark size={48} />
              <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>Reels</span>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
                <Ico n="eyes.png" size={86} />
                <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{fmt(views)}</span>
              </div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em'}}>VIEWS</div>
            </div>
            {/* right rail */}
            <div style={{position: 'absolute', right: 26, bottom: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
              <div style={{textAlign: 'center'}}>
                <Ico n="red_heart.png" size={64} style={{transform: `scale(${1 + 0.15 * Math.abs(Math.sin(t * 8))})`}} />
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#fff'}}>{fmt(views * 0.06)}</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <svg width={60} height={60} viewBox="0 0 24 24">
                  <path d="M20.6 14.2A8.6 8.6 0 1 0 17 18.6l3.6 1-1-3.4z" fill="none" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
                </svg>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{ccount}</div>
              </div>
            </div>
            {/* hearts */}
            {Array.from({length: 14}, (_, i) => {
              const at = 0.3 + i * 0.12;
              const u = pt(t, at, at + 1.4, ease.out);
              if (u <= 0 || u >= 1) return null;
              return <Ico key={i} n="red_heart.png" size={44 + rand(i) * 30} style={{position: 'absolute', left: 470 + Math.sin(i * 2 + u * 6) * 40, top: 860 - u * 640, opacity: 1 - u}} />;
            })}
          </div>
        </div>
        {/* comments flood in on "Comments aaye" */}
        {comments.map((c, i) => {
          const at = W(3) - 0.08 + i * 0.09;
          const p = sp(t, at, 360, 18);
          if (p <= 0) return null;
          const left = i % 2 ? 560 : 50;
          return <Bubble key={i} i={i} text={c} scale={0.78} style={{position: 'absolute', left, top: 420 + i * 108, transform: `translateX(${(1 - m1(p)) * (i % 2 ? 400 : -400)}px) rotate(${(rand(i) - 0.5) * 6}deg)`, opacity: m1(p * 2) * (1 - dead * 0.6), filter: `grayscale(${dead})`}} />;
        })}
        {/* headline words */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center'}}>
          {t < W(5) - 0.06 ? (
            <div key={t < W(3) - 0.06 ? 'a' : 'b'} style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 1, ...(t < W(3) - 0.06 ? silverText : limeText), transform: `scale(${lerp(1.6, 1, m1(sp(t, t < W(3) - 0.06 ? W(0) - 0.05 : W(3) - 0.06, 460, 16)))})`}}>
              {t < W(3) - 0.06 ? 'Viral ✓' : `${ccount} comments`}
            </div>
          ) : (
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '-0.03em', color: C.cream, lineHeight: 1, opacity: ap(t, W(5) - 0.06)}}>SALES?</div>
          )}
        </div>
        {/* SALES: 0 */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(2.8, 1, m1(zero))}) rotate(-6deg)`, opacity: m1(zero * 3)}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 420, lineHeight: 0.9, letterSpacing: '-0.06em', ...redText, filter: 'drop-shadow(0 20px 60px rgba(255,69,58,0.55))'}}>₹0</div>
        </div>
        <svg width={1080} height={300} style={{position: 'absolute', left: 0, top: 1140, opacity: dead}}>
          <path d={`M 0 150 L ${lerp(0, 1080, dead)} 150`} stroke={C.red} strokeWidth={6} />
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

// ---------------------------------------------------------------- 2. every comment was a customer: Price? Link bhejo. Details?
const Customer: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.customer;
  const asks = [
    {at: 13, txt: 'Price?', i: 0, x: 90, y: 760, r: -5},
    {at: 14, txt: 'Link bhejo 🙏', i: 1, x: 330, y: 960, r: 4},
    {at: 16, txt: 'Details?', i: 2, x: 150, y: 1160, r: -3},
  ];
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} />
      <Kicker t={t} at={a}>HAR COMMENT</Kicker>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.cream, letterSpacing: '-0.03em', opacity: ap(t, W(9) - 0.05)}}>ek comment =</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, ...limeText, lineHeight: 1, transform: `scale(${lerp(1.5, 1, m1(sp(t, W(11) - 0.06, 420, 15)))})`, opacity: m1(sp(t, W(11) - 0.06) * 3)}}>ek customer</div>
      </div>
      {/* comment turns into a person with a price tag */}
      <div style={{position: 'absolute', left: 800, top: 560, transform: `scale(${m1(sp(t, W(11), 380, 13))})`}}>
        <Ico n="shopping_bags.png" size={180} />
      </div>
      {asks.map((q) => {
        const p = sp(t, W(q.at) - 0.06, 420, 15);
        if (p <= 0) return null;
        return <Bubble key={q.txt} i={q.i} text={q.txt} scale={1.45} style={{position: 'absolute', left: q.x, top: q.y, transform: `scale(${lerp(1.6, 1, m1(p))}) rotate(${q.r}deg)`, opacity: m1(p * 3)}} />;
      })}
    </Shot>
  );
};

// ---------------------------------------------------------------- 3. two days later, one by one... customer already bought elsewhere
const Manual: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.manual;
  const days = Math.min(2, Math.floor(pt(t, W(19) - 0.05, W(21) + 0.1, (x: number) => x) * 2.999));
  const sent = Math.floor(lerp(0, 9, pt(t, W(22), W(28) + 0.2, ease.inOut)));
  const lostK = sp(t, W(36) - 0.06, 360, 16);
  const walk = pt(t, W(31), W(36), ease.inOut);
  const lost = t > W(29) - 0.12;
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} red={lost ? m1(walk * 1.5) : 0} />
      <Kicker t={t} at={a} red={lost}>
        {lost ? 'TAB TAK…' : 'AUR AAP?'}
      </Kicker>
      {!lost ? (
        <>
          {/* calendar flips two days */}
          <div style={{position: 'absolute', left: 90, top: 260, width: 340, textAlign: 'center'}}>
            <div style={{borderRadius: 30, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `rotateX(${(pt(t, W(19) - 0.05 + days * 0.18, W(19) + 0.12 + days * 0.18) % 1) * 0}deg)`}}>
              <div style={{background: C.red, fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#fff', padding: '12px 0'}}>NOV</div>
              <div key={days} style={{fontFamily: SANS, fontWeight: 900, fontSize: 170, color: '#111', lineHeight: 1.1, transform: `translateY(${(1 - ap(t, W(19) - 0.05 + days * 0.25, 0.2)) * -30}px)`}}>{12 + days}</div>
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, ...redText, marginTop: 14, opacity: ap(t, W(19) - 0.05)}}>+{days} din baad</div>
          </div>
          <Pop t={t} at={W(20)} n="hourglass_not_done.png" size={150} x={560} y={330} rot={10} />
          {/* typing one DM at a time */}
          <div style={{position: 'absolute', left: 90, right: 90, top: 700, borderRadius: 34, background: '#fff', padding: '26px 28px', boxShadow: '0 40px 80px rgba(0,0,0,0.55)', opacity: ap(t, W(22) - 0.1)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #eee', paddingBottom: 16}}>
              <InstaMark size={50} />
              <div style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#111'}}>Direct</div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#888', fontVariantNumeric: 'tabular-nums'}}>{sent} / 847 replied</div>
            </div>
            {Array.from({length: 3}, (_, k) => {
              const n = sent - 2 + k;
              if (n < 0) return null;
              return (
                <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16}}>
                  <Avatar i={n} size={64} />
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#111'}}>{NAMES[n % NAMES.length]}</div>
                    <div style={{fontFamily: SANS, fontSize: 24, color: '#888'}}>{k === 2 ? `Typing${'.'.repeat(1 + (Math.floor(t * 4) % 3))}` : 'Price list bhej diya'}</div>
                  </div>
                  <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, color: C.red}}>{k === 2 ? '' : '2 din late'}</div>
                </div>
              );
            })}
            <div style={{marginTop: 22, height: 14, borderRadius: 7, background: '#eee', overflow: 'hidden'}}>
              <div style={{width: `${(sent / 847) * 100 * 30}%`, height: '100%', background: C.red, borderRadius: 7}} />
            </div>
          </div>
          <Pop t={t} at={W(24) - 0.05} n="stopwatch.png" size={140} x={900} y={640} rot={-8} />
        </>
      ) : (
        <>
          {/* the customer walks over to someone else's shop */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center'}}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: C.cream, letterSpacing: '-0.03em'}}>woh customer…</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, ...redText, lineHeight: 1.05, opacity: ap(t, W(33) - 0.05)}}>kisi aur se kharid chuka</div>
          </div>
          <div style={{position: 'absolute', left: 120, top: 760, textAlign: 'center', opacity: 1 - walk * 0.6}}>
            <InstaMark size={180} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.dim, marginTop: 12}}>aapka page</div>
          </div>
          <div style={{position: 'absolute', left: 700, top: 720, textAlign: 'center'}}>
            <Ico n="convenience_store.png" size={260} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.dim}}>competitor</div>
          </div>
          <Avatar i={0} size={150} style={{position: 'absolute', left: lerp(140, 760, walk), top: 1100 - Math.abs(Math.sin(walk * Math.PI * 5)) * 30, border: `4px solid ${walk > 0.95 ? C.red : C.lime}`}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', justifyContent: 'center', transform: `rotate(-7deg) scale(${lerp(2.2, 1, m1(lostK))})`, opacity: m1(lostK * 3)}}>
            <div style={{border: `12px solid ${C.red}`, borderRadius: 24, padding: '4px 36px', fontFamily: SANS, fontWeight: 900, fontSize: 120, color: C.red, background: 'rgba(20,0,0,0.6)', boxShadow: '0 0 70px rgba(255,69,58,0.45)'}}>SALE LOST</div>
          </div>
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 4. the problem isn't content, it's the reply
const Truth: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.truth;
  const strike = pt(t, W(45) - 0.05, W(46) + 0.15, ease.inOut);
  const rep = sp(t, W(49) - 0.08, 460, 13);
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 80, color: C.dim, opacity: ap(t, W(39) - 0.05)}}>sach bataun toh…</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: ap(t, W(42) - 0.05)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.cream}}>problem aapka</div>
        <div style={{position: 'relative', display: 'inline-block', fontFamily: SANS, fontWeight: 900, fontSize: 170, letterSpacing: '-0.05em', color: strike > 0.5 ? 'rgba(243,241,236,0.35)' : C.cream, lineHeight: 1}}>
          CONTENT
          <div style={{position: 'absolute', left: -20, top: '52%', height: 18, width: `${strike * 110}%`, background: C.red, borderRadius: 9, transform: 'rotate(-4deg)'}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, ...redText, opacity: ap(t, W(45) - 0.05)}}>nahi hai</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: m1(rep * 3), transform: `scale(${lerp(2.4, 1, m1(rep))})`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.cream}}>problem hai</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 250, letterSpacing: '-0.06em', ...limeText, lineHeight: 0.95, filter: 'drop-shadow(0 16px 50px rgba(200,255,62,0.45))'}}>REPLY</div>
      </div>
      <Pop t={t} at={W(49) + 0.1} n="speech_balloon.png" size={160} x={890} y={940} rot={10} />
    </Shot>
  );
};

// ---------------------------------------------------------------- 5. DM automation: comment -> instant DM, even at 2 AM
const Auto: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.auto;
  const logo = sp(t, a + 0.05, 260, 16);
  const flow = t > W(56) - 0.15;
  const c1 = sp(t, W(58) - 0.08, 400, 16);
  const bolt = pt(t, W(61) - 0.1, W(61) + 0.25, ease.out);
  const dm = sp(t, W(62) - 0.08, 400, 16);
  const night = pt(t, W(65) - 0.15, W(65) + 0.35, ease.inOut);
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #050816 0%, #0b1030 60%, #060607 100%)', opacity: night * 0.9}} />
      {!flow ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.6, 1, m1(logo))})`, opacity: m1(logo * 2)}}>
            <Img src={staticFile('brand/nx-logo.png')} style={{width: 300, height: 218, filter: 'drop-shadow(0 0 40px rgba(200,255,62,0.35))'}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.cream, opacity: ap(t, W(50) - 0.05)}}>isliye hum lagate hain</div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.05em', lineHeight: 1, ...limeText, transform: `scale(${lerp(1.6, 1, m1(sp(t, W(52) - 0.08, 420, 15)))})`, opacity: m1(sp(t, W(52) - 0.08) * 3)}}>DM</div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, ...silverText, lineHeight: 1, opacity: ap(t, W(53) - 0.05)}}>automation</div>
          </div>
        </>
      ) : (
        <>
          <Kicker t={t} at={W(56) - 0.15}>{night > 0.5 ? 'RAAT KE 2 BAJE BHI' : 'KOI BHI COMMENT KARE'}</Kicker>
          {/* the comment */}
          <div style={{position: 'absolute', left: 90, top: 290, transform: `translateX(${(1 - m1(c1)) * -500}px)`, opacity: m1(c1 * 2)}}>
            <Bubble i={night > 0.5 ? 3 : 1} text={night > 0.5 ? 'PRICE (2:03 AM)' : 'PRICE'} scale={1.35} />
          </div>
          {/* the bolt between them */}
          <svg width={1080} height={420} style={{position: 'absolute', left: 0, top: 440}}>
            <path d="M 300 20 C 300 200, 760 160, 760 380" fill="none" stroke={C.lime} strokeWidth={8} strokeDasharray={`${bolt * 700} 900`} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 12px rgba(200,255,62,0.8))'}} />
          </svg>
          <Pop t={t} at={W(61) - 0.05} n="high_voltage.png" size={150} x={540} y={590} rot={-10} />
          {/* the DM that arrives instantly */}
          <div style={{position: 'absolute', left: 150, right: 70, top: 830, borderRadius: 34, background: '#fff', padding: '22px 26px', boxShadow: '0 40px 80px rgba(0,0,0,0.55)', transform: `scale(${lerp(0.6, 1, m1(dm))})`, opacity: m1(dm * 2), transformOrigin: '80% 0%'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 64, height: 64, borderRadius: 64, background: '#0A0A0A', display: 'grid', placeItems: 'center'}}>
                <Img src={staticFile('brand/nx-logo.png')} style={{width: 50, height: 36}} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#111'}}>your.business</div>
                <div style={{fontFamily: SANS, fontSize: 20, color: '#888'}}>sent you a message · now</div>
              </div>
              <InstaMark size={46} />
            </div>
            <div style={{marginTop: 16, background: IG_GRAD, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 32, lineHeight: 1.3, padding: '18px 22px', borderRadius: 26}}>
              Hi! 👋 Yeh rahi price list aur link 👇
            </div>
          </div>
          <div style={{position: 'absolute', left: 150, top: 1180, display: 'flex', alignItems: 'center', gap: 14, opacity: m1(dm * 2)}}>
            <Ico n="stopwatch.png" size={70} />
            <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, ...limeText}}>turant</span>
          </div>
          {night > 0 && (
            <div style={{position: 'absolute', right: 80, top: 1150, display: 'flex', alignItems: 'center', gap: 14, opacity: night}}>
              <Ico n="crescent_moon.png" size={96} />
              <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 72, color: C.cream, fontVariantNumeric: 'tabular-nums'}}>2:03 AM</span>
            </div>
          )}
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 6. price, link, catalogue... interested people become WhatsApp leads
const Lead: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.lead;
  const items = [
    {at: 70, n: 'label.png', t: 'Price list'},
    {at: 71, n: 'link.png', t: 'Link'},
    {at: 72, n: 'open_book.png', t: 'Catalogue'},
  ];
  const auto = sp(t, W(74) - 0.08, 420, 14);
  const wa = t > W(75) - 0.15;
  const leads = Math.max(0, Math.min(4, Math.floor((t - W(82) + 0.15) / 0.22) + 1));
  return (
    <Shot t={t} s={[a, b]}>
      <Backdrop t={t} />
      {!wa ? (
        <>
          <Kicker t={t} at={a}>SAB AUTOMATIC</Kicker>
          <div style={{position: 'absolute', left: 90, right: 90, top: 300}}>
            {items.map((it, i) => {
              const p = sp(t, W(it.at) - 0.08, 380, 16);
              return (
                <div key={it.t} style={{display: 'flex', alignItems: 'center', gap: 28, marginBottom: 34, padding: '22px 30px', borderRadius: 32, background: '#141416', border: `2px solid ${p > 0 ? C.lime : 'transparent'}`, opacity: m1(p * 2), transform: `translateX(${(1 - m1(p)) * 500}px)`}}>
                  <Ico n={it.n} size={110} />
                  <div style={{flex: 1, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.cream, letterSpacing: '-0.03em'}}>{it.t}</div>
                  <Ico n="check_mark_button.png" size={80} style={{transform: `scale(${m1(sp(t, W(it.at) + 0.2, 420, 12))})`}} />
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', transform: `scale(${lerp(1.8, 1, m1(auto))})`, opacity: m1(auto * 3)}}>
            <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 140, ...limeText}}>sab automatic</span>
          </div>
        </>
      ) : (
        <>
          <Kicker t={t} at={W(75) - 0.15}>INTERESTED LOG</Kicker>
          {/* instagram -> whatsapp pipe */}
          <div style={{position: 'absolute', left: 110, top: 290, transform: `scale(${m1(sp(t, W(75) - 0.1, 320, 16))})`}}>
            <InstaMark size={170} />
          </div>
          <div style={{position: 'absolute', left: 800, top: 290, transform: `scale(${m1(sp(t, W(80) - 0.1, 380, 13))})`}}>
            <Img src={icon('whatsapp-icon.svg')} style={{width: 170, height: 170}} />
          </div>
          <svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 280}}>
            <path d="M 300 90 L 790 90" stroke={C.lime} strokeWidth={6} strokeDasharray="14 14" strokeDashoffset={-t * 120} opacity={ap(t, W(78) - 0.1)} />
          </svg>
          {Array.from({length: 5}, (_, i) => {
            const u = ((t - W(78)) * 0.9 + i * 0.2) % 1;
            if (t < W(78)) return null;
            return <Avatar key={i} i={i} size={70} style={{position: 'absolute', left: lerp(300, 720, u), top: 340, opacity: Math.sin(u * Math.PI)}} />;
          })}
          {/* leads land in WhatsApp */}
          <div style={{position: 'absolute', left: 120, right: 120, top: 560, borderRadius: 40, background: '#0B141A', padding: '24px 26px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: `2px solid ${C.wa}`, opacity: ap(t, W(80) - 0.1)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16}}>
              <Img src={icon('whatsapp-icon.svg')} style={{width: 50, height: 50}} />
              <div style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#E9EDEF'}}>New leads</div>
              <div style={{minWidth: 54, height: 50, borderRadius: 26, background: C.wa, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 28, color: '#05210f', padding: '0 12px'}}>{leads}</div>
            </div>
            {Array.from({length: 4}, (_, i) => {
              const p = sp(t, W(82) - 0.15 + i * 0.22, 420, 18);
              if (p <= 0) return null;
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: m1(p * 2), transform: `translateY(${(1 - m1(p)) * -30}px)`}}>
                  <Avatar i={i + 2} size={66} />
                  <div style={{flex: 1}}>
                    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#E9EDEF'}}>{NAMES[(i + 2) % NAMES.length]}</div>
                    <div style={{fontFamily: SANS, fontSize: 22, color: '#8696A0'}}>Interested · Reel comment se</div>
                  </div>
                  <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 22, color: C.ink, background: C.lime, borderRadius: 999, padding: '8px 16px'}}>LEAD</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Shot>
  );
};

// ---------------------------------------------------------------- 7. CTA: comment "DM" and see how fast the reply comes
const Cta: React.FC<{t: number}> = ({t}) => {
  const [a, b] = SC.cta;
  const typed = 'DM'.slice(0, Math.max(0, Math.min(2, Math.floor((t - W(92) + 0.1) / 0.12))));
  const posted = sp(t, W(93) - 0.1, 420, 16);
  const notif = sp(t, W(96) - 0.1, 360, 16);
  const pulse = 1 + 0.06 * Math.sin(t * 8);
  return (
    <Shot t={t} s={[a, b]} dir={-1}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.cream, letterSpacing: '-0.03em', transform: `scale(${lerp(1.4, 1, m1(sp(t, W(87) - 0.06, 420, 16)))})`}}>Yeh setup</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 130, ...limeText, lineHeight: 1, opacity: ap(t, W(89) - 0.06)}}>chahiye?</div>
      </div>
      {/* the comment box */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 640, borderRadius: 40, background: '#fff', padding: '26px 30px', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', transform: `scale(${lerp(0.7, 1, m1(sp(t, W(90) - 0.12, 320, 18)))})`, opacity: ap(t, W(90) - 0.12)}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: '#888', marginBottom: 14}}>Comments</div>
        {posted > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, transform: `scale(${lerp(0.6, 1, m1(posted))})`, transformOrigin: '0 50%'}}>
            <Avatar i={4} size={70} />
            <div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#111'}}>you</div>
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#111', letterSpacing: '-0.02em'}}>DM</div>
            </div>
            <Ico n="red_heart.png" size={44} style={{marginLeft: 'auto'}} />
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, background: '#F2F2F2', borderRadius: 999, padding: '16px 26px'}}>
          <span style={{flex: 1, fontFamily: SANS, fontWeight: 900, fontSize: 56, color: posted > 0 ? '#bbb' : '#111'}}>
            {posted > 0 ? 'Add a comment…' : typed}
            {posted <= 0 && <span style={{color: '#0095F6', opacity: Math.sin(t * 14) > 0 ? 1 : 0}}>|</span>}
          </span>
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#0095F6'}}>Post</span>
        </div>
      </div>
      <Ico n="backhand_index_pointing_down.png" size={130} style={{position: 'absolute', left: 475, top: 500 + Math.sin(t * 6) * 14, opacity: posted > 0 ? 0 : ap(t, W(90))}} />
      {/* the instant reply */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1080, display: 'flex', alignItems: 'center', gap: 18, borderRadius: 30, background: 'rgba(30,30,34,0.96)', border: `2px solid ${C.lime}`, padding: '20px 24px', boxShadow: '0 0 60px rgba(200,255,62,0.25)', transform: `translateY(${(1 - m1(notif)) * -120}px) scale(${notif > 0.9 ? pulse : 1})`, opacity: m1(notif * 2)}}>
        <div style={{width: 74, height: 74, borderRadius: 74, background: '#0A0A0A', display: 'grid', placeItems: 'center', border: `2px solid ${C.lime}`}}>
          <Img src={staticFile('brand/nx-logo.png')} style={{width: 54, height: 39}} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>Neuraxine sent you a message</div>
          <div style={{fontFamily: SANS, fontSize: 24, color: C.dim}}>Hi! 👋 Yeh rahi details… · now</div>
        </div>
        <InstaMark size={54} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1260, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: ap(t, W(97) - 0.05)}}>
        <Ico n="high_voltage.png" size={80} />
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, ...limeText}}>reply in seconds</span>
      </div>
    </Shot>
  );
};

// ---------------------------------------------------------------- captions (voice-over), only where the graphic doesn't already say it
const LIME_W = new Set(['viral', 'comments', 'comment', 'customer', 'automation', 'automatic', 'dm', 'whatsapp', 'lead', 'reply', 'setup', 'interested', 'turant']);
const RED_W = new Set(['zero', 'sales', 'manually', 'khareed', 'nahi', 'problem']);
const CAP_OFF: [number, number][] = [
  [0, W(7) - 0.12], // the hook graphic carries the words
  [W(39) - 0.12, W(50) - 0.12], // kinetic "content / reply"
  [W(87) - 0.12, W(90) - 0.12], // "Yeh setup chahiye?" is on screen
];
type Chunk = {words: Word[]; s: number; e: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const chars = cur.map((x) => x.w).join(' ').length + (nx ? nx.w.length + 1 : 0);
    if (/[.,?!…"]$/.test(w.w) || cur.length >= 3 || !nx || nx.s - w.e > 0.3 || chars > 20) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.4)));
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  if (CAP_OFF.some(([a, b]) => t >= a && t < b)) return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const len = c.words.map((w) => w.w).join(' ').length;
  const fit = Math.max(0.66, Math.min(1, 16 / Math.max(1, len)));
  const cur = c.words.reduce((n, w, i) => (t >= w.s - 0.03 ? i : n), -1);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: 1600, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', columnGap: 30}}>
      {c.words.map((w, i) => {
        const k = key(w.w);
        const on = i === cur;
        const seen = i <= cur;
        const wp = sp(t, w.s - 0.04, 520, 18);
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 900, fontSize: 78 * fit, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1.1, whiteSpace: 'nowrap', display: 'inline-block', ...(seen ? (RED_W.has(k) ? redText : LIME_W.has(k) ? limeText : {color: '#fff'}) : {color: 'rgba(255,255,255,0.4)'}), transform: `scale(${on ? lerp(1.3, 1.06, m1(wp)) : 1})`, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.9))'}}>
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a - 0.2) return null;
  const r = t - a;
  return (
    <AbsoluteFill style={{opacity: pt(t, a - 0.2, a + 0.1)}}>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(0.7, 1, m1(sp(t, a, 200, 14)))})`}}>
        <Img src={staticFile('brand/nx-logo.png')} style={{width: 400, height: 291, filter: 'drop-shadow(0 0 50px rgba(200,255,62,0.35))'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: '0.08em', paddingLeft: '0.08em', ...silverText, opacity: pt(r, 0.1, 0.45)}}>NEURAXINE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', opacity: pt(r, 0.3, 0.7)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 40px', borderRadius: 999, background: LIME_GRAD, fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.ink}}>
          Comment &ldquo;DM&rdquo; for details
        </div>
      </div>
      <Ico n="backhand_index_pointing_down.png" size={120} style={{position: 'absolute', left: 480, top: 1080 + Math.sin(t * 6) * 14, opacity: pt(r, 0.5, 0.8)}} />
    </AbsoluteFill>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
      </filter>
      <rect width={1080} height={1920} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = Math.max(0, ...CUTS.map((c) => 1 - Math.min(1, Math.abs(t - c) / 0.05)));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Hook t={t} />
      <Customer t={t} />
      <Manual t={t} />
      <Truth t={t} />
      <Auto t={t} />
      <Lead t={t} />
      <Cta t={t} />
      {t < edit.speech && <Captions t={t} />}
      <AbsoluteFill style={{background: C.lime, opacity: flash * 0.16, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <EndCard t={t} />
      <Grain frame={frame} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 62%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} volume={0.45} />}
    </AbsoluteFill>
  );
};
