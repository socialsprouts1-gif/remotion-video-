import React from 'react';
import {AbsoluteFill, continueRender, delayRender, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {ease, pt, rand} from './anim';
import words from './words.json';

// Wedding Diaries promo — a finishing pass on the client's own lightly edited reel (IMG_3891).
// The picture and voice are untouched (lip sync stays exact); every new element is timed to the real spoken words.
// Palette: wine, soft gold, ivory. Type: Instrument Serif (titles), Fraunces (numerals), Instrument Sans (small text).
// The burned-in labels ("Haldi ki Masti"…, "Book Now", the contact note) are covered by new cards at the same place and time;
// the white flash frames become warm gold light leaks. The Wedding Diaries badge (top right) is kept.
const FPS = 30;
export const TOTAL = 1298;

const WINE = '#5A0F24';
const WINE_D = '#2C0611';
const GOLD = '#D2AE68';
const GOLD_L = '#F1DDA8';
const IVORY = '#F7F0E4';
const SERIF = 'InstrumentSerif, serif';
const NUM = 'Fraunces, serif';
const SANS = 'InstrumentSans, sans-serif';

let loaded = false;
if (!loaded && typeof document !== 'undefined') {
  loaded = true;
  const h = delayRender('fonts');
  const fonts = [
    new FontFace('InstrumentSerif', `url(${staticFile('fonts/InstrumentSerif.ttf')})`),
    new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces.ttf')})`, {weight: '100 900'}),
    new FontFace('InstrumentSans', `url(${staticFile('fonts/InstrumentSans.ttf')})`, {weight: '400 700', stretch: '75% 100%'}),
  ];
  fonts.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
  Promise.all(fonts.map((f) => f.load())).then(() => continueRender(h)).catch(() => continueRender(h));
}

type Word = {w: string; s: number; e: number};
const WORDS = words as Word[];
const between = (a: number, b: number) => WORDS.filter((w) => w.s >= a - 0.001 && w.s < b);
const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');

/** 0→1→0 window. */
const win = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => pt(t, a, a + fin) * (1 - pt(t, b - fout, b, ease.in));

// ---------------------------------------------------------------- word-synced text
const Words: React.FC<{
  t: number;
  a: number;
  b: number;
  size: number;
  font?: string;
  color?: string;
  gold?: string[];
  weight?: number;
  spacing?: string;
  upper?: boolean;
  goldColor?: string;
  lead?: number;
}> = ({t, a, b, size, font = SERIF, color = IVORY, gold = [], weight = 400, spacing = '-0.01em', upper = false, goldColor = GOLD_L, lead = 0.06}) => (
  <>
    {between(a, b).map((w, i) => {
      const p = pt(t, w.s - lead, w.s - lead + 0.32, ease.out);
      const g = gold.includes(bare(w.w));
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: size * 0.24,
            fontFamily: font,
            fontSize: size,
            fontWeight: weight,
            letterSpacing: spacing,
            color: g ? goldColor : color,
            opacity: p,
            transform: `translateY(${(1 - p) * size * 0.28}px)`,
            filter: `blur(${(1 - p) * 6}px)`,
            textTransform: upper ? 'uppercase' : 'none',
            textShadow: '0 2px 18px rgba(30,4,12,0.45)',
          }}
        >
          {w.w}
        </span>
      );
    })}
  </>
);

/** Thin gold rule that draws from the left (or centre). */
const Rule: React.FC<{p: number; w: number; center?: boolean; diamond?: boolean}> = ({p, w, center, diamond}) => (
  <div style={{position: 'relative', height: 14, width: w, margin: center ? '0 auto' : undefined}}>
    <div style={{position: 'absolute', top: 6, left: center ? (w * (1 - p)) / 2 : 0, width: w * p, height: 1.6, background: `linear-gradient(90deg, transparent, ${GOLD} 18%, ${GOLD_L} 50%, ${GOLD} 82%, transparent)`}} />
    {diamond && (
      <div style={{position: 'absolute', left: w / 2 - 6, top: 1, width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, background: GOLD_L, boxShadow: `0 0 12px ${GOLD}`}} />
    )}
  </div>
);

