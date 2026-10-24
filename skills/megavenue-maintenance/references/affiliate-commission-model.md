# Affiliate commission: where the money lives

Read from schema + live DB on 2026-09-03. Three storage locations, deliberately
separated. Confusing them is how double-payment bugs get written.

## 1. `affiliates.commission_balance` — the actual debt

```
commission_balance   bigint NOT NULL DEFAULT 0   -- CENTS, not decimal
```

The only number that determines what is owed. `bigint` cents throughout — no
floating point anywhere in this path.

Exactly two operations touch it:

| Operation | Site |
|---|---|
| `+ commission` on accrual | `affiliates.service.ts` ~L396 |
| `= 0` when a settlement is generated | `affiliates.service.ts` ~L497 |

**There is no decrement path.** Nothing subtracts. See "Reversal" below.

Neighbours: `percentage_commission` (basis points — 1000 = 10.00%),
`fixed_commission` (cents).

## 2. `bookings.affiliate_commission` — a live projection

```
affiliate_commission              bigint NOT NULL DEFAULT 0
affiliate_commission_accrued_at   timestamptz NULL
```

NOT a balance. Recomputed by `syncBookingCommissionTx` whenever booking totals
move (promo, extras, item edits), so an affiliate can see what a sale is worth
before the guest pays.

`affiliate_commission_accrued_at` is the state machine:

- **NULL** → still a live projection, recomputed on every total change
- **set** → folded into the balance and **frozen**; `syncBookingCommissionTx`
  returns early and never touches it again

The freeze marker — *not* the commission amount — is what prevents
double-counting. A zero-commission affiliate must still be marked accrued, or
the projection keeps being recomputed on a finished booking. The marker is also
what makes accrual idempotent under job retries.

## 3. `affiliate_settlements.amount` — payment snapshot

Balance is copied here, then zeroed. Permanent payout history independent of the
running balance.

## Flow

```
booking created   → bookings.affiliate_commission        (projection, mutable)
      ↓ confirmed
accrual           → affiliates.commission_balance += x
                    affiliate_commission_accrued_at set  (projection frozen)
      ↓ settlement
payout            → affiliate_settlements.amount = balance
                    affiliates.commission_balance = 0
```

## Accrual trigger: `confirmed` (changed 2026-09-03, PR #311)

Was `completed`. Three paths reach `confirmed` and **all three must accrue**, or
affiliates are credited differently depending on how the guest paid:

| Path | File |
|---|---|
| Xendit payment webhook — the volume path | `tenant/payments/booking-confirmation.service.ts` |
| Reservation confirm transition | `tenant/reservations/reservations.service.ts` (`confirmReservationTx`) |
| Dashboard status edit | `tenant/bookings/bookings.service.ts` |

`booking-megatix.service.ts` also writes `status: 'confirmed'` — but on
`booking_megatix_tickets`, **not** on the booking. Not a confirmation path.

`PaymentsModule` imports `AffiliatesModule` for this. No cycle:
`AffiliatesModule` imports only `PaymentLinksModule`.

### Why `completed` was slower than it sounds

`completed` is not "the venue marked it done" — almost every booking reaches it
via the **auto-complete sweep**, `AUTO_COMPLETE_GRACE_HOURS` after the service
window closes. Balances lagged the sale by hours or days.

## Reversal — the accepted risk

Accrual on `completed` was safe because completion is terminal. On `confirmed`
it is not:

```
guest pays → confirmed → commission credited AND frozen
                ↓
      cancelled_by_venue / no_show
                ↓
      balance unchanged; settlement pays it out
```

The venue pays commission on a booking that never happened. The freeze also
stops later subtotal edits from being tracked.

Accepted deliberately by Gus (option "B") — confirmation is treated as the
moment the affiliate earned the sale. `reverseBookingCommissionTx` on
cancel/no-show is the natural follow-up. **Open question if implemented:**
whether the balance may go negative when the commission was already settled.

## Before changing this again

1. `grep -rn "accrueBookingCommissionTx" src --include=*.ts | grep -v spec`
   — find every trigger; there is more than one.
2. Check whether a reversal path now exists before assuming a status is safe
   to accrue on.
3. Update the **schema comments** in `database/schema/affiliates.ts` — that is
   where people look first to answer "when does this balance change", and they
   went stale in exactly this way once already.
