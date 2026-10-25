import { NWS_UA, DEMO_MODE } from '../config';
import { findLocation, EAST } from '../data/locations';
import { readJSON, writeJSON, lastGoodKey } from './storage';

// ── ESTIMATED FIRE RISK ───────────────────────────────────────────────────
// An app-computed estimate, NOT an official NWS product. Points come from
// forecast high temperature, minimum relative humidity over the period, and
// the stronger of sustained wind (upper bound) or 70% of the peak gust.
const RISK_STYLE = {
  Extreme:  { color:'#7B0000', bg:'#FEF2F2', dot:'●' },
  High:     { color:'#C0392B', bg:'#FDECEA', dot:'●' },
  Moderate: { color:'#C07A00', bg:'#FFF8E6', dot:'●' },
  Low:      { color:'#2E7D5E', bg:'#E8F5EE', dot:'●' },
  Minimal:  { color:'#1C6EA4', bg:'#EBF4FB', dot:'●' },
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function estimateFireRisk({ tempF, windMph, gustMph, minRH }) {
  const tempPts = clamp(((tempF ?? 60) - 60) * 1.0, 0, 30);
  const rhPts = minRH == null ? 0 : clamp((60 - minRH) * 0.9, 0, 40);
  const windEff = Math.max(windMph || 0, (gustMph || 0) * 0.7);
  const windPts = clamp(windEff * 1.5, 0, 30);
  const score = Math.round(tempPts + rhPts + windPts);
  const level =
    score >= 75 ? 'Extreme'
    : score >= 55 ? 'High'
    : score >= 35 ? 'Moderate'
    : score >= 15 ? 'Low'
    : 'Minimal';
  return { level, score, rhMissing: minRH == null, ...RISK_STYLE[level] };
}

// "10 to 20 mph" → 20, "5 mph" → 5, "" → null. Uses the upper bound so a
// range never understates wind.
export function parseWindMph(str) {
  const nums = String(str || '').match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

// ISO 8601 duration (as used in NWS validTime, e.g. "PT6H", "P1DT3H") → ms.
export function parseIsoDurationMs(dur) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(dur || '');
  if (!m) return 0;
  const [, d = 0, h = 0, min = 0] = m;
  return ((+d * 24 + +h) * 60 + +min) * 60 * 1000;
}

// Values from an NWS gridpoint series whose validTime overlaps [startMs, endMs).
export function gridValuesInRange(series, startMs, endMs) {
  if (!series?.values) return [];
  return series.values
    .filter((v) => {
      const [start, dur] = String(v.validTime).split('/');
      const s = Date.parse(start);
      const e = s + parseIsoDurationMs(dur);
      return v.value != null && s < endMs && e > startMs;
    })
    .map((v) => v.value);
}

const KMH_TO_MPH = 0.621371;
const toMph = (series, v) =>
  series?.uom === 'wmoUnit:km_h-1' ? v * KMH_TO_MPH : series?.uom === 'wmoUnit:m_s-1' ? v * 2.23694 : v;

// ── NWS FETCH ─────────────────────────────────────────────────────────────
export const wxCache = {};
const WX_CACHE_MS = 3 * 60 * 60 * 1000; // 3 hours

const NWS_HEADERS = { 'User-Agent': NWS_UA, 'Accept': 'application/geo+json' };

async function getJSON(url) {
  const res = await fetch(url, { headers: NWS_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Sample forecast for development only (DEMO_MODE). Never shown as real and
// never includes official warnings.
function demoForecast(locationKey) {
  const isEast = EAST.includes(locationKey);
  const base = isEast
    ? [[89, '15 to 20 mph', 28, 18, 'SW', 'Sunny and hot'], [94, '20 mph', 32, 15, 'SW', 'Sunny'], [81, '10 mph', 18, 30, 'W', 'Partly Cloudy']]
    : [[72, '5 to 10 mph', 15, 45, 'W', 'Mostly Sunny'], [78, '10 mph', 18, 38, 'SW', 'Sunny'], [82, '10 to 15 mph', 22, 33, 'S', 'Sunny']];
  const names = ['Today', 'Tomorrow', 'Wednesday'];
  const periods = base.map(([temp, wind, gustMph, minRH, windDir, forecast], i) => {
    const windMph = parseWindMph(wind);
    return { name: names[i], temp, wind, windMph, gustMph, minRH, windDir, forecast, risk: estimateFireRisk({ tempF: temp, windMph, gustMph, minRH }) };
  });
  return { status:'demo', fetchedAt: Date.now(), periods };
}

async function offlineForecast(locationKey, reason) {
  const saved = await readJSON(lastGoodKey('wx', locationKey));
  // Drop periods that have already ended.
  const periods = (saved?.periods || []).filter((p) => !p.endTime || Date.parse(p.endTime) > Date.now());
  if (periods.length) return { status:'cached', reason, fetchedAt: saved.fetchedAt, periods };
  if (DEMO_MODE) return demoForecast(locationKey);
  return { status:'unavailable', reason };
}

// Result: { status: 'live'|'cached'|'demo'|'unavailable', reason?, fetchedAt?, periods? }
export async function fetchFireWeather(locationKey) {
  const cached = wxCache[locationKey];
  if (cached && Date.now() - cached.ts < WX_CACHE_MS) return cached.result;

  const loc = findLocation(locationKey);
  if (!loc) return { status:'unavailable', reason:'error' };

  try {
    const pt = await getJSON(`https://api.weather.gov/points/${loc.lat},${loc.lon}`);
    const [fc, grid] = await Promise.all([
      getJSON(pt.properties.forecast),
      // Humidity and gusts come from the raw grid; the forecast still renders
      // without them, the risk estimate just flags the missing humidity.
      getJSON(pt.properties.forecastGridData).catch(() => null),
    ]);
    const gp = grid?.properties;

    const periods = fc.properties.periods
      .filter((p) => p.isDaytime)
      .slice(0, 5)
      .map((p) => {
        const startMs = Date.parse(p.startTime);
        const endMs = Date.parse(p.endTime);
        const rh = gridValuesInRange(gp?.relativeHumidity, startMs, endMs);
        const gusts = gridValuesInRange(gp?.windGust, startMs, endMs).map((v) => toMph(gp.windGust, v));
        const minRH = rh.length ? Math.round(Math.min(...rh)) : null;
        const gustMph = gusts.length ? Math.round(Math.max(...gusts)) : null;
        const windMph = parseWindMph(p.windSpeed);
        return {
          name: p.name,
          endTime: p.endTime,
          temp: p.temperature,
          wind: p.windSpeed,
          windMph,
          gustMph,
          minRH,
          windDir: p.windDirection,
          forecast: p.shortForecast,
          risk: estimateFireRisk({ tempF: p.temperature, windMph, gustMph, minRH }),
        };
      });

    const result = { status:'live', fetchedAt: Date.now(), periods };
    wxCache[locationKey] = { result, ts: Date.now() };
    await writeJSON(lastGoodKey('wx', locationKey), { fetchedAt: result.fetchedAt, periods });
    return result;
  } catch (e) {
    return offlineForecast(locationKey, 'offline');
  }
}

// ── OFFICIAL NWS ALERTS ───────────────────────────────────────────────────
// Fire- and smoke-related products issued by NWS for the location's point.
export const ALERT_EVENTS = [
  'Red Flag Warning',
  'Fire Weather Watch',
  'Air Quality Alert',
  'Fire Warning',
  'Evacuation Immediate',
];

export const alertCache = {};
const ALERT_CACHE_MS = 10 * 60 * 1000; // 10 minutes — warnings change fast

const notExpired = (a) => !a.expires || Date.parse(a.expires) > Date.now();

// Result: { status: 'live'|'cached'|'unavailable', fetchedAt?, alerts? }
export async function fetchNwsAlerts(locationKey) {
  const cached = alertCache[locationKey];
  if (cached && Date.now() - cached.ts < ALERT_CACHE_MS) return cached.result;

  const loc = findLocation(locationKey);
  if (!loc) return { status:'unavailable' };

  try {
    const data = await getJSON(`https://api.weather.gov/alerts/active?point=${loc.lat},${loc.lon}`);
    const alerts = (data.features || [])
      .map((f) => f.properties)
      .filter((p) => ALERT_EVENTS.includes(p.event))
      .map((p) => ({
        id: p.id,
        event: p.event,
        headline: p.headline || p.event,
        expires: p.ends || p.expires || null,
        description: p.description || '',
        instruction: p.instruction || '',
        sender: p.senderName || 'NWS',
      }));
    const result = { status:'live', fetchedAt: Date.now(), alerts };
    alertCache[locationKey] = { result, ts: Date.now() };
    await writeJSON(lastGoodKey('alerts', locationKey), { fetchedAt: result.fetchedAt, alerts });
    return result;
  } catch (e) {
    const saved = await readJSON(lastGoodKey('alerts', locationKey));
    if (saved) return { status:'cached', fetchedAt: saved.fetchedAt, alerts: (saved.alerts || []).filter(notExpired) };
    return { status:'unavailable' };
  }
}
