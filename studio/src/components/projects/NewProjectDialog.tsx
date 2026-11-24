"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Field, Modal, Segmented } from "@/components/ui";
import { toast } from "@/components/ui/toast";

const ASPECTS = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
] as const;

export function NewProjectDialog({ open, onClose, templateId, templateName, defaultAspect = "16:9" }: { open: boolean; onClose: () => void; templateId?: string; templateName?: string; defaultAspect?: string }) {
  const router = useRouter();
  const [name, setName] = useState(templateName ?? "");
  const [aspect, setAspect] = useState(defaultAspect);
  const [fps, setFps] = useState("30");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const r = await api<{ id: string }>("/api/projects", { method: "POST", body: { name: name || templateName || "Untitled project", aspect, fps: Number(fps), templateId } });
      router.push(`/editor/${r.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={templateName ? `New project from “${templateName}”` : "New project"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={create}>Create & open editor</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Project name">
          <input className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Untitled project" onKeyDown={(e) => e.key === "Enter" && create()} />
        </Field>
        <Field label="Aspect ratio">
          <div>
            <Segmented value={aspect} options={[...ASPECTS]} onChange={setAspect} />
          </div>
        </Field>
        {!templateId ? (
          <Field label="Frame rate">
            <div>
              <Segmented value={fps} options={["24", "25", "30", "50", "60"].map((v) => ({ value: v, label: `${v} fps` }))} onChange={setFps} />
            </div>
          </Field>
        ) : null}
      </div>
    </Modal>
  );
}

export function NewProjectButton({ children = "New project", variant = "primary", ...rest }: { children?: React.ReactNode; variant?: "primary" | "secondary" | "outline"; templateId?: string; templateName?: string; defaultAspect?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className={rest.className}>
        {children}
      </Button>
      {open ? <NewProjectDialog open onClose={() => setOpen(false)} {...rest} /> : null}
    </>
  );
}
