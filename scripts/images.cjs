const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const { artworks } = require('../data/artworks.json');
const projectRecords = require('../data/projects.json');
const artworkDetails = require('../data/artwork-details.json');
const root = path.resolve(__dirname, '..');

(async () => {
  await fs.mkdir(path.join(root, 'images/artworks/optimized'), { recursive: true });
  // Originals stay byte-for-byte intact. Derivatives retain the full aspect ratio;
  // only gallery CSS crops images, using objectPosition from the artwork data.
  for (const work of artworks) {
    for (const width of [480, 960, 1920]) {
      await sharp(path.join(root, 'images/artworks/originals', work.file))
        .resize({ width, withoutEnlargement: true }).webp({ quality: 82 })
        .toFile(path.join(root, `images/artworks/optimized/${work.id}-${width}.webp`));
    }
  }
  const { readyProjects, optimizeProjectImages } = await import('./projects.mjs');
  const projects = await readyProjects(projectRecords, root, { checkOptimized: false });
  await optimizeProjectImages(projects, root);
  await optimizeProjectImages(Object.values(artworkDetails).map(detail => detail.media).filter(Boolean), root);
  console.log(`Prepared responsive images for ${artworks.length} artworks; originals unchanged.`);
  console.log(`Prepared responsive images for ${projects.length} projects; drafts excluded.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
