/**
 * Template library. Every template is code that builds a normal, fully editable
 * ProjectDoc (text, shapes, procedural effects, keyframes, presets) for the
 * requested aspect ratio. Media placeholders are drop zones (solids labelled
 * "Replace with your footage") — swap them by dropping assets on them.
 */
import { makeClip, makeTrack, newDocument } from "../project/factory";
import { ProjectDoc, type Aspect, type Clip } from "../project/schema";

export interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  durationSec: number;
  defaultAspect: Aspect;
  palette: string[];
  tags: string[];
}

type Builder = (ctx: { w: number; h: number; s: number; fps: number; portrait: boolean }) => { tracks: Clip[][]; background?: string };

const sec = (fps: number, s: number) => Math.round(fps * s);

function placeholder(name: string, start: number, duration: number, colors: [string, string]): Clip {
  return makeClip({
    type: "solid",
    name: `${name} — replace with your footage`,
    start,
    duration,
    color: colors[0],
    gradient: { kind: "radial", angle: 0, stops: [[colors[1], 0], [colors[0], 70]] },
    drift: 1,
  });
}

const T: { info: TemplateInfo; build: Builder }[] = [
  {
    info: { id: "product-launch", name: "Product launch", category: "Product advertisements", description: "Bold kinetic titles over drifting orbs, product slot, specs counter and end card.", durationSec: 12, defaultAspect: "16:9", palette: ["#07080b", "#8b7bff", "#5ee1ff"], tags: ["tech", "saas", "launch"] },
    build: ({ w, h, s, fps }) => {
      const bg = makeClip({ type: "effect", effect: "orbs", name: "Background orbs", start: 0, duration: sec(fps, 12), params: { colors: ["#8b7bff", "#5ee1ff", "#ff6b9a"], background: "#07080b" } });
      const streaks = makeClip({ type: "effect", effect: "light-streaks", name: "Light streaks", start: 0, duration: sec(fps, 12), blendMode: "screen", params: { color: "#a99dff", count: 6 } });
      const product = placeholder("Product shot", sec(fps, 3), sec(fps, 4), ["#101320", "#2b2f4a"]);
      product.transform = { ...product.transform, width: Math.round(w * 0.55), height: Math.round(h * 0.6) };
      product.animationIn = { preset: "zoom", duration: 18, delay: 0, easing: "easeOutCubic", direction: "up", intensity: 0.6, stagger: 2, splitBy: "word" };
      product.transitionOut = { type: "blur", duration: 12, easing: "easeInOutCubic" };
      const t1 = makeClip({ type: "text", name: "Headline", text: "Meet the future", start: sec(fps, 0.3), duration: sec(fps, 2.6), style: { fontFamily: "Syne", fontSize: Math.round(s * 0.12), fontWeight: 800, letterSpacing: -0.03 }, animationIn: { preset: "kinetic", duration: 24, splitBy: "letter", stagger: 1.5 }, animationOut: { preset: "blur-reveal", duration: 10 } });
      const t2 = makeClip({ type: "text", name: "Product name", text: "NOVA ONE", start: sec(fps, 3.2), duration: sec(fps, 3.6), transform: { y: Math.round(h * 0.38) }, style: { fontFamily: "Unbounded", fontSize: Math.round(s * 0.06), fontWeight: 700, letterSpacing: 0.3, gradient: ["#ffffff", "#a99dff"] }, animationIn: { preset: "reveal", duration: 16, direction: "left" } });
      const counter = makeClip({ type: "effect", effect: "counter", name: "Stat counter", start: sec(fps, 7), duration: sec(fps, 2.5), params: { to: 48, suffix: "h", label: "battery life", color: "#ffffff" }, transform: { width: Math.round(w * 0.6), height: Math.round(h * 0.4) }, animationIn: { preset: "pop", duration: 12 } });
      const cta = makeClip({ type: "text", name: "Call to action", text: "Available now", start: sec(fps, 9.6), duration: sec(fps, 2.4), style: { fontFamily: "Inter", fontSize: Math.round(s * 0.07), fontWeight: 700, background: "#8b7bff", padding: Math.round(s * 0.025), borderRadius: 999 }, animationIn: { preset: "pop", duration: 14, easing: "easeOutBack" } });
      const sweep = makeClip({ type: "effect", effect: "light-sweep", name: "Sweep", start: sec(fps, 9.8), duration: sec(fps, 1.2), blendMode: "screen" });
      return { tracks: [[t1, t2, cta], [sweep, counter], [streaks], [product], [bg]] };
    },
  },
  {
    info: { id: "logo-reveal-metal", name: "Metallic logo reveal", category: "Logo animations", description: "Extruded silver wordmark with particles, light sweep and 3D flip — swap the text or drop your logo.", durationSec: 5, defaultAspect: "16:9", palette: ["#000000", "#c9ced6", "#ffffff"], tags: ["logo", "3d", "intro"] },
    build: ({ s, fps }) => {
      const bg = makeClip({ type: "solid", name: "Background", start: 0, duration: sec(fps, 5), color: "#000000", gradient: { kind: "radial", angle: 0, stops: [["#1a1d24", 0], ["#000000", 65]] } });
      const parts = makeClip({ type: "effect", effect: "particles", name: "Particles", start: 0, duration: sec(fps, 5), blendMode: "screen", params: { count: 140, size: 4, speed: 0.6, color: "#dfe6f0", direction: "drift", bokeh: 0.7 } });
      const logo = makeClip({ type: "text", name: "Wordmark", text: "LUMORA", start: sec(fps, 0.4), duration: sec(fps, 4.6), style: { fontFamily: "Unbounded", fontSize: Math.round(s * 0.16), fontWeight: 900, letterSpacing: 0.08, gradient: ["#f4f6fa", "#8d96a6"], extrude: 8, extrudeColor: "#2a2f38" }, animationIn: { preset: "flip-3d", duration: 26, easing: "easeOutBack", direction: "right" }, keyframes: { scale: [{ id: "k1", frame: 0, value: 0.92, easing: "easeOutCubic" }, { id: "k2", frame: sec(fps, 4.6), value: 1.02, easing: "linear" }] } });
      const sweep = makeClip({ type: "effect", effect: "light-sweep", name: "Light sweep", start: sec(fps, 1.4), duration: sec(fps, 1.4), blendMode: "screen", params: { width: 12, intensity: 0.9 } });
      const tag = makeClip({ type: "text", name: "Tagline", text: "creative studio", start: sec(fps, 2.2), duration: sec(fps, 2.8), transform: { y: Math.round(s * 0.16) }, style: { fontFamily: "Inter", fontSize: Math.round(s * 0.03), fontWeight: 500, letterSpacing: 0.6, color: "#aab2c0", textTransform: "uppercase" }, animationIn: { preset: "typewriter", duration: 24, splitBy: "letter" } });
      return { tracks: [[tag], [sweep], [logo], [parts], [bg]] };
    },
  },
  {
    info: { id: "youtube-intro", name: "YouTube intro", category: "YouTube intros", description: "Fast glitchy channel intro with neon frame and subscribe prompt.", durationSec: 6, defaultAspect: "16:9", palette: ["#09060f", "#ff4fd8", "#20f0ff"], tags: ["youtube", "glitch", "neon"] },
    build: ({ s, fps }) => {
      const grid = makeClip({ type: "effect", effect: "grid", name: "Retro grid", start: 0, duration: sec(fps, 6), params: { color: "#ff4fd8", background: "#09060f", speed: 1.4 } });
      const frame = makeClip({ type: "effect", effect: "neon-frame", name: "Neon frame", start: sec(fps, 0.2), duration: sec(fps, 5.8), blendMode: "screen", params: { color: "#20f0ff" }, animationIn: { preset: "glitch", duration: 12 } });
      const glitch = makeClip({ type: "effect", effect: "glitch", name: "Glitch bursts", start: 0, duration: sec(fps, 6), blendMode: "screen" });
      const name = makeClip({ type: "text", name: "Channel name", text: "YOUR CHANNEL", start: sec(fps, 0.5), duration: sec(fps, 5), style: { fontFamily: "Anton", fontSize: Math.round(s * 0.14), color: "#ffffff", glow: "#ff4fd8", letterSpacing: 0.04 }, animationIn: { preset: "glitch", duration: 16 }, loop: { preset: "flicker", period: 40, intensity: 1 } });
      const sub = makeClip({ type: "text", name: "Subscribe", text: "SUBSCRIBE ▸", start: sec(fps, 3), duration: sec(fps, 3), transform: { y: Math.round(s * 0.18) }, style: { fontFamily: "Space Grotesk", fontSize: Math.round(s * 0.045), fontWeight: 700, background: "#ff1f45", padding: Math.round(s * 0.018), borderRadius: 10 }, animationIn: { preset: "bounce", duration: 18 }, loop: { preset: "pulse", period: 30, intensity: 1 } });
      return { tracks: [[sub, name], [glitch], [frame], [grid]] };
    },
  },
  {
    info: { id: "fashion-reel", name: "Fashion reel", category: "Cinematic reels", description: "Editorial vertical reel: three footage slots, serif titles, film grain and light leaks.", durationSec: 9, defaultAspect: "9:16", palette: ["#0b0b0f", "#e9e3d5", "#c2a27a"], tags: ["fashion", "reel", "editorial"] },
    build: ({ w, h, s, fps }) => {
      const a = placeholder("Look 1", 0, sec(fps, 3), ["#17151a", "#3b3530"]);
      const b = placeholder("Look 2", sec(fps, 3), sec(fps, 3), ["#121418", "#2f3a44"]);
      const c = placeholder("Look 3", sec(fps, 6), sec(fps, 3), ["#1a1410", "#4a3a2a"]);
      b.transitionIn = { type: "wipe-left", duration: 10, easing: "easeInOutCubic" };
      c.transitionIn = { type: "zoom-in", duration: 10, easing: "easeInOutCubic" };
      for (const x of [a, b, c]) x.keyframes = { scale: [{ id: "a", frame: 0, value: 1.0, easing: "linear" }, { id: "b", frame: sec(fps, 3), value: 1.08, easing: "linear" }] };
      const title = makeClip({ type: "text", name: "Title", text: "The Autumn\nEdit", start: sec(fps, 0.3), duration: sec(fps, 2.6), transform: { y: Math.round(-h * 0.25), width: Math.round(w * 0.9), height: Math.round(h * 0.3) }, style: { fontFamily: "Playfair Display", fontSize: Math.round(s * 0.16), fontWeight: 400, italic: true, color: "#f3efe6" }, animationIn: { preset: "kinetic", duration: 22, splitBy: "word", stagger: 5 }, animationOut: { preset: "fade", duration: 8 } });
      const l2 = makeClip({ type: "text", name: "Caption 2", text: "textures that last", start: sec(fps, 3.4), duration: sec(fps, 2.4), transform: { y: Math.round(h * 0.33) }, style: { fontFamily: "Cormorant Garamond", fontSize: Math.round(s * 0.08), fontWeight: 600, italic: true, color: "#e9e3d5" }, animationIn: { preset: "blur-reveal", duration: 16 } });
      const brand = makeClip({ type: "text", name: "Brand", text: "MAISON", start: sec(fps, 6.6), duration: sec(fps, 2.4), style: { fontFamily: "Montserrat", fontSize: Math.round(s * 0.12), fontWeight: 300, letterSpacing: 0.5, color: "#ffffff" }, animationIn: { preset: "reveal", duration: 18, direction: "up" } });
      const leak = makeClip({ type: "effect", effect: "light-leak", name: "Light leak", start: 0, duration: sec(fps, 9), blendMode: "screen", params: { intensity: 0.45 } });
      const grain = makeClip({ type: "effect", effect: "film-grain", name: "Film grain", start: 0, duration: sec(fps, 9), blendMode: "overlay", params: { amount: 0.3 } });
      return { tracks: [[title, l2, brand], [leak], [grain], [a, b, c]] };
    },
  },
  {
    info: { id: "real-estate", name: "Real estate showcase", category: "Real estate videos", description: "Property tour with room labels, price lower third and agent end card.", durationSec: 15, defaultAspect: "16:9", palette: ["#0d1214", "#c9a86a", "#ffffff"], tags: ["property", "listing"] },
    build: ({ w, h, s, fps }) => {
      const rooms = ["Exterior", "Living room", "Kitchen", "Primary suite"].map((r, i) => {
        const p = placeholder(r, sec(fps, i * 3), sec(fps, 3), ["#11181b", "#2b3a40"]);
        if (i) p.transitionIn = { type: "fade", duration: 12, easing: "easeInOutCubic" };
        p.keyframes = { scale: [{ id: "a", frame: 0, value: 1.06, easing: "linear" }, { id: "b", frame: sec(fps, 3), value: 1.0, easing: "linear" }], x: [{ id: "c", frame: 0, value: -30, easing: "linear" }, { id: "d", frame: sec(fps, 3), value: 30, easing: "linear" }] };
        return p;
      });
      const labels = ["Exterior", "Living room", "Kitchen", "Primary suite"].map((r, i) =>
        makeClip({ type: "text", name: `Label: ${r}`, text: r.toUpperCase(), start: sec(fps, i * 3 + 0.4), duration: sec(fps, 2.3), transform: { x: Math.round(-w * 0.32), y: Math.round(-h * 0.36), width: Math.round(w * 0.32), height: Math.round(h * 0.1) }, style: { fontFamily: "Montserrat", fontSize: Math.round(s * 0.035), fontWeight: 600, letterSpacing: 0.3, align: "left", color: "#ffffff" }, animationIn: { preset: "slide", duration: 14, direction: "right" }, animationOut: { preset: "fade", duration: 8 } }),
      );
      const lt = makeClip({ type: "effect", effect: "lower-third", name: "Price lower third", start: sec(fps, 1), duration: sec(fps, 4), transform: { width: Math.round(w * 0.46), height: Math.round(h * 0.16), x: Math.round(-w * 0.22), y: Math.round(h * 0.33) }, params: { title: "$1,250,000", subtitle: "4 bed · 3 bath · 2,800 sq ft", accent: "#c9a86a" } });
      const end = makeClip({ type: "solid", name: "End card", start: sec(fps, 12), duration: sec(fps, 3), color: "#0d1214", transitionIn: { type: "fade", duration: 12, easing: "easeInOutCubic" } });
      const agent = makeClip({ type: "text", name: "Agent", text: "Schedule a private viewing\nJane Doe · (555) 010-0199", start: sec(fps, 12.3), duration: sec(fps, 2.7), style: { fontFamily: "Playfair Display", fontSize: Math.round(s * 0.06), fontWeight: 600, color: "#f1e6cf", lineHeight: 1.4 }, animationIn: { preset: "blur-reveal", duration: 18 } });
      return { tracks: [[...labels, agent], [lt], [end], rooms] };
    },
  },
  {
    info: { id: "restaurant-promo", name: "Restaurant promo", category: "Restaurant promotions", description: "Warm, appetising promo with dish slots, embers and an offer badge.", durationSec: 10, defaultAspect: "9:16", palette: ["#120a07", "#ff9a3d", "#fff1e0"], tags: ["food", "promo"] },
    build: ({ w, h, s, fps }) => {
      const d1 = placeholder("Signature dish", 0, sec(fps, 4), ["#1d0f08", "#5a2a12"]);
      const d2 = placeholder("Chef / kitchen", sec(fps, 4), sec(fps, 3), ["#1a0e0a", "#4a1f10"]);
      d2.transitionIn = { type: "slide-up", duration: 12, easing: "easeInOutCubic" };
      const embers = makeClip({ type: "effect", effect: "fire", name: "Embers", start: 0, duration: sec(fps, 7), blendMode: "screen", params: { count: 60 } });
      const grade = makeClip({ type: "adjustment", name: "Warm grade", start: 0, duration: sec(fps, 10), effects: { temperature: 0.3, saturation: 1.15, vignette: 0.3 } });
      const h1 = makeClip({ type: "text", name: "Headline", text: "Wood-fired\nsince 1998", start: sec(fps, 0.4), duration: sec(fps, 3.4), transform: { y: Math.round(-h * 0.28), width: Math.round(w * 0.9), height: Math.round(h * 0.25) }, style: { fontFamily: "DM Serif Display", fontSize: Math.round(s * 0.14), color: "#fff1e0", shadow: "0 8px 30px rgba(0,0,0,0.6)" }, animationIn: { preset: "kinetic", duration: 20, splitBy: "word" } });
      const endBg = makeClip({ type: "solid", name: "Offer background", start: sec(fps, 7), duration: sec(fps, 3), color: "#120a07", gradient: { kind: "radial", angle: 0, stops: [["#3a1d12", 0], ["#120a07", 70]] }, transitionIn: { type: "circle", duration: 14, easing: "easeInOutCubic" } });
      const badge = makeClip({ type: "shape", shape: "star", name: "Offer badge", start: sec(fps, 7.3), duration: sec(fps, 2.7), fill: "#ff9a3d", transform: { width: Math.round(s * 0.5), height: Math.round(s * 0.5), y: Math.round(-h * 0.08) }, animationIn: { preset: "pop", duration: 14, easing: "easeOutBack" }, loop: { preset: "spin", period: 600, intensity: 1 } });
      const offer = makeClip({ type: "text", name: "Offer", text: "2 FOR 1\nTuesdays", start: sec(fps, 7.5), duration: sec(fps, 2.5), transform: { y: Math.round(-h * 0.08) }, style: { fontFamily: "Anton", fontSize: Math.round(s * 0.09), color: "#120a07", lineHeight: 1 }, animationIn: { preset: "pop", duration: 14 } });
      const addr = makeClip({ type: "text", name: "Address", text: "12 Market St · Book now", start: sec(fps, 8), duration: sec(fps, 2), transform: { y: Math.round(h * 0.25) }, style: { fontFamily: "Inter", fontSize: Math.round(s * 0.045), fontWeight: 600, color: "#fff1e0" }, animationIn: { preset: "float", duration: 14 } });
      return { tracks: [[h1, offer, addr], [badge], [grade], [embers], [endBg], [d1, d2]] };
    },
  },
  {
    info: { id: "podcast-clip", name: "Podcast clip", category: "Podcast clips", description: "Vertical podcast highlight: speaker slot, animated captions, progress bar and show title.", durationSec: 15, defaultAspect: "9:16", palette: ["#0b0d12", "#5ee1ff", "#ffd84d"], tags: ["podcast", "captions", "shorts"] },
    build: ({ w, h, s, fps }) => {
      const bg = makeClip({ type: "effect", effect: "orbs", name: "Background", start: 0, duration: sec(fps, 15), params: { colors: ["#1b3a5a", "#2a1b4a"], background: "#0b0d12", blur: 200 } });
      const speaker = placeholder("Speaker video", 0, sec(fps, 15), ["#151b26", "#26324a"]);
      speaker.transform = { ...speaker.transform, width: Math.round(w * 0.86), height: Math.round(w * 0.86), y: Math.round(-h * 0.08) };
      speaker.mask = { shape: "rect", x: 50, y: 50, width: 100, height: 100, radius: 40, feather: 0, invert: false };
      const show = makeClip({ type: "text", name: "Show title", text: "THE DEEP END · EP 42", start: 0, duration: sec(fps, 15), transform: { y: Math.round(-h * 0.42) }, style: { fontFamily: "Space Grotesk", fontSize: Math.round(s * 0.045), fontWeight: 700, letterSpacing: 0.15, color: "#5ee1ff" } });
      const words = "This is where your auto captions appear word by word".split(" ");
      const cap = makeClip({ type: "text", name: "Captions (replace via Auto captions)", text: words.join(" "), start: 0, duration: sec(fps, 15), transform: { y: Math.round(h * 0.3), width: Math.round(w * 0.88), height: Math.round(h * 0.2) }, style: { fontFamily: "Montserrat", fontSize: Math.round(s * 0.075), fontWeight: 900, textTransform: "uppercase", strokeColor: "#000000", strokeWidth: 3 }, words: words.map((t, i) => ({ text: t, start: i * 12, end: i * 12 + 12, highlight: false })), highlightColor: "#ffd84d" });
      const bar = makeClip({ type: "effect", effect: "progress-bar", name: "Progress", start: 0, duration: sec(fps, 15), transform: { width: w, height: Math.max(8, Math.round(h * 0.006)), y: Math.round(h / 2 - h * 0.003) }, params: { color: "#5ee1ff" } });
      return { tracks: [[cap, show], [bar], [speaker], [bg]] };
    },
  },
  {
    info: { id: "explainer-stats", name: "Data explainer", category: "Explainer videos", description: "Infographic explainer: animated bar chart, counters and kinetic headlines.", durationSec: 12, defaultAspect: "16:9", palette: ["#0b1020", "#5effb1", "#8b7bff"], tags: ["infographic", "data", "chart"] },
    build: ({ w, h, s, fps }) => {
      const bg = makeClip({ type: "solid", name: "Background", start: 0, duration: sec(fps, 12), color: "#0b1020", gradient: { kind: "linear", angle: 160, stops: [["#0b1020", 0], ["#1b2440", 100]] } });
      const geo = makeClip({ type: "effect", effect: "geometric", name: "Geometry", start: 0, duration: sec(fps, 12), params: { colors: ["#5effb1", "#8b7bff"], count: 12, speed: 0.5 }, transform: { opacity: 0.4 } });
      const q = makeClip({ type: "text", name: "Question", text: "How fast are we growing?", start: sec(fps, 0.3), duration: sec(fps, 2.7), style: { fontFamily: "Space Grotesk", fontSize: Math.round(s * 0.09), fontWeight: 700 }, animationIn: { preset: "kinetic", duration: 20 }, animationOut: { preset: "slide", duration: 10, direction: "up" } });
      const chart = makeClip({ type: "effect", effect: "bar-chart", name: "Revenue chart", start: sec(fps, 3), duration: sec(fps, 5), params: { values: [12, 19, 31, 48, 77], labels: ["2021", "2022", "2023", "2024", "2025"], color: "#5effb1", suffix: "M" }, transform: { width: Math.round(w * 0.7), height: Math.round(h * 0.7) }, animationOut: { preset: "fade", duration: 10 } });
      const c1 = makeClip({ type: "effect", effect: "counter", name: "Growth counter", start: sec(fps, 8.2), duration: sec(fps, 3.8), params: { to: 540, suffix: "%", label: "growth in five years", color: "#5effb1" }, transform: { width: Math.round(w * 0.7), height: Math.round(h * 0.5) }, animationIn: { preset: "zoom", duration: 14, intensity: 0.4 } });
      return { tracks: [[q], [chart, c1], [geo], [bg]] };
    },
  },
  {
    info: { id: "corporate-title", name: "Corporate presentation", category: "Corporate presentations", description: "Clean title sequence with lower third and section cards.", durationSec: 10, defaultAspect: "16:9", palette: ["#0b0d12", "#2563eb", "#e4e7ee"], tags: ["corporate", "business"] },
    build: ({ w, h, s, fps }) => {
      const bg = makeClip({ type: "solid", name: "Background", start: 0, duration: sec(fps, 10), color: "#0b0d12", gradient: { kind: "linear", angle: 120, stops: [["#0b0d12", 0], ["#111a2e", 100]] } });
      const bar = makeClip({ type: "shape", shape: "rect", name: "Accent bar", start: sec(fps, 0.2), duration: sec(fps, 4.6), fill: "#2563eb", transform: { width: Math.round(w * 0.006), height: Math.round(h * 0.25), x: Math.round(-w * 0.32) }, keyframes: { scaleY: [{ id: "a", frame: 0, value: 0, easing: "easeOutCubic" }, { id: "b", frame: 18, value: 1, easing: "linear" }] } });
      const title = makeClip({ type: "text", name: "Title", text: "Annual Strategy\nReview 2026", start: sec(fps, 0.4), duration: sec(fps, 4.4), transform: { x: Math.round(-w * 0.03), width: Math.round(w * 0.56), height: Math.round(h * 0.4) }, style: { fontFamily: "Manrope", fontSize: Math.round(s * 0.09), fontWeight: 800, align: "left", lineHeight: 1.05 }, animationIn: { preset: "reveal", duration: 20, direction: "left" } });
      const lt = makeClip({ type: "effect", effect: "lower-third", name: "Presenter lower third", start: sec(fps, 5), duration: sec(fps, 5), transform: { width: Math.round(w * 0.45), height: Math.round(h * 0.16), x: Math.round(-w * 0.22), y: Math.round(h * 0.33) }, params: { title: "Alex Morgan", subtitle: "Chief Executive Officer", accent: "#2563eb" } });
      const slot = placeholder("Presenter footage", sec(fps, 5), sec(fps, 5), ["#121722", "#24304a"]);
      slot.transitionIn = { type: "fade", duration: 12, easing: "easeInOutCubic" };
      return { tracks: [[title, bar], [lt], [slot], [bg]] };
    },
  },
  {
    info: { id: "ecommerce-sale", name: "E-commerce flash sale", category: "E-commerce videos", description: "High-energy sale ad: confetti, bouncing price, countdown feel.", durationSec: 8, defaultAspect: "1:1", palette: ["#14001f", "#ff3d7f", "#ffd84d"], tags: ["sale", "shop", "social"] },
    build: ({ s, fps }) => {
      const bg = makeClip({ type: "effect", effect: "orbs", name: "Background", start: 0, duration: sec(fps, 8), params: { colors: ["#ff3d7f", "#7c3dff", "#ffd84d"], background: "#14001f", speed: 2 } });
      const big = makeClip({ type: "text", name: "Sale", text: "FLASH SALE", start: sec(fps, 0.2), duration: sec(fps, 3), style: { fontFamily: "Anton", fontSize: Math.round(s * 0.2), color: "#ffd84d", extrude: 6, extrudeColor: "#ff3d7f" }, animationIn: { preset: "bounce", duration: 22, intensity: 1.2 }, animationOut: { preset: "zoom", duration: 8 }, loop: { preset: "shake", period: 30, intensity: 0.6 } });
      const product = placeholder("Product", sec(fps, 3), sec(fps, 3), ["#2a0f3d", "#5a1f6a"]);
      product.transform = { ...product.transform, width: Math.round(s * 0.6), height: Math.round(s * 0.6) };
      product.animationIn = { preset: "pop", duration: 14, delay: 0, easing: "easeOutBack", direction: "up", intensity: 1, stagger: 2, splitBy: "word" };
      const price = makeClip({ type: "text", name: "Price", text: "-50%", start: sec(fps, 3.4), duration: sec(fps, 2.6), transform: { x: Math.round(s * 0.28), y: Math.round(-s * 0.28), rotation: 12 }, style: { fontFamily: "Unbounded", fontSize: Math.round(s * 0.1), fontWeight: 900, background: "#ff3d7f", padding: Math.round(s * 0.02), borderRadius: 16 }, animationIn: { preset: "pop", duration: 12, easing: "easeOutBack" }, loop: { preset: "pulse", period: 24, intensity: 1.5 } });
      const confetti = makeClip({ type: "effect", effect: "confetti", name: "Confetti", start: sec(fps, 6), duration: sec(fps, 2) });
      const cta = makeClip({ type: "text", name: "CTA", text: "Shop now →", start: sec(fps, 6), duration: sec(fps, 2), style: { fontFamily: "Poppins", fontSize: Math.round(s * 0.1), fontWeight: 800 }, animationIn: { preset: "kinetic", duration: 14, splitBy: "letter", stagger: 1 } });
      return { tracks: [[big, price, cta], [confetti], [product], [bg]] };
    },
  },
  {
    info: { id: "agency-showreel", name: "Agency showreel", category: "Agency promotional videos", description: "Fast-cut showreel with HUD accents, kinetic statements and five footage slots.", durationSec: 14, defaultAspect: "16:9", palette: ["#050608", "#5ee1ff", "#ffffff"], tags: ["agency", "showreel"] },
    build: ({ s, fps }) => {
      const slots = Array.from({ length: 5 }, (_, i) => {
        const p = placeholder(`Shot ${i + 1}`, sec(fps, 2 + i * 2), sec(fps, 2), ["#0c1016", i % 2 ? "#1a2a3a" : "#2a1a3a"]);
        p.transitionIn = { type: (["glitch", "zoom-in", "wipe-left", "flash", "spin"] as const)[i], duration: 8, easing: "easeInOutCubic" };
        return p;
      });
      const hud = makeClip({ type: "effect", effect: "hud", name: "HUD", start: 0, duration: sec(fps, 2.2), blendMode: "screen", params: { label: "INITIALISING" } });
      const words = ["We", "make", "brands", "move."].map((wd, i) =>
        makeClip({ type: "text", name: `Word ${i + 1}`, text: wd, start: sec(fps, 2 + i * 2 + 0.3), duration: sec(fps, 1.5), style: { fontFamily: "Syne", fontSize: Math.round(s * 0.2), fontWeight: 800, color: "#ffffff" }, animationIn: { preset: "kinetic", duration: 10, splitBy: "letter", stagger: 1 }, animationOut: { preset: "blur-reveal", duration: 6 } }),
      );
      const end = makeClip({ type: "text", name: "Agency", text: "STUDIO NORTH", start: sec(fps, 12), duration: sec(fps, 2), style: { fontFamily: "Unbounded", fontSize: Math.round(s * 0.09), fontWeight: 700, letterSpacing: 0.2 }, animationIn: { preset: "mask-reveal", duration: 16 } });
      const scan = makeClip({ type: "effect", effect: "scanlines", name: "Scanlines", start: 0, duration: sec(fps, 14) });
      return { tracks: [[...words, end], [hud], [scan], slots] };
    },
  },
  {
    info: { id: "social-caption", name: "Social captions", category: "Motion graphics", description: "Talking-head vertical with bold karaoke captions and emoji pop.", durationSec: 10, defaultAspect: "9:16", palette: ["#000000", "#ffffff", "#5effb1"], tags: ["captions", "tiktok", "reels"] },
    build: ({ w, h, s, fps }) => {
      const vid = placeholder("Talking head", 0, sec(fps, 10), ["#14161c", "#2c3240"]);
      const words = "Here are three things nobody tells you about editing".split(" ");
      const cap = makeClip({ type: "text", name: "Captions", text: words.join(" "), start: 0, duration: sec(fps, 10), transform: { y: Math.round(h * 0.18), width: Math.round(w * 0.86), height: Math.round(h * 0.25) }, style: { fontFamily: "Poppins", fontSize: Math.round(s * 0.085), fontWeight: 800, strokeColor: "#000000", strokeWidth: 4, textTransform: "uppercase", lineHeight: 1.1 }, words: words.map((t, i) => ({ text: t, start: i * 9, end: i * 9 + 9, highlight: ["three", "nobody"].includes(t) })), highlightColor: "#5effb1" });
      const hook = makeClip({ type: "text", name: "Hook", text: "🤯", start: sec(fps, 2.2), duration: sec(fps, 1.5), transform: { x: Math.round(w * 0.3), y: Math.round(-h * 0.25) }, style: { fontSize: Math.round(s * 0.2) }, animationIn: { preset: "pop", duration: 10, easing: "easeOutBack" }, animationOut: { preset: "fade", duration: 6 } });
      return { tracks: [[cap, hook], [vid]] };
    },
  },
];

