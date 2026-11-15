// Everything you are likely to change lives here: brand, scene timings, chat script, copy, sound cues.
// Times are in seconds. Chat-script times are relative to the start of the chat scene.

export const VIDEO = {width: 1080, height: 1920, fps: 30};
const f = (s: number) => Math.round(s * VIDEO.fps);

export const BRAND = {
  name: 'FX Academy', // shown in the WhatsApp header, welcome message and end card
  initials: 'FX',
  agent: 'Priya',
  agentRole: 'Senior Advisor',
  ctaLine: 'Apni academy ke liye yeh system chahiye?',
  cta: "DM 'AUTOMATE'",
};

// Scene windows on the master timeline. Neighbours overlap a little so they blend.
const T = {
  hook: [0, 4.6],
  problem: [4.4, 9.0],
  chat: [8.8, 37.0],
  broadcast: [36.8, 42.0],
  dashboard: [41.8, 48.8],
  ending: [48.6, 56.0],
} as const;

export type SceneId = keyof typeof T;
export const SCENES = Object.fromEntries(
  Object.entries(T).map(([k, [a, b]]) => [k, {from: f(a), dur: f(b) - f(a), start: a}]),
) as Record<SceneId, {from: number; dur: number; start: number}>;
export const TOTAL_FRAMES = f(56.0);

// ---------- Copy ----------
// Wrap words in *asterisks* to paint them gold.
export const COPY = {
  hookKicker: 'FOREX TRADING ACADEMY',
  hook1: ['Ek WhatsApp', 'number.'],
  hook2: ['Lead se customer tak,', '*sab automated.*'],
  problem: ['Manual reply?', '*Leads lost.*'],
  broadcastChip: '07 · BROADCAST',
  broadcast: ['Ek click mein', '*sab tak* update'],
  dashboardChip: '08 · TRACKING',
  dashboard: ['Har number', '*saaf dikhega*'],
  ending1: ['Lead se *customer* tak.'],
  ending2: ['Poori journey,', '*automated.*'],
};

// Notifications that pile up in the problem scene.
export const NOTIFICATIONS = [
  {name: 'Rahul', text: 'Sir course ki fees kitni hai?', ago: 'abhi'},
  {name: '+91 98XXX 21045', text: 'Mentorship kab start hogi?', ago: '1m'},
  {name: 'Neha', text: 'Free class ka link bhej do', ago: '3m'},
  {name: 'Amit', text: 'Investor plan ki details?', ago: '7m'},
  {name: '+91 70XXX 88412', text: 'Hello?? Koi hai?', ago: '12m'},
  {name: 'Sana', text: 'Beginner hoon, kahan se start karun?', ago: '18m'},
];

// Chat-scene sections: the step chip and headline shown above the phone.
export const SECTIONS = [
  {from: 0, to: 3.0, chip: '01 · AUTO WELCOME', lines: ['Har naya lead,', '*instant welcome*']},
  {from: 3.0, to: 6.2, chip: '02 · SERVICE MENU', lines: ['Kis service mein', '*interested* ho?']},
  {from: 6.2, to: 11.4, chip: '03 · SAHI INFO', lines: ['Usi hisaab se', '*videos, PDFs*']},
  {from: 11.4, to: 17.0, chip: '04 · LEAD DETAILS', lines: ['Naam, experience,', '*budget* — auto']},
  {from: 17.0, to: 22.6, chip: '05 · CRM + FOLLOW-UP', lines: ['CRM mein save.', '*Follow-ups* auto.']},
  {from: 22.6, to: 28.2, chip: '06 · HUMAN HANDOVER', lines: ['Serious lead?', '*Agent* ko handover']},
];

export type MenuOption = {icon: string; label: string};
export type Msg =
  | {at: number; kind: 'text'; from: 'user' | 'bot' | 'agent'; text: string; icon?: string}
  | {at: number; kind: 'menu'; text: string; options: MenuOption[]; tapAt: number; tapIndex: number}
  | {at: number; kind: 'video'; title: string; meta: string}
  | {at: number; kind: 'pdf'; title: string; meta: string}
  | {at: number; kind: 'system'; text: string}
  | {at: number; kind: 'typing'; until: number; from: 'bot' | 'agent'};

