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

export async function fetchAQI(locationKey) {
  const cached = aqiCache[locationKey];
  if (cached && Date.now() - cached.ts < AQI_CACHE_MS) return cached.result;

  const loc = findLocation(locationKey);
  if (!loc) return { status: 'unavailable', reason: 'error' };
  if (!AIRNOW_API_KEY) return offlineResult(locationKey, 'noKey');

  try {
    const res = await fetchWithTimeout(
      `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${loc.zip}&distance=25&API_KEY=${AIRNOW_API_KEY}`,
    );
    if (res.status === 401 || res.status === 403) return offlineResult(locationKey, 'badKey');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('bad payload');
    // No monitor reporting nearby is a real answer, not an outage.
    if (data.length === 0) return { status: 'unavailable', reason: 'noData' };

    const reading =
      data.find((d) => d.ParameterName === 'PM2.5') || data.find((d) => d.ParameterName === 'O3') || data[0];
    const result = {
      status: 'live',
      fetchedAt: Date.now(),
      reading: {
        aqi: reading.AQI,
        cat: AQI_CATS[reading.Category?.Name] || aqiCategory(reading.AQI),
        parameter: reading.ParameterName,
      },
    };
    aqiCache[locationKey] = { result, ts: Date.now() };
    await writeJSON(lastGoodKey('aqi', locationKey), { fetchedAt: result.fetchedAt, reading: result.reading });
    return result;
  } catch {
    return offlineResult(locationKey, 'offline');
  }
}
