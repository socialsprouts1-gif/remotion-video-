# Neuraxine — 5 AI Automations (3D motion reel, Hindi voiceover)

A 77-second vertical (1080 × 1920, 30 fps) Remotion reel for **@neuraxine**: "5 AI automations har business ko chahiye".
Same look and machinery as `../neuraxine-strategies` (3D profile opener, post-template chapter cards, real logos,
Kokoro Hindi voice that drives the timeline, Hinglish captions).

```bash
npm install
npm run render     # → out/neuraxine-automations.mp4  (headless: add --browser-executable=/path/to/chrome)
```

## Story

| Section | What happens |
|---|---|
| Opener | Phone with the real neuraxine profile spins in, posts lift out, the camera dives into the NX avatar |
| Hook | "Raat ke 12:00 AM… customer ne message kiya… aur aap so rahe the." → "Subah tak, woh customer COMPETITOR ke paas ja chuka tha." |
| Intro | **5** AI automations + chapter pills |
| 01 Auto-reply | WhatsApp chat at 11:58 PM: price question answered instantly by the AI with a catalogue; "Reply in 3 sec" |
| 02 Follow-up | A Meta (Instagram ad) lead arrives; WhatsApp → Gmail → WhatsApp follow-ups tick in; the lead replies "Haan, Saturday 11 baje theek hai" |
| 03 Booking | Slot buttons in chat, the customer taps one, booking confirmed, Google Calendar event, reminder notification |
| 04 Reviews | Automatic review request with a Google review button; Google rating 4.6 → 4.9, reviews 128 → 212 |
| 05 Invoice | The page's real "QR scan, order, bill WhatsApp par" post; order → invoice → UPI payment link on WhatsApp → PAID |
| Outro | "Aap business chalao. Baaki kaam, AI karega." |
| CTA | Comment "AUTOMATE" + Follow on the real profile, NX lockup with www.neuraxine.com |

Businesses, names and numbers inside the chapters are illustrative examples (the order items come from the page's own post).
Voice/timing: `scripts/make_voiceover.py`; copy and data: `src/config.ts`.
