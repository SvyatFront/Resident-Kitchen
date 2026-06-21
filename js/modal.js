// modal.js - Gallery lightbox

export function initLightbox() {
  const lightbox = document.querySelector('#lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const lightboxCaption = lightbox.querySelector('.lightbox__caption');
  const closeBtn = lightbox.querySelector('.lightbox__close');

  // Open on gallery item click
  document.querySelectorAll('.gallery__grid-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery__grid-title');
      if (!img) return;

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxCaption && title) lightboxCaption.textContent = title.textContent;

      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}
