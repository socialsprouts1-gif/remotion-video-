import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { HttpError } from "../http";
import { ProjectDoc, parseDoc } from "../../lib/project/schema";

export type Access = "view" | "comment" | "edit" | "owner";
const RANK: Record<Access, number> = { view: 0, comment: 1, edit: 2, owner: 3 };

export async function projectAccess(projectId: string, userId: string): Promise<Access | null> {
  const p = await db.project.findUnique({ where: { id: projectId }, select: { ownerId: true, members: { where: { userId }, select: { role: true } } } });
  if (!p) return null;
  if (p.ownerId === userId) return "owner";
  const m = p.members[0];
  if (!m) return null;
  return m.role === "EDITOR" ? "edit" : m.role === "COMMENTER" ? "comment" : "view";
}

export async function requireProject(projectId: string, userId: string, need: Access) {
  const access = await projectAccess(projectId, userId);
  if (!access) throw new HttpError(404, "Project not found");
  if (RANK[access] < RANK[need]) throw new HttpError(403, "You don't have permission for this project");
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId } });
  return { project, access };
}

export function docColumns(doc: ProjectDoc) {
  return {
    width: doc.settings.width,
    height: doc.settings.height,
    fps: doc.settings.fps,
    durationInFrames: doc.settings.durationInFrames,
    document: doc as unknown as Prisma.InputJsonValue,
  };
}

export async function createProject(ownerId: string, name: string, doc: ProjectDoc, templateId?: string) {
  const valid = parseDoc(doc);
  const project = await db.project.create({ data: { ownerId, name: name.slice(0, 120) || "Untitled project", templateId, ...docColumns(valid) } });
  await db.projectVersion.create({ data: { projectId: project.id, revision: 1, kind: "snapshot", label: "Created", document: valid as unknown as Prisma.InputJsonValue } });
  return project;
}

/**
 * Save with optimistic concurrency: the client sends the revision it edited.
 * Autosaves create a version at most every 5 minutes; explicit snapshots always do.
 */
export async function saveProject(projectId: string, baseRevision: number, doc: ProjectDoc, opts: { kind?: "autosave" | "snapshot" | "ai" | "restore"; label?: string; name?: string } = {}) {
  const valid = parseDoc(doc);
  const updated = await db.project.updateMany({
    where: { id: projectId, revision: baseRevision },
    data: { ...docColumns(valid), revision: { increment: 1 }, ...(opts.name ? { name: opts.name.slice(0, 120) } : {}) },
  });
  if (updated.count === 0) {
    const cur = await db.project.findUnique({ where: { id: projectId }, select: { revision: true } });
    throw new HttpError(409, `Project was changed elsewhere (server revision ${cur?.revision}). Reload to get the latest version.`, "conflict");
  }
  const revision = baseRevision + 1;
  const kind = opts.kind ?? "autosave";
  let snapshot = kind !== "autosave";
  if (!snapshot) {
    const last = await db.projectVersion.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    snapshot = !last || Date.now() - last.createdAt.getTime() > 5 * 60_000;
  }
  if (snapshot) {
    await db.projectVersion.create({ data: { projectId, revision, kind, label: opts.label ?? null, document: valid as unknown as Prisma.InputJsonValue } });
    // retention: keep the latest 60 autosave versions
    const old = await db.projectVersion.findMany({ where: { projectId, kind: "autosave" }, orderBy: { createdAt: "desc" }, skip: 60, select: { id: true } });
    if (old.length) await db.projectVersion.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  }
  return { revision };
}
