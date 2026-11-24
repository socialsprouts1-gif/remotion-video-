import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { BrandKits } from "@/components/brand/BrandKits";

export const metadata = { title: "Brand Kit" };

export default function BrandPage() {
  return (
    <Page>
      <PageHeader title="Brand Kit" subtitle="Colors, fonts, logo, watermark and voice. Select a kit in AI Studio and the Director applies it to new projects; apply it to an open project from here." />
      <BrandKits />
    </Page>
  );
}
