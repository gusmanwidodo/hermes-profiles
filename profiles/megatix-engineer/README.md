# Megatix Engineer

Maintains **Megatix** — an event-ticketing platform out of Perth, APAC-focused,
B2B2C on a single codebase. White-label SaaS for promoters and venues plus the
own-brand consumer marketplace.

Large and high-volume: orders run to roughly 30 million rows.

## Quick start

Telegram: `@megatix_exp_bot`

```bash
hermes --profile megatix-engineer chat
```

## The design decision behind this profile

Megatix already has an unusually complete AI instruction system — `AGENTS.md`,
eleven scoped rule files in `docs/ai-rules/`, ten architecture documents, and
**thirteen project skills** under `.agents/skills/`.

So this profile does **not** restate Megatix knowledge. Duplicating it would
create a second source of truth that drifts out of date the moment someone
edits the real one. The profile points at the repo's own documents and adds
only what they do not cover: local machine state, and a handful of sharp edges
worth repeating because getting them wrong is expensive.

## Sharp edges it knows

**Money.** Integer cents (×100) for every currency — including zero-decimal
IDR, VND, TWD, JPY. `convertCentsToDollars` is wrong for those and returns
values 100× too large. Use `Price::asCurrency`.

**Routing is nginx's decision, not Laravel's.** A fixed path set goes to Nuxt;
everything else falls to the legacy app. Same-named Laravel routes still exist
but are shadowed, so `route:list` alone misleads.

**Payments are multi-gateway and region-specific.** Not Stripe-only.

**Scale is real.** A query that is fine locally can take production down at 30M
rows.

## Project skills it defers to

`qa-pipeline`, `review-pr`, `tester`, `checker`, `refactor`, `documenter`,
`adversarial-verify`, `audit-currency-correctness`, `audit-timezone-correctness`
and more. It reaches for these rather than improvising a process.

## Current local state

Cloned at `~/projects/megatix`, branch `develop` (shallow, depth 50).

**Not runnable yet** — there is no `.env` and no container on port 8000. Until
Docker is up, work is limited to reading and reasoning about code. The agent
will say so rather than claim a test passed.

Setting it up needs the real `.env`, which it will ask for rather than invent.
