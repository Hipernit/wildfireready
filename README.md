# WildfireReady — WA-08 Congressional App Challenge

A bilingual wildfire preparedness app built for Washington's 8th Congressional District. WildfireReady gives residents of WA-08 — spanning King County's eastern communities, Chelan County, and Kittitas County — a single tool that answers the question every household in this fire-prone district faces each summer: *Am I ready, and if a fire starts tonight, what do I do?* The app delivers live air quality readings, a five-day fire weather forecast, a guided emergency go-bag checklist, a household readiness score, and location-specific evacuation routes drawn from official county emergency management plans. All content is available in English and Spanish, and every screen degrades gracefully to offline fallback data when connectivity is unavailable.

---

## Features

### Now
Live air quality index (AQI) for the selected community, sourced from the EPA AirNow API. Includes a color-coded banner that escalates from green (acceptable) to red (health emergency), a real-time active fire feed filtered to Washington state fires via the NIFC/WFIGS ArcGIS service, and a one-tap button to enroll in community emergency alerts.

### Weather
Five-day fire weather forecast from the National Weather Service, with a calculated fire danger level (Minimal through Extreme) for each day based on temperature, wind speed, and precipitation. Red Flag Warning conditions are surfaced prominently. Forecast terms are translated into Spanish using a curated NWS vocabulary map. Live vs. offline/demo data is indicated on every forecast card.

### Go Bag
A categorized emergency go-bag checklist covering Essentials, Medical, Documents, and Pets. Items are drawn from FEMA and Red Cross guidance, localized for WA-08 communities. Each section tracks completion progress. The checklist feeds directly into the household readiness score.

### Score
A 100-point household readiness score calculated from go-bag completion (50 pts), household profile completeness (30 pts), location selection (10 pts), and language configuration (10 pts). The score screen shows a grade, a breakdown by category with individual progress bars, and a prioritized list of the highest-impact improvements remaining.

### Plan
The emergency action hub. Shows Washington State's three-level evacuation system (Level 1 GET READY / Level 2 GET SET / Level 3 GO NOW) with plain-language descriptions. Displays three location-specific evacuation routes — primary, alternate, and last resort — with estimated drive times and turn-by-turn corridor guidance. Shows the county emergency management contact and the 2-1-1 WA Disaster Helpline for the selected community. Includes a shelter disclaimer and a one-tap share button so families can send their plan to each other before an incident occurs.

---

## Data Sources

| Source | What it provides |
|---|---|
| **EPA AirNow API** | Real-time AQI readings by ZIP code for all WA-08 communities |
| **NOAA / National Weather Service** | Five-day fire weather forecast via the NWS `api.weather.gov` points endpoint |
| **NIFC / WFIGS ArcGIS** | Current wildland fire incident locations filtered to Washington state (`POOState = 'US-WA'`), updated daily |
| **King County Emergency Management** | Evacuation routes, shelter locations, and Alert King County enrollment guidance for Kirkland, Sammamish, Issaquah, and Maple Valley |
| **Chelan County Emergency Management** | Evacuation corridors, shelter locations, and Chelan County Sheriff contact for Wenatchee and Leavenworth |
| **Kittitas County Emergency Management** | Evacuation routes, shelter locations, and Kittitas County EM contact for Ellensburg and Cle Elum |

### A note on evacuation routes

All evacuation routes in the Plan tab were derived from official county emergency management plans and public-facing evacuation guidance, then cross-referenced against confirmed shelter activation histories from past fire events in the district. Route data for King County communities was reviewed by King County Office of Emergency Management, whose feedback directly shaped the app's approach to evacuation guidance and resulted in the removal of several inaccurate street-level directions. (including the 2017 Jolly Mountain Fire and the 2025 Lambert Road Fire). Routes for communities with a single egress road — Icicle Canyon in Leavenworth and the SR-903 corridor in Roslyn/upper Cle Elum — carry a prominent "LEAVE EARLY" designation and are identified by county EM as the district's highest-priority evacuation risks. Shelter locations are labeled with a disclaimer to confirm activation status via WA-Alert or 2-1-1 on the day of any evacuation, as shelter assignments change event-to-event.

---

## Tech Stack

- **React Native 0.85.3** with **React 19.2.3**
- **Expo SDK 56** (`~56.0.12`) — managed workflow
- **react-native-safe-area-context** for notch/home-bar handling across iOS and Android
- React Context API for theme (light/dark) and language (EN/ES) state
- No third-party state management or navigation libraries — five-tab layout is a hand-rolled context-driven switcher optimized for single-screen simplicity

### Live APIs
- EPA AirNow — `https://www.airnowapi.org/aq/observation/zipCode/current/`
- NOAA NWS — `https://api.weather.gov/points/{lat},{lon}` → forecast grid
- NIFC WFIGS — `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Locations/FeatureServer/0/query`
- King County OEM ArcGIS — `https://services.arcgis.com/hn7l5M5rFpMhKGf0/arcgis/rest/services/EvacuationRoutes_public/FeatureServer/0/query` — live evacuation routes drawn by King County OEM during active incidents

All four APIs have offline fallback data so the app remains functional without a connection.

### Map
The embedded map is rendered via **react-native-webview** with a **Leaflet.js** map (v1.9.4) loaded from the unpkg CDN. Light mode uses OpenStreetMap tiles (`tile.openstreetmap.org`); dark mode uses CARTO dark tiles (`basemaps.cartocdn.com/dark_all`). No API key or billing account is required for either tile provider.

---

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS or Android) or press `i` / `a` to open in a simulator.

To run on a physical device without Expo Go:

```bash
npx expo run:ios   # requires Xcode
npx expo run:android   # requires Android Studio
```

### API keys

Create `src/config.js` with your keys before running:

```js
export const AIRNOW_API_KEY = 'your_airnow_key';
export const NWS_UA = '(wildfireready-wa08, contact@example.com)';
```

AirNow API keys are free at [airnowapi.org](https://docs.airnowapi.org/). The NWS API requires no key — only a User-Agent string per NOAA's usage policy. The NIFC ArcGIS endpoint is fully public with no authentication required.

---

## District Coverage

WildfireReady includes curated data for eight communities across the three WA-08 counties with the highest wildfire exposure:

| Community | County | Notable risk |
|---|---|---|
| Sammamish | King | WUI interface, Tiger Mountain proximity |
| Issaquah | King | Primary evacuation corridor per 2025 ETS |
| Maple Valley | King | Green River Gorge fire corridor |
| Kirkland | King | Near WA-01/WA-08 boundary (98033) |
| Wenatchee | Chelan | Historically high fire season AQI |
| Leavenworth | Chelan | Icicle Canyon single-exit risk |
| Ellensburg | Kittitas | Eastern Cascades fire weather exposure |
| Cle Elum | Kittitas | SR-903/Roslyn single-exit risk |

---

*Built for the WA-08 Congressional App Challenge. Data is provided for informational purposes. Always follow instructions from local emergency management and law enforcement during an active evacuation.*
