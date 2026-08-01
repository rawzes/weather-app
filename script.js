document.addEventListener('DOMContentLoaded', () => {
    const locationStatus = document.getElementById('location-status');
    const weatherDescription = document.getElementById('weather-description');
    const currentTemp = document.getElementById('current-temp');
    const currentUnit = document.getElementById('current-unit');
    const weatherAdvice = document.getElementById('weather-advice');
    const weatherInfo = document.getElementById('weather-info');
    const weatherEmoji = document.getElementById('weather-emoji');
    const personSVG = document.getElementById('person');
    const weatherCard = document.getElementById('weather-card');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refreshBtn');
    const myLocationBtn = document.getElementById('my-location-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const celsiusBtn = document.getElementById('celsius-btn');
    const fahrenheitBtn = document.getElementById('fahrenheit-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const offlineBanner = document.getElementById('offline-banner');
    const forecastIndicator = document.getElementById('forecast-indicator');
    const hourlyIndicator = document.getElementById('hourly-indicator');
    const forecastError = document.getElementById('error-forecast');
    const weeklyForecastList = document.getElementById('weekly-forecast-list');
    const hourlyForecastList = document.getElementById('hourly-forecast-list');
    const favoritesList = document.getElementById('favorites-list');
    const historyList = document.getElementById('history-list');
    const themeButtons = {
        auto: document.getElementById('theme-auto-btn'),
        light: document.getElementById('theme-light-btn'),
        dark: document.getElementById('theme-dark-btn')
    };

    const storageKeys = {
        unit: 'weatherApp.unit',
        theme: 'weatherApp.theme',
        lastLocation: 'weatherApp.lastLocation',
        lastSnapshot: 'weatherApp.lastSnapshot',
        favorites: 'weatherApp.favorites',
        history: 'weatherApp.history'
    };

    let useCelsius = WeatherCore.getStored(storageKeys.unit, 'c') === 'c';
    let themeMode = getStored(storageKeys.theme, 'auto');
    let favorites = getStored(storageKeys.favorites, []);
    let history = getStored(storageKeys.history, []);
    let currentLocation = getStored(storageKeys.lastLocation, null);
    let currentSnapshot = null;
    let lastWeatherCode = null;

    function getStored(key, fallback) {
        return WeatherCore.getStored(key, fallback);
    }

    function setStored(key, value) {
        WeatherCore.setStored(key, value);
    }

    function convertTemp(celsius) {
        return WeatherCore.convertTemp(celsius, useCelsius);
    }

    function getTempUnit() {
        return WeatherCore.getTempUnit(useCelsius);
    }

    function showElement(element, display = 'block') {
        if (element) element.style.display = display;
    }

    function hideElement(element) {
        if (element) element.style.display = 'none';
    }

    function setLoading(isLoading) {
        weatherCard.classList.toggle('loading', isLoading);
        isLoading ? showElement(loadingIndicator) : hideElement(loadingIndicator);
    }

    function setForecastLoading(isLoading) {
        isLoading ? showElement(forecastIndicator, 'inline-block') : hideElement(forecastIndicator);
    }

    function setHourlyLoading(isLoading) {
        isLoading ? showElement(hourlyIndicator, 'inline-block') : hideElement(hourlyIndicator);
    }

    function showError(message) {
        errorMessage.textContent = message;
        weatherCard.classList.add('error-state');
        showElement(errorMessage);
    }

    function hideError() {
        weatherCard.classList.remove('error-state');
        hideElement(errorMessage);
    }

    function showForecastError(message) {
        forecastError.textContent = message;
        showElement(forecastError);
    }

    function hideForecastError() {
        hideElement(forecastError);
    }

    function updateUnitToggle() {
        celsiusBtn.classList.toggle('active', useCelsius);
        fahrenheitBtn.classList.toggle('active', !useCelsius);
        currentUnit.textContent = getTempUnit();
        setStored(storageKeys.unit, useCelsius ? 'c' : 'f');
    }

    function setTheme(mode) {
        themeMode = mode;
        setStored(storageKeys.theme, mode);
        Object.entries(themeButtons).forEach(([name, button]) => button.classList.toggle('active', name === mode));
        document.body.classList.toggle('theme-light', mode === 'light' || (mode === 'auto' && WeatherCore.shouldUseLightTheme()));
        document.body.classList.toggle('theme-dark', mode === 'dark' || (mode === 'auto' && !WeatherCore.shouldUseLightTheme()));
    }

    function applyWeatherClass(weatherCode) {
        Object.values(WeatherCore.weatherBodyClasses).forEach(className => document.body.classList.remove(className));
        document.body.classList.add(WeatherCore.weatherBodyClasses[weatherCode] || 'body-weather-clear');
        setTheme(themeMode);
    }

    function buildAdvice(temp, code, windSpeed) {
        return WeatherCore.buildAdvice(temp, code, windSpeed);
    }

    function renderMetrics(current) {
        const metrics = [
            ['Ощущается как', `${convertTemp(current.apparent_temperature)}${getTempUnit()}`],
            ['Влажность', `${Math.round(current.relative_humidity_2m)}%`],
            ['Давление', `${Math.round(current.pressure_msl)} гПа`],
            ['Ветер', `${Math.round(current.wind_speed_10m)} км/ч`],
            ['Порывы', `${Math.round(current.wind_gusts_10m)} км/ч`],
            ['Обновлено', WeatherCore.formatDateTime(current.time)],
            ['Погода', WeatherCore.weatherDescriptions[current.weather_code] || 'Неизвестно'],
            ['Код', current.weather_code]
        ];

        weatherInfo.innerHTML = metrics.map(([label, value]) => `
            <article class="metric-card">
                <span class="metric-label">${label}</span>
                <span class="metric-value">${value}</span>
            </article>
        `).join('');
    }

    function renderWeather(snapshot, isOffline = false) {
        currentSnapshot = snapshot;
        const { location, current } = snapshot;
        currentLocation = location;
        setStored(storageKeys.lastLocation, location);
        setStored(storageKeys.lastSnapshot, snapshot);
        hideError();
        isOffline ? showElement(offlineBanner) : hideElement(offlineBanner);

        const weatherCode = current.weather_code;
        const emoji = WeatherCore.weatherEmojis[weatherCode] || '🌤️';
        locationStatus.textContent = `📍 ${location.name}`;
        weatherDescription.textContent = WeatherCore.weatherDescriptions[weatherCode] || 'Погода обновлена';
        currentTemp.textContent = convertTemp(current.temperature_2m);
        currentUnit.textContent = getTempUnit();
        weatherAdvice.textContent = buildAdvice(current.temperature_2m, weatherCode, current.wind_speed_10m);
        renderMetrics(current);
        renderHourlyForecast(snapshot.hourly || []);
        renderWeeklyForecast(snapshot.daily || []);
        updateFavoriteButton();
        applyWeatherClass(weatherCode);

        if (lastWeatherCode !== null && lastWeatherCode !== weatherCode) {
            weatherEmoji.style.transform = 'scale(0.7) rotate(-8deg)';
            window.setTimeout(() => {
                weatherEmoji.textContent = emoji;
                weatherEmoji.style.transform = 'scale(1) rotate(0)';
            }, 130);
        } else {
            weatherEmoji.textContent = emoji;
        }
        lastWeatherCode = weatherCode;
        updatePerson(current.temperature_2m, weatherCode);
    }

    function formatDateTime(value) {
        return WeatherCore.formatDateTime(value);
    }

    function formatHour(value) {
        return WeatherCore.formatHour(value);
    }

    function renderHourlyForecast(hourly) {
        if (!hourly.length) {
            hourlyForecastList.innerHTML = '<div class="chip empty">Почасовой прогноз недоступен</div>';
            return;
        }

        hourlyForecastList.innerHTML = hourly.map(item => `
            <article class="hourly-card" aria-label="${formatHour(item.time)}, ${convertTemp(item.temperature_2m)}${getTempUnit()}">
                <span class="hourly-time">${formatHour(item.time)}</span>
                <span class="hourly-emoji">${WeatherCore.weatherEmojis[item.weather_code] || '🌤️'}</span>
                <span class="hourly-temp">${convertTemp(item.temperature_2m)}${getTempUnit()}</span>
            </article>
        `).join('');
    }

    function renderWeeklyForecast(daily) {
        if (!daily.length) {
            weeklyForecastList.innerHTML = '<div class="chip empty">Прогноз на неделю недоступен</div>';
            return;
        }

        const today = new Date().toDateString();
        const temps = daily.flatMap(item => [item.temperature_2m_min, item.temperature_2m_max]);
        const minRange = Math.min(...temps);
        const maxRange = Math.max(...temps);
        const range = Math.max(maxRange - minRange, 1);

        weeklyForecastList.innerHTML = daily.map((item, index) => {
            const date = new Date(item.time);
            const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
            const isToday = date.toDateString() === today;
            const fill = Math.max(18, ((item.temperature_2m_max - minRange) / range) * 100);
            return `
                <article class="forecast-day ${isToday ? 'forecast-today' : ''}" style="animation-delay:${index * 0.05}s" aria-label="${dayName}, ${WeatherCore.weatherDescriptions[item.weather_code] || 'Неизвестно'}">
                    <span class="forecast-day-name">${isToday ? 'Сегодня' : dayName}</span>
                    <span class="forecast-emoji">${WeatherCore.weatherEmojis[item.weather_code] || '🌤️'}</span>
                    <span class="forecast-temp">${convertTemp(item.temperature_2m_min)} / ${convertTemp(item.temperature_2m_max)}${getTempUnit()}</span>
                    <span class="temp-bar"><span class="temp-bar-fill" style="width:${fill}%"></span></span>
                </article>
            `;
        }).join('');
    }

    function normalizeForecast(data, location) {
        const current = data.current;
        const hourly = [];
        const daily = [];
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        for (let i = 0; i < (data.hourly?.time?.length || 0); i += 1) {
            const itemTime = new Date(data.hourly.time[i]);
            if (itemTime >= now && itemTime <= endOfDay) {
                hourly.push({
                    time: data.hourly.time[i],
                    temperature_2m: data.hourly.temperature_2m[i],
                    weather_code: data.hourly.weather_code[i]
                });
            }
            if (hourly.length >= 12) break;
        }

        for (let i = 0; i < (data.daily?.time?.length || 0); i += 1) {
            daily.push({
                time: data.daily.time[i],
                weather_code: data.daily.weather_code[i],
                temperature_2m_min: data.daily.temperature_2m_min[i],
                temperature_2m_max: data.daily.temperature_2m_max[i]
            });
        }

        return { location, current, hourly, daily, savedAt: new Date().toISOString() };
    }

    async function fetchWeather(location) {
        setLoading(true);
        setForecastLoading(true);
        setHourlyLoading(true);
        hideError();
        hideForecastError();
        hideElement(offlineBanner);

        const params = new URLSearchParams({
            latitude: location.latitude,
            longitude: location.longitude,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m',
            hourly: 'temperature_2m,weather_code',
            daily: 'weather_code,temperature_2m_min,temperature_2m_max',
            timezone: 'auto',
            forecast_days: '7'
        });

        try {
            locationStatus.textContent = `Загружаем погоду: ${location.name}...`;
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!response.ok) throw new Error('Weather request failed');
            const data = await response.json();
            const snapshot = WeatherCore.normalizeForecast(data, location);
            renderWeather(snapshot);
        } catch (error) {
            console.error(error);
            const cachedSnapshot = getStored(storageKeys.lastSnapshot, null);
            if (cachedSnapshot) {
                renderWeather(cachedSnapshot, true);
                showError('Не удалось обновить прогноз. Используем последние сохранённые данные.');
            } else {
                showError('Не удалось получить данные о погоде. Проверьте подключение к интернету.');
                showForecastError('Прогноз недоступен без соединения.');
            }
        } finally {
            setLoading(false);
            setForecastLoading(false);
            setHourlyLoading(false);
        }
    }

    async function searchByCity(city) {
        if (!city) return;
        setLoading(true);
        hideError();
        hideElement(offlineBanner);
        locationStatus.textContent = `Ищем город: ${city}...`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&accept-language=ru`);
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();
            if (!data[0]) {
                showError(`Город "${city}" не найден.`);
                locationStatus.textContent = 'Попробуйте другой запрос';
                return;
            }
            const result = data[0];
            const location = {
                name: result.display_name.split(',')[0],
                latitude: Number(result.lat),
                longitude: Number(result.lon)
            };
            addToHistory(location);
            await fetchWeather(location);
        } catch (error) {
            console.error(error);
            showError(`Ошибка поиска города "${city}".`);
        } finally {
            setLoading(false);
        }
    }

    async function reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`);
            if (!response.ok) throw new Error('Reverse geocoding failed');
            const data = await response.json();
            return data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } catch {
            return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }

    async function getWeatherByCoords(position) {
        const { latitude, longitude } = position.coords;
        const name = await reverseGeocode(latitude, longitude);
        const location = { name, latitude, longitude };
        addToHistory(location);
        await fetchWeather(location);
    }

    async function getLocationByIP() {
        try {
            locationStatus.textContent = 'Определяем местоположение по IP...';
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('IP location failed');
            const data = await response.json();
            if (!data.latitude || !data.longitude) throw new Error('No IP coordinates');
            const location = {
                name: data.city || data.region || 'Текущее местоположение',
                latitude: data.latitude,
                longitude: data.longitude
            };
            addToHistory(location);
            await fetchWeather(location);
        } catch (error) {
            console.error(error);
            const fallback = { name: 'Москва', latitude: 55.7558, longitude: 37.6176 };
            await fetchWeather(fallback);
        }
    }

    function handleLocationError(error) {
        const messages = {
            1: 'Геолокация запрещена. Используем определение по IP.',
            2: 'Местоположение недоступно. Используем определение по IP.',
            3: 'Геолокация не ответила вовремя. Используем определение по IP.'
        };
        locationStatus.textContent = messages[error.code] || 'Неизвестная ошибка геолокации.';
        getLocationByIP();
    }

    function refreshWeather() {
        if (currentLocation) {
            fetchWeather(currentLocation);
            return;
        }
        useDeviceLocation();
    }

    function useDeviceLocation() {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeatherByCoords, handleLocationError, { timeout: 9000 });
        } else {
            locationStatus.textContent = 'Геолокация не поддерживается.';
            getLocationByIP();
        }
    }

    function addToHistory(location) {
        history = [location, ...history.filter(item => WeatherCore.locationKey(item) !== WeatherCore.locationKey(location))].slice(0, 8);
        setStored(storageKeys.history, history);
        renderChips();
    }

    function toggleFavorite() {
        if (!currentLocation) return;
        const exists = favorites.some(item => WeatherCore.locationKey(item) === WeatherCore.locationKey(currentLocation));
        favorites = exists
            ? favorites.filter(item => WeatherCore.locationKey(item) !== WeatherCore.locationKey(currentLocation))
            : [currentLocation, ...favorites].slice(0, 8);
        setStored(storageKeys.favorites, favorites);
        updateFavoriteButton();
        renderChips();
    }

    function updateFavoriteButton() {
        const active = currentLocation && favorites.some(item => WeatherCore.locationKey(item) === WeatherCore.locationKey(currentLocation));
        favoriteBtn.textContent = active ? 'В избранном' : 'В избранное';
        favoriteBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    function renderChips() {
        renderChipList(favoritesList, favorites, 'Нет избранных городов');
        renderChipList(historyList, history, 'История появится после поиска');
    }

    function renderChipList(container, items, emptyText) {
        container.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('span');
            empty.className = 'chip empty';
            empty.textContent = emptyText;
            container.appendChild(empty);
            return;
        }
        items.forEach(item => {
            const button = document.createElement('button');
            button.className = 'chip';
            button.type = 'button';
            button.textContent = item.name;
            button.addEventListener('click', () => fetchWeather(item));
            container.appendChild(button);
        });
    }

    function updatePerson(temperature, weatherCode) {
        personSVG.innerHTML = '';
        const ns = 'http://www.w3.org/2000/svg';
        const isRainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
        const coatColor = temperature < 0 ? '#2563eb' : temperature < 10 ? '#3b82f6' : temperature < 20 ? '#7dd3fc' : '#facc15';
        const pantsColor = temperature >= 20 ? '#22c55e' : '#334155';
        const hatColor = temperature < 0 ? '#b91c1c' : temperature < 10 ? '#1d4ed8' : '#ffffff';

        appendSvg('ellipse', { cx: 100, cy: 258, rx: 54, ry: 10, fill: 'rgba(15, 23, 42, 0.18)' });
        appendSvg('circle', { cx: 100, cy: 42, r: 22, fill: '#ffdbac' });
        appendSvg('circle', { cx: 92, cy: 37, r: 3, fill: '#111827' });
        appendSvg('circle', { cx: 108, cy: 37, r: 3, fill: '#111827' });
        appendSvg('path', { d: 'M 90 51 Q 100 58 110 51', stroke: '#ef4444', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' });

        if (temperature < 15) {
            appendSvg('rect', { x: 72, y: 16, width: 56, height: temperature < 0 ? 22 : 17, rx: 7, fill: hatColor });
            if (temperature < 0) appendSvg('circle', { cx: 100, cy: 12, r: 5, fill: '#f87171' });
        }

        appendSvg('path', { d: 'M 80 70 Q 70 88 74 140 Q 79 162 100 162 Q 121 162 126 140 Q 130 88 120 70 Z', fill: coatColor });
        appendSvg('path', { d: 'M 78 88 Q 58 106 54 136', stroke: coatColor, 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' });
        appendSvg('path', { d: 'M 122 88 Q 142 106 146 136', stroke: coatColor, 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' });

        if (temperature < 10) {
            appendSvg('rect', { x: 78, y: 62, width: 45, height: 12, rx: 6, fill: '#fb7185' });
            appendSvg('rect', { x: 106, y: 68, width: 12, height: 34, rx: 5, fill: '#fb7185' });
        }

        if (temperature >= 20) {
            appendSvg('path', { d: 'M 84 160 L 116 160 L 122 190 L 78 190 Z', fill: pantsColor });
            appendSvg('path', { d: 'M 86 190 L 82 236', stroke: '#111827', 'stroke-width': 10, 'stroke-linecap': 'round' });
            appendSvg('path', { d: 'M 114 190 L 118 236', stroke: '#111827', 'stroke-width': 10, 'stroke-linecap': 'round' });
        } else {
            appendSvg('path', { d: 'M 84 160 L 98 160 L 94 238 L 78 238 Z', fill: pantsColor });
            appendSvg('path', { d: 'M 102 160 L 116 160 L 122 238 L 106 238 Z', fill: pantsColor });
        }

        appendSvg('path', { d: 'M 76 238 Q 88 234 96 242 L 96 248 L 72 248 Q 72 242 76 238 Z', fill: '#111827' });
        appendSvg('path', { d: 'M 104 242 Q 112 234 124 238 Q 128 242 128 248 L 104 248 Z', fill: '#111827' });

        if (isRainy) {
            appendSvg('path', { d: 'M 48 82 Q 100 28 152 82 Q 128 72 100 82 Q 72 72 48 82 Z', fill: '#38bdf8', stroke: '#0369a1', 'stroke-width': 2 });
            appendSvg('path', { d: 'M 100 82 L 100 148 Q 100 162 112 158', stroke: '#854d0e', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
        }

        function appendSvg(tag, attributes) {
            const element = document.createElementNS(ns, tag);
            Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
            personSVG.appendChild(element);
        }
    }

    searchBtn.addEventListener('click', () => searchByCity(searchInput.value.trim()));
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') searchByCity(searchInput.value.trim());
    });
    refreshBtn.addEventListener('click', refreshWeather);
    myLocationBtn.addEventListener('click', useDeviceLocation);
    favoriteBtn.addEventListener('click', toggleFavorite);
    celsiusBtn.addEventListener('click', () => {
        useCelsius = true;
        updateUnitToggle();
        if (currentSnapshot) renderWeather(currentSnapshot, offlineBanner.style.display !== 'none');
    });
    fahrenheitBtn.addEventListener('click', () => {
        useCelsius = false;
        updateUnitToggle();
        if (currentSnapshot) renderWeather(currentSnapshot, offlineBanner.style.display !== 'none');
    });
    Object.entries(themeButtons).forEach(([mode, button]) => button.addEventListener('click', () => setTheme(mode)));

    updateUnitToggle();
    setTheme(themeMode);
    renderChips();

    const cachedSnapshot = getStored(storageKeys.lastSnapshot, null);
    if (cachedSnapshot) renderWeather(cachedSnapshot, true);
    if (currentLocation) {
        fetchWeather(currentLocation);
    } else {
        useDeviceLocation();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(error => console.warn('Service worker registration failed', error));
    }
});
