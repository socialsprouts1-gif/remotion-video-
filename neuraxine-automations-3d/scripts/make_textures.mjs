// Render the texture stills (phone screens, calendar, coin, logo tile) into public/tex/.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('public/tex');
fs.mkdirSync(out, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const jobs = [
  ...['lock12', 'lock8', 's1a', 's1b', 's3a', 's3b', 's4a', 's4b', 's5a', 's5b'].map((id) => ['TexPhone', id]),
  ...['cal', 'coin', 'nx'].map((id) => ['TexSquare', id]),
];
for (const [comp, id] of jobs) {
  const composition = await selectComposition({serveUrl, id: comp, inputProps: {id}, browserExecutable});
  await renderStill({serveUrl, composition, frame: 0, output: path.join(out, `${id}.png`), inputProps: {id}, browserExecutable, imageFormat: 'png'});
  console.log(id);
}
