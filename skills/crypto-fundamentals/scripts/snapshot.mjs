#!/usr/bin/env node
/**
 * One consolidated market snapshot from every source verified reachable.
 *
 * Sources that fail are reported as failures, never filled in from memory —
 * a gap you can see beats a number you cannot trust.
 *
 * Usage:
 *   node scripts/snapshot.mjs
 *   node scripts/snapshot.mjs --json
 */

const JSON_OUT = process.argv.includes("--json");
const TIMEOUT = 20000;

async function get(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Fetch a host that the local resolver may be lying about.
 *
 * Some ISPs answer blocked domains with a block page instead of the real
 * address — api.binance.com resolving to aduankonten.id, for instance. The IPs
 * are reachable; only DNS is poisoned. So resolve over DoH, which the ISP
 * cannot forge, and connect to that address directly.
 *
 * Addressing the IP in the URL does not work: TLS then sends the IP as SNI and
 * the server rejects the handshake. The hostname has to stay in the URL while
 * the socket is pointed elsewhere, which is what a custom lookup does.
 *
 * With system-level DNS-over-TLS configured this path is never taken — the
 * plain fetch succeeds first.
 */
async function getViaDoH(host, path) {
  try {
    return await get(`https://${host}${path}`);
  } catch {
    // Fall through to explicit DoH resolution.
  }

  // Cloudflare's DoH endpoint requires this exact Accept header. Sending
  // application/json returns HTTP 400.
  const doh = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${host}&type=A`,
    {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { accept: "application/dns-json" },
    },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  const ip = doh?.Answer?.filter((a) => a.type === 1)?.[0]?.data;
  if (!ip) throw new Error(`could not resolve ${host} via DoH`);

  const { Agent } = await import("node:https");
  const agent = new Agent({
    // Point the socket at the DoH-resolved address while leaving the URL —
    // and therefore SNI and certificate validation — on the real hostname.
    // The callback must hand back an array of {address, family}; the
    // (err, address, family) form throws ERR_INVALID_IP_ADDRESS here.
    lookup: (_hostname, _opts, cb) => cb(null, [{ address: ip, family: 4 }]),
  });

  const { request } = await import("node:https");

  return new Promise((resolve, reject) => {
    const r = request(
      `https://${host}${path}`,
      { agent, headers: { accept: "application/json" }, timeout: TIMEOUT },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} (via ${ip})`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    r.end();
  });
}

const out = { fetched_at: new Date().toISOString(), sources: {}, errors: {} };

// ── Prices ─────────────────────────────────────────────────────────────────
try {
  const ids = "bitcoin,ethereum,binancecoin,solana";
  const d = await get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}` +
      `&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,
  );
  out.sources.prices = {
    BTC: d.bitcoin,
    ETH: d.ethereum,
    BNB: d.binancecoin,
    SOL: d.solana,
  };
} catch (e) {
  out.errors.prices = `CoinGecko: ${e.message}`;
}

// ── Market structure ───────────────────────────────────────────────────────
try {
  const g = await get("https://api.coingecko.com/api/v3/global");
  out.sources.global = {
    total_mcap_usd: g.data.total_market_cap.usd,
    btc_dominance: g.data.market_cap_percentage.btc,
    eth_dominance: g.data.market_cap_percentage.eth,
    mcap_change_24h: g.data.market_cap_change_percentage_24h_usd,
  };
} catch (e) {
  out.errors.global = `CoinGecko global: ${e.message}`;
}

// ── Sentiment ──────────────────────────────────────────────────────────────
try {
  const f = await get("https://api.alternative.me/fng/?limit=2");
  out.sources.sentiment = {
    value: Number(f.data[0].value),
    label: f.data[0].value_classification,
    yesterday: f.data[1] ? Number(f.data[1].value) : null,
  };
} catch (e) {
  out.errors.sentiment = `Alternative.me: ${e.message}`;
}

// ── Bitcoin on-chain + cycle position ──────────────────────────────────────
try {
  const b = await get("https://api.blockchair.com/bitcoin/stats");
  const d = b.data;
  const height = d.blocks;

  const HALVINGS = [210000, 420000, 630000, 840000, 1050000, 1260000];
  const prev = HALVINGS.filter((h) => h <= height).pop();
  const next = HALVINGS.find((h) => h > height);
  const BLOCKS_PER_YEAR = 144 * 365;

  out.sources.bitcoin_onchain = {
    block_height: height,
    hashrate_24h: d.hashrate_24h,
    difficulty: d.difficulty,
    mempool_transactions: d.mempool_transactions,
    mempool_size_bytes: d.mempool_size,
    market_price_usd: d.market_price_usd,
  };
  out.sources.cycle = {
    last_halving_block: prev,
    next_halving_block: next,
    years_since_halving: +((height - prev) / BLOCKS_PER_YEAR).toFixed(2),
    years_to_next_halving: +((next - height) / BLOCKS_PER_YEAR).toFixed(2),
    pct_through_cycle: +(((height - prev) / (next - prev)) * 100).toFixed(1),
  };
} catch (e) {
  out.errors.bitcoin_onchain = `Blockchair: ${e.message}`;
}

// ── Chain fundamentals ─────────────────────────────────────────────────────
try {
  const chains = await get("https://api.llama.fi/v2/chains");
  const pick = (name) => {
    const c = chains.find((x) => x.name === name);
    return c ? +(c.tvl / 1e9).toFixed(2) : null;
  };
  out.sources.tvl_usd_billions = {
    Ethereum: pick("Ethereum"),
    Solana: pick("Solana"),
    BSC: pick("BSC"),
  };
} catch (e) {
  out.errors.tvl = `DefiLlama: ${e.message}`;
}

// ── Supply and distance from all-time high ─────────────────────────────────
try {
  const map = {
    BTC: "btc-bitcoin",
    ETH: "eth-ethereum",
    BNB: "bnb-binance-coin",
    SOL: "sol-solana",
  };
  const ath = {};
  for (const [sym, id] of Object.entries(map)) {
    try {
      const t = await get(`https://api.coinpaprika.com/v1/tickers/${id}`);
      const q = t.quotes.USD;
      ath[sym] = {
        price: q.price,
        pct_from_ath: q.percent_from_price_ath,
        ath_date: q.ath_date,
        // CoinPaprika exposes total_supply; circulating_supply is absent on
        // this endpoint. Using the wrong field silently yields NaN.
        supply: t.total_supply ?? t.circulating_supply ?? null,
        max_supply: t.max_supply || null,
      };
    } catch {
      ath[sym] = null;
    }
  }
  out.sources.ath_and_supply = ath;
} catch (e) {
  out.errors.ath = `CoinPaprika: ${e.message}`;
}

