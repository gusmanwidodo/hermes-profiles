#!/usr/bin/env node
/**
 * Content queue — plan, check, and track posts without any platform API.
 *
 * The scheduling layer is useful long before publishing credentials exist, and
 * consistency is what actually decides whether an account survives past week
 * three. So this runs standalone.
 *
 * Usage:
 *   node queue.mjs add --platform linkedin --date 2026-09-01 --source auth-kit-permissions --file draft.md
 *   node queue.mjs check <id>       # preflight a draft
 *   node queue.mjs due              # what should go out today or is overdue
 *   node queue.mjs list [status]
 *   node queue.mjs done <id>
 *
 * Queue lives at ~/.hermes/content-queue.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const QUEUE = process.env.CONTENT_QUEUE ?? join(homedir(), ".hermes", "content-queue.json");

const LIMITS = {
  linkedin: { max: 3000, sweet: [900, 1600] },
  threads: { max: 500, sweet: [150, 400] },
  instagram: { max: 2200, sweet: [300, 900] },
  tiktok: { max: 2200, sweet: [100, 300] },
};

/** Phrases that mark a draft as machine-written or hollow. */
const TELLS = [
  [/\bgame[- ]chang(er|ing)\b/i, "'game-changer'"],
  [/\bunlock(ing)? the power\b/i, "'unlock the power'"],
  [/\blet that sink in\b/i, "'let that sink in'"],
  [/\bhere'?s the thing\b/i, "'here's the thing'"],
  [/\bin today'?s .{0,25}(world|landscape|era)\b/i, "'in today's … landscape'"],
  [/\bit'?s not just .{1,30}, it'?s\b/i, "'it's not just X, it's Y'"],
  [/\bdive deep(er)? into\b/i, "'dive deep into'"],
  [/\bthoughts\?\s*$/im, "engagement bait ('thoughts?')"],
  [/\bagree\?\s*$/im, "engagement bait ('agree?')"],
  [/\bcomment below\b/i, "engagement bait ('comment below')"],
  [/🚀/, "rocket emoji"],
  [/\b(revolutioniz|transformativ|cutting[- ]edge|seamless)\w*/i, "marketing filler"],
  [/\bI helped (a |my )?client\b/i, "client claim — there are no clients"],
];

/** Numbers that look like performance claims and need a reproducible source. */
const NUMERIC_CLAIM = /(\d+(?:\.\d+)?)\s*(×|x)\s*(faster|slower|smaller|better)|(\d+)%\s*(faster|slower|improvement)/gi;

function load() {
  if (!existsSync(QUEUE)) return { items: [], nextId: 1 };
  return JSON.parse(readFileSync(QUEUE, "utf8"));
}

function save(q) {
  mkdirSync(dirname(QUEUE), { recursive: true });
  writeFileSync(QUEUE, JSON.stringify(q, null, 2));
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/** Preflight: length, AI tells, unsourced numeric claims. */
function check(item) {
  const problems = [];
  const warnings = [];
  const text = item.text ?? "";
  const limit = LIMITS[item.platform];

  if (!text.trim()) {
    problems.push("draft is empty");
    return { problems, warnings };
  }

  if (limit) {
    if (text.length > limit.max) {
      problems.push(`${text.length} chars exceeds ${item.platform} limit of ${limit.max}`);
    } else if (text.length < limit.sweet[0]) {
      warnings.push(`${text.length} chars is short for ${item.platform} (${limit.sweet[0]}–${limit.sweet[1]} tends to land better)`);
    } else if (text.length > limit.sweet[1]) {
      warnings.push(`${text.length} chars is long for ${item.platform} (sweet spot ${limit.sweet[0]}–${limit.sweet[1]})`);
    }
  }

  for (const [re, label] of TELLS) {
    if (re.test(text)) problems.push(`contains ${label}`);
  }

  const claims = [...text.matchAll(NUMERIC_CLAIM)].map((m) => m[0]);
  if (claims.length && !item.source) {
    problems.push(
      `performance claim (${claims.join(", ")}) with no --source recorded. ` +
        "Every number must trace to something reproducible.",
    );
  }

  // Em-dash pileup is a reliable machine-writing tell.
  const emDashes = (text.match(/—/g) ?? []).length;
  if (emDashes > 3) {
    warnings.push(`${emDashes} em-dashes — reads as AI-written above about 3; run the humanizer skill`);
  }

  if (!item.source) warnings.push("no source recorded — what real work does this post come from?");

  return { problems, warnings };
}

const cmd = process.argv[2];
const q = load();

if (cmd === "add") {
  const file = arg("file");
  const platform = (arg("platform") ?? "").toLowerCase();
  if (!LIMITS[platform]) {
    console.error(`--platform must be one of: ${Object.keys(LIMITS).join(", ")}`);
    process.exit(2);
  }
  const item = {
    id: q.nextId++,
    platform,
    date: arg("date") ?? new Date().toISOString().slice(0, 10),
    source: arg("source"),
    text: file && existsSync(file) ? readFileSync(file, "utf8") : (arg("text") ?? ""),
    status: "queued",
    created: new Date().toISOString(),
  };
  q.items.push(item);
  save(q);

  const { problems, warnings } = check(item);
  console.log(`Queued #${item.id} for ${platform} on ${item.date}`);
  for (const w of warnings) console.log(`  ! ${w}`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  if (!problems.length) console.log("  ✓ preflight clean");
  process.exit(0);
}

if (cmd === "check") {
  const item = q.items.find((i) => i.id === Number(process.argv[3]));
  if (!item) { console.error("not found"); process.exit(2); }
  const { problems, warnings } = check(item);
  console.log(`\n#${item.id} · ${item.platform} · ${item.date} · ${item.text.length} chars`);
  console.log(`source: ${item.source ?? "(none)"}\n`);
  for (const w of warnings) console.log(`  ! ${w}`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  if (!problems.length && !warnings.length) console.log("  ✓ clean");
  process.exit(problems.length ? 1 : 0);
}

if (cmd === "due") {
  const today = new Date().toISOString().slice(0, 10);
  const due = q.items.filter((i) => i.status === "queued" && i.date <= today);
  if (!due.length) { console.log("Nothing due."); process.exit(0); }
  console.log(`\n${due.length} post(s) due:\n`);
  for (const i of due) {
    const late = i.date < today ? ` (${i.date}, overdue)` : "";
    const { problems } = check(i);
    const flag = problems.length ? ` — ${problems.length} blocking issue(s)` : "";
    console.log(`  #${i.id} ${i.platform}${late}${flag}`);
    console.log(`     ${i.text.slice(0, 70).replace(/\n/g, " ")}…`);
  }
  console.log();
  process.exit(0);
}

if (cmd === "done") {
  const item = q.items.find((i) => i.id === Number(process.argv[3]));
  if (!item) { console.error("not found"); process.exit(2); }
  item.status = "posted";
  item.posted = new Date().toISOString();
  save(q);
  console.log(`#${item.id} marked posted`);
  process.exit(0);
}

if (cmd === "list") {
  const filter = process.argv[3];
  const items = filter ? q.items.filter((i) => i.status === filter) : q.items;
  if (!items.length) { console.log("Queue is empty."); process.exit(0); }
  console.log();
  for (const i of items) {
    console.log(`  #${i.id} [${i.status}] ${i.platform} ${i.date} — ${(i.source ?? "no source")}`);
  }
  console.log(`\n${items.length} item(s). Queue: ${QUEUE}\n`);
  process.exit(0);
}

console.log(`
Content queue — plan and check posts. No platform API needed.

  add --platform <p> --date YYYY-MM-DD --source <what> --file <draft.md>
  check <id>     preflight one draft
  due            what is due or overdue today
  list [status]  queued | posted
  done <id>      mark as posted

Platforms: ${Object.keys(LIMITS).join(", ")}
Queue file: ${QUEUE}
`);
