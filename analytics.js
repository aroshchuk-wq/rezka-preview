/* i-cut.pro — отложенная интеграция Яндекс Метрики 113769632.
 * Официальный загрузчик и API: https://yandex.ru/support/metrica/ru/code/counter-initialize
 * Внешний код создаётся только после всех проверок активации.
 */
(() => {
  'use strict';
  if (window.ICutAnalytics) return; // Одна установка обработчиков/счётчика на документ.

  const COUNTER_ID = 113769632;
  const TAG_URL = 'https://mc.yandex.ru/metrika/tag.js';
  const config = window.ICutAnalyticsConfig;
  const goals = new Set(['form_success', 'click_telegram', 'click_whatsapp', 'click_max', 'click_phone']);
  let initialized = false;
  let ready = false;

  function canActivate() {
    if (!config || config.enabled !== true || config.environment !== 'production') return false;
    const { protocol, hostname, origin, pathname } = window.location;
    if (protocol !== 'https:') return false;
    // Локальные адреса, IP, технические домены и файлы прототипов не разрешаются даже флагом.
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.includes(':') || /^\d+(\.\d+){3}$/.test(hostname)) return false;
    if (/(^|[.-])(dev|test|staging|stage|preview|localhost)([.-]|$)/i.test(hostname)) return false;
    if (/(^|\/)(index-v\d+|previous|v\d+-preview)\.html$/i.test(pathname) || /(^|\/)(test|preview|staging|i-cut-v3-design)(\/|$)/i.test(pathname)) return false;
    if (!Array.isArray(config.productionOrigins) || !config.productionOrigins.includes(origin)) return false;
    if (!Array.isArray(config.productionPaths) || !config.productionPaths.includes(pathname)) return false;
    const robots = document.querySelector('meta[name="robots"]');
    return !robots || !/\bnoindex\b/i.test(robots.content);
  }

  // Только ID цели, без номера телефона, URL контакта, текста заявки или иных параметров.
  function reachGoal(goalId) {
    if (!canActivate() || !initialized || !ready || !goals.has(goalId) || typeof window.ym !== 'function') return false;
    try {
      window.ym(COUNTER_ID, 'reachGoal', goalId);
      return true;
    } catch {
      return false; // Аналитика никогда не мешает работе сайта.
    }
  }
  window.ICutAnalytics = Object.freeze({ reachGoal });
  document.documentElement.dataset.metricaStatus = 'disabled';
  if (!canActivate()) return; // В том числе не создаём window.ym, script, pixel или preconnect.

  // Не добавляем второй загрузчик поверх уже вставленного сторонним кодом.
  if ([...document.scripts].some(script => script.src && script.src.split('?')[0] === TAG_URL)) return;
  document.addEventListener(`yacounter${COUNTER_ID}inited`, () => { ready = true; document.documentElement.dataset.metricaStatus = 'ready'; }, { once: true });

  document.documentElement.dataset.metricaStatus = 'loading';
  // Официальная асинхронная очередь загрузчика Яндекса, внутри закрытого gate.
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    k.onerror = () => { document.documentElement.dataset.metricaStatus = 'load-error'; };
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', TAG_URL, 'ym');

  initialized = true;
  window.ym(COUNTER_ID, 'init', {
    webvisor: false,
    clickmap: false,
    ecommerce: false,
    trackLinks: false,
    trackHash: false,
    accurateTrackBounce: false,
    disableYtm: true,
    triggerEvent: true
  });

  function goalForLink(anchor) {
    const href = anchor.getAttribute('href');
    if (!href || anchor.hasAttribute('download') || anchor.closest('[aria-disabled="true"], [disabled], [hidden], [inert]')) return null;
    let url;
    try { url = new URL(href, window.location.href); } catch { return null; }
    if (url.protocol === 'tel:') {
      return (url.pathname.match(/\d/g) || []).length >= 5 ? 'click_phone' : null;
    }
    if (url.protocol === 'tg:' && url.searchParams.get('domain')) return 'click_telegram';
    if (url.protocol === 'whatsapp:' && url.searchParams.get('phone')) return 'click_whatsapp';
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const hasContactPath = url.pathname.replace(/\//g, '').length > 0;
    if (['t.me', 'telegram.me'].includes(host) && hasContactPath) return 'click_telegram';
    if ((host === 'wa.me' && hasContactPath) || (['api.whatsapp.com', 'web.whatsapp.com'].includes(host) && url.pathname === '/send' && url.searchParams.get('phone'))) return 'click_whatsapp';
    if (host === 'max.ru' && hasContactPath) return 'click_max';
    return null;
  }

  // Один делегированный обработчик: вложенные иконки не создают дополнительных событий.
  // Ссылки работают штатно: не отменяем переход и не ждём ответа Метрики.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0) return;
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor) return;
    const goal = goalForLink(anchor);
    if (goal) reachGoal(goal);
  });

  // form_success намеренно НЕ привязан к submit, click, change или валидации.
  // Будущий приёмник вызывает ICutAnalytics.reachGoal('form_success') только после
  // подтверждённого сервером принятия заявки, один раз на принятую заявку.
})();
