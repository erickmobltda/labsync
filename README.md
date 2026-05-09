# LabSync

**LabSync** is a personal health data consolidation app. Upload blood test PDFs, automatically extract biomarkers with AI, and track trends over time — all in your own infrastructure.

![LabSync Dashboard](https://raw.githubusercontent.com/erickmobltda/labsync/main/docs/screenshot.png)

## Features

- **AI-powered extraction** — paste or upload a PDF lab report; Claude AI extracts every biomarker automatically
- **Trend tracking** — interactive charts show how your biomarkers evolve across reports
- **Status indicators** — instantly see which values are high, low, or normal against reference ranges
- **Appointments & medicines** — track doctor visits, exams, and medication schedules
- **Multi-language** — English and Brazilian Portuguese (PT-BR)
- **Two deployment modes** — self-hosted with Docker Compose, or cloud-backed with Supabase

---

## Quick Start

Choose your preferred setup:

| | [Docker Compose (local)](#-option-a-docker-compose-local) | [Supabase (cloud)](#-option-b-supabase-cloud) |
|---|---|---|
| **Auth** | Email + password | Email + password, Magic link |
| **Database** | SQLite (file on disk) | PostgreSQL (managed) |
| **Storage** | Local filesystem | Supabase Storage (S3-compatible) |
| **Infrastructure** | Docker Desktop | Supabase free tier |
| **Best for** | Self-hosting, privacy, offline | Cloud access, team use |

---

## 🐳 Option A: Docker Compose (local)

The easiest way to run LabSync. All data stays on your machine.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)
- An [Anthropic API key](https://console.anthropic.com) (for AI biomarker extraction)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/erickmobltda/labsync.git
cd labsync

# 2. Copy the environment file and add your API key
cp .env.example .env
```

Open `.env` and set your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

```bash
# 3. Start everything
docker compose up --build
```

That's it! Open **http://localhost:3000** and create an account.

> The first build takes a few minutes. Subsequent starts are instant.

### What runs

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3000 | Nginx serving the React app |
| `api` | (internal) | Express API + SQLite |

All data (database + uploaded PDFs) is stored in a Docker volume (`labsync_data`) and persists across restarts.

### Data management

```bash
# Stop without losing data
docker compose down

# Stop and remove all data (destructive!)
docker compose down -v

# View logs
docker compose logs -f api
```

### Development without Docker

If you prefer to run without Docker for faster iteration:

```bash
# Terminal 1 — start the backend API
cd server
cp .env.example .env      # set ANTHROPIC_API_KEY
npm install
npm run dev               # runs on http://localhost:3001

# Terminal 2 — start the frontend (proxies /api to localhost:3001)
cd ..
npm install
npm run dev:local         # runs on http://localhost:5173
```

---

## ☁️ Option B: Supabase (cloud)

Uses Supabase for auth, database, storage and serverless functions. Free tier is sufficient for personal use.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed  
  `brew install supabase/tap/supabase` (macOS) · [other platforms](https://github.com/supabase/cli/releases)
- A [Supabase account](https://supabase.com) (free)
- An [Anthropic API key](https://console.anthropic.com)

### Automated setup (recommended)

The setup script handles everything — migrations, Edge Function deployment, storage bucket, and `.env` configuration.

```bash
# 1. Clone the repository
git clone https://github.com/erickmobltda/labsync.git
cd labsync

# 2. Run the setup script
bash scripts/setup-supabase.sh
```

The script will:
1. Log you in to Supabase CLI
2. Ask which project to use (create one at [app.supabase.com](https://app.supabase.com) first)
3. Apply database migrations and Row Level Security policies
4. Create the `lab-reports` storage bucket
5. Deploy the `extract-biomarkers` Edge Function
6. Set your Anthropic API key as a Function secret
7. Write `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env`

```bash
# 3. Start the dev server
npm install
npm run dev
```

### Manual Supabase setup

If you prefer to configure Supabase manually:

1. **Create a project** at [app.supabase.com](https://app.supabase.com)

2. **Apply the database schema** — go to **SQL Editor** and run:
   ```
   supabase/migrations/001_initial_schema.sql
   ```

3. **Create storage bucket** — go to **Storage** → **New bucket**:
   - Name: `lab-reports`
   - Public: off
   - Max file size: 50 MB
   
   Then add these RLS policies on `storage.objects`:
   - **Upload**: `bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]`
   - **Read**: same condition
   - **Delete**: same condition

4. **Deploy the Edge Function**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy extract-biomarkers
   supabase secrets set ANTHROPIC_API_KEY=your-key-here
   ```

5. **Configure `.env`**:
   ```bash
   cp .env.example .env
   ```
   Fill in:
   ```env
   ANTHROPIC_API_KEY=your-anthropic-key
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

6. **Start the app**:
   ```bash
   npm install
   npm run dev
   ```

---

## Environment Variables

### Root `.env` (frontend + Docker Compose)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (both modes) | Your [Anthropic API key](https://console.anthropic.com) |
| `JWT_SECRET` | Yes (local mode) | Secret for signing JWT tokens — use a long random string |
| `VITE_SUPABASE_URL` | Yes (Supabase mode) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (Supabase mode) | Your Supabase anon (public) key |
| `PORT` | No | Frontend port for Docker Compose (default: `3000`) |

### `server/.env` (local development only)

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Required for biomarker extraction |
| `JWT_SECRET` | `dev-secret` | Change for production |
| `PORT` | `3001` | API server port |
| `DB_PATH` | `./data/labsync.db` | SQLite database path |
| `UPLOADS_DIR` | `./data/uploads` | PDF storage directory |

---

## Architecture

```
┌─────────────────────────────────────┐
│             React + Vite            │
│   (TypeScript, Tailwind, Recharts)  │
└────────────────┬────────────────────┘
                 │ VITE_BACKEND_MODE
       ┌─────────┴──────────┐
       │                    │
  local mode           supabase mode
       │                    │
┌──────▼──────┐    ┌────────▼────────┐
│  Express API│    │    Supabase     │
│   (Node.js) │    │  Auth + PostgREST│
│   + SQLite  │    │  Storage + Fns  │
└─────────────┘    └─────────────────┘
```

The frontend detects which backend to use via the `VITE_BACKEND_MODE` build-time variable:
- `local` → calls the Express backend at `/api/*` (proxied by Nginx or Vite dev server)
- `supabase` (default) → calls Supabase directly using the Supabase JS client

---

## Project Structure

```
labsync/
├── src/                    # React frontend
│   ├── components/         # UI components (auth, dashboard, upload, layout)
│   ├── hooks/              # Data hooks (useAuth, useReports, useBiomarkers…)
│   ├── lib/                # Utilities (data-api, storage, i18n, pdf-parser…)
│   ├── pages/              # Route pages
│   └── types/              # TypeScript interfaces
├── server/                 # Express backend (local mode)
│   └── src/
│       ├── routes/         # API routes (auth, reports, biomarkers…)
│       ├── middleware/      # JWT auth middleware
│       └── db.ts           # SQLite setup + schema
├── supabase/
│   ├── migrations/         # PostgreSQL migrations
│   └── functions/
│       └── extract-biomarkers/  # Deno Edge Function
├── scripts/
│   └── setup-supabase.sh  # Automated Supabase configuration
├── docker-compose.yml      # Local self-hosted stack
├── Dockerfile              # Frontend container (Nginx)
└── nginx.conf              # Nginx config with API proxy
```

---

## Development

### Running tests / lint

```bash
npm run lint
```

### Building for production

```bash
# Local mode build
npm run build:local

# Supabase mode build (requires .env with Supabase vars)
npm run build
```

### Adding a new backend route (local mode)

1. Create `server/src/routes/your-route.ts`
2. Register it in `server/src/index.ts`
3. Add the corresponding data-access functions to the relevant hook using `IS_LOCAL` + `apiFetch`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | Radix UI, Lucide Icons, Recharts |
| AI | Anthropic Claude (claude-haiku) |
| PDF parsing | PDF.js |
| Local backend | Node.js, Express, SQLite (`better-sqlite3`) |
| Cloud backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Container | Docker, Nginx |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and run `npm run lint`
4. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Privacy

LabSync stores your health data locally (Docker mode) or in your own Supabase project. Lab report text is sent to Anthropic's API for AI extraction. No data is stored by Anthropic beyond the API request. See [Anthropic's privacy policy](https://www.anthropic.com/privacy) for details.
