import { notFound, redirect } from "next/navigation";
import { getUser } from "@/server/auth/session";
import { projectAccess } from "@/server/services/projects";
import { db } from "@/server/db";
import { ProjectDoc } from "@/lib/project/schema";
import { EditorLoader } from "./EditorLoader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.project.findUnique({ where: { id }, select: { name: true } });
  return { title: p?.name ?? "Editor" };
}

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  const { id } = await params;
  if (!user) redirect(`/login?next=/editor/${id}`);
  const access = await projectAccess(id, user.id);
  if (!access) notFound();
  const p = await db.project.findUniqueOrThrow({ where: { id } });
  const document = ProjectDoc.parse(p.document);
  return <EditorLoader project={{ id: p.id, name: p.name, revision: p.revision, document }} access={access} />;
}
