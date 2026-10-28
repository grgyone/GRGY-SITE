// No automatic playback. Reduced-motion users can play manually, without looping.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-motion-loop]').forEach(video => {
  const update = () => {
    video.loop = !preference.matches;
    if (preference.matches) video.pause();
  };
  preference.addEventListener('change', update);
  update();
});
