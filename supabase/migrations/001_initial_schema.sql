-- LabSync initial schema
-- Apply via: supabase db push  (or the setup-supabase.sh script)

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Automatically created when a user signs up (via trigger below)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Lab Reports ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date     DATE NOT NULL,
  source_filename TEXT,
  raw_text        TEXT,
  storage_path    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_reports_user ON public.lab_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_date ON public.lab_reports(report_date);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reports"
  ON public.lab_reports FOR ALL
  USING (auth.uid() = user_id);

-- ── Biomarkers ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.biomarkers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES public.lab_reports(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  value           NUMERIC,
  value_text      TEXT,
  unit            TEXT,
  reference_min   NUMERIC,
  reference_max   NUMERIC,
  reference_text  TEXT,
  status          TEXT NOT NULL DEFAULT 'unknown'
                    CHECK (status IN ('normal', 'high', 'low', 'unknown')),
  category        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biomarkers_user   ON public.biomarkers(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_report ON public.biomarkers(report_id);

ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own biomarkers"
  ON public.biomarkers FOR ALL
  USING (auth.uid() = user_id);

-- ── Appointments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type      TEXT NOT NULL CHECK (type IN ('doctor', 'exam', 'therapy')),
  specialty TEXT NOT NULL,
  date      DATE NOT NULL,
  time      TIME,
  notes     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(user_id);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own appointments"
  ON public.appointments FOR ALL
  USING (auth.uid() = user_id);

-- ── Medicines ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medicines (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  start_date            DATE NOT NULL,
  end_date              DATE,
  pills_per_dose        INTEGER NOT NULL DEFAULT 1,
  times_per_day         INTEGER NOT NULL DEFAULT 1,
  prescription_required BOOLEAN NOT NULL DEFAULT FALSE,
  bought_on             DATE,
  pills_bought          INTEGER,
  schedule              TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_user ON public.medicines(user_id);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medicines"
  ON public.medicines FOR ALL
  USING (auth.uid() = user_id);
