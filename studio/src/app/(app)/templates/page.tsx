import { TemplatesBrowser } from "@/components/projects/TemplatesBrowser";
import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <Page>
      <PageHeader eyebrow="Template marketplace" title="Templates" subtitle="Every template is a fully editable project — replace text, media, colors, fonts and animations. Hover to preview." />
      <TemplatesBrowser />
    </Page>
  );
}
