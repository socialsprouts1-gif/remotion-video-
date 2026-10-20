import tj from './tutorial.json';

export type Rect = [number, number, number, number];
export type Step = {t: number; cam: [number, number, number]; hl?: number[]; label?: string; caption?: string; cursor?: number[]; click?: number};
export type Shot = {
  id: string;
  chapter: number;
  start: number;
  dur: number;
  kind: 'image' | 'video';
  src: string;
  w: number;
  h: number;
  url: string;
  steps: Step[];
  blur?: number[][];
  enter?: string;
  exit?: string;
};

export const T = tj;
export const FPS = tj.fps;
export const SHOTS = tj.shots as unknown as Shot[];
export const CHAPTERS = tj.chapters;
