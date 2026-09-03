---
name: creasion-maintenance
description: Maintain CreasionApp — headless social publishing API/MCP layer.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [creasion, nextjs, social-api, paddle, mcp, tiktok, instagram, linkedin, youtube]
---

# Maintaining CreasionApp

Headless social publishing layer. Connect social accounts once, then publish
through an Open REST API or a hosted MCP server — from n8n, Zapier, or your own
agent. Deliberately no dashboard bloat and no built-in AI: the wedge is
developer-first connectivity for automation stacks.

**Repo:** `~/projects/creasionapp` → `github.com/gusmanwidodo/creasionapp`
(private)

## Read the repo's context first

| File | Holds |
|---|---|
| `docs/00-index.md` | The PRD as an artifact pyramid — product decisions locked with the stakeholder |
| `CLAUDE.md` | Stack and conventions **(stale — see below)** |
| `docs/integrations/` | Per-platform integration notes |
| `docs/*-setup.md`, `docs/*-submission.md` | Platform app-review material |

The PRD is the product source of truth. Decisions there were locked on
2026-08-27 and should not be quietly relitigated in code.

## Known drift: CLAUDE.md is still the template's

`CLAUDE.md` is titled **"Project: SaaS Starter Template"** — it was inherited
when the project was spawned from `saas-starter` and never rewritten. Its
conventions still broadly apply, but it describes no Creasion-specific
architecture: nothing about the publish adapters, Paddle, MCP, or the platform
review situation.

Worth rewriting. Until then, the code and `docs/` outrank it.

## Architecture that matters

**Publish adapters.** `src/lib/publish/` is the core abstraction:

```
adapter.ts     PublishAdapter interface, PublishResult union, registry helpers
registry.ts    registerAdapters() — one line per platform, idempotent
publisher.ts   orchestration
{tiktok,instagram,linkedin,youtube}-adapter.ts
```

Adding a platform means writing an adapter and adding one line to
`registerAdapters()`. Keep it that way — platform-specific branching anywhere
else defeats the design.

`PublishResult` is a discriminated union of `PublishSuccess | PublishFailure`.
Handle both; a partial failure across platforms is a normal outcome, not an
exception.

**Two consumer surfaces.** The REST API and the MCP server (`src/lib/mcp/`)
both sit on the same publish layer. A change to publishing semantics affects
both — check both before shipping.

**Auth and accounts.** Better Auth for users; `src/lib/accounts.ts` for the
connected social accounts, which hold provider tokens. Those tokens are
credentials: never log them, never return them from an API route.

## The blocking constraint: platform app review

Publishing is **gated behind approval from each platform**, and as of
2026-08-29 that approval is still in progress. `docs/meta-app-review-submission.md`
records publishing as "currently blocked — unapproved permissions are rejected".

| Platform | Gate |
|---|---|
| TikTok | Audit before public posting; unaudited apps post privately only |
| Meta (IG) | App review for content-publish permissions |
| YouTube | Google OAuth verification, including a demo video |
| LinkedIn | Product approval decides which scopes can be requested |

**Consequences for the work:** an end-to-end publish cannot be verified against
production APIs yet. Do not claim a platform "works" on the strength of code
review — say which stage its approval is at.

This also means review material in `docs/` is load-bearing. Screencast briefs
and submission documents are part of shipping, not paperwork.

## Deploy

Railway, `railway.json`:

- Builder **Railpack**
- `preDeployCommand`: `node scripts/migrate-prod.mjs` — migrations run before
  the new version starts
- `startCommand`: `node .next/standalone/server.js`
- Restart on failure, max 3 retries

`pnpm build` runs `next build` then `copy-standalone-assets.mjs`, because
`next build` does not copy `public/` or `.next/static/` into the standalone
bundle. Removing that step ships an unstyled app.

## Commands

```bash
pnpm dev
pnpm build          # next build + standalone asset copy
pnpm typecheck
pnpm verify         # the automated quality gate
pnpm verify:loop    # iterate until it passes
pnpm db:generate
pnpm db:migrate
```

`verify/` is the same harness used across the portfolio. **Do not weaken a
check to make it pass** — it exists because these bugs shipped once already.

`AGENT=opencode pnpm verify:loop` runs iterations on the flat-rate OpenCode Go
subscription instead of Claude Code.

## Two clones on this machine

`~/projects/creasion` (76 commits) and `~/projects/creasionapp` (79 commits)
both point at the same remote. **`creasionapp` is ahead** — work there. The
older clone has an uncommitted change and is a merge conflict waiting to happen.

## Working rules

1. Read `docs/00-index.md` before proposing product changes — decisions there
   were locked with the stakeholder.
2. New platform → new adapter + one registry line. Nothing else.
3. Provider tokens are credentials. Never logged, never returned.
4. Verify with `pnpm verify` before claiming done.
5. State the approval stage honestly instead of implying a platform is live.
6. Paddle webhooks: verify the signature before any database write.
