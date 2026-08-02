/**
 * WeatherCore — чистые функции и данные для Weather Companion.
 * Вынесены из script.js для возможности модульного тестирования.
 */
var WeatherCore = (function () {
    const weatherEmojis = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌧️', 57: '🌧️',
        61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
        71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️', 85: '❄️', 86: '❄️',
        80: '🌧️', 81: '🌧️', 82: '🌧️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
    };

    const weatherDescriptionsRaw = {
        0: { ru: 'Ясно', en: 'Clear' },
        1: { ru: 'Малооблачно', en: 'Mainly clear' },
        2: { ru: 'Переменная облачность', en: 'Partly cloudy' },
        3: { ru: 'Пасмурно', en: 'Overcast' },
        45: { ru: 'Туман', en: 'Fog' },
        48: { ru: 'Иней и туман', en: 'Depositing rime fog' },
        51: { ru: 'Лёгкая морось', en: 'Light drizzle' },
        53: { ru: 'Морось', en: 'Moderate drizzle' },
        55: { ru: 'Сильная морось', en: 'Dense drizzle' },
        56: { ru: 'Ледяная морось', en: 'Light freezing drizzle' },
        57: { ru: 'Сильная ледяная морось', en: 'Dense freezing drizzle' },
        61: { ru: 'Небольшой дождь', en: 'Slight rain' },
        63: { ru: 'Дождь', en: 'Moderate rain' },
        65: { ru: 'Сильный дождь', en: 'Heavy rain' },
        66: { ru: 'Ледяной дождь', en: 'Light freezing rain' },
        67: { ru: 'Сильный ледяной дождь', en: 'Heavy freezing rain' },
        71: { ru: 'Небольшой снег', en: 'Slight snow fall' },
        73: { ru: 'Снег', en: 'Moderate snow fall' },
        75: { ru: 'Сильный снег', en: 'Heavy snow fall' },
        77: { ru: 'Снежная крупа', en: 'Snow grains' },
        80: { ru: 'Ливень', en: 'Slight rain showers' },
        81: { ru: 'Сильный ливень', en: 'Moderate rain showers' },
        82: { ru: 'Очень сильный ливень', en: 'Violent rain showers' },
        85: { ru: 'Снежный ливень', en: 'Slight snow showers' },
        86: { ru: 'Сильный снежный ливень', en: 'Heavy snow showers' },
        95: { ru: 'Гроза', en: 'Thunderstorm' },
        96: { ru: 'Гроза с градом', en: 'Thunderstorm with slight hail' },
        99: { ru: 'Сильная гроза с градом', en: 'Thunderstorm with heavy hail' }
    };

    const weatherBodyClasses = {
        0: 'body-weather-clear', 1: 'body-weather-cloudy', 2: 'body-weather-cloudy', 3: 'body-weather-cloudy',
        45: 'body-weather-cloudy', 48: 'body-weather-cloudy', 51: 'body-weather-rainy', 53: 'body-weather-rainy',
        55: 'body-weather-rainy', 56: 'body-weather-rainy', 57: 'body-weather-rainy', 61: 'body-weather-rainy',
        63: 'body-weather-rainy', 65: 'body-weather-rainy', 66: 'body-weather-rainy', 67: 'body-weather-rainy',
        71: 'body-weather-snowy', 73: 'body-weather-snowy', 75: 'body-weather-snowy', 77: 'body-weather-snowy',
        80: 'body-weather-rainy', 81: 'body-weather-rainy', 82: 'body-weather-rainy', 85: 'body-weather-snowy',
        86: 'body-weather-snowy', 95: 'body-weather-stormy', 96: 'body-weather-stormy', 99: 'body-weather-stormy'
    };

    const rainyCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
    const snowyCodes = [71, 73, 75, 77, 85, 86];
    const stormyCodes = [95, 96, 99];

    function moonPhaseEmoji(phaseFraction) {
        if (phaseFraction === undefined || phaseFraction === null) return '';
        const p = Number(phaseFraction);
        if (p < 0.03 || p > 0.97) return '🌑';
        if (p < 0.22) return '🌒';
        if (p < 0.28) return '🌓';
        if (p < 0.47) return '🌔';
        if (p < 0.53) return '🌕';
        if (p < 0.72) return '🌖';
        if (p < 0.78) return '🌗';
        if (p < 0.97) return '🌘';
        return '🌑';
    }

    const translations = {
        appTitle: { ru: 'Погодное приложение', en: 'Weather app' },
        eyebrow: { ru: 'Погода рядом с вами', en: 'Weather near you' },
        tagline: { ru: 'Небо, одежда и прогноз в одном экране', en: 'Sky, outfit and forecast in one screen' },
        themeAuto: { ru: 'Авто', en: 'Auto' },
        themeLight: { ru: 'Светлая', en: 'Light' },
        themeDark: { ru: 'Тёмная', en: 'Dark' },
        searchPlaceholder: { ru: 'Найти город...', en: 'Find a city...' },
        searchBtn: { ru: 'Найти', en: 'Search' },
        refreshBtn: { ru: 'Обновить', en: 'Refresh' },
        locationBtn: { ru: 'Моё местоположение', en: 'My location' },
        favoriteBtn: { ru: 'В избранное', en: 'Favorite' },
        favoriteBtnActive: { ru: 'В избранном', en: 'Favorited' },
        favoritesTitle: { ru: 'Избранные', en: 'Favorites' },
        historyTitle: { ru: 'История', en: 'History' },
        noFavorites: { ru: 'Нет избранных городов', en: 'No favorite cities' },
        noHistory: { ru: 'История появится после поиска', en: 'History appears after search' },
        loading: { ru: 'Загрузка...', en: 'Loading...' },
        loadingForecast: { ru: 'Загрузка прогноза...', en: 'Loading forecast...' },
        errorGeneric: { ru: 'Ошибка данных. Попробуйте позже.', en: 'Data error. Please try again later.' },
        errorForecast: { ru: 'Ошибка прогноза. Проверьте соединение.', en: 'Forecast error. Check your connection.' },
        errorOffline: { ru: 'Не удалось обновить прогноз. Используем последние сохранённые данные.', en: 'Could not refresh forecast. Using last saved data.' },
        offlineBanner: { ru: 'Показаны последние сохранённые данные.', en: 'Showing last saved data.' },
        hourlyTitle: { ru: 'Сегодня по часам', en: 'Hourly forecast' },
        weeklyTitle: { ru: 'Прогноз на неделю', en: 'Weekly forecast' },
        hourlyUnavailable: { ru: 'Почасовой прогноз недоступен', en: 'Hourly forecast unavailable' },
        weeklyUnavailable: { ru: 'Прогноз на неделю недоступен', en: 'Weekly forecast unavailable' },
        weatherUpdated: { ru: 'Погода обновлена', en: 'Weather updated' },
        uvLow: { ru: 'Низкий', en: 'Low' },
        uvNone: { ru: '--', en: '--' },
        advicePrefix: { ru: '', en: '' },
        feelsLike: { ru: 'Ощущается как', en: 'Feels like' },
        humidity: { ru: 'Влажность', en: 'Humidity' },
        pressure: { ru: 'Давление', en: 'Pressure' },
        wind: { ru: 'Ветер', en: 'Wind' },
        gusts: { ru: 'Порывы', en: 'Gusts' },
        direction: { ru: 'Направление', en: 'Direction' },
        dewPoint: { ru: 'Точка росы', en: 'Dew point' },
        updated: { ru: 'Обновлено', en: 'Updated' },
        weather: { ru: 'Погода', en: 'Weather' },
        errorLocationIP: { ru: 'Не удалось определить местоположение по IP.', en: 'Could not detect location by IP.' },
        errorGeolocationBlocked: { ru: 'Геолокация запрещена. Используем определение по IP.', en: 'Geolocation blocked. Falling back to IP location.' },
        errorGeolocationUnavailable: { ru: 'Местоположение недоступно. Используем определение по IP.', en: 'Location unavailable. Falling back to IP location.' },
        errorGeolocationTimeout: { ru: 'Геолокация не ответила вовремя. Используем определение по IP.', en: 'Geolocation timed out. Falling back to IP location.' },
        errorGeolocationNotSupported: { ru: 'Геолокация не поддерживается.', en: 'Geolocation not supported.' },
        searchingCity: { ru: 'Ищем город: ', en: 'Searching city: ' },
        searchNotFound: { ru: 'Город "%s" не найден.', en: 'City "%s" not found.' },
        searchError: { ru: 'Ошибка поиска города "%s".', en: 'Error searching city "%s".' },
        loadingWeatherFor: { ru: 'Загружаем погоду: ', en: 'Loading weather for: ' },
        detectingLocation: { ru: 'Определяем ваше местоположение...', en: 'Detecting your location...' },
        detectingLocationIP: { ru: 'Определяем местоположение по IP...', en: 'Detecting location by IP...' },
        footerTitle: { ru: 'Weather Companion', en: 'Weather Companion' },
        footerSubtitle: { ru: 'Разработчик: ', en: 'Developer: ' },
        footerText: { ru: '© 2026. Минималистичный прогноз с PWA-режимом, историей поиска и offline-кэшем.', en: '© 2026. Minimal forecast with PWA mode, search history and offline cache.' },
        skipLink: { ru: 'Перейти к погоде', en: 'Skip to weather' },
        searchLabel: { ru: 'Найти город', en: 'Search city' },
        themeAuto: { ru: 'Авто', en: 'Auto' },
        themeLight: { ru: 'Светлая', en: 'Light' },
        themeDark: { ru: 'Тёмная', en: 'Dark' },
        langRu: { ru: 'РУ', en: 'EN' },
        langEn: { ru: 'РУ', en: 'EN' },
        themeLabel: { ru: 'Тема оформления', en: 'Theme' },
        langLabel: { ru: 'Язык', en: 'Language' },
        unitToggleLabel: { ru: 'Единицы температуры', en: 'Temperature units' },
        controlPanelLabel: { ru: 'Поиск и настройки', en: 'Search and settings' },
        pressureUnit: { ru: 'гПа', en: 'hPa' },
        windUnit: { ru: 'км/ч', en: 'km/h' },
        currentLocation: { ru: 'Текущее местоположение', en: 'Current location' },
        moscowFallback: { ru: 'Москва', en: 'Moscow' },
        clothingAdvice: { ru: 'Рекомендация по одежде', en: 'Clothing recommendation' },
        footerWeatherData: { ru: 'Погодные данные', en: 'Weather data' },
        footerMapData: { ru: 'Поиск городов', en: 'City search' },
        tryAnotherQuery: { ru: 'Попробуйте другой запрос', en: 'Try another query' },
        feelsLikeRange: { ru: 'Ощущается: ', en: 'Feels like: ' },
        today: { ru: 'Сегодня', en: 'Today' },
        weatherUnknown: { ru: 'Неизвестно', en: 'Unknown' }
    };

    const moonPhasesRu = {
        0.03: 'Новолуние', 0.22: 'Молодая луна', 0.28: 'Первая четверть', 0.47: 'Растущая луна',
        0.53: 'Полнолуние', 0.72: 'Убывающая луна', 0.78: 'Последняя четверть', 0.97: 'Старая луна'
    };
    const moonPhasesEn = {
        0.03: 'New Moon', 0.22: 'Waxing Crescent', 0.28: 'First Quarter', 0.47: 'Waxing Gibbous',
        0.53: 'Full Moon', 0.72: 'Waning Gibbous', 0.78: 'Last Quarter', 0.97: 'Waning Crescent'
    };

    const windDirectionsRu = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const windDirectionsEn = ['N', 'NNE', 'E', 'ENE', 'S', 'WSW', 'W', 'NNW'];

    const uvLevelsRu = {
        0: 'Низкий',
        3: 'Умеренный',
        6: 'Высокий',
        8: 'Очень высокий',
        11: 'Экстремальный'
    };
    const uvLevelsEn = {
        0: 'Low',
        3: 'Moderate',
        6: 'High',
        8: 'Very High',
        11: 'Extreme'
    };

    let currentLang = 'ru';

    function i18nKey(rawKey) {
        if (rawKey && rawKey.startsWith('i18n:')) return rawKey.slice(5);
        return rawKey;
    }

    const i18n = {
        setLanguage(lang) {
            if (lang !== 'ru' && lang !== 'en') return;
            currentLang = lang;
            try { localStorage.setItem('weatherApp.lang', lang); } catch {}
        },
        getLanguage() {
            try { const v = localStorage.getItem('weatherApp.lang'); if (v === 'ru' || v === 'en') return v; } catch {}
            return 'ru';
        },
        t(key, vars) {
            const entry = translations[key];
            if (!entry) return key;
            let text = entry[currentLang] || entry['ru'] || key;
            if (vars) {
                Object.entries(vars).forEach(([k, v]) => {
                    text = text.replace(`%s`, String(v));
                });
            }
            return text;
        },
        locale() {
            return currentLang === 'en' ? 'en-US' : 'ru-RU';
        }
    };

    function moonPhaseLabel(phaseFraction) {
        if (phaseFraction === undefined || phaseFraction === null) return '--';
        const p = Number(phaseFraction);
        const map = currentLang === 'en' ? moonPhasesEn : moonPhasesRu;
        const thresholds = Object.keys(map).map(Number).sort((a, b) => a - b);
        if (p < 0.03 || p > 0.97) return map[0.03];
        for (const threshold of thresholds) {
            if (p < threshold) return map[threshold];
        }
        return map[0.97];
    }

    function describeWindDir(deg) {
        if (deg === undefined || deg === null || Number.isNaN(Number(deg))) return '--';
        const directions = currentLang === 'en' ? windDirectionsEn : windDirectionsRu;
        const index = Math.round(Number(deg) / 45) % 8;
        return directions[index] || '--';
    }

    function uvAdviceSeverity(uvIndex) {
        if (uvIndex === undefined || uvIndex === null || Number.isNaN(Number(uvIndex))) return null;
        const uv = Number(uvIndex);
        const levels = currentLang === 'en' ? uvLevelsEn : uvLevelsRu;
        const thresholds = Object.keys(levels).map(Number).sort((a, b) => b - a);
        for (const threshold of thresholds) {
            if (uv >= threshold) {
                const level = levels[threshold];
                const texts = currentLang === 'en' ? {
                    'Extreme': 'Avoid being outside. Maximum protection required.',
                    'Very High': 'Use SPF 50+ sunscreen, a hat, and sunglasses. Limit sun exposure.',
                    'High': 'Wear a hat and sunglasses. Use sunscreen.',
                    'Moderate': 'Sunscreen is recommended for extended outdoor time.',
                    'Low': 'Sun protection not required.'
                } : {
                    'Экстремальный': 'Избегайте пребывания на улице. Необходима максимальная защита.',
                    'Очень высокий': 'Используйте солнцезащитный крем SPF 50+, головной убор и очки. Ограничьте пребывание на солнце.',
                    'Высокий': 'Наденьте головной убор и солнцезащитные очки. Используйте крем.',
                    'Умеренный': 'Рекомендуется солнцезащитный крем при долгой прогулке.',
                    'Низкий': 'Защита от солнца не требуется.'
                };
                return { level, text: texts[level] };
            }
        }
        return null;
    }

    function perceivedComfort(temp, humidity, wind) {
        if (temp === undefined || temp === null || Number.isNaN(Number(temp))) return '--';
        const t = Number(temp);
        const ru = ['Морозная', 'Холодная', 'Прохладная', 'Комфортная', 'Тёплая'];
        const en = ['Freezing', 'Cold', 'Cool', 'Comfortable', 'Warm'];
        const labels = currentLang === 'en' ? en : ru;
        if (t < 0) return labels[0];
        if (t < 10) return labels[1];
        if (t < 20) return labels[2];
        if (t < 28) return labels[3];
        return labels[4];
    }

    function describeDewPoint(dewPoint) {
        if (dewPoint === undefined || dewPoint === null || Number.isNaN(Number(dewPoint))) return '--';
        const dp = Number(dewPoint);
        const ru = ['Очень сухо', 'Сухо', 'Комфортно', 'Влажно', 'Очень влажно'];
        const en = ['Very dry', 'Dry', 'Comfortable', 'Humid', 'Very humid'];
        const labels = currentLang === 'en' ? en : ru;
        if (dp < 0) return labels[0];
        if (dp < 10) return labels[1];
        if (dp < 15) return labels[2];
        if (dp < 20) return labels[3];
        return labels[4];
    }

    function buildAdvice(temp, code, windSpeed, uvIndex) {
        const rainy = rainyCodes.includes(code);
        const snowy = snowyCodes.includes(code);
        const stormy = stormyCodes.includes(code);
        const t = Number(temp);
        const ws = Number(windSpeed);
        if (stormy) return currentLang === 'en'
            ? 'Consider postponing a long walk: thunder, strong wind and sudden precipitation possible.'
            : 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.';
        if (snowy) return currentLang === 'en'
            ? 'Warm shoes, hat and non-slip soles needed. It may be snowy outside.'
            : 'Нужны тёплая обувь, шапка и нескользкая подошва. На улице может быть снежно.';
        if (rainy) return currentLang === 'en'
            ? 'Take an umbrella or raincoat. Hooded clothing will be useful today.'
            : 'Возьмите зонт или дождевик. Одежда с капюшоном сегодня будет кстати.';
        if (t < 0) return currentLang === 'en'
            ? 'Very cold: warm jacket, scarf, gloves and hat are essential.'
            : 'Очень холодно: тёплая куртка, шарф, перчатки и шапка обязательны.';
        if (t < 10) return currentLang === 'en'
            ? 'Cool: a jacket, thick pants and scarf will do.'
            : 'Прохладно: подойдёт куртка, плотные брюки и шарф.';
        if (t < 20) return ws > 25 ? (currentLang === 'en' ? 'Comfortable but windy. Better take a light jacket.' : 'Комфортно, но ветрено. Лучше взять лёгкую куртку.') : (currentLang === 'en' ? 'Mild weather: a light jacket or sweater is enough.' : 'Погода мягкая: хватит лёгкой куртки или свитера.');
        if (t > 28) return currentLang === 'en'
            ? 'Hot: water, a hat and light clothing will help you feel better.'
            : 'Жарко: вода, головной убор и лёгкая одежда помогут чувствовать себя лучше.';

        const uvSeverity = uvAdviceSeverity(uvIndex);
        if (uvSeverity && uvSeverity.level !== (currentLang === 'en' ? 'Low' : 'Низкий')) {
            return uvSeverity.text;
        }

        return currentLang === 'en'
            ? 'Great weather for a walk. Light clothing is enough.'
            : 'Отличная погода для прогулки. Лёгкой одежды достаточно.';
    }

    function parseDailyExtras(day) {
        const items = [];
        if (day.sunrise) items.push({ icon: '🌅', text: formatHour(day.sunrise) });
        if (day.sunset) items.push({ icon: '🌇', text: formatHour(day.sunset) });
        if (day.moon_phase != null) items.push({ icon: moonPhaseEmoji(day.moon_phase), text: moonPhaseLabel(day.moon_phase) });
        if (day.uv_index_max != null) items.push({ icon: '☀️', text: `${currentLang === 'en' ? 'UV' : 'UV'} ${Math.round(day.uv_index_max)}` });
        if (day.wind_direction_10m_dominant != null) items.push({ icon: '🧭', text: describeWindDir(day.wind_direction_10m_dominant) });
        return items;
    }

    function getStored(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function setStored(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage can be unavailable in private mode; the app should still work.
        }
    }

    function convertTemp(celsius, useCelsius) {
        if (celsius === null || celsius === undefined || Number.isNaN(Number(celsius))) return '--';
        return useCelsius ? Math.round(celsius) : Math.round(celsius * 9 / 5 + 32);
    }

    function getTempUnit(useCelsius) {
        return useCelsius ? '°C' : '°F';
    }

    function shouldUseLightTheme() {
        const hour = new Date().getHours();
        return hour >= 7 && hour < 20;
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
                    weather_code: data.hourly.weather_code[i],
                    precipitation_probability: data.hourly.precipitation_probability?.[i],
                    wind_direction_10m: data.hourly.wind_direction_10m?.[i],
                    uv_index: data.hourly.uv_index?.[i],
                    dew_point_2m: data.hourly.dew_point_2m?.[i]
                });
            }
            if (hourly.length >= 12) break;
        }

        for (let i = 0; i < (data.daily?.time?.length || 0); i += 1) {
            daily.push({
                time: data.daily.time[i],
                weather_code: data.daily.weather_code[i],
                temperature_2m_min: data.daily.temperature_2m_min[i],
                temperature_2m_max: data.daily.temperature_2m_max[i],
                uv_index_max: data.daily.uv_index_max?.[i],
                sunrise: data.daily.sunrise?.[i],
                sunset: data.daily.sunset?.[i],
                moon_phase: data.daily.moon_phase?.[i],
                moonrise: data.daily.moonrise?.[i],
                moonset: data.daily.moonset?.[i],
                apparent_temperature_min: data.daily.apparent_temperature_min?.[i],
                apparent_temperature_max: data.daily.apparent_temperature_max?.[i],
                wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant?.[i]
            });
        }

        return { location, current, hourly, daily, savedAt: new Date().toISOString() };
    }

    function formatDateTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ');
        return date.toLocaleString(i18n.locale(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function formatHour(value) {
        const date = new Date(value);
        return date.toLocaleTimeString(i18n.locale(), { hour: '2-digit', minute: '2-digit' });
    }

    function locationKey(location) {
        return `${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`;
    }

    function weatherDescription(code) {
        const desc = weatherDescriptionsRaw[code];
        if (!desc) return currentLang === 'en' ? 'Unknown' : 'Неизвестно';
        return typeof desc === 'string' ? desc : desc[currentLang] || desc['ru'];
    }

    return {
        weatherEmojis,
        weatherDescriptions: weatherDescriptionsRaw,
        weatherBodyClasses,
        rainyCodes,
        snowyCodes,
        stormyCodes,
        getStored,
        setStored,
        convertTemp,
        getTempUnit,
        shouldUseLightTheme,
        buildAdvice,
        normalizeForecast,
        formatDateTime,
        formatHour,
        locationKey,
        moonPhaseEmoji,
        moonPhaseLabel,
        describeWindDir,
        uvAdviceSeverity,
        perceivedComfort,
        describeDewPoint,
        parseDailyExtras,
        weatherDescription,
        i18n
    };
})();
