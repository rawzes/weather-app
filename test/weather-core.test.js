module.exports = function (WeatherCore, assert, { describe, it }) {
    describe('WeatherCore — data maps', () => {
        it('weatherEmojis maps clear sky code 0 to ☀️', () => {
            assert.equal(WeatherCore.weatherEmojis[0], '☀️');
        });

        it('weatherEmojis maps rain code 61 to 🌧️', () => {
            assert.equal(WeatherCore.weatherEmojis[61], '🌧️');
        });

        it('weatherEmojis maps snow code 71 to ❄️', () => {
            assert.equal(WeatherCore.weatherEmojis[71], '❄️');
        });

        it('weatherEmojis maps storm code 95 to ⛈️', () => {
            assert.equal(WeatherCore.weatherEmojis[95], '⛈️');
        });

        it('weatherDescriptions maps clear sky code 0 to Ясно', () => {
            assert.equal(WeatherCore.weatherDescriptions[0], 'Ясно');
        });

        it('weatherDescriptions maps rain code 63 to Дождь', () => {
            assert.equal(WeatherCore.weatherDescriptions[63], 'Дождь');
        });

        it('weatherBodyClasses maps clear sky code 0 to body-weather-clear', () => {
            assert.equal(WeatherCore.weatherBodyClasses[0], 'body-weather-clear');
        });

        it('weatherBodyClasses maps rain code 61 to body-weather-rainy', () => {
            assert.equal(WeatherCore.weatherBodyClasses[61], 'body-weather-rainy');
        });

        it('weatherBodyClasses maps snow code 71 to body-weather-snowy', () => {
            assert.equal(WeatherCore.weatherBodyClasses[71], 'body-weather-snowy');
        });

        it('weatherBodyClasses maps storm code 95 to body-weather-stormy', () => {
            assert.equal(WeatherCore.weatherBodyClasses[95], 'body-weather-stormy');
        });

        it('rainyCodes contains all rainy weather codes', () => {
            assert.arrayContains(WeatherCore.rainyCodes, 51);
            assert.arrayContains(WeatherCore.rainyCodes, 61);
            assert.arrayContains(WeatherCore.rainyCodes, 80);
        });

        it('snowyCodes contains all snowy weather codes', () => {
            assert.arrayContains(WeatherCore.snowyCodes, 71);
            assert.arrayContains(WeatherCore.snowyCodes, 75);
            assert.arrayContains(WeatherCore.snowyCodes, 85);
        });

        it('stormyCodes contains all stormy weather codes', () => {
            assert.arrayContains(WeatherCore.stormyCodes, 95);
            assert.arrayContains(WeatherCore.stormyCodes, 96);
            assert.arrayContains(WeatherCore.stormyCodes, 99);
        });
    });

    describe('WeatherCore — getStored / setStored', () => {
        it('getStored returns fallback when key is missing', () => {
            localStorage.clear();
            assert.equal(WeatherCore.getStored('nonexistent', 'default'), 'default');
        });

        it('getStored returns parsed JSON value when key exists', () => {
            localStorage.setItem('testkey', JSON.stringify({ foo: 'bar' }));
            assert.deepEqual(WeatherCore.getStored('testkey', null), { foo: 'bar' });
        });

        it('getStored returns fallback on invalid JSON', () => {
            localStorage.setItem('badjson', 'not-json');
            assert.equal(WeatherCore.getStored('badjson', 'fallback'), 'fallback');
        });

        it('setStored stores a value', () => {
            WeatherCore.setStored('settest', { a: 1 });
            assert.equal(localStorage.getItem('settest'), '{"a":1}');
        });

        it('setStored handles storage errors gracefully', () => {
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = () => { throw new Error('Quota exceeded'); };
            WeatherCore.setStored('errorkey', 'value');
            localStorage.setItem = originalSetItem;
        });
    });

    describe('WeatherCore — convertTemp', () => {
        it('converts 0°C to 0°C when useCelsius is true', () => {
            assert.equal(WeatherCore.convertTemp(0, true), 0);
        });

        it('converts 100°C to 100°C when useCelsius is true', () => {
            assert.equal(WeatherCore.convertTemp(100, true), 100);
        });

        it('converts 0°C to 32°F when useCelsius is false', () => {
            assert.equal(WeatherCore.convertTemp(0, false), 32);
        });

        it('converts 100°C to 212°F when useCelsius is false', () => {
            assert.equal(WeatherCore.convertTemp(100, false), 212);
        });

        it('converts -40°C to -40°F (same point)', () => {
            assert.equal(WeatherCore.convertTemp(-40, false), -40);
        });

        it('returns -- for null input', () => {
            assert.equal(WeatherCore.convertTemp(null, true), '--');
        });

        it('returns -- for undefined input', () => {
            assert.equal(WeatherCore.convertTemp(undefined, true), '--');
        });

        it('returns -- for NaN input', () => {
            assert.equal(WeatherCore.convertTemp(NaN, true), '--');
        });

        it('rounds to nearest integer', () => {
            assert.equal(WeatherCore.convertTemp(23.6, true), 24);
        });
    });

    describe('WeatherCore — getTempUnit', () => {
        it('returns °C when useCelsius is true', () => {
            assert.equal(WeatherCore.getTempUnit(true), '°C');
        });

        it('returns °F when useCelsius is false', () => {
            assert.equal(WeatherCore.getTempUnit(false), '°F');
        });
    });

    describe('WeatherCore — shouldUseLightTheme', () => {
        it('returns a boolean', () => {
            const result = WeatherCore.shouldUseLightTheme();
            assert.equal(typeof result === 'boolean', true, 'should return boolean');
        });

        it('returns true during daytime hours (7-19)', () => {
            const realGetHours = Date.prototype.getHours;
            Date.prototype.getHours = () => 12;
            assert.equal(WeatherCore.shouldUseLightTheme(), true);
            Date.prototype.getHours = realGetHours;
        });

        it('returns false during nighttime hours (20-6)', () => {
            const realGetHours = Date.prototype.getHours;
            Date.prototype.getHours = () => 23;
            assert.equal(WeatherCore.shouldUseLightTheme(), false);
            Date.prototype.getHours = realGetHours;
        });
    });

    describe('WeatherCore — buildAdvice', () => {
        it('returns storm advice for stormy codes', () => {
            assert.equal(WeatherCore.buildAdvice(15, 95, 10), 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.');
        });

        it('returns storm advice for stormy code 96', () => {
            assert.equal(WeatherCore.buildAdvice(15, 96, 10), 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.');
        });

        it('returns storm advice for stormy code 99', () => {
            assert.equal(WeatherCore.buildAdvice(15, 99, 10), 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.');
        });

        it('returns snowy advice for snowy codes', () => {
            assert.equal(WeatherCore.buildAdvice(-5, 71, 5), 'Нужны тёплая обувь, шапка и нескользкая подошва. На улице может быть снежно.');
        });

        it('returns snowy advice for code 85', () => {
            assert.equal(WeatherCore.buildAdvice(-5, 85, 5), 'Нужны тёплая обувь, шапка и нескользкая подошва. На улице может быть снежно.');
        });

        it('returns rainy advice for rainy codes', () => {
            assert.equal(WeatherCore.buildAdvice(10, 61, 5), 'Возьмите зонт или дождевик. Одежда с капюшоном сегодня будет кстати.');
        });

        it('returns rainy advice for code 80', () => {
            assert.equal(WeatherCore.buildAdvice(10, 80, 5), 'Возьмите зонт или дождевик. Одежда с капюшоном сегодня будет кстати.');
        });

        it('returns cold advice for temp < 0', () => {
            assert.equal(WeatherCore.buildAdvice(-10, 0, 5), 'Очень холодно: тёплая куртка, шарф, перчатки и шапка обязательны.');
        });

        it('returns cool advice for temp 0-9', () => {
            assert.equal(WeatherCore.buildAdvice(5, 0, 5), 'Прохладно: подойдёт куртка, плотные брюки и шарф.');
        });

        it('returns windy advice for temp 10-19 with high wind', () => {
            assert.equal(WeatherCore.buildAdvice(15, 0, 30), 'Комфортно, но ветрено. Лучше взять лёгкую куртку.');
        });

        it('returns mild advice for temp 10-19 with low wind', () => {
            assert.equal(WeatherCore.buildAdvice(15, 0, 10), 'Погода мягкая: хватит лёгкой куртки или свитера.');
        });

        it('returns hot advice for temp > 28', () => {
            assert.equal(WeatherCore.buildAdvice(35, 0, 5), 'Жарко: вода, головной убор и лёгкая одежда помогут чувствовать себя лучше.');
        });

        it('returns pleasant advice for temp 20-28 with no precipitation', () => {
            assert.equal(WeatherCore.buildAdvice(22, 0, 10), 'Отличная погода для прогулки. Лёгкой одежды достаточно.');
        });
    });

    describe('WeatherCore — normalizeForecast', () => {
        it('returns location and current data', () => {
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [], temperature_2m: [], weather_code: [] },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const location = { name: 'Moscow', latitude: 55.7558, longitude: 37.6176 };
            const result = WeatherCore.normalizeForecast(data, location);
            assert.equal(result.location.name, 'Moscow');
            assert.equal(result.current.temperature_2m, 20);
        });

        it('filters hourly data to current day only', () => {
            const now = new Date();
            const past = new Date(now.getTime() - 86400000).toISOString();
            const future = new Date(now.getTime() + 3600000).toISOString();
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [past, future], temperature_2m: [18, 22], weather_code: [0, 1] },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const location = { name: 'Test', latitude: 0, longitude: 0 };
            const result = WeatherCore.normalizeForecast(data, location);
            assert.equal(result.hourly.length >= 1, true);
            assert.equal(result.hourly[0].temperature_2m, 22);
        });

        it('limits hourly forecast to max 12 entries', () => {
            const now = new Date();
            const times = [];
            const temps = [];
            const codes = [];
            // Create hours from now until end of day (could be less than 12 if late in day)
            for (let i = 0; i < 24; i++) {
                const t = new Date(now.getTime() + i * 3600000);
                // Only add if it's today (before end of day)
                if (t.getDate() === now.getDate()) {
                    times.push(t.toISOString());
                    temps.push(15 + i);
                    codes.push(0);
                }
            }
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: times, temperature_2m: temps, weather_code: codes },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const location = { name: 'Test', latitude: 0, longitude: 0 };
            const result = WeatherCore.normalizeForecast(data, location);
            // Should not exceed 12 entries
            assert.equal(result.hourly.length <= 12, true);
        });

        it('includes all daily entries', () => {
            const now = new Date();
            const times = [];
            const codes = [];
            const mins = [];
            const maxs = [];
            for (let i = 0; i < 7; i++) {
                const t = new Date(now.getTime() + i * 86400000);
                times.push(t.toISOString().split('T')[0]);
                codes.push(0);
                mins.push(10 + i);
                maxs.push(20 + i);
            }
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [], temperature_2m: [], weather_code: [] },
                daily: { time: times, weather_code: codes, temperature_2m_min: mins, temperature_2m_max: maxs }
            };
            const location = { name: 'Test', latitude: 0, longitude: 0 };
            const result = WeatherCore.normalizeForecast(data, location);
            assert.equal(result.daily.length, 7);
        });

        it('includes savedAt timestamp', () => {
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [], temperature_2m: [], weather_code: [] },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const location = { name: 'Test', latitude: 0, longitude: 0 };
            const result = WeatherCore.normalizeForecast(data, location);
            assert.equal(result.savedAt !== undefined, true);
            assert.equal(new Date(result.savedAt).getTime() > 0, true);
        });

        it('handles empty hourly and daily arrays', () => {
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [], temperature_2m: [], weather_code: [] },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const location = { name: 'Test', latitude: 0, longitude: 0 };
            const result = WeatherCore.normalizeForecast(data, location);
            assert.equal(result.hourly.length, 0);
            assert.equal(result.daily.length, 0);
        });
    });

    describe('WeatherCore — formatDateTime', () => {
        it('formats a valid ISO date string', () => {
            const result = WeatherCore.formatDateTime('2024-01-15T14:30:00');
            assert.equal(result.includes('15'), true);
            assert.equal(result.includes('14'), true);
        });

        it('returns fallback for invalid date strings', () => {
            const result = WeatherCore.formatDateTime('not-a-date');
            assert.equal(result, 'not-a-date');
        });

        it('handles ISO format with T separator', () => {
            const result = WeatherCore.formatDateTime('2024-01-15T14:30:00Z');
            assert.equal(result.includes('15'), true);
        });
    });

    describe('WeatherCore — formatHour', () => {
        it('formats a valid date to time string', () => {
            const result = WeatherCore.formatHour('2024-01-15T14:30:00');
            assert.equal(result.includes('14'), true);
            assert.equal(result.includes('30'), true);
        });
    });

    describe('WeatherCore — locationKey', () => {
        it('generates consistent key for same coordinates', () => {
            const loc = { latitude: 55.7558, longitude: 37.6176 };
            const key1 = WeatherCore.locationKey(loc);
            const key2 = WeatherCore.locationKey(loc);
            assert.equal(key1, key2);
        });

        it('generates key with 3 decimal places', () => {
            const loc = { latitude: 55.7558, longitude: 37.6176 };
            const key = WeatherCore.locationKey(loc);
            assert.equal(key, '55.756,37.618');
        });

        it('generates different keys for different coordinates', () => {
            const loc1 = { latitude: 55.7558, longitude: 37.6176 };
            const loc2 = { latitude: 59.9343, longitude: 30.3351 };
            assert.equal(WeatherCore.locationKey(loc1) !== WeatherCore.locationKey(loc2), true);
        });
    });

    describe('WeatherCore — moonPhaseEmoji', () => {
        it('returns new moon emoji for 0', () => {
            assert.equal(WeatherCore.moonPhaseEmoji(0), '🌑');
        });

        it('returns full moon emoji for 0.5', () => {
            assert.equal(WeatherCore.moonPhaseEmoji(0.5), '🌕');
        });

        it('returns empty string for null', () => {
            assert.equal(WeatherCore.moonPhaseEmoji(null), '');
        });

        it('returns empty string for undefined', () => {
            assert.equal(WeatherCore.moonPhaseEmoji(undefined), '');
        });
    });

    describe('WeatherCore — moonPhaseLabel', () => {
        it('returns Новолуние for 0', () => {
            assert.equal(WeatherCore.moonPhaseLabel(0), 'Новолуние');
        });

        it('returns Полнолуние for 0.5', () => {
            assert.equal(WeatherCore.moonPhaseLabel(0.5), 'Полнолуние');
        });

        it('returns -- for null', () => {
            assert.equal(WeatherCore.moonPhaseLabel(null), '--');
        });

        it('returns -- for undefined', () => {
            assert.equal(WeatherCore.moonPhaseLabel(undefined), '--');
        });
    });

    describe('WeatherCore — describeWindDir', () => {
        it('returns С for 0 degrees', () => {
            assert.equal(WeatherCore.describeWindDir(0), 'С');
        });

        it('returns В for 90 degrees', () => {
            assert.equal(WeatherCore.describeWindDir(90), 'В');
        });

        it('returns Ю for 180 degrees', () => {
            assert.equal(WeatherCore.describeWindDir(180), 'Ю');
        });

        it('returns З for 270 degrees', () => {
            assert.equal(WeatherCore.describeWindDir(270), 'З');
        });

        it('returns СВ for 45 degrees', () => {
            assert.equal(WeatherCore.describeWindDir(45), 'СВ');
        });

        it('returns -- for null', () => {
            assert.equal(WeatherCore.describeWindDir(null), '--');
        });

        it('returns -- for undefined', () => {
            assert.equal(WeatherCore.describeWindDir(undefined), '--');
        });
    });

    describe('WeatherCore — uvAdviceSeverity', () => {
        it('returns null for null uv', () => {
            assert.equal(WeatherCore.uvAdviceSeverity(null), null);
        });

        it('returns Экстремальный for uv >= 11', () => {
            const result = WeatherCore.uvAdviceSeverity(11);
            assert.equal(result.level, 'Экстремальный');
        });

        it('returns Очень высокий for uv >= 8', () => {
            const result = WeatherCore.uvAdviceSeverity(8);
            assert.equal(result.level, 'Очень высокий');
        });

        it('returns Высокий for uv >= 6', () => {
            const result = WeatherCore.uvAdviceSeverity(6);
            assert.equal(result.level, 'Высокий');
        });

        it('returns Умеренный for uv >= 3', () => {
            const result = WeatherCore.uvAdviceSeverity(3);
            assert.equal(result.level, 'Умеренный');
        });

        it('returns Низкий for uv < 3', () => {
            const result = WeatherCore.uvAdviceSeverity(2);
            assert.equal(result.level, 'Низкий');
        });
    });

    describe('WeatherCore — perceivedComfort', () => {
        it('returns Морозная for temp < 0', () => {
            assert.equal(WeatherCore.perceivedComfort(-5, 50, 10), 'Морозная');
        });

        it('returns Холодная for temp 0-9', () => {
            assert.equal(WeatherCore.perceivedComfort(5, 50, 10), 'Холодная');
        });

        it('returns Прохладная for temp 10-19', () => {
            assert.equal(WeatherCore.perceivedComfort(15, 50, 10), 'Прохладная');
        });

        it('returns Комфортная for temp 20-27', () => {
            assert.equal(WeatherCore.perceivedComfort(22, 50, 10), 'Комфортная');
        });

        it('returns Тёплая for temp >= 28', () => {
            assert.equal(WeatherCore.perceivedComfort(30, 50, 10), 'Тёплая');
        });

        it('returns -- for null temp', () => {
            assert.equal(WeatherCore.perceivedComfort(null, 50, 10), '--');
        });
    });

    describe('WeatherCore — describeDewPoint', () => {
        it('returns Очень сухо for dew point < 0', () => {
            assert.equal(WeatherCore.describeDewPoint(-5), 'Очень сухо');
        });

        it('returns Сухо for dew point 0-9', () => {
            assert.equal(WeatherCore.describeDewPoint(5), 'Сухо');
        });

        it('returns Комфортно for dew point 10-14', () => {
            assert.equal(WeatherCore.describeDewPoint(12), 'Комфортно');
        });

        it('returns Влажно for dew point 15-19', () => {
            assert.equal(WeatherCore.describeDewPoint(17), 'Влажно');
        });

        it('returns Очень влажно for dew point >= 20', () => {
            assert.equal(WeatherCore.describeDewPoint(22), 'Очень влажно');
        });

        it('returns -- for null', () => {
            assert.equal(WeatherCore.describeDewPoint(null), '--');
        });
    });

    describe('WeatherCore — parseDailyExtras', () => {
        it('returns empty array for day without extras', () => {
            const result = WeatherCore.parseDailyExtras({ time: '2024-01-15' });
            assert.equal(result.length, 0);
        });

        it('includes sunrise and sunset when present', () => {
            const day = { time: '2024-01-15', sunrise: '2024-01-15T07:00', sunset: '2024-01-15T17:00' };
            const result = WeatherCore.parseDailyExtras(day);
            assert.equal(result.length >= 2, true);
            assert.equal(result[0].icon, '🌅');
            assert.equal(result[1].icon, '🌇');
        });

        it('includes UV when present', () => {
            const day = { time: '2024-01-15', uv_index_max: 5 };
            const result = WeatherCore.parseDailyExtras(day);
            assert.arrayContains(result.map(r => r.icon), '☀️');
        });

        it('includes moon phase when present', () => {
            const day = { time: '2024-01-15', moon_phase: 0.5 };
            const result = WeatherCore.parseDailyExtras(day);
            assert.arrayContains(result.map(r => r.icon), '🌕');
        });

        it('includes wind direction when present', () => {
            const day = { time: '2024-01-15', wind_direction_10m_dominant: 90 };
            const result = WeatherCore.parseDailyExtras(day);
            assert.arrayContains(result.map(r => r.text), 'В');
        });
    });

    describe('WeatherCore — buildAdvice UV branch', () => {
        it('returns UV advice for high UV when temp is pleasant', () => {
            assert.equal(WeatherCore.buildAdvice(22, 0, 10, 6), 'Наденьте головной убор и солнцезащитные очки. Используйте крем.');
        });

        it('returns storm advice instead of UV advice for stormy codes', () => {
            assert.equal(WeatherCore.buildAdvice(22, 95, 10, 8), 'Лучше отложить долгую прогулку: возможны гроза, сильный ветер и резкие осадки.');
        });

        it('returns pleasant advice when UV is low', () => {
            assert.equal(WeatherCore.buildAdvice(22, 0, 10, 2), 'Отличная погода для прогулки. Лёгкой одежды достаточно.');
        });

        it('returns null-safe pleasant advice when uvIndex is undefined', () => {
            assert.equal(WeatherCore.buildAdvice(22, 0, 10, undefined), 'Отличная погода для прогулки. Лёгкой одежды достаточно.');
        });
    });

    describe('WeatherCore — normalizeForecast new fields', () => {
        it('passes through hourly precipitation_probability', () => {
            const now = new Date();
            const future = new Date(now.getTime() + 3600000).toISOString();
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [future], temperature_2m: [22], weather_code: [0], precipitation_probability: [50], wind_direction_10m: [90], uv_index: [3], dew_point_2m: [10] },
                daily: { time: [], weather_code: [], temperature_2m_min: [], temperature_2m_max: [] }
            };
            const result = WeatherCore.normalizeForecast(data, { name: 'Test', latitude: 0, longitude: 0 });
            assert.equal(result.hourly[0].precipitation_probability, 50);
            assert.equal(result.hourly[0].wind_direction_10m, 90);
            assert.equal(result.hourly[0].uv_index, 3);
            assert.equal(result.hourly[0].dew_point_2m, 10);
        });

        it('passes through daily extras', () => {
            const now = new Date();
            const time = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [], temperature_2m: [], weather_code: [] },
                daily: {
                    time: [time],
                    weather_code: [0],
                    temperature_2m_min: [10],
                    temperature_2m_max: [20],
                    uv_index_max: [5],
                    sunrise: [`${time}T07:00`],
                    sunset: [`${time}T17:00`],
                    moon_phase: [0.5],
                    moonrise: [`${time}T22:00`],
                    moonset: [`${time}T10:00`],
                    apparent_temperature_min: [8],
                    apparent_temperature_max: [18],
                    wind_direction_10m_dominant: [180]
                }
            };
            const result = WeatherCore.normalizeForecast(data, { name: 'Test', latitude: 0, longitude: 0 });
            assert.equal(result.daily[0].uv_index_max, 5);
            assert.equal(result.daily[0].sunrise, `${time}T07:00`);
            assert.equal(result.daily[0].moon_phase, 0.5);
            assert.equal(result.daily[0].apparent_temperature_min, 8);
            assert.equal(result.daily[0].wind_direction_10m_dominant, 180);
        });

        it('handles missing new fields gracefully', () => {
            const now = new Date();
            const future = new Date(now.getTime() + 3600000).toISOString();
            const data = {
                current: { temperature_2m: 20, weather_code: 0 },
                hourly: { time: [future], temperature_2m: [22], weather_code: [0] },
                daily: { time: ['2024-01-15'], weather_code: [0], temperature_2m_min: [10], temperature_2m_max: [20] }
            };
            const result = WeatherCore.normalizeForecast(data, { name: 'Test', latitude: 0, longitude: 0 });
            assert.equal(result.hourly[0].precipitation_probability, undefined);
            assert.equal(result.daily[0].uv_index_max, undefined);
        });
    });
};
