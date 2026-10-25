import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from '../styles';
import { useTheme } from '../theme';
import { useLang, useLangCode, fmt, formatDateTime, formatUpdated } from '../i18n';
import { DataSection } from './StatusLine';

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
    <View style={[s.redFlagBanner, { backgroundColor: bg, borderColor: fg, marginTop: 0, marginBottom: 10 }]}>
      <Ionicons name={isWarning ? 'warning' : 'alert-circle'} size={22} color={fg} />
      <View style={{ flex: 1 }}>
        <Text style={[s.redFlagTitle, { color: fg }]} accessibilityRole="header">
          {alert.event}
        </Text>
        <Text style={[s.redFlagBody, { color: theme.text }]}>{alert.headline}</Text>
        {alert.expires && (
          <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop: 4 }]}>
            {fmt(t.alertUntil, { time: formatDateTime(Date.parse(alert.expires), lang) })} · {alert.sender}
          </Text>
        )}
        {open && (
          <>
            {lang !== 'en' && (
              <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop: 8, fontStyle: 'italic' }]}>
                {t.officialText}
              </Text>
            )}
            <Text style={[s.redFlagBody, { color: theme.textMid, marginTop: 6 }]}>{alert.description}</Text>
            {!!alert.instruction && (
              <Text style={[s.redFlagBody, { color: theme.text, marginTop: 6, fontWeight: '600' }]}>
                {alert.instruction}
              </Text>
            )}
          </>
        )}
        {!!(alert.description || alert.instruction) && (
          <TouchableOpacity
            onPress={() => setOpen((o) => !o)}
            style={{ minHeight: 44, justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{open ? t.hideDetails : t.showDetails}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Official alerts for a location, or the "no alerts" line. `result` is the
// fetchNwsAlerts() shape; null means still loading.
export default function AlertList({ result, emptyBanner = false }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();
  const checked = result?.fetchedAt ? fmt(t.alertsChecked, { time: formatUpdated(result.fetchedAt, lang) }) : '';

  return (
    <View style={{ marginTop: emptyBanner ? 16 : 0 }}>
      <DataSection
        loading={!result}
        loadingLabel={t.loading}
        loadingHeight={60}
        result={result}
        unavailableTitle={t.officialAlerts}
        unavailableMsg={t.alertsUnavailable}
      >
        {result?.alerts?.length > 0 ? (
          <>
            {result.alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
            <Text style={[s.aqiUpdate, { color: theme.textMid, marginHorizontal: 16 }]}>{checked}</Text>
          </>
        ) : emptyBanner ? (
          <View style={[s.banner, { backgroundColor: theme.successBg, borderColor: theme.success, marginTop: 0 }]}>
            <Ionicons name="checkmark-circle" size={22} color={theme.success} />
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: theme.success }]}>{t.banners.ok.title}</Text>
              <Text style={[s.bannerBody, { color: theme.textMid }]}>{t.banners.ok.msg}</Text>
              <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop: 4 }]}>{checked}</Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              s.disclaimerRow,
              { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 0, flexDirection: 'row', gap: 8 },
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.success} />
            <View style={{ flex: 1 }}>
              <Text style={[s.disclaimerTxt, { color: theme.textMid }]}>{t.noOfficialAlerts}</Text>
              <Text style={[s.aqiUpdate, { color: theme.textMid, marginTop: 4 }]}>{checked}</Text>
            </View>
          </View>
        )}
      </DataSection>
    </View>
  );
}
