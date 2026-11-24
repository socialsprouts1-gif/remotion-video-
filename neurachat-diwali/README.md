# Neura Chat — "Diwali offer" cartoon story

~61 s · 1080×1920 · 30 fps · Hinglish, one voice per character. A flat-vector cartoon built entirely in code (Remotion + SVG).

Story: Kaka finds out the rival shop (Gupta Electronics) sent everyone a Diwali offer on WhatsApp → customers walk over →
Seth ji wants to message all 2,000 customers, but one-by-one would take forever and bulk-sending blocks the number →
Raju shows Neura Chat: CRM with all customers, offer poster, select all, one-click send via the WhatsApp API, read/reply report,
AI replying to a price question at 11:48 PM → the shop fills up → "Happy Diwali!" → end card with "Comment WHATSAPP".

The characters, shops and customer names are original/fictional.

```bash
npm ci
~/.cache/kokoro/venv/bin/python scripts/make_voiceover.py   # voices + src/vo.json (timeline + lip-sync envelopes)
python3 scripts/make_music.py && ffmpeg -y -i public/audio/music.wav -b:a 192k public/audio/music.mp3
npx remotion render Diwali out/neurachat-diwali.mp4
```

- `scripts/make_voiceover.py`: the script (one line per row: scene, speaker, Devanagari for the voice, Roman for captions) and the voice per character.
- `src/chars/Character.tsx`: the three characters (arms, expressions, blinking, lip sync, walk cycle, props).
- `src/world/Shop.tsx`: shop interior, counter, street, crowd silhouettes. `src/world/Laptop.tsx`: the Neura Chat dashboard screens.
- `src/Film.tsx`: the scenes, camera moves, captions and end card. `src/SfxTrack.tsx`: sound effects.
