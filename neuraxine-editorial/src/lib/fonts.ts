import {continueRender, delayRender, staticFile} from 'remotion';

// Inter / Inter Display / Instrument Serif (SIL OFL), bundled in public/fonts so renders never hit the network.
const FACES: [family: string, file: string, weight: number][] = [
  ['Inter', 'Inter-Medium.otf', 500],
  ['Inter', 'Inter-SemiBold.otf', 600],
  ['Inter', 'Inter-Bold.otf', 700],
  ['Inter Display', 'InterDisplay-ExtraBold.otf', 800],
  ['Inter Display', 'InterDisplay-Black.otf', 900],
  ['Instrument Serif', 'InstrumentSerif.ttf', 400],
  ['Archivo', 'Archivo.ttf', 0],
];

let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    FACES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, weight === 0 ? {weight: '100 900', stretch: '62% 125%'} : {weight: String(weight)});
      return face.load().then((f) => (document.fonts as unknown as Set<FontFace>).add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Font loading failed', err);
      continueRender(handle);
    });
};
