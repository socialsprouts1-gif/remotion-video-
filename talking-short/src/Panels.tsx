import React from 'react';
import {ease, lerp, pt} from './anim';
import {Bubble, C, Check, Chip, Cross, FONT, Glass, pop, WaIcon} from './ui';
import edit from './edit.json';

const H = edit.hits as {cue: string; t: number; clip: number}[];
export const cue = (name: string) => H.find((h) => h.cue === name)?.t ?? 1e9;

const PW = 960; // panel width
const PH = 520; // panel height

/** Chat window: header + messages that stack from the bottom, scrolling up as more arrive. */
const Chat: React.FC<{t: number; title: string; sub: string; items: {at: number; node: (p: number) => React.ReactNode; h: number}[]}> = ({t, title, sub, items}) => {
  const shown = items.filter((i) => t >= i.at);
  let used = shown.reduce((s, i) => s + i.h * Math.min(1, pop(t, i.at)), 0);
  const room = PH - 110;
  const scroll = Math.max(0, used - room);
  return (
    <Glass style={{width: PW, height: PH, overflow: 'hidden', position: 'relative'}}>
      <div style={{height: 90, display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', borderBottom: `1.5px solid ${C.line}`, background: 'rgba(255,255,255,0.03)'}}>
        <div style={{width: 56, height: 56, borderRadius: 56, background: 'linear-gradient(135deg,#5b6b73,#2e383d)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 26}}>{title[0]}</div>
        <div>
          <div style={{fontSize: 30, fontWeight: 700}}>{title}</div>
          <div style={{fontSize: 20, color: C.dim}}>{sub}</div>
        </div>
        <div style={{marginLeft: 'auto'}}>
          <WaIcon size={46} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 92, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 24, right: 24, top: 12 - scroll, display: 'flex', flexDirection: 'column', gap: 14}}>
          {shown.map((i, k) => (
            <div key={k}>{i.node(pop(t, i.at))}</div>
          ))}
        </div>
      </div>
    </Glass>
  );
};

const Center: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
  <div style={{display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})`}}>{children}</div>
);

const TimeTag: React.FC<{text: string}> = ({text}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', fontSize: 23, fontWeight: 600, color: '#E9EDEF'}}>
    <svg width={24} height={24} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10} fill="none" stroke="#E9EDEF" strokeWidth={2} />
      <path d="M12 6 V12 L16 14" stroke="#E9EDEF" strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
    {text}
  </div>
);

// ---------------------------------------------------------------- clip panels
const P0: React.FC<{t: number}> = ({t}) => {
  const a = pop(t, cue('leadsOk'));
  const swap = pt(t, cue('realProblem') - 0.05, cue('realProblem') + 0.3, ease.inOut);
  const r = pop(t, cue('realProblem') + 0.05);
  const notes = ['Price kya hai?', 'Details bhejiye', 'Kab available ho?'];
  return (
    <div style={{position: 'relative', width: PW, height: PH}}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `translateY(${-swap * 60}px)`}}>
        <Glass style={{padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.5)}}>
          <Check size={64} p={pt(t, cue('leadsOk') + 0.1, cue('leadsOk') + 0.5)} />
          <div style={{fontSize: 56, fontWeight: 800, letterSpacing: '0.02em'}}>LEADS</div>
          <div style={{marginLeft: 'auto', fontSize: 26, color: C.dim, fontWeight: 600}}>No problem</div>
        </Glass>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18}}>
          {notes.map((n, i) => {
            const p = pop(t, cue('inquiries') + i * 0.16);
            return (
              <Glass key={i} style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 18, borderRadius: 24, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 120}px)`}}>
                <WaIcon size={44} />
                <div style={{fontSize: 22, color: C.dim, fontWeight: 600, width: 170}}>New inquiry</div>
                <div style={{fontSize: 29, fontWeight: 600}}>{n}</div>
              </Glass>
            );
          })}
        </div>
      </div>
      {r > 0 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Glass style={{padding: '40px 60px 46px', textAlign: 'center', transform: `scale(${0.6 + 0.4 * r})`, opacity: Math.min(1, r * 1.5), border: `2px solid ${C.red}`}}>
            <div style={{fontSize: 30, fontWeight: 700, color: C.red, letterSpacing: '0.18em'}}>ASLI PROBLEM</div>
            <div style={{fontSize: 110, fontWeight: 800, lineHeight: 1.05, marginTop: 6}}>FOLLOW-UP</div>
          </Glass>
        </div>
      )}
    </div>
  );
};

