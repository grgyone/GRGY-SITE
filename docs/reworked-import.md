# Reworked import

Unpublished branch feat/reworked-gallery. Archive 28082025.zip contains 18 images, all visually inspected. 17 new works added; 2024 (1).PNG is a byte/pixel-identical duplicate of existing artwork id 2 (Reworked, 2024) and retains that page. All 18 source files are preserved with original names/bytes under images/artworks/originals/reworked-import/; hashes and mapping are in data/reworked-import.json.

New titles are Reworked, never filenames. Natural filename sort, existing works first. Four-digit years and complete DDMMYYYY dates are interpreted without using archive timestamps; scripts/artwork-year.mjs checks dates so 22082025 is 2025, not an accidental 2082 match. 070525.PNG and 150425.png have only two-digit years: both included without a year pending artist confirmation, with year omitted from visible facts, metadata and schema. No work was skipped for missing dates. Existing homepage six works, their metadata/order, Composition gallery, Bio/CV/Statement and visual styles remain unchanged.

WebP quality 90 at 480/960/1920 widths, without enlargement/cropping, transparency preserved. Original new images: 21.38 MiB; full derivatives: 2.77 MiB, reduction 87.0%. PSNR against equal-resolution original pixels: minimum 35.9 dB. Source contact sheets and an optimized detail were visually checked. High-resolution originals load only through explicit original-image links.

| Filename | Year | Dimensions | Original KiB | 480 KiB | 960 KiB | Full KiB |
|---|---:|---|---:|---:|---:|---:|
| 2022 (1).PNG | 2022 | 568 × 793 | 283.2 | 38.4 | 49.2 | 49.2 |
| 2022 (2).png | 2022 | 1080 × 1266 | 1413.0 | 34.1 | 105.5 | 125.5 |
| 2022 (3).png | 2022 | 640 × 485 | 679.9 | 56.3 | 99.2 | 99.2 |
| 2023 (1).PNG | 2023 | 1280 × 1627 | 1516.6 | 36.5 | 103.7 | 139.1 |
| 2023 (2).png | 2023 | 563 × 553 | 164.8 | 16.9 | 21.5 | 21.5 |
| 2023 (3).PNG | 2023 | 828 × 936 | 271.9 | 82.9 | 206.0 | 206.0 |
| 2024 (2).PNG | 2024 | 1280 × 1593 | 1989.6 | 49.6 | 128.6 | 182.9 |
| 2024 (3).png | 2024 | 600 × 600 | 581.0 | 39.4 | 78.3 | 78.3 |
| 2025 (1).png | 2025 | 640 × 937 | 541.2 | 43.1 | 66.6 | 66.6 |
| 2025 (2).png | 2025 | 742 × 778 | 305.7 | 26.1 | 62.4 | 62.4 |
| 2026-10-17 Untitled CD Cover 2.png | 2026 | 1386 × 1135 | 2211.2 | 41.3 | 140.8 | 233.5 |
| 070525.PNG | unconfirmed | 1024 × 1024 | 260.4 | 19.9 | 106.2 | 130.3 |
| 150425.png | unconfirmed | 1440 × 1800 | 2289.0 | 48.7 | 254.2 | 513.1 |
| 05022026 2 v2.png | 2026 | 1024 × 1536 | 2485.3 | 87.5 | 299.1 | 360.6 |
| 05022026 3.png | 2026 | 1024 × 1536 | 1854.9 | 17.6 | 109.2 | 135.8 |
| 22082025 3.png | 2025 | 1024 × 1536 | 2484.6 | 56.7 | 185.9 | 192.0 |
| 28082025.png | 2025 | 1024 × 1536 | 2558.5 | 43.3 | 203.5 | 240.0 |

Validation: 26 automated tests, build with 116 public EN/RU pages, SHA-256 source preservation, no duplicate page, no null-year output, local link checks. node tests/reworked-browser.cjs verifies all 19 category cards and 17 new detail images at desktop/mobile widths in both languages, full aspect ratio and locale switching. Screenshots: test-results/reworked-{en,ru}-{1440,390}.png.

Changes: data/artworks.json, import manifest, source/optimized assets; scripts/build.mjs (omit unknown years), scripts/images.cjs (quality), new date parser, tests, generated Reworked/Works listing/detail pages and sitemap. No deployment was performed.
