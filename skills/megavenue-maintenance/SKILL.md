---
name: megavenue-maintenance
description: Maintain the Megavenue project — repo layout, verified versions, local Tailscale setup.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [megavenue, nestjs, nextjs, vite, tanstack, bullmq, xendit, postgres, drizzle, tailscale]
---

# Maintaining Megavenue

**Repo read 2026-09-03 at commit `c0f09a6a` (main).** Checkout at
`~/projects/megavenue`, remote `git@github.com:megavenue/megavenue.git` (private).

## The repo owns its own context — read it first

**Production traps — read before touching money, migrations, or projections:**
`skill_view('megavenue-maintenance', file_path='references/traps.md')`

Twenty-seven verified failure modes that each cost real debugging time: the
shallow money conversion that hides in jsonb, `derivePaymentStatus(0,0)`
returning `'paid'`, `and()` silently dropping filters, the field-by-field
`TenantView` projection seen 16 times, and the captcha guards that fail in
opposite directions.

`~/projects/megavenue/CLAUDE.md` is authoritative: architecture, commands,
conventions, subagents (`.claude/agents/`), slash commands (`.claude/commands/`).
**Read it before any work. It outranks this file.** This file carries only what
CLAUDE.md does not: machine-local environment and lessons learned here.

Stack skill packs live in `.agents/skills/` (~40: nestjs-*, drizzle-orm,
better-auth-*, jest-*, multi-tenant-architecture, …), symlinked into
`.claude/skills/`, pinned by `skills-lock.json`.

## Shape: three apps, no workspace manager

Three independent apps, each with its own `package.json` and `pnpm-lock.yaml`.
**No root lockfile, no workspace file.** Always `cd` into the app first.
pnpm 11.22.0, Node 24.19.0 (nvm).

| App | Stack | Role | files |
|---|---|---|---|
| `megavenue-api` | NestJS 11 | API `/v1/*` | 971 |
| `megavenue-app` | React 19 + Vite 7 + TanStack Router | owner dashboard SPA | 541 |
| `megavenue-tenant` | Next.js 16 App Router | guest booking pages | 389 |

## Versions — from package.json, not the registry

Pre-read notes listed npm *latest* (NestJS 12, Next 16.3.4, Vite 8, BullMQ 6).
**The project pins older majors.** Those notes were wrong to act on; deleted.

| Package | Pinned | App |
|---|---|---|
| `@nestjs/core` | ^11.0.1 | api |
| `bullmq` / `@nestjs/bullmq` | ^5.71.0 / ^11.0.4 | api |
| `drizzle-orm` / `drizzle-kit` | ^0.45.1 / ^0.31.0 | api |
| `ioredis` | 5.9.3 exact | api |
| `@aws-sdk/client-sesv2` | ^3.1046.0 | api |
| `next` | 16.1.6 exact | tenant |
| `vite` | ^7.3.1 | app |
| `@tanstack/react-router` | ^1.166.7 | app |
| `better-auth` | ^1.5.6 / ^1.6.10 / ^1.6.11 | api / app / tenant |

**better-auth differs across all three apps** — check the specific app's
lockfile before relying on any auth API.

No `xendit-node` dependency — Xendit is called over raw HTTP. TanStack **Start**
is not installed despite CLAUDE.md's heading; it is react-router + router-plugin
on Vite.

## Payments: Xendit over raw HTTP

Verify → enqueue → process. **Already correct in the codebase** — match it,
don't redesign.

- `tenant/payments/webhooks-xendit.controller.ts` — `assertToken()` runs
  **before** `queue.add()`, so forged payloads are never enqueued. DB work
  happens in `payments-webhook.processor.ts`.
- `common/modules/xendit/` — payouts, disbursements, refunds providers.
- One business account ⇒ every product shares `XENDIT_WEBHOOK_TOKEN`.
- Bad token ⇒ `UnauthorizedException` code `BAD_WEBHOOK_TOKEN`.
- Per-tenant credentials in `admin/payment-providers` (encrypted with
  `INTEGRATION_TOKEN_KEY`) take priority over env fallbacks.

