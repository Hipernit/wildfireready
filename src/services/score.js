import { applicableIds } from '../data/gobag';

// ── HOUSEHOLD READINESS SCORE ─────────────────────────────────────────────
// Points are earned only by things the user has actually done:
//   go-bag packed (share of items that apply to this household)  45
//   household profile saved                                       15
//   signed up for the county's official alerts (user confirms)    15
//   plan shared with family                                       10
//   family meeting point set                                      10
//   out-of-area contact set (name + phone)                         5
// A new user with nothing done scores 0 (F).
export const SCORE_WEIGHTS = { gobag:45, profile:15, alerts:15, shared:10, meeting:10, contact:5 };

// Where each improvement is made: a tab key or 'profile' (the profile sheet).
export const FIX_TARGETS = { gobag:'gobag', profile:'profile', alerts:'home', shared:'plan', meeting:'profile', contact:'profile' };

export function calcScore({ checkedIds, profile, actions, county }) {
  const ids = applicableIds(profile);
  const packed = ids.filter((id) => checkedIds.has(id)).length;
  const gobagPct = ids.length ? packed / ids.length : 0;

  const done = {
    profile: !!profile.savedAt,
    alerts: !!county && (actions.alertsCounties || []).includes(county),
    shared: !!actions.planSharedAt,
    meeting: !!profile.meetingPoint?.trim(),
    contact: !!(profile.contactName?.trim() && profile.contactPhone?.trim()),
  };

  const categories = [
    { key:'gobag', score: Math.round(gobagPct * SCORE_WEIGHTS.gobag), max: SCORE_WEIGHTS.gobag, pct: Math.round(gobagPct * 100) },
    ...['profile', 'alerts', 'shared', 'meeting', 'contact'].map((key) => ({
      key, score: done[key] ? SCORE_WEIGHTS[key] : 0, max: SCORE_WEIGHTS[key], pct: done[key] ? 100 : 0,
    })),
  ];

  const total = categories.reduce((sum, c) => sum + c.score, 0);
  const grade = total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F';
  // Theme color key for the grade.
  const tone = total >= 90 ? 'success' : total >= 75 ? 'info' : total >= 60 ? 'warning' : total >= 40 ? 'accentText' : 'danger';

  // Biggest remaining gains first.
  const fixes = categories
    .filter((c) => c.score < c.max)
    .sort((a, b) => (b.max - b.score) - (a.max - a.score))
    .map((c) => ({ key: c.key, target: FIX_TARGETS[c.key], gain: c.max - c.score }));

  return { total, grade, tone, categories, fixes, packed, applicable: ids.length };
}
