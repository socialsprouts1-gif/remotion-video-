import manifest from "../../remotion/font-manifest.json";

export const FONT_LIBRARY_NAMES: string[] = [...new Set(manifest.map((f) => f.family))];
