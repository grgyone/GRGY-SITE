# Works hierarchy update — 24 October 2026

## Structure and routes

Cutestar, SHOUT OUT KLOUD and Big Face are standalone children of Works in both
desktop and mobile navigation, with canonical routes and RU equivalents:

- `/works/cutestar-merch-as-art/` — year 2023, confirmed by the artist.
- `/works/shout-out-kloud/` — creation year still unspecified.
- `/works/big-face/` — existing creation year 2023 retained.

The six homepage cards retain their approved order, titles and preview images.
The Big Face card links to its new standalone URL. The Works overview includes
Cutestar and SHOUT alongside artworks, not inside its Projects subsection.
Big Face is no longer duplicated in the Street Art category listing.

Projects contains ChikoRoko and STUDIO 21 only. Solukta is marked `draft` and
`retired`: it has no public project content, card, CV link or sitemap entry.
Its approved CV text and original source record remain recoverable.
No CV event or artwork original was deleted.

## Redirects and SEO

Both languages preserve incoming links using static meta-refresh redirects with
destination canonical URLs, `noindex, follow`, and an ordinary fallback link:

- Old Cutestar and SHOUT `/works/projects/{slug}/` → direct `/works/{slug}/`.
- `/works/street-art/big-face/` → `/works/big-face/`.
- The retired Solukta address → `/works/projects/`.

GitHub Pages hosting and CNAME are unchanged. The static build emits 42 public
EN/RU pages; redirect aliases are excluded from the sitemap. Language switches,
CV links, OG metadata and previous/next navigation use the new routes. Standalone
works return to Works; the remaining projects return to Projects.

## SHOUT OUT KLOUD

Image sequence:

1. Title, then original `50-52.png` as the opening project logo.
2. Supplied `SHOUTGRGY_1.mp4` immediately below that logo.
3. Original collection overview, project information and `50-01.png` through
   `50-51.png`, in their existing order.
4. Four existing supporting graphics, retaining their original proportions.
5. Original `50-53.png` as the last image on the page.

All 58 images remain present once each. Visible image/video captions are omitted
on this page only; bilingual alt text and accessible controls remain. The T-shirt
concept is still identified in alt text, without claiming a physical release.
Stable `assetIndex` values preserve existing optimized-image URLs after reordering,
so an old cached derivative cannot become a different artwork.

## Big Face: supplied and blocked materials

The new `BF w bg.zip` (4,888,110 bytes) was downloaded and inspected.
It contains five images and no text or video:

- `0.png` (2000 × 2769): original drawing.
- `1.jpg` (3024 × 4032): architectural view of the building.
- `2.jpg` (960 × 1280): artwork in the opening, used as the main photo.
- `3.jpg` (1536 × 2048): closer view of the entrance and artwork.
- `4.jpg` (960 × 1280): view from inside.

All five are used. Exact filenames/bytes are preserved under
`images/projects/originals/big-face/`; uncropped WebP derivatives are in
`images/projects/optimized/big-face/`. Existing homepage image
`images/artworks/originals/3.jpg` is unchanged and distinct from the archive's
`3.jpg`. Archive dates were not used as creation dates.

`IMG_1649.MP4` was received as an upload, but the transfer tool rejects it because
it exceeds 32 MiB. It was not downloaded or inspected; no duration, codec, frame
or playback success is claimed. A smaller upload (under 32 MiB) is needed before
adding its actual footage. No empty video, mock 3D viewer or placeholder is shown.
Existing bilingual story and historical context remain intact.

`data/featured-media-manifest.json` records new image dimensions, byte sizes and
SHA-256 hashes, and separately records the blocked video. Across the three
accessible archives there are 71 original images and one SHOUT video, all
byte-preservation checked.

## Validation

- Build and 23 automated tests, including all 72 original media hashes,
  derivative proportions, ordering, hidden captions, retirement and redirects.
- Main browser suite: EN/RU at 1440, 768, 600, 390 and 320 px.
- Real-media suite: all 71 images, SHOUT MP4 playback/seeking, revised layout,
  Big Face gallery, redirects and locale/CV links at 1440, 768, 390 and 320 px.
- Artist-content browser suite: approved text and all 15 CV entries preserved.
- Isolated renderer fixtures remain separate from artist materials.

Screenshots: ignored `test-results/featured-*.png` and
`test-results/big-face-{en,ru}-{1440,390}.png` (plus gallery variants).

## Source changes

Content: `data/projects.json`, `data/artwork-details.json`, media manifest and five
Big Face originals/derivatives. Rendering: `scripts/projects.mjs`,
`scripts/build.mjs`, `scripts/images.cjs`, `portfolio.css`. Generated EN/RU pages,
redirects, CV links and sitemap follow the data. Test suites and documentation
were updated; hosting, shop archive, artist prose, original artwork files and
six-work homepage order are unchanged.
