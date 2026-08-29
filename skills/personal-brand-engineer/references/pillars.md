# Content pillars

Four pillars, each anchored to work that already exists. Rotate between them so
the account does not become one note.

## 1. Bugs and post-mortems — the strongest pillar

Engineers trust people who admit mistakes, and almost nobody publishes them.
This is where the differentiation is.

Ready to write, all verified:

- **The OG generator with a broken preview.** Next.js resolves `metadataBase` at
  build time; `APP_URL` was only set at runtime, so every preview pointed at
  `localhost:3000`. Invisible in a browser, obvious to a crawler.
- **`next build` does not copy `public/` into the standalone bundle.** Pages
  served unstyled from the standalone server until a post-build copy step was
  added. Documented behaviour, surprising consequence.
- **A contrast checker reporting 1.02:1 on text that was actually 16:1.** The
  gradient lived in `background-image`, so `getComputedStyle().backgroundColor`
  returned transparent and the tool measured against the page behind it.
- **An ISP hijacking DNS to a block page** while the underlying IPs answered
  normally. Diagnosed by resolving over DoH and pinning with `--resolve`. Three
  sub-bugs in the fix: TLS SNI rejecting an IP in the URL, Node's `lookup`
  callback needing `[{address, family}]`, and Cloudflare DoH requiring
  `application/dns-json`.

Format: what broke → what I assumed → what was actually happening → the fix →
what I would check first next time.

## 2. Open source — showing the reasoning, not the README

The packages exist and are public. The content is the design thinking behind
them.

- **Why `auth-kit` is plugin-based.** A small core with login methods as
  separate packages, inspired by better-auth. The tradeoff: more packages to
  maintain, but nobody ships code for auth methods they do not use.
- **Static versus dynamic permission checks.** `auth-kit-permissions` resolves
  static roles with zero queries and falls back to the database for dynamic
  ones. Benchmarked at roughly 65× faster than spatie on the common check —
  30,000 iterations, in-memory SQLite, spatie cache warm, PHP 8.3, reproducible
  with `composer bench`. **Always state the conditions**; a bare "65× faster" is
  the kind of claim that gets torn apart in comments, and deservedly.
- **Integer minor units for money.** Why `laravel-billing` never stores a float,
  with the failing case that motivates it.
- **Webhook signature verification with replay protection.** What
  `laravel-billing-stripe` and `-midtrans` actually check, and why timestamp
  validation matters as much as the signature.

Credit prior art honestly. The permissions README says spatie is "excellent and
battle-tested" before showing the benchmark — that framing is why the number is
believable.

## 3. Building in public — real products, real state

Two live products, no users yet. That is the honest position and it is more
relatable than manufactured traction.

- Shipping a micro-SaaS from template to live URL, with the actual steps
- Self-hosting behind Traefik and a Cloudflare Tunnel instead of paying for
  managed hosting
- Building an automated quality gate that found real bugs in already-shipped
  code — mobile overflow, touch targets under 44px, a contrast bug nobody saw
- What it costs to run: containers, domain, no managed services

**Never** claim users, revenue, or traction that does not exist. "Two products
live, zero users, here is what I am trying next" is a legitimate and unusual
post.

## 4. Craft — opinions earned by doing

Only write these about things actually used in shipped work.

- Reading the framework's own bundled docs instead of trusting recall, and why
  Next.js now ships an `AGENTS.md` saying "this is NOT the Next.js you know"
- Machine-checkable quality gates versus code review — what each catches
- Why a verification checklist that grows with every production bug beats
  testing discipline that depends on memory
- Delegating implementation to an AI agent and verifying the output rather than
  trusting the summary

Avoid: framework wars, hot takes on tools not used, career advice.

## Post bank — start here

The first five posts, in order, each traceable to real work:

1. The OG generator with a broken preview *(bug, LinkedIn)*
2. Permission checks: static versus dynamic, with the benchmark and its
   conditions *(open source, LinkedIn)*
3. "An OG image tool whose own preview was broken" *(Threads, the punchline
   alone)*
4. Integer minor units for money, with the failing float case *(carousel, IG)*
5. Two products live, zero users — what I am trying next *(build in public,
   LinkedIn)*

Every one of these already happened. None need embellishment.
