# Composition import

Unpublished branch: feat/composition-gallery. Both pasted briefs are byte-identical.

22 archive images inspected; 20 added, 2 exact byte/pixel duplicates mapped to existing works. All 22 originals retain their filenames and SHA-256 hashes under images/artworks/originals/composition-import/.

Duplicates: composition 2025 0.PNG → First French Kiss (id 1); Composition 2023.png → Composition (id 6). The latter filename conflicts with the existing approved 2022 date; the existing title/year/URL are preserved. No duplicate page was created.

New works by filename year: 2022: 1; 2023: 4; 2024: 6; 2025: 2; 2026: 7. Natural filename sorting across all archives, existing works first. All new titles are Composition. Names below appear only in this private development report, not public headings/captions/meta titles.

WebP quality 90, widths 480/960/1920, no enlargement, original proportions and transparency preserved. Original new images total 55.48 MiB; full 1920px derivatives 2.21 MiB (reduction 96.0%). Minimum PSNR versus equal-resolution originals: 39.2 dB; contact sheets and a full-size derivative were visually inspected. Source images have not been edited.

| Original filename | Year | Original KiB | 480px KiB | 960px KiB | 1920px KiB |
|---|---:|---:|---:|---:|---:|
| Composition 2022.png | 2022 | 2339.8 | 13.1 | 33.8 | 89.1 |
| Composition 2023 08.PNG | 2023 | 1673.0 | 9.5 | 23.9 | 61.8 |
| Composition 2023 14.PNG | 2023 | 4594.8 | 11.9 | 32.6 | 100.0 |
| Composition 2023 19.png | 2023 | 5524.5 | 25.3 | 69.6 | 214.7 |
| Composition 2023 22.png | 2023 | 2005.5 | 6.9 | 17.2 | 47.4 |
| composition 2024 4 0.png | 2024 | 4413.8 | 14.7 | 38.7 | 106.8 |
| composition 2024 7 0.png | 2024 | 1917.8 | 11.5 | 31.0 | 91.8 |
| composition 2024 8 0.png | 2024 | 2001.7 | 12.2 | 30.9 | 78.3 |
| composition 2024 09 10 2 11.png | 2024 | 666.6 | 13.2 | 37.6 | 107.1 |
| composition 2024 09 10 45.png | 2024 | 2360.5 | 11.5 | 31.9 | 99.0 |
| composition 2024 11.png | 2024 | 500.1 | 10.3 | 28.4 | 84.0 |
| composition 2025 0 (2).png | 2025 | 3632.8 | 11.4 | 31.4 | 95.3 |
| composition 2025 1 1x1.png | 2025 | 763.0 | 17.5 | 47.5 | 134.0 |
| composition 2026 (2).png | 2026 | 1810.6 | 5.9 | 17.2 | 56.3 |
| composition 2026 (3).png | 2026 | 3973.5 | 24.8 | 72.9 | 231.3 |
| composition 2026 1 (2).png | 2026 | 2540.0 | 15.1 | 43.7 | 145.9 |
| composition 2026 1 (3).png | 2026 | 4097.7 | 8.9 | 25.8 | 85.2 |
| composition 2026 1 (4).png | 2026 | 3788.0 | 10.2 | 29.3 | 95.9 |
| composition 2026 1.png | 2026 | 4013.2 | 22.8 | 69.7 | 223.5 |
| Composition 2026.png | 2026 | 4197.6 | 11.9 | 35.7 | 117.9 |

Validation: build emits 82 EN/RU pages; 24 unit tests pass, including SHA-256 preservation, original metadata and no duplicate pages. Composition browser check covers 22 cards and all 20 new detail images at 1440/390px in EN/RU, decoding, aspect ratios, no horizontal overflow and locale switching. Existing local links are checked site-wide. Screenshots: test-results/composition-{en,ru}-{1440,390}.png.

Git comparison against b169d02 confirms homepage (both languages), Bio, CV, Artist Statement, styles, logo/navigation script and CNAME unchanged. No deployment/push has been made. Content is centralized in data/artworks.json; data/composition-import.json retains provenance and duplicate mapping. Rebuild with npm run images and npm run build. Browser check: node tests/composition-browser.cjs.
