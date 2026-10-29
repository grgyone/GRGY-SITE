import { stat, mkdir } from 'node:fs/promises';
import path from 'node:path';

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const localized = (value, lang) => typeof value === 'string' ? value : value?.[lang] || '';
export const projectUrl = project => `/works/${project.section === 'works' ? '' : 'projects/'}${project.slug}/`;
export const artworkUrl = (work, details = {}) => `/works/${details[work.id]?.standalone ? '' : work.category + '/'}${work.slug}/`;
export const localUrl = (url, lang) => (lang === 'ru' ? '/ru' : '') + url;
export const projectImages = project => [project.coverImage, ...project.gallery, ...(project.supportingGallery || []), project.openingImage, project.closingImage].filter((image, index, images) => image && images.findIndex(other => other?.src === image.src) === index);
export const imageBase = (project, image) => `/images/projects/optimized/${project.id}/${image.assetIndex ?? projectImages(project).findIndex(other => other.src === image.src)}`;
const labels = {
  en: { projects: 'Projects', back: 'Back to Projects', year: 'Year', projectType: 'Project Type', medium: 'Medium', collaborators: 'Collaborators', location: 'Location', description: 'Description', prev: 'Previous Project', next: 'Next Project', links: 'Related links', original: 'Open original image', download: 'Download video', video: 'Video' },
  ru: { projects: 'Проекты', back: 'Назад к проектам', year: 'Год', projectType: 'Тип проекта', medium: 'Материал', collaborators: 'Участники', location: 'Место', description: 'Описание', prev: 'Предыдущий проект', next: 'Следующий проект', links: 'Ссылки', original: 'Открыть оригинал', download: 'Скачать видео', video: 'Видео' }
};
export const projectsTitle = lang => labels[lang].projects;
const mediaUrl = src => esc(src.split('/').map(encodeURIComponent).join('/'));

