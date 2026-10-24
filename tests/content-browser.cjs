const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const data = require('../data/artist.json');
const root = path.resolve(__dirname, '..');
const origin = 'http://127.0.0.1:4177';
const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '4177' }, stdio: ['ignore', 'pipe', 'pipe'] });
const routes = [['artist-statement', 'statement'], ['bio', 'bio'], ['cv', 'cv']];

async function main() {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Content server startup timeout')), 10000);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Content server exited: ${code}`)));
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  });
  await mkdir(path.join(root, 'test-results'), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    for (const width of [1440, 768, 600, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const lang of ['en', 'ru']) {
        const prefix = lang === 'ru' ? '/ru' : '';
        for (const [route, key] of routes) {
          const url = `${origin}${prefix}/${route}/`;
          assert.equal((await page.goto(url)).status(), 200);
          assert.equal(await page.locator('html').getAttribute('lang'), lang);
          if (key !== 'cv') {
            const paragraphs = await page.locator('.artist-prose > p').allTextContents();
            assert.deepEqual(paragraphs, data[lang][key].map(text => text.replace(/\*([^*]+)\*/g, '$1')), 'Every approved paragraph is rendered verbatim');
            assert.equal(await page.locator('main img, main video').count(), 0);
          } else {
            assert.deepEqual(await page.locator('.cv-section h2').allTextContents(), data.cvSections.map(section => section.title[lang]));
            assert.deepEqual(await page.locator('.cv-row dd').allTextContents(), data.cvSections.flatMap(section => section.entries.map(entry => entry.text[lang])));
            assert.deepEqual(await page.locator('.cv-year').allTextContents(), data.cvSections.flatMap(section => section.entries.map(entry => entry.year)));
            assert.equal(await page.locator('.cv-projects a').count(), 2);
            for (const row of await page.locator('.cv-row').all()) {
              const year = await row.locator('dt').boundingBox();
              const entry = await row.locator('dd').boundingBox();
              assert.ok(entry.x > year.x + year.width, 'Years are a separate narrow column');
            }
            for (const href of await page.locator('.cv-row a').evaluateAll(links => links.map(link => link.getAttribute('href')))) assert.equal((await page.request.get(origin + href)).status(), 200);
          }
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} does not overflow at ${width}px`);
          assert.ok((await page.title()).includes('GRGY (Grgy Sukhanov)'));
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://grgyone.com${prefix}/${route}/`);
          assert.equal(await page.locator('link[hreflang="en"]').getAttribute('href'), `https://grgyone.com/${route}/`);
          assert.equal(await page.locator('link[hreflang="ru"]').getAttribute('href'), `https://grgyone.com/ru/${route}/`);
          assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), data[lang].metaDescriptions[key]);
          if ([1440, 390].includes(width)) await page.screenshot({ path: path.join(root, `test-results/v4-${route}-${lang}-${width}.png`), fullPage: true });
          if (width <= 760) await page.locator('.menu-toggle').click();
          await page.locator(`.language-switch a[lang="${lang === 'ru' ? 'en' : 'ru'}"]`).click();
          await page.waitForURL(`${origin}${lang === 'ru' ? '' : '/ru'}/${route}/`);
          assert.equal(await page.locator('html').getAttribute('lang'), lang === 'ru' ? 'en' : 'ru');
        }
        console.log(`PASS content v4 ${lang.toUpperCase()} ${width}px: Statement, Bio, CV, exact copy, metadata, links, language switching`);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill('SIGTERM'));
