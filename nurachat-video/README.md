# NuraChat — WhatsApp Automation explainer reel

A 47.5-second vertical (1080 × 1920, 30 fps) Hinglish motion-graphics tutorial, built in Remotion.
It uses the real dashboard screenshots. The camera only pans and zooms them uniformly; nothing in the product UI is redrawn.

```bash
npm install
npm run sfx        # (re)synthesise public/sfx/*.wav — already committed
npm run studio     # live preview + timeline scrubbing
npm run render     # → out/nurachat-reel.mp4
```

In a headless container, point Remotion at a local Chromium:
`npx remotion render NuraChatReel out/nurachat-reel.mp4 --browser-executable=/path/to/chrome`.
For quick review frames: `node scripts/stills.mjs 120 480 900` → `out/stills/`.

## Timeline

| # | Scene | Time | What happens |
|---|-------|------|--------------|
| 1 | Hook | 0–4.2s | Logo glint → "Aaj hum sikhne jaa rahe hain…" → WHATSAPP / AUTOMATION |
| 2 | Problem | 4.2–8.5s | Incoming-message notifications pile up → "Har message ka manually reply?" → **NO MORE.** |
| 3 | Solution | 8.5–13.5s | Meet NuraChat → "Your WhatsApp Automation System" → Customer → WhatsApp → NuraChat → AI Response |
| 4 | Panel | 13.5–20.5s | Dashboard screenshot tilts in, camera dives to the sidebar; spotlight + cursor + callouts on Leads, Drip Campaigns, Appointments, FAQ Bot |
| 5 | How it works | 20.5–27.5s | Six-step flow, one node per voiceover line |
| 6 | Walkthrough | 27.5–36.5s | Chatbots screen (Salon appointment bot, CA lead-management bot, Build with AI) → Integrations screen (WhatsApp Business connected, Zapier/Make/n8n) |
| 7 | Result | 36.5–42s | Floating system cards → Less Manual Work / Faster Responses / More Organized Leads |
| 8 | Ending | 42–47.5s | Logo → Automate. Respond. Convert. → wordmark, tagline, CTA |

## Where to change things

Almost everything is in **`src/config.ts`**:

- `BRAND`: name, tagline, logo path, CTA text.
- Scene boundaries (`T`): durations derive from these; neighbouring scenes overlap by `OVERLAP` frames.
- `SCREENS`: the screenshot files and their pixel sizes.
- `PANEL_TOUR`, `DEMO_CHATBOTS`, `DEMO_INTEGRATIONS`: what the spotlight highlights, as `[x1, y1, x2, y2]` in screenshot pixels, plus the callout label and side.
- `COPY`: every on-screen line. Wrap words in `*asterisks*` to paint them lime.
- `CAPTIONS`: the voiceover lines with their timings. They are also the subtitles; `show: false` hides one where the same words are already on screen.
- `AUDIO`: voiceover/music file paths, volumes and the captions toggle.
- `SFX`: sound cues, in frames relative to their scene.

### Replacing screenshots

Put the new PNGs in `public/screens/`, update `SCREENS` with their pixel size, then re-measure the highlight rects.
Open the image in any editor and read off the corners of the element you want to spotlight.
The current files are the supplied captures with the browser bar (top 170 px) cropped off.

### Logo

`public/brand/logo.png` is currently upscaled from the 46 px mark visible in the dashboard sidebar, so it is soft at large sizes.
Replace it with the original logo file (square; PNG or SVG) and keep the same path, or change `BRAND.logo`.

### Voiceover

Record the script in `VOICEOVER.md` (it matches `CAPTIONS` line by line), export one file, drop it in `public/audio/`, and set `AUDIO.voiceover = 'audio/voiceover.mp3'`.
When a voice is present, sound effects are automatically pulled back by 40 %.
If your read runs faster or slower, nudge the `at`/`to` times in `CAPTIONS`, and the step frames in `S5HowItWorks.tsx` (`HOW_STEPS`) for the how-it-works sync.

## Structure

```
src/
  config.ts            brand, copy, timings, focus rects, captions, audio, sfx cues
  theme.ts             colours, fonts, shadows
  lib/anim.ts          easing curves, progress helpers, velocity motion blur
  lib/fonts.ts         bundled Inter / Inter Display (SIL OFL)
  components/
    KineticText        masked / scale / slide word animation with *accent* markup
    LogoReveal         logo with glow + light sweep, Wordmark
    GlassCard          frosted dark glass surface
    NotificationCard   incoming-message notification
    FlowDiagram        vertical step flow with drawing connectors
    ScreenReveal       3D perspective entrance/exit wrapper
    DashboardZoom      screenshot camera (keyframed pan/zoom), plus Highlight (spotlight), Callout and Cursor
    Background         drifting glow, grid, grain, vignette; FloatingBubbles
    SceneShell         places a scene on the timeline and blends it with neighbours
    Captions, SfxTrack
  scenes/S1Hook … S8Ending
scripts/make_sfx.py    synthesises all sound effects (no samples, no licensing)
scripts/stills.mjs     renders review frames
```
