import { readJSON, writeJSON, lastGoodKey } from './storage';
import { distanceMiles } from './geo';
import { fetchWithTimeout } from './http';

// ── LIVE FIRE DATA ────────────────────────────────────────────────────────
// NIFC WFIGS Current Incident Locations — public, no key needed. (The older
// Current_WildlandFire_Locations service now requires a token.) Prescribed
// burns (IncidentTypeCategory 'RX') are excluded.
const NIFC_URL =
  'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/' +
  'WFIGS_Incident_Locations_Current/FeatureServer/0/query?' +
  'where=' + encodeURIComponent("POOState='US-WA' AND IncidentTypeCategory<>'RX'") + '&' +
  'outFields=IncidentName,IncidentSize,PercentContained,FireCause,POOCounty,ModifiedOnDateTime_dt,IncidentTypeCategory,UniqueFireIdentifier,IrwinID&' +
  'orderByFields=IncidentSize+DESC&resultRecordCount=200&' +
  'f=json&returnGeometry=true&outSR=4326';

export const NEARBY_MILES = 30;

// Shared cache; exported so screens can force-refresh by resetting `ts`.
export const fireCache = { data: null, ts: 0 };
const FIRE_CACHE_MS = 30 * 60 * 1000; // 30 minutes

export function fireStatus(pct) {
  if (pct == null) return 'unknown';
  if (pct >= 100) return 'contained';
  if (pct >= 70) return 'monitoring';
  return 'active';
}

// Raw ArcGIS feature → app fire. Display formatting happens in the UI.
export function parseFire(f) {
  const a = f.attributes || {};
  const lat = f.geometry?.y ?? null;
  const lon = f.geometry?.x ?? null;
  return {
    id: a.UniqueFireIdentifier || a.IrwinID || `${a.IncidentName}-${lat}-${lon}`,
    name: a.IncidentName || null,
    county: a.POOCounty ? a.POOCounty.replace(/ county$/i, '') : null,
    acres: a.IncidentSize != null ? Math.round(a.IncidentSize) : null,
    containment: a.PercentContained != null ? Math.round(a.PercentContained) : null,
    status: fireStatus(a.PercentContained),
    cause: a.FireCause || null,
    modifiedAt: a.ModifiedOnDateTime_dt || null,
    type: a.IncidentTypeCategory || null,
    lat, lon,
  };
}

// Adds distanceMi from the community and sorts nearest first.
export function withDistance(fires, loc) {
  if (!loc) return fires;
  return fires
    .map((f) => ({ ...f, distanceMi: f.lat != null && f.lon != null ? distanceMiles(loc, { lat: f.lat, lon: f.lon }) : null }))
    .sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity));
}

// Result: { status: 'live'|'cached'|'unavailable', fetchedAt?, fires }
export async function fetchLiveFires() {
  if (fireCache.data && Date.now() - fireCache.ts < FIRE_CACHE_MS) return fireCache.data;

  try {
    const res = await fetchWithTimeout(NIFC_URL);
    if (!res.ok) throw new Error(`NIFC HTTP ${res.status}`);
    const json = await res.json();
    // ArcGIS reports errors as HTTP 200 with an `error` body — never treat
    // that as "no fires".
    if (json.error || !Array.isArray(json.features)) throw new Error(json.error?.message || 'bad payload');

    const fires = json.features.map(parseFire).filter((f) => f.type !== 'RX');
    const result = { fires, status:'live', fetchedAt: Date.now() };
    fireCache.data = result;
    fireCache.ts = Date.now();
    await writeJSON(lastGoodKey('fires', 'wa'), { fetchedAt: result.fetchedAt, fires });
    return result;
  } catch (e) {
    const saved = await readJSON(lastGoodKey('fires', 'wa'));
    if (saved?.fires) return { status:'cached', fetchedAt: saved.fetchedAt, fires: saved.fires };
    return { fires: [], status:'unavailable', error: e.message };
  }
}