// ── Derivatives positioning ────────────────────────────────────────────────
// Funding rate is what perpetual longs pay shorts (or vice versa) to keep the
// contract tethered to spot. Persistently positive means leveraged longs are
// crowded and paying to stay in — historically a condition that precedes long
// squeezes. Negative means the reverse. It is a positioning read, not a signal.
try {
  const funding = {};
  for (const [sym, pair] of Object.entries({
    BTC: "BTCUSDT",
    ETH: "ETHUSDT",
    BNB: "BNBUSDT",
    SOL: "SOLUSDT",
  })) {
    try {
      const d = await getViaDoH(
        "fapi.binance.com",
        `/fapi/v1/premiumIndex?symbol=${pair}`,
      );
      const rate = Number(d.lastFundingRate);
      funding[sym] = {
        rate_pct: +(rate * 100).toFixed(4),
        // Funding settles every 8h on Binance, so 3 periods a day.
        annualized_pct: +(rate * 3 * 365 * 100).toFixed(1),
        mark_price: Number(d.markPrice),
      };
    } catch {
      funding[sym] = null;
    }
  }
  if (Object.values(funding).some(Boolean)) {
    out.sources.funding_rate = funding;
  } else {
    out.errors.funding_rate = "Binance futures unreachable (check DNS)";
  }
} catch (e) {
  out.errors.funding_rate = `Binance futures: ${e.message}`;
}

// ── Report ─────────────────────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const usd = (n) =>
  n == null ? "n/a" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
const pct = (n) => (n == null ? "n/a" : (n >= 0 ? "+" : "") + Number(n).toFixed(2) + "%");

