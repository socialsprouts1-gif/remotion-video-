// The Neura Chat dashboard on the shop laptop: campaign poster → select customers → send via WhatsApp API
// → campaign report → AI inbox replying at night. Drawn in HTML at 1280×800 and scaled into the laptop screen.
import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {BRAND} from '../config';
import {ease, prog, rand} from '../lib/anim';

const P = BRAND.purple;
const INK = '#1C1530';
const MUTED = '#776F8C';
const LINE = '#ECE8F4';
const FONT = 'Inter, sans-serif';

export type Screen = 'poster' | 'select' | 'report' | 'inbox';

const Ico: React.FC<{d: string; c?: string; s?: number}> = ({d, c = 'currentColor', s = 20}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split('|').map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);
const I = {
  home: 'M3 11l9-7 9 7|M5 10v10h14V10',
  inbox: 'M4 4h16v12H4z|M4 13h5l1 3h4l1-3h5',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1|M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M22 19v-1a4 4 0 0 0-3-3.9|M16 4.1a3 3 0 0 1 0 5.8',
  send: 'M22 2L11 13|M22 2l-7 20-4-9-9-4z',
  bot: 'M5 9h14v10H5z|M12 5v4|M9 14h.01|M15 14h.01',
  chart: 'M4 20V10|M10 20V4|M16 20v-7|M22 20H2',
  check: 'M5 12l5 5L20 7',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
};

const Sidebar: React.FC<{active: string}> = ({active}) => (
  <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 232, background: '#170F2E', color: '#CFC6E8', padding: '26px 18px', fontFamily: FONT}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34}}>
      <Img src={staticFile(BRAND.logo)} style={{width: 40, height: 40, borderRadius: 10}} />
      <div style={{fontWeight: 800, fontSize: 21, color: '#fff'}}>
        Neura <span style={{color: '#B794F6'}}>Chat</span>
      </div>
    </div>
    {[
      ['Dashboard', I.home],
      ['Inbox', I.inbox],
      ['Contacts', I.users],
      ['Campaigns', I.send],
      ['AI Chatbot', I.bot],
      ['Analytics', I.chart],
    ].map(([n, d]) => (
      <div key={n} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, marginBottom: 6, fontWeight: 600, fontSize: 17, background: n === active ? 'linear-gradient(90deg, #7C3AED, #9F5BF5)' : 'transparent', color: n === active ? '#fff' : '#B9AED6'}}>
        <Ico d={d} /> {n}
      </div>
    ))}
    <div style={{position: 'absolute', left: 18, right: 18, bottom: 24, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.06)', fontSize: 14}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700}}>
        <span style={{width: 9, height: 9, borderRadius: 9, background: BRAND.wa}} /> WhatsApp API
      </div>
      <div style={{marginTop: 4, color: '#A79CC6'}}>Connected · Verified</div>
    </div>
  </div>
);

const Header: React.FC<{crumb: string; title: string; right?: React.ReactNode}> = ({crumb, title, right}) => (
  <div style={{position: 'absolute', left: 264, right: 32, top: 26, fontFamily: FONT, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
    <div>
      <div style={{fontSize: 15, color: MUTED, fontWeight: 600}}>{crumb}</div>
      <div style={{fontSize: 32, fontWeight: 800, color: INK, marginTop: 4}}>{title}</div>
    </div>
    {right}
  </div>
);

const Btn: React.FC<{children: React.ReactNode; bg?: string; press?: number; glow?: number}> = ({children, bg = P, press = 0, glow = 0}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 12, background: bg, color: '#fff', fontWeight: 800, fontSize: 18, transform: `scale(${1 - press * 0.06})`, boxShadow: `0 8px 24px ${bg}55, 0 0 0 ${glow * 8}px ${bg}33`}}>{children}</div>
);

