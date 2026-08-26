#!/usr/bin/env node
/**
 * Check whether a URL is actually shareable before pushing it to social.
 *
 * Looks at what a crawler sees, not what a browser renders: robots.txt, the
 * meta robots tag, Open Graph and Twitter card tags, and whether the preview
 * image genuinely loads.
 *
 * Exit 0 when shareable, 1 when something would break the post.
 *
 * Usage: node scripts/preflight.mjs https://example.com
 */

const url = process.argv[2];
if (!url) {
  console.error("Usage: node preflight.mjs <url>");
  process.exit(2);
}

const TIMEOUT = 25000;
const problems = [];
const warnings = [];
const ok = [];

const origin = new URL(url).origin;

async function get(target, asBot = true) {
  const res = await fetch(target, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: asBot
      ? { "user-agent": "Twitterbot/1.0" }   // what a social crawler sends
      : {},
    redirect: "follow",
  });
  return res;
}

// ── robots.txt ─────────────────────────────────────────────────────────────
try {
  const res = await get(`${origin}/robots.txt`);
  const body = await res.text();
  if (res.status === 200 && /^\s*Disallow:\s*\/\s*$/im.test(body)) {
    problems.push(
      "robots.txt returns 'Disallow: /'. Most social crawlers honour it, so the " +
        "link preview will not render and the post will look broken.",
    );
  } else if (res.status === 200) {
    ok.push("robots.txt permits crawling");
  } else {
    ok.push(`robots.txt returns ${res.status} (no restriction)`);
  }
} catch (e) {
  warnings.push(`robots.txt unreachable: ${e.message}`);
}

// ── page HTML as a crawler sees it ─────────────────────────────────────────
let html = "";
try {
  const res = await get(url);
  html = await res.text();
  if (res.status !== 200) {
    problems.push(`Page returned HTTP ${res.status} to a crawler user-agent.`);
  } else {
    ok.push("page returns 200 to a crawler");
  }
} catch (e) {
  problems.push(`Page unreachable: ${e.message}`);
}

const meta = (re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};

// ── meta robots ────────────────────────────────────────────────────────────
const robotsMeta = meta(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
if (robotsMeta && /noindex|nofollow/i.test(robotsMeta)) {
  problems.push(
    `<meta name="robots" content="${robotsMeta}"> blocks indexing. No organic ` +
      "search, and some crawlers skip the preview entirely.",
  );
} else if (robotsMeta) {
  ok.push(`meta robots: ${robotsMeta}`);
} else {
  ok.push("no restrictive meta robots tag");
}

// ── Open Graph / Twitter tags ──────────────────────────────────────────────
const ogTitle = meta(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i);
const ogDesc = meta(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
const ogImage = meta(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
const twCard = meta(/<meta[^>]+name="twitter:card"[^>]+content="([^"]*)"/i);

if (!ogTitle) problems.push("Missing og:title — the preview has no headline.");
else ok.push(`og:title present (${ogTitle.length} chars)`);

if (!ogDesc) warnings.push("Missing og:description — preview shows no summary.");
else ok.push(`og:description present (${ogDesc.length} chars)`);

if (!twCard) {
  warnings.push(
    "Missing twitter:card — X falls back to a small preview instead of a large image.",
  );
} else {
  ok.push(`twitter:card: ${twCard}`);
}

// ── does the preview image actually load? ──────────────────────────────────
if (!ogImage) {
  problems.push("Missing og:image — the post will render as a bare link.");
} else {
  const decoded = ogImage.replace(/&amp;/g, "&");

  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(decoded)) {
    problems.push(
      `og:image points at ${decoded.slice(0, 60)}… — a localhost URL baked in ` +
        "at build time. No crawler can fetch it, so no preview will ever render. " +
        "Set APP_URL during the Docker build, not just at runtime: Next.js " +
        "resolves metadataBase when it pre-renders static pages.",
    );
  } else if (!/^https?:\/\//i.test(decoded)) {
    problems.push(`og:image is not an absolute URL: ${decoded.slice(0, 60)}`);
  } else {
    try {
      const res = await fetch(decoded, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { "user-agent": "Twitterbot/1.0" },
      });
      const type = res.headers.get("content-type") ?? "";
      const len = Number(res.headers.get("content-length") ?? 0);
      if (!res.ok) {
        problems.push(`og:image returns HTTP ${res.status}: ${decoded.slice(0, 60)}`);
      } else if (!type.startsWith("image/")) {
        problems.push(`og:image is not an image (content-type: ${type})`);
      } else {
        ok.push(`og:image loads (${type}${len ? `, ${(len / 1024).toFixed(0)}KB` : ""})`);
      }
    } catch (e) {
      problems.push(`og:image unreachable: ${e.message}`);
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\nSHAREABILITY PREFLIGHT — ${url}`);
console.log("=".repeat(64));

if (ok.length) {
  console.log("\nPASS");
  for (const o of ok) console.log(`  ✓ ${o}`);
}
if (warnings.length) {
  console.log("\nWARN — post will work but perform worse");
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (problems.length) {
  console.log("\nBLOCKING — fix before posting");
  problems.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  console.log(
    `\n${problems.length} blocking issue(s). A launch post with a broken preview ` +
      "gets a fraction of the clicks.\n",
  );
  process.exit(1);
}

console.log("\nShareable.\n");
