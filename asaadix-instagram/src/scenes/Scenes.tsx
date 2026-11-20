import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BIZ, BRAND, CRM_ROWS, cue, wordAt} from '../config';
import {C, F, SHADOW} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {Stage} from '../three/Stage';
import {Card3D, Phone, Shadow} from '../three/kit';
import {Chip, DarkBg, IgLogo, Ico, LightBg} from '../components/ui';
import {AMark} from '../components/AsaadixLogo';

const fr = (s: number) => Math.round(s * 30);
const POSE = {y: -0.22, s: 0.85};

/* ---------------- 1 · hook ---------------- */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const ig = fr(wordAt('hook', 0, 'instagram'));
  const dis = fr(wordAt('hook', 0, 'disappears'));
  const tom = fr(wordAt('hook', 0, 'tomorrow'));
  const what = fr(wordAt('hook', 0, 'what'));
  const enter = prog(f, 0, 28, ease.out);
  const glitch = f >= dis && f < dis + 16 && f % 4 < 2 ? 1 : 0;
  const shake = f >= dis && f < dis + 16 ? Math.sin(f * 2.3) * 0.03 : 0;
  return (
    <AbsoluteFill>
      <LightBg />
      <Stage>
        <group position={[0, mix(enter, -3, POSE.y), 0]} rotation={[mix(enter, 0.5, -0.08), mix(enter, 1.1, 0.3) + Math.sin(f / 60) * 0.05, shake]} scale={POSE.s}>
          <Phone screen="tex/ig.png" screen2="tex/gone.png" mix2={glitch} />
        </group>
        <Shadow position={[0, -1.25, -0.2]} w={1.9} d={0.55} opacity={enter} />
      </Stage>
      <div style={{position: 'absolute', left: 700, top: 560, opacity: prog(f, ig, 10), transform: `scale(${mix(prog(f, ig, 12, ease.out), 0.4, 1)}) rotate(${mix(prog(f, ig, 12), -20, 8)}deg)`}}>
        <IgLogo size={130} />
      </div>
      <Chip show={prog(f, tom - 2, 12, ease.out)} icon={<Ico.cal />} style={{left: 60, top: 980}}>
        Tomorrow · 9:42 AM
      </Chip>
      <div style={{position: 'absolute', right: 90, top: 1180, fontFamily: F.serif, fontSize: 220, color: C.gold, opacity: prog(f, what, 10), transform: `rotate(10deg) scale(${mix(prog(f, what, 12, ease.out), 0.5, 1)})`}}>?</div>
    </AbsoluteFill>
  );
};

