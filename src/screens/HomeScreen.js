import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt, formatShortDate, formatNumber } from '../i18n';
import { findLocation } from '../data/locations';
import { COUNTY_RESOURCES } from '../data/emergency';
import { fetchAQI, aqiCache } from '../services/aqi';
import { fetchLiveFires, fireCache, withDistance, NEARBY_MILES } from '../services/fires';
import { fetchNwsAlerts, alertCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';
import FireMap from '../components/FireMap';
import { DataSection, DataStatus } from '../components/StatusLine';

const FIRES_SHOWN = 6;

// Fire status → theme tone + icon (status is never shown by color alone).
const FIRE_TONE = { active:'danger', monitoring:'warning', contained:'success', unknown:'textMid' };
const FIRE_ICON = { active:'flame', monitoring:'eye-outline', contained:'checkmark-circle-outline', unknown:'help-circle-outline' };

// Advisory banners are app guidance derived from the AirNow reading, not
// official alerts.
function aqiAdvisory(cat, t, theme) {
  if (cat === 'unhealthy' || cat === 'veryUnhealthy' || cat === 'hazardous') {
    return { bg: theme.dangerBg, tc: theme.danger, title:t.banners.danger.title, msg:t.banners.danger.msg };
  }
  if (cat === 'sensitive') {
    return { bg: theme.warningBg, tc: theme.warning, title:t.banners.warning.title, msg:t.banners.warning.msg };
  }
  return null;
}

export default function HomeScreen({ loc, setLoc, actions, setActions }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  const [aqi, setAqi] = useState(null);
  const [fires, setFires] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [fireLoading, setFireLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const scrollRef = useRef(null);
  const cardY = useRef({});

  // Each source fills in as soon as it answers, so one slow API never holds
  // the others on a spinner.
  const loadAll = useCallback((k) => Promise.all([
    fetchAQI(k).then((d) => { setAqi(d); setAqiLoading(false); }),
    fetchLiveFires().then((d) => { setFires(d); setFireLoading(false); }),
    fetchNwsAlerts(k).then(setAlerts),
  ]), []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete aqiCache[loc]; delete alertCache[loc]; fireCache.ts = 0;
    await loadAll(loc);
    setRefreshing(false);
  }, [loc, loadAll]);

  useEffect(() => {
    setFocusId(null); setAqiLoading(true); setAlerts(null);
    loadAll(loc);
  }, [loc, loadAll]);

  const location = findLocation(loc);
  const county = location ? COUNTY_RESOURCES[location.county] : null;
  const alertsDone = !!location && actions.alertsCounties.includes(location.county);
  const reading = aqi?.reading;
  const advisory = reading && aqi.status !== 'demo' ? aqiAdvisory(reading.cat, t, theme) : null;

  // AQI errors that carry their own message.
  const aqiUnavailable = {
    noKey: [t.aqiNoKey, t.aqiNoKeyMsg],
    badKey: [t.aqiBadKey, t.aqiBadKeyMsg],
    noData: [t.aqiUnavailable, t.aqiNoData],
  }[aqi?.reason] ?? [t.aqiUnavailable, t.aqiUnavailableMsg];

  // Nearest fires to the selected community, with display strings.
  const nearest = useMemo(() => {
    const sorted = withDistance(fires?.fires ?? [], location);
    return sorted.slice(0, FIRES_SHOWN).map((f) => {
      const mi = f.distanceMi != null ? Math.round(f.distanceMi) : null;
      const title = f.name || t.unnamedFire;
      const acres = f.acres != null ? `${formatNumber(f.acres, lang)} ${t.acresWord}` : t.unknown;
      const dist = mi != null ? fmt(t.distanceFrom, { mi, community: location?.label }) : '';
      return { ...f, mi, near: mi != null && mi <= NEARBY_MILES, title, dist, subtitle: [acres, dist].filter(Boolean).join(' · ') };
    });
  }, [fires, location, t, lang]);
  const focusFires = useMemo(() => nearest.slice(0, 3).filter((f) => f.lat != null), [nearest]);

  const scrollToFire = useCallback((id) => {
    const y = cardY.current[id];
    setFocusId(id);
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  }, []);

  const toggleAlertsDone = () => {
    if (!location) return;
    setActions((a) => ({
      ...a,
      alertsCounties: alertsDone ? a.alertsCounties.filter((c) => c !== location.county) : [...a.alertsCounties, location.county],
    }));
  };

  // Fires section: the shared DataSection treats "cached" as stale and an
  // empty live list as the empty state.
  const fireResult = fireLoading ? null : fires;

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} colors={[theme.accent]} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      {/* ── Community & fire map ───────────────────────────────────────────── */}
      <FireMap loc={loc} fires={nearest} focusFires={focusFires} nearMiles={NEARBY_MILES} onSelectFire={scrollToFire} />
      <View style={[s.credit, { marginTop: 4, marginBottom: 0 }]}>
        <Text style={[s.creditTxt, { color: theme.textMid }]}>{t.mapCredit}</Text>
      </View>

      {/* ── Official NWS alerts ─────────────────────────────────────────── */}
      <AlertList result={alerts} emptyBanner />

      {advisory && (
        <View style={[s.banner, { backgroundColor: advisory.bg, borderColor: advisory.tc }]} accessibilityRole="alert">
          <Ionicons name="warning" size={20} color={advisory.tc} />
          <View style={{ flex:1 }}>
            <Text style={[s.bannerTitle, { color: advisory.tc }]}>{advisory.title}</Text>
            <Text style={[s.bannerBody, { color: theme.textMid }]}>{advisory.msg}</Text>
          </View>
        </View>
      )}

      <Text style={[s.secLabel, { color: theme.textMid }]}>{t.airQuality}</Text>
      <DataSection
        loading={aqiLoading}
        loadingLabel={t.fetchingAqi}
        result={reading ? aqi : aqi && { status:'unavailable' }}
        unavailableTitle={aqiUnavailable[0]}
        unavailableMsg={aqiUnavailable[1]}
      >
        {reading && (
          <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View
              style={[s.aqiDial, { borderColor: theme.aqi[reading.cat] }]}
              accessible
              accessibilityRole="image"
              accessibilityLabel={fmt(t.aqiA11y, { aqi: reading.aqi, label: t.aqiLabels[reading.cat] })}
            >
              <Text style={[s.aqiNum, { color: theme.text }]}>{reading.aqi}</Text>
              <Text style={[s.aqiUnit, { color: theme.textMid }]}>{t.aqiUnit}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={[s.aqiStatus, { color: theme.text }]}>{t.aqiLabels[reading.cat]}</Text>
              <Text style={[s.aqiMsg, { color: theme.textMid }]}>{t.aqiMsgs[reading.cat]}</Text>
              <DataStatus status={aqi.status} fetchedAt={aqi.fetchedAt} extra={t.prelimData} />
              {aqi.reason === 'noKey' && <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:4 }]}>{t.aqiNoKey}</Text>}
              {aqi.reason === 'badKey' && <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:4 }]}>{t.aqiBadKey}</Text>}
            </View>
          </View>
        )}
      </DataSection>

      <Text style={[s.secLabel, { color: theme.textMid }]}>{fmt(t.activeFires, { community: location?.label })}</Text>
      <DataSection
        loading={fireLoading}
        loadingLabel={t.fetchingFires}
        loadingHeight={80}
        result={fireResult}
        unavailableTitle={t.firesUnavailable}
        unavailableMsg={t.firesFetchError}
        isEmpty={nearest.length === 0}
        emptyMsg={t.noFires}
      >
        {nearest.map((f) => {
          const sc = theme[FIRE_TONE[f.status]];
          const focused = f.id === focusId;
          const status = t.fireStatus[f.status];
          const acres = f.acres != null ? formatNumber(f.acres, lang) : t.unknown;
          const contained = f.containment != null ? `${f.containment}%` : t.unknown;
          return (
            <View
              key={f.id}
              onLayout={(e) => { cardY.current[f.id] = e.nativeEvent.layout.y; }}
              accessible
              accessibilityLabel={fmt(t.fireA11y, { name: f.title, status, distance: f.dist, acres, contained })}
              style={[s.fireCard, { backgroundColor: theme.surface, borderColor: focused ? theme.accent : f.near ? theme.danger : theme.border, borderWidth: focused || f.near ? 2 : 1 }]}
            >
              <View style={s.fireHead}>
                <View style={{ flex:1 }}>
                  <Text style={[s.fireName, { color: theme.text }]}>{f.title}</Text>
                  {f.mi != null && (
                    <Text style={{ fontSize:13, marginTop:2, color: f.near ? theme.danger : theme.textMid, fontWeight: f.near ? '700' : '500' }}>
                      {f.dist}
                    </Text>
                  )}
                </View>
                <View style={[s.fireBadge, { backgroundColor: theme.surfaceAlt }]}>
                  <Ionicons name={FIRE_ICON[f.status]} size={13} color={sc} />
                  <Text style={[s.fireBadgeTxt, { color: sc }]}>{status}</Text>
                </View>
              </View>
              {f.near && (
                <View style={{ marginHorizontal:14, marginTop:-6, marginBottom:10 }}>
                  <View style={[s.tag, { backgroundColor: theme.dangerBg, alignSelf:'flex-start', flexDirection:'row', alignItems:'center', gap:4 }]}>
                    <Ionicons name="warning" size={12} color={theme.danger} />
                    <Text style={[s.tagTxt, { color: theme.danger }]}>{fmt(t.nearbyBadge, { mi: NEARBY_MILES })}</Text>
                  </View>
                </View>
              )}
              <View style={[s.fireStats, { borderTopColor: theme.borderLight }]}>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{acres}</Text>
                  <Text style={[s.fstatKey, { color: theme.textMid }]}>{t.acres}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{contained}</Text>
                  <Text style={[s.fstatKey, { color: theme.textMid }]}>{t.contained}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.county ?? t.unknown}</Text>
                  <Text style={[s.fstatKey, { color: theme.textMid }]}>{t.county}</Text>
                </View>
              </View>
              <View style={[s.fireFooter, { borderTopColor: theme.borderLight }]}>
                <Text style={[s.fireFooterTxt, { color: theme.textMid }]}>
                  {t.cause}: {f.cause ? (t.fireCauses[f.cause] ?? f.cause) : t.underInvestigation}
                </Text>
                {f.modifiedAt != null && (
                  <Text style={[s.fireFooterMeta, { color: theme.textMid }]}>{t.updated} {formatShortDate(f.modifiedAt, lang)}</Text>
                )}
              </View>
            </View>
          );
        })}
        {fires && (
          <View style={s.credit}>
            <Text style={[s.creditTxt, { color: theme.textMid }]}>
              {fmt(t.nearestOf, { n: nearest.length, total: fires.fires.length })} · {t.nifcCredit}
            </Text>
            <DataStatus status={fires.status} fetchedAt={fires.fetchedAt} />
          </View>
        )}
      </DataSection>

      {/* ── Official alert sign-up ──────────────────────────────────────── */}
      {county && (
        <View style={[s.ctaCard, { backgroundColor: theme.darkCard }]}>
          <Text style={[s.ctaTitle, { color: theme.darkCardText }]}>{t.getAlerts}</Text>
          <Text style={[s.ctaBody, { color: theme.darkCardSub }]}>{fmt(t.alertsBody, { community: location.label, county: location.county })}</Text>
          <TouchableOpacity style={[s.ctaBtn, { backgroundColor: theme.accent }]} onPress={() => Linking.openURL(county.alertUrl).catch(() => {})} accessibilityRole="link">
            <Text style={[s.ctaBtnTxt, { color: theme.onAccent }]}>{fmt(t.signUpAlerts, { name: county.alertName })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleAlertsDone}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: alertsDone }}
            style={[s.ctaBtn, { backgroundColor: alertsDone ? theme.successBg : 'transparent', borderWidth:1.5, borderColor: alertsDone ? theme.success : theme.darkCardMuted, marginTop:10, flexDirection:'row', gap:8 }]}
          >
            <Ionicons name={alertsDone ? 'checkbox' : 'square-outline'} size={20} color={alertsDone ? theme.success : theme.darkCardText} />
            <Text style={[s.ctaBtnTxt, { color: alertsDone ? theme.success : theme.darkCardText, flexShrink:1 }]}>{alertsDone ? t.alertsDone : t.markAlertsDone}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
