# LabSync

A personal health data app. Upload blood test PDFs, extract biomarkers automatically with AI, and track trends over time.

## Features

- **AI extraction** — upload a PDF or paste raw text; Claude reads every biomarker automatically
- **Trend charts** — see how values change across reports over time
- **Status indicators** — high / normal / low against reference ranges
- **Appointments & medicines** — track visits, exams, and medication schedules
- **Multi-language** — English and Brazilian Portuguese (PT-BR)
- **Private** — all data lives in your own Supabase project

## Prerequisites

- [Node.js 18+](https://nodejs.org)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- A free [Supabase account](https://supabase.com)
- An [Anthropic API key](https://console.anthropic.com)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/erickmobltda/labsync.git
cd labsync
npm install
```

### 2. Create a Supabase project

Go to [app.supabase.com](https://app.supabase.com) and create a new project. The free tier is enough.

### 3. Run the setup script

```bash
bash scripts/setup-supabase.sh
```

This script will:
1. Link to your Supabase project
2. Apply the database schema and Row Level Security policies
3. Create the `lab-reports` storage bucket
4. Deploy the `extract-biomarkers` Edge Function
5. Set your Anthropic API key as a Function secret
6. Write `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:5173/labsync/](http://localhost:5173/labsync/).

---

## Manual Supabase setup

If you prefer to configure things yourself instead of using the script:

**Database schema** — run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.

**Storage bucket** — create a private bucket named `lab-reports` (max 50 MB). Add RLS policies on `storage.objects`:

| Operation | Policy |
|-----------|--------|
| INSERT | `bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]` |
| SELECT | same |
| DELETE | same |

**Edge Function**:
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy extract-biomarkers
supabase secrets set ANTHROPIC_API_KEY=your-key
```

**Environment**:
```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

---

## Environment variables

| Variable | Where to find it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` key |

The Anthropic API key is set as a Supabase secret (server-side only) and never exposed to the browser.

---

## Project structure

```
src/
├── components/       # UI components
├── hooks/            # Data hooks (useAuth, useReports, useBiomarkers…)
├── lib/              # Supabase client, storage, i18n, PDF parser
├── pages/            # Route pages
└── types/            # TypeScript interfaces

supabase/
├── migrations/       # Database schema
└── functions/
    └── extract-biomarkers/   # Deno Edge Function (calls Anthropic)

scripts/
└── setup-supabase.sh         # Automated setup
```

---

## Tech stack

| | |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI | Radix UI, Lucide Icons, Recharts |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| AI | Anthropic Claude (claude-haiku) via Edge Function |
| PDF | PDF.js |

---

## Contributing

Open an issue first to discuss changes, then submit a pull request.

## License

MIT
