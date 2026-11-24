/**
 * LOCAL COMMAND PARSER — rule-based, no AI model.
 * Understands a fixed set of common editing instructions and turns them into
 * EditCommands. Anything it can't handle is reported back instead of guessed.
 * When Claude is connected the server-side assistant is used instead.
 */
import { allClips, clipEnd, type EditCommand } from "../project/ops";
import type { Clip, ProjectDoc } from "../project/schema";

export interface AssistantContext {
  doc: ProjectDoc;
  selection: string[];
  playhead: number;
}

export interface AssistantRequirement {
  capability: string;
  reason: string;
  clipId?: string;
}

export interface AssistantPlan {
  reply: string;
  commands: EditCommand[];
  /** things the request needs that aren't available (or need a generation job) */
  requires: AssistantRequirement[];
  engine: "claude" | "local-parser";
}

const visual = (c: Clip) => c.type !== "audio";

function targets(ctx: AssistantContext, filter: (c: Clip) => boolean = visual): Clip[] {
  const all = allClips(ctx.doc);
  const sel = all.filter((c) => ctx.selection.includes(c.id) && filter(c));
  if (sel.length) return sel;
  return all.filter((c) => filter(c) && (c.type === "video" || c.type === "image" || c.type === "scene" || c.type === "audio"));
}

function pct(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) / 100 : null;
}

const NEEDS: [RegExp, string, string][] = [
  [/remove (the )?background|background removal|cut ?out/i, "background-removal", "Background removal needs a segmentation model (connect fal.ai)."],
  [/remove (unwanted )?objects?|erase|inpaint/i, "object-removal", "Object removal needs a video inpainting model — not integrated yet."],
  [/blur (the )?faces?|anonymi[sz]e/i, "face-blur", "Face blurring needs a face-detection/tracking model — not integrated yet."],
  [/track (this|the)? ?object|motion track/i, "motion-tracking", "Motion tracking needs a tracking model — not integrated yet."],
  [/upscale|4k upscal|super.?res/i, "video-upscale", "Upscaling needs an upscaling model provider."],
  [/stabili[sz]e/i, "stabilization", "Stabilization is planned (FFmpeg vidstab worker) — not available yet."],
  [/remove silen|cut silen|silent (parts|portions)/i, "silence-removal", "Silence removal needs audio analysis of the source (planned for the Audio Studio)."],
  [/subtitle|caption|transcri/i, "speech-to-text", "Subtitles need a speech-to-text provider. Use “Auto captions” in the Audio tab once one is connected."],
  [/change (the )?(background )?music|add music|background music/i, "music", "Pick a track in the Assets panel or generate one in the Audio Studio, then drop it on the Music track."],
  [/sound effects?|sfx/i, "sound-effect", "Sound effects need a sound-effect provider or an uploaded SFX file."],
  [/voice ?over|narrat/i, "text-to-speech", "Voiceover needs a text-to-speech provider (ElevenLabs)."],
];

