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
