import { z } from "zod";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { requireProject } from "@/server/services/projects";
import { planEdits } from "@/server/ai/assistant";
import { ProjectDoc } from "@/lib/project/schema";

const Body = z.object({
  projectId: z.string(),
  instruction: z.string().min(1).max(4000),
  doc: z.unknown(),
  selection: z.array(z.string()).default([]),
  playhead: z.number().int().min(0).default(0),
});

export const maxDuration = 120;

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  await rateLimit(`assistant:${u.id}`, 120, 3600);
  const b = Body.parse(await req.json());
  await requireProject(b.projectId, u.id, "edit");
  const doc = ProjectDoc.parse(b.doc);
  const plan = await planEdits(b.instruction, { doc, selection: b.selection, playhead: b.playhead });
  return json(plan);
});
