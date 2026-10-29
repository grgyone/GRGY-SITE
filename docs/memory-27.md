# Memory #27 — preparation and missing source media

The approved EN/RU copy, artists, 2022 date and supplied links are stored in
`data/projects.json` under the unique id/slug `memory-27`. The existing CV entry
has `projectId: "memory-27"`; the generator links it in each language. Existing project order is preserved by appending the entry.

## Current state

Per the user’s request, the project is ready as a text-only page with
`mediaPending: true`. Both language routes, Projects listing, CV links and sitemap
are generated. The existing text-card style is used, without fake previews or
broken media elements.

Only the brief is available as a local file. An inline image was visible in chat,
but no source image file is available in the workspace. `bxg.png`, `BxGcomp.png` and `1.mp4` are absent
from the workspace. No replacement media, dimensions, poster or audio has been
invented. Open Graph uses text metadata until a real project image is available.
The user authorized publication of this text-only version on October 28, 2026.

## Complete after the originals arrive

1. Preserve PNGs byte-for-byte under `images/projects/originals/memory-27/`
   and MP4 under `videos/projects/memory-27/originals/`.
2. Inspect actual dimensions, transparency, duration, streams and audio with
   Sharp/ffprobe. View the composition and original before encoding.
3. Encode `videos/projects/memory-27/1-web.mp4` with H.264/AAC, faststart,
   yuv420p, preserving audio and 1228:1536 proportions without cropping.
   Start with libx264 CRF 18 / preset slow and AAC 192k. Inspect dark gradients,
   smoke and fire against the source before choosing the final settings.
4. Extract a representative final-scene frame as a WebP poster under
   `images/projects/optimized/memory-27/`. Use that frame for `coverImage`
   and `metaImage` (with real dimensions and bilingual alt text).
5. Populate `gallery` in this order: `BxGcomp.png` captioned
   “Collaboration Artwork” / “Совместная работа”; `bxg.png` captioned
   “Original GRGY Artwork” / “Исходная графическая работа GRGY”.
   Set actual dimensions and bilingual alt text. The scene cover must remain
   separate from these gallery images, so Projects shows the finished scene.
6. Populate the single video with the encoded path, poster and actual dimensions.
   The collaboration layout places it before the overview with native controls,
   `preload="none"`, no autoplay, no mute and no loop. Images retain full proportions.
7. Generate responsive WebP derivatives using `optimizeProjectImages` for this
   project only. For flat graphics, use lossless WebP or a visually verified high
   quality encoding; preserve alpha. Do not re-encode unrelated artwork.
8. Remove `mediaPending` (status is already `ready`), update the pending-state test, and run the build and
   relevant tests. Check the actual page at desktop/mobile widths, both language
   routes, native playback with audible sound, image quality, Projects cover,
   CV link, SEO/OG and all external links. Profile links and Selected Press are
   separated. Structured metadata credits both artists without assigning roles.
9. Publish media updates when authorized by the user. The text-only version
   was authorized for publication on October 28, 2026.

Expected routes: `/works/projects/memory-27/` and
`/ru/works/projects/memory-27/`.
