'use strict';

// Дополнительный барьер для будущего обработчика. Текущая отправка отключена в v3.js.
// Обработчик после подключения обязан также проверять согласие на сервере.
const consentForm = document.querySelector('.contact-form');
if (consentForm) {
  const agreement = consentForm.querySelector('[name="personal_data_consent"]');
  consentForm.addEventListener('submit', event => {
    if (!agreement.checked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      agreement.reportValidity();
    }
  }, { capture: true });
}

// Та же мобильная навигация на самостоятельных страницах документов.
if (document.body.classList.contains('legal-page')) {
  const legalMenuButton = document.querySelector('.menu-button');
  const legalNavigation = document.querySelector('#site-nav');
  function closeLegalMenu(restoreFocus = false) {
    legalNavigation.classList.remove('open');
    legalMenuButton.setAttribute('aria-expanded', 'false');
    legalMenuButton.setAttribute('aria-label', 'Открыть меню');
    legalMenuButton.textContent = 'Меню ☰';
    if (restoreFocus) legalMenuButton.focus();
  }
  legalMenuButton.addEventListener('click', () => {
    const open = !legalNavigation.classList.contains('open');
    legalNavigation.classList.toggle('open', open);
    legalMenuButton.setAttribute('aria-expanded', String(open));
    legalMenuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    legalMenuButton.textContent = open ? 'Закрыть ×' : 'Меню ☰';
  });
  legalNavigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeLegalMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && legalNavigation.classList.contains('open')) closeLegalMenu(true); });
  document.addEventListener('click', event => { if (!legalNavigation.contains(event.target) && !legalMenuButton.contains(event.target)) closeLegalMenu(); });
  document.addEventListener('focusin', event => { if (!legalNavigation.contains(event.target) && !legalMenuButton.contains(event.target)) closeLegalMenu(); });
  window.matchMedia('(max-width:740px)').addEventListener('change', () => closeLegalMenu());
}
