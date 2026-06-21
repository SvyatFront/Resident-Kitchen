# Resident Kitchen — Настройка AI-виджета

## Шаг 1. Получить API ключ Gemini

1. Открыть **https://aistudio.google.com/app/apikey**
2. Нажать **"Create API key"**
3. Выбрать проект Google (или создать новый — бесплатно)
4. Скопировать ключ вида `AIzaSy...`

> **Бесплатный тариф Gemini 2.5 Flash:**
> 15 запросов/мин, 1 500 запросов/день — достаточно для старта.

---

## Шаг 2. Вставить ключ в widget.js

Открыть файл `js/widget.js`, найти строку:

```js
apiKey: 'YOUR_GEMINI_API_KEY',
```

Заменить на ваш ключ:

```js
apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
```

---

## Шаг 3. Защита ключа (важно для продакшена)

Поскольку сайт на GitHub Pages (статика), ключ виден в JS-коде.
**Обязательно ограничьте ключ по домену:**

1. Открыть **https://console.cloud.google.com/apis/credentials**
2. Нажать на ваш ключ → **"Edit API key"**
3. В разделе **"Application restrictions"** выбрать **"HTTP referrers (websites)"**
4. Добавить ваш домен: `https://ваш-аккаунт.github.io/*`
5. Сохранить

После этого ключ будет работать **только** с вашего домена.

---

## Шаг 4. (Опционально) Сохранение заявок через Formspree

Чтобы номера телефонов из чата приходили на почту:

1. Зайти на **https://formspree.io** → создать бесплатный аккаунт
2. Создать новую форму → получить URL вида `https://formspree.io/f/xxxxxxxx`
3. В `js/widget.js` найти:
   ```js
   formEndpoint: null,
   ```
   Заменить на:
   ```js
   formEndpoint: 'https://formspree.io/f/xxxxxxxx',
   ```

Каждая заявка будет приходить на вашу почту с полем:
- Телефон
- Источник (AI-виджет)
- Страница
- Последние 6 реплик из чата

---

## Файловая структура виджета

```
js/
  widget.js        ← вся логика виджета (промпт + API + UI)
css/components/
  widget.css       ← стили виджета
```

Виджет подключён в `index.html`:
- CSS: в `<head>` — `<link rel="stylesheet" href="css/components/widget.css">`
- JS: перед `</body>` — `<script src="js/widget.js" defer></script>`

---

## Как работает виджет

| Событие | Действие |
|---|---|
| 13 сек на странице | Всплывает подсказка "Подберу кухню за 2 минуты" |
| Прокрутка 45% страницы | То же самое (что наступит раньше) |
| Клик на FAB кнопку | Открывается окно чата |
| Первый открыт | Алина пишет приветствие через Gemini API |
| 3+ реплики, клиент заинтересован | AI добавляет `[SHOW_LEAD_FORM]`, появляется форма с телефоном |
| Клиент вводит номер | Успех + отправка на formEndpoint |
| Голосовая кнопка | Микрофон → STT браузера → текст в поле → отправка |

---

## Настройки (js/widget.js → const CFG)

```js
const CFG = {
  apiKey:        'ВАШ_КЛЮЧ',
  model:         'gemini-2.5-flash',    // модель Gemini
  formEndpoint:  null,                  // URL Formspree
  greetingDelay: 13000,                 // мс до подсказки (13 сек)
  scrollTrigger: 0.45,                  // 45% прокрутки
  maxTokens:     440,                   // макс длина ответа
  temperature:   0.72,                  // "творческость" (0-1)
  thinkingBudget: 0,                    // 0 = без думания (быстро)
};
```
