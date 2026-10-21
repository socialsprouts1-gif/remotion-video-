# Neura Chat — "Two shops, same street" explainer

55s · 1080×1920 · flat illustrated split-screen story, English and Hinglish.

```bash
npm install
npm run score     # music + message pings/replies per side (from src/story.json)
npm run render    # → out/shops-en.mp4 and out/shops-hi.mp4
```

Story: two shops with the same products and ads → Raju replies by hand, Amit uses Neura Chat → one day (10 AM / 2 PM / 9 PM) side by side →
the week's booking calendars → "The difference wasn't the product. It was the reply." → what Amit's Neura Chat does (instant AI replies,
auto follow-ups, bookings) → "Which shop are you? Comment AMIT" → end card.

- `src/story.json`: timings, message times per shop, and all copy for both languages.
- `src/Film.tsx`: the two columns (storefront, chat card, status chips, calendars), scenes, CTA and end card.
