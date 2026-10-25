import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang, useLangCode, fmt, formatDate } from '../i18n';
import { getRoutes, getContacts, EVAC_ROUTES, COUNTY_RESOURCES } from '../data/emergency';
import { findLocation } from '../data/locations';
import LocPicker from '../components/LocPicker';

const openUrl = (url) => Linking.openURL(url).catch(() => {});

// "Verified Oct 24, 2026" (tappable → source) or "Unverified — confirm…".
function VerifyTag({ record }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const verified = !!record.lastVerified;
  const label = verified ? fmt(t.verifiedOn, { date: formatDate(record.lastVerified, lang) }) : t.unverified;
  const fg = verified ? theme.success : theme.warning;
  const body = (
    <View style={[s.tag, { backgroundColor: verified ? theme.successBg : theme.warningBg, alignSelf:'flex-start', marginTop:6 }]}>
      <Text style={[s.tagTxt, { color: fg }]}>{verified ? '✓ ' : '? '}{label}{verified && record.source ? ` · ${t.viewSource} ›` : ''}</Text>
    </View>
  );
  if (!verified || !record.source) return body;
  return <TouchableOpacity onPress={() => openUrl(record.source)} accessibilityRole="link">{body}</TouchableOpacity>;
}

export default function PlanScreen({ loc, setLoc }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  const routes = getRoutes(loc, lang);
  const contacts = getContacts(loc, lang);
  const location = findLocation(loc);
  const county = location ? COUNTY_RESOURCES[location.county] : null;
  const hasOfficialRoutes = !!EVAC_ROUTES[loc];

  const routeTime = (r) => {
    if (r.flag === 'leaveEarly') return t.leaveEarly;
    if (r.flag === 'inCity') return t.inCity;
    if (r.est == null) return null;
    return r.est >= 60 ? fmt(t.estHr, { n: Math.round(r.est / 6) / 10 }) : fmt(t.estMin, { n: r.est });
  };

  const sharePlan = async () => {
    const routeText = routes.map((r) => {
      const time = routeTime(r);
      const shelters = r.shelters.map((sh) => `${sh.use === 'animals' ? t.animalShelterLabel : t.shelterLabel}: ${sh.name}, ${sh.address}`).join('\n');
      return `${r.num}. ${r.name}${time ? ` (${time})` : ''}\n${r.desc}${shelters ? `\n${shelters}` : ''}`;
    }).join('\n\n');
    const contactText = contacts.map((c) => `${c.name}: ${c.detail}`).join('\n');
    const alertText = county ? `\n\n${fmt(t.signUpAlerts, { name: county.alertName })}: ${county.alertUrl}` : '';
    await Share.share({
      message: `${t.shareMsg} ${location?.label}\n\n${t.evacRoutes}:\n${routeText}\n\n${t.shelterDisclaimer}\n\n${t.emergencyContacts}:\n${contactText}${alertText}${t.shareFooter}`,
    });
  };

  const call = (number) => {
    Linking.openURL(`tel:${number.replace(/[^0-9+]/g, '')}`).catch(() => {});
  };

  const levelMeta = [
    { num: 1, tag: t.levelTags[0], action: t.levelActions[0], bg: theme.warningBg, color: theme.warning },
    { num: 2, tag: t.levelTags[1], action: t.levelActions[1], bg: theme.accentBg,  color: theme.accentText },
    { num: 3, tag: t.levelTags[2], action: t.levelActions[2], bg: theme.dangerBg,  color: theme.danger },
  ];

  const routeBadge = {
    1: { label: t.routeBadges[1], bg: theme.successBg, color: theme.success },
    2: { label: t.routeBadges[2], bg: theme.infoBg,    color: theme.info },
    3: { label: t.routeBadges[3], bg: theme.warningBg, color: theme.warning },
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <LocPicker value={loc} onChange={setLoc} />

      {location?.note && (
        <View style={[s.disclaimerRow, { backgroundColor: theme.infoBg, borderColor: theme.info }]}>
          <Text style={[s.disclaimerTxt, { color: theme.info }]}>{location.note[lang]}</Text>
        </View>
      )}

      {/* ── Official county resources ───────────────────────────────────── */}
      {county && (
        <View style={[s.ctaCard, { backgroundColor: theme.darkCard, marginBottom:0 }]}>
          <Text style={s.ctaTitle}>{fmt(t.countyResources, { county: location.county })}</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => openUrl(county.alertUrl)} accessibilityRole="link">
            <Text style={s.ctaBtnTxt}>{fmt(t.signUpAlerts, { name: county.alertName })}</Text>
          </TouchableOpacity>
          {county.evacMapUrl ? (
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor:'transparent', borderWidth:1.5, borderColor: ACCENT, marginTop:10 }]} onPress={() => openUrl(county.evacMapUrl)} accessibilityRole="link">
              <Text style={s.ctaBtnTxt}>{t.evacLookup}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[s.ctaBody, { marginTop:10, marginBottom:0 }]}>{t.noEvacLookup}</Text>
          )}
          <TouchableOpacity onPress={() => openUrl(county.infoUrl)} style={{ paddingVertical:10, marginTop:4 }} accessibilityRole="link">
            <Text style={{ color: theme.darkCardSub, fontSize:13, fontWeight:'600' }}>{t.countyInfo} ›</Text>
          </TouchableOpacity>
          <VerifyTag record={county} />
        </View>
      )}

      {/* ── Evacuation levels ───────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.evacLevelTitle}</Text>
      <View style={{ flexDirection:'row', gap:8, marginHorizontal:16 }}>
        {levelMeta.map((lv) => (
          <View key={lv.num} style={[s.levelCard, { backgroundColor: lv.bg, borderColor: lv.color }]}>
            <Text style={[s.levelNum, { color: lv.color }]}>{lv.num}</Text>
            <Text style={[s.levelTag, { color: lv.color }]}>{lv.tag}</Text>
            <Text style={[s.levelAction, { color: theme.textMid }]}>{lv.action}</Text>
          </View>
        ))}
      </View>

      {/* ── Evacuation routes ───────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.evacRoutes}</Text>
      {!hasOfficialRoutes && (
        <View style={[s.disclaimerRow, { backgroundColor: theme.accentBg, borderColor: theme.accentText, marginBottom:4 }]}>
          <Text style={[s.disclaimerTxt, { color: theme.accentText }]}>{t.genericRoutesNote}</Text>
        </View>
      )}
      {routes.map((r) => {
        const badge = routeBadge[r.num] ?? routeBadge[2];
        const urgent = r.flag === 'leaveEarly';
        const time = routeTime(r);
        return (
          <View
            key={r.num}
            style={[s.routeCard, { backgroundColor: theme.surface, borderColor: urgent ? theme.danger : theme.border }]}
          >
            {hasOfficialRoutes && (
              <View style={s.routeHead}>
                <View style={[s.tag, { backgroundColor: badge.bg }]}>
                  <Text style={[s.tagTxt, { color: badge.color }]}>{badge.label}</Text>
                </View>
                {time && (
                  <Text style={[s.routeTime, { backgroundColor: urgent ? theme.dangerBg : theme.surfaceAlt, color: urgent ? theme.danger : theme.textMid }]}>
                    {time}
                  </Text>
                )}
              </View>
            )}
            <Text style={[s.routeName, { color: theme.text }]}>{r.name}</Text>
            <Text style={[s.routeDesc, { color: theme.textMid }]}>{r.desc}</Text>
            {hasOfficialRoutes && <VerifyTag record={r} />}
            {r.shelters.map((sh) => (
              <View key={sh.name + sh.use} style={{ marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor: theme.borderLight }}>
                <Text style={{ fontSize:12, fontWeight:'700', color: theme.textMid }}>{sh.use === 'animals' ? t.animalShelterLabel : t.shelterLabel}</Text>
                <Text style={{ fontSize:13, color: theme.text, marginTop:2 }}>{sh.name} · {sh.address}</Text>
                <VerifyTag record={sh} />
              </View>
            ))}
          </View>
        );
      })}

      {hasOfficialRoutes && (
        <View style={[s.disclaimerRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[s.disclaimerTxt, { color: theme.textMid }]}>{t.shelterDisclaimer}</Text>
        </View>
      )}

      {/* ── Emergency contacts ──────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.emergencyContacts}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {contacts.map((c, i) => (
          <View
            key={c.detail}
            style={[
              s.contactRow,
              i < contacts.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }],
            ]}
          >
            <View style={{ flex:1 }}>
              <Text style={[s.contactName, { color: theme.text }]}>{c.name}</Text>
              <Text style={[s.contactDetail, { color: theme.textMid }]}>{c.detail}</Text>
              <VerifyTag record={c} />
            </View>
            <TouchableOpacity
              style={[s.callBtn, { backgroundColor: ACCENT }]}
              onPress={() => call(c.detail)}
              accessibilityLabel={fmt(t.callA11y, { name: c.name })}
            >
              <Text style={s.callBtnTxt}>{t.call}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ── Share ───────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.shareScoreBtn, { marginHorizontal:16, marginTop:20 }]}
        onPress={sharePlan}
      >
        <Text style={s.shareScoreBtnTxt}>{t.sharePlan}</Text>
      </TouchableOpacity>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
