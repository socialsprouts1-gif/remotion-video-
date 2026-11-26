import { db } from "@/server/db";
import { HttpError, json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { requireProject, saveProject } from "@/server/services/projects";
import { ProjectDoc } from "@/lib/project/schema";

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string; vid: string }> }) => {
  const u = await requireUser();
  const { id, vid } = await ctx.params;
  const { project } = await requireProject(id, u.id, "edit");
  const v = await db.projectVersion.findFirst({ where: { id: vid, projectId: id } });
  if (!v) throw new HttpError(404, "Version not found");
  const res = await saveProject(id, project.revision, ProjectDoc.parse(v.document), { kind: "restore", label: `Restored ${v.label ?? `revision ${v.revision}`}` });
  return json(res);
});
