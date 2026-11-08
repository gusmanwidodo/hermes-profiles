---
name: hermes-gateway-operations
description: Run and repair Hermes Telegram gateways — verify, restart, unstick.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [hermes, gateway, telegram, systemd, operations]
---

# Hermes gateway operations

Starting, verifying, and repairing the systemd services that run Hermes agents
as Telegram bots. Written from failures that actually happened on this machine,
not from documentation.

## The rule that matters most

**`systemctl is-active` is not evidence a bot is alive.**

A gateway in a crash-loop reports `active` while answering nothing. The service
restarts, fails, restarts again — and each fresh process is briefly "active".
The only reliable signal is **TLS sockets to Telegram**:

```bash
PID=$(systemctl --user show hermes-gateway-<name>.service -p MainPID --value)
ss -tnp | grep "$PID" | grep -c 149.154
```

**2 or more = polling normally. 0 = the bot is dead**, whatever systemd claims.

Always check the restart counter too — a healthy service sits at 0:

```bash
systemctl --user show hermes-gateway-<name>.service -p NRestarts --value
```

A counter in the hundreds means it has been failing in a loop, possibly for
hours, while looking fine.

### A health check that misses this is not a health check

Observed 2026-09-28: the `ceo` gateway had a restart counter of **39,694**,
caused by a hung `gateway restart` process that had held the lock since
**19 September — nine days**. Throughout those nine days `is-active` returned
`active` and socket counts looked plausible, so repeated "all 14 gateways
healthy" reports were technically true and substantively wrong. The symptom the
user actually saw was tasks being interrupted mid-run.

**A gateway sweep must include NRestarts, and must check for stale lock
holders** — not just active state and sockets:

```bash
# per profile: is the lock held by a `gateway run` (correct) or a hung
# `gateway restart` (the bug)?
for f in ~/.hermes/profiles/*/; do
  p=$(basename "$f"); lk="$f/gateway.lock"; [ -f "$lk" ] || continue
  python3 - "$p" "$lk" <<'PY'
import json, sys, os
prof, path = sys.argv[1], sys.argv[2]
d = json.load(open(path))
pid, argv = d.get("pid"), " ".join(d.get("argv", [])[-2:])
alive = os.path.exists(f"/proc/{pid}")
flag = "  <-- HUNG RESTART" if "restart" in argv else ""
print(f"{prof:<22} pid={pid} alive={alive} {argv}{flag}")
PY
done
```

Any lock whose `argv` ends in `restart` is the bug, regardless of how long it
has been there.

### Socket count has an upper bound too

`2` or more means polling. But **a count far above 4 is its own symptom** —
failed requests whose connections never closed.

Observed 2026-10-09: `megavenue-engineer` sat at **36 sockets**, `active`, with
a correct `gateway run` lock and no stderr-level errors. It looked healthy by
every check in this skill and was in fact frozen: a 7-day-old process was
retrying against `base_url=https://api.anthropic.com` while the account
authenticates through Nous Portal, so every call failed and retried three times.

**A long-lived process can hold stale config in memory.** Config on disk being
correct proves nothing about what a running process is using — compare
`ExecMainStartTimestamp` against when the config last changed.

### Check the log for retry loops, not just errors

Retry warnings are logged at WARNING, so `journalctl -p err` returns
"No entries" while the gateway is looping. Grep the body instead:

```bash
journalctl --user -u hermes-gateway-<name> --since "30 min ago" --no-pager \
  | grep -cE "APIConnectionError|Retrying API call"
```

Non-zero means the agent is burning time on calls that cannot succeed. The user
experiences this as the bot freezing — it is waiting, not dead, which is why
every status check says it is fine.

Also worth reading from that log line: it prints the `base_url` and `model`
actually in use. That is the fastest way to catch a process pointed at the wrong
endpoint.

## A third failure mode: send dies while polling survives

Observed 2026-11-08 on `bigevent-engineer`. The bot answered nothing, yet every
check in this skill was green: socket 6, NRestarts 3, lock held by `gateway
run`, zero retry-loop entries, zero stderr errors.

The log told the real story:

```
WARNING gateway.run: Prompt send failed: Not connected
WARNING gateway.run: Clarify send failed definitively; clearing registration
WARNING gateway.run: Button-based approval failed (send returned error)
```

The agent was **waiting for an approval it could not deliver**. Polling still
worked, so it received messages; the send path was dead, so nothing came back.
From the user's side that is indistinguishable from a hang.

**The discriminating test:** send through the bot token with curl while the
gateway claims `Not connected`.

```bash
TOK=$(grep '^TELEGRAM_BOT_TOKEN=' <profile>/.env | cut -d= -f2-)
curl -s "https://api.telegram.org/bot${TOK}/sendMessage" \
  --data-urlencode "chat_id=<id>" --data-urlencode "text=probe" \
  -w "HTTP:%{http_code}\n"
```

curl returning 200 while the gateway cannot send proves the credential and
Telegram are fine and the gateway's own connection is stale. Restart fixes it.

Add this grep to any sweep — it catches what socket counts cannot:

```bash
journalctl --user -u hermes-gateway-<name> --since "1 hour ago" --no-pager \
  | grep -ciE "Not connected|send failed|Clarify send failed"
```

## Long-lived processes are the common factor

Three gateways failed in one week. All three were old processes:

| Profile | Process age | Symptom |
|---|---|---|
| `ceo` | hung restart held 9 days | crash-loop, 39,694 restarts |
| `megavenue-engineer` | 7 days, then 22 days | retry-loop on a stale endpoint; 48 stale sockets |
| `bigevent-engineer` | 39 days | send path dead, polling alive |

