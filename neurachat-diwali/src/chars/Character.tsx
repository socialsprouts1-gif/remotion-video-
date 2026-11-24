// Flat-vector cartoon characters, built from SVG shapes so every part can move:
// arms (shoulder + elbow), head tilt, blinking eyes, eyebrows, lip-synced mouth, breathing, props.
// Local coordinates: origin at the feet, y up is negative, ~1000 units tall.
import React from 'react';
import {rand} from '../lib/anim';

export type Kind = 'seth' | 'kaka' | 'raju';
export type Expr = 'neutral' | 'smile' | 'happy' | 'shock' | 'worried' | 'angry';
export type Arm = [shoulder: number, elbow: number];
export type Prop = {hand: 'l' | 'r'; kind: 'phone' | 'diary' | 'diya'};

type Look = {
  skin: string;
  skinShade: string;
  shirt: string;
  shirtShade: string;
  trim: string;
  pants: string;
  shoes: string;
  belly: number; // half width at the waist
  hem: number; // y of the shirt hem (kurta is longer)
  hair: string;
  height: number; // overall scale factor
};

const LOOKS: Record<Kind, Look> = {
  // Shop owner: saffron festive kurta with maroon trim, thick moustache.
  seth: {skin: '#E0A879', skinShade: '#C98E60', shirt: '#F2A93B', shirtShade: '#D98E22', trim: '#8E1F2F', pants: '#F4EEDF', shoes: '#5A3A22', belly: 150, hem: -360, hair: '#1E1A1A', height: 1},
  // Old helper: white kurta, brown Nehru vest, round glasses, grey hair.
  kaka: {skin: '#D59A6C', skinShade: '#BC8257', shirt: '#F3F0E8', shirtShade: '#DCD6C8', trim: '#7A4E2D', pants: '#4B4E5C', shoes: '#2E2A28', belly: 112, hem: -380, hair: '#D9D9D9', height: 0.94},
  // Young staff: teal shirt tucked in, lanyard badge.
  raju: {skin: '#C98B5E', skinShade: '#B0744A', shirt: '#169C8F', shirtShade: '#0F7F74', trim: '#0B5F57', pants: '#2C3346', shoes: '#1D1D22', belly: 104, hem: -440, hair: '#151212', height: 1.03},
};

const SH_Y = -742; // shoulder pivot height
const SH_X = 128;
const UPPER = 175;
const FORE = 158;

