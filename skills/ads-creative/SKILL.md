---
name: ads-creative
description: Paid ads creative for Meta, TikTok, Google — concepts, copy, and production.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [ads, meta, tiktok, google, creative, video, poster, performance-marketing]
---

# Ads creative — Meta, TikTok, Google

Concepting, writing, and producing ad creative that is built to be measured.

## Verify specs before producing, every time

Ad specs change and every platform publishes its own. **Do not produce from
memory — including mine.** A creative rejected on aspect ratio or length is a
wasted production cycle.

| Platform | Source of truth |
|---|---|
| Meta | facebook.com/business/ads-guide |
| TikTok | ads.tiktok.com/help — search "video ad specifications" |
| Google | support.google.com/google-ads — "image ad requirements", "video requirements" |

These pages are JavaScript-rendered, so a plain fetch returns nothing. Open them
in a browser, or use the browser tool. If a spec cannot be verified, say so and
produce to the safest common denominator: **9:16 vertical, 1080×1920, MP4
H.264, under 60 seconds, under 100MB**, with all text inside the middle 80% of
the frame.

## The three platforms want different things

**Meta (Facebook/Instagram)** — interruption. The user is scrolling a feed of
friends and memes. The first frame has to stop the thumb, and it must work
**with sound off**, because most of the feed is muted. Burn subtitles in.
Creative variety matters more than polish; Meta's algorithm needs several
distinct concepts to optimise against, not one concept in five colours.

**TikTok** — belonging. An ad that looks like an ad gets swiped instantly. What
works is native form: handheld, imperfect, a real voice, a hook in the first
second. "Don't make ads, make TikToks" is their own guidance and it is correct.
Polished corporate video underperforms consistently here.

**Google** — intent. Search ads are answers to a question someone already asked,
so the copy's job is relevance and clarity, not persuasion. Performance Max and
YouTube need assets, but the discipline is different: match the query, state the
offer, remove friction.

The same creative rarely works across all three. Concepting per platform is the
work, not a nice-to-have.

## Structure that actually holds attention

**Hook (0–2s).** The whole ad lives or dies here. A problem stated plainly, an
unexpected visual, a number, a face mid-sentence. Never a logo, never a slow
fade-in — those are the two most common ways to lose the viewer before the ad
has said anything.

**Tension (2–8s).** Why the problem matters. Make it concrete and specific; a
named annoyance beats an abstract benefit.

**Resolution (8–20s).** The product doing the thing. Show it working, do not
describe it working.

**Ask (final 2–3s).** One action. Not three.

## Copy rules

- One idea per ad. An ad arguing three things persuades nobody.
- Specific beats superlative. "Renders a 30-second video in 8 seconds" beats
  "blazing fast".
- Write for muted viewing first. If it only works with audio, it does not work.
- Banned unless literally true and checkable: "revolutionary", "game-changer",
  "10x", "AI-powered" as the entire value proposition.
- **Never invent numbers.** No user counts, no percentages, no testimonials that
  do not exist. Beyond being dishonest, fabricated claims are grounds for ad
  account suspension on all three platforms, and appealing a suspension costs
  more than the ad ever earned.

## Production — what this machine can actually do

Everything below is installed and verified working.

**Motion graphics / animated video → Remotion** (skill: `remotion-video`).
Video as React. Right for animated typography, data-driven scenes, code
demos, anything composed. A 1080×1920 render is verified working here.

**Video processing → ffmpeg 8.0.1.** Concatenating, muxing audio, transcoding,
trimming, burning subtitles. Pairs with Remotion: compose the visual layer,
then mux narration.

```bash
# burn subtitles — required for muted feeds
ffmpeg -i in.mp4 -vf "subtitles=subs.srt:force_style='FontSize=18,MarginV=60'" out.mp4

# safe-area check before shipping
ffprobe -v error -show_entries stream=width,height,duration -of default=noprint_wrappers=1 out.mp4
```

**Voiceover → edge-tts**, free, no API key. Two Indonesian voices:
`id-ID-ArdiNeural` (male), `id-ID-GadisNeural` (female).

Use TTS for **prototyping** — test whether the script and pacing work before
committing to a real recording. For anything building personal credibility, a
real voice wins; synthetic narration is recognisable and audiences discount it.

**Static poster / carousel → `claude-design`, `baoyu-infographic`,
`excalidraw`.** Export to PNG for feeds, or a single PDF for LinkedIn document
posts.

**Image generation → `comfyui`** if a local diffusion workflow is needed.
Warning: image-gen APIs burn budget fast on iteration. Prefer design tools for
anything with text on it, because generated images handle typography badly.

## A creative is a hypothesis

Never ship one execution. Ship **3–5 distinct concepts** — different angles, not
different colours of the same angle — and let spend decide.

Name files so results are traceable:

```
<product>_<platform>_<angle>_<format>_v<n>.mp4
ogforge_meta_broken-preview_9x16_v1.mp4
```

Without that, a winning ad cannot be identified two weeks later, and the whole
point of running variants is lost.

**Judge on the metric that matters.** Impressions and CTR are cheap to move and
mean little on their own. Cost per result is the number. A creative with lower
CTR and lower CPA is the better creative.

## What this agent must not do

- Produce to remembered specs instead of verified ones
- Invent performance numbers, user counts, or testimonials
- Claim an ad "will convert" — nobody knows before it runs
- Ship one execution and call it a campaign
- Recommend spend levels without knowing the actual budget
- Make health, income, or "guaranteed result" claims — these are policy
  violations on all three platforms and risk the ad account, not just the ad

## Honest constraint

No ad account is connected on this machine, and no ads API access has been
verified. That means creative can be **produced** here but not **uploaded,
launched, or measured** from here. The agent produces files and copy; publishing
and reading results happens in Ads Manager.

Say that plainly rather than implying a campaign can be run end to end.
