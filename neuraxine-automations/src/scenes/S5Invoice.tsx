import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);
// From the page's own "QR scan, order, bill WhatsApp par" post.
const ITEMS = [
  ['Cappuccino × 2', 440],
  ['Farmhouse pizza', 620],
  ['Pancakes', 380],
  ['Cheesecake', 400],
] as const;
const TOTAL = ITEMS.reduce((a, [, v]) => a + v, 0);

export const S5Invoice: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s5', 1));
  const bill = fr(wordAt('s5', 1, 'bill'));
  const pay = fr(wordAt('s5', 1, 'payment'));
  const paid = fr(wordAt('s5', 1, 'bina'));
  const post = prog(frame, 26, 18, ease.out);
  const order = prog(frame, l1, 14, ease.out);
  const inv = prog(frame, bill, 14, ease.out);
  const wa = prog(frame, pay, 14, ease.out);
  const stamp = prog(frame, paid, 10, ease.out);
  return (
    <AbsoluteFill>
      <ChapterHeader n={5} start={4} />
      {/* the real post */}
      <div style={{position: 'absolute', left: 80, top: 480, width: 330, opacity: post, transform: `rotate(${mix(post, -12, -5)}deg) translateY(${(1 - post) * 60}px)`}}>
        <div style={{borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', background: 'white'}}>
          <Img src={staticFile('posts/p3.png')} style={{width: 330, height: 440, objectFit: 'cover', objectPosition: 'top', display: 'block'}} />
        </div>
        <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontFamily: F.body, fontWeight: 600, fontSize: 22}}>
          <BrandIcon name="instagram" size={26} /> @neuraxine ka real system
        </div>
      </div>
      {/* order → invoice */}
      <div style={{position: 'absolute', left: 450, right: 80, top: 500, opacity: order, transform: `translateX(${(1 - order) * 80}px)`}}>
        <div style={{background: 'white', borderRadius: 20, padding: '20px 22px', fontFamily: F.body, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize: 19, fontWeight: 700, letterSpacing: '0.1em', color: '#5F6368'}}>ORDER · TABLE 6</div>
          {ITEMS.map(([n, v], i) => (
            <div key={n} style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 600, color: '#1F1F1F', marginTop: 8, opacity: prog(frame, l1 + 4 + i * 4, 8)}}>
              <span>{n}</span>
              <span>₹{v}</span>
            </div>
          ))}
          <div style={{marginTop: 14, paddingTop: 12, borderTop: '2px dashed #DADCE0', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 28, color: '#1F1F1F', opacity: inv}}>
            <span>Invoice #1042</span>
            <span>₹{TOTAL.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      {/* WhatsApp payment message */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 1060, opacity: wa, transform: `translateY(${(1 - wa) * 70}px)`}}>
        <div style={{background: '#EFEAE2', borderRadius: 26, padding: 22, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
          <div style={{background: 'white', borderRadius: 16, borderTopLeftRadius: 4, padding: '16px 18px', fontFamily: F.body, color: '#111B21', width: '86%'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 60, height: 72, borderRadius: 8, background: '#E5484D', color: 'white', fontWeight: 800, fontSize: 17, display: 'grid', placeItems: 'center'}}>PDF</div>
              <div>
                <div style={{fontWeight: 700, fontSize: 26}}>Invoice-1042.pdf</div>
                <div style={{fontSize: 21, color: '#667781'}}>Bill · ₹{TOTAL.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div style={{marginTop: 12, fontSize: 26, fontWeight: 500}}>Shukriya! UPI se pay karein:</div>
            <div style={{marginTop: 10, padding: '12px', borderRadius: 12, background: '#F0F2F5', textAlign: 'center', color: '#00A884', fontWeight: 700, fontSize: 26}}>Pay ₹{TOTAL.toLocaleString('en-IN')} via UPI</div>
          </div>
        </div>
      </div>
      {/* paid stamp */}
      {stamp > 0 && (
        <div style={{position: 'absolute', right: 120, top: 1300, transform: `rotate(-8deg) scale(${mix(stamp, 1.8, 1)})`, opacity: stamp}}>
          <div style={{padding: '14px 30px', borderRadius: 14, border: `5px solid ${C.accent}`, color: C.accent, fontFamily: F.display, fontWeight: 900, fontSize: 54, letterSpacing: '0.06em', background: 'rgba(3,5,4,0.85)'}}>PAID ✓</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
