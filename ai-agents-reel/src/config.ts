/**
 * Everything you are likely to change lives here: brand, copy, timings,
 * captions and sound cues. Wrap a word in *asterisks* to paint it lime.
 */
import {sec} from './lib/anim';

export const BRAND = {
  name: 'Neuraxine',
  tagline: 'AI agents & automation for your business',
  logo: 'brand/logo.png',
  cta: 'Follow Neuraxine for more AI',
};

export const VIDEO = {width: 1080, height: 1920, fps: 30};

/** Frames two neighbouring scenes overlap, so exits and entrances blend. */
export const OVERLAP = 8;

// Scene boundaries in seconds, matched to the voiceover script.
const T = {
  hook: 0,
  impossible: 5.4,
  agent: 10.2,
  connect: 19.0,
  workflow: 26.0,
  ending: 31.8,
  end: 39.0,
};

const order = ['hook', 'impossible', 'agent', 'connect', 'workflow', 'ending'] as const;
export type SceneId = (typeof order)[number];

export const SCENES = Object.fromEntries(
  order.map((id, i) => {
    const from = sec(T[id]);
    const next = sec(T[(order[i + 1] ?? 'end') as keyof typeof T]);
    const isLast = i === order.length - 1;
    return [id, {from, dur: next - from + (isLast ? 0 : OVERLAP)}];
  }),
) as Record<SceneId, {from: number; dur: number}>;

export const TOTAL_FRAMES = sec(T.end);

// ---------------------------------------------------------------- copy
export const COPY = {
  hookA: ['Imagine if your', 'business could', '*work on its own*'],
  hookB: 'without you giving instructions.',
  impossibleQ: ['Sounds', '*impossible?*'],
  impossibleBut: ['But *AI agents*', 'are making it', 'possible.'],
  agentKicker: 'AN AI AGENT',
  agentSteps: ['UNDERSTANDS QUERIES', 'ANSWERS QUESTIONS', 'QUALIFIES LEADS', 'BOOKS SALES MEETINGS'],
  connectTitle: ['Connect it to your', '*business processes*'],
  connectHub: ['WHATSAPP', 'CRM', 'CALENDAR', 'SHEETS', 'EMAIL', 'PAYMENTS'],
  connectPower: ['That’s where the', '*real power* begins.'],
  notJust: 'Not just',
  struck: 'generating content',
  workflow: ['Your entire', '*workflow,*', 'intelligent.'],
  commentPre: 'Comment',
  keyword: 'AUTOMATION',
  commentPost: 'for the full guide in your DMs',
};

// ---------------------------------------------------------------- voiceover / captions
// Timings (seconds) the voiceover should follow. `show: false` hides the subtitle
// where the same words are already on screen as big type.
export const CAPTIONS: {at: number; to: number; text: string; show?: boolean}[] = [
  {at: 0.3, to: 3.6, text: 'Imagine if your business could work on its own…', show: false},
  {at: 3.6, to: 5.4, text: '…without you having to give instructions.', show: false},
  {at: 5.6, to: 7.4, text: 'Sounds impossible, right?', show: false},
  {at: 7.6, to: 10.0, text: 'But AI agents are making this possible.', show: false},
  {at: 10.4, to: 12.6, text: 'An AI agent understands your queries,'},
  {at: 12.6, to: 14.4, text: 'answers questions,'},
  {at: 14.4, to: 16.2, text: 'qualifies leads,'},
  {at: 16.2, to: 18.8, text: 'and even schedules meetings with your sales team automatically.'},
  {at: 19.2, to: 22.6, text: 'It’s also important to properly connect the AI agent with your business processes.'},
  {at: 22.6, to: 25.8, text: 'That’s where the real power of AI begins.', show: false},
  {at: 26.2, to: 28.6, text: 'It’s not just about generating content with AI…'},
  {at: 28.6, to: 31.6, text: '…but about making your entire workflow intelligent.', show: false},
  {at: 32.0, to: 35.6, text: 'Want the full guide? Comment “AUTOMATION” and I’ll DM you all the details.', show: false},
  {at: 35.6, to: 38.8, text: 'And for more AI content, follow Neuraxine.', show: false},
];

// ---------------------------------------------------------------- audio
export const AUDIO = {
  // Drop files into public/audio/ and set the paths, e.g. 'audio/voiceover.mp3'.
  voiceover: null as string | null,
  music: null as string | null,
  voiceVolume: 1,
  musicVolume: 0.12,
  sfxVolume: 0.7,
  showCaptions: true,
};

export type SfxName = 'whoosh' | 'whooshSoft' | 'click' | 'pop' | 'impact' | 'riser' | 'shimmer' | 'tick';

/** Sound cues, in frames relative to the start of their scene. */
export const SFX: {scene: SceneId; f: number; sfx: SfxName; vol?: number}[] = [
  {scene: 'hook', f: 0, sfx: 'shimmer', vol: 0.5},
  {scene: 'hook', f: 10, sfx: 'whooshSoft', vol: 0.5},
  {scene: 'hook', f: 66, sfx: 'whoosh', vol: 0.55},
  {scene: 'hook', f: 112, sfx: 'whooshSoft', vol: 0.4},
  {scene: 'impossible', f: 4, sfx: 'impact', vol: 0.55},
  {scene: 'impossible', f: 46, sfx: 'riser', vol: 0.45},
  {scene: 'impossible', f: 66, sfx: 'whoosh', vol: 0.6},
  {scene: 'impossible', f: 70, sfx: 'impact', vol: 0.7},
  {scene: 'agent', f: 2, sfx: 'whooshSoft', vol: 0.45},
  ...[12, 66, 120, 174].map((f) => ({scene: 'agent' as const, f, sfx: 'tick' as const, vol: 0.55})),
  {scene: 'connect', f: 2, sfx: 'whoosh', vol: 0.5},
  ...[30, 38, 46, 54, 62, 70].map((f) => ({scene: 'connect' as const, f, sfx: 'pop' as const, vol: 0.35})),
  {scene: 'connect', f: 112, sfx: 'shimmer', vol: 0.5},
  {scene: 'workflow', f: 2, sfx: 'whooshSoft', vol: 0.45},
  {scene: 'workflow', f: 40, sfx: 'click', vol: 0.6},
  {scene: 'workflow', f: 74, sfx: 'whoosh', vol: 0.55},
  {scene: 'workflow', f: 78, sfx: 'impact', vol: 0.5},
  {scene: 'ending', f: 4, sfx: 'shimmer', vol: 0.5},
  {scene: 'ending', f: 18, sfx: 'pop', vol: 0.5},
  {scene: 'ending', f: 112, sfx: 'whoosh', vol: 0.45},
  {scene: 'ending', f: 118, sfx: 'impact', vol: 0.45},
];
