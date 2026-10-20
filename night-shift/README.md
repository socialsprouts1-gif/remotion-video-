# The Night Shift — NEURAXINE 24/7 film

37-second vertical (1080×1920, 30 fps) English motion film. Story and voiceover are in [SCRIPT.md](SCRIPT.md).

```bash
npm install
npm run score     # synthesise public/audio/score.wav from src/timeline.json
npm run studio
npm run render    # → out/night-shift.mp4
```

- `src/timeline.json`: every story time and the voiceover lines, shared by picture and score.
- `src/config.ts`: brand (logo, name, tagline), the five day events (title/subtitle/icon), audio routing.
- `src/components/Chat.tsx`: the 2:14 AM conversation.
- `src/components/Dial.tsx`: the 24-hour dial (hand, covered-day arc, sun/moon, event markers) and the event cards.
- `src/Film.tsx`: sky, opening clock, kinetic lines, final lockup, dolly.
- `scripts/make_score.py`: night motif → wake-up → 120 BPM day → closing hit, all synthesised and locked to the timeline.
