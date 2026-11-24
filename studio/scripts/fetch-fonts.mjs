// Downloads the curated Google Fonts (latin subset, woff2) into public/fonts and
// writes src/remotion/font-manifest.json. Fonts are then self-hosted so preview
// and render never depend on fonts.googleapis.com at runtime.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const FAMILIES = {
  "Inter": [400, 500, 600, 700, 800, 900], "Space Grotesk": [400, 500, 700], "Montserrat": [400, 600, 700, 800, 900],
  "Poppins": [400, 600, 700, 800], "Manrope": [400, 600, 800], "Syne": [600, 700, 800], "Bebas Neue": [400],
  "Oswald": [400, 600, 700], "Anton": [400], "Unbounded": [400, 700, 900], "Playfair Display": [400, 600, 700, 900],
  "DM Serif Display": [400], "Cormorant Garamond": [400, 600, 700], "JetBrains Mono": [400, 700], "Caveat": [400, 700],
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const outDir = path.resolve("public/fonts");
fs.mkdirSync(outDir, { recursive: true });
const curl = (url, out) => execFileSync("curl", ["-sSfL", "-A", UA, ...(out ? ["-o", out] : []), url], { encoding: out ? undefined : "utf8" });
const manifest = [];
for (const [family, weights] of Object.entries(FAMILIES)) {
  for (const w of weights) {
    const css = curl(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${w}&display=block`);
    // pick the latin block (last @font-face in the response)
    const blocks = css.split("@font-face").filter((b) => b.includes("src:"));
    const latin = blocks.find((b, i) => css.split("@font-face")[i]?.includes("/* latin */")) ?? blocks[blocks.length - 1];
    const url = latin.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) throw new Error(`no woff2 for ${family} ${w}`);
    const file = `${family.toLowerCase().replace(/ /g, "-")}-${w}.woff2`;
    curl(url, path.join(outDir, file));
    manifest.push({ family, weight: w, file: `fonts/${file}` });
    process.stdout.write(".");
  }
}
fs.writeFileSync("src/remotion/font-manifest.json", JSON.stringify(manifest, null, 1));
console.log(`\n${manifest.length} font files`);