/** The Diwali offer poster (drawn, not a photo). */
const Poster: React.FC<{t: number}> = ({t}) => {
  const a = (d: number) => prog(t * 30, d * 30, 14);
  return (
    <div style={{width: 300, height: 420, borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'radial-gradient(circle at 50% 30%, #5B1A8C, #2A0B4A 70%)', fontFamily: FONT, boxShadow: '0 18px 40px rgba(60,20,120,0.35)'}}>
      {Array.from({length: 18}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: rand(i) * 290, top: rand(i * 3) * 410, width: 4, height: 4, borderRadius: 4, background: '#FFD66B', opacity: 0.5 + 0.5 * Math.sin(t * 4 + i)}} />
      ))}
      <div style={{position: 'absolute', top: 26, left: 0, right: 0, textAlign: 'center', opacity: a(0), transform: `translateY(${(1 - a(0)) * 20}px)`}}>
        <div style={{fontSize: 15, letterSpacing: 6, color: '#FFD66B', fontWeight: 700}}>SHARMA ELECTRONICS</div>
        <div style={{fontSize: 50, fontWeight: 900, color: '#fff', lineHeight: 1.02, marginTop: 14, fontFamily: '"Inter Display", Inter'}}>
          DIWALI
          <br />
          <span style={{color: '#FFC531'}}>DHAMAKA</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 200, left: 30, right: 30, textAlign: 'center', opacity: a(0.35), transform: `scale(${0.8 + a(0.35) * 0.2})`}}>
        <div style={{display: 'inline-block', padding: '10px 18px', borderRadius: 12, background: '#FFC531', color: '#5B1A8C', fontWeight: 900, fontSize: 30}}>UPTO 30% OFF</div>
        <div style={{color: '#F2E6FF', fontSize: 17, fontWeight: 600, marginTop: 14}}>TV • Fridge • AC • Mobiles</div>
        <div style={{color: '#fff', fontSize: 17, fontWeight: 800, marginTop: 6}}>+ Free gift on every purchase</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(0deg, #FF8A00, #FFB300)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: a(0.7)}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={34} height={30} viewBox="0 0 34 30">
            <path d="M2 16 Q17 30 32 16 Z" fill="#8A2D0E" />
            <path d={`M17 15 Q12 ${8 - Math.sin(t * 9 + i) * 2} 17 1 Q22 ${8 + Math.sin(t * 9 + i) * 2} 17 15 Z`} fill="#FFF3C4" />
          </svg>
        ))}
      </div>
    </div>
  );
};

