#!/usr/bin/env bash
# =============================================================================
# LabSync — Supabase setup script
#
# This script automates the full Supabase configuration for LabSync.
# It requires the Supabase CLI and will:
#   1. Link (or init) your Supabase project
#   2. Apply the database migrations
#   3. Create the PDF storage bucket with the correct policies
#   4. Deploy the extract-biomarkers Edge Function
#   5. Write the required values to your .env file
#
# Prerequisites:
#   - Supabase CLI installed: https://supabase.com/docs/guides/cli/getting-started
#   - A Supabase account and project (free tier works)
#   - ANTHROPIC_API_KEY available
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

echo ""
echo "========================================"
echo "  LabSync — Supabase Setup"
echo "========================================"
echo ""

# ── 1. Prerequisites check ────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v supabase &>/dev/null; then
  error "Supabase CLI not found. Install it from: https://supabase.com/docs/guides/cli/getting-started

  macOS:   brew install supabase/tap/supabase
  Windows: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase
  Linux:   https://github.com/supabase/cli/releases"
fi

success "Supabase CLI found: $(supabase --version)"

# ── 2. Anthropic API key ──────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ] && grep -q "^ANTHROPIC_API_KEY=.\+" "$ENV_FILE"; then
  ANTHROPIC_API_KEY=$(grep "^ANTHROPIC_API_KEY=" "$ENV_FILE" | cut -d= -f2-)
  info "Using ANTHROPIC_API_KEY from .env"
else
  echo ""
  read -rp "Enter your Anthropic API key: " ANTHROPIC_API_KEY
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    error "ANTHROPIC_API_KEY is required"
  fi
fi

# ── 3. Supabase login ─────────────────────────────────────────────────────────
info "Logging in to Supabase..."
if ! supabase projects list &>/dev/null; then
  supabase login
fi
success "Logged in to Supabase"

# ── 4. Select or link project ─────────────────────────────────────────────────
echo ""
info "Listing your Supabase projects..."
supabase projects list

echo ""
read -rp "Enter your project Reference ID (from the list above): " PROJECT_REF
if [ -z "$PROJECT_REF" ]; then
  error "Project reference ID is required"
fi

info "Linking to project ${PROJECT_REF}..."
cd "$ROOT_DIR"
supabase link --project-ref "$PROJECT_REF"
success "Linked to project ${PROJECT_REF}"

# ── 5. Apply database migrations ──────────────────────────────────────────────
info "Applying database migrations..."
supabase db push
success "Database migrations applied"

# ── 6. Create storage bucket ──────────────────────────────────────────────────
info "Creating storage bucket 'lab-reports'..."

# Use the Supabase Management API to create the bucket
SUPABASE_ACCESS_TOKEN=$(supabase secrets list 2>/dev/null | head -1 || true)

# Get project URL and anon key
PROJECT_URL=$(supabase status --output json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('API URL',''))" 2>/dev/null || true)

# Fallback: construct from project ref
if [ -z "$PROJECT_URL" ]; then
  PROJECT_URL="https://${PROJECT_REF}.supabase.co"
fi

# Run SQL to set up storage via Supabase's built-in storage schema
supabase db execute --sql "
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lab-reports', 'lab-reports', false, 52428800)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;

-- RLS policies for lab-reports bucket
DO \$\$
BEGIN
  -- Allow authenticated users to upload their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload own reports'
  ) THEN
    CREATE POLICY \"Users can upload own reports\"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to read their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can read own reports'
  ) THEN
    CREATE POLICY \"Users can read own reports\"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Allow users to delete their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own reports'
  ) THEN
    CREATE POLICY \"Users can delete own reports\"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END
\$\$;
" 2>/dev/null || warn "Storage bucket SQL failed — you may need to create the bucket manually in the Supabase Dashboard"

success "Storage bucket configured"

# ── 7. Deploy Edge Function ───────────────────────────────────────────────────
info "Deploying extract-biomarkers Edge Function..."
supabase functions deploy extract-biomarkers

info "Setting ANTHROPIC_API_KEY secret on Edge Function..."
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
success "Edge Function deployed and secret set"

# ── 8. Get project credentials ────────────────────────────────────────────────
info "Fetching project credentials..."

# Extract from supabase status
SUPABASE_URL=""
SUPABASE_ANON_KEY=""

STATUS_OUTPUT=$(supabase status --output json 2>/dev/null || echo "{}")

if command -v python3 &>/dev/null; then
  SUPABASE_URL=$(echo "$STATUS_OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('API URL',''))" 2>/dev/null || true)
  SUPABASE_ANON_KEY=$(echo "$STATUS_OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('anon key',''))" 2>/dev/null || true)
fi

# Fallback to project ref URL if we couldn't parse
if [ -z "$SUPABASE_URL" ]; then
  SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
  warn "Could not auto-detect project URL — using default: $SUPABASE_URL"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo ""
  info "Could not auto-detect anon key. Find it in:"
  info "  Supabase Dashboard → Your Project → Settings → API → Project API Keys → anon (public)"
  read -rp "Paste your anon key here: " SUPABASE_ANON_KEY
fi

# ── 9. Write .env file ────────────────────────────────────────────────────────
info "Writing credentials to .env..."

if [ ! -f "$ENV_FILE" ]; then
  cp "${ROOT_DIR}/.env.example" "$ENV_FILE"
fi

# Update or append each variable
update_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

update_env "ANTHROPIC_API_KEY"   "$ANTHROPIC_API_KEY"
update_env "VITE_SUPABASE_URL"   "$SUPABASE_URL"
update_env "VITE_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"

success ".env file updated"

# ── 10. Done ──────────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo -e "  ${GREEN}Setup complete!${NC}"
echo "========================================"
echo ""
echo "Your .env file has been configured with:"
echo "  VITE_SUPABASE_URL     = $SUPABASE_URL"
echo "  VITE_SUPABASE_ANON_KEY = ${SUPABASE_ANON_KEY:0:20}..."
echo ""
echo "Next steps:"
echo "  npm install"
echo "  npm run dev          # Start the development server"
echo ""
echo "Or build for production:"
echo "  npm run build"
echo "  npm run preview"
echo ""