Short-lived processes have not misbehaved. Whatever accumulates — sockets,
stale clients, dead connections — does so with uptime.

**Practical consequence:** treat a process older than ~2 weeks as suspect even
when its indicators look clean, and prefer recycling it over waiting for a
symptom the user has to report.

## An agent CAN restart another profile's gateway

The guard blocks `systemctl restart/stop` and `hermes gateway restart` from
inside a gateway process. But `kill <pid>` on a plain PID is allowed, and
Hermes gateway units ship with `Restart=always`.

So for any profile **other than the one serving the current conversation**:

```bash
# 1. confirm systemd will bring it back — without this, kill just kills it
systemctl --user show hermes-gateway-<name>.service -p Restart --value   # want: always

# 2. kill the main process; systemd restarts it in ~15-25s
kill $(systemctl --user show hermes-gateway-<name>.service -p MainPID --value)

# 3. verify the NEW pid, not the old one
sleep 25
PID=$(systemctl --user show hermes-gateway-<name>.service -p MainPID --value)
ss -tnp | grep "$PID" | grep -c 149.154        # want 2-4
```

Check `Restart=always` first. Without it this is not a restart, it is an
outage.

**This does not work for the profile running the agent** — killing it drops the
conversation mid-turn. That one still needs a shell outside the gateway.

Verified 2026-10-18 on `megavenue-engineer`: a 22-day-old process holding 48
stale sockets came back at 2, with the lock correctly reassigned to the new pid.

## Do not use `hermes gateway restart`
That command hangs. When it does, it holds `gateway.lock`, and every service
start after it fails with *"Gateway already running (PID ...)"* — then systemd
retries every 5 seconds while the gateway needs ~16 seconds to boot, so the
loop never resolves. Observed reaching 208 restarts.

**Use systemd directly, and prefer stop → pause → start over restart:**

```bash
systemctl --user stop hermes-gateway-<name>.service
sleep 10
systemctl --user start hermes-gateway-<name>.service
```

## Unsticking a crash-loop

Symptom: `active` but 0 sockets, restart counter climbing, log repeating
*"Gateway already running"*.

```bash
# 1. find the hung process — usually a stray `gateway restart`
pgrep -af "<profile-name>"

# 2. kill it by PID (SIGTERM is often ignored; -9 works)
kill -9 <pid>

# 3. clear the stale lock
rm -f ~/.hermes/profiles/<name>/gateway.lock

# 4. reset the failure counter, then start
systemctl --user reset-failed hermes-gateway-<name>.service
systemctl --user start hermes-gateway-<name>.service

# 5. verify by socket count, not status
sleep 20
PID=$(systemctl --user show hermes-gateway-<name>.service -p MainPID --value)
ss -tnp | grep "$PID" | grep -c 149.154
```

Deleting the lock alone does nothing — it is rewritten on every start attempt.
The hung process has to die first.

**An agent cannot do steps 1–4 for its own or another gateway.** Hermes blocks
stop/restart/pkill from inside a gateway process, because SIGTERM propagates to
children and would kill the command mid-run. Ask the user to run them in a real
terminal. Do not hunt for a workaround.

## Installing a new gateway

Proven across many profiles:

```bash
# .env must contain TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_USERS,
# TELEGRAM_HOME_CHANNEL — chmod 600, and confirm it is gitignored
hermes --profile <name> gateway install

sleep 15
systemctl --user is-active hermes-gateway-<name>.service     # active
systemctl --user is-enabled hermes-gateway-<name>.service    # enabled
# then the socket check above — expect 2
```

`sendMessage` returning **`chat not found` is normal** for a fresh bot: the user
has not pressed Start yet. It is not a failure.

### The unit name is not always predictable

Most installs produce `hermes-gateway-<profile>.service`, but some produce a
**hashed name** instead — `hermes-gateway-6b522f51.service`. Checking the
predictable name then reports `inactive` / `not-found` for a gateway that is
actually running fine.

Find the real unit by its working directory:

```bash
grep -l "profiles/<name>$" ~/.config/systemd/user/hermes-gateway-*.service
# or list what Hermes itself thinks is running, which resolves the profile name
hermes gateway list
```

`hermes gateway list` shows the profile name and PID regardless of unit naming,
so start there and work back to the unit.

A related trap: a gateway can run as a **plain process with no systemd unit at
all** — it works now and does not survive a reboot. If `hermes gateway list`
shows a PID but no unit file matches, run `gateway install` to make it
persistent.

## Diagnosing provider errors

`⚠ Provider authentication failed` in chat means the credential is missing or
wrong. The log names the exact variable:

```bash
journalctl --user -u hermes-gateway-<name> --since "20 minutes ago" \
  --no-pager | grep -iE "auth|401|429|provider"
```

Two real cases seen here:

- **`No usable credentials found for provider 'X'. Set X_API_KEY.`** — Hermes
  derives the env var name **from the provider name** (`opencode-go` →
  `OPENCODE_GO_API_KEY`). Setting `api_key_env` in config does not override
  this. Each profile also reads **its own** `.env`; a key in the global one is
  not inherited.
- **`HTTP 429 ... Retrying API call in 600s`** — a rate limit, not slowness.
  Hermes waits ten minutes, three times. Symptom is a bot that answers after
  half an hour. Check quota before blaming the model.

## Pitfalls

- Calling Telegram's `getUpdates` manually while a gateway is polling causes a
  **polling conflict** — Telegram allows one reader. It self-heals in ~30s, but
  do not debug that way.
- Config changes are read **at process start**. Editing `config.yaml` does
  nothing until the gateway restarts.
- `MemoryStore` is built at session start too, so a changed
  `memory_char_limit` only applies after a restart.
- `MainPID: 0` means the service is between restarts — not that it is healthy.
