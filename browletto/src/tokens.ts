import {continueRender, delayRender, staticFile} from 'remotion';

/** Palette taken from the café: cream walls, coffee-brown wood, maroon signage, hanging greenery, warm bulbs. */
export const P = {
  espresso: '#140B07',
  chocolate: '#2A170E',
  coffee: '#5A3825',
  caramel: '#A86B3C',
  gold: '#E2B46B',
  goldSoft: '#F0D3A0',
  cream: '#F6EEDF',
  beige: '#D9C3A5',
  maroon: '#7E2F38',
  green: '#8DB255',
};

export const DISPLAY = '"Playfair Display", "Liberation Serif", serif';
export const SANS = 'Jost, "Liberation Sans", sans-serif';
export const ITALIC = '"Cormorant Garamond", "Liberation Serif", serif';

const faces: [string, string, string, string][] = [
  ['Playfair Display', 'playfair-display-latin-700-normal.woff2', '700', 'normal'],
  ['Playfair Display', 'playfair-display-latin-800-normal.woff2', '800', 'normal'],
  ['Playfair Display', 'playfair-display-latin-900-normal.woff2', '900', 'normal'],
  ['Playfair Display', 'playfair-display-latin-700-italic.woff2', '700', 'italic'],
  ['Jost', 'jost-latin-300-normal.woff2', '300', 'normal'],
  ['Jost', 'jost-latin-400-normal.woff2', '400', 'normal'],
  ['Jost', 'jost-latin-500-normal.woff2', '500', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-400-italic.woff2', '400', 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-500-italic.woff2', '500', 'italic'],
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
