import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode } from '../i18n';
import { findLocation, LOCATIONS } from '../data/locations';
import { fetchAQI, aqiCache } from '../services/aqi';
import { fetchLiveFires, fireCache } from '../services/fires';
import LocPicker from '../components/LocPicker';
import { LoadingCard, LiveStatus } from '../components/StatusLine';

// Guarded require so the screen still renders if the native module is absent
let WebView = null;
try {
  WebView = require('react-native-webview').WebView;
} catch (_) {}

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

  const mapHtml = useMemo(() => {
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attr = isDark
      ? '&copy; OpenStreetMap contributors &copy; CARTO'
      : '&copy; OpenStreetMap contributors';
    const locsJson = JSON.stringify(
      LOCATIONS.map((l) => ({ lat: l.lat, lon: l.lon, label: l.label }))
    );
    const firesJson = JSON.stringify(
      (fires?.fires ?? [])
        .filter((f) => f.lat && f.lon)
        .map((f) => ({ lat: f.lat, lon: f.lon, name: f.name, acres: f.acres }))
    );
    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body{margin:0;padding:0;height:100%;width:100%}#map{height:100%;width:100%}.leaflet-control-attribution{font-size:9px}</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var map=L.map('map',{zoomControl:false}).setView([47.3,-121.5],7);
  L.tileLayer(${JSON.stringify(tileUrl)},{attribution:${JSON.stringify(attr)},maxZoom:19}).addTo(map);
  var locs=${locsJson};
  locs.forEach(function(l){
    L.circleMarker([l.lat,l.lon],{radius:6,fillColor:'#1C6EA4',color:'#fff',weight:2,opacity:1,fillOpacity:1}).addTo(map).bindPopup(l.label);
  });
  var fires=${firesJson};
  fires.forEach(function(f){
    L.circleMarker([f.lat,f.lon],{radius:6,fillColor:'#C0392B',color:'#fff',weight:2,opacity:1,fillOpacity:1}).addTo(map).bindPopup('<b>'+f.name+'</b><br>'+f.acres+' acres');
  });
})();
</script>
</body>
</html>`;
  }, [isDark, fires]);

  return (
    <ScrollView
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      {/* ── Community & fire map ───────────────────────────────────────────── */}
      {WebView != null && (
        <View style={{ height: 220, marginHorizontal: 16, borderRadius: 12, marginTop: 12, overflow: 'hidden' }}>
          <WebView
            source={{ html: mapHtml }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            scrollEnabled={false}
          />
        </View>
      )}
      <View style={[s.credit, { marginTop: 4, marginBottom: 4 }]}>
        <Text style={[s.creditTxt, { color: theme.textLight }]}>Community locations · Live fire data: NIFC/WFIGS · Map: OpenStreetMap</Text>
      </View>

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
          <Text style={{ fontSize:14, color: theme.textMid, lineHeight:20 }}>
            {fires.isLive ? t.noFires : t.firesFetchError}
          </Text>
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
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.acres}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.containment}</Text>
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.contained}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={[s.fstatVal, { color: theme.text }]}>{f.location.split(' ')[0]}</Text>
                  <Text style={[s.fstatKey, { color: theme.textLight }]}>{t.county}</Text>
                </View>
              </View>
              <View style={[s.fireFooter, { borderTopColor: theme.borderLight }]}>
                <Text style={[s.fireFooterTxt, { color: theme.textLight }]}>{t.cause}: {f.cause}</Text>
                <Text style={[s.fireFooterMeta, { color: theme.textLight }]}>{t.updated} {f.updated}</Text>
              </View>
            </View>
          );
        })
      )}
      {fires && (
        <View style={s.credit}><Text style={[s.creditTxt, { color: theme.textLight }]}>{t.nifcCredit}</Text></View>
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
