# Platforms

Same substance, different shape. Never paste identical text twice — it reads as
automation, which is exactly what the account should not look like.

## LinkedIn

The best fit. Technical audience, higher intent, and far less crowded than X for
Indonesian engineers writing in depth.

- **Length:** 900–1600 characters lands best. Hard limit 3000.
- **Structure:** hook in the first two lines — everything after is behind "see
  more". Then the story, then what was learned.
- **Language:** English reaches further; Indonesian builds a closer local
  audience. Pick per post, not per week.
- **Cadence:** two a week, sustainable.
- **What works:** post-mortems on real bugs, architecture decisions with the
  tradeoff stated, open-source releases with the reasoning behind a design
  choice.
- **What fails:** motivational posts, "X lessons I learned", anything that could
  have been written by someone who does not code.

## Threads

Conversational, low-friction, good for the small observations that are too
minor for LinkedIn.

- **Length:** 150–400 characters. Hard limit 500.
- **Structure:** one idea. Chain replies for anything longer.
- **Cadence:** two to three a week. Tolerates higher frequency than LinkedIn.
- **What works:** a bug you just hit, a surprising API behaviour, a short
  opinion grounded in something you built today.
- **What fails:** threads that are LinkedIn posts cut into pieces.

## Instagram

Visual-first. Carousels are the format that carries technical content, and this
happens to be exactly what CarouselCraft produces — the product is its own
distribution.

- **Format:** 6–10 slide carousel, one idea per slide, code screenshots readable
  at phone size.
- **Caption:** 300–900 characters, adds context rather than repeating slides.
- **Cadence:** one to two a week — production cost is real.
- **What works:** before/after code, a concept broken into steps, a bug and its
  fix across two slides.
- **What fails:** walls of text as images, unreadable code, anything requiring a
  zoom.

## TikTok

Highest reach, highest production cost, weakest fit for a written-content
strategy. Worth attempting only with material that is genuinely visual.

- **Length:** 30–90 seconds. Screen recording with voiceover.
- **Structure:** the payoff in the first three seconds. No preamble, no intro.
- **Cadence:** one a week at most, and only when there is something worth
  filming.
- **What works:** a terminal doing something surprising, a bug reproducing live,
  a tool demo where the result is visibly good.
- **Honest note:** if the video budget is not there, skip it. Three platforms
  done well beat four done thinly.

## Cross-posting

The story is shared; the telling is not.

One bug — the `metadataBase` build-time resolution issue — becomes:

- **LinkedIn:** the full post-mortem, why it was invisible in a browser, the fix
- **Threads:** the punchline alone — "an OG image generator whose own preview
  was broken"
- **Instagram:** carousel — the symptom, the wrong hypothesis, the actual cause,
  the fix
- **TikTok:** screen recording of the meta tag pointing at localhost

Write once, reshape four times. Never paste.
