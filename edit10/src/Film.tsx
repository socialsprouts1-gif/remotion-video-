import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import edit from './edit.json';

// Neura Chat: Akola survey talking head, cut the way a person edits a reel:
// hard punch-in jump cuts, plain bold captions, a few flat stickers and real WhatsApp UI where they help.
// No emoji art, no glows, no particles. The voice is the cleaned, lip-synced track; the clip plays muted.
const C = {
  green: '#25D366',
  yellow: '#FFD23F',
  red: '#E5484D',
  ink: '#111111',
  grey: '#6B7280',
};
const SANS = 'InterV, "Liberation Sans", sans-serif';
const FPS = edit.fps;
const STROKE = ['2px 2px 0 #000', '-2px 2px 0 #000', '2px -2px 0 #000', '-2px -2px 0 #000', '0 3px 0 #000', '0 4px 14px rgba(0,0,0,0.45)'].join(', ');
const CARD_SHADOW = '0 10px 30px rgba(0,0,0,0.25)';

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  const f = new FontFace('InterV', `url(${staticFile('fonts/inter-var.woff2')}) format('woff2')`, {weight: '100 900'});
  (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
  f.load().then(() => continueRender(h)).catch(() => continueRender(h));
};
loadFonts();

type Word = {w: string; s: number; e: number; i: number};
const WORDS = edit.words as Word[];
const CUE = edit.cues as Record<string, number>;
const CW = edit.cueWord as Record<string, number>;
const Q = (k: string) => CUE[k];
const QE = (k: string) => WORDS[CW[k]].e;
const W = (i: number) => WORDS[i].s;
const clean = (w: string) => w.replace(/["“”]/g, '');
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9/]/g, '');

// ---------------------------------------------------------------- camera: jump cuts between a wide and a tight frame
// Each entry starts on a word; the frame changes on that frame, no zoom animation (like cutting between two takes).
const TIGHT = 1.14;
const CUTS: [number, number][] = [
  [0, 1], [13, TIGHT], [24, 1], [32, TIGHT], [39, 1], [57, TIGHT], [69, 1], [78, TIGHT], [84, 1], [94, 1.07], [117, TIGHT],
  [131, 1], [143, TIGHT], [146, 1], [152, TIGHT], [162, 1], [168, TIGHT], [172, 1.22],
];
const zoomAt = (t: number) => {
  let z = 1;
  for (const [i, v] of CUTS) if (t >= W(i) - 0.03) z = v;
  return z;
};

// ---------------------------------------------------------------- small helpers: plain pop in / fade out, no springs
const vis = (t: number, a: number, b: number) => {
  if (t < a || t > b) return null;
  const inP = pt(t, a, a + 0.18, ease.out);
  const outP = pt(t, b - 0.16, b, ease.in);
  return {o: inP * (1 - outP), s: lerp(0.94, 1, inP), y: (1 - inP) * 16};
};

const Sticker: React.FC<{t: number; a: number; b: number; top: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number}> = ({t, a, b, top, children, style, rot = 0}) => {
  const v = vis(t, a, b);
  if (!v) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: v.o, transform: `translateY(${v.y}px) scale(${v.s}) rotate(${rot}deg)`}}>
      <div style={{background: '#fff', borderRadius: 30, boxShadow: CARD_SHADOW, color: C.ink, fontFamily: SANS, ...style}}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------- 1. survey: one stacked bar, segments land on their numbers
