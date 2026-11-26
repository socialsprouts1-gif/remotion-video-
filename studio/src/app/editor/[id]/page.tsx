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
  const parsed = ProjectDoc.safeParse(p.document);
  if (!parsed.success) {
    // Show what's wrong instead of a blank "Internal Server Error"
    const i = parsed.error.issues[0];
    console.error(`[editor] project ${id} has an invalid document`, parsed.error.issues.slice(0, 5));
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="panel max-w-lg p-6 text-sm">
          <div className="mb-2 font-semibold text-rose-300">This project can&apos;t be opened</div>
          <p className="text-ink-300">Its saved document failed validation at <code>{i?.path.join(".")}</code>: {i?.message}.</p>
          <p className="mt-2 text-ink-400">Open Version history from another project, or restore an earlier version via the API. Other projects are unaffected.</p>
          <a href="/projects" className="mt-4 inline-block text-accent-soft hover:underline">← Back to projects</a>
        </div>
      </div>
    );
  }
  const document = parsed.data;
  return <EditorLoader project={{ id: p.id, name: p.name, revision: p.revision, document }} access={access} />;
}
