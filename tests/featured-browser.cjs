// Real supplied archive media, not generated technical fixtures.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const projects = require('../data/projects.json').filter(project => ['cutestar-merch-as-art', 'shout-out-kloud'].includes(project.id));
const root = path.resolve(__dirname, '..');
const origin = 'http://127.0.0.1:4178';
const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '4178' }, stdio: ['ignore', 'pipe', 'pipe'] });

async function main() {
  const { projectUrl } = await import('../scripts/projects.mjs');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Featured server startup timeout')), 10000);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Featured server exited: ${code}`)));
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  });
  await mkdir(path.join(root, 'test-results'), { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    for (const width of [1440, 768, 390, 320]) for (const lang of ['en', 'ru']) {
      const prefix = lang === 'ru' ? '/ru' : '';
      const context = await browser.newContext({ viewport: { width, height: width < 760 ? 844 : 1000 }, isMobile: width <= 760, hasTouch: width <= 760 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      for (const project of projects) {
        await page.goto(`${origin}${prefix}/works/`);
        await page.locator(`.project-card a[href="${prefix}${projectUrl(project)}"]`).click();
        assert.equal(await page.locator('h1').textContent(), project.title);
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        const images = [project.openingImage, project.coverImage, ...project.gallery, ...(project.supportingGallery || []), project.closingImage].filter(Boolean);
        assert.equal(await page.locator('.project-image').count(), images.length);
        // Load every lazy image and verify its natural and rendered proportions.
        for (const [index, image] of (await page.locator('.project-image').all()).entries()) {
          await image.scrollIntoViewIfNeeded();
          const result = await image.evaluate(async element => {
            await element.decode();
            const box = element.getBoundingClientRect();
            return { width: box.width, height: box.height, naturalWidth: element.naturalWidth, fit: getComputedStyle(element).objectFit, alt: element.alt };
          });
          assert.ok(result.naturalWidth > 0 && result.alt);
          assert.notEqual(result.fit, 'cover');
          assert.ok(Math.abs(result.height - result.width * images[index].height / images[index].width) < 2);
          const original = await image.locator('..').getAttribute('href');
          assert.equal(decodeURIComponent(original), images[index].src);
          assert.equal((await context.request.head(origin + original)).status(), 200);
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
        if (project.layout === 'collection') {
          assert.equal(await page.locator('.collection-gallery').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), width <= 760 ? 2 : 3);
          assert.equal(await page.locator('main figcaption').count(), 0);
          assert.ok((await page.locator('.project-opening img').getAttribute('alt')).includes(lang === 'ru' ? 'логотип' : 'logo'));
          assert.ok(await page.locator('.project-opening').evaluate(element => element.nextElementSibling.matches('.project-opening-video')));
          assert.equal(await page.locator('main .project-image').last().locator('..').getAttribute('href'), project.closingImage.src);
          const video = page.locator('video');
          await video.scrollIntoViewIfNeeded();
          assert.equal(await video.getAttribute('autoplay'), null);
          await video.evaluate(async element => { await element.play(); });
          await page.waitForFunction(() => document.querySelector('video').currentTime > 0.1);
          await video.evaluate(element => element.pause());
          assert.equal(await video.evaluate(element => element.error), null);
          await video.evaluate(element => new Promise((resolve, reject) => {
            element.addEventListener('seeked', resolve, { once: true });
            element.addEventListener('error', reject, { once: true });
            element.currentTime = 2;
          }));
          assert.ok(await video.evaluate(element => Math.abs(element.currentTime - 2) < 0.1));
          const response = await context.request.get(origin + project.videos[0].src, { headers: { Range: 'bytes=0-127' } });
          assert.equal(response.status(), 206);
          assert.equal((await response.body()).length, 128);
          assert.equal(response.headers()['content-type'], 'video/mp4');
          assert.equal(await page.locator('.project-external-links a').getAttribute('href'), 'https://t.me/addstickers/KloudByGRGY');
        }
        if ([1440, 390].includes(width)) {
          const shot = suffix => path.join(root, `test-results/featured-${project.id}-${lang}-${width}${suffix}.png`);
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: shot('') });
          await page.locator('.project-information').scrollIntoViewIfNeeded();
          await page.screenshot({ path: shot('-information') });
          await page.locator('.project-gallery-section').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 120));
          await page.screenshot({ path: shot('-gallery') });
          if (project.videos.length) {
            await page.locator('video').scrollIntoViewIfNeeded();
            await page.screenshot({ path: shot('-video') });
          }
        }
        if (width <= 760) await page.locator('.menu-toggle').click();
        await page.locator(`.language-switch a[lang="${lang === 'en' ? 'ru' : 'en'}"]`).click();
        await page.waitForURL(`${origin}${lang === 'en' ? '/ru' : ''}${projectUrl(project)}`);
        assert.equal(await page.locator('h1').textContent(), project.title);
      }
      for (const slug of ['cutestar-merch-as-art', 'shout-out-kloud']) {
        await page.goto(`${origin}${prefix}/works/projects/${slug}/`);
        await page.waitForURL(`${origin}${prefix}/works/${slug}/`);
      }
      await page.goto(`${origin}${prefix}/works/street-art/big-face/`);
      await page.waitForURL(`${origin}${prefix}/works/big-face/`);
      const bigFace = require('../data/artwork-details.json')['3'];
      assert.equal(await page.locator('h1').textContent(), 'Big Face');
      assert.equal(await page.locator('.back-link').getAttribute('href'), `${prefix}/works/`);
      assert.equal(await page.locator('main video, main iframe').count(), 0);
      const documentation = page.locator('main .artwork-full, main .project-image');
      const bigFaceImages = [bigFace.media.coverImage, ...bigFace.media.gallery];
      assert.equal(await documentation.count(), 5);
      for (const [index, image] of (await documentation.all()).entries()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
        const box = await image.boundingBox();
        assert.ok(Math.abs(box.height - box.width * bigFaceImages[index].height / bigFaceImages[index].width) < 2);
        assert.equal((await context.request.head(origin + bigFaceImages[index].src)).status(), 200);
      }
      if ([1440, 390].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(root, `test-results/big-face-${lang}-${width}.png`) });
        await page.locator('.artwork-documentation').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 120));
        await page.screenshot({ path: path.join(root, `test-results/big-face-${lang}-${width}-gallery.png`) });
      }
      await page.goto(`${origin}${prefix}/works/projects/grgy-solukta-gleb-kostin-solutions/`);
      await page.waitForURL(`${origin}${prefix}/works/projects/`);
      assert.equal(await page.locator('.project-card').count(), 2);
      assert.ok(!(await page.locator('main').innerText()).includes('Solukta'));
      await page.goto(`${origin}${prefix}/cv/`);
      await page.locator(`.cv-row a[href="${prefix}/works/cutestar-merch-as-art/"]`).click();
      await page.waitForURL(`${origin}${prefix}/works/cutestar-merch-as-art/`);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS real archive media ${lang.toUpperCase()} ${width}px: 71 images, SHOUT layout and MP4, Big Face, redirects, CV and language links`);
    }
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.kill('SIGTERM'));
