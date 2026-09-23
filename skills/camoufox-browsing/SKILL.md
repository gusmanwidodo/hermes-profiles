---
name: camoufox-browsing
description: Read JS-rendered and bot-blocked pages with Camoufox anti-detect Firefox.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [camoufox, browser, scraping, playwright, firefox, anti-detect]
---

# Camoufox — reading pages that block plain fetches

A Firefox fork with fingerprint spoofing patched into the C++ layer rather than
injected as JavaScript, driven through Playwright. It exists for one job here:
reading pages that `curl` and `web_extract` cannot.

Installed and verified 2026-09-23 — **Camoufox 0.5.6**, Playwright **1.62.0**
(pinned; camoufox requires `playwright<1.63`), browser 1.3 GB at
`~/.cache/camoufox`.

## When to reach for it

Two failure signatures on this machine:

**Client-rendered pages.** Meta's ads guide, TikTok's ad specs, Remotion's
pricing, LinkedIn — all return a shell with no content to `curl` or
`web_extract`, because the text is assembled by JavaScript. Camoufox runs the
JavaScript.

**Bot-blocked pages.** HTTP 999, 403, or a challenge page from a plain request.

Do **not** use it as the default fetcher. It boots a full browser and costs
seconds per page; `web_extract` is right for ordinary pages and much cheaper.

## Running it

The tool lives in its own uv environment, so use its interpreter directly:

```bash
~/.local/share/uv/tools/camoufox/bin/python script.py
```

Plain `python3` will not find the module — it is not installed system-wide, and
PEP 668 is active so it should not be.

```python
from camoufox.sync_api import Camoufox

with Camoufox(headless=True, humanize=True) as browser:
    page = browser.new_page()
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3500)      # let client-side JS settle
    text = page.inner_text("body")
```

`wait_until="networkidle"` is stricter and sometimes necessary, but it hangs on
pages that poll continuously. Start with `domcontentloaded` plus an explicit
wait.

`humanize=True` adds human-like cursor movement. It costs a little time and is
worth keeping on for anything that looks defended.

Useful options: `geoip=True` (align timezone and locale with the exit IP —
matters when using a proxy), `proxy={...}`, `os=("windows","macos")`, and
`block_images=True` to render faster when only text is needed.

## What it does and does not solve — verified, not assumed

Tested on the three pages that actually blocked us:

| Target | Before | With Camoufox |
|---|---|---|
| CreepJS fingerprint | — | HTTP 200, full fingerprint report |
| TikTok ad specs | empty shell | **HTTP 200, content readable** |
| LinkedIn profile | HTTP 999 | **still HTTP 999 — sign-up wall** |

**LinkedIn still does not work, and it is important to be clear why.** Camoufox
reached the page, but LinkedIn serves a "Sign Up" interstitial to logged-out
visitors. That is an authentication wall, not a fingerprinting block — no
anti-detect browser gets around it, because there is nothing to detect. Reading
a LinkedIn profile requires being logged in, which means a real session and the
policy question that comes with it.

So: Camoufox fixes **rendering and fingerprinting**. It does not fix **needing
an account**.

## The rule that matters

This is a tool for *reading*. Using it to automate posting or account actions on
platforms whose terms forbid automation risks the account, and a suspended
account costs far more than the time saved. Publishing goes through official
APIs — for social that means CreasionApp, which exists precisely so this line
never has to be crossed.

## Pitfalls

- Use the tool's own interpreter; `python3 -c "import camoufox"` fails.
- First launch is slow — a 1.3 GB browser has to start.
- `networkidle` hangs on pages with continuous polling.
- JS-rendered content needs an explicit wait after `goto`; reading immediately
  returns the empty shell you were trying to avoid.
- Headless is fine for reading. `headless=False` only helps when debugging what
  the page actually shows.
- Check the page content, not just the HTTP status. LinkedIn returned a
  perfectly valid page — it was a sign-up wall.
