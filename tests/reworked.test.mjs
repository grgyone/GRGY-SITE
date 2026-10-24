import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { artworkYear } from '../scripts/artwork-year.mjs';
const read = file => readFile(new URL('../' + file, import.meta.url));
const { files } = JSON.parse(await read('data/reworked-import.json'));
const { artworks } = JSON.parse(await read('data/artworks.json'));
test('Reworked import retains 18 originals, maps the exact duplicate and omits unconfirmed years', async () => {
  assert.equal(files.length, 18);
  assert.equal(files.filter(f => f.status === 'added').length, 17);
  assert.equal(files.filter(f => f.status === 'duplicate').length, 1);
  for (const f of files) {
    assert.equal(createHash('sha256').update(await read('images/artworks/originals/reworked-import/' + f.file)).digest('hex'), f.sha256);
    if (f.status !== 'added') continue;
    assert.equal(f.year, artworkYear(f.file));
    const work = artworks.find(w => w.id === f.workId);
    assert.equal(work.title, 'Reworked'); assert.equal(work.selected, false);
    for (const prefix of ['', 'ru/']) {
      const html = String(await read(`${prefix}works/reworked/${work.slug}/index.html`));
      assert.match(html, /<h1>Reworked<\/h1>/);
      assert.doesNotMatch(html, /\(null\)|<dd>null/);
      if (work.year === null) assert.doesNotMatch(html, /dateCreated|<dt>Year|<dt>Год/);
      assert.ok(!html.match(/<title>(.*?)<\/title>/)[1].includes(f.file));
    }
  }
});
test('date parsing does not read 2082 from a DDMMYYYY date or invent a century', () => {
  assert.equal(artworkYear('22082025 3.png'), 2025);
  assert.equal(artworkYear('05022026 2 v2.png'), 2026);
  assert.equal(artworkYear('2026-10-17 Untitled CD Cover 2.png'), 2026);
  assert.equal(artworkYear('070525.PNG'), null);
  assert.equal(artworkYear('150425.png'), null);
  assert.equal(artworkYear('2022 (1).PNG'), 2022);
});
