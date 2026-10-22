// Neura Chat: Inbox Zero. Pure function of time: window.seek(t) paints frame t (lib/motion.js).
// Timing in beats (u) on beats.json (120 bpm, 1 beat = 0.5 s). Plan: docs/shotlist.md.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, font, layout, glyph, text, fill, rrect, cover, crop, hash01, shake, bump, mix } = M;

// Website palette. One accent: Neura violet. WhatsApp green only on the unread badge.
const C = { paper: '#F5F2FF', ink: '#15112A', violet: '#6A3DF0', grey: '#6E6A85', line: '#E6E0FA', card: '#FFFFFF', wa: '#25D366' };
const D = 'Display', UI = 'UI';

// ---------------------------------------------------------------- data
const PEOPLE = [
  ['Priya Sharma', 'Price kya hai?'], ['Rahul Mehta', 'Available today?'], ['Anjali', 'Details bhejiye please'], ['Vikram', 'Demo mil sakta hai?'],
  ['Sneha K.', 'Location share karo'], ['Arjun', 'Booking karni hai'], ['Neha Gupta', 'COD available hai?'], ['Rohit', 'Size M milega?'],
  ['Kavya', 'Discount hai kya?'], ['Aman Verma', 'Timings kya hain?'], ['Pooja', 'Order status?'], ['Karan', 'Hi'],
  ['Meera', 'Catalogue bhejo'], ['Siddharth', 'Kal aa sakte ho?'], ['Riya', 'Payment link?'], ['Dev', 'Interested hoon'],
  ['Isha', 'Still available?'], ['Nikhil', 'Bulk order?'], ['Tanvi', 'Reply please'], ['Yash', 'Hello??'],
  ['Simran', 'Price?'], ['Aditya', 'Call kar sakte ho?'], ['Zoya', 'Kitne din mein delivery?'], ['Harsh', 'Ok waiting'],
  ['Nisha', 'Fees kitni hai?'], ['Kabir', 'Appointment chahiye'], ['Tara', 'Shop open hai?'], ['Varun', 'Details?'],
];
const AV = ['#F6C9D8', '#C9D8F6', '#D6C9F6', '#F6E3C9', '#C9F0E1', '#F2D0C4', '#D9E8C4', '#E0D2F7'];

// ---------------------------------------------------------------- timing (beats)
const T = { pile: 4, overflow: 12, on: 16, clear: 20, zero: 36, proof: 44, proof2: 48, end: 52 };
const ARRIVE = Array.from({ length: 16 }, (_, i) => T.pile + i * 0.5);            // S2 rows
const FALL = Array.from({ length: 12 }, (_, i) => T.overflow + 0.1 + i * 0.28);    // S3 extra rows
const NCLEAR = 24;
const CLEAR = Array.from({ length: NCLEAR }, (_, k) => 20.6 + 14.6 * (k / (NCLEAR - 1)) ** 0.72); // accelerating
const CUTS = [
  { a: 24, b: 26, label: 'AI Chatbots' },
  { a: 28, b: 30, label: 'CRM Built-in' },
  { a: 32, b: 34, label: 'Auto Follow-ups' },
];

// unread count as a pure function of u
function count(u) {
  if (u < T.pile) return 12 + Math.max(0, Math.floor(u));
  if (u < T.overflow) return 15 + Math.round(32 * ARRIVE.filter((a) => u >= a).length / ARRIVE.length);
  if (u < T.on) return Math.round(lerp(47, 99, E.inCubic(prog(u, T.overflow, 15.4))));
  if (u < T.clear) return 99;
  if (u < T.zero) {
    const p = prog(u, 20.6, 35.3);
    return Math.max(1, Math.round(99 * (1 - p ** 1.35)));
  }
  return 0;
}
const label = (n) => (n >= 99 ? '99+' : String(n));
// beat of the most recent change of the counter (for the pop on each change)
function lastChange(u) {
  const now = count(u);
  for (let d = 0; d < 1.5; d += 0.02) if (count(u - d) !== now) return u - d;
  return -99;
}

