# Working on GRGY-SITE

## Repository and sources

This is GRGY's bilingual static artist portfolio, published through GitHub Pages
at grgyone.com. Use Node.js 22 or later. Keep the existing static architecture.

- `data/artworks.json`: artworks, categories, homepage selection and order.
- `data/artist.json`: approved EN/RU statement, biography and curated CV.
- `data/artwork-details.json`: artwork narratives, galleries and documentation.
- `data/projects.json`: project records, media, status and listing order.
- `scripts/build.mjs`: generated pages, redirects, metadata and sitemap.
- `scripts/projects.mjs` and `scripts/documentation.mjs`: project and player rendering.
- `portfolio.css`, `styles.css`, `site-nav.js`: presentation and navigation.

Read `README.md` and the relevant documentation before changing a feature.
For Big Face, `docs/big-face-refinement.md` and then `docs/big-face-video.md`
supersede older navigation and transfer-limit notes in `docs/projects.md` and
`docs/works-update-2026-10-24.md`. The actual Big Face video is connected.
Use current data and tests to verify behavior; do not restore historical layouts
or treat an old branch name or page count as a current requirement.

## Content and media workflow

1. Edit source data or rendering code, then run `npm run build`. Generated HTML
   is committed for GitHub Pages; do not make a generated page the sole source
   of a change. Inspect the resulting diff for unrelated changes.
2. Preserve the approved six-work homepage order, titles and previews unless
   the task explicitly changes them. Array order in artworks is display order.
3. Keep EN/RU variants consistent. Language switching must preserve the current
   work or section. Preserve canonical URLs and legacy redirects when moving pages.
4. Preserve approved artist copy. Do not invent dates, materials, credits, source
   verification or captions. Keep unconfirmed optional facts absent or null.
   A source blocked by the environment is not a verified source.
5. Keep original media filenames and bytes. Use separate project directories to
   avoid collisions. Add actual dimensions and bilingual alt text to media data;
   run `npm run images` only when derivatives need generating, then build.
   Full images retain their aspect ratio; thumbnail crops belong in CSS.
6. Do not borrow unrelated artwork for a missing project cover or add placeholder
   media. Approved text-only projects are supported. Draft/retired records stay
   out of public pages, navigation and sitemap; preserve recoverable source data.
7. Big Face documentation uses its supplied MP4 with a lazy poster: no video
   request before activation, inline native controls, preserved proportions and
   working seeking. Do not replace it with another project's footage.

See `docs/projects.md` for the media schema. Preserve existing stable asset indices
when reordering media so cached derivative URLs retain their original meaning.

## Development and verification

Install dependencies with `npm ci` when needed. `npm run dev` serves on port 4173
(`PORT` overrides it). Browser suites start their own servers and write ignored
screenshots under `test-results/`. With system Chromium, prefix browser commands
with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`; otherwise use an
installed Playwright Chromium. See `package.json` for available npm commands.

- Run `npm run build` and `npm test` for source/content changes.
- Run `npm run test:browser` for shared layout, routing and navigation changes.
  It covers EN/RU at 1440, 768, 600, 390 and 320 px, language switching,
  horizontal overflow, image loading, runtime errors and legacy redirects.
- Run `npm run test:content` for artist copy/CV changes.
- Run `npm run test:featured` for actual project media/layout changes.
- Run `npm run test:projects` for project renderer/schema changes; its isolated
  playback fixtures require FFmpeg. Never copy fixture records into public data.
- Run `node tests/big-face-video-browser.cjs` for Big Face video/player changes.
  It checks the actual source hash, deferred loading, playback, seeking and ranges.

For visual work, also inspect relevant screenshots at desktop and mobile sizes
in both languages. Automated assertions alone do not establish visual quality.
Report the checks actually run and any failures or limitations. Do not claim a
publication or remote source check based only on a successful local build.

## Hosting and scope

Keep `CNAME`, GitHub Pages configuration and existing URL compatibility unless
the requested task changes hosting. `/free/` remains available. Commerce sources
and schema stay recoverable under `_archive/shop/`, excluded from publication.
Do not reintroduce archived shop scripts or backend behavior into the portfolio.
Keep agent instructions, development tooling and test artifacts out of publication.
Prepare and verify local changes before publication; use the user's current
authorization to determine whether a push or deployment is in scope.
