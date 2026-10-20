/** Brand + audio. Story times live in src/timeline.json. */
export const BRAND = {
  logo: 'brand/logo.png', // square, black background (screen-blended)
  name: 'NEURAXINE AI AUTOMATION',
  sub: 'WhatsApp AI automation',
};

export const AUDIO = {
  voiceover: null as string | null, // e.g. 'audio/voiceover.wav' — record SCRIPT.md
  voiceVolume: 1,
  score: 'audio/score.wav',
  scoreVolume: 1,
  duckUnderVoice: 0.6,
};

/** The day the dial sweeps through. Each is a feature in the NEURAXINE dashboard. */
export const EVENTS: {title: string; sub: string; icon: 'repeat' | 'filter' | 'chat' | 'send' | 'bell'}[] = [
  {title: 'Follow-up sent', sub: "To yesterday's new leads", icon: 'repeat'},
  {title: 'Lead qualified', sub: 'Tagged: ready to buy', icon: 'filter'},
  {title: 'Question answered', sub: '“What are your prices?”', icon: 'chat'},
  {title: 'Campaign delivered', sub: 'To your customer list', icon: 'send'},
  {title: 'Reminder sent', sub: '“See you tomorrow, 10:30 AM”', icon: 'bell'},
];
