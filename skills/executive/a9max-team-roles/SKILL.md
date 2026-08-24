---
name: a9max-team-roles
description: "Use for A9MAX projects. Role boundaries + RACI."
version: 1.0.0
author: CEO (A9MAX)
license: MIT
metadata:
  hermes:
    tags: [Team, Coordination, RACI, Multi-Agent, A9MAX]
---

# A9MAX Team Roles & Boundaries

The A9MAX team is a multi-bot Hermes org in one Telegram group. Each bot is a
separate session with its own SOUL. Without strict role boundaries, bots
duplicate work (see the pos-fnb incident: 4 duplicate repo clones). This skill
is the single source of truth for **who does what** and **who decides what**.

## Operating Model: STRICT HIERARCHY

```
              CEO  — strategy, final calls, cross-domain coherence
             /          \
       CTO           PM        — architecture / spec (the "how" / the "what")
             \          /
    Backend       Frontend     — execution only
```

Handoff flows **one direction, top-down**. Execution bots do NOT make
architecture or scope decisions; they escalate up.

## Ownership Matrix (RACI)

| Activity | CEO | CTO | PM | Backend | Frontend |
|---|---|---|---|---|---|
| Vision / strategy / final call | **A/R** | C | C | I | I |
| Product spec / PRD / scope / prioritization | C | C | **A/R** | I | I |
| Tech stack decision | A | **R** | C | C | C |
| Architecture / ADR | A | **A/R** | C | I | I |
| **Repo scaffold / init / monorepo structure** | I | **A/R** | I | I | I |
| API / server / DB implementation | I | A | I | **A/R** | I |
| UI / client / dashboard implementation | I | A | I | I | **A/R** |
| Push / PR to GitHub | I | I | I | **R** (branch) | **R** (branch) |

A=Accountable (owns it), R=Responsible (does it), C=Consulted, I=Informed.

## Hard Boundaries (never cross)

1. **Only CTO scaffolds/initializes a repo and defines the monorepo structure**
   (e.g. `apps/api`, `apps/dashboard`). Backend & Frontend fill in their app
   directory — they never create the repo or top-level structure.
2. **Only PM writes specs/PRDs.** Engineers implement to spec; they don't
   invent scope. If spec is missing/ambiguous → escalate to PM.
3. **Only CTO decides tech stack & architecture.** Engineers may propose
   (Consulted) but never override. Stack change → escalate to CTO.
4. **Backend owns server-side only** (API, service logic, DB access, migrations).
   **Frontend owns client-side only** (UI, state, API integration, layouts).
   The API contract is the boundary between them — CTO/PM define it.
5. **CEO owns cross-domain trade-offs** and is the only one who resolves
   conflicts between CTO and PM.

## Anti-Duplication Protocol (project init from the group)

When a project is initiated in the A9MAX group, BEFORE any bot starts work:

1. **CEO coordinates first.** Check whether the dir/repo already exists
   (`find ~/projects -iname '*<name>*'`, `git ls-remote`). Never assume a
   clean slate.
2. **One project = one canonical location** (`~/projects/<name>`) + **one
   remote repo**. No per-bot clones in scattered paths.
3. **CTO scaffolds once**, pushes the base structure + branch protection.
4. **Each bot works on its own branch** against the SAME working copy /
   remote — Backend on `feat/...-api`, Frontend on `feat/...-dashboard`, etc.
5. Bots open PRs to `main`; CEO/CTO review for coherence before merge.

## Escalation Rules

- Engineer blocked by missing spec → **PM**.
- Engineer disagrees with architecture/stack → **CTO** (propose, don't override).
- CTO ⇄ PM conflict (scope vs feasibility) → **CEO**.
- Anything that changes strategy or budget → **CEO**.

## Current Bot Roster

| Bot | Role | Domain |
|---|---|---|
| (ceo profile) | CEO | Strategy, coordination, final calls |
| @cto_a9max_bot | CTO | Architecture, stack, ADR, **repo scaffold** |
| @pm_a9max_bot | PM | Spec, PRD, prioritization, roadmap |
| @be_a9max_bot | Backend Engineer | API, service logic, DB, migrations |
| @fe_a9max_bot | Frontend Engineer | UI, state, client, dashboard |

## Conventions (all bots)

- All deliverables/docs in **English** (chat stays Indonesian).
- Completed coding work MUST be pushed / opened as a PR (verify real URL).
- Default stack: Next.js/TS + Postgres + Drizzle. Special tasks may override
  (e.g. Laravel + Flutter + Vite/React) — CTO confirms per project.
