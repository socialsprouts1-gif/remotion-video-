import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, cue, wordAt} from '../config';
import {F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Stage} from '../three/Stage';
import {Bulb, Card3D, ChessKing, ChessPawn, Hourglass, Logo3D, Moon3D, Phone, Shadow, Trophy} from '../three/kit';
import {Body, COND, Dark, E, FilmStrip, Paper, Pills, SelectBox, Tape} from '../components/editorial';
import {BrandIcon} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);
/** Pop for 3D props: rises, turns to face camera, settles with a slow float. */
const pop = (f: number, at: number, dur = 22) => {
  const k = prog(f, at, dur, ease.out);
  return {k, ry: mix(k, Math.PI * 0.9, 0) + Math.sin(f / 34) * 0.12, dy: mix(k, -0.7, 0) + Math.sin(f / 28) * 0.025, s: mix(k, 0.3, 1)};
};
const P = {y: -0.08, s: 0.78};
// phone selection box in screen px for the pose above
const PHONE_BOX = {x: 320, y: 570, w: 440, h: 860};

/* ---------------- hook: two days (dark, split rim light) ---------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const before = fr(wordAt('hook', 1, 'bina'));
  const after = fr(wordAt('hook', 1, 'neuraxine'));
  const l = pop(f, 2, 30);
  const r = pop(f, 10, 30);
  const vs = prog(f, 22, 12, ease.out);
  return (
    <AbsoluteFill>
      <Dark mood="after" split />
      <Stage>
        <group position={[-0.46, -0.1 + l.dy * 0.4, 0]} rotation={[-0.05, 0.38 + l.ry * 0.5, 0.06]} scale={0.6 * l.s}>
          <Phone screen="tex/flood.png" />
        </group>
        <group position={[0.46, -0.1 + r.dy * 0.4, 0]} rotation={[-0.05, -0.38 - r.ry * 0.5, -0.06]} scale={0.6 * r.s}>
          <Phone screen="tex/ai.png" />
        </group>
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', ...COND, fontSize: 120, color: '#F2F2F2', opacity: vs, transform: `scale(${mix(vs, 1.6, 1)})`}}>vs</div>
      <div style={{position: 'absolute', left: 50, top: 1480, ...COND, fontSize: 58, color: E.redDark, opacity: prog(f, before - 6, 12)}}>BINA AUTOMATION</div>
      <div style={{position: 'absolute', right: 50, top: 1480, ...COND, fontSize: 58, color: E.lime, opacity: prog(f, after - 6, 12), textAlign: 'right'}}>NEURAXINE</div>
    </AbsoluteFill>
  );
};

/* ---------------- before 1: 9 AM flood (paper) ---------------- */
export const B1: React.FC = () => {
  const f = useCurrentFrame();
  const fifty = fr(wordAt('b1', 0, '50'));
  const price = fr(wordAt('b1', 0, 'price'));
  const ph = pop(f, 0, 26);
  const buzz = f % 18 < 6 ? Math.sin(f * 3) * 0.02 : 0;
  const count = Math.round(prog(f, fifty - 6, 36, ease.out) * 50);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 1000, r: 400}} />
      <Stage>
        <group position={[0, P.y + ph.dy * 0.4, 0]} rotation={[-0.04, 0.18 + ph.ry * 0.4, buzz]} scale={P.s * ph.s}>
          <Phone screen="tex/flood.png" />
        </group>
        <Shadow position={[0, -1.02, -0.2]} w={1.8} d={0.45} opacity={ph.k * 0.7} />
      </Stage>
      <SelectBox {...PHONE_BOX} show={prog(f, 18, 12, ease.out)} />
      <Pills style={{left: 40, right: 40, top: 1450}} items={[
        {label: 'Price kya hai?', at: price - 4, tone: 'red'},
        {label: 'Location?', at: price + 2, tone: 'violet'},
        {label: 'Catalogue?', at: price + 8, tone: 'green'},
      ]} />
      <div style={{position: 'absolute', right: 70, top: 640, textAlign: 'right', opacity: prog(f, fifty - 6, 10)}}>
        <div style={{...COND, fontSize: 150, lineHeight: 0.9, color: E.red}}>{count}</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: '0.2em', color: E.ink}}>UNREAD</div>
      </div>
      <Body show={prog(f, 30, 14)} text="9:00 AM. Phone bajna shuru — har chat mein ek hi sawaal, aur jawab dene wala sirf ek insaan." style={{left: 70, top: 640, width: 230}} />
    </AbsoluteFill>
  );
};

