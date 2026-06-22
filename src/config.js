// ── EXTERNAL SERVICE CONFIG ───────────────────────────────────────────────
// NOTE: Anything shipped in a client bundle is publicly readable. This key
// is fine for a low-risk demo/AirNow free tier, but for production route AQI
// requests through a small backend proxy and keep the key server-side.
// Consider loading from app config / env (e.g. expo-constants) instead of
// hardcoding.
export const AIRNOW_API_KEY = '03653ACA-AFC6-47EE-8349-CC63C9930252';

// api.weather.gov requires a descriptive User-Agent with contact info.
export const NWS_UA =
  'WildfireReady WA-08 Congressional App Challenge wildfireready@wa08.app';
