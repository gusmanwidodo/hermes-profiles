---
name: social-distribution
description: Distribution for micro-SaaS — channels, cadence, and honest copy.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [marketing, distribution, social, launch, growth, content]
---

# Social Distribution for Micro-SaaS

Getting a product in front of people who might pay for it. Written for a solo
founder with live products and zero audience, which is a different problem from
managing an established brand's social presence.

## The constraint that shapes everything

No audience yet. That rules out most social media advice, which quietly assumes
followers already exist. Posting into an empty feed produces nothing regardless
of how good the post is.

What works from zero is **borrowed audience**: communities where the audience is
already gathered and the rules permit relevant contribution. Reddit, Hacker
News, Indie Hackers, Product Hunt, dev-tool Discords, niche newsletters.

The order matters. Build in public → borrowed audience → owned audience. Trying
to start at step three wastes months.

## Before posting anything: check the product is shareable

Run `scripts/preflight.mjs <url>` on any product before a launch push. It checks
what a social crawler actually sees.

Three failures make distribution pointless, and all three are invisible unless
you look:

1. **`robots.txt` with `Disallow: /`** — most social crawlers respect it. The
   link preview never renders. The post looks broken.
2. **`noindex, nofollow`** — same effect, plus no organic search ever.
3. **Broken or absolute-localhost `og:image`** — Next.js bakes absolute URLs
   into statically pre-rendered pages at *build* time. If `APP_URL` is not set
   during the Docker build, the tag ships pointing at `localhost:3000` and no
   preview will ever load.

A launch post with a dead preview gets a fraction of the clicks. Fix these
first; they are cheap.

## Channels, honestly assessed

| Channel | Works for | Reality |
|---|---|---|
| **Reddit** | Niche tools, real problems | Highest signal, harshest on self-promo. Contribute for weeks before linking. |
| **Hacker News** | Dev tools, Show HN | One shot per product. Front page is transformative, most posts get nothing. |
| **Indie Hackers** | Build-in-public | Small but genuinely supportive. Milestones and revenue posts do well. |
| **Product Hunt** | Launch day spike | Traffic is real but rarely converts to retention. Prepare properly or skip. |
| **X / Twitter** | Compounding, slow | Needs months of consistency before it returns anything. |
| **LinkedIn** | B2B, higher intent | Underrated for tools sold to marketers. Less crowded than X. |
| **Dev Discords** | Early feedback | Good for finding first users, poor for volume. |

Pick two and do them properly. Five channels done badly beats nothing, but only
barely, and it costs five times the effort.

## What to actually post

**Build in public.** The work itself is the content. What broke, what it cost,
what you learned, what you shipped. This is the only content that is free to
produce because it is a byproduct of building.

**Show the thing working.** A screenshot or a short clip outperforms any
description. For OGForge, the generated image is the post. For CarouselCraft,
the exported carousel is the post.

**Specifics over claims.** "Cut OG image work from 20 minutes to one API call"
beats "streamline your workflow." Numbers you can defend, never numbers you
invented.

**Answer questions where they are asked.** Someone on Reddit asking how to
automate OG images is a better prospect than a thousand impressions.

## What never to post

- Fabricated metrics, user counts, or revenue
- Invented testimonials
- "10x your workflow" and similar unearned superlatives
- Engagement bait — polls and hot takes unrelated to the product
- The same text copy-pasted to five platforms
- Anything urgent-sounding. Urgency is a sales technique, not marketing.

For this founder specifically: **no fake numbers, ever.** Two live products
with zero users is the honest position, and "I built this, does it solve your
problem?" is a legitimate post. Claiming traction that does not exist is how a
reputation ends before it starts.

## Launch sequence

A product launch is a week, not a day.

1. **Preflight** — run the script. Fix robots, meta, and og:image.
2. **Seed the story** — post the build process before the launch. Gives the
   launch context and a small warm audience.
3. **Pick the primary channel** — where the buyers are, not where the most
   people are.
4. **Launch post** — what it does, who it is for, what it costs, a working demo
   link. No preamble.
5. **Answer everything** — every comment, fast, including the critical ones.
   Response quality decides whether a post dies or spreads.
6. **Report the outcome honestly** — including a flop. That post is often more
   useful than the launch itself.

## Measuring

Vanity metrics: impressions, likes, follower count.

Real metrics: signups attributable to a channel, activation rate, and whether
anyone came back the next day. Traffic without retention is noise.

If a channel produces traffic that never activates, stop using it. That is
information, not failure.

## References

- `references/channels.md` — per-channel rules, timing, and failure modes
- `references/copy.md` — writing posts that do not read like marketing
