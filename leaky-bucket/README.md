# Neura Chat — "Your WhatsApp is a leaky bucket" explainer

55s · 1080×1920 · flat illustrated explainer, English and Hinglish, same look as `../explainer`.

```bash
npm install
npm run score     # music, water plinks, leaks, patch pops (from src/story.json)
npm run render    # → out/bucket-en.mp4 and out/bucket-hi.mp4
```

Story: leads pour into the WhatsApp bucket → it has three holes (late replies, forgotten follow-ups, leads lost in chats) →
pouring more ads doesn't help → fix the bucket: Neura Chat patches each hole (AI replies 24/7, auto follow-ups, CRM tagging) →
the bucket fills (Booked / Paid / Followed up) → "Same leads. More bookings." → "Where is your bucket leaking? Comment LEAK" → end card.

- `src/story.json`: timings and all copy for both languages (`*stars*` mark the accent word).
- `src/components/Bucket.tsx`: the bucket, faucet, water level, leak jets, hole highlights and patches.
- `src/Film.tsx`: scenes, side illustrations, CTA and end card. Voiceover slots: `AUDIO.voiceover.en / .hi`.
