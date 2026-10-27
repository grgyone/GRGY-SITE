# Big Face refinement — review version, not published

Branch: feat/big-face-refinement. URL /works/big-face/ and RU equivalent remain
unchanged. Both supplied three-paragraph descriptions are reproduced verbatim.

## Media sequence

1. 2.jpg: main architectural view with the artwork.
2. 3.jpg: closer entrance/artwork view.
3. 4.jpg: interior view, showing the character and tear more clearly.
4. 1.jpg: additional architectural context, without the installed work.
5. 0.png: original drawing as supplementary material, not labeled a photograph.

These are the five existing distinct files; no invented close-up, duplicated
frame, crop, retouching or new derivative was introduced. Stable assetIndex
values keep existing optimized-image URLs tied to the same original after
reordering. SHA-256 original-media checks and aspect-ratio checks pass.

## Context and verification limitation

Historical context is two sentences: the supplied 1911–1912 dates / Vladimir
Pokrovsky attribution and the building's original role serving imperial-family
railway journeys. The supplied history URL remains linked. The source returns
HTTP 403 in this environment, including elevated read-only access. The new
purpose sentence is a review draft based on the station's historical designation,
not an independently checked source quotation. Source verification is explicitly
recorded as unavailable in data/artwork-details.json; no remote verification is
claimed. Please confirm the wording or provide an accessible source excerpt.

## Navigation and preservation

The canonical route remains direct under Works for incoming-link compatibility,
independently of category membership. Big Face is listed in Street Art, returns
to Street Art and links only to Kloud in its category pagination. The old
/works/street-art/big-face/ redirect remains intact in EN/RU. Big Face's individual
sidebar entry was removed globally; Cutestar/SHOUT navigation and all other
project bodies are untouched. No optional Projects duplicate was created.

The shared menu removal necessarily regenerates site HTML. Comparison with the
base commit confirms 132 unrelated page bodies, including both homepages and
other projects, are identical. Selected Artworks order, images and links are
unchanged. Artwork/project/artist source data, original/optimized images,
portfolio.css, styles.css, site-nav.js, CNAME and hosting are unchanged.

## Documentation player

IMG_1649.mp4 cannot be transferred: the upload tool rejects it as exceeding the
32 MiB limit. No accessible local copy exists. The actual video has not been
inspected, converted, embedded or claimed to play. documentation.video and .model
stay null, so the page has no empty 3D heading, placeholder or fake model.

scripts/documentation.mjs supports a future video object:

```json
{
  "src": "/videos/projects/big-face/IMG_1649.mp4",
  "poster": "/images/projects/optimized/big-face/video-poster.webp",
  "width": 1920,
  "height": 1080,
  "alt": { "en": "Approved frame label", "ru": "Утверждённая подпись кадра" }
}
```

Dimensions are illustrative only; use real video dimensions once accessible.
Local assets must exist or the build fails. HTTPS MP4 and poster URLs are also
supported. A lazy image poster appears with an accessible native button; no video
element or source request exists before click/keyboard activation. The player
then uses MP4, native controls, inline playback, responsive full aspect ratio and
metadata-only preload. No autoplay on page load. Its dedicated JS/CSS are included
only on a page with connected documentation, never on unrelated pages.

Upload an MP4 under 32 MiB or supply a direct HTTPS MP4 URL and an actual poster
frame to connect the supplied footage. Do not substitute the SHOUT animation.

## Verification

- Build: 116 public EN/RU pages, stable canonicals and legacy redirects.
- 28 tests: exact text, category links, image sequence, no empty 3D block,
  media hashes, optional player validation and existing portfolio regression checks.
- Main browser suite: EN/RU, 1440/768/600/390/320 px.
- Real-media browser suite: all existing images, Big Face gallery/text screenshots,
  original proportions, no overflow, CV links, locale switching and redirects.
- node tests/documentation-browser.mjs: isolated technical player fixture using
  the existing SHOUT clip (not Big Face documentation), EN/RU at 1440/390 px;
  verifies zero MP4 requests before click, external-source playback and controls.

Review screenshots: test-results/big-face-{en,ru}-{1440,390}.png, plus -text and
-gallery variants. No deployment or remote push has been performed.
