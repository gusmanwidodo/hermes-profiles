# Automated posting — what is actually possible

Honest assessment before any code gets written. Verified reachable from this
machine 2026-08-28; **requirements below change and must be re-checked against
each platform's current developer docs before relying on them.**

## The short version

All four platforms have official posting APIs. None of them let you just log in
and post. Each requires registering an app and, for the publishing permission,
going through the platform's review — which is a human process measured in days
to weeks, and can be refused.

There is no shortcut around this that is both durable and allowed. Unofficial
automation (browser drivers on a logged-in session, scraped tokens) violates
every one of these platforms' terms and is the standard way accounts get
suspended. Not worth it for an account whose entire purpose is credibility.

## Per platform

### LinkedIn — easiest path

- **API:** `api.linkedin.com/v2` — reachable, returns 401 without auth
- **Needs:** LinkedIn app, "Share on LinkedIn" product enabled, `w_member_social`
  scope, OAuth 2.0 three-legged flow
- **Posting:** UGC Posts / Posts API. Text and images both supported.
- **Reality:** the most straightforward of the four for posting as yourself.
  Token refresh is the ongoing chore — access tokens are short-lived.

### Instagram — hardest for a personal account

- **API:** `graph.facebook.com` (Instagram Graph API) — reachable
- **Needs:** Instagram **Business or Creator** account, linked to a Facebook
  Page, a Meta app, and app review for `instagram_content_publish`
- **Posting:** two steps — create a media container, then publish it. Images
  must be at a **public URL**; you cannot upload bytes directly.
- **Reality:** the account type conversion is the real barrier. A personal IG
  account cannot use this API at all. Carousels are supported, which matters
  given CarouselCraft exists.

### Threads — newer, similar shape to Instagram

- **API:** `graph.threads.net` — reachable
- **Needs:** Meta app with Threads API access, `threads_content_publish` scope
- **Posting:** same container-then-publish pattern as Instagram
- **Reality:** newer API, fewer worked examples, occasional gaps. Media also
  needs to be at a public URL.

### TikTok — most restricted

- **API:** `open.tiktokapis.com/v2` — reachable, though **local DNS resolves it
  to a hijacked address**; resolve over DoH and pin the result, as documented in
  the network diagnostics skill
- **Needs:** TikTok developer app, Content Posting API, `video.publish` scope,
  and an **audit** before public posting is allowed
- **Reality:** unaudited apps can only post as private/self-only. Video means
  actually producing video, which is a different production problem from writing
  text.

## What this means practically

**Weeks one to four:** no automation. Draft, review, post by hand. This is not a
workaround — it is how you find out what the voice sounds like and what lands,
before locking anything into a pipeline.

**In parallel:** convert IG to a Creator account, register the LinkedIn app,
start the Meta app review. These take calendar time regardless.

**Once approved:** LinkedIn first, since it is the simplest and the audience fits
best. Instagram and Threads after. TikTok last, or not at all — video production
is a separate problem from writing.

## What to build now, before any API is approved

The scheduling layer does not need API access to be useful:

- A content queue: drafts with target platform, intended date, and the source
  the claim traces to
- Preflight checks that run on a draft — length limits, AI-tells after the
  humanizer pass, unverified numeric claims
- A reminder that surfaces what is due, so posting by hand stays consistent

This is the part that actually determines whether the account survives past
week three. Consistency is the constraint, not posting mechanics.

## When credentials do arrive

Store tokens in the profile's `.env`, chmod 600, gitignored — same as every
other credential here. Never in the repo, never in a skill file.

Refresh tokens expire. A posting pipeline that worked last month and silently
stopped is worse than no pipeline, so any automation needs to fail loudly.

## The line

Official APIs with proper OAuth: fine, that is what they are for.

Browser automation against a logged-in session, scraped tokens, or anything that
pretends to be the mobile app: not built here. It breaks the terms, and an
account suspension costs more than the automation saves.
