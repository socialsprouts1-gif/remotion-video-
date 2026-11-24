import { nanoid } from "../id";
import { Clip, ProjectDoc } from "./schema";
import { recomputeDuration } from "./ops";

/** Shift every clip (and marker) in a document by `frames`. */
export function shiftDoc(doc: ProjectDoc, frames: number) {
  for (const t of doc.tracks) for (const c of t.clips) c.start += frames;
  for (const m of doc.markers) m.frame += frames;
}

/**
 * Insert another document's tracks (e.g. a brand intro/outro template) at `at`
 * frames. Source tracks are added as new tracks on top, so nothing is overwritten.
 */
export function insertDoc(target: ProjectDoc, source: ProjectDoc, at: number, label: string): ProjectDoc {
  const out: ProjectDoc = structuredClone(target);
  const visual = source.tracks.filter((t) => t.clips.length && t.kind !== "audio");
  const tracks = visual.map((t) => ({
    ...t,
    id: nanoid(),
    name: `${label}: ${t.name}`,
    clips: t.clips.map((c) => Clip.parse({ ...c, id: nanoid(), start: c.start + at, groupId: null })),
  }));
  out.tracks = [...tracks, ...out.tracks];
  recomputeDuration(out);
  return ProjectDoc.parse(out);
}