const HITS = [
  [0, 'badge slams', 'impact'],
  [1, 'tick 13', 'tick'], [2, 'tick 14', 'tick'], [3, 'tick 15', 'tick'],
  ...ARRIVE.map((a, i) => [a, `row ${i + 1}`, 'pop', { pitch: ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'][i % 6] }]),
  [8, 'phone buzz', 'thud', { pitch: 70, to: 45 }],
  ...FALL.filter((_, i) => i % 2 === 0).map((a, i) => [a + 0.5, `pile ${i}`, 'thud', { pitch: 90 - i * 4, to: 50 }]),
  [16, 'Neura Chat on', 'riser', { len: 1.6 }],
  [16, 'drop', 'impact'],
  [20, 'phone out, list in', 'whoosh', { len: 0.5, from: 500, to: 3000 }],
  ...CLEAR.map((c, k) => [c, `reply ${k + 1}`, 'click']),
  ...CLEAR.filter((_, k) => k % 3 === 0).map((c, k) => [c + 0.3, `swipe ${k}`, 'whoosh', { len: 0.25, from: 2500, to: 900 }]),
  ...CUTS.flatMap((c) => [[c.a, `cut ${c.label}`, 'whoosh', { len: 0.4, from: 400, to: 2600 }], [c.a + 0.5, `${c.label} label`, 'blip', { pitch: 'E6' }]]),
  [36, 'zero', 'impact'],
  [36.5, 'inbox zero', 'bell', { pitch: 'C6' }],
  [37, 'inbox zero 2', 'bell', { pitch: 'G6' }],
  [44, 'proof', 'thud', { pitch: 80, to: 50 }],
  [48, 'headline', 'whoosh', { len: 0.5 }],
  [48.5, 'headline lands', 'thud'],
  [52, 'end card', 'impact'],
  [53, 'logo', 'bell', { pitch: 'D6' }],
  [54, 'cta', 'pop', { pitch: 'A5' }],
];

// ---------------------------------------------------------------- drawing helpers
function bg(ctx, u, tint = 0) {
  fill(ctx, C.paper);
  // two slow glows like the website hero (violet + rose)
  const g1 = ctx.createRadialGradient(W * (0.2 + 0.05 * Math.sin(u * 0.15)), H * 0.18, 0, W * 0.2, H * 0.18, W * 0.9);
  g1.addColorStop(0, `rgba(122,82,255,${0.16 + tint * 0.1})`); g1.addColorStop(1, 'rgba(122,82,255,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.9, H * (0.8 + 0.03 * Math.cos(u * 0.12)), 0, W * 0.9, H * 0.8, W * 0.9);
  g2.addColorStop(0, 'rgba(236,120,200,0.14)'); g2.addColorStop(1, 'rgba(236,120,200,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  // dot grid
  ctx.fillStyle = 'rgba(21,17,42,0.06)';
  for (let y = 30; y < H; y += 60) for (let x = 30; x < W; x += 60) ctx.fillRect(x, y, 3, 3);
}

function checkPath(ctx, x, y, s, p, color, lw) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = [[-0.45, 0.02], [-0.12, 0.34], [0.48, -0.32]];
  const l1 = Math.hypot(0.33, 0.32), l2 = Math.hypot(0.6, 0.66), L = (l1 + l2) * p;
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (L <= l1) { const k = L / l1; ctx.lineTo(x + lerp(pts[0][0], pts[1][0], k) * s, y + lerp(pts[0][1], pts[1][1], k) * s); }
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const k = (L - l1) / l2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], k) * s, y + lerp(pts[1][1], pts[2][1], k) * s); }
  ctx.stroke(); ctx.restore();
}

