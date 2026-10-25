import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang, useLangCode, fmt, formatUpdated, formatDateTime } from '../i18n';

// Themed loading placeholder card (previously rendered with a hardcoded white
// background, which showed a white card in dark mode).
export function LoadingCard({ label, height = 100 }) {
  const theme = useTheme();
  return (
    <View style={[s.aqiCard, s.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border, height }]}>
      <ActivityIndicator color={ACCENT} />
      <Text style={[s.loadingTxt, { color: theme.textLight }]}>{label}</Text>
    </View>
  );
}

// Card shown when a source has no live data and nothing saved.
export function UnavailableCard({ title, msg }) {
  const theme = useTheme();
  return (
    <View style={[s.routeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:4 }}>
        <View style={[s.liveDot, { backgroundColor: theme.textLight }]} />
        <Text style={{ fontSize:14, fontWeight:'600', color: theme.text, flex:1 }}>{title}</Text>
      </View>
      <Text style={{ fontSize:13, color: theme.textMid, lineHeight:19 }}>{msg}</Text>
    </View>
  );
}

// Prominent label for sample data (DEMO_MODE only).
export function DemoBadge() {
  const theme = useTheme();
  const t = useLang();
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:8 }}>
      <View style={[s.tag, { backgroundColor: theme.danger }]}>
        <Text style={[s.tagTxt, { color: theme.onAccent, fontSize:12, fontWeight:'800', letterSpacing:1 }]}>{t.demoBadge}</Text>
      </View>
      <Text style={{ flex:1, fontSize:12, fontWeight:'600', color: theme.danger }}>{t.demoNote}</Text>
    </View>
  );
}

// Freshness row for a fetched result: "● Live · 3:42 PM", "Last updated Oct 24,
// 3:42 PM" for saved data, or the DEMO badge.
export function DataStatus({ status, fetchedAt, extra }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  if (status === 'demo') return <DemoBadge />;
  if (status === 'cached') {
    return (
      <View style={{ marginTop:6 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
          <View style={[s.liveDot, { backgroundColor: theme.warning }]} />
          <Text style={[s.aqiUpdate, { color: theme.warning, fontWeight:'600' }]}>
            {fmt(t.lastUpdated, { time: formatDateTime(fetchedAt, lang) })}
          </Text>
        </View>
        <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:2 }]}>{t.savedData}</Text>
      </View>
    );
  }
  if (status !== 'live') return null;
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 }}>
      <View style={[s.liveDot, { backgroundColor: theme.success }]} />
      <Text style={[s.aqiUpdate, { color: theme.textLight }]}>
        {`${t.live} · ${formatUpdated(fetchedAt, lang)}${extra ? ` · ${extra}` : ''}`}
      </Text>
    </View>
  );
}
