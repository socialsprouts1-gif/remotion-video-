// Still images used as textures on the 3D objects (rendered to public/tex/ by scripts/make_textures.mjs).
import React, {useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {F} from '../theme';
import {BrandIcon} from '../components/BrandIcon';
import {Logo} from '../components/Phone3D';

const WA = {bg: '#EFEAE2', out: '#D9FDD3', in: '#FFFFFF', text: '#111B21', meta: '#667781', green: '#00A884', tick: '#53BDEB'};

const StatusBar: React.FC<{time: string; dark?: boolean}> = ({time, dark}) => (
  <div style={{position: 'absolute', top: 26, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dark ? '#fff' : '#111'}}>
    <span>{time}</span>
    <span style={{width: 40, height: 18, borderRadius: 5, border: `2px solid ${dark ? '#fff' : '#111'}`, position: 'relative'}}>
      <span style={{position: 'absolute', inset: 2, right: 8, background: dark ? '#fff' : '#111', borderRadius: 2}} />
    </span>
  </div>
);

type M = {from: 'in' | 'out'; text?: string; node?: React.ReactNode; time: string};
const Bubble: React.FC<{m: M}> = ({m}) => {
  const out = m.from === 'out';
  return (
    <div style={{display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginTop: 12}}>
      <div style={{maxWidth: '80%', background: out ? WA.out : WA.in, color: WA.text, borderRadius: 16, borderTopRightRadius: out ? 4 : 16, borderTopLeftRadius: out ? 16 : 4, padding: '12px 16px 10px', fontFamily: F.body, fontWeight: 500, fontSize: 27, lineHeight: 1.32, boxShadow: '0 1px 1px rgba(11,20,26,0.13)'}}>
        {m.node ?? m.text}
        <span style={{float: 'right', marginLeft: 14, marginTop: 10, fontSize: 18, color: WA.meta}}>
          {m.time} {out && <span style={{color: WA.tick}}>✓✓</span>}
        </span>
      </div>
    </div>
  );
};

const Chat: React.FC<{title: string; msgs: M[]; time: string}> = ({title, msgs, time}) => (
  <AbsoluteFill style={{background: WA.bg}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 210, background: '#fff', borderBottom: '1px solid #E9EDEF'}}>
      <StatusBar time={time} />
      <div style={{position: 'absolute', top: 100, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{fontSize: 44, color: '#111'}}>‹</span>
        <div style={{width: 72, height: 72, borderRadius: 99, background: '#DFE5E7', display: 'grid', placeItems: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 30, color: '#54656F'}}>{title[0]}</div>
        <div style={{flex: 1, fontFamily: F.body}}>
          <div style={{fontWeight: 700, fontSize: 30, color: WA.text}}>{title}</div>
          <div style={{fontSize: 21, color: WA.meta}}>Business account · AI assistant</div>
        </div>
        <BrandIcon name="whatsapp" size={46} />
      </div>
    </div>
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, bottom: 130, padding: '0 24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundImage: 'radial-gradient(rgba(0,0,0,0.045) 2px, transparent 2px)', backgroundSize: '30px 30px'}}>
      {msgs.map((m, i) => (
        <Bubble key={i} m={m} />
      ))}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, background: '#F0F2F5', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px 30px'}}>
      <div style={{flex: 1, height: 72, borderRadius: 40, background: '#fff', color: WA.meta, fontFamily: F.body, fontSize: 27, display: 'flex', alignItems: 'center', paddingLeft: 28}}>Message</div>
      <div style={{width: 72, height: 72, borderRadius: 99, background: WA.green}} />
    </div>
  </AbsoluteFill>
);

const Lock: React.FC<{time: string; notes: {who: string; text: string; ago: string}[]}> = ({time, notes}) => (
  <AbsoluteFill style={{background: 'linear-gradient(170deg, #1B2A22 0%, #0B1410 55%, #050806 100%)'}}>
    <StatusBar time="" dark />
    <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: F.body}}>
      <div style={{fontSize: 30, fontWeight: 600, opacity: 0.85}}>Monday, 18 November</div>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 190, letterSpacing: '-0.04em', lineHeight: 1}}>{time}</div>
    </div>
    <div style={{position: 'absolute', left: 26, right: 26, top: 560, display: 'flex', flexDirection: 'column', gap: 14}}>
      {notes.map((n, i) => (
        <div key={i} style={{background: 'rgba(245,245,247,0.92)', borderRadius: 30, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'center', fontFamily: F.body}}>
          <BrandIcon name="whatsapp" size={60} />
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 23, color: '#6E6E73', fontWeight: 600}}>
              <span>WHATSAPP</span>
              <span>{n.ago}</span>
            </div>
            <div style={{fontWeight: 700, fontSize: 28, color: '#1D1D1F'}}>{n.who}</div>
            <div style={{fontSize: 27, color: '#1D1D1F'}}>{n.text}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

const Slots: React.FC<{picked?: boolean}> = ({picked}) => (
  <div style={{width: 440}}>
    Consultation ke liye slot chuniye:
    {['Sat 11:00 AM', 'Sat 4:00 PM', 'Sun 12:00 PM'].map((s, i) => (
      <div key={s} style={{marginTop: 8, border: `2px solid ${picked && i === 0 ? WA.green : '#E9EDEF'}`, background: picked && i === 0 ? '#E7F8F3' : '#F7F8FA', borderRadius: 12, padding: '10px', textAlign: 'center', color: WA.green, fontWeight: 700}}>{s}</div>
    ))}
  </div>
);

const ITEMS = [['Cappuccino × 2', 440], ['Farmhouse pizza', 620], ['Pancakes', 380], ['Cheesecake', 400]] as const;
const Invoice: React.FC = () => (
  <div style={{width: 440}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 56, height: 68, borderRadius: 8, background: '#E5484D', color: '#fff', fontWeight: 800, fontSize: 16, display: 'grid', placeItems: 'center'}}>PDF</div>
      <div>
        <div style={{fontWeight: 700}}>Invoice-1042.pdf</div>
        <div style={{fontSize: 21, color: WA.meta}}>Table 6 · ₹1,840</div>
      </div>
    </div>
    {ITEMS.map(([n, v]) => (
      <div key={n} style={{display: 'flex', justifyContent: 'space-between', fontSize: 23, marginTop: 6, color: '#333'}}>
        <span>{n}</span>
        <span>₹{v}</span>
      </div>
    ))}
    <div style={{marginTop: 12, padding: 12, borderRadius: 12, background: '#F0F2F5', textAlign: 'center', color: WA.green, fontWeight: 700}}>Pay ₹1,840 via UPI</div>
  </div>
);

