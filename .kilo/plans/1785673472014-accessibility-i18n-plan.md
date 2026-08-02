# План: Доступность и языковая поддержка (RU/EN)

## Цель
Расширить доступность приложения и добавить переключение языков интерфейса и динамического контента (прогнозы, советы, описания погоды) — русский и английский.

## Ограничения
- Только клиентский vanilla JS, никаких сборщиков
- localStorage для хранения выбора языка
- Не ломать существующие 58 тестов
- Минимальные изменения DOM-структуры

## Шаг 1. Добавить i18n-инфраструктуру в `weather-core.js`

### 1.1 Словарь переводов
Добавить объект `translations` с ключами для всех строк:
- `appTitle`, `eyebrow`, `tagline`
- `themeAuto`, `themeLight`, `themeDark`
- `searchPlaceholder`, `searchBtn`, `refreshBtn`, `locationBtn`, `favoriteBtn`, `favoriteBtnActive`
- `favoritesTitle`, `historyTitle`, `noFavorites`, `noHistory`
- `loading`, `loadingForecast`, `errorGeneric`, `errorForecast`, `errorOffline`
- `offlineBanner`
- `hourlyTitle`, `weeklyTitle`
- `hourlyUnavailable`, `weeklyUnavailable`
- `weatherUpdated`, `uvLow`, `uv--`
- `advicePrefix` (для buildAdvice)
- `feelsLike`, `humidity`, `pressure`, `wind`, `gusts`, `direction`, `dewPoint`, `updated`, `weather`
- `errorLocationIP`, `errorGeolocationBlocked`, `errorGeolocationUnavailable`, `errorGeolocationTimeout`, `errorGeolocationNotSupported`
- `searchingCity`, `searchNotFound`, `searchError`
- `loadingWeatherFor`, `detectingLocation`
- `footerTitle`, `footerSubtitle`, `footerText`, `footerWeatherData`, `footerMapData`
- `moonPhase` значения: Новолуние, Молодая луна, Первая четверть, Растущая луна, Полнолуние, Убывающая луна, Последняя четверть, Старая луна
- `comfort`: Очень сухо, Сухо, Комфортно, Влажно, Очень влажно
- `perceivedComfort`: Морозная, Холодная, Прохладная, Комфортная, Тёплая
- `windDirections`: С, СВ, В, ЮВ, Ю, ЮЗ, З, СЗ (RU) / N, NNE, E, ENE, S, WSW, W, NNW (EN)
- `uvLevels`: Низкий, Умеренный, Высокий, Очень высокий, Экстремальный (RU) / Low, Moderate, High, Very High, Extreme (EN)
- `today`, `yesterday` (для недельного прогноза)
- `feelsLikeRange` (для weekly forecast)

Каждый ключ имеет форму `{ ru: '...', en: '...' }`.

### 1.2 Хелперы i18n
- `WeatherCore.i18n.setLanguage(lang)` — сохраняет язык в localStorage, обновляет `currentLang`
- `WeatherCore.i18n.getLanguage()` — возвращает текущий язык или 'ru'
- `WeatherCore.i18n.t(key)` — возвращает строку для текущего языка
- `WeatherCore.i18n.locale()` — возвращает 'ru-RU' или 'en-US' для `toLocaleString`

### 1.3 Локализованное форматирование
- `formatDateTime(value)` → использовать `WeatherCore.i18n.locale()`
- `formatHour(value)` → использовать `WeatherCore.i18n.locale()`
- `describeWindDir(deg)` → брать направления из словаря
- `buildAdvice(temp, code, windSpeed, uvIndex)` → возвращать строку на текущем языке
- `uvAdviceSeverity(uvIndex)` → возвращать объект с локализованными `level` и `text`
- `perceivedComfort(temp, humidity, wind)` → возвращать локализованную строку
- `describeDewPoint(dewPoint)` → возвращать локализованную строку
- `moonPhaseLabel(phaseFraction)` → возвращать локализованную строку
- `weatherDescriptions` → оставить эмодзи, но добавить локализованные описания через `t()` или отдельный объект

## Шаг 2. Добавить переключатель языка в `index.html`

### 2.1 HTML-разметка
В `<header>` рядом с `.theme-toggle` добавить `<div class="lang-toggle" aria-label="Язык интерфейса">` с двумя кнопками:
- `<button id="lang-ru-btn" class="active" type="button" aria-pressed="true">RU</button>`
- `<button id="lang-en-btn" type="button" aria-pressed="false">EN</button>`

### 2.2 Skip-link
Сразу после `<body>` добавить:
```html
<a href="#weather-card" class="skip-link">Перейти к погоде</a>
```

### 2.3 Обновить `<html lang>`
Оставить `lang="ru"` по умолчанию, `script.js` будет обновлять его при смене языка.

### 2.4 ARIA-улучшения для static HTML
- `<input id="search-input">` → добавить `<label for="search-input" class="sr-only">...</label>` с локализуемым текстом
- `<div class="temp-legend">` → добавить `role="note"` и `aria-live="polite"`
- `#weather-emoji` → добавить `aria-hidden="true"` (эмодзи декоративны, смысл уже в `#weather-description`)
- `#error-message`, `#error-forecast` → добавить `role="alert"`
- `#offline-banner` → добавить `role="status"`

## Шаг 3. Добавить стили в `style.css`

