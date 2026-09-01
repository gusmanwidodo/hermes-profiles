# Operations

Deploy topology, environments, and what to check when something breaks.

## Two deployment targets

`CLAUDE.md` lists Vercel. That is the web app only — the full picture is two
services.

**Web app — Vercel**

- Fluid Compute; secrets via `vercel env`
- Build: `vercel-build` = `check-migration-order.mjs` → `drizzle-kit migrate` →
  `next build`
- Migration order is enforced at build time, so a mis-ordered migration fails
  the deploy rather than corrupting the database
- Cron routes at `/api/cron/*`, scheduled in `vercel.json`

**Cron service — Railway**

- Config: `railway.cron.json`, builder **Nixpacks** (not Docker — see below)
- Build `pnpm build:cron`, start `pnpm start:cron`
- One replica, restart on failure, max 10 retries
- Rebuilds only when `src/server/cron/**`, `src/server/queue/jobs.ts`,
  `scripts/build-cron.mjs`, `package.json`, or the lockfile change
- Publishes to Redis only. No database access, executes nothing.

**A Dockerfile in the repo root makes Railway switch off Nixpacks.** Commit
`b5dc7d0` renamed the E2E Dockerfile to `Dockerfile.e2e` precisely to stop that
happening. Do not add a root `Dockerfile` without checking what it does to the
Railway build.

## The three scheduling paths

Exactly one may be active per deployment. Running two double-executes every
sweep.

| Path | Where | When it applies |
|---|---|---|
| Vercel Cron | `vercel.json` → `/api/cron/*` | Production web app |
| Embedded scheduler | `src/server/cron/embedded.ts` | Defaults **on** when `VERCEL` is unset — so local and self-hosted |
| Standalone service | Railway | The publish-only deployment |

The embedded default matters: a self-hosted instance schedules by itself unless
told otherwise. Adding the Railway service without disabling the embedded one
gives duplicate sweeps.

`?dryRun=1` on a cron route reports counts without writing — the safe way to
check what a sweep would do.

## The four sweeps

| Job | Schedule (UTC) | Work |
|---|---|---|
| `cron:expire-orders` | every 5 min | expired orders, pledges, seat holds |
| `cron:sweep-campaigns` | every 5 min | campaign + sponsorship deadlines |
| `cron:memberships-billing` | 18:00 daily | invoice generation, dunning ladder |
| `cron:class-sessions-sweep` | 18:30 daily | `completeSessions` then `runAutoReserveSweep` |

18:00 UTC = 01:00 WIB.

**Order is load-bearing in the class-sessions sweep** — completing sessions
before auto-reserve, not after. Reversing it produces wrong reservations.

## Local development

```bash
pnpm dev                # next dev --turbopack
pnpm test               # vitest
pnpm lint
```

Full stack in Docker, closest to production:

```bash
pnpm e2e:up             # start and wait for health
pnpm e2e:seed           # seed data
pnpm e2e                # run the suite
pnpm e2e:logs           # follow
pnpm e2e:down           # tear down, remove volumes
```

`docs/e2e-docker.md` has the detail.

## When something breaks

**Sweeps running twice** → two scheduling paths active. Check whether the
embedded scheduler is on (it defaults on without `VERCEL`) alongside Vercel Cron
or the Railway service.

**Sweeps not running at all** → check the Railway service is up and Redis is
reachable. The cron service publishes; if nothing consumes, nothing happens.

**Deploy fails on migration order** → `check-migration-order.mjs` rejected the
sequence. Fix the migration ordering; do not bypass the check.

**Railway rebuilding on unrelated commits** → `watchPatterns` in
`railway.cron.json` is too broad, or a root `Dockerfile` reappeared and switched
the builder.

**Payment webhook rejected** → signature verification. Each provider differs,
and field order is the contract. Read that provider's section in `CLAUDE.md`
before changing anything; never verify after a database write.

**Oversell or double-scan** → `src/server/seating/holds.ts` and
`src/server/tickets/scan.ts`. Both carry tests. Reproduce in a test before
attempting a fix.

## Before any deploy

- [ ] `pnpm test` passes
- [ ] `pnpm lint` clean
- [ ] `pnpm e2e` for anything touching checkout, seating, or scanning
- [ ] Migrations reviewed as SQL, not just generated
- [ ] Cron changes: confirmed only one scheduling path stays active
