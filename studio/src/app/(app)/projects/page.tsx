import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { NewProjectButton } from "@/components/projects/NewProjectDialog";

export const metadata = { title: "My Projects" };

export default function ProjectsPage() {
  return (
    <Page>
      <PageHeader title="My Projects" subtitle="Every project is an editable document with autosave, version history and instant duplicate." actions={<NewProjectButton />} />
      <ProjectsGrid />
    </Page>
  );
}
