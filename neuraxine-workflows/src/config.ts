// Neuraxine — "Before vs After". Scene windows come from the voiceover (src/vo.json).
import vo from './vo.json';

export const VIDEO = {width: 1080, height: 1920, fps: 30};
const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  name: 'NEURAXINE',
  handle: 'neuraxine',
  tagline: 'AI AUTOMATION AGENCY',
  site: 'www.neuraxine.com',
  keyword: 'LEADS',
};
export const BIZ = 'Royal Furniture';

export type Line = {section: string; start: number; dur: number; text: string};
export const LINES = vo.lines as Line[];

export const SECTION_IDS = ['hook', 'nine', 'apollo', 'email', 'linkedin', 'vapi', 'crm', 'honest', 'wrong', 'speed', 'cta'] as const;
export type SceneId = (typeof SECTION_IDS)[number];
/** Look per scene: the "before" day is cold grey with red alerts; the Neuraxine day is black + lime. */
export type Mode = 'before' | 'after';
export const MODE: Record<SceneId, Mode> = {hook: 'after', nine: 'after', apollo: 'after', email: 'after', linkedin: 'after', vapi: 'after', crm: 'after', honest: 'before', wrong: 'before', speed: 'after', cta: 'after'};

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

export const cue = (id: SceneId, n = 0, field: 'start' | 'end' = 'start') => {
  const l = LINES.filter((x) => x.section === id)[n];
  return (field === 'start' ? l.start : l.start + l.dur) - SCENES[id].start;
};
export const wordAt = (id: SceneId, n: number, word: string) => {
  const l = LINES.filter((x) => x.section === id)[n];
  const i = l.text.toLowerCase().indexOf(word.toLowerCase());
  return l.start + (i < 0 ? 0 : i / l.text.length) * l.dur - SCENES[id].start;
};

// Key words in the captions (lime in the Neuraxine scenes, red in the "before" scenes).
export const ACCENT_WORDS = ['business.', 'din.', 'automation', 'neuraxine', '9', '50', 'price', 'dopahar', 'competitor', 'thak', 'wahi.', 'wahi', '3', 'second', 'ai', 'crm', 'calendar', 'follow-ups', 'deals', 'close', 'so', 'chal', 'late', 'khoye', 'tension.', 'instant', 'saved', 'sukoon.', 'automate.', 'follow'];

export const AUDIO = {
  voiceover: 'audio/voiceover.mp3' as string | null,
  voiceVolume: 1,
  music: 'audio/music.mp3' as string | null,
  musicVolume: 0.26,
  sfxVolume: 0.8,
};