/** Soft legibility shade at top or bottom (not a vignette: one edge, only while text is there). */
const Shade: React.FC<{o: number; top?: boolean; h?: number}> = ({o, top, h = 46}) => (
  <AbsoluteFill
    style={{
      opacity: o,
      background: top
        ? `linear-gradient(180deg, rgba(36,6,16,0.62) 0%, rgba(36,6,16,0.32) ${h * 0.55}%, transparent ${h}%)`
        : `linear-gradient(0deg, rgba(36,6,16,0.66) 0%, rgba(36,6,16,0.34) ${h * 0.55}%, transparent ${h}%)`,
    }}
  />
);

// ---------------------------------------------------------------- gold light leak (replaces the white flash frames)
const Leak: React.FC<{t: number; c: number; d: number; k?: number; seed: number}> = ({t, c, d, k = 1, seed}) => {
  const x = 1 - Math.min(1, Math.abs(t - c) / d);
  if (x <= 0) return null;
  const e = Math.pow(ease.inOut(x), 0.8) * k;
  const sweep = (t - (c - d)) / (2 * d); // 0→1 across the transition
  const cx = 20 + rand(seed) * 60;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          opacity: e * 0.97,
          background: `radial-gradient(ellipse 80% 60% at ${cx}% ${30 + sweep * 40}%, #FFF1CF 0%, #F0C878 22%, #C27A3A 48%, #6E1A2C 78%, ${WINE_D} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: e * 0.9,
          mixBlendMode: 'screen',
          background: `linear-gradient(115deg, transparent ${sweep * 140 - 45}%, rgba(255,236,190,0.9) ${sweep * 140 - 25}%, transparent ${sweep * 140 - 5}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- name lower third
const Name: React.FC<{t: number; a: number; b: number; name: [number, number]; lead: number; right?: boolean}> = ({t, a, b, name, lead, right}) => {
  const o = win(t, a, b, 0.25, 0.25);
  if (o <= 0) return null;
  const r = pt(t, a, a + 0.8, ease.out);
  return (
    <>
      <Shade o={o * 0.9} h={34} />
      <div style={{position: 'absolute', left: right ? undefined : 76, right: right ? 76 : undefined, top: 1500, width: 760, textAlign: right ? 'right' : 'left', opacity: o}}>
        <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: '0.32em', color: GOLD, marginBottom: 6, opacity: pt(t, a + 0.1, a + 0.5)}}>WEDDING DIARIES</div>
        <div style={{display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start'}}>
          <Rule p={r} w={300} />
        </div>
        <div style={{marginTop: 8, lineHeight: 1.05}}>
          <Words t={t} a={lead} b={name[0]} size={48} font={SANS} weight={500} spacing="0" />
        </div>
        <div style={{lineHeight: 1}}>
          <Words t={t} a={name[0]} b={name[1]} size={124} />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- chapter plate (covers the pink labels 13.0–18.0)
const CHAPTERS: [number, number, string, string][] = [
  [12.95, 14.3, '01', 'Haldi ki masti'],
  [14.3, 15.4, '02', 'Mehendi ki chamak'],
  [15.4, 16.7, '03', 'Sangeet ki dhamaal'],
  [16.7, 18.05, '04', 'Emotional moments'],
];
const Chapters: React.FC<{t: number}> = ({t}) => {
  const a = 12.95, b = 18.32;
  const o = pt(t, a - 0.12, a + 0.02, ease.out) * (1 - pt(t, 18.05, b, ease.in));
  if (o <= 0) return null;
  const open = pt(t, a - 0.12, a + 0.35, ease.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 292,
        width: 780,
        height: 214,
        opacity: o,
        transform: `scale(${0.94 + 0.06 * open})`,
        clipPath: `inset(0 ${(1 - open) * 50}% 0 ${(1 - open) * 50}% round 6px)`,
        borderRadius: 6,
        background: `linear-gradient(135deg, #6C1630 0%, ${WINE} 45%, ${WINE_D} 100%)`,
        boxShadow: '0 24px 60px rgba(20,2,8,0.55)',
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', inset: 10, border: `1.5px solid ${GOLD}`, borderRadius: 3, opacity: 0.85}} />
      {/* moving sheen */}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${((t * 0.45) % 1.6) * 100 - 30}%, rgba(255,230,180,0.16) ${((t * 0.45) % 1.6) * 100 - 15}%, transparent ${((t * 0.45) % 1.6) * 100}%)`}} />
      {CHAPTERS.map(([s, e, n, title], i) => {
        const pin = i === 0 ? pt(t, a + 0.1, a + 0.55) : pt(t, s, s + 0.45);
        const pout = i === CHAPTERS.length - 1 ? 0 : pt(t, e - 0.05, e + 0.3, ease.in);
        if (pin <= 0 || pout >= 1) return null;
        return (
          <div key={n} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 52}}>
            <div style={{fontFamily: NUM, fontSize: 92, fontWeight: 300, color: GOLD_L, width: 120, opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 40 - pout * 40}px)`, fontVariationSettings: '"opsz" 144, "SOFT" 100'}}>{n}</div>
            <div style={{width: 1.5, height: 120 * pin, background: GOLD, margin: '0 34px 0 6px', opacity: 0.9}} />
            <div style={{opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 34 - pout * 34}px)`, filter: `blur(${(1 - pin) * 5 + pout * 5}px)`}}>
              <div style={{fontFamily: SANS, fontSize: 24, letterSpacing: '0.38em', color: GOLD, fontWeight: 600}}>WE CAPTURE</div>
              <div style={{fontFamily: SERIF, fontSize: 82, color: IVORY, lineHeight: 1.04, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>{title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- film grain + grade
const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.075, mixBlendMode: 'overlay'}}>
    <filter id="g">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

// ---------------------------------------------------------------- phone icon
const Phone: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
    />
  </svg>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // ---- windows
  const hookO = 1 - pt(t, 4.55, 4.8, ease.in);
  const introO = win(t, 8.15, 12.95, 0.3, 0.3);
  const allO = win(t, 17.9, 18.95, 0.2, 0.2);
  const quoteO = win(t, 18.95, 24.95, 0.25, 0.25);
  const memO = win(t, 24.95, 27.9, 0.25, 0.2);
  const storyO = win(t, 27.85, 29.5, 0.2, 0.2);
  const bookO = pt(t, 29.28, 29.52, ease.out) * (1 - pt(t, 32.75, 33.05, ease.in));
  const vsO = win(t, 33.15, 38.45, 0.25, 0.25);
  const ctaO = pt(t, 38.35, 38.6, ease.out);

  const strike = pt(t, 35.45, 35.85, ease.inOut);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* picture: the client's reel, graded warm and filmic */}
      <AbsoluteFill style={{filter: 'contrast(1.06) saturate(1.04) brightness(0.985) sepia(0.05)'}}>
        <OffthreadVideo src={staticFile('clips/main.mp4')} muted style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'soft-light', background: 'linear-gradient(180deg, rgba(255,196,128,0.22) 0%, rgba(255,214,170,0.08) 45%, rgba(110,20,40,0.22) 100%)'}} />

      {/* light leaks over the white flash frames */}
      <Leak t={t} c={4.8} d={0.32} seed={1} />
      <Leak t={t} c={8.28} d={0.2} k={0.55} seed={2} />
      <Leak t={t} c={18.86} d={0.2} k={0.6} seed={3} />
      <Leak t={t} c={25.06} d={0.36} seed={4} />
      <Leak t={t} c={29.72} d={0.22} k={0.7} seed={5} />
      <Leak t={t} c={33.17} d={0.34} seed={6} />

      {/* 1. hook */}
      {hookO > 0 && (
        <>
          <Shade o={hookO * pt(t, 0.2, 0.7)} h={42} />
          <div style={{position: 'absolute', left: 72, top: 1330, width: 900, opacity: hookO}}>
            <div style={{lineHeight: 1.25, marginBottom: 14}}>
              <Words t={t} a={0.4} b={2.3} size={44} font={SANS} weight={500} spacing="0" />
            </div>
            <Rule p={pt(t, 2.2, 2.9)} w={220} />
            <div style={{lineHeight: 0.98, marginTop: 10}}>
              <Words t={t} a={2.3} b={4.7} size={100} gold={['moment', 'behind']} />
            </div>
          </div>
        </>
      )}

      {/* 2. names */}
      <Name t={t} a={4.9} b={6.6} name={[5.48, 6.3]} lead={4.9} />
      <Name t={t} a={6.6} b={8.15} name={[7.48, 8.1]} lead={6.4} right />

      {/* 3. introducing Wedding Diaries */}
      {introO > 0 && (
        <>
          <Shade o={introO} top h={36} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 236, textAlign: 'center', opacity: introO}}>
            <Words t={t} a={8.15} b={9.15} size={30} font={SANS} weight={600} spacing="0.34em" upper color={GOLD} goldColor={GOLD} />
            <div style={{marginTop: 4, lineHeight: 1}}>
              {(() => {
                const p = pt(t, 9.12, 9.9, ease.out);
                const sh = pt(t, 9.6, 11.2, ease.inOut);
                return (
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 138,
                      letterSpacing: `${-0.01 + 0.04 * (1 - p)}em`,
                      opacity: p,
                      filter: `blur(${(1 - p) * 10}px)`,
                      backgroundImage: `linear-gradient(100deg, ${IVORY} ${sh * 130 - 30}%, ${GOLD_L} ${sh * 130 - 12}%, ${IVORY} ${sh * 130 + 6}%)`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      textShadow: 'none',
                    }}
                  >
                    Wedding Diaries
                  </div>
                );
              })()}
            </div>
            <Rule p={pt(t, 9.9, 10.7)} w={520} center diamond />
            <div style={{marginTop: 10}}>
              <Words t={t} a={10.7} b={12.9} size={46} font={SANS} weight={500} spacing="0" gold={['personal']} />
            </div>
          </div>
        </>
      )}

      {/* 4. chapters (cover the burned-in pink labels) + "we capture it all" */}
      <Chapters t={t} />
      {allO > 0 && (
        <>
          <Shade o={allO} h={30} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1470, textAlign: 'center', opacity: allO}}>
            <Words t={t} a={17.9} b={18.95} size={110} gold={['all']} />
          </div>
        </>
      )}

      {/* 5. Aap … Hum … */}
      {quoteO > 0 && (
        <>
          <Shade o={quoteO} top h={34} />
          <div style={{position: 'absolute', left: 70, top: 236, width: 800, opacity: quoteO}}>
            {[
              [18.95, 20.2, 20.2, 22.3],
              [22.3, 23.6, 23.6, 25.0],
            ].map(([a1, b1, a2, b2], i) => {
              const o = i === 0 ? 1 - pt(t, 22.1, 22.35, ease.in) : pt(t, 22.3, 22.4);
              if (o <= 0) return null;
              return (
                <div key={i} style={{position: 'absolute', top: 0, left: 0, width: 900, opacity: o}}>
                  <div style={{lineHeight: 1.06}}>
                    <Words t={t} a={a1} b={b1} size={76} gold={['aap']} />
                  </div>
                  <div style={{lineHeight: 1.06}}>
                    <Words t={t} a={a2} b={b2} size={i === 0 ? 70 : 76} gold={['hum', 'khaas', 'yaadgaar']} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 6. more than just memories → their own story */}
      {memO > 0 && (
        <>
          <Shade o={memO} h={32} />
          <div style={{position: 'absolute', left: 60, right: 60, top: 1450, textAlign: 'center', opacity: memO, lineHeight: 1.12}}>
            <Words t={t} a={24.95} b={26.2} size={60} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={26.2} b={27.9} size={80} gold={['memories']} />
          </div>
        </>
      )}
      {storyO > 0 && (
        <>
          <Shade o={storyO} h={34} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1400, textAlign: 'center', opacity: storyO, lineHeight: 1}}>
            <Words t={t} a={27.9} b={28.4} size={56} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={28.4} b={29.5} size={136} gold={['own', 'story']} />
            <Rule p={pt(t, 29.0, 29.5)} w={420} center diamond />
          </div>
        </>
      )}

      {/* 7. book card (covers the burned-in "Book Now") */}
      {bookO > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 1140,
            width: 840,
            height: 350,
            opacity: bookO,
            transform: `translateY(${(1 - bookO) * 60}px) rotate(${-1.2 * (1 - bookO)}deg)`,
            borderRadius: 8,
            background: `linear-gradient(160deg, #FFFBF3 0%, ${IVORY} 55%, #EBDDC4 100%)`,
            boxShadow: '0 30px 70px rgba(30,4,12,0.5)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{position: 'absolute', inset: 12, border: `1.5px solid ${GOLD}`, borderRadius: 4}} />
          <div style={{position: 'absolute', inset: 18, border: `0.8px solid ${GOLD}`, borderRadius: 3, opacity: 0.6}} />
          <div style={{marginTop: 46, fontFamily: SANS, fontSize: 28, fontWeight: 600, letterSpacing: '0.4em', color: '#9A7434'}}>
            {['SO', 'BOOK'].map((s, i) => (
              <span key={s} style={{opacity: pt(t, 29.36 + i * 0.4, 29.7 + i * 0.4), marginRight: 18}}>{s}</span>
            ))}
          </div>
          <div style={{fontFamily: SERIF, fontSize: 108, color: WINE, lineHeight: 1.05, marginTop: 4}}>
            {['Wedding', 'Diaries', 'now'].map((s, i) => {
              const p = pt(t, [30.06, 30.42, 30.84][i], [30.06, 30.42, 30.84][i] + 0.32);
              return (
                <span key={s} style={{display: 'inline-block', marginRight: 22, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, color: i === 2 ? '#A9792C' : WINE}}>{s}</span>
              );
            })}
          </div>
          <div style={{marginTop: 8}}>
            <Words t={t} a={31.1} b={32.9} size={42} font={SANS} weight={500} spacing="0" color={WINE_D} goldColor="#A9792C" gold={['forever']} />
          </div>
        </div>
      )}

      {/* 8. photographers capture the wedding — we capture the moments */}
      {vsO > 0 && (
        <>
          <Shade o={vsO} h={40} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1280, textAlign: 'center', opacity: vsO}}>
            <div style={{position: 'relative', display: 'inline-block', opacity: 1 - 0.45 * strike, lineHeight: 1.1}}>
              <Words t={t} a={33.15} b={35.5} size={64} font={SANS} weight={500} spacing="0" />
              <div style={{position: 'absolute', left: 0, top: '54%', height: 3, width: `${strike * 100}%`, background: GOLD, boxShadow: `0 0 10px ${GOLD}`}} />
            </div>
            <div style={{lineHeight: 1.02, marginTop: 14}}>
              <Words t={t} a={35.5} b={36.8} size={118} gold={['moments']} />
            </div>
            <div style={{lineHeight: 1.1, marginTop: 6}}>
              <Words t={t} a={36.8} b={38.4} size={60} font={SANS} weight={500} spacing="0" gold={['yours']} />
            </div>
          </div>
        </>
      )}

      {/* 9. booking card with the number (covers the burned-in contact note) */}
      {ctaO > 0 && (
        <>
          <Shade o={ctaO} h={52} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 1018, textAlign: 'center', lineHeight: 1.05}}>
            <Words t={t} a={40.85} b={41.8} size={60} font={SANS} weight={500} spacing="0" />
            <br />
            <Words t={t} a={41.8} b={43.2} size={96} gold={['special']} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 70,
              top: 1235,
              width: 940,
              height: 470,
              opacity: ctaO,
              transform: `translateY(${(1 - ctaO) * 80}px) scale(${0.96 + 0.04 * ctaO})`,
              borderRadius: 10,
              background: `linear-gradient(150deg, #741B35 0%, ${WINE} 45%, ${WINE_D} 100%)`,
              boxShadow: '0 34px 80px rgba(20,2,8,0.6)',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', inset: 12, border: `1.5px solid ${GOLD}`, borderRadius: 5}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${((t - 38.5) * 0.5 % 1.5) * 100 - 30}%, rgba(255,226,170,0.18) ${((t - 38.5) * 0.5 % 1.5) * 100 - 14}%, transparent ${((t - 38.5) * 0.5 % 1.5) * 100}%)`}} />
            <div style={{marginTop: 50}}>
              <Words t={t} a={38.5} b={39.65} size={34} font={SANS} weight={600} spacing="0.36em" upper color={GOLD_L} goldColor={GOLD_L} />
            </div>
            <Rule p={pt(t, 39.2, 39.9)} w={460} center diamond />
            {(() => {
              const p = pt(t, 39.65, 40.25, ease.out);
              const pulse = 1 + 0.012 * Math.sin((t - 40.3) * 4) * pt(t, 40.3, 40.8);
              return (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 30, opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${pulse})`}}>
                  <div style={{width: 104, height: 104, borderRadius: 52, background: `linear-gradient(145deg, ${GOLD_L}, ${GOLD} 55%, #A9792C)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}}>
                    <Phone size={58} color={WINE_D} />
                  </div>
                  <div style={{fontFamily: NUM, fontSize: 112, fontWeight: 500, color: IVORY, letterSpacing: '0.01em', fontVariantNumeric: 'lining-nums tabular-nums', fontVariationSettings: '"opsz" 144'}}>
                    73789 89496
                  </div>
                </div>
              );
            })()}
            <div style={{marginTop: 28, fontFamily: SANS, fontSize: 32, fontWeight: 500, letterSpacing: '0.12em', color: GOLD_L, opacity: pt(t, 40.3, 40.8)}}>
              CALL NOW TO BOOK YOUR DATE
            </div>
          </div>
        </>
      )}

      <Grain frame={frame} />
    </AbsoluteFill>
  );
};
