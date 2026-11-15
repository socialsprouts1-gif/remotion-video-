import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame} from 'remotion';
import {ease, lerp, pt, rand} from './anim';
import tl from './tl.json';

// Editor-portfolio showcase (light, warm): RAW card and FINAL card side by side in 3D, a gold tagline band,
// a live editing timeline whose playhead tracks the video, and a DM call to action. Full v13 edit.
export const FPS = 30;
export const DURATION = 46;
const CLIP = 44.97;
const RAW_LEN = 42.4;
const SANS = 'InterV, "Liberation Sans", sans-serif';
const GOLD = '#9C7424';
const GOLD_GRAD = 'linear-gradient(180deg, #D9B15E 0%, #A97E2A 55%, #8A6418 100%)';

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

const m1 = (v: number) => Math.min(1, Math.max(0, v));
const sp = (t: number, at: number, stiffness = 110, damping = 20) => (t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {stiffness, damping, mass: 1}}));

/** A video card with a gold tab, white rim and glass glare. */
const VCard: React.FC<{x: number; y: number; w: number; h: number; t: number; tab: string; tabW: number; children: React.ReactNode}> = ({x, y, w, h, t, tab, tabW, children}) => {
  const g = ((t * 0.2 + x * 0.001) % 1.6) * 100;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 34, overflow: 'hidden', background: '#000', boxShadow: '0 50px 90px rgba(90,60,20,0.35), 0 0 0 5px rgba(255,255,255,0.85)'}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${g - 30}%, rgba(255,255,255,0.12) ${g - 14}%, transparent ${g}%)`}} />
      </div>
      <div style={{position: 'absolute', left: (w - tabW) / 2, top: -26, width: tabW, height: 56, borderRadius: 12, background: GOLD_GRAD, display: 'grid', placeItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '0.06em', boxShadow: '0 10px 24px rgba(90,60,20,0.35)'}}>{tab}</div>
    </div>
  );
};

// ---------------------------------------------------------------- Premiere Pro–style timeline built from the real edit
// Cuts, caption blocks, graphic layers and waveforms come from the actual v13 project data (tl.json).
type TLData = {scenes: [number, string][]; caps: [number, number, string][]; voice: number[]; music: number[]; dur: number};
const TD = tl as unknown as TLData;
const PR = {panel: '#1E1E1E', area: '#232323', row: '#262626', line: '#141414', text: '#B8B8B8', dim: '#7A7A7A', blue: '#2D8CEB', video: '#9384D6', videoTop: '#B4A8EC', audio: '#4E9E7E', audioTop: '#6CC19F', graphic: '#C77AAE', graphicTop: '#E29BCB', adj: '#8C8C8C', cap: '#5D6E8C', fx: '#E6C34B'};
const ICONS = ['robot.png', 'whatsapp-icon.svg', 'meta-icon.svg', 'calendar.png', 'chart_increasing.png', 'speech_balloon.png', 'check_mark_button.png', 'hourglass_not_done.png', 'man.png', 'woman.png', 'cross_mark.png', 'puzzle_piece.png', 'link.png', 'page_facing_up.png'];
const TCK = (s: number) => {
  const fr = Math.floor((s % 1) * 30);
  return `00;00;${String(Math.floor(s)).padStart(2, '0')};${String(fr).padStart(2, '0')}`;
};
type PClip = {a: number; b: number; name: string; kind: 'video' | 'audio' | 'graphic' | 'adj' | 'cap'; fx?: boolean};
const TRACKS: {id: string; clips: PClip[]; audio?: number[]}[] = (() => {
  const sc = TD.scenes;
  const end = TD.dur;
  const v1: PClip[] = sc.slice(0, -1).map(([a], i) => ({a, b: sc[i + 1][0], name: 'IMG_0133.MP4 [V]', kind: 'video', fx: true}));
  v1.push({a: sc[sc.length - 1][0], b: end, name: 'End card', kind: 'graphic'});
  const v2: PClip[] = sc.slice(0, -1).map(([a, n], i) => ({a: a + 0.02, b: sc[i + 1][0] - 0.02, name: n, kind: 'graphic', fx: true}));
  const v3: PClip[] = [];
  sc.slice(0, -1).forEach(([a], i) => {
    const b = sc[i + 1][0];
    let x = a + 0.3 + rand(i * 3.1) * 0.6;
    let k = 0;
    while (x < b - 0.8) {
      const len = 0.9 + rand(i * 7.7 + k * 2.3) * 1.8;
      v3.push({a: x, b: Math.min(b - 0.1, x + len), name: ICONS[(i * 3 + k) % ICONS.length], kind: 'graphic'});
      x += len + 0.25 + rand(i * 5.3 + k) * 0.9;
      k++;
    }
  });
  const v4: PClip[] = sc.slice(0, -1).map(([a], i) => ({a: a - 0.08, b: a + 0.3, name: 'Cross Zoom', kind: 'adj' as const})).filter((c) => c.a > 0);
  const cap: PClip[] = TD.caps.map(([a, b, txt]) => ({a, b, name: txt, kind: 'cap'}));
  const a1: PClip[] = [{a: 0, b: TD.scenes[TD.scenes.length - 1][0], name: 'IMG_0133.MP4 [A]  Voice  DeNoise · EQ · Comp', kind: 'audio', fx: true}];
  const a2: PClip[] = [{a: 0, b: end, name: 'score.wav', kind: 'audio'}];
  const a3: PClip[] = [];
  sc.slice(1).forEach(([a], i) => a3.push({a: a - 0.35, b: a + 0.15, name: 'whoosh', kind: 'audio'}));
  TD.caps.forEach(([a], i) => {
    if (rand(i * 9.1) > 0.78) a3.push({a: a - 0.05, b: a + 0.3, name: 'pop', kind: 'audio'});
  });
  return [
    {id: 'C1', clips: cap},
    {id: 'V4', clips: v4},
    {id: 'V3', clips: v3},
    {id: 'V2', clips: v2},
    {id: 'V1', clips: v1},
    {id: 'A1', clips: a1, audio: TD.voice},
    {id: 'A2', clips: a2, audio: TD.music},
    {id: 'A3', clips: a3},
  ];
})();

const Eye: React.FC = () => (
  <svg width={16} height={12} viewBox="0 0 24 16"><path d="M1 8 C5 1, 19 1, 23 8 C19 15, 5 15, 1 8 Z" fill="none" stroke={PR.dim} strokeWidth={2} /><circle cx={12} cy={8} r={3} fill={PR.dim} /></svg>
);
const Lock: React.FC = () => (
  <svg width={12} height={14} viewBox="0 0 12 14"><rect x={1} y={6} width={10} height={7} rx={1} fill="none" stroke={PR.dim} strokeWidth={1.4} /><path d="M3.5 6 V4 a2.5 2.5 0 0 1 5 0 V6" fill="none" stroke={PR.dim} strokeWidth={1.4} /></svg>
);

const Timeline: React.FC<{t: number; x: number; y: number; w: number; h: number}> = ({t, x, y, w, h}) => {
  const head = 178;
  const topBar = 46, ruler = 34;
  const rowH = (h - topBar - ruler - 8) / TRACKS.length;
  const view = 13; // seconds visible
  const play = Math.min(t, TD.dur);
  const start = Math.max(0, Math.min(TD.dur - view, play - view * 0.38));
  const pps = (w - head) / view;
  const X = (s: number) => head + (s - start) * pps;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 14, background: PR.panel, overflow: 'hidden', boxShadow: '0 40px 80px rgba(60,40,10,0.35), 0 0 0 1px #000'}}>
      {/* sequence tab + timecode + tools */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: topBar, background: '#1A1A1A', borderBottom: `1px solid ${PR.line}`, display: 'flex', alignItems: 'center'}}>
        <div style={{width: head, paddingLeft: 14, boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: 700, fontSize: 22, color: PR.blue}}>{TCK(play)}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: '100%', borderBottom: `2px solid ${PR.blue}`, fontFamily: SANS, fontSize: 17, color: '#E0E0E0'}}>
          Reel_v13 <span style={{color: PR.dim}}>×</span>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 16, paddingRight: 18}}>
          {['⊓', '⧉', '▾', '✎'].map((c) => (
            <span key={c} style={{fontFamily: SANS, fontSize: 18, color: PR.dim}}>{c}</span>
          ))}
        </div>
      </div>
      {/* ruler */}
      <div style={{position: 'absolute', left: head, right: 0, top: topBar, height: ruler, background: '#202020', borderBottom: `1px solid ${PR.line}`, overflow: 'hidden'}}>
        {Array.from({length: view * 2 + 4}, (_, i) => {
          const s = Math.floor(start * 2) / 2 + i * 0.5;
          const major = Math.abs(s % 2) < 0.01;
          return (
            <div key={i} style={{position: 'absolute', left: X(s) - head, top: 0}}>
              <div style={{width: 1, height: major ? 12 : 6, background: '#5A5A5A'}} />
              {major && <div style={{position: 'absolute', left: 4, top: 12, fontFamily: 'monospace', fontSize: 13, color: PR.dim, whiteSpace: 'nowrap'}}>{TCK(s).slice(3)}</div>}
            </div>
          );
        })}
      </div>
      {/* tracks */}
      {TRACKS.map((tr, ri) => {
        const ty = topBar + ruler + 4 + ri * rowH;
        const isA = tr.id.startsWith('A');
        return (
          <div key={tr.id}>
            <div style={{position: 'absolute', left: 0, top: ty, width: head - 2, height: rowH - 2, background: '#2A2A2A', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, boxSizing: 'border-box'}}>
              <div style={{width: 22, height: 18, borderRadius: 2, background: tr.id === 'V1' || tr.id === 'A1' ? PR.blue : 'transparent', border: `1px solid ${PR.dim}`, fontFamily: SANS, fontSize: 11, color: '#fff', display: 'grid', placeItems: 'center'}}>{tr.id === 'C1' ? '' : tr.id.replace('V', 'V').slice(0, 2)}</div>
              <Lock />
              <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 15, color: PR.text, width: 26}}>{tr.id}</span>
              {isA ? (
                <>
                  <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 12, color: PR.dim, border: `1px solid #444`, padding: '1px 5px', borderRadius: 2}}>M</span>
                  <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 12, color: PR.dim, border: `1px solid #444`, padding: '1px 5px', borderRadius: 2}}>S</span>
                </>
              ) : (
                <Eye />
              )}
            </div>
            <div style={{position: 'absolute', left: head, right: 0, top: ty, height: rowH - 2, background: ri % 2 ? PR.area : PR.row, overflow: 'hidden'}}>
              {tr.clips.map((c, i) => {
                if (c.b < start || c.a > start + view) return null;
                const l = X(c.a) - head, wd = Math.max(3, (c.b - c.a) * pps - 1);
                const col = c.kind === 'video' ? [PR.video, PR.videoTop] : c.kind === 'audio' ? [PR.audio, PR.audioTop] : c.kind === 'cap' ? [PR.cap, '#7488AA'] : c.kind === 'adj' ? [PR.adj, '#ABABAB'] : [PR.graphic, PR.graphicTop];
                return (
                  <div key={i} style={{position: 'absolute', left: l, top: 2, width: wd, height: rowH - 6, borderRadius: 2, background: col[0], borderTop: `2px solid ${col[1]}`, boxSizing: 'border-box', overflow: 'hidden'}}>
                    {tr.audio && (
                      <svg width={wd} height={rowH - 8} viewBox={`0 0 ${Math.max(1, Math.round((c.b - c.a) * 20))} 100`} preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0, opacity: 0.85}}>
                        <path
                          d={Array.from({length: Math.round((c.b - c.a) * 20)}, (_, k) => {
                            const v = tr.audio![Math.min(tr.audio!.length - 1, Math.round(c.a * 20) + k)] ?? 0;
                            const a = 4 + v * 44;
                            return `M${k + 0.5} ${54 - a} L${k + 0.5} ${54 + a}`;
                          }).join(' ')}
                          stroke="#1F4D3B"
                          strokeWidth={0.7}
                        />
                      </svg>
                    )}
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 5, padding: '1px 5px', whiteSpace: 'nowrap'}}>
                      {c.fx && <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 10, color: '#222', background: PR.fx, borderRadius: 2, padding: '0 3px'}}>fx</span>}
                      <span style={{fontFamily: SANS, fontSize: 13, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.5)'}}>{c.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* playhead */}
      <div style={{position: 'absolute', left: X(play) - 1, top: topBar, width: 2, bottom: 0, background: PR.blue}}>
        <div style={{position: 'absolute', left: -9, top: 0, width: 20, height: 20, background: PR.blue, clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)'}} />
      </div>
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const inF = sp(t, 0, 80, 18);
  const inR = sp(t, 0.15, 80, 18);
  const band = pt(t, 0.4, 1.1, ease.out);
  const tl = sp(t, 0.55, 80, 20);
  const rawEnd = pt(t, RAW_LEN - 0.4, RAW_LEN, ease.inOut);
  const fR = Math.sin(t * 0.8 + 1.7) * 10, fF = Math.sin(t * 0.7) * 8;
  const dm = 1 + 0.035 * Math.sin(t * 3);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #EAD9B8 0%, #F3E8D3 45%, #F6EEDF 100%)', overflow: 'hidden'}}>
      {/* soft light */}
      <div style={{position: 'absolute', left: 300 + Math.sin(t * 0.2) * 80, top: -300, width: 1100, height: 1100, borderRadius: 1100, background: 'radial-gradient(circle, rgba(255,250,235,0.85), transparent 62%)'}} />
      <div style={{position: 'absolute', left: -300, top: 600, width: 900, height: 900, borderRadius: 900, background: 'radial-gradient(circle, rgba(201,160,90,0.25), transparent 65%)'}} />

      {/* the two cards, in 3D */}
      <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 35%'}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateX(${(1 - m1(inR)) * -300}px) translateY(${fR}px) rotateY(${16 + Math.sin(t * 0.5) * 1.5}deg)`, transformOrigin: '270px 680px', opacity: m1(inR * 1.5)}}>
          <VCard x={60} y={300} w={410} h={729} t={t} tab="RAW" tabW={130}>
            <OffthreadVideo muted src={staticFile('clips/raw.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)'}} />
            <AbsoluteFill style={{background: '#000', opacity: rawEnd * 0.5}} />
          </VCard>
        </div>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateX(${(1 - m1(inF)) * 300}px) translateY(${fF}px) rotateY(${-10 + Math.sin(t * 0.45) * 1.5}deg)`, transformOrigin: '760px 680px', opacity: m1(inF * 1.5)}}>
          <VCard x={500} y={200} w={520} h={924} t={t} tab="FINAL" tabW={180}>
            <OffthreadVideo muted src={staticFile('clips/final.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </VCard>
        </div>
      </div>
      {/* gold tagline band */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, height: 80, background: GOLD_GRAD, display: 'grid', placeItems: 'center', transform: `scaleX(${band})`, transformOrigin: '0 50%', boxShadow: '0 12px 30px rgba(90,60,20,0.25)'}}>
        <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: '#fff', opacity: pt(t, 0.9, 1.4)}}>
          Turn your raw videos into a <b style={{fontWeight: 800}}>premium masterpiece.</b>
        </span>
      </div>

      {/* timeline */}
      <div style={{opacity: m1(tl * 1.5), transform: `translateY(${(1 - m1(tl)) * 120}px)`}}>
        <Timeline t={t} x={40} y={1270} w={1000} h={460} />
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1755, textAlign: 'center', opacity: pt(t, 0.9, 1.5), transform: `scale(${dm})`}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, letterSpacing: '0.02em', background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(120,80,20,0.25))'}}>DM NOW!</span>
      </div>

      <Audio src={staticFile('clips/final.mp4')} volume={(f) => interpolate(f, [0, 6, (CLIP - 0.4) * FPS, CLIP * FPS + 15], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};

export {lerp};
