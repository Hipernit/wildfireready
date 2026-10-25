import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Linking, RefreshControl, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt, formatDate } from '../i18n';
import { getRoutes, getContacts, EVAC_ROUTES, COUNTY_RESOURCES, isVerificationStale } from '../data/emergency';
import { findLocation } from '../data/locations';
import { fetchNwsAlerts, alertCache } from '../services/weather';
import { buildPlanHtml } from '../services/planExport';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';

const openUrl = (url) => Linking.openURL(url).catch(() => {});
const call = (number) => Linking.openURL(`tel:${number.replace(/[^0-9+]/g, '')}`).catch(() => {});

// "Verified Oct 24, 2026" (tappable → source), "Unverified — confirm…", or a
// stale warning when the verification is more than ~6 months old.
function VerifyTag({ record }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const verified = !!record.lastVerified;
  const stale = verified && isVerificationStale(record.lastVerified);
  const label = !verified
    ? t.unverified
    : stale
      ? t.verifyStale
      : fmt(t.verifiedOn, { date: formatDate(record.lastVerified, lang) });
  const tone = verified && !stale ? 'success' : 'warning';
  const body = (
    <View
      style={[
        s.tag,
        {
          backgroundColor: theme[`${tone}Bg`],
          alignSelf: 'flex-start',
          marginTop: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
      ]}
    >
      <Ionicons name={tone === 'success' ? 'shield-checkmark' : 'help-circle'} size={12} color={theme[tone]} />
      <Text style={[s.tagTxt, { color: theme[tone], flexShrink: 1 }]}>
        {label}
        {verified && record.source ? ` · ${t.viewSource} ›` : ''}
      </Text>
    </View>
  );
  if (!verified || !record.source) return body;
  return (
    <TouchableOpacity
      onPress={() => openUrl(record.source)}
      accessibilityRole="link"
      style={{ alignSelf: 'flex-start' }}
    >
      {body}
    </TouchableOpacity>
  );
}

export default function PlanScreen({ loc, setLoc, profile, setActions, onEditProfile }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  // Alerts remember their community (see HomeScreen) so a stale result for
  // the previous community reads as loading.
  const [alertRes, setAlertRes] = useState({ loc: null, data: null });
  const [refreshing, setRefreshing] = useState(false);
  const alerts = alertRes.loc === loc ? alertRes.data : null;

  useEffect(() => {
    fetchNwsAlerts(loc).then((data) => setAlertRes({ loc, data }));
  }, [loc]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete alertCache[loc];
    const data = await fetchNwsAlerts(loc);
    setAlertRes({ loc, data });
    setRefreshing(false);
  }, [loc]);

  const routes = getRoutes(loc, lang);
  const contacts = getContacts(loc, lang);
  const location = findLocation(loc);
  const county = location ? COUNTY_RESOURCES[location.county] : null;
  const hasOfficialRoutes = !!EVAC_ROUTES[loc];
  const hasHousehold = !!(profile.meetingPoint?.trim() || profile.contactName?.trim() || profile.contactPhone?.trim());

  const routeTime = (r) => {
    if (r.flag === 'leaveEarly') return t.leaveEarly;
    if (r.flag === 'inCity') return t.inCity;
    if (r.est == null) return null;
    return r.est >= 60 ? fmt(t.estHr, { n: Math.round(r.est / 6) / 10 }) : fmt(t.estMin, { n: r.est });
  };

  const sharePlan = async () => {
    const routeText = routes
      .map((r) => {
        const time = routeTime(r);
        const shelters = r.shelters
          .map((sh) => `${sh.use === 'animals' ? t.animalShelterLabel : t.shelterLabel}: ${sh.name}, ${sh.address}`)
          .join('\n');
        return `${r.num}. ${r.name}${time ? ` (${time})` : ''}\n${r.desc}${shelters ? `\n${shelters}` : ''}`;
      })
      .join('\n\n');
    const contactText = contacts.map((c) => `${c.name}: ${c.detail}`).join('\n');
    const householdText = hasHousehold
      ? `${t.householdPlan}:\n${t.meetingPoint}: ${profile.meetingPoint?.trim() || t.notSet}\n${t.outOfAreaContact}: ${[profile.contactName, profile.contactPhone].filter((v) => v?.trim()).join(' · ') || t.notSet}\n\n`
      : '';
    const alertText = county ? `\n\n${fmt(t.signUpAlerts, { name: county.alertName })}: ${county.alertUrl}` : '';
    const res = await Share.share({
      message: `${t.shareMsg} ${location?.label}\n\n${householdText}${t.evacRoutes}:\n${routeText}\n\n${t.shelterDisclaimer}\n\n${t.emergencyContacts}:\n${contactText}${alertText}${t.shareFooter}`,
    }).catch(() => null);
    // Android always reports sharedAction; iOS reports dismissedAction if cancelled.
    if (res?.action === Share.sharedAction) setActions((a) => ({ ...a, planSharedAt: Date.now() }));
  };

  // Opens the system print dialog, which also offers "Save as PDF" and
  // sharing on Android and iOS.
  const printPlan = async () => {
    try {
      const html = buildPlanHtml({ t, lang, location, routes, contacts, county, profile, routeTime });
      await Print.printAsync({ html });
    } catch (e) {
      console.warn('Plan PDF failed:', e?.message);
      Alert.alert(t.printPlan, t.printError);
    }
  };

  const levelMeta = [
    { num: 1, tag: t.levelTags[0], action: t.levelActions[0], bg: theme.warningBg, color: theme.warning },
    { num: 2, tag: t.levelTags[1], action: t.levelActions[1], bg: theme.accentBg, color: theme.accentText },
    { num: 3, tag: t.levelTags[2], action: t.levelActions[2], bg: theme.dangerBg, color: theme.danger },
  ];

  const routeBadge = {
    1: { label: t.routeBadges[1], bg: theme.successBg, color: theme.success },
    2: { label: t.routeBadges[2], bg: theme.infoBg, color: theme.info },
    3: { label: t.routeBadges[3], bg: theme.warningBg, color: theme.warning },
  };

  const secLabel = (txt) => (
    <Text style={[s.secLabel, { color: theme.textMid }]} accessibilityRole="header">
      {txt}
    </Text>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} colors={[theme.accent]} />
      }
    >
      <LocPicker value={loc} onChange={setLoc} />

      {location?.note && (
        <View style={[s.disclaimerRow, { backgroundColor: theme.infoBg, borderColor: theme.info }]}>
          <Text style={[s.disclaimerTxt, { color: theme.info }]}>{location.note[lang]}</Text>
        </View>
      )}

      {/* ── Official alerts for this location (evacuations, fire warnings) ─ */}
      {secLabel(t.evacAlertsLabel)}
      <AlertList result={alerts} />

      {/* ── Official county resources ───────────────────────────────────── */}
      {county && (
        <View style={[s.ctaCard, { backgroundColor: theme.darkCard, marginBottom: 0 }]}>
          <Text style={[s.ctaTitle, { color: theme.darkCardText }]} accessibilityRole="header">
            {fmt(t.countyResources, { county: location.county })}
          </Text>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: theme.accent, flexDirection: 'row', gap: 8 }]}
            onPress={() => openUrl(county.alertUrl)}
            accessibilityRole="link"
          >
            <Ionicons name="notifications" size={18} color={theme.onAccent} />
            <Text style={[s.ctaBtnTxt, { color: theme.onAccent, flexShrink: 1 }]}>
              {fmt(t.signUpAlerts, { name: county.alertName })}
            </Text>
          </TouchableOpacity>
          {county.evacMapUrl ? (
            <TouchableOpacity
              style={[
                s.ctaBtn,
                { borderWidth: 1.5, borderColor: theme.accent, marginTop: 10, flexDirection: 'row', gap: 8 },
              ]}
              onPress={() => openUrl(county.evacMapUrl)}
              accessibilityRole="link"
            >
              <Ionicons name="search" size={18} color={theme.darkCardText} />
              <Text style={[s.ctaBtnTxt, { color: theme.darkCardText, flexShrink: 1 }]}>{t.evacLookup}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[s.ctaBody, { color: theme.darkCardSub, marginTop: 10, marginBottom: 0 }]}>
              {t.noEvacLookup}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => openUrl(county.infoUrl)}
            style={{ minHeight: 44, justifyContent: 'center', marginTop: 4 }}
            accessibilityRole="link"
          >
            <Text style={{ color: theme.darkCardSub, fontSize: 13, fontWeight: '600' }}>{t.countyInfo} ›</Text>
          </TouchableOpacity>
          <VerifyTag record={county} />
        </View>
      )}

      {/* ── My household plan ───────────────────────────────────────────── */}
      {secLabel(t.householdPlan)}
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border, padding: 16 }]}>
        {hasHousehold ? (
          <>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Ionicons name="flag" size={18} color={theme.accentText} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textMid }}>{t.meetingPoint}</Text>
                <Text style={{ fontSize: 15, color: theme.text, marginTop: 2 }}>
                  {profile.meetingPoint?.trim() || t.notSet}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 14 }}>
              <Ionicons name="person" size={18} color={theme.accentText} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textMid }}>{t.outOfAreaContact}</Text>
                <Text style={{ fontSize: 15, color: theme.text, marginTop: 2 }}>
                  {[profile.contactName, profile.contactPhone].filter((v) => v?.trim()).join(' · ') || t.notSet}
                </Text>
              </View>
              {!!profile.contactPhone?.trim() && (
                <TouchableOpacity
                  style={[s.callBtn, { backgroundColor: theme.accent }]}
                  onPress={() => call(profile.contactPhone)}
                  accessibilityLabel={fmt(t.callA11y, { name: profile.contactName || profile.contactPhone })}
                >
                  <Text style={[s.callBtnTxt, { color: theme.onAccent }]}>{t.call}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontSize: 13, color: theme.textMid, marginTop: 14 }}>
              {fmt(t.householdCounts, { adults: profile.adults, children: profile.children, pets: profile.pets })}
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: 14, color: theme.textMid, lineHeight: 20 }}>{t.householdEmpty}</Text>
        )}
        <TouchableOpacity
          onPress={onEditProfile}
          style={{ minHeight: 44, justifyContent: 'center', marginTop: 6 }}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.accentText }}>{t.editProfile} ›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Evacuation levels ───────────────────────────────────────────── */}
      {secLabel(t.evacLevelTitle)}
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>
        {levelMeta.map((lv) => (
          <View
            key={lv.num}
            style={[s.levelCard, { backgroundColor: lv.bg, borderColor: lv.color }]}
            accessible
            accessibilityLabel={`${lv.num}. ${lv.tag}. ${lv.action}`}
          >
            <Text style={[s.levelNum, { color: lv.color }]}>{lv.num}</Text>
            <Text style={[s.levelTag, { color: lv.color }]}>{lv.tag}</Text>
            <Text style={[s.levelAction, { color: theme.textMid }]}>{lv.action}</Text>
          </View>
        ))}
      </View>

      {/* ── Evacuation routes ───────────────────────────────────────────── */}
      {secLabel(t.evacRoutes)}
      {!hasOfficialRoutes && (
        <View
          style={[s.disclaimerRow, { backgroundColor: theme.accentBg, borderColor: theme.accentText, marginBottom: 4 }]}
        >
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
            style={[
              s.routeCard,
              {
                backgroundColor: theme.surface,
                borderColor: urgent ? theme.danger : theme.border,
                borderWidth: urgent ? 2 : 1,
              },
            ]}
          >
            {hasOfficialRoutes && (
              <View style={s.routeHead}>
                <View style={[s.tag, { backgroundColor: badge.bg }]}>
                  <Text style={[s.tagTxt, { color: badge.color }]}>{badge.label}</Text>
                </View>
                {time && (
                  <View
                    style={[
                      s.routeTime,
                      {
                        backgroundColor: urgent ? theme.dangerBg : theme.surfaceAlt,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      },
                    ]}
                  >
                    <Ionicons
                      name={urgent ? 'warning' : 'time-outline'}
                      size={12}
                      color={urgent ? theme.danger : theme.textMid}
                    />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: urgent ? theme.danger : theme.textMid }}>
                      {time}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text style={[s.routeName, { color: theme.text }]}>{r.name}</Text>
            <Text style={[s.routeDesc, { color: theme.textMid }]}>{r.desc}</Text>
            {hasOfficialRoutes && <VerifyTag record={r} />}
            {r.shelters.map((sh) => (
              <View
                key={sh.name + sh.use}
                style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.borderLight }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textMid }}>
                  {sh.use === 'animals' ? t.animalShelterLabel : t.shelterLabel}
                </Text>
                <Text style={{ fontSize: 13, color: theme.text, marginTop: 2 }}>
                  {sh.name} · {sh.address}
                </Text>
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
      {secLabel(t.emergencyContacts)}
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {contacts.map((c, i) => (
          <View
            key={c.detail}
            style={[s.contactRow, i < contacts.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }]]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.contactName, { color: theme.text }]}>{c.name}</Text>
              <Text style={[s.contactDetail, { color: theme.textMid }]}>{c.detail}</Text>
              <VerifyTag record={c} />
            </View>
            <TouchableOpacity
              style={[s.callBtn, { backgroundColor: theme.accent }]}
              onPress={() => call(c.detail)}
              accessibilityLabel={fmt(t.callA11y, { name: c.name })}
            >
              <Text style={[s.callBtnTxt, { color: theme.onAccent }]}>{t.call}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ── Share / print ───────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          s.shareScoreBtn,
          { backgroundColor: theme.accent, marginHorizontal: 16, marginTop: 20, flexDirection: 'row', gap: 8 },
        ]}
        onPress={sharePlan}
        accessibilityRole="button"
      >
        <Ionicons name="share-social" size={18} color={theme.onAccent} />
        <Text style={[s.shareScoreBtnTxt, { color: theme.onAccent }]}>{t.sharePlan}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          s.resetBtn,
          { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', gap: 8 },
        ]}
        onPress={printPlan}
        accessibilityRole="button"
      >
        <Ionicons name="print-outline" size={18} color={theme.accentText} />
        <Text style={[s.resetBtnTxt, { color: theme.accentText, fontWeight: '700' }]}>{t.printPlan}</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
