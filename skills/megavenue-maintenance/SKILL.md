---
name: megavenue-maintenance
description: Maintain the Megavenue project — stack facts and verification discipline.
version: 0.1.0
license: MIT
metadata:
  hermes:
    tags: [megavenue, nestjs, nextjs, vite, tanstack, bullmq, xendit, postgres]
---

# Maintaining Megavenue

**Status: the codebase has not been inspected yet.** As of 2026-08-29 there is
no Megavenue checkout under `~/projects/` and no repository by that name under
`gusmanwidodo`. Everything below is either verified against a package registry
or explicitly marked as an open question.

This file must be revised the moment the repo lands. Guessing at a codebase's
conventions produces confident, wrong instructions — worse than no instructions.

## First: read the repo, not this file

When the code arrives:

1. Read `CLAUDE.md`, `AGENTS.md`, or `README.md` if present — a project's own
   context outranks anything here.
2. Read `package.json` (all of them, if it is a monorepo) to learn the real
   dependency versions rather than the latest published ones.
3. Check for a `skills-lock.json` or similar pinning mechanism.
4. Only then update this skill with what was actually found.

If the project carries its own routing table or guardrails, defer to it and
delete the overlapping parts of this file. Two sources of truth drift apart
until the stale one gets followed.

## Stack — versions verified 2026-08-29

Latest published versions, from npm. **The project may pin older ones** — read
its lockfile before assuming.

| Package | Latest | Node floor |
|---|---|---|
| `@nestjs/core` | 12.0.1 | ≥ 20 |
| `next` | 16.3.4 | ≥ 20.9 |
| `vite` | 8.2.2 | ^20.19 \|\| ≥22.12 |
| `@tanstack/react-query` | 5.102.8 | — |
| `@tanstack/react-router` | 1.170.32 | ≥ 20.19 |
| `better-auth` | 1.7.2 | — |
| `bullmq` | 6.3.4 | ≥ 14.17 |
| `xendit-node` | 7.0.0 | ≥ 18 |
| `drizzle-orm` | 0.45.2 | — |

Re-verify with:

```bash
curl -s https://registry.npmjs.org/<pkg>/latest | jq -r '.version, .engines.node'
```

## Version notes that matter

**NestJS 12** shipped 2026-08-27 — days before this was written. ESM-ready
packages, first-class Standard Schema support for validation and serialization,
a rebuilt CLI, and native observability through `@nestjs/observe`. CommonJS apps
keep working; ESM migration is optional. Upgrade the CLI first
(`npm i -g @nestjs/cli@latest`) because the upgrade command ships with it.

Carried over from **NestJS 11**: Express v5 is the default and its router
rejects a bare `*` — use `*splat` or `{*splat}`. Node 16 and 18 are dropped.

**BullMQ 6** is a major bump from the 5.x line used elsewhere in this portfolio
(bigevent runs 5.80.2). Do not assume behaviour transfers between them.

**Vite 8** requires Node ^20.19 or ≥22.12 — stricter than most of the stack.
Node 24 is installed on this workstation, so this is satisfied.

## Open architecture questions

These need answering from the code, not assumed:

1. **NestJS *and* Next.js together** — most likely a monorepo: NestJS as the
   API, Next.js as a public/marketing surface. Which owns what?
2. **Vite + React + TanStack alongside Next.js** — typically a separate SPA
   (admin or dashboard) next to the Next.js app. Confirm before touching either.
3. **Better Auth across multiple apps** — where does the session live, and which
   app owns the auth tables?
4. **Redis** — BullMQ broker only, or also caching and sessions?
5. **Xendit** — which products (VA, e-wallet, QRIS, retail, cards), and where is
   webhook verification implemented?

## Payments: the highest-risk area

Xendit webhooks authenticate with the `x-callback-token` header. Two rules that
hold regardless of framework:

- **Verify the token before any database write.** Never after.
- **Never call the payment provider from client code.**

`bigevent` already implements Xendit alongside four other providers. Read
`~/projects/bigevent/src/server/payments/` for a working reference rather than
starting from the vendor docs.

## Queue discipline

BullMQ needs a worker process actually running — a queue with no consumer
accepts jobs silently and does nothing. When jobs "disappear", check the worker
first, then Redis connectivity, then the job data.

If there is a scheduler, exactly one instance should own it. Two schedulers
double-execute every repeating job. This is the failure mode that bit bigevent's
cron design, and it is easy to reproduce accidentally in a monorepo where both
the API and a worker boot the same module.

## Verification before reporting

No claim of "it works" without evidence:

- Type-check and build both pass
- Tests run, not assumed
- For payments: webhook signature verification exercised, not eyeballed
- For queues: a job enqueued and observed being consumed

## SOURCES

- npm registry, 2026-08-29 — version and engine data
- NestJS v12.0.0 release notes, published 2026-08-27
- `~/projects/bigevent/src/server/payments/` — working Xendit implementation
