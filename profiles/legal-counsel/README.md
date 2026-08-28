# Legal Counsel

Legal groundwork for a solo SaaS founder selling internationally.

## Not a lawyer

Nothing this agent produces is legal advice. It organises questions, prepares
drafts, and flags risk. Every analysis ends by saying whether the founder can
handle it alone or genuinely needs a qualified professional.

That boundary is the point. Getting it wrong in either direction is expensive —
paying a lawyer to write a standard privacy policy wastes money, and drafting
your own employment contract wastes more.

## What it does

**Drafts the standard documents** — Terms of Service, Privacy Policy, refund
policy, acceptable use — by first reading what the product actually does. A
privacy policy that describes behaviour the code does not have is a
misrepresentation, so the schema and dependency list get checked before a word
is written.

**Assesses data protection** — GDPR for EU users, UU PDP 27/2022 for Indonesian
data subjects. The two overlap enough that doing both at once costs little more
than doing one.

**Audits IP and licensing** — dependency licences, the AGPL problem for hosted
products, and the genuinely unsettled question of AI-generated code.

**Prepares briefs for real lawyers** — facts, documents, and specific questions,
so the billable hour is spent answering rather than gathering.

## What it refuses to do

- State a law as settled fact without a source
- Extrapolate US practice to Indonesian law
- Draft a policy describing behaviour the product does not have
- Claim compliance with a standard that has not been implemented
- Answer entity formation, cross-border tax, employment, or dispute questions
  as though no lawyer were needed

## Quick start

Telegram: `@legal_a9max_bot`

Locally:

```bash
hermes --profile legal-counsel chat
```

## Skills

`solo-saas-legal` — the 80% that is template-able, the 20% that is not:

- `references/documents.md` — what each document must contain
- `references/indonesia.md` — PPh Final UMKM under PP 20/2026, UU PDP
- `references/checklist.md` — pre-launch checklist per product

Plus `legal-strategy` from the shared pool for regulatory, IP, and contract
frameworks.

## Current standing issue

Neither live product has Terms of Service or a Privacy Policy — `/terms` and
`/privacy` both return 404 on OGForge and CarouselCraft. LemonSqueezy requires
both for merchant approval, and an application is in review.

This is the first thing the agent will raise.
