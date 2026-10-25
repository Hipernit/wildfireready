// fetch() with a timeout, so a stalled API falls through to the saved /
// unavailable state instead of leaving a spinner up forever.
export const FETCH_TIMEOUT_MS = 15000;

export async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
