# Big Face — actual video connected, unpublished review

The latest IMG_1649.mp4 upload downloaded successfully (29,597,401 bytes).
It is now connected to the existing EN/RU Big Face documentation block.
Earlier failed uploads are historical; the transfer blocker is resolved.

Original filename and bytes are preserved at videos/projects/big-face/IMG_1649.mp4.
SHA-256: 60c91698c5df17eec7a916ceffdea7057ded533fd5d33eb41b6ea40307c5bc2f.
The supplied file is H.264 Baseline, yuv420p, 1920 × 1080, 60 fps,
41.066667 seconds, no audio. Its moov atom already precedes mdat (fast start),
so no re-encoding or remux was needed.

Poster: images/projects/optimized/big-face/video-poster.webp, an actual frame
at 30 seconds, showing Kloud inside the architectural opening. Reproduce with:

```sh
ffmpeg -ss 30 -i videos/projects/big-face/IMG_1649.mp4 -frames:v 1 -vf scale=1280:-2 -c:v libwebp -quality 88 images/projects/optimized/big-face/video-poster.webp
```

data/artwork-details.json connects video and poster with actual dimensions and
EN/RU alt text. data/big-face-video.json records source properties and hash.
The existing lazy player shows a poster and button, makes no MP4 request before
activation, then plays inline using native controls. No autoplay on page load,
no interactive model or substituted footage. Actual original video, poster,
playback, seeking to 30 seconds and HTTP byte ranges are verified.

Checks: npm run build, npm test (28 tests), and
node tests/big-face-video-browser.cjs, covering the actual uploaded file in
EN/RU at 1440 and 390 px, no horizontal overflow and preserved 16:9 proportions.
Screenshots: test-results/big-face-video-{poster,playing}-{en,ru}-{1440,390}.png.

Only Big Face data, its EN/RU HTML, video/poster, tests and this report changed.
Homepage, other projects, photos, visual styles and canonical/legacy URLs remain
unchanged from the prepared refinement. Historical source verification remains
as documented previously; this video update does not resolve that separate issue.
No push or deployment was performed.
