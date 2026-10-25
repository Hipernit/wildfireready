import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt, formatDateTime, formatUpdated } from '../i18n';

// Official NWS products, shown with their own headline/expiry/description.
// Warnings are styled as danger; watches and advisories as warning.
function AlertCard({ alert }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const [open, setOpen] = useState(false);
  const isWarning = /Warning|Evacuation/.test(alert.event);
  const fg = isWarning ? theme.danger : theme.warning;
  const bg = isWarning ? theme.dangerBg : theme.warningBg;
  return (
    <View style={[s.redFlagBanner, { backgroundColor: bg, borderColor: fg, marginTop:10, marginBottom:0 }]}>
      <Text style={{ fontSize:16, fontWeight:'800', color: fg, lineHeight:22 }}>!</Text>
      <View style={{ flex:1 }}>
        <Text style={[s.redFlagTitle, { color: fg }]}>{alert.event}</Text>
        <Text style={[s.redFlagBody, { color: theme.text }]}>{alert.headline}</Text>
        {alert.expires && (
          <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:4 }]}>
            {fmt(t.alertUntil, { time: formatDateTime(Date.parse(alert.expires), lang) })} · {alert.sender}
          </Text>
        )}
        {open && (
          <>
            {lang !== 'en' && <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop:8, fontStyle:'italic' }]}>{t.officialText}</Text>}
            <Text style={[s.redFlagBody, { color: theme.textMid, marginTop:6 }]}>{alert.description}</Text>
            {!!alert.instruction && <Text style={[s.redFlagBody, { color: theme.text, marginTop:6, fontWeight:'600' }]}>{alert.instruction}</Text>}
          </>
        )}
        {!!(alert.description || alert.instruction) && (
          <TouchableOpacity onPress={() => setOpen((o) => !o)} style={{ paddingVertical:6, marginTop:2 }} accessibilityRole="button">
            <Text style={{ fontSize:13, fontWeight:'600', color: fg }}>{open ? t.hideDetails : t.showDetails}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Renders the alert list, or the "no alerts / couldn't check" line. `result`
// is the fetchNwsAlerts() shape; null means still loading.
export default function AlertList({ result, emptyBanner = false }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  if (!result) return null;

  if (result.status === 'unavailable') {
    return (
      <View style={[s.disclaimerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[s.disclaimerTxt, { color: theme.textMid }]}>{t.alertsUnavailable}</Text>
      </View>
    );
  }

  const checked = fmt(t.alertsChecked, { time: formatUpdated(result.fetchedAt, lang) });
  if (result.alerts.length === 0) {
    if (emptyBanner) {
      return (
        <View style={[s.banner, { backgroundColor: theme.successBg, borderColor: theme.success }]}>
          <Text style={{ fontSize:16, fontWeight:'800', color: theme.success, lineHeight:22 }}>✓</Text>
          <View style={{ flex:1 }}>
            <Text style={[s.bannerTitle, { color: theme.success }]}>{t.banners.ok.title}</Text>
            <Text style={[s.bannerBody, { color: theme.textMid }]}>{t.banners.ok.msg}</Text>
            <Text style={[s.aqiUpdate, { color: result.status === 'cached' ? theme.warning : theme.textLight, marginTop:4 }]}>{checked}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={[s.disclaimerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[s.disclaimerTxt, { color: theme.textMid }]}>{t.noOfficialAlerts}</Text>
        <Text style={[s.aqiUpdate, { color: result.status === 'cached' ? theme.warning : theme.textLight, marginTop:4 }]}>{checked}</Text>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal:0 }}>
      {result.alerts.map((a) => <AlertCard key={a.id} alert={a} />)}
      <Text style={[s.aqiUpdate, { color: result.status === 'cached' ? theme.warning : theme.textLight, marginHorizontal:16, marginTop:6 }]}>{checked}</Text>
    </View>
  );
}
