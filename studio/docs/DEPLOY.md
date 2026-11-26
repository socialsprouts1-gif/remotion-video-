# Deploying Lumora Studio

> The `Dockerfile` follows the setup verified locally (Node 22, FFmpeg, Remotion's Chrome Headless Shell installed by the worker on start), but the image build itself hasn't been run yet: Docker wasn't available in the development sandbox. If the first Railway build fails, the build log shows the step that failed.

Lumora has two processes that share one database, one Redis and one file store:

| Process | What it does | Needs |
|---|---|---|
| **web** (`npm run start`) | Pages, editor, API, uploads | Node 20+, FFmpeg (upload probing) |
| **worker** (`npm run worker`) | Video rendering, Auto Edit, AI jobs | Node 20+, FFmpeg, Chrome Headless Shell (auto-installed), CPU/RAM |

Because the worker runs Chrome + FFmpeg for minutes at a time, it **can't run on Vercel**. The recommended setup is **everything on Railway** (or any Docker host: Render, Fly.io, a VPS), with Supabase for the database and file storage.

```
Supabase Postgres ─┐
Supabase Storage ──┼── Railway: web service  (Docker image, default command)
Upstash/Railway    │   Railway: worker service (same image, start command `npm run worker`)
  Redis ───────────┘
```

## 1. Supabase

1. **Database:** you already have it. Use the **Session pooler** string with `?sslmode=require&connect_timeout=30` appended, as `DATABASE_URL`.
2. **Storage** (shared by web and worker):
   - Storage → **New bucket** → name `lumora` → **private**.
   - Project Settings → **Storage** → **S3 Connection**. Note the **Endpoint** (`https://<project-ref>.storage.supabase.co/storage/v1/s3`) and **Region**, then click **New access key** and copy the Access key ID and Secret.

## 2. Redis

Create a free database on **upstash.com** (copy the `rediss://…` URL), or add a **Redis** service inside Railway and use its `REDIS_URL`.

## 3. Railway

1. railway.com → **New Project → Deploy from GitHub repo** → pick this repository and branch.
2. In the service **Settings**:
   - **Root directory:** `studio`
   - Builder: **Dockerfile** (detected automatically)
3. **Variables:** add every variable from the table below.
4. **Networking → Generate Domain.** Set `APP_URL` to that `https://…up.railway.app` address.
5. Deploy. The web service syncs the database schema on start, then serves the app.
6. **Add the worker:** in the same project, **New → GitHub repo** (same repo, same root directory `studio`) → Settings → **Custom start command:** `npm run worker`. Give it the **same variables** (Railway's "shared variables" makes this easy). Use at least **2 vCPU / 2 GB RAM** for rendering.

## 4. Variables (web and worker)

```
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30"
REDIS_URL="rediss://default:<token>@<host>.upstash.io:6379"
APP_URL="https://<your-domain>"
APP_SECRET="<openssl rand -hex 32>"
ADMIN_EMAILS="you@example.com"

STORAGE_DRIVER="s3"
S3_ENDPOINT="https://<project-ref>.storage.supabase.co/storage/v1/s3"
S3_REGION="<your supabase region, e.g. ap-northeast-1>"
S3_BUCKET="lumora"
S3_ACCESS_KEY_ID="<from Supabase>"
S3_SECRET_ACCESS_KEY="<from Supabase>"

ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-sonnet-5-5"      # optional: cheaper than the default Opus
ELEVENLABS_API_KEY=""                     # optional: captions / voiceover
FAL_KEY=""                                # optional: AI video & image generation
```

Don't set `ENABLE_MOCK_PROVIDER` in production. It's ignored when `NODE_ENV=production` anyway.

## 5. After deploying

- Open `https://<your-domain>/signup` and create your account with the `ADMIN_EMAILS` address.
- `/admin` shows whether a render worker is connected ("Workers: 1 render · 1 AI").
- Google sign-in: add `${APP_URL}/api/auth/google/callback` as an authorized redirect URI in Google Cloud Console, then set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## Can I use Vercel?

Only for the **web** part, and only with `STORAGE_DRIVER="s3"`.

On Vercel, set `DATABASE_URL` to Supabase's **Transaction pooler** string (port **6543**) with `?pgbouncer=true&connection_limit=1&sslmode=require` appended. Every serverless function opens its own connections, and the session pooler (port 5432) only allows 15 clients, so uploads fail with `EMAXCONNSESSION`. The Vercel build doesn't change the schema; run `npx prisma db push` with the session-pooler URL (port 5432) from your computer when the schema changes. The worker on Railway keeps the port-5432 URL.

The worker still has to run on Railway or another Docker host. Two limits apply on Vercel:

- **FFmpeg:** upload processing (probe, poster, waveform) needs FFmpeg, which Vercel functions don't include.
- **Uploads:** chunked uploads assume a single server, because chunks are stored on local disk before assembly.

Hosting the web app on Railway avoids both, so it's the recommended path.

## Costs (rough)

- Railway: web ~$5/month, worker ~$5–20/month depending on how much you render.
- Supabase and Upstash: free tiers are enough to start.
- Anthropic: pay per use. Set a monthly spend limit in console.anthropic.com → Settings → Limits.
