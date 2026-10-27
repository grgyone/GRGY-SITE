document.querySelectorAll('[data-documentation-src]').forEach(button => {
  button.addEventListener('click', () => {
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.width = Number(button.dataset.width);
    video.height = Number(button.dataset.height);
    video.poster = button.dataset.poster;
    video.src = button.dataset.documentationSrc;
    video.setAttribute('aria-label', button.getAttribute('aria-label'));
    button.replaceWith(video);
    video.focus();
    video.play().catch(() => { /* Native controls remain available after a playback error. */ });
  }, { once: true });
});
