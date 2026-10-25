import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt, formatUpdated, formatDateTime } from '../i18n';

// Themed loading placeholder card.
export function LoadingCard({ label, height = 100 }) {
  const theme = useTheme();
  return (
    <View
      style={[s.aqiCard, s.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border, minHeight: height }]}
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator color={theme.accent} />
      <Text style={[s.loadingTxt, { color: theme.textMid }]}>{label}</Text>
    </View>
  );
}

// Card shown when a source has no live data and nothing saved (error state).
export function UnavailableCard({ title, msg }) {
  const theme = useTheme();
  return (
    <View style={[s.routeCard, { backgroundColor: theme.surface, borderColor: theme.border }]} accessible>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:4 }}>
        <Ionicons name="cloud-offline-outline" size={18} color={theme.textMid} />
        <Text style={{ fontSize:14, fontWeight:'600', color: theme.text, flex:1 }}>{title}</Text>
      </View>
      <Text style={{ fontSize:13, color: theme.textMid, lineHeight:19 }}>{msg}</Text>
    </View>
  );
}

// Card for a successful response with nothing to show (empty state).
export function EmptyCard({ msg, result }) {
  const theme = useTheme();
  return (
    <View style={[s.routeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={{ fontSize:14, color: theme.textMid, lineHeight:20 }}>{msg}</Text>
      {result && <DataStatus status={result.status} fetchedAt={result.fetchedAt} />}
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

// Banner above saved (offline) data so it is never mistaken for live data.
export function StaleBanner({ fetchedAt }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  return (
    <View
      style={[s.disclaimerRow, { backgroundColor: theme.warningBg, borderColor: theme.warning, marginTop:0, marginBottom:10, flexDirection:'row', gap:8, alignItems:'center' }]}
      accessibilityRole="alert"
    >
      <Ionicons name="time-outline" size={18} color={theme.warning} />
      <Text style={[s.disclaimerTxt, { color: theme.warning, fontWeight:'600', flex:1 }]}>
        {fmt(t.staleBanner, { time: formatDateTime(fetchedAt, lang) })}
      </Text>
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
      <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 }}>
        <Ionicons name="time-outline" size={13} color={theme.warning} />
        <Text style={[s.aqiUpdate, { color: theme.warning, fontWeight:'600', flexShrink:1 }]}>
          {fmt(t.lastUpdated, { time: formatDateTime(fetchedAt, lang) })}
        </Text>
      </View>
    );
  }
  if (status !== 'live') return null;
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 }}>
      <View style={[s.liveDot, { backgroundColor: theme.success }]} />
      <Text style={[s.aqiUpdate, { color: theme.textMid, flexShrink:1 }]}>
        {`${t.live} · ${formatUpdated(fetchedAt, lang)}${extra ? ` · ${extra}` : ''}`}
      </Text>
    </View>
  );
}

// One component for every data-backed section: loading → error/unavailable
// → (stale banner) → empty or content. `result` is a service result with
// { status: 'live'|'cached'|'demo'|'unavailable', fetchedAt }.
export function DataSection({ loading, loadingLabel, loadingHeight, result, unavailableTitle, unavailableMsg, isEmpty, emptyMsg, children }) {
  if (loading || !result) return <LoadingCard label={loadingLabel} height={loadingHeight} />;
  if (result.status === 'unavailable') return <UnavailableCard title={unavailableTitle} msg={unavailableMsg} />;
  return (
    <>
      {result.status === 'cached' && <StaleBanner fetchedAt={result.fetchedAt} />}
      {isEmpty ? <EmptyCard msg={emptyMsg} result={result} /> : children}
    </>
  );
}
