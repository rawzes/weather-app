# Weather Companion — Feature Plan & Competitor Analysis

Plan mode deliverable. Scope: plan the next set of features for the Weather Companion
vanilla-JS PWA, grounded in competitor analysis and the hard constraints of the stack.
No source files are edited by this plan.

## 1. Current state (verified)

Stack & constraints
- Vanilla JS only, no framework/build step, no backend, static hosting + GitHub Pages.
- Public free APIs, no API keys in repo: Open-Meteo (forecast), Nominatim (geocoding),
  ipapi.co (IP fallback). Open-Meteo is CC-BY 4.0 (attribution required, non-commercial free).
- Free tier: <10k calls/day, 5k/hour, 600/min. Client-side fetches risk quota under load.
- Offline-first PWA: Service Worker caches shell only; one `weatherApp.lastSnapshot` per
  location; `localStorage` holds unit/theme/lastLocation/lastSnapshot/favorites(≤8)/history(≤8).
- Test harness: custom Node runner (`node test/runner.js`) loads `weather-core.js` via `vm`
  with a localStorage mock. Currently 58 tests pass, all on `weather-core.js` pure functions.
- Modularization in progress: pure logic extracted to `weather-core.js`; `script.js` is the
  UI/integration layer. Keep this split (per project decision).

Current surface
- Current weather (temp, feels-like, humidity, pressure, wind speed, gusts), 12h hourly,
  7-day weekly with temp-range bar, clothing advice + SVG person illustration, city search,
  GPS + IP geolocation, favorites/history chips, light/dark/auto theme, °C/°F, offline snapshot,
  PWA install banner.

Known limitations (from ARCHITECTURE.md §"Ограничения")
- Auto-theme only evaluated on setTheme() call, not at runtime boundary.
- Single offline snapshot, not per-city.
- Search takes first Nominatim match only.
- No unit tests for script.js / DOM layer.

## 2. Competitor analysis

Method: reviewed feature lists from AccuWeather, 1Weather, Weather Underground, WeatherBug,
The Weather Channel, CARROT Weather, YoWindow, Gismeteo (source: web search + app store docs).

| Capability | AccuWeather | TWC | Weather Underground | 1Weather | WeatherBug |
|---|---|---|---|---|---|
| Forecast horizon | 15 days | 10-14 | 10 | 12 | 10 |
| Feels-like / RealFeel | RealFeel | FeelsLike | Apparent | Apparent | — |
| Severe weather alerts | Yes | Yes | Yes | Yes | Yes |
| Radar / precipitation map | Yes | Yes | Yes (Webcams) | Yes | Doppler |
| Air quality (AQI) | Yes | Yes | Yes | Yes | Yes |
| UV index | Yes | Yes | Yes | Yes | Yes |
| Sunrise/sunset | Yes | Yes | Yes | Yes | Yes |
| Moon phase | Yes | Yes | Yes | Yes | Yes |
| Notifications | Yes | Yes | Yes | Yes | Yes |
| Geolocation | Yes | Yes | Yes | Yes | Yes |
| Clothing advice | RealFeel-based | — | — | — | — |
| Multiple saved cities | Yes | Yes | Yes | Yes | Yes |
| Historical data | — | Climate trends | Yes | — | — |

| Capability | CARROT Weather | YoWindow | Gismeteo | Weather Companion (us) |
|---|---|---|---|---|
| Humor/gamification | Yes | — | — | (clothing-illustration novelty) |
| Live landscape viz | — | Yes (wallpaper) | — | SVG person (clothing) |
| Locations coverage | ~ | ~ | 500k+ | Nominatim global |
| Unique differentiator | Personality | Visuals | Coverage | Offline-first, minimalist, no account, open data, clothing illustration |

Key takeaways
- Core differentiator to **double down on**: clothing recommendations + SVG person
  illustration. Most competitors have raw data; few give *actionable clothing guidance*.
  This is the app's north star feature.
- Standard "expected" data (AQI, UV, sunrise/sunset, moon) are near-universal on
  competitors and missing here → table-stakes parity gap.
- Severe-weather alerts and radar maps are the biggest engagement drivers competitors use,
  but both need a backend/radar tiles that conflict with the pure-static + free-API stack.
- Minimalist, no-account, install-anywhere narrative is a real advantage vs 100MB+ native apps.

## 3. Decision framework (constraints drive the backlog)

