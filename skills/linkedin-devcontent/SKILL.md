---
name: linkedin-devcontent
description: LinkedIn content for a student full-stack dev — problem-solver posts.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [linkedin, content, copywriting, n8n, design, creasion]
---

# LinkedIn Content — Mohammad Laily Nova Krisna

Building a LinkedIn presence as a **problem solver** in web software engineering.

## Who this is for

| | |
|---|---|
| Name | Mohammad Laily Nova Krisna (Danu) |
| Profile | linkedin.com/in/lailynova |
| Headline | Full Stack Developer Enthusiast · Graphic & UI/UX Designer |
| Status | **Undergraduate, Informatics — University of Jember** |
| Also | ANSA Academy |
| Location | Kabupaten Banyuwangi, East Java |
| Stack | Next.js, TypeScript, cloud-based solutions |
| Edge | Development **and** interface design — rare pairing |
| Audience | 500+ connections |
| Email | lailywardanu@gmail.com |
| Language | **English** |

## The rule that governs everything

**He is a student, and the content must never pretend otherwise.**

No "5 lessons from years in production". No architecture advice for systems he
has not run. No invented client work. Writing above your level is transparent to
senior engineers and it is the fastest way to lose the audience that matters.

What works instead — and works unusually well — is **learning in public**: a
real problem, the wrong turn taken, the actual fix. Seniors respect it, peers
relate to it, and recruiters see genuine problem-solving rather than a rehearsed
list.

His stated position is honest and usable as-is: *"Eager to learn, grow, and
contribute to meaningful projects."*

## The differentiator: design + code

Most developers cannot design. Most designers cannot ship code. He does both,
and his own About section says the background in interface design lets him
"ensure consistency between the visual concept and the final product."

**Lead with that.** A post showing a UI problem diagnosed *and* fixed — with the
reasoning visible on both sides — is content almost nobody else in his cohort
can produce.

## Post format: problem → solve

Every post follows one shape:

1. **The problem, concrete.** What broke, what was confusing, what was slow.
2. **What was tried first, and why it was wrong.** This is the part people
   remember, and the part everyone else omits.
3. **The actual cause.**
4. **The fix**, with code or a screenshot.
5. **What would be checked first next time.**

Target 900–1600 characters. First two lines are the hook — everything after sits
behind "see more".

## Content pillars

**1. Bugs and fixes** — the strongest pillar. Something that took hours,
explained so the next person finds it in ten minutes.

**2. Design meets code** — a UI decision defended technically, or a technical
constraint solved visually. His unique ground.

**3. Learning in public** — a concept newly understood, explained plainly. Not
"here is what a closure is"; rather "here is the bug that finally taught me what
a closure is."

**4. Build logs** — what shipped this week, what it cost, what broke.

## Voice

- First person, past tense, specific
- Admit the wrong turn — it is the most credible part
- No emoji in headlines
- Banned: "game-changer", "unlock the power", "let that sink in", "thoughts?",
  "agree?", 🚀
- Numbers must be real and checkable. No invented metrics.
- Technical terms stay English; the whole post is English

**Run every draft through the `humanizer` skill before it ships.** AI-written
prose is obvious to developers and destroys the credibility this account exists
to build.

## Publishing: use Creasion, not raw LinkedIn

`creasionapp.com` is live and supports LinkedIn fully. Docs verified 2026-09-03.
This removes the need to handle LinkedIn OAuth or app review directly.

```
Authorization: Bearer <CREASION_API_KEY>

GET  https://creasionapp.com/v1/accounts       list connected accounts
POST https://creasionapp.com/v1/media          register media (URL or presigned PUT)
POST https://creasionapp.com/v1/posts          publish  → 202 queued
GET  https://creasionapp.com/v1/posts/{id}     per-channel status + live URL
POST https://creasionapp.com/v1/webhooks       post.published / post.failed, HMAC-SHA256
```

The account value has the shape `linkedin:person:<id>` — **copy it verbatim from
`/v1/accounts`**, never construct it. LinkedIn values contain a second colon.

**Carousels are LinkedIn document posts.** Send a single PDF:

```json
{
  "accounts": ["linkedin:person:..."],
  "content": "...",
  "media": ["media_..."],
  "linkedin": { "document_title": "..." }
}
```

LinkedIn accepts **one media item per post** — more returns `validation_error`.
Combine slides into one PDF. Limits: 100MB, 300 pages.

Hosted MCP at `https://creasionapp.com/v1/mcp` exposes `list_accounts`,
`publish_post`, `schedule_post`, `get_post_status`.

Errors carry `code`, `retryable`, and `retry_after_seconds` — honour them.

## n8n

n8n runs on this machine (container `n8n`). Because Creasion handles the
platform side, an n8n workflow only needs to call one HTTP endpoint on a
schedule — no OAuth, no token refresh.

Keep the draft queue reviewable. **Danu approves before anything publishes.**

## Design output

For carousels and diagrams, the available skills are `claude-design`,
`excalidraw`, `architecture-diagram`, and `baoyu-infographic`. Export slides to a
single PDF for LinkedIn.

Design rule that matters at phone size: code screenshots must be readable
without zooming. One idea per slide.

## Never

- Claim seniority, years of experience, or client work he does not have
- Invent metrics, users, or testimonials
- Give advice about systems he has not personally run
- Publish without his approval
- Ship a draft that still reads as AI-written after the humanizer pass
