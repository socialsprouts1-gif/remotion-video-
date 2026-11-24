import Link from "next/link";
import { ArrowRight, Clapperboard, Shapes, Sparkles, Upload, Wand2, Bot, CheckCircle2, CircleDashed } from "lucide-react";
import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { providerStatus } from "@/server/ai/registry";
import { TEMPLATES } from "@/lib/templates";
import { Page } from "@/components/shell/Page";
import { Badge } from "@/components/ui";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { NewProjectButton } from "@/components/projects/NewProjectDialog";
import { TemplateCard } from "@/components/projects/TemplateCard";
import type { ProjectDoc } from "@/lib/project/schema";

export const metadata = { title: "Home" };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const u = await requireUser();
  const [projects, jobs, renders, usage] = await Promise.all([
    db.project.findMany({ where: { ownerId: u.id, archived: false }, orderBy: { updatedAt: "desc" }, take: 6 }),
    db.aiJob.findMany({ where: { ownerId: u.id }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.renderJob.count({ where: { ownerId: u.id, status: "SUCCEEDED" } }),
    db.creditLedger.aggregate({ where: { userId: u.id, delta: { lt: 0 }, createdAt: { gte: new Date(Date.now() - 30 * 864e5) } }, _sum: { delta: true } }),
  ]);
  const status = providerStatus();
  const connected = status.providers.filter((p) => p.configured && !p.isMock);

  const quick = [
    { href: "/ai-studio", icon: Sparkles, title: "Generate video with AI", body: "Describe it — the AI Director plans scenes, typography, pacing and builds an editable timeline.", tone: "from-accent/25 to-glow-cyan/10" },
    { href: "/assets?upload=1", icon: Upload, title: "Edit existing video", body: "Upload footage and cut, grade, caption and animate it on a multi-track timeline.", tone: "from-glow-cyan/20 to-transparent" },
    { href: "/motion", icon: Shapes, title: "Create motion graphics", body: "Kinetic type, logo reveals, HUDs, charts, particles — all editable layers and keyframes.", tone: "from-glow-rose/20 to-transparent" },
    { href: "/animation", icon: Wand2, title: "Generate animation", body: "Bring stills to life with image-to-video and camera motion controls.", tone: "from-glow-amber/20 to-transparent" },
  ];

  return (
    <Page>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="label mb-2 text-accent-soft">Lumora Studio</div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            <span className="text-gradient">Good to see you, {u.name?.split(" ")[0] ?? "creator"}.</span>
          </h1>
          <p className="mt-2 text-sm text-ink-300">What are we making today?</p>
        </div>
        <div className="flex gap-2">
          <NewProjectButton variant="outline">
            <Clapperboard className="h-4 w-4" /> New project
          </NewProjectButton>
          <Link href="/ai-studio" className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft">
            <Sparkles className="h-4 w-4" /> Generate with AI
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${q.tone} p-5 transition hover:border-white/15`}>
            <q.icon className="h-5 w-5 text-white/90" />
            <div className="mt-6 text-[15px] font-semibold">{q.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-ink-300">{q.body}</div>
            <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent projects</h2>
            <Link href="/projects" className="text-xs text-ink-300 hover:text-white">View all →</Link>
          </div>
          {projects.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={{ ...p, updatedAt: p.updatedAt.toISOString(), document: p.document as unknown as ProjectDoc }} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-ink-300">No projects yet — start from a prompt, a template or a blank canvas.</div>
          )}

          <div className="mb-4 mt-12 flex items-center justify-between">
            <h2 className="text-base font-semibold">Popular templates</h2>
            <Link href="/templates" className="text-xs text-ink-300 hover:text-white">Browse all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.slice(0, 3).map((t) => (
              <TemplateCard key={t.id} t={t} />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="panel p-5">
            <div className="label">Usage</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{u.credits.toLocaleString()}</div>
                <div className="text-xs text-ink-400">credits left</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{Math.abs(usage._sum.delta ?? 0).toLocaleString()}</div>
                <div className="text-xs text-ink-400">used (30 days)</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{renders}</div>
                <div className="text-xs text-ink-400">exports</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{u.plan}</div>
                <div className="text-xs text-ink-400">plan</div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <div className="label mb-3">AI integrations</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-ink-400" /> Claude (Director & assistant)</span>
                {status.llm.configured ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Badge tone="warning">not connected</Badge>}
              </div>
              {status.providers.filter((p) => !p.isMock).map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><CircleDashed className="h-4 w-4 text-ink-400" /> {p.name}</span>
                  {p.configured ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Badge>not connected</Badge>}
                </div>
              ))}
            </div>
            {connected.length === 0 ? <p className="mt-3 text-xs text-ink-400">No media-generation provider is connected. Editing, motion graphics, templates and export all work without one; see Settings → Integrations.</p> : null}
          </div>

          <div className="panel p-5">
            <div className="label mb-3">Recent AI generations</div>
            {jobs.length ? (
              <ul className="space-y-2.5">
                {jobs.map((j) => (
                  <li key={j.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-ink-200">{(j.input as { prompt?: string }).prompt?.slice(0, 40) || j.capability}</span>
                    <Badge tone={j.status === "SUCCEEDED" ? "success" : j.status === "FAILED" ? "danger" : j.status === "CANCELED" ? "default" : "info"}>{j.status.toLowerCase()}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-400">Nothing generated yet.</p>
            )}
          </div>
        </aside>
      </div>
    </Page>
  );
}
