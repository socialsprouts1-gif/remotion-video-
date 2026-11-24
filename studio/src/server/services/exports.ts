import type { RenderJob } from "@prisma/client";
import { absoluteSigned } from "../storage/sign";
import type { ExportSettings, ProjectDoc } from "../../lib/project/schema";

/** Rewrite relative media URLs (/api/media/:id) into absolute, signed URLs the render browser can fetch. */
export function resolveMediaForRender(doc: ProjectDoc): ProjectDoc {
  const out = structuredClone(doc);
  for (const t of out.tracks)
    for (const c of t.clips)
      if ((c.type === "video" || c.type === "audio" || c.type === "image") && c.src.startsWith("/api/media/")) {
        const p = c.src.split("?")[0];
        c.src = absoluteSigned(p, 12 * 3600);
      }
  return out;
}

export function renderDto(j: RenderJob & { project?: { name: string } | null }) {
  const settings = j.settings as unknown as ExportSettings;
  return {
    id: j.id,
    projectId: j.projectId,
    projectName: j.project?.name ?? null,
    status: j.status,
    progress: j.progress,
    stage: j.stage,
    error: j.error,
    settings,
    outputBytes: j.outputBytes ? Number(j.outputBytes) : null,
    createdAt: j.createdAt,
    startedAt: j.startedAt,
    finishedAt: j.finishedAt,
    downloadUrl: j.status === "SUCCEEDED" ? `/api/exports/${j.id}/download` : null,
  };
}
