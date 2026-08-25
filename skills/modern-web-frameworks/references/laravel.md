# Laravel 13

Verified 2026-08-25 against Packagist (`v13.26.1`, requires `php: ^8.3`) and
the official 13.x upgrade guide.

## Laravel Boost — use it

Boost is a **first-party MCP server** that gives an AI assistant version-correct
Laravel guidance, including guided upgrade prompts. Once installed in a Laravel
12 app, `/upgrade-laravel-v13` walks the upgrade in Claude Code, Cursor,
OpenCode, Gemini, or VS Code. Requires Boost `^2.0`.

This matters more than it sounds: it is the difference between an assistant
writing Laravel from memory and writing it against the installed version.

## Upgrading 12 → 13

Official estimate: ~10 minutes for most applications.

### Dependencies (high impact)

```json
"laravel/framework": "^13.0",
"laravel/boost": "^2.0",
"laravel/tinker": "^3.0",
"phpunit/phpunit": "^12.0",
"pestphp/pest": "^4.0"
```

Also update the installer: `composer global update laravel/installer`, or update
Herd if using its bundled copy.

### Cache and session prefixes (low impact, high surprise)

Framework-level fallback prefixes switched from underscores to hyphens:

```php
// Laravel <= 12
Str::slug(env('APP_NAME', 'laravel'), '_').'_cache_';
Str::slug(env('APP_NAME', 'laravel'), '_').'_session';

// Laravel >= 13
Str::slug(env('APP_NAME', 'laravel')).'-cache-';
Str::slug(env('APP_NAME', 'laravel')).'-session';
```

Only applies when the app relies on framework defaults rather than explicit
config. The visible symptom is a cold cache and logged-out sessions after
deploy. Pin `CACHE_PREFIX`, `REDIS_PREFIX`, and `SESSION_COOKIE` explicitly to
avoid it.

### cache.serializable_classes (medium impact)

Now defaults to `false`, hardening unserialization against deserialization
gadget chains if `APP_KEY` leaks. If the app caches PHP objects, allow-list
them:

```php
'serializable_classes' => [
    App\Data\CachedDashboardStats::class,
],
```

Otherwise migrate cached payloads to arrays.

### Database

- `upsert()` now throws `InvalidArgumentException` when `uniqueBy` is empty,
  instead of emitting invalid SQL. MySQL/MariaDB ignore the value at runtime,
  but the validation still applies.
- MySQL `DELETE ... JOIN` now compiles `ORDER BY` and `LIMIT` into the SQL.
  Previously they were silently dropped. Engines that reject that syntax now
  throw `QueryException` rather than performing an unbounded delete — a
  correctness improvement that can surface as a new runtime error.

### Container

`Container::call` now respects nullable class parameter defaults:

```php
$container->call(fn (?Carbon $date = null) => $date);
// <= 12.x: Carbon instance
// >= 13.x: null
```

### Contracts (very low impact, only for custom implementations)

New methods added to: `Cache\Store::touch()`, `Bus\Dispatcher::dispatchAfterResponse()`,
`Routing\ResponseFactory::eventStream()`, `Auth\MustVerifyEmail::markEmailAsUnverified()`.

### Eloquent

Instantiating a model while that same model is still booting now throws
`LogicException`. Affects code that news up models inside `boot()` or trait
`boot*()` methods.

### Also changed

Request forgery protection (high impact — read the guide section), domain route
registration precedence, `JobAttempted` event exception payload, `QueueBusy`
property rename, Manager `extend` callback binding, polymorphic pivot table
name generation, pagination Bootstrap view names, `Str` factories resetting
between tests, collection model serialization restoring eager-loaded relations.

Full guide: https://laravel.com/docs/13.x/upgrade

## Stack notes

For this org, Laravel is the special-case stack (API/web) alongside Flutter
mobile and a Vite/React/TanStack Router dashboard, on PostgreSQL. It does not
replace the default Next.js micro-SaaS line.

Conventions worth holding: form requests for validation, policies for
authorization, queued jobs for anything slow, Pest for tests, Pint for
formatting, and migrations as the only path to schema change.
