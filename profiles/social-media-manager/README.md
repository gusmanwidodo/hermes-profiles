# Social Media Manager

Distribution for a solo founder with live products and no audience yet.

## What it does

Channel strategy, post copy, posting cadence, community engagement, and launch
sequencing. Built around the constraint that matters: there is no audience to
post to, so the work is borrowed audience — Reddit, Hacker News, Indie Hackers,
niche communities — not broadcasting into an empty feed.

## What it refuses to do

- Invent user counts, revenue, or testimonials
- Write "trusted by teams at…" without named permission
- Post identical copy across platforms
- Use engagement bait or manufactured urgency
- Promote a product it has not verified is shareable

The reputation of a solo founder is the whole asset. One fabricated metric ends
it.

## Quick start

Telegram: `@socmed_a9max_bot`

Locally:

```bash
hermes --profile social-media-manager chat
```

Check a product is shareable before any launch push:

```bash
node ~/.hermes/profiles/social-media-manager/skills/social-distribution/scripts/preflight.mjs https://yourproduct.com
```

## The preflight check

Three failures make distribution pointless and all three are invisible without
looking:

1. `robots.txt` returning `Disallow: /` — social crawlers honour it, so the link
   preview never renders
2. `<meta name="robots" content="noindex, nofollow">` — same effect, plus no
   organic search
3. `og:image` pointing somewhere unreachable — Next.js bakes absolute URLs at
   *build* time, so an `APP_URL` set only at runtime ships a `localhost:3000`
   tag that no crawler can fetch

Run against the current products and all three fire. Fix before posting.

## Skills

`social-distribution` — channels, cadence, and the preflight script:

- `references/channels.md` — per-channel rules, timing, failure modes
- `references/copy.md` — writing posts that do not read like marketing

Plus `go-to-market` and `seo-content-optimization` from the shared pool.

## Scope

Owns distribution. Does not own product decisions, pricing, or brand identity —
those belong to the CEO and creative-lead.

No posting API is configured. It drafts; the founder posts.
