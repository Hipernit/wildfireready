// ── EXTERNAL SERVICE CONFIG ───────────────────────────────────────────────
// Values come from EXPO_PUBLIC_* env vars (see .env.example). Expo inlines
// them into the client bundle at build time, so they are publicly readable —
// never put a secret here. Each must be referenced as a literal
// `process.env.EXPO_PUBLIC_X` or Expo won't inline it.
export const AIRNOW_API_KEY = process.env.EXPO_PUBLIC_AIRNOW_API_KEY || '';

// api.weather.gov asks for a descriptive User-Agent with contact info.
export const NWS_UA = process.env.EXPO_PUBLIC_NWS_UA || 'WildfireReady (contact not configured)';

// Sample data is only ever shown in development builds with this flag set,
// and is always labeled DEMO in the UI.
export const DEMO_MODE = typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_DEMO_MODE === '1';