Out of scope (require backend / paid tiles / store distribution):
- Push notifications, account sync across devices, real-time Doppler radar, webcams,
  weather-news feed, gamification, native-store distribution, premium tiers.

In scope (achievable with free APIs + vanilla JS + static hosting):
- Any enrichment available from Open-Meteo's free endpoints (forecast, daily, air-quality,
  archive, elevation) + Nominatim + ipapi.co + browser-native (Share, InstallPrompt, Geo).
- Offline-first enhancements using only localStorage/Cache Storage.
- UI/UX polish that needs no server.

Prioritization lens: (1) parity data the user expects but is missing, (2) deepen existing
unique strength (clothing), (3) offline/UX robustness, (4) optional free-API modules.

## 4. Feature inventory (prioritized)

### P1 — Table-stakes data enrichment (free Open-Meteo vars, high user value)
1. **Sunrise / sunset** + day length on the hero (daily vars `sunrise`, `sunset`,
   `daylight_duration`, `sunshine_duration`).
2. **UV index** (current `uv_index` + daily `uv_index_max`) with a color badge and heat advice
   integration ("wear sunscreen / hat" for high UV).
3. **Precipitation probability** (hourly `precipitation_probability`) on hourly cards.
4. **Wind direction** (hourly/daily `wind_direction_10m` + daily `wind_direction_10m_dominant`)
   as a compass rose/numeric heading.
5. **Dew point** + **vapour pressure deficit** (comfort context alongside humidity).
6. **Moon phase / moonrise / moonset** (daily vars) — lightweight night-mode context.
7. **Feels-like min/max** on weekly cards (`apparent_temperature_min/max`).

### P2 — Deepen the unique strength (clothing)
8. **UV-aware clothing advice** — extend `WeatherCore.buildAdvice` to include sunscreen/hat
   when UV is high (pure function, testably added).
9. **Precipitation-chance display** in the hourly strip + advice weighting.
10. **Extended clothing layers** in the SVG person for transitional temps (e.g. light jacket
    band), keeping the illustration logic in a pure/testable helper.
11. **Wind-aware advice tuning** already exists; expose "wind chill" note when gusts > 25 km/h.

### P3 — Extended forecast & smarter offline
12. **Extend weekly from 7 → 16 days** (`forecast_days=16`). Note: accuracy drops for the
    far tail and Open-Meteo returns 7 by default — make it opt-in/toggle.
13. **Per-city offline cache** — store snapshots keyed by `locationKey` so switching between
    favorites shows cached data immediately, not just the last single snapshot.
    New localStorage key: `weatherApp.cities` (map of locationKey → snapshot).
14. **Search suggestions** — Nominatim `limit=5` with a dropdown of matches instead of
    first-only; disambiguate e.g. "Paris" → Paris FR/US/TX.

### P4 — UX & visualization (no backend)
15. **Dashboard view of saved cities** — mini-cards for favorites with cached snapshots
    (composes with P13).
16. **Web Share** current conditions (`navigator.share`) on the hero.
17. **Installability UX** — capture `beforeinstallprompt`, show explicit install button,
  detect `display-mode: standalone`.
18. **Auto-theme at runtime** — poll `shouldUseLightTheme` / use `prefers-color-scheme`
    matchMedia so the theme actually flips at the day/night boundary (fixes known limitation).
19. **A11y pass** — aria-live reviews, focus order, reduced motion respect.

### P5 — Optional free-API modules (opt-in, separate API calls)
20. **Air Quality** — Open-Meteo Air Quality endpoint (`air-quality-api.open-meteo.com`)
    for PM2.5, PM10, AQI, UV, dust. Separate call + attribution; pollen only Europe.
    Gate behind a setting (extra request quota).
21. **Historical lookback** — Open-Meteo Archive API for "this day last year" comparison
    (separate endpoint, attribution).

### P6 — Enrichments (nice-to-have, low risk)
22. **15-minutely precipitation** (North America / Central Europe only — HRRR/ICON-D2/AROME)
    for a "when will the rain start" strip; degrades to hourly elsewhere.
23. **Elevation** lookup for geolocation label richness.
24. **Unit preferences** — wind km/h ↔ mph ↔ knots, pressure hPa ↔ inHg (Open-Meteo supports
    wind/precip units; add a setting).
25. **Export/share snapshot JSON** of the current forecast.

### Out of scope (noted for clarity)
- Push notifications (needs push service + backend).
- Real-time radar map tiles (need paid provider/API key).
- Weather news / climate-trend storytelling.
- Native app store builds.
- User accounts / cross-device sync.

