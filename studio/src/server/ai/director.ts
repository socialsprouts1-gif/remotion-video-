import { ProductionPlan, TRANSITION_TYPES } from "../../lib/project/schema";
import { basicPlan } from "../../lib/ai/basic-planner";
import { FONT_LIBRARY_NAMES } from "../../lib/ai/fonts-list";
import { llmConfigured, llmJson } from "./llm";

const SYSTEM = `You are the AI Director of Lumora Studio, a professional video production tool. You turn a creative brief into a precise, shootable production plan.

Think like an award-winning commercial director and motion designer: strong hook in the first second, varied shot sizes, motivated camera moves, a clear arc (hook → build → payoff → call to action), and on-screen text that is short (max ~6 words per card).

Return ONLY a JSON object with this exact shape:
{
  "title": string,
  "category": string,                       // e.g. "Fashion advertisement"
  "aspectRatio": "16:9" | "9:16" | "1:1" | "4:5",   // infer from platform (Reels/TikTok/Shorts → 9:16)
  "durationSec": number,                    // total; honour the brief if it states one
  "creativeDirection": {
    "summary": string,                      // 2-3 sentences of creative intent
    "visualStyle": string,
    "palette": string[],                    // 3-5 hex colours, darkest first, accent third
    "typography": { "headline": string, "body": string },   // choose from: ${FONT_LIBRARY_NAMES.join(", ")}
    "music": string,                        // genre, tempo (BPM), mood
    "pacing": string,
    "lighting": string
  },
  "scenes": [{
    "title": string,
    "durationSec": number,                  // scene durations should sum to durationSec
    "description": string,                  // what happens, for the editor
    "visualPrompt": string,                 // a detailed text-to-video prompt: subject, action, setting, lens, lighting, mood. No on-screen text in the prompt.
    "camera": string,                       // e.g. "slow dolly-in", "orbit", "tracking shot", "crane up", "drone", "handheld", "pan left", "tilt up", "FPV"
    "lighting": string,
    "onScreenText": string,                 // short title card text or "" for none
    "transition": one of ${JSON.stringify(TRANSITION_TYPES)},   // transition INTO this scene
    "motion": string                        // motion intensity / speed notes
  }]
}
Use 3-8 scenes for typical ads (more for longer scripts). Never include brand names the user did not give you.`;

export async function directPlan(brief: string, opts: { aspect?: string; durationSec?: number; style?: string; brandNotes?: string } = {}) {
  if (!llmConfigured()) return { plan: basicPlan(brief), engine: "basic-planner" as const };
  const extras = [
    opts.aspect ? `Required aspect ratio: ${opts.aspect}.` : "",
    opts.durationSec ? `Required total duration: ${opts.durationSec} seconds.` : "",
    opts.style ? `Visual style preference: ${opts.style}.` : "",
    opts.brandNotes ? `Brand identity to respect: ${opts.brandNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const plan = await llmJson({ system: SYSTEM, user: `Creative brief:\n${brief}\n\n${extras}`, schema: ProductionPlan, effort: "medium" });
  if (opts.aspect) plan.aspectRatio = opts.aspect as ProductionPlan["aspectRatio"];
  if (opts.durationSec) plan.durationSec = opts.durationSec;
  return { plan, engine: "claude" as const };
}

const SCRIPT_SYSTEM = `${SYSTEM}

The user gives you a full SCRIPT. Split it into scenes that follow the script beat by beat. Put the narration for each scene in "description" prefixed with "VO: ", keep onScreenText to key phrases only, and size each scene's durationSec to the narration length (~2.6 words per second).`;

export async function scriptPlan(script: string, opts: { aspect?: string } = {}) {
  if (!llmConfigured()) return { plan: basicPlan(script), engine: "basic-planner" as const };
  const plan = await llmJson({ system: SCRIPT_SYSTEM, user: `Script:\n${script}\n${opts.aspect ? `Aspect: ${opts.aspect}` : ""}`, schema: ProductionPlan, effort: "medium" });
  if (opts.aspect) plan.aspectRatio = opts.aspect as ProductionPlan["aspectRatio"];
  return { plan, engine: "claude" as const };
}