/* ---------------- before 2: time runs out, leads go to the competitor (dark) ---------------- */
export const B2: React.FC = () => {
  const f = useCurrentFrame();
  const leave = fr(wordAt('b2', 0, 'competitor'));
  const hg = pop(f, 0, 26);
  const king = pop(f, leave - 16, 22);
  const sand = prog(f, 0, 150, (x) => x);
  const tape = prog(f, leave - 6, 24, ease.out);
  return (
    <AbsoluteFill>
      <Dark mood="before" />
      <Tape id="b2back" text="LEADS LOST" color="#3A1410" ink="#FF8A73" y={930} tilt={-60} show={tape} speed={-2} />
      <Stage>
        <Hourglass t={sand} sand="#E0C48C" position={[-0.42, -0.72 + hg.dy * 0.4, 0]} rotation={[0.12, 0.3 + hg.ry * 0.3, 0]} scale={0.72 * hg.s} />
        {king.k > 0 && <ChessKing color="#C9CDD2" position={[0.5, -0.78 + king.dy * 0.4, -0.1]} rotation={[0.08, king.ry * 0.5, 0]} scale={0.62 * king.s} />}
      </Stage>
      <Tape id="b2front" text="COMPETITOR" color="#E0482A" ink="#FFFFFF" y={1180} tilt={50} show={tape} />
      <div style={{position: 'absolute', left: 70, top: 1500, display: 'flex', alignItems: 'baseline', gap: 14, opacity: prog(f, 20, 12)}}>
        <span style={{...COND, fontSize: 92, color: E.redDark}}>4 GHANTE</span>
        <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: 'rgba(242,242,242,0.7)'}}>average reply time</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- before 3: night, again tomorrow (dark, film strip) ---------------- */
