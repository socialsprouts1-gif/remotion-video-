import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getUser } from "@/server/auth/session";
import { providerStatus } from "@/server/ai/registry";
import { RENDER_QUEUE, AI_QUEUE, workerCount, renderQueue, aiQueue } from "@/server/queue/queues";
import { Page } from "@/components/shell/Page";
import { Badge, PageHeader } from "@/components/ui";
import { formatBytes, timeAgo } from "@/lib/api";
import { AdminUsers } from "@/components/settings/AdminUsers";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

async function queueCounts(q: ReturnType<typeof renderQueue>) {
  try {
    return await q.getJobCounts("waiting", "active", "failed", "completed", "delayed");
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const u = await getUser();
  if (u?.role !== "ADMIN") notFound();
  const since = new Date(Date.now() - 30 * 864e5);
  const [users, userCount, projects, storage, renderStats, aiStats, aiByProvider, failedAi, failedRenders, credits, rq, aq, rw, aw] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, email: true, name: true, role: true, plan: true, credits: true, disabled: true, storageBytes: true, createdAt: true } }),
    db.user.count(),
    db.project.count(),
    db.user.aggregate({ _sum: { storageBytes: true } }),
    db.renderJob.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: since } } }),
    db.aiJob.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: since } } }),
    db.aiJob.groupBy({ by: ["provider", "capability"], _count: true, _sum: { costCredits: true, costUsd: true }, where: { createdAt: { gte: since } } }),
    db.aiJob.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, provider: true, capability: true, error: true, createdAt: true } }),
    db.renderJob.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, error: true, createdAt: true } }),
    db.creditLedger.aggregate({ _sum: { delta: true }, where: { delta: { lt: 0 }, createdAt: { gte: since } } }),
    queueCounts(renderQueue()),
    queueCounts(aiQueue()),
    workerCount(RENDER_QUEUE),
    workerCount(AI_QUEUE),
  ]);
  const status = providerStatus();
  const stat = (rows: { status: string; _count: number }[], s: string) => rows.find((r) => r.status === s)?._count ?? 0;
  return (
    <Page>
      <PageHeader eyebrow="Admin" title="Platform dashboard" subtitle="Users, usage, generation analytics, queues and system health (last 30 days)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Users", userCount.toLocaleString()],
          ["Projects", projects.toLocaleString()],
          ["Storage", formatBytes(Number(storage._sum.storageBytes ?? 0))],
          ["Credits spent", Math.abs(credits._sum.delta ?? 0).toLocaleString()],
          ["Renders ok / failed", `${stat(renderStats, "SUCCEEDED")} / ${stat(renderStats, "FAILED")}`],
          ["AI jobs ok / failed", `${stat(aiStats, "SUCCEEDED")} / ${stat(aiStats, "FAILED")}`],
          ["Render queue", rq ? `${rq.active} active · ${rq.waiting} waiting` : "Redis unavailable"],
          ["Workers", `${rw < 0 ? "?" : rw} render · ${aw < 0 ? "?" : aw} AI`],
        ].map(([k, v]) => (
          <div key={k} className="panel p-4">
            <div className="text-xs text-ink-400">{k}</div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      {rw === 0 ? <p className="mt-3 text-xs text-amber-300">No render worker is connected — exports will wait in the queue. Run <code>npm run worker</code>.</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-3 text-sm font-semibold">API usage by provider</h2>
          <table className="w-full text-xs">
            <thead className="text-left text-ink-400"><tr><th className="py-1">Provider</th><th>Capability</th><th className="text-right">Jobs</th><th className="text-right">Credits</th></tr></thead>
            <tbody>
              {aiByProvider.map((r) => (
                <tr key={r.provider + r.capability} className="border-t border-white/[0.05]"><td className="py-1.5">{r.provider}</td><td>{r.capability}</td><td className="text-right">{r._count}</td><td className="text-right">{r._sum.costCredits ?? 0}</td></tr>
              ))}
              {!aiByProvider.length ? <tr><td colSpan={4} className="py-3 text-ink-500">No AI jobs yet.</td></tr> : null}
            </tbody>
          </table>
          <h3 className="mb-2 mt-5 text-xs font-semibold text-ink-300">Provider configuration</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={status.llm.configured ? "success" : "default"}>Claude</Badge>
            {status.providers.map((p) => <Badge key={p.id} tone={p.configured ? "success" : "default"}>{p.name}</Badge>)}
          </div>
          <p className="mt-2 text-[11px] text-ink-500">Queue health: AI {aq ? `${aq.active} active, ${aq.waiting} waiting, ${aq.failed} failed` : "unavailable"}.</p>
        </section>
        <section className="panel p-5">
          <h2 className="mb-3 text-sm font-semibold">Recent failures</h2>
          <ul className="space-y-2 text-xs">
            {[...failedAi.map((f) => ({ id: f.id, what: `${f.provider} · ${f.capability}`, error: f.error, at: f.createdAt })), ...failedRenders.map((f) => ({ id: f.id, what: "render", error: f.error, at: f.createdAt }))]
              .sort((a, b) => b.at.getTime() - a.at.getTime())
              .slice(0, 12)
              .map((f) => (
                <li key={f.id} className="rounded-lg bg-ink-850 p-2">
                  <div className="flex justify-between"><span className="font-medium">{f.what}</span><span className="text-ink-500">{timeAgo(f.at)}</span></div>
                  <div className="mt-0.5 line-clamp-2 text-rose-300/80">{f.error}</div>
                </li>
              ))}
            {!failedAi.length && !failedRenders.length ? <li className="text-ink-500">No failures.</li> : null}
          </ul>
        </section>
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold">Users</h2>
        <AdminUsers users={users.map((x) => ({ ...x, storageBytes: Number(x.storageBytes), createdAt: x.createdAt.toISOString() }))} selfId={u.id} />
      </section>
    </Page>
  );
}
