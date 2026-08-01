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

    const weatherDescriptions = {
        0: 'Ясно', 1: 'Малооблачно', 2: 'Переменная облачность', 3: 'Пасмурно',
        45: 'Туман', 48: 'Иней и туман', 51: 'Лёгкая морось', 53: 'Морось', 55: 'Сильная морось',
        56: 'Ледяная морось', 57: 'Сильная ледяная морось', 61: 'Небольшой дождь', 63: 'Дождь',
        65: 'Сильный дождь', 66: 'Ледяной дождь', 67: 'Сильный ледяной дождь', 71: 'Небольшой снег',
        73: 'Снег', 75: 'Сильный снег', 77: 'Снежная крупа', 80: 'Ливень', 81: 'Сильный ливень',
        82: 'Очень сильный ливень', 85: 'Снежный ливень', 86: 'Сильный снежный ливень',
        95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом'
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

    function buildAdvice(temp, code, windSpeed) {
        const rainy = rainyCodes.includes(code);
        const snowy = snowyCodes.includes(code);
        const stormy = stormyCodes.includes(code);
        if (stormy) return 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.';
        if (snowy) return 'Нужны тёплая обувь, шапка и нескользкая подошва. На улице может быть снежно.';
        if (rainy) return 'Возьмите зонт или дождевик. Одежда с капюшоном сегодня будет кстати.';
        if (temp < 0) return 'Очень холодно: тёплая куртка, шарф, перчатки и шапка обязательны.';
        if (temp < 10) return 'Прохладно: подойдёт куртка, плотные брюки и шарф.';
        if (temp < 20) return windSpeed > 25 ? 'Комфортно, но ветрено. Лучше взять лёгкую куртку.' : 'Погода мягкая: хватит лёгкой куртки или свитера.';
        if (temp > 28) return 'Жарко: вода, головной убор и лёгкая одежда помогут чувствовать себя лучше.';
        return 'Отличная погода для прогулки. Лёгкой одежды достаточно.';
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

    function formatDateTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ');
        return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function formatHour(value) {
        const date = new Date(value);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    function locationKey(location) {
        return `${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`;
    }

    return {
        weatherEmojis,
        weatherDescriptions,
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
    };
})();
