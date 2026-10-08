# The cost of a slow follow-up — cinematic network film

A 50-second vertical (1080 × 1920, 30 fps) English brand film for **NEURAXINE AI AUTOMATION**, built in Remotion.
Everything happens inside one connected network that a single camera flies through. Scenes are framings of the same world, not cuts.

```bash
npm install
npm run score      # synthesise public/audio/score.wav from src/timeline.json (already committed)
npm run studio     # preview
npm run render     # → out/followup-film.mp4
```

In a headless container, add `--browser-executable=/path/to/chrome`.
For review frames: `node scripts/stills.mjs 30 300 900` → `out/stills/`.

## Story (one continuous take)

| Time | Beat | What the network does |
|------|------|-----------------------|
| 0–5.6s | One lead. | A single lime node lights up in darkness and travels; a $ AD SPEND token is tethered to it and gets absorbed |
| 5.6–10s | The message | The lead lands in the business's inbox and becomes the customer: typing… "Hi, I'd like to know more about your service." Then nothing, with real silence |
| 10–16.4s | Time | The camera dives into the timestamp, which becomes the clock (00:00:01 → 24:00:00). The business↔customer link thins, breaks into dashes and flickers while the customer drifts away |
| 16.4–21s | Lost | The link snaps; the customer flies to a competitor node; your node goes dark; LEAD LOST, with "LOST" pulled away through the network |
| 21–27s | 100 leads | A hundred leads stream in. Some arrive and become revenue; others break mid-path and their $ falls into the dark. The meter shows potential vs actual with no numbers |
| 27–32.8s | It multiplies | Hundreds of nodes and messages, chaos, then a hard freeze (sound cuts on the frame): "Leads aren't the problem. / Follow-up speed is." |
| 32.8–37s | AI | Your node blooms into the AI core; the chaos is pulled into a pipeline LEAD → INSTANT RESPONSE → AI QUALIFICATION → FOLLOW-UP → BOOKING → REVENUE; lime propagates through the whole network |
| 37–41s | Routed | Leads drop in on the beat and are routed into four lanes: question→AI response, interest→qualification, ready→booking, no response→follow-up |
| 41–50s | The system | Pull back to the whole ecosystem, which converges into one glowing line: "Getting the lead is the beginning." → "The follow-up is the conversion." → logo + AUTOMATE YOUR FOLLOW-UP. |

## How it is built

- `src/timeline.json` — every story time (and the voiceover script). The single source of truth for picture **and** sound.
- `src/world.ts` — the world: anchor positions, the lead's path, the ambient network, and the camera (keyframed dolly with log-space zoom, plus a follow-cam for the opening). `project()` / `camTransform()` handle parallax depth.
- `src/components/Field.tsx` — far out-of-focus parallax layers (depth + DOF) and the main-plane network. It lights up near the lead, flickers in the chaos, freezes, and turns lime as a wavefront spreads out from the AI core.
- `src/components/Story.tsx` — the story elements, one block per beat.
- `src/components/Hud.tsx` — screen-space type (kinetic words with velocity blur), the clock, LEAD LOST, the final lockup, grain and vignette.
- `src/Film.tsx` — composes it all; applies focus pulls, the freeze grade and impact shakes to the world plane.
- `scripts/make_score.py` — the score and sound design. It reads the timeline and re-creates the 100-leads randomness so each conversion pluck and broken-stream glitch lands on its frame.

Colour discipline: lime is used only for active connections, the lead/customer, revenue, the AI and the CTA. Everything else is white, grey and black.
Type: Poppins (SIL OFL), a geometric sans.
Brand: the logo is `public/brand/logo.png`, screen-blended so its black background drops out. The currency glyph is `CURRENCY` in `src/config.ts`.
