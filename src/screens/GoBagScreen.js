import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { s } from '../styles';
import { useTheme, ACCENT } from '../theme';
import { useLang, useLangCode } from '../i18n';
import { GOBAG } from '../data/gobag';

export default function GoBagScreen({ checkedIds, setCheckedIds }) {
  const theme = useTheme();
  const t = useLang();
  const lang = useLangCode();

  const toggle = (id) => setCheckedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const pct = Math.round((checkedIds.size / GOBAG.length) * 100);
  const sections = [...new Set(GOBAG.map((i) => i.sec[lang]))];

  const confirmReset = () => Alert.alert(
    t.resetConfirmTitle,
    t.resetConfirmMsg,
    [
      { text: t.cancel, style: 'cancel' },
      { text: t.reset, style: 'destructive', onPress: () => setCheckedIds(new Set()) },
    ],
  );

  return (
    <ScrollView style={{ flex:1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <View style={[s.progressCard, { backgroundColor: theme.darkCard }]}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
          <Text style={{ fontSize:14, fontWeight:'600', color:'rgba(255,255,255,0.6)' }}>{t.gobagReadiness}</Text>
          <Text style={{ fontSize:22, fontWeight:'700', color:'#fff' }}>{pct}%</Text>
        </View>
        <View style={s.progressTrack}><View style={[s.progressFill, { width:`${pct}%` }]} /></View>
        <Text style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:8 }}>
          {checkedIds.size} {t.of} {GOBAG.length} {t.itemsPacked}
        </Text>
      </View>

      <Text style={[s.intro, { color: theme.textMid }]}>{t.gobagIntro}</Text>

      {sections.map((sec) => {
        const items = GOBAG.filter((i) => i.sec[lang] === sec);
        const done = items.filter((i) => checkedIds.has(i.id)).length;
        return (
          <View key={sec} style={[s.checkSec, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[s.checkSecHead, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
              <Text style={[s.checkSecTitle, { color: theme.text }]}>{sec}</Text>
              <Text style={s.checkSecProg}>
                <Text style={{ color: ACCENT, fontWeight:'700' }}>{done}</Text>/{items.length}
              </Text>
            </View>
            {items.map((item, idx) => {
              const checked = checkedIds.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.checkItem, idx < items.length - 1 && [s.checkItemBorder, { borderBottomColor: theme.borderLight }], checked && { opacity:0.45 }]}
                  onPress={() => toggle(item.id)}
                >
                  <View style={[s.checkbox, { borderColor: theme.border }, checked && s.checkboxDone]}>
                    {checked && <Text style={{ color:'#fff', fontSize:13, fontWeight:'700' }}>✓</Text>}
                  </View>
                  <Text style={[s.checkTxt, { color: theme.text }, checked && { textDecorationLine:'line-through', color: theme.textLight }]}>
                    {item.text[lang]}
                  </Text>
                  <View style={[s.tag, { backgroundColor: item.tb }]}>
                    <Text style={[s.tagTxt, { color: item.tc }]}>{item.tag[lang]}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      <TouchableOpacity style={[s.resetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={confirmReset}>
        <Text style={[s.resetBtnTxt, { color: theme.textMid }]}>{t.resetAll}</Text>
      </TouchableOpacity>
      <View style={{ height:20 }} />
    </ScrollView>
  );
}
