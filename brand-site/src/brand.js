// Everything brand-specific lives here. Swap the name, copy and colours to
// re-skin the experience; the 3D bottles read their tints from `products`.

export const brand = {
  name: 'VÉRANE',
  descriptor: 'Maison de Parfum',
  city: 'Paris',
  est: '2011',
  coords: '48°51′N — 2°21′E',
  headline: ['Made to', 'be felt.'],
  cta: 'Discover',
  story: {
    label: 'The Maison',
    lead:
      'We do not make perfume. We bottle the quiet hour before something begins — the warm wood of a closed room, smoke on a coat, skin after the sea.',
    aside:
      'Five extraits. Composed in a single atelier on Rue de Charonne, macerated for twenty-one days, poured by hand.',
  },
  experience: [
    {
      key: 'top',
      roman: 'I',
      word: 'Top',
      title: 'The first ten minutes',
      notes: ['Bergamot', 'Pink pepper', 'Bitter orange'],
      copy: 'Bright, volatile, gone too soon. The part of a scent that introduces itself.',
    },
    {
      key: 'heart',
      roman: 'II',
      word: 'Heart',
      title: 'The next six hours',
      notes: ['Orris butter', 'Violet leaf', 'Incense'],
      copy: 'Powder and smoke settle into the skin. This is the scent people will remember you by.',
    },
    {
      key: 'base',
      roman: 'III',
      word: 'Base',
      title: 'What stays the night',
      notes: ['Labdanum', 'Amber', 'Vetiver'],
      copy: 'Resin and roots. Still there on the collar the next morning.',
    },
  ],
  details: [
    { value: '9', unit: 'mm', label: 'Flint glass walls, cut and polished by hand' },
    { value: '38', unit: 'g', label: 'Solid brass cap, brushed in Normandy' },
    { value: '21', unit: 'days', label: 'Maceration before every pour' },
  ],
  statement: ['Not worn.', 'Remembered.'],
  finale: {
    title: ['Find the one', 'that finds you.'],
    action: 'Book a private sitting',
    note: 'Ninety minutes in the atelier. One scent, chosen on skin.',
  },
  nav: ['Maison', 'Collection', 'Atelier', 'Journal'],
}

// Order matters: index 0 is the hero bottle, and each entry maps to one 3D
// model in three/Bottles.jsx.
export const products = [
  {
    id: 'ambre',
    no: '01',
    name: 'Ambre Noir',
    notes: 'Labdanum · Smoke · Black tea',
    size: '100 ml',
    price: '€ 245',
    liquid: '#6a2c0c',
    glass: '#f3ece2',
    arch: '#d9c2a7',
  },
  {
    id: 'iris',
    no: '02',
    name: 'Iris Fumé',
    notes: 'Orris · Suede · Incense',
    size: '75 ml',
    price: '€ 225',
    liquid: '#b6a3c4',
    glass: '#eeeaf2',
    arch: '#cfc6d6',
  },
  {
    id: 'figue',
    no: '03',
    name: 'Figue Sauvage',
    notes: 'Fig leaf · Green milk · Cedar',
    size: '100 ml',
    price: '€ 235',
    liquid: '#7f8c4a',
    glass: '#eef0e6',
    arch: '#c8cdb2',
  },
  {
    id: 'sel',
    no: '04',
    name: 'Sel Blanc',
    notes: 'Sea salt · Ambrette · Musk',
    size: '50 ml',
    price: '€ 190',
    liquid: '#e4dccd',
    glass: '#f5f3ee',
    arch: '#dcd6cb',
  },
  {
    id: 'cuir',
    no: '05',
    name: 'Cuir Rouge',
    notes: 'Leather · Saffron · Rose',
    size: '100 ml',
    price: '€ 260',
    liquid: '#6e1a1a',
    glass: '#f1e9e6',
    arch: '#cfa9a2',
  },
]
