const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const origin='http://localhost:4183';
const slug='/works/projects/studio-21-music-lovers-worldwide/';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4183'},stdio:['ignore','pipe','inherit']});
(async()=>{
  await new Promise(resolve=>server.stdout.once('data',resolve));
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium'});
  try{
    for(const width of [1440,390]) for(const lang of ['en','ru']) for(const reduced of [false,true]){
      const page=await browser.newPage({viewport:{width,height:950},reducedMotion:reduced?'reduce':'no-preference',isMobile:width<760});
      let mediaRequests=0;const errors=[];
      page.on('request',r=>{if(/-web\.mp4/.test(r.url()))mediaRequests++;});
      page.on('pageerror',e=>errors.push(e.message));
      const prefix=lang==='ru'?'/ru':'';
      await page.goto(origin+prefix+slug);
      assert.equal(await page.locator('h1').textContent(),'MUSIC LOVERS WORLDWIDE');
      assert.equal(mediaRequests,0,'No initial video download or automatic playback');
      const animation=page.locator('.media-project-artwork video');
      const documentary=page.locator('.media-project-documentation video');
      assert.equal(await animation.evaluate(v=>v.loop),!reduced);
      assert.equal(await animation.evaluate(v=>v.muted),true);
      assert.equal(await documentary.evaluate(v=>v.loop),false);
      assert.equal(await documentary.evaluate(v=>v.muted),false);
      for(const [video,ratio,seek,duration] of [[animation,3008/800,3,7.4],[documentary,720/1280,12,20.4]]){
        await video.scrollIntoViewIfNeeded();
        await video.evaluate(v=>v.play());
        await page.waitForFunction(el=>el.currentTime>0.15,await video.elementHandle());
        assert.ok(await video.evaluate((v,d)=>Math.abs(v.duration-d)<0.3,duration));
        await video.evaluate((v,t)=>{v.pause();return new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});},seek);
        const box=await video.boundingBox();assert.ok(Math.abs(box.width/box.height-ratio)<0.01);
        assert.notEqual(await video.evaluate(v=>getComputedStyle(v).objectFit),'cover');
        assert.equal(await video.evaluate(v=>v.error),null);
        const src=await video.locator('source').getAttribute('src');
        const partial=await page.request.get(origin+src,{headers:{Range:'bytes=0-127'}});
        assert.equal(partial.status(),206);assert.equal((await partial.body()).length,128);
      }
      assert.equal(await page.locator('.media-project-venues li').count(),8);
      assert.equal(await page.locator('.project-external-links a').count(),4);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(!reduced){
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:`test-results/music-lovers-${lang}-${width}.png`});
        await documentary.scrollIntoViewIfNeeded();
        await page.screenshot({path:`test-results/music-lovers-documentary-${lang}-${width}.png`});
        await page.locator('.media-project-credits').evaluate(el=>scrollTo(0,el.getBoundingClientRect().top+scrollY-120));
        await page.screenshot({path:`test-results/music-lovers-credits-${lang}-${width}.png`});
      }
      if(width<760)await page.locator('.menu-toggle').click();
      await page.locator(`.language-switch a[lang="${lang==='en'?'ru':'en'}"]`).click();
      await page.waitForURL(origin+(lang==='en'?'/ru':'')+slug);
      await page.goto(origin+prefix+'/cv/');
      await page.locator(`.cv-row a[href="${prefix}${slug}"]`).click();
      await page.waitForURL(origin+prefix+slug);
      assert.deepEqual(errors,[]);await page.close();
      console.log(`PASS MUSIC LOVERS ${lang} ${width}px reduced=${reduced}: actual videos, ratios, seek, audio policy, CV and locale`);
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.kill());
