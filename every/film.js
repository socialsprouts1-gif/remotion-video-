// Neura Chat: "Every." Kinetic-type anthem. Pure function of time: window.seek(t) paints frame t.
// 128 bpm, 64 beats (1 beat = 0.469 s). Six "Every ___. → ___." pairs, 8 beats each, every pair lands
// on a real Neura Chat screen; then the homepage headline and the end card.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, font, layout, glyph, text, fill, rrect, crop, hash01, shake, fitSize, mix } = M;

// Dashboard world: near-black + one accent, the dashboard's green.
const C = { bg: '#07090A', ink: '#F4F7F5', dim: '#8C9692', green: '#1EF08A', card: '#121614' };
const D = 'Display', UI = 'UI';

// Real screenshot crops (source px)
const SRC = {
  phone: [1172, 230, 398, 736],        // home.png: WhatsApp phone, AI assistant chat
  crm: [0, 205, 326, 180],             // dashboard.png: Inbox, WhatsApp Numbers, Leads
  follow: [0, 385, 326, 180],          // dashboard.png: Drip Campaigns, Reminders, Scheduled
  appts: [0, 505, 326, 120],           // dashboard.png: Scheduled, Appointments
  chips: [88, 878, 650, 146],          // home.png: feature chips (Bulk Campaigns top-middle)
  tile: (c, r) => [92 + c * 307, 430 + r * 211, 283, 188], // integrations-home.png tiles
};

const PAIRS = [
  { u0: 0, every: 'chat.', answer: 'Answered.', screen: 'phone', exit: 'zoom' },
  { u0: 8, every: 'lead.', answer: 'Captured.', screen: 'crm', exit: 'whip' },
  { u0: 16, every: 'follow-up.', answer: 'On time.', screen: 'follow', exit: 'split' },
  { u0: 24, every: 'booking.', answer: 'Confirmed.', screen: 'appts', exit: 'whip' },
  { u0: 32, every: 'campaign.', answer: 'Delivered.', screen: 'chips', exit: 'zoom' },
  { u0: 40, every: 'tool.', answer: 'Connected.', screen: 'tiles', exit: 'rise' },
];
const HEAD = 48, END = 56;

const HITS = [
  ...PAIRS.flatMap((p, i) => [
    [p.u0, `every ${p.every}`, i === 0 || p.u0 === 16 ? 'impact' : 'thud', i === 0 || p.u0 === 16 ? {} : { pitch: 90, to: 48 }],
    [p.u0 + 2, p.answer, 'pop', { pitch: ['E5', 'G5', 'A5', 'B5', 'D6', 'E6'][i] }],
    [p.u0 + 3.5, `${p.screen} card`, 'whoosh', { len: 0.35, from: 500, to: 3200 }],
    [p.u0 + 4, `${p.screen} lands`, 'click'],
    [p.u0 + 5, `${p.screen} detail 1`, 'tick'],
    [p.u0 + 6, `${p.screen} detail 2`, 'tick'],
    [p.u0 + 7.6, `${p.exit} out`, 'whoosh', { len: 0.3, from: 2600, to: 700 }],
  ]),
  [15, 'build to the drop', 'riser', { len: 1.8 }],
  [HEAD, 'headline 1', 'impact'],
  [HEAD + 1.5, 'headline 2', 'thud', { pitch: 80, to: 45 }],
  [HEAD + 3, 'headline 3', 'thud', { pitch: 70, to: 40 }],
  [HEAD + 4.5, 'sales machine', 'bell', { pitch: 'A5' }],
  [55, 'to end', 'swell'],
  [END, 'end card', 'impact'],
  [END + 0.5, 'logo', 'bell', { pitch: 'D6' }],
  [END + 2, 'cta', 'pop', { pitch: 'A5' }],
  [END + 3, 'url', 'blip', { pitch: 'E6' }],
];

