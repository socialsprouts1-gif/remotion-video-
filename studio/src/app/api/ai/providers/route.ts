import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { providerStatus } from "@/server/ai/registry";

export const GET = route(async () => {
  await requireUser();
  return json(providerStatus());
});
