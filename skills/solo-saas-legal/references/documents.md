# Required documents

What each one must contain, and the facts to verify before writing a word.

## Verify before drafting

A policy describing behaviour the product does not have is a misrepresentation,
not a formality. Read the code first.

For the current products (verified 2026-08-26 in `carouselcraft/src/lib/db/schema.ts`):

**Personal data collected:** name, email, email verification status, profile
image URL, account timestamps. Session tokens. Organisation membership where
used.

**Third parties receiving data:**

| Processor | Role | Data |
|---|---|---|
| LemonSqueezy | Merchant of Record | Name, email, billing details |
| AWS SES | Transactional email | Name, email |
| AWS S3 | Object storage | Uploaded files, where used |
| Cloudflare | CDN and tunnel | IP address, request metadata |
| Self-hosted Postgres | Primary store | Everything above |

CarouselCraft renders carousels **client-side** — slide content never reaches
the server. That is a genuine privacy advantage and worth stating plainly,
because it is true.

Re-verify this table per product before reusing it. It goes stale the moment a
dependency is added.

## Terms of Service

- Who the provider is — a person or a company, stated honestly
- What the service does, described accurately
- Account rules: eligibility, one account per person, responsibility for
  credentials
- Acceptable use: no illegal content, no attacks on the service, no resale
  unless permitted
- Payment terms: price, billing period, renewal, and who the seller of record is
- Refund policy — specific, not "at our discretion"
- Termination: how either side ends the relationship
- Liability limitation and warranty disclaimer
- Governing law and jurisdiction
- How changes to the terms are communicated

Under a Merchant of Record, say so explicitly: the platform is the seller to the
customer, and that is why their name appears on the invoice.

## Privacy Policy

- Identity and contact details of the controller
- Each category of data collected, and why
- Legal basis per purpose under GDPR — contract, legitimate interest, consent
- Every sub-processor, named, with what they receive
- Retention periods, or the criteria used to decide
- User rights: access, rectification, erasure, portability, objection
- How to exercise those rights, and the response window
- International transfer mechanism where data leaves the EEA
- Cookie use, if any non-essential cookies are set
- Breach notification commitment

Vague language is worse than plain language. "We may share data with partners"
invites suspicion; a named list invites trust.

## Refund policy

MoR platforms require a clear one. Vague terms cause chargebacks, and chargebacks
threaten the merchant account itself.

State the window, what qualifies, how to request, and how long processing takes.
A generous refund policy costs less than a disputed charge.

## Acceptable Use Policy

Matters for anything that generates or hosts user content. Both current products
generate images from user-supplied text, so define what is prohibited and
reserve the right to terminate for violations.

## DPA — data processing agreement

Needed once business customers ask, which they will if they are EU-based. Not
urgent pre-revenue, but expect it at the first serious B2B conversation.

## Practical sequencing

1. Terms of Service and Privacy Policy — required for MoR approval, blocking
2. Refund policy — required, can live inside the Terms
3. Acceptable Use — soon after
4. DPA — when first asked

Publish at `/terms` and `/privacy`, linked from the footer. MoR reviewers check
that the links resolve.

**Note for the current products:** both serve `robots.txt: Disallow: /` and a
`noindex` meta tag. Legal pages should remain reachable by a human at a stable
URL regardless — a reviewer will open them directly.
