import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { StyleProfile } from "@/lib/ai/edit-styles";

export const GET = route(async () => {
  const u = await requireUser();
  const styles = await db.editStyle.findMany({ where: { ownerId: u.id }, orderBy: { createdAt: "desc" } });
  return json({ styles });
});

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const b = z.object({ name: z.string().min(1).max(80), profile: StyleProfile, sourceAssetId: z.string().nullable().optional() }).parse(await req.json());
  const style = await db.editStyle.create({ data: { ownerId: u.id, name: b.name, description: b.profile.description, profile: { ...b.profile, name: b.name }, sourceAssetId: b.sourceAssetId ?? null } });
  return json({ style }, 201);
});
