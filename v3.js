'use strict';

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#site-nav');
const mobileLayout = window.matchMedia('(max-width: 740px)');
const form = document.querySelector('.contact-form');
const choices = [...document.querySelectorAll('.contact-choice')];
const quickContact = document.querySelector('.quick-contact');
const quickPanel = document.querySelector('#quick-panel');
const quickToggle = document.querySelector('.quick-toggle');
const quickClose = document.querySelector('.quick-close');

function setNavigation(open, restoreFocus = false) {
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menuButton.textContent = open ? 'Закрыть ×' : 'Меню ☰';
  if (restoreFocus) menuButton.focus();
}

function setQuickContact(open, restoreFocus = false) {
  quickPanel.hidden = !open;
  quickToggle.setAttribute('aria-expanded', String(open));
  quickToggle.setAttribute('aria-label', open ? 'Закрыть меню связи' : 'Открыть меню связи');
  if (restoreFocus) quickToggle.focus();
}

function selectMethod(method) {
  choices.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.method === method));
  });
  form.elements.preferred_method.value = method;
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  setQuickContact(false);
  setNavigation(open);
});
navigation.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavigation(false));
});
mobileLayout.addEventListener('change', () => setNavigation(false));
choices.forEach(button => {
  button.addEventListener('click', () => selectMethod(button.dataset.method));
});

quickToggle.addEventListener('click', () => {
  setNavigation(false);
  setQuickContact(quickPanel.hidden);
});
quickClose.addEventListener('click', () => setQuickContact(false, true));
quickPanel.querySelectorAll('[data-contact-method]').forEach(link => {
  link.addEventListener('click', () => {
    selectMethod(link.dataset.contactMethod);
    setQuickContact(false);
    form.querySelector('[name="contact"]').focus({ preventScroll: true });
  });
});

document.querySelectorAll('[data-route]').forEach(link => {
  link.addEventListener('click', () => {
    form.elements.starting_point.value = link.dataset.route;
    const routeStatus = form.querySelector('.route-selection');
    routeStatus.textContent = link.dataset.route === 'ready'
      ? 'Сценарий: готовый макет или чертёж'
      : 'Сценарий: идея, эскиз или фотография';
    routeStatus.hidden = false;
    // Сохраняем уже введённые значения: выбор сценария не сбрасывает форму.
  });
});
const serviceTypes = ['laser', 'milling', 'plotter'];
document.querySelectorAll('.service-card .round-link').forEach((link, index) => {
  link.addEventListener('click', () => { form.elements.type.value = serviceTypes[index]; });
});

// Прототип не отправляет данные ни по кнопке, ни по Enter в поле.
form.addEventListener('submit', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!quickPanel.hidden) setQuickContact(false, true);
  if (menuButton.getAttribute('aria-expanded') === 'true') setNavigation(false, true);
});
document.addEventListener('click', event => {
  if (!quickContact.contains(event.target)) setQuickContact(false);
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setNavigation(false);
});
document.addEventListener('focusin', event => {
  if (!quickContact.contains(event.target)) setQuickContact(false);
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setNavigation(false);
});

// Нативные слайдеры: все карточки остаются в исходном HTML.
const sliderLayout = window.matchMedia('(max-width: 767px)');
const reduceSliderMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.mobile-slider').forEach(track => {
  const cards = [...track.children];
  const controls = document.querySelector(`[data-slider-controls="${track.id}"]`);
  const previous = controls.querySelector('.slider-prev');
  const next = controls.querySelector('.slider-next');
  const position = controls.querySelector('.slider-position');
  let current = 0;
  let scheduled = false;

  function targetLeft(card) {
    const left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    return Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
  }
  function update() {
    scheduled = false;
    if (!sliderLayout.matches) return;
    const distances = cards.map(card => Math.abs(targetLeft(card) - track.scrollLeft));
    current = distances.indexOf(Math.min(...distances));
    const text = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    if (position.textContent !== text) position.textContent = text;
    previous.setAttribute('aria-disabled', String(current === 0));
    next.setAttribute('aria-disabled', String(current === cards.length - 1));
  }
  function goTo(index) {
    if (!sliderLayout.matches) return;
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    track.scrollTo({left: targetLeft(cards[clamped]), behavior: reduceSliderMotion.matches ? 'instant' : 'smooth'});
  }
  function configure() {
    if (sliderLayout.matches) {
      track.tabIndex = 0;
      track.setAttribute('role', 'region');
      track.setAttribute('aria-roledescription', 'карусель');
      track.setAttribute('aria-label', track.dataset.sliderLabel);
      track.setAttribute('aria-describedby', `${track.id}-help`);
      cards.forEach((card, index) => {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', `${index + 1} из ${cards.length}`);
      });
      update();
    } else {
      ['tabindex', 'role', 'aria-roledescription', 'aria-label', 'aria-describedby'].forEach(name => track.removeAttribute(name));
      cards.forEach(card => {card.removeAttribute('role');card.removeAttribute('aria-label');});
    }
  }
  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  track.addEventListener('keydown', event => {
    if (!sliderLayout.matches || event.target !== track) return;
    const index = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1}[event.key];
    if (index === undefined) return;
    event.preventDefault();
    goTo(index);
  });
  track.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, {passive: true});
  track.addEventListener('focusin', event => {
    const index = cards.findIndex(card => card.contains(event.target));
    if (index !== -1) goTo(index);
  });
  new ResizeObserver(update).observe(track);
  sliderLayout.addEventListener('change', configure);
  configure();
});
