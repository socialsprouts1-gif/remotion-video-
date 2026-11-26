"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Button, Field, Notice } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

interface Plan { id: string; name: string; price: number; credits: number; features: string[] }

export function SettingsClient({ name, email, plans, currentPlan, stripe }: { name: string; email: string; plans: Plan[]; currentPlan: string; stripe: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [n, setN] = useState(name);
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <section className="panel space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-sm font-semibold">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input className="field" value={n} onChange={(e) => setN(e.target.value)} /></Field>
          <Field label="Email"><input className="field opacity-70" value={email} disabled /></Field>
        </div>
        <Button size="sm" className="mt-3" loading={busy === "name"} onClick={async () => { setBusy("name"); await api("/api/me", { method: "PATCH", body: { name: n } }).then(() => toast.success("Saved"), (e) => toast.error(e.message)); setBusy(null); router.refresh(); }}>Save</Button>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold">Plan</h2>
        {params.get("billing") === "success" ? <div className="mb-3"><Notice tone="success" title="Payment received">Your plan updates as soon as Stripe confirms the subscription.</Notice></div> : null}
        {!stripe ? <div className="mb-3"><Notice tone="info" title="Payments not configured">Plans are shown for reference. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and STRIPE_PRICE_CREATOR / STRIPE_PRICE_STUDIO to enable checkout.</Notice></div> : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={cn("rounded-xl border p-4", p.id === currentPlan ? "border-accent/50 bg-accent/5" : "border-white/[0.06]")}>
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">{p.name}</span>{p.id === currentPlan ? <Badge tone="accent">current</Badge> : null}</div>
              <div className="mt-1 text-xl font-bold">${p.price}<span className="text-xs font-normal text-ink-400">/mo</span></div>
              <ul className="mt-3 space-y-1 text-[11px] text-ink-300">{p.features.map((f) => <li key={f} className="flex gap-1.5"><Check className="h-3 w-3 shrink-0 text-emerald-300" />{f}</li>)}</ul>
              {p.id !== "FREE" && p.id !== currentPlan ? (
                <Button size="xs" variant="primary" className="mt-3 w-full" disabled={!stripe} loading={busy === p.id} onClick={async () => {
                  setBusy(p.id);
                  try {
                    const r = await api<{ url: string }>("/api/billing/checkout", { method: "POST", body: { plan: p.id } });
                    window.location.href = r.url;
                  } catch (e) {
                    toast.error((e as Error).message);
                    setBusy(null);
                  }
                }}>Upgrade</Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
