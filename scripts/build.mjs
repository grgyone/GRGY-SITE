import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { documentationVideo } from './documentation.mjs';
import { readyProjects, projectUrl, artworkUrl, projectCards, projectContent, projectsTitle, projectImage, imageBase, localized } from './projects.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { values: options } = parseArgs({ options: { 'output-dir': { type: 'string' }, 'projects-file': { type: 'string' }, 'media-root': { type: 'string' } } });
const outputRoot = options['output-dir'] ? path.resolve(options['output-dir']) : root;
const mediaRoot = options['media-root'] ? path.resolve(options['media-root']) : root;
const data = JSON.parse(await readFile(path.join(root, 'data/artworks.json'), 'utf8'));
const texts = JSON.parse(await readFile(path.join(root, 'data/artist.json'), 'utf8'));
const artworkDetails = JSON.parse(await readFile(path.join(root, 'data/artwork-details.json'), 'utf8'));
const projectRecords = JSON.parse(await readFile(options['projects-file'] || path.join(root, 'data/projects.json'), 'utf8'));
const projects = await readyProjects(projectRecords, mediaRoot);
const listedProjects = projects.filter(project => project.section !== 'works');
const standaloneProjects = projects.filter(project => project.section === 'works');
const { artist, siteUrl, artworks } = data;
const standaloneEntries = [...standaloneProjects, ...artworks.filter(work => artworkDetails[work.id]?.standalone).map(work => ({ ...work, section: 'works' }))];
const categories = data.categories.filter(category => artworks.some(work => work.category === category.slug && (!artworkDetails[work.id]?.standalone || artworkDetails[work.id]?.navigationCategory === work.category)) || (category.slug === 'projects' && listedProjects.length));
const navigationItems = [...categories.filter(category => category.slug !== 'projects').map(category => ({ title: category.title, url: `/works/${category.slug}/`, category: category.slug })), ...standaloneEntries.filter(entry => !artworkDetails[entry.id]?.navigationCategory).map(entry => ({ title: entry.title, url: projectUrl(entry) })), ...categories.filter(category => category.slug === 'projects').map(category => ({ title: category.title, url: '/works/projects/', category: category.slug }))];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const workUrl = work => artworkUrl(work, artworkDetails);
for (const work of artworks) {
  const detail = artworkDetails[work.id];
  if (detail?.media) await readyProjects([{ ...detail.media, slug: work.slug, title: work.title, year: work.year, category: 'projects', status: 'ready', displayOrder: 0, descriptionEn: detail.story.en.join('\n\n'), descriptionRu: detail.story.ru.join('\n\n'), collaborators: [], videos: [], externalLinks: [] }], mediaRoot);
}
const categoryUrl = category => `/works/${category.slug}/`;
const local = (url, lang) => (lang === 'ru' ? '/ru' : '') + url;
const pages = [];
const ui = {
  en: { selected: 'Selected Artworks', all: 'View All Works', works: 'Works', statement: 'Artist Statement', bio: 'Bio', cv: 'CV', contact: 'Contact', menu: 'Menu', year: 'Year', medium: 'Medium', prev: 'Previous', next: 'Next', skip: 'Skip to content', location: 'Russia, Saint Petersburg', digital: 'Digital artwork', poster: 'Poster, print' },
  ru: { selected: 'Избранные работы', all: 'Все работы', works: 'Работы', statement: 'Artist Statement', bio: 'Биография', cv: 'CV', contact: 'Контакты', menu: 'Меню', year: 'Год', medium: 'Материал', prev: 'Предыдущая', next: 'Следующая', skip: 'К содержимому', location: 'Россия, Санкт-Петербург', digital: 'Цифровое искусство', poster: 'Постер, печать' }
};
if (new Set(artworks.map(workUrl)).size !== artworks.length) throw new Error('Duplicate artwork URL');
if (new Set([...artworks.map(workUrl), ...projects.map(projectUrl)]).size !== artworks.length + projects.length) throw new Error('Project URL conflicts with an artwork URL');
for (const work of artworks) {
  if (!data.categories.some(category => category.slug === work.category)) throw new Error(`Unknown category: ${work.category}`);
  if (!/^\d+(?:\.\d+)?% \d+(?:\.\d+)?%$/.test(work.objectPosition)) throw new Error(`Invalid crop position: ${work.id}`);
}

