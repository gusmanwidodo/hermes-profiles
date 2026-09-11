# Stack versions — repo vs current

Verified 2026-09-11 against npm and Packagist. **Re-verify before relying on any
number here**; these move.

## The gaps

| Component | In repo | Latest | Gap |
|---|---|---|---|
| Laravel | `^10.47` | **13.31.0** | 3 majors |
| PHP | `^8.1` | Laravel 13 needs `^8.3` | blocks the upgrade |
| Octane | `^2.4` | — | tied to Laravel |
| Vue (resources) | `2.7.16` | **3.5.42** | **Vue 2 is end-of-life** |
| Vuex | `3.6.2` | Pinia 4.0.3 | Vuex is maintenance-only |
| Vite (resources) | `^7.3.1` | 8.3.0 | 1 major |
| Nuxt (`megatix-ssr`) | `^3.14.159` | **4.5.2** | 1 major |
| TypeScript | `^5.5.3` | 7.0.2 | 2 majors |

## What each gap actually means

**Vue 2.7 reached end-of-life on 31 December 2023.** No security patches, no
fixes. This is the single most consequential fact about the frontend: three of
the five apps (`dashboard`, `white-label`, `pos`) sit on an unsupported
framework. It is not urgent in the sense of breaking tomorrow, but it is a
liability that only grows, and every new Vue 2 component deepens it.

Migration is not a rewrite-in-a-weekend job. Vue 2 → 3 changes the reactivity
system, the Options API remains but composition is idiomatic, and Vuex → Pinia
is a separate migration on top. For apps this size the realistic path is
incremental, app by app, starting with whichever is smallest.

**Laravel 10 → 13 is three majors.** Laravel 10 is out of active support; only
security fixes continue, and those end too. The blocker is PHP: the repo
declares `^8.1`, Laravel 13 requires `^8.3`. PHP comes first, then the framework,
one major at a time — 10 → 11 → 12 → 13. Skipping majors is how upgrades stall
for a year.

**Nuxt 3 → 4** is the cheapest of these. Nuxt 4 is mostly compatible with Nuxt 3
code; the main changes are directory structure (`app/` becomes the default
srcDir) and some defaults. `megatix-ssr` is the newest app and the least
entangled, so it is the natural place to start building upgrade confidence.

## How to use this

**Do not propose a big-bang upgrade.** A platform handling ~30M orders and real
promoter payouts does not get a stop-the-world migration. Each of these is its
own project with its own risk profile.

**Order by risk-adjusted value:**

1. **Nuxt 3 → 4** — smallest blast radius, newest code, builds confidence
2. **PHP 8.1 → 8.3** — unblocks everything Laravel, and is mostly mechanical
3. **Laravel 10 → 11 → 12 → 13** — one major at a time, tests green between each
4. **Vue 2 → 3, app by app** — largest effort, largest long-term payoff

**Verify before advising.** Version facts decay. Check the registry rather than
trusting this table or model memory:

```bash
npm view nuxt version
npm view vue version
curl -s https://repo.packagist.org/p2/laravel/framework.json | head -c 400
```

## What upgrade advice must include

For a codebase this size, "upgrade to X" is not advice. Useful advice names:

- which of the five apps is affected
- what breaks, specifically, with a path to the breaking change notes
- how it gets tested, given there is no JS unit runner (lint + build clean)
- whether it can ship incrementally behind a flag
- what the rollback looks like

Anything short of that is a suggestion someone else has to turn into a plan.
