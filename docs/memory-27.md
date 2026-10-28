# Memory #27 — supplied media

The EN/RU project now includes the artist's supplied media. Its source record is
in data/projects.json; date, approved copy, artists, links, order and CV connection
are preserved. Both existing language routes are unchanged.

## Originals

- images/projects/originals/memory-27/BxGcomp.png: 3164 × 2000 px.
- images/projects/originals/memory-27/bxg.png: 4096 × 4096 px.
- videos/projects/memory-27/originals/1.mp4: 29,369,557 bytes.

The PNGs come from D:\1. Art\2022\Collab\BAYM collab. The MP4 comes from
C:\Users\grgyo\Downloads, as explicitly requested, rather than the different
1.mp4 in the BAYM archive. All three copied originals match their source SHA-256
hashes. Actual dimensions were inspected with Sharp and ffprobe. The MP4 contains
1228 × 1536 H.264 video at 25 fps and stereo AAC audio; duration is 14.4 seconds.

## Web media

videos/projects/memory-27/1-web.mp4 is 11,413,687 bytes, encoded with libx264
CRF 18 / preset slow / yuv420p and MP4 faststart. The original AAC stream is
copied without re-encoding. Resolution, frame rate and proportions are preserved.
Source and encoded frames at five seconds were visually inspected; full-video
SSIM is 0.990265.

images/projects/optimized/memory-27/poster.webp is a lossless frame extracted
at five seconds. It supplies the video poster, Projects cover and Open Graph
image. Stable image indices are cover 0, composition 1, original graphic 2.
Responsive images were generated only for this project using optimizeProjectImages;
the two gallery images use lossless WebP derivatives at 480, 960 and 1920 px.

The collaboration layout places the video before the overview, followed by
“Collaboration Artwork” / “Совместная работа” and “Original GRGY Artwork” /
“Исходная графическая работа GRGY”. Images retain full proportions. Video uses
native controls and preload="none", with sound enabled and no autoplay or loop.
mediaPending is removed. The pending-state test now validates the complete media
record and rejects partial records.

## Verification

Run npm run build, npm test, and npm run test:featured. Inspect the actual pages
in both languages at desktop/mobile widths, checking image loading, overflow,
deferred video loading, playback, seeking, enabled audio, Projects cover, CV links
and video byte ranges. Build success alone does not confirm live publication.
