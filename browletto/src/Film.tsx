import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt} from './anim';
import {DISPLAY, ITALIC, loadFonts, P, SANS} from './tokens';
import {Backdrop, Bean, Extruded, Kicker, Line, Motes, Photo, Rule, Shell, Sweep, useLayout} from './components/Kit';
import {BeanOrbit, Brownies, Coffee, Shake, Snacks, Waffle} from './components/Menu';
import story from './story.json';

loadFonts();

const S = story.scenes as unknown as Record<string, [number, number]>;
const PH = {store: 'photos/storefront.jpg', inside: 'photos/interior.jpg', neon: 'photos/neon-wall.jpg'};
/** Where the BROWLETTO sign sits in the storefront photo (0..1). */
const SIGN: [number, number] = [0.5, 0.235];

const Card: React.FC<{x: number; y: number; w: number; h: number; rx?: number; ry?: number; children: React.ReactNode; z?: number}> = ({x, y, w, h, rx = 0, ry = 0, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, perspective: 1800}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(240,211,160,0.35)'}}>{children}</div>
  </div>
);

// ---------------------------------------------------------------- 1. opening
const Opening: React.FC<{t: number}> = ({t}) => {
  const {W, H, v, u} = useLayout();
  const streak = pt(t, 0.3, 1.15, ease.inOut);
  const y = v ? H * 0.4 : H * 0.36;
  const size = (v ? 128 : 150) * u;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #3a2216 0%, ${P.chocolate} 40%, ${P.espresso} 85%)`}}>
      <Motes t={t} o={pt(t, 0, 0.8)} />
      <Bean x={W * 0.12} y={H * 0.16 - t * 20} s={1.8 * u} rot={30 + t * 8} blur={7} o={0.7} />
      <Bean x={W * 0.86} y={H * 0.78 - t * 26} s={2.4 * u} rot={-40 - t * 10} blur={10} o={0.6} />
      <Bean x={W * 0.8} y={H * 0.2 + t * 10} s={1.0 * u} rot={70 + t * 14} blur={2} o={0.85} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', perspective: 1400}}>
        <div style={{transform: `rotateX(${lerp(14, 6, pt(t, 0, 3.2))}deg) rotateY(${lerp(-12, 5, pt(t, 0, 3.2, ease.soft))}deg) scale(${lerp(0.94, 1.03, pt(t, 0.3, 3.2, ease.soft))})`, clipPath: `inset(-40% ${(1 - streak) * 100}% -40% -10%)`}}>
          <Extruded text="BROWLETTO" size={size} sweep={pt(t, 1.0, 2.0, ease.inOut)} />
        </div>
      </div>
      {/* light streak that writes the name on */}
      {streak > 0 && streak < 1 && (
        <div style={{position: 'absolute', top: y - 40 * u, height: size + 80 * u, left: lerp(-0.1, 1.0, streak) * W, width: 6, background: P.goldSoft, boxShadow: `0 0 40px 16px rgba(240,211,160,0.65), 0 0 140px 50px rgba(226,180,107,0.35)`}} />
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: y + size * 0.55, height: 2, background: `linear-gradient(90deg, transparent, rgba(240,211,160,${0.5 * (1 - Math.abs(streak - 0.5) * 2)}), transparent)`}} />
      <Line t={t} at={story.hits.ready} out={9} y={y + size + 70 * u} size={46 * u} font={SANS} weight={500} track={0.24} color={P.goldSoft}>
        AKOLA, ARE YOU READY?
      </Line>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2. the storefront reveal
const Reveal: React.FC<{t: number}> = ({t}) => {
  const {W, H, v, u} = useLayout();
  const [a, b] = S.reveal;
  const p = pt(t, a, b + 0.3, ease.soft);
  const cw = v ? W * 0.86 : H * 0.84 * 0.75;
  const ch = cw / 0.75;
  const cx = v ? (W - cw) / 2 : W * 0.1;
  const cy = v ? H * 0.085 : (H - ch) / 2;
  const signMask = 'linear-gradient(to bottom, transparent 9%, #000 14%, #000 32%, transparent 37%)';
  return (
    <AbsoluteFill style={{background: P.espresso}}>
      <Backdrop src={PH.store} p={p} />
      <Card x={cx} y={cy} w={cw} h={ch} ry={lerp(9, -3, p)} rx={lerp(3, 0, p)}>
        <Photo src={PH.store} p={p} zoom={[1.0, 1.34]} focus={SIGN} />
        {/* parallax: the sign band moves a touch faster than the facade */}
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: signMask, maskImage: signMask}}>
          <Photo src={PH.store} p={p} zoom={[1.0, 1.385]} focus={SIGN} pan={[0, -6]} grade="saturate(1.12) contrast(1.08) brightness(1.06)" />
        </div>
        <Sweep p={pt(t, story.hits.signSweep, story.hits.signSweep + 0.9, ease.inOut)} strength={0.55} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(20,11,7,0.55))'}} />
      </Card>
      {v ? (
        <>
          <Line t={t} at={4.25} out={b} y={H * 0.775} size={74 * u}>
            YOUR NEW
          </Line>
          <Line t={t} at={4.45} out={b} y={H * 0.775 + 88 * u} size={74 * u} italic weight={700} color={P.goldSoft}>
            Favourite Hangout
          </Line>
          <Kicker t={t} at={story.hits.tagline} out={b} y={H * 0.775 + 205 * u} text="BROWLETTO CAFE · AKOLA" />
        </>
      ) : (
        <>
          <Line t={t} at={4.25} out={b} x={W * 0.5} w={W * 0.46} align="left" y={H * 0.34} size={84 * u}>
            YOUR NEW
          </Line>
          <Line t={t} at={4.45} out={b} x={W * 0.5} w={W * 0.46} align="left" y={H * 0.34 + 100 * u} size={84 * u} italic weight={700} color={P.goldSoft}>
            Favourite Hangout
          </Line>
          <Kicker t={t} at={story.hits.tagline} out={b} x={W * 0.5} w={W * 0.46} align="left" y={H * 0.34 + 230 * u} text="BROWLETTO CAFE · AKOLA" />
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 3. inside
const Inside: React.FC<{t: number}> = ({t}) => {
  const {W, H, v, u} = useLayout();
  const [a, b] = S.inside;
  const p = pt(t, a - 0.3, b + 0.3, ease.soft);
  const aw = v ? W * 0.9 : W * 0.5;
  const ah = aw / 1.5;
  const ax = v ? (W - aw) / 2 : W * 0.05;
  const ay = v ? H * 0.11 : H * 0.12;
  const bIn = pt(t, 8.55, 9.25, ease.out);
  const bw = v ? W * 0.5 : W * 0.22;
  const bx = v ? W * 0.45 : W * 0.4;
  const by = v ? H * 0.4 : H * 0.48;
  const tx = v ? 70 * u : W * 0.66;
  const ty = v ? H * 0.69 : H * 0.36;
  const tw = v ? W - 140 * u : W * 0.32;
  return (
    <AbsoluteFill style={{background: P.espresso}}>
      <Backdrop src={PH.inside} p={p} dim={0.38} />
      <Kicker t={t} at={7.6} out={b} x={v ? 0 : tx} w={v ? W : tw} align={v ? 'center' : 'left'} y={v ? H * 0.055 : ty - 90 * u} text="INSIDE BROWLETTO" size={26 * u} />
      <Card x={ax} y={ay} w={aw} h={ah} ry={lerp(-6, 2, p)}>
        {/* forward dolly toward the back of the room */}
        <Photo src={PH.inside} p={p} zoom={[1.02, 1.3]} focus={[0.47, 0.42]} pan={[-10 * u, 0]} grade="saturate(1.1) contrast(1.05) brightness(1.04) sepia(0.06)" />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(255,214,150,0.12), transparent 60%)', mixBlendMode: 'screen'}} />
      </Card>
      {bIn > 0 && (
        <div style={{opacity: bIn, transform: `translateY(${(1 - bIn) * 260 * u}px) rotate(${lerp(8, 3, bIn)}deg)`, position: 'absolute', inset: 0}}>
          <Card x={bx} y={by} w={bw} h={bw}>
            <Photo src={PH.neon} p={pt(t, 8.55, b + 0.3, ease.soft)} zoom={[1.0, 1.12]} focus={[0.45, 0.4]} grade="saturate(1.05) contrast(1.05) brightness(1.05)" />
          </Card>
        </div>
      )}
      <Line t={t} at={7.75} out={9.3} x={tx} w={tw} align="left" y={ty} size={(v ? 84 : 76) * u}>
        GOOD VIBES.
      </Line>
      <Line t={t} at={8.0} out={9.3} x={tx} w={tw} align="left" y={ty + (v ? 98 : 90) * u} size={(v ? 84 : 76) * u}>
        COZY SPACES.
      </Line>
      <Line t={t} at={story.hits.great} out={b} x={tx} w={tw} align="left" y={ty + 20 * u} size={(v ? 116 : 96) * u} italic weight={700} color={P.goldSoft}>
        Great Taste.
      </Line>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4. menu
const MENU_BG = ['#3d2216', '#2a150b', '#33200f', '#4a2c12', '#4a1a20'];

const MenuItem: React.FC<{t: number; i: number; at: number; until: number}> = ({t, i, at, until}) => {
  const {W, H, v, u} = useLayout();
  if (t < at || t >= until + 0.2) return null;
  const r = t - at;
  const inP = pt(t, at, at + 0.22, ease.out);
  const outP = pt(t, until - 0.16, until, ease.in);
  if (t >= until && i < 4) return null;
  const box = v ? 760 * u : 640 * u;
  const bx = v ? (W - box) / 2 : W * 0.28 - box / 2;
  const by = v ? H * 0.37 - box / 2 : H * 0.5 - box / 2;
  const name = story.menu[i];
  const twoLine = name.includes('&');
  const lines = twoLine ? ['WAFFLES', '& ICE CREAM'] : [name];
  const chars = Math.max(...lines.map((l) => l.length));
  const size = Math.min(150 * u, ((v ? W * 0.86 : W * 0.42) / (chars * 0.74)) * 1);
  const titleX = v ? 0 : W * 0.52;
  const titleW = v ? W : W * 0.44;
  const titleY = v ? H * 0.665 : H * 0.42;
  const visual = [<Shake r={r} />, <Brownies r={r} />, <Coffee r={r} />, <Waffle r={r} />, null][i];
  return (
    <AbsoluteFill style={{opacity: 1 - outP, transform: `scale(${lerp(0.88, 1, inP) * lerp(1, 1.25, outP)})`, filter: inP < 1 || outP > 0 ? `blur(${(1 - inP) * 16 + outP * 18}px)` : undefined}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${v ? '50% 38%' : '30% 50%'}, ${MENU_BG[i]} 0%, ${P.espresso} 78%)`}} />
      {i === 4 && <Snacks r={r} W={W} u={u} />}
      {i === 2 && <BeanOrbit r={r} cx={bx + box / 2} cy={by + box * 0.58} R={box * 0.56} u={u} />}
      {visual && (
        <div style={{position: 'absolute', left: bx, top: by, width: box, height: box, transform: `translateY(${Math.sin(r * 2.2) * 6 * u}px)`}}>
          {visual}
        </div>
      )}
      <div style={{position: 'absolute', left: titleX, width: titleW, top: i === 4 ? (v ? H * 0.42 : H * 0.38) : titleY, display: 'flex', flexDirection: 'column', alignItems: v || i === 4 ? 'center' : 'flex-start', ...(i === 4 && !v ? {left: 0, width: W} : {})}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26 * u, letterSpacing: '0.4em', color: P.gold, marginBottom: 18 * u, opacity: pt(r, 0.08, 0.35)}}>0{i + 1} / 05</div>
        {lines.map((l, k) => {
          const lp = pt(r, 0.05 + k * 0.1, 0.45 + k * 0.1, ease.out);
          return (
            <div key={k} style={{overflow: 'hidden', paddingBottom: 20 * u, marginBottom: -6 * u}}>
              <div style={{transform: `translateY(${(1 - lp) * 110}%) perspective(900px) rotateX(${(1 - lp) * 40}deg)`, letterSpacing: 0}}>
                <Extruded text={l} size={(i === 4 ? 1.35 : 1) * (k === 1 ? size * 0.78 : size)} depth={k === 1 ? 10 : 14} face={k === 1 ? P.goldSoft : P.cream} track={0.03} sweep={pt(r, 0.45, 1.1, ease.inOut)} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Menu: React.FC<{t: number}> = ({t}) => {
  const {W, u, v} = useLayout();
  const A = story.menuAt;
  const end = S.menu[1];
  return (
    <AbsoluteFill style={{background: P.espresso}}>
      {A.map((at, i) => (
        <MenuItem key={i} t={t} i={i} at={at} until={i < 4 ? A[i + 1] : end} />
      ))}
      <div style={{position: 'absolute', top: v ? 110 * u : 60 * u, left: 0, width: W, textAlign: 'center', fontFamily: ITALIC, fontStyle: 'italic', fontWeight: 500, fontSize: 40 * u, color: P.beige, opacity: pt(t, 11.1, 11.5)}}>
        on the menu
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5. hero
const Hero: React.FC<{t: number}> = ({t}) => {
  const {W, H, v, u} = useLayout();
  const [a, b] = S.hero;
  const p = pt(t, a, b + 0.4, ease.soft);
  const focus = pt(t, a + 0.1, a + 0.85, ease.out);
  const sweep = <Sweep p={pt(t, 18.3, 19.2, ease.inOut)} strength={0.5} />;
  const grade = `saturate(1.12) contrast(1.1) brightness(${lerp(0.75, 1.0, focus)}) sepia(0.08) blur(${(1 - focus) * 10}px)`;
  if (v) {
    return (
      <AbsoluteFill style={{background: P.espresso}}>
        <Backdrop src={PH.store} p={p} dim={0.3} />
        {/* full-width storefront so the whole sign stays in frame */}
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: (W * 4) / 3, WebkitMaskImage: 'linear-gradient(to bottom, #000 78%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 78%, transparent 100%)'}}>
          <Photo src={PH.store} p={p} zoom={[1.0, 1.1]} focus={SIGN} grade={grade} />
          {sweep}
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(to bottom, transparent 55%, rgba(20,11,7,0.85) 75%, rgba(20,11,7,0.95) 100%)'}} />
        <Line t={t} at={story.hits.cravings} out={b} y={H * 0.67} size={96 * u}>
          YOUR CRAVINGS.
        </Line>
        <Line t={t} at={story.hits.cravings + 0.3} out={b} y={H * 0.67 + 112 * u} size={96 * u} italic weight={700} color={P.goldSoft}>
          Your Place.
        </Line>
        <Rule t={t} at={18.9} x={W * 0.3} y={H * 0.67 + 250 * u} w={W * 0.4} />
        <Kicker t={t} at={story.hits.experience} out={b} y={H * 0.67 + 280 * u} text="COME EXPERIENCE BROWLETTO." size={32 * u} color={P.cream} />
      </AbsoluteFill>
    );
  }
  const ch = H * 0.86;
  const cw = ch * 0.75;
  return (
    <AbsoluteFill style={{background: P.espresso}}>
      <Backdrop src={PH.store} p={p} dim={0.35} />
      <Card x={W * 0.08} y={(H - ch) / 2} w={cw} h={ch} ry={lerp(-6, 2, p)}>
        <Photo src={PH.store} p={p} zoom={[1.04, 1.24]} focus={SIGN} grade={grade} />
        {sweep}
      </Card>
      <Line t={t} at={story.hits.cravings} out={b} x={W * 0.48} w={W * 0.48} align="left" y={H * 0.32} size={92 * u}>
        YOUR CRAVINGS.
      </Line>
      <Line t={t} at={story.hits.cravings + 0.3} out={b} x={W * 0.48} w={W * 0.48} align="left" y={H * 0.32 + 108 * u} size={92 * u} italic weight={700} color={P.goldSoft}>
        Your Place.
      </Line>
      <Kicker t={t} at={story.hits.experience} out={b} x={W * 0.48} w={W * 0.48} align="left" y={H * 0.32 + 250 * u} text="COME EXPERIENCE BROWLETTO." size={30 * u} color={P.cream} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 6. end card
const End: React.FC<{t: number}> = ({t}) => {
  const {W, H, v, u} = useLayout();
  const [a] = S.end;
  const y = v ? H * 0.36 : H * 0.22;
  const size = (v ? 128 : 140) * u;
  const letters = Array.from('BROWLETTO');
  const L0 = story.hits.logo;
  const menuLines = v ? ['Thick Shakes · Ice Cream · Brownies', 'Coffee · Waffles · Snacks'] : ['Thick Shakes · Ice Cream · Brownies · Coffee · Waffles · Snacks'];
  const fadeOut = pt(t, 24.55, 25.0, ease.in);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #3a2216 0%, ${P.chocolate} 38%, ${P.espresso} 85%)`, opacity: 1 - fadeOut}}>
      <Motes t={t} n={26} o={0.8} />
      <Bean x={W * 0.1} y={H * 0.82 - (t - a) * 18} s={2.2 * u} rot={20 + t * 6} blur={9} o={0.55} />
      <Bean x={W * 0.9} y={H * 0.12 + (t - a) * 12} s={1.6 * u} rot={-30 - t * 8} blur={6} o={0.6} />
      {/* wordmark: letters tip up into place */}
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', perspective: 1200}}>
        {letters.map((ch, i) => {
          const p = pt(t, L0 + i * 0.055, L0 + i * 0.055 + 0.7, ease.out);
          return (
            <div key={i} style={{transformOrigin: '50% 100%', transform: `rotateX(${(1 - p) * -95}deg) translateY(${(1 - p) * 30}px)`, opacity: Math.min(1, p * 2)}}>
              <Extruded text={ch} size={size} track={0.04} sweep={pt(t, 22.4 + i * 0.06, 23.0 + i * 0.06, ease.inOut)} />
            </div>
          );
        })}
      </div>
      <Rule t={t} at={22.15} x={W * 0.2} y={y + size * 1.32} w={W * 0.6} />
      {menuLines.map((l, k) => (
        <Line key={k} t={t} at={22.3 + k * 0.15} out={99} y={y + size * 1.45 + k * 60 * u} size={38 * u} font={SANS} weight={400} track={0.06} color={P.cream}>
          {l}
        </Line>
      ))}
      <Kicker t={t} at={22.65} out={99} y={y + size * 1.45 + (menuLines.length * 60 + 36) * u} text="AKOLA, MAHARASHTRA" size={30 * u} />
      <Line t={t} at={story.hits.meet} out={99} y={y + size * 1.45 + (menuLines.length * 60 + 170) * u} size={68 * u} italic weight={700} color={P.goldSoft} track={0.01}>
        Meet you at Browletto.
      </Line>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film
export type FilmProps = {withAudio?: boolean};

export const Film: React.FC<FilmProps> = ({withAudio = true}) => {
  const frame = useCurrentFrame();
  const t = frame / story.fps;
  const {W, H} = useLayout();
  return (
    <AbsoluteFill style={{background: P.espresso, fontFamily: SANS}}>
      <Shell t={t} a={S.open[0]} b={S.open[1]} exit="whipL">
        <Opening t={t} />
      </Shell>
      <Shell t={t} a={S.reveal[0]} b={S.reveal[1]} enter="whipL" exit="whipU">
        <Reveal t={t} />
      </Shell>
      <Shell t={t} a={S.inside[0]} b={S.inside[1]} enter="whipU" exit="zoom">
        <Inside t={t} />
      </Shell>
      <Shell t={t} a={S.menu[0]} b={S.menu[1]} enter="zoom" exit="whipL">
        <Menu t={t} />
      </Shell>
      <Shell t={t} a={S.hero[0]} b={S.hero[1]} enter="whipL" exit="fade">
        <Hero t={t} />
      </Shell>
      <Shell t={t} a={S.end[0]} b={S.end[1] + 1} enter="fade">
        <End t={t} />
      </Shell>

      {/* one grade over everything: warm lift, vignette, fine grain */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,190,120,0.06), rgba(120,60,20,0.08))', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(10,5,2,0.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'overlay'}}>
        <svg width={W} height={H}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 10} />
          </filter>
          <rect width={W} height={H} filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {withAudio && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};

export {DISPLAY};
