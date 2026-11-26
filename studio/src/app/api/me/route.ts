import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";

export const GET = route(async () => json({ user: await requireUser() }));

export const PATCH = route(async (req: Request) => {
  const u = await requireUser();
  const body = z.object({ name: z.string().min(1).max(100) }).partial().parse(await req.json());
  await db.user.update({ where: { id: u.id }, data: body });
  return json({ ok: true });
});
