# Resident Kitchen

Лендинг для студии премиальных кухонь на заказ. Статический сайт без фреймворков — только HTML, CSS и vanilla JS. Встроен AI-консультант на базе Gemini 2.5 Flash, который квалифицирует лидов и собирает заявки прямо в чате.

**Продакшен:** https://svyatfront.github.io/Resident-Kitchen/

---

## Что внутри

Сайт разбит по секциям: герой с анимированными счётчиками, галерея с фильтрами по стилям, преимущества, конфигуратор стиля, калькулятор стоимости, пакеты (Базовый / Стандарт / Премиум), отзывы (marquee-карусель), FAQ, форма заявки.

AI-виджет работает поверх всего как отдельный модуль — не ломает остальной код, подключается двумя строками в HTML.

### Стек

- Чистый HTML5 / CSS3 / JS (ES2020) без сборщиков
- Иконки: Lucide (CDN, defer)
- Шрифты: Cormorant Garamond + Jost + JetBrains Mono (Google Fonts)
- Изображения: WebP с PNG-fallback через `<picture>`
- AI: Gemini 2.5 Flash через Cloudflare Worker (прокси, ключ скрыт)
- Деплой: GitHub Pages через ветку `gh-pages`

---

## Структура

```
/
├── index.html              — единственная страница, весь контент здесь
├── css/
│   ├── index.css           — импортирует все остальные стили
│   ├── variables.css       — CSS-переменные (цвета, шрифты, отступы)
│   ├── global.css          — базовые стили, типографика, утилиты
│   ├── media.css           — все брейкпойнты (mobile-first)
│   └── components/         — стиль каждой секции в отдельном файле
│       ├── widget.css      — стили AI-виджета
│       └── ...
├── js/
│   ├── main.js             — счётчики, галерея, FAQ, калькулятор, форма
│   ├── menu.js             — мобильное меню
│   ├── modal.js            — модальное окно успеха
│   ├── validation.js       — валидация телефонных номеров
│   └── widget.js           — AI-консультант (всё в одном файле)
├── images/
│   ├── hero/               — фоновое изображение героя (.webp + .png)
│   └── gallery/            — 6 стилей кухонь (.webp + .png)
├── favicon/
│   └── logo.svg
├── cloudflare-worker.js    — код прокси-воркера для Cloudflare (деплоить отдельно)
└── WIDGET-SETUP.md         — инструкция по настройке AI-виджета
```

---

## Локальная разработка

```bash
npm install
npm run dev     # запускает serve на http://localhost:5500
```

Никакой сборки не нужно — статический сайт, открывается напрямую.

---

## Деплой на GitHub Pages

### Вариант 1 — через npm (рекомендуется)

```bash
npm run deploy
```

Это запускает `gh-pages -d .` — создаёт ветку `gh-pages` и пушит туда весь сайт.

После первого деплоя один раз настроить в GitHub:
**Settings → Pages → Source: Deploy from branch → gh-pages → / (root) → Save**

### Вариант 2 — вручную

Пушить в ветку `gh-pages` напрямую. GitHub сам публикует всё что туда попадает.

---

## AI-виджет

Виджет — это всплывающее окно консультанта в правом нижнем углу. Появляется через 13 секунд или при прокрутке 45% страницы. Умеет:

- Вести диалог про стили кухонь, цены, сроки
- Предлагать форму с телефоном в нужный момент (сам определяет когда)
- Принимать голосовые сообщения (Web Speech API, Chrome/Edge)
- Повторять запрос автоматически при ошибке 429 (лимит API)

### Как это работает

```
Виджет (widget.js)
    ↓ POST
Cloudflare Worker (прокси, ключ скрыт)
    ↓  → Gemini 2.5 Flash (основной)
    ↓  → Groq / Llama 3.3 70B (резерв при 429)
    ↑
Ответ обратно в виджет
```

### Настройка

Всё в `js/widget.js`, блок `CFG` в начале файла:

```js
const CFG = {
  apiKey:   null,
  proxyUrl: 'https://residentkch.svyatfront.workers.dev',  // Cloudflare Worker
  ...
};
```

Подробная инструкция — в файле `WIDGET-SETUP.md`.

### Cloudflare Worker

Код воркера — в файле `cloudflare-worker.js`. Деплоится отдельно на [dash.cloudflare.com](https://dash.cloudflare.com).

Нужные секреты в настройках воркера:
- `GEMINI_API_KEY` — ключ с [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- `GROQ_API_KEY` — ключ с [console.groq.com](https://console.groq.com) (опционально, резерв)

---

## Лимиты бесплатных API

| Провайдер | Лимит | Где взять ключ |
|---|---|---|
| Gemini 2.5 Flash | 15 запросов/мин, 1 500/день | aistudio.google.com/app/apikey |
| Groq (Llama 3.3) | 30 запросов/мин, 14 400/день | console.groq.com |

При реальной нагрузке воркер сначала пробует Gemini, при 429 автоматически переключается на Groq.

---

## CSS-архитектура

Все переменные — в `css/variables.css`. Если нужно поменять цвет или шрифт — менять там, не в компонентах.

Основные переменные:
```css
--color-gold:    #C9A96E   /* акцентный цвет, кнопки, ссылки */
--color-obsidian:#0D0D0D   /* фон */
--color-cream:   #F0EBE1   /* основной текст */
--font-display:  'Cormorant Garamond'
--font-body:     'Jost'
```

Брейкпойнты в `css/media.css`. Подход mobile-first, основные точки: 480px, 768px, 1024px, 1280px.
