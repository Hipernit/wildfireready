import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode } from '../i18n';
import { getRoutes, CONTACTS } from '../data/emergency';
import { findLocation } from '../data/locations';
import LocPicker from '../components/LocPicker';

export default function PlanScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();
  const lang = useLangCode();

  const routes = getRoutes(loc, lang);
  const location = findLocation(loc);

  const sharePlan = async () => {
    const routeText = routes.map((r) => `${r.num}. ${r.name} (${r.time})\n${r.desc}`).join('\n\n');
    const contactText = CONTACTS.map((c) => `${c.name[lang]}: ${c.detail}`).join('\n');
    await Share.share({
      message: `${t.shareMsg} ${location?.label}\n\n${t.evacRoutes}:\n${routeText}\n\n${t.emergencyContacts}:\n${contactText}${t.shareFooter}`,
    });
  };

  const call = (number) => {
    Linking.openURL(`tel:${number.replace(/[^0-9+]/g, '')}`).catch(() => {});
  };

  const levelMeta = [
    {
      num: 1, tag: t.levelTags[0], action: t.levelActions[0],
      bg:     isDark ? 'rgba(192,122,0,0.15)' : '#FFF8E6',
      border: isDark ? 'rgba(192,122,0,0.35)' : '#E8C97A',
      color:  isDark ? '#E0A030' : '#C07A00',
    },
    {
      num: 2, tag: t.levelTags[1], action: t.levelActions[1],
      bg:     isDark ? 'rgba(232,69,10,0.15)' : '#FEF0E7',
      border: isDark ? 'rgba(232,69,10,0.35)' : '#F0A070',
      color:  isDark ? '#FF7A50' : '#E8450A',
    },
    {
      num: 3, tag: t.levelTags[2], action: t.levelActions[2],
      bg:     isDark ? 'rgba(192,57,43,0.18)' : '#FDECEA',
      border: isDark ? 'rgba(192,57,43,0.40)' : '#E8A09A',
      color:  isDark ? '#FF6B5E' : '#C0392B',
    },
  ];

  const routeBadge = {
    1: { label: lang === 'es' ? 'Principal'   : 'Primary',
         bg: isDark ? 'rgba(46,125,94,0.2)'   : '#E8F5EE', color: isDark ? '#4FAE84' : '#2E7D5E' },
    2: { label: lang === 'es' ? 'Alternativa' : 'Alternate',
         bg: isDark ? 'rgba(28,110,164,0.2)'  : '#EBF4FB', color: isDark ? '#5AABDE' : '#1C6EA4' },
    3: { label: lang === 'es' ? 'Última opción' : 'Last option',
         bg: isDark ? 'rgba(192,122,0,0.2)'   : '#FFF8E6', color: isDark ? '#E0A030' : '#C07A00' },
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <LocPicker value={loc} onChange={setLoc} />

      {/* ── Evacuation levels ───────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.evacLevelTitle}</Text>
      <View style={{ flexDirection:'row', gap:8, marginHorizontal:16 }}>
        {levelMeta.map((lv) => (
          <View key={lv.num} style={[s.levelCard, { backgroundColor: lv.bg, borderColor: lv.border }]}>
            <Text style={[s.levelNum, { color: lv.color }]}>{lv.num}</Text>
            <Text style={[s.levelTag, { color: lv.color }]}>{lv.tag}</Text>
            <Text style={[s.levelAction, { color: theme.textMid }]}>{lv.action}</Text>
          </View>
        ))}
      </View>

      {/* ── Evacuation routes ───────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.evacRoutes}</Text>
      {routes.map((r) => {
        const badge = routeBadge[r.num] ?? routeBadge[2];
        const urgent = r.time === 'LEAVE EARLY';
        return (
          <View
            key={r.num}
            style={[
              s.routeCard,
              { backgroundColor: theme.surface, borderColor: urgent ? (isDark ? 'rgba(192,57,43,0.6)' : '#E8A09A') : theme.border },
            ]}
          >
            <View style={s.routeHead}>
              <View style={[s.tag, { backgroundColor: badge.bg }]}>
                <Text style={[s.tagTxt, { color: badge.color }]}>{badge.label}</Text>
              </View>
              <Text style={[
                s.routeTime,
                { backgroundColor: urgent ? (isDark ? 'rgba(192,57,43,0.2)' : '#FDECEA') : theme.surfaceAlt,
                  color: urgent ? (isDark ? '#FF6B5E' : '#C0392B') : theme.textLight }
              ]}>
                {r.time}
              </Text>
            </View>
            <Text style={[s.routeName, { color: theme.text }]}>{r.name}</Text>
            <Text style={[s.routeDesc, { color: theme.textMid }]}>{r.desc}</Text>
          </View>
        );
      })}

      {/* ── Emergency contacts ──────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.emergencyContacts}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {CONTACTS.map((c, i) => (
          <View
            key={i}
            style={[
              s.contactRow,
              i < CONTACTS.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }],
            ]}
          >
            <View style={{ flex:1 }}>
              <Text style={[s.contactName, { color: theme.text }]}>{c.name[lang]}</Text>
              <Text style={[s.contactDetail, { color: theme.textLight }]}>{c.detail}</Text>
            </View>
            <TouchableOpacity
              style={[s.callBtn, { backgroundColor: ACCENT }]}
              onPress={() => call(c.detail)}
              accessibilityLabel={`Call ${c.name[lang]}`}
            >
              <Text style={s.callBtnTxt}>{t.call}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ── Share ───────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.shareScoreBtn, { marginHorizontal:16, marginTop:20 }]}
        onPress={sharePlan}
      >
        <Text style={s.shareScoreBtnTxt}>{t.sharePlan}</Text>
      </TouchableOpacity>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
