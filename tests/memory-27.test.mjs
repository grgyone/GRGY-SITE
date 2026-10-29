import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectContent, projectCards, readyProjects } from '../scripts/projects.mjs';

const records = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url)));
const memory = records.find(project => project.id === 'memory-27');
const image = (file, caption) => ({ src: `/images/projects/originals/memory-27/${file}`, width: 1228, height: 1536, altEn: caption, altRu: caption, caption: { en: caption, ru: caption } });

test('Memory #27 is a unique text-only project while media upload is pending', async () => {
  assert.equal(records.filter(project => project.slug === 'memory-27').length, 1);
  assert.equal(memory.status, 'ready');
  assert.equal(memory.mediaPending, true);
  assert.equal((await readyProjects([memory], '/tmp'))[0].id, 'memory-27');
  await assert.rejects(readyProjects([{ ...memory, mediaPending: false }], '/tmp'), /scene cover, one video and two images/);
  await assert.rejects(readyProjects([{ ...memory, coverImage: image('missing.png', 'Missing') }], '/tmp'), /partial assets/);
  for (const lang of ['en', 'ru']) {
    const html = projectContent(memory, [memory], lang);
    assert.doesNotMatch(html, /<img|<video|poster=/);
    assert.match(html, /Memory #27/);
    assert.match(projectCards([memory], lang), /memory-27\//);
  }
  const artist = JSON.parse(await readFile(new URL('../data/artist.json', import.meta.url)));
  const entries = artist.cvSections.flatMap(section => section.entries).filter(entry => entry.projectId === memory.id);
  assert.equal(entries.length, 1, 'Existing CV entry connects to the project');
});

test('collaboration shows the main video, overview, full artwork and original in order', () => {
  const composition = image('BxGcomp.png', 'Collaboration Artwork');
  const original = image('bxg.png', 'Original GRGY Artwork');
  const project = { ...memory, mediaPending: false, coverImage: composition, gallery: [composition, original], videos: [{ src: '/videos/projects/memory-27/1-web.mp4', width: 1228, height: 1536, poster: '/images/projects/optimized/memory-27/poster.webp' }] };
  for (const lang of ['en', 'ru']) {
    const html = projectContent(project, [project], lang);
    assert.ok(html.indexOf('<video') < html.indexOf('class="project-information"'));
    assert.ok(html.indexOf('class="project-information"') < html.indexOf('BxGcomp.png'));
    assert.ok(html.indexOf('BxGcomp.png') < html.indexOf('bxg.png'));
    assert.equal((html.match(/class="project-image"/g) || []).length, 2, 'Scene cover is not duplicated before the video');
    assert.match(html, /controls playsinline preload="none" width="1228" height="1536"/);
    assert.doesNotMatch(html, /autoplay| muted| loop/);
    assert.match(html, /poster="\/images\/projects\/optimized\/memory-27\/poster.webp"/);
    assert.match(html, lang === 'en' ? /<dt>Artists<\/dt>/ : /<dt>Художники<\/dt>/);
    assert.ok(html.indexOf('sobaka.ru') < html.indexOf('behance.net'));
    assert.match(html, lang === 'en' ? /Selected Press/ : /Избранная пресса/);
    assert.match(html, lang === 'en' ? /Artist Profiles/ : /Профили художников/);
    const card = projectCards([project], lang);
    assert.doesNotMatch(card, /<video/);
    assert.match(card, /0-960.webp/);
  }
  const normal = projectContent({ ...project, layout: undefined, videoPosition: undefined }, [project], 'en');
  assert.match(normal, /<dt>Collaborators<\/dt>/, 'Collaboration labels do not leak to other projects');
});
