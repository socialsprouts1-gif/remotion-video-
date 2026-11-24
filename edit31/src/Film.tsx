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
const BEATS: Beat[] = [
  // title card (caption inside the card, like "Bhai aaj hai WHATSAPP AUTOMATION ka DAY 06")
  {
    at: [0, 0],
    draw: (t) => {
      const p = ep(t, 0, 0.45);
      return (
        <div style={{position: 'absolute', left: 70, right: 70, top: 700, background: '#fff', borderRadius: 40, padding: '56px 30px 60px', boxShadow: '0 30px 70px rgba(60,55,40,0.18)', opacity: p, transform: `scale(${lerp(0.9, 1, sp(t, 0, 1.1))})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
          <Caption t={t} top={0} rows={[[[0, 0], [0, 1], [0, 2]]]} scale={1.05} />
          <div style={{height: 70}} />
          <div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: ep(t, W(0, 3) - 0.1, 0.3), transform: `scale(${lerp(0.85, 1, ep(t, W(0, 3) - 0.1, 0.35))})`}}>
            <Img src={logo('whatsapp')} style={{width: 62, height: 62}} />
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 112, letterSpacing: '-0.02em', backgroundImage: `linear-gradient(180deg, ${OLIVE2}, ${OLIVE} 70%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 6px 10px rgba(40,40,20,0.18))'}}>NEURA</span>
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 112, letterSpacing: '-0.02em', color: BLACK, filter: 'drop-shadow(0 6px 10px rgba(40,40,20,0.18))'}}>CHAT</span>
            <Img src={logo('instagram')} style={{width: 62, height: 62}} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ep(t, W(0, 4) - 0.05, 0.3)}}>
            <span style={{fontFamily: MONT, fontWeight: 800, fontSize: 56, color: DARK}}>se</span>
            <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 104, color: OLIVE2}}>!</span>
            <Img src={fl('fire')} style={{width: 110, height: 110, transform: `scale(${sp(t, W(0, 4), 1.4)})`}} />
          </div>
        </div>
      );
    },
  },
  // 24/7 AI sales assistant on WhatsApp + Instagram
  {
    at: [0, 5],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[0, 5], [0, 6, 'G'], [0, 7, 'K']], [[0, 8, 'O'], [0, 9, 'O']], [[0, 10], [0, 11], [0, 12], [0, 13]]]} />
        <Card t={t} at={W(0, 10) - 0.2} top={CARD + 40} w={820}>
          <div style={{display: 'flex', gap: 18}}>
            {[
              ['whatsapp', 'WhatsApp', W(0, 10)],
              ['instagram', 'Instagram DMs', W(0, 12)],
            ].map(([l, n, a]) => (
              <div key={l as string} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 14, background: '#F7F6F2', borderRadius: 22, padding: '18px 20px', border: '2px solid #ECEAE3', opacity: ep(t, (a as number) - 0.1, 0.25)}}>
                <Img src={logo(l as string)} style={{width: 56, height: 56}} />
                <div>
                  <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 28, color: BLACK}}>{n}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Geist Mono", monospace', fontSize: 18, color: GREEN}}>
                    <span style={{width: 10, height: 10, borderRadius: 5, background: GREEN, opacity: 0.5 + 0.5 * Math.sin(t * 6)}} /> ONLINE 24/7
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  // Socho, 2 AM message
  {
    at: [1, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[1, 0], [1, 1, 'O'], [1, 2, 'O'], [1, 3, 'O']], [[1, 4], [1, 5, 'G'], [1, 6]]]} />
        <Card t={t} at={W(1, 4) - 0.2} top={CARD - 40} w={840}>
          <ChatHead name="Neha (New lead)" sub="online · 2:07 AM 🌙" />
          <Bubble t={t} at={W(1, 5)} time="2:07 AM">Hi! Aapki service ka price kya hai?</Bubble>
        </Card>
      </>
    ),
  },
  // reply goes instantly
  {
    at: [1, 7],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[1, 7], [1, 8, 'K'], [1, 9, 'G']], [[1, 10], [1, 11]]]} />
        <Card t={t} at={W(1, 7) - 0.15} top={CARD - 70} w={840}>
          <ChatHead name="Neha (New lead)" sub="online · 2:07 AM 🌙" />
          <Bubble t={t} at={W(1, 7) - 0.2} time="2:07 AM">Hi! Aapki service ka price kya hai?</Bubble>
          <div style={{height: 14}} />
          <Bubble t={t} at={W(1, 9) - 0.1} me time="2:07 AM">Hi Neha! 👋 Main NeuraChat hoon, abhi help karta hoon.</Bubble>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 12, opacity: ep(t, W(1, 10), 0.25)}}>
            <div style={{background: '#EAF8EE', color: GREEN, borderRadius: 16, padding: '6px 16px', fontFamily: MONT, fontWeight: 800, fontSize: 22}}>⚡ Replied in 3 sec</div>
          </div>
        </Card>
      </>
    ),
  },
  // customer bolega: mujhe price chahiye
  {
    at: [2, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[2, 0], [2, 1]], [[2, 2, 'd', '“Mujhe'], [2, 3, 'O'], [2, 4, 'd', 'chahiye.”']]]} />
        <Card t={t} at={W(2, 2) - 0.2} top={CARD - 50} w={840}>
          <ChatHead name="Neha (New lead)" sub="WhatsApp · just now" />
          <Bubble t={t} at={W(2, 3) - 0.1} time="10:41 AM">“Mujhe aapke salon software ka price chahiye.”</Bubble>
        </Card>
      </>
    ),
  },
  // NeuraChat automatically replies with 3 quick questions
  {
    at: [3, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP - 40} rows={[[[3, 0, 'O'], [3, 1, 'K']], [[3, 2], [3, 3], [3, 4]], [[3, 5, 'G'], [3, 6, 'G'], [3, 7, 'G']], [[3, 8]]]} />
        <Card t={t} at={W(3, 1) - 0.1} top={CARD + 60} w={860}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
            <div style={{width: 50, height: 50, borderRadius: 25, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={staticFile('brand/logo-alpha.png')} style={{width: 36, height: 27, objectFit: 'contain'}} />
            </div>
            <div>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: BLACK}}>NeuraChat AI Agent</div>
              <div style={{fontFamily: '"Geist Mono", monospace', fontSize: 17, color: GREEN}}>⚡ Instant auto-reply</div>
            </div>
          </div>
          <div style={{background: '#D3F5C8', border: '2px solid #A6E3A0', borderRadius: 22, padding: '18px 22px', fontFamily: MONT, fontWeight: 700, fontSize: 28, lineHeight: 1.45, color: '#1F2A1C'}}>
            “Hi Neha! Sure 😊 3 quick sawaal:
            {['Aapka salon kis city mein hai?', 'Kitne staff members hain?', 'Aapka budget range kya hai?'].map((q, i) => (
              <div key={q} style={{opacity: ep(t, W(3, 5) + i * 0.25, 0.25), transform: `translateX(${(1 - ep(t, W(3, 5) + i * 0.25, 0.3)) * 20}px)`}}>
                <b>{i + 1}.</b> {q}
              </div>
            ))}
            ”
          </div>
        </Card>
      </>
    ),
  },
  // details saved automatically to Google Sheets
  {
    at: [4, 0],
    draw: (t) => {
      const cells: [string, string, number][] = [
        ['Customer name', 'Neha Verma', W(4, 6)],
        ['WhatsApp number', '+91 98XXX XXX21', W(4, 7)],
        ['Requirement', 'Salon software · Indore', W(4, 9)],
      ];
      return (
        <>
          <Caption t={t} top={CAP - 70} scale={0.92} rows={[[[4, 0], [4, 1, 'O'], [4, 2], [4, 3]], [[4, 4, 'K'], [4, 5]], [[4, 6, 'O'], [4, 7, 'K']], [[4, 8, 'O', '&'], [4, 9, 'O']], [[4, 10, 'G'], [4, 11, 'K', 'SAVE!']]]} />
          <Card t={t} at={W(4, 4) - 0.1} top={CARD + 150} w={960} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
              <Img src={logo('googlesheets')} style={{width: 40, height: 40}} />
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 26, color: '#0F7A44'}}>Leads Database (Live Auto-Sync)</div>
              <div style={{marginLeft: 'auto', background: '#EAF8EE', color: GREEN, borderRadius: 14, padding: '4px 12px', fontFamily: '"Geist Mono", monospace', fontSize: 16}}>● AUTO-APPENDING</div>
            </div>
            <div style={{display: 'flex', gap: 12}}>
              {cells.map(([h, v, a]) => (
                <div key={h} style={{flex: 1, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 18, padding: '12px 14px', opacity: ep(t, a - 0.05, 0.25), transform: `scale(${t > a ? lerp(1.08, 1, ep(t, a, 0.3)) : 1})`}}>
                  <Mono size={14}>{h}</Mono>
                  <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 24, color: BLACK, marginTop: 4}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      );
    },
  },
  // hot lead -> notification + call booked
  {
    at: [5, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP} rows={[[[5, 0, 'G'], [5, 1, 'G']], [[5, 2], [5, 3], [5, 4, 'K']], [[5, 5], [5, 6, 'O'], [5, 7, 'O'], [5, 8, 'O']]]} />
        <Card t={t} at={W(5, 2) - 0.1} top={CARD + 20} w={860} pad={22}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <Img src={fl('fire')} style={{width: 64, height: 64}} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 28, color: BLACK}}>Hot lead: Neha Verma</div>
              <div style={{fontFamily: MONT, fontWeight: 700, fontSize: 22, color: '#6B6F62'}}>Salon software · Budget confirmed</div>
            </div>
            <div style={{fontFamily: '"Geist Mono", monospace', fontSize: 18, color: '#7B8070'}}>now</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, background: '#F4F8FF', border: '2px solid #DDE7FB', borderRadius: 20, padding: '14px 18px', opacity: ep(t, W(5, 6) - 0.1, 0.25), transform: `translateY(${(1 - ep(t, W(5, 6) - 0.1, 0.3)) * 16}px)`}}>
            <Img src={logo('googlecalendar')} style={{width: 44, height: 44}} />
            <div style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 26, color: BLACK}}>Call booked · Kal 11:00 AM</div>
            <div style={{background: GREEN, color: '#fff', borderRadius: 14, padding: '6px 14px', fontFamily: MONT, fontWeight: 800, fontSize: 22, transform: `scale(${t > W(5, 8) ? sp(t, W(5, 8), 1.3) : 0})`}}>Booked ✓</div>
          </div>
        </Card>
      </>
    ),
  },
  // not a single lead missed
  {
    at: [6, 0],
    draw: (t) => (
      <>
        <Caption t={t} top={CAP + 40} rows={[[[6, 0], [6, 1, 'O'], [6, 2, 'O'], [6, 3, 'O']], [[6, 4, 'K'], [6, 5, 'K'], [6, 6, 'G']]]} />
        <Card t={t} at={W(6, 1) - 0.1} top={CARD} w={820}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {['Replied', 'Qualified', 'Saved', 'Followed up'].map((s, i) => (
              <div key={s} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: ep(t, W(6, 2) + i * 0.15, 0.25)}}>
                <div style={{width: 76, height: 76, borderRadius: 38, background: GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, transform: `scale(${t > W(6, 2) + i * 0.15 ? sp(t, W(6, 2) + i * 0.15, 1.4) : 0.4})`}}>✓</div>
                <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK}}>{s}</div>
              </div>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  // CTA: comment DEMO
  {
    at: [7, 0],
    draw: (t) => {
      const typeAt = W(7, 6) - 0.2;
      const typed = 'DEMO'.slice(0, Math.round(clamp01((t - typeAt) / 0.35) * 4));
      return (
        <>
          <Caption t={t} top={CAP - 20} rows={[[[7, 0, 'O'], [7, 1], [7, 2, 'G'], [7, 3]], [[7, 4, 'K'], [7, 5]], [[7, 6, 'G', '‘DEMO’']]]} />
          <Card t={t} at={W(7, 4) - 0.1} top={CARD + 60} w={840} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, border: '2px solid #ECEAE3', borderRadius: 40, padding: '12px 14px 12px 22px'}}>
              <Img src={logo('instagram')} style={{width: 46, height: 46}} />
              <span style={{flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 32, color: typed ? '#0095F6' : '#A8A6A0'}}>{typed || 'Add a comment…'}</span>
              <div style={{width: 64, height: 64, borderRadius: 32, background: typed.length === 4 ? GREEN : '#0095F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>➤</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 18, opacity: ep(t, W(7, 7) - 0.1, 0.25), transform: `scale(${t > W(7, 7) - 0.1 ? sp(t, W(7, 7) - 0.1, 1.2) : 0.8})`}}>
              <div style={{background: OLIVE, color: '#fff', borderRadius: 40, padding: '16px 34px', fontFamily: MONT, fontWeight: 900, fontSize: 28, letterSpacing: '0.02em'}}>MAIN DM MEIN DEMO SEND KAR DUNGA</div>
            </div>
          </Card>
        </>
      );
    },
  },
  // save, share, follow
  {
    at: [8, 0],
    draw: (t) => {
      const tap = W(8, 8) + 0.2;
      const done = t > tap;
      return (
        <>
          <Caption t={t} top={CAP - 40} rows={[[[8, 0, 'O'], [8, 1, 'K'], [8, 2], [8, 3], [8, 4]], [[8, 5], [8, 6, 'G'], [8, 7]], [[8, 8, 'O', 'NEURAXINE!']]]} />
          <Card t={t} at={W(8, 5) - 0.1} top={CARD + 10} w={760} pad={24}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
              <Img src={fl('bell')} style={{width: 56, height: 56, transform: `rotate(${Math.sin(t * 14) * 12}deg)`}} />
              <div style={{background: done ? GREEN : OLIVE, color: '#fff', borderRadius: 40, padding: '14px 30px', fontFamily: MONT, fontWeight: 900, fontSize: 28, transform: `scale(${done ? lerp(0.88, 1, sp(t, tap, 1.3)) : 1})`}}>{done ? '✓ FOLLOWING NEURAXINE' : '+ FOLLOW NEURAXINE'}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#FBF7F1', border: '2px solid #EFE7DA', borderRadius: 18, padding: '12px 18px', fontFamily: MONT, fontWeight: 800, fontSize: 22, color: BLACK}}>
              <span>📌</span> VIDEO SAVE & SHARE KARO, KAAM AAYEGA!
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
