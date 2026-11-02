// Дополнения только главной страницы; общий код слайдеров и внутренних страниц сохранён.
(() => {
  'use strict';
  const form = document.querySelector('.home-page .contact-form');
  if (!form) return;
  // Выполняется после общего обработчика: тип определяется карточкой, а не её порядком.
  document.querySelectorAll('.service-card .round-link[data-service-type]').forEach(link => {
    link.addEventListener('click', () => { form.elements.type.value = link.dataset.serviceType; });
  });
})();
