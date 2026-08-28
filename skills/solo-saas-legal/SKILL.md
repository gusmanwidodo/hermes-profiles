---
name: solo-saas-legal
description: Legal groundwork for a solo SaaS founder selling globally.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [legal, compliance, privacy, gdpr, terms, contracts, ip]
---

# Legal Groundwork for a Solo SaaS Founder

What a one-person software business selling internationally actually has to
deal with, and — just as importantly — what it does not.

## Read this first

**Nothing here is legal advice.** This skill organises questions, prepares
drafts, and flags risk. It does not replace a lawyer, and it cannot be relied
on the way advice from a qualified professional can be.

Three rules that govern everything below:

1. **Never state a law as settled fact without a source.** Jurisdictions differ
   and rules change. Cite, or say the position is unverified.
2. **Name the escalation point.** Every analysis ends by saying whether this is
   something a founder can handle alone or genuinely needs a lawyer. Getting
   that boundary wrong in either direction is expensive.
3. **Indonesian law is not the default.** Model training data skews heavily
   toward US law. For anything touching Indonesian entities, tax, or employment,
   verify against Indonesian sources or escalate — do not extrapolate from US
   practice.

## The 80% that is genuinely template-able

Most legal work for a small SaaS is standard. These are safe to draft and adapt,
provided the facts stated in them are true:

- Terms of Service
- Privacy Policy
- Cookie notice
- Acceptable Use Policy
- Refund policy
- DPA (data processing agreement) for business customers

The danger in these is not the legal language — it is **describing behaviour the
product does not have**. A privacy policy claiming data is never shared, in a
product that calls a third-party API, is worse than no policy: it is a
misrepresentation.

So: read the actual code before drafting. What data is collected, where it is
stored, which third parties receive it.

## The 20% that needs a real lawyer

- Company formation, and the choice between operating personally and forming an
  entity
- Anything involving tax across borders
- Employment or contractor agreements
- Trademark filing and disputes
- An actual dispute, demand letter, or takedown
- Investment, equity, or anything a third party will do diligence on
- A data breach

For these, the useful output is **a well-organised brief** the founder can hand
to a lawyer — facts, documents, specific questions — not an answer.

## Merchant of Record changes the picture

Selling through a Merchant of Record — LemonSqueezy, Paddle, Lemon-style
platforms — means the platform is the legal seller to the customer. It collects
and remits VAT, sales tax, and GST worldwide.

**What this removes:** VAT registration across dozens of jurisdictions, tax
remittance, invoice compliance per country. This is the single largest legal
simplification available to a solo founder selling globally, and it is why the
choice matters more than it looks.

**What remains yours:** income tax in your own country on what the platform pays
you, the terms between you and your users, data protection obligations, and the
accuracy of what you claim about the product.

**What MoR platforms require of you:** a published Terms of Service and Privacy
Policy, an accurate product description, working contact information, and a
clear refund policy. Missing these delays or blocks merchant approval.

## Data protection

If a product accepts signups from the EU or UK, **GDPR applies regardless of
where the founder sits.** There is no revenue threshold.

Practical minimum:

- A privacy policy naming what is collected, why, the legal basis, and how long
  it is kept
- A route for users to request deletion, and an implementation that honours it
- A list of sub-processors — every third party that touches user data
- Cookie consent, only where non-essential cookies are actually set

Auth systems collect personal data by definition. Email and name are personal
data under GDPR. So is an IP address in most readings.

**The honest position for a pre-revenue product:** enforcement against a tiny
SaaS with no users is unlikely, but the documents cost little and their absence
blocks payment processing anyway. Do them early because they are cheap, not
because the risk is acute.

## Intellectual property

**Code you write, you own.** Straightforward when there is no employer, no
co-founder, and no contractor.

**AI-generated code** is genuinely unsettled. Current US Copyright Office
guidance holds that purely machine-generated output is not copyrightable, while
human-directed and human-edited work generally is. This is being litigated and
should be described as unsettled, not resolved.

**Dependencies carry licences.** MIT and Apache-2.0 are permissive and fine for
commercial use. GPL and AGPL impose obligations that matter for a hosted
product — AGPL in particular reaches network use. Audit before shipping:

```bash
npx license-checker --summary
```

**Trademark** matters more than most founders expect for a product name. A name
that collides with an existing mark can force a rename after launch, which is
far more costly than checking first. Search before committing to a name — see
the domain-verification rule already in play.

## References

- `references/documents.md` — what each required document must contain
- `references/indonesia.md` — entity, tax, and local considerations
- `references/checklist.md` — pre-launch legal checklist per product

## Output

For document drafting: the draft itself, with every factual claim traceable to
something verified in the codebase or stated by the founder, and assumptions
flagged inline.

For analysis: what applies, what the exposure is, what it would cost to fix, and
whether a lawyer is needed.

Never a bare assertion about what the law requires without a source or a stated
uncertainty.