export const TEMPLATES: TemplateInfo[] = T.map((t) => t.info);

export function buildTemplate(id: string, aspect?: Aspect): ProjectDoc {
  const t = T.find((x) => x.info.id === id);
  if (!t) throw new Error(`Unknown template ${id}`);
  const doc = newDocument({ aspect: aspect ?? t.info.defaultAspect, durationSec: t.info.durationSec });
  const { width: w, height: h, fps } = doc.settings;
  const out = t.build({ w, h, s: Math.min(w, h), fps, portrait: h > w });
  // split overlapping clips into stacked lanes so the timeline never overlaps
  const lanes: Clip[][] = [];
  for (const group of out.tracks) {
    const sub: Clip[][] = [];
    for (const c of [...group].sort((a, b) => a.start - b.start)) {
      const lane = sub.find((l) => l.every((x) => c.start >= x.start + x.duration || c.start + c.duration <= x.start));
      if (lane) lane.push(c);
      else sub.push([c]);
    }
    lanes.push(...sub);
  }
  doc.tracks = lanes.map((clips, i) => {
    const kind = clips.every((c) => c.type === "text") ? "text" : clips.every((c) => c.type === "effect" || c.type === "adjustment") ? "effects" : i === lanes.length - 1 ? "video" : "overlay";
    const tr = makeTrack(kind, kind === "text" ? "Titles" : kind === "effects" ? "Effects" : kind === "video" ? "Video" : `Layer ${i + 1}`, clips);
    tr.clips.sort((a, b) => a.start - b.start);
    return tr;
  });
  doc.tracks.push(makeTrack("audio", "Music"));
  doc.settings.durationInFrames = Math.round(t.info.durationSec * fps);
  if (out.background) doc.settings.background = out.background;
  return ProjectDoc.parse(doc);
}
