# Choosing between them

Written for a solo founder shipping a portfolio of small products, with a
separate Laravel-based line of work. Adjust the reasoning, not the conclusions,
if that context changes.

## Default: Next.js full-stack

For a micro-SaaS, Next.js alone is usually the whole stack. Route handlers in
`app/api/*/route.ts` cover the API, Server Components cover data fetching, and
one deployment artifact covers both. A separate backend service is a second
thing to deploy, monitor, and keep in sync for no benefit at this size.

Reach for this unless something below forces otherwise.

## Laravel when the domain is heavy

Laravel earns its place when the work is genuinely back-office: complex
business rules, background job pipelines, admin surfaces, multi-tenancy,
scheduled work, mature auth and authorization primitives. Eloquent, queues,
policies, form requests, and Artisan replace code you would otherwise write and
maintain yourself.

It is also the right call when a mobile client (Flutter) and a separate
dashboard (Vite/React) both consume the same API — the API stops being an
implementation detail of one frontend and becomes the product's spine.

Install **Laravel Boost** for any Laravel work. It is the difference between an
assistant writing Laravel from memory and writing it against the installed
version.

## NestJS when structure is the constraint

NestJS is the answer to "several people are going to work on this backend for a
long time." Modules, DI, guards, interceptors, and pipes give a team a shared
vocabulary and keep a large service navigable.

For a solo founder on a small product, that structure is overhead without a
payoff. The honest recommendation is: skip NestJS until the API outgrows Next.js
route handlers *and* the team is more than one person. Adopting it early buys
ceremony, not speed.

Where it does fit: a long-lived TypeScript service with real domain complexity,
where sharing types with a TypeScript frontend matters enough to rule out
Laravel.

## Combining them

**Next.js + Laravel** — Laravel owns the API and domain, Next.js owns the
marketing site and any React surface. Clean split, two deployments. Worth it
when the domain is heavy enough that Laravel is already justified.

**Next.js + NestJS** — shared TypeScript types across the boundary is the main
draw. Only pays off once the backend is substantial; otherwise it is two
deploys for one product.

**Laravel + NestJS** — two backends. Needs a specific reason, such as an
existing Laravel system plus a new service with different runtime demands.
Default answer is no.

## Deciding quickly

| Situation | Pick |
|---|---|
| Micro-SaaS, one developer, ship this week | Next.js full-stack |
| Mobile + dashboard sharing one API | Laravel |
| Heavy domain logic, queues, admin, multi-tenancy | Laravel |
| Long-lived TS service, multiple engineers | NestJS |
| Marketing site in front of an existing backend | Next.js |
| Unsure | Next.js — it is the cheapest to walk away from |

## Framework-independent rules

1. **Verify the installed version before writing code.** All three shipped a
   major that removed something.
2. **One product, one stack.** Mixing frameworks inside a single small product
   costs more than any framework advantage returns.
3. **Runtime floors are real constraints:** PHP 8.3 for Laravel 13, Node 20 for
   Next 16 and NestJS 11. Check the deployment target before committing.
4. **Prefer the boring framework you already run in production.** The second
   product on a known stack ships faster than the first on a better one.
