import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';
import edit from './edit.json';

// "AI SEO team", first half. Edited in the language of the reference reel: calm frame, the top of the frame kept for
// kinetic type (one bold keyword with small italic words around it, appearing as they are spoken) and soft
// off-white UI cards that morph from one idea to the next. The patterned wall is softened like a shallow-focus lens
// (scripts/process.py); he, his hands and the desk stay sharp. Every cut lands on a sentence and changes the framing.
const FPS = edit.fps;
const SANS = 'Geist, sans-serif';
const MONO = '"Geist Mono", monospace';
const INK = '#141414';
const SOFT = '#F5F4F1';
const MUTED = '#8C8A86';
const RED = '#E5484D';
const GREEN = '#1FA45B';
const CARD_SHADOW = '0 22px 50px rgba(40,30,20,0.16), 0 2px 6px rgba(40,30,20,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';

let loaded = false;
if (!loaded && typeof document !== 'undefined') {
  loaded = true;
  const h = delayRender('fonts');
  const faces = [
    new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'}),
    new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.ttf')})`, {weight: '100 900'}),
  ];
  Promise.all(faces.map((f) => ((document.fonts as unknown as {add: (f: FontFace) => void}).add(f), f.load())))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const W = (i: number) => WORDS[i].s;
const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const sp = (t: number, at: number, stiffness = 170, damping = 18) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 0.9}}));
const m1 = (v: number) => Math.min(1, Math.max(0, v));
const vis = (t: number, a: number, b: number, fin = 0.35, fout = 0.25) => pt(t, a, a + fin, smooth) * (1 - pt(t, b - fout, b, Easing.in(Easing.cubic)));

// ---------------------------------------------------------------- framing: every take alternates wide / close, cut on the sentence
const TAKES = [0, ...(edit.cuts as number[])];
const ZOOM = [1.0, 1.08, 1.0, 1.08, 1.0, 1.07];
const zoomAt = (t: number) => {
  let k = 0;
  TAKES.forEach((c, i) => (t >= c - 0.02 ? (k = i) : 0));
  // a slow drift inside each take so a held frame never looks frozen
  const a = TAKES[k], b = TAKES[k + 1] ?? edit.duration;
  return ZOOM[k] * lerp(1, 1.015, inOut(m1((t - a) / (b - a))));
};

