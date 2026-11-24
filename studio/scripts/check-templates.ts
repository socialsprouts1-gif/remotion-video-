import { TEMPLATES, buildTemplate } from "../src/lib/templates";
for (const t of TEMPLATES) for (const a of ["16:9", "9:16", "1:1", "4:5"] as const) {
  const d = buildTemplate(t.id, a);
  console.log(t.id.padEnd(20), a, d.settings.width + "x" + d.settings.height, d.tracks.length + " tracks", d.tracks.reduce((n, x) => n + x.clips.length, 0) + " clips");
}
