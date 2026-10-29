# ChikoRoko × GRGY — Kloud

The project cover now shows the released black Kloud toy, rather than the white
promotional silhouette. The design sheet and old browser screenshot are removed
from the public gallery; their original files remain recoverable in the archive.
The six selected homepage artworks retain their approved order and previews.

## Media and stable indices

- Original index 0: CRGRGY promo.png (1024 × 1024), retained but no longer public.
- Original index 1: roko grgy model-01.png (2964 × 2964), retained but no longer public.
- Original index 2: archived R.Toys profile screenshot, retained but no longer public.
- Index 3: finished-toy.webp (1500 × 1500, alpha preserved), lossless WebP converted
  from the AVIF delivered by the official R.Toys toy page to the browser.
  Downloaded bytes are preserved as originals/chikoroko-kloud/Kloud-R.Toys.avif.
- Index 4: 624205448_18170996944385768_2626958301119754650_n.jpg,
  the official announcement graphic from the artist-supplied Instagram post.
  Filename and downloaded bytes are preserved; dimensions are measured with Sharp.

The official toy page is https://r.toys/en/toy/kloud. The browser loaded and
exported its image asset successfully, although earlier direct HTTP requests
returned 403. The observed image URL was:
https://r.toys/_next/image?url=https%3A%2F%2Fchikoroko.b-cdn.net%2Ftoys%2Fmain%2FKloud-GRGY-29.10.2022.original%403x.webp&w=1920&q=75

The post https://www.instagram.com/p/CkRSBQbj5Iq/ was supplied by the artist,
opened in the browser and read directly. It is the official chiko.roko release
announcement dated 28 October 2022 and credits GRGY. Its graphic and source link
now appear in EN/RU. No edition or sales count was added.

## 3D and AR

Sketchfab provides an official Embed control for GRGY - Cloud by
chiko_roko_vault, model id 21f1e0e76a29407983f020b07724e22b. Its 3D viewer was
visually checked in the browser. The project embeds that published viewer with
lazy loading and no automatic start, retains attribution and offers its original
link. No downloadable GLB/GLTF file was offered or extracted.

The optional sketchfab data field uses an id, title and author. Validation requires
a 32-character lowercase hexadecimal id and nonempty labels; the renderer constructs
the Sketchfab URL and escapes labels. Pages without this field have no iframe.

The R.Toys AR badge was checked directly. Its dialog says AR viewing requires
owning the toy. A separate Instagram AR-filter link has not been verified; no
working public filter or downloadable AR asset is claimed.

## Validation

Build source data with npm run build. Run npm test, test:browser, test:featured
and test:projects for source, layout and schema checks. Inspect the actual EN/RU
page and listing at desktop/mobile widths, plus the live Sketchfab viewer.
The isolated project fixture now includes the existing Big Face video required
by the site shell; technical fixture records remain isolated from public data.
