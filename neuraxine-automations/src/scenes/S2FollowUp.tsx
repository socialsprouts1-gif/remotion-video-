import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {C, F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon, BrandName} from '../components/BrandIcon';

const fr = (s: number) => Math.round(s * 30);

const STEPS: {icon: BrandName; when: string; text: string; word: string}[] = [
  {icon: 'whatsapp', when: '2 min baad', text: 'Hi Priya! Aapka interior quote ready hai.', word: 'whatsapp'},
  {icon: 'gmail', when: 'Day 1', text: 'Design catalogue + past projects (PDF)', word: 'email'},
  {icon: 'whatsapp', when: 'Day 3', text: 'Free site visit Saturday ko book karein?', word: 'jab tak'},
];

export const S2FollowUp: React.FC = () => {
  const frame = useCurrentFrame();
  const lead = fr(cue('s2', 1));
  const end = fr(cue('s2', 1, 'end'));
  const leadIn = prog(frame, lead, 16, ease.out);
  const reply = prog(frame, end - 4, 14, ease.out);
  return (
    <AbsoluteFill>
      <ChapterHeader n={2} start={4} />
      {/* Meta lead form */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 490, opacity: leadIn, transform: `translateY(${(1 - leadIn) * -60}px)`}}>
        <div style={{background: 'white', borderRadius: 24, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
          <BrandIcon name="meta" size={64} />
          <div style={{flex: 1, fontFamily: F.body}}>
            <div style={{fontSize: 21, fontWeight: 700, color: '#0866FF', letterSpacing: '0.06em'}}>NEW LEAD · INSTAGRAM AD</div>
            <div style={{fontSize: 34, fontWeight: 800, color: '#1C1E21', marginTop: 2}}>Priya Verma</div>
            <div style={{fontSize: 23, color: '#65676B'}}>2BHK interior quote · Jaipur</div>
          </div>
          <div style={{fontFamily: F.body, fontSize: 20, color: '#65676B'}}>abhi</div>
        </div>
      </div>
      {/* sequence */}
      <div style={{position: 'absolute', left: 150, top: 720, width: 4, height: 600 * prog(frame, lead + 20, 40, ease.inOut), background: C.lineStrong, borderRadius: 4}} />
      {STEPS.map((s, i) => {
        const at = fr(wordAt('s2', 1, s.word)) - 4;
        const p = prog(frame, at, 14, ease.out);
        return (
          <div key={i} style={{position: 'absolute', left: 110, right: 110, top: 740 + i * 200, display: 'flex', gap: 26, alignItems: 'center', opacity: p, transform: `translateX(${(1 - p) * 80}px)`}}>
            <div style={{width: 84, height: 84, borderRadius: 99, background: 'white', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
              <BrandIcon name={s.icon} size={50} />
            </div>
            <div style={{flex: 1, background: '#16191A', border: `1px solid ${C.line}`, borderRadius: 20, padding: '18px 22px', fontFamily: F.body}}>
              <div style={{color: C.accent, fontWeight: 700, fontSize: 22, letterSpacing: '0.08em'}}>{s.when.toUpperCase()} · AUTO</div>
              <div style={{color: C.ink, fontWeight: 600, fontSize: 28, marginTop: 4}}>{s.text}</div>
            </div>
          </div>
        );
      })}
      {/* the reply */}
      <div style={{position: 'absolute', left: 260, right: 110, top: 1360, opacity: reply, transform: `scale(${mix(reply, 0.9, 1)})`}}>
        <div style={{background: '#D9FDD3', borderRadius: 18, borderTopLeftRadius: 4, padding: '16px 22px', fontFamily: F.body, fontWeight: 600, fontSize: 29, color: '#111B21', display: 'flex', alignItems: 'center', gap: 14}}>
          <BrandIcon name="whatsapp" size={36} />
          Priya: "Haan, Saturday 11 baje theek hai"
        </div>
      </div>
    </AbsoluteFill>
  );
};
