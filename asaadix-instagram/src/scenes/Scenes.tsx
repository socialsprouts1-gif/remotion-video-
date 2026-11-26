import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CRM_ROWS, cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Stage} from '../three/Stage';
import {Card3D, Logo3D, Moon3D, Phone, Shadow, Tile3D} from '../three/kit';
import {Chip, Ico, LuxBg} from '../components/ui';

const fr = (s: number) => Math.round(s * 30);
const POSE = {y: -0.22, s: 0.86};
const GOLD_TEXT: React.CSSProperties = {background: 'linear-gradient(180deg, #F5DB97 0%, #C9A24A 60%, #9C7A2C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
const GLASS: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(40,34,26,0.92), rgba(12,11,9,0.94))',
  border: '1px solid rgba(226,190,104,0.26)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
};
/** Pop-in for 3D objects: rises, turns to face camera, settles with a slow float. */
const pop = (f: number, at: number, dur = 20) => {
  const k = prog(f, at, dur, ease.out);
  return {k, ry: mix(k, Math.PI * 1.1, 0) + Math.sin(f / 32) * 0.14, dy: mix(k, -0.6, 0) + Math.sin(f / 26) * 0.03, s: mix(k, 0.2, 1)};
};

/* ---------------- 1 · hook ---------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const ig = fr(wordAt('hook', 0, 'instagram'));
  const dis = fr(wordAt('hook', 0, 'disappears'));
  const tom = fr(wordAt('hook', 0, 'tomorrow'));
  const what = fr(wordAt('hook', 0, 'what'));
  const enter = prog(f, 0, 34, ease.out);
  const glitch = f >= dis && f < dis + 16 && f % 4 < 2 ? 1 : 0;
  const shake = f >= dis && f < dis + 16 ? Math.sin(f * 2.3) * 0.025 : 0;
  const icon = pop(f, ig - 4);
  return (
    <AbsoluteFill>
      <LuxBg />
      <Stage>
        <group position={[0, mix(enter, -3.2, POSE.y), 0]} rotation={[mix(enter, 0.6, -0.06), mix(enter, Math.PI * 1.15, 0.28) + Math.sin(f / 60) * 0.05, shake]} scale={POSE.s}>
          <Phone screen="screens/profile.png" screen2="tex/gone.png" mix2={glitch} />
        </group>
        <Shadow position={[0, -1.18, -0.2]} w={1.9} d={0.5} opacity={enter * 0.9} />
        {icon.k > 0 && <Tile3D img="tex/ig.png" size={0.42} d={0.1} position={[0.64, 0.74 + icon.dy, 0.45]} rotation={[0.1, icon.ry - 0.35, 0.12]} scale={icon.s} />}
      </Stage>
      <Chip show={prog(f, tom - 2, 14, ease.out)} icon={<Ico.cal />} style={{left: 50, top: 990}}>
        Tomorrow · 9:42 AM
      </Chip>
      <div style={{position: 'absolute', right: 80, top: 1180, fontFamily: F.serif, fontSize: 230, ...GOLD_TEXT, opacity: prog(f, what, 12), transform: `rotate(10deg) scale(${mix(prog(f, what, 14, ease.out), 0.5, 1)})`}}>?</div>
    </AbsoluteFill>
  );
};

/* ---------------- 2 · what you lose ---------------- */
const DMS = ['Price for a Shopify store?', 'Can you build my website?', 'Are you available this week?'];
const POSTS: {img: string; to: [number, number, number]; rz: number}[] = [
  {img: 'posts/p1.png', to: [0.66, 0.42, 0.3], rz: -0.1},
  {img: 'posts/p2.png', to: [0.72, -0.2, 0.45], rz: 0.06},
  {img: 'posts/p3.png', to: [0.62, -0.82, 0.3], rz: -0.05},
];
export const Loss: React.FC = () => {
  const f = useCurrentFrame();
  const fol = fr(wordAt('loss', 0, 'followers'));
  const dm = fr(wordAt('loss', 0, 'dms'));
  const work = fr(wordAt('loss', 0, 'hard'));
  const click = fr(wordAt('loss', 1, 'click'));
  const end = fr(cue('loss', 1, 'end'));
  const fall = prog(f, click + 4, 18, ease.in);
  const gone = prog(f, click + 2, 6);
  const black = prog(f, end + 2, 6);
  const cursor = prog(f, click - 22, 18, ease.inOut);
  const tap = prog(f, click - 2, 3) * (1 - prog(f, click + 2, 5));
  return (
    <AbsoluteFill>
      <LuxBg />
      <Stage>
        <group position={[-0.12, POSE.y, 0]} rotation={[-0.06, 0.28 + Math.sin(f / 60) * 0.05, 0]} scale={POSE.s}>
          <Phone screen="screens/profile.png" screen2="tex/gone.png" mix2={gone} />
        </group>
        <Shadow position={[-0.12, -1.18, -0.2]} w={1.9} d={0.5} opacity={0.9} />
        {POSTS.map((p, i) => {
          const k = prog(f, work - 6 + i * 6, 20, ease.out);
          if (k <= 0) return null;
          return (
            <Card3D
              key={p.img}
              img={p.img}
              w={0.42}
              h={0.56}
              r={0.04}
              position={[mix(k, -0.1, p.to[0]), mix(k, 0, p.to[1]) - fall * 2.6 + Math.sin((f + i * 20) / 24) * 0.025, mix(k, -0.2, p.to[2])]}
              rotation={[fall * 0.8, mix(k, 0.6, -0.35), p.rz * k + fall * 0.9]}
              scale={mix(k, 0.3, 1)}
            />
          );
        })}
      </Stage>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - fall, transform: `translateY(${fall * 380}px)`}}>
        <Chip show={prog(f, fol - 2, 14, ease.out)} icon={<Ico.users />} style={{left: 40, top: 760}}>
          Your followers
        </Chip>
        {DMS.map((d, i) => (
          <Chip key={d} show={prog(f, dm + i * 6, 14, ease.out)} icon={<Ico.chat />} style={{left: 40, top: 900 + i * 118, fontSize: 25}}>
            {d}
          </Chip>
        ))}
      </div>
      {cursor > 0 && fall < 1 && (
        <div style={{position: 'absolute', left: mix(cursor, 900, 500), top: mix(cursor, 1520, 1040), transform: `scale(${1.6 - tap * 0.3})`, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))'}}>
          <svg width={70} height={70} viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z" fill="#F3EBDD" stroke="#0B0A09" strokeWidth={1.2} strokeLinejoin="round" /></svg>
        </div>
      )}
      {black > 0 && (
        <AbsoluteFill style={{background: '#000', opacity: black, display: 'grid', placeItems: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 230, letterSpacing: '-0.04em', color: '#F3EBDD', transform: `scale(${mix(prog(f, end + 2, 14, ease.out), 1.15, 1)})`, filter: `blur(${(1 - prog(f, end + 2, 8)) * 10}px)`}}>
            Gone<span style={GOLD_TEXT}>.</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 3 · the risk ---------------- */
const ALERTS = [
  {w: 'hacked', tex: 'tex/lock.png', title: 'Account hacked', sub: 'Password changed by someone else'},
  {w: 'reported', tex: 'tex/flag.png', title: 'Mass reported', sub: '27 reports received'},
  {w: 'disabled', tex: 'tex/ban.png', title: 'Account disabled', sub: 'Your account has been disabled'},
];
const ROW_Y = [700, 880, 1060];
export const Risk: React.FC = () => {
  const f = useCurrentFrame();
  const why = fr(wordAt('risk', 0, 'no reason'));
  return (
    <AbsoluteFill>
      <LuxBg intensity={0.6} />
      {ALERTS.map((a, i) => {
        const at = fr(wordAt('risk', 0, a.w)) - 3;
        const p = prog(f, at, 14, ease.out);
        const next = i < ALERTS.length - 1 ? fr(wordAt('risk', 0, ALERTS[i + 1].w)) - 3 : Infinity;
        const latest = f < next;
        return (
          <div key={a.w} style={{position: 'absolute', left: 90, right: 90, top: ROW_Y[i] - 75, opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
            <div style={{...GLASS, height: 150, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px 0 190px', borderRadius: 30, border: latest ? '1.5px solid rgba(229,72,77,0.7)' : GLASS.border, boxShadow: latest ? `0 0 50px rgba(229,72,77,0.25), ${GLASS.boxShadow}` : GLASS.boxShadow, fontFamily: F.body}}>
              <div style={{flex: 1}}>
                <div style={{color: '#F3EBDD', fontWeight: 800, fontSize: 36}}>{a.title}</div>
                <div style={{color: '#A89C88', fontWeight: 500, fontSize: 25, marginTop: 4}}>{a.sub}</div>
              </div>
              <div style={{color: '#A89C88', fontSize: 22}}>now</div>
            </div>
          </div>
        );
      })}
      <Stage>
        {ALERTS.map((a, i) => {
          const sp = pop(f, fr(wordAt('risk', 0, a.w)) - 3, 18);
          if (sp.k <= 0) return null;
          return <Tile3D key={a.w} img={a.tex} size={0.27} d={0.08} position={[-0.68, (960 - ROW_Y[i]) / 512 + sp.dy * 0.3, 0.5]} rotation={[0.08, sp.ry * 0.6 + 0.25, 0]} scale={sp.s} />;
        })}
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1250, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 999, border: '2px solid #C9A24A', background: 'rgba(201,162,74,0.08)', color: '#E9CD86', fontFamily: F.body, fontWeight: 700, fontSize: 32, opacity: prog(f, why, 12), transform: `scale(${mix(prog(f, why, 14, ease.out), 0.8, 1)})`}}>
          <Ico.q s={34} /> No reason given.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 4 · your own CRM ---------------- */
const SOURCES = [
  {kind: 'svg', src: 'icons/whatsapp-icon.svg', x: -0.6},
  {kind: 'svg', src: 'icons/shopify.svg', x: -0.2},
  {kind: 'tile', src: 'tex/globe.png', x: 0.2},
  {kind: 'tile', src: 'tex/chat.png', x: 0.6},
];
const SRC_STYLE: Record<string, React.CSSProperties> = {
  Website: {background: 'rgba(201,162,74,0.16)', color: '#E9CD86'},
  WhatsApp: {background: 'rgba(37,211,102,0.16)', color: '#5BE08F'},
  'Chat App': {background: '#F3EBDD', color: '#15120F'},
};
export const Crm: React.FC = () => {
  const f = useCurrentFrame();
  const crmW = fr(wordAt('crm', 0, 'crm'));
  const plat = fr(wordAt('crm', 0, "else's"));
  const cardIn = prog(f, 8, 22, ease.out);
  const leads = Math.round(mix(prog(f, crmW, 60, ease.out), 236, 248));
  const ig = pop(f, plat - 14, 16);
  const x = prog(f, plat + 6, 8, ease.out);
  const igFall = prog(f, plat + 22, 20, ease.in);
  const beam = prog(f, crmW - 4, 24, ease.inOut);
  return (
    <AbsoluteFill>
      <LuxBg intensity={0.8} />
      {/* beams from sources into the CRM */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {SOURCES.map((s, i) => {
          const sx = 540 + s.x * 512;
          return <line key={i} x1={sx} y1={560} x2={sx + (540 - sx) * 0.35 * beam} y2={560 + 70 * beam} stroke="#C9A24A" strokeOpacity={0.55 * beam} strokeWidth={3} strokeDasharray="6 8" />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 90, right: 90, top: 640, opacity: cardIn, transform: `perspective(1600px) rotateX(${mix(cardIn, 18, 4)}deg) translateY(${(1 - cardIn) * 80}px)`}}>
        <div style={{...GLASS, borderRadius: 34, padding: '28px 30px', fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <Img src={staticFile('brand/mark.png')} style={{height: 56}} />
            <div style={{flex: 1, fontFamily: F.display, fontWeight: 800, fontSize: 36, color: '#F3EBDD'}}>Your CRM</div>
            <div style={{padding: '8px 16px', borderRadius: 999, background: 'rgba(43,182,115,0.15)', color: '#4CD68E', fontWeight: 800, fontSize: 22}}>● Live</div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, marginTop: 22}}>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 66, lineHeight: 1, ...GOLD_TEXT}}>{leads}</div>
              <div style={{fontSize: 22, color: '#A89C88', marginTop: 4}}>Leads</div>
            </div>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 66, color: '#F3EBDD', lineHeight: 1}}>92</div>
              <div style={{fontSize: 22, color: '#A89C88', marginTop: 4}}>Customers</div>
            </div>
            <svg width={300} height={80} viewBox="0 0 300 80" style={{marginLeft: 'auto'}}>
              <defs>
                <linearGradient id="sl" x1="0" x2="1">
                  <stop offset="0" stopColor="#9C7A2C" />
                  <stop offset="1" stopColor="#F5DB97" />
                </linearGradient>
              </defs>
              <polyline points="0,70 40,62 80,66 120,48 160,52 200,30 240,36 300,8" fill="none" stroke="url(#sl)" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${prog(f, 12, 40) * 400} 400`} />
            </svg>
          </div>
          <div style={{marginTop: 20, fontSize: 21, fontWeight: 700, letterSpacing: '0.14em', color: '#A89C88'}}>NEW LEADS</div>
          {CRM_ROWS.map((r, i) => {
            const p = prog(f, crmW - 6 + i * 6, 14, ease.out);
            return (
              <div key={r.name} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '15px 0', borderTop: '1px solid rgba(243,235,221,0.08)', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <div style={{width: 50, height: 50, borderRadius: 99, background: 'rgba(201,162,74,0.16)', color: '#E9CD86', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 23}}>{r.name[0]}</div>
                <div style={{flex: 1, fontWeight: 700, fontSize: 27, color: '#F3EBDD'}}>{r.name}</div>
                <div style={{padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: 20, ...SRC_STYLE[r.src]}}>{r.src}</div>
                <div style={{width: 124, textAlign: 'center', padding: '6px 0', borderRadius: 10, fontWeight: 700, fontSize: 20, background: r.status === 'Customer' ? 'rgba(43,182,115,0.15)' : 'rgba(243,235,221,0.08)', color: r.status === 'Customer' ? '#4CD68E' : '#A89C88'}}>{r.status}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Stage>
        {SOURCES.map((s, i) => {
          const sp = pop(f, crmW - 14 + i * 4, 18);
          if (sp.k <= 0) return null;
          const pos: [number, number, number] = [s.x, 0.84 + sp.dy * 0.4, 0.3];
          return s.kind === 'svg' ? (
            <Logo3D key={s.src} url={s.src} size={0.3} depth={0.06} position={pos} rotation={[0, sp.ry, 0]} scale={sp.s} />
          ) : (
            <Tile3D key={s.src} img={s.src} size={0.28} d={0.07} position={pos} rotation={[0, sp.ry, 0]} scale={sp.s} />
          );
        })}
        {ig.k > 0 && igFall < 1 && <Tile3D img="tex/ig.png" size={0.36} d={0.09} position={[0.62, -0.98 + ig.dy - igFall * 2.4, 0.6]} rotation={[igFall * 1.2, ig.ry * 0.5 - 0.3, -0.1 + igFall * 1.6]} scale={ig.s} />}
      </Stage>
      {x > 0 && igFall < 0.3 && (
        <div style={{position: 'absolute', left: 540 + 0.62 * 512 * 1.09 - 52, top: 960 + 0.98 * 512 * 1.09 - 52, width: 104, height: 104, borderRadius: 99, background: '#E5484D', color: '#fff', fontSize: 64, fontWeight: 800, display: 'grid', placeItems: 'center', transform: `scale(${mix(x, 1.6, 1)})`, opacity: 1 - igFall * 3, boxShadow: '0 10px 30px rgba(229,72,77,0.5)'}}>×</div>
      )}
      <Chip show={prog(f, plat + 36, 14, ease.out)} gold icon={<Ico.check s={30} />} style={{left: 0, right: 0, top: 1440, margin: '0 auto', width: 'fit-content'}}>
        Saved in your own CRM
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------- 5 · AI + your own chat app ---------------- */
const FLOW = [
  {icon: <Ico.user s={28} />, label: 'Lead'},
  {icon: <Ico.bolt s={28} />, label: 'AI'},
  {icon: <Ico.db s={28} />, label: 'CRM'},
];
export const Ai: React.FC = () => {
  const f = useCurrentFrame();
  const ai = fr(wordAt('ai', 0, 'ai automation'));
  const app = fr(wordAt('ai', 0, 'chat app'));
  const resp = fr(wordAt('ai', 1, 'responses'));
  const sleep = fr(wordAt('ai', 1, 'sleeping'));
  const phoneIn = prog(f, app - 12, 28, ease.out);
  const moon = pop(f, sleep - 8, 22);
  const dot = ((f - ai) % 45) / 45;
  return (
    <AbsoluteFill>
      <LuxBg intensity={0.7} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 470, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{position: 'absolute', left: 60, right: 60, top: 43, height: 3, background: 'rgba(243,235,221,0.1)'}}>
          <div style={{width: `${prog(f, ai, 20) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #9C7A2C, #F5DB97)'}} />
          {f > ai + 20 && <div style={{position: 'absolute', left: `${dot * 100}%`, top: -7, width: 17, height: 17, borderRadius: 99, background: '#F5DB97', boxShadow: '0 0 20px #F5DB97'}} />}
        </div>
        {FLOW.map((n, i) => {
          const p = prog(f, ai - 4 + i * 5, 14, ease.out);
          const mid = i === 1;
          return (
            <div key={n.label} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: mid ? '16px 28px' : '12px 22px', borderRadius: 999, ...(mid ? {background: 'linear-gradient(140deg, #F5DB97, #C9A24A 60%, #A8832F)', color: '#1A1206', boxShadow: '0 0 50px rgba(201,162,74,0.45)'} : {...GLASS, color: '#F3EBDD'}), fontFamily: F.body, fontWeight: 800, fontSize: mid ? 32 : 26, opacity: p, transform: `scale(${mix(p, 0.6, 1)})`}}>
              {n.icon}
              {n.label}
            </div>
          );
        })}
      </div>
      <Stage>
        <group position={[0, mix(phoneIn, -3.2, -0.3), 0]} rotation={[-0.05, mix(phoneIn, -1.2, -0.2) + Math.sin(f / 55) * 0.05, 0]} scale={0.8}>
          <Phone screen="tex/chat1.png" screen2="tex/chat2.png" mix2={prog(f, resp, 14)} />
        </group>
        <Shadow position={[0, -1.18, -0.2]} w={1.7} d={0.45} opacity={phoneIn * 0.9} />
        {moon.k > 0 && <Moon3D position={[0.66, 0.6 + moon.dy * 0.3, 0.4]} rotation={[0.1, moon.ry * 0.5, -0.4]} scale={0.34 * moon.s} />}
      </Stage>
      <Chip show={prog(f, resp + 6, 14, ease.out)} gold icon={<Ico.bolt s={28} />} style={{left: 40, top: 1250}}>
        Replied in 3 sec
      </Chip>
      <Chip show={prog(f, sleep, 14, ease.out)} icon={<Ico.moon s={28} />} style={{right: 40, top: 830}}>
        2:47 AM · you're asleep
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------- 6 · Instagram comes or goes ---------------- */
const SYS = [
  {tex: 'tex/globe.png', title: 'Website', sub: 'Your domain'},
  {tex: 'tex/db.png', title: 'CRM', sub: 'Your data'},
  {tex: 'tex/chat.png', title: 'Chat App', sub: 'AI · 24/7'},
];
const CARD_X = [-0.64, 0, 0.64];
export const Keep: React.FC = () => {
  const f = useCurrentFrame();
  const comes = fr(wordAt('keep', 0, 'comes'));
  const goes = fr(wordAt('keep', 0, 'goes'));
  const run = fr(wordAt('keep', 0, 'running'));
  const ig = pop(f, comes - 6, 14);
  const igOut = prog(f, goes, 20, ease.in);
  const leads = Math.round(mix(prog(f, 10, 110, ease.soft), 248, 257));
  return (
    <AbsoluteFill>
      <LuxBg />
      <div style={{position: 'absolute', left: 60, right: 60, top: 790, display: 'flex', gap: 22, perspective: 1600}}>
        {SYS.map((s, i) => {
          const p = prog(f, 8 + i * 6, 18, ease.out);
          const mid = i === 1;
          return (
            <div key={s.title} style={{flex: 1, opacity: p, transform: `translateY(${(1 - p) * 80 + (mid ? -30 : 0)}px) rotateY(${(i - 1) * -10}deg)`}}>
              <div style={{...GLASS, borderRadius: 28, padding: '110px 18px 26px', textAlign: 'center', border: mid ? '1.5px solid #C9A24A' : GLASS.border, boxShadow: mid ? `0 0 60px rgba(201,162,74,0.3), ${GLASS.boxShadow}` : GLASS.boxShadow, fontFamily: F.body}}>
                <div style={{color: '#F3EBDD', fontWeight: 800, fontSize: 32}}>{s.title}</div>
                <div style={{marginTop: 4, color: '#A89C88', fontSize: 22}}>{s.sub}</div>
                {mid && <div style={{marginTop: 12, fontFamily: F.display, fontWeight: 800, fontSize: 56, ...GOLD_TEXT}}>{leads}</div>}
                {mid && <div style={{color: '#A89C88', fontSize: 20}}>leads</div>}
                <div style={{marginTop: 14, display: 'inline-block', padding: '6px 14px', borderRadius: 999, background: 'rgba(43,182,115,0.15)', color: '#4CD68E', fontWeight: 800, fontSize: 20}}>● Live</div>
              </div>
            </div>
          );
        })}
      </div>
      <Stage>
        {ig.k > 0 && igOut < 1 && <Tile3D img="tex/ig.png" size={0.5} d={0.12} position={[0, 0.86 + ig.dy - igOut * 0.4, 0.4 - igOut * 2]} rotation={[igOut * 0.8, ig.ry * 0.4, igOut * 0.6]} scale={ig.s * (1 - igOut * 0.6)} />}
        {SYS.map((s, i) => {
          const sp = pop(f, 10 + i * 6, 20);
          if (sp.k <= 0) return null;
          return <Tile3D key={s.tex} img={s.tex} size={0.2} d={0.06} position={[CARD_X[i] * 0.98, (960 - (i === 1 ? 820 : 850)) / 512, 0.45]} rotation={[0.1, sp.ry * 0.5 + (1 - i) * 0.2, 0]} scale={sp.s} />;
        })}
      </Stage>
      <Chip show={prog(f, run - 4, 14, ease.out)} gold icon={<Ico.check s={30} />} style={{left: 0, right: 0, top: 1320, margin: '0 auto', width: 'fit-content'}}>
        Running 24/7
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------- 7 · build your own system ---------------- */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const av = prog(f, 6, 20, ease.out);
  const logo = prog(f, 16, 24, ease.out);
  const sweep = prog(f, 34, 34, ease.inOut);
  const serv = prog(f, 40, 16, ease.out);
  const site = prog(f, 50, 16, ease.out);
  return (
    <AbsoluteFill>
      <LuxBg intensity={1.1} />
      {/* founder photo in a gold ring */}
      <div style={{position: 'absolute', left: 540 - 125, top: 400, width: 250, height: 250, borderRadius: 999, padding: 5, background: 'conic-gradient(from 200deg, #F5DB97, #9C7A2C, #F5DB97, #C9A24A, #F5DB97)', boxShadow: '0 0 60px rgba(201,162,74,0.45)', opacity: av, transform: `scale(${mix(av, 0.7, 1)})`}}>
        <Img src={staticFile('brand/avatar.png')} style={{width: '100%', height: '100%', borderRadius: 999, objectFit: 'cover', transform: 'scale(1.12)'}} />
      </div>
      {/* the real logo with a light sweep */}
      <div style={{position: 'absolute', left: 540 - 400, top: 700, width: 800, height: 521, opacity: logo, transform: `translateY(${(1 - logo) * 40}px) scale(${mix(logo, 0.94, 1)})`, filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.6))`}}>
        <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, transparent ${mix(sweep, -30, 100)}%, rgba(255,250,235,0.85) ${mix(sweep, -20, 110)}%, transparent ${mix(sweep, -10, 120)}%)`,
            WebkitMaskImage: `url(${staticFile('brand/logo.png')})`,
            maskImage: `url(${staticFile('brand/logo.png')})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            mixBlendMode: 'screen',
          }}
        />
      </div>
      <div style={{position: 'absolute', left: 540 - 440, top: 1250, width: 880, height: 116, opacity: serv, transform: `translateY(${(1 - serv) * 20}px)`}}>
        <Img src={staticFile('brand/services.png')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', top: 1420, left: 0, right: 0, textAlign: 'center', opacity: site, transform: `translateY(${(1 - site) * 20}px)`}}>
        <div style={{display: 'inline-block', padding: '20px 44px', borderRadius: 999, background: 'linear-gradient(140deg, #F5DB97, #C9A24A 60%, #A8832F)', color: '#120D05', fontFamily: F.display, fontWeight: 800, fontSize: 46, boxShadow: '0 20px 60px rgba(201,162,74,0.4)'}}>{BRAND.site}</div>
      </div>
    </AbsoluteFill>
  );
};

// keep the light palette tokens referenced for the shared components
void C;

/* ---------------- 8 · the offer: website + CRM + AI ---------------- */
const OFFER = [
  {w: 'website', tex: 'tex/globe.png', label: 'Website', x: -0.64},
  {w: 'crm', tex: 'tex/db.png', label: 'CRM', x: 0},
  {w: 'ai-powered', tex: 'tex/bolt.png', label: 'AI Automation', x: 0.64},
];
export const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const ats = OFFER.map((o) => fr(wordAt('offer', 0, o.w)) - 4);
  const link = prog(f, ats[2] + 6, 24, ease.inOut);
  const badge = prog(f, ats[2] + 22, 14, ease.out);
  return (
    <AbsoluteFill>
      <LuxBg intensity={1.1} />
      {/* empty slots the three parts land in */}
      {OFFER.map((o, i) => {
        const p = prog(f, 4 + i * 4, 14, ease.out) * (1 - prog(f, ats[i] + 6, 8));
        return <div key={o.label + 'slot'} style={{position: 'absolute', left: 540 + o.x * 512 - 112, top: 812 - 112, width: 224, height: 224, borderRadius: 52, border: '3px dashed rgba(226,190,104,0.45)', opacity: p, transform: `scale(${mix(p, 0.8, 1)})`}} />;
      })}
      {/* the three parts join into one system */}
      <div style={{position: 'absolute', left: 540 - 0.64 * 512, width: 2 * 0.64 * 512 * link, top: 812, height: 4, borderRadius: 4, background: 'linear-gradient(90deg, #9C7A2C, #F5DB97, #9C7A2C)', boxShadow: '0 0 20px rgba(226,190,104,0.6)'}} />
      <Stage>
        {OFFER.map((o, i) => {
          const sp = pop(f, ats[i], 20);
          if (sp.k <= 0) return null;
          return <Tile3D key={o.tex} img={o.tex} size={0.4} d={0.11} position={[o.x, 0.29 + sp.dy * 0.4, 0.4]} rotation={[0.08, sp.ry * 0.7 + (i - 1) * -0.25, 0]} scale={sp.s * (1 + Math.sin(prog(f, ats[i] + 14, 10) * Math.PI) * 0.06)} />;
        })}
      </Stage>
      {OFFER.map((o, i) => {
        const p = prog(f, ats[i] + 8, 12, ease.out);
        return (
          <div key={o.label} style={{position: 'absolute', top: 990, left: 540 + o.x * 512 - 170, width: 340, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 38, ...GOLD_TEXT}}>{o.label}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, display: 'flex', justifyContent: 'center', opacity: badge, transform: `translateY(${(1 - badge) * 30}px)`}}>
        <div style={{...GLASS, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px', borderRadius: 999, fontFamily: F.body, fontWeight: 700, fontSize: 30, color: '#F3EBDD'}}>
          <Img src={staticFile('brand/mark.png')} style={{height: 44}} />
          One system · Built for UAE brands
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 9 · comment DETAILS → we DM you ---------------- */
const OTHERS = [
  {u: 'ahmed.dxb', t: 'DETAILS', ago: '2m'},
  {u: 'fatima.boutique.ae', t: 'DETAILS 🙌', ago: '5m'},
];
export const Details: React.FC = () => {
  const f = useCurrentFrame();
  const word = fr(wordAt('details', 0, 'details'));
  const dms = fr(wordAt('details', 0, 'dms'));
  const end = fr(cue('details', 0, 'end'));
  const sheet = prog(f, 4, 20, ease.out);
  const typeP = prog(f, word - 6, 16, (x) => x);
  const typed = 'DETAILS'.slice(0, Math.round(typeP * 7));
  const sent = prog(f, word + 14, 10, ease.out);
  const press = prog(f, word + 11, 3) * (1 - prog(f, word + 15, 6));
  const dm = prog(f, dms - 8, 16, ease.out);
  const out = prog(f, end + 4, 14, ease.in);
  const lock = prog(f, end + 12, 22, ease.out);
  const sweep = prog(f, end + 26, 34, ease.inOut);
  const site = prog(f, end + 30, 16, ease.out);
  return (
    <AbsoluteFill>
      <LuxBg intensity={1.1} />
      <div style={{opacity: 1 - out, transform: `scale(${1 - out * 0.05})`}}>
        {/* Instagram DM arriving */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 420, opacity: dm, transform: `translateY(${(1 - dm) * -80}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 30, background: 'rgba(245,242,236,0.96)', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', fontFamily: F.body}}>
            <Img src={staticFile('brand/avatar.png')} style={{width: 76, height: 76, borderRadius: 99, objectFit: 'cover', border: '3px solid #C9A24A'}} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: '#6E6A63', fontWeight: 600}}>
                <span>INSTAGRAM · DIRECT</span>
                <span>now</span>
              </div>
              <div style={{fontWeight: 800, fontSize: 28, color: '#15120F'}}>asaadix_digital</div>
              <div style={{fontSize: 25, color: '#2A2621'}}>Hi! Here are all the details for your website, CRM & AI system 👇</div>
            </div>
          </div>
        </div>
        {/* comment sheet */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 720, opacity: sheet, transform: `translateY(${(1 - sheet) * 80}px)`}}>
          <div style={{...GLASS, borderRadius: 34, padding: '24px 26px', fontFamily: F.body}}>
            <div style={{textAlign: 'center', fontWeight: 800, fontSize: 28, color: '#F3EBDD', marginBottom: 10}}>Comments</div>
            {OTHERS.map((c, i) => (
              <div key={c.u} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', opacity: prog(f, 10 + i * 8, 12), borderTop: '1px solid rgba(243,235,221,0.08)'}}>
                <div style={{width: 58, height: 58, borderRadius: 99, background: i ? 'linear-gradient(140deg, #6B4F2E, #2A2117)' : 'linear-gradient(140deg, #3A4A5A, #1C242C)', color: '#F3EBDD', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{c.u[0].toUpperCase()}</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 22, color: '#A89C88', fontWeight: 600}}>{c.u} · {c.ago}</div>
                  <div style={{fontSize: 30, color: '#F3EBDD', fontWeight: 800}}>{c.t}</div>
                </div>
              </div>
            ))}
            {sent > 0 && (
              <div style={{display: 'grid', gridTemplateRows: `${sent}fr`}}>
                <div style={{minHeight: 0, overflow: 'hidden'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(243,235,221,0.08)'}}>
                    <div style={{width: 58, height: 58, borderRadius: 99, background: 'linear-gradient(140deg, #F5DB97, #C9A24A)', color: '#15120F', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>Y</div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 22, color: '#A89C88', fontWeight: 600}}>you · now</div>
                      <div style={{fontSize: 32, fontWeight: 900, ...GOLD_TEXT}}>DETAILS</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12}}>
              <div style={{flex: 1, height: 78, borderRadius: 999, border: '1.5px solid rgba(226,190,104,0.35)', display: 'flex', alignItems: 'center', paddingLeft: 28, fontFamily: F.display, fontWeight: 800, fontSize: 36, color: '#F3EBDD'}}>
                {typed && sent < 0.5 ? (
                  <span>
                    {typed}
                    <span style={{color: '#C9A24A', opacity: Math.floor(f / 10) % 2 ? 1 : 0}}>|</span>
                  </span>
                ) : (
                  <span style={{color: '#6E6457', fontFamily: F.body, fontWeight: 500, fontSize: 28}}>Add a comment…</span>
                )}
              </div>
              <div style={{width: 78, height: 78, borderRadius: 99, background: 'linear-gradient(140deg, #F5DB97, #C9A24A)', display: 'grid', placeItems: 'center', transform: `scale(${1 - press * 0.15})`, boxShadow: '0 0 30px rgba(201,162,74,0.45)'}}>
                <svg width={34} height={34} viewBox="0 0 24 24"><path d="M3 11.5L21 3l-7.5 18-2.6-7.4z" fill="#15120F" /></svg>
              </div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center', opacity: prog(f, word, 12), transform: `scale(${mix(prog(f, word, 14, ease.out), 0.85, 1)})`}}>
          <div style={{padding: '18px 40px', borderRadius: 999, background: 'linear-gradient(140deg, #F5DB97, #C9A24A 60%, #A8832F)', color: '#120D05', fontFamily: F.display, fontWeight: 900, fontSize: 44, letterSpacing: '0.02em', boxShadow: '0 20px 60px rgba(201,162,74,0.4)'}}>Comment “DETAILS”</div>
        </div>
      </div>
      {/* final lockup */}
      {lock > 0 && (
        <>
          <div style={{position: 'absolute', left: 540 - 400, top: 560, width: 800, height: 521, opacity: lock, transform: `translateY(${(1 - lock) * 40}px) scale(${mix(lock, 0.94, 1)})`}}>
            <Img src={staticFile('brand/logo.png')} style={{width: '100%', height: '100%'}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${mix(sweep, -30, 100)}%, rgba(255,250,235,0.85) ${mix(sweep, -20, 110)}%, transparent ${mix(sweep, -10, 120)}%)`, WebkitMaskImage: `url(${staticFile('brand/logo.png')})`, maskImage: `url(${staticFile('brand/logo.png')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'screen'}} />
          </div>
          <div style={{position: 'absolute', left: 540 - 440, top: 1110, width: 880, height: 116, opacity: lock}}>
            <Img src={staticFile('brand/services.png')} style={{width: '100%', height: '100%'}} />
          </div>
          <div style={{position: 'absolute', top: 1290, left: 0, right: 0, textAlign: 'center', opacity: site, transform: `translateY(${(1 - site) * 20}px)`}}>
            <div style={{display: 'inline-block', padding: '20px 44px', borderRadius: 999, background: 'linear-gradient(140deg, #F5DB97, #C9A24A 60%, #A8832F)', color: '#120D05', fontFamily: F.display, fontWeight: 800, fontSize: 46, boxShadow: '0 20px 60px rgba(201,162,74,0.4)'}}>{BRAND.site}</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
