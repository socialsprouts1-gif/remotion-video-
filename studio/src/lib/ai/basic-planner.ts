/**
 * BASIC PLANNER — rule-based, no AI model.
 * Used when Claude is not connected. It reads explicit facts from the brief
 * (duration, platform/aspect, category keywords, quoted text, "start with / end
 * with" instructions) and lays out a conventional scene structure. The UI labels
 * results from this planner as "Basic planner (no AI)".
 */
import type { ProductionPlan, StoryboardScene } from "../project/schema";

const CATEGORIES: [RegExp, string, string[]][] = [
  [/perfume|fragrance|luxury|jewel|watch/i, "Luxury product ad", ["#0a0806", "#2a1f14", "#d4a55a"]],
  [/cloth|fashion|apparel|wear|sneaker|shoe/i, "Fashion advertisement", ["#0b0b0f", "#26222e", "#e9e3d5"]],
  [/real estate|property|home tour|apartment|listing/i, "Real estate video", ["#0d1214", "#1f2d33", "#c9a86a"]],
  [/restaurant|food|cafe|menu|dish|coffee/i, "Restaurant promotion", ["#120a07", "#3a1d12", "#ff9a3d"]],
  [/app|saas|software|startup|product launch|ai/i, "Tech product launch", ["#07080b", "#151a2b", "#8b7bff"]],
  [/podcast|interview|episode/i, "Podcast clip", ["#0b0d12", "#1a1f2b", "#5ee1ff"]],
  [/logo|intro|outro/i, "Logo / intro animation", ["#050505", "#1a1a1a", "#ffffff"]],
  [/explainer|how it works|tutorial/i, "Explainer video", ["#0b1020", "#1b2440", "#5effb1"]],
];

function detectDuration(brief: string): number | null {
  const m = brief.match(/(\d{1,3})\s*(?:-|\s)?\s*(?:sec(?:ond)?s?|s\b)/i) ?? brief.match(/(\d{1,2})\s*(?:-|\s)?\s*min(?:ute)?s?/i);
  if (!m) return null;
  const n = Number(m[1]);
  return /min/i.test(m[0]) ? n * 60 : n;
}

function detectAspect(brief: string): ProductionPlan["aspectRatio"] {
  if (/9:16|vertical|reel|tiktok|shorts|story|stories/i.test(brief)) return "9:16";
  if (/1:1|square/i.test(brief)) return "1:1";
  if (/4:5|instagram feed|portrait post/i.test(brief)) return "4:5";
  return "16:9";
}

function detectCamera(text: string): string {
  const map: [RegExp, string][] = [
    [/dolly[- ]?in|push[- ]?in/i, "dolly-in"],
    [/dolly[- ]?out|pull[- ]?back/i, "dolly-out"],
    [/orbit/i, "orbit"],
    [/tracking/i, "tracking"],
    [/crane/i, "crane"],
    [/drone|aerial/i, "drone"],
    [/handheld/i, "handheld"],
    [/pan left/i, "pan left"],
    [/pan right/i, "pan right"],
    [/tilt up/i, "tilt up"],
    [/tilt down/i, "tilt down"],
    [/zoom/i, "zoom"],
    [/fpv/i, "fpv"],
  ];
  return map.find(([re]) => re.test(text))?.[1] ?? "";
}

function subjectOf(brief: string): string {
  const m = brief.match(/for (?:my |our |a |an |the )?([\w\s'-]{3,40}?)(?:\.|,| brand| with| that|$)/i);
  return (m?.[1] ?? "your product").trim();
}

export function basicPlan(brief: string): ProductionPlan {
  const [, category, palette] = CATEGORIES.find(([re]) => re.test(brief)) ?? [null, "Promotional video", ["#07080b", "#1e232e", "#8b7bff"]];
  const durationSec = Math.min(180, Math.max(5, detectDuration(brief) ?? 20));
  const aspectRatio = detectAspect(brief);
  const subject = subjectOf(brief);
  const quoted = [...brief.matchAll(/["“']([^"”']{2,60})["”']/g)].map((m) => m[1]);
  const start = brief.match(/start(?:s|ing)? with ([^.;]+)/i)?.[1];
  const end = brief.match(/end(?:s|ing)? with ([^.;]+)/i)?.[1];
  const cinematic = /cinematic|premium|luxury/i.test(brief);

  const beats: Omit<StoryboardScene, "durationSec">[] = [
    { title: "Hook", description: start ? `Opening: ${start.trim()}` : `Striking opening shot that introduces ${subject}.`, visualPrompt: `${start ?? `cinematic close-up of ${subject}`}, ${cinematic ? "dramatic lighting, shallow depth of field" : "clean bright lighting"}`, camera: detectCamera(start ?? brief) || "dolly-in", lighting: cinematic ? "low-key, rim light" : "soft key", onScreenText: quoted[0] ?? "", transition: "fade", motion: "slow" },
    { title: "Detail", description: `Macro details and textures of ${subject}.`, visualPrompt: `macro detail shots of ${subject}, texture, slow motion`, camera: "orbit", lighting: "specular highlights", onScreenText: quoted[1] ?? "", transition: "blur", motion: "smooth" },
    { title: "Benefit", description: `Show ${subject} in use and the key benefit.`, visualPrompt: `${subject} in a lifestyle setting, natural movement`, camera: "tracking", lighting: "natural", onScreenText: quoted[2] ?? "", transition: "slide-left", motion: "dynamic" },
    { title: "Close", description: end ? `Ending: ${end.trim()}` : `Hero end card with ${subject} and call to action.`, visualPrompt: `hero shot of ${subject}, clean background, space for logo`, camera: "dolly-out", lighting: "clean studio", onScreenText: quoted[3] ?? subject.replace(/\b\w/g, (c) => c.toUpperCase()), transition: "zoom-in", motion: "settle" },
  ];
  const n = durationSec <= 8 ? 2 : 4;
  const chosen = n === 2 ? [beats[0], beats[3]] : beats;
  const weights = n === 2 ? [0.5, 0.5] : [0.25, 0.25, 0.25, 0.25];
  return {
    title: `${category}: ${subject}`.slice(0, 80),
    category,
    aspectRatio,
    durationSec,
    creativeDirection: {
      summary: `Rule-based structure (hook → detail → benefit → close) derived from your brief. Connect Claude for real creative direction.`,
      visualStyle: cinematic ? "cinematic, premium" : "clean, modern",
      palette,
      typography: { headline: cinematic ? "Playfair Display" : "Syne", body: "Inter" },
      music: cinematic ? "slow building orchestral / ambient" : "upbeat modern electronic",
      pacing: durationSec <= 15 ? "fast" : "measured",
      lighting: cinematic ? "dramatic" : "bright",
    },
    scenes: chosen.map((b, i) => ({ ...b, durationSec: Math.round(durationSec * weights[i] * 10) / 10 })),
  };
}
