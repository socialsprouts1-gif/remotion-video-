# Neura Chat — complete setup tutorial

A 3-minute 16:9 tutorial built from real screenshots and a screen recording, with motion graphics, captions and a synthesised score.

```bash
npm install
npm run score      # music + UI sounds from src/tutorial.json
npm run studio
npm run render     # → out/tutorial.mp4
```

Everything is driven by **`src/tutorial.json`**:
- `chapters`: the five chapter cards (title + start time).
- `shots`: one per screen, with `src` (screenshot or recording clip), `url` (shown in the window bar), and `steps`. Each step has a
  camera target (`cam: [x, y, zoom]`, zoom 0 = fit), an optional spotlight (`hl: [x1, y1, x2, y2]` in image pixels), `label`, `caption`,
  `cursor: [x, y]` and `click` time.
- `verify`: the illustrated end of the Meta flow.

The soundtrack reads the same file, so clicks, ticks and whooshes follow any timing you change.

To add or replace footage: put screenshots in `public/screens/` and clips in `public/rec/`, then add a shot.
The current clips were cut from the original recording with ffmpeg (browser bar cropped, speed-ramped); see SCRIPT.md.
