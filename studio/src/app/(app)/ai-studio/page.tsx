import { Page } from "@/components/shell/Page";
import { DirectorStudio } from "@/components/ai/DirectorStudio";

export const metadata = { title: "AI Studio" };

export default function AIStudioPage() {
  return (
    <Page>
      <DirectorStudio />
    </Page>
  );
}
