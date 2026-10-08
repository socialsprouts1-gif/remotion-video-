import tl from './timeline.json';

/** All story times, in seconds. Shared with scripts/make_score.py so picture and sound stay locked. */
export const B = tl.beats;
export const FPS = tl.fps;
export const DURATION = tl.duration;
export const VO = tl.voiceover as [number, string][];
export const CLOCK_KEYS = tl.beats.clockKeys as [number, number][];
