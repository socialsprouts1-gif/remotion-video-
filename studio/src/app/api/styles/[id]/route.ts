import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";

export const DELETE = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const r = await db.editStyle.deleteMany({ where: { id, ownerId: u.id } });
  if (!r.count) throw new HttpError(404, "Style not found");
  return json({ ok: true });
});
