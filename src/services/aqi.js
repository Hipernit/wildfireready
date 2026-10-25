import { AIRNOW_API_KEY, DEMO_MODE } from '../config';
import { findLocation } from '../data/locations';
import { readJSON, writeJSON, lastGoodKey } from './storage';
import { fetchWithTimeout } from './http';

// ── AQI CATEGORIES ────────────────────────────────────────────────────────
// AirNow category name → app category key. Labels/messages live in i18n.js.
const AQI_CATS = {
  Good: 'good',
  Moderate: 'moderate',
  'Unhealthy for Sensitive Groups': 'sensitive',
  Unhealthy: 'unhealthy',
  'Very Unhealthy': 'veryUnhealthy',
  Hazardous: 'hazardous',
};

// EPA AQI breakpoints, used when AirNow omits the category.
export function aqiCategory(aqi) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'veryUnhealthy';
  return 'hazardous';
}

// Sample readings for development only (DEMO_MODE). Never shown as real.
const AQI_DEMO = {
  kirkland: 38,
  sammamish: 42,
  issaquah: 55,
  'maple-valley': 61,
  wenatchee: 118,
  leavenworth: 143,
  ellensburg: 97,
  'cle-elum': 152,
};

// In-memory cache of live results; exported so screens can invalidate on
// pull-to-refresh.
export const aqiCache = {};
const AQI_CACHE_MS = 60 * 60 * 1000; // 1 hour

// Result: { status: 'live'|'cached'|'demo'|'unavailable', reason?, fetchedAt?, reading? }
// reading: { aqi, cat, parameter }
async function offlineResult(locationKey, reason) {
  const saved = await readJSON(lastGoodKey('aqi', locationKey));
  if (saved?.reading) return { status: 'cached', reason, fetchedAt: saved.fetchedAt, reading: saved.reading };
  if (DEMO_MODE && AQI_DEMO[locationKey] != null) {
    const aqi = AQI_DEMO[locationKey];
    return {
      status: 'demo',
      reason,
      fetchedAt: Date.now(),
      reading: { aqi, cat: aqiCategory(aqi), parameter: 'PM2.5' },
    };
  }
  return { status: 'unavailable', reason };
}

// AirNow "Current Observations by zip code or lat/long". The older
// /aq/observation/zipCode/current/ service was retired on 2026-10-01.
export const airnowUrl = (loc) =>
  'https://www.airnowapi.org/aq/observation/current/ziplatlong/?format=application/json' +
  `&zipCode=${loc.zip}&distance=25&API_KEY=${AIRNOW_API_KEY}`;

// Picks the reading to show (PM2.5 for wildfire smoke, then ozone, then any)
// from an AirNow response. Returns null when no monitor reports a value.
export function pickReading(data) {
  const valid = (Array.isArray(data) ? data : []).filter((d) => typeof d?.nowcastAQI === 'number');
  const r =
    valid.find((d) => d.parameterName === 'PM2.5') || valid.find((d) => d.parameterName === 'OZONE') || valid[0];
  if (!r) return null;
  return {
    aqi: r.nowcastAQI,
    cat: AQI_CATS[r.aqiCategoryName] || aqiCategory(r.nowcastAQI),
    parameter: r.parameterName,
  };
}

export async function fetchAQI(locationKey) {
  const cached = aqiCache[locationKey];
  if (cached && Date.now() - cached.ts < AQI_CACHE_MS) return cached.result;

  const loc = findLocation(locationKey);
  if (!loc) return { status: 'unavailable', reason: 'error' };
  if (!AIRNOW_API_KEY) return offlineResult(locationKey, 'noKey');

  try {
    const res = await fetchWithTimeout(airnowUrl(loc));
    if (res.status === 401 || res.status === 403) return offlineResult(locationKey, 'badKey');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('bad payload');
    // No monitor reporting nearby is a real answer, not an outage.
    const reading = pickReading(data);
    if (!reading) return { status: 'unavailable', reason: 'noData' };

    const result = { status: 'live', fetchedAt: Date.now(), reading };
    aqiCache[locationKey] = { result, ts: Date.now() };
    await writeJSON(lastGoodKey('aqi', locationKey), { fetchedAt: result.fetchedAt, reading: result.reading });
    return result;
  } catch {
    return offlineResult(locationKey, 'offline');
  }
}
