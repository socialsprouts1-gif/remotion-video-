import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DUR, Fonts, LINE, MONO, SANS, SERIF, W, WE, WORDS, clamp01, ep, eio, lerp, rnd, sp} from './ui';
import {TH, Theme, fl} from './kit';
import {TAB, SCENES, SCENE_LINE as CARD_LINE, THEMES} from './ca';

const SW = CARD_LINE.map((li, i) => (i === 0 ? 0 : LINE[li] - 0.45));
const END_AT = WE(9, 31) + 0.6;
const FLIP = 0.9;

const pageAt = (t: number) => {
  let i = 0;
  SW.forEach((s, k) => {
    if (t >= s) i = k;
  });
  return {i, p: i === 0 ? 1 : clamp01((t - SW[i]) / FLIP)};
};

// ---- story time pill ---------------------------------------------------------
const STAGES: [string, string][] = [
  ['GST notice', 'warning'],
  ['AI reply', 'sparkles'],
  ['Documents', 'clipboard'],
  ['Deadlines', 'alarm_clock'],
  ['Filed', 'check_mark_button'],
  ['Referrals', 'busts_in_silhouette'],
  ['Sach baat', 'light_bulb'],
  ['Done for you', 'handshake'],
];
const storyAt2 = (t: number): {txt: string; img: string} => {
  for (let k = 8; k >= 1; k--) if (t >= SW[k]) return {txt: STAGES[k - 1][0], img: STAGES[k - 1][1]};
  return {txt: 'CA & tax firms', img: 'abacus'};
};
const Header: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  const c = storyAt2(t);
  let changed = 0;
  for (let dt = 0; dt < 0.35; dt += 1 / 30) if (storyAt2(t - dt).txt !== c.txt) changed = 1 - dt / 0.35;
  const pill = theme === 'cream' ? {bg: '#fff', fg: C.ink} : theme === 'green' ? {bg: 'rgba(255,255,255,0.18)', fg: '#fff'} : {bg: 'rgba(255,255,255,0.09)', fg: '#fff'};
  return (
    <div style={{position: 'absolute', top: 236, left: 90, right: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: theme === 'cream' ? '#3A3631' : 'rgba(255,255,255,0.82)'}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: theme === 'green' ? '#fff' : C.green}} />
        @NEURAXINE
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: pill.bg, color: pill.fg, borderRadius: 30, padding: '8px 20px 8px 10px', fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: theme === 'cream' ? '0 6px 16px rgba(0,0,0,0.06)' : 'none'}}>
        <Img src={fl(c.img)} style={{width: 34, height: 34, transform: `scale(${1 + changed * 0.3})`}} />
        <span style={{display: 'inline-block', transform: `translateY(${changed * -12}px)`, opacity: 1 - changed * 0.8}}>{c.txt}</span>
      </div>
    </div>
  );
};

