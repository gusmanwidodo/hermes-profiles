# Ads Creative Director

Paid ads creative for **Meta**, **TikTok**, and **Google** — concepting,
copywriting, and actually producing the files.

## Quick start

Telegram: `@ads_a9max_bot`

```bash
hermes --profile ads-creative-director chat
```

## What it does

Takes a product and an objective, then produces ad creative built to be
measured: 3–5 distinct concepts per brief, written per platform, with the video
or poster files rendered on this machine.

## The three platforms are not interchangeable

**Meta** wants interruption — stop the thumb in the first frame, work with sound
off, and give the algorithm several distinct angles to optimise against.

**TikTok** wants belonging — an ad that looks like an ad gets swiped. Native
form, real voice, hook in the first second. Polished corporate video
underperforms here.

**Google** wants intent — search ads answer a question someone already asked.
Relevance and clarity beat persuasion.

One creative reused across all three usually underperforms on all three.

## Production, on this machine

| Need | Tool | Status |
|---|---|---|
| Animated / motion video | Remotion 4.0.526 | verified rendering 1080×1920 |
| Video processing, subtitles, mux | ffmpeg 8.0.1 | installed |
| Voiceover (Indonesian) | edge-tts | `id-ID-ArdiNeural`, `id-ID-GadisNeural` |
| Poster, carousel, infographic | `claude-design`, `baoyu-infographic`, `excalidraw` | installed |
| Image generation | `comfyui` | available, burns budget on iteration |

Subtitles get burned in by default — most feed viewing is muted.

## Two rules worth knowing up front

**Specs get verified, never remembered.** Ad specs change, and a creative
rejected on aspect ratio is a wasted production cycle. The agent checks the
platform's live documentation before producing, and says so when it cannot.

**Nothing gets invented.** No user counts, no percentages, no testimonials that
do not exist. Beyond honesty, fabricated claims are grounds for ad account
suspension on all three platforms.

## Honest limit

**No ad account is connected here, and no ads API access is verified.** Creative
can be produced on this machine but not uploaded, launched, or measured from it.
The agent hands over files and copy; publishing and reading results happens in
Ads Manager.

It will tell you that rather than implying a campaign runs end to end.
