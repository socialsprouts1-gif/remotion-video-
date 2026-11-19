// Brand, copy and timing. Scene windows come from the voiceover (src/vo.json, written by
// scripts/make_voiceover.py), so re-generating the voice re-times the film.
import vo from './vo.json';

export const VIDEO = {width: 1080, height: 1920, fps: 30};
const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  handle: '@yourbrand', // shown on the CTA card
  series: 'MARKETING PLAYBOOK',
  keyword: 'GROW',
};

export type Line = {section: string; start: number; dur: number; text: string};
export const LINES = vo.lines as Line[];

export const SECTION_IDS = ['hook', 'intro', 's1', 's2', 's3', 's4', 's5', 'outro', 'cta'] as const;
export type SceneId = (typeof SECTION_IDS)[number];

const LEAD_IN = 0.3; // a section's picture starts this long before its first word
const OVERLAP = 0.25;
export const TOTAL_SEC = vo.total;
export const TOTAL_FRAMES = f(vo.total);

const firstStart = (id: SceneId) => LINES.find((l) => l.section === id)!.start;
export const SCENES = Object.fromEntries(
  SECTION_IDS.map((id, i) => {
    const a = i === 0 ? 0 : firstStart(id) - LEAD_IN;
    const b = i === SECTION_IDS.length - 1 ? vo.total : firstStart(SECTION_IDS[i + 1]) - LEAD_IN + OVERLAP;
    return [id, {start: a, from: f(a), dur: f(b) - f(a)}];
  }),
) as Record<SceneId, {start: number; from: number; dur: number}>;

/** Line `n` (0-based) of a section, in seconds relative to that section's scene start. */
export const cue = (id: SceneId, n = 0, field: 'start' | 'end' = 'start') => {
  const l = LINES.filter((x) => x.section === id)[n];
  const t = field === 'start' ? l.start : l.start + l.dur;
  return t - SCENES[id].start;
};

/** Time (scene-relative s) when a word inside a line is spoken, estimated by character position. */
export const wordAt = (id: SceneId, n: number, word: string) => {
  const l = LINES.filter((x) => x.section === id)[n];
  const i = l.text.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0 : i / l.text.length;
  return l.start + frac * l.dur - SCENES[id].start;
};

// Captions are shown where the words are not already on screen.
export const CAPTION_SECTIONS: SceneId[] = ['intro', 's1', 's2', 's3', 's4', 's5'];

export const CHAPTERS = [
  {id: 's1' as SceneId, title: ['Sahi', '*audience*'], short: 'Audience'},
  {id: 's2' as SceneId, title: ['Value wala', '*content*'], short: 'Content'},
  {id: 's3' as SceneId, title: ['Social', '*proof*'], short: 'Proof'},
  {id: 's4' as SceneId, title: ['Follow-up &', '*retargeting*'], short: 'Follow-up'},
  {id: 's5' as SceneId, title: ['Data', '*dekho*'], short: 'Data'},
];

export const PERSONA = {
  name: 'Riya, 32',
  rows: ['Boutique owner · Jaipur', 'Instagram pe roz active', 'Problem: footfall kam'],
};

export const POSTS = [
  {tag: 'REEL', hook: '3 galtiyan jo aapki sales rok rahi hain', likes: 12400},
  {tag: 'CAROUSEL', hook: '₹0 mein local marketing kaise karein', likes: 8900},
  {tag: 'REEL', hook: 'Before → After: ek client ki kahani', likes: 15200},
];

export const REVIEWS = [
  {name: 'Neha · Pune', text: 'Delivery super fast, quality top!'},
  {name: 'Arjun · Delhi', text: 'Ekdum premium experience.'},
  {name: 'Simran · Indore', text: 'Dobara zaroor order karungi.'},
];
export const PROOF_PLACES = ['Website', 'Instagram', 'WhatsApp', 'Ads'];

export const AUDIO = {
  voiceover: 'audio/voiceover.mp3' as string | null,
  voiceVolume: 1,
  music: 'audio/music.mp3' as string | null,
  musicVolume: 0.3,
  sfxVolume: 0.8,
};
