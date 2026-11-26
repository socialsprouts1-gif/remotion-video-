import { z } from "zod";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { env } from "@/server/env";
import { createCheckout } from "@/server/services/billing";

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const { plan } = z.object({ plan: z.enum(["CREATOR", "STUDIO"]) }).parse(await req.json());
  const url = await createCheckout({ plan, userId: u.id, email: u.email, appUrl: env.appUrl });
  return json({ url });
});
