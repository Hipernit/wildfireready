import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';

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

// Small "● Live · 3:42 PM · Preliminary data" / "Offline data" row.
export function LiveStatus({ isLive, updatedAt, liveLabel, offlineLabel, extra }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 }}>
      <View style={[s.liveDot, { backgroundColor: isLive ? '#2E7D5E' : '#9B948E' }]} />
      <Text style={s.aqiUpdate}>
        {isLive ? `${liveLabel} · ${updatedAt}${extra ? ` · ${extra}` : ''}` : offlineLabel}
      </Text>
    </View>
  );
}
