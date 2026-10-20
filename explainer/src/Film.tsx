import React, {useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import story from './story.json';
import {ease, lerp, pt, rand} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {Badge, Bubble, Caption, ChatHeader, Desk, FeatureCard, FIcon, FONT, FPS, Headline, K, leave, LogoTile, Person, Phone, pop, Store} from './components/Kit';

type Lang = 'en' | 'hi';
const S = story.scenes as unknown as Record<string, [number, number]>;
const FEAT = story.features;
const FA = story.featureAt;

export const AUDIO = {score: 'audio/score.wav', voiceover: {en: null as string | null, hi: null as string | null}, scoreVolume: 1, duck: 0.5};

const STARS = Array.from({length: 80}, (_, i) => ({x: rand(i * 3.3) * 1080, y: rand(i * 7.7) * 1920, r: 1 + rand(i * 1.9) * 2.4}));

const in_ = (t: number, k: string, pad = 0.05) => t >= S[k][0] - pad && t < S[k][1] + pad;

export const Film: React.FC<{lang: Lang}> = ({lang}) => {
  useState(() => loadFonts());
  const t = useCurrentFrame() / FPS;
  const c = story.copy[lang];
  const night = 1 - pt(t, S.night[1] - 0.25, S.night[1] + 0.2, ease.inOut);
  const endBg = pt(t, S.end[0] - 0.2, S.end[0] + 0.4, ease.inOut);

  // headline + caption for a simple scene
  const H = (k: keyof typeof S, opts: {accent?: string; ink?: string; kicker?: string} = {}) => {
    const cc = (c as any)[k];
    return (
      <>
        <Headline t={t} at={S[k][0]} out={S[k][1]} kicker={cc.k} lines={cc.h} accent={opts.accent} ink={opts.ink} kickerColor={opts.kicker} />
        <Caption t={t} at={S[k][0]} out={S[k][1]} text={cc.c} />
      </>
    );
  };

  return (
    <AbsoluteFill style={{background: K.cream, fontFamily: FONT, overflow: 'hidden'}}>
      {/* halo */}
      <div style={{position: 'absolute', left: 540 - 560 + Math.sin(t * 0.3) * 20, top: 760 - 560, width: 1120, height: 1120, borderRadius: 1120, background: `radial-gradient(circle, ${K.halo} 55%, rgba(252,249,243,0) 71%)`}} />

      {/* ------------------------------------------------ 1 · night */}
      {night > 0 && (
        <AbsoluteFill style={{opacity: night, background: `radial-gradient(ellipse 120% 90% at 50% 30%, ${K.night2} 0%, ${K.night1} 70%)`}}>
          {STARS.map((s, i) => (
            <div key={i} style={{position: 'absolute', left: s.x, top: s.y, width: s.r, height: s.r, borderRadius: 9, background: '#fff', opacity: 0.25 + 0.5 * Math.sin(t * 1.5 + i) ** 2}} />
          ))}
          <Headline t={t} at={0.2} out={S.night[1] + 0.3} kicker={c.night.k} lines={c.night.h} accent={K.sun} ink="#fff" kickerColor="#B9C3FF" />
          {(() => {
            const p = pop(t, 0.5, 120, 14);
            const time = t < 2.3 ? '11:00' : t < 3.6 ? '11:01' : '11:02';
            return (
              <div style={{position: 'absolute', left: 540 - 240, top: 980 - 240, width: 480, height: 480, borderRadius: 480, transform: `scale(${p})`, background: `radial-gradient(circle at 40% 35%, #FFF6D6, ${K.sun} 60%, #F7D777)`, boxShadow: `0 0 120px rgba(255,233,166,0.55), 0 0 0 30px rgba(255,233,166,0.08)`, display: 'grid', placeItems: 'center'}}>
                <div style={{fontSize: 150, fontWeight: 800, color: K.ink, letterSpacing: '-0.04em'}}>{time}</div>
              </div>
            );
          })()}
          <Caption t={t} at={0.2} out={S.night[1] + 0.2} text={c.night.c} dark />
        </AbsoluteFill>
      )}

      {/* brand tile */}
      {t > S.ask[0] - 0.2 && t < S.end[0] && <LogoTile size={70} style={{position: 'absolute', left: 44, top: 44, opacity: pt(t, S.ask[0], S.ask[0] + 0.4)}} />}

      {/* ------------------------------------------------ 2–3 · ask, then the late reply (one phone) */}
      {t > S.ask[0] - 0.1 && t < S.late[1] + 0.1 && (
        <>
          {H('ask')}
          {H('late', {accent: K.red})}
          {(() => {
            const p = pop(t, S.ask[0] + 0.1, 140, 15);
            const out = leave(t, S.late[1], 0.35);
            const lock = pt(t, S.late[0] - 0.1, S.late[0] + 0.4);
            return (
              <div style={{position: 'absolute', left: 540 - 235, top: 600, transform: `translateY(${(1 - p) * 500}px) scale(${lerp(0.9, 1, out)})`, opacity: out}}>
                <Phone time={lock > 0.5 ? '10:04' : '11:02'} screen={lock > 0.5 ? '#1E2A6B' : '#EEF0F6'}>
                  <div style={{position: 'absolute', inset: 0, opacity: 1 - lock}}>
                    <ChatHeader name="Priya" sub="online" />
                    <Bubble side="in" p={pop(t, S.ask[0] + 0.8)} top={210} time="11:02 PM">
                      {c.ask.msg}
                    </Bubble>
                  </div>
                  <div style={{position: 'absolute', inset: 0, opacity: lock, background: 'linear-gradient(180deg, #2B3A8C, #1A2259)'}}>
                    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', color: '#fff', fontSize: 120, fontWeight: 300, letterSpacing: '-0.02em'}}>10:04</div>
                    <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', color: '#C9D0FF', fontSize: 24, fontWeight: 500}}>{lang === 'en' ? 'Next day' : 'Agla din'}</div>
                    {(() => {
                      const q = pop(t, S.late[0] + 0.6);
                      return (
                        <div style={{position: 'absolute', left: 22, right: 22, top: 360, padding: '18px 20px', borderRadius: 26, background: 'rgba(255,255,255,0.92)', transform: `scale(${q})`, opacity: Math.min(1, q * 1.4)}}>
                          <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: K.inkSoft}}>{lang === 'en' ? 'YOUR BUSINESS · now' : 'AAPKA BUSINESS · abhi'}</div>
                          <div style={{fontSize: 22, fontWeight: 600, color: K.ink, marginTop: 4, lineHeight: 1.35}}>{c.late.notif}</div>
                        </div>
                      );
                    })()}
                  </div>
                </Phone>
                <Badge p={pop(t, S.late[0] + 1.3, 220, 11)} text={c.late.badge} style={{left: 90, top: 780}} />
              </div>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 4 · the lead moves to a competitor */}
      {in_(t, 'lost') && (
        <>
          {H('lost', {accent: K.red})}
          {(() => {
            const o = leave(t, S.lost[1], 0.35);
            const a = pop(t, S.lost[0] + 0.1);
            const b = pop(t, S.lost[0] + 0.25);
            const chip = pop(t, S.lost[0] + 0.7, 200, 12);
            const move = pt(t, S.lost[0] + 1.6, S.lost[0] + 2.4, ease.inOut);
            const dim = pt(t, S.lost[0] + 2.3, S.lost[0] + 2.8);
            const cx = lerp(300, 780, move);
            const cy = 760 - Math.sin(move * Math.PI) * 160;
            const card = (x: number, p: number, label: string, isYou: boolean) => (
              <div style={{position: 'absolute', left: x - 200, top: 780, width: 400, height: 440, borderRadius: 40, background: '#fff', boxShadow: '0 24px 60px rgba(21,26,59,0.14)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, transform: `scale(${p})`, opacity: o * (isYou ? 1 - dim * 0.45 : 1)}}>
                {isYou ? <Store dim={dim} /> : <Store />}
                <div style={{fontSize: 34, fontWeight: 800, color: K.ink}}>{label}</div>
              </div>
            );
            return (
              <>
                {card(300, a, c.lost.you, true)}
                {card(780, b, c.lost.comp, false)}
                <div style={{position: 'absolute', left: cx - 150, top: cy, width: 300, padding: '16px 18px', borderRadius: 22, background: '#fff', boxShadow: '0 16px 40px rgba(21,26,59,0.2)', display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${chip})`, opacity: o}}>
                  <div style={{width: 54, height: 54, borderRadius: 54, background: '#FFD6E0', display: 'grid', placeItems: 'center', color: K.red, fontWeight: 800, fontSize: 24}}>P</div>
                  <div>
                    <div style={{fontSize: 24, fontWeight: 800, color: K.ink}}>Priya S.</div>
                    <div style={{fontSize: 17, fontWeight: 800, color: K.red, letterSpacing: '0.08em'}}>HOT LEAD</div>
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 5–6 · the front desk, then empty at night */}
      {t > S.desk[0] - 0.1 && t < S.three[0] + 0.6 && (
        <>
          {H('desk')}
          {H('empty', {accent: K.red})}
          {(() => {
            const p = pop(t, S.desk[0] + 0.1, 130, 15);
            const out = pt(t, S.three[0] - 0.2, S.three[0] + 0.4, ease.in);
            const lampOn = 1 - pt(t, S.empty[0] + 0.2, S.empty[0] + 0.4);
            const closed = pt(t, S.empty[0] + 0.4, S.empty[0] + 1.0, ease.inOut);
            const zzz = pt(t, S.empty[0] + 1.0, S.empty[0] + 1.4);
            const colors = ['#4F6BFF', K.red, '#14B8A6', K.violet2, '#2D3A8C', '#F59E0B'];
            return (
              <div style={{position: 'absolute', left: 160, top: 640, transform: `translateY(${(1 - p) * 300 + out * 200}px) scale(${1 - out * 0.3})`, opacity: Math.min(1, p) * (1 - out)}}>
                <Desk lampOn={lampOn} closed={closed} zzz={zzz} t={t} />
                {colors.map((col, i) => {
                  const arrive = pt(t, S.desk[0] + 1.0 + i * 0.25, S.desk[0] + 1.7 + i * 0.25, ease.out);
                  const go = pt(t, S.empty[0] + 1.3 + i * 0.18, S.empty[0] + 2.1 + i * 0.18, ease.in);
                  return <Person key={i} color={col} x={lerp(900, -40 + i * 112, arrive) + go * 700} y={720 + (i % 2) * 10} s={1.05} o={arrive * (1 - go)} />;
                })}
              </div>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 7 · three things */}
      {in_(t, 'three') && (
        <>
          {H('three')}
          {[0, 1, 2].map((i) => {
            const p = pop(t, S.three[0] + 0.4 + i * 0.3, 220, 12);
            const o = leave(t, S.three[1] + 0.1, 0.35);
            return (
              <div key={i} style={{position: 'absolute', left: 540 - 360 + i * 260 - 110, top: 880, width: 220, height: 220, borderRadius: 34, border: `5px dashed ${K.violet}`, background: 'rgba(109,59,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 120, fontWeight: 800, color: K.violet, transform: `scale(${p})`, opacity: o}}>
                {i + 1}
              </div>
            );
          })}
        </>
      )}

      {/* ------------------------------------------------ 8 · the three, stacking */}
      {t > S.features[0] - 0.1 && t < S.together[0] + 1.2 && (
        <>
          {c.features.map((f, i) => {
            const a = FA[i];
            const b = i < 2 ? FA[i + 1] : S.features[1];
            return (
              <React.Fragment key={i}>
                <Headline t={t} at={a} out={b} kicker={f.k} lines={f.h} sub={f.s} accent={FEAT[i].color} />
                <Caption t={t} at={a} out={b} text={f.c} />
              </React.Fragment>
            );
          })}
          {FEAT.map((f, i) => {
            const p = pop(t, FA[i] + 0.3, 150, 14);
            const dim = i < 2 ? pt(t, FA[i + 1], FA[i + 1] + 0.4) * (1 - pt(t, S.together[0] - 0.3, S.together[0])) : 0;
            const gather = pt(t, S.together[0], S.together[0] + 0.6, ease.inOut);
            const o = 1 - gather;
            return (
              <div key={i} style={{position: 'absolute', left: 90, top: 820 + i * 175, opacity: o, transform: `scale(${1 - gather * 0.2})`}}>
                <FeatureCard f={f} p={p} dim={dim} />
              </div>
            );
          })}
        </>
      )}

      {/* ------------------------------------------------ 9 · all three, together */}
      {in_(t, 'together') && (
        <>
          {H('together')}
          {FEAT.map((f, i) => {
            const p = pop(t, S.together[0] + 0.3 + i * 0.12, 200, 13);
            const merge = pt(t, S.together[0] + 1.3, S.together[0] + 1.8, ease.inOut);
            const x = lerp(540 + (i - 1) * 230, 540, merge);
            return (
              <div key={i} style={{position: 'absolute', left: x - 90, top: 820, width: 180, height: 180, borderRadius: 46, background: f.color, display: 'grid', placeItems: 'center', boxShadow: `0 20px 40px ${f.color}55`, transform: `scale(${p * (1 - merge * 0.6)})`, opacity: 1 - merge}}>
                <FIcon name={f.icon} color={f.color} size={88} />
              </div>
            );
          })}
          {(() => {
            const p = pop(t, S.together[0] + 1.75, 180, 12);
            const o = leave(t, S.together[1] + 0.1, 0.35);
            return (
              <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, opacity: o}}>
                <LogoTile size={260} style={{transform: `scale(${p})`}} />
                <div style={{fontSize: 96, fontWeight: 800, color: K.ink, letterSpacing: '-0.03em', opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 30}px)`}}>
                  Neura <span style={{color: K.violet}}>Chat</span>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 10 · same customer, instant reply */}
      {in_(t, 'demo') && (
        <>
          {H('demo', {accent: K.green})}
          {(() => {
            const a = S.demo[0];
            const p = pop(t, a + 0.1, 140, 15);
            const o = leave(t, S.demo[1], 0.35);
            const typing = t > a + 0.9 && t < a + 1.35;
            return (
              <div style={{position: 'absolute', left: 540 - 235, top: 600, transform: `translateY(${(1 - p) * 500}px)`, opacity: o}}>
                <Phone time="11:02">
                  <ChatHeader name={lang === 'en' ? 'Your Business' : 'Aapka Business'} sub="AI assistant · online" logo />
                  <Bubble side="in" p={pop(t, a + 0.4)} top={200} time="11:02 PM">
                    {c.ask.msg}
                  </Bubble>
                  {typing && (
                    <div style={{position: 'absolute', right: 22, top: 340, padding: '18px 24px', borderRadius: 24, background: K.ink, display: 'flex', gap: 8}}>
                      {[0, 1, 2].map((k) => (
                        <span key={k} style={{width: 11, height: 11, borderRadius: 11, background: '#fff', transform: `translateY(${-6 * Math.max(0, Math.sin(t * 10 - k))}px)`}} />
                      ))}
                    </div>
                  )}
                  <Bubble side="out" tone="brand" p={pop(t, a + 1.35)} top={340} time="11:02 PM ✓✓">
                    {c.demo.reply}
                  </Bubble>
                  <Bubble side="in" p={pop(t, a + 3.0)} top={580} time="11:03 PM">
                    {c.demo.yes}
                  </Bubble>
                  <Bubble side="out" tone="ok" p={pop(t, a + 3.9)} top={690} time="11:03 PM">
                    ✓ {c.demo.booked}
                  </Bubble>
                </Phone>
                <Badge p={pop(t, a + 1.7, 220, 11)} text={c.demo.badge} color={K.green} style={{left: 330, top: 330}} />
              </div>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 11 · how long do they wait? */}
      {in_(t, 'wait') && (
        <>
          {H('wait')}
          {(() => {
            const a = S.wait[0];
            const p = pop(t, a + 0.3, 170, 14);
            const o = leave(t, S.wait[1] + 0.1, 0.35);
            const word = 'AUTOMATE';
            const n = Math.max(0, Math.min(word.length, Math.floor((t - (a + 0.9)) / 0.12)));
            const caret = Math.floor(t * 2.5) % 2 === 0;
            return (
              <div style={{position: 'absolute', left: 90, top: 900, width: 900, opacity: o, transform: `scale(${p})`}}>
                <div style={{fontSize: 30, fontWeight: 700, color: K.inkSoft, textAlign: 'center', marginBottom: 18}}>{c.wait.label}</div>
                <div style={{height: 110, borderRadius: 60, background: '#fff', boxShadow: '0 20px 50px rgba(21,26,59,0.15)', display: 'flex', alignItems: 'center', padding: '0 20px 0 28px', gap: 20}}>
                  <div style={{width: 56, height: 56, borderRadius: 56, background: '#DCE6FF'}} />
                  <div style={{flex: 1, fontSize: 44, fontWeight: 800, color: K.violet, letterSpacing: '0.04em'}}>
                    {word.slice(0, n)}
                    {caret && <span style={{color: K.ink, fontWeight: 400}}>|</span>}
                  </div>
                  <div style={{width: 74, height: 74, borderRadius: 74, background: K.violet, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 34, fontWeight: 800}}>➤</div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ------------------------------------------------ 12 · end card */}
      {endBg > 0 && (
        <AbsoluteFill style={{opacity: endBg, background: `radial-gradient(ellipse 110% 80% at 50% 25%, ${K.violet2} 0%, ${K.violet} 35%, #2A1291 100%)`}}>
          {(() => {
            const a = S.end[0];
            const l = pop(t, a + 0.3, 150, 13);
            const name = pt(t, a + 0.6, a + 1.0);
            const pill = pop(t, a + 1.1, 180, 12);
            const cards = [
              {k: 'WEBSITE', v: 'neurachat.in'},
              {k: c.end.comment.toUpperCase(), v: '“AUTOMATE”'},
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