`~/projects/bigevent` does **not** exist on this machine. Megavenue's own
implementation is the reference.

## Queues: 14 processors, single-flight solved

Every registered queue has a matching `@Processor`. The "two schedulers
double-execute" failure mode is **already defended**:
`common/scheduler/single-flight.ts` computes deterministic tick-bucketed job IDs
(`name:YYYY-MM-DD` / `:HH:mm`) so replicas firing the same tick dedup via
BullMQ's `add`. Buckets are unique per tick, making `removeOnComplete: true`
safe.

When a job "disappears": check the single-flight job ID first (a duplicate tick
is collapsed **by design**), then the processor, then Redis.

`WORKERS_ENABLED=false` turns an instance into API-only; the dynamic scheduler
still enqueues from every instance.

## Local dev on megavenue.dev (Tailscale-only)

Built 2026-09-03. Mirrors the `a9max.dev` private lane in `~/projects/a9max-infra`.

- **CoreDNS** (`dns/Corefile`) is authoritative for both `a9max.dev` and
  `megavenue.dev`, wildcard-answering `100.124.203.91`.
- **Tailscale split DNS** routes each zone to that IP — registered manually in
  the admin console; a zone is inert without it.
- **mkcert** wildcard `_wildcard.megavenue.dev.pem` (+ apex SAN), gitignored
  under `traefik/certs/`. Reissue:
  `mkcert -cert-file _wildcard.megavenue.dev.pem -key-file _wildcard.megavenue.dev-key.pem "*.megavenue.dev" megavenue.dev`
- **Traefik** binds only the Tailscale IP + loopback. Never public.
- **Overlay** `~/projects/a9max-infra/megavenue/docker-compose.override.yml`
  adds Traefik labels + the `a9max` network. Kept outside the repo because
  `docker-compose.override.yml` is **not** gitignored there.

Hosts: `api.` → 3001, `app.` → 5173, apex + `<slug>.` → tenant 3000.
`api`/`app` are already reserved subdomains in both host parsers.

### Pitfalls found the hard way

- **`make up-dns` does NOT reload the Corefile.** Compose only recreates when
  `docker-compose.yml` changes; the Corefile is a bind mount. Exit code is 0 and
  it prints "Container dns Running" while serving the OLD config. Use
  `docker restart dns`, then confirm via `docker logs dns` listing both zones.
- **Traefik router priority is mandatory here.** Priority defaults to rule
  length, and the tenant `HostRegexp` is longer than the `api`/`app` `Host`
  rules — it would swallow them. Explicit `100` vs `10`.
- **`traefik.docker.network: a9max`** is required since each container sits on
  two networks.
- **`.dev` is HSTS-preloaded.** Browsers force HTTPS on every `*.dev` name;
  plain HTTP is never testable.
- **Vite rejects unknown Host headers.** `megavenue-app/vite.config.ts` needs
  `allowedHosts: ['.megavenue.dev']` or the dashboard shows "Blocked request".
- **`PLATFORM_BASE_DOMAINS` was asymmetric.** The API read it from env;
  `megavenue-tenant/lib/host.ts` hardcoded the list. Now both are configurable
  (`NEXT_PUBLIC_PLATFORM_BASE_DOMAINS` on the tenant side). Keep them in sync or
  a tenant subdomain on one side reads as a custom domain on the other.
- **Better Auth sets no cookie domain** — `advanced:` holds only
  `database.generateId`. Host-only cookies are fine because `app.` and `api.`
  share the registrable domain (same-site, `SameSite=Lax` still sent). Mirrors
  production. Do not add `crossSubDomainCookies` without a real failure.
- `memory-bank/custom-domain-auth.md` is referenced from `auth.ts` comments but
  **does not exist** in the repo.

## PRs: never push to a PR after opening it

