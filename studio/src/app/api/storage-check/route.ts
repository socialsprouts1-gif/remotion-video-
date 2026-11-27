import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { checkStorage } from "@/server/storage";

export const dynamic = "force-dynamic";

/** Signed-in diagnostic: shows non-secret storage settings and runs a tiny upload test. */
export const GET = route(async () => {
  await requireUser();
  return json(await checkStorage());
});
