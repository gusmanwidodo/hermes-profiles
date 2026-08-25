# Next.js 16

Verified 2026-08-25 against npm (`16.3.2`) and the docs bundled at
`node_modules/next/dist/docs/`.

## Read the bundled docs

The installed package carries documentation that matches it exactly:

```
node_modules/next/dist/docs/
├── 01-app/                    # App Router
│   ├── 01-getting-started/
│   ├── 02-guides/upgrading/version-16.md
│   └── 03-api-reference/
├── 02-pages/                  # Pages Router (legacy)
└── 03-architecture/
```

`next dev` writes an `AGENTS.md` at the project root saying *"This is NOT the
Next.js you know."* It is there because model recall of this framework is
wrong often enough to matter. Read the local file for the API you are about to
use.

## Breaking changes in 16

### Async Request APIs — sync access removed

Next 15 introduced async request APIs with a temporary synchronous fallback.
**Next 16 removed the fallback.** These are async only:

- `cookies()`, `headers()`, `draftMode()`
- `params` in `layout`, `page`, `route`, `default`, `opengraph-image`,
  `twitter-image`, `icon`, `apple-icon`
- `searchParams` in `page`

```ts
// Next 15 and earlier — no longer compiles
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>;
}

// Next 16
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  return <h1>{slug}</h1>;
}
```

Codemod: `npx @next/codemod@canary next-async-request-api .`

### Type helpers

`npx next typegen` generates globally available helpers — `PageProps`,
`LayoutProps`, `RouteContext` — parameterized by route string, so the params
shape is checked against the actual route:

```ts
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;       // typed
  const query = await props.searchParams;
}
```

### middleware.ts → proxy.ts

The `middleware` convention is deprecated in favour of `proxy`. The codemod
handles the rename:

```bash
npx @next/codemod@canary upgrade
```

### Turbopack is the default

`next build` and `next dev` use Turbopack. Options if a webpack config exists:

- Migrate the config to Turbopack-compatible options (preferred)
- `next build --turbopack` to build with Turbopack and ignore webpack config
- `--webpack` to opt out entirely

Turbopack config moved out of `experimental` in `next.config`.

### Other removals

- `next lint` → use the ESLint CLI directly
- `unstable_` prefixes dropped from stabilized APIs
- `experimental_ppr` route segment config removed from pages and layouts
- Node.js floor raised to 20.9

## Deployment: standalone output

For Docker, set `output: "standalone"` in `next.config.ts`.

**`next build` does not copy `public/` or `.next/static/` into
`.next/standalone/`** — it assumes a CDN serves them. Without a copy step the
standalone server answers 404 for every CSS and JS chunk and pages render
unstyled. Either copy them in the Dockerfile, or add a post-build script:

```js
// scripts/copy-standalone-assets.mjs
cpSync('public', '.next/standalone/public', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
```

Route handlers that read files at runtime (fonts for `next/og`, for example)
need `outputFileTracingIncludes` in `next.config` or the files will be missing
from the trace.

## Conventions worth keeping

- Server Components by default; add `'use client'` only where interactivity
  genuinely requires it.
- Data fetching in Server Components; avoid client-side waterfalls.
- `loading.tsx` and `error.tsx` per route segment rather than ad-hoc spinners.
- Route handlers in `app/api/*/route.ts` export named HTTP verbs.