export const B3: React.FC = () => {
  const f = useCurrentFrame();
  const again = fr(wordAt('b3', 0, 'kal'));
  const lie = prog(f, 6, 40, ease.inOut);
  const moon = pop(f, 4, 26);
  return (
    <AbsoluteFill>
      <Dark mood="before" />
      <FilmStrip show={prog(f, again - 4, 14)} x={30} />
      <FilmStrip show={prog(f, again - 4, 14)} x={880} />
      <Stage>
        <group position={[0.05, mix(lie, -0.05, -0.35), 0]} rotation={[mix(lie, -0.05, -1.05), mix(lie, 0.2, 0.05), mix(lie, 0, 0.15)]} scale={0.8}>
          <Phone screen="tex/night_b.png" />
        </group>
        {moon.k > 0 && <Moon3D color="#A9B3BD" position={[0.42, 0.62 + moon.dy * 0.3, 0.3]} rotation={[0.1, moon.ry * 0.4, -0.4]} scale={0.3 * moon.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', ...COND, fontSize: 96, color: '#F2F2F2', opacity: prog(f, again, 10)}}>
        11:48 PM <span style={{color: E.redDark}}>· 23 UNREAD</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- switch: the idea switches on (paper) ---------------- */
export const Switch: React.FC = () => {
  const f = useCurrentFrame();
  const on = prog(f, 14, 10, ease.out);
  const b = pop(f, 0, 24);
  const nx = prog(f, 30, 16, ease.out);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 960, r: 420}} />
      <div style={{position: 'absolute', left: 540 - 420, top: 900 - 420, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,214,120,0.85), rgba(255,214,120,0) 70%)', opacity: on, transform: `scale(${mix(on, 0.6, 1)})`}} />
      <Stage>
        <Bulb on={on} position={[0, -0.55 + b.dy * 0.4, 0]} rotation={[0.08, b.ry * 0.3, 0]} scale={0.95 * b.s} />
        <Shadow position={[0, -0.78, -0.2]} w={1.1} d={0.3} opacity={b.k * 0.6} />
      </Stage>
      <SelectBox x={300} y={540} w={480} h={760} show={prog(f, 22, 12, ease.out)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: nx, transform: `translateY(${(1 - nx) * 30}px)`}}>
        <div style={{width: 110, height: 110, borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'}}>
          <Img src={staticFile('tex/nx.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        <div>
          <div style={{...COND, fontSize: 96, lineHeight: 0.92, color: E.ink}}>NEURAXINE</div>
          <div style={{...COND, fontSize: 60, lineHeight: 1, color: E.green}}>MODE: ON</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- after 1: replies in 3 seconds (paper) ---------------- */
export const A1: React.FC = () => {
  const f = useCurrentFrame();
  const three = fr(wordAt('a1', 0, '3 second'));
  const items = ['price', 'catalogue', 'location'].map((w) => fr(wordAt('a1', 0, w)));
  const ph = pop(f, 0, 26);
  const wa = pop(f, 10, 22);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 1000, r: 400}} />
      <Stage>
        <group position={[0, P.y + ph.dy * 0.4, 0]} rotation={[-0.04, -0.18 - ph.ry * 0.4, 0]} scale={P.s * ph.s}>
          <Phone screen="tex/ai.png" />
        </group>
        <Shadow position={[0, -1.02, -0.2]} w={1.8} d={0.45} opacity={ph.k * 0.7} />
        {wa.k > 0 && <Logo3D url="icons/whatsapp-icon.svg" size={0.42} depth={0.08} position={[0.6, 0.62 + wa.dy * 0.3, 0.4]} rotation={[0, wa.ry, 0]} scale={wa.s} />}
      </Stage>
      <SelectBox {...PHONE_BOX} show={prog(f, 16, 12, ease.out)} />
      <div style={{position: 'absolute', left: 60, top: 620, opacity: prog(f, three - 4, 10)}}>
        <div style={{...COND, fontSize: 112, lineHeight: 0.9, color: E.green}}>3 SEC</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: '0.2em', color: E.ink}}>REPLY TIME</div>
      </div>
      <Pills style={{left: 40, right: 40, top: 1450}} items={[
        {label: 'Price ✓', at: items[0] - 2, tone: 'green'},
        {label: 'Catalogue ✓', at: items[1] - 2, tone: 'violet'},
        {label: 'Location ✓', at: items[2] - 2, tone: 'green'},
      ]} />
    </AbsoluteFill>
  );
};

/* ---------------- after 2: CRM + calendar (paper) ---------------- */
const ROWS = [
  {n: 'Rahul Sharma', s: 'Hot lead', t: '3-seater sofa'},
  {n: 'Priya Verma', s: 'Booked', t: 'Showroom visit'},
  {n: 'Amit Verma', s: 'New', t: 'Dining set'},
];
export const A2: React.FC = () => {
  const f = useCurrentFrame();
  const crm = fr(wordAt('a2', 0, 'crm'));
  const cal = fr(wordAt('a2', 0, 'calendar'));
  const card = prog(f, 4, 22, ease.out);
  const tile = pop(f, 18, 22);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 760, y: 1320, r: 300}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 520, opacity: card, transform: `perspective(1600px) rotateX(${mix(card, 14, 3)}deg) translateY(${(1 - card) * 60}px)`}}>
        <div style={{background: '#FFFFFF', borderRadius: 30, padding: '26px 28px', boxShadow: '0 30px 70px rgba(80,50,20,0.18)', fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 54, height: 54, borderRadius: 14, overflow: 'hidden'}}>
              <Img src={staticFile('tex/nx.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{flex: 1, ...COND, fontSize: 52, color: E.ink}}>LEADS CRM</div>
            <div style={{padding: '8px 16px', borderRadius: 999, background: '#CFF2DC', color: '#11743E', fontWeight: 800, fontSize: 22}}>● Live</div>
          </div>
          {ROWS.map((r, i) => {
            const p = prog(f, Math.min(crm - 8, 24) + i * 7, 14, ease.out);
            const hot = r.s !== 'New';
            return (
              <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 2px', marginTop: 10, borderTop: '1px solid #EEE7DD', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <div style={{width: 54, height: 54, borderRadius: 99, background: '#F1E6D8', color: '#6B5235', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{r.n[0]}</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 700, fontSize: 28, color: E.ink}}>{r.n}</div>
                  <div style={{fontSize: 22, color: E.inkSoft}}>{r.t}</div>
                </div>
                <div style={{padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 21, background: hot ? E.green : '#F1EBE3', color: hot ? '#fff' : E.inkSoft}}>{r.s}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Stage>
        {tile.k > 0 && <Card3D img="tex/cal.png" w={0.66} h={0.66} r={0.1} d={0.2} position={[0.43, -0.7 + tile.dy * 0.3, 0.4]} rotation={[0.05, tile.ry * 0.6 - 0.3, 0]} scale={tile.s} />}
        <Shadow position={[0.43, -1.08, 0]} w={0.9} d={0.25} opacity={tile.k * 0.6} />
      </Stage>
      <SelectBox x={540 + 0.43 * 512 * 1.06 - 200} y={960 + 0.7 * 512 * 1.06 - 200} w={400} h={400} show={prog(f, cal + 2, 10, ease.out)} />
      <div style={{position: 'absolute', left: 70, top: 1250, opacity: prog(f, cal + 4, 12)}}>
        <div style={{...COND, fontSize: 110, lineHeight: 0.9, color: E.green}}>BOOKED</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, color: E.ink, marginTop: 6}}>Kal · 11:00 AM</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- after 3: follow-ups win the deal (dark) ---------------- */
export const A3: React.FC = () => {
  const f = useCurrentFrame();
  const deals = fr(wordAt('a3', 0, 'deals'));
  const king = pop(f, 2, 26);
  const pawn = pop(f, 10, 22);
  const tape = prog(f, deals - 8, 24, ease.out);
  const logos = ['icons/whatsapp-icon.svg', 'icons/google-gmail.svg', 'icons/whatsapp-icon.svg'];
  return (
    <AbsoluteFill>
      <Dark mood="after" />
      <Tape id="a3back" text="FOLLOW-UP" color="#1C2A0C" ink="#B5F12A" y={900} tilt={-60} show={prog(f, 6, 24, ease.out)} speed={-2} />
      <Stage>
        <ChessKing color="#9FD82A" position={[-0.25, -0.82 + king.dy * 0.4, 0]} rotation={[0.08, 0.3 + king.ry * 0.4, 0]} scale={0.72 * king.s} />
        {pawn.k > 0 && <ChessPawn color="#C9CDD2" position={[0.45, -0.82 + pawn.dy * 0.4, -0.2]} rotation={[0.08, pawn.ry * 0.4, 0]} scale={0.62 * pawn.s} />}
        {logos.map((u, i) => {
          const sp = pop(f, 6 + i * 12, 20);
          if (sp.k <= 0) return null;
          return <Logo3D key={i} url={u} size={0.26} depth={0.06} position={[-0.65 + i * 0.65, 0.62 + sp.dy * 0.3, 0.2]} rotation={[0, sp.ry, 0]} scale={sp.s} />;
        })}
      </Stage>
      <Tape id="a3front" text="DEAL CLOSED" color="#B5F12A" ink="#0A1200" y={1200} tilt={50} show={tape} />
      {['Day 1', 'Day 3', 'Day 5'].map((d, i) => (
        <div key={d} style={{position: 'absolute', top: 760, left: 540 + (-0.65 + i * 0.65) * 512 - 90, width: 180, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 24, color: 'rgba(242,242,242,0.75)', opacity: prog(f, 16 + i * 12, 10)}}>
          {d} · auto
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', opacity: prog(f, deals, 12)}}>
        <span style={{...COND, fontSize: 110, color: E.lime}}>₹24,999</span>
        <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: 'rgba(242,242,242,0.7)', marginLeft: 14}}>closed</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- after 4: night, still running (dark) ---------------- */
export const A4: React.FC = () => {
  const f = useCurrentFrame();
  const run = fr(wordAt('a4', 0, 'chal'));
  const ph = pop(f, 0, 26);
  const moon = pop(f, 6, 24);
  return (
    <AbsoluteFill>
      <Dark mood="after" />
      <Stage>
        <group position={[0, P.y + ph.dy * 0.4, 0]} rotation={[-0.04, 0.2 + ph.ry * 0.4, 0]} scale={P.s * ph.s}>
          <Phone screen="tex/night_a.png" />
        </group>
        {moon.k > 0 && <Moon3D color="#C8F55A" position={[0.58, 0.66 + moon.dy * 0.3, 0.35]} rotation={[0.1, moon.ry * 0.4, -0.4]} scale={0.3 * moon.s} />}
      </Stage>
      <SelectBox {...PHONE_BOX} dark show={prog(f, 16, 12, ease.out)} />
      <div style={{position: 'absolute', left: 56, top: 620, opacity: prog(f, 14, 12)}}>
        <div style={{...COND, fontSize: 84, lineHeight: 0.9, color: '#F2F2F2'}}>1:12 AM</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 18, letterSpacing: '0.16em', color: 'rgba(242,242,242,0.6)'}}>AAP SO RAHE HO</div>
      </div>
      <Pills style={{left: 40, right: 40, top: 1450}} items={[{label: 'Order #2316 confirmed', at: run - 4, tone: 'lime'}]} />
    </AbsoluteFill>
  );
};

/* ---------------- compare (paper, trophy) ---------------- */
const PAIRS = [
  ['late', 'Late reply', 'instant', 'Instant reply'],
  ['khoye', 'Khoye leads', 'saved', 'Saved leads'],
  ['tension', 'Tension', 'sukoon', 'Sukoon'],
];
export const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const ab = fr(wordAt('compare', 0, 'ab,'));
  const tr = pop(f, 4, 26);
  void ab;
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 760, r: 300}} />
      <Stage>
        {tr.k > 0 && <Trophy position={[0, 0.0 + tr.dy * 0.4, 0]} rotation={[0.12, tr.ry * 0.5, 0]} scale={0.62 * tr.s} />}
        <Shadow position={[0, -0.12, -0.2]} w={1.2} d={0.3} opacity={tr.k * 0.6} />
      </Stage>
      <div style={{position: 'absolute', left: 70, width: 440, top: 1040, ...COND, fontSize: 70, color: E.red}}>PEHLE</div>
      <div style={{position: 'absolute', right: 70, width: 440, top: 1040, ...COND, fontSize: 70, color: E.green, textAlign: 'right'}}>AB</div>
      {PAIRS.map(([wl, tl, wr, trr], i) => {
        const pl = prog(f, fr(wordAt('compare', 0, wl)) - 4, 12, ease.out);
        const pr = prog(f, fr(wordAt('compare', 0, wr)) - 4, 12, ease.out);
        const top = 1140 + i * 120;
        return (
          <React.Fragment key={wl}>
            <div style={{position: 'absolute', left: 70, width: 440, top, display: 'flex', alignItems: 'center', gap: 14, opacity: pl, transform: `translateX(${(1 - pl) * -40}px)`, fontFamily: F.body, fontWeight: 800, fontSize: 34, color: E.inkSoft, textDecoration: 'line-through', textDecorationColor: E.red, textDecorationThickness: 4}}>
              <span style={{color: E.red, textDecoration: 'none'}}>×</span> {tl}
            </div>
            <div style={{position: 'absolute', right: 70, width: 440, top, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, opacity: pr, transform: `translateX(${(1 - pr) * 40}px)`, fontFamily: F.body, fontWeight: 800, fontSize: 34, color: E.ink}}>
              {trr} <span style={{color: E.green}}>✓</span>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- CTA (dark gradient, like the reference's close) ---------------- */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const auto = fr(wordAt('cta', 0, 'automate'));
  const follow = fr(wordAt('cta', 1, 'follow'));
  const end = fr(cue('cta', 1, 'end'));
  const ph = pop(f, 0, 26);
  const out = prog(f, end, 14, ease.in);
  const typeP = prog(f, auto - 24, 20, (x) => x);
  const typed = BRAND.keyword.slice(0, Math.round(typeP * BRAND.keyword.length));
  const followed = prog(f, follow, 6);
  const press = prog(f, follow - 3, 3) * (1 - prog(f, follow + 1, 6));
  const lock = pop(f, end + 4, 26);
  const txt = prog(f, end + 16, 16, ease.out);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #050505 0%, #0B1203 55%, #1C2C06 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(900px 600px at 50% 105%, rgba(181,241,42,0.28), transparent 70%)'}} />
      <Stage>
        <group position={[0, P.y + ph.dy * 0.4 - out * 3, 0]} rotation={[-0.04, -0.2 + ph.ry * 0.4, 0]} scale={0.74 * ph.s}>
          <Phone screen="screens/profile.png" />
        </group>
        {lock.k > 0 && <Card3D img="tex/nx.png" w={0.95} h={0.95} r={0.21} d={0.2} position={[0, 0.42 + lock.dy * 0.4, 0.2]} rotation={[0.06, lock.ry, 0]} scale={lock.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1300, opacity: prog(f, auto - 28, 12, ease.out) * (1 - out)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 26, background: 'rgba(20,24,18,0.92)', border: '1px solid rgba(181,241,42,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)'}}>
          <BrandIcon name="instagram" size={44} />
          <div style={{flex: 1, height: 68, borderRadius: 999, border: '1.5px solid rgba(242,242,242,0.16)', display: 'flex', alignItems: 'center', paddingLeft: 26, ...COND, fontSize: 50, color: E.lime}}>
            {typed || <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 27, color: '#6E6E6E', textTransform: 'none'}}>Add a comment…</span>}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1450, display: 'flex', justifyContent: 'center', opacity: prog(f, follow - 22, 12, ease.out) * (1 - out)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px 12px 24px', borderRadius: 999, background: 'rgba(20,24,18,0.92)', border: '1px solid rgba(181,241,42,0.3)', fontFamily: F.body}}>
          <span style={{fontWeight: 800, fontSize: 30, color: '#F2F2F2'}}>@{BRAND.handle}</span>
          <span style={{padding: '12px 28px', borderRadius: 999, background: followed > 0.5 ? 'rgba(242,242,242,0.1)' : E.lime, color: followed > 0.5 ? '#F2F2F2' : '#0A1200', fontWeight: 800, fontSize: 28, transform: `scale(${1 - press * 0.1})`}}>{followed > 0.5 ? 'Following ✓' : 'Follow'}</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', opacity: txt, transform: `translateY(${(1 - txt) * 30}px)`}}>
        <div style={{...COND, fontSize: 150, lineHeight: 0.9, color: '#F2F2F2'}}>{BRAND.name}</div>
        <div style={{marginTop: 10, fontFamily: F.body, fontWeight: 700, fontSize: 27, letterSpacing: '0.46em', marginRight: '-0.46em', color: E.lime}}>{BRAND.tagline}</div>
        <div style={{marginTop: 30, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: 'rgba(242,242,242,0.6)'}}>{BRAND.site}</div>
      </div>
    </AbsoluteFill>
  );
};
