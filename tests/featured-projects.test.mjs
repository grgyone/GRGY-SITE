import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { projectImages, imageBase } from '../scripts/projects.mjs';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const artworks = JSON.parse(await read('data/artworks.json')).artworks;
const details = JSON.parse(await read('data/artwork-details.json'));
const projects = JSON.parse(await read('data/projects.json'));

test('Big Face moves to Works with real documentary images and a legacy redirect', async () => {
  const work = artworks.find(work => work.id === '3');
  assert.equal(work.title, 'Big Face');
  assert.equal(work.slug, 'big-face');
  assert.equal(work.year, 2023);
  assert.ok(details['3'].displayTitle.en && details['3'].displayTitle.ru);
  for (const prefix of ['', 'ru/']) {
    const html = await read(prefix + 'works/big-face/index.html');
    assert.match(html, /dateCreated":"2023"/);
    assert.match(html, /1911–1912/);
    assert.match(html, /class="artwork-history"/);
    assert.match(html, /(?:The project survives through photographs|Проект сохранился в фотографиях)/);
    assert.doesNotMatch(html, /<video|<iframe|model-viewer/);
    assert.match(html, /data-documentation-src/);
    assert.match(html, /href="\/images\/projects\/originals\/big-face\/2\.jpg"/);
    assert.ok(html.includes(`https://grgyone.com/${prefix}works/big-face/`));
    assert.equal(details['3'].media.gallery.length, 4);
    const redirect = await read(prefix + 'works/street-art/big-face/index.html');
    assert.ok(redirect.includes(`content="0; url=/${prefix}works/big-face/"`));
  }
});

test('both supplied works have direct routes and only confirmed creation years', async () => {
  for (const slug of ['cutestar-merch-as-art', 'shout-out-kloud']) {
    const project = projects.find(project => project.slug === slug);
    assert.equal(project.status, 'ready');
    assert.equal(project.year, slug === 'cutestar-merch-as-art' ? 2023 : null);
    assert.ok(project.coverImage);
    for (const prefix of ['', 'ru/']) {
      const html = await read(`${prefix}works/${slug}/index.html`);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.match(html, /property="og:image"/);
      assert.doesNotMatch(html, /<dd>null|\(null\)/);
      if (project.year === null) assert.doesNotMatch(html, /dateCreated|<dt>Year|<dt>Год/);
      else assert.match(html, /dateCreated":"2023"/);
      for (const image of projectImages(project)) assert.ok(html.includes(image.src.split('/').map(encodeURIComponent).join('/')));
      assert.match(html, /loading="lazy"/);
    }
  }
  assert.equal(projects.find(project => project.id === 'shout-out-kloud').title, 'SHOUT OUT KLOUD');
  assert.equal(projects.find(project => project.id === 'cutestar-merch-as-art').exhibition.yearVerified, true);
});

test('Cutestar preserves all eight images, invitation attribution and the existing CV wording', async () => {
  const project = projects.find(project => project.id === 'cutestar-merch-as-art');
  assert.equal(project.coverImage.src.split('/').pop(), '12tig.png');
  assert.equal(projectImages(project).length, 8);
  assert.match(project.descriptionEn, /invitation of Denis Fabrika and the Dvor 759/);
  assert.doesNotMatch(project.descriptionEn, /curator/i);
  assert.equal(project.additionalInfo[0].value.en, '15–30 April');
  const cv = JSON.parse(await read('data/artist.json')).cvSections.flatMap(section => section.entries);
  const entry = cv.find(entry => entry.projectId === project.id);
  assert.equal(entry.year, '2023');
  for (const prefix of ['', 'ru/']) assert.ok((await read(`${prefix}cv/index.html`)).includes(`href="/${prefix}works/${project.slug}/"`));
});

test('SHOUT OUT KLOUD preserves numbered order, full collection and separates concept materials', () => {
  const project = projects.find(project => project.id === 'shout-out-kloud');
  assert.equal(project.layout, 'collection');
  assert.equal(projectImages(project).length, 58);
  assert.deepEqual(project.gallery.map(image => image.src.split('/').pop()), Array.from({ length: 51 }, (_, i) => `50-${String(i + 1).padStart(2, '0')}.png`));
  assert.ok(project.openingImage.src.endsWith('/50-52.png'));
  assert.ok(project.closingImage.src.endsWith('/50-53.png'));
  assert.equal(project.hideCaptions, true);
  assert.equal(project.videoPosition, 'opening');
  assert.equal(project.supportingGallery.length, 4);
  assert.match(project.supportingGallery.find(image => image.src.endsWith('tt shirt.png')).caption.en, /concept/i);
  assert.equal(project.videos.length, 1);
  assert.ok(project.videos[0].src.endsWith('/SHOUTGRGY_1.mp4'));
  assert.equal(project.externalLinks[0].url, 'https://t.me/addstickers/KloudByGRGY');
  assert.doesNotMatch(project.descriptionEn, /53 NFTs|sold out|physical release/i);
});

test('every supplied original retains its filename and SHA-256; all derivatives retain proportions', async () => {
  const manifest = JSON.parse(await read('data/featured-media-manifest.json'));
  let count = 0;
  for (const archive of manifest.archives.filter(archive => archive.status === 'inspected')) {
    for (const asset of [...archive.images, ...(archive.videos || [])]) {
      const bytes = await readFile(new URL('..' + asset.src, import.meta.url));
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.file);
      assert.equal(asset.src.split('/').pop(), asset.file);
      count++;
    }
  }
  assert.equal(count, 72);
  for (const project of [...projects, details['3'].media]) for (const image of projectImages(project)) {
    for (const width of [480, 960, 1920]) {
      const info = await sharp(new URL(`..${imageBase(project, image)}-${width}.webp`, import.meta.url).pathname).metadata();
      assert.equal(info.width, Math.min(width, image.width));
      assert.ok(Math.abs(info.height - info.width * image.height / image.width) <= 1);
    }
  }
  assert.ok(manifest.archives.some(archive => archive.name === 'BF w bg.zip' && archive.status === 'inspected'));
  assert.ok(manifest.uploads.some(upload => upload.name === 'IMG_1649.MP4' && upload.status === 'download-blocked'));
});

test('Works hierarchy and redirects exclude Solukta and keep retired content recoverable', async () => {
  assert.equal(projects.find(project => project.id === 'solukta-solutions').status, 'draft');
  for (const prefix of ['', 'ru/']) {
    const listing = (await read(prefix + 'works/projects/index.html')).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    assert.doesNotMatch(listing, /Cutestar|SHOUT|Solukta|Big Face/);
    assert.match(listing, /ChikoRoko/);
    assert.match(listing, /STUDIO 21/);
    for (const slug of ['cutestar-merch-as-art', 'shout-out-kloud', 'grgy-solukta-gleb-kostin-solutions']) {
      const redirect = await read(`${prefix}works/projects/${slug}/index.html`);
      assert.match(redirect, /name="robots" content="noindex, follow"/);
      assert.match(redirect, /http-equiv="refresh"/);
      assert.ok(!(await read('sitemap.xml')).includes(`<loc>https://grgyone.com/${prefix}works/projects/${slug}/</loc>`));
    }
    const shout = (await read(prefix + 'works/shout-out-kloud/index.html')).match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    assert.doesNotMatch(shout, /<figcaption/);
    assert.ok(shout.indexOf('/50-52.png') < shout.indexOf('<video'));
    assert.ok(shout.indexOf('<video') < shout.indexOf('/50-01.png'));
    const originals = [...shout.matchAll(/href="([^"#]+\.(?:png|jpg))"/g)].map(match => match[1]);
    assert.ok(originals.at(-1).endsWith('/50-53.png'));
  }
});
