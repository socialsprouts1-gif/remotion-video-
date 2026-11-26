# Neuraxine — 5 AI Automations, 3D edition (white, premium)

A 73-second vertical (1080 × 1920, 30 fps) Remotion reel with real 3D (three.js via `@remotion/three`).
White background; type only in black, white and green; logos and the page's real posts keep their own colours.
The Hindi voiceover starts at 0 s and the phone story runs under it (no separate intro).

```bash
npm install
node scripts/make_textures.mjs        # phone screens, calendar, coin, logo tile → public/tex/ (already committed)
npm run render                        # → out/neuraxine-automations-3d.mp4
```

3D needs WebGL: `remotion.config.ts` sets the `swangle` renderer (software, works in headless containers).
Headless: add `--browser-executable=/path/to/chrome`. Review frames: `node scripts/stills.mjs 75 570 1140`.

## 3D kit (`src/three/kit.tsx`)

- `Phone`: rounded titanium body, glass screen showing an image (cross-fades between two screens)
- `Logo3D`: official SVG logos (WhatsApp, Meta, Gmail, Google) extruded layer by layer into glossy badges
- `Card3D` (real posts, calendar page, NX tile), `Star3D`, `Coin3D` (₹), `Bubble3D`, soft `Shadow`, `Studio` lighting
- `preloadAll()`: every texture and logo loads before any scene mounts, so no frame is ever blank

Phone screens are real-looking app UI built in HTML (`src/textures/Screens.tsx`) and rendered to PNG.

## Story

| Section | 3D |
|---|---|
| Hook | Phone lock screen at 12:00 AM; WhatsApp notification lands, phone buzzes, a 3D message bubble pops out; screen turns 8:04 with "dusri shop se le liya"; the bubble flies off to the COMPETITOR |
| Intro | The same phone turns to the real neuraxine profile; four real posts fan out around it as 3D cards |
| 01 Auto-reply | Phone with the WhatsApp chat (question → instant AI reply), 3D WhatsApp logo, 3D chat bubbles |
| 02 Follow-up | 3D Meta → WhatsApp → Gmail logos pop in on cue, lead card, "Replied ✓" |
| 03 Booking | 3D calendar block (SAT 11), phone booking chat, confirmation + reminder |
| 04 Reviews | 3D Google G with five 3D stars, phone review chat, rating 4.6 → 4.9 |
| 05 Invoice | The page's real QR-order post as a 3D card, phone invoice → paid chat, falling ₹ coins, PAID |
| Outro | "Aap business chalao. Baaki kaam, AI karega." over orbiting 3D logos |
| CTA | Phone with the real profile, comment AUTOMATE, Follow → Following, 3D NX tile lockup |
