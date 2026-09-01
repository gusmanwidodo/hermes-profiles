---
name: bigevent-maintenance
description: Maintain the bigevent ticketing platform — routing, deploy, verification.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [bigevent, ticketing, nextjs, railway, vercel, bullmq, drizzle]
---

# Maintaining bigevent

Event and ticketing platform. Differentiator is rich artist management —
bookings, riders, payouts, availability, analytics — sitting behind the
ticket-selling front.

**Repo:** `~/projects/bigevent` → `github.com/gusmanwidodo/bigevent` (private)

## Read the repo's own context first — always

This skill is deliberately thin. The project already carries its own, more
detailed context, and it is the source of truth:

| File | Holds |
|---|---|
| `CLAUDE.md` (~25k chars) | Stack, guardrails, domain model, conventions, commands |
| `skills-lock.json` | Pinned external skills with content hashes |
| `docs/cron-service.md` | Cron architecture and the three scheduling paths |
| `docs/e2e-docker.md` | Full-stack E2E environment |
| `docs/performance-concurrency-audit.md` | Concurrency findings |

**Do not restate what `CLAUDE.md` says here.** Two copies of a guardrail drift
apart, and the wrong one gets followed. When something in this skill contradicts
`CLAUDE.md`, `CLAUDE.md` wins — and the contradiction is a bug in this file.

## Skill routing already exists

`CLAUDE.md` has a routing table mapping each task to exactly one skill, with an
explicit "avoid duplicate loads" rule and an `Avoid` column. Use it. Adding a
parallel skill for Next.js, shadcn, Postgres, or auth would create the duplicate
loading that table exists to prevent.

Externally pinned skills live in `skills-lock.json` with hashes — they are
fetched, not authored here.

## Known documentation drift

Verified 2026-08-29. These gaps are real; treat the code as authoritative.

1. **`CLAUDE.md` says "Deploy: Vercel".** True for the web app, incomplete
   overall — `railway.cron.json` deploys a standalone cron service on Railway
   under Nixpacks. Two deployment targets, not one.

2. **BullMQ and Redis are not in the stack table.** `bullmq@^5.80.2` and
   `ioredis@^5.11.1` are dependencies, and `src/server/queue/` holds the queue,
   worker, and job definitions. The cron architecture depends on them.

Worth fixing in `CLAUDE.md` rather than carrying here.

## Architecture worth holding in mind

The cron service is the piece most likely to be misunderstood.

```
cron service (Railway)  ──enqueue cron:*──►  Redis/BullMQ  ──►  web app
   publishes only                                                executes sweeps
   no DB access                                                  DB, S3, SES
```

Four sweeps, and **exactly one scheduling path may be active per deployment**:

1. Vercel Cron → `GET /api/cron/*`, runs sweeps inline. Also the manual path;
   `?dryRun=1` reports counts without writing.
2. Embedded scheduler → `src/server/cron/embedded.ts`, booted from
   `src/instrumentation.ts`. Defaults on when `VERCEL` is unset.
3. Standalone cron service → Railway, publish-only.

Running two at once double-executes sweeps. `docs/cron-service.md` has the
detail.

## Commands that matter

```bash
pnpm dev              # next dev --turbopack
pnpm build            # next build --turbopack
pnpm test             # vitest run
pnpm lint             # eslint

pnpm db:generate      # drizzle-kit generate
pnpm db:migrate       # drizzle-kit migrate

pnpm e2e              # full stack in Docker
pnpm e2e:up           # bring the environment up
pnpm e2e:seed         # seed it
pnpm e2e:down         # tear down, remove volumes

pnpm build:cron       # build the standalone cron bundle
pnpm start:cron       # run it
```

`vercel-build` runs `check-migration-order.mjs` before migrating — migration
order is enforced at build time, so a mis-ordered migration fails the deploy
rather than the database.

## Working rules

1. **Read `CLAUDE.md` before touching anything.** It is long because the domain
   is genuinely complicated — five payment providers, two of which are the same
   vendor with unrelated products.

2. **Payments are the highest-risk area in the repo.** Signature schemes differ
   per provider, field order is the contract, and one provider verifies the
   ACK body. Never modify a provider without reading its section in full.
   Never call a provider from the client.

3. **Verify before reporting.** `pnpm test` and `pnpm lint` at minimum;
   `pnpm e2e` for anything touching checkout, seating, or scanning.

4. **Schema changes go through Drizzle migrations.** Never hand-edit the
   database. `db:generate` then review the SQL before `db:migrate`.

5. **Follow the existing PR flow.** 539 merged PRs means the conventions are
   established — match them rather than inventing a style.

6. **Ticketing correctness beats feature velocity.** Overselling, double-scans,
   and orphaned seat holds are the failures that cost real money and trust.
   `src/server/seating/holds.ts` and `src/server/tickets/scan.ts` carry tests
   for a reason.

## References

- `references/operations.md` — deploy topology, environments, incident checks
