import { calcScore, SCORE_WEIGHTS } from '../src/services/score';
import { applicableIds } from '../src/data/gobag';
import { DEFAULT_PROFILE, DEFAULT_ACTIONS } from '../src/data/profile';

const base = (over = {}) => ({
  checkedIds: new Set(),
  profile: DEFAULT_PROFILE,
  actions: DEFAULT_ACTIONS,
  county: 'King',
  ...over,
});

const completeProfile = {
  ...DEFAULT_PROFILE,
  adults: 2,
  meetingPoint: 'Library',
  contactName: 'Aunt Ana',
  contactPhone: '555-0100',
  savedAt: 1,
};

describe('calcScore', () => {
  test('weights add up to 100', () => {
    expect(Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  test('a brand-new user scores 0 and gets an F', () => {
    const r = calcScore(base());
    expect(r.total).toBe(0);
    expect(r.grade).toBe('F');
    expect(r.fixes.map((f) => f.key)).toEqual(
      expect.arrayContaining(['gobag', 'profile', 'alerts', 'shared', 'meeting', 'contact']),
    );
  });

  test('everything done scores 100 and an A with no fixes', () => {
    const r = calcScore(
      base({
        checkedIds: new Set(applicableIds(completeProfile)),
        profile: completeProfile,
        actions: { alertsCounties: ['King'], planSharedAt: 1 },
      }),
    );
    expect(r.total).toBe(100);
    expect(r.grade).toBe('A');
    expect(r.fixes).toEqual([]);
  });

  test('go-bag points scale with the share of applicable items packed', () => {
    const ids = applicableIds(DEFAULT_PROFILE);
    const half = new Set(ids.slice(0, Math.floor(ids.length / 2)));
    const r = calcScore(base({ checkedIds: half }));
    expect(r.categories.find((c) => c.key === 'gobag').score).toBe(
      Math.round((half.size / ids.length) * SCORE_WEIGHTS.gobag),
    );
  });

  test('pet items do not count against a household with no pets', () => {
    const noPets = { ...DEFAULT_PROFILE, pets: 0 };
    const ids = applicableIds(noPets);
    expect(ids.some((id) => id.startsWith('p'))).toBe(false);
    const r = calcScore(base({ checkedIds: new Set(ids), profile: noPets }));
    expect(r.categories.find((c) => c.key === 'gobag').pct).toBe(100);
  });

  test('checked items that no longer apply are ignored', () => {
    const r = calcScore(base({ checkedIds: new Set(['p1', 'p2', 'p3']), profile: { ...DEFAULT_PROFILE, pets: 0 } }));
    expect(r.categories.find((c) => c.key === 'gobag').score).toBe(0);
  });

  test('alerts only count for the selected community county', () => {
    const actions = { ...DEFAULT_ACTIONS, alertsCounties: ['Chelan'] };
    expect(calcScore(base({ actions, county: 'King' })).categories.find((c) => c.key === 'alerts').score).toBe(0);
    expect(calcScore(base({ actions, county: 'Chelan' })).categories.find((c) => c.key === 'alerts').score).toBe(
      SCORE_WEIGHTS.alerts,
    );
  });

  test('blank meeting point and half-filled contact earn nothing', () => {
    const profile = { ...DEFAULT_PROFILE, meetingPoint: '   ', contactName: 'Ana', contactPhone: '' };
    const r = calcScore(base({ profile }));
    expect(r.categories.find((c) => c.key === 'meeting').score).toBe(0);
    expect(r.categories.find((c) => c.key === 'contact').score).toBe(0);
  });

  test('fixes are ordered by remaining points and carry a navigation target', () => {
    const r = calcScore(base());
    expect(r.fixes[0]).toMatchObject({ key: 'gobag', target: 'gobag', gain: SCORE_WEIGHTS.gobag });
    const gains = r.fixes.map((f) => f.gain);
    expect([...gains].sort((a, b) => b - a)).toEqual(gains);
    expect(r.fixes.find((f) => f.key === 'meeting').target).toBe('profile');
  });

  test('grade thresholds', () => {
    // profile 15 + alerts 15 + shared 10 + meeting 10 + contact 5 = 55 → D
    const r = calcScore(base({ profile: completeProfile, actions: { alertsCounties: ['King'], planSharedAt: 1 } }));
    expect(r.total).toBe(55);
    expect(r.grade).toBe('D');
  });
});
