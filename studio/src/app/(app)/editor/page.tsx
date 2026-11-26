import Link from "next/link";
import { Clapperboard, Sparkles } from "lucide-react";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { NewProjectButton } from "@/components/projects/NewProjectDialog";

export const metadata = { title: "Video Editor" };

export default function EditorIndex() {
  return (
    <Page>
      <PageHeader
        eyebrow="Video Editor"
        title="Open a project to edit"
        subtitle="Multi-track timeline, keyframes, color grading, transitions, motion graphics and an AI assistant wired into real editing commands."
        actions={
          <>
            <Link href="/ai-studio" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm hover:bg-white/5"><Sparkles className="h-4 w-4" /> From a prompt</Link>
            <NewProjectButton><Clapperboard className="h-4 w-4" /> Blank project</NewProjectButton>
          </>
        }
      />
      <ProjectsGrid />
    </Page>
  );
}
