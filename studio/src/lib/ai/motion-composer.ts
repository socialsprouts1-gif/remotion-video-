/**
 * BASIC MOTION COMPOSER — rule-based, no AI model.
 * Builds an editable motion-graphics composition from keywords in the prompt
 * (logo reveal, metallic, neon, particles, glitch, HUD, chart, counter...).
 * Used when Claude is not connected; results are labelled accordingly.
 */
import type { EditCommand } from "../project/ops";

export function composeMotion(prompt: string, size: { width: number; height: number; fps: number; durationSec: number }): { commands: EditCommand[]; summary: string } {
  const p = prompt.toLowerCase();
  const { width: w, height: h, fps } = size;
  const s = Math.min(w, h);
  const dur = Math.round(size.durationSec * fps);
  const cmds: EditCommand[] = [];
  const used: string[] = [];
  const quoted = prompt.match(/["“']([^"”']{1,40})["”']/)?.[1];
  const word = quoted ?? (p.includes("logo") ? "LOGO" : prompt.split(/\s+/).slice(0, 3).join(" ").toUpperCase());

  const bg = p.includes("white background") ? "#ffffff" : p.match(/black|dark/) ? "#000000" : "#07080b";
  if (p.match(/grid|retro|synth/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "grid", name: "Grid", start: 0, duration: dur } });
    used.push("retro grid");
  } else if (p.match(/gradient|orb|abstract|colorful|colourful/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "orbs", name: "Gradient orbs", start: 0, duration: dur } });
    used.push("gradient orbs");
  } else {
    cmds.push({ op: "addClip", clip: { type: "solid", name: "Background", start: 0, duration: dur, color: bg, gradient: bg === "#ffffff" ? null : { kind: "radial", angle: 0, stops: [["#1a1d24", 0], [bg, 70]] } } });
  }
  if (p.match(/particle|dust|sparkle|bokeh/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "particles", name: "Particles", start: 0, duration: dur, blendMode: "screen", params: { direction: "drift", bokeh: 0.6 } } });
    used.push("particles");
  }
  if (p.match(/smoke|fog/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "smoke", name: "Smoke", start: 0, duration: dur, blendMode: "screen" } });
  if (p.match(/fire|ember/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "fire", name: "Embers", start: 0, duration: dur, blendMode: "screen" } });
  if (p.match(/hud|interface|futur|sci-?fi/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "hud", name: "HUD", start: 0, duration: dur, blendMode: "screen" } });
    used.push("HUD");
  }
  if (p.match(/chart|graph|data|stat/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "bar-chart", name: "Chart", start: Math.round(fps * 0.3), duration: dur - Math.round(fps * 0.3), transform: { width: Math.round(w * 0.7), height: Math.round(h * 0.65) } } });
    used.push("animated chart");
  }
  if (p.match(/counter|count up|number/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "counter", name: "Counter", start: 0, duration: dur, transform: { width: Math.round(w * 0.7), height: Math.round(h * 0.45) } } });
  if (p.match(/lower third|name title/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "lower-third", name: "Lower third", start: 0, duration: dur, transform: { width: Math.round(w * 0.46), height: Math.round(h * 0.16), x: Math.round(-w * 0.22), y: Math.round(h * 0.33) } } });

  const metallic = !!p.match(/metal|silver|chrome|steel/);
  const gold = !!p.match(/gold/);
  const neon = !!p.match(/neon|glow/);
  const threeD = !!p.match(/3d|extrud/);
  if (!p.match(/^(?!.*(text|logo|title|type|word)).*(chart|counter|lower third)/)) {
    cmds.push({
      op: "addClip",
      clip: {
        type: "text",
        name: "Title",
        text: word,
        start: Math.round(fps * 0.4),
        duration: Math.max(fps, dur - Math.round(fps * 0.4)),
        style: {
          fontFamily: neon ? "Bebas Neue" : metallic || threeD ? "Unbounded" : p.match(/elegan|luxur|serif/) ? "Playfair Display" : "Syne",
          fontSize: Math.round(s * 0.15),
          fontWeight: 900,
          gradient: metallic ? ["#f4f6fa", "#8d96a6"] : gold ? ["#fff3c4", "#c8902e"] : null,
          glow: neon ? "#ff4fd8" : null,
          color: bg === "#ffffff" ? "#111111" : "#ffffff",
          extrude: threeD || metallic ? 8 : 0,
          extrudeColor: metallic ? "#2a2f38" : "#1a1a1a",
          letterSpacing: 0.05,
        },
        animationIn: { preset: p.match(/glitch/) ? "glitch" : threeD || metallic ? "flip-3d" : p.match(/type/) ? "typewriter" : "kinetic", duration: Math.round(fps * 0.9), splitBy: "letter", stagger: 1.5, easing: "easeOutBack" },
        keyframes: { scale: [{ id: "s0", frame: 0, value: 0.94, easing: "easeOutCubic" }, { id: "s1", frame: Math.max(1, dur - Math.round(fps * 0.4)), value: 1.02, easing: "linear" }] },
        loop: neon ? { preset: "flicker", period: 40, intensity: 1 } : null,
      },
    });
    used.push(`${metallic ? "metallic " : gold ? "gold " : neon ? "neon " : ""}${threeD ? "3D " : ""}title`);
  }
  if (metallic || gold || p.match(/shine|reveal|cinematic light/)) {
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "light-sweep", name: "Light sweep", start: Math.round(fps * 1.2), duration: Math.round(fps * 1.4), blendMode: "screen" } });
    used.push("light sweep");
  }
  if (p.match(/glitch/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "glitch", name: "Glitch", start: 0, duration: dur, blendMode: "screen" } });
  if (p.match(/streak|light trail|speed/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "light-streaks", name: "Light streaks", start: 0, duration: dur, blendMode: "screen" } });
  if (p.match(/cinematic|film/)) cmds.push({ op: "addClip", clip: { type: "effect", effect: "film-grain", name: "Grain", start: 0, duration: dur, blendMode: "overlay", params: { amount: 0.2 } } });
  return { commands: cmds, summary: `Composed ${used.join(", ") || "a titled composition"} from keywords (basic composer, no AI).` };
}