// ---------------------------------------------------------------- stage
function stage(ctx, u) {
  fill(ctx, C.bg);
  const gx = W * (0.5 + 0.25 * Math.sin(u * 0.11)), gy = H * (0.45 + 0.12 * Math.cos(u * 0.07));
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 1.1);
  g.addColorStop(0, 'rgba(30,240,138,0.13)'); g.addColorStop(0.5, 'rgba(30,240,138,0.03)'); g.addColorStop(1, 'rgba(30,240,138,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // fine guide lines that drift: the dashboard's grid
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 2;
  const off = (u * 12) % 120;
  for (let x = -120 + off; x < W + 120; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -120 + off; y < H + 120; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // beat pulse: a faint green flash on each downbeat after the drop
  if (u >= 16 && u < END) {
    const k = Math.exp(-((u % 4) / 0.25));
    ctx.fillStyle = `rgba(30,240,138,${0.035 * k})`; ctx.fillRect(0, 0, W, H);
  }
}

// ---------------------------------------------------------------- type
/** A word whose glyphs rise out of a mask, one after another. */
function rise(ctx, str, x, y, size, u0, u, { color = C.ink, weight = 800, align = 'center', out = 1e9, outMode = 'up' } = {}) {
  const f = font(size, weight, D), track = -0.04 * size;
  const L = layout(ctx, str, f, track);
  const x0 = align === 'center' ? x - L.width / 2 : x;
  const o = E.inCubic(prog(u, out, out + 0.45));
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.0, W, size * 1.3); ctx.clip();
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * 0.035, SPRING.snappy);
    if (k <= 0) return;
    const oy = outMode === 'up' ? -o * size * 1.2 * (1 + j * 0.04) : o * size * 1.2;
    glyph(ctx, g.ch, x0 + g.cx, y + (1 - k) * size * 1.15 + oy, f, color);
  });
  ctx.restore();
  return L.width;
}

/** The answer word: each glyph flips up from its baseline (scaleY 0 → 1 with overshoot). */
function flip(ctx, str, x, y, size, u0, u, color = C.green) {
  const f = font(size, 800, D), track = -0.04 * size;
  const L = layout(ctx, str, f, track);
  const x0 = x - L.width / 2;
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * 0.04, SPRING.bouncy);
    if (k <= 0.01) return;
    glyph(ctx, g.ch, x0 + g.cx, y, f, color, 1, k);
  });
  // underline sweep
  const ul = E.outCubic(prog(u, u0 + 0.3, u0 + 1.1));
  if (ul > 0) { ctx.fillStyle = color; ctx.fillRect(x0, y + size * 0.16, L.width * ul, Math.max(4, size * 0.04)); }
}

// ---------------------------------------------------------------- screens (real crops)
function card(ctx, img, src, x, y, w, h, r = 36, light = false) {
  ctx.save();
  ctx.shadowColor = 'rgba(30,240,138,0.25)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 20;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = light ? '#fff' : C.card; ctx.fill();
  ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip();
  crop(ctx, img, src, x, y, w, h);
  ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}

function ringAt(ctx, x, y, w, h, p) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.strokeStyle = C.green; ctx.lineWidth = 7;
  ctx.shadowColor = 'rgba(30,240,138,0.8)'; ctx.shadowBlur = 24;
  const s = 1 + 0.15 * (1 - clamp(p));
  rrect(ctx, x + w / 2 - (w * s) / 2, y + h / 2 - (h * s) / 2, w * s, h * s, Math.min(30, h / 2)); ctx.stroke();
  ctx.restore();
}

