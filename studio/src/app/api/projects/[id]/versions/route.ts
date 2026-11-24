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
  await requireProject(id, u.id, "view");
  const versions = await db.projectVersion.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, revision: true, label: true, kind: true, createdAt: true } });
  return json({ versions });
});

/** Create a named snapshot of the current saved state. */
export const POST = route(async (req: Request, ctx: Ctx) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const { project } = await requireProject(id, u.id, "edit");
  const body = z.object({ label: z.string().min(1).max(120) }).parse(await req.json());
  const res = await saveProject(id, project.revision, ProjectDoc.parse(project.document), { kind: "snapshot", label: body.label });
  return json(res, 201);
});
