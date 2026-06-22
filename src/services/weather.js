import { NWS_UA } from '../config';
import { findLocation, EAST } from '../data/locations';

// ── FIRE DANGER MODEL ─────────────────────────────────────────────────────
export function calcFireDanger(period) {
  const temp = period.temperature || 70;
  const wind = parseInt(period.windSpeed) || 0;
  const desc = (period.shortForecast || '').toLowerCase();
  const humidityAdj =
    desc.includes('rain') || desc.includes('shower') ? -40
    : desc.includes('cloud') || desc.includes('fog') ? -15
    : desc.includes('sunny') || desc.includes('clear') ? 20
    : 0;
  const score = Math.max(0, Math.min(100,
    Math.max(0, (temp - 60) * 1.5) + Math.max(0, wind * 2) + humidityAdj
  ));
  if (score >= 75) return { level:'Extreme',  color:'#7B0000', bg:'#FEF2F2', dot:'●' };
  if (score >= 55) return { level:'High',     color:'#C0392B', bg:'#FDECEA', dot:'●' };
  if (score >= 35) return { level:'Moderate', color:'#C07A00', bg:'#FFF8E6', dot:'●' };
  if (score >= 15) return { level:'Low',      color:'#2E7D5E', bg:'#E8F5EE', dot:'●' };
  return { level:'Minimal', color:'#1C6EA4', bg:'#EBF4FB', dot:'●' };
}

export function isRedFlag(p) {
  const wet = ['rain', 'shower'].some((w) => (p.shortForecast || '').toLowerCase().includes(w));
  return p.temperature > 75 && parseInt(p.windSpeed) > 15 && !wet;
}

// ── NWS FETCH ─────────────────────────────────────────────────────────────
export const wxCache = {};
const WX_CACHE_MS = 3 * 60 * 60 * 1000; // 3 hours

const NWS_HEADERS = { 'User-Agent': NWS_UA, 'Accept': 'application/geo+json' };

function demoForecast(locationKey) {
  const isEast = EAST.includes(locationKey);
  const periods = isEast ? [
    {name:'Today',temp:89,wind:'18 mph',windDir:'SW',forecast:'Sunny and hot',fireDanger:{level:'High',color:'#C0392B',bg:'#FDECEA',dot:'●'},redFlag:true},
    {name:'Tomorrow',temp:94,wind:'22 mph',windDir:'SW',forecast:'Sunny and very hot',fireDanger:{level:'Extreme',color:'#7B0000',bg:'#FEF2F2',dot:'●'},redFlag:true},
    {name:'Wednesday',temp:81,wind:'12 mph',windDir:'W',forecast:'Partly cloudy',fireDanger:{level:'Moderate',color:'#C07A00',bg:'#FFF8E6',dot:'●'},redFlag:false},
  ] : [
    {name:'Today',temp:72,wind:'8 mph',windDir:'W',forecast:'Mostly sunny',fireDanger:{level:'Low',color:'#2E7D5E',bg:'#E8F5EE',dot:'●'},redFlag:false},
    {name:'Tomorrow',temp:78,wind:'11 mph',windDir:'SW',forecast:'Sunny',fireDanger:{level:'Moderate',color:'#C07A00',bg:'#FFF8E6',dot:'●'},redFlag:false},
    {name:'Wednesday',temp:82,wind:'15 mph',windDir:'S',forecast:'Sunny and warm',fireDanger:{level:'Moderate',color:'#C07A00',bg:'#FFF8E6',dot:'●'},redFlag:false},
  ];
  return { isLive: false, updatedAt: 'Demo data', periods };
}

export async function fetchFireWeather(locationKey) {
  const cached = wxCache[locationKey];
  if (cached && Date.now() - cached.ts < WX_CACHE_MS) return cached.data;

  const loc = findLocation(locationKey);
  if (!loc) return null;

  try {
    const ptRes = await fetch(`https://api.weather.gov/points/${loc.lat},${loc.lon}`, { headers: NWS_HEADERS });
    if (!ptRes.ok) throw new Error(`Points ${ptRes.status}`);
    const ptData = await ptRes.json();

    const fcRes = await fetch(ptData.properties.forecast, { headers: NWS_HEADERS });
    if (!fcRes.ok) throw new Error(`Forecast ${fcRes.status}`);
    const fcData = await fcRes.json();

    const periods = fcData.properties.periods
      .filter((p) => p.isDaytime)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        temp: p.temperature,
        wind: p.windSpeed,
        windDir: p.windDirection,
        forecast: p.shortForecast,
        fireDanger: calcFireDanger(p),
        redFlag: isRedFlag(p),
      }));

    const result = { periods, updatedAt: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), isLive: true };
    wxCache[locationKey] = { data: result, ts: Date.now() };
    return result;
  } catch (e) {
    return demoForecast(locationKey);
  }
}