export const PHONE_SCREENS: Record<string, React.ReactNode> = {
  lock12: <Lock time="12:00" notes={[{who: 'Rahul Sharma', text: 'Sofa set ka price kya hai?', ago: 'now'}]} />,
  lock8: (
    <Lock
      time="8:04"
      notes={[
        {who: 'Rahul Sharma', text: 'Koi baat nahi, dusri shop se le liya.', ago: 'now'},
        {who: 'Rahul Sharma', text: 'Sofa set ka price kya hai?', ago: '8h ago'},
      ]}
    />
  ),
  s1a: <Chat title="Royal Furniture" time="11:58" msgs={[{from: 'out', text: 'Sofa set ka price kya hai?', time: '11:58 PM'}]} />,
  s1b: (
    <Chat
      title="Royal Furniture"
      time="11:58"
      msgs={[
        {from: 'out', text: 'Sofa set ka price kya hai?', time: '11:58 PM'},
        {from: 'in', text: 'Namaste! 3-seater sofa ₹24,999 se start hota hai. Catalogue bhej raha hoon.', time: '11:58 PM'},
        {from: 'in', text: 'Sofa Catalogue · 12 designs (PDF)', time: '11:58 PM'},
        {from: 'out', text: 'Delivery kab tak?', time: '11:59 PM'},
        {from: 'in', text: 'Jaipur mein 3 din. Order confirm karein?', time: '11:59 PM'},
      ]}
    />
  ),
  s3a: <Chat title="Glow Skin Clinic" time="4:12" msgs={[{from: 'out', text: 'Consultation book karni hai', time: '4:12 PM'}, {from: 'in', node: <Slots />, time: '4:12 PM'}]} />,
  s3b: (
    <Chat
      title="Glow Skin Clinic"
      time="4:12"
      msgs={[
        {from: 'out', text: 'Consultation book karni hai', time: '4:12 PM'},
        {from: 'in', node: <Slots picked />, time: '4:12 PM'},
        {from: 'out', text: 'Sat 11:00 AM', time: '4:12 PM'},
        {from: 'in', text: 'Booking confirmed ✓ Saturday, 11:00 AM. Reminder Friday ko aayega.', time: '4:12 PM'},
      ]}
    />
  ),
  s4a: <Chat title="Neha's Bakery" time="7:30" msgs={[{from: 'in', node: <div style={{width: 440}}>Order kaisa laga, Neha? Ek click mein review de dijiye.<div style={{marginTop: 10, paddingTop: 10, borderTop: '1px solid #E9EDEF', textAlign: 'center', color: WA.green, fontWeight: 700}}>Google pe review dein</div></div>, time: '7:30 PM'}]} />,
  s4b: (
    <Chat
      title="Neha's Bakery"
      time="7:34"
      msgs={[
        {from: 'in', node: <div style={{width: 440}}>Order kaisa laga, Neha? Ek click mein review de dijiye.<div style={{marginTop: 10, paddingTop: 10, borderTop: '1px solid #E9EDEF', textAlign: 'center', color: WA.green, fontWeight: 700}}>Google pe review dein</div></div>, time: '7:30 PM'},
        {from: 'out', text: 'Done! 5 star diye ⭐', time: '7:34 PM'},
        {from: 'in', text: 'Bahut shukriya! Agle order pe 10% off.', time: '7:34 PM'},
      ]}
    />
  ),
  s5a: <Chat title="Café 21" time="9:15" msgs={[{from: 'in', node: <Invoice />, time: '9:15 PM'}]} />,
  s5b: <Chat title="Café 21" time="9:16" msgs={[{from: 'in', node: <Invoice />, time: '9:15 PM'}, {from: 'out', text: 'Paid ✓ UPI Ref 4417', time: '9:16 PM'}, {from: 'in', text: 'Payment mil gaya. Shukriya!', time: '9:16 PM'}]} />,
};

