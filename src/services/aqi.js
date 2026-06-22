import { AIRNOW_API_KEY } from '../config';
import { findLocation } from '../data/locations';

// ── AQI METADATA ──────────────────────────────────────────────────────────
const AQI_META = {
  'Good':{ cat:'good', color:'#2E7D5E' },
  'Moderate':{ cat:'moderate', color:'#C07A00' },
  'Unhealthy for Sensitive Groups':{ cat:'sensitive', color:'#D4570A' },
  'Unhealthy':{ cat:'unhealthy', color:'#C0392B' },
  'Very Unhealthy':{ cat:'hazardous', color:'#7B0000' },
  'Hazardous':{ cat:'hazardous', color:'#7B0000' },
};

const AQI_MSGS = {
  en:{ good:'Air quality is satisfactory. Great day to be outside.', moderate:'Acceptable for most. Sensitive individuals may want to limit outdoor exertion.', sensitive:'Children, elderly, and people with lung conditions should reduce outdoor exertion.', unhealthy:'Everyone should reduce prolonged outdoor exertion. Wear an N95 mask outside.', hazardous:'Health emergency. Everyone should avoid all outdoor activity.' },
  es:{ good:'La calidad del aire es satisfactoria.', moderate:'Aceptable. Las personas sensibles deben limitar el esfuerzo al aire libre.', sensitive:'Niños, ancianos y personas con enfermedades pulmonares deben reducir el esfuerzo.', unhealthy:'Todos deben reducir el esfuerzo prolongado. Use mascarilla N95 afuera.', hazardous:'Emergencia de salud. Todos deben evitar toda actividad al aire libre.' },
};

const AQI_LABELS = {
  en:{ 'Good':'Good','Moderate':'Moderate','Unhealthy for Sensitive Groups':'Unhealthy for Sensitive Groups','Unhealthy':'Unhealthy','Very Unhealthy':'Very Unhealthy','Hazardous':'Hazardous' },
  es:{ 'Good':'Bueno','Moderate':'Moderado','Unhealthy for Sensitive Groups':'No saludable para grupos sensibles','Unhealthy':'No saludable','Very Unhealthy':'Muy no saludable','Hazardous':'Peligroso' },
};

const AQI_FALLBACK = {
  'kirkland':{ aqi:38, cat:'good', label:'Good', color:'#2E7D5E' },
  'sammamish':{ aqi:42, cat:'good', label:'Good', color:'#2E7D5E' },
  'issaquah':{ aqi:55, cat:'moderate', label:'Moderate', color:'#C07A00' },
  'maple-valley':{ aqi:61, cat:'moderate', label:'Moderate', color:'#C07A00' },
  'wenatchee':{ aqi:118, cat:'sensitive', label:'Unhealthy for Sensitive Groups', color:'#D4570A' },
  'leavenworth':{ aqi:143, cat:'unhealthy', label:'Unhealthy', color:'#C0392B' },
  'ellensburg':{ aqi:97, cat:'moderate', label:'Moderate', color:'#C07A00' },
  'cle-elum':{ aqi:152, cat:'unhealthy', label:'Unhealthy', color:'#C0392B' },
};

// Cache is keyed by location; exported so screens can invalidate on pull-to-refresh.
export const aqiCache = {};
const AQI_CACHE_MS = 60 * 60 * 1000; // 1 hour

const withLang = (data, lang) => ({
  ...data,
  label: AQI_LABELS[lang][data.labelKey] || data.labelKey,
  msg: AQI_MSGS[lang][data.cat],
});

const fallbackFor = (key, lang, updatedAt) => {
  const fb = AQI_FALLBACK[key];
  return { ...fb, labelKey: fb.label, label: AQI_LABELS[lang][fb.label] || fb.label, msg: AQI_MSGS[lang][fb.cat], updatedAt, isLive: false };
};

export async function fetchAQI(locationKey, lang = 'en') {
  const cached = aqiCache[locationKey];
  if (cached && Date.now() - cached.ts < AQI_CACHE_MS) return withLang(cached.data, lang);

  const loc = findLocation(locationKey);
  if (!loc) return fallbackFor(locationKey, lang, 'Demo');

  try {
    const res = await fetch(`https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${loc.zip}&distance=25&API_KEY=${AIRNOW_API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reading = data.find((d) => d.ParameterName === 'PM2.5') || data.find((d) => d.ParameterName === 'O3') || data[0];
    if (!reading) throw new Error('empty');

    const meta = AQI_META[reading.Category.Name] || { cat:'moderate', color:'#C07A00' };
    const result = {
      aqi: reading.AQI,
      cat: meta.cat,
      labelKey: reading.Category.Name,
      color: meta.color,
      updatedAt: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      isLive: true,
    };
    aqiCache[locationKey] = { data: result, ts: Date.now() };
    return withLang(result, lang);
  } catch (e) {
    return fallbackFor(locationKey, lang, 'Offline');
  }
}
