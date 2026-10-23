# GRGY content update v4

Branch: `feat/grgy-content-v4`. No publication is authorized for this update.

## Approved copy and scope

The paragraphs and 15 CV entries per language in `data/artist.json` were extracted
verbatim from the artist's attached `Pasted text.txt` (Website Content Update v4).
Artist Statement and Bio each retain four paragraphs. Markdown emphasis becomes
semantic `<em>` markup. No biographical interpretation or new project description
has been added.

CV has four sections in the supplied reverse chronology: Exhibitions & Selected
Projects (4), Selected Collaborations (9), Publications (1), Education (1).
Internal links use the existing three project pages, retaining the exact v4 CV
wording. Collaboration names without available project pages remain text.

Only the six information pages, their data, renderer, scoped CV/prose styles,
tests and documentation are changed. Homepage, artworks and order, Works and
Projects pages, navigation, logo, fonts, colors, domain and hosting are retained.
No new project pages, source images, video, shop or decorative assets are added.

## External source checks

These six supplied destinations were requested with TLS verification enabled.
All failed before reaching the destination: the environment proxy rejected the
HTTPS CONNECT request with HTTP 403 (`curl` exit 56, destination HTTP status 000).
The same result occurred with escalated execution. This is an environment access
limitation, not evidence that these websites return 403 or have disappeared.

| Source | URL | Use in this update |
| --- | --- | --- |
| ChikoRoko work | https://r.toys/en/toy/kloud | CV links to the existing internal project instead |
| Tim Baym / Memory #27 | https://www.sobaka.ru/ufa/entertainment/art/160276 | Text-only CV entry pending availability verification |
| STUDIO 21 / AdIndex | https://adindex.ru/news/releases/2022/05/27/304599.phtml | CV links to the existing internal project instead |
| STUDIO 21 / Outdoor | https://outdoor.ru/news/khip_khop_radio_studio_21_obedinyaet_lyubiteley_muzyki_vo_vsyem_mire/ | No unverified external link added |
| Rarible Verification Collab | https://vimeo.com/659295921 | Text-only CV entry pending availability verification |
| DECIPRALAND | https://art.cipr.ru/decipraland-2023/ | Text-only CV entry pending availability verification |

The artist profile `https://r.toys/en/user/grgy/toys` was not separately checked
after the R.Toys host was blocked. The supplied legacy URL
`https://chikoroko.art/en/shop/toy/kloud` is retired based on the artist's report
of HTTP 404 and is not used. This update does not independently verify that 404.

`https://nuw.store/catalog/gleb_kostin_solutions/` is stored as brand context only;
it was not separately fetched or linked as evidence of the collaborative bag.
The Solukta entry links to its existing internal project page.

All supplied sources remain recorded centrally with their observed/unverified
status. A later verified relevant source can be enabled without rewriting CV copy.

## Facts deliberately not added

- 13,000 ChikoRoko sales or an interpretation of the R.Toys “Collected” figure.
- An exact number of STUDIO 21 façades or screening duration.
- An individual commercial Rarible commission. The approved entry explicitly
  identifies a collective NFT animation project by NFTBastards, dedicated to Rarible.
- Unsupported participants, awards, exhibitions, dates, sales or interpretations.

Artist-provided v4 facts are used as approved copy; external research was not
used to embellish them.

## Validation and files

`npm run build` and all 17 `npm test` checks passed. `npm run test:content`
passed in both languages at 1440, 768, 600, 390 and 320 px: exact rendered copy,
four prose paragraphs, all fifteen CV entries, chronology, separate year column,
no horizontal overflow, internal links, title/description/canonical/hreflang and
language switching that preserves the current route. Source-data comparison
against the uploaded request also matched every paragraph and all 30 localized
CV entries verbatim.

Screenshots for all three pages in EN/RU at desktop/mobile widths are saved to
`test-results/v4-{artist-statement,bio,cv}-{en,ru}-{1440,390}.png` (ignored outputs).

Changed files:

- `artist-statement/index.html`, `ru/artist-statement/index.html`
- `bio/index.html`, `ru/bio/index.html`
- `cv/index.html`, `ru/cv/index.html`
- `data/artist.json`, `scripts/build.mjs`, `portfolio.css`
- `package.json`, `README.md`
- `tests/content.test.mjs`, `tests/content-browser.cjs`
- `tests/site.test.mjs`, `tests/projects-browser.mjs`
- `docs/content-v4.md`, `docs/projects.md`

Git comparison confirmed no content changes to homepage, Works/Projects,
artwork data, images, original stylesheet, navigation script, sitemap or CNAME.
