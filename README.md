# WildfireReady — WA-08 Congressional App Challenge

A bilingual (English/Spanish) wildfire preparedness app for Washington's 8th Congressional District — eastern King County, Chelan County, and Kittitas County. It answers two questions every household here faces each summer: *Am I ready?* and *If a fire starts tonight, what do I do?*

WildfireReady never invents emergency information. Live readings come from official sources; when a source is unreachable the app shows the last saved reading with its timestamp, or says the data is unavailable. Official warnings come only from the National Weather Service, and evacuation orders come only from your county — the app links you to the county's own alert sign-up.

---

## Features

### Now
- **Official NWS alerts** for the selected community (Red Flag Warnings, Fire Weather Watches, Air Quality Alerts, Fire Warnings, Evacuation Immediate) with the official headline, expiry, and full text.
- **Air quality** from EPA AirNow, shown on the official EPA AQI color scale with the category name and health guidance.
- **Nearby wildfires** from NIFC/WFIGS, sorted by distance from the selected community, with "X mi from …" on each card and fires within 30 miles highlighted. Prescribed burns are excluded; unknown containment is shown as "Containment unknown".
- **Map** of communities and the nearest fires. Tap a fire for name, acres, and distance, then "Details" to jump to its card.
- **Official alert sign-up** for the community's county (ALERT King County, Chelan County, Kittitas County — all Everbridge). Users mark it done once they've signed up.

### Weather
Five-day NWS forecast with high temperature, lowest relative humidity, wind direction and speed, and peak gusts. Each day shows an **Estimated fire risk** (Minimal → Extreme). This is an app estimate, not an official rating:

| Input (NWS) | Points |
|---|---|
| Forecast high: `(°F − 60) × 1.0` | 0–30 |
| Lowest relative humidity (gridpoint data): `(60 − RH%) × 0.9` | 0–40 |
| Strongest of sustained wind (upper bound of ranges like "10 to 20 mph") or 70% of peak gust: `mph × 1.5` | 0–30 |

Levels: ≥75 Extreme, ≥55 High, ≥35 Moderate, ≥15 Low, otherwise Minimal. If humidity data is missing the estimate says so instead of guessing.

### Go Bag
A checklist that adapts to the household profile: water, food, and N95 quantities scale with household size; pet, children, medication, and mobility sections appear only when they apply. Essentials come first.

### Score
A 100-point readiness score earned only by real actions. A brand-new user scores 0.

| Action | Points |
|---|---|
| Go-bag packed (share of items that apply to the household) | 45 |
| Household profile saved | 15 |
| Signed up for the county's official alerts (user confirms) | 15 |
| Plan shared with family (from the Plan tab) | 10 |
| Family meeting point set | 10 |
| Out-of-area contact set (name and phone) | 5 |

Grades: A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F below. Each "What to improve" item opens the screen where it can be fixed.

### Plan
- Official evacuation and fire alerts for the community.
- The county's alert sign-up, evacuation-level address lookup (Chelan and Kittitas), and emergency management page.
- **My household plan**: meeting point, out-of-area contact (with a call button), and household size from the profile.
- Washington's three evacuation levels (GET READY / GET SET / GO NOW).
- Evacuation routes, shelters, and emergency contacts, each tagged **Verified <date>** (with a link to the source) or **Unverified**.
- Share the plan as text, or print / save it as a PDF.

### Household profile
Adults, children, pets, prescription medications, mobility/access needs, someone 65+, family meeting point, and out-of-area contact. Stored only on the device.

---

## Data sources

| Source | Endpoint | Used for |
|---|---|---|
| EPA AirNow | `airnowapi.org/aq/observation/current/ziplatlong/` (the older `zipCode/current` service was retired 2026-10-01) | Current AQI (NowCast) by ZIP code |
| NOAA NWS | `api.weather.gov/points/{lat},{lon}` → forecast + `forecastGridData` | Forecast, humidity, gusts |
| NOAA NWS alerts | `api.weather.gov/alerts/active?point={lat},{lon}` | Official warnings, watches, advisories |
| NIFC WFIGS | `services3.arcgis.com/T4QMspbfLg3qTGWY/.../WFIGS_Incident_Locations_Current/FeatureServer/0` | Current Washington wildfire incidents |
| OpenStreetMap | `tile.openstreetmap.org` (via Leaflet 1.9.4 in a WebView) | Map tiles (dark mode inverts them with CSS) |
| County emergency management | King, Chelan, Kittitas county websites | Contacts, alert sign-up, evacuation-level lookups |

