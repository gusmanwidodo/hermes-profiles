# Creasion Engineer

Maintains CreasionApp — a headless social publishing layer. Connect accounts
once, publish through an Open REST API or a hosted MCP server from n8n, Zapier,
or your own agent.

No dashboard bloat, no built-in AI. The wedge is developer-first connectivity
for automation stacks.

## Quick start

Telegram: `@creasion_eng_bot`

```bash
hermes --profile creasion-engineer chat
```

## What it knows that the repo does not say

**`CLAUDE.md` is stale.** It is still titled "Project: SaaS Starter Template" —
inherited when the project was spawned and never rewritten. Its conventions
broadly apply, but it describes none of Creasion's actual architecture: no
publish adapters, no Paddle, no MCP, no platform review situation. The code and
`docs/` outrank it until someone rewrites it.

**Two clones exist on this machine.** `~/projects/creasion` (76 commits) and
`~/projects/creasionapp` (79 commits) share one remote. **Work in
`creasionapp`** — it is ahead, and the older clone has an uncommitted change
sitting in it.

## The constraint that shapes everything

Publishing is gated behind app review at every platform, and as of 2026-08-29
none of it has landed:

| Platform | Gate |
|---|---|
| TikTok | Audit required; unaudited apps post privately only |
| Meta (Instagram) | App review for content-publish permissions |
| YouTube | Google OAuth verification, demo video included |
| LinkedIn | Product approval determines requestable scopes |

`docs/meta-app-review-submission.md` records publishing as "currently blocked —
unapproved permissions are rejected".

So the agent will not tell you a platform works because the adapter compiles. It
names the approval stage instead. And it treats the submission material in
`docs/` as shipping work, not paperwork — those documents are what unblock the
product.

## Architecture

`src/lib/publish/` is the core. A `PublishAdapter` per platform, registered one
line at a time in an idempotent `registerAdapters()`. `PublishResult` is a
`PublishSuccess | PublishFailure` union — partial failure across platforms is a
normal outcome, not an exception.

Adding a platform means one adapter and one registry line. Platform branching
anywhere else defeats the design.

The REST API and the MCP server both sit on this layer, so a publishing change
touches both.

## Deploy

Railway with Railpack. Migrations run in `preDeployCommand` before the new
version starts. `pnpm build` includes `copy-standalone-assets.mjs` — removing it
ships an unstyled app, because `next build` does not copy `public/` or
`.next/static/` into the standalone bundle.

## Verification

`verify/` — the same harness used across the portfolio.

```bash
pnpm verify                      # one pass
pnpm verify:loop                 # iterate until green
AGENT=opencode pnpm verify:loop  # flat-rate OpenCode Go instead of Claude
```

Weakening a check to make it pass is off limits. Each assertion is there
because that bug shipped once.
