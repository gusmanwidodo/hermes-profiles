# NestJS 11

Verified 2026-08-25 against npm (`@nestjs/core@11.2.1`, `engines.node: >= 20`)
and the official migration guide.

## Node floor

Node 16 and 18 are dropped. **NestJS 11 requires Node 20 or higher.**

## Express v5 is the default

The biggest practical change. Express v5's path matcher is stricter, and routes
that worked under v4 can silently stop matching.

### Wildcards must be named

```ts
// Was fine in v4, not advisable in v5
@Get('users/*')

// v5
@Get('users/*splat')          // matches sub-paths, not /users itself
@Get('users/{*splat}')        // braces make it optional — also matches /users
```

`splat` is just a parameter name; any valid identifier works. NestJS 11
auto-converts the old syntax, so it may still appear to work — do not rely on
that.

Middleware paths have the same rule:

```ts
forRoutes('*');          // v4
forRoutes('{*splat}');   // v5
```

### Other matcher changes

- Optional `?` is gone; use braces: `/:file{.:ext}`
- Regex characters in paths are unsupported
- `(()[]?+!)` are reserved — escape with `\`
- Parameter names must be valid JS identifiers, or quoted: `:"this"`

### Query parsing changed

Express v5 uses the `simple` parser instead of `qs`. Nested objects and arrays
no longer parse:

```
?filter[where][name]=John     // no longer an object
?item[]=1&item[]=2            // no longer an array
```

Restore v4 behaviour explicitly:

```ts
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.set('query parser', 'extended');
```

## Fastify v5

`@nestjs/platform-fastify` v11 supports Fastify v5. Path matching for **routes**
is unchanged, so existing wildcards keep working — but **middleware** paths go
through the new `path-to-regexp` and need named wildcards:

```ts
.forRoutes('(.*)');    // no
.forRoutes('*splat');  // yes
```

CORS under Fastify now only allows CORS-safelisted methods by default. To allow
`PUT`, `PATCH`, or `DELETE`, list them:

```ts
app.enableCors({ methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });
```

## Module resolution changed

v10 hashed dynamic module metadata to deduplicate modules. v11 uses **object
references** instead. `TypeOrmModule.forFeature([User])` imported in two places
is now two distinct instances unless you share the variable:

```ts
const UserFeature = TypeOrmModule.forFeature([User]);   // share this
```

This mostly bites integration tests, where a `TestingModule` can end up with
multiple instances of a dependency and a stub targets the wrong one. Options:

- Deduplicate the dynamic module by assigning it to a variable
- `module.select(ParentModule).get(Target)` to reach a specific instance
- `module.get(Target, { each: true })` to stub all of them
- `Test.createTestingModule({}, { moduleIdGeneratorAlgorithm: 'deep-hash' })`
  to restore the old algorithm

## Lifecycle hook order reversed

Termination hooks now run in reverse of initialization. For `A -> B -> C`:

```
OnModuleInit:     C -> B -> A
OnModuleDestroy:  A -> B -> C
```

Applies to `OnModuleDestroy`, `BeforeApplicationShutdown`,
`OnApplicationShutdown`. Shutdown logic that assumed the old order needs review.

## Reflector type inference

- `getAllAndMerge` returns an object, not a single-element array, when there is
  one object-typed entry
- `getAllAndOverride` now returns `T | undefined` rather than `T` — handle the
  undefined case
- `ReflectableDecorator` transformed types infer correctly across methods

## Also changed

Cache module, Config module, and Terminus module have their own migration
notes. `HealthIndicator` and `HealthCheckError` are deprecated and scheduled
for removal in the next major.

Full guide: https://docs.nestjs.com/migration-guide

## When to reach for NestJS

Structured, DI-heavy TypeScript backends — multi-team services, complex domain
layers, anything that benefits from modules, guards, interceptors, and pipes as
first-class concepts. For a small product API, Next.js route handlers are less
machinery for the same result. NestJS earns its overhead when the service
outgrows a handful of endpoints.
