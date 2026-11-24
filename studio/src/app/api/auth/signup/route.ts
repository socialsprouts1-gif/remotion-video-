import { z } from "zod";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { HttpError, json, route } from "@/server/http";
import { hashPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";

const Body = z.object({ email: z.string().email().max(200), password: z.string().min(8).max(200), name: z.string().max(100).optional() });

export const POST = route(async (req: Request) => {
  const body = Body.parse(await req.json());
  const email = body.email.toLowerCase().trim();
  await rateLimit(`signup:${req.headers.get("x-forwarded-for") ?? "local"}`, 10, 3600);
  if (await db.user.findUnique({ where: { email } })) throw new HttpError(409, "An account with this email already exists");
  const user = await db.user.create({
    data: { email, name: body.name?.trim() || email.split("@")[0], passwordHash: await hashPassword(body.password), role: env.adminEmails.includes(email) ? "ADMIN" : "USER" },
  });
  await db.creditLedger.create({ data: { userId: user.id, delta: user.credits, reason: "Welcome credits" } });
  await createSession(user.id);
  return json({ ok: true });
});
