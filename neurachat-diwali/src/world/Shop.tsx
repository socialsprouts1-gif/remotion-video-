// The electronics shop, drawn in SVG. World units match the 1080×1920 frame at zoom 1;
// the set extends past both edges (x -320…1400) so the camera can pan.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {rand} from '../lib/anim';
import {BRAND, SHOP} from '../config';

const WOOD = '#A8693A';
const WOOD_D = '#8A5329';
const WOOD_L = '#C88A55';

const Tv: React.FC<{x: number; y: number; w: number; h: number; on?: number; i: number}> = ({x, y, w, h, on = 0, i}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill="#15171F" />
    <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={3} fill={`url(#scr${i % 3})`} />
    <path d={`M ${x + 5} ${y + 5} L ${x + w * 0.42} ${y + 5} L ${x + w * 0.18} ${y + h - 5} L ${x + 5} ${y + h - 5} Z`} fill="#fff" opacity={0.07} />
    {on > 0 && <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx={3} fill="#7C3AED" opacity={on * 0.25} />}
    <rect x={x + w / 2 - 14} y={y + h} width={28} height={8} fill="#2A2D38" />
  </g>
);

const Box: React.FC<{x: number; y: number; w: number; h: number; label: string}> = ({x, y, w, h, label}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={3} fill="#C99A62" />
    <rect x={x} y={y} width={w} height={h * 0.14} fill="#B68550" />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={h} fill="#D9B07B" opacity={0.6} />
    <text x={x + w / 2} y={y + h * 0.68} textAnchor="middle" fontFamily="Inter Display" fontWeight={800} fontSize={h * 0.3} fill="#6E4A22">
      {label}
    </text>
  </g>
);

const Tag: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <g transform={`rotate(-4 ${x} ${y})`}>
    <rect x={x} y={y} width={74} height={26} rx={4} fill="#FFD43B" />
    <circle cx={x + 8} cy={y + 13} r={3} fill="#B8860B" />
    <text x={x + 41} y={y + 18} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={13} fill="#6B3E00">
      {t}
    </text>
  </g>
);