function shadowCard(ctx, x, y, w, h, r, color = C.card, sh = 0.12) {
  ctx.save();
  ctx.shadowColor = `rgba(40,20,110,${sh})`; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

const ROW_H = 132;
/** One generic inbox row (type + shapes). replied 0..1 shows the violet "Replied" stamp. */
function row(ctx, i, x, y, w, { alpha = 1, rot = 0, replied = 0, unread = true } = {}) {
  const [name, msg] = PEOPLE[i % PEOPLE.length];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + ROW_H / 2); ctx.rotate(rot); ctx.translate(-w / 2, -ROW_H / 2);
  shadowCard(ctx, 0, 6, w, ROW_H - 12, 30, C.card, 0.08);
  ctx.beginPath(); ctx.arc(70, ROW_H / 2, 40, 0, M.TAU); ctx.fillStyle = AV[i % AV.length]; ctx.fill();
  text(ctx, name[0], 70, ROW_H / 2 + 15, font(40, 700, UI), C.ink, 'center');
  text(ctx, name, 132, 56, font(36, 650, UI), C.ink);
  text(ctx, msg, 132, 100, font(32, 450, UI), C.grey);
  if (replied > 0) {
    const p = clamp(replied);
    const pw = 210, px = w - pw - 26, py = ROW_H / 2 - 32;
    ctx.save(); ctx.translate(px + pw / 2, py + 32); const s = 0.6 + 0.4 * E.outBack(p, 2.4); ctx.scale(s, s); ctx.translate(-(px + pw / 2), -(py + 32));
    ctx.globalAlpha *= clamp(p * 3);
    rrect(ctx, px, py, pw, 64, 32); ctx.fillStyle = C.violet; ctx.fill();
    checkPath(ctx, px + 38, py + 32, 30, clamp(p * 1.6), '#fff', 6);
    text(ctx, 'Replied', px + 64, py + 43, font(30, 700, UI), '#fff');
    ctx.restore();
  } else if (unread) {
    text(ctx, '2:1' + (i % 10), w - 40, 52, font(24, 500, UI), C.wa, 'right');
    ctx.beginPath(); ctx.arc(w - 58, 92, 20, 0, M.TAU); ctx.fillStyle = C.wa; ctx.fill();
    text(ctx, String(1 + (i % 4)), w - 58, 101, font(24, 700, UI), '#fff', 'center');
  }
  ctx.restore();
}

/** The unread badge. */
function badge(ctx, u, x, y, r, { color = C.wa, n = count(u), zero = 0 } = {}) {
  const lc = lastChange(u);
  const pop = 1 + 0.12 * Math.max(0, wobble(u - lc, 2.2, 6)) * (u - lc < 1.5 ? 1 : 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.save(); ctx.shadowColor = color === C.wa ? 'rgba(37,211,102,0.45)' : 'rgba(106,61,240,0.45)'; ctx.shadowBlur = r * 0.6; ctx.shadowOffsetY = r * 0.12;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, M.TAU); ctx.fillStyle = color; ctx.fill(); ctx.restore();
  const s = label(n);
  const size = r * (s.length >= 3 ? 0.78 : s.length === 2 ? 1.0 : 1.15);
  // the digits roll: the new label drops in from above
  const k = clamp((u - lc) / 0.22);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, M.TAU); ctx.clip();
  if (k < 1 && lc > -50) {
    const prev = label(count(lc - 0.01));
    text(ctx, prev, 0, size * 0.36 + E.outCubic(k) * r * 1.4, font(size, 800, D), `rgba(255,255,255,${0.9 * (1 - k) ** 2})`, 'center', -size * 0.03);
  }
  text(ctx, s, 0, size * 0.36 - (1 - E.outCubic(k)) * r * 1.4, font(size, 800, D), '#fff', 'center', -size * 0.03);
  ctx.restore();
  ctx.restore();
}

