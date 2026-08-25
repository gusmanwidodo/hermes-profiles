---
name: strategic-deliverable-production
description: Produce multi-file strategy docs as artifact pyramids.
version: 1.0.0
metadata:
  hermes:
    tags: [ceo, strategy, artifact-pyramid, deliverable, workflow]
---

# Strategic Deliverable Production

How to produce multi-file strategic deliverables (strategy memos, portfolio
theses, capital-allocation plans, board docs) for this user. This is the
CEO-profile companion to the read-only methodology skills
(`strategy-frameworks`, `executive-methodology`, `artifact-pyramids`), which
live in the `default` profile and cannot be edited from a CEO session — capture
CEO-specific working lessons here instead.

## When to load

- Building a strategy document as an artifact pyramid (00-index + 01-summary +
  02-analysis + 03-dossiers).
- Any engagement that will produce 5+ files across multiple write calls.

## Progress legibility during long production runs (IMPORTANT)

A full pyramid can mean 8+ files written across many tool calls. During that
stretch the user sees a long silence and may interrupt to ask whether anything
is happening — observed signal: a terse **"Mana?" / "Where is it?"** mid-run.
Silence during multi-file production reads as being stuck, even when every
write is landing fine.

- **Announce the plan and file count up front.** Before the first write, state
  roughly how many files you'll produce and the order (L1 → L2 → L3). This sets
  expectations for the silence to come. A `todo` list with one item per file
  makes the plan visible.
- **Emit a short progress marker between batches.** After a batch of writes, a
  one-line "N of M files done" keeps the run legible without flooding the chat.
- **If interrupted mid-run, answer with concrete state, not reassurance.**
  Report exactly which files already exist on disk and which remain, then finish
  the rest. `write_file` returns a verified on-disk hash, so state completion
  factually ("4 of 9 written and verified") rather than hand-waving.
- **Batch independent writes in one turn.** Independent file writes have no
  ordering dependency — issue them together to shorten total wall-clock time and
  the window of silence.

## User operating preferences for this class of work

- **Language: Bahasa Indonesia.** Communicate in Indonesian; keep foreign
  technical terms (MRR, MoR, MVP, stage gate, free tier, etc.) in English.
- **Wants an operating system, not a chat.** The user explicitly asked for the
  full strategy as a reusable artifact, not an inline answer. Default to writing
  the pyramid to disk and returning the `00-index.md` path.
- **Set concrete targets when the user hasn't.** When the user says a metric is
  "not yet decided," don't leave it open — propose staged, measurable gates
  (e.g. first paying customer → $1k MRR → $3–5k MRR) and label them as your
  recommendation.

## Pitfalls

- Do not go silent for many consecutive tool calls without a progress marker.
- Do not report a file as written without confirming the verified on-disk write
  result.
- The methodology skills (`strategy-frameworks`, `executive-methodology`,
  `artifact-pyramids`) are read-only from a CEO session — they resolve to the
  `default` profile. Recommend `hermes curator adopt <name>` if one needs a fix;
  do not attempt to patch them from here.
