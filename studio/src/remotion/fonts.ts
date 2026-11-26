import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import type { ProjectDoc } from "../lib/project/schema";
import manifest from "./font-manifest.json";

/**
 * Self-hosted font library (files in public/fonts, fetched by scripts/fetch-fonts.mjs).
 * Served by Next.js for the preview player and by Remotion's bundle server for renders.
 */
export const FONT_LIBRARY: { family: string; category: "sans" | "serif" | "display" | "mono" | "script"; weights: number[] }[] = (() => {
  const cat: Record<string, "sans" | "serif" | "display" | "mono" | "script"> = {
    Syne: "display", "Bebas Neue": "display", Oswald: "display", Anton: "display", Unbounded: "display",
    "Playfair Display": "serif", "DM Serif Display": "serif", "Cormorant Garamond": "serif",
    "JetBrains Mono": "mono", Caveat: "script",
  };
  const map = new Map<string, number[]>();
  for (const f of manifest) map.set(f.family, [...(map.get(f.family) ?? []), f.weight]);
  return [...map.entries()].map(([family, weights]) => ({ family, weights, category: cat[family] ?? "sans" }));
})();

export function fontsInDoc(doc: ProjectDoc): string[] {
  const set = new Set<string>(["Inter"]);
  for (const t of doc.tracks)
    for (const c of t.clips) {
      if (c.type === "text") set.add(c.style.fontFamily);
      if (c.type === "effect" && typeof c.params.fontFamily === "string") set.add(c.params.fontFamily);
    }
  return [...set].filter((f) => FONT_LIBRARY.some((x) => x.family === f));
}

const loaded = new Map<string, Promise<void>>();
const released = new Set<number>();

export function loadFamily(family: string): Promise<void> {
  const existing = loaded.get(family);
  if (existing) return existing;
  const p = Promise.all(
    manifest
      .filter((f) => f.family === family)
      .map(async (f) => {
        const face = new FontFace(family, `url(${staticFile(f.file)}) format("woff2")`, { weight: String(f.weight) });
        await face.load();
        document.fonts.add(face);
      }),
  )
    .then(() => undefined)
    .catch(() => undefined);
  loaded.set(family, p);
  return p;
}

/** Loads the fonts used by the document and blocks rendering until they are ready. */
export function useDocFonts(families: string[]) {
  const key = families.slice().sort().join("|");
  const [handle] = useState(() => (typeof window === "undefined" ? null : delayRender("Loading fonts", { timeoutInMilliseconds: 20000 })));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (handle !== null && !released.has(handle)) {
        released.add(handle);
        continueRender(handle);
      }
    };
    Promise.all(families.map(loadFamily)).then(finish);
    return finish;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