const Shelf: React.FC<{x: number; w: number; seed: number; tvOn?: number}> = ({x, w, seed, tvOn}) => {
  const top = 300;
  const rows = [300, 520, 720, 900, 1080];
  return (
    <g>
      <rect x={x - 16} y={top - 26} width={w + 32} height={rows[4] - top + 60} rx={6} fill={WOOD_D} />
      <rect x={x} y={top} width={w} height={rows[4] - top} fill="#EAD8BC" />
      {rows.slice(0, 4).map((ry, r) => {
        const rh = rows[r + 1] - ry - 22;
        const items: React.ReactNode[] = [];
        if (r <= 1) {
          const n = r === 0 ? 3 : 4;
          const iw = (w - 30) / n;
          for (let k = 0; k < n; k++) {
            const tw = iw - 22;
            const th = Math.min(rh - 26, tw * 0.6);
            items.push(<Tv key={k} x={x + 15 + k * iw + 11} y={ry + rh - th - 10} w={tw} h={th} i={seed + k + r} on={tvOn} />);
            if (k % 2 === r % 2) items.push(<Tag key={`t${k}`} x={x + 20 + k * iw + iw * 0.4} y={ry + 8} t={`₹${[24, 18, 32, 45, 21][(k + r + seed) % 5]},999`} />);
          }
        } else if (r === 2) {
          const n = 5;
          const iw = (w - 30) / n;
          for (let k = 0; k < n; k++) {
            const kind = (k + seed) % 3;
            const bx = x + 15 + k * iw + 8;
            const bw = iw - 16;
            if (kind === 0) {
              items.push(
                <g key={k}>
                  <rect x={bx} y={ry + 30} width={bw} height={rh - 34} rx={6} fill="#23252E" />
                  <circle cx={bx + bw / 2} cy={ry + 30 + (rh - 34) * 0.33} r={bw * 0.2} fill="#3A3D4A" />
                  <circle cx={bx + bw / 2} cy={ry + 30 + (rh - 34) * 0.33} r={bw * 0.09} fill="#121318" />
                  <circle cx={bx + bw / 2} cy={ry + 30 + (rh - 34) * 0.72} r={bw * 0.28} fill="#3A3D4A" />
                  <circle cx={bx + bw / 2} cy={ry + 30 + (rh - 34) * 0.72} r={bw * 0.12} fill="#121318" />
                </g>,
              );
            } else if (kind === 1) {
              items.push(
                <g key={k}>
                  <rect x={bx} y={ry + rh * 0.35} width={bw} height={rh * 0.62} rx={6} fill="#E8E8EC" />
                  <rect x={bx + 8} y={ry + rh * 0.35 + 10} width={bw * 0.62} height={rh * 0.62 - 20} rx={4} fill="#2B2E3A" />
                  <rect x={bx + bw * 0.74} y={ry + rh * 0.35 + 14} width={bw * 0.16} height={8} rx={2} fill="#9AA0AE" />
                  <rect x={bx + bw * 0.74} y={ry + rh * 0.35 + 30} width={bw * 0.16} height={8} rx={2} fill="#9AA0AE" />
                </g>,
              );
            } else {
              items.push(<Box key={k} x={bx} y={ry + rh * 0.3} w={bw} h={rh * 0.67} label={['TV', 'AC', 'MW', 'SB'][(k + seed) % 4]} />);
            }
          }
        } else {
          const n = 4;
          const iw = (w - 30) / n;
          for (let k = 0; k < n; k++) items.push(<Box key={k} x={x + 15 + k * iw + 8} y={ry + 16} w={iw - 16} h={rh - 18} label={['TV', 'SB', 'AC', 'TV', 'MW'][(k + seed + 1) % 5]} />);
        }
        return (
          <g key={r}>
            <rect x={x} y={ry} width={w} height={rh + 22} fill={r % 2 ? '#E6D2B3' : '#EBDABF'} />
            {items}
            <rect x={x - 4} y={ry + rh} width={w + 8} height={22} fill={WOOD} />
            <rect x={x - 4} y={ry + rh} width={w + 8} height={6} fill={WOOD_L} />
          </g>
        );
      })}
      {/* vertical posts */}
      <rect x={x - 16} y={top - 26} width={18} height={rows[4] - top + 60} fill={WOOD} />
      <rect x={x + w - 2} y={top - 26} width={18} height={rows[4] - top + 60} fill={WOOD} />
    </g>
  );
};

/** Marigold toran swag between two x positions. */
export const Toran: React.FC<{x1: number; x2: number; y: number; sag?: number; frame?: number}> = ({x1, x2, y, sag = 40, frame = 0}) => {
  const n = Math.round((x2 - x1) / 22);
  const flowers = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = x1 + (x2 - x1) * t;
    const py = y + Math.sin(t * Math.PI) * sag + Math.sin(frame / 20 + i) * 0.8;
    flowers.push(<circle key={i} cx={px} cy={py} r={12} fill={i % 3 === 0 ? '#F0A020' : i % 3 === 1 ? '#F57C00' : '#FFC107'} />);
    if (i % 4 === 2)
      flowers.push(
        <g key={`l${i}`}>
          <line x1={px} y1={py} x2={px} y2={py + 30} stroke="#E07A00" strokeWidth={3} />
          <circle cx={px} cy={py + 34} r={9} fill="#F57C00" />
          <path d={`M ${px} ${py + 44} q -10 14 0 30 q 10 -16 0 -30 Z`} fill="#3D8B3D" />
        </g>,
      );
  }
  return <g>{flowers}</g>;
};

