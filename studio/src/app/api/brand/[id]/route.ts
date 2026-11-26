import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { BrandKitData } from "@/lib/brand";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route(async (req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const b = z.object({ name: z.string().min(1).max(80), data: BrandKitData, isDefault: z.boolean() }).partial().parse(await req.json());
  const kit = await db.brandKit.findFirst({ where: { id, ownerId: u.id } });
  if (!kit) throw new HttpError(404, "Brand kit not found");
  if (b.data?.logoAssetId && !(await db.asset.findFirst({ where: { id: b.data.logoAssetId, ownerId: u.id } }))) throw new HttpError(400, "Logo asset not found");
  if (b.isDefault) await db.brandKit.updateMany({ where: { ownerId: u.id }, data: { isDefault: false } });
  const updated = await db.brandKit.update({ where: { id }, data: b });
  return json({ kit: updated });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const r = await db.brandKit.deleteMany({ where: { id, ownerId: u.id } });
  if (!r.count) throw new HttpError(404, "Brand kit not found");
  return json({ ok: true });
});