export const SQUARES: Record<string, React.ReactNode> = {
  cal: (
    <AbsoluteFill style={{background: '#fff', fontFamily: F.body, textAlign: 'center'}}>
      <div style={{height: 150, background: '#0FA958', color: '#fff', fontFamily: F.display, fontWeight: 800, fontSize: 84, lineHeight: '150px', letterSpacing: '0.08em'}}>SAT</div>
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 250, color: '#0B0B0B', lineHeight: 1, marginTop: 30}}>11</div>
      <div style={{fontSize: 44, fontWeight: 700, color: '#6E726F', marginTop: 10}}>11:00 AM</div>
    </AbsoluteFill>
  ),
  coin: (
    <AbsoluteFill style={{background: '#0FA958', display: 'grid', placeItems: 'center', borderRadius: '50%'}}>
      <div style={{width: 440, height: 440, borderRadius: '50%', border: '10px solid rgba(255,255,255,0.55)', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: F.display, fontWeight: 900, fontSize: 300, lineHeight: 1}}>₹</div>
    </AbsoluteFill>
  ),
  nx: (
    <AbsoluteFill style={{background: '#000', display: 'grid', placeItems: 'center'}}>
      <Logo size={512} />
    </AbsoluteFill>
  ),
};

export const TexPhone: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  return <AbsoluteFill>{PHONE_SCREENS[id]}</AbsoluteFill>;
};
export const TexSquare: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  return <AbsoluteFill>{SQUARES[id]}</AbsoluteFill>;
};
