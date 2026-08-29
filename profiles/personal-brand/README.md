# Personal Brand

Ghostwriting for Gusman Widodo across Instagram, Threads, TikTok, and LinkedIn.
Positioning: a software engineer who teaches what he actually builds.

## The rule everything else serves

**Only what actually happened.** Every post traces to real work — a package on
GitHub, a bug that was genuinely hit, a benchmark that can be reproduced. No
invented anecdotes, no borrowed opinions, no clients that do not exist.

This is not a moral stance so much as the only durable advantage available: most
dev content is written by people who are not shipping anything.

## Voice

Direct, past tense, specific. Mistakes admitted, because they are the most
useful and most trusted part.

No 🚀. No "game-changer". No "here's the thing". No "thoughts?". Numbers must be
reproducible — "~65× faster, reproduce with `composer bench`" is fine, "blazing
fast" is not.

**Every draft goes through the `humanizer` skill before it ships.** AI prose has
tells — em-dash pileups, "it's not just X, it's Y", fake-candid openings — and
readers on dev platforms spot them immediately. A post that reads as
machine-written destroys exactly what this account is building.

## Quick start

Telegram: `@gusmanw_bot`

Locally:

```bash
hermes --profile personal-brand chat
```

Content queue — works today, no platform API needed:

```bash
Q=~/.hermes/profiles/personal-brand/skills/personal-brand-engineer/scripts/queue.mjs
node $Q add --platform linkedin --date 2026-09-01 --source auth-kit-permissions --file draft.md
node $Q check 1     # preflight: length, AI tells, unsourced claims
node $Q due         # what should go out today
node $Q done 1
```

## On automated posting

All four platforms have official APIs, and all four require app registration
plus platform review before they will grant publishing permission. That is days
to weeks of calendar time and can be refused.

| Platform | Barrier |
|---|---|
| LinkedIn | App + `w_member_social` scope. Easiest path. |
| Instagram | Requires a **Business/Creator** account, a linked FB Page, and Meta app review |
| Threads | Meta app + `threads_content_publish` review |
| TikTok | Developer app + audit; unaudited apps can only post privately |

Until then: draft, review, post by hand. Which is the right sequence anyway —
the first month is for finding the voice, not for locking it into a pipeline.

Browser automation against a logged-in session is not built here. It breaks
every one of these platforms' terms, and a suspension costs more than the
automation saves.

## Skills

`personal-brand-engineer`:

- `references/pillars.md` — four content pillars and the first five posts
- `references/platforms.md` — format, length, and cadence per platform
- `references/automation.md` — what each API actually requires
- `scripts/queue.mjs` — content queue with preflight checks

Plus `social-distribution` for channel strategy and the shareability preflight.

## Material

Real inventory, verified: `auth-kit` and six plugin packages, `laravel-billing`
with Stripe and Midtrans providers, `laravel-supabase-flysystem`, plus two live
products. The bug stories from building them are documented in `pillars.md` and
each one is a post.
