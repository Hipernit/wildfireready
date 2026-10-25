import { fmt, formatDate, formatDateTime } from '../i18n';

// ── PRINTABLE PLAN ────────────────────────────────────────────────────────
// Builds a self-contained, print-friendly (black on white) HTML page of the
// household's evacuation plan for expo-print.
const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function verifiedLabel(record, t, lang) {
  return record.lastVerified ? fmt(t.verifiedOn, { date: formatDate(record.lastVerified, lang) }) : t.unverified;
}

export function buildPlanHtml({ t, lang, location, routes, contacts, county, profile, routeTime, now = Date.now() }) {
  const title = fmt(t.planPdfTitle, { community: location?.label });
  const household = [
    `<p>${esc(fmt(t.householdCounts, { adults: profile.adults, children: profile.children, pets: profile.pets }))}</p>`,
    `<p><b>${esc(t.meetingPoint)}:</b> ${esc(profile.meetingPoint?.trim() || t.notSet)}</p>`,
    `<p><b>${esc(t.outOfAreaContact)}:</b> ${esc([profile.contactName, profile.contactPhone].filter((v) => v?.trim()).join(' · ') || t.notSet)}</p>`,
  ].join('');

  const routeHtml = routes.map((r) => {
    const time = routeTime(r);
    const shelters = r.shelters.map((sh) => `
      <div class="sh"><b>${esc(sh.use === 'animals' ? t.animalShelterLabel : t.shelterLabel)}:</b>
        ${esc(sh.name)}, ${esc(sh.address)} <span class="v">(${esc(verifiedLabel(sh, t, lang))})</span></div>`).join('');
    return `
      <div class="route">
        <h3>${esc(r.num)}. ${esc(r.name)}${time ? ` <span class="time">${esc(time)}</span>` : ''}</h3>
        <p>${esc(r.desc)}</p>
        ${shelters}
        <p class="v">${esc(verifiedLabel(r, t, lang))}</p>
      </div>`;
  }).join('');

  const contactHtml = contacts.map((c) => `<tr><td>${esc(c.name)}</td><td><b>${esc(c.detail)}</b></td></tr>`).join('');

  const countyHtml = county ? `
    <h2>${esc(fmt(t.countyResources, { county: location.county }))}</h2>
    <p>${esc(fmt(t.signUpAlerts, { name: county.alertName }))}: ${esc(county.alertUrl)}</p>
    ${county.evacMapUrl ? `<p>${esc(t.evacLookup)}: ${esc(county.evacMapUrl)}</p>` : `<p>${esc(t.noEvacLookup)}</p>`}` : '';

  const levels = t.levelTags.map((tag, i) => `<li><b>${i + 1} — ${esc(tag)}:</b> ${esc(t.levelActions[i])}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  body{font-family:-apple-system,Roboto,Helvetica,Arial,sans-serif;color:black;margin:28px;font-size:13px;line-height:1.45}
  h1{font-size:20px;margin:0 0 4px} h2{font-size:15px;margin:22px 0 8px;border-bottom:1px solid gray;padding-bottom:4px}
  h3{font-size:13px;margin:0 0 4px} p{margin:4px 0}
  .route{border:1px solid gray;border-radius:6px;padding:10px;margin:0 0 10px;page-break-inside:avoid}
  .time{font-weight:normal;border:1px solid gray;border-radius:10px;padding:0 6px;font-size:11px}
  .sh{margin-top:6px} .v{font-size:11px;color:dimgray}
  table{border-collapse:collapse;width:100%} td{border-bottom:1px solid lightgray;padding:6px 4px}
  .note{font-size:11px;color:dimgray;margin-top:18px}
</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <p class="v">${esc(fmt(t.planGenerated, { date: formatDateTime(now, lang) }))}</p>
  <h2>${esc(t.householdPlan)}</h2>
  ${household}
  <h2>${esc(t.evacLevelTitle)}</h2>
  <ul>${levels}</ul>
  <h2>${esc(t.evacRoutes)}</h2>
  ${routeHtml}
  <p class="note">${esc(t.shelterDisclaimer)}</p>
  <h2>${esc(t.emergencyContacts)}</h2>
  <table>${contactHtml}</table>
  ${countyHtml}
</body>
</html>`;
}
