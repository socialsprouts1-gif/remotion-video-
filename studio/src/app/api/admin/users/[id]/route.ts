import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireAdmin } from "@/server/auth/session";

export const PATCH = route(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const b = z.object({ disabled: z.boolean(), role: z.enum(["USER", "ADMIN"]), plan: z.enum(["FREE", "CREATOR", "STUDIO", "ENTERPRISE"]), grantCredits: z.number().int().min(-100000).max(100000) }).partial().parse(await req.json());
  const { grantCredits, ...rest } = b;
  await db.user.update({ where: { id }, data: { ...rest, ...(grantCredits ? { credits: { increment: grantCredits } } : {}) } });
  if (grantCredits) await db.creditLedger.create({ data: { userId: id, delta: grantCredits, reason: `Admin adjustment by ${admin.email}` } });
  if (b.disabled) await db.session.deleteMany({ where: { userId: id } });
  return json({ ok: true });
});
