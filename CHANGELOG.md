# Changelog

## 2026-10-25 — Domain moved to erickmob.dev

**Why:** `erickmob.dev` was bought back and is the main domain again. GitHub Pages serves one custom domain per repo, so `.dev` is the canonical one and `.com` redirects to it.

| | Before | After |
|---|---|---|
| URL | `https://labsync.erickmob.com` | **`https://labsync.erickmob.dev`** (`.com` and `erickmobltda.github.io/labsync/` redirect here) |
| API | `https://api.erickmob.com` | `https://api.erickmob.dev` (`.com` keeps answering) |

- Changed: the `cname` of the deploy step, the `VITE_API_URL` repo secret, `.env.example`, README.
- The login session is stored per domain: sign in again once on `.dev`.

## 2026-10-24 — Supabase → Firebase + erickmob-api, new domain

**Why:** Supabase pauses free projects after a week without activity, and the plan was to move every app to one free stack that does not pause: Firebase for login and data, and a single backend ([erickmob-api](https://github.com/erickmobltda/erickmob-api)) on an Oracle Always Free VM for everything that needs a secret key.

### Where things moved

| | Before | After |
|---|---|---|
| URL | `erickmobltda.github.io/labsync/` | **`https://labsync.erickmob.com`** (old URL redirects) |
| Login | Supabase Auth (password, sign-up, magic link) | Firebase Auth, project `erickmob-apps`, shared with the other apps. Password only; sign-up off |
| Data | Supabase Postgres `lab_reports`, `biomarkers`, `medicines`, `appointments` (project `wpymrpuvfqvmjqsedprr`) | Firestore `apps/labsync/users/{uid}/{reports,biomarkers,medicines,appointments}` |
| AI extraction | Supabase edge function `extract-biomarkers` — **accepted any caller holding the public anon key** | `POST https://api.erickmob.com/labsync/extract-biomarkers`, same prompt and model (Claude Haiku), requires the user's Firebase ID token |
| PDFs | Supabase Storage bucket `lab-reports` | Private Oracle Object Storage bucket `erickmob-files` (`labsync/{uid}/{uuid}.pdf`), only through erickmob-api, only to the owner |
| Security rules | Postgres RLS + storage policies | Firestore rules in erickmob-api `firebase/firestore.rules`; owner checks in the API for files |

### Changes

- `src/lib/firebase.ts` and `src/lib/api.ts` replace `src/lib/supabase.ts`; all hooks rewritten for Firestore.
- Each biomarker now carries its report's `report_date`, so the dashboard filters by date without a join. Filtering and sorting happen in the client (a user has a few hundred biomarkers at most).
- Deleting a report deletes its biomarkers in one batch, then its PDF (Firestore has no cascading deletes).
- Viewing a PDF downloads it with the user's token into a `blob:` URL (no public or signed links).
- Magic link, sign-up and the auth callback page were removed; the email redirect path no longer hardcodes `/labsync/`.
- Removed `supabase/` (migrations, edge function) and `scripts/setup-supabase.sh`.
- Repo secrets: `VITE_FIREBASE_*` and `VITE_API_URL`; the Supabase ones and the unused `VITE_ANTHROPIC_API_KEY` were deleted.

### Data migration

- 4 users imported into Firebase Auth with **the same uid and the same bcrypt password hash** (everyone keeps their password). `erickmobltda@gmail.com` already existed in Firebase, so its data was attached to that account instead.
- 8 reports, 386 biomarkers, 6 medicines, 3 appointments copied with their original ids; counts checked per user against Supabase.
- 4 PDFs copied to the Oracle bucket; `storage_path` keeps the same `{uid}/{uuid}.pdf` format.
- A full `pg_dump` and the PDFs are kept offline. The Supabase project is no longer used by the app.

Commits: `e8bb115` (domain), `3c8382c` (migration).
