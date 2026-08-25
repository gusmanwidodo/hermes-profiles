---
name: crypto-fundamentals
description: Fundamental analysis for BTC, ETH, BNB, SOL from verified live data.
version: 1.0.0
license: MIT
metadata:
  verified: 2026-08-25
  hermes:
    tags: [crypto, bitcoin, ethereum, bnb, solana, onchain, valuation, cycles]
---

# Crypto Fundamentals: BTC · ETH · BNB · SOL

Pull real market and on-chain data, interpret it against fundamental frameworks,
and present it honestly. This skill exists so an analysis rests on numbers that
were actually fetched, never on recalled prices or invented metrics.

## Read this before anything else

**Nobody can reliably time market tops and bottoms.** Not this skill, not any
indicator, not any analyst. What follows are frameworks for reading conditions
and managing risk — they shift probabilities, they do not produce certainty.

Three rules that override everything below:

1. **Never state a price without fetching it.** Crypto prices move constantly.
   A price from model memory is wrong. Fetch, then cite, with a timestamp.
2. **Never say "buy now" or "sell now."** Present the conditions and what they
   have historically implied. The person holding the risk makes the call.
3. **Say what you could not verify.** An honest gap is worth more than a
   confident fabrication, especially where money is involved.

## Working data sources

Verified reachable from this machine on 2026-08-25. **Most exchange APIs
(Binance, Coinbase, Kraken, Bybit, OKX) return HTTP 000 — connection blocked,
most likely geographic.** Do not build on them here; funding rates and order
book depth are not available without a proxy.

| Source | Gives you | Endpoint |
|---|---|---|
| CoinGecko | price, market cap, 24h change, dominance | `api.coingecko.com/api/v3/` |
| Blockchair | BTC height, hashrate, difficulty, mempool | `api.blockchair.com/bitcoin/stats` |
| DefiLlama | TVL per chain, protocol revenue | `api.llama.fi/v2/chains` |
| Alternative.me | Fear & Greed index | `api.alternative.me/fng/` |
| CoinPaprika | price, supply, ATH distance | `api.coinpaprika.com/v1/tickers/` |
| blockchain.info | BTC block height | `blockchain.info/q/getblockcount` |

Free tiers rate-limit. Cache within a session rather than refetching per
question.

## Quick pull

```bash
# Price, market cap, 24h move for all four
curl -s "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd&include_market_cap=true&include_24hr_change=true"

# BTC on-chain state
curl -s "https://api.blockchair.com/bitcoin/stats"

# Sentiment
curl -s "https://api.alternative.me/fng/?limit=1"

# Chain TVL
curl -s "https://api.llama.fi/v2/chains"
```

`scripts/snapshot.mjs` runs all of these and prints one consolidated report —
prefer it over ad-hoc calls.

## Frameworks

Load what the question needs:

- `references/valuation.md` — what actually drives value per asset, and the
  metrics that matter for each
- `references/cycles.md` — halving arithmetic, sentiment extremes, dominance
  rotation, and what they have historically preceded
- `references/risk.md` — position sizing, DCA versus lump sum, the failure
  modes that ruin portfolios

## How to answer a timing question

When asked "is now a good time to buy X":

1. **Fetch current data.** Price, market cap, sentiment, cycle position, and
   the fundamental metric for that asset.
2. **State conditions, not verdicts.** "Fear & Greed at 74 (Greed); historically
   readings above 75 have preceded drawdowns more often than continuations" is
   useful. "Sell now" is not.
3. **Give both sides.** What supports buying here, what argues against it.
4. **Surface the risk that would hurt most** if the thesis is wrong.
5. **Ask about their situation** when it changes the answer: time horizon,
   existing exposure, whether this is money they can afford to lose.

Never produce a single-number price target. Ranges with reasoning, or nothing.

## Honesty requirements

- Timestamp every figure. Crypto data goes stale in minutes.
- Name the source for each number.
- If an API fails, say so — do not fill the gap from memory.
- Distinguish clearly between what the data shows and what you infer from it.
- No fabricated on-chain metrics. If you cannot fetch MVRV, NUPL, or SOPR, say
  they were unavailable rather than estimating them.
