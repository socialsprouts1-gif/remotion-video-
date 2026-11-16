import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {lerp, pt} from './anim';
import tl from './tl.json';

// Before/after reel (full length, no cuts) in the layout of the earlier cream reel (unbranded: no logo, no handle):
// a tilted RAW card and a bigger tilted FINAL card with brown tags, a brown band with the tagline, an editing-timeline panel whose
// playhead runs with the video, and "DM NOW!". The timeline is drawn from the real edit (edit14): every take split at
// its real cuts, the 3D cut scenes, windows, words behind him, overlays, caption clips, and the voice loudness.
const FPS = 30;
const SANS = 'Geist, sans-serif';
const BROWN = '#8A5A12';
const FINAL_DUR = 43.5; // edit14/renders/neuraxine-automate-v6.mp4
const RAW_DUR = 41.3; // original footage; holds its last frame during the final end card
export const TOTAL = Math.floor(FINAL_DUR * FPS) - 1;

let loaded = false;
if (!loaded && typeof document !== 'undefined') {
  loaded = true;
  const h = delayRender('fonts');
  const f = new FontFace('Geist', `url(${staticFile('fonts/Geist.ttf')})`, {weight: '100 900'});
  (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
  f.load().then(() => continueRender(h)).catch(() => continueRender(h));
}
const smooth = Easing.bezier(0.22, 1, 0.36, 1);

const Video: React.FC<{src: string; dur: number; muted: boolean}> = ({src, dur, muted}) => {
  const last = Math.floor(dur * FPS) - 1;
  return (
    <>
      <Sequence from={0} durationInFrames={Math.min(TOTAL, last)} layout="none">
        <OffthreadVideo src={staticFile(src)} muted={muted} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      {last < TOTAL && (
        <Sequence from={last} layout="none">
          <Freeze frame={last - 1}>
            <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Freeze>
        </Sequence>
      )}
    </>
  );
};

const Tag: React.FC<{text: string; w: number; size: number}> = ({text, w, size}) => (
  <div style={{position: 'absolute', left: '50%', top: -34, width: w, marginLeft: -w / 2, height: size * 1.9, borderRadius: 10, background: `linear-gradient(180deg, #A06C1C, ${BROWN})`, boxShadow: '0 8px 18px rgba(80,50,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: size, color: '#FFF6E2', zIndex: 2}}>
    {text}
  </div>
);

// ---------------------------------------------------------------- the editing-timeline panel
const PX0 = 150, PX1 = 900; // track area inside the panel
const tx = (s: number) => PX0 + (s / tl.dur) * (PX1 - PX0);
const TRACKS: {k: string; label: string; color: string; spans: (number | string)[][]}[] = [
  {k: 'v8', label: 'V8', color: '#5BA4E6', spans: tl.captions},
  {k: 'v7', label: 'V7', color: '#B05BD6', spans: tl.overlays},
  {k: 'v6', label: 'V6', color: '#E08A2C', spans: tl.behind},
  {k: 'v5', label: 'V5', color: '#D45BA4', spans: tl.windows},
  {k: 'v4', label: 'V4', color: '#8E5BE0', spans: tl.bridges},
  {k: 'v3', label: 'V3', color: '#C2477A', spans: [[0, 41.27, 'person cutout']]},
  {k: 'v2', label: 'V2', color: '#2B8FB3', spans: tl.clips},
];
const Timeline: React.FC<{t: number}> = ({t}) => {
  const ph = tx(Math.min(t, tl.dur));
  const rowH = 17, top0 = 66;
  const aTop = top0 + TRACKS.length * rowH + 10;
  const tc = (() => {
    const s = Math.floor(t), f = Math.floor((t - s) * FPS);
    return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  })();
  const env = tl.env as number[];
  return (
    <div style={{position: 'absolute', left: 70, top: 1288, width: 940, height: 370, borderRadius: 22, background: '#1C1D20', border: '2px solid #3DDC84', boxShadow: '0 0 30px rgba(61,220,132,0.35), 0 20px 40px rgba(60,40,0,0.25)', overflow: 'hidden'}}>
      {/* header */}
      <div style={{position: 'absolute', left: 16, top: 12, fontFamily: 'monospace', fontSize: 17, color: '#4CB2FF', fontVariantNumeric: 'tabular-nums'}}>{tc}</div>
      <div style={{position: 'absolute', left: 16, top: 36, display: 'flex', gap: 8}}>
        {['#fff', '#9AA0A6', '#9AA0A6', '#9AA0A6'].map((c, i) => (
          <div key={i} style={{width: 18, height: 18, borderRadius: 4, border: `2px solid ${c}`, opacity: 0.8}} />
        ))}
      </div>
      {/* ruler */}
      <svg width={940} height={370} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 9}, (_, i) => (
          <g key={i}>
            <line x1={tx(i * 5)} y1={i % 2 ? 48 : 44} x2={tx(i * 5)} y2={54} stroke="#8A8F96" strokeWidth={1.5} />
            {i % 2 === 0 && (
              <text x={tx(i * 5) + 4} y={40} fill="#A6ABB2" fontSize={12} fontFamily="monospace">{`00:00:${String(i * 5).padStart(2, '0')}:00`}</text>
            )}
          </g>
        ))}
        <line x1={PX0} y1={56} x2={PX1} y2={56} stroke="#33363B" strokeWidth={1} />
        {/* track labels */}
        {TRACKS.map((tr, i) => (
          <text key={tr.k} x={16} y={top0 + i * rowH + 12} fill="#9AA0A6" fontSize={11} fontFamily="monospace">{tr.label}</text>
        ))}
        {['A1', 'A2', 'A3'].map((a, i) => (
          <text key={a} x={16} y={aTop + i * 34 + 20} fill="#9AA0A6" fontSize={11} fontFamily="monospace">{a}</text>
        ))}
        {/* video tracks: the real edit's clips */}
        {TRACKS.map((tr, i) =>
          tr.spans.map((sp, j) => {
            const a = sp[0] as number, b = sp[1] as number;
            const w = Math.max(3, tx(b) - tx(a) - 1.5);
            return (
              <g key={tr.k + j}>
                <rect x={tx(a)} y={top0 + i * rowH} width={w} height={rowH - 3} rx={2} fill={tr.color} opacity={0.92} />
                {w > 34 && (
                  <text x={tx(a) + 4} y={top0 + i * rowH + 10} fill="rgba(255,255,255,0.85)" fontSize={9} fontFamily="monospace">
                    {tr.k === 'v2' ? 'IMG_0126' : tr.k === 'v8' ? 'Subtitle' : (sp[2] as string) ?? 'fx'}
                  </text>
                )}
              </g>
            );
          }),
        )}
        {/* audio: A1 voice waveform from the real loudness, A2 music bed, A3 sound effects at the cuts */}
        <rect x={PX0} y={aTop} width={tx(41.3) - PX0} height={30} rx={3} fill="#1F3A22" />
        {env.filter((_, i) => i % 3 === 0).map((v, i) => {
          const x = tx((i * 3) / FPS);
          if (x > tx(41.3)) return null;
          const h = 2 + v * 26;
          return <rect key={i} x={x} y={aTop + 15 - h / 2} width={1.6} height={h} fill="#6CCB5F" />;
        })}
        <rect x={PX0} y={aTop + 34} width={tx(43.4) - PX0} height={30} rx={3} fill="#1F3A22" />
        {Array.from({length: 120}, (_, i) => {
          const x = PX0 + (i / 120) * (tx(43.4) - PX0);
          const h = 8 + 10 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23));
          return <rect key={i} x={x} y={aTop + 49 - h / 2} width={2} height={h} fill="#4FA84A" opacity={0.85} />;
        })}
        {tl.bridges.map((b, i) => (
          <rect key={i} x={tx(b[0] as number)} y={aTop + 70} width={Math.max(4, tx(b[1] as number) - tx(b[0] as number))} height={22} rx={3} fill="#3E7E3A" />
        ))}
        {/* playhead */}
        <line x1={ph} y1={20} x2={ph} y2={370} stroke="#4CB2FF" strokeWidth={2} />
        <path d={`M ${ph - 8} 44 L ${ph + 8} 44 L ${ph} 54 Z`} fill="#4CB2FF" />
      </svg>
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inR = pt(t, 0, 0.6, smooth);
  const inF = pt(t, 0.08, 0.7, smooth);
  const inB = pt(t, 0.25, 0.8, smooth);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #DDBF8A 0%, #EAD3A6 22%, #F3E5C8 48%, #F8F0DF 75%, #FBF6EC 100%)'}}>

      {/* RAW card */}
      <div style={{position: 'absolute', left: 74, top: 312, width: 402, height: 715, transform: `rotate(-2deg) translateX(${(1 - inR) * -180}px)`, opacity: inR}}>
        <Tag text="RAW" w={168} size={34} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 24px 50px rgba(90,60,10,0.35)', background: '#222'}}>
          <Video src="clips/raw.mp4" dur={RAW_DUR} muted />
        </div>
      </div>

      {/* FINAL card */}
      <div style={{position: 'absolute', left: 496, top: 200, width: 500, height: 950, transform: `rotate(2deg) translateX(${(1 - inF) * 200}px)`, opacity: inF}}>
        <Tag text="FINAL" w={190} size={34} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 28px 60px rgba(90,60,10,0.4)', background: '#222'}}>
          <Video src="clips/final.mp4" dur={FINAL_DUR} muted={false} />
        </div>
      </div>

      {/* tagline band */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1186, height: 78, background: `linear-gradient(180deg, #96631A, ${BROWN})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scaleX(${inB})`}}>
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 44, color: '#FFF6E2', letterSpacing: '-0.01em', opacity: pt(t, 0.5, 1.0, smooth)}}>Turn your videos into a premium masterpiece.</span>
      </div>

      <div style={{opacity: inB, transform: `translateY(${(1 - inB) * 40}px)`}}>
        <Timeline t={t} />
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 1690, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: '-0.02em', color: BROWN, opacity: pt(t, 0.6, 1.1, smooth), transform: `scale(${1 + 0.02 * Math.sin(t * 3)})`}}>
        DM NOW!
      </div>
      <AbsoluteFill style={{background: '#000', opacity: pt(t, TOTAL / FPS - 0.35, TOTAL / FPS)}} />
    </AbsoluteFill>
  );
};
void lerp;