## 5. Implementation architecture

API layer (`script.js`)
- Create a single `OM_PARAMS` map of current/hourly/daily variables to request, extended
  per the P1 picks above. Keep attribution text visible (CC-BY requirement).
- Split: `weather-core.js` gains pure parsers/transformers (`parseDailyExtras`,
  `uvAdviceSeverity`, `moonPhaseLabel`, `describeWindDir`, `perceivedComfort`), each unit-
tested. `script.js` stays the DOM + fetch orchestration layer.
- Per-city snapshot store: add `getStored('weatherApp.cities')` map API in `weather-core.js`
  (`upsertCitySnapshot`, `getCitySnapshot`, `clearCitySnapshots`).

State layer (`localStorage`)
- Add keys: `weatherApp.cities` (map locationKey→snapshot), `weatherApp.settings` (collapse
  unit/theme/lastLocation into one object for consistency), keep legacy keys for compatibility
  (migrate in place on load).

Testability
- Extend `test/weather-core.test.js` with cases for each new pure function. Goal: ≥70 tests.
- CI (`node test/runner.js`) must stay green; add the new variables to normalizeForecast test
  fixtures where relevant.

Offline
- Service Worker already caches shell. Per-city snapshots (P13) render from localStorage on
  load. Document that API answers are not cached (per ARCHITECTURE.md) — keep that contract
  unless a quota-safe cache is explicitly added later.

## 6. Rollout / phases

- **Phase A (P1):** one PR extending the Open-Meteo request params, normalizeForecast, and
  the hero/metrics renders. Add tests. Validate offline snapshot still paints with new fields.
- **Phase B (P2 + P4.18):** clothing/UV advice + runtime auto-theme. Tests for buildAdvice
  UV branch + shouldUseLightTheme timing.
- **Phase C (P3):** 16-day toggle + per-city cache + search suggestions.
- **Phase D (P4 rest, P6):** share, install UX, a11y, 15-min, elevation, unit settings.
- **Phase E (P5, optional):** AQI + historical — behind a setting, with separate attribution.

Each phase is independently shippable; CI gates each PR.

## 7. Risks & mitigations

- **API quota under viral load:** client-side fetches are the limiter. Mitigation: keep request
  variable set lean; cache snapshot with `savedAt` staleness (e.g. >15 min stale auto-refreshes
  only when online/online-focus); surface a quota-warning fallback. Long-term: a minimal edge
  proxy (out of scope now).
- **Attribution compliance:** Open-Meteo requires visible credit. Mitigation: keep/expand the
  "Погодные данные / Поиск городов" footer links; add a credit line when AQI/historical are on.
- **Feature creep vs. minimalism:** the project values minimalism. Mitigation: keep P4/P5/P6
  behind opt-in settings/toggles; do not auto-show radar/news.
- **iOS PWA limits:** no push, limited install prompt. Mitigation: graceful degradation; the
  install button is a no-op enhancement where unsupported.
- **Test coverage gap:** only `weather-core.js` is tested. Mitigation: keep new logic pure so it
  stays testable; do not add untested DOM code paths without a clear manual-validation note.

## 8. Open questions (decisions deferred to implementation)

1. Extend weekly to 16 days by default, or behind a "long-range" toggle? (Recommended: toggle,
   because far-tail accuracy is low and it doubles response size/time.)
2. Fold AQI/historical behind a single "Advanced data" toggle, or separate toggles? (Recommended:
   one toggle to minimize requests and attribution noise.)
3. Keep `weatherApp.lastSnapshot` + legacy keys for compat, or migrate all users to the new
   `cities` map on first load? (Recommended: migrate lazily — new map, leave old keys as fallback.)
4. Clothing-SVG: extend current person illustration in-place, or extract to `weather-core.js` as
   data (clothing rules) + a separate render helper? (Recommended: extract clothing *rules* to
   pure data/functions; keep SVG drawing in script.js.)

## 9. Validation plan

- `node test/runner.js` — must remain green (58 → ≥70 tests).
- Manual smoke: new metrics render on hero; hourly cards show precip probability + wind dir;
  weekly shows sunrise/moon/uv icons.
- Offline: disable network, reload — hero + cached fields render; switching to a favorited city
  shows its last snapshot.
- PWA: fresh service-worker install, `beforeinstallprompt` fires install button.
- Attribution: Open-Meteo + OSM + ipapi credits visible on the footer on all views.
