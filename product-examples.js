/* Только галереи карточек #portfolio главной. Без модалок, запросов и библиотек. */
(() => {
  'use strict';
  const root = document.querySelector('.home-page .product-examples');
  if (!root || root.dataset.productGalleryReady === 'true') return;
  root.dataset.productGalleryReady = 'true';

  const read = image => ({
    src: image.getAttribute('src'), alt: image.alt,
    width: image.getAttribute('width'), height: image.getAttribute('height'),
    position: image.style.objectPosition || '50% 50%'
  });
  const write = (image, data) => {
    for (const name of ['src', 'alt', 'width', 'height']) image.setAttribute(name, data[name]);
    image.style.objectPosition = data.position;
  };

  root.querySelectorAll('.product-gallery').forEach(gallery => {
    const main = gallery.querySelector('.product-main');
    const buttons = [...gallery.querySelectorAll('.product-thumbnail')];
    const status = gallery.querySelector('.product-gallery-status');
    buttons.forEach(button => button.addEventListener('click', () => {
      const thumb = button.querySelector('img');
      const incoming = read(thumb), outgoing = read(main);
      // Обмен, а не копирование: главный кадр никогда не дублируется в миниатюрах.
      write(main, incoming);
      write(thumb, outgoing);
      buttons.forEach(item => item.classList.toggle('is-active', item === button));
      button.setAttribute('aria-label', `Показать крупно: ${outgoing.alt.replace(/^Иллюстрация: /, '')}`);
      status.textContent = `Основное изображение: ${incoming.alt.replace(/^Иллюстрация: /, '')}`;
    }));
  });
})();
