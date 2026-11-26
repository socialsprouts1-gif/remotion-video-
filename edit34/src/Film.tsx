import React from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {DUR, W, clamp01, ep, lerp, sp} from './ui';
import edit from './edit.json';

// ---------------------------------------------------------------------------------------
// NeuraChat explainer — after the "WhatsApp automation ka Day 06" reference:
// crumpled-paper background, heavy Montserrat captions built word by word
// (small dark words + big olive / black / bright-green keywords), and one clean
// white UI card per beat.
// ---------------------------------------------------------------------------------------
const MONT = 'Montserrat, Arial Black, sans-serif';
const OLIVE = '#56692A';
const OLIVE2 = '#76893A';
const BLACK = '#1C1C1A';
const GREEN = '#22B24C';
const DARK = '#2E2E2B';
const logo = (n: string) => staticFile(`logos/${n}.svg`);
const fl = (n: string) => staticFile(`fluent/${n}.png`);

const FontsLoad: React.FC = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const faces = [700, 800, 900].map((w) => new FontFace('Montserrat', `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)})`, {weight: String(w)}));
    faces.push(new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}));
    faces.push(new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-latin-400-normal.woff2')})`));
    Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff))))
      .catch(() => null)
      .finally(() => continueRender(h));
  }, [h]);
  return null;
};

// ---- words ------------------------------------------------------------------------------
const WORDS = (edit.words as {w: string; line: number}[]).reduce<Record<number, string[]>>((a, w) => {
  (a[w.line] = a[w.line] || []).push(w.w);
  return a;
}, {});
type St = 'd' | 'O' | 'K' | 'G';
type Tok = [number, number, St?, string?];
const Word: React.FC<{t: number; tok: Tok; scale: number}> = ({t, tok, scale}) => {
  const [l, k, st = 'd', txt] = tok;
  const at = W(l, k) - 0.05;
  const p = ep(t, at, 0.3);
  const word = txt ?? WORDS[l][k].replace(/"/g, '');
  const big = st !== 'd';
  const color = st === 'O' ? OLIVE : st === 'K' ? BLACK : st === 'G' ? GREEN : DARK;
  const grad = st === 'O' ? `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)` : st === 'G' ? 'linear-gradient(180deg, #3BD368, #1FA444 70%)' : undefined;
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: MONT,
        fontWeight: big ? 900 : 800,
        fontSize: (big ? 104 : 54) * scale,
        lineHeight: 1.08,
        letterSpacing: big ? '-0.01em' : '-0.01em',
        textTransform: big ? 'uppercase' : 'none',
        color,
        backgroundImage: grad,
        WebkitBackgroundClip: grad ? 'text' : undefined,
        WebkitTextFillColor: grad ? 'transparent' : undefined,
        filter: `drop-shadow(0 6px 10px rgba(40,40,20,0.18)) blur(${(1 - p) * 6}px)`,
        opacity: p,
        transform: `translateY(${(1 - p) * 22}px) scale(${lerp(0.86, 1, p)})`,
        whiteSpace: 'pre',
      }}
    >
      {word}
    </span>
  );
};
const Caption: React.FC<{t: number; rows: Tok[][]; top: number; scale?: number}> = ({t, rows, top, scale = 1}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0}}>
    {rows.map((r, i) => {
      // estimate row width (Montserrat Black caps ~0.74em/char, ExtraBold lower ~0.6em/char) and shrink to fit
      const est = r.reduce((a, [l, k, st = 'd', txt]) => {
        const w = (txt ?? WORDS[l][k].replace(/"/g, '')).length;
        return a + (st === 'd' ? w * 54 * 0.6 : w * 104 * 0.74) * scale + 16 * scale;
      }, 0);
      const fit = Math.min(1, 960 / est);
      return (
        <div key={i} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16 * scale * fit, flexWrap: 'nowrap'}}>
          {r.map((tok, j) => (
            <Word key={j} t={t} tok={tok} scale={scale * fit} />
          ))}
        </div>
      );
    })}
  </div>
);