const PosterScreen: React.FC<{t: number; press: number}> = ({t, press}) => (
  <>
    <Sidebar active="Campaigns" />
    <Header crumb="Campaigns  /  New broadcast" title="Diwali Offer Campaign" />
    <div style={{position: 'absolute', left: 264, top: 130, width: 560, fontFamily: FONT}}>
      {[
        ['Campaign name', 'Diwali Dhamaka 2026'],
        ['Template', 'Festive offer · Image + text'],
        ['Message', 'Namaste {{name}} ji! 🪔 Sharma Electronics ka Diwali Dhamaka — upto 30% off + free gift. Offer sirf 5 din!'],
        ['Button', 'Get directions  ·  Call store'],
      ].map(([k, v], i) => {
        const p = prog(t * 30, 4 + i * 6, 12);
        return (
          <div key={k} style={{marginBottom: 18, opacity: p, transform: `translateY(${(1 - p) * 12}px)`}}>
            <div style={{fontSize: 14, fontWeight: 700, color: MUTED, marginBottom: 7}}>{k}</div>
            <div style={{padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${i === 2 ? '#C4B5FD' : LINE}`, background: '#fff', fontSize: 17, color: INK, fontWeight: 600, lineHeight: 1.4}}>{v}</div>
          </div>
        );
      })}
      <div style={{marginTop: 8}}>
        <Btn press={press}>
          Next: Select customers <Ico d="M5 12h14|M13 6l6 6-6 6" />
        </Btn>
      </div>
    </div>
    <div style={{position: 'absolute', left: 870, top: 120, fontFamily: FONT}}>
      <div style={{fontSize: 14, fontWeight: 700, color: MUTED, marginBottom: 8}}>Preview</div>
      <Poster t={t} />
    </div>
  </>
);

const NAMES = [
  ['Ramesh Patel', '+91 98250 •• 412', 'Bought TV · 2025'],
  ['Sunita Verma', '+91 99090 •• 118', 'Fridge enquiry'],
  ['Imran Khan', '+91 97123 •• 873', 'AC service'],
  ['Pooja Mehra', '+91 98790 •• 054', 'Bought mobile'],
  ['Arjun Singh', '+91 90990 •• 337', 'Washing machine'],
  ['Kavita Joshi', '+91 98980 •• 621', 'Bought TV · 2024'],
  ['Deepak Rao', '+91 99250 •• 790', 'New lead'],
];

const SelectScreen: React.FC<{t: number; all: number; press: number; sent: number}> = ({t, all, press, sent}) => {
  const n = Math.round(interpolate(all, [0, 1], [0, 2000]));
  return (
    <>
      <Sidebar active="Contacts" />
      <Header
        crumb="Campaigns  /  Diwali Offer Campaign"
        title="Select customers"
        right={
          <div style={{fontSize: 17, fontWeight: 800, color: P, padding: '10px 16px', borderRadius: 10, background: '#F3EEFF'}}>
            {n.toLocaleString('en-IN')} of 2,000 selected
          </div>
        }
      />
      <div style={{position: 'absolute', left: 264, right: 32, top: 132, borderRadius: 16, border: `1.5px solid ${LINE}`, background: '#fff', overflow: 'hidden', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', padding: '14px 20px', background: '#FAF8FF', fontSize: 14, fontWeight: 700, color: MUTED, gap: 16}}>
          <Check on={all > 0.02} />
          <span style={{width: 230}}>SELECT ALL · NAME</span>
          <span style={{width: 220}}>WHATSAPP</span>
          <span style={{flex: 1}}>TAG</span>
          <span style={{width: 120}}>STATUS</span>
        </div>
        {NAMES.map(([nm, ph, tag], i) => {
          const on = all > 0.02 + i * 0.05;
          const st = sent > 0.05 + i * 0.1;
          return (
            <div key={nm} style={{display: 'flex', alignItems: 'center', padding: '13px 20px', borderTop: `1px solid ${LINE}`, fontSize: 16.5, color: INK, gap: 16, background: on ? '#FBF9FF' : '#fff'}}>
              <Check on={on} />
              <span style={{width: 230, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{width: 32, height: 32, borderRadius: 32, background: ['#EDE4FF', '#FFE8D6', '#DDF6EA', '#FFE0EC'][i % 4], display: 'grid', placeItems: 'center', fontSize: 13, color: '#5B4B8A'}}>{nm[0]}</span>
                {nm}
              </span>
              <span style={{width: 220, color: MUTED, fontWeight: 600}}>{ph}</span>
              <span style={{flex: 1}}>
                <span style={{padding: '5px 10px', borderRadius: 8, background: '#F4F1FA', color: '#5D5475', fontSize: 14, fontWeight: 600}}>{tag}</span>
              </span>
              <span style={{width: 120, fontWeight: 700, fontSize: 14, color: st ? '#16A34A' : '#A39BB8'}}>{st ? '✓✓ Sent' : 'Ready'}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 264, right: 32, bottom: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
        <div style={{flex: 1, marginRight: 28}}>
          <div style={{fontSize: 14, fontWeight: 700, color: MUTED, marginBottom: 8}}>{sent > 0 ? `Sending via WhatsApp API… ${Math.round(sent * 2000).toLocaleString('en-IN')} / 2,000` : 'Official WhatsApp Business API · no number block risk'}</div>
          <div style={{height: 10, borderRadius: 10, background: '#EEE9F7', overflow: 'hidden'}}>
            <div style={{width: `${sent * 100}%`, height: '100%', background: `linear-gradient(90deg, ${BRAND.wa}, #12B76A)`}} />
          </div>
        </div>
        <Btn bg="#16A34A" press={press} glow={press}>
          <svg width={22} height={22} viewBox="0 0 24 24">
            <path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
            <path fill="#16A34A" d="M8.8 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.2.3 0 .6.6 1 1.4 1.8 2.4 2.4.3.2.5.1.6 0l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.4 0 .3 0 1-.4 1.5-.4.5-1.4 1-2 1-.6 0-1.3.1-3.6-1-2.7-1.4-4.3-4.3-4.4-4.5-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.2z" />
          </svg>
          Send on WhatsApp
        </Btn>
      </div>
    </>
  );
};

const Check: React.FC<{on: boolean}> = ({on}) => (
  <span style={{width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? P : '#CFC8DE'}`, background: on ? P : '#fff', display: 'grid', placeItems: 'center'}}>{on && <Ico d={I.check} c="#fff" s={15} />}</span>
);

const ReportScreen: React.FC<{t: number}> = ({t}) => {
  const c = (to: number, d: number) => Math.round(to * prog(t * 30, d, 34, ease.soft));
  const stats: [string, number, string, number][] = [
    ['Sent', 2000, '#7C3AED', 0],
    ['Delivered', 1968, '#2563EB', 4],
    ['Read', 1642, '#16A34A', 10],
    ['Replied', 214, '#F59E0B', 16],
  ];
  const replies = [
    ['Ramesh Patel', '55 inch TV ka offer hai kya?', '9:41 PM'],
    ['Sunita Verma', 'Double door fridge ka price bhejo', '9:42 PM'],
    ['Imran Khan', 'Kal shaam aata hoon store pe 👍', '9:42 PM'],
    ['Pooja Mehra', 'Free gift kya hai?', '9:43 PM'],
  ];
  return (
    <>
      <Sidebar active="Analytics" />
      <Header crumb="Campaigns  /  Diwali Offer Campaign" title="Campaign report" right={<div style={{fontSize: 15, fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 10, height: 10, borderRadius: 10, background: '#16A34A'}} /> Live</div>} />
      <div style={{position: 'absolute', left: 264, right: 32, top: 132, display: 'flex', gap: 16, fontFamily: FONT}}>
        {stats.map(([k, v, col, d]) => (
          <div key={k} style={{flex: 1, padding: '18px 20px', borderRadius: 16, border: `1.5px solid ${LINE}`, background: '#fff', borderTop: `5px solid ${col}`}}>
            <div style={{fontSize: 15, fontWeight: 700, color: MUTED}}>{k}</div>
            <div style={{fontSize: 40, fontWeight: 900, color: INK, marginTop: 6, fontFamily: '"Inter Display", Inter'}}>{c(v, d).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 264, right: 32, top: 290, bottom: 26, borderRadius: 16, border: `1.5px solid ${LINE}`, background: '#fff', padding: '18px 22px', fontFamily: FONT}}>
        <div style={{fontSize: 16, fontWeight: 800, color: INK, marginBottom: 8}}>Latest replies</div>
        {replies.map(([nm, msg, tm], i) => {
          const p = prog(t * 30, 24 + i * 9, 14);
          return (
            <div key={nm} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: i ? `1px solid ${LINE}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
              <span style={{width: 40, height: 40, borderRadius: 40, background: ['#EDE4FF', '#FFE8D6', '#DDF6EA', '#FFE0EC'][i], display: 'grid', placeItems: 'center', fontWeight: 800, color: '#5B4B8A'}}>{nm[0]}</span>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 16.5, color: INK}}>{nm}</div>
                <div style={{fontWeight: 500, fontSize: 16, color: '#4B4462', marginTop: 2}}>{msg}</div>
              </div>
              <span style={{fontSize: 14, color: MUTED, fontWeight: 600}}>{tm}</span>
              <span style={{color: '#3B82F6', fontWeight: 800}}>✓✓</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const InboxScreen: React.FC<{t: number; ask: number; reply: number}> = ({t, ask, reply}) => {
  const typing = ask > 0 && reply <= 0 && prog(t * 30, 0, 1) > 0;
  return (
    <>
      <Sidebar active="Inbox" />
      <Header
        crumb="Inbox  /  WhatsApp"
        title="AI Inbox"
        right={
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 800, color: '#3B2D6B', padding: '10px 16px', borderRadius: 10, background: '#EFEAFB'}}>
            <Ico d={I.moon} c="#6D28D9" /> 11:48 PM · Store closed
          </div>
        }
      />
      <div style={{position: 'absolute', left: 264, top: 132, width: 300, bottom: 26, borderRadius: 16, border: `1.5px solid ${LINE}`, background: '#fff', fontFamily: FONT, overflow: 'hidden'}}>
        {[
          ['Vikas Gupta', '55 inch TV ka price?', true],
          ['Neha Shah', 'AI: Haan ji, kal 10 baje…', false],
          ['Rohit Jain', 'AI: EMI available hai ✓', false],
          ['Anjali D.', 'AI: Address bhej diya 📍', false],
        ].map(([nm, m, on], i) => (
          <div key={String(nm)} style={{padding: '16px 18px', borderBottom: `1px solid ${LINE}`, background: on ? '#F5F0FF' : '#fff', borderLeft: on ? `4px solid ${P}` : '4px solid transparent'}}>
            <div style={{fontWeight: 800, fontSize: 16, color: INK}}>{nm}</div>
            <div style={{fontSize: 14.5, color: MUTED, marginTop: 3, fontWeight: 500}}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 584, right: 32, top: 132, bottom: 26, borderRadius: 16, overflow: 'hidden', background: '#EFE7DD', fontFamily: FONT}}>
        <div style={{height: 64, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', borderBottom: `1px solid ${LINE}`}}>
          <span style={{width: 40, height: 40, borderRadius: 40, background: '#FFE8D6', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#8A4B1E'}}>V</span>
          <div>
            <div style={{fontWeight: 800, fontSize: 17, color: INK}}>Vikas Gupta</div>
            <div style={{fontSize: 13.5, color: '#16A34A', fontWeight: 700}}>online</div>
          </div>
          <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: '#F3EEFF', color: P, fontWeight: 800, fontSize: 14}}>
            <Ico d={I.bot} c={P} s={17} /> AI Agent ON
          </div>
        </div>
        <div style={{padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{alignSelf: 'flex-start', maxWidth: '76%', padding: '13px 16px', borderRadius: '4px 16px 16px 16px', background: '#fff', fontSize: 18, color: INK, fontWeight: 500, opacity: ask, transform: `translateY(${(1 - ask) * 16}px)`, boxShadow: '0 2px 6px rgba(0,0,0,0.06)'}}>
            55 inch TV ka price kya hai? Diwali offer hai?
            <div style={{fontSize: 12.5, color: MUTED, textAlign: 'right', marginTop: 4}}>11:48 PM</div>
          </div>
          {typing && (
            <div style={{alignSelf: 'flex-end', padding: '14px 18px', borderRadius: 16, background: '#D9FDD3', display: 'flex', gap: 6}}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{width: 9, height: 9, borderRadius: 9, background: '#5E8F57', opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * 6 + i))}} />
              ))}
            </div>
          )}
          {reply > 0 && (
            <div style={{alignSelf: 'flex-end', maxWidth: '84%', padding: '13px 16px', borderRadius: '16px 4px 16px 16px', background: '#D9FDD3', fontSize: 18, color: INK, fontWeight: 500, lineHeight: 1.45, opacity: reply, transform: `translateY(${(1 - reply) * 16}px)`, boxShadow: '0 2px 6px rgba(0,0,0,0.06)'}}>
              Namaste Vikas ji! 🙏 55" 4K Smart TV <b>₹38,999</b> ka hai. Diwali offer mein sirf <b>₹34,999</b> + free soundbar 🎁 Kal store aayenge?
              <div style={{fontSize: 12.5, color: '#4F7A49', textAlign: 'right', marginTop: 4}}>11:48 PM ✓✓</div>
            </div>
          )}
          {reply > 0.5 && (
            <div style={{alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: P, color: '#fff', fontWeight: 800, fontSize: 14, opacity: prog(reply, 0.5, 0.5)}}>
              <Ico d={I.bot} c="#fff" s={16} /> Replied by AI in 3 sec
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/** A laptop seen from the front: screen with the dashboard, keyboard below. */
export const LaptopScreen: React.FC<{screen: Screen; t: number; press?: number; all?: number; sent?: number; ask?: number; reply?: number; cursor?: [number, number, number]}> = ({screen, t, press = 0, all = 0, sent = 0, ask = 0, reply = 0, cursor}) => (
  <div style={{position: 'relative', width: 1280, height: 800, background: '#F8F6FC', overflow: 'hidden'}}>
    {screen === 'poster' && <PosterScreen t={t} press={press} />}
    {screen === 'select' && <SelectScreen t={t} all={all} press={press} sent={sent} />}
    {screen === 'report' && <ReportScreen t={t} />}
    {screen === 'inbox' && <InboxScreen t={t} ask={ask} reply={reply} />}
    {cursor && (
      <svg style={{position: 'absolute', left: cursor[0], top: cursor[1], transform: `scale(${1 - cursor[2] * 0.15})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))'}} width={34} height={40} viewBox="0 0 34 40">
        <path d="M3 2 L3 32 L11 25 L16 37 L22 34 L17 23 L28 23 Z" fill="#fff" stroke="#111" strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
    )}
  </div>
);
