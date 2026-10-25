import AsyncStorage from '@react-native-async-storage/async-storage';

// ── PERSISTENCE HELPERS ───────────────────────────────────────────────────
// Storage failures (quota, corrupt JSON) never crash the app; reads fall back
// to null and writes are best-effort.
export async function readJSON(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function writeJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

// Last successful live response per source + location, used offline.
export const lastGoodKey = (source, loc) => `lastgood:${source}:${loc}`;
