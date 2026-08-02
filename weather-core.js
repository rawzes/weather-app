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

    function moonPhaseLabel(phaseFraction) {
        if (phaseFraction === undefined || phaseFraction === null) return '--';
        const p = Number(phaseFraction);
        if (p < 0.03 || p > 0.97) return 'Новолуние';
        if (p < 0.22) return 'Молодая луна';
        if (p < 0.28) return 'Первая четверть';
        if (p < 0.47) return 'Растущая луна';
        if (p < 0.53) return 'Полнолуние';
        if (p < 0.72) return 'Убывающая луна';
        if (p < 0.78) return 'Последняя четверть';
        return 'Старая луна';
    }

    function describeWindDir(deg) {
        if (deg === undefined || deg === null || Number.isNaN(Number(deg))) return '--';
        const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
        const index = Math.round(Number(deg) / 45) % 8;
        return directions[index];
    }

    function uvAdviceSeverity(uvIndex) {
        if (uvIndex === undefined || uvIndex === null || Number.isNaN(Number(uvIndex))) return null;
        const uv = Number(uvIndex);
        if (uv >= 11) return { level: 'Экстремальный', text: 'Избегайте пребывания на улице. Необходима максимальная защита.' };
        if (uv >= 8) return { level: 'Очень высокий', text: 'Используйте солнцезащитный крем SPF 50+, головной убор и очки. Ограничьте пребывание на солнце.' };
        if (uv >= 6) return { level: 'Высокий', text: 'Наденьте головной убор и солнцезащитные очки. Используйте крем.' };
        if (uv >= 3) return { level: 'Умеренный', text: 'Рекомендуется солнцезащитный крем при долгой прогулке.' };
        return { level: 'Низкий', text: 'Защита от солнца не требуется.' };
    }

    function perceivedComfort(temp, humidity, wind) {
        if (temp === undefined || temp === null || Number.isNaN(Number(temp))) return '--';
        const t = Number(temp);
        if (t < 0) return 'Морозная';
        if (t < 10) return 'Холодная';
        if (t < 20) return 'Прохладная';
        if (t < 28) return 'Комфортная';
        return 'Тёплая';
    }

    function describeDewPoint(dewPoint) {
        if (dewPoint === undefined || dewPoint === null || Number.isNaN(Number(dewPoint))) return '--';
        const dp = Number(dewPoint);
        if (dp < 0) return 'Очень сухо';
        if (dp < 10) return 'Сухо';
        if (dp < 15) return 'Комфортно';
        if (dp < 20) return 'Влажно';
        return 'Очень влажно';
    }

    function parseDailyExtras(day) {
        const items = [];
        if (day.sunrise) items.push({ icon: '🌅', text: formatHour(day.sunrise) });
        if (day.sunset) items.push({ icon: '🌇', text: formatHour(day.sunset) });
        if (day.moon_phase != null) items.push({ icon: moonPhaseEmoji(day.moon_phase), text: moonPhaseLabel(day.moon_phase) });
        if (day.uv_index_max != null) items.push({ icon: '☀️', text: `UV ${Math.round(day.uv_index_max)}` });
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

    function buildAdvice(temp, code, windSpeed, uvIndex) {
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

        const uvSeverity = uvAdviceSeverity(uvIndex);
        if (uvSeverity && uvSeverity.level !== 'Низкий') {
            return uvSeverity.text;
        }

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
        moonPhaseEmoji,
        moonPhaseLabel,
        describeWindDir,
        uvAdviceSeverity,
        perceivedComfort,
        describeDewPoint,
        parseDailyExtras,
    };
})();
