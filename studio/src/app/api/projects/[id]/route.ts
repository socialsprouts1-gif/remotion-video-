import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { requireProject, saveProject } from "@/server/services/projects";
import { ProjectDoc } from "@/lib/project/schema";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const { project, access } = await requireProject(id, u.id, "view");
  return json({ project: { id: project.id, name: project.name, revision: project.revision, document: project.document, updatedAt: project.updatedAt, ownerId: project.ownerId }, access });
});

const Save = z.object({
  revision: z.number().int(),
  document: z.unknown(),
  name: z.string().max(120).optional(),
  kind: z.enum(["autosave", "snapshot", "ai", "restore"]).optional(),
  label: z.string().max(120).optional(),
});

export const PUT = route(async (req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  await requireProject(id, u.id, "edit");
  const body = Save.parse(await req.json());
  const doc = ProjectDoc.parse(body.document);
  const res = await saveProject(id, body.revision, doc, { kind: body.kind, label: body.label, name: body.name });
  return json(res);
});

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  await requireProject(id, u.id, "edit");
  const body = z.object({ name: z.string().min(1).max(120), archived: z.boolean() }).partial().parse(await req.json());
  await db.project.update({ where: { id }, data: body });
  return json({ ok: true });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  await requireProject(id, u.id, "owner");
  await db.project.delete({ where: { id } });
  return json({ ok: true });
});
