// Brand, copy and timing. Scene windows come from the voiceover (src/vo.json, written by
// scripts/make_voiceover.py), so re-generating the voice re-times the film.
import vo from './vo.json';

export const VIDEO = {width: 1080, height: 1920, fps: 30};
const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  name: 'Neuraxine',
  handle: 'neuraxine',
  site: 'www.neuraxine.com',
  tagline: 'AI Automation Agency',
  series: 'NEURAXINE · AI AUTOMATION',
  keyword: 'AUTOMATE',
  logo: 'brand/logo.png',
};

// The Instagram profile rebuilt from the page screenshot (opener + CTA).
export const PROFILE = {
  posts: 29,
  followers: 1467,
  following: 6,
  bio: ['AI Automation Agency', 'We build smart AI systems', 'For business & creators'],
  tiles: [
    {a: 'Amit ne dekhi', b: 'Goa package reel.', views: '645'},
    {a: 'Rahul ne dekhi', b: 'SUV wali reel.', views: '2,066'},
    {a: 'QR scan, order,', b: 'bill WhatsApp par.', views: '44.5K'},
    {a: 'Rohit ko chahiye tha', b: 'apna 3BHK ghar.', views: '3,120'},
    {a: 'Kapde nahi,', b: 'try-on dikhao.', views: '1,894'},
    {a: 'Turant', b: 'reply.', views: '5,402'},
  ],
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

// Chapter cards in the brand's post voice: "X nahi, Y."  (`hl` = the word on the green highlight)
export const CHAPTERS = [
  {id: 's1' as SceneId, a: 'Late reply nahi,', b: 'turant WhatsApp jawab.', hl: 'WhatsApp', short: 'Auto-reply'},
  {id: 's2' as SceneId, a: 'Lead bhoolna nahi,', b: 'har lead ka follow-up.', hl: 'follow-up', short: 'Follow-up'},
  {id: 's3' as SceneId, a: 'Call pe call nahi,', b: 'chat mein booking.', hl: 'booking', short: 'Booking'},
  {id: 's4' as SceneId, a: 'Review maangna nahi,', b: 'khud aaye Google review.', hl: 'Google', short: 'Reviews'},
  {id: 's5' as SceneId, a: 'Manual bill nahi,', b: 'auto invoice, auto payment.', hl: 'invoice', short: 'Invoice'},
];

export const PERSONA = {
  name: 'Riya, 32',
  rows: ['Boutique owner · Jaipur', 'Instagram pe roz active', 'Problem: footfall kam'],
};

// Real posts from the page (cropped from the profile screenshot into public/posts/).
export const POSTS = [
  {img: 'posts/p1.png', views: '645', caption: 'Goa package reel'},
  {img: 'posts/p2.png', views: '2,066', caption: 'SUV wali reel'},
  {img: 'posts/p3.png', views: '44.5K', caption: 'QR order, WhatsApp bill'},
];

export const REVIEWS = [
  {name: 'Neha · Pune', text: 'Delivery super fast, quality top!'},
  {name: 'Arjun · Delhi', text: 'Ekdum premium experience.'},
  {name: 'Simran · Indore', text: 'Dobara zaroor order karungi.'},
];
export const PROOF_PLACES = [
  {label: 'Google', icon: 'google'},
  {label: 'Instagram', icon: 'instagram'},
  {label: 'WhatsApp', icon: 'whatsapp'},
  {label: 'Ads', icon: 'meta'},
] as const;

export const AUDIO = {
  voiceover: 'audio/voiceover.mp3' as string | null,
  voiceVolume: 1,
  music: 'audio/music.mp3' as string | null,
  musicVolume: 0.32,
  sfxVolume: 0.8,
};
