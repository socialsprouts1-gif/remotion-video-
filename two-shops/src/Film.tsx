import React, {useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import story from './story.json';
import {ease, lerp, pt} from './lib/anim';
import {loadFonts} from './lib/fonts';
import {Caption, FeatureCard, FONT, FPS, Headline, K, leave, LogoTile, pop, Store} from './components/Kit';

type Lang = 'en' | 'hi';
const S = story.scenes as unknown as Record<string, [number, number]>;
const DA = story.dayAt;
const FA = story.featureAt;
const LEADS = story.leads;
const RAJU = story.rajuReplies;
const AMIT0 = story.amitStart;

export const AUDIO = {score: 'audio/score.wav', voiceover: {en: null as string | null, hi: null as string | null}, scoreVolume: 1, duck: 0.5};

const win = (t: number, a: number, b: number) => pt(t, a, a + 0.4) * (1 - pt(t, b - 0.3, b));

/** When each customer message gets an answer, per shop. */
export const replyTimes = (side: 0 | 1) =>
  LEADS.map((l, i) => (side === 0 ? RAJU[i] ?? Infinity : l < AMIT0 ? AMIT0 + i * 0.14 : l + 0.6));

const CUSTOMER_LINES = ['Price?', 'Available?', 'Details please', 'Is it in stock?', 'Delivery time?', 'Can I book?', 'Hello?', 'Any offers?', 'Open today?', 'Size M?', 'Call me?', 'Still there?', 'Book for tomorrow?'];
const REPLY_LINES = ['Here you go ✓', 'Yes, in stock ✓', 'Sent details ✓', 'Yes ✓', '2 days ✓', 'Booked ✓', 'Hi! ✓', '10% today ✓', 'Till 9 PM ✓', 'Available ✓', 'Calling at 4 ✓', 'Here ✓', 'Booked 11 AM ✓'];

const Column: React.FC<{t: number; side: 0 | 1; name: string; focus: number; status?: string; statusO: number; night: number; week: number; label: string}> = ({t, side, name, focus, status, statusO, night, week, label}) => {
  const cx = side === 0 ? 270 : 810;
  const replies = replyTimes(side);
  // chronological chat rows
  const rows: {at: number; out: boolean; text: string}[] = [];
  LEADS.forEach((l, i) => {
    if (t >= l) rows.push({at: l, out: false, text: CUSTOMER_LINES[i]});
    if (t >= replies[i]) rows.push({at: replies[i], out: true, text: REPLY_LINES[i]});
  });
  rows.sort((a, b) => a.at - b.at);
  const unread = LEADS.filter((l, i) => t >= l && t < replies[i]).length;
  const ROW = 64;
  const visible = 7;
  const scrollTarget = Math.max(0, rows.length - visible);
  // smooth scroll: ease the offset toward the latest row
  const lastAt = rows.length ? rows[rows.length - 1].at : 0;
  const scroll = Math.max(0, scrollTarget - 1 + pt(t, lastAt, lastAt + 0.3));
  const closed = side === 0 ? pt(t, DA[2] + 0.3, DA[2] + 0.8) : 0;
  const lit = side === 1 ? night : 0;
  const appear = pop(t, 0.2 + side * 0.15, 140, 14);
  const out = pt(t, S.reply[1] - 0.3, S.reply[1] + 0.1, ease.in);
  const filled = side === 0 ? [1, 4] : [0, 1, 2, 3, 4, 5];

  return (
    <div style={{position: 'absolute', left: cx - 240, top: 470, width: 480, height: 1100, opacity: (0.3 + 0.7 * focus) * (1 - out), transform: `translateY(${(1 - appear) * 400}px)`, fontFamily: FONT}}>
      {/* storefront */}
      <div style={{position: 'absolute', left: 240 - 105, top: 0, transform: 'scale(1.9)', transformOrigin: '50% 0%'}}>
        <Store dim={closed} />
      </div>
      {lit > 0 && <div style={{position: 'absolute', left: 60, top: -40, width: 360, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,233,166,${0.55 * lit}), transparent 65%)`}} />}
      {closed > 0 && (
        <div style={{position: 'absolute', left: 240 - 70, top: 110, padding: '6px 14px', borderRadius: 10, background: K.red, color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '0.1em', transform: `scale(${pop(t, DA[2] + 0.4, 220, 11)}) rotate(-6deg)`}}>CLOSED</div>
      )}
      {/* name */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 10px', borderRadius: 999, background: '#fff', boxShadow: '0 8px 22px rgba(21,26,59,0.12)'}}>
          <div style={{width: 44, height: 44, borderRadius: 44, background: side ? '#E5DCFF' : '#FFE1C2', display: 'grid', placeItems: 'center', fontWeight: 800, color: side ? K.violet : K.orange, fontSize: 22}}>{side ? 'A' : 'R'}</div>
          <span style={{fontSize: 30, fontWeight: 800, color: K.ink, whiteSpace: 'nowrap'}}>{name}</span>
        </div>
      </div>
      {/* chat card */}
      <div style={{position: 'absolute', left: 30, top: 290, width: 420, height: 560, borderRadius: 36, background: '#fff', boxShadow: '0 20px 50px rgba(21,26,59,0.14)', overflow: 'hidden', border: side && focus > 0.9 && t > AMIT0 ? `3px solid ${K.violet}55` : '3px solid transparent'}}>
        <div style={{height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', background: '#F4F5FA', borderBottom: '1px solid #E3E5EE'}}>
          <span style={{fontSize: 24, fontWeight: 800, color: K.ink}}>WhatsApp</span>
          {side === 1 && t >= AMIT0 ? (
            <span style={{padding: '6px 14px', borderRadius: 999, background: K.violet, color: '#fff', fontSize: 18, fontWeight: 800}}>AI ON</span>
          ) : unread > 0 ? (
            <span style={{minWidth: 40, padding: '6px 12px', borderRadius: 999, background: K.red, color: '#fff', fontSize: 20, fontWeight: 800, textAlign: 'center'}}>{unread}</span>
          ) : null}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 86, height: 7 * 64 + 6, overflow: 'hidden', opacity: 1 - week}}>
          {rows.map((r, i) => {
            const y = (i - scroll) * ROW;
            if (y < -ROW || y > ROW * visible) return null;
            const p = pop(t, r.at, 220, 14);
            return (
              <div key={i} style={{position: 'absolute', top: y, [r.out ? 'right' : 'left']: 16, padding: '10px 16px', borderRadius: 18, background: r.out ? (side ? K.violet : K.ink) : '#EEF0F6', color: r.out ? '#fff' : K.ink, fontSize: 21, fontWeight: 700, whiteSpace: 'nowrap', transform: `scale(${p})`, transformOrigin: r.out ? '100% 50%' : '0% 50%'}}>
                {r.text}
              </div>
            );
          })}
        </div>
        {/* the week, as a booking calendar */}
        {week > 0 && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 96, opacity: week, textAlign: 'center'}}>
            <div style={{fontSize: 22, fontWeight: 700, color: K.inkSoft, marginBottom: 18}}>{label}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', padding: '0 30px'}}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                const on = filled.includes(i);
                const q = on ? pop(t, S.week[0] + 0.5 + filled.indexOf(i) * 0.18, 220, 12) : 0;
                return (
                  <div key={i} style={{width: 98, height: 108, borderRadius: 20, border: `3px solid ${on ? K.green : '#E0E3EE'}`, background: on ? `rgba(19,176,91,${0.12 * q})` : '#FAFAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4}}>
                    <span style={{fontSize: 20, fontWeight: 700, color: K.inkSoft}}>{d}</span>
                    <span style={{fontSize: 36, fontWeight: 800, color: K.green, transform: `scale(${q})`}}>✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {night > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(11,26,77,${0.12 * night})`, pointerEvents: 'none'}} />}
      </div>
      {/* status chip */}
      {status && statusO > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center', opacity: statusO}}>
          <div style={{padding: '12px 20px', borderRadius: 18, background: side ? K.green : K.red, color: '#fff', fontSize: 24, fontWeight: 800, whiteSpace: 'nowrap', transform: `scale(${Math.min(1, statusO * 1.2)})`}}>{status}</div>
        </div>
      )}
    </div>
  );
};

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

  const focusRaju = 1 - 0.7 * win(t, S.amit[0], S.amit[1]);
  const focusAmit = 1 - 0.7 * win(t, S.raju[0], S.raju[1]);
  const beat = DA.reduce((k, a, i) => (t >= a ? i : k), -1);
  const dayO = win(t, S.day[0], S.day[1]);
  const night = pt(t, DA[2], DA[2] + 0.6) * (1 - pt(t, S.week[0], S.week[0] + 0.5));
  const week = pt(t, S.week[0], S.week[0] + 0.5) * (1 - pt(t, S.diff[0] + 0.2, S.diff[0] + 0.7));
  const statusFor = (side: 0 | 1) => (beat >= 0 && dayO > 0 ? (side ? c.day[beat].r : c.day[beat].l) : undefined);
  const statusO = beat >= 0 ? pt(t, DA[beat] + 0.5, DA[beat] + 0.8) * (1 - pt(t, (DA[beat + 1] ?? S.day[1]) - 0.25, DA[beat + 1] ?? S.day[1])) : 0;
  const replyGlow = win(t, S.reply[0], S.reply[1]);

  return (
    <AbsoluteFill style={{background: K.cream, fontFamily: FONT, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - 560 + Math.sin(t * 0.3) * 20, top: 760 - 560, width: 1120, height: 1120, borderRadius: 1120, background: `radial-gradient(circle, ${K.halo} 55%, rgba(252,249,243,0) 71%)`}} />
      {night > 0 && <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(11,26,77,${0.22 * night}), rgba(11,26,77,${0.06 * night}))`}} />}
      {t < S.end[0] && <LogoTile size={70} style={{position: 'absolute', left: 44, top: 44}} />}

      {/* the two shops */}
      {t < S.reply[1] + 0.2 && (
        <>
          <div style={{position: 'absolute', left: 538, top: 520, width: 4, height: 1000, borderRadius: 4, background: 'repeating-linear-gradient(180deg, #D8D2C6 0 18px, transparent 18px 34px)', opacity: 1 - pt(t, S.reply[1] - 0.3, S.reply[1])}} />
          <Column t={t} side={0} name={c.names[0]} focus={focusRaju * (1 - 0.6 * replyGlow)} status={statusFor(0)} statusO={statusO} night={night} week={week} label={c.week.label} />
          <Column t={t} side={1} name={c.names[1]} focus={focusAmit} status={statusFor(1)} statusO={statusO} night={night} week={week} label={c.week.label} />
          {replyGlow > 0 && <div style={{position: 'absolute', left: 560, top: 740, width: 500, height: 640, borderRadius: 48, border: `5px solid ${K.violet}`, boxShadow: `0 0 50px rgba(109,59,255,0.35)`, opacity: replyGlow, transform: `scale(${lerp(1.06, 1, replyGlow)})`}} />}
        </>
      )}

      {H('intro', K.violet)}
      {H('same', K.violet)}
      {H('raju', K.red)}
      {H('amit', K.violet)}
      {c.day.map((d, i) => {
        const a = DA[i];
        const b = DA[i + 1] ?? S.day[1];
        return (
          <React.Fragment key={i}>
            <Headline t={t} at={a} out={b} kicker={lang === 'en' ? 'Same day,' : 'Wahi din,'} lines={[`*${d.time}*`]} accent={i === 2 ? K.night2 : K.orange} />
            <Caption t={t} at={a} out={b} text={d.c} />
          </React.Fragment>
        );
      })}
      {H('week', K.green)}
      {H('diff', K.red)}
      {H('reply', K.violet)}

      {/* what Amit's Neura Chat does */}
      {t > S.features[0] - 0.1 && t < S.features[1] + 0.1 && (
        <>
          {c.features.map((f, i) => {
            const a = FA[i];
            const b = i < 2 ? FA[i + 1] : S.features[1];
            return (
              <React.Fragment key={i}>
                <Headline t={t} at={a} out={b} kicker={f.k} lines={f.h} accent={story.features[i].color} />
                <Caption t={t} at={a} out={b} text={f.c} />
              </React.Fragment>
            );
          })}
          {story.features.map((f, i) => {
            const p = pop(t, FA[i] + 0.3, 150, 14);
            const dim = i < 2 ? pt(t, FA[i + 1], FA[i + 1] + 0.4) : 0;
            return (
              <div key={i} style={{position: 'absolute', left: 90, top: 760 + i * 175, opacity: leave(t, S.features[1], 0.35)}}>
                <FeatureCard f={f} p={p} dim={dim} />
              </div>
            );
          })}
        </>
      )}

      {/* cta */}
      {H('cta', K.violet)}
      {t > S.cta[0] && t < S.cta[1] + 0.1 &&
        (() => {
          const a = S.cta[0];
          const word = 'AMIT';
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

      {/* end card */}
      {endBg > 0 && (
        <AbsoluteFill style={{opacity: endBg, background: `radial-gradient(ellipse 110% 80% at 50% 25%, ${K.violet2} 0%, ${K.violet} 35%, #2A1291 100%)`}}>
          {(() => {
            const a = S.end[0];
            const l = pop(t, a + 0.3, 150, 13);
            const name = pt(t, a + 0.6, a + 1.0);
            const pill = pop(t, a + 1.1, 180, 12);
            const cards = [
              {k: 'WEBSITE', v: 'neurachat.in'},
              {k: c.end.comment.toUpperCase(), v: '“AMIT”'},
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
