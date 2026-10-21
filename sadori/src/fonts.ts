import {continueRender, delayRender, staticFile} from 'remotion';

export const SERIF = '"Cormorant Garamond", "Liberation Serif", serif';
export const SANS = 'Jost, "Liberation Sans", sans-serif';

const faces: [string, string, string, string][] = [
  ['Cormorant Garamond', 'cormorant-garamond-latin-300-normal.woff2', '300', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-400-normal.woff2', '400', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-normal.woff2', '500', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-300-italic.woff2', '300', 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-400-italic.woff2', '400', 'italic'],
  ['Jost', 'jost-latin-300-normal.woff2', '300', 'normal'],
  ['Jost', 'jost-latin-400-normal.woff2', '400', 'normal'],
  ['Jost', 'jost-latin-500-normal.woff2', '500', 'normal'],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('fonts');
  Promise.all(
    faces.map(([fam, file, weight, style]) => {
      const f = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight, style});
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
};
