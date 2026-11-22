---
name: token-cheap-video
description: Generate narrated video locally with near-zero agent tokens.
version: 1.0.0
license: MIT
metadata:
  hermes:
    tags: [video, tts, piper, whisper, ffmpeg, subtitles, token-efficiency]
---

# Token-cheap video generation

Narrated, subtitled video produced entirely offline, where the agent learns
whether it worked **from numbers rather than from looking at pixels**.

Verified end to end 2026-11-10: **2.0 seconds** for a 7-second 1080×1920 clip
with burned-in subtitles. No vision calls, no network, no Chromium.

## The real cost is verification, not rendering

Rendering is cheap. What burns tokens is the agent screenshotting output to
check it — roughly 1,500 tokens per image, times every iteration.

So the discipline is: **every step must report success as a number.** Vision is
spent once at the end on taste, never on "did it technically work".

## The chain

```
script (text)
  → piper           narration, offline
  → faster-whisper  word-level timestamps   ← the expensive loop this removes
  → SRT             real timings, not guesses
  → ffmpeg          render + burn subtitles
  → ffprobe         verify: duration, resolution, codec
```

```bash
# 1. narration — 11.5x realtime on this CPU
echo "Teks narasi." | ~/.local/bin/piper \
  -m ~/.local/share/piper-voices/id_ID-news_tts-medium.onnx \
  -f out/vo.wav

# 2. real duration — never assume it
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 out/vo.wav

# 5. verify the artifact in numbers
ffprobe -v error -show_entries stream=codec_name,width,height \
  -show_entries format=duration,size -of default=nw=1 out/out.mp4
```

Word timestamps (step 3) come from `faster_whisper` with
`word_timestamps=True`; group the words into lines and write SRT from the real
`start`/`end` values. **Never hand-time subtitles** — that is the loop this
exists to delete.

## Installed and verified on this machine

| Tool | State | Note |
|---|---|---|
| `piper` 1.8.0 | ✅ via uv | `~/.local/bin/piper` |
| Indonesian voice | ✅ 63 MB | `id_ID-news_tts-medium`, the only id_ID voice |
| `faster-whisper` | ✅ in Hermes venv | CPU, int8 |
| `ffmpeg` 8.0.1 / `ffprobe` | ✅ system | |
| Remotion 4.0.526 | ✅ | for composed motion only |

**`edge-tts` is dead.** Microsoft's free endpoint now returns
`WSServerHandshakeError: 403`. Piper replaces it and, being fully offline,
cannot be cut off again.

## Pick the right whisper model — measured, not assumed

Same 7-second Indonesian clip:

| Model | Time | Output |
|---|---|---|
| `tiny` | 0.9s | "Oke, forge ... Image Automatis ... empoin" |
| **`base`** | **1.2s** | "...Satu endpoint, tanpa desain manual, langsung jadi." ✅ |
| `small` | 17.7s | still mangles the brand name |

**Use `base`.** `small` costs 15× more time and does not fix what matters.

**Brand names will be misheard regardless** — "OGForge" came out as "Oke, forge"
and "OK 4G". Alignment gives you *timing*; correct the *text* from the script
you already have rather than trusting ASR transcription. Match words positionally
and substitute your known-good text.

## Render text without Remotion

`ffmpeg drawtext` renders titles and lower-thirds with no Chromium boot:

```bash
ffmpeg -f lavfi -i "color=c=#0b1020:s=1080x1920:d=3" \
  -vf "drawtext=text='OGForge':fontcolor=#ff6a3d:fontsize=96:\
x=(w-text_w)/2:y=(h-text_h)/2:\
fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" \
  -c:v libx264 -preset ultrafast out.mp4
```

Burned subtitles:

```bash
-vf "subtitles=vo.srt:force_style='FontSize=16,MarginV=120,Alignment=2'"
```

**Reserve Remotion for composed motion** — animated typography, data-driven
scenes, anything needing React. Booting Chromium to centre static text is waste.

## Still worth adding

- **ImageMagick** — `identify` verifies image dimensions without vision; also
  does composition. Not installed.
- **gifski** — high-quality GIF previews, far smaller than video for review.

Deliberately **not** recommended: `moviepy` (a slower Python layer over ffmpeg
with an extra failure point) and `matplotlib` (Remotion is better for data
visuals).

## Pitfalls

- Piper reads stdin; pass text by pipe or `input=` in Python, not as an argv
  flag.
- Piper output is 22050 Hz mono — set audio expectations accordingly.
- Always read duration with `ffprobe` before building the video track. A
  mismatched `-t` silently truncates narration.
- `-shortest` stops at the shorter stream; make sure that is the one you mean.
- First `faster-whisper` run downloads the model (~8s for `tiny`); cached after.
- Subtitle text should be corrected from the script. ASR output is for timing.