/* ---------------- 2 · what you lose ---------------- */
const DM_POS = [960, 1080, 1200];
export const Loss: React.FC = () => {
  const f = useCurrentFrame();
  const fol = fr(wordAt('loss', 0, 'followers'));
  const dm = fr(wordAt('loss', 0, 'dms'));
  const work = fr(wordAt('loss', 0, 'hard'));
  const click = fr(wordAt('loss', 1, 'click'));
  const end = fr(cue('loss', 1, 'end'));
  const fall = prog(f, click + 4, 16, ease.in);
  const gone = prog(f, click + 2, 6);
  const black = prog(f, end + 2, 5);
  const cursor = prog(f, click - 22, 18, ease.inOut);
  const tap = prog(f, click - 2, 3) * (1 - prog(f, click + 2, 5));
  const count = Math.round(prog(f, fol, 30, ease.out) * BIZ.followers);
  const drop = (base: number) => ({opacity: base * (1 - fall), transform: `translateY(${fall * 400}px) rotate(${fall * 14}deg)`});
  return (
    <AbsoluteFill>
      <LightBg />
      <Stage>
        <group position={[0, POSE.y - fall * 0.1, 0]} rotation={[-0.08, 0.3 + Math.sin(f / 60) * 0.05, 0]} scale={POSE.s}>
          <Phone screen="tex/ig.png" screen2="tex/gone.png" mix2={gone} />
        </group>
        <Shadow position={[0, -1.25, -0.2]} w={1.9} d={0.55} />
      </Stage>
      <div style={{position: 'absolute', inset: 0, ...drop(1)}}>
        <Chip show={prog(f, fol - 2, 12, ease.out)} icon={<Ico.users />} style={{right: 50, top: 720}}>
          {count.toLocaleString('en-US')} followers
        </Chip>
        {BIZ.dms.map((d, i) => (
          <Chip key={d} show={prog(f, dm + i * 6, 12, ease.out)} icon={<Ico.chat />} style={{left: 40, top: DM_POS[i], fontSize: 25}}>
            {d}
          </Chip>
        ))}
        {[0, 1, 2].map((i) => {
          const p = prog(f, work + i * 5, 16, ease.out);
          const tiles = [['#E9DCC6', '#B89466'], ['#1C1A18', '#5A4A36'], ['#D8C3A2', '#8C6B44']];
          return (
            <div key={i} style={{position: 'absolute', left: 700 + i * 70, top: 1130 + i * 40, width: 170, height: 220, borderRadius: 18, background: `linear-gradient(150deg, ${tiles[i][0]}, ${tiles[i][1]})`, boxShadow: SHADOW.card, border: '4px solid #fff', opacity: p, transform: `translate(${(1 - p) * -200}px, ${(1 - p) * -100}px) rotate(${mix(p, 0, -8 + i * 8)}deg)`}} />
          );
        })}
      </div>
      {/* the click */}
      {cursor > 0 && fall < 1 && (
        <div style={{position: 'absolute', left: mix(cursor, 900, 560), top: mix(cursor, 1500, 1080), transform: `scale(${1.6 - tap * 0.3})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))'}}>
          <Ico.cursor s={64} />
        </div>
      )}
      {/* Gone. */}
      {black > 0 && (
        <AbsoluteFill style={{background: C.night, opacity: black, display: 'grid', placeItems: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 220, letterSpacing: '-0.04em', color: C.cream, transform: `scale(${mix(prog(f, end + 2, 10, ease.out), 1.2, 1)})`}}>
            Gone<span style={{color: C.gold}}>.</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------------- 3 · the risk ---------------- */
const ALERTS = [
  {w: 'hacked', icon: <Ico.lock s={34} />, title: 'Account hacked', sub: 'Password changed by someone else'},
  {w: 'reported', icon: <Ico.flag s={34} />, title: 'Mass reported', sub: '27 reports received'},
  {w: 'disabled', icon: <Ico.ban s={34} />, title: 'Account disabled', sub: 'Your account has been disabled'},
];
export const Risk: React.FC = () => {
  const f = useCurrentFrame();
  const why = fr(wordAt('risk', 0, 'no reason'));
  return (
    <AbsoluteFill>
      <DarkBg />
      {ALERTS.map((a, i) => {
        const at = fr(wordAt('risk', 0, a.w)) - 3;
        const p = prog(f, at, 12, ease.out);
        const next = i < ALERTS.length - 1 ? fr(wordAt('risk', 0, ALERTS[i + 1].w)) - 3 : Infinity;
        const latest = f < next;
        return (
          <div key={a.w} style={{position: 'absolute', left: 100, right: 100, top: 620 + i * 175, opacity: p, transform: `translateY(${(1 - p) * 60}px) scale(${mix(p, 0.92, 1)})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 26px', borderRadius: 26, background: C.night2, border: `1.5px solid ${latest ? 'rgba(229,72,77,0.65)' : C.lineDark}`, boxShadow: latest ? `0 0 40px rgba(229,72,77,0.25), ${SHADOW.dark}` : SHADOW.dark, fontFamily: F.body}}>
              <div style={{width: 74, height: 74, borderRadius: 20, background: C.alert, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0}}>{a.icon}</div>
              <div style={{flex: 1}}>
                <div style={{color: C.cream, fontWeight: 800, fontSize: 34}}>{a.title}</div>
                <div style={{color: C.mutedDark, fontWeight: 500, fontSize: 25, marginTop: 4}}>{a.sub}</div>
              </div>
              <div style={{color: C.mutedDark, fontSize: 22}}>now</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 26px', borderRadius: 999, border: `2px solid ${C.gold}`, color: C.goldBright, fontFamily: F.body, fontWeight: 700, fontSize: 30, opacity: prog(f, why, 10), transform: `scale(${mix(prog(f, why, 12, ease.out), 0.8, 1)})`}}>
          <Ico.q s={32} /> No reason given.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 4 · your own CRM ---------------- */
const SRC_STYLE: Record<string, React.CSSProperties> = {
  Website: {background: C.goldSoft, color: C.goldDeep},
  WhatsApp: {background: 'rgba(37,211,102,0.14)', color: '#128C4B'},
  'Chat App': {background: C.ink, color: C.goldBright},
};
export const Crm: React.FC = () => {
  const f = useCurrentFrame();
  const crmW = fr(wordAt('crm', 0, 'crm'));
  const plat = fr(wordAt('crm', 0, "else's"));
  const cardIn = prog(f, 6, 18, ease.out);
  const leads = Math.round(mix(prog(f, crmW, 60, ease.out), 236, 248));
  const rented = prog(f, plat - 12, 12, ease.out);
  const x = prog(f, plat + 6, 8, ease.out);
  const rentedOut = prog(f, plat + 26, 14, ease.in);
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{position: 'absolute', left: 80, right: 80, top: 560, opacity: cardIn, transform: `perspective(1600px) rotateX(${mix(cardIn, 20, 6)}deg) translateY(${(1 - cardIn) * 80}px)`}}>
        <div style={{background: '#fff', borderRadius: 34, padding: '28px 30px', boxShadow: SHADOW.card, fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 58, height: 58, borderRadius: 16, background: C.ink, display: 'grid', placeItems: 'center'}}>
              <AMark size={38} />
            </div>
            <div style={{flex: 1, fontFamily: F.display, fontWeight: 800, fontSize: 36, color: C.ink}}>Your CRM</div>
            <div style={{padding: '8px 16px', borderRadius: 999, background: 'rgba(43,182,115,0.12)', color: C.ok, fontWeight: 800, fontSize: 22}}>● Live</div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, marginTop: 24}}>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 66, color: C.ink, lineHeight: 1}}>{leads}</div>
              <div style={{fontSize: 22, color: C.muted, marginTop: 4}}>Leads</div>
            </div>
            <div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 66, color: C.ink, lineHeight: 1}}>92</div>
              <div style={{fontSize: 22, color: C.muted, marginTop: 4}}>Customers</div>
            </div>
            <svg width={300} height={80} viewBox="0 0 300 80" style={{marginLeft: 'auto'}}>
              <polyline points="0,70 40,62 80,66 120,48 160,52 200,30 240,36 300,8" fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${prog(f, 10, 40) * 400} 400`} />
            </svg>
          </div>
          <div style={{marginTop: 22, fontSize: 21, fontWeight: 700, letterSpacing: '0.14em', color: C.muted}}>NEW LEADS</div>
          {CRM_ROWS.map((r, i) => {
            const p = prog(f, crmW - 6 + i * 6, 12, ease.out);
            return (
              <div key={r.name} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderTop: `1px solid ${C.line}`, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <div style={{width: 52, height: 52, borderRadius: 99, background: C.goldSoft, color: C.goldDeep, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24}}>{r.name[0]}</div>
                <div style={{flex: 1, fontWeight: 700, fontSize: 28, color: C.ink}}>{r.name}</div>
                <div style={{padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: 20, ...SRC_STYLE[r.src]}}>{r.src}</div>
                <div style={{width: 128, textAlign: 'center', padding: '6px 0', borderRadius: 10, fontWeight: 700, fontSize: 20, background: r.status === 'Customer' ? 'rgba(43,182,115,0.12)' : '#F2EEE6', color: r.status === 'Customer' ? C.ok : C.muted}}>{r.status}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* someone else's platform */}
      {rented > 0 && rentedOut < 1 && (
        <div style={{position: 'absolute', right: 60, top: 1270, opacity: rented * (1 - rentedOut), transform: `translateX(${(1 - rented) * 200 + rentedOut * 400}px) rotate(${rentedOut * 12}deg)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderRadius: 22, background: '#fff', boxShadow: SHADOW.card, fontFamily: F.body, position: 'relative'}}>
            <IgLogo size={56} />
            <div>
              <div style={{fontWeight: 800, fontSize: 26, color: C.ink}}>Someone else's platform</div>
              <div style={{fontSize: 21, color: C.muted}}>Your data, their rules</div>
            </div>
            {x > 0 && (
              <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
                <div style={{width: 90, height: 90, borderRadius: 99, background: C.alert, color: '#fff', fontSize: 56, fontWeight: 800, display: 'grid', placeItems: 'center', transform: `scale(${mix(x, 1.6, 1)})`, boxShadow: '0 10px 30px rgba(229,72,77,0.4)'}}>×</div>
              </div>
            )}
          </div>
        </div>
      )}
      <Chip show={prog(f, plat + 34, 12, ease.out)} gold icon={<Ico.check s={30} />} style={{left: 0, right: 0, top: 1300, margin: '0 auto', width: 'fit-content'}}>
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
  const phoneIn = prog(f, app - 10, 24, ease.out);
  const dot = ((f - ai) % 45) / 45;
  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{position: 'absolute', left: 120, right: 120, top: 470, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{position: 'absolute', left: 60, right: 60, top: 43, height: 3, background: C.lineDark}}>
          <div style={{width: `${prog(f, ai, 20) * 100}%`, height: '100%', background: C.gold}} />
          {f > ai + 20 && <div style={{position: 'absolute', left: `${dot * 100}%`, top: -7, width: 17, height: 17, borderRadius: 99, background: C.goldBright, boxShadow: `0 0 18px ${C.goldBright}`}} />}
        </div>
        {FLOW.map((n, i) => {
          const p = prog(f, ai - 4 + i * 5, 12, ease.out);
          const mid = i === 1;
          return (
            <div key={n.label} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: mid ? '16px 26px' : '12px 20px', borderRadius: 999, background: mid ? `linear-gradient(140deg, ${C.goldBright}, ${C.gold})` : C.night2, color: mid ? '#1A1206' : C.cream, border: mid ? undefined : `1px solid ${C.lineDark}`, fontFamily: F.body, fontWeight: 800, fontSize: mid ? 32 : 26, opacity: p, transform: `scale(${mix(p, 0.6, 1)})`, boxShadow: mid ? `0 0 40px ${C.goldGlow}` : undefined}}>
              {n.icon}
              {n.label}
            </div>
          );
        })}
      </div>
      <Stage>
        <group position={[0, mix(phoneIn, -3, -0.32), 0]} rotation={[-0.06, -0.22 + Math.sin(f / 55) * 0.05, 0]} scale={0.78}>
          <Phone screen="tex/chat1.png" screen2="tex/chat2.png" mix2={prog(f, resp, 12)} />
        </group>
      </Stage>
      <Chip dark show={prog(f, resp + 6, 12, ease.out)} gold icon={<Ico.bolt s={28} />} style={{left: 40, top: 1250}}>
        Replied in 3 sec
      </Chip>
      <Chip dark show={prog(f, sleep - 4, 12, ease.out)} icon={<Ico.moon s={30} />} style={{right: 40, top: 700}}>
        2:47 AM · you're asleep
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------- 6 · Instagram comes or goes ---------------- */
const SYS = [
  {icon: <Ico.globe s={34} />, title: 'Website', sub: 'Your domain'},
  {icon: <Ico.db s={34} />, title: 'CRM', sub: 'Your data'},
  {icon: <Ico.chat s={34} />, title: 'Chat App', sub: 'AI · 24/7'},
];
export const Keep: React.FC = () => {
  const f = useCurrentFrame();
  const comes = fr(wordAt('keep', 0, 'comes'));
  const goes = fr(wordAt('keep', 0, 'goes'));
  const run = fr(wordAt('keep', 0, 'running'));
  const igIn = prog(f, comes - 4, 10, ease.out);
  const igOut = prog(f, goes, 12, ease.in);
  const leads = Math.round(mix(prog(f, 10, 110, ease.soft), 248, 257));
  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', opacity: igIn * (1 - igOut * 0.85), transform: `scale(${mix(igIn, 0.5, 1) * (1 - igOut * 0.35)}) translateY(${igOut * -30}px)`, filter: igOut > 0 ? `grayscale(${igOut})` : undefined}}>
        <IgLogo size={150} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 760, display: 'flex', gap: 22, perspective: 1600}}>
        {SYS.map((s, i) => {
          const p = prog(f, 8 + i * 6, 16, ease.out);
          const mid = i === 1;
          return (
            <div key={s.title} style={{flex: 1, opacity: p, transform: `translateY(${(1 - p) * 80 + (mid ? -30 : 0)}px) rotateY(${(i - 1) * -10}deg)`}}>
              <div style={{background: C.night2, border: `1px solid ${mid ? C.gold : C.lineDark}`, borderRadius: 28, padding: '28px 22px', textAlign: 'center', boxShadow: mid ? `0 0 50px ${C.goldGlow}, ${SHADOW.dark}` : SHADOW.dark, fontFamily: F.body}}>
                <div style={{width: 74, height: 74, margin: '0 auto', borderRadius: 20, background: C.goldSoft, color: C.goldBright, display: 'grid', placeItems: 'center'}}>{s.icon}</div>
                <div style={{marginTop: 16, color: C.cream, fontWeight: 800, fontSize: 32}}>{s.title}</div>
                <div style={{marginTop: 4, color: C.mutedDark, fontSize: 22}}>{s.sub}</div>
                {mid && <div style={{marginTop: 14, fontFamily: F.display, fontWeight: 800, fontSize: 56, color: C.goldBright}}>{leads}</div>}
                {mid && <div style={{color: C.mutedDark, fontSize: 20}}>leads</div>}
                <div style={{marginTop: 14, display: 'inline-block', padding: '6px 14px', borderRadius: 999, background: 'rgba(43,182,115,0.15)', color: C.ok, fontWeight: 800, fontSize: 20}}>● Live</div>
              </div>
            </div>
          );
        })}
      </div>
      <Chip dark show={prog(f, run - 4, 12, ease.out)} gold icon={<Ico.check s={30} />} style={{left: 0, right: 0, top: 1300, margin: '0 auto', width: 'fit-content'}}>
        Running 24/7
      </Chip>
    </AbsoluteFill>
  );
};

