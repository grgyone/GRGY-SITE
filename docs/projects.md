# Projects: content and material intake

For the current structure and material status, see
[the 24 October Works update](works-update-2026-10-24.md). Earlier inventory notes
below describe the original intake; newer artist instructions take precedence.

Current work is on `feat/grgy-three-featured-projects`. Do not push to `main` or publish
without the artist's approval for this update.

## Current material inventory

`main page.zip` from the earlier homepage task contains
`1.PNG`, `2.PNG`, `3.jpg`, `4.png`, `5.jpg`, `6.png` and
`описание.txt`. Those six files remain assigned to their existing artworks.
None has been reassigned to a collaboration or used as a project cover.

No ChikoRoko, STUDIO 21 or Solukta archive, photograph or video was attached to the
Projects request. The artist subsequently authorized completing the update with
the information already supplied, adding media later. The three actual projects
therefore have text pages in both languages, with their confirmed metadata,
descriptions, navigation and CV links. There are no empty galleries, image
placeholders or borrowed artwork images. Actual-page screenshots are in ignored
`test-results/project-*.png` and `test-results/projects-*.png`.

Those three priority projects remain `ready` for the agreed text-only version.
Two later archives now supply real Cutestar and SHOUT OUT KLOUD galleries and
SHOUT's MP4; both have ready EN/RU pages. See `three-featured-projects.md` for the
complete file inventory and the blocked Big Face archive (32 MiB transfer limit).
Other named projects have no placeholder pages. A future `draft` record still
stays out of pages, navigation, CV and sitemap.

## Required material before completion

- ChikoRoko × GRGY — Kloud (2022): project-specific main visual and supporting
  material; confirmed participant/publication URLs if available. Do not interpret
  “13,000” as sales or edition size without a source confirming its meaning.
- STUDIO 21 — Music Lovers Worldwide (2022): the artist's animation, still/poster,
  supporting photographs and any approved captions/credits. No exact façade count
  or screening duration is recorded.
- GRGY × Solukta × Gleb Kostin (.solutions) (2025): main bag photograph and any
  details/sketches/documentation. Material/process and location remain unspecified.
  Both Gleb Kostin and the .solutions name are preserved in the draft.
- For all projects: confirm which archive files belong together, gallery order,
  cover, any supplied captions/photo credits and final bilingual descriptions.
  Unclear file attribution must be resolved before assigning an image.

Use “HODL by Pixelord” for future Pixelord materials. Describe Rarible Verification
Collab as a collective project, not an individual commission from Rarible.

## Data schema and assets

Each record has `id`, `slug`, `title`, `year`, `category: "projects"`, `status`,
`projectType`, `medium`, `collaborators`, `location` (optional), `descriptionRu`,
`descriptionEn`, `coverImage`, `gallery`, `videos`, `externalLinks`, `displayOrder`.
Set `year` explicitly to `null` if unconfirmed; it will be omitted from metadata
and visible information, not inferred from filenames. Use `null` or omit other
optional facts when not confirmed. `projectType`, `medium` and
`location` accept either a shared string or `{ "en": "…", "ru": "…" }`.
Collaborators use `{ "name": "…", "url": "https://…" }`; URLs are optional.
External links use `{ "label": { "en": "…", "ru": "…" }, "url": "https://…" }`.

Optional `layout: "collection"` places the title above the cover and uses a
three-column desktop/two-column mobile gallery. `galleryHeading` localizes its
heading. `supportingGallery` separates additional graphics/concepts from the main
series; `supportingHeading` localizes that section. Optional `additionalInfo`
entries have localized `label` and `value` objects (e.g. exhibition dates or an
invitation credit), without changing existing projects.

`coverImage` and each `gallery` / `supportingGallery` image use:

```json
{
  "src": "/images/projects/originals/project-id/Original filename.JPG",
  "width": 1600,
  "height": 1200,
  "altEn": "Approved, factual image label",
  "altRu": "Утверждённая подпись к изображению",
  "caption": { "en": "Optional supplied caption", "ru": "Подпись, если предоставлена" },
  "objectPosition": "50% 50%"
}
```

Dimensions above illustrate the schema only; use actual displayed image dimensions
(including EXIF orientation). The image command checks them against the original.
Keep original filenames and bytes. Separate project directories prevent filename
collisions between archives. No image crop is written to disk. Full gallery
images retain their proportions; only listing thumbnails are cropped by CSS.

Videos use `src` under `/videos/projects/`, `width`, `height`, optional `poster`,
optional bilingual `caption`, and optional `tracks` with `src`, `lang` (`en`/`ru`)
and `label` pointing to WebVTT captions. Use browser-compatible MP4 or WebM.
Preserve an original MOV separately if conversion is needed; verify the output
against the supplied source. Videos have native controls, inline mobile playback,
metadata-only preload and no autoplay. The dev server supports byte ranges/seeking.

`ready` records require bilingual descriptions and actual files for declared media.
Unconfirmed optional facts are omitted. Approved text-only pages use
`coverImage: null`, `gallery: []` and `videos: []`.
After originals arrive, add their media records, run `npm run images`, then
`npm run build`; no template changes are needed. Any declared missing file fails
the build rather than producing a broken public image or video. Metadata for a
text-only project omits image fields instead of borrowing an unrelated artwork.
Both language variants, project listing, category navigation, adjacent project
navigation, Open Graph, canonical/hreflang and sitemap follow the project data.
The v4 CV is curated separately in `data/artist.json`: an approved event's
`projectId` links it to a ready project without changing its supplied wording.
Homepage selection and its six-work order stay
independent of project listing order (`displayOrder`).

## Validation

Run `npm test`, `npm run test:browser` and `npm run test:projects` (Chromium and
FFmpeg required for the isolated video playback check). Use
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` if appropriate locally.
The projects check builds an isolated site with clearly labeled technical media;
it never puts fixture entries in the artist's data or public root.
Generated `project-layout-fixture-*` screenshots are layout tests only. The main
browser suite additionally verifies all five actual project pages and curated CV
links, and captures desktop/mobile screenshots in both languages.
Run `npm run test:featured` for every supplied image and the actual SHOUT MP4,
including playback, seeking, file links and both locales.
