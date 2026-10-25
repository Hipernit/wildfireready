import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { s } from '../styles';
import { useTheme, useIsDark, ACCENT } from '../theme';
import { useLang, useLangCode } from '../i18n';
import { getRoutes, getContacts, SHELTER_DISCLAIMER, EVAC_ROUTES } from '../data/emergency';
import { findLocation } from '../data/locations';
import LocPicker from '../components/LocPicker';

export default function PlanScreen({ loc, setLoc }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const t = useLang();
  const lang = useLangCode();

  const routes = getRoutes(loc, lang);
  const contacts = getContacts(loc, lang);
  const location = findLocation(loc);
  const hasOfficialRoutes = !!EVAC_ROUTES[loc];

  const [liveRoutes, setLiveRoutes] = useState(null); // null = loading, [] = empty, [...] = features
  const [liveError, setLiveError] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const url =
      'https://services.arcgis.com/hn7l5M5rFpMhKGf0/arcgis/rest/services/EvacuationRoutes_public/FeatureServer/0/query?where=1%3D1&outFields=*&f=json';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLiveRoutes(Array.isArray(data.features) ? data.features : []);
        setLastChecked(new Date());
      })
      .catch(() => {
        setLiveError(true);
        setLastChecked(new Date());
      });
  }, []);

  const fmtTime = (d) =>
    d
      ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
      : '';

  const getAttr = (attrs, ...keys) => {
    for (const k of keys) if (attrs[k]) return String(attrs[k]);
    return null;
  };

  const sharePlan = async () => {
    const routeText = routes.map((r) => `${r.num}. ${r.name} (${r.time})\n${r.desc}`).join('\n\n');
    const contactText = contacts.map((c) => `${c.name}: ${c.detail}`).join('\n');
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

  const displayTime = (time) => {
    if (lang !== 'es') return time;
    if (time === 'LEAVE EARLY') return 'SALIR TEMPRANO';
    if (time === 'In city') return 'En la ciudad';
    return time.replace(/^Est\./, 'Aprox.');
  };

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

      {location?.note && (
        <View style={[s.disclaimerRow, { backgroundColor: isDark ? 'rgba(28,110,164,0.12)' : '#EBF4FB', borderColor: isDark ? 'rgba(28,110,164,0.3)' : '#BDDDF0' }]}>
          <Text style={[s.disclaimerTxt, { color: isDark ? '#5AABDE' : '#1C6EA4' }]}>{location.note}</Text>
        </View>
      )}

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

      {/* ── Live evacuation routes (King County OEM) ────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>Live Evacuation Routes</Text>

      {/* Loading */}
      {liveRoutes === null && !liveError && (
        <View style={[s.routeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={{ fontSize: 13, color: theme.textLight }}>Checking King County OEM…</Text>
        </View>
      )}

      {/* Fetch error / offline */}
      {liveError && (
        <View style={[s.routeCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(155,148,142,0.25)' : '#DDD9D4' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#9B948E' }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>Live routes unavailable</Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textMid, lineHeight: 17 }}>
            Could not reach King County OEM. Check your connection — hardcoded routes below are still valid.
          </Text>
          {lastChecked && (
            <Text style={{ fontSize: 11, color: theme.textLight, marginTop: 6 }}>
              Last attempted: {fmtTime(lastChecked)}
            </Text>
          )}
        </View>
      )}

      {/* No active evacuations */}
      {liveRoutes !== null && liveRoutes.length === 0 && !liveError && (
        <View style={[
          s.routeCard,
          {
            backgroundColor: theme.surface,
            borderColor: isDark ? 'rgba(46,125,94,0.4)' : '#A8D5BB',
            borderWidth: 1.5,
          },
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D5E' }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text, flex: 1 }}>
              No active evacuation orders in King County
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textMid, lineHeight: 17, marginBottom: 8 }}>
            This section updates automatically when King County OEM issues evacuation routes.
          </Text>
          {lastChecked && (
            <Text style={{ fontSize: 11, color: theme.textLight }}>
              Last checked: {fmtTime(lastChecked)}
            </Text>
          )}
        </View>
      )}

      {/* Active live route cards */}
      {liveRoutes !== null && liveRoutes.length > 0 && liveRoutes.map((f, i) => {
        const a = f.attributes ?? {};
        const name = getAttr(a, 'ZONE_NAME', 'NAME', 'EVAC_ZONE_NAME', 'EVAC_ZONE', 'Route_Name') ?? `Route ${i + 1}`;
        const level = getAttr(a, 'EVAC_LEVEL', 'LEVEL', 'Level', 'LEVEL_NAME');
        const status = getAttr(a, 'STATUS', 'Status', 'EVAC_STATUS');
        const desc = getAttr(a, 'DESCRIPTION', 'Description', 'DIRECTIONS', 'Directions');
        const levelColor = level === '3' || level?.includes('3')
          ? (isDark ? '#FF6B5E' : '#C0392B')
          : level === '2' || level?.includes('2')
          ? (isDark ? '#FF7A50' : '#E8450A')
          : (isDark ? '#4FAE84' : '#2E7D5E');
        return (
          <View
            key={a.OBJECTID ?? i}
            style={[s.routeCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(232,69,10,0.45)' : '#F0A070', borderWidth: 1.5 }]}
          >
            <View style={s.routeHead}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8450A' }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#FF7A50' : '#E8450A', letterSpacing: 0.5 }}>
                  ACTIVE
                </Text>
              </View>
              {level && (
                <View style={[s.tag, { backgroundColor: isDark ? 'rgba(232,69,10,0.15)' : '#FEF0E7' }]}>
                  <Text style={[s.tagTxt, { color: levelColor }]}>Level {level}</Text>
                </View>
              )}
            </View>
            <Text style={[s.routeName, { color: theme.text }]}>{name}</Text>
            {status && <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#FF7A50' : '#E8450A', marginBottom: 4 }}>{status}</Text>}
            {desc && <Text style={[s.routeDesc, { color: theme.textMid }]}>{desc}</Text>}
          </View>
        );
      })}

      {/* Data source credit */}
      {!liveError && (
        <View style={[s.credit, { marginTop: 0, marginBottom: 8 }]}>
          <Text style={[s.creditTxt, { color: theme.textLight }]}>
            Live routes: King County Office of Emergency Management · ArcGIS
          </Text>
        </View>
      )}

      {/* ── Evacuation routes ───────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.evacRoutes}</Text>
      {!hasOfficialRoutes && (
        <View style={[s.disclaimerRow, { backgroundColor: isDark ? 'rgba(232,69,10,0.1)' : '#FEF0E7', borderColor: isDark ? 'rgba(232,69,10,0.3)' : '#F0A070', marginBottom:4 }]}>
          <Text style={[s.disclaimerTxt, { color: isDark ? '#FF7A50' : '#E8450A' }]}>{t.genericRoutesNote}</Text>
        </View>
      )}
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
            {hasOfficialRoutes && (
              <View style={s.routeHead}>
                <View style={[s.tag, { backgroundColor: badge.bg }]}>
                  <Text style={[s.tagTxt, { color: badge.color }]}>{badge.label}</Text>
                </View>
                <Text style={[
                  s.routeTime,
                  { backgroundColor: urgent ? (isDark ? 'rgba(192,57,43,0.2)' : '#FDECEA') : theme.surfaceAlt,
                    color: urgent ? (isDark ? '#FF6B5E' : '#C0392B') : theme.textLight }
                ]}>
                  {displayTime(r.time)}
                </Text>
              </View>
            )}
            <Text style={[s.routeName, { color: theme.text }]}>{r.name}</Text>
            <Text style={[s.routeDesc, { color: theme.textMid }]}>{r.desc}</Text>
          </View>
        );
      })}

      {hasOfficialRoutes && (
        <View style={[s.disclaimerRow, { backgroundColor: isDark ? 'rgba(155,148,142,0.1)' : '#F7F5F2', borderColor: isDark ? 'rgba(155,148,142,0.25)' : '#DDD9D4' }]}>
          <Text style={[s.disclaimerTxt, { color: theme.textLight }]}>{SHELTER_DISCLAIMER}</Text>
        </View>
      )}

      {/* ── Emergency contacts ──────────────────────────────────────────── */}
      <Text style={[s.secLabel, { color: theme.textLight }]}>{t.emergencyContacts}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {contacts.map((c, i) => (
          <View
            key={i}
            style={[
              s.contactRow,
              i < contacts.length - 1 && [s.catBorder, { borderBottomColor: theme.borderLight }],
            ]}
          >
            <View style={{ flex:1 }}>
              <Text style={[s.contactName, { color: theme.text }]}>{c.name}</Text>
              <Text style={[s.contactDetail, { color: theme.textLight }]}>{c.detail}</Text>
            </View>
            <TouchableOpacity
              style={[s.callBtn, { backgroundColor: ACCENT }]}
              onPress={() => call(c.detail)}
              accessibilityLabel={`Call ${c.name}`}
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