export const CHAT: Msg[] = [
  {at: 0.5, kind: 'text', from: 'user', text: 'Hi, mujhe forex trading seekhni hai'},
  {at: 1.0, kind: 'typing', until: 1.7, from: 'bot'},
  {at: 1.7, kind: 'text', from: 'bot', text: `Namaste! ${BRAND.name} mein aapka swagat hai`, icon: 'waving_hand'},
  {at: 2.4, kind: 'typing', until: 3.1, from: 'bot'},
  {
    at: 3.1,
    kind: 'menu',
    text: 'Aap kis service mein interested hain?',
    options: [
      {icon: 'light_bulb', label: 'Free Forex Course'},
      {icon: 'crown', label: '1:1 Mentorship'},
      {icon: 'money_bag', label: 'Investor Program'},
    ],
    tapAt: 5.3,
    tapIndex: 1,
  },
  {at: 5.8, kind: 'text', from: 'user', text: '1:1 Mentorship'},
  {at: 6.2, kind: 'typing', until: 6.8, from: 'bot'},
  {at: 6.8, kind: 'video', title: 'Mentorship kaise kaam karti hai', meta: 'Video · 2:14'},
  {at: 7.7, kind: 'pdf', title: 'Mentorship-Syllabus.pdf', meta: '12 pages · PDF'},
  {at: 8.5, kind: 'typing', until: 9.0, from: 'bot'},
  {at: 9.0, kind: 'text', from: 'bot', text: 'Next step: kal 7 PM free demo class. Join link neeche', icon: 'calendar'},
  {at: 11.2, kind: 'text', from: 'bot', text: 'Aapka naam?'},
  {at: 11.9, kind: 'text', from: 'user', text: 'Rahul Sharma'},
  {at: 12.5, kind: 'text', from: 'bot', text: 'Trading experience kitna hai?'},
  {at: 13.2, kind: 'text', from: 'user', text: '1–2 saal'},
  {at: 13.8, kind: 'text', from: 'bot', text: 'Monthly budget kya hai?'},
  {at: 14.5, kind: 'text', from: 'user', text: '₹25k – ₹50k'},
  {at: 15.2, kind: 'text', from: 'bot', text: 'Shukriya Rahul! Details save ho gayi', icon: 'check_mark_button'},
  {at: 23.1, kind: 'text', from: 'user', text: 'Mujhe join karna hai. Call kar sakte ho?'},
  {at: 24.4, kind: 'system', text: `Chat handed over to ${BRAND.agent} · ${BRAND.agentRole}`},
  {at: 24.8, kind: 'typing', until: 25.5, from: 'agent'},
  {at: 25.5, kind: 'text', from: 'agent', text: `Hi Rahul, main ${BRAND.agent}. 5 min mein call karti hoon!`, icon: 'telephone_receiver'},
];

// Lead profile captured from the chat (filled as each answer arrives).
export const PROFILE = [
  {label: 'Interest', value: '1:1 Mentorship', at: 11.0},
  {label: 'Naam', value: 'Rahul Sharma', at: 12.0},
  {label: 'Experience', value: '1–2 saal', at: 13.3},
  {label: 'Budget', value: '₹25k – ₹50k', at: 14.6},
];

export const CRM_COLUMNS = [
  {title: 'Free Course', icon: 'light_bulb', count: 640, cards: ['Neha S.', 'Amit K.']},
  {title: 'Mentorship', icon: 'crown', count: 186, cards: ['Rohan V.']},
  {title: 'Investor', icon: 'money_bag', count: 42, cards: ['Vikram M.', 'Sana A.']},
];

export const FOLLOWUPS = [
  {day: 'Day 1', text: 'Demo class reminder', at: 19.0},
  {day: 'Day 3', text: 'Student success video', at: 19.6},
  {day: 'Day 7', text: 'Mentorship offer', at: 20.2},
];