// ---- captions (boxed word, same as earlier edits) ---------------------------
type Chunk = {ws: typeof WORDS; s: number};
const CHUNKS: Chunk[] = [];
WORDS.forEach((w, i) => {
  const prev = WORDS[i - 1];
  const last = CHUNKS[CHUNKS.length - 1];
  if (!last || !prev || prev.line !== w.line || /[,.?!]$/.test(prev.w) || last.ws.length >= 3) CHUNKS.push({ws: [w], s: w.s});
  else last.ws.push(w);
});
const KEY = /^"?(whatsapp|instagram|dm|ai|ca|firm|marketing|automation|deadline|posts|client|tension-free|filing|bharosa|gst|notice|google|reviews|photo|call|documents|checklist|office|reminder|tds|itr|acknowledgement|tax|saving|refer|bharose|referrals|details|guide|follow|neuraxine|comment)"?[,.?!:]*$/i;
const Captions: React.FC<{t: number; theme: Theme}> = ({t, theme}) => {
  if (t > END_AT - 0.2) return null;
  let ci = -1;
  CHUNKS.forEach((c, i) => {
    if (t >= c.s - 0.05) ci = i;
  });
  if (ci < 0) return null;
  const c = CHUNKS[ci];
  const pop = sp(t, c.s - 0.05, 1.3);
  const col = theme === 'cream' ? C.ink : '#fff';
  const chars = c.ws.reduce((n, w) => n + w.w.length, 0) + c.ws.length;
  const fs = Math.min(64, Math.floor((64 * 27) / Math.max(27, chars)));
  return (
    <div style={{position: 'absolute', top: 1500, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: 6, transform: `scale(${lerp(0.88, 1, pop)})`, opacity: ep(t, c.s - 0.05, 0.12)}}>
      {c.ws.map((w, i) => {
        const cur = t >= w.s - 0.03 && (i === c.ws.length - 1 || t < c.ws[i + 1].s - 0.03);
        const past = t >= w.s;
        const key = KEY.test(w.w);
        const box = cur ? (key ? (theme === 'green' ? '#fff' : C.green) : theme === 'dark' ? '#fff' : C.ink) : 'transparent';
        const tc = cur ? (key ? (theme === 'green' ? C.green : '#fff') : theme === 'dark' ? C.ink : '#fff') : col;
        return (
          <span key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: fs, letterSpacing: '-0.03em', padding: '2px 14px 6px', borderRadius: 12, background: box, color: tc, opacity: past || cur ? 1 : 0.3, transform: `scale(${cur ? lerp(0.9, 1, sp(t, w.s - 0.03, 1.6)) : 1})`, boxShadow: cur ? '0 10px 24px rgba(0,0,0,0.18)' : 'none'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ---- pages: ledger paper in cream / black / green -------------------------------------
const BG: Record<Theme, string> = {
  cream: C.cream,
  dark: 'radial-gradient(ellipse 80% 55% at 50% 50%, #2A2622 0%, #171513 55%, #0C0B0A 100%)',
  green: 'radial-gradient(ellipse 75% 55% at 50% 48%, #2BB463 0%, #1E9A51 60%, #17803F 100%)',
};
const Page: React.FC<{theme: Theme; t: number; i: number}> = ({theme, t, i}) => {
  const rule = theme === 'cream' ? 'rgba(15,122,60,0.12)' : 'rgba(255,255,255,0.06)';
  const margin = theme === 'cream' ? 'rgba(229,72,77,0.35)' : 'rgba(255,255,255,0.18)';
  const ink = theme === 'cream' ? 'rgba(15,122,60,0.4)' : 'rgba(255,255,255,0.25)';
  return (
    <AbsoluteFill style={{background: BG[theme], overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${rule} 2px, transparent 2px)`, backgroundSize: '100% 64px', backgroundPosition: '0 26px'}} />
      <div style={{position: 'absolute', left: 58, top: 0, bottom: 0, width: 2, background: margin}} />
      <div style={{position: 'absolute', left: 66, top: 0, bottom: 0, width: 2, background: margin}} />
      {/* perforation along the top, like a tear-off pad */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 18, height: 10, backgroundImage: `radial-gradient(circle, ${ink} 4px, transparent 5px)`, backgroundSize: '28px 10px'}} />
      <div style={{position: 'absolute', right: 70, bottom: 56, fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.2em', color: ink}}>FOLIO {String(i + 1).padStart(2, '0')} · FY 25-26</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = END_AT;
  const p = ep(t, a, 0.7);
  const click = a + 1.4;
  const followed = t > click;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 48%, #2A2622 0%, #171513 55%, #0C0B0A 100%)', clipPath: `circle(${p * 120}% at 50% 60%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${lerp(0.4, 1, sp(t, a + 0.15))}) rotate(${(1 - ep(t, a + 0.15, 0.7)) * -20}deg)`, opacity: ep(t, a + 0.15, 0.3)}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 220, height: 165, objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1, marginTop: 20, opacity: ep(t, a + 0.3, 0.4)}}>
        Neura<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em'}}>xine</span>
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: '#A8A29A', marginTop: 18, opacity: ep(t, a + 0.5, 0.4)}}>
        HAR HAFTE <span style={{color: C.green}}>·</span> EK PRACTICAL STRATEGY
      </div>
      <div style={{position: 'relative', marginTop: 50, opacity: ep(t, a + 0.7, 0.4)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: followed ? C.green : '#fff', color: followed ? '#fff' : C.ink, borderRadius: 50, padding: '18px 36px', fontFamily: SANS, fontWeight: 700, fontSize: 34, transform: `scale(${followed ? lerp(0.9, 1, sp(t, click)) : 1})`}}>
          {followed ? 'Following ✓' : 'Follow +'} <span style={{fontWeight: 500, opacity: 0.8}}>@neuraxine</span>
        </div>
        {t > click - 0.5 && <div style={{position: 'absolute', left: 120, top: 30, width: 60, height: 60, borderRadius: 30, border: '4px solid #fff', transform: `scale(${t > click ? lerp(0.5, 2.2, ep(t, click, 0.6)) : lerp(1.4, 0.6, ep(t, click - 0.5, 0.5))})`, opacity: t > click ? 1 - ep(t, click, 0.6) : 0.9}} />}
      </div>
    </AbsoluteFill>
  );
};

const PageView: React.FC<{i: number; t: number}> = ({i, t}) => {
  const S = SCENES[i];
  const th = THEMES[i];
  const settle = 1 + Math.min(0.03, Math.max(0, t - SW[i]) * 0.004);
  return (
    <AbsoluteFill>
      <Page theme={th} t={t} i={i} />
      <AbsoluteFill style={{transform: `scale(${settle})`, transformOrigin: '50% 55%'}}>
        <S t={t} th={TH[th]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** ledger index tabs under the header: one lights up per stage */
const TABS = ['NOTICE', 'REPLY', 'DOCS', 'DUE', 'FILED', 'REFER'];
const Tabs: React.FC<{t: number; theme: Theme; i: number}> = ({t, theme, i}) => {
  const at0 = SW[1];
  if (t < at0 || t > END_AT) return null;
  const n = TAB[i];
  const ink = theme === 'cream' ? C.ink : '#fff';
  return (
    <div style={{position: 'absolute', left: 150, right: 150, top: 96, display: 'flex', gap: 8, opacity: ep(t, at0, 0.4)}}>
      {TABS.map((l, k) => {
        const on = k + 1 <= n;
        const cur = k + 1 === n;
        const pop = cur ? sp(t, SW[i] + FLIP, 1.3) : 1;
        return (
          <div key={l} style={{flex: 1, height: 74, borderRadius: '16px 16px 6px 6px', background: on ? (theme === 'green' ? '#fff' : C.green) : 'transparent', border: `2px solid ${on ? 'transparent' : ink}`, opacity: on ? 1 : 0.35, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateY(${cur ? (1 - pop) * 20 - 8 : 0}px)`, boxShadow: cur ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'}}>
            <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 15, color: on ? (theme === 'green' ? C.green : '#fff') : ink, letterSpacing: '0.08em'}}>{l}</span>
            <span style={{fontFamily: MONO, fontWeight: 800, fontSize: 18, color: on ? (theme === 'green' ? C.green : '#fff') : ink}}>{on ? '✓' : String(k + 1).padStart(2, '0')}</span>
          </div>
        );
      })}
    </div>
  );
};

/** binder rings shown while a page is being torn off */
const Rings: React.FC = () => (
  <>
    {[180, 400, 680, 900].map((x) => (
      <div key={x} style={{position: 'absolute', left: x - 18, top: -30, width: 36, height: 70, borderRadius: 18, border: '7px solid #C9C4BC', boxShadow: '0 6px 10px rgba(0,0,0,0.4)'}} />
    ))}
  </>
);

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pg = pageAt(t);
  const busy = pg.i > 0 && pg.p < 1;
  const e = busy ? pg.p * pg.p * (3 - 2 * pg.p) : 1;
  const theme = THEMES[busy && e < 0.45 ? pg.i - 1 : pg.i];
  const fade = 1 - clamp01((t - (DUR - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0C0B0A'}}>
      <Fonts />
      <AbsoluteFill style={{opacity: fade}}>
        <PageView i={pg.i} t={t} />
        {busy && (
          <AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '50% 0%'}}>
            <AbsoluteFill style={{transformOrigin: '50% 0%', transform: `rotateX(${-e * 100}deg) rotateZ(${Math.sin(e * Math.PI) * -3}deg)`, boxShadow: `0 ${e * 60}px 90px rgba(0,0,0,${0.55 * Math.sin(e * Math.PI)})`, backfaceVisibility: 'hidden'}}>
              <PageView i={pg.i - 1} t={t} />
              <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,${e * 0.45}))`}} />
            </AbsoluteFill>
            <Rings />
          </AbsoluteFill>
        )}
        <Tabs t={t} theme={theme} i={pg.i} />
        <Header t={t} theme={theme} />
        <Captions t={t} theme={theme} />
        {t > END_AT && <EndCard t={t} />}
      </AbsoluteFill>
      {withMusic ? <Audio src={staticFile('audio/mix.wav')} /> : <Audio src={staticFile('audio/vo.wav')} />}
    </AbsoluteFill>
  );
};
