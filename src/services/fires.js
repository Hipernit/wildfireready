// ── LIVE FIRE DATA ────────────────────────────────────────────────────────
// NIFC WFIGS Current Incident Locations — public, no key needed. (The older
// Current_WildlandFire_Locations service now requires a token.)
const NIFC_URL =
  'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/' +
  'WFIGS_Incident_Locations_Current/FeatureServer/0/query?' +
  'where=POOState%3D%27US-WA%27&' +
  'outFields=IncidentName,IncidentSize,PercentContained,FireCause,POOCounty,ModifiedOnDateTime_dt,IncidentTypeCategory,UniqueFireIdentifier&' +
  'orderByFields=IncidentSize+DESC&resultRecordCount=5&' +
  'f=json&returnGeometry=true&outSR=4326';

// Shared cache; exported so screens can force-refresh by resetting `ts`.
export const fireCache = { data: null, ts: 0 };
const FIRE_CACHE_MS = 4 * 60 * 60 * 1000; // 4 hours — NIFC updates daily

export async function fetchLiveFires() {
  if (fireCache.data && Date.now() - fireCache.ts < FIRE_CACHE_MS) return fireCache.data;

  try {
    const res = await fetch(NIFC_URL);
    if (!res.ok) throw new Error(`NIFC HTTP ${res.status}`);
    const json = await res.json();

    // ArcGIS reports errors as HTTP 200 with an `error` body — never treat
    // that as "no fires".
    if (json.error || !Array.isArray(json.features)) throw new Error(json.error?.message || 'bad payload');
    if (json.features.length === 0) {
      return { fires: [], status:'live', fetchedAt: Date.now() };
    }

    const fires = json.features.map((f) => {
      const a = f.attributes;
      const acres = a.IncidentSize ? Math.round(a.IncidentSize).toLocaleString() : 'Unknown';
      const pct = a.PercentContained != null ? `${Math.round(a.PercentContained)}%` : 'Unknown';
      const county = a.POOCounty ? a.POOCounty.replace(' County', '').replace(' county', '') : 'Washington';
      const contained = a.PercentContained;
      const status = contained === 100 ? 'contained' : contained >= 70 ? 'monitoring' : 'active';
      const updated = a.ModifiedOnDateTime_dt
        ? new Date(a.ModifiedOnDateTime_dt).toLocaleDateString('en-US', { month:'short', day:'numeric' })
        : 'Recent';
      return {
        id: a.IncidentName || Math.random().toString(),
        name: a.IncidentName || 'Unnamed Fire',
        location: `${county} County`,
        acres,
        containment: pct,
        status,
        updated,
        cause: a.FireCause || 'Under investigation',
        lat: f.geometry?.y ?? null,
        lon: f.geometry?.x ?? null,
      };
    });

    const result = { fires, status:'live', fetchedAt: Date.now() };
    fireCache.data = result;
    fireCache.ts = Date.now();
    return result;
  } catch (e) {
    console.warn('NIFC fetch error:', e.message);
    return { fires: [], status:'unavailable', error: e.message };
  }
}
