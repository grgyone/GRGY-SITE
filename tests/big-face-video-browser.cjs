// Actual supplied Big Face footage, not a technical substitute.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { readFile } = require('node:fs/promises');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const manifest = require('../data/big-face-video.json');
const origin = 'http://localhost:4182';
const server = spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4182'},stdio:['ignore','pipe','inherit']});
(async()=>{
  const bytes = await readFile('.'+manifest.src);
  assert.equal(bytes.length,manifest.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
  await new Promise(resolve=>server.stdout.once('data',resolve));
  const browser = await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium'});
  try {
    for(const width of [1440,390]) for(const lang of ['en','ru']) {
      const prefix = lang === 'ru' ? '/ru' : '';
      const page = await browser.newPage({viewport:{width,height:900},isMobile:width<760});
      let requests = 0;
      const errors = [];
      page.on('request',r=>{if(r.url().includes('/IMG_1649.mp4'))requests++;});
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(origin+prefix+'/works/big-face/');
      const button = page.locator('[data-documentation-src]');
      await button.scrollIntoViewIfNeeded();
      await button.locator('img').evaluate(el=>el.decode());
      assert.equal(requests,0,'No MP4 request before click, including when poster becomes visible');
      await page.screenshot({path:`test-results/big-face-video-poster-${lang}-${width}.png`});
      await button.click();
      await page.waitForFunction(()=>document.querySelector('video')?.currentTime>0.2);
      const video = page.locator('video');
      const info = await video.evaluate(el=>({duration:el.duration,width:el.videoWidth,height:el.videoHeight,error:el.error}));
      assert.equal(info.width,1920);assert.equal(info.height,1080);
      assert.ok(Math.abs(info.duration-manifest.durationSeconds)<0.1);
      assert.equal(info.error,null);
      await video.evaluate(el=>{el.pause();return new Promise(resolve=>{el.addEventListener('seeked',resolve,{once:true});el.currentTime=30;});});
      assert.ok(await video.evaluate(el=>Math.abs(el.currentTime-30)<0.1));
      const box = await video.boundingBox();
      assert.ok(Math.abs(box.width/box.height-16/9)<0.01);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const partial = await page.request.get(origin+manifest.src,{headers:{Range:'bytes=0-127'}});
      assert.equal(partial.status(),206);assert.equal((await partial.body()).length,128);
      await page.screenshot({path:`test-results/big-face-video-playing-${lang}-${width}.png`});
      assert.deepEqual(errors,[]);
      await page.close();
      console.log(`PASS actual Big Face MP4 ${lang} ${width}px: hash, lazy poster, playback, seek, range and 16:9`);
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.kill());
