/**
 * Everything you are likely to change lives here: brand, copy, timings,
 * screenshots + the areas the camera focuses on, captions, sound cues.
 *
 * Text markup: wrap a word in *asterisks* to paint it in the accent colour.
 */
import {sec} from './lib/anim';

export const BRAND = {
  name: 'NuraChat',
  tagline: 'WhatsApp Automation for Your Business',
  // Replace with the original logo file (PNG/SVG, square, transparent or black bg).
  // The current file is upscaled from the 46px mark in the dashboard screenshot.
  logo: 'brand/logo.png',
  cta: 'Follow for the complete tutorial.',
  // cta: "Comment 'AUTOMATION' to learn more.",
};

export const VIDEO = {width: 1080, height: 1920, fps: 30};

/** Frames two neighbouring scenes overlap, so exits and entrances blend. */
export const OVERLAP = 8;

// Scene boundaries in seconds. Durations are derived from these.
const T = {
  hook: 0,
  problem: 4.2,
  solution: 8.5,
  panel: 13.5,
  how: 20.5,
  demo: 27.5,
  result: 36.5,
  ending: 42,
  end: 47.5,
};

const order = ['hook', 'problem', 'solution', 'panel', 'how', 'demo', 'result', 'ending'] as const;
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

// ---------------------------------------------------------------- screenshots
// Browser chrome is cropped off; product pixels are untouched.
// Rect coordinates below are in each image's own pixel space: [x1, y1, x2, y2].
export const SCREENS = {
  integrations: {src: 'screens/integrations.png', w: 2000, h: 1131},
  chatbots: {src: 'screens/chatbots.png', w: 2000, h: 1131},
  landing: {src: 'screens/landing.png', w: 2000, h: 1131},
};

export type Rect = [number, number, number, number];

/** Scene 4: tour of the real sidebar. Only features visible in the screenshot. */
export const PANEL_TOUR: {label: string; rect: Rect}[] = [
  {label: 'LEAD CAPTURE', rect: [16, 172, 310, 224]}, // "Leads"
  {label: 'AUTOMATIC FOLLOW-UP', rect: [16, 232, 310, 284]}, // "Drip Campaigns"
  {label: 'APPOINTMENT BOOKING', rect: [16, 412, 310, 464]}, // "Appointments"
  {label: 'AUTO REPLIES', rect: [16, 972, 310, 1024]}, // "FAQ Bot"
];

/** Scene 6: walkthrough of the chatbot list, then integrations. */
export const DEMO_CHATBOTS: {label: string; rect: Rect; side?: 'right' | 'left' | 'above' | 'below'}[] = [
  {label: 'APPOINTMENT BOT', rect: [380, 626, 1150, 738], side: 'above'}, // Salon & Spa Enquiry and Appointment Bot
  {label: 'LEAD MANAGEMENT', rect: [380, 754, 1150, 866], side: 'below'}, // CA Firm Enquiry and Lead Management Bot
  {label: 'BUILD WITH AI', rect: [976, 352, 1202, 421], side: 'below'}, // "Build with AI" button
];
export const DEMO_INTEGRATIONS: {label: string; rect: Rect; side?: 'right' | 'left' | 'above' | 'below'}[] = [
  {label: 'WHATSAPP CONNECTED', rect: [720, 168, 860, 210], side: 'below'}, // "Connected" badge
  {label: 'ZAPIER · MAKE · N8N', rect: [372, 678, 1956, 962], side: 'below'},
];

// ---------------------------------------------------------------- copy
export const COPY = {
  hookIntro: ['Aaj hum', 'sikhne jaa', 'rahe hain…'],
  hookTitle: ['WHATSAPP', '*AUTOMATION*'],
  notifications: [
    {name: 'Rahul', text: 'Price kya hai?'},
    {name: 'Priya', text: 'Available hai?'},
    {name: 'Amit', text: 'Details bhejo'},
    {name: 'Sneha', text: 'Appointment book karna hai'},
    {name: 'Vikram', text: 'Reply please'},
    {name: 'Neha', text: 'Hello?'},
    {name: 'Arjun', text: 'Price kya hai?'},
    {name: 'Kavya', text: 'Kal ka slot milega?'},
  ],
  problemQ: ['Har message ka', '*manually* reply?'],
  problemNo: '*NO MORE.*',
  meet: 'Meet',
  solutionSub: ['Your *WhatsApp*', '*Automation* System'],
  solutionFlow: ['CUSTOMER', 'WHATSAPP', BRAND.name.toUpperCase(), 'AI RESPONSE'],
  panelKicker: 'ACTUAL PANEL',
  panelTitle: `Inside *${BRAND.name}*`,
  howKicker: 'HOW IT WORKS',
  howSteps: ['CUSTOMER MESSAGE', 'AI UNDERSTANDS', 'AUTOMATIC REPLY', 'LEAD QUALIFICATION', 'FOLLOW-UP', 'APPOINTMENT'],
  demoKicker: 'WALKTHROUGH',
  demoTitleA: '*Chatbots*',
  demoTitleB: '*Integrations*',
  resultChain: ['WhatsApp Messages', 'AI Response', 'Lead', 'Follow-up', 'Appointment'],
  resultLines: [
    ['*Less*', 'Manual Work.'],
    ['*Faster*', 'Responses.'],
    ['*More Organized*', 'Leads.'],
  ],
  endWords: ['Automate.', 'Respond.', '*Convert.*'],
};

