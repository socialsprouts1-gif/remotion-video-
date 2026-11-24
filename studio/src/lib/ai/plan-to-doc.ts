/**
 * Deterministically turns a ProductionPlan (from the AI Director or the basic
 * planner) into an editable timeline: one storyboard scene slot per scene,
 * animated typography, transitions, overlays and a music bed placeholder track.
 * Every element is a normal editable layer.
 */
import { newDocument, makeClip, makeTrack } from "../project/factory";
import { ProjectDoc, type ProductionPlan, type TransitionType } from "../project/schema";
import { FONT_LIBRARY_NAMES } from "./fonts-list";

export interface BrandHints {
  colors?: string[];
  headlineFont?: string;
  bodyFont?: string;
  logoAssetId?: string;
  logoSrc?: string;
}

function pickFont(name: string | undefined, fallback: string) {
  if (!name) return fallback;
  const hit = FONT_LIBRARY_NAMES.find((f) => name.toLowerCase().includes(f.toLowerCase()));
  return hit ?? fallback;
}

const STYLE_OVERLAYS: [RegExp, "particles" | "light-leak" | "film-grain" | "light-streaks" | "glitch" | "hud" | "smoke"][] = [
  [/luxur|premium|gold|perfume|jewel|elegan/i, "particles"],
  [/warm|vintage|film|nostalg|retro/i, "light-leak"],
  [/cinematic|moody|noir|documentary/i, "film-grain"],
  [/tech|futur|cyber|ai|saas|app|digital/i, "light-streaks"],
  [/glitch|edgy|street|music video/i, "glitch"],
  [/sci-?fi|hud|interface|data/i, "hud"],
  [/fog|mist|smoke|mysterious/i, "smoke"],
];

export function planToDoc(plan: ProductionPlan, opts: { fps?: number; brand?: BrandHints } = {}): ProjectDoc {
  const fps = opts.fps ?? 30;
  const doc = newDocument({ aspect: plan.aspectRatio, fps });
  const { width, height } = doc.settings;
  const short = Math.min(width, height);
  const palette = opts.brand?.colors?.length ? opts.brand.colors : plan.creativeDirection.palette;
  const headline = pickFont(opts.brand?.headlineFont ?? plan.creativeDirection.typography.headline, "Syne");
  const body = pickFont(opts.brand?.bodyFont ?? plan.creativeDirection.typography.body, "Inter");
  const accent = palette[2] ?? palette[1] ?? "#8b7bff";

  const titles = makeTrack("text", "Titles");
  const overlays = makeTrack("effects", "Overlays");
  const scenes = makeTrack("video", "Scenes");
  const music = makeTrack("audio", "Music");

  // normalise durations to the requested total
  const total = Math.max(1, plan.scenes.reduce((s, x) => s + x.durationSec, 0));
  const scale = plan.durationSec > 0 ? plan.durationSec / total : 1;
  let cursor = 0;
  plan.scenes.forEach((scene, i) => {
    const dur = Math.max(Math.round(fps * 1.2), Math.round(scene.durationSec * scale * fps));
    const tr = scene.transition as TransitionType;
    const tDur = Math.min(Math.round(fps * 0.5), Math.floor(dur / 3));
    scenes.clips.push(
      makeClip({
        type: "scene",
        name: `Scene ${i + 1}: ${scene.title}`,
        start: cursor,
        duration: dur,
        sceneIndex: i,
        title: scene.title,
        description: scene.description,
        visualPrompt: scene.visualPrompt,
        camera: scene.camera,
        palette: [palette[0] ?? "#07080b", palette[1] ?? "#1e232e", accent],
        transitionIn: i > 0 ? { type: tr, duration: tDur, easing: "easeInOutCubic" } : { type: "fade", duration: tDur, easing: "easeOutCubic" },
        transitionOut: i === plan.scenes.length - 1 ? { type: "fade", duration: tDur, easing: "easeInCubic" } : null,
      }),
    );
    if (scene.onScreenText.trim()) {
      const isLast = i === plan.scenes.length - 1;
      titles.clips.push(
        makeClip({
          type: "text",
          name: `Title ${i + 1}`,
          text: scene.onScreenText.trim(),
          start: cursor + Math.round(fps * 0.25),
          duration: Math.max(fps, dur - Math.round(fps * 0.5)),
          transform: { y: isLast ? 0 : Math.round(height * 0.28), width: Math.round(width * 0.86), height: Math.round(short * 0.3) },
          style: {
            fontFamily: isLast ? headline : i % 2 ? body : headline,
            fontSize: Math.round(short * (isLast ? 0.1 : 0.075)),
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: isLast ? -0.02 : 0,
            shadow: "0 6px 30px rgba(0,0,0,0.45)",
          },
          animationIn: { preset: i === 0 || isLast ? "kinetic" : "blur-reveal", duration: Math.round(fps * 0.8), splitBy: "word", stagger: 3, easing: "easeOutCubic" },
          animationOut: { preset: "fade", duration: Math.round(fps * 0.3) },
        }),
      );
    }
    cursor += dur;
  });

  const styleText = `${plan.creativeDirection.visualStyle} ${plan.creativeDirection.summary} ${plan.category}`;
  const overlay = STYLE_OVERLAYS.find(([re]) => re.test(styleText))?.[1];
  if (overlay) overlays.clips.push(makeClip({ type: "effect", effect: overlay, name: `Style: ${overlay}`, start: 0, duration: cursor, blendMode: overlay === "film-grain" ? "overlay" : "screen", params: overlay === "particles" ? { color: accent, count: 90 } : {} }));
  if (/cinematic|film|premium|luxur/i.test(styleText))
    overlays.clips.push(makeClip({ type: "adjustment", name: "Cinematic grade", start: 0, duration: cursor, effects: { contrast: 1.08, saturation: 1.05 }, letterbox: plan.aspectRatio === "16:9" ? 0.06 : 0 }));

  if (opts.brand?.logoSrc && opts.brand.logoAssetId) {
    const endLen = Math.round(fps * 2);
    titles.clips.push(
      makeClip({ type: "image", name: "Logo", assetId: opts.brand.logoAssetId, src: opts.brand.logoSrc, fit: "contain", start: Math.max(0, cursor - endLen), duration: endLen, transform: { width: Math.round(short * 0.35), height: Math.round(short * 0.2), y: Math.round(-short * 0.18) }, animationIn: { preset: "pop", duration: 14 } }),
    );
  }

  doc.tracks = [titles, overlays, scenes, music];
  doc.plan = plan;
  doc.settings.durationInFrames = Math.max(fps, cursor);
  doc.settings.background = palette[0] ?? "#000000";
  return ProjectDoc.parse(doc);
}
