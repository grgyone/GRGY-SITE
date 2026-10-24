import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const read = file => readFile(new URL('../' + file, import.meta.url));
const { files } = JSON.parse(await read('data/composition-import.json'));
const { artworks } = JSON.parse(await read('data/artworks.json'));
test('Composition import preserves all originals, skips only exact duplicates and keeps approved metadata', async () => {
  assert.equal(files.length, 22);
  assert.equal(files.filter(f => f.status === 'added').length, 20);
  assert.equal(files.filter(f => f.status === 'duplicate').length, 2);
  assert.equal(artworks.find(w => w.id === '6').year, 2022);
  assert.equal(artworks.find(w => w.id === '1').title, 'First French Kiss');
  for (const f of files) {
    const bytes = await read('images/artworks/originals/composition-import/' + f.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256);
    if (f.status !== 'added') continue;
    const work = artworks.find(w => w.id === f.workId);
    assert.equal(work.title, 'Composition');
    assert.equal(work.year, Number(f.file.match(/(?:19|20)\d{2}/)[0]));
    assert.equal(work.selected, false);
    for (const prefix of ['', 'ru/']) {
      const html = String(await read(`${prefix}works/composition/${work.slug}/index.html`));
      assert.match(html, /<h1>Composition<\/h1>/);
      assert.ok(!html.match(/<title>(.*?)<\/title>/)[1].includes(f.file));
      assert.ok(!html.includes('Description</dt>'));
    }
  }
});