const ArmShape: React.FC<{side: 'l' | 'r'; arm: Arm; L: Look; kind: Kind; prop?: Prop}> = ({side, arm, L, kind, prop}) => {
  const s = side === 'l' ? 1 : -1; // rotating +a moves the left arm outwards (towards -x)
  const [a, b] = arm;
  const vest = kind === 'kaka';
  const sleeveLen = kind === 'raju' ? 120 : kind === 'seth' ? 150 : 165; // kurta sleeves are long
  return (
    <g transform={`translate(${-s * SH_X}, ${SH_Y}) rotate(${s * a})`}>
      {/* upper arm: sleeve over skin */}
      <rect x={-27} y={-10} width={54} height={UPPER + 12} rx={27} fill={L.skin} />
      <path d={`M -34 -18 Q -38 ${sleeveLen * 0.5} -31 ${sleeveLen} L 31 ${sleeveLen} Q 38 ${sleeveLen * 0.5} 34 -18 Q 0 -40 -34 -18 Z`} fill={L.shirt} />
      <path d={`M ${12 * s} -14 Q ${20 * s} ${sleeveLen * 0.5} ${16 * s} ${sleeveLen} L ${31 * s} ${sleeveLen} Q ${38 * s} ${sleeveLen * 0.5} ${34 * s} -18 Z`} fill={L.shirtShade} opacity={0.55} />
      <rect x={-31} y={sleeveLen - 8} width={62} height={12} rx={5} fill={vest ? L.shirtShade : L.trim} opacity={kind === 'raju' ? 0.6 : 1} />
      {/* forearm */}
      <g transform={`translate(0, ${UPPER}) rotate(${s * b})`}>
        <rect x={-24} y={-14} width={48} height={FORE + 10} rx={24} fill={L.skin} />
        {kind === 'raju' && <rect x={-20} y={FORE - 54} width={40} height={14} rx={6} fill="#1B1F2A" />}
        {kind === 'seth' && <rect x={-21} y={FORE - 52} width={42} height={10} rx={5} fill="#D4AF37" />}
        {/* hand */}
        <g transform={`translate(0, ${FORE + 12})`}>
          <ellipse cx={0} cy={0} rx={29} ry={31} fill={L.skin} />
          <ellipse cx={14 * s} cy={-8} rx={11} ry={17} fill={L.skin} transform={`rotate(${-25 * s} ${14 * s} -8)`} />
          <path d="M -18 14 Q 0 24 18 14" stroke={L.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
          {prop && prop.hand === side && <PropShape kind={prop.kind} s={s} />}
        </g>
      </g>
    </g>
  );
};

const PropShape: React.FC<{kind: Prop['kind']; s: number}> = ({kind, s}) => {
  if (kind === 'phone')
    return (
      <g transform={`translate(${-6 * s}, -62) rotate(${-8 * s})`}>
        <rect x={-30} y={-58} width={60} height={112} rx={12} fill="#1F2230" />
        <rect x={-25} y={-50} width={50} height={94} rx={8} fill="#E9F7EF" />
        <rect x={-25} y={-50} width={50} height={18} rx={6} fill="#25D366" />
        <rect x={-19} y={-24} width={34} height={10} rx={5} fill="#fff" />
        <rect x={-14} y={-8} width={34} height={10} rx={5} fill="#D7F8C4" />
        <rect x={-19} y={8} width={28} height={10} rx={5} fill="#fff" />
        <ellipse cx={0} cy={48} rx={26} ry={12} fill="none" />
      </g>
    );
  if (kind === 'diary')
    return (
      <g transform={`translate(${-4 * s}, -96) rotate(${-6 * s})`}>
        <rect x={-74} y={-96} width={148} height={186} rx={10} fill="#7B3F1E" />
        <rect x={-66} y={-88} width={132} height={170} rx={6} fill="#934D27" />
        <rect x={-50} y={-62} width={100} height={46} rx={6} fill="#F1E3C6" />
        <text x={0} y={-43} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={15} fill="#5B2E14">CUSTOMER</text>
        <text x={0} y={-24} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={12} fill="#5B2E14">NUMBERS</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-74} y={-80 + i * 38} width={10} height={18} rx={3} fill="#C9A36B" />
        ))}
      </g>
    );
  return (
    <g transform="translate(0,-40)">
      <path d="M -36 0 Q 0 40 36 0 Z" fill="#B5542A" />
      <path d="M 0 -6 Q -10 -30 0 -52 Q 10 -30 0 -6 Z" fill="#FFB020" />
    </g>
  );
};