function navigation(current, lang, activeCategory = '') {
  const t = ui[lang];
  const link = (url, title) => `<a href="${local(url, lang)}"${current === url ? ' aria-current="page"' : ''}>${title}</a>`;
  return `<a class="skip-link" href="#main">${t.skip}</a>
<header class="site-sidebar">
  <a class="artist-brand" href="${local('/', lang)}" aria-label="GRGY — ${lang === 'ru' ? 'Главная' : 'Home'}"><span class="artist-name">GRGY</span></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" hidden>${t.menu} <span aria-hidden="true">+</span></button>
  <nav id="site-navigation" class="portfolio-navigation" aria-label="${lang === 'ru' ? 'Основная навигация' : 'Main navigation'}">
    <div class="artist-navigation">${link('/artist-statement/', t.statement)}${link('/bio/', t.bio)}${link('/cv/', t.cv)}</div>
    ${link('/contact/', t.contact)}
    <div class="works-navigation">
      <div class="works-heading">${link('/works/composition/', t.works)}<button class="works-toggle" type="button" aria-label="${lang === 'ru' ? 'Показать или скрыть категории' : 'Toggle work categories'}" aria-expanded="true" aria-controls="work-categories" hidden><span aria-hidden="true">−</span></button></div>
      <ul id="work-categories">${navigationItems.map(item => `<li><a href="${local(item.url, lang)}"${current === item.url ? ' aria-current="page"' : ''}${item.category && activeCategory === item.category ? ' class="active-category"' : ''}>${esc(item.title)}</a></li>`).join('')}</ul>
    </div>
    <div class="language-switch" aria-label="${lang === 'ru' ? 'Язык' : 'Language'}"><a href="${current}" lang="en" hreflang="en"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a><span aria-hidden="true">/</span><a href="${local(current, 'ru')}" lang="ru" hreflang="ru"${lang === 'ru' ? ' aria-current="true"' : ''}>RU</a></div>
  </nav>
</header>`;
}

function image(work, lang, detail = false, index = 0) {
  const base = `/images/artworks/optimized/${work.id}`;
  const alt = work[lang === 'ru' ? 'altRu' : 'altEn'] || `${work.title}, ${work.year} — ${work.medium} — ${artist}`;
  return `<img class="${detail ? 'artwork-full' : 'artwork-thumbnail'}" src="${base}-${detail ? '1920' : '960'}.webp" srcset="${base}-480.webp ${Math.min(480, work.width)}w, ${base}-960.webp ${Math.min(960, work.width)}w${work.width > 960 ? `, ${base}-1920.webp ${Math.min(1920, work.width)}w` : ''}" sizes="${detail ? '(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) calc(100vw - 300px), 1000px' : '(max-width: 480px) calc(100vw - 40px), (max-width: 760px) calc((100vw - 56px) / 2), (max-width: 1200px) calc((100vw - 330px) / 3), 380px'}" width="${work.width}" height="${work.height}" alt="${esc(alt)}" ${detail || index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async"${detail ? (work.file.startsWith('reworked-import/') ? ` style="max-width: ${work.width}px"` : '') : ` style="object-position: ${work.objectPosition}"`}>`;
}

function gallery(works, lang, includedProjects = []) {
  return `<div class="artwork-grid">${works.map((work, index) => `<figure class="artwork-card"><a href="${local(workUrl(work), lang)}">${image(work, lang, false, index)}<figcaption><span class="artwork-title">${esc(work.title)}</span>${work.year === null ? '' : `<span class="artwork-year">${work.year}</span>`}</figcaption></a></figure>`).join('\n')}${projectCards(includedProjects, lang)}</div>`;
}

