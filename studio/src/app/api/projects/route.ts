import { z } from "zod";
import { db } from "@/server/db";
import { json, route } from "@/server/http";
import { requireUser } from "@/server/auth/session";
import { createProject } from "@/server/services/projects";
import { newDocument } from "@/lib/project/factory";
import { ProjectDoc } from "@/lib/project/schema";
import { buildTemplate, TEMPLATES } from "@/lib/templates";

const Body = z.object({
  name: z.string().max(120).optional(),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("16:9"),
  fps: z.number().int().min(12).max(60).default(30),
  templateId: z.string().optional(),
  doc: z.unknown().optional(),
});

export const GET = route(async (req: Request) => {
  const u = await requireUser();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const projects = await db.project.findMany({
    where: { OR: [{ ownerId: u.id }, { members: { some: { userId: u.id } } }], archived: false, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) },
    orderBy: { updatedAt: "desc" },
    take: Math.min(100, Number(url.searchParams.get("limit") ?? 50)),
    select: { id: true, name: true, width: true, height: true, fps: true, durationInFrames: true, updatedAt: true, createdAt: true, ownerId: true, thumbnailKey: true, templateId: true },
  });
  return json({ projects });
});

export const POST = route(async (req: Request) => {
  const u = await requireUser();
  const body = Body.parse(await req.json());
  let doc;
  let name = body.name;
  if (body.doc) doc = ProjectDoc.parse(body.doc);
  else if (body.templateId) {
    const t = TEMPLATES.find((x) => x.id === body.templateId);
    doc = buildTemplate(body.templateId, body.aspect);
    name ??= t?.name;
  } else doc = newDocument({ aspect: body.aspect, fps: body.fps });
  const project = await createProject(u.id, name ?? "Untitled project", doc, body.templateId);
  return json({ id: project.id }, 201);
});
