// Neura Chat — Diwali shop story. Scene windows come from the voiceover (src/vo.json).
import vo from './vo.json';

export const VIDEO = {width: 1080, height: 1920, fps: 30};
export const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  name: 'Neura Chat',
  tagline: 'AI-Powered WhatsApp Automation',
  keyword: 'WHATSAPP',
  logo: 'brand/logo.png',
  purple: '#7C3AED',
  violet: '#6D28D9',
  magenta: '#C026D3',
  wa: '#25D366',
};
// Fictional shops for the story.
export const SHOP = 'Sharma Electronics';
export const RIVAL = 'Gupta Electronics';

export type Who = 'seth' | 'kaka' | 'raju' | 'vo';
export type Line = {section: string; who: Who; start: number; dur: number; text: string; env: number[]};
export const LINES = vo.lines as Line[];
export const TOTAL_FRAMES = f(vo.total);

export const SECTION_IDS = ['news', 'street', 'shock', 'order', 'diary', 'block', 'raju', 'laptop', 'easy', 'crowd', 'end'] as const;
export type SceneId = (typeof SECTION_IDS)[number];

const LEAD_IN = 0.2;
const firstStart = (id: SceneId) => LINES.find((l) => l.section === id)!.start;
/** Hard cuts like a cartoon: each scene runs from just before its first line to just before the next scene's. */
export const SCENES = Object.fromEntries(
  SECTION_IDS.map((id, i) => {
    const a = i === 0 ? 0 : firstStart(id) - LEAD_IN;
    const b = i === SECTION_IDS.length - 1 ? vo.total : firstStart(SECTION_IDS[i + 1]) - LEAD_IN;
    return [id, {start: a, from: f(a), dur: f(b) - f(a)}];
  }),
) as Record<SceneId, {start: number; from: number; dur: number}>;

/** Time (s, relative to the scene) of the n-th line of a scene. */
export const cue = (id: SceneId, n = 0, field: 'start' | 'end' = 'start') => {
  const l = LINES.filter((x) => x.section === id)[n];
  return (field === 'start' ? l.start : l.start + l.dur) - SCENES[id].start;
};
/** Approximate time (s, relative to the scene) a word is spoken in the n-th line. */
export const wordAt = (id: SceneId, n: number, word: string) => {
  const l = LINES.filter((x) => x.section === id)[n];
  const i = l.text.toLowerCase().indexOf(word.toLowerCase());
  return l.start + (i < 0 ? 0 : i / l.text.length) * l.dur - SCENES[id].start;
};

/** Mouth opening 0..1 for a character at an absolute frame (lip sync from the voice loudness). */
export const mouthAt = (who: Who, absFrame: number) => {
  const t = absFrame / VIDEO.fps;
  for (const l of LINES) {
    if (l.who !== who) continue;
    if (t >= l.start && t < l.start + l.dur) {
      const i = Math.floor((t - l.start) * VIDEO.fps);
      return l.env[Math.min(i, l.env.length - 1)] ?? 0;
    }
  }
  return 0;
};
export const isTalking = (who: Who, absFrame: number) => {
  const t = absFrame / VIDEO.fps;
  return LINES.some((l) => l.who === who && t >= l.start - 0.05 && t < l.start + l.dur + 0.1);
};

export const AUDIO = {
  voiceover: 'audio/voiceover.mp3',
  music: 'audio/music.mp3' as string | null,
  musicVolume: 0.16,
  sfxVolume: 0.7,
};
