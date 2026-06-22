import { GOBAG } from '../data/gobag';

// ── HOUSEHOLD READINESS SCORE ─────────────────────────────────────────────
// 50 pts go-bag · 30 pts profile · 10 location · 10 language = 100.
export function calcScore(checkedIds, profile) {
  const gobagPct = checkedIds.size / GOBAG.length;
  const gobagScore = Math.round(gobagPct * 50);

  let profileScore = 0;
  if (profile.adults > 0) profileScore += 10;
  if (profile.meds !== undefined) profileScore += 5;
  if (profile.mobility !== undefined) profileScore += 5;
  if (profile.elderly !== undefined) profileScore += 5;
  if (profile.pets >= 0) profileScore += 5;
  profileScore = Math.min(30, profileScore);

  const total = gobagScore + profileScore + 10 + 10;
  const grade = total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F';
  const color = total >= 90 ? '#2E7D5E' : total >= 75 ? '#1C6EA4' : total >= 60 ? '#C07A00' : total >= 40 ? '#D4570A' : '#C0392B';

  const categories = [
    { key:'gobag',    pct:Math.round(gobagPct * 100),         score:gobagScore,   max:50 },
    { key:'profile',  pct:Math.round((profileScore / 30) * 100), score:profileScore, max:30 },
    { key:'location', pct:100, score:10, max:10 },
    { key:'language', pct:100, score:10, max:10 },
  ];

  const fixes = [];
  if (gobagPct < 1) fixes.push('gobag');
  if (!profile.meds) fixes.push('meds');
  if (profile.pets === 0) fixes.push('pets');

  return { total, grade, color, categories, fixes };
}
