---
name: megatix-maintenance
description: Maintain the Megatix ticketing platform — routing, local setup, verification.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [megatix, laravel, vue, nuxt, ticketing, php]
---

# Maintaining Megatix

Event-ticketing platform out of Perth, APAC-focused. B2B2C on one codebase:
white-label SaaS for promoters and venues, plus the own-brand marketplace.
Large and high-volume — orders run to roughly 30 million rows.

**Repo:** `~/projects/megatix` → `github.com/megatix/megatix` (private)
**Default branch:** `develop` — not `main`.

## Read the repo's own instructions first

This project has an unusually complete AI instruction system. **It is the source
of truth. Do not duplicate it here, and do not contradict it.**

| Path | Holds |
|---|---|
| `AGENTS.md` | Entry point. `CLAUDE.md` is a symlink to it. |
| `docs/ai-rules/project-facts.md` | Always-applied: scale, currencies, the five frontend apps, Docker |
| `docs/ai-rules/*.mdc` | Scoped rules — php, api, vue2, vue3-nuxt, frontend, tests, sentry, tickets-v2 |
| `docs/architecture/` | Order lifecycle, settlements, currency, tables map, key paths, seated events |
| `.agents/skills/` | **13 project skills** — the code-quality pipeline |

Rules live in `docs/ai-rules/`; `.cursor/rules/*.mdc` are symlinks back to them.
Edit the source, never a copy.

## The project's own skills — prefer these

`.agents/skills/` already covers most maintenance work. Use them instead of
improvising:

`qa-pipeline`, `qa-pipeline-lite`, `review-pr`, `tester`, `checker`,
`refactor`, `documenter`, `guide-writer`, `feature-method`,
`adversarial-verify`, `grill-me`, `audit-currency-correctness`,
`audit-timezone-correctness`

Two of those exist because the bugs they hunt are real and recurring: currency
and timezone correctness.

## Sharp edges worth stating twice

**Money.** Amounts are integer cents (×100) for **every** currency — including
the zero-decimal ones (IDR, VND, TWD, JPY). Storage never varies, so the one
correct display is always ÷100. `convertCentsToDollars` **is wrong** for
IDR/VND/TWD and omits JPY, returning values 100× too large. Use
`Price::asCurrency`. Never hand-roll currency math.

**Routing is decided at nginx, not Laravel.** A fixed set of paths goes to Nuxt
(`megatix-ssr`, :8003); everything else falls to the legacy `megatix2020` app
(Octane, :8002). Many same-named Laravel routes still exist but are shadowed,
so **`route:list` alone is misleading**. Source of truth:
`docker/release/website/nginx/includes/nuxt-locations`.

**Payments are multi-gateway and region-specific.** Do not assume Stripe.
Config in `config/*.php`, logic in `App\Megatix\Billing`.

**Scale is not theoretical.** Orders ~30M rows. Payment, order, and settlement
code needs bounded/paginated queries and N+1 awareness — a query that is fine
locally can take production down.

## Five frontend apps — know which owns a change

- `dashboard` — promoter back-office (Vue 2)
- `white-label` — embeddable checkout widget (Vue 2)
- `pos` — box office / on-door sales (Vue 2)
- `megatix-ssr` — modern public site (Nuxt 3)
- `megatix2020` — legacy Laravel Blade + Vue 2

They are separate apps. Do not share code except through existing shared
components.

## Framework depth

Two eras live in this repo and they need different expertise.

**Laravel 10.47 / PHP 8.1 — the modern-Laravel trap.** Much of what current
Laravel documentation shows does not exist here. Laravel 11's slimmed skeleton,
`bootstrap/app.php` middleware registration, per-second rate limiting, and the
Laravel 12 additions are all absent. Advice written for Laravel 12 or 13 applied
to this codebase produces code that does not run. Check what version a feature
landed in before proposing it.

What is available and idiomatic here: Eloquent with eager loading discipline,
`chunkById` and lazy collections for the large tables, queued jobs, Octane
(which means **state leaks between requests** — static properties and singletons
holding request data are real bugs), Pest/PHPUnit via the Docker container.

**Vue 2.7 in three apps, Nuxt 3 in one.** Vue 2.7 is the final 2.x release —
end-of-life since December 2023. It backports `setup()` and composables, so
composition-style code is possible, but the ecosystem around it is frozen.
Vuex 3, not Pinia. The Options API is the norm. Do not suggest Vue 3 syntax
(`<script setup>` with Vue 3 semantics, Teleport, Suspense, multiple root nodes)
in `resources/` — it will not compile.

`megatix-ssr` is the opposite: Nuxt 3.14, Vue 3, TypeScript, auto-imports,
server routes, SSR. Composition API with `<script setup>` is correct there.
**Know which app a file belongs to before writing a single line of Vue** — the
same syntax is right in one and broken in the other.

For the current-versus-latest gap, migration ordering, and what to check before
giving upgrade advice, load `references/stack-versions.md`.

## Commands

Everything PHP runs **inside Docker**, with a dynamic container id:

```bash
docker exec -it $(docker ps | grep "0.0.0.0:8000" | awk '{print $1}') <cmd>

# tests — xdebug off is mandatory, it is drastically slower otherwise
docker exec -it $(docker ps | grep "0.0.0.0:8000" | awk '{print $1}') \
  php -d xdebug.mode=off artisan test --parallel --filter=YourTest
```

Polyglot monorepo — run only the toolchain for what the diff touches:

| Touched | Lint | Test | Build |
|---|---|---|---|
| `app/` `routes/` `database/` `config/` | (Pint not configured) | artisan test in Docker | n/a |
| `resources/` | `npm run lint-diff:resources` | no JS runner — lint + build clean | `npm run build` |
| `megatix-ssr/` | `npm run lint-diff:nuxt` | no JS runner — lint + build clean | `cd megatix-ssr && npm run build` |

**Pint is not configured. Do not try to use it.**

## Local state on this machine (2026-09-11)

- Cloned shallow (`--depth 50`) at `~/projects/megatix`, branch `develop`
- **No `.env`** — the app has never been set up locally
- **No container running on :8000** — so no PHP command can execute yet
- PHP ^8.1, Laravel ^10.47

Until Docker is up, work is limited to reading code and reasoning about it.
Anything claiming a test passed would be a lie. Setting up requires the real
`.env` — ask rather than invent one.

## Working rules

1. Read `AGENTS.md` and the scoped `.mdc` for the files being touched.
2. Reach for a `.agents/skills/` skill before improvising a process.
3. Branch from `develop`.
4. For money or timezone changes, run the matching audit skill.
5. State honestly what could not be verified — with no container, that is
   currently everything runtime.
