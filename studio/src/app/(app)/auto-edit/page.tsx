import { Page } from "@/components/shell/Page";
import { AutoEditStudio } from "@/components/ai/AutoEditStudio";

export const metadata = { title: "Auto Edit" };

export default function AutoEditPage() {
  return (
    <Page>
      <AutoEditStudio />
    </Page>
  );
}
