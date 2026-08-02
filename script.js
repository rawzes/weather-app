document.addEventListener('DOMContentLoaded', () => {
    const locationStatus = document.getElementById('location-status');
    const weatherDescription = document.getElementById('weather-description');
    const currentTemp = document.getElementById('current-temp');
    const currentUnit = document.getElementById('current-unit');
    const weatherAdvice = document.getElementById('weather-advice');
    const weatherInfo = document.getElementById('weather-info');
    const weatherEmoji = document.getElementById('weather-emoji');
    const personImage = document.getElementById('person');
    const uvBadge = document.getElementById('uv-badge');
    const sunriseInfo = document.getElementById('sunrise-info');
    const sunsetInfo = document.getElementById('sunset-info');
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
    const langButtons = {
        ru: document.getElementById('lang-ru-btn'),
        en: document.getElementById('lang-en-btn')
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

    function t(key, vars) {
        return WeatherCore.i18n.t(key, vars);
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

    function applyLanguage(lang) {
        WeatherCore.i18n.setLanguage(lang);
        const currentLang = WeatherCore.i18n.getLanguage();
        document.documentElement.lang = currentLang === 'en' ? 'en' : 'ru';

        document.title = t('appTitle');

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT') {
                el.placeholder = t(key);
            } else {
                el.textContent = t(key);
            }
        });

        Object.entries(langButtons).forEach(([langCode, button]) => {
            const isActive = currentLang === langCode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (currentSnapshot) {
            renderWeather(currentSnapshot, offlineBanner.style.display !== 'none');
        }
    }

    function buildAdvice(temp, code, windSpeed) {
        return WeatherCore.buildAdvice(temp, code, windSpeed);
    }

    function renderMetrics(current) {
        const metrics = [
            [t('feelsLike'), `${convertTemp(current.apparent_temperature)}${getTempUnit()}`],
            [t('humidity'), `${Math.round(current.relative_humidity_2m)}%`],
            [t('pressure'), `${Math.round(current.pressure_msl)} гПа`],
            [t('wind'), `${Math.round(current.wind_speed_10m)} км/ч`],
            [t('gusts'), `${Math.round(current.wind_gusts_10m)} км/ч`],
            [t('direction'), WeatherCore.describeWindDir(current.wind_direction_10m)],
            [t('dewPoint'), `${convertTemp(current.dew_point_2m)}${getTempUnit()}`],
            [t('updated'), WeatherCore.formatDateTime(current.time)],
            [t('weather'), WeatherCore.weatherDescription(current.weather_code)],
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
        weatherDescription.textContent = WeatherCore.weatherDescription(weatherCode);
        currentTemp.textContent = convertTemp(current.temperature_2m);
        currentUnit.textContent = getTempUnit();

        const uvSeverity = WeatherCore.uvAdviceSeverity(current.uv_index);
        if (uvSeverity) {
            uvBadge.textContent = `UV ${uvSeverity.level}`;
            uvBadge.setAttribute('data-level', uvSeverity.level);
        } else {
            uvBadge.textContent = t('uvNone');
            uvBadge.removeAttribute('data-level');
        }

        sunriseInfo.textContent = snapshot.daily?.[0]?.sunrise ? `🌅 ${formatHour(snapshot.daily[0].sunrise)}` : '🌅 --';
        sunsetInfo.textContent = snapshot.daily?.[0]?.sunset ? `🌇 ${formatHour(snapshot.daily[0].sunset)}` : '🌇 --';

        weatherAdvice.textContent = buildAdvice(current.temperature_2m, weatherCode, current.wind_speed_10m, current.uv_index);
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
            hourlyForecastList.innerHTML = `<div class="chip empty">${t('hourlyUnavailable')}</div>`;
            return;
        }

        hourlyForecastList.innerHTML = hourly.map(item => `
            <article class="hourly-card" aria-label="${formatHour(item.time)}, ${convertTemp(item.temperature_2m)}${getTempUnit()}">
                <span class="hourly-time">${formatHour(item.time)}</span>
                <span class="hourly-emoji">${WeatherCore.weatherEmojis[item.weather_code] || '🌤️'}</span>
                <span class="hourly-temp">${convertTemp(item.temperature_2m)}${getTempUnit()}</span>
                ${item.precipitation_probability != null ? `<span class="hourly-precip">${Math.round(item.precipitation_probability)}%</span>` : ''}
                ${item.wind_direction_10m != null ? `<span class="hourly-wind">${WeatherCore.describeWindDir(item.wind_direction_10m)}</span>` : ''}
            </article>
        `).join('');
    }

    function renderWeeklyForecast(daily) {
        if (!daily.length) {
            weeklyForecastList.innerHTML = `<div class="chip empty">${t('weeklyUnavailable')}</div>`;
            return;
        }

        const today = new Date().toDateString();
        const temps = daily.flatMap(item => [item.temperature_2m_min, item.temperature_2m_max]);
        const minRange = Math.min(...temps);
        const maxRange = Math.max(...temps);
        const range = Math.max(maxRange - minRange, 1);

        weeklyForecastList.innerHTML = daily.map((item, index) => {
            const date = new Date(item.time);
            const dayName = date.toLocaleDateString(WeatherCore.i18n.locale(), { weekday: 'short' });
            const isToday = date.toDateString() === today;
            const fill = Math.max(18, ((item.temperature_2m_max - minRange) / range) * 100);

            const extras = WeatherCore.parseDailyExtras(item);
            const extrasHtml = extras.map(ex => `<span>${ex.icon} ${ex.text}</span>`).join('');

            const feelsLikeMin = item.apparent_temperature_min != null ? convertTemp(item.apparent_temperature_min) : null;
            const feelsLikeMax = item.apparent_temperature_max != null ? convertTemp(item.apparent_temperature_max) : null;

            return `
                <article class="forecast-day ${isToday ? 'forecast-today' : ''}" style="animation-delay:${index * 0.05}s" aria-label="${dayName}, ${WeatherCore.weatherDescription(item.weather_code)}">
                    <span class="forecast-day-name">${isToday ? t('today') : dayName}</span>
                    <span class="forecast-emoji">${WeatherCore.weatherEmojis[item.weather_code] || '🌤️'}</span>
                    <span class="forecast-temp">${convertTemp(item.temperature_2m_min)} / ${convertTemp(item.temperature_2m_max)}${getTempUnit()}</span>
                    ${feelsLikeMin != null && feelsLikeMax != null ? `<span class="forecast-feels">${t('feelsLikeRange')}${feelsLikeMin} / ${feelsLikeMax}${getTempUnit()}</span>` : ''}
                    <span class="temp-bar"><span class="temp-bar-fill" style="width:${fill}%"></span></span>
                    ${extrasHtml ? `<span class="forecast-extras">${extrasHtml}</span>` : ''}
                </article>
            `;
        }).join('');
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
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,dew_point_2m,wind_direction_10m',
            hourly: 'temperature_2m,weather_code,precipitation_probability,wind_direction_10m,uv_index,dew_point_2m',
            daily: 'weather_code,temperature_2m_min,temperature_2m_max,uv_index_max,sunrise,sunset,moon_phase,moonrise,moonset,apparent_temperature_min,apparent_temperature_max,wind_direction_10m_dominant',
            timezone: 'auto',
            forecast_days: '7'
        });

        try {
            locationStatus.textContent = `${t('loadingWeatherFor')}${location.name}...`;
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
                showError(t('errorOffline'));
            } else {
                showError(t('errorGeneric'));
                showForecastError(t('errorForecast'));
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
        locationStatus.textContent = `${t('searchingCity')}${city}...`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&accept-language=${WeatherCore.i18n.getLanguage()}`);
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();
            if (!data[0]) {
                showError(t('searchNotFound', { s: city }));
                locationStatus.textContent = t('tryAnotherQuery');
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
            showError(t('searchError', { s: city }));
        } finally {
            setLoading(false);
        }
    }

    async function reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${WeatherCore.i18n.getLanguage()}`);
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
            locationStatus.textContent = t('detectingLocationIP');
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
            showError(t('errorLocationIP'));
            const fallback = { name: 'Москва', latitude: 55.7558, longitude: 37.6176 };
            await fetchWeather(fallback);
        }
    }

    function handleLocationError(error) {
        const messages = {
            1: t('errorGeolocationBlocked'),
            2: t('errorGeolocationUnavailable'),
            3: t('errorGeolocationTimeout')
        };
        locationStatus.textContent = messages[error.code] || t('unknownErrorGeolocation');
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
            locationStatus.textContent = t('errorGeolocationNotSupported');
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
        favoriteBtn.textContent = active ? t('favoriteBtnActive') : t('favoriteBtn');
        favoriteBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    function renderChips() {
        renderChipList(favoritesList, favorites, t('noFavorites'));
        renderChipList(historyList, history, t('noHistory'));
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
        const isRainy = WeatherCore.rainyCodes.includes(weatherCode);
        const isSnowy = WeatherCore.snowyCodes.includes(weatherCode);
        const photo = isRainy
            ? { query: 'person,rain,umbrella', lock: 1 }
            : isSnowy
                ? { query: 'person,winter,snow', lock: 2 }
                : temperature < 10
                    ? { query: 'person,winter,coat', lock: 3 }
                    : temperature >= 28
                        ? { query: 'person,summer,sunglasses', lock: 4 }
                        : { query: 'person,outdoor,weather', lock: 5 };

        const nextSrc = `https://loremflickr.com/480/640/${photo.query}?lock=${photo.lock}`;
        personImage.classList.add('is-loading');
        personImage.classList.remove('is-unavailable');
        personImage.alt = t('clothingAdvice');
        personImage.onload = () => personImage.classList.remove('is-loading');
        personImage.onerror = () => {
            personImage.onerror = null;
            personImage.src = 'icon.svg';
            personImage.classList.remove('is-loading');
            personImage.classList.add('is-unavailable');
        };

        if (personImage.src !== nextSrc) personImage.src = nextSrc;
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
    Object.entries(langButtons).forEach(([langCode, button]) => button.addEventListener('click', () => applyLanguage(langCode)));

    updateUnitToggle();
    setTheme(themeMode);
    renderChips();
    applyLanguage(WeatherCore.i18n.getLanguage());

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
