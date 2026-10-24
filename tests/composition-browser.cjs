const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { artworks } = require('../data/artworks.json');
const works = artworks.filter(w => w.category === 'composition');
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: '4179' }, stdio: ['ignore', 'pipe', 'inherit'] });
(async () => {
  await new Promise(resolve => server.stdout.once('data', resolve));
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium' });
  try {
    for (const width of [1440, 390]) for (const prefix of ['', '/ru']) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://localhost:4179${prefix}/works/composition/`);
      assert.equal(await page.locator('.artwork-card').count(), works.length);
      assert.deepEqual(await page.locator('.artwork-title').allTextContents(), works.map(w => w.title));
      for (const image of await page.locator('.artwork-thumbnail').all()) {
        await image.scrollIntoViewIfNeeded(); await image.evaluate(el => el.decode());
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `test-results/composition-${prefix ? 'ru' : 'en'}-${width}.png`, fullPage: true });
      for (const work of works.filter(w => !w.selected)) {
        const response = await page.goto(`http://localhost:4179${prefix}/works/composition/${work.slug}/`);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').textContent(), 'Composition');
        const image = page.locator('.artwork-full');
        await image.evaluate(el => el.decode());
        const box = await image.boundingBox();
        assert.ok(Math.abs(box.height - box.width * work.height / work.width) < 2);
        assert.notEqual(await image.evaluate(el => getComputedStyle(el).objectFit), 'cover');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (width === 390) await page.locator('.menu-toggle').click();
        await page.locator(`.language-switch a[lang="${prefix ? 'en' : 'ru'}"]`).click();
        await page.waitForURL(`http://localhost:4179${prefix ? '' : '/ru'}/works/composition/${work.slug}/`);
      }
      assert.deepEqual(errors, []); await page.close();
      console.log(`PASS Composition ${prefix || 'EN'} ${width}px: 22 cards, 20 full images, locale switching`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill());