// Approved copy is plain text with optional emphasis, never arbitrary HTML.
const prose = paragraphs => paragraphs.map(text => `<p>${esc(text).replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`).join('\n');
function artworkContext(detail, lang) {
  if (!detail) return '';
  const history = detail.history;
  const source = history?.source;
  if (source && !source.url.startsWith('https://')) throw new Error('An artwork history source must use HTTPS');
  return `<div class="artwork-context">${prose(detail.story[lang])}${history ? `<section class="artwork-history"><h2>${esc(localized(history.heading, lang))}</h2><p>${esc(localized(history.text, lang))}</p>${source ? `<p class="artwork-source"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(localized(source.label, lang))}</a></p>` : ''}</section>` : ''}</div>`;
}
function cvContent(lang) {
  const content = texts[lang];
  const sections = texts.cvSections.map(section => {
    const rows = section.entries.map(entry => {
      const text = entry.text[lang];
      const project = projects.find(project => project.id === entry.projectId);
      const source = texts.sources.find(source => source.id === entry.sourceId && source.status === 'verified');
      const url = project ? local(projectUrl(project), lang) : source?.url;
      const linkText = entry.linkText?.[lang];
      if (url && (!linkText || !text.startsWith(linkText))) throw new Error(`Invalid CV link text: ${entry.id} (${lang})`);
      if (source && !source.url.startsWith('https://')) throw new Error(`Invalid CV source URL: ${source.id}`);
      const body = url ? `<a href="${esc(url)}"${project ? '' : ' target="_blank" rel="noopener noreferrer"'}>${esc(linkText)}</a>${esc(text.slice(linkText.length))}` : esc(text);
      return `<div class="cv-row"><dt class="cv-year">${esc(entry.year)}</dt><dd>${body}</dd></div>`;
    }).join('\n');
    return `<section class="cv-section${section.id === 'collaborations' ? ' cv-projects' : ''}" aria-labelledby="cv-${section.id}"><h2 id="cv-${section.id}">${esc(section.title[lang])}</h2><dl class="cv-list">${rows}</dl></section>`;
  }).join('\n');
  return `<div class="text-page cv-document"><h1>CV</h1><div class="cv-header"><p class="cv-artist">${esc(artist)}</p><p>${esc(content.role)}<br>${esc(content.location)}</p></div>${sections}</div>`;
}

function bioPortrait(lang) {
  const portrait = texts.portrait;
  if (!portrait) return '';
  if (!portrait.src?.startsWith('/images/') || !portrait.alt?.[lang] || !portrait.width || !portrait.height) throw new Error('A portrait requires a local image path, bilingual alt text and actual dimensions');
  return `<figure class="artist-portrait"><img src="${esc(portrait.src)}" alt="${esc(portrait.alt[lang])}" width="${portrait.width}" height="${portrait.height}" decoding="async"></figure>`;
}

