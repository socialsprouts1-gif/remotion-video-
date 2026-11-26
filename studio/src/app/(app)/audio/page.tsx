import { Page } from "@/components/shell/Page";
import { PageHeader } from "@/components/ui";
import { GenerationStudio } from "@/components/ai/GenerationStudio";

export const metadata = { title: "Audio Studio" };

export default function AudioStudio() {
  return (
    <Page>
      <PageHeader
        eyebrow="Audio Studio"
        title="Voice, music and sound"
        subtitle="Voiceovers, music beds, sound effects and transcription. Mixing, volume automation, fades and per-track mute live in the editor timeline."
      />
      <GenerationStudio
        tabs={[
          { capability: "text-to-speech", label: "Voiceover", promptLabel: "Script", placeholder: "Introducing Aurora — the scent of first light." },
          { capability: "music", label: "Music", placeholder: "Uplifting cinematic electronic, 110 BPM, builds to a big drop" },
          { capability: "sound-effect", label: "Sound effect", placeholder: "Deep cinematic whoosh into a metallic impact" },
          { capability: "speech-to-text", label: "Transcribe", needsVideoOrAudio: true },
        ]}
      />
    </Page>
  );
}
