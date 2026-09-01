# Bigevent Engineer

Maintains the bigevent ticketing platform — event and ticket sales with rich
artist management behind it.

## The design decision worth knowing

This profile deliberately does **not** carry skills for Next.js, shadcn,
Postgres, or auth. The repo already has them.

`bigevent/CLAUDE.md` runs ~25,000 characters and includes a skill routing table
with an explicit "use ONE per task — avoid duplicate loads" rule and an `Avoid`
column. `skills-lock.json` pins external skills by content hash. A parallel set
of skills here would create exactly the duplicate loading that table exists to
prevent, and two copies of a guardrail drift apart until the wrong one gets
followed.

So this profile reads the repo's context as the source of truth and adds only
what is genuinely missing from it.

## What it adds

**The deploy topology.** `CLAUDE.md` says Vercel; that covers the web app.
`railway.cron.json` also deploys a standalone cron service on Railway under
Nixpacks. Two targets, and a root `Dockerfile` silently switches Railway off
Nixpacks — commit `b5dc7d0` renamed the E2E Dockerfile for that reason.

**The scheduling constraint.** Four sweeps can be driven three ways — Vercel
Cron, an embedded scheduler, or the Railway service — and exactly one may be
active per deployment. The embedded one defaults **on** whenever `VERCEL` is
unset, which is the easy way to end up double-executing every sweep.

**Verification before shipping.** `pnpm test`, `pnpm lint`, and `pnpm e2e` for
anything touching checkout, seating, or scanning.

## Quick start

Telegram: `@bigevent_eng_bot`

```bash
hermes --profile bigevent-engineer chat
```

## Documentation drift found

Verified 2026-08-29 — the code is authoritative where these disagree:

1. `CLAUDE.md` lists Vercel as the deploy target; Railway also runs the cron
   service
2. BullMQ (`^5.80.2`) and ioredis (`^5.11.1`) are dependencies with a queue in
   `src/server/queue/`, but do not appear in the stack table

Both are worth fixing in `CLAUDE.md` rather than carrying as skill notes.

## Priorities

Ticketing correctness over feature velocity. Overselling, double-scans, and
orphaned seat holds cost real money and trust — `src/server/seating/holds.ts`
and `src/server/tickets/scan.ts` carry tests because of it.

Payments are the highest-risk area in the repo: five providers, two of which are
the same vendor shipping unrelated products with different credentials,
signatures, and webhook semantics. Read the provider's section in `CLAUDE.md` in
full before touching it.