**This cost two lost commits in one session.** Gus merges fast — often within
minutes of the PR being opened. A commit pushed to the branch *after* he merges
lands nowhere: the PR is closed, the squash-merge already happened, and the
branch quietly diverges from `staging` with work that looks finished.

Lost this way: `b161bdf7` (an `/v1/open/*` enforcement gap, i.e. real behaviour)
and `cf8027d0` (schema comments). Both had to be recovered as follow-up PRs
#310 and #312.

Rules:

- **Everything goes in before `gh pr create`.** No "I'll add one more commit."
- Found something after opening? **New branch off `origin/staging`,
  `git cherry-pick`, new PR.** Never push to the open one.
- PRs always `--base staging` (repo default is `main`, so it must be explicit).

### Verify what landed by CONTENT, not by commit count

Squash merges make `git rev-list --count origin/staging..branch` useless: the
SHA is absent from staging while the content is present, so a merged branch
still reports "5 commits ahead". Reading that as "nothing landed" is wrong, and
reading a merged PR's commit list is also wrong — it shows only what was in the
PR *at merge time*.

The only authoritative check is the file body in staging:

```bash
git fetch origin -q
git show origin/staging:path/to/file.ts | grep -c 'the-new-symbol'
```

Zero ⇒ genuinely missing ⇒ cherry-pick onto a fresh branch off `origin/staging`.
Run this for every change after any merge, before reporting anything as shipped.

**Run `scripts/verify-landed.sh`** rather than hand-typing the checks — it
covers the known surfaces and prints the recovery recipe when something is
missing. Ad-hoc: `scripts/verify-landed.sh path/to/file.ts SYMBOL`.

## Backfill migrations fail silently

Adding a column with a safe default is only half the job. If existing rows need
a *different* value, that is a second, **hand-written** migration — and the
mechanism has a silent-failure mode that costs real user access.

`drizzle-kit generate` writes both the `.sql` file and its
`migrations/meta/_journal.json` entry. A hand-written backfill gets **no journal
entry**, so `migration:run` never executes it — and still prints
**"migrations applied successfully"** and exits 0.

Symptom: schema is correct, rows are untouched, every log is green.

```bash
# after any hand-written migration, confirm the journal knows about it
python3 -c "
import json; j=json.load(open('src/database/migrations/meta/_journal.json'))
print(max(e['idx'] for e in j['entries']))"          # must cover the new file
ls src/database/migrations/*.sql | wc -l              # must match entry count
pnpm run migration:check                              # ordering gate
```

Backfills are journalled **without** a snapshot of their own — copy the shape of
the existing `0093_backfill_*` / `0094_backfill_*` entries.

**Then verify the DATA, never the log line.** Query the rows and compare against
an independently derived expectation:

```sql
select count(*) filter (where memberships_enabled) from tenants;
```

In this session the estimate written into the plan ("4 tenants") was itself
wrong — it counted only venues with membership *plans*, while the backfill
predicate also matched venues with *members*. Real answer: 14. Deriving the
expected number from the migration's own WHERE clause, not from a hand estimate,
is what catches this.

### Ship the column and the backfill in ONE PR

A column defaulting to `false` that gates a feature already in use **removes
that feature from every existing user** the moment it merges. Column + backfill
must land together or not at all.

## A new dimension NARROWS an existing lookup — budget for that, not just the feature

**A release carrying a migration cannot be rolled back.** The regression
analysis therefore belongs in the PR, not in the incident afterwards.

