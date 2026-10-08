import {continueRender, delayRender, staticFile} from 'remotion';

// Poppins (SIL OFL): geometric sans with full Devanagari, so Hindi and English share one voice.
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+20B9, U+2122, U+2191, U+2193, U+2212, U+2215';
const DEVA = 'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF';

let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  const faces: FontFace[] = [];
  for (const w of [500, 600, 700, 800]) {
    faces.push(new FontFace('Poppins', `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)})`, {weight: String(w), unicodeRange: LATIN}));
    faces.push(new FontFace('Poppins', `url(${staticFile(`fonts/poppins-devanagari-${w}-normal.woff2`)})`, {weight: String(w), unicodeRange: DEVA}));
  }
  Promise.all(faces.map((f) => f.load().then((ff) => (document.fonts as unknown as Set<FontFace>).add(ff))))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Font loading failed', err);
      continueRender(handle);
    });
};
