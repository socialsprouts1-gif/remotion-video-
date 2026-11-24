"use client";
import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Empty, Spinner } from "@/components/ui";
import { ProjectCard, type ProjectSummary } from "./ProjectCard";
import { NewProjectButton } from "./NewProjectDialog";

export function ProjectsGrid() {
  const [q, setQ] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const load = useCallback(() => {
    api<{ projects: ProjectSummary[] }>(`/api/projects?q=${encodeURIComponent(q)}`).then((r) => setProjects(r.projects), () => setProjects([]));
  }, [q]);
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);
  return (
    <div>
      <div className="mb-6 flex max-w-sm items-center gap-2 rounded-lg border border-white/[0.07] bg-ink-850 px-3">
        <Search className="h-4 w-4 text-ink-500" />
        <input className="w-full bg-transparent py-2 text-sm outline-none" placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!projects ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : projects.length === 0 ? (
        <Empty icon={<FolderOpen className="h-6 w-6" />} title={q ? "No matching projects" : "No projects yet"} action={<NewProjectButton />}>
          Start from a blank canvas, a template, or a prompt in AI Studio.
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
