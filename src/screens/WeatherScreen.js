import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode, translateDayName, translateForecast } from '../i18n';
import { fetchFireWeather, wxCache, fetchNwsAlerts, alertCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';
import { LoadingCard, DataStatus, UnavailableCard } from '../components/StatusLine';

const DANGER_DARK_BG = {
  Extreme: 'rgba(123,0,0,0.25)',   High:    'rgba(192,57,43,0.2)',
  Moderate:'rgba(192,122,0,0.2)',  Low:     'rgba(46,125,94,0.2)',
  Minimal: 'rgba(28,110,164,0.2)',
};

export default function WeatherScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();
  const lang = useLangCode();

  const [wx, setWx] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (k) => {
    setLoading(true); setAlerts(null);
    const [w, a] = await Promise.all([fetchFireWeather(k), fetchNwsAlerts(k)]);
    setWx(w); setAlerts(a); setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete wxCache[loc]; delete alertCache[loc];
    const [w, a] = await Promise.all([fetchFireWeather(loc), fetchNwsAlerts(loc)]);
    setWx(w); setAlerts(a); setRefreshing(false);
  }, [loc]);

  useEffect(() => { load(loc); }, [loc, load]);

  const periods = wx?.periods ?? [];
  const anyRHMissing = periods.some((p) => p.risk.rhMissing);

  return (
    <ScrollView
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.officialAlerts}</Text>
      <AlertList result={alerts} />

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.fireWeather}</Text>
      {loading ? (
        <LoadingCard label={t.fetchingWeather} height={100} />
      ) : periods.length === 0 ? (
        <UnavailableCard title={t.wxUnavailable} msg={t.wxUnavailableMsg} />
      ) : (
        <>
          {periods.map((p, i) => (
            <View key={i} style={[s.wxCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.wxTop}>
                <View style={{ flex:1 }}>
                  <Text style={[s.wxDay, { color: theme.text }]}>{translateDayName(p.name, lang)}</Text>
                  <Text style={[s.wxFcast, { color: theme.textLight }]}>{translateForecast(p.forecast, lang)}</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <View style={[s.dangerBadge, { backgroundColor: isDark ? (DANGER_DARK_BG[p.risk.level] ?? DANGER_DARK_BG.Moderate) : p.risk.bg }]}>
                    <Text style={[s.dangerDot, { color: p.risk.color }]}>{p.risk.dot}</Text>
                    <Text style={[s.dangerTxt, { color: p.risk.color }]}>{t.dangerLevels[p.risk.level]}</Text>
                  </View>
                  <Text style={[s.wxStatKey, { color: theme.textLight, marginTop:3 }]}>{t.fireRiskEstimate}</Text>
                </View>
              </View>
              <View style={[s.wxStats, { borderTopColor: theme.borderLight }]}>
                <View style={s.wxStat}>
                  <Text style={[s.wxStatVal, { color: theme.text }]}>{p.temp}°F</Text>
                  <Text style={[s.wxStatKey, { color: theme.textLight }]}>{t.temp}</Text>
                </View>
                <View style={s.wxStat}>
                  <Text style={[s.wxStatVal, { color: theme.text }]}>{p.wind}</Text>
                  <Text style={[s.wxStatKey, { color: theme.textLight }]}>{t.wind}</Text>
                </View>
                <View style={[s.wxStat, { flex:2 }]}>
                  <Text style={[s.wxStatVal, { color: theme.text }]} numberOfLines={1}>{translateForecast(p.forecast, lang)}</Text>
                  <Text style={[s.wxStatKey, { color: theme.textLight }]}>{t.conditions}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={[s.wxCredit, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[s.wxCreditTxt, { color: theme.textLight }]}>{t.nwsCredit}</Text>
            <Text style={[s.wxCreditTxt, { marginTop:4, color: theme.textMid }]}>{t.weatherNote}</Text>
            {anyRHMissing && <Text style={[s.wxCreditTxt, { marginTop:4, color: theme.textMid }]}>{t.weatherNoteNoRH}</Text>}
            <DataStatus status={wx.status} fetchedAt={wx.fetchedAt} />
          </View>
        </>
      )}
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
