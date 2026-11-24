"use client";
import { useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { api, timeAgo } from "@/lib/api";
import { ProjectDoc } from "@/lib/project/schema";
import { Badge, Button, Modal, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useEditor } from "./store";

interface Version { id: string; revision: number; label: string | null; kind: string; createdAt: string }

export function VersionsDialog({ open, onClose, saveNow }: { open: boolean; onClose: () => void; saveNow: (o?: { kind?: "snapshot"; label?: string }) => Promise<void> }) {
  const projectId = useEditor((s) => s.projectId);
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [label, setLabel] = useState("");
  const load = () => api<{ versions: Version[] }>(`/api/projects/${projectId}/versions`).then((r) => setVersions(r.versions));
  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function snapshot() {
    await saveNow();
    await api(`/api/projects/${projectId}/versions`, { method: "POST", body: { label: label || `Snapshot ${new Date().toLocaleString()}` } });
    const p = await api<{ project: { revision: number } }>(`/api/projects/${projectId}`);
    useEditor.setState({ revision: p.project.revision });
    setLabel("");
    toast.success("Snapshot saved");
    void load();
  }

  async function restore(v: Version) {
    if (!confirm(`Restore “${v.label ?? `revision ${v.revision}`}”? Your current state stays in history.`)) return;
    await saveNow();
    await api(`/api/projects/${projectId}/versions/${v.id}/restore`, { method: "POST" });
    const p = await api<{ project: { revision: number; document: unknown; name: string } }>(`/api/projects/${projectId}`);
    const st = useEditor.getState();
    st.init({ projectId, name: p.project.name, revision: p.project.revision, doc: ProjectDoc.parse(p.project.document), access: st.access });
    toast.success("Version restored");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Version history">
      <div className="mb-4 flex gap-2">
        <input className="field" placeholder="Snapshot name (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button variant="primary" onClick={snapshot} icon={<History className="h-4 w-4" />}>Save snapshot</Button>
      </div>
      {!versions ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {versions.map((v) => (
            <li key={v.id} className="flex items-center gap-3 py-2.5 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate">{v.label ?? `Revision ${v.revision}`}</div>
                <div className="text-xs text-ink-400">{timeAgo(v.createdAt)} · rev {v.revision}</div>
              </div>
              <Badge tone={v.kind === "snapshot" ? "accent" : v.kind === "restore" ? "info" : "default"}>{v.kind}</Badge>
              <Button size="xs" variant="ghost" icon={<RotateCcw className="h-3 w-3" />} onClick={() => restore(v)}>Restore</Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