const Survey: React.FC<{t: number}> = ({t}) => {
  const a = Q('grid') - 0.1;
  const b = Q('socho') - 0.05;
  const segs = [
    {at: Q('green'), n: 20, color: C.green, label: '2 ghante mein reply', num: '20'},
    {at: Q('yellow'), n: 30, color: C.yellow, label: '1 din mein reply', num: '30'},
    {at: Q('red'), n: 50, color: C.red, label: 'reply hi nahi', num: 'Baaki'},
  ];
  const W_BAR = 820;
  return (
    <Sticker t={t} a={a} b={b} top={1210} style={{width: 900, padding: '30px 40px 26px'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <span style={{fontWeight: 900, fontSize: 64, letterSpacing: '-0.04em'}}>100</span>
        <span style={{fontWeight: 700, fontSize: 34, color: C.grey}}>businesses ko message kiya</span>
      </div>
      <div style={{position: 'relative', height: 34, borderRadius: 10, background: '#EEF0F2', overflow: 'hidden', margin: '16px 0 18px'}}>
        {(() => {
          let x = 0;
          return segs.map((s, k) => {
            const p = pt(t, s.at - 0.05, s.at + 0.35, ease.out);
            const w = (W_BAR * s.n) / 100;
            const el = <div key={k} style={{position: 'absolute', left: x, top: 0, bottom: 0, width: w * p, background: s.color}} />;
            x += w;
            return el;
          });
        })()}
      </div>
      {segs.map((s, k) => {
        const p = pt(t, s.at - 0.05, s.at + 0.2, ease.out);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, height: 52, opacity: t < s.at - 0.05 ? 0 : p, transform: `translateX(${(1 - p) * 20}px)`}}>
            <div style={{width: 16, height: 16, borderRadius: 4, background: s.color}} />
            <span style={{fontWeight: 900, fontSize: 38, width: 120}}>{s.num}</span>
            <span style={{fontWeight: 600, fontSize: 34, color: '#333'}}>{s.label}</span>
          </div>
        );
      })}
    </Sticker>
  );
};

