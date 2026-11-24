import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { requireProject } from "@/server/services/projects";
import { PLAN_LIMITS } from "@/server/services/credits";
import { renderDto } from "@/server/services/exports";
import { enqueueRender } from "@/server/queue/queues";
import { rateLimit } from "@/server/rate-limit";
import { EXPORT_RESOLUTIONS, ExportSettings, ProjectDoc } from "@/lib/project/schema";

export const GET = route(async (req: Request) => {
  const u = await requireUser();
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  const jobs = await db.renderJob.findMany({ where: { ownerId: u.id, ...(projectId ? { projectId } : {}) }, orderBy: { createdAt: "desc" }, take: 100, include: { project: { select: { name: true } } } });
  return json({ exports: jobs.map(renderDto) });
});

const Body = z.object({ projectId: z.string(), settings: ExportSettings });

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  await rateLimit(`export:${u.id}`, 20, 3600);
  const body = Body.parse(await req.json());
  const { project } = await requireProject(body.projectId, u.id, "edit");
  const doc = ProjectDoc.parse(project.document);
  const limits = PLAN_LIMITS[u.plan];
  const settings = { ...body.settings };
  if (EXPORT_RESOLUTIONS[settings.resolution] > EXPORT_RESOLUTIONS[limits.maxResolution]) throw new HttpError(402, `Your plan exports up to ${limits.maxResolution}. Upgrade for higher resolutions.`, "plan_limit");
  if (limits.watermark) settings.watermark = true;
  const minutes = doc.settings.durationInFrames / doc.settings.fps / 60;
  if (minutes > limits.maxRenderMinutes) throw new HttpError(402, `Your plan renders videos up to ${limits.maxRenderMinutes} min.`, "plan_limit");
  const active = await db.renderJob.count({ where: { ownerId: u.id, status: { in: ["QUEUED", "RUNNING"] } } });
  if (active >= 5) throw new HttpError(429, "You already have 5 exports in the queue.");
  const job = await db.renderJob.create({
    data: {
      ownerId: u.id,
      projectId: project.id,
      projectRevision: project.revision,
      document: doc as unknown as Prisma.InputJsonValue,
      settings: settings as unknown as Prisma.InputJsonValue,
      stage: "Waiting for a render worker",
    },
  });
  try {
    await enqueueRender(job.id);
  } catch (e) {
    await db.renderJob.update({ where: { id: job.id }, data: { status: "FAILED", error: "Render queue unavailable (is Redis running?)" } });
    throw new HttpError(503, "Render queue unavailable. Check REDIS_URL and that the render worker is running.");
  }
  return json({ export: renderDto(job) }, 201);
});