const Head: React.FC<{kind: Kind; L: Look; expr: Expr; mouth: number; blink: number; look: number}> = ({kind, L, expr, mouth, blink, look}) => {
  const browLift = expr === 'shock' ? -14 : expr === 'worried' ? -6 : expr === 'happy' ? -6 : 0;
  const browTilt = expr === 'worried' ? 14 : expr === 'angry' ? -14 : 0; // inner end up (+) or down (-)
  const eyeOpen = expr === 'shock' ? 1.25 : expr === 'happy' ? 0.75 : 1;
  const eyeY = -892;
  const mouthY = kind === 'seth' ? -830 : -834;
  const open = expr === 'shock' ? Math.max(0.65, mouth) : mouth;
  const smiling = expr === 'smile' || expr === 'happy';
  const faceRy = kind === 'kaka' ? 92 : 96;
  return (
    <g>
      {/* neck */}
      <rect x={-32} y={-810} width={64} height={70} rx={14} fill={L.skinShade} />
      {/* ears */}
      <ellipse cx={-80} cy={-880} rx={17} ry={24} fill={L.skin} />
      <ellipse cx={80} cy={-880} rx={17} ry={24} fill={L.skin} />
      <ellipse cx={-80} cy={-880} rx={7} ry={12} fill={L.skinShade} opacity={0.6} />
      <ellipse cx={80} cy={-880} rx={7} ry={12} fill={L.skinShade} opacity={0.6} />
      {/* face */}
      <ellipse cx={0} cy={-880} rx={82} ry={faceRy} fill={L.skin} />
      {kind === 'seth' && <path d="M -78 -860 Q -72 -790 0 -782 Q 72 -790 78 -860 Q 60 -800 0 -796 Q -60 -800 -78 -860 Z" fill={L.skinShade} opacity={0.35} />}
      {/* hair */}
      {kind === 'seth' && (
        <g fill={L.hair}>
          <path d="M -86 -890 Q -92 -990 -20 -990 Q 40 -1000 74 -968 Q 96 -940 86 -888 L 76 -900 Q 70 -950 30 -952 Q -20 -958 -50 -940 Q -74 -925 -76 -886 Z" />
          <path d="M -86 -890 L -80 -850 L -72 -886 Z" />
          <path d="M 86 -890 L 80 -850 L 72 -886 Z" />
        </g>
      )}
      {kind === 'kaka' && (
        <g fill={L.hair}>
          <path d="M -86 -880 Q -92 -930 -66 -950 Q -70 -920 -72 -880 Z" />
          <path d="M 86 -880 Q 92 -930 66 -950 Q 70 -920 72 -880 Z" />
          <path d="M -40 -968 Q 0 -980 40 -968 Q 0 -972 -40 -968 Z" />
        </g>
      )}
      {kind === 'raju' && (
        <g fill={L.hair}>
          <path d="M -86 -878 Q -100 -1000 -10 -1006 Q 70 -1012 92 -950 Q 100 -910 86 -872 L 78 -912 Q 60 -960 0 -946 Q -40 -976 -62 -930 Q -76 -906 -78 -872 Z" />
          <path d="M -40 -1000 Q -10 -1030 30 -1004 Q 0 -1012 -40 -1000 Z" />
        </g>
      )}
      {kind === 'kaka' && (
        <g stroke={L.skinShade} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round">
          <path d="M -30 -948 Q 0 -954 30 -948" />
          <path d="M -24 -938 Q 0 -942 24 -938" />
        </g>
      )}
      {/* eyebrows */}
      <g stroke={kind === 'kaka' ? '#BDBDBD' : '#1E1A1A'} strokeWidth={kind === 'seth' ? 9 : 7} strokeLinecap="round" fill="none">
        <path d={`M -50 ${-920 + browLift + (browTilt > 0 ? 6 : 0)} Q -32 ${-930 + browLift} -14 ${-920 + browLift - browTilt}`} />
        <path d={`M 50 ${-920 + browLift + (browTilt > 0 ? 6 : 0)} Q 32 ${-930 + browLift} 14 ${-920 + browLift - browTilt}`} />
      </g>
      {/* eyes */}
      {[-32, 32].map((x) => (
        <g key={x} transform={`translate(${x}, ${eyeY}) scale(1, ${Math.max(0.08, blink * eyeOpen)})`}>
          {smiling && expr === 'happy' ? (
            <path d="M -14 4 Q 0 -12 14 4" stroke="#1E1A1A" strokeWidth={6} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={0} cy={0} rx={15} ry={15} fill="#fff" />
              <circle cx={look * 5} cy={1} r={8.5} fill="#2A1C14" />
              <circle cx={look * 5 + 3} cy={-3} r={2.6} fill="#fff" />
            </>
          )}
        </g>
      ))}
      {kind === 'kaka' && (
        <g stroke="#3A2A20" strokeWidth={5} fill="none">
          <circle cx={-32} cy={eyeY} r={25} />
          <circle cx={32} cy={eyeY} r={25} />
          <path d="M -7 -892 Q 0 -898 7 -892" />
          <path d="M -57 -896 L -80 -892 M 57 -896 L 80 -892" />
        </g>
      )}
      {/* nose */}
      <path d="M -4 -880 Q -14 -858 -2 -852 Q 8 -850 14 -856" stroke={L.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx={-50} cy={-856} rx={14} ry={8} fill="#E77B6B" opacity={smiling ? 0.35 : 0.18} />
      <ellipse cx={50} cy={-856} rx={14} ry={8} fill="#E77B6B" opacity={smiling ? 0.35 : 0.18} />
      {/* mouth */}
      {open > 0.06 ? (
        <g transform={`translate(0, ${mouthY + 4})`}>
          <ellipse cx={0} cy={0} rx={18 + open * 8} ry={4 + open * 17} fill="#5E1A1A" />
          <ellipse cx={0} cy={4 + open * 9} rx={10 + open * 4} ry={2 + open * 6} fill="#D9606A" />
          <rect x={-12 - open * 4} y={-4 - open * 15} width={24 + open * 8} height={5} rx={2} fill="#fff" opacity={open > 0.3 ? 0.9 : 0} />
        </g>
      ) : smiling ? (
        <path d={`M -26 ${mouthY - 4} Q 0 ${mouthY + 20} 26 ${mouthY - 4}`} stroke="#6B2A22" strokeWidth={6} fill={expr === 'happy' ? '#7A1F1F' : 'none'} strokeLinecap="round" />
      ) : expr === 'worried' || expr === 'angry' ? (
        <path d={`M -20 ${mouthY + 6} Q 0 ${mouthY - 6} 20 ${mouthY + 6}`} stroke="#6B2A22" strokeWidth={6} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M -18 ${mouthY} Q 0 ${mouthY + 8} 18 ${mouthY}`} stroke="#6B2A22" strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
      {/* moustache */}
      {kind === 'seth' && <path d="M -46 -838 Q -30 -858 0 -846 Q 30 -858 46 -838 Q 52 -826 38 -830 Q 20 -840 0 -834 Q -20 -840 -38 -830 Q -52 -826 -46 -838 Z" fill={L.hair} />}
      {kind === 'kaka' && <path d="M -34 -842 Q -18 -854 0 -846 Q 18 -854 34 -842 Q 20 -838 0 -840 Q -20 -838 -34 -842 Z" fill="#CFCFCF" />}
      {kind === 'seth' && <path d="M -12 -900 L -12 -912" stroke="#C0392B" strokeWidth={0} />}
      {/* tilak for Diwali on the owner */}
      {kind === 'seth' && <path d="M 0 -944 L 0 -918" stroke="#D6262F" strokeWidth={7} strokeLinecap="round" />}
    </g>
  );
};

const Torso: React.FC<{kind: Kind; L: Look}> = ({kind, L}) => {
  const w = L.belly;
  const top = -786;
  const body = `M -118 ${top + 8} Q -150 ${top + 16} -146 ${top + 80} L ${-w} -560 Q ${-w - 8} ${L.hem + 40} ${-w + 6} ${L.hem} L ${w - 6} ${L.hem} Q ${w + 8} ${L.hem + 40} ${w} -560 L 146 ${top + 80} Q 150 ${top + 16} 118 ${top + 8} Q 60 ${top - 6} 0 ${top - 6} Q -60 ${top - 6} -118 ${top + 8} Z`;
  return (
    <g>
      <path d={body} fill={L.shirt} />
      {/* side shading */}
      <path d={`M ${w - 34} -600 Q ${w - 10} ${L.hem + 60} ${w - 30} ${L.hem} L ${w - 6} ${L.hem} Q ${w + 8} ${L.hem + 40} ${w} -560 L 146 ${top + 80} Q 120 -680 ${w - 34} -600 Z`} fill={L.shirtShade} opacity={0.55} />
      {kind === 'seth' && (
        <g>
          {/* kurta placket + border + gold dots */}
          <path d={`M -16 ${top} L 16 ${top} L 12 -600 L -12 -600 Z`} fill={L.trim} />
          {[-740, -700, -660, -620].map((y) => (
            <circle key={y} cx={0} cy={y} r={5} fill="#E9C46A" />
          ))}
          <rect x={-w + 4} y={L.hem - 30} width={(w - 4) * 2} height={24} rx={6} fill={L.trim} />
          {Array.from({length: 18}).map((_, i) => (
            <circle key={i} cx={-w + 22 + i * ((2 * w - 44) / 17)} cy={L.hem - 18} r={4} fill="#E9C46A" />
          ))}
          {Array.from({length: 14}).map((_, i) => {
            const x = -w + 40 + rand(i * 3.1) * (2 * w - 80);
            const y = -730 + rand(i * 7.7) * (L.hem - -730 - 60);
            return <circle key={`p${i}`} cx={x} cy={y} r={5} fill="#FFD27A" opacity={0.85} />;
          })}
        </g>
      )}
      {kind === 'kaka' && (
        <g>
          {/* Nehru vest */}
          <path d={`M -104 ${top + 30} Q -128 -700 ${-w + 4} -560 L ${-w + 10} ${L.hem + 50} L -14 ${L.hem + 50} L -14 -690 L -40 ${top + 6} Z`} fill={L.trim} />
          <path d={`M 104 ${top + 30} Q 128 -700 ${w - 4} -560 L ${w - 10} ${L.hem + 50} L 14 ${L.hem + 50} L 14 -690 L 40 ${top + 6} Z`} fill={L.trim} />
          {[-660, -610, -560].map((y) => (
            <circle key={y} cx={-22} cy={y} r={5} fill="#E2C48E" />
          ))}
          <rect x={-90} y={-640} width={44} height={8} rx={3} fill="#5C3920" />
        </g>
      )}
      {kind === 'raju' && (
        <g>
          {/* collar, placket, pocket, lanyard */}
          <path d={`M -12 ${top - 2} L 12 ${top - 2} L 8 ${L.hem} L -8 ${L.hem} Z`} fill={L.shirtShade} />
          {[-720, -660, -600, -540, -480].map((y) => (
            <circle key={y} cx={0} cy={y} r={4.5} fill="#E8F6F4" />
          ))}
          <rect x={30} y={-700} width={56} height={60} rx={6} fill={L.shirtShade} opacity={0.6} />
          <path d={`M -44 ${top} L -6 -640 L 6 -640 L 44 ${top}`} stroke="#6D28D9" strokeWidth={7} fill="none" />
          <rect x={-30} y={-640} width={60} height={80} rx={8} fill="#fff" />
          <rect x={-30} y={-640} width={60} height={20} rx={6} fill="#7C3AED" />
          <circle cx={0} cy={-598} r={13} fill="#D9D3F5" />
          <rect x={-18} y={-578} width={36} height={6} rx={3} fill="#B8AEE6" />
          <rect x={-w + 6} y={L.hem - 2} width={(w - 6) * 2} height={20} rx={4} fill="#3A2A1F" />
          <rect x={-16} y={L.hem} width={32} height={16} rx={3} fill="#C9A44C" />
        </g>
      )}
      {/* collar */}
      {kind === 'raju' ? (
        <g fill={L.trim}>
          <path d={`M -58 ${top - 8} L -4 ${top + 4} L -40 ${top + 46} Z`} />
          <path d={`M 58 ${top - 8} L 4 ${top + 4} L 40 ${top + 46} Z`} />
        </g>
      ) : (
        <path d={`M -36 ${top - 4} Q 0 ${top + 30} 36 ${top - 4}`} stroke={kind === 'seth' ? L.trim : L.shirtShade} strokeWidth={10} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

const Legs: React.FC<{L: Look; kind: Kind; swing: number}> = ({L, kind, swing}) => {
  const top = L.hem + 10;
  const loose = kind === 'seth'; // pyjama is wider
  const wl = loose ? 84 : 70;
  return (
    <g>
      <g transform={`rotate(${swing * 9} ${-wl / 2} ${top - 40})`}>
        <path d={`M ${-wl - 8} ${top - 40} L 8 ${top - 40} L 2 -40 L ${-wl + 4} -40 Z`} fill={L.pants} />
        <ellipse cx={-wl / 2 - 6} cy={-18} rx={52} ry={22} fill={L.shoes} />
      </g>
      <g transform={`rotate(${-swing * 9} ${wl / 2} ${top - 40})`}>
        <path d={`M -8 ${top - 40} L ${wl + 8} ${top - 40} L ${wl - 4} -40 L -2 -40 Z`} fill={L.pants} />
        <ellipse cx={wl / 2 + 6} cy={-18} rx={52} ry={22} fill={L.shoes} />
      </g>
      <path d={`M -8 ${top - 40} L 2 -40 L -6 -40 Z`} fill="#000" opacity={0.15} />
      {loose && <rect x={-wl - 6} y={-60} width={2 * wl + 12} height={8} rx={4} fill="#E2D9C4" opacity={0.7} />}
      <ellipse cx={-wl / 2 - 14} cy={-26} rx={22} ry={6} fill="#fff" opacity={0.12} />
      <ellipse cx={wl / 2 - 2} cy={-26} rx={22} ry={6} fill="#fff" opacity={0.12} />
    </g>
  );
};

export type CharProps = {
  kind: Kind;
  x: number;
  y: number; // feet position in px
  scale?: number;
  frame: number; // local frame, drives idle motion and blinking
  mouth?: number;
  expr?: Expr;
  armL?: Arm; // arm on the viewer's left: [shoulder angle out from the body, elbow bend]
  armR?: Arm;
  prop?: Prop;
  tilt?: number;
  look?: number; // -1..1 pupils left/right
  lean?: number;
  sweat?: number; // 0..1
  opacity?: number;
  bob?: number; // extra bounce (talking / excitement)
  walk?: number; // 0 = standing; otherwise the walk cycle phase in frames
};

export const Character: React.FC<CharProps> = ({kind, x, y, scale = 1, frame, mouth = 0, expr = 'neutral', armL = [8, 6], armR = [8, 6], prop, tilt = 0, look = 0, lean = 0, sweat = 0, opacity = 1, bob = 0, walk = 0}) => {
  const swing = walk ? Math.sin(walk / 4.5) : 0;
  const L = LOOKS[kind];
  const seed = kind === 'seth' ? 1 : kind === 'kaka' ? 2 : 3;
  // blink every ~2.5-4s for 4 frames
  const period = 84 + Math.floor(rand(seed) * 40);
  const ph = (frame + seed * 17) % period;
  const blink = ph < 2 ? 1 - ph * 0.45 : ph < 4 ? 0.1 + (ph - 2) * 0.45 : 1;
  const breathe = Math.sin((frame + seed * 9) / 22) * 0.008;
  const talkBob = mouth * 4 + bob + (walk ? Math.abs(swing) * 10 : 0);
  const headTilt = tilt + Math.sin((frame + seed * 5) / 31) * 1.2 + mouth * 2 * Math.sin(frame / 4);
  const s = scale * L.height;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s}) rotate(${lean})`} opacity={opacity}>
      <ellipse cx={0} cy={-6} rx={150} ry={22} fill="#000" opacity={0.13} />
      <Legs L={L} kind={kind} swing={swing} />
      <g transform={`translate(0, ${-talkBob}) scale(${1 + breathe}, ${1 - breathe})`} style={{transformOrigin: '0px -400px'}}>
        <Torso kind={kind} L={L} />
        <ArmShape side="r" arm={armR} L={L} kind={kind} prop={prop} />
        <ArmShape side="l" arm={armL} L={L} kind={kind} prop={prop} />
        <g transform={`rotate(${headTilt} 0 -790)`}>
          <Head kind={kind} L={L} expr={expr} mouth={mouth} blink={blink} look={look} />
          {sweat > 0 && (
            <g opacity={sweat}>
              <path d={`M 96 ${-930 + (frame % 40) * 1.5} q -14 22 0 30 q 14 -8 0 -30 Z`} fill="#6EC3F5" />
              <path d="M -100 -950 q -12 18 0 26 q 12 -8 0 -26 Z" fill="#6EC3F5" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
