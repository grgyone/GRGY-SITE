import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = relative => readFile(new URL('../' + relative, import.meta.url), 'utf8');
const data = JSON.parse(await read('data/artist.json'));

test('v4 retains four approved paragraphs for each text in both languages', () => {
  for (const lang of ['en', 'ru']) for (const page of ['statement', 'bio']) {
    assert.equal(data[lang][page].length, 4);
    assert.ok(data[lang][page].every(paragraph => paragraph.trim().length > 50));
  }
  assert.match(data.en.statement[1], /GRGY is a parasite — a monster/);
  assert.match(data.ru.statement[1], /GRGY — паразит, монстр/);
  assert.match(data.en.bio[0], /contemporary artist/);
  assert.match(data.ru.bio[0], /современный художник/);
});

test('CV has four complete sections and all fifteen entries in reverse chronology', () => {
  assert.deepEqual(data.cvSections.map(section => section.id), ['exhibitions', 'collaborations', 'publications', 'education']);
  assert.deepEqual(data.cvSections.map(section => section.entries.length), [4, 9, 1, 1]);
  for (const section of data.cvSections) {
    const years = section.entries.map(entry => Number.parseInt(entry.year, 10));
    assert.deepEqual(years, [...years].sort((a, b) => b - a));
    for (const entry of section.entries) {
      assert.ok(entry.text.en.length > 10);
      assert.ok(entry.text.ru.length > 10);
      if (entry.linkText) for (const lang of ['en', 'ru']) assert.ok(entry.text[lang].startsWith(entry.linkText[lang]));
    }
  }
  const collaborations = data.cvSections[1].entries;
  assert.ok(collaborations.some(entry => entry.text.en.includes('HODL by Pixelord')));
  assert.ok(collaborations.some(entry => entry.text.en.includes('NFTBastards, dedicated to Rarible')));
});

test('blocked, retired and context-only sources are not published as verified links', async () => {
  for (const file of ['cv/index.html', 'ru/cv/index.html']) {
    const html = await read(file);
    for (const source of data.sources.filter(source => source.status !== 'verified')) assert.ok(!html.includes(`href="${source.url}"`));
    assert.match(html, /href="[^\"]*works\/projects\/chikoroko-grgy-kloud\/"/);
    assert.match(html, /href="[^\"]*works\/projects\/studio-21-music-lovers-worldwide\/"/);
    assert.doesNotMatch(html, /href="[^"]*grgy-solukta-gleb-kostin-solutions/);
    assert.equal((html.match(/class="cv-row"/g) || []).length, 15);
    assert.equal((html.match(/class="cv-section/g) || []).length, 4);
  }
});

test('Statement and Bio contain four prose paragraphs and no decorative media', async () => {
  for (const prefix of ['', 'ru/']) for (const route of ['artist-statement', 'bio']) {
    const html = await read(`${prefix}${route}/index.html`);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    assert.equal((main.match(/<p>/g) || []).length, 4);
    assert.doesNotMatch(main, /<img|<video|<h2|<section/);
    assert.match(main, /<em>Composition<\/em>/);
    assert.match(main, /<em>Reworked<\/em>/);
    assert.doesNotMatch(main, /\*Composition\*|\*Reworked\*/);
  }
});
