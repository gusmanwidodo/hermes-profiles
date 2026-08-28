# Pre-launch legal checklist

Per product, before taking money. Ordered by what blocks what.

## Blocking — payment processing will not approve without these

- [ ] **Terms of Service** published at a stable URL, linked from the footer
- [ ] **Privacy Policy** published at a stable URL, linked from the footer
- [ ] **Refund policy** — stated explicitly, either standalone or inside Terms
- [ ] **Working contact method** — an email that is actually monitored
- [ ] **Accurate product description** — what it does today, not what is planned

Current status, verified 2026-08-26:

| | OGForge | CarouselCraft |
|---|---|---|
| `/terms` | 404 | 404 |
| `/privacy` | 404 | 404 |

Both are missing. LemonSqueezy asked for supporting information during merchant
review, and this is the most likely reason.

## Before the first paying customer

- [ ] Privacy policy matches what the code actually does — verified by reading
      the schema and the dependency list, not assumed
- [ ] Every sub-processor named: payment, email, storage, CDN, analytics
- [ ] Account deletion works end to end, and actually deletes
- [ ] Cookie consent — only if non-essential cookies are set. Session cookies
      for authentication are essential and need no banner.
- [ ] Dependency licences audited: `npx license-checker --summary`
- [ ] No GPL or AGPL dependency shipped in a hosted commercial product without
      understanding the obligation

## Before promoting

- [ ] Every claim in marketing copy is true today
- [ ] No invented metrics, user counts, or testimonials
- [ ] Product name checked against existing trademarks in the target market
- [ ] Screenshots do not expose real user data

## When revenue starts

- [ ] Records kept: platform payout reports, bank statements
- [ ] Tax position understood — for Indonesia see `indonesia.md`
- [ ] Decide whether an entity is needed, with a konsultan pajak

## When a business customer appears

- [ ] DPA ready, or a template to adapt
- [ ] Security questionnaire answers prepared honestly
- [ ] Uptime and support commitments — only promise what you can deliver alone

## Never

- [ ] Never claim compliance with a standard you have not implemented
      (SOC 2, ISO 27001, HIPAA)
- [ ] Never state "GDPR compliant" as a badge — describe what you actually do
- [ ] Never copy another product's Terms verbatim; it will describe a service
      you do not operate
- [ ] Never promise data deletion you cannot perform

## Reality check for the current stage

Two live products, zero users, no revenue. Enforcement risk right now is
negligible. The reason to do this early is not fear of regulators — it is that
**payment processing is blocked without it**, and the documents take an hour
rather than a week.

Do the blocking items. Defer the rest until there is something to protect.
