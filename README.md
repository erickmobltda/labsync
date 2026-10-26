# LabSync

A personal health data app. Upload blood test PDFs, extract biomarkers automatically with AI, and track trends over time.

**Live:** https://labsync.erickmob.dev

## Features

- **AI extraction** — upload a PDF or paste raw text; Claude reads every biomarker automatically
- **Trend charts** — see how values change across reports over time
- **Status indicators** — high / normal / low against reference ranges
- **Appointments & medicines** — track visits, exams, and medication schedules
- **Multi-language** — English and Brazilian Portuguese (PT-BR)
- **Private** — each user only reaches their own data (Firestore security rules), and PDFs sit in a private bucket served only to their owner

## Live demo

Click **See a demo** on https://labsync.erickmob.dev (or **Try the demo** on the login page). It signs in with `demo@ledgenator.app` / `demo1234`, the public sandbox account shared by the erickmob apps.

It comes with four check-ups (2025–2026) whose biomarkers trend over time, plus medicines and appointments. It's a **shared sandbox**: anyone can sign in and change it. AI extraction and PDF storage are off for the demo account (erickmob-api answers `403`); everything else works on its own data. To restore the sample data:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-sa.json npm run reset-demo
```

It replaces the demo account's `reports`, `biomarkers`, `medicines` and `appointments` with `scripts/demo-seed.json` (and restores its password and `demo` claim).

## How it fits together

| Piece | Where |
|---|---|
| Frontend | This repo, on GitHub Pages at `labsync.erickmob.dev` |
| Login | Firebase Auth (project `erickmob-apps`, shared with the other apps). Sign-up is off: accounts are created in the Firebase console |
| Data | Firestore, under `apps/labsync/users/{uid}/{reports,biomarkers,medicines,appointments}` |
| AI extraction | [erickmob-api](https://github.com/erickmobltda/erickmob-api) `POST /labsync/extract-biomarkers` (the Anthropic key stays on the server) |
| PDFs | Oracle Object Storage, through erickmob-api `/labsync/pdfs/...` |

The PDF text is extracted in the browser (PDF.js); only the text goes to the API for extraction. Each biomarker document carries its report's `report_date`, so the dashboard can filter by date without a join. Deleting a report also deletes its biomarkers and PDF.

The Firestore security rules live in erickmob-api (`firebase/firestore.rules`).

## Local development

```bash
git clone https://github.com/erickmobltda/labsync.git
cd labsync
npm install
cp .env.example .env   # fill in the Firebase web config
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/).

## Environment variables

| Variable | Where to find it |
|----------|-----------------|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID` | `firebase apps:sdkconfig WEB <labsync appId> --project erickmob-apps` |
| `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` | `erickmob-apps.firebaseapp.com`, `erickmob-apps` |
| `VITE_API_URL` | `https://api.erickmob.dev` |

The deploy workflow reads the same names from the repo's GitHub secrets.

## Project structure

```
src/
├── components/       # UI components
├── hooks/            # Data hooks (useAuth, useReports, useBiomarkers…)
├── lib/              # Firebase client, API client, storage, i18n, PDF parser
├── pages/            # Route pages
└── types/            # TypeScript interfaces
```

## Tech stack

| | |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI | Radix UI, Lucide Icons, Recharts |
| Backend | Firebase (Auth, Firestore) + erickmob-api (Claude, Oracle Object Storage) |
| AI | Anthropic Claude (claude-haiku) via erickmob-api |
| PDF | PDF.js |

## Contributing

Open an issue first to discuss changes, then submit a pull request.

## License

MIT
