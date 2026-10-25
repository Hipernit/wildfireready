import { migrateState, serializeState, DEFAULT_STATE, SCHEMA_VERSION } from '../src/services/persist';
import { DEFAULT_PROFILE } from '../src/data/profile';
import { getGoBag, applicableIds, householdSize } from '../src/data/gobag';
import { buildPlanHtml } from '../src/services/planExport';
import { getRoutes, getContacts, COUNTY_RESOURCES } from '../src/data/emergency';
import { findLocation } from '../src/data/locations';
import { T } from '../src/i18n';

describe('migrateState', () => {
  test('nothing saved → defaults', () => {
    expect(migrateState(null)).toEqual(DEFAULT_STATE);
    expect(migrateState('garbage')).toEqual(DEFAULT_STATE);
  });

  test('round-trips a saved state', () => {
    const st = { ...DEFAULT_STATE, lang: 'es', themePref: 'dark', loc: 'ellensburg', checked: ['e1', 'm3'] };
    expect(migrateState(serializeState(st))).toEqual(st);
    expect(serializeState(st).version).toBe(SCHEMA_VERSION);
  });

  test('invalid values fall back per field', () => {
    const st = migrateState({ lang: 'fr', themePref: 'neon', loc: 'atlantis', checked: [1, 'e1', null] });
    expect(st.lang).toBe('en');
    expect(st.themePref).toBe('system');
    expect(st.loc).toBe(DEFAULT_STATE.loc);
    expect(st.checked).toEqual(['e1']);
  });

  test('profiles saved before new fields existed gain the new defaults', () => {
    const old = { profile: { adults: 3, pets: 2 } }; // pre-versioned, no meeting point etc.
    const st = migrateState(old);
    expect(st.profile).toEqual({ ...DEFAULT_PROFILE, adults: 3, pets: 2 });
    expect(st.actions.alertsCounties).toEqual([]);
  });
});

describe('getGoBag', () => {
  test('scales water to 1 gal/person/day for 3 days', () => {
    const items = getGoBag({ ...DEFAULT_PROFILE, adults: 2, children: 2 }, 'en');
    expect(items.find((i) => i.id === 'e2').text).toMatch(/12 gal/);
    expect(householdSize({ adults: 2, children: 2 })).toBe(4);
  });

  test('puts Essentials first', () => {
    expect(getGoBag(DEFAULT_PROFILE, 'en')[0].secKey).toBe('essentials');
  });

  test('hides sections that do not apply and shows them when they do', () => {
    const none = applicableIds(DEFAULT_PROFILE);
    expect(none.some((id) => /^[pka]/.test(id))).toBe(false);
    const all = applicableIds({ ...DEFAULT_PROFILE, pets: 1, children: 1, mobility: true, medications: true });
    expect(all).toEqual(expect.arrayContaining(['p1', 'k1', 'a1', 'm1']));
  });

  test('resolves text in both languages with no leftover placeholders', () => {
    for (const lang of ['en', 'es']) {
      for (const item of getGoBag({ ...DEFAULT_PROFILE, pets: 1, children: 1, mobility: true }, lang)) {
        expect(item.text).not.toMatch(/\{\w+\}/);
      }
    }
  });
});

describe('buildPlanHtml', () => {
  const t = T.en;
  const location = findLocation('cle-elum');
  const build = (profile) =>
    buildPlanHtml({
      t,
      lang: 'en',
      location,
      routes: getRoutes('cle-elum', 'en'),
      contacts: getContacts('cle-elum', 'en'),
      county: COUNTY_RESOURCES[location.county],
      profile,
      routeTime: () => null,
      now: new Date(2026, 9, 24, 12, 0).getTime(),
    });

  test('escapes user-entered text', () => {
    const html = build({ ...DEFAULT_PROFILE, meetingPoint: '<script>alert(1)</script> & co' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; co');
  });

  test('includes routes, contacts, verification status, and the county alert link', () => {
    const html = build(DEFAULT_PROFILE);
    expect(html).toContain('SR-903');
    expect(html).toContain('(509) 962-7525');
    expect(html).toContain(t.unverified);
    expect(html).toContain(COUNTY_RESOURCES.Kittitas.alertUrl);
  });
});
