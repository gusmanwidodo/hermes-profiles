---
name: megavenue-apps-development
description: Build Megavenue apps/extensions on the marketplace API tier.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [megavenue, apps, marketplace, extension, nestjs, api, scopes]
---

# Megavenue Apps — building on the extension surface

Developing apps and extensions that extend Megavenue through its public API,
installed and authorised per venue.

## Read these first — they are the source of truth

This skill is deliberately thin. The repo documents itself better than a
parallel copy could, and a second source of truth drifts.

| Path | What it holds |
|---|---|
| `~/projects/megavenue/CLAUDE.md` | stack, commands, architecture, conventions |
| `~/projects/megavenue/docs/plans/megavenue-apps-marketplace.md` | **the marketplace plan — 210 lines, decisions locked** |
| `~/projects/megavenue/docs/plans/venue-open-api.md` | the existing `/v1/open/*` tier, 15.7 KB |
| `megavenue-api/src/open/open.module.ts` | the CASL-bypass instruction that shapes the design |

Read the marketplace plan before proposing anything. Five open questions are
already answered in it; re-deciding them wastes the work and contradicts the
owner.

## Which clone to work in

**`~/projects/megavenue`** — 965 commits, currently on branch
`docs/apps-marketplace`. This is the one carrying the marketplace work.

`~/projects/megavenue-2` is a second clone at 882 commits on a different feature
branch. Same remote (`git@github.com:megavenue/megavenue.git`). Do not work
there for apps development — you will branch from a tree that lacks the plan.

## The state of the surface, measured 2026-10-09

**Exists:**

```
/v1/open/*          5 controllers, 7 GET endpoints, 0 writes
                    (availability, bookings, memberships, passes, zones)
tenant_api_keys     one active key per venue, rotatable, SHA-256 hashed
ApiKeyGuard         the key IS the tenant context
Settings > API Integration   dashboard surface, real service
```

**Does not exist yet** — verified, `megavenue-api/src/apps/` is absent and the
schema has no `apps` table:

```
apps / app_installations / app_credentials    tables
AppKeyGuard                                   the scoped guard
/v1/apps/*                                    the scoped tier
Settings > Apps                               install flow + consent screen
admin/apps                                    platform review page
```

So anything about installations, scopes, or consent screens is **design, not
code**. Say so rather than implying it can be called today.

## The architectural property that must not break

`ApiKeyGuard` synthesises `request.user.activeTenantId`. That means **a tenant
id is never accepted from the request**, and every tenant-filtered service keeps
working unchanged.

`AppKeyGuard` must do exactly the same. Any design where an app passes a tenant
id is wrong, however convenient.

## Two authorisation models, on purpose

`/v1/open/*` carries this in its module:

> CASL is intentionally bypassed here. Never add `@Can`/`@CheckPolicies` to a
> controller in this module; the key to tenant binding performed by
> `ApiKeyGuard` IS the authorization.

That is correct for one trusted key per venue, and wrong for several
third-party apps holding different permissions. The marketplace therefore adds a
**second** model beside it rather than changing the first.

**One production key is in active use.** Changing the open tier's semantics
underneath it is not acceptable. Leave it alone.

## Scopes

Named after the dashboard's existing permission catalog, so an operator reading
a consent screen sees vocabulary they recognise:

```
bookings:read   zones:read        contacts:read   contacts:write
passes:read     availability:read notes:write     segments:read
memberships:read
```

Two rules that are hard to retrofit, both already decided:

1. **A scope can never exceed what the installing user holds.** An app installed
   by a staff member cannot read what that staff member cannot read.
2. **Write scopes are granted and listed separately.** Read and write are never
   bundled on the consent screen.

## The phase order, and why it is not negotiable

```
1. registry + installation, first-party only
2. AppKeyGuard + /v1/apps/* read scopes
3. the CRM as the first installed app
4. write scopes + attribution
5. external developer registration
6. plans and billing
```

Each phase leaves the product working and is independently abandonable.

**Writes wait for attribution.** Every write through an app must record which
app made it — without that a venue cannot answer "why did this contact change"
and a misbehaving app cannot be suspended with evidence. That is why phase 4
follows phase 3 instead of shipping with it.

**Billing is deferred deliberately.** `apps.plans` is jsonb from day one so the
shape is not a later migration, but metering before a second app and a paying
venue is building for an imagined customer.

## The hard constraint on contacts

From the plan, and it is a blocker not a preference:

> **No third-party app may hold a contacts scope until #778 ships**, and the
> registry should enforce it rather than rely on review.

Reason: consent, unsubscribe, and SES bounce handling do not exist, and
production holds 52 duplicate phone groups. An external app with `contacts:read`
inherits all of it.

## Working in this repo

Three independent apps, **no workspace manager** — always `cd` into the app
before running anything. pnpm everywhere.

```bash
cd ~/projects/megavenue/megavenue-api
pnpm run dev                  # watch
pnpm run test                 # jest, coverage enforced: 80% lines, 65% branches
pnpm run migration:generate   # after editing src/database/schema/
pnpm run migration:check      # verify ordering
```

Containers are already running: api `:3001`, tenant `:3000`, postgres `:5432`,
redis `:6379`.

Migrations are **generated, never hand-written**. One file per table in
`src/database/schema/`, exported via `schema/index.ts`. IDs are UUIDv7.

## Pitfalls

- **`ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`.** An undeclared
  DTO field is rejected, not ignored. New request fields MUST be added to the
  DTO or the request fails with no obvious cause.
- **The permission catalog is mirrored on the client** in
  `megavenue-app/src/lib/ability.ts` + `permission-catalog.ts`. Adding a
  permission on the API without the dashboard side leaves them out of sync.
- **Never edit `routeTree.gen.ts`** in megavenue-app — generated.
- **Never write a tenant-scoped query without the tenant filter.** Isolation is
  application-level; Postgres RLS is staged but currently passes everything.
- **Do not touch the git index** unless asked. The repo's CLAUDE.md states this
  explicitly: reviews are read-only, leave changes unstaged.
- Error bodies carry a machine-readable `code` that frontends match on
  (`PROMO_NOT_FOUND`). New failure modes need a code, not just a message.

## What not to claim

The marketplace is **a plan with a real foundation underneath it**, not a
shipped feature. When asked what an app can do today, the honest answer is: read
7 GET endpoints with a venue-wide key, through `/v1/open/*`. Everything else is
designed and unbuilt.
