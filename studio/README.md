# Lumora Studio

An AI video production platform: an **AI Director** that turns a brief into an editable storyboard and timeline, a **multi-track video editor** with keyframes, color grading and transitions, a **motion graphics studio**, an **editing assistant** wired to real editor commands, **AI generation studios** (image, animation, audio), and a **server-side render pipeline**.

The preview player and the exporter render the **same Remotion composition** from the **same project document**, so what you see in the editor is what you export.

> Status: Phases 1–3 (foundation, editor, rendering) are built and tested end to end. Phase 4–6 AI features are built on a provider-adapter architecture. They run for real when you add API keys, and show an *integration required* state when you don't. See [Feature status](#feature-status).

---

## Quick start

Requirements: Node 20+, PostgreSQL 14+, Redis 6+, FFmpeg/ffprobe on `PATH`.

```bash
cd studio
cp .env.example .env          # then set APP_SECRET (openssl rand -hex 32) and DATABASE_URL
npm install
npx prisma db push            # create tables
node scripts/fetch-fonts.mjs  # optional: refresh the self-hosted font files (already committed)
```

Run the web app and the background worker (two terminals):

```bash
npm run dev       # http://localhost:3000
npm run worker    # renders exports + runs AI jobs (BullMQ on Redis)
```

Create an account at `/signup`. Emails listed in `ADMIN_EMAILS` become admins and get `/admin`.

Remotion downloads its own headless Chrome on first render. To use an existing binary instead, set `REMOTION_BROWSER_EXECUTABLE`.

### Tests

```bash
npm run typecheck
npm test                                    # unit tests: editing ops, keyframes, presets, planner, assistant, captions, templates
ENABLE_MOCK_PROVIDER=true npm run dev &     # + npm run worker
node scripts/e2e.mjs ./screenshots          # browser E2E: signup → template → edit → AI assist → upload → export → AI Studio
```

---

## Environment variables

All secrets stay on the server. Nothing below is ever sent to the browser.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `REDIS_URL` | yes | Job queues (render + AI) and rate limits |
| `APP_SECRET` | yes | ≥32 chars. Signs short-lived media URLs for render workers and AI providers |
| `APP_URL` | yes | Public base URL. Workers and providers fetch media from here |
| `STORAGE_DRIVER` | – | `local` (default, files under `STORAGE_DIR`) or `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | for `s3` | Any S3-compatible store (AWS, R2, MinIO…). Put a CDN in front of the bucket |
| `REMOTION_BROWSER_EXECUTABLE` | – | Chrome / headless-shell path for rendering |
| `RENDER_CONCURRENCY` | – | Chrome tabs per render (default 2) |
| `RENDER_JOBS_PER_WORKER` | – | Parallel renders per worker process (default 1) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | – | Google sign-in. Redirect URI: `${APP_URL}/api/auth/google/callback` |
| `ADMIN_EMAILS` | – | Comma-separated admin emails |
| `ANTHROPIC_API_KEY` | – | Claude: AI Director, editing assistant, motion generator, script-to-video (`ANTHROPIC_MODEL` overrides the model) |
| `FAL_KEY` | – | fal.ai: text/image-to-video, text-to-image, background removal, transcription |
| `REPLICATE_API_TOKEN` | – | Replicate: text-to-image, text-to-video, music |
| `ELEVENLABS_API_KEY` | – | ElevenLabs: voiceover (TTS), speech-to-text, sound effects |
| `FAL_MODEL_*`, `REPLICATE_MODEL_*`, `ELEVENLABS_*_MODEL` | – | Override model ids (see `.env.example`) |
| `ENABLE_MOCK_PROVIDER` | – | Dev only: a labelled mock provider that produces synthetic test media so the job pipeline can be exercised without paid keys. Ignored when `NODE_ENV=production` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_STUDIO` | – | Subscriptions. Webhook endpoint: `/api/billing/webhook` |

---

## Feature status

✅ built and verified · 🔌 built, runs when the provider key is set · 🧭 planned (shown as unavailable in the UI, never faked)

