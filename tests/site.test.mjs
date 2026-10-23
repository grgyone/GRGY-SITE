import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { projectUrl } from '../scripts/projects.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFile(path.join(root, file), 'utf8');
const data = JSON.parse(await read('data/artworks.json'));
const projects = JSON.parse(await read('data/projects.json')).filter(project => project.status === 'ready');
const workUrl = work => `/works/${work.category}/${work.slug}/`;
const publicPages = [];
async function discover(directory = '') {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['_archive', 'node_modules', 'test-results', 'tests', 'scripts'].includes(entry.name)) continue;
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) await discover(relative);
    else if (entry.name.endsWith('.html')) publicPages.push(relative);
  }
}
await discover();

test('all six approved works retain their order, titles and source filenames', async () => {
  assert.deepEqual(data.artworks.map(work => work.file), ['1.PNG', '2.PNG', '3.jpg', '4.png', '5.jpg', '6.png']);
  assert.deepEqual(data.artworks.map(work => work.title), ['First French Kiss', 'Reworked', 'Big Face', 'Reworked', 'Kloud', 'Composition']);
  assert.equal(new Set(data.artworks.map(workUrl)).size, 6);
  for (const work of data.artworks) {
    assert.ok((await stat(path.join(root, 'images/artworks/originals', work.file))).size > 0);
    for (const size of [480, 960, 1920]) assert.ok((await stat(path.join(root, `images/artworks/optimized/${work.id}-${size}.webp`))).size > 0);
  }
});

test('every generated local link and media reference resolves, and commerce is absent', async () => {
  for (const file of publicPages) {
    const html = await read(file);
    assert.doesNotMatch(html, /href="[^"\n]*(?:store\.html|cart_items\.html|product\.html|checkout|_archive)/i, file);
    assert.doesNotMatch(html, /<script[^>]+(?:supabase|cart-|store\.js)/i, file);
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const url = match[1];
      if (/^(?:https?:|mailto:|data:)/.test(url)) continue;
      const pathname = url.split(/[?#]/)[0];
      const filePath = path.resolve(root, pathname.startsWith('/') ? '.' + pathname : path.join(path.dirname(file), pathname));
      assert.ok(filePath === path.resolve(root) || filePath.startsWith(root), `${file}: invalid path ${url}`);
      const result = await stat(filePath);
      if (result.isDirectory()) assert.ok((await stat(path.join(filePath, 'index.html'))).isFile());
    }
  }
});

test('artwork pages in both languages have metadata, full images, series links and no descriptions', async () => {
  for (const prefix of ['', 'ru/']) {
    const homepage = await read(prefix + 'index.html');
    assert.equal((homepage.match(/class="artwork-card"/g) || []).length, 6);
    assert.deepEqual([...homepage.matchAll(/class="artwork-title">([^<]+)/g)].map(match => match[1]), data.artworks.map(work => work.title));
    for (const work of data.artworks) {
      const html = await read(prefix + workUrl(work).slice(1) + 'index.html');
      assert.match(html, new RegExp(`<h1>${work.title}</h1>`));
      assert.match(html, /class="artwork-full"/);
      assert.match(html, /class="back-link"/);
      assert.match(html, /rel="(?:prev|next)"/);
      assert.match(html, /application\/ld\+json/);
      assert.doesNotMatch(html, /artwork-description|<dt>Description/);
      assert.match(html, /<meta name="description" content="[^"]+"/);
      assert.match(html, /property="og:image"/);
      assert.match(html, /hreflang="ru"/);
      assert.match(html, /hreflang="en"/);
      assert.ok(html.includes(`href="https://grgyone.com/${prefix}${workUrl(work).slice(1)}"`));
    }
  }
});

test('navigation order, category filtering and bilingual approved texts', async () => {
  const english = await read('index.html');
  assert.ok(english.indexOf('href="/artist-statement/"') < english.indexOf('class="works-heading"'));
  assert.ok(english.indexOf('href="/bio/"') < english.indexOf('class="works-heading"'));
  assert.ok(english.indexOf('href="/cv/"') < english.indexOf('class="works-heading"'));
  assert.match(english, /href="\/works\/composition\/">Works/);
  assert.doesNotMatch(english, />Objects</);
  assert.match(english, /href="\/works\/projects\/">Projects/);
  assert.ok(english.indexOf('href="/contact/"') < english.indexOf('class="works-heading"'));
  assert.doesNotMatch(english, /New Grgy Times|src="\/images\/logo\.png"/);
  assert.match(await read('ru/cv/index.html'), /TON AVATARS/);
  assert.match(await read('cv/index.html'), /Contemporary Artist/);
  assert.match(await read('artist-statement/index.html'), /GRGY is a parasite/);
  assert.match(await read('ru/artist-statement/index.html'), /GRGY — паразит/);
});

test('every project has EN/RU pages, CV links, metadata and sitemap entries without borrowed images', async () => {
  const sitemap = await read('sitemap.xml');
  for (const prefix of ['', '/ru']) {
    const cv = await read(prefix.slice(1) + (prefix ? '/' : '') + 'cv/index.html');
    for (const project of projects) {
      const url = prefix + projectUrl(project);
      const html = await read(url.slice(1) + 'index.html');
      assert.ok(cv.includes(`href="${url}"`));
      assert.ok(sitemap.includes(`<loc>https://grgyone.com${url}</loc>`));
      assert.match(html, /<link rel="canonical"/);
      assert.match(html, /hreflang="en"/);
      assert.match(html, /hreflang="ru"/);
      assert.ok(html.includes(project[prefix ? 'descriptionRu' : 'descriptionEn']));
      assert.match(html, /href="[^\"]+" rel="(?:prev|next)"/);
      if (!project.coverImage) {
        assert.doesNotMatch(html, /property="og:image"|class="project-image"/);
        assert.match(html, /name="twitter:card" content="summary"/);
      }
    }
  }
});

test('sitemap includes all twelve localized works and excludes commerce; domain preserved', async () => {
  const xml = await read('sitemap.xml');
  for (const work of data.artworks) {
    assert.ok(xml.includes(`<loc>https://grgyone.com${workUrl(work)}</loc>`));
    assert.ok(xml.includes(`<loc>https://grgyone.com/ru${workUrl(work)}</loc>`));
  }
  assert.doesNotMatch(xml, /store|cart|product|_archive/);
  assert.equal((await read('CNAME')).trim(), 'grgyone.com');
  assert.match(await read('_config.yml'), /- _archive/);
});

test('static build is repeatable and produces identical pages', async () => {
  const before = await Promise.all(publicPages.map(read));
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });
  const after = await Promise.all(publicPages.map(read));
  assert.deepEqual(after, before);
});