console.log(`\nMARKET SNAPSHOT — ${out.fetched_at}`);
console.log("=".repeat(64));

if (out.sources.prices) {
  console.log("\nPRICE (CoinGecko)");
  for (const [sym, d] of Object.entries(out.sources.prices)) {
    console.log(
      `  ${sym.padEnd(4)} ${usd(d.usd).padEnd(14)} 24h ${pct(d.usd_24h_change).padEnd(9)} mcap ${usd(d.usd_market_cap)}`,
    );
  }
}

if (out.sources.global) {
  const g = out.sources.global;
  console.log("\nMARKET STRUCTURE (CoinGecko)");
  console.log(`  total mcap      ${usd(g.total_mcap_usd)}  (24h ${pct(g.mcap_change_24h)})`);
  console.log(`  BTC dominance   ${g.btc_dominance.toFixed(1)}%`);
  console.log(`  ETH dominance   ${g.eth_dominance.toFixed(1)}%`);
}

if (out.sources.sentiment) {
  const s = out.sources.sentiment;
  const move = s.yesterday != null ? ` (yesterday ${s.yesterday})` : "";
  console.log("\nSENTIMENT (Alternative.me)");
  console.log(`  Fear & Greed    ${s.value} — ${s.label}${move}`);
}

if (out.sources.cycle) {
  const c = out.sources.cycle;
  console.log("\nCYCLE POSITION (derived from Bitcoin block height)");
  console.log(`  last halving    block ${c.last_halving_block} — ${c.years_since_halving}y ago`);
  console.log(`  next halving    block ${c.next_halving_block} — ~${c.years_to_next_halving}y away`);
  console.log(`  through cycle   ${c.pct_through_cycle}%`);
}

if (out.sources.bitcoin_onchain) {
  const b = out.sources.bitcoin_onchain;
  console.log("\nBITCOIN ON-CHAIN (Blockchair)");
  console.log(`  block height    ${b.block_height}`);
  console.log(`  difficulty      ${Number(b.difficulty).toExponential(3)}`);
  console.log(`  mempool         ${b.mempool_transactions} tx`);
}

if (out.sources.tvl_usd_billions) {
  console.log("\nCHAIN TVL (DefiLlama)");
  for (const [chain, tvl] of Object.entries(out.sources.tvl_usd_billions)) {
    console.log(`  ${chain.padEnd(10)} ${tvl == null ? "n/a" : "$" + tvl + "B"}`);
  }
}

if (out.sources.ath_and_supply) {
  console.log("\nDISTANCE FROM ATH (CoinPaprika)");
  for (const [sym, d] of Object.entries(out.sources.ath_and_supply)) {
    if (!d) {
      console.log(`  ${sym.padEnd(4)} unavailable`);
      continue;
    }
    const supply =
      d.max_supply && d.supply
        ? `${((d.supply / d.max_supply) * 100).toFixed(1)}% of max issued`
        : "no max supply";
    console.log(`  ${sym.padEnd(4)} ${pct(d.pct_from_ath).padEnd(10)} from ATH (${d.ath_date?.slice(0, 10)})  ${supply}`);
  }
}

if (out.sources.funding_rate) {
  console.log("\nFUNDING RATE — perpetuals (Binance)");
  for (const [sym, f] of Object.entries(out.sources.funding_rate)) {
    if (!f) {
      console.log(`  ${sym.padEnd(4)} unavailable`);
      continue;
    }
    const lean =
      f.rate_pct > 0.01 ? "longs paying" : f.rate_pct < -0.01 ? "shorts paying" : "balanced";
    console.log(
      `  ${sym.padEnd(4)} ${(f.rate_pct >= 0 ? "+" : "") + f.rate_pct.toFixed(4)}% per 8h  ` +
        `(${(f.annualized_pct >= 0 ? "+" : "") + f.annualized_pct}% annualized)  ${lean}`,
    );
  }
}

if (Object.keys(out.errors).length) {
  console.log("\nUNAVAILABLE — do not substitute remembered values");
  for (const [k, v] of Object.entries(out.errors)) console.log(`  ${k}: ${v}`);
}

console.log(
  "\nData only. Not a recommendation. Nobody can reliably time this market.\n",
);
