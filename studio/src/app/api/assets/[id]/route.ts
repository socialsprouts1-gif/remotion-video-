import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { storage } from "@/server/storage";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const body = z.object({ name: z.string().min(1).max(200) }).parse(await req.json());
  const r = await db.asset.updateMany({ where: { id, ownerId: u.id }, data: body });
  if (!r.count) throw new HttpError(404, "Asset not found");
  return json({ ok: true });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const a = await db.asset.findFirst({ where: { id, ownerId: u.id } });
  if (!a) throw new HttpError(404, "Asset not found");
  await db.asset.delete({ where: { id } });
  await storage().remove(a.storageKey);
  if (a.posterKey) await storage().remove(a.posterKey);
  await db.user.update({ where: { id: u.id }, data: { storageBytes: { decrement: a.sizeBytes } } });
  return json({ ok: true });
});
