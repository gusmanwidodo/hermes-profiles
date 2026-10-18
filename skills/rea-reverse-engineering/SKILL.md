---
name: rea-reverse-engineering
description: Reverse engineer binaries, JS/Electron apps, and runtime behavior via REA MCP.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [rea, reverse-engineering, mcp, binary, electron, analysis, evidence]
---

# REA — reverse engineer anything

An MCP server plus CLI for inspecting software without its source: native
binaries, JavaScript/Electron apps, .NET assemblies, and websites. Analysis runs
locally and every finding carries its evidence and its limitations.

Installed and verified 2026-10-18 — **rea 6.7.0**, MIT, from `morluto/rea`.

## Installed state on this machine

```
CLI        rea 6.7.0 (npm global), /home/gusman/.nvm/.../bin/rea
MCP        registered in Claude Code at USER scope -> works in every directory
doctor     5/5 checks pass, 207 tools, 6 prompts, catalog digest matches
```

Verify any time:

```bash
rea mcp doctor      # 5 checks: initialize, tools, prompts, identity, request-flow
claude mcp list | grep rea    # expect: rea --mcp - ✔ Connected
```

## Register at user scope, not project scope

`rea mcp add` registers via `npx -y rea-agents@<version>`, which resolves over
the network on every start. Since the CLI is installed globally, point Claude
Code at the binary instead — and **use `--scope user`**:

```bash
claude mcp remove rea
claude mcp add --scope user rea -- rea --mcp
```

Without `--scope user`, `claude mcp add` writes to the *local* config for
whatever directory you happen to be in (`[project: /home/gusman]`), so the
server silently disappears in every other repo. Verify from a second directory
before believing it is global.

## What works here, measured

`rea capabilities` reports per-provider availability. On this Linux box:

| Provider | Available |
|---|---|
| `rea-artifact-graph` (JS/Electron static) | ✅ |
| `rea-dotnet-static` | ✅ |
| `ghidra` | ✅ |
| `sqlite` | ✅ |
| `native-macos` | ❌ `unsupported_host` — needs macOS |

Static JavaScript analysis needs no native engine, so the most common use works
out of the box.

**`frida@17.23.2`'s install script is blocked** by npm's `allowScripts` policy.
That affects dynamic/runtime instrumentation only; static analysis is unaffected
and `doctor` passes with all 207 tools. To enable it:

```bash
npm install -g --allow-scripts=frida rea-agents
```

Ask before doing this — it runs a third-party postinstall script.

## Using it

**From Claude Code**, just ask in plain language. The MCP server exposes 207
tools and Claude picks them:

```
Understand how auth session refresh works in this Electron app, show the
evidence, then build a similar flow for my project.
```

**From the terminal**, for scripted or bulk work:

```bash
rea analyze-javascript-application /absolute/path/to/app --format json
rea analyze-web-bundle https://example.com
rea compare <bundle-a> <bundle-b>       # diff two evidence bundles
rea capabilities                        # what this host can actually do
rea --help                              # full command list
rea update                              # keep current; releases are frequent
```

Paths must be **absolute**. The command streams `rea_progress` JSON lines before
the result — filter with `grep -v rea_progress` when you only want the finding.

## Why the output shape matters

Every result ends with `limitations` and a `confidence` field. A real example
from this machine:

> "JavaScript and HTML were parsed as inert text; bundle bootstrap code was
> never executed."
> "Static imports, entrypoints, workers, endpoints, and storage relationships do
> not prove runtime execution."

That is the useful part. **Do not restate a static finding as runtime
behaviour.** REA is explicit that it read syntax without executing it, and
flattening that distinction turns a careful analysis into a confident guess.

## Legal boundary — not optional

From the project's own disclaimer: REA is for lawful research, education,
interoperability, software preservation, and **analysis of software you own or
are authorised to examine**.

Separately: commercial engines (IDA Pro/Hex-Rays, Hopper, JEB) must be legally
obtained. REA grants no licence, key, or activation entitlement. Only `ghidra`
is available here, and it is free and open-source.

Before analysing a target, be clear about which category it falls in. "A
competitor's app" is not automatically authorised.

## Pitfalls

- `claude mcp add` without `--scope user` is directory-local. Check from a
  second directory.
- Absolute paths only.
- Large trees take real time — a Next.js app with 25,661 files took ~11s just to
  inventory.
- On Linux, Ghidra/JADX/firmware launches need a procps-compatible `ps` on
  `PATH` (present here: procps-ng 4.0.4).
- Node must be 22.19+, 24.11+, or 26+. This machine is 24.19.
- Restart Claude Code after changing MCP registration.
