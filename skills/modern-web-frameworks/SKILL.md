---
name: modern-web-frameworks
description: Current Laravel, Next.js, and NestJS versions and breaking changes.
version: 1.0.0
license: MIT
metadata:
  verified: 2026-08-25
  hermes:
    tags: [laravel, nextjs, nestjs, php, typescript, framework, architecture]
---

# Modern Web Frameworks: Laravel · Next.js · NestJS

Version facts and breaking changes for the three frameworks in play, pulled from
official sources rather than model memory. Load this before making a stack
decision, scaffolding a project, or reviewing framework code.

**All three frameworks shipped a major version in the last cycle, and each one
removed something that used to work.** Writing from memory produces code that
looks right and fails at build time. Check the version first.

## Current versions

| Framework | Version | Runtime floor | Verified |
|---|---|---|---|
| Laravel | 13.26.1 | PHP ^8.3 | 2026-08-25 (Packagist) |
| Next.js | 16.3.2 | Node 20.9+ | 2026-08-25 (npm) |
| NestJS | 12.0.1 | Node ≥ 20 | 2026-08-29 (npm) |

Re-verify before quoting these — they move. Registry lookups, not guesses:

```bash
curl -s https://registry.npmjs.org/next/latest | jq -r .version
curl -s https://registry.npmjs.org/@nestjs/core/latest | jq -r .version
curl -s https://repo.packagist.org/p2/laravel/framework.json | jq -r '.packages["laravel/framework"][0].version'
```

## The traps, in one line each

**Next.js 16** — `middleware.ts` is now `proxy.ts`. `cookies()`, `headers()`,
`params`, `searchParams` are async only; the Next 15 sync compatibility period
is over. Turbopack is the default builder.

**Laravel 13** — PHP 8.3 floor. Cache and session key prefixes changed from
`app_cache_` to `app-cache-`, which silently invalidates existing cache and
logs sessions out. `cache.serializable_classes` now defaults to `false`.

**NestJS 12** (released 2026-08-27) — ESM-ready packages, first-class Standard
Schema support for validation and serialization, a rebuilt CLI, and native
observability via `@nestjs/observe`. Existing CommonJS apps keep working;
migrating your own code to ESM is optional. Upgrade the CLI first
(`npm i -g @nestjs/cli@latest`) since the upgrade command ships with it.

**NestJS 11** — Express v5 is the default, and its route matcher rejects bare
`*`. Use `*splat` or `{*splat}`. Node 16 and 18 are dropped. Still relevant:
these changes carry into 12.

## Read the local docs first

Next.js ships its own documentation inside the package, and it matches the
installed version exactly:

```
node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md
```

A project's root `AGENTS.md` says this outright: *"This is NOT the Next.js you
know."* That instruction is there because the training-data version of this
framework is wrong. Read the bundled docs before writing App Router code.

Laravel ships **Boost**, a first-party MCP server that gives an AI assistant
guided, version-correct prompts — including `/upgrade-laravel-v13`. Worth
installing for any Laravel work.

## Detail

Load only what the task needs:

- `references/nextjs.md` — App Router, async APIs, proxy convention, Turbopack
- `references/laravel.md` — Laravel 13 upgrade impact, Boost, conventions
- `references/nestjs.md` — Express v5 routing, module resolution, lifecycle order
- `references/choosing.md` — which framework for which job, and how to combine them

## Rules

1. **Verify the installed version before writing code.** `package.json`,
   `composer.json`, or the registry. Never assume.
2. **Prefer bundled or official docs over recall.** Next.js bundles its docs;
   Laravel and NestJS publish versioned upgrade guides.
3. **Say when something is unverified.** A confident wrong API costs more than
   an honest "I need to check."
4. **Match the project's existing conventions** over whatever the docs show as
   idiomatic. Consistency inside a codebase beats external correctness.
