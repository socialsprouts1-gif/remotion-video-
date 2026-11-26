import { z } from "zod";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { createProject } from "@/server/services/projects";
import { planEdits } from "@/server/ai/assistant";
import { llmConfigured } from "@/server/ai/llm";
import { composeMotion } from "@/lib/ai/motion-composer";
import { newDocument } from "@/lib/project/factory";
import { applyCommands } from "@/lib/project/ops";
import { nanoid } from "@/lib/id";

const Body = z.object({ prompt: z.string().min(3).max(12000), aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("16:9"), durationSec: z.number().min(1).max(60).default(5) });

export const maxDuration = 120;

/** AI motion-graphics generator: prompt → editable layers + keyframes in a new project. */
export const POST = route(async (req: Request) => {
  const u = await requireUser();
  await rateLimit(`motion:${u.id}`, 40, 3600);
  const b = Body.parse(await req.json());
  const base = newDocument({ aspect: b.aspect, durationSec: b.durationSec });
  const { width, height, fps } = base.settings;
  let commands;
  let summary;
  let engine: string;
  if (llmConfigured()) {
    const instruction = `Create a complete ${b.durationSec}-second motion graphics composition from scratch on this empty ${width}x${height} canvas at ${fps}fps: "${b.prompt}".
Build it entirely from editable layers: solids/gradients for backgrounds, text with rich style (gradient, extrude, glow, stroke), shapes, procedural effects (particles, light-sweep, light-streaks, orbs, grid, hud, glitch, smoke, fire, film-grain, bar-chart, counter, lower-third...), and explicit keyframes with easing for position/scale/rotation/opacity/blur/color plus in/out animation presets and loops. Follow the motion design playbook: layered depth (background, mid, foreground), staggered eased entrances, a light sweep or accent at the hero moment, continuity between beats, and a clean held end frame. Aim for 8-20 layers with deliberate keyframes — this must look like a premium studio piece, not a template. Every clip must lie within frames 0..${b.durationSec * fps}.`;
    const r = await planEdits(instruction, { doc: base, selection: [], playhead: 0 });
    commands = r.commands;
    summary = r.reply;
    engine = "claude";
  } else {
    const r = composeMotion(b.prompt, { width, height, fps, durationSec: b.durationSec });
    commands = r.commands;
    summary = r.summary;
    engine = "basic-composer";
  }
  const { doc } = applyCommands(base, commands);
  doc.settings.durationInFrames = Math.round(b.durationSec * fps);
  doc.aiHistory.push({ id: nanoid(), at: new Date().toISOString(), kind: "motion", prompt: b.prompt, summary, engine });
  const project = await createProject(u.id, b.prompt.slice(0, 60), doc);
  return json({ projectId: project.id, summary, engine }, 201);
});
