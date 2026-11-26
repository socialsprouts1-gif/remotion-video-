import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { GenerationStudio } from "@/components/ai/GenerationStudio";

export const metadata = { title: "Image Studio" };

export default function ImageStudio() {
  return (
    <Page>
      <PageHeader eyebrow="Image Studio" title="Generate and edit images" subtitle="Keyframes, backgrounds, product shots and storyboard frames. Results land in your Assets Library, ready for image-to-video or the timeline." />
      <GenerationStudio
        tabs={[
          { capability: "text-to-image", label: "Text to image", placeholder: "Macro shot of a glass perfume bottle on black marble, golden rim light, droplets, studio product photography" },
          { capability: "background-removal", label: "Remove background", needsImage: true },
        ]}
      />
    </Page>
  );
}
