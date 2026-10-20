import React, {useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import story from './story.json';
import {ease, lerp, pt} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {Caption, FONT, FPS, Headline, K, leave, LogoTile, pop} from './components/Kit';
import {Bucket, levelAt} from './components/Bucket';

type Lang = 'en' | 'hi';
const S = story.scenes as unknown as Record<string, [number, number]>;
const PA = story.patchAt;

export const AUDIO = {score: 'audio/score.wav', voiceover: {en: null as string | null, hi: null as string | null}, scoreVolume: 1, duck: 0.5};

const win = (t: number, k: string) => pt(t, S[k][0], S[k][0] + 0.4) * (1 - pt(t, S[k][1] - 0.3, S[k][1]));

export const Film: React.FC<{lang: Lang}> = ({lang}) => {
  useState(() => loadFonts());
  const t = useCurrentFrame() / FPS;
  const c = story.copy[lang];
  const endBg = pt(t, S.end[0] - 0.2, S.end[0] + 0.4, ease.inOut);

  const H = (k: string, accent?: string) => {
    const cc = (c as any)[k];
    return (
      <React.Fragment key={k}>
        <Headline t={t} at={S[k][0]} out={S[k][1]} kicker={cc.k} lines={cc.h} accent={accent} />
        <Caption t={t} at={S[k][0]} out={S[k][1]} text={cc.c} />
      </React.Fragment>
    );
  };

  // ------------------------------------------------ bucket state over time
  const leaking = pt(t, S.holes[0] + 0.5, S.holes[0] + 1.1);
  const more = win(t, 'more');
  const patched = PA.map((a) => pop(t, a + 0.5, 200, 12));
  const jets = [0, 1, 2].map(() => leaking * (1 + more * 0.6));
  const hl = ['hole1', 'hole2', 'hole3'].map((k) => win(t, k));
  const inflow =
    win(t, 'pour') * 1 + win(t, 'holes') * 1 + more * 2.2 + win(t, 'patch') * 0.8 + win(t, 'stays') * 1.2 + win(t, 'same') * 0.8;
  const faucet = 1 - 0.75 * Math.max(...hl, win(t, 'fix') * 0.6);
  const bucketIn = pop(t, 0.1, 120, 15);
  const bucketOut = pt(t, S.cta[0] - 0.3, S.cta[0] + 0.2, ease.in);
  const glow = pt(t, S.stays[0] + 2.2, S.stays[0] + 3);

  return (
    <AbsoluteFill style={{background: K.cream, fontFamily: FONT, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - 560 + Math.sin(t * 0.3) * 20, top: 760 - 560, width: 1120, height: 1120, borderRadius: 1120, background: `radial-gradient(circle, ${K.halo} 55%, rgba(252,249,243,0) 71%)`}} />
      {t < S.end[0] && <LogoTile size={70} style={{position: 'absolute', left: 44, top: 44}} />}

      {/* the bucket (persistent) */}
      {bucketOut < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - bucketOut, transform: `translateY(${(1 - bucketIn) * 600 + bucketOut * 120}px)`}}>
          <Bucket
            t={t}
            level={levelAt(t, S)}
            jets={jets}
            flow={inflow}
            highlight={hl}
            patched={patched}
            patchTags={c.patches.map((p) => p.tag)}
            holeLabels={[c.hole1.label, c.hole2.label, c.hole3.label]}
            faucet={faucet}
            ads={pop(t, S.more[0] + 0.3, 220, 11) * (1 - pt(t, S.more[1] - 0.3, S.more[1]))}
            glow={glow * (1 - bucketOut)}
            puddle={pt(t, S.holes[0] + 0.8, S.more[1], ease.soft) * (1 - pt(t, S.stays[0], S.stays[0] + 1.5))}
          />
        </div>
      )}

      {/* scene text */}
      {H('pour', K.green)}
      {H('holes', K.red)}
      {H('hole1', K.red)}
      {H('hole2', K.red)}
      {H('hole3', K.red)}
      {H('more', K.orange)}
      {H('fix', K.violet)}
      {c.patches.map((p, i) => {
        const a = PA[i];
        const b = i < 2 ? PA[i + 1] : S.patch[1];
        return (
          <React.Fragment key={i}>
            <Headline t={t} at={a} out={b} kicker={p.k} lines={p.h} accent={K.violet} />
            <Caption t={t} at={a} out={b} text={p.c} />
          </React.Fragment>
        );
      })}
      {H('stays', K.green)}
      {H('same', K.green)}
      {H('cta', K.violet)}

      {/* ------------------------------------------------ hole 1: unanswered */}
      {hl[0] > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: hl[0]}}>
          <div style={{position: 'relative', transform: `scale(${pop(t, S.hole1[0] + 0.3)})`}}>
            <div style={{padding: '22px 30px', borderRadius: 30, borderBottomLeftRadius: 8, background: '#fff', boxShadow: '0 16px 40px rgba(21,26,59,0.15)', fontSize: 40, fontWeight: 700, color: K.ink}}>
              {c.hole1.chat}
              <div style={{fontSize: 22, color: K.inkSoft, textAlign: 'right', marginTop: 6}}>✓✓ seen</div>
            </div>
            <div style={{position: 'absolute', right: -40, top: -36, padding: '10px 18px', borderRadius: 999, background: K.red, color: '#fff', fontSize: 28, fontWeight: 800, transform: `scale(${pop(t, S.hole1[0] + 1.0, 220, 11)}) rotate(6deg)`}}>⏱ {c.hole1.wait}</div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ hole 2: the forgotten note */}
      {hl[1] > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: hl[1]}}>
          <div style={{position: 'relative', width: 520, height: 260, background: '#FFE97A', borderRadius: 10, boxShadow: '0 18px 36px rgba(0,0,0,0.15)', transform: `rotate(-4deg) scale(${pop(t, S.hole2[0] + 0.3)})`, padding: '40px 36px'}}>
            <div style={{position: 'absolute', left: '50%', top: -18, width: 120, height: 36, marginLeft: -60, background: 'rgba(255,255,255,0.6)', transform: 'rotate(3deg)'}} />
            <div style={{fontSize: 42, fontWeight: 700, color: '#5B4A00', fontStyle: 'italic', lineHeight: 1.25}}>{c.hole2.note}</div>
            <div style={{position: 'absolute', left: 30, top: 118, height: 6, width: `${pt(t, S.hole2[0] + 1.0, S.hole2[0] + 1.5) * 460}px`, background: K.red, borderRadius: 6}} />
            <div style={{position: 'absolute', right: 26, bottom: 18, padding: '6px 16px', border: `4px solid ${K.red}`, borderRadius: 10, color: K.red, fontSize: 30, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', transform: `rotate(-10deg) scale(${pop(t, S.hole2[0] + 1.6, 260, 10)})`}}>{c.hole2.miss}</div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ hole 3: buried in chats */}
      {hl[2] > 0 && (
        <div style={{position: 'absolute', left: 190, top: 530, width: 700, height: 330, overflow: 'hidden', opacity: hl[2], borderRadius: 30, background: '#fff', boxShadow: '0 16px 40px rgba(21,26,59,0.12)'}}>
          {Array.from({length: 9}).map((_, i) => {
            const push = pt(t, S.hole3[0] + 1.0, S.hole3[0] + 2.4, ease.inOut) * 300;
            const hot = i === 1;
            return (
              <div key={i} style={{position: 'absolute', left: 20, right: 20, top: 20 + i * 92 + (hot ? push : i > 1 ? 0 : 0) - (i > 1 ? 0 : 0), height: 76, display: 'flex', alignItems: 'center', gap: 16, padding: '0 14px', borderRadius: 18, background: hot ? '#FFEFF3' : '#F4F5FA', transform: `translateY(${i === 0 ? 0 : 0}px)`, opacity: hot ? 1 - pt(t, S.hole3[0] + 1.8, S.hole3[0] + 2.6) * 0.75 : 1, zIndex: hot ? 0 : 1}}>
                <div style={{width: 52, height: 52, borderRadius: 52, background: hot ? '#FFD6E0' : ['#DCE6FF', '#E5DCFF', '#D7F5E3', '#FFE9C7'][i % 4]}} />
                {hot ? (
                  <div style={{fontSize: 26, fontWeight: 800, color: K.red, letterSpacing: '0.04em'}}>{c.hole3.hot}</div>
                ) : (
                  <div style={{flex: 1}}>
                    <div style={{height: 12, width: `${60 - (i % 3) * 12}%`, borderRadius: 6, background: '#C9CEE3'}} />
                    <div style={{height: 10, width: `${40 + (i % 2) * 15}%`, borderRadius: 6, background: '#E0E3EE', marginTop: 10}} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------ fix: the tool arrives */}
      {win(t, 'fix') > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: win(t, 'fix')}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${pop(t, S.fix[0] + 0.4, 160, 12)})`, padding: '22px 36px 22px 22px', borderRadius: 40, background: '#fff', boxShadow: '0 20px 50px rgba(21,26,59,0.16)'}}>
            <LogoTile size={130} />
            <div style={{fontSize: 64, fontWeight: 800, color: K.ink, letterSpacing: '-0.02em'}}>
              Neura <span style={{color: K.violet}}>Chat</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ stays: results float up out of the bucket */}
      {(win(t, 'stays') > 0 || win(t, 'same') > 0) &&
        c.stays.chips.map((chip, i) => {
          const a = S.stays[0] + 2.4 + i * 0.35;
          const p = pt(t, a, a + 0.9, ease.out);
          const o = pt(t, a, a + 0.3) * (1 - pt(t, S.same[1] - 0.3, S.same[1]));
          const x = 540 + (i - 1) * 300;
          return (
            <div key={i} style={{position: 'absolute', left: x - 135, top: lerp(1000, 620 + (i % 2) * 90, p), width: 270, padding: '18px 0', borderRadius: 24, background: K.green, color: '#fff', textAlign: 'center', fontSize: 34, fontWeight: 800, opacity: o, boxShadow: '0 14px 30px rgba(19,176,91,0.35)', transform: `scale(${lerp(0.6, 1, p)})`}}>
              ✓ {chip}
            </div>
          );
        })}

      {/* ------------------------------------------------ cta */}
      {win(t, 'cta') > 0 &&
        (() => {
          const a = S.cta[0];
          const word = 'LEAK';
          const n = Math.max(0, Math.min(word.length, Math.floor((t - (a + 0.9)) / 0.16)));
          const caret = Math.floor(t * 2.5) % 2 === 0;
          return (
            <div style={{position: 'absolute', left: 90, top: 900, width: 900, opacity: leave(t, S.cta[1] + 0.1, 0.35), transform: `scale(${pop(t, a + 0.3, 170, 14)})`}}>
              <div style={{fontSize: 30, fontWeight: 700, color: K.inkSoft, textAlign: 'center', marginBottom: 18}}>{c.cta.label}</div>
              <div style={{height: 110, borderRadius: 60, background: '#fff', boxShadow: '0 20px 50px rgba(21,26,59,0.15)', display: 'flex', alignItems: 'center', padding: '0 20px 0 28px', gap: 20}}>
                <div style={{width: 56, height: 56, borderRadius: 56, background: '#DCE6FF'}} />
                <div style={{flex: 1, fontSize: 48, fontWeight: 800, color: K.violet, letterSpacing: '0.06em'}}>
                  {word.slice(0, n)}
                  {caret && <span style={{color: K.ink, fontWeight: 400}}>|</span>}
                </div>
                <div style={{width: 74, height: 74, borderRadius: 74, background: K.violet, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 34, fontWeight: 800}}>➤</div>
              </div>
            </div>
          );
        })()}

      {/* ------------------------------------------------ end card */}
      {endBg > 0 && (
        <AbsoluteFill style={{opacity: endBg, background: `radial-gradient(ellipse 110% 80% at 50% 25%, ${K.violet2} 0%, ${K.violet} 35%, #2A1291 100%)`}}>
          {(() => {
            const a = S.end[0];
            const l = pop(t, a + 0.3, 150, 13);
            const name = pt(t, a + 0.6, a + 1.0);
            const pill = pop(t, a + 1.1, 180, 12);
            const cards = [
              {k: 'WEBSITE', v: 'neurachat.in'},
              {k: c.end.comment.toUpperCase(), v: '“LEAK”'},
            ];
            return (
              <>
                <div style={{position: 'absolute', left: 0, right: 0, top: 280, display: 'flex', justifyContent: 'center'}}>
                  <LogoTile size={230} style={{transform: `scale(${l})`, boxShadow: '0 30px 70px rgba(0,0,0,0.35)'}} />
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: name, transform: `translateY(${(1 - name) * 24}px)`}}>
                  <div style={{fontSize: 110, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em'}}>
                    Neura <span style={{color: '#C2FF3D'}}>Chat</span>
                  </div>
                  <div style={{fontSize: 34, fontWeight: 600, color: '#DCD3FF', marginTop: -6}}>{c.end.tag}</div>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center'}}>
                  <div style={{padding: '24px 48px', borderRadius: 999, background: '#fff', color: K.violet, fontSize: 40, fontWeight: 800, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', transform: `scale(${pill})`}}>{c.end.pill} →</div>
                </div>
                {cards.map((cd, i) => {
                  const q = pop(t, a + 1.6 + i * 0.2, 170, 14);
                  return (
                    <div key={i} style={{position: 'absolute', left: 190, top: 1010 + i * 150, width: 700, height: 120, borderRadius: 28, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', transform: `translateY(${(1 - q) * 40}px)`, opacity: Math.min(1, q * 1.3)}}>
                      <div style={{width: 64, height: 64, borderRadius: 18, background: i ? K.green : '#fff', display: 'grid', placeItems: 'center', fontSize: 32, color: i ? '#fff' : K.violet, fontWeight: 800}}>{i ? '✎' : '⌂'}</div>
                      <div>
                        <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: '#CFC4FF'}}>{cd.k}</div>
                        <div style={{fontSize: 40, fontWeight: 800, color: '#fff'}}>{cd.v}</div>
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </AbsoluteFill>
      )}

      <Audio src={staticFile(AUDIO.score)} volume={AUDIO.scoreVolume * (AUDIO.voiceover[lang] ? AUDIO.duck : 1)} />
      {AUDIO.voiceover[lang] && <Audio src={staticFile(AUDIO.voiceover[lang]!)} />}
    </AbsoluteFill>
  );
};
