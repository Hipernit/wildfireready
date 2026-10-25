import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang, useLangCode, fmt, formatShortDate, formatNumber } from '../i18n';
import { findLocation } from '../data/locations';
import { COUNTY_RESOURCES } from '../data/emergency';
import { fetchAQI, aqiCache } from '../services/aqi';
import { fetchLiveFires, fireCache, withDistance, NEARBY_MILES } from '../services/fires';
import { fetchNwsAlerts, alertCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';
import FireMap from '../components/FireMap';
import { LoadingCard, DataStatus, UnavailableCard } from '../components/StatusLine';

const FIRES_SHOWN = 6;

// AQI category → theme color. Advisory banners are app guidance derived from
// the AirNow reading, not official alerts.
const AQI_TONE = { good:'success', moderate:'warning', sensitive:'accentText', unhealthy:'danger', veryUnhealthy:'danger', hazardous:'danger' };
const FIRE_TONE = { active:'danger', monitoring:'warning', contained:'success', unknown:'textMid' };

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

  const loadAll = useCallback(async (k) => {
    setAqiLoading(true); setAlerts(null);
    const [aqiData, fireData, alertData] = await Promise.all([fetchAQI(k), fetchLiveFires(), fetchNwsAlerts(k)]);
    setAqi(aqiData); setFires(fireData); setAlerts(alertData);
    setAqiLoading(false); setFireLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete aqiCache[loc]; delete alertCache[loc]; fireCache.ts = 0;
    const [aqiData, fireData, alertData] = await Promise.all([fetchAQI(loc), fetchLiveFires(), fetchNwsAlerts(loc)]);
    setAqi(aqiData); setFires(fireData); setAlerts(alertData);
    setRefreshing(false);
  }, [loc]);

  useEffect(() => { setFocusId(null); loadAll(loc); }, [loc, loadAll]);

  const location = findLocation(loc);
  const county = location ? COUNTY_RESOURCES[location.county] : null;
  const alertsDone = !!location && actions.alertsCounties.includes(location.county);
  const reading = aqi?.reading;
  const advisory = reading && aqi.status !== 'demo' ? aqiAdvisory(reading.cat, t, theme) : null;
  const aqiColor = reading ? theme[AQI_TONE[reading.cat]] : theme.textLight;

  // Nearest fires to the selected community, with display strings.
  const nearest = useMemo(() => {
    const sorted = withDistance(fires?.fires ?? [], location);
    return sorted.slice(0, FIRES_SHOWN).map((f) => {
      const mi = f.distanceMi != null ? Math.round(f.distanceMi) : null;
      const title = f.name || t.unnamedFire;
      const acres = f.acres != null ? `${formatNumber(f.acres, lang)} ${t.acresWord}` : t.unknown;
      const dist = mi != null ? fmt(t.distanceFrom, { mi, community: location?.label }) : '';
      return { ...f, mi, near: mi != null && mi <= NEARBY_MILES, title, subtitle: [acres, dist].filter(Boolean).join(' · ') };
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

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      {/* ── Community & fire map ───────────────────────────────────────────── */}
      <FireMap loc={loc} fires={nearest} focusFires={focusFires} nearMiles={NEARBY_MILES} onSelectFire={scrollToFire} />
      <View style={[s.credit, { marginTop: 4, marginBottom: 4 }]}>
        <Text style={[s.creditTxt, { color: theme.textLight }]}>{t.mapCredit}</Text>
      </View>

      {/* ── Official NWS alerts ─────────────────────────────────────────── */}
      <AlertList result={alerts} emptyBanner />

      {advisory && (
        <View style={[s.banner, { backgroundColor: advisory.bg, borderColor: advisory.tc }]}>
          <Text style={{ fontSize:16, fontWeight:'800', color: advisory.tc, lineHeight:22 }}>!</Text>
          <View style={{ flex:1 }}>
            <Text style={[s.bannerTitle, { color: advisory.tc }]}>{advisory.title}</Text>
            <Text style={[s.bannerBody, { color: theme.textMid }]}>{advisory.msg}</Text>
          </View>
        </View>
      )}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.airQuality}</Text>
      {aqiLoading ? (
        <LoadingCard label={t.fetchingAqi} height={100} />
      ) : reading ? (
        <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[s.aqiDial, { borderColor: aqiColor }]}>
            <Text style={[s.aqiNum, { color: aqiColor }]}>{reading.aqi}</Text>
            <Text style={[s.aqiUnit, { color: aqiColor }]}>AQI</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[s.aqiStatus, { color: theme.text }]}>{t.aqiLabels[reading.cat]}</Text>
            <Text style={[s.aqiMsg, { color: theme.textMid }]}>{t.aqiMsgs[reading.cat]}</Text>
            <DataStatus status={aqi.status} fetchedAt={aqi.fetchedAt} extra={t.prelimData} />
            {aqi.reason === 'noKey' && <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:4 }]}>{t.aqiNoKey}</Text>}
            {aqi.reason === 'badKey' && <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:4 }]}>{t.aqiBadKey}</Text>}
          </View>
        </View>
      ) : aqi?.reason === 'noKey' ? (
        <UnavailableCard title={t.aqiNoKey} msg={t.aqiNoKeyMsg} />
      ) : aqi?.reason === 'badKey' ? (
        <UnavailableCard title={t.aqiBadKey} msg={t.aqiBadKeyMsg} />
      ) : aqi?.reason === 'noData' ? (
        <UnavailableCard title={t.aqiUnavailable} msg={t.aqiNoData} />
      ) : (
        <UnavailableCard title={t.aqiUnavailable} msg={t.aqiUnavailableMsg} />
      )}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{fmt(t.activeFires, { community: location?.label })}</Text>
      {fireLoading ? (
        <LoadingCard label={t.fetchingFires} height={80} />
      ) : nearest.length === 0 ? (
        <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border, padding:16, flexDirection:'column', alignItems:'flex-start', gap:0 }]}>
          <Text style={{ fontSize:14, color: theme.textMid, lineHeight:20 }}>
            {fires.status === 'unavailable' ? t.firesFetchError : t.noFires}
          </Text>
          <DataStatus status={fires.status} fetchedAt={fires.fetchedAt} />
        </View>
      ) : (
        nearest.map((f) => {
          const sc = theme[FIRE_TONE[f.status]];
          const focused = f.id === focusId;
          return (
            <View
              key={f.id}
              onLayout={(e) => { cardY.current[f.id] = e.nativeEvent.layout.y; }}
              style={[s.fireCard, { backgroundColor: theme.surface, borderColor: focused ? ACCENT : f.near ? theme.danger : theme.border, borderWidth: focused || f.near ? 2 : 1 }]}
            >
              <View style={s.fireHead}>
                <View style={[s.fireDot, { backgroundColor: sc }]} />
                <View style={{ flex:1 }}>
                  <Text style={[s.fireName, { color: theme.text }]}>{f.title}</Text>
                  {f.mi != null && (
                    <Text style={{ fontSize:12, marginTop:2, color: f.near ? theme.danger : theme.textMid, fontWeight: f.near ? '700' : '500' }}>
                      {fmt(t.distanceFrom, { mi: f.mi, community: location?.label })}
                    </Text>
                  )}
                </View>
                <View style={[s.fireBadge, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[s.fireBadgeTxt, { color: sc }]}>{t.fireStatus[f.status]}</Text>
                </View>
              </View>
              {f.near && (
                <View style={{ marginHorizontal:14, marginTop:-6, marginBottom:10 }}>
                  <View style={[s.tag, { backgroundColor: theme.dangerBg, alignSelf:'flex-start' }]}>
                    <Text style={[s.tagTxt, { color: theme.danger }]}>! {fmt(t.nearbyBadge, { mi: NEARBY_MILES })}</Text>
                  </View>
                </View>
              )}
              <View style={[s.fireStats, { borderTopColor: theme.borderLight }]}>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.acres != null ? formatNumber(f.acres, lang) : t.unknown}</Text>
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.acres}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.containment != null ? `${f.containment}%` : t.unknown}</Text>
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.contained}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.county ?? t.unknown}</Text>
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.county}</Text>
                </View>
              </View>
              <View style={[s.fireFooter, { borderTopColor: theme.borderLight }]}>
                <Text style={[s.fireFooterTxt, { color: theme.textLight }]}>
                  {t.cause}: {f.cause ? (t.fireCauses[f.cause] ?? f.cause) : t.underInvestigation}
                </Text>
                {f.modifiedAt != null && (
                  <Text style={[s.fireFooterMeta, { color: theme.textLight }]}>{t.updated} {formatShortDate(f.modifiedAt, lang)}</Text>
                )}
              </View>
            </View>
          );
        })
      )}
      {fires && nearest.length > 0 && (
        <View style={s.credit}>
          <Text style={[s.creditTxt, { color: theme.textLight }]}>
            {fmt(t.nearestOf, { n: nearest.length, total: fires.fires.length })} · {t.nifcCredit}
          </Text>
          <DataStatus status={fires.status} fetchedAt={fires.fetchedAt} />
        </View>
      )}

      {/* ── Official alert sign-up ──────────────────────────────────────── */}
      {county && (
        <View style={[s.ctaCard, { backgroundColor: theme.darkCard }]}>
          <Text style={s.ctaTitle}>{t.getAlerts}</Text>
          <Text style={s.ctaBody}>{fmt(t.alertsBody, { community: location.label, county: location.county })}</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => Linking.openURL(county.alertUrl).catch(() => {})} accessibilityRole="link">
            <Text style={s.ctaBtnTxt}>{fmt(t.signUpAlerts, { name: county.alertName })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleAlertsDone}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: alertsDone }}
            style={[s.ctaBtn, { backgroundColor: alertsDone ? theme.successBg : 'transparent', borderWidth:1.5, borderColor: alertsDone ? theme.success : theme.darkCardMuted, marginTop:10 }]}
          >
            <Text style={[s.ctaBtnTxt, { color: alertsDone ? theme.success : theme.darkCardText }]}>{alertsDone ? t.alertsDone : t.markAlertsDone}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
