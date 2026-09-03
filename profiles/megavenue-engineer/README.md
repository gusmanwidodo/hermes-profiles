# Megavenue Engineer

Maintains the Megavenue project — NestJS API, Next.js, a Vite/React/TanStack
SPA, Better Auth, Postgres, Redis, BullMQ, S3 and SES, Xendit payments.

## Important: the codebase has not been seen yet

As of 2026-08-29 there is no Megavenue checkout under `~/projects/` and no
repository by that name under `gusmanwidodo`. The skill this profile carries is
honest about that — it contains registry-verified version facts and a list of
open architecture questions, not invented conventions.

**Clone the repo, then ask this agent to read it and update its own skill.**
Guessing at a codebase produces confident, wrong instructions, which is worse
than none.

## Quick start

Telegram: `@megavenue_eng_bot`

```bash
hermes --profile megavenue-engineer chat
```

## Stack versions — verified 2026-08-29

| Package | Latest | Node floor |
|---|---|---|
| `@nestjs/core` | **12.0.1** | ≥ 20 |
| `next` | 16.3.4 | ≥ 20.9 |
| `vite` | 8.2.2 | ^20.19 \|\| ≥22.12 |
| `@tanstack/react-query` | 5.102.8 | — |
| `@tanstack/react-router` | 1.170.32 | ≥ 20.19 |
| `better-auth` | 1.7.2 | — |
| `bullmq` | 6.3.4 | ≥ 14.17 |
| `xendit-node` | 7.0.0 | ≥ 18 |

The project may pin older versions — the lockfile decides, not this table.

**NestJS 12 shipped 2026-08-27**, two days before this was written: ESM-ready
packages, Standard Schema validation, a rebuilt CLI, and `@nestjs/observe`.
CommonJS keeps working. The `modern-web-frameworks` skill was still on 11.2.1
and has been corrected.

**BullMQ 6** is a major bump from the 5.x line bigevent runs — behaviour does
not automatically transfer.

## Open architecture questions

The stack list implies a monorepo, but the shape needs confirming from code:

1. NestJS and Next.js together — which owns the API, which owns the public site?
2. A Vite/React/TanStack SPA alongside Next.js — admin dashboard?
3. Better Auth across several apps — where do sessions and auth tables live?
4. Redis — BullMQ broker only, or cache and sessions too?
5. Xendit — which payment products, and where is webhook verification?

## Highest-risk surfaces

**Payments.** Xendit authenticates webhooks with `x-callback-token`. Verify
before any database write, never after, and never call the provider from client
code. `~/projects/bigevent/src/server/payments/` has a working Xendit
implementation worth reading before writing a new one.

**Queues.** A BullMQ queue with no running worker accepts jobs and silently does
nothing. If a scheduler exists, exactly one instance may own it — two
double-execute every repeating job, which is precisely the trap bigevent's cron
design had to be built around.
