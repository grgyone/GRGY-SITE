// Isolated renderer validation only. These are not GRGY project materials.
import { chromium } from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, copyFile, cp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { readyProjects, optimizeProjectImages } from '../scripts/projects.mjs';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const results = path.join(root, 'test-results');
await mkdir(results, { recursive: true });
const site = await mkdtemp(path.join(results, 'projects-layout-'));
const originals = path.join(site, 'images/projects/originals/layout-test');
await mkdir(originals, { recursive: true });
for (const [name, width, height, background] of [['Landscape test.PNG', 1200, 700, '#dedede'], ['Portrait test.png', 700, 1000, '#bbbbbb']]) {
  await sharp({ create: { width, height, channels: 3, background } }).png().toFile(path.join(originals, name));
}
const image = { src: '/images/projects/originals/layout-test/Landscape test.PNG', width: 1200, height: 700, altEn: 'Landscape test image — technical fixture', altRu: 'Горизонтальное тестовое изображение — проверка шаблона' };
const portrait = { src: '/images/projects/originals/layout-test/Portrait test.png', width: 700, height: 1000, altEn: 'Portrait test image — technical fixture', altRu: 'Вертикальное тестовое изображение — проверка шаблона', caption: { en: 'Technical fixture, not project material.', ru: 'Технический материал, не изображение проекта.' } };
const descriptionEn = 'This is an isolated technical layout check, not a project by GRGY. It checks readable text and image proportions. '.repeat(8);
const descriptionRu = 'Это изолированная техническая проверка шаблона, а не проект GRGY. Проверяются читаемость текста и пропорции изображений. '.repeat(8);
await mkdir(path.join(site, 'videos/projects/layout-test'), { recursive: true });
const videoFile = path.join(site, 'videos/projects/layout-test/clip.webm');
await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=gray:s=320x180:d=2', '-an', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', videoFile]);
const records = [1, 2].map((index) => ({
  id: `layout-test-${index}`, slug: `layout-test-${index}`, title: `Layout verification ${index} — technical fixture`, year: 2026,
  category: 'projects', status: 'ready', displayOrder: 3 - index, projectType: { en: 'Layout test', ru: 'Проверка шаблона' }, medium: null, location: null,
  collaborators: [{ name: 'Technical fixture' }], descriptionEn, descriptionRu, coverImage: image, gallery: [portrait],
  videos: [{ src: '/videos/projects/layout-test/clip.webm', width: 320, height: 180, caption: { en: 'Technical playback test.', ru: 'Техническая проверка воспроизведения.' } }], externalLinks: []
}));
const projects = await readyProjects(records, site, { checkOptimized: false });
assert.equal(projects[0].id, 'layout-test-2', 'Project ordering follows displayOrder');
const before = await readFile(path.join(site, image.src));
await optimizeProjectImages(projects, site);
assert.deepEqual(await readFile(path.join(site, image.src)), before, 'Image optimization preserves original bytes');
await assert.rejects(optimizeProjectImages([{ ...projects[0], coverImage: { ...image, width: 999 }, gallery: [] }], site), /dimensions do not match/);
const dataFile = path.join(site, 'fixture-projects.json');
await writeFile(dataFile, JSON.stringify(records));
await exec(process.execPath, ['scripts/build.mjs', '--output-dir', site, '--projects-file', dataFile, '--media-root', site], { cwd: root });
for (const file of ['portfolio.css', 'styles.css', 'site-nav.js', 'favicon.ico']) await copyFile(path.join(root, file), path.join(site, file));
await cp(path.join(root, 'images/artworks'), path.join(site, 'images/artworks'), { recursive: true });

const server = spawn(process.execPath, ['scripts/serve.mjs', '--root', site], { cwd: root, env: { ...process.env, PORT: '4176' }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Project fixture server timeout')), 10000);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Fixture server exited: ${code}`)));
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  });
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const origin = 'http://127.0.0.1:4176';
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const prefix of ['', '/ru']) {
      await page.goto(origin + prefix + '/cv/');
      assert.equal(await page.locator('.cv-projects a').count(), 2);
      await page.locator('.cv-projects a').first().click();
      await page.waitForURL(origin + prefix + '/works/projects/layout-test-2/');
      for (const media of await page.locator('.project-image').all()) {
        await media.scrollIntoViewIfNeeded();
        const dimensions = await media.evaluate(async image => { await image.decode(); const box = image.getBoundingClientRect(); return { width: box.width, height: box.height, originalWidth: Number(image.getAttribute('width')), originalHeight: Number(image.getAttribute('height')), fit: getComputedStyle(image).objectFit }; });
        assert.notEqual(dimensions.fit, 'cover');
        assert.ok(Math.abs(dimensions.height - dimensions.width * dimensions.originalHeight / dimensions.originalWidth) < 2, `Image aspect ratio: ${JSON.stringify(dimensions)}`);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow with long bilingual descriptions');
      const video = page.locator('video');
      assert.equal(await video.getAttribute('autoplay'), null);
      await video.scrollIntoViewIfNeeded();
      await video.evaluate(async element => { element.muted = true; await element.play(); });
      await page.waitForFunction(() => document.querySelector('video').currentTime > 0.1);
      await video.evaluate(element => element.pause());
      assert.equal(await video.evaluate(element => element.error), null);
      await video.evaluate(element => { element.currentTime = 1.5; });
      await page.waitForFunction(() => document.querySelector('video').currentTime >= 1.4);
      const partial = await page.request.get(origin + '/videos/projects/layout-test/clip.webm', { headers: { Range: 'bytes=0-63' } });
      assert.equal(partial.status(), 206);
      assert.equal((await partial.body()).length, 64);
      assert.match(partial.headers()['content-range'], /^bytes 0-63\//);
      const invalid = await page.request.get(origin + '/videos/projects/layout-test/clip.webm', { headers: { Range: 'bytes=999999999-' } });
      assert.equal(invalid.status(), 416);
      const original = await page.locator('.project-figure > a').first().getAttribute('href');
      assert.equal((await page.request.get(origin + original)).status(), 200);
      if ([1440, 390].includes(width)) {
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
        await page.screenshot({ path: path.join(results, `project-layout-fixture-${prefix ? 'ru' : 'en'}-${width}.png`), fullPage: true });
      }
      await page.locator('.artwork-pagination a[rel="next"]').click();
      await page.waitForURL(origin + prefix + '/works/projects/layout-test-1/');
      assert.equal(await page.locator('.artwork-pagination a[rel="prev"]').count(), 1);
      if (width <= 760) await page.locator('.menu-toggle').click();
      await page.locator(`.language-switch a[lang="${prefix ? 'en' : 'ru'}"]`).click();
      await page.waitForURL(origin + (prefix ? '' : '/ru') + '/works/projects/layout-test-1/');
      await page.locator('.back-link').click();
      await page.waitForURL(origin + (prefix ? '' : '/ru') + '/works/projects/');
      assert.equal(await page.locator('.project-card').count(), 2);
      const xml = await readFile(path.join(site, 'sitemap.xml'), 'utf8');
      assert.ok(xml.includes(`https://grgyone.com${prefix}/works/projects/layout-test-1/`));
      assert.deepEqual(errors, []);
      console.log(`PASS project fixture ${prefix ? 'RU' : 'EN'} ${width}px: CV, gallery, video playback/seeking, navigation, language, sitemap`);
    }
    await page.close();
  }
  console.log('Technical fixture pages only; no artist project materials or public pages were created.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
