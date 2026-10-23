# GRGY (Grgy Sukhanov)

The existing static HTML/CSS site, with generated portfolio pages in English and
Russian. Hosting and `CNAME` (`grgyone.com`) are unchanged. Generated HTML is
committed for GitHub Pages; no framework or application server is needed there.

## Development

Use Node.js 22 or later, from the existing checkout:

```sh
npm ci
npm run build
npm run dev
```

The development server listens on port 4173 (`PORT` overrides it), supports clean
directory URLs, and blocks archive and development paths.

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Browser checks start their own server on port 4174, cover desktop and mobile,
and write screenshots to ignored `test-results/`. Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium binary if needed.
These commands do not deploy the site.

## Content

Edit `data/artworks.json`, then run `npm run build`. Array order is display order:
the six supplied works follow the approved file numbering 1–6. Do not sort them.
`selected` controls the homepage. `objectPosition` controls each square preview;
detail images retain the source aspect ratio. Stable category/slug pairs provide
unique URLs while preserving duplicate titles such as Reworked.

Original files retain their names and bytes in `images/artworks/originals/`.
Run `npm run images` to regenerate responsive WebP derivatives, then build.
Derivatives preserve full aspect ratio; only gallery CSS uses `object-fit: cover`.
Add categories in the categories array: only categories with artworks appear in
navigation, always below Artist Statement/Bio/CV. The supplied category “On the
street” maps to the requested Street Art navigation label.

Approved v4 artist texts live in `data/artist.json`: four paragraphs each for
Artist Statement and Bio in EN/RU, and structured CV sections with localized
entries. Add CV events to the appropriate section in reverse chronology, preserving
the supplied copy. `projectId` connects an entry to an existing project; external
sources become links only with `status: "verified"`. See `docs/content-v4.md` for
the source-check limitations. `portrait: null` keeps Bio text-only; a future
approved portrait can supply `src`, actual `width`/`height` and `alt.en`/`alt.ru`.
Artwork pages deliberately have no Description block; SEO descriptions remain
in the head.

English is at `/`, Russian at `/ru/`. Language links preserve the current artwork
or section. Artwork titles and category names remain original; interface labels,
medium labels and artist texts have Russian and English versions.

## Existing URLs and publication

`/free/` and its files remain available without adding an unsolicited menu section.
Existing about/portfolio URLs redirect to Contact/Works. Commerce HTML URLs
redirect to Works; their sources, scripts and backend schema are preserved under
`_archive/shop/` and excluded from GitHub Pages. No backend data was changed.

The build generates static pages, metadata, canonical URLs, hreflang, Open Graph,
artwork structured data, sitemap and robots.txt. `_config.yml` excludes development
and archive files from the existing GitHub Pages publication path. Source CSS is
retained in `styles.css`; portfolio-specific styles are in `portfolio.css`.

Review and test this branch before any publication to the main domain.

## Projects and collaborations

Street-art narratives can be added in `data/artwork-details.json` keyed by the
existing artwork id. Detail `displayTitle` is independent of the slug and the
approved homepage title. See `docs/three-featured-projects.md` for the current
Big Face archive limitation and the two completed media-backed featured projects.

Project content is centralized in `data/projects.json`; complete media galleries,
video, bilingual descriptions and links render through `scripts/projects.mjs`.
See [project intake and schema](docs/projects.md) for the current material
inventory, exact media fields and validation commands. Three earlier projects
have text pages; Cutestar and SHOUT OUT KLOUD now include actual archive galleries,
and SHOUT includes the supplied animation. Run `npm run test:featured` to verify
all real archive images and video on desktop/mobile. Draft projects remain excluded from pages, category
navigation, CV and sitemap. A project without a cover uses a text listing, with
no placeholder image or borrowed artwork.
