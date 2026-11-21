# Neuraxine — 5 Marketing Strategies (3D motion reel, Hindi voiceover)

A 79-second vertical (1080 × 1920, 30 fps) Remotion reel for **@neuraxine**, styled after a 3D phone-dive
reference and the page's own post template. Hindi voiceover (Kokoro, free TTS), Hinglish word-by-word captions,
synthesised music and SFX.

```bash
npm install
npm run studio
npm run render     # → out/neuraxine-strategies.mp4
```

Headless: add `--browser-executable=/path/to/chrome`. Review frames: `node scripts/stills.mjs 45 150 540` → `out/stills/`.

## Story

| Section | What happens |
|---|---|
| Opener (0–3.7 s) | A phone spins in showing the neuraxine Instagram profile (rebuilt from the page screenshot); the post tiles lift out of the screen in 3D; the camera dives at the avatar, which rises off the screen and flips into the NX logo on a glowing holographic platform |
| Hook | Lyric-style 3D kinetic type that slams in on each spoken word: "Aapka *product* accha hai… phir bhi SALES nahi aa rahi?" → "Problem ~~product mein~~ nahi hai." → "MARKETING mein." |
| Intro | A glowing **5** on the holo ring, "marketing strategies", the five chapter pills |
| 01–05 | Each chapter opens with a card in the page's post template (cream grid paper, "● NEURAXINE", "STRATEGY n/5", bold line + italic serif line, green highlight) in the brand's "X nahi, Y" voice; the visuals sit on a slowly orbiting 3D camera and whip between chapters |
| Outro | Kinetic: "Yaad rakho, Marketing ~~kismat~~ nahi, ek SYSTEM hai." |
| CTA | The profile returns: "GROW" is typed and posted as a comment, the camera pushes to the Follow button, it flips to "Following ✓" (followers +1), then the NX logo lockup on the holo ring with NEURAXINE · AI AUTOMATION AGENCY · www.neuraxine.com |

## Editing

- `src/config.ts`: brand, the rebuilt profile (`PROFILE`: stats, bio, grid tiles), chapter cards (`CHAPTERS`), persona, posts, reviews.
- Voice + timing: `scripts/make_voiceover.py` (script lines, `LEAD` = opener length). Re-run it and the whole film re-times from `src/vo.json`.
- Music: `python3 scripts/make_music.py`, then encode to `public/audio/music.mp3`.
- Logo: `public/brand/logo.png`.

Rating, reviews, likes and chart values inside the chapters are illustrative examples.