/** String of fairy lights; bulbs twinkle with the frame. */
export const Lights: React.FC<{x1: number; x2: number; y: number; sag?: number; frame: number}> = ({x1, x2, y, sag = 26, frame}) => {
  const n = Math.round((x2 - x1) / 34);
  const cols = ['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB'];
  const pts = Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    return [x1 + (x2 - x1) * t, y + Math.sin(t * Math.PI) * sag] as const;
  });
  return (
    <g>
      <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} stroke="#4A3B2A" strokeWidth={2} fill="none" />
      {pts.map(([px, py], i) => {
        const tw = 0.55 + 0.45 * Math.sin(frame / 6 + i * 1.7);
        const c = cols[i % cols.length];
        return (
          <g key={i}>
            <circle cx={px} cy={py + 8} r={14} fill={c} opacity={tw * 0.25} />
            <ellipse cx={px} cy={py + 8} rx={5} ry={7} fill={c} opacity={0.5 + tw * 0.5} />
          </g>
        );
      })}
    </g>
  );
};

const Kandil: React.FC<{x: number; y: number; frame: number; c: string}> = ({x, y, frame, c}) => {
  const sw = Math.sin(frame / 28 + x) * 3;
  return (
    <g transform={`rotate(${sw} ${x} 0)`}>
      <line x1={x} y1={0} x2={x} y2={y} stroke="#5A4630" strokeWidth={3} />
      <circle cx={x} cy={y + 60} r={70} fill={c} opacity={0.18} />
      <path d={`M ${x} ${y} L ${x + 48} ${y + 46} L ${x + 34} ${y + 96} L ${x - 34} ${y + 96} L ${x - 48} ${y + 46} Z`} fill={c} />
      <path d={`M ${x} ${y} L ${x + 16} ${y + 46} L ${x} ${y + 96} L ${x - 16} ${y + 46} Z`} fill="#fff" opacity={0.25} />
      {[-30, -15, 0, 15, 30].map((dx) => (
        <line key={dx} x1={x + dx} y1={y + 96} x2={x + dx * 1.1} y2={y + 150} stroke={c} strokeWidth={4} />
      ))}
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="scr0" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#2B3550" />
      <stop offset="1" stopColor="#0E1220" />
    </linearGradient>
    <linearGradient id="scr1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#263C4F" />
      <stop offset="1" stopColor="#0C141E" />
    </linearGradient>
    <linearGradient id="scr2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#35304F" />
      <stop offset="1" stopColor="#100E1C" />
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#E3D3BA" />
      <stop offset="1" stopColor="#D6C2A2" />
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F4E6CF" />
      <stop offset="1" stopColor="#EBD9BC" />
    </linearGradient>
    <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#9C5E31" />
      <stop offset="1" stopColor="#7C4520" />
    </linearGradient>
    <radialGradient id="warm" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.35" />
      <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** Back of the shop: wall, sign, shelves, fridge, floor, decorations. */
export const ShopBack: React.FC<{frame: number; tvOn?: number}> = ({frame, tvOn}) => (
  <g>
    <Defs />
    <rect x={-400} y={-200} width={1900} height={1440} fill="url(#wall)" />
    {Array.from({length: 20}).map((_, i) => (
      <rect key={i} x={-400 + i * 100} y={-200} width={2} height={1440} fill="#E2CFAF" opacity={0.5} />
    ))}
    {/* floor with tiles */}
    <rect x={-400} y={1150} width={1900} height={900} fill="url(#floor)" />
    {Array.from({length: 26}).map((_, i) => {
      const xb = -1400 + i * 160;
      return <line key={i} x1={540 + (xb - 540) * 0.35} y1={1150} x2={xb} y2={2000} stroke="#C9B391" strokeWidth={2} opacity={0.5} />;
    })}
    {[1190, 1260, 1370, 1530, 1760].map((y) => (
      <line key={y} x1={-400} y1={y} x2={1500} y2={y} stroke="#C9B391" strokeWidth={2} opacity={0.45} />
    ))}
    <rect x={-400} y={1140} width={1900} height={14} fill="#B7895A" />
    {/* sign board */}
    <rect x={-60} y={40} width={1200} height={170} rx={10} fill="#5E1224" />
    <rect x={-48} y={52} width={1176} height={146} rx={8} fill="none" stroke="#E9C46A" strokeWidth={4} />
    <text x={540} y={140} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={80} fill="#FFD66B" letterSpacing={2}>
      {SHOP.toUpperCase()}
    </text>
    <text x={540} y={182} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={26} fill="#F6E2B0" letterSpacing={8}>
      TV • FRIDGE • AC • MOBILE
    </text>
    <Shelf x={-300} w={520} seed={0} tvOn={tvOn} />
    <Shelf x={270} w={560} seed={2} tvOn={tvOn} />
    {/* fridges on the right */}
    {[880, 1080].map((x, i) => (
      <g key={x}>
        <rect x={x} y={420} width={180} height={720} rx={14} fill={i ? '#D9DDE3' : '#C9CED6'} />
        <rect x={x + 6} y={426} width={168} height={250} rx={10} fill={i ? '#E7EAEE' : '#DADEE4'} />
        <rect x={x + 6} y={684} width={168} height={448} rx={10} fill={i ? '#E7EAEE' : '#DADEE4'} />
        <rect x={x + 146} y={470} width={10} height={120} rx={5} fill="#9AA1AD" />
        <rect x={x + 146} y={730} width={10} height={160} rx={5} fill="#9AA1AD" />
        <Tag x={x + 40} y={710} t={i ? '₹52,999' : '₹38,999'} />
      </g>
    ))}
    {/* AC on the wall */}
    <rect x={900} y={270} width={330} height={100} rx={18} fill="#F7F8FA" />
    <rect x={920} y={340} width={290} height={10} rx={5} fill="#D5D9E0" />
    <circle cx={1200} cy={296} r={6} fill="#22C55E" />
    <Toran x1={-300} x2={1380} y={214} sag={30} frame={frame} />
    <Lights x1={-300} x2={1380} y={262} sag={20} frame={frame} />
    <Kandil x={-120} y={-40} frame={frame} c="#E53935" />
    <Kandil x={1240} y={-60} frame={frame} c="#FB8C00" />
    {/* rangoli on the floor */}
    <g transform="translate(300 1640) scale(1 0.32)">
      {[200, 160, 120, 80, 40].map((r, i) => (
        <circle key={r} cx={0} cy={0} r={r} fill={['#E91E63', '#FFC107', '#4CAF50', '#2196F3', '#FF5722'][i]} opacity={0.75} />
      ))}
      {Array.from({length: 12}).map((_, i) => (
        <ellipse key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 170} cy={Math.sin((i / 12) * Math.PI * 2) * 170} rx={26} ry={26} fill="#fff" opacity={0.55} />
      ))}
    </g>
    <rect x={-400} y={-200} width={1900} height={2300} fill="url(#warm)" />
  </g>
);

/** Shop counter in the foreground, with garland, diyas and the laptop seen from the back. */
export const Counter: React.FC<{x: number; y: number; frame: number; w?: number; glow?: number}> = ({x, y, frame, w = 640, glow = 0}) => (
  <g>
    {/* laptop (back) */}
    <g transform={`translate(${x + w * 0.42}, ${y - 4})`}>
      <path d="M -150 0 L -128 -210 L 128 -210 L 150 0 Z" fill="#C9CCD6" />
      <path d="M -150 0 L -128 -210 L -112 -210 L -132 0 Z" fill="#B3B7C3" />
      <circle cx={0} cy={-108} r={34} fill="#111" />
      <foreignObject x={-28} y={-136} width={56} height={56}>
        <Img src={staticFile(BRAND.logo)} style={{width: 56, height: 56, borderRadius: 28}} />
      </foreignObject>
      {glow > 0 && <circle cx={0} cy={-108} r={90} fill="#A78BFA" opacity={glow * 0.35} />}
      <rect x={-170} y={-4} width={340} height={14} rx={6} fill="#A3A7B3" />
    </g>
    {/* diyas */}
    {[x + 60, x + w - 70].map((dx, i) => {
      const fl = 1 + Math.sin(frame / 3 + i * 2) * 0.12;
      return (
        <g key={dx} transform={`translate(${dx}, ${y + 2})`}>
          <circle cx={0} cy={-34} r={34} fill="#FFB300" opacity={0.18} />
          <path d="M -30 -10 Q 0 22 30 -10 Z" fill="#C0582C" />
          <path d="M -30 -10 Q 0 -2 30 -10" stroke="#E07B45" strokeWidth={4} fill="none" />
          <path d={`M 0 -12 Q -9 ${-30 * fl} 0 ${-46 * fl} Q 9 ${-30 * fl} 0 -12 Z`} fill="#FFC531" />
          <path d={`M 0 -14 Q -4 ${-24 * fl} 0 ${-32 * fl} Q 4 ${-24 * fl} 0 -14 Z`} fill="#FFF3C4" />
        </g>
      );
    })}
    {/* counter body */}
    <rect x={x - 10} y={y} width={w + 20} height={34} rx={6} fill={WOOD_L} />
    <rect x={x} y={y + 30} width={w} height={1000} fill="url(#counter)" />
    <rect x={x + 30} y={y + 120} width={w - 60} height={200} rx={10} fill={WOOD_D} />
    <rect x={x + 40} y={y + 130} width={w - 80} height={180} rx={8} fill="none" stroke="#D9A35E" strokeWidth={3} />
    <text x={x + w / 2} y={y + 232} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={w * 0.09} fill="#F6D28B" letterSpacing={3}>
      {SHOP.split(' ')[0].toUpperCase()}
    </text>
    <text x={x + w / 2} y={y + 282} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={w * 0.036} fill="#E2B877" letterSpacing={10}>
      ELECTRONICS
    </text>
    <Toran x1={x} x2={x + w} y={y + 40} sag={26} frame={frame} />
  </g>
);

/** The street outside, with the rival shop across the road. */
export const Street: React.FC<{frame: number; rival: string}> = ({frame, rival}) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B2A5E" />
        <stop offset="0.6" stopColor="#7B4A8E" />
        <stop offset="1" stopColor="#F29B6B" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-200} width={1900} height={1400} fill="url(#sky)" />
    {Array.from({length: 30}).map((_, i) => (
      <circle key={i} cx={-300 + rand(i) * 1700} cy={rand(i * 3) * 500} r={1.5 + rand(i * 5) * 2} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(frame / 20 + i))} />
    ))}
    {/* buildings */}
    <rect x={-400} y={360} width={420} height={900} fill="#3E3557" />
    <rect x={1060} y={300} width={460} height={960} fill="#3A3150" />
    {[0, 1, 2, 3].map((r) =>
      [0, 1].map((c) => <rect key={`${r}${c}`} x={-340 + c * 180} y={420 + r * 160} width={110} height={90} rx={4} fill={rand(r * 3 + c) > 0.4 ? '#FFD98A' : '#5B5078'} opacity={0.9} />),
    )}
    {[0, 1, 2, 3].map((r) =>
      [0, 1].map((c) => <rect key={`b${r}${c}`} x={1120 + c * 180} y={360 + r * 170} width={110} height={100} rx={4} fill={rand(r * 7 + c) > 0.45 ? '#FFD98A' : '#544A70'} opacity={0.9} />),
    )}
    {/* rival shop */}
    <rect x={40} y={420} width={1000} height={820} fill="#F4E9DA" />
    <rect x={20} y={330} width={1040} height={150} rx={10} fill="#1B3A8C" />
    <text x={540} y={420} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={76} fill="#FFFFFF">
      {rival.toUpperCase()}
    </text>
    <text x={540} y={460} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={22} fill="#C8D6FF" letterSpacing={8}>
      TV • FRIDGE • AC • WASHING MACHINE
    </text>
    <Lights x1={20} x2={1060} y={486} sag={18} frame={frame} />
    {/* windows with TVs */}
    <rect x={90} y={560} width={360} height={360} rx={8} fill="#2A3650" />
    <rect x={110} y={580} width={150} height={90} rx={4} fill="#1A2032" />
    <rect x={280} y={580} width={150} height={90} rx={4} fill="#1A2032" />
    <rect x={110} y={700} width={320} height={190} rx={6} fill="#E8EAF0" />
    <circle cx={190} cy={795} r={60} fill="#C4C9D4" />
    <circle cx={350} cy={795} r={60} fill="#C4C9D4" />
    <circle cx={190} cy={795} r={36} fill="#7FA4D8" />
    <circle cx={350} cy={795} r={36} fill="#7FA4D8" />
    {/* door */}
    <rect x={560} y={560} width={360} height={680} rx={8} fill="#2E2A3A" />
    <rect x={580} y={580} width={150} height={640} rx={6} fill="#4A4560" />
    <rect x={750} y={580} width={150} height={640} rx={6} fill="#4A4560" />
    <rect x={580} y={580} width={320} height={640} fill="#FFD98A" opacity={0.2} />
    <Toran x1={540} x2={940} y={540} sag={22} frame={frame} />
    {/* sale banner + arrow board */}
    <g transform={`rotate(${Math.sin(frame / 12) * 2} 900 980)`}>
      <rect x={830} y={940} width={240} height={150} rx={10} fill="#D62828" />
      <text x={950} y={1000} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={46} fill="#fff">
        DIWALI
      </text>
      <text x={950} y={1052} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={40} fill="#FFD43B">
        SALE →
      </text>
      <rect x={942} y={1090} width={16} height={150} fill="#5A4630" />
    </g>
    <g transform="translate(250 1000)">
      <rect x={-120} y={-40} width={240} height={80} rx={12} fill="#FFD43B" />
      <text x={0} y={14} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={38} fill="#B71C1C">
        50% OFF
      </text>
    </g>
    {/* pavement and road */}
    <rect x={-400} y={1240} width={1900} height={110} fill="#B9A58A" />
    <rect x={-400} y={1340} width={1900} height={16} fill="#8F7D65" />
    <rect x={-400} y={1356} width={1900} height={700} fill="#4A4A55" />
    {Array.from({length: 10}).map((_, i) => (
      <rect key={i} x={-380 + i * 220} y={1600} width={120} height={18} rx={4} fill="#E8E8E8" />
    ))}
    {/* rangoli at the door */}
    <g transform="translate(740 1290) scale(1 0.3)">
      {[120, 85, 50].map((r, i) => (
        <circle key={r} cx={0} cy={0} r={r} fill={['#E91E63', '#FFC107', '#4CAF50'][i]} />
      ))}
    </g>
  </g>
);