// ---------------------------------------------------------------- kinetic type: one bold keyword, small italic words around it
const KEY = ['google', 'website', 'page', 'first', 'show', 'solve', 'behtareen', 'agencies', 'ranking', 'hazaaron', 'month', 'charge', 'khud', 'aipowered', 'seo', 'team', 'auditor', 'identify', 'problem', 'analyst', 'pages', 'close', 'rank', 'researcher', 'discover', 'search', 'customers', 'editor', 'check', 'accurate', 'fake', 'claims', 'agents', 'strategy', 'milkar', 'business', 'information', 'content', 'remove', 'kaam', 'tareeka', 'agencies', 'month', 'rupaye'];
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
type Group = {words: Word[]; key: number; s: number; e: number};
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  let cur: Word[] = [];
  // the big word: a listed keyword if the group has one, else the longest word that is not a filler word
  const STOP = new Set(['kya', 'aapki', 'aapke', 'aap', 'apni', 'khud', 'ki', 'ke', 'ka', 'ko', 'par', 'pe', 'mein', 'hai', 'hain', 'karta', 'karte', 'karti', 'karne', 'kar', 'rahe', 'rahi', 'aa', 'se', 'toh', 'taaki', 'sake', 'nahi', 'ho', 'jo', 'un', 'ek', 'ye', 'aur', 'lekin', 'dekho', 'ise', 'liye', 'har', 'bana', 'sako', 'actually', 'saare']);
  const flush = () => {
    if (!cur.length) return;
    let key = -1;
    cur.forEach((w, i) => {
      const n = norm(w.w);
      if (KEY.includes(n) && (key < 0 || n.length > norm(cur[key].w).length)) key = i;
    });
    if (key < 0) {
      cur.forEach((w, i) => {
        const n = norm(w.w);
        if (!STOP.has(n) && (key < 0 || n.length > norm(cur[key].w).length)) key = i;
      });
    }
    // a group of only filler words ("karta hai.") joins the phrase before it instead of getting its own big word
    if (key < 0 && out.length && cur[0].s - out[out.length - 1].words[out[out.length - 1].words.length - 1].e < 0.3) {
      out[out.length - 1].words.push(...cur);
      cur = [];
      return;
    }
    if (key < 0) key = cur.reduce((b, w, i) => (norm(w.w).length > norm(cur[b].w).length ? i : b), 0);
    out.push({words: cur, key, s: cur[0].s, e: 0});
    cur = [];
  };
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    const long = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (/[.,?!]$/.test(w.w) || cur.length >= 4 || long > 24 || !nx || nx.s - w.e > 0.3 || TAKES.some((c) => nx && c > w.s && c <= nx.s + 0.02)) flush();
  });
  out.forEach((g, i) => (g.e = Math.min(out[i + 1]?.s ?? edit.duration, g.words[g.words.length - 1].e + 0.45)));
  return out;
})();
const Kinetic: React.FC<{t: number}> = ({t}) => {
  const g = GROUPS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!g) return null;
  const before = g.words.slice(0, g.key), keyW = g.words[g.key], after = g.words.slice(g.key + 1);
  const small = (ws: Word[], align: 'flex-start' | 'flex-end') => (
    <div style={{display: 'flex', gap: 10, justifyContent: align, minHeight: 44}}>
      {ws.map((w, i) => {
        const p = pt(t, w.s - 0.05, w.s + 0.18, smooth);
        return (
          <span key={i} style={{fontFamily: SANS, fontStyle: 'italic', fontWeight: 400, fontSize: 38, color: '#3B3936', opacity: p, transform: `translateY(${(1 - p) * 10}px)`, filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined}}>
            {w.w.replace(/[“”"]/g, '')}
          </span>
        );
      })}
    </div>
  );
  const kp = pt(t, keyW.s - 0.06, keyW.s + 0.22, smooth);
  const out = pt(t, g.e - 0.15, g.e, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: 1 - out}}>
      <div style={{display: 'inline-flex', flexDirection: 'column'}}>
        {small(before, 'flex-start')}
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: '-0.045em', lineHeight: 0.95, color: INK, opacity: kp, transform: `translateY(${(1 - kp) * 18}px) scale(${lerp(0.94, 1, kp)})`, filter: kp < 1 ? `blur(${(1 - kp) * 8}px)` : undefined, textShadow: '0 2px 20px rgba(255,255,255,0.35)'}}>
          {keyW.w.replace(/[.,?!“”"]/g, '')}
        </div>
        {small(after, 'flex-end')}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- shared card
const Card: React.FC<{t: number; a: number; b: number; top: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, a, b, top, w, h, children, style}) => {
  if (t < a - 0.01 || t > b) return null;
  const p = sp(t, a, 150, 18);
  const out = pt(t, b - 0.28, b, Easing.in(Easing.cubic));
  return (
    <div style={{position: 'absolute', left: (1080 - w) / 2, top, width: w, height: h, borderRadius: 34, background: SOFT, boxShadow: CARD_SHADOW, overflow: 'hidden', opacity: m1(p * 1.4) * (1 - out), transform: `translateY(${(1 - m1(p)) * 30 - out * 20}px) scale(${lerp(0.94, 1, m1(p)) - out * 0.04})`, filter: out > 0 ? `blur(${out * 6}px)` : undefined, ...style}}>
      {children}
    </div>
  );
};
const Lbl: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <span style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, ...style}}>{children}</span>
);
const Bar: React.FC<{w: number | string; o?: number}> = ({w, o = 1}) => <div style={{height: 14, width: w, borderRadius: 8, background: '#DEDBD5', opacity: o}} />;

