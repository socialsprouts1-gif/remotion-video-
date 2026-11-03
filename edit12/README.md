# edit12: Neuraxine, "automate your business" (talking head, 9:16)

One 41 s 4K take (`IMG_0126.mp4`, release `onetake-v2`) with premium motion graphics.
Render: `renders/neuraxine-automate.mp4` (1080x1920, 30 fps, 43 s incl. 1.8 s end card, -14 LUFS).

- **Lip sync:** already in sync (MediaPipe lip tracking vs voice loudness: 0-33 ms); no shift applied. Re-checked on the render: +33 ms.
- **Voice:** light clean-up only (high-pass, gentle denoise, EQ, compression, -15 LUFS).
- **Captions:** Whisper word timings, three passes (the long pass skipped the hook and translated the CTA, so those were redone in chunks prompted with the script). Text is what he says.

## Motion (each element starts on the word that names it, `src/cues.json`)

| Line | Graphic |
| --- | --- |
| 2026 mein agar… time waste | "2026" rolls in like an odometer above his head, "still manual?", a thin-line clock spinning |
| roz leads, WhatsApp replies, follow-ups, appointments | dark glass "Your day" panel; each task lands on its word, tagged MANUAL, counter "4 tasks · daily" |
| karte-karte… growth pe focus nahi | the stack jitters under pressure; a flat "Growth / on hold" line above his head |
| But what if… AI handle | "but what if… / AI handles it."; a lime sweep flips every task to AI, ticked |
| AI agents… automated workflow… custom… your business needs | a four-node workflow drawing itself, pulse running through |
| That's what we do at Neuraxine… save time, reduce manual work, scale | Neuraxine lockup; three benefits, each on its word |
| comment karo AUTOMATE… guide DM | comment box types AUTOMATE in time with the word, Posted; the guide arrives as a DM |
| follow Neuraxine | profile row, Follow tapped on "follow"; end card |

Style: one accent (logo lime #A0D306), Geist + Instrument Serif italic + Geist Mono, thin-line SVG icons,
soft springs and eased push-ins. No emoji, no glows. Sound: warm 100 bpm bed that drops out before
"But what if", quiet interface ticks, typing, a DM ping.

## Rebuild

```bash
npm install
python3 scripts/build_words.py && python3 scripts/build_edit.py && python3 scripts/make_score.py
npx remotion render Edit out/neuraxine-automate.mp4
```
`public/clips/main.mp4`: `ffmpeg -i IMG_0126.mp4 -an -vf scale=1080:1920:flags=lanczos -crf 16 public/clips/main.mp4`.
