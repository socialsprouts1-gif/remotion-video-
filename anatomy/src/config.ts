/** Brand, demo copy and audio. Story times live in src/timeline.json. */
export const BRAND = {
  logo: 'brand/logo.png', // square, black background (screen-blended)
  name: 'NEURAXINE AI AUTOMATION',
  sub: 'WhatsApp AI automation',
};

// The demo conversation. A business's own (sample) content — no product claims or numbers.
export const MSG_IN = ['Hi,', 'how', 'much', 'is', 'the', 'premium', 'package?'];
export const KEYWORDS = [1, 2, 5, 6];
export const REPLY = [
  'The Premium package includes setup,',
  '24/7 AI replies and smart follow-ups.',
  'Want me to book a quick call?',
];
export const CUST_YES = 'Yes — tomorrow evening works.';
export const KNOWLEDGE = ['Packages', 'Pricing', 'FAQ', 'Policies', 'Hours', 'Offers'];

export const AUDIO = {
  voiceover: null as string | null, // e.g. 'audio/voiceover.wav' — record SCRIPT.md
  voiceVolume: 1,
  score: 'audio/score.wav',
  scoreVolume: 1,
  duckUnderVoice: 0.6,
};

/** Multi-sample camera motion blur (renders `samples`× slower). Set samples to 1 for fast drafts. */
export const BLUR = {shutterAngle: 200, samples: 1};