export const FUNNEL = [
  {icon: 'speech_balloon', label: 'Leads aaye', value: 1250},
  {icon: 'light_bulb', label: 'Free mein jude', value: 640},
  {icon: 'crown', label: 'Mentorship kharidi', value: 186},
  {icon: 'money_bag', label: 'Investor bane', value: 42},
];

export const KPIS = [
  {value: '4 sec', label: 'Avg reply time'},
  {value: '3,420', label: 'Auto follow-ups'},
  {value: '96', label: 'Agent handovers'},
];

export const JOURNEY = [
  {icon: 'sparkles', label: 'Naya lead aaya'},
  {icon: 'waving_hand', label: 'Auto welcome'},
  {icon: 'index_pointing_up', label: 'Service select'},
  {icon: 'light_bulb', label: 'Videos · PDFs · Info'},
  {icon: 'speech_balloon', label: 'Naam · Experience · Budget'},
  {icon: 'bell', label: 'CRM + Follow-ups'},
  {icon: 'speaking_head', label: 'Human handover'},
  {icon: 'crown', label: 'Customer'},
];

// ---------- Audio ----------
export const AUDIO = {
  music: 'audio/music.mp3' as string | null, // generated by scripts/make_music.py
  musicVolume: 0.42,
  sfxVolume: 1,
  voiceover: null as string | null, // e.g. 'audio/voiceover.mp3' (script in VOICEOVER.md)
  voiceVolume: 1,
};

// Sound cues on the master timeline (seconds).
const chat = T.chat[0];
const at = (s: number) => chat + s;
export const SFX: {t: number; sfx: string; vol?: number}[] = [
  {t: 0.15, sfx: 'whoosh', vol: 0.5},
  {t: 0.4, sfx: 'impact', vol: 0.45},
  {t: 2.4, sfx: 'whooshSoft', vol: 0.4},
  ...[0.3, 0.65, 1.0, 1.35, 1.7, 2.05].map((s) => ({t: 4.4 + s, sfx: 'pop', vol: 0.32})),
  {t: 7.0, sfx: 'impact', vol: 0.5},
  {t: 8.9, sfx: 'whoosh', vol: 0.45},
  ...CHAT.filter((m) => m.kind !== 'typing').map((m) => ({t: at(m.at), sfx: 'pop', vol: 0.22})),
  {t: at(5.3), sfx: 'click', vol: 0.5},
  {t: at(11.0), sfx: 'whooshSoft', vol: 0.4},
  ...PROFILE.map((p) => ({t: at(p.at + 0.15), sfx: 'tick', vol: 0.35})),
  {t: at(16.9), sfx: 'whoosh', vol: 0.45},
  {t: at(18.2), sfx: 'impact', vol: 0.35},
  {t: at(18.4), sfx: 'shimmer', vol: 0.35},
  ...FOLLOWUPS.map((x) => ({t: at(x.at), sfx: 'tick', vol: 0.35})),
  {t: at(22.4), sfx: 'whoosh', vol: 0.4},
  {t: at(23.4), sfx: 'riser', vol: 0.35},
  {t: at(24.3), sfx: 'shimmer', vol: 0.4},
  {t: 37.0, sfx: 'whoosh', vol: 0.4},
  {t: 37.0 + 1.9, sfx: 'click', vol: 0.5},
  {t: 37.0 + 2.1, sfx: 'whoosh', vol: 0.4},
  {t: 42.0, sfx: 'whoosh', vol: 0.4},
  ...[0, 1, 2, 3].map((i) => ({t: 42.0 + 0.9 + i * 0.35, sfx: 'tick', vol: 0.3})),
  {t: 48.8, sfx: 'whooshSoft', vol: 0.4},
  {t: 48.8 + 3.5, sfx: 'impact', vol: 0.45},
  {t: 48.8 + 5.0, sfx: 'shimmer', vol: 0.4},
];
