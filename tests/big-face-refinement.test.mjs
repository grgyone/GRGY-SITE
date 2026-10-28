import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { documentationVideo } from '../scripts/documentation.mjs';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const detail = JSON.parse(await read('data/artwork-details.json'))['3'];
test('Big Face retains URL, belongs to Street Art, and has real lazy video documentation', async () => {
  assert.deepEqual([detail.media.coverImage, ...detail.media.gallery].map(x => x.src.split('/').pop()), ['2.jpg','3.jpg','4.jpg','1.jpg','0.png']);
  for (const prefix of ['', 'ru/']) {
    const html = await read(`${prefix}works/big-face/index.html`);
    assert.ok(html.includes(`href="/${prefix}works/street-art/"`));
    assert.ok((await read(`${prefix}works/street-art/index.html`)).includes(`href="/${prefix}works/big-face/"`));
    assert.ok(!html.match(/<ul id="work-categories">([\s\S]*?)<\/ul>/)[1].includes('Big Face'));
    for (const paragraph of detail.story[prefix ? 'ru' : 'en']) assert.ok(html.includes(paragraph));
    assert.equal(detail.story[prefix ? 'ru' : 'en'].length, 3);
    const pagination = html.match(/<nav class="artwork-pagination"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.match(pagination, /street-art\/kloud/);
    assert.doesNotMatch(pagination, /shout|cutestar/);
    assert.doesNotMatch(html, /<video|model-viewer/);
    assert.match(html, /data-documentation-src="\/videos\/projects\/big-face\/IMG_1649.mp4"/);
    assert.match(html, /id="documentation-title"/);
  }
});
test('documentation is optional and supports validated external MP4 with a poster', async () => {
  assert.equal(await documentationVideo(null, 'en', '/tmp'), '');
  const fixture = {src:'https://video.example/scan.mp4',poster:'https://video.example/poster.webp',width:2500,height:2000};
  const html = await documentationVideo(fixture, 'en', '/tmp');
  assert.match(html, /3D Documentation/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /<button[^>]+data-documentation-src/);
  assert.doesNotMatch(html, /<video|autoplay|<iframe/);
  await assert.rejects(documentationVideo({...fixture, src:'http://video.example/a.mp4'},'en','/tmp'),/HTTPS/);
  await assert.rejects(documentationVideo({...fixture, poster:undefined},'en','/tmp'),/poster/);
});
