/** Turn a speech-to-text result into word-timed caption clips. Pure / client-safe. */
export interface Word { text: string; start: number; end: number }

/** Normalise transcripts from different providers (ElevenLabs Scribe, Whisper chunks, mock). */
export function wordsFromTranscript(t: unknown): Word[] {
  const o = t as { words?: { text?: string; word?: string; start?: number; end?: number; type?: string }[]; chunks?: { text: string; timestamp: [number, number] }[] };
  if (Array.isArray(o?.words))
    return o.words
      .filter((w) => (w.type ?? "word") === "word" && (w.text ?? w.word ?? "").trim())
      .map((w) => ({ text: (w.text ?? w.word ?? "").trim(), start: w.start ?? 0, end: w.end ?? (w.start ?? 0) + 0.3 }));
  if (Array.isArray(o?.chunks))
    return o.chunks.flatMap((c) => {
      const parts = c.text.trim().split(/\s+/).filter(Boolean);
      const [a, b] = c.timestamp;
      const step = (b - a) / Math.max(1, parts.length);
      return parts.map((p, i) => ({ text: p, start: a + i * step, end: a + (i + 1) * step }));
    });
  return [];
}

/**
 * Group words into caption lines (max N words or a pause > 0.6s) and return
 * text-clip specs positioned in timeline frames relative to a source clip.
 */
export function captionClips(words: Word[], opts: { fps: number; offsetFrames: number; trimStartFrames: number; speed: number; maxWords?: number; style: Record<string, unknown>; y: number; width: number }) {
  const max = opts.maxWords ?? 4;
  const lines: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    if (cur.length && (cur.length >= max || w.start - cur[cur.length - 1].end > 0.6)) {
      lines.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) lines.push(cur);
  const toTimeline = (sec: number) => Math.round((sec * opts.fps - opts.trimStartFrames) / opts.speed) + opts.offsetFrames;
  return lines
    .map((line) => {
      const start = toTimeline(line[0].start);
      const end = Math.max(start + 4, toTimeline(line[line.length - 1].end) + 2);
      return {
        type: "text" as const,
        name: "Caption",
        text: line.map((w) => w.text).join(" "),
        start,
        duration: end - start,
        transform: { y: opts.y, width: opts.width, height: Math.round(opts.width * 0.25) },
        style: opts.style,
        words: line.map((w) => ({ text: w.text, start: toTimeline(w.start) - start, end: toTimeline(w.end) - start, highlight: false })),
      };
    })
    .filter((c) => c.start >= opts.offsetFrames - 1);
}
