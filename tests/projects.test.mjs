import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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

test('Projects index can show consistent text rows while preserving artwork covers', () => {
  for (const lang of ['en', 'ru']) {
    const html = projectCards([fixture], lang, { textOnly: true });
    assert.match(html, /project-card-text/);
    assert.match(html, /project-card-meta/);
    assert.match(html, /project-card-description/);
    assert.doesNotMatch(html, /<img/);
    assert.match(projectCards([fixture], lang), /<img/);
    assert.match(projectContent(fixture, [fixture], lang), /class="project-image"/);
  }
});

test('ChikoRoko uses the supplied archive media with localized descriptions and links', async () => {
  const ready = await readyProjects(drafts.slice(0, 1), fileURLToPath(new URL('../', import.meta.url)));
  assert.equal(ready.length, 1);
  assert.match(projectCards(ready, 'en'), /ChikoRoko/);
  assert.match(projectCv(ready, 'ru'), /\/ru\/works\/projects\/chikoroko-grgy-kloud\//);
  for (const project of ready) {
    const html = projectContent(project, ready, 'en');
    assert.match(html, /finished-toy.webp/);
    assert.doesNotMatch(html, /roko%20grgy%20model-01.png|CRGRGY%20promo.png|Original design sheet|Исходный лист разработки/);
    assert.equal((html.match(/class="project-image"/g) || []).length, 2);
    assert.match(html, /sketchfab.com\/models\/21f1e0e76a29407983f020b07724e22b\/embed/);
    assert.match(html, /instagram.com\/p\/CkRSBQbj5Iq/);
    assert.doesNotMatch(html, /chikoroko.b-cdn.net|<video/);
    assert.match(html, /r.toys\/en\/toy\/kloud/);
    assert.match(html, /class="project-description"/);
  }
  assert.deepEqual(await readyProjects(drafts.map(project => ({ ...project, status: 'draft' })), '/tmp'), []);
  assert.deepEqual(ready.map(project => project.year), [2022]);
  assert.ok(drafts[2].collaborators.some(person => person.name === 'Gleb Kostin (.solutions)'));
});

test('Sketchfab embeds validate model IDs and escape their labels', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await assert.rejects(readyProjects([{...drafts[0], sketchfab:{id:'../invalid',title:'Model',author:'Artist'}}], root), /invalid Sketchfab model id/);
  const html=projectContent({...drafts[0],sketchfab:{id:'21f1e0e76a29407983f020b07724e22b',title:'<Model>',author:'<Artist>'}},[drafts[0]],'en');
  assert.match(html,/title="&lt;Model&gt;"/);
  assert.match(html,/&lt;Artist&gt;/);
  assert.match(html,/loading="lazy" allow="fullscreen; xr-spatial-tracking" allowfullscreen/);
  assert.doesNotMatch(projectContent(fixture,[fixture],'en'), /<iframe/);
});

test('ready projects require confirmed bilingual content and verify any declared media', async () => {
  const draft = { ...drafts[0], coverImage: null, gallery: [], supportingGallery: [] };
  await assert.rejects(readyProjects([{ ...draft, status: 'ready', descriptionEn: '' }], '/tmp'), /descriptionEn/);
  await assert.rejects(readyProjects([{ ...draft, status: 'ready', year: undefined }], '/tmp'), /year must be confirmed/);
  const [undated] = await readyProjects([{ ...draft, year: null }], '/tmp');
  assert.doesNotMatch(projectContent(undated, [undated], 'en'), /<dt>Year|<dd>null/);
  assert.doesNotMatch(projectCards([undated], 'en'), /null/);
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
