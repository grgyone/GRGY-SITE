const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const { artworks } = require('../data/artworks.json');
const artworkDetails = require('../data/artwork-details.json');
const projects = require('../data/projects.json').filter(project => project.status === 'ready').sort((a, b) => a.displayOrder - b.displayOrder);
const cvProjects = require('../data/artist.json').cvSections.flatMap(section => section.entries.map(entry => entry.projectId)).filter(id => projects.some(project => project.id === id));
const root = path.resolve(__dirname, '..');
const origin = 'http://127.0.0.1:4174';
const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '4174' }, stdio: ['ignore', 'pipe', 'pipe'] });

async function main() {
  const { projectUrl, artworkUrl } = await import('../scripts/projects.mjs');
  const listedProjects = projects.filter(project => project.section !== 'works');
  const standalone = projects.filter(project => project.section === 'works');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Test server startup timed out')), 10000);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Test server exited: ${code}`)));
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  });
  await mkdir(path.join(root, 'test-results'), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 600, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
      const mobile = viewport.width <= 760;
      for (const prefix of ['', '/ru']) {
        const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
        const page = await context.newPage();
        const errors = [];
        const failedResponses = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => { if (response.status() >= 400) failedResponses.push(response.url()); });
        await page.goto(origin + prefix + '/', { waitUntil: 'networkidle' });
        assert.equal(await page.locator('html').getAttribute('lang'), prefix ? 'ru' : 'en');
        assert.deepEqual(await page.locator('.artwork-title').allTextContents(), artworks.filter(work => work.selected).map(work => work.title));
        const grid = await page.locator('.artwork-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
        assert.equal(grid, viewport.width <= 480 ? 1 : mobile ? 2 : 3);
        for (const thumb of await page.locator('.artwork-thumbnail').all()) {
          await thumb.scrollIntoViewIfNeeded();
          await thumb.evaluate(image => image.decode());
          const box = await thumb.boundingBox();
          assert.ok(Math.abs(box.width - box.height) < 1, 'Thumbnail must be square');
          assert.equal(await thumb.evaluate(image => getComputedStyle(image).objectFit), 'cover');
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(root, `test-results/home-${prefix ? 'ru' : 'en'}-${viewport.width}.png`), fullPage: true });

        const menu = page.locator('.menu-toggle');
        if (mobile) {
          assert.equal(await page.locator('#site-navigation').isVisible(), false);
          await menu.click();
          assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        } else assert.equal(await menu.isVisible(), false);
        const navLinks = await page.locator('.artist-navigation a').allTextContents();
        assert.equal(navLinks.length, 3);
        assert.equal(await page.locator('#work-categories li').count(), 3 + Number(listedProjects.length > 0) + standalone.length);
        await page.locator('.works-toggle').click();
        assert.equal(await page.locator('#work-categories').isVisible(), false);
        await page.locator('.works-toggle').click();
        assert.equal(await page.locator('#work-categories').isVisible(), true);
        await page.locator('.works-heading > a').click();
        await page.waitForURL(origin + prefix + '/works/composition/');
        assert.equal(await page.locator('.artwork-card').count(), artworks.filter(work => work.category === 'composition').length);

        for (const [index, work] of artworks.filter(work => work.selected).entries()) {
          // Open through the homepage gallery, not just a synthetic request.
          await page.goto(origin + prefix + '/');
          await page.locator('.artwork-card > a').nth(index).click();
          await page.waitForURL(origin + prefix + artworkUrl(work, artworkDetails));
          assert.equal(await page.locator('h1').textContent(), artworkDetails[work.id]?.displayTitle[prefix ? 'ru' : 'en'] || work.title);
          const full = page.locator('.artwork-full');
          await full.evaluate(image => image.decode());
          const box = await full.boundingBox();
          assert.ok(Math.abs(box.width / box.height - work.width / work.height) < 0.005, 'Full artwork must retain its original ratio');
          assert.notEqual(await full.evaluate(image => getComputedStyle(image).objectFit), 'cover');
          assert.equal(await page.locator('.artwork-pagination a').count(), ['4', '6'].includes(work.id) ? 2 : 1);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          const original = await page.locator('.original-image').getAttribute('href');
          const response = await context.request.get(origin + original);
          assert.equal(response.status(), 200);
          if (index === 0 && [1440, 390].includes(viewport.width)) await page.screenshot({ path: path.join(root, `test-results/artwork-${prefix ? 'ru' : 'en'}-${viewport.width}.png`), fullPage: true });
        }
        // Language switching keeps the current work, in both directions.
        if (mobile) await menu.click();
        await page.locator(`.language-switch a[lang="${prefix ? 'en' : 'ru'}"]`).click();
        await page.waitForURL(origin + (prefix ? '' : '/ru') + '/works/composition/composition/');
        assert.equal(await page.locator('h1').textContent(), 'Composition');
        if (mobile) {
          await menu.click();
          await page.keyboard.press('Escape');
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        }
        // Test actual approved project records, not just the media layout fixtures.
        await page.goto(origin + prefix + '/cv/');
        assert.equal(await page.locator('.cv-row a').count(), cvProjects.length);
        for (const project of projects) {
          await page.goto(origin + prefix + (cvProjects.includes(project.id) ? '/cv/' : '/works/'));
          await page.locator(`main a[href="${prefix}${projectUrl(project)}"]`).click();
          await page.waitForURL(origin + prefix + projectUrl(project));
          assert.equal(await page.locator('h1').textContent(), project.title);
          assert.equal((await page.locator('.project-description').innerText()).trim(), project[prefix ? 'descriptionRu' : 'descriptionEn']);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Project page does not overflow');
          if (!project.coverImage && !project.gallery.length && !project.videos.length) assert.equal(await page.locator('main img, main video, .project-gallery').count(), 0);
          if ([1440, 390].includes(viewport.width)) await page.screenshot({ path: path.join(root, `test-results/project-${project.id}-${prefix ? 'ru' : 'en'}-${viewport.width}.png`), fullPage: !project.coverImage });
          if (mobile) await menu.click();
          await page.locator(`.language-switch a[lang="${prefix ? 'en' : 'ru'}"]`).click();
          await page.waitForURL(origin + (prefix ? '' : '/ru') + projectUrl(project));
          assert.equal(await page.locator('h1').textContent(), project.title);
          const adjacent = page.locator('.artwork-pagination a').first();
          await adjacent.click();
          assert.ok(await page.locator('.project-description').isVisible());
          await page.locator('.back-link').click();
          assert.equal(await page.locator('.project-card').count(), project.section === 'works' ? projects.length : listedProjects.length);
        }
        await page.goto(origin + prefix + '/works/projects/');
        if ([1440, 390].includes(viewport.width)) await page.screenshot({ path: path.join(root, `test-results/projects-${prefix ? 'ru' : 'en'}-${viewport.width}.png`), fullPage: true });
        assert.deepEqual(errors, [], 'No browser runtime errors');
        assert.deepEqual(failedResponses, [], 'No broken media or script requests');
        await context.close();
        console.log(`PASS ${prefix ? 'RU' : 'EN'} ${viewport.width}px: six artworks, ${projects.length} projects, CV links, navigation and language switching`);
      }
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const route of ['/cv/', '/ru/cv/', '/artist-statement/', '/ru/artist-statement/', '/bio/', '/ru/bio/', '/contact/', '/ru/contact/', '/works/', '/ru/works/']) {
      const response = await page.goto(origin + route);
      assert.equal(response.status(), 200);
      assert.ok(await page.locator('h1').isVisible());
    }
    for (const legacy of ['/store.html', '/product.html?slug=test', '/cart_items.html', '/items_1.html']) {
      await page.goto(origin + legacy);
      await page.waitForURL(origin + '/works/');
      assert.equal(await page.locator('main > .artwork-grid > .artwork-card').count(), artworks.length + standalone.length);
    }
    assert.equal((await context.request.get(origin + '/_archive/shop/store.html')).status(), 404);
    assert.equal((await context.request.get(origin + '/not-a-page/')).status(), 404);
    await context.close();
    console.log('PASS artist text pages, legacy redirects, private archive and 404');
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill('SIGTERM'));
