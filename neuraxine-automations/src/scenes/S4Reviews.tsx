import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {REVIEWS, cue, wordAt} from '../config';
import {F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon} from '../components/BrandIcon';
import {WaChat, WaMsg} from '../components/WaChat';

const fr = (s: number) => Math.round(s * 30);

const Stars: React.FC<{n: number; size: number}> = ({n, size}) => (
  <span style={{display: 'inline-flex', gap: 3}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill={i < n ? '#FBBC04' : '#DADCE0'} />
      </svg>
    ))}
  </span>
);

const Ask: React.FC = () => (
  <div style={{width: 470}}>
    <div>Order kaisa laga, Neha? Ek click mein review de dijiye.</div>
    <div style={{marginTop: 12, borderTop: '1px solid #E9EDEF', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#00A884', fontWeight: 700}}>
      <BrandIcon name="google" size={28} /> Google pe review dein
    </div>
  </div>
);

export const S4Reviews: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s4', 1));
  const goog = fr(wordAt('s4', 1, 'google'));
  const up = fr(wordAt('s4', 1, 'badhte'));
  const msgs: WaMsg[] = [
    {at: 40, from: 'in', node: <Ask />, time: '7:30 PM'},
    {at: l1 + 50, from: 'out', text: 'Done! 5 star diye', time: '7:34 PM'},
  ];
  const chatIn = prog(frame, 30, 18, ease.out);
  const panel = prog(frame, goog - 6, 16, ease.out);
  const grow = prog(frame, up, 40, ease.inOut);
  const rating = mix(grow, 4.6, 4.9);
  const count = Math.round(mix(grow, 128, 212));
  return (
    <AbsoluteFill>
      <ChapterHeader n={4} start={4} />
      <div style={{position: 'absolute', left: 110, right: 110, top: 500, opacity: chatIn, transform: `translateY(${(1 - chatIn) * 80}px)`}}>
        <WaChat msgs={msgs} title="Neha's Bakery" subtitle="Business account · AI assistant" height={500} />
      </div>
      <div style={{position: 'absolute', left: 110, right: 110, top: 1040, opacity: panel, transform: `translateY(${(1 - panel) * 70}px)`}}>
        <div style={{background: 'white', borderRadius: 24, padding: '24px 26px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', fontFamily: F.body}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <BrandIcon name="google" size={44} />
            <div style={{flex: 1, fontWeight: 700, fontSize: 28, color: '#1F1F1F'}}>Neha's Bakery · Reviews</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
            <div style={{fontSize: 84, fontWeight: 400, color: '#1F1F1F', lineHeight: 1}}>{rating.toFixed(1)}</div>
            <div>
              <Stars n={5} size={34} />
              <div style={{fontSize: 23, color: '#5F6368', marginTop: 4}}>{count} reviews</div>
            </div>
            <div style={{marginLeft: 'auto', padding: '8px 14px', borderRadius: 999, background: '#E6F4EA', color: '#137333', fontWeight: 700, fontSize: 22, opacity: grow}}>+{count - 128} is mahine</div>
          </div>
          {REVIEWS.slice(0, 2).map((r, i) => {
            const p = prog(frame, up + 10 + i * 10, 14, ease.out);
            return (
              <div key={i} style={{marginTop: 14, paddingTop: 14, borderTop: '1px solid #E8EAED', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: '#5F6368'}}>
                  <Stars n={5} size={22} /> {r.name}
                </div>
                <div style={{fontSize: 27, fontWeight: 600, color: '#1F1F1F', marginTop: 4}}>{r.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
