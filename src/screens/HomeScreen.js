import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode } from '../i18n';
import { findLocation } from '../data/locations';
import { fetchAQI, aqiCache } from '../services/aqi';
import { fetchLiveFires, fireCache } from '../services/fires';
import LocPicker from '../components/LocPicker';
import { LoadingCard, LiveStatus } from '../components/StatusLine';

// Air-quality banner palette, theme-aware. In dark mode we tint the surface
// with the semantic color instead of using light pastel backgrounds.
function bannerStyle(cat, t, theme, isDark) {
  if (cat === 'unhealthy' || cat === 'hazardous') {
    return { bg: isDark ? 'rgba(192,57,43,0.18)' : '#FDECEA', border: 'rgba(192,57,43,0.25)', icon:'!', title:t.banners.danger.title, tc: isDark ? '#FF6B5E' : '#C0392B', msg:t.banners.danger.msg };
  }
  if (cat === 'sensitive') {
    return { bg: isDark ? 'rgba(192,122,0,0.18)' : '#FFF8E6', border: 'rgba(192,122,0,0.25)', icon:'!', title:t.banners.warning.title, tc: isDark ? '#E0A030' : '#C07A00', msg:t.banners.warning.msg };
  }
  return { bg: isDark ? 'rgba(46,125,94,0.18)' : '#E8F5EE', border: 'rgba(46,125,94,0.25)', icon:'✓', title:t.banners.ok.title, tc: isDark ? '#4FAE84' : '#2E7D5E', msg:t.banners.ok.msg };
}

export default function HomeScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();
  const lang = useLangCode();

  const [aqi, setAqi] = useState(null);
  const [fires, setFires] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [fireLoading, setFireLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (k) => {
    setAqiLoading(true); setFireLoading(true);
    const [aqiData, fireData] = await Promise.all([fetchAQI(k, lang), fetchLiveFires()]);
    setAqi(aqiData); setFires(fireData);
    setAqiLoading(false); setFireLoading(false);
  }, [lang]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete aqiCache[loc]; fireCache.ts = 0;
    const [aqiData, fireData] = await Promise.all([fetchAQI(loc, lang), fetchLiveFires()]);
    setAqi(aqiData); setFires(fireData);
    setRefreshing(false);
  }, [loc, lang]);

  useEffect(() => { loadAll(loc); }, [loc, loadAll]);

  const location = findLocation(loc);
  const banner = aqi ? bannerStyle(aqi.cat, t, theme, isDark) : null;

  return (
    <ScrollView
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      {banner && (
        <View style={[s.banner, { backgroundColor: banner.bg, borderColor: banner.border }]}>
          <Text style={{ fontSize:16, fontWeight:'800', color: banner.tc, lineHeight:22 }}>{banner.icon}</Text>
          <View style={{ flex:1 }}>
            <Text style={[s.bannerTitle, { color: banner.tc }]}>{banner.title}</Text>
            <Text style={[s.bannerBody, { color: theme.textMid }]}>{banner.msg}</Text>
          </View>
        </View>
      )}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.airQuality}</Text>
      {aqiLoading ? (
        <LoadingCard label={t.fetchingAqi} height={100} />
      ) : aqi ? (
        <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[s.aqiDial, { borderColor: aqi.color }]}>
            <Text style={[s.aqiNum, { color: aqi.color }]}>{aqi.aqi}</Text>
            <Text style={[s.aqiUnit, { color: aqi.color }]}>AQI</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[s.aqiStatus, { color: theme.text }]}>{aqi.label}</Text>
            <Text style={[s.aqiMsg, { color: theme.textMid }]}>{aqi.msg}</Text>
            <LiveStatus isLive={aqi.isLive} updatedAt={aqi.updatedAt} liveLabel={t.live} extra={t.prelimData} offlineLabel={t.offlineData} />
          </View>
        </View>
      ) : null}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.activeFires}</Text>
      {fireLoading ? (
        <LoadingCard label={t.fetchingFires} height={80} />
      ) : fires?.fires?.length === 0 ? (
        <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border, padding:16 }]}>
          <Text style={{ fontSize:14, color: theme.textMid, lineHeight:20 }}>{t.noFires}</Text>
          <LiveStatus isLive={fires.isLive} updatedAt={fires.updatedAt} liveLabel={t.live} offlineLabel={t.offlineData} />
        </View>
      ) : (
        fires?.fires?.map((f) => {
          const sc = f.status === 'active' ? '#C0392B' : f.status === 'monitoring' ? '#C07A00' : '#2E7D5E';
          const sl = t.fireStatus[f.status];
          return (
            <View key={f.id} style={[s.fireCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.fireHead}>
                <View style={[s.fireDot, { backgroundColor: sc }]} />
                <Text style={[s.fireName, { color: theme.text }]}>{f.name}</Text>
                <View style={[s.fireBadge, { backgroundColor: sc + '22' }]}>
                  <Text style={[s.fireBadgeTxt, { color: sc }]}>{sl}</Text>
                </View>
              </View>
              <View style={[s.fireStats, { borderTopColor: theme.borderLight }]}>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.acres}</Text>
                  <Text style={s.fstatKey}>{t.acres}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.containment}</Text>
                  <Text style={s.fstatKey}>{t.contained}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.location.split(' ')[0]}</Text>
                  <Text style={s.fstatKey}>{t.county}</Text>
                </View>
              </View>
              <View style={[s.fireFooter, { borderTopColor: theme.borderLight }]}>
                <Text style={s.fireFooterTxt}>{t.cause}: {f.cause}</Text>
                <Text style={s.fireFooterMeta}>{t.updated} {f.updated}</Text>
              </View>
            </View>
          );
        })
      )}
      {fires && (
        <View style={s.credit}><Text style={s.creditTxt}>{t.nifcCredit}</Text></View>
      )}

      <View style={[s.ctaCard, { backgroundColor: theme.darkCard }]}>
        <Text style={s.ctaTitle}>{t.getAlerts}</Text>
        <Text style={s.ctaBody}>{t.alertsBody}</Text>
        <TouchableOpacity style={s.ctaBtn}>
          <Text style={s.ctaBtnTxt}>{t.enableAlerts} {location?.label}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
