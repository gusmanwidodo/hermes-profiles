# Indonesia

Written for a founder resident in Indonesia selling software to customers
worldwide. Verified 2026-08-26 against official sources; re-verify before
relying on any figure, because these rules change and recently did.

**This is orientation, not tax or legal advice.** For anything with money at
stake, a konsultan pajak or lawyer. What follows is meant to make that
conversation shorter.

## Income tax on software revenue

**PPh Final UMKM — 0.5% of gross revenue.**

Source: [PP 20/2026](https://www.pajak.go.id/en/node/119950), promulgated
22 April 2026, amending PP 55/2022.

| | Position |
|---|---|
| Rate | 0.5% of gross turnover |
| Threshold | Under Rp 4.8 billion per tax year |
| Eligible | Individuals (orang pribadi), single-founder perseroan perorangan, cooperatives |
| Time limit | **Removed for individuals** — previously capped at 7 years |
| Tax-free floor | First Rp 500 million of turnover for individuals |

**Two changes in PP 20/2026 that invalidate older guidance:**

1. **The 7-year limit is gone** for individual taxpayers and single-founder
   perseroan perorangan. Article 59 of PP 55/2022 was deleted. Any source still
   describing a 7-year cap predates April 2026.

2. **The Rp 4.8bn threshold is now aggregated** across the taxpayer, their
   spouse, all perseroan perorangan either founded, and income of minor
   children — including foreign-earned revenue. This applies even where a
   marital property separation agreement exists. Previously it was measured per
   entity.

CV, firma, ordinary PT, and BUMDes are **no longer eligible** for the 0.5%
regime, with transitional relief for those already using it. This was aimed at
firm splitting.

**Practical reading for a pre-revenue micro-SaaS portfolio:** operating as an
individual keeps this simple and cheap. Formation becomes worth discussing on
approach to the threshold, or when a counterparty requires an entity.

## Personal data — UU PDP

**UU No. 27/2022 tentang Pelindungan Data Pribadi.** Enacted 17 October 2022,
in **full enforcement since November 2024** after the two-year transition.

Broadly modelled on GDPR. It applies to any organisation processing Indonesian
citizens' personal data, whether or not the processing happens in Indonesia.

Obligations that map onto a small SaaS:

- Lawful basis for processing — consent, contract, legal obligation, vital
  interest, public task, or legitimate interest
- Purpose limitation, data minimisation, retention limits
- Data subject rights: access, correction, deletion, withdrawal of consent,
  objection to automated processing, restriction, portability. Each needs a
  procedure, not just a paragraph in a policy.
- Breach notification
- DPAs with processors

Reported early KOMINFO enforcement focus: breach notification failures,
missing processor DPAs, and inadequate security after public breaches.

**The convenient part:** a privacy policy and deletion flow built for GDPR
covers most of UU PDP. Doing both at once costs little more than doing one.

## Selling internationally

**Merchant of Record removes the hardest part.** With LemonSqueezy or Paddle as
seller of record, the platform handles VAT, sales tax, and GST across
jurisdictions. Without one, selling to EU consumers means dealing with EU VAT
directly — impractical for a solo founder.

**What remains:** Indonesian income tax on what the platform pays out. Payouts
arrive net of the platform's fees and the tax it remitted.

**Documentation to keep:** platform payout reports, bank records, and evidence
that revenue is business income. If the 0.5% regime applies, gross turnover
including foreign-earned revenue is the base — the aggregation rule above makes
this stricter than it used to be.

## Entity or not

Operating as an individual is the default and it is fine at zero revenue.
Reasons the answer changes:

- Approaching Rp 4.8bn aggregate turnover
- A customer or partner requiring a legal entity
- Wanting liability separation between personal assets and the business
- Taking investment

**Perseroan perorangan** — the single-founder PT introduced by the Omnibus Law —
is the lightest formal option and retains 0.5% eligibility under PP 20/2026.

Discuss with a konsultan pajak before forming anything. The tax consequences of
the wrong structure outlast the paperwork.

## Sources

- PP 20/2026 — https://www.pajak.go.id/en/node/119950
- DJP on the transition — https://www.pajak.go.id/id/artikel/masa-transisi-pph-final-umkm-momentum-memperkuat-administrasi-dan-tata-kelola-usaha
- UU 27/2022 PDP — enforcement status per multiple 2026 secondary sources; verify against the statute text for anything load-bearing

Re-verify before acting. PP 20/2026 landed four months ago and replaced guidance
that had been stable since 2022.
