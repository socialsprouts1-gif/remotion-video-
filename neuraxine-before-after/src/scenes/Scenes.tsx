import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Stage} from '../three/Stage';
import {Card3D, Logo3D, Moon3D, Phone, Shadow, Tile3D} from '../three/kit';
import {Bg, Chip, Ico} from '../components/ui';
import {BrandIcon} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);
const POSE = {y: -0.22, s: 0.86};
const GLASS: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(30,36,32,0.92), rgba(9,11,10,0.94))',
  border: '1px solid rgba(181,241,42,0.22)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
};
const COLD: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(40,46,52,0.94), rgba(18,21,24,0.95))',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
};
const pop = (f: number, at: number, dur = 20) => {
  const k = prog(f, at, dur, ease.out);
  return {k, ry: mix(k, Math.PI * 1.1, 0) + Math.sin(f / 32) * 0.14, dy: mix(k, -0.6, 0) + Math.sin(f / 26) * 0.03, s: mix(k, 0.2, 1)};
};
const Label: React.FC<{show: number; red?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({show, red, children, style}) => (
  <div style={{position: 'absolute', padding: '12px 24px', borderRadius: 999, fontFamily: F.display, fontWeight: 800, fontSize: 28, letterSpacing: '0.08em', whiteSpace: 'nowrap', color: red ? '#FFB3B3' : '#0A1200', background: red ? 'rgba(255,92,92,0.14)' : 'linear-gradient(140deg, #D4FF6B, #B5F12A)', border: red ? '1.5px solid rgba(255,92,92,0.5)' : undefined, opacity: show, transform: `translateY(${(1 - show) * 20}px)`, ...style}}>
    {children}
  </div>
);

/* ---------------- hook: two days, side by side ---------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const before = fr(wordAt('hook', 1, 'bina'));
  const after = fr(wordAt('hook', 1, 'neuraxine'));
  const inL = prog(f, 4, 26, ease.out);
  const inR = prog(f, 12, 26, ease.out);
  const focusL = prog(f, before - 4, 12, ease.out) * (1 - prog(f, after - 4, 12, ease.out));
  const focusR = prog(f, after - 4, 12, ease.out);
  const shake = Math.sin(f * 2.1) * 0.02 * (f % 40 < 14 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Bg mode="after" />
      <AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
        <Bg mode="before" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 539, top: 520, width: 2, height: 1000, background: 'linear-gradient(180deg, transparent, rgba(242,245,239,0.25), transparent)'}} />
      <div style={{position: 'absolute', left: 540 - 46, top: 1010, width: 92, height: 92, borderRadius: 99, background: '#0B0E0C', border: '2px solid rgba(181,241,42,0.5)', color: '#F2F5EF', display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 32, opacity: prog(f, 20, 12), zIndex: 2}}>VS</div>
      <Stage>
        <group position={[-0.5, mix(inL, -3, -0.2), 0]} rotation={[-0.05, 0.3, shake]} scale={0.64 * (1 + focusL * 0.06)}>
          <Phone screen="tex/flood.png" />
        </group>
        <group position={[0.5, mix(inR, -3, -0.2), 0]} rotation={[-0.05, -0.3 + Math.sin(f / 50) * 0.04, 0]} scale={0.64 * (1 + focusR * 0.06)}>
          <Phone screen="tex/ai.png" />
        </group>
        <Shadow position={[-0.5, -0.95, -0.2]} w={1.3} d={0.4} opacity={inL} />
        <Shadow position={[0.5, -0.95, -0.2]} w={1.3} d={0.4} opacity={inR} />
      </Stage>
      <Label red show={prog(f, before - 6, 12, ease.out)} style={{left: 40, top: 1470}}>BINA AUTOMATION</Label>
      <Label show={prog(f, after - 6, 12, ease.out)} style={{right: 40, top: 1470}}>NEURAXINE</Label>
    </AbsoluteFill>
  );
};

/* ---------------- before 1: 9 AM flood ---------------- */
const RAIN = ['Price kya hai?', 'Sofa ka rate?', 'Hello?? Reply karo', 'Location bhejo', 'Catalogue milega?', 'Discount hai?', 'Koi hai?', 'Delivery kab tak?'];
export const B1: React.FC = () => {
  const f = useCurrentFrame();
  const nine = fr(wordAt('b1', 0, '9'));
  const fifty = fr(wordAt('b1', 0, '50'));
  const price = fr(wordAt('b1', 0, 'price'));
  const enter = prog(f, 0, 24, ease.out);
  const buzz = f % 18 < 6 ? Math.sin(f * 3) * 0.025 : 0;
  const count = Math.round(prog(f, fifty - 6, 40, ease.out) * 50);
  const clk = pop(f, nine - 6, 18);
  return (
    <AbsoluteFill>
      <Bg mode="before" />
      <Stage>
        <group position={[0, mix(enter, -3, POSE.y), 0]} rotation={[-0.06, 0.22, buzz]} scale={POSE.s}>
          <Phone screen="tex/flood.png" />
        </group>
        <Shadow position={[0, -1.18, -0.2]} w={1.9} d={0.5} opacity={0.8} />
        {clk.k > 0 && <Tile3D img="tex/clock.png" size={0.34} d={0.09} position={[-0.66, 0.78 + clk.dy * 0.3, 0.45]} rotation={[0.08, clk.ry * 0.5 + 0.3, 0]} scale={clk.s} />}
      </Stage>
      <Chip show={prog(f, nine, 12, ease.out)} style={{left: 40, top: 690, fontSize: 32}}>9:00 AM</Chip>
      {/* notifications raining in from the sides */}
      {RAIN.map((t, i) => {
        const at = price - 30 + i * 7;
        const p = prog(f, at, 14, ease.out);
        if (p <= 0) return null;
        const left = i % 2 === 0;
        return (
          <div key={t} style={{position: 'absolute', [left ? 'left' : 'right']: 30, top: 820 + (i >> 1) * 150, opacity: p * 0.95, transform: `translateX(${(1 - p) * (left ? -300 : 300)}px) rotate(${left ? -3 : 3}deg)`}}>
            <div style={{...COLD, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px 12px 12px', borderRadius: 20, fontFamily: F.body}}>
              <BrandIcon name="whatsapp" size={40} />
              <span style={{color: '#E6EBE3', fontWeight: 600, fontSize: 24}}>{t}</span>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 50, top: 680, padding: '12px 22px', borderRadius: 999, background: C.red, color: '#fff', fontFamily: F.display, fontWeight: 900, fontSize: 40, opacity: prog(f, fifty - 6, 10), transform: `scale(${1 + Math.sin(f / 3) * 0.03})`, boxShadow: '0 0 40px rgba(255,92,92,0.5)'}}>{count} unread</div>
    </AbsoluteFill>
  );
};

/* ---------------- before 2: lunchtime, leads leave ---------------- */
const LEADS = ['Rahul', 'Priya', 'Amit', 'Neha', 'Sana', 'Vikram'];
export const B2: React.FC = () => {
  const f = useCurrentFrame();
  const noon = fr(wordAt('b2', 0, 'dopahar'));
  const leave = fr(wordAt('b2', 0, 'competitor'));
  return (
    <AbsoluteFill>
      <Bg mode="before" />
      <Stage>
        <group position={[-0.32, POSE.y, 0]} rotation={[-0.06, 0.3 + Math.sin(f / 60) * 0.04, 0]} scale={0.8}>
          <Phone screen="tex/unread.png" />
        </group>
        <Shadow position={[-0.32, -1.12, -0.2]} w={1.7} d={0.45} opacity={0.8} />
      </Stage>
      <Chip show={prog(f, noon - 4, 12, ease.out)} icon={<Ico.cal s={28} />} style={{left: 40, top: 560, fontSize: 30}}>1:30 PM · abhi bhi replying…</Chip>
      {/* the waiting leads; half of them walk off to a competitor */}
      {LEADS.map((n, i) => {
        const p = prog(f, 10 + i * 5, 14, ease.out);
        const lost = i % 2 === 1;
        const go = lost ? prog(f, leave - 6 + i * 3, 22, ease.in) : 0;
        return (
          <div key={n} style={{position: 'absolute', right: 40, top: 700 + i * 120, opacity: p * (1 - go * 0.9), transform: `translateX(${(1 - p) * 200 + go * 420}px)`}}>
            <div style={{...COLD, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px 10px 10px', borderRadius: 999, fontFamily: F.body, border: lost && f > leave - 8 ? '1.5px solid rgba(255,92,92,0.6)' : COLD.border}}>
              <div style={{width: 52, height: 52, borderRadius: 99, background: '#2B3238', color: '#E6EBE3', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{n[0]}</div>
              <span style={{color: '#E6EBE3', fontWeight: 700, fontSize: 25, width: 92}}>{n}</span>
              <span style={{fontWeight: 800, fontSize: 20, color: lost && f > leave - 8 ? C.red : '#8E978F'}}>{lost && f > leave - 8 ? 'LOST' : 'waiting'}</span>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 40, top: 1440, padding: '12px 22px', borderRadius: 999, border: '1.5px solid rgba(255,92,92,0.5)', background: 'rgba(255,92,92,0.12)', opacity: prog(f, leave, 14), fontFamily: F.display, fontWeight: 800, fontSize: 30, color: '#FFB3B3', transform: `translateX(${(1 - prog(f, leave, 14, ease.out)) * 60}px)`}}>→ Competitor ke paas</div>
    </AbsoluteFill>
  );
};

/* ---------------- before 3: night, exhausted ---------------- */
export const B3: React.FC = () => {
  const f = useCurrentFrame();
  const again = fr(wordAt('b3', 0, 'kal'));
  const lie = prog(f, 6, 40, ease.inOut);
  const moon = pop(f, 4, 26);
  return (
    <AbsoluteFill>
      <Bg mode="before" intensity={0.5} />
      <Stage>
        <group position={[0, mix(lie, -0.2, -0.45), 0]} rotation={[mix(lie, -0.06, -1.05), mix(lie, 0.2, 0.05), mix(lie, 0, 0.15)]} scale={0.86}>
          <Phone screen="tex/night_b.png" />
        </group>
        {moon.k > 0 && <Moon3D color="#9AA6B2" position={[0.6, 0.78 + moon.dy * 0.3, 0.3]} rotation={[0.1, moon.ry * 0.4, -0.4]} scale={0.34 * moon.s} />}
      </Stage>
      <Chip show={prog(f, 20, 12, ease.out)} icon={<Ico.moon s={28} />} style={{left: 40, top: 640, fontSize: 28}}>11:48 PM · 23 unread</Chip>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 1420 + i * 70, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: `rgba(242,245,239,${0.5 - i * 0.16})`, opacity: prog(f, again + i * 5, 10), filter: `blur(${i * 1.5}px)`}}>
          Kal phir wahi.
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- switch: the same day, with Neuraxine ---------------- */
export const Switch: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = prog(f, 8, 34, ease.inOut);
  const tile = pop(f, 6, 26);
  const ring = prog(f, 10, 40, ease.out);
  return (
    <AbsoluteFill>
      <Bg mode="before" intensity={0.5} />
      <AbsoluteFill style={{clipPath: `circle(${wipe * 140}% at 50% 52%)`}}>
        <Bg mode="after" intensity={1.3} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - 600 * ring, top: 1000 - 600 * ring, width: 1200 * ring, height: 1200 * ring, borderRadius: '50%', border: `${6 * (1 - ring) + 1}px solid rgba(181,241,42,${0.8 * (1 - ring)})`, boxShadow: `0 0 60px rgba(181,241,42,${0.5 * (1 - ring)})`}} />
      <Stage>
        {tile.k > 0 && <Card3D img="tex/nx.png" w={1.0} h={1.0} r={0.22} d={0.22} position={[0, 0.08 + tile.dy * 0.4, 0.3]} rotation={[0.06, tile.ry, 0]} scale={tile.s} />}
        <Shadow position={[0, -0.62, 0]} w={1.4} d={0.4} opacity={tile.k * 0.8} />
      </Stage>
      <div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 72, letterSpacing: '0.06em', color: '#F2F5EF', opacity: prog(f, 30, 14), textShadow: '0 0 40px rgba(181,241,42,0.35)'}}>
        NEURAXINE <span style={{color: C.lime}}>MODE</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- after 1: instant AI replies ---------------- */
export const A1: React.FC = () => {
  const f = useCurrentFrame();
  const three = fr(wordAt('a1', 0, '3 second'));
  const items = ['price', 'catalogue', 'location'].map((w) => fr(wordAt('a1', 0, w)));
  const enter = prog(f, 0, 26, ease.out);
  const wa = pop(f, 8, 22);
  return (
    <AbsoluteFill>
      <Bg mode="after" />
      <Stage>
        <group position={[0.18, mix(enter, -3, POSE.y), 0]} rotation={[-0.06, -0.25 + Math.sin(f / 55) * 0.04, 0]} scale={POSE.s}>
          <Phone screen="tex/ai.png" />
        </group>
        <Shadow position={[0.18, -1.18, -0.2]} w={1.9} d={0.5} opacity={enter * 0.9} />
        {wa.k > 0 && <Logo3D url="icons/whatsapp-icon.svg" size={0.5} depth={0.08} position={[0.62, 0.86 + wa.dy * 0.3, 0.4]} rotation={[0, wa.ry, 0]} scale={wa.s} />}
      </Stage>
      <Chip gold show={prog(f, three - 4, 12, ease.out)} icon={<Ico.bolt s={28} />} style={{left: 40, top: 660, fontSize: 32}}>Reply in 3 sec</Chip>
      {['Price', 'Catalogue', 'Location'].map((t, i) => (
        <Chip key={t} show={prog(f, items[i] - 2, 12, ease.out)} icon={<Ico.check s={26} />} style={{left: 40, top: 820 + i * 120}}>
          {t}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- after 2: CRM + calendar ---------------- */
const ROWS = [
  {n: 'Rahul Sharma', s: 'Hot lead', t: '3-seater sofa'},
  {n: 'Priya Verma', s: 'Booked', t: 'Showroom visit'},
  {n: 'Amit Verma', s: 'New', t: 'Dining set'},
];
export const A2: React.FC = () => {
  const f = useCurrentFrame();
  const crm = fr(wordAt('a2', 0, 'crm'));
  const cal = fr(wordAt('a2', 0, 'calendar'));
  const card = prog(f, 6, 22, ease.out);
  const tile = pop(f, cal - 10, 22);
  return (
    <AbsoluteFill>
      <Bg mode="after" />
      <div style={{position: 'absolute', left: 80, right: 80, top: 520, opacity: card, transform: `perspective(1600px) rotateX(${mix(card, 16, 4)}deg) translateY(${(1 - card) * 70}px)`}}>
        <div style={{...GLASS, borderRadius: 32, padding: '26px 28px', fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 54, height: 54, borderRadius: 14, overflow: 'hidden'}}>
              <Img src={staticFile('brand/nx.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5)'}} />
            </div>
            <div style={{flex: 1, fontFamily: F.display, fontWeight: 800, fontSize: 34, color: '#F2F5EF'}}>Leads CRM</div>
            <div style={{padding: '8px 16px', borderRadius: 999, background: 'rgba(76,214,142,0.15)', color: '#4CD68E', fontWeight: 800, fontSize: 22}}>● Live</div>
          </div>
          {ROWS.map((r, i) => {
            const p = prog(f, crm - 8 + i * 7, 14, ease.out);
            const hot = r.s === 'Hot lead' || r.s === 'Booked';
            return (
              <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0 4px', marginTop: 10, borderTop: '1px solid rgba(242,245,239,0.08)', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <div style={{width: 54, height: 54, borderRadius: 99, background: C.limeSoft, color: C.lime, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{r.n[0]}</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 700, fontSize: 28, color: '#F2F5EF'}}>{r.n}</div>
                  <div style={{fontSize: 22, color: '#8E978F'}}>{r.t}</div>
                </div>
                <div style={{padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 21, background: hot ? C.lime : 'rgba(242,245,239,0.08)', color: hot ? '#0A1200' : '#8E978F'}}>{r.s}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Stage>
        {tile.k > 0 && <Card3D img="tex/cal.png" w={0.62} h={0.62} r={0.09} d={0.18} position={[-0.5, -0.78 + tile.dy * 0.3, 0.4]} rotation={[0.05, tile.ry * 0.6 + 0.3, 0]} scale={tile.s} />}
      </Stage>
      <Chip gold show={prog(f, cal + 4, 12, ease.out)} icon={<Ico.check s={28} />} style={{right: 60, top: 1300, fontSize: 28}}>Booked · Kal 11:00 AM</Chip>
    </AbsoluteFill>
  );
};

/* ---------------- after 3: follow-ups, deals closed ---------------- */
const STEPS = [
  {url: 'icons/whatsapp-icon.svg', x: -0.66, label: 'Day 1', sub: 'WhatsApp'},
  {url: 'icons/google-gmail.svg', x: 0, label: 'Day 3', sub: 'Email'},
  {url: 'icons/whatsapp-icon.svg', x: 0.66, label: 'Day 5', sub: 'Offer'},
];
export const A3: React.FC = () => {
  const f = useCurrentFrame();
  const deals = fr(wordAt('a3', 0, 'deals'));
  const line = prog(f, 14, 50, ease.inOut);
  const deal = prog(f, deals - 4, 16, ease.out);
  return (
    <AbsoluteFill>
      <Bg mode="after" />
      <div style={{position: 'absolute', left: 200, right: 200, top: 755, height: 4, borderRadius: 4, background: 'rgba(242,245,239,0.1)'}}>
        <div style={{width: `${line * 100}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #7CC514, #D4FF6B)', boxShadow: '0 0 16px rgba(181,241,42,0.5)'}} />
      </div>
      <Stage>
        {STEPS.map((s, i) => {
          const sp = pop(f, 10 + i * 14, 20);
          if (sp.k <= 0) return null;
          return <Logo3D key={i} url={s.url} size={0.46} depth={0.08} position={[s.x, 0.4 + sp.dy * 0.3, 0.3]} rotation={[0, sp.ry, 0]} scale={sp.s} />;
        })}
      </Stage>
      {STEPS.map((s, i) => {
        const p = prog(f, 18 + i * 14, 12, ease.out);
        return (
          <div key={i} style={{position: 'absolute', top: 960, left: 540 + s.x * 512 - 150, width: 300, textAlign: 'center', fontFamily: F.body, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
            <div style={{fontWeight: 800, fontSize: 32, color: C.lime}}>{s.label}</div>
            <div style={{fontWeight: 600, fontSize: 25, color: '#8E978F', marginTop: 2}}>{s.sub} · auto</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 140, right: 140, top: 1140, opacity: deal, transform: `scale(${mix(deal, 0.85, 1)})`}}>
        <div style={{...GLASS, borderRadius: 30, padding: '26px 30px', display: 'flex', alignItems: 'center', gap: 20, border: '1.5px solid rgba(181,241,42,0.6)', boxShadow: `0 0 60px rgba(181,241,42,0.25), ${GLASS.boxShadow}`}}>
          <div style={{width: 76, height: 76, borderRadius: 22, background: C.lime, color: '#0A1200', display: 'grid', placeItems: 'center'}}>
            <Ico.check s={44} />
          </div>
          <div style={{flex: 1, fontFamily: F.body}}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, color: '#F2F5EF'}}>Deal closed</div>
            <div style={{fontSize: 24, color: '#8E978F'}}>Rahul Sharma · 3-seater sofa</div>
          </div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.lime}}>₹24,999</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- after 4: night, still running ---------------- */
export const A4: React.FC = () => {
  const f = useCurrentFrame();
  const run = fr(wordAt('a4', 0, 'chal'));
  const enter = prog(f, 0, 26, ease.out);
  const moon = pop(f, 6, 24);
  return (
    <AbsoluteFill>
      <Bg mode="after" intensity={0.7} />
      <Stage>
        <group position={[0, mix(enter, -3, POSE.y), 0]} rotation={[-0.06, 0.24 + Math.sin(f / 55) * 0.04, 0]} scale={POSE.s}>
          <Phone screen="tex/night_a.png" />
        </group>
        <Shadow position={[0, -1.18, -0.2]} w={1.9} d={0.5} opacity={enter * 0.9} />
        {moon.k > 0 && <Moon3D color="#C8F55A" position={[0.66, 0.8 + moon.dy * 0.3, 0.35]} rotation={[0.1, moon.ry * 0.4, -0.4]} scale={0.34 * moon.s} />}
      </Stage>
      <Chip show={prog(f, 16, 12, ease.out)} icon={<Ico.moon s={28} />} style={{left: 40, top: 680, fontSize: 28}}>1:12 AM · aap so rahe ho</Chip>
      <Chip gold show={prog(f, run - 4, 12, ease.out)} icon={<Ico.check s={28} />} style={{left: 40, top: 1300, fontSize: 28}}>Order #2316 confirmed</Chip>
    </AbsoluteFill>
  );
};

/* ---------------- compare ---------------- */
const PAIRS = [
  ['late', 'Late reply', 'instant', 'Instant reply'],
  ['khoye', 'Khoye hue leads', 'saved', 'Saved leads'],
  ['tension', 'Tension', 'sukoon', 'Sukoon'],
];
export const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const head = prog(f, 4, 16, ease.out);
  return (
    <AbsoluteFill>
      <Bg mode="after" />
      <AbsoluteFill style={{clipPath: 'inset(0 50% 0 0)'}}>
        <Bg mode="before" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 539, top: 520, width: 2, height: 1000, background: 'linear-gradient(180deg, transparent, rgba(242,245,239,0.25), transparent)'}} />
      <div style={{position: 'absolute', left: 0, width: 540, top: 560, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 46, letterSpacing: '0.12em', color: '#FFB3B3', opacity: head}}>PEHLE</div>
      <div style={{position: 'absolute', left: 540, width: 540, top: 560, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 46, letterSpacing: '0.12em', color: C.lime, opacity: head, textShadow: '0 0 30px rgba(181,241,42,0.35)'}}>AB</div>
      {PAIRS.map(([wl, tl, wr, tr], i) => {
        const pl = prog(f, fr(wordAt('compare', 0, wl)) - 4, 12, ease.out);
        const pr = prog(f, fr(wordAt('compare', 0, wr)) - 4, 12, ease.out);
        const top = 700 + i * 220;
        return (
          <React.Fragment key={wl}>
            <div style={{position: 'absolute', left: 40, width: 460, top, opacity: pl, transform: `translateX(${(1 - pl) * -60}px)`}}>
              <div style={{...COLD, borderRadius: 26, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body}}>
                <div style={{width: 58, height: 58, borderRadius: 16, background: 'rgba(255,92,92,0.16)', color: C.red, display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 800}}>×</div>
                <span style={{color: '#C9CFD4', fontWeight: 700, fontSize: 32}}>{tl}</span>
              </div>
            </div>
            <div style={{position: 'absolute', right: 40, width: 460, top, opacity: pr, transform: `translateX(${(1 - pr) * 60}px)`}}>
              <div style={{...GLASS, borderRadius: 26, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, border: '1.5px solid rgba(181,241,42,0.5)'}}>
                <div style={{width: 58, height: 58, borderRadius: 16, background: C.lime, color: '#0A1200', display: 'grid', placeItems: 'center'}}>
                  <Ico.check s={34} />
                </div>
                <span style={{color: '#F2F5EF', fontWeight: 800, fontSize: 32}}>{tr}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- CTA ---------------- */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const auto = fr(wordAt('cta', 0, 'automate'));
  const follow = fr(wordAt('cta', 1, 'follow'));
  const end = fr(cue('cta', 1, 'end'));
  const phoneIn = prog(f, 0, 26, ease.out);
  const phoneOut = prog(f, end, 16, ease.in);
  const typeP = prog(f, auto - 26, 22, (x) => x);
  const typed = BRAND.keyword.slice(0, Math.round(typeP * BRAND.keyword.length));
  const sent = prog(f, auto, 8);
  const followed = prog(f, follow, 6);
  const press = prog(f, follow - 3, 3) * (1 - prog(f, follow + 1, 6));
  const lock = pop(f, end + 4, 26);
  const txt = prog(f, end + 18, 16, ease.out);
  return (
    <AbsoluteFill>
      <Bg mode="after" intensity={1.1} />
      <Stage>
        <group position={[0, mix(phoneIn, -3, -0.2) - phoneOut * 3, 0]} rotation={[-0.06, mix(phoneIn, -1, -0.2) + Math.sin(f / 50) * 0.05, 0]} scale={0.82}>
          <Phone screen="screens/profile.png" />
        </group>
        {lock.k > 0 && <Card3D img="tex/nx.png" w={1.0} h={1.0} r={0.22} d={0.22} position={[0, 0.5 + lock.dy * 0.4, 0.2]} rotation={[0.06, lock.ry, 0]} scale={lock.s} />}
      </Stage>
      {/* comment AUTOMATE */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1240, opacity: prog(f, auto - 30, 12, ease.out) * (1 - phoneOut), transform: `translateY(${(1 - prog(f, auto - 30, 12, ease.out)) * 40}px)`}}>
        <div style={{...GLASS, borderRadius: 28, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14}}>
          <BrandIcon name="instagram" size={44} />
          <div style={{flex: 1, height: 70, borderRadius: 999, border: '1.5px solid rgba(242,245,239,0.16)', display: 'flex', alignItems: 'center', paddingLeft: 26, fontFamily: F.display, fontWeight: 800, fontSize: 34, color: sent > 0.5 ? C.lime : '#F2F5EF'}}>
            {typed || <span style={{color: '#5A615B', fontFamily: F.body, fontWeight: 500, fontSize: 27}}>Add a comment…</span>}
          </div>
          <div style={{width: 70, height: 70, borderRadius: 99, background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${sent > 0 && sent < 1 ? 0.9 : 1})`}}>
            <svg width={30} height={30} viewBox="0 0 24 24"><path d="M3 11.5L21 3l-7.5 18-2.6-7.4z" fill="#0A1200" /></svg>
          </div>
        </div>
      </div>
      {/* follow */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center', opacity: prog(f, follow - 24, 12, ease.out) * (1 - phoneOut)}}>
        <div style={{...GLASS, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px 12px 22px', borderRadius: 999, fontFamily: F.body}}>
          <span style={{fontWeight: 800, fontSize: 30, color: '#F2F5EF'}}>@{BRAND.handle}</span>
          <span style={{padding: '12px 28px', borderRadius: 999, background: followed > 0.5 ? 'rgba(242,245,239,0.1)' : C.lime, color: followed > 0.5 ? '#F2F5EF' : '#0A1200', fontWeight: 800, fontSize: 28, transform: `scale(${1 - press * 0.1})`}}>{followed > 0.5 ? 'Following ✓' : 'Follow'}</span>
        </div>
      </div>
      {/* lockup */}
      <div style={{position: 'absolute', top: 1190, left: 0, right: 0, textAlign: 'center', opacity: txt, transform: `translateY(${(1 - txt) * 30}px)`}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 104, letterSpacing: '0.03em', color: '#F2F5EF'}}>{BRAND.name}</div>
        <div style={{marginTop: 6, fontFamily: F.body, fontWeight: 700, fontSize: 27, letterSpacing: '0.46em', marginRight: '-0.46em', color: C.lime}}>{BRAND.tagline}</div>
        <div style={{marginTop: 34, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: '#8E978F'}}>{BRAND.site}</div>
      </div>
    </AbsoluteFill>
  );
};
