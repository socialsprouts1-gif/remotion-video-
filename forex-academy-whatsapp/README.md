# Forex academy — WhatsApp automation explainer reel

A 56-second vertical (1080 × 1920, 30 fps) Hinglish motion-graphics reel, built in Remotion.
It explains one WhatsApp number running the whole lead → customer journey for a forex trading academy.
One chat with one lead (Rahul) carries the story from the welcome message to the human handover.

```bash
npm install
npm run studio     # live preview + timeline scrubbing
npm run render     # → out/forex-academy-reel.mp4
npm run sfx        # optional: re-synthesise sound effects and the music bed
```

In a headless container, add `--browser-executable=/path/to/chrome` to the render command.
For review frames: `node scripts/stills.mjs 120 480 900` → `out/stills/` (set `REMOTION_BROWSER` to a Chrome path if needed).

## Timeline

| # | Scene | Time | What happens |
|---|-------|------|--------------|
| 1 | Hook | 0–4.6s | WhatsApp logo → "Ek WhatsApp number." → "Lead se customer tak, sab automated." |
| 2 | Problem | 4.4–9s | Lead notifications pile up, unread counter climbs → "Manual reply? Leads lost." and the chats slide away |
| 3 | Chat (one phone, 28 s) | 8.8–37s | 01 auto welcome → 02 service menu (a finger taps *1:1 Mentorship*) → 03 video + PDF + next-step message → 04 name / experience / budget fill a lead-profile card → 05 the card flies into the CRM board's Mentorship column, gets a HOT tag, Day 1/3/7 follow-ups tick → 06 lead asks for a call, lead score jumps to SERIOUS, chat is handed to a human advisor |
| 4 | Broadcast | 36.8–42s | 07 composer picks audiences, "Send to all" → message fans out to contacts, ticks turn blue, delivered/read counters |
| 5 | Dashboard | 41.8–48.8s | 08 funnel: leads → free → mentorship → investors with conversion %, plus KPI tiles (sample numbers) |
| 6 | Ending | 48.6–56s | The 8-step journey lights up → "Lead se customer tak. Poori journey, automated." → CTA card |

## Where to change things

Almost everything is in **`src/config.ts`**:

- `BRAND`: academy name and initials (WhatsApp header, welcome message), human agent name/role, CTA text.
- `COPY`: headline lines. Wrap words in `*asterisks*` to paint them gold.
- `SECTIONS`: the step chip + headline above the phone for each part of the chat.
- `CHAT`: the whole conversation, with the second each message appears.
- `PROFILE`, `CRM_COLUMNS`, `FOLLOWUPS`, `FUNNEL`, `KPIS`, `JOURNEY`: the data on each panel.
- Scene windows (`T`) and sound cues (`SFX`).

If you move chat messages, also check the phone camera keys (`PK` in `src/scenes/S3Chat.tsx`) and the tap time (`tapAt` in `CHAT`, `TAP` in the hand).

## Audio

- `public/sfx/*.wav` — synthesised UI sounds (`scripts/make_sfx.py`), no samples.
- `public/audio/music.mp3` — synthesised music bed (`scripts/make_music.py`), no samples, no licensing.
- Voiceover: record `VOICEOVER.md`, drop the file in `public/audio/` and set `AUDIO.voiceover`. Music and effects duck automatically.

## Structure

```
src/
  config.ts          brand, copy, chat script, panel data, timings, sound cues
  theme.ts           colours (navy / gold / profit green / WhatsApp dark), fonts
  components/        Phone (WhatsApp UI), KineticText, GlassCard, Background (candlestick chart), Header, Icon, SceneShell, SfxTrack
  scenes/            S1Hook, S2Problem, S3Chat, S4Broadcast, S5Dashboard, S6Ending
scripts/             make_sfx.py, make_music.py, stills.mjs
```

Fonts: Inter / Inter Display (SIL OFL). Icons: PNGs in `public/icons/`, reused from the other projects in this repo.