// ---- card shell ---------------------------------------------------------------------------
const Card: React.FC<{t: number; at: number; top: number; w?: number; children: React.ReactNode; pad?: number}> = ({t, at, top, w = 900, children, pad = 28}) => {
  const p = ep(t, at, 0.4);
  const inner = ep(t, at + 0.15, 0.35);
  return (
    <div style={{position: 'absolute', left: (1080 - w) / 2, top, width: w, background: '#fff', borderRadius: 34, padding: pad, border: '2px solid rgba(30,40,20,0.07)', boxShadow: '0 24px 60px rgba(60,55,40,0.16), 0 4px 10px rgba(60,55,40,0.06)', opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${lerp(0.92, 1, sp(t, at, 1.1))})`}}>
      <div style={{opacity: inner, transform: `translateY(${(1 - inner) * 12}px)`}}>{children}</div>
    </div>
  );
};
const Mono: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = '#7B8070', size = 19}) => (
  <div style={{fontFamily: '"Geist Mono", monospace', fontWeight: 700, fontSize: size, letterSpacing: '0.12em', textTransform: 'uppercase', color}}>{children}</div>
);
const Bubble: React.FC<{me?: boolean; children: React.ReactNode; time: string; t: number; at: number}> = ({me, children, time, t, at}) => {
  const p = ep(t, at, 0.3);
  return (
    <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
      <div style={{maxWidth: 720, background: me ? '#D3F5C8' : '#F3F2EE', border: me ? '2px solid #A6E3A0' : '2px solid #E6E4DD', borderRadius: 26, borderTopRightRadius: me ? 6 : 26, borderTopLeftRadius: me ? 26 : 6, padding: '16px 22px 10px', fontFamily: MONT, fontWeight: 700, fontSize: 31, lineHeight: 1.35, color: '#1F2A1C'}}>
        {children}
        <div style={{fontFamily: '"Geist Mono", monospace', fontSize: 17, color: '#7B8070', textAlign: 'right', marginTop: 6}}>
          {time} {me && <span style={{color: '#34B7F1'}}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};
const ChatHead: React.FC<{name: string; sub: string; ic?: string}> = ({name, sub, ic = 'whatsapp'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
    <div style={{width: 58, height: 58, borderRadius: 29, background: '#EEF5EA', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={logo(ic)} style={{width: 36, height: 36}} />
    </div>
    <div>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 28, color: BLACK}}>{name}</div>
      <div style={{fontFamily: '"Geist Mono", monospace', fontSize: 18, color: GREEN}}>{sub}</div>
    </div>
  </div>
);

// ---- beats --------------------------------------------------------------------------------
type Beat = {at: [number, number]; draw: (t: number) => React.ReactNode};
const CAP = 690;
const CARD = 1070;
const FlowStep: React.FC<{t: number; at: number; ic: string; isLogo?: boolean; top: string; sub: string; hot?: boolean}> = ({t, at, ic, isLogo, top, sub, hot}) => (
  <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: hot ? '#EAF8EE' : '#F7F6F2', border: `2px solid ${hot ? '#A6E3A0' : '#ECEAE3'}`, borderRadius: 22, padding: '18px 10px', opacity: ep(t, at, 0.25), transform: `translateY(${(1 - ep(t, at, 0.3)) * 18}px) scale(${t > at ? lerp(1.08, 1, ep(t, at, 0.35)) : 1})`}}>
    <Img src={isLogo ? logo(ic) : fl(ic)} style={{width: 64, height: 64}} />
    <Mono size={15}>{top}</Mono>
    <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK, textAlign: 'center', lineHeight: 1.2}}>{sub}</div>
  </div>
);
const Arrow: React.FC<{t: number; at: number}> = ({t, at}) => <div style={{alignSelf: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 40, color: OLIVE2, opacity: ep(t, at, 0.2)}}>→</div>;

const BEATS: Beat[] = [
  // title card: "Bhai aaj hai WHATSAPP AUTOMATION seekhne ka DAY 03!"
  {
    at: [0, 0],
    draw: (t) => {
      const p = ep(t, 0, 0.45);
      return (
        <div style={{position: 'absolute', left: 70, right: 70, top: 660, background: '#fff', borderRadius: 40, padding: '56px 30px 60px', boxShadow: '0 30px 70px rgba(60,55,40,0.18)', opacity: p, transform: `scale(${lerp(0.9, 1, sp(t, 0, 1.1))})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
          <Caption t={t} top={0} rows={[[[0, 0], [0, 1], [0, 2]]]} scale={1.05} />
          <div style={{height: 70}} />
          <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ep(t, W(0, 3) - 0.1, 0.3), transform: `scale(${lerp(0.85, 1, ep(t, W(0, 3) - 0.1, 0.35))})`}}>
            <Img src={logo('whatsapp')} style={{width: 70, height: 70}} />
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 116, letterSpacing: '-0.02em', backgroundImage: `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 6px 10px rgba(40,40,20,0.18))'}}>WHATSAPP</span>
          </div>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 116, letterSpacing: '-0.02em', color: BLACK, lineHeight: 1, filter: 'drop-shadow(0 6px 10px rgba(40,40,20,0.18))', opacity: ep(t, W(0, 4) - 0.1, 0.3), transform: `translateY(${(1 - ep(t, W(0, 4) - 0.1, 0.3)) * 20}px)`}}>AUTOMATION</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, opacity: ep(t, W(0, 5) - 0.05, 0.3)}}>
            <span style={{fontFamily: MONT, fontWeight: 800, fontSize: 46, color: DARK, whiteSpace: 'nowrap'}}>seekhne ka</span>
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 104, color: BLACK, opacity: ep(t, W(0, 7) - 0.05, 0.25)}}>DAY</span>
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 104, backgroundImage: `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(0, 8) - 0.05, 0.25), transform: `scale(${t > W(0, 8) ? lerp(1.3, 1, ep(t, W(0, 8), 0.35)) : 1})`, display: 'inline-block'}}>03!</span>
            <Img src={fl('fire')} style={{width: 96, height: 96, transform: `scale(${t > W(0, 8) ? sp(t, W(0, 8), 1.4) : 0})`}} />
          </div>
        </div>
      );
    },
  },
  // today: appointment booking on autopilot
  {
    at: [1, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[1, 0], [1, 1, 'O'], [1, 2, 'K']], [[1, 3], [1, 4, 'G'], [1, 5]], [[1, 6]]]} />
        <Card t={t} at={W(1, 1) - 0.1} top={CARD + 40} w={760}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
            <Img src={logo('whatsapp')} style={{width: 100, height: 100}} />
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, color: OLIVE2}}>→</div>
            <Img src={fl('spiral_calendar')} style={{width: 110, height: 110}} />
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, color: OLIVE2, opacity: ep(t, W(1, 4), 0.25)}}>=</div>
            <Img src={fl('check_mark_button')} style={{width: 100, height: 100, opacity: ep(t, W(1, 4), 0.25), transform: `scale(${t > W(1, 4) ? sp(t, W(1, 4), 1.4) : 0.4})`}} />
          </div>
        </Card>
      </>
    ),
  },
  // now: you check the calendar and reply again and again
  {
    at: [2, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 90} rows={[[[2, 0], [2, 1], [2, 2], [2, 3]], [[2, 4], [2, 5], [2, 6]], [[2, 7, 'O', '“KAL'], [2, 8], [2, 9, 'O'], [2, 10, 'd', 'hai?”']], [[2, 11], [2, 12], [2, 13, 'K'], [2, 14]], [[2, 15], [2, 16, 'G'], [2, 17, 'G']]]} />
        <Card t={t} at={W(2, 7) - 0.1} top={CARD + 160} w={860}>
          <Bubble t={t} at={W(2, 7)} time="5:02 PM">Kal ka slot hai?</Bubble>
          <div style={{height: 10}} />
          <Bubble t={t} at={W(2, 13)} me time="5:20 PM">Ek min, check karke batata hoon…</Bubble>
          <div style={{height: 10}} />
          <Bubble t={t} at={W(2, 16)} time="5:24 PM">4 baje ho jayega?</Bubble>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12, opacity: ep(t, W(2, 17), 0.25)}}>
            <Img src={fl('repeat_button')} style={{width: 36, height: 36, transform: `rotate(${t * 180}deg)`}} />
            <div style={{background: '#FDECEC', color: '#E5484D', borderRadius: 16, padding: '6px 16px', fontFamily: MONT, fontWeight: 800, fontSize: 22}}>Baar-baar back & forth</div>
          </div>
        </Card>
      </>
    ),
  },
  // customer says "Book karna hai" -> free slots appear on WhatsApp
  {
    at: [3, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 60} rows={[[[3, 0], [3, 1], [3, 2]], [[3, 3, 'O', '“BOOK'], [3, 4, 'O'], [3, 5, 'd', 'hai”,']], [[3, 6], [3, 7, 'K'], [3, 8], [3, 9, 'G'], [3, 10, 'G']], [[3, 11, 'K'], [3, 12], [3, 13]]]} />
        <Card t={t} at={W(3, 3) - 0.1} top={CARD + 120} w={880}>
          <Bubble t={t} at={W(3, 3)} time="5:02 PM">Book karna hai</Bubble>
          <div style={{height: 12}} />
          <div style={{background: '#F7F6F2', border: '2px solid #ECEAE3', borderRadius: 22, padding: '14px 16px', opacity: ep(t, W(3, 7) - 0.1, 0.25)}}>
            <Mono>Kal ke free slots</Mono>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 10}}>
              {["10:00 AM", "11:30 AM", "1:00 PM", "4:00 PM", "5:30 PM", "6:30 PM"].map((s, i) => (
                <div key={s} style={{background: '#fff', border: `2px solid ${GREEN}`, color: GREEN, borderRadius: 16, padding: '10px 0', textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 24, opacity: ep(t, W(3, 9) + i * 0.1, 0.2), transform: `scale(${t > W(3, 9) + i * 0.1 ? sp(t, W(3, 9) + i * 0.1, 1.3) : 0.6})`}}>{s}</div>
              ))}
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // customer picks a slot -> auto-added to Google Calendar
  {
    at: [4, 0],
    draw: (t) => {
      const pick = W(4, 2);
      const add = W(4, 9);
      return (
        <>
          <Caption t={t} top={CAP - 110} rows={[[[4, 0], [4, 1, 'O'], [4, 2, 'K'], [4, 3]], [[4, 4], [4, 5, 'O']], [[4, 6, 'G'], [4, 7, 'G'], [4, 8]], [[4, 9, 'K'], [4, 10, 'G', 'ADD!']]]} />
          <Card t={t} at={W(4, 0) - 0.1} top={CARD + 130} w={880}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10}}>
              {["10:00 AM", "11:30 AM", "1:00 PM", "4:00 PM", "5:30 PM", "6:30 PM"].map((s, i) => {
                const on = i === 3 && t > pick;
                return <div key={s} style={{background: on ? GREEN : '#fff', border: `2px solid ${on ? GREEN : '#DCE6DE'}`, color: on ? '#fff' : '#9AA39A', borderRadius: 16, padding: '10px 0', textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 24, transform: `scale(${on ? lerp(1.15, 1, ep(t, pick, 0.3)) : 1})`}}>{on ? '✓ ' + s : s}</div>;
              })}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, background: '#F4F8FF', border: '2px solid #DDE7FB', borderRadius: 20, padding: '14px 18px', opacity: ep(t, W(4, 6) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(4, 6) - 0.1, 0.3)) * 16}px)`}}>
              <Img src={logo('googlecalendar')} style={{width: 46, height: 46}} />
              <div style={{flex: 1}}>
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: BLACK}}>Priya · Facial</div>
                <div style={{fontFamily: MONT, fontWeight: 700, fontSize: 21, color: '#6B6F62'}}>Kal · 4:00 – 5:00 PM</div>
              </div>
              <div style={{background: GREEN, color: '#fff', borderRadius: 14, padding: '6px 14px', fontFamily: MONT, fontWeight: 800, fontSize: 22, transform: `scale(${t > add ? sp(t, add, 1.3) : 0})`}}>Added ✓</div>
            </div>
          </Card>
        </>
      );
    },
  },
  // instant confirmation + reminder one hour before
  {
    at: [5, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 100} rows={[[[5, 0, 'G'], [5, 1, 'O']], [[5, 2], [5, 3], [5, 4], [5, 5]], [[5, 6, 'K'], [5, 7, 'K'], [5, 8]], [[5, 9, 'O']]]} />
        <Card t={t} at={W(5, 0) - 0.1} top={CARD + 140} w={860}>
          <Bubble t={t} at={W(5, 1)} me time="5:03 PM">✅ Booking confirmed! Priya ji, kal 4:00 PM, Facial. Location 📍 bhej raha hoon.</Bubble>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#FFF8E6', border: '2px solid #F3E2B5', borderRadius: 20, padding: '14px 18px', opacity: ep(t, W(5, 9) - 0.2, 0.25), transform: `translateY(${(1 - ep(t, W(5, 9) - 0.2, 0.3)) * 16}px)`}}>
            <Img src={fl('bell')} style={{width: 46, height: 46, transform: `rotate(${Math.sin(t * 14) * 12}deg)`}} />
            <div style={{flex: 1}}>
              <Mono color="#B7791F">Kal · 3:00 PM · Auto reminder</Mono>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 25, color: BLACK}}>1 ghante mein aapka appointment hai 🙂</div>
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // fewer no-shows, time saved
  {
    at: [6, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP + 20} rows={[[[6, 0], [6, 1, 'O'], [6, 2, 'G']], [[6, 3], [6, 4], [6, 5, 'K'], [6, 6, 'G']]]} />
        <Card t={t} at={W(6, 1) - 0.1} top={CARD + 20} w={820}>
          <div style={{display: 'flex', gap: 14}}>
            {[['tearoff_calendar', 'Fewer no-shows', W(6, 1)], ['hourglass_not_done', 'Time bachega', W(6, 5)]].map(([ic, l, a]) => (
              <div key={l as string} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#EAF8EE', border: '2px solid #A6E3A0', borderRadius: 22, padding: '16px 18px', opacity: ep(t, a as number, 0.25), transform: `scale(${t > (a as number) ? lerp(1.08, 1, ep(t, a as number, 0.3)) : 1})`}}>
                <Img src={fl(ic as string)} style={{width: 64, height: 64}} />
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 27, color: BLACK}}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  // tomorrow: Day 4 follow-ups
  {
    at: [7, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[7, 0], [7, 1, 'O'], [7, 2, 'O'], [7, 3]], [[7, 4], [7, 5, 'G'], [7, 6, 'G']], [[7, 7, 'K'], [7, 8]]]} />
        <Card t={t} at={W(7, 1) - 0.1} top={CARD + 20} w={760}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Img src={fl('envelope_with_arrow')} style={{width: 110, height: 110, transform: `translateY(${Math.sin(t * 3) * 6}px)`}} />
            <div style={{flex: 1}}>
              <Mono color={GREEN}>Coming next</Mono>
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, color: BLACK}}>DAY 04</div>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: '#6B6F62'}}>Auto follow-up messages</div>
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // CTA: comment GUIDE
  {
    at: [8, 0],
    draw: (t) => {
      const typeAt = W(8, 8) - 0.25;
      const typed = 'GUIDE'.slice(0, Math.round(clamp01((t - typeAt) / 0.4) * 5));
      return (
        <>
          <Caption t={t} top={CAP - 60} rows={[[[8, 0, 'K'], [8, 1, 'K'], [8, 2], [8, 3, 'O'], [8, 4, 'O']], [[8, 5]], [[8, 6, 'K'], [8, 7], [8, 8, 'G', '‘GUIDE’']]]} />
          <Card t={t} at={W(8, 3) - 0.1} top={CARD + 40} w={860} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 20, padding: '14px 18px'}}>
              <Img src={fl('page_facing_up')} style={{width: 56, height: 56}} />
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 25, color: BLACK, lineHeight: 1.25}}>Day 3 Free Guide: WhatsApp appointment booking setup</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, border: '2px solid #ECEAE3', borderRadius: 40, padding: '10px 12px 10px 20px', marginTop: 14, opacity: ep(t, W(8, 6) - 0.1, 0.25)}}>
              <Img src={logo('instagram')} style={{width: 42, height: 42}} />
              <span style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 30, color: typed ? '#0095F6' : '#A8A6A0'}}>{typed || 'Add a comment…'}</span>
              <div style={{width: 58, height: 58, borderRadius: 29, background: typed.length === 5 ? GREEN : '#0095F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>➤</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16, opacity: ep(t, W(8, 9) - 0.1, 0.25), transform: `scale(${t > W(8, 9) - 0.1 ? sp(t, W(8, 9) - 0.1, 1.2) : 0.8})`}}>
              <div style={{background: OLIVE, color: '#fff', borderRadius: 40, padding: '16px 34px', fontFamily: MONT, fontWeight: 900, fontSize: 28}}>MAIN DM MEIN GUIDE SEND KAR DUNGA</div>
            </div>
          </Card>
        </>
      );
    },
  },
  // save + follow, otherwise Day 2 will be missed
  {
    at: [9, 0],
    draw: (t) => {
      const tap = W(9, 4) + 0.3;
      const done = t > tap;
      return (
        <>
          <Caption t={t} top={CAP - 40} rows={[[[9, 0, 'O'], [9, 1, 'K'], [9, 2]], [[9, 3], [9, 4, 'G'], [9, 5], [9, 6]], [[9, 7], [9, 8, 'K'], [9, 9, 'O', '04']], [[9, 10], [9, 11], [9, 12]]]} />
          <Card t={t} at={W(9, 4) - 0.1} top={CARD + 120} w={780} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
              <Img src={fl('bell')} style={{width: 56, height: 56, transform: `rotate(${Math.sin(t * 14) * 12}deg)`}} />
              <div style={{background: done ? GREEN : OLIVE, color: '#fff', borderRadius: 40, padding: '14px 30px', fontFamily: MONT, fontWeight: 900, fontSize: 28, transform: `scale(${done ? lerp(0.88, 1, sp(t, tap, 1.3)) : 1})`}}>{done ? '✓ FOLLOWING · DAY 04 KAL' : '+ FOLLOW FOR DAY 04'}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 18, padding: '12px 18px', fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK}}>
              <span>📌</span> VIDEO SAVE KARO WARNA DAY 04 MISS HO JAYEGA!
            </div>
          </Card>
        </>
      );
    },
  },
];

// ---- paper background ---------------------------------------------------------------------
const Paper: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#ECEAE5', overflow: 'hidden'}}>
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, transform: `scale(${1.04 + Math.sin(t * 0.2) * 0.01})`}}>
      <filter id="paper" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.005" numOctaves="5" seed="7" result="n" />
        <feDiffuseLighting in="n" lightingColor="#F4F2EE" surfaceScale="2.2" result="l">
          <feDistantLight azimuth="235" elevation="58" />
        </feDiffuseLighting>
      </filter>
      <rect width="1080" height="1920" filter="url(#paper)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.35), transparent 70%)'}} />
    <AbsoluteFill style={{opacity: 0.35, backgroundImage: 'radial-gradient(rgba(60,50,40,0.25) 1px, transparent 1.4px)', backgroundSize: '9px 11px'}} />
  </AbsoluteFill>
);

// ---- film -------------------------------------------------------------------------------
const STARTS = BEATS.map((b, i) => (i === 0 ? 0 : W(b.at[0], b.at[1]) - 0.12));
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let i = 0;
  STARTS.forEach((s, k) => {
    if (t >= s) i = k;
  });
  const next = STARTS[i + 1] ?? DUR + 1;
  const out = 1 - clamp01((t - (next - 0.12)) / 0.12);
  const fade = 1 - clamp01((t - (DUR - 0.3)) / 0.3);
  return (
    <AbsoluteFill>
      <FontsLoad />
      <Paper t={t} />
      <AbsoluteFill style={{opacity: out * fade, transform: `scale(${lerp(1, 0.97, 1 - out)})`}}>{BEATS[i].draw(t)}</AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
