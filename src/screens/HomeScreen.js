import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang } from '../i18n';
import { findLocation, LOCATIONS } from '../data/locations';
import { fetchAQI, aqiCache } from '../services/aqi';
import { fetchLiveFires, fireCache } from '../services/fires';
import { fetchNwsAlerts, alertCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';
import { LoadingCard, DataStatus, UnavailableCard } from '../components/StatusLine';

// Guarded require so the screen still renders if the native module is absent
let WebView = null;
try {
  WebView = require('react-native-webview').WebView;
} catch (_) {}

// AQI category → theme color. Advisory banners are app guidance derived from
// the AirNow reading, not official alerts.
const AQI_TONE = { good:'success', moderate:'warning', sensitive:'accentText', unhealthy:'danger', veryUnhealthy:'danger', hazardous:'danger' };

function aqiAdvisory(cat, t, theme) {
  if (cat === 'unhealthy' || cat === 'veryUnhealthy' || cat === 'hazardous') {
    return { bg: theme.dangerBg, tc: theme.danger, title:t.banners.danger.title, msg:t.banners.danger.msg };
  }
  if (cat === 'sensitive') {
    return { bg: theme.warningBg, tc: theme.warning, title:t.banners.warning.title, msg:t.banners.warning.msg };
  }
  return null;
}

export default function HomeScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();

  const [aqi, setAqi] = useState(null);
  const [fires, setFires] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [fireLoading, setFireLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (k) => {
    setAqiLoading(true); setFireLoading(true); setAlerts(null);
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

  useEffect(() => { loadAll(loc); }, [loc, loadAll]);

  const location = findLocation(loc);
  const reading = aqi?.reading;
  const advisory = reading && aqi.status !== 'demo' ? aqiAdvisory(reading.cat, t, theme) : null;
  const aqiColor = reading ? theme[AQI_TONE[reading.cat]] : theme.textLight;

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

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.activeFires}</Text>
      {fireLoading ? (
        <LoadingCard label={t.fetchingFires} height={80} />
      ) : fires?.fires?.length === 0 ? (
        <View style={[s.aqiCard, { backgroundColor: theme.surface, borderColor: theme.border, padding:16 }]}>
          <Text style={{ fontSize:14, color: theme.textMid, lineHeight:20 }}>
            {fires.status === 'live' ? t.noFires : t.firesFetchError}
          </Text>
          <DataStatus status={fires.status} fetchedAt={fires.fetchedAt} />
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
