import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode, translateDayName, translateForecast } from '../i18n';
import { fetchFireWeather, wxCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import { LoadingCard } from '../components/StatusLine';

export default function WeatherScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();
  const lang = useLangCode();

  const [wx, setWx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (k) => {
    setLoading(true); setWx(await fetchFireWeather(k)); setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true); delete wxCache[loc]; setWx(await fetchFireWeather(loc)); setRefreshing(false);
  }, [loc]);

  useEffect(() => { load(loc); }, [loc, load]);

  const anyRedFlag = wx?.periods?.some((p) => p.redFlag);
  const redFlagBg = isDark ? 'rgba(123,0,0,0.25)' : '#FEF2F2';
  const redFlagColor = isDark ? '#FF8A80' : '#7B0000';

  return (
    <ScrollView
      style={{ flex:1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={ACCENT} />}
    >
      <LocPicker value={loc} onChange={setLoc} />

      {anyRedFlag && (
        <View style={[s.redFlagBanner, { backgroundColor: redFlagBg, borderColor: 'rgba(123,0,0,0.2)' }]}>
          <Text style={{ fontSize:14, fontWeight:'800', color: redFlagColor }}>!</Text>
          <View style={{ flex:1 }}>
            <Text style={[s.redFlagTitle, { color: redFlagColor }]}>{t.redFlagWarning}</Text>
            <Text style={[s.redFlagBody, { color: theme.textMid }]}>{t.redFlagDesc}</Text>
          </View>
        </View>
      )}

      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.fireWeather}</Text>
      {loading ? (
        <LoadingCard label={t.fetchingWeather} height={100} />
      ) : wx ? (
        <>
          {wx.periods.map((p, i) => (
            <View key={i} style={[s.wxCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.wxTop}>
                <View style={{ flex:1 }}>
                  <Text style={[s.wxDay, { color: theme.text }]}>{translateDayName(p.name, lang)}</Text>
                  <Text style={[s.wxFcast, { color: theme.textLight }]}>{translateForecast(p.forecast, lang)}</Text>
                </View>
                <View style={[s.dangerBadge, { backgroundColor: p.fireDanger.bg }]}>
                  <Text style={[s.dangerDot, { color: p.fireDanger.color }]}>{p.fireDanger.dot}</Text>
                  <Text style={[s.dangerTxt, { color: p.fireDanger.color }]}>{t.dangerLevels[p.fireDanger.level] || p.fireDanger.level}</Text>
                </View>
              </View>
              <View style={[s.wxStats, { borderTopColor: theme.borderLight }]}>
                <View style={s.wxStat}>
                  <Text style={[s.wxStatVal, { color: theme.text }]}>{p.temp}°F</Text>
                  <Text style={s.wxStatKey}>{t.temp}</Text>
                </View>
                <View style={s.wxStat}>
                  <Text style={[s.wxStatVal, { color: theme.text }]}>{p.wind}</Text>
                  <Text style={s.wxStatKey}>{t.wind}</Text>
                </View>
                <View style={[s.wxStat, { flex:2 }]}>
                  <Text style={[s.wxStatVal, { color: theme.text }]} numberOfLines={1}>{translateForecast(p.forecast, lang)}</Text>
                  <Text style={s.wxStatKey}>{t.conditions}</Text>
                </View>
              </View>
              {p.redFlag && (
                <View style={[s.redFlagRow, { borderTopColor: theme.borderLight, backgroundColor: redFlagBg }]}>
                  <Text style={[s.redFlagRowTxt, { color: redFlagColor }]}>{t.redFlagWarning}</Text>
                </View>
              )}
            </View>
          ))}
          <View style={[s.wxCredit, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={s.wxCreditTxt}>{t.nwsCredit} · {wx.updatedAt}</Text>
            <Text style={[s.wxCreditTxt, { marginTop:4 }]}>{t.weatherNote}</Text>
          </View>
        </>
      ) : null}
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
