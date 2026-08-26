# Copy

Writing posts that do not read like marketing.

## The test

Read it aloud. If you would not say it to someone at a table, do not post it.

That single filter removes most of what makes marketing copy unbearable:
"revolutionize," "seamless," "game-changing," "unlock the power of," "in today's
fast-paced world."

## Lead with the thing, not the preamble

Bad:

> In today's content-driven landscape, creating engaging visuals has never been
> more important. That's why I'm excited to announce…

Good:

> Every blog post needs an OG image. I was spending 20 minutes in Figma per
> post, so I built an API that does it in one URL.

The second one earns attention by being specific. The first one spends
attention on throat-clearing.

## Specifics beat adjectives

| Weak | Strong |
|---|---|
| "Blazingly fast" | "Renders in 300ms" |
| "Beautiful templates" | "Six themes, each with a deliberate colour pair" |
| "Save hours" | "20 minutes in Figma became one API call" |
| "Trusted by many" | Say nothing. You have no users yet. |

Every number must be one you can defend. An invented metric is the fastest way
to lose the only asset a solo founder has.

## Structure for a launch post

1. **The problem, concretely.** One sentence, in the reader's words.
2. **What you built.** One sentence, no adjectives.
3. **How it works.** One line, or a screenshot that shows it.
4. **What it costs.** Say the price. Hiding it reads as a trap.
5. **The link.**

Under 150 words. If it needs more, the product is unclear.

## Build-in-public posts

These are the easiest to write because the work already happened.

**What performs:** the bug that took a day to find. The cost of something that
surprised you. A decision you reversed and why. A number that went the wrong
direction.

**What does not:** vague progress updates. "Shipped a bunch of improvements
today" tells nobody anything.

Concrete example worth writing up: the OG image tag on OGForge shipped pointing
at `localhost:3000`, because Next.js resolves `metadataBase` at build time and
`APP_URL` was only set at runtime. An OG image generator whose own preview was
broken is a genuinely useful story — it is specific, technical, and honest.

## Adapting across platforms

Same substance, different shape. Never the same text pasted twice.

- **HN** — plain, technical, no exclamation marks. State the tradeoffs.
- **Reddit** — conversational, answer the implied "why should I care."
- **LinkedIn** — slightly more context, still no corporate voice.
- **X** — tighter, one idea per post, image carries the weight.

## Responding to criticism

Someone will say your product is pointless or that an existing tool already does
it. This is normal and the response decides how the thread goes.

**Concede real points.** "Fair — X does cover that case. I built this because I
wanted Y" is stronger than defending everything.

**Never argue with a downvote.** Answer the substance or move on.

**Thank people who find bugs.** They did free QA.

## Hard rules

- No fabricated users, revenue, or testimonials
- No "trusted by teams at…" without named permission
- No urgency without a real deadline
- No claims the product does not deliver today
- No AI-written-sounding phrasing — run copy through the humanizer skill if it
  reads flat
