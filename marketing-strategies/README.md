# 5 Marketing Strategies — premium motion reel (Hindi voiceover)

A 74-second vertical (1080 × 1920, 30 fps) motion-graphics reel built in Remotion.
Look: matte black editorial, ivory type, one orange accent, Instrument Serif + Inter, film grain, hairline frame.
Hindi voiceover (Kokoro, free open-source TTS), Hinglish word-by-word captions, synthesised music and sound effects.

```bash
npm install
npm run studio     # preview
npm run render     # → out/marketing-strategies.mp4
```

Headless: add `--browser-executable=/path/to/chrome`. Review frames: `node scripts/stills.mjs 75 450 1980` → `out/stills/`.

## Story

| Section | What happens |
|---|---|
| Hook | "Product accha hai. Phir bhi sales nahi?" over a falling sales line → "Problem product mein nahi" (struck out) → "Marketing mein hai." and the chart flips to growth |
| Intro | A huge serif **5**, "marketing strategies", the five chapter pills; the chapter rail appears at the bottom |
| 01 Sahi audience | A grid of people flickers ("sell to everyone"), a reticle scans and locks on a cluster, the ideal-customer persona card slides in |
| 02 Value content | A shouty "BUY NOW" ad is crossed out; three value posts fan in with likes rising; a Bharosa → Sale bar fills |
| 03 Social proof | Rating counts to 4.9, stars fill, review cards slide in, then "Website · Instagram · WhatsApp · Ads" chips |
| 04 Follow-up & retargeting | A visitor leaves the loop, WhatsApp / Email / Ads light up as the voice names them, and the loop closes on "Sale ✓" |
| 05 Data dekho | Two channels chart: Reels gets "2× BUDGET", Banner ads gets cut "OFF" |
| Outro | "Marketing ~~kismat nahi~~, ek system hai." |
| CTA | "Comment karo GROW" — the keyword is typed and posted in a comment box, then the Follow button flips to "Following ✓" |

## How timing works

`scripts/make_voiceover.py` holds the script (Devanagari for the voice, Roman Hinglish for captions). It synthesises every line,
lays them end to end and writes `src/vo.json` with each line's start and length. Scene windows (`SCENES` in `src/config.ts`)
and the moments inside scenes (`cue()`, `wordAt()`) are read from it, so editing a line and re-running the script re-times the film.

```bash
~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py          # male voice (hm_omega)
~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py hf_alpha # female voice
python3 scripts/make_music.py && ffmpeg -y -i public/audio/music.wav -b:a 192k public/audio/music.mp3 && rm public/audio/music.wav
```

Kokoro setup is at the top of `scripts/make_voiceover.py`.

## Where to change things

`src/config.ts`: `BRAND` (handle, series name, CTA keyword), chapter titles, persona, posts, reviews, audio volumes.
Rating, reviews, likes and chart are illustrative examples, not real data.
