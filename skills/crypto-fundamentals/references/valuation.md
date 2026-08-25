# Valuation: what actually drives each asset

Four assets, four different value theses. Applying one framework to all of them
is the most common analytical mistake in this space.

## Bitcoin — monetary premium

BTC has no cash flow. It has no protocol revenue accruing to holders. Valuing
it with DCF or P/E is a category error. What it has is credible scarcity: a
supply schedule enforced by consensus that has never been changed.

**What matters:**

- **Supply issued.** Fetch from CoinPaprika: `total_supply / max_supply`. Above
  95% means the remaining issuance is nearly irrelevant to supply pressure.
- **Hashrate and difficulty.** Rising hashrate means miners are committing more
  capital, which is a revealed-preference signal about their expectations.
  Sustained decline means the opposite.
- **Halving position.** Derived from block height; see `cycles.md`.
- **Institutional flows.** ETF holdings are the demand-side variable that did
  not exist in earlier cycles.

**What does not matter:** transaction throughput (BTC does not compete on
speed), developer activity relative to smart-contract chains, TVL (near zero
by design).

## Ethereum — settlement layer with real revenue

ETH is the only one of the four where fee burn creates a genuine link between
usage and supply. Post-merge, if burn exceeds issuance, supply contracts.

**What matters:**

- **TVL.** From DefiLlama. Ethereum's TVL dwarfs the others by an order of
  magnitude, which is the core of the moat argument.
- **Fee burn versus issuance.** Determines whether supply is inflating or
  deflating. Requires a source such as ultrasound.money.
- **L2 dynamics.** Rollups moved activity off L1. This cuts L1 fee revenue
  while arguably strengthening the ecosystem. Reasonable people disagree on
  whether this is bullish or bearish for ETH specifically — say so rather than
  picking a side and presenting it as fact.
- **Staking ratio.** Locked ETH is not circulating supply.

## BNB — exchange equity in token form

BNB's value derives largely from Binance, the company. That makes it the most
centralized and the most regulatory-exposed of the four.

**What matters:**

- **Binance's business health.** Volume, market share, regulatory standing.
  BNB is closer to equity than to a commodity.
- **Burn schedule.** Quarterly burns reduce supply toward a 100M target. Supply
  issued (~67% of max) tells you how much burning remains.
- **BSC chain activity.** TVL and usage, though this is secondary to the
  exchange business.
- **Regulatory risk.** The single largest factor and the hardest to quantify.
  An enforcement action against Binance affects BNB in a way it would not
  affect BTC or ETH.

## Solana — high-throughput chain competing on performance

Newest of the four, highest beta, most reliant on continued adoption rather
than established position.

**What matters:**

- **TVL and DEX volume.** Whether activity is real and sticky.
- **Network reliability.** Historical outages are the central bear argument.
  Uptime since the last incident matters.
- **Inflation schedule.** SOL issues new supply on a declining schedule. Net
  supply change matters more than headline staking yield.
- **Ecosystem concentration.** If activity depends heavily on a small number of
  applications, that is concentration risk.

## Comparing them honestly

Market cap ranking is not a quality ranking. Useful comparisons:

- **TVL relative to market cap** — a rough "what is this chain's capital
  efficiency" read. Only meaningful for ETH, SOL, BNB. Meaningless for BTC.
- **Distance from all-time high** — context, not a signal. An asset down 60%
  can fall further; one near ATH can keep running.
- **Supply issued** — how much dilution is still ahead.

## What to refuse

Do not produce price targets. Not "$120k BTC by Q3", not "SOL to $200". Nobody
knows. Ranges tied to explicit assumptions are acceptable when asked; bare
numbers presented as forecasts are not.

Do not treat market cap as a valuation multiple. There is no earnings figure to
divide by for BTC, and for the others the relationship between protocol revenue
and token value is weak enough to make the exercise misleading.
