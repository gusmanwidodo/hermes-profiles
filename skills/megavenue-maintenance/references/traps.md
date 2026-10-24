# Megavenue traps — hard-won, verified in production

Each of these cost real debugging time. They are recorded here rather than in
agent memory because they are stable facts about the codebase, not session
state.

## Money

**DB stores MINOR units (×100). API serves MAJOR via `centsToDecimal`. Client is
major end-to-end — never convert in client code.** New money crosses the wire as
decimal strings and the API converts with `decimalToCents`.

`parseMoney` / `serializeMoney` are **shallow**. Money nested inside jsonb
(`priceTiers[].price`) never converts. This hides well, because the sibling
scalar field *does* convert on read, so the record looks correct.

**`derivePaymentStatus(0, 0)` returns `'paid'`.** Every zero-total booking — a
compliment, a 100% deal — silently answers the Paid filter. A filter over money
cannot distinguish "free" from "settled".

**`cash_transactions` is written from the booking-confirmation path, not by
summing `booking_payments`.** A corrupt payment row inflates `paid_total` and
receipts while the ledger and balance stay correct. Check both separately; one
being right does not vouch for the other.

**A `payment_providers` row with no cipher silently falls back to the env key.**
No error, no warning — the wrong account just gets charged.

**Xendit v3 REST requires the header `api-version: 2024-11-11`**, or it returns
400. Auth is basic, with the secret key as the username.

Dashboard ids shaped `<uuid>_<hex>-<n>` are Xendit **sub-object** ids, not
payment ids — looking one up as a payment returns nothing.

## Database and Drizzle

Local: `docker exec megavenue-postgres-1 psql -U postgres -d megavenue`
Prod/staging: `DATABASE_PUBLIC_URL` on Railway service `megavenue-db`.

Identify environments by **tenant slug, never by row counts**.

`members` is the membership table; the FK is `members.tenant_id`, **not**
`organization_id`. Tables are `users` + `members` (column `role`).

Drizzle `bookingGuests` is an **alias of `guests`** — no `booking_guests` table
exists.

**`and()` drops `undefined` arguments**, which silently removes a filter rather
than failing. A query that looks tenant-scoped may not be.

**Drizzle wraps driver errors only sometimes.** The `postgres` driver puts
`code` and `constraint_name` on the error *itself* with no `.cause`; `pg` uses
`constraint`. Checking `.cause` alone never fires. Use `isPgErrorCode` /
`isUniqueViolation` from `common/utils/pg-error.ts`. RESTRICT violations are
`23001`.

## Migrations

**Always `git fetch` and branch from fresh `origin/staging`.** Three migration
collisions have happened from stale branches.

The next migration number is the highest `.sql` on `origin/staging`. **Drizzle
skips any `.sql` missing from `meta/_journal.json`** — a file present on disk is
not necessarily applied.

**A new CASL subject needs a `role_permissions` backfill migration, platform
subjects included.** `definePlatformAbility` iterating `PLATFORM_SUBJECTS` is
*not* the live path — `getEffectivePermissionKeys` reads rows. Production
platform owner has 20, manager 58, staff 0. Tenant subjects also need
`LEGACY_TENANT_PERMISSION_EXPANSIONS`. The guard is
`role-permission-backfill.spec.ts`; update its fixture **only after** writing
the migration, never before.

## Auth, tenancy, captcha

Sign-in: `POST /v1/auth/sign-in/email`. Active tenant:
`POST /v1/auth/organization/set-active`. State-changing calls need an `Origin`
header.

**Persona is the ACTIVE tenant's `kind`, not a role.** `/v1/admin/*` returns 403
until you set-active the platform tenant `megavenue`.

A tenant-scoped 404 during probing usually means the **wrong active tenant**
(`staging-login.json` is themesabali), not a missing route.

**Captcha fails in opposite directions depending on which guard runs.** Our
`TurnstileGuard` fails **open** without a secret; Better Auth's plugin fails
**closed**, reads `x-captcha-response`, and hooks `onRequest`, so server-side
`auth.api.*` bypasses it. Keys: `TURNSTILE_SECRET_KEY` (api),
`VITE_`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY` (dashboard/tenant). Tokens are
single-use — reset the widget between attempts.

## The projection trap — seen 16 times

`lib/server/tenant.ts` `getTenant` builds its `TenantView` **field by field**.
Add a column and it silently does not appear, with `tsc` green across all three
apps.

`tenants.findBySlug`'s public payload is an **exclusion list**: every new tenant
column auto-ships to the public web API unless explicitly excluded. That is a
data-leak shape, not just a bug shape.

**Always mutation-test.** A spec that re-implements the logic it is testing
passes forever. Census and probes are in skill `megavenue-change-verification`.

## Narrowing an existing lookup

A new narrowing predicate on a shared lookup hits **every existing row**. Before
adding one: grep every reader (resource price has 3, including raw SQL in
`availability.service.ts`), decide and test what empty input means, and count
affected rows on staging **and** production first.

## Environment and deploys

`NEXT_PUBLIC_*` and `VITE_*` are **inlined at build time** — changing one
requires a rebuild, not a restart. Production gate is
`NEXT_PUBLIC_APP_ENV` / `VITE_ENV` == `'production'`.

**Never blanket-redirect a zone.** A 301 downgrades POST to GET, which breaks
Xendit webhooks.

Ports: API 3001, tenant 3000.

Infra: SES on megavenue.com, account 574349219111; aws CLI inside the
`~/.hermes` venv; S3 in ap-southeast-1; CloudFront `K3DLQJ5RB4MAHA`.

Railway: scoped tokens fail on `me` but work for project queries
(`projects{edges{node{id name}}}`). `megavenue-full` =
`17334b48-d3d3-4852-960f-cfc359f93720`.

**Redis caches tenant and extras — flush after writing**, or the next read
serves the old row.

## Tooling quirks

**`npx playwright install` deletes cached browsers and then refuses to
reinstall. Never run it.** Render path and Turnstile workaround are in
`megavenue-change-verification`.

**`gh api -f` sends every value as a string**, and integer fields reject it. Use
`-F` for numeric params — e.g. `sub_issue_id` on
`repos/{r}/issues/{n}/sub_issues`, which takes the child's internal `.id`, not
its issue number.

`gh pr view` / `gh pr list` serve cached data. Force fresh with
`gh api -H 'Cache-Control: no-cache'`.

**`git add` with multiple paths stages nothing if one contains `$`** (e.g.
`$id.tsx`). Add them singly and verify with `git diff --cached`.

**Stash and branch moves lose edits silently** — #992 shipped with three files
missing. Re-verify every edit after any move.

The type gate `/tmp/tsc-gate4.sh` diffs raw `tsc` lines **with line numbers**,
so a single new import makes pre-existing errors read as new. Compare on
(file, code, message) instead.

## Workflow

Every task starts with a **GitHub issue before any code**, added to org project
#1, status Ready, assignee gusmanwidodo.

**PRs always target `staging`**, never the default branch. The consequence:
`Closes #N` never fires, so issues never auto-close. Judge the backlog from
merged-PR bodies, not from the open-issue list.

## CRM / customer data

`customers` has **no unique constraint on email or phone** — production already
holds duplicates. There is **no consent, unsubscribe, or SES-bounce model**.
Outbound marketing is blocked until that exists.
