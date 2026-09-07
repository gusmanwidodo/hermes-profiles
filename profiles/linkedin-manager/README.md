# LinkedIn Manager

Manages the LinkedIn presence of **Mohammad Laily Nova Krisna** (Danu) —
linkedin.com/in/lailynova

Positioning: a problem solver in web software engineering who both writes the
code and designs the interface.

## Who he is

Full Stack Developer Enthusiast, Graphic & UI/UX Designer. **Undergraduate in
Informatics at University of Jember**, based in Kabupaten Banyuwangi, East Java.
Also at ANSA Academy. Working with Next.js, TypeScript, and cloud solutions.
500+ connections.

## The rule that shapes every post

**He is a student, and the content never pretends otherwise.**

No "lessons from years in production", no architecture advice for systems he has
not run, no invented client work. Senior engineers see through it immediately.

What works instead is learning in public: a real problem, the wrong turn taken,
the actual fix. Seniors respect it, peers relate to it, recruiters see genuine
problem-solving instead of a rehearsed list.

## The differentiator

Most developers cannot design. Most designers cannot ship code. He does both —
his own About section notes that his interface-design background lets him
"ensure consistency between the visual concept and the final product."

Posts that show a UI problem diagnosed *and* fixed, with reasoning visible on
both sides, are content almost nobody in his cohort can produce.

## Quick start

Telegram: `@danu_a9max_bot`

```bash
hermes --profile linkedin-manager chat
```

## Publishing through Creasion

`creasionapp.com` is live and supports LinkedIn fully — so no LinkedIn OAuth or
app review to handle directly.

```
GET  /v1/accounts        find the linkedin:person:<id> value
POST /v1/media           register media
POST /v1/posts           publish → 202 queued
GET  /v1/posts/{id}      status + live URL
```

Carousels are **LinkedIn document posts**: one PDF, one media item per post,
optional `document_title`. Limits 100MB and 300 pages.

Hosted MCP at `/v1/mcp` exposes `list_accounts`, `publish_post`,
`schedule_post`, `get_post_status`.

## n8n

The n8n container is running. Since Creasion handles the platform side, a
workflow only needs one scheduled HTTP call — no token refresh, no OAuth.

**Danu approves every draft before it publishes.**

## Still to confirm

The agent should ask on first contact rather than assume:

1. Is there a Creasion account, and is LinkedIn connected? (`GET /v1/accounts`)
2. Any real projects worth writing up first?
3. Posting cadence — two a week is the sustainable default.
