"use client";
import dynamic from "next/dynamic";
import type { ProjectDoc } from "@/lib/project/schema";

// The editor is client-only (Remotion Player, pointer interactions).
const Editor = dynamic(() => import("@/components/editor/Editor").then((m) => m.Editor), { ssr: false, loading: () => <div className="flex h-screen items-center justify-center text-sm text-ink-400">Loading editor…</div> });

export function EditorLoader(props: { project: { id: string; name: string; revision: number; document: ProjectDoc }; access: string }) {
  return <Editor {...props} />;
}
