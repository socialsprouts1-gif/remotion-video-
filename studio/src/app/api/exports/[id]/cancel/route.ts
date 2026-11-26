import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { renderQueue } from "@/server/queue/queues";

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const r = await db.renderJob.updateMany({ where: { id, ownerId: u.id, status: { in: ["QUEUED", "RUNNING"] } }, data: { status: "CANCELED", stage: "Canceled", finishedAt: new Date() } });
  if (!r.count) throw new HttpError(409, "Export is not running");
  // queued jobs are removed; running jobs are stopped by the worker, which polls the status
  await renderQueue().remove(id).catch(() => undefined);
  return json({ ok: true });
});
