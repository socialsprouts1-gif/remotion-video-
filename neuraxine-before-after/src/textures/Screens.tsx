// Phone-screen and icon stills, rendered to public/tex/ by scripts/make_textures.mjs.
import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {BIZ} from '../config';
import {F} from '../theme';
import {BrandIcon} from '../components/BrandIcon';

const WA = {bg: '#EFEAE2', out: '#D9FDD3', in: '#FFFFFF', text: '#111B21', meta: '#667781', green: '#00A884', tick: '#53BDEB', badge: '#25D366'};

const Status: React.FC<{time?: string; dark?: boolean}> = ({time = '', dark}) => (
  <div style={{position: 'absolute', top: 26, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dark ? '#fff' : '#111'}}>
    <span>{time}</span>
    <span style={{width: 40, height: 18, borderRadius: 5, border: `2px solid ${dark ? '#fff' : '#111'}`, position: 'relative'}}>
      <span style={{position: 'absolute', inset: 2, right: 8, background: dark ? '#fff' : '#111', borderRadius: 2}} />
    </span>
  </div>
);

const NAMES = ['Rahul Sharma', 'Priya', '+91 98XXX 21045', 'Amit Verma', 'Neha', '+91 70XXX 88412', 'Sana', 'Vikram'];
const ASKS = ['Price kya hai?', 'Sofa ka rate?', 'Hello?? Reply karo', 'Location bhejo', 'Catalogue milega?', 'Delivery kab tak?', 'Discount hai?', 'Koi hai?'];

