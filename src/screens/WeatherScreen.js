import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme, RISK_TONE } from '../theme';
import { useLang, useLangCode, translateDayName, translateForecast, translateWind } from '../i18n';
import { fetchFireWeather, wxCache, fetchNwsAlerts, alertCache } from '../services/weather';
import LocPicker from '../components/LocPicker';
import AlertList from '../components/AlertList';
import { DataSection, DataStatus } from '../components/StatusLine';

// Risk level icon so the level is never conveyed by color alone.
const RISK_ICON = {
  Extreme: 'flame',
  High: 'flame',
  Moderate: 'flame-outline',
  Low: 'leaf-outline',
  Minimal: 'leaf-outline',
};

function Stat({ value, label }) {
  const theme = useTheme();
  return (
    <View style={s.wxStat}>
      <Text style={[s.wxStatVal, { color: theme.text }]}>{value}</Text>
      <Text style={[s.wxStatKey, { color: theme.textMid }]}>{label}</Text>
    </View>
  );
}

export default function WeatherScreen({ loc, setLoc }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  // Results remember their community, so switching communities shows the
  // loading state without resetting state inside the effect.
  const [wxRes, setWxRes] = useState({ loc: null, data: null });
  const [alertRes, setAlertRes] = useState({ loc: null, data: null });
  const [refreshing, setRefreshing] = useState(false);

  const loading = wxRes.loc !== loc;
  const wx = loading ? null : wxRes.data;
  const alerts = alertRes.loc === loc ? alertRes.data : null;

  const load = useCallback(
    (k) =>
      Promise.all([
        fetchFireWeather(k).then((data) => setWxRes({ loc: k, data })),
        fetchNwsAlerts(k).then((data) => setAlertRes({ loc: k, data })),
      ]),
    [],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    delete wxCache[loc];
    delete alertCache[loc];
    await load(loc);
    setRefreshing(false);
  }, [loc, load]);

  useEffect(() => {
    load(loc);
  }, [loc, load]);

  const periods = wx?.periods ?? [];
  const anyRHMissing = periods.some((p) => p.risk.rhMissing);
  const dash = t.noValue;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} colors={[theme.accent]} />
      }
    >
      <LocPicker value={loc} onChange={setLoc} />

      <Text style={[s.secLabel, { color: theme.textMid }]}>{t.officialAlerts}</Text>
      <AlertList result={alerts} />

      <Text style={[s.secLabel, { color: theme.textMid }]}>{t.fireWeather}</Text>
      <DataSection
        loading={loading}
        loadingLabel={t.fetchingWeather}
        result={wx}
        unavailableTitle={t.wxUnavailable}
        unavailableMsg={t.wxUnavailableMsg}
        isEmpty={periods.length === 0}
        emptyMsg={t.wxUnavailableMsg}
      >
        {periods.map((p, i) => {
          const tone = RISK_TONE[p.risk.level];
          const level = t.dangerLevels[p.risk.level];
          const wind = [p.windDir, p.wind].filter(Boolean).join(' ');
          return (
            <View key={i} style={[s.wxCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.wxTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.wxDay, { color: theme.text }]}>{translateDayName(p.name, lang)}</Text>
                  <Text style={[s.wxFcast, { color: theme.textMid }]}>{translateForecast(p.forecast, lang)}</Text>
                </View>
                <View
                  style={{ alignItems: 'flex-end', flexShrink: 0 }}
                  accessible
                  accessibilityLabel={`${t.fireRiskEstimate}: ${level}`}
                >
                  <View style={[s.dangerBadge, { backgroundColor: theme[`${tone}Bg`] }]}>
                    <Ionicons name={RISK_ICON[p.risk.level]} size={13} color={theme[tone]} />
                    <Text style={[s.dangerTxt, { color: theme[tone] }]}>{level}</Text>
                  </View>
                  <Text style={[s.wxStatKey, { color: theme.textMid, marginTop: 3 }]}>{t.fireRiskEstimate}</Text>
                </View>
              </View>
              <View style={[s.wxStats, { borderTopColor: theme.borderLight }]}>
                <Stat value={`${p.temp}°F`} label={t.temp} />
                <Stat value={p.minRH != null ? `${p.minRH}%` : dash} label={t.humidity} />
                <Stat value={translateWind(wind, lang) || dash} label={t.wind} />
                <Stat value={p.gustMph != null ? `${p.gustMph} mph` : dash} label={t.gusts} />
              </View>
            </View>
          );
        })}
        <View style={[s.wxCredit, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.wxCreditTxt, { color: theme.textMid }]}>{t.nwsCredit}</Text>
          <Text style={[s.wxCreditTxt, { marginTop: 4, color: theme.textMid }]}>{t.weatherNote}</Text>
          {anyRHMissing && (
            <Text style={[s.wxCreditTxt, { marginTop: 4, color: theme.textMid }]}>{t.weatherNoteNoRH}</Text>
          )}
          {wx && <DataStatus status={wx.status} fetchedAt={wx.fetchedAt} />}
        </View>
      </DataSection>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
