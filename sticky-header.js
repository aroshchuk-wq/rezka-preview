(() => {
  'use strict';
  const header = document.querySelector('.hero .header');
  const notice = document.querySelector('.notice');
  if (!header || document.querySelector('.sticky-header-bar')) return;

  // Перемещаем тот же узел, не клонируем меню и не дублируем его обработчики.
  // Слот оставляет ровно прежнюю высоту, поэтому hero не прыгает.
  const slot = document.createElement('div');
  slot.className = 'sticky-header-slot';
  slot.setAttribute('aria-hidden', 'true');
  header.before(slot);
  const bar = document.createElement('div');
  bar.className = 'sticky-header-bar';
  const shell = document.createElement('div');
  shell.className = 'shell';
  shell.append(header);
  bar.append(shell);
  document.body.insertBefore(bar, document.querySelector('main'));
  document.body.classList.add('has-sticky-header');

  let scheduled = false;
  function updatePosition() {
    scheduled = false;
    const top = Math.max(0, notice?.getBoundingClientRect().bottom || 0);
    document.documentElement.style.setProperty('--sticky-header-top', `${top}px`);
    document.documentElement.style.setProperty('--sticky-header-height', `${header.getBoundingClientRect().height}px`);
    bar.classList.toggle('is-scrolled', window.scrollY > 1);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updatePosition); }
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  new ResizeObserver(schedule).observe(header);
  if (notice) new ResizeObserver(schedule).observe(notice);
  updatePosition();
})();
