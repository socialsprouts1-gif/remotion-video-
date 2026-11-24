"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { api, formatDuration, timeAgo } from "@/lib/api";
import type { ProjectDoc } from "@/lib/project/schema";
import { toast } from "@/components/ui/toast";
import { ProjectThumb } from "./ProjectThumb";

export interface ProjectSummary { id: string; name: string; width: number; height: number; fps: number; durationInFrames: number; updatedAt: string; document?: ProjectDoc; isOwner?: boolean }

export function ProjectCard({ p, onChanged }: { p: ProjectSummary; onChanged?: () => void }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const act = async (fn: () => Promise<void>) => {
    setMenu(false);
    try {
      await fn();
      onChanged ? onChanged() : router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="group relative">
      <Link href={`/editor/${p.id}`} className="block overflow-hidden rounded-xl border border-white/[0.06] bg-ink-850 transition hover:border-accent/40 hover:shadow-glow">
        <div className="flex aspect-video items-center justify-center overflow-hidden bg-black">
          {p.document ? <ProjectThumb doc={p.document} className="max-h-full max-w-full h-full" /> : null}
        </div>
      </Link>
      <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{p.name}</div>
          <div className="text-xs text-ink-400">
            {p.width}×{p.height} · {formatDuration(p.durationInFrames / p.fps)} · {timeAgo(p.updatedAt)}
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} className="rounded-md p-1 text-ink-400 hover:bg-white/5 hover:text-white" aria-label="Project actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menu ? (
            <div className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-lg border border-white/10 bg-ink-800 py-1 text-sm shadow-xl" onMouseLeave={() => setMenu(false)}>
              <button className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-white/5" onClick={() => act(async () => { const name = prompt("Rename project", p.name); if (name) await api(`/api/projects/${p.id}`, { method: "PATCH", body: { name } }); })}>
                <Pencil className="h-3.5 w-3.5" /> Rename
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-white/5" onClick={() => act(async () => { await api(`/api/projects/${p.id}/duplicate`, { method: "POST" }); toast.success("Project duplicated"); })}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-300 hover:bg-rose-500/10" onClick={() => act(async () => { if (confirm(`Delete “${p.name}”? This cannot be undone.`)) { await api(`/api/projects/${p.id}`, { method: "DELETE" }); toast.success("Project deleted"); } })}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