// ---------------------------------------------------------------- voiceover / captions
// Timings (seconds, global) the voiceover is written to. `show: false` hides the
// subtitle where the same words are already on screen as big type.
export const CAPTIONS: {at: number; to: number; text: string; show?: boolean}[] = [
  {at: 0.3, to: 2.1, text: 'Aaj hum sikhne jaa rahe hain…', show: false},
  {at: 2.1, to: 4.1, text: 'WhatsApp Automation.', show: false},
  {at: 4.3, to: 6.6, text: 'Kaise WhatsApp par aane wale customer messages ko automatically handle karein…'},
  {at: 6.6, to: 8.4, text: 'Har message ka manually reply? Ab nahi.', show: false},
  {at: 8.6, to: 10.9, text: 'Leads qualify karna, follow-ups bhejna, appointments book karna…'},
  {at: 10.9, to: 13.4, text: 'Ye sab hum karenge NuraChat ke through.'},
  {at: 13.6, to: 16.4, text: 'Ye hai NuraChat ka actual panel.'},
  {at: 16.4, to: 20.4, text: 'Leads, drip campaigns, appointments aur FAQ bot — sab ek jagah.'},
  {at: 20.6, to: 21.9, text: 'Customer WhatsApp par message karta hai…'},
  {at: 21.9, to: 23.2, text: 'AI automatically reply karta hai…'},
  {at: 23.2, to: 24.4, text: 'Lead ko qualify karta hai…'},
  {at: 24.4, to: 25.5, text: 'Follow-up karta hai…'},
  {at: 25.5, to: 27.4, text: 'Aur zarurat padne par appointment bhi book karwa sakta hai.'},
  {at: 27.6, to: 30.2, text: 'Chatbots section mein ready bots hain — jaise salon appointment bot…'},
  {at: 30.2, to: 31.8, text: 'CA firm ke liye lead management bot…'},
  {at: 31.8, to: 33.0, text: 'Ya “Build with AI” se apna bot banao.'},
  {at: 33.0, to: 36.4, text: 'Integrations mein WhatsApp Business connected hai — Zapier, Make, n8n bhi.'},
  {at: 36.6, to: 41.8, text: 'Result? Kam manual kaam, faster replies, aur organized leads.'},
  {at: 42.1, to: 45.0, text: 'Automate. Respond. Convert.', show: false},
  {at: 45.0, to: 47.4, text: 'Complete tutorial ke liye follow karo.', show: false},
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
  {scene: 'hook', f: 12, sfx: 'whooshSoft', vol: 0.5},
  {scene: 'hook', f: 60, sfx: 'whoosh', vol: 0.7},
  {scene: 'hook', f: 64, sfx: 'impact', vol: 0.45},
  ...[4, 11, 17, 23, 29, 35, 41, 47].map((f, i) => ({scene: 'problem' as const, f, sfx: 'pop' as const, vol: 0.32 + (i % 2) * 0.06})),
  {scene: 'problem', f: 58, sfx: 'whooshSoft', vol: 0.45},
  {scene: 'problem', f: 80, sfx: 'riser', vol: 0.45},
  {scene: 'problem', f: 98, sfx: 'impact', vol: 0.8},
  {scene: 'problem', f: 98, sfx: 'whoosh', vol: 0.55},
  {scene: 'solution', f: 4, sfx: 'shimmer', vol: 0.45},
  {scene: 'solution', f: 36, sfx: 'whooshSoft', vol: 0.45},
  ...[70, 86, 102, 118].map((f) => ({scene: 'solution' as const, f, sfx: 'tick' as const, vol: 0.5})),
  {scene: 'panel', f: 2, sfx: 'whoosh', vol: 0.55},
  {scene: 'panel', f: 36, sfx: 'whooshSoft', vol: 0.4},
  ...[66, 104, 142, 180].map((f) => ({scene: 'panel' as const, f, sfx: 'click' as const, vol: 0.55})),
  {scene: 'how', f: 2, sfx: 'whooshSoft', vol: 0.45},
  ...[14, 46, 74, 106, 136, 166].map((f) => ({scene: 'how' as const, f, sfx: 'tick' as const, vol: 0.5})),
  {scene: 'demo', f: 2, sfx: 'whoosh', vol: 0.55},
  {scene: 'demo', f: 30, sfx: 'whooshSoft', vol: 0.4},
  ...[50, 88, 132].map((f) => ({scene: 'demo' as const, f, sfx: 'click' as const, vol: 0.55})),
  {scene: 'demo', f: 152, sfx: 'whoosh', vol: 0.5},
  ...[180, 234].map((f) => ({scene: 'demo' as const, f, sfx: 'click' as const, vol: 0.55})),
  {scene: 'demo', f: 204, sfx: 'whooshSoft', vol: 0.4},
  {scene: 'result', f: 2, sfx: 'whooshSoft', vol: 0.45},
  ...[8, 18, 28, 38, 48].map((f) => ({scene: 'result' as const, f, sfx: 'tick' as const, vol: 0.4})),
  ...[84, 106, 128].map((f) => ({scene: 'result' as const, f, sfx: 'whooshSoft' as const, vol: 0.4})),
  {scene: 'ending', f: 4, sfx: 'shimmer', vol: 0.5},
  ...[18, 30, 42].map((f) => ({scene: 'ending' as const, f, sfx: 'whooshSoft' as const, vol: 0.45})),
  {scene: 'ending', f: 44, sfx: 'impact', vol: 0.5},
  {scene: 'ending', f: 92, sfx: 'whoosh', vol: 0.45},
];
