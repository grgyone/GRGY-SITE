import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readyProjects, projectCards, projectContent, projectCv } from '../scripts/projects.mjs';

const drafts = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url), 'utf8'));
const image = { src: '/images/projects/originals/test/Landscape image.PNG', width: 1600, height: 900, altEn: 'Landscape test image', altRu: 'Горизонтальное тестовое изображение' };
const fixture = {
  id: 'layout-test', slug: 'layout-test', title: 'Layout test', category: 'projects', status: 'ready', year: 2026,
  displayOrder: 1, projectType: { en: 'Layout test', ru: 'Проверка шаблона' }, medium: null,
  collaborators: [{ name: 'Test contributor', url: 'https://example.com/contributor' }],
  descriptionEn: 'Technical test paragraph.\n\nSecond paragraph.', descriptionRu: 'Техническая проверка.\n\nВторой абзац.',
  coverImage: image, gallery: [image, { ...image, src: '/images/projects/originals/test/Portrait.png', width: 900, height: 1600 }],
  videos: [{ src: '/videos/projects/test/sample.webm', width: 320, height: 180, caption: { en: 'Test clip', ru: 'Тестовый ролик' } }], externalLinks: []
};

test('the three approved projects are available as text pages without invented media', async () => {
  const ready = await readyProjects(drafts, '/tmp');
  assert.equal(ready.length, 3);
  assert.match(projectCards(ready, 'en'), /ChikoRoko/);
  assert.match(projectCv(ready, 'ru'), /\/ru\/works\/projects\/chikoroko-grgy-kloud\//);
  for (const project of ready) {
    const html = projectContent(project, ready, 'en');
    assert.doesNotMatch(html, /<img|<video|class="project-gallery"/);
    assert.match(html, /class="project-description"/);
  }
  assert.deepEqual(await readyProjects(drafts.map(project => ({ ...project, status: 'draft' })), '/tmp'), []);
  assert.deepEqual(ready.map(project => project.year), [2022, 2022, 2025]);
  assert.ok(drafts[2].collaborators.some(person => person.name === 'Gleb Kostin (.solutions)'));
});

test('ready projects require confirmed bilingual content and verify any declared media', async () => {
  const [draft] = drafts;
  await assert.rejects(readyProjects([{ ...draft, status: 'ready', descriptionEn: '' }], '/tmp'), /descriptionEn/);
  await assert.rejects(readyProjects([{ ...draft, status: 'ready', year: null }], '/tmp'), /confirmed year/);
  await assert.rejects(readyProjects([{ ...draft, status: 'ready', coverImage: image }], '/tmp'), /ENOENT/);
});

test('duplicate identities and invalid ordering fail before generating public pages', async () => {
  await assert.rejects(readyProjects([drafts[0], drafts[0]], '/tmp'), /duplicate project id/);
  await assert.rejects(readyProjects([{ ...drafts[0], slug: '../invalid' }], '/tmp'), /project slug/);
  await assert.rejects(readyProjects([{ ...drafts[0], displayOrder: undefined }], '/tmp'), /displayOrder/);
});

test('project renderer preserves full proportions, localized descriptions and optional unknown fields', () => {
  for (const lang of ['en', 'ru']) {
    const html = projectContent(fixture, [fixture], lang);
    assert.match(html, /class="project-image"/);
    assert.match(html, /width="900" height="1600"/);
    assert.ok(html.includes(lang === 'ru' ? 'Второй абзац.' : 'Second paragraph.'));
    assert.doesNotMatch(html, /object-fit|<dt>Location|<dt>Место|<dt>Medium|<dt>Материал/);
    assert.equal((html.match(/class="project-image"/g) || []).length, 2, 'Repeated cover is not rendered twice');
    assert.match(html, /Landscape%20image\.PNG/);
    assert.match(html, /<video[^>]+controls playsinline preload="metadata"/);
    assert.doesNotMatch(html, /autoplay|<video[^>]+loop/);
    assert.match(html, /type="video\/webm"/);
  }
});

test('CV and adjacent project links preserve locale and do not invent participant links', () => {
  const other = { ...fixture, id: 'another-test', slug: 'another-test', title: 'Another layout test' };
  assert.match(projectContent(fixture, [fixture, other], 'ru'), /href="\/ru\/works\/projects\/another-test\/" rel="next"/);
  assert.match(projectContent(other, [fixture, other], 'en'), /href="\/works\/projects\/layout-test\/" rel="prev"/);
  assert.match(projectCv([fixture], 'ru'), /href="\/ru\/works\/projects\/layout-test\/"/);
  const html = projectContent({ ...fixture, collaborators: [{ name: 'Unknown URL' }] }, [fixture], 'en');
  assert.match(html, /<dd>Unknown URL<\/dd>/);
});

test('artist descriptions and captions are escaped as text', () => {
  const html = projectContent({ ...fixture, descriptionEn: '<script>not markup</script>', gallery: [], videos: [], title: 'A & B' }, [fixture], 'en');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /A &amp; B/);
});
