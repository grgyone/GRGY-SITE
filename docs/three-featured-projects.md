# Three featured projects: implementation and material inventory

Branch: `feat/grgy-three-featured-projects`, based on the un-published v4 content
branch. Do not publish without the artist's permission. The earlier v4 work is
retained; this update does not reset or replace it.

## Available files

The new upload contains the artist's request (`Pasted text.txt`) only.
`BF w bg.zip`, `МЕГА Дыбенко.zip` and `shout out.zip` are named in that request,
but none is present in the provided attachments or available workspace files.
No archive file inventory, gallery attribution or MP4 playback check can be
completed for those missing archives.

The earlier `main page.zip` is still available. Its `3.jpg` is already assigned
to Big Face and is the only existing image used by this update. No image was
reassigned from another artwork or used as a substitute for missing material.

## Big Face — work in progress

Existing URL `/works/street-art/big-face/` is preserved in both languages.
The original photograph, full aspect ratio, original-image link and optimized
derivatives are retained. Creation year remains 2023 from `data/artworks.json`;
no photograph date or building date is substituted.

`data/artwork-details.json` adds the artist-provided location, two story
paragraphs, historical context and source in EN/RU. The one-week account is
explicitly attributed to the artist's recollection. It does not imply advance
knowledge of restoration or an artistic commentary on it.

`displayTitle.en` / `displayTitle.ru` can change the detail heading and metadata
without changing the stable artwork slug or the approved Selected Artworks card.
Building dates 1911–1912 and architect Vladimir Pokrovsky are in a separate
historical section, distinct from the artwork's 2023 creation date.

The historical-source URL is included as supplied by the artist. The environment
proxy blocks its HTTPS CONNECT request with HTTP 403 (`curl` exit 56, destination
status 000), including with escalated execution. The historical text therefore
remains artist-provided, not independently verified against the remote page.

Additional documentary photographs and the actual MP4 fly-through are still
missing. No 3D viewer, empty video or interactive model has been invented.
The separate `documentation.video` and `documentation.model` fields distinguish
the future real video asset from a possible interactive model, both currently null.

## Cutestar / Merch as Art — pending archive

The draft record in `data/projects.json` retains the requested stable slug
`cutestar-merch-as-art`, bilingual history, medium, location and invitation
attribution. It does not call Denis Fabrika a curator. The supplied April 15–30
dates and provisional exhibition year 2023 are explicitly pending archive
verification; no unconfirmed creation year is displayed.

Original drawing, T-shirt image, exhibition photographs, poster and event text
are absent. No public page or CV link is generated until this can be a real
media-backed project. The existing 2023 CV record is preserved without edits.

## SHOUT OUT KLOUD — pending archive

The draft preserves the exact title, stable slug `shout-out-kloud`, bilingual
artist-provided project description and the supplied Telegram sticker source.
Creation year is unspecified. No token count, sales figure, physical T-shirt
release or Foundation URL has been invented.

The numbered images 50-01 through 50-53, overview graphics, animation and T-shirt
concept are described in the request but not provided as files. No gallery,
animation or public page is claimed to be complete. Sequence and exact filenames
must be checked once the real archive arrives.

## Completion prerequisites

Provide `BF w bg.zip`, `МЕГА Дыбенко.zip` and `shout out.zip`. Their actual contents
are needed to select covers, retain filenames/order, create derivatives, add
gallery captions, verify media and render final desktop/mobile screenshots.
Resolve Cutestar's exhibition year and SHOUT OUT KLOUD's creation year from
provided text/source evidence or artist confirmation; do not infer them from
file modification dates or token-like file numbering.

Homepage, its six artworks/order, the logo, original image bytes, existing Projects
pages and v4 informational content are unchanged by this update. No publication
has been performed.

## Validation completed

Build and 19 tests passed. Existing six artworks and the three previously available
projects passed the browser suite in EN/RU at 1440, 768, 600, 390 and 320 px.
Big Face additionally passed photograph decoding, context rendering, no horizontal
overflow, stable URL and language switching at desktop/mobile widths. Screenshots:
`test-results/big-face-{en,ru}-{1440,390}.png`.

Git comparison against the v4 base confirmed that Selected Artworks, existing
project pages, CV, artist texts, image files, navigation and CNAME were untouched.
The two new featured-project drafts have no generated public pages or CV links.
Real archive image/video checks remain unrun, because the three archives have
not been supplied; technical fixtures are not reported as those real materials.
