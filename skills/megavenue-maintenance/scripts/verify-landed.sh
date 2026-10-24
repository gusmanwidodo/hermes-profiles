#!/usr/bin/env bash
# Verify by CONTENT what actually landed in origin/staging.
#
# WHY THIS EXISTS: squash merges make commit counts lie. After a squash merge
# the branch SHA is absent from staging while the content IS present, so
# `git rev-list --count origin/staging..branch` still reports "5 commits
# ahead". Reading a merged PR's commit list is also wrong — it shows only what
# was in the PR at merge time, not commits pushed to the branch afterwards.
#
# Two real commits were lost this way in one session (an /v1/open/* security
# gap, and a schema comment fix). Only the file body in staging is
# authoritative.
#
# USAGE
#   scripts/verify-landed.sh                       # built-in checks
#   scripts/verify-landed.sh path/to/file.ts SYMBOL  # ad-hoc single check
#
# Run from the megavenue repo root, after every merge, BEFORE reporting
# anything as shipped.
set -u

BASE="${BASE_BRANCH:-origin/staging}"
cd "${REPO:-$HOME/projects/megavenue}" || { echo "repo not found"; exit 1; }
git fetch origin -q 2>/dev/null || true

rc=0

check() {
  local label="$1" file="$2" needle="$3" n
  n=$(git show "$BASE:$file" 2>/dev/null | grep -c -- "$needle" || true)
  if [ "${n:-0}" -gt 0 ]; then
    printf "  OK      %-44s\n" "$label"
  else
    printf "  MISSING %-44s  (%s)\n" "$label" "$file"
    rc=1
  fi
}

if [ "$#" -ge 2 ]; then
  check "ad-hoc" "$1" "$2"
  exit $rc
fi

echo "=== content present in $BASE ==="

# Feature toggles (memberships / affiliates)
check "toggle columns"        "megavenue-api/src/database/schema/tenants.ts"                        "membershipsEnabled"
check "TenantFeatureGuard"    "megavenue-api/src/common/guards/tenant-feature.guard.ts"             "RequiresTenantFeature"
check "backfill migration"    "megavenue-api/src/database/migrations/0096_backfill_feature_toggles.sql" "memberships_enabled"
check "guest menu gating"     "megavenue-tenant/components/tenant/TenantMenu.tsx"                   "membershipsEnabled"
check "open-api gate"         "megavenue-api/src/open/memberships/open-memberships.controller.ts"   "RequiresTenantFeature"

# Affiliate accrual on confirmed
check "accrual: webhook"      "megavenue-api/src/tenant/payments/booking-confirmation.service.ts"   "accrueBookingCommissionTx"
check "accrual: dashboard"    "megavenue-api/src/tenant/bookings/bookings.service.ts"               "confirmedTransition"
check "schema comments"       "megavenue-api/src/database/schema/affiliates.ts"                     "is confirmed"

echo
if [ "$rc" -ne 0 ]; then
  cat <<'EOF'
Something is MISSING from staging. Recover it:

  git checkout -b fix/<topic> origin/staging
  git cherry-pick <sha>        # sha still exists on the old branch
  # verify content, run tests, THEN open a PR --base staging

Never push the recovery commit to an already-merged PR.
EOF
fi
exit $rc
