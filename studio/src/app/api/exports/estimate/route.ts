import { z } from "zod";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { requireProject } from "@/server/services/projects";
import { ExportSettings, ProjectDoc } from "@/lib/project/schema";
import { estimateBytes, outputSize, prepareExportDoc } from "@/server/render/render-doc";

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const body = z.object({ projectId: z.string(), settings: ExportSettings }).parse(await req.json());
  const { project } = await requireProject(body.projectId, u.id, "view");
  const doc = prepareExportDoc(ProjectDoc.parse(project.document), body.settings);
  const size = outputSize(doc, body.settings.resolution);
  return json({ bytes: estimateBytes(doc, body.settings), width: size.width, height: size.height, durationSec: doc.settings.durationInFrames / doc.settings.fps });
});
