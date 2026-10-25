import {
  getRoutes,
  getContacts,
  EVAC_ROUTES,
  CONTACTS,
  COUNTY_RESOURCES,
  isVerificationStale,
} from '../src/data/emergency';
import { LOCATIONS } from '../src/data/locations';
import { T } from '../src/i18n';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Every record that must carry verification metadata.
function allRecords() {
  const routes = Object.values(EVAC_ROUTES).flat();
  const shelters = routes.flatMap((r) => r.shelters);
  return [...routes, ...shelters, ...CONTACTS, ...Object.values(COUNTY_RESOURCES)];
}

describe('verification metadata', () => {
  test('every route, shelter, contact, and county link has source and lastVerified fields', () => {
    for (const rec of allRecords()) {
      expect(rec).toHaveProperty('source');
      expect(rec).toHaveProperty('lastVerified');
    }
  });

  test('a record is only marked verified when it cites a source', () => {
    for (const rec of allRecords()) {
      if (rec.lastVerified) {
        expect(rec.lastVerified).toMatch(ISO_DATE);
        expect(rec.source).toMatch(/^https?:\/\//);
      }
    }
  });

  test('every community county has official resources with an alert sign-up URL', () => {
    for (const loc of LOCATIONS) {
      const res = COUNTY_RESOURCES[loc.county];
      expect(res).toBeDefined();
      expect(res.alertUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('getRoutes', () => {
  test.each(['en', 'es'])('resolves every curated route into %s', (lang) => {
    for (const loc of LOCATIONS) {
      const routes = getRoutes(loc.key, lang);
      expect(routes.length).toBeGreaterThan(0);
      for (const r of routes) {
        expect(typeof r.name).toBe('string');
        expect(typeof r.desc).toBe('string');
        expect(r.name.trim()).not.toBe('');
        expect(r.desc.trim()).not.toBe('');
        expect(Array.isArray(r.shelters)).toBe(true);
      }
    }
  });

  test('English and Spanish routes differ (no untranslated copies)', () => {
    for (const loc of LOCATIONS) {
      const en = getRoutes(loc.key, 'en');
      const es = getRoutes(loc.key, 'es');
      en.forEach((r, i) => expect(es[i].desc).not.toBe(r.desc));
    }
  });

  test('unknown locations fall back to translated generic guidance', () => {
    const routes = getRoutes('nowhere', 'es');
    expect(routes.map((r) => r.name)).toEqual([T.es.followAlerts, T.es.movePerpendicular]);
    expect(routes.every((r) => r.lastVerified === null)).toBe(true);
  });

  test('single-exit areas are flagged leave-early', () => {
    const flagged = Object.values(EVAC_ROUTES)
      .flat()
      .filter((r) => r.flag === 'leaveEarly');
    expect(flagged.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getContacts', () => {
  test('resolves names into the active language', () => {
    const en = getContacts('wenatchee', 'en');
    const es = getContacts('wenatchee', 'es');
    expect(en.map((c) => c.detail)).toEqual(es.map((c) => c.detail));
    expect(en[0].name).not.toBe(es[0].name);
  });

  test('every community includes 2-1-1', () => {
    for (const loc of LOCATIONS) {
      expect(getContacts(loc.key, 'en').some((c) => c.detail === '2-1-1')).toBe(true);
    }
  });

  test('unknown locations get all counties', () => {
    expect(getContacts('nowhere', 'en')).toHaveLength(CONTACTS.length);
  });
});

describe('isVerificationStale', () => {
  const now = new Date(2026, 9, 24).getTime();

  test('recent verification is fresh, old verification is stale', () => {
    expect(isVerificationStale('2026-10-01', now)).toBe(false);
    expect(isVerificationStale('2025-10-01', now)).toBe(true);
  });

  test('unverified records are not "stale"', () => {
    expect(isVerificationStale(null, now)).toBe(false);
  });
});
