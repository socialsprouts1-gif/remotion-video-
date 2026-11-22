import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, cue, wordAt} from '../config';
import {F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Stage} from '../three/Stage';
import {Card3D, Envelope3D, Logo3D, Phone, Shadow, Target3D, Tile3D} from '../three/kit';
import {Body, COND, Dark, E, Paper, Pills, SelectBox, Tape} from '../components/editorial';
import {BrandIcon} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);
const pop = (f: number, at: number, dur = 22) => {
  const k = prog(f, at, dur, ease.out);
  return {k, ry: mix(k, Math.PI * 0.9, 0) + Math.sin(f / 34) * 0.12, dy: mix(k, -0.7, 0) + Math.sin(f / 28) * 0.025, s: mix(k, 0.3, 1)};
};
const CARD: React.CSSProperties = {background: '#FFFFFF', borderRadius: 26, boxShadow: '0 26px 60px rgba(80,50,20,0.16)', fontFamily: F.body};
const DCARD: React.CSSProperties = {background: 'rgba(22,24,20,0.94)', border: '1px solid rgba(181,241,42,0.22)', borderRadius: 26, boxShadow: '0 26px 70px rgba(0,0,0,0.6)', fontFamily: F.body};

/* ---------------- hook: four jobs → one system (dark) ---------------- */
const JOBS = [
  {w: 'lead', kind: 'tile', src: 'tex/search.png', x: -0.66, label: 'Leads'},
  {w: 'email', kind: 'tile', src: 'tex/mail.png', x: -0.22, label: 'Email'},
  {w: 'linkedin', kind: 'svg', src: 'icons/linkedin.svg', x: 0.22, label: 'LinkedIn'},
  {w: 'call', kind: 'tile', src: 'tex/phone.png', x: 0.66, label: 'Calls'},
];
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const sys = fr(wordAt('hook', 0, 'system'));
  const merge = prog(f, sys - 6, 18, ease.inOut);
  const nx = pop(f, sys + 4, 22);
  return (
    <AbsoluteFill>
      <Dark mood="after" />
      <Stage>
        {JOBS.map((j, i) => {
          const sp = pop(f, fr(wordAt('hook', 0, j.w)) - 4, 18);
          if (sp.k <= 0 || merge >= 1) return null;
          const pos: [number, number, number] = [mix(merge, j.x, 0), mix(merge, 0.32 + sp.dy * 0.3, -0.2), 0.3];
          const sc = sp.s * (1 - merge * 0.8);
          return j.kind === 'svg' ? (
            <Logo3D key={j.w} url={j.src} size={0.34} depth={0.07} position={pos} rotation={[0, sp.ry, 0]} scale={sc} />
          ) : (
            <Tile3D key={j.w} img={j.src} size={0.34} d={0.09} position={pos} rotation={[0.06, sp.ry, 0]} scale={sc} />
          );
        })}
        {nx.k > 0 && <Card3D img="tex/nx.png" w={0.9} h={0.9} r={0.2} d={0.2} position={[0, -0.2 + nx.dy * 0.4, 0.3]} rotation={[0.06, nx.ry, 0]} scale={nx.s} />}
      </Stage>
      {JOBS.map((j, i) => (
        <div key={j.w} style={{position: 'absolute', top: 920, left: 540 + j.x * 512 * 1.05 - 90, width: 180, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, color: 'rgba(242,242,242,0.8)', opacity: prog(f, fr(wordAt('hook', 0, j.w)) + 4, 10) * (1 - merge)}}>
          {j.label}
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', ...COND, fontSize: 96, color: '#F2F2F2', opacity: nx.k}}>
        ONE <span style={{color: E.lime}}>SYSTEM</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- the 9 workflows (paper) ---------------- */
const Chart: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="#141414" strokeWidth={2.2} fill="none" strokeLinecap="round" /></svg>
);
const NODES: {label: string; img?: string; svg?: string; el?: React.ReactNode}[] = [
  {label: 'Apollo list', img: 'tex/apollo.png'},
  {label: 'Enrich leads', img: 'tex/search.png'},
  {label: 'Personal email', svg: 'icons/gmail.svg'},
  {label: 'Follow-up sequence', img: 'tex/mail.png'},
  {label: 'LinkedIn outreach', svg: 'icons/linkedin.svg'},
  {label: 'Unipile sync', img: 'tex/unipile.png'},
  {label: 'AI voice call', svg: 'icons/vapi.svg'},
  {label: 'Supabase CRM', svg: 'icons/supabase.svg'},
  {label: 'Dashboard', el: <Chart s={64} />},
];
// snake layout: row 0 left→right, row 1 right→left, row 2 left→right
const nodePos = (i: number) => {
  const r = Math.floor(i / 3);
  const c = r % 2 === 0 ? i % 3 : 2 - (i % 3);
  return {x: 70 + c * 320, y: 560 + r * 300};
};
export const Nine: React.FC = () => {
  const f = useCurrentFrame();
  const show = (i: number) => prog(f, 6 + i * 7, 12, ease.out);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 1000, r: 470}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {NODES.slice(0, -1).map((_, i) => {
          const a = nodePos(i);
          const b = nodePos(i + 1);
          const k = prog(f, 12 + i * 7, 10, ease.inOut);
          const ax = a.x + 140;
          const ay = a.y + 100;
          const bx = b.x + 140;
          const by = b.y + 100;
          const d = ay === by ? `M ${ax} ${ay} L ${bx} ${by}` : `M ${ax} ${ay} C ${ax + (ax > 540 ? 200 : -200)} ${ay}, ${bx + (bx > 540 ? 200 : -200)} ${by}, ${bx} ${by}`;
          return <path key={i} d={d} stroke="#169A52" strokeWidth={5} fill="none" strokeDasharray={`${k * 900} 900`} strokeLinecap="round" />;
        })}
      </svg>
      {NODES.map((n, i) => {
        const p = nodePos(i);
        const s = show(i);
        return (
          <div key={n.label} style={{position: 'absolute', left: p.x, top: p.y, width: 280, height: 200, ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: s, transform: `scale(${mix(s, 0.6, 1)})`, border: '2px solid #EEE6DA'}}>
            <div style={{position: 'absolute', left: 14, top: 10, fontFamily: F.body, fontWeight: 800, fontSize: 18, color: '#B4AA9C'}}>0{i + 1}</div>
            {n.img && <Img src={staticFile(n.img)} style={{width: 76, height: 76, borderRadius: 18, objectFit: 'cover'}} />}
            {n.svg && <Img src={staticFile(n.svg)} style={{height: 64, maxWidth: 110, objectFit: 'contain'}} />}
            {n.el}
            <div style={{fontWeight: 800, fontSize: 22, color: E.ink}}>{n.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- 1 · Apollo list (paper) ---------------- */
const COMPANIES = [
  ['Sharma Interiors', 'Interior design · Jaipur'],
  ['UrbanNest Realty', 'Real estate · Pune'],
  ['GlowSkin Clinics', 'Healthcare · Delhi'],
  ['FitHub Studios', 'Fitness · Bengaluru'],
  ['Kraft & Co.', 'D2C brand · Mumbai'],
];
export const Apollo: React.FC = () => {
  const f = useCurrentFrame();
  const list = fr(wordAt('apollo', 0, 'list'));
  const badge = pop(f, 2, 22);
  const card = prog(f, 10, 20, ease.out);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 820, y: 640, r: 230}} />
      <Stage>
        {badge.k > 0 && <Tile3D img="tex/apollo.png" size={0.46} d={0.11} position={[0.55, 0.62 + badge.dy * 0.3, 0.4]} rotation={[0.06, badge.ry * 0.6 - 0.25, 0]} scale={badge.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 70, top: 560, ...COND, fontSize: 64, color: E.ink, opacity: prog(f, 6, 12)}}>
        WORKFLOW <span style={{color: E.green}}>01</span>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 800, ...CARD, padding: '22px 26px', opacity: card, transform: `translateY(${(1 - card) * 50}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
          <div style={{...COND, fontSize: 44, color: E.ink}}>TARGET COMPANIES</div>
          <div style={{padding: '6px 14px', borderRadius: 999, background: '#CFF2DC', color: '#11743E', fontWeight: 800, fontSize: 21}}>248 found</div>
        </div>
        {COMPANIES.map(([n, d], i) => {
          const p = prog(f, 16 + i * 6, 12, ease.out);
          const tick = f > list - 10 + i * 4;
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid #EEE7DD', opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
              <div style={{width: 34, height: 34, borderRadius: 8, border: `2.5px solid ${tick ? E.green : '#CFC6B8'}`, background: tick ? E.green : 'transparent', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 22}}>{tick ? '✓' : ''}</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 28, color: E.ink}}>{n}</div>
                <div style={{fontSize: 21, color: E.inkSoft}}>{d}</div>
              </div>
            </div>
          );
        })}
      </div>
      <SelectBox x={56} y={786} w={968} h={560} show={prog(f, list - 6, 10, ease.out)} />
    </AbsoluteFill>
  );
};

/* ---------------- 2 · personalised email, not "Dear Sir" (paper) ---------------- */
export const Email: React.FC = () => {
  const f = useCurrentFrame();
  const seq = fr(wordAt('email', 0, 'sequence'));
  const dear = fr(wordAt('email', 0, 'dear'));
  const g = pop(f, 2, 22);
  const good = prog(f, 10, 18, ease.out);
  const bad = prog(f, dear - 14, 14, ease.out);
  const strike = prog(f, dear + 4, 10, ease.out);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 820, y: 620, r: 220}} />
      <Stage>
        {g.k > 0 && <Logo3D url="icons/gmail.svg" size={0.46} depth={0.08} position={[0.58, 0.66 + g.dy * 0.3, 0.4]} rotation={[0, g.ry, 0]} scale={g.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 70, top: 560, ...COND, fontSize: 64, color: E.ink, opacity: prog(f, 6, 12)}}>
        WORKFLOW <span style={{color: E.green}}>02–03</span>
      </div>
      {/* the personal email */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 780, ...CARD, padding: '24px 26px', opacity: good, transform: `translateY(${(1 - good) * 40}px)`, border: `2.5px solid ${E.green}`}}>
        <div style={{fontSize: 21, color: E.inkSoft, fontWeight: 600}}>To: rahul@sharmainteriors.in</div>
        <div style={{fontWeight: 800, fontSize: 28, color: E.ink, marginTop: 6}}>Rahul, aapke naye Jaipur showroom ke liye</div>
        <div style={{fontSize: 25, color: '#3A332C', marginTop: 8, lineHeight: 1.35}}>Showroom launch dekha — weekend walk-ins ko leads mein badalne ka ek simple system dikhaun?</div>
        <div style={{position: 'absolute', right: 18, top: 16, padding: '6px 12px', borderRadius: 999, background: '#CFF2DC', color: '#11743E', fontWeight: 800, fontSize: 20}}>✓ Personal</div>
      </div>
      {/* the template, struck out */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 1140, ...CARD, padding: '20px 24px', opacity: bad * 0.9, transform: `rotate(-3deg) translateY(${(1 - bad) * 40}px)`, background: '#FBF8F3'}}>
        <div style={{fontWeight: 800, fontSize: 28, color: '#8A8178'}}>Dear Sir,</div>
        <div style={{fontSize: 23, color: '#A39A90', marginTop: 4}}>We are a leading company providing best-in-class solutions…</div>
        <div style={{position: 'absolute', left: 20, right: 20, top: '50%', height: 6, borderRadius: 4, background: E.red, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
        {strike > 0.9 && <div style={{position: 'absolute', right: -16, top: -20, width: 64, height: 64, borderRadius: 99, background: E.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 800}}>×</div>}
      </div>
      <Pills style={{left: 40, right: 40, top: 1430}} items={[
        {label: 'Day 1 · intro', at: seq - 6, tone: 'green'},
        {label: 'Day 3 · case study', at: seq, tone: 'violet'},
        {label: 'Day 7 · follow-up', at: seq + 6, tone: 'green'},
      ]} />
    </AbsoluteFill>
  );
};

/* ---------------- 3 · LinkedIn via Unipile (dark) ---------------- */
export const Linkedin: React.FC = () => {
  const f = useCurrentFrame();
  const uni = fr(wordAt('linkedin', 0, 'unipile'));
  const li = pop(f, 0, 24);
  const u = pop(f, uni - 6, 20);
  const card = prog(f, 12, 18, ease.out);
  const acc = prog(f, uni + 8, 10, ease.out);
  return (
    <AbsoluteFill>
      <Dark mood="after" />
      <Stage>
        {li.k > 0 && <Logo3D url="icons/linkedin.svg" size={0.62} depth={0.1} position={[-0.32, 0.45 + li.dy * 0.3, 0.3]} rotation={[0, li.ry, 0]} scale={li.s} />}
        {u.k > 0 && <Tile3D img="tex/unipile.png" size={0.46} d={0.11} position={[0.42, 0.4 + u.dy * 0.3, 0.35]} rotation={[0.06, u.ry * 0.6 - 0.2, 0]} scale={u.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', ...COND, fontSize: 56, color: 'rgba(242,242,242,0.85)', opacity: prog(f, 6, 12)}}>
        WORKFLOW <span style={{color: E.lime}}>04–05</span>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1120, ...DCARD, padding: '24px 26px', opacity: card, transform: `translateY(${(1 - card) * 40}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 76, height: 76, borderRadius: 99, background: 'linear-gradient(140deg, #3A4A5A, #1C242C)', color: '#F2F2F2', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 30}}>PM</div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: 30, color: '#F2F2F2'}}>Priya Mehta</div>
            <div style={{fontSize: 22, color: 'rgba(242,242,242,0.6)'}}>Head of Sales · UrbanNest Realty</div>
          </div>
          <div style={{padding: '12px 22px', borderRadius: 999, background: acc > 0.5 ? E.lime : '#0A66C2', color: acc > 0.5 ? '#0A1200' : '#fff', fontWeight: 800, fontSize: 24}}>{acc > 0.5 ? 'Accepted ✓' : 'Connect'}</div>
        </div>
        <div style={{marginTop: 16, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', fontSize: 24, color: 'rgba(242,242,242,0.85)', lineHeight: 1.35}}>
          Hi Priya, UrbanNest ke Pune launches dekhe — site-visit leads ke liye ek idea share karun?
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 4 · Vapi AI voice agent (dark) ---------------- */
export const Vapi: React.FC = () => {
  const f = useCurrentFrame();
  const agent = fr(wordAt('vapi', 0, 'voice'));
  const ph = pop(f, 0, 26);
  const v = pop(f, 8, 22);
  return (
    <AbsoluteFill>
      <Dark mood="after" />
      <Stage>
        <group position={[0, -0.1 + ph.dy * 0.4, 0]} rotation={[-0.04, -0.2 + ph.ry * 0.4, 0]} scale={0.76 * ph.s}>
          <Phone screen="tex/call.png" />
        </group>
        {v.k > 0 && <Logo3D url="icons/vapi.svg" size={0.5} depth={0.08} tint="#F2F2F2" position={[0.6, 0.66 + v.dy * 0.3, 0.4]} rotation={[0, v.ry, 0]} scale={v.s} />}
      </Stage>
      {/* live voice waveform */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 1460, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: prog(f, agent - 8, 12)}}>
        {Array.from({length: 34}).map((_, i) => {
          const h = 16 + Math.abs(Math.sin(f / 4 + i * 0.7) * Math.sin(f / 9 + i * 0.3)) * 100;
          return <div key={i} style={{width: 12, height: h, borderRadius: 8, background: i % 3 === 0 ? E.lime : 'rgba(181,241,42,0.55)'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 640, opacity: prog(f, agent - 4, 12)}}>
        <div style={{...COND, fontSize: 76, lineHeight: 0.95, color: '#F2F2F2'}}>WORKFLOW</div>
        <div style={{...COND, fontSize: 76, lineHeight: 0.95, color: E.lime}}>06–07</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 5 · Supabase CRM dashboard (paper) ---------------- */
const STAGES = ['New', 'Emailed', 'LinkedIn', 'Called', 'Meeting'];
const LEAD_STAGE = [4, 3, 3, 2, 2, 1, 1, 1, 0, 0];
export const Crm: React.FC = () => {
  const f = useCurrentFrame();
  const dash = fr(wordAt('crm', 0, 'dashboard'));
  const s = pop(f, 0, 22);
  const card = prog(f, 8, 20, ease.out);
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 1240, r: 420}} />
      <Stage>
        {s.k > 0 && <Logo3D url="icons/supabase.svg" size={0.44} depth={0.08} position={[-0.58, 0.68 + s.dy * 0.3, 0.4]} rotation={[0, s.ry, 0]} scale={s.s} />}
      </Stage>
      <div style={{position: 'absolute', right: 70, top: 570, textAlign: 'right', opacity: prog(f, 6, 12)}}>
        <div style={{...COND, fontSize: 64, lineHeight: 0.95, color: E.ink}}>WORKFLOW</div>
        <div style={{...COND, fontSize: 64, lineHeight: 0.95, color: E.green}}>08–09</div>
      </div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 820, ...CARD, padding: '22px 20px', opacity: card, transform: `translateY(${(1 - card) * 50}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
          <Img src={staticFile('icons/supabase.svg')} style={{height: 34}} />
          <div style={{flex: 1, ...COND, fontSize: 42, color: E.ink}}>PIPELINE</div>
          <div style={{padding: '6px 14px', borderRadius: 999, background: '#CFF2DC', color: '#11743E', fontWeight: 800, fontSize: 20}}>● Synced</div>
        </div>
        <div style={{display: 'flex', gap: 10}}>
          {STAGES.map((st, c) => {
            // leads advance one stage at a time until the "dashboard" word, then hold
            const step = Math.floor(prog(f, 20, Math.max(30, dash - 10), (x) => x) * 4.99);
            const n = LEAD_STAGE.map((ls) => Math.min(ls, step)).filter((x) => x === c).length;
            return (
              <div key={st} style={{flex: 1, minHeight: 470, borderRadius: 16, background: c === 4 ? '#E6F7EC' : '#F6F1EA', padding: '10px 8px'}}>
                <div style={{fontWeight: 800, fontSize: 18, color: c === 4 ? '#11743E' : E.inkSoft, textAlign: 'center'}}>{st}</div>
                <div style={{...COND, fontSize: 44, textAlign: 'center', color: c === 4 ? E.green : E.ink}}>{n}</div>
                {Array.from({length: n}).map((_, k) => (
                  <div key={k} style={{height: 54, marginTop: 8, borderRadius: 10, background: '#FFFFFF', boxShadow: '0 4px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px'}}>
                    <div style={{width: 22, height: 22, borderRadius: 99, background: c === 4 ? E.green : '#D9CFC2'}} />
                    <div style={{flex: 1, height: 8, borderRadius: 6, background: '#EEE7DD'}} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <SelectBox x={36} y={806} w={1008} h={650} show={prog(f, dash - 6, 10, ease.out)} />
    </AbsoluteFill>
  );
};

/* ---------------- honest: not "set and forget" (dark, red) ---------------- */
export const Honest: React.FC = () => {
  const f = useCurrentFrame();
  const forget = fr(wordAt('honest', 0, 'set'));
  const w = pop(f, 4, 24);
  const strike = prog(f, forget + 24, 12, ease.out);
  return (
    <AbsoluteFill>
      <Dark mood="before" />
      <Tape id="hback" text="HONEST BAAT" color="#3A1410" ink="#FF8A73" y={880} tilt={-50} show={prog(f, 2, 24, ease.out)} speed={-2} />
      <Stage>
        {w.k > 0 && <Tile3D img="tex/warn.png" size={0.62} d={0.14} position={[0, 0.0 + w.dy * 0.3, 0.3]} rotation={[0.08, w.ry * 0.6, 0]} scale={w.s} />}
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, textAlign: 'center', opacity: prog(f, forget - 4, 12)}}>
        <span style={{position: 'relative', display: 'inline-block', ...COND, fontSize: 130, color: '#F2F2F2'}}>
          SET &amp; FORGET
          <span style={{position: 'absolute', left: -10, right: -10, top: '48%', height: 12, borderRadius: 6, background: E.redDark, transform: `scaleX(${strike}) rotate(-3deg)`, transformOrigin: 'left'}} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- wrong list → fast spam (dark, red) ---------------- */
export const Wrong: React.FC = () => {
  const f = useCurrentFrame();
  const spam = fr(wordAt('wrong', 0, 'spam'));
  const fast = fr(wordAt('wrong', 0, 'tezi'));
  const list = prog(f, 4, 16, ease.out);
  const x = prog(f, 22, 10, ease.out);
  const burst = (i: number) => prog(f, spam - 10 + (i % 6) * 3, 26, ease.in);
  const rate = Math.round(prog(f, spam - 6, 40, ease.out) * 1200);
  return (
    <AbsoluteFill>
      <Dark mood="before" />
      <div style={{position: 'absolute', left: 260, right: 260, top: 560, ...DCARD, padding: '18px 22px', border: '1.5px solid rgba(255,92,92,0.6)', opacity: list * (1 - prog(f, spam, 14) * 0.6)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{...COND, fontSize: 40, color: '#F2F2F2'}}>LEAD LIST</div>
          <div style={{width: 46, height: 46, borderRadius: 99, background: E.redDark, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 30, transform: `scale(${mix(x, 1.8, 1)})`, opacity: x}}>×</div>
        </div>
        {['Students', 'Job seekers', 'Random emails'].map((t) => (
          <div key={t} style={{marginTop: 8, fontSize: 24, color: 'rgba(242,242,242,0.7)', textDecoration: 'line-through', textDecorationColor: E.redDark}}>{t}</div>
        ))}
      </div>
      <Stage>
        {Array.from({length: 14}).map((_, i) => {
          const k = burst(i);
          if (k <= 0) return null;
          const a = (i / 14) * Math.PI * 2 + 0.3;
          const dist = mix(k, 0.1, 1.9);
          return <Envelope3D key={i} color={i % 4 === 0 ? '#F2C8BE' : '#F4F1EA'} position={[Math.cos(a) * dist, -0.25 + Math.sin(a) * dist * 1.1, mix(k, 0, 0.8)]} rotation={[k * 2 + i, k * 3, a]} scale={0.32} />;
        })}
      </Stage>
      <Tape id="wfront" text="SPAM" color="#E0482A" ink="#FFFFFF" y={1180} tilt={60} show={prog(f, fast - 10, 20, ease.out)} speed={6} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', opacity: prog(f, spam - 6, 12)}}>
        <span style={{...COND, fontSize: 110, color: E.redDark}}>{rate.toLocaleString('en-IN')}</span>
        <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: 'rgba(242,242,242,0.7)', marginLeft: 12}}>wrong emails / hour</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- speed + the right target (paper) ---------------- */
export const Speed: React.FC = () => {
  const f = useCurrentFrame();
  const tgt = fr(wordAt('speed', 0, 'target'));
  const b = pop(f, 0, 24);
  const hit = prog(f, tgt - 8, 12, ease.in);
  const shake = f > tgt + 4 && f < tgt + 14 ? Math.sin(f * 3) * 0.04 : 0;
  return (
    <AbsoluteFill>
      <Paper disc={{x: 540, y: 1000, r: 420}} />
      <Stage>
        {b.k > 0 && <Target3D hit={hit} position={[0, -0.1 + b.dy * 0.3, 0]} rotation={[0.1, -0.35 + b.ry * 0.3, shake]} scale={0.95 * b.s} />}
        <Shadow position={[0, -0.9, -0.2]} w={1.4} d={0.3} opacity={b.k * 0.5} />
      </Stage>
      <SelectBox x={190} y={650} w={700} h={720} show={prog(f, tgt + 6, 10, ease.out)} />
      <Body show={prog(f, 12, 14)} text="Workflows speed dete hain. Kisko target karna hai — ICP, industry, city — yeh decision aapka hai." style={{left: 70, top: 600, width: 300}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center', opacity: prog(f, tgt + 8, 12)}}>
        <span style={{...COND, fontSize: 120, color: E.ink}}>SAHI </span>
        <span style={{...COND, fontSize: 120, color: E.green}}>TARGET</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- CTA: DM "LEADS" (dark → lime) ---------------- */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const dm = fr(wordAt('cta', 0, 'dm'));
  const end = fr(cue('cta', 0, 'end'));
  const ph = pop(f, 0, 26);
  const out = prog(f, end + 2, 14, ease.in);
  const typeP = prog(f, dm - 4, 18, (x) => x);
  const typed = BRAND.keyword.slice(0, Math.round(typeP * BRAND.keyword.length));
  const sent = prog(f, dm + 18, 10, ease.out);
  const reply = prog(f, dm + 34, 12, ease.out);
  const lock = pop(f, end + 6, 26);
  const txt = prog(f, end + 18, 16, ease.out);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #050505 0%, #0B1203 55%, #1C2C06 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(900px 600px at 50% 105%, rgba(181,241,42,0.28), transparent 70%)'}} />
      <Stage>
        <group position={[-0.42, -0.12 + ph.dy * 0.4 - out * 3, 0]} rotation={[-0.04, 0.3 + ph.ry * 0.4, 0]} scale={0.62 * ph.s}>
          <Phone screen="screens/profile.png" />
        </group>
        {lock.k > 0 && <Card3D img="tex/nx.png" w={0.95} h={0.95} r={0.21} d={0.2} position={[0, 0.42 + lock.dy * 0.4, 0.2]} rotation={[0.06, lock.ry, 0]} scale={lock.s} />}
      </Stage>
      {/* Instagram DM to @neuraxine */}
      <div style={{position: 'absolute', left: 510, right: 44, top: 760, opacity: prog(f, 10, 14, ease.out) * (1 - out), transform: `translateX(${(1 - prog(f, 10, 14, ease.out)) * 80}px)`}}>
        <div style={{...DCARD, padding: '18px 18px 16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14}}>
            <BrandIcon name="instagram" size={34} />
            <span style={{fontWeight: 800, fontSize: 24, color: '#F2F2F2'}}>@neuraxine</span>
          </div>
          <div style={{minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10}}>
            {sent > 0 && <div style={{alignSelf: 'flex-end', padding: '12px 20px', borderRadius: 20, background: 'linear-gradient(135deg, #7B3FE4, #C13584)', color: '#fff', ...COND, fontSize: 40, opacity: sent, transform: `scale(${mix(sent, 0.6, 1)})`}}>LEADS</div>}
            {reply > 0 && <div style={{alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#F2F2F2', fontSize: 21, opacity: reply}}>Details bhej rahe hain 👇</div>}
          </div>
          <div style={{marginTop: 12, height: 60, borderRadius: 999, border: '1.5px solid rgba(242,242,242,0.18)', display: 'flex', alignItems: 'center', paddingLeft: 20, ...COND, fontSize: 36, color: E.lime}}>
            {sent < 0.5 && typed ? typed : <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 22, color: '#6E6E6E', textTransform: 'none'}}>Message…</span>}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', opacity: txt, transform: `translateY(${(1 - txt) * 30}px)`}}>
        <div style={{...COND, fontSize: 150, lineHeight: 0.9, color: '#F2F2F2'}}>{BRAND.name}</div>
        <div style={{marginTop: 10, fontFamily: F.body, fontWeight: 700, fontSize: 27, letterSpacing: '0.46em', marginRight: '-0.46em', color: E.lime}}>{BRAND.tagline}</div>
        <div style={{marginTop: 28, display: 'inline-block', padding: '14px 32px', borderRadius: 999, background: E.lime, color: '#0A1200', ...COND, fontSize: 48}}>DM “LEADS”</div>
      </div>
    </AbsoluteFill>
  );
};
