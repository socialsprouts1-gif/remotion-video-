import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { renderDto } from "@/server/services/exports";
import { storage } from "@/server/storage";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const j = await db.renderJob.findFirst({ where: { id, ownerId: u.id }, include: { project: { select: { name: true } } } });
  if (!j) throw new HttpError(404, "Export not found");
  return json({ export: renderDto(j) });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const j = await db.renderJob.findFirst({ where: { id, ownerId: u.id } });
  if (!j) throw new HttpError(404, "Export not found");
  if (j.status === "RUNNING" || j.status === "QUEUED") throw new HttpError(409, "Cancel the export before deleting it");
  if (j.outputKey) await storage().remove(j.outputKey);
  await db.renderJob.delete({ where: { id } });
  return json({ ok: true });
});
