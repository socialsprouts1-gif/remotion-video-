import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {WaChat, WaMsg} from '../components/WaChat';

const fr = (s: number) => Math.round(s * 30);

const Catalogue: React.FC = () => (
  <div style={{width: 380}}>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderRadius: 10, overflow: 'hidden'}}>
      {['#C9A27E', '#8E6F57', '#B7B0A6', '#6C7A6B'].map((c, i) => (
        <div key={i} style={{height: 92, background: `linear-gradient(160deg, ${c}, #3D332C)`, position: 'relative'}}>
          <div style={{position: 'absolute', left: '18%', right: '18%', bottom: 18, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.35)'}} />
        </div>
      ))}
    </div>
    <div style={{marginTop: 8, fontWeight: 700}}>Sofa Catalogue · 12 designs</div>
    <div style={{fontSize: 22, color: '#667781'}}>PDF · 4.2 MB</div>
  </div>
);

export const S1AutoReply: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s1', 1));
  const fast = fr(wordAt('s1', 1, 'turant'));
  const allday = fr(wordAt('s1', 1, '24'));
  const msgs: WaMsg[] = [
    {at: 40, from: 'out', text: 'Sofa set ka price kya hai?', time: '11:58 PM'},
    {at: fast + 6, typingFrom: l1 + 16, from: 'in', text: 'Namaste! 3-seater sofa ₹24,999 se start hota hai. Catalogue bhej raha hoon.', time: '11:58 PM'},
    {at: fast + 26, from: 'in', node: <Catalogue />, time: '11:58 PM'},
    {at: allday - 6, from: 'out', text: 'Delivery kab tak?', time: '11:59 PM'},
    {at: allday + 22, typingFrom: allday + 4, from: 'in', text: 'Jaipur mein 3 din. Order confirm karein?', time: '11:59 PM'},
  ];
  const chatIn = prog(frame, 30, 18, ease.out);
  const badge = prog(frame, fast + 8, 12, ease.out);
  const clock = prog(frame, 36, 14, ease.out);
  return (
    <AbsoluteFill>
      <ChapterHeader n={1} start={4} />
      <div style={{position: 'absolute', left: 110, right: 110, top: 520, opacity: chatIn, transform: `translateY(${(1 - chatIn) * 80}px)`}}>
        <WaChat msgs={msgs} title="Royal Furniture" subtitle="Business account · AI assistant" height={900} />
      </div>
      {/* night clock + reply time */}
      <div style={{position: 'absolute', left: 70, top: 470, opacity: clock, transform: `scale(${mix(clock, 0.8, 1)})`}}>
        <div style={{padding: '12px 20px', borderRadius: 16, background: '#111', border: `1px solid ${C.lineStrong}`, color: C.ink, fontFamily: F.display, fontWeight: 800, fontSize: 30, display: 'flex', gap: 10, alignItems: 'center'}}>
          <svg width={26} height={26} viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="#F5C451" /></svg>
          11:58 PM
        </div>
      </div>
      <div style={{position: 'absolute', right: 70, top: 470, opacity: badge, transform: `scale(${mix(badge, 1.3, 1)})`}}>
        <div style={{padding: '12px 20px', borderRadius: 16, background: '#00A884', color: 'white', fontFamily: F.display, fontWeight: 800, fontSize: 30}}>Reply in 3 sec</div>
      </div>
    </AbsoluteFill>
  );
};
