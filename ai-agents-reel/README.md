# Neuraxine — "AI agents" reel

A 39-second vertical (1080 × 1920, 30 fps) reel for the script below, built in Remotion with the same engine and look as `../nurachat-video`, branded with the Neuraxine logo.

```bash
npm install
npm run studio     # live preview + timeline scrubbing
npm run render     # → out/neuraxine-ai-agents.mp4
```

In a headless container, pass a local Chromium: `npx remotion render NeuraxineAIAgents out/neuraxine-ai-agents.mp4 --browser-executable=/path/to/chrome`.

## Timeline

| # | Scene | Time | On screen |
|---|---|---|---|
| 1 | Hook | 0–5.4s | Logo → "Imagine if your business could **work on its own**… without you giving instructions." |
| 2 | Impossible | 5.4–10.2s | "Sounds **impossible?**" shakes and breaks away → "But **AI agents** are making it possible." |
| 3 | Agent | 10.2–19s | Four steps land with the voice: understands queries, answers questions, qualifies leads, books sales meetings |
| 4 | Connect | 19–26s | The Neuraxine mark wired to WhatsApp, CRM, Calendar, Sheets, Email, Payments → "That's where the **real power** begins." |
| 5 | Workflow | 26–31.8s | "Not just generating content" gets struck out → "Your entire **workflow**, intelligent." |
| 6 | Ending | 31.8–39s | Comment **AUTOMATION** for the guide in your DMs → logo, wordmark, "Follow Neuraxine for more AI" |

## Adding your voiceover

Record the script line by line to the timings in `CAPTIONS` (`src/config.ts`), export one file to `public/audio/voiceover.mp3`, set `AUDIO.voiceover = 'audio/voiceover.mp3'`, and render again. Sound effects drop back automatically when a voice is present. If your read runs faster or slower, nudge the scene times in `T` and the caption `at`/`to` values.

Everything you'd change (copy, timings, captions, sound cues, brand) is in `src/config.ts`.