export function localAssistant(instruction: string, ctx: AssistantContext): AssistantPlan {
  const text = instruction.trim();
  const t = text.toLowerCase();
  const cmds: EditCommand[] = [];
  const notes: string[] = [];
  const requires: AssistantRequirement[] = [];
  const { fps, width, height } = ctx.doc.settings;

  for (const [re, capability, reason] of NEEDS) if (re.test(t)) requires.push({ capability, reason });

  // aspect ratio
  const aspect = t.match(/\b(9:16|16:9|1:1|4:5)\b/) ?? (/(vertical|reel|tiktok|shorts)/.test(t) ? ["9:16", "9:16"] : /square/.test(t) ? ["1:1", "1:1"] : null);
  if (aspect && /(change|convert|make|switch|reframe|turn)/.test(t)) {
    cmds.push({ op: "changeAspect", aspect: aspect[1] as "9:16" });
    notes.push(`Reframed to ${aspect[1]}.`);
  }

  // speed
  const speedMatch = t.match(/(\d+(?:\.\d+)?)\s*x/);
  if (/(faster|speed up|slower|slow down|slow.?mo|speed)/.test(t)) {
    let factor = speedMatch ? Number(speedMatch[1]) : /slow/.test(t) ? 0.5 : 1.5;
    if (/slow/.test(t) && factor > 1) factor = 1 / factor;
    const media = targets(ctx, (c) => c.type === "video" || c.type === "audio");
    for (const c of media) if (c.type === "video" || c.type === "audio") cmds.push({ op: "setSpeed", clipId: c.id, speed: Math.round(c.speed * factor * 100) / 100 });
    if (media.length) notes.push(`Set speed ×${factor.toFixed(2)} on ${media.length} clip(s).`);
    else notes.push("There are no video/audio clips to change speed on.");
  }

  // colour
  const grade = (patch: Record<string, number>, label: string) => {
    const ts = targets(ctx).filter((c) => c.type !== "text");
    for (const c of ts) cmds.push({ op: "updateClip", clipId: c.id, patch: { effects: { ...patch } } });
    if (ts.length) notes.push(`${label} on ${ts.length} clip(s).`);
  };
  if (/warm/.test(t)) grade({ temperature: 0.35, saturation: 1.08 }, "Warmer grade");
  if (/cool|cold|blue(r)? tone/.test(t)) grade({ temperature: -0.35 }, "Cooler grade");
  if (/black and white|b&w|monochrome|grayscale|greyscale/.test(t)) grade({ grayscale: 1, contrast: 1.15 }, "Black & white");
  if (/brighter|brighten/.test(t)) grade({ brightness: 1.15 }, "Brighter");
  if (/darker|darken/.test(t)) grade({ brightness: 0.85 }, "Darker");
  if (/more contrast|punchier|punchy/.test(t)) grade({ contrast: 1.2 }, "More contrast");
  if (/(vibrant|saturat)/.test(t)) grade({ saturation: 1.3 }, "More saturation");

  // cinematic package
  if (/cinematic/.test(t)) {
    const end = ctx.doc.settings.durationInFrames;
    cmds.push({ op: "addClip", clip: { type: "adjustment", name: "Cinematic grade", start: 0, duration: end, effects: { contrast: 1.12, saturation: 0.92, temperature: 0.12, vignette: 0.35 }, letterbox: width > height ? 0.09 : 0 } });
    cmds.push({ op: "addClip", clip: { type: "effect", effect: "film-grain", name: "Film grain", start: 0, duration: end, blendMode: "overlay", params: { amount: 0.25 } } });
    notes.push("Added a cinematic grade (contrast, teal-warm balance, vignette, letterbox) and film grain.");
  }

  // transitions
  const trType = /glitch/.test(t) ? "glitch" : /zoom/.test(t) && /transition/.test(t) ? "zoom-in" : /slide/.test(t) ? "slide-left" : /wipe/.test(t) ? "wipe-left" : /blur/.test(t) && /transition/.test(t) ? "blur" : "fade";
  if (/transition/.test(t) && !/remove/.test(t)) {
    const vids = allClips(ctx.doc).filter((c) => (c.type === "video" || c.type === "image" || c.type === "scene") && c.start > 0);
    for (const c of vids) cmds.push({ op: "setTransition", clipId: c.id, side: "in", transition: { type: trType, duration: Math.round(fps * 0.4), easing: "easeInOutCubic" } });
    notes.push(vids.length ? `Added ${trType} transitions to ${vids.length} clip(s).` : "There are no cuts to add transitions to yet.");
  }

  // zoom effect
  if (/zoom/.test(t) && !/transition/.test(t) && !/timeline/.test(t)) {
    const ts = targets(ctx).filter((c) => c.type === "video" || c.type === "image" || c.type === "scene");
    for (const c of ts) {
      const local = Math.max(0, Math.min(c.duration - 1, ctx.playhead - c.start));
      const at = ctx.selection.length ? local : 0;
      cmds.push({ op: "setKeyframe", clipId: c.id, prop: "scale", frame: at, value: c.transform.scale, easing: "easeInOutCubic" });
      cmds.push({ op: "setKeyframe", clipId: c.id, prop: "scale", frame: Math.min(c.duration - 1, at + Math.round(fps * 0.6)), value: c.transform.scale * 1.2 });
    }
    if (ts.length) notes.push(`Added a punch-in zoom on ${ts.length} clip(s).`);
  }

  // add title
  const title = text.match(/(?:add|create|put)\s+(?:a\s+)?(?:title|text|heading|caption)\s+(?:saying\s+|that says\s+)?["“']([^"”']+)["”']/i) ?? text.match(/(?:add|create)\s+(?:a\s+)?(?:professional\s+)?intro(?:\s+(?:saying|with|for)\s+["“']?([^"”']+)["”']?)?/i);
  if (title) {
    const isIntro = /intro/i.test(title[0]);
    const body = title[1] ?? "Your Title";
    cmds.push({
      op: "addClip",
      clip: {
        type: "text",
        name: isIntro ? "Intro title" : "Title",
        text: body,
        start: isIntro ? 0 : ctx.playhead,
        duration: Math.round(fps * 3),
        style: { fontFamily: "Syne", fontSize: Math.round(Math.min(width, height) * 0.09), fontWeight: 800 },
        animationIn: { preset: "kinetic", duration: 20, splitBy: "word" },
        animationOut: { preset: "fade", duration: 10 },
      },
    });
    if (isIntro) cmds.push({ op: "addClip", clip: { type: "effect", effect: "light-sweep", name: "Intro sweep", start: 0, duration: Math.round(fps * 3), blendMode: "screen" } });
    notes.push(`Added ${isIntro ? "an intro title" : "a title"} “${body}”.`);
  }

  // arrow
  if (/arrow/.test(t)) {
    cmds.push({ op: "addClip", clip: { type: "shape", shape: "arrow", name: "Arrow", start: ctx.playhead, duration: Math.round(fps * 3), fill: "#ffd84d", strokeWidth: 10, transform: { width: Math.round(width * 0.22), height: Math.round(height * 0.12), x: Math.round(-width * 0.2), y: 0, rotation: 0 }, keyframes: { scaleX: [{ id: "a", frame: 0, value: 0.1, easing: "easeOutBack" }, { id: "b", frame: 12, value: 1, easing: "linear" }] }, loop: { preset: "pulse", period: 30, intensity: 1 } } });
    notes.push("Added an animated arrow at the playhead — drag it in the preview inspector to point at your product.");
  }

  // volume / mute
  if (/mute/.test(t)) {
    const ts = targets(ctx, (c) => c.type === "video" || c.type === "audio");
    for (const c of ts) cmds.push({ op: "updateClip", clipId: c.id, patch: { muted: !/unmute/.test(t) } });
    notes.push(`${/unmute/.test(t) ? "Unmuted" : "Muted"} ${ts.length} clip(s).`);
  }
  const vol = pct(t);
  if (/volume/.test(t) && vol !== null) {
    const ts = targets(ctx, (c) => c.type === "video" || c.type === "audio");
    for (const c of ts) cmds.push({ op: "updateClip", clipId: c.id, patch: { volume: vol } });
    notes.push(`Volume ${Math.round(vol * 100)}% on ${ts.length} clip(s).`);
  }

  // delete / split / fades
  if (/(delete|remove) (the )?(selected|this|these)/.test(t) && ctx.selection.length) {
    cmds.push({ op: "removeClips", clipIds: ctx.selection, ripple: /ripple|close (the )?gap/.test(t) });
    notes.push(`Deleted ${ctx.selection.length} clip(s).`);
  }
  if (/split/.test(t)) {
    cmds.push({ op: "splitAt", frame: ctx.playhead, clipIds: ctx.selection.length ? ctx.selection : undefined });
    notes.push("Split at the playhead.");
  }
  if (/close (the )?gaps|remove gaps/.test(t)) {
    cmds.push({ op: "closeGaps" });
    notes.push("Closed gaps on all unlocked tracks.");
  }
  if (/fade (in|out)/.test(t)) {
    const ts = targets(ctx);
    for (const c of ts) {
      if (/fade in/.test(t)) cmds.push({ op: "setTransition", clipId: c.id, side: "in", transition: { type: "fade", duration: Math.round(fps * 0.5), easing: "easeOutCubic" } });
      if (/fade out/.test(t)) cmds.push({ op: "setTransition", clipId: c.id, side: "out", transition: { type: "fade", duration: Math.round(fps * 0.5), easing: "easeInCubic" } });
    }
    notes.push(`Added fades to ${ts.length} clip(s).`);
  }

  // shorten to N seconds
  const cut = t.match(/(?:convert|cut|trim|shorten|make)(?: (?:this|it|the video))?(?: (?:in)?to)?(?: a)? (\d+)[- ]?s(?:ec(?:ond)?s?)?/);
  if (cut) {
    const limit = Number(cut[1]) * fps;
    for (const c of allClips(ctx.doc)) {
      if (c.start >= limit) cmds.push({ op: "removeClips", clipIds: [c.id] });
      else if (clipEnd(c) > limit) cmds.push({ op: "trimClip", clipId: c.id, edge: "end", frame: limit });
    }
    notes.push(`Trimmed the timeline to ${cut[1]}s (cut at the end — Claude can pick the best moments when connected).`);
  }

  if (!cmds.length && !requires.length) {
    return {
      reply:
        "I couldn't match that to an edit with the built-in command parser. Try e.g. “make it warmer”, “add fade transitions”, “change to 9:16”, “make the video 1.5x faster”, “add a title \"Summer Sale\"”, “make it more cinematic”. Connect Claude (ANTHROPIC_API_KEY) for free-form instructions.",
      commands: [],
      requires: [],
      engine: "local-parser",
    };
  }
  const reply = [...notes, ...requires.map((r) => r.reason)].join(" ");
  return { reply, commands: cmds, requires, engine: "local-parser" };
}
