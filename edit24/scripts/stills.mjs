import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [comp, ...fr] = process.argv.slice(2);
const outDir = path.resolve('out/stills');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const f of fr.map(Number)) {
  const output = path.join(outDir, `${comp}_${String(f).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, browserExecutable, scale: 0.5});
  console.log(output);
}
