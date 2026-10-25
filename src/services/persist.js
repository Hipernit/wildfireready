import { DEFAULT_PROFILE, DEFAULT_ACTIONS } from '../data/profile';
import { LOCATIONS } from '../data/locations';

// ── PERSISTED APP STATE ───────────────────────────────────────────────────
// Bump SCHEMA_VERSION when the shape changes and handle the old version in
// migrateState(). Unknown or missing fields always fall back to defaults, so
// adding a profile field needs no migration step.
export const STORAGE_KEY = 'wildfireready:state';
export const SCHEMA_VERSION = 1;

export const DEFAULT_STATE = {
  lang: 'en',
  themePref: 'system', // 'system' | 'light' | 'dark'
  loc: 'sammamish',
  checked: [],
  profile: DEFAULT_PROFILE,
  actions: DEFAULT_ACTIONS,
};

const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

export function migrateState(saved) {
  if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
  // Pre-versioned saves (no `version`) used the same top-level keys.
  return {
    lang: pick(saved.lang, ['en', 'es'], DEFAULT_STATE.lang),
    themePref: pick(saved.themePref, ['system', 'light', 'dark'], DEFAULT_STATE.themePref),
    loc: pick(saved.loc, LOCATIONS.map((l) => l.key), DEFAULT_STATE.loc),
    checked: Array.isArray(saved.checked) ? saved.checked.filter((id) => typeof id === 'string') : [],
    profile: { ...DEFAULT_PROFILE, ...(saved.profile || {}) },
    actions: {
      ...DEFAULT_ACTIONS,
      ...(saved.actions || {}),
      alertsCounties: Array.isArray(saved.actions?.alertsCounties) ? saved.actions.alertsCounties : [],
    },
  };
}

export const serializeState = (s) => ({ version: SCHEMA_VERSION, ...s });
