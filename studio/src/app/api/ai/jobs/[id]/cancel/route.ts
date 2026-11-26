import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { aiQueue } from "@/server/queue/queues";
import { refundCredits } from "@/server/services/credits";

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const job = await db.aiJob.findFirst({ where: { id, ownerId: u.id } });
  if (!job || !["QUEUED", "RUNNING"].includes(job.status)) throw new HttpError(409, "Job is not running");
  await db.aiJob.update({ where: { id }, data: { status: "CANCELED" } });
  // a queued job never reached the worker, so refund here; running jobs are refunded by the worker
  const removed = await aiQueue().remove(id).catch(() => 0);
  if (job.status === "QUEUED" && removed) await refundCredits(u.id, job.costCredits, `Refund: ${job.capability} canceled`, id);
  return json({ ok: true });
});