**Offline behavior.** The last successful response from each source is saved per community. Offline, the app shows that data with a "Last updated <date/time>" label and an offline banner; with nothing saved it shows an "unavailable" state. Every request times out after 15 seconds. Sample data exists only for development (`EXPO_PUBLIC_DEMO_MODE=1` in a dev build) and is always labeled **DEMO**.

---

## Evacuation data and verification

Routes, shelters, contacts, and county links live in `src/data/emergency.js`. Each record has a `source` URL and a `lastVerified` date. A record is marked verified **only** when an official government source confirms it; everything else is shown as unverified in the app, and verifications older than about six months are flagged for re-checking.

[VERIFY.md](VERIFY.md) lists what has been verified (with sources), what was corrected, and what still needs an official source. As of the last review, the county contacts, alert sign-ups, evacuation lookups, and the Kittitas Valley Event Center's use as an animal shelter are verified; the evacuation routes, drive times, and people shelters are not.

To verify a record: find the claim on an official county, city, WSDOT, or Red Cross page, set `source` and `lastVerified` in `emergency.js`, and remove the item from VERIFY.md.

Earlier in development, King County Office of Emergency Management gave feedback on the King County route data, which led to removing several street-level directions. That review is not a substitute for per-record verification above.

Shelter assignments change with every event. The app always tells users to confirm open shelters through their county's alerts or 2-1-1.

---

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npx expo start
```

Scan the QR code with Expo Go, or press `a` for an Android emulator / `i` for the iOS simulator (macOS only).

### Environment variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_AIRNOW_API_KEY` | Free key from [airnowapi.org](https://docs.airnowapi.org/account/request/). Without it the app shows "AQI unavailable: no API key"; a rejected key shows "API key rejected". |
| `EXPO_PUBLIC_NWS_UA` | Identifying User-Agent with contact info, per NOAA's API policy. |
| `EXPO_PUBLIC_DEMO_MODE` | `1` shows labeled DEMO data in development builds when live sources fail. Ignored in production. |

Restart `npx expo start` after changing them.

> **`EXPO_PUBLIC_*` values ship in the client bundle.** Expo inlines them at build time, so anyone with the app can read them. Only use keys that are safe to be public (the free AirNow tier). For anything sensitive, proxy requests through a small backend.

### Scripts

| Command | What it does |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` / `npm run ios` | Dev server + open on a device or emulator |
| `npm test` | Jest (jest-expo) unit tests |
| `npm run lint` | ESLint (`eslint-config-expo`) with Prettier |
| `npm run format` | Prettier write |

The app is native-only (iOS and Android); the map uses `react-native-webview`, which has no web implementation.

---

## Tech stack

- Expo SDK 56, React Native 0.85, React 19.2
- `@react-native-async-storage/async-storage` — versioned, migrated app state and offline caches
- `react-native-safe-area-context`, `expo-status-bar`, `@expo/vector-icons`
- `expo-location` — one-time "Use my location" to pick the nearest community (not stored)
- `expo-print` — printable plan
- `react-native-webview` + Leaflet — map
- React Context for theme (Auto/Light/Dark) and language; no navigation library — five always-mounted tabs

### Project layout

```
App.js                    state, persistence, tabs
src/i18n.js               all EN/ES strings, locale-aware dates, NWS phrase translation
src/theme.js              color tokens (light/dark, semantic, EPA AQI)
src/styles.js             layout only — no colors
src/data/                 locations, emergency data, go-bag items, profile defaults
src/services/             AirNow, NWS, NIFC, scoring, persistence, geo, printable plan
src/components/           header, tab bar, map, alerts, shared data-state component, sheets
src/screens/              Now, Weather, Go Bag, Score, Plan
__tests__/                Jest tests
```

---

## District coverage

| Community | County | Notes |
|---|---|---|
| Sammamish | King | WUI interface, Tiger Mountain proximity |
| Issaquah | King | City published a 2025 wildfire evacuation time study |
| Maple Valley | King | Green River Gorge area |
| Kirkland | King | Near the WA-01/WA-08 boundary (98033) |
| Wenatchee | Chelan | US-2 over Stevens Pass or US-97 over Blewett Pass |
| Leavenworth | Chelan | Icicle Canyon single-exit area |
| Ellensburg | Kittitas | Eastern Cascades fire weather |
| Cle Elum | Kittitas | SR-903 is the only paved road out of Roslyn/Ronald |

---

*Built for the WA-08 Congressional App Challenge. Information is provided for preparedness only. Always follow instructions from local emergency management and law enforcement during an active evacuation.*
