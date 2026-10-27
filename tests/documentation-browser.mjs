// Isolated player test: existing SHOUT clip stands in only as a technical fixture.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { documentationVideo } from '../scripts/documentation.mjs';
const bytes = await readFile(new URL('../videos/projects/shout-out-kloud/SHOUTGRGY_1.mp4',import.meta.url));
const poster = await readFile(new URL('../images/projects/optimized/big-face/0-960.webp',import.meta.url));
const script = await readFile(new URL('../documentation-video.js',import.meta.url),'utf8');
const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium'});
try {
  for (const width of [1440,390]) for (const lang of ['en','ru']) {
    const page = await browser.newPage({viewport:{width,height:900}});
    let mediaRequests = 0;
    await page.route('https://video.example/scan.mp4',route=>{mediaRequests++;return route.fulfill({contentType:'video/mp4',body:bytes});});
    await page.route('https://video.example/poster.webp',route=>route.fulfill({contentType:'image/webp',body:poster}));
    const html = await documentationVideo({src:'https://video.example/scan.mp4',poster:'https://video.example/poster.webp',width:2500,height:2000},lang,'/tmp');
    await page.setContent(html);
    await page.addStyleTag({path:new URL('../documentation-video.css',import.meta.url).pathname});
    await page.addScriptTag({content:script});
    assert.equal(mediaRequests,0);
    await page.locator('button').click();
    await page.waitForFunction(()=>document.querySelector('video')?.currentTime>0.1);
    assert.ok(mediaRequests>0);
    assert.equal(await page.locator('video').getAttribute('controls'),'');
    assert.equal(await page.locator('video').getAttribute('playsinline'),'');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.close();
    console.log(`PASS isolated documentation player ${lang} ${width}px: lazy MP4, poster, click playback, external source`);
  }
} finally {await browser.close();}