const Lock: React.FC<{time: string; date: string; notes: {who: string; text: string; ago: string}[]; more?: string; dim?: boolean}> = ({time, date, notes, more, dim}) => (
  <AbsoluteFill style={{background: dim ? 'linear-gradient(170deg, #1A1E22, #07090B)' : 'linear-gradient(170deg, #2A3138 0%, #11161B 60%, #07090B 100%)'}}>
    <Status dark />
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: F.body}}>
      <div style={{fontSize: 30, fontWeight: 600, opacity: 0.85}}>{date}</div>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 180, letterSpacing: '-0.04em', lineHeight: 1}}>{time}</div>
    </div>
    <div style={{position: 'absolute', left: 24, right: 24, top: 480, display: 'flex', flexDirection: 'column', gap: 12}}>
      {notes.map((n, i) => (
        <div key={i} style={{background: 'rgba(245,245,247,0.9)', borderRadius: 28, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', fontFamily: F.body, transform: `scale(${1 - Math.max(0, i - 4) * 0.04})`, opacity: 1 - Math.max(0, i - 4) * 0.15}}>
          <BrandIcon name="whatsapp" size={54} />
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: '#6E6E73', fontWeight: 600}}>
              <span>WHATSAPP</span>
              <span>{n.ago}</span>
            </div>
            <div style={{fontWeight: 700, fontSize: 26, color: '#1D1D1F'}}>{n.who}</div>
            <div style={{fontSize: 25, color: '#1D1D1F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.text}</div>
          </div>
        </div>
      ))}
      {more && <div style={{textAlign: 'center', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 26, opacity: 0.85, marginTop: 6}}>{more}</div>}
    </div>
  </AbsoluteFill>
);

const ChatList: React.FC = () => (
  <AbsoluteFill style={{background: '#fff', fontFamily: F.body}}>
    <Status time="1:30" />
    <div style={{position: 'absolute', top: 96, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontWeight: 800, fontSize: 44, color: '#111'}}>Chats</span>
      <span style={{padding: '6px 14px', borderRadius: 999, background: '#E7FCE3', color: '#1F7A3A', fontWeight: 700, fontSize: 22}}>Unread 47</span>
    </div>
    <div style={{position: 'absolute', top: 180, left: 0, right: 0}}>
      {NAMES.map((n, i) => (
        <div key={n} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 28px', borderBottom: '1px solid #F0F2F5'}}>
          <div style={{width: 78, height: 78, borderRadius: 99, background: ['#DFE5E7', '#E8DCCB', '#D7E3F0', '#E3D9EE'][i % 4], display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 30, color: '#54656F'}}>{n[0] === '+' ? '#' : n[0]}</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 700, fontSize: 28, color: '#111'}}>{n}</div>
            <div style={{fontSize: 24, color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ASKS[i]}</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 20, color: WA.badge, fontWeight: 700}}>{['9:02', '9:15', '9:40', '10:05', '10:30', '11:12', '12:01', '12:44'][i]} AM</div>
            <div style={{marginTop: 6, marginLeft: 'auto', minWidth: 36, height: 36, padding: '0 8px', borderRadius: 99, background: WA.badge, color: '#fff', fontWeight: 800, fontSize: 20, display: 'grid', placeItems: 'center'}}>{[3, 5, 2, 7, 1, 4, 2, 6][i]}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

type M = {from: 'in' | 'out'; text?: string; node?: React.ReactNode; time: string};
const Chat: React.FC<{msgs: M[]; time: string}> = ({msgs, time}) => (
  <AbsoluteFill style={{background: WA.bg, fontFamily: F.body}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 210, background: '#fff', borderBottom: '1px solid #E9EDEF'}}>
      <Status time={time} />
      <div style={{position: 'absolute', top: 100, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{fontSize: 44, color: '#111'}}>‹</span>
        <div style={{width: 72, height: 72, borderRadius: 99, background: '#E8DCCB', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 30, color: '#6B5235'}}>R</div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 700, fontSize: 30, color: WA.text}}>{BIZ}</div>
          <div style={{fontSize: 21, color: WA.green, fontWeight: 600}}>AI assistant · online 24/7</div>
        </div>
        <BrandIcon name="whatsapp" size={46} />
      </div>
    </div>
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, bottom: 130, padding: '0 24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundImage: 'radial-gradient(rgba(0,0,0,0.045) 2px, transparent 2px)', backgroundSize: '30px 30px'}}>
      {msgs.map((m, i) => {
        const out = m.from === 'out';
        return (
          <div key={i} style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginTop: 12}}>
            <div style={{maxWidth: '82%', background: out ? WA.out : WA.in, color: WA.text, borderRadius: 16, borderTopRightRadius: out ? 4 : 16, borderTopLeftRadius: out ? 16 : 4, padding: '12px 16px 10px', fontWeight: 500, fontSize: 27, lineHeight: 1.32, boxShadow: '0 1px 1px rgba(11,20,26,0.13)'}}>
              {m.node ?? m.text}
              <span style={{float: 'right', marginLeft: 14, marginTop: 10, fontSize: 18, color: WA.meta}}>
                {m.time} {out && <span style={{color: WA.tick}}>✓✓</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, background: '#F0F2F5', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px 30px'}}>
      <div style={{flex: 1, height: 72, borderRadius: 40, background: '#fff', color: WA.meta, fontSize: 27, display: 'flex', alignItems: 'center', paddingLeft: 28}}>Message</div>
      <div style={{width: 72, height: 72, borderRadius: 99, background: WA.green}} />
    </div>
  </AbsoluteFill>
);

const Catalogue: React.FC = () => (
  <div style={{width: 420}}>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderRadius: 10, overflow: 'hidden'}}>
      {['#C9A27E', '#8E6F57', '#B7B0A6', '#6C7A6B'].map((c, i) => (
        <div key={i} style={{height: 84, background: `linear-gradient(160deg, ${c}, #3D332C)`, position: 'relative'}}>
          <div style={{position: 'absolute', left: '16%', right: '16%', bottom: 16, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.35)'}} />
        </div>
      ))}
    </div>
    <div style={{marginTop: 8, fontWeight: 700}}>Sofa Catalogue · 12 designs</div>
  </div>
);
const Pin: React.FC = () => (
  <div style={{width: 420}}>
    <div style={{height: 120, borderRadius: 10, background: 'linear-gradient(135deg, #E7F0E4, #D3E4F2)', position: 'relative'}}>
      <div style={{position: 'absolute', left: '46%', top: 26, width: 34, height: 34, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#E5484D'}} />
    </div>
    <div style={{marginTop: 8, fontWeight: 700}}>Royal Furniture · MI Road, Jaipur</div>
  </div>
);

const Q: M = {from: 'out', text: 'Sofa set ka price kya hai?', time: '9:00 AM'};
export const PHONE_SCREENS: Record<string, React.ReactNode> = {
  flood: (
    <Lock
      time="9:00"
      date="Monday, 24 November"
      notes={NAMES.slice(0, 6).map((n, i) => ({who: n, text: ASKS[i], ago: i === 0 ? 'now' : `${i}m ago`}))}
      more="+44 more notifications"
    />
  ),
  unread: <ChatList />,
  night_b: <Lock dim time="11:48" date="Monday, 24 November" notes={[{who: 'WhatsApp', text: '23 unread messages from 9 chats', ago: 'now'}, {who: 'Amit Verma', text: 'Koi baat nahi, dusri shop se le liya', ago: '2h ago'}]} />,
  ai: (
    <Chat
      time="9:00"
      msgs={[
        Q,
        {from: 'in', text: 'Namaste! 3-seater sofa ₹24,999 se start. Catalogue aur location bhej raha hoon.', time: '9:00 AM'},
        {from: 'in', node: <Catalogue />, time: '9:00 AM'},
        {from: 'in', node: <Pin />, time: '9:00 AM'},
      ]}
    />
  ),
  book: (
    <Chat
      time="9:02"
      msgs={[
        {from: 'out', text: 'Showroom visit book ho sakti hai?', time: '9:01 AM'},
        {from: 'in', text: 'Bilkul! Kal ke slots: 11:00 AM, 4:00 PM. Kaunsa chahiye?', time: '9:01 AM'},
        {from: 'out', text: '11 baje', time: '9:02 AM'},
        {from: 'in', text: 'Booked ✓ Kal 11:00 AM. Reminder subah bhej denge.', time: '9:02 AM'},
      ]}
    />
  ),
  night_a: (
    <Chat
      time="1:12"
      msgs={[
        {from: 'out', text: 'Is sofa ka grey colour available hai?', time: '1:12 AM'},
        {from: 'in', text: 'Haan! Grey 3-seater stock mein hai, ₹26,499. Order confirm karein?', time: '1:12 AM'},
        {from: 'out', text: 'Haan, confirm.', time: '1:13 AM'},
        {from: 'in', text: 'Order #2316 confirmed ✓ Payment link bhej diya.', time: '1:13 AM'},
      ]}
    />
  ),
};

export const TexPhone: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  return <AbsoluteFill>{PHONE_SCREENS[id]}</AbsoluteFill>;
};

const ICON_PATHS: Record<string, string[]> = {
  db: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
  bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'],
  clock: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M12 7v5l3 2'],
};

/** Square face textures for the 3D tiles. */
export const TexSquare: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  if (id === 'cal')
    return (
      <AbsoluteFill style={{background: '#fff', fontFamily: F.body, textAlign: 'center'}}>
        <div style={{height: 150, background: '#B5F12A', color: '#0A1200', fontFamily: F.display, fontWeight: 800, fontSize: 84, lineHeight: '150px', letterSpacing: '0.08em'}}>TUE</div>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 250, color: '#0B0B0B', lineHeight: 1, marginTop: 30}}>25</div>
        <div style={{fontSize: 44, fontWeight: 700, color: '#6E726F', marginTop: 10}}>11:00 AM</div>
      </AbsoluteFill>
    );
  const red = id === 'clock';
  return (
    <AbsoluteFill style={{background: red ? 'linear-gradient(160deg, #FF7A7A, #D7263D)' : 'linear-gradient(160deg, #1B211D, #070908)', display: 'grid', placeItems: 'center'}}>
      <svg width={290} height={290} viewBox="0 0 24 24">
        {(ICON_PATHS[id] ?? []).map((d, i) => (
          <path key={i} d={d} fill="none" stroke={red ? '#fff' : '#B5F12A'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
