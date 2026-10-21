import {continueRender, delayRender, staticFile} from 'remotion';

let loaded = false;

/** Poppins (SIL OFL), bundled so renders never hit the network. */
export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  const faces = [500, 600, 700, 800].map((w) => new FontFace('Poppins', `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)})`, {weight: String(w)}));
  Promise.all(faces.map((f) => f.load().then((ff) => (document.fonts as unknown as Set<FontFace>).add(ff))))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Font loading failed', err);
      continueRender(handle);
    });
};