The failure is structural, and one feature shipped it twice
(`price_rules.session_label`: PR #763, then #767, then #770):

A new optional column feels additive. But the moment a lookup filters on it the
predicate applies to **every existing row**, including rows the feature was
never about. `NULL` widening is not enough, because the *input* can also be
empty:

```sql
-- intent: "a rule naming a session applies only in that session"
AND (session_label IS NULL OR session_label = ANY($labels))
```

With `$labels = []` this keeps only session-agnostic rules. A venue whose
catch-all happened to be out of date range then had **zero** candidates, and an
already-paid booking could no longer be rescheduled: `NO_PRICE_RULE`, on a code
path nobody associated with the new feature.

### Before shipping a narrowing predicate

1. **Enumerate every reader, not the one being edited.** Resource price resolves
   in **three** places: two in `reservations.service.ts` (sale, quote) and one in
   **raw SQL** inside `availability.service.ts`. The raw-SQL one is invisible to
   a Drizzle-symbol grep.

   ```bash
   grep -rn "price_rules\|priceRules" src --include=*.ts | grep -v spec
   ```

   Shipping the filter to two of three gave the guest grid one price for the
   whole day while the sale priced per session, so the quote and the charge
   disagreed.

2. **Write down what the neutral input means, then test it.** Every new
   predicate has an empty/absent case with exactly one honest reading:

   | input | wrong | right |
   |---|---|---|
   | empty label list | keep only agnostic rules | **do not narrow** |
   | no match found | fail | fall back to prior behaviour |

   A tie-break carries the same question: with no match, **drop** the rank rather
   than keep it, or a row outside every session still prefers a session-specific
   value.

3. **Put the widening in ONE helper**, not at each call site
   (`priceRuleSessionFilter` / `priceRuleSessionRank` in
   `tenant/pricing/price-rule-session.ts`). Two call sites drift; one cannot.

4. **Count affected rows on staging AND production before merging**, with a
   query that reproduces the predicate, and report both in the PR:

   ```
   staging 8 bookings · production 0
   ```

   That number is the difference between an apology and real money.

5. **Render the SQL in a test.** `new PgDialect().sqlToQuery(filter([]))` catches
   what a mocked query cannot. Drizzle renders an interpolated JS array as a
   chunk list, so `= ANY(${[]})` becomes `ANY(())` — a **syntax error** the
   client sees as a bare 500. `inArray` renders `in ($1,$2)` and a bare `false`
   for an empty list, which is why the empty case must be handled *before*
   calling it.

### A passing test can pin the bug as the contract

Both regressions had green suites. One spec asserted
`"session_label" is null or false` under the name *"with no matched session,
keeps only session-agnostic rules"* — describing the defect as intended. Another
asserted `expect(slot.price).toBeUndefined()`.

When a report contradicts a passing test, **read the test's intent before
trusting it**. Also re-check source-grepping assertions after a refactor: one
ordering loop keyed on a literal that had moved into a helper, so it silently
checked zero blocks and passed. Assert the loop ran: `expect(checked).toBe(2)`.

## Restart does not reload — recreate does

A recurring, cross-tool failure mode: the "reload" command exits 0, prints a
healthy-looking line, and keeps serving the OLD config.

| Command | Does NOT pick up | Use instead |
|---|---|---|
| `make up-dns` / `docker compose up -d` | changed bind-mounted `Corefile` | `docker restart dns` |
| `docker compose restart api` | changed `env_file` / `.env` | `docker compose up -d --force-recreate api` |

`docker compose restart` restarts the process inside the **existing container**,
and env vars are baked in at container creation. `process.env` beats dotenv, so
a stale value silently wins.

Always confirm from **inside** the container, never from the file on disk:

```bash
docker exec megavenue-api-1 printenv S3_REGION XENDIT_ENABLED
```

Note `docker-compose.yml` `environment:` entries **override** `env_file`, so a
var absent from `.env` may still be set (e.g. `MEDIA_CLEANUP_ENABLED=false` is
pinned in compose regardless of `.env`).

## Never run pnpm install on the host while the stack is up

The compose file bakes `node_modules` into a **named volume** so the source
bind-mount cannot shift the lockfile. Running `pnpm install` on the host writes
to the same path from outside, and the two views collide — Vite's dep-optimizer
cache (`node_modules/.vite/`) is wiped.

Symptom: the browser shows
`Failed to fetch dynamically imported module: .../login.tsx`, but that module
returns **200**. The failure is a *transitive* import — individual deps return
**504** while the parent is fine. A reliable tell is `?v=` hashes differing
per-dependency instead of being uniform.

Fix: `docker compose restart app` (rebuilds the cache), then hard-reload the
browser. Prevention: run `tsc`, tests, and lint **inside** the container —
`docker exec megavenue-api-1 pnpm run test` — never on the host.

## Money: affiliate commission

Commission lives in **three** places (running balance, per-booking projection,
settlement snapshot) and there is **no reversal path**. Accrual moved from
`completed` to `confirmed` on 2026-09-03 across three trigger sites.

Read `references/affiliate-commission-model.md` before touching anything in
`affiliates.service.ts`, accrual triggers, or settlement — the projection vs
balance distinction is where double-payment bugs come from.

## Tenant features have FOUR enforcement surfaces, not two

Gating a tenant feature (`aiChatEnabled`, `membershipsEnabled`,
`affiliatesEnabled`) means gating every surface that can reach the service.
Missing one produces a switch that *looks* enforced but is not — the worst
possible outcome, because the admin believes the feature is off.

| Surface | Auth | How to gate |
|---|---|---|
| `tenant/*` dashboard | session (`request.user.activeTenantId`) | class-level `@RequiresTenantFeature` + `@UseGuards(TenantFeatureGuard)` |
| `web/*` guest | `X-Tenant-Slug`, **no session** | per-route checks — the guard does NOT apply |
| `open/*` integrator | `X-Api-Key` (`mvk_`) | same guard **does** apply |
| `megavenue-tenant` guest site | — | consume the flag from the tenant payload |

**`open/*` is the one that gets missed.** It authenticates by API key, so it
does not inherit anything session-based — but `ApiKeyGuard` sets
`request.user = { activeTenantId }` precisely so `@TenantId()` keeps working,
which is exactly what `TenantFeatureGuard` reads. The guard drops in with zero
new code; it just has to be remembered, and registered as a provider on the
module.

Apply the guard at **class level** so endpoints added later inherit it.

Find every surface before writing any of them:

```bash
grep -rln "MembershipsService\|AffiliatesService" src --include=*.controller.ts | grep -v spec
```

### Exposing a flag is not consuming it

The API can send `membershipsEnabled` in the tenant payload while
`megavenue-tenant` never reads it — the guest menu keeps offering a link to a
page whose API calls now 404. Always check the consumer side:

```bash
grep -rn "membershipsEnabled" megavenue-tenant --include=*.ts --include=*.tsx
```

Zero hits ⇒ the flag is decorative on that surface. Default such client-side
gates to **true** so an older/cached payload keeps prior behaviour instead of
silently hiding UI.

## Delegation: plan here, execute in opencode

Gus's workflow — planning by Claude, execution by opencode.

- opencode at `~/.nvm/versions/node/v24.19.0/bin/opencode` (one binary on PATH;
  check `which -a opencode` if behaviour looks wrong).
- Provider is **OpenCode Zen** (`opencode-go`, `https://opencode.ai/zen/go/v1`),
  configured in `~/.config/opencode/opencode.json`, which reads
  `{env:OPENCODE_API_KEY}`. The key lives in a 0600 file sourced from
  `.bashrc` — never inline in a dotfile, never in this skill.
  **Read that config before assuming which provider a key belongs to**; a
  bare `sk-…` prefix does not identify the vendor, and guessing sends the
  user's key to the wrong party.
- **`opencode run` exits 0 even on auth failure** (`Error: Missing API key`).
  Never trust its exit code — always read the output text.
- Scope each session to one app directory; the three apps share no build.
  Two sessions must never share a working directory.

### Delegating well

- Put **exact line numbers** in the prompt, not just file paths. A prompt
  naming only files sends the agent reading whole modules it will not touch;
  that reading dominates the token cost.
- Use a cheap/flash model for mechanical work (locale files, renames,
  formatting). Coding-grade models are wasted on translating four keys into
  ten languages.
- Trim the plan per session — do not attach a full multi-phase plan to a
  session that implements three tasks of it.

### Verify delegated work — the claims are self-reports

- **"Pre-existing failure" must be proven**, not accepted: `git stash`, re-run,
  compare. In this session the claim was true — but the cause was the
  *operator's own* `.env` (`PLATFORM_BASE_DOMAINS` pointing at the local apex),
  not the repo.
- **Large diffs are usually Prettier**, not scope creep. `prettier-plugin-organize-imports`
  rewrites imports in every file it touches, so ~30 changed files for a ~10-file
  task is normal. Do not verify this by running prettier on a temp copy — outside
  the repo root it cannot find `.prettierrc` and reports every file as differing.
  Run `prettier --check` **in place, inside the container** (cwd `/app`).
- Compare lint by **error-carrying files** against a stashed baseline, not by
  raw counts — formatting often *reduces* pre-existing errors and hides a new one.

### Updating specs when behaviour changes

When a trigger moves (e.g. accrual `completed` → `confirmed`), specs asserting
the old behaviour must be **inverted, not deleted**: the old site asserts the
call is *not* made, and the new site asserts it *is*. Deleting them removes the
only guard against a silent revert.

Where a suite deliberately calls `bypassGuards`, an HTTP test passes whether or
not a guard exists. Assert the metadata and guard binding instead:

```ts
Reflect.getMetadata(TENANT_FEATURE_KEY, TheController);
Reflect.getMetadata('__guards__', TheController);
```

Never write a test that re-implements the logic it is testing — it passes even
when the real code is broken. Prefer asserting against the running system.

## Working with Gus

- **Plan first, then execute.** Show the plan and get a decision before writing
  code. When a change has a consequence he has not asked about (money, access,
  data loss), surface it as a numbered choice with a recommendation — do not
  pick silently. He answers with the letter.
- Reply in **casual Indonesian**; technical terms stay in English.
- **Propose credential/destructive writes before applying.** Write the proposed
  file to a scratch path, show a masked diff, offer graduated scopes, then wait.
  Never apply-then-show. A refused command is refused — do not retry it or route
  around it with a different command.
- Tokens arrive **in chat**. Write them to 0600 files outside any repo, never
  into memory or a dotfile body, and flag them for rotation afterwards.
- **When merging a local stack with remote env: the local service wins.**
  Postgres, Redis, ports, URLs stay local; only import what has no local
  equivalent (S3, SES, provider keys, `INTEGRATION_TOKEN_KEY`).
- **Report token/cost after each completed task** — `opencode stats` for
  delegated sessions.

## Non-negotiables when writing API code

- Every tenant-scoped query filters by `tenant_id` via `@TenantId()`. Postgres
  RLS exists but currently passes everything — application-level isolation is
  the only real guard.
- Global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`: a request
  field not on the DTO is rejected.
- CASL permissions live in **two** catalogs — `megavenue-api/src/common/acl/`
  and `megavenue-app/src/lib/` — change them together.
- Migrations are drizzle-kit generated (`migration:generate`) and never
  auto-run — **except backfills, which ARE hand-written**, following the
  existing `0093_backfill_*` / `0094_backfill_*` convention. See "Backfill
  migrations fail silently" below before writing one.
- `routeTree.gen.ts` is generated — never edit.
- Run `/check` before any commit. Coverage gates: 80% lines/statements/
  functions, 65% branches.

## Verification before reporting

Type-check and build run, tests run, webhook verification exercised, a job
observed being consumed. State explicitly what was **not** checked.

## SOURCES

- `~/projects/megavenue` @ `c0f09a6a`, read 2026-09-03; updated through
  `staging` @ PR #311 (affiliate accrual on `confirmed`)
- `~/projects/a9max-infra` @ `3ccd6a0` — DNS/TLS/Traefik, built and verified 2026-09-03
- Feature-toggle enforcement + backfill lessons: PRs #309/#310, verified against
  a restored production dataset 2026-09-03
- Affiliate money model: schema + live DB read 2026-09-03 —
  see `references/affiliate-commission-model.md`
