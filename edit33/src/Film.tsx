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
  // title card: "Bhai aaj hai WHATSAPP AUTOMATION seekhne ka DAY 02!"
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
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 104, backgroundImage: `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: ep(t, W(0, 8) - 0.05, 0.25), transform: `scale(${t > W(0, 8) ? lerp(1.3, 1, ep(t, W(0, 8), 0.35)) : 1})`, display: 'inline-block'}}>02!</span>
            <Img src={fl('fire')} style={{width: 96, height: 96, transform: `scale(${t > W(0, 8) ? sp(t, W(0, 8), 1.4) : 0})`}} />
          </div>
        </div>
      );
    },
  },
  // yesterday simple auto-reply, today AI makes it smart
  {
    at: [1, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 40} rows={[[[1, 0], [1, 1], [1, 2, 'O']], [[1, 3, 'K'], [1, 4]], [[1, 5], [1, 6], [1, 7, 'G'], [1, 8], [1, 9, 'O']], [[1, 10]]]} />
        <Card t={t} at={W(1, 2) - 0.1} top={CARD + 60} w={860}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{flex: 1, background: '#F7F6F2', border: '2px solid #ECEAE3', borderRadius: 22, padding: '18px 16px', textAlign: 'center'}}>
              <Mono>Day 01 ✓</Mono>
              <Img src={fl('gear')} style={{width: 76, height: 76, marginTop: 8}} />
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK}}>Simple auto-reply</div>
            </div>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 50, color: OLIVE2, opacity: ep(t, W(1, 5), 0.25)}}>→</div>
            <div style={{flex: 1, background: '#EAF8EE', border: '2px solid #A6E3A0', borderRadius: 22, padding: '18px 16px', textAlign: 'center', opacity: ep(t, W(1, 7) - 0.1, 0.25), transform: `scale(${t > W(1, 7) ? lerp(1.1, 1, ep(t, W(1, 7), 0.35)) : 1})`}}>
              <Mono color={GREEN}>Day 02</Mono>
              <Img src={fl('brain')} style={{width: 76, height: 76, marginTop: 8}} />
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK}}>AI smart reply</div>
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // problem: a fixed reply gives the same answer to every question
  {
    at: [2, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 40} rows={[[[2, 0, 'O'], [2, 1], [2, 2]], [[2, 3, 'K'], [2, 4, 'K'], [2, 5], [2, 6], [2, 7]], [[2, 8, 'G'], [2, 9, 'G'], [2, 10, 'G']], [[2, 11], [2, 12]]]} />
        <Card t={t} at={W(2, 3) - 0.1} top={CARD + 120} w={860}>
          <Bubble t={t} at={W(2, 3)} time="6:10 PM">Sunday ko open ho?</Bubble>
          <div style={{height: 12}} />
          <Bubble t={t} at={W(2, 5)} me time="6:10 PM">Namaste! 🙏 Welcome. 1️⃣ Price 2️⃣ Appointment 3️⃣ Team</Bubble>
          <div style={{height: 12}} />
          <Bubble t={t} at={W(2, 9)} time="6:11 PM">Maine timing poochi thi… 😕</Bubble>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 12, opacity: ep(t, W(2, 10), 0.25)}}>
            <div style={{background: '#FDECEC', color: '#E5484D', borderRadius: 16, padding: '6px 16px', fontFamily: MONT, fontWeight: 800, fontSize: 22}}>✕ Har baar same reply</div>
          </div>
        </Card>
      </>
    ),
  },
  // customer asks two things at once
  {
    at: [3, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[3, 0], [3, 1]], [[3, 2, 'O', '“SUNDAY'], [3, 3], [3, 4, 'K'], [3, 5]], [[3, 6], [3, 7, 'G'], [3, 8], [3, 9, 'K'], [3, 10], [3, 11, 'd', 'hai?”']]]} />
        <Card t={t} at={W(3, 2) - 0.1} top={CARD + 40} w={840}>
          <ChatHead name="Priya (Customer)" sub="WhatsApp · just now" />
          <Bubble t={t} at={W(3, 2)} time="6:12 PM">Sunday ko open ho?</Bubble>
          <div style={{height: 12}} />
          <Bubble t={t} at={W(3, 6)} time="6:12 PM">Aur facial ka rate kya hai?</Bubble>
        </Card>
      </>
    ),
  },
  // AI reads your business details and answers both
  {
    at: [4, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 40} rows={[[[4, 0, 'O'], [4, 1], [4, 2, 'K'], [4, 3], [4, 4, 'K']], [[4, 5], [4, 6], [4, 7], [4, 8], [4, 9]], [[4, 10, 'G'], [4, 11, 'G'], [4, 12]]]} />
        <Card t={t} at={W(4, 0) - 0.1} top={CARD + 60} w={880}>
          <div style={{display: 'flex', gap: 10, marginBottom: 14}}>
            {[['alarm_clock', 'Timings ✓', W(4, 4)], ['money_bag', 'Price list ✓', W(4, 5)]].map(([ic, l, a]) => (
              <div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 8, background: '#EAF8EE', borderRadius: 16, padding: '6px 14px', fontFamily: MONT, fontWeight: 800, fontSize: 21, color: GREEN, opacity: ep(t, a as number, 0.25)}}>
                <Img src={fl(ic as string)} style={{width: 30, height: 30}} /> Reading: {l}
              </div>
            ))}
          </div>
          <Bubble t={t} at={W(4, 9) - 0.2} me time="6:12 PM">
            Ji haan! Sunday 10 AM – 6 PM open hain 🙂 Facial ₹800 se start hota hai. Booking kar doon?
          </Bubble>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 12, opacity: ep(t, W(4, 11), 0.25)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, background: '#EAF8EE', color: GREEN, borderRadius: 16, padding: '6px 16px', fontFamily: MONT, fontWeight: 800, fontSize: 22}}>
              <Img src={fl('brain')} style={{width: 30, height: 30}} /> AI · dono sawaal ka jawab
            </div>
          </div>
        </Card>
      </>
    ),
  },
  // unknown questions go straight to you
  {
    at: [5, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 70} rows={[[[5, 0], [5, 1], [5, 2], [5, 3, 'O'], [5, 4]], [[5, 5, 'K'], [5, 6, 'K']], [[5, 7], [5, 8, 'G'], [5, 9, 'G']], [[5, 10, 'O']]]} />
        <Card t={t} at={W(5, 2) - 0.1} top={CARD + 90} w={860}>
          <Bubble t={t} at={W(5, 2)} time="6:14 PM">Bridal makeup ghar pe karte ho?</Bubble>
          <div style={{height: 12}} />
          <Bubble t={t} at={W(5, 6)} me time="6:14 PM">Main team se confirm karke 5 min mein batata hoon 🙏</Bubble>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, background: '#F4F8FF', border: '2px solid #DDE7FB', borderRadius: 18, padding: '12px 16px', opacity: ep(t, W(5, 9), 0.25), transform: `translateY(${(1 - ep(t, W(5, 9), 0.3)) * 16}px)`}}>
            <Img src={fl('telephone_receiver')} style={{width: 40, height: 40}} />
            <div style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK}}>Forwarded to owner: Priya ka sawaal</div>
            <span style={{fontFamily: '"Geist Mono", monospace', fontSize: 18, color: '#7B8070'}}>now</span>
          </div>
        </Card>
      </>
    ),
  },
  // you only need 3 things
  {
    at: [6, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 90} rows={[[[6, 0], [6, 1], [6, 2], [6, 3, 'O']], [[6, 4, 'K'], [6, 5]], [[6, 6], [6, 7, 'G'], [6, 8, 'G']], [[6, 9, 'K'], [6, 10], [6, 11, 'O']]]} />
        <Card t={t} at={W(6, 3) - 0.1} top={CARD + 110} w={900} pad={22}>
          <div style={{display: 'flex', gap: 12}}>
            {[['money_bag', 'Price list', W(6, 7)], ['alarm_clock', 'Timings', W(6, 9)], ['red_question_mark', 'FAQs', W(6, 11)]].map(([ic, l, a], i) => (
              <div key={l as string} style={{flex: 1, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 22, padding: '18px 10px', textAlign: 'center', opacity: ep(t, (a as number) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, (a as number) - 0.1, 0.3)) * 20}px)`}}>
                <Mono size={15}>0{i + 1}</Mono>
                <Img src={fl(ic as string)} style={{width: 80, height: 80, margin: '6px 0'}} />
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: BLACK}}>{l}</div>
                <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 30, color: GREEN, opacity: ep(t, (a as number) + 0.3, 0.2)}}>✓</div>
              </div>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  // tomorrow: Day 3 appointment booking
  {
    at: [7, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[7, 0], [7, 1, 'O'], [7, 2, 'O'], [7, 3]], [[7, 4], [7, 5, 'G'], [7, 6, 'G']], [[7, 7, 'K'], [7, 8]]]} />
        <Card t={t} at={W(7, 1) - 0.1} top={CARD + 20} w={760}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Img src={fl('spiral_calendar')} style={{width: 110, height: 110, transform: `translateY(${Math.sin(t * 3) * 6}px)`}} />
            <div style={{flex: 1}}>
              <Mono color={GREEN}>Coming next</Mono>
              <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, color: BLACK}}>DAY 03</div>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: '#6B6F62'}}>Appointment booking on autopilot</div>
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
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 25, color: BLACK, lineHeight: 1.25}}>Day 2 Free Guide: AI smart replies setup</div>
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
          <Caption t={t} top={CAP - 40} rows={[[[9, 0, 'O'], [9, 1, 'K'], [9, 2]], [[9, 3], [9, 4, 'G'], [9, 5], [9, 6]], [[9, 7], [9, 8, 'K'], [9, 9, 'O', '03']], [[9, 10], [9, 11], [9, 12]]]} />
          <Card t={t} at={W(9, 4) - 0.1} top={CARD + 120} w={780} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
              <Img src={fl('bell')} style={{width: 56, height: 56, transform: `rotate(${Math.sin(t * 14) * 12}deg)`}} />
              <div style={{background: done ? GREEN : OLIVE, color: '#fff', borderRadius: 40, padding: '14px 30px', fontFamily: MONT, fontWeight: 900, fontSize: 28, transform: `scale(${done ? lerp(0.88, 1, sp(t, tap, 1.3)) : 1})`}}>{done ? '✓ FOLLOWING · DAY 03 KAL' : '+ FOLLOW FOR DAY 03'}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 18, padding: '12px 18px', fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK}}>
              <span>📌</span> VIDEO SAVE KARO WARNA DAY 03 MISS HO JAYEGA!
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