function requireText(value, context) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${context}: text is required`);
}
function requireUrl(url, context) {
  try { if (new URL(url).protocol !== 'https:') throw new Error(); }
  catch { throw new Error(`${context}: an HTTPS URL is required`); }
}
export async function checkAsset(root, src, context) {
  if (typeof src !== 'string' || !/^\/(?:images|videos)\/projects\//.test(src) || /[\\\u0000-\u001f]/.test(src) || src.split('/').some(part => part === '..' || part.startsWith('.'))) throw new Error(`${context}: use a local project media path`);
  const file = path.resolve(root, '.' + src);
  if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error(`${context}: invalid media path`);
  if (!(await stat(file)).isFile()) throw new Error(`${context}: missing file ${src}`);
}
function dimensions(media, context) {
  if (![media.width, media.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`${context}: positive image/video dimensions are required`);
}

export async function readyProjects(records, root, { checkOptimized = true } = {}) {
  if (!Array.isArray(records)) throw new Error('Projects data must be an array');
  const ids = new Set();
  const slugs = new Set();
  for (const project of records) {
    for (const [key, seen] of [['id', ids], ['slug', slugs]]) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project[key]) || seen.has(project[key])) throw new Error(`Invalid or duplicate project ${key}: ${project[key]}`);
      seen.add(project[key]);
    }
    if (!['draft', 'ready'].includes(project.status)) throw new Error(`${project.id}: status must be draft or ready`);
    if (project.category !== 'projects') throw new Error(`${project.id}: category must be projects`);
    if (project.section && !['works', 'projects'].includes(project.section)) throw new Error(`${project.id}: invalid section`);
    if (project.videoPosition && !['opening', 'after-gallery'].includes(project.videoPosition)) throw new Error(`${project.id}: invalid videoPosition`);
    if (project.videoPosition === 'opening' && !project.openingImage && project.layout !== 'collaboration') throw new Error(`${project.id}: opening video needs an opening image`);
    if (!Number.isFinite(project.displayOrder)) throw new Error(`${project.id}: displayOrder is required`);
    requireText(project.title, project.id);
  }
  const projects = records.filter(project => project.status === 'ready').sort((a, b) => a.displayOrder - b.displayOrder);
  for (const project of projects) {
    if (project.year !== null && !Number.isInteger(project.year)) throw new Error(`${project.id}: year must be confirmed or explicitly null`);
    for (const lang of ['En', 'Ru']) requireText(project[`description${lang}`], `${project.id} description${lang}`);
    if (!Array.isArray(project.gallery) || !Array.isArray(project.videos) || !Array.isArray(project.collaborators) || !Array.isArray(project.externalLinks) || (project.supportingGallery && !Array.isArray(project.supportingGallery))) throw new Error(`${project.id}: media and link arrays are required`);
    if (project.layout === 'collaboration') {
      const pending = project.mediaPending === true;
      if (pending && (projectImages(project).length || project.videos.length || project.metaImage)) throw new Error(`${project.id}: pending media must not include partial assets`);
      if (!pending && (!project.coverImage || project.videos.length !== 1 || project.gallery.length !== 2)) throw new Error(`${project.id}: collaboration requires a scene cover, one video and two images`);
      if (!pending && (project.videoPosition !== 'opening' || !project.videos[0].poster)) throw new Error(`${project.id}: collaboration requires opening video with a poster`);
      if (!Array.isArray(project.artists) || project.artists.length < 2) throw new Error(`${project.id}: collaboration requires credited artists`);
      for (const name of project.artists) requireText(name, `${project.id} artist`);
      for (const link of project.externalLinks) if (!['press', 'profiles'].includes(link.group)) throw new Error(`${project.id}: separate press from artist profiles`);
    }
    if (project.layout === 'media-project') {
      for (const role of ['artwork', 'documentation']) if (project.videos.filter(video => video.role === role).length !== 1) throw new Error(`${project.id}: one ${role} video is required`);
      if (!Array.isArray(project.credits) || !Array.isArray(project.venues)) throw new Error(`${project.id}: credits and archival venues are required`);
      for (const row of project.credits) for (const lang of ['en','ru']) {
        requireText(localized(row.label,lang), `${project.id} credit label`);
        requireText(localized(row.value,lang), `${project.id} credit value`);
      }
    }
    if (project.sketchfab) {
      if (!/^[a-f0-9]{32}$/.test(project.sketchfab.id)) throw new Error(project.id + ': invalid Sketchfab model id');
      requireText(project.sketchfab.title, project.id + ' model title');
      requireText(project.sketchfab.author, project.id + ' model author');
    }
    if (project.metaImage) {
      await checkAsset(root, project.metaImage, project.id);
      for (const lang of ['en','ru']) requireText(localized(project.metaImageAlt,lang), `${project.id} meta image alt`);
    }
    for (const fact of project.additionalInfo || []) for (const lang of ['en', 'ru']) {
      requireText(localized(fact.label, lang), `${project.id} fact label`);
      requireText(localized(fact.value, lang), `${project.id} fact value`);
    }
    const mediaKeys = new Set();
    for (const image of projectImages(project)) {
      if (image.assetIndex !== undefined && (!Number.isInteger(image.assetIndex) || image.assetIndex < 0)) throw new Error(`${project.id}: invalid assetIndex`);
      const mediaKey = imageBase(project, image);
      if (mediaKeys.has(mediaKey)) throw new Error(`${project.id}: duplicate image asset key`);
      mediaKeys.add(mediaKey);
      await checkAsset(root, image.src, project.id);
      if (!/\.(?:png|jpe?g|webp)$/i.test(image.src)) throw new Error(`${project.id}: unsupported image format`);
      dimensions(image, project.id);
      requireText(image.altEn, `${project.id} image altEn`);
      requireText(image.altRu, `${project.id} image altRu`);
      if (image.objectPosition && !/^\d+(?:\.\d+)?% \d+(?:\.\d+)?%$/.test(image.objectPosition)) throw new Error(`${project.id}: invalid objectPosition`);
      if (checkOptimized) for (const width of [480, 960, 1920]) await checkAsset(root, `${imageBase(project, image)}-${width}.webp`, project.id);
    }
    for (const collaborator of project.collaborators) {
      requireText(collaborator.name, project.id);
      if (collaborator.url) requireUrl(collaborator.url, project.id);
    }
    for (const link of project.externalLinks) {
      requireUrl(link.url, project.id);
      for (const lang of ['en', 'ru']) requireText(localized(link.label, lang), `${project.id} link ${lang}`);
    }
    for (const video of project.videos) {
      await checkAsset(root, video.src, project.id);
      if (!/\.(?:mp4|webm)$/i.test(video.src)) throw new Error(`${project.id}: use a browser-compatible MP4 or WebM video`);
      dimensions(video, project.id);
      if (video.poster) await checkAsset(root, video.poster, project.id);
      for (const track of video.tracks || []) {
        await checkAsset(root, track.src, project.id);
        if (!['en', 'ru'].includes(track.lang) || !track.src.endsWith('.vtt')) throw new Error(`${project.id}: use EN/RU WebVTT captions`);
        requireText(track.label, project.id);
      }
    }
  }
  return projects;
}

export async function optimizeProjectImages(projects, root) {
  const { default: sharp } = await import('sharp');
  for (const project of projects) {
    for (const image of projectImages(project)) {
      const original = path.join(root, image.src);
      const metadata = await sharp(original).metadata();
      const swapped = [5, 6, 7, 8].includes(metadata.orientation);
      if ((swapped ? metadata.height : metadata.width) !== image.width || (swapped ? metadata.width : metadata.height) !== image.height) {
        throw new Error(`${project.id}: image dimensions do not match the original ${image.src}`);
      }
      const base = path.join(root, imageBase(project, image));
      await mkdir(path.dirname(base), { recursive: true });
      for (const width of [480, 960, 1920]) {
        await sharp(original).rotate().resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 }).toFile(`${base}-${width}.webp`);
      }
    }
  }
}

export function projectImage(project, image, lang, { thumbnail = false, eager = false, collectionTile = false } = {}) {
  const base = imageBase(project, image);
  const widths = [...new Set([480, 960, 1920].map(width => Math.min(width, image.width)))];
  const source = width => `${base}-${width <= 480 ? 480 : width <= 960 ? 960 : 1920}.webp`;
  const sizes = collectionTile ? '(max-width: 760px) calc((100vw - 56px) / 2), (max-width: 1200px) calc((100vw - 348px) / 3), 318px' : thumbnail ? '(max-width: 480px) calc(100vw - 40px), (max-width: 760px) calc((100vw - 56px) / 2), 380px' : '(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) calc(100vw - 300px), 1000px';
  return `<img class="${thumbnail ? 'artwork-thumbnail' : 'project-image'}" src="${base}-${thumbnail ? 960 : 1920}.webp" srcset="${widths.map(width => `${source(width)} ${width}w`).join(', ')}" sizes="${sizes}" width="${image.width}" height="${image.height}" alt="${esc(image[lang === 'ru' ? 'altRu' : 'altEn'])}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async"${thumbnail ? ` style="object-position: ${image.objectPosition || '50% 50%'}"` : ''}>`;
}

export function projectCards(projects, lang) {
  return projects.map(project => project.coverImage
    ? `<figure class="artwork-card project-card"><a href="${localUrl(projectUrl(project), lang)}">${projectImage(project, project.coverImage, lang, { thumbnail: true })}<figcaption><span class="artwork-title">${esc(project.title)}</span>${project.year === null ? '' : `<span class="artwork-year">${project.year}</span>`}</figcaption></a></figure>`
    : `<article class="project-card project-card-text"><h2><a href="${localUrl(projectUrl(project), lang)}">${esc(project.title)}</a></h2><p class="project-card-meta">${[project.year, localized(project.projectType, lang)].filter(value => value !== null && value !== '').map(esc).join(' · ')}</p><p class="project-card-description">${esc(project[lang === 'ru' ? 'descriptionRu' : 'descriptionEn'])}</p></article>`).join('\n');
}
export function projectCv(projects, lang) {
  if (!projects.length) return '';
  return `<section class="cv-projects"><h2>${labels[lang].projects}</h2><ul class="exhibition-list">${projects.map(project => `<li>${project.year === null ? '' : project.year + ' — '}<a href="${localUrl(projectUrl(project), lang)}">${esc(project.title)}</a></li>`).join('')}</ul></section>`;
}
export function projectContent(project, projects, lang) {
  const collaboration = project.layout === 'collaboration';
  const t = project.section === 'works' ? { ...labels[lang], projects: lang === 'ru' ? 'Работы' : 'Works', back: lang === 'ru' ? 'Назад к работам' : 'Back to Works', prev: lang === 'ru' ? 'Предыдущая работа' : 'Previous Work', next: lang === 'ru' ? 'Следующая работа' : 'Next Work' } : { ...labels[lang] };
  const info = (key, value) => value ? `<div><dt>${t[key]}</dt><dd>${value}</dd></div>` : '';
  if (collaboration) t.collaborators = lang === 'ru' ? 'Художники' : 'Artists';
  const collaborators = project.collaborators.map(person => person.url ? `<a href="${esc(person.url)}" target="_blank" rel="noopener noreferrer">${esc(person.name)}</a>` : esc(person.name)).join(', ');
  const caption = media => localized(media.caption, lang);
  const figure = (image, eager = false, collectionTile = false) => `<figure class="project-figure"><a href="${mediaUrl(image.src)}" aria-label="${t.original}">${projectImage(project, image, lang, { eager, collectionTile })}</a>${!project.hideCaptions && caption(image) ? `<figcaption>${esc(caption(image))}</figcaption>` : ''}</figure>`;
  const index = projects.findIndex(other => other.id === project.id);
  const adjacent = (other, direction) => other ? `<a href="${localUrl(projectUrl(other), lang)}" rel="${direction}"><span>${direction === 'prev' ? t.prev : t.next}</span>${esc(other.title)}</a>` : '<span></span>';
  const description = project[lang === 'ru' ? 'descriptionRu' : 'descriptionEn'];
  const videos = project.videos.map(video => `<figure class="project-figure"><video class="project-video" controls playsinline preload="${collaboration ? 'none' : 'metadata'}" width="${video.width}" height="${video.height}" aria-label="${esc(caption(video) || project.title + ' — ' + t.video)}"${video.poster ? ` poster="${mediaUrl(video.poster)}"` : ''}><source src="${mediaUrl(video.src)}" type="${video.src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'}">${(video.tracks || []).map(track => `<track kind="captions" src="${mediaUrl(track.src)}" srclang="${track.lang}" label="${esc(track.label)}"${track.lang === lang ? ' default' : ''}>`).join('')}<a href="${mediaUrl(video.src)}">${t.download}</a></video>${!project.hideCaptions && caption(video) ? `<figcaption>${esc(caption(video))}</figcaption>` : ''}</figure>`).join('');
  const collection = project.layout === 'collection';
  const gallery = project.gallery.filter((image, index, images) => (collaboration || image.src !== project.coverImage?.src) && images.findIndex(other => other.src === image.src) === index).map(image => figure(image, false, collection)).join('');
  const supporting = (project.supportingGallery || []).map(image => figure(image)).join('');
  const facts = (project.additionalInfo || []).map(fact => `<div><dt>${esc(localized(fact.label, lang))}</dt><dd>${esc(localized(fact.value, lang))}</dd></div>`).join('');
  const model = project.sketchfab;
  const modelSection = model ? `<section class="project-model"><h2>${lang === 'ru' ? '3D-модель' : '3D Model'}</h2><iframe title="${esc(model.title)}" src="https://sketchfab.com/models/${esc(model.id)}/embed?autostart=0&amp;tracking=0" loading="lazy" allow="fullscreen; xr-spatial-tracking" allowfullscreen></iframe><p><a href="https://sketchfab.com/models/${esc(model.id)}" target="_blank" rel="noopener noreferrer">${esc(model.title)}</a> · ${esc(model.author)} / Sketchfab</p></section>` : '';
  const linkGroups = collaboration ? [
    { title: lang === 'ru' ? 'Избранная пресса' : 'Selected Press', links: project.externalLinks.filter(link => link.group === 'press') },
    { title: lang === 'ru' ? 'Профили художников' : 'Artist Profiles', links: project.externalLinks.filter(link => link.group === 'profiles') }
  ] : [{ title: t.links, links: project.externalLinks }];
  const linkSections = linkGroups.filter(group => group.links.length).map(group => `<section class="project-external-links"><h2>${group.title}</h2><ul>${group.links.map(link => `<li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(localized(link.label, lang))}</a></li>`).join('')}</ul></section>`).join('');
  return `<article class="project-detail${project.coverImage ? '' : ' project-detail-text'}${collection ? ' project-collection' : ''}"><a class="back-link" href="${localUrl(project.section === 'works' ? '/works/' : '/works/projects/', lang)}">← ${t.back}</a>${collection ? `<h1 class="collection-title">${esc(project.title)}</h1>` : ''}${project.openingImage ? `<div class="project-opening">${figure(project.openingImage, true)}</div>` : ''}${project.videoPosition === 'opening' && videos ? `<div class="project-videos project-opening-video">${videos}</div>` : ''}${project.coverImage && !collaboration ? figure(project.coverImage, !project.openingImage) : ''}<div class="project-information"><div>${collection ? '' : `<h1>${esc(project.title)}</h1>`}<dl>${info('year', project.year)}${info('projectType', esc(localized(project.projectType, lang)))}${info('medium', esc(localized(project.medium, lang)))}${info('collaborators', collaborators)}${info('location', esc(localized(project.location, lang)))}${facts}</dl></div><section class="project-description" aria-label="${t.description}">${description.split(/\n\s*\n/).map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</section></div>${modelSection}${gallery ? `<section class="project-gallery-section">${project.galleryHeading ? `<h2>${esc(localized(project.galleryHeading, lang))}</h2>` : ''}<div class="project-gallery${collection ? ' collection-gallery' : ''}">${gallery}</div></section>` : ''}${project.videoPosition !== 'opening' && videos ? `<div class="project-videos">${videos}</div>` : ''}${supporting ? `<section class="project-supporting"><h2>${esc(localized(project.supportingHeading, lang) || (lang === 'ru' ? 'Дополнительные материалы' : 'Additional materials'))}</h2><div class="project-gallery">${supporting}</div></section>` : ''}${linkSections}${project.closingImage ? `<div class="project-closing">${figure(project.closingImage)}</div>` : ''}<nav class="artwork-pagination" aria-label="${t.projects}">${adjacent(projects[index - 1], 'prev')}${adjacent(projects[index + 1], 'next')}</nav></article>`;
}
