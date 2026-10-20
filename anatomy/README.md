# The Anatomy of a Reply — NEURAXINE premium 3D film

40-second vertical (1080×1920, 30 fps) English product film. Story and voiceover are in [SCRIPT.md](SCRIPT.md).

```bash
npm install
npm run score     # synthesise public/audio/score.wav from src/timeline.json
npm run studio
npm run render    # → out/anatomy.mp4
```

Set `BLUR.samples` in `src/config.ts` to 1 for fast drafts. The final uses 6-sample camera motion blur, which renders about 6× slower.

- `src/timeline.json`: every story beat and the voiceover lines, shared by picture and score.
- `src/lib/pose.ts`: keyframed 3D poses (x/y/z, rotations, log-space scale), `place()` and depth-of-field.
- `src/components/Stage.tsx`: the CSS-3D world (orbiting camera, glass slabs, word explosion, knowledge carousel, letter-assembled reply, lead card flip, calendar floor, message sphere). Rule: transforms on containers, opacity and blur only on leaves, so nothing flattens.
- `src/components/Overlay.tsx`: chapter headers and rail, kinetic lines, anamorphic flares, logo lockup.
- `src/config.ts`: brand, the demo conversation, knowledge cards, audio, motion blur.
- `scripts/make_score.py`: synthesised score. Carousel ratchet clicks are computed from the spin curve, and the reply sparkles follow the letter timing.