function screen(ctx, P, u, IMG, top) {
  const l = u - P.u0;
  const k = springU(u, P.u0 + 3.4, SPRING.snappy);
  if (k <= 0) return;
  const dy = (1 - k) * 900;
  ctx.save(); ctx.translate(0, dy); ctx.globalAlpha = clamp(k * 1.5);
  const z = 1.06 ** prog(u, P.u0 + 3.4, P.u0 + 8); // slow log push
  M.zoomAbout(ctx, z, W / 2, top + 330);
  if (P.screen === 'phone') {
    const w = 400, h = w * SRC.phone[3] / SRC.phone[2];
    card(ctx, IMG.home, SRC.phone, (W - w) / 2, top + 70, w, h, 56, true);
  } else if (P.screen === 'crm' || P.screen === 'follow' || P.screen === 'appts') {
    const src = SRC[P.screen];
    const w = 900, h = w * src[3] / src[2];
    const x = (W - w) / 2, y = top + 140;
    card(ctx, IMG.dash, src, x, y, w, h, 44);
    const sc = w / src[2];
    const rows = P.screen === 'appts' ? [1] : P.screen === 'crm' ? [2] : [0, 1, 2];
    rows.forEach((r, j) => ringAt(ctx, x + 14, y + (28 + r * 60) * sc - 28 * sc, w - 28, 56 * sc, springU(u, P.u0 + 4.6 + j * 0.9, SPRING.bouncy)));
    if (P.screen === 'appts') {
      // a confirmation chip lands under the real menu item (type + shape, not a screen)
      const cp = springU(u, P.u0 + 5.6, SPRING.bouncy);
      if (cp > 0) {
        ctx.save(); ctx.translate(W / 2, y + h + 110); ctx.scale(cp, cp);
        rrect(ctx, -300, -52, 600, 104, 52); ctx.fillStyle = C.green; ctx.fill();
        text(ctx, 'Booked · reminder set', 0, 14, font(38, 700, UI), C.bg, 'center');
        ctx.restore();
      }
    }
    if (P.screen === 'crm') {
      // three leads drop into the Leads row
      for (let j = 0; j < 3; j++) {
        const p = springU(u, P.u0 + 5.2 + j * 0.45, SPRING.bouncy);
        if (p <= 0) continue;
        const tx = x + w - 120 - j * 70, ty = y + (28 + 2 * 60) * sc;
        const yy = lerp(ty - 420, ty, Math.min(1, p));
        ctx.beginPath(); ctx.arc(tx, yy, 30, 0, M.TAU); ctx.fillStyle = C.green; ctx.fill();
        text(ctx, '+1', tx, yy + 11, font(28, 800, UI), C.bg, 'center');
      }
    }
  } else if (P.screen === 'chips') {
    const src = SRC.chips;
    const w = 1000, h = w * src[3] / src[2];
    const x = (W - w) / 2, y = top + 160;
    card(ctx, IMG.home, src, x - 10, y - 10, w + 20, h + 20, 34, true);
    const sc = w / src[2];
    // Bulk Campaigns chip: (296..520, 882..944) in source
    const bx = x + (296 - 88) * sc, by = y + (882 - 878) * sc, bw = 226 * sc, bh = 62 * sc;
    ringAt(ctx, bx, by, bw, bh, springU(u, P.u0 + 4.4, SPRING.bouncy));
    // one message fans out to many
    const fp = prog(u, P.u0 + 5, P.u0 + 7);
    if (fp > 0) {
      const ox = bx + bw / 2, oy = by + bh;
      for (let j = 0; j < 14; j++) {
        const a = Math.PI * (0.18 + 0.64 * (j / 13));
        const len = 560 * E.outCubic(clamp(fp * 1.4 - j * 0.03));
        const ex = ox + Math.cos(a) * len * 1.2, ey = oy + Math.sin(a) * len;
        ctx.strokeStyle = 'rgba(30,240,138,0.55)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, 12, 0, M.TAU); ctx.fillStyle = C.green; ctx.fill();
      }
    }
  } else if (P.screen === 'tiles') {
    // the real integration tiles, re-stacked for portrait, one per eighth of a beat
    const order = [[0, 0], [5, 0], [3, 0], [4, 0], [2, 0], [0, 1], [4, 1], [5, 1], [1, 1], [1, 2], [2, 2], [3, 2]];
    const tw = 272, th = tw * 188 / 283, gap = 20;
    const gx = (W - (3 * tw + 2 * gap)) / 2;
    order.forEach(([c, r], j) => {
      const p = springU(u, P.u0 + 3.6 + j * 0.16, SPRING.bouncy);
      if (p <= 0) return;
      const col = j % 3, rowi = Math.floor(j / 3);
      const x = gx + col * (tw + gap), y = top + 70 + rowi * (th + gap);
      ctx.save(); ctx.translate(x + tw / 2, y + th / 2); ctx.scale(p, p); ctx.translate(-(x + tw / 2), -(y + th / 2));
      card(ctx, IMG.integ, SRC.tile(c, r), x, y, tw, th, 26, true);
      ctx.restore();
    });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- one pair
function pair(ctx, P, u, IMG, i) {
  const l = u - P.u0;
  // the type block starts centred and big, then lifts to the top when the screen arrives
  const [ty, s] = springKeys(u, [[P.u0, [930, 1]], [P.u0 + 3.3, [470, 0.62]]], SPRING.gentle);
  const nounSize = Math.min(240, fitSize(ctx, P.every, 800, D, 940, 240, -0.04)) * s;
  const ansSize = Math.min(200, fitSize(ctx, P.answer, 800, D, 960, 200, -0.04)) * s;
  rise(ctx, 'Every', 540, ty - nounSize * 0.98, 100 * s, P.u0 - 0.45, u, { color: C.dim, weight: 700 });
  rise(ctx, P.every, 540, ty, nounSize, P.u0 - 0.25, u);
  flip(ctx, P.answer, 540, ty + ansSize * 1.08, ansSize, P.u0 + 2, u);
  screen(ctx, P, u, IMG, 640);
}

// transitions out of each pair: the next pair's first frame is already there (no blank frames)
function withExit(ctx, P, u, draw) {
  const a = P.u0 + 7.55, b = P.u0 + 8;
  const p = E.inCubic(prog(u, a, b));
  ctx.save();
  if (P.exit === 'zoom') { const z = 1 * (3.2) ** p; M.zoomAbout(ctx, z, W / 2, H * 0.55); ctx.globalAlpha = 1 - p; }
  else if (P.exit === 'whip') { ctx.translate(-p * W, 0); }
  else if (P.exit === 'split') { /* handled by drawing halves */ }
  else if (P.exit === 'rise') { ctx.translate(0, -p * H); }
  if (P.exit === 'split' && p > 0) {
    // split between the type and the card; each half carries its own backdrop so the next shot shows in the gap
    const sy = 690, up = p * (sy + 40), dn = p * (H - sy + 40);
    ctx.save(); ctx.translate(0, -up); ctx.beginPath(); ctx.rect(0, 0, W, sy); ctx.clip(); stage(ctx, u); draw(); ctx.restore();
    ctx.save(); ctx.translate(0, dn); ctx.beginPath(); ctx.rect(0, sy, W, H - sy); ctx.clip(); stage(ctx, u); draw(); ctx.restore();
    ctx.fillStyle = C.green; ctx.fillRect(0, sy - 3 - up, W, 6); ctx.fillRect(0, sy - 3 + dn, W, 6);
  } else draw();
  ctx.restore();
}

// ---------------------------------------------------------------- headline + end
function headline(ctx, u) {
  const lines = [['Turn WhatsApp', C.ink], ['Into Your', C.ink], ['Sales Machine.', C.green]];
  const base = 840, lh = 190;
  lines.forEach(([str, col], i) => {
    const u0 = HEAD - 0.3 + i * 1.5;
    const size = fitSize(ctx, str, 800, D, 960, 170, -0.04);
    rise(ctx, str, 540, base + i * lh, size, u0, u, { color: col, out: 55.5 });
  });
  const tp = prog(u, HEAD + 5, HEAD + 5.8);
  if (tp > 0) {
    ctx.save(); ctx.globalAlpha = tp * (1 - prog(u, 55.5, 55.9));
    text(ctx, 'AI-POWERED WHATSAPP AUTOMATION', 540, 1400, font(30, 700, UI), C.dim, 'center', 5);
    ctx.restore();
  }
}

function endCard(ctx, u, IMG) {
  const lp = springU(u, END, SPRING.bouncy);
  const s = 0.7 + 0.3 * lp;
  const lw = 540, lh = lw * IMG.logo.height / IMG.logo.width;
  ctx.save(); ctx.translate(540, 700); ctx.scale(s, s); ctx.rotate((1 - Math.min(1, lp)) * -0.3);
  ctx.shadowColor = 'rgba(182,242,58,0.45)'; ctx.shadowBlur = 80;
  ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh);
  ctx.restore();
  // wordmark: Neura (white) Chat (green), as the dashboard sets it
  const f = font(150, 800, D);
  const L1 = layout(ctx, 'Neura ', f, -6), L2 = layout(ctx, 'Chat', f, -6);
  const x0 = 540 - (L1.width + L2.width) / 2;
  [...'Neura '].forEach((ch, j) => {
    const k = springU(u, END + 0.6 + j * 0.04, SPRING.snappy); if (k <= 0 || ch === ' ') return;
    glyph(ctx, ch, x0 + L1.glyphs[j].cx, 1140 + (1 - k) * 120, f, C.ink, 1, 1);
  });
  [...'Chat'].forEach((ch, j) => {
    const k = springU(u, END + 0.85 + j * 0.04, SPRING.snappy); if (k <= 0) return;
    glyph(ctx, ch, x0 + L1.width + L2.glyphs[j].cx, 1140 + (1 - k) * 120, f, C.green, 1, 1);
  });
  const cp = springU(u, END + 2, SPRING.bouncy);
  if (cp > 0) {
    ctx.save(); ctx.translate(540, 1320); ctx.scale(cp, cp);
    ctx.shadowColor = 'rgba(30,240,138,0.5)'; ctx.shadowBlur = 50;
    rrect(ctx, -380, -66, 760, 132, 66); ctx.fillStyle = C.green; ctx.fill();
    ctx.shadowBlur = 0;
    text(ctx, 'Start 7-day free trial', 0, 16, font(52, 800, UI), C.bg, 'center');
    // shine
    const sx = (((u - END - 2.5) * 0.7) % 2) * 900 - 500;
    ctx.save(); rrect(ctx, -380, -66, 760, 132, 66); ctx.clip();
    const g = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-380, -66, 760, 132);
    ctx.restore();
    ctx.restore();
  }
  const wp = E.outCubic(prog(u, END + 3, END + 3.8));
  if (wp > 0) {
    ctx.save(); ctx.globalAlpha = wp;
    text(ctx, 'neurachat.in', 540, 1500 + (1 - wp) * 24, font(56, 700, UI), C.ink, 'center');
    ctx.restore();
  }
}

M.film({
  fonts: [font(100, 800, D), font(100, 700, D), font(40, 700, UI), font(40, 800, UI)],
  images: { home: 'assets/shots/home.png', dash: 'assets/shots/dashboard.png', integ: 'assets/shots/integrations-home.png', logo: 'assets/logo.png' },
  hits: HITS,
  samples: 8,
  draw(ctx, u, t, IMG) {
    stage(ctx, u);
    shake(ctx, u, 0, 16, 3, 0.2);
    shake(ctx, u, 16, 22, 5, 0.22);
    shake(ctx, u, HEAD, 14, 7, 0.2);
    // later pairs first, so an exiting pair stays on top of the one coming in
    [...PAIRS].reverse().forEach((P) => {
      if (u < P.u0 - 0.5 || u >= P.u0 + 8) return;
      withExit(ctx, P, u, () => pair(ctx, P, u, IMG));
    });
    if (u >= HEAD - 0.4 && u < END) headline(ctx, u);
    if (u >= END) endCard(ctx, u, IMG);
  },
  post(ctx, u, t) {
    const rnd = M.mulberry32(Math.floor(t * 60) + 11);
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let i = 0; i < 1200; i++) ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
    // vignette
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
});
