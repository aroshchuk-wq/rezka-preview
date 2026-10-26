'use strict';

// Единая точка активации. Менять только после согласования публичного сбора данных.
window.ICutAnalyticsConfig = Object.freeze({
  enabled: false,
  environment: 'development',
  productionOrigins: Object.freeze([]), // Точные HTTPS-origin после подтверждения домена.
  // Кандидаты для согласованного запуска. Флаг, среда, origin и noindex по-прежнему блокируют загрузку.
  productionPaths: Object.freeze([
    '/', '/privacy.html', '/personal-data-consent.html',
    '/laser-cutting.html', '/cnc-milling.html', '/plotter-cutting.html'
  ]) // Прототипы index.html и предыдущие версии не разрешаются.
});
