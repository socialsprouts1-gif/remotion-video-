# Architecture

```
┌────────────── Browser ──────────────┐        ┌──────────── Next.js server ────────────┐        ┌──── Worker (npm run worker) ────┐
│ Editor (React + Zustand)            │  JSON  │ Route handlers (/api/*)                 │ BullMQ │ Render: @remotion/bundler +     │
│  ├ Remotion <Player> ◄── ProjectDoc │◄──────►│  ├ auth (sessions, Google OAuth)        │◄──────►│   @remotion/renderer (Chrome +  │
│  ├ Timeline / Inspector / Panels    │        │  ├ projects (+ versions, 409 conflicts) │  Redis │   FFmpeg) → storage             │
│  └ dispatch(EditCommand[])          │        │  ├ uploads (chunked) → ffprobe/poster   │        │ AI jobs: provider adapters      │
│        │ pure applyCommands()       │        │  ├ media (range + HMAC signed URLs)     │        │   submit → poll → download →    │
│        ▼                            │        │  ├ exports, ai/jobs → enqueue           │        │   ingest asset (refund on fail) │
│ autosave (debounced PUT + revision) │        │  └ ai/director, ai/assistant → Claude   │        └─────────────────────────────────┘
└─────────────────────────────────────┘        └─────────────┬───────────────────────────┘
                                                              │ Prisma
                                                     PostgreSQL · Redis · Object storage (local / S3)
```

## 1. The project document (`src/lib/project/schema.ts`)

One zod-validated JSON document per project, stored in `Project.document`:

- `settings`: width, height, fps, durationInFrames, background
- `tracks[]`: ordered top → bottom. Kinds are `video | overlay | text | effects | audio`, with lock/hide/mute/volume
- `clips[]` per track: a discriminated union with `video`, `audio`, `image`, `text`, `shape`, `solid`, `adjustment`, `effect` (procedural motion graphic) and `scene` (an AI Director storyboard slot)
- Every clip shares `start`/`duration` (frames), `transform`, `effects` (color), `crop`, `mask`, `blendMode`, `keyframes` (per property), `animationIn/Out`, `transitionIn/Out`, `loop`, `groupId` and `aiJobId`
- `markers`, `plan` (the Director's production plan), `aiHistory`, `brandKitId`

Media clips reference assets by id and a `src` of `/api/media/:id`. At render time the worker rewrites these to absolute, HMAC-signed URLs.

## 2. Edit commands (`src/lib/project/ops.ts`)

Every change goes through `applyCommands(doc, EditCommand[])`. This is a pure function over ~30 zod-validated ops (addClip, trimClip, splitAt, setKeyframe, setAnimation, changeAspect, …). That gives:

- **One code path** for timeline drags, inspector edits, templates, the Director and the AI assistant. The AI can only do what the editor can do, and every AI edit is validated.
- **Previews.** The assistant's commands are applied to a copy and shown in the player before you accept them.
- **Undo/redo.** History stores immutable documents (structural sharing). Rapid edits with the same label are coalesced.

## 3. Rendering (`src/remotion`, `src/server/render`)

`ProjectComposition` renders a `ProjectDoc`. Tracks are drawn bottom-up, each clip sits in a `<Sequence>`, and `ClipLayer` applies keyframes, presets, transitions, crop, mask, blend and an SVG/CSS color pipeline (temperature, tint and sharpen use an SVG colour matrix and convolution). Effects are pure functions of `(frame, params, seed)`, so preview and render match frame for frame. Fonts are self-hosted (`public/fonts`) and loaded through `delayRender`.

Export: `POST /api/exports` freezes the current document revision into a `RenderJob` and enqueues it. The worker:

1. Prepares the document (aspect reframe, fps retime).
2. Signs the media URLs.
3. Renders with `renderMedia` (codec, CRF/ProRes profile and scale come from the settings).
4. Streams progress to the DB and polls for cancellation.
5. Uploads to storage and marks the job done.

Stale RUNNING jobs are failed on worker start. Free plans force the watermark and a 1080p cap.

## 4. AI provider adapters (`src/server/ai`)

```ts
interface ProviderAdapter {
  id; name; envKeys; configured(): boolean;
  models(): ModelSpec[];             // per-capability models + the controls each supports
  submit(model, input): SubmitResult // sync result or async external id
  poll(model, externalId, meta): PollResult
  cancel?(model, externalId, meta)
}
```

- Capabilities: text-to-video, image-to-video, video-to-video, text-to-image, image-edit, background-removal, video-upscale, text-to-speech, speech-to-text, music, sound-effect.
- `ModelSpec` declares durations, aspect ratios, negative prompt, seed, first/last frame and voices. The UI shows only supported controls, and the API **rejects** unsupported options instead of silently dropping them.
- Model ids are env-configurable and flagged `verified: false` until checked against the provider's live catalogue.
- Jobs flow: credits are charged atomically, then the job is enqueued. The worker submits, polls and downloads outputs, ingests them as assets (poster, waveform), and refunds on failure or cancel. Retryable provider errors (429/5xx/network) are retried with backoff.
- Claude (`llm.ts`) powers the Director, the assistant and the motion generator. Responses are parsed as JSON, validated with zod, and fed back once on validation failure. The assistant dry-runs each command and drops any that don't apply.
- Without keys: the Director falls back to a labelled rule-based planner, and the assistant to a labelled command parser. Generation features show *integration required*. The dev-only mock provider stamps its output "MOCK PROVIDER — NOT AI OUTPUT".

## 5. Data model (`prisma/schema.prisma`)

User · Session · Project (+document JSON, revision) · ProjectVersion · ProjectMember · Comment · Asset · UploadSession · RenderJob · AiJob · CreditLedger · BrandKit · FeatureFlag.

## 6. Security

- httpOnly session cookies; only a SHA-256 of the token is stored.
- bcrypt password hashes.
- Google OAuth with state + PKCE.
- Every project and asset route checks ownership or membership.
- Media is reachable only by its owner (or collaborators) or through short-lived HMAC signatures.
- Storage keys are validated against path traversal.
- Provider keys are read only on the server.
- Redis-backed rate limits (fail open).
- The Stripe webhook verifies its signature and is idempotent per event.

## 7. Roadmap

| Phase | Scope | State |
|---|---|---|
| 1 Foundation | Design system, auth, dashboard, DB, projects, uploads, storage | done |
| 2 Core editor | Preview, timeline, layers, editing ops, effects, transitions, autosave, undo | done |
| 3 Rendering | Composition, Remotion workers, formats, progress, queue | done |
| 4 AI integration | Assistant, generation jobs, captions, voice | adapters done; live-verify model ids with real keys |
| 5 Motion graphics | Keyframe engine, presets, typography, MG library, AI MG generator | done |
| 6 Advanced AI | Director, script-to-video, ad variations done. Next: reference-video analysis (scene detection + pacing), scene replacement via image-to-video, smart repurposing (transcript → highlights → reframed shorts), timeline analysis | in progress |
| 7 SaaS | Credits, plans, Stripe, admin. Next: collaboration UI (members/comments already in the schema), feature-flag UI, usage-cost reporting per provider, deployment manifests | in progress |

Known limitations: reverse playback isn't supported in the render path; the timeline virtualizes horizontally but not vertically (fine up to a few dozen tracks); only one render runs per worker process by default, so scale out with more workers.
