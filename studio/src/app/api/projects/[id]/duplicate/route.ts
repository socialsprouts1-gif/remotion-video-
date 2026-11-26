import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createProject, requireProject } from "@/server/services/projects";
import { ProjectDoc } from "@/lib/project/schema";

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireUser();
  const { id } = await ctx.params;
  const { project } = await requireProject(id, u.id, "view");
  const copy = await createProject(u.id, `${project.name} (copy)`, ProjectDoc.parse(project.document), project.templateId ?? undefined);
  return json({ id: copy.id }, 201);
});
