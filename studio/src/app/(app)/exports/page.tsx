import { ExportsList } from "@/components/projects/ExportsList";
import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Export History" };

export default function ExportsPage() {
  return (
    <Page>
      <PageHeader title="Export History" subtitle="Background render queue. Renders keep going while you edit; failed jobs show the reason." />
      <ExportsList />
    </Page>
  );
}