// ---------------------------------------------------------------- 2. the enquiry: a real-looking lock-screen notification
const WAITS = ['1 min', '10 min', '1 ghanta', '3 ghante', '1 din'];
const Notification: React.FC<{t: number}> = ({t}) => {
  const a = Q('enquiry') - 0.1;
  const gone = W(62) - 0.05; // "kisi aur business": the customer moves on, the notification is swiped away
  if (t < a || t > gone + 0.35) return null;
  const inP = pt(t, a, a + 0.35, ease.out);
  const swipe = pt(t, gone, gone + 0.35, ease.in);
  const nr = Q('noreply');
  const wi = Math.min(WAITS.length - 1, Math.max(0, Math.floor((t - nr) / 0.3)));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: lerp(120, 240, inP), opacity: inP * (1 - swipe), transform: `translateX(${-swipe * 700}px)`}}>
      <div style={{borderRadius: 34, background: 'rgba(245,245,247,0.94)', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', padding: '24px 28px', display: 'flex', gap: 22, alignItems: 'center', fontFamily: SANS}}>
        <Img src={staticFile('icons/whatsapp-icon.svg')} style={{width: 78, height: 78, borderRadius: 18}} />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, color: '#555'}}>
            <span style={{fontWeight: 700, color: C.ink, fontSize: 34}}>New customer</span>
            <span>now</span>
          </div>
          <div style={{fontSize: 34, color: '#222', marginTop: 4}}>Hi! Aapki service ka price kya hai?</div>
        </div>
      </div>
      {t >= nr - 0.05 && (
        <div style={{marginTop: 14, display: 'flex', justifyContent: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff', background: C.red, borderRadius: 14, padding: '8px 20px', fontVariantNumeric: 'tabular-nums'}}>
            No reply · {WAITS[wi]}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- 3. Neura Chat name card
const Brand: React.FC<{t: number}> = ({t}) => {
  const a = Q('brand') - 0.05;
  const b = Q('f1') - 0.15;
  const v = vis(t, a, b);
  if (!v) return null;
  const sub = pt(t, Q('sub') - 0.05, Q('sub') + 0.15);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', justifyContent: 'center', opacity: v.o, transform: `translateY(${v.y}px) scale(${v.s})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, background: '#111', borderRadius: 30, padding: '26px 40px 26px 30px', boxShadow: CARD_SHADOW}}>
        <Img src={staticFile('brand/logo-alpha.png')} style={{width: 130, height: 95, objectFit: 'contain'}} />
        <div style={{fontFamily: SANS}}>
          <div style={{fontWeight: 900, fontSize: 84, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1}}>Neura Chat</div>
          <div style={{fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,0.7)', marginTop: 8, opacity: sub}}>WhatsApp automation software</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 4. features: plain checklist, one line per spoken item
const FEATS: [string, string][] = [['f1', '24/7 replies'], ['f2', 'Automated follow-ups'], ['f3', 'Appointment booking'], ['f4', 'Lead qualify'], ['f5', 'Data store']];
const Check: React.FC<{on: number}> = ({on}) => (
  <svg width={44} height={44} viewBox="0 0 24 24" style={{flex: 'none'}}>
    <circle cx={12} cy={12} r={11} fill={C.green} />
    <path d="M6.5 12.4l3.6 3.6 7.4-7.6" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={18} strokeDashoffset={18 * (1 - on)} />
  </svg>
);
const Features: React.FC<{t: number}> = ({t}) => {
  const a = Q('f1') - 0.12;
  const b = Q('busy') - 0.1;
  return (
    <Sticker t={t} a={a} b={b} top={1190} style={{width: 760, padding: '22px 36px'}}>
      {FEATS.map(([k, label]) => {
        const at = Q(k) - 0.06;
        if (t < at) return null;
        const p = pt(t, at, at + 0.15, ease.out);
        return (
          <div key={k} style={{height: 70, display: 'flex', alignItems: 'center', gap: 20, opacity: p}}>
            <Check on={pt(t, at, at + 0.25)} />
            <span style={{fontWeight: 800, fontSize: 44, letterSpacing: '-0.02em'}}>{label}</span>
          </div>
        );
      })}
    </Sticker>
  );
};

// ---------------------------------------------------------------- 5. offer: a yellow sticker, slightly tilted
const Offer: React.FC<{t: number}> = ({t}) => {
  const a = Q('slots') - 0.1;
  const b = Q('late') - 0.4;
  const g = pt(t, Q('gift') - 0.05, Q('gift') + 0.15);
  return (
    <Sticker t={t} a={a} b={b} top={1230} rot={-2.5} style={{background: C.yellow, padding: '24px 44px', textAlign: 'center'}}>
      <div style={{fontWeight: 900, fontSize: 60, letterSpacing: '-0.035em', lineHeight: 1.05}}>Akola ke first 20 businesses</div>
      <div style={{fontWeight: 800, fontSize: 42, marginTop: 8, opacity: g, color: '#3a2e00'}}>Special pricing benefit</div>
    </Sticker>
  );
};

// ---------------------------------------------------------------- 6. CTA: WhatsApp compose bar, "Automation" typed as he says it
const TYPED = 'Automation';
const Compose: React.FC<{t: number}> = ({t}) => {
  const a = Q('compose') - 0.1;
  const b = Q('outro') + 0.6;
  const v = vis(t, a, b);
  if (!v) return null;
  const ty = Q('type');
  const tyE = QE('type');
  const n = Math.max(0, Math.min(TYPED.length, Math.ceil(((t - ty) / Math.max(0.3, tyE - ty)) * TYPED.length)));
  const sent = Q('send2');
  const isSent = t >= sent;
  const bp = pt(t, sent, sent + 0.18, ease.out);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1250, opacity: v.o, transform: `translateY(${v.y}px)`, fontFamily: SANS}}>
      <div style={{height: 110, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 14}}>
        {isSent && (
          <div style={{background: '#D9FDD3', borderRadius: 22, borderTopRightRadius: 6, padding: '14px 22px 8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', opacity: bp, transform: `translateY(${(1 - bp) * 30}px)`}}>
            <div style={{fontSize: 40, color: C.ink, fontWeight: 500}}>Automation</div>
            <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontSize: 22, color: '#667781'}}>
              now
              <svg width={28} height={16} viewBox="0 0 30 18">
                <path d="M2 10 L7 15 L17 4 M12 13 L14 15 L24 4" fill="none" stroke={t > Q('karo') + 0.15 ? '#53BDEB' : '#8696A0'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{flex: 1, height: 92, borderRadius: 46, background: '#fff', boxShadow: CARD_SHADOW, display: 'flex', alignItems: 'center', padding: '0 34px', fontSize: 40, color: n && !isSent ? C.ink : '#8696A0'}}>
          {!isSent && n ? TYPED.slice(0, n) : 'Message'}
          {!isSent && <span style={{width: 3, height: 46, marginLeft: 3, background: '#00A884', opacity: Math.sin(t * 14) > 0 ? 1 : 0}} />}
        </div>
        <div style={{width: 92, height: 92, borderRadius: 92, background: '#00A884', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: CARD_SHADOW, transform: `scale(${isSent ? lerp(0.88, 1, pt(t, sent, sent + 0.15)) : 1})`}}>
          <svg width={42} height={42} viewBox="0 0 24 24">
            <path d="M3 20.5l18-8.5L3 3.5l.1 6.6L15 12 3.1 13.9z" fill="#fff" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- captions: 2-3 words at a time, white with a black edge, key words green
const HOT = new Set(['akola', 'survey', '100', '20', '2', '30', 'whatsapp', 'enquiry', 'neura', 'chat', 'automation', '24/7', 'appointments', 'leads', 'data', 'first', 'special', 'pricing', 'smarter', 'akolas', 'miss', 'late']);
type Line = {words: Word[]; s: number; e: number};
const LINES: Line[] = (() => {
  const out: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  WORDS.forEach((w, i) => {
    cur.push(w);
    chars += w.w.length + 1;
    const nx = WORDS[i + 1];
    if (/[.,?!—]["”]?$/.test(w.w) || chars + (nx ? nx.w.length : 0) > 15 || !nx || nx.s - w.e > 0.25) {
      out.push({words: cur, s: cur[0].s, e: 0});
      cur = [];
      chars = 0;
    }
  });
  out.forEach((c, i) => (c.e = Math.min(out[i + 1]?.s ?? 1e9, c.words[c.words.length - 1].e + 0.35)));
  return out;
})();

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = LINES.find((x) => t >= x.s - 0.03 && t < x.e);
  if (!c) return null;
  const p = pt(t, c.s - 0.03, c.s + 0.07, ease.out);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1050, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 24, transform: `scale(${lerp(0.9, 1, p)})`}}>
      {c.words.map((w, i) => (
        <span key={i} style={{fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: '-0.02em', lineHeight: 1.1, color: HOT.has(key(w.w)) ? C.green : '#fff', textShadow: STROKE}}>
          {clean(w.w)}
        </span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- end card: plain
const EndCard: React.FC<{t: number}> = ({t}) => {
  const a = edit.speech;
  if (t < a) return null;
  const r = t - a;
  const k = pt(r, 0, 0.25);
  return (
    <AbsoluteFill style={{background: '#0E0E0E', opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS}}>
      <Img src={staticFile('brand/logo-alpha.png')} style={{width: 300, height: 219, objectFit: 'contain', opacity: pt(r, 0.05, 0.35)}} />
      <div style={{fontWeight: 900, fontSize: 110, color: '#fff', letterSpacing: '-0.05em', marginTop: 30, opacity: pt(r, 0.15, 0.45)}}>Neura Chat</div>
      <div style={{fontWeight: 600, fontSize: 44, color: 'rgba(255,255,255,0.7)', marginTop: 70, opacity: pt(r, 0.5, 0.8)}}>WhatsApp par message karo</div>
      <div style={{fontWeight: 900, fontSize: 96, color: C.green, letterSpacing: '-0.04em', marginTop: 8, opacity: pt(r, 0.6, 0.9)}}>&ldquo;Automation&rdquo;</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 37%'}}>
        <OffthreadVideo muted src={staticFile('clips/main.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.04)'}} />
      </AbsoluteFill>
      {t < edit.speech && (
        <>
          <Survey t={t} />
          <Notification t={t} />
          <Brand t={t} />
          <Features t={t} />
          <Offer t={t} />
          <Compose t={t} />
          <Captions t={t} />
        </>
      )}
      <EndCard t={t} />
      <Audio src={staticFile('audio/voice.wav')} />
      {withMusic && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
