import { checkAsset, localized } from './projects.mjs';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function documentationVideo(video, lang, root) {
  if (!video) return '';
  for (const field of ['src', 'poster']) {
    if (typeof video[field] !== 'string') throw new Error(`Documentation needs ${field}`);
    if (video[field].startsWith('/')) await checkAsset(root, video[field], 'Documentation');
    else if (new URL(video[field]).protocol !== 'https:') throw new Error('Documentation requires HTTPS');
  }
  if (!new URL(video.src, 'https://grgyone.com').pathname.toLowerCase().endsWith('.mp4')) throw new Error('Documentation requires MP4');
  if (![video.width,video.height].every(n => Number.isInteger(n) && n > 0)) throw new Error('Documentation requires dimensions');
  const heading = lang === 'ru' ? '3D-документация' : '3D Documentation';
  const play = lang === 'ru' ? 'Воспроизвести видеооблёт 3D-скана' : 'Play 3D scan fly-through';
  return `<section class="artwork-documentation" aria-labelledby="documentation-title"><h2 id="documentation-title">${heading}</h2><div class="documentation-player"><button type="button" data-documentation-src="${esc(video.src)}" data-poster="${esc(video.poster)}" data-width="${video.width}" data-height="${video.height}" aria-label="${play}"><img src="${esc(video.poster)}" width="${video.width}" height="${video.height}" alt="${esc(localized(video.alt, lang) || heading)}" loading="lazy" decoding="async"><span>${play} ▶</span></button></div></section>`;
}
