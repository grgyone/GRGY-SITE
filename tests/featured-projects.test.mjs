import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const artworks = JSON.parse(await read('data/artworks.json')).artworks;
const details = JSON.parse(await read('data/artwork-details.json'));
const projects = JSON.parse(await read('data/projects.json'));

test('Big Face retains its stable URL, original card title and confirmed creation year', async () => {
  const work = artworks.find(work => work.id === '3');
  assert.equal(work.title, 'Big Face');
  assert.equal(work.slug, 'big-face');
  assert.equal(work.year, 2023);
  assert.ok(details['3'].displayTitle.en && details['3'].displayTitle.ru);
  for (const prefix of ['', 'ru/']) {
    const html = await read(prefix + 'works/street-art/big-face/index.html');
    assert.match(html, /dateCreated":"2023"/);
    assert.match(html, /1911–1912/);
    assert.match(html, /class="artwork-history"/);
    assert.match(html, /(?:According to the artist’s recollection|По воспоминаниям автора)/);
    assert.doesNotMatch(html, /<video|<iframe|model-viewer|3D Documentation/);
    assert.match(html, /href="\/images\/artworks\/originals\/3\.jpg"/);
    assert.ok(html.includes(`https://grgyone.com/${prefix}works/street-art/big-face/`));
  }
});

test('missing featured-project materials remain drafts, without fabricated years or public pages', async () => {
  for (const slug of ['cutestar-merch-as-art', 'shout-out-kloud']) {
    const project = projects.find(project => project.slug === slug);
    assert.equal(project.status, 'draft');
    assert.equal(project.year, null);
    assert.equal(project.coverImage, null);
    assert.deepEqual(project.gallery, []);
    assert.deepEqual(project.videos, []);
    for (const prefix of ['', 'ru/']) await assert.rejects(stat(new URL(`../${prefix}works/projects/${slug}/index.html`, import.meta.url)), /ENOENT/);
  }
  assert.equal(projects.find(project => project.id === 'shout-out-kloud').title, 'SHOUT OUT KLOUD');
  assert.equal(projects.find(project => project.id === 'cutestar-merch-as-art').exhibition.yearVerified, false);
});