// ---------------------------------------------------------------- 1. hook: stuck far from page 1
const Search: React.FC<{t: number}> = ({t}) => {
  const a = 0.05, b = TAKES[1];
  const pages = [1, 2, 3, 4, 5, 6, 7];
  const go = pt(t, W(8) - 0.1, W(10) + 0.2, inOut); // "show nahi karti": the highlight runs away to page 7
  const hp = lerp(0, 6, go);
  const fix = pt(t, W(14) - 0.05, W(14) + 0.3, smooth); // "solve"
  return (
    <Card t={t} a={a} b={b} top={240} w={820} h={290}>
      <div style={{position: 'absolute', left: 30, right: 30, top: 28, height: 70, borderRadius: 40, background: '#fff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px'}}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.2} strokeLinecap="round">
          <circle cx={10.5} cy={10.5} r={6.5} />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <span style={{fontFamily: SANS, fontSize: 32, color: INK}}>{'your service near me'.slice(0, Math.max(0, Math.floor((t - 0.2) / 0.05)))}</span>
      </div>
      <div style={{position: 'absolute', left: 40, top: 122, display: 'flex', flexDirection: 'column', gap: 12}}>
        <Bar w={520} />
        <Bar w={430} o={0.7} />
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, bottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        {pages.map((n, i) => {
          const on = Math.abs(hp - i) < 0.5;
          return (
            <div key={n} style={{width: 88, height: 64, borderRadius: 20, background: on ? INK : '#E9E7E2', color: on ? '#fff' : MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, position: 'relative'}}>
              {n}
              {i === 6 && go > 0.95 && (
                <div style={{position: 'absolute', top: -46, whiteSpace: 'nowrap', fontFamily: SANS, fontSize: 22, fontWeight: 600, color: RED, opacity: pt(t, W(10), W(10) + 0.25)}}>your site</div>
              )}
              {i === 0 && fix > 0 && <div style={{position: 'absolute', inset: -6, borderRadius: 24, border: `3px solid ${GREEN}`, opacity: fix, transform: `scale(${lerp(1.3, 1, fix)})`}} />}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- 2. agencies: the bill that comes back every month
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
const Bill: React.FC<{t: number}> = ({t}) => {
  const a = TAKES[1] + 0.02, b = TAKES[2];
  return (
    <Card t={t} a={a} b={b} top={230} w={700} h={310}>
      <div style={{position: 'absolute', left: 34, top: 26, right: 34, display: 'flex', justifyContent: 'space-between'}}>
        <Lbl>SEO agency</Lbl>
        <Lbl>monthly retainer</Lbl>
      </div>
      <div style={{position: 'absolute', left: 34, right: 34, top: 70}}>
        {MONTHS.map((m, i) => {
          const at = W(21) + i * 0.32;
          const p = pt(t, at, at + 0.25, smooth);
          return (
            <div key={m} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, opacity: p, transform: `translateX(${(1 - p) * 30}px)`, borderBottom: '1px solid #E4E1DB'}}>
              <span style={{fontFamily: SANS, fontSize: 28, color: INK}}>{m}</span>
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: INK}}>₹ ••,•••</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 30, bottom: 20, padding: '8px 18px', borderRadius: 999, background: INK, color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 24, opacity: pt(t, W(31) - 0.05, W(31) + 0.2), transform: `scale(${lerp(0.8, 1, pt(t, W(31) - 0.05, W(31) + 0.25, smooth))})`}}>
        every month
      </div>
    </Card>
  );
};

// ---------------------------------------------------------------- 3. your own AI-powered SEO team: a dot that grows into pills
const Morph: React.FC<{t: number}> = ({t}) => {
  const a = TAKES[2] + 0.02, b = TAKES[3];
  if (t < a || t > b) return null;
  const out = pt(t, b - 0.25, b);
  const dot = sp(t, a + 0.1, 200, 15);
  const p1 = pt(t, W(39) - 0.05, W(39) + 0.4, smooth); // "apni"
  const p2 = pt(t, W(42) - 0.05, W(42) + 0.4, smooth); // "AI-powered"
  const p3 = pt(t, W(43) - 0.05, W(43) + 0.4, smooth); // "SEO team"
  const pill = (label: string, p: number, dark = false): React.ReactNode => (
    <div style={{height: 92, borderRadius: 92, background: dark ? INK : SOFT, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${lerp(0, 40, p)}px`, width: lerp(92, label.length * 20 + 80, p), overflow: 'hidden', opacity: m1(p * 3), whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: dark ? '#fff' : INK, opacity: p}}>{label}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: 1 - out}}>
      <div style={{width: 92, height: 92, borderRadius: 92, background: INK, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${dot})`}}>
        <svg width={44} height={44} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" />
        </svg>
      </div>
      {p1 > 0 && pill('Your own', p1)}
      {p2 > 0 && pill('AI-powered', p2)}
      {p3 > 0 && pill('SEO team', p3, true)}
    </div>
  );
};

// ---------------------------------------------------------------- 4. the four agents: progress row + a focus card with a small live demo
const AGENTS: {i: number; name: string; job: string}[] = [
  {i: 48, name: 'Auditor', job: 'finds what hurts your ranking'},
  {i: 64, name: 'Analyst', job: 'pages close to page 1'},
  {i: 83, name: 'Researcher', job: 'what customers search'},
  {i: 97, name: 'Editor', job: 'accurate, no fake claims'},
];
const AG_A = TAKES[3] + 0.02, AG_B = W(114) - 0.1;
const agentIdx = (t: number) => AGENTS.reduce((k, a, i) => (t >= W(a.i) - 0.5 ? i : k), 0);
const Agents: React.FC<{t: number}> = ({t}) => {
  if (t < AG_A || t > AG_B + 0.3) return null;
  const k = agentIdx(t);
  const ag = AGENTS[k];
  const start = Math.max(AG_A, W(ag.i) - 0.5);
  const next = k + 1 < AGENTS.length ? W(AGENTS[k + 1].i) - 0.5 : AG_B;
  const rowIn = pt(t, AG_A, AG_A + 0.4, smooth);
  const rowOut = pt(t, AG_B - 0.1, AG_B + 0.3, inOut);
  const cardIn = sp(t, start, 160, 17);
  const cardOut = pt(t, next - 0.2, next, Easing.in(Easing.cubic));
  const L = t - start;
  let demo: React.ReactNode = null;
  if (k === 0) {
    const issues = ['Slow pages', 'Broken links', 'Missing titles'];
    const scan = (L * 0.7) % 1;
    demo = (
      <div style={{position: 'relative'}}>
        {issues.map((s, i) => {
          const p = pt(t, W(59) - 1.2 + i * 0.3, W(59) - 0.9 + i * 0.3, smooth); // around "problem"
          return (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, height: 46, opacity: p}}>
              <div style={{width: 14, height: 14, borderRadius: 14, background: RED}} />
              <span style={{fontFamily: SANS, fontSize: 28, color: INK}}>{s}</span>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: -10, right: -10, top: scan * 140, height: 3, background: `linear-gradient(90deg, transparent, ${INK}, transparent)`, opacity: 0.25}} />
      </div>
    );
  } else if (k === 1) {
    const rows: [string, number][] = [['/services', 11], ['/pricing', 12], ['/blog/seo-guide', 14]];
    const lift = pt(t, W(80) - 0.1, W(80) + 0.6, inOut); // "close"
    demo = (
      <div>
        {rows.map(([u, r], i) => (
          <div key={u} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, opacity: pt(t, start + 0.3 + i * 0.2, start + 0.6 + i * 0.2)}}>
            <span style={{fontFamily: MONO, fontSize: 24, color: INK}}>{u}</span>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: lift > 0.5 ? GREEN : INK, fontVariantNumeric: 'tabular-nums'}}>#{Math.round(lerp(r, 10 - i * 3 > 0 ? [8, 6, 9][i] : 5, lift))}</span>
          </div>
        ))}
      </div>
    );
  } else if (k === 2) {
    const qs = ['seo agency near me', 'how to rank on google', 'website not showing on google'];
    const qi = Math.min(qs.length - 1, Math.floor(Math.max(0, L - 0.4) / 1.25));
    const q = qs[qi];
    const typed = q.slice(0, Math.floor(((L - 0.4 - qi * 1.25) / 0.7) * q.length));
    demo = (
      <div>
        <div style={{height: 60, borderRadius: 30, background: '#fff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 12}}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.2} strokeLinecap="round">
            <circle cx={10.5} cy={10.5} r={6.5} />
            <path d="M15.5 15.5L21 21" />
          </svg>
          <span style={{fontFamily: SANS, fontSize: 28, color: INK}}>{typed}</span>
          <span style={{width: 2, height: 30, background: INK, opacity: Math.sin(t * 12) > 0 ? 1 : 0}} />
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap'}}>
          {qs.slice(0, qi).map((x) => (
            <span key={x} style={{padding: '6px 14px', borderRadius: 999, background: '#E9E7E2', fontFamily: SANS, fontSize: 21, color: INK}}>{x}</span>
          ))}
        </div>
      </div>
    );
  } else {
    const ok = pt(t, W(105) - 0.05, W(105) + 0.3, smooth); // "accurate"
    const strike = pt(t, W(109) - 0.05, W(110) + 0.2, inOut); // "fake claims"
    demo = (
      <div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 46}}>
          <Bar w={420} />
          <svg width={30} height={30} viewBox="0 0 24 24" style={{opacity: ok}}>
            <circle cx={12} cy={12} r={11} fill={GREEN} />
            <path d="M7 12.4l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{position: 'relative', display: 'inline-block', height: 46, lineHeight: '46px'}}>
          <span style={{fontFamily: SANS, fontSize: 28, color: strike > 0.5 ? MUTED : INK}}>“#1 ranking guaranteed”</span>
          <div style={{position: 'absolute', left: -4, top: 22, height: 4, borderRadius: 4, width: `${strike * 104}%`, background: RED}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, height: 46}}>
          <Bar w={360} o={0.7} />
        </div>
      </div>
    );
  }
  return (
    <>
      {/* progress row: the agents so far, the current one dark */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', justifyContent: 'center', gap: 12, opacity: rowIn * (1 - rowOut)}}>
        {AGENTS.map((a, i) => {
          const seen = t >= W(a.i) - 0.5;
          const on = i === k;
          return (
            <div key={a.name} style={{height: 54, borderRadius: 54, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10, background: on ? INK : SOFT, boxShadow: CARD_SHADOW, opacity: seen ? 1 : 0.35, transform: `scale(${on ? 1 : 0.94})`}}>
              <span style={{fontFamily: MONO, fontSize: 20, color: on ? '#bbb' : MUTED}}>0{i + 1}</span>
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: on ? '#fff' : INK}}>{seen ? a.name : '•••'}</span>
            </div>
          );
        })}
      </div>
      {/* focus card */}
      {t < AG_B && (
        <div style={{position: 'absolute', left: 150, width: 780, top: 312, height: 230, borderRadius: 32, background: SOFT, boxShadow: CARD_SHADOW, padding: '22px 30px', opacity: m1(cardIn * 1.5) * (1 - cardOut), transform: `translateY(${(1 - m1(cardIn)) * 24}px) scale(${lerp(0.95, 1, m1(cardIn))})`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: INK, letterSpacing: '-0.02em'}}>{ag.name}</span>
            <Lbl>{ag.job}</Lbl>
          </div>
          {demo}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 5. all agents work together on one strategy
const Hub: React.FC<{t: number}> = ({t}) => {
  const a = AG_B, b = edit.duration;
  if (t < a) return null;
  const join = pt(t, W(118) - 0.1, W(118) + 0.6, inOut); // "milkar"
  const core = sp(t, W(120) - 0.1, 180, 14); // "strategy"
  const out = pt(t, b - 0.3, b);
  const cx = 540, cy = 400;
  const spots: [number, number][] = [[-300, -90], [300, -90], [-300, 90], [300, 90]];
  const rowX = [-285, -95, 95, 285];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: (1 - out) * pt(t, a, a + 0.25)}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {spots.map(([x, y], i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + lerp(0, x * 0.62, join)} y2={cy + lerp(0, y * 0.62, join)} stroke={INK} strokeOpacity={0.25 * join} strokeWidth={2} strokeDasharray="4 8" />
        ))}
      </svg>
      {AGENTS.map((ag, i) => {
        const x = lerp(rowX[i], spots[i][0], join), y = lerp(-170, spots[i][1], join);
        return (
          <div key={ag.name} style={{position: 'absolute', left: cx + x - 105, top: cy + y - 27, width: 210, height: 54, borderRadius: 54, background: SOFT, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
            <span style={{fontFamily: MONO, fontSize: 20, color: MUTED}}>0{i + 1}</span>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: INK}}>{ag.name}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 90, top: cy - 90, width: 180, height: 180, borderRadius: 180, background: INK, boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${core})`}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff'}}>Strategy</span>
      </div>
    </div>
  );
};

export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(t);
  const busy = (t >= AG_A && t < edit.duration) || t < TAKES[3];
  void busy;
  return (
    <AbsoluteFill style={{background: '#E6E3DE'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 50%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {/* a soft light veil over the top of the frame so the type always sits on calm, bright space */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(240,238,234,0.55) 0%, rgba(240,238,234,0.35) 28%, transparent 40%)'}} />
      <Search t={t} />
      <Bill t={t} />
      <Morph t={t} />
      <Agents t={t} />
      <Hub t={t} />
      <Kinetic t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
