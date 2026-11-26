/** Smoke test: render a small motion-graphics doc to storage/smoke.mp4 */
import { applyCommands } from "../src/lib/project/ops";
import { newDocument } from "../src/lib/project/factory";
import { ExportSettings } from "../src/lib/project/schema";
import { renderProject } from "../src/server/render/render-doc";

const base = newDocument({ aspect: "16:9", durationSec: 3 });
const [textTrack, overlay, video] = base.tracks;
const { doc } = applyCommands(base, [
  { op: "addClip", trackId: video.id, clip: { type: "effect", effect: "orbs", start: 0, duration: 90, name: "BG" } },
  { op: "addClip", trackId: overlay.id, clip: { type: "effect", effect: "particles", start: 0, duration: 90 } },
  { op: "addClip", trackId: textTrack.id, clip: { type: "text", text: "Lumora Studio", start: 0, duration: 90, style: { fontFamily: "Syne", fontSize: 140 }, animationIn: { preset: "kinetic", duration: 30, splitBy: "letter" } } },
]);
const t0 = Date.now();
renderProject({
  doc,
  settings: ExportSettings.parse({ resolution: "720p", quality: "draft" }),
  outFile: "storage/smoke.mp4",
  watermark: "Made with Lumora",
  onProgress: ({ progress, stage }) => process.stdout.write(`\r${stage} ${(progress * 100).toFixed(0)}%   `),
}).then((r) => console.log("\nok", r, (Date.now() - t0) / 1000, "s"), (e) => { console.error(e); process.exit(1); });