| Area | Status | Notes |
|---|---|---|
| Email auth, sessions, Google OAuth (PKCE) | ✅ / 🔌 | Google needs client credentials |
| Projects: autosave, optimistic concurrency, snapshots, restore, duplicate | ✅ | Version retention: snapshots kept, latest 60 autosaves |
| Chunked, resumable uploads (8 MB chunks, retries), ffprobe metadata, posters, waveforms | ✅ | |
| Range-capable media serving, owner auth + HMAC-signed URLs | ✅ | |
| Preview: Remotion Player, frame step, loop, safe-zone & aspect guides, zoom, fullscreen, drag-to-move on canvas | ✅ | |
| Multi-track timeline: drag across tracks, trim, split, ripple delete, duplicate, copy/paste, multi-select, group, snapping, markers, zoom, lock/hide/mute, waveforms, horizontal virtualization | ✅ | |
| Undo/redo (200 steps, slider drags coalesced) and keyboard shortcuts | ✅ | |
| Layer properties: position, scale, rotation, 3D turn, opacity, crop, rect/ellipse masks, blend modes, speed, volume, fades | ✅ | Reverse playback 🧭 |
| Color: brightness, contrast, saturation, exposure, temperature, tint, hue, blur, sharpen, vignette, grain, B&W, look presets, adjustment layers, letterbox | ✅ | |
| Keyframes on 15 properties with 12 easing curves (spring, bounce, elastic, bezier); convert presets → keyframes | ✅ | |
| 18 animation presets (fade, slide, pop, bounce, zoom, rotate, wipe/mask/blur/liquid reveal, typewriter, kinetic, glitch, 3D flip…), 14 transitions, 6 loops | ✅ | |
| Typography: 15 self-hosted fonts, gradient, neon glow, outline, 3D extrude, backgrounds, word-timed karaoke captions | ✅ | |
| 20 procedural motion-graphics effects (particles, light streaks, HUD, charts, counters, lower thirds, grid, orbs, glitch, smoke, fire, confetti, light sweep…) | ✅ | All editable params |
| 12 editable templates × 4 aspect ratios | ✅ | |
| Export: MP4/H.264, WebM/VP8, MOV/ProRes, GIF · 720p–4K · 24–60 fps · 16:9/9:16/1:1/4:5 reframing · quality presets · watermark · size estimate · queue, progress, cancel, history, download | ✅ | Background worker, retries, crash recovery |
| AI Director (brief → plan → storyboard → timeline), product commercial, script-to-video, multi-platform variations, brand-kit aware | 🔌 Claude | Rule-based *basic planner (no AI)* fallback, labelled in the UI |
| Editing assistant: instruction → validated edit commands → live preview → apply as one undo step | 🔌 Claude | Built-in *command parser (no AI)* handles ~20 common edits |
| AI motion graphics generator (prompt → editable layers + keyframes) | 🔌 Claude | Keyword-based basic composer fallback |
| Scene footage generation, text/image-to-video, text-to-image, background removal | 🔌 fal.ai / Replicate | Model ids configurable, marked *unverified* until checked against the live catalogue |
| Voiceover, sound effects, transcription → auto captions | 🔌 ElevenLabs / fal.ai | |
| Music generation | 🔌 Replicate | |
| Brand kits (colors, fonts, logo, watermark, intro/outro templates, voice) | ✅ | Applied by the Director |
| Credits (atomic charge, refund on failure/cancel), ledger, plans, Stripe checkout + signed webhook | ✅ / 🔌 Stripe | |
| Admin: users (plan, credits, disable), usage, provider usage, failures, queue & worker health | ✅ | |
| Rate limiting (Redis, fails open), error boundaries per editor panel | ✅ | |
| Runway, Luma, Google Veo, OpenAI adapters | 🧭 | Listed as planned in Settings |
| Object removal, face blur, motion tracking, stabilization, silence removal, upscaling UI, beat detection, smart repurposing, reference-video analysis, real-time collaboration UI | 🧭 | The assistant reports these as unavailable instead of faking them. The schema already has project members, comments and audio beat markers |

---

## How it fits together

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design: the project document schema, the edit-command system, the render pipeline, the provider adapter interface, and the roadmap.