/** Display line, per-glyph spring from below with a mask, optional violet words. */
function headline(ctx, str, x, y, size, u0, u, { color = C.ink, accent = [], align = 'center', exit = 99 } = {}) {
  const f = font(size, 800, D), track = -0.03 * size;
  const L = layout(ctx, str, f, track);
  const x0 = align === 'center' ? x - L.width / 2 : x;
  const words = str.split(' ');
  let wi = 0;
  const out = E.inCubic(prog(u, exit, exit + 0.5));
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.05, W, size * 1.35); ctx.clip();
  L.glyphs.forEach((g, j) => {
    if (g.ch === ' ') { wi++; return; }
    const k = springU(u, u0 + j * 0.025, SPRING.snappy);
    if (k <= 0) return;
    const col = accent.includes(words[wi]) ? C.violet : color;
    glyph(ctx, g.ch, x0 + g.cx, y + (1 - k) * size * 1.1 + out * size * 1.3, f, col);
  });
  ctx.restore();
}

function screenCard(ctx, img, src, x, y, w, h, { radius = 34, dark = false } = {}) {
  shadowCard(ctx, x, y, w, h, radius, dark ? '#0b0d10' : '#fff', 0.22);
  ctx.save(); rrect(ctx, x, y, w, h, radius); ctx.clip();
  crop(ctx, img, src, x, y, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------- scenes
const LIST = { x: 90, w: 900, top: 520 };

function scenePile(ctx, u) {
  bg(ctx, u);
  shake(ctx, u, 8, 18, 5, 0.25);
  // camera pull-back during the overflow (log space)
  const z = 1 * (0.8 / 1) ** E.inOutCubic(prog(u, T.overflow, 15.5));
  ctx.save(); M.zoomAbout(ctx, z, W / 2, H * 0.55);
  // rows (newest on top), from beat 3
  const arrived = ARRIVE.map((a, i) => ({ a, i })).filter((r) => u >= r.a - 0.02);
  ctx.save(); ctx.beginPath(); ctx.rect(0, LIST.top - 20, W, H); ctx.clip();
  arrived.forEach(({ a, i }) => {
    const later = ARRIVE.filter((b, j) => j > i && u >= b);
    const push = later.reduce((s, b) => s + springU(u, b, SPRING.snappy), 0);
    const inK = springU(u, a, SPRING.bouncy);
    let y = LIST.top + push * ROW_H - (1 - inK) * ROW_H * 1.2;
    // overflow: rows loosen and tilt
    const lo = E.inCubic(prog(u, T.overflow, 15.8));
    const rot = (hash01(i, 4) - 0.5) * 0.35 * lo;
    y += (hash01(i, 9) - 0.5) * 120 * lo;
    row(ctx, i, LIST.x + (hash01(i, 7) - 0.5) * 140 * lo, y, LIST.w, { alpha: clamp(inK * 1.6), rot });
  });
  ctx.restore();
  // overflow: more rows fall in on top, overlapping
  FALL.forEach((a, k) => {
    const s = springU(u, a, SPRING.bouncy);
    if (s <= 0) return;
    const ty = 560 + hash01(k, 3) * 900, tx = 40 + hash01(k, 5) * 160;
    const rot = (hash01(k, 8) - 0.5) * 0.7;
    row(ctx, 16 + k, tx, lerp(-300, ty, s), LIST.w, { rot: rot * s });
  });
  ctx.restore();
  // badge: centre for the hook, then up to the top as the list builds
  const [bx, by, br] = springKeys(u, [[0, [540, 860, 200]], [T.pile, [540, 340, 110]]], SPRING.gentle);
  const enter = springU(u, -0.2, SPRING.bouncy);
  ctx.save(); M.zoomAbout(ctx, enter, bx, by);
  badge(ctx, u, bx, by, br);
  ctx.restore();
  // hook caption
  const capOut = prog(u, 3.6, 4.2);
  if (capOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - capOut;
    headline(ctx, 'unread chats', 540, 1180, 96, 0.4, u, { exit: 3.6 });
    ctx.restore();
  }
  if (u >= 4.2 && u < T.overflow) {
    text(ctx, 'UNREAD', 540 + 150, 330, font(30, 700, UI), C.grey, 'left', 4);
    text(ctx, 'and counting', 540 + 150, 370, font(30, 500, UI), C.grey, 'left');
  }
  if (u >= T.overflow) headline(ctx, 'And it keeps coming.', 540, 1640, 74, T.overflow + 0.2, u, { accent: [] });
  // the violet power line sweeps across just before the drop
  const sw = prog(u, 15.2, 16);
  if (sw > 0) {
    ctx.save(); ctx.globalAlpha = 0.9;
    const x = lerp(-200, W + 200, E.inOutCubic(sw));
    const g = ctx.createLinearGradient(x - 300, 0, x + 40, 0);
    g.addColorStop(0, 'rgba(106,61,240,0)'); g.addColorStop(1, 'rgba(106,61,240,0.9)');
    ctx.fillStyle = g; ctx.fillRect(x - 300, 0, 340, H);
    ctx.restore();
  }
}

const SRC = {
  phone: [1172, 230, 398, 736],          // home.png: the WhatsApp phone with the AI assistant chat
  plans: [1196, 392, 330, 470],          // home.png: "Hi I'm your AI assistant" → plans
  crm: [0, 205, 326, 180],               // dashboard.png: Inbox, WhatsApp Numbers, Leads
  follow: [0, 385, 326, 180],            // dashboard.png: Drip Campaigns, Reminders, Scheduled
  chips: [88, 878, 650, 146],            // home.png: AI Chatbots · Bulk Campaigns · CRM Built-in · Auto Follow-ups · Analytics
  answering: [405, 290, 720, 72],        // dashboard.png: "Your WhatsApp number is connected and answering…"
  headline: [84, 262, 664, 292],         // home.png: "Turn WhatsApp Into Your Sales Machine"
  cta: [90, 752, 346, 84],               // home.png: "Start 7-day free trial"
};

function sceneOn(ctx, u, IMG) {
  bg(ctx, u, 0.6);
  // the pile blows apart to the sides
  const k = springU(u, T.on, SPRING.gentle);
  FALL.concat(ARRIVE).forEach((a, j) => {
    const side = j % 2 ? 1 : -1;
    const x = 90 + side * k * (700 + hash01(j, 2) * 400);
    const y = 400 + hash01(j, 6) * 1200;
    if (k < 0.98) row(ctx, j, x, y, 900, { rot: side * k * 0.4 + (hash01(j, 8) - 0.5) * 0.4, alpha: 1 - k });
  });
  // the real Neura Chat phone rises through the gap
  const p = springU(u, T.on - 0.15, SPRING.snappy);
  const out = E.inCubic(prog(u, 19.6, 20.2));
  const w = 590, h = w * SRC.phone[3] / SRC.phone[2];
  const x = (W - w) / 2, y = lerp(H + 50, 400, p) - out * (H);
  const tilt = (1 - p) * 0.12;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.rotate(tilt); ctx.translate(-W / 2, -(y + h / 2));
  ctx.save(); ctx.shadowColor = 'rgba(106,61,240,0.35)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 30;
  rrect(ctx, x + 10, y + 10, w - 20, h - 20, 70); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
  crop(ctx, IMG.home, SRC.phone, x, y, w, h);
  ctx.restore();
  headline(ctx, 'Neura Chat is on.', 540, 330, 92, T.on + 0.1, u, { accent: ['on.'], exit: 19.2 });
}

function sceneClear(ctx, u, IMG) {
  bg(ctx, u, 0.3);
  // list enters from below as the phone exits up (both on screen)
  const enter = springU(u, 19.7, SPRING.snappy);
  const baseY = lerp(H, LIST.top, enter);
  const cleared = (k) => u >= CLEAR[k] + 0.25;
  // visible queue = first 8 not yet swiped
  const queue = [];
  for (let k = 0; k < NCLEAR && queue.length < 8; k++) if (u < CLEAR[k] + 0.75) queue.push(k);
  ctx.save(); ctx.beginPath(); ctx.rect(0, LIST.top - 20, W, H - LIST.top - 360); ctx.clip();
  queue.forEach((k) => {
    // slot = rows before me still on screen, sliding up with a spring as each one leaves
    const before = CLEAR.slice(0, k).reduce((s, c) => s + (1 - springU(u, c + 0.5, SPRING.snappy)), 0);
    const y = baseY + before * ROW_H;
    const sw = E.inCubic(prog(u, CLEAR[k] + 0.25, CLEAR[k] + 0.75));
    const stamp = prog(u, CLEAR[k] - 0.05, CLEAR[k] + 0.3);
    row(ctx, k + 3, LIST.x - sw * 1100, y, LIST.w, { replied: stamp, alpha: 1 - sw * 0.3, rot: -sw * 0.08 });
  });
  ctx.restore();
  // fade the list into the paper at the bottom
  const fg = ctx.createLinearGradient(0, H - 520, 0, H - 360);
  fg.addColorStop(0, 'rgba(245,242,255,0)'); fg.addColorStop(1, C.paper);
  ctx.fillStyle = fg; ctx.fillRect(0, H - 520, W, 170);
  // badge counting down
  const by = 340;
  const bk = springU(u, 20.15, SPRING.bouncy);
  ctx.save(); M.zoomAbout(ctx, Math.max(0.001, bk), 540, by);
  badge(ctx, u, 540, by, 110);
  ctx.restore();
  text(ctx, 'UNREAD', 540 + 150, 330, font(30, 700, UI), C.grey, 'left', 4);
  text(ctx, 'going down', 540 + 150, 370, font(30, 500, UI), C.violet, 'left');
  // cutaways to the real product
  CUTS.forEach((c, n) => {
    if (u < c.a - 0.05 || u > c.b + 0.6) return;
    const inK = springU(u, c.a - 0.05, SPRING.snappy);
    const outK = E.inCubic(prog(u, c.b, c.b + 0.5));
    const yo = lerp(H, 0, inK) - outK * H;
    ctx.save(); ctx.translate(0, yo);
    ctx.fillStyle = 'rgba(245,242,255,0.86)'; ctx.fillRect(0, 230, W, 1300);
    headline(ctx, c.label, 540, 420, 96, c.a + 0.15, u, { accent: c.label.split(' ').slice(-1) });
    if (n === 0) {
      const w = 760, h = w * SRC.plans[3] / SRC.plans[2];
      screenCard(ctx, IMG.home, SRC.plans, (W - w) / 2, 520, w, h, { radius: 40 });
    } else {
      const src = n === 1 ? SRC.crm : SRC.follow;
      const w = 900, h = w * src[3] / src[2];
      const x = (W - w) / 2, y = 600;
      screenCard(ctx, IMG.dash, src, x, y, w, h, { radius: 44, dark: true });
      // a violet ring walks down the three menu items, one per half beat
      const step = Math.min(2, Math.floor(prog(u, c.a + 0.3, c.a + 1.8) * 3));
      const sc = w / src[2];
      const iy = y + (28 + step * 60) * sc;
      const rp = springU(u, c.a + 0.3 + step * 0.5, SPRING.bouncy);
      ctx.save(); ctx.globalAlpha = clamp(rp); ctx.strokeStyle = C.violet; ctx.lineWidth = 8;
      rrect(ctx, x + 14, iy - 26 * sc, w - 28, 54 * sc, 30); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  });
}

function sceneZero(ctx, u) {
  bg(ctx, u, 0.4);
  const k = springU(u, T.zero, SPRING.gentle);
  const [bx, by, br] = [540, lerp(340, 720, k), lerp(110, 210, k)];
  // green → violet as it empties
  const col = mix(C.wa, C.violet, prog(u, 36.2, 37));
  badge(ctx, u, bx, by, br, { color: col });
  // ring of calm: a check ring draws around the badge
  const rp = E.outCubic(prog(u, 36.6, 38));
  if (rp > 0) {
    ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(bx, by, br + 46, -Math.PI / 2, -Math.PI / 2 + rp * M.TAU); ctx.stroke();
    ctx.globalAlpha = 0.25 * (1 - prog(u, 38, 40));
    ctx.beginPath(); ctx.arc(bx, by, br + 46 + prog(u, 37.5, 40) * 200, 0, M.TAU); ctx.stroke();
    ctx.restore();
  }
  headline(ctx, 'Inbox zero.', 540, 1180, 140, 36.5, u, { accent: ['zero.'], exit: 43.6 });
  const sp = E.outCubic(prog(u, 38, 38.8));
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha = sp * (1 - prog(u, 43.6, 44));
    text(ctx, 'Every customer got a reply.', 540, 1280 + (1 - sp) * 30, font(44, 500, UI), C.grey, 'center');
    ctx.restore();
  }
  // what just happened, one line per beat
  ['AI replied instantly', 'Lead saved to CRM', 'Follow-up scheduled'].forEach((s2, j) => {
    const p = springU(u, 40 + j, SPRING.bouncy);
    if (p <= 0) return;
    const y = 1460 + j * 118, w = 760, x = (W - w) / 2;
    const out = E.inCubic(prog(u, 43.5, 44));
    ctx.save(); ctx.globalAlpha = clamp(p * 2) * (1 - out); ctx.translate(0, (1 - Math.min(1, p)) * 60);
    shadowCard(ctx, x, y - 70, w, 96, 48, '#fff', 0.1);
    ctx.beginPath(); ctx.arc(x + 56, y - 22, 28, 0, M.TAU); ctx.fillStyle = C.violet; ctx.fill();
    checkPath(ctx, x + 56, y - 22, 30, clamp(p * 1.5), '#fff', 6);
    text(ctx, s2, x + 108, y - 8, font(40, 650, UI), C.ink);
    ctx.restore();
  });
  // the last few rows leave the frame at the start
  if (u < 37.5) CLEAR.slice(-3).forEach((c, j) => {
    const sw = E.inCubic(prog(u, c + 0.25, c + 0.75));
    if (sw < 1) row(ctx, NCLEAR - 3 + j + 3, LIST.x - sw * 1100, LIST.top + j * ROW_H, LIST.w, { replied: 1 });
  });
}

function sceneProof(ctx, u, IMG) {
  bg(ctx, u, 0.2);
  if (u < 48.1) {
    // "0 conversations waiting on a human." built from the dashboard's own sentence
    headline(ctx, '0 conversations', 540, 640, 104, T.proof + 0.1, u, { accent: ['0'], exit: 47.6 });
    headline(ctx, 'waiting on a human.', 540, 760, 76, T.proof + 0.4, u, { exit: 47.6 });
    const p = springU(u, T.proof + 0.6, SPRING.snappy);
    const out = E.inCubic(prog(u, 47.6, 48.1));
    const w = 1000, h = 300, x = (W - w) / 2, y = lerp(1500, 930, p) - out * 900;
    ctx.save(); ctx.globalAlpha = clamp(p * 2);
    shadowCard(ctx, x, y, w, h, 40, '#0E1512', 0.3);
    ctx.save(); rrect(ctx, x, y, w, h, 40); ctx.clip();
    // camera reads along the real sentence: 2.2x, panning left to right
    const sc = 2.8, sw = w / sc, sh = h / sc;
    const pan = E.inOutCubic(prog(u, T.proof + 0.8, 47.6));
    const sx = 405 + pan * (720 - sw), sy = 337 - sh / 2;
    ctx.drawImage(IMG.dash, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
    text(ctx, 'FROM THE NEURA CHAT DASHBOARD', 540, y + h + 70, font(28, 700, UI), C.grey, 'center', 3);
    ctx.restore();
  }
  if (u >= 47.55) {
    // the homepage promise
    const p = springU(u, T.proof2 - 0.45, SPRING.snappy);
    const w = 940, h = w * SRC.headline[3] / SRC.headline[2];
    const z = 1.0 * (1.08 / 1.0) ** prog(u, T.proof2, T.end);
    const x = (W - w) / 2, y = lerp(H, 700, p);
    ctx.save(); M.zoomAbout(ctx, z, W / 2, y + h / 2);
    shadowCard(ctx, x - 40, y - 50, w + 80, h + 100, 40, '#fff', 0.14);
    crop(ctx, IMG.home, SRC.headline, x, y, w, h);
    ctx.restore();
    const out = E.inCubic(prog(u, 51.6, 52));
    if (out > 0) { ctx.globalAlpha = 1; }
  }
}

function sceneEnd(ctx, u, IMG) {
  bg(ctx, u, 0.5);
  // logo on an ink tile (as in the site's nav: the mark is silver + lime)
  const lp = springU(u, T.end, SPRING.bouncy);
  const s = 320;
  const lx = 540, ly = 600;
  ctx.save(); ctx.translate(lx, ly); ctx.scale(0.75 + 0.25 * lp, 0.75 + 0.25 * lp); ctx.rotate((1 - Math.min(1, lp)) * -0.4);
  ctx.save(); ctx.shadowColor = 'rgba(106,61,240,0.4)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 26;
  rrect(ctx, -s / 2, -s / 2, s, s, 70); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore();
  const lw = s * 0.74, lh = lw * IMG.logo.height / IMG.logo.width;
  ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh);
  ctx.restore();
  headline(ctx, 'Every chat', 540, 1000, 140, T.end + 0.3, u);
  headline(ctx, 'answered.', 540, 1150, 140, T.end + 0.6, u, { accent: ['answered.'] });
  // the real CTA button from the homepage
  const cp = springU(u, 54, SPRING.bouncy);
  if (cp > 0) {
    const w = 800, h = w * SRC.cta[3] / SRC.cta[2];
    ctx.save(); ctx.translate(540, 1270 + h / 2); ctx.scale(cp, cp);
    ctx.save(); ctx.shadowColor = 'rgba(106,61,240,0.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    rrect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, h / 2); ctx.fillStyle = C.violet; ctx.fill(); ctx.restore();
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.clip();
    crop(ctx, IMG.home, SRC.cta, -w / 2, -h / 2, w, h);
    // light sweep across the button
    const sx = ((u - 54.5) * 0.9 % 2.2) - 0.6;
    const g = ctx.createLinearGradient(-w / 2 + sx * w - 80, 0, -w / 2 + sx * w + 80, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.restore();
  }
  const wp = E.outCubic(prog(u, 54.5, 55.3));
  if (wp > 0) {
    ctx.save(); ctx.globalAlpha = wp;
    text(ctx, 'neurachat.in', 540, 1530 + (1 - wp) * 20, font(56, 700, UI), C.ink, 'center');
    ctx.restore();
  }
}

M.film({
  fonts: [font(100, 800, D), font(40, 500, UI), font(40, 700, UI)],
  images: { home: 'assets/shots/home.png', dash: 'assets/shots/dashboard.png', logo: 'assets/logo.png' },
  hits: HITS,
  samples: (t) => 8,
  draw(ctx, u, t, IMG) {
    if (u < T.on) scenePile(ctx, u);
    else if (u < 20.2) sceneOn(ctx, u, IMG);
    else if (u < T.zero) sceneClear(ctx, u, IMG);
    else if (u < T.proof) sceneZero(ctx, u);
    else if (u < T.end) sceneProof(ctx, u, IMG);
    else sceneEnd(ctx, u, IMG);
    // the list rises under the departing phone (both on screen for the whip)
    if (u >= 19.7 && u < 20.2) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      const enter = springU(u, 19.7, SPRING.snappy);
      const y = lerp(H, LIST.top, enter);
      for (let k = 0; k < 6; k++) row(ctx, k + 3, LIST.x, y + k * ROW_H, LIST.w);
      ctx.restore();
    }
  },
  post(ctx, u, t) {
    // fine paper grain, seeded per frame
    const n = 900, rnd = M.mulberry32(Math.floor(t * 60) + 7);
    ctx.fillStyle = 'rgba(21,17,42,0.035)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * W, rnd() * H, 2, 2);
  },
});
