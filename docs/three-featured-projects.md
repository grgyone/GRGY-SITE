# Three featured projects: implementation and material inventory

Branch: `feat/grgy-three-featured-projects`, based on the unpublished v4 content.
No deployment or push to the main branch has been performed. The existing design,
homepage selection, stable artwork URLs, artist texts and hosting are preserved.

## Cutestar / Merch as Art — working EN/RU pages

Routes: `/works/projects/cutestar-merch-as-art/` and its `/ru/` equivalent.
The ready project uses all eight images from `МЕГА Дыбенко.zip`:

- `12tig.png`: main T-shirt visual.
- `cutestar-01.png`: original graphic.
- `photo_2026-10-23_20-09-41.jpg`: GRGY's exhibited T-shirt.
- `photo_2026-10-23_20-09-55.jpg`, `photo_2026-10-23_20-09-59.jpg`,
  `photo_2026-10-23_20-11-09.jpg`, `photo_2026-10-23_20-09-51.jpg`:
  exhibition photographs and details, not attributed to GRGY as individual works.
- `photo_2026-10-23_20-11-21.jpg`: exhibition poster.

`about.txt` was read as source material, not as instructions. Its private reference
copy is in `_archive/project-sources/mega-dybenko/`, excluded from publication.
The main visual, drawing, GRGY T-shirt, exhibition context and poster are presented
in that order. Original images are linked from their full-proportion derivatives.
Denis Fabrika / Dvor 759 is credited for the invitation, not called a curator.
An internal link was added to the existing exhibition entry in both CV versions;
its approved wording and 2023 year were not changed.

The event text confirms 15–30 April, ground-floor atrium, MEGA Dybenko,
Saint Petersburg. Neither the poster nor direct event text explicitly confirms
the year. A 2023 URL in the text refers to a different Open Call, not this exhibition.
Project creation year is therefore `null` and omitted, pending confirmation.
Exported 2026 photo filenames and archive timestamps are not creation dates.
The organizer post `https://t.me/dvor759/4223` could not be independently inspected:
the environment proxy returns CONNECT 403, including with escalated execution.
It is recorded as a blocked source, not an asserted verified public link.

## SHOUT OUT KLOUD — working EN/RU pages

Routes: `/works/projects/shout-out-kloud/` and its `/ru/` equivalent.
All 59 media files from `shout out.zip` are used:

- `50 in 1 L.png`: collection cover.
- `50-01.png` through `50-53.png`: all 53 supplied numbered files, in exact order.
- `SHOUTGRGY_1.mp4`: original 3.04-second, silent H.264 animation, 2500 × 2000.
- `50 in 1.png`, `TWbanner-01.png`, `mem.png`: supporting collection graphics.
- `tt shirt.png`: explicitly labeled a T-shirt concept, not a physical release.

The collection has a title above its cover, a three-column desktop/two-column
mobile gallery, lazy responsive images, full-size original links, native video
controls and the artist-supplied Telegram sticker link. The video poster is an
actual frame from the supplied animation, not generated substitute artwork.
It can be reproduced with FFmpeg:

```sh
ffmpeg -i videos/projects/shout-out-kloud/SHOUTGRGY_1.mp4 -frames:v 1 -vf scale=1280:-2 -c:v libwebp -quality 82 images/projects/optimized/shout-out-kloud/animation-poster.webp
```

No year was inferred from file timestamps. The page does not invent a Foundation
URL, minted/sold token count or physical T-shirt release. Numbering describes the
supplied files, not an edition size. No unapproved CV event was added for SHOUT.
The Telegram sticker link comes from the artist; proxy restrictions prevent
independent verification of Telegram pages in this environment.

## Big Face — additional archive blocked

Stable route `/works/street-art/big-face/`, original photograph `3.jpg`, approved
creation year 2023 and existing bilingual narrative remain intact. Display title
can change separately from the URL and approved homepage card. Historical context
distinguishes the building's 1911–1912 dates and architect Vladimir Pokrovsky from
the artwork. The one-week account is attributed to the artist's recollection.
The historical URL remains artist-provided; the environment proxy blocks its
verification, as documented in the earlier update.

The upload `BF w bg.zip` was received, but the download tool rejects it because it
exceeds the 32 MiB transfer limit. Its contents have **not** been inspected, copied
or attributed. Additional documentary photos and the actual MP4 fly-through remain
unintegrated. Existing `documentation.video` and `.model` are still null: no fake
3D viewer, empty video or placeholder gallery is rendered. Provide smaller ZIP
parts (each under 32 MiB), or upload photographs and the video separately.

## Preservation and unused materials

Original filenames and bytes of all 66 accessible images and the MP4 are preserved
under `images/projects/originals/{project-id}/` and `videos/projects/{project-id}/`.
`data/featured-media-manifest.json` records dimensions, byte sizes and SHA-256 hashes
captured from the extracted archives. All accessible media are used; `about.txt`
is used for factual reference, not displayed as promotional copy. Only the
inaccessible Big Face archive remains unused. Responsive WebP derivatives are
uncropped; CSS crops only project-listing previews. No original artist image was
redrawn, retouched, renamed or assigned to a different project.

## Validation and screenshots

- `npm run build`: 44 public pages, EN/RU metadata, canonical/hreflang and sitemap.
- `npm test`: 22 tests, including SHA-256 checks of all 67 original media files,
  image proportions, ordered collection, stable Big Face data and repeatable build.
- `npm run test:browser`: six selected artworks, five projects, navigation and
  language switching at 1440, 768, 600, 390 and 320 px, both languages.
- `npm run test:content`: approved Statement/Bio/CV copy and links, both languages.
- `npm run test:featured`: all 66 real images decode and original links resolve;
  actual supplied MP4 plays and seeks, byte ranges work, CV/language links work,
  no horizontal overflow at 1440, 768, 390 and 320 px, both languages.
- `npm run test:projects`: isolated renderer fixtures, not presented as artist media.

Actual-page screenshots (ignored `test-results/`):
`featured-{cutestar-merch-as-art,shout-out-kloud}-{en,ru}-{1440,390}.png`,
with `-information`, `-gallery` and (SHOUT) `-video` variants.

Still requiring artist clarification: Cutestar's creation/exhibition year, SHOUT's
creation year (if it should be displayed), and Big Face's inaccessible archive.
No publication is authorized by this material upload.

## Changed files

- Content: `data/projects.json`, `data/artist.json` (CV link only), new
  `data/featured-media-manifest.json` and private source text under `_archive/`.
- Rendering: `scripts/projects.mjs`, `scripts/build.mjs`, `portfolio.css`.
- Assets: `images/projects/originals/`, `images/projects/optimized/`,
  `videos/projects/shout-out-kloud/SHOUTGRGY_1.mp4`.
- Generated pages in EN/RU: both new project directories, Projects listing,
  Works overview, CV and the Solukta page's next-project link; `sitemap.xml`.
- Checks: `tests/featured-projects.test.mjs`, `tests/featured-browser.cjs`,
  `tests/projects.test.mjs`, `tests/site.test.mjs`, `tests/browser.cjs`,
  plus the new `test:featured` command in `package.json`.
- Documentation: `README.md`, `docs/projects.md`, this report.

Git comparison against `d3bbafa` confirms no changes to `index.html`,
`ru/index.html`, `data/artworks.json`, `data/artwork-details.json`,
`images/artworks/`, `styles.css`, `site-nav.js` or `CNAME`.
