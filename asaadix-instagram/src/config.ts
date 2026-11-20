// Brand, timing and copy. Scene windows come from the voiceover (src/vo.json, scripts/make_voiceover.py).
import vo from './vo.json';

export const VIDEO = {width: 1080, height: 1920, fps: 30};
const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  name: 'ASAADIX',
  sub: 'DIGITAL',
  site: 'asaadixdigital.com',
  city: 'Dubai, UAE',
  services: ['Custom CRM', 'AI Automation', 'Chat Apps', 'Shopify'],
};

export type Line = {section: string; start: number; dur: number; text: string};
export const LINES = vo.lines as Line[];

export const SECTION_IDS = ['hook', 'loss', 'risk', 'crm', 'ai', 'keep', 'cta'] as const;
export type SceneId = (typeof SECTION_IDS)[number];
// Light or dark stage per scene (they alternate, as in the reference).
export const DARK: Record<SceneId, boolean> = {hook: true, loss: true, risk: true, crm: true, ai: true, keep: true, cta: true};

const LEAD_IN = 0.3;
const OVERLAP = 0.25;
export const TOTAL_FRAMES = f(vo.total);
const firstStart = (id: SceneId) => LINES.find((l) => l.section === id)!.start;
export const SCENES = Object.fromEntries(
  SECTION_IDS.map((id, i) => {
    const a = i === 0 ? 0 : firstStart(id) - LEAD_IN;
    const b = i === SECTION_IDS.length - 1 ? vo.total : firstStart(SECTION_IDS[i + 1]) - LEAD_IN + OVERLAP;
    return [id, {start: a, from: f(a), dur: f(b) - f(a)}];
  }),
) as Record<SceneId, {start: number; from: number; dur: number}>;

/** Line n of a section, seconds relative to the section's scene start. */
export const cue = (id: SceneId, n = 0, field: 'start' | 'end' = 'start') => {
  const l = LINES.filter((x) => x.section === id)[n];
  return (field === 'start' ? l.start : l.start + l.dur) - SCENES[id].start;
};
/** Scene-relative time a word is spoken (estimated by character position). */
export const wordAt = (id: SceneId, n: number, word: string) => {
  const l = LINES.filter((x) => x.section === id)[n];
  const i = l.text.toLowerCase().indexOf(word.toLowerCase());
  return l.start + (i < 0 ? 0 : i / l.text.length) * l.dur - SCENES[id].start;
};

// Words painted gold in the on-screen captions (compared lower-case, punctuation stripped).
export const ACCENT_WORDS = ['disappears', 'tomorrow', 'followers', 'dms', 'hard', 'work', 'gone', 'click', 'hacked', 'reported', 'disabled', 'reason', 'own', 'crm', "else's", 'ai', 'automation', 'chat', 'app', 'responses', 'sleeping', 'comes', 'goes', 'keep', 'running', 'system'];

// The sample UAE business whose Instagram the story is about.
export const BIZ = {
  handle: 'bloom.abaya.dubai',
  name: 'Bloom Abaya',
  followers: 12400,
  dms: ['Price for the black abaya?', 'Do you deliver to Abu Dhabi?', 'Can I order on WhatsApp?'],
};

export const CRM_ROWS = [
  {name: 'Ahmed Al Mansoori', src: 'Website', status: 'Customer'},
  {name: 'Fatima Khan', src: 'WhatsApp', status: 'New'},
  {name: 'Omar Haddad', src: 'Chat App', status: 'Customer'},
  {name: 'Sara Malik', src: 'Website', status: 'New'},
  {name: 'Yusuf Rahman', src: 'Chat App', status: 'Customer'},
];

export const AUDIO = {
  voiceover: 'audio/voiceover.mp3' as string | null,
  voiceVolume: 1,
  music: 'audio/music.mp3' as string | null,
  musicVolume: 0.28,
  sfxVolume: 0.8,
};
