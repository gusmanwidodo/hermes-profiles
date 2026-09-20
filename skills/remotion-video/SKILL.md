---
name: remotion-video
description: Make videos programmatically with React — Remotion compositions and renders.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [remotion, video, react, rendering, content, ffmpeg]
---

# Remotion — video as React

Write video in React, render to MP4. Every frame is a React render at a given
`frame` number, so anything the DOM can draw can be animated: code snippets,
charts, terminal recordings, typography, data-driven scenes.

Verified 2026-09-11 — **Remotion 4.0.526**.

## Licensing — read this before shipping anything

Remotion is **not MIT**. From `LICENSE.md`:

> You are eligible to use Remotion for free if you are: an individual, a
> for-profit organization with **up to 3 employees**, a non-profit, or
> evaluating.

Under the Free License, commercial use is allowed — making videos to sell or
promote a product is fine. **A company with 4+ employees needs a paid Company
License**, and from Remotion 5.0 telemetry reporting becomes mandatory for
render-based licensing.

Check headcount before building a product feature on it. This is the detail that
gets missed until a lawyer asks.

## When Remotion beats ffmpeg

Use **Remotion** when the video is *composed*: animated text, charts that draw
themselves, code that types out, data-driven scenes, anything needing layout.

Use **ffmpeg** when the video is *processed*: concatenating clips, muxing audio,
transcoding, trimming, overlaying a static image. Remotion is heavier — it boots
Chromium and renders frame by frame.

Both are available on this machine, and a good pipeline often uses Remotion to
generate the visual layer then ffmpeg to mux in narration.

## This machine is ready

Node 24, pnpm 11.22, ffmpeg 8.0.1, and a Chromium headless shell already cached
under `~/.cache/ms-playwright/`. No system setup needed.

**Always use pnpm**, never npm — it is the convention here and saves disk across
projects.

### The pnpm trap — hit and solved on this machine

pnpm 10+ refuses to run dependency build scripts by default. esbuild is one of
them, so a fresh install ends with:

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.28.1
```

That warning makes `pnpm install` exit **non-zero**. And because `pnpm exec`
runs an implicit install first, **`pnpm exec remotion render` fails before
Remotion ever starts** — with a pnpm stack trace that says nothing about video.

The render itself works fine. Call the binary directly:

```bash
./node_modules/.bin/remotion render src/index.ts Scene out/video.mp4
```

Adding `onlyBuiltDependencies: [esbuild]` to `pnpm-workspace.yaml` did **not**
silence it in testing. Going through `node_modules/.bin` is the reliable path.

## Starting a project

```bash
cd ~/projects
pnpm create video@latest my-video     # pick the Blank or Hello World template
cd my-video
pnpm install
pnpm dev                              # Studio on http://localhost:3000
```

Rendering:

```bash
# use node_modules/.bin, not `pnpm exec` — see the pnpm trap above
./node_modules/.bin/remotion render src/index.ts <composition-id> out/video.mp4
./node_modules/.bin/remotion render src/index.ts MyComp out/video.mp4 --props='{"title":"Hello"}'
./node_modules/.bin/remotion still src/index.ts MyComp out/thumb.png --frame=30
./node_modules/.bin/remotion compositions src/index.ts    # list what is renderable
```

The entry point (`src/index.ts`) is a positional argument before the
composition id. Omitting it makes Remotion search for a default entry and fail
confusingly.

**Verified working on this machine 2026-09-11:** 150 frames at 1080×1920,
rendered and encoded in seconds, output 120.8 kB, ffprobe confirms exactly
5.000s at 30fps.

## The mental model

A composition declares dimensions, fps, and duration in **frames** — not
seconds. Duration is `seconds × fps`, and getting that wrong is the most common
first mistake.

```tsx
<Composition
  id="Scene"
  component={Scene}
  durationInFrames={30 * 30}   // 30 seconds at 30fps
  fps={30}
  width={1080}
  height={1920}                // vertical, for Reels/TikTok
/>
```

Inside a component, `useCurrentFrame()` gives the current frame. Animation is a
pure function of that number:

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',   // without this it keeps going past 1
});

const scale = spring({frame, fps, config: {damping: 200}});
```

**`extrapolateRight: 'clamp'` is almost always what you want.** Omitting it is
the second most common mistake — values shoot past the intended range and
elements fly off screen.

`<Sequence from={90} durationInFrames={60}>` shifts children so their local
frame 0 starts at the parent's frame 90. Nesting sequences is how scenes get
composed.

## Rendering from Node

```ts
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const serveUrl = await bundle({entryPoint: './src/index.ts'});
const composition = await selectComposition({serveUrl, id: 'Scene', inputProps});

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: 'out/video.mp4',
  inputProps,            // must match what selectComposition got
  concurrency: '50%',    // default is half the CPU threads
});
```

`inputProps` must be passed to **both** `selectComposition` and `renderMedia`.
Passing it to only one silently renders the default props instead — the render
succeeds and the content is wrong, which is worse than a crash.

## Audio and assets

```tsx
import {Audio, Img, staticFile} from 'remotion';

<Audio src={staticFile('narration.mp3')} />
<Img src={staticFile('logo.png')} />
```

Assets live in `public/`. **Never use a plain `<img>` or `new Audio()`** —
Remotion needs to know about a resource to wait for it before capturing the
frame, and a bare tag produces intermittently blank frames.

For narration, edge-tts is already available on this machine (two Indonesian
voices: `id-ID-ArdiNeural`, `id-ID-GadisNeural`). Generate the audio first, read
its duration with ffprobe, then set `durationInFrames` from it.

## Pitfalls

- **Duration is in frames, not seconds.** `durationInFrames={30}` at 30fps is
  one second, not thirty.
- **`interpolate` without `extrapolateRight: 'clamp'`** keeps extrapolating past
  the output range.
- **`inputProps` must go to both** `selectComposition` and `renderMedia`.
- **Random values must be seeded** — use `random('seed')` from remotion, not
  `Math.random()`, or frames rendered in parallel disagree with each other.
- **No side effects during render.** Each frame may be rendered by a different
  process; a mutable module-level counter will not behave.
- Rendering is CPU-bound. `concurrency: '50%'` on this 24-thread machine is
  reasonable; going higher competes with the 24 running containers.
- First render downloads a Chromium build if the cached one is not compatible —
  slow once, fast after.

## Verifying a render

Do not trust "render completed". Check the artifact:

```bash
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height \
  -of default=noprint_wrappers=1 out/video.mp4
```

Duration should match `durationInFrames / fps`. A file that exists but runs 0.04
seconds means the composition duration was wrong.