const P1: React.FC<{t: number}> = ({t}) => {
  const sil = pt(t, cue('silence'), cue('silence') + 0.4);
  return (
    <Chat
      t={t}
      title="Customer"
      sub={sil > 0 ? 'last seen 3 days ago' : 'online'}
      items={[
        {at: cue('msgCustomer'), h: 140, node: (p) => <Bubble side="in" p={p} time="11:02 AM">Hi! Aapki services ke baare mein batayenge?</Bubble>},
        {at: cue('later'), h: 62, node: (p) => <Center p={p}><TimeTag text="Thodi der baad…" /></Center>},
        {at: cue('msgReply'), h: 140, node: (p) => <Bubble side="out" p={p} time="1:47 PM">Ji zaroor! Details share kar raha hoon.</Bubble>},
        {at: cue('msgLetKnow'), h: 100, node: (p) => <Bubble side="in" p={p} time="1:52 PM" dim={sil}>I will let you know.</Bubble>},
        {at: cue('silence'), h: 70, node: (p) => <Center p={p}><Chip color={C.red} style={{color: '#fff'}}>NO REPLY</Chip></Center>},
      ]}
    />
  );
};

const P2: React.FC<{t: number}> = ({t}) => {
  const tiles = [
    {cue: 'busy', label: 'Busy day', icon: 'busy'},
    {cue: 'forgot', label: 'Follow-up bhool gaye', icon: 'forgot'},
  ];
  const lost = pop(t, cue('lost'), 170, 12);
  return (
    <div style={{width: PW, height: PH, display: 'flex', flexDirection: 'column', gap: 20}}>
      <div style={{display: 'flex', gap: 20}}>
        {tiles.map((x, i) => {
          const p = pop(t, cue(x.cue));
          return (
            <Glass key={i} style={{flex: 1, height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px)`}}>
              {x.icon === 'busy' ? (
                <svg width={86} height={86} viewBox="0 0 48 48">
                  <rect x={6} y={10} width={36} height={32} rx={6} fill="none" stroke="#fff" strokeWidth={3} />
                  <path d="M6 19 H42 M15 6 V14 M33 6 V14" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
                  {[0, 1, 2, 3, 4, 5].map((k) => (
                    <rect key={k} x={11 + (k % 3) * 10} y={23 + Math.floor(k / 3) * 8} width={7} height={5} rx={1.5} fill={C.lime} />
                  ))}
                </svg>
              ) : (
                <div style={{position: 'relative'}}>
                  <svg width={86} height={86} viewBox="0 0 48 48">
                    <rect x={8} y={6} width={32} height={36} rx={5} fill="#FFE27A" />
                    <path d="M14 16 H34 M14 23 H30 M14 30 H26" stroke="#7a5d00" strokeWidth={2.5} strokeLinecap="round" />
                  </svg>
                  <div style={{position: 'absolute', right: -14, bottom: -8}}>
                    <Cross size={44} p={pt(t, cue('forgot') + 0.3, cue('forgot') + 0.7)} />
                  </div>
                </div>
              )}
              <div style={{fontSize: 30, fontWeight: 700}}>{x.label}</div>
            </Glass>
          );
        })}
      </div>
      <Glass style={{height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, border: `2px solid ${C.red}`, opacity: Math.min(1, lost * 1.5), transform: `scale(${0.6 + 0.4 * lost})`}}>
        <div style={{fontSize: 120, fontWeight: 800, color: C.red, lineHeight: 1}}>−1</div>
        <div>
          <div style={{fontSize: 46, fontWeight: 800}}>Customer lost</div>
          <div style={{fontSize: 26, color: C.dim, fontWeight: 600}}>Potential customer, gone</div>
        </div>
      </Glass>
    </div>
  );
};

const P3: React.FC<{t: number}> = ({t}) => (
  <Chat
    t={t}
    title="Customer"
    sub="last seen yesterday"
    items={[
      {at: cue('msgCheck'), h: 150, node: (p) => <Bubble side="out" p={p} time="10:15 AM" tag={<Chip>FOLLOW-UP #1</Chip>}>Hey, just checking, are you still interested?</Bubble>},
      {at: cue('daysLater'), h: 62, node: (p) => <Center p={p}><TimeTag text="Kuch din baad…" /></Center>},
      {at: cue('msgFollow2'), h: 140, node: (p) => <Bubble side="out" p={p} time="10:15 AM" tag={<Chip>FOLLOW-UP #2</Chip>}>Just following up on this!</Bubble>},
    ]}
  />
);

const P4: React.FC<{t: number}> = ({t}) => {
  const typing = t >= cue('typing') && t < cue('msgAuto');
  return (
    <Chat
      t={t}
      title="Customer"
      sub={typing ? 'typing…' : 'online'}
      items={[
        {at: cue('msgYes'), h: 100, node: (p) => <Bubble side="in" p={p} time="10:21 AM">Yes, interested!</Bubble>},
        {
          at: cue('typing'),
          h: typing ? 80 : 0,
          node: (p) =>
            typing ? (
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <div style={{background: C.outBubble, borderRadius: 26, padding: '20px 26px', display: 'flex', gap: 10, opacity: p}}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{width: 14, height: 14, borderRadius: 14, background: '#fff', opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - k * 0.9))}} />
                  ))}
                </div>
              </div>
            ) : null,
        },
        {
          at: cue('msgAuto'),
          h: 160,
          node: (p) => (
            <Bubble side="out" p={p} time="10:21 AM" tag={<Chip>AUTO REPLY</Chip>}>
              Great! Aapke liye kaunsa time best rahega?
            </Bubble>
          ),
        },
      ]}
    />
  );
};

const P5: React.FC<{t: number}> = ({t}) => {
  const tp = pop(t, cue('autoTitle'));
  const rows = ['Initial replies', 'Leads qualify', 'Follow-ups', 'Appointments book', 'Information collect'];
  return (
    <Glass style={{width: PW, height: PH, padding: '26px 40px', opacity: Math.min(1, tp * 1.5), transform: `scale(${0.8 + 0.2 * tp})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
        <WaIcon size={58} />
        <div style={{fontSize: 46, fontWeight: 800}}>
          WhatsApp <span style={{color: C.lime}}>Automation</span>
        </div>
      </div>
      {rows.map((r, i) => {
        const at = cue(`f${i + 1}`);
        const p = pop(t, at);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, height: 70, borderTop: `1.5px solid ${C.line}`, opacity: 0.25 + 0.75 * Math.min(1, p * 1.4)}}>
            <Check size={44} p={pt(t, at + 0.05, at + 0.4)} color={p > 0 ? C.lime : 'rgba(255,255,255,0.4)'} />
            <div style={{fontSize: 34, fontWeight: 700, transform: `translateX(${(1 - Math.min(1, p)) * 30}px)`}}>{r}</div>
            {p > 0 && <div style={{marginLeft: 'auto', fontSize: 20, fontWeight: 800, color: C.lime, letterSpacing: '0.12em', opacity: p}}>AUTO</div>}
          </div>
        );
      })}
    </Glass>
  );
};

const P6: React.FC<{t: number}> = ({t}) => {
  const m = pop(t, cue('manual'));
  const swap = pt(t, cue('system') - 0.15, cue('system') + 0.2, ease.inOut);
  const nodes = ['Lead', 'Auto reply', 'Follow-up', 'Booked'];
  const loopT = cue('loop');
  return (
    <div style={{position: 'relative', width: PW, height: PH}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (1 - swap) * Math.min(1, m * 1.5)}}>
        <Glass style={{padding: '34px 44px', display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${0.7 + 0.3 * m})`}}>
          <svg width={150} height={130} viewBox="0 0 150 130">
            <rect x={4} y={4} width={142} height={122} rx={10} fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth={3} />
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M4 ${32 + k * 24} H146`} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />)}
            <path d="M52 4 V126 M100 4 V126" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
          </svg>
          <div>
            <div style={{fontSize: 46, fontWeight: 800}}>Manual tracking</div>
            <div style={{fontSize: 26, color: C.dim, fontWeight: 600}}>Har lead, haath se</div>
          </div>
          <Cross size={70} p={pt(t, cue('manual') + 0.4, cue('manual') + 0.8)} />
        </Glass>
      </div>
      {swap > 0 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, opacity: swap}}>
          <div style={{fontSize: 30, fontWeight: 800, color: C.lime, letterSpacing: '0.2em'}}>AUTOMATIC SYSTEM</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            {nodes.map((n, i) => {
              const p = pop(t, cue('system') + 0.1 + i * 0.14);
              const lit = t > loopT && Math.floor((t - loopT) * 2.6) % 4 === i;
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <svg width={36} height={30} viewBox="0 0 36 30" style={{opacity: p}}>
                      <path d="M2 15 H30 M22 6 L32 15 L22 24" fill="none" stroke={C.lime} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <Glass style={{padding: '24px 20px', minWidth: 170, textAlign: 'center', fontSize: 28, fontWeight: 700, borderRadius: 24, transform: `scale(${(0.6 + 0.4 * p) * (lit ? 1.08 : 1)})`, opacity: Math.min(1, p * 1.5), border: `2px solid ${lit ? C.lime : C.line}`, boxShadow: lit ? `0 0 40px rgba(182,242,58,0.45)` : undefined}}>
                    {n}
                  </Glass>
                </React.Fragment>
              );
            })}
          </div>
          {t > loopT && (
            <div style={{opacity: pt(t, loopT, loopT + 0.4)}}>
              <Chip>24/7 · AUTOMATICALLY</Chip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PANELS = [P0, P1, P2, P3, P4, P5, P6];

/** Graphics panel over the wall above the speaker's head. */
export const Panels: React.FC<{t: number}> = ({t}) => {
  const clips = edit.clips;
  return (
    <>
      {clips.map((c, i) => {
        const first = Math.min(...H.filter((h) => h.clip === i).map((h) => h.t));
        const a = first - 0.15;
        const b = c.at + c.dur;
        if (t < a || t > b) return null;
        const inn = pop(t, a, 210, 18);
        const out = pt(t, b - 0.18, b, ease.in);
        const P = PANELS[i];
        return (
          <div key={i} style={{position: 'absolute', left: 60, top: 118, width: PW, height: PH, fontFamily: FONT, color: '#fff', opacity: 1 - out, transform: `translateY(${lerp(-50, 0, Math.min(1, inn)) - out * 40}px) scale(${lerp(0.94, 1, Math.min(1, inn))})`}}>
            <P t={t} />
          </div>
        );
      })}
    </>
  );
};
