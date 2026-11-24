import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { createProject } from "@/server/services/projects";
import { directPlan, scriptPlan } from "@/server/ai/director";
import { planToDoc, type BrandHints } from "@/lib/ai/plan-to-doc";
import { ProductionPlan } from "@/lib/project/schema";
import { nanoid } from "@/lib/id";

const Body = z.object({
  brief: z.string().min(3).max(12000),
  mode: z.enum(["brief", "script"]).default("brief"),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]).optional(),
  durationSec: z.number().min(3).max(600).optional(),
  style: z.string().max(200).optional(),
  brandKitId: z.string().optional(),
  /** a previously generated (and possibly user-edited) plan to build into a project */
  plan: ProductionPlan.optional(),
  createProject: z.boolean().default(false),
  name: z.string().max(120).optional(),
});

export const maxDuration = 300;

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const b = Body.parse(await req.json());
  let brand: BrandHints | undefined;
  let brandNotes: string | undefined;
  if (b.brandKitId) {
    const kit = await db.brandKit.findFirst({ where: { id: b.brandKitId, ownerId: u.id } });
    if (kit) {
      const d = kit.data as { colors?: string[]; headlineFont?: string; bodyFont?: string; logoAssetId?: string; voice?: string };
      brand = { colors: d.colors, headlineFont: d.headlineFont, bodyFont: d.bodyFont, logoAssetId: d.logoAssetId, logoSrc: d.logoAssetId ? `/api/media/${d.logoAssetId}` : undefined };
      brandNotes = `${kit.name}: colours ${d.colors?.join(", ")}; fonts ${d.headlineFont}/${d.bodyFont}; ${d.voice ?? ""}`;
    }
  }
  let plan: ProductionPlan | undefined = b.plan;
  let engine: string = "user-edited";
  if (!plan) {
    await rateLimit(`director:${u.id}`, 30, 3600);
    const r = b.mode === "script" ? await scriptPlan(b.brief, { aspect: b.aspect }) : await directPlan(b.brief, { aspect: b.aspect, durationSec: b.durationSec, style: b.style, brandNotes });
    plan = r.plan;
    engine = r.engine;
  }
  if (!plan) throw new Error("no plan");
  if (!b.createProject) return json({ plan, engine });
  const doc = planToDoc(plan, { brand });
  doc.brandKitId = b.brandKitId ?? null;
  doc.aiHistory.push({ id: nanoid(), at: new Date().toISOString(), kind: "director", prompt: b.brief.slice(0, 2000), summary: plan.creativeDirection.summary, engine });
  const project = await createProject(u.id, b.name ?? plan.title, doc);
  return json({ plan, engine, projectId: project.id }, 201);
});
