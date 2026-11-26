import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { BrandKitData } from "@/lib/brand";

export const GET = route(async () => {
  const u = await requireUser();
  const kits = await db.brandKit.findMany({ where: { ownerId: u.id }, orderBy: { createdAt: "asc" } });
  return json({ kits });
});

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const b = z.object({ name: z.string().min(1).max(80), data: BrandKitData.default({}) }).parse(await req.json());
  const count = await db.brandKit.count({ where: { ownerId: u.id } });
  const kit = await db.brandKit.create({ data: { ownerId: u.id, name: b.name, data: b.data, isDefault: count === 0 } });
  return json({ kit }, 201);
});
