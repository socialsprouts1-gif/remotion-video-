import { Suspense } from "react";
import { AssetsLibrary } from "@/components/assets/AssetsLibrary";
import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Assets Library" };

export default function AssetsPage() {
  return (
    <Page>
      <PageHeader title="Assets Library" subtitle="Uploads and AI generations. Uploads are chunked and resume automatically if interrupted." />
      <Suspense>
        <AssetsLibrary />
      </Suspense>
    </Page>
  );
}