/** Flat silhouette person (customers). */
export const Silhouette: React.FC<{x: number; y: number; s?: number; c: string; frame: number; walk?: boolean; seed: number; opacity?: number}> = ({x, y, s = 1, c, frame, walk, seed, opacity = 0.85}) => {
  const ph = walk ? Math.sin(frame / 4 + seed) : 0;
  const female = seed % 2 === 1;
  return (
    <g transform={`translate(${x} ${y + (walk ? Math.abs(ph) * -6 : 0)}) scale(${s})`} opacity={opacity}>
      <rect x={-34} y={-430} width={30} height={430} rx={14} fill={c} transform={`rotate(${ph * 10} -20 -430)`} />
      <rect x={4} y={-430} width={30} height={430} rx={14} fill={c} transform={`rotate(${-ph * 10} 20 -430)`} />
      {female ? <path d="M -70 -760 Q 0 -800 70 -760 L 100 -330 L -100 -330 Z" fill={c} /> : <rect x={-76} y={-780} width={152} height={400} rx={40} fill={c} />}
      <rect x={-104} y={-760} width={34} height={320} rx={17} fill={c} transform={`rotate(${-ph * 12} -88 -760)`} />
      <rect x={70} y={-760} width={34} height={320} rx={17} fill={c} transform={`rotate(${ph * 12} 88 -760)`} />
      <circle cx={0} cy={-860} r={74} fill={c} />
      {female && <path d="M -74 -860 Q -80 -760 -40 -720 L 40 -720 Q 80 -760 74 -860 Z" fill={c} />}
    </g>
  );
};
