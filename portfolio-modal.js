(() => {
  'use strict';
  if (document.querySelector('#portfolio-dialog')) return;
  const projects = Array.isArray(window.ICutPortfolioProjects) ? window.ICutPortfolioProjects : [];
  const showDemo = window.ICutPortfolioConfig?.showDemoProjects === true;
  const labels = {laser:'Лазерная резка', milling:'Фрезерная резка ЧПУ', plotter:'Плоттерная резка'};
  const byId = new Map(projects.filter(p => p && labels[p.technology] && (p.isDemo ? showDemo : p.confirmed === true)).map(p => [p.id, p]));
  document.querySelectorAll('[data-portfolio-card]').forEach(card => {
    card.hidden = !byId.has(card.dataset.portfolioCard);
  });
  document.querySelectorAll('[data-demo-portfolio]').forEach(section => {
    const hasCards = [...section.querySelectorAll('[data-portfolio-card]')].some(card => !card.hidden);
    section.hidden = !hasCards;
    if (!hasCards) document.querySelectorAll(`a[href="#${section.id}"],a[href="index.html#${section.id}"],a[href^="index.html?"][href$="#${section.id}"]`).forEach(link => { link.hidden = true; });
  });
  if (!byId.size) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'portfolio-dialog'; dialog.className = 'pf-dialog';
  dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pf-title');
  // Только постоянная разметка компонента; данные ниже вставляются через textContent.
  dialog.innerHTML = `<header class="pf-toolbar"><span class="pf-toolbar-label">Просмотр примера</span><button class="pf-close" type="button" aria-label="Закрыть пример">×</button></header>
    <div class="pf-layout"><section class="pf-media" aria-label="Изображения проекта"><p class="pf-gallery-note"></p><div class="pf-track" tabindex="0" role="region" aria-label="Галерея изображений, используйте стрелки влево и вправо"></div><div class="pf-navigation"><span class="pf-count" role="status" aria-live="polite" aria-atomic="true"></span><div class="pf-arrows"><button type="button" class="pf-arrow pf-prev" aria-label="Предыдущее изображение">←</button><button type="button" class="pf-arrow pf-next" aria-label="Следующее изображение">→</button></div></div><div class="pf-thumbs" role="group" aria-label="Выбор изображения"></div><div class="pf-empty" hidden><strong>Фотографии ещё не переданы</strong><p>Здесь появятся подтверждённые изображения проекта. Сейчас это демонстрационный пример интерфейса.</p></div></section>
    <section class="pf-info" aria-label="Описание проекта"><span class="pf-demo-label">Демонстрационный пример</span><h2 id="pf-title"></h2><p class="pf-tech"></p><p class="pf-warning" id="pf-warning">Это локальная демонстрация интерфейса, а не выполненный заказ i-cut.pro. Реальные данные проекта пока не предоставлены.</p><div class="pf-task-block"><h3>Описание задачи</h3><p class="pf-description" id="pf-description"></p></div><div class="pf-solution-block" hidden><h3>Выполненные работы</h3><p class="pf-solution"></p></div><dl class="pf-facts"></dl><button class="btn btn-orange pf-similar" type="button">Рассчитать похожий заказ <span aria-hidden="true">↗</span></button><p class="pf-disclaimer">Переход к форме расчёта. Отправка заявки пока не подключена.</p></section></div>`;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const track = $('.pf-track'), thumbs = $('.pf-thumbs'), previous = $('.pf-prev'), next = $('.pf-next');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = null, images = [], index = 0, trigger = null, savedScroll = 0, savedBodyStyle = null;
  let goToForm = false, backdropDown = false, scheduled = false;
  const present = value => value !== null && value !== undefined && String(value).trim() !== '';

  function localImage(src) {
    if (typeof src !== 'string') return null;
    try {
      const url = new URL(src, location.href);
      return url.origin === location.origin && /\/assets\//.test(url.pathname) && ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function update() {
    scheduled = false;
    if (!images.length) return;
    index = Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / Math.max(track.clientWidth, 1))));
    $('.pf-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
    previous.disabled = index === 0; next.disabled = index === images.length - 1;
    [...thumbs.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function go(nextIndex) {
    if (!images.length) return;
    const target = Math.max(0, Math.min(images.length - 1, nextIndex));
    track.scrollTo({left: target * track.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  function fact(label, value) {
    if (!present(value)) return;
    const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label; dd.textContent = String(value); row.append(dt, dd); $('.pf-facts').append(row);
  }
  function render(project) {
    current = project; index = 0;
    $('#pf-title').textContent = project.title;
    $('.pf-tech').textContent = labels[project.technology];
    $('.pf-demo-label').hidden = !project.isDemo; $('.pf-warning').hidden = !project.isDemo;
    dialog.setAttribute('aria-describedby', project.isDemo ? 'pf-warning' : 'pf-description');
    $('.pf-description').textContent = project.description || '';
    $('.pf-task-block').hidden = !present(project.description);
    const confirmed = project.confirmed === true && project.isDemo !== true;
    $('.pf-solution-block').hidden = !confirmed || !present(project.solution);
    $('.pf-solution').textContent = confirmed ? project.solution || '' : '';
    $('.pf-facts').replaceChildren();
    if (confirmed) fact('Материал', project.material);
    // Технология известна из направления карточки, в том числе в демо.
    fact('Технология', labels[project.technology]);
    if (confirmed) {
      fact('Тираж', project.quantity);
      fact('Срок изготовления', project.deadline); fact('Стоимость', project.price);
    }
    $('.pf-facts').hidden = !$('.pf-facts').children.length;
    track.replaceChildren(); thumbs.replaceChildren();
    images = (Array.isArray(project.images) ? project.images : []).map((src, i) => ({src:localImage(src), alt:Array.isArray(project.imageAlt) ? project.imageAlt[i] : project.imageAlt})).filter(image => image.src);
    images.forEach((item, i) => {
      const figure = document.createElement('figure'), image = document.createElement('img'), caption = document.createElement('figcaption');
      figure.className = 'pf-slide'; image.src = item.src; image.alt = item.alt || `${project.title}: изображение ${i + 1}`;
      image.decoding = 'async'; image.draggable = false;
      caption.textContent = project.isDemo ? `Условная схема ${i + 1}. Не фотография выполненного заказа.` : `${i + 1} / ${images.length}`;
      figure.append(image, caption); track.append(figure);
      const button = document.createElement('button'), thumb = document.createElement('img');
      button.type = 'button'; button.className = 'pf-thumb'; button.setAttribute('aria-label', `Показать изображение ${i + 1}`);
      thumb.src = item.src; thumb.alt = ''; button.append(thumb); button.addEventListener('click', () => go(i)); thumbs.append(button);
    });
    track.hidden = !images.length; $('.pf-navigation').hidden = !images.length; thumbs.hidden = !images.length;
    $('.pf-arrows').hidden = images.length < 2; $('.pf-empty').hidden = images.length > 0;
    $('.pf-empty p').textContent = project.isDemo
      ? 'Здесь появятся подтверждённые изображения проекта. Сейчас это демонстрационный пример интерфейса.'
      : 'Изображения этого проекта пока не добавлены.';
    $('.pf-gallery-note').textContent = project.isDemo ? 'Условные схемы для проверки галереи. Фотографии реальных работ ещё не получены.' : 'Фотографии проекта';
  }
  function open(project, button) {
    if (dialog.open) return;
    trigger = button; goToForm = false; render(project);
    savedScroll = window.scrollY; savedBodyStyle = document.body.getAttribute('style');
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, {position:'fixed', top:`-${savedScroll}px`, left:'0', right:'0', width:'100%', paddingRight:`${gutter}px`});
    dialog.showModal(); dialog.scrollTop = 0; track.scrollTo({left:0, behavior:'instant'}); update(); $('.pf-close').focus({preventScroll:true});
  }
  function close() { if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => {
    const technology = current?.technology;
    if (savedBodyStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', savedBodyStyle);
    window.scrollTo({top:savedScroll, behavior:'instant'});
    if (goToForm) {
      const form = document.querySelector('.contact-form'), section = document.querySelector('#contact');
      if (form?.elements.type && labels[technology]) form.elements.type.value = technology;
      const heading = section?.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
      section?.scrollIntoView({block:'start', behavior:reduced.matches ? 'instant' : 'smooth'});
    } else if (trigger?.isConnected) trigger.focus({preventScroll:true});
    goToForm = false;
  });
  $('.pf-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => {event.preventDefault(); close();});
  const outside = event => {const r = dialog.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;};
  dialog.addEventListener('pointerdown', event => {backdropDown = event.target === dialog && outside(event);});
  dialog.addEventListener('click', event => {if (backdropDown && event.target === dialog && outside(event)) close(); backdropDown = false;});
  $('.pf-similar').addEventListener('click', () => {goToForm = true; close();});
  previous.addEventListener('click', () => go(index - 1)); next.addEventListener('click', () => go(index + 1));
  track.addEventListener('scroll', () => {if (!scheduled) {scheduled = true; requestAnimationFrame(update);}}, {passive:true});
  new ResizeObserver(() => {if (dialog.open && images.length) {track.scrollTo({left:index * track.clientWidth, behavior:'instant'}); update();}}).observe(track);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1));}
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length && !el.closest('[hidden]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  });
  document.querySelectorAll('[data-portfolio-open]').forEach(button => {
    const project = byId.get(button.dataset.portfolioOpen);
    if (project) button.addEventListener('click', () => open(project, button));
  });
})();
