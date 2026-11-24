import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { ProjectDoc } from "../lib/project/schema";

/** Curated font library (Google Fonts). Keys are CSS family names. */
export const FONT_LIBRARY: { family: string; category: "sans" | "serif" | "display" | "mono" | "script"; weights: number[] }[] = [
  { family: "Inter", category: "sans", weights: [400, 500, 600, 700, 800, 900] },
  { family: "Space Grotesk", category: "sans", weights: [400, 500, 700] },
  { family: "Montserrat", category: "sans", weights: [400, 600, 700, 800, 900] },
  { family: "Poppins", category: "sans", weights: [400, 600, 700, 800] },
  { family: "Manrope", category: "sans", weights: [400, 600, 800] },
  { family: "Syne", category: "display", weights: [600, 700, 800] },
  { family: "Bebas Neue", category: "display", weights: [400] },
  { family: "Oswald", category: "display", weights: [400, 600, 700] },
  { family: "Anton", category: "display", weights: [400] },
  { family: "Unbounded", category: "display", weights: [400, 700, 900] },
  { family: "Playfair Display", category: "serif", weights: [400, 600, 700, 900] },
  { family: "DM Serif Display", category: "serif", weights: [400] },
  { family: "Cormorant Garamond", category: "serif", weights: [400, 600, 700] },
  { family: "JetBrains Mono", category: "mono", weights: [400, 700] },
  { family: "Caveat", category: "script", weights: [400, 700] },
];

export function fontsInDoc(doc: ProjectDoc): string[] {
  const set = new Set<string>();
  for (const t of doc.tracks) for (const c of t.clips) if (c.type === "text") set.add(c.style.fontFamily);
  return [...set].filter((f) => FONT_LIBRARY.some((x) => x.family === f));
}

function cssUrl(families: string[]) {
  const q = families
    .map((f) => {
      const def = FONT_LIBRARY.find((x) => x.family === f)!;
      return `family=${encodeURIComponent(f).replace(/%20/g, "+")}:ital,wght@${def.weights.map((w) => `0,${w}`).join(";")}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=block`;
}

const loaded = new Set<string>();

/** Loads Google fonts used by the document and blocks rendering until they are ready (max 8s). */
export function useDocFonts(families: string[]) {
  const key = families.slice().sort().join("|");
  const [handle] = useState(() => (typeof window === "undefined" ? null : delayRender("Loading fonts", { timeoutInMilliseconds: 20000 })));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done && handle !== null) {
        done = true;
        continueRender(handle);
      }
    };
    const missing = families.filter((f) => !loaded.has(f));
    if (missing.length === 0) {
      finish();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl(missing);
    const timer = setTimeout(finish, 8000);
    link.onload = () => {
      Promise.all(missing.flatMap((f) => [document.fonts.load(`400 1em "${f}"`), document.fonts.load(`700 1em "${f}"`)]))
        .catch(() => undefined)
        .then(() => {
          missing.forEach((f) => loaded.add(f));
          clearTimeout(timer);
          finish();
        });
    };
    link.onerror = () => {
      clearTimeout(timer);
      finish();
    };
    document.head.appendChild(link);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
