"use client";
import { useEffect, useState } from "react";
import { Plus, Star, Trash2, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { BrandKitData } from "@/lib/brand";
import { FONT_LIBRARY_NAMES } from "@/lib/ai/fonts-list";
import { Badge, Button, Empty, Field, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useAssets } from "@/components/editor/assets-store";
import { TEMPLATES } from "@/lib/templates";

interface Kit { id: string; name: string; isDefault: boolean; data: BrandKitData }
const DEFAULT: BrandKitData = { colors: ["#0b0d12", "#ffffff", "#8b7bff"], headlineFont: "Syne", bodyFont: "Inter", logoAssetId: null, watermarkText: "", watermarkLogo: false, introTemplateId: null, outroTemplateId: null, musicPreference: "", voice: "" };

export function BrandKits() {
  const [kits, setKits] = useState<Kit[] | null>(null);
  const [sel, setSel] = useState<Kit | null>(null);
  const [saving, setSaving] = useState(false);
  const { assets, load } = useAssets();
  const load2 = () => api<{ kits: Kit[] }>("/api/brand").then((r) => {
    setKits(r.kits);
    setSel((s) => r.kits.find((k) => k.id === s?.id) ?? r.kits[0] ?? null);
  });
  useEffect(() => {
    void load2();
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    const r = await api<{ kit: Kit }>("/api/brand", { method: "POST", body: { name: `Brand ${(kits?.length ?? 0) + 1}`, data: DEFAULT } });
    await load2();
    setSel(r.kit);
  }
  async function save() {
    if (!sel) return;
    setSaving(true);
    try {
      await api(`/api/brand/${sel.id}`, { method: "PUT", body: { name: sel.name, data: sel.data } });
      toast.success("Brand kit saved");
      await load2();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const upd = (patch: Partial<BrandKitData>) => sel && setSel({ ...sel, data: { ...sel.data, ...patch } });

  if (!kits) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!kits.length) return <Empty title="No brand kits yet" action={<Button variant="primary" onClick={create} icon={<Plus className="h-4 w-4" />}>Create brand kit</Button>}>Save your logo, colors and fonts once, then apply them everywhere.</Empty>;
  const images = assets.filter((a) => a.kind === "IMAGE");
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-1.5">
        {kits.map((k) => (
          <button key={k.id} onClick={() => setSel(k)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${sel?.id === k.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}>
            <div className="flex">{k.data.colors.slice(0, 3).map((c) => <span key={c} className="-mr-1 h-4 w-4 rounded-full border border-ink-900" style={{ background: c }} />)}</div>
            <span className="ml-2 flex-1 truncate">{k.name}</span>
            {k.isDefault ? <Star className="h-3 w-3 fill-glow-amber text-glow-amber" /> : null}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="w-full" icon={<Plus className="h-3.5 w-3.5" />} onClick={create}>New kit</Button>
      </div>
      {sel ? (
        <div className="panel space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <input className="field max-w-xs text-base font-semibold" value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} />
            {sel.isDefault ? <Badge tone="warning">Default</Badge> : <Button size="sm" variant="ghost" onClick={async () => { await api(`/api/brand/${sel.id}`, { method: "PUT", body: { isDefault: true } }); void load2(); }}>Make default</Button>}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={async () => { if (confirm("Delete this brand kit?")) { await api(`/api/brand/${sel.id}`, { method: "DELETE" }); setSel(null); void load2(); } }}>Delete</Button>
              <Button size="sm" variant="primary" loading={saving} icon={<Save className="h-3.5 w-3.5" />} onClick={save}>Save</Button>
            </div>
          </div>
          <Field label="Brand colors">
            <div className="flex flex-wrap items-center gap-2">
              {sel.data.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-ink-850 p-1">
                  <input type="color" value={c.length === 7 ? c : "#ffffff"} onChange={(e) => upd({ colors: sel.data.colors.map((x, j) => (j === i ? e.target.value : x)) })} className="h-7 w-9" />
                  <span className="font-mono text-[11px]">{c}</span>
                  <button className="px-1 text-ink-500 hover:text-rose-300" onClick={() => upd({ colors: sel.data.colors.filter((_, j) => j !== i) })}>×</button>
                </div>
              ))}
              {sel.data.colors.length < 8 ? <Button size="xs" variant="ghost" onClick={() => upd({ colors: [...sel.data.colors, "#5ee1ff"] })}>+ color</Button> : null}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Headline font">
              <select className="field" value={sel.data.headlineFont} onChange={(e) => upd({ headlineFont: e.target.value })}>{FONT_LIBRARY_NAMES.map((f) => <option key={f}>{f}</option>)}</select>
              <div className="mt-2 text-2xl font-bold" style={{ fontFamily: sel.data.headlineFont }}>The quick brown fox</div>
            </Field>
            <Field label="Body font">
              <select className="field" value={sel.data.bodyFont} onChange={(e) => upd({ bodyFont: e.target.value })}>{FONT_LIBRARY_NAMES.map((f) => <option key={f}>{f}</option>)}</select>
              <div className="mt-2 text-sm" style={{ fontFamily: sel.data.bodyFont }}>Jumps over the lazy dog. 0123456789</div>
            </Field>
          </div>
          <Field label="Logo" hint={images.length ? "Pick an uploaded image (PNG/SVG with transparency works best)." : "Upload your logo in the Assets Library first."}>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((a) => (
                <button key={a.id} onClick={() => upd({ logoAssetId: a.id === sel.data.logoAssetId ? null : a.id })} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-[repeating-conic-gradient(#222_0_25%,#2a2a2a_0_50%)_50%/16px_16px] ${a.id === sel.data.logoAssetId ? "border-accent ring-2 ring-accent/40" : "border-white/10"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.src} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Watermark text"><input className="field" value={sel.data.watermarkText} onChange={(e) => upd({ watermarkText: e.target.value })} placeholder="@yourbrand" /></Field>
            <Field label="Music preference"><input className="field" value={sel.data.musicPreference} onChange={(e) => upd({ musicPreference: e.target.value })} placeholder="warm lo-fi, 90 BPM" /></Field>
            <Field label="Intro template">
              <select className="field" value={sel.data.introTemplateId ?? ""} onChange={(e) => upd({ introTemplateId: e.target.value || null })}><option value="">None</option>{TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            </Field>
            <Field label="Outro template">
              <select className="field" value={sel.data.outroTemplateId ?? ""} onChange={(e) => upd({ outroTemplateId: e.target.value || null })}><option value="">None</option>{TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            </Field>
          </div>
          <Field label="Brand voice & visual identity" hint="Given to the AI Director when this kit is selected.">
            <textarea className="field min-h-[80px]" value={sel.data.voice} onChange={(e) => upd({ voice: e.target.value })} placeholder="Minimal, confident, lots of negative space; never use exclamation marks." />
          </Field>
        </div>
      ) : null}
    </div>
  );
}
