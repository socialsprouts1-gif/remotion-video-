# Neura Chat — "Your WhatsApp is your front desk" explainer reel

55s · 1080×1920 · flat illustrated explainer (cream background, bold two-tone headlines, caption box, vector props), in English and Hinglish.

```bash
npm install
npm run score     # music + pops from src/story.json
npm run render    # → out/explainer-en.mp4 and out/explainer-hi.mp4
```

- `src/story.json`: scene timings, all copy for both languages (`copy.en`, `copy.hi`; wrap words in `*stars*` for the accent colour), and the three feature cards.
- `src/components/Kit.tsx`: the illustration kit (phone, chat bubbles, badges, front desk, people, storefront, feature cards, headline, caption).
- `src/Film.tsx`: the 12 scenes. Voiceover slots: `AUDIO.voiceover.en / .hi`.

Story: 11 PM message → reply next morning → lead goes to a competitor → WhatsApp is your front desk → empty at night → a great desk needs 3 things (instant replies, follow-ups, bookings) → Neura Chat does all three → same customer, instant reply, booked → "How long do your customers wait? Comment AUTOMATE" → end card.
