import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {cue, wordAt} from '../config';
import {F} from '../theme';
import {ease, mix, prog} from '../lib/anim';
import {ChapterHeader} from '../components/ChapterHeader';
import {BrandIcon} from '../components/BrandIcon';
import {WaChat, WaMsg} from '../components/WaChat';

const fr = (s: number) => Math.round(s * 30);
const SLOTS = ['Sat 11:00 AM', 'Sat 4:00 PM', 'Sun 12:00 PM'];

const Slots: React.FC<{tap: number}> = ({tap}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{width: 470}}>
      <div>Consultation ke liye slot chuniye:</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12}}>
        {SLOTS.map((s, i) => {
          const on = i === 0 && frame >= tap;
          const press = i === 0 ? prog(frame, tap - 3, 3) * (1 - prog(frame, tap + 1, 6)) : 0;
          return (
            <div key={s} style={{border: `2px solid ${on ? '#00A884' : '#E9EDEF'}`, background: on ? '#E7F8F3' : '#F7F8FA', borderRadius: 12, padding: '10px 14px', textAlign: 'center', color: '#00A884', fontWeight: 700, transform: `scale(${1 - press * 0.05})`}}>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const S3Booking: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = fr(cue('s3', 1));
  const slot = fr(wordAt('s3', 1, 'slot'));
  const conf = fr(wordAt('s3', 1, 'confirm'));
  const rem = fr(wordAt('s3', 1, 'reminder'));
  const msgs: WaMsg[] = [
    {at: 40, from: 'out', text: 'Consultation book karni hai', time: '4:12 PM'},
    {at: l1 + 8, from: 'in', node: <Slots tap={slot + 6} />, time: '4:12 PM'},
    {at: slot + 14, from: 'out', text: 'Sat 11:00 AM', time: '4:12 PM'},
    {at: conf, typingFrom: slot + 22, from: 'in', text: 'Booking confirmed ✓ Saturday, 11:00 AM. Location map bhej diya hai.', time: '4:12 PM'},
  ];
  const chatIn = prog(frame, 30, 18, ease.out);
  const cal = prog(frame, conf + 8, 16, ease.out);
  const note = prog(frame, rem, 12, ease.out);
  return (
    <AbsoluteFill>
      <ChapterHeader n={3} start={4} />
      <div style={{position: 'absolute', left: 110, right: 110, top: 500, opacity: chatIn, transform: `translateY(${(1 - chatIn) * 80}px)`}}>
        <WaChat msgs={msgs} title="Glow Skin Clinic" subtitle="Business account · AI assistant" height={760} />
      </div>
      {/* Google Calendar event */}
      <div style={{position: 'absolute', left: 140, right: 140, top: 1300, opacity: cal, transform: `translateY(${(1 - cal) * 60}px)`}}>
        <div style={{background: 'white', borderRadius: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', fontFamily: F.body}}>
          <Img src={staticFile('icons/google-calendar.svg')} style={{width: 56, height: 56}} />
          <div style={{flex: 1, borderLeft: '6px solid #039BE5', paddingLeft: 14}}>
            <div style={{fontWeight: 700, fontSize: 28, color: '#1F1F1F'}}>Consultation · Rahul</div>
            <div style={{fontSize: 22, color: '#5F6368'}}>Saturday, 11:00 – 11:30 AM</div>
          </div>
        </div>
      </div>
      {/* reminder notification */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 440, opacity: note, transform: `translateY(${(1 - note) * -80}px) scale(${mix(note, 0.95, 1)})`}}>
        <div style={{background: 'rgba(245,245,247,0.97)', borderRadius: 26, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', fontFamily: F.body}}>
          <BrandIcon name="whatsapp" size={50} />
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: '#6E6E73', fontWeight: 600}}>
              <span>WHATSAPP · Glow Skin Clinic</span>
              <span>Fri 6:00 PM</span>
            </div>
            <div style={{fontWeight: 700, fontSize: 27, color: '#1D1D1F', marginTop: 2}}>Reminder: kal 11 AM aapka appointment hai</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
