import { Page } from "@/components/shell/Page";
import { MotionStudio } from "@/components/ai/MotionStudio";

export const metadata = { title: "Motion Graphics" };

export default function MotionPage() {
  return (
    <Page>
      <MotionStudio />
    </Page>
  );
}
