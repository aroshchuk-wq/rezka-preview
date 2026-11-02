(() => {
  'use strict';
  const config = window.ICutInquiryConfig;
  const form = document.querySelector('.contact-form');
  if (!form) return;
  // Restore the existing preference buttons; these are not links to company accounts.
  const contactField = form.elements.contact;
  const phone = value => /^\+?[0-9() .-]{7,30}$/.test(value) && /^[0-9]{7,15}$/.test(value.replace(/\D/g, ''));
  const contactMatches = (method, value) => {
    if (phone(value)) return true;
    if (method === 'Telegram') return /^(?:@?[A-Za-z0-9_]{1,32}|https:\/\/t\.me\/[A-Za-z0-9_]{1,32}\/?|[0-9]{1,20})$/.test(value);
    if (method === 'MAX') return /^(?:@?[A-Za-z0-9_-]{1,200}|https:\/\/max\.ru\/(?:u\/)?[A-Za-z0-9_-]{1,200}\/?|[0-9]{1,20})$/.test(value);
    return false;
  };
  if (document.body.classList.contains('home-page')) {
    const hints = {
      'Звонок': ['Номер телефона для звонка', 'tel'],
      Telegram: ['Номер телефона, @username или ссылка t.me', 'text'],
      WhatsApp: ['Номер телефона в WhatsApp', 'tel'],
      MAX: ['Номер телефона, ID или ссылка на профиль MAX', 'text']
    };
    const validateContact = () => {
      const method = form.elements.preferred_method.value;
      const value = contactField.value.trim();
      contactField.setCustomValidity(!value || contactMatches(method, value) ? '' :
        (method === 'Звонок' || method === 'WhatsApp' ? 'Укажите номер телефона.' : 'Укажите номер телефона или идентификатор выбранного мессенджера.'));
    };
    const updateContact = () => {
      const [placeholder, inputMode] = hints[form.elements.preferred_method.value] || hints['Звонок'];
      contactField.placeholder = placeholder; contactField.inputMode = inputMode;
      validateContact();
    };
    form.querySelectorAll('.contact-choice').forEach(choice => choice.addEventListener('click', updateContact));
    contactField.addEventListener('input', validateContact);
    updateContact();
  }
  if (config?.enabled !== true) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('#demo-status');
  const consent = form.elements.personal_data_consent;
  if (!button || !status || !consent || !window.crypto?.getRandomValues) return;
  const endpoint = new URL('api/inquiry.php', document.baseURI);
  if (endpoint.origin !== location.origin || location.protocol !== 'https:') return;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let session, busy = false, requestId = null, lastPayload = null, confirmed = false;
  const counted = new Set();
  const randomId = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  const fetchJSON = async options => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(endpoint, {...options, credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal});
      const body = await response.json();
      return {response, body};
    } finally { clearTimeout(timer); }
  };
  const messages = {
    required_fields: 'Укажите контакт для ответа и описание задачи.',
    invalid_fields: 'Проверьте поля и контакт для выбранного способа связи.',
    consent_required: 'Согласие или редакция документа изменились. Обновите страницу перед отправкой.',
    rate_limited: 'Слишком много попыток. Попробуйте позже или свяжитесь с нами напрямую.',
    too_fast: 'Подождите несколько секунд и повторите отправку.',
    delivery_unconfirmed: 'Передачу заявки пока не удалось подтвердить. Свяжитесь с нами напрямую; повторное нажатие не отправит письмо заново.',
    request_conflict: 'Этот запрос уже использован. Обновите страницу или свяжитесь с нами напрямую.',
    csrf_rejected: 'Сессия истекла. Обновите страницу; введённые данные можно предварительно скопировать.'
  };
  const ready = (async () => {
    try {
      const {response, body} = await fetchJSON({method: 'GET', headers: {'Accept': 'application/json'}});
      if (!response.ok || body.ready !== true || !/^[a-f0-9]{64}$/.test(body.csrf) || typeof body.consent_version !== 'string' || body.consent_version.startsWith('draft-')) return;
      session = body;
      // Existing selected preference is submitted. Upload remains disabled.
      form.elements.contact.required = true;
      form.elements.task.required = true;
      for (const [name, limit] of Object.entries({name: 120, contact: 254, material: 160, task: 4000})) form.elements[name].maxLength = limit;
      form.method = 'post'; form.action = endpoint.href;
      form.dataset.serverReady = 'true'; button.disabled = false;
      status.textContent = 'Укажите контакт для выбранного способа связи и задачу. Отправка — после вашего согласия.';
    } catch { /* Keep the existing disabled form and existing contact links. */ }
  })();
  form.addEventListener('submit', async event => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (busy || confirmed || !form.checkValidity() || !consent.checked) { form.reportValidity(); return; }
    busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
    try {
      await ready;
      if (!session) return;
      const payload = {};
      for (const name of ['name', 'contact', 'preferred_method', 'type', 'material', 'task', 'starting_point']) payload[name] = form.elements[name]?.value.trim() || '';
      payload.personal_data_consent = 'accepted'; payload.consent_version = session.consent_version;
      const serialized = JSON.stringify(payload);
      if (serialized !== lastPayload) { requestId = randomId(); lastPayload = serialized; }
      const {response, body} = await fetchJSON({method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-Token': session.csrf, 'Idempotency-Key': requestId}, body: serialized});
      if (!response.ok || body.accepted !== true || body.status !== 'smtp_accepted' || !/^[a-f0-9]{32}$/.test(body.id)) {
        status.textContent = messages[body.error] || 'Отправка не подтверждена. Попробуйте позже или свяжитесь с нами напрямую.';
        return;
      }
      confirmed = true;
      status.textContent = 'Заявка передана почтовому серверу. Это не подтверждение доставки или прочтения.';
      if (!counted.has(body.id)) {
        counted.add(body.id);
        try { window.ICutAnalytics?.reachGoal?.('form_success'); } catch { /* Analytics cannot change the confirmed result. */ }
      }
    } catch { status.textContent = 'Не удалось подтвердить отправку. Данные сохранены в форме; повторите попытку или свяжитесь с нами напрямую.'; }
    finally { busy = false; button.disabled = confirmed || !session; form.removeAttribute('aria-busy'); }
  });
})();
