/* ================================================================
   Resident Kitchen — AI-консультант виджет
   Модель: Gemini 2.5 Flash  |  Голос: Web Speech API (STT)

   НАСТРОЙКА:
   1. Замените 'YOUR_GEMINI_API_KEY' на ваш ключ
      Получить ключ: https://aistudio.google.com/app/apikey
   2. (Необязательно) Укажите FORM_ENDPOINT для сохранения заявок
      Бесплатно через formspree.io: создать форму → вставить URL
   ================================================================ */

(function () {
  'use strict';

  /* ─── КОНФИГУРАЦИЯ ────────────────────────────────────────── */
  const CFG = {
    /*
     * РЕЖИМ А — прямой вызов (ключ виден в коде, ограничьте по домену в Google Cloud):
     *   apiKey:   'AIzaSyXXXXX...',
     *   proxyUrl: null,
     *
     * РЕЖИМ Б — через Cloudflare Worker (ключ скрыт, рекомендуется для продакшена):
     *   apiKey:   null,
     *   proxyUrl: 'https://rk-proxy.ВАШ-ЛОГИН.workers.dev',
     */
    apiKey:        null,
    proxyUrl:      'https://residentkch.svyatfront.workers.dev',                             // ← Режим Б: URL воркера сюда

    model:         'gemini-2.5-flash',
    formEndpoint:  null,                             // ← URL Formspree (опционально)
    greetingDelay: 13000,                            // мс до всплывающей подсказки
    scrollTrigger: 0.45,                             // доля страницы для триггера
    maxTokens:     440,
    temperature:   0.72,
    thinkingBudget: 0,                               // 0 = без thinking (быстро)
  };

  /* ─── СИСТЕМНЫЙ ПРОМПТ ───────────────────────────────────── */
  const SYSTEM_PROMPT = `Ты — Алина, дизайнер-консультант студии Resident Kitchen. Ты общаешься с потенциальным клиентом на сайте студии.

РОЛЬ И ТОНАЛЬНОСТЬ
Тепло и профессионально. На «вы». Короткие ответы: 1–3 предложения максимум. Никакого капса, лишних восклицаний, эмодзи в тексте. Ты помощник, не продавец с буклетом. Не давишь и не торопишь.

ГЛАВНАЯ ЦЕЛЬ
Провести посетителя от любопытства к заявке. Квалифицировать диалогом (один вопрос за раз), дать ценность, мягко предложить оставить номер.

СИГНАЛ ПОКАЗА ФОРМЫ
Когда посетитель проявляет готовность — спрашивает цену, сроки, хочет 3D-проект, интересуется конкретным стилем или метражом — в конце ответа добавь ровно эту строку: [SHOW_LEAD_FORM]
Не используй [SHOW_LEAD_FORM] в первых двух репликах. Не повторяй токен дважды подряд.

ОГРАНИЧЕНИЯ (строго)
— Не называй точную стоимость без замера. Только «от …». Итоговая цена фиксируется в договоре.
— Не обещай конкретные даты монтажа, только «в среднем 14 дней от подписания».
— Скидки, акции не из базы знаний — «уточнит менеджер».
— Вне темы кухонь — «Я специализируюсь на кухнях Resident Kitchen — по другим вопросам лучше обратиться к нужному специалисту.»
— Не выдумывай факты, которых нет в базе знаний.

<база_знаний>
СТУДИЯ
Название: Resident Kitchen
Работаем с: 2012 года (14 лет на рынке)
Реализовано: более 1 240 кухонь
Рейтинг: 4.9 из 5 (312 отзывов)
Производство: собственное, без посредников и задержек
Слоган: «Кухня, которую вы представляли»

СТИЛИ
1. Современный — тёмные фасады, LED-подсветка, интегрированные ручки, матовые поверхности
2. Классика — белые или кремовые фасады, латунные ручки, филёнки, вечная элегантность
3. Минимализм (Скандинавский) — дубовые вставки, сдержанная светлая палитра, много воздуха и чистоты
4. Неоклассика — мраморный остров, строгая симметрия, лепные элементы, статус
5. Лофт (Индустриальный) — металл, состаренное дерево, грубая текстура, характер
6. Премиум-остров — открытая планировка, центральный остров, шпон или Fenix, эксклюзив

ПАКЕТЫ И ЦЕНЫ (за погонный метр)

[ПАКЕТ-01] Базовый — от 40 000 ₽/м
• Корпуса: ЛДСП 16 мм
• Фасады: МДФ плёнка
• Фурнитура: Hafele
• Монтаж включён
• Гарантия: 2 года
• 3D-проект: не входит

[ПАКЕТ-02] Стандарт — от 65 000 ₽/м (ХИТ, 78% клиентов)
• Корпуса: ЛДСП 18 мм влагостойкие
• Фасады: эмаль матовая
• Фурнитура: Blum (мягкие доводчики)
• 3D-проект бесплатно
• Монтаж и доставка включены
• Гарантия: 5 лет

[ПАКЕТ-03] Премиум — от 110 000 ₽/м
• Корпуса: фанера / массив
• Фасады: шпон натуральный или эмаль Fenix
• Фурнитура: Blum Legrabox полный комплект
• 3D-проект + визуализация 360°
• Монтаж, настройка, уборка включены
• Гарантия: 7 лет
• Персональный менеджер

СЕРВИС
— Замер: бесплатно, выезд в удобное время клиента
— 3D-визуализация: бесплатно (Стандарт и Премиум)
— Производство: в среднем 14 дней от подписания договора
— Цена фиксируется в договоре — никаких сюрпризов

ПОДАРОК ЗА ЗАЯВКУ СЕЙЧАС
При заявке через чат — бесплатный 3D-проект кухни (ценность от 5 000 ₽). Это фотореалистичный рендер именно вашей кухни в вашей планировке. Готов за 3 рабочих дня.

РЕАЛЬНЫЕ ОТЗЫВЫ КЛИЕНТОВ
— Анна К., Москва, 8 м²: «Сложное помещение, угол, труба. Всё учли, всё влезло идеально. Монтажники — профессионалы, аккуратно, без мусора.»
— Михаил С., СПб, 14 м²: «3D-проект сделали за 3 дня. Два раза меняли остров — без проблем. Кухня один в один как на рендере.»
— Елена Ф., Краснодар, 11 м²: «3 недели от замера до готовой кухни. Всё чётко по договору, без сюрпризов с ценой.»
— Дмитрий З., Екатеринбург, 22 м²: «Дизайнер несколько раз выезжал, корректировал. Результат — выше ожиданий.»
— Ольга П., Новосибирск, 9 м²: «Качество фурнитуры Blum — огонь. Приятно удивила скорость.»
</база_знаний>

<few_shot>
— ПРИМЕР 1 (тёплый лид, интересуется стилем) —
Посетитель: Хочу кухню в стиле минимализм
Алина: Скандинавский минимализм — один из моих любимых: дубовые вставки, светлая палитра, много чистоты. У вас уже есть примерный метраж, или пока на этапе планирования?
Посетитель: Около 3 метров, новострой
Алина: Три метра — отличная длина для аккуратной линейки. Под ваш запрос идеально подойдёт пакет Стандарт от 65 000 ₽/м — матовые фасады, Blum, гарантия 5 лет. На 3 метра ориентировочно от 195 000 ₽. Хотите увидеть, как это будет выглядеть именно в вашей квартире? [SHOW_LEAD_FORM]

— ПРИМЕР 2 (сомневающийся, сравнивает) —
Посетитель: А чем вы лучше других?
Алина: Честно — конкурентов много. Главное наше отличие: собственное производство (поэтому 14 дней, а не пара месяцев), 1 240 реализованных проектов с 2012 года и цена фиксируется в договоре. Какой стиль вас интересует?
Посетитель: Классика, белая
Алина: Белая классика с латунными ручками — вечный выбор, который не надоедает. Делаем на влагостойком ЛДСП или фанере в зависимости от бюджета. Какой метраж планируете?

— ПРИМЕР 3 (просто смотрит) —
Посетитель: Просто смотрю цены
Алина: Понятно, не тороплю. Если коротко: Базовый от 40 000 ₽/м, Стандарт от 65 000 ₽/м (хит продаж), Премиум от 110 000 ₽/м — всё с монтажом и доставкой. Если захотите примеры под конкретный стиль или метраж — просто напишите.

— ПРИМЕР 4 (спрашивает про сроки) —
Посетитель: Сколько делается кухня?
Алина: В среднем 14 дней от подписания договора до монтажа. Это наше собственное производство — без зависимости от чужих фабрик. Есть у вас уже срок, к которому хотелось бы успеть?
</few_shot>

Начинай разговор первым приветствием без токенов.`;

  /* ─── SVG ИКОНКИ ──────────────────────────────────────── */
  const ICON = {
    chat:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    send:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    mic:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    gift:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4caf87" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  /* ─── СОСТОЯНИЕ ────────────────────────────────────────── */
  let history       = [];   // [{role, parts:[{text}]}]
  let isOpen        = false;
  let greetingShown = false;
  let leadShown     = false;
  let isLoading     = false;
  let isRecording   = false;
  let recognition   = null;
  let scrollListenerActive = false;

  /* ─── ССЫЛКИ НА ЭЛЕМЕНТЫ ────────────────────────────────── */
  let elWidget, elFab, elFabIcon, elWindow, elNotify,
      elMessages, elInput, elBtnSend, elBtnVoice, elVoiceOverlay;

  /* ─── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────── */
  function init() {
    injectHTML();
    cacheRefs();
    bindEvents();
    scheduleGreeting();
  }

  /* ─── HTML-РАЗМЕТКА ─────────────────────────────────────── */
  function injectHTML() {
    const el = document.createElement('div');
    el.id = 'rk-widget';
    el.setAttribute('aria-label', 'Консультант Resident Kitchen');
    el.innerHTML = `
      <!-- Подсказка -->
      <div class="rk-notify rk-hidden" id="rk-notify" aria-live="polite">
        <p class="rk-notify__text">Подберу кухню под ваш проект за&nbsp;2&nbsp;минуты</p>
        <p class="rk-notify__sub">${ICON.gift} Бесплатный 3D-проект за заявку</p>
        <button class="rk-notify__close" id="rk-notify-close" aria-label="Закрыть подсказку">&times;</button>
      </div>

      <!-- Окно чата -->
      <div class="rk-window" id="rk-window" role="dialog" aria-modal="true"
           aria-label="Чат с консультантом Resident Kitchen" aria-hidden="true">

        <header class="rk-header">
          <div class="rk-header__avatar" aria-hidden="true">А</div>
          <div class="rk-header__info">
            <span class="rk-header__name">Алина</span>
            <span class="rk-header__status">
              <span class="rk-status-dot" aria-hidden="true"></span>
              Консультант Resident Kitchen
            </span>
          </div>
          <button class="rk-header__close" id="rk-win-close" aria-label="Закрыть чат">
            ${ICON.close}
          </button>
        </header>

        <div class="rk-messages" id="rk-messages"
             role="log" aria-label="История переписки" aria-live="polite"></div>

        <!-- Голосовой оверлей -->
        <div class="rk-voice-overlay rk-hidden" id="rk-voice-overlay" aria-live="assertive">
          <div class="rk-voice-overlay__ring">${ICON.mic}</div>
          <p class="rk-voice-overlay__text">Слушаю…</p>
          <button class="rk-voice-overlay__cancel" id="rk-voice-cancel">Отмена</button>
        </div>

        <div class="rk-input-wrap">
          <div class="rk-input-row">
            <input type="text" class="rk-input" id="rk-input"
                   placeholder="Напишите сообщение…" autocomplete="off"
                   aria-label="Текст сообщения" maxlength="500" />
            <button class="rk-btn-voice" id="rk-btn-voice"
                    aria-label="Голосовой ввод" title="Голосовой ввод">
              ${ICON.mic}
            </button>
            <button class="rk-btn-send" id="rk-btn-send"
                    aria-label="Отправить сообщение" disabled>
              ${ICON.send}
            </button>
          </div>
          <p class="rk-disclaimer">Resident Kitchen · ИИ-консультант</p>
        </div>
      </div>

      <!-- FAB кнопка -->
      <button class="rk-fab" id="rk-fab"
              aria-label="Открыть чат с консультантом"
              aria-expanded="false" aria-controls="rk-window">
        <span id="rk-fab-icon">${ICON.chat}</span>
        <span class="rk-fab__pulse" aria-hidden="true"></span>
      </button>
    `;
    document.body.appendChild(el);
  }

  /* ─── КЕШИРУЕМ ССЫЛКИ ─────────────────────────────────────── */
  function cacheRefs() {
    elWidget      = document.getElementById('rk-widget');
    elFab         = document.getElementById('rk-fab');
    elFabIcon     = document.getElementById('rk-fab-icon');
    elWindow      = document.getElementById('rk-window');
    elNotify      = document.getElementById('rk-notify');
    elMessages    = document.getElementById('rk-messages');
    elInput       = document.getElementById('rk-input');
    elBtnSend     = document.getElementById('rk-btn-send');
    elBtnVoice    = document.getElementById('rk-btn-voice');
    elVoiceOverlay = document.getElementById('rk-voice-overlay');
  }

  /* ─── СОБЫТИЯ ─────────────────────────────────────────────── */
  function bindEvents() {
    elFab.addEventListener('click', toggleChat);

    document.getElementById('rk-notify-close').addEventListener('click', hideNotify);
    document.getElementById('rk-win-close').addEventListener('click', closeChat);
    document.getElementById('rk-voice-cancel').addEventListener('click', stopRecording);

    elInput.addEventListener('input', onInputChange);
    elInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    elBtnSend.addEventListener('click', sendMessage);
    elBtnVoice.addEventListener('click', toggleVoice);

    /* Закрыть по клику снаружи.
       e.target.isConnected — защита от кнопок, которые удаляют себя из DOM
       до того, как клик долетает до document (например, чипы-подсказки). */
    document.addEventListener('click', function (e) {
      if (isOpen && e.target.isConnected && !elWidget.contains(e.target)) closeChat();
    });

    /* Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (isRecording) stopRecording();
        else if (isOpen)  closeChat();
      }
    });
  }

  /* ─── ОТЛОЖЕННОЕ ПРИВЕТСТВИЕ ─────────────────────────────── */
  function scheduleGreeting() {
    /* По таймеру */
    setTimeout(function () {
      if (!isOpen && !greetingShown) showNotify();
    }, CFG.greetingDelay);

    /* По скроллу */
    if (!scrollListenerActive) {
      scrollListenerActive = true;
      window.addEventListener('scroll', function onScroll() {
        const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (progress >= CFG.scrollTrigger && !isOpen && !greetingShown) {
          showNotify();
          window.removeEventListener('scroll', onScroll);
        }
      }, { passive: true });
    }
  }

  /* ─── ПОКАЗАТЬ / СКРЫТЬ ПОДСКАЗКУ ─────────────────────────── */
  function showNotify() {
    if (greetingShown || isOpen) return;
    greetingShown = true;
    elNotify.classList.remove('rk-hidden');
    /* Значок непрочитанных */
    if (!document.querySelector('.rk-fab__badge')) {
      const badge = document.createElement('span');
      badge.className = 'rk-fab__badge';
      badge.setAttribute('aria-label', '1 новое сообщение');
      badge.textContent = '1';
      elFab.appendChild(badge);
    }
  }

  function hideNotify() {
    elNotify.classList.add('rk-hidden');
  }

  /* ─── ОТКРЫТЬ / ЗАКРЫТЬ ЧДАТ ─────────────────────────────── */
  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    isOpen = true;
    hideNotify();
    removeBadge();

    elWindow.classList.add('is-open');
    elWindow.setAttribute('aria-hidden', 'false');
    elFab.setAttribute('aria-expanded', 'true');
    elFab.classList.add('is-open');
    elFabIcon.innerHTML = ICON.close;
    elInput.focus();

    /* Первое приветствие */
    if (history.length === 0) sendInitialGreeting();
  }

  function closeChat() {
    isOpen = false;
    if (isRecording) stopRecording();

    elWindow.classList.remove('is-open');
    elWindow.setAttribute('aria-hidden', 'true');
    elFab.setAttribute('aria-expanded', 'false');
    elFab.classList.remove('is-open');
    elFabIcon.innerHTML = ICON.chat;
  }

  function removeBadge() {
    const badge = document.querySelector('.rk-fab__badge');
    if (badge) badge.remove();
  }

  /* ─── ПЕРВОЕ ПРИВЕТСТВИЕ ─────────────────────────────────── */
  function sendInitialGreeting() {
    showTyping();
    callGemini([{ role: 'user', parts: [{ text: 'Привет' }] }])
      .then(function (text) {
        removeTyping();
        appendBotMsg(text);
        /* Начальные кнопки-подсказки */
        appendChips([
          'Современный стиль',
          'Классика',
          'Минимализм',
          'Узнать цены',
        ]);
      })
      .catch(function () {
        removeTyping();
        appendBotMsg('Здравствуйте! Я Алина, консультант Resident Kitchen. Какой стиль кухни вас интересует?');
        appendChips(['Современный', 'Классика', 'Минимализм', 'Лофт']);
      });
  }

  /* ─── ОТПРАВКА СООБЩЕНИЯ ────────────────────────────────── */
  function onInputChange() {
    elBtnSend.disabled = elInput.value.trim().length === 0 || isLoading;
  }

  function sendMessage(text) {
    const msg = (typeof text === 'string' ? text : elInput.value).trim();
    if (!msg || isLoading) return;

    elInput.value = '';
    elBtnSend.disabled = true;
    removeChips();

    appendUserMsg(msg);

    history.push({ role: 'user', parts: [{ text: msg }] });
    isLoading = true;
    setInputDisabled(true);
    showTyping();

    callGemini(history)
      .then(function (rawText) {
        removeTyping();
        isLoading = false;
        setInputDisabled(false);
        elInput.focus();

        const showForm = rawText.includes('[SHOW_LEAD_FORM]');
        const cleanText = rawText.replace('[SHOW_LEAD_FORM]', '').trim();

        appendBotMsg(cleanText);
        history.push({ role: 'model', parts: [{ text: cleanText }] });

        if (showForm && !leadShown) {
          leadShown = true;
          setTimeout(function () { appendLeadForm(); }, 350);
        }
      })
      .catch(function (err) {
        removeTyping();
        isLoading = false;
        setInputDisabled(false);

        /* 429 — лимит запросов, автоматический повтор через 8 сек */
        const is429 = err?.code === 429
          || String(err?.status) === '429'
          || JSON.stringify(err).includes('429')
          || JSON.stringify(err).includes('RESOURCE_EXHAUSTED');

        if (is429) {
          appendBotMsg('Немного загружена — отвечу через несколько секунд…');
          const lastUserMsg = history[history.length - 1];
          setTimeout(function () {
            if (lastUserMsg) {
              showTyping();
              isLoading = true;
              setInputDisabled(true);
              callGemini(history)
                .then(function (rawText) {
                  removeTyping();
                  isLoading = false;
                  setInputDisabled(false);
                  const showForm = rawText.includes('[SHOW_LEAD_FORM]');
                  const cleanText = rawText.replace('[SHOW_LEAD_FORM]', '').trim();
                  appendBotMsg(cleanText);
                  history.push({ role: 'model', parts: [{ text: cleanText }] });
                  if (showForm && !leadShown) { leadShown = true; setTimeout(appendLeadForm, 350); }
                })
                .catch(function () {
                  removeTyping();
                  isLoading = false;
                  setInputDisabled(false);
                  appendBotMsg('Не удалось ответить. Позвоните нам — поможем быстрее!');
                });
            }
          }, 8000);
        } else {
          appendBotMsg('Упс, что-то пошло не так. Попробуйте написать ещё раз или позвоните нам.');
        }
        console.warn('[RK Widget] API error:', err);
      });
  }

  /* ─── API GEMINI ────────────────────────────────────────── */
  function callGemini(messages) {
    const usingProxy = Boolean(CFG.proxyUrl);

    if (!usingProxy && (!CFG.apiKey || CFG.apiKey === 'YOUR_GEMINI_API_KEY')) {
      return Promise.reject(new Error('Не задан ни apiKey, ни proxyUrl'));
    }

    /* Тело запроса — одинаковое для обоих режимов */
    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages,
      generationConfig: {
        temperature: CFG.temperature,
        maxOutputTokens: CFG.maxTokens,
        thinkingConfig: { thinkingBudget: CFG.thinkingBudget },
      },
    };

    let url, fetchOpts;

    if (usingProxy) {
      /* Режим Б: воркер получает модель в теле и сам подставляет ключ */
      url = CFG.proxyUrl;
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ model: CFG.model }, body)),
      };
    } else {
      /* Режим А: прямой вызов Gemini с ключом в URL */
      url = 'https://generativelanguage.googleapis.com/v1beta/models/'
        + CFG.model + ':generateContent?key=' + CFG.apiKey;
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };
    }

    return fetch(url, fetchOpts)
      .then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw e; });
        return res.json();
      })
      .then(function (data) {
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Пустой ответ от модели');
        return text.trim();
      });
  }

  /* ─── РЕНДЕР СООБЩЕНИЙ ──────────────────────────────────── */
  function appendUserMsg(text) {
    const div = document.createElement('div');
    div.className = 'rk-msg rk-msg--user';
    div.innerHTML = '<div class="rk-msg__bubble">' + escHtml(text) + '</div>';
    elMessages.appendChild(div);
    scrollBottom();
  }

  function appendBotMsg(text) {
    const div = document.createElement('div');
    div.className = 'rk-msg rk-msg--bot';
    /* Разрешаем простые переносы строк */
    const safe = escHtml(text).replace(/\n/g, '<br>');
    div.innerHTML = '<div class="rk-msg__bubble">' + safe + '</div>';
    elMessages.appendChild(div);
    scrollBottom();
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'rk-msg rk-msg--bot rk-msg--typing';
    div.id = 'rk-typing';
    div.innerHTML = '<div class="rk-msg__bubble"><span class="rk-dot"></span><span class="rk-dot"></span><span class="rk-dot"></span></div>';
    elMessages.appendChild(div);
    scrollBottom();
  }

  function removeTyping() {
    const el = document.getElementById('rk-typing');
    if (el) el.remove();
  }

  /* ─── БЫСТРЫЕ ПОДСКАЗКИ ──────────────────────────────────── */
  function appendChips(options) {
    removeChips();
    const wrap = document.createElement('div');
    wrap.className = 'rk-chips';
    wrap.id = 'rk-chips';
    options.forEach(function (label) {
      const btn = document.createElement('button');
      btn.className = 'rk-chip';
      btn.textContent = label;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeChips();
        sendMessage(label);
      });
      wrap.appendChild(btn);
    });
    elMessages.appendChild(wrap);
    scrollBottom();
  }

  function removeChips() {
    const el = document.getElementById('rk-chips');
    if (el) el.remove();
  }

  /* ─── ФОРМА ЗАХВАТА ЛИДА ─────────────────────────────────── */
  function appendLeadForm() {
    const wrap = document.createElement('div');
    wrap.className = 'rk-lead';
    wrap.id = 'rk-lead-form';
    wrap.innerHTML = `
      <p class="rk-lead__gift">${ICON.gift}&nbsp;Подарок за заявку сегодня</p>
      <p class="rk-lead__title">Получите бесплатный 3D-проект вашей кухни</p>
      <p class="rk-lead__desc">Фотореалистичный рендер под вашу планировку. Готов за 3 рабочих дня. Стоимость от 5 000 ₽ — для вас бесплатно.</p>
      <input type="tel" class="rk-lead__input" id="rk-phone-input"
             placeholder="+7 (___) ___-__-__" autocomplete="tel" maxlength="20" />
      <button class="rk-lead__btn" id="rk-lead-submit">Получить 3D-проект бесплатно</button>
      <button class="rk-lead__skip" id="rk-lead-skip">Продолжить без заявки</button>
    `;
    elMessages.appendChild(wrap);
    scrollBottom();

    const phoneInput = document.getElementById('rk-phone-input');
    const submitBtn  = document.getElementById('rk-lead-submit');
    const skipBtn    = document.getElementById('rk-lead-skip');

    /* Автоформатирование телефона */
    phoneInput.addEventListener('input', formatPhone);
    phoneInput.focus();

    submitBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const phone = phoneInput.value.replace(/\D/g, '');
      if (phone.length < 10) {
        phoneInput.classList.add('is-error');
        phoneInput.focus();
        setTimeout(function () { phoneInput.classList.remove('is-error'); }, 1200);
        return;
      }
      wrap.remove();
      submitLead(phoneInput.value);
    });

    skipBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.remove();
      appendBotMsg('Хорошо, если появятся вопросы — я здесь. Что ещё могу рассказать о кухнях?');
    });
  }

  function formatPhone(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7') && v.length > 0) v = '7' + v;
    let formatted = '+7';
    if (v.length > 1) formatted += ' (' + v.slice(1, 4);
    if (v.length >= 4) formatted += ') ' + v.slice(4, 7);
    if (v.length >= 7) formatted += '-' + v.slice(7, 9);
    if (v.length >= 9) formatted += '-' + v.slice(9, 11);
    e.target.value = formatted;
  }

  /* ─── ОТПРАВКА ЗАЯВКИ ────────────────────────────────────── */
  function submitLead(phone) {
    const successDiv = document.createElement('div');
    successDiv.className = 'rk-success';
    successDiv.innerHTML = `
      <div class="rk-success__icon">${ICON.check}</div>
      <p class="rk-success__title">Заявка принята!</p>
      <p class="rk-success__desc">Менеджер перезвонит на ${escHtml(phone)}<br>в течение 15 минут. Ваш 3D-проект уже в работе.</p>
    `;
    elMessages.appendChild(successDiv);
    scrollBottom();

    history.push({
      role: 'model',
      parts: [{ text: 'Заявка оформлена. Клиент оставил номер: ' + phone }],
    });

    /* Отправить данные если есть endpoint */
    if (CFG.formEndpoint) {
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          source: 'AI-виджет',
          page: window.location.href,
          timestamp: new Date().toISOString(),
          chatHistory: history.slice(-6).map(function (m) {
            return (m.role === 'user' ? 'Клиент: ' : 'Алина: ') + m.parts[0].text;
          }).join('\n'),
        }),
      }).catch(function (e) { console.warn('[RK Widget] Form submit error:', e); });
    }

    /* Продолжить диалог */
    setTimeout(function () {
      appendBotMsg('Пока ждёте звонка — могу рассказать о стилях, материалах или показать примеры наших работ. Что интересно?');
      appendChips(['Примеры работ', 'Материалы фасадов', 'Сроки изготовления']);
    }, 1200);
  }

  /* ─── ГОЛОСОВОЙ ВВОД (Web Speech API) ─────────────────────── */
  function toggleVoice() {
    if (isRecording) stopRecording();
    else             startRecording();
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      appendBotMsg('Голосовой ввод не поддерживается вашим браузером. Попробуйте Chrome или Edge.');
      return;
    }

    recognition = new SR();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (e) {
      const transcript = e.results[0][0].transcript;
      stopRecording();
      elInput.value = transcript;
      onInputChange();
      if (transcript.trim()) sendMessage(transcript);
    };

    recognition.onerror = function (e) {
      stopRecording();
      if (e.error !== 'aborted') {
        appendBotMsg('Не удалось распознать речь. Попробуйте ещё раз или напишите текстом.');
      }
    };

    recognition.onend = function () {
      if (isRecording) stopRecording();
    };

    isRecording = true;
    recognition.start();
    elBtnVoice.classList.add('is-recording');
    elVoiceOverlay.classList.remove('rk-hidden');
    elInput.disabled = true;
    elBtnSend.disabled = true;
  }

  function stopRecording() {
    if (recognition) {
      try { recognition.abort(); } catch (e) { /* ignore */ }
      recognition = null;
    }
    isRecording = false;
    elBtnVoice.classList.remove('is-recording');
    elVoiceOverlay.classList.add('rk-hidden');
    elInput.disabled = false;
    onInputChange();
  }

  /* ─── ВСПОМОГАТЕЛЬНОЕ ────────────────────────────────────── */
  function scrollBottom() {
    requestAnimationFrame(function () {
      elMessages.scrollTop = elMessages.scrollHeight;
    });
  }

  function setInputDisabled(state) {
    elInput.disabled = state;
    elBtnVoice.disabled = state;
    if (state) {
      elBtnSend.disabled = true;
    } else {
      onInputChange();
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── СТАРТ ──────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
