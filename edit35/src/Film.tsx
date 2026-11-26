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
  // title card: "Bhai aaj hai WHATSAPP AUTOMATION seekhne ka DAY 04!"
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
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 104, backgroundImage: `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(0, 8) - 0.05, 0.25), transform: `scale(${t > W(0, 8) ? lerp(1.3, 1, ep(t, W(0, 8), 0.35)) : 1})`, display: 'inline-block'}}>04!</span>
            <Img src={fl('fire')} style={{width: 96, height: 96, transform: `scale(${t > W(0, 8) ? sp(t, W(0, 8), 1.4) : 0})`}} />
          </div>
        </div>
      );
    },
  },
  // today: automate follow-ups
  {
    at: [1, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[1, 0], [1, 1, 'O'], [1, 2, 'K']], [[1, 3], [1, 4, 'G'], [1, 5]]]} />
        <Card t={t} at={W(1, 1) - 0.1} top={CARD} w={760}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
            <Img src={logo('whatsapp')} style={{width: 100, height: 100}} />
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, color: OLIVE2}}>+</div>
            <Img src={fl('repeat_button')} style={{width: 110, height: 110, transform: `rotate(${t * 90}deg)`}} />
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, color: OLIVE2, opacity: ep(t, W(1, 4), 0.25)}}>=</div>
            <Img src={fl('money_bag')} style={{width: 100, height: 100, opacity: ep(t, W(1, 4), 0.25), transform: `scale(${t > W(1, 4) ? sp(t, W(1, 4), 1.4) : 0.4})`}} />
          </div>
        </Card>
      </>
    ),
  },
  // most customers don't buy the first time: they ask price and vanish
  {
    at: [2, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 90} rows={[[[2, 0], [2, 1], [2, 2, 'O']], [[2, 3, 'K'], [2, 4, 'G'], [2, 5, 'G']], [[2, 6], [2, 7, 'K'], [2, 8]], [[2, 9], [2, 10, 'O'], [2, 11], [2, 12]], [[2, 13], [2, 14, 'G', 'GAYAB.']]]} />
        <Card t={t} at={W(2, 10) - 0.2} top={CARD + 180} w={860}>
          <ChatHead name="Rahul (New lead)" sub="last seen 6 days ago" />
          <Bubble t={t} at={W(2, 10)} time="Mon 4:10 PM">Facial package ka price kya hai?</Bubble>
          <div style={{height: 10}} />
          <Bubble t={t} at={W(2, 11)} me time="Mon 4:11 PM">₹1,499 · 60 min. Book kar doon? 🙂</Bubble>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14, opacity: ep(t, W(2, 14), 0.25)}}>
            <Img src={fl('ghost')} style={{width: 54, height: 54, transform: `translateY(${Math.sin(t * 3) * 6}px)`}} />
            <div style={{background: '#FDECEC', color: '#E5484D', borderRadius: 16, padding: '6px 16px', fontFamily: MONT, fontWeight: 800, fontSize: 22}}>No reply · ghosted</div>
          </div>
        </Card>
      </>
    ),
  },
  // you're busy and forget to follow up
  {
    at: [3, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[3, 0], [3, 1], [3, 2, 'O'], [3, 3]], [[3, 4], [3, 5, 'K']], [[3, 6, 'G'], [3, 7], [3, 8]]]} />
        <Card t={t} at={W(3, 2) - 0.1} top={CARD} w={780}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {['Rahul · price poocha', 'Neha · details maangi', 'Amit · "sochke batata hoon"', 'Sana · slot poocha'].map((l, i) => (
              <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, background: '#F7F6F2', border: '2px solid #ECEAE3', borderRadius: 18, padding: '12px 16px', opacity: ep(t, W(3, 2) + i * 0.15, 0.2)}}>
                <div style={{width: 14, height: 14, borderRadius: 7, background: '#E5484D'}} />
                <div style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK}}>{l}</div>
                <Mono color="#E5484D" size={15}>{t > W(3, 6) ? 'FORGOT' : 'PENDING'}</Mono>
              </div>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  // system follows up itself: day 1 friendly reminder
  {
    at: [4, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 150} rows={[[[4, 0], [4, 1, 'O'], [4, 2, 'K']], [[4, 3, 'G'], [4, 4]], [[4, 5, 'O'], [4, 6, 'O'], [4, 7]], [[4, 8], [4, 9, 'K']], [[4, 10, 'G']]]} />
        <Card t={t} at={W(4, 5) - 0.1} top={CARD + 180} w={860}>
          <Mono color={GREEN}>Day 1 · auto follow-up</Mono>
          <div style={{height: 10}} />
          <Bubble t={t} at={W(4, 9)} me time="Tue 4:10 PM">Hi Rahul! 🙂 Kal aapne facial ke baare mein poocha tha. Koi sawaal ho toh batayein?</Bubble>
        </Card>
      </>
    ),
  },
  // day 3 reviews + photos, day 7 small offer
  {
    at: [5, 0],
    draw: (t) => {
      const steps: [string, string, string, number][] = [
        ['Day 1', 'bell', 'Friendly reminder', W(5, 0) - 0.3],
        ['Day 3', 'star', 'Reviews + photos', W(5, 3)],
        ['Day 7', 'label', 'Chhota sa offer', W(5, 10)],
      ];
      return (
        <>
          <Caption t={t} top={CAP - 150} rows={[[[5, 0, 'O'], [5, 1, 'O'], [5, 2]], [[5, 3], [5, 4, 'G']], [[5, 5], [5, 6, 'G']], [[5, 7, 'O'], [5, 8, 'O'], [5, 9]], [[5, 10], [5, 11], [5, 12], [5, 13, 'K']]]} />
          <Card t={t} at={W(5, 0) - 0.1} top={CARD + 190} w={920} pad={22}>
            <div style={{display: 'flex', gap: 10}}>
              {steps.map(([d, ic, l, a], i) => (
                <React.Fragment key={d}>
                  {i > 0 && <div style={{alignSelf: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 40, color: OLIVE2, opacity: ep(t, a, 0.2)}}>→</div>}
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: i === 2 ? '#EAF8EE' : '#F7F6F2', border: `2px solid ${i === 2 ? '#A6E3A0' : '#ECEAE3'}`, borderRadius: 22, padding: '16px 8px', opacity: ep(t, a, 0.25), transform: `scale(${t > a ? lerp(1.1, 1, ep(t, a, 0.3)) : 1})`}}>
                    <Mono color={GREEN} size={16}>{d}</Mono>
                    <Img src={fl(ic)} style={{width: 66, height: 66}} />
                    <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK, textAlign: 'center'}}>{l}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </>
      );
    },
  },
  // follow-up stops as soon as the customer replies
  {
    at: [6, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 40} rows={[[[6, 0], [6, 1], [6, 2], [6, 3]], [[6, 4, 'G'], [6, 5]], [[6, 6, 'O'], [6, 7, 'K'], [6, 8], [6, 9]]]} />
        <Card t={t} at={W(6, 3) - 0.1} top={CARD + 40} w={860}>
          <Bubble t={t} at={W(6, 4)} time="Thu 7:30 PM">Haan, Saturday ke liye book kar do!</Bubble>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, background: '#EAF8EE', border: '2px solid #A6E3A0', borderRadius: 18, padding: '12px 16px', opacity: ep(t, W(6, 7), 0.25), transform: `translateY(${(1 - ep(t, W(6, 7), 0.3)) * 14}px)`}}>
            <Img src={fl('check_mark_button')} style={{width: 40, height: 40}} />
            <div style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK}}>Customer replied · follow-ups stopped</div>
          </div>
        </Card>
      </>
    ),
  },
  // no lead goes cold
  {
    at: [7, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP + 20} rows={[[[7, 0], [7, 1, 'O'], [7, 2, 'O']], [[7, 3, 'K'], [7, 4, 'K'], [7, 5, 'G']]]} />
        <Card t={t} at={W(7, 2) - 0.1} top={CARD + 20} w={780}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
            <Img src={fl('fire')} style={{width: 90, height: 90, transform: `scale(${1 + Math.sin(t * 6) * 0.05})`}} />
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, color: BLACK}}>Every lead stays warm</div>
          </div>
        </Card>
      </>
    ),
  },
  // tomorrow: Day 5 broadcast offers
  {
    at: [8, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[8, 0], [8, 1, 'O'], [8, 2, 'O'], [8, 3]], [[8, 4], [8, 5, 'G'], [8, 6, 'G']], [[8, 7], [8, 8, 'K']]]} />
        <Card t={t} at={W(8, 1) - 0.1} top={CARD + 20} w={760}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Img src={fl('megaphone')} style={{width: 110, height: 110, transform: `translateY(${Math.sin(t * 3) * 6}px)`}} />
            <div style={{flex: 1}}>
              <Mono color={GREEN}>Coming next</Mono>
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, color: BLACK}}>DAY 05</div>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: '#6B6F62'}}>Broadcast offers on WhatsApp</div>
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // CTA: comment GUIDE
  {
    at: [9, 0],
    draw: (t) => {
      const typeAt = W(9, 8) - 0.25;
      const typed = 'GUIDE'.slice(0, Math.round(clamp01((t - typeAt) / 0.4) * 5));
      return (
        <>
          <Caption t={t} top={CAP - 60} rows={[[[9, 0, 'K'], [9, 1, 'K'], [9, 2], [9, 3, 'O'], [9, 4, 'O']], [[9, 5]], [[9, 6, 'K'], [9, 7], [9, 8, 'G', '‘GUIDE’']]]} />
          <Card t={t} at={W(9, 3) - 0.1} top={CARD + 40} w={860} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 20, padding: '14px 18px'}}>
              <Img src={fl('page_facing_up')} style={{width: 56, height: 56}} />
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 25, color: BLACK, lineHeight: 1.25}}>Day 4 Free Guide: Auto follow-up sequence setup</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, border: '2px solid #ECEAE3', borderRadius: 40, padding: '10px 12px 10px 20px', marginTop: 14, opacity: ep(t, W(9, 6) - 0.1, 0.25)}}>
              <Img src={logo('instagram')} style={{width: 42, height: 42}} />
              <span style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 30, color: typed ? '#0095F6' : '#A8A6A0'}}>{typed || 'Add a comment…'}</span>
              <div style={{width: 58, height: 58, borderRadius: 29, background: typed.length === 5 ? GREEN : '#0095F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>➤</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16, opacity: ep(t, W(9, 9) - 0.1, 0.25), transform: `scale(${t > W(9, 9) - 0.1 ? sp(t, W(9, 9) - 0.1, 1.2) : 0.8})`}}>
              <div style={{background: OLIVE, color: '#fff', borderRadius: 40, padding: '16px 34px', fontFamily: MONT, fontWeight: 900, fontSize: 28}}>MAIN DM MEIN GUIDE SEND KAR DUNGA</div>
            </div>
          </Card>
        </>
      );
    },
  },
  // save + follow, otherwise Day 2 will be missed
  {
    at: [10, 0],
    draw: (t) => {
      const tap = W(10, 4) + 0.3;
      const done = t > tap;
      return (
        <>
          <Caption t={t} top={CAP - 40} rows={[[[10, 0, 'O'], [10, 1, 'K'], [10, 2]], [[10, 3], [10, 4, 'G'], [10, 5], [10, 6]], [[10, 7], [10, 8, 'K'], [10, 9, 'O', '05']], [[10, 10], [10, 11], [10, 12]]]} />
          <Card t={t} at={W(10, 4) - 0.1} top={CARD + 120} w={780} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
              <Img src={fl('bell')} style={{width: 56, height: 56, transform: `rotate(${Math.sin(t * 14) * 12}deg)`}} />
              <div style={{background: done ? GREEN : OLIVE, color: '#fff', borderRadius: 40, padding: '14px 30px', fontFamily: MONT, fontWeight: 900, fontSize: 28, transform: `scale(${done ? lerp(0.88, 1, sp(t, tap, 1.3)) : 1})`}}>{done ? '✓ FOLLOWING · DAY 05 KAL' : '+ FOLLOW FOR DAY 05'}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 18, padding: '12px 18px', fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK}}>
              <span>📌</span> VIDEO SAVE KARO WARNA DAY 05 MISS HO JAYEGA!
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
