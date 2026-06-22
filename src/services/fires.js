// ── LIVE FIRE DATA ────────────────────────────────────────────────────────
// NIFC WFIGS Current Wildland Fire Incident Locations — public, no key needed.
// Filtered to the Washington state bounding box; returns real active fires.
const NIFC_URL =
  'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/' +
  'Current_WildlandFire_Locations/FeatureServer/0/query?' +
  'where=POOState%3D%27US-WA%27&' +
  'outFields=IncidentName,GISAcres,PercentContained,FireCause,POOCounty,ModifiedOnDateTime_dt,IncidentTypeCategory&' +
  'orderByFields=GISAcres+DESC&resultRecordCount=5&' +
  'f=json&returnGeometry=false';

// Shared cache; exported so screens can force-refresh by resetting `ts`.
export const fireCache = { data: null, ts: 0 };
const FIRE_CACHE_MS = 4 * 60 * 60 * 1000; // 4 hours — NIFC updates daily

const nowTime = () => new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

export async function fetchLiveFires() {
  if (fireCache.data && Date.now() - fireCache.ts < FIRE_CACHE_MS) return fireCache.data;

  try {
    const res = await fetch(NIFC_URL);
    if (!res.ok) throw new Error(`NIFC HTTP ${res.status}`);
    const json = await res.json();

    if (!json.features || json.features.length === 0) {
      return { fires: [], isLive: true, updatedAt: nowTime() };
    }

    const fires = json.features.map((f) => {
      const a = f.attributes;
      const acres = a.GISAcres ? Math.round(a.GISAcres).toLocaleString() : 'Unknown';
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
      };
    });

    const result = { fires, isLive: true, updatedAt: nowTime() };
    fireCache.data = result;
    fireCache.ts = Date.now();
    return result;
  } catch (e) {
    console.warn('NIFC fetch error:', e.message);
    return { fires: [], isLive: false, updatedAt: 'Offline', error: e.message };
  }
}