/* ---------------- 7 · build your own system ---------------- */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const tile = prog(f, 10, 26, ease.out);
  const word = prog(f, 26, 16, ease.out);
  const site = prog(f, 44, 14, ease.out);
  return (
    <AbsoluteFill>
      <LightBg />
      <Stage>
        <Card3D img="tex/mark.png" w={1.0} h={1.0} r={0.22} d={0.22} position={[0, 0.62 + (1 - tile) * 1.2, 0.2]} rotation={[0.06, mix(tile, Math.PI * 1.5, 0) + Math.sin(f / 30) * 0.12, 0]} />
        <Shadow position={[0, -0.12, 0]} w={1.4} d={0.4} opacity={tile} />
      </Stage>
      <div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', opacity: word, transform: `translateY(${(1 - word) * 30}px)`}}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 112, letterSpacing: '0.06em', color: C.ink, lineHeight: 1}}>{BRAND.name}</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 14}}>
          <span style={{width: 70, height: 2, background: C.gold}} />
          <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 32, letterSpacing: '0.62em', marginRight: '-0.62em', color: C.gold}}>{BRAND.sub}</span>
          <span style={{width: 70, height: 2, background: C.gold}} />
        </div>
        <div style={{marginTop: 30, fontFamily: F.body, fontWeight: 600, fontSize: 27, color: C.muted}}>{BRAND.services.join('  ·  ')}</div>
      </div>
      <div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', opacity: site, transform: `translateY(${(1 - site) * 20}px)`}}>
        <div style={{display: 'inline-block', padding: '18px 40px', borderRadius: 999, background: C.ink, color: C.goldBright, fontFamily: F.display, fontWeight: 800, fontSize: 46, letterSpacing: '0.01em', boxShadow: SHADOW.card}}>{BRAND.site}</div>
        <div style={{marginTop: 16, fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.muted}}>{BRAND.city}</div>
      </div>
      <div style={{position: 'absolute', top: 1520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26}}>
        {[<Ico.db s={38} key="a" />, <Ico.bolt s={38} key="b" />, <Ico.chat s={38} key="c" />, <Ico.globe s={38} key="d" />].map((ic, i) => {
          const p = prog(f, 54 + i * 5, 12, ease.out);
          return (
            <div key={i} style={{width: 92, height: 92, borderRadius: 26, background: `linear-gradient(140deg, ${C.goldBright}, ${C.gold})`, color: '#1A1206', display: 'grid', placeItems: 'center', boxShadow: `0 14px 30px ${C.goldGlow}`, opacity: p, transform: `translateY(${(1 - p) * 40 + Math.sin((f + i * 12) / 18) * 6}px)`}}>
              {ic}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
