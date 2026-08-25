# Cycles and sentiment

Frameworks for reading where the market sits. All of them are probabilistic and
all of them have failed at least once. Treat them as context, never as triggers.

## Halving arithmetic

Bitcoin's issuance halves every 210,000 blocks. Block height is verifiable, so
cycle position is arithmetic rather than opinion:

```js
const HALVINGS = [210000, 420000, 630000, 840000, 1050000, 1260000];
const prev = HALVINGS.filter((h) => h <= height).pop();
const next = HALVINGS.find((h) => h > height);
const yearsSince = (height - prev) / (144 * 365);
const pctThrough = ((height - prev) / (next - prev)) * 100;
```

**The historical pattern** across three completed cycles: price peaked roughly
12–18 months after a halving, then drew down 70–80%, then accumulated into the
next one.

**Why to hold this loosely.** Three data points is not a pattern you can bet a
portfolio on. Each cycle had different conditions — 2013 had no institutions,
2017 had the ICO mania, 2021 had zero rates and stimulus. The 2024 cycle
introduced spot ETFs, which is a genuinely new demand structure. "This time is
different" is usually wrong, but "this time is identical" has also never been
right.

## Fear & Greed index

A composite of volatility, momentum, volume, social sentiment, and dominance.
Scale 0–100.

| Reading | Label | What it has historically meant |
|---|---|---|
| 0–24 | Extreme Fear | Often near local bottoms. Also occurs mid-crash. |
| 25–44 | Fear | Elevated risk, no clear edge |
| 45–55 | Neutral | No signal |
| 56–74 | Greed | Elevated risk of drawdown |
| 75–100 | Extreme Greed | Often near local tops. Also occurs mid-rally. |

**The trap:** extremes can persist far longer than seems reasonable. Extreme
Greed held for weeks during past bull runs while price kept climbing. Extreme
Fear held through months of decline. This index tells you the emotional
temperature, not the turning point.

Direction of travel is often more informative than the level. A drop from 80 to
60 says something different than a climb from 40 to 60 at the same reading.

## Bitcoin dominance

BTC market cap as a share of total crypto market cap.

- **Rising dominance** — capital consolidating into BTC. Typically risk-off,
  or early bull phase where BTC leads.
- **Falling dominance** — capital rotating into altcoins. Typically later bull
  phase, historically also the phase that precedes the sharpest reversals.

Useful for reading rotation between the four assets. ETH, BNB, and SOL tend to
underperform BTC when dominance rises and outperform when it falls.

## Distance from all-time high

Context, not a signal. Two things people get wrong:

1. **"Down 60%, must be cheap."** Assets down 60% have gone on to fall another
   80%. Drawdown depth says nothing about the floor.
2. **"Near ATH, must be expensive."** Assets at ATH have doubled from there.
   New highs are how bull markets work.

What it does tell you: how much drawdown this asset tolerates, which is a
volatility read useful for position sizing.

## On-chain signals worth naming

These are the metrics a serious analysis would use. **Most require a paid data
provider (Glassnode, CryptoQuant) and are not fetchable from the free sources
this skill uses.** Name them as unavailable rather than estimating.

- **MVRV** — market value over realized value. Above ~3.7 has historically
  marked cycle tops, below ~1 has marked bottoms.
- **NUPL** — net unrealized profit/loss across all holders.
- **SOPR** — whether coins are moving at a profit or a loss.
- **Exchange balances** — coins leaving exchanges suggests accumulation intent;
  inflows suggest sell intent.
- **Long-term holder supply** — coins unmoved for 155+ days.

## Reading conditions together

No single indicator decides anything. A defensible reading combines:

1. Cycle position from block height
2. Sentiment level and direction
3. Dominance trend
4. Fundamental metric for the specific asset (TVL, supply issued, burn)

When these disagree, say so. Conflicting signals are information: they mean the
setup is genuinely unclear, which is itself worth telling someone.

## What to never say

- "This is the bottom" or "this is the top"
- "X will reach $Y by [date]"
- "Now is the time to buy" or "sell everything"
- Any claim that a pattern will repeat because it repeated before

The honest framing is always: here are the conditions, here is what they have
historically preceded, here is what would invalidate that reading, and the
decision is yours.