async function page(url, lang, { title, description, content, category = '', imagePath = '/images/artworks/optimized/1-1920.webp', imageAlt = `${artist} — First French Kiss, 2025`, type = 'website', noindex = false, extraHead = '', canonicalPath = url }) {
  const publicUrl = local(url, lang);
  const canonical = siteUrl + local(canonicalPath, lang);
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(artist)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '' : `<link rel="alternate" hreflang="en" href="${siteUrl}${url}">
<link rel="alternate" hreflang="ru" href="${siteUrl}${local(url, 'ru')}">
<link rel="alternate" hreflang="x-default" href="${siteUrl}${url}">`}
<meta property="og:type" content="${type}">
<meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}">
<meta property="og:locale:alternate" content="${lang === 'ru' ? 'en_US' : 'ru_RU'}">
<meta property="og:site_name" content="${esc(artist)}">
<meta property="og:title" content="${esc(title)} — ${esc(artist)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
${imagePath ? `<meta property="og:image" content="${siteUrl}${imagePath}">
<meta property="og:image:alt" content="${esc(imageAlt)}">` : ''}
<meta name="twitter:card" content="${imagePath ? 'summary_large_image' : 'summary'}">
${noindex ? '<meta name="robots" content="noindex, follow">' : ''}
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/portfolio.css">
<script src="/site-nav.js" defer></script>
${extraHead}
</head>
<body class="portfolio-site">
${navigation(noindex ? '/' : url, lang, category)}
<main id="main" class="portfolio-main" tabindex="-1">${content}</main>
</body>
</html>
`;
  const file = publicUrl.endsWith('/') ? path.join(outputRoot, publicUrl, 'index.html') : path.join(outputRoot, publicUrl);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  if (!noindex) pages.push({ url: publicUrl, alternate: url, lang });
}

for (const lang of ['en', 'ru']) {
  const t = ui[lang];
  const artistText = texts[lang];
  await page('/', lang, { title: t.selected, description: `${t.selected} — ${artist}. First French Kiss, Reworked, Big Face, Kloud, Composition.`, content: `<h1>${t.selected}</h1>${gallery(artworks.filter(work => work.selected), lang)}<p class="gallery-footer"><a class="text-link" href="${local('/works/', lang)}">${t.all}</a></p>` });
  await page('/works/', lang, { title: t.works, description: `${t.works} — ${artist}: ${categories.map(category => category.title).join(', ')}.`, content: `<h1>${t.works}</h1>${gallery(artworks, lang, standaloneProjects)}${listedProjects.length ? `<section class="all-works-projects"><h2>${projectsTitle(lang)}</h2>${gallery([], lang, listedProjects)}</section>` : ''}` });
  for (const category of categories) {
    const works = artworks.filter(work => work.category === category.slug && (!artworkDetails[work.id]?.standalone || artworkDetails[work.id]?.navigationCategory === work.category));
    if (!works.length) continue;
    await page(categoryUrl(category), lang, { title: category.title, description: `${category.title} — ${artist}.`, category: category.slug, content: `<h1>${esc(category.title)}</h1>${gallery(works, lang)}` });
  }
  for (const work of artworks) {
    const detail = artworkDetails[work.id];
    const displayTitle = localized(detail?.displayTitle, lang) || work.title;
    const detailDescription = detail ? detail.story[lang].join(' ') : `${work.title}${work.year === null ? '' : ` (${work.year})`}, ${work.medium}. ${work.sourceCategory} — ${artist}.`;
    const standalone = detail?.standalone && !detail.navigationCategory;
    const documentation = await documentationVideo(detail?.documentation?.video, lang, mediaRoot);
    const category = data.categories.find(category => category.slug === work.category);
    const siblings = standalone ? standaloneEntries : artworks.filter(other => other.category === work.category && (!artworkDetails[other.id]?.standalone || artworkDetails[other.id]?.navigationCategory === other.category));
    const index = siblings.findIndex(other => other.id === work.id);
    const related = (other, direction) => other ? `<a href="${local(standalone ? projectUrl(other) : workUrl(other), lang)}" rel="${direction}"><span>${direction === 'prev' ? t.prev : t.next}</span> ${esc(other.title)}</a>` : '<span></span>';
    const media = detail?.media;
    const original = media?.coverImage.src || `/images/artworks/originals/${work.file}`;
    const hero = media ? projectImage(media, media.coverImage, lang, { eager: true }).replace('class="project-image"', 'class="artwork-full"') : image({ ...work, title: displayTitle }, lang, true);
    const documentaryGallery = media ? `<div class="project-gallery artwork-documentation">${media.gallery.map(item => `<figure class="project-figure"><a href="${item.src}" aria-label="${lang === 'ru' ? 'Открыть оригинал' : 'Open original image'}">${projectImage(media, item, lang)}</a></figure>`).join('')}</div>` : '';
    const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'VisualArtwork', name: displayTitle, ...(work.year === null ? {} : { dateCreated: String(work.year) }), artMedium: work.medium, creator: { '@type': 'Person', name: artist }, image: siteUrl + original, url: siteUrl + local(workUrl(work), lang), ...(detail ? { description: detailDescription, contentLocation: { '@type': 'Place', name: localized(detail.location, lang) } } : {}) }).replace(/</g, '\\u003c');
    await page(workUrl(work), lang, {
      title: displayTitle + (work.year === null ? '' : ` (${work.year})`), description: detailDescription, category: standalone ? '' : category.slug,
      imagePath: media ? `${imageBase(media, media.coverImage)}-1920.webp` : `/images/artworks/optimized/${work.id}-1920.webp`, imageAlt: `${displayTitle}${work.year === null ? '' : `, ${work.year}`} — ${artist}`, type: 'article', extraHead: `<script type="application/ld+json">${schema}</script>${documentation ? '<link rel="stylesheet" href="/documentation-video.css"><script src="/documentation-video.js" defer></script>' : ''}`,
      content: `<article class="artwork-detail"><a class="back-link" href="${local(standalone ? '/works/' : categoryUrl(category), lang)}">← ${standalone ? (lang === 'ru' ? 'Назад к работам' : 'Back to Works') : esc(category.title)}</a><figure class="artwork-figure"><a class="original-image" href="${original}" aria-label="${lang === 'ru' ? 'Открыть оригинал' : 'Open original image'}: ${esc(displayTitle)}">${hero}</a><figcaption class="artwork-information"><h1>${esc(displayTitle)}</h1><dl>${work.year === null ? '' : `<div><dt>${t.year}</dt><dd>${work.year}</dd></div>`}<div><dt>${t.medium}</dt><dd>${esc(lang === 'ru' ? (work.medium === 'Digital artwork' ? t.digital : t.poster) : work.medium)}</dd></div>${detail?.location ? `<div><dt>${lang === 'ru' ? 'Место' : 'Location'}</dt><dd>${esc(localized(detail.location, lang))}</dd></div>` : ''}</dl></figcaption></figure>${artworkContext(detail, lang)}${documentaryGallery}${documentation}<nav class="artwork-pagination" aria-label="${standalone ? t.works : esc(category.title)}">${related(siblings[index - 1], 'prev')}${related(siblings[index + 1], 'next')}</nav></article>`
    });
  }
  if (listedProjects.length) {
    const illustratedProject = listedProjects.find(project => project.coverImage);
    await page('/works/projects/', lang, { title: projectsTitle(lang), description: `${projectsTitle(lang)} — ${artist}.`, category: 'projects', content: `<section class="project-index"><h1>${projectsTitle(lang)}</h1>${gallery([], lang, listedProjects)}</section>`, imagePath: illustratedProject ? `${imageBase(illustratedProject, illustratedProject.coverImage)}-1920.webp` : null, imageAlt: illustratedProject?.coverImage[lang === 'ru' ? 'altRu' : 'altEn'] || '' });
  }
  for (const project of projects) {
      const description = project[lang === 'ru' ? 'descriptionRu' : 'descriptionEn'];
      const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, ...(project.year === null ? {} : { dateCreated: String(project.year) }), creator: { '@type': 'Person', name: artist }, description, ...(project.coverImage ? { image: siteUrl + project.coverImage.src } : {}), url: siteUrl + local(projectUrl(project), lang) }).replace(/</g, '\\u003c');
      await page(projectUrl(project), lang, { title: project.title + (project.year === null ? '' : ` (${project.year})`), description, category: project.section === 'works' ? '' : 'projects', imagePath: project.coverImage ? `${imageBase(project, project.coverImage)}-1920.webp` : null, imageAlt: project.coverImage?.[lang === 'ru' ? 'altRu' : 'altEn'] || '', type: 'article', extraHead: `<script type="application/ld+json">${schema}</script>`, content: projectContent(project, project.section === 'works' ? standaloneEntries : listedProjects, lang) });
  }
  await page('/bio/', lang, { title: t.bio, description: artistText.metaDescriptions.bio, content: `<div class="text-page artist-prose"><h1>${t.bio}</h1>${bioPortrait(lang)}${prose(artistText.bio)}</div>` });
  await page('/cv/', lang, { title: t.cv, description: artistText.metaDescriptions.cv, content: cvContent(lang) });
  await page('/artist-statement/', lang, { title: t.statement, description: artistText.metaDescriptions.statement, content: `<div class="text-page artist-prose"><h1>${t.statement}</h1>${prose(artistText.statement)}</div>` });
  await page('/contact/', lang, { title: t.contact, description: `${t.contact} — ${artist}.`, content: `<div class="text-page"><h1>${t.contact}</h1><p><a href="mailto:grgyone@gmail.com">grgyone@gmail.com</a></p><ul class="contact-links">${[['https://instagram.com/grgyone', 'Instagram'], ['https://x.com/grgyone', 'X'], ['https://www.threads.com/@grgyone', 'Threads'], ['https://grgy.tumblr.com', 'Tumblr'], ['https://www.pinterest.com/grgyone', 'Pinterest'], ['https://vk.com/newgrgytimes', 'VK'], ['https://t.me/newgrgytimes', 'Telegram']].map(([href, title]) => `<li><a href="${href}" target="_blank" rel="noopener noreferrer">${title}</a></li>`).join('')}</ul></div>` });
  await page('/free/', lang, { title: 'FREE', description: `${artist} — ${lang === 'ru' ? 'Бесплатные материалы для личного использования.' : 'Free downloads for personal use.'}`, content: `<div class="text-page"><h1>FREE</h1><p>${lang === 'ru' ? 'Бесплатное скачивание.<br>Только для личного использования.<br>Не для продажи, распространения или коммерческого использования.' : 'Free download.<br>Personal use only.<br>No resale, no redistribution, no commercial use.'}</p></div><div class="free-grid">${['color', 'bw'].map(color => `<figure class="free-item"><img src="/free/assets/grgy_face_${color}.png" alt="GRGY Face ${color === 'bw' ? 'BW' : 'Color'}" class="free-preview" loading="lazy"><figcaption><a href="/free/assets/grgy_face_${color}.pdf" class="text-link" download>${lang === 'ru' ? 'СКАЧАТЬ' : 'DOWNLOAD'} (A3, PDF)</a></figcaption></figure>`).join('')}</div>` });
}

// Preserve public incoming links after moving works or retiring a project page.
for (const lang of ['en', 'ru']) {
  const redirects = [
    ...projects.filter(project => project.section === 'works').map(project => [`/works/projects/${project.slug}/`, projectUrl(project)]),
    ...projectRecords.filter(project => project.retired).map(project => [`/works/projects/${project.slug}/`, '/works/projects/']),
    ...artworks.filter(work => artworkDetails[work.id]?.standalone).map(work => [`/works/${work.category}/${work.slug}/`, workUrl(work)])
  ];
  for (const [from, to] of redirects) await page(from, lang, {
    title: 'GRGY', description: `${artist}.`, noindex: true, canonicalPath: to,
    extraHead: `<meta http-equiv="refresh" content="0; url=${local(to, lang)}">`,
    content: `<p><a href="${local(to, lang)}">${lang === 'ru' ? 'Перейти к работе' : 'Continue'} →</a></p>`
  });
}

// Preserve incoming URLs while retiring every public commerce interface.
for (const [url, destination] of [['/about.html', '/contact/'], ['/portfolio.html', '/works/'], ...['store.html', 'product.html', 'cart_items.html', ...Array.from({ length: 8 }, (_, i) => `items_${i + 1}.html`)].map(file => ['/' + file, '/works/'])]) {
    await page(url, 'en', { title: 'GRGY', description: `${artist}.`, noindex: true, canonicalPath: destination, extraHead: `<meta http-equiv="refresh" content="0; url=${destination}">`, content: `<p><a href="${destination}">Continue to ${destination === '/contact/' ? 'Contact' : 'Works'}</a></p>` });
}
await page('/404.html', 'en', { title: 'Page not found', description: `Artworks by ${artist}.`, noindex: true, content: '<div class="text-page"><h1>Page not found</h1><p><a class="text-link" href="/">Selected Artworks</a></p></div>' });
await writeFile(path.join(outputRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pages.map(page => `  <url><loc>${siteUrl}${esc(page.url)}</loc><xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${page.alternate}"/><xhtml:link rel="alternate" hreflang="ru" href="${siteUrl}${local(page.alternate, 'ru')}"/></url>`).join('\n')}\n</urlset>\n`);
await writeFile(path.join(outputRoot, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /_archive/\nDisallow: /node_modules/\nDisallow: /tests/\nDisallow: /scripts/\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Built ${pages.length} public pages in English and Russian, legacy redirects, sitemap and robots.txt.`);
