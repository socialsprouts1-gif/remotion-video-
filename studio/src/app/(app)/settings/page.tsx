import { db } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { providerStatus } from "@/server/ai/registry";
import { PLANS, stripeConfigured } from "@/server/services/billing";
import { PLAN_LIMITS } from "@/server/services/credits";
import { env } from "@/server/env";
import { Page } from "@/components/shell/Page";
import { Badge, PageHeader } from "@/components/ui";
import { formatBytes } from "@/lib/api";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const u = await requireUser();
  const [full, ledger, renders] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: u.id }, select: { storageBytes: true, createdAt: true, googleId: true, passwordHash: true } }),
    db.creditLedger.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 25 }),
    db.renderJob.count({ where: { ownerId: u.id } }),
  ]);
  const status = providerStatus();
  const quota = PLAN_LIMITS[u.plan].storageGb * 1024 ** 3;
  return (
    <Page>
      <PageHeader title="Settings" subtitle="Account, plan & billing, integrations and usage." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsClient name={u.name ?? ""} email={u.email} plans={PLANS.map((p) => ({ ...p, features: [...p.features] }))} currentPlan={u.plan} stripe={stripeConfigured()} />

        <section className="panel p-6">
          <h2 className="mb-4 text-sm font-semibold">Usage</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-2xl font-semibold tabular-nums">{u.credits.toLocaleString()}</div><div className="text-xs text-ink-400">credits</div></div>
            <div><div className="text-2xl font-semibold tabular-nums">{formatBytes(Number(full.storageBytes))}</div><div className="text-xs text-ink-400">of {PLAN_LIMITS[u.plan].storageGb} GB</div></div>
            <div><div className="text-2xl font-semibold tabular-nums">{renders}</div><div className="text-xs text-ink-400">exports</div></div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-accent" style={{ width: `${Math.min(100, (Number(full.storageBytes) / quota) * 100)}%` }} /></div>
          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-ink-400">Credit history</h3>
          <ul className="divide-y divide-white/[0.05] text-xs">
            {ledger.map((l) => (
              <li key={l.id} className="flex justify-between py-1.5">
                <span className="truncate text-ink-300">{l.reason}</span>
                <span className={l.delta >= 0 ? "text-emerald-300" : "text-ink-200"}>{l.delta >= 0 ? "+" : ""}{l.delta}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-6 lg:col-span-2">
          <h2 className="mb-1 text-sm font-semibold">Integrations</h2>
          <p className="mb-4 text-xs text-ink-400">Keys live only in the server environment (.env) and are never sent to the browser. Features that need a missing integration show an “integration required” state instead of fake results.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Anthropic Claude</span>{status.llm.configured ? <Badge tone="success">connected</Badge> : <Badge tone="warning">not connected</Badge>}</div>
              <p className="mt-1 text-xs text-ink-400">AI Director, editing assistant, motion generator, script-to-video.</p>
              <code className="mt-2 block text-[11px] text-ink-300">ANTHROPIC_API_KEY</code>
            </div>
            {status.providers.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">{p.name}</span>{p.configured ? <Badge tone="success">connected</Badge> : <Badge>{p.isMock ? "disabled" : "not connected"}</Badge>}</div>
                <p className="mt-1 text-xs text-ink-400">{[...new Set(p.models.map((m) => m.capability))].join(", ")}</p>
                <code className="mt-2 block text-[11px] text-ink-300">{p.envKeys.join(", ")}</code>
                {p.models.some((m) => !m.verified) ? <p className="mt-1 text-[11px] text-amber-300/80">Model ids are configurable and not yet verified against the live catalogue.</p> : null}
              </div>
            ))}
            {status.planned.map((p) => (
              <div key={p.id} className="rounded-xl border border-dashed border-white/[0.08] p-4 opacity-70">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">{p.name}</span><Badge>adapter planned</Badge></div>
                <p className="mt-1 text-xs text-ink-400">{p.capabilities.join(", ")}</p>
              </div>
            ))}
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Stripe billing</span>{stripeConfigured() ? <Badge tone="success">connected</Badge> : <Badge>not connected</Badge>}</div>
              <code className="mt-2 block text-[11px] text-ink-300">STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*</code>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Google sign-in</span>{env.googleClientId ? <Badge tone="success">connected</Badge> : <Badge>not connected</Badge>}</div>
              <code className="mt-2 block text-[11px] text-ink-300">GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET</code>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
