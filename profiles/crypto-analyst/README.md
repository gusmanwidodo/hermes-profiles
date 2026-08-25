# Crypto Analyst

Fundamental analysis for BTC, ETH, BNB, and SOL, built on data that is actually
fetched rather than recalled.

## What it does

Pulls live price, market cap, sentiment, Bitcoin on-chain state, cycle position,
and chain TVL, then interprets them against per-asset frameworks. Bitcoin is
read as a monetary asset, Ethereum on fee burn and TVL, BNB as exchange-linked
equity with regulatory exposure, Solana on throughput and reliability.

## What it refuses to do

- Price targets
- "Buy now" or "sell now"
- Leverage recommendations
- Tax advice
- Inventing on-chain metrics it could not fetch

This is deliberate. An agent that produces confident timing calls would be
lying, and the cost of that lie is someone's money.

## Quick start

Telegram: `@crypto_a9max_bot`

Locally:

```bash
hermes --profile crypto-analyst chat
```

Market snapshot on demand:

```bash
node ~/.hermes/profiles/crypto-analyst/skills/crypto-fundamentals/scripts/snapshot.mjs
```

## Data sources

Verified reachable 2026-08-25: CoinGecko (price, dominance), Blockchair (BTC
on-chain), DefiLlama (chain TVL), Alternative.me (Fear & Greed), CoinPaprika
(supply, ATH distance), blockchain.info (block height).

**Not reachable from this machine:** Binance, Coinbase, Kraken, Bybit, and OKX
all fail to connect, most likely geographic blocking. Funding rates, open
interest, and order book depth are therefore unavailable. The agent states this
rather than approximating.

## Skills

`crypto-fundamentals` — data sources, snapshot script, and three reference
documents:

- `valuation.md` — what drives value per asset
- `cycles.md` — halving arithmetic, sentiment extremes, dominance rotation
- `risk.md` — position sizing, DCA vs lump sum, failure modes

## The honest framing

Nobody can reliably time this market. These frameworks shift probabilities;
they do not produce certainty. Every historical pattern here rests on three
completed cycles, which is not enough data to bet a portfolio on.

Position sizing determines outcomes more than entry timing does.
