import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { GenerationStudio } from "@/components/ai/GenerationStudio";

export const metadata = { title: "AI Animation" };

export default function AnimationStudio() {
  return (
    <Page>
      <PageHeader
        eyebrow="AI Animation"
        title="Bring images and ideas to life"
        subtitle="Image-to-video with first/last-frame control, camera motion and style presets. Describe motion in plain language — “make this character walk toward the camera, turn around, smile and wave”."
      />
      <GenerationStudio
        tabs={[
          { capability: "image-to-video", label: "Image to video", needsImage: true, promptLabel: "Describe the motion", placeholder: "The character walks toward the camera, turns around, smiles and waves" },
          { capability: "text-to-video", label: "Text to video", placeholder: "A paper-cut fox runs through an autumn forest, 2D animation, warm palette" },
        ]}
      />
    </Page>
  );
}