### 3.1 Skip-link
```css
.skip-link {
    position: absolute;
    top: -100%;
    left: 1rem;
    z-index: 1000;
    padding: 0.75rem 1.25rem;
    border-radius: 0 0 12px 12px;
    background: var(--panel-bg);
    color: var(--text-color);
    text-decoration: none;
    font-weight: 600;
}
.skip-link:focus {
    top: 0;
}
```

### 3.2 Языковой переключатель
```css
.lang-toggle {
    display: flex;
    gap: 3px;
    padding: 3px;
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    background: var(--panel-bg);
    backdrop-filter: blur(16px);
    margin-left: 8px;
}
.lang-toggle button {
    padding: 5px 10px;
    color: var(--page-muted);
    background: transparent;
    box-shadow: none;
    font-size: 0.76rem;
    border-radius: 999px;
}
.lang-toggle button.active {
    color: var(--control-text);
    background: var(--control-bg);
}
```

### 3.3 Screen-reader-only
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

### 3.4 Улучшенные стили фокуса
Убедиться, что `:focus-visible` уже определён (существует), добавить для `.lang-toggle button:focus-visible` и `.skip-link:focus`.

## Шаг 4. Обновить `script.js`

### 4.1 Состояние языка
```js
let currentLang = WeatherCore.i18n.getLanguage();
```

### 4.2 Функция `applyLanguage()`
Обновляет все элементы с `data-i18n` атрибутом и динамические тексты:
- Обновляет `document.documentElement.lang`
- Обновляет `document.title`
- Итерирует `[data-i18n]` элементы и вызывает `t()`
- Обновляет `html` lang атрибут
- Перерисовывает текущую погоду, прогнозы, метрики если есть снапшот
- Обновляет ARIA-атрибуты у переключателя языка

### 4.3 Обновить все строки в JS
Заменить все хардкодные русские строки на `WeatherCore.i18n.t('key')`:
- В `renderMetrics`: все label'ы метрик
- В `renderWeather`: все статусы, описания, советы
- В `renderHourlyForecast`: заголовок aria-label, unavailable текст
- В `renderWeeklyForecast`: aria-label, unavailable текст, feelsLike подпись, day names через `toLocaleDateString(currentLang)`
- В `fetchWeather`, `searchByCity`, `reverseGeocode`, `getLocationByIP`, `handleLocationError`, `useDeviceLocation`: все статусные сообщения
- В `renderChips`: emptyText для favorites/history
- В `updateFavoriteButton`: текст кнопки
- В `updateUnitToggle`: текст единицы (°C/°F не меняется, но контекст может)
- В `setLoading`, `setForecastLoading`, `setHourlyLoading`: индикаторы

### 4.4 Обработчики языка
```js
document.getElementById('lang-ru-btn').addEventListener('click', () => {
    WeatherCore.i18n.setLanguage('ru');
    applyLanguage();
});
document.getElementById('lang-en-btn').addEventListener('click', () => {
    WeatherCore.i18n.setLanguage('en');
    applyLanguage();
});
```

### 4.5 Инициализация
В `DOMContentLoaded`:
- Установить `currentLang`
- Вызвать `applyLanguage()` для начальной локализации
- Обновить `aria-pressed` у кнопок языка

## Шаг 5. Обновить `manifest.webmanifest`

Изменить `"lang": "ru"` на `"lang": "ru"` (оставить как fallback, реальный lang управляется через `<html lang>`).

## Шаг 6. Тесты

### 6.1 Новые тесты в `test/weather-core.test.js`
- `WeatherCore.i18n.setLanguage('en')` → `getLanguage()` возвращает 'en'
- `WeatherCore.i18n.t('appTitle')` возвращает английскую строку после setLanguage('en')
- `WeatherCore.i18n.locale()` возвращает 'en-US' после setLanguage('en')
- `describeWindDir(0)` возвращает 'N' для EN
- `formatDateTime` использует английскую локаль
- `formatHour` использует английскую локаль
- `buildAdvice` возвращает английскую строку
- `uvAdviceSeverity` возвращает английские уровни
- `perceivedComfort` возвращает английскую строку
- `describeDewPoint` возвращает английскую строку
- `moonPhaseLabel` возвращает английскую строку

### 6.2 Валидация
- Запустить `node test/runner.js` — все 58+ новых тестов должны проходить
- Проверить вручную в браузере: переключение RU→EN обновляет весь интерфейс, прогнозы, советы, описания
- Проверить accessibility: screen reader читает заголовки, кнопки имеют labels, skip-link работает
- Проверить keyboard navigation: Tab проходит по всем элементам, Enter/Space активирует кнопки

## Порядок выполнения
1. Шаг 1 (`weather-core.js`) — ядро i18n
2. Шаг 2 (`index.html`) — разметка
3. Шаг 3 (`style.css`) — стили
4. Шаг 4 (`script.js`) — логика
5. Шаг 5 (`manifest.webmanifest`) — манифест
6. Шаг 6 (`test/weather-core.test.js`) — тесты
7. Валидация

## Риски
- Большой объём строк для перевода — нужно аккуратно не пропустить ни одну
- `toLocaleDateString` с 'en-US' даст "Mon", "Tue" — это ожидаемо, но нужно проверить в UI
- Длина английских строк может отличаться — нужна проверка на мобильных
- localStorage может не работать в privacy mode — уже обработано в `getStored`/`setStored`
