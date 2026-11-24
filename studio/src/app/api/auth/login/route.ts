import { z } from "zod";
import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export const POST = route(async (req: Request) => {
  const body = Body.parse(await req.json());
  const email = body.email.toLowerCase().trim();
  await rateLimit(`login:${email}`, 10, 600);
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) throw new HttpError(401, "Incorrect email or password");
  if (user.disabled) throw new HttpError(403, "This account is disabled");
  await createSession(user.id);
  return json({ ok: true });
});
